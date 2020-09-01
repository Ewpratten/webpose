// Build a scene and camera
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

// Build a renderer
var renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// Build a phone box
var geometry = new THREE.BoxGeometry(1, 2.5, 0.1525);
var material = new THREE.MeshBasicMaterial({ color: 0xffffff });
var phone = new THREE.Mesh(geometry, material);
var mesh_mat = new THREE.MeshBasicMaterial({ color: 0x000 });
var mesh = new THREE.LineSegments(geometry, mesh_mat);

// Add the phone
scene.add(phone);
scene.add(mesh);

// Add viz to window
document.getElementById("viz").appendChild(renderer.domElement);

// Create a socket to the server
var socket = io();

// D2R
function d2r(degrees) {
  var pi = Math.PI;
  return degrees * (pi / 180);
}

// Once connected, send a hello message
socket.on("connect", function () {
  socket.emit("hello", { device_type: "desktop" });
  console.log("Connected");
});

// Tracker for first frame
var has_had_first_frame = false;

socket.on("phone_to_desktop_data", function (data) {
  //   console.log(data);

  if (!has_had_first_frame) {
    document.getElementById("loader").classList.add("hidden");
    document.getElementById("viz").classList.remove("hidden");
    has_had_first_frame = true;
  }

  // Edit the phone viz pose
  // Y & Z are flipped
  phone.rotation.x = d2r(Math.min(Math.max(data.x + 180 + 90, 0), 360));
  phone.rotation.y = d2r(Math.min(Math.max(data.y + 180, 0), 360));
  phone.rotation.z = d2r(Math.min(Math.max(360 - data.z, 0), 360));

  mesh.rotation.x = phone.rotation.x;
  mesh.rotation.y = phone.rotation.y;
  mesh.rotation.z = phone.rotation.z;
});

// Animation function
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
