const jwt = require("jsonwebtoken");

//middleware untuk verifikasi token
exports.authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    //cek apakah header authorization ada dan format sesuai
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Unauthorized, token tidak ditemukan",
      });
    }

    //ambil token dari header setelah kata "Bearer"
    const token = authHeader.split(" ")[1];

    //verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //simpan data user ke req.user agar bisa dipakai dicontroller
    req.user = decoded;

    next();
  } catch (error) {
    console.error(error);
    res.status(403).json({
      message: "Unauthorized, token tidak valid atau sudah kadaluarsa",
    });
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
