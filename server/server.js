require('dotenv').config();
const dns = require('dns');

// Force IPv4 globally to resolve ENETUNREACH issues on some networks (like Render)
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');

const path = require('path');

const app = express();
const net = require('net');
app.get('/test-network', async (req, res) => {
    const targets = [
        { host: 'smtp.gmail.com', port: 587 },
        { host: 'smtp.gmail.com', port: 465 },
        { host: 'google.com', port: 80 }
    ];
    let results = [];
    for (const target of targets) {
        const result = await new Promise((resolve) => {
            const socket = new net.Socket();
            socket.setTimeout(3000);
            socket.on('connect', () => { socket.destroy(); resolve('SUCCESS'); });
            socket.on('timeout', () => { socket.destroy(); resolve('TIMEOUT'); });
            socket.on('error', (err) => { socket.destroy(); resolve(`ERROR: ${err.message}`); });
            socket.connect(target.port, target.host);
        });
        results.push(`${target.host}:${target.port} -> ${result}`);
    }
    res.send(results.join('<br>'));
});

const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
    'https://grievance-redressal-system-plum.vercel.app',
    'http://localhost:5000',
    'http://localhost:3000',
    'http://127.0.0.1:5000'
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Serve static files from the 'client' directory
app.use(express.static(path.join(__dirname, '../client')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

// For any other request, serve index.html (SPA support)
app.get(/.*/, (req, res) => {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ message: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.listen(PORT, () => {
    console.log(`\x1b[36m%s\x1b[0m`, `--------------------------------------------------`);
    console.log(`\x1b[32m%s\x1b[0m`, `  Server is running on: http://localhost:${PORT}`);
    console.log(`\x1b[36m%s\x1b[0m`, `--------------------------------------------------`);
});

// Automated Escalation Matrix (SLA) - Runs every hour
const supabase = require('./supabaseClient');
setInterval(async () => {
    try {
        const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

        const { data, error } = await supabase
            .from('complaints')
            .update({ is_escalated: true })
            .is('is_escalated', false)
            .in('status', ['Pending', 'In Progress'])
            .lt('created_at', fortyEightHoursAgo);

        if (error) throw error;
        if (data && data.length > 0) {
            console.log(`[SLA] Escalated ${data.length} complaints.`);
        }
    } catch (err) {
        console.error('[SLA Error]:', err.message);
    }
}, 60 * 60 * 1000); // 1 hour
