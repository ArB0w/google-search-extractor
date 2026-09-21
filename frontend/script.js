let extractedData = null;

/**
 * Perform a search and display the returned results.
 */
export async function runSearch() {
  // Get the required DOM elements
  const queryInput = document.getElementById("query").value.trim();
  const statusDiv = document.getElementById("status");
  const resultsDiv = document.getElementById("results");
  const actionsArea = document.getElementById("actionsArea");
  const searchBtn = document.getElementById("searchBtn");
  const exportBtn = document.getElementById("exportBtn");

  // Stop if the search query is empty
  if (!queryInput) {
    return;
  }

  // Clear previous search data
  extractedData = null;
  updateExportButton();

  // Display the search status
  statusDiv.innerText = "Vyhledávám na Google a zpracovávám výsledky...";
  statusDiv.style.color = "black";

  // Clear previous results
  resultsDiv.innerHTML = "";
  resultsDiv.style.display = "none";

  actionsArea.style.display = "block";
  searchBtn.disabled = true;

  try {
    // Send the search request to the server
    const response = await fetch(
      `/api/search?q=${encodeURIComponent(queryInput)}`,
    );

    // Handle an unsuccessful server response
    if (!response.ok) {
      throw new Error(`Chyba API: ${response.status}`);
    }

    // Parse the response as JSON
    const data = await response.json();

    // Verify that the response contains an array of results
    if (!Array.isArray(data)) {
      throw new Error("API nevrátilo očekávané pole výsledků.");
    }

    // Store the search results
    extractedData = data;

    // Display the result count
    statusDiv.innerText = `Nalezeno ${extractedData.length} výsledků.`;
    statusDiv.style.color = "green";

    // Display the search results
    displayResults(extractedData);

    // Enable export after successful data retrieval
    updateExportButton();
  } catch (error) {
    // Handle errors during the search
    console.error(error);

    statusDiv.innerText =
      "Chyba při získávání dat. Zkontrolujte připojení k serveru.";
    statusDiv.style.color = "red";

    // Clear the results after an error
    extractedData = null;
    updateExportButton();
  } finally {
    // Re-enable the search button
    searchBtn.disabled = false;
  }
}

/**
 * Display search results as structured items in the frontend.
 *
 * @param {Array} results Search results to display.
 */
export function displayResults(results) {
  // Get the results container
  const resultsDiv = document.getElementById("results");

  // Clear previous results
  resultsDiv.innerHTML = "";

  // Display a message if no organic results were found
  if (results.length === 0) {
    resultsDiv.innerHTML = "<p>Nebyly nalezeny žádné organické výsledky.</p>";

    resultsDiv.style.display = "block";
    return;
  }

  // Create the results heading
  const heading = document.createElement("h2");
  heading.innerText = "Výsledky vyhledávání";

  resultsDiv.appendChild(heading);

  results.forEach((result) => {
    // Create the container for a single result
    const resultElement = document.createElement("div");
    resultElement.className = "search-result";

    // Display the result position
    const position = document.createElement("strong");
    position.innerText = `${result.position}. `;

    // Create a link containing the result title
    const title = document.createElement("a");
    title.href = result.url;
    title.target = "_blank";
    title.rel = "noopener noreferrer";
    title.innerText = result.title || "Bez názvu";

    // Display the result URL
    const url = document.createElement("div");
    url.className = "result-url";
    url.innerText = result.url || "";

    // Display the result description
    const description = document.createElement("p");
    description.innerText = result.description || "Popis není k dispozici.";

    // Create the result header
    const header = document.createElement("div");
    header.className = "result-title";

    header.appendChild(position);
    header.appendChild(title);

    // Assemble the result element
    resultElement.appendChild(header);
    resultElement.appendChild(url);
    resultElement.appendChild(description);

    resultsDiv.appendChild(resultElement);
  });

  // Make the results container visible
  resultsDiv.style.display = "block";
}

/**
 * Export search results as a JSON file.
 */
function downloadJSON() {
  // Stop if no search data is available
  if (extractedData === null) {
    return;
  }

  // Convert the results to formatted JSON
  const json = JSON.stringify(extractedData, null, 2);

  // Create a Blob containing the JSON data
  const blob = new Blob([json], { type: "application/json" });

  // Create a temporary URL for the Blob
  const url = URL.createObjectURL(blob);

  // Create a temporary download link
  const link = document.createElement("a");
  link.href = url;
  link.download = "google-results.json";

  // Trigger the file download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Release the temporary URL
  URL.revokeObjectURL(url);
}

/**
 * Enable or disable the search button based on the query input.
 */
function updateSearchButton() {
  // Get the trimmed search query
  const query = document.getElementById("query").value.trim();

  // Get the search button
  const searchBtn = document.getElementById("searchBtn");

  // Disable the button when the query is empty
  searchBtn.disabled = query === "";
}

/**
 * Update the state of the export button.
 */
function updateExportButton() {
  const exportBtn = document.getElementById("exportBtn");

  if (!exportBtn) {
    return;
  }

  if (extractedData === null) {
    // Disable export when no data is available
    exportBtn.disabled = true;
    exportBtn.style.backgroundColor = "#add8e6";
    exportBtn.style.cursor = "not-allowed";
    exportBtn.style.opacity = "0.8";
  } else {
    // Enable export when data is available
    exportBtn.disabled = false;
    exportBtn.style.backgroundColor = "";
    exportBtn.style.cursor = "pointer";
    exportBtn.style.opacity = "1";
  }
}

/**
 * Initialize button event handlers after the page is loaded.
 */
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    document
      .getElementById("query")
      .addEventListener("input", updateSearchButton);

    document.getElementById("searchBtn").addEventListener("click", runSearch);

    document
      .getElementById("exportBtn")
      .addEventListener("click", downloadJSON);

    updateSearchButton();
    updateExportButton();
  });
}
