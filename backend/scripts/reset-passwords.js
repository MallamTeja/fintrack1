const mongoose = require('mongoose');
require('../config/db'); // Adjust path as needed for your DB connection
const User = require('../models/User');

async function resetPasswords() {
  try {
    console.log('Finding all users...');
    const users = await User.find({});
    console.log(`Found ${users.length} users`);
    
    let updated = 0;
    
    for (const user of users) {
      console.log(`Resetting password for user: ${user.email}`);
      
      // Set the password to the email address or another value you prefer
      user.password = user.email;
      await user.save();
      updated++;
    }
    
    console.log(`Successfully updated ${updated} users with plain text passwords`);
  } catch (error) {
    console.error('Error resetting passwords:', error);
  } finally {
    mongoose.disconnect();
    console.log('Database connection closed');
  }
}

resetPasswords()
  .then(() => console.log('Password reset complete!'))
  .catch(err => console.error('Script error:', err));