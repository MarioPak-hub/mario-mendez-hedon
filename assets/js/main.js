/* =========================================================
   CONFIGURACIÓN — cambia aquí los datos de Mario
   ========================================================= */
const CONFIG = {
  // WhatsApp de Mario: 52 + 10 dígitos, sin espacios. Ej: "523312345678"
  whatsapp: "523333553680",
  // Teléfono para el botón "Llamar" (mismo formato con +). Ej: "+523312345678"
  telefono: "+523333553680",
};

window.CONFIG = CONFIG;

(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const mxn = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });
  const num = new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 });
  const reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");

  const waLink = (text) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;

  /* ---------- WhatsApp links ---------- */
  $$("[data-wa]").forEach((a) => {
    a.href = waLink(a.dataset.wa);
    a.target = "_blank";
    a.rel = "noopener";
  });
  const call = $("#call-btn");
  if (call && CONFIG.telefono) call.href = `tel:${CONFIG.telefono}`;
  else if (call) call.hidden = true;
  if (CONFIG.whatsapp && $("#contact-phone")) {
    const n = CONFIG.whatsapp.replace(/^52/, "");
    $("#contact-phone").textContent = `WhatsApp: ${n.slice(0, 2)} ${n.slice(2, 6)} ${n.slice(6)}`;
  }
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Nav ---------- */
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const burger = $("#burger");
  const menu = $("#mobile-menu");
  const setMenu = (open) => {
    menu.hidden = !open;
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    burger.querySelector("use").setAttribute("href", open ? "#i-x" : "#i-menu");
  };
  burger.addEventListener("click", () => setMenu(menu.hidden));
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) { setMenu(false); burger.focus(); } });

  if ($("#calc")) {
  /* ---------- Calculadora ---------- */
  // Supuestos ilustrativos (no es cotización):
  //   precio promedio por kWh según tipo, % de ahorro alcanzable,
  //   producción 125 kWh/mes por kWp instalado (≈5.2 HSP · 0.8 PR), panel de 550 W,
  //   factor de emisión del sistema eléctrico nacional 0.438 tCO2/MWh.
  const PROFILES = {
    residencial: { precioKwh: 3.2, ahorro: 0.95 },
    comercial:   { precioKwh: 4.2, ahorro: 0.85 },
    industrial:  { precioKwh: 2.6, ahorro: 0.70 },
  };
  const calc = $("#calc");
  const recibo = $("#recibo");
  const range = $("#recibo-range");
  const out = { mes: $("#r-mes"), anio: $("#r-anio"), y25: $("#r-25"), pan: $("#r-paneles"), co2: $("#r-co2") };
  let lastCalc = null;

  function compute() {
    const tipo = calc.querySelector("input[name=tipo]:checked").value;
    const p = PROFILES[tipo];
    const bill = Math.max(0, Number(recibo.value) || 0);
    const kwhMes = bill / p.precioKwh;
    const ahorroMes = bill * p.ahorro;
    const kwp = (kwhMes * p.ahorro) / 125;
    const paneles = Math.max(bill > 0 ? 2 : 0, Math.ceil(kwp / 0.55));
    const co2 = (kwhMes * p.ahorro * 12 * 0.438) / 1000;
    lastCalc = { tipo, bill, ahorroMes, paneles };
    out.mes.textContent = mxn.format(ahorroMes);
    out.anio.textContent = mxn.format(ahorroMes * 12);
    out.y25.textContent = mxn.format(ahorroMes * 12 * 25);
    out.pan.textContent = num.format(paneles);
    out.co2.textContent = `${co2.toFixed(1)} t`;
    $("#calc-send").href = waLink(
      `Hola Mario, usé la calculadora de tu página. Tipo: ${tipo}. Pago aprox. ${mxn.format(bill)} al mes. ` +
      `Me salió un ahorro estimado de ${mxn.format(ahorroMes)} al mes (~${paneles} paneles). Quiero mi estudio sin costo.`
    );
  }
  recibo.addEventListener("input", () => { range.value = Math.min(Number(range.max), Number(recibo.value) || 0); compute(); });
  range.addEventListener("input", () => { recibo.value = range.value; compute(); });
  calc.addEventListener("change", compute);
  calc.addEventListener("submit", (e) => e.preventDefault());
  $("#calc-send").target = "_blank";
  $("#calc-send").rel = "noopener";
  compute();

  }

  if ($("#lead-form")) {
  /* ---------- Formulario → WhatsApp ---------- */
  const form = $("#lead-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = $("#f-nombre");
    const err = $("#e-nombre");
    if (!nombre.value.trim()) {
      nombre.setAttribute("aria-invalid", "true");
      nombre.setAttribute("aria-describedby", "e-nombre");
      err.hidden = false;
      nombre.focus();
      return;
    }
    nombre.removeAttribute("aria-invalid");
    err.hidden = true;
    const ciudad = $("#f-ciudad").value.trim();
    const tipo = $("#f-tipo").value;
    const rec = $("#f-recibo").value.trim();
    const msg = [
      `Hola Mario, soy ${nombre.value.trim()}${ciudad ? ` de ${ciudad}` : ""}.`,
      `Me interesa: ${tipo}.`,
      rec ? `Pago aprox. $${rec} de luz al mes.` : "",
      "Quiero mi estudio energético sin costo.",
    ].filter(Boolean).join(" ");
    window.open(waLink(msg), "_blank", "noopener");
  });

  }

  /* ---------- Calculadora gas LP (página de servicios) ---------- */
  // El gas LP rinde ~20% menos km por litro que la gasolina (supuesto ilustrativo).
  const lpForm = $("#calc-lp");
  if (lpForm) {
    const v = (id) => Math.max(0, Number($(id).value) || 0);
    const lpCompute = () => {
      const veh = v("#lp-veh"), km = v("#lp-km"), rend = v("#lp-rend") || 1, pg = v("#lp-pg"), plp = v("#lp-plp");
      const costoG = (veh * km / rend) * pg;
      const costoLP = (veh * km / (rend * 0.8)) * plp;
      const ahorro = Math.max(0, costoG - costoLP);
      const pct = costoG > 0 ? (ahorro / costoG) * 100 : 0;
      $("#lp-mes").textContent = mxn.format(ahorro);
      $("#lp-anio").textContent = mxn.format(ahorro * 12);
      $("#lp-pct").textContent = `${pct.toFixed(0)}%`;
      const send = $("#lp-send");
      send.href = waLink(`Hola Mario, usé la calculadora de gas LP. Tengo ${veh} vehículo(s) con ${num.format(km)} km al mes cada uno y rendimiento de ${rend} km/l. Me salió un ahorro estimado de ${mxn.format(ahorro)} al mes. Quiero información de la conversión.`);
      send.target = "_blank"; send.rel = "noopener";
    };
    lpForm.addEventListener("input", lpCompute);
    lpForm.addEventListener("submit", (e) => e.preventDefault());
    lpCompute();
  }

  /* ---------- Tilt 3D en tarjetas (solo puntero fino) ---------- */
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
  if (fine.matches) {
    $$("[data-tilt]").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        if (reduceMQ.matches) return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        el.style.transform = `perspective(1000px) rotateX(${(0.5 - y) * 7}deg) rotateY(${(x - 0.5) * 9}deg)`;
        el.style.setProperty("--mx", `${x * 100}%`);
        el.style.setProperty("--my", `${y * 100}%`);
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------- Contadores ---------- */
  function runCount(el) {
    const end = Number(el.dataset.count);
    const fmt = el.dataset.format === "money" ? (v) => num.format(v) + ".00" : (v) => num.format(v);
    if (reduceMQ.matches || !window.gsap) { el.textContent = fmt(end); return; }
    const o = { v: 0 };
    gsap.to(o, { v: end, duration: end > 1000 ? 2.2 : 1.6, ease: "power3.out", onUpdate: () => (el.textContent = fmt(Math.round(o.v))) });
  }
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { runCount(en.target); countIO.unobserve(en.target); } });
  }, { threshold: 0.6 });
  $$("[data-count]").forEach((el) => countIO.observe(el));

  /* ---------- Pasos: barra de progreso al aparecer ---------- */
  const stepIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-on"); stepIO.unobserve(en.target); } });
  }, { threshold: 0.5 });
  $$(".step").forEach((el) => stepIO.observe(el));

  /* ---------- GSAP: entradas y scroll del hero ---------- */
  window.addEventListener("load", () => {
    if (!window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      if ($(".cine")) {
      // Intro del hero (sobre el <img> para no chocar con el scroll)
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.from(".cine__sky img", { scale: 1.15, duration: 2.4, ease: "power2.out" })
        .from(".cine__home, .cine__grass", { yPercent: 28, opacity: 0, duration: 1.8, stagger: 0.08 }, 0.2)
        .from(".cine__eyebrow", { y: 20, opacity: 0, duration: 1 }, 0.4)
        .from(".cine__title .line", { yPercent: 110, opacity: 0, duration: 1.3, stagger: 0.12 }, 0.5)
        .from(".cine__lead", { y: 24, opacity: 0, duration: 1 }, 0.8)
        .from(".cine .hero__actions > *", { y: 20, opacity: 0, duration: 0.9, stagger: 0.08 }, 0.9)
        .from(".cine__chips li", { y: 12, opacity: 0, duration: 0.8, stagger: 0.06 }, 1.0);

      // Película con scroll: la casa sube entre las nubes y la cámara entra a los paneles
      const film = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: { trigger: ".cine", start: "top top", end: "+=220%", pin: true, scrub: 0.8, anticipatePin: 1 },
      });
      film
        .to(".cine__sky", { yPercent: -6, scale: 1.06, duration: 1 }, 0)
        .to(".cine__sun", { yPercent: -18, duration: 1 }, 0)
        .to(".cine__horizon", { yPercent: 8, duration: 1 }, 0)
        .to(".cine__high", { xPercent: -10, yPercent: -12, duration: 1 }, 0)
        .to(".cine__copy", { yPercent: -22, opacity: 0, duration: 0.22 }, 0)
        .fromTo(".cine__house", { yPercent: 10, scale: 0.92 }, { yPercent: -6, scale: 1, duration: 0.4 }, 0)
        .to(".cine__fog", { yPercent: 40, xPercent: 8, opacity: 0.4, duration: 0.5 }, 0)
        .to(".hero__scroll", { opacity: 0, duration: 0.1 }, 0)
        .to(".cine__caption--1", { opacity: 1, y: -20, duration: 0.14 }, 0.3)
        .to(".cine__caption--1", { opacity: 0, y: -50, duration: 0.1 }, 0.5)
        .to(".cine__house", { scale: 3.4, yPercent: 8, duration: 0.5, ease: "power2.in" }, 0.5)
        .to(".cine__dusk", { opacity: 0.82, duration: 0.12 }, 0.68)
        .to(".cine__caption--2", { opacity: 1, y: -20, duration: 0.12 }, 0.74)
        .to(".cine__caption--2", { opacity: 0, y: -50, duration: 0.08 }, 0.92)
        .to(".cine__dusk", { opacity: 1, duration: 0.08 }, 0.92);
      }

      // Escena 3D sigue al scroll de su sección
      if ($(".system")) ScrollTrigger.create({
        trigger: ".system", start: "top bottom", end: "bottom top", scrub: true,
        onUpdate: (self) => window.heroScene?.setProgress(self.progress),
      });

      // Apariciones al hacer scroll
      gsap.utils.toArray("[data-reveal]").forEach((el) => {
        gsap.from(el, { y: 40, opacity: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
      });
      if ($("#steps")) gsap.from(".step", {
        y: 40, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.08,
        scrollTrigger: { trigger: "#steps", start: "top 80%", once: true },
      });

      // Servicios: la tarjeta anterior se encoge cuando llega la siguiente
      const cards = $$(".dv");
      if (cards.length && window.matchMedia("(min-width: 901px)").matches) {
        // Las tarjetas son sticky: se mide su posición natural (sin pegar) para el scroll.
        const dvs = $("#dvs");
        const natural = (i) => {
          const gap = parseFloat(getComputedStyle(dvs).rowGap) || 0;
          let y = dvs.getBoundingClientRect().top + window.scrollY;
          for (let k = 0; k < i; k++) y += cards[k].offsetHeight + gap;
          return y;
        };
        cards.forEach((card, i) => {
          if (!cards[i + 1]) return;
          gsap.to(card, {
            scale: 0.93, filter: "brightness(0.5)", ease: "none",
            scrollTrigger: {
              trigger: dvs, scrub: true, invalidateOnRefresh: true,
              start: () => natural(i + 1) - window.innerHeight,
              end: () => natural(i + 1) - 92,
            },
          });
        });
      }
      if ($(".page-hero")) gsap.from(".page-hero .breadcrumb, .page-hero .eyebrow, .page-title, .page-hero .lead, .svc-index li", {
        y: 30, opacity: 0, duration: 1.1, ease: "expo.out", stagger: 0.07,
      });

      // Botón magnético
      if (fine.matches) {
        $$(".magnetic").forEach((el) => {
          const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "elastic.out(1,0.4)" });
          const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "elastic.out(1,0.4)" });
          el.addEventListener("mousemove", (e) => {
            const r = el.getBoundingClientRect();
            xTo((e.clientX - r.left - r.width / 2) * 0.25);
            yTo((e.clientY - r.top - r.height / 2) * 0.25);
          });
          el.addEventListener("mouseleave", () => { xTo(0); yTo(0); });
        });
      }
    });
  });
})();
