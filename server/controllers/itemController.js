const db = require('../config/db');

exports.getItems = async (req, res) => {
  try {
    const { category, warehouse_id, search } = req.query;

    let query = `
      SELECT 
        i.id, i.sku, i.item_name, i.category_id, c.category_name,
        i.unit_id, u.unit_name, i.minimum_stock, i.critical_stock,
        i.unit_price, i.status, i.expiry_date, i.created_at,
        COALESCE(SUM(inv.current_stock), 0) as total_stock
      FROM items i
      JOIN categories c ON i.category_id = c.id
      JOIN units u ON i.unit_id = u.id
      LEFT JOIN inventory inv ON i.id = inv.item_id
    `;

    const whereClauses = [];
    const params = [];

    if (category) {
      params.push(category);
      whereClauses.push(`c.category_name = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      whereClauses.push(`(i.item_name ILIKE $${params.length} OR i.sku ILIKE $${params.length})`);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ` + whereClauses.join(' AND ');
    }

    query += ` GROUP BY i.id, c.category_name, u.unit_name ORDER BY i.id ASC`;

    const result = await db.query(query, params);

    // If warehouse_id filter specified, fetch stock for specific warehouse
    if (warehouse_id) {
      const whStockQuery = `
        SELECT item_id, current_stock FROM inventory WHERE warehouse_id = $1
      `;
      const whStockRes = await db.query(whStockQuery, [warehouse_id]);
      const whStockMap = {};
      whStockRes.rows.forEach(row => {
        whStockMap[row.item_id] = parseFloat(row.current_stock);
      });

      const itemsWithWhStock = result.rows.map(item => ({
        ...item,
        warehouse_stock: whStockMap[item.id] !== undefined ? whStockMap[item.id] : 0
      }));
      return res.json(itemsWithWhStock);
    }

    res.json(result.rows);
  } catch (err) {
    console.error('Error getItems:', err);
    res.status(500).json({ message: 'Gagal mengambil data barang.' });
  }
};

exports.getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const itemQuery = `
      SELECT i.*, c.category_name, u.unit_name
      FROM items i
      JOIN categories c ON i.category_id = c.id
      JOIN units u ON i.unit_id = u.id
      WHERE i.id = $1
    `;
    const itemRes = await db.query(itemQuery, [id]);
    if (itemRes.rows.length === 0) {
      return res.status(404).json({ message: 'Barang tidak ditemukan.' });
    }

    const inventoryQuery = `
      SELECT inv.id, inv.warehouse_id, w.warehouse_code, w.warehouse_name, inv.current_stock
      FROM inventory inv
      JOIN warehouses w ON inv.warehouse_id = w.id
      WHERE inv.item_id = $1
      ORDER BY w.id ASC
    `;
    const invRes = await db.query(inventoryQuery, [id]);

    res.json({
      ...itemRes.rows[0],
      stocks: invRes.rows
    });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil detail barang.' });
  }
};

exports.createItem = async (req, res) => {
  const client = await db.getClient();
  try {
    let { sku, item_name, category_id, unit_id, minimum_stock, critical_stock, unit_price, expiry_date } = req.body;

    if (!item_name || !category_id || !unit_id) {
      return res.status(400).json({ message: 'Nama barang, kategori, dan satuan wajib diisi.' });
    }

    if (!sku) {
      sku = 'ITM-' + Date.now() + '-' + Math.floor(100 + Math.random() * 900);
    }

    await client.query('BEGIN');

    const insertItemQuery = `
      INSERT INTO items (sku, item_name, category_id, unit_id, minimum_stock, critical_stock, unit_price, expiry_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const itemRes = await client.query(insertItemQuery, [
      sku.toUpperCase(),
      item_name,
      category_id,
      unit_id,
      minimum_stock || 10,
      critical_stock || 5,
      unit_price || 0,
      expiry_date || null
    ]);

    const newItem = itemRes.rows[0];

    // Auto-create inventory records for all active warehouses
    const warehousesRes = await client.query(`SELECT id FROM warehouses WHERE status = 'Active'`);
    for (const wh of warehousesRes.rows) {
      await client.query(
        `INSERT INTO inventory (item_id, warehouse_id, current_stock) VALUES ($1, $2, 0) ON CONFLICT DO NOTHING`,
        [newItem.id, wh.id]
      );
    }

    // If initial stock was provided for a specific warehouse, update it
    const initStock = parseFloat(req.body.initial_stock || 0);
    const targetWhId = req.body.warehouse_id ? parseInt(req.body.warehouse_id) : null;
    if (initStock > 0 && targetWhId) {
      await client.query(
        `UPDATE inventory SET current_stock = $1 WHERE item_id = $2 AND warehouse_id = $3`,
        [initStock, newItem.id, targetWhId]
      );
      await client.query(
        `INSERT INTO inventory_movements (item_id, warehouse_id, transaction_type, reference_id, quantity, stock_before, stock_after, notes, created_by)
         VALUES ($1, $2, 'INITIAL_STOCK', $3, $4, 0, $4, 'Stok Awal Penambahan Barang Baru', $5)`,
        [newItem.id, targetWhId, newItem.sku || ('INIT-' + newItem.id), initStock, req.user.id]
      );
    }

    // Log Activity
    await client.query(
      `INSERT INTO activity_logs (user_id, activity_type, description, reference_id) VALUES ($1, $2, $3, $4)`,
      [req.user.id, 'CREATE_ITEM', `Menambahkan barang baru: ${newItem.item_name} (${newItem.sku})`, newItem.sku]
    );

    await client.query('COMMIT');
    res.status(201).json({ message: 'Barang berhasil ditambahkan', item: newItem });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') {
      return res.status(400).json({ message: 'SKU barang sudah digunakan.' });
    }
    console.error('Error createItem:', err);
    res.status(500).json({ message: 'Gagal menambahkan barang.' });
  } finally {
    client.release();
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { sku, item_name, category_id, unit_id, minimum_stock, critical_stock, unit_price, status, expiry_date } = req.body;

    const updateQuery = `
      UPDATE items
      SET sku = COALESCE($1, sku),
          item_name = COALESCE($2, item_name),
          category_id = COALESCE($3, category_id),
          unit_id = COALESCE($4, unit_id),
          minimum_stock = COALESCE($5, minimum_stock),
          critical_stock = COALESCE($6, critical_stock),
          unit_price = COALESCE($7, unit_price),
          status = COALESCE($8, status),
          expiry_date = COALESCE($9, expiry_date)
      WHERE id = $10
      RETURNING *
    `;
    const result = await db.query(updateQuery, [
      sku ? sku.toUpperCase() : null,
      item_name,
      category_id,
      unit_id,
      minimum_stock,
      critical_stock,
      unit_price,
      status,
      expiry_date !== undefined ? expiry_date : null,
      id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Barang tidak ditemukan.' });
    }

    res.json({ message: 'Data barang berhasil diperbarui', item: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Gagal memperbarui data barang.' });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deleteQuery = `DELETE FROM items WHERE id = $1 RETURNING *`;
    const result = await db.query(deleteQuery, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Barang tidak ditemukan.' });
    }
    res.json({ message: 'Barang berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menghapus barang (terdapat transaksi terkait).' });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM categories ORDER BY id ASC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil kategori.' });
  }
};

exports.getUnits = async (req, res) => {
  try {
    const result = await db.query(`SELECT * FROM units ORDER BY id ASC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil satuan.' });
  }
};

exports.importExcelItems = async (req, res) => {
  const client = await db.getClient();
  try {
    const { items: rawItems } = req.body;
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return res.status(400).json({ message: 'Data barang dari file Excel kosong atau tidak valid.' });
    }

    await client.query('BEGIN');

    // Load existing categories, units, and active warehouses
    const catRes = await client.query(`SELECT id, category_name FROM categories`);
    const unitRes = await client.query(`SELECT id, unit_name FROM units`);
    const whRes = await client.query(`SELECT id, warehouse_code, warehouse_name FROM warehouses WHERE status = 'Active'`);

    const categoryMap = new Map();
    catRes.rows.forEach(c => categoryMap.set(c.category_name.toLowerCase().trim(), c.id));

    const unitMap = new Map();
    unitRes.rows.forEach(u => unitMap.set(u.unit_name.toLowerCase().trim(), u.id));

    const defaultCategoryId = catRes.rows[0]?.id || 1;
    const defaultUnitId = unitRes.rows[0]?.id || 1;
    const defaultWarehouseId = whRes.rows[0]?.id || 1;

    let newItemsCount = 0;
    let updatedItemsCount = 0;

    for (const row of rawItems) {
      const rawName = row.item_name || row['Nama Barang'] || row['nama_barang'] || row['NAMA BARANG'];
      if (!rawName || typeof rawName !== 'string' || !rawName.trim()) continue;

      const itemName = rawName.trim();

      // Resolve category
      let categoryId = defaultCategoryId;
      const catName = (row.category_name || row['Kategori'] || row['KATEGORI'] || '').trim();
      if (catName) {
        const catKey = catName.toLowerCase();
        if (categoryMap.has(catKey)) {
          categoryId = categoryMap.get(catKey);
        } else {
          // Auto create category if not exists
          const newCatRes = await client.query(
            `INSERT INTO categories (category_name, description) VALUES ($1, $2) RETURNING id`,
            [catName, 'Kategori otomatis dari impor Excel']
          );
          categoryId = newCatRes.rows[0].id;
          categoryMap.set(catKey, categoryId);
        }
      }

      // Resolve unit
      let unitId = defaultUnitId;
      const unitName = (row.unit_name || row['Satuan'] || row['SATUAN'] || '').trim();
      if (unitName) {
        const unitKey = unitName.toLowerCase();
        if (unitMap.has(unitKey)) {
          unitId = unitMap.get(unitKey);
        } else {
          // Auto create unit if not exists
          const newUnitRes = await client.query(
            `INSERT INTO units (unit_name) VALUES ($1) RETURNING id`,
            [unitName.toUpperCase()]
          );
          unitId = newUnitRes.rows[0].id;
          unitMap.set(unitKey, unitId);
        }
      }

      const minStock = parseFloat(row.minimum_stock ?? row['Batas Minimal'] ?? row['BATAS MINIMAL'] ?? 10);
      const critStock = parseFloat(row.critical_stock ?? row['Batas Kritis'] ?? row['BATAS KRITIS'] ?? 5);
      const unitPrice = parseFloat(row.unit_price ?? row['Harga Satuan'] ?? row['HARGA SATUAN'] ?? 0);
      const initialStock = parseFloat(row.initial_stock ?? row.current_stock ?? row['Stok Awal'] ?? row['STOCK AWAL'] ?? row['stok_awal'] ?? 0);
      const notes = row.notes || row['Keterangan'] || row['KETERANGAN'] || '';

      // Resolve warehouse
      let warehouseId = defaultWarehouseId;
      if (row.warehouse_id) {
        warehouseId = parseInt(row.warehouse_id);
      } else if (row.warehouse_name || row.warehouse_code || row['Gudang'] || row['GUDANG']) {
        const whStr = String(row.warehouse_name || row.warehouse_code || row['Gudang'] || row['GUDANG']).toLowerCase();
        const matched = whRes.rows.find(w => 
          w.warehouse_name.toLowerCase().includes(whStr) || 
          w.warehouse_code.toLowerCase().includes(whStr)
        );
        if (matched) warehouseId = matched.id;
      }

      // Check if item exists in database
      const existingRes = await client.query(
        `SELECT id, sku, minimum_stock, critical_stock FROM items WHERE LOWER(TRIM(item_name)) = LOWER($1)`,
        [itemName]
      );

      let itemId;
      let sku;

      if (existingRes.rows.length === 0) {
        sku = 'ITM-' + Date.now() + '-' + Math.floor(100 + Math.random() * 900);
        const insertItemRes = await client.query(
          `INSERT INTO items (sku, item_name, category_id, unit_id, minimum_stock, critical_stock, unit_price)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, sku`,
          [sku, itemName, categoryId, unitId, minStock, critStock, unitPrice]
        );
        itemId = insertItemRes.rows[0].id;
        sku = insertItemRes.rows[0].sku;
        newItemsCount++;

        // Create inventory rows for all active warehouses
        for (const wh of whRes.rows) {
          await client.query(
            `INSERT INTO inventory (item_id, warehouse_id, current_stock) VALUES ($1, $2, 0) ON CONFLICT DO NOTHING`,
            [itemId, wh.id]
          );
        }
      } else {
        itemId = existingRes.rows[0].id;
        sku = existingRes.rows[0].sku;
        updatedItemsCount++;

        // Update threshold or price if provided
        await client.query(
          `UPDATE items 
           SET minimum_stock = COALESCE(NULLIF($1, 0), minimum_stock),
               critical_stock = COALESCE(NULLIF($2, 0), critical_stock),
               unit_price = COALESCE(NULLIF($3, 0), unit_price)
           WHERE id = $4`,
          [minStock, critStock, unitPrice, itemId]
        );

        // Ensure inventory rows exist for all active warehouses
        for (const wh of whRes.rows) {
          await client.query(
            `INSERT INTO inventory (item_id, warehouse_id, current_stock) VALUES ($1, $2, 0) ON CONFLICT DO NOTHING`,
            [itemId, wh.id]
          );
        }
      }

      // Update physical inventory stock if initialStock was provided
      if (!isNaN(initialStock) && initialStock >= 0) {
        const prevStockRes = await client.query(
          `SELECT current_stock FROM inventory WHERE item_id = $1 AND warehouse_id = $2`,
          [itemId, warehouseId]
        );
        const stockBefore = prevStockRes.rows.length > 0 ? parseFloat(prevStockRes.rows[0].current_stock || 0) : 0;

        await client.query(
          `UPDATE inventory SET current_stock = $1, updated_at = NOW() WHERE item_id = $2 AND warehouse_id = $3`,
          [initialStock, itemId, warehouseId]
        );

        await client.query(
          `INSERT INTO inventory_movements (item_id, warehouse_id, transaction_type, reference_id, quantity, stock_before, stock_after, notes, created_by)
           VALUES ($1, $2, 'IMPORT_EXCEL', $3, $4, $5, $6, $7, $8)`,
          [
            itemId,
            warehouseId,
            sku || ('IMP-' + itemId),
            initialStock,
            stockBefore,
            initialStock,
            notes ? `Impor Database Excel: ${notes}` : 'Impor Database Stok dari Excel',
            req.user.id
          ]
        );
      }
    }

    // Log activity
    await client.query(
      `INSERT INTO activity_logs (user_id, activity_type, description, reference_id) VALUES ($1, $2, $3, $4)`,
      [
        req.user.id,
        'IMPORT_EXCEL',
        `Impor database Excel: ${newItemsCount} barang baru, ${updatedItemsCount} persediaan diperbarui`,
        'EXCEL-' + Date.now()
      ]
    );

    await client.query('COMMIT');

    res.json({
      message: `Berhasil mengimpor data ke database web! (${newItemsCount} barang baru, ${updatedItemsCount} barang diperbarui)`,
      totalProcessed: newItemsCount + updatedItemsCount,
      newItemsCount,
      updatedItemsCount
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error importExcelItems:', err);
    res.status(500).json({ message: 'Gagal mengimpor data Excel ke database: ' + err.message });
  } finally {
    client.release();
  }
};
