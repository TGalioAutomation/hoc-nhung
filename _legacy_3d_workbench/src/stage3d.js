/**
 * src/stage3d.js
 * Visual & 3D WebGL Workbench Simulation Engine (Three.js)
 * Strictly adhering to clean-room/VISUAL_3D_SPEC.md & SPEC.approved.md
 *
 * Implements:
 * - Axonometric Orthographic Camera (theta = 36 deg, phi = 43 deg, R = 500)
 * - Cel-shading architectural outlines (#141a2c, 1.3px)
 * - Tactile warm lighting & soft VSM shadows
 * - Procedural ESP32 DevKit V1, Breadboard, Curved Jumper Wires
 * - 12 Interactive Lesson 3D Assemblies
 * - 5 Simultaneous Perimeter Callout Anchors with Colored Dashed SVG Leader Lines
 * - 3D World to 2D Screen Projection
 * - Full Headless Node.js Fallback Defense
 */

import * as THREE from 'three';

/* =========================================================================
   1. Constants & Viewport Matrix (VISUAL_3D_SPEC.md: Section 3.1)
   ========================================================================= */

export const LESSON_VIEWPORTS = {
  1:  { target: [0, 0, 3.6], zoom: 10.6 },
  2:  { target: [30, 0, -6], zoom: 7.0 },
  3:  { target: [63.7, 0, 2.7], zoom: 5.0 },
  4:  { target: [40, 0, -4], zoom: 6.0 },
  5:  { target: [30, 0, -6], zoom: 7.0 },
  6:  { target: [38, 0, 8], zoom: 5.6 },
  7:  { target: [38.6, 0, 5.9], zoom: 6.4 },
  8:  { target: [33.5, 0, 14.7], zoom: 5.0 },
  9:  { target: [53.2, 0, 2.7], zoom: 6.0 },
  10: { target: [49.9, 0, 8.9], zoom: 5.6 },
  11: { target: [61.3, 0, -1.8], zoom: 5.4 },
  12: { target: [18, 0, 56], zoom: 4.6 },
  13: { target: [40, 0, -4], zoom: 6.0 },
  14: { target: [37.2, 0, -27], zoom: 6.4 },
  15: { target: [34, 0, 2], zoom: 6.0 },
  16: { target: [-2.6, 0, -38.7], zoom: 3.6 },
  17: { target: [-7, 0, 8], zoom: 3.4 },
  18: { target: [-58.4, 0, 11.6], zoom: 4.0 },
  19: { target: [-19, 0, 28.5], zoom: 3.4 },
  20: { target: [-37.4, 0, -63.5], zoom: 3.1 }
};

export const WIRE_COLORS_3D = {
  black:  0x2f3547,
  red:    0xe04a3f,
  yellow: 0xf0a53a,
  blue:   0x3d6fc4,
  green:  0x27a689,
  purple: 0x8e44ad,
  white:  0xecf0f1
};

export const DEFAULT_CAMERA = {
  azimuth: 36 * (Math.PI / 180),   // 36 deg
  elevation: 43 * (Math.PI / 180), // 43 deg
  radius: 500,
  near: 1,
  far: 900
};

/* =========================================================================
   2. Helper: Cel-Shading Edge Lines (#141a2c, 1.3px)
   ========================================================================= */

function addCelOutlines(mesh, color = 0x141a2c, thresholdAngle = 22) {
  if (!mesh || !mesh.geometry) return;
  try {
    const edgesGeom = new THREE.EdgesGeometry(mesh.geometry, thresholdAngle);
    const lineMat = new THREE.LineBasicMaterial({
      color,
      linewidth: 1.3,
      transparent: true,
      opacity: 0.95
    });
    const lines = new THREE.LineSegments(edgesGeom, lineMat);
    lines.name = 'cel-outline';
    mesh.add(lines);
  } catch (e) {
    // Non-fatal edge line fallback
  }
}

/* =========================================================================
   3. Stage3D Engine Class
   ========================================================================= */

export class Stage3D {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.options = options;
    this.isSupported = false;

    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Camera Orbit & Viewport State
    this.azimuth = DEFAULT_CAMERA.azimuth;
    this.elevation = DEFAULT_CAMERA.elevation;
    this.radius = DEFAULT_CAMERA.radius;
    this.target = new THREE.Vector3(0, 0, 3.6);
    this.currentZoom = 10.6;
    this.targetZoom = 10.6;

    // Pan Boundaries (VISUAL_3D_SPEC.md: Section 3.1)
    this.panMinX = -90;
    this.panMaxX = 150;
    this.panMinZ = -110;
    this.panMaxZ = 90;

    // Groups
    this.boardGroup = null;
    this.breadboardGroup = null;
    this.wiresGroup = null;
    this.componentsGroup = null;
    this.gridHelper = null;
    this.shadowLight = null;

    // Active lesson & dynamic actors
    this.currentLessonId = 1;
    this.activeActors = {};
    this.inspectionAnchors = [];

    // Callbacks
    this.onLeaderLinesUpdate = options.onLeaderLinesUpdate || null;

    // Animation handle
    this.animFrameId = null;
    this.lastTime = Date.now();

    // Initialize scene and fallback
    this.init();
  }

  init() {
    this._setupScene();

    if (!this.canvas || typeof this.canvas.getContext !== 'function') {
      this.isSupported = false;
      return false;
    }

    try {
      const gl = this.canvas.getContext('webgl2') ||
                 this.canvas.getContext('webgl') ||
                 this.canvas.getContext('experimental-webgl');
      if (!gl) {
        this.isSupported = false;
        return false;
      }

      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });

      this.renderer.setPixelRatio(Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2));
      const width = this.canvas.clientWidth || 800;
      const height = this.canvas.clientHeight || 600;
      this.renderer.setSize(width, height, false);

      // Soft Shadow Map Configuration (VISUAL_3D_SPEC.md: Section 3.2)
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.VSMShadowMap;
      this.renderer.shadowMap.autoUpdate = false;

      this.isSupported = true;
      this.updateCameraProjection(width, height);
      this.startLoop();
      return true;
    } catch (e) {
      this.isSupported = false;
      return false;
    }
  }

  _setupScene() {
    this.scene = new THREE.Scene();

    // 1. Orthographic Camera (Section 3.1) - Frustum tuned so 3D board fills ~60% of stage
    const aspect = 1672 / 941;
    const baseFrustum = 145;
    this.camera = new THREE.OrthographicCamera(
      -baseFrustum * aspect,
      baseFrustum * aspect,
      baseFrustum,
      -baseFrustum,
      DEFAULT_CAMERA.near,
      DEFAULT_CAMERA.far
    );
    this.camera.zoom = this.currentZoom;
    this._updateCameraPosition();

    // 2. Lighting (Section 3.2)
    // HemisphereLight: warm cream sky (#fffaf3), golden ground (#c2ae90), 0.55
    const hemiLight = new THREE.HemisphereLight(0xfffaf3, 0xc2ae90, 0.55);
    hemiLight.position.set(0, 200, 0);
    this.scene.add(hemiLight);

    // Key Directional Light: #fff6ea, 1.3 at (-55, 100, 62)
    const keyLight = new THREE.DirectionalLight(0xfff6ea, 1.3);
    keyLight.position.set(-55, 100, 62);
    keyLight.castShadow = false;
    this.scene.add(keyLight);

    // Shadow Caster Directional Light: #ffffff, 0.001 with VSM Shadow Map
    this.shadowLight = new THREE.DirectionalLight(0xffffff, 0.001);
    this._updateShadowLightPosition();
    this.shadowLight.castShadow = true;
    this.shadowLight.shadow.mapSize.width = 2048;
    this.shadowLight.shadow.mapSize.height = 2048;
    this.shadowLight.shadow.radius = 11.0;
    this.shadowLight.shadow.blurSamples = 20;
    this.shadowLight.shadow.bias = -0.0004;

    const d = 160;
    this.shadowLight.shadow.camera.left = -d;
    this.shadowLight.shadow.camera.right = d;
    this.shadowLight.shadow.camera.top = d;
    this.shadowLight.shadow.camera.bottom = -d;
    this.shadowLight.shadow.camera.near = 10;
    this.shadowLight.shadow.camera.far = 600;
    this.scene.add(this.shadowLight);

    // 3. Ground Plane & Grid (Section 3.2: Y = -4.0, Plane 900x900)
    const shadowPlaneGeom = new THREE.PlaneGeometry(900, 900);
    const shadowPlaneMat = new THREE.ShadowMaterial({
      color: 0x7a5532,
      opacity: 0.32,
      depthWrite: false
    });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeom, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -4.0;
    shadowPlane.receiveShadow = true;
    this.scene.add(shadowPlane);

    // Floor Grid (10mm squares, #e5d8c5, opacity 0.25 at Y = -4.01)
    this.gridHelper = new THREE.GridHelper(900, 90, 0xe5d8c5, 0xe5d8c5);
    this.gridHelper.position.y = -4.01;
    if (this.gridHelper.material) {
      this.gridHelper.material.transparent = true;
      this.gridHelper.material.opacity = 0.25;
    }
    this.scene.add(this.gridHelper);

    // 4. Primary Groups with tuned scaling for prominent 3D presence
    this.boardGroup = this._createEsp32Board();
    this.boardGroup.scale.set(1.22, 1.22, 1.22);
    this.scene.add(this.boardGroup);

    this.breadboardGroup = this._createBreadboard();
    this.breadboardGroup.scale.set(1.15, 1.15, 1.15);
    this.breadboardGroup.position.set(58, 0, 0);
    this.scene.add(this.breadboardGroup);

    this.wiresGroup = new THREE.Group();
    this.wiresGroup.name = 'jumper-wires';
    this.scene.add(this.wiresGroup);

    this.componentsGroup = new THREE.Group();
    this.componentsGroup.name = 'lesson-components';
    this.scene.add(this.componentsGroup);

    // Load initial lesson 1 setup
    this.setLesson(1);
  }

  _updateShadowLightPosition() {
    if (!this.shadowLight) return;
    this.shadowLight.position.set(
      this.target.x + 80,
      this.target.y + 208,
      this.target.z - 68
    );
    this.shadowLight.target.position.copy(this.target);
  }

  _updateCameraPosition() {
    if (!this.camera) return;
    const x = this.target.x + this.radius * Math.cos(this.elevation) * Math.sin(this.azimuth);
    const y = this.target.y + this.radius * Math.sin(this.elevation);
    const z = this.target.z + this.radius * Math.cos(this.elevation) * Math.cos(this.azimuth);

    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.target);
    this.camera.updateMatrixWorld();
    this.camera.updateProjectionMatrix();
  }

  updateCameraProjection(width, height) {
    if (!this.camera || !width || !height) return;
    const aspect = width / height;
    const baseFrustum = 145;
    this.camera.left = -baseFrustum * aspect;
    this.camera.right = baseFrustum * aspect;
    this.camera.top = baseFrustum;
    this.camera.bottom = -baseFrustum;
    this.camera.zoom = this.currentZoom;
    this.camera.updateProjectionMatrix();

    if (this.renderer) {
      this.renderer.setSize(width, height, false);
      this.requestShadowUpdate();
    }
  }

  /* =========================================================================
     4. Procedural ESP32 DevKit V1 Board (VISUAL_3D_SPEC.md: Section 4.1)
     ========================================================================= */

  _createEsp32Board() {
    const group = new THREE.Group();
    group.name = 'esp32-devkit-v1';

    // 1. PCB: 28.0mm x 51.5mm x 1.6mm, Dark Navy-Slate #1e293b
    const pcbGeom = new THREE.BoxGeometry(28.0, 1.6, 51.5);
    const pcbMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.38,
      metalness: 0.12
    });
    const pcb = new THREE.Mesh(pcbGeom, pcbMat);
    pcb.position.y = 0.8;
    pcb.castShadow = true;
    pcb.receiveShadow = true;
    addCelOutlines(pcb);
    group.add(pcb);

    // 2. WROOM-32 Metal RF Shield Can: Bright Brushed Silver #d8dde6
    const canGeom = new THREE.BoxGeometry(18.0, 2.8, 15.0);
    const canMat = new THREE.MeshStandardMaterial({
      color: 0xd8dde6,
      roughness: 0.22,
      metalness: 0.88
    });
    const can = new THREE.Mesh(canGeom, canMat);
    can.position.set(0, 1.6 + 1.4, 5.0);
    can.castShadow = true;
    addCelOutlines(can);

    // Laser-etched detail lines on RF can
    const etchGeom = new THREE.PlaneGeometry(14, 11);
    const etchMat = new THREE.MeshBasicMaterial({ color: 0x64748b, wireframe: true });
    const etch = new THREE.Mesh(etchGeom, etchMat);
    etch.rotation.x = -Math.PI / 2;
    etch.position.set(0, 1.6 + 2.81, 5.0);
    can.add(etch);
    group.add(can);

    // 3. Copper PCB Trace / Antenna Area at top of board
    const antGeom = new THREE.BoxGeometry(16.0, 0.1, 7.0);
    const antMat = new THREE.MeshStandardMaterial({
      color: 0xc87d32,
      roughness: 0.3,
      metalness: 0.7
    });
    const antenna = new THREE.Mesh(antGeom, antMat);
    antenna.position.set(0, 1.65, 20.0);
    group.add(antenna);

    // 4. USB-C Port: Bright Silver, extending slightly off the bottom edge
    const usbGeom = new THREE.BoxGeometry(8.9, 3.2, 8.5);
    const usbMat = new THREE.MeshStandardMaterial({
      color: 0xcfd8dc,
      metalness: 0.92,
      roughness: 0.18
    });
    const usb = new THREE.Mesh(usbGeom, usbMat);
    usb.position.set(0, 1.6 + 1.6, -24.8);
    usb.castShadow = true;
    addCelOutlines(usb);
    group.add(usb);

    // 5. Tactile Push Buttons (EN and BOOT)
    const btnBaseGeom = new THREE.BoxGeometry(3.2, 1.8, 3.2);
    const btnBaseMat = new THREE.MeshStandardMaterial({ color: 0x1a202c, roughness: 0.5 });
    const btnCapGeom = new THREE.CylinderGeometry(1.0, 1.0, 0.9, 16);
    const btnCapMat = new THREE.MeshStandardMaterial({ color: 0xedf2f7, metalness: 0.7, roughness: 0.2 });

    // EN Button (Left of USB)
    const enBase = new THREE.Mesh(btnBaseGeom, btnBaseMat);
    enBase.position.set(-8.5, 1.6 + 0.9, -18.0);
    const enCap = new THREE.Mesh(btnCapGeom, btnCapMat);
    enCap.position.set(-8.5, 1.6 + 1.8 + 0.45, -18.0);
    group.add(enBase);
    group.add(enCap);

    // BOOT Button (Right of USB)
    const bootBase = new THREE.Mesh(btnBaseGeom, btnBaseMat);
    bootBase.position.set(8.5, 1.6 + 0.9, -18.0);
    const bootCap = new THREE.Mesh(btnCapGeom, btnCapMat);
    bootCap.position.set(8.5, 1.6 + 1.8 + 0.45, -18.0);
    group.add(bootBase);
    group.add(bootCap);

    // 6. SMD LEDs (PWR Red, GPIO2 Blue, TX/RX Amber)
    const ledGeom = new THREE.BoxGeometry(1.8, 0.9, 1.3);

    // PWR LED (Red, constant vivid glow)
    const pwrMat = new THREE.MeshStandardMaterial({
      color: 0xff3b30,
      emissive: 0xff3b30,
      emissiveIntensity: 2.2,
      roughness: 0.2
    });
    const pwrLed = new THREE.Mesh(ledGeom, pwrMat);
    pwrLed.position.set(-4.5, 1.6 + 0.45, -10.0);
    group.add(pwrLed);

    const pwrLight = new THREE.PointLight(0xff3b30, 0.8, 25);
    pwrLight.position.set(-4.5, 3.5, -10.0);
    group.add(pwrLight);

    // GPIO 2 Onboard LED (Blue, controllable glow)
    const gpio2Mat = new THREE.MeshStandardMaterial({
      color: 0x007aff,
      emissive: 0x007aff,
      emissiveIntensity: 0.0,
      roughness: 0.2
    });
    const gpio2Led = new THREE.Mesh(ledGeom, gpio2Mat);
    gpio2Led.position.set(4.5, 1.6 + 0.45, -10.0);
    gpio2Led.name = 'led-gpio2';
    group.add(gpio2Led);
    this.activeActors.ledGpio2 = gpio2Led;

    const gpio2Light = new THREE.PointLight(0x007aff, 0, 25);
    gpio2Light.position.set(4.5, 3.5, -10.0);
    group.add(gpio2Light);
    gpio2Led.userData = { light: gpio2Light };

    // TX / RX Amber LEDs
    const txrxMat = new THREE.MeshStandardMaterial({
      color: 0xffa000,
      emissive: 0xffa000,
      emissiveIntensity: 0.0
    });
    const txLed = new THREE.Mesh(ledGeom, txrxMat.clone());
    txLed.position.set(-2.0, 1.6 + 0.45, -13.0);
    txLed.name = 'led-tx';
    group.add(txLed);
    this.activeActors.ledTx = txLed;

    const rxLed = new THREE.Mesh(ledGeom, txrxMat.clone());
    rxLed.position.set(2.0, 1.6 + 0.45, -13.0);
    rxLed.name = 'led-rx';
    group.add(rxLed);
    this.activeActors.ledRx = rxLed;

    // 7. Pin Headers: 15 pins each side (Pitch = 2.54mm, Gold #f5c542)
    const headerStripGeom = new THREE.BoxGeometry(2.54, 8.5, 38.1);
    const headerStripMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.7 });

    const leftStrip = new THREE.Mesh(headerStripGeom, headerStripMat);
    leftStrip.position.set(-12.5, 1.6 + 4.25, 0);
    leftStrip.castShadow = true;
    addCelOutlines(leftStrip);
    group.add(leftStrip);

    const rightStrip = new THREE.Mesh(headerStripGeom, headerStripMat);
    rightStrip.position.set(12.5, 1.6 + 4.25, 0);
    rightStrip.castShadow = true;
    addCelOutlines(rightStrip);
    group.add(rightStrip);

    // 15 gold pin contacts per side
    const pinContactGeom = new THREE.BoxGeometry(0.64, 1.0, 0.64);
    const pinContactMat = new THREE.MeshStandardMaterial({
      color: 0xf5c542,
      metalness: 0.95,
      roughness: 0.15
    });

    for (let i = 0; i < 15; i++) {
      const zPos = -17.78 + i * 2.54;
      const leftPin = new THREE.Mesh(pinContactGeom, pinContactMat);
      leftPin.position.set(-12.5, 1.6 + 8.5 + 0.5, zPos);
      group.add(leftPin);

      const rightPin = new THREE.Mesh(pinContactGeom, pinContactMat);
      rightPin.position.set(12.5, 1.6 + 8.5 + 0.5, zPos);
      group.add(rightPin);
    }

    return group;
  }

  /* =========================================================================
     5. Procedural Breadboard (VISUAL_3D_SPEC.md: Section 4.2)
     ========================================================================= */

  _createBreadboard() {
    const group = new THREE.Group();
    group.name = 'solderless-breadboard';

    // Body: 55mm x 8.5mm x 165mm, Ivory White #f7f4ee
    const bodyGeom = new THREE.BoxGeometry(55.0, 8.5, 165.0);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xf7f4ee,
      roughness: 0.6,
      metalness: 0.05
    });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.y = 4.25;
    body.castShadow = true;
    body.receiveShadow = true;
    addCelOutlines(body);
    group.add(body);

    // Center divider groove: 7.62mm x 1.2mm deep x 160mm
    const grooveGeom = new THREE.BoxGeometry(7.62, 1.2, 160.0);
    const grooveMat = new THREE.MeshStandardMaterial({ color: 0xe6e0d2, roughness: 0.8 });
    const groove = new THREE.Mesh(grooveGeom, grooveMat);
    groove.position.set(0, 8.5 - 0.6, 0);
    group.add(groove);

    // Power Rails: Red line (+) and Blue line (-) on both edges
    const railLineGeom = new THREE.BoxGeometry(0.8, 0.1, 155.0);
    const redRailMat = new THREE.MeshBasicMaterial({ color: 0xd63031 });
    const blueRailMat = new THREE.MeshBasicMaterial({ color: 0x0984e3 });

    const leftRed = new THREE.Mesh(railLineGeom, redRailMat);
    leftRed.position.set(-24.5, 8.55, 0);
    group.add(leftRed);

    const leftBlue = new THREE.Mesh(railLineGeom, blueRailMat);
    leftBlue.position.set(-22.0, 8.55, 0);
    group.add(leftBlue);

    const rightBlue = new THREE.Mesh(railLineGeom, blueRailMat);
    rightBlue.position.set(22.0, 8.55, 0);
    group.add(rightBlue);

    const rightRed = new THREE.Mesh(railLineGeom, redRailMat);
    rightRed.position.set(24.5, 8.55, 0);
    group.add(rightRed);

    return group;
  }

  /* =========================================================================
     6. Curved Jumper Wire (VISUAL_3D_SPEC.md: Section 4.3)
     ========================================================================= */

  createWire(p0, p1, colorHex = WIRE_COLORS_3D.red) {
    const v0 = p0 instanceof THREE.Vector3 ? p0 : new THREE.Vector3(...p0);
    const v1 = p1 instanceof THREE.Vector3 ? p1 : new THREE.Vector3(...p1);

    const wireGroup = new THREE.Group();
    wireGroup.name = 'jumper-wire';

    // 1. Metal Pin Plugs at ends: diameter 1.4mm, height 6mm
    const pinGeom = new THREE.CylinderGeometry(0.7, 0.7, 6.0, 12);
    const pinMat = new THREE.MeshStandardMaterial({ color: 0x1e272e, roughness: 0.4 });

    const startPin = new THREE.Mesh(pinGeom, pinMat);
    startPin.position.set(v0.x, v0.y + 3.0, v0.z);
    wireGroup.add(startPin);

    const endPin = new THREE.Mesh(pinGeom, pinMat);
    endPin.position.set(v1.x, v1.y + 3.0, v1.z);
    wireGroup.add(endPin);

    // 2. Arch Height & Catenary Arc: h_arch = max(12mm, 0.25 * ||P1 - P0||)
    const dist = v0.distanceTo(v1);
    const archH = Math.max(12.0, 0.25 * dist);

    const pStartUp = new THREE.Vector3(v0.x, v0.y + 6.0, v0.z);
    const pEndUp = new THREE.Vector3(v1.x, v1.y + 6.0, v1.z);
    const pMid = new THREE.Vector3(
      (v0.x + v1.x) / 2,
      Math.max(v0.y, v1.y) + archH,
      (v0.z + v1.z) / 2
    );

    const curve = new THREE.CatmullRomCurve3([v0, pStartUp, pMid, pEndUp, v1]);
    const tubeGeom = new THREE.TubeGeometry(curve, 96, 0.72, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.35,
      metalness: 0.1
    });

    const tube = new THREE.Mesh(tubeGeom, tubeMat);
    tube.castShadow = true;
    addCelOutlines(tube, 0x141a2c, 45);
    wireGroup.add(tube);

    return wireGroup;
  }

  /* =========================================================================
     7. Dynamic Lesson Assemblies & 5 Simultaneous Callout Anchors
     ========================================================================= */

  setLesson(lessonId) {
    this.currentLessonId = lessonId;
    const vp = LESSON_VIEWPORTS[lessonId] || LESSON_VIEWPORTS[1];

    // 1. Clear previous wires & components
    while (this.wiresGroup.children.length > 0) {
      const obj = this.wiresGroup.children.pop();
      if (obj.geometry) obj.geometry.dispose();
    }
    while (this.componentsGroup.children.length > 0) {
      const obj = this.componentsGroup.children.pop();
      if (obj.geometry) obj.geometry.dispose();
    }

    this.activeActors = {
      ledGpio2: this.boardGroup.getObjectByName('led-gpio2'),
      ledTx: this.boardGroup.getObjectByName('led-tx'),
      ledRx: this.boardGroup.getObjectByName('led-rx')
    };
    this.inspectionAnchors = [];

    // 2. Set camera target and zoom
    this.target.set(vp.target[0], vp.target[1], vp.target[2]);
    this.targetZoom = vp.zoom;
    this.currentZoom = vp.zoom;

    // 3. Populate lesson-specific components and anchors
    this._buildLessonComponents(lessonId);

    // 4. Update camera position & shadows
    this._updateCameraPosition();
    this._updateShadowLightPosition();
    this.requestShadowUpdate();

    // 5. Trigger leader lines update
    if (this.onLeaderLinesUpdate) {
      this.onLeaderLinesUpdate(this.inspectionAnchors);
    }
  }

  _buildLessonComponents(lessonId) {
    // Standard baseline anchors on ESP32 board
    const anchorWroom = {
      id: 'wroom-can',
      slot: 'top-center',
      tag: 'VI ĐIỀU KHIỂN',
      title: 'ESP-WROOM-32',
      desc: 'Mô-đun Wi-Fi & Bluetooth lõi kép Xtensa LX6 240MHz kèm 4MB Flash SPI',
      pos: new THREE.Vector3(0, 5, 6),
      color: '#3d6fc4'
    };

    const anchorUsb = {
      id: 'usb-port',
      slot: 'bottom-left',
      tag: 'KẾT NỐI & NGUỒN',
      title: 'Cổng USB-C Interface',
      desc: 'Nạp code UART & cấp nguồn 5V ổn định qua IC AMS1117-3.3V',
      pos: new THREE.Vector3(0, 3, -24),
      color: '#f86b1d'
    };

    const anchorGpio2 = {
      id: 'led-gpio2',
      slot: 'bottom-right',
      tag: 'TÍN HIỆU ONBOARD',
      title: 'Đèn LED Xanh IO2',
      desc: 'Đèn LED tích hợp chân GPIO 2 báo trạng thái nạp code và logic',
      pos: new THREE.Vector3(5, 2.5, -10),
      color: '#27a689'
    };

    const anchorPins = {
      id: 'pin-headers',
      slot: 'mid-right',
      tag: 'SƠ ĐỒ CHÂN',
      title: '30 Chân Header Mạ Vàng',
      desc: 'Khoảng cách bước chân 2.54mm hỗ trợ PWM, ADC 12-bit và I2C',
      pos: new THREE.Vector3(14, 8, 0),
      color: '#8e44ad'
    };

    let anchorLesson = {
      id: 'boot-en',
      slot: 'top-left',
      tag: 'NÚT BẤM VẬT LÝ',
      title: 'Nút EN & BOOT',
      desc: 'Nút vi sai bấm vật lý khởi động lại & chuyển chế độ Bootloader nạp ROM',
      pos: new THREE.Vector3(-8.5, 3.5, -18),
      color: '#e04a3f'
    };

    switch (lessonId) {
      case 1: // Meet ESP32 DevKit
        // Standard 5 anchors for board inspection
        break;

      case 2: // Dual LED Blink (Level Crossing)
        this._buildDualLedCircuit();
        anchorLesson = {
          id: 'led-red',
          slot: 'top-left',
          tag: 'LINH KIỆN BÀI HỌC',
          title: 'Đèn LED Đỏ (GPIO 2)',
          desc: 'Bóng LED 5mm bán dẫn kèm điện trở giới hạn dòng 220Ω',
          pos: new THREE.Vector3(50, 14, 0),
          color: '#e04a3f'
        };
        break;

      case 3: // Fridge Guard Door Sensor
        this._buildFridgeDoorModel();
        anchorLesson = {
          id: 'fridge-door',
          slot: 'top-left',
          tag: 'CẢM BIẾN TỪ',
          title: 'Cánh Cửa Tủ Lạnh',
          desc: 'Công tắc lưỡi gà (Reed Switch) ngắt mở theo góc cửa > 12 độ',
          pos: new THREE.Vector3(65, 25, 15),
          color: '#e04a3f'
        };
        break;

      case 5: // Passive Buzzer Siren
        this._buildBuzzerModel();
        anchorLesson = {
          id: 'buzzer-piezo',
          slot: 'top-left',
          tag: 'PHÁT ÂM THANH',
          title: 'Còi Chíp Buzzer',
          desc: 'Màng gốm áp điện phát âm thanh sóng vuông 400Hz–1200Hz',
          pos: new THREE.Vector3(65, 18, 0),
          color: '#e04a3f'
        };
        break;

      case 6: // 8-Key Touch Piano
        this._buildTouchPianoModel();
        anchorLesson = {
          id: 'touch-piano',
          slot: 'top-left',
          tag: 'CẢM ỨNG ĐIỆN DUNG',
          title: 'Phím Đàn Piano Đồng',
          desc: '8 lá đồng tương ứng các nốt Đồ–Rê–Mi–Fa–Sol–La–Si–Đố (Touch T0..T7)',
          pos: new THREE.Vector3(68, 12, -25),
          color: '#e04a3f'
        };
        break;

      case 7: // Neopixel Ring & Potentiometer
        this._buildNeopixelPotModel();
        anchorLesson = {
          id: 'neopixel-ring',
          slot: 'top-left',
          tag: 'HIỂN THỊ ĐA SẮC',
          title: 'Vòng 12 LED WS2812B',
          desc: '12 điểm sáng phát quang điều khiển độc lập theo 1 dây dữ liệu GPIO 4',
          pos: new THREE.Vector3(65, 12, 20),
          color: '#e04a3f'
        };
        break;

      case 8: // RGB Mood Lamp
        this._buildRgbLampModel();
        anchorLesson = {
          id: 'rgb-lamp',
          slot: 'top-left',
          tag: 'QUANG PHỔ MÀU',
          title: 'Đèn LED RGB 4 Chân',
          desc: 'Phát xạ 3 kênh Đỏ-Lục-Lam điều xung PWM hòa trộn màu sắc',
          pos: new THREE.Vector3(60, 14, 0),
          color: '#e04a3f'
        };
        break;

      case 10: // Ultrasonic HC-SR04
      case 19: // Radar HC-SR04
        this._buildUltrasonicModel();
        anchorLesson = {
          id: 'hcsr04-sensor',
          slot: 'top-left',
          tag: 'SÓNG SIÊU ÂM',
          title: 'Cảm Biến HC-SR04',
          desc: '2 mắt phát/thu chùm sóng siêu âm 40kHz đo khoảng cách từ 2cm đến 400cm',
          pos: new THREE.Vector3(55, 20, 6),
          color: '#e04a3f'
        };
        break;

      case 11: // DC Motor
        this._buildDcMotorModel();
        anchorLesson = {
          id: 'dc-motor',
          slot: 'top-left',
          tag: 'TRUYỀN ĐỘNG',
          title: 'Động Cơ DC Bánh Xe Vàng',
          desc: 'Hộp số giảm tốc tỷ lệ 1:48 điều tốc bằng xung PWM chân GPIO 16',
          pos: new THREE.Vector3(65, 25, 0),
          color: '#e04a3f'
        };
        break;

      case 12: // Servo Barrier Gate
        this._buildServoGateModel();
        anchorLesson = {
          id: 'servo-gate',
          slot: 'top-left',
          tag: 'CƠ ĐIỆN TỬ',
          title: 'Cổng Rào Chắn Servo 9g',
          desc: 'Khớp quay servo góc 0–90 độ tự động mở khi xe đồ chơi cắt tia laser',
          pos: new THREE.Vector3(26, 26, 50),
          color: '#e04a3f'
        };
        break;

      case 16: // Smart Water Pump
        this._buildWaterPumpModel();
        anchorLesson = {
          id: 'water-tank',
          slot: 'top-left',
          tag: 'HỆ THỐNG BƠM',
          title: 'Bồn Nước Tự Động',
          desc: 'Bơm tự động kích hoạt rơ-le theo ngưỡng trễ Hysteresis 20%–90%',
          pos: new THREE.Vector3(0, 25, -40),
          color: '#e04a3f'
        };
        break;

      case 17: // 4x3 Keypad Lock
        this._buildKeypadModel();
        anchorLesson = {
          id: 'keypad-4x3',
          slot: 'top-left',
          tag: 'BẢO MẬT NHẬP MÃ',
          title: 'Bàn Phím Ma Trận 4x3',
          desc: 'Ma trận nút bấm quét 4 hàng x 3 cột bảo mật bằng mật khẩu số',
          pos: new THREE.Vector3(0, 15, 15),
          color: '#e04a3f'
        };
        break;

      case 18: // Dual-LDR Solar Tracker
        this._buildSolarTrackerModel();
        anchorLesson = {
          id: 'solar-panel',
          slot: 'top-left',
          tag: 'NĂNG LƯỢNG MẶT TRỜI',
          title: 'Tấm Pin Tự Xoay',
          desc: 'Khớp xoay servo hướng góc phương vị theo 2 cảm biến quang trở LDR',
          pos: new THREE.Vector3(-60, 22, 15),
          color: '#e04a3f'
        };
        break;

      case 20: // Stepper Lead Screw
        this._buildStepperModel();
        anchorLesson = {
          id: 'stepper-lead-screw',
          slot: 'top-left',
          tag: 'ROBOT CHÍNH XÁC',
          title: 'Trục Vít Me Động Cơ Bước',
          desc: 'Dịch chuyển tuyến tính 0.04mm/bước với bước ren 8mm chuẩn CNC',
          pos: new THREE.Vector3(-40, 18, -60),
          color: '#e04a3f'
        };
        break;

      default:
        this._buildGenericWiring();
        break;
    }

    // Assign 5 perimeter anchors
    this.inspectionAnchors = [
      anchorLesson,
      anchorWroom,
      anchorPins,
      anchorUsb,
      anchorGpio2
    ];
  }

  // --- Model Builders ---

  _buildDualLedCircuit() {
    const ledRed = this._create5mmLed(0xe04a3f);
    ledRed.position.set(50, 8.5, 0);
    this.componentsGroup.add(ledRed);
    this.activeActors.ledRed = ledRed;

    const ledGreen = this._create5mmLed(0x27a689);
    ledGreen.position.set(50, 8.5, 20);
    this.componentsGroup.add(ledGreen);
    this.activeActors.ledGreen = ledGreen;

    this.wiresGroup.add(this.createWire([-12.5, 10.1, -10], [50, 8.5, 0], WIRE_COLORS_3D.yellow));
    this.wiresGroup.add(this.createWire([-12.5, 10.1, -7.5], [50, 8.5, 20], WIRE_COLORS_3D.green));
    this.wiresGroup.add(this.createWire([12.5, 10.1, -12.5], [42.5, 8.5, 0], WIRE_COLORS_3D.black));
  }

  _create5mmLed(colorHex) {
    const group = new THREE.Group();
    const cylGeom = new THREE.CylinderGeometry(2.5, 2.5, 5.0, 16);
    const domeGeom = new THREE.SphereGeometry(2.5, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    domeGeom.translate(0, 2.5, 0);

    const ledMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      emissive: colorHex,
      emissiveIntensity: 0.1,
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85
    });

    const body = new THREE.Mesh(cylGeom, ledMat);
    body.position.y = 2.5;
    const dome = new THREE.Mesh(domeGeom, ledMat);
    group.add(body);
    group.add(dome);
    addCelOutlines(body);

    const light = new THREE.PointLight(colorHex, 0, 35);
    light.position.y = 4;
    group.add(light);

    group.userData = { mat: ledMat, light };
    return group;
  }

  _buildFridgeDoorModel() {
    const fridgeGroup = new THREE.Group();
    fridgeGroup.position.set(65, 0, 0);

    const bodyGeom = new THREE.BoxGeometry(32, 45, 28);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xecf0f1, roughness: 0.3 });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.y = 22.5;
    body.castShadow = true;
    addCelOutlines(body);
    fridgeGroup.add(body);

    const doorHinge = new THREE.Group();
    doorHinge.position.set(-16, 22.5, 14);

    const doorGeom = new THREE.BoxGeometry(32, 44, 4);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0xdff9fb, roughness: 0.25 });
    const door = new THREE.Mesh(doorGeom, doorMat);
    door.position.set(16, 0, 2);
    door.castShadow = true;
    addCelOutlines(door);

    const handleGeom = new THREE.BoxGeometry(2, 14, 3);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x95a5a6, metalness: 0.8 });
    const handle = new THREE.Mesh(handleGeom, handleMat);
    handle.position.set(29, 0, 5);
    door.add(handle);

    doorHinge.add(door);
    fridgeGroup.add(doorHinge);
    this.componentsGroup.add(fridgeGroup);

    this.activeActors.fridgeDoor = doorHinge;
  }

  _buildBuzzerModel() {
    const buzzerGroup = new THREE.Group();
    buzzerGroup.position.set(65, 8.5, 0);

    const bodyGeom = new THREE.CylinderGeometry(6, 6, 9.5, 24);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x2d3436, roughness: 0.5 });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.y = 4.75;
    body.castShadow = true;
    addCelOutlines(body);
    buzzerGroup.add(body);

    const holeGeom = new THREE.CylinderGeometry(1.5, 1.5, 0.5, 16);
    const holeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const hole = new THREE.Mesh(holeGeom, holeMat);
    hole.position.y = 9.5;
    buzzerGroup.add(hole);

    this.componentsGroup.add(buzzerGroup);
    this.activeActors.buzzer = buzzerGroup;

    this.wiresGroup.add(this.createWire([-12.5, 10.1, 0], [65, 8.5, 0], WIRE_COLORS_3D.yellow));
    this.wiresGroup.add(this.createWire([12.5, 10.1, -12.5], [65, 8.5, 6], WIRE_COLORS_3D.black));
  }

  _buildTouchPianoModel() {
    const pianoGroup = new THREE.Group();
    pianoGroup.position.set(45, 8.5, -25);

    const pastelColors = [
      0xf7c6c0, 0xf9d6b2, 0xf7e7a8, 0xd3eab9,
      0xb8e2df, 0xc2d7f2, 0xdbc4f0, 0xf2c2d8
    ];

    this.activeActors.pianoKeys = [];

    for (let i = 0; i < 8; i++) {
      const keyGeom = new THREE.BoxGeometry(5.0, 1.2, 22.0);
      const keyMat = new THREE.MeshStandardMaterial({
        color: pastelColors[i],
        roughness: 0.3,
        metalness: 0.2
      });
      const key = new THREE.Mesh(keyGeom, keyMat);
      key.position.set(i * 6.5, 0.6, 0);
      key.castShadow = true;
      addCelOutlines(key);
      pianoGroup.add(key);
      this.activeActors.pianoKeys.push(key);
    }

    this.componentsGroup.add(pianoGroup);
  }

  _buildNeopixelPotModel() {
    const potGroup = new THREE.Group();
    potGroup.position.set(45, 8.5, -15);
    const baseGeom = new THREE.CylinderGeometry(6, 6, 6, 20);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x7f8c8d, metalness: 0.8 });
    const potBase = new THREE.Mesh(baseGeom, baseMat);
    potBase.position.y = 3;
    potGroup.add(potBase);

    const knobGeom = new THREE.CylinderGeometry(4.5, 4.5, 8, 20);
    const knobMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.4 });
    const knob = new THREE.Mesh(knobGeom, knobMat);
    knob.position.y = 7;
    addCelOutlines(knob);
    potGroup.add(knob);

    this.componentsGroup.add(potGroup);
    this.activeActors.potKnob = knob;

    const ringGroup = new THREE.Group();
    ringGroup.position.set(65, 8.5, 20);

    const ringGeom = new THREE.RingGeometry(18, 24, 32);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5, side: THREE.DoubleSide });
    const ringPcb = new THREE.Mesh(ringGeom, ringMat);
    ringPcb.rotation.x = -Math.PI / 2;
    ringPcb.position.y = 0.2;
    ringGroup.add(ringPcb);

    this.activeActors.neopixels = [];
    const pixelGeom = new THREE.BoxGeometry(4, 1.2, 4);

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const r = 21;
      const pxMat = new THREE.MeshStandardMaterial({
        color: 0x0984e3,
        emissive: 0x0984e3,
        emissiveIntensity: 0.2
      });
      const pixel = new THREE.Mesh(pixelGeom, pxMat);
      pixel.position.set(Math.cos(angle) * r, 0.8, Math.sin(angle) * r);
      ringGroup.add(pixel);
      this.activeActors.neopixels.push(pixel);
    }

    this.componentsGroup.add(ringGroup);
  }

  _buildRgbLampModel() {
    const rgbGroup = new THREE.Group();
    rgbGroup.position.set(60, 8.5, 0);

    const ledRgb = this._create5mmLed(0xffffff);
    rgbGroup.add(ledRgb);
    this.activeActors.ledRgb = ledRgb;
    this.componentsGroup.add(rgbGroup);
  }

  _buildUltrasonicModel() {
    const hcsr04 = new THREE.Group();
    hcsr04.position.set(55, 8.5, 0);

    const pcbGeom = new THREE.BoxGeometry(45, 20, 1.6);
    const pcbMat = new THREE.MeshStandardMaterial({ color: 0x0984e3, roughness: 0.4 });
    const pcb = new THREE.Mesh(pcbGeom, pcbMat);
    pcb.position.y = 10;
    addCelOutlines(pcb);
    hcsr04.add(pcb);

    const eyeGeom = new THREE.CylinderGeometry(8, 8, 12, 20);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xd8dee9, metalness: 0.9, roughness: 0.2 });

    const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
    leftEye.rotation.x = Math.PI / 2;
    leftEye.position.set(-13, 10, 6);
    addCelOutlines(leftEye);
    hcsr04.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
    rightEye.rotation.x = Math.PI / 2;
    rightEye.position.set(13, 10, 6);
    addCelOutlines(rightEye);
    hcsr04.add(rightEye);

    this.componentsGroup.add(hcsr04);
  }

  _buildDcMotorModel() {
    const motorGroup = new THREE.Group();
    motorGroup.position.set(65, 12, 0);

    const boxGeom = new THREE.BoxGeometry(64, 22, 18);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0xf1c40f, roughness: 0.5 });
    const gearbox = new THREE.Mesh(boxGeom, boxMat);
    addCelOutlines(gearbox);
    motorGroup.add(gearbox);

    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(24, 0, 15);

    const tireGeom = new THREE.CylinderGeometry(26, 26, 12, 24);
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x2d3436, roughness: 0.8 });
    const tire = new THREE.Mesh(tireGeom, tireMat);
    tire.rotation.x = Math.PI / 2;
    addCelOutlines(tire);
    wheelGroup.add(tire);

    const rimGeom = new THREE.CylinderGeometry(18, 18, 12.2, 16);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xf39c12, roughness: 0.4 });
    const rim = new THREE.Mesh(rimGeom, rimMat);
    rim.rotation.x = Math.PI / 2;
    wheelGroup.add(rim);

    motorGroup.add(wheelGroup);
    this.componentsGroup.add(motorGroup);
    this.activeActors.dcWheel = wheelGroup;
  }

  _buildServoGateModel() {
    const servoGroup = new THREE.Group();
    servoGroup.position.set(20, 0, 50);

    const bodyGeom = new THREE.BoxGeometry(23, 24, 12.5);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0984e3,
      transparent: true,
      opacity: 0.85,
      roughness: 0.3
    });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.y = 12;
    addCelOutlines(body);
    servoGroup.add(body);

    const armPivot = new THREE.Group();
    armPivot.position.set(6, 24, 0);

    const armGeom = new THREE.BoxGeometry(45, 4, 2);
    const armMat = new THREE.MeshStandardMaterial({ color: 0xd63031, roughness: 0.3 });
    const arm = new THREE.Mesh(armGeom, armMat);
    arm.position.set(22.5, 0, 0);
    addCelOutlines(arm);
    armPivot.add(arm);

    servoGroup.add(armPivot);
    this.componentsGroup.add(servoGroup);
    this.activeActors.servoGate = armPivot;
  }

  _buildWaterPumpModel() {
    const pumpGroup = new THREE.Group();
    pumpGroup.position.set(0, 0, -40);

    const tankGeom = new THREE.CylinderGeometry(20, 20, 40, 24, 1, true);
    const tankMat = new THREE.MeshStandardMaterial({
      color: 0xdff9fb,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1
    });
    const tank = new THREE.Mesh(tankGeom, tankMat);
    tank.position.y = 20;
    addCelOutlines(tank);
    pumpGroup.add(tank);

    const waterGeom = new THREE.CylinderGeometry(19.5, 19.5, 18, 24);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x00cec9,
      transparent: true,
      opacity: 0.75,
      roughness: 0.1
    });
    const water = new THREE.Mesh(waterGeom, waterMat);
    water.position.y = 9;
    pumpGroup.add(water);
    this.activeActors.waterLevel = water;

    this.componentsGroup.add(pumpGroup);
  }

  _buildKeypadModel() {
    const padGroup = new THREE.Group();
    padGroup.position.set(0, 8.5, 15);

    const baseGeom = new THREE.BoxGeometry(45, 2.5, 55);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x2d3436, roughness: 0.6 });
    const padBase = new THREE.Mesh(baseGeom, baseMat);
    padBase.position.y = 1.25;
    addCelOutlines(padBase);
    padGroup.add(padBase);

    const btnGeom = new THREE.BoxGeometry(8, 2.0, 8);
    const btnMat = new THREE.MeshStandardMaterial({ color: 0xdcdde1, roughness: 0.4 });

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 3; c++) {
        const btn = new THREE.Mesh(btnGeom, btnMat);
        btn.position.set((c - 1) * 12, 2.5, (r - 1.5) * 12);
        padGroup.add(btn);
      }
    }

    this.componentsGroup.add(padGroup);
  }

  _buildSolarTrackerModel() {
    const solarGroup = new THREE.Group();
    solarGroup.position.set(-60, 0, 15);

    const standGeom = new THREE.CylinderGeometry(3, 3, 20, 16);
    const standMat = new THREE.MeshStandardMaterial({ color: 0x7f8c8d });
    const stand = new THREE.Mesh(standGeom, standMat);
    stand.position.y = 10;
    solarGroup.add(stand);

    const pivot = new THREE.Group();
    pivot.position.set(0, 20, 0);

    const panelGeom = new THREE.BoxGeometry(36, 2.0, 26);
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x1b2c44, metalness: 0.6, roughness: 0.2 });
    const panel = new THREE.Mesh(panelGeom, panelMat);
    addCelOutlines(panel);
    pivot.add(panel);

    solarGroup.add(pivot);
    this.componentsGroup.add(solarGroup);
    this.activeActors.solarPivot = pivot;
  }

  _buildStepperModel() {
    const stepperGroup = new THREE.Group();
    stepperGroup.position.set(-40, 0, -60);

    const motorGeom = new THREE.BoxGeometry(24, 24, 24);
    const motorMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50, roughness: 0.4 });
    const motor = new THREE.Mesh(motorGeom, motorMat);
    motor.position.set(-30, 12, 0);
    addCelOutlines(motor);
    stepperGroup.add(motor);

    const shaftGeom = new THREE.CylinderGeometry(2, 2, 80, 16);
    const shaftMat = new THREE.MeshStandardMaterial({ color: 0xbdc3c7, metalness: 0.9, roughness: 0.1 });
    const shaft = new THREE.Mesh(shaftGeom, shaftMat);
    shaft.rotation.z = Math.PI / 2;
    shaft.position.set(15, 12, 0);
    stepperGroup.add(shaft);

    const carriageGeom = new THREE.BoxGeometry(14, 16, 18);
    const carriageMat = new THREE.MeshStandardMaterial({ color: 0xe67e22, roughness: 0.4 });
    const carriage = new THREE.Mesh(carriageGeom, carriageMat);
    carriage.position.set(0, 12, 0);
    addCelOutlines(carriage);
    stepperGroup.add(carriage);

    this.componentsGroup.add(stepperGroup);
    this.activeActors.stepperCarriage = carriage;
  }

  _buildGenericWiring() {
    this.wiresGroup.add(this.createWire([-12.5, 10.1, -10], [50, 8.5, 0], WIRE_COLORS_3D.yellow));
    this.wiresGroup.add(this.createWire([12.5, 10.1, -12.5], [42.5, 8.5, 0], WIRE_COLORS_3D.black));
  }

  /* =========================================================================
     8. Dynamic Actor State Synchronization
     ========================================================================= */

  updateActorState(actorType, value) {
    if (actorType === 'gpio2') {
      const led = this.activeActors.ledGpio2;
      if (led && led.material) {
        led.material.emissiveIntensity = value ? 2.5 : 0.0;
        if (led.userData && led.userData.light) {
          led.userData.light.intensity = value ? 1.5 : 0.0;
        }
        this.requestShadowUpdate();
      }
    } else if (actorType === 'ledRed') {
      const actor = this.activeActors.ledRed;
      if (actor && actor.userData) {
        actor.userData.mat.emissiveIntensity = value ? 2.2 : 0.1;
        actor.userData.light.intensity = value ? 2.5 : 0.0;
      }
    } else if (actorType === 'ledGreen') {
      const actor = this.activeActors.ledGreen;
      if (actor && actor.userData) {
        actor.userData.mat.emissiveIntensity = value ? 2.2 : 0.1;
        actor.userData.light.intensity = value ? 2.5 : 0.0;
      }
    } else if (actorType === 'fridgeDoor') {
      const hinge = this.activeActors.fridgeDoor;
      if (hinge) {
        const rad = (value * Math.PI) / 180;
        hinge.rotation.y = rad;
        this.requestShadowUpdate();
      }
    } else if (actorType === 'dcMotor') {
      const wheel = this.activeActors.dcWheel;
      if (wheel) {
        wheel.rotation.z += (value / 100) * 0.4;
      }
    } else if (actorType === 'servoGate') {
      const arm = this.activeActors.servoGate;
      if (arm) {
        arm.rotation.z = (value * Math.PI) / 180;
        this.requestShadowUpdate();
      }
    } else if (actorType === 'waterLevel') {
      const water = this.activeActors.waterLevel;
      if (water) {
        const h = Math.max(1, (value / 100) * 36);
        water.scale.set(1, h / 18, 1);
        water.position.y = h / 2;
      }
    } else if (actorType === 'solarTracker') {
      const pivot = this.activeActors.solarPivot;
      if (pivot) {
        pivot.rotation.y = ((value - 90) * Math.PI) / 180;
      }
    } else if (actorType === 'stepperPosition') {
      const carriage = this.activeActors.stepperCarriage;
      if (carriage) {
        const xOffset = ((value - 100) / 100) * 30;
        carriage.position.x = xOffset;
      }
    }
  }

  /* =========================================================================
     9. 3D World to 2D Screen Projection (VISUAL_3D_SPEC.md: Section 5.1)
     ========================================================================= */

  projectToScreen(worldVec, containerWidth = 800, containerHeight = 600) {
    if (!this.camera || !worldVec) {
      return { x: containerWidth * 0.5, y: containerHeight * 0.5, visible: true };
    }

    const v = worldVec instanceof THREE.Vector3 ? worldVec.clone() : new THREE.Vector3(...worldVec);
    v.project(this.camera);

    const x = ((v.x + 1) / 2) * containerWidth;
    const y = ((-v.y + 1) / 2) * containerHeight;

    return {
      x,
      y,
      visible: v.z < 1.0 && x >= 0 && x <= containerWidth && y >= 0 && y <= containerHeight
    };
  }

  /* =========================================================================
     10. Camera Orbit Controls (Azimuth, Elevation, Zoom, Pan)
     ========================================================================= */

  rotateAzimuth(deltaRad) {
    this.azimuth = (this.azimuth + deltaRad) % (Math.PI * 2);
    this._updateCameraPosition();
    this.requestShadowUpdate();
    if (this.onLeaderLinesUpdate) {
      this.onLeaderLinesUpdate(this.inspectionAnchors);
    }
  }

  zoomBy(factor) {
    const newZoom = Math.max(0.4, Math.min(15.0, this.currentZoom * factor));
    this.currentZoom = newZoom;
    this.targetZoom = newZoom;
    if (this.camera) {
      this.camera.zoom = newZoom;
      this.camera.updateProjectionMatrix();
    }
    this.requestShadowUpdate();
    if (this.onLeaderLinesUpdate) {
      this.onLeaderLinesUpdate(this.inspectionAnchors);
    }
  }

  resetView() {
    this.azimuth = DEFAULT_CAMERA.azimuth;
    this.elevation = DEFAULT_CAMERA.elevation;
    const vp = LESSON_VIEWPORTS[this.currentLessonId] || LESSON_VIEWPORTS[1];
    this.target.set(vp.target[0], vp.target[1], vp.target[2]);
    this.currentZoom = vp.zoom;
    this.targetZoom = vp.zoom;

    if (this.camera) {
      this.camera.zoom = vp.zoom;
    }
    this._updateCameraPosition();
    this.requestShadowUpdate();
    if (this.onLeaderLinesUpdate) {
      this.onLeaderLinesUpdate(this.inspectionAnchors);
    }
  }

  setGridVisible(visible) {
    if (this.gridHelper) {
      this.gridHelper.visible = !!visible;
    }
  }

  requestShadowUpdate() {
    if (this.renderer && this.renderer.shadowMap) {
      this.renderer.shadowMap.needsUpdate = true;
    }
  }

  /* =========================================================================
     11. Render Loop
     ========================================================================= */

  render() {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  startLoop() {
    if (typeof window === 'undefined' || !window.requestAnimationFrame) return;

    const animate = () => {
      this.animFrameId = window.requestAnimationFrame(animate);
      this.render();
    };
    this.animFrameId = window.requestAnimationFrame(animate);
  }

  stopLoop() {
    if (typeof window !== 'undefined' && window.cancelAnimationFrame && this.animFrameId) {
      window.cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  destroy() {
    this.stopLoop();
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }
  }
}
