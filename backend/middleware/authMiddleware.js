const { supabase } = require("../supabaseClient");

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token)
    return res.status(401).json({ error: "Token missing, unauthorized" });

  // Verify the token
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user)
    return res.status(401).json({ error: "Invalid token" });

  req.user = data.user; // attach user to request
  next();
};

module.exports = authMiddleware;
