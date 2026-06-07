🧾 Receipt Reader & Expense Tracker
An AI-powered expense tracker that reads receipt images using Google Gemini Vision and turns them into a live spending dashboard — built as a beginner AI project in Google Colab.

✨ Features

📸 Upload any receipt image (JPG, PNG, or PDF screenshot)
🤖 AI extracts merchant, date, line items, totals, and category automatically
💾 Persistent SQLite database saved to Google Drive — data survives session restarts
📊 Live Gradio dashboard with spending charts that update every time you add a receipt
🗂️ Category breakdown — Food, Transport, Shopping, Healthcare, Entertainment, Utilities
💰 Monthly budget checker — see how much you've spent vs your limit
📥 CSV export — download all your data anytime


🛠️ Tech Stack
LayerToolAI / VisionGoogle Gemini 1.5 
FlashImage Processing-Pillow (PIL)
Data-Pandas + SQLite
Charts-Matplotlib
UI-Gradio
Environment-Google Colab

🚀 Getting Started
1. Get a free Gemini API key
Go to aistudio.google.com → Get API Key. It's free, no credit card needed.
2. Open in Google Colab
Show Image
3. Add your API key as a Colab Secret
In Colab: click the 🔑 key icon in the left sidebar → add a secret named GEMINI_API_KEY → paste your key.
4. Run the cells in order
Cell 1 — Setup & DB init     (run once per session)
Cell 2 — Gradio UI           (run to launch the app)
Cell 3 — Extra tools         (optional: delete, fix, export)

📱 How It Works
Receipt Image
     │
     ▼
Gemini 1.5 Flash  ──►  JSON: merchant, date, items, total, category
     │
     ▼
SQLite on Google Drive  ──►  persistent across sessions
     │
     ▼
Gradio Dashboard  ──►  charts, summaries, full table

📂 Project Structure
receipt-expense-tracker/
├── notebook/
│   └── expense_tracker.ipynb   # main Colab notebook
├── requirements.txt            # Python dependencies
├── .gitignore                  # excludes DB, secrets, cache
└── README.md                   # this file

🗓️ Roadmap

 Gemini Vision receipt extraction
 Persistent SQLite storage on Drive
 Gradio UI with live dashboard
 Category + monthly charts