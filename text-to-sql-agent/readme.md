# Day 3: AI Text-to-SQL Assistant 🔍

A Streamlit web application that allows users to query a relational database using plain English. 

## How It Works
1. **Database Setup:** Run `python sql.py` to initialize the local `student.db` SQLite database with sample records.
2. **AI Translation:** The user types a question in English (e.g., "What is the average mark of Data Science students?").
3. **Execution:** Gemini 2.5 Flash translates the prompt into a syntactically correct SQL query.
4. **Data Retrieval:** The app executes the generated SQL query directly against the SQLite database and displays the results in a custom-styled UI.

## How to Run
1. Install dependencies: `pip install -r requirements.txt`
2. Add your Google API Key to a `.env` file: `GOOGLE_API_KEY=your_key_here`
3. Initialize the database: `python sql.py`
4. Run the app: `streamlit run app.py`
