const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const TokenBlacklist = require("../models/TokenBlacklist");

/**
 * @swagger
 *  tags:
 *    name: Auth
 *    description: API untuk autentikasi register, login, and logout
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Untuk mendaftarkan user baru
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Wawan Hermawan
 *               email:
 *                 type: string
 *                 example: wawan@gmail.com
 *               password:
 *                 type: string
 *                 example: 123456
 *               role:
 *                 type: string
 *                 example: user
 *     responses:
 *       201:
 *         description: User berhasil register
 *         content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: User berhasil register
 *                  user:
 *                    type: object
 *                    properties:
 *                      id:
 *                        type: string
 *                        example: 12313k234kl32
 *                      name:
 *                        type: string
 *                        example: Wawan Hermawan
 *                      email:
 *                        type: string
 *                        example: wawan@gmail.com
 *                      role:
 *                        type: string
 *                        example: user
 *       400:
 *         description: name/email/password harus diisi atau Email sudah terdaftar
 *       500:
 *         description: Server Error
 */

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

/**
 * @swagger
 * /api/auth/login:
 *  post:
 *    summary: Login untuk mendapatkan access token serta refresh token
 *    tags: [Auth]
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - email
 *              - password
 *            properties:
 *              email:
 *                type: string
 *                example: user@gmail.com
 *              password:
 *                type: string
 *                example: 123456
 *    responses:
 *      200:
 *        description: Login berhasil
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                message:
 *                  type: string
 *                  example: Login berhasil
 *                token:
 *                  type: string
 *                  example: rwerdsajfoidsajfoidsa...
 *                refreshToken:
 *                  type: string
 *                  example: kjfdsafjiodsafssdfsa...
 *                user:
 *                  type: object
 *                  properties:
 *                    id:
 *                      type: string
 *                      example: 4234k3242kl234
 *                    name:
 *                      type: string
 *                      example: Wawan Hermawan
 *                    email:
 *                      type: string
 *                      example: wawan@gmail.com
 *                    role:
 *                      type: string
 *                      example: admin
 *      400:
 *        description: Email tidak ditemukan atau password salah
 *      500:
 *        description: Server Error
 */

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

    // buat acces token (1 jam)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "4h" }
    );

    // buat refresh tokne (7 hari)
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login berhasil",
      token,
      refreshToken,
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

/**
 * @swagger
 * /api/auth/logout:
 *    post:
 *      summary: Untuk Keluar dan menghapus access token
 *      tags: [Auth]
 *      security:
 *        - BearerAuth: []
 *      responses:
 *        200:
 *          description: Logout berhasil!!
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: Logout berhasil!!
 *        401:
 *          description: Token tidak ditemukan atau Token sudah logout, silahkan login ulang
 *        500:
 *          description: Gagal logout
 *
 */

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

//percabaan belum fix digunakan
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token diperlukan'" });
    }

    //verifikasi refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    //buat acces token baru
    const newAccesToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Acces token diperbarui",
      token: newAccesToken,
    });
  } catch (err) {
    console.error("Refresh error: ", err);
    res.status(403).json({
      message: "Refresh token tidak valid atau sudah kadarluarsa",
    });
  }
};
