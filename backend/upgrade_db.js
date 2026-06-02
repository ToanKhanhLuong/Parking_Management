const db = require('./config/db');

async function upgrade() {
  try {
    console.log("⚙️ Đang nâng cấp cấu trúc database...");
    
    // Thêm các cột vào parking_config
    const queries = [
      "ALTER TABLE parking_config ADD COLUMN screen_in_image VARCHAR(255) NULL;",
      "ALTER TABLE parking_config ADD COLUMN screen_in_video VARCHAR(255) NULL;",
      "ALTER TABLE parking_config ADD COLUMN screen_out_image VARCHAR(255) NULL;",
      "ALTER TABLE parking_config ADD COLUMN screen_out_video VARCHAR(255) NULL;",
      "ALTER TABLE parking_config ADD COLUMN qr_active TINYINT DEFAULT 1;",
      "ALTER TABLE parking_config ADD COLUMN maintenance_active TINYINT DEFAULT 0;"
    ];

    for (const q of queries) {
      try {
        await db.query(q);
        console.log(`Executed: ${q}`);
      } catch (err) {
        // 1060: ER_DUP_FIELDNAME
        if (err.errno === 1060 || err.code === 'ER_DUP_FIELDNAME') {
          console.log(`Cột đã tồn tại, bỏ qua.`);
        } else {
          console.warn(`Lỗi khi chạy query: ${err.message}`);
          throw err;
        }
      }
    }

    // Điền dữ liệu giả lập ban đầu cho các cột mới nếu đang trống
    await db.query(`
      UPDATE parking_config 
      SET 
        screen_in_image = COALESCE(screen_in_image, 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=400&q=80'),
        screen_in_video = COALESCE(screen_in_video, 'https://assets.mixkit.co/videos/preview/mixkit-traffic-in-a-city-street-4048-large.mp4'),
        screen_out_image = COALESCE(screen_out_image, 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'),
        screen_out_video = COALESCE(screen_out_video, 'https://assets.mixkit.co/videos/preview/mixkit-highway-traffic-at-night-4226-large.mp4'),
        qr_active = COALESCE(qr_active, 1),
        maintenance_active = COALESCE(maintenance_active, 0)
      WHERE id = 1
    `);

    console.log("✅ Nâng cấp database thành công!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Lỗi nâng cấp database:", err);
    process.exit(1);
  }
}

upgrade();
