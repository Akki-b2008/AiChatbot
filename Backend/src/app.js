const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.json({ message: "Received a GET request on." });
});

module.exports = app;
