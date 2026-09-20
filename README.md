# Practical exam “mozna.inizio.cz”



This web application automates the process of searching specified keywords on Google. Its main purpose is to provide a web interface to efficiently aggregate open-web data and export the structured results directly into a clean JSON format for further processing.




## Table of Contents
- [Features](#features)
- [Architecture and API Selection Search
](#architecture-and-api-selection-search)
 
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Testing](#testing)
  - [Running Tests](#running-tests)
  - [Test Coverage](#test-coverage)

---

## Features

* **Google Keyword Search:** Performs automated searches on Google based on user-defined keywords.
* **Structured JSON Output:** Can returns all retrieved data in a clean, structured JSON format.
* **Page Metadata Extraction:** Extracts and provides the title and description for each discovered webpage.


## Architecture and API Selection Search

### 1. Technologies Used and Rationale
The entire solution is implemented as a script written in **JavaScript**. The primary architectural decision was to perform data collection exclusively through programmatic **API calls instead of web scraping**.

* **Data Access via API:** The script deliberately retrieves key information from the Google search engine solely through official application programming interfaces.
* **The Web Scraping Problem:** Classical web scraping (automatically downloading and parsing results directly from Google's HTML source code) is fundamentally unsustainable today. **Google aggressively blocks scrapers** using CAPTCHA verification, constant structural layout mutations, and immediate IP bans. For reliable operations, **there is no elegant workaround** to bypass these restrictions without purchasing expensive residential rotational proxy packages. Utilizing a stable API within JavaScript is therefore the only clean, robust, and long-term functional approach.

### 2. Google Custom Search JSON API (Initial Approach & Limitations)
The initially considered **Google Custom Search JSON API** was planed in the first iteration of the script. However, the service introduces critical technological and strategic limitations that render it unusable for this project:

* **Unavailability for New Users:** The service is **completely closed to new users (like myself)**. Google Cloud Console no longer permits new projects to enable this API. The interface is currently in EOL (End of Life) status and will be **definitively shut down on January 1, 2027**.
* **Critical Functional Constraints:** The API enforces a strict free tier limit of only **100 queries per day**, which severely restricts intensive testing or data analysis.
* **Restricted Search Scope:** The most critical flaw is that this interface **does not cover the entire internet**. It is designed solely for searching specific pre-selected websites, and the free tier restricts indexing to a **maximum of 50 predefined domains**. Consequently, it cannot be used for comprehensive, global web search operations. For these reasons, the service is entirely unsuitable for modern project development.

### 3. Google AI Studio Integration (Current & Future Solution)
Due to the limitations outlined above, the JavaScript script was refactored to leverage **Google AI Studio** and its modern developer-centric search interface.

* **Rationale for Deployment:** To preserve Google-powered search capabilities while establishing a reliable architecture, I integrated the Google AI Studio API, which features direct access to live Google Search indexing.
* **Current Status (Free Tier):** Within the Free Tier, the project benefits from exceptionally generous query quotas (**up to 15 requests per minute and 5,000 free Google Search grounding prompts per month**). Executing live searches through this ecosystem provides an excellent mechanism to retrieve cleaned, structured, and validated web data in JavaScript, completely removing the overhead of parsing raw search engine results.
* **Future-Proofing and Scalability:** A massive advantage of this architecture is its absolute **readiness for the future**. When the legacy Custom Search API officially shuts down in January 2027, this JavaScript script will remain fully functional. Should the project require higher throughput or a transition to production, we can seamlessly migrate to the Paid Tier, which provides thousands of free monthly requests out-of-the-box and allows for transparent, on-demand scaling.



## Prerequisites

Before running the project, ensure you have the following installed:
* [e.g., Python 3.10+ / .NET 8 / Node.js v18+]
* A Google AI Studio API key (Gemini API)

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com[repository-name].git
   cd [repository-name]
   ```

2. **Install dependencies:**
   ```bash
   # Example for Python:
   pip install -r requirements.txt
   
   # Example for C# / .NET:
   dotnet restore
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your credentials:
   ```env
   GEMINI_API_KEY=your_free_tier_api_key_here
   ```

4. **Run the application:**
   ```bash
   # Example command:
   python main.py
   ```

## Testing

The project includes an automated test suite to ensure code reliability, proper API integration, and edge-case handling (such as API rate limits or empty search results).

### Running Tests
To execute the tests, run the following command in the terminal:

```bash
# Example for Python (pytest):
pytest

# Example for C# / .NET:
dotnet test
```

### Test Coverage
* **Unit Tests:** Verify core business logic, data formatting, and JSON parsing independent of external factors.
* **Integration Tests:** Test the communication with the Gemini API (using mocked responses where appropriate to protect the Free Tier rate limits).
* **Error Handling Tests:** Ensure the system gracefully handles API timeouts, invalid API keys, and empty search responses without crashing.



---

Autor: Jiří Šotola  
Date: 18.9.2026

