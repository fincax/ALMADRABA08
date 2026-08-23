# Vídeos de la galería

Deja aquí los archivos `.mp4` (H.264 + AAC, el formato que reproduce todo)
y la web los recoge en la siguiente compilación, después de las fotos.

- `salon.mp4` → su fotograma de portada opcional: `salon.jpg` aquí mismo.
- El nombre del archivo es libre; el orden es alfabético.
- Autohospedados a propósito: un vídeo de YouTube o Vimeo incrusta
  contenido de terceros y obligaría a banner de cookies y a rehacer la
  política de privacidad. Ver docs/ y README.

Peso razonable: 15–40 MB por vídeo (1080p, 30–60 s). Para comprimir:
`ffmpeg -i original.mov -c:v libx264 -crf 23 -preset slow -c:a aac -movflags +faststart salon.mp4`
