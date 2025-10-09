const express = require("express");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");
const uploadUser = require("../config/multerUser.config");
const {
  updatePassword,
  deleteUserById,
  getAllUser,
  getUserById,
  updateProfile,
} = require("../controllers/userController");
const router = express.Router();

//Ambil semua user (admin & user)
router.get("/", authenticateToken, authorizeRole("admin", "user"), getAllUser);

//Ambil user berdasarkan Id (admin & user)
router.get(
  "/:id",
  authenticateToken,
  authorizeRole("admin", "user"),
  getUserById
);

//update profile (admin & user)
router.patch(
  "/profile",
  authenticateToken,
  authorizeRole("user", "admin"),
  uploadUser.single("profileImage"),
  updateProfile
);

//update password (admin & user)
router.patch(
  "/password",
  authenticateToken,
  authorizeRole("user", "admin"),
  updatePassword
);

// delete user (admin & user)
router.delete(
  "/delete",
  authenticateToken,
  authorizeRole("admin", "user"),
  deleteUserById
);

//contoh route hanya bisa diakses setelah login
router.get("/profile", authenticateToken, (req, res) => {
  res.json({
    message: "Profile Anda",
    user: req.user,
  });
});

module.exports = router;
