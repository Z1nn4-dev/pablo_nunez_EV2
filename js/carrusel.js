// =============================== 
// ARCHIVO DE SCRIPT JAVASCRIPT: CARRUSEL.JS
// Carrusel de imágenes dinámico con la API de RAWG
// Muestra los juegos lanzados en los últimos 30 días
// Funciones: inicializarCarrusel(), cambiarImagenCarrusel(), cargarJuegos()
// =============================== 

// --- ESTRUCTURAS DE DATOS DEL CARRUSEL ---
// Arreglo para almacenar los objetos de juegos del carrusel
var carruselApiKey = '447bfa68c64d4608a0d0cfdcd210596d';
var carruselJuegos = [];       // Arreglo de objetos de juegos
var carruselIndice = 0;        // Índice de la imagen visible actualmente
var carruselAutoPlay = null;   // Referencia al intervalo de auto-avance

// =============================== 
// inicializarCarrusel()
// Se ejecuta al cargar la página. Configura los eventos
// de los botones Anterior/Siguiente y carga los juegos.
// =============================== 
function inicializarCarrusel() {
    // Configurar botón "Anterior"
    var btnPrev = document.getElementById('carrusel-prev');
    if (btnPrev) {
        btnPrev.addEventListener('click', function () {
            cambiarImagenCarrusel(-1);
        });
    }

    // Configurar botón "Siguiente"
    var btnNext = document.getElementById('carrusel-next');
    if (btnNext) {
        btnNext.addEventListener('click', function () {
            cambiarImagenCarrusel(1);
        });
    }

    // Cargar juegos de los últimos 30 días
    cargarJuegos();
}

// =============================== 
// cargarJuegos()
// Consulta la API de RAWG para obtener juegos lanzados
// en los últimos 30 días. Almacena los resultados como
// objetos dentro del arreglo carruselJuegos[].
// =============================== 
async function cargarJuegos() {
    var slide = document.getElementById('carrusel-slide');
    var indicadores = document.getElementById('carrusel-indicadores');

    // Mostrar estado de carga en el DOM
    slide.innerHTML = '<div class="carrusel-loading"><div class="loader"></div><p>Cargando juegos...</p></div>';
    indicadores.innerHTML = '';

    // Detener auto-avance mientras cargamos
    if (carruselAutoPlay) {
        clearInterval(carruselAutoPlay);
        carruselAutoPlay = null;
    }

    // Calcular fechas para "últimos 30 días"
    var hoy = new Date();
    var fechaHoy = formatearFecha(hoy);
    var hace30 = new Date(hoy);
    hace30.setDate(hace30.getDate() - 30);
    var fechaHace30 = formatearFecha(hace30);

    // Construir URL de la API RAWG - últimos 30 días, 10 resultados
    var url = 'https://api.rawg.io/api/games?key=' + carruselApiKey +
        '&dates=' + fechaHace30 + ',' + fechaHoy +
        '&ordering=-added&page_size=15';

    try {
        var response = await fetch(url);
        var data = await response.json();

        if (data.results && data.results.length > 0) {
            // Filtrar solo juegos que tengan imagen de fondo
            // y almacenarlos como objetos en el arreglo
            carruselJuegos = data.results.filter(function (juego) {
                return juego.background_image !== null && juego.background_image !== '';
            }).slice(0, 10); // Mostrar 10 juegos

            if (carruselJuegos.length === 0) {
                slide.innerHTML = '<div class="carrusel-loading"><p>No se encontraron juegos con imagen.</p></div>';
                return;
            }

            // Resetear índice y mostrar la primera imagen
            carruselIndice = 0;
            actualizarSlide();
            crearIndicadores();

            // Iniciar auto-avance cada 4 segundos
            carruselAutoPlay = setInterval(function () {
                cambiarImagenCarrusel(1);
            }, 4000);

        } else {
            slide.innerHTML = '<div class="carrusel-loading"><p>No se encontraron juegos recientes.</p></div>';
        }

    } catch (error) {
        console.error('Error cargando juegos para el carrusel:', error);
        slide.innerHTML = '<div class="carrusel-loading"><p>Error al cargar juegos. Verifica tu conexión.</p></div>';
    }
}

// =============================== 
// formatearFecha(fecha)
// Convierte un objeto Date a formato YYYY-MM-DD para la API.
// @param {Date} fecha - Objeto Date a formatear
// @returns {string} Fecha en formato YYYY-MM-DD
// =============================== 
function formatearFecha(fecha) {
    var anio = fecha.getFullYear();
    var mes = String(fecha.getMonth() + 1).padStart(2, '0');
    var dia = String(fecha.getDate()).padStart(2, '0');
    return anio + '-' + mes + '-' + dia;
}

// =============================== 
// cambiarImagenCarrusel(direccion)
// Cambia la imagen visible del carrusel modificando el DOM.
// El botón "Anterior" envía -1, el botón "Siguiente" envía +1.
// @param {number} direccion - Dirección del cambio (-1 o +1)
// =============================== 
function cambiarImagenCarrusel(direccion) {
    if (carruselJuegos.length === 0) return;

    // Calcular nuevo índice con wrap-around circular
    carruselIndice = (carruselIndice + direccion + carruselJuegos.length) % carruselJuegos.length;

    // Actualizar el DOM con la nueva imagen
    actualizarSlide();
    actualizarIndicadores();
}

// =============================== 
// actualizarSlide()
// Modifica el contenido del DOM del slide para mostrar
// la imagen y los datos del juego en el índice actual.
// Usa el objeto juego del arreglo carruselJuegos.
// =============================== 
function actualizarSlide() {
    var slide = document.getElementById('carrusel-slide');
    if (!slide || carruselJuegos.length === 0) return;

    // Obtener el objeto del juego actual del arreglo
    var juego = carruselJuegos[carruselIndice];

    // Crear objeto con los datos relevantes del juego
    var objetoJuego = {
        nombre: juego.name || 'Sin nombre',
        imagen: juego.background_image || '',
        lanzamiento: juego.released || 'TBA',
        rating: juego.rating || 0,
        metacritic: juego.metacritic || null
    };

    // Construir texto informativo
    var infoTexto = 'Lanzamiento: ' + objetoJuego.lanzamiento;
    if (objetoJuego.metacritic) {
        infoTexto += ' | Metacritic: ' + objetoJuego.metacritic;
    } else if (objetoJuego.rating > 0) {
        infoTexto += ' | Rating: ' + objetoJuego.rating.toFixed(1) + '/5';
    }

    // Modificar el DOM del slide con la nueva imagen y overlay
    slide.innerHTML =
        '<img src="' + objetoJuego.imagen + '" alt="' + objetoJuego.nombre + '" draggable="false">' +
        '<div class="carrusel-overlay">' +
        '  <h3>' + objetoJuego.nombre + '</h3>' +
        '  <p>' + infoTexto + '</p>' +
        '</div>';
}

// =============================== 
// crearIndicadores()
// Genera los botones indicadores (dots) en el DOM,
// uno por cada juego en el arreglo carruselJuegos.
// =============================== 
function crearIndicadores() {
    var contenedor = document.getElementById('carrusel-indicadores');
    if (!contenedor) return;

    contenedor.innerHTML = '';

    for (var i = 0; i < carruselJuegos.length; i++) {
        var dot = document.createElement('button');
        dot.className = 'carrusel-dot' + (i === carruselIndice ? ' activo' : '');
        dot.setAttribute('aria-label', 'Ir a imagen ' + (i + 1));
        dot.setAttribute('data-indice', i);

        // Al hacer clic, ir directamente a ese slide
        dot.addEventListener('click', function () {
            var indice = parseInt(this.getAttribute('data-indice'));
            carruselIndice = indice;
            actualizarSlide();
            actualizarIndicadores();

            // Reiniciar auto-avance
            if (carruselAutoPlay) clearInterval(carruselAutoPlay);
            carruselAutoPlay = setInterval(function () {
                cambiarImagenCarrusel(1);
            }, 4000);
        });

        contenedor.appendChild(dot);
    }
}

// =============================== 
// actualizarIndicadores()
// Actualiza el estado visual (activo/inactivo) de los dots.
// =============================== 
function actualizarIndicadores() {
    var dots = document.querySelectorAll('.carrusel-dot');
    dots.forEach(function (dot, i) {
        if (i === carruselIndice) {
            dot.classList.add('activo');
        } else {
            dot.classList.remove('activo');
        }
    });
}

// =============================== 
// INICIALIZAR AL CARGAR LA PÁGINA
// =============================== 
document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('carrusel-section')) {
        inicializarCarrusel();
    }
});
