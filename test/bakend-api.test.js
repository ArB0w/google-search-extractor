import test from "node:test";
import assert from "node:assert/strict";

import { transformResults, callAPI, search } from "../backend/api.js";

// Suppress console output during tests
console.log = () => {};
console.error = () => {};

/**
 * Test that search results are transformed to the required format.
 */
test("transformResults converts results to the required format", () => {
  // Prepare sample API result
  const input = [
    {
      position: 1,
      title: "Google",
      link: "https://google.com",
      snippet: "Search engine",
    },
  ];

  // Transform the API result
  const result = transformResults(input);

  // Verify the transformed result
  assert.deepEqual(result, [
    {
      position: 1,
      title: "Google",
      url: "https://google.com",
      description: "Search engine",
    },
  ]);
});

/**
 * Test that search results are sorted by their position.
 */
test("transformResults sorts results by position", () => {
  // Prepare results in an unsorted order
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

  // Transform and sort the results
  const result = transformResults(input);

  // Verify the resulting order
  assert.deepEqual(
    result.map((item) => item.position),
    [1, 3, 7],
  );
});

/**
 * Test that an empty input array returns an empty result.
 */
test("transformResults handles an empty array", () => {
  // Transform an empty array
  const result = transformResults([]);

  // Verify that the result is also empty
  assert.deepEqual(result, []);
});

/**
 * Test that missing result values are replaced with empty strings.
 */
test("transformResults fills missing values with empty strings", () => {
  // Prepare a result with missing values
  const input = [
    {
      position: 1,
    },
  ];

  // Transform the result
  const result = transformResults(input);

  // Verify that missing values are filled with empty strings
  assert.deepEqual(result, [
    {
      position: 1,
      title: "",
      url: "",
      description: "",
    },
  ]);
});

/**
 * Test that the original input array remains unchanged.
 */
test("transformResults does not modify the original array", () => {
  // Prepare the input array
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

  // Create a copy of the original input
  const original = structuredClone(input);

  // Transform the results
  transformResults(input);

  // Verify that the original input was not modified
  assert.deepEqual(input, original);
});

/**
 * Test that the API response contains a result for Seznam.cz.
 */
test("callAPI returns results containing Seznam", async () => {
  // Mock the fetch response
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

  // Call the API with a test query and API key
  const result = await callAPI("seznam.cz", "test-api-key");

  // Check whether the response contains a Seznam.cz result
  const containsSeznam = result.organic_results.some((item) =>
    item.link.includes("seznam.cz"),
  );

  // Verify that the result was found
  assert.equal(containsSeznam, true);
});

/**
 * Test that callAPI throws an error when SerpApi returns an HTTP error.
 */
test("callAPI throws an error when SerpApi returns an HTTP error", async () => {
  // Mock a failed API response
  global.fetch = async () => ({
    ok: false,
    status: 500,
  });

  // Verify that callAPI rejects with the expected error
  await assert.rejects(
    callAPI("seznam.cz", "test-api-key"),
    /SerpApi return HTTP 500/,
  );
});

/**
 * Test that search returns a 400 status when the query is missing.
 */
test("search returns 400 when query is missing", async () => {
  // Mock the fetch response
  global.fetch = async () => ({
    ok: true,
    json: async () => ({}),
  });

  // Call search without a query
  const result = await search("", "test-api-key");

  // Verify the HTTP status
  assert.equal(result.status, 400);

  // Verify the error response
  assert.deepEqual(result.data, {
    error: "Missing query.",
  });
});

/**
 * Test that search returns a 200 status and transformed results
 * when the API call is successful.
 */
test("search returns 200 with transformed results on successful API call", async () => {
  // Mock a successful API response
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

  // Perform the search
  const result = await search("seznam", "test-api-key");

  // Verify the HTTP status
  assert.equal(result.status, 200);

  // Verify the transformed results
  assert.deepEqual(result.data, [
    {
      position: 1,
      title: "Seznam",
      url: "https://www.seznam.cz",
      description: "Seznam.cz",
    },
  ]);
});

/**
 * Test that search returns a 500 status when the API call fails.
 */
test("search returns 500 when API call fails", async () => {
  // Mock a failed API response
  global.fetch = async () => ({
    ok: false,
    status: 500,
  });

  // Perform the search
  const result = await search("seznam", "test-api-key");

  // Verify the HTTP status
  assert.equal(result.status, 500);

  // Verify the error response
  assert.deepEqual(result.data, {
    error: "Error in searching.",
  });
});
