// Helpers
const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

// ---------------- Mobile menu (burger -> X) ----------------
const navToggle = $("#navToggle");
const navMenu = $("#navMenu");

function setNavOpen(isOpen) {
  navMenu.classList.toggle("is-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));

  const icon = navToggle.querySelector("i");
  if (icon) {
    icon.classList.toggle("fa-bars", !isOpen);
    icon.classList.toggle("fa-xmark", isOpen);
  }
}

navToggle?.addEventListener("click", () => {
  const isOpen = navMenu.classList.contains("is-open");
  setNavOpen(!isOpen);
});

// close on link click (mobile)
$$(".nav__link").forEach((a) => a.addEventListener("click", () => setNavOpen(false)));

// close on outside click
document.addEventListener("click", (e) => {
  if (!navMenu || !navToggle) return;
  const inside = navMenu.contains(e.target) || navToggle.contains(e.target);
  if (!inside) setNavOpen(false);
});

// close on ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setNavOpen(false);
});

// ---------------- Smooth scroll (with #top support) ----------------
$$('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const href = a.getAttribute("href");
    if (!href || href === "#") return;

    if (href === "#top") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    const headerH = document.querySelector(".header")?.offsetHeight ?? 0;
    const top = target.getBoundingClientRect().top + window.scrollY - headerH - 10;
    window.scrollTo({ top, behavior: "smooth" });
  });
});

// ---------------- Steady active link highlight ----------------
const sectionIds = ["about", "skills", "projects", "research", "contact"];
const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
const navLinks = $$(".nav__link");

function setActiveLink(id) {
  navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${id}`));
}

let ticking = false;
function onScrollActive() {
  if (ticking) return;
  ticking = true;

  requestAnimationFrame(() => {
    const headerH = document.querySelector(".header")?.offsetHeight ?? 0;
    const offset = headerH + 24;

    let currentId = sectionIds[0];
    let best = Infinity;

    for (const sec of sections) {
      const rect = sec.getBoundingClientRect();
      const dist = Math.abs(rect.top - offset);

      // prevents early jumping
      if (rect.top <= offset + 120 && dist < best) {
        best = dist;
        currentId = sec.id;
      }
    }

    if (window.scrollY < 10) currentId = sectionIds[0];
    const nearBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 10;
    if (nearBottom) currentId = sectionIds[sectionIds.length - 1];

    setActiveLink(currentId);
    ticking = false;
  });
}

window.addEventListener("scroll", onScrollActive, { passive: true });
window.addEventListener("resize", onScrollActive);
onScrollActive();

// ---------------- Reveal animations on scroll ----------------
const revealEls = $$(".reveal");
const revealObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        revealObs.unobserve(e.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealEls.forEach((el) => revealObs.observe(el));

// ---------------- Floating back-to-top button ----------------
const toTop = $("#toTop");
function updateToTop() {
  const show = window.scrollY > 600;
  toTop?.classList.toggle("is-visible", show);
}
window.addEventListener("scroll", updateToTop, { passive: true });
updateToTop();

toTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// ---------------- Contact form (real submission via Formspree if action is set) ----------------
const form = $("#contactForm");
const formNote = $("#formNote");

function setError(fieldName, message) {
  const p = document.querySelector(`[data-error-for="${fieldName}"]`);
  if (p) p.textContent = message || "";
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = $("#name")?.value.trim() || "";
  const email = $("#email")?.value.trim() || "";
  const message = $("#message")?.value.trim() || "";

  let ok = true;
  setError("name", "");
  setError("email", "");
  setError("message", "");
  formNote.textContent = "";

  if (name.length < 2) { setError("name", "Please enter your name."); ok = false; }
  if (!validateEmail(email)) { setError("email", "Please enter a valid email."); ok = false; }
  if (message.length < 10) { setError("message", "Message must be at least 10 characters."); ok = false; }

  if (!ok) return;

  // If no action is set, show a helpful message
  if (!form.action || form.action.trim() === window.location.href) {
    formNote.textContent = "Set your Formspree URL in the form action to enable real submissions.";
    return;
  }

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
      formNote.textContent = data?.errors?.[0]?.message || "❌ Something went wrong. Try again.";
    }
  } catch {
    formNote.textContent = "❌ Network error. Please try again.";
  }
});

// Footer year
$("#year").textContent = String(new Date().getFullYear());
