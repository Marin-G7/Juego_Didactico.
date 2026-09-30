function leerTemporal(clave, alternativa) {
  try {
    const valor = JSON.parse(sessionStorage.getItem(clave));
    return valor ?? alternativa;
  } catch (error) {
    return alternativa;
  }
}

const historialGuardado = leerTemporal("historialPartidas", []);
const historial = Array.isArray(historialGuardado)
  ? historialGuardado.filter(partida => partida && typeof partida === "object") : [];
let ultimaPartida = leerTemporal("ultimaPartida", null);
if (!ultimaPartida || typeof ultimaPartida.palabra !== "string") ultimaPartida = null;
const modoDuelo = sessionStorage.getItem("modoJuego") === "duelo";
const nombresGuardados = leerTemporal("nombresJugadores", ["Jugador 1", "Jugador 2"]);
const nombres = Array.isArray(nombresGuardados) ? nombresGuardados.slice(0, 2) : ["Jugador 1", "Jugador 2"];
while (nombres.length < 2) nombres.push(`Jugador ${nombres.length + 1}`);
const puntosGuardados = leerTemporal("puntuacionJugadores", [0, 0]);
const puntosDuelo = Array.isArray(puntosGuardados) ? puntosGuardados.map(p => Number(p) || 0).slice(0, 2) : [0, 0];
while (puntosDuelo.length < 2) puntosDuelo.push(0);

function mostrarReaccion(nombreArchivo, descripcion) {
  const gato = document.getElementById("gato");
  gato.src = `../assets/gato/${nombreArchivo}`;
  gato.alt = descripcion;
  gato.classList.remove("animar-reaccion");
  void gato.offsetWidth;
  gato.classList.add("animar-reaccion");
}

function mostrarResultado() {
  document.getElementById("palabra-final").textContent = ultimaPartida?.palabra || "Aún sin jugar";
  document.getElementById("categoria-final").textContent = ultimaPartida?.categoria || "-";
  document.getElementById("definicion-palabra").textContent = ultimaPartida?.definicion ||
    "Juega una partida para descubrir la definición de una palabra.";

  const tarjeta = document.getElementById("tarjeta-resultado");
  const titulo = document.getElementById("titulo-resultado");
  const mensaje = document.getElementById("mensaje-gato");
  if (!ultimaPartida) {
    tarjeta.classList.remove("perdio");
    titulo.textContent = "¡Empecemos a jugar!";
    mensaje.textContent = "El gato está esperando una palabra para reaccionar.";
    mostrarReaccion("normal.png", "Gato negro curioso y listo para jugar");
    return;
  }

  if (ultimaPartida.gano) {
    tarjeta.classList.remove("perdio");
    titulo.textContent = "¡Victoria!";
    mensaje.textContent = `${ultimaPartida.jugador || "Tú"} resolvió la palabra y obtuvo ${ultimaPartida.puntos || 0} puntos.`;
    mostrarReaccion("orgulloso.png", "Gato negro orgulloso por la victoria");
  } else {
    tarjeta.classList.add("perdio");
    titulo.textContent = "¡Derrota dramática!";
    mensaje.textContent = `La palabra era ${ultimaPartida.palabra}. El gato ya está planeando la revancha.`;
    mostrarReaccion("derrota.png", "Gato negro derrotado de forma cómica");
  }
}

function mostrarEstadisticas() {
  const ganadas = historial.filter(partida => partida.gano === true).length;
  const perdidas = historial.length - ganadas;
  const porcentaje = historial.length ? Math.round(ganadas / historial.length * 100) : 0;
  const puntos = historial.reduce((total, partida) => total + (Number(partida.puntos) || 0), 0);

  document.getElementById("stat-jugadas").textContent = historial.length;
  document.getElementById("stat-ganadas").textContent = ganadas;
  document.getElementById("stat-perdidas").textContent = perdidas;
  document.getElementById("stat-puntos").textContent = puntos;
  const barra = document.getElementById("barra-progreso");
  barra.style.width = `${porcentaje}%`;
  barra.textContent = `${porcentaje}%`;
  barra.setAttribute("aria-valuenow", porcentaje);
}

function mostrarMarcadorDuelo() {
  const bloque = document.getElementById("marcador-duelo");
  if (!modoDuelo) return;
  bloque.classList.remove("oculto");
  document.querySelector(".tarjeta-resultado .boton-verde")?.classList.add("oculto");
  const lista = document.getElementById("marcador-jugadores");
  lista.replaceChildren();
  nombres.slice(0, 2).forEach(function (nombre, indice) {
    const item = document.createElement("li");
    item.className = "fila-marcador";
    const jugador = document.createElement("span");
    jugador.textContent = nombre || `Jugador ${indice + 1}`;
    const puntos = document.createElement("strong");
    puntos.textContent = `${puntosDuelo[indice] || 0} pts`;
    item.append(jugador, puntos);
    lista.appendChild(item);
  });
  if (ultimaPartida) {
    const boton = document.getElementById("btn-pasar-turno");
    boton.classList.remove("oculto");
    boton.addEventListener("click", function () {
      const jugadorAnterior = Number.isInteger(ultimaPartida.jugadorIndice) ? ultimaPartida.jugadorIndice : Math.max(0, nombres.indexOf(ultimaPartida.jugador));
      sessionStorage.setItem("indiceJugadorActual", String((jugadorAnterior + 1) % 2));
      window.location.href = "../juego/juego.html";
    });
  }
}

function mostrarHistorial() {
  const lista = document.getElementById("historial-partidas");
  lista.replaceChildren();
  if (historial.length === 0) {
    const item = document.createElement("li");
    item.textContent = "Todavía no hay partidas. ¡Elige una categoría y empieza!";
    lista.appendChild(item);
    return;
  }

  historial.slice(-10).reverse().forEach(function (partida) {
    const item = document.createElement("li");
    const texto = document.createElement("span");
    const detalleJugador = modoDuelo ? `${partida.jugador || "Jugador"}: ` : "";
    texto.textContent = `${detalleJugador}${partida.palabra || "Palabra"} · ${partida.categoria || "Categoría"}`;
    const marca = document.createElement("span");
    marca.textContent = partida.gano ? `Ganada · ${partida.puntos || 0} pts` : "Perdida";
    marca.className = partida.gano ? "marca-gano" : "marca-perdio";
    item.append(texto, marca);
    lista.appendChild(item);
  });
}

function activarNuevaSesion() {
  document.getElementById("btn-nueva-sesion").addEventListener("click", function () {
    if (window.confirm("¿Borramos el marcador y el historial de esta sesión?")) {
      sessionStorage.clear();
      window.location.reload();
    }
  });
}

mostrarResultado();
mostrarEstadisticas();
mostrarMarcadorDuelo();
mostrarHistorial();
activarNuevaSesion();
