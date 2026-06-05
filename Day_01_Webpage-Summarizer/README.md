# Day 1: AI Webpage Summarizer Extension

A Chrome Extension that extracts text from any webpage and summarizes it using a local AI model.

## Tech Stack
* **Frontend:** HTML/JS (Chrome Manifest V3)
* **Backend:** FastAPI, Python, Google Colab
* **Model:** `facebook/bart-large-cnn` (via Hugging Face)
* **Infrastructure:** Ngrok (Secure tunneling)

## How It Works
1. The extension injects a content script to scrape the DOM.
2. Text is chunked (500 words) to bypass the 1024-token model limit without data loss.
3. The chunks are sent via Ngrok to a FastAPI server running on a Google Colab T4 GPU.
4. The BART model generates dense summaries for each chunk and returns the combined result.