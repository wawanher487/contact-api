const Product = require("../models/Product");
const path = require("path");
const fs = require("fs");

// menambahakkan produk baru
exports.createProduct = async (req, res) => {
  try {
    const { name, price, description } = req.body;
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
    res.status(500).json({ message: "Terjadi kesalahan server", error });
  }
};

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
      message: "Gagal mengambil data product",
      err,
    });
  }
};

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

//Update produk berdasarkan ID
exports.updateProductById = async (req, res) => {
  try {
    const { name, price, description } = req.body;

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
        const oldImagePath = path.join(__dirname, "../uploads", product.image);
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            return res
              .status(500)
              .json({ message: "Gagal menghapus gambar lama", err });
          }
        });
      }
      //simpan gambar baru
      product.image = req.file.filename;
    }

    //ubah data
    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;

    const updateProdcut = await product.save();
    res.json({
      message: "Produk berhasil diperbarui",
      product: updateProdcut,
    });
  } catch (err) {
    res.status(500).json({ message: "Gagal memperbarui produk", err });
  }
};

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
      const imagePath = path.join(__dirname, "../uploads", product.image);

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
    res.status(500).json({
      message: "Gagal menghapus product",
      err,
    });
  }
};
