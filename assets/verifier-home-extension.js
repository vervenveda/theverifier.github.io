/* The Verifier · homepage editorial extension · v2.0.0
   Presentation-only enhancements. Newsroom inventory and metadata are owned
   exclusively by data/verifier-newsroom-directory.json. */
(() => {
  "use strict";

  function showFeedHealth() {
    const actions = document.querySelector(".hero .actions");
    if (!actions || document.querySelector("[data-verifier-feed-health]")) return;
    const status = document.createElement("p");
    status.dataset.verifierFeedHealth = "true";
    status.setAttribute("role", "status");
    status.style.cssText = "font-size:16px;line-height:1.5;margin:12px auto;color:inherit;max-width:60ch";
    status.textContent = "Checking the latest published news edition…";
    actions.insertAdjacentElement("afterend", status);

    fetch("./data/generated/latest.json", {cache:"no-store"})
      .then(response => {
        if (!response.ok) throw new Error("Edition temporarily unavailable");
        return response.json();
      })
      .then(data => {
        const stamp = Date.parse(data.generatedAt || "");
        const age = Date.now() - stamp;
        const valid = Number.isFinite(stamp) && age >= -300000;
        const healthy = Number(data.feedSourcesSuccessful || 0);
        const total = Number(data.feedSourcesConfigured || 0);
        if (!valid) {
          status.textContent = "Edition timestamp unavailable. Please check original publisher dates.";
          return;
        }
        const when = new Date(stamp).toLocaleString();
        const freshness = age > 30 * 60 * 60 * 1000 ? "Archived edition — updates may be delayed" : "Latest published edition";
        const coverage = total ? ` · Sources available: ${healthy}/${total}` : "";
        status.textContent = `${freshness} · Updated ${when}${coverage}. Headlines are publisher discoveries, not independently verified findings.`;
      })
      .catch(() => {
        status.textContent = "Live edition status unavailable. News links and research tools remain accessible.";
      });
  }

  function addDailyTop30Shortcut() {
    const actions = document.querySelector(".hero .actions");
    if (!actions || actions.querySelector("[data-verifier-daily-top30]")) return;
    const link = document.createElement("a");
    link.href = "apps/daily_digest_index.html";
    link.className = "btn primary";
    link.textContent = "Open Daily Top 30";
    link.setAttribute("data-verifier-daily-top30", "true");
    actions.prepend(link);
  }

  function apply() {
    try {
      showFeedHealth();
      addDailyTop30Shortcut();
    } catch (error) {
      console.warn("Verifier homepage editorial extension could not apply", error);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply, {once:true});
  else apply();
})();
