const User = require("../models/User");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

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

//update profile user(nama, email, foto) berdasarkan id
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    //validasai user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
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

    //simpan di database
    await user.save();
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
    console.error(err);
    res.status(500).json({
      message: "Gagal memperbarui profil",
    });
  }
};

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

//Hapus user + hapus foto profilnya berdasarkan id
exports.deleteUserById = async (req, res) => {
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
