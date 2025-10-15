/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: User berhasil register
 *       400:
 *         description: Email sudah terdaftar
 *
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user dan dapatkan token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login berhasil
 *       400:
 *         description: Email tidak ditemukan
 *
 *
 *
 *
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user dan blacklist token
 *     description: Endpoint ini digunakan untuk logout user dengan cara memasukkan token ke dalam daftar blacklist. Hanya bisa diakses oleh user yang sudah login.
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []       # Wajib, karena endpoint ini perlu token JWT
 *     responses:
 *       200:
 *         description: Logout berhasil
 *         content:
 *           application/json:
 *             example:
 *               message: "Logout berhasil!!"
 *       401:
 *         description: Token tidak ditemukan atau tidak valid
 *         content:
 *           application/json:
 *             example:
 *               message: "Unauthorized, token tidak ditemukan"
 *       500:
 *         description: Kesalahan server saat logout
 *         content:
 *           application/json:
 *             example:
 *               message: "Gagal logout"
 */

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
