const Order = require("../models/order");
const Cart = require("../models/carts");
const Product = require("../models/Product");

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
