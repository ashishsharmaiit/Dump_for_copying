from evdev import InputDevice, categorize, ecodes

def main():
    gamepad = None

    devices = [InputDevice(path) for path in sorted(list(evdev.list_devices()))]
    for device in devices:
        if "gamepad" in device.name.lower():
            gamepad = device
            break

    if gamepad is None:
        print("No gamepad connected.")
        return

    print("Gamepad Name:", gamepad.name)

    for event in gamepad.read_loop():
        if event.type == ecodes.EV_KEY:
            if event.value == 1:
                print("Button pressed:", ecodes.KEY[event.code])
            elif event.value == 0:
                print("Button released:", ecodes.KEY[event.code])
        elif event.type == ecodes.EV_ABS:
            if event.code == ecodes.ABS_X:
                print("X-axis value:", event.value)
            elif event.code == ecodes.ABS_Y:
                print("Y-axis value:", event.value)
        # Add more event types and codes as needed for your application

if __name__ == "__main__":
    main()
