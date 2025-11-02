<!-- /script.js -->
/* Minimal utilities only: year, smooth-scroll offset, mailto contact */
(function () {
  // Year
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // Smooth anchor scroll with sticky-header offset
  const headerHeight = document.querySelector("header")?.offsetHeight || 0;
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      const y = el.getBoundingClientRect().top + window.pageYOffset - (headerHeight + 12);
      window.scrollTo({ top: y, behavior: "smooth" });
      history.replaceState(null, "", id); // why: keep deep-link
    });
  });

  // Contact form → mailto
  const form = document.getElementById("contactForm");
  const msg = document.getElementById("formMsg");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get("name") || "").toString().trim();
      const email = (data.get("email") || "").toString().trim();
      const subject = (data.get("subject") || "").toString().trim();
      const body = (data.get("message") || "").toString().trim();

      if (!name || !email || !subject || !body) {
        if (msg) { msg.textContent = "Please fill out all fields."; }
        return;
      }

      const mailto = `mailto:haiming@example.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Hi,\n\nI'm ${name} (${email}).\n\n${body}\n\n— Sent from portfolio site`)}`;
      window.location.href = mailto;              // why: backend-free send path
      if (msg) msg.textContent = "Opening your email client…";
      form.reset();
    });
  }
})();