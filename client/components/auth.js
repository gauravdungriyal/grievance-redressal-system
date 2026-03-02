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
                    <input type="password" name="password" class="form-input" placeholder="••••••••" required>
                </div>
                <button type="submit" class="btn">Sign In</button>
            </form>
        </div>
    `;

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
