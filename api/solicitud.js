/*
 * Función serverless (Vercel) que recibe los formularios de la web
 * y los envía por correo.
 *
 * OPCIÓN 1 (recomendada) — tu propio Gmail. Variables en Vercel → Settings → Environment Variables:
 *   GMAIL_USER          webdesarrolador@gmail.com
 *   GMAIL_APP_PASSWORD  Contraseña de aplicación de Google (16 letras, NO tu contraseña normal)
 *   OWNER_EMAIL         (opcional) a dónde llegan; por defecto, GMAIL_USER
 *
 * OPCIÓN 2 — Resend:
 *   RESEND_API_KEY, OWNER_EMAIL, FROM_EMAIL
 *
 * Opcional:
 *   ALLOWED_ORIGIN     Tu dominio, ej.: "https://tudominio.es"
 *   SEND_CONFIRMATION  "true" para enviar un acuse de recibo al cliente
 *
 * Las claves viven solo en el servidor; nunca en el código del navegador.
 */
import nodemailer from "nodemailer";

const MAX_LEN = 5000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const REQUIRED = {
  "Contratación": ["plan", "nombre", "email", "telefono", "sector", "tipo_web", "objetivo", "dominio", "logo_imagenes", "presupuesto", "descripcion", "privacidad"],
  "Llamada": ["nombre", "email", "fecha_hora", "motivo", "privacidad"],
  "Contacto": ["nombre", "email", "mensaje", "privacidad"]
};

const LABELS = {
  tipo_solicitud: "Tipo de solicitud", plan: "Plan", precio: "Precio", nombre: "Nombre", empresa: "Empresa",
  email: "Correo", telefono: "Teléfono", sector: "Sector", tipo_web: "Tipo de web", objetivo: "Objetivo",
  dominio: "¿Tiene dominio?", logo_imagenes: "Logotipo e imágenes", funcionalidades: "Funcionalidades",
  presupuesto: "Presupuesto", fecha_entrega: "Fecha deseada", descripcion: "Descripción",
  fecha_hora: "Fecha y hora preferidas", motivo: "Motivo", mensaje: "Mensaje", privacidad: "Privacidad", pagina: "Enviado desde"
};

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

let gmailTransport = null;
function getGmail() {
  const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) return null;
  if (!gmailTransport) {
    gmailTransport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD.replace(/\s+/g, "") }
    });
  }
  return gmailTransport;
}

async function sendMail({ to, replyTo, subject, text, html }) {
  const gmail = getGmail();
  if (gmail) {
    await gmail.sendMail({ from: `"Web Desarrollador de Web" <${process.env.GMAIL_USER}>`, to, replyTo, subject, text, html });
    return;
  }
  const { RESEND_API_KEY, FROM_EMAIL } = process.env;
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], reply_to: replyTo, subject, text, html })
  });
  if (!r.ok) throw new Error("Resend " + r.status + ": " + (await r.text()));
}

export default async function handler(req, res) {
  const { RESEND_API_KEY, FROM_EMAIL, GMAIL_USER, ALLOWED_ORIGIN, SEND_CONFIRMATION } = process.env;
  const OWNER_EMAIL = process.env.OWNER_EMAIL || GMAIL_USER;

  if (ALLOWED_ORIGIN) {
    res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
    res.setHeader("Vary", "Origin");
  }
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept");
    return res.status(204).end();
  }
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Método no permitido." });
  if (ALLOWED_ORIGIN && req.headers.origin && req.headers.origin !== ALLOWED_ORIGIN) {
    return res.status(403).json({ ok: false, error: "Origen no permitido." });
  }

  const configured = getGmail() || (RESEND_API_KEY && FROM_EMAIL);
  if (!configured || !OWNER_EMAIL) {
    return res.status(503).json({ ok: false, code: "not_configured", error: "El envío por correo no está configurado todavía." });
  }

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = null; } }
  if (!body || typeof body !== "object") return res.status(400).json({ ok: false, error: "Datos no válidos." });

  const data = {};
  for (const [k, v] of Object.entries(body)) {
    if (typeof v !== "string" && typeof v !== "number") continue;
    data[k] = String(v).trim().slice(0, MAX_LEN);
  }

  const tipo = data.tipo_solicitud;
  const required = REQUIRED[tipo];
  if (!required) return res.status(400).json({ ok: false, error: "Tipo de solicitud no válido." });
  const missing = required.filter((k) => !data[k]);
  if (missing.length) {
    return res.status(400).json({ ok: false, error: "Faltan campos obligatorios: " + missing.map((k) => LABELS[k] || k).join(", ") + "." });
  }
  if (!EMAIL_RE.test(data.email)) return res.status(400).json({ ok: false, error: "El correo electrónico no es válido." });

  const keys = Object.keys(LABELS).filter((k) => data[k]);
  const rows = keys.map((k) => `<tr><td style="padding:8px 12px;color:#666;vertical-align:top;border-bottom:1px solid #eee">${escapeHtml(LABELS[k])}</td><td style="padding:8px 12px;white-space:pre-line;border-bottom:1px solid #eee">${escapeHtml(data[k])}</td></tr>`).join("");
  const text = keys.map((k) => `${LABELS[k]}: ${data[k]}`).join("\n");
  const subject = (data._subject || `Nueva solicitud (${tipo})`).replace(/[\r\n]+/g, " ").slice(0, 200);

  try {
    await sendMail({
      to: OWNER_EMAIL,
      replyTo: data.email,
      subject,
      text,
      html: `<h2 style="font-family:sans-serif">${escapeHtml(subject)}</h2><table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">${rows}</table><p style="font-family:sans-serif;color:#888;font-size:12px">Responde a este correo para contestar directamente al cliente.</p>`
    });
  } catch (err) {
    console.error("Error enviando correo:", err);
    return res.status(502).json({ ok: false, error: "No se ha podido enviar el correo." });
  }

  if (SEND_CONFIRMATION === "true") {
    sendMail({
      to: data.email,
      replyTo: OWNER_EMAIL,
      subject: "Hemos recibido tu solicitud",
      text: `Hola ${data.nombre},\n\nHemos recibido tu solicitud (${tipo}${data.plan ? ": " + data.plan : ""}). Te responderemos lo antes posible.\n\nGracias.`
    }).catch((e) => console.error("Acuse no enviado:", e));
  }

  return res.status(200).json({ ok: true });
}
