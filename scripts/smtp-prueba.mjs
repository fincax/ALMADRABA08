/**
 * Servidor SMTP de pruebas.
 *
 *   node scripts/smtp-prueba.mjs <puerto> <buzón.txt> <cert.pem> <clave.pem>
 *
 * Habla STARTTLS y AUTH igual que el SMTP de IONOS, porque el endpoint se
 * niega a enviar sin cifrado y esa negativa forma parte de lo que hay que
 * comprobar. Vuelca cada mensaje recibido al archivo indicado para poder
 * revisar las cabeceras.
 *
 * Solo para pruebas: acepta cualquier usuario y contraseña.
 */
import { SMTPServer } from 'smtp-server';
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';

const [puerto, buzon, cert, clave] = process.argv.slice(2);
if (!puerto || !buzon || !cert || !clave) {
  console.error('uso: smtp-prueba.mjs <puerto> <buzón.txt> <cert.pem> <clave.pem>');
  process.exit(1);
}

writeFileSync(buzon, '');

const servidor = new SMTPServer({
  secure: false, // se sube a TLS con STARTTLS, como el 587 de IONOS
  key: readFileSync(clave),
  cert: readFileSync(cert),
  authOptional: false,
  onAuth(_auth, _sesion, cb) {
    cb(null, { user: 'prueba' });
  },
  onData(flujo, sesion, cb) {
    const trozos = [];
    flujo.on('data', (t) => trozos.push(t));
    flujo.on('end', () => {
      appendFileSync(
        buzon,
        '==== MENSAJE ====\n' +
          `MAIL FROM: ${sesion.envelope.mailFrom.address}\n` +
          `RCPT TO: ${sesion.envelope.rcptTo.map((r) => r.address).join(',')}\n` +
          Buffer.concat(trozos).toString('utf8') +
          '\n',
      );
      cb();
    });
  },
});

servidor.on('error', (e) => console.error('[smtp-prueba]', e.message));
servidor.listen(Number(puerto), '127.0.0.1', () => {
  console.log(`[smtp-prueba] escuchando en 127.0.0.1:${puerto}`);
});
