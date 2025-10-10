/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: API untuk manajemen user oleh admin
 */

/**
 * @swagger
 * /api/admin:
 *   get:
 *     summary: Mendapatkan semua user
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan daftar user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   role:
 *                     type: string
 *       401:
 *         description: Unauthorized (token tidak ditemukan)
 *       403:
 *         description: Akses ditolak (bukan admin)
 */

/**
 * @swagger
 * /api/admin/{id}:
 *   get:
 *     summary: Mendapatkan detail user berdasarkan ID
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID user yang ingin dilihat
 *     responses:
 *       200:
 *         description: Detail user ditemukan
 *       404:
 *         description: User tidak ditemukan
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Akses ditolak
 */

/**
 * @swagger
 * /api/admin/user/{id}:
 *   patch:
 *     summary: Memperbarui data user berdasarkan ID
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID user yang ingin diperbarui
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Berhasil memperbarui data user
 *       400:
 *         description: Data tidak valid
 *       404:
 *         description: User tidak ditemukan
 */

/**
 * @swagger
 * /api/admin/password/{id}:
 *   patch:
 *     summary: Mengubah password user berdasarkan ID
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID user yang ingin diubah password-nya
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword:
 *                 type: string
 *                 example: passwordbaru123
 *     responses:
 *       200:
 *         description: Password berhasil diperbarui
 *       400:
 *         description: Password tidak valid
 *       404:
 *         description: User tidak ditemukan
 */

/**
 * @swagger
 * /api/admin/delete/{id}:
 *   delete:
 *     summary: Menghapus user berdasarkan ID
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID user yang ingin dihapus
 *     responses:
 *       200:
 *         description: User berhasil dihapus
 *       404:
 *         description: User tidak ditemukan
 */

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
