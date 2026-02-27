const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const supabase = require('../supabaseClient');
const { sendVerificationEmail } = require('../utils/emailService');

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

        // Generate verification token
        const verificationToken = crypto.randomBytes(32).toString('hex');

        // Save to Supabase (assuming is_verified and verification_token columns exist)
        const { data: newUser, error } = await supabase
            .from('users')
            .insert([
                {
                    name,
                    scholar_id,
                    email,
                    password_hash,
                    role: role || 'student',
                    is_verified: false,
                    verification_token: verificationToken
                }
            ])
            .select()
            .single();

        if (error) throw error;

        // Send the verification email asynchronously
        sendVerificationEmail(email, name, verificationToken).catch(err => console.error('Verification email failed:', err));

        res.status(201).json({ message: 'User registered successfully. Please check your email to verify your account.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET api/auth/verify/:token
// @desc    Verify user email
router.get('/verify/:token', async (req, res) => {
    try {
        const { token } = req.params;

        // Find user by token
        const { data: user, error } = await supabase
            .from('users')
            .select('id')
            .eq('verification_token', token)
            .single();

        if (error || !user) {
            return res.status(400).json({ message: 'Invalid or expired verification token.' });
        }

        // Update user to verified and remove token
        const { error: updateError } = await supabase
            .from('users')
            .update({ is_verified: true, verification_token: null })
            .eq('id', user.id);

        if (updateError) throw updateError;

        // Redirect to frontend login with success message
        // The frontend is being served by the backend from the root '/'
        res.redirect('/?verified=true');
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error during verification.');
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

        // Check if user is verified
        if (user.is_verified === false) {
            return res.status(403).json({ message: 'Please verify your email address before logging in.' });
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
