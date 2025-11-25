const nodemailer = require('nodemailer');

// Create email transporter
const createTransporter = () => {
  // For Gmail (you can modify for other email services)
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS // Use App Password for Gmail
    }
  });
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken, userName) => {
  try {
    const transporter = createTransporter();
    
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: `"TimeSheet Tracker" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request - TimeSheet Tracker',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #007bff; font-family: 'Orbitron', monospace; margin: 0;">TimeSheet Tracker</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              Hello ${userName},
            </p>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
              You have requested to reset your password for your TimeSheet Tracker account. 
              Click the button below to create a new password:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background: linear-gradient(135deg, #007bff, #0056b3); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: 600;
                        display: inline-block;">
                Reset My Password
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; margin-bottom: 10px;">
              Or copy and paste this link into your browser:
            </p>
            <p style="color: #007bff; word-break: break-all; font-size: 14px; margin-bottom: 20px;">
              ${resetUrl}
            </p>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
              <p style="color: #999; font-size: 14px; margin-bottom: 10px;">
                <strong>Security Notes:</strong>
              </p>
              <ul style="color: #999; font-size: 14px; margin: 0; padding-left: 20px;">
                <li>This link will expire in 1 hour for security reasons</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Never share this link with anyone</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © 2025 TimeSheet Tracker. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendPasswordResetEmail
};
