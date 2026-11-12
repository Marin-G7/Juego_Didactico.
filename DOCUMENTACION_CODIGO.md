# Documentación del código · Ahorcado Educativo

Esta guía explica cómo se organiza la aplicación y cómo viajan los datos desde que el jugador elige una modalidad hasta que ve el resultado. Está pensada para poder recorrer el proyecto en VS Code sin tener que leer todos los archivos de una vez.

## 1. Tecnologías y recorrido general

- **React** construye las pantallas y actualiza la interfaz cuando cambia el estado.
- **React Router** cambia entre páginas sin recargar todo el sitio.
- **Vite** inicia el entorno de desarrollo y genera la versión compilada.
- **Express** ofrece rutas HTTP para palabras, partidas y cuentas.
- **MongoDB Atlas** puede guardar cuentas, puntos y partidas si el backend tiene sus variables configuradas.

El recorrido principal es:

```text
Jugador → página React → GameContext → servicio API → servidor Express → MongoDB Atlas
                                  ↘ banco local de palabras (respaldo)
```

React puede usar el banco local de palabras si la solicitud al servidor falla. Las funciones de cuenta y guardado en la nube sí necesitan que el backend y Atlas estén disponibles.

## 2. Carpetas y archivos importantes

```text
index.html                     Documento inicial; carga src/main.jsx
src/main.jsx                   Monta React y los proveedores globales
src/App.jsx                    Define las rutas de la aplicación
src/components/SiteLayout.jsx  Navegación, música, mascota y dibujo del ahorcado
src/context/GameContext.jsx    Estado compartido de la partida
src/context/AuthContext.jsx    Sesión de cuenta, token y recompensas
src/pages/                     Una pantalla por sección
src/data/palabras.json         Categorías, palabras y definiciones
src/data/rewards.js            Colección y costo de recompensas
src/services/api.js            Solicitudes HTTP desde React
src/services/scoring.js        Regla de puntaje del frontend
server/src/index.js            Inicio del servidor Express
server/src/app.js              Rutas, validación y autenticación
server/src/db.js               Conexión y colecciones de MongoDB
legacy-html/                   Versión anterior en HTML, CSS y JavaScript
```

`dist/` contiene archivos generados por la compilación; `node_modules/` contiene dependencias instaladas. Normalmente no se editan a mano.

## 3. Qué hace cada página

- **`HomePage.jsx`** presenta el juego y lleva a la selección de partida.
- **`CategoriesPage.jsx`** permite escoger modo, dificultad, categoría o inicio aleatorio; en multijugador configura nombres, avatares y vidas.
- **`GamePage.jsx`** maneja las letras, los errores, las pistas, la formación de palabras y el temporizador de la ronda actual.
- **`ResultsPage.jsx`** presenta la última ronda, el marcador y el historial de la sesión.
- **`AccountPage.jsx`** permite registrarse o iniciar sesión, consultar puntos y equipar recompensas.

`App.jsx` conecta cada URL con su página. La ruta `/juego` comprueba que exista una ronda activa; si no, devuelve a la selección.

## 4. Estado compartido y flujo de una partida

`GameContext.jsx` es el estado compartido del juego. Se accede desde una página mediante el hook `useGame()`.

1. En categorías se elige una modalidad y se configura la partida.
2. `startRound()` solicita las palabras de la categoría; si la API no responde, usa `palabras.json`.
3. Filtra palabras según la dificultad y evita repetir la última palabra de esa categoría cuando hay alternativas.
4. Guarda la palabra seleccionada en `activeRound` y navega a `/juego`.
5. `GamePage.jsx` procesa las respuestas. Cuando la ronda termina, llama a `finishRound()`.
6. `finishRound()` actualiza el historial y el marcador local, intenta guardar la partida y, si hay una cuenta iniciada, solicita que se acrediten los puntos.
7. `ResultsPage.jsx` muestra el resultado y permite continuar o elegir otra categoría.

El estado de la interfaz se maneja con `useState`. `useEffect` sincroniza ciertos valores con el almacenamiento del navegador; `useCallback` y `useMemo` ayudan a reutilizar funciones y valores derivados.

## 5. Dónde se guardan los datos

- **`sessionStorage`** mantiene opciones, marcador e historial de la sesión abierta. El navegador lo separa por pestaña.
- **`localStorage`** conserva el tema visual, puntos locales por nombre y avatar, y la sesión de cuenta.
- **MongoDB Atlas** conserva las partidas y cuentas cuando `server/.env` está configurado y el servidor puede conectarse.

La clave de sesión de cuenta se guarda en el navegador para restaurarla al volver a abrir la aplicación. El servidor conserva la contraseña como hash generado con scrypt, no como texto legible. No agregues `server/.env` al repositorio ni compartas sus valores.

## 6. Comunicación entre frontend y backend

`src/services/api.js` concentra las solicitudes `fetch`. Si una respuesta HTTP no es exitosa, convierte el mensaje del servidor en un error que la página puede mostrar.

Rutas principales de `server/src/app.js`:

| Método | Ruta | Función |
|---|---|---|
| GET | `/api/health` | Estado general del servidor y de Atlas |
| GET | `/api/categorias` | Lista categorías y número de palabras |
| GET | `/api/palabras/:categoria` | Palabras de una categoría |
| POST | `/api/partidas` | Guarda el resultado de una ronda |
| GET | `/api/partidas?jugadorId=...` | Consulta partidas guardadas |
| POST | `/api/auth/registro` | Crea una cuenta |
| POST | `/api/auth/iniciar-sesion` | Inicia sesión |
| GET | `/api/auth/cuenta` | Consulta la cuenta autenticada |
| POST | `/api/auth/puntos` | Acredita una victoria una sola vez por ronda |
| POST | `/api/auth/recompensa` | Selecciona una recompensa ya desbloqueada |

`server/src/db.js` abre la conexión y obtiene las colecciones. `server/src/index.js` carga las variables de entorno, intenta conectar Atlas y luego inicia Express en el puerto 3001.

## 7. Puntos y recompensas

`calculatePoints()` en `scoring.js` asigna puntos por una victoria, los intentos restantes y, en modos con tiempo, un bono limitado. Las derrotas no suman.

La lista en `rewards.js` contiene el identificador, nombre, símbolo y costo de cada recompensa. El servidor calcula los puntos de la cuenta y guarda los identificadores de rondas premiadas para evitar duplicar el mismo premio. La cuenta devuelve las recompensas disponibles según el saldo.

## 8. Cómo iniciar el proyecto

Desde la raíz, instala dependencias si todavía no están instaladas:

```powershell
npm install
npm install --prefix server
```

Abre dos terminales en VS Code. En la primera inicia el backend:

```powershell
npm run api
```

En la segunda inicia React:

```powershell
npm run dev
```

Vite imprime la dirección local donde se abre la página. Para cuentas, guardado en la nube y puntos de cuenta, configura `MONGODB_URI` y un `AUTH_TOKEN_SECRET` de al menos 32 caracteres en `server/.env`. El archivo de ejemplo está en `server/.env.example`.

Para generar los archivos de producción:

```powershell
npm run build
```

## 9. Ruta sugerida para aprender el proyecto

1. Empieza por `src/App.jsx` y observa cómo se conectan las rutas.
2. Sigue `src/pages/CategoriesPage.jsx` hasta la llamada a `startRound()`.
3. Lee `startRound()` y `finishRound()` en `GameContext.jsx`.
4. Continúa con `GamePage.jsx` para entender cómo se procesan las respuestas.
5. Revisa `scoring.js` para seguir la fórmula de puntos.
6. Compara una función de `api.js` con la ruta equivalente de `server/src/app.js`.
7. Termina en `db.js` para ver cómo el servidor llega a MongoDB.

Así puedes seguir una función completa desde el botón en React hasta los datos guardados.
