const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

app.post("/validate", async (req, res) => {
  const { license, hwid } = req.body;

  if (!license || !hwid) {
    return res.json({ status: "invalid" });
  }

  const { data, error } = await supabase
    .from("licenses")
    .select("*")
    .eq("license_key", license)
    .single();

  if (error || !data) {
    return res.json({ status: "invalid" });
  }

  if (!data.active) {
    return res.json({ status: "disabled" });
  }

  if (!data.hwid) {
    await supabase
      .from("licenses")
      .update({ hwid: hwid })
      .eq("license_key", license);

    return res.json({ status: "valid" });
  }

  if (data.hwid === hwid) {
    return res.json({ status: "valid" });
  }

  return res.json({ status: "invalid" });
});

app.get("/", (req, res) => {
  res.send("Aura License Server Running");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
