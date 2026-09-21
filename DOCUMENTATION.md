# Google Search Extractor — Documentation

## Table of Contents

- [Overview](#overview)
- [Technologies](#technologies)
- [Architecture](#architecture)
- [Frontend](#frontend)
- [Server](#server)
- [Search API](#search-api)
- [Error Handling](#error-handling)
- [API Key and Configuration](#api-key-and-configuration)
- [SerpApi Limitations](#serpapi-limitations)
- [Logging and Monitoring](#logging-and-monitoring)
- [Testing](#testing)
- [Docker](#docker)
- [Running Locally](#running-locally)
- [Project Structure](#project-structure)
- [Limitations](#limitations)

---

## 1. Overview

Google Search Extractor is a small web application that retrieves organic Google Search results for a user-defined query and presents them in a structured format.

The application uses **SerpApi** as an intermediary for accessing Google Search results. The retrieved organic results are transformed into a simplified JSON structure containing the result position, title, URL and description.

The application provides:

- search by keyword or phrase,
- extraction of organic Google Search results,
- display of results in the browser,
- export of results to a JSON file,
- server-side API key protection,
- request logging,
- automated frontend and server-side tests,
- Docker support for local development.

---

## 2. Technologies

The application is based on the following technologies:

- **Node.js** — JavaScript runtime used for the server.
- **npm** — dependency and project management.
- **Express** — web server framework used to serve the frontend and provide the search API endpoint.
- **SerpApi** — external API used to retrieve Google Search results.
- **HTML, CSS and JavaScript** — frontend implementation.
- **Node.js Test Runner** — server-side unit testing.
- **JSDOM** — simulated browser environment for frontend tests.
- **Docker** — containerization.
- **Docker Compose** — simplified local container execution.

---

## 3. Architecture

The application consists of three main parts:

1. **Frontend** — provides the user interface and displays the results.
2. **Node.js server** — serves the frontend, receives search requests and communicates with SerpApi.
3. **SerpApi** — retrieves Google Search results and returns them to the server in JSON format.

The frontend does not communicate directly with SerpApi. All API requests are handled by the server.

### Request flow

```text
User
  │
  │ enters search query
  ▼
Frontend
  │
  │ GET /api/search?q=...
  ▼
Node.js / Express server
  │
  │ request with API key
  ▼
SerpApi
  │
  │ Google Search
  ▼
Google
  │
  │ search results
  ▼
SerpApi
  │
  │ JSON response
  ▼
Node.js / Express server
  │
  │ extract organic_results
  │ transform data
  ▼
Frontend
  │
  ├── display results
  │
  └── export JSON
```

### Detailed flow

When the application is opened, the Node.js server serves the static frontend files from the `frontend` directory.

The user enters a keyword or phrase into the search input. The search button becomes available when the input contains a non-empty value. The search can be started either by clicking the button or by submitting the search form using the Enter key.

The frontend sends the query to the server through the following endpoint:

```text
GET /api/search?q=<query>
```

The Express server receives the request and passes the query to the server-side search logic.

The server then creates a request to SerpApi. The SerpApi API key is obtained from the server environment and is therefore not sent to the browser.

SerpApi performs the Google Search and returns the search response in JSON format. The server extracts the `organic_results` field and transforms each result into the application's internal format.

The transformed results are returned to the frontend as JSON.

The frontend displays the results and stores the returned data so that it can also be exported as a JSON file.

---

## 4. Frontend

The frontend is located in the `frontend` directory.

```text
frontend/
├── index.html
├── style.css
└── script.js
```

### `index.html`

The HTML file defines the basic application structure:

- search input,
- search button,
- status message,
- JSON export button,
- result container.

The JavaScript file is loaded as an ES module.

The search controls are implemented as a form, allowing the Enter key to submit the search naturally.

### `style.css`

The stylesheet defines the visual appearance of the application, including:

- page layout,
- search form,
- buttons,
- status messages,
- search result cards,
- links and descriptions,
- responsive behaviour for smaller screens.

### `script.js`

The frontend JavaScript implements the client-side application logic.

The main functions are:

- `updateSearchButton()` — enables or disables the search button according to the input value.
- `updateExportButton()` — enables or disables JSON export according to the availability of search results.
- `runSearch()` — sends the search request to the server and processes the response.
- `displayResults()` — displays the returned search results.
- `downloadJSON()` — exports the current results as a JSON file.

The frontend also handles API errors and displays an appropriate status message to the user.

---

## 5. Server

The application server is implemented using Node.js and Express.

The main server file is:

```text
server.js
```

The server has two primary responsibilities:

1. serving the frontend,
2. providing the search API endpoint.

Static frontend files are served using Express:

```js
app.use(express.static("frontend"));
```

The search endpoint is defined as:

```text
GET /api/search
```

The request is processed by the `handleSearch()` function.

The server also loads environment variables using `dotenv`. This allows sensitive configuration, such as the SerpApi API key, to remain outside the source code.

---

## 6. Search API

The server-side search logic is located in:

```text
backend/api.js
```

The module contains the main functions responsible for communication with SerpApi and processing the returned data.

### `callAPI()`

`callAPI()` creates and sends a request to SerpApi.

The request contains:

- Google as the search engine,
- the user's search query,
- the SerpApi API key.

The response is checked for a successful HTTP status. An unsuccessful response results in an exception.

### `transformResults()`

SerpApi returns a larger result structure. The application only needs a subset of the available information.

Each organic result is transformed into:

```json
{
  "position": 1,
  "title": "Example title",
  "url": "https://example.com",
  "description": "Example description"
}
```

The application uses the following mapping:

| Application field | SerpApi field |
| ----------------- | ------------- |
| `position`        | `position`    |
| `title`           | `title`       |
| `url`             | `link`        |
| `description`     | `snippet`     |

The transformed results are sorted by their position.

### `search()`

The `search()` function combines input validation, communication with SerpApi and result transformation.

If no query is provided, the server returns HTTP status `400`.

If the external API request fails, the server returns HTTP status `500`.

A successful request returns HTTP status `200` and the transformed result array.

---

## 7. API Endpoint

The application exposes the following endpoint:

```text
GET /api/search?q=<query>
```

### Example

```text
GET /api/search?q=javascript
```

A successful response has the following structure:

```json
[
  {
    "position": 1,
    "title": "Example",
    "url": "https://example.com",
    "description": "Example description"
  },
  {
    "position": 2,
    "title": "Another result",
    "url": "https://example.org",
    "description": "Another description"
  }
]
```

Only organic search results are processed. Other types of Google Search results are not included in the application's output.

---

## 8. Error Handling

Errors are handled at several levels.

### Missing query

If the client sends an empty search query, the server returns:

```text
HTTP 400
```

with:

```json
{
  "error": "Missing query."
}
```

### External API error

If SerpApi returns an unsuccessful HTTP response or the request otherwise fails, the server catches the error and returns:

```text
HTTP 500
```

with:

```json
{
  "error": "Error in searching."
}
```

The frontend handles unsuccessful responses and informs the user that the search could not be completed.

---

## 9. API Key and Configuration

The SerpApi API key is stored in an environment variable rather than directly in the source code.

The application expects a `.env` file containing:

```env
SERPAPI_KEY=your_api_key
PORT=3000
```

The `.env` file is excluded from version control using `.gitignore`.

This prevents the API key from being committed to the repository or exposed to the frontend.

The API key is only used by the server when communicating with SerpApi.

---

## 10. SerpApi Limitations

The application uses SerpApi to access Google Search results.

SerpApi provides structured JSON responses, which makes it possible to process the search results without parsing Google's HTML pages directly.

The application currently relies on the SerpApi Free plan. According to the current SerpApi pricing, the Free plan provides a limited number of searches per month and also has an hourly search limit (250 searches per month, 50 searches per hour).

Because each search consumes API quota, the application is primarily intended for demonstration, testing and development rather than high-volume usage.

The exact search results can also vary depending on the query and search context, so the application does not assume a fixed number of organic results.

---

## 11. Logging and Monitoring

The server implements request logging to provide basic monitoring and troubleshooting capabilities.

For each search request, the server can log information such as:

- timestamp,
- request ID,
- client IP address,
- search query,
- HTTP response status,
- number of returned results,
- request processing time.

An example log entry can look like:

```text
[2026-09-21T10:15:30.000Z]
[c0d92eac-bb93-42a0-9ece-60ffe9f292ab]
Search request | IP: 127.0.0.1 | Query: "javascript"
```

The request ID is a unique identifier generated for each request. It allows the request and corresponding response log entries to be associated with each other.

The recorded processing time can also be used to identify slow requests and provide basic performance monitoring.

The logging is intentionally limited to operational information. The SerpApi API key and complete API responses are not logged.

---

## 12. Testing

The project contains automated tests for both server-side and frontend functionality.

The test files are located in:

```text
tests/
├── backend-api.test.js
└── frontend-script.test.js
```

The tests are executed using the built-in Node.js test runner.

```bash
npm test
```

### Backend tests

The server-side tests cover the main functions in `backend/api.js`.

They test, among other things:

- transformation of API results,
- sorting by result position,
- handling of empty result arrays,
- handling of missing result values,
- preservation of the original input,
- successful API communication,
- handling of HTTP errors,
- missing search queries,
- successful search processing,
- failed search processing.

### Frontend tests

Frontend functionality is tested using JSDOM, which provides a simulated browser DOM environment.

The tests cover basic behaviour such as:

- preventing a request when the search query is empty,
- displaying successfully returned results,
- displaying an error when the API request fails,
- restoring the search button after request completion.

### Mocking external requests

The tests do not make real requests to SerpApi.

The global `fetch` function is replaced with a mocked implementation that returns predefined responses.

This provides several advantages:

- tests do not consume SerpApi quota,
- tests do not depend on network availability,
- tests are deterministic,
- API error scenarios can be reproduced easily.

The tests do not cover every possible execution path, but they aim to cover the main application functionality and verify the correctness of the produced data.

---

## 13. Docker

The project includes Docker support for local development.

The relevant files are:

```text
Dockerfile
docker-compose.yml
.dockerignore
```

The `Dockerfile` defines how the application image is built.

The Docker image uses Node.js, installs the project dependencies and starts the application using the npm start command.

Docker Compose provides a simple way to build and run the application:

```bash
docker compose up --build
```

The SerpApi API key is provided through the environment rather than being included in the Docker image source files.

The built Docker image itself is not included in the repository. It is generated from the `Dockerfile`.

---

## 14. Running Locally

### Requirements

The application requires:

- Node.js,
- npm,
- a valid SerpApi API key.

### Installation

Install the project dependencies:

```bash
npm install
```

Create the `.env` file:

```env
SERPAPI_KEY=your_api_key
PORT=3000
```

Start the server:

```bash
npm start
```

The application is then available at:

```text
http://localhost:3000
```

### Running tests

```bash
npm test
```

### Running with Docker

```bash
docker compose up --build
```

---

## 15. Project Structure

```text
google-search-extractor/
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── backend/
│   └── api.js
│
├── server.js
│
├── tests/
│   ├── backend-api.test.js
│   └── frontend-script.test.js
│
├── package.json
├── package-lock.json
├── .env
├── .gitignore
├── .dockerignore
├── Dockerfile
└── docker-compose.yml
```

### Main files

| File                            | Purpose                                    |
| ------------------------------- | ------------------------------------------ |
| `frontend/index.html`           | Frontend structure                         |
| `frontend/style.css`            | Frontend styling                           |
| `frontend/script.js`            | Frontend application logic                 |
| `backend/api.js`                | API communication and result processing    |
| `server.js`                     | Express server                             |
| `tests/backend-api.test.js`     | Server-side tests                          |
| `tests/frontend-script.test.js` | Frontend tests                             |
| `package.json`                  | Project metadata, dependencies and scripts |
| `.env`                          | Local environment configuration            |
| `Dockerfile`                    | Docker image definition                    |
| `docker-compose.yml`            | Docker Compose configuration               |

---

## 16. Limitations

The application has several limitations:

- Search requests depend on the availability of SerpApi.
- The number of searches is limited by the selected SerpApi plan.
- Search results may vary depending on the search query and search context.
- The application focuses only on organic Google Search results.
- Automated tests cover the main functionality but do not test every possible browser or network scenario.
- Logging provides basic monitoring information rather than a complete monitoring solution.

These limitations are acceptable for the scope of the practical test and the intended demonstration use of the application.
