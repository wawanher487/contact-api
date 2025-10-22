const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  logout,
  refreshToken,
} = require("../controllers/authController");
const {
  adminOnly,
  authenticateToken,
} = require("../middleware/authMiddleware");

//route register
router.post("/register", registerUser);

//route login
router.post("/login", loginUser);

//route refresh token
router.post("/refresh", refreshToken);

//route logout
router.post("/logout", authenticateToken, logout);

//route profile (protected)
router.get("/profile", authenticateToken, (req, res) => {
  res.json({
    message: "Berhasil mengakses profile",
    user: req.user,
  });
});

//route login admin
router.get("/admin", authenticateToken, adminOnly, (req, res) => {
  res.json({
    message: "Berhasil mengakses route admin",
    user: req.user,
  });
});

module.exports = router;
