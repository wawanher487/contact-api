const Cart = require("../models/carts");
const Product = require("../models/Product");

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: API untuk manajemen Cart
 */

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Menampilkan semua produk di cart user
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: menampilkan daftar produk di cart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Berhasil mengambil cart
 *                 cart:
 *                   type: object
 *                   properties:
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
 *                                 example: 68ef087c2ecfcd8954142269
 *                               name:
 *                                 type: string
 *                                 example: terigu
 *                               price:
 *                                 type: number
 *                                 example: 20000
 *                               stock:
 *                                 type: number
 *                                 example: 10
 *                               description:
 *                                 type: string
 *                                 example: Terigu asli dari garut
 *                               image:
 *                                 type: string
 *                                 example: product-1760495740728-677988007.jpeg
 *                               createdAt:
 *                                 type: string
 *                                 example: 2025-10-15T02:35:40.733Z
 *                           nameAtAdded:
 *                             type: string
 *                             example: Kopi Robusta
 *                           priceAtAdded:
 *                             type: number
 *                             example: 30000
 *                           quantity:
 *                              type: number 10
 *                           _id:
 *                             type: string
 *                             example: 68f99a1e38cb0329f84960e4
 *                     total:
 *                       type: number
 *                       example: 500000
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
//Lihat isi cart user
exports.getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    //cari cart user dan populate detail produk
    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart) {
      return res.status(200).json({
        message: "Cart masih kosong",
        cart: { items: [], total: 0 },
      });
    }

    //hitung total harga
    const total = cart.items.reduce(
      (sum, item) => sum + item.priceAtAdded * item.quantity,
      0
    );

    res.status(200).json({
      message: "Berhasil mengambil cart",
      cart: {
        items: cart.items,
        total,
      },
    });
  } catch (err) {
    console.error("Error getCart: ", err),
      res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Menambahkan prouduk ke cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     description: menambahkan produk ke cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 example: 68ef087c2ecfcd8954142269
 *               quantity:
 *                 type: number
 *                 example: 1
 *     responses:
 *       200:
 *         description: user berhasil menambahkan produk ke cart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Produk berhasil ditambahkan ke cart
 *                 cart:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 68f99a1e38cb0329f84960e3
 *                     userId:
 *                       type: string
 *                       example: 68e7621e865abdc2709ef10a
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           productId:
 *                             type: string
 *                             example: 68ef087c2ecfcd8954142269
 *                           nameAtAdded:
 *                             type: string
 *                             example: Kopi Robusta
 *                           priceAtAdde:
 *                             type: number
 *                             example: 20000
 *                           quantity:
 *                             type: number
 *                             example: 1
 *                           _id:
 *                             type: string
 *                             example: 68f99a1e38cb0329f84960e4
 *                     createdAt:
 *                       type: string
 *                       example: 2025-10-23T02:59:42.957Z
 *                     updatedAt:
 *                       type: string
 *                       example: 2025-10-23T03:29:05.286Z
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
 *                   example:  "Produk dan quantity wajib diisi atau Stok produk tidak mencukupi"
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
//tambah produk ke cart
exports.addToCart = async (req, res) => {
  try {
    //Ambil user ID dari token JWT
    const userId = req.user.id;

    //Ambil data dari body request
    const { productId, quantity } = req.body;

    //validasi input
    if (!productId || !quantity || quantity <= 0) {
      return res
        .status(400)
        .json({ message: "Produk dan quantity wajib diisi" });
    }

    //cek apakah produk ada
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    //cek stok cukup atau tidak
    if (product.stock < quantity) {
      return res.status(400).json({ message: "Stok produk tidak mencukupi" });
    }

    //cari cart user
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      //jika belum ada cart, buat baru
      cart = new Cart({ userId, items: [] });
    }

    // cek apakah produk sudah ada di cart
    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    //jika produk sudah ada, update quantity
    if (existingItem) {
      existingItem.quantity += quantity;

      //cegah melebihi stok
      if (existingItem.quantity > product.stock) {
        return res
          .status(400)
          .json({ message: "Jumlah melebihi stok tersedia" });
      }
    } else {
      //jika belum ada, tambahkan produk baru ke cart
      cart.items.push({
        productId,
        nameAtAdded: product.name,
        priceAtAdded: product.price,
        quantity,
      });
    }

    //simpan cart
    await cart.save();

    //kirim response ke user
    res.status(200).json({
      message: "Produk berhasil ditambahkan ke cart",
      cart,
    });
  } catch (err) {
    console.error("Error addToCart: ", err);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

/**
 * @swagger
 * /api/cart/{id}:
 *   patch:
 *     summary: Update produk di cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     description: update quantity produk yang di cart
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product Id yang ada di cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *                 example: 1
 *     responses:
 *       200:
 *         description: Quantity produk di cart berhasil diperbarui
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Quantity berhasil diperbarui
 *                 cart:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 68f9a48d57f7cc8c51322fbe
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
 *                           nameAtAdded:
 *                             type: string
 *                             example: Kopi Baru
 *                           priceAtAdded:
 *                             type: number
 *                             example: 30000
 *                           quantity:
 *                             type: number
 *                             example: 1
 *                           _id:
 *                             type: string
 *                             example: 68f9a48d57f7cc8c51322fbf
 *                     createdAt:
 *                       type: string
 *                       example: 2025-10-23T03:44:13.823Z
 *                     updatedAt:
 *                       type: string
 *                       example: 2025-10-23T03:53:02.835Z
 *       404:
 *         description: Produk dikeranjang tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Keranjang tidak ditemukan atau Item tidak ditemukan di keranjang"
 *       400:
 *         description: validasi error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Quantity minimal 1 atau umlah melebihi stok tersedia
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized, token tidak ditemukan
 *       500:
 *         description: Gagal melakukan update
 *         content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: Terjadi kesalahan server
 */
exports.updateCartItem = async (req, res) => {
  try {
    //Ambil data dari request
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    //validasi input
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity minimal 1" });
    }

    //cari cart user
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Keranjang tidak ditemukan" });
    }

    //cari item berdasarkan itemId
    const item = cart.items.id(itemId);
    if (!item) {
      return res
        .status(404)
        .json({ message: "Item tidak ditemukan di keranjang" });
    }

    //cek stok produk di database
    const product = await Product.findById(item.productId);
    if (!product) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    //validasi quantity
    if (quantity > product.stock) {
      return res.status(400).json({ message: "Jumlah melebihi stok tersedia" });
    }

    //update quantity
    item.quantity = quantity;

    //simpan di cart
    await cart.save();

    //kirim response
    res.status(200).json({
      message: "Quantity berhasil diperbarui",
      cart,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi kesalahan server", err });
  }
};

/**
 * @swagger
 * /api/cart/{id}:
 *   delete:
 *     summary: Hapus produk yang di cart
 *     tags: [Cart]
 *     security:
 *       - BearerAuth: []
 *     description: Hapus produk yang ada di cart
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Id yang ada di cart
 *     responses:
 *       200:
 *         description: Product di cart berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Item berhasil dihapus dari keranjang
 *                 cart:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 68f9a48d57f7cc8c51322fbe
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
 *                                 example: 68ef087c2ecfcd8954142269
 *                               name:
 *                                 type: string
 *                                 example: kopi Baru
 *                               price:
 *                                 type: number
 *                                 example: 30000
 *                               stock:
 *                                 type: number
 *                                 example: 50
 *                               description:
 *                                 type: string
 *                                 example: kopi asli garut
 *                               image:
 *                                 type: string
 *                                 example: product-1760496126420-712349872.png
 *                               createdAt:
 *                                 type: string
 *                                 example: 2025-10-15T02:42:06.421Z
 *                           nameAtAdded:
 *                             type: string
 *                             example: Kopi Baru
 *                           priceAtAdded:
 *                             type: number
 *                             example: 30000
 *                           quantity:
 *                             type: number
 *                             example: 1
 *                           _id:
 *                             type: string
 *                             example: 68f9a48d57f7cc8c51322fbf
 *                     createdAt:
 *                       type: string
 *                       example: 2025-10-23T03:44:13.823Z
 *                     updatedAt:
 *                       type: string
 *                       example: 2025-10-23T03:53:02.835Z
 *       404:
 *         description: Product tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product dengan Id: 68f850254322b206a53aefe tidak ditemukan"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized, token tidak ditemukan
 *       500:
 *         description: Terjadi error pada server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Gagal menghapus product
 */
exports.deleteCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    //cari user
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart) {
      return res.status(404).json({ message: "Keranjang tidak ditemukan" });
    }

    //cari index item yang ingin dihapus
    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ message: "Item tidak ditemukan di keranjang" });
    }

    //Hapus item berdasarkan index
    cart.items.splice(itemIndex, 1);

    //update total setelah dihapus
    cart.total = cart.items.reduce(
      (sum, item) => sum + item.priceAtAdded * item.quantity,
      0
    );
    await cart.save();

    //kirim response;
    res.status(200).json({
      message: "Item berhasil dihapus dari keranjang",
      cart,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Terjadi Kesalahan server", err });
  }
};
