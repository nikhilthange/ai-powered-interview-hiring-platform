require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');

const updateUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const result = await User.updateMany(
      { isEmailVerified: { $ne: true } },
      { $set: { isEmailVerified: true } }
    );
    console.log(`Updated ${result.modifiedCount} users to be email verified.`);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

updateUsers();
