/* The Verifier · Same-Origin News Data Client · v1.0.0
   Primary path: data/generated/latest.json produced by GitHub Actions.
   This module never treats feed discovery as factual verification. */
(() => {
  "use strict";

  const MAX_AGE_MS = 3 * 60 * 60 * 1000;
  const LATEST_URL = "../data/generated/latest.json";
  const REGISTRY_URL = "../data/sources.json";

  function safeText(value, limit = 5000) {
    const helper = window.VerifierSafety;
    if (helper?.text) return helper.text(value, limit);
    return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, limit);
  }

  function safeURL(value) {
    const helper = window.VerifierSafety;
    if (helper?.safeExternalURL) return helper.safeExternalURL(value) || "";
    try {
      const url = new URL(String(value || ""));
      return url.protocol === "https:" && !url.username && !url.password ? url.href : "";
    } catch (_) { return ""; }
  }

  function normalizeStory(raw) {
    const link = safeURL(raw?.link);
    const title = safeText(raw?.title, 500);
    if (!title || !link) return null;
    const pubMs = Number(raw?.pubMs || Date.parse(raw?.pubDate || "") || 0);
    return {
      id: safeText(raw?.id || `${raw?.sourceId || "source"}:${link}`, 900),
      title,
      description: safeText(raw?.description, 1400),
      link,
      image: safeURL(raw?.image),
      pubDate: safeText(raw?.pubDate, 100),
      pubMs: Number.isFinite(pubMs) ? pubMs : 0,
      sourceId: safeText(raw?.sourceId, 120),
      source: safeText(raw?.source, 220),
      region: safeText(raw?.region, 140),
      country: safeText(raw?.country, 140),
      languages: Array.isArray(raw?.languages) ? raw.languages.map(x => safeText(x, 80)).filter(Boolean).slice(0, 8) : [],
      topics: Array.isArray(raw?.topics) ? raw.topics.map(x => safeText(x, 100)).filter(Boolean).slice(0, 12) : [],
      sourceType: safeText(raw?.sourceType, 120),
      sourceHomepage: safeURL(raw?.sourceHomepage),
      verificationStatus: "discovered"
    };
  }

  async function fetchJSON(url, timeout = 12000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, { signal: controller.signal, cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } finally { clearTimeout(timer); }
  }

  async function loadLatest({ allowStale = true } = {}) {
    const data = await fetchJSON(LATEST_URL);
    if (Number(data?.schemaVersion) !== 1 || !Array.isArray(data?.stories)) {
      throw new Error("Unsupported generated feed payload");
    }
    const generatedAt = Date.parse(data.generatedAt || "");
    const ageMs = Number.isFinite(generatedAt) ? Math.max(0, Date.now() - generatedAt) : Infinity;
    if (!allowStale && ageMs > MAX_AGE_MS) throw new Error("Generated feed is stale");
    const stories = data.stories.map(normalizeStory).filter(Boolean);
    return {
      mode: ageMs <= MAX_AGE_MS ? "first-party" : "first-party-stale",
      generatedAt: data.generatedAt || "",
      ageMs,
      stories,
      sourceHealth: Array.isArray(data.sourceHealth) ? data.sourceHealth : [],
      disclosure: safeText(data.disclosure, 600),
      feedSourcesConfigured: Number(data.feedSourcesConfigured || 0),
      feedSourcesSuccessful: Number(data.feedSourcesSuccessful || 0)
    };
  }

  async function loadRegistry() {
    const data = await fetchJSON(REGISTRY_URL);
    if (Number(data?.schemaVersion) !== 1 || !Array.isArray(data?.sources)) throw new Error("Unsupported source registry");
    return data.sources.map(source => ({
      id: safeText(source.id, 120),
      name: safeText(source.name, 220),
      region: safeText(source.region, 140),
      country: safeText(source.country, 140),
      languages: Array.isArray(source.languages) ? source.languages.map(x => safeText(x, 80)).filter(Boolean) : [],
      topics: Array.isArray(source.topics) ? source.topics.map(x => safeText(x, 100)).filter(Boolean) : [],
      homepage: safeURL(source.homepage),
      feed: safeURL(source.feed),
      sourceType: safeText(source.sourceType, 120),
      accessNote: safeText(source.accessNote, 300),
      enabled: source.enabled !== false
    })).filter(source => source.id && source.name);
  }

  window.VerifierNewsData = Object.freeze({
    version: "1.0.0",
    MAX_AGE_MS,
    LATEST_URL,
    REGISTRY_URL,
    loadLatest,
    loadRegistry,
    normalizeStory
  });
})();
