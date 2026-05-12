// =============================== 
// ARCHIVO DE SCRIPT JAVASCRIPT: CONTACTO.JS
// Lógica del formulario de contacto
// Usa validarDatos() y actualizarDOM() de validacion.js
// =============================== 

document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('contactoForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Recopilar datos del formulario en un objeto
        var formData = {
            nombre: document.getElementById('contacto-nombre').value,
            email: document.getElementById('contacto-email').value,
            mensaje: document.getElementById('contacto-mensaje').value
        };

        // Campos obligatorios del formulario de contacto
        var camposRequeridos = ['nombre', 'email', 'mensaje'];

        // Usar la función modular validarDatos() de validacion.js
        var resultado = validarDatos(formData, camposRequeridos);

        if (!resultado.valido) {
            // Mostrar el primer error usando actualizarDOM()
            actualizarDOM('contacto-mensaje-estado', resultado.errores[0], 'error');
            return;
        }

        // Si la validación es exitosa, mostrar mensaje de éxito
        actualizarDOM('contacto-mensaje-estado', '¡Mensaje enviado con éxito! Te responderemos pronto.', 'exito');

        // Limpiar formulario
        form.reset();

        // Limpiar mensaje después de 4 segundos
        setTimeout(function () {
            actualizarDOM('contacto-mensaje-estado', '', 'info');
        }, 4000);
    });
});
