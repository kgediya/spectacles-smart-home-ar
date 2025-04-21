// 🔌 SnapAR IoT Control Lens Script | Lens Studio Version v5.7.2
// 👨‍💻 Developed by Krazyy Krunal (Krunal MB Gediya)
// 🌐 Find All Things Krazyy | https://krazyykrunal.com 
// 💡 Purpose: Control IoT devices based on user gestures & gaze

// ------------------------------
// 📦 INPUTS
// ------------------------------


// @input Asset.RemoteServiceModule remoteServiceModule
// @input Component.Camera mainTrackingCam
// @input float angleThreshold = 10.0 {"widget":"slider", "min":1, "max":45, "step":0.5} 
// @input SceneObject[] targetObjects

// Debug Controls
// @input bool debugMode = false
// @input Component.Text debugText {"showIf":"debugMode"}

// WebSocket Configuration
// @input string socketURL = "wss://your-ngrok-or-server-url.com"

var isLookingAt = false;
var remoteServiceModule = script.remoteServiceModule;
var socket = null;
var isDeviceOn = false;

// ------------------------------
// 🔍 LOOK DIRECTION CHECK
// ------------------------------
function checkIfLookingAtTargets() {
    if (!script.mainTrackingCam || script.targetObjects.length === 0) {
        debugLog("Missing camera or target objects!");
        return;
    }

    var camTransform = script.mainTrackingCam.getSceneObject().getTransform();
    var camPosition = camTransform.getWorldPosition();
    var camForward = camTransform.forward;

    for (var i = 0; i < script.targetObjects.length; i++) {
        var targetObject = script.targetObjects[i];
        if (!targetObject) continue;

        var targetPosition = targetObject.getTransform().getWorldPosition();
        var toTarget = targetPosition.sub(camPosition).normalize();
        var dot = camForward.dot(toTarget);
        var angle = 180 - (Math.acos(dot) * (180 / Math.PI)); // flipped logic

        if (angle <= script.angleThreshold) {
            if (isLookingAt !== targetObject.name) {
                isLookingAt = targetObject.name;
                debugLog("✅ Looking at: " + targetObject.name, true);
            }
            return;
        }
    }

    // If no object found
    if (isLookingAt) {
        isLookingAt = false;
        debugLog("", true);
    }
}

script.createEvent("UpdateEvent").bind(checkIfLookingAtTargets);

// ------------------------------
// 🧠 BEHAVIOR TRIGGERS
// ------------------------------
global.behaviorSystem.addCustomTriggerResponse('thumbs_up_start', function () {
    if (isLookingAt) {
        debugLog(isLookingAt + " turned Off");
        sendTurnOffCommand();
    }
});

global.behaviorSystem.addCustomTriggerResponse('palm_open_start', function () {
    if (isLookingAt) {
        debugLog(isLookingAt + " turned On");
        sendTurnOnCommand();
    }
});

// ------------------------------
// 🌐 SOCKET SETUP
// ------------------------------
function setupWebSocket() {
    if (!script.socketURL) {
        print("⚠️ No WebSocket URL provided.");
        return;
    }

    socket = remoteServiceModule.createWebSocket(script.socketURL);
    socket.binaryType = "blob";

    socket.onopen = () => {
        print("✅ WebSocket connected");
        socket.send("LensStudio: Connected");
    };

    socket.onmessage = async (event) => {
        if (event.data instanceof Blob) {
            let text = await event.data.text();
            print("📩 Received binary message: " + text);
        } else {
            print("📩 Received text message: " + event.data);
        }
    };

    socket.onclose = (event) => {
        print(event.wasClean ? "❌ WebSocket closed cleanly" : "❌ WebSocket closed with error, code: " + event.code);
    };

    socket.onerror = () => {
        print("⚠️ WebSocket encountered an error");
    };
}
setupWebSocket();

// ------------------------------
// 🔁 PING LOOP TO KEEP THE SERVER ALIVE
// ------------------------------
var delayedPing = script.createEvent("DelayedCallbackEvent");
delayedPing.bind(() => {
    if (socket) socket.send("ping");
    delayedPing.reset(0.5);
});
delayedPing.reset(0);

// ------------------------------
// 🧰 COMMANDS
// ------------------------------
function sendTurnOnCommand() {
    sendCommand("turn_on");
}

function sendTurnOffCommand() {
    sendCommand("turn_off");
}

function sendCommand(command) {
    if (!socket || !isLookingAt) return;

    var message = {
        deviceType: isLookingAt,
        state: command
    };

    socket.send(JSON.stringify(message));
    print("📤 Message Sent: " + JSON.stringify(message));
}

function toggleDeviceState() {
    isDeviceOn ? sendTurnOffCommand() : sendTurnOnCommand();
    isDeviceOn = !isDeviceOn;
}

// ------------------------------
// 🧾 HELPER LOG
// ------------------------------
function debugLog(msg, updateText) {
    if (script.debugMode && script.debugText && updateText) {
        script.debugText.text = msg;
    }
    if (script.debugMode) {
        print(msg);
    }
}
