const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');


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

        // Send notification via Formspree
        const formId = process.env.FORMSPREE_FORM_ID;
        if (formId && formId !== 'YOUR_FORM_ID_HERE') {
            fetch(`https://formspree.io/f/${formId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    subject: `New Complaint: ${data.complaint_id}`,
                    complaint_id: data.complaint_id,
                    category: data.category,
                    lab: data.lab || 'N/A',
                    pc_number: data.pc_number || 'N/A',
                    title: data.title,
                    description: data.description,
                    submitted_by_id: req.user.id
                })
            }).catch(err => console.error('Formspree notification failed:', err));
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

        res.json(data);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
