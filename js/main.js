/* ==========================================================================
   SAIMOON AHMED ADNAN — Portfolio
   Shared site behaviour: theme toggle, mobile nav, scroll reveal
   ========================================================================== */

(function () {
  "use strict";

  /* ---------- Theme toggle (persists in-session via JS var, no storage APIs) ---------- */
  var THEME_KEY = "__portfolio_theme__";
  // In-memory fallback since localStorage is avoided per environment constraints.
  // We still try localStorage first for a real multi-page site (this is plain
  // static HTML/CSS/JS, not a sandboxed artifact), and silently fall back if blocked.
  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (e) {
      return window[THEME_KEY] || null;
    }
  }
  function setStoredTheme(value) {
    try {
      localStorage.setItem(THEME_KEY, value);
    } catch (e) {
      window[THEME_KEY] = value;
    }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    var icons = document.querySelectorAll("[data-theme-icon]");
    icons.forEach(function (icon) {
      icon.innerHTML = theme === "dark" ? sunIcon() : moonIcon();
    });
  }

  function moonIcon() {
    return '<path d="M20 12.5A8.5 8.5 0 1 1 11.5 4a7 7 0 0 0 8.5 8.5Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>';
  }
  function sunIcon() {
    return '<circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>';
  }

  function initTheme() {
    var stored = getStoredTheme();
    var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme = stored || (prefersDark ? "dark" : "light");
    applyTheme(theme);

    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var current = document.documentElement.getAttribute("data-theme");
        var next = current === "dark" ? "light" : "dark";
        applyTheme(next);
        setStoredTheme(next);
      });
    });
  }

  /* ---------- Mobile menu ---------- */
  function initMobileMenu() {
    var openBtn = document.querySelector("[data-menu-open]");
    var closeBtn = document.querySelector("[data-menu-close]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!openBtn || !menu) return;

    openBtn.addEventListener("click", function () {
      menu.classList.add("is-open");
      document.body.style.overflow = "hidden";
    });
    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        menu.classList.remove("is-open");
        document.body.style.overflow = "";
      });
    }
    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        menu.classList.remove("is-open");
        document.body.style.overflow = "";
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || items.length === 0) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Site search ---------- */
  var SEARCH_INDEX = [
    { title: "Home", desc: "Turning data into smarter product decisions — portfolio homepage.", url: "index.html", keywords: "home saimoon ahmed adnan product focused data analyst" },
    { title: "About", desc: "Background, education, and job simulation experience.", url: "about.html", keywords: "about bio education cse background" },
    { title: "Product Management Job Simulation — Electronic Arts", desc: "Forage job simulation in Product Management.", url: "about.html", keywords: "electronic arts ea product management job simulation forage" },
    { title: "Quantium Data Analytics Job Simulation", desc: "Forage job simulation in Data Analytics.", url: "about.html", keywords: "quantium data analytics job simulation forage" },
    { title: "Skills", desc: "Python, SQL, JavaScript, C++, Pandas, NumPy, Power BI, VS Code, Git, Jupyter Notebook, Excel.", url: "skills.html", keywords: "skills toolkit python sql javascript c++ pandas numpy power bi vs code git jupyter notebook excel" },
    { title: "Projects", desc: "Data analytics and product-thinking project case studies.", url: "projects.html", keywords: "projects work case studies" },
    { title: "Netflix Movie Data Analysis", desc: "Project — analysing Netflix movie data.", url: "projects.html", keywords: "netflix movie data analysis project" },
    { title: "Quantium Retail Analytics Project", desc: "Project — retail analytics for Quantium.", url: "projects.html", keywords: "quantium retail analytics project" },
    { title: "Zepto E-commerce Inventory Analysis", desc: "Project — inventory analysis for Zepto e-commerce.", url: "projects.html", keywords: "zepto e-commerce inventory analysis project" },
    { title: "Certificates", desc: "Certifications and completed courses.", url: "certificates.html", keywords: "certificates certifications courses" },
    { title: "Quantium Data Analytics Job Simulation (Certificate)", desc: "Certificate from Forage.", url: "certificates.html", keywords: "quantium data analytics job simulation certificate forage" },
    { title: "Electronic Arts Product Management Job Simulation (Certificate)", desc: "Certificate from Forage.", url: "certificates.html", keywords: "electronic arts ea product management job simulation certificate forage" },
    { title: "Python Developer", desc: "Certificate.", url: "certificates.html", keywords: "python developer certificate" },
    { title: "SQL Intermediate", desc: "Certificate.", url: "certificates.html", keywords: "sql intermediate certificate" },
    { title: "SQL Micro Course", desc: "Certificate.", url: "certificates.html", keywords: "sql micro course certificate" },
    { title: "Microsoft Power BI", desc: "Certificate.", url: "certificates.html", keywords: "microsoft power bi certificate" },
    { title: "Microsoft Excel", desc: "Certificate.", url: "certificates.html", keywords: "microsoft excel certificate" },
    { title: "Inventory Management", desc: "Certificate.", url: "certificates.html", keywords: "inventory management certificate" },
    { title: "Supply Chain Management", desc: "Certificate.", url: "certificates.html", keywords: "supply chain management certificate" },
    { title: "Data Analytics & Power BI", desc: "Certificate.", url: "certificates.html", keywords: "data analytics power bi certificate" },
    { title: "Prompt Engineering", desc: "Certificate.", url: "certificates.html", keywords: "prompt engineering certificate ai" },
    { title: "Blog", desc: "Notes on product analytics, data, and things I'm learning.", url: "blog.html", keywords: "blog articles writing" },
    { title: "How Data Drives Better Product Decisions", desc: "Blog post on product analytics.", url: "blog-post-1.html", keywords: "how data drives better product decisions blog post sql python power bi product metrics" },
    { title: "Contact", desc: "Get in touch — email, socials, and the contact form.", url: "contact.html", keywords: "contact email reach out hire" }
  ];

  function searchIcon() {
    return '<circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.6"/><path d="M21 21l-4.3-4.3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>';
  }

  function buildSearchModal() {
    var overlay = document.createElement("div");
    overlay.className = "search-overlay";
    overlay.setAttribute("data-search-overlay", "");
    overlay.innerHTML =
      '<div class="search-box" role="dialog" aria-modal="true" aria-label="Site search">' +
        '<div class="search-box__input-row">' +
          '<svg viewBox="0 0 24 24" fill="none" class="search-box__icon">' + searchIcon() + '</svg>' +
          '<input type="text" class="search-box__input" placeholder="Search pages, projects, certificates..." aria-label="Search" data-search-input />' +
          '<button type="button" class="search-box__close" aria-label="Close search" data-search-close>' +
            '<svg viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>' +
          '</button>' +
        '</div>' +
        '<ul class="search-box__results" data-search-results></ul>' +
        '<p class="search-box__empty" data-search-empty>No matches. Try “projects”, “skills”, or a certificate name.</p>' +
      '</div>';
    document.body.appendChild(overlay);
    return overlay;
  }

  function renderResults(list, resultsEl, emptyEl, currentPage) {
    resultsEl.innerHTML = "";
    if (list.length === 0) {
      emptyEl.style.display = "block";
      return;
    }
    emptyEl.style.display = "none";
    list.slice(0, 8).forEach(function (item) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = item.url;
      a.className = "search-box__result";
      var suffix = item.url === currentPage ? " (this page)" : "";
      a.innerHTML =
        '<span class="search-box__result-title">' + item.title + suffix + '</span>' +
        '<span class="search-box__result-desc">' + item.desc + '</span>';
      li.appendChild(a);
      resultsEl.appendChild(li);
    });
  }

  function initSearch() {
    var triggers = document.querySelectorAll('[aria-label="Search"]');
    if (triggers.length === 0) return;

    var overlay = null, input, resultsEl, emptyEl, closeBtn;
    var currentPage = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();

    function open() {
      if (!overlay) {
        overlay = buildSearchModal();
        input = overlay.querySelector("[data-search-input]");
        resultsEl = overlay.querySelector("[data-search-results]");
        emptyEl = overlay.querySelector("[data-search-empty]");
        closeBtn = overlay.querySelector("[data-search-close]");

        input.addEventListener("input", function () {
          var q = input.value.trim().toLowerCase();
          var matches = q === "" ? SEARCH_INDEX : SEARCH_INDEX.filter(function (item) {
            return (item.title + " " + item.desc + " " + item.keywords).toLowerCase().indexOf(q) !== -1;
          });
          renderResults(matches, resultsEl, emptyEl, currentPage);
        });

        closeBtn.addEventListener("click", close);
        overlay.addEventListener("click", function (e) {
          if (e.target === overlay) close();
        });
        document.addEventListener("keydown", function (e) {
          if (e.key === "Escape" && overlay.classList.contains("is-open")) close();
        });

        renderResults(SEARCH_INDEX, resultsEl, emptyEl, currentPage);
      }
      overlay.classList.add("is-open");
      document.body.style.overflow = "hidden";
      setTimeout(function () { input.focus(); }, 30);
    }

    function close() {
      if (!overlay) return;
      overlay.classList.remove("is-open");
      document.body.style.overflow = "";
      input.value = "";
      renderResults(SEARCH_INDEX, resultsEl, emptyEl, currentPage);
    }

    triggers.forEach(function (btn) {
      btn.addEventListener("click", open);
    });
  }

  /* ---------- Active nav link (based on current path) ---------- */
  function initActiveNav() {
    var file = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
    document.querySelectorAll(".nav__link, .mobile-menu__links a").forEach(function (link) {
      var href = (link.getAttribute("href") || "").toLowerCase();
      if (href === file || (file === "" && href === "index.html")) {
        link.classList.add("is-active");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initMobileMenu();
    initReveal();
    initActiveNav();
    initSearch();
  });
})();
