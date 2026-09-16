// ============================================
//  Lógica de la página de CATEGORÍAS
//  Las tarjetas ya están fijas en el HTML;
//  aquí solo manejamos el comportamiento.
// ============================================

// --- Al hacer clic en una tarjeta, guarda la categoría y va al juego ---
function activarTarjetas() {
  const tarjetas = document.querySelectorAll(".tarjeta-categoria");

  tarjetas.forEach(function (tarjeta) {
    tarjeta.addEventListener("click", function () {
      const idCategoria = tarjeta.getAttribute("data-categoria");
      elegirCategoria(idCategoria);
    });
  });
}

function elegirCategoria(idCategoria) {
  localStorage.setItem("categoriaSeleccionada", idCategoria);
  window.location.href = "../juego/juego.html";
}

// --- Muestra el ranking usando el historial guardado ---
function mostrarRanking() {
  const lista = document.getElementById("ranking");
  lista.innerHTML = "";

  const historial = JSON.parse(localStorage.getItem("historialPartidas")) || [];
  const ganadas = historial.filter(p => p.gano);

  if (ganadas.length === 0) {
    const vacio = document.createElement("li");
    vacio.textContent = "Todavía no hay partidas ganadas.";
    lista.appendChild(vacio);
    return;
  }

  ganadas.slice(-5).reverse().forEach(function (partida) {
    const item = document.createElement("li");
    item.textContent = partida.palabra + " (" + partida.categoria + ")";
    lista.appendChild(item);
  });
}

// --- Arranque de la página ---
activarTarjetas();
mostrarRanking();