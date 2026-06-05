document.getElementById("summarizeBtn").addEventListener("click", async () => {
    const btn = document.getElementById("summarizeBtn");
    const resultDiv = document.getElementById("result");
    
    btn.disabled = true;
    btn.innerText = "Reading page...";
    resultDiv.innerText = "";

    // 1. Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // 2. Inject a script to scrape the text from the page
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: scrapePageText,
    }, async (injectionResults) => {
        const pageText = injectionResults[0].result;
        
        btn.innerText = "Summarizing with AI...";

        try {
            // 3. Send text to your Colab API
            const response = await fetch("https://selene-goateed-overprovidently.ngrok-free.dev/summarize", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "true" // Bypasses the Ngrok free-tier warning screen
                },
                body: JSON.stringify({ text: pageText })
            });

            const data = await response.json();
            resultDiv.innerText = data.summary;
            
        } catch (error) {
            resultDiv.innerText = "Error connecting to AI backend. Is Colab running?";
            console.error(error);
        } finally {
            btn.disabled = false;
            btn.innerText = "Summarize This Page";
        }
    });
});

// This function runs inside the actual webpage to grab the text
function scrapePageText() {
    return document.body.innerText.substring(0, 5000); // Grabbing first 5000 chars for speed on Day 1
}