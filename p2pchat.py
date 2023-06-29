import subprocess
import requests
import json
import socket
import threading
import boto3
from botocore.exceptions import BotoCoreError, ClientError

# AWS configuration
AWS_REGION = 'us-west-2'
TABLE_NAME = 'IPPort'  # replace with your DynamoDB table name
LOCAL_PORT = '8901'

def get_public_ip():
    try:
        public_ip = subprocess.getoutput("curl -s ifconfig.me")  # Using the -s flag to make curl silent
    except Exception as e:
        print(f"Could not get public IP: {e}")
        return None

    return public_ip

def send_ip_port(ip, port):
    url = 'https://q8wrjv9w7j.execute-api.us-west-2.amazonaws.com/prod/ipadd'
    headers = {'Content-Type': 'application/json'}
    data = {
        'ip': ip,
        'port': port
    }
    try:
        response = requests.post(url, headers=headers, data=json.dumps(data))
        if response.status_code == 200:
            print('Data sent successfully.')
        else:
            print(f'Failed to send data. Status code: {response.status_code}. Message: {response.text}')
    except Exception as e:
        print(f"Could not send IP and port: {e}")

def get_peer_ip_port():
    dynamodb = boto3.client('dynamodb', region_name=AWS_REGION)
    try:
        response = dynamodb.scan(TableName=TABLE_NAME)
        for item in response['Items']:
            if item['port']['S'] != LOCAL_PORT:
                return item['ip']['S'], int(item['port']['S'])
    except (BotoCoreError, ClientError) as error:
        print(f"Could not get peer IP and port: {error}")
    print("No peer IP and port found")
    return None, None

def start_udp_chat(local_ip, local_port, peer_ip, peer_port):
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.bind((local_ip, local_port))

    def receive_messages():
        while True:
            data, addr = sock.recvfrom(1024)
            print(f"{addr[0]}:{addr[1]}: {data.decode()}")

    def send_messages():
        while True:
            message = input("Enter your message: ")
            sock.sendto(message.encode(), (peer_ip, peer_port))

    threading.Thread(target=receive_messages).start()
    threading.Thread(target=send_messages).start()

public_ip = get_public_ip()
if public_ip is not None:
    send_ip_port(public_ip, LOCAL_PORT)
    peer_ip, peer_port = get_peer_ip_port()
    if peer_ip is not None and peer_port is not None:
        start_udp_chat(public_ip, int(LOCAL_PORT), peer_ip, peer_port)
    else:
        print("Unable to start chat because no peer IP and port found.")
else:
    print("Unable to start chat because public IP could not be obtained.")
