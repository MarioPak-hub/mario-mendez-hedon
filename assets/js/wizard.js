/* =========================================================
   Asistente "¿En qué te puedo ayudar?"
   El cliente contesta con botones y se arma un mensaje de
   WhatsApp ordenado para Mario.

   Para cambiar preguntas u opciones, edita FLOWS (abajo).
   Cada paso: { id, k (etiqueta corta en el mensaje), q (pregunta),
   hint?, opts: [texto] o [[texto, icono]], multi?, when? }
   ========================================================= */
(() => {
  "use strict";
  const PHONE = (window.CONFIG && window.CONFIG.whatsapp) || "523333553680";
  const waLink = (t) => `https://wa.me/${PHONE}?text=${encodeURIComponent(t)}`;

  const CUANDO = { id: "cuando", k: "Cuándo", q: "¿Para cuándo lo necesitas?", opts: [["Lo antes posible", "i-zap"], ["En 1 a 3 meses", "i-clock"], ["Solo estoy cotizando", "i-calc"]] };

  const FLOWS = {
    solar: {
      label: "Paneles solares", icon: "i-sun", accent: "#FFB627",
      steps: [
        { id: "lugar", k: "Dónde", q: "¿Dónde los instalarías?", opts: [["Casa", "i-home"], ["Negocio u oficina", "i-store"], ["Industria o nave", "i-factory"], ["Rancho o campo (bombeo solar)", "i-drop"]] },
        { id: "agua", k: "Uso del agua", q: "¿Para qué usarías el agua?", when: (a) => a.lugar === "Rancho o campo (bombeo solar)", opts: ["Riego", "Ganado", "Uso doméstico", "Varios usos"] },
        { id: "recibo", k: "Pago de luz", q: "¿Cuánto pagas de luz?", hint: "Lo que diga tu recibo de CFE, sea mensual o bimestral.", when: (a) => a.lugar !== "Rancho o campo (bombeo solar)", opts: ["Menos de $1,000", "$1,000 – $3,000", "$3,000 – $10,000", "$10,000 – $50,000", "Más de $50,000", "No sé"] },
        { id: "foto", k: "Recibo CFE", q: "¿Tienes tu recibo de CFE a la mano?", hint: "Con una foto del recibo te puedo dar números exactos.", when: (a) => a.lugar !== "Rancho o campo (bombeo solar)", opts: [["Sí, te mando foto", "i-receipt"], ["Ahorita no", "i-clock"]] },
        { id: "pago", k: "Forma de pago", q: "¿Cómo te gustaría pagarlo?", opts: [["De contado", "i-cash"], ["Con financiamiento", "i-percent"], ["Aún no sé", "i-help"]] },
        CUANDO,
      ],
    },
    baterias: {
      label: "Baterías y respaldo", icon: "i-battery", accent: "#E5232A",
      steps: [
        { id: "lugar", k: "Dónde", q: "¿Para dónde es?", opts: [["Casa", "i-home"], ["Negocio u oficina", "i-store"], ["Industria o nave", "i-factory"]] },
        { id: "objetivo", k: "Busca", q: "¿Qué estás buscando?", opts: [["Respaldo cuando se va la luz", "i-battery"], ["Bajar mi demanda punta", "i-activity"], ["Las dos cosas", "i-check"], ["No sé, quiero asesoría", "i-help"]] },
        { id: "paneles", k: "¿Tiene paneles?", q: "¿Ya tienes paneles solares?", opts: [["Sí", "i-sun"], ["No", "i-x"]] },
        CUANDO,
      ],
    },
    hvac: {
      label: "Aire acondicionado", icon: "i-snow", accent: "#5CC8FF",
      steps: [
        { id: "espacio", k: "Espacio", q: "¿Qué tipo de espacio es?", opts: [["Oficina o comercio", "i-store"], ["Nave industrial o almacén", "i-factory"], ["Hospital, laboratorio o data center", "i-shield"], ["Casa", "i-home"]] },
        { id: "necesita", k: "Necesita", q: "¿Qué necesitas?", opts: [["Equipo nuevo", "i-snow"], ["Reemplazar equipo", "i-activity"], ["Mantenimiento o reparación", "i-wrench"]] },
        { id: "tamano", k: "Tamaño", q: "¿Qué tan grande es el espacio?", opts: ["Menos de 100 m²", "100 – 500 m²", "500 – 2,000 m²", "Más de 2,000 m²", "No sé"] },
        CUANDO,
      ],
    },
    redes: {
      label: "Redes, cableado y cámaras", icon: "i-cpu", accent: "#9B8CFF",
      steps: [
        { id: "servicios", k: "Necesita", q: "¿Qué necesitas?", hint: "Puedes elegir varias.", multi: true, opts: [["Cableado de red", "i-cpu"], ["Fibra óptica", "i-zap"], ["Cámaras CCTV", "i-shield"], ["Wi-Fi", "i-activity"], ["Centro de cómputo", "i-store"], ["Telefonía IP", "i-phone"]] },
        { id: "lugar", k: "Lugar", q: "¿Dónde es?", opts: [["Oficina", "i-store"], ["Industria o nave", "i-factory"], ["Hospital o escuela", "i-shield"], ["Comercio", "i-cash"], ["Otro", "i-help"]] },
        { id: "tamano", k: "Tamaño", q: "¿De qué tamaño es el proyecto?", opts: ["Pequeño (menos de 20 puntos)", "Mediano (20 – 100 puntos)", "Grande (más de 100 puntos)", "No sé"] },
        CUANDO,
      ],
    },
    ev: {
      label: "Cargadores eléctricos", icon: "i-plug", accent: "#2BD47D",
      steps: [
        { id: "para", k: "Para", q: "¿Para quién son los cargadores?", opts: [["Empresa", "i-store"], ["Agencia automotriz", "i-award"], ["Estacionamiento", "i-pin"], ["Flotilla", "i-users"], ["Casa", "i-home"]] },
        { id: "cuantos", k: "Cargadores", q: "¿Cuántos cargadores necesitas?", opts: ["1 o 2", "3 a 10", "Más de 10", "No sé"] },
        CUANDO,
      ],
    },
    gaslp: {
      label: "Conversión a gas LP", icon: "i-fuel", accent: "#FF7A1A",
      steps: [
        { id: "vehiculos", k: "Vehículos", q: "¿Cuántos vehículos quieres convertir?", opts: ["1", "2 a 5", "6 a 20", "Más de 20"] },
        { id: "tipo", k: "Tipo", q: "¿Qué tipo de vehículos son?", hint: "Puedes elegir varios.", multi: true, opts: ["Reparto", "Pick up", "SUV", "Sedán", "Camión ligero"] },
        { id: "km", k: "Km al mes", q: "¿Cuántos km recorre cada uno al mes?", opts: ["Menos de 2,000", "2,000 – 5,000", "Más de 5,000", "No sé"] },
        CUANDO,
      ],
    },
    otro: {
      label: "Otra cosa / no estoy seguro", icon: "i-help", accent: "#A3ADBB",
      steps: [
        { id: "meta", k: "Quiere", q: "¿Qué te gustaría lograr?", opts: [["Pagar menos de luz", "i-percent"], ["Tener luz cuando se va", "i-battery"], ["Mejor clima en mi espacio", "i-snow"], ["Mejor red o seguridad", "i-shield"], ["Ahorrar en combustible", "i-fuel"], ["Otra cosa", "i-help"]] },
        { id: "lugar", k: "Para", q: "¿Es para tu casa o tu empresa?", opts: [["Casa", "i-home"], ["Negocio u oficina", "i-store"], ["Industria", "i-factory"]] },
      ],
    },
  };
  const ORDER = ["solar", "baterias", "hvac", "redes", "ev", "gaslp", "otro"];

  /* ---------- estado ---------- */
  let flowKey = null;
  let answers = {};
  let contact = { nombre: "", ciudad: "", via: "WhatsApp", horario: "Cualquier hora", nota: "" };
  let stack = []; // historial de pasos para "atrás"
  let current = null; // "service" | step id | "contact" | "summary" | "sent"

  const icon = (id, cls = "ic") => `<svg class="${cls}" aria-hidden="true"><use href="#${id}"/></svg>`;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const visibleSteps = () => (flowKey ? FLOWS[flowKey].steps.filter((s) => !s.when || s.when(answers)) : []);

  /* ---------- diálogo ---------- */
  const dlg = document.createElement("dialog");
  dlg.className = "wz";
  dlg.setAttribute("aria-labelledby", "wz-q");
  dlg.innerHTML = `
    <div class="wz__panel">
      <header class="wz__top">
        <button type="button" class="wz__icon-btn" data-act="back" aria-label="Paso anterior">${icon("i-back")}</button>
        <div class="wz__progress" role="progressbar" aria-label="Progreso" aria-valuemin="0" aria-valuemax="100"><span></span></div>
        <button type="button" class="wz__icon-btn" data-act="close" aria-label="Cerrar">${icon("i-x")}</button>
      </header>
      <div class="wz__body" aria-live="polite"></div>
      <footer class="wz__foot">
        <a class="wz__skip" target="_blank" rel="noopener">Prefiero escribir directo</a>
        <button type="button" class="btn btn--primary wz__next" data-act="next" hidden>Continuar ${icon("i-arrow")}</button>
      </footer>
    </div>`;
  document.body.appendChild(dlg);
  const body = dlg.querySelector(".wz__body");
  const bar = dlg.querySelector(".wz__progress span");
  const barWrap = dlg.querySelector(".wz__progress");
  const nextBtn = dlg.querySelector(".wz__next");
  const backBtn = dlg.querySelector('[data-act="back"]');
  dlg.querySelector(".wz__skip").href = waLink("Hola Mario, vi tu página y quiero información.");

  function open(preset) {
    flowKey = null; answers = {}; stack = [];
    if (preset && FLOWS[preset]) {
      flowKey = preset;
      go(visibleSteps()[0].id, false);
    } else {
      go("service", false);
    }
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
    document.documentElement.classList.add("wz-open");
  }
  function close() {
    if (dlg.open) dlg.close();
    document.documentElement.classList.remove("wz-open");
  }
  dlg.addEventListener("close", () => document.documentElement.classList.remove("wz-open"));
  dlg.addEventListener("click", (e) => { if (e.target === dlg) close(); }); // clic fuera del panel

  function go(id, push = true) {
    if (push && current) stack.push(current);
    current = id;
    render();
  }
  function back() {
    if (!stack.length) { close(); return; }
    current = stack.pop();
    if (current === "service") { flowKey = null; answers = {}; }
    render();
  }
  function nextAfter(stepId) {
    const steps = visibleSteps();
    const i = steps.findIndex((s) => s.id === stepId);
    return steps[i + 1] ? steps[i + 1].id : "contact";
  }

  /* ---------- render ---------- */
  function setProgress() {
    const steps = visibleSteps();
    const total = (flowKey ? steps.length : 3) + 3; // servicio + pasos + datos + resumen
    let pos = 1;
    if (current === "service") pos = 1;
    else if (current === "contact") pos = total - 1;
    else if (current === "summary" || current === "sent") pos = total;
    else pos = 2 + steps.findIndex((s) => s.id === current);
    const pct = Math.round((pos / total) * 100);
    bar.style.width = `${pct}%`;
    barWrap.setAttribute("aria-valuenow", String(pct));
    dlg.style.setProperty("--accent", flowKey ? FLOWS[flowKey].accent : "var(--gold)");
    backBtn.style.visibility = current === "service" || current === "sent" ? "hidden" : "visible";
  }

  function render() {
    setProgress();
    nextBtn.hidden = true;
    const flow = flowKey && FLOWS[flowKey];
    const crumb = flow ? `<p class="wz__crumb">${icon(flow.icon)} ${esc(flow.label)}</p>` : "";

    if (current === "service") {
      body.innerHTML = `
        <p class="wz__hello">Hola, soy Mario</p>
        <h2 class="wz__q" id="wz-q">¿En qué te puedo ayudar?</h2>
        <p class="wz__hint">Contesta unas preguntas rápidas y te llega a mi WhatsApp todo listo. Así te respondo con información concreta.</p>
        <div class="wz__opts wz__opts--grid">
          ${ORDER.map((k) => `<button type="button" class="wz__opt wz__opt--svc" data-flow="${k}" style="--accent:${FLOWS[k].accent}">${icon(FLOWS[k].icon)}<span>${esc(FLOWS[k].label)}</span></button>`).join("")}
        </div>`;
    } else if (current === "contact") {
      body.innerHTML = `
        ${crumb}
        <h2 class="wz__q" id="wz-q">¡Ya casi! ¿Cómo te llamas?</h2>
        <div class="wz__form">
          <div class="field"><label class="label" for="wz-nombre">Tu nombre</label><input class="wz__input" id="wz-nombre" autocomplete="name" value="${esc(contact.nombre)}" required /><p class="error" id="wz-err" hidden>Escribe tu nombre para que Mario sepa con quién habla.</p></div>
          <div class="field"><label class="label" for="wz-ciudad">Ciudad o municipio <span class="opt">(opcional)</span></label><input class="wz__input" id="wz-ciudad" autocomplete="address-level2" placeholder="Ej. Zapopan" value="${esc(contact.ciudad)}" /></div>
          <fieldset class="wz__chips"><legend class="label">¿Cómo prefieres que te contacte?</legend>
            ${["WhatsApp", "Llamada"].map((v) => `<button type="button" class="wz__chip" data-via="${v}" aria-pressed="${contact.via === v}">${v}</button>`).join("")}
          </fieldset>
          <fieldset class="wz__chips"><legend class="label">¿A qué hora te queda mejor?</legend>
            ${["Mañana", "Tarde", "Noche", "Cualquier hora"].map((v) => `<button type="button" class="wz__chip" data-hora="${v}" aria-pressed="${contact.horario === v}">${v}</button>`).join("")}
          </fieldset>
          <div class="field"><label class="label" for="wz-nota">¿Algo más que quieras contarme? <span class="opt">(opcional)</span></label><textarea class="wz__input" id="wz-nota" rows="2">${esc(contact.nota)}</textarea></div>
        </div>`;
      nextBtn.hidden = false;
      nextBtn.innerHTML = `Ver mi mensaje ${icon("i-arrow")}`;
    } else if (current === "summary") {
      const msg = buildMessage();
      body.innerHTML = `
        ${crumb}
        <h2 class="wz__q" id="wz-q">Este es el mensaje que le llegará a Mario</h2>
        <div class="wz__bubble">${esc(msg).replace(/\*(.+?)\*/g, "<strong>$1</strong>").replace(/\n/g, "<br/>")}</div>
        <a class="btn btn--wa btn--lg btn--block" id="wz-send" href="${waLink(msg)}" target="_blank" rel="noopener">${icon("i-wa")} Enviar por WhatsApp</a>
        <p class="wz__hint wz__hint--center">Se abre WhatsApp con el mensaje listo; solo toca enviar.</p>`;
    } else if (current === "sent") {
      body.innerHTML = `
        <div class="wz__done">${icon("i-check", "ic wz__done-ic")}</div>
        <h2 class="wz__q wz__q--center" id="wz-q">¡Listo, ${esc(contact.nombre.split(" ")[0] || "gracias")}!</h2>
        <p class="wz__hint wz__hint--center">Se abrió WhatsApp con tu mensaje. Mario te responde lo antes posible.${answers.foto === "Sí, te mando foto" ? " No olvides mandarle la foto de tu recibo." : ""}</p>
        <a class="btn btn--ghost btn--block" href="${waLink(buildMessage())}" target="_blank" rel="noopener">¿No se abrió? Toca aquí</a>`;
    } else {
      const step = flow.steps.find((s) => s.id === current);
      const sel = answers[step.id];
      const isSel = (t) => (step.multi ? (sel || []).includes(t) : sel === t);
      body.innerHTML = `
        ${crumb}
        <h2 class="wz__q" id="wz-q">${esc(step.q)}</h2>
        ${step.hint ? `<p class="wz__hint">${esc(step.hint)}</p>` : ""}
        <div class="wz__opts ${step.opts.length > 4 ? "wz__opts--grid" : ""}" role="group" aria-label="${esc(step.q)}">
          ${step.opts.map((o) => { const [t, ic] = Array.isArray(o) ? o : [o, null]; return `<button type="button" class="wz__opt" data-val="${esc(t)}" aria-pressed="${isSel(t)}">${ic ? icon(ic) : ""}<span>${esc(t)}</span>${icon("i-check", "ic wz__tick")}</button>`; }).join("")}
        </div>`;
      if (step.multi) {
        nextBtn.hidden = false;
        nextBtn.innerHTML = `Continuar ${icon("i-arrow")}`;
        nextBtn.disabled = !(sel && sel.length);
      }
    }
    body.classList.remove("wz__body--in");
    void body.offsetWidth; // reinicia la animación
    body.classList.add("wz__body--in");
    const first = body.querySelector("input, .wz__opt, #wz-send");
    if (first && window.matchMedia("(hover: hover)").matches) first.focus({ preventScroll: true });
  }

  /* ---------- mensaje ---------- */
  function buildMessage() {
    const flow = FLOWS[flowKey];
    const who = contact.nombre.trim() || "un cliente";
    const lines = [`Hola Mario, soy ${who}${contact.ciudad.trim() ? ` de ${contact.ciudad.trim()}` : ""}. Vi tu página.`, "", `Me interesa: *${flow.label}*`];
    visibleSteps().forEach((s) => {
      const v = answers[s.id];
      if (v == null || (Array.isArray(v) && !v.length) || s.id === "foto") return; // la foto va al final
      lines.push(`• ${s.k}: ${Array.isArray(v) ? v.join(", ") : v}`);
    });
    if (contact.nota.trim()) lines.push(`• Comentario: ${contact.nota.trim()}`);
    lines.push("", `Prefiero ${contact.via === "Llamada" ? "una llamada" : "WhatsApp"}, ${contact.horario === "Cualquier hora" ? "a cualquier hora" : `en la ${contact.horario.toLowerCase()}`}.`);
    if (answers.foto === "Sí, te mando foto") lines.push("Ahorita te mando foto de mi recibo de CFE.");
    return lines.join("\n");
  }

  /* ---------- eventos ---------- */
  dlg.addEventListener("click", (e) => {
    const t = e.target.closest("button, a");
    if (!t || !dlg.contains(t)) return;
    if (t.dataset.act === "close") return close();
    if (t.dataset.act === "back") return back();
    if (t.dataset.flow) { flowKey = t.dataset.flow; answers = {}; return go(visibleSteps()[0].id); }
    if (t.dataset.via) { contact.via = t.dataset.via; dlg.querySelectorAll("[data-via]").forEach((b) => b.setAttribute("aria-pressed", String(b === t))); return; }
    if (t.dataset.hora) { contact.horario = t.dataset.hora; dlg.querySelectorAll("[data-hora]").forEach((b) => b.setAttribute("aria-pressed", String(b === t))); return; }
    if (t.dataset.val !== undefined) {
      const step = FLOWS[flowKey].steps.find((s) => s.id === current);
      if (step.multi) {
        const arr = new Set(answers[step.id] || []);
        arr.has(t.dataset.val) ? arr.delete(t.dataset.val) : arr.add(t.dataset.val);
        answers[step.id] = [...arr];
        t.setAttribute("aria-pressed", String(arr.has(t.dataset.val)));
        nextBtn.disabled = !arr.size;
      } else {
        answers[step.id] = t.dataset.val;
        dlg.querySelectorAll(".wz__opt").forEach((b) => b.setAttribute("aria-pressed", String(b === t)));
        setTimeout(() => go(nextAfter(step.id)), 180); // avanza solo
      }
      return;
    }
    if (t.dataset.act === "next") {
      if (current === "contact") {
        saveContact();
        if (!contact.nombre.trim()) {
          const inp = dlg.querySelector("#wz-nombre");
          inp.setAttribute("aria-invalid", "true");
          inp.setAttribute("aria-describedby", "wz-err");
          dlg.querySelector("#wz-err").hidden = false;
          inp.focus();
          return;
        }
        return go("summary");
      }
      return go(nextAfter(current));
    }
    if (t.id === "wz-send") { setTimeout(() => go("sent"), 300); }
  });
  function saveContact() {
    const g = (id) => dlg.querySelector(id);
    if (g("#wz-nombre")) contact.nombre = g("#wz-nombre").value;
    if (g("#wz-ciudad")) contact.ciudad = g("#wz-ciudad").value;
    if (g("#wz-nota")) contact.nota = g("#wz-nota").value;
  }
  dlg.addEventListener("input", saveContact);
  dlg.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && current === "contact" && e.target.tagName === "INPUT") { e.preventDefault(); nextBtn.click(); }
  });

  /* ---------- botones de la página que abren el asistente ---------- */
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-wizard]");
    if (!t) return;
    e.preventDefault();
    open(t.dataset.wizard || null);
  });
  window.wizard = { open };
})();
