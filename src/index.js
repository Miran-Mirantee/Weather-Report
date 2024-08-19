import * as THREE from "three";
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Sky } from "three/examples/jsm/objects/Sky";
import CustomShaderMaterial from "three-custom-shader-material/vanilla";
import flameVertexShader from "./shaders/flame/vertex.glsl";
import flameFragmentShader from "./shaders/flame/fragment.glsl";
import rainVertexShader from "./shaders/rain/vertex.glsl";
import rainFragmentShader from "./shaders/rain/fragment.glsl";
import snowVertexShader from "./shaders/snow/vertex.glsl";
import snowFragmentShader from "./shaders/snow/fragment.glsl";
import grassVertexShader from "./shaders/grass/vertex.glsl";
import grassFragmentShader from "./shaders/grass/fragment.glsl";
import tentRoofVertexShader from "./shaders/tentRoof/vertex.glsl";
import tentRoofFragmentShader from "./shaders/tentRoof/fragment.glsl";
import leavesVertexShader from "./shaders/leaves/vertex.glsl";
import leavesFragmentShader from "./shaders/leaves/fragment.glsl";
import smokeVertexShader from "./shaders/smoke/vertex.glsl";
import smokeFragmentShader from "./shaders/smoke/fragment.glsl";
import "./style.css";

const api = "514e1ece08bcd2e992e2242256b805de";
let city = "Samut Sakhon";
let tempUnit = "c";
let isRaining = false;
let isSnowing = false;
let currentTime;

/**
 * TODO:
 *  - add campfire smoke
 *  - add anti-aliasing
 *  - fix changing unit type call update weather()
 */

// gui
const gui = new GUI();
const sunAndSkySettings = gui.addFolder("Sun & Sky settings");
const campfireSettings = gui.addFolder("Campfire settings");
const rainSettings = gui.addFolder("Rain settings");
const snowSettings = gui.addFolder("Snow settings");
const smokeSettings = gui.addFolder("Smoke settings");

// gui.close();
sunAndSkySettings.close();
campfireSettings.close();
rainSettings.close();
snowSettings.close();

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

const smokeTexture = textureLoader.load("../static/smoke_07.png");

let camera;

const debugObject = {};

// Models
gltfLoader.load("../static/camping.glb", (gltf) => {
  // Camera
  camera = gltf.cameras[0];
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  const controls = new OrbitControls(camera, canvasDom);
  const merged = gltf.scene.children.find((child) => child.name == "merged");
  for (const child of merged.children) {
    child.receiveShadow = true;
    child.castShadow = true;
    child.material.side = 1;
  }

  const leaves = merged.children.find(
    (child) => child.material.name == "leaves"
  );

  const customLeavesMaterial = new CustomShaderMaterial({
    // CSM
    baseMaterial: THREE.MeshStandardMaterial,
    slient: true,
    fragmentShader: leavesFragmentShader,
    vertexShader: leavesVertexShader,
    uniforms: {
      uLeavesColor: new THREE.Uniform(leaves.material.color),
      uSnowColor: new THREE.Uniform(new THREE.Color(snowObject.color)),
      uSnowCoverage: new THREE.Uniform(0),
    },

    // MeshStandardMaterial
    ...leaves.material,
  });
  leaves.material = customLeavesMaterial;

  const tentRoof = gltf.scene.children.find(
    (child) => child.name == "tentRoof"
  );

  const customTentRoofMaterial = new CustomShaderMaterial({
    // CSM
    baseMaterial: THREE.MeshStandardMaterial,
    silent: true,
    fragmentShader: tentRoofFragmentShader,
    vertexShader: tentRoofVertexShader,
    uniforms: {
      uTentColor: new THREE.Uniform(tentRoof.material.color),
      uSnowColor: new THREE.Uniform(new THREE.Color(snowObject.color)),
      uSnowCoverage: new THREE.Uniform(0),
    },
    // MeshStandardMaterial
    ...tentRoof.material,
    side: 1,
  });
  tentRoof.material = customTentRoofMaterial;
  tentRoof.castShadow = true;
  tentRoof.receiveShadow = true;

  const tentShade = gltf.scene.children.find(
    (child) => child.name == "tentShade"
  );

  const customTentShadeMaterial = new CustomShaderMaterial({
    // CSM
    baseMaterial: THREE.MeshStandardMaterial,
    silent: true,
    fragmentShader: tentRoofFragmentShader,
    vertexShader: tentRoofVertexShader,
    uniforms: {
      uPerlinTexture: new THREE.Uniform(perlinTexture),
      uTentColor: new THREE.Uniform(tentShade.material.color),
      uSnowColor: new THREE.Uniform(new THREE.Color(snowObject.color)),
      uSnowCoverage: new THREE.Uniform(0),
    },
    // MeshStandardMaterial
    ...tentShade.material,
  });

  tentShade.material = customTentShadeMaterial;
  tentShade.castShadow = true;

  const grass = merged.children.find((child) => child.material.name == "grass");

  const customGrassMaterial = new CustomShaderMaterial({
    // CSM
    baseMaterial: THREE.MeshStandardMaterial,
    silent: true,
    vertexShader: grassVertexShader,
    fragmentShader: grassFragmentShader,
    uniforms: {
      uPerlinTexture: new THREE.Uniform(perlinTexture),
      uGrassColor: new THREE.Uniform(grass.material.color),
      uSnowColor: new THREE.Uniform(new THREE.Color(snowObject.color)),
      uSnowCoverage: new THREE.Uniform(snowObject.coverage),
    },

    // MeshStandardMaterial
    ...grass.material,
  });
  grass.material = customGrassMaterial;

  debugObject.updateGrass = () => {
    customGrassMaterial.uniforms.uSnowCoverage.value = snowObject.coverage;
    customTentShadeMaterial.uniforms.uSnowCoverage.value = snowObject.coverage;
    customTentRoofMaterial.uniforms.uSnowCoverage.value = snowObject.coverage;
    customLeavesMaterial.uniforms.uSnowCoverage.value = snowObject.coverage;
  };

  snowSettings
    .add(snowObject, "coverage", 0, 1, 0.001)
    .name("snow coverage")
    .listen()
    .onChange(() => {
      customTentRoofMaterial.uniforms.uSnowCoverage.value = snowObject.coverage;
      customTentShadeMaterial.uniforms.uSnowCoverage.value =
        snowObject.coverage;
      customGrassMaterial.uniforms.uSnowCoverage.value = snowObject.coverage;
      customLeavesMaterial.uniforms.uSnowCoverage.value = snowObject.coverage;
    });

  snowSettings
    .addColor(snowObject, "color")
    .listen()
    .name("snow color")
    .onChange(() => {
      snowMaterial.uniforms.uColor.value.set(new THREE.Color(snowObject.color));
      customGrassMaterial.uniforms.uSnowColor.value.set(
        new THREE.Color(snowObject.color)
      );
      customTentRoofMaterial.uniforms.uSnowColor.value.set(
        new THREE.Color(snowObject.color)
      );
      customTentShadeMaterial.uniforms.uSnowColor.value.set(
        new THREE.Color(snowObject.color)
      );
      customLeavesMaterial.uniforms.uSnowColor.value.set(
        new THREE.Color(snowObject.color)
      );
    });

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
  rainingDawn: {
    turbidity: 2.1,
    rayleigh: 1.443,
    mieCoefficient: 0.02,
    mieDirectionalG: 0.25,
    elevation: -90,
    azimuth: 17,
    exposure: renderer.toneMappingExposure,
    lightIntensity: 0.5,
    sunColor: "#feda58",
    ambientLightColor: "#9e8b76",
    elevationOffset: 0,
  },
  rainingSunrise: {
    turbidity: 0.5,
    rayleigh: 1.542,
    mieCoefficient: 0.007,
    mieDirectionalG: 0.999,
    elevation: -89.5,
    azimuth: 17,
    exposure: renderer.toneMappingExposure,
    lightIntensity: 0.5,
    sunColor: "#ffe485",
    ambientLightColor: "#898d90",
    elevationOffset: 0,
  },
  rainingEarlyMorning: {
    turbidity: 20,
    rayleigh: 0.387,
    mieCoefficient: 0.03,
    mieDirectionalG: 1,
    elevation: -60,
    azimuth: 17,
    exposure: 0.7,
    lightIntensity: 0.7,
    sunColor: "#fef3cd",
    ambientLightColor: "#5b84a4",
    elevationOffset: 0,
  },
  rainingMidMorning: {
    turbidity: 20,
    rayleigh: 0.387,
    mieCoefficient: 0.03,
    mieDirectionalG: 1,
    elevation: -30,
    azimuth: 17,
    exposure: 0.7,
    lightIntensity: 0.8,
    sunColor: "#fff5d6",
    ambientLightColor: "#5b84a4",
    elevationOffset: 0,
  },
  rainingNoon: {
    turbidity: 20,
    rayleigh: 0.387,
    mieCoefficient: 0.03,
    mieDirectionalG: 1,
    elevation: 0,
    azimuth: 17,
    exposure: 0.7,
    lightIntensity: 1.0,
    sunColor: "#fff5d6",
    ambientLightColor: "#5b84a4",
    elevationOffset: 0,
  },
  rainingEarlyAfternoon: {
    turbidity: 20,
    rayleigh: 0.387,
    mieCoefficient: 0.055,
    mieDirectionalG: 1,
    elevation: 60.5301,
    azimuth: 17,
    exposure: 0.7,
    lightIntensity: 0.8,
    sunColor: "#ffeba3",
    ambientLightColor: "#5ba477",
    elevationOffset: 0,
  },
  rainingLateAfternoon: {
    turbidity: 20,
    rayleigh: 0.387,
    mieCoefficient: 0.073,
    mieDirectionalG: 0.041,
    elevation: 85,
    azimuth: 17,
    exposure: 0.7,
    lightIntensity: 0.7,
    sunColor: "#ffdf6b",
    ambientLightColor: "#a4a25b",
    elevationOffset: 0,
  },
  rainingSunset: {
    turbidity: 20,
    rayleigh: 2.5,
    mieCoefficient: 0.015,
    mieDirectionalG: 0.999,
    elevation: 90,
    azimuth: 17,
    exposure: 0.6,
    lightIntensity: 0.5,
    sunColor: "#ff8e52",
    ambientLightColor: "#a4695b",
    elevationOffset: 2.6,
  },
  rainingDusk: {
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
  rainingEarlyNight: {
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
  rainingMidnight: {
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
  snowingDawn: {
    turbidity: 16.6,
    rayleigh: 0.952,
    mieCoefficient: 0.02,
    mieDirectionalG: 0.25,
    elevation: -90,
    azimuth: 17,
    exposure: renderer.toneMappingExposure,
    lightIntensity: 1.5,
    sunColor: "#feda58",
    ambientLightColor: "#9e8b76",
    elevationOffset: 0,
  },
  snowingSunrise: {
    turbidity: 0,
    rayleigh: 4,
    mieCoefficient: 0.007,
    mieDirectionalG: 0.999,
    elevation: -89.5,
    azimuth: 17,
    exposure: renderer.toneMappingExposure,
    lightIntensity: 2,
    sunColor: "#ffe485",
    ambientLightColor: "#898d90",
    elevationOffset: 0,
  },
  snowingEarlyMorning: {
    turbidity: 20,
    rayleigh: 3.115,
    mieCoefficient: 0.03,
    mieDirectionalG: 1,
    elevation: -60,
    azimuth: 17,
    exposure: renderer.toneMappingExposure,
    lightIntensity: 2.2,
    sunColor: "#fef3cd",
    ambientLightColor: "#5b84a4",
    elevationOffset: 0,
  },
  snowingMidMorning: {
    turbidity: 20,
    rayleigh: 3.115,
    mieCoefficient: 0.03,
    mieDirectionalG: 1,
    elevation: -30,
    azimuth: 17,
    exposure: renderer.toneMappingExposure,
    lightIntensity: 2.3,
    sunColor: "#fff5d6",
    ambientLightColor: "#5b84a4",
    elevationOffset: 0,
  },
  snowingNoon: {
    turbidity: 20,
    rayleigh: 3.115,
    mieCoefficient: 0.03,
    mieDirectionalG: 1,
    elevation: 0,
    azimuth: 17,
    exposure: renderer.toneMappingExposure,
    lightIntensity: 2.5,
    sunColor: "#fff5d6",
    ambientLightColor: "#5b84a4",
    elevationOffset: 0,
  },
  snowingEarlyAfternoon: {
    turbidity: 20,
    rayleigh: 3.115,
    mieCoefficient: 0.055,
    mieDirectionalG: 1,
    elevation: 60.5301,
    azimuth: 17,
    exposure: renderer.toneMappingExposure,
    lightIntensity: 2.3,
    sunColor: "#ffeba3",
    ambientLightColor: "#5ba477",
    elevationOffset: 0,
  },
  snowingLateAfternoon: {
    turbidity: 20,
    rayleigh: 3.115,
    mieCoefficient: 0.073,
    mieDirectionalG: 0.041,
    elevation: 85,
    azimuth: 17,
    exposure: renderer.toneMappingExposure,
    lightIntensity: 2.2,
    sunColor: "#ffdf6b",
    ambientLightColor: "#a4a25b",
    elevationOffset: 0,
  },
  snowingSunset: {
    turbidity: 20,
    rayleigh: 3.115,
    mieCoefficient: 0.015,
    mieDirectionalG: 0.999,
    elevation: 90,
    azimuth: 17,
    exposure: renderer.toneMappingExposure,
    lightIntensity: 2,
    sunColor: "#ff8e52",
    ambientLightColor: "#bd6751",
    elevationOffset: 2.6,
  },
  snowingDusk: {
    turbidity: 9.9,
    rayleigh: 0.804,
    mieCoefficient: 0.015,
    mieDirectionalG: 0.999,
    elevation: 96,
    azimuth: 17,
    exposure: renderer.toneMappingExposure,
    lightIntensity: 0,
    sunColor: "#ff8e52",
    ambientLightColor: "#7d5a81",
    elevationOffset: 0,
  },
  snowingEarlyNight: {
    turbidity: 20,
    rayleigh: 4,
    mieCoefficient: 0.015,
    mieDirectionalG: 0.999,
    elevation: 108,
    azimuth: 17,
    exposure: renderer.toneMappingExposure,
    lightIntensity: 0,
    sunColor: "#ff8e52",
    ambientLightColor: "#64436b",
    elevationOffset: 0,
  },
  snowingMidnight: {
    turbidity: 20,
    rayleigh: 0,
    mieCoefficient: 0.1,
    mieDirectionalG: 0.999,
    elevation: 180,
    azimuth: 17,
    exposure: renderer.toneMappingExposure,
    lightIntensity: 0,
    sunColor: "#ff8e52",
    ambientLightColor: "#64436b",
    elevationOffset: 0,
  },
};

const skyDebug = {};
skyDebug.dawnChange = () => {
  if (isRaining) {
    Object.assign(skyController, skySettings.rainingDawn);
    currentTime = "rainingDawn";
  } else if (isSnowing) {
    Object.assign(skyController, skySettings.snowingDawn);
    currentTime = "snowingDawn";
  } else {
    Object.assign(skyController, skySettings.dawn);
    currentTime = "dawn";
  }
  updateScene();
};
skyDebug.sunriseChange = () => {
  if (isRaining) {
    Object.assign(skyController, skySettings.rainingSunrise);
    currentTime = "rainingSunrise";
  } else if (isSnowing) {
    Object.assign(skyController, skySettings.snowingSunrise);
    currentTime = "snowingSunrise";
  } else {
    Object.assign(skyController, skySettings.sunrise);
    currentTime = "sunrise";
  }
  updateScene();
};
skyDebug.earlyMorningChange = () => {
  if (isRaining) {
    Object.assign(skyController, skySettings.rainingEarlyMorning);
    currentTime = "rainingEarlyMorning";
  } else if (isSnowing) {
    Object.assign(skyController, skySettings.snowingEarlyMorning);
    currentTime = "snowingEarlyMorning";
  } else {
    Object.assign(skyController, skySettings.earlyMorning);
    currentTime = "earlyMorning";
  }
  updateScene();
};
skyDebug.midMorningChange = () => {
  if (isRaining) {
    Object.assign(skyController, skySettings.rainingMidMorning);
    currentTime = "rainingMidMorning";
  } else if (isSnowing) {
    Object.assign(skyController, skySettings.snowingMidMorning);
    currentTime = "snowingMidMorning";
  } else {
    Object.assign(skyController, skySettings.midMorning);
    currentTime = "midMorning";
  }
  updateScene();
};
skyDebug.noonChange = () => {
  if (isRaining) {
    Object.assign(skyController, skySettings.rainingNoon);
    currentTime = "rainingNoon";
  } else if (isSnowing) {
    Object.assign(skyController, skySettings.snowingNoon);
    currentTime = "snowingNoon";
  } else {
    Object.assign(skyController, skySettings.noon);
    currentTime = "noon";
  }
  updateScene();
};
skyDebug.earlyAfternoonChange = () => {
  if (isRaining) {
    Object.assign(skyController, skySettings.rainingEarlyAfternoon);
    currentTime = "rainingEarlyAfternoon";
  } else if (isSnowing) {
    Object.assign(skyController, skySettings.snowingEarlyAfternoon);
    currentTime = "snowingEarlyAfternoon";
  } else {
    Object.assign(skyController, skySettings.earlyAfternoon);
    currentTime = "earlyAfternoon";
  }
  updateScene();
};
skyDebug.lateAfternoonChange = () => {
  if (isRaining) {
    Object.assign(skyController, skySettings.rainingLateAfternoon);
    currentTime = "rainingLateAfternoon";
  } else if (isSnowing) {
    Object.assign(skyController, skySettings.snowingLateAfternoon);
    currentTime = "snowingLateAfternoon";
  } else {
    Object.assign(skyController, skySettings.lateAfternoon);
    currentTime = "lateAfternoon";
  }
  updateScene();
};
skyDebug.sunsetChange = () => {
  if (isRaining) {
    Object.assign(skyController, skySettings.rainingSunset);
    currentTime = "rainingSunset";
  } else if (isSnowing) {
    Object.assign(skyController, skySettings.snowingSunset);
    currentTime = "snowingSunset";
  } else {
    Object.assign(skyController, skySettings.sunset);
    currentTime = "sunset";
  }
  updateScene();
};
skyDebug.duskChange = () => {
  if (isRaining) {
    Object.assign(skyController, skySettings.rainingDusk);
    currentTime = "rainingDusk";
  } else if (isSnowing) {
    Object.assign(skyController, skySettings.snowingDusk);
    currentTime = "snowingDusk";
  } else {
    Object.assign(skyController, skySettings.dusk);
    currentTime = "dusk";
  }
  updateScene();
};
skyDebug.earlyNightChange = () => {
  if (isRaining) {
    Object.assign(skyController, skySettings.rainingEarlyNight);
    currentTime = "rainingEarlyNight";
  } else if (isSnowing) {
    Object.assign(skyController, skySettings.snowingEarlyNight);
    currentTime = "snowingEarlyNight";
  } else {
    Object.assign(skyController, skySettings.earlyNight);
    currentTime = "earlyNight";
  }
  updateScene();
};
skyDebug.midnightChange = () => {
  if (isRaining) {
    Object.assign(skyController, skySettings.rainingMidnight);
    currentTime = "rainingMidnight";
  } else if (isSnowing) {
    Object.assign(skyController, skySettings.snowingMidnight);
    currentTime = "snowingMidnight";
  } else {
    Object.assign(skyController, skySettings.midnight);
    currentTime = "midnight";
  }
  updateScene();
};

sunAndSkySettings.add(skyDebug, "dawnChange");
sunAndSkySettings.add(skyDebug, "sunriseChange");
sunAndSkySettings.add(skyDebug, "earlyMorningChange");
sunAndSkySettings.add(skyDebug, "midMorningChange");
sunAndSkySettings.add(skyDebug, "noonChange");
sunAndSkySettings.add(skyDebug, "earlyAfternoonChange");
sunAndSkySettings.add(skyDebug, "lateAfternoonChange");
sunAndSkySettings.add(skyDebug, "sunsetChange");
sunAndSkySettings.add(skyDebug, "duskChange");
sunAndSkySettings.add(skyDebug, "earlyNightChange");
sunAndSkySettings.add(skyDebug, "midnightChange");

const sky = new Sky();
scene.add(sky);
sky.scale.setScalar(5000);

const updateSky = () => {
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

sunAndSkySettings
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

sunAndSkySettings
  .add(directionalLight, "intensity", 0, 10, 0.01)
  .listen()
  .name("sunlight intensity");
sunAndSkySettings
  .addColor(skyController, "sunColor")
  .listen()
  .onChange(() => {
    directionalLight.color.set(new THREE.Color(skyController.sunColor));
  });

const updateDirectionalLight = () => {
  directionalLight.position.copy(directionalLightPosition);
  directionalLight.intensity = skyController.lightIntensity;
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

sunAndSkySettings
  .add(skyController, "turbidity", 0.0, 20.0, 0.1)
  .onChange(updateSky)
  .listen();
sunAndSkySettings
  .add(skyController, "rayleigh", 0.0, 4, 0.001)
  .onChange(updateSky)
  .listen();
sunAndSkySettings
  .add(skyController, "mieCoefficient", 0.0, 0.1, 0.001)
  .onChange(updateSky)
  .listen();
sunAndSkySettings
  .add(skyController, "mieDirectionalG", 0.0, 1, 0.001)
  .onChange(updateSky)
  .listen();
sunAndSkySettings
  .add(skyController, "elevation", -180, 180, 0.0001)
  .onChange(() => {
    updateSky();
    updateDirectionalLight();
  })
  .listen();
sunAndSkySettings
  .add(skyController, "elevationOffset", -180, 180, 0.0001)
  .onChange(() => {
    updateSky();
    updateDirectionalLight();
  })
  .listen();
sunAndSkySettings
  .add(skyController, "azimuth", -180, 180, 0.01)
  .onChange(() => {
    updateSky();
    updateDirectionalLight();
  })
  .listen();
sunAndSkySettings
  .add(skyController, "exposure", 0, 1, 0.0001)
  .onChange(updateSky)
  .listen();

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

campfireSettings.add(campfireObject, "toggleCampfire");

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
    case "rainingEarlyMorning":
      campfireObject.killCampfire();
      break;
    case "rainingMidMorning":
      campfireObject.killCampfire();
      break;
    case "rainingEarlyAfternoon":
      campfireObject.killCampfire();
      break;
    case "rainingLateAfternoon":
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
  depthWrite: false,
});

campfireSettings
  .add(flameMaterial.uniforms.uGradientMultiply, "value", 1.0, 2.0, 0.001)
  .name("uGradientMultiply");
campfireSettings
  .add(flameMaterial.uniforms.uColumnMultiply, "value", 1.0, 4.0, 0.001)
  .name("uColumnMultiply");
campfireSettings.addColor(campfireObject, "flameFirstColor").onChange(() => {
  flameMaterial.uniforms.uFirstColor.value.set(
    new THREE.Color(campfireObject.flameFirstColor)
  );
});
campfireSettings.addColor(campfireObject, "flameSecondColor").onChange(() => {
  flameMaterial.uniforms.uSecondColor.value.set(
    new THREE.Color(campfireObject.flameSecondColor)
  );
});
campfireSettings.addColor(campfireObject, "flameThirdColor").onChange(() => {
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
flame.visible = false;

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

campfireSettings
  .add(pointLight, "intensity", 0, 20, 0.001)
  .name("campfire light intensity");
campfireSettings
  .add(pointLight, "decay", 0, 5, 0.0001)
  .name("campfire light decay");
campfireSettings
  .addColor(campfireObject, "pointLightColor")
  .onChange(() => {
    pointLight.color.set(new THREE.Color(campfireObject.pointLightColor));
  })
  .name("campfire light color");

// Smoke
const smokeObject = {};
smokeObject.count = 1000;

const smokeGeometry = new THREE.BufferGeometry();
const smokePositionArray = new Float32Array(smokeObject.count * 3);
const smokeScaleArray = new Float32Array(smokeObject.count);

for (let i = 0; i < smokeObject.count; i++) {
  const i3 = i * 3;
  smokePositionArray[i3] = (Math.random() - 0.5) * 0.25;
  smokePositionArray[i3 + 1] = Math.random() * 3.5;
  smokePositionArray[i3 + 2] = (Math.random() - 0.5) * 0.25;

  smokeScaleArray[i] = Math.random() * 0.5 + 0.5;
}

smokeGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(smokePositionArray, 3)
);

smokeGeometry.setAttribute(
  "aScale",
  new THREE.BufferAttribute(smokeScaleArray, 1)
);

const smokeMaterial = new THREE.ShaderMaterial({
  vertexShader: smokeVertexShader,
  fragmentShader: smokeFragmentShader,
  uniforms: {
    uSmokeTexture: new THREE.Uniform(smokeTexture),
    uSize: new THREE.Uniform(100),
    uPixelRatio: new THREE.Uniform(Math.min(window.devicePixelRatio, 2)),
    uTime: new THREE.Uniform(0),
  },
  transparent: true,
  depthWrite: false,
});

smokeSettings
  .add(smokeMaterial.uniforms.uSize, "value", 0, 1000, 1)
  .name("smoke particle size");

const smoke = new THREE.Points(smokeGeometry, smokeMaterial);
smoke.position.copy(campfireObject.position);
scene.add(smoke);

/**
 * Rain
 */
const rainObject = {};
rainObject.count = 10000;
rainObject.color = "#7ff0e8";
rainObject.toggleRain = () => {
  snowObject.snowOff();
  rain.visible = !rain.visible;
  isRaining = rain.visible;
  currentTime = toggleRainOfDay(currentTime);
  const newSkyController = skySettings[currentTime];
  Object.assign(skyController, {
    ...newSkyController,
  });

  updateScene();
};
rainObject.rainOn = () => {
  rain.visible = true;
  isRaining = true;
};
rainObject.rainOff = () => {
  rain.visible = false;
  isRaining = false;
};
rainObject.additiveBlendingChange = () => {
  rainMaterial.blending = THREE.AdditiveBlending;
};
rainObject.normalBlendingChange = () => {
  rainMaterial.blending = THREE.NormalBlending;
};

const toggleRainOfDay = (partOfDay) => {
  if (partOfDay.startsWith("raining")) {
    // Remove "raining" prefix and convert the first letter of the remaining part to lowercase
    return partOfDay
      .replace("raining", "")
      .replace(/^./, (str) => str.toLowerCase());
  } else if (partOfDay.startsWith("snowing")) {
    // Remove "snowing" prefix, add "raining" prefix and capitalize the first letter of partOfDay
    return (
      "raining" +
      partOfDay.replace("snowing", "").replace(/^./, (str) => str.toUpperCase())
    );
  } else {
    // Add "raining" prefix and capitalize the first letter of partOfDay
    return "raining" + partOfDay.replace(/^./, (str) => str.toUpperCase());
  }
};

rainSettings.add(rainObject, "toggleRain");
rainSettings.add(rainObject, "additiveBlendingChange");
rainSettings.add(rainObject, "normalBlendingChange");

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

rainSettings
  .add(rainMaterial.uniforms.uSize, "value", 0, 2000, 0.01)
  .name("rain particle size");
rainSettings
  .add(rainMaterial.uniforms.uSpeed, "value", 0, 9.0, 0.01)
  .name("rain particle speed");
rainSettings
  .add(rainMaterial.uniforms.uLength, "value", 0, 0.8, 0.01)
  .name("rain particle trail length");
rainSettings
  .add(rainMaterial.uniforms.uOpacity, "value", 0, 1, 0.01)
  .name("rain particle opacity");
rainSettings
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

const updateRain = () => {
  if (isRaining) {
    rainObject.rainOn();
  } else {
    rainObject.rainOff();
  }
};

/**
 * Snow
 */
const snowObject = {};
snowObject.count = 1000;
snowObject.color = "#fff";
snowObject.coverage = 0;
snowObject.toggleSnow = () => {
  rainObject.rainOff();
  snow.visible = !snow.visible;
  isSnowing = snow.visible;
  currentTime = toggleSnowOfDay(currentTime);
  const newSkyController = skySettings[currentTime];
  Object.assign(skyController, {
    ...newSkyController,
  });

  updateScene();
};
snowObject.snowOn = () => {
  snow.visible = true;
  isSnowing = true;
};
snowObject.snowOff = () => {
  snow.visible = false;
  isSnowing = false;
};
snowObject.additiveBlendingChange = () => {
  snowMaterial.blending = THREE.AdditiveBlending;
};
snowObject.normalBlendingChange = () => {
  snowMaterial.blending = THREE.NormalBlending;
};

const toggleSnowOfDay = (partOfDay) => {
  if (partOfDay.startsWith("snowing")) {
    // Remove "snowing" prefix and convert the first letter of the remaining part to lowercase
    return partOfDay
      .replace("snowing", "")
      .replace(/^./, (str) => str.toLowerCase());
  } else if (partOfDay.startsWith("raining")) {
    // Remove "raining" prefix, add "snowing" prefix and capitalize the first letter of partOfDay
    return (
      "snowing" +
      partOfDay.replace("raining", "").replace(/^./, (str) => str.toUpperCase())
    );
  } else {
    // Add "snowing" prefix and capitalize the first letter of partOfDay
    return "snowing" + partOfDay.replace(/^./, (str) => str.toUpperCase());
  }
};

snowSettings.add(snowObject, "toggleSnow");
snowSettings.add(snowObject, "additiveBlendingChange");
snowSettings.add(snowObject, "normalBlendingChange");

const snowMaterial = new THREE.ShaderMaterial({
  vertexShader: snowVertexShader,
  fragmentShader: snowFragmentShader,
  uniforms: {
    uSize: new THREE.Uniform(100),
    uSpeed: new THREE.Uniform(1),
    uPixelRatio: new THREE.Uniform(Math.min(window.devicePixelRatio, 2)),
    uTime: new THREE.Uniform(0),
    uColor: new THREE.Uniform(new THREE.Color(snowObject.color)),
  },
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  transparent: true,
});

snowSettings
  .add(snowMaterial.uniforms.uSize, "value", 0, 200, 0.01)
  .listen()
  .name("snow particle size");
snowSettings
  .add(snowMaterial.uniforms.uSpeed, "value", 0, 10, 0.01)
  .listen()
  .name("snow particle speed");

const snowGeometry = new THREE.BufferGeometry();
const snowPositionArray = new Float32Array(snowObject.count * 3);
const snowScaleArray = new Float32Array(snowObject.count);

for (let i = 0; i < snowObject.count; i++) {
  const r = 3.64 * Math.sqrt(Math.random());
  const theta = Math.random() * 2 * Math.PI;

  const i3 = i * 3;
  snowPositionArray[i3] = -0.168078 + r * Math.cos(theta);
  snowPositionArray[i3 + 1] = Math.random() * 3.5;
  snowPositionArray[i3 + 2] = 1.25025 + r * Math.sin(theta);

  snowScaleArray[i] = Math.random();
}

snowGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(snowPositionArray, 3)
);
snowGeometry.setAttribute(
  "aScale",
  new THREE.BufferAttribute(snowScaleArray, 1)
);

const snow = new THREE.Points(snowGeometry, snowMaterial);
snow.visible = isSnowing;
scene.add(snow);

const updateSnow = () => {
  if (isSnowing) {
    snowObject.snowOn();
  } else {
    snowObject.snowOff();
  }
};

const updateScene = () => {
  updateSky();
  updateDirectionalLight();
  updateAmbientLight();
  updateCampfire(currentTime);
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
  snowMaterial.uniforms.uTime.value = elapsedTime;
  smokeMaterial.uniforms.uTime.value = elapsedTime;

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
      { start: setTime(4, 30), end: setTime(6, 0), part: "rainingDawn" },
      { start: setTime(6, 0), end: setTime(7, 0), part: "rainingSunrise" },
      { start: setTime(7, 0), end: setTime(9, 0), part: "rainingEarlyMorning" },
      { start: setTime(9, 0), end: setTime(11, 0), part: "rainingMidMorning" },
      { start: setTime(11, 0), end: setTime(13, 0), part: "rainingNoon" },
      {
        start: setTime(13, 0),
        end: setTime(15, 0),
        part: "rainingEarlyAfternoon",
      },
      {
        start: setTime(15, 0),
        end: setTime(18, 0),
        part: "rainingLateAfternoon",
      },
      { start: setTime(18, 0), end: setTime(18, 30), part: "rainingSunset" },
      { start: setTime(18, 30), end: setTime(20, 0), part: "rainingDusk" },
      { start: setTime(20, 0), end: setTime(22, 0), part: "rainingEarlyNight" },
    ];

    for (const interval of timeIntervals) {
      if (currentTime >= interval.start && currentTime <= interval.end) {
        return interval.part;
      }
    }

    return "rainingMidnight";
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

const getSnowCoverage = (temperatureK) => {
  const maxTemperatureK = 277.15; // Equivalent to 4°C or 40°F (no snow coverage)
  const minTemperatureK = 266.15; // Equivalent to -7°C or 20°F (full snow coverage)

  // Clamp the temperature to the range [minTemperatureK, maxTemperatureK]
  const clampedTemp = Math.max(
    Math.min(temperatureK, maxTemperatureK),
    minTemperatureK
  );

  // Calculate coverage as a proportion of the temperature range
  const snowCoverage =
    1 - (clampedTemp - minTemperatureK) / (maxTemperatureK - minTemperatureK);

  return snowCoverage;
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
    currentTime = partOfDay;
    const newSkyController = skySettings[partOfDay];
    isRaining = main == "Rain";
    isSnowing = main == "Snow";
    snowObject.coverage = getSnowCoverage(temp);

    Object.assign(skyController, {
      ...newSkyController,
    });

    updateScene();
    updateRain();
    updateSnow();
    debugObject.updateGrass();

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
