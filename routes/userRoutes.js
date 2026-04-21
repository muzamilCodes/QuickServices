const express = require("express");
const controller = require("../controllers/userController");
const { protect, admin } = require("../middleware/auth");
const router = express.Router();

// Public routes
router.post("/register", controller.register);
router.post("/verify-otp", controller.verifyOTP);
router.post("/login", controller.login);
router.post("/send-login-otp", controller.sendLoginOTP);
router.post("/verify-login-otp", controller.verifyLoginOTP);
router.post("/forgot-password", controller.forgotPassword);
router.post("/reset-password", controller.resetPassword);
router.post("/refresh-token", controller.refreshToken);

// Protected routes (require login)
router.get("/profile", protect, controller.getProfile);
router.put("/profile", protect, controller.updateProfile);
router.post("/logout", protect, controller.logout);

// Admin routes
router.get("/admin/users", protect, admin, controller.getAllUsers);
router.put("/admin/users/:userId", protect, admin, controller.updateUserStatus);
router.delete("/admin/users/:userId", protect, admin, controller.deleteUser);

module.exports = router;