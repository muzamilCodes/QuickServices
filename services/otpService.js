const OTP = require('../models/OTP');
const nodemailer = require('nodemailer');

// Email setup (optional)
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

class OTPService {
    static generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    static async sendOTP(email, phone = null) {
        try {
            const otp = this.generateOTP();
            
            // Delete old OTPs for this email
            await OTP.deleteMany({ email, isUsed: false });
            
            // Save OTP to MongoDB
            await OTP.create({
                email,
                otp: otp,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000)
            });
            
            // Console mein dikhega (development ke liye)
            console.log(`📧 OTP for ${email}: ${otp}`);
            console.log(`⏰ Expires in 10 minutes`);
            
            // Send email (optional - agar email setup hai toh)
            if (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'test@gmail.com') {
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: email,
                    subject: 'QuickServices OTP Verification',
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px;">
                            <h2>Welcome to QuickServices!</h2>
                            <p>Your OTP for verification is:</p>
                            <h1 style="color: #4F46E5; font-size: 32px;">${otp}</h1>
                            <p>This OTP is valid for <strong>10 minutes</strong>.</p>
                            <p>If you didn't request this, please ignore this email.</p>
                        </div>
                    `
                });
                console.log(`📧 Email sent to ${email}`);
            }
            
            return { success: true, message: 'OTP sent successfully' };
        } catch (error) {
            console.error('OTP Send Error:', error);
            throw new Error('Failed to send OTP');
        }
    }

    static async verifyOTP(email, otp) {
        try {
            // Find valid OTP in MongoDB
            const otpRecord = await OTP.findOne({
                email,
                otp: otp,
                isUsed: false,
                expiresAt: { $gt: new Date() }
            });
            
            if (!otpRecord) {
                return { success: false, message: 'Invalid or expired OTP' };
            }
            
            // Mark OTP as used
            otpRecord.isUsed = true;
            await otpRecord.save();
            
            return { success: true, message: 'OTP verified successfully' };
        } catch (error) {
            console.error('OTP Verify Error:', error);
            throw new Error('Failed to verify OTP');
        }
    }
}

module.exports = OTPService;