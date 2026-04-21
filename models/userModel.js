const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: { 
      type: String, 
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function(v) {
          return /^[0-9]{10}$/.test(v);
        },
        message: "Phone number must be 10 digits"
      }
    },
    profilePic: { 
      type: String, 
      default: "" 
    },
    role: {
      type: String,
      enum: ['user', 'provider', 'admin'],
      default: 'user'
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    otp: { 
      type: String 
    },
    otpExpiry: { 
      type: Date 
    },
    isVerified: { 
      type: Boolean, 
      default: false 
    },
    refreshToken: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);