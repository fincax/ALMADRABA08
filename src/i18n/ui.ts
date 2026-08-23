/** Copy de la web en ES y EN. La marca «Almadraba 8» nunca se traduce. */

export type Lang = 'es' | 'en';

export const ui = {
  es: {
    langLabel: 'ES',
    otherLang: { code: 'en', href: '/en/', label: 'EN' },
    meta: {
      title: 'Almadraba 8 · Atlanterra, Zahara de los Atunes',
      description:
        'Nuestra casa junto al mar en Atlanterra, Zahara de los Atunes. Algunas semanas al año, también puede ser la tuya. Consulta disponibilidad y solicita tu reserva.',
    },
    nav: {
      casa: 'La casa',
      zahara: 'Zahara',
      disponibilidad: 'Disponibilidad',
      cta: 'Solicita tu reserva',
      menuOpen: 'Abrir menú',
      menuClose: 'Cerrar menú',
    },
    hero: {
      claim: 'Nuestra casa junto al mar. Algunas semanas, también puede ser la tuya.',
      descriptor: 'Atlanterra · Zahara de los Atunes',
    },
    casa: {
      kicker: 'La casa',
      headline: 'Una vivienda real, entre el Atlántico y la Sierra de la Plata.',
      p1: 'Almadraba 8 no es un nombre inventado: es la dirección de nuestra casa. Vivimos en ella buena parte del otoño y del invierno, y la cuidamos como se cuida un hogar. Por eso solo la compartimos algunas semanas al año.',
      p2: 'Obra nueva en Atlanterra, con jardín privado, piscina comunitaria y la playa a unos minutos a pie.',
      photoAlt: 'El salón y el jardín de Almadraba 8',
    },
    vivienda: {
      kicker: 'La vivienda',
      stats: [
        { n: '2', d: 'Dormitorios y un baño completo' },
        { n: '40 m²', d: 'Jardín privado con porche de entrada' },
        { n: '1', d: 'Plaza de garaje privada' },
        { n: '∞', d: 'Vistas abiertas a la montaña' },
      ],
      chips: [
        'Salón-comedor',
        'Cocina contemporánea',
        'Piscina comunitaria',
        'Zonas ajardinadas',
        'Wifi y espacio de trabajo',
        'Playa a pie',
      ],
    },
    zahara: {
      kicker: 'Atlanterra · Zahara',
      headline: 'Salir descalzo al jardín y saber que el Atlántico está ahí.',
      p: 'Atlanterra es la parte tranquila de Zahara: casas bajas, pinares y la Sierra de la Plata cerrando el horizonte. Sin turismo de fiesta.',
      photos: [
        'La playa y las dunas de Atlanterra',
        'La Sierra de la Plata',
        'Un rincón de Zahara de los Atunes',
      ],
    },
    disponibilidad: {
      kicker: 'Disponibilidad',
      headline: 'Algunas semanas al año.',
      p1: 'La casa se comparte en semanas concretas de julio y agosto, en algunos puentes y en ocasiones especiales. El resto del año la habitamos nosotros.',
      p2: 'Elige tus fechas y solicita tu reserva: te respondemos personalmente y con sinceridad.',
      status: { libre: 'Libre', reservada: 'Reservada', consultar: 'Consultar' },
      request: 'Solicitar',
      restoLabel: 'Resto del año',
      restoValue: 'Nuestra casa',
      updatedPrefix: 'Actualizado el',
      empty: 'Estamos preparando el calendario de la próxima temporada — escríbenos con tus fechas.',
    },
    contacto: {
      kicker: 'Solicita tu reserva',
      headline: 'Cuéntanos quién viene y cuándo.',
      p: 'Respondemos personalmente. No hay motor de reservas ni respuestas automáticas: tu solicitud nos llega a nosotros y la confirmamos contigo.',
      form: {
        name: 'Nombre',
        email: 'Email',
        arrival: 'Llegada',
        departure: 'Salida',
        guests: 'Personas',
        message: 'Cuéntanos un poco más',
        submit: 'Enviar solicitud de reserva',
        sending: 'Enviando…',
        success: 'Gracias — hemos recibido tu solicitud y te respondemos personalmente en cuanto podamos.',
        error: 'No se ha podido enviar. Inténtalo de nuevo en un momento, por favor.',
        unconfigured: 'El formulario aún no está activo. Escríbenos por Instagram mientras lo terminamos, por favor.',
      },
    },
    footer: {
      descriptor: 'Atlanterra · Zahara de los Atunes',
      instagram: 'Instagram',
      legal: 'Aviso legal',
    },
  },

  en: {
    langLabel: 'EN',
    otherLang: { code: 'es', href: '/', label: 'ES' },
    meta: {
      title: 'Almadraba 8 · Atlanterra, Zahara de los Atunes',
      description:
        'Our home by the Atlantic in Atlanterra, Zahara de los Atunes. For a few weeks each year, it could be yours. Check availability and request your stay.',
    },
    nav: {
      casa: 'The house',
      zahara: 'Zahara',
      disponibilidad: 'Availability',
      cta: 'Request a stay',
      menuOpen: 'Open menu',
      menuClose: 'Close menu',
    },
    hero: {
      claim: 'Our home by the Atlantic. For a few weeks each year, it could be yours.',
      descriptor: 'Atlanterra · Zahara de los Atunes',
    },
    casa: {
      kicker: 'The house',
      headline: 'A real home, between the Atlantic and the Sierra de la Plata.',
      p1: 'Almadraba 8 is not an invented name: it is the address of our house. We live here for much of the autumn and winter, and we look after it the way you look after a home. That is why we only share it a few weeks a year.',
      p2: 'A newly built house in Atlanterra, with a private garden, a shared pool and the beach a few minutes away on foot.',
      photoAlt: 'The living room and garden at Almadraba 8',
    },
    vivienda: {
      kicker: 'The home',
      stats: [
        { n: '2', d: 'Bedrooms and a full bathroom' },
        { n: '40 m²', d: 'Private garden with entrance porch' },
        { n: '1', d: 'Private parking space' },
        { n: '∞', d: 'Open views of the mountains' },
      ],
      chips: [
        'Living-dining room',
        'Contemporary kitchen',
        'Shared pool',
        'Landscaped grounds',
        'Wifi and workspace',
        'Beach on foot',
      ],
    },
    zahara: {
      kicker: 'Atlanterra · Zahara',
      headline: 'Stepping barefoot into the garden, knowing the Atlantic is right there.',
      p: 'Atlanterra is the quiet side of Zahara: low houses, pine woods and the Sierra de la Plata closing the horizon. No party tourism.',
      photos: [
        'The beach and dunes of Atlanterra',
        'The Sierra de la Plata',
        'A corner of Zahara de los Atunes',
      ],
    },
    disponibilidad: {
      kicker: 'Availability',
      headline: 'A few weeks a year.',
      p1: 'The house is shared during specific weeks in July and August, on some long weekends and on special occasions. The rest of the year we live in it ourselves.',
      p2: 'Pick your dates and request your stay — we answer personally and honestly.',
      status: { libre: 'Available', reservada: 'Booked', consultar: 'Ask us' },
      request: 'Request',
      restoLabel: 'Rest of the year',
      restoValue: 'Our home',
      updatedPrefix: 'Updated',
      empty: "We are preparing next season's calendar — write to us with your dates.",
    },
    contacto: {
      kicker: 'Request a stay',
      headline: 'Tell us who is coming, and when.',
      p: 'We answer personally. There is no booking engine and no automated replies: your request reaches us directly and we confirm it with you.',
      form: {
        name: 'Name',
        email: 'Email',
        arrival: 'Arrival',
        departure: 'Departure',
        guests: 'Guests',
        message: 'Tell us a bit more',
        submit: 'Send booking request',
        sending: 'Sending…',
        success: 'Thank you — we have received your request and will reply personally as soon as we can.',
        error: 'It could not be sent. Please try again in a moment.',
        unconfigured: 'The form is not live yet. Please reach us on Instagram while we finish it.',
      },
    },
    footer: {
      descriptor: 'Atlanterra · Zahara de los Atunes',
      instagram: 'Instagram',
      legal: 'Legal notice',
    },
  },
} as const;

export type Dict = (typeof ui)['es'];
