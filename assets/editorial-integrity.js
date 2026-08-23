/* The Verifier · Editorial Integrity Layer · v1.0.0
   Non-destructive public labeling for opinion/column pages. */
(() => {
  "use strict";

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

  function addModalNotice() {
    const body = document.querySelector("#articleModal .modal-body, #modalBody, .modal-body");
    if (!body || body.parentNode?.querySelector(".verifier-editorial-modal-note")) return;
    const note = document.createElement("div");
    note.className = "verifier-editorial-modal-note";
    note.textContent = "Editorial / Opinion — verify consequential factual claims against cited or primary sources before treating them as established fact.";
    body.parentNode.insertBefore(note, body);
  }

  function apply() {
    style();
    addTopNotice();
    addModalNotice();
    const observer = new MutationObserver(addModalNotice);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply, { once: true });
  else apply();
})();
