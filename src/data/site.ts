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

  address: {
    street: 'Avenida de la Almadraba, 8',
    area: 'Atlanterra · Zahara de los Atunes',
    region: 'Cádiz, España',
  },
} as const;
