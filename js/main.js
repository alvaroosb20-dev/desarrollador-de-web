/* ==========================================================
   Desarrollador de Web — lógica de la página
   Sin dependencias. Lee la configuración de js/config.js
   ========================================================== */
(function () {
  "use strict";

  const CFG = window.SITE_CONFIG || {};
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  document.documentElement.classList.add("js");

  /* ---------- Catálogo de planes ---------- */
  const PLANS = {
    "basica":        { name: "Web Básica",             price: "199,99 €" },
    "avanzada":      { name: "Web Avanzada",           price: "349,99 €" },
    "tienda":        { name: "Tienda Online",          price: "599,99 €" },
    "mant-basico":   { name: "Mantenimiento básico",   price: "19,99 €/mes" },
    "mant-avanzado": { name: "Mantenimiento avanzado", price: "39,99 €/mes" },
    "no-se":         { name: "Por definir (asesoramiento)", price: "Según presupuesto" }
  };

  /* ==========================================================
     1. Configuración: datos de contacto, WhatsApp, redes, avisos
     ========================================================== */
  const isFilled = (v) => typeof v === "string" && v.trim() !== "";

  function formEndpointConfigured() {
    if (CFG.formProvider === "api") return isFilled(CFG.apiEndpoint);
    if (CFG.formProvider === "formsubmit") return isFilled(CFG.formsubmitEmail);
    return isFilled(CFG.formspreeEndpoint) && /^https:\/\/formspree\.io\/f\/\w+/.test(CFG.formspreeEndpoint);
  }

  function pendingTag(label) {
    const s = document.createElement("span");
    s.className = "pending";
    s.textContent = "Pendiente: " + label;
    return s;
  }

  function applyConfig() {
    // Textos configurables
    $$("[data-config]").forEach((el) => {
      const key = el.dataset.config;
      const value = CFG[key];
      el.textContent = "";
      if (!isFilled(value)) { el.appendChild(pendingTag(el.dataset.pendingLabel || key)); return; }
      if (key === "contactEmail") {
        const a = document.createElement("a"); a.href = "mailto:" + value.trim(); a.textContent = value.trim(); el.appendChild(a);
      } else if (key === "contactPhone") {
        const a = document.createElement("a"); a.href = "tel:" + value.replace(/[^\d+]/g, ""); a.textContent = value.trim(); el.appendChild(a);
      } else {
        el.textContent = value;
      }
    });

    // WhatsApp
    const wa = (CFG.whatsappNumber || "").replace(/\D/g, "");
    if (wa.length >= 8) {
      const url = "https://wa.me/" + wa + (CFG.whatsappMessage ? "?text=" + encodeURIComponent(CFG.whatsappMessage) : "");
      $$("[data-whatsapp]").forEach((a) => { a.href = url; a.hidden = false; });
      $$(".wa-line").forEach((li) => (li.hidden = false));
    }

    // Redes sociales
    const ICONS = {
      instagram: '<path d="M12 7.3a4.7 4.7 0 1 0 0 9.4 4.7 4.7 0 0 0 0-9.4zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm6-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0zM21.9 8c-.1-1.6-.4-3-1.6-4.2S17.6 2.2 16 2.1C14.3 2 9.7 2 8 2.1c-1.6.1-3 .4-4.2 1.6S2.2 6.4 2.1 8C2 9.7 2 14.3 2.1 16c.1 1.6.4 3 1.6 4.2s2.6 1.5 4.2 1.6c1.7.1 6.3.1 8 0 1.6-.1 3-.4 4.2-1.6s1.5-2.6 1.6-4.2c.1-1.7.1-6.3 0-8zM19.8 18a3.3 3.3 0 0 1-1.8 1.8c-1.3.5-4.3.4-6 .4s-4.7.1-6-.4A3.3 3.3 0 0 1 4.2 18c-.5-1.3-.4-4.3-.4-6s-.1-4.7.4-6A3.3 3.3 0 0 1 6 4.2c1.3-.5 4.3-.4 6-.4s4.7-.1 6 .4A3.3 3.3 0 0 1 19.8 6c.5 1.3.4 4.3.4 6s.1 4.7-.4 6z"/>',
      facebook: '<path d="M14 8.5V6.8c0-.8.2-1.3 1.4-1.3H17V2.2C16.7 2.1 15.7 2 14.6 2 12.2 2 10.5 3.5 10.5 6.2v2.3H8v3.6h2.5V22H14v-9.9h2.6l.4-3.6z"/>',
      linkedin: '<path d="M6.9 21H3.2V8.9h3.7zM5 7.3a2.2 2.2 0 1 1 0-4.3 2.2 2.2 0 0 1 0 4.3zM21 21h-3.7v-5.9c0-1.4 0-3.2-2-3.2s-2.2 1.5-2.2 3.1v6H9.4V8.9h3.5v1.7c.5-.9 1.7-2 3.5-2 3.8 0 4.5 2.5 4.5 5.7z"/>',
      tiktok: '<path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-1.8-2.5V9.7a5.8 5.8 0 1 0 5 5.7V9.1a7.4 7.4 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.3-1.6z"/>'
    };
    const box = $("#socials");
    if (box) {
      const social = CFG.social || {};
      let count = 0;
      Object.keys(ICONS).forEach((k) => {
        if (isFilled(social[k])) {
          const a = document.createElement("a");
          a.href = social[k]; a.target = "_blank"; a.rel = "noopener";
          a.setAttribute("aria-label", k.charAt(0).toUpperCase() + k.slice(1));
          a.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[k] + "</svg>";
          box.appendChild(a); count++;
        }
      });
      if (!count && CFG.showSetupWarnings !== false) box.appendChild(pendingTag("enlaces a redes sociales"));
    }

    // Calendly
    if (isFilled(CFG.calendlyUrl) && /^https:\/\//.test(CFG.calendlyUrl)) {
      $("#calendly-link").href = CFG.calendlyUrl;
      $("#calendly-box").hidden = false;
    }

    // Aviso de configuración pendiente
    if (CFG.showSetupWarnings !== false) {
      const missing = [];
      if (!formEndpointConfigured()) missing.push("envío de formularios (<code>formspreeEndpoint</code> o modo <code>api</code>)");
      if (!isFilled(CFG.contactEmail)) missing.push("correo de contacto");
      if (!isFilled(CFG.contactPhone)) missing.push("teléfono");
      if (wa.length < 8) missing.push("WhatsApp");
      if (!Object.values(CFG.social || {}).some(isFilled)) missing.push("redes sociales");
      if (!isFilled(CFG.calendlyUrl)) missing.push("Calendly (opcional)");
      if (!isFilled(CFG.taxNote)) missing.push("nota de impuestos");
      missing.push("datos legales en <code>/legal</code>");
      const banner = $("#setup-banner");
      banner.innerHTML = "<strong>Configuración pendiente antes de publicar:</strong> " + missing.join(" · ") +
        ". Edita <code>js/config.js</code> (y pon <code>showSetupWarnings: false</code> al terminar).";
      banner.hidden = false;
    }
  }

  /* ==========================================================
     2. Navegación
     ========================================================== */
  function initNav() {
    const header = $(".site-header");
    const toggle = $("#menu-toggle");
    const nav = $("#main-nav");

    const setOpen = (open) => {
      nav.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    };
    toggle.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
    nav.addEventListener("click", (e) => { if (e.target.closest("a, button")) setOpen(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && nav.classList.contains("open")) { setOpen(false); toggle.focus(); } });
    window.addEventListener("resize", () => { if (window.innerWidth > 900) setOpen(false); });

    const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    $("#year").textContent = new Date().getFullYear();
  }

  /* ==========================================================
     3. Animaciones al hacer scroll
     ========================================================== */
  function initReveal() {
    const items = $$(".reveal");
    if (!("IntersectionObserver" in window)) { items.forEach((el) => el.classList.add("is-visible")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("is-visible"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach((el, i) => {
      el.style.transitionDelay = Math.min((i % 4) * 70, 210) + "ms";
      io.observe(el);
    });
  }

  /* ==========================================================
     4. Modales accesibles
     ========================================================== */
  let lastFocus = null;
  let openModalEl = null;

  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    if (openModalEl && openModalEl !== modal) closeModal(openModalEl, false);
    lastFocus = document.activeElement;
    modal.hidden = false;
    openModalEl = modal;
    document.body.classList.add("no-scroll");
    const first = modal.querySelector("input:not([type=hidden]):not(.hp), select, textarea, button:not(.modal-close)");
    setTimeout(() => first && first.focus({ preventScroll: true }), 50);
  }

  function closeModal(modal = openModalEl, restore = true) {
    if (!modal) return;
    modal.hidden = true;
    openModalEl = null;
    document.body.classList.remove("no-scroll");
    if (modal.id === "order-modal") resetOrder();
    if (modal.id === "call-modal") resetSimpleForm("call");
    if (restore && lastFocus) lastFocus.focus({ preventScroll: true });
  }

  function initModals() {
    document.addEventListener("click", (e) => {
      const opener = e.target.closest("[data-open]");
      if (opener) { e.preventDefault(); openModal(opener.dataset.open); return; }
      const planBtn = e.target.closest("[data-plan]");
      if (planBtn) { e.preventDefault(); startOrder(planBtn.dataset.plan); return; }
      if (e.target.closest("[data-close]") && openModalEl) { e.preventDefault(); closeModal(); }
    });

    document.addEventListener("keydown", (e) => {
      if (!openModalEl) return;
      if (e.key === "Escape") { closeModal(); return; }
      if (e.key === "Tab") {
        const f = $$('a[href], button:not([disabled]), input:not([disabled]):not(.hp), select, textarea, [tabindex]:not([tabindex="-1"])', openModalEl)
          .filter((el) => el.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ==========================================================
     5. Validación
     ========================================================== */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function fieldWrap(el) { return el.closest(".field"); }

  function setError(el, msg) {
    const wrap = fieldWrap(el);
    const box = wrap && wrap.querySelector(".field-error");
    if (box) box.textContent = msg || "";
    const group = el.type === "radio" ? $$(`input[name="${el.name}"]`, el.form) : [el];
    group.forEach((g) => (msg ? g.setAttribute("aria-invalid", "true") : g.removeAttribute("aria-invalid")));
    const pills = wrap && wrap.querySelector(".pills");
    if (pills) pills.classList.toggle("invalid", !!msg);
  }

  function checkField(el) {
    const v = (el.value || "").trim();
    if (el.type === "radio") {
      const checked = $$(`input[name="${el.name}"]`, el.form).some((r) => r.checked);
      return el.required && !checked ? "Selecciona una opción." : "";
    }
    if (el.type === "checkbox") return el.required && !el.checked ? "Debes aceptar la política de privacidad para continuar." : "";
    if (el.required && !v) return el.tagName === "SELECT" ? "Selecciona una opción." : "Este campo es obligatorio.";
    if (!v) return "";
    if (el.type === "email" && !EMAIL_RE.test(v)) return "Introduce un correo electrónico válido (ej.: nombre@dominio.com).";
    if (el.dataset.validate === "phone" && v.replace(/\D/g, "").length < 9) return "Introduce un teléfono válido (mínimo 9 dígitos).";
    if (el.minLength > 0 && v.length < el.minLength) return `Escribe al menos ${el.minLength} caracteres (llevas ${v.length}).`;
    if (el.type === "date" && v) {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (new Date(v + "T00:00:00") < today) return "La fecha no puede ser anterior a hoy.";
    }
    if (el.dataset.validate === "future" && new Date(v) < new Date()) return "Elige una fecha y hora futuras.";
    return "";
  }

  function validateForm(form) {
    const fields = $$("input, select, textarea", form).filter((el) => !el.classList.contains("hp") && el.type !== "submit");
    const seenRadio = new Set();
    let firstInvalid = null;
    let count = 0;
    fields.forEach((el) => {
      if (el.type === "radio") { if (seenRadio.has(el.name)) return; seenRadio.add(el.name); }
      if (el.type === "checkbox" && !el.required) return;
      const msg = checkField(el);
      setError(el, msg);
      if (msg) { count++; if (!firstInvalid) firstInvalid = el; }
    });
    if (firstInvalid) firstInvalid.focus();
    return count;
  }

  function liveValidation(form) {
    form.addEventListener("input", (e) => {
      const el = e.target;
      if (el.getAttribute("aria-invalid") === "true" || (el.type === "radio" || el.type === "checkbox")) setError(el, checkField(el));
    });
    form.addEventListener("change", (e) => {
      const el = e.target;
      if (el.getAttribute("aria-invalid") === "true" || el.type === "radio" || el.type === "checkbox") setError(el, checkField(el));
    });
    form.addEventListener("focusout", (e) => {
      const el = e.target;
      if (el.matches("input:not([type=radio]):not([type=checkbox]):not(.hp), textarea, select") && el.value.trim()) setError(el, checkField(el));
    });
  }

  /* ==========================================================
     6. Envío real de formularios
     ========================================================== */
  function collect(form) {
    const fd = new FormData(form);
    const data = {};
    for (const [k, v] of fd.entries()) {
      if (k === "website") continue;
      const val = typeof v === "string" ? v.trim() : v;
      if (data[k] !== undefined) data[k] = [].concat(data[k], val);
      else data[k] = val;
    }
    Object.keys(data).forEach((k) => { if (Array.isArray(data[k])) data[k] = data[k].join(", "); });
    data._honeypot = (form.querySelector('input[name="website"]') || {}).value || "";
    return data;
  }

  async function sendData(payload) {
    if (payload._honeypot) return { ok: true }; // bot: no se envía nada
    delete payload._honeypot;

    if (!formEndpointConfigured()) {
      throw new Error("El envío de formularios aún no está configurado en esta web (falta el servicio de formularios en js/config.js). Tu solicitud NO se ha enviado. Escríbenos por correo o teléfono mientras tanto.");
    }

    const url = CFG.formProvider === "api" ? CFG.apiEndpoint
      : CFG.formProvider === "formsubmit" ? "https://formsubmit.co/ajax/" + encodeURIComponent(CFG.formsubmitEmail.trim())
      : CFG.formspreeEndpoint;
    const body = Object.assign({}, payload, { _subject: payload._subject || "Nueva solicitud desde la web", pagina: location.href });
    if (CFG.formProvider === "formsubmit") {
      body._template = "table";
      body._captcha = "false";
      if (payload.email) body._replyto = payload.email;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    let res;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal
      });
    } catch (err) {
      throw new Error(err.name === "AbortError"
        ? "El servidor ha tardado demasiado en responder. Tu solicitud no se ha enviado; inténtalo de nuevo."
        : "No se ha podido conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.");
    } finally { clearTimeout(timer); }

    let json = {};
    try { json = await res.json(); } catch (_) { /* respuesta sin JSON */ }
    if (!res.ok || json.ok === false || json.success === "false" || json.success === false) {
      const msg = (json.errors && json.errors.map((e) => e.message).join(" ")) || json.error || json.message;
      throw new Error((msg ? msg + " " : "") + "La solicitud no se ha enviado. Inténtalo de nuevo en unos minutos.");
    }
    return json;
  }

  function setStatus(box, type, msg) {
    if (!box) return;
    box.className = "form-status" + (type ? " is-" + type : "");
    box.textContent = msg || "";
  }

  function setBusy(btn, busy, labelBusy) {
    if (!btn) return;
    if (busy) { btn.dataset.label = btn.textContent; btn.textContent = labelBusy || "Enviando…"; btn.disabled = true; }
    else { btn.textContent = btn.dataset.label || btn.textContent; btn.disabled = false; }
  }

  /* ==========================================================
     7. Contratación (formulario → revisión → envío)
     ========================================================== */
  const order = {};

  function updatePlanBox() {
    const plan = PLANS[order.select.value];
    order.planBox.hidden = !plan;
    if (plan) { order.planName.textContent = plan.name; order.planPrice.textContent = plan.price; }
  }

  function setStep(n) {
    order.form.hidden = n !== 1;
    order.review.hidden = n !== 2;
    order.done.hidden = n !== 3;
    $$(".progress li", order.modal).forEach((li, i) => {
      li.classList.toggle("is-active", i === n - 1);
      li.classList.toggle("is-done", i < n - 1);
    });
    order.modal.querySelector(".modal-panel").scrollTop = 0;
  }

  function startOrder(planId) {
    resetOrder();
    if (planId && PLANS[planId]) order.select.value = planId;
    updatePlanBox();
    openModal("order-modal");
  }

  function resetOrder() {
    if (!order.form) return;
    if (!order.done.hidden) order.form.reset(); // tras un envío correcto, empezamos de cero
    setStep(1);
    order.alert.hidden = true;
    setStatus($(".form-status", order.review), "", "");
    updatePlanBox();
  }

  const LABELS = {
    plan: "Plan elegido", nombre: "Nombre y apellidos", empresa: "Empresa o negocio", email: "Correo electrónico",
    telefono: "Teléfono", sector: "Sector", tipo_web: "Tipo de web", objetivo: "Objetivo principal",
    dominio: "¿Tiene dominio?", logo_imagenes: "Logotipo e imágenes", funcionalidades: "Funcionalidades",
    presupuesto: "Presupuesto aproximado", fecha_entrega: "Fecha deseada", descripcion: "Descripción", privacidad: "Política de privacidad"
  };

  function formatDate(v) {
    if (!v) return v;
    const d = new Date(v.length === 10 ? v + "T00:00:00" : v);
    if (isNaN(d)) return v;
    const opts = v.length === 10 ? { dateStyle: "long" } : { dateStyle: "long", timeStyle: "short" };
    return new Intl.DateTimeFormat("es-ES", opts).format(d);
  }

  function buildSummary(data) {
    const dl = $("#order-summary");
    dl.innerHTML = "";
    const plan = PLANS[data.plan];
    Object.keys(LABELS).forEach((k) => {
      let v = data[k];
      if (k === "plan") v = plan ? `${plan.name} — ${plan.price}` : v;
      if (k === "fecha_entrega") v = v ? formatDate(v) : "";
      if (!v) v = "—";
      const dt = document.createElement("dt"); dt.textContent = LABELS[k];
      const dd = document.createElement("dd"); dd.textContent = v;
      if (k === "plan") dd.className = "sum-plan";
      dl.append(dt, dd);
    });
  }

  function initOrder() {
    order.modal = $("#order-modal");
    order.form = $("#order-form");
    order.review = $("#order-review");
    order.done = $("#order-done");
    order.alert = $(".form-alert", order.form);
    order.select = $("#o-plan");
    order.planBox = $("#selected-plan");
    order.planName = $("#selected-plan-name");
    order.planPrice = $("#selected-plan-price");

    const dateInput = $("#o-fecha");
    dateInput.min = new Date().toISOString().slice(0, 10);

    order.select.addEventListener("change", updatePlanBox);
    liveValidation(order.form);

    order.form.addEventListener("submit", (e) => {
      e.preventDefault();
      const errors = validateForm(order.form);
      if (errors) {
        order.alert.textContent = errors === 1 ? "Falta 1 dato por completar o corregir. Revisa el campo marcado en rojo." : `Faltan ${errors} datos por completar o corregir. Revisa los campos marcados en rojo.`;
        order.alert.hidden = false;
        return;
      }
      order.alert.hidden = true;
      order.data = collect(order.form);
      buildSummary(order.data);
      setStep(2);
      $("#order-send").focus({ preventScroll: true });
    });

    $("#order-edit").addEventListener("click", () => { setStep(1); order.select.focus(); });

    $("#order-send").addEventListener("click", async (e) => {
      const btn = e.currentTarget;
      const status = $(".form-status", order.review);
      const plan = PLANS[order.data.plan];
      const payload = Object.assign({}, order.data, {
        tipo_solicitud: "Contratación",
        plan: plan ? plan.name : order.data.plan,
        precio: plan ? plan.price : "",
        fecha_entrega: order.data.fecha_entrega ? formatDate(order.data.fecha_entrega) : "",
        _subject: `Nueva solicitud: ${plan ? plan.name : "plan por definir"} — ${order.data.nombre}`
      });
      setBusy(btn, true);
      $("#order-edit").disabled = true;
      setStatus(status, "info", "Enviando tu solicitud…");
      try {
        await sendData(payload);
        setStatus(status, "", "");
        setStep(3);
        order.done.focus();
      } catch (err) {
        setStatus(status, "error", err.message);
      } finally {
        setBusy(btn, false);
        $("#order-edit").disabled = false;
      }
    });
  }

  /* ==========================================================
     8. Formularios simples: llamada y contacto
     ========================================================== */
  const simple = {};

  function resetSimpleForm(key) {
    const s = simple[key];
    if (!s) return;
    if (s.done && !s.done.hidden) { s.form.reset(); s.form.hidden = false; s.done.hidden = true; }
    setStatus(s.status, "", "");
    if (s.alert) s.alert.hidden = true;
  }

  function initSimpleForm(key, formSel, doneSel, buildPayload, successMsg) {
    const form = $(formSel);
    const s = (simple[key] = {
      form,
      done: doneSel ? $(doneSel) : null,
      status: $(".form-status", form),
      alert: $(".form-alert", form)
    });
    liveValidation(form);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      setStatus(s.status, "", "");
      const errors = validateForm(form);
      if (errors) {
        const msg = errors === 1 ? "Falta 1 dato por completar o corregir." : `Faltan ${errors} datos por completar o corregir.`;
        if (s.alert) { s.alert.textContent = msg; s.alert.hidden = false; } else setStatus(s.status, "error", msg);
        return;
      }
      if (s.alert) s.alert.hidden = true;
      const btn = form.querySelector('button[type="submit"]');
      setBusy(btn, true);
      try {
        await sendData(buildPayload(collect(form)));
        if (s.done) { form.hidden = true; s.done.hidden = false; s.done.focus(); }
        else { form.reset(); setStatus(s.status, "ok", successMsg); }
      } catch (err) {
        setStatus(s.status, "error", err.message);
      } finally {
        setBusy(btn, false);
      }
    });
  }

  function initForms() {
    const callDate = $("#k-fecha");
    const now = new Date(); now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    callDate.min = now.toISOString().slice(0, 16);

    initSimpleForm("call", "#call-form", "#call-done", (d) => Object.assign({}, d, {
      tipo_solicitud: "Llamada",
      fecha_hora: formatDate(d.fecha_hora),
      _subject: `Solicitud de llamada — ${d.nombre}`
    }));

    initSimpleForm("contact", "#contact-form", null, (d) => Object.assign({}, d, {
      tipo_solicitud: "Contacto",
      _subject: `Mensaje de contacto — ${d.nombre}`
    }), "¡Mensaje enviado! Te responderemos lo antes posible.");
  }

  /* ---------- Arranque ---------- */
  applyConfig();
  initNav();
  initReveal();
  initModals();
  initOrder();
  initForms();
})();
