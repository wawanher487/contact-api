const User = require("../models/User");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

//Get semua produk
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
      err,
    });
  }
};

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
