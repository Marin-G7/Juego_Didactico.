function leerDatosTemporales(clave, alternativa) {
  try {
    const guardado = JSON.parse(sessionStorage.getItem(clave));
    return guardado ?? alternativa;
  } catch (error) {
    return alternativa;
  }
}

function modoActual() {
  const modo = sessionStorage.getItem("modoJuego");
  return ["duelo", "tiempo"].includes(modo) ? modo : "individual";
}

function nombresActuales() {
  const guardados = leerDatosTemporales("nombresJugadores", []);
  return Array.isArray(guardados) ? guardados : [];
}

function crearCamposNombres() {
  const cantidad = Number(document.getElementById("cantidad-jugadores").value);
  const nombresAnteriores = nombresActuales();
  const valoresEnPantalla = [...document.querySelectorAll("#lista-nombres-jugadores input")].map(entrada => entrada.value);
  const lista = document.getElementById("lista-nombres-jugadores");
  lista.replaceChildren();
  for (let indice = 0; indice < cantidad; indice++) {
    const etiqueta = document.createElement("label");
    etiqueta.textContent = `Jugador ${indice + 1}`;
    const entrada = document.createElement("input");
    entrada.type = "text";
    entrada.maxLength = 18;
    entrada.autocomplete = "nickname";
    entrada.placeholder = ["Ej. Luna", "Ej. Alex", "Ej. Sakura", "Ej. Ken"][indice % 4];
    entrada.dataset.jugador = String(indice);
    entrada.value = valoresEnPantalla[indice] ?? nombresAnteriores[indice] ?? "";
    etiqueta.appendChild(entrada);
    lista.appendChild(etiqueta);
  }
}

function mostrarModo(modo) {
  const modoAnterior = modoActual();
  sessionStorage.setItem("modoJuego", modo);
  if (modo === "duelo" && modoAnterior !== "duelo") {
    sessionStorage.setItem("indiceJugadorActual", "0");
    sessionStorage.setItem("puntuacionJugadores", JSON.stringify([]));
  }
  document.querySelectorAll("[data-modo]").forEach(function (boton) {
    const seleccionado = boton.dataset.modo === modo;
    boton.classList.toggle("seleccionado", seleccionado);
    boton.setAttribute("aria-pressed", String(seleccionado));
  });
  document.getElementById("nombres-duelo").classList.toggle("oculto", modo !== "duelo");
  document.getElementById("ajustes-tiempo").classList.toggle("oculto", modo !== "tiempo");
  if (modo === "duelo" && !document.querySelector("#lista-nombres-jugadores input")) crearCamposNombres();
  mostrarMarcador();
}

function activarModos() {
  document.querySelectorAll("[data-modo]").forEach(boton => {
    boton.addEventListener("click", () => mostrarModo(boton.dataset.modo));
  });
  const nombres = nombresActuales();
  const selector = document.getElementById("cantidad-jugadores");
  selector.value = String(Math.min(10, Math.max(2, nombres.length || 2)));
  selector.addEventListener("change", crearCamposNombres);
  crearCamposNombres();
  document.getElementById("duracion-tiempo").value = sessionStorage.getItem("duracionTiempo") || "60";
  mostrarModo(modoActual());
}

function guardarPreparacionPartida() {
  const modo = modoActual();
  sessionStorage.setItem("modoJuego", modo);
  if (modo === "duelo") {
    const entradas = [...document.querySelectorAll("#lista-nombres-jugadores input")];
    const nombres = entradas.map((entrada, indice) => entrada.value.trim() || `Jugador ${indice + 1}`);
    const nombresUsados = new Set();
    const nombresUnicos = nombres.map((nombre, indice) => {
      let unico = nombre;
      let sufijo = 2;
      while (nombresUsados.has(unico.toLocaleLowerCase("es"))) unico = `${nombre} ${sufijo++}`;
      nombresUsados.add(unico.toLocaleLowerCase("es"));
      return unico;
    });
    const nombresPrevios = nombresActuales();
    const marcadorPrevio = leerDatosTemporales("puntuacionJugadores", []);
    const mismosJugadores = nombresPrevios.length === nombresUnicos.length && nombresPrevios.every((nombre, indice) => nombre === nombresUnicos[indice]);
    sessionStorage.setItem("nombresJugadores", JSON.stringify(nombresUnicos));
    const marcador = mismosJugadores && Array.isArray(marcadorPrevio)
      ? nombresUnicos.map((_, indice) => Number(marcadorPrevio[indice]) || 0)
      : Array(nombresUnicos.length).fill(0);
    sessionStorage.setItem("puntuacionJugadores", JSON.stringify(marcador));
    const indiceActual = mismosJugadores ? Number(sessionStorage.getItem("indiceJugadorActual")) || 0 : 0;
    sessionStorage.setItem("indiceJugadorActual", String(Math.min(nombresUnicos.length - 1, indiceActual)));
  } else if (modo === "tiempo") {
    sessionStorage.setItem("duracionTiempo", document.getElementById("duracion-tiempo").value);
  }
}

function activarTarjetas() {
  document.querySelectorAll(".tarjeta-categoria").forEach(tarjeta => {
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
  document.querySelectorAll(".tarjeta-categoria").forEach(tarjeta => {
    const cantidad = bancoPalabras[tarjeta.dataset.categoria]?.length || 0;
    tarjeta.querySelector("[data-cantidad]").textContent = `${cantidad} palabras para descubrir`;
  });
}

function mostrarMarcador() {
  const lista = document.getElementById("ranking");
  lista.replaceChildren();
  if (modoActual() === "duelo") {
    const nombres = nombresActuales();
    const puntos = leerDatosTemporales("puntuacionJugadores", []);
    nombres.forEach((nombre, indice) => {
      const item = document.createElement("li");
      item.className = "fila-marcador";
      const jugador = document.createElement("span");
      jugador.textContent = nombre || `Jugador ${indice + 1}`;
      const puntaje = document.createElement("strong");
      puntaje.textContent = `${Number(puntos[indice]) || 0} pts`;
      item.append(jugador, puntaje);
      lista.appendChild(item);
    });
    if (!nombres.length) lista.innerHTML = "<li>Agrega los nombres y comienza el torneo.</li>";
    return;
  }

  const historial = leerDatosTemporales("historialPartidas", []);
  const ganadas = Array.isArray(historial) ? historial.filter(partida => partida?.gano) : [];
  if (!ganadas.length) {
    lista.innerHTML = "<li>Tus victorias de esta sesión aparecerán aquí.</li>";
    return;
  }
  ganadas.slice(-5).reverse().forEach(partida => {
    const item = document.createElement("li");
    item.textContent = `${partida.palabra || "Palabra"} (${partida.categoria || "Categoría"})`;
    lista.appendChild(item);
  });
}

activarModos();
activarTarjetas();
mostrarCantidadPalabras();
mostrarMarcador();
