const authorize = require("./authorize");

const admin = (req, res, next) => {
  authorize(req, res, () => {
    const { User } = require("../models/userModel");

    User.findById(req.userId)
      .then((user) => {
        if (user && user.isAdmin === true) {
          return next();
        }
        return res.status(403).json({
          success: false,
          message: "Admin access required"
        });
      })
      .catch(next);
  });
};

module.exports = admin;
