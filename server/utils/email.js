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
  const subject = 'Welcome to Matrimony Connect';
  const content = `
    <h2>Welcome, ${firstName}!</h2>
    <p>Hi ${firstName},</p>
    <p>Thanks for signing up. We're glad you're here.</p>
    <p>Here's what to do next:</p>
    <ol>
      <li>Fill out your profile — the more detail, the better your matches</li>
      <li>Upload a few recent photos (a clear face photo works best as your primary)</li>
      <li>Set your preferences so we know what you're looking for</li>
      <li>Browse profiles and send interests to people who catch your eye</li>
    </ol>
    <p>Profiles that are fully filled out and verified tend to get significantly more responses, so it's worth spending the time.</p>
    <p>
      <a href="${process.env.WEBSITE_URL || 'https://matrimonyconnect.com'}/profile/edit" class="button">Complete Your Profile</a>
    </p>
    <p>Wishing you the best,<br>The Matrimony Connect Team</p>
  `;

  const html = baseEmailTemplate(content);
  return sendEmail(email, subject, '', html);
};

// Send email verification OTP
const sendEmailVerificationOtp = async (email, firstName, otp) => {
  const subject = 'Verify Your Email Address - Matrimony Connect';
  const content = `
    <h2>Verify Your Email</h2>
    <p>Hi ${firstName},</p>
    <p>Use the code below to verify your email address:</p>
    <p style="font-size: 24px; font-weight: bold; text-align: center; padding: 10px; background-color: #f5f5f5; border-radius: 5px;">${otp}</p>
    <p>This code expires in 10 minutes. If you didn't sign up for Matrimony Connect, you can safely ignore this.</p>
    <p>Thanks,<br>Matrimony Connect</p>
  `;

  const html = baseEmailTemplate(content);
  return sendEmail(email, subject, '', html);
};

// Send interest notification
const sendInterestNotification = async (interestData) => {
  const { email, recipientName, senderName, senderAge, senderLocation, senderPhoto, message, interestId } = interestData;
  const subject = 'New Interest Received on Matrimony Connect';
  const content = `
    <h2>Someone's Interested</h2>
    <p>Hi ${recipientName},</p>
    <p>You've got a new interest on your profile.</p>
    
    <div class="profile-card">
      ${senderPhoto ? `<img src="${senderPhoto}" alt="${senderName}" class="profile-image" />` : ''}
      <h3>${senderName}, ${senderAge}</h3>
      <p><strong>Location:</strong> ${senderLocation}</p>
      ${message ? `<p><strong>Message:</strong> "${message}"</p>` : ''}
    </div>
    
    <p>Log in to see their full profile and respond.</p>
    <p>
      <a href="${process.env.WEBSITE_URL || 'https://matrimonyconnect.com'}/interests/${interestId}" class="button">View Interest</a>
    </p>
    <p>Thanks,<br>Matrimony Connect</p>
  `;

  const html = baseEmailTemplate(content);
  return sendEmail(email, subject, '', html);
};

// Send interest response notification
const sendInterestResponseNotification = async (email, recipientName, responderName, response, responderPhoto) => {
  const subject = `Interest ${response === 'accepted' ? 'Accepted' : 'Declined'} on Matrimony Connect`;
  const content = `
    <h2>Interest ${response === 'accepted' ? 'Accepted' : 'Declined'}</h2>
    <p>Hi ${recipientName},</p>
    ${response === 'accepted' ?
      `<p>${responderName} accepted your interest. You can now start a conversation.</p>` :
      `<p>${responderName} has declined your interest. Keep looking — there are plenty of other profiles worth checking out.</p>`
    }
    
    ${responderPhoto && response === 'accepted' ? `<img src="${responderPhoto}" alt="${responderName}" class="profile-image" />` : ''}
    
    ${response === 'accepted' ?
      `<p>
        <a href="${process.env.WEBSITE_URL || 'https://matrimonyconnect.com'}/chat" class="button">Start Chatting</a>
      </p>` :
      `<p>
        <a href="${process.env.WEBSITE_URL || 'https://matrimonyconnect.com'}/search" class="button">Browse Profiles</a>
      </p>`
    }
    
    <p>Thanks,<br>Matrimony Connect</p>
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
    <h2>New Matches for You</h2>
    <p>Hi ${recipientName},</p>
    <p>We found ${matches.length} new profiles that match your preferences:</p>
    
    ${matchesHTML}
    
    <p>Log in to see their full profiles and send an interest if someone stands out.</p>
    <p>
      <a href="${process.env.WEBSITE_URL || 'https://matrimonyconnect.com'}/matches" class="button">View Matches</a>
    </p>
    <p>Thanks,<br>Matrimony Connect</p>
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
    <h2 style="color: #4caf50;">Your Profile is Live</h2>
    <p>Hi ${recipientName},</p>
    <p>Good news — your profile has been reviewed and approved. It's now visible to other members on the platform.</p>
    <p>You'll start receiving interests and can begin connecting with people who match your preferences.</p>
    <p>If you'd like to stand out more, consider upgrading your membership for added visibility.</p>
    <p>
      <a href="${process.env.WEBSITE_URL || 'https://matrimonyconnect.com'}/subscription" class="button">Explore Plans</a>
    </p>
    <p>Thanks,<br>Matrimony Connect</p>
  ` : `
    <h2 style="color: #f44336;">Profile Update Needed</h2>
    <p>Hi ${recipientName},</p>
    <p>We reviewed your profile but it needs a few changes before we can make it live.</p>    ${getReasonBlock(reason)}
    <p>Please log in and update your profile. Once you've made the changes, we'll review it again.</p>
    <p>
      <a href="${process.env.WEBSITE_URL || 'https://matrimonyconnect.com'}/profile/edit" class="button">Update Profile</a>
    </p>
    <p>If you have any questions, reach out to our support team.</p>
    <p>Thanks,<br>Matrimony Connect</p>
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
    <h2>Your Subscription is Ending Soon</h2>
    <p>Hi ${recipientName},</p>
    <p>Just a heads-up: your ${plan} subscription expires in <strong>${daysRemaining} days</strong>.</p>
    <p>If you renew, you'll keep access to:</p>
    <ul>
      <li>Unlimited interests</li>
      <li>Chat with members who've accepted your interest</li>
      <li>Viewing contact details</li>
      <li>Highlighted search results</li>
      <li>Advanced match filters</li>
    </ul>
    ${discountCode ? `
    <div style="background-color: #fff8e1; padding: 10px; border-left: 4px solid #ffc107; margin: 15px 0;">
      <p>Use code <span style="background: #ffc107; padding: 2px 8px; font-weight: bold;">${discountCode}</span> for 20% off your renewal.</p>
    </div>
    ` : ''}
    <p>
      <a href="${process.env.WEBSITE_URL || 'https://matrimonyconnect.com'}/subscription/renew" class="button">Renew Subscription</a>
    </p>
    <p>Thanks,<br>Matrimony Connect</p>
  `;

  const html = baseEmailTemplate(content);
  return sendEmail(email, subject, '', html);
};

// Send weekly profile summary
const sendWeeklySummary = async (email, recipientName, stats) => {
  const subject = 'Your Weekly Activity Summary - Matrimony Connect';

  const content = `
    <h2>Your Week in Review</h2>
    <p>Hi ${recipientName},</p>
    <p>Here's a quick look at your activity over the past week:</p>
    
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
    
    <h3>How Your Profile is Doing</h3>
    <p>You're ahead of ${stats.performancePercentage}% of profiles with similar criteria.</p>
    
    <p>A few things that could help:</p>
    <ul>
      ${stats.completionPercentage < 100 ? `<li>Your profile is ${stats.completionPercentage}% complete — filling in the rest will help</li>` : ''}
      ${stats.photoCount < 3 ? `<li>You have ${stats.photoCount} photo${stats.photoCount === 1 ? '' : 's'} — adding more gives a better first impression</li>` : ''}
      ${!stats.aboutMeComplete ? `<li>Write something in your "About Me" section</li>` : ''}
      ${!stats.partnerPreferencesComplete ? `<li>Fill in your partner preferences so we can suggest better matches</li>` : ''}
    </ul>
    
    <p>
      <a href="${process.env.WEBSITE_URL || 'https://matrimonyconnect.com'}/dashboard" class="button">Go to Dashboard</a>
    </p>
    <p>Thanks,<br>Matrimony Connect</p>
  `;

  const html = baseEmailTemplate(content);
  return sendEmail(email, subject, '', html);
};

// Send password reset email
const sendPasswordResetEmail = async (email, recipientName, resetToken) => {
  const subject = 'Password Reset Request - Matrimony Connect';

  const content = `
    <h2>Password Reset</h2>
    <p>Hi ${recipientName},</p>
    <p>We got a request to reset your password. Click below to set a new one:</p>
    
    <p style="text-align: center;">
      <a href="${process.env.WEBSITE_URL || 'https://matrimonyconnect.com'}/reset-password/${resetToken}" class="button">Reset Password</a>
    </p>
    
    <p>This link expires in 30 minutes.</p>
    <p>If you didn't request this, just ignore this email — your password won't change.</p>
    <p>Thanks,<br>Matrimony Connect</p>
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
    <h2 style="color: #4caf50;">Your Story is Live</h2>
    <p>Hi ${coupleName},</p>
    <p>Your success story has been approved and is now published on the site.</p>
    <p>Thanks for sharing it with the community — stories like yours make a real difference for people still searching.</p>
    <p>
      <a href="${process.env.WEBSITE_URL || 'https://matrimonyconnect.com'}/success-stories" class="button">View Success Stories</a>
    </p>
    <p>Wishing you both all the best,<br>Matrimony Connect</p>
  ` : `
    <h2>A Few Changes Needed on Your Story</h2>
    <p>Hi ${coupleName},</p>
    <p>Thanks for submitting your success story. Before we can publish it, we'd appreciate a few edits:</p>
    <ol>
      <li>Make sure all photos are clear and appropriate</li>
      <li>Add some detail about how you connected through the platform</li>
      <li>Share a memorable moment from your time getting to know each other</li>
    </ol>
    <p>You can update your submission here:</p>
    <p>
      <a href="${process.env.WEBSITE_URL || 'https://matrimonyconnect.com'}/success-stories/edit" class="button">Edit Your Story</a>
    </p>
    <p>Thanks,<br>Matrimony Connect</p>
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
    <p>You might want to reply soon so the conversation keeps going.</p>
    <p>This is an automated notification. Please do not reply to this email.</p>
  `);

  return sendEmail(recipientEmail, subject, '', htmlContent);
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

  return sendEmail(adminEmail, subject, '', htmlContent);
};

// Send success story approval notification
const sendSuccessStoryApprovalNotification = async (recipientEmail, storyTitle, isApproved, reason) => {
  const subject = isApproved
    ? `Your Success Story Has Been Approved!`
    : `Update Regarding Your Success Story Submission`;

  let content;
  if (isApproved) {
    content = `
      <p>Hello,</p>
      <p>Your success story titled <strong>${storyTitle}</strong> has been approved and is now live on Matrimony Connect.</p>
      <p>Thanks for sharing your experience. It means a lot to the community.</p>
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
  return sendEmail(recipientEmail, subject, '', htmlContent);
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