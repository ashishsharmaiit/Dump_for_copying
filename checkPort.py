import socket

def get_available_port():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.bind(('', 0))
    return s.getsockname()[1]

print(get_available_port())
