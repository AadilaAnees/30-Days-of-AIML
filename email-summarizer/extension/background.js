// background.js — Service Worker
// Handles communication between popup ↔ content script ↔ API

const DEFAULT_API_URL = "https://YOUR-NGROK-URL.ngrok-free.app";

// ── Get API URL from storage (user can update it in settings) ─
async function getApiUrl() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["apiUrl"], (result) => {
      resolve(result.apiUrl || DEFAULT_API_URL);
    });
  });
}


// ── Core: fetch summary from backend ────────────────────────
async function fetchSummary(emailBody, forceRefresh = false) {
  const apiUrl = await getApiUrl();

  const response = await fetch(`${apiUrl}/summarize`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email_body:    emailBody,
      force_refresh: forceRefresh,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `API error: ${response.status}`);
  }

  return response.json();
}


// ── Message handler ──────────────────────────────────────────
// Listens for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  // ── Summarize current email ────────────────────────────────
  if (request.action === "summarize") {
    (async () => {
      try {
        // Step 1: get the active Gmail tab
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
          url: "https://mail.google.com/*",
        });

        if (!tab) {
          sendResponse({
            success: false,
            error: "Please open Gmail to use this extension."
          });
          return;
        }

        // Step 2: ask content script for the email body
        const emailData = await chrome.tabs.sendMessage(tab.id, {
          action: "getEmail"
        });

        if (!emailData.success) {
          sendResponse({ success: false, error: emailData.error });
          return;
        }

        // Step 3: call the API
        const result = await fetchSummary(
          emailData.data.body,
          request.forceRefresh || false
        );

        // Step 4: save to local history (last 50)
        saveToLocalHistory({
          subject:    emailData.data.subject,
          sender:     emailData.data.sender,
          result,
          savedAt:    new Date().toISOString(),
        });

        sendResponse({
          success: true,
          email:   emailData.data,
          result,
        });

      } catch (err) {
        sendResponse({
          success: false,
          error: err.message || "Something went wrong."
        });
      }
    })();

    return true; // async response
  }


  // ── Save / get API URL setting ─────────────────────────────
  if (request.action === "setApiUrl") {
    chrome.storage.local.set({ apiUrl: request.url }, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === "getApiUrl") {
    getApiUrl().then((url) => sendResponse({ url }));
    return true;
  }


  // ── Local history ──────────────────────────────────────────
  if (request.action === "getHistory") {
    chrome.storage.local.get(["history"], (data) => {
      sendResponse({ history: data.history || [] });
    });
    return true;
  }

  if (request.action === "clearHistory") {
    chrome.storage.local.remove(["history"], () => {
      sendResponse({ success: true });
    });
    return true;
  }

});


// ── Local history helper ─────────────────────────────────────
function saveToLocalHistory(entry) {
  chrome.storage.local.get(["history"], (data) => {
    const history = data.history || [];
    history.unshift(entry);          // newest first
    const trimmed = history.slice(0, 50); // keep last 50
    chrome.storage.local.set({ history: trimmed });
  });
}


// ── Badge: show email-changed indicator ─────────────────────
// When content.js detects a new email, show a dot on the icon
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "emailChanged") {
    chrome.action.setBadgeText({ text: "•" });
    chrome.action.setBadgeBackgroundColor({ color: "#4A90D9" });
  }
});
