const twilio = require('twilio');
const crypto = require('crypto');

// Initialize Twilio client (in production, use environment variables)
const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// Generate numeric OTP
const generateOTP = (length = 6) => {
    // Generate random number between 0 and 999999 (for 6 digits)
    const maxNum = Math.pow(10, length) - 1;
    const minNum = Math.pow(10, length - 1);
    const otp = Math.floor(minNum + Math.random() * (maxNum - minNum + 1))
        .toString()
        .padStart(length, '0');
    return otp;
};

// Generate alphanumeric OTP (more secure)
const generateAlphanumericOTP = (length = 8) => {
    // Use crypto for more secure random values
    return crypto.randomBytes(length)
        .toString('base64')
        .replace(/[+/=]/g, '')  // Remove non-alphanumeric chars
        .substring(0, length);
};

// Generate verification token (for email links)
const generateVerificationToken = () => {
    return crypto.randomBytes(32).toString('hex');
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

        // Check if we're using WhatsApp Business API or Twilio
        if (process.env.WHATSAPP_API_TOKEN) {
            // WhatsApp Business API implementation
            const response = await fetch(`https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messaging_product: "whatsapp",
                    to: phoneNumber,
                    type: "template",
                    template: {
                        name: "otp_verification",
                        language: { code: "en" },
                        components: [
                            {
                                type: "body",
                                parameters: [
                                    {
                                        type: "text",
                                        text: otp
                                    },
                                    {
                                        type: "text",
                                        text: "10"
                                    }
                                ]
                            }
                        ]
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`WhatsApp API error: ${response.status}`);
            }
        } else {
            // Fallback to Twilio WhatsApp
            await client.messages.create({
                body: `Your Matrimony Connect verification code is: ${otp}. Valid for 10 minutes.`,
                from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
                to: `whatsapp:${phoneNumber}`
            });
        }
    } catch (error) {
        console.error('Error sending WhatsApp OTP:', error);
        throw new Error('Failed to send WhatsApp OTP');
    }
};

// Verify OTP with time-based comparison (constant time to prevent timing attacks)
const verifyOTP = (storedOTP, providedOTP) => {
    if (!storedOTP || !providedOTP) return false;

    // Use crypto.timingSafeEqual to prevent timing attacks
    // This ensures the verification takes the same time regardless of how many characters match
    try {
        // Convert to Buffer for timingSafeEqual
        const storedBuffer = Buffer.from(String(storedOTP));
        const providedBuffer = Buffer.from(String(providedOTP));

        // If length is different, pad the shorter one to match the longer one
        if (storedBuffer.length !== providedBuffer.length) {
            // Simple string comparison is fine here since we're already revealing the length difference
            return storedOTP === providedOTP;
        }

        // Use constant-time comparison
        return crypto.timingSafeEqual(storedBuffer, providedBuffer);
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return false;
    }
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

/**
 * Rate limiting OTP generation - prevents abuse
 * @param {string} identifier - User identifier (email, phone, IP)
 * @param {number} maxAttempts - Maximum attempts in time window
 * @param {number} windowMinutes - Time window in minutes
 * @returns {Promise<boolean>} - Whether rate limit is exceeded
 */
const otpLimitMap = new Map();

const checkRateLimit = (identifier, maxAttempts = 5, windowMinutes = 60) => {
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;

    // Get or initialize attempts array
    let attempts = otpLimitMap.get(identifier) || [];

    // Filter out attempts outside current time window
    attempts = attempts.filter(timestamp => now - timestamp < windowMs);

    // Check if max attempts reached
    if (attempts.length >= maxAttempts) {
        return false; // Rate limit exceeded
    }

    // Add current attempt
    attempts.push(now);
    otpLimitMap.set(identifier, attempts);

    return true; // Rate limit not exceeded
};

/**
 * Clean up expired rate limit entries (call periodically)
 * @param {number} windowMinutes - Time window in minutes
 */
const cleanupRateLimits = (windowMinutes = 60) => {
    const now = Date.now();
    const windowMs = windowMinutes * 60 * 1000;

    otpLimitMap.forEach((attempts, identifier) => {
        // Filter out old attempts
        const validAttempts = attempts.filter(timestamp => now - timestamp < windowMs);

        if (validAttempts.length === 0) {
            // Remove entry if no valid attempts
            otpLimitMap.delete(identifier);
        } else if (validAttempts.length < attempts.length) {
            // Update if some attempts were filtered out
            otpLimitMap.set(identifier, validAttempts);
        }
    });
};

// Set up periodic cleanup (every 15 minutes)
if (typeof setInterval !== 'undefined') {
    setInterval(() => cleanupRateLimits(), 15 * 60 * 1000);
}

module.exports = {
    generateOTP,
    generateAlphanumericOTP,
    generateVerificationToken,
    sendOTP,
    sendWhatsAppOTP,
    verifyOTP,
    resendOTP,
    isOTPValid,
    getOrCreateOTP,
    sendUserOTP,
    checkRateLimit,
    cleanupRateLimits
};