const bancoPalabras = {
  animales: [
    { palabra: "MURCIELAGO", definicion: "Mamífero volador nocturno que se orienta usando el eco de sus propios sonidos." },
    { palabra: "JIRAFA", definicion: "Mamífero africano conocido por su cuello extremadamente largo." },
    { palabra: "PINGUINO", definicion: "Ave no voladora adaptada a la vida acuática en climas fríos." },
    { palabra: "CAMALEON", definicion: "Reptil capaz de cambiar el color de su piel según el entorno o su estado de ánimo." },
    { palabra: "OCTOPUS", definicion: "Molusco marino de ocho brazos, conocido por su inteligencia y camuflaje." },
    { palabra: "CANGURO", definicion: "Marsupial australiano que lleva a sus crías en una bolsa ventral." },
    { palabra: "ELEFANTE", definicion: "Mamífero terrestre de gran tamaño, reconocido por su trompa y sus largos colmillos de marfil." },
    { palabra: "TIGRE", definicion: "Felino de gran tamaño con pelaje anaranjado y rayas negras, cazador solitario." },
    { palabra: "LEON", definicion: "Felino conocido como el rey de la sabana, vive en manadas lideradas por machos." },
    { palabra: "COCODRILO", definicion: "Reptil acuático depredador con mandíbulas poderosas y piel escamosa." },
    { palabra: "TORTUGA", definicion: "Reptil de movimientos lentos, protegido por un caparazón óseo." },
    { palabra: "DELFIN", definicion: "Mamífero marino muy inteligente que se comunica mediante sonidos y ecolocalización." },
    { palabra: "BALLENA", definicion: "El animal más grande que existe, mamífero marino filtrador de alimento." },
    { palabra: "TIBURON", definicion: "Pez cartilaginoso depredador, presente en océanos de todo el mundo." },
    { palabra: "AGUILA", definicion: "Ave rapaz de vista aguda, símbolo de fuerza y libertad." },
    { palabra: "BUHO", definicion: "Ave rapaz nocturna capaz de girar la cabeza casi por completo." },
    { palabra: "SERPIENTE", definicion: "Reptil sin patas que se desplaza reptando, algunas especies son venenosas." },
    { palabra: "LAGARTIJA", definicion: "Pequeño reptil de cuatro patas, común en zonas cálidas y rocosas." },
    { palabra: "RANA", definicion: "Anfibio saltador de piel lisa que vive cerca del agua." },
    { palabra: "SAPO", definicion: "Anfibio de piel rugosa, generalmente terrestre y de hábitos nocturnos." },
    { palabra: "ARDILLA", definicion: "Pequeño roedor arborícola que almacena nueces para el invierno." },
    { palabra: "CONEJO", definicion: "Mamífero de orejas largas, conocido por su rápida reproducción." },
    { palabra: "ZORRO", definicion: "Cánido astuto de hocico puntiagudo y cola espesa." },
    { palabra: "LOBO", definicion: "Cánido salvaje que caza en manada y aúlla para comunicarse." },
    { palabra: "OSO", definicion: "Mamífero grande y robusto; algunas especies hibernan en invierno." },
    { palabra: "PANDA", definicion: "Oso de pelaje blanco y negro que se alimenta principalmente de bambú." },
    { palabra: "KOALA", definicion: "Marsupial australiano que se alimenta casi exclusivamente de hojas de eucalipto." },
    { palabra: "CEBRA", definicion: "Equino africano reconocido por sus rayas blancas y negras." },
    { palabra: "HIPOPOTAMO", definicion: "Mamífero semiacuático de gran tamaño y boca enorme." },
    { palabra: "RINOCERONTE", definicion: "Mamífero de piel gruesa con uno o dos cuernos sobre el hocico." },
    { palabra: "GORILA", definicion: "Primate de gran tamaño y fuerza, vive en grupos familiares." },
    { palabra: "CHIMPANCE", definicion: "Primate muy cercano genéticamente al ser humano, usa herramientas simples." },
    { palabra: "MARIPOSA", definicion: "Insecto volador de alas coloridas, resultado de una metamorfosis completa." },
    { palabra: "ABEJA", definicion: "Insecto polinizador que vive en colonias y produce miel." },
    { palabra: "HORMIGA", definicion: "Insecto social que vive en colonias organizadas bajo tierra." },
    { palabra: "ARAÑA", definicion: "Arácnido de ocho patas que teje telarañas para cazar." },
    { palabra: "ESCORPION", definicion: "Arácnido con pinzas y una cola terminada en aguijón venenoso." },
    { palabra: "CARACOL", definicion: "Molusco de cuerpo blando protegido por una concha en espiral." },
    { palabra: "MEDUSA", definicion: "Animal marino gelatinoso con tentáculos urticantes." },
    { palabra: "CANGREJO", definicion: "Crustáceo con caparazón duro y un par de pinzas prominentes." },
    { palabra: "LANGOSTA", definicion: "Crustáceo marino de cuerpo alargado, apreciado en gastronomía." },
    { palabra: "FOCA", definicion: "Mamífero marino con aletas, capaz de desplazarse en tierra y agua." },
    { palabra: "MORSA", definicion: "Mamífero marino de grandes colmillos que habita en regiones árticas." },
    { palabra: "NUTRIA", definicion: "Mamífero semiacuático de pelaje denso e impermeable." },
    { palabra: "CASTOR", definicion: "Roedor conocido por construir represas con ramas y troncos." },
    { palabra: "VENADO", definicion: "Mamífero herbívoro de patas delgadas y, en los machos, astas ramificadas." },
    { palabra: "ALCE", definicion: "El mayor de los ciervos, con astas anchas en forma de pala." },
    { palabra: "BISONTE", definicion: "Bóvido robusto de gran tamaño, símbolo de las llanuras americanas." },
    { palabra: "CAMELLO", definicion: "Mamífero del desierto con una o dos jorobas que almacenan grasa." },
    { palabra: "LLAMA", definicion: "Camélido sudamericano usado como animal de carga." },
    { palabra: "ALPACA", definicion: "Camélido sudamericano criado principalmente por su lana suave." },
    { palabra: "AVESTRUZ", definicion: "Ave más grande del mundo; no vuela, pero corre a gran velocidad." },
    { palabra: "FLAMENCO", definicion: "Ave zancuda de plumaje rosado que suele pararse en una sola pata." },
    { palabra: "PAVORREAL", definicion: "Ave conocida por el vistoso despliegue de plumas de su cola." }
  ],
  tecnologia: [
    { palabra: "TECLADO", definicion: "Periférico usado para introducir texto y comandos en una computadora." },
    { palabra: "SERVIDOR", definicion: "Computadora que provee servicios a otras computadoras conectadas en red." },
    { palabra: "ALGORITMO", definicion: "Secuencia de pasos definida para resolver un problema o realizar una tarea." },
    { palabra: "NAVEGADOR", definicion: "Programa usado para acceder y visualizar páginas web." },
    { palabra: "COMPILADOR", definicion: "Programa que traduce código fuente a lenguaje que la máquina puede ejecutar." },
    { palabra: "FIREWALL", definicion: "Sistema de seguridad que controla el tráfico de red entrante y saliente." },
    { palabra: "INTERNET", definicion: "Red mundial que conecta millones de dispositivos para compartir información." },
    { palabra: "SOFTWARE", definicion: "Conjunto de programas e instrucciones que hacen funcionar una computadora." },
    { palabra: "HARDWARE", definicion: "Componentes físicos de un dispositivo electrónico o computadora." },
    { palabra: "PROCESADOR", definicion: "Componente que ejecuta las instrucciones y cálculos de una computadora." },
    { palabra: "MEMORIA", definicion: "Componente que almacena datos temporalmente mientras el equipo está encendido." },
    { palabra: "MONITOR", definicion: "Dispositivo que muestra en pantalla la información procesada por la computadora." },
    { palabra: "IMPRESORA", definicion: "Dispositivo que traslada texto o imágenes digitales al papel." },
    { palabra: "ROUTER", definicion: "Dispositivo que dirige el tráfico de datos entre redes." },
    { palabra: "MODEM", definicion: "Dispositivo que convierte señales para permitir la conexión a internet." },
    { palabra: "BLUETOOTH", definicion: "Tecnología inalámbrica de corto alcance para conectar dispositivos." },
    { palabra: "USB", definicion: "Puerto y estándar de conexión para transferir datos y energía." },
    { palabra: "PIXEL", definicion: "Unidad mínima de una imagen digital en una pantalla." },
    { palabra: "BYTE", definicion: "Unidad básica de información compuesta por ocho bits." },
    { palabra: "ARCHIVO", definicion: "Conjunto de datos almacenado con un nombre en un dispositivo." },
    { palabra: "CARPETA", definicion: "Contenedor usado para organizar archivos dentro de un sistema." },
    { palabra: "CONTRASENA", definicion: "Conjunto de caracteres secretos usado para verificar la identidad de un usuario." },
    { palabra: "USUARIO", definicion: "Persona que utiliza un sistema o servicio informático." },
    { palabra: "NUBE", definicion: "Modelo de almacenamiento y procesamiento de datos a través de internet." },
    { palabra: "RED", definicion: "Conjunto de dispositivos conectados entre sí para compartir información." },
    { palabra: "CODIGO", definicion: "Conjunto de instrucciones escritas en un lenguaje de programación." },
    { palabra: "VARIABLE", definicion: "Espacio con nombre usado para almacenar un valor en un programa." },
    { palabra: "FUNCION", definicion: "Bloque de código reutilizable que realiza una tarea específica." },
    { palabra: "ARREGLO", definicion: "Estructura que almacena varios valores organizados bajo un mismo nombre." },
    { palabra: "BUCLE", definicion: "Estructura que repite un bloque de código mientras se cumpla una condición." },
    { palabra: "CONDICIONAL", definicion: "Estructura que ejecuta código diferente según se cumpla o no una condición." },
    { palabra: "DEPURADOR", definicion: "Herramienta usada para encontrar y corregir errores en un programa." },
    { palabra: "FRAMEWORK", definicion: "Conjunto de herramientas y reglas que facilitan el desarrollo de software." },
    { palabra: "LENGUAJE", definicion: "Conjunto de reglas y sintaxis usado para escribir programas." },
    { palabra: "PYTHON", definicion: "Lenguaje de programación conocido por su sintaxis simple y legible." },
    { palabra: "JAVASCRIPT", definicion: "Lenguaje de programación usado principalmente para dar interactividad a páginas web." },
    { palabra: "HTML", definicion: "Lenguaje de marcado usado para estructurar el contenido de una página web." },
    { palabra: "CSS", definicion: "Lenguaje usado para definir los estilos visuales de una página web." },
    { palabra: "GITHUB", definicion: "Plataforma en línea para alojar y colaborar en proyectos con control de versiones." },
    { palabra: "TERMINAL", definicion: "Interfaz de texto usada para ejecutar comandos en una computadora." },
    { palabra: "CONSOLA", definicion: "Panel donde se muestran mensajes y resultados de un programa en ejecución." },
    { palabra: "PANTALLA", definicion: "Dispositivo que muestra imágenes e información de forma visual." },
    { palabra: "TECLA", definicion: "Botón de un teclado que representa una letra, número o función." },
    { palabra: "RATON", definicion: "Dispositivo periférico usado para mover el cursor y hacer clic en pantalla." },
    { palabra: "AURICULARES", definicion: "Dispositivo que se coloca en los oídos para escuchar audio de forma privada." },
    { palabra: "ALTAVOZ", definicion: "Dispositivo que convierte señales eléctricas en sonido audible." },
    { palabra: "CAMARA", definicion: "Dispositivo que captura imágenes o video, fijo o integrado a un equipo." },
    { palabra: "MICROFONO", definicion: "Dispositivo que capta el sonido y lo convierte en señal eléctrica." },
    { palabra: "BATERIA", definicion: "Componente que almacena energía eléctrica para alimentar un dispositivo." },
    { palabra: "CARGADOR", definicion: "Dispositivo usado para suministrar energía y recargar una batería." },
    { palabra: "CABLE", definicion: "Conductor usado para transmitir datos o energía eléctrica entre dispositivos." },
    { palabra: "ADAPTADOR", definicion: "Dispositivo que permite conectar equipos con conectores diferentes." },
    { palabra: "CHIP", definicion: "Circuito integrado que contiene componentes electrónicos en miniatura." },
    { palabra: "CIRCUITO", definicion: "Conjunto de componentes electrónicos conectados para cumplir una función." }
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