const nodemailer = require('nodemailer');

// Helper function to generate reason block HTML
const getReasonBlock = (reason) => {
  if (!reason) return '';

  return `
    <div style="background-color: #fff4f4; padding: 10px; border-left: 4px solid #f44336; margin: 15px 0;">
      <p><strong>Reason:</strong> ${reason}</p>
    </div>
  `;
};

// Create reusable transporter object using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Base template for emails
const baseEmailTemplate = (content) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Matrimony Connect</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #e91e63;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          background-color: #fff;
          padding: 20px;
          border-left: 1px solid #ddd;
          border-right: 1px solid #ddd;
        }
        .footer {
          background-color: #f5f5f5;
          padding: 15px 20px;
          text-align: center;
          font-size: 12px;
          color: #777;
          border-radius: 0 0 5px 5px;
          border: 1px solid #ddd;
        }
        .button {
          background-color: #e91e63;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 5px;
          display: inline-block;
          margin: 10px 0;
          font-weight: bold;
        }
        .profile-card {
          border: 1px solid #ddd;
          border-radius: 5px;
          padding: 15px;
          margin: 15px 0;
          background-color: #f9f9f9;
        }
        .profile-image {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
          margin-right: 15px;
        }
        .highlight {
          background-color: #ffe0f0;
          padding: 2px 4px;
          border-radius: 3px;
        }
        .stats {
          display: flex;
          justify-content: space-between;
          margin: 20px 0;
        }
        .stat-box {
          background-color: #f5f5f5;
          padding: 10px;
          border-radius: 5px;
          text-align: center;
          width: 30%;
        }
        .stat-number {
          font-size: 20px;
          font-weight: bold;
          color: #e91e63;
        }
        .divider {
          border-top: 1px solid #eee;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Matrimony Connect</h2>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Matrimony Connect. All rights reserved.</p>
          <p>If you have any questions, contact us at <a href="mailto:support@matrimonyconnect.com">support@matrimonyconnect.com</a></p>
          <p><small>You received this email because you are a registered member of Matrimony Connect.</small></p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send email
const sendEmail = async (to, subject, text, html = null) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@matrimonyconnect.com',
      to,
      subject,
      text: text || undefined,
      html: html || undefined
    };
    const info = await transporter.sendMail(mailOptions);
    if (process.env.NODE_ENV === 'development') {
      console.log('Email sent:', info.messageId || info);
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
  const content = `
    <h2>Welcome to Matrimony Connect!</h2>
    <p>Dear ${firstName},</p>
    <p>Thank you for joining Matrimony Connect! We're excited to help you find your perfect life partner.</p>
    <p>To get started with your journey:</p>
    <ol>
      <li>Complete your profile with detailed information</li>
      <li>Upload your best photos (clear face photo recommended as primary)</li>
      <li>Set your preferences for your ideal match</li>
      <li>Start browsing profiles and sending interests</li>
    </ol>
    <div class="stats">
      <div class="stat-box">
        <div class="stat-number">5M+</div>
        <div>Members</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">1M+</div>
        <div>Success Stories</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">100+</div>
        <div>Countries</div>
      </div>
    </div>
    <p>Our team is here to help you find your perfect match. Remember, a complete and verified profile gets <span class="highlight">10x more responses</span>!</p>
    <p>
      <a href="${process.env.WEBSITE_URL || 'https://matrimonyconnect.com'}/profile/edit" class="button">Complete Your Profile</a>
    </p>
    <p>Best wishes on your journey to find your soulmate!</p>
    <p>Warm Regards,<br>The Matrimony Connect Team</p>
  `;

  const html = baseEmailTemplate(content);
  return sendEmail(email, subject, '', html);
};

// Send email verification OTP
const sendEmailVerificationOtp = async (email, firstName, otp) => {
  const subject = 'Verify Your Email Address - Matrimony Connect';
  const content = `
    <h2>Email Verification</h2>
    <p>Dear ${firstName},</p>
    <p>Thank you for registering with Matrimony Connect. Please use the following OTP to verify your email address:</p>
    <p style="font-size: 24px; font-weight: bold; text-align: center; padding: 10px; background-color: #f5f5f5; border-radius: 5px;">${otp}</p>
    <p>This OTP is valid for 10 minutes. If you didn't request this verification, please ignore this email.</p>
    <p>Best Regards,<br>The Matrimony Connect Team</p>
  `;

  const html = baseEmailTemplate(content);
  return sendEmail(email, subject, '', html);
};

// Send interest notification
const sendInterestNotification = async (interestData) => {
  const { email, recipientName, senderName, senderAge, senderLocation, senderPhoto, message, interestId } = interestData;
  const subject = 'New Interest Received on Matrimony Connect';
  const content = `
    <h2>New Interest Received!</h2>
    <p>Dear ${recipientName},</p>
    <p>You have received a new interest from someone who liked your profile!</p>
    
    <div class="profile-card">
      ${senderPhoto ? `<img src="${senderPhoto}" alt="${senderName}" class="profile-image" />` : ''}
      <h3>${senderName}, ${senderAge}</h3>
      <p><strong>Location:</strong> ${senderLocation}</p>
      ${message ? `<p><strong>Message:</strong> "${message}"</p>` : ''}
    </div>
    
    <p>Login to your account to view the complete profile and respond to this interest.</p>
    <p>
      <a href="${process.env.WEBSITE_URL || 'https://matrimonyconnect.com'}/interests/${interestId}" class="button">View Interest</a>
    </p>
    <p>Best Regards,<br>The Matrimony Connect Team</p>
  `;

  const html = baseEmailTemplate(content);
  return sendEmail(email, subject, '', html);
};

// Send interest response notification
const sendInterestResponseNotification = async (email, recipientName, responderName, response, responderPhoto) => {
  const subject = `Interest ${response === 'accepted' ? 'Accepted' : 'Declined'} on Matrimony Connect`;
  const content = `
    <h2>Interest ${response === 'accepted' ? 'Accepted' : 'Declined'}</h2>
    <p>Dear ${recipientName},</p>
    ${response === 'accepted' ?
      `<p>${responderName} has accepted your interest. You can now start chatting!</p>` :
      `<p>${responderName} has declined your interest. Don't worry, there are many more compatible profiles waiting for you.</p>`
    }
    
    ${responderPhoto && response === 'accepted' ? `<img src="${responderPhoto}" alt="${responderName}" class="profile-image" />` : ''}
    
    ${response === 'accepted' ?
      `<p>
        <a href="${process.env.WEBSITE_URL || 'https://matrimonyconnect.com'}/chat" class="button">Start Chatting</a>
      </p>` :
      `<p>
        <a href="${process.env.WEBSITE_URL || 'https://matrimonyconnect.com'}/search" class="button">Continue Searching</a>
      </p>`
    }
    
    <p>Best Regards,<br>The Matrimony Connect Team</p>
  `;

  const html = baseEmailTemplate(content);
  return sendEmail(email, subject, '', html);
};

// Send match alert
const sendMatchAlert = async (email, recipientName, matches) => {
  const subject = 'New Matches Found on Matrimony Connect';

  let matchesHTML = '';
  matches.forEach(match => {
    matchesHTML += `
      <div class="profile-card">
        ${match.photoUrl ? `<img src="${match.photoUrl}" alt="${match.name}" class="profile-image" />` : ''}
        <h3>${match.name}, ${match.age}</h3>
        <p><strong>Location:</strong> ${match.location}</p>
        <p><strong>Education:</strong> ${match.education}</p>
        <p><strong>Profession:</strong> ${match.profession}</p>
      </div>
    `;
  });

  const content = `
    <h2>New Matches Found!</h2>
    <p>Dear ${recipientName},</p>
    <p>We found ${matches.length} new potential matches for you based on your preferences:</p>
    
    ${matchesHTML}
    
    <p>Login to your account to view their complete profiles and express your interest.</p>
    <p>
      <a href="${process.env.WEBSITE_URL || 'https://matrimonyconnect.com'}/matches" class="button">View All Matches</a>
    </p>
    <p>Best Regards,<br>The Matrimony Connect Team</p>
  `;

  const html = baseEmailTemplate(content);
  return sendEmail(email, subject, '', html);
};

// Send profile approval notification
const sendProfileApprovalEmail = async (email, recipientName, isApproved, reason = '') => {
  const subject = isApproved
    ? 'Your Profile Has Been Approved! - Matrimony Connect'
    : 'Profile Update Required - Matrimony Connect';

  const content = isApproved ? `
    <h2 style="color: #4caf50;">Profile Approved!</h2>
    <p>Dear ${recipientName},</p>
    <p>Congratulations! Your profile has been approved and is now visible to other members.</p>
    <p>You can now start receiving interests and connecting with potential matches.</p>
    <div class="stats">
      <div class="stat-box">
        <div class="stat-number">10x</div>
        <div>More Views</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">5x</div>
        <div>More Interests</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">100%</div>
        <div>More Trust</div>
      </div>
    </div>
    <p>Want to boost your profile visibility even more?</p>
    <p>
      <a href="${process.env.WEBSITE_URL || 'https://matrimonyconnect.com'}/subscription" class="button">Upgrade Membership</a>
    </p>
    <p>Best Regards,<br>The Matrimony Connect Team</p>
  ` : `
    <h2 style="color: #f44336;">Profile Update Required</h2>
    <p>Dear ${recipientName},</p>
    <p>Your profile requires some updates before it can be approved.</p>    ${getReasonBlock(reason)}
    <p>Please login to your account and update your profile accordingly. Once updated, your profile will be reviewed again.</p>
    <p>
      <a href="${process.env.WEBSITE_URL || 'https://matrimonyconnect.com'}/profile/edit" class="button">Update Profile</a>
    </p>
    <p>If you have any questions, please contact our support team.</p>
    <p>Best Regards,<br>The Matrimony Connect Team</p>
  `;

  const html = baseEmailTemplate(content);
  return sendEmail(email, subject, '', html);
};

// Send subscription renewal reminder
const sendSubscriptionRenewalReminder = async (email, recipientName, plan, expiryDate, discountCode = null) => {
  const subject = 'Your Matrimony Connect Subscription Expires Soon';

  // Calculate days remaining
  const now = new Date();
  const expiry = new Date(expiryDate);
  const daysRemaining = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

  const content = `
    <h2>Subscription Renewal Reminder</h2>
    <p>Dear ${recipientName},</p>
    <p>Your ${plan} subscription will expire in <strong>${daysRemaining} days</strong>.</p>
    <p>Don't miss out on connecting with potential matches! Renew your subscription to continue enjoying premium features:</p>
    <ul>
      <li>Send unlimited interests</li>
      <li>Chat with interested members</li>
      <li>View contact details of members</li>
      <li>Get highlighted in search results</li>
      <li>Access advanced matchmaking</li>
    </ul>
    ${discountCode ? `
    <div style="background-color: #fff8e1; padding: 10px; border-left: 4px solid #ffc107; margin: 15px 0;">
      <p><strong>Special Offer!</strong> Use code <span style="background: #ffc107; padding: 2px 8px; font-weight: bold;">${discountCode}</span> to get 20% off on renewal.</p>
    </div>
    ` : ''}
    <p>
      <a href="${process.env.WEBSITE_URL || 'https://matrimonyconnect.com'}/subscription/renew" class="button">Renew Subscription</a>
    </p>
    <p>Best Regards,<br>The Matrimony Connect Team</p>
  `;

  const html = baseEmailTemplate(content);
  return sendEmail(email, subject, '', html);
};

// Send weekly profile summary
const sendWeeklySummary = async (email, recipientName, stats) => {
  const subject = 'Your Weekly Activity Summary - Matrimony Connect';

  const content = `
    <h2>Your Weekly Activity Summary</h2>
    <p>Dear ${recipientName},</p>
    <p>Here's your account activity summary for the past week:</p>
    
    <div class="stats">
      <div class="stat-box">
        <div class="stat-number">${stats.profileViews}</div>
        <div>Profile Views</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">${stats.interestsReceived}</div>
        <div>Interests Received</div>
      </div>
      <div class="stat-box">
        <div class="stat-number">${stats.contactViews}</div>
        <div>Contact Views</div>
      </div>
    </div>
    
    <div class="divider"></div>
    
    <h3>Your Profile Performance</h3>
    <p>Your profile is performing better than ${stats.performancePercentage}% of similar profiles!</p>
    
    <p>Tips to improve your profile:</p>
    <ul>
      ${stats.completionPercentage < 100 ? `<li>Complete your profile (currently ${stats.completionPercentage}% complete)</li>` : ''}
      ${stats.photoCount < 3 ? `<li>Add more photos (currently ${stats.photoCount} photos)</li>` : ''}
      ${!stats.aboutMeComplete ? `<li>Add a detailed "About Me" description</li>` : ''}
      ${!stats.partnerPreferencesComplete ? `<li>Define your partner preferences clearly</li>` : ''}
    </ul>
    
    <p>
      <a href="${process.env.WEBSITE_URL || 'https://matrimonyconnect.com'}/dashboard" class="button">Check Your Dashboard</a>
    </p>
    <p>Best Regards,<br>The Matrimony Connect Team</p>
  `;

  const html = baseEmailTemplate(content);
  return sendEmail(email, subject, '', html);
};

// Send password reset email
const sendPasswordResetEmail = async (email, recipientName, resetToken) => {
  const subject = 'Password Reset Request - Matrimony Connect';

  const content = `
    <h2>Password Reset Request</h2>
    <p>Dear ${recipientName},</p>
    <p>We received a request to reset your Matrimony Connect account password. Click the button below to reset your password:</p>
    
    <p style="text-align: center;">
      <a href="${process.env.WEBSITE_URL || 'https://matrimonyconnect.com'}/reset-password/${resetToken}" class="button">Reset Your Password</a>
    </p>
    
    <p>This password reset link is valid for 30 minutes.</p>
    <p>If you didn't request a password reset, please ignore this email or contact our support team if you have concerns.</p>
    <p>Best Regards,<br>The Matrimony Connect Team</p>
  `;

  const html = baseEmailTemplate(content);
  return sendEmail(email, subject, '', html);
};

// Send success story approval
const sendSuccessStoryApproval = async (email, coupleName, isApproved) => {
  const subject = isApproved
    ? 'Your Success Story has been Published! - Matrimony Connect'
    : 'Success Story Update Required - Matrimony Connect';

  const content = isApproved ? `
    <h2 style="color: #4caf50;">Success Story Published!</h2>
    <p>Dear ${coupleName},</p>
    <p>Congratulations! Your success story has been approved and is now published on our website.</p>
    <p>Thank you for sharing your journey with our community. Your story will inspire many others on their path to finding love.</p>
    <p>
      <a href="${process.env.WEBSITE_URL || 'https://matrimonyconnect.com'}/success-stories" class="button">View Success Stories</a>
    </p>
    <p>We wish you a lifetime of happiness together!</p>
    <p>Best Regards,<br>The Matrimony Connect Team</p>
  ` : `
    <h2>Success Story Update Required</h2>
    <p>Dear ${coupleName},</p>
    <p>Thank you for sharing your success story with us. We need some additional information or adjustments before we can publish it:</p>
    <ol>
      <li>Please ensure all photos are clear and appropriate</li>
      <li>Include more details about how you met through our platform</li>
      <li>Share some special moments from your journey together</li>
    </ol>
    <p>You can edit your submission by clicking the button below:</p>
    <p>
      <a href="${process.env.WEBSITE_URL || 'https://matrimonyconnect.com'}/success-stories/edit" class="button">Edit Your Story</a>
    </p>
    <p>Best Regards,<br>The Matrimony Connect Team</p>
  `;

  const html = baseEmailTemplate(content);
  return sendEmail(email, subject, '', html);
};

// Send chat notification email
const sendChatNotification = async (recipientEmail, senderName, messagePreview) => {
  const subject = `New Message from ${senderName} on Matrimony Connect`;

  const htmlContent = baseEmailTemplate(`
    <h2>You Have a New Message</h2>
    <p>Hello,</p>
    <p><strong>${senderName}</strong> has sent you a new message on Matrimony Connect.</p>
    <p><em>"${messagePreview.length > 100 ? messagePreview.substring(0, 100) + '...' : messagePreview}"</em></p>
    <div class="button-container">
      <a href="${process.env.FRONTEND_URL}/chat" class="button">View Message</a>
    </div>
    <p>Don't keep them waiting! Respond promptly to keep the conversation going.</p>
    <p>Please note that this is an automated notification. Do not reply to this email.</p>
  `);

  return sendEmail(recipientEmail, subject, htmlContent);
};

// Send success story notification to admin
const sendSuccessStoryNotification = async (adminEmail, userName, storyTitle) => {
  const subject = `New Success Story Submitted: ${storyTitle}`;

  const htmlContent = baseEmailTemplate(`
    <h2>New Success Story Submitted</h2>
    <p>Hello Admin,</p>
    <p><strong>${userName}</strong> has submitted a new success story titled: <strong>${storyTitle}</strong>.</p>
    <p>This story is awaiting your review and approval.</p>
    <div class="button-container">
      <a href="${process.env.FRONTEND_URL}/admin/success-stories/pending" class="button">Review Success Stories</a>
    </div>
    <p>Please review this submission at your earliest convenience.</p>
  `);

  return sendEmail(adminEmail, subject, htmlContent);
};

// Send success story approval notification
const sendSuccessStoryApprovalNotification = async (recipientEmail, storyTitle, isApproved, reason) => {
  const subject = isApproved
    ? `Your Success Story Has Been Approved!`
    : `Update Regarding Your Success Story Submission`;

  let content;
  if (isApproved) {
    content = `
      <h2>Congratulations! Your Success Story Has Been Approved</h2>
      <p>Hello,</p>
      <p>We're delighted to inform you that your success story titled <strong>${storyTitle}</strong> has been approved and is now live on Matrimony Connect!</p>
      <p>Thank you for sharing your inspiring journey with our community. Your story will help inspire others in their search for a life partner.</p>
      <div class="button-container">
        <a href="${process.env.FRONTEND_URL}/success-stories" class="button">View Success Stories</a>
      </div>
    `;
  } else {
    content = `
      <h2>Your Success Story Requires Updates</h2>
      <p>Hello,</p>
      <p>We've reviewed your success story titled <strong>${storyTitle}</strong> and found that it requires some changes before it can be published.</p>
      <p><strong>Feedback:</strong> ${reason || 'Please review our content guidelines and update your submission.'}</p>
      <div class="button-container">
        <a href="${process.env.FRONTEND_URL}/profile/success-stories" class="button">Edit Your Story</a>
      </div>
      <p>If you have any questions, please don't hesitate to contact our support team.</p>
    `;
  }

  const htmlContent = baseEmailTemplate(content);
  return sendEmail(recipientEmail, subject, htmlContent);
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendEmailVerificationOtp,
  sendInterestNotification,
  sendInterestResponseNotification,
  sendMatchAlert,
  sendProfileApprovalEmail,
  sendSubscriptionRenewalReminder,
  sendWeeklySummary,
  sendPasswordResetEmail,
  sendSuccessStoryApproval,
  sendChatNotification,
  sendSuccessStoryNotification,
  sendSuccessStoryApprovalNotification
};