#!/usr/bin/env bash
#
# Pruebas del endpoint de solicitud de reserva.
#
#   ./scripts/probar-reserva.sh                      → contra localhost:4321
#   ./scripts/probar-reserva.sh https://almadraba08.com
#
# Comprueba la validación, las defensas y las trampas antibots. Ninguna de
# estas pruebas llega a enviar un correo: todas se detienen antes, salvo que
# se pase --con-envio, que manda UNA solicitud real al buzón configurado.
#
# Pensado para pasarlo después de cada despliegue.

set -uo pipefail

BASE="${1:-http://127.0.0.1:4321}"
[[ "${1:-}" == --* ]] && BASE="http://127.0.0.1:4321"
API="$BASE/api/reserva"
ORIGEN="Origin: $BASE"
JSON="Accept: application/json"
# 30 segundos atrás: la trampa temporal rechaza lo instantáneo.
TS=$(( ($(date +%s) - 30) * 1000 ))

CON_ENVIO=0
for a in "$@"; do [[ "$a" == "--con-envio" ]] && CON_ENVIO=1; done

# IP distinta en cada ejecución para que el limitador no eche abajo la
# segunda pasada. Solo surte efecto contra un servidor local: en producción
# Nginx añade la IP real al final de la cabecera y esa es la que cuenta, así
# que esto no permite saltarse nada de verdad.
YO="203.0.113.$(( (RANDOM % 250) + 2 ))"
IP=(-H "X-Forwarded-For: $YO")

ok=0; fallos=0

comprobar() { # nombre, esperado, obtenido
  if [[ "$3" == *"$2"* ]]; then
    printf '  \033[32m✓\033[0m %-42s\n' "$1"
    ok=$((ok+1))
  else
    # Recortado: un correo entero en pantalla esconde el fallo en vez de
    # explicarlo.
    local visto="${3//$'\n'/ }"
    [[ ${#visto} -gt 120 ]] && visto="${visto:0:120}…"
    printf '  \033[31m✗\033[0m %-42s\n      esperaba: %s\n      obtuvo:   %s\n' \
      "$1" "$2" "$visto"
    fallos=$((fallos+1))
  fi
}

envio() { # campos extra…
  curl -s -X POST "$API" -H "$JSON" -H "$ORIGEN" "${IP[@]}" \
    -F "llegada=2027-07-03" -F "salida=2027-07-10" -F "personas=2" \
    -F "consentimiento=on" -F "_lang=es" -F "_ts=$TS" "$@"
}

echo
echo "Probando $API"
echo
echo "VALIDACIÓN"
comprobar "falta el consentimiento" 'consentimiento' \
  "$(curl -s -X POST "$API" -H "$JSON" -H "$ORIGEN" "${IP[@]}" -F "nombre=Ana" -F "email=a@b.com" \
     -F "llegada=2027-07-03" -F "salida=2027-07-10" -F "personas=2" -F "_ts=$TS")"
comprobar "correo mal formado" 'email' "$(envio -F "nombre=Ana" -F "email=noesuncorreo")"
comprobar "nombre demasiado corto" 'nombre' "$(envio -F "nombre=A" -F "email=a@b.com")"
comprobar "salida anterior a la llegada" 'fechas' \
  "$(curl -s -X POST "$API" -H "$JSON" -H "$ORIGEN" "${IP[@]}" -F "nombre=Ana" -F "email=a@b.com" \
     -F "llegada=2027-07-10" -F "salida=2027-07-03" -F "personas=2" \
     -F "consentimiento=on" -F "_ts=$TS")"
comprobar "número de personas imposible" 'personas' \
  "$(curl -s -X POST "$API" -H "$JSON" -H "$ORIGEN" "${IP[@]}" -F "nombre=Ana" -F "email=a@b.com" \
     -F "llegada=2027-07-03" -F "salida=2027-07-10" -F "personas=99" \
     -F "consentimiento=on" -F "_ts=$TS")"

echo
echo "SEGURIDAD"
comprobar "rechaza POST de otro origen (CSRF)" 'forbidden' \
  "$(curl -s -X POST "$API" -H "$JSON" -H 'Origin: https://malo.example' "${IP[@]}" \
     -F "nombre=Ana" -F "email=a@b.com" -F "llegada=2027-07-03" -F "salida=2027-07-10" \
     -F "personas=2" -F "consentimiento=on" -F "_ts=$TS")"
comprobar "inyección de cabeceras en el nombre" 'nombre' \
  "$(envio -F $'nombre=Ana\nBcc: victima@x.com' -F "email=a@b.com")"
comprobar "inyección de cabeceras en el correo" 'email' \
  "$(envio -F "nombre=Ana" -F $'email=a@b.com\nBcc: x@y.com')"
comprobar "GET no está permitido" '405' \
  "$(curl -s -o /dev/null -w '%{http_code}' "$API")"

echo
echo "BOTS  (responden «ok» para que no reintenten, pero no envían)"
comprobar "honeypot relleno" '"ok":true' \
  "$(envio -F "nombre=Bot" -F "email=b@b.com" -F "_gotcha=http://spam")"
comprobar "enviado al instante" '"ok":true' \
  "$(curl -s -X POST "$API" -H "$JSON" -H "$ORIGEN" "${IP[@]}" -F "nombre=Bot" -F "email=b@b.com" \
     -F "llegada=2027-07-03" -F "salida=2027-07-10" -F "personas=2" \
     -F "consentimiento=on" -F "_ts=$(date +%s)000")"

echo
echo "SIN JAVASCRIPT  (devuelve una página, no un JSON)"
# Con un envío INVÁLIDO a propósito: así se comprueba que la vuelta respeta
# el idioma sin gastar un correo. El caso de éxito va en --con-envio.
comprobar "vuelve a la portada española" '/?error=1' \
  "$(curl -s -o /dev/null -w '%{redirect_url}' -X POST "$API" -H "$ORIGEN" "${IP[@]}" \
     -F "nombre=Ana" -F "email=malformado" -F "llegada=2027-07-03" -F "salida=2027-07-10" \
     -F "personas=2" -F "consentimiento=on" -F "_lang=es" -F "_ts=$TS")"
comprobar "vuelve a la portada inglesa" '/en/?error=1' \
  "$(curl -s -o /dev/null -w '%{redirect_url}' -X POST "$API" -H "$ORIGEN" "${IP[@]}" \
     -F "nombre=Ana" -F "email=malformado" -F "llegada=2027-07-03" -F "salida=2027-07-10" \
     -F "personas=2" -F "consentimiento=on" -F "_lang=en" -F "_ts=$TS")"

if [[ $CON_ENVIO -eq 1 ]]; then
  echo
  echo "ENVÍO REAL  (debe llegar un correo al buzón configurado)"
  comprobar "solicitud completa" '"ok":true' \
    "$(envio -F "nombre=Prueba de despliegue" -F "email=prueba@example.com" \
       -F "mensaje=Mensaje de prueba enviado por scripts/probar-reserva.sh")"
  comprobar "sin JavaScript, vuelve con «enviado»" 'enviado=1' \
    "$(curl -s -o /dev/null -w '%{redirect_url}' -X POST "$API" -H "$ORIGEN" "${IP[@]}" \
       -F "nombre=Prueba sin js" -F "email=prueba@example.com" \
       -F "llegada=2027-07-03" -F "salida=2027-07-10" -F "personas=2" \
       -F "consentimiento=on" -F "_lang=es" -F "_ts=$TS")"

  # El limitador, con una IP propia para no gastar el cupo de la ejecución.
  if [[ -n "${BUZON:-}" ]]; then
    LIM="198.51.100.$(( (RANDOM % 250) + 2 ))"
    for i in 1 2 3 4 5; do
      curl -s -o /dev/null -X POST "$API" -H "$JSON" -H "$ORIGEN" \
        -H "X-Forwarded-For: $LIM" -F "nombre=Tope $i" -F "email=t@b.com" \
        -F "llegada=2027-07-03" -F "salida=2027-07-10" -F "personas=2" \
        -F "consentimiento=on" -F "_ts=$TS"
    done
    comprobar "corta al sexto envío de la misma IP" 'frecuencia' \
      "$(curl -s -X POST "$API" -H "$JSON" -H "$ORIGEN" -H "X-Forwarded-For: $LIM" \
         -F "nombre=Tope 6" -F "email=t@b.com" -F "llegada=2027-07-03" \
         -F "salida=2027-07-10" -F "personas=2" -F "consentimiento=on" -F "_ts=$TS")"
    comprobar "otra IP no queda afectada" '"ok":true' \
      "$(curl -s -X POST "$API" -H "$JSON" -H "$ORIGEN" \
         -H "X-Forwarded-For: 198.51.100.251" \
         -F "nombre=Otra" -F "email=o@b.com" -F "llegada=2027-07-03" \
         -F "salida=2027-07-10" -F "personas=2" -F "consentimiento=on" -F "_ts=$TS")"
  fi

  # Con BUZON apuntando al archivo del SMTP de pruebas se revisan además
  # las cabeceras, que es donde se decide si el correo llega o cae en spam.
  if [[ -n "${BUZON:-}" && -f "$BUZON" ]]; then
    correo="$(cat "$BUZON")"
    comprobar "remitente del propio dominio" 'From: Almadraba 8 <' "$correo"
    comprobar "responder contesta al visitante" 'Reply-To: Prueba' "$correo"
    # El asunto lleva «·», así que viaja codificado en RFC 2047 y plegado
    # en varias líneas: «=?UTF-8?Q?Solicitud_de_reserva_=C2=B7_...». Se
    # comprueba la parte que sobrevive a la codificación; el cliente de
    # correo lo muestra entero y con acentos.
    comprobar "el asunto anuncia una solicitud" 'Solicitud' "$correo"
    comprobar "el mensaje viaja en el cuerpo" 'probar-reserva.sh' "$correo"
  fi
fi

echo
if [[ $fallos -eq 0 ]]; then
  printf '\033[32m%d pruebas superadas.\033[0m\n\n' "$ok"
else
  printf '\033[31m%d fallo(s) de %d pruebas.\033[0m\n\n' "$fallos" "$((ok+fallos))"
  exit 1
fi
