import * as THREE from "three";
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import { Sky } from "three/examples/jsm/objects/Sky";
import "./style.css";

const api = "514e1ece08bcd2e992e2242256b805de";
let city = "bangkok";
let tempUnit = "c";

/**
 * TODO:
 *  - add moon light
 *  - add campfire fire particle (point light's included)
 *  - add rain particle
 *  - add snow particle
 *  - make text more readable
 *  - adjust sun light intensity according to time
 *  - adjust sun light color according to time
 *  - adjust ambient light according to time
 *  - use draco to compress model (optional)
 */

// gui
const gui = new GUI();
const debugObject = {};

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
  if (camera) {
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
  }

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Loader
// GLTF loader
const gltfLoader = new GLTFLoader();

let camera;

// Models
gltfLoader.load("../static/camping.glb", (gltf) => {
  // Camera
  camera = gltf.cameras[0];
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // const controls = new OrbitControls(camera, canvasDom);
  const merged = gltf.scene.children.find((child) => child.name == "merged");
  for (const child of merged.children) {
    child.receiveShadow = true;
    child.castShadow = true;
    child.material.side = 1;
  }

  const tentShade = gltf.scene.children.find(
    (child) => child.name == "tentShade"
  );
  tentShade.castShadow = true;

  const screendoor = gltf.scene.children.find(
    (child) => child.name == "screendoor"
  );
  screendoor.receiveShadow = true;
  screendoor.castShadow = true;
  screendoor.material.side = 1;

  scene.add(camera);
  scene.add(gltf.scene);
});

// Canvas
const canvasDom = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

debugObject.clearColor = "#3498db";

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvasDom,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(debugObject.clearColor);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.5;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

gui.addColor(debugObject, "clearColor").onChange(() => {
  renderer.setClearColor(debugObject.clearColor);
});

// Sky & sun
const skyController = {
  turbidity: 10,
  rayleigh: 3,
  mieCoefficient: 0.001,
  mieDirectionalG: 0.99,
  elevation: 2,
  azimuth: 17,
  exposure: renderer.toneMappingExposure,
  lightIntensity: 3.24,
};

const skySettings = {
  dawn: {
    turbidity: 2.1,
    rayleigh: 1.443,
    mieCoefficient: 0.02,
    mieDirectionalG: 0.25,
    elevation: -90,
    azimuth: 17,
    exposure: renderer.toneMappingExposure,
  },
  sunrise: {
    turbidity: 0.5,
    rayleigh: 1.542,
    mieCoefficient: 0.007,
    mieDirectionalG: 0.999,
    elevation: -89.5,
    azimuth: 17,
    exposure: renderer.toneMappingExposure,
  },
  earlyMorning: {
    turbidity: 3.8,
    rayleigh: 0.903,
    mieCoefficient: 0.03,
    mieDirectionalG: 1,
    elevation: -60,
    azimuth: 17,
    exposure: renderer.toneMappingExposure,
  },
  midMorning: {
    turbidity: 3.8,
    rayleigh: 0.903,
    mieCoefficient: 0.03,
    mieDirectionalG: 1,
    elevation: -30,
    azimuth: 17,
    exposure: renderer.toneMappingExposure,
  },
  noon: {
    turbidity: 3.8,
    rayleigh: 0.903,
    mieCoefficient: 0.03,
    mieDirectionalG: 1,
    elevation: 0,
    azimuth: 17,
    exposure: renderer.toneMappingExposure,
  },
  earlyAfternoon: {
    turbidity: 4.5,
    rayleigh: 0.903,
    mieCoefficient: 0.055,
    mieDirectionalG: 1,
    elevation: 60.5301,
    azimuth: 17,
    exposure: renderer.toneMappingExposure,
  },
  lateAfternoon: {
    turbidity: 5.3,
    rayleigh: 3.263,
    mieCoefficient: 0.073,
    mieDirectionalG: 0.041,
    elevation: 85,
    azimuth: 17,
    exposure: renderer.toneMappingExposure,
  },
  sunset: {
    turbidity: 20,
    rayleigh: 3.115,
    mieCoefficient: 0.015,
    mieDirectionalG: 0.999,
    elevation: 90,
    azimuth: 17,
    exposure: renderer.toneMappingExposure,
  },
  dusk: {
    turbidity: 9.9,
    rayleigh: 0.804,
    mieCoefficient: 0.015,
    mieDirectionalG: 0.999,
    elevation: 96,
    azimuth: 17,
    exposure: renderer.toneMappingExposure,
  },
  earlyNight: {
    turbidity: 20,
    rayleigh: 4,
    mieCoefficient: 0.015,
    mieDirectionalG: 0.999,
    elevation: 108,
    azimuth: 17,
    exposure: renderer.toneMappingExposure,
  },
  midnight: {
    turbidity: 20,
    rayleigh: 0,
    mieCoefficient: 0.1,
    mieDirectionalG: 0.999,
    elevation: 180,
    azimuth: 17,
    exposure: renderer.toneMappingExposure,
  },
};

const sky = new Sky();
scene.add(sky);
sky.scale.setScalar(5000);

const sun = new THREE.Vector3();

const updateSky = () => {
  const uniforms = sky.material.uniforms;
  uniforms["turbidity"].value = skyController.turbidity;
  uniforms["rayleigh"].value = skyController.rayleigh;
  uniforms["mieCoefficient"].value = skyController.mieCoefficient;
  uniforms["mieDirectionalG"].value = skyController.mieDirectionalG;

  const phi = THREE.MathUtils.degToRad(skyController.elevation);
  const theta = THREE.MathUtils.degToRad(skyController.azimuth);

  sun.setFromSphericalCoords(10, phi, theta);

  uniforms["sunPosition"].value.copy(sun);

  renderer.toneMappingExposure = skyController.exposure;
  if (camera) renderer.render(scene, camera);

  updateDirectionalLight();
};
// updateSky(skyController);

gui
  .add(skyController, "turbidity", 0.0, 20.0, 0.1)
  .onChange(updateSky)
  .listen();
gui.add(skyController, "rayleigh", 0.0, 4, 0.001).onChange(updateSky).listen();
gui
  .add(skyController, "mieCoefficient", 0.0, 0.1, 0.001)
  .onChange(updateSky)
  .listen();
gui
  .add(skyController, "mieDirectionalG", 0.0, 1, 0.001)
  .onChange(updateSky)
  .listen();
gui
  .add(skyController, "elevation", -180, 180, 0.0001)
  .onChange(updateSky)
  .listen();
gui.add(skyController, "azimuth", -180, 180, 0.01).onChange(updateSky).listen();
gui.add(skyController, "exposure", 0, 1, 0.0001).onChange(updateSky).listen();

const skyDebug = {};
skyDebug.dawnChange = () => {
  Object.assign(skyController, skySettings.dawn);
  updateSky();
};
skyDebug.sunriseChange = () => {
  Object.assign(skyController, skySettings.sunrise);
  updateSky();
};
skyDebug.earlyMorningChange = () => {
  Object.assign(skyController, skySettings.earlyMorning);
  updateSky();
};
skyDebug.midMorningChange = () => {
  Object.assign(skyController, skySettings.midMorning);
  updateSky();
};
skyDebug.noonChange = () => {
  Object.assign(skyController, skySettings.noon);
  updateSky();
};
skyDebug.earlyAfternoonChange = () => {
  Object.assign(skyController, skySettings.earlyAfternoon);
  updateSky();
};
skyDebug.lateAfternoonChange = () => {
  Object.assign(skyController, skySettings.lateAfternoon);
  updateSky();
};
skyDebug.sunsetChange = () => {
  Object.assign(skyController, skySettings.sunset);
  updateSky();
};
skyDebug.duskChange = () => {
  Object.assign(skyController, skySettings.dusk);
  updateSky();
};
skyDebug.earlyNightChange = () => {
  Object.assign(skyController, skySettings.earlyNight);
  updateSky();
};
skyDebug.midnightChange = () => {
  Object.assign(skyController, skySettings.midnight);
  updateSky();
};

gui.add(skyDebug, "dawnChange");
gui.add(skyDebug, "sunriseChange");
gui.add(skyDebug, "earlyMorningChange");
gui.add(skyDebug, "midMorningChange");
gui.add(skyDebug, "noonChange");
gui.add(skyDebug, "earlyAfternoonChange");
gui.add(skyDebug, "lateAfternoonChange");
gui.add(skyDebug, "sunsetChange");
gui.add(skyDebug, "duskChange");
gui.add(skyDebug, "earlyNightChange");
gui.add(skyDebug, "midnightChange");
/**
 * Lights
 */
// Ambient light
debugObject.ambientLightColor = "#898d90";

const ambientLight = new THREE.AmbientLight(debugObject.ambientLightColor);
scene.add(ambientLight);

gui.addColor(debugObject, "ambientLightColor").onChange(() => {
  ambientLight.color.set(debugObject.ambientLightColor);
});

const directionalLight = new THREE.DirectionalLight("white", 3.24);
directionalLight.castShadow = true;
directionalLight.position.x = 3.363;
directionalLight.position.y = 3.854;
directionalLight.position.z = -3.029;
directionalLight.shadow.mapSize.set(1024 * 2, 1024 * 2);
directionalLight.shadow.camera.near = 4.39;
directionalLight.shadow.camera.far = 16;
directionalLight.shadow.camera.top = 5.5;
scene.add(directionalLight);

gui.add(directionalLight, "intensity", 0, 10, 0.01);

const updateDirectionalLight = () => {
  directionalLight.position.copy(sun);
  directionalLight.intensity = skyController.lightIntensity;
};

const directionalLightHelper = new THREE.DirectionalLightHelper(
  directionalLight
);
directionalLightHelper.visible = false;
scene.add(directionalLightHelper);

const directionalLightCameraHelper = new THREE.CameraHelper(
  directionalLight.shadow.camera
);
directionalLightCameraHelper.visible = false;
scene.add(directionalLightCameraHelper);

const updateCameraHelper = () => {
  directionalLight.shadow.camera.updateProjectionMatrix();
  directionalLightCameraHelper.update();
};

// gui
//   .add(directionalLight.shadow.camera, "near", -5, 5, 0.01)
//   .onChange(updateCameraHelper);
// gui
//   .add(directionalLight.shadow.camera, "far", -5, 100, 0.01)
//   .onChange(updateCameraHelper);
// gui
//   .add(directionalLight.shadow.camera, "top", -5, 7, 0.01)
//   .onChange(updateCameraHelper);
// gui
//   .add(directionalLight.shadow.camera, "bottom", -5, 5, 0.01)
//   .onChange(updateCameraHelper);
// gui
//   .add(directionalLight.shadow.camera, "left", -5, 5, 0.01)
//   .onChange(updateCameraHelper);
// gui
//   .add(directionalLight.shadow.camera, "right", -5, 5, 0.01)
//   .onChange(updateCameraHelper);

// Animate
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  if (camera) {
    // Renderer
    renderer.render(scene, camera);
  }

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};
tick();

/**
 * DOM
 */
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

const setTime = (hours, minutes) => {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

const getPartOfDay = (time) => {
  const dateObj = new Date(time * 1000);
  const currentTime = setTime(dateObj.getUTCHours(), dateObj.getMinutes());

  const timeIntervals = [
    { start: setTime(4, 30), end: setTime(6, 0), part: "dawn" },
    { start: setTime(6, 0), end: setTime(7, 0), part: "sunrise" },
    { start: setTime(7, 0), end: setTime(9, 0), part: "earlyMorning" },
    { start: setTime(9, 0), end: setTime(11, 0), part: "midMorning" },
    { start: setTime(11, 0), end: setTime(13, 0), part: "noon" },
    { start: setTime(13, 0), end: setTime(15, 0), part: "earlyAfternoon" },
    { start: setTime(15, 0), end: setTime(17, 0), part: "lateAfternoon" },
    { start: setTime(17, 0), end: setTime(18, 30), part: "sunset" },
    { start: setTime(18, 30), end: setTime(20, 0), part: "dusk" },
    { start: setTime(20, 0), end: setTime(22, 0), part: "earlyNight" },
  ];

  for (const interval of timeIntervals) {
    if (currentTime >= interval.start && currentTime <= interval.end) {
      return interval.part;
    }
  }

  return "midnight";
};

const updateWeather = async () => {
  try {
    const weatherInfo = await fetchWeather(city);
    console.log(weatherInfo);
    const { name, dt, timezone } = weatherInfo;
    const { main, description } = weatherInfo.weather[0];
    const { humidity, pressure, temp, feels_like } = weatherInfo.main;
    const windSpeed = weatherInfo.wind.speed;

    const newSkyController = skySettings[getPartOfDay(dt + timezone)];

    Object.assign(skyController, {
      ...newSkyController,
    });

    updateSky();
    console.log(getPartOfDay(dt + timezone));

    imgDOM.setAttribute(
      "src",
      `https://openweathermap.org/img/wn/${weatherInfo.weather[0].icon}@2x.png`
    );
    cityDOM.textContent = name;
    weatherDOM.textContent = main;
    weatherDescDOM.textContent = description;
    tempDOM.textContent = convertTemp(tempUnit, temp);
    realFeelDom.textContent = `Feels like: ${convertTemp(
      tempUnit,
      feels_like
    )}`;
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
