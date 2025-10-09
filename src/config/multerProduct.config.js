const multer = require("multer");
const path = require("path");

//konfigurasi penyimpanan
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/uploads/products"); //simpan di folder ini
  },
  filename: function (req, file, cb) {
    //ubah nama file agar unik
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "product-" + uniqueSuffix + path.extname(file.originalname));
  },
});

//Filter file yang bole diupload
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extName = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimeType = allowedTypes.test(file.mimetype.toLowerCase());

  if (extName && mimeType) {
    cb(null, true);
  } else {
    cb(new Error("Hanya gambar (jpeg, jpg, dan png) yang diperbolehkan!"));
  }
};

//Buat instance multer
const uploadProduct = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // maksimal 2mb
});

module.exports = uploadProduct;
