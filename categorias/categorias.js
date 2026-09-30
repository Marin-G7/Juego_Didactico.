function leerDatosTemporales(clave, alternativa) {
  try {
    const guardado = JSON.parse(sessionStorage.getItem(clave));
    return guardado ?? alternativa;
  } catch (error) {
    return alternativa;
  }
}

function modoActual() {
  return sessionStorage.getItem("modoJuego") === "duelo" ? "duelo" : "individual";
}

function mostrarModo(modo) {
  const modoAnterior = modoActual();
  sessionStorage.setItem("modoJuego", modo);
  if (modo === "duelo" && modoAnterior !== "duelo") {
    sessionStorage.setItem("indiceJugadorActual", "0");
    sessionStorage.setItem("puntuacionJugadores", JSON.stringify([0, 0]));
  }
  document.querySelectorAll("[data-modo]").forEach(function (boton) {
    const seleccionado = boton.dataset.modo === modo;
    boton.classList.toggle("seleccionado", seleccionado);
    boton.setAttribute("aria-pressed", String(seleccionado));
  });
  document.getElementById("nombres-duelo").classList.toggle("oculto", modo !== "duelo");
  mostrarMarcador();
}

function activarModos() {
  document.querySelectorAll("[data-modo]").forEach(function (boton) {
    boton.addEventListener("click", function () {
      mostrarModo(boton.dataset.modo);
    });
  });

  const nombresGuardados = leerDatosTemporales("nombresJugadores", ["Jugador 1", "Jugador 2"]);
  const nombres = Array.isArray(nombresGuardados) ? nombresGuardados : ["Jugador 1", "Jugador 2"];
  document.getElementById("nombre-jugador-1").value = nombres[0] || "";
  document.getElementById("nombre-jugador-2").value = nombres[1] || "";
  mostrarModo(modoActual());
}

function guardarPreparacionPartida() {
  const modo = modoActual();
  sessionStorage.setItem("modoJuego", modo);
  if (sessionStorage.getItem("indiceJugadorActual") === null) sessionStorage.setItem("indiceJugadorActual", "0");

  if (modo === "duelo") {
    const nombres = [
      document.getElementById("nombre-jugador-1").value.trim() || "Jugador 1",
      document.getElementById("nombre-jugador-2").value.trim() || "Jugador 2"
    ];
    if (nombres[0].toLocaleLowerCase() === nombres[1].toLocaleLowerCase()) nombres[1] = `${nombres[1]} 2`;
    sessionStorage.setItem("nombresJugadores", JSON.stringify(nombres));
    const marcador = leerDatosTemporales("puntuacionJugadores", null);
    if (!Array.isArray(marcador)) sessionStorage.setItem("puntuacionJugadores", JSON.stringify([0, 0]));
  }
}

function activarTarjetas() {
  document.querySelectorAll(".tarjeta-categoria").forEach(function (tarjeta) {
    tarjeta.addEventListener("click", function () {
      const idCategoria = tarjeta.dataset.categoria;
      if (!bancoPalabras[idCategoria]) return;
      guardarPreparacionPartida();
      localStorage.setItem("categoriaSeleccionada", idCategoria);
      window.location.href = "../juego/juego.html";
    });
  });
}

function mostrarCantidadPalabras() {
  document.querySelectorAll(".tarjeta-categoria").forEach(function (tarjeta) {
    const categoria = tarjeta.dataset.categoria;
    const cantidad = bancoPalabras[categoria]?.length || 0;
    tarjeta.querySelector("[data-cantidad]").textContent =
      cantidad === 1 ? "1 palabra para descubrir" : `${cantidad} palabras para descubrir`;
  });
}

function mostrarMarcador() {
  const lista = document.getElementById("ranking");
  lista.replaceChildren();

  if (modoActual() === "duelo") {
    const nombresGuardados = leerDatosTemporales("nombresJugadores", ["Jugador 1", "Jugador 2"]);
    const nombres = Array.isArray(nombresGuardados) ? nombresGuardados.slice(0, 2) : ["Jugador 1", "Jugador 2"];
    const puntosGuardados = leerDatosTemporales("puntuacionJugadores", [0, 0]);
    const puntos = Array.isArray(puntosGuardados) ? puntosGuardados : [0, 0];
    while (nombres.length < 2) nombres.push(`Jugador ${nombres.length + 1}`);
    nombres.forEach(function (nombre, indice) {
      const item = document.createElement("li");
      item.className = "fila-marcador";
      const jugador = document.createElement("span");
      jugador.textContent = nombre || `Jugador ${indice + 1}`;
      const puntaje = document.createElement("strong");
      puntaje.textContent = `${Number(puntos[indice]) || 0} pts`;
      item.append(jugador, puntaje);
      lista.appendChild(item);
    });
    return;
  }

  const historial = leerDatosTemporales("historialPartidas", []);
  const ganadas = Array.isArray(historial) ? historial.filter(partida => partida?.gano === true) : [];
  if (ganadas.length === 0) {
    const vacio = document.createElement("li");
    vacio.textContent = "Tus victorias de esta sesión aparecerán aquí.";
    lista.appendChild(vacio);
    return;
  }

  ganadas.slice(-5).reverse().forEach(function (partida) {
    const item = document.createElement("li");
    item.textContent = `${partida.palabra || "Palabra"} (${partida.categoria || "Categoría"})`;
    lista.appendChild(item);
  });
}

activarModos();
activarTarjetas();
mostrarCantidadPalabras();
mostrarMarcador();
