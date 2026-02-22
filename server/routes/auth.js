const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../supabaseClient');

// @route   POST api/auth/signup
// @desc    Register a user
router.post('/signup', async (req, res) => {
    const { name, scholar_id, email, password, role } = req.body;

    try {
        // Check if user exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('*')
            .eq('scholar_id', scholar_id)
            .single();

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this Scholar ID' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Save to Supabase
        const { data: newUser, error } = await supabase
            .from('users')
            .insert([
                { name, scholar_id, email, password_hash, role: role || 'student' }
            ])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

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
            scholar_id: user.scholar_id
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 24 * 60 * 60 * 1000 // 24 hours
                });
                res.json({ user: { id: user.id, name: user.name, role: user.role, scholar_id: user.scholar_id } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
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
