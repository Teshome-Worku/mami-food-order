const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

module.exports = async function ensureAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log('ADMIN_EMAIL or ADMIN_PASSWORD not set; skipping admin creation');
    return;
  }

  try {
    const existing = await Admin.findOne({ email });
    const hashed = await bcrypt.hash(password, 10);

    if (existing) {
      // update password if different
      const match = await bcrypt.compare(password, existing.password);
      if (!match) {
        existing.password = hashed;
        await existing.save();
        console.log('Admin password updated from environment variables');
      } else {
        console.log('Admin already exists');
      }
    } else {
      await Admin.create({ email, password: hashed });
      console.log('Admin account created from environment variables');
    }
  } catch (error) {
    console.error('Error ensuring admin account:', error);
  }
};
