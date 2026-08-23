/* The Verifier · Editorial Integrity Layer · v1.2.0
   Non-destructive public labeling plus article-specific corrections/evidence.
   The evidence registry is self-loaded so existing column HTML does not depend
   on a second rollout mutation before corrections become available. */
(() => {
  "use strict";

  const SELF_SRC = document.currentScript?.src || "";
  let evidenceLoadPromise = null;

  function evidenceRegistryURL() {
    try {
      if (SELF_SRC) return new URL("editorial-evidence-registry.js", SELF_SRC).href;
      return new URL("../assets/editorial-evidence-registry.js", window.location.href).href;
    } catch (_) {
      return "../assets/editorial-evidence-registry.js";
    }
  }

  function ensureEvidenceRegistry() {
    if (window.VerifierEditorialEvidence) return Promise.resolve(window.VerifierEditorialEvidence);
    if (evidenceLoadPromise) return evidenceLoadPromise;

    evidenceLoadPromise = new Promise(resolve => {
      const existing = [...document.scripts].find(script =>
        String(script.src || "").includes("editorial-evidence-registry.js")
      );

      const finish = () => resolve(window.VerifierEditorialEvidence || null);

      if (existing) {
        if (window.VerifierEditorialEvidence) { finish(); return; }
        existing.addEventListener("load", finish, { once: true });
        existing.addEventListener("error", () => resolve(null), { once: true });
        window.setTimeout(finish, 4000);
        return;
      }

      const script = document.createElement("script");
      script.src = evidenceRegistryURL();
      script.async = true;
      script.referrerPolicy = "no-referrer";
      script.addEventListener("load", finish, { once: true });
      script.addEventListener("error", () => resolve(null), { once: true });
      document.head.append(script);
    });

    return evidenceLoadPromise;
  }

  function style() {
    if (document.getElementById("verifier-editorial-integrity-style")) return;
    const css = document.createElement("style");
    css.id = "verifier-editorial-integrity-style";
    css.textContent = `
      .verifier-editorial-integrity{
        max-width:900px;margin:14px auto 18px;padding:12px 14px;
        border:1px solid #c9b27d;border-radius:10px;background:#fff8df;
        color:#423716;font:14px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif;
        box-shadow:0 4px 16px rgba(0,0,0,.06)
      }
      .verifier-editorial-integrity strong{letter-spacing:.08em;text-transform:uppercase;font-size:.78rem}
      .verifier-editorial-integrity a{color:#493b12;font-weight:800}
      .verifier-editorial-integrity small{display:block;margin-top:5px;color:#6a5c38}
      .verifier-editorial-modal-note{
        margin:0 0 12px;padding:9px 11px;border-left:4px solid #b99b53;
        background:#fff8df;color:#4b4022;font:13px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif
      }
      .verifier-evidence-addendum{
        margin:0 0 14px;padding:14px;border:1px solid #b8842f;border-radius:10px;
        background:#fffaf0;color:#2d2619;font:13px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;
        box-shadow:0 5px 18px rgba(80,55,15,.08)
      }
      .verifier-evidence-addendum h3{
        margin:0 0 4px;color:#5c4315;font:700 1.05rem/1.25 system-ui,-apple-system,"Segoe UI",sans-serif
      }
      .verifier-evidence-addendum .evidence-status{
        display:inline-block;margin:0 0 9px;padding:3px 7px;border-radius:999px;
        background:#5c4315;color:#fff;font-size:10px;font-weight:800;letter-spacing:.07em;text-transform:uppercase
      }
      .verifier-evidence-addendum .evidence-dates{margin:0 0 9px;color:#6a5b3b;font-size:11px}
      .verifier-evidence-addendum .evidence-summary{margin:0 0 11px}
      .verifier-evidence-addendum details{margin:8px 0;border-top:1px solid #ead8b2;padding-top:8px}
      .verifier-evidence-addendum summary{cursor:pointer;font-weight:800;color:#4d3a16}
      .verifier-evidence-addendum .correction-item{margin:10px 0;padding:9px 10px;border-left:3px solid #b8842f;background:#fff}
      .verifier-evidence-addendum .correction-item b{display:block;margin-bottom:3px;color:#3f3015}
      .verifier-evidence-addendum .source-list{margin:8px 0 0;padding-left:18px}
      .verifier-evidence-addendum .source-list li{margin:7px 0}
      .verifier-evidence-addendum .source-list a{font-weight:800;color:#533f18}
      .verifier-evidence-addendum .source-note{display:block;color:#6d6250;font-size:11px}
      .verifier-evidence-addendum .editorial-note{margin:10px 0 0;padding-top:9px;border-top:1px solid #ead8b2;color:#5c5141;font-size:11px}
    `;
    document.head.append(css);
  }

  function makeNotice() {
    const box = document.createElement("aside");
    box.className = "verifier-editorial-integrity";
    box.setAttribute("role", "note");
    box.innerHTML = `<strong>Editorial / Opinion</strong><br>
      This page contains commentary and argument, not neutral wire reporting. Consequential factual claims should be checked against original records and independent reporting.
      <a href="../editorial_standard_index.html">Read The Verifier Editorial & Verification Standard.</a>
      <small>Corrections should remain visible when they materially change a claim. Criticism may be forceful; collective dehumanization is outside The Verifier standard.</small>`;
    return box;
  }

  function addTopNotice() {
    if (document.querySelector(".verifier-editorial-integrity")) return;
    const notice = makeNotice();
    const anchor = document.querySelector(".subtitle") || document.querySelector("h1") || document.body.firstElementChild;
    if (anchor?.parentNode) anchor.parentNode.insertBefore(notice, anchor.nextSibling);
    else document.body.prepend(notice);
  }

  function modalBody() {
    return document.querySelector("#articleModal .modal-body, #modalBody, .modal-body");
  }

  function modalTitle() {
    return (document.querySelector("#modalTitle, #articleModal .modal-title, .modal-title")?.textContent || "").trim();
  }

  function addModalNotice() {
    const body = modalBody();
    if (!body || body.parentNode?.querySelector(".verifier-editorial-modal-note")) return;
    const note = document.createElement("div");
    note.className = "verifier-editorial-modal-note";
    note.textContent = "Editorial / Opinion — verify consequential factual claims against cited or primary sources before treating them as established fact.";
    body.parentNode.insertBefore(note, body);
  }

  function safeExternalLink(label, url) {
    try {
      const parsed = new URL(String(url || ""));
      if (parsed.protocol !== "https:" || parsed.username || parsed.password) return null;
      const a = document.createElement("a");
      a.href = parsed.href;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.referrerPolicy = "no-referrer";
      a.textContent = label;
      return a;
    } catch (_) {
      return null;
    }
  }

  function buildEvidenceAddendum(record) {
    const box = document.createElement("section");
    box.className = "verifier-evidence-addendum";
    box.dataset.evidenceId = record.id || record.title;
    box.setAttribute("role", "note");

    const h = document.createElement("h3");
    h.textContent = record.heading || "Correction & Evidence Addendum";

    const status = document.createElement("div");
    status.className = "evidence-status";
    status.textContent = record.status || "Evidence note";

    const dates = document.createElement("div");
    dates.className = "evidence-dates";
    dates.textContent = `Original publication: ${record.published || "undated"} · Addendum: ${record.correctionDate || "undated"}`;

    const summary = document.createElement("p");
    summary.className = "evidence-summary";
    summary.textContent = record.summary || "";

    box.append(h, status, dates, summary);

    if (Array.isArray(record.corrections) && record.corrections.length) {
      const details = document.createElement("details");
      details.open = true;
      const summaryEl = document.createElement("summary");
      summaryEl.textContent = "Material corrections and clarifications";
      details.append(summaryEl);
      record.corrections.forEach(item => {
        const row = document.createElement("div");
        row.className = "correction-item";
        const label = document.createElement("b");
        label.textContent = item.label || "Correction";
        const text = document.createElement("div");
        text.textContent = item.text || "";
        row.append(label, text);
        details.append(row);
      });
      box.append(details);
    }

    if (Array.isArray(record.sources) && record.sources.length) {
      const details = document.createElement("details");
      const summaryEl = document.createElement("summary");
      summaryEl.textContent = "Evidence and reference record";
      const list = document.createElement("ul");
      list.className = "source-list";
      record.sources.forEach(source => {
        const li = document.createElement("li");
        const link = safeExternalLink(source.label || "Source", source.url);
        if (link) li.append(link);
        else li.append(document.createTextNode(source.label || "Source"));
        if (source.note) {
          const note = document.createElement("span");
          note.className = "source-note";
          note.textContent = source.note;
          li.append(note);
        }
        list.append(li);
      });
      details.append(summaryEl, list);
      box.append(details);
    }

    if (record.editorialNote) {
      const note = document.createElement("p");
      note.className = "editorial-note";
      note.textContent = record.editorialNote;
      box.append(note);
    }

    return box;
  }

  function syncEvidenceAddendum() {
    const body = modalBody();
    if (!body?.parentNode) return;

    const parent = body.parentNode;
    const existing = parent.querySelector(".verifier-evidence-addendum");
    const title = modalTitle();
    const registry = window.VerifierEditorialEvidence;
    const record = registry?.findByTitle?.(title) || null;

    if (!record) {
      existing?.remove();
      return;
    }

    if (existing?.dataset.evidenceId === (record.id || record.title)) return;
    existing?.remove();
    parent.insertBefore(buildEvidenceAddendum(record), body);
  }

  function syncModalIntegrity() {
    addModalNotice();
    syncEvidenceAddendum();
  }

  function apply() {
    style();
    addTopNotice();
    syncModalIntegrity();

    const observer = new MutationObserver(syncModalIntegrity);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });

    ensureEvidenceRegistry().then(() => syncModalIntegrity());
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply, { once: true });
  else apply();
})();
