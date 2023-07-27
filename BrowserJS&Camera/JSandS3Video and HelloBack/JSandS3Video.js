const socket = new WebSocket('ws://35.90.15.131:8999');
const configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
const peerConnection = new RTCPeerConnection(configuration);
const gamepads = {};









//S3 Video Code Starts Below

// Update the AWS SDK configuration
AWS.config.update({
  accessKeyId: 'AKIAVMOZM3HQZ7SWYLMU',
  secretAccessKey: '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',
  region: 'us-west-2' // Update with the correct region
});

// Create an S3 instance
const s3 = new AWS.S3();

const params1 = {
  Bucket: 'cart-mobil-test-data-bucket',
  Key: 'Jungle Jungle Baat Chali Hai (Lyrics) -  The Jungle Book.mp4',
  Expires: 100 // The time to expire in seconds
};

const params2 = {
  Bucket: 'cart-mobil-test-data-bucket',
//  Key: 'PXL_20230402_060406073.mp4',
//Commenting above since video wasn't showing

Key: 'Jungle Jungle Baat Chali Hai (Lyrics) -  The Jungle Book.mp4',


  Expires: 100 // The time to expire in seconds
};

// Generate the signed URL for the first video
s3.getSignedUrl('getObject', params1, function (err, url) {
  if (err) {
      console.log('Error getting presigned URL', err);
  } else {
      // Use the URL
      console.log('The URL is', url);

      // Set the video source to the signed URL
      const localVideo = document.getElementById('FirstVideo');
      localVideo.src = url;
      localVideo.load();
  }
});

// Generate the signed URL for the second video
s3.getSignedUrl('getObject', params2, function (err, url) {
  if (err) {
      console.log('Error getting presigned URL', err);
  } else {
      // Use the URL
      console.log('The URL is', url);

      // Set the video source to the signed URL
      const remoteVideo = document.getElementById('SecondVideo');
      remoteVideo.src = url;
      remoteVideo.load();
  }
});





//S3 Video code ends here



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

    peerConnection.createOffer()
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
  

