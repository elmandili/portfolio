// --------- Helpers ----------
const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

// --------- Mobile menu ----------
const navToggle = $("#navToggle");
const navMenu = $("#navMenu");

function setNavOpen(isOpen) {
  navMenu.classList.toggle("is-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
}

navToggle?.addEventListener("click", () => {
  const isOpen = navMenu.classList.contains("is-open");
  setNavOpen(!isOpen);
});

// Close menu when clicking a link (mobile)
$$(".nav__link").forEach((link) => {
  link.addEventListener("click", () => setNavOpen(false));
});

// Close menu when clicking outside (mobile)
document.addEventListener("click", (e) => {
  const clickedInside = navMenu.contains(e.target) || navToggle.contains(e.target);
  if (!clickedInside) setNavOpen(false);
});

// --------- Active link highlight on scroll (steady) ----------
const sectionIds = ["about", "skills", "projects", "research", "contact"];
const sections = sectionIds
  .map((id) => document.getElementById(id))
  .filter(Boolean);

const navLinks = Array.from(document.querySelectorAll(".nav__link"));

function setActiveLink(id) {
  navLinks.forEach((a) => {
    const isActive = a.getAttribute("href") === `#${id}`;
    a.classList.toggle("is-active", isActive);
  });
}

// Throttle to keep scrolling smooth
let ticking = false;

function onScroll() {
  if (ticking) return;
  ticking = true;

  window.requestAnimationFrame(() => {
    const headerH = document.querySelector(".header")?.offsetHeight ?? 0;
    const offset = headerH + 20; // small gap under sticky header

    // Pick the section whose top is closest to the offset (but not too far below)
    let currentId = sections[0]?.id || sectionIds[0];
    let bestDistance = Infinity;

    for (const sec of sections) {
      const rect = sec.getBoundingClientRect();
      const distance = Math.abs(rect.top - offset);

      // Prefer sections that have already reached the offset area (top <= offset + small buffer)
      // This prevents jumping to the next section too early.
      if (rect.top <= offset + 80 && distance < bestDistance) {
        bestDistance = distance;
        currentId = sec.id;
      }
    }

    // Edge cases: very top / very bottom
    if (window.scrollY < 10) currentId = sectionIds[0];

    const nearBottom =
      window.innerHeight + window.scrollY >= document.body.scrollHeight - 10;
    if (nearBottom) currentId = sectionIds[sectionIds.length - 1];

    setActiveLink(currentId);
    ticking = false;
  });
}

// Run once + listen
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll);
onScroll();


// --------- Smooth scroll offset for sticky header ----------
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const href = a.getAttribute("href");
    if (!href || href === "#") return;

    // Special case: top
    if (href === "#top") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const target = document.querySelector(href);
    if (!target) return; // let browser do nothing if target doesn't exist

    e.preventDefault();
    const headerH = document.querySelector(".header")?.offsetHeight ?? 0;
    const top = target.getBoundingClientRect().top + window.scrollY - headerH - 10;

    window.scrollTo({ top, behavior: "smooth" });
  });
});

// --------- Contact form (simple validation + fake submit) ----------
const form = document.getElementById("contactForm");
const formNote = document.getElementById("formNote");

function setError(fieldName, message) {
  const p = document.querySelector(`[data-error-for="${fieldName}"]`);
  if (p) p.textContent = message || "";
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name")?.value.trim() || "";
  const email = document.getElementById("email")?.value.trim() || "";
  const message = document.getElementById("message")?.value.trim() || "";

  let ok = true;
  setError("name", "");
  setError("email", "");
  setError("message", "");
  formNote.textContent = "";

  if (name.length < 2) {
    setError("name", "Please enter your name.");
    ok = false;
  }
  if (!validateEmail(email)) {
    setError("email", "Please enter a valid email.");
    ok = false;
  }
  if (message.length < 10) {
    setError("message", "Message must be at least 10 characters.");
    ok = false;
  }

  if (!ok) return;

  // REAL submission
  try {
    formNote.textContent = "Sending...";
    const formData = new FormData(form);

    const res = await fetch(form.action, {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" },
    });

    if (res.ok) {
      formNote.textContent = "✅ Message sent successfully!";
      form.reset();
    } else {
      const data = await res.json().catch(() => null);
      formNote.textContent =
        data?.errors?.[0]?.message || "❌ Something went wrong. Please try again.";
    }
  } catch (err) {
    formNote.textContent = "❌ Network error. Please try again.";
  }
});
