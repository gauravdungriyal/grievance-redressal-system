import { api } from './api.js';
import { renderLogin, renderSignup } from '../components/auth.js';
import { renderSidebar, showToast } from '../components/ui.js';
import { renderStudentDashboard } from '../pages/student.js';
import { renderAdminDashboard } from '../pages/admin.js';
import { renderNotifications } from '../pages/notifications.js';

const state = {
    user: null,
    view: 'login',
    darkMode: localStorage.getItem('darkMode') === 'true'
};

const app = {
    async init() {
        this.applyTheme();
        try {
            const data = await api.auth.me();
            state.user = data.user;
            this.navigate('dashboard');
            if (state.user.role === 'student') {
                this.checkNotifications();
            }
        } catch (err) {
            this.navigate('login');
        }
    },

    navigate(view) {
        state.view = view;
        const authView = document.getElementById('auth-view');
        const dashView = document.getElementById('dashboard-view');
        const sidebar = document.getElementById('sidebar-container');

        if (view === 'login' || view === 'signup') {
            sidebar.style.display = 'none';
            dashView.style.display = 'none';
            authView.style.display = 'block';
            if (view === 'login') renderLogin(authView, (v) => this.navigate(v));
            else renderSignup(authView, (v) => this.navigate(v));
        } else if (view === 'dashboard' || view === 'notifications') {
            authView.style.display = 'none';
            dashView.style.display = 'block';
            sidebar.style.display = 'flex';

            renderSidebar(sidebar, state.user, (v) => this.navigate(v), () => this.logout());

            // Update active state in sidebar
            document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
            if (view === 'dashboard') {
                document.getElementById('nav-home')?.classList.add('active');
                if (state.user.role === 'admin') renderAdminDashboard(dashView);
                else renderStudentDashboard(dashView);
                if (state.user.role === 'student') this.checkNotifications();
            } else if (view === 'notifications') {
                document.getElementById('nav-notifications')?.classList.add('active');
                renderNotifications(dashView);
                this.markNotificationsAsSeen();
            }
        }
        lucide.createIcons();
    },

    async checkNotifications() {
        if (!state.user || state.user.role !== 'student') return;
        try {
            const complaints = await api.complaints.getMy();
            const updates = complaints.filter(c => c.resolution_note || c.status !== 'Pending');

            const seenIds = JSON.parse(localStorage.getItem(`seen_notifications_${state.user.id}`) || '[]');
            const newUpdates = updates.filter(u => !seenIds.includes(u.id));

            const badge = document.getElementById('nav-badge');
            if (badge) {
                if (newUpdates.length > 0) {
                    badge.innerText = newUpdates.length;
                    badge.style.display = 'flex';
                } else {
                    badge.style.display = 'none';
                }
            }
        } catch (err) {
            console.error('Failed to check notifications:', err);
        }
    },

    async markNotificationsAsSeen() {
        if (!state.user || state.user.role !== 'student') return;
        try {
            const complaints = await api.complaints.getMy();
            const updates = complaints.filter(c => c.resolution_note || c.status !== 'Pending');
            const allIds = updates.map(u => u.id);
            localStorage.setItem(`seen_notifications_${state.user.id}`, JSON.stringify(allIds));

            const badge = document.getElementById('nav-badge');
            if (badge) badge.style.display = 'none';
        } catch (err) {
            console.error('Failed to mark notifications as seen:', err);
        }
    },

    async logout() {
        try {
            await api.auth.logout();
            state.user = null;
            this.navigate('login');
        } catch (err) {
            showToast('Logout failed', 'error');
        }
    },

    toggleTheme() {
        state.darkMode = !state.darkMode;
        localStorage.setItem('darkMode', state.darkMode);
        this.applyTheme();
    },

    applyTheme() {
        document.body.classList.toggle('dark-mode', state.darkMode);
    }
};

window.app = app; // Expose for globally accessible actions
app.init();
