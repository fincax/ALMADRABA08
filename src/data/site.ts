/**
 * Configuración del sitio — lo único que hay que tocar para poner
 * la web en marcha.
 */
export const site = {
  domain: 'almadraba08.com',
  url: 'https://almadraba08.com',

  /**
   * Endpoint del formulario de solicitud de reserva.
   * Acepta cualquier servicio que reciba un POST de FormData y responda
   * JSON (Formspree, Basin, Getform, un endpoint propio…).
   * Ejemplo Formspree: 'https://formspree.io/f/XXXXXXXX'
   * Mientras esté vacío, el formulario muestra un aviso al enviar.
   */
  formEndpoint: '',

  /** Perfil de Instagram (URL completa). Vacío = el enlace del pie apunta a '#'. */
  instagram: '',

  /**
   * ⚠️ PENDIENTE — datos del titular exigidos por la LSSI (art. 10) y el
   * RGPD (art. 13). Sin ellos la página /legal/ muestra avisos visibles y
   * la web NO debe publicarse.
   */
  legal: {
    /** Nombre y apellidos o razón social del titular. */
    holder: '',
    /** NIF / CIF. */
    taxId: '',
    /** Correo de contacto para ejercer derechos. */
    email: '',
    /** Domicilio a efectos de notificaciones. */
    postal: '',
  },

  /** Fecha de la última revisión del aviso legal (se muestra en /legal/). */
  legalUpdated: '23 de agosto de 2026',

  address: {
    street: 'Avenida de la Almadraba, 8',
    area: 'Atlanterra · Zahara de los Atunes',
    region: 'Cádiz, España',
  },
} as const;
