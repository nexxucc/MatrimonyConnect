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

// Send OTP via SMS
const sendOTP = async (phoneNumber) => {
    try {
        const otp = generateOTP();

        // In development, just log the OTP
        if (process.env.NODE_ENV === 'development') {
            console.log(`OTP for ${phoneNumber}: ${otp}`);
            return otp;
        }

        // In production, send via Twilio
        await client.messages.create({
            body: `Your Matrimony Connect verification code is: ${otp}. Valid for 10 minutes.`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber
        });

        return otp;
    } catch (error) {
        console.error('Error sending OTP:', error);
        throw new Error('Failed to send OTP');
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

module.exports = {
    generateOTP,
    sendOTP,
    verifyOTP,
    resendOTP
}; 