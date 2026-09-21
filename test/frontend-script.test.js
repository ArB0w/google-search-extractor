import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

import { runSearch } from "../frontend/script.js";

console.log = () => {};
console.error = () => {};

function createDOM(query = "") {
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

  global.document = dom.window.document;
  global.window = dom.window;
}

test("runSearch does nothing when query is empty", async () => {
  createDOM("");

  let fetchCalled = false;

  global.fetch = async () => {
    fetchCalled = true;
    return {
      ok: true,
      json: async () => [],
    };
  };

  await runSearch();

  assert.equal(fetchCalled, false);
  assert.equal(document.getElementById("status").textContent, "");
});

test("runSearch displays results after successful API call", async () => {
  createDOM("seznam");

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

  await runSearch();

  assert.equal(
    document.getElementById("status").innerText,
    "Nalezeno 1 výsledků.",
  );

  assert.equal(document.getElementById("status").style.color, "green");

  assert.equal(document.querySelector(".search-result a").innerText, "Seznam");

  assert.equal(document.getElementById("searchBtn").disabled, false);
});

test("runSearch displays error when API call fails", async () => {
  createDOM("seznam");

  global.fetch = async () => ({
    ok: false,
    status: 500,
  });

  await runSearch();

  assert.equal(
    document.getElementById("status").innerText,
    "Chyba při získávání dat. Zkontrolujte připojení k serveru.",
  );

  assert.equal(document.getElementById("status").style.color, "red");

  assert.equal(document.getElementById("searchBtn").disabled, false);
});
