const db = require('../config/db');
const { sendNotification } = require('../utils/notificationHelper');

exports.getGoodsReceipts = async (req, res) => {
  try {
    const { warehouse_id, supplier_id, search, price_status } = req.query;

    let query = `
      SELECT 
        gr.id, gr.gr_number, gr.receipt_date, gr.notes, gr.attachment_url, gr.created_at,
        gr.warehouse_id, w.warehouse_code, w.warehouse_name,
        gr.supplier_id, s.supplier_name,
        gr.po_id, po.po_number,
        COALESCE(gr.total_amount, 0) as total_amount,
        COALESCE(gr.is_price_verified, false) as is_price_verified,
        gr.price_verified_at,
        u_ver.name as price_verified_by_name,
        u.name as created_by_name,
        (
          SELECT json_agg(json_build_object(
            'id', gri.id,
            'item_id', gri.item_id,
            'item_name', i.item_name,
            'sku', i.sku,
            'quantity', gri.quantity,
            'unit_name', gri.unit_name,
            'unit_price', COALESCE(gri.unit_price, 0),
            'total_price', COALESCE(gri.total_price, 0),
            'master_unit_price', COALESCE(i.unit_price, 0)
          ) ORDER BY gri.id ASC)
          FROM goods_receipt_items gri
          JOIN items i ON gri.item_id = i.id
          WHERE gri.goods_receipt_id = gr.id
        ) as items
      FROM goods_receipts gr
      JOIN warehouses w ON gr.warehouse_id = w.id
      LEFT JOIN suppliers s ON gr.supplier_id = s.id
      LEFT JOIN purchase_orders po ON gr.po_id = po.id
      JOIN users u ON gr.created_by = u.id
      LEFT JOIN users u_ver ON gr.price_verified_by = u_ver.id
    `;

    const whereClauses = [];
    const params = [];

    if (warehouse_id) {
      params.push(warehouse_id);
      whereClauses.push(`gr.warehouse_id = $${params.length}`);
    }

    if (supplier_id) {
      params.push(supplier_id);
      whereClauses.push(`gr.supplier_id = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      whereClauses.push(`(gr.gr_number ILIKE $${params.length} OR po.po_number ILIKE $${params.length} OR s.supplier_name ILIKE $${params.length})`);
    }

    if (price_status === 'UNPRICED') {
      whereClauses.push(`(gr.is_price_verified = FALSE OR gr.total_amount = 0 OR EXISTS (SELECT 1 FROM goods_receipt_items gri WHERE gri.goods_receipt_id = gr.id AND (gri.unit_price IS NULL OR gri.unit_price <= 0)))`);
    } else if (price_status === 'PRICED') {
      whereClauses.push(`(gr.is_price_verified = TRUE AND gr.total_amount > 0)`);
    }

    if (whereClauses.length > 0) {
      query += ` WHERE ` + whereClauses.join(' AND ');
    }

    query += ` ORDER BY gr.id DESC`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error getGoodsReceipts:', err);
    res.status(500).json({ message: 'Gagal mengambil data penerimaan barang.' });
  }
};

exports.getGoodsReceiptById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        gr.id, gr.gr_number, gr.receipt_date, gr.notes, gr.attachment_url, gr.created_at,
        gr.warehouse_id, w.warehouse_code, w.warehouse_name,
        gr.supplier_id, s.supplier_name, s.contact as supplier_contact,
        gr.po_id, po.po_number,
        COALESCE(gr.total_amount, 0) as total_amount,
        COALESCE(gr.is_price_verified, false) as is_price_verified,
        gr.price_verified_at,
        u_ver.name as price_verified_by_name,
        u.name as created_by_name
      FROM goods_receipts gr
      JOIN warehouses w ON gr.warehouse_id = w.id
      LEFT JOIN suppliers s ON gr.supplier_id = s.id
      LEFT JOIN purchase_orders po ON gr.po_id = po.id
      JOIN users u ON gr.created_by = u.id
      LEFT JOIN users u_ver ON gr.price_verified_by = u_ver.id
      WHERE gr.id = $1
    `;
    const grRes = await db.query(query, [id]);
    if (grRes.rows.length === 0) {
      return res.status(404).json({ message: 'Transaksi Penerimaan Barang tidak ditemukan.' });
    }

    const itemsQuery = `
      SELECT gri.id, gri.item_id, i.sku, i.item_name, gri.quantity, gri.unit_name,
             COALESCE(gri.unit_price, 0) as unit_price,
             COALESCE(gri.total_price, 0) as total_price,
             COALESCE(i.unit_price, 0) as master_unit_price
      FROM goods_receipt_items gri
      JOIN items i ON gri.item_id = i.id
      WHERE gri.goods_receipt_id = $1
      ORDER BY gri.id ASC
    `;
    const itemsRes = await db.query(itemsQuery, [id]);

    res.json({
      ...grRes.rows[0],
      items: itemsRes.rows
    });
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil detail penerimaan barang.' });
  }
};

exports.createGoodsReceipt = async (req, res) => {
  const client = await db.getClient();
  try {
    const { po_id, supplier_id, warehouse_id, notes, items, attachment_url, receipt_date } = req.body;

    if (!warehouse_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Gudang tujuan dan minimal 1 barang wajib diisi.' });
    }

    await client.query('BEGIN');

    // Generate Transaction Number (GR-YYYYMMDD-XXXX)
    const countRes = await client.query(`SELECT COUNT(*) FROM goods_receipts`);
    const nextId = parseInt(countRes.rows[0].count, 10) + 1;
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const gr_number = `GR-${dateStr}-${String(nextId).padStart(4, '0')}`;

    // 1. Insert goods_receipts header
    const grQuery = `
      INSERT INTO goods_receipts (gr_number, po_id, supplier_id, warehouse_id, notes, created_by, attachment_url, receipt_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, CURRENT_TIMESTAMP))
      RETURNING *
    `;
    const grRes = await client.query(grQuery, [
      gr_number,
      po_id || null,
      supplier_id || null,
      warehouse_id,
      notes || 'Penerimaan Barang Masuk',
      req.user.id,
      attachment_url || null,
      receipt_date || null
    ]);
    const gr = grRes.rows[0];

    const insertedItemsSummary = [];
    let totalReceiptAmount = 0;

    // Process each item in the goods receipt
    for (const itemObj of items) {
      const { item_id, quantity, unit_price } = itemObj;
      const qty = parseFloat(quantity);
      if (!item_id || isNaN(qty) || qty <= 0) {
        throw new Error('Jumlah barang (quantity) harus lebih besar dari 0.');
      }

      const parsedPrice = parseFloat(unit_price) || 0;
      const itemTotal = qty * parsedPrice;
      totalReceiptAmount += itemTotal;

      // Fetch item unit
      const itemInfo = await client.query(
        `SELECT i.item_name, i.sku, u.unit_name FROM items i JOIN units u ON i.unit_id = u.id WHERE i.id = $1`,
        [item_id]
      );
      if (itemInfo.rows.length === 0) {
        throw new Error(`Barang dengan ID ${item_id} tidak ditemukan.`);
      }
      const { item_name, sku, unit_name } = itemInfo.rows[0];

      // 2. Insert goods_receipt_items with unit_price & total_price
      await client.query(
        `INSERT INTO goods_receipt_items (goods_receipt_id, item_id, quantity, unit_name, unit_price, total_price) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [gr.id, item_id, qty, unit_name, parsedPrice, itemTotal]
      );

      // If price was supplied (>0), update master item unit_price as well
      if (parsedPrice > 0) {
        await client.query(`UPDATE items SET unit_price = $1 WHERE id = $2`, [parsedPrice, item_id]);
      }

      // 3. Update inventory current_stock (+)
      const invCheck = await client.query(
        `SELECT current_stock FROM inventory WHERE item_id = $1 AND warehouse_id = $2 FOR UPDATE`,
        [item_id, warehouse_id]
      );

      let stockBefore = 0;
      if (invCheck.rows.length > 0) {
        stockBefore = parseFloat(invCheck.rows[0].current_stock);
        await client.query(
          `UPDATE inventory SET current_stock = current_stock + $1, updated_at = CURRENT_TIMESTAMP WHERE item_id = $2 AND warehouse_id = $3`,
          [qty, item_id, warehouse_id]
        );
      } else {
        await client.query(
          `INSERT INTO inventory (item_id, warehouse_id, current_stock) VALUES ($1, $2, $3)`,
          [item_id, warehouse_id, qty]
        );
      }

      const stockAfter = stockBefore + qty;

      // 4. Insert inventory_movements
      await client.query(
        `INSERT INTO inventory_movements (item_id, warehouse_id, transaction_type, reference_id, quantity, stock_before, stock_after, created_by, notes)
         VALUES ($1, $2, 'IN', $3, $4, $5, $6, $7, $8)`,
        [item_id, warehouse_id, gr_number, qty, stockBefore, stockAfter, req.user.id, `Penerimaan Barang ${gr_number}`]
      );

      insertedItemsSummary.push(`${item_name} (+${qty} ${unit_name})`);
    }

    // Update goods_receipts header total_amount & is_price_verified
    const hasPrice = totalReceiptAmount > 0;
    await client.query(
      `UPDATE goods_receipts 
       SET total_amount = $1, 
           is_price_verified = $2, 
           price_verified_by = $3, 
           price_verified_at = $4 
       WHERE id = $5`,
      [
        totalReceiptAmount,
        hasPrice,
        hasPrice ? req.user.id : null,
        hasPrice ? new Date() : null,
        gr.id
      ]
    );

    // If PO linked, update PO status to 'Diterima' and linked PR to 'Dipenuhi'
    if (po_id) {
      const poUpdate = await client.query(
        `UPDATE purchase_orders SET status = 'Diterima' WHERE id = $1 RETURNING purchase_request_id`,
        [po_id]
      );
      if (poUpdate.rows.length > 0 && poUpdate.rows[0].purchase_request_id) {
        const prId = poUpdate.rows[0].purchase_request_id;
        await client.query(`UPDATE purchase_requests SET status = 'Dipenuhi' WHERE id = $1`, [prId]);
        await client.query(`UPDATE purchase_request_items SET status = 'Dipenuhi' WHERE purchase_request_id = $1`, [prId]);
      }
    }

    // 5. Insert activity_logs
    await client.query(
      `INSERT INTO activity_logs (user_id, activity_type, description, reference_id) VALUES ($1, $2, $3, $4)`,
      [
        req.user.id,
        'GOODS_RECEIPT',
        `${req.user.name} mencatat Penerimaan Barang Masuk ${gr_number}: ${insertedItemsSummary.join(', ')}`,
        gr_number
      ]
    );

    // Kirim notifikasi ke Admin & Master
    const priceNotice = hasPrice ? ' (Harga telah terisi)' : ' ⚠️ MENUNGGU INPUT HARGA OLEH ACCOUNTING';
    await sendNotification({
      targetRole: 'Admin',
      title: hasPrice ? 'Penerimaan Barang Masuk' : '⚠️ Perlu Input Harga Barang Masuk',
      message: `${req.user.name || 'Petugas Gudang'} mencatat Barang Masuk ${gr_number}.${priceNotice}`,
      type: 'RECEIPT',
      link: '/barang-masuk'
    });
    await sendNotification({
      targetRole: 'Master',
      title: 'Barang Masuk Dicatat',
      message: `Penerimaan Barang ${gr_number} telah diproses di gudang.${priceNotice}`,
      type: 'RECEIPT',
      link: '/dashboard'
    });

    await client.query('COMMIT');
    res.status(201).json({
      message: 'Barang Masuk berhasil disimpan dan stok otomatis diperbarui.',
      goods_receipt: gr
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error createGoodsReceipt:', err);
    res.status(400).json({ message: err.message || 'Gagal menyimpan Penerimaan Barang.' });
  } finally {
    client.release();
  }
};

// Admin Accounting: Tambah / Perbarui Harga Satuan Barang Masuk
exports.updateReceiptPrices = async (req, res) => {
  const client = await db.getClient();
  try {
    const { id } = req.params;
    const { items, update_master_price } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Daftar rincian harga barang wajib diisi.' });
    }

    await client.query('BEGIN');

    // Cek keberadaan transaksi
    const grRes = await client.query(`SELECT id, gr_number FROM goods_receipts WHERE id = $1`, [id]);
    if (grRes.rows.length === 0) {
      throw new Error('Transaksi penerimaan barang tidak ditemukan.');
    }
    const grNumber = grRes.rows[0].gr_number;

    const updatedSummary = [];

    for (const it of items) {
      const price = parseFloat(it.unit_price);
      if (isNaN(price) || price < 0) {
        throw new Error('Harga satuan harus berupa nominal angka valid (>= 0).');
      }

      let griQuery = `
        SELECT gri.id, gri.item_id, gri.quantity, i.item_name 
        FROM goods_receipt_items gri 
        JOIN items i ON gri.item_id = i.id 
        WHERE gri.goods_receipt_id = $1
      `;
      let griParams = [id];

      if (it.id) {
        griQuery += ` AND gri.id = $2`;
        griParams.push(it.id);
      } else if (it.item_id) {
        griQuery += ` AND gri.item_id = $2`;
        griParams.push(it.item_id);
      }

      const griRes = await client.query(griQuery, griParams);
      if (griRes.rows.length === 0) continue;

      const gri = griRes.rows[0];
      const qty = parseFloat(gri.quantity);
      const itemTotal = qty * price;

      await client.query(
        `UPDATE goods_receipt_items SET unit_price = $1, total_price = $2 WHERE id = $3`,
        [price, itemTotal, gri.id]
      );

      // Sinkronkan harga satuan ke master items jika dipilih (default true jika price > 0)
      if (update_master_price !== false && price > 0) {
        await client.query(`UPDATE items SET unit_price = $1 WHERE id = $2`, [price, gri.item_id]);
      }

      updatedSummary.push(`${gri.item_name}: Rp ${price.toLocaleString('id-ID')}`);
    }

    // Hitung total nilai penerimaan dan tandai diverifikasi oleh Accounting
    const totalCalc = await client.query(
      `SELECT COALESCE(SUM(total_price), 0) as total FROM goods_receipt_items WHERE goods_receipt_id = $1`,
      [id]
    );
    const totalAmount = parseFloat(totalCalc.rows[0].total) || 0;

    await client.query(
      `UPDATE goods_receipts 
       SET total_amount = $1,
           is_price_verified = TRUE,
           price_verified_by = $2,
           price_verified_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [totalAmount, req.user.id, id]
    );

    // Catat log aktivitas
    await client.query(
      `INSERT INTO activity_logs (user_id, activity_type, description, reference_id)
       VALUES ($1, 'PRICE_VERIFICATION', $2, $3)`,
      [
        req.user.id,
        `${req.user.name} (Accounting) mengisi & memverifikasi harga ${grNumber} (Total: Rp ${totalAmount.toLocaleString('id-ID')}): ${updatedSummary.join(', ')}`,
        grNumber
      ]
    );

    // Kirim notifikasi konfirmasi
    await sendNotification({
      targetRole: 'Petugas Gudang',
      title: 'Harga Barang Masuk Telah Diisi',
      message: `Admin Accounting (${req.user.name}) telah menginput harga untuk ${grNumber} (Total: Rp ${totalAmount.toLocaleString('id-ID')}).`,
      type: 'RECEIPT',
      link: '/barang-masuk'
    });

    await client.query('COMMIT');
    res.json({
      message: 'Harga satuan berhasil disimpan dan diverifikasi oleh Accounting!',
      gr_number: grNumber,
      total_amount: totalAmount
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updateReceiptPrices:', err);
    res.status(400).json({ message: err.message || 'Gagal menyimpan harga barang masuk.' });
  } finally {
    client.release();
  }
};

exports.updateItemPrice = async (req, res) => {
  const { id, itemId } = req.params;
  const { unit_price, update_master_price } = req.body;
  req.body = {
    items: [{ id: itemId, unit_price }],
    update_master_price
  };
  return exports.updateReceiptPrices(req, res);
};
