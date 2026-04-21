const User = require('../models/User');
const OTPService = require('../services/otpService');
const jwt = require('jsonwebtoken');

const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m' }
    );
    
    const refreshToken = jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
    );
    
    return { accessToken, refreshToken };
};

exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        
        const result = await OTPService.sendOTP(email);
        res.json(result);
    } catch (error) {
        console.error('Send OTP Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp, name, phone } = req.body;
        
        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }
        
        // Verify OTP
        const verification = await OTPService.verifyOTP(email, otp);
        
        if (!verification.success) {
            return res.status(400).json(verification);
        }
        
        // Find or create user
        let user = await User.findOne({ email });
        
        if (!user) {
            user = await User.create({
                name: name || 'User',
                email,
                phone: phone || '',
                isVerified: true
            });
        } else {
            user.isVerified = true;
            await user.save();
        }
        
        // Generate tokens
        const tokens = generateTokens(user);
        user.refreshToken = tokens.refreshToken;
        await user.save();
        
        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            ...tokens
        });
    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.logout = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            user.refreshToken = null;
            await user.save();
        }
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};