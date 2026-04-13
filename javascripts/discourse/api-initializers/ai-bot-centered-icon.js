import { apiInitializer } from "discourse/lib/api";
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
    botBtn.style.display = "none";

    const headerContents =
      document.querySelector(".d-header > .wrap") ||
      document.querySelector(".d-header .contents");

    if (headerContents) {
      const existing = headerContents.querySelector(".ai-bot-center-wrapper");
      if (existing) return;
      headerContents.appendChild(wrapper);
    }
  }

  api.onPageChange(() => {
    requestAnimationFrame(() => repositionAIBot());
  });

  const observer = new MutationObserver(() => repositionAIBot());
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
});
