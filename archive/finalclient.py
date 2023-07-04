import struct
import socketio
import socket

# Connect to the signaling server
sio = socketio.Client()
sio.connect('http://34.221.178.214:3000')  # Replace with your signaling server URL

# Global variables
remote_ip = None
remote_port = None

def get_public_ip_address():
    """Gets the public IP address of the laptop."""
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
        sock.connect(("8.8.8.8", 80))
        return sock.getsockname()[0]

def get_public_port():
    """Gets the public port of the laptop."""
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
        sock.bind(('', 0))
        return sock.getsockname()[1]

@sio.event
def connect():
    """Handles the connection event."""
    print('Connected to signaling server')
    public_ip_address = get_public_ip_address()
    public_port = get_public_port()

    # Register with the signaling server
    sio.emit('register', {'ip': public_ip_address, 'port': public_port})

@sio.event
def peer_info(data):
    """Handles the peer_info event."""
    global remote_ip, remote_port
    remote_ip = data['ip']
    remote_port = data['port']
    print('Received peer info:', remote_ip, remote_port)

def main():
    """Starts the P2P UDP chat."""
    sio.wait()

    # Create sockets for communication
    socket_send = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    socket_receive = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    socket_receive.bind(('', 0))

    while True:
        message = input('Enter message: ')
        socket_send.sendto(message.encode('utf-8'), (remote_ip, remote_port))
        data, address = socket_receive.recvfrom(1024)
        print('Received:', data.decode('utf-8'))

if __name__ == "__main__":
    main()
