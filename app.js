// ====================================================================
// SAMPLE WEBSITE - CLIENT LOGIC & REAL-TIME AI SIMULATOR
// Brand: Sampal
// Theme: Pure Black & Glowing Teal
// ====================================================================

document.addEventListener("DOMContentLoaded", () => {
  // 1. Tab / Demo Filter Switching
  const filterChips = document.querySelectorAll(".filter-chip");
  const demoCards = document.querySelectorAll(".demo-card");

  filterChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      filterChips.forEach((c) => c.classList.remove("active"));
      demoCards.forEach((card) => card.classList.remove("active"));

      chip.classList.add("active");
      const targetId = chip.dataset.target;
      const targetCard = document.getElementById(targetId);
      if (targetCard) targetCard.classList.add("active");
    });
  });

  // 2. Quick Run Buttons on Cards
  document.querySelectorAll(".btn-quick-run").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const card = e.target.closest(".demo-card");
      if (!card) return;
      const textElem = card.querySelector(".selectable-content p");
      const text = textElem ? textElem.textContent.trim() : "";
      const customPrompt = btn.dataset.prompt || "Explain this simply and check the facts:";
      if (window.__triggerSampalModal) {
        window.__triggerSampalModal(text, customPrompt);
      }
    });
  });

  // 3. Custom Input Box Actions
  const customInput = document.getElementById("custom-text-input");
  const customExplainBtn = document.getElementById("custom-explain-btn");
  const customFactCheckBtn = document.getElementById("custom-factcheck-btn");

  if (customExplainBtn && customInput) {
    customExplainBtn.addEventListener("click", () => {
      const val = customInput.value.trim();
      if (!val) {
        customInput.focus();
        return;
      }
      if (window.__triggerSampalModal) {
        window.__triggerSampalModal(val, "Explain this concept simply in clean, easy-to-understand bullet points:");
      }
    });
  }

  if (customFactCheckBtn && customInput) {
    customFactCheckBtn.addEventListener("click", () => {
      const val = customInput.value.trim();
      if (!val) {
        customInput.focus();
        return;
      }
      if (window.__triggerSampalModal) {
        window.__triggerSampalModal(val, "Fact check this statement. Provide a clear truthfulness rating, context, and caveats:");
      }
    });
  }

  // 4. Copy Extension Path
  const copyBtn = document.getElementById("copy-path-btn");
  const pathDisplay = document.getElementById("folder-path");
  if (copyBtn && pathDisplay) {
    copyBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(pathDisplay.textContent.trim()).then(() => {
        copyBtn.textContent = "Copied!";
        copyBtn.style.background = "#0df2c9";
        copyBtn.style.color = "#040507";
        setTimeout(() => {
          copyBtn.textContent = "Copy Path";
          copyBtn.style.background = "";
          copyBtn.style.color = "";
        }, 2200);
      });
    });
  }

  // 5. Initialize the Built-In Sampal Web AI Simulator
  initSampalWebSimulator();
});

// ====================================================================
// BUILT-IN SAMPLE AI WEB SIMULATOR
// (Runs DeepSeek AI with Safety Check & Fact-Checking)
// ====================================================================
function initSampalWebSimulator() {
  const DEEPSEEK_API_KEY = atob("c2stNjk5OTI2NTEyOGRjNDg1Nzk0ZTliOWZiYjMxZjRhNjU=");
  const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

  // Prevent duplicate mounts
  if (document.getElementById("sampal-ai-sim-root")) return;

  const simHost = document.createElement("sampal-host");
  simHost.id = "sampal-ai-sim-root";
  document.body.appendChild(simHost);
  const shadow = simHost.attachShadow({ mode: "open" });

  const styleEl = document.createElement("style");
  styleEl.textContent = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    
    /* Floating Ask AI Pill */
    .sampal-pill {
      position: fixed; z-index: 2147483647; display: flex; align-items: center; gap: 7px;
      background: #040507; border: 1px solid rgba(13, 242, 201, 0.4);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7), 0 0 16px rgba(13, 242, 201, 0.25);
      border-radius: 9999px; padding: 7px 16px 7px 12px; cursor: pointer; user-select: none;
      opacity: 0; transform: translateY(6px) scale(0.95); transition: all 0.16s ease; pointer-events: none;
    }
    .sampal-pill.sampal-visible { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
    .sampal-pill:hover {
      background: #0a0e14; border-color: #0df2c9; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8), 0 0 24px rgba(13, 242, 201, 0.45);
      transform: translateY(-1px) scale(1.03);
    }
    .sampal-pill-sparkle { color: #0df2c9; font-size: 14px; font-weight: 800; }
    .sampal-pill-text { color: #ffffff; font-size: 13.5px; font-weight: 700; letter-spacing: -0.01em; }

    /* Modal Backdrop */
    .sampal-backdrop {
      position: fixed; inset: 0; background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(12px);
      z-index: 2147483645; opacity: 0; pointer-events: none; transition: opacity 0.22s ease;
    }
    .sampal-backdrop.sampal-visible { opacity: 1; pointer-events: auto; }

    /* Modal Panel */
    .sampal-panel {
      position: fixed; z-index: 2147483646; right: 28px; bottom: 28px;
      width: 440px; max-width: calc(100vw - 36px); height: 630px; max-height: calc(100vh - 56px);
      background: #06080b; border: 1px solid rgba(13, 242, 201, 0.35); border-radius: 20px;
      box-shadow: 0 28px 70px rgba(0, 0, 0, 0.9), 0 0 35px rgba(13, 242, 201, 0.15);
      display: flex; flex-direction: column; overflow: hidden;
      opacity: 0; transform: translateY(16px) scale(0.97); pointer-events: none; transition: all 0.24s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .sampal-panel.sampal-open { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
    
    .sampal-panel.sampal-fullscreen {
      top: 24px !important; left: 24px !important; right: 24px !important; bottom: 24px !important;
      width: calc(100vw - 48px) !important; height: calc(100vh - 48px) !important; border-radius: 16px;
    }

    /* Header */
    .sampal-header {
      height: 52px; padding: 0 18px; display: flex; align-items: center; justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08); background: #040507; flex-shrink: 0;
    }
    .sampal-header-left { display: flex; align-items: center; gap: 8px; }
    .sampal-sparkle { color: #0df2c9; font-size: 15px; font-weight: 900; }
    .sampal-title { font-size: 15px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em; }
    .sampal-badge {
      font-size: 10px; font-weight: 700; color: #0df2c9; background: rgba(13, 242, 201, 0.12);
      border: 1px solid rgba(13, 242, 201, 0.3); border-radius: 9999px; padding: 2px 7px;
    }

    .sampal-header-actions { display: flex; align-items: center; gap: 6px; }
    .sampal-btn-icon {
      background: transparent; border: none; width: 32px; height: 32px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center; color: #94a3b8; cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }
    .sampal-btn-icon:hover { background: rgba(255, 255, 255, 0.08); color: #ffffff; }
    .sampal-btn-icon.cut-btn:hover { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
    .sampal-btn-icon svg { width: 16px; height: 16px; stroke: currentColor; stroke-width: 2.2; fill: none; }

    /* Body */
    .sampal-body { flex: 1; overflow-y: auto; padding: 18px; display: flex; flex-direction: column; gap: 16px; }
    .sampal-body::-webkit-scrollbar { width: 5px; }
    .sampal-body::-webkit-scrollbar-thumb { background: rgba(13, 242, 201, 0.25); border-radius: 9999px; }

    /* Context Chip */
    .sampal-context-card {
      background: rgba(13, 242, 201, 0.05); border: 1px solid rgba(13, 242, 201, 0.2);
      border-radius: 12px; padding: 12px 14px; flex-shrink: 0;
    }
    .sampal-context-label {
      font-size: 10.5px; font-weight: 700; color: #0df2c9; text-transform: uppercase;
      letter-spacing: 0.06em; margin-bottom: 5px; display: flex; align-items: center; gap: 6px;
    }
    .sampal-context-text {
      font-size: 12.5px; color: #cbd5e1; line-height: 1.5; font-style: italic;
      display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
    }

    /* Safety Alert */
    .sampal-safety-box {
      background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.4);
      border-radius: 12px; padding: 14px; color: #ef4444; font-size: 13px; line-height: 1.5;
    }
    .sampal-safety-box strong { display: block; font-size: 13.5px; margin-bottom: 4px; }

    /* Output Card */
    .sampal-response-card {
      background: #090c10; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px;
      padding: 16px; line-height: 1.65; font-size: 14px; color: #f1f5f9; white-space: pre-wrap; word-break: break-word;
    }
    .sampal-response-card h4 {
      color: #0df2c9; font-size: 14px; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;
    }

    /* Pulse Loader */
    .sampal-loader {
      display: inline-flex; align-items: center; gap: 8px; font-size: 13px;
      color: #0df2c9; font-weight: 600; padding: 8px 12px;
    }
    .sampal-dot-pulse {
      width: 7px; height: 7px; border-radius: 50%; background: #0df2c9;
      box-shadow: 0 0 12px #0df2c9; animation: pulseTeal 1.2s infinite ease-in-out;
    }

    /* Footer Input */
    .sampal-footer {
      padding: 12px 14px; border-top: 1px solid rgba(255, 255, 255, 0.08);
      background: #040507; flex-shrink: 0;
    }
    .sampal-input-row {
      display: flex; align-items: center; background: #0a0e14;
      border: 1px solid rgba(13, 242, 201, 0.25); border-radius: 9999px; padding: 4px 6px 4px 14px; gap: 8px;
    }
    .sampal-input-row:focus-within {
      border-color: #0df2c9; box-shadow: 0 0 16px rgba(13, 242, 201, 0.3);
    }
    .sampal-input-field {
      flex: 1; background: transparent; border: none; outline: none;
      color: #ffffff; font-size: 13.5px;
    }
    .sampal-send-btn {
      width: 32px; height: 32px; border-radius: 50%; background: #0df2c9;
      border: none; color: #040507; display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: transform 0.15s; flex-shrink: 0;
    }
    .sampal-send-btn:hover { transform: scale(1.08); box-shadow: 0 0 14px rgba(13, 242, 201, 0.6); }
    .sampal-send-btn svg { width: 14px; height: 14px; stroke: currentColor; stroke-width: 2.5; fill: none; }
  `;

  shadow.appendChild(styleEl);

  // Floating Pill
  const pill = document.createElement("div");
  pill.className = "sampal-pill";
  pill.innerHTML = `
    <span class="sampal-pill-sparkle">*</span>
    <span class="sampal-pill-text">Ask AI</span>
  `;
  shadow.appendChild(pill);

  // Backdrop
  const backdrop = document.createElement("div");
  backdrop.className = "sampal-backdrop";
  shadow.appendChild(backdrop);

  // Modal Panel
  const panel = document.createElement("div");
  panel.className = "sampal-panel";
  panel.innerHTML = `
    <div class="sampal-header">
      <div class="sampal-header-left">
        <span class="sampal-sparkle">*</span>
        <span class="sampal-title">Sampal</span>
        <span class="sampal-badge">AI Clarity</span>
      </div>
      <div class="sampal-header-actions">
        <button class="sampal-btn-icon" id="btn-fullscreen" title="Toggle Fullscreen">
          <svg viewBox="0 0 24 24"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg>
        </button>
        <button class="sampal-btn-icon cut-btn" id="btn-close" title="Close Panel">
          <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    </div>

    <div class="sampal-body" id="sampal-body">
      <div class="sampal-context-card" id="context-box">
        <div class="sampal-context-label">
          <span>🎯 Highlighted Context</span>
        </div>
        <div class="sampal-context-text" id="context-text">No text selected</div>
      </div>
      <div id="output-area"></div>
    </div>

    <div class="sampal-footer">
      <div class="sampal-input-row">
        <input type="text" class="sampal-input-field" id="followup-input" placeholder="Ask a follow-up or check another fact..." />
        <button class="sampal-send-btn" id="send-btn" title="Send question">
          <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </div>
    </div>
  `;
  shadow.appendChild(panel);

  const contextBox = shadow.getElementById("context-box");
  const contextText = shadow.getElementById("context-text");
  const outputArea = shadow.getElementById("output-area");
  const followupInput = shadow.getElementById("followup-input");
  const sendBtn = shadow.getElementById("send-btn");
  const btnClose = shadow.getElementById("btn-close");
  const btnFullscreen = shadow.getElementById("btn-fullscreen");

  let currentSelectedText = "";
  let isFullscreen = false;

  // Text selection tracking
  document.addEventListener("mouseup", (e) => {
    // If clicking inside panel, ignore
    if (panel.classList.contains("sampal-open") && e.composedPath().includes(simHost)) return;

    setTimeout(() => {
      const selection = window.getSelection();
      const text = selection ? selection.toString().trim() : "";

      if (text.length > 2) {
        currentSelectedText = text;
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        const pillTop = Math.max(10, rect.top - 46);
        const pillLeft = Math.min(window.innerWidth - 130, Math.max(10, rect.left + rect.width / 2 - 50));

        pill.style.top = `${pillTop}px`;
        pill.style.left = `${pillLeft}px`;
        pill.classList.add("sampal-visible");
      } else {
        pill.classList.remove("sampal-visible");
      }
    }, 20);
  });

  // Clicking floating pill
  pill.addEventListener("click", () => {
    pill.classList.remove("sampal-visible");
    openSampalModal(currentSelectedText, "Explain this simply in clean style and verify the facts:");
  });

  // Global trigger function for buttons
  window.__triggerSampalModal = (text, promptInstruction) => {
    currentSelectedText = text;
    openSampalModal(text, promptInstruction);
  };

  function openSampalModal(selectedText, promptInstruction) {
    backdrop.classList.add("sampal-visible");
    panel.classList.add("sampal-open");
    contextText.textContent = selectedText || "No context text selected";
    outputArea.innerHTML = "";

    runDeepSeekFlow(selectedText, promptInstruction);
  }

  function closeSampalModal() {
    backdrop.classList.remove("sampal-visible");
    panel.classList.remove("sampal-open");
  }

  btnClose.addEventListener("click", closeSampalModal);
  backdrop.addEventListener("click", closeSampalModal);

  btnFullscreen.addEventListener("click", () => {
    isFullscreen = !isFullscreen;
    panel.classList.toggle("sampal-fullscreen", isFullscreen);
  });

  // Follow-up interaction
  sendBtn.addEventListener("click", handleFollowUp);
  followupInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleFollowUp();
  });

  function handleFollowUp() {
    const q = followupInput.value.trim();
    if (!q) return;
    followupInput.value = "";

    // Append user question
    const userMsg = document.createElement("div");
    userMsg.style.cssText = "background: rgba(13,242,201,0.12); border: 1px solid rgba(13,242,201,0.3); border-radius: 12px; padding: 10px 14px; font-size: 13.5px; color: #ffffff; align-self: flex-end; max-width: 85%; margin-bottom: 8px;";
    userMsg.textContent = q;
    outputArea.appendChild(userMsg);

    runDeepSeekFlow(currentSelectedText, `User follow-up: "${q}". Explain clearly with reference to the original text:`);
  }

  // Real DeepSeek Safety Pre-Screening & Explanation Flow
  async function runDeepSeekFlow(text, instruction) {
    const loader = document.createElement("div");
    loader.className = "sampal-loader";
    loader.innerHTML = `
      <span class="sampal-dot-pulse"></span>
      <span>Sampal AI analyzing & checking facts...</span>
    `;
    outputArea.appendChild(loader);
    outputArea.scrollTop = outputArea.scrollHeight;

    try {
      // Step 1: Safety Screening
      const safetyPrompt = `You are a strict safety classifier. Analyze the following user text and determine if it contains extreme violence, sexual abuse, illegal gambling, or dangerous/harmful advice. Answer with ONLY "YES" if it contains unsafe content, or "NO" if it is safe to process.\n\nText: "${text}"`;

      const safetyRes = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "user", content: safetyPrompt }],
          max_tokens: 10,
          temperature: 0.1
        })
      });

      const safetyData = await safetyRes.json();
      const safetyAnswer = safetyData?.choices?.[0]?.message?.content?.trim().toUpperCase() || "NO";

      if (safetyAnswer.includes("YES")) {
        loader.remove();
        const alertBox = document.createElement("div");
        alertBox.className = "sampal-safety-box";
        alertBox.innerHTML = `
          <strong>🛡️ Content Flagged by Safety Guard</strong>
          This text contains potential extreme, harmful, or abusive themes and cannot be processed under our safety guidelines.
        `;
        outputArea.appendChild(alertBox);
        return;
      }

      // Step 2: Clear Explanation & Fact-Checking
      const explainPrompt = `${instruction}\n\n"${text}"\n\nProvide your response in 2 clear sections:\n1. 💡 Plain English Meaning (Simple, direct explanation without jargon)\n2. 🔍 Fact Check & Accuracy (Verify truthfulness, context, and key facts)`;

      const explainRes = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: "You are Sampal AI, a super clean, concise web assistant that explains complex topics simply in plain English and checks facts accurately."
            },
            { role: "user", content: explainPrompt }
          ],
          temperature: 0.3,
          max_tokens: 650
        })
      });

      const explainData = await explainRes.json();
      loader.remove();

      const reply = explainData?.choices?.[0]?.message?.content || "Unable to generate explanation.";

      const card = document.createElement("div");
      card.className = "sampal-response-card";
      outputArea.appendChild(card);

      // Smooth typewriter effect
      streamTypewriter(card, reply);

    } catch (err) {
      loader.remove();
      const errBox = document.createElement("div");
      errBox.className = "sampal-response-card";
      errBox.style.borderColor = "rgba(239, 68, 68, 0.4)";
      errBox.textContent = "Error reaching DeepSeek AI. Please check your internet connection and try again.";
      outputArea.appendChild(errBox);
    }
  }

  function streamTypewriter(container, text) {
    let index = 0;
    const speed = 12;
    container.textContent = "";

    function step() {
      if (index < text.length) {
        container.textContent += text.charAt(index);
        index++;
        outputArea.scrollTop = outputArea.scrollHeight;
        setTimeout(step, speed);
      }
    }
    step();
  }
}
