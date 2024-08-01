import * as THREE from "three";
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import "./style.css";

const api = "514e1ece08bcd2e992e2242256b805de";
let city = "bangkok";
let tempUnit = "c";

// gui
const gui = new GUI();

/**
 * Webgl
 */
// Window's size
const sizes = { width: window.innerWidth, height: window.innerHeight };

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Canvas
const canvasDom = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.y = 2;
camera.position.z = 5;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvasDom);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvasDom,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor("black");
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Cube
const material = new THREE.MeshStandardMaterial({
  color: "red",
});
const geometry = new THREE.BoxGeometry(5, 5, 1);
const mesh = new THREE.Mesh(geometry, material);
mesh.castShadow = true;
mesh.position.y = 2.501;
scene.add(mesh);

gui.add(mesh.position, "x", -10, 10, 0.01);
gui.add(mesh.position, "z", -10, 10, 0.01);

// Floor
const floorMaterial = new THREE.MeshStandardMaterial({
  side: THREE.DoubleSide,
});
const floorGeometry = new THREE.PlaneGeometry(16, 8);
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.receiveShadow = true;
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Wall
const wallMaterial = new THREE.MeshStandardMaterial({
  side: THREE.DoubleSide,
});
const wallGeometry = new THREE.PlaneGeometry(16, 2);
const wall = new THREE.Mesh(wallGeometry, wallMaterial);
wall.position.y = 1;
scene.add(wall);

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const sphericalPosition = new THREE.Spherical(20, Math.PI * 1.7, 1);
const pointLight = new THREE.PointLight("white", 200);
pointLight.position.setFromSpherical(sphericalPosition);
pointLight.castShadow = true;
scene.add(pointLight);

const pointLightHelper = new THREE.PointLightHelper(pointLight);
pointLightHelper.visible = false;
scene.add(pointLightHelper);

// Animate
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  // Renderer
  renderer.render(scene, camera);

  // Update directional light position
  sphericalPosition.set(5, Math.PI * 1.7, elapsedTime);
  pointLight.position.setFromSpherical(sphericalPosition);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

const cityDOM = document.querySelector(".city");
const imgDOM = document.querySelector(".icon");
const weatherDOM = document.querySelector(".main");
const weatherDescDOM = document.querySelector(".desc");
const tempDOM = document.querySelector(".temp");
const realFeelDom = document.querySelector(".real-feel");
const humidityDOM = document.querySelector(".humidity");
const pressureDOM = document.querySelector(".pressure");
const windSpeedDOM = document.querySelector(".wind-speed");
const cityInput = document.getElementById("search-city");
const form = document.querySelector("form");
const errorMsg = document.querySelector(".error");

const fetchWeather = async (cityName) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${api}`,
      { mode: "cors" }
    );
    const weatherInfo = await response.json();
    return weatherInfo;
  } catch (err) {
    throw err;
  }
};

const convertTemp = (unit, temp) => {
  // celsius
  if (unit === "c") {
    return `${Math.round((temp - 273.15) * 100) / 100}°C`;
  }
  // fahrenheit
  if (unit === "f") {
    return `${Math.round(((temp - 273.15) * 1.8 + 32) * 100) / 100}°F`;
  }
  return "error";
};

const updateWeather = async () => {
  try {
    const weatherInfo = await fetchWeather(city);
    console.log(weatherInfo);
    const { name } = weatherInfo;
    const weather = weatherInfo.weather[0].main;
    const desc = weatherInfo.weather[0].description;
    const { temp } = weatherInfo.main;
    const realFeel = weatherInfo.main.feels_like;
    const { humidity } = weatherInfo.main;
    const { pressure } = weatherInfo.main;
    const windSpeed = weatherInfo.wind.speed;

    imgDOM.setAttribute(
      "src",
      `https://openweathermap.org/img/wn/${weatherInfo.weather[0].icon}@2x.png`
    );
    cityDOM.textContent = name;
    weatherDOM.textContent = weather;
    weatherDescDOM.textContent = desc;
    tempDOM.textContent = convertTemp(tempUnit, temp);
    realFeelDom.textContent = `Feels like: ${convertTemp(tempUnit, realFeel)}`;
    humidityDOM.textContent = `Humidity: ${humidity}%`;
    pressureDOM.textContent = `Pressure: ${pressure} hPa`;
    windSpeedDOM.textContent = `Wind Speed: ${windSpeed} m/s`;

    errorMsg.textContent = "";
  } catch (err) {
    errorMsg.textContent = "Error: location not found";
  }
};
updateWeather();

form.addEventListener("submit", () => {
  city = cityInput.value;
  cityInput.value = "";
  updateWeather();
});

tempDOM.addEventListener("click", () => {
  if (tempUnit === "c") {
    tempUnit = "f";
  } else {
    tempUnit = "c";
  }
  updateWeather();
});
