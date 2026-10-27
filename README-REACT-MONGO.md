# Gatito Ahorcado: React + Node + MongoDB Atlas

Esta rama migra el juego de HTML/CSS/JavaScript a React. Se conservaron las siete categorías, el banco ampliado de palabras, las reacciones del gato, las pistas con costo, los turnos de 2 a 10 personas, el modo contrarreloj y el diseño de inspiración japonesa. El ZIP recibido era una versión anterior y no incluía el banco ni las imágenes nuevas, por eso se usaron los recursos que ya estaban en el repositorio local.

## Estructura

- `client/`: interfaz React con Vite y rutas para Inicio, Categorías, Juego y Resultados.
- `server/`: API Node/Express y conexión con MongoDB usando el driver oficial.
- `server/src/data/palabras.json`: copia de los datos para que la API pueda responder aun antes de configurar Atlas.
- `client/public/assets/gato/`: reacciones del gato.

La conexión sigue este recorrido: navegador React → API Express → MongoDB Atlas. La clave de Atlas nunca se coloca en React.

## Configurar Atlas (tu parte manual)

1. Entra a [MongoDB Atlas](https://cloud.mongodb.com/) y crea una cuenta si aún no tienes.
2. Crea un proyecto y despliega un clúster gratuito para pruebas.
3. En **Database Access**, crea un usuario de base de datos y guarda su contraseña en un lugar seguro. Este usuario es distinto de tu cuenta para entrar a Atlas.
4. En **Network Access**, agrega la IP pública de tu computador para desarrollo. Evita permitir todas las IP (`0.0.0.0/0`) mientras aprendes.
5. En tu clúster, pulsa **Connect**, elige **Drivers** y copia el URI de Node.js. Reemplaza la contraseña de muestra por la del usuario de base de datos. Si tu contraseña tiene símbolos reservados, Atlas requiere codificarlos en el URI.
6. En PowerShell, desde la raíz del repositorio, copia el archivo de ejemplo:

   ```powershell
   Copy-Item server/.env.example server/.env
   ```

7. Abre `server/.env` y reemplaza `MONGODB_URI` por el URI que copiaste. Conserva `MONGODB_DB=ahorcado_educativo`. No pegues la contraseña aquí en el chat ni guardes `server/.env` en Git.
8. Instala las dependencias del servidor con `npm install --prefix server`. Debe indicar que se conectó a MongoDB y escuchar en el puerto 3001 cuando ejecutes `npm run api`.
9. Instala las dependencias del cliente con `npm install --prefix client`. En una terminal ejecuta `npm run api`; en otra, `npm run dev`. Abre la dirección local que Vite indique.

La base y la colección `partidas` se crean al guardar la primera partida; no hace falta crearlas manualmente. La primera colección sólo guarda resultados del juego. El banco de palabras sigue siendo un archivo de datos en el proyecto por ahora.

## Para aprender React en esta migración

- `client/src/context/GameContext.jsx`: estado compartido del juego y turnos.
- `client/src/pages/CategoriesPage.jsx`: formularios, selección de modos y listas renderizadas con `.map()`.
- `client/src/pages/GamePage.jsx`: estado de letras, intentos, pistas y temporizador.
- `server/src/app.js`: rutas HTTP y validación antes de guardar o consultar datos.
- `server/src/db.js`: apertura y cierre de la conexión a Atlas.

Los resultados del navegador siguen disponibles en `sessionStorage` durante la pestaña; al conectar Atlas se guardan además en MongoDB. Los nombres de la competencia local no son cuentas ni autenticación. Antes de publicar el juego para usuarios reales, habrá que añadir inicio de sesión y asociar cada partida a una cuenta validada por el servidor.

