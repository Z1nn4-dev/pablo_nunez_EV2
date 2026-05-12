// =============================== 
// ARCHIVO DE SCRIPT JAVASCRIPT: LISTAS.JS 
// =============================== 

function getLists() {
    const user = getCurrentUser();
    if (!user) return null;

    const userName = user.nombre || user.username;
    const listsStr = localStorage.getItem(`cronogame_lists_${userName}`);
    if (!listsStr) return {};
    return JSON.parse(listsStr);
}

function saveLists(listsObj) {
    const user = getCurrentUser();
    if (!user) return;
    const userName = user.nombre || user.username;
    localStorage.setItem(`cronogame_lists_${userName}`, JSON.stringify(listsObj));
}

function createList(listName) {
    const lists = getLists();
    if (!lists) return false;
    if (lists[listName]) return false; // Already exists

    lists[listName] = [];
    saveLists(lists);
    return true;
}

function addGameToList(listName, gameObj, status, rating = null) {
    // status: 1: Deseo jugar, 2: Jugando, 3: Juego finalizado
    const lists = getLists();
    if (!lists || !lists[listName]) return false;

    const existingIndex = lists[listName].findIndex(g => g.id === gameObj.id);

    const savedGame = {
        ...gameObj,
        userStatus: status, // "deseo", "jugando", "finalizado"
        userRating: rating,
        addedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
        lists[listName][existingIndex] = savedGame;
    } else {
        lists[listName].push(savedGame);
    }

    saveLists(lists);
    return true;
}

function removeGameFromList(listName, gameId) {
    const lists = getLists();
    if (!lists || !lists[listName]) return false;

    lists[listName] = lists[listName].filter(g => g.id !== Number(gameId) && g.id !== String(gameId));
    saveLists(lists);
    return true;
}

function getStatusLabel(statusNum) {
    switch (String(statusNum)) {
        case "1": return "Deseo jugar";
        case "2": return "Jugando";
        case "3": return "Juego finalizado";
        default: return "Desconocido";
    }
}

function getStatusColor(statusNum) {
    switch (String(statusNum)) {
        case "1": return "#ffae42"; // Amarillento
        case "2": return "#00ce7a"; // Verde
        case "3": return "#2196f3"; // Azul
        default: return "#888";
    }
}

// --- LOGICA MODAL DE AÑADIR A LISTAS ---
let currentGameToAdd = null;

function openAddModal(gameId, gameName, gameImage, gameReleased, gameMetacritic) {
    if (!getCurrentUser()) {
        if (typeof showToast === 'function') {
            showToast("Debes tener una sesión activa o perfil para agregar juegos a tus listas.", "error");
        } else {
            alert("Debes tener una sesión activa o perfil para agregar juegos a tus listas.");
        }
        setTimeout(() => { window.location.href = "acceder.html"; }, 1500);
        return;
    }

    currentGameToAdd = {
        id: gameId,
        name: decodeURIComponent(gameName),
        background_image: gameImage,
        released: gameReleased,
        metacritic: gameMetacritic
    };

    const lists = getLists();
    let optionsHtml = '';
    for (let listName in lists) {
        optionsHtml += `<option value="${listName}">${listName}</option>`;
    }

    if (Object.keys(lists).length === 0) {
        optionsHtml = `<option value="">No tienes listas (Ve a Mis Listas para crear una)</option>`;
    }

    let modal = document.getElementById('add-game-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'add-game-modal';
        modal.className = 'light-theme-compatible';
        modal.style.cssText = `position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; display:flex; justify-content:center; align-items:center;`;
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div style="background:#1a1a1a; padding:30px; border-radius:12px; border:1px solid #333; width:90%; max-width:400px; position:relative;" class="modal-content">
            <button onclick="closeAddModal()" class="close-btn" style="position:absolute; top:10px; right:15px; background:transparent; border:none; color:inherit; font-size:1.5rem; cursor:pointer;">&times;</button>
            <h3 style="margin-top:0; margin-bottom:20px;">Añadir Juego</h3>
            <p style="margin-bottom:20px; color:#00ce7a; font-weight:bold;">${currentGameToAdd.name}</p>
            
            <label style="display:block; margin-bottom:8px; color:inherit;">Selecciona una de tus Listas</label>
            <select id="modal-list-select" style="width:100%; padding:12px; margin-bottom:20px; background:#111; color:inherit; border:1px solid #333; border-radius:6px;">
                ${optionsHtml}
            </select>
            
            <label style="display:block; margin-bottom:8px; color:inherit;">Estado del Juego</label>
            <select id="modal-status-select" onchange="window.toggleRatingInput()" style="width:100%; padding:12px; margin-bottom:15px; background:#111; color:inherit; border:1px solid #333; border-radius:6px;">
                <option value="1">Deseo jugar</option>
                <option value="2">Jugando</option>
                <option value="3">Juego finalizado</option>
            </select>
            
            <div id="rating-container" style="display:none; margin-bottom:25px;">
                <label style="display:block; margin-bottom:8px; color:inherit;">Nota Personal (1-10)</label>
                <input type="number" id="modal-rating-input" min="1" max="10" placeholder="Ej. 9" style="width:100%; padding:12px; background:#111; color:inherit; border:1px solid #333; border-radius:6px; box-sizing:border-box;">
            </div>
            
            <button onclick="confirmAddGame()" style="width:100%; padding:15px; background:#00ce7a; color:white; border:none; border-radius:6px; font-weight:600; font-size:1.1rem; cursor:pointer;">Guardar en tu cuenta</button>
        </div>
    `;

    modal.style.display = 'flex';
}

function closeAddModal() {
    const modal = document.getElementById('add-game-modal');
    if (modal) modal.style.display = 'none';
}

window.toggleRatingInput = function () {
    const status = document.getElementById('modal-status-select').value;
    const ratingContainer = document.getElementById('rating-container');
    if (status === '3') {
        ratingContainer.style.display = 'block';
    } else {
        ratingContainer.style.display = 'none';
        document.getElementById('modal-rating-input').value = '';
    }
}

function confirmAddGame() {
    const listSelect = document.getElementById('modal-list-select').value;
    const statusSelect = document.getElementById('modal-status-select').value;
    const ratingInput = document.getElementById('modal-rating-input');

    if (!listSelect) {
        showToast("Debes seleccionar y elegir una lista.", "error");
        return;
    }

    let finalRating = null;
    if (statusSelect === '3') {
        const ratingNum = parseInt(ratingInput.value, 10);
        if (!ratingNum || ratingNum < 1 || ratingNum > 10) {
            showToast("Para juegos finalizados, debes ingresar una nota válida del 1 al 10.", "error");
            return;
        }
        finalRating = ratingNum;
    }

    if (addGameToList(listSelect, currentGameToAdd, statusSelect, finalRating)) {
        closeAddModal();
        showToast("¡" + currentGameToAdd.name + " añadido exitosamente a la lista '" + listSelect + "'!", "success");
    } else {
        showToast("Hubo un error al guardar el juego en tu disco local.", "error");
    }
}
