// Portfolio homepage interactivity — plain JS, no build, no framework.
// Mirrors the filter-chip pattern already used in blog-src/templates/index.html
// (pre-rendered rows + data-cat + [hidden] toggling) so both pages behave the
// same way and there's exactly one pattern to hand-edit.
(function () {
  "use strict";

  // ---------- mobile nav toggle ----------
  var nav = document.getElementById("siteNav");
  var navToggle = document.getElementById("navToggle");
  if (nav && navToggle) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      navToggle.textContent = open ? "CLOSE ✕" : "MENU ≡";
    });
    // Close the mobile menu after tapping a nav link.
    var navLinks = document.getElementById("navLinks");
    if (navLinks) {
      navLinks.addEventListener("click", function (e) {
        if (e.target.tagName === "A") {
          nav.classList.remove("is-open");
          navToggle.textContent = "MENU ≡";
        }
      });
    }
  }

  // ---------- generic filter-chip wiring (same shape as the blog's own script) ----------
  function wireFilter(chipsEl, listEl, rowSelector) {
    if (!chipsEl || !listEl) return;
    var chips = Array.prototype.slice.call(chipsEl.querySelectorAll(".chip[data-filter]"));
    var rows = Array.prototype.slice.call(listEl.querySelectorAll(rowSelector));
    if (!chips.length || !rows.length) return;

    function apply(filter) {
      rows.forEach(function (row) {
        row.hidden = !(filter === "All" || row.dataset.cat === filter);
      });
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.classList.toggle("is-active", c === chip); });
        apply(chip.dataset.filter);
      });
    });
  }

  // ---------- modal open/close ----------
  // While a popup is open, <html> carries .has-modal (overflow hidden in site.css)
  // so the page behind can't scroll. The scrollbar's width is padded back in on
  // desktop so the layout doesn't shift when it disappears.
  var root = document.documentElement;
  function lockPage() {
    var gap = window.innerWidth - root.clientWidth;
    root.classList.add("has-modal");
    if (gap > 0) root.style.paddingRight = gap + "px";
  }
  function unlockPage() {
    if (document.querySelector(".modal-overlay:not([hidden])")) return;
    root.classList.remove("has-modal");
    root.style.paddingRight = "";
  }

  function wireModal(openBtn, overlay, closeBtn) {
    if (!openBtn || !overlay) return;
    openBtn.addEventListener("click", function () { overlay.hidden = false; lockPage(); });
    var close = function () { overlay.hidden = true; unlockPage(); };
    if (closeBtn) closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) close(); // click on the dim backdrop, not the panel
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !overlay.hidden) close();
    });
  }

  // MEDIA modal
  wireModal(
    document.getElementById("openMediaModal"),
    document.getElementById("mediaModal"),
    document.getElementById("closeMediaModal")
  );
  wireFilter(
    document.getElementById("mediaChips"),
    document.getElementById("mediaList"),
    ".modal-row"
  );

  // BLOG modal
  wireModal(
    document.getElementById("openBlogModal"),
    document.getElementById("blogModal"),
    document.getElementById("closeBlogModal")
  );
  wireFilter(
    document.getElementById("blogChips"),
    document.getElementById("blogList"),
    ".modal-row"
  );

  // ---------- keep "VIEW ALL [N]" counts honest without a build step ----------
  // Counts the actual rows in each modal so a hand-added talk/post never
  // needs a matching hand-edit of the button label.
  function syncViewAllCount(btn, listEl, rowSelector) {
    if (!btn || !listEl) return;
    var n = listEl.querySelectorAll(rowSelector).length;
    btn.textContent = "VIEW ALL [" + n + "] →";
  }
  syncViewAllCount(document.getElementById("openMediaModal"), document.getElementById("mediaList"), ".modal-row");
  syncViewAllCount(document.getElementById("openBlogModal"), document.getElementById("blogList"), ".modal-row");

  // ---------- back to top ----------
  var backToTop = document.getElementById("backToTop");
  if (backToTop) {
    var onScroll = function () {
      backToTop.hidden = window.scrollY <= 400;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
})();
