import { api } from '../js/api.js';

export function renderLogin(container, navigate) {
    container.innerHTML = `
        <div class="auth-container">
            <div style="text-align: center; margin-bottom: 2rem;">
                <img src="assets/logo.svg" alt="Logo" style="width: 64px; height: 64px; margin-bottom: 1rem;">
                <h1 style="font-size: 1.5rem; color: var(--text-main); margin-bottom: 0.5rem;">CS Redressal System</h1>
                <p style="opacity: 0.7;">Welcome Back</p>
            </div>
            <form id="login-form">
                <div class="form-group">
                    <label>Scholar ID</label>
                    <input type="text" name="scholar_id" class="form-input" placeholder="Enter Scholar ID" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <div class="password-wrapper">
                        <input type="password" name="password" id="password-input" class="form-input" placeholder="••••••••" required style="padding-right: 40px;">
                        <button type="button" id="toggle-password" class="password-toggle" tabindex="-1">
                            <i data-lucide="eye"></i>
                        </button>
                    </div>
                </div>
                <button type="submit" class="btn">Sign In</button>
            </form>
        </div>
    `;

    const passwordInput = document.getElementById('password-input');
    const toggleBtn = document.getElementById('toggle-password');

    toggleBtn.onclick = () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        toggleBtn.innerHTML = `<i data-lucide="${isPassword ? 'eye-off' : 'eye'}"></i>`;
        lucide.createIcons();
    };

    document.getElementById('login-form').onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const credentials = Object.fromEntries(formData);
        try {
            await api.auth.login(credentials);
            window.app.init();
        } catch (err) {
            alert(err.message);
        }
    };
}
