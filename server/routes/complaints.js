const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { sendAdminNotification, sendStatusUpdateEmail } = require('../utils/emailService');

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
    const { category, lab, title, description, priority, attachment_url } = req.body;

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
                    title,
                    description,
                    priority,
                    attachment_url,
                    status: 'Pending'
                }
            ])
            .select()
            .single();

        if (error) throw error;

        // Fetch User Details to include in the email
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('name, scholar_id')
            .eq('id', req.user.id)
            .single();

        // Notify Admin via Email
        const { data: adminUsers, error: adminError } = await supabase
            .from('users')
            .select('email')
            .eq('role', 'admin');

        if (!adminError && adminUsers && adminUsers.length > 0) {
            const adminEmails = adminUsers.map(admin => admin.email).filter(Boolean);
            const emailData = {
                ...data,
                student_name: userData?.name || 'Unknown',
                scholar_id: userData?.scholar_id || 'Unknown'
            };
            sendAdminNotification(emailData, adminEmails).catch(err => console.error('Email failed:', err));
        }

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
        const { data, error } = await supabase
            .from('complaints')
            .select('*, users!user_id(name, scholar_id)')
            .order('created_at', { ascending: false });

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
        const { data, error } = await supabase
            .from('complaints')
            .update({ status, resolution_note, assigned_to, updated_at: new Date() })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;

        // Fetch the student's email and name using the user_id attached to the complaint
        const { data: studentUser, error: studentError } = await supabase
            .from('users')
            .select('email, name')
            .eq('id', data.user_id)
            .single();

        if (!studentError && studentUser && studentUser.email) {
            // Notify the student on status change
            sendStatusUpdateEmail(studentUser.email, studentUser.name || 'Student', data).catch(err => console.error('Status update email failed:', err));
        }

        res.json(data);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
