// =============================== 
// ARCHIVO DE SCRIPT JAVASCRIPT: MAIN.JS 
// =============================== 

const apiKey = '447bfa68c64d4608a0d0cfdcd210596d';
let debounceTimer;
let currentAbortController = null;
const autocompleteCache = new Map();

// --- GALLERY LOGIC ---
let galleryImages = [];
let currentGalleryIndex = 0;
window.touchstartX = 0;
window.touchendX = 0;

window.ejecutarCalculo = function (horasTotales) {
    const horasSemanales = parseFloat(document.getElementById('dinamicoHoras').value);
    const resDiv = document.getElementById('dinamicoEstimacionRes');

    if (!horasSemanales || horasSemanales <= 0) {
        resDiv.innerHTML = `<p style="color:#ff4444; margin-top:10px;">Por favor ingresa un número válido.</p>`;
        return;
    }

    const semanas = (horasTotales / horasSemanales).toFixed(1);
    let textoSemanas = '';
    if (semanas < 1) {
        textoSemanas = "Menos de 1 semana";
    } else if (semanas === "1.0") {
        textoSemanas = "1 a 2 semanas";
    } else {
        textoSemanas = `${semanas} semanas`;
    }

    resDiv.innerHTML = `
        <div class="estimacion">
            <p>A tu ritmo, terminarás este juego en aproximadamente <strong>${textoSemanas}</strong>.</p>
        </div>
    `;
};

window.handleGesture = function () {
    if (window.touchendX < window.touchstartX - 50) {
        cambiarImagen(1); // Deslizar izquierda -> Siguiente
    } else if (window.touchendX > window.touchstartX + 50) {
        cambiarImagen(-1); // Deslizar derecha -> Anterior
    }
};

window.cambiarImagen = function (dir) {
    if (galleryImages.length === 0) return;
    currentGalleryIndex = (currentGalleryIndex + dir + galleryImages.length) % galleryImages.length;
    document.getElementById('gallery-main-img').src = galleryImages[currentGalleryIndex].image;
    document.getElementById('gallery-counter').innerText = `${currentGalleryIndex + 1} / ${galleryImages.length}`;
};

const iconMap = {
    'steam': 'steam',
    'playstation-store': 'playstation',
    'xbox-store': 'xbox',
    'xbox360': 'xbox',
    'apple-appstore': 'appstore',
    'gog': 'gogdotcom',
    'nintendo': 'nintendo',
    'google-play': 'googleplay',
    'itch': 'itchdotio',
    'epic-games': 'epicgames'
};

document.addEventListener('DOMContentLoaded', () => {
    const inputJuego = document.getElementById('nombreJuego');

    if (inputJuego) {
        inputJuego.addEventListener('input', function () {
            clearTimeout(debounceTimer);
            const val = this.value;
            closeAllLists();

            if (!val || val.length < 3) return false;

            debounceTimer = setTimeout(() => {
                fetchAutocomplete(val);
            }, 250); // Reducido de 500ms a 250ms para mayor inmediatez
        });
    }

    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });

    if (document.getElementById('offers-section')) {
        fetchSpecialOffers();
    }
});

async function fetchAutocomplete(query) {
    try {
        const inputJuego = document.getElementById('nombreJuego');
        
        // 1. Cancelar cualquier petición anterior que siga en curso
        if (currentAbortController) {
            currentAbortController.abort();
        }
        currentAbortController = new AbortController();
        const signal = currentAbortController.signal;

        let data;
        
        // 2. Revisar si ya buscamos esto antes (caché en memoria)
        const cacheKey = query.toLowerCase();
        if (autocompleteCache.has(cacheKey)) {
            data = autocompleteCache.get(cacheKey);
        } else {
            // 3. Petición a la API si no está en caché
            const url = `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(query)}&page_size=5`;
            const resp = await fetch(url, { signal });
            data = await resp.json();
            
            // Guardar resultados en caché (limitando el tamaño del caché si queremos, aquí solo guardamos)
            autocompleteCache.set(cacheKey, data);
        }

        // Si el valor del input ya cambió mientras esperábamos la API, no hacer nada
        if (inputJuego.value.toLowerCase() !== cacheKey) return;

        let a = document.createElement("DIV");
        a.setAttribute("id", inputJuego.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        inputJuego.parentNode.insertBefore(a, inputJuego.nextSibling);

        if (data.results) {
            data.results.forEach(game => {
                let b = document.createElement("DIV");
                b.setAttribute("class", "autocomplete-item");
                b.innerHTML = `<strong>${game.name}</strong>`;
                b.innerHTML += `<input type='hidden' value='${game.name}'>`;

                b.addEventListener("click", function () {
                    inputJuego.value = this.getElementsByTagName("input")[0].value;
                    closeAllLists();
                    consultarAPI();
                });
                a.appendChild(b);
            });
        }
    } catch (e) {
        if (e.name === 'AbortError') {
            // Petición cancelada porque el usuario siguió escribiendo, ignorar el error silenciosamente
            console.log("Búsqueda cancelada:", query);
        } else {
            console.error("Error en autocompletado:", e);
        }
    }
}

function closeAllLists(elmnt) {
    const inputJuego = document.getElementById('nombreJuego');
    const x = document.getElementsByClassName("autocomplete-items");
    for (let i = 0; i < x.length; i++) {
        if (elmnt != x[i] && elmnt != inputJuego) {
            x[i].parentNode.removeChild(x[i]);
        }
    }
}

async function consultarAPI() {
    const inputJuego = document.getElementById('nombreJuego');
    const divResultado = document.getElementById('resultado');

    const juego = inputJuego.value;
    if (!juego) return;

    closeAllLists();

    const offersSection = document.getElementById('offers-section');
    if (offersSection) offersSection.style.display = 'none';

    // SPINNER DE CARGA
    divResultado.innerHTML = `
        <div class="spinner-container">
            <div class="loader"></div>
            <p class="text-secondary" style="margin-top: 15px;">Consultando la inmensa base de datos de RAWG...</p>
        </div>
    `;
    divResultado.style.display = 'flex';

    const url = `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(juego)}`;

    try {
        const response = await fetch(url);
        const result = await response.json();

        if (result.results && result.results.length > 0) {
            const primerResultado = result.results[0];
            const nombre = primerResultado.name;
            const horas = primerResultado.playtime;
            const imagen = primerResultado.background_image;
            const metacritic = primerResultado.metacritic;
            const stores = primerResultado.stores || [];
            const gameId = primerResultado.id;
            const screenshots = primerResultado.short_screenshots || [];

            let storesLinks = [];
            if (stores.length > 0) {
                try {
                    const storesRes = await fetch(`https://api.rawg.io/api/games/${gameId}/stores?key=${apiKey}`);
                    const storesJson = await storesRes.json();
                    storesLinks = storesJson.results || [];
                } catch (e) {
                    console.error("Error al obtener enlaces de compra:", e);
                }
            }

            let textoHoras = horas > 0 ? `${horas} horas en promedio` : 'Dato de duración no disponible';

            // CALCULADORA DINAMICA
            let calculadoraHtml = '';
            if (horas > 0) {
                calculadoraHtml = `
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #333;" class="light-theme-border">
                        <label style="display:block; margin-bottom: 8px;">¿Cuántas horas jugarás a la semana?</label>
                        <div style="display:flex; gap:10px;">
                            <input type="number" id="dinamicoHoras" placeholder="Ej. 10" min="1" style="flex:1;">
                            <button onclick="ejecutarCalculo(${horas})">Calcular Tiempos</button>
                        </div>
                        <div id="dinamicoEstimacionRes"></div>
                    </div>
                `;
            }

            let metacriticHtml = metacritic ? `<p class="metacritic">Metacritic: <strong>${metacritic}/100</strong></p>` : '';

            let scoresHtmlFinal = '';
            if (metacriticHtml) {
                scoresHtmlFinal = `
                    <div class="scores-container">
                        ${metacriticHtml}
                    </div>
                `;
            }

            let storesHtml = '';
            if (stores.length > 0) {
                storesHtml = `<div class="stores-section">
                    <p><strong>Comprar en:</strong></p>
                    <div class="stores-logos">`;

                stores.forEach(s => {
                    const rawgSlug = s.store.slug;
                    const iconSlug = iconMap[rawgSlug];
                    const linkObj = storesLinks.find(link => link.store_id === s.store.id);
                    const storeUrl = linkObj ? linkObj.url : '#';

                    let iconHtml = '';
                    if (rawgSlug === 'xbox-store' || rawgSlug === 'xbox360') {
                        iconHtml = `<img src="https://upload.wikimedia.org/wikipedia/commons/f/f9/Xbox_one_logo.svg" alt="${s.store.name}" class="store-icon" style="filter: brightness(0) invert(1);">`;
                    } else if (iconSlug) {
                        iconHtml = `<img src="https://cdn.simpleicons.org/${iconSlug}/ffffff" alt="${s.store.name}" class="store-icon" onerror="this.onerror=null; this.outerHTML='<span class=\\'store-icon\\' style=\\'font-size: 24px; display:inline-block; line-height:28px;\\'>🎮</span>';">`;
                    } else {
                        iconHtml = `<span class="store-icon" style="font-size: 24px; display:inline-block; line-height:28px;">🎮</span>`;
                    }

                    storesHtml += `<a href="${storeUrl}" target="_blank" rel="noopener noreferrer" class="store-placeholder" title="Comprar ${nombre} en ${s.store.name}">
                        ${iconHtml}
                        <span class="store-name">${s.store.name}</span>
                    </a>`;
                });
                storesHtml += `</div></div>`;
            }

            // GALLERY HTML
            let imgHtml = '';
            const fotosLimitadas = screenshots.slice(0, 5);
            if (fotosLimitadas.length > 1) {
                // Populate global array
                galleryImages = fotosLimitadas;
                currentGalleryIndex = 0;

                // Clear any existing interval
                if (window.galleryInterval) clearInterval(window.galleryInterval);

                // Auto change every 3 seconds
                window.galleryInterval = setInterval(() => {
                    cambiarImagen(1);
                }, 3000);

                imgHtml = `
                    <div class="gallery-container">
                        <img id="gallery-main-img" src="${galleryImages[0].image}" alt="Captura de ${nombre}" class="game-cover" 
                            style="cursor: grab;" draggable="false"
                            ontouchstart="window.touchstartX = event.changedTouches[0].screenX" 
                            ontouchend="window.touchendX = event.changedTouches[0].screenX; window.handleGesture()"
                            onmousedown="window.touchstartX = event.screenX"
                            onmouseup="window.touchendX = event.screenX; window.handleGesture()">
                        <button onclick="cambiarImagen(-1)" class="gallery-btn prev">❮</button>
                        <button onclick="cambiarImagen(1)" class="gallery-btn next">❯</button>
                        <div id="gallery-counter" class="gallery-counter">1 / ${galleryImages.length}</div>
                    </div>
                `;
            } else if (imagen) {
                imgHtml = `<img src="${imagen}" alt="Portada de ${nombre}" class="game-cover">`;
            }

            // MOSTRAR MAS RESULTADOS BOTON
            let verMasHtml = '';
            if (result.count > 1) {
                verMasHtml = `<a href="resultados.html?q=${encodeURIComponent(juego)}" class="ver-mas-btn">Ver más opciones de juegos (${result.count})</a>`;
            }

            // BOTÓN DE AÑADIR A MI LISTA
            let addToListHtml = `<button onclick="openAddModal('${gameId}', '${encodeURIComponent(nombre)}', '${imagen}', '${primerResultado.released}', '${metacritic}')" class="add-to-list-btn">+ Añadir a mis Listas</button>`;

            divResultado.innerHTML = `
                ${imgHtml}
                <div class="resultado-info">
                    <h3>${nombre}</h3>
                    ${scoresHtmlFinal}
                    ${addToListHtml}
                    <p style="margin-top:15px; font-size:1.1rem; color:var(--text-primary);"><strong>Duración total del juego:</strong> ${textoHoras}</p>
                    ${calculadoraHtml}
                    ${storesHtml}
                    ${verMasHtml}
                </div>
            `;
        } else {
            divResultado.innerHTML = "<p>No se encontraron juegos con ese nombre.</p>";
        }

    } catch (error) {
        console.error("Detalle del error:", error);
        divResultado.innerHTML = "<p>Hubo un error de conexión con RAWG. Verifica tu internet.</p>";
    }
}

// --- STEAM SPECIAL OFFERS API ---
async function fetchSpecialOffers() {
    const offersContainer = document.getElementById('offers-container');
    if (!offersContainer) return;

    try {
        const url = 'https://steamgames-special-offers.p.rapidapi.com/games_list/?start=0&count=10&region=US';
        const options = {
            method: 'GET',
            headers: {
                'X-Rapidapi-Key': 'fd5d9d9ef7mshe6149d7dec3f1bep17a25ejsn79404251fa70',
                'X-Rapidapi-Host': 'steamgames-special-offers.p.rapidapi.com',
                'Content-Type': 'application/json'
            }
        };

        const response = await fetch(url, options);
        if (!response.ok) throw new Error('API error obteniendo ofertas');

        const data = await response.json();

        const arrayData = Array.isArray(data) ? data : (data.results || data.games || data.data || []);

        if (arrayData.length === 0) {
            offersContainer.innerHTML = '<p class="text-secondary">No se encontraron ofertas en este momento.</p>';
            return;
        }

        let html = '';
        const limit = arrayData.slice(0, 8); // Top 8 

        limit.forEach(game => {
            const title = game.title || game.name || 'Juego en Oferta';

            // Try to extract standard Steam API response fields, fallback if needed
            const rawDiscount = game.discount_percent || game.discount || 0;
            const discount = rawDiscount ? `-${rawDiscount}%` : '';

            const newPrice = game.final_price || game.price || game.current_price || 'N/A';
            const oldPrice = game.initial_price || game.original_price || '';

            // Banner/Links
            const imgUrl = game.header_image || game.image || game.thumbnail || 'Images/logo.png';
            const link = game.url || game.link || (game.steam_id ? `https://store.steampowered.com/app/${game.steam_id}` : '#');

            let priceHtml = '';
            if (discount) {
                priceHtml = `
                    <span class="offer-discount">${discount}</span>
                    <div class="offer-prices">
                        <span class="offer-old-price">${oldPrice}</span>
                        <span class="offer-new-price">${newPrice}</span>
                    </div>
                `;
            } else {
                priceHtml = `
                    <div class="offer-prices">
                        <span class="offer-new-price">${newPrice}</span>
                    </div>
                `;
            }

            html += `
                <a href="${link}" target="_blank" rel="noopener noreferrer" class="offer-card">
                    <img src="${imgUrl}" alt="${title}" onerror="this.src='Images/logo.png'">
                    <div class="offer-content">
                        <h4 class="offer-title">${title}</h4>
                        <div class="offer-price-row">
                            ${priceHtml}
                        </div>
                    </div>
                </a>
            `;
        });

        offersContainer.innerHTML = html;

    } catch (error) {
        console.error("Error obteniendo ofertas de Steam:", error);
        offersContainer.innerHTML = '<p class="text-secondary">No se pudieron cargar las ofertas de Steam. Verifica tu conexión a internet.</p>';
    }
}

