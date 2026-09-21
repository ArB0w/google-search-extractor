import express from "express";
import dotenv from "dotenv";
import { search } from "./backend/api.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Statické soubory frontendu
app.use(express.static("frontend"));

// API endpoint pro vyhledávání
import crypto from "node:crypto";

app.get("/api/search", async (req, res) => {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  const query = req.query.q;

  const clientIP =
    req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

  console.log(
    `[${new Date().toISOString()}] ` +
      `[${requestId}] ` +
      `Search request | IP: ${clientIP} | Query: "${query}"`,
  );

  const result = await search(query, process.env.SERPAPI_KEY);

  const duration = Date.now() - startTime;

  console.log(
    `[${new Date().toISOString()}] ` +
      `[${requestId}] ` +
      `Search response | Status: ${result.status} | ` +
      `Results: ${Array.isArray(result.data) ? result.data.length : 0} | ` +
      `Time: ${duration} ms`,
  );

  res.status(result.status).json(result.data);
});

app.listen(PORT, () => {
  console.log(`Server běží na http://localhost:${PORT}`);
});
