import express from "express";
import dotenv from "dotenv";
import { handleSearch } from "./backend/api.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Statické soubory frontendu
app.use(express.static("frontend"));

app.get("/api/search", async (req, res) => {
  await handleSearch(req, res, true);
});

app.listen(PORT, () => {
  console.log(`Server běží na http://localhost:${PORT}`);
});
