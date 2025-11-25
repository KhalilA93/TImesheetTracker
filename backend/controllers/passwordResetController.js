const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const PasswordReset = require('../models/PasswordReset');
const { sendPasswordResetEmail } = require('../services/emailService');

// Request password reset
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // Don't reveal if email exists for security
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate secure random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Delete any existing reset tokens for this user
    await PasswordReset.deleteMany({ userId: user._id });

    // Create new reset token
    const passwordReset = new PasswordReset({
      userId: user._id,
      token: resetToken
    });

    await passwordReset.save();

    // Send email
    const emailResult = await sendPasswordResetEmail(user.email, resetToken, user.name);

    if (!emailResult.success) {
      console.error('Failed to send reset email:', emailResult.error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send password reset email. Please try again later.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });

  } catch (error) {
    console.error('Error in requestPasswordReset:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request'
    });
  }
};

// Verify reset token
const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    // Find valid, unused token
    const passwordReset = await PasswordReset.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() }
    }).populate('userId');

    if (!passwordReset) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Token is valid',
      userEmail: passwordReset.userId.email
    });

  } catch (error) {
    console.error('Error in verifyResetToken:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while verifying the token'
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    // Validate input
    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password and confirmation are required'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Find valid, unused token
    const passwordReset = await PasswordReset.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() }
    }).populate('userId');

    if (!passwordReset) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await User.findByIdAndUpdate(passwordReset.userId._id, {
      password: hashedPassword,
      updatedAt: new Date()
    });

    // Mark token as used
    passwordReset.used = true;
    await passwordReset.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.'
    });

  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while resetting your password'
    });
  }
};

module.exports = {
  requestPasswordReset,
  verifyResetToken,
  resetPassword
};
