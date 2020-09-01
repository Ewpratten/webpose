// Create a socket to the server
var socket = io();

// Once connected, send a hello message
socket.on("connect", function () {
  socket.emit("hello", { device_type: "phone" });
  console.log("Connected");
  document.getElementById("loader").classList.add("hidden");
  document.getElementById("success").classList.remove("hidden");
});

// Handler for bad connection
socket.on("connect_failure", function (m) {
  // Check if this error applies to phones
  if (m.device_type == "phone") {
    document.getElementById("loader").classList.add("hidden");
    document.getElementById("error").classList.remove("hidden");
    document.getElementById("error_message").innerText += m.message;
  }
});

window.addEventListener(
  "deviceorientation",
  (event) => {
    console.log(event);
    socket.emit("phone_pose", {
      absolute: event.absolute,
      alpha: event.alpha,
      beta: event.beta,
      gamma: event.gamma,
    });
  },
  true
);
