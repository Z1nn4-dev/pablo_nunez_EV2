// =============================== 
// ARCHIVO DE SCRIPT JAVASCRIPT: USER_DATA.JS 
// =============================== 

// Obtener todos los usuarios registrados
function getUsers() {
    const usersStr = localStorage.getItem('cronogame_users');
    if (!usersStr) {
        return [];
    }
    return JSON.parse(usersStr);
}

// Guardar los usuarios
function saveUsers(usersArray) {
    localStorage.setItem('cronogame_users', JSON.stringify(usersArray));
}

// Registrar un usuario nuevo
function registerUser(nombre, correo, direccion, password) {
    const users = getUsers();
    
    // Validar si el usuario o correo ya existen
    const exists = users.find(u => u.nombre.toLowerCase() === nombre.toLowerCase() || u.correo.toLowerCase() === correo.toLowerCase());
    if (exists) {
        return { success: false, message: "El nombre de usuario o correo ya están en uso." };
    }
    
    const newUser = {
        nombre: nombre.trim(),
        correo: correo.trim(),
        direccion: direccion.trim(),
        password: password,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    // Initialize default lists if they don't exist for this user
    if (!localStorage.getItem(`cronogame_lists_${newUser.nombre}`)) {
        const defaultLists = {
            "Favoritos": [],
            "Juegos Pendientes": []
        };
        localStorage.setItem(`cronogame_lists_${newUser.nombre}`, JSON.stringify(defaultLists));
    }
    
    return { success: true, message: "Usuario registrado con éxito." };
}

// Autenticar un usuario (login)
function authenticateUser(identifier, password) {
    const users = getUsers();
    
    const user = users.find(u => 
        (u.nombre.toLowerCase() === identifier.toLowerCase() || u.correo.toLowerCase() === identifier.toLowerCase()) && 
        u.password === password
    );
    
    if (user) {
        return { success: true, user: user };
    }
    
    return { success: false, message: "Usuario o contraseña incorrectos." };
}
