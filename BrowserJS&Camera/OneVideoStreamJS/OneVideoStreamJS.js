const socket = new WebSocket('ws://35.90.15.131:8999');
const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
const peerConnection = new RTCPeerConnection(configuration);
const gamepads = {};




  // Add a Data Channel
  const dataChannel = peerConnection.createDataChannel('dataChannel');

document.addEventListener('DOMContentLoaded', async () => {
  window.addEventListener('gamepadconnected', event => {
    const gamepad = event.gamepad;
    console.log(`Gamepad connected: ${gamepad}`);
    gamepads[gamepad.index] = gamepad;
  });

  window.addEventListener('gamepaddisconnected', event => {
    const gamepad = event.gamepad;
    console.log(`Gamepad disconnected: ${gamepad}`);
    delete gamepads[gamepad.index];
  });
  
  socket.addEventListener('open', () => {
    console.log('Connected to server');

    // Adding this line to create the required offer with media lines
    peerConnection.addTransceiver('video', { direction: 'recvonly' });

    peerConnection.createOffer()
      .then(offer => {
        console.log("Setting local description with offer: ", offer);
        return peerConnection.setLocalDescription(offer);
      })
      .then(() => {
        // Send SDP offer to the server
        const offerMessage = JSON.stringify({ type: 'offer', offer: peerConnection.localDescription });
        socket.send(offerMessage);
        console.log('offer sent', offerMessage);

      })
      .catch(error => {
          console.error('Error during offer creation or local description:', error);
      });

    peerConnection.onicecandidateerror = event => {
          console.error('Error gathering ICE candidate:', event.error);
    };
        
    peerConnection.onicecandidate = event => {
      if (event.candidate) {
        // Send local ICE candidate to the server
        console.log ('candidate generated', event.candidate);
        socket.send(JSON.stringify({ type: 'candidate', candidate: event.candidate }));
      }
    };

    socket.addEventListener('message', event => {
      console.log('Message from server:', event.data);

      // Parse the message as JSON
      const parsedMessage = JSON.parse(event.data);

      // Check the message type and handle accordingly
      if (parsedMessage.type === 'candidate') {
        // Handle remote ICE candidate
        const candidate = new RTCIceCandidate(parsedMessage.candidate);
        peerConnection.addIceCandidate(candidate);
      } else if (parsedMessage.type === 'answer') {
        // Handle SDP answer
        console.log("Setting remote description with answer: ", parsedMessage.answer);
        const answer = new RTCSessionDescription(parsedMessage.answer);
        peerConnection.setRemoteDescription(answer);
        
      }
    });

    // Connection closed
    socket.addEventListener('close', () => {
      console.log('Disconnected from server');
    });

    dataChannel.onopen = event => {
      console.log('Data channel opened');
      dataChannel.send('Hello, World!'); // Send "hello world" when the channel is opened
    };

    dataChannel.onmessage = event => {
      console.log('Received message:', event.data);
    };

    peerConnection.ondatachannel = event => {
      console.log('Data channel received:', event.channel);
      const dataChannel = event.channel;
    
      dataChannel.onopen = event => {
        console.log('Data channel opened');
        dataChannel.send('Hello, World!'); // Send "hello world" when the channel is opened
        console.log('Hello World Sent');
        setInterval(() => {
          const gamepadList = navigator.getGamepads();
          for (let i = 0; i < gamepadList.length; i++) {
            const gamepad = gamepadList[i];
            if (gamepad) {
              if (!gamepads[gamepad.index] || gamepad.timestamp !== gamepads[gamepad.index].timestamp) {
                console.log(`Gamepad ${i} status changed:`);
                console.log(gamepad);
                gamepads[gamepad.index] = gamepad;
                const gamepadData = {
                  id: gamepad.id,
                  timestamp: gamepad.timestamp,
                  axes: gamepad.axes,
                  buttons: gamepad.buttons.map(button => ({ pressed: button.pressed, value: button.value })),
                  connected: gamepad.connected
                };
                const json = JSON.stringify(gamepadData);
                dataChannel.send(json); // Send "hello world" when the channel is opened
                console.log('Gamepad State Changed Message Sent', json);
              }
            } else if (gamepads[i]) {
              console.log(`Gamepad ${i} disconnected`);
              delete gamepads[i];
            }
          }
        }, 100); // Every 100 milliseconds
      
      };

      dataChannel.onmessage = event => {
        console.log('Received message:', event.data);
      };



      //code for adding video

      peerConnection.ontrack = function(event) {
        console.log("Track event: ", event);
    
        // Check if there are any streams in the event
        if (event.streams && event.streams[0]) {
          console.log("Incoming stream found in the track event");
            let incomingStream = event.streams[0];
    
            // Here we assume you have a <video> element in your HTML with id 'remoteVideo'
            let remoteVideoElement = document.getElementById('FV');
    
            console.log("Setting incoming stream as source object for video element");
            // Attach the incoming stream to the <video> element to start playing it
            remoteVideoElement.srcObject = incomingStream;
        }
    };
    
      //code closure for adding video

    };
  });
});

peerConnection.oniceconnectionstatechange = function(event) {
    console.log('ICE connection state change: ', peerConnection.iceConnectionState);
    if (peerConnection.iceConnectionState === 'connected' || peerConnection.iceConnectionState === 'completed') {
      console.log('WebRTC connection established with the exchanged SDP offer and ICE candidates');
    }
  };
