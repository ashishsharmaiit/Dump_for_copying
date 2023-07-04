document.addEventListener('DOMContentLoaded', () => {
  const peer = new Peer({
    host: '34.221.178.214',
    port: 9000,
    path: '/'
  });

  peer.on('open', id => console.log(`My peer ID is: ${id}`));

  peer.on('connection', conn => {
    console.log(`Connected to peer: ${conn.peer}`);

    conn.on('data', data => {
      console.log(`Received gamepad data: ${data}`);
      displayData(data);
    });

    conn.on('error', err => console.error(`Connection error: ${err}`));

    conn.on('close', () => console.log(`Connection closed: ${conn.peer}`));
  });

  peer.on('error', err => console.error(`PeerJS Error: ${err}`));
});

function displayData(data) {
  const outputDiv = document.getElementById('output');
  outputDiv.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
}
