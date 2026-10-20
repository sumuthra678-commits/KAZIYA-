/* ===== KAZIYA — script.js ===== */
(() => {
  "use strict";

  /* ---------- Gallery data ----------
     Replace `src` with your own photos (e.g. "images/my-photo.jpg").
     category: portrait | manipulation | nature | street | creative | gaming */
  const U = (id, w = 800) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=70`;
  const GALLERY = [
    { src: U("photo-1494790108377-be9c29b29330"), title: "Golden Gaze", category: "portrait", label: "Cinematic Portrait" },
    { src: U("photo-1534528741775-53994a69daeb"), title: "Blue Hour", category: "portrait", label: "Cinematic Portrait" },
    { src: U("photo-1506794778202-cad84cf45f1d"), title: "Silent Story", category: "portrait", label: "Cinematic Portrait" },
    { src: U("photo-1518709268805-4e9042af9f23"), title: "Floating Worlds", category: "manipulation", label: "Photo Manipulation" },
    { src: U("photo-1543722530-d2c3201371e7"), title: "Dreamscape", category: "manipulation", label: "Photo Manipulation" },
    { src: U("photo-1506905925346-21bda4d32df4"), title: "Above the Clouds", category: "nature", label: "Nature" },
    { src: U("photo-1441974231531-c6227db76b6e"), title: "Forest Light", category: "nature", label: "Nature" },
    { src: U("photo-1470071459604-3b5ec3a7fe05"), title: "Misty Valley", category: "nature", label: "Nature" },
    { src: U("photo-1477959858617-67f85cf4f1df"), title: "City Pulse", category: "street", label: "Street" },
    { src: U("photo-1514565131-fce0801e5785"), title: "Neon Rain", category: "street", label: "Street" },
    { src: U("photo-1536514498073-50e69d39c6cf"), title: "Crossroads", category: "street", label: "Street" },
    { src: U("photo-1557672172-298e090bd0f1"), title: "Chromatic Flow", category: "creative", label: "Creative Edit" },
    { src: U("photo-1579546929518-9e396f3cc809"), title: "Gradient Dream", category: "creative", label: "Creative Edit" },
    { src: U("photo-1511512578047-dfb367046420"), title: "Arena Ready", category: "gaming", label: "Gaming Graphics" },
    { src: U("photo-1550745165-9bc0b252726f"), title: "Retro Console", category: "gaming", label: "Gaming Graphics" },
    { src: U("photo-1538481199705-c710c4e965fc"), title: "Victory Banner", category: "gaming", label: "Gaming Graphics" },
  ];

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- Build gallery ---------- */
  const masonry = $("#masonry");
  masonry.innerHTML = GALLERY.map((g, i) => `
    <figure class="tile reveal" data-cat="${g.category}" data-index="${i}" tabindex="0" role="button" aria-label="Open ${g.title}">
      <img src="${g.src}" alt="${g.title} — ${g.label}" loading="lazy" decoding="async" />
      <figcaption><b>${g.title}</b><span>${g.label}</span></figcaption>
    </figure>`).join("");

  /* ---------- Filters ---------- */
  let visible = GALLERY.map((_, i) => i);
  $$(".filter").forEach(btn => btn.addEventListener("click", () => {
    $$(".filter").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const f = btn.dataset.filter;
    visible = [];
    $$(".tile").forEach(t => {
      const show = f === "all" || t.dataset.cat === f;
      t.classList.toggle("hide", !show);
      if (show) { visible.push(+t.dataset.index); t.classList.add("visible"); }
    });
  }));

  /* ---------- Lightbox ---------- */
  const lb = $("#lightbox"), lbImg = $("#lbImg"), lbCap = $("#lbCap");
  let current = 0, lastFocus = null;
  const show = i => {
    current = i;
    const g = GALLERY[i];
    lbImg.src = g.src.replace("w=800", "w=1600");
    lbImg.alt = `${g.title} — ${g.label}`;
    lbCap.textContent = `${g.title} · ${g.label}`;
  };
  const openLb = i => { lastFocus = document.activeElement; show(i); lb.hidden = false; document.body.style.overflow = "hidden"; $("#lbClose").focus(); };
  const closeLb = () => { lb.hidden = true; document.body.style.overflow = ""; lastFocus && lastFocus.focus(); };
  const step = d => { const pos = visible.indexOf(current); show(visible[(pos + d + visible.length) % visible.length]); };

  masonry.addEventListener("click", e => { const t = e.target.closest(".tile"); if (t) openLb(+t.dataset.index); });
  masonry.addEventListener("keydown", e => { const t = e.target.closest(".tile"); if (t && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openLb(+t.dataset.index); } });
  $("#lbClose").addEventListener("click", closeLb);
  $("#lbPrev").addEventListener("click", () => step(-1));
  $("#lbNext").addEventListener("click", () => step(1));
  lb.addEventListener("click", e => { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", e => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  });

  /* ---------- Nav: scroll state, mobile menu, active link ---------- */
  const nav = $("#nav"), burger = $("#burger"), menu = $("#menu");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  const toggleMenu = open => {
    menu.classList.toggle("open", open); burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open); document.body.style.overflow = open ? "hidden" : "";
  };
  burger.addEventListener("click", () => toggleMenu(!menu.classList.contains("open")));
  $$("#menu a").forEach(a => a.addEventListener("click", () => toggleMenu(false)));

  const links = $$("#menu a");
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) links.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + en.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("main section[id]").forEach(s => spy.observe(s));

  /* ---------- Scroll reveal + counters ---------- */
  const countUp = el => {
    const target = +el.dataset.count, start = performance.now();
    const tick = now => { const p = Math.min((now - start) / 1500, 1); el.textContent = Math.floor(target * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  };
  const rev = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add("visible");
      $$("[data-count]", en.target).forEach(countUp);
      rev.unobserve(en.target);
    });
  }, { threshold: 0.12 });
  $$(".reveal").forEach(el => rev.observe(el));

  /* ---------- Typing tagline ---------- */
  const typed = $("#typed"), phrase = "Turning Moments Into Masterpieces.";
  let k = 0;
  const type = () => { typed.textContent = phrase.slice(0, ++k); if (k < phrase.length) setTimeout(type, 55); };
  setTimeout(type, 900);

  /* ---------- Mouse-following glow ---------- */
  const glow = $(".cursor-glow");
  if (window.matchMedia("(pointer: fine)").matches) {
    let x = 0, y = 0, raf;
    window.addEventListener("mousemove", e => {
      x = e.clientX; y = e.clientY;
      if (!raf) raf = requestAnimationFrame(() => { glow.style.left = x + "px"; glow.style.top = y + "px"; raf = null; });
    });
  }

  /* ---------- Contact form validation ---------- */
  const form = $("#contactForm"), status = $("#formStatus");
  const rules = {
    name: v => v.length < 2 ? "Please enter your name (min 2 characters)." : v.length > 100 ? "Name is too long." : "",
    email: v => !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? "Please enter a valid email address." : "",
    subject: v => v.length < 3 ? "Subject must be at least 3 characters." : "",
    message: v => v.length < 10 ? "Message must be at least 10 characters." : v.length > 1000 ? "Message must be under 1000 characters." : "",
  };
  const check = input => {
    const msg = rules[input.name](input.value.trim());
    const field = input.closest(".field");
    field.classList.toggle("invalid", !!msg);
    $(".err", field).textContent = msg;
    input.setAttribute("aria-invalid", !!msg);
    return !msg;
  };
  Object.keys(rules).forEach(n => form.elements[n].addEventListener("blur", e => check(e.target)));
  form.addEventListener("submit", e => {
    e.preventDefault();
    const ok = Object.keys(rules).map(n => check(form.elements[n])).every(Boolean);
    status.className = "form-status";
    if (!ok) { status.textContent = "Please fix the highlighted fields."; return; }
    // TODO: connect a backend / email service here (Formspree, EmailJS, your own API).
    status.classList.add("ok");
    status.textContent = "✓ Looks good! (Demo only — connect an email service to deliver messages.)";
    form.reset();
  });

  $("#year").textContent = new Date().getFullYear();
})();
