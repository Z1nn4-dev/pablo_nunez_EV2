// =============================== 
// ARCHIVO DE SCRIPT JAVASCRIPT: APP.JS
// Lógica del formulario de inscripción (registro.html)
// Usa validarDatos() y actualizarDOM() de validacion.js
// Usa registerUser() de user_data.js
// =============================== 

document.addEventListener("DOMContentLoaded", function () {
    var form = document.getElementById("registroForm");
    if (!form) return;

    form.addEventListener("submit", function (e) {
        e.preventDefault();

        // Recopilar datos del formulario en un objeto
        var formData = {
            nombre: document.getElementById("nombre").value,
            correo: document.getElementById("correo").value,
            direccion: document.getElementById("direccion").value,
            password: document.getElementById("password").value
        };

        // Definir campos obligatorios para la inscripción
        var camposRequeridos = ['nombre', 'correo', 'direccion', 'password'];

        // Usar la función modular validarDatos() de validacion.js
        var resultado = validarDatos(formData, camposRequeridos);

        if (!resultado.valido) {
            // Mostrar el primer error usando actualizarDOM()
            actualizarDOM("mensaje", resultado.errores[0], "error");
            return;
        }

        // Intentar registrar al usuario usando user_data.js
        var resultadoRegistro = registerUser(
            formData.nombre,
            formData.correo,
            formData.direccion,
            formData.password
        );

        if (resultadoRegistro.success) {
            actualizarDOM("mensaje", resultadoRegistro.message + " Redirigiendo...", "exito");
            setTimeout(function () {
                window.location.href = "acceder.html";
            }, 1500);
        } else {
            actualizarDOM("mensaje", resultadoRegistro.message, "error");
        }
    });
});
