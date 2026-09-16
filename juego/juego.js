// ============================================
//  Lógica del JUEGO (Ahorcado)
// ============================================

const bancoPalabras = {
  animales: [
    { palabra: "MURCIELAGO", definicion: "Mamífero volador nocturno que se orienta usando el eco de sus propios sonidos." },
    { palabra: "JIRAFA", definicion: "Mamífero africano conocido por su cuello extremadamente largo." }
  ],
  tecnologia: [
    { palabra: "TECLADO", definicion: "Periférico usado para introducir texto y comandos en una computadora." },
    { palabra: "SERVIDOR", definicion: "Computadora que provee servicios a otras computadoras conectadas en red." }
  ]
};

const nombresCategorias = {
  animales: "Animales",
  tecnologia: "Tecnología"
};

const MAX_INTENTOS = 6;
const partesCuerpo = [
  "parte-cabeza", "parte-torso",
  "parte-brazo-izq", "parte-brazo-der",
  "parte-pierna-izq", "parte-pierna-der"
];

let palabraActual = "";
let definicionActual = "";
let categoriaActual = "";
let letrasAdivinadas = [];
let errores = 0;
let juegoTerminado = false;

// --- Quita tildes para comparar letras sin importar acentos ---
function normalizar(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// --- Elige la palabra según la categoría guardada en localStorage ---
function iniciarJuego() {
  categoriaActual = localStorage.getItem("categoriaSeleccionada");

  if (!categoriaActual || !bancoPalabras[categoriaActual]) {
    window.location.href = "../categorias/categorias.html";
    return;
  }

  const palabras = bancoPalabras[categoriaActual];
  const elegida = palabras[Math.floor(Math.random() * palabras.length)];

  palabraActual = elegida.palabra;
  definicionActual = elegida.definicion;
  letrasAdivinadas = [];
  errores = 0;
  juegoTerminado = false;

  document.getElementById("categoria-juego").textContent = nombresCategorias[categoriaActual];
  document.getElementById("btn-ver-resultado").classList.add("oculto");
  document.getElementById("mensaje-estado").textContent = "";
  document.getElementById("numero-intentos").textContent = MAX_INTENTOS;

  partesCuerpo.forEach(id => document.getElementById(id).setAttribute("opacity", "0"));

  document.querySelectorAll("#teclado-letras button").forEach(function (boton) {
    boton.disabled = false;
    boton.classList.remove("correcta", "incorrecta");
  });

  actualizarPalabraOculta();
}

// --- Muestra la palabra con guiones y letras ya adivinadas ---
function actualizarPalabraOculta() {
  const mostrado = palabraActual
    .split("")
    .map(function (letra) {
      return letrasAdivinadas.includes(normalizar(letra)) ? letra : "_";
    })
    .join(" ");

  document.getElementById("palabra-oculta").textContent = mostrado;
}

// --- Procesa el clic en una letra del teclado ---
function elegirLetra(letra, boton) {
  if (juegoTerminado) return;

  const letraNormalizada = normalizar(letra);
  letrasAdivinadas.push(letraNormalizada);
  boton.disabled = true;

  if (normalizar(palabraActual).includes(letraNormalizada)) {
    boton.classList.add("correcta");
  } else {
    boton.classList.add("incorrecta");
    errores++;
    document.getElementById("numero-intentos").textContent = MAX_INTENTOS - errores;

    const parte = partesCuerpo[errores - 1];
    if (parte) {
      document.getElementById(parte).setAttribute("opacity", "1");
    }
  }

  actualizarPalabraOculta();
  revisarEstadoJuego();
}

// --- Revisa si el jugador ganó o perdió ---
function revisarEstadoJuego() {
  const palabraCompleta = normalizar(palabraActual)
    .split("")
    .every(letra => letrasAdivinadas.includes(letra));

  if (palabraCompleta) {
    terminarJuego(true);
  } else if (errores >= MAX_INTENTOS) {
    document.getElementById("palabra-oculta").textContent = palabraActual;
    terminarJuego(false);
  }
}

// --- Finaliza la partida: bloquea teclado, guarda resultado, muestra botón ---
function terminarJuego(gano) {
  juegoTerminado = true;

  document.getElementById("mensaje-estado").textContent = gano
    ? "¡Ganaste! Adivinaste la palabra."
    : "Perdiste. La palabra era " + palabraActual + ".";

  document.querySelectorAll("#teclado-letras button").forEach(function (boton) {
    boton.disabled = true;
  });

  guardarResultado(gano);

  document.getElementById("btn-ver-resultado").classList.remove("oculto");
}

// --- Guarda la partida en localStorage para la página de resultados ---
function guardarResultado(gano) {
  const resultado = {
    palabra: palabraActual,
    categoria: nombresCategorias[categoriaActual],
    definicion: definicionActual,
    gano: gano
  };

  localStorage.setItem("ultimaPartida", JSON.stringify(resultado));

  const historial = JSON.parse(localStorage.getItem("historialPartidas")) || [];
  historial.push(resultado);
  localStorage.setItem("historialPartidas", JSON.stringify(historial));
}

// --- Activa los botones del teclado ---
function activarTeclado() {
  document.querySelectorAll("#teclado-letras button").forEach(function (boton) {
    boton.addEventListener("click", function () {
      elegirLetra(boton.getAttribute("data-letra"), boton);
    });
  });
}

// --- Arranque de la página ---
activarTeclado();
iniciarJuego();