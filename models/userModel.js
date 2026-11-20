const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    password: {
      type: String,
      required: true,
      minlength: 6
    },

    profilePic: { type: String },

    mobile: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /^[0-9]{10}$/.test(v);
        },
        message: "Mobile number must be 10 digits"
      }
    },

    isAdmin: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    role: {
      type: String,
      enum: ['customer', 'provider', 'admin'],
      default: 'customer'
    },

    address: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String }
    },

    addresses: [
      {
        label: { type: String, default: 'Home' },
        fullAddress: { type: String, required: true },
        city: { type: String, default: 'Handwara' },
        pincode: { type: String },
        landmark: { type: String },
        location: {
          lat: { type: Number },
          lng: { type: Number }
        },
        isDefault: { type: Boolean, default: false }
      }
    ],

    otp: { type: String },
    otpExpiry: { type: Date },
    isVerified: { type: Boolean, default: false },

    // Email change verification fields
    pendingEmail: { type: String, default: null },      // new email waiting for OTP confirm
    pendingEmailOtp: { type: String, default: null },   // OTP sent to new email
    pendingEmailOtpExpiry: { type: Date, default: null },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

module.exports = { User };
