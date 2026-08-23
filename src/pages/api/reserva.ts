/**
 * Endpoint propio de solicitud de reserva.
 *
 * Recibe el formulario, lo valida en servidor y envía un correo por SMTP
 * al buzón de los propietarios. No hay terceros: el mensaje va del buzón
 * de la casa al buzón de la casa.
 *
 * Configuración por variables de entorno (nunca en el repositorio):
 *   SMTP_HOST      smtp.ionos.es
 *   SMTP_PORT      587  (STARTTLS)  |  465 (TLS directo)
 *   SMTP_USER      la dirección completa del buzón
 *   SMTP_PASS      su contraseña
 *   MAIL_FROM      remitente — debe ser una dirección del propio dominio
 *   MAIL_TO        destinatario de las solicitudes
 *
 * Sin estas variables el endpoint responde 503 y el formulario avisa al
 * visitante, en vez de fingir que ha enviado algo.
 */
import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

export const prerender = false;

/* ── Configuración ─────────────────────────────────────────────────────── */

const env = (k: string) => (process.env[k] ?? '').trim();

const SMTP_HOST = env('SMTP_HOST');
const SMTP_PORT = Number(env('SMTP_PORT') || 587);
const SMTP_USER = env('SMTP_USER');
const SMTP_PASS = env('SMTP_PASS');
const MAIL_FROM = env('MAIL_FROM') || SMTP_USER;
const MAIL_TO = env('MAIL_TO') || SMTP_USER;
const configurado = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS && MAIL_TO);

/** Cuerpo máximo admitido. Un formulario legítimo no llega a 8 KB. */
const MAX_BYTES = 16 * 1024;
/** Ventana del limitador por IP. */
const VENTANA_MS = 60 * 60 * 1000;
/** Correos efectivamente enviados por IP y hora. */
const MAX_ENVIOS = 5;
/** Peticiones totales por IP y hora, válidas o no. */
const MAX_INTENTOS = 30;
/** Un humano tarda más de esto en rellenar el formulario. */
const MIN_SEGUNDOS = 3;

/* ── Limitador de frecuencia ───────────────────────────────────────────────
   Dos contadores separados, y la distinción importa: si se contaran los
   intentos fallidos como envíos, a quien se le resistiera el formulario
   —una fecha mal puesta, un correo con errata— se le cerraría la puerta
   durante una hora. Los intentos llevan un tope alto, solo para que nadie
   martillee el endpoint; los envíos, uno bajo, que es lo que protege el
   buzón de verdad.

   En memoria y por proceso: se reinicia con el servicio. Basta para frenar
   a una IP suelta; no pretende parar un ataque distribuido. */
const intentos = new Map<string, number[]>();
const envios = new Map<string, number[]>();

function recientes(mapa: Map<string, number[]>, ip: string): number[] {
  const ahora = Date.now();
  const previos = (mapa.get(ip) ?? []).filter((t) => ahora - t < VENTANA_MS);
  mapa.set(ip, previos);
  // Poda perezosa para que el mapa no crezca sin límite.
  if (mapa.size > 5000) {
    for (const [k, v] of mapa) {
      if (v.every((t) => ahora - t >= VENTANA_MS)) mapa.delete(k);
    }
  }
  return previos;
}

/** Cuenta una petición y dice si esa IP ya ha hecho demasiadas. */
function demasiadosIntentos(ip: string): boolean {
  const previos = recientes(intentos, ip);
  if (previos.length >= MAX_INTENTOS) return true;
  previos.push(Date.now());
  return false;
}

/** Solo mira; se anota al enviar de verdad. */
function demasiadosEnvios(ip: string): boolean {
  return recientes(envios, ip).length >= MAX_ENVIOS;
}

function anotarEnvio(ip: string): void {
  recientes(envios, ip).push(Date.now());
}

/* ── Validación ────────────────────────────────────────────────────────── */

/** Salto de línea en una cabecera = inyección de cabeceras SMTP. */
const conSaltos = (s: string) => /[\r\n]/.test(s);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const FECHA = /^\d{4}-\d{2}-\d{2}$/;

interface Solicitud {
  nombre: string;
  email: string;
  llegada: string;
  salida: string;
  personas: number;
  mensaje: string;
  lang: string;
}

function validar(f: FormData): { ok: true; datos: Solicitud } | { ok: false; motivo: string } {
  const g = (k: string) => String(f.get(k) ?? '').trim();

  // Honeypot: si viene relleno es un bot. Se descarta en silencio.
  if (g('_gotcha')) return { ok: false, motivo: 'bot' };

  // Trampa temporal: enviado demasiado rápido para haberlo escrito.
  const abierto = Number(g('_ts'));
  if (abierto && (Date.now() - abierto) / 1000 < MIN_SEGUNDOS) {
    return { ok: false, motivo: 'bot' };
  }

  if (g('consentimiento') !== 'on') return { ok: false, motivo: 'consentimiento' };

  const nombre = g('nombre');
  if (nombre.length < 2 || nombre.length > 100 || conSaltos(nombre)) {
    return { ok: false, motivo: 'nombre' };
  }

  const email = g('email');
  if (!EMAIL.test(email) || email.length > 254 || conSaltos(email)) {
    return { ok: false, motivo: 'email' };
  }

  const llegada = g('llegada');
  const salida = g('salida');
  if (!FECHA.test(llegada) || !FECHA.test(salida) || salida <= llegada) {
    return { ok: false, motivo: 'fechas' };
  }

  const personas = Number(g('personas'));
  if (!Number.isInteger(personas) || personas < 1 || personas > 6) {
    return { ok: false, motivo: 'personas' };
  }

  const mensaje = g('mensaje').slice(0, 2000);
  const lang = g('_lang') === 'en' ? 'en' : 'es';

  return { ok: true, datos: { nombre, email, llegada, salida, personas, mensaje, lang } };
}

/* ── Correo ────────────────────────────────────────────────────────────── */

const escapar = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );

function componer(d: Solicitud) {
  const filas: [string, string][] = [
    ['Nombre', d.nombre],
    ['Email', d.email],
    ['Llegada', d.llegada],
    ['Salida', d.salida],
    ['Personas', String(d.personas)],
    ['Idioma', d.lang === 'es' ? 'Español' : 'Inglés'],
  ];

  const texto =
    filas.map(([k, v]) => `${k}: ${v}`).join('\n') +
    (d.mensaje ? `\n\nMensaje:\n${d.mensaje}` : '') +
    `\n\n— Enviado desde el formulario de almadraba08.com`;

  const html =
    `<table style="border-collapse:collapse;font-family:system-ui,sans-serif;font-size:14px">` +
    filas
      .map(
        ([k, v]) =>
          `<tr><td style="padding:4px 16px 4px 0;color:#716A5C">${escapar(k)}</td>` +
          `<td style="padding:4px 0"><strong>${escapar(v)}</strong></td></tr>`,
      )
      .join('') +
    `</table>` +
    (d.mensaje
      ? `<p style="font-family:system-ui,sans-serif;font-size:14px;white-space:pre-wrap;` +
        `border-left:2px solid #15747F;padding-left:12px;margin-top:20px">${escapar(d.mensaje)}</p>`
      : '') +
    `<p style="font-family:system-ui,sans-serif;font-size:12px;color:#716A5C;margin-top:24px">` +
    `Enviado desde el formulario de almadraba08.com</p>`;

  return { texto, html };
}

let transporte: nodemailer.Transporter | null = null;
function obtenerTransporte() {
  if (!transporte) {
    transporte = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      // 465 va cifrado desde el saludo; 587 empieza en claro y sube a TLS.
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
      requireTLS: SMTP_PORT !== 465,
    });
  }
  return transporte;
}

/* ── Ruta ──────────────────────────────────────────────────────────────── */

const json = (estado: number, cuerpo: Record<string, unknown>) =>
  new Response(JSON.stringify(cuerpo), {
    status: estado,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const quiereJson = (request.headers.get('accept') ?? '').includes('application/json');

  // Sin JavaScript el navegador envía el formulario a pelo y espera una
  // página, no un JSON. Hay que devolverlo a la portada de SU idioma: el
  // campo `_lang` viaja en el formulario justamente para esto. Se lee aquí
  // y no dentro de validar() porque la redirección tiene que funcionar
  // también cuando la validación falla.
  let portada = '/';
  const responder = (estado: number, ok: boolean, motivo?: string) => {
    if (quiereJson) return json(estado, ok ? { ok } : { ok, motivo });
    const destino = `${portada}?${ok ? 'enviado' : 'error'}=1#contacto`;
    return new Response(null, { status: 303, headers: { location: destino } });
  };

  if (!configurado) {
    console.error('[reserva] faltan variables SMTP: el envío está desactivado');
    return responder(503, false, 'sin-configurar');
  }

  const tam = Number(request.headers.get('content-length') ?? 0);
  if (tam > MAX_BYTES) return responder(413, false, 'tamano');

  const ip = clientAddress || 'desconocida';
  if (demasiadosIntentos(ip) || demasiadosEnvios(ip)) {
    return responder(429, false, 'frecuencia');
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return responder(400, false, 'formato');
  }
  if (String(form.get('_lang') ?? '') === 'en') portada = '/en/';

  const v = validar(form);
  if (!v.ok) {
    // A los bots se les responde éxito: si ven un error, reintentan.
    if (v.motivo === 'bot') return responder(200, true);
    return responder(400, false, v.motivo);
  }

  const { datos } = v;
  const { texto, html } = componer(datos);

  try {
    await obtenerTransporte().sendMail({
      // El remitente es siempre nuestro: poner aquí la dirección del
      // visitante rompería SPF y DKIM y el correo acabaría en spam.
      from: { name: 'Almadraba 8', address: MAIL_FROM },
      to: MAIL_TO,
      // Así, al dar a «Responder», se contesta al visitante.
      replyTo: { name: datos.nombre, address: datos.email },
      subject: `Solicitud de reserva · ${datos.nombre} · ${datos.llegada} → ${datos.salida}`,
      text: texto,
      html,
    });
  } catch (err) {
    console.error('[reserva] fallo al enviar:', err);
    return responder(502, false, 'envio');
  }

  anotarEnvio(ip);
  return responder(200, true);
};

/** Cualquier otro método no tiene sentido aquí. */
export const ALL: APIRoute = () =>
  new Response(null, { status: 405, headers: { allow: 'POST' } });
