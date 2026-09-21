import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

import { runSearch } from "../frontend/script.js";

// Suppress console output during tests
console.log = () => {};
console.error = () => {};

/**
 * Create a JSDOM environment for testing frontend functions.
 */
function createDOM(query = "") {
  // Create a minimal DOM required by the application
  const dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
        <body>
            <input id="query" value="${query}">
            <div id="status"></div>
            <div id="results"></div>
            <div id="actionsArea"></div>
            <button id="searchBtn"></button>
            <button id="exportBtn"></button>
        </body>
        </html>
    `);

  // Make the JSDOM document and window globally available
  global.document = dom.window.document;
  global.window = dom.window;
}

/**
 * Test that runSearch does not perform a request when the query is empty.
 */
test("runSearch does nothing when query is empty", async () => {
  // Create a DOM with an empty query
  createDOM("");

  let fetchCalled = false;

  // Mock the fetch function
  global.fetch = async () => {
    fetchCalled = true;

    return {
      ok: true,
      json: async () => [],
    };
  };

  // Run the search
  await runSearch();

  // Verify that no request was made
  assert.equal(fetchCalled, false);

  // Verify that the status remains unchanged
  assert.equal(document.getElementById("status").textContent, "");
});

/**
 * Test that runSearch displays results after a successful API call.
 */
test("runSearch displays results after successful API call", async () => {
  // Create a DOM with a search query
  createDOM("seznam");

  // Mock a successful API response
  global.fetch = async () => ({
    ok: true,
    json: async () => [
      {
        position: 1,
        title: "Seznam",
        url: "https://www.seznam.cz",
        description: "Seznam.cz",
      },
    ],
  });

  // Run the search
  await runSearch();

  // Verify the result count and status color
  assert.equal(
    document.getElementById("status").innerText,
    "Nalezeno 1 výsledků.",
  );

  assert.equal(document.getElementById("status").style.color, "green");

  // Verify that the result is displayed
  assert.equal(document.querySelector(".search-result a").innerText, "Seznam");

  // Verify that the search button is enabled again
  assert.equal(document.getElementById("searchBtn").disabled, false);
});

/**
 * Test that runSearch displays an error when the API call fails.
 */
test("runSearch displays error when API call fails", async () => {
  // Create a DOM with a search query
  createDOM("seznam");

  // Mock a failed API response
  global.fetch = async () => ({
    ok: false,
    status: 500,
  });

  // Run the search
  await runSearch();

  // Verify the error message and status color
  assert.equal(
    document.getElementById("status").innerText,
    "Chyba při získávání dat. Zkontrolujte připojení k serveru.",
  );

  assert.equal(document.getElementById("status").style.color, "red");

  // Verify that the search button is enabled again
  assert.equal(document.getElementById("searchBtn").disabled, false);
});
