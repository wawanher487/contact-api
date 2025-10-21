const Cart = require("../models/carts");
const Product = require("../models/Product");

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
