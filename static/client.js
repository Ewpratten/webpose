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

// Trackers for last state
var last_alpha = 0;
var last_beta = 0;
var last_gamma = 0;
var epsilon = 0.155;

window.addEventListener(
  "deviceorientation",
  (event) => {
    // Determine if the last state is different from the current
    var send_data =
      Math.abs(last_alpha - event.alpha) > epsilon ||
      Math.abs(last_beta - event.beta) > epsilon ||
      Math.abs(last_gamma - event.gamma) > epsilon;

    // Only send data if needed
    if (send_data) {
      // Emit a state change
      socket.emit("phone_pose", {
        absolute: event.absolute,
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma,
      });

      // Set last state
      last_alpha = event.alpha;
      last_beta = event.beta;
      last_gamma = event.gamma;
    }
  },
  true
);
