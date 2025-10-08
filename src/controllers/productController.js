const Product = require("../models/Product");

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
    res.status(500).json({ message: "Gagal memperbarui produk" });
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
