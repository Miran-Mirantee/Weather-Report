import * as THREE from "three";
import "./style.css";

const api = "514e1ece08bcd2e992e2242256b805de";
let city = "bangkok";
let tempUnit = "c";

const cityDOM = document.querySelector(".city");
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

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

function animate() {
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  renderer.render(scene, camera);
}

const fetchWeather = async (cityName) => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${api}`,
      { mode: "cors" }
    );
    const weatherInfo = await response.json();
    return weatherInfo;
  } catch (err) {
    return "error";
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
    const { name } = weatherInfo;
    const weather = weatherInfo.weather[0].main;
    const desc = weatherInfo.weather[0].description;
    const { temp } = weatherInfo.main;
    const realFeel = weatherInfo.main.feels_like;
    const { humidity } = weatherInfo.main;
    const { pressure } = weatherInfo.main;
    const windSpeed = weatherInfo.wind.speed;

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
