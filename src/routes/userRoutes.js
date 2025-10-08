const express = require("express");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");
const router = express.Router();

//contoh route hanya bisa diakses setelah login
router.get("/profile", authenticateToken, (req, res) => {
  res.json({
    message: "Profile Anda",
    user: req.user,
  });
});

//contoh route hanya bisa diakses oleh admin
router.get("/admin", authenticateToken, authorizeRole("admin"), (req, res) => {
  res.json({
    message: "Halo Admin, Anda bisa mengakses route ini",
    user: req.user,
  });
});

module.exports = router;
