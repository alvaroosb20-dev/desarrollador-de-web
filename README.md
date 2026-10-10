# Desarrollador de Web — guía de puesta en marcha

Web estática (HTML + CSS + JavaScript, sin dependencias) con formularios reales de contratación, llamada y contacto.

```
index.html              Página principal
css/styles.css          Estilos (colores en :root, arriba del todo)
js/config.js            ⚠️ TODA la configuración: contacto, formularios, Calendly, WhatsApp, redes
js/main.js              Lógica: menú, animaciones, modales, validación y envío
legal/*.html            Privacidad, cookies, aviso legal y condiciones (plantillas con PENDIENTES)
api/solicitud.js        Backend opcional (Vercel + Resend) para enviar los formularios por correo
assets/favicon.svg      Icono
vercel.json             Cabeceras de seguridad para Vercel
```

## Lista de pendientes antes de publicar

Mientras falte algo, la web muestra un aviso amarillo arriba y etiquetas «Pendiente» donde corresponda.

1. **Formularios** → elige la opción A o B (abajo).
2. **Datos de contacto** en `js/config.js`: `contactEmail`, `contactPhone`, `whatsappNumber` (solo dígitos con prefijo, p. ej. `34600000000`), `social`.
3. **Impuestos**: `taxNote` (en Canarias se aplica IGIC, no IVA; consulta a tu gestor si tus precios lo incluyen).
4. **Textos legales**: busca `PENDIENTE` en los 4 archivos de `legal/` y rellénalos. Conviene que los revise un profesional.
5. **Mantenimiento**: revisa que los límites de soporte de la sección «Mantenimiento» (minutos/horas, copias, plazos de respuesta) son los que quieres ofrecer.
6. Cuando todo esté listo: `showSetupWarnings: false` en `js/config.js`.

Si los formularios no están configurados, **no simulan el envío**: muestran un error claro indicando que la solicitud no se ha enviado.

## Formularios

### Configuración actual — FormSubmit (envío directo al correo)
En `js/config.js`: `formProvider: "formsubmit"` y `formsubmitEmail: "webdesarrolador@gmail.com"`.
La primera solicitud genera un correo de FormSubmit con el botón **Activate Form**; púlsalo una vez y a partir de ahí todas las solicitudes llegan a ese correo.

### Opción A — Formspree (la más rápida, sin servidor)
1. Crea una cuenta en https://formspree.io y un formulario nuevo.
2. Copia el endpoint (`https://formspree.io/f/xxxxxxx`).
3. En `js/config.js`: `formProvider: "formspree"` y `formspreeEndpoint: "https://formspree.io/f/xxxxxxx"`.
4. Envía una solicitud de prueba desde la web publicada y confirma el correo que te pide Formspree.

Las tres solicitudes (contratación, llamada y contacto) llegan al mismo formulario, con el asunto y el campo `tipo_solicitud` para distinguirlas. El correo del cliente queda como «responder a». Revisa los límites del plan gratuito de Formspree.

### Opción B — Función propia en Vercel + Resend (más control)
1. Crea una cuenta en https://resend.com, verifica tu dominio y genera una API key.
2. Sube el proyecto a Vercel (ver «Alojamiento»).
3. En Vercel → Project → Settings → Environment Variables añade:
   - `RESEND_API_KEY` = tu clave (secreta, nunca en `config.js`)
   - `OWNER_EMAIL` = correo donde recibes las solicitudes
   - `FROM_EMAIL` = `Desarrollador de Web <solicitudes@tudominio.es>` (dominio verificado en Resend)
   - Opcional: `ALLOWED_ORIGIN` = `https://tudominio.es`, `SEND_CONFIRMATION` = `true` (acuse de recibo al cliente)
4. En `js/config.js`: `formProvider: "api"`.
5. Redespliega y prueba.

La función valida los campos en el servidor, limita longitudes, escapa el HTML y tiene un campo trampa anti-spam.

## Reservas de llamadas
- **Sin Calendly** (por defecto): el cliente propone fecha y hora con el formulario y tú confirmas por correo.
- **Con Calendly**: crea un evento (p. ej. 30 min) y pega su enlace en `calendlyUrl`. El modal mostrará «Ver horarios disponibles» (se abre en Calendly) y mantiene el formulario como alternativa.
- Si prefieres tu propio sistema de reservas, puedes conectarlo más adelante en la misma función `api/solicitud.js`.

## Probar en local
Abre una terminal en la carpeta y ejecuta:
```
python3 -m http.server 8000
```
y visita http://localhost:8000. (Con la opción B, usa `npx vercel dev` para que funcione `/api/solicitud`.)

## Alojamiento
**Vercel (recomendado si usas la opción B):**
1. Sube la carpeta a un repositorio de GitHub.
2. En https://vercel.com → *Add New Project* → importa el repositorio → *Deploy* (no necesita comandos de build).

**Netlify, Cloudflare Pages o cualquier hosting estático** sirven para la opción A (Formspree). Basta con subir la carpeta tal cual.

## Dominio
1. Compra el dominio en tu registrador (DonDominio, Namecheap, IONOS…).
2. En Vercel → Settings → Domains añade `tudominio.es` y `www.tudominio.es`.
3. En el registrador crea los registros DNS que te indique Vercel (normalmente un `A` para la raíz y un `CNAME` para `www`).
4. El certificado HTTPS se genera solo. Añade después la URL al `robots.txt` y, si quieres, un `sitemap.xml`.

## Correo profesional
Para tener `hola@tudominio.es` usa Google Workspace, Zoho Mail o el correo de tu registrador, y añade los registros MX, SPF y DKIM que te indiquen. Si usas Resend, añade también sus registros DNS para poder enviar desde tu dominio.

## Pagos online (futuro)
La web no cobra nada. Si más adelante quieres cobrar anticipos online, hazlo con **Stripe Checkout desde un backend** (una función en `api/` que cree la sesión con la clave secreta en variables de entorno), nunca con claves secretas en el navegador.

## Personalizar
- Colores y tipografías: variables en `:root` de `css/styles.css`.
- Precios y nombres de plan: tarjetas en `index.html` **y** el objeto `PLANS` al inicio de `js/main.js` (deben coincidir), además de las opciones del desplegable `#o-plan`.
- Analítica: si añades Google Analytics u otra herramienta con cookies, necesitas un banner de consentimiento y actualizar la política de cookies.
