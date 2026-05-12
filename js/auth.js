// =============================== 
// ARCHIVO DE SCRIPT JAVASCRIPT: AUTH.JS
// Autenticación de usuarios (login/logout)
// Usa validarDatos() y actualizarDOM() de validacion.js
// Usa authenticateUser() de user_data.js
// =============================== 

// Inicializar header de autenticación al cargar
document.addEventListener('DOMContentLoaded', function () {
    actualizarHeaderAuth();
});

// =============================== 
// loginFormSubmit(e)
// Maneja el envío del formulario de login.
// Valida los datos con validarDatos() y autentica con authenticateUser().
// =============================== 
function loginFormSubmit(e) {
    e.preventDefault();

    // Recopilar datos del formulario en un objeto
    var formData = {
        usuario: document.getElementById('auth-username').value,
        password: document.getElementById('auth-password').value
    };

    // Definir campos requeridos para el login
    var camposRequeridos = ['usuario', 'password'];

    // Usar la función modular validarDatos() de validacion.js
    var resultado = validarDatos(formData, camposRequeridos);

    if (!resultado.valido) {
        // Mostrar error usando actualizarDOM()
        actualizarDOM('login-mensaje', resultado.errores[0], 'error');
        return false;
    }

    // Autenticar usuario con user_data.js
    var resultadoAuth = authenticateUser(formData.usuario.trim(), formData.password);

    if (resultadoAuth.success) {
        localStorage.setItem('cronogame_user', JSON.stringify(resultadoAuth.user));
        window.location.href = "mis-listas.html";
    } else {
        actualizarDOM('login-mensaje', resultadoAuth.message, 'error');
    }

    return false;
}

// =============================== 
// logout()
// Cierra la sesión del usuario eliminando datos de localStorage.
// =============================== 
function logout() {
    localStorage.removeItem('cronogame_user');
    window.location.href = "index.html";
}

// =============================== 
// getCurrentUser()
// Obtiene el objeto del usuario actualmente logueado desde localStorage.
// @returns {Object|null} Objeto del usuario o null si no hay sesión
// =============================== 
function getCurrentUser() {
    var userStr = localStorage.getItem('cronogame_user');
    if (!userStr) return null;
    return JSON.parse(userStr);
}

// =============================== 
// actualizarHeaderAuth()
// Actualiza el DOM del header para mostrar el estado de autenticación.
// Si hay usuario logueado, muestra su nombre y botón de salir.
// Si no, muestra el dropdown de Acceder/Registro.
// =============================== 
function actualizarHeaderAuth() {
    var user = getCurrentUser();
    var headerAuthContainer = document.getElementById('header-auth-container');
    if (!headerAuthContainer) return;

    if (user) {
        headerAuthContainer.innerHTML =
            '<a href="mis-listas.html" class="auth-btn user-btn" style="text-decoration:none; padding:8px 16px; border-radius:20px; font-size:0.9rem; margin-right:10px;">👤 ' + (user.nombre || user.username) + '</a>' +
            '<button onclick="logout()" class="auth-btn logout-btn" style="background:transparent; padding:8px 16px; border-radius:20px; font-size:0.9rem; cursor:pointer;">Salir</button>';
    } else {
        headerAuthContainer.innerHTML =
            '<div style="position: relative; display: inline-block;" id="auth-dropdown-container">' +
            '  <button onclick="toggleAuthDropdown()" class="auth-btn auth-login-btn" style="background:transparent; padding:8px 16px; border-radius:20px; font-size:0.9rem; font-weight:500; cursor:pointer;">Ingresar ▾</button>' +
            '  <div id="auth-dropdown-menu" style="display: none; position: absolute; right: 0; top: 100%; margin-top: 5px; background-color: #1a1a1a; border: 1px solid #333; border-radius: 8px; overflow: hidden; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.5); min-width: 120px; text-align: left;">' +
            '    <a href="acceder.html" class="dropdown-item" style="display: block; padding: 10px 15px; color: #fff; text-decoration: none; font-size: 0.9rem; border-bottom: 1px solid #333;">Acceder</a>' +
            '    <a href="registro.html" class="dropdown-item" style="display: block; padding: 10px 15px; color: #fff; text-decoration: none; font-size: 0.9rem;">Registro</a>' +
            '  </div>' +
            '</div>';
    }
}

// Toggle del dropdown de autenticación
window.toggleAuthDropdown = function () {
    var menu = document.getElementById('auth-dropdown-menu');
    if (menu) {
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    }
};

// Cerrar dropdown al hacer clic fuera
document.addEventListener('click', function (e) {
    var container = document.getElementById('auth-dropdown-container');
    if (container && !container.contains(e.target)) {
        var menu = document.getElementById('auth-dropdown-menu');
        if (menu) menu.style.display = 'none';
    }
});
