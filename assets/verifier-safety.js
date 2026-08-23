/* The Verifier · shared external-data safety layer · v1.1.0
   Public client-side helper. No secrets, credentials, private routing, or hidden logic.
   Purpose: treat RSS/API/imported values strictly as untrusted data. */
(() => {
  "use strict";

  const MAX = Object.freeze({
    title: 500,
    description: 4000,
    source: 180,
    url: 2048,
    generic: 8000
  });

  function text(value, max = MAX.generic) {
    return String(value ?? "")
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, Math.max(0, Number(max) || 0));
  }

  function stripHTML(value, max = MAX.description) {
    const raw = String(value ?? "");
    try {
      const doc = new DOMParser().parseFromString(raw, "text/html");
      return text(doc.body?.textContent || "", max);
    } catch (_) {
      return text(raw.replace(/<[^>]*>/g, " "), max);
    }
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function safeURL(value, options = {}) {
    const {
      fallback = "",
      allowHttp = false,
      allowRelative = false,
      allowDataImage = false,
      base = window.location.href
    } = options;

    const raw = String(value ?? "").trim().slice(0, MAX.url);
    if (!raw) return fallback;

    if (allowDataImage && /^data:image\/(?:png|jpeg|jpg|gif|webp);/i.test(raw)) {
      return raw;
    }

    const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw);
    if (!hasScheme && !allowRelative) return fallback;

    try {
      const parsed = new URL(raw, base);
      if (parsed.username || parsed.password) return fallback;
      if (parsed.protocol === "https:") return parsed.href;
      if (allowHttp && parsed.protocol === "http:") return parsed.href;
      return fallback;
    } catch (_) {
      return fallback;
    }
  }

  function safeImageURL(value, fallback = "") {
    return safeURL(value, { fallback, allowDataImage: true });
  }

  function safeDate(value) {
    const ms = Date.parse(String(value ?? ""));
    return Number.isFinite(ms) ? new Date(ms) : null;
  }

  function externalLink(anchor, value, fallback = "") {
    if (!anchor) return false;
    const href = safeURL(value, { fallback });
    if (!href) {
      anchor.removeAttribute("href");
      anchor.setAttribute("aria-disabled", "true");
      return false;
    }
    anchor.href = href;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer external";
    anchor.referrerPolicy = "no-referrer";
    anchor.removeAttribute("aria-disabled");
    return true;
  }

  function image(img, value, fallback = "") {
    if (!img) return false;
    const src = safeImageURL(value, fallback);
    if (!src) {
      img.removeAttribute("src");
      return false;
    }
    img.src = src;
    img.loading = "lazy";
    img.decoding = "async";
    img.referrerPolicy = "no-referrer";
    return true;
  }

  function normalizeArticle(input = {}, source = {}) {
    const title = stripHTML(input.title || "Untitled", MAX.title) || "Untitled";
    const description = stripHTML(input.description || input.content || "", MAX.description);
    const link = safeURL(input.link || input.url || source.url || "");
    const imageURL = safeImageURL(
      input.thumbnail || input.image || input.enclosure?.link || input.enclosure?.url || ""
    );
    const published = safeDate(input.pubDate || input.published || input.updated || input.date || "");

    return Object.freeze({
      title,
      description,
      link,
      image: imageURL,
      pubDate: published ? published.toISOString() : "",
      source: text(source.name || input.source || "Source", MAX.source),
      category: text(source.category || input.category || "General", 120)
    });
  }

  function safeStorage(namespace = "verifier") {
    const memory = new Map();
    let available = false;
    try {
      const probe = `__${namespace}_storage_probe__`;
      localStorage.setItem(probe, "1");
      localStorage.removeItem(probe);
      available = true;
    } catch (_) {}

    const fullKey = key => `${namespace}:${text(key, 120)}`;

    return Object.freeze({
      available,
      get(key, fallback = null) {
        try {
          const raw = available ? localStorage.getItem(fullKey(key)) : memory.get(fullKey(key));
          return raw == null ? fallback : JSON.parse(raw);
        } catch (_) {
          return fallback;
        }
      },
      set(key, value) {
        try {
          const raw = JSON.stringify(value);
          if (available) localStorage.setItem(fullKey(key), raw);
          else memory.set(fullKey(key), raw);
          return true;
        } catch (_) {
          return false;
        }
      },
      remove(key) {
        try {
          if (available) localStorage.removeItem(fullKey(key));
          else memory.delete(fullKey(key));
          return true;
        } catch (_) {
          return false;
        }
      }
    });
  }

  window.VerifierSafety = Object.freeze({
    version: "1.1.0",
    MAX,
    text,
    stripHTML,
    escapeHTML,
    safeURL,
    safeImageURL,
    safeDate,
    externalLink,
    image,
    normalizeArticle,
    safeStorage
  });
})();
