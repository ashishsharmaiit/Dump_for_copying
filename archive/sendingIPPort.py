import subprocess
import requests
import json

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

public_ip = get_public_ip()
if public_ip is not None:
    send_ip_port(public_ip, '8900')
