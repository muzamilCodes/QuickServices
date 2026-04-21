const { User } = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/emailService");
require("dotenv").config();

// ===================== GENERATE TOKENS =====================
const generateTokens = (userId, email, role) => {
  const accessToken = jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
  
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  
  return { accessToken, refreshToken };
};

// ===================== REGISTER =====================
exports.register = async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;

    // Validation
    if (!username || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "All fields required"
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email or phone"
      });
    }

    // Clean phone number
    const cleanPhone = phone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be 10 digits"
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = await User.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      phone: cleanPhone,
      password: hashedPassword,
      otp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
      isVerified: false
    });

    // Send OTP email
    try {
      await sendEmail(
        email,
        "Verify Your QuickServices Account",
        `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Welcome to QuickServices!</h2>
          <p>Your OTP for verification is:</p>
          <h1 style="color: #4F46E5; font-size: 32px;">${otp}</h1>
          <p>This OTP is valid for <strong>10 minutes</strong>.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
        `
      );
      console.log(`📧 OTP sent to ${email}: ${otp}`);
    } catch (emailError) {
      console.log("Email error (ignored):", emailError.message);
    }

    return res.status(200).json({
      success: true,
      message: "Registration successful! Please verify OTP",
      email: newUser.email
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ===================== VERIFY OTP =====================
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP required"
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Account already verified"
      });
    }

    if (user.otp !== otp || user.otpExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    // Verify user
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // Generate tokens
    const tokens = generateTokens(user._id, user.email, user.role);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Account verified successfully",
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ===================== LOGIN =====================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required"
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Check if verified
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email first with OTP"
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    // Check if active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated"
      });
    }

    // Generate tokens
    const tokens = generateTokens(user._id, user.email, user.role);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePic: user.profilePic
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ===================== SEND OTP (for login) =====================
exports.sendLoginOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email required"
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail(
      email,
      "Your Login OTP - QuickServices",
      `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Login OTP</h2>
        <p>Your OTP for login is:</p>
        <h1 style="color: #4F46E5; font-size: 32px;">${otp}</h1>
        <p>Valid for 10 minutes.</p>
      </div>
      `
    );

    console.log(`📧 Login OTP for ${email}: ${otp}`);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ===================== VERIFY LOGIN OTP =====================
exports.verifyLoginOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.otp !== otp || user.otpExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    // Clear OTP
    user.otp = null;
    user.otpExpiry = null;
    
    // Generate tokens
    const tokens = generateTokens(user._id, user.email, user.role);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ===================== FORGOT PASSWORD =====================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail(
      email,
      "Reset Your Password - QuickServices",
      `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Reset Password</h2>
        <p>Your OTP to reset password is:</p>
        <h1 style="color: #4F46E5; font-size: 32px;">${otp}</h1>
        <p>Valid for 10 minutes.</p>
      </div>
      `
    );

    console.log(`📧 Reset OTP for ${email}: ${otp}`);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ===================== RESET PASSWORD =====================
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.otp !== otp || user.otpExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ===================== UPDATE PROFILE =====================
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { username, phone } = req.body;

    const updateData = {};
    
    if (username) updateData.username = username.trim();
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, "").slice(-10);
      if (cleanPhone.length === 10) {
        updateData.phone = cleanPhone;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select("-password -refreshToken");

    return res.status(200).json({
      success: true,
      message: "Profile updated",
      user: updatedUser
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ===================== GET PROFILE =====================
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password -refreshToken");
    
    return res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ===================== LOGOUT =====================
exports.logout = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    
    return res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ===================== REFRESH TOKEN =====================
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required"
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token"
      });
    }

    const tokens = generateTokens(user._id, user.email, user.role);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return res.status(200).json({
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });

  } catch (error) {
    console.error(error);
    return res.status(401).json({
      success: false,
      message: "Invalid refresh token"
    });
  }
};

// ===================== ADMIN: GET ALL USERS =====================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password -refreshToken")
      .sort({ createdAt: -1 });
    
    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ===================== ADMIN: UPDATE USER STATUS =====================
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive, role } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive, role },
      { new: true }
    ).select("-password -refreshToken");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "User updated",
      user
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ===================== ADMIN: DELETE USER =====================
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};