const dotenv = require("dotenv");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const axios = require("axios");

dotenv.config();

const app = express();

app.use(express.static(path.join(__dirname, "..", "client")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// READ-ONLY TOKEN
var TOKEN = "be21195231d946b680453e48456d6e806a34c0456b8c13804aa797cb2c560db1";

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, "..", "client", "index.html"));
});

app.get("/dashboard", function (req, res) {
  res.sendFile(path.join(__dirname, "..", "client", "dashboard.html"));
});

app.get("/playlist", function (req, res) {
  res.sendFile(path.join(__dirname, "..", "client", "playlist.html"));
});

app.get("/medias", async function (req, res) {
  try {
    const response = await axios.get("https://api.wistia.com/v1/medias.json", {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Error fetching medias from Wistia" });
  }
});

/**
 * In a production app, this would usually update and persist the visibility of a media to a database,
 * but for our use case, since we're persisting medias within localStorage client-side, we'll just return success
 */
app.patch("/medias/:hashedId", function (req, res) {
  const hashedId = req.params.hashedId;
  const visible = req.body.visible;

  res.json({ success: true, hashedId, visible });
});

app.get("/stats/:mediaId", async function (req, res) {
  const mediaId = req.params.mediaId;
  try {
    const response = await axios.get(
      `https://api.wistia.com/v1/stats/medias/${mediaId}.json`,
      {
        headers: { Authorization: `Bearer ${TOKEN}` },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching stats from Wistia", error);
    res.status(500).json({ error: "Error fetching stats from Wistia" });
  }
});

if (require.main === module) {
  const port = process.env.PORT || 8080;
  app.listen(port, () => console.log(`Server ready on port ${port}`));
}

module.exports = app;
