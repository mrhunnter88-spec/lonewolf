const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const { spawn } = require('child_process');

const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
        // Serve frontend HTML
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    } else {
        // 404 for other requests
        res.writeHead(404);
        res.end('Not found');
    }
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    // Spawn a shell for each connection
    const shell = spawn('bash', [], { stdio: ['pipe', 'pipe', 'pipe'] });

    shell.stdout.on('data', (data) => ws.send(data.toString()));
    shell.stderr.on('data', (data) => ws.send(data.toString()));

    ws.on('message', (msg) => {
        shell.stdin.write(msg + '\n');
    });

    ws.on('close', () => {
        shell.stdin.end();
        shell.kill();
    });
});

const PORT = 8080;
server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
