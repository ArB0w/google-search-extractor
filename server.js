import express from "express";
import dotenv from "dotenv";
import { transformResults, callAPI } from "./backend/utility.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Statické soubory frontendu
app.use(express.static("frontend"));

// API endpoint pro vyhledávání
app.get("/api/search", async (req, res) => {
  try {
    const query = req.query.q;

    if (!query) {
      throw new Error(`SerpApi return HTTP ${response.status}`);
      return res.status(400).json({
        error: "Missing qwuarry.",
      });
    }

    const data = await callAPI(query, process.env.SERPAPI_KEY);

    const results = transformResults(data.organic_results || []);

    res.json(results);
  } catch (error) {
    console.error("Errorr in search:", error);

    res.status(500).json({
      error: "Error in searchning.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server běží na http://localhost:${PORT}`);
});
