const User = require("../models/User");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

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
 *     summary: Mendapatkan daftar semua user (admin & user)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Berhasil mendapatkan daftar semua user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Daftar semua user
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 652a3c7f0f8d123456789abc
 *                       name:
 *                         type: string
 *                         example: Wawan Hermawan
 *                       email:
 *                         type: string
 *                         example: wawan@example.com
 *                       role:
 *                         type: string
 *                         example: user
 *                       profileImage:
 *                         type: string
 *                         example: https://example.com/uploads/wawan.jpg
 *       401:
 *         description: Unauthorized - Token tidak ditemukan atau tidak valid
 *       500:
 *         description: Gagal mengambil data users
 */
//Tampilkan semua user
exports.getAllUser = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      message: "Daftar semua user",
      users,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Gagal mengambil data users",
    });
  }
};

/**
 * @swagger
 * /api/user/{id}:
 *   get:
 *     summary: Mendapatkan detail user berdasarkan ID (admin & user)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID user yang ingin diambil
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detail user berhasil ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Detail Profile dengan id: 652a3c7f0f8d123456789abc"
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 652a3c7f0f8d123456789abc
 *                     name:
 *                       type: string
 *                       example: Wawan Hermawan
 *                     email:
 *                       type: string
 *                       example: wawan@example.com
 *                     role:
 *                       type: string
 *                       example: user
 *                     profileImage:
 *                       type: string
 *                       example: https://example.com/uploads/wawan.jpg
 *       404:
 *         description: User tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User dengan Id: 652a3c7f0f8d123456789abc tidak ditemukan"
 *       401:
 *         description: Unauthorized - Token tidak valid atau tidak ditemukan
 *       500:
 *         description: Gagal mengambil data user
 */
//Get user berdasarkan Id
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        message: `User dengan Id: ${id} tidak ditemukan`,
      });
    }

    res.status(200).json({
      message: `Detail Profile dengan id: ${id}`,
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil data user" });
  }
};

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
//update profile user(nama, email, foto) berdasarkan id
exports.updateProfile = async (req, res) => {
  try {
    console.log("➡️ Mulai update profile...");

    const userId = req.user.id;
    const { name, email } = req.body;

    //validasai user
    const user = await User.findById(userId);
    if (!user) {
      console.log("❌ User tidak ditemukan");
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // Validasi email hanya jika email diubah
    if (email && email !== user.email) {
      console.log("🔍 Mengecek email:", email);
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        console.log("❌ Email sudah digunakan oleh user lain");
        return res.status(400).json({
          message: `Email ${email} sudah digunakan oleh user lain`,
        });
      }
    }

    //validasi gambar
    if (req.file) {
      console.log("🖼️ Mengupdate foto profil:", req.file.filename);
      //Hapus foto lama jika ada
      if (user.profileImage) {
        const oldImagePath = path.resolve("uploads/users", user.profileImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      user.profileImage = req.file.filename;
    }

    // update data
    user.name = name || user.name;
    user.email = email || user.email;

    //simpan di database
    await user.save();
    console.log("✅ Berhasil update profil:", user._id);

    res.json({
      message: "Profile berhasil diperbarui",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage || null,
      },
    });
  } catch (err) {
    console.error("Error update profile:", err);
    res.status(500).json({
      message: "Gagal memperbarui profil",
    });
  }
};

/**
 * @swagger
 * /api/user/password:
 *   patch:
 *     summary: Memperbarui password user (admin & user)
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
 *                 example: oldPassword123
 *               newPassword:
 *                 type: string
 *                 example: newPassword456
 *     responses:
 *       200:
 *         description: Password berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password berhasil diperbarui
 *       400:
 *         description: Password lama salah atau input tidak lengkap
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password lama salah
 *       404:
 *         description: User tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User tidak ditemukan
 *       401:
 *         description: Unauthorized - Token tidak valid atau tidak ditemukan
 *       500:
 *         description: Password gagal diperbarui karena kesalahan server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password gagal diperbarui
 */
//update password user
exports.updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Harap isi password lama dan baru",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "user tidak ditemukan",
      });
    }
    //cek apakah password lama sesuai
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Password lama salah",
      });
    }

    //sudah dihash di schema user jadi tinggal di update password baru
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      message: "Password berhasil diperbarui",
    });
  } catch (err) {
    console.error("Update password error:", err);
    res.status(500).json({
      message: "Password gagal diperbarui",
    });
  }
};

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
 *         description: Akun dan foto profil berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Akun dan foto berhasil dihapus
 *       404:
 *         description: User tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User tidak ditemukan
 *       401:
 *         description: Unauthorized - Token tidak valid atau tidak ditemukan
 *       500:
 *         description: Gagal menghapus user karena kesalahan server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Gagal menghapus user
 */
//Hapus user + hapus foto profilnya berdasarkan id
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    //validasi user
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    //validasi gambar
    if (user.profileImage) {
      const imagePath = path.join(
        __dirname,
        "../uploads/users",
        user.profileImage
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    //hapus dari database
    await User.deleteOne();

    res.json({
      message: "Akun dan foto berhasil dihapus",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal menghapus user" });
  }
};
