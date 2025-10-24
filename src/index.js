const express = require("express");
const connectDB = require("./config/db");
dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const { authenticateToken } = require("./middleware/authMiddleware");
const setupSwagger = require("./config/swagger");

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../.env") });
connectDB();

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://e-commerce-apps-phi.vercel.app/", // Ganti dengan domain frontend
    "https://e-commerce-apps-wawan-hermawans-projects-56d54f77.vercel.app/",
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

//middleware
const app = express();
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//setup swagger
setupSwagger(app);

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
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
