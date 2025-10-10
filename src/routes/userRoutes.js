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

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API untuk manajemen data pengguna (admin & user)
 */

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Ambil semua user (admin & user)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Daftar semua user
 *       401:
 *         description: Unauthorized
 */

//Ambil semua user (admin & user)
router.get("/", authenticateToken, authorizeRole("admin", "user"), getAllUser);

/**
 * @swagger
 * /api/user/{id}:
 *   get:
 *     summary: Ambil user berdasarkan ID (admin & user)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID user yang ingin diambil
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detail user berdasarkan ID
 *       404:
 *         description: User tidak ditemukan
 *       401:
 *         description: Unauthorized
 */

//Ambil user berdasarkan Id (admin & user)
router.get(
  "/:id",
  authenticateToken,
  authorizeRole("admin", "user"),
  getUserById
);

/**
 * @swagger
 * /api/user/profile:
 *   patch:
 *     summary: Update profil user (admin & user)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Wawan Hermawan"
 *               email:
 *                 type: string
 *                 example: "wawan@example.com"
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: Upload foto profil baru
 *     responses:
 *       200:
 *         description: Profil berhasil diperbarui
 *       400:
 *         description: Email sudah digunakan
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User tidak ditemukan
 */

//update profile (admin & user)
router.patch(
  "/profile",
  authenticateToken,
  authorizeRole("user", "admin"),
  uploadUser.single("profileImage"),
  updateProfile
);

/**
 * @swagger
 * /api/user/password:
 *   patch:
 *     summary: Update password user (admin & user)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: "oldPassword123"
 *               newPassword:
 *                 type: string
 *                 example: "newPassword456"
 *     responses:
 *       200:
 *         description: Password berhasil diperbarui
 *       400:
 *         description: Password lama salah atau input tidak lengkap
 *       404:
 *         description: User tidak ditemukan
 *       401:
 *         description: Unauthorized
 */

//update password (admin & user)
router.patch(
  "/password",
  authenticateToken,
  authorizeRole("user", "admin"),
  updatePassword
);

/**
 * @swagger
 * /api/user/delete:
 *   delete:
 *     summary: Hapus akun user (admin & user)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Akun berhasil dihapus
 *       404:
 *         description: User tidak ditemukan
 *       401:
 *         description: Unauthorized
 */

// delete user (admin & user)
router.delete(
  "/delete",
  authenticateToken,
  authorizeRole("admin", "user"),
  deleteUser
);

module.exports = router;
