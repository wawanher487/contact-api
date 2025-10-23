const Product = require("../models/Product");
const path = require("path");
const fs = require("fs");

/**
 * @swagger
 * tags:
 *   name: Product
 *   description: API untuk manajemen produk
 */

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Membuat product baru (Admin only)
 *     tags: [Product]
 *     security:
 *       - BearerAuth: []
 *     description: menambahkan produk ke datatabe hanya bisa dilakukan oleh admin
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - stock
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Kopi Arabika"
 *               price:
 *                 type: number
 *                 example: 25000
 *               stock:
 *                 type: number
 *                 example: 20
 *               description:
 *                 type: string
 *                 example: "Kopi pilihan dari dataran tinggi Toraja"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Upload product image
 *     responses:
 *       201:
 *         description: ketika admin berhasil menambhkan produk
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Data product berhasil ditambahkan
 *                 Product:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "kopi"
 *                     price:
 *                       type: number
 *                       example: 25000
 *                     stock:
 *                       type: number
 *                       example: 50
 *                     description:
 *                       type: string
 *                       example: kopi asli dari garut
 *                     image:
 *                       type: string
 *                       example: product-1761184282410-500558913.png
 *                     _id:
 *                       type: string
 *                       example: 68f98a1a576f18e001edb142
 *                     createdAt:
 *                       type: string
 *                       example: 2025-10-23T01:51:22.414Z
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example:  Name dan Price wajib diisi
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example:  Token sudah kadarluasa
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

// menambahakkan produk baru
exports.createProduct = async (req, res) => {
  try {
    const { name, price, stock, description } = req.body;
    const image = req.file ? req.file.filename : null; //ambil nama file

    //validasi input
    if (!name || !price) {
      return res.status(400).json({
        message: "Name dan Price wajib diisi",
      });
    }

    //save product
    const newProduct = new Product({
      name,
      price,
      stock,
      description,
      image,
    });
    await newProduct.save();

    res.status(201).json({
      message: "Data product berhasil ditambahkan",
      Product: newProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Menampilkan semua produk (Admin & User)
 *     tags: [Product]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: menampilkan daftar produk
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Daftar semua produk
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 68ef087c2ecfcd8954142269
 *                       name:
 *                         type: string
 *                         example: terigu
 *                       price:
 *                         type: number
 *                         example: 20000
 *                       stock:
 *                         type: number
 *                         example: 10
 *                       description:
 *                         type: string
 *                         example: Terigu asli dari garut
 *                       image:
 *                         type: string
 *                         example: product-1760495740728-677988007.jpeg
 *                       createdAt:
 *                         type: string
 *                         example: 2025-10-15T02:35:40.733Z
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example:  Token sudah kadarluasa
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example:  Gagal mengambil data products
 */
//GET semua produk
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({
      message: "Daftar semua produk",
      products,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Gagal mengambil data products",
      err,
    });
  }
};

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Menampilkan detail produk
 *     tags: [Product]
 *     security:
 *       - BearerAuth: []
 *     description: "menampilkan detail produk berdasarkan id produk"
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Id produk yang ingin dilihat detailnya
 *     responses:
 *       200:
 *         description: Menampilkan detail produk
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Detail product dengan id 68ef09fe2ecfcd8954142277"
 *                 product:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 68ef09fe2ecfcd8954142277
 *                     name:
 *                       type: string
 *                       example: gula
 *                     price:
 *                       type: number
 *                       example: 25000
 *                     stock:
 *                       type: number
 *                       example: 25
 *                     description:
 *                       type: string
 *                       example: gula dari cianjur
 *                     image:
 *                       type: string
 *                       example: product-1760495740728-677988007.jpeg
 *                     createdAt:
 *                       type: string
 *                       example: 2025-10-15T02:35:40.733Z
 *
 *       404:
 *          description: ketika produk tidak ditemukan
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: "Product dengan id 68ef09fe2ecfcd8954142277 tidak ditemukan"
 *       401:
 *          description: ketika tidak memiliki acces token
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: Unauthorized, token tidak ditemukan
 *       500:
 *          descripton: ketika server error
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: Gagal mengambil data product
 */
//Get produk berdasarkan ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        message: `Product dengan id: ${id} tidak ditemukan`,
      });
    }

    res.status(200).json({
      message: `Detail product dengan id: ${id}`,
      product,
    });
  } catch (err) {
    res.status(500).json({
      message: "Gagal mengambil data product",
      err,
    });
  }
};

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update produk berdasarkan Id (Admin only)
 *     tags: [Product]
 *     security:
 *       - BearerAuth: []
 *     description: update detail produk dan gambar produk
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Kopi Robusta"
 *               price:
 *                 type: number
 *                 example: 30000
 *               stock:
 *                 type: number
 *                 example: 25
 *               description:
 *                 type: string
 *                 example: "Kopi robusta khas Lampung"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Upload foto produk baru
 *     responses:
 *       200:
 *         description: Product berhasil di update
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Produk berhasil diperbarui
 *                 product:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 68ef09fe2ecfcd8954142277
 *                     name:
 *                       type: string
 *                       example: produk baru
 *                     price:
 *                       type: number
 *                       example: 25000
 *                     stock:
 *                       type: number
 *                       example: 25
 *                     description:
 *                       type: string
 *                       example: produk baru dari cianjur
 *                     image:
 *                       type: string
 *                       example: product-1760495740728-677988007.jpeg
 *                     createdAt:
 *                       type: string
 *                       example: 2025-10-15T02:35:40.733Z
 *       404:
 *         description: Produk tidak ditemukan
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Produk dengan Id: 68e863c742885bcfb696752 tidak ditemukan"
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
 *                    example: "Gagal menghapus gambar lama atau Gagal memperbarui produk"
 */
//Update produk berdasarkan ID
exports.updateProductById = async (req, res) => {
  try {
    const { name, price, stock, description } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        message: `Produk dengan Id: ${req.params.id} tidak ditemukan`,
      });
    }

    //jika ada file baru (gambar baru)
    if (req.file) {
      //hapus gambar lama jika ada
      if (product.image) {
        const oldImagePath = path.join(
          __dirname,
          "../uploads/products",
          product.image
        );
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            return res
              .status(500)
              .json({ message: "Gagal menghapus gambar lama" });
          }
        });
      }
      //simpan gambar baru
      product.image = req.file.filename;
    }

    //ubah data
    product.name = name || product.name;
    product.price = price || product.price;
    product.stock = stock || product.stock;
    product.description = description || product.description;

    const updateProdcut = await product.save();
    res.json({
      message: "Produk berhasil diperbarui",
      product: updateProdcut,
    });
  } catch (err) {
    res.status(500).json({ message: "Gagal memperbarui produk" });
  }
};

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Hapus produk  (Admin only)
 *     tags: [Product]
 *     security:
 *       - BearerAuth: []
 *     description: "Hapus produk dan hapus gambar produk berdasarkan Id"
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product berhasil dihapus
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Product dibawah ini berhasil dihapu
 *                 product:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 68ef09fe2ecfcd8954142277
 *                     name:
 *                       type: string
 *                       example: produk hapus
 *                     price:
 *                       type: number
 *                       example: 25000
 *                     stock:
 *                       type: number
 *                       example: 25
 *                     description:
 *                       type: string
 *                       example: produk hapus dari cianjur
 *                     image:
 *                       type: string
 *                       example: product-1760495740728-677988007.jpeg
 *                     createdAt:
 *                       type: string
 *                       example: 2025-10-15T02:35:40.733Z
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
//Hapus produk
exports.deleteProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: `Product dengan Id: ${req.params.id} tidak ditemukan`,
      });
    }

    //Hapus gambar di folder uploads jika ada
    if (product.image) {
      //pastikan path sesuai dengan lokasi folder uploads
      const imagePath = path.join(
        __dirname,
        "../uploads/products",
        product.image
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

    //Hapus data product
    await product.deleteOne();
    res.json({
      message: "Product dibawah ini berhasil dihapus",
      product,
    });
  } catch (err) {
    console.error({ message: "Terjadi error pada fitur hapus", err });
    res.status(500).json({
      message: "Gagal menghapus product",
      err,
    });
  }
};
