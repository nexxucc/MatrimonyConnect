const twilio = require('twilio');

// Initialize Twilio client (in production, use environment variables)
const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// Generate OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via SMS (accepts OTP as argument)
const sendOTP = async (phoneNumber, otp) => {
    try {
        // In development, just log the OTP
        if (process.env.NODE_ENV === 'development') {
            console.log(`OTP for ${phoneNumber}: ${otp}`);
            return;
        }

        // In production, send via Twilio
        await client.messages.create({
            body: `Your Matrimony Connect verification code is: ${otp}. Valid for 10 minutes.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber
        });
    } catch (error) {
        console.error('Error sending OTP:', error);
        throw new Error('Failed to send OTP');
    }
};

// Send OTP via WhatsApp (accepts OTP as argument)
const sendWhatsAppOTP = async (phoneNumber, otp) => {
    try {
        // In development, just log the OTP
        if (process.env.NODE_ENV === 'development') {
            console.log(`WhatsApp OTP for ${phoneNumber}: ${otp}`);
            return;
        }
        // In production, send via Twilio WhatsApp
        await client.messages.create({
            body: `Your Matrimony Connect verification code is: ${otp}. Valid for 10 minutes.`,
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
            to: `whatsapp:${phoneNumber}`
        });
    } catch (error) {
        console.error('Error sending WhatsApp OTP:', error);
        throw new Error('Failed to send WhatsApp OTP');
    }
};

// Verify OTP
const verifyOTP = (storedOTP, providedOTP) => {
    return storedOTP === providedOTP;
};

// Resend OTP
const resendOTP = async (phoneNumber) => {
    try {
        const otp = generateOTP();

        if (process.env.NODE_ENV === 'development') {
            console.log(`Resend OTP for ${phoneNumber}: ${otp}`);
            return otp;
        }

        await client.messages.create({
            body: `Your new Matrimony Connect verification code is: ${otp}. Valid for 10 minutes.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber
        });

        return otp;
    } catch (error) {
        console.error('Error resending OTP:', error);
        throw new Error('Failed to resend OTP');
    }
};

// Check if OTP is still valid (expiry in ms, default 10 min)
const isOTPValid = (otpExpiresAt) => {
    if (!otpExpiresAt) return false;
    return new Date() < new Date(otpExpiresAt);
};

/**
 * Get or create OTP for a user (email or phone)
 * @param {object} user - Mongoose user document
 * @param {string} type - 'email' or 'phone'
 * @param {number} expiryMinutes - OTP validity in minutes (default 10)
 * @returns {Promise<string>} - The OTP
 */
const getOrCreateOTP = async (user, type, expiryMinutes = 10) => {
    const otpField = type === 'email' ? 'emailOtp' : 'phoneOtp';
    const expiresAtField = type === 'email' ? 'emailOtpExpiresAt' : 'phoneOtpExpiresAt';

    // If valid OTP exists, return it
    if (user[otpField] && isOTPValid(user[expiresAtField])) {
        return user[otpField];
    }
    // Otherwise, generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
    user[otpField] = otp;
    user[expiresAtField] = expiresAt;
    await user.save();
    return otp;
};

/**
 * Send OTP to user (email or phone) and set expiry when sent.
 * @param {object} user - Mongoose user document
 * @param {string} type - 'email' or 'phone'
 * @param {function} sendFn - Function to send OTP (e.g., sendOTP for phone, your email sender for email)
 * @param {number} expiryMinutes - OTP validity in minutes (default 10)
 * @returns {Promise<string>} - The OTP sent
 */
const sendUserOTP = async (user, type, sendFn, expiryMinutes = 10) => {
    const otpField = type === 'email' ? 'emailOtp' : 'phoneOtp';
    const expiresAtField = type === 'email' ? 'emailOtpExpiresAt' : 'phoneOtpExpiresAt';
    const contactField = type === 'email' ? 'email' : 'phone';

    let otp = user[otpField];
    let expiresAt = user[expiresAtField];

    // If OTP exists and is still valid, just resend it
    if (otp && isOTPValid(expiresAt)) {
        await sendFn(user[contactField], otp);
        return otp;
    }
    // If OTP does not exist or expired, generate new OTP and set expiry
    otp = generateOTP();
    expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
    user[otpField] = otp;
    user[expiresAtField] = expiresAt;
    await user.save();
    await sendFn(user[contactField], otp);
    return otp;
};

module.exports = {
    generateOTP,
    sendOTP,
    sendWhatsAppOTP,
    verifyOTP,
    resendOTP,
    isOTPValid,
    getOrCreateOTP,
    sendUserOTP
};