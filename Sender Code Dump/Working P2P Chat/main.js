var peer = new Peer({
  host: '34.221.178.214',
  port: 9000,
  path: '/'
});

var connections = {};

peer.on('open', function (id) {
  console.log('My peer ID is: ' + id);
  document.getElementById('myid').innerText = 'My ID: ' + id;

  setInterval(function() {
    var request = new XMLHttpRequest();
    request.open('GET', 'http://34.221.178.214:3000/peers', true);
    request.onreadystatechange = function() {
      if (request.readyState === 4 && request.status === 200) {
        var peers = JSON.parse(request.responseText);
        console.log('Connected peers:', peers);

        peers.forEach(function(peerId) {
          if (peerId !== id && !connections[peerId]) {
            var conn = peer.connect(peerId);
            conn.on('open', function() {
              connections[conn.peer] = conn;
              console.log('Connected to peer:', conn.peer);
              var messageToSend = 'Hello, Peer!';
              try {
                conn.send(messageToSend);
                console.log('Message sent:', messageToSend);
              } catch (err) {
                console.error('Error sending message:', err);
              }
            });

            conn.on('data', function(data) {
              console.log('Received', data);
              const messages = document.getElementById('messages');
              const message = document.createElement('li');
              message.textContent = 'Received Message: ' + data;
              messages.appendChild(message);
            });

            conn.on('close', function() {
              console.log('Connection closed');
            });

            conn.on('error', function(err) {
              console.error('Connection error:', err);
            });
          }
        });
      }
    };
    request.send();
  }, 10000);
});

document.addEventListener('DOMContentLoaded', function() {
  var sendButton = document.getElementById('sendButton');
  if(sendButton){
    sendButton.addEventListener('click', function() {
      var message = document.getElementById('messageInput').value;
      console.log('Button clicked, message: ', message);
      Object.values(connections).forEach(function(conn) {
        console.log('Connection open status:', conn.open);
        if(conn.open) {
          console.log('Sending message to:', conn.peer);
          try {
            conn.send(message);
            console.log('Message sent:', message);
          } catch (err) {
            console.error('Error sending message:', err);
          }
        }
      });
    });
  } else {
    console.log('Send button element not found');
  }
});

peer.on('error', function(err) {
  console.error('PeerJS Error:', err);
});

peer.on('connection', (conn) => {
  conn.on('data', (data) => {
    console.log('Received:', data);
    const messages = document.getElementById('messages');
    const message = document.createElement('li');
    message.textContent = 'Received Message: ' + data;
    messages.appendChild(message);
  });
  conn.on('error', function(err) {
    console.error('Error in connection:', err);
  });
});
