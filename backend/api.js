import crypto from "node:crypto";

export function transformResults(results) {
  return [...results]
    .map((item) => ({
      position: item.position,
      title: item.title || "",
      url: item.link || "",
      description: item.snippet || "",
    }))
    .sort((a, b) => a.position - b.position);
}

export async function callAPI(query, API_KEY) {
  const url = new URL("https://serpapi.com/search.json");

  url.searchParams.set("engine", "google");
  url.searchParams.set("q", query);
  url.searchParams.set("api_key", API_KEY);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`SerpApi return HTTP ${response.status}`);
  }

  return await response.json();
}

export async function search(query, API_KEY) {
  if (!query) {
    return {
      status: 400,
      data: {
        error: "Missing query.",
      },
    };
  }

  try {
    const data = await callAPI(query, API_KEY);

    const results = transformResults(data.organic_results || []);

    return {
      status: 200,
      data: results,
    };
  } catch (error) {
    console.error("Error in search:", error);

    return {
      status: 500,
      data: {
        error: "Error in searching.",
      },
    };
  }
}

export async function handleSearch(req, res, logging = true) {
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  const query = req.query.q;

  const clientIP =
    req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

  if (logging) {
    console.log(
      `[${new Date().toISOString()}] ` +
        `[${requestId}] ` +
        `Search request | IP: ${clientIP} | Query: "${query}"`,
    );
  }

  const result = await search(query, process.env.SERPAPI_KEY);

  const duration = Date.now() - startTime;

  if (logging) {
    console.log(
      `[${new Date().toISOString()}] ` +
        `[${requestId}] ` +
        `Search response | Status: ${result.status} | ` +
        `Results: ${Array.isArray(result.data) ? result.data.length : 0} | ` +
        `Time: ${duration} ms`,
    );
  }

  res.status(result.status).json(result.data);
}
