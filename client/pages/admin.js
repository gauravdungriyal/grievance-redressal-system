import { api } from '../js/api.js';
import { showToast } from '../components/ui.js';

export async function renderAdminDashboard(container) {
    container.innerHTML = `
        <header style="margin-bottom: 2rem;">
            <h1>Admin Dashboard</h1>
            <p style="opacity: 0.7;">Manage student grievances and technical issues</p>
        </header>

        <div class="stats-grid">
            <div class="stat-card glass"><p>Total Cases</p><div class="stat-number" id="stat-total">0</div></div>
            <div class="stat-card glass"><p>Pending</p><div class="stat-number" id="stat-pending">0</div></div>
            <div class="stat-card glass"><p>In Progress</p><div class="stat-number" id="stat-progress">0</div></div>
            <div class="stat-card glass"><p>Resolved</p><div class="stat-number" id="stat-resolved">0</div></div>
        </div>

        <div class="glass" style="padding: 1.5rem; margin-bottom: 2rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h3>Active Complaints</h3>
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
                            <th>Priority</th>
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

    document.getElementById('resolve-form').onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('complaint-uuid').value;
        const status = document.getElementById('status-update').value;
        const note = document.getElementById('resolution-note').value;
        try {
            await api.complaints.update(id, { status, resolution_note: note });
            showToast('Complaint updated');
            document.getElementById('resolve-modal').style.display = 'none';
            loadAdminComplaints();
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    document.getElementById('btn-export').onclick = exportCSV;
}

async function loadAdminComplaints() {
    try {
        const complaints = await api.complaints.getAll();
        const list = document.getElementById('admin-complaints-list');
        list.innerHTML = complaints.map(c => `
            <tr>
                <td style="font-weight:600;">
                    ${c.status === 'Pending' ? '<span class="new-tag">NEW</span> ' : ''}${c.complaint_id}
                </td>
                <td>${c.users.name} (${c.users.scholar_id})</td>
                <td>
                    <div style="font-weight: 500;">${c.category}</div>
                    <div style="font-size: 0.75rem; opacity: 0.7;">${c.lab ? `📍 ${c.lab}` : ''}</div>
                </td>
                <td><span class="status-badge status-${c.status.toLowerCase().replace(' ', '')}">${c.status}</span></td>
                <td><span style="color: ${c.priority === 'High' ? '#ef4444' : (c.priority === 'Medium' ? '#f59e0b' : '#3b82f6')}">${c.priority}</span></td>
                <td><button class="btn" style="padding: 0.4rem; font-size:0.8rem;" onclick="openResolveModal('${c.id}', '${c.complaint_id}', '${c.status}', '${c.resolution_note || ''}')">Manage</button></td>
            </tr>
        `).join('') || '<tr><td colspan="6" style="text-align:center;">No complaints found.</td></tr>';

        // Update stats
        document.getElementById('stat-total').innerText = complaints.length;
        document.getElementById('stat-pending').innerText = complaints.filter(c => c.status === 'Pending').length;
        document.getElementById('stat-progress').innerText = complaints.filter(c => c.status === 'In Progress').length;
        document.getElementById('stat-resolved').innerText = complaints.filter(c => c.status === 'Resolved').length;

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
