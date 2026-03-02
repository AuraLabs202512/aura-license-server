const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post("/validate", (req, res) => {
    const { license, hwid } = req.body;

    if (!license || !hwid) {
        return res.json({ status: "invalid" });
    }

    let licenses = JSON.parse(fs.readFileSync("licenses.json"));

    if (!licenses[license]) {
        return res.json({ status: "invalid" });
    }

    if (!licenses[license].active) {
        return res.json({ status: "disabled" });
    }

    if (licenses[license].hwid === "") {
        licenses[license].hwid = hwid;
        fs.writeFileSync("licenses.json", JSON.stringify(licenses, null, 2));
        return res.json({ status: "valid" });
    }

    if (licenses[license].hwid === hwid) {
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
