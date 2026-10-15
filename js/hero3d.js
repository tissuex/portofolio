/**
 * hero3d.js — Three.js Digital Architect's Workbench Scene
 * Represents browser windows/code layers assembling on scroll
 */

let scene, camera, renderer, animId;
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;
let isVisible = true;
let rafActive = false;

// Objects
let browserFrame, codeParticles = [], floatingPanels = [], gridLines = [];
let clock;

/**
 * Detect WebGL support
 */
function hasWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (e) {
    return false;
  }
}

/**
 * Initialize Three.js scene
 */
export function initHero3D(canvasEl) {
  if (!hasWebGL()) return false;
  if (!canvasEl) return false;

  const THREE = window.__THREE__;
  if (!THREE) return false;

  clock = new THREE.Clock();

  // Scene
  scene = new THREE.Scene();

  // Camera — slight off-center perspective
  const w = canvasEl.clientWidth;
  const h = canvasEl.clientHeight;
  camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000);
  camera.position.set(0, 0, 6);

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvasEl,
    antialias: window.devicePixelRatio < 2,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.setSize(w, h);
  renderer.setClearColor(0x000000, 0);

  // Build scene objects
  buildGrid(THREE);
  buildBrowserFrame(THREE);
  buildCodeParticles(THREE);
  buildFloatingPanels(THREE);

  // Ambient + directional light
  const ambient = new THREE.AmbientLight(0x0ea5e9, 0.4);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
  dirLight.position.set(4, 6, 4);
  scene.add(dirLight);

  const rimLight = new THREE.DirectionalLight(0xf59e0b, 0.3);
  rimLight.position.set(-4, -2, -4);
  scene.add(rimLight);

  // Mobile adaptive layout check
  updateResponsive3D(w);

  // Events
  window.addEventListener('resize', onResize);

  // Visibility observer — pause when off screen
  const observer = new IntersectionObserver(
    (entries) => {
      isVisible = entries[0].isIntersecting;
      if (isVisible && !rafActive) startLoop();
    },
    { threshold: 0.01 }
  );
  observer.observe(canvasEl);

  startLoop();
  return true;
}

function updateResponsive3D(width) {
  const isMobile = width < 800;
  if (browserFrame) {
    browserFrame.visible = !isMobile;
  }
  floatingPanels.forEach(p => {
    p.visible = !isMobile;
  });
}

function buildGrid(THREE) {
  const mat = new THREE.LineBasicMaterial({
    color: 0x0ea5e9,
    transparent: true,
    opacity: 0.06,
  });

  // Horizontal lines
  for (let i = -6; i <= 6; i += 1.5) {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-10, i * 0.4, -3),
      new THREE.Vector3(10, i * 0.4, -3),
    ]);
    const line = new THREE.Line(geo, mat);
    scene.add(line);
    gridLines.push(line);
  }

  // Vertical lines
  for (let i = -8; i <= 8; i += 1.5) {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(i * 0.8, -4, -3),
      new THREE.Vector3(i * 0.8, 4, -3),
    ]);
    const line = new THREE.Line(geo, mat);
    scene.add(line);
    gridLines.push(line);
  }
}

function buildBrowserFrame(THREE) {
  // Browser window frame — representing the "workbench"
  const group = new THREE.Group();

  // Main panel (browser body)
  const bodyGeo = new THREE.PlaneGeometry(3.2, 2.2);
  const bodyMat = new THREE.MeshLambertMaterial({
    color: 0x0f2140,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  group.add(body);

  // Browser top bar
  const barGeo = new THREE.PlaneGeometry(3.2, 0.22);
  const barMat = new THREE.MeshLambertMaterial({
    color: 0x0ea5e9,
    transparent: true,
    opacity: 0.5,
    side: THREE.DoubleSide,
  });
  const bar = new THREE.Mesh(barGeo, barMat);
  bar.position.set(0, 1.21, 0.01);
  group.add(bar);

  // Frame border edges
  const edgeMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6 });
  const corners = [
    [-1.6, -1.1], [1.6, -1.1], [1.6, 1.1], [-1.6, 1.1], [-1.6, -1.1]
  ];
  const pts = corners.map(([x, y]) => new THREE.Vector3(x, y, 0.01));
  const frameGeo = new THREE.BufferGeometry().setFromPoints(pts);
  const frame = new THREE.Line(frameGeo, edgeMat);
  group.add(frame);

  // Traffic light dots
  const dotGeo = new THREE.CircleGeometry(0.06, 12);
  const colors = [0xff5f57, 0xffbd2e, 0x27c93f];
  colors.forEach((col, i) => {
    const dot = new THREE.Mesh(dotGeo, new THREE.MeshLambertMaterial({ color: col }));
    dot.position.set(-1.4 + i * 0.2, 1.21, 0.02);
    group.add(dot);
  });

  group.position.set(1.6, 0.2, 0);
  group.rotation.y = -0.25;
  group.rotation.x = 0.05;
  scene.add(group);
  browserFrame = group;
}

function buildCodeParticles(THREE) {
  // Code-line segments floating in space
  const mat = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.4,
  });

  const widths = [0.6, 1.0, 0.4, 0.8, 0.3, 0.7, 0.5];
  widths.forEach((w, i) => {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-w / 2, 0, 0),
      new THREE.Vector3(w / 2, 0, 0),
    ]);
    const line = new THREE.Line(geo, mat.clone());

    // Position in left area
    line.position.set(
      -2.5 + Math.random() * 0.8,
      -0.8 + i * 0.28 + (Math.random() - 0.5) * 0.1,
      Math.random() * 0.5
    );
    line.userData = {
      speed: 0.0002 + Math.random() * 0.0003,
      offset: Math.random() * Math.PI * 2,
      baseX: line.position.x,
    };
    scene.add(line);
    codeParticles.push(line);
  });

  // Small glowing dots
  const dotGeo = new THREE.SphereGeometry(0.04, 8, 8);
  for (let i = 0; i < 20; i++) {
    const dot = new THREE.Mesh(
      dotGeo,
      new THREE.MeshLambertMaterial({
        color: i % 3 === 0 ? 0xf59e0b : 0x38bdf8,
        transparent: true,
        opacity: 0.3 + Math.random() * 0.4,
      })
    );
    dot.position.set(
      (Math.random() - 0.5) * 7,
      (Math.random() - 0.5) * 4,
      -1 + Math.random() * 2
    );
    dot.userData = {
      speed: 0.001 + Math.random() * 0.002,
      offset: Math.random() * Math.PI * 2,
      baseY: dot.position.y,
    };
    scene.add(dot);
    codeParticles.push(dot);
  }
}

function buildFloatingPanels(THREE) {
  // UI layer panels — stacked behind main browser
  const configs = [
    { w: 2, h: 1.2, x: 0.6, y: -0.8, z: -0.8, opacity: 0.15, rotY: -0.1 },
    { w: 1.5, h: 1.8, x: -1.2, y: 0.4, z: -1.2, opacity: 0.1, rotY: 0.15 },
  ];

  configs.forEach((c) => {
    const geo = new THREE.PlaneGeometry(c.w, c.h);
    const mat = new THREE.MeshLambertMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: c.opacity,
      side: THREE.DoubleSide,
    });
    const panel = new THREE.Mesh(geo, mat);
    panel.position.set(c.x, c.y, c.z);
    panel.rotation.y = c.rotY;

    // Edge
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.25 });
    const hw = c.w / 2, hh = c.h / 2;
    const pts = [
      new THREE.Vector3(-hw, -hh, 0), new THREE.Vector3(hw, -hh, 0),
      new THREE.Vector3(hw, hh, 0), new THREE.Vector3(-hw, hh, 0),
      new THREE.Vector3(-hw, -hh, 0)
    ];
    const edgeGeo = new THREE.BufferGeometry().setFromPoints(pts);
    const edge = new THREE.Line(edgeGeo, edgeMat);
    panel.add(edge);

    scene.add(panel);
    floatingPanels.push(panel);
  });
}

function startLoop() {
  rafActive = true;
  animate();
}

function animate() {
  if (!isVisible) {
    rafActive = false;
    return;
  }
  animId = requestAnimationFrame(animate);

  const t = clock.getElapsedTime();

  // Smooth mouse parallax
  targetX += (mouseX - targetX) * 0.04;
  targetY += (mouseY - targetY) * 0.04;

  // Camera drift + mouse
  camera.position.x = targetX * 0.3;
  camera.position.y = targetY * 0.2;
  camera.lookAt(0, 0, 0);

  // Browser frame gentle float
  if (browserFrame) {
    browserFrame.rotation.y = -0.25 + targetX * 0.08;
    browserFrame.rotation.x = 0.05 + targetY * 0.05;
    browserFrame.position.y = 0.2 + Math.sin(t * 0.5) * 0.08;
  }

  // Code particles
  codeParticles.forEach((obj) => {
    if (obj.userData.baseX !== undefined) {
      // Line segments sway
      obj.position.x = obj.userData.baseX + Math.sin(t * obj.userData.speed * 1000 + obj.userData.offset) * 0.05;
    } else if (obj.userData.baseY !== undefined) {
      // Dots float
      obj.position.y = obj.userData.baseY + Math.sin(t * obj.userData.speed * 1000 + obj.userData.offset) * 0.15;
      obj.material.opacity = 0.2 + Math.sin(t * obj.userData.speed * 800 + obj.userData.offset) * 0.2;
    }
  });

  // Floating panels drift
  floatingPanels.forEach((panel, i) => {
    panel.position.z += Math.sin(t * 0.3 + i * Math.PI) * 0.001;
    panel.rotation.y += 0.0002;
  });

  renderer.render(scene, camera);
}

function onResize() {
  const canvas = renderer.domElement;
  const w = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth;
  const h = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  updateResponsive3D(w);
}

export function updateMouse(nx, ny) {
  mouseX = nx;
  mouseY = ny;
}

export function destroyHero3D() {
  if (animId) cancelAnimationFrame(animId);
  if (renderer) {
    renderer.dispose();
    scene = null;
    camera = null;
    codeParticles = [];
    floatingPanels = [];
    gridLines = [];
  }
  window.removeEventListener('resize', onResize);
}
