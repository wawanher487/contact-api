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
const upload = require("../config/multer.config");

const router = express.Router();

//route tambah produk(hanya admin)
router.post(
  "/",
  authenticateToken,
  authorizeRole("admin"),
  upload.single("image"),
  createProduct
);

//ambil semua produk (admin & user)
router.get("/", authenticateToken, getAllProducts);

//ambil produk berdasarkan ID (admin & user)
router.get("/:id", authenticateToken, getProductById);

//update produck berdasarkan ID (hanya admin)
router.put(
  "/:id",
  authenticateToken,
  authorizeRole("admin"),
  upload.single("image"),
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
