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
            <button class="btn btn-secondary" id="go-signup">Create Account</button>
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

    document.getElementById('go-signup').onclick = () => navigate('signup');
}

export function renderSignup(container, navigate) {
    container.innerHTML = `
        <div class="auth-container">
            <div style="text-align: center; margin-bottom: 2rem;">
                <img src="assets/logo.svg" alt="Logo" style="width: 64px; height: 64px; margin-bottom: 1rem;">
                <h1 style="font-size: 1.5rem; color: var(--text-main); margin-bottom: 0.5rem;">CS Redressal System</h1>
                <p style="opacity: 0.7;">Join CS Dept</p>
            </div>
            <form id="signup-form">
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" name="name" class="form-input" placeholder="John Doe" required>
                </div>
                <div class="form-group">
                    <label>Scholar ID</label>
                    <input type="text" name="scholar_id" class="form-input" placeholder="2314xxxx" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" class="form-input" placeholder="john@example.com" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" name="password" class="form-input" placeholder="••••••••" required>
                </div>
                <div class="form-group">
                    <label>Confirm Password</label>
                    <input type="password" name="confirm_password" class="form-input" placeholder="••••••••" required>
                </div>
                <button type="submit" class="btn">Create Account</button>
            </form>
            <button class="btn btn-secondary" id="go-login">Back to Login</button>
        </div>
    `;

    document.getElementById('signup-form').onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        if (data.password !== data.confirm_password) {
            return alert('Passwords do not match');
        }

        try {
            await api.auth.signup(data);
            alert('Registration successful! Please login.');
            navigate('login');
        } catch (err) {
            alert(err.message);
        }
    };

    document.getElementById('go-login').onclick = () => navigate('login');
}
