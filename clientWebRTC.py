import asyncio
import aiohttp
import json
from aiortc import RTCPeerConnection, RTCSessionDescription

async def main():
    pc = RTCPeerConnection()

    @pc.on("datachannel")
    def ondatachannel(channel):
        @channel.on("message")
        def onmessage(message):
            print("Received message:", message)

    # Create data channel and offer
    channel = pc.createDataChannel('chat')
    offer = await pc.createOffer()
    await pc.setLocalDescription(offer)

    # Send offer to signaling server
    async with aiohttp.ClientSession() as session:
        async with session.post('https://9tpdujwjld.execute-api.us-west-2.amazonaws.com/prod', data=json.dumps({
            'id': '1111',
            'description': pc.localDescription.sdp,
            'type': pc.localDescription.type
        })) as resp:
            print(await resp.text())

    # Get answer from signaling server
    async with aiohttp.ClientSession() as session:
        async with session.get('https://9tpdujwjld.execute-api.us-west-2.amazonaws.com/prod', params={'id': '1111'}) as resp:
            data = await resp.json()
            answer = RTCSessionDescription(sdp=data['description'], type=data['type'])

    # Set remote description with answer
    await pc.setRemoteDescription(answer)

    # Send message
    channel.send("Hello, peer!")

loop = asyncio.get_event_loop()
loop.run_until_complete(main())
