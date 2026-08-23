# Calendario de eventos de Zahara — revisión anual

Los eventos se anotan en `public/availability.json`, en el campo opcional
`event` de cada periodo. Aparecen bajo las fechas, en la banda de
disponibilidad, en los dos idiomas.

```json
{
  "id": "ago-2027-s1",
  "start": "2027-07-31", "end": "2027-08-07",
  "label": { "es": "Agosto · semana 1", "en": "August · week 1" },
  "status": "consultar",
  "event": {
    "es": "Eclipse solar total el 2 de agosto · más de cuatro minutos de totalidad sobre Zahara",
    "en": "Total solar eclipse on 2 August · over four minutes of totality over Zahara"
  }
}
```

No conviene anotarlo todo: si cada semana lleva un evento, ninguno destaca.
Solo lo que de verdad cambia el plan de quien viene.

---

## Qué revisar cada año, y cuándo

**Entre octubre y diciembre**, al preparar la temporada siguiente. Para
entonces suelen estar publicadas las fechas del año que viene y el
calendario laboral oficial.

### Fechas que se calculan solas

| Qué | Cómo se obtiene |
| --- | --- |
| Semana Santa | Domingo de Resurrección por el cómputo eclesiástico. **2027: 28 de marzo** (Ramos el 21). **2028: 16 de abril**. |
| Puentes | Del calendario laboral estatal y de la Junta de Andalucía, publicados en el BOE y el BOJA el otoño anterior. |
| Virgen del Carmen | Siempre el **16 de julio**. Las fiestas patronales ocupan los días previos, del 12 al 16. |

Festivos fijos que caen en martes o jueves generan puente. En **2027**, el
12 de octubre cae en martes: puente del 11 al 12.

### Fechas que hay que consultar cada año

Ninguna de estas es fija. Las de 2027 **no estaban publicadas** cuando se
escribió esto (agosto de 2026): hay que confirmarlas.

| Evento | Cuándo suele caer | Última edición conocida | Dónde mirar |
| --- | --- | --- | --- |
| **Ruta del Atún** | Mediados de mayo | 12–17 de mayo de 2026 (XVI) | `rutadelatun.com` · ACOZA |
| **Feria de Zahara** | Primera quincena de junio | — | Ayuntamiento de Barbate |
| **Fiestas patronales** | 12–16 de julio | 2025 | Ayuntamiento de Barbate |
| **Ruta del Retinto** | Primeros de octubre | 7–12 de octubre de 2026 | ACOZA |
| **Jazzahara** | Fin de octubre o primeros de noviembre | 31 oct – 2 nov de 2025 (VI) | `jazzahara.com` |

La Ruta del Atún y la Ruta del Retinto las organiza **ACOZA**, la asociación
de comerciantes de Zahara, y suele anunciar ambas a la vez.

Jazzahara cae junto al puente de Todos los Santos, así que esa semana
combina festival y festivo: merece la pena mirarla como candidata a abrir.

### Lo extraordinario

Cosas que pasan una vez y conviene tener fichadas con antelación.

| Cuándo | Qué |
| --- | --- |
| **2 de agosto de 2027** | Eclipse solar total. Zahara y Atlanterra quedan dentro de la franja de totalidad, con una duración de las más largas de la península. Es el último eclipse total visible desde España hasta 2053. |

**Sobre la duración**: las fuentes no coinciden — hay estimaciones de 4 min
15 s y de unos 4 min 25 s, y el material de la promotora dice 4 min 26 s.
La diferencia sale de qué punto exacto se toma y de qué efemérides se usan.
Por eso la web dice «más de cuatro minutos», que es cierto con cualquiera de
las tres. **No poner un número al segundo sin una fuente que se pueda
citar**: quien viaja para ver un eclipse comprueba esos datos.

---

## Procedimiento

1. Confirmar las fechas variables en las fuentes de la tabla.
2. Calcular Semana Santa y los puentes del año siguiente.
3. Decidir qué semanas se comparten y con qué estado.
4. Editar `public/availability.json`: periodos, estados y `event`.
5. Actualizar el campo `updated` con la fecha de la revisión.
6. `npm run build` y desplegar.

Cambiar solo la disponibilidad no exige compilar: se puede editar
`dist/client/availability.json` directamente en el servidor y el navegador
lo recoge al cargar. Pero hay que reflejar el mismo cambio en
`public/availability.json` del repositorio, o la siguiente compilación lo
revertirá.

---

## Fuentes

- Eclipse: [IGN](https://eclipses.ign.es/eclipse-total-sol-de-2-de-agosto-2027.html) ·
  [timeanddate](https://www.timeanddate.com/eclipse/in/@2509369?iso=20270802) ·
  [Viajes Santa Mona](https://viajessantamona.com/blog/eclipse-2027-cuanto-dura-en-cada-pueblo)
- Ruta del Atún: [rutadelatun.com](https://www.rutadelatun.com/)
- Ruta del Retinto: [Ayuntamiento de Barbate](https://www.barbate.es/noticias/1307-la-ix-ruta-del-retinto-de-zahara-de-los-atunes-del-9-al-13-de-octubre)
- Jazzahara: [jazzahara.com](https://jazzahara.com/)
- Fiestas patronales: [Turismo de Zahara](https://www.turismozahara.com/agenda)
