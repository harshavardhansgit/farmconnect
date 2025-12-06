const express = require("express");
const router = express.Router();
const { supabase } = require("../supabaseClient");
const auth = require("../middleware/authMiddleware");
const multer = require("multer");   //accepts images uploaded from the frontend
const upload = multer({ storage: multer.memoryStorage() }); //directly uploads to superbase instead of saving loacally


// CREATE PRODUCT (Farmer Only)
router.post("/", auth, async (req, res) => {
  const { title, description, price, stock, category, unit, image_url} = req.body;

  const farmerId = req.user.id;

  // Verify the farmer's role
  const { data: userDetails } = await supabase
    .from("users")
    .select("role")
    .eq("id", farmerId)
    .single();

  if (!userDetails || userDetails.role !== "farmer") {
    return res.status(403).json({ error: "Only farmers can add products" });
  }

  const { data, error } = await supabase.from("products").insert([
    {
      farmer_id: farmerId,
      title,
      description,
      price,
      stock,
      category,
      unit,
      image_url,
    },
  ]);

 if (error) {
  console.log("Supabase Insert Error:", error);
  return res.status(400).json({ error });
}

return res.json({
  message: "Product added successfully!",
  product: data ? data[0] : null,
});
});

// GET ALL PRODUCTS
router.get("/", async (req, res) => {
  const { data, error } = await supabase.from("products").select("*");

  if (error) return res.status(500).json(error);

  res.json(data);
});

// GET SINGLE PRODUCT
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return res.status(404).json(error);

  res.json(data);
});

// UPLOAD PRODUCT IMAGE
router.post("/upload-image", auth, upload.single("image"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileName = `${Date.now()}-${file.originalname}`;

    const { data, error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      console.log(error);
      return res.status(400).json({ error: error.message });
    }

    // get public URL
    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    res.json({ image_url: urlData.publicUrl });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
