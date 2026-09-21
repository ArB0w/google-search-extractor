import crypto from "node:crypto";

/**
 * Transform raw API results into the application's required format.
 *
 * @param {Array} results Raw search results returned by the API.
 * @returns {Array} Transformed and sorted search results.
 */
export function transformResults(results) {
  // Create a new array to avoid modifying the original results
  return (
    [...results]
      .map((item) => ({
        position: item.position,
        title: item.title || "",
        url: item.link || "",
        description: item.snippet || "",
      }))
      // Sort results by their position
      .sort((a, b) => a.position - b.position)
  );
}

/**
 * Send a search request to the SerpApi service.
 *
 * @param {string} query Search query.
 * @param {string} API_KEY SerpApi authentication key.
 * @returns {Promise<Object>} API response containing search results.
 * @throws {Error} If the API request returns an HTTP error.
 */
export async function callAPI(query, API_KEY) {
  // Build the SerpApi request URL
  const url = new URL("https://serpapi.com/search.json");

  url.searchParams.set("engine", "google");
  url.searchParams.set("q", query);
  url.searchParams.set("api_key", API_KEY);

  // Send the request to SerpApi
  const response = await fetch(url);

  // Handle unsuccessful HTTP responses
  if (!response.ok) {
    throw new Error(`SerpApi return HTTP ${response.status}`);
  }

  // Return the parsed JSON response
  return await response.json();
}

/**
 * Perform a search and transform the API results.
 *
 * @param {string} query Search query.
 * @param {string} API_KEY SerpApi authentication key.
 * @returns {Promise<Object>} Object containing the HTTP status and response data.
 */
export async function search(query, API_KEY) {
  // Validate that a search query was provided
  if (!query) {
    return {
      status: 400,
      data: {
        error: "Missing query.",
      },
    };
  }

  try {
    // Request search results from SerpApi
    const data = await callAPI(query, API_KEY);

    // Extract and transform organic search results
    const results = transformResults(data.organic_results || []);

    return {
      status: 200,
      data: results,
    };
  } catch (error) {
    // Handle errors returned by the API
    console.error("Error in search:", error);

    return {
      status: 500,
      data: {
        error: "Error in searching.",
      },
    };
  }
}

/**
 * Handle search requests and optionally log request information.
 *
 * @param {Object} req Express request object.
 * @param {Object} res Express response object.
 * @param {boolean} logging Enable or disable request logging.
 */
export async function handleSearch(req, res, logging = true) {
  // Generate a unique ID and start the request timer
  const requestId = crypto.randomUUID();
  const startTime = Date.now();

  // Get the search query from the request
  const query = req.query.q;

  // Get the client's IP address
  const clientIP =
    req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

  if (logging) {
    // Log information about the incoming request
    console.log(
      `[${new Date().toISOString()}] ` +
        `[${requestId}] ` +
        `Search request | IP: ${clientIP} | Query: "${query}"`,
    );
  }

  // Perform the search
  const result = await search(query, process.env.SERPAPI_KEY);

  // Calculate the request processing time
  const duration = Date.now() - startTime;

  if (logging) {
    // Log information about the completed request
    console.log(
      `[${new Date().toISOString()}] ` +
        `[${requestId}] ` +
        `Search response | Status: ${result.status} | ` +
        `Results: ${Array.isArray(result.data) ? result.data.length : 0} | ` +
        `Time: ${duration} ms`,
    );
  }

  // Send the search result to the client
  res.status(result.status).json(result.data);
}
