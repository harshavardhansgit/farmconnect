const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const { supabase } = require("../supabaseClient");

// Create new order
router.post("/", auth, async (req, res) => {
    const consumerId = req.user.id;
    const { items, total } = req.body;

    try {
        // 1. Insert order
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert([
                {
                    consumer_id: consumerId,
                    total_amount: total,
                },
            ])
            .select()
            .single();

        if (orderError) return res.status(400).json({ error: orderError });

        const orderId = order.id;

        // 2. Insert each order item
        const orderItems = items.map((item) => ({
            order_id: orderId,
            product_id: item.id,
            farmer_id: item.farmer_id,
            quantity: item.qty,
            price: item.price,
        }));

        const { error: itemError } = await supabase
            .from("order_items")
            .insert(orderItems);

        if (itemError) return res.status(400).json({ error: itemError });

        res.json({ message: "Order placed successfully!", orderId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET orders of logged-in user (Order History)
router.get("/", auth, async (req, res) => {
    const consumerId = req.user.id;

    try {
        const { data, error } = await supabase
            .from("orders")
            .select("*")
            .eq("consumer_id", consumerId)
            .order("created_at", { ascending: false });

        if (error) {
            return res.status(400).json({ error });
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single order with items
router.get("/:id", auth, async (req, res) => {
    const orderId = req.params.id;
    const userId = req.user.id;

    try {
        // 1. Check order belongs to this user
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .select("*")
            .eq("id", orderId)
            .eq("consumer_id", userId)
            .single();

        if (orderError || !order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // 2. Get order items
        const { data: items, error: itemsError } = await supabase
            .from("order_items")
            .select(`
        id,
        quantity,
        price,
        products (
            title,
            image_url,
            unit
        )
    `)
            .eq("order_id", orderId);

        if (itemsError) {
            return res.status(400).json(itemsError);
        }

        res.json({
            order,
            items,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



module.exports = router;
