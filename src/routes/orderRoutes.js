const express = require("express");
const router = express.Router();
const {
  checkout,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
  deleteOrderById,
} = require("../controllers/orderController");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");

//khusu admin
router.get("/admin", authenticateToken, authorizeRole("admin"), getAllOrders);

router.patch(
  "/:id/status",
  authenticateToken,
  authorizeRole("admin"),
  updateOrderStatus
);

router.post(
  "/checkout",
  authenticateToken,
  authorizeRole("admin", "user"),
  checkout
);

router.get(
  "/",
  authenticateToken,
  authorizeRole("admin", "user"),
  getUserOrders
);

router.get(
  "/:id",
  authenticateToken,
  authorizeRole("admin", "user"),
  getOrderById
);

module.exports = router;
