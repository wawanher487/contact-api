const express = require("express");
const router = express.Router();
const { checkout } = require("../controllers/orderController");
const {
  authenticateToken,
  authorizeRole,
} = require("../middleware/authMiddleware");

router.post(
  "/checkout",
  authenticateToken,
  authorizeRole("admin", "user"),
  checkout
);

module.exports = router;
