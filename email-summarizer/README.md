# Smart Email Summarizer

AI-powered Gmail Chrome extension.
Pipeline: BART summarization + spaCy NER + zero-shot intent classification,
served from Google Colab via FastAPI + ngrok.

---

## Project structure

```
email-summarizer/
├── backend/
│   ├── email_summarizer_pipeline.py   ← NLP pipeline (Colab)
│   └── api.py                         ← FastAPI server (Colab)
└── extension/
    ├── manifest.json
    ├── content.js
    ├── background.js
    ├── popup.html
    ├── popup.js
    └── icons/
        ├── icon16.png
        ├── icon48.png
        └── icon128.png
```

---

## Setup

### Step 1 — Run the Colab backend

1. Open Google Colab, set runtime to **GPU** (Runtime → Change runtime type → T4 GPU)
2. Upload both `email_summarizer_pipeline.py` and `api.py` to Colab, or paste each as cells
3. Run `email_summarizer_pipeline.py` cells first (installs deps + loads models)
4. Run `api.py` cells — it will print a public URL like:

   ```
   Public API URL:  https://abc123.ngrok-free.app
   ```

5. Copy that URL — you'll paste it into the extension settings

> Note: The ngrok URL changes every time you restart Colab.
> For a stable URL, deploy the API to Railway or Render instead.

---

### Step 2 — Load the Chrome extension

1. Open Chrome → go to `chrome://extensions`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `extension/` folder
5. The extension icon appears in your toolbar

---

### Step 3 — Add icons

You need PNG icons in `extension/icons/` at 3 sizes: 16×16, 48×48, 128×128.
Quick option: use any free icon from https://icons8.com or draw a simple placeholder.
Name them `icon16.png`, `icon48.png`, `icon128.png`.

---

### Step 4 — Connect extension to your API

1. Click the extension icon in Chrome
2. Click the ⚙ settings gear
3. Paste your ngrok URL (e.g. `https://abc123.ngrok-free.app`)
4. Click Save

---

### Step 5 — Summarize an email

1. Open Gmail
2. Open any email
3. Click the extension icon
4. Click **Summarize this email**

---

## API endpoints

| Method | Route        | Description                          |
|--------|--------------|--------------------------------------|
| GET    | /            | Health check                         |
| POST   | /summarize   | Summarize an email (main endpoint)   |
| GET    | /history     | Fetch last 20 cached summaries       |
| DELETE | /history     | Clear all cached summaries           |

### POST /summarize — request body

```json
{
  "email_body": "Hi Sarah, hope you're well...",
  "force_refresh": false
}
```

### POST /summarize — response

```json
{
  "summary":      "Sarah needs to send revised Q3 projections by Friday...",
  "intent":       { "primary": "urgent action required", "confidence": 0.91 },
  "priority":     "High",
  "entities":     { "people": ["Sarah", "John"], "dates": ["Friday, October 20th"] },
  "action_items": ["Could you please send over the revised projections..."],
  "word_count":   { "original": 120, "summary": 28 },
  "cache_hit":    false,
  "duration_ms":  3420
}
```

---

## How caching works

Results are stored in `summaries.db` (SQLite) keyed by SHA-256 hash of the email body.
If the same email is opened again, the cached result returns instantly (~5ms vs ~3-5s).
Use "↺ Refresh" in the popup to force re-processing.

---

## Upgrading the summarizer model

In `email_summarizer_pipeline.py`, swap the model name:

| Model                     | Speed  | Quality | Notes                     |
|---------------------------|--------|---------|---------------------------|
| `facebook/bart-large-cnn` | Medium | ★★★★☆  | Default, great for emails |
| `google/flan-t5-base`     | Fast   | ★★★☆☆  | Lighter, good for CPU     |
| `google/flan-t5-large`    | Slow   | ★★★★☆  | Better, needs more VRAM   |
| Gemini API                | Fast   | ★★★★★  | Best quality, needs key   |

---

## Next steps

- [ ] Deploy API to Railway/Render for a permanent URL
- [ ] Add Gemini API option for better summaries
- [ ] Support Outlook Web in addition to Gmail
- [ ] Add a history view tab in the popup
- [ ] Export summaries to Notion or Google Docs
