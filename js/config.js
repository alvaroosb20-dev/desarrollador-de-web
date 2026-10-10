/*
 * ============================================================
 *  CONFIGURACIÓN DE LA WEB — rellena esto antes de publicar
 * ============================================================
 *  Todo lo que esté vacío ("") se muestra en la web como
 *  «Pendiente» (o se oculta, en el caso de WhatsApp y redes)
 *  y aparece en el aviso amarillo de configuración.
 *
 *  Aquí NO va ninguna clave secreta. Las claves privadas
 *  (Resend, etc.) van como variables de entorno en el servidor.
 */
window.SITE_CONFIG = {
  businessName: "Desarrollador de Web",

  /* ---- Envío de formularios ----
   * "formspree": envía a un formulario de Formspree (sin servidor propio).
   * "api":       envía a la función /api/solicitud (Vercel + Resend).
   * "formsubmit": envía directamente al correo de formsubmitEmail (FormSubmit.co).
   *   La primera vez llega un correo de activación: pulsa «Activate Form».
   */
  formProvider: "formsubmit",
  formsubmitEmail: "webdesarrolador@gmail.com",
  formspreeEndpoint: "https://formspree.io/f/mvkzrrwl", // ej.: "https://formspree.io/f/abcdwxyz"
  apiEndpoint: "/api/solicitud",

  /* ---- Reservas ----
   * Si pones tu enlace de Calendly, el modal de llamada ofrecerá
   * reservar directamente. Si no, se solicita por formulario.
   */
  calendlyUrl: "https://calendly.com/alvaroosb20", // ej.: "https://calendly.com/tu-usuario/30min"

  /* ---- Datos de contacto (no inventar) ---- */
  contactEmail: "webdesarrolador@gmail.com",
  contactPhone: "+34 637 02 32 70",
  whatsappNumber: "34637023270",    // solo dígitos con prefijo
  whatsappMessage: "Hola, me gustaría información sobre una página web.",

  social: {
    instagram: "",
    facebook: "",
    linkedin: "",
    tiktok: ""
  },

  /* Texto sobre impuestos que se muestra bajo los precios.
   * ej.: "Precios con IGIC incluido." o "Precios sin IGIC (7 %)." */
  taxNote: "IGIC (7 %) no incluido en los precios.",

  /* Muestra el aviso amarillo con lo que falta por configurar.
   * Ponlo en false cuando todo esté listo. */
  showSetupWarnings: false
};
