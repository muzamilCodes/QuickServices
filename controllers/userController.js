const { User } = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendEmail, generateOtpTemplate } = require("../utilities/emailService");

// Email send success/failure return kare
const sendOtpEmail = async (to, subject, otp, title) => {
  try {
    const { html, text } = generateOtpTemplate(otp, title);
    await sendEmail(to, subject, html, text);
    return true;
  } catch (emailError) {
    console.error("EMAIL ERROR:", emailError?.message || emailError);
    return false;
  }
};

// 8-character multi-type strong password validator (A / a / 1 / @)
const validateStrongPassword = (pwd) => {
  if (!pwd || typeof pwd !== 'string') return false;
  const hasMinLen = pwd.length >= 8;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(pwd);
  return hasMinLen && hasUpper && hasLower && hasNumber && hasSpecial;
};

// ===================== REGISTER =====================
exports.register = async (req, res) => {
  try {
    console.log('Register invoked, body:', req.body);
    const { username, email, password, mobile, phone } = req.body;
    const rawMobile = mobile || phone;

    const missing = [];
    if (!username) missing.push('username');
    if (!email) missing.push('email');
    if (!password) missing.push('password');
    if (!rawMobile) missing.push('mobile');
    if (missing.length > 0) {
      console.warn('Register validation failed - missing fields:', missing);
      return res.status(400).json({ success: false, message: `Missing fields: ${missing.join(', ')}` });
    }

    if (!validateStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long and contain at least one uppercase letter (A), one lowercase letter (a), one number (1), and one special character (@)."
      });
    }

    const cleanMobile = rawMobile.replace(/\D/g, "").slice(-10);

    if (cleanMobile.length !== 10) {
      console.warn('Register validation failed - invalid mobile after cleaning:', cleanMobile);
      return res.status(400).json({ success: false, message: `Mobile number must be 10 digits (got ${cleanMobile})` });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const [existingEmailUser, existingMobileUser] = await Promise.all([
      User.findOne({ email: normalizedEmail }),
      User.findOne({ mobile: cleanMobile })
    ]);
    const existingUser = existingEmailUser || existingMobileUser;

    if (existingUser) {
      if (existingMobileUser && existingMobileUser.email !== normalizedEmail) {
        console.warn('Register conflict - mobile belongs to another user:', { mobile: cleanMobile, id: existingMobileUser._id });
        return res.status(400).json({ success: false, message: "User already exists with same mobile" });
      }

      if (existingUser.isVerified) {
        console.warn('Register conflict - existing user found:', { email: existingUser.email, mobile: existingUser.mobile, id: existingUser._id });
        return res.status(400).json({ success: false, message: "User already exists with same email" });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      existingUser.username = username.trim();
      existingUser.mobile = cleanMobile;
      existingUser.password = await bcrypt.hash(password, 12);
      existingUser.otp = otp;
      existingUser.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      await existingUser.save();

      const emailSent = await sendOtpEmail(
        normalizedEmail,
        `${otp} is your QuickServices verification code`,
        otp,
        "Account Verification"
      );

      return res.status(200).json({
        success: true,
        message: emailSent ? "OTP sent successfully to your email inbox." : "Account created! Please verify OTP.",
        email: existingUser.email,
        emailSent,
      });
    }

    // OTP generate
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await User.create({
      username: username.trim(),
      email: normalizedEmail,
      mobile: cleanMobile,
      password: hashedPassword,
      otp,
      otpExpiry: new Date(Date.now() + 10 * 60 * 1000),
      isVerified: false,
    });

    const emailSent = await sendOtpEmail(
      normalizedEmail,
      `${otp} is your QuickServices verification code`,
      otp,
      "Account Verification"
    );

    return res.status(200).json({
      success: true,
      message: emailSent ? "OTP sent successfully to your email inbox." : "Account created! Please verify OTP.",
      email: newUser.email,
      emailSent,
    });

  } catch (error) {
    console.error('❌ Register error:', error?.message || error, error?.stack);
    return res.status(500).json({
      success: false,
      message: "Server error",
      ...(process.env.NODE_ENV !== 'production' && { detail: error?.message }),
    });
  }
};
// ===================== LOGIN =====================
exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const identifier = (email || '').toLowerCase().trim();
    const cleanMobile = identifier.replace(/\D/g, "").slice(-10);

    let user = await User.findOne({
      $or: [
        { email: identifier },
        ...(cleanMobile.length === 10 ? [{ mobile: cleanMobile }] : [])
      ]
    });

    // If user not found directly, check if a Provider profile exists with this email or phone
    const Provider = require('../models/Provider');
    if (!user) {
      const provider = await Provider.findOne({
        $or: [
          { email: identifier },
          ...(cleanMobile.length === 10 ? [{ phone: cleanMobile }] : [])
        ]
      });
      if (provider) {
        if (provider.userId) {
          user = await User.findById(provider.userId);
        }
        if (!user && provider.email) {
          user = await User.findOne({ email: provider.email.toLowerCase() });
          if (user && !provider.userId) {
            provider.userId = user._id;
            await provider.save();
          }
        }
      }
    }

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials. Please check your email/mobile and password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials. Please check your password." });
    }

    // Determine effective role & privileges
    const isUserAdmin = Boolean(user.isAdmin === true || user.role === 'admin');
    let effectiveRole = isUserAdmin ? 'admin' : (user.role || 'customer');

    // Check linked provider record
    let isProviderApproved = true;
    if (!isUserAdmin) {
      const provider = await Provider.findOne({
        $or: [{ userId: user._id }, { email: user.email }]
      });

      if (provider) {
        if (!provider.userId) {
          provider.userId = user._id;
          await provider.save();
        }

        if (provider.isApproved === true) {
          if (user.role !== 'provider') {
            user.role = 'provider';
            await user.save();
          }
          effectiveRole = 'provider';
          isProviderApproved = true;
        } else if (user.role === 'provider' || role === 'provider') {
          // Block login if provider account is still pending admin approval
          return res.status(403).json({
            success: false,
            isPendingApproval: true,
            message: "Your Service Provider account is pending Admin approval. You will receive a confirmation email once approved, and can then log in to your Provider Dashboard."
          });
        }
      }
    }

    // OTP verification check: If not verified, generate new OTP and return needsVerification
    if (!user.isVerified) {
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = newOtp;
      user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      void sendOtpEmail(user.email, `${newOtp} is your QuickServices verification code`, newOtp, "Login Verification");

      return res.status(401).json({
        success: false,
        needsVerification: true,
        email: user.email,
        message: "Your account is not verified yet. A new OTP has been sent to your email."
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        profilePic: user.profilePic,
        isAdmin: isUserAdmin,
        role: effectiveRole,
        isApproved: isProviderApproved
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
// ===================== UPDATE PROFILE =====================
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { username, email, mobile } = req.body;

    const currentUser = await User.findById(userId);
    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // --- Email Change: Send OTP to new email first, don't update yet ---
    const normalizedNewEmail = email ? email.trim().toLowerCase() : null;
    const emailChanging = normalizedNewEmail && normalizedNewEmail !== currentUser.email;

    if (emailChanging) {
      // Check no other account uses this email
      const taken = await User.findOne({ email: normalizedNewEmail, _id: { $ne: userId } });
      if (taken) {
        return res.status(400).json({ success: false, message: 'This email is already in use by another account.' });
      }

      // Generate OTP and store as pending
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      currentUser.pendingEmail = normalizedNewEmail;
      currentUser.pendingEmailOtp = otp;
      currentUser.pendingEmailOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);

      // Save non-email fields immediately
      if (username) currentUser.username = username.trim();
      if (mobile) {
        const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
        if (cleanMobile.length === 10) currentUser.mobile = cleanMobile;
      }
      if (req.file) currentUser.profilePic = `/uploads/${req.file.filename}`;
      await currentUser.save();

      // Send OTP to the NEW email
      const { html, text } = generateOtpTemplate(otp, 'Verify Your New Email Address');
      await sendEmail(
        normalizedNewEmail,
        `${otp} is your QuickServices email change code`,
        html,
        text
      );

      return res.status(200).json({
        success: true,
        emailChangePending: true,
        message: `A verification code has been sent to ${normalizedNewEmail}. Please verify to complete the email change.`,
        pendingEmail: normalizedNewEmail,
        user: {
          _id: currentUser._id,
          username: currentUser.username,
          email: currentUser.email, // still old email until confirmed
          mobile: currentUser.mobile,
          profilePic: currentUser.profilePic,
          isAdmin: currentUser.isAdmin,
          role: currentUser.role,
        },
      });
    }

    // --- Normal update (no email change) ---
    const updateData = {};
    if (username) updateData.username = username.trim();
    if (mobile) {
      const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
      if (cleanMobile.length === 10) updateData.mobile = cleanMobile;
    }
    if (req.file) updateData.profilePic = `/uploads/${req.file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: updatedUser,
    });

  } catch (error) {
    console.error('updateProfile error:', error?.message || error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ===================== CONFIRM EMAIL CHANGE OTP =====================
exports.confirmEmailChange = async (req, res) => {
  try {
    const userId = req.userId;
    const { otp } = req.body;

    if (!otp) {
      return res.status(400).json({ success: false, message: 'OTP required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.pendingEmail || !user.pendingEmailOtp) {
      return res.status(400).json({ success: false, message: 'No pending email change found.' });
    }

    const cleanOtp = String(otp).trim();
    const isValid =
      String(user.pendingEmailOtp).trim() === cleanOtp &&
      user.pendingEmailOtpExpiry &&
      user.pendingEmailOtpExpiry > new Date();

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP. Please try again.' });
    }

    // Apply the new email
    const newEmail = user.pendingEmail;
    user.email = newEmail;
    user.pendingEmail = null;
    user.pendingEmailOtp = null;
    user.pendingEmailOtpExpiry = null;
    await user.save();

    // Issue a fresh token with the new email
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.SECRET_KEY,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Email updated successfully. Please use your new email to log in.',
      token,
      user: {
        _id: user._id,
        id: user._id,
        username: user.username,
        email: user.email,
        mobile: user.mobile,
        profilePic: user.profilePic,
        isAdmin: user.isAdmin,
        role: user.role,
      },
    });

  } catch (error) {
    console.error('confirmEmailChange error:', error?.message || error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};


// ===================== SEND OTP (for login) =====================
exports.sendOTP = async (req, res) => {
  try {
    const { email, mobile } = req.body;

    if (!email || !mobile) {
      return res.status(400).json({ message: "Email and mobile required" });
    }

    const user = await User.findOne({ email, mobile });
    if (!user) return res.status(400).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    const { html, text } = generateOtpTemplate(otp, "Login Verification");
    await sendEmail(
      email,
      `${otp} is your QuickServices login code`,
      html,
      text
    );

    return res.status(200).json({ message: "OTP sent to your email" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};


// ===================== LOGOUT =====================
exports.logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ success: true, message: "Logged out" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===================== VERIFY OTP =====================
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const cleanOtp = String(otp || '').trim();

    if (user.isVerified) {
      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.SECRET_KEY,
        { expiresIn: "7d" }
      );
      return res.status(200).json({
        success: true,
        message: "Account already verified",
        token,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          mobile: user.mobile,
          profilePic: user.profilePic,
          isAdmin: user.isAdmin,
          role: user.role || 'customer'
        }
      });
    }

    const isValid = Boolean(user.otp)
      && String(user.otp).trim() === cleanOtp
      && user.otpExpiry
      && user.otpExpiry > new Date();
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP. Please try again.",
      });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const token = jwt.sign(
      { userId: user._id },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Account verified",
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        mobile: user.mobile,
        profilePic: user.profilePic,
        isAdmin: user.isAdmin,
        role: user.role || (user.isAdmin ? 'admin' : 'customer')
      },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ===================== RESEND OTP =====================
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ success: false, message: "Email required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    const emailSent = await sendOtpEmail(
      email,
      `${otp} is your QuickServices verification code`,
      otp,
      "New Verification Code"
    );

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send email. Please try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully to your email inbox.",
      emailSent: true,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
// ===================== VERIFY RESET OTP (for forgot password) =====================

exports.verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(400).json({ success: false, message: "User not found" });
    if (!user.otp || String(user.otp).trim() !== String(otp).trim() || !user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }
    // The OTP stays live until /reset-password consumes it, so that endpoint can
    // prove this request completed.
    return res.status(200).json({ success: true, message: "OTP verified" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
// ===================== FORGOT PASSWORD =====================
exports.forgotPass = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    const emailSent = await sendOtpEmail(
      normalizedEmail,
      `${otp} is your QuickServices password reset code`,
      otp,
      "Password Reset Code"
    );

    console.log(`Reset OTP generated for ${normalizedEmail}: ${otp} (emailSent: ${emailSent})`);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send reset password email. Please try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email inbox.",
      email: normalizedEmail,
      emailSent: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
// ===================== CHANGE PASSWORD (via token) =====================
exports.changePass = async (req, res) => {
  try {
    const { password, confirmPass } = req.body;
    const { token } = req.query;

    if (!token) return res.status(400).json({ message: "Token missing" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // 🔥 FIXED
    const userId = decoded.userId;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!password || !confirmPass || password !== confirmPass) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (!validateStrongPassword(password)) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long and contain at least one uppercase letter (A), one lowercase letter (a), one number (1), and one special character (@)."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({ message: "Password changed!" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
// ===================== CHANGE USERNAME / EMAIL (profile edit) =====================
exports.changeUsername = async (req, res) => {
  try {
    const userId = req.userId;
    const { username, email, mobile } = req.body;
    if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });
    if (!username || !email) return res.status(400).json({ success: false, message: "Username and email required" });
    const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
    if (existingEmail) return res.status(400).json({ success: false, message: "Email already in use" });
    const existingUsername = await User.findOne({ username, _id: { $ne: userId } });
    if (existingUsername) return res.status(400).json({ success: false, message: "Username taken" });
    const updateData = { username: username.trim(), email: email.trim(), mobile: mobile ? mobile.trim() : "" };
    if (req.file) {
      updateData.profilePic = `/uploads/${req.file.filename}`;
    }
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");
    return res.status(200).json({ success: true, message: "Profile updated", payload: updatedUser, profilePic: updatedUser.profilePic });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===================== VERIFY USER (token) =====================
exports.verifyUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("-password -otp -otpExpiry");
    if (user) return res.status(200).json({ message: "User Verified", payload: user });
    return res.status(400).json({ message: "User not found" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
// ===================== RESET PASSWORD (via OTP) =====================
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword, otp } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: "Email and new password required" });
    }
    if (!otp) {
      return res.status(400).json({ success: false, message: "Verification OTP required" });
    }

    if (!validateStrongPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long and contain at least one uppercase letter (A), one lowercase letter (a), one number (1), and one special character (@)."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (!user.otp || String(user.otp).trim() !== String(otp).trim() || !user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    // Clear OTP fields to prevent reuse
    user.otp = null;
    user.otpExpiry = null;
    await user.save();
    return res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
// ===================== VERIFY ADMIN =====================
exports.verifyAdmin = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ success: false, message: "User ID missing" });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (user.isAdmin === true) return res.status(200).json({ success: true, message: "Admin Verified", payload: user });
    return res.status(403).json({ success: false, message: "Only admin can access" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===================== GET ALL USERS (admin) =====================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "username email isAdmin isActive createdAt").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===================== DELETE USER (admin) =====================
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, message: "User deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===================== UPDATE USER STATUS (admin) =====================
exports.updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") return res.status(400).json({ success: false, message: "isActive must be boolean" });
    const user = await User.findByIdAndUpdate(userId, { isActive }, { new: true }).select("username email isAdmin isActive createdAt");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, message: "User status updated", data: user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===================== MAKE ADMIN =====================
exports.makeAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isAdmin = true;
    await user.save();
    res.status(200).json({ message: "User made admin", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// ===================== INITIALIZE FIRST ADMIN =====================
exports.initializeFirstAdmin = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ success: false, message: "User ID missing" });
    const existingAdmin = await User.findOne({ isAdmin: true });
    if (existingAdmin) return res.status(403).json({ success: false, message: "Admin already exists" });
    const user = await User.findByIdAndUpdate(userId, { isAdmin: true }, { new: true }).select("-password -otp -otpExpiry");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, message: "You are now admin", payload: user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ===================== ADDRESS MANAGEMENT =====================
exports.getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('addresses address');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    let addresses = user.addresses || [];
    if (addresses.length === 0 && user.address?.street) {
      const full = [user.address.street, user.address.city, user.address.state, user.address.pincode].filter(Boolean).join(', ');
      addresses = [{
        label: 'Home',
        fullAddress: full,
        city: user.address.city || 'Handwara',
        pincode: user.address.pincode || '',
        isDefault: true
      }];
    }
    return res.json({ success: true, addresses });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.addAddress = async (req, res) => {
  try {
    const { label, fullAddress, city, pincode, landmark, location, isDefault } = req.body;
    if (!fullAddress) return res.status(400).json({ success: false, message: 'Full address is required' });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!user.addresses) user.addresses = [];

    const shouldBeDefault = Boolean(isDefault || user.addresses.length === 0);
    if (shouldBeDefault) {
      user.addresses.forEach(a => { a.isDefault = false; });
    }

    user.addresses.push({
      label: label || 'Home',
      fullAddress,
      city: city || 'Handwara',
      pincode: pincode || '',
      landmark: landmark || '',
      location: location || {},
      isDefault: shouldBeDefault
    });

    await user.save();
    return res.json({ success: true, message: 'Address added successfully', addresses: user.addresses });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { label, fullAddress, city, pincode, landmark, location, isDefault } = req.body;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const address = user.addresses.id(addressId);
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });

    if (label !== undefined) address.label = label;
    if (fullAddress !== undefined) address.fullAddress = fullAddress;
    if (city !== undefined) address.city = city;
    if (pincode !== undefined) address.pincode = pincode;
    if (landmark !== undefined) address.landmark = landmark;
    if (location !== undefined) address.location = location;

    if (isDefault) {
      user.addresses.forEach(a => { a.isDefault = false; });
      address.isDefault = true;
    }

    await user.save();
    return res.json({ success: true, message: 'Address updated', addresses: user.addresses });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.addresses.pull({ _id: addressId });
    if (user.addresses.length > 0 && !user.addresses.some(a => a.isDefault)) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    return res.json({ success: true, message: 'Address deleted', addresses: user.addresses });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const target = user.addresses.id(addressId);
    if (!target) return res.status(404).json({ success: false, message: 'Address not found' });

    user.addresses.forEach(a => { a.isDefault = false; });
    target.isDefault = true;

    await user.save();
    return res.json({ success: true, message: 'Default address updated', addresses: user.addresses });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== USER NOTIFICATIONS =====================
exports.getUserNotifications = async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const userId = req.userId;
    const user = await User.findById(userId).select('role isAdmin');

    const query = {
      $or: [
        { recipient: userId }
      ]
    };

    if (user?.isAdmin || user?.role === 'admin') {
      query.$or.push({ recipientRole: 'admin' }, { recipientRole: 'all' });
    } else if (user?.role === 'provider') {
      query.$or.push({ recipientRole: 'provider', recipient: null });
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      ...query,
      read: false
    });

    return res.json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== USER SELF DELETE ACCOUNT =====================
exports.deleteMyAccount = async (req, res) => {
  try {
    const userId = req.userId;
    const { password } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (password) {
      const bcrypt = require('bcryptjs');
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ success: false, message: 'Incorrect password' });
    }

    const Booking = require('../models/Booking');
    const activeCount = await Booking.countDocuments({
      user: userId,
      status: { $in: ['pending', 'accepted', 'on-the-way', 'in-progress'] }
    });
    if (activeCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete account with active in-progress service bookings. Please cancel or wait for them to finish first.'
      });
    }

    await User.findByIdAndDelete(userId);
    return res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
