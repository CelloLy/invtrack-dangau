const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../client/src/pages/MasterDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  `                  {filteredIssues.length === 0 && (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '16px', color: '#94a3b8' }}>Belum ada data barang keluar.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          )}
        </div>`,
  `                  {filteredIssues.length === 0 && (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '16px', color: '#94a3b8' }}>Belum ada data barang keluar.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>`
);

content = content.replace(
  `                  {filteredInventoryList.length === 0 && (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '13px' }}>
                        Tidak ada barang persediaan yang cocok dengan kriteria filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          )}
        </div>`,
  `                  {filteredInventoryList.length === 0 && (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontSize: '13px' }}>
                        Tidak ada barang persediaan yang cocok dengan kriteria filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>`
);

content = content.replace(
  `                  {recentActivitiesList.length === 0 && (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', padding: '16px', color: '#94a3b8' }}>Belum ada riwayat aktivitas terbaru.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          )}
        </div>`,
  `                  {recentActivitiesList.length === 0 && (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', padding: '16px', color: '#94a3b8' }}>Belum ada riwayat aktivitas terbaru.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Cleaned extra )} tags successfully!');
