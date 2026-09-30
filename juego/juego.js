const MAX_INTENTOS = 6;
const partesCuerpo = [
  "parte-cabeza", "parte-torso",
  "parte-brazo-izq", "parte-brazo-der",
  "parte-pierna-izq", "parte-pierna-der"
];
const reacciones = {
  normal: ["normal.png", "Gato curioso"],
  pensando: ["pensando.png", "Gato pensando"],
  acierto: ["acierto.png", "Gato sorprendido y feliz"],
  error: ["error.png", "Gato con cara de desaprobación"],
  enojado: ["enojado.png", "Gato cómicamente enojado"],
  indiferente: ["indiferente.png", "Gato indiferente"],
  orgulloso: ["orgulloso.png", "Gato orgulloso"],
  derrota: ["derrota.png", "Gato derrotado de forma cómica"]
};

let palabraActual = "";
let definicionActual = "";
let categoriaActual = "";
let letrasAdivinadas = [];
let errores = 0;
let juegoTerminado = false;
let pistaDefinicionUsada = false;
let pistaLetraUsada = false;
let modoJuego = "individual";
let indiceJugadorActual = 0;
let nombresJugadores = ["Jugador 1", "Jugador 2"];
let puntuacionesJugadores = [0, 0];

// Quitamos tildes para comparar, pero protegemos la Ñ para que no se convierta en N.
function normalizar(texto) {
  return texto.toLocaleUpperCase("es").replace(/Ñ/g, "\u0001")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\u0001/g, "Ñ");
}

function leerJSONTemporal(clave, alternativa) {
  try {
    const valor = JSON.parse(sessionStorage.getItem(clave));
    return valor ?? alternativa;
  } catch (error) {
    return alternativa;
  }
}

function leerHistorial() {
  const historial = leerJSONTemporal("historialPartidas", []);
  return Array.isArray(historial) ? historial.filter(partida => partida && typeof partida === "object") : [];
}

function mostrarReaccion(nombre, texto) {
  const imagen = reacciones[nombre] || reacciones.normal;
  const gato = document.getElementById("gato-juego");
  gato.src = `../assets/gato/${imagen[0]}`;
  gato.alt = imagen[1];
  gato.classList.remove("animar-reaccion");
  void gato.offsetWidth;
  gato.classList.add("animar-reaccion");
  document.querySelector(".mascota-juego").dataset.reaccion = nombre;
  document.getElementById("texto-gato-juego").textContent = texto;
}

function actualizarMarcadorDuelo() {
  try {
    sessionStorage.setItem("puntuacionJugadores", JSON.stringify(puntuacionesJugadores));
  } catch (error) {
    // La partida sigue aunque el navegador no pueda conservar el marcador.
  }
}

function iniciarJuego() {
  categoriaActual = localStorage.getItem("categoriaSeleccionada");
  if (!categoriaActual || !bancoPalabras[categoriaActual]) {
    window.location.href = "../categorias/categorias.html";
    return;
  }

  modoJuego = sessionStorage.getItem("modoJuego") === "duelo" ? "duelo" : "individual";
  indiceJugadorActual = Math.min(1, Math.max(0, Number(sessionStorage.getItem("indiceJugadorActual")) || 0));
  const nombresGuardados = leerJSONTemporal("nombresJugadores", ["Jugador 1", "Jugador 2"]);
  if (Array.isArray(nombresGuardados)) nombresJugadores = [nombresGuardados[0] || "Jugador 1", nombresGuardados[1] || "Jugador 2"];
  const puntosGuardados = leerJSONTemporal("puntuacionJugadores", [0, 0]);
  if (Array.isArray(puntosGuardados)) puntuacionesJugadores = puntosGuardados.map(p => Number(p) || 0).slice(0, 2);
  while (puntuacionesJugadores.length < 2) puntuacionesJugadores.push(0);

  const palabras = bancoPalabras[categoriaActual];
  let palabrasDisponibles = palabras;
  try {
    const recientes = JSON.parse(localStorage.getItem("ultimaPalabraPorCategoria")) || {};
    const anterior = recientes[categoriaActual];
    if (palabras.length > 1 && anterior) palabrasDisponibles = palabras.filter(item => item.palabra !== anterior);
  } catch (error) {
    // Si el dato guardado está dañado, se puede jugar con el banco completo.
  }
  const elegida = palabrasDisponibles[Math.floor(Math.random() * palabrasDisponibles.length)];
  try {
    const recientes = JSON.parse(localStorage.getItem("ultimaPalabraPorCategoria")) || {};
    recientes[categoriaActual] = elegida.palabra;
    localStorage.setItem("ultimaPalabraPorCategoria", JSON.stringify(recientes));
  } catch (error) {
    // El juego sigue funcionando aunque el navegador no permita guardar datos.
  }

  palabraActual = elegida.palabra;
  definicionActual = elegida.definicion;
  letrasAdivinadas = [];
  errores = 0;
  juegoTerminado = false;
  pistaDefinicionUsada = false;
  pistaLetraUsada = false;

  document.getElementById("categoria-juego").textContent = nombresCategorias[categoriaActual];
  const turno = document.getElementById("turno-actual");
  turno.classList.toggle("oculto", modoJuego !== "duelo");
  turno.textContent = modoJuego === "duelo" ? `Turno de ${nombresJugadores[indiceJugadorActual]}` : "";
  document.getElementById("btn-ver-resultado").classList.add("oculto");
  document.getElementById("btn-siguiente-turno").classList.add("oculto");
  document.getElementById("mensaje-estado").textContent = "";
  document.getElementById("definicion-pista").textContent = "Usa una pista si la necesitas; cada una cuesta intentos.";
  document.getElementById("numero-intentos").textContent = MAX_INTENTOS;
  document.getElementById("puntuacion-ronda").classList.toggle("oculto", modoJuego !== "duelo");
  if (modoJuego === "duelo") actualizarPuntosPotenciales();
  document.getElementById("btn-pista-definicion").disabled = false;
  document.getElementById("btn-pista-letra").disabled = false;
  partesCuerpo.forEach(id => document.getElementById(id).setAttribute("opacity", "0"));
  document.querySelectorAll("#teclado-letras button").forEach(function (boton) {
    boton.disabled = false;
    boton.classList.remove("correcta", "incorrecta", "revelada");
  });
  actualizarPalabraOculta();
  mostrarReaccion("pensando", "¡A ver si encuentras la palabra!");
}

function actualizarPalabraOculta() {
  const mostrado = palabraActual.split("").map(function (letra) {
    return letrasAdivinadas.includes(normalizar(letra)) ? letra : "_";
  }).join(" ");
  document.getElementById("palabra-oculta").textContent = mostrado;
}

function actualizarPuntosPotenciales() {
  const puntaje = Math.max(0, 100 + (MAX_INTENTOS - errores) * 25 + palabraActual.length * 5);
  document.getElementById("puntuacion-ronda").textContent = `Puntos posibles: ${puntaje}`;
}

function marcarError() {
  errores++;
  document.getElementById("numero-intentos").textContent = MAX_INTENTOS - errores;
  const parte = partesCuerpo[errores - 1];
  if (parte) document.getElementById(parte).setAttribute("opacity", "1");
  if (modoJuego === "duelo") actualizarPuntosPotenciales();
}

function elegirLetra(letra, boton) {
  if (juegoTerminado || boton.disabled) return;
  const letraNormalizada = normalizar(letra);
  letrasAdivinadas.push(letraNormalizada);
  boton.disabled = true;

  if (normalizar(palabraActual).includes(letraNormalizada)) {
    boton.classList.add("correcta");
    mostrarReaccion("acierto", "¡Bien! Esa letra sí estaba.");
  } else {
    boton.classList.add("incorrecta");
    marcarError();
    const reaccion = errores === 1 ? "indiferente" : errores >= 4 ? "enojado" : "error";
    const frase = errores === 1 ? "Mmm… esa no era." : errores >= 4 ? "¡El gato ya se está impacientando!" : "Uy, esa letra no estaba.";
    mostrarReaccion(reaccion, frase);
  }
  actualizarPalabraOculta();
  revisarEstadoJuego();
}

function aplicarCostoPista(costo) {
  if (juegoTerminado || errores + costo > MAX_INTENTOS) {
    document.getElementById("mensaje-estado").textContent = "No quedan suficientes intentos para esa pista.";
    return false;
  }
  for (let i = 0; i < costo; i++) marcarError();
  if (errores >= MAX_INTENTOS) {
    document.getElementById("palabra-oculta").textContent = palabraActual;
    terminarJuego(false);
    return false;
  }
  return true;
}

function usarPistaDefinicion() {
  if (pistaDefinicionUsada || !aplicarCostoPista(1)) return;
  pistaDefinicionUsada = true;
  document.getElementById("btn-pista-definicion").disabled = true;
  document.getElementById("definicion-pista").textContent = definicionActual;
  document.getElementById("mensaje-estado").textContent = "Usaste una pista: perdiste 1 intento.";
  mostrarReaccion("pensando", "¡Pista desbloqueada! El gato piensa contigo.");
}

function usarPistaLetra() {
  if (pistaLetraUsada) return;
  const letrasNuevas = [...new Set([...palabraActual].map(normalizar))]
    .filter(letra => !letrasAdivinadas.includes(letra));
  if (letrasNuevas.length === 0) return;
  if (!aplicarCostoPista(2)) return;

  const letra = letrasNuevas[Math.floor(Math.random() * letrasNuevas.length)];
  const boton = [...document.querySelectorAll("#teclado-letras button")]
    .find(elemento => normalizar(elemento.dataset.letra) === letra);
  pistaLetraUsada = true;
  document.getElementById("btn-pista-letra").disabled = true;
  if (boton) {
    boton.classList.add("revelada");
    elegirLetra(boton.dataset.letra, boton);
  }
  if (!juegoTerminado) document.getElementById("mensaje-estado").textContent = "Letra revelada; perdiste 2 intentos.";
}

function revisarEstadoJuego() {
  const palabraCompleta = normalizar(palabraActual).split("")
    .every(letra => letrasAdivinadas.includes(letra));
  if (palabraCompleta) {
    terminarJuego(true);
  } else if (errores >= MAX_INTENTOS) {
    document.getElementById("palabra-oculta").textContent = palabraActual;
    terminarJuego(false);
  }
}

function terminarJuego(gano) {
  if (juegoTerminado) return;
  juegoTerminado = true;
  const nombre = modoJuego === "duelo" ? nombresJugadores[indiceJugadorActual] : "Tú";
  document.getElementById("mensaje-estado").textContent = gano
    ? `¡${nombre} ganó la ronda! Adivinaste la palabra.`
    : `¡Casi, ${nombre}! La palabra era ${palabraActual}.`;
  document.getElementById("definicion-pista").textContent = definicionActual;
  document.querySelectorAll("#teclado-letras button").forEach(boton => { boton.disabled = true; });
  document.getElementById("btn-pista-definicion").disabled = true;
  document.getElementById("btn-pista-letra").disabled = true;
  guardarResultado(gano);
  document.getElementById("btn-ver-resultado").classList.remove("oculto");
  if (modoJuego === "duelo") document.getElementById("btn-siguiente-turno").classList.remove("oculto");
  mostrarReaccion(gano ? "orgulloso" : "derrota", gano ? "¡Una ronda espectacular!" : "El gato cayó dramáticamente… ¡siguiente turno!");
}

function guardarResultado(gano) {
  const puntos = gano ? Math.max(0, 100 + (MAX_INTENTOS - errores) * 25 + palabraActual.length * 5) : 0;
  const jugador = modoJuego === "duelo" ? nombresJugadores[indiceJugadorActual] : "Tú";
  const resultado = {
    palabra: palabraActual,
    categoria: nombresCategorias[categoriaActual],
    definicion: definicionActual,
    gano,
    jugador,
    jugadorIndice: indiceJugadorActual,
    puntos,
    errores
  };
  const historial = leerHistorial();
  historial.push(resultado);
  try {
    sessionStorage.setItem("ultimaPartida", JSON.stringify(resultado));
    sessionStorage.setItem("historialPartidas", JSON.stringify(historial));
    if (modoJuego === "duelo" && gano) {
      puntuacionesJugadores[indiceJugadorActual] += puntos;
      actualizarMarcadorDuelo();
    }
  } catch (error) {
    // La partida termina aunque el navegador no permita guardar el progreso temporal.
  }
  if (modoJuego === "duelo") actualizarPuntosPotenciales();
}

function pasarTurno() {
  if (modoJuego !== "duelo" || !juegoTerminado) return;
  sessionStorage.setItem("indiceJugadorActual", String((indiceJugadorActual + 1) % 2));
  window.location.reload();
}

function activarTeclado() {
  document.querySelectorAll("#teclado-letras button").forEach(function (boton) {
    boton.addEventListener("click", function () { elegirLetra(boton.dataset.letra, boton); });
  });
  document.getElementById("btn-pista-definicion").addEventListener("click", usarPistaDefinicion);
  document.getElementById("btn-pista-letra").addEventListener("click", usarPistaLetra);
  document.getElementById("btn-siguiente-turno").addEventListener("click", pasarTurno);
  document.addEventListener("keydown", function (evento) {
    if (evento.ctrlKey || evento.altKey || evento.metaKey || evento.repeat) return;
    const letra = evento.key.toLocaleUpperCase("es");
    const boton = [...document.querySelectorAll("#teclado-letras button")]
      .find(elemento => elemento.dataset.letra === letra);
    if (boton && !boton.disabled) {
      evento.preventDefault();
      boton.click();
    }
  });
}

activarTeclado();
iniciarJuego();
