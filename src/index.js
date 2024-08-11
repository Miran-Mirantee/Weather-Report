import * as THREE from "three";
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Sky } from "three/examples/jsm/objects/Sky";
import flameVertexShader from "./shaders/flame/vertex.glsl";
import flameFragmentShader from "./shaders/flame/fragment.glsl";
import rainVertexShader from "./shaders/rain/vertex.glsl";
import rainFragmentShader from "./shaders/rain/fragment.glsl";
import "./style.css";

const api = "514e1ece08bcd2e992e2242256b805de";
let city = "Samut Sakhon";
let tempUnit = "c";
let isRaining = false;

/**
 * TODO:
 *  - add rain particle
 *  - add campfire smoke
 *  - add snow particle
 *  - add anti-aliasing
 *  - fix changing unit type call update weather()
 */

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

// Texture loader
const textureLoader = new THREE.TextureLoader();
const perlinTexture = textureLoader.load("../static/perlin.png");
perlinTexture.wrapS = THREE.RepeatWrapping;
perlinTexture.wrapT = THREE.RepeatWrapping;

const gradientTexture = textureLoader.load("../static/gradient.png");
gradientTexture.flipY = false;

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

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvasDom,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.75;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

/**
 * Sky & sun
 */
// Sky
const skyController = {
  turbidity: 10,
  rayleigh: 3,
  mieCoefficient: 0.001,
  mieDirectionalG: 0.99,
  elevation: 2,
  azimuth: 17,
  exposure: renderer.toneMappingExposure,
  lightIntensity: 3.24,
  sunColor: "#fff",
  ambientLightColor: "#898d90",
  elevationOffset: 0,
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
    lightIntensity: 2.5,
    sunColor: "#feda58",
    ambientLightColor: "#9e8b76",
    elevationOffset: 0,
  },
  sunrise: {
    turbidity: 0.5,
    rayleigh: 1.542,
    mieCoefficient: 0.007,
    mieDirectionalG: 0.999,
    elevation: -89.5,
    azimuth: 17,
    exposure: renderer.toneMappingExposure,
    lightIntensity: 3,
    sunColor: "#ffe485",
    ambientLightColor: "#898d90",
    elevationOffset: 0,
  },
  earlyMorning: {
    turbidity: 3.8,
    rayleigh: 0.903,
    mieCoefficient: 0.03,
    mieDirectionalG: 1,
    elevation: -60,
    azimuth: 17,
    exposure: renderer.toneMappingExposure,
    lightIntensity: 3.2,
    sunColor: "#fef3cd",
    ambientLightColor: "#5b84a4",
    elevationOffset: 0,
  },
  midMorning: {
    turbidity: 3.8,
    rayleigh: 0.903,
    mieCoefficient: 0.03,
    mieDirectionalG: 1,
    elevation: -30,
    azimuth: 17,
    exposure: renderer.toneMappingExposure,
    lightIntensity: 3.3,
    sunColor: "#fff5d6",
    ambientLightColor: "#5b84a4",
    elevationOffset: 0,
  },
  noon: {
    turbidity: 3.8,
    rayleigh: 0.903,
    mieCoefficient: 0.03,
    mieDirectionalG: 1,
    elevation: 0,
    azimuth: 17,
    exposure: renderer.toneMappingExposure,
    lightIntensity: 3.5,
    sunColor: "#fff5d6",
    ambientLightColor: "#5b84a4",
    elevationOffset: 0,
  },
  earlyAfternoon: {
    turbidity: 4.5,
    rayleigh: 0.903,
    mieCoefficient: 0.055,
    mieDirectionalG: 1,
    elevation: 60.5301,
    azimuth: 17,
    exposure: renderer.toneMappingExposure,
    lightIntensity: 3.3,
    sunColor: "#ffeba3",
    ambientLightColor: "#5ba477",
    elevationOffset: 0,
  },
  lateAfternoon: {
    turbidity: 5.3,
    rayleigh: 3.263,
    mieCoefficient: 0.073,
    mieDirectionalG: 0.041,
    elevation: 85,
    azimuth: 17,
    exposure: renderer.toneMappingExposure,
    lightIntensity: 3.2,
    sunColor: "#ffdf6b",
    ambientLightColor: "#a4a25b",
    elevationOffset: 0,
  },
  sunset: {
    turbidity: 20,
    rayleigh: 3.115,
    mieCoefficient: 0.015,
    mieDirectionalG: 0.999,
    elevation: 90,
    azimuth: 17,
    exposure: renderer.toneMappingExposure,
    lightIntensity: 3,
    sunColor: "#ff8e52",
    ambientLightColor: "#a4695b",
    elevationOffset: 2.6,
  },
  dusk: {
    turbidity: 9.9,
    rayleigh: 0.804,
    mieCoefficient: 0.015,
    mieDirectionalG: 0.999,
    elevation: 96,
    azimuth: 17,
    exposure: renderer.toneMappingExposure,
    lightIntensity: 0,
    sunColor: "#ff8e52",
    ambientLightColor: "#5a536a",
    elevationOffset: 0,
  },
  earlyNight: {
    turbidity: 20,
    rayleigh: 4,
    mieCoefficient: 0.015,
    mieDirectionalG: 0.999,
    elevation: 108,
    azimuth: 17,
    exposure: renderer.toneMappingExposure,
    lightIntensity: 0,
    sunColor: "#ff8e52",
    ambientLightColor: "#4c455f",
    elevationOffset: 0,
  },
  midnight: {
    turbidity: 20,
    rayleigh: 0,
    mieCoefficient: 0.1,
    mieDirectionalG: 0.999,
    elevation: 180,
    azimuth: 17,
    exposure: renderer.toneMappingExposure,
    lightIntensity: 0,
    sunColor: "#ff8e52",
    ambientLightColor: "#4c455f",
    elevationOffset: 0,
  },
};

const skyDebug = {};
skyDebug.dawnChange = () => {
  Object.assign(skyController, skySettings.dawn);
  updateSky();
  updateDirectionalLight();
  updateAmbientLight();
  updateRain();
  campfireObject.campfireOn();
};
skyDebug.sunriseChange = () => {
  Object.assign(skyController, skySettings.sunrise);
  updateSky();
  updateDirectionalLight();
  updateAmbientLight();
  updateRain();
  campfireObject.campfireOn();
};
skyDebug.earlyMorningChange = () => {
  Object.assign(skyController, skySettings.earlyMorning);
  updateSky();
  updateDirectionalLight();
  updateAmbientLight();
  updateRain();
  campfireObject.killCampfire();
};
skyDebug.midMorningChange = () => {
  Object.assign(skyController, skySettings.midMorning);
  updateSky();
  updateDirectionalLight();
  updateAmbientLight();
  updateRain();
  campfireObject.killCampfire();
};
skyDebug.noonChange = () => {
  Object.assign(skyController, skySettings.noon);
  updateSky();
  updateDirectionalLight();
  updateAmbientLight();
  updateRain();
  campfireObject.campfireOn();
};
skyDebug.earlyAfternoonChange = () => {
  Object.assign(skyController, skySettings.earlyAfternoon);
  updateSky();
  updateDirectionalLight();
  updateAmbientLight();
  updateRain();
  campfireObject.killCampfire();
};
skyDebug.lateAfternoonChange = () => {
  Object.assign(skyController, skySettings.lateAfternoon);
  updateSky();
  updateDirectionalLight();
  updateAmbientLight();
  updateRain();
  campfireObject.killCampfire();
};
skyDebug.sunsetChange = () => {
  Object.assign(skyController, skySettings.sunset);
  updateSky();
  updateDirectionalLight();
  updateAmbientLight();
  updateRain();
  campfireObject.campfireOn();
};
skyDebug.duskChange = () => {
  Object.assign(skyController, skySettings.dusk);
  updateSky();
  updateDirectionalLight();
  updateAmbientLight();
  updateRain();
  campfireObject.campfireOn();
};
skyDebug.earlyNightChange = () => {
  Object.assign(skyController, skySettings.earlyNight);
  updateSky();
  updateDirectionalLight();
  updateAmbientLight();
  updateRain();
  campfireObject.campfireOn();
};
skyDebug.midnightChange = () => {
  Object.assign(skyController, skySettings.midnight);
  updateSky();
  updateDirectionalLight();
  updateAmbientLight();
  updateRain();
  campfireObject.campfireOn();
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

const sky = new Sky();
scene.add(sky);
sky.scale.setScalar(5000);

const updateSky = () => {
  console.log("isRaining", isRaining);

  const uniforms = sky.material.uniforms;
  uniforms["turbidity"].value = skyController.turbidity;
  uniforms["rayleigh"].value = skyController.rayleigh;
  uniforms["mieCoefficient"].value = skyController.mieCoefficient;
  uniforms["mieDirectionalG"].value = skyController.mieDirectionalG;

  const phi = THREE.MathUtils.degToRad(skyController.elevation);
  const theta = THREE.MathUtils.degToRad(skyController.azimuth);

  sun.setFromSphericalCoords(10, phi, theta);
  const phiOffset = THREE.MathUtils.degToRad(
    skyController.elevation - skyController.elevationOffset
  );
  directionalLightPosition.setFromSphericalCoords(10, phiOffset, theta);

  uniforms["sunPosition"].value.copy(sun);

  renderer.toneMappingExposure = skyController.exposure;
  if (camera) renderer.render(scene, camera);
};

// Ambient light
const ambientLight = new THREE.AmbientLight(skyController.ambientLightColor);
scene.add(ambientLight);

gui
  .addColor(skyController, "ambientLightColor")
  .listen()
  .onChange(() => {
    ambientLight.color.set(skyController.ambientLightColor);
  });

const updateAmbientLight = () => {
  ambientLight.color.set(new THREE.Color(skyController.ambientLightColor));
};

// Sun
const sun = new THREE.Vector3();
const directionalLightPosition = new THREE.Vector3();

// Directional light
const directionalLight = new THREE.DirectionalLight("white", 3.24);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024 * 2, 1024 * 2);
directionalLight.shadow.camera.near = 4.39;
directionalLight.shadow.camera.far = 16;
directionalLight.shadow.camera.top = 5.5;
scene.add(directionalLight);

gui
  .add(directionalLight, "intensity", 0, 10, 0.01)
  .listen()
  .name("sunlight intensity");
gui
  .addColor(skyController, "sunColor")
  .listen()
  .onChange(() => {
    directionalLight.color.set(new THREE.Color(skyController.sunColor));
  });

const updateDirectionalLight = () => {
  directionalLight.position.copy(directionalLightPosition);
  directionalLight.intensity = Math.max(
    skyController.lightIntensity - (isRaining ? 2.5 : 0),
    0
  );
  directionalLight.color.set(new THREE.Color(skyController.sunColor));
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
  .onChange(() => {
    updateSky();
    updateDirectionalLight();
  })
  .listen();
gui
  .add(skyController, "elevationOffset", -180, 180, 0.0001)
  .onChange(() => {
    updateSky();
    updateDirectionalLight();
  })
  .listen();
gui
  .add(skyController, "azimuth", -180, 180, 0.01)
  .onChange(() => {
    updateSky();
    updateDirectionalLight();
  })
  .listen();
gui.add(skyController, "exposure", 0, 1, 0.0001).onChange(updateSky).listen();

/**
 * Campfire
 */
// Shader
const campfireObject = {};
campfireObject.pointLightColor = "#fbba2d";
campfireObject.intensity = 3.818;
campfireObject.distance = 0;
campfireObject.decay = 0.3294;
campfireObject.position = new THREE.Vector3(1.076, 0.263, -1.4012);
campfireObject.flameFirstColor = "#ff4d00";
campfireObject.flameSecondColor = "#fdea72";
campfireObject.flameThirdColor = "#ffae00";
campfireObject.toggleCampfire = () => {
  flame.visible = !flame.visible;
  pointLight.visible = !pointLight.visible;
};
campfireObject.killCampfire = () => {
  flame.visible = false;
  pointLight.visible = false;
};
campfireObject.campfireOn = () => {
  flame.visible = true;
  pointLight.visible = true;
};

gui.add(campfireObject, "toggleCampfire");

const updateCampfire = (partOfDay) => {
  switch (partOfDay) {
    // case "dawn":
    //   campfireObject.killCampfire();
    //   break;
    // case "sunrise":
    //   campfireObject.killCampfire();
    //   break;
    case "earlyMorning":
      campfireObject.killCampfire();
      break;
    case "midMorning":
      campfireObject.killCampfire();
      break;
    case "earlyAfternoon":
      campfireObject.killCampfire();
      break;
    case "lateAfternoon":
      campfireObject.killCampfire();
      break;
    default:
      campfireObject.campfireOn();
      break;
  }
};

const flameMaterial = new THREE.ShaderMaterial({
  vertexShader: flameVertexShader,
  fragmentShader: flameFragmentShader,
  uniforms: {
    uSize: new THREE.Uniform(1090.455),
    uPixelRatio: new THREE.Uniform(Math.min(window.devicePixelRatio, 2)),
    uPerlinTexture: new THREE.Uniform(perlinTexture),
    uGradientTexture: new THREE.Uniform(gradientTexture),
    uTime: new THREE.Uniform(0),
    uFirstColor: new THREE.Uniform(
      new THREE.Color(campfireObject.flameFirstColor)
    ),
    uSecondColor: new THREE.Uniform(
      new THREE.Color(campfireObject.flameSecondColor)
    ),
    uThirdColor: new THREE.Uniform(
      new THREE.Color(campfireObject.flameThirdColor)
    ),
    uGradientMultiply: new THREE.Uniform(1.349),
    uColumnMultiply: new THREE.Uniform(2.046),
  },
  transparent: true,
  blending: THREE.AdditiveBlending,
});

gui
  .add(flameMaterial.uniforms.uGradientMultiply, "value", 1.0, 2.0, 0.001)
  .name("uGradientMultiply");
gui
  .add(flameMaterial.uniforms.uColumnMultiply, "value", 1.0, 4.0, 0.001)
  .name("uColumnMultiply");
gui.addColor(campfireObject, "flameFirstColor").onChange(() => {
  flameMaterial.uniforms.uFirstColor.value.set(
    new THREE.Color(campfireObject.flameFirstColor)
  );
});
gui.addColor(campfireObject, "flameSecondColor").onChange(() => {
  flameMaterial.uniforms.uSecondColor.value.set(
    new THREE.Color(campfireObject.flameSecondColor)
  );
});
gui.addColor(campfireObject, "flameThirdColor").onChange(() => {
  flameMaterial.uniforms.uThirdColor.value.set(
    new THREE.Color(campfireObject.flameThirdColor)
  );
});

const flameGeometry = new THREE.BufferGeometry();
const flamePositionArray = new Float32Array(3);

flameGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(flamePositionArray, 3)
);

const flame = new THREE.Points(flameGeometry, flameMaterial);
flame.position.copy(campfireObject.position);

scene.add(flame);

// Point light
const pointLight = new THREE.PointLight(
  campfireObject.pointLightColor,
  campfireObject.intensity,
  campfireObject.distance,
  campfireObject.decay
);
pointLight.castShadow = true;
pointLight.position.copy(campfireObject.position);
pointLight.shadow.camera.far = 7.08;
pointLight.shadow.mapSize.set(1024 * 2, 1024 * 2);
scene.add(pointLight);

const pointLightHelper = new THREE.PointLightHelper(pointLight);
pointLightHelper.visible = false;
scene.add(pointLightHelper);

const pointLightCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera);
pointLightCameraHelper.visible = false;
scene.add(pointLightCameraHelper);

gui.add(pointLight, "intensity", 0, 20, 0.001).name("campfire light intensity");
gui.add(pointLight, "decay", 0, 5, 0.0001).name("campfire light decay");
gui
  .addColor(campfireObject, "pointLightColor")
  .onChange(() => {
    pointLight.color.set(new THREE.Color(campfireObject.color));
  })
  .name("campfire light color");

/**
 * Rain
 */
const rainObject = {};
rainObject.count = 10000;
rainObject.color = "#7ff0e8";
rainObject.toggleRain = () => {
  rain.visible = !rain.visible;
  isRaining = rain.visible;
  updateDirectionalLight();
};
rainObject.rainOn = () => {
  rain.visible = true;
  updateDirectionalLight();
};
rainObject.rainOff = () => {
  rain.visible = false;
  updateDirectionalLight();
};
rainObject.additiveBlendingChange = () => {
  rainMaterial.blending = THREE.AdditiveBlending;
};
rainObject.normalBlendingChange = () => {
  rainMaterial.blending = THREE.NormalBlending;
};

gui.add(rainObject, "toggleRain");
gui.add(rainObject, "additiveBlendingChange");
gui.add(rainObject, "normalBlendingChange");

const rainMaterial = new THREE.ShaderMaterial({
  vertexShader: rainVertexShader,
  fragmentShader: rainFragmentShader,
  uniforms: {
    // uSize: new THREE.Uniform(5000),
    uSize: new THREE.Uniform(600),
    uPixelRatio: new THREE.Uniform(Math.min(window.devicePixelRatio / 2)),
    uOpacity: new THREE.Uniform(0.45),
    uLength: new THREE.Uniform(0.6),
    uColor: new THREE.Uniform(new THREE.Color(rainObject.color)),
    uTime: new THREE.Uniform(0),
    uSpeed: new THREE.Uniform(4.0),
  },
  transparent: true,
  depthWrite: false,
  // blending: THREE.AdditiveBlending,
});

gui
  .add(rainMaterial.uniforms.uSize, "value", 0, 2000, 0.01)
  .name("rain particle size");
gui
  .add(rainMaterial.uniforms.uSpeed, "value", 0, 9.0, 0.01)
  .name("rain particle speed");
gui
  .add(rainMaterial.uniforms.uLength, "value", 0, 0.8, 0.01)
  .name("rain particle trail length");
gui
  .add(rainMaterial.uniforms.uOpacity, "value", 0, 1, 0.01)
  .name("rain particle opacity");
gui
  .addColor(rainObject, "color")
  .name("rain color")
  .onChange(() => {
    rainMaterial.uniforms.uColor.value.set(new THREE.Color(rainObject.color));
  });

const rainGeometry = new THREE.BufferGeometry();
const rainPositionArray = new Float32Array(rainObject.count * 3);

for (let i = 0; i < rainObject.count; i++) {
  const r = 3.64 * Math.sqrt(Math.random());
  const theta = Math.random() * 2 * Math.PI;

  const i3 = i * 3;
  rainPositionArray[i3] = -0.168078 + r * Math.cos(theta);
  rainPositionArray[i3 + 1] = Math.random() * 3.5;
  rainPositionArray[i3 + 2] = 1.25025 + r * Math.sin(theta);
}

rainGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(rainPositionArray, 3)
);

const rain = new THREE.Points(rainGeometry, rainMaterial);
rain.visible = isRaining;
scene.add(rain);
// rain.position.x = 1.076;
// rain.position.y = 1;
// rain.position.z = -1.4012;

const updateRain = () => {
  if (isRaining) {
    rainObject.rainOn();
  } else {
    rainObject.rainOff();
  }
};

// Animate
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  if (camera) {
    // Renderer
    renderer.render(scene, camera);
  }

  // Update time
  flameMaterial.uniforms.uTime.value = elapsedTime;
  rainMaterial.uniforms.uTime.value = elapsedTime;

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

const getPartOfDay = (time, weather) => {
  const dateObj = new Date(time * 1000);
  const currentTime = setTime(dateObj.getUTCHours(), dateObj.getMinutes());

  if (weather == "Rain") {
    const timeIntervals = [
      { start: setTime(4, 30), end: setTime(6, 0), part: "dawn" },
      { start: setTime(6, 0), end: setTime(7, 0), part: "sunrise" },
      { start: setTime(7, 0), end: setTime(9, 0), part: "earlyMorning" },
      { start: setTime(9, 0), end: setTime(11, 0), part: "midMorning" },
      { start: setTime(11, 0), end: setTime(13, 0), part: "noon" },
      { start: setTime(13, 0), end: setTime(15, 0), part: "earlyAfternoon" },
      { start: setTime(15, 0), end: setTime(18, 0), part: "lateAfternoon" },
      { start: setTime(18, 0), end: setTime(18, 30), part: "sunset" },
      { start: setTime(18, 30), end: setTime(20, 0), part: "dusk" },
      { start: setTime(20, 0), end: setTime(22, 0), part: "earlyNight" },
    ];

    for (const interval of timeIntervals) {
      if (currentTime >= interval.start && currentTime <= interval.end) {
        return interval.part;
      }
    }

    return "midnight";
  } else {
    const timeIntervals = [
      { start: setTime(4, 30), end: setTime(6, 0), part: "dawn" },
      { start: setTime(6, 0), end: setTime(7, 0), part: "sunrise" },
      { start: setTime(7, 0), end: setTime(9, 0), part: "earlyMorning" },
      { start: setTime(9, 0), end: setTime(11, 0), part: "midMorning" },
      { start: setTime(11, 0), end: setTime(13, 0), part: "noon" },
      { start: setTime(13, 0), end: setTime(15, 0), part: "earlyAfternoon" },
      { start: setTime(15, 0), end: setTime(18, 0), part: "lateAfternoon" },
      { start: setTime(18, 0), end: setTime(18, 30), part: "sunset" },
      { start: setTime(18, 30), end: setTime(20, 0), part: "dusk" },
      { start: setTime(20, 0), end: setTime(22, 0), part: "earlyNight" },
    ];

    for (const interval of timeIntervals) {
      if (currentTime >= interval.start && currentTime <= interval.end) {
        return interval.part;
      }
    }

    return "midnight";
  }
};

const updateWeather = async () => {
  try {
    const weatherInfo = await fetchWeather(city);
    console.log(weatherInfo);
    const { name, dt, timezone } = weatherInfo;
    const { main, description } = weatherInfo.weather[0];
    const { humidity, pressure, temp, feels_like } = weatherInfo.main;
    const windSpeed = weatherInfo.wind.speed;
    const partOfDay = getPartOfDay(dt + timezone, main);
    const newSkyController = skySettings[partOfDay];
    isRaining = main == "Rain";

    Object.assign(skyController, {
      ...newSkyController,
    });

    updateSky();
    updateDirectionalLight();
    updateCampfire(partOfDay);
    updateRain();

    console.log(partOfDay);

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
