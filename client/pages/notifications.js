import { api } from '../js/api.js';
import { showToast } from '../components/ui.js';

export async function renderNotifications(container) {
    container.innerHTML = `
        <header style="margin-bottom: 2rem;">
            <h1>Notifications</h1>
            <p style="opacity: 0.7;">Updates on your submitted grievances</p>
        </header>

        <div id="notifications-list" style="display: flex; flex-direction: column; gap: 1rem;">
            <div class="stat-card glass" style="text-align: left; padding: 2rem;">
                <p>Loading notifications...</p>
            </div>
        </div>
    `;

    try {
        const complaints = await api.complaints.getMy();
        const resolved = complaints.filter(c => c.resolution_note || c.status !== 'Pending');

        const list = document.getElementById('notifications-list');
        if (resolved.length === 0) {
            list.innerHTML = `<div class="glass" style="padding: 2rem; text-align: center; border-radius: 16px;">No new notifications.</div>`;
            return;
        }

        list.innerHTML = resolved.map(c => `
            <div class="glass" style="padding: 1.5rem; border-radius: 16px; border-left: 4px solid var(--primary);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                    <h4 style="color: var(--primary);">${c.complaint_id}: ${c.title}</h4>
                    <span class="status-badge status-${c.status.toLowerCase().replace(' ', '')}">${c.status}</span>
                </div>
                <p style="margin-bottom: 1rem; opacity: 0.8;">${c.description.substring(0, 100)}${c.description.length > 100 ? '...' : ''}</p>
                ${c.resolution_note ? `
                    <div style="background: rgba(79, 70, 229, 0.1); padding: 1rem; border-radius: 12px; margin-top: 0.5rem;">
                        <p style="font-weight: 600; font-size: 0.85rem; margin-bottom: 0.25rem;">Admin Resolution Note:</p>
                        <p style="font-style: italic;">"${c.resolution_note}"</p>
                    </div>
                ` : `<p style="font-size: 0.85rem; opacity: 0.6;">Status updated to ${c.status}</p>`}
                <p style="font-size: 0.75rem; opacity: 0.5; margin-top: 1rem;">Updated on ${new Date(c.updated_at).toLocaleString()}</p>
            </div>
        `).join('');
    } catch (err) {
        showToast('Failed to load notifications', 'error');
    }
}
