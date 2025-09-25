const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();
app.use(express.json());

// Only connect to real MongoDB if not testing
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

// Auth routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/sweets", require("./routes/sweets"));

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on ${PORT}`));
}

module.exports = app;
