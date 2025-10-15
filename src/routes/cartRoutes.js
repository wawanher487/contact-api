const express = require("express");
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  deleteCart,
} = require("../controllers/cartController");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");

//semua route butuh login
router.get("/", authenticateToken, authorizeRole("user", "admin"), getCart);
router.post("/", authenticateToken, authorizeRole("user", "admin"), addToCart);
router.patch(
  "/:itemId",
  authenticateToken,
  authorizeRole("admin", "user"),
  updateCartItem
);

router.delete(
  "/:itemId",
  authenticateToken,
  authorizeRole("admin", "user"),
  deleteCart
);

module.exports = router;
