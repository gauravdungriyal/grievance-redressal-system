export function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'glass';
    toast.style.padding = '1rem 1.5rem';
    toast.style.marginBottom = '1rem';
    toast.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
    toast.style.borderLeft = `5px solid ${type === 'success' ? '#10b981' : '#ef4444'}`;
    toast.style.animation = 'slideIn 0.3s ease-out';
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}" style="color: ${type === 'success' ? '#10b981' : '#ef4444'}"></i>
            <span>${message}</span>
        </div>
    `;
    container.appendChild(toast);
    lucide.createIcons();

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        toast.style.transition = 'all 0.5s ease-in';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}

export function renderSidebar(container, user, navigate, logout) {
    container.innerHTML = `
        <div class="sidebar">
            <div>
                <div class="logo">
                    <img src="assets/logo.svg" alt="CS Redressal System Logo" style="width: 32px; height: 32px;">
                    CS Redressal System
                </div>
                <ul class="nav-links">
                    <li class="nav-item active" id="nav-home">
                        <i data-lucide="layout-dashboard"></i> Dashboard
                    </li>
                </ul>
            </div>

            <div>
                ${user.role === 'student' ? `
                    <div class="nav-item" id="nav-notifications">
                        <i data-lucide="bell"></i> Notifications
                        <span id="nav-badge" class="badge" style="display: none;">0</span>
                    </div>
                ` : ''}
                <div class="nav-item" id="theme-toggle">
                    <i data-lucide="moon"></i> Dark Mode
                </div>
                <div class="nav-item" id="logout-btn" style="color: #ef4444;">
                    <i data-lucide="log-out"></i> Logout
                </div>
                <div style="margin-top: 1rem; padding: 1rem; border-top: 1px solid var(--border-light);">
                    <p style="font-size: 0.8rem; opacity: 0.7;">Logged in as</p>
                    <p style="font-weight: 600;">${user.name}</p>
                    <p style="font-size: 0.8rem; opacity: 0.7;">${user.scholar_id}</p>
                </div>
            </div>
        </div>
    `;

    document.getElementById('logout-btn').onclick = logout;
    document.getElementById('theme-toggle').onclick = () => window.app.toggleTheme();
    document.getElementById('nav-home').onclick = () => navigate('dashboard');
    if (user.role === 'student') {
        document.getElementById('nav-notifications').onclick = () => navigate('notifications');
    }
    lucide.createIcons();
}
