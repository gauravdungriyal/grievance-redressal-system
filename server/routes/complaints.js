const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const mailer = require('../utils/mailer');


// Helper to generate complaint ID
const generateComplaintID = async () => {
    const year = new Date().getFullYear();
    const { data: lastComplaint } = await supabase
        .from('complaints')
        .select('complaint_id')
        .order('created_at', { ascending: false })
        .limit(1);

    let nextNum = 1;
    if (lastComplaint && lastComplaint.length > 0) {
        const lastID = lastComplaint[0].complaint_id;
        const lastNum = parseInt(lastID.split('-')[2]);
        nextNum = lastNum + 1;
    }
    return `CSD-${year}-${nextNum.toString().padStart(3, '0')}`;
};

// @route   POST api/complaints
// @desc    Submit a new complaint
router.post('/', authMiddleware, async (req, res) => {
    const { category, lab, title, description, pc_number, attachment_url } = req.body;

    try {
        const complaintID = await generateComplaintID();

        const { data, error } = await supabase
            .from('complaints')
            .insert([
                {
                    complaint_id: complaintID,
                    user_id: req.user.id,
                    category,
                    lab,
                    pc_number,
                    title,
                    description,
                    priority: 'Low',
                    attachment_url,
                    status: 'Pending'
                }
            ])
            .select()
            .single();

        if (error) throw error;

        // Send Email Notification via Google SMTP (New)
        // We do this asynchronously without 'await' to the main response to keep it fast
        (async () => {
            try {
                const { data: userData } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', req.user.id)
                    .single();

                if (userData) {
                    console.log(`\x1b[36m[ROUTE]\x1b[0m Initiating notification for complaint ${data.complaint_id} by student ${userData.name}`);
                    await mailer.notifyNewComplaint(userData, data);
                } else {
                    console.error('[MAILING] User data not found for ID:', req.user.id);
                }
            } catch (mailErr) {
                console.error('[MAILING] BACKGROUND FAILURE in POST /:', mailErr);
            }
        })();

        res.status(201).json(data);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/complaints/my
// @desc    Get current user's complaints
router.get('/my', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('complaints')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/complaints/all
// @desc    Get all complaints (Admin only)
router.get('/all', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        let query = supabase
            .from('complaints')
            .select('*, users!user_id(name, scholar_id)')
            .order('created_at', { ascending: false });

        // Department-Based Filtering Logic
        if (req.user.department && req.user.role !== 'superadmin') {
            const dept = req.user.department.toUpperCase();
            console.log(`[FILTER] Admin ${req.user.name} logged in. Filtering for department: ${dept}`);

            if (dept === 'MCA') {
                query = query.eq('lab', 'MCA Lab');
            } else if (dept === 'BCA') {
                query = query.eq('lab', 'BCA Lab');
            } else if (dept === 'BSC-IT' || dept === 'BIT') {
                query = query.or('lab.eq.BSC IT Lab,lab.eq.BIT Lab');
            } else if (dept === 'IT') {
                // IT Support sees technical categories across all labs
                const itCategories = ['Password Reset', 'Keyboard Not Working', 'Mouse Not Working', 'PC Not Working', 'Internet Not Working'];
                query = query.in('category', itCategories);
            } else if (dept === 'ACADEMIC') {
                query = query.in('category', ['Attendance Issue', 'Present but Marked Absent']);
            }
        }

        const { data, error } = await query;

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   PATCH api/complaints/:id
// @desc    Update complaint status/resolution (Admin only)
router.patch('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    const { status, resolution_note, assigned_to } = req.body;
    try {
        const updateData = { status, resolution_note, assigned_to, updated_at: new Date() };

        if (status === 'Resolved') {
            updateData.resolved_at = new Date();
        }

        const { data, error } = await supabase
            .from('complaints')
            .update(updateData)
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;

        // Send Email Notifications based on Status Change
        (async () => {
            try {
                const { data: userData } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', data.user_id)
                    .single();

                if (!userData) return;

                if (status === 'In Progress') {
                    // Approved by Lab Coordinator
                    mailer.notifyApproval(userData, data);
                } else if (status === 'Rejected') {
                    // Declined by Lab Coordinator
                    mailer.notifyDecline(userData, data, resolution_note);
                } else if (status === 'Resolved') {
                    // Resolved by IT Support
                    mailer.notifyResolution(userData, data);
                }
            } catch (mailErr) {
                console.error('Mailing failed in PATCH /:id:', mailErr);
            }
        })();

        res.json(data);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
