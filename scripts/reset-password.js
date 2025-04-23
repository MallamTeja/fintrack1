const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('../config/db'); // Adjust path to your db connection file

// Function to update a user's password
async function resetPassword(email, newPassword) {
  try {
    // Import the User model
    const User = require('../models/User');
    
    // Find the user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log(`User with email ${email} not found`);
      return false;
    }
    
    // Generate salt and hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update the user's password
    user.password = hashedPassword;
    await user.save();
    
    console.log(`Password reset successful for user: ${email}`);
    return true;
  } catch (error) {
    console.error('Error resetting password:', error);
    return false;
  } finally {
    // Close database connection
    mongoose.disconnect();
  }
}

// Example usage
const email = 'tejamallam1233@gmail.com';
const newPassword = 'your-new-password'; // Set this to your desired password

resetPassword(email, newPassword)
  .then(() => console.log('Password reset script completed'))
  .catch(err => console.error('Script error:', err));