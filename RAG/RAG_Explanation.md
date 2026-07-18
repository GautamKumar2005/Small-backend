# RAG Data Gathering Pipeline

**GitHub Repository:** [https://github.com/GautamKumar2005/Small-backend/tree/main/RAG](https://github.com/GautamKumar2005/Small-backend/tree/main/RAG)

## Overview
This project implements the foundational data-gathering phase for a Retrieval-Augmented Generation (RAG) pipeline. Rather than just attaching a model to existing data, this module handles the end-to-end extraction process: fetching, parsing, cleaning, and structuring raw web data into a machine-readable corpus.

The scraper is designed to simulate a professional, polite bot that adheres to modern web scraping etiquette.

## Key Features & Professionalism

### 1. Politeness and Compliance
*   **Robots.txt Adherence:** Automatically fetches and parses the domain's `robots.txt` using Python's built-in `urllib.robotparser` to ensure crawling is explicitly permitted.
*   **Rate Limiting:** Enforces a mandatory delay between HTTP requests (default 1-2 seconds) to avoid server overload.
*   **Identification:** Utilizes a custom `User-Agent` string (`MyRagBot/1.0`) so the site owner can easily identify the traffic source.

### 2. Resilience and Error Handling
*   **Automatic Retries:** Implements `urllib3.util.retry.Retry` to gracefully handle transient network errors and server-side issues (HTTP 500, 502, 503, 504).

### 3. Extraction and Cleaning
*   **DOM Parsing:** Utilizes `BeautifulSoup` to accurately target and extract specific DOM elements.
*   **Data Cleansing:** Strips stylized unicode quotes, stray whitespace, and raw HTML tags, leaving behind only the pure textual content.

### 4. Structured Output
*   **JSONL Format:** Saves the extracted records incrementally in JSON Lines (`.jsonl`) format. This line-by-line JSON structure is the industry standard for feeding data into vector databases and embedding models, ensuring immediate readiness for the next stage of the RAG pipeline.
*   **Data Provenance:** Appends metadata to every record, including the exact `source_url` and a timezone-aware `scraped_at` UTC timestamp.

## Sample Output Record
```json
{
  "text": "The world as we have created it is a process of our thinking. It cannot be changed without changing our thinking.",
  "author": "Albert Einstein",
  "tags": ["change", "deep-thoughts", "thinking", "world"],
  "source_url": "http://quotes.toscrape.com/",
  "scraped_at": "2026-07-18T16:13:33.797455Z"
}
```

## Technologies Used
*   **Language:** Python 3
*   **Core Libraries:** `requests`, `beautifulsoup4`
*   **Built-in Modules:** `urllib.robotparser`, `logging`, `datetime`, `json`
