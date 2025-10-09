const express = require("express");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProductById,
  deleteProductById,
} = require("../controllers/productController");
const uploadProduct = require("../config/multerProduct.config");

const router = express.Router();

//route tambah produk(hanya admin)
router.post(
  "/",
  authenticateToken,
  authorizeRole("admin"),
  uploadProduct.single("image"),
  createProduct
);

//ambil semua produk (admin & user)
router.get(
  "/",
  authenticateToken,
  authorizeRole("admin", "user"),
  getAllProducts
);

//ambil produk berdasarkan ID (admin & user)
router.get(
  "/:id",
  authenticateToken,
  authorizeRole("admin", "user"),
  getProductById
);

//update produck berdasarkan ID (hanya admin)
router.put(
  "/:id",
  authenticateToken,
  authorizeRole("admin"),
  uploadProduct.single("image"),
  updateProductById
);

//delete product berdasarkan ID (hanya admin)
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole("admin"),
  deleteProductById
);

module.exports = router;
