// popup.js — UI logic for the extension popup

// ── View references ───────────────────────────────────────────
const views = {
  idle:     document.getElementById("view-idle"),
  loading:  document.getElementById("view-loading"),
  error:    document.getElementById("view-error"),
  result:   document.getElementById("view-result"),
  settings: document.getElementById("view-settings"),
};

function showView(name) {
  Object.entries(views).forEach(([key, el]) => {
    el.style.display = key === name ? "block" : "none";
  });
}

// ── Loading messages cycle ────────────────────────────────────
const LOADING_MSGS = [
  "Reading email…",
  "Running NLP pipeline…",
  "Summarizing content…",
  "Extracting entities…",
  "Classifying intent…",
  "Almost there…",
];
let loadingInterval = null;

function startLoadingCycle() {
  let i = 0;
  const el = document.getElementById("loading-text");
  el.textContent = LOADING_MSGS[0];
  loadingInterval = setInterval(() => {
    i = (i + 1) % LOADING_MSGS.length;
    el.textContent = LOADING_MSGS[i];
  }, 1800);
}

function stopLoadingCycle() {
  if (loadingInterval) clearInterval(loadingInterval);
}


// ── Render result ─────────────────────────────────────────────
function renderResult(email, result) {
  // Email meta
  document.getElementById("res-subject").textContent = email.subject || "(no subject)";
  document.getElementById("res-sender").textContent  = `From: ${email.sender || "unknown"}`;

  // Priority badge
  const badge = document.getElementById("res-priority-badge");
  badge.textContent = result.priority;
  badge.className = "badge badge-" + result.priority.toLowerCase();

  // Intent
  const intentConf = Math.round((result.intent.confidence || 0) * 100);
  document.getElementById("res-intent").textContent =
    `${capitalize(result.intent.primary)} (${intentConf}%)`;

  // Summary
  document.getElementById("res-summary").textContent = result.summary;

  // Action items
  const actSection = document.getElementById("action-section");
  const actList    = document.getElementById("res-actions");
  actList.innerHTML = "";

  if (result.action_items && result.action_items.length) {
    actSection.style.display = "block";
    result.action_items.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      actList.appendChild(li);
    });
  } else {
    actSection.style.display = "none";
  }

  // Entities as chips
  const entSection  = document.getElementById("entity-section");
  const chipsEl     = document.getElementById("res-entities");
  chipsEl.innerHTML = "";

  const chipTypes = {
    people:        "chip-people",
    organizations: "chip-orgs",
    dates:         "chip-dates",
    locations:     "chip-loc",
  };

  let hasEntities = false;
  Object.entries(chipTypes).forEach(([type, cls]) => {
    const items = result.entities[type] || [];
    items.forEach(item => {
      hasEntities = true;
      const chip = document.createElement("span");
      chip.className = `chip ${cls}`;
      chip.textContent = item;
      chipsEl.appendChild(chip);
    });
  });

  entSection.style.display = hasEntities ? "block" : "none";

  // Stats
  const wc = result.word_count || {};
  document.getElementById("res-words").textContent =
    `${wc.original || "?"} → ${wc.summary || "?"}`;
  document.getElementById("res-time").textContent =
    result.duration_ms ? `${result.duration_ms}ms` : "—";

  const cacheStat = document.getElementById("res-cache-stat");
  cacheStat.textContent = result.cache_hit ? "⚡ Cached" : "✦ Fresh";
  cacheStat.style.color = result.cache_hit ? "#2e7d32" : "#4A90D9";

  showView("result");
}


// ── Summarize ─────────────────────────────────────────────────
function runSummarize(forceRefresh = false) {
  showView("loading");
  startLoadingCycle();

  chrome.runtime.sendMessage(
    { action: "summarize", forceRefresh },
    (response) => {
      stopLoadingCycle();

      if (chrome.runtime.lastError) {
        showError("Extension error: " + chrome.runtime.lastError.message);
        return;
      }

      if (!response || !response.success) {
        showError(response?.error || "Unknown error. Is your API running?");
        return;
      }

      renderResult(response.email, response.result);
    }
  );
}


// ── Error view ────────────────────────────────────────────────
function showError(msg) {
  document.getElementById("error-message").textContent = msg;
  showView("error");
}


// ── Settings ──────────────────────────────────────────────────
function openSettings() {
  chrome.runtime.sendMessage({ action: "getApiUrl" }, (res) => {
    if (res?.url) {
      document.getElementById("input-api-url").value = res.url;
    }
    showView("settings");
  });
}


// ── Helpers ───────────────────────────────────────────────────
function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}


// ── Event listeners ───────────────────────────────────────────
document.getElementById("btn-summarize").addEventListener("click", () => {
  runSummarize(false);
});

document.getElementById("btn-refresh").addEventListener("click", () => {
  runSummarize(true);  // force_refresh = true, bypasses cache
});

document.getElementById("btn-back").addEventListener("click", () => {
  showView("idle");
});

document.getElementById("btn-error-retry").addEventListener("click", () => {
  runSummarize(false);
});

document.getElementById("btn-error-back").addEventListener("click", () => {
  showView("idle");
});

document.getElementById("btn-toggle-settings").addEventListener("click", () => {
  openSettings();
});

document.getElementById("btn-settings-back").addEventListener("click", () => {
  showView("idle");
});

document.getElementById("btn-save-url").addEventListener("click", () => {
  const url = document.getElementById("input-api-url").value.trim();
  if (!url.startsWith("http")) {
    alert("Please enter a valid URL starting with https://");
    return;
  }
  chrome.runtime.sendMessage({ action: "setApiUrl", url }, () => {
    showView("idle");
  });
});

document.getElementById("btn-clear-history").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "clearHistory" }, () => {
    alert("History cleared.");
  });
});

// ── Clear badge when popup opens ──────────────────────────────
chrome.action.setBadgeText({ text: "" });

// ── Start on idle view ────────────────────────────────────────
showView("idle");
