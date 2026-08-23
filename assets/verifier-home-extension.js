/* The Verifier · homepage architecture extension · v1.0.0
   Loaded after the main homepage script. Updates the public application manifest
   without duplicating or replacing the large index.html implementation. */
(() => {
  "use strict";

  function apply() {
    try {
      if (typeof APPS === "undefined" || !Array.isArray(APPS)) return;

      const find = id => APPS.find(app => app.id === id);

      if (!find("daily-top-30")) {
        const globalDigestIndex = APPS.findIndex(app => app.id === "global-digest");
        const item = {
          id: "daily-top-30",
          title: "Daily Top 30",
          file: "daily_digest_index.html",
          category: "live",
          icon: "30",
          badge: "Daily Edition",
          description: "A locally archived daily edition selected from The Verifier's same-origin generated feed for freshness, geographic breadth, and source diversity.",
          tags: "daily top 30 first party generated feed local archive source diversity current news"
        };
        if (globalDigestIndex >= 0) APPS.splice(globalDigestIndex, 0, item);
        else APPS.unshift(item);
      }

      const directory = find("global-digest");
      if (directory) {
        directory.title = "Global Source Directory";
        directory.badge = "Sources";
        directory.description = "The canonical Verifier directory of global publishers, regions, languages, access models, and feed availability. Inclusion is not endorsement.";
        directory.tags = "global source directory outlets regions languages provenance canonical registry";
      }

      const modern = find("modern-engine");
      if (modern) {
        modern.badge = "First-Party Engine";
        modern.description = "The primary same-origin Verifier newsroom for search, source comparison, trends, local saving, briefings, and verification research.";
        modern.tags += " first party same origin local first verification";
      }

      const kids = find("kids-news");
      if (kids) {
        kids.title = "Young Readers Newsroom";
        kids.badge = "Curated Youth";
        kids.description = "A curated, age-banded news and science doorway for young readers with transparent outbound sources and no automated child-safety guarantee.";
        kids.tags = "young readers youth curated news science age band education";
      }

      const interactive = find("interactive-news");
      if (interactive) {
        interactive.title = "Interactive Edition Explorer";
        interactive.description = "Search and explore locally archived Daily Top-30 editions with source and region filters, saving, and comparison tools.";
        interactive.tags += " daily edition local archive source diversity";
      }

      const legacyInteractive = find("interactive-live-dashboard");
      if (legacyInteractive) {
        legacyInteractive.description = "Compatibility doorway to the canonical Interactive Edition Explorer so older links remain functional.";
        legacyInteractive.badge = "Compatibility";
      }

      if (typeof renderApps === "function") renderApps();
      if (typeof syncCounts === "function") syncCounts();
      if (typeof filterApps === "function") filterApps();

      const actions = document.querySelector(".hero .actions");
      if (actions && !actions.querySelector('[data-verifier-daily-top30]')) {
        const link = document.createElement("a");
        link.href = "apps/daily_digest_index.html";
        link.className = "btn primary";
        link.textContent = "Open Daily Top 30";
        link.setAttribute("data-verifier-daily-top30", "true");
        actions.prepend(link);
      }

      const nav = document.querySelector(".nav-links");
      if (nav && !nav.querySelector('[data-verifier-daily-nav]')) {
        const link = document.createElement("a");
        link.href = "apps/daily_digest_index.html";
        link.textContent = "Daily 30";
        link.setAttribute("data-verifier-daily-nav", "true");
        nav.append(link);
      }
    } catch (error) {
      console.warn("Verifier homepage extension could not apply", error);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply, { once: true });
  else apply();
})();
