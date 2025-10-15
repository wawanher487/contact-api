const jwt = require("jsonwebtoken");
const TokenBlacklist = require("../models/TokenBlacklist");

//middleware untuk verifikasi token
exports.authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized, token tidak ditemukan" });
    }

    const token = authHeader.split(" ")[1];

    //cek apakah token sudah diblacklist
    const isBlacklisted = await TokenBlacklist.findOne({ token });
    if (isBlacklisted) {
      return res
        .status(401)
        .json({ message: "Token sudah logout, silahkan login ulang" });
    }

    //verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Simpan data user di req.user (id & role)
    req.user = decoded;
    next();
  } catch (error) {
    console.error("JWT error:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired",
      });
    }
    res.status(403).json({ message: "Invalid token" });
  }
};

//middleware untuk role-based access control
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Akses ditolak, hanya untuk admin" });
  }
};

//auth Role
exports.authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message:
          "Akses ditolak, Anda tidak memiliki izin untuk mengakses resource ini",
      });
    }
    next();
  };
};
