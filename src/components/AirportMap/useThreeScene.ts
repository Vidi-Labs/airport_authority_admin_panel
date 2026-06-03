import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { clone as cloneSkeleton } from "three/addons/utils/SkeletonUtils.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import gsap from "gsap";
import { TERMINAL_ZONES, WALL_HEIGHT } from "./mapGeometry";
import type { Passenger } from "./passengerData";

const DEFAULT_CAMERA_POS = new THREE.Vector3(0, 280, 220);
const DEFAULT_CAMERA_TARGET = new THREE.Vector3(0, 0, 0);
const MIXAMO_CHARACTER_URL = "/models/mixamo-walking-character.glb";
const STANDARD_MATERIAL_SETTINGS = { roughness: 0.3, metalness: 0.05 };
const MARBLE_TILE_BASE64 =
  "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";

type MixamoTemplate = {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
};

type FallbackHumanParts = {
  group: THREE.Group;
  legL: THREE.Mesh;
  legR: THREE.Mesh;
  armL: THREE.Mesh;
  armR: THREE.Mesh;
};

type PassengerMeshGroup = {
  group: THREE.Group;
  model: THREE.Object3D | null;
  mixer: THREE.AnimationMixer | null;
  fallbackHuman: FallbackHumanParts;
  nameBadge: THREE.Sprite;
  statusRing: THREE.Mesh;
  trailLine: THREE.Line;
  trailPositions: Float32Array;
  trailColors: Float32Array;
};

function getStatusColor(status: string): number {
  switch (status) {
    case "navigating": return 0x22aaff;
    case "shopping": return 0xffaa22;
    case "waiting": return 0x8888ff;
    case "difficulty": return 0xff4444;
    case "boarded": return 0x22ff88;
    default: return 0xffffff;
  }
}

function darkenColor(color: string | number, factor: number): number {
  const c = new THREE.Color(color);
  c.multiplyScalar(factor);
  return c.getHex();
}

function getSkinTone(nationality: string): string {
  switch (nationality) {
    case "Ghanaian": return "#5c3a21";
    case "Nigerian": return "#4a2f1b";
    case "Japanese": return "#f1c27d";
    case "Chinese": return "#e8b887";
    case "Indian": return "#8d5524";
    case "Brazilian": return "#c68642";
    case "Saudi": return "#b47b4a";
    case "Russian": return "#f1d0b0";
    case "French": return "#f3c6a5";
    default: return "#c68642";
  }
}

function getHairColor(nationality: string): number {
  switch (nationality) {
    case "Ghanaian":
    case "Nigerian":
    case "Japanese":
    case "Chinese":
      return 0x111111;
    case "Indian":
    case "Saudi":
      return 0x1a0e00;
    case "Brazilian":
      return 0x3d1c00;
    case "Russian":
    case "French":
      return 0x8b7355;
    default:
      return 0x2a1a0a;
  }
}


function createFallbackHuman(passenger: Passenger): FallbackHumanParts {
  const root = new THREE.Group();
  root.userData.passengerId = passenger.id;

  const skinTone = getSkinTone(passenger.nationality);
  const hairColor = getHairColor(passenger.nationality);
  const pantsColor = darkenColor(passenger.shirtColor, 0.45);

  const shadowGeo = new THREE.CircleGeometry(6, 24);
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.18 });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.1;
  root.add(shadow);

  const legGeo = new THREE.CylinderGeometry(1.4, 1.2, 8, 10);
  const legMat = createStandardMaterial({ color: pantsColor });
  const legL = new THREE.Mesh(legGeo, legMat.clone());
  const legR = new THREE.Mesh(legGeo, legMat.clone());
  legL.position.set(-2, 4, 0);
  legR.position.set(2, 4, 0);
  legL.castShadow = true;
  legR.castShadow = true;
  root.add(legL, legR);

  const shoeGeo = new THREE.BoxGeometry(2.2, 1, 3.2);
  const shoeMat = createStandardMaterial({ color: 0x1e293b });
  const shoeL = new THREE.Mesh(shoeGeo, shoeMat.clone());
  const shoeR = new THREE.Mesh(shoeGeo, shoeMat.clone());
  shoeL.position.set(-2, 0.5, 0.6);
  shoeR.position.set(2, 0.5, 0.6);
  shoeL.castShadow = true;
  shoeR.castShadow = true;
  root.add(shoeL, shoeR);

  const bodyGeo = new THREE.CylinderGeometry(3.5, 4, 11, 16);
  const body = new THREE.Mesh(bodyGeo, createStandardMaterial({ color: passenger.shirtColor }));
  body.position.y = 13.5;
  body.castShadow = true;
  root.add(body);

  const armGeo = new THREE.CylinderGeometry(1, 0.8, 9, 10);
  const armMat = createStandardMaterial({ color: passenger.shirtColor });
  const armL = new THREE.Mesh(armGeo, armMat.clone());
  const armR = new THREE.Mesh(armGeo, armMat.clone());
  armL.position.set(-5, 15, 0);
  armR.position.set(5, 15, 0);
  armL.rotation.z = 0.15;
  armR.rotation.z = -0.15;
  armL.castShadow = true;
  armR.castShadow = true;
  root.add(armL, armR);

  const handGeo = new THREE.SphereGeometry(0.85, 10, 10);
  const handMat = createStandardMaterial({ color: skinTone });
  const handL = new THREE.Mesh(handGeo, handMat.clone());
  const handR = new THREE.Mesh(handGeo, handMat.clone());
  handL.position.set(-5.5, 10, 0);
  handR.position.set(5.5, 10, 0);
  handL.castShadow = true;
  handR.castShadow = true;
  root.add(handL, handR);

  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(1.8, 2.2, 2, 10),
    createStandardMaterial({ color: skinTone }),
  );
  neck.position.y = 19.5;
  neck.castShadow = true;
  root.add(neck);

  const headGeo = new THREE.SphereGeometry(4.2, 18, 18);
  headGeo.scale(1, 1.1, 0.95);
  const head = new THREE.Mesh(headGeo, createStandardMaterial({ color: skinTone }));
  head.position.y = 22.5;
  head.castShadow = true;
  root.add(head);

  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(4.5, 18, 18, 0, Math.PI * 2, 0, Math.PI * 0.55),
    createStandardMaterial({ color: hairColor }),
  );
  hair.position.y = 23;
  hair.scale.set(1, 0.9, 0.95);
  hair.castShadow = true;
  root.add(hair);

  const eyeWhiteGeo = new THREE.SphereGeometry(0.9, 10, 10);
  const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const eyeWhiteL = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat.clone());
  const eyeWhiteR = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat.clone());
  eyeWhiteL.position.set(-1.4, 23, 2.8);
  eyeWhiteR.position.set(1.4, 23, 2.8);
  root.add(eyeWhiteL, eyeWhiteR);

  const irisGeo = new THREE.SphereGeometry(0.55, 10, 10);
  const irisMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
  const irisL = new THREE.Mesh(irisGeo, irisMat.clone());
  const irisR = new THREE.Mesh(irisGeo, irisMat.clone());
  irisL.position.set(-1.4, 23, 3.4);
  irisR.position.set(1.4, 23, 3.4);
  root.add(irisL, irisR);

  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(0.5, 1.2, 8),
    createStandardMaterial({ color: skinTone }),
  );
  nose.position.set(0, 22, 3.5);
  nose.rotation.x = -Math.PI / 4;
  root.add(nose);

  const mouth = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.3, 0.3),
    createStandardMaterial({ color: darkenColor(skinTone, 0.65) }),
  );
  mouth.position.set(0, 21, 3.2);
  root.add(mouth);

  root.traverse((child) => {
    child.userData.passengerId = passenger.id;
  });

  return { group: root, legL, legR, armL, armR };
}

function createNameBadgeCanvas(id: string, status: string): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 32;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, 128, 32);

  const statusHex = status === "navigating" ? "#22aaff"
    : status === "shopping" ? "#ffaa22"
    : status === "waiting" ? "#8888ff"
    : status === "difficulty" ? "#ff4444"
    : "#22ff88";
  ctx.beginPath();
  ctx.arc(10, 16, 5, 0, Math.PI * 2);
  ctx.fillStyle = statusHex;
  ctx.fill();

  ctx.font = "bold 14px monospace";
  ctx.fillStyle = "#1e293b";
  ctx.textAlign = "left";
  ctx.fillText(id, 22, 21);

  return canvas;
}

function getZoneWallColor(type: string): number {
  switch (type) {
    case "corridor": return 0x94a3b8;
    case "gate": return 0x3b82f6;
    case "shop": return 0xf59e0b;
    case "facility": return 0x06b6d4;
    case "security": return 0xef4444;
    default: return 0x64748b;
  }
}

function getZoneEdgeColor(type: string): number {
  switch (type) {
    case "corridor": return 0x64748b;
    case "gate": return 0x2563eb;
    case "shop": return 0xd97706;
    case "facility": return 0x0891b2;
    case "security": return 0xdc2626;
    default: return 0x475569;
  }
}

function createStandardMaterial(params: THREE.MeshStandardMaterialParameters): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ ...params, ...STANDARD_MATERIAL_SETTINGS });
}

function isBodyMaterial(meshName: string, materialName: string): boolean {
  return /body|shirt|top|torso|chest|spine|mixamorigspine/i.test(`${meshName} ${materialName}`);
}

function toStandardMaterial(material: THREE.Material, shirtColor?: string, forceShirtColor = false): THREE.MeshStandardMaterial {
  const source = material as THREE.MeshStandardMaterial & { color?: THREE.Color; map?: THREE.Texture | null };
  const standard = new THREE.MeshStandardMaterial({
    color: source.color?.clone() ?? new THREE.Color(0xffffff),
    map: source.map ?? null,
    transparent: material.transparent,
    opacity: material.opacity,
    side: material.side,
    alphaTest: material.alphaTest,
    name: material.name,
    ...STANDARD_MATERIAL_SETTINGS,
  });

  if (shirtColor && forceShirtColor) {
    standard.color.set(shirtColor);
    standard.map = null;
  }

  return standard;
}

function tintPassengerBody(model: THREE.Object3D, shirtColor: string): void {
  let tinted = false;

  model.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material) return;

    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    const converted = materials.map((mat) => {
      const shouldTint = isBodyMaterial(mesh.name, mat.name);
      tinted ||= shouldTint;
      return toStandardMaterial(mat, shirtColor, shouldTint);
    });

    mesh.material = Array.isArray(mesh.material) ? converted : converted[0];
  });

  if (!tinted) {
    let firstTintable: THREE.Mesh | null = null;
    model.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!firstTintable && mesh.isMesh && mesh.material && !/eye|hair|skin|head|shoe|boot/i.test(mesh.name)) {
        firstTintable = mesh;
      }
    });

    if (firstTintable) {
      const mesh = firstTintable as THREE.Mesh;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      const converted = materials.map((mat) => toStandardMaterial(mat, shirtColor, true));
      mesh.material = Array.isArray(mesh.material) ? converted : converted[0];
    }
  }
}

function attachMixamoModel(pg: PassengerMeshGroup, template: MixamoTemplate, passenger: Passenger): void {
  if (pg.model) return;

  const model = cloneSkeleton(template.scene);
  model.userData.passengerId = passenger.id;
  model.scale.setScalar(12);
  model.position.y = 4;

  model.traverse((child) => {
    child.userData.passengerId = passenger.id;
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
  });

  tintPassengerBody(model, passenger.shirtColor);
  pg.group.add(model);
  pg.fallbackHuman.group.visible = false;
  pg.model = model;

  const walkClip = template.animations.find((clip) => /walk/i.test(clip.name)) ?? template.animations[0];
  if (walkClip) {
    const mixer = new THREE.AnimationMixer(model);
    mixer.clipAction(walkClip).reset().play();
    pg.mixer = mixer;
  }
}

function createMarbleTexture(): THREE.Texture {
  const texture = new THREE.TextureLoader().load(`data:image/png;base64,${MARBLE_TILE_BASE64}`);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(30, 30);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}


function getCanvasRenderSize(canvas: HTMLCanvasElement): { width: number; height: number } {
  const rect = canvas.getBoundingClientRect();
  const parentRect = canvas.parentElement?.getBoundingClientRect();
  return {
    width: Math.max(1, Math.floor(rect.width || parentRect?.width || canvas.clientWidth || 800)),
    height: Math.max(1, Math.floor(rect.height || parentRect?.height || canvas.clientHeight || 500)),
  };
}

export function useThreeScene(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const passengerMapRef = useRef<Map<string, PassengerMeshGroup>>(new Map());
  const zoneMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const heatmapRef = useRef(false);
  const trailsRef = useRef(true);
  const labelsRef = useRef(true);
  const labelMeshesRef = useRef<THREE.Mesh[]>([]);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const clickCallbackRef = useRef<((id: string) => void) | null>(null);
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const mixamoTemplateRef = useRef<MixamoTemplate | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvasElRef.current = canvas;

    RectAreaLightUniformsLib.init();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    scene.fog = null;
    sceneRef.current = scene;

    const initialSize = getCanvasRenderSize(canvas);
    const aspect = initialSize.width / initialSize.height || 1;
    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 2000);
    camera.position.set(0, 600, 600);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.85;
    renderer.setSize(initialSize.width, initialSize.height, false);
    rendererRef.current = renderer;

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const environmentScene = new RoomEnvironment();
    const environmentTexture = pmremGenerator.fromScene(environmentScene, 0.04).texture;
    scene.environment = environmentTexture;
    pmremGenerator.dispose();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.minPolarAngle = Math.PI / 6;
    controls.maxPolarAngle = Math.PI / 2.8;
    controls.minDistance = 80;
    controls.maxDistance = 600;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambient);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xe2e8f0, 0.45);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    keyLight.position.set(150, 300, 150);
    keyLight.castShadow = true;
    keyLight.shadow.camera.left = -350;
    keyLight.shadow.camera.right = 350;
    keyLight.shadow.camera.top = 250;
    keyLight.shadow.camera.bottom = -250;
    keyLight.shadow.camera.far = 800;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdde4ff, 0.25);
    fillLight.position.set(-100, 200, -100);
    scene.add(fillLight);

    TERMINAL_ZONES.filter((zone) => zone.type === "corridor").forEach((zone) => {
      const corridorLight = new THREE.RectAreaLight(0xffffff, 0.7, zone.width, 5);
      corridorLight.position.set(zone.x, WALL_HEIGHT + 18, zone.z);
      corridorLight.lookAt(zone.x, 0, zone.z);
      scene.add(corridorLight);
    });

    const marbleTexture = createMarbleTexture();
    const floorGeo = new THREE.PlaneGeometry(700, 400);
    const floorMat = createStandardMaterial({ color: 0xd9e0e8, map: marbleTexture });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    const grid = new THREE.GridHelper(700, 70, 0xb0b8c4, 0xd0d5dd);
    grid.position.y = 0.3;
    scene.add(grid);

    TERMINAL_ZONES.forEach((zone) => {
      const slabGeo = new THREE.BoxGeometry(zone.width, 4, zone.depth);
      const slabMat = createStandardMaterial({ color: zone.color, emissive: getZoneEdgeColor(zone.type), emissiveIntensity: 0.035 });
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.position.set(zone.x, 2, zone.z);
      slab.receiveShadow = true;
      slab.castShadow = true;
      scene.add(slab);
      zoneMeshesRef.current.set(zone.id, slab);

      const wallColor = getZoneWallColor(zone.type);
      const wallGeo = new THREE.BoxGeometry(zone.width, WALL_HEIGHT, zone.depth);
      const wallMat = createStandardMaterial({
        color: wallColor,
        transparent: true,
        opacity: 0.22,
      });
      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.set(zone.x, WALL_HEIGHT / 2 + 4, zone.z);
      scene.add(wall);

      const edgeColor = getZoneEdgeColor(zone.type);
      const edgesGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(zone.width, WALL_HEIGHT, zone.depth));
      const edgesMat = new THREE.LineBasicMaterial({ color: edgeColor, linewidth: 2 });
      const edges = new THREE.LineSegments(edgesGeo, edgesMat);
      edges.position.set(zone.x, WALL_HEIGHT / 2 + 4, zone.z);
      scene.add(edges);

      const bottomEdgesGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(zone.width, 0.5, zone.depth));
      const bottomEdgesMat = new THREE.LineBasicMaterial({ color: edgeColor });
      const bottomEdges = new THREE.LineSegments(bottomEdgesGeo, bottomEdgesMat);
      bottomEdges.position.set(zone.x, 4.5, zone.z);
      scene.add(bottomEdges);
    });

    TERMINAL_ZONES.forEach((zone) => {
      const labelCanvas = document.createElement("canvas");
      labelCanvas.width = 512;
      labelCanvas.height = 128;
      const ctx = labelCanvas.getContext("2d")!;
      ctx.clearRect(0, 0, 512, 128);

      ctx.font = "bold 22px Inter, sans-serif";
      const textWidth = ctx.measureText(zone.label).width;
      const pillW = Math.max(textWidth + 40, 120);
      const pillX = (512 - pillW) / 2;

      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.beginPath();
      ctx.roundRect(pillX, 30, pillW, 48, 12);
      ctx.fill();

      const edgeColor = getZoneEdgeColor(zone.type);
      const edgeHex = `#${edgeColor.toString(16).padStart(6, "0")}`;
      ctx.strokeStyle = edgeHex;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(pillX, 30, pillW, 48, 12);
      ctx.stroke();

      ctx.fillStyle = "#1e293b";
      ctx.textAlign = "center";
      ctx.fillText(zone.label, 256, 62);

      const texture = new THREE.CanvasTexture(labelCanvas);
      const labelGeo = new THREE.PlaneGeometry(zone.width * 0.7, 14);
      const labelMat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
      });
      const label = new THREE.Mesh(labelGeo, labelMat);
      label.position.set(zone.x, 14, zone.z);
      label.rotation.x = -Math.PI / 2;
      scene.add(label);
      labelMeshesRef.current.push(label);
    });

    let disposed = false;
    new GLTFLoader().load(
      MIXAMO_CHARACTER_URL,
      (gltf) => {
        if (disposed) return;
        mixamoTemplateRef.current = { scene: gltf.scene, animations: gltf.animations };
      },
      undefined,
      (error) => {
        console.warn(`Failed to load Mixamo walking character at ${MIXAMO_CHARACTER_URL}`, error);
      },
    );

    gsap.fromTo(
      camera.position,
      { x: 0, y: 600, z: 600 },
      { x: 0, y: 280, z: 220, duration: 2.5, ease: "power3.out" }
    );

    const onResize = () => {
      const { width: w, height: h } = getCanvasRenderSize(canvas);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    window.addEventListener("resize", onResize);
    requestAnimationFrame(onResize);

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(mouseRef.current, camera);

      const allMeshes: THREE.Object3D[] = [];
      passengerMapRef.current.forEach((pg) => {
        pg.group.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) allMeshes.push(child);
        });
      });

      const intersects = raycasterRef.current.intersectObjects(allMeshes, false);
      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj) {
          if (obj.userData?.passengerId) {
            canvas.style.cursor = "pointer";
            return;
          }
          obj = obj.parent;
        }
      }
      canvas.style.cursor = "default";
    };
    canvas.addEventListener("mousemove", onMouseMove);

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(mouseRef.current, camera);

      const allMeshes: THREE.Object3D[] = [];
      passengerMapRef.current.forEach((pg) => {
        pg.group.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) allMeshes.push(child);
        });
      });

      const intersects = raycasterRef.current.intersectObjects(allMeshes, false);
      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj) {
          if (obj.userData?.passengerId) {
            clickCallbackRef.current?.(obj.userData.passengerId);
            break;
          }
          obj = obj.parent;
        }
      }
    };
    canvas.addEventListener("click", onClick);

    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
      const delta = clock.getDelta();
      passengerMapRef.current.forEach((pg) => pg.mixer?.update(delta));
      controls.update();
      renderer.render(scene, camera);
    });

    return () => {
      disposed = true;
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("click", onClick);
      renderer.setAnimationLoop(null);
      environmentTexture.dispose();
      marbleTexture.dispose();
      renderer.dispose();
      controls.dispose();
    };
  }, [canvasRef]);

  const syncPassengers = useCallback(
    (passengers: Passenger[], onClick: (id: string) => void) => {
      const scene = sceneRef.current;
      if (!scene) return;
      clickCallbackRef.current = onClick;

      passengers.forEach((p) => {
        let pg = passengerMapRef.current.get(p.id);

        if (!pg) {
          const group = new THREE.Group();
          group.userData.passengerId = p.id;

          const fallbackHuman = createFallbackHuman(p);
          group.add(fallbackHuman.group);

          const badgeCanvas = createNameBadgeCanvas(p.id, p.status);
          const badgeTexture = new THREE.CanvasTexture(badgeCanvas);
          const badgeMat = new THREE.SpriteMaterial({ map: badgeTexture, transparent: true, depthWrite: false });
          const badge = new THREE.Sprite(badgeMat);
          badge.position.set(0, 36, 0);
          badge.scale.set(18, 5, 1);
          group.add(badge);

          const ringGeo = new THREE.TorusGeometry(6, 0.7, 8, 32);
          const ringMat = new THREE.MeshBasicMaterial({ color: getStatusColor(p.status) });
          const ring = new THREE.Mesh(ringGeo, ringMat);
          ring.rotation.x = -Math.PI / 2;
          ring.position.y = 0.5;
          group.add(ring);

          const maxTrail = 40 * 3;
          const trailPositions = new Float32Array(maxTrail);
          const trailColors = new Float32Array(maxTrail);
          const trailGeo = new THREE.BufferGeometry();
          trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPositions, 3));
          trailGeo.setAttribute("color", new THREE.BufferAttribute(trailColors, 3));
          const trailMat = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.5,
          });
          const trailLine = new THREE.Line(trailGeo, trailMat);
          trailLine.visible = trailsRef.current;
          scene.add(trailLine);

          scene.add(group);
          pg = { group, model: null, mixer: null, fallbackHuman, nameBadge: badge, statusRing: ring, trailLine, trailPositions, trailColors };
          passengerMapRef.current.set(p.id, pg);
        }

        const template = mixamoTemplateRef.current;
        if (template && !pg.model) {
          attachMixamoModel(pg, template, p);
        }

        pg.group.position.set(p.position[0], 0, p.position[1]);

        if (p.trail.length >= 2) {
          const prev = p.trail[p.trail.length - 2];
          const curr = p.trail[p.trail.length - 1];
          const angle = Math.atan2(curr[1] - prev[1], curr[0] - prev[0]);
          pg.group.rotation.y = -angle + Math.PI / 2;
        }

        const now = performance.now();
        const phase = now * 0.008 + p.id.charCodeAt(p.id.length - 1) * 10;
        const legSwing = Math.sin(phase) * 0.4;
        const armSwing = Math.sin(phase) * 0.3;
        pg.fallbackHuman.legL.rotation.x = legSwing;
        pg.fallbackHuman.legR.rotation.x = -legSwing;
        pg.fallbackHuman.armL.rotation.x = -armSwing;
        pg.fallbackHuman.armR.rotation.x = armSwing;
        pg.fallbackHuman.group.position.y = Math.abs(Math.sin(now * 0.01 + phase)) * 0.5;

        (pg.statusRing.material as THREE.MeshBasicMaterial).color.setHex(getStatusColor(p.status));
        pg.statusRing.rotation.z += 0.01;

        const badgeCanvas = createNameBadgeCanvas(p.id, p.status);
        const badgeMaterial = pg.nameBadge.material as THREE.SpriteMaterial;
        badgeMaterial.map?.dispose();
        badgeMaterial.map = new THREE.CanvasTexture(badgeCanvas);
        badgeMaterial.map.needsUpdate = true;

        pg.trailLine.visible = trailsRef.current;
        if (p.trail.length > 1) {
          const posArr = pg.trailPositions;
          const colArr = pg.trailColors;
          const len = Math.min(p.trail.length, 40);
          for (let i = 0; i < len; i++) {
            posArr[i * 3] = p.trail[i][0];
            posArr[i * 3 + 1] = 0.8;
            posArr[i * 3 + 2] = p.trail[i][1];

            const alpha = i / len;
            const c = new THREE.Color(p.shirtColor);
            c.multiplyScalar(alpha * 0.7 + 0.3);
            colArr[i * 3] = c.r;
            colArr[i * 3 + 1] = c.g;
            colArr[i * 3 + 2] = c.b;
          }
          pg.trailLine.geometry.setDrawRange(0, len);
          pg.trailLine.geometry.attributes.position.needsUpdate = true;
          pg.trailLine.geometry.attributes.color.needsUpdate = true;
        }
      });
    },
    []
  );

  const setHeatmap = useCallback((fn: (v: boolean) => boolean) => {
    const newVal = fn(heatmapRef.current);
    heatmapRef.current = newVal;

    zoneMeshesRef.current.forEach((mesh, id) => {
      const zone = TERMINAL_ZONES.find((z) => z.id === id);
      if (!zone) return;
      const material = mesh.material as THREE.MeshStandardMaterial;
      if (newVal) {
        material.color.lerp(new THREE.Color(0xff4400), 0.3);
      } else {
        material.color.set(zone.color);
      }
    });
  }, []);

  const setTrails = useCallback((fn: (v: boolean) => boolean) => {
    trailsRef.current = fn(trailsRef.current);
  }, []);

  const setLabels = useCallback((fn: (v: boolean) => boolean) => {
    const newVal = fn(labelsRef.current);
    labelsRef.current = newVal;
    labelMeshesRef.current.forEach((m) => (m.visible = newVal));
  }, []);

  const flyToPassenger = useCallback((id: string) => {
    const pg = passengerMapRef.current.get(id);
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!pg || !camera || !controls) return;

    const pos = pg.group.position;
    gsap.to(camera.position, {
      x: pos.x + 40,
      y: 120,
      z: pos.z + 80,
      duration: 1.5,
      ease: "power3.inOut",
    });
    gsap.to(controls.target, {
      x: pos.x,
      y: 0,
      z: pos.z,
      duration: 1.5,
      ease: "power3.inOut",
    });
  }, []);

  const resetCamera = useCallback(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    gsap.to(camera.position, {
      x: DEFAULT_CAMERA_POS.x,
      y: DEFAULT_CAMERA_POS.y,
      z: DEFAULT_CAMERA_POS.z,
      duration: 1.5,
      ease: "power3.inOut",
    });
    gsap.to(controls.target, {
      x: DEFAULT_CAMERA_TARGET.x,
      y: DEFAULT_CAMERA_TARGET.y,
      z: DEFAULT_CAMERA_TARGET.z,
      duration: 1.5,
      ease: "power3.inOut",
    });
  }, []);

  return { syncPassengers, setHeatmap, setTrails, setLabels, flyToPassenger, resetCamera };
}
