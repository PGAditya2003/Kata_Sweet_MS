const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();
app.use(express.json());

const cors = require("cors");

app.use(cors({
  origin: "http://localhost:5173", // Vite dev server
  credentials: true
}));


// Only connect to real MongoDB if not testing
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

// Auth routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/sweets", require("./routes/sweets"));
app.use("/api/orders", require("./routes/order"));

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on ${PORT}`));
}

module.exports = app;
