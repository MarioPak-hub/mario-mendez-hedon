/* =========================================================
   Escena 3D del hero — arreglo de paneles solares procedural.
   Cuando tengas tu modelo .glb, pon la ruta en MODEL_URL y
   reemplaza automáticamente al arreglo procedural.
   ========================================================= */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const MODEL_URL = "assets/models/casa-3d.glb";

const canvas = document.getElementById("hero-canvas");
if (canvas) init(canvas);

function init(canvas) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch {
    return; // sin WebGL: el hero queda con su fondo degradado
  }
  const isSmall = () => window.innerWidth < 760;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSmall() ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x07090d, 16, 38);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);

  /* ---------- Luces ---------- */
  const SUN_POS = new THREE.Vector3(-7, 8.5, -9);
  const sunLight = new THREE.DirectionalLight(0xffd29a, 3.2);
  sunLight.position.copy(SUN_POS);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(isSmall() ? 1024 : 2048, isSmall() ? 1024 : 2048);
  Object.assign(sunLight.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 40 });
  sunLight.shadow.bias = -0.0004;
  scene.add(sunLight);
  scene.add(new THREE.HemisphereLight(0x9bb8ff, 0x0a0606, 0.45));
  const rim = new THREE.PointLight(0xff2a32, 40, 18, 2);
  rim.position.set(7, 2.5, 4);
  scene.add(rim);

  /* ---------- Sol ---------- */
  const glowTex = radialTexture([[0, "rgba(255,225,150,1)"], [0.25, "rgba(255,182,39,.55)"], [1, "rgba(255,120,20,0)"]]);
  const sun = new THREE.Group();
  sun.position.copy(SUN_POS).multiplyScalar(1.05);
  const sunCore = new THREE.Mesh(new THREE.SphereGeometry(0.7, 32, 32), new THREE.MeshBasicMaterial({ color: 0xfff1c9, fog: false }));
  const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
  sunGlow.scale.set(9, 9, 1);
  sun.add(sunCore, sunGlow);
  scene.add(sun);

  /* ---------- Suelo ---------- */
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(30, 64),
    new THREE.MeshStandardMaterial({ color: 0x0a0d12, roughness: 0.95, metalness: 0 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
  const grid = new THREE.GridHelper(40, 80, 0x3a1013, 0x161c25);
  grid.position.y = 0.002;
  grid.material.transparent = true;
  grid.material.opacity = 0.45;
  scene.add(grid);

  /* ---------- Arreglo solar procedural ---------- */
  const world = new THREE.Group(); // todo lo que rota con el puntero
  scene.add(world);
  const cellTex = solarCellTexture(renderer);
  const ROWS = 2, COLS = 5, PW = 1.05, PH = 1.75, TILT = THREE.MathUtils.degToRad(24);
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xc9ced6, metalness: 1, roughness: 0.32 });
  const railMat = new THREE.MeshStandardMaterial({ color: 0x5b6270, metalness: 0.9, roughness: 0.45 });
  const panels = [];
  const array = new THREE.Group();

  for (let r = 0; r < ROWS; r++) {
    const row = new THREE.Group();
    row.position.set(0, 0, r * 2.6 - 1.3);
    for (let c = 0; c < COLS; c++) {
      const p = new THREE.Group();
      const frame = new THREE.Mesh(new THREE.BoxGeometry(PW + 0.04, 0.05, PH + 0.04), frameMat);
      frame.castShadow = true;
      frame.receiveShadow = true;
      const glassMat = new THREE.MeshPhysicalMaterial({
        map: cellTex, emissiveMap: cellTex, emissive: new THREE.Color(0x6aa0ff), emissiveIntensity: 0,
        roughness: 0.12, metalness: 0.25, clearcoat: 1, clearcoatRoughness: 0.04, envMapIntensity: 1.4,
      });
      const glass = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), glassMat);
      glass.rotation.x = -Math.PI / 2;
      glass.position.y = 0.027;
      p.add(frame, glass);
      p.position.set((c - (COLS - 1) / 2) * (PW + 0.08), 0, 0);
      p.userData = { r, c, mat: glassMat, baseY: 0 };
      row.add(p);
      panels.push(p);
    }
    // inclinación de la fila + estructura
    const tilted = new THREE.Group();
    tilted.add(row);
    tilted.rotation.x = TILT;
    tilted.position.y = 1.05;
    const width = COLS * (PW + 0.08);
    for (const z of [-0.55, 0.55]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(width, 0.05, 0.06), railMat);
      rail.position.set(0, -0.06, z);
      row.add(rail);
    }
    const legs = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const x = (i / 3 - 0.5) * (width - 0.4);
      const hFront = 1.05 - Math.sin(TILT) * (PH / 2);
      const hBack = 1.05 + Math.sin(TILT) * (PH / 2);
      const lf = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, hFront, 8), railMat);
      lf.position.set(x, hFront / 2, Math.cos(TILT) * (PH / 2) - 0.1);
      const lb = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, hBack, 8), railMat);
      lb.position.set(x, hBack / 2, -Math.cos(TILT) * (PH / 2) + 0.1);
      lf.castShadow = lb.castShadow = true;
      legs.add(lf, lb);
    }
    const rowWrap = new THREE.Group();
    rowWrap.add(tilted, legs);
    rowWrap.position.z = r * 2.7 - 1.35;
    row.position.z = 0;
    array.add(rowWrap);
  }
  // inclinar hacia el sol
  array.rotation.y = THREE.MathUtils.degToRad(-28);
  world.add(array);

  /* ---------- Batería / inversor (BESS) ---------- */
  const bess = new THREE.Group();
  const cabinet = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 1.5, 0.6),
    new THREE.MeshPhysicalMaterial({ color: 0xb9bec7, roughness: 0.45, metalness: 0.2, clearcoat: 0.4 })
  );
  cabinet.position.y = 0.75;
  cabinet.castShadow = true;
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.08, 0.62), new THREE.MeshStandardMaterial({ color: 0xe5232a, emissive: 0xe5232a, emissiveIntensity: 0.35 }));
  stripe.position.y = 1.25;
  const led = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.04, 0.01), new THREE.MeshBasicMaterial({ color: 0x2bd47d }));
  led.position.set(0, 0.9, 0.305);
  bess.add(cabinet, stripe, led);
  bess.position.set(4.3, 0, 0.6);
  bess.rotation.y = -0.5;
  world.add(bess);

  /* ---------- Partículas de energía ---------- */
  const COUNT = isSmall() ? 600 : 1400;
  const pos = new Float32Array(COUNT * 3);
  const speed = new Float32Array(COUNT);
  const resetP = (i, randomY = true) => {
    pos[i * 3] = (Math.random() - 0.5) * 7;
    pos[i * 3 + 1] = randomY ? Math.random() * 6 + 0.8 : 0.9 + Math.random() * 0.4;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 5;
    speed[i] = 0.25 + Math.random() * 0.6;
  };
  for (let i = 0; i < COUNT; i++) resetP(i);
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
    size: 0.06, map: radialTexture([[0, "rgba(255,220,140,1)"], [1, "rgba(255,180,40,0)"]]),
    color: 0xffc04a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  world.add(particles);

  /* ---------- Modelo GLB opcional ---------- */
  if (MODEL_URL) {
    new GLTFLoader().load(MODEL_URL, (gltf) => {
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3()).length();
      model.scale.setScalar(6.6 / size);
      box.setFromObject(model);
      model.position.sub(box.getCenter(new THREE.Vector3())).setY(-box.min.y);
      model.traverse((o) => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } });
      world.remove(array);
      world.remove(bess);
      world.add(model);
      window.heroScene.model = model;
    }, undefined, (err) => console.warn("No se pudo cargar el modelo 3D:", err));
  }

  /* ---------- Interacción ---------- */
  const pointer = new THREE.Vector2(0, 0);
  const smooth = new THREE.Vector2(0, 0);
  let progress = 0;
  window.addEventListener("pointermove", (e) => {
    pointer.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
  }, { passive: true });

  const reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
  let noMotion = reduceMQ.matches;
  reduceMQ.addEventListener("change", (e) => { noMotion = e.matches; });

  /* ---------- Layout responsive ---------- */
  function layout() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    if (camera.aspect < 0.9) {           // móvil vertical
      camera.fov = 50;
      world.position.set(-0.6, 2.2, 0);
    } else if (camera.aspect < 1.4) {    // tablet
      camera.fov = 38;
      world.position.set(1.6, 0, 0);
    } else {                             // desktop
      camera.fov = 32;
      world.position.set(3.0, 0, 0);
    }
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(layout).observe(canvas);
  layout();

  /* ---------- Intro: los paneles “caen” en su lugar ---------- */
  panels.forEach((p) => { p.position.y = noMotion ? 0 : 3.5; p.scale.setScalar(noMotion ? 1 : 0.6); });
  const introStart = performance.now() + 300;

  /* ---------- Loop ---------- */
  let visible = true;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) tick(); }).observe(canvas);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) tick(); });

  const clock = new THREE.Clock();
  let rafId = 0;
  const camBase = new THREE.Vector3(9, 5.4, 13);
  const lookAt = new THREE.Vector3(0, 0.9, 0);

  function tick() {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(frame);
  }

  function frame(now) {
    if (!visible || document.hidden) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;

    // intro escalonada
    panels.forEach((p) => {
      const { r, c } = p.userData;
      const k = THREE.MathUtils.clamp((now - introStart - (r * COLS + c) * 70) / 900, 0, 1);
      const e = 1 - Math.pow(1 - k, 4);
      if (!noMotion) {
        p.position.y = (1 - e) * 3.5;
        p.scale.setScalar(0.6 + 0.4 * e);
      }
      // destello que recorre los paneles
      const wave = Math.max(0, Math.sin(t * 1.3 - c * 0.55 - r * 0.8));
      p.userData.mat.emissiveIntensity = noMotion ? 0.05 : Math.pow(wave, 10) * 0.55;
    });

    // partículas suben hacia el sol
    if (!noMotion) {
      for (let i = 0; i < COUNT; i++) {
        pos[i * 3 + 1] += speed[i] * dt;
        pos[i * 3] += Math.sin(t + i) * 0.002;
        if (pos[i * 3 + 1] > 7) resetP(i, false);
      }
      pGeo.attributes.position.needsUpdate = true;
      led.material.color.setHSL(0.41, 0.7, 0.45 + Math.sin(t * 3) * 0.12);
    }

    // cámara: puntero + scroll
    smooth.lerp(pointer, 0.05);
    const orbit = noMotion ? 0 : t * 0.04;
    world.rotation.y = smooth.x * 0.22 + Math.sin(orbit) * 0.08 + progress * 0.6;
    camera.position.set(
      camBase.x - progress * 1.2,
      camBase.y - smooth.y * 0.5 + progress * 1.4,
      camBase.z - progress * 2.0
    );
    camera.lookAt(lookAt);
    sunGlow.material.rotation = t * 0.05;

    renderer.render(scene, camera);
    rafId = requestAnimationFrame(frame);
  }
  tick();

  window.heroScene = { setProgress: (p) => { progress = p; } };
}

/* ---------- Texturas generadas ---------- */
function radialTexture(stops) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  stops.forEach(([o, col]) => grd.addColorStop(o, col));
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function solarCellTexture(renderer) {
  const W = 384, H = 640, cols = 6, rows = 10;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const g = c.getContext("2d");
  g.fillStyle = "#c9ced6";
  g.fillRect(0, 0, W, H);
  const pad = 6, cw = (W - pad * 2) / cols, ch = (H - pad * 2) / rows;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const px = pad + x * cw + 1.5, py = pad + y * ch + 1.5, w = cw - 3, h = ch - 3;
      const grd = g.createLinearGradient(px, py, px + w, py + h);
      grd.addColorStop(0, "#0d1d3d");
      grd.addColorStop(0.5, "#0a1630");
      grd.addColorStop(1, "#122a55");
      g.fillStyle = grd;
      g.beginPath();
      g.roundRect(px, py, w, h, 4);
      g.fill();
      g.strokeStyle = "rgba(170,190,220,.35)";
      g.lineWidth = 1;
      for (let k = 1; k <= 3; k++) {
        const lx = px + (w * k) / 4;
        g.beginPath(); g.moveTo(lx, py + 2); g.lineTo(lx, py + h - 2); g.stroke();
      }
      g.strokeStyle = "rgba(170,190,220,.12)";
      for (let k = 1; k < 12; k++) {
        const ly = py + (h * k) / 12;
        g.beginPath(); g.moveTo(px + 2, ly); g.lineTo(px + w - 2, ly); g.stroke();
      }
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return tex;
}
