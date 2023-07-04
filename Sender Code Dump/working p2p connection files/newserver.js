const express = require('express');
const { PeerServer } = require('peer');
const app = express();
const port = 3000;

const peerServer = PeerServer({ port: 9000, path: '/' });

// Array to keep track of all connected peers
let peers = [];

app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.get('/peers', (req, res) => {
    res.json(peers);
});

peerServer.on('connection', function(client) {
    console.log('Client connected with peer ID:', client.id);
    peers.push(client.id); // Add the connected peer to the array
});

peerServer.on('disconnect', function(client) {
    console.log('Client disconnected with peer ID:', client.id);
    peers = peers.filter(peerId => peerId !== client.id); // Remove the disconnected peer from the array
});

app.listen(port, () => {
    console.log(`Server is running and listening on port ${port}`);
    console.log(`PeerServer is running on port 9000`);
});
