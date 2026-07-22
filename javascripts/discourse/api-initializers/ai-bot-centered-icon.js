import { apiInitializer } from "discourse/lib/api";
import cookie from "discourse/lib/cookie";
import getURL from "discourse/lib/get-url";
import DiscourseURL from "discourse/lib/url";
import I18n from "I18n";

export default apiInitializer("1.0", (api) => {
  function repositionAIBot() {
    const botBtn =
      document.querySelector(".d-header-icons .ai-bot-button") ||
      document.querySelector('.d-header-icons [data-name="ai-bot"]') ||
      document.querySelector(".d-header-icons .btn[title*='AI']") ||
      document.querySelector(".d-header-icons .btn[title*='bot']");

    if (!botBtn) return;
    if (botBtn.dataset.repositioned === "true") return;

    botBtn.dataset.repositioned = "true";

    const wrapper = document.createElement("div");
    wrapper.classList.add("ai-bot-center-wrapper");

    const clone = botBtn.cloneNode(true);
    clone.classList.add("ai-bot-centered");
    clone.dataset.repositioned = "true";

    clone.addEventListener("click", (e) => {
      e.preventDefault();
      botBtn.click();
    });

    if (settings.show_greeting_label) {
      const label = document.createElement("span");
      label.classList.add("ai-bot-label");
      label.textContent = I18n.t(themePrefix("ai_bot_greeting"));
      clone.appendChild(label);
    }

    wrapper.appendChild(clone);

    const headerContents =
      document.querySelector(".d-header > .wrap") ||
      document.querySelector(".d-header .contents");

    if (headerContents) {
      const existing = headerContents.querySelector(".ai-bot-center-wrapper");
      if (existing) return;
      headerContents.appendChild(wrapper);
    }
  }

  // ─── Anonymous visitors ───
  // The discourse-ai bot button only exists for logged-in users, so there is
  // nothing to clone for anonymous visitors. Build an identical-looking button
  // from scratch; clicking it opens a log in / sign up dialog instead of the
  // bot (which is unavailable without an account). Gated by `enable_anon_button`.

  // ─── Post-authentication redirect ───
  // Someone who clicked "Ask AI" wants the bot, not the front page, so send
  // them to the conversation page once they finish logging in or signing up.

  // The page the discourse-ai header button opens (ai-bot-header-icon.gjs).
  const AI_CONVERSATIONS_PATH = "/discourse-ai/ai-bot/conversations";

  // Kept in sessionStorage as well as in memory so the intent survives a full
  // page load of the auth form (a reload, or an external login round trip).
  const PENDING_AUTH_KEY = "wb-ai-bot-pending-auth-redirect";
  let pendingAuthRedirect = false;

  function isAuthPage() {
    return /^\/(login|signup)(\/|$)/.test(window.location.pathname);
  }

  // Ask Discourse to land the visitor on the AI page after authentication.
  // Core reads this cookie in three places — the login form (controllers/
  // login.js), account activation (users_controller.rb) and the OAuth callback
  // (omniauth_callbacks_controller.rb) — and deletes it once used, so a single
  // cookie covers every route into an account and needs no cleanup from us.
  // `path: "/"` is required: without it the browser scopes the cookie to the
  // directory of the current page, and the activation / OAuth URLs never see it.
  function rememberAIDestination() {
    cookie("destination_url", getURL(AI_CONVERSATIONS_PATH), { path: "/" });
  }

  function setPendingAuthRedirect(pending) {
    pendingAuthRedirect = pending;
    try {
      if (pending) {
        sessionStorage.setItem(PENDING_AUTH_KEY, "1");
      } else {
        sessionStorage.removeItem(PENDING_AUTH_KEY);
      }
    } catch {
      // storage unavailable (private mode, blocked site data) — the in-memory
      // flag still covers the ordinary single-document flow
    }
  }

  function hasPendingAuthRedirect() {
    if (pendingAuthRedirect) {
      return true;
    }
    try {
      return sessionStorage.getItem(PENDING_AUTH_KEY) === "1";
    } catch {
      return false;
    }
  }

  // Setting the cookie before opening the form is not enough: the `/login` and
  // `/signup` routes overwrite `destination_url` in their own `beforeModel`
  // with the page the visitor came from. That runs *after* our click, so it
  // wins everywhere except the site root — where `isValidDestinationUrl()`
  // rejects "/" and our value happens to survive. Re-assert the cookie once the
  // transition into the auth page has finished and ours is written last.
  function keepAIDestination() {
    if (!hasPendingAuthRedirect()) {
      return;
    }
    if (isAuthPage()) {
      rememberAIDestination();
    } else {
      // Off the auth pages: either authentication finished (core already
      // consumed the cookie) or the visitor walked away. Either way, stop
      // overriding where Discourse sends them.
      setPendingAuthRedirect(false);
    }
  }

  // Open Discourse's native login/signup. Primary path: click the real header
  // button, which reproduces the running version's exact behavior (modal,
  // full-page route, or SSO redirect). Fallback: route to the auth page when the
  // button is absent (e.g. invite-only hides sign-up, or a custom auth theme).
  //
  // Only reachable from the anonymous button's dialog, so the AI destination is
  // never forced on someone who started a login of their own from the header.
  function triggerAuth(selector, fallbackPath) {
    setPendingAuthRedirect(true);
    // Covers the flows that never complete a route transition (login modal,
    // single-external-login redirect); `keepAIDestination` covers the rest.
    rememberAIDestination();

    const btn =
      document.querySelector(`.d-header ${selector}`) ||
      document.querySelector(selector);
    if (btn) {
      btn.click();
      return;
    }
    DiscourseURL.routeTo(fallbackPath);
  }

  // Build a sprite-referenced FontAwesome icon as a real (namespaced) SVG node.
  // `#robot` is registered server-side by discourse-ai and pinned into the icon
  // subset via about.json `svg_icons`, so it is present for anonymous visitors.
  // A <template> parses the markup in the SVG namespace; `href` (not xlink:href)
  // is the stable sprite-reference form since Discourse 3.1.
  function createBotIcon(name) {
    const tpl = document.createElement("template");
    tpl.innerHTML =
      `<svg class="fa d-icon d-icon-${name} svg-icon" aria-hidden="true" ` +
      `xmlns="http://www.w3.org/2000/svg"><use href="#${name}"></use></svg>`;
    return tpl.content.firstElementChild;
  }

  // Open the log in / sign up dialog. Shared by the centered button and the
  // right-side fallback below. The two custom buttons replace the default OK,
  // and the dialog closes itself after either action runs.
  function openAnonDialog() {
    const dialog = api.container.lookup("service:dialog");
    dialog.alert({
      message: I18n.t(themePrefix("anon_dialog_message")),
      buttons: [
        {
          label: I18n.t(themePrefix("anon_signup")),
          class: "btn-primary",
          action: () => triggerAuth(".sign-up-button", "/signup"),
        },
        {
          label: I18n.t(themePrefix("anon_login")),
          class: "btn-default",
          action: () => triggerAuth(".login-button", "/login"),
        },
      ],
    });
  }

  // The centered, glowing button — the anonymous equivalent of the logged-in
  // clone, reusing the same `.ai-bot-centered` / `.ai-bot-label` styling.
  function makeAnonCenteredButton() {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.classList.add("ai-bot-centered", "btn", "btn-transparent");

    const greeting = I18n.t(themePrefix("ai_bot_greeting"));
    btn.setAttribute("aria-label", greeting);
    btn.title = greeting;
    btn.appendChild(createBotIcon("robot"));

    if (settings.show_greeting_label) {
      const label = document.createElement("span");
      label.classList.add("ai-bot-label");
      label.textContent = greeting;
      btn.appendChild(label);
    }

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openAnonDialog();
    });
    return btn;
  }

  // Compact icon button for the right-side header icon group. It mirrors the
  // logged-in fallback (the plugin's own right-side button) and is shown by CSS
  // exactly when the centered button is hidden: narrow screens (<580px) and when
  // a topic title is docked in the header. Anonymous visitors have no plugin
  // button to fall back to, so this is theirs.
  //
  // Wrapped in an <li> to match the sibling header icons (`.d-header-icons` is a
  // <ul>). The `.ai-bot-side-anon` marker sits on the <li> so CSS toggling its
  // display removes the whole item — no phantom gap in the icon row when hidden.
  function makeAnonSideButton() {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.classList.add("btn", "btn-flat", "icon");

    const greeting = I18n.t(themePrefix("ai_bot_greeting"));
    btn.setAttribute("aria-label", greeting);
    btn.title = greeting;
    btn.appendChild(createBotIcon("robot"));

    btn.addEventListener("click", (e) => {
      e.preventDefault();
      openAnonDialog();
    });

    const item = document.createElement("li");
    item.classList.add("ai-bot-side-anon");
    item.appendChild(btn);
    return item;
  }

  function buildAnonAIButton() {
    if (api.getCurrentUser()) return; // logged-in path (repositionAIBot) handles it
    if (!settings.enable_anon_button) return; // feature disabled

    // Centered button — shown on wide, non-topic screens.
    const headerContents =
      document.querySelector(".d-header > .wrap") ||
      document.querySelector(".d-header .contents");
    if (
      headerContents &&
      !headerContents.querySelector(".ai-bot-center-wrapper")
    ) {
      const wrapper = document.createElement("div");
      // `ai-bot-anon` distinguishes this from the logged-in clone so CSS can give
      // the anonymous centered button a higher "switch to side icon" breakpoint
      // (its right-side neighbours are the wide Log in / Sign up buttons).
      wrapper.classList.add("ai-bot-center-wrapper", "ai-bot-anon");
      wrapper.appendChild(makeAnonCenteredButton());
      headerContents.appendChild(wrapper);
    }

    // Right-side fallback — shown on narrow screens and docked-topic headers,
    // where CSS hides the centered button (each build is guarded independently
    // so re-renders of one container don't drop the other).
    const iconGroup = document.querySelector(".d-header-icons");
    if (iconGroup && !iconGroup.querySelector(".ai-bot-side-anon")) {
      iconGroup.appendChild(makeAnonSideButton());
    }
  }

  function updateAIPageFlag() {
    const onAIPage = /\/discourse-ai\/ai-bot(\/|$)/.test(window.location.pathname);
    document.documentElement.classList.toggle("on-ai-bot-page", onAIPage);
  }

  // On the full-page login / sign-up routes the anonymous button is pointless
  // (the visitor is already in the auth flow) and its centering can overlap the
  // logo, so CSS hides both variants when this flag is set.
  function updateAuthPageFlag() {
    document.documentElement.classList.toggle("on-auth-page", isAuthPage());
  }

  api.onPageChange(() => {
    // Before the frame: the cookie only has to beat the route's `beforeModel`,
    // which has already run by the time this fires.
    keepAIDestination();

    requestAnimationFrame(() => {
      repositionAIBot();
      buildAnonAIButton();
      updateAIPageFlag();
      updateAuthPageFlag();
    });
  });

  updateAIPageFlag();
  updateAuthPageFlag();

  const observer = new MutationObserver(() => {
    repositionAIBot();
    buildAnonAIButton();
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
});
