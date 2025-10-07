const express = require("express");
const connectDB = require("./config/db");
dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, "../.env") });
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

//import routes
app.use("/api/auth", require("./routes/authRoutes"));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
