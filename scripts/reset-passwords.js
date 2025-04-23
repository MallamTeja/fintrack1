const mongoose = require('mongoose');
require('../config/db'); // Path to your database connection

async function resetAllPasswords() {
  try {
    // Import the User model
    const User = mongoose.model('User');
    
    console.log('Finding all users...');
    const users = await User.find({});
    console.log(`Found ${users.length} users`);
    
    for (const user of users) {
      // Set new password - could be email address, a default password, or something else
      const newPassword = user.email; // Using email as the new password
      
      console.log(`Resetting password for user: ${user.email}`);
      user.password = newPassword;
      await user.save();
    }
    
    console.log('All passwords have been reset');
    
  } catch (error) {
    console.error('Error resetting passwords:', error);
  } finally {
    mongoose.disconnect();
    console.log('Database connection closed');
  }
}

resetAllPasswords()
  .then(() => console.log('Password reset complete!'))
  .catch(err => console.error('Script error:', err));