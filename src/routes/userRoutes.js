const express = require("express");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");
const uploadUser = require("../config/multerUser.config");
const {
  updatePassword,
  getAllUser,
  getUserById,
  updateProfile,
  deleteUser,
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
  deleteUser
);

module.exports = router;
