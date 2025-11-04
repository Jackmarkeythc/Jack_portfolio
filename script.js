<!-- /script.js -->
/* Year, smooth scrolling, contact mailto, and Selected Work: data, cards, modal */
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
      const to = el.getBoundingClientRect().top + window.pageYOffset - (headerHeight + 12);
      window.scrollTo({ top: to, behavior: "smooth" });
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
      if (!name || !email || !subject || !body) { if (msg) msg.textContent = "Please fill out all fields."; return; }
      const mailto = `mailto:jw_worki@outlook.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Hi,\n\nI'm ${name} (${email}).\n\n${body}\n\n— Sent from portfolio site`)}`;
      window.location.href = mailto; // why: backend-free send path
      if (msg) msg.textContent = "Opening your email client…";
      form.reset();
    });
  }

  // ---------- Selected Work ----------
  // Add your projects here
  const workData = [
    {
      id: "p1",
      title: "JacksGoods Web Design & Marketing",
      blurb: "Design and marketing strategy for an e-commerce platform.",
      cover: "project-1.jpg",
      tags: ["WCAG", "Usability", "After Effects"],
      link: "https://app.milanote.com/1TPAMR1dX0MM6q/a4_haimingwang?p=lsxMKnZQ6q5"
    },
    {
      id: "p2",
      title: "Meta Quest Unity Game Development",
      blurb: "Developing a VR gaming experience using Unity.",
      cover: "project-2.jpg",
      tags: ["Prototype", "Scripting", "Idea Validation"],
      link: "https://funky-ladybug-d69.notion.site/Physical-Interface-Project-3_Meta-Quest-Unity-Game-Development-1b29554284ca809f8dc8c20a54ef267e?source=copy_link",
      // embed the Notion page in the modal for the second project
      embed: "https://funky-ladybug-d69.notion.site/ebd/1b29554284ca809f8dc8c20a54ef267e"
    },
    {
      id: "p3",
      title: "Too Good To Go Redesign",
      blurb: "Redesigning the app for identified problems to improve user experience.",
      cover: "project-3.jpg",
      tags: ["Research", "Surveys", "Interviews"],
      // embed the Miro live-embed for the third card (renders inside the card)
      embed: "https://miro.com/app/live-embed/uXjVNiRwTBM=/?embedMode=view_only_without_ui&moveToViewport=14694,-7303,25901,12908&embedId=881170539998",
      // keep an external link as fallback
      link: "https://miro.com/app/board/uXjVNiRwTBM=/?share_link_id=257455684358"
    }
  ];

  const grid = document.getElementById("workGrid");
  const tpl = document.getElementById("workCardTpl");

  function renderWork() {
    if (!grid || !tpl) return;
    grid.innerHTML = "";
    for (const p of workData) {
      const node = tpl.content.firstElementChild.cloneNode(true);
      node.dataset.id = p.id;
      const img = node.querySelector("img");
      img.src = p.cover;
      img.alt = `${p.title} cover`;
      node.querySelector("h3").textContent = p.title;
      node.querySelector("p").textContent = p.blurb;

      const tagsBox = node.querySelector("div.flex.flex-wrap");
      for (const t of p.tags) {
        const chip = document.createElement("span");
        chip.className = "px-2 py-1 rounded-lg border border-white/10";
        chip.textContent = t;
        tagsBox.appendChild(chip);
      }

      const openEl = node.querySelector("[data-action='open']");
      // why: make whole card clickable + keyboard accessible
      openEl.addEventListener("click", (e) => { e.preventDefault(); openModal(p, node); });
      openEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openModal(p, node); }
      });

      grid.appendChild(node);
    }
  }

  // Modal wiring
  const modal = document.getElementById("workModal");
  const overlay = document.getElementById("wmOverlay");
  const closeBtn = document.getElementById("wmClose");
  const mCover = document.getElementById("wmCover");
  const mTitle = document.getElementById("wmTitle");
  const mDesc = document.getElementById("wmDesc");
  const mTags = document.getElementById("wmTags");
  const mLink = document.getElementById("wmLink");
  const wmEmbed = document.getElementById("wmEmbed");
  const wmIframe = document.getElementById("wmIframe");

  let lastFocused = null;
  let activeCard = null;

  function openModal(project, cardEl) {
    if (!modal) return;
    activeCard = cardEl;
    activeCard.classList.add("ring-2","ring-brand/60"); // why: reflect activation on the grid
    lastFocused = document.activeElement;

    mCover.src = project.cover;
    mCover.alt = `${project.title} cover`;
    mTitle.textContent = project.title;
    mDesc.textContent = project.blurb;
    mTags.innerHTML = "";
    for (const t of project.tags) {
      const chip = document.createElement("span");
      chip.className = "px-2 py-1 rounded-lg border border-white/10 text-xs";
      chip.textContent = t;
      mTags.appendChild(chip);
    }
    mLink.href = project.link || "#";

    // Only show/embed the Miro iframe for projects that provide an `embed` property.
    if (project.embed && wmEmbed && wmIframe) {
      wmEmbed.classList.remove("hidden");
      wmIframe.src = project.embed;
    } else if (wmEmbed && wmIframe) {
      wmEmbed.classList.add("hidden");
      // clear src to stop any previous embed from continuing to load/play
      wmIframe.src = "";
    }

    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
    // focus first meaningful control
    mLink.focus();

    // why: trap focus inside modal for a11y
    modal.addEventListener("keydown", trapFocus);
    window.addEventListener("keydown", escClose);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
    modal.removeEventListener("keydown", trapFocus);
    window.removeEventListener("keydown", escClose);
    if (activeCard) activeCard.classList.remove("ring-2","ring-brand/60");
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
    activeCard = null;
  }

  function escClose(e) { if (e.key === "Escape") closeModal(); }

  function trapFocus(e) {
    if (e.key !== "Tab") return;
    const focusables = modal.querySelectorAll('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
    const f = Array.from(focusables).filter(el => !el.hasAttribute("disabled") && el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
  }

  if (overlay) overlay.addEventListener("click", closeModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);

  renderWork();
})();
