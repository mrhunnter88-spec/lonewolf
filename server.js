const http = require('http');
const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const { spawn } = require('child_process');

const apkStoragePath = '/data/data/com.termux/files/home/'; // Adjust if needed

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
        res.writeHead(404);
        res.end('Not found');
    }
});

const wss = new WebSocket.Server({ server });

// To track partial APK upload buffers per connection
wss.on('connection', (ws) => {
    let apkBuffers = [];
    let shell = spawn('bash', [], { stdio: ['pipe', 'pipe', 'pipe'] });

    shell.stdout.on('data', (data) => ws.send(data.toString()));
    shell.stderr.on('data', (data) => ws.send(data.toString()));

    ws.on('message', (message) => {
        if (typeof message === 'string') {
            // Try parse as JSON (for commands)
            try {
                const msg = JSON.parse(message);
                if (msg.type === 'command') {
                    if (msg.data.startsWith('save-apk:')) {
                        // Save uploaded APK file with given filename
                        const filename = msg.data.slice(9).trim();
                        if (apkBuffers.length > 0) {
                            const apkData = Buffer.concat(apkBuffers);
                            const filepath = path.join(apkStoragePath, filename);
                            fs.writeFileSync(filepath, apkData);
                            ws.send(`[APK] Saved to ${filepath}\n`);
                            apkBuffers = [];
                        } else {
                            ws.send('[APK] No data to save\n');
                        }
                    } else {
                        // Normal shell command
                        shell.stdin.write(msg.data + '\n');
                    }
                }
            } catch {
                // Not JSON, treat as shell input
                shell.stdin.write(message + '\n');
            }
        } else {
            // Binary data chunk - accumulate APK bytes
            apkBuffers.push(Buffer.from(message));
        }
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
