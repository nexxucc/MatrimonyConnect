const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Send email
const sendEmail = async (to, subject, text, html = null) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@matrimonyconnect.com',
      to,
      subject,
      text,
      html: html || text
    };

    const info = await transporter.sendMail(mailOptions);
    if (process.env.NODE_ENV === 'development') {
      console.log('Email sent:', info.messageId);
    }
    return info;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error sending email:', error);
    }
    throw new Error('Failed to send email');
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, firstName) => {
  const subject = 'Welcome to Matrimony Connect!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e91e63;">Welcome to Matrimony Connect!</h2>
      <p>Dear ${firstName},</p>
      <p>Thank you for joining Matrimony Connect! We're excited to help you find your perfect match.</p>
      <p>To get started:</p>
      <ul>
        <li>Complete your profile with detailed information</li>
        <li>Upload your best photos</li>
        <li>Set your preferences for your ideal match</li>
        <li>Start browsing profiles</li>
      </ul>
      <p>If you have any questions, feel free to contact our support team.</p>
      <p>Best regards,<br>The Matrimony Connect Team</p>
    </div>
  `;

  return sendEmail(email, subject, '', html);
};

// Send interest notification
const sendInterestNotification = async (email, senderName, message) => {
  const subject = 'New Interest Received on Matrimony Connect';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e91e63;">New Interest Received!</h2>
      <p>You have received a new interest from ${senderName}.</p>
      ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
      <p>Login to your account to view the profile and respond.</p>
      <p>Best regards,<br>The Matrimony Connect Team</p>
    </div>
  `;

  return sendEmail(email, subject, '', html);
};

// Send match alert
const sendMatchAlert = async (email, matchName, matchAge, matchLocation) => {
  const subject = 'New Match Found on Matrimony Connect';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #e91e63;">New Match Found!</h2>
      <p>We found a great match for you:</p>
      <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
        <p><strong>Name:</strong> ${matchName}</p>
        <p><strong>Age:</strong> ${matchAge}</p>
        <p><strong>Location:</strong> ${matchLocation}</p>
      </div>
      <p>Login to your account to view the complete profile.</p>
      <p>Best regards,<br>The Matrimony Connect Team</p>
    </div>
  `;

  return sendEmail(email, subject, '', html);
};

// Send profile approval notification
const sendProfileApprovalEmail = async (email, isApproved, reason = '') => {
  const subject = isApproved
    ? 'Your Profile Has Been Approved!'
    : 'Profile Update Required';

  const html = isApproved ? `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4caf50;">Profile Approved!</h2>
      <p>Congratulations! Your profile has been approved and is now visible to other members.</p>
      <p>You can now start receiving interests and connecting with potential matches.</p>
      <p>Best regards,<br>The Matrimony Connect Team</p>
    </div>
  ` : `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f44336;">Profile Update Required</h2>
      <p>Your profile requires some updates before it can be approved.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
      <p>Please login to your account and update your profile accordingly.</p>
      <p>Best regards,<br>The Matrimony Connect Team</p>
    </div>
  `;

  return sendEmail(email, subject, '', html);
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendInterestNotification,
  sendMatchAlert,
  sendProfileApprovalEmail
}; 