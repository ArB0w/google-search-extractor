export function transformResults(organicResults) {
  return organicResults.map((item, index) => ({
    position: index,
    title: item.title || "",
    url: item.link || "",
    description: item.snippet || "",
  }));
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
