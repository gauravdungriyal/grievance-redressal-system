import { api } from '../js/api.js';
import { showToast } from '../components/ui.js';

export async function renderStudentDashboard(container) {
    container.innerHTML = `
        <div id="student-main">
            <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h1>My Dashboard</h1>
                <button class="btn" style="width: auto;" id="btn-new-complaint">Create New Complaint</button>
            </header>

            <div class="stats-grid">
                <div class="stat-card glass"><p>Total</p><div class="stat-number" id="stat-total">0</div></div>
                <div class="stat-card glass"><p>Pending</p><div class="stat-number" id="stat-pending">0</div></div>
                <div class="stat-card glass"><p>Resolved</p><div class="stat-number" id="stat-resolved">0</div></div>
            </div>

            <div class="table-container glass" style="padding: 1.5rem;">
                <h3>My Complaints</h3>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Category</th>
                            <th>Lab</th>
                            <th>Title</th>
                            <th>Status</th>
                            <th>Resolution</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody id="complaints-list">
                        <!-- Data injected here -->
                    </tbody>
                </table>
            </div>
        </div>

        <div id="complaint-modal" class="glass" style="display:none; position: fixed; top: 10vh; left: 25%; width: 50%; padding: 2rem; z-index: 100;">
             <h2>Submit New Complaint</h2>
             <form id="complaint-form" style="margin-top: 1rem;">
                <div class="form-group">
                    <label>Category</label>
                    <select name="category" class="form-input" required>
                        <option value="Password Reset">Password Reset</option>
                        <option value="Keyboard Not Working">Keyboard Not Working</option>
                        <option value="Mouse Not Working">Mouse Not Working</option>
                        <option value="PC Not Working">PC Not Working</option>
                        <option value="Internet Not Working">Internet Not Working</option>
                        <option value="Attendance Issue">Attendance Issue</option>
                        <option value="Present but Marked Absent">Present but Marked Absent</option>
                        <option value="Saturday Event Idea">Saturday Event Idea</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>LAB</label>
                    <select name="lab" class="form-input" required>
                        <option value="" disabled selected>-- Select Lab --</option>
                        <option value="BSC IT Lab">BSC IT Lab</option>
                        <option value="BCA Lab">BCA Lab</option>
                        <option value="MCA Lab">MCA Lab</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Priority</label>
                    <select name="priority" class="form-input" required>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" name="title" class="form-input" placeholder="Brief summary" required>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea name="description" class="form-input" rows="4" placeholder="Detailed explanation" required></textarea>
                </div>
                <div style="display: flex; gap: 1rem;">
                    <button type="submit" class="btn">Submit</button>
                    <button type="button" class="btn btn-secondary" id="close-modal" style="margin-top:0;">Cancel</button>
                </div>
             </form>
        </div>
    `;

    loadComplaints();

    document.getElementById('btn-new-complaint').onclick = () => {
        document.getElementById('complaint-modal').style.display = 'block';
    };

    document.getElementById('close-modal').onclick = () => {
        document.getElementById('complaint-modal').style.display = 'none';
    };

    document.getElementById('complaint-form').onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        try {
            await api.complaints.submit(data);
            showToast('Complaint submitted successfully');
            document.getElementById('complaint-modal').style.display = 'none';
            loadComplaints();
        } catch (err) {
            showToast(err.message, 'error');
        }
    };
}

async function loadComplaints() {
    try {
        const complaints = await api.complaints.getMy();
        const list = document.getElementById('complaints-list');
        list.innerHTML = complaints.map(c => `
            <tr>
                <td style="font-weight:600;">${c.complaint_id}</td>
                <td>${c.category}</td>
                <td style="font-size: 0.85rem; color: var(--primary); font-weight: 500;">${c.lab || '-'}</td>
                <td>${c.title}</td>
                <td><span class="status-badge status-${c.status.toLowerCase().replace(' ', '')}">${c.status}</span></td>
                <td style="font-size: 0.9rem; font-style: italic; color: var(--primary);">${c.resolution_note || '-'}</td>
                <td>${new Date(c.created_at).toLocaleDateString()}</td>
            </tr>
        `).join('') || '<tr><td colspan="6" style="text-align:center;">No complaints found.</td></tr>';

        // Update stats
        document.getElementById('stat-total').innerText = complaints.length;
        document.getElementById('stat-pending').innerText = complaints.filter(c => c.status === 'Pending').length;
        document.getElementById('stat-resolved').innerText = complaints.filter(c => c.status === 'Resolved').length;
    } catch (err) {
        showToast('Failed to load complaints', 'error');
    }
}
