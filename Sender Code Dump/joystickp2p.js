let connections = {};
let gamepads = {};

document.addEventListener('DOMContentLoaded', async () => {
  const peer = new Peer({
    host: '34.221.178.214',
    port: 9000,
    path: '/'
  });

  peer.on('open', async id => {
    console.log(`My peer ID is: ${id}`);

    // Fetch peers at intervals
    setInterval(fetchAndConnectPeers, 5000, id, connections, peer);  // Every 5 seconds
  });

  peer.on('error', err => console.error(`PeerJS Error: ${err}`));

  window.addEventListener("gamepadconnected", event => {
    const gamepad = event.gamepad;
    console.log(`Gamepad connected: ${gamepad}`);
    gamepads[gamepad.index] = gamepad;
  });

  // Poll gamepads
  setInterval(() => {
    const gamepadList = navigator.getGamepads();
    for (let i = 0; i < gamepadList.length; i++) {
      const gamepad = gamepadList[i];
      if (gamepad) {
        if (!gamepads[gamepad.index] || gamepad.timestamp !== gamepads[gamepad.index].timestamp) {
          console.log(`Gamepad ${i} status changed:`);
          console.log(gamepad);
          gamepads[gamepad.index] = gamepad;
          sendGamepadData(gamepad, connections);
        }
      } else if (gamepads[i]) {
        console.log(`Gamepad ${i} disconnected`);
        delete gamepads[i];
      }
    }
  }, 100);  // Every 100 milliseconds
});

async function fetchAndConnectPeers(id, connections, peer) {
  try {
    const response = await fetch('http://34.221.178.214:3000/peers');
    const peers = await response.json();

    peers.forEach(function(peerId) {
      if (peerId !== id && !connections[peerId]) {
        connectToPeer(peerId, connections, peer);
      }
    });
  } catch (error) {
    console.error(`Failed to fetch peers: ${error}`);
  }
}

function connectToPeer(peerId, connections, peer) {
  const conn = peer.connect(peerId);

  conn.on('open', () => {
    connections[conn.peer] = conn;
    console.log(`Connected to peer: ${conn.peer}`);
  });

  conn.on('data', data => console.log(`Received gamepad data: ${data}`));

  conn.on('error', err => console.error(`Connection error: ${err}`));

  conn.on('close', () => {
    console.log(`Connection closed: ${conn.peer}`);
    delete connections[conn.peer];
  });
}

function sendGamepadData(gamepad, connections) {
  const gamepadData = {
    id: gamepad.id,
    timestamp: gamepad.timestamp,
    axes: gamepad.axes,
    buttons: gamepad.buttons.map(button => ({pressed: button.pressed, value: button.value})),
    connected: gamepad.connected
  };

  console.log(`Sending gamepad data: ${JSON.stringify(gamepadData)}`);

  Object.values(connections).forEach(conn => {
    if (conn.open) {
      conn.send(gamepadData);
    } else {
      console.log(`Connection not open: ${conn.peer}`);
    }
  });
}
