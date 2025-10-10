const uploadUser = require("../config/multerUser.config");
const {
  getAllUsers,
  getUser,
  updateUserById,
  updatePassword,
  deleteUserById,
} = require("../controllers/adminController");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();

//route tampilkan semua users
router.get("/", authenticateToken, authorizeRole("admin"), getAllUsers);

// route teampilkan berdasarkan Id
router.get("/:id", authenticateToken, authorizeRole("admin"), getUser);

//update user berdasarkan Id
router.patch(
  "/user/:id",
  authenticateToken,
  authorizeRole("admin"),
  uploadUser.single("profileImage"),
  updateUserById
);

router.patch(
  "/password/:id",
  authenticateToken,
  authorizeRole("admin"),
  updatePassword
);

router.delete(
  "/delete/:id",
  authenticateToken,
  authorizeRole("admin"),
  deleteUserById
);

module.exports = router;
