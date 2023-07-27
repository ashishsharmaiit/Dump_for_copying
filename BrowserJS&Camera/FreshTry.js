const socket = new WebSocket('ws://35.90.15.131:8999');
const configuration = { iceServers: [{ urls: 'stun:stun.stunprotocol.org:3478' }] };
const peerConnection = new RTCPeerConnection(configuration);
const gamepads = {};
const dataChannel = peerConnection.createDataChannel('dataChannel');



document.addEventListener('DOMContentLoaded', async () => {

  //new code starts
  const remoteVideoElement = document.getElementById('FirstVideo');
  //new code ends

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

    peerConnection.createOffer({ offerToReceiveVideo: true })
      .then(offer => peerConnection.setLocalDescription(offer))
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
        const answer = new RTCSessionDescription(parsedMessage.answer);
        peerConnection.setRemoteDescription(answer);
        
      }
    });

    // Connection closed
    socket.addEventListener('close', () => {
      console.log('Disconnected from server');
    });

    //new code starts
    peerConnection.ontrack = event => {
      console.log('Trying to Play Video Track');
      console.log('Received streams:', event.streams);
    
      if (event.streams.length > 0) {
        const stream = event.streams[0];
        console.log('Length seems more than 0 in the Received stream:', stream);
    
        // Check if the stream contains a video track
        const videoTracks = stream.getVideoTracks();
        if (videoTracks.length > 0) {
          console.log('Received video track:', videoTracks[0]);
          remoteVideoElement.srcObject = stream; // Set the video stream to the video element
    
          remoteVideoElement.onloadeddata = () => {
            console.log('Video metadata loaded. Setting width and height...');
            // Set the width and height of the video element to match the video stream size
            remoteVideoElement.width = remoteVideoElement.videoWidth;
            console.log('Width is:', remoteVideoElement.width);
            remoteVideoElement.height = remoteVideoElement.videoHeight;
            console.log('Height is:', remoteVideoElement.height);
          };
        } else {
          console.log('No video track in the received stream.');
        }
      } else {
        console.log('No streams in the event.');
      }
    };
    
    //new code ends

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
    };
  });
});

peerConnection.oniceconnectionstatechange = function(event) {
    console.log('ICE connection state change: ', peerConnection.iceConnectionState);
    if (peerConnection.iceConnectionState === 'connected' || peerConnection.iceConnectionState === 'completed') {
      console.log('WebRTC connection established with the exchanged SDP offer and ICE candidates');
    }
  };