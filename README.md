# Gatito Ahorcado · React + Node + MongoDB Atlas

Esta rama transforma el juego original en una aplicación React. Incluye diez categorías, reacciones del gato, pistas, turnos de hasta diez jugadores, contrarreloj y estilo inspirado en Japón. La copia HTML original se conserva en `legacy-html/` para que puedas consultarla mientras aprendes.

## Estructura

```text
public/                 Imágenes estáticas del gato
src/
  components/            Navegación, reacciones y dibujo
  context/               Estado compartido del juego
  data/                  Banco de palabras compartido con la API
  pages/                 Inicio, categorías, juego y resultados
  services/              Llamadas a la API y cálculo de puntos
server/
  src/app.js             Rutas de la API
  src/db.js              Conexión con MongoDB Atlas
legacy-html/             Versión HTML/CSS/JS original conservada
```

El frontend React/Vite está en la raíz del proyecto. El servidor Express corre por separado en `server/`. El recorrido de los datos es **React → API Express → MongoDB Atlas**; React nunca contiene la contraseña de Atlas.

## Ya existe tu base en Atlas

El backend está preparado para usar tu base `juego_ahorcado`. Guardará las partidas en una colección separada llamada `partidas`, dejando intacta la colección `juego` que ya creaste. MongoDB crea `partidas` automáticamente al insertar la primera partida.

## Falta el URI privado de Atlas

Ya está creado el archivo local `server/.env`, ignorado por Git. Abre ese archivo y pega el URI de Node.js que Atlas te da en **Connect → Drivers** en `MONGODB_URI`. Conserva estas opciones:

```env
PORT=3001
MONGODB_DB=juego_ahorcado
MONGODB_COLLECTION=partidas
```

No compartas el URI o la contraseña en el chat ni los subas al repositorio. Atlas también debe tener un usuario de base de datos y permitir la IP actual de tu computador en **Network Access**.

## Iniciar la aplicación

Instala dependencias (ya quedaron instaladas en este entorno):

```powershell
npm install
npm install --prefix server
```

Abre dos terminales desde la raíz del proyecto:

```powershell
npm run api
```

```powershell
npm run dev
```

Vite indicará la dirección local para abrir React. En el encabezado verás el estado de Atlas. Si dice “Modo local”, revisa el URI, el usuario y la IP permitida.

## Partes para aprender

- `src/pages/CategoriesPage.jsx`: componentes, formularios y listas con `.map()`.
- `src/context/GameContext.jsx`: estado compartido y navegación entre rondas.
- `src/pages/GamePage.jsx`: intentos, pistas, teclado y cronómetro.
- `src/pages/ResultsPage.jsx`: tabla de posiciones y separación de historiales temporal y Atlas.
- `src/services/api.js`: comunicación entre React y el servidor.
- `src/services/scoring.js`: regla de puntuación usada en el juego y los resultados.
- `src/data/palabras.json`: única fuente de palabras para React y la API.
- `server/src/app.js`: rutas y validación de los datos recibidos.
- `server/src/db.js`: conexión, base y colección de MongoDB.

El historial temporal vive en la pestaña y se borra al cerrar la sesión o usar “Borrar sesión”. Atlas conserva por separado las partidas consultables desde la sección de historial en la nube. El modo de competencia local usa nombres, no cuentas verificadas. Antes de publicar con usuarios reales, añadiremos autenticación para asociar cada partida a una cuenta validada.
