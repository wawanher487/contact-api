const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");
const {
  protect,
  adminOnly,
  authenticateToken,
} = require("../middleware/authMiddleware");

//route register
router.post("/register", registerUser);
router.post("/login", loginUser);

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
