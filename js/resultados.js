// =============================== 
// ARCHIVO DE SCRIPT JAVASCRIPT: RESULTADOS.JS 
// =============================== 

const apiKey = '447bfa68c64d4608a0d0cfdcd210596d';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');

    if (query) {
        document.getElementById('search-title').innerText = `Más resultados para: "${query}"`;
        fetchResults(query);
    } else {
        document.getElementById('search-title').innerText = "No se ha ingresado ninguna búsqueda.";
        document.getElementById('resultados-list').innerHTML = "";
    }
});

async function fetchResults(query) {
    const divList = document.getElementById('resultados-list');
    const url = `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(query)}&page_size=15`;

    try {
        const response = await fetch(url);
        const result = await response.json();

        divList.innerHTML = ''; // Quitar el spinner de carga

        if (result.results && result.results.length > 0) {
            result.results.forEach(game => {
                const horas = game.playtime;
                const textoHoras = horas > 0 ? `${horas} horas estimadas` : 'Sin datos de duración';
                const metacritic = game.metacritic ? `<span style="color: #00ce7a; margin-left: 15px; font-weight:600; font-size:0.9rem;">⭐ Metacritic: ${game.metacritic}</span>` : '';
                const imagen = game.background_image ? `<img src="${game.background_image}" style="width: 150px; height: 100px; object-fit:cover; border-radius:6px; flex-shrink: 0;">` : `<div class="no-image-placeholder" style="width:150px; height:100px; background-color:#2a2a2a; border-radius:6px; display:flex; align-items:center; justify-content:center; flex-shrink: 0;">No Image</div>`;

                const addToListHtml = `<button onclick="openAddModal('${game.id}', '${encodeURIComponent(game.name)}', '${game.background_image || ''}', '${game.released}', '${game.metacritic}')" class="add-to-list-btn" style="width:auto; margin-top:5px; padding: 6px 12px; font-size:0.8rem;">+ Lista</button>`;

                divList.innerHTML += `
                    <div class="resultado-item" style="display:flex; flex-wrap:wrap; gap: 20px; background-color: #171717; padding: 20px; border-radius: 8px; border: 1px solid #2a2a2a; align-items: center; transition: all 0.2s ease;">
                        ${imagen}
                        <div style="flex:1; min-width:200px;">
                            <h3 style="margin: 0 0 10px 0; font-size:1.3rem;">${game.name} ${metacritic}</h3>
                            <p class="text-secondary" style="margin:0; font-size:0.9rem;">Lanzamiento: ${game.released || 'TBA'}</p>
                            <p class="text-primary" style="margin:8px 0 0 0;"><strong>⏳ ${textoHoras}</strong></p>
                        </div>
                        <div>
                            ${addToListHtml}
                        </div>
                    </div>
                `;
            });
        } else {
            divList.innerHTML = "<p>No se encontraron más resultados para tu búsqueda.</p>";
        }
    } catch (error) {
        console.error(error);
        divList.innerHTML = "<p>Comprueba tu conexión. Ha ocurrido un error solicitando la información a RAWG.</p>";
    }
}
