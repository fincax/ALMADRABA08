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

ok=0; fallos=0

comprobar() { # nombre, esperado, obtenido
  if [[ "$3" == *"$2"* ]]; then
    printf '  \033[32m✓\033[0m %-42s\n' "$1"
    ok=$((ok+1))
  else
    printf '  \033[31m✗\033[0m %-42s esperaba «%s», obtuvo «%s»\n' "$1" "$2" "$3"
    fallos=$((fallos+1))
  fi
}

envio() { # campos extra…
  curl -s -X POST "$API" -H "$JSON" -H "$ORIGEN" \
    -F "llegada=2027-07-03" -F "salida=2027-07-10" -F "personas=2" \
    -F "consentimiento=on" -F "_lang=es" -F "_ts=$TS" "$@"
}

echo
echo "Probando $API"
echo
echo "VALIDACIÓN"
comprobar "falta el consentimiento" 'consentimiento' \
  "$(curl -s -X POST "$API" -H "$JSON" -H "$ORIGEN" -F "nombre=Ana" -F "email=a@b.com" \
     -F "llegada=2027-07-03" -F "salida=2027-07-10" -F "personas=2" -F "_ts=$TS")"
comprobar "correo mal formado" 'email' "$(envio -F "nombre=Ana" -F "email=noesuncorreo")"
comprobar "nombre demasiado corto" 'nombre' "$(envio -F "nombre=A" -F "email=a@b.com")"
comprobar "salida anterior a la llegada" 'fechas' \
  "$(curl -s -X POST "$API" -H "$JSON" -H "$ORIGEN" -F "nombre=Ana" -F "email=a@b.com" \
     -F "llegada=2027-07-10" -F "salida=2027-07-03" -F "personas=2" \
     -F "consentimiento=on" -F "_ts=$TS")"
comprobar "número de personas imposible" 'personas' \
  "$(curl -s -X POST "$API" -H "$JSON" -H "$ORIGEN" -F "nombre=Ana" -F "email=a@b.com" \
     -F "llegada=2027-07-03" -F "salida=2027-07-10" -F "personas=99" \
     -F "consentimiento=on" -F "_ts=$TS")"

echo
echo "SEGURIDAD"
comprobar "rechaza POST de otro origen (CSRF)" 'forbidden' \
  "$(curl -s -X POST "$API" -H "$JSON" -H 'Origin: https://malo.example' \
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
  "$(curl -s -X POST "$API" -H "$JSON" -H "$ORIGEN" -F "nombre=Bot" -F "email=b@b.com" \
     -F "llegada=2027-07-03" -F "salida=2027-07-10" -F "personas=2" \
     -F "consentimiento=on" -F "_ts=$(date +%s)000")"

echo
echo "SIN JAVASCRIPT  (devuelve una página, no un JSON)"
comprobar "redirige a la portada española" '/?' \
  "$(curl -s -o /dev/null -w '%{redirect_url}' -X POST "$API" -H "$ORIGEN" \
     -F "nombre=Ana" -F "email=a@b.com" -F "llegada=2027-07-03" -F "salida=2027-07-10" \
     -F "personas=2" -F "consentimiento=on" -F "_lang=es" -F "_ts=$TS")"
comprobar "redirige a la portada inglesa" '/en/?' \
  "$(curl -s -o /dev/null -w '%{redirect_url}' -X POST "$API" -H "$ORIGEN" \
     -F "nombre=Ana" -F "email=a@b.com" -F "llegada=2027-07-03" -F "salida=2027-07-10" \
     -F "personas=2" -F "consentimiento=on" -F "_lang=en" -F "_ts=$TS")"

if [[ $CON_ENVIO -eq 1 ]]; then
  echo
  echo "ENVÍO REAL  (debe llegar un correo al buzón configurado)"
  comprobar "solicitud completa" '"ok":true' \
    "$(envio -F "nombre=Prueba de despliegue" -F "email=prueba@example.com" \
       -F "mensaje=Mensaje de prueba enviado por scripts/probar-reserva.sh")"
fi

echo
if [[ $fallos -eq 0 ]]; then
  printf '\033[32m%d pruebas superadas.\033[0m\n\n' "$ok"
else
  printf '\033[31m%d fallo(s) de %d pruebas.\033[0m\n\n' "$fallos" "$((ok+fallos))"
  exit 1
fi
