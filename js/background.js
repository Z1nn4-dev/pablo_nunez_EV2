document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // AUTO-DETECCIÓN DE GIFS (CONVENCIÓN DE NOMBRES)
    // ==========================================
    // Sistema optimizado: busca en paralelo usando requests HEAD para 
    // no descargar los GIFs enteros solo para comprobar si existen.

    const folderPath = 'Images/gif/';
    const gifsDisponibles = [];

    async function findGifs() {
        let index = 1;
        let keepSearching = true;

        const checkGif = async (i) => {
            const url = `${folderPath}${i}.gif`;
            try {
                // HEAD request es ultra rápido porque no descarga el cuerpo de la imagen
                const response = await fetch(url, { method: 'HEAD', cache: 'force-cache' });
                return response.ok ? `${i}.gif` : null;
            } catch (e) {
                // Fallback si fetch falla (ej. ejecutando localmente con file://)
                return new Promise(resolve => {
                    const img = new Image();
                    img.onload = () => resolve(`${i}.gif`);
                    img.onerror = () => resolve(null);
                    img.src = url;
                });
            }
        };

        // Comprobamos en lotes de 5 para ser rápidos y a la vez respetar el orden secuencial
        while (keepSearching) {
            const batchPromises = [];
            for (let i = 0; i < 5; i++) {
                batchPromises.push(checkGif(index + i));
            }
            const batchResults = await Promise.all(batchPromises);
            
            for (let i = 0; i < 5; i++) {
                if (batchResults[i]) {
                    gifsDisponibles.push(batchResults[i]);
                } else {
                    // Al encontrar el primer fallo, asumimos que no hay más (están nombrados 1, 2, 3...)
                    keepSearching = false; 
                    break;
                }
            }
            index += 5;
            
            // Límite de seguridad para evitar loops infinitos
            if (index > 200) break;
        }

        if (gifsDisponibles.length > 0) {
            console.log(`¡Se encontraron ${gifsDisponibles.length} GIFs rápidamente! Generando fondo...`);
            // Retrasar la construcción del mosaico ligeramente para que la UI principal se pinte primero
            requestAnimationFrame(() => {
                setTimeout(buildMosaic, 100);
            });
        } else {
            console.warn("No se encontraron archivos nombrados 1.gif, 2.gif, etc. en la carpeta " + folderPath);
        }
    }

    // Disparamos la búsqueda al cargar la página
    findGifs();

    function buildMosaic() {
        const mover = document.getElementById('bg-gif-mover');
        if (!mover) return;

        // Normalización de la resolución: formato vertical 10:16
        const tileWidth = 200;
        const tileHeight = 320;
        
        // RESTAURACIÓN DE DIMENSIONES: 
        // Debido a que el wrapper está rotado -45deg y mide 150vmax, 
        // necesitamos un área muy extensa para no dejar "hoyos" en los extremos
        // al momento de animar.
        const cols = 16;
        const rows = 10;
        const blockWidth = tileWidth * cols; // 3200px
        const blockHeight = tileHeight * rows; // 3200px

        // Usar Fragmento para minimizar repaints del DOM
        const fragment = document.createDocumentFragment();

        // 3 bloques horizontales para asegurar cobertura total durante la traslación
        for (let blockX = 0; blockX < 3; blockX++) {
            for (let col = 0; col < cols; col++) {
                const colDiv = document.createElement('div');
                colDiv.className = 'gif-column';
                colDiv.style.width = tileWidth + 'px';
                colDiv.style.position = 'absolute';
                colDiv.style.left = (blockX * blockWidth + col * tileWidth) + 'px';
                colDiv.style.willChange = 'transform'; // Sugerencia de hardware acceleration

                // Alternamos animaciones
                const isEven = (col % 2 === 0);
                colDiv.style.animation = isEven ? 'moveUp 45s linear infinite' : 'moveDown 65s linear infinite';
                
                // Las columnas que bajan deben empezar más arriba para no mostrar huecos al inicio
                if (!isEven) {
                    colDiv.style.top = `-${blockHeight}px`;
                } else {
                    colDiv.style.top = '0px';
                }

                const colTiles = [];
                for (let r = 0; r < rows; r++) {
                    let availableGifs = [...gifsDisponibles];
                    
                    if (r > 0) {
                        availableGifs = availableGifs.filter(g => g !== colTiles[r-1]);
                    }
                    if (availableGifs.length === 0) availableGifs = gifsDisponibles;

                    colTiles.push(availableGifs[Math.floor(Math.random() * availableGifs.length)]);
                }

                // 3 copias verticales para cubrir completamente el alto durante el loop
                for (let copy = 0; copy < 3; copy++) {
                    colTiles.forEach((gif) => {
                        const tile = document.createElement('div');
                        tile.className = 'gif-tile';
                        tile.style.backgroundImage = `url('${folderPath}${gif}')`;
                        tile.style.width = tileWidth + 'px';
                        tile.style.height = tileHeight + 'px';
                        tile.style.flexShrink = '0';
                        
                        const hue = Math.floor(Math.random() * 40) - 20; 
                        const brightness = 0.8 + (Math.random() * 0.4); 
                        tile.style.filter = `hue-rotate(${hue}deg) brightness(${brightness})`;

                        colDiv.appendChild(tile);
                    });
                }

                fragment.appendChild(colDiv);
            }
        }

        // Añadimos todo el DOM generado de una sola vez
        mover.appendChild(fragment);

        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes moveLeftBase {
                0% { transform: translateX(0); }
                100% { transform: translateX(-${blockWidth}px); }
            }
            #bg-gif-mover {
                animation: moveLeftBase 80s linear infinite;
            }
            @keyframes moveUp {
                0% { transform: translateY(0); }
                100% { transform: translateY(-${blockHeight}px); }
            }
            @keyframes moveDown {
                0% { transform: translateY(0); }
                100% { transform: translateY(${blockHeight}px); }
            }
        `;
        document.head.appendChild(style);

        // Precarga silenciosa: Le decimos al navegador que empiece a descargar los cuerpos 
        // reales de los GIFs. Una vez todos descargados, mostramos el mosaico entero sin huecos.
        const preloadPromises = gifsDisponibles.map(gif => {
            return new Promise(resolve => {
                const img = new Image();
                // Usamos onload y onerror para contar siempre como resuelto y no atascarse
                img.onload = resolve;
                img.onerror = resolve; 
                img.src = `${folderPath}${gif}`;
            });
        });

        // Cuando la red termina de bajar todos los GIFs
        Promise.all(preloadPromises).then(() => {
            const wrapper = document.getElementById('bg-gif-wrapper');
            if (wrapper) {
                wrapper.classList.add('loaded'); // Activa el fade-in en el CSS
            }
        });
    }
});
