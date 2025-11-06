<!-- /script.js -->
/* Year, smooth scrolling, contact mailto, and Selected Work: data, cards, modal */
(function () {
  // data
  const workData = [
    {
      id: "p1",
      title: "JacksGoods Web Design & Marketing",
      blurb: "Design and marketing strategy for an e-commerce platform.",
      cover: "project-1.jpg",
      tags: ["WCAG", "Usability", "After Effects"],
      link: "p1infro.html",
      embed: "https://app.milanote.com/1TPAMR1dX0MM6q?p=lsxMKnZQ6q5"
    },
    {
      id: "p2",
      title: "Meta Quest Unity Game Development",
      blurb: "Developing a VR gaming experience using Unity.",
      cover: "project-2.jpg",
      tags: ["Prototype", "Scripting", "Idea Validation"],
      link: "p2infro.html",
      embed: "https://funky-ladybug-d69.notion.site/ebd/1b29554284ca809f8dc8c20a54ef267e"
    },
    {
      id: "p3",
      title: "Too Good To Go Redesign",
      blurb: "Redesigning the app for identified problems to improve user experience.",
      cover: "project-3.jpg",
      tags: ["Research", "Surveys", "Interviews"],
      embed: "https://miro.com/app/live-embed/uXjVNiRwTBM=/?embedMode=view_only_without_ui&moveToViewport=14694,-7303,25901,12908&embedId=881170539998",
      link: "https://miro.com/app/board/uXjVNiRwTBM=/?share_link_id=257455684358"
    }
  ];

  // DOM refs
  const grid = document.getElementById("workGrid");
  const tpl = document.getElementById("workCardTpl");

  const modal = document.getElementById("workModal");
  const overlay = document.getElementById("wmOverlay");
  const closeBtn = document.getElementById("wmClose");
  const mCover = document.getElementById("wmCover");
  const mTitle = document.getElementById("wmTitle");
  const mDesc = document.getElementById("wmDesc");
  const mTags = document.getElementById("wmTags");
  const mLink = document.getElementById("wmLink");
  const wmEmbed = document.getElementById("wmEmbed");

  let lastFocused = null;
  let activeCard = null;

  // render grid
  function renderWork() {
    if (!grid || !tpl) return;
    grid.innerHTML = "";
    for (const p of workData) {
      const node = tpl.content.firstElementChild.cloneNode(true);
      node.dataset.id = p.id;

      const img = node.querySelector("img");
      if (img) { img.src = p.cover || ""; img.alt = `${p.title} cover`; }

      const h3 = node.querySelector("h3");
      if (h3) h3.textContent = p.title || "";

      const pEl = node.querySelector("p");
      if (pEl) pEl.textContent = p.blurb || "";

      const tagsBox = node.querySelector("div.mt-3, div.flex.flex-wrap");
      if (tagsBox) {
        // clear and append chips
        tagsBox.innerHTML = "";
        for (const t of (p.tags || [])) {
          const chip = document.createElement("span");
          chip.className = "px-2 py-1 rounded-lg border border-white/10 text-xs";
          chip.textContent = t;
          tagsBox.appendChild(chip);
        }
      }

      // make the visible "Open" anchor open modal (card-level always opens modal)
      const openEl = node.querySelector("[data-action='open'], a.viewBtn, a.open, button[data-action='open']");
      if (openEl) {
        if (openEl.tagName.toLowerCase() === "a") {
          openEl.setAttribute("href", "#");
          openEl.setAttribute("role", "button");
          openEl.setAttribute("aria-haspopup", "dialog");
        }

        const handler = (ev) => {
          if (ev.type === "click" && (ev.ctrlKey || ev.metaKey || ev.button === 1)) return;
          ev.preventDefault();
          openModal(p, node);
        };

        openEl.addEventListener("click", handler);
        openEl.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handler(e);
          }
        });
      }

      grid.appendChild(node);
    }
  }

  // open modal
  function openModal(project, cardEl) {
    if (!modal) return;
    activeCard = cardEl;
    lastFocused = document.activeElement;

    // cover
    if (mCover) {
      mCover.src = project.cover || "";
      mCover.alt = `${project.title} cover`;
    }

    if (mTitle) mTitle.textContent = project.title || "";
    if (mDesc) mDesc.textContent = project.blurb || "";

    // tags
    if (mTags) {
      mTags.innerHTML = "";
      for (const t of (project.tags || [])) {
        const chip = document.createElement("span");
        chip.className = "px-2 py-1 rounded-lg border border-white/10 text-xs";
        chip.textContent = t;
        mTags.appendChild(chip);
      }
    }

    // modal open-project link behavior
    if (mLink) {
      mLink.href = project.link || "#";
      const isLocalHtml = typeof project.link === "string" && project.link.endsWith(".html");
      if (isLocalHtml) {
        mLink.target = "_self";
        mLink.rel = "";
      } else if (project.link) {
        mLink.target = "_blank";
        mLink.rel = "noopener noreferrer";
      } else {
        mLink.target = "_self";
        mLink.rel = "";
      }
    }

    // embed injection: use same dimensions as standalone pages
    if (wmEmbed) {
      if (project.embed) {
        wmEmbed.classList.remove("hidden");
        // inject iframe safe markup (sandbox + allow where possible)
        wmEmbed.innerHTML = `
          <div class="aspect-video w-full overflow-hidden rounded-md bg-neutral-800">
            <iframe
              src="${project.embed}"
              title="Project embed"
              style="width:100%;height:75vh;border:0;display:block;"
              allow="clipboard-read; clipboard-write; fullscreen; autoplay"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
            ></iframe>
          </div>
        `;
      } else {
        wmEmbed.innerHTML = "";
        wmEmbed.classList.add("hidden");
      }
    }

    // show modal
    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");

    // focus management
    (closeBtn || modal).focus?.();

    // attach listeners
    window.addEventListener("keydown", escClose);
    modal.addEventListener("keydown", trapFocus);
    overlay?.addEventListener("click", closeModal);
    closeBtn?.addEventListener("click", closeModal);
  }

  // close modal
  function closeModal() {
    if (!modal) return;
    modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");

    // remove injected iframe to stop media
    if (wmEmbed) { wmEmbed.innerHTML = ""; wmEmbed.classList.add("hidden"); }

    window.removeEventListener("keydown", escClose);
    modal.removeEventListener("keydown", trapFocus);
    overlay?.removeEventListener("click", closeModal);
    closeBtn?.removeEventListener("click", closeModal);

    // return focus
    try { lastFocused?.focus?.(); } catch (e) {}
    activeCard = null;
  }

  // ESC handler
  function escClose(e) {
    if (e.key === "Escape") closeModal();
  }

  // simple focus trap (Tab)
  function trapFocus(e) {
    if (e.key !== "Tab") return;
    const focusable = modal.querySelectorAll('a,button,input,textarea,select,[tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  // init
  renderWork();

  // set year & smooth hash scroll (if needed)
  try { document.getElementById('year').textContent = new Date().getFullYear(); } catch(e){}

})();
