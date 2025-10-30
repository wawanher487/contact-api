const Order = require("../models/order");
const Cart = require("../models/carts");
const Product = require("../models/Product");
const order = require("../models/order");

/**
 * @swagger
 * tags:
 *   name: Order
 *   description: API untuk manajemen Order
 */

/**
 * @swagger
 * /api/orders/checkout:
 *   post:
 *     summary: Menambahkan prouduk ke order
 *     tags: [Order]
 *     security:
 *       - BearerAuth: []
 *     description: melakukan checkout barang, produk di cart pindah ke order
 *     responses:
 *       201:
 *         description: checkout berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: checkout berhasil
 *                 order:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: 68eb190eb918b0fdcd30b6c6
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           productId:
 *                             type: string
 *                             example: 68ef087c2ecfcd8954142269
 *                           nameAtOrder:
 *                             type: string
 *                             example: Kopi Robusta
 *                           priceAtOrder:
 *                              type: number
 *                              example: 20000
 *                           quantity:
 *                             type: number
 *                             example: 1
 *                           _id:
 *                             type: string
 *                             example: 68f99a1e38cb0329f84960e4
 *                     total:
 *                       type: number
 *                       example: 20000
 *                     status:
 *                       type: number
 *                       example: pending
 *                     _id:
 *                       type: string
 *                       example: 68f9ae58ba1c242927d7add2
 *                     createdAt:
 *                       type: string
 *                       example: 2025-10-23T02:59:42.957Z
 *
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example:  "Keranjang kosong atau Stok produk gula tidak mencukupi"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example:  Token sudah kadaluarsa
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example:  Terjadi kesalahan server
 */
exports.checkout = async (req, res) => {
  try {
    //Ambil userId dari token user yang login (req.user.id).
    const userId = req.user.id;

    //Cari keranjang (Cart) milik user dan ambil detail produk (pakai populate).
    const cart = await Cart.findOne({ userId }).populate("items.productId");

    //Jika keranjang kosong → kirim pesan error.
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Keranjang kosong" });
    }

    // validasi dan pengurangan stock product
    for (const item of cart.items) {
      const product = item.productId;

      //cek stok cukup atau tidak
      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Stok produk "${product.name}" tidak mencukupi`,
        });
      }
      product.stock -= item.quantity;
      await product.save();
    }

    //hitung total harga
    const total = cart.items.reduce(
      (sum, item) => sum + item.productId.price * item.quantity,
      0
    );

    // buat order baru
    const newOrder = new Order({
      userId,
      items: cart.items.map((item) => ({
        productId: item.productId._id,
        nameAtOrder: item.productId.name,
        priceAtOrder: item.productId.price,
        quantity: item.quantity,
      })),
      total,
      status: "pending",
    });

    //Simpan Order ke database.
    await newOrder.save();

    //hapus cart setelah checkout
    await Cart.findOneAndDelete({ userId });

    //Kembalikan respons sukses beserta data order baru.
    res.status(201).json({
      message: "checkout berhasil",
      order: newOrder,
    });
  } catch (err) {
    console.error("checkout error", err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Menampilkan daftar order user
 *     tags: [Order]
 *     security:
 *       - BearerAuth: []
 *     description: Menampilkan daftar produk yang akan di order
 *     responses:
 *       200:
 *         description: menampilkan daftar pesanan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Berhasil mengambil semua pesanan
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 68f9b2466e293a42ec8ee3a3
 *                       userId:
 *                         type: string
 *                         example: 68eb190eb918b0fdcd30b6c6
 *                       items:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             productId:
 *                               type: object
 *                               properties:
 *                                 _id:
 *                                   type: string
 *                                   example: 68f98c0392595ac4d2f4ae06
 *                                 name:
 *                                   type: string
 *                                   example: kopi arabika
 *                                 price:
 *                                   type: string
 *                                   example: 25000
 *                                 image:
 *                                   type: string
 *                                   example: product-1761187552119-639684716.png
 *                             nameAtOrder:
 *                               type: string
 *                               example: Kopi Robusta
 *                             priceAtOrder:
 *                               type: number
 *                               example: 20000
 *                             quantity:
 *                               type: number
 *                               example: 1
 *                             _id:
 *                               type: string
 *                               example: 68f99a1e38cb0329f84960e4
 *                       total:
 *                         type: number
 *                         example: 20000
 *                       status:
 *                         type: number
 *                         example: pending
 *                       createdAt:
 *                         type: string
 *                         example: 2025-10-23T02:59:42.957Z
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example:  Token sudah kadaluarsa
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example:  Terjadi kesalahan server
 */
//tampilkan semua pesanan berdasarkan userId di jwt
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ userId })
      .populate("items.productId", "name price image")
      .sort({ createdAt: -1 });

    if (!orders.length) {
      return res.status(200).json({ message: "Belum ada pesanan", orders: [] });
    }

    res.status(200).json({
      message: "Berhasil mengambil semua pesanan",
      orders,
    });
  } catch (err) {
    console.error("Error getUserOrders", err);
    res.status(500).json({ message: " Terjadi kesalahan Server" });
  }
};

/**
 * @swagger
 * /api/orders/admin:
 *   get:
 *     summary: Menampilkan daftar order user untuk admin
 *     tags: [Order]
 *     security:
 *       - BearerAuth: []
 *     description: Menampilkan daftar produk yang akan di order
 *     responses:
 *       200:
 *         description: menampilkan daftar pesanan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Data orders berhasil ditampilkan
 *                 status:
 *                   type: number
 *                   example: 200
 *                 orders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 68f9b2466e293a42ec8ee3a3
 *                       userId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 69002b83fffb0787c6d013a1
 *                           name:
 *                             type: string
 *                             example: user
 *                           email:
 *                             type: string
 *                             example: user@gmail.com
 *                       items:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             productId:
 *                               type: object
 *                               properties:
 *                                 _id:
 *                                   type: string
 *                                   example: 68f98c0392595ac4d2f4ae06
 *                                 name:
 *                                   type: string
 *                                   example: kopi arabika
 *                                 price:
 *                                   type: string
 *                                   example: 25000
 *                                 image:
 *                                   type: string
 *                                   example: product-1761187552119-639684716.png
 *                             nameAtOrder:
 *                               type: string
 *                               example: Kopi Robusta
 *                             priceAtOrder:
 *                               type: number
 *                               example: 20000
 *                             quantity:
 *                               type: number
 *                               example: 1
 *                             _id:
 *                               type: string
 *                               example: 68f99a1e38cb0329f84960e4
 *                       total:
 *                         type: number
 *                         example: 20000
 *                       status:
 *                         type: number
 *                         example: pending
 *                       createdAt:
 *                         type: string
 *                         example: 2025-10-23T02:59:42.957Z
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example:  Token sudah kadaluarsa
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example:  Gagal Mengambil data orders
 */
//getAll orders khusus admin
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({
      message: "Data orders berhasil ditampilkan",
      status: 200,
      orders,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Gagal Mengambil data orders",
    });
  }
};

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Menampilkan order berdasarkan Id tersebut
 *     tags: [Order]
 *     security:
 *       - BearerAuth: []
 *     description: "Menampilkan daftar produk yang akan di order berdasarkan Id"
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Id per order
 *     responses:
 *       200:
 *         description: menampilkan daftar pesanan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Detail pesanan berhasil diambil
 *                 order:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 68f9b2466e293a42ec8ee3a3
 *                     userId:
 *                       type: string
 *                       example: 68eb190eb918b0fdcd30b6c6
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           productId:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: 68f98c0392595ac4d2f4ae06
 *                               name:
 *                                 type: string
 *                                 example: kopi arabika
 *                               price:
 *                                 type: string
 *                                 example: 20000
 *                               image:
 *                                 type: string
 *                                 example: product-1761187552119-639684716.png
 *                           nameAtOrder:
 *                             type: string
 *                             example: Kopi Robusta
 *                           priceAtOrder:
 *                             type: number
 *                             example: 20000
 *                           quantity:
 *                             type: number
 *                             example: 1
 *                           _id:
 *                             type: string
 *                             example: 68f99a1e38cb0329f84960e4
 *                     total:
 *                       type: number
 *                       example: 20000
 *                     status:
 *                       type: number
 *                       example: pending
 *                     createdAt:
 *                       type: string
 *                       example: 2025-10-23T02:59:42.957Z
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example:  Token sudah kadaluarsa
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example:  Terjadi kesalahan server
 */
//tampilkan detail satu pesanan
exports.getOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, userId }).populate(
      "items.productId",
      "name price image"
    );

    if (!order) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }

    res.status(200).json({
      message: "Detail pesanan berhasil diambil",
      order,
    });
  } catch (err) {
    console.error("Error getOrderById", err);
    res.status(500).json({ message: "Terjadi Kesalahan server" });
  }
};

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     summary: melakukan update status order
 *     tags: [Order]
 *     security:
 *       - BearerAuth: []
 *     description: "Admin melakukan update status order user berdasarkan Id order"
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Id per order
 *     requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - status
 *              properties:
 *                status:
 *                  type: string
 *                  example: completed
 *     responses:
 *       200:
 *         description: status order berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Status pesanan berhasil diperbarui
 *                 order:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 68f9b2466e293a42ec8ee3a3
 *                     userId:
 *                       type: string
 *                       example: 68eb190eb918b0fdcd30b6c6
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           productId:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: 68f98c0392595ac4d2f4ae06
 *                               name:
 *                                 type: string
 *                                 example: kopi arabika
 *                               price:
 *                                 type: string
 *                                 example: 20000
 *                           nameAtOrder:
 *                             type: string
 *                             example: Kopi Robusta
 *                           priceAtOrder:
 *                             type: number
 *                             example: 20000
 *                           quantity:
 *                             type: number
 *                             example: 1
 *                           _id:
 *                             type: string
 *                             example: 68f99a1e38cb0329f84960e4
 *                     total:
 *                       type: number
 *                       example: 20000
 *                     status:
 *                       type: number
 *                       example: pending
 *                     createdAt:
 *                       type: string
 *                       example: 2025-10-23T02:59:42.957Z
 *       400:
 *         description: validasi status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example:  Status tidak valid
 *       404:
 *         description: pesanan tidak ada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example:  Pesanan tidak ditemukan
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example:  Invalid Token
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example:  Terjadi kesalahan server
 */
//update order status oleh admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatus = ["pending", "processed", "paid", "shipped", "completed", "cancelled"];
    if (!validStatus.includes(status)) {
      return res
        .status(400)
        .json({ message: "Status tidak valid", validStatus });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("items.productId", "name price");

    if (!order) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }

    res.status(200).json({
      message: "Status pesanan berhasil diperbarui",
      order,
    });
  } catch (err) {
    console.error("Terjadi error updateOrderStatus", err);
    res.status(500).json({ message: "Terjadi Kesalahan server" });
  }
};

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: melakukan hapus order berdasrkan Id
 *     tags: [Order]
 *     security:
 *       - BearerAuth: []
 *     description: "Admin melakukan hapus  order user berdasarkan Id order"
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Id per order yang ingin dihapus
 *     responses:
 *       200:
 *         description: Hapus order berhasil
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order dibawah ini berhasil dihapus
 *                 order:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 68f9b2466e293a42ec8ee3a3
 *                     userId:
 *                       type: string
 *                       example: 68eb190eb918b0fdcd30b6c6
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           productId:
 *                             type: object
 *                             properties:
 *                               _id:
 *                                 type: string
 *                                 example: 68f98c0392595ac4d2f4ae06
 *                               name:
 *                                 type: string
 *                                 example: kopi arabika
 *                               price:
 *                                 type: string
 *                                 example: 20000
 *                           nameAtOrder:
 *                             type: string
 *                             example: Kopi Robusta
 *                           priceAtOrder:
 *                             type: number
 *                             example: 20000
 *                           quantity:
 *                             type: number
 *                             example: 1
 *                           _id:
 *                             type: string
 *                             example: 68f99a1e38cb0329f84960e4
 *                     total:
 *                       type: number
 *                       example: 20000
 *                     status:
 *                       type: number
 *                       example: pending
 *                     createdAt:
 *                       type: string
 *                       example: 2025-10-23T02:59:42.957Z
 *       404:
 *         description: pesanan tidak ada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example:  "Order dengan Id: 68f99a1e38cb0329f84960e4 tidak ditemukan"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example:  Invalid Token
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example:  Gagal menghapus order
 */
//delete  order berdasarkan Id khusu admin
exports.deleteOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        message: `Order dengan Id: ${req.params.id} tidak ditemukan`,
      });
    }

    //hapus data order
    await Order.deleteOne();
    res.json({
      message: "Order dibawah ini berhasil dihapus",
      order,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Gagal menghapus order",
    });
  }
};
