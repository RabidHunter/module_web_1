const express = require("express");
const router = express.Router();

const API_VERSION = "1.0";

router.get("/", (req, res) => {
    res.status(200).json({
        status: "ok",
        version: API_VERSION,
    });
});

module.exports = router;