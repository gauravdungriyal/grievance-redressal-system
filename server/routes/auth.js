const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const supabase = require('../supabaseClient');


// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
    const { scholar_id, password } = req.body;

    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('scholar_id', scholar_id)
            .single();

        if (!user) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }


        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const payload = {
            id: user.id,
            role: user.role,
            name: user.name,
            scholar_id: user.scholar_id,
            department: user.department
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) {
                    console.error('[Login Error] JWT signing failed:', err.message);
                    return res.status(500).json({ message: 'Error generating security token' });
                }
                
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 24 * 60 * 60 * 1000 // 24 hours
                });
                res.json({ user: { id: user.id, name: user.name, role: user.role, scholar_id: user.scholar_id, department: user.department } });
            }
        );
    } catch (err) {
        console.error('[Login Error] Unexpected crash during login sequence:', err.message);
        console.error(err.stack);
        res.status(500).json({ message: 'Internal server error during login' });
    }
});

// @route   POST api/auth/logout
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});

// @route   GET api/auth/me
router.get('/me', async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'No token' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ user: decoded });
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

module.exports = router;
