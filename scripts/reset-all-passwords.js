const mongoose = require('mongoose');
require('../config/db'); // Adjust path to your db connection file

async function resetAllPasswords() {
  try {
    // Import the User model
    const User = mongoose.model('User');
    
    console.log('Finding all users...');
    const users = await User.find({});
    console.log(`Found ${users.length} users`);
    
    // For each user that might have a hashed password, set it to a known value
    const updates = users.map(async (user) => {
      // Replace with whatever default/temporary password you want to set
      // Or you could set the password to match their email for simplicity
      const newPassword = user.email;
      
      console.log(`Resetting password for user: ${user.email}`);
      user.password = newPassword;
      return user.save();
    });
    
    await Promise.all(updates);
    console.log('All passwords have been reset to match user emails');
    
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