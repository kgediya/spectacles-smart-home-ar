# IOT + AR | Home Automation Using Snap Spectacles

## Overview

This project allows you to control Tuya-powered devices (like Homemate) using gestures in an Augmented Reality (AR) lens on Spectacles. By looking at the mapped smart device in your environment, you can use hand gestures to perform actions (such as turning a device on/off) and control the device states in real life. This particular project demonstrates the Tuya powered smart devices control.

The setup consists of two main components:

1. **WebSocket Server**: A Python-based WebSocket server that listens for incoming commands, processes them, and communicates with Tuya-powered devices.
2. **Lens Studio Project**: An AR project in Snap's Lens Studio that displays the IoT devices in the real world and listens for WebSocket commands to trigger actions.

This README guides you through setting up both parts of the system.

---

## WebSocket Server Setup

### Step 1: Install Python

Ensure that Python is installed on your machine. You can check if Python is installed by running the following command in your terminal or command prompt:

```bash
python --version
```

If Python is not installed, download and install it from the official [Python website](https://www.python.org/downloads/).

### Step 2: Install Required Packages

Clone or download the repository containing this project. Then, open your terminal/command prompt, navigate to the project folder, and install the necessary Python packages by running:

```bash
pip install -r requirements.txt
```

This will install the required dependencies, including:

- **`websockets`**: For handling WebSocket communication.
- **`tinytuya`**: For interacting with Tuya-powered devices.

If you encounter any issues installing the packages, ensure that you have `pip` installed, or upgrade `pip` to the latest version:

```bash
pip install --upgrade pip
```

### Step 3: Configure the Tuya API

This project uses the `tinytuya` library to interact with Tuya-powered devices. You'll need to update the API configurations with your own credentials.

- **API Key**: Your Tuya Cloud API key.
- **API Secret**: Your Tuya Cloud API secret.
- **Device ID**: The ID of the device you wish to control.

Follow these steps to find your credentials:

1. Sign in to your [Tuya IoT platform](https://iot.tuya.com/).
2. Create a new project and add your devices.
3. Link your devices under Devices section. 
4. Obtain the API key, API secret, and device ID from the Tuya Cloud console.

Replace the placeholders in the `websocket_server.py` file with your actual values:

```python
API_KEY = "your_api_key"
API_SECRET = "your_api_secret"
DEVICE_ID = "your_device_id"
```

### Step 4: Start the WebSocket Server

After configuring the API credentials, start the WebSocket server by running the following command:

```bash
python websocket_server.py
```

The server will start and begin listening on port `8765` for incoming WebSocket connections. When a client connects and sends a valid message, the server will control the IoT device based on the message's instructions.

### Step 5: Expose Your Local WebSocket Server Using Ngrok

To enable remote communication between Lens Studio and your local server, you'll need to expose your WebSocket server to the internet since only secured protocols are allowed by Remote Service Module at the moment. This can be done using [Ngrok](https://ngrok.com/), which creates a secure tunnel to your localhost.

1. **Download and Install Ngrok**: Follow the installation instructions on the [Ngrok website](https://ngrok.com/download).
2. **Expose Port 8765**: In your terminal, run:

   ```bash
   ngrok http 8765
   ```

3. **Get the Public WebSocket URL**: Ngrok will provide an HTTPS link (e.g., `https://xxxxxx.ngrok.io`). You will use this link to connect the WebSocket in Lens Studio. Replace the `https` with `wss` to get the WebSocket URL (e.g., `wss://xxxxxx.ngrok.io`).

---

## Lens Studio Setup

### Step 1: Setup Lens Studio Project

Open **Lens Studio** and open the provided project.

1. **Customize the Environment**: You can set up the project to represent the space in which your IoT devices are located (e.g., your room, office, etc.).

2. **Add Scene Objects**: Place the labels and outlines of the devices that you want to control (such as a fan or light) in the scene. These objects will act as markers for your smart devices.

### Step 2: Replace Location Asset ID

In the **Location Asset** section of your Lens Studio project, replace the default location ID with your custom landmark ID.

- The landmark ID can be a specific location in your environment, such as your room or office, where your devices are placed. You can use the custom location lens on Snapchat or Spectacles to scan your space and obtain the asset ID.

- This helps the AR experience accurately place the virtual devices in the correct real-world locations.

### Step 3: Place Device Objects and Labels

Now, place outlines & labels for your devices based on where they exist in the real world.

- For example, if you have a **fan** and a **light**, you would place their placholder objects in the virtual space to match their real-world counterparts.

### Step 4: Update the WebSocket Address

In the Lens Studio project, find the script responsible for connecting to the WebSocket server. Replace the WebSocket URL in the script with the one generated by Ngrok (remember to use `wss://` instead of `https://`).

```plaintext
Replace `https://xxxxxx.ngrok.io` with `wss://xxxxxx.ngrok.io`
```

This will ensure that Lens Studio connects to your local WebSocket server, allowing communication between the AR lens and your IoT devices.

### Step 5: Preview on Spectacles

Once you've updated the WebSocket address, preview the lens on your **Spectacles** to check if everything works as expected. The lens should now allow you to interact with the devices in your environment using hand gestures.

---

## Optional Customizations

### Gestures and Commands

You can customize the hand gestures and commands in both the **WebSocket server** and **Lens Studio**:

- **Gestures**: Modify the gestures used to trigger actions (e.g., turn on/off).
- **Commands**: Modify the device control commands sent by the WebSocket server. For example, you can map different gestures to control multiple devices.


### Device Control Logic

If you're using different types of devices or want to use a different IoT platform, you can replace the Tuya-specific logic in the server with your own device control logic.

---

## Attribution

This project was created by **Krunal MB Gediya (Krazyy Krunal)**.

It brings together multiple technologies and features to deliver a smooth and immersive IoT x XR experience on **Snap Spectacles**:

- **TinyTuya Library**: Used to communicate and control Tuya-powered smart devices (such as those from Homemate) through a Python WebSocket server.
- **Websockets (Python)**: Enables real-time, low-latency bidirectional communication between Lens Studio and your local device control system.
- **Ngrok**: Used to expose your local WebSocket server securely to the web, enabling global access and real-world deployment.
- **Lens Studio’s Remote Service Module**: Utilized to enable Spectacles to connect to external WebSocket servers and send/receive real-time messages.
- **Custom Location Tracking (Landmark-Based)**: Lens Studio's custom landmark ID feature allows the AR experience to be pinned to a real-world space like your room or office.
- **WebSocket Support on Spectacles**: Leveraging Spectacles’ capability to connect to WebSocket servers via Remote APIs, we achieve seamless spatially-aware interaction with physical devices.

This system forms the foundation of a highly personalized **Augmented Reality Smart Home Controller**, where you simply look at a device through your Spectacles and use intuitive hand gestures to interact with the environment in real-time.

---

## License

This project is open-source and licensed under the MIT License. Feel free to use and modify it for your own needs. If you decide to contribute, please follow the standard GitHub practices.

---

Feel free to modify this README as necessary for your project!