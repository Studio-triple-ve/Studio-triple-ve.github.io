/* ════════════════════════════════════════════════════════════════
   TRIPLE-VÉ STUDIO — shared site behavior
   - Age gate (localStorage-persisted, mascot art backdrop)
   - "Magical" click particles off the signpost's chalky-smoke motif
   - Mobile nav toggle + active-link marking
════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var ASSET_BASE = document.body.getAttribute("data-asset-base") || "";

  /* ── Mobile nav toggle ─────────────────────────────────────── */
  var toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      document.body.classList.toggle("nav-open");
    });
    document.querySelectorAll(".nav a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
      });
    });
  }

  /* ── Active nav link ───────────────────────────────────────── */
  var current = (location.pathname.split("/").pop() || "index.html");
  document.querySelectorAll(".nav a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === current || (current === "" && href === "index.html")) {
      a.classList.add("is-active");
      a.setAttribute("aria-current", "page");
    }
  });

  /* ── Contact FAB — reveal only after scrolling past the intro ── */
  var fab = document.querySelector(".contact-fab");
  if (fab) {
    var revealAt = 360;
    var onScroll = function () {
      if (window.scrollY > revealAt) fab.classList.add("is-visible");
      else fab.classList.remove("is-visible");
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ── Age gate ──────────────────────────────────────────────── */
  var GATE_KEY = "age_confirmed_v1";
  var gate = document.querySelector(".age-gate");
  if (gate) {
    var confirmed = false;
    try { confirmed = localStorage.getItem(GATE_KEY) === "1"; } catch (e) {}

    if (confirmed) {
      gate.hidden = true;
      document.documentElement.style.overflow = "";
    } else {
      document.documentElement.style.overflow = "hidden";
      var enterBtn = gate.querySelector("[data-gate-enter]");
      var exitBtn = gate.querySelector("[data-gate-exit]");
      if (enterBtn) {
        enterBtn.addEventListener("click", function () {
          try { localStorage.setItem(GATE_KEY, "1"); } catch (e) {}
          gate.setAttribute("hidden", "");
          document.documentElement.style.overflow = "";
        });
      }
      if (exitBtn) {
        exitBtn.addEventListener("click", function () {
          window.location.href = "https://www.google.com";
        });
      }
    }
  }

  /* ── Magical click particles ──────────────────────────────────
     Spawns a small burst of the brand's chalky "W" glyphs and soft
     smoke wisps at the click point. Bound to nav links, buttons,
     and the brand mark — the studio's one authored motion moment. */
  var field = document.createElement("div");
  field.className = "particle-field";
  field.setAttribute("aria-hidden", "true");
  document.addEventListener("DOMContentLoaded", function () {
    document.body.appendChild(field);
  });

  var GLYPHS = ["w", "W", "✦", "·"];

  function burst(x, y) {
    var count = 7;
    for (var i = 0; i < count; i++) {
      var el = document.createElement("span");
      var isGlyph = Math.random() > 0.45;
      el.className = "particle " + (isGlyph ? "particle--glyph" : "particle--wisp");
      if (isGlyph) {
        el.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      var angle = (Math.PI * 2 * i) / count + (Math.random() * 0.6 - 0.3);
      var dist = 40 + Math.random() * 46;
      var tx = Math.cos(angle) * dist;
      var ty = Math.sin(angle) * dist - 30;
      var size = 10 + Math.random() * 12;
      var dur = 650 + Math.random() * 500;
      var rot = (Math.random() * 60 - 30) + "deg";

      el.style.left = x + "px";
      el.style.top = y + "px";
      el.style.setProperty("--tx", tx + "px");
      el.style.setProperty("--ty", ty + "px");
      el.style.setProperty("--size", size + "px");
      el.style.setProperty("--dur", dur + "ms");
      el.style.setProperty("--rot", rot);

      field.appendChild(el);
      (function (node, life) {
        setTimeout(function () { node.remove(); }, life + 60);
      })(el, dur);
    }
  }

  document.addEventListener("click", function (e) {
    var trigger = e.target.closest(".btn, .nav a, .brand, .contact-fab, [data-particles]");
    if (!trigger) return;
    if (!document.body.contains(field)) document.body.appendChild(field);
    burst(e.clientX, e.clientY);
  });
})();
