# client.py
import socket

# Set up a TCP/IP socket
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# Connect to the server
server_ip = '10.0.0.130' # Server's IP address (localhost in this case)
server_port = 46827 # The same port as used by the server
s.connect((server_ip, server_port))

while True:
    # Send data to the server
    message = "Hello Server!"
    s.send(message.encode())

    # Receive data from the server
    data = s.recv(1024)
    if not data:
        break
    print("Received data: ", data.decode())

s.close()
