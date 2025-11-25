const express = require('express');
const router = express.Router();
const {
  requestPasswordReset,
  verifyResetToken,
  resetPassword
} = require('../controllers/passwordResetController');

// @route   POST /api/password-reset/request
// @desc    Request password reset email
// @access  Public
router.post('/request', requestPasswordReset);

// @route   GET /api/password-reset/verify/:token
// @desc    Verify reset token
// @access  Public
router.get('/verify/:token', verifyResetToken);

// @route   POST /api/password-reset/reset/:token
// @desc    Reset password with token
// @access  Public
router.post('/reset/:token', resetPassword);

module.exports = router;
