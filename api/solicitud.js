/*
 * Función serverless (Vercel) que recibe los formularios de la web
 * y los envía por correo mediante Resend (https://resend.com).
 *
 * Se usa solo si en js/config.js pones:  formProvider: "api"
 *
 * Variables de entorno necesarias (en Vercel → Settings → Environment Variables):
 *   RESEND_API_KEY   Clave secreta de Resend (NUNCA en el código del navegador)
 *   OWNER_EMAIL      Correo donde quieres recibir las solicitudes
 *   FROM_EMAIL       Remitente verificado en Resend, ej.: "Web <solicitudes@tudominio.es>"
 * Opcional:
 *   ALLOWED_ORIGIN   Tu dominio, ej.: "https://tudominio.es" (bloquea envíos desde otras webs)
 *   SEND_CONFIRMATION  "true" para enviar un acuse de recibo al cliente
 */

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

export default async function handler(req, res) {
  const { RESEND_API_KEY, OWNER_EMAIL, FROM_EMAIL, ALLOWED_ORIGIN, SEND_CONFIRMATION } = process.env;

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

  if (!RESEND_API_KEY || !OWNER_EMAIL || !FROM_EMAIL) {
    return res.status(500).json({ ok: false, error: "El servidor de formularios no está configurado todavía." });
  }

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { body = null; } }
  if (!body || typeof body !== "object") return res.status(400).json({ ok: false, error: "Datos no válidos." });

  // Limpiar: solo texto y longitud limitada
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

  const rows = Object.keys(LABELS)
    .filter((k) => data[k])
    .map((k) => `<tr><td style="padding:6px 12px;color:#666;vertical-align:top">${escapeHtml(LABELS[k])}</td><td style="padding:6px 12px;white-space:pre-line">${escapeHtml(data[k])}</td></tr>`)
    .join("");
  const text = Object.keys(LABELS).filter((k) => data[k]).map((k) => `${LABELS[k]}: ${data[k]}`).join("\n");
  const subject = (data._subject || `Nueva solicitud (${tipo})`).replace(/[\r\n]+/g, " ").slice(0, 200);

  const send = (payload) => fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  try {
    const r = await send({
      from: FROM_EMAIL,
      to: [OWNER_EMAIL],
      reply_to: data.email,
      subject,
      text,
      html: `<h2 style="font-family:sans-serif">${escapeHtml(subject)}</h2><table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">${rows}</table>`
    });
    if (!r.ok) {
      console.error("Resend error", r.status, await r.text());
      return res.status(502).json({ ok: false, error: "No se ha podido enviar el correo." });
    }

    if (SEND_CONFIRMATION === "true") {
      // El acuse al cliente no debe hacer fallar la solicitud si da error
      await send({
        from: FROM_EMAIL,
        to: [data.email],
        subject: "Hemos recibido tu solicitud",
        text: `Hola ${data.nombre},\n\nHemos recibido tu solicitud (${tipo}${data.plan ? ": " + data.plan : ""}). Te responderemos lo antes posible.\n\nGracias.`
      }).catch((e) => console.error("Confirmación no enviada", e));
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(502).json({ ok: false, error: "No se ha podido enviar el correo." });
  }
}
