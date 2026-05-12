// =============================== 
// ARCHIVO DE SCRIPT JAVASCRIPT: THEME.JS 
// =============================== 

// Manejo del tema Claro/Oscuro
document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const root = document.documentElement;

    // Verificar si el usuario ya tenía un tema guardado
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'light') {
        root.classList.add('light-theme');
        if (themeToggleBtn) themeToggleBtn.innerHTML = '🌙 Modo Oscuro';
    } else {
        root.classList.remove('light-theme');
        if (themeToggleBtn) themeToggleBtn.innerHTML = '☀️ Modo Claro';
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            root.classList.toggle('light-theme');

            if (root.classList.contains('light-theme')) {
                localStorage.setItem('theme', 'light');
                themeToggleBtn.innerHTML = '🌙 Modo Oscuro';
            } else {
                localStorage.setItem('theme', 'dark');
                themeToggleBtn.innerHTML = '☀️ Modo Claro';
            }
        });
    }
});

// Mensajes emergentes (Toast UI)
window.showToast = function(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position:fixed; top:20px; right:20px; z-index:10000; display:flex; flex-direction:column; gap:10px; pointer-events:none;';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    const bgColor = type === 'error' ? '#ff4444' : (type === 'success' ? '#00ce7a' : '#333');
    
    toast.style.cssText = `
        background-color: ${bgColor};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        font-weight: 500;
        font-size: 0.95rem;
        opacity: 0;
        transform: translateX(50px);
        transition: opacity 0.3s ease, transform 0.3s ease;
        pointer-events: auto;
    `;
    toast.innerText = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(50px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};
