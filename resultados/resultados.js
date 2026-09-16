// ============================================
//  Lógica de la página de RESULTADOS
//  Ahora lee los datos reales guardados por
//  juego.js en localStorage.
// ============================================

// --- Datos de la última partida (o valores por defecto si aún no ha jugado) ---
const ultimaPartida = JSON.parse(localStorage.getItem("ultimaPartida")) || {
  gano: true,
  palabra: "SIN DATOS",
  categoria: "-",
  definicion: "Todavía no has jugado ninguna partida."
};

function actualizarGato(gano) {
  const tarjeta = document.getElementById("tarjeta-resultado");
  const titulo = document.getElementById("titulo-resultado");
  const mensaje = document.getElementById("mensaje-gato");
  const gato = document.getElementById("gato");

  if (gano) {
    tarjeta.classList.remove("perdio");
    titulo.textContent = "¡Ganaste!";
    mensaje.textContent = "¡Muy bien! Adivinaste la palabra sin problema.";
    gato.src = "imagenes/feliz.png";
  } else {
    tarjeta.classList.add("perdio");
    titulo.textContent = "¡Casi!";
    mensaje.textContent = "No pasa nada, así se aprende. Inténtalo otra vez.";
    gato.src = "imagenes/trsite.png";
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

  if (jugadas === 0) {
    document.getElementById("stat-jugadas").textContent = 0;
    document.getElementById("stat-ganadas").textContent = 0;
    document.getElementById("stat-racha").textContent = 0;
    document.getElementById("stat-porcentaje").textContent = "0%";

    const barra = document.getElementById("barra-progreso");
    barra.style.width = "0%";
    barra.textContent = "0%";
    return;
  }

  const ganadas = historial.filter(p => p.gano).length;
  const porcentaje = Math.round((ganadas / jugadas) * 100);

  let racha = 0;
  for (let i = historial.length - 1; i >= 0; i--) {
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

  if (historial.length === 0) {
    const item = document.createElement("li");
    item.textContent = "Todavía no has jugado ninguna partida.";
    lista.appendChild(item);
    return;
  }

  historial.slice().reverse().forEach(function (partida) {
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