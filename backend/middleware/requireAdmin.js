const verifyToken = require("./verifyToken");

const requireAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    return next();
  });
};

module.exports = requireAdmin;
