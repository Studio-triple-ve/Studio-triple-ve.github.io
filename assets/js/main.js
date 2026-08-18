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

  /* ── Contact FAB ───────────────────────────────────────────────
     Desktop/mouse: hidden by default, summoned by proximity — CSS
     handles the fade via :hover on the zone; JS just fires a magic
     burst the moment the hover begins. Touch: no real hover, so it
     falls back to revealing once scrolled past the intro instead
     (see CSS + the block below). */
  var fabZone = document.querySelector(".contact-fab-zone");
  var fab = document.querySelector(".contact-fab");
  var HOVER_CAPABLE = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (fab && !HOVER_CAPABLE) {
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
     smoke wisps at EVERY click, anywhere on the page — the studio's
     one authored motion moment, not gated to specific elements.

     For same-tab links that navigate to a new page, the browser
     would otherwise unload the DOM before the burst finishes
     playing (that's the "cuts off too fast" you saw). So for those
     specifically, we hold the navigation for one beat, just long
     enough for the burst to read, then continue on. In-page anchors,
     new-tab links, and mailto/tel links are untouched. */
  var field = document.createElement("div");
  field.className = "particle-field";
  field.setAttribute("aria-hidden", "true");
  document.addEventListener("DOMContentLoaded", function () {
    document.body.appendChild(field);
  });

  var GLYPHS = ["w", "W", "✦", "·"];
  var NAV_DELAY = 300;

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
    if (!document.body.contains(field)) document.body.appendChild(field);
    burst(e.clientX, e.clientY);

    var link = e.target.closest("a[href]");
    if (!link) return;

    var href = link.getAttribute("href");
    if (!href || href.charAt(0) === "#") return;
    if (href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0) return;
    if (link.target === "_blank") return;

    e.preventDefault();
    setTimeout(function () {
      window.location.href = href;
    }, NAV_DELAY);
  });

  if (fabZone && fab && HOVER_CAPABLE) {
    fabZone.addEventListener("mouseenter", function () {
      if (!document.body.contains(field)) document.body.appendChild(field);
      var rect = fab.getBoundingClientRect();
      burst(rect.left + rect.width / 2, rect.top + rect.height / 3);
    });
  }

  /* ── Header meteors ──────────────────────────────────────────────
     Ambient, non-click motion: the same particle language (chalky
     "W"s, the brand pink) as long streaks that drift right-to-left
     behind the nav, like shooting stars. Runs on its own timer,
     capped at 3 "W"s on screen at once so it stays a background
     detail rather than a distraction. */
  var headerFx = document.querySelector(".header-fx");
  if (headerFx) {
    var glyphCount = 0;
    var spawnMeteor = function () {
      var makeGlyph = Math.random() < 0.4 && glyphCount < 3;
      var el = document.createElement("span");
      var dur = 2.6 + Math.random() * 1.8;
      var top = 14 + Math.random() * 60;

      el.className = "hfx " + (makeGlyph ? "hfx-glyph" : "hfx-streak");
      el.style.top = top + "%";
      el.style.setProperty("--dur", dur + "s");

      if (makeGlyph) {
        el.textContent = "W";
        el.style.setProperty("--gsize", (1.1 + Math.random() * 0.6) + "rem");
        glyphCount++;
      }

      headerFx.appendChild(el);
      setTimeout(function () {
        el.remove();
        if (makeGlyph) glyphCount--;
      }, dur * 1000 + 120);
    };

    (function scheduleMeteor() {
      var delay = 2400 + Math.random() * 4600;
      setTimeout(function () {
        spawnMeteor();
        scheduleMeteor();
      }, delay);
    })();
  }
})();
