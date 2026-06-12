// content.js
// Injected into mail.google.com — reads the open email body

// ── Email extraction ─────────────────────────────────────────
function getEmailBody() {
  // Gmail renders expanded email bodies in .a3s.aiL
  // Multiple elements may exist (thread), grab the latest visible one
  const candidates = document.querySelectorAll(".a3s.aiL");
  if (!candidates.length) return null;

  // Pick the last one (most recent in thread)
  const el = candidates[candidates.length - 1];
  const text = el.innerText.trim();

  // Sanity check — ignore tiny snippets
  return text.length > 30 ? text : null;
}

function getEmailSubject() {
  const el = document.querySelector("h2.hP");
  return el ? el.innerText.trim() : "(no subject)";
}

function getEmailSender() {
  const el = document.querySelector(".gD");
  return el ? (el.getAttribute("email") || el.innerText.trim()) : "unknown";
}


// ── Message listener ─────────────────────────────────────────
// background.js sends { action: "getEmail" } when the user
// clicks the extension icon. We respond with the email data.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action !== "getEmail") return;

  const body    = getEmailBody();
  const subject = getEmailSubject();
  const sender  = getEmailSender();

  if (!body) {
    sendResponse({
      success: false,
      error: "No email open. Please open an email in Gmail first."
    });
    return true;
  }

  sendResponse({
    success: true,
    data: { body, subject, sender }
  });

  return true; // keep channel open for async
});


// ── MutationObserver — handle Gmail SPA navigation ───────────
// Gmail never does a full page reload. When the user opens a
// new email, the DOM changes. We watch for that so the extension
// always reads the currently open email, not a stale one.

let lastEmailHash = null;

function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < Math.min(str.length, 200); i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return h;
}

const observer = new MutationObserver(() => {
  const body = getEmailBody();
  if (!body) return;

  const hash = simpleHash(body);
  if (hash === lastEmailHash) return; // same email, do nothing

  lastEmailHash = hash;

  // Notify background that a new email is open
  // (optional — only needed if you want auto-summarize on open)
  chrome.runtime.sendMessage({
    action: "emailChanged",
    subject: getEmailSubject(),
    sender:  getEmailSender(),
  }).catch(() => {}); // suppress error if popup isn't open
});

observer.observe(document.body, {
  childList: true,
  subtree:   true,
});
