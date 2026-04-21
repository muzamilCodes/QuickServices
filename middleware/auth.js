const jwt = require("jsonwebtoken");
const { User } = require("../models/userModel");

const protect = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token"
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found"
      });
    }
    
    req.userId = user._id;
    req.user = user;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      success: false,
      message: "Not authorized, token failed"
    });
  }
};

const admin = async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Admin access only"
    });
  }
};

module.exports = { protect, admin };