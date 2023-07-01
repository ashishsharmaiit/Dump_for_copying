# server.py
import socket

# Set up a TCP/IP socket
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# Bind the socket to a particular address and port
server_ip = '10.0.0.130' # Server's IP address (localhost in this case)
server_port = 46827 # The same port as used by the server
s.bind((server_ip, server_port))

# Listen for a connection
s.listen(1)
print("Server started! Waiting for connections...")

connection, address = s.accept()
print("Client connected with address:", address)

while True:
    # Receive data from the client
    data = connection.recv(1024)
    if not data:
        break
    print("Received data: ", data.decode())

    # Send data to the client
    message = "Hello Client!"
    connection.send(message.encode())

connection.close()
