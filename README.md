# Google Search Extractor

A simple web application for extracting organic Google Search results and displaying them in a structured format.

## Features

- Google Search through SerpApi
- Extraction of organic search results
- Structured JSON output
- Search result display in the frontend
- JSON export
- Server-side API key protection
- Request logging and basic monitoring support
- Automated frontend and server-side tests
- Docker support

## Technologies

The application is built with:

- **Node.js** and **npm**
- **Express** for the server
- **SerpApi** for accessing Google Search results
- **HTML, CSS and JavaScript** for the frontend
- **Node.js test runner** and **JSDOM** for testing
- **Docker** and **Docker Compose** for containerization

## Architecture

The application is built around a **Node.js server using Express**, which acts as an intermediary between the client and the external SerpApi service.

The Express server has two main responsibilities:

- serving the frontend files to the client,
- processing search requests and communicating with SerpApi.

The frontend is served directly by the Express server. When the client submits a search query, the request is sent to the Express server through the `/api/search` endpoint. The server then forwards the query to SerpApi using the API key stored in an environment variable.

SerpApi returns the Google Search data to the server, where the relevant organic results are extracted and transformed into the format required by the application. The server then returns the processed data to the client.

This architecture keeps the SerpApi API key on the server side and prevents it from being exposed to the client or included in the frontend source code.

## Project Structure

```text
google-search-extractor/
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── backend/
│   └── api.js
├── server.js
├── tests/
│   ├── bakend-api.test.js
│   └── frontend-script.test.js
├── package.json
├── package-lock.json
├── .env
├── .gitignore
├── .dockerignore
├── Dockerfile
├── docker-compose.yml
├── README.md
└── DOCUMENTATION.md
```

## SerpApi

The application uses **SerpApi** to retrieve Google Search results in a structured JSON format. The application processes the `organic_results` returned by the API and extracts the relevant fields such as position, title, URL and description.

The project can be used with SerpApi's Free plan, which currently provides:

- 250 searches per month
- 50 searches per hour

Each successful search consumes one search from the monthly quota.

The API therefore has a limited quota on the Free plan and is intended here primarily for demonstration and development purposes.

## Logging

The server includes request logging to support basic monitoring and troubleshooting.

Logged information includes:

- timestamp,
- request ID,
- client IP address,
- search query,
- HTTP response status,
- number of returned results,
- request processing time.

This makes it possible to monitor server activity, identify individual requests and measure response times.

## Running

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
SERPAPI_KEY=your_api_key
PORT=3000
```

Start the application:

```bash
npm start
```

The application is then available at:

```text
http://localhost:3000
```

## Testing

The project contains automated tests for both server-side and frontend functionality.

The tests cover the main application logic, including:

- result transformation,
- result sorting,
- API communication,
- error handling,
- input validation,
- basic frontend behaviour.

The tests do not cover every possible case, but aim to cover the main application functionality.

External API requests are mocked during testing, so running the tests does not consume SerpApi searches.

```bash
npm test
```

## Docker

The project also includes Docker configuration for running the application in a container.

```bash
docker compose up --build
```

The repository contains the files required to build the Docker image, but the built image itself is not included.

---

Autor: Jiří Šotola  
Date: 22.9.2026
