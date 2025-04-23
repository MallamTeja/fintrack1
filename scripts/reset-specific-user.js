const mongoose = require('mongoose');
require('../config/db'); // Path to your database connection

async function resetSpecificUser() {
  try {
    // Import the User model
    const User = mongoose.model('User');
    
    // The email address of the user to update
    const userEmail = 'tejamallam1233@gmail.com';
    
    // Find the user
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      console.log(`User with email ${userEmail} not found`);
      return;
    }
    
    // Set the password to match the email (or whatever you want)
    user.password = userEmail;
    await user.save();
    
    console.log(`Password for ${userEmail} has been reset to match the email address`);
    
  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    mongoose.disconnect();
    console.log('Database connection closed');
  }
}

resetSpecificUser()
  .then(() => console.log('Password reset complete!'))
  .catch(err => console.error('Script error:', err));