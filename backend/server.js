// Load environment variables
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());  //Allows frontend to access backend.
app.use(express.json()); //Allows backend to read JSON data sent by frontend (e.g., product info).

// Routes
app.get("/", (req, res) => {
  res.send("FarmConnect Backend is Running!");
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
