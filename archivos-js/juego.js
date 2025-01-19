// Pantalla de inicio
// Referencias a los elementos
const botonInicio = document.getElementById('boton-inicio');
const pantallaInicio = document.getElementById('inicio');
const pantallaJuego = document.getElementById('juego');

// Configuración de los niveles
const niveles = [
    { pares: 3, tiempo: 90 }, // Nivel 1: 1 min 30 seg
    { pares: 5, tiempo: 120 }, // Nivel 2: 2 min
    { pares: 7, tiempo: 150 }, // Nivel 3: 2 min 30 seg
    { pares: 10, tiempo: 180 } // Nivel 4: 3 min
];

let nivelActual = 0;
let tarjetasSeleccionadas = [];
let bloqueoTablero = false;
let movimientos = 0;
let paresCompletados = 0;
let cronometro;

// Sonidos
const sonidoVoltear = new Audio("sonidos/voltear-carta.mp3");
const sonidoCorrecto = new Audio("sonidos/acierto-carta.mp3");
const sonidoError = new Audio("sonidos/error-carta.mp3");

// Grupo de tarjetas (imágenes)
const grupoTarjetas1 = [
    "imagenes/chef-z.jpeg",
    "imagenes/niña-z.jpg",
    "imagenes/cientifico-z.jpg",
    "imagenes/estudiante-z.jpg",
    "imagenes/jardinero-z.jpeg",
    "imagenes/perro-z.jpg",
    "imagenes/policia-z.jpg",
    "imagenes/rockera-z.jpg",
    "imagenes/zurfer-z.jpg",
    "imagenes/enfermera-z.jpg",
];

// Iniciar el juego
botonInicio.addEventListener('click', () => {
    pantallaInicio.classList.add('oculta');
    pantallaJuego.classList.remove('oculta');
    generarTablero();
});

// Generar el tablero
function generarTablero() {
    const paresNivel = niveles[nivelActual].pares;
    const tarjetasNivel = grupoTarjetas1.slice(0, paresNivel);
    const tarjetasMezcladas = [...tarjetasNivel, ...tarjetasNivel].sort(() => Math.random() - 0.5);

    const tablero = document.getElementById("galeria");
    tablero.innerHTML = tarjetasMezcladas
        .map((ruta, index) => `
            <div class="tarjeta" data-id="${index}">
                <div class="cara dorso">
                    <img src="imagenes/FLIP-Z.png" alt="Dorso">
                </div>
                <div class="cara frente">
                    <img src="${ruta}" alt="Frente">
                </div>
            </div>
        `)
        .join("");

    document.querySelectorAll(".tarjeta").forEach(tarjeta => {
        tarjeta.addEventListener("click", manejarClickTarjeta);
    });

    document.getElementById("nivel-actual").innerText = `Nivel: ${nivelActual + 1}`;
    paresCompletados = 0;
    movimientos = 0;
    document.getElementById("contador").innerText = `Movimientos: ${movimientos}`;
    iniciarCronometro(niveles[nivelActual].tiempo);
}

// Manejar clic en una tarjeta
function manejarClickTarjeta() {
    if (bloqueoTablero || this.classList.contains("volteada")) return;

    this.classList.add("volteada");
    tarjetasSeleccionadas.push(this);

    sonidoVoltear.currentTime = 0; // Reinicia el sonido
    sonidoVoltear.play();

    if (tarjetasSeleccionadas.length === 2) {
        actualizarContadorMovimientos();
        verificarPareja();
    }
}

// Verificar pareja de tarjetas
function verificarPareja() {
    bloqueoTablero = true;
    const [tarjeta1, tarjeta2] = tarjetasSeleccionadas;

    const img1 = tarjeta1.querySelector(".frente img").src;
    const img2 = tarjeta2.querySelector(".frente img").src;

    if (img1 === img2) {
        sonidoCorrecto.currentTime = 0;
        sonidoCorrecto.play();

        setTimeout(() => {
            tarjeta1.classList.add("desaparecer");
            tarjeta2.classList.add("desaparecer");
            tarjetasSeleccionadas = [];
            bloqueoTablero = false;
            paresCompletados++;

            if (paresCompletados === niveles[nivelActual].pares) {
                avanzarNivel();
            }
        }, 800);
    } else {
        sonidoError.currentTime = 0;
        sonidoError.play();

        tarjeta1.classList.add("vibrar");
        tarjeta2.classList.add("vibrar");

        setTimeout(() => {
            tarjeta1.classList.remove("vibrar", "volteada");
            tarjeta2.classList.remove("vibrar", "volteada");
            tarjetasSeleccionadas = [];
            bloqueoTablero = false;
        }, 800);
    }
}

// Actualizar contador de movimientos
function actualizarContadorMovimientos() {
    movimientos++;
    document.getElementById("contador").innerText = `Movimientos: ${movimientos}`;
}

// Formatear tiempo
function formatearTiempo(segundos) {
    const minutos = Math.floor(segundos / 60);
    const segundosRestantes = segundos % 60;
    return `${minutos.toString().padStart(2, "0")}:${segundosRestantes.toString().padStart(2, "0")}`;
}

// Cronómetro
function iniciarCronometro(tiempo) {
    clearInterval(cronometro);

    let segundos = tiempo;
    document.getElementById("cronometro").innerText = `Tiempo: ${formatearTiempo(segundos)}`;

    cronometro = setInterval(() => {
        if (segundos <= 0) {
            clearInterval(cronometro);
            mostrarPantallaFinal("¡Tiempo agotado! Intenta de nuevo.", "Reintentar", () => generarTablero());
        } else {
            segundos--;
            document.getElementById("cronometro").innerText = `Tiempo: ${formatearTiempo(segundos)}`;
        }
    }, 1000);
}

// Avanzar nivel
function avanzarNivel() {
    clearInterval(cronometro);

    if (nivelActual < niveles.length - 1) {
        mostrarPantallaFinal("¡Completaste el nivel! Sigue avanzando.", "Siguiente nivel", () => {
            nivelActual++;
            generarTablero();
        });
    } else {
        mostrarPantallaFinal(
            "¡Felicidades, completaste el juego!", 
            "Reiniciar juego", 
            () => {
                nivelActual = 0;
                generarTablero();
            }, 
            "imagenes/trofeo-z.jpg" // Ruta de la imagen del trofeo
        );
    }
}

function mostrarPantallaFinal(mensaje, textoBoton, accionBoton, imagen = null) {
    const pantallaFinal = document.createElement("div");
    pantallaFinal.classList.add("pantalla-final");
    pantallaFinal.innerHTML = `
        <div class="mensaje-final">
            <p>${mensaje}</p>
            ${imagen ? `<img src="${imagen}" alt="Imagen final" class="imagen-final">` : ""}
            <div class="botones-finales">
                <button class="boton-final">${textoBoton}</button>
                <button class="boton-salir">Salir</button>
            </div>
        </div>
    `;
    document.body.appendChild(pantallaFinal);

    // Evento para botón de reinicio
    document.querySelector(".boton-final").addEventListener("click", () => {
        pantallaFinal.remove();
        accionBoton();
    });

    // Evento para botón de salir
    document.querySelector(".boton-salir").addEventListener("click", () => {
        pantallaFinal.remove();
        salirDelJuego(); // Llama a la función que maneja la salida
    });
}

// Función para manejar la salida del juego
function salirDelJuego() {
    // Puedes personalizar esta acción según tu juego
    // Ejemplo: Redirigir a la pantalla inicial o recargar la página
    window.location.href = "index.html"; // Cambia "index.html" por la URL de tu pantalla de inicio
}
