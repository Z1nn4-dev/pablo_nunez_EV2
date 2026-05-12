// =============================== 
// ARCHIVO DE SCRIPT JAVASCRIPT: VALIDACION.JS
// Módulo central de validación de formularios
// Funciones modulares: validarDatos(), actualizarDOM(), validarEmail(), sanitizarInput()
// =============================== 

/**
 * sanitizarInput(texto)
 * Limpia caracteres peligrosos para prevenir ataques XSS.
 * Recomendación de seguridad sugerida por IA: escapar caracteres HTML especiales.
 * @param {string} texto - Texto a sanitizar
 * @returns {string} Texto limpio y seguro
 */
function sanitizarInput(texto) {
    if (typeof texto !== 'string') return '';
    return texto
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .trim();
}

/**
 * validarEmail(email)
 * Valida que el correo electrónico tenga un formato correcto usando expresión regular.
 * Patrón sugerido por IA para cubrir la mayoría de correos válidos.
 * @param {string} email - Dirección de correo a validar
 * @returns {boolean} true si el formato es válido
 */
function validarEmail(email) {
    // Expresión regular para validar formato de email (recomendación IA)
    var regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regexEmail.test(email);
}

/**
 * actualizarDOM(elementId, mensaje, tipo)
 * Actualiza un elemento del DOM con un mensaje de error o éxito.
 * Modifica el contenido de texto y el color según el tipo.
 * @param {string} elementId - ID del elemento HTML a actualizar
 * @param {string} mensaje - Mensaje a mostrar
 * @param {string} tipo - "error" (rojo), "exito" (verde), o "info" (gris)
 */
function actualizarDOM(elementId, mensaje, tipo) {
    var elemento = document.getElementById(elementId);
    if (!elemento) return;

    elemento.textContent = mensaje;

    // Asignar color según el tipo de mensaje
    switch (tipo) {
        case 'error':
            elemento.style.color = '#ff4444';
            break;
        case 'exito':
            elemento.style.color = '#00ce7a';
            break;
        case 'info':
            elemento.style.color = '#aaaaaa';
            break;
        default:
            elemento.style.color = '#e0e0e0';
    }
}

/**
 * validarDatos(formData, camposRequeridos)
 * Función principal de validación. Recibe un objeto con los campos del formulario
 * y retorna un objeto con el resultado de la validación.
 * 
 * @param {Object} formData - Objeto con los datos del formulario
 *   Ejemplo: { nombre: "Juan", correo: "juan@mail.com", password: "123" }
 * @param {Array} camposRequeridos - Lista de nombres de campos obligatorios
 *   Ejemplo: ["nombre", "correo", "password"]
 * @returns {Object} { valido: boolean, errores: string[] }
 */
function validarDatos(formData, camposRequeridos) {
    var errores = [];

    // 1. Verificar campos vacíos
    camposRequeridos.forEach(function(campo) {
        var valor = formData[campo];
        if (valor === undefined || valor === null || valor.toString().trim() === '') {
            // Capitalizar nombre del campo para el mensaje
            var nombreCampo = campo.charAt(0).toUpperCase() + campo.slice(1);
            errores.push('El campo "' + nombreCampo + '" es obligatorio.');
        }
    });

    // Si hay campos vacíos, retornar sin verificar formato
    if (errores.length > 0) {
        return { valido: false, errores: errores };
    }

    // 2. Validar formato de correo electrónico si existe el campo
    if (formData.correo !== undefined && formData.correo !== '') {
        if (!validarEmail(formData.correo)) {
            errores.push('El formato del correo electrónico no es válido.');
        }
    }

    // También verificar campo "email" (para formulario de contacto)
    if (formData.email !== undefined && formData.email !== '') {
        if (!validarEmail(formData.email)) {
            errores.push('El formato del correo electrónico no es válido.');
        }
    }

    // 3. Validar longitud mínima de contraseña (seguridad sugerida por IA)
    if (formData.password !== undefined && formData.password !== '') {
        if (formData.password.length < 6) {
            errores.push('La contraseña debe tener al menos 6 caracteres.');
        }
    }

    // 4. Sanitizar todos los campos de texto
    for (var clave in formData) {
        if (typeof formData[clave] === 'string') {
            formData[clave] = sanitizarInput(formData[clave]);
        }
    }

    return {
        valido: errores.length === 0,
        errores: errores
    };
}
