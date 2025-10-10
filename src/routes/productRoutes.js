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

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: API for managing products
 */

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product (Admin only)
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     description: Add a new product to the database. Only accessible by admin.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Kopi Arabika"
 *               price:
 *                 type: number
 *                 example: 25000
 *               description:
 *                 type: string
 *                 example: "Kopi pilihan dari dataran tinggi Toraja"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Upload product image
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */

//route tambah produk(hanya admin)
router.post(
  "/",
  authenticateToken,
  authorizeRole("admin"),
  uploadProduct.single("image"),
  createProduct
);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products (Admin & User)
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     description: Retrieve a list of all available products.
 *     responses:
 *       200:
 *         description: List of all products
 *       401:
 *         description: Unauthorized
 */

//ambil semua produk (admin & user)
router.get(
  "/",
  authenticateToken,
  authorizeRole("admin", "user"),
  getAllProducts
);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID (Admin & User)
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     description: Retrieve details of a product by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 *       401:
 *         description: Unauthorized
 */

//ambil produk berdasarkan ID (admin & user)
router.get(
  "/:id",
  authenticateToken,
  authorizeRole("admin", "user"),
  getProductById
);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product by ID (Admin only)
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     description: Update product details including uploading a new image.
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
 *               description:
 *                 type: string
 *                 example: "Kopi robusta khas Lampung"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Upload new product image
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 *       401:
 *         description: Unauthorized
 */

//update produck berdasarkan ID (hanya admin)
router.put(
  "/:id",
  authenticateToken,
  authorizeRole("admin"),
  uploadProduct.single("image"),
  updateProductById
);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product by ID (Admin only)
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     description: Delete a product and remove its image file if available.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 *       401:
 *         description: Unauthorized
 */

//delete product berdasarkan ID (hanya admin)
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole("admin"),
  deleteProductById
);

module.exports = router;
