const User = require("../models/User");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: API untuk manajemen user oleh admin
 */

/**
 * @swagger
 * /api/admin/user:
 *  post:
 *    summary: Membuat user/admin baru
 *    tags: [Admin]
 *    security:
 *      - BearerAuth: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - name
 *              - email
 *              - password
 *            properties:
 *              name:
 *                type: string
 *                description: Nama lengkap user
 *                example: Wawan Hermawan
 *              email:
 *                type: string
 *                description: Email user yang unik
 *                example: wawan@gmail.com
 *              password:
 *                type: string
 *                description: Password untuk aku user
 *                example: 123456
 *              role:
 *                type: string
 *                description: Role user (admin/user)
 *                example: admin
 *              profileImage:
 *                type: file
 *                format: binary
 *                description: Foto profi user (opsional)
 *    responses:
 *      201:
 *        description: User berhasil register
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: User berhasil register
 *                user:
 *                  type: object
 *                  properties:
 *                    name:
 *                      type: string
 *                      example: Wawan Hermawan
 *                    email:
 *                      type: string
 *                      example: wawan@gmail.com
 *                    password:
 *                      type: string
 *                      example: $2b$10$svlWC8SEZRHH...
 *                    role:
 *                      type: string
 *                      example: admin
 *                    profileImage:
 *                      type: string
 *                      example: profile-1761103909205-624035075.jpg
 *                    _id:
 *                      type: string
 *                      example: 68f850254322b206a83aefea
 *      400:
 *        description: name/email/password harus diisi atau Email sudah terdaftar
 *      500:
 *        description: Server Error"
 */
//create user
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const profileImage = req.file ? req.file.filename : null;

    //validasi input
    if (!name || !email || !password) {
      return res.status(400).json({
        message: `Field ${
          !name ? "name" : !email ? "email" : "password"
        } harus diisi`,
      });
    }

    //cek apakah email sudah terdaftar
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email sudah terdaftar" });
    }

    //buat user baru
    const newUser = new User({
      name,
      email,
      password,
      role: role || "user",
      profileImage,
    });
    // console.log(newUser);
    await newUser.save();

    res.status(201).json({
      message: "User berhasil register",
      user: newUser,
    });
  } catch (err) {
    console.error("terjadi kesalahan server", err);
    res.status(500).json({ message: "Server Error" });
  }
};

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
 *         description: Daftar semua user
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
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       password:
 *                         type: string
 *                       role:
 *                         type: string
 *                       profileImage:
 *                         type: string
 *       401:
 *         description: Token sudah logout, silahkan login ulang atau Unauthorized, token tidak ditemukan
 *       403:
 *         description: Akses ditolak (bukan admin)
 *       500:
 *         descrition: Gagal mengambil data users
 */
//Get semua user
exports.getAllUsers = async (req, res) => {
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
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: "Detail Profile dengan id: 68eb190eb918b0fdcd30b6c2"
 *                user:
 *                  type: object
 *                  properties:
 *                    _id:
 *                      type: string
 *                      example: 68eb190eb918b0fdcd30b6c2
 *                    name:
 *                      type: string
 *                      example: Wawan Hermawan
 *                    email:
 *                      type: string
 *                      example: wawan@gmail.com
 *                    password:
 *                      type: string
 *                      example: $2b$10$dsRhzr2KaVgGg...
 *                    role:
 *                      type: string
 *                      example: user
 *                    profileImage:
 *                      type: string
 *                      example: profile-1760244754941-247572582.png
 *       404:
 *         description: User tidak ditemukan
 *         content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: "User dengan Id: 68eb190eb918b0fdcd30b6c3 tidak ditemukan"
 *       401:
 *         description: Token tidak valid atau tidak ada
 *       403:
 *         description: Akses ditolak (bukan admin)
 *       500:
 *         descritption: Gagal mengambil data user
 */
//Get user berdasarkan Id
exports.getUser = async (req, res) => {
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
 *                 example: Wawan Hermawan
 *               email:
 *                 type: string
 *                 example: baru@gmail.com
 *               role:
 *                 type: string
 *                 example: user
 *               profileImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Berhasil memperbarui data user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profile berhasil diperbarui"
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 68e863c742885bcfb696752q
 *                     name:
 *                       type: string
 *                       example: Wawan Hermawan
 *                     email:
 *                       type: string
 *                       example: wawan@gmail.com
 *                     password:
 *                       type: string
 *                       example: $2b$10$yi.r0YI8...
 *                     role:
 *                       type: string
 *                       example: user
 *                     profileImage:
 *                       type: string
 *                       example: profile-1760060647935-755977594.jpg
 *       400:
 *         description: "Email sudah digunakan oleh user lain"
 *       401:
 *         description: Token tidak valid atau tidak ada
 *       404:
 *         description: User tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User dengan Id: 68e863c742885bcfb696753d tidak ditemukan"
 *       500:
 *         description: Gagal memperbarui profil
 */

//update profile user(nama, email, foto) berdasarkan id
exports.updateUserById = async (req, res) => {
  try {
    const { name, email, role } = req.body;

    //validasai user
    const user = await User.findById(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ message: `User dengan Id: ${req.params.id} tidak ditemukan` });
    }

    // Validasi email hanya jika email diubah
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({
          message: `Email ${email} sudah digunakan oleh user lain`,
        });
      }
    }

    //validasi gambar
    if (req.file) {
      //Hapus foto lama jika ada
      if (user.profileImage) {
        const oldImagePath = path.join(
          __dirname,
          "../uploads/users",
          user.profileImage
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      user.profileImage = req.file.filename;
    }

    // update data
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    //simpan di database
    const updateUser = await user.save();
    res.json({
      message: "Profile berhasil diperbarui",
      user: updateUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Gagal memperbarui profil",
    });
  }
};

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
 *               currentPassword:
 *                 type: string
 *                 example: 123456
 *               newPassword:
 *                 type: string
 *                 example: passwordbaru123
 *     responses:
 *       200:
 *         description: Password berhasil diperbarui
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: Password berhasil diperbarui
 *                user:
 *                  type: object
 *                  properties:
 *                    _id:
 *                      type: string
 *                      example: 68f850254322b206a53aefeq
 *                    name:
 *                      type: string
 *                      example: Wawan Hermawan
 *                    email:
 *                      type: string
 *                      example: wawan@gmail.com
 *                    password:
 *                      type: string
 *                      example: kE1nEFHzKnjB...
 *                    role:
 *                      type: string
 *                      example: admin
 *                    profileImage:
 *                      type: string
 *                      example: profile-1761103909205-624035075.jpg
 *       400:
 *         description: "Harap isi password lama dan baru atau Password lama salah"
 *       403:
 *         description: Invalid token
 *       404:
 *         description: User tidak ditemukan
 *       500:
 *         description: Password gagal diperbarui
 */
//update password user
exports.updatePassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Harap isi password lama dan baru",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: `User dengan Id: ${req.params.id} tidak ditemukan`,
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
    const updatePassword = await user.save();

    res.status(200).json({
      message: "Password berhasil diperbarui",
      user: updatePassword,
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
 *         content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: User dibawah ini berhasil dihapus
 *                  user:
 *                    type: object
 *                    properties:
 *                      _id:
 *                        type: string
 *                        example: 68f850254322b206a53aefeq
 *                      name:
 *                        type: string
 *                        example: Wawan Hermawan
 *                      email:
 *                        type: string
 *                        example: wawan@gmail.com
 *                      password:
 *                        type: string
 *                        example: kE1nEFHzKnjB...
 *                      role:
 *                        type: string
 *                        example: admin
 *                      profileImage:
 *                        type: string
 *                        example: profile-1761103909205-624035075.jpg
 *       404:
 *         description: User tidak ditemukan
 *       500:
 *         descripton: Terjadi kesalahan server, gagal menghapus file gambar atau Gagal menghapus User
 */
//Delete user berdasarkan id
exports.deleteUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: `User dengan Id: ${req.params.id} tidak ditemukan`,
      });
    }

    // Hapus gambar
    if (user.profileImage) {
      const imagePath = path.join(
        __dirname,
        "../uploads/users",
        user.profileImage
      );

      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error("Gagal menghapus file gambar", err);
          return res.status(500).json({
            message: "Terjadi kesalahan server, gagal menghapus file gambar",
            err,
          });
        }
      });
    }

    //Hapus data user
    await user.deleteOne();
    res.json({
      message: "User dibawah ini berhasil dihapus",
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Gagal menghapus User",
    });
  }
};
