const db = require('./config/db');

async function check() {
  try {
    const [config] = await db.query('SELECT * FROM parking_config');
    console.log('parking_config:', config);
    const [rates] = await db.query('SELECT * FROM parking_rates');
    console.log('parking_rates:', rates);
    const [users] = await db.query('SELECT id, username, fullname, role, status FROM users');
    console.log('users:', users);
    const [devices] = await db.query('SELECT * FROM devices');
    console.log('devices:', devices);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
