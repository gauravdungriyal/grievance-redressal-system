import { api } from '../js/api.js';
import { showToast } from '../components/ui.js';

export async function renderAdminDashboard(container) {
    container.innerHTML = `
        <header style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-end;">
            <div>
                <h1>Admin Dashboard</h1>
                <p style="opacity: 0.7;">Manage student grievances and technical issues</p>
            </div>
            <button class="btn" style="width: auto;" id="btn-toggle-analytics">📊 View Analytics</button>
        </header>

        <div class="stats-grid">
            <div class="stat-card glass"><p>Total Cases</p><div class="stat-number" id="stat-total">0</div></div>
            <div class="stat-card glass"><p>Pending</p><div class="stat-number" id="stat-pending">0</div></div>
            <div class="stat-card glass"><p>In Progress</p><div class="stat-number" id="stat-progress">0</div></div>
            <div class="stat-card glass"><p>Resolved</p><div class="stat-number" id="stat-resolved">0</div></div>
        </div>

        <div id="analytics-section" class="glass" style="padding: 1.5rem; margin-bottom: 2rem; display: none;">
            <h3 style="margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
                📊 Lab Comparison Analytics
            </h3>
            <div id="lab-analytics-container" style="display: flex; flex-direction: column; gap: 1rem;">
                <!-- Analytics bars will be injected here -->
                <p style="opacity: 0.6; font-style: italic;">Loading analytics...</p>
            </div>
        </div>

        <div class="glass" style="padding: 1.5rem; margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <h3>Active Complaints</h3>
                    <select id="lab-filter" class="form-input" style="width: auto; margin-bottom: 0;">
                        <option value="all">All Labs</option>
                        <option value="BSC IT Lab">BSC IT Lab</option>
                        <option value="BCA Lab">BCA Lab</option>
                        <option value="MCA Lab">MCA Lab</option>
                    </select>
                </div>
                <button class="btn" style="width: auto;" id="btn-export">Export to CSV</button>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>From</th>
                            <th>Category/Lab</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="admin-complaints-list"></tbody>
                </table>
            </div>
        </div>

        <!-- Resolution Modal -->
        <div id="resolve-modal" class="glass" style="display:none; position: fixed; top: 10vh; left: 25%; width: 50%; padding: 2rem; z-index: 100;">
            <h2 id="modal-title">Resolve Complaint</h2>
            <form id="resolve-form" style="margin-top: 1rem;">
                <input type="hidden" id="complaint-uuid">
                <div class="form-group">
                    <label>Update Status</label>
                    <select id="status-update" class="form-input">
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Quick Reply / Templates</label>
                    <select id="quick-reply" class="form-input" onchange="if(this.value) { document.getElementById('resolution-note').value = this.value; this.value=''; }">
                        <option value="">-- Select a template --</option>
                        <option value="Hardware replaced, issue fixed.">Hardware replaced, issue fixed.</option>
                        <option value="Software updated/reinstalled, issue fixed.">Software updated/reinstalled, issue fixed.</option>
                        <option value="Forwarded to vendor/IT, awaiting parts/support.">Forwarded to vendor/IT, awaiting parts/support.</option>
                        <option value="User error, instructed properly.">User error, instructed properly.</option>
                        <option value="Duplicate complaint, merging with existing.">Duplicate complaint, merging with existing.</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Resolution/Note</label>
                    <textarea id="resolution-note" class="form-input" rows="4"></textarea>
                </div>
                <div style="display: flex; gap: 1rem;">
                    <button type="submit" class="btn">Update</button>
                    <button type="button" class="btn btn-secondary" onclick="document.getElementById('resolve-modal').style.display='none';">Cancel</button>
                </div>
            </form>
        </div>
    `;

    loadAdminComplaints();

    document.getElementById('btn-toggle-analytics').onclick = () => {
        const section = document.getElementById('analytics-section');
        const btn = document.getElementById('btn-toggle-analytics');
        if (section.style.display === 'none') {
            section.style.display = 'block';
            btn.innerText = 'Hide Analytics';
        } else {
            section.style.display = 'none';
            btn.innerText = '📊 View Analytics';
        }
    };

    document.getElementById('lab-filter').onchange = (e) => {
        loadAdminComplaints(e.target.value);
    };

    document.getElementById('resolve-form').onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('complaint-uuid').value;
        const status = document.getElementById('status-update').value;
        const note = document.getElementById('resolution-note').value;
        try {
            await api.complaints.update(id, { status, resolution_note: note });
            showToast('Complaint updated');
            document.getElementById('resolve-modal').style.display = 'none';
            loadAdminComplaints(document.getElementById('lab-filter').value);
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    document.getElementById('btn-export').onclick = exportCSV;
}

async function loadAdminComplaints(filterLab = 'all') {
    try {
        const allComplaints = await api.complaints.getAll();
        let complaints = [...allComplaints];

        if (filterLab !== 'all') {
            complaints = complaints.filter(c => c.lab === filterLab);
        }

        const list = document.getElementById('admin-complaints-list');
        list.innerHTML = complaints.map(c => `
            <tr>
                <td style="font-weight:600;">
                    ${c.status === 'Pending' ? '<span class="new-tag">NEW</span> ' : ''}
                    ${c.is_escalated ? '<span class="new-tag" style="background:#ef4444; color:white;">🔥 ESCALATED</span> ' : ''}
                    ${c.complaint_id}
                </td>
                <td>${c.users.name} (${c.users.scholar_id})</td>
                <td>
                    <div style="font-weight: 500;">${c.category}</div>
                    <div style="font-size: 0.75rem; opacity: 0.7;">${c.lab ? `📍 ${c.lab}` : ''}</div>
                </td>
                <td><span class="status-badge status-${c.status.toLowerCase().replace(' ', '')}">${c.status}</span></td>
                <td><button class="btn" style="padding: 0.4rem; font-size:0.8rem;" onclick="openResolveModal('${c.id}', '${c.complaint_id}', '${c.status}', '${c.resolution_note || ''}')">Manage</button></td>
            </tr>
        `).join('') || '<tr><td colspan="5" style="text-align:center;">No complaints found.</td></tr>';

        // Update stats (global stats should reflect filtered view or all? usually filtered view's stats are shown in the cards, or total? I'll keep them as filtered for consistency with the table, but Lab Analytics always shows all labs comparison)
        document.getElementById('stat-total').innerText = complaints.length;
        document.getElementById('stat-pending').innerText = complaints.filter(c => c.status === 'Pending').length;
        document.getElementById('stat-progress').innerText = complaints.filter(c => c.status === 'In Progress').length;
        document.getElementById('stat-resolved').innerText = complaints.filter(c => c.status === 'Resolved').length;

        // Update Lab Analytics (Comparing ALL labs)
        renderLabAnalytics(allComplaints);

        // Expose function globally for the onclick handler
        window.openResolveModal = (uuid, id, status, note) => {
            document.getElementById('modal-title').innerText = `Manage: ${id}`;
            document.getElementById('complaint-uuid').value = uuid;
            document.getElementById('status-update').value = status;
            document.getElementById('resolution-note').value = note;
            document.getElementById('resolve-modal').style.display = 'block';
        };

    } catch (err) {
        showToast('Failed to load complaints', 'error');
    }
}

function exportCSV() {
    const table = document.querySelector("table");
    let csv = [];
    for (let i = 0; i < table.rows.length; i++) {
        let row = [], cols = table.rows[i].querySelectorAll("td, th");
        for (let j = 0; j < cols.length - 1; j++) row.push(cols[j].innerText);
        csv.push(row.join(","));
    }
    const csvFile = new Blob([csv.join("\n")], { type: "text/csv" });
    const downloadLink = document.createElement("a");
    downloadLink.download = `complaints_${new Date().toISOString().split('T')[0]}.csv`;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
}

function renderLabAnalytics(complaints) {
    const labs = ["BSC IT Lab", "BCA Lab", "MCA Lab"];
    const distribution = labs.map(lab => ({
        name: lab,
        count: complaints.filter(c => c.lab === lab).length
    }));

    const maxCount = Math.max(...distribution.map(d => d.count), 1);
    const container = document.getElementById('lab-analytics-container');

    container.innerHTML = distribution.map(lab => {
        const percentage = (lab.count / maxCount) * 100;
        const color = lab.count === maxCount && lab.count > 0 ? 'var(--primary)' : 'rgba(var(--primary-rgb), 0.4)';

        return `
            <div style="display: flex; flex-direction: column; gap: 0.4rem;">
                <div style="display: flex; justify-content: space-between; font-size: 0.9rem; font-weight: 500;">
                    <span>${lab.name}</span>
                    <span style="color: var(--primary);">${lab.count} Complaints</span>
                </div>
                <div style="width: 100%; height: 12px; background: rgba(255,255,255,0.05); border-radius: 6px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                    <div style="width: ${percentage}%; height: 100%; background: ${color}; border-radius: 6px; transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 0 10px ${color}44;"></div>
                </div>
            </div>
        `;
    }).join('');
}
