const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "site", "course", "course.html"));
});

// Keep /course working too, in case it's linked/bookmarked anywhere
app.get("/course", (req, res) => {
  res.sendFile(path.join(__dirname, "site", "course", "course.html"));
});

app.listen(PORT, () => {
  console.log(`Master Certification course site running on port ${PORT}`);
});
