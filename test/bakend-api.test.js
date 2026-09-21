import test from "node:test";
import assert from "node:assert/strict";

import { transformResults, callAPI, search } from "../backend/api.js";

console.log = () => {};
console.error = () => {};

test("transformResults converts results to the required format", () => {
  const input = [
    {
      position: 1,
      title: "Google",
      link: "https://google.com",
      snippet: "Search engine",
    },
  ];

  const result = transformResults(input);

  assert.deepEqual(result, [
    {
      position: 1,
      title: "Google",
      url: "https://google.com",
      description: "Search engine",
    },
  ]);
});

test("transformResults sorts results by position", () => {
  const input = [
    {
      position: 7,
      title: "Seventh",
      link: "https://example.com/7",
      snippet: "Seventh result",
    },
    {
      position: 1,
      title: "First",
      link: "https://example.com/1",
      snippet: "First result",
    },
    {
      position: 3,
      title: "Third",
      link: "https://example.com/3",
      snippet: "Third result",
    },
  ];

  const result = transformResults(input);

  assert.deepEqual(
    result.map((item) => item.position),
    [1, 3, 7],
  );
});

test("transformResults handles an empty array", () => {
  const result = transformResults([]);

  assert.deepEqual(result, []);
});

test("transformResults fills missing values with empty strings", () => {
  const input = [
    {
      position: 1,
    },
  ];

  const result = transformResults(input);

  assert.deepEqual(result, [
    {
      position: 1,
      title: "",
      url: "",
      description: "",
    },
  ]);
});

test("transformResults does not modify the original array", () => {
  const input = [
    {
      position: 2,
      title: "Second",
      link: "https://example.com/2",
      snippet: "Second result",
    },
    {
      position: 1,
      title: "First",
      link: "https://example.com/1",
      snippet: "First result",
    },
  ];

  const original = structuredClone(input);

  transformResults(input);

  assert.deepEqual(input, original);
});

test("callAPI returns results containing Seznam", async () => {
  global.fetch = async () => ({
    ok: true,
    json: async () => ({
      organic_results: [
        {
          position: 1,
          title: "Example",
          link: "https://example.com",
          snippet: "Example result",
        },
        {
          position: 2,
          title: "Seznam.cz",
          link: "https://www.seznam.cz",
          snippet: "Seznam",
        },
      ],
    }),
  });

  const result = await callAPI("seznam.cz", "test-api-key");

  const containsSeznam = result.organic_results.some((item) =>
    item.link.includes("seznam.cz"),
  );

  assert.equal(containsSeznam, true);
});

test("callAPI throws an error when SerpApi returns an HTTP error", async () => {
  global.fetch = async () => ({
    ok: false,
    status: 500,
  });

  await assert.rejects(
    callAPI("seznam.cz", "test-api-key"),
    /SerpApi return HTTP 500/,
  );
});

test("search returns 400 when query is missing", async () => {
  global.fetch = async () => ({
    ok: true,
    json: async () => ({}),
  });

  const result = await search("", "test-api-key");

  assert.equal(result.status, 400);

  assert.deepEqual(result.data, {
    error: "Missing query.",
  });
});

test("search returns 200 with transformed results on successful API call", async () => {
  global.fetch = async () => ({
    ok: true,
    json: async () => ({
      organic_results: [
        {
          position: 1,
          title: "Seznam",
          link: "https://www.seznam.cz",
          snippet: "Seznam.cz",
        },
      ],
    }),
  });

  const result = await search("seznam", "test-api-key");

  assert.equal(result.status, 200);

  assert.deepEqual(result.data, [
    {
      position: 1,
      title: "Seznam",
      url: "https://www.seznam.cz",
      description: "Seznam.cz",
    },
  ]);
});

test("search returns 500 when API call fails", async () => {
  global.fetch = async () => ({
    ok: false,
    status: 500,
  });

  const result = await search("seznam", "test-api-key");

  assert.equal(result.status, 500);

  assert.deepEqual(result.data, {
    error: "Error in searching.",
  });
});
