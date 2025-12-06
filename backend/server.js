// Load environment variables
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const { supabase } = require("./supabaseClient");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");

// Middleware
app.use(cors());  //Allows frontend to access backend.
app.use(express.json()); //Allows backend to read JSON data sent by frontend (e.g., product info).
app.use("/auth", authRoutes);
app.use("/products", productRoutes) 
// Routes
app.get("/", (req, res) => {
    res.send("FarmConnect Backend is Running!");
});

// Test database connection
app.get("/testdb", async (req, res) => {
    const { data, error } = await supabase.from("users").select("*");

    if (error) return res.status(500).json(error);
    res.json(data);
});


// Start server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
