const net = require('net');

const targets = [
    { host: 'smtp.gmail.com', port: 587 },
    { host: 'smtp.gmail.com', port: 465 },
    { host: 'google.com', port: 80 },
    { host: '142.250.107.109', port: 465 }
];

async function checkPort(host, port) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        const timeout = 5000;

        socket.setTimeout(timeout);

        console.log(`Checking ${host}:${port}...`);

        socket.on('connect', () => {
            console.log(`[SUCCESS] Connected to ${host}:${port}`);
            socket.destroy();
            resolve(true);
        });

        socket.on('timeout', () => {
            console.log(`[TIMEOUT] ${host}:${port} timed out after ${timeout}ms`);
            socket.destroy();
            resolve(false);
        });

        socket.on('error', (err) => {
            console.log(`[ERROR] ${host}:${port} failed: ${err.message}`);
            socket.destroy();
            resolve(false);
        });

        socket.connect(port, host);
    });
}

async function runDiagnostics() {
    console.log('--- Render Network Diagnostic ---');
    for (const target of targets) {
        await checkPort(target.host, target.port);
    }
}

runDiagnostics();
