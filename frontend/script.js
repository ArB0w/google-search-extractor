let extractedData = null;

async function runSearch() {
  const queryInput = document.getElementById("query").value.trim();
  const statusDiv = document.getElementById("status");
  const resultsDiv = document.getElementById("results");
  const actionsArea = document.getElementById("actionsArea");
  const searchBtn = document.getElementById("searchBtn");
  const exportBtn = document.getElementById("exportBtn");

  if (!queryInput) {
    alert("Prosím, zadejte klíčové slovo.");
    return;
  }

  // Při novém vyhledávání nejsou zatím dostupná data
  extractedData = null;
  updateExportButton();

  statusDiv.innerText = "Vyhledávám na Google a zpracovávám výsledky...";
  statusDiv.style.color = "black";

  resultsDiv.innerHTML = "";
  resultsDiv.style.display = "none";

  actionsArea.style.display = "block";
  searchBtn.disabled = true;

  try {
    const response = await fetch(
      `/api/search?q=${encodeURIComponent(queryInput)}`,
    );

    if (!response.ok) {
      throw new Error(`Chyba API: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("API nevrátilo očekávané pole výsledků.");
    }

    extractedData = data;

    statusDiv.innerText = `Nalezeno ${extractedData.length} výsledků.`;
    statusDiv.style.color = "green";

    displayResults(extractedData);

    // Aktivace exportu po úspěšném získání dat
    updateExportButton();
  } catch (error) {
    console.error(error);

    statusDiv.innerText =
      "Chyba při získávání dat. Zkontrolujte připojení k serveru.";
    statusDiv.style.color = "red";

    extractedData = null;
    updateExportButton();
  } finally {
    searchBtn.disabled = false;
  }
}

/**
 * Aktualizuje stav tlačítka Exportovat.
 */
function updateExportButton() {
  const exportBtn = document.getElementById("exportBtn");

  if (!exportBtn) {
    return;
  }

  if (extractedData === null) {
    // Data nejsou dostupná
    exportBtn.disabled = true;
    exportBtn.style.backgroundColor = "#add8e6";
    exportBtn.style.cursor = "not-allowed";
    exportBtn.style.opacity = "0.8";
  } else {
    // Data jsou připravena k exportu
    exportBtn.disabled = false;
    exportBtn.style.backgroundColor = "";
    exportBtn.style.cursor = "pointer";
    exportBtn.style.opacity = "1";
  }
}

/**
 * Zobrazí výsledky vyhledávání jako strukturované položky.
 */
function displayResults(results) {
  const resultsDiv = document.getElementById("results");

  resultsDiv.innerHTML = "";

  if (results.length === 0) {
    resultsDiv.innerHTML = "<p>Nebyly nalezeny žádné organické výsledky.</p>";

    resultsDiv.style.display = "block";
    return;
  }

  const heading = document.createElement("h2");
  heading.innerText = "Výsledky vyhledávání";

  resultsDiv.appendChild(heading);

  results.forEach((result) => {
    const resultElement = document.createElement("div");
    resultElement.className = "search-result";

    const position = document.createElement("strong");
    position.innerText = `${result.position}. `;

    const title = document.createElement("a");
    title.href = result.url;
    title.target = "_blank";
    title.rel = "noopener noreferrer";
    title.innerText = result.title || "Bez názvu";

    const url = document.createElement("div");
    url.className = "result-url";
    url.innerText = result.url || "";

    const description = document.createElement("p");
    description.innerText = result.description || "Popis není k dispozici.";

    const header = document.createElement("div");
    header.className = "result-title";

    header.appendChild(position);
    header.appendChild(title);

    resultElement.appendChild(header);
    resultElement.appendChild(url);
    resultElement.appendChild(description);

    resultsDiv.appendChild(resultElement);
  });

  resultsDiv.style.display = "block";
}

/**
 * Exportuje výsledky do JSON souboru.
 */
function downloadJSON() {
  if (extractedData === null) {
    return;
  }

  const json = JSON.stringify(extractedData, null, 2);

  const blob = new Blob([json], { type: "application/json" });

  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "google-results.json";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

// Inicializace tlačítka po načtení stránky
document.addEventListener("DOMContentLoaded", () => {
  updateExportButton();
});
