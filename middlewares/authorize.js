

const jwt = require("jsonwebtoken");
require("dotenv").config();

const authorize = (req, res, next) => {
  try {
    if (req.userId) {
      return next();
    }

    let token;
    
    // Get token from Authorization header or cookies
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized - No token provided" 
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log("Token verified, userId:", decoded.userId);
    req.userId = decoded.userId || decoded.id;
    
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(401).json({ 
      success: false, 
      message: "Invalid or expired token" 
    });
  }
};

module.exports = authorize;