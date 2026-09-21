import express from "express";
import dotenv from "dotenv";

import { handleSearch } from "./backend/api.js";

// Get variables from .env to process.env
dotenv.config();
const PORT = process.env.PORT || 3000;

// Start Express
const app = express();

// Serve static frontend files to Express
app.use(express.static("frontend"));

// Define the search API endpoint to Express
app.get("/api/search", async (req, res) => {
  await handleSearch(req, res, true);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server běží na http://localhost:${PORT}`);
});
