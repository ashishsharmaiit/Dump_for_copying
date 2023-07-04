window.addEventListener("gamepadconnected", function(e) {
    addGamepadEvent("Gamepad connected, index: " + e.gamepad.index);
    // Start polling the gamepad status
    requestAnimationFrame(updateGamepadStatus);
  });
  
  window.addEventListener("gamepaddisconnected", function(e) {
    addGamepadEvent("Gamepad disconnected, index: " + e.gamepad.index);
  });
  
  function updateGamepadStatus() {
    var gamepads = navigator.getGamepads();
    for (let i = 0; i < gamepads.length; i++) {
      var gamepad = gamepads[i];
      if (gamepad) {
        // Gamepad is connected, you can access gamepad.buttons and gamepad.axes here
        for(let j = 0; j < gamepad.buttons.length; j++) {
          let button = gamepad.buttons[j];
          addGamepadEvent(`Gamepad ${i}, Button ${j}: pressed = ${button.pressed}, value = ${button.value}`);
        }
  
        for(let j = 0; j < gamepad.axes.length; j++) {
          addGamepadEvent(`Gamepad ${i}, Axis ${j}: value = ${gamepad.axes[j]}`);
        }
      }
    }
    
    // Continue polling
    requestAnimationFrame(updateGamepadStatus);
  }
  
  function addGamepadEvent(text) {
    const gamepadEvents = document.getElementById('gamepadEvents');
    const eventItem = document.createElement('li');
    eventItem.textContent = text;
    gamepadEvents.appendChild(eventItem);
  
    // Limit the number of displayed events to 100
    while(gamepadEvents.children.length > 100) {
      gamepadEvents.removeChild(gamepadEvents.firstChild);
    }
  }
  