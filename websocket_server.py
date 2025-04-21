# 🧠 Tuya WebSocket Control Server
# 👨‍💻 Built by Krazyy Krunal (Krunal MB Gediya)
# 🌐 All Things Krazyy | https://krazyykrunal.com
# 📡 Purpose: A WebSocket server to interact with Tuya-powered ( Homemate ) IoT devices and control them remotely via JSON messages.
# 🛠️ Dependencies: asyncio, websockets, json, tinytuya
# 📘 Documentation: Please refer to Tuya Cloud API documentation and WebSocket standards for further reference.

import asyncio
import websockets
import json
import tinytuya

# ------------------------------------------------------
# ⚙️ CONFIGURATION SECTION
# ------------------------------------------------------

# Replace these placeholders with your Tuya IoT credentials
API_REGION = "your_region"          # Example: "eu", "us", "in" (Region code for your Tuya API account)
API_KEY = "your_api_key_here"       # API Key provided by Tuya after registering your IoT project
API_SECRET = "your_api_secret_here" # API Secret for authentication, keep it safe!
DEVICE_ID = "your_device_id_here"   # The specific Tuya device you want to control (find this in the Tuya IoT platform)

# WebSocket Server Configuration
WEBSOCKET_HOST = "0.0.0.0"          # The host where the WebSocket server will listen for incoming connections (0.0.0.0 for all IPs)
WEBSOCKET_PORT = 8765               # The port on which WebSocket server will listen (choose an available port)

# Toggle debug mode for logging
DEBUG_MODE = True                   # Set to 'False' to disable detailed debug logs in the console

# ------------------------------------------------------
# DEVICE CONTROL CONFIGURATION
# ------------------------------------------------------

# A dictionary that maps the device names to Tuya switch codes
# These are the devices and their corresponding codes that we can control
DEVICE_TYPE_MAP = {
    "MainFan": "switch_1",  # Device type "MainFan" is controlled by "switch_1"
    "MainLight": "switch_2" # Device type "MainLight" is controlled by "switch_2"
}

# Allowed states for device control. These should match the commands your WebSocket client will send
VALID_STATES = {"turn_on", "turn_off"}  # The states that can be sent by the client (to turn devices ON or OFF)

# ------------------------------------------------------
# TUYA CLOUD CLIENT INITIALIZATION
# ------------------------------------------------------

# Setting up the Tuya Cloud API client using the provided credentials
tuya = tinytuya.Cloud(
    apiRegion=API_REGION,    # The region your Tuya cloud account is associated with
    apiKey=API_KEY,          # The API Key associated with your Tuya IoT application
    apiSecret=API_SECRET,    # The API Secret for securely communicating with the Tuya Cloud API
    apiDeviceID=DEVICE_ID    # The device ID to control from Tuya
)

# ------------------------------------------------------
# CLIENT MESSAGE HANDLER FUNCTION
# ------------------------------------------------------

# This function handles the messages received from the client via WebSocket
# It checks the received message, validates it, and sends commands to the Tuya device if valid
async def handle_client(websocket):
    log("✅ Client connected")

    try:
        # Listen for messages from the WebSocket client
        async for message in websocket:
            log(f"📩 Raw message received: {repr(message)}")  # Logs the raw message received from the client

            try:
                # Try parsing the incoming message as JSON
                data = json.loads(message)

                # Validate the message: Check if deviceType and state are valid
                device_type = data.get("deviceType")  # Extract the device type (e.g., "MainFan")
                state = data.get("state")             # Extract the state (e.g., "turn_on")

                # Check if both the deviceType is valid and state is among the allowed states
                if device_type in DEVICE_TYPE_MAP and state in VALID_STATES:
                    log(f"✅ Valid message: {data}")  # Log if message is valid

                    # Get the corresponding Tuya switch code for the device
                    switch_code = DEVICE_TYPE_MAP[device_type]

                    # Send the command to Tuya to change the state of the device
                    await send_command(switch_code, state)
                else:
                    # If message content is invalid, log a warning
                    log(f"⚠️ Invalid message format or data: {data}")

            except json.JSONDecodeError:
                # If the message is not valid JSON, log an error
                log("❌ Error: Message is not valid JSON")

    except websockets.ConnectionClosed as e:
        # If the connection closes, log the error
        log(f"❌ Client disconnected: {e}")

# ------------------------------------------------------
# COMMAND SENDING FUNCTION TO TUYA DEVICE
# ------------------------------------------------------

# This function sends the "turn_on" or "turn_off" command to Tuya based on the received state
async def send_command(switch_code, state):
    # Determine if the state is "turn_on" or "turn_off" (True or False)
    command = {
        "commands": [
            {"code": switch_code, "value": state == "turn_on"}  # Send True for "turn_on", False for "turn_off"
        ]
    }

    try:
        # Send the command to Tuya
        response = tuya.sendcommand(DEVICE_ID, command)
        log(f"📤 Command Sent → {command}")  # Log the command that was sent
        log(f"✅ Tuya Response: {response}")  # Log the response from Tuya
    except Exception as e:
        # If there was an error sending the command, log it
        log(f"❌ Error sending command: {e}")

# ------------------------------------------------------
# MAIN FUNCTION TO START THE SERVER
# ------------------------------------------------------

# This function starts the WebSocket server and listens for incoming connections
async def main():
    # Start the WebSocket server on the configured host and port
    server = await websockets.serve(handle_client, WEBSOCKET_HOST, WEBSOCKET_PORT)
    log(f"🚀 WebSocket Server started at ws://{WEBSOCKET_HOST}:{WEBSOCKET_PORT}")  # Log server startup
    await server.wait_closed()  # Keep the server running and waiting for new connections

# ------------------------------------------------------
# DEBUG LOGGING FUNCTION
# ------------------------------------------------------

# This function conditionally logs messages to the console if DEBUG_MODE is True
def log(message):
    if DEBUG_MODE:
        print(message)  # Print the debug message to the console

# ------------------------------------------------------
# SCRIPT ENTRY POINT - RUN THE SERVER
# ------------------------------------------------------

# This block runs the main function when the script is executed directly
if __name__ == "__main__":
    asyncio.run(main())  # Start the WebSocket server and begin handling connections
