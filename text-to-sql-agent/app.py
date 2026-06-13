from dotenv import load_dotenv
load_dotenv()

import streamlit as st
import os
import sqlite3

import google.generativeai as genai

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

#Custom CSS 
st.markdown("""
    <style>
        /* Page background */
        .stApp {
            background-color: #0f1117;
            color: #e8e8e8;
        }

        /* Header */
        .main-header {
            text-align: center;
            padding: 2rem 0 0.5rem 0;
        }
        .main-header h1 {
            font-size: 2.2rem;
            font-weight: 700;
            color: #ffffff;
            letter-spacing: -0.5px;
        }
        .main-header p {
            color: #888;
            font-size: 0.95rem;
            margin-top: 0.25rem;
        }

        /* Input box */
        .stTextInput > div > div > input {
            background-color: #1c1f2e;
            color: #e8e8e8;
            border: 1px solid #2e3150;
            border-radius: 10px;
            padding: 0.75rem 1rem;
            font-size: 1rem;
        }
        .stTextInput > div > div > input:focus {
            border-color: #4f6ef7;
            box-shadow: 0 0 0 2px rgba(79,110,247,0.2);
        }

        /* Button */
        .stButton > button {
            background: linear-gradient(135deg, #4f6ef7, #7c3aed);
            color: white;
            border: none;
            border-radius: 10px;
            padding: 0.6rem 2rem;
            font-size: 1rem;
            font-weight: 600;
            width: 100%;
            transition: opacity 0.2s;
        }
        .stButton > button:hover {
            opacity: 0.88;
        }

        /* SQL chip */
        .sql-box {
            background-color: #1a1d2e;
            border-left: 3px solid #4f6ef7;
            border-radius: 8px;
            padding: 0.85rem 1.2rem;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            color: #a5b4fc;
            margin: 1rem 0;
        }

        /* Result table rows */
        .result-row {
            background-color: #1c1f2e;
            border-radius: 8px;
            padding: 0.75rem 1.2rem;
            margin-bottom: 0.5rem;
            border: 1px solid #2a2d42;
            color: #e8e8e8;
            font-size: 0.95rem;
        }
        .result-row:hover {
            border-color: #4f6ef7;
        }

        /* Section labels */
        .section-label {
            font-size: 0.78rem;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            color: #555;
            margin-bottom: 0.5rem;
        }

        /* Divider */
        hr {
            border-color: #2a2d42;
        }
    </style>
""", unsafe_allow_html=True)



#FUNCTION TO LOAD GOOGLE GEMINI MODEL

def get_gemini_response(question, prompt):
    model=genai.GenerativeModel('gemini-2.5-flash')
    response=model.generate_content([prompt[0],question])
    return response.text

#functon to retrieve query from sql database

def read_sql_query(sql,db):
    conn=sqlite3.connect(db)
    cur=conn.cursor()
    cur.execute(sql)
    rows=cur.fetchall()
    conn.commit()
    conn.close()
    for row in rows:
        print (row)
    return rows


#prompt
prompt=[
    """
    You are an expert in converting English questions to SQL query!
    The SQL database has the name STUDENT and has the following columns - NAME, CLASS, 
    SECTION and MARKS \n\nFor example,\nExample 1 - How many entries of records are present?, 
    the SQL command will be something like this SELECT COUNT(*) FROM STUDENT ;
    \nExample 2 - Tell me all the students studying in Data Science class?, 
    the SQL command will be something like this SELECT * FROM STUDENT 
    where CLASS="Data Science"; 
    also the sql code should not have ``` in beginning or end and sql word in output

    """
]
# Layout 
st.markdown("""
    <div class="main-header">
        <h1>🔍 SQL Query Assistant</h1>
        <p>Ask anything about your student database in plain English</p>
    </div>
""", unsafe_allow_html=True)

st.markdown("---")

col1, col2 = st.columns([5, 1])
with col1:
    question = st.text_input("", placeholder="e.g. What is the average marks of Data Science students?", key="input", label_visibility="collapsed")
with col2:
    submit = st.button("Ask →")


# On Submit
if submit and question:
    with st.spinner("Thinking..."):
        sql = get_gemini_response(question, prompt)
        data = read_sql_query(sql, "student.db")

    # Show generated SQL
    st.markdown('<p class="section-label">Generated SQL</p>', unsafe_allow_html=True)
    st.markdown(f'<div class="sql-box">{sql}</div>', unsafe_allow_html=True)

    st.markdown("---")

    # Show results
    st.markdown('<p class="section-label">Results</p>', unsafe_allow_html=True)

    if data:
        for row in data:
            formatted = " &nbsp;|&nbsp; ".join(str(val) for val in row)
            st.markdown(f'<div class="result-row">{formatted}</div>', unsafe_allow_html=True)
        st.caption(f"{len(data)} row(s) returned")
    else:
        st.info("No results found.")

elif submit and not question:
    st.warning("Please enter a question first.")





