const express = require("express");
const router = express.Router();
const { supabase } = require("../supabaseClient");

// SIGNUP ROUTE
router.post("/signup", async (req, res) => {
    const { email, password, name, role } = req.body;

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) return res.status(400).json(authError);

    const userId = authData.user.id;

    // 2. Insert user record into our 'users' table
    const { error: insertError } = await supabase.from("users").insert([
        {
            id: userId,
            email,
            name,
            role,
        },
    ]);

    if (insertError) return res.status(400).json(insertError);

    return res.json({ message: "Signup successful!", userId });
});

// LOGIN ROUTE
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Attempt login
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) return res.status(400).json(error);

    return res.json({
        message: "Login successful",
        token: data.session.access_token,
        user: data.user,
    });
});

module.exports = router;
