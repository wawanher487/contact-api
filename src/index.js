const express = require("express");
const connectDB = require("./config/db");
dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { authenticateToken } = require("./middleware/authMiddleware");

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../.env") });
connectDB();

//middleware
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Buat folde uploads bisa diakses secara public
app.use(
  "/uploads",
  authenticateToken,
  express.static(path.join(__dirname, "uploads"))
);

//import routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
