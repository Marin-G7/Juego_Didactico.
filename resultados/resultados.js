// ============================================
//  Lógica de la página de RESULTADOS
//  Datos de ejemplo por ahora: cuando el juego
//  esté listo, se reemplazan por los reales.
// ============================================

// --- Datos de ejemplo de la última partida ---
const ultimaPartida = {
  gano: true,
  palabra: "MURCIÉLAGO",
  categoria: "Animales",
  definicion: "Mamífero volador nocturno que se orienta usando el eco de sus propios sonidos."
};

// --- Historial de ejemplo ---
const historial = [
  { palabra: "MURCIÉLAGO", categoria: "Animales",   gano: true },
  { palabra: "TECLADO",    categoria: "Tecnología", gano: true },
  { palabra: "JIRAFA",     categoria: "Animales",   gano: false },
  { palabra: "SERVIDOR",   categoria: "Tecnología", gano: true }
];

// --- Cambia la cara del gato según el resultado ---
function actualizarGato(gano) {
  const tarjeta = document.getElementById("tarjeta-resultado");
  const titulo = document.getElementById("titulo-resultado");
  const mensaje = document.getElementById("mensaje-gato");
  const parpadoIzq = document.getElementById("parpado-izq");
  const parpadoDer = document.getElementById("parpado-der");
  const boca = document.getElementById("boca");

  if (gano) {
    tarjeta.classList.remove("perdio");
    titulo.textContent = "¡Ganaste!";
    mensaje.textContent = "¡Muy bien! Adivinaste la palabra sin problema.";
    parpadoIzq.setAttribute("height", "0");
    parpadoDer.setAttribute("height", "0");
    boca.setAttribute("d", "M85,108 Q100,120 115,108");
  } else {
    tarjeta.classList.add("perdio");
    titulo.textContent = "¡Casi!";
    mensaje.textContent = "No pasa nada, así se aprende. Inténtalo otra vez.";
    parpadoIzq.setAttribute("height", "18");
    parpadoDer.setAttribute("height", "18");
    boca.setAttribute("d", "M85,118 Q100,106 115,118");
  }
}

// --- Muestra los datos de la última partida ---
function mostrarResultado() {
  document.getElementById("palabra-final").textContent = ultimaPartida.palabra;
  document.getElementById("categoria-final").textContent = ultimaPartida.categoria;
  document.getElementById("definicion-palabra").textContent = ultimaPartida.definicion;
  actualizarGato(ultimaPartida.gano);
}

// --- Calcula y muestra las estadísticas ---
function mostrarEstadisticas() {
  const jugadas = historial.length;
  const ganadas = historial.filter(p => p.gano).length;
  const porcentaje = Math.round((ganadas / jugadas) * 100);

  let racha = 0;
  for (let i = 0; i < historial.length; i++) {
    if (historial[i].gano) {
      racha++;
    } else {
      break;
    }
  }

  document.getElementById("stat-jugadas").textContent = jugadas;
  document.getElementById("stat-ganadas").textContent = ganadas;
  document.getElementById("stat-racha").textContent = racha;
  document.getElementById("stat-porcentaje").textContent = porcentaje + "%";

  const barra = document.getElementById("barra-progreso");
  barra.style.width = porcentaje + "%";
  barra.textContent = porcentaje + "%";
}

// --- Dibuja la lista del historial ---
function mostrarHistorial() {
  const lista = document.getElementById("historial-partidas");
  lista.innerHTML = "";

  historial.forEach(function (partida) {
    const item = document.createElement("li");

    const texto = document.createElement("span");
    texto.textContent = partida.palabra + "  ·  " + partida.categoria;

    const marca = document.createElement("span");
    if (partida.gano) {
      marca.textContent = "Ganada";
      marca.className = "marca-gano";
    } else {
      marca.textContent = "Perdida";
      marca.className = "marca-perdio";
    }

    item.appendChild(texto);
    item.appendChild(marca);
    lista.appendChild(item);
  });
}

// --- Arranque de la página ---
mostrarResultado();
mostrarEstadisticas();
mostrarHistorial();