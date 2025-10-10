const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const TokenBlacklist = require("../models/TokenBlacklist");

//Controler untuk register user
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

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
    const newUser = new User({ name, email, password, role: role || "user" });
    await newUser.save();

    res.status(201).json({
      message: "User berhasil register",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error });
  }
};

//Controler untuk login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    //validasi input
    if (!email || !password) {
      return res.status(400).json({
        message: `Field ${!email ? "email" : "password"} harus diisi`,
      });
    }

    // cari user berdasarkan email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Email tidak ditemukan",
      });
    }

    // cek password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Password salah",
      });
    }

    // buat token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login berhasil",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error });
  }
};

exports.logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Token tidak ditemukan",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.decode(token);
    const expiredAt = new Date(decoded.exp * 1000);

    await TokenBlacklist.create({ token, expiredAt });

    res.status(200).json({ message: "Logout berhasil!!" });
  } catch (err) {
    console.error("Logout error", err);
    res.status(500).json({ message: "Gagal logout" });
  }
};
