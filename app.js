// Sampal - Website Client Logic & Cross-Platform Auth Sync with Supabase BaaS

const SUPABASE_CONFIG = {
  url: "https://npcnofyfmxkykufkezgk.supabase.co",
  anonKey: "sb_publishable_55YRWo-cU3FYB4WYkyJa6w_22ouabYU"
};

document.addEventListener("DOMContentLoaded", () => {
  // 1. Navigation Elements
  const videoLink = document.getElementById("nav-video-link");
  const navSignInBtn = document.getElementById("nav-signin-btn");
  const profileContainer = document.getElementById("nav-profile-container");
  const avatarBtn = document.getElementById("nav-avatar-btn");
  const avatarText = document.getElementById("nav-avatar-text");
  const profileDropdown = document.getElementById("nav-profile-dropdown");
  const dropdownUserName = document.getElementById("dropdown-user-name");
  const dropdownUserEmail = document.getElementById("dropdown-user-email");
  const dropdownPlanTag = document.getElementById("dropdown-plan-tag");
  const dropdownLogoutBtn = document.getElementById("dropdown-logout-btn");
  const buyProBtn = document.getElementById("buy-pro-btn");

  // 2. Video Link: "who drop on you on place" -> smoothly scrolls to the video section
  if (videoLink) {
    videoLink.addEventListener("click", (e) => {
      e.preventDefault();
      const videoSection = document.getElementById("easy-to-use");
      if (videoSection) {
        videoSection.scrollIntoView({ behavior: "smooth", block: "center" });
        // Subtle visual highlight pulse on the video container
        const videoWrapper = document.getElementById("video-wrapper");
        if (videoWrapper) {
          videoWrapper.style.transition = "transform 0.3s ease, box-shadow 0.3s ease";
          videoWrapper.style.transform = "scale(1.02)";
          videoWrapper.style.boxShadow = "0 16px 40px rgba(0, 180, 148, 0.2)";
          setTimeout(() => {
            videoWrapper.style.transform = "scale(1)";
            videoWrapper.style.boxShadow = "none";
          }, 600);
        }
      }
    });
  }

  // 3. Pro Plan button
  if (buyProBtn) {
    buyProBtn.addEventListener("click", () => {
      // If not logged in, trigger sign in first
      const currentUser = getCurrentUser();
      if (!currentUser) {
        handleGoogleLogin();
      } else {
        alert("Redirecting to Freemius secure checkout for Pro Plan ($9/month)...");
      }
    });
  }

  // 4. Avatar & Dropdown Logic (Claritly inspiration)
  function toggleDropdown(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const dropdown = document.getElementById("nav-profile-dropdown");
    const btn = document.getElementById("nav-avatar-btn");
    if (dropdown) {
      const isOpen = dropdown.classList.toggle("open");
      dropdown.style.display = isOpen ? "block" : "none";
      if (btn) btn.setAttribute("aria-expanded", String(isOpen));
    }
  }
  window.toggleProfileDropdown = toggleDropdown;

  if (avatarBtn) {
    avatarBtn.addEventListener("click", toggleDropdown);
  }

  document.addEventListener("click", (e) => {
    const container = document.getElementById("nav-profile-container");
    const dropdown = document.getElementById("nav-profile-dropdown");
    const btn = document.getElementById("nav-avatar-btn");
    if (btn && btn.contains(e.target)) return;
    if (dropdown && container && !container.contains(e.target)) {
      dropdown.classList.remove("open");
      dropdown.style.display = "none";
      if (btn) btn.setAttribute("aria-expanded", "false");
    }
  });

  // 5. Auth State Render Helpers
  function renderUserUI(user) {
    if (user && (user.email || user.name)) {
      if (navSignInBtn) navSignInBtn.style.display = "none";
      if (profileContainer) profileContainer.style.display = "block";

      const displayName = user.name || (user.email ? user.email.split("@")[0] : "User");
      const displayEmail = user.email || "";
      const initial = (displayName || displayEmail || "R").charAt(0).toUpperCase();

      if (avatarText) avatarText.textContent = initial;
      if (dropdownUserName) dropdownUserName.textContent = displayName;
      if (dropdownUserEmail) dropdownUserEmail.textContent = displayEmail;
      if (dropdownPlanTag) dropdownPlanTag.textContent = (user.plan || "FREE") + " PLAN";
    } else {
      if (navSignInBtn) navSignInBtn.style.display = "inline-flex";
      if (profileContainer) profileContainer.style.display = "none";
      if (profileDropdown) profileDropdown.classList.remove("open");
    }
  }

  function getCurrentUser() {
    try {
      const data = localStorage.getItem("sampal_user");
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  function setCurrentUser(user) {
    if (user) {
      localStorage.setItem("sampal_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("sampal_user");
    }
    renderUserUI(user);
  }

  // Support demo_user query param for immediate visual preview/testing
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("demo_user") || urlParams.has("test_login")) {
    setCurrentUser({
      name: "Rayan",
      email: "buildwithrayan7@gmail.com",
      plan: "FREE"
    });
  } else {
    // Render cached session immediately to prevent layout shift
    renderUserUI(getCurrentUser());
  }

  // 6. Cross-Platform Auth Sync: Window Message Bridge
  // Listen for messages from the Sampal Chrome Extension content script
  window.addEventListener("message", (event) => {
    if (event.data?.source === "SAMPAL_EXTENSION") {
      if (event.data.type === "AUTH_STATE") {
        if (event.data.loggedIn && event.data.user) {
          setCurrentUser(event.data.user);
        } else if (event.data.loggedIn === false) {
          // If extension is logged out but website has an active user session, sync it to extension!
          const activeLocalUser = getCurrentUser();
          if (activeLocalUser) {
            window.postMessage({
              source: "SAMPAL_WEBSITE",
              type: "SYNC_SESSION_FROM_WEBSITE",
              session: activeLocalUser
            }, "*");
          } else {
            setCurrentUser(null);
          }
        }
      } else if (event.data.type === "USER_LOGGED_OUT") {
        setCurrentUser(null);
      }
    }
  });

  // Request auth state from extension on page load
  window.postMessage({ source: "SAMPAL_WEBSITE", type: "REQUEST_AUTH_STATE" }, "*");

  // 7. Google Login Handler
  function handleGoogleLogin() {
    // Try to trigger extension login first
    window.postMessage({ source: "SAMPAL_WEBSITE", type: "REQUEST_GOOGLE_LOGIN" }, "*");

    // Fallback: If no response after 800ms, redirect to Supabase Google OAuth
    setTimeout(() => {
      const current = getCurrentUser();
      if (!current) {
        const redirectUrl = window.location.href.split("#")[0];
        window.location.href = `${SUPABASE_CONFIG.url}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;
      }
    }, 800);
  }

  if (navSignInBtn) {
    navSignInBtn.addEventListener("click", handleGoogleLogin);
  }

  // 8. Sign Out Handler
  function handleSignOut() {
    setCurrentUser(null);
    // Notify extension so it also logs out
    window.postMessage({ source: "SAMPAL_WEBSITE", type: "REQUEST_SIGN_OUT" }, "*");
  }

  if (dropdownLogoutBtn) {
    dropdownLogoutBtn.addEventListener("click", handleSignOut);
  }

  // 9. OAuth Callback Hash Parser (if returning from direct Supabase OAuth redirect)
  if (window.location.hash && window.location.hash.includes("access_token=")) {
    try {
      const params = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (accessToken) {
        fetch(`${SUPABASE_CONFIG.url}/auth/v1/user`, {
          headers: {
            "apikey": SUPABASE_CONFIG.anonKey,
            "Authorization": `Bearer ${accessToken}`
          }
        })
          .then((r) => r.json())
          .then((userData) => {
            if (userData && userData.id) {
              const meta = userData.user_metadata || {};
              const userObj = {
                userId: userData.id,
                email: userData.email || meta.email || "",
                name: meta.full_name || meta.name || userData.email?.split("@")[0] || "User",
                avatar: meta.avatar_url || meta.picture || "",
                plan: "FREE"
              };

              setCurrentUser(userObj);

              // Post session to extension so the extension logs into the same account!
              window.postMessage({
                source: "SAMPAL_WEBSITE",
                type: "SYNC_SESSION_FROM_WEBSITE",
                session: {
                  token: accessToken,
                  refreshToken: refreshToken || "",
                  ...userObj
                }
              }, "*");

              // Clean URL hash without reload
              history.replaceState(null, "", window.location.pathname);
            }
          })
          .catch((err) => {
            console.warn("Could not fetch user info from token:", err);
          });
      }
    } catch (err) {
      console.warn("Could not parse OAuth hash:", err);
    }
  }

  // 10. FAQ Accordion Interactivity
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    const questionBtn = item.querySelector(".faq-question");
    if (!questionBtn) return;

    questionBtn.addEventListener("click", () => {
      const isActive = item.classList.contains("active");

      // Close other open items
      faqItems.forEach((other) => {
        if (other !== item) {
          other.classList.remove("active");
          const btn = other.querySelector(".faq-question");
          if (btn) btn.setAttribute("aria-expanded", "false");
        }
      });

      // Toggle current item
      if (isActive) {
        item.classList.remove("active");
        questionBtn.setAttribute("aria-expanded", "false");
      } else {
        item.classList.add("active");
        questionBtn.setAttribute("aria-expanded", "true");
      }
    });
  });
});
