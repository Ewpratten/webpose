from flask import Flask
from flask_socketio import SocketIO, send, emit
import time
import math

app = Flask(__name__)
# app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

## Index ##

@app.route("/")
def handleIndex():
    return app.send_static_file("index.html")

## Phone ##

@app.route("/connect/phone")
def handleConnectPhone():
    return app.send_static_file("phone.html")

## Desktop ##

@app.route("/connect/desktop")
def handleConnectDesktop():
    return app.send_static_file("desktop.html")

## Static Files ##

@app.route("/static/client.js")
def handleStaticClientJS():
    return app.send_static_file("client.js")

@app.route("/static/server.js")
def handleStaticServerJS():
    return app.send_static_file("server.js")

@app.route("/static/three.js")
def handleStaticThreeJS():
    return app.send_static_file("three.js")

## Sockets ##

# Trackers for who is currently connected
phone_connected = False
last_phone_timestamp = time.time()

# Handler for hello messages
@socketio.on('hello')
def handle_hello(message):

    global phone_connected, last_phone_timestamp
    
    # Handle device type
    if message["device_type"] == "phone":
        if (not phone_connected) or (phone_connected and time.time() - last_phone_timestamp >= 5.0):
            phone_connected = True
            last_phone_timestamp = time.time()
            print("Phone connected")
        # else:
        #     emit("connect_failure", {"device_type": "phone", "message": "A phone is already connected"})
    else:
        print("Desktop connected")
            
@socketio.on("phone_pose")
def handlePhonePose(message):
    global last_phone_timestamp

    # Record the last connection timestamp
    last_phone_timestamp = time.time()

    # Build data struct
    # Also adapts from sensor to pose coordinates
    pose_data = {
        "z": min(max(round(math.radians(360 - message["alpha"]), 4),0),math.radians(360)),
        "x": min(max(round(math.radians(message["beta"] + 180 + 90), 4),0),math.radians(360)),
        "y": min(max(round(math.radians(message["gamma"] + 180), 4),0),math.radians(360)),
    }

    # re-broadcast to desktop
    emit("phone_to_desktop_data", pose_data, broadcast=True)

if __name__ == '__main__':
    print("Starting webserver on http://0.0.0.0:5000")
    socketio.run(app, use_reloader=True, port=5000, host="0.0.0.0", log_output=True, debug=True)