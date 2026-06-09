import { useEffect, useRef, useCallback, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { clone as cloneSkeleton } from "three/addons/utils/SkeletonUtils.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RectAreaLightUniformsLib } from "three/addons/lights/RectAreaLightUniformsLib.js";
import gsap from "gsap";
import {
  AIRPORT_NODES,
  AIRPORT_PATHS,
  AIRPORT_ZONES,
  AIRPORT_POLYGONS,
  BASE_SLAB_HEIGHT,
  FLOOR_HEIGHT,
  PATH_ELEVATION,
  WALL_HEIGHT,
  WORLD_SIZE,
  nodeToWorld,
  rectToWorld,
  sourceToWorld,
  getFloorHeightAtPosition,
} from "./mapGeometry";
import type { Passenger } from "./passengerData";

const MIXAMO_CHARACTER_URL = "/models/mixamo-walking-character.glb";
const STANDARD_MATERIAL_SETTINGS = { roughness: 0.48, metalness: 0.08 };
const MIN_ZOOM_PERCENT = 25;
const MAX_ZOOM_PERCENT = 500;
const DEFAULT_ZOOM_PERCENT = 120;
const OVERVIEW_ZOOM_PERCENT = 25;
const ZOOM_STEP_PERCENT = 25;

type MixamoTemplate = {
  scene: THREE.Group;
  animations: THREE.AnimationClip[];
};

type FallbackHumanParts = {
  group: THREE.Group;
  legL: THREE.Group;
  legR: THREE.Group;
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
  lastBadgeKey: string;
  userData?: {
    walkPhase: number;
    prevPos: THREE.Vector3;
  };
};

function getStatusColor(status: string): number {
  switch (status) {
    case "navigating": return 0x22aaff;
    case "shopping":   return 0xffaa22;
    case "waiting":    return 0x8888ff;
    case "difficulty": return 0xff4444;
    case "boarded":    return 0x22ff88;
    default:           return 0xffffff;
  }
}

function darkenColor(color: string | number, factor: number): number {
  const c = new THREE.Color(color);
  c.multiplyScalar(factor);
  return c.getHex();
}

function getSkinTone(nationality: string): string {
  switch (nationality) {
    case "Ghanaian":  return "#5c3a21";
    case "Nigerian":  return "#4a2f1b";
    case "Japanese":  return "#f1c27d";
    case "Chinese":   return "#e8b887";
    case "Indian":    return "#8d5524";
    case "Brazilian": return "#c68642";
    case "Saudi":     return "#b47b4a";
    case "Russian":   return "#f1d0b0";
    case "French":    return "#f3c6a5";
    default:          return "#c68642";
  }
}

function getHairColor(nationality: string): number {
  switch (nationality) {
    case "Ghanaian":
    case "Nigerian":
    case "Japanese":
    case "Chinese":   return 0x111111;
    case "Indian":
    case "Saudi":     return 0x1a0e00;
    case "Brazilian": return 0x3d1c00;
    case "Russian":
    case "French":    return 0x8b7355;
    default:          return 0x2a1a0a;
  }
}

function createFallbackHuman(passenger: Passenger): FallbackHumanParts {
  const root = new THREE.Group();
  root.userData.passengerId = passenger.id;

  const skinTone = getSkinTone(passenger.nationality);
  const hairColor = getHairColor(passenger.nationality);
  const pantsColor = darkenColor(passenger.shirtColor, 0.45);

  // Shadow
  const shadowGeo = new THREE.CircleGeometry(7, 24);
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.15 });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.1;
  root.add(shadow);

  // Hip pivots for natural walking (legs swing from hip joint)
  const hipL = new THREE.Group();
  const hipR = new THREE.Group();
  hipL.position.set(-1.8, 10.2, 0);
  hipR.position.set(1.8, 10.2, 0);
  root.add(hipL, hipR);

  // Legs (child of hip pivot, offset downward from hip)
  const legGeo = new THREE.CylinderGeometry(1.8, 1.5, 9, 12);
  const legMat = createStandardMaterial({ color: pantsColor });
  const legMeshL = new THREE.Mesh(legGeo, legMat.clone());
  const legMeshR = new THREE.Mesh(legGeo, legMat.clone());
  legMeshL.position.y = -4.5;
  legMeshR.position.y = -4.5;
  legMeshL.castShadow = true;
  legMeshR.castShadow = true;
  hipL.add(legMeshL);
  hipR.add(legMeshR);

  // Shoes (child of hip pivot, offset below leg)
  const shoeGeo = new THREE.BoxGeometry(2.5, 1.2, 4);
  const shoeMat = createStandardMaterial({ color: 0x1e293b });
  const shoeMeshL = new THREE.Mesh(shoeGeo, shoeMat.clone());
  const shoeMeshR = new THREE.Mesh(shoeGeo, shoeMat.clone());
  shoeMeshL.position.set(0, -9.6, 0.8);
  shoeMeshR.position.set(0, -9.6, 0.8);
  shoeMeshL.castShadow = true;
  shoeMeshR.castShadow = true;
  hipL.add(shoeMeshL);
  hipR.add(shoeMeshR);

  // Body / Torso
  const bodyGeo = new THREE.CylinderGeometry(4.5, 5.5, 12, 16);
  const body = new THREE.Mesh(bodyGeo, createStandardMaterial({ color: passenger.shirtColor }));
  body.position.y = 15;
  body.castShadow = true;
  root.add(body);

  // Shoulders
  const shoulderGeo = new THREE.SphereGeometry(2.8, 10, 10);
  const shoulderMat = createStandardMaterial({ color: passenger.shirtColor });
  const shoulderL = new THREE.Mesh(shoulderGeo, shoulderMat.clone());
  const shoulderR = new THREE.Mesh(shoulderGeo, shoulderMat.clone());
  shoulderL.position.set(-5.2, 20, 0);
  shoulderR.position.set(5.2, 20, 0);
  shoulderL.scale.set(1, 0.6, 0.8);
  shoulderR.scale.set(1, 0.6, 0.8);
  root.add(shoulderL, shoulderR);

  // Collar
  const collarGeo = new THREE.TorusGeometry(2.2, 0.4, 8, 16);
  const collar = new THREE.Mesh(collarGeo, createStandardMaterial({ color: darkenColor(passenger.shirtColor, 0.8) }));
  collar.position.y = 20.5;
  collar.scale.set(1, 0.5, 0.8);
  root.add(collar);

  // Arms
  const armGeo = new THREE.CylinderGeometry(1.2, 1, 10, 10);
  const armMat = createStandardMaterial({ color: passenger.shirtColor });
  const armL = new THREE.Mesh(armGeo, armMat.clone());
  const armR = new THREE.Mesh(armGeo, armMat.clone());
  armL.position.set(-6.5, 15.5, 0);
  armR.position.set(6.5, 15.5, 0);
  armL.rotation.z = 0.12;
  armR.rotation.z = -0.12;
  armL.castShadow = true;
  armR.castShadow = true;
  root.add(armL, armR);

  // Hands with fingers
  const handGeo = new THREE.SphereGeometry(1.1, 10, 10);
  const handMat = createStandardMaterial({ color: skinTone });
  const handL = new THREE.Mesh(handGeo, handMat.clone());
  const handR = new THREE.Mesh(handGeo, handMat.clone());
  handL.position.set(-7.5, 10.2, 0);
  handR.position.set(7.5, 10.2, 0);
  handL.scale.set(1, 0.8, 0.7);
  handR.scale.set(1, 0.8, 0.7);
  handL.castShadow = true;
  handR.castShadow = true;
  root.add(handL, handR);

  // Fingers
  const fingerGeo = new THREE.CylinderGeometry(0.25, 0.2, 0.8, 6);
  const fingerMat = createStandardMaterial({ color: skinTone });
  for (let side = -1; side <= 1; side += 2) {
    for (let f = -1; f <= 1; f++) {
      const finger = new THREE.Mesh(fingerGeo, fingerMat.clone());
      finger.position.set(side * 8, 9.6, f * 0.6);
      finger.rotation.x = 0.2;
      root.add(finger);
    }
  }

  // Neck
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(2.2, 2.6, 2.5, 10),
    createStandardMaterial({ color: skinTone }),
  );
  neck.position.y = 22;
  neck.castShadow = true;
  root.add(neck);

  // Head
  const headGeo = new THREE.SphereGeometry(4.8, 22, 22);
  headGeo.scale(1, 1.12, 0.92);
  const head = new THREE.Mesh(headGeo, createStandardMaterial({ color: skinTone }));
  head.position.y = 26;
  head.castShadow = true;
  root.add(head);

  // Hair
  const hair = new THREE.Mesh(
    new THREE.SphereGeometry(5.2, 22, 22, 0, Math.PI * 2, 0, Math.PI * 0.58),
    createStandardMaterial({ color: hairColor }),
  );
  hair.position.y = 27;
  hair.scale.set(1, 1.1, 0.95);
  hair.castShadow = true;
  root.add(hair);

  // Ears
  const earGeo = new THREE.SphereGeometry(0.7, 8, 8);
  const earMat = createStandardMaterial({ color: skinTone });
  const earL = new THREE.Mesh(earGeo, earMat.clone());
  const earR = new THREE.Mesh(earGeo, earMat.clone());
  earL.position.set(-4.2, 25.5, 0);
  earR.position.set(4.2, 25.5, 0);
  earL.scale.set(0.5, 1, 0.4);
  earR.scale.set(0.5, 1, 0.4);
  root.add(earL, earR);

  // Eyes - white (flat disc on face surface)
  const eyeWhiteGeo = new THREE.CircleGeometry(1, 16);
  const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  const eyeWhiteL = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat.clone());
  const eyeWhiteR = new THREE.Mesh(eyeWhiteGeo, eyeWhiteMat.clone());
  eyeWhiteL.position.set(-1.5, 26.8, 4.4);
  eyeWhiteR.position.set(1.5, 26.8, 4.4);
  root.add(eyeWhiteL, eyeWhiteR);

  // Eyes - iris/pupil (flat circle on eye surface)
  const irisGeo = new THREE.CircleGeometry(0.5, 12);
  const irisMat = new THREE.MeshBasicMaterial({ color: 0x1a1a2e, side: THREE.DoubleSide });
  const irisL = new THREE.Mesh(irisGeo, irisMat.clone());
  const irisR = new THREE.Mesh(irisGeo, irisMat.clone());
  irisL.position.set(-1.5, 26.8, 4.42);
  irisR.position.set(1.5, 26.8, 4.42);
  root.add(irisL, irisR);

  // Eyes - highlight
  const highlightGeo = new THREE.CircleGeometry(0.15, 8);
  const highlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  const highlightL = new THREE.Mesh(highlightGeo, highlightMat.clone());
  const highlightR = new THREE.Mesh(highlightGeo, highlightMat.clone());
  highlightL.position.set(-1.2, 27, 4.43);
  highlightR.position.set(1.8, 27, 4.43);
  root.add(highlightL, highlightR);

  // Eyebrows
  const browGeo = new THREE.BoxGeometry(2.2, 0.3, 0.4);
  const browMat = createStandardMaterial({ color: hairColor });
  const browL = new THREE.Mesh(browGeo, browMat.clone());
  const browR = new THREE.Mesh(browGeo, browMat.clone());
  browL.position.set(-1.6, 27.8, 4.5);
  browR.position.set(1.6, 27.8, 4.5);
  browL.rotation.z = -0.05;
  browR.rotation.z = 0.05;
  root.add(browL, browR);

  // Nose
  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(0.5, 0.8, 8),
    createStandardMaterial({ color: darkenColor(skinTone, 0.85) }),
  );
  nose.position.set(0, 25.8, 4.4);
  nose.rotation.x = -Math.PI / 3;
  root.add(nose);

  // Mouth
  const mouth = new THREE.Mesh(
    new THREE.BoxGeometry(2, 0.25, 0.2),
    createStandardMaterial({ color: darkenColor(skinTone, 0.6) }),
  );
  mouth.position.set(0, 24.4, 4.2);
  root.add(mouth);

  // Lower lip
  const lowerLip = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.2, 0.2),
    createStandardMaterial({ color: darkenColor(skinTone, 0.7) }),
  );
  lowerLip.position.set(0, 23.9, 4.1);
  root.add(lowerLip);

  root.traverse((child) => { child.userData.passengerId = passenger.id; });

  return { group: root, legL: hipL, legR: hipR, armL, armR };
}

function createNameBadgeCanvas(id: string, status: string): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 32;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, 128, 32);

  const statusHex = status === "navigating" ? "#22aaff"
      : status === "shopping"  ? "#ffaa22"
          : status === "waiting"   ? "#8888ff"
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
  model.scale.setScalar(10);
  model.position.y = 1;
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

function getCanvasRenderSize(canvas: HTMLCanvasElement): { width: number; height: number } {
  const rect = canvas.getBoundingClientRect();
  const parentRect = canvas.parentElement?.getBoundingClientRect();
  return {
    width:  Math.max(1, Math.floor(rect.width  || parentRect?.width  || canvas.clientWidth  || 800)),
    height: Math.max(1, Math.floor(rect.height || parentRect?.height || canvas.clientHeight || 500)),
  };
}

function computeAirportBounds() {
  const marginX = 520;
  const marginZ = 360;
  const halfW = WORLD_SIZE.width / 2 + marginX;
  const halfD = WORLD_SIZE.depth / 2 + marginZ;
  return {
    minX: -halfW, maxX: halfW, minZ: -halfD, maxZ: halfD,
    width: halfW * 2, depth: halfD * 2,
    centerX: 0, centerZ: 0,
  };
}

function distanceToFitBounds(camera: THREE.PerspectiveCamera, width: number, depth: number, padding = 1.0): number {
  const fov = THREE.MathUtils.degToRad(camera.fov);
  const verticalDistance   = (depth * 0.5) / Math.tan(fov / 2);
  const horizontalDistance = ((width * 0.5) / Math.tan(fov / 2)) / camera.aspect;
  return Math.max(verticalDistance, horizontalDistance) * padding;
}

function zoomToDistance(defaultDistance: number, zoomPercent: number): number {
  return defaultDistance * (DEFAULT_ZOOM_PERCENT / THREE.MathUtils.clamp(zoomPercent, MIN_ZOOM_PERCENT, MAX_ZOOM_PERCENT));
}

function cameraPose(target: THREE.Vector3, distance: number, zoomPercent = DEFAULT_ZOOM_PERCENT): THREE.Vector3 {
  if (zoomPercent < 80) {
    return new THREE.Vector3(target.x, Math.max(640, distance), target.z + 0.01);
  }
  const t = THREE.MathUtils.clamp((zoomPercent - 80) / (MAX_ZOOM_PERCENT - 80), 0, 1);
  const polar    = THREE.MathUtils.lerp(Math.PI / 5.4, Math.PI / 3.0, t);
  const azimuth  = Math.PI / 2;
  const horizontal = distance * Math.cos(polar);
  const y          = distance * Math.sin(polar);
  return new THREE.Vector3(
      target.x + Math.cos(azimuth) * horizontal,
      Math.max(90, y),
      target.z + Math.sin(azimuth) * horizontal,
  );
}

function toWorldVector(x: number, y: number, yOffset = 0): THREE.Vector3 {
  const [wx, wz] = sourceToWorld(x, y);
  return new THREE.Vector3(wx, yOffset, wz);
}

function colorStringToNumber(color: string | undefined, fallback: number): number {
  if (!color) return fallback;
  return new THREE.Color(color).getHex();
}

function createPathSegments(path: { points: [number, number][]; width: number; color: string; height3d?: number }): THREE.Group {
  const group    = new THREE.Group();
  const material = createStandardMaterial({ color: path.color, emissive: new THREE.Color(path.color), emissiveIntensity: 0.12 });
  const segH     = path.height3d ?? PATH_ELEVATION;

  for (let i = 0; i < path.points.length - 1; i += 1) {
    const [ax, ay] = path.points[i];
    const [bx, by] = path.points[i + 1];
    const start    = toWorldVector(ax, ay, segH);
    const end      = toWorldVector(bx, by, segH);
    const distance = start.distanceTo(end);
    if (distance < 0.01) continue;
    const segment = new THREE.Mesh(new THREE.BoxGeometry(distance, 1.2, path.width), material.clone());
    segment.position.copy(start).lerp(end, 0.5);
    segment.position.y = segH;
    segment.rotation.y = Math.atan2(end.z - start.z, end.x - start.x);
    segment.castShadow = true;
    segment.receiveShadow = true;
    group.add(segment);
  }
  return group;
}

function rememberMaterialState(material: THREE.Material, stateStore: { material: THREE.Material; opacity: number; transparent: boolean }[]) {
  stateStore.push({ material, opacity: material.opacity, transparent: material.transparent });
}

function setObjectOpacity(object: THREE.Object3D, opacity: number, stateStore: { material: THREE.Material; opacity: number; transparent: boolean }[]) {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((material) => {
      rememberMaterialState(material, stateStore);
      material.transparent = opacity < 1 || material.transparent;
      if ("opacity" in material) material.opacity = opacity;
      material.needsUpdate = true;
    });
  });
}

function createFloorTileTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#bfb7aa";
  ctx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 32) {
    for (let x = 0; x < 256; x += 32) {
      ctx.fillStyle = (x / 32 + y / 32) % 2 === 0 ? "rgba(255,255,255,0.055)" : "rgba(70,55,38,0.04)";
      ctx.fillRect(x, y, 32, 32);
    }
  }
  ctx.strokeStyle = "rgba(72,59,45,0.18)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 256; i += 32) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 256); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(256, i); ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(34, 22);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createPoiSprite(icon: string, labelText: string, color = "#2563eb"): THREE.Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = 512; canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, 512, 256);
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.beginPath();
  ctx.roundRect(46, 42, 420, 160, 34);
  ctx.fill();
  ctx.strokeStyle = `${color}55`;
  ctx.lineWidth = 8;
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.font = "bold 74px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(icon, 118, 122);
  ctx.fillStyle = "#1f2937";
  ctx.font = "bold 34px Inter, sans-serif";
  ctx.fillText(labelText, 292, 122);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, depthTest: false }));
  sprite.renderOrder = 12;
  return sprite;
}

function createGateNumberSprite(labelText: string): THREE.Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "rgba(18,28,20,0.92)";
  ctx.beginPath();
  ctx.roundRect(32, 32, 192, 192, 26);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.75)";
  ctx.lineWidth = 8;
  ctx.stroke();
  ctx.fillStyle = "#ffffff";
  ctx.font = labelText.length > 2 ? "bold 82px Inter, sans-serif" : "bold 104px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(labelText.replace("G", ""), 128, 136);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, depthTest: false }));
  sprite.renderOrder = 10;
  return sprite;
}

function addBox(
    objects: THREE.Object3D[],
    x: number, y: number, z: number,
    w: number, h: number, d: number,
    color: number,
    options: THREE.MeshStandardMaterialParameters = {}
) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), createStandardMaterial({ color, ...options }));
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  objects.push(mesh);
  return mesh;
}

function addCylinder(
    objects: THREE.Object3D[],
    x: number, y: number, z: number,
    r: number, h: number, color: number,
    radial = 20,
    options: THREE.MeshStandardMaterialParameters = {}
) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, radial), createStandardMaterial({ color, ...options }));
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  objects.push(mesh);
  return mesh;
}

function createDepartureBoard(text: string, width = 34): THREE.Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = 512; canvas.height = 160;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "rgba(5,12,24,0.96)";
  ctx.fillRect(0, 0, 512, 160);
  ctx.strokeStyle = "rgba(59,130,246,0.8)";
  ctx.lineWidth = 6;
  ctx.strokeRect(6, 6, 500, 148);
  ctx.fillStyle = "#7dd3fc";
  ctx.font = "bold 40px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(text, 256, 58);
  ctx.fillStyle = "#f8fafc";
  ctx.font = "bold 26px Inter, sans-serif";
  ctx.fillText("BOARDING · ON TIME", 256, 104);
  ctx.fillStyle = "#facc15";
  ctx.font = "20px Inter, sans-serif";
  ctx.fillText("DXB 11:45", 256, 135);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
  sprite.scale.set(width, width * 0.31, 1);
  sprite.renderOrder = 20;
  return sprite;
}

function createAirportDetailObjects(
    zone: { id: string; label: string; type: string; height3d?: number },
    world: { x: number; z: number; width: number; depth: number }
): THREE.Object3D[] {
  const objects: THREE.Object3D[] = [];
  const topY = (zone.height3d ?? BASE_SLAB_HEIGHT) + 1.2;
  const w = world.width;
  const d = world.depth;

  if (zone.id === "check-in") {
    // Main counter island
    addBox(objects, world.x, topY + 3.5, world.z, w * 0.88, 7, d * 0.32, 0x9a9186, { metalness: 0.14, roughness: 0.32 });
    // 12 individual kiosk screens + desks
    for (let i = 0; i < 12; i += 1) {
      const col = i % 6;
      const row = Math.floor(i / 6);
      const x   = world.x - w * 0.36 + col * (w * 0.145);
      const z   = world.z - d * 0.24 + row * (d * 0.48);
      addBox(objects, x, topY + 10, z, 3.4, 8, 1.8, 0x111827, { emissive: new THREE.Color(0x38bdf8), emissiveIntensity: 0.35 });
      addBox(objects, x, topY + 5, z + 3.3, 8, 2.0, 4.4, 0x26313d, { metalness: 0.25 });
    }
    // Luggage belt slots
    for (const off of [-0.28, 0, 0.28]) {
      addBox(objects, world.x + w * off, topY + 1.8, world.z + d * 0.36, w * 0.2, 3, 3.2, 0x202a34, { roughness: 0.55 });
    }

  } else if (zone.id === "security") {
    // 4 screening lanes
    for (let i = 0; i < 4; i += 1) {
      const x = world.x - w * 0.34 + i * (w * 0.23);
      addBox(objects, x, topY + 2, world.z, w * 0.16, 3, d * 0.72, 0x26313d, { metalness: 0.2 });
      // X-ray arch
      addBox(objects, x, topY + 9, world.z - d * 0.12, w * 0.12, 14, 3.8, 0x1d4ed8, {
        emissive: new THREE.Color(0x60a5fa), emissiveIntensity: 0.45, transparent: true, opacity: 0.82,
      });
      // Conveyor tray table
      addBox(objects, x, topY + 5, world.z + d * 0.3, w * 0.13, 7, 7, 0x111827, {
        emissive: new THREE.Color(0x2563eb), emissiveIntensity: 0.18,
      });
    }

  } else if (["duty-free", "pharmacy", "bookstore", "convenience-store"].includes(zone.id)) {
    const color = zone.id === "pharmacy" ? 0x2f855a
        : zone.id === "bookstore"         ? 0x5b4a89
            : zone.id === "convenience-store" ? 0xd97706
                : 0x8c5a32;
    // 4 shelf units back + front
    for (let i = 0; i < 4; i += 1) {
      addBox(objects, world.x - w * 0.36 + i * w * 0.24, topY + 4, world.z - d * 0.22, w * 0.12, 8, 4, color, {
        emissive: new THREE.Color(color), emissiveIntensity: 0.08,
      });
      addBox(objects, world.x - w * 0.36 + i * w * 0.24, topY + 4, world.z + d * 0.2, w * 0.12, 8, 4, 0xf8fafc, {
        emissive: new THREE.Color(0xfff7ad), emissiveIntensity: 0.18,
      });
    }
    // Service counter
    addBox(objects, world.x, topY + 3, world.z + d * 0.36, w * 0.78, 5, 4, 0x6b4f33, { roughness: 0.38 });

  } else if (zone.id === "cafe") {
    // Bar counter
    addBox(objects, world.x, topY + 3.5, world.z - d * 0.32, w * 0.75, 7, 5, 0x8c5a32, { roughness: 0.35 });
    // Espresso machine on counter
    addBox(objects, world.x + w * 0.26, topY + 9, world.z - d * 0.32, 8, 8, 4, 0x0f172a, {
      emissive: new THREE.Color(0x38bdf8), emissiveIntensity: 0.3,
    });
    // 6 round tables with 4 chairs each
    for (let i = 0; i < 6; i += 1) {
      const tx = world.x - w * 0.33 + (i % 3) * w * 0.33;
      const tz = world.z + (i < 3 ? d * 0.05 : d * 0.32);
      addCylinder(objects, tx, topY + 2.2, tz, 4.2, 2.4, 0x7c4a2b, 24);
      for (const a of [0, Math.PI / 2, Math.PI, Math.PI * 1.5]) {
        addBox(objects, tx + Math.cos(a) * 7, topY + 2.4, tz + Math.sin(a) * 7, 3.5, 4.5, 3.5, 0x3f3f46);
      }
    }

  } else if (["wc-west", "wc-east", "gate-zone-wc", "left-wing-wc", "right-wing-wc", "remote-gate-wc"].includes(zone.id)) {
    // Signage board
    addBox(objects, world.x, topY + 9, world.z, w * 0.75, 11, 3, 0x0e7490, {
      emissive: new THREE.Color(0x67e8f9), emissiveIntensity: 0.35,
    });
    // Stall dividers
    const stallCount = Math.max(2, Math.floor(w / 20));
    for (let i = 0; i < stallCount; i++) {
      const sx = world.x - w * 0.4 + i * (w * 0.8 / (stallCount - 1));
      addBox(objects, sx, topY + 5, world.z - d * 0.1, 1.5, 10, d * 0.7, 0x164e63, { metalness: 0.1 });
    }

  } else if (zone.id === "currency-exchange") {
    addBox(objects, world.x, topY + 5, world.z, w * 0.72, 8, d * 0.38, 0x334155, { emissive: new THREE.Color(0x334155), emissiveIntensity: 0.12 });
    // LED rate board
    addBox(objects, world.x, topY + 13, world.z - d * 0.08, w * 0.7, 5, 2, 0x020617, {
      emissive: new THREE.Color(0xfacc15), emissiveIntensity: 0.45,
    });

  } else if (["info-desk", "prayer-room", "nursing-room"].includes(zone.id)) {
    const c = zone.id === "prayer-room" ? 0x166534 : zone.id === "nursing-room" ? 0x9d174d : 0x1e40af;
    addBox(objects, world.x, topY + 5, world.z, w * 0.72, 8, d * 0.38, c, {
      emissive: new THREE.Color(c), emissiveIntensity: 0.15,
    });
    // 3 circular info kiosks
    if (zone.id === "info-desk") {
      for (const off of [-0.3, 0, 0.3]) {
        addCylinder(objects, world.x + w * off, topY + 4, world.z, 5, 8, 0x2563eb, 20, {
          emissive: new THREE.Color(0x93c5fd), emissiveIntensity: 0.3,
        });
      }
    }

  } else if (zone.id === "vending") {
    addBox(objects, world.x, topY + 5, world.z, w * 0.72, 8, d * 0.38, 0xdc2626, {
      emissive: new THREE.Color(0xdc2626), emissiveIntensity: 0.35,
    });

  } else if (zone.id === "water-fountain") {
    addBox(objects, world.x, topY + 5, world.z, w * 0.72, 8, d * 0.38, 0x0284c7, {
      emissive: new THREE.Color(0x38bdf8), emissiveIntensity: 0.3,
    });

  } else if (["remote-gate-cafe", "left-wing-cafe", "right-wing-cafe"].includes(zone.id)) {
    addBox(objects, world.x, topY + 3.5, world.z - d * 0.2, w * 0.8, 6, 4, 0x8c5a32, { roughness: 0.35 });
    addCylinder(objects, world.x - w * 0.2, topY + 2.5, world.z + d * 0.2, 3, 5, 0x7c4a2b, 16);
    addCylinder(objects, world.x + w * 0.2, topY + 2.5, world.z + d * 0.2, 3, 5, 0x7c4a2b, 16);

  } else if (zone.id.startsWith("gate-") && !zone.id.startsWith("gate-zone") && !zone.id.startsWith("gate-zone-wc")) {
    const postMatColor = 0x475569;
    // Seating rows — front & back
    for (const rz of [-0.2, 0.18]) {
      for (let i = 0; i < 3; i += 1) {
        const x = world.x - w * 0.26 + i * w * 0.26;
        addBox(objects, x, topY + 2.2, world.z + d * rz, w * 0.18, 3.2, 5.2, 0x374151, { metalness: 0.35, roughness: 0.38 });
        addCylinder(objects, x - w * 0.06, topY + 0.9, world.z + d * rz, 0.7, 3.8, postMatColor, 8);
        addCylinder(objects, x + w * 0.06, topY + 0.9, world.z + d * rz, 0.7, 3.8, postMatColor, 8);
      }
    }
    // Gate agent desk
    addBox(objects, world.x - w * 0.34, topY + 5, world.z + d * 0.35, w * 0.24, 7, 5.5, 0x4b5563, {
      emissive: new THREE.Color(0x2563eb), emissiveIntensity: 0.08,
    });
    // Departure board sprite above gate
    const board = createDepartureBoard(zone.label, Math.max(30, w * 0.55));
    board.position.set(world.x, topY + 26, world.z - d * 0.42);
    objects.push(board);

  } else if (zone.id.startsWith("remote-gate-rg")) {
    // Remote gate pods — same treatment as main gates
    for (const rz of [-0.18, 0.15]) {
      for (let i = 0; i < 2; i += 1) {
        const x = world.x - w * 0.2 + i * w * 0.4;
        addBox(objects, x, topY + 2, world.z + d * rz, w * 0.3, 3, 5, 0x374151, { metalness: 0.3 });
      }
    }
    addBox(objects, world.x, topY + 4, world.z + d * 0.3, w * 0.5, 6, 4, 0x4b5563, {
      emissive: new THREE.Color(0x2563eb), emissiveIntensity: 0.08,
    });
    const board = createDepartureBoard(zone.label, Math.max(22, w * 0.7));
    board.position.set(world.x, topY + 22, world.z - d * 0.38);
    objects.push(board);

  } else if (zone.id === "cargo-building") {
    // Warehouse-style roof
    addBox(objects, world.x, topY + 8, world.z, w * 0.92, 14, d * 0.92, 0x8b7d6a, { roughness: 0.6 });
    // Loading dock doors
    for (const off of [-0.3, 0, 0.3]) {
      addBox(objects, world.x + w * off, topY + 4, world.z - d * 0.42, w * 0.14, 8, 2, 0x475569, { metalness: 0.3 });
    }

  } else if (zone.id === "cargo-loading") {
    addBox(objects, world.x, topY + 3, world.z, w * 0.8, 5, d * 0.7, 0x64748b, { metalness: 0.2 });

  } else if (zone.id === "cargo-storage") {
    for (let i = 0; i < 3; i++) {
      addBox(objects, world.x - w * 0.25 + i * w * 0.25, topY + 4, world.z, w * 0.18, 7, d * 0.6, 0x78716c, { roughness: 0.5 });
    }

  } else if (zone.id === "cargo-office") {
    addBox(objects, world.x, topY + 3, world.z, w * 0.85, 5, d * 0.6, 0x57534e, { roughness: 0.4 });
  }

  return objects;
}

// ── Build Google-Maps-level interior hall props ──────────────────────────────
function createHallInteriorProps(mapRoot: THREE.Group, detailObjects: THREE.Object3D[]): void {
  const hallObjects: THREE.Object3D[] = [];

  // Central marble stripe corridor
  const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(22, 0.4, 380),
      createStandardMaterial({ color: 0xe8e2d8, roughness: 0.28 })
  );
  stripe.position.set(0, 13.4, -35);
  stripe.receiveShadow = true;
  hallObjects.push(stripe);

  // Circular support columns — 10 columns inside the pentagon
  const colPositions: [number, number][] = [
    [-220, -90], [-220, 55], [220, -90], [220, 55],
    [-80, -155], [80, -155], [-80, 10], [80, 10],
    [-340, -30], [340, -30],
  ];
  colPositions.forEach(([cx, cz]) => {
    const col = new THREE.Mesh(
        new THREE.CylinderGeometry(5.5, 5.5, 44, 22),
        createStandardMaterial({ color: 0xf5f0eb, roughness: 0.38 })
    );
    col.position.set(cx, 35, cz);
    col.castShadow = true;
    hallObjects.push(col);

    // Ambient occlusion ring at base
    const base = new THREE.Mesh(
        new THREE.CylinderGeometry(7, 7, 1.5, 22),
        createStandardMaterial({ color: 0xd8d0c4, roughness: 0.6 })
    );
    base.position.set(cx, 13.5, cz);
    hallObjects.push(base);
  });

  // Bench seating rows along corridor walls
  const benchData: [number, number, number][] = [
    [-310, -30, 0], [-310, 55, 0], [310, -30, 0], [310, 55, 0],
    [-140, 130, Math.PI / 2], [0, 130, Math.PI / 2], [140, 130, Math.PI / 2],
    [-140, -185, Math.PI / 2], [0, -185, Math.PI / 2], [140, -185, Math.PI / 2],
  ];
  benchData.forEach(([bx, bz, ry]) => {
    const bench = new THREE.Mesh(
        new THREE.BoxGeometry(38, 3.5, 9),
        createStandardMaterial({ color: 0x44546a, metalness: 0.28, roughness: 0.5 })
    );
    bench.position.set(bx, 16, bz);
    bench.rotation.y = ry;
    bench.castShadow = true;
    hallObjects.push(bench);

    // Bench legs
    for (const lx of [-16, 16]) {
      const leg = new THREE.Mesh(
          new THREE.BoxGeometry(2.5, 5, 2.5),
          createStandardMaterial({ color: 0x64748b, metalness: 0.4 })
      );
      leg.position.set(
          bx + (ry === 0 ? lx : 0),
          13,
          bz + (ry !== 0 ? lx : 0)
      );
      hallObjects.push(leg);
    }
  });

  // Wayfinding totem signs — 4 down central corridor
  const signPositions: [number, number, number, string][] = [
    [-180, -65, 0, "#0ea5e9"],
    [-60,  -65, 0, "#0ea5e9"],
    [60,   -65, 0, "#0ea5e9"],
    [180,  -65, 0, "#0ea5e9"],
  ];
  signPositions.forEach(([sx, sz, , color]) => {
    // Post
    const post = new THREE.Mesh(
        new THREE.BoxGeometry(3.2, 32, 3.2),
        createStandardMaterial({ color: 0x1e293b, metalness: 0.5 })
    );
    post.position.set(sx, 29, sz);
    hallObjects.push(post);

    // Sign panel
    const panel = new THREE.Mesh(
        new THREE.BoxGeometry(26, 8, 2),
        createStandardMaterial({ color: new THREE.Color(color).getHex(), emissive: new THREE.Color(color), emissiveIntensity: 0.45 })
    );
    panel.position.set(sx, 48, sz);
    hallObjects.push(panel);
  });

  // Overhead LED light strips — 20 strips across ceiling
  const pendantMatHall = createStandardMaterial({ color: 0xffffff, emissive: new THREE.Color(0xffffff), emissiveIntensity: 0.85 });
  for (let i = 0; i < 10; i++) {
    const lx = -320 + i * 72;
    for (const lz of [-90, 60]) {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(48, 1.4, 2.5), pendantMatHall.clone());
      strip.position.set(lx, 55, lz);
      hallObjects.push(strip);
    }
  }

  // Central information roundel (circular floor marking)
  const roundel = new THREE.Mesh(
      new THREE.CylinderGeometry(28, 28, 0.5, 48),
      createStandardMaterial({ color: 0x9b8ec4, roughness: 0.3, emissive: new THREE.Color(0x7c6baa), emissiveIntensity: 0.1 })
  );
  roundel.position.set(0, 13.3, -30);
  roundel.receiveShadow = true;
  hallObjects.push(roundel);

  // Gate zone central walkway stripe
  const gateStripe = new THREE.Mesh(
      new THREE.BoxGeometry(640, 0.4, 18),
      createStandardMaterial({ color: 0xd4e8c4, roughness: 0.4 })
  );
  gateStripe.position.set(-18, 9.4, 85);
  gateStripe.receiveShadow = true;
  hallObjects.push(gateStripe);

  // Gate zone pillars between gate pods
  const gateColXs = [-228, -108, 12, 132, 252, 372];
  for (const gcx of gateColXs) {
    for (const gcz of [20, 155, 245]) {
      const gc = new THREE.Mesh(
          new THREE.CylinderGeometry(4, 4, 26, 16),
          createStandardMaterial({ color: 0xecece4, roughness: 0.45 })
      );
      gc.position.set(gcx, 22, gcz);
      gc.castShadow = true;
      hallObjects.push(gc);
    }
  }

  // Jetbridge internal floor arrow markers — more arrows for longer spine
  for (let i = 0; i < 8; i++) {
    const arrow = new THREE.Mesh(
        new THREE.BoxGeometry(6, 0.3, 3),
        createStandardMaterial({ color: 0x334155, roughness: 0.6 })
    );
    arrow.position.set(0, 10.3, -430 + i * 40);
    hallObjects.push(arrow);
  }

  hallObjects.forEach((obj) => {
    mapRoot.add(obj);
    detailObjects.push(obj);
  });
}

export function useThreeScene(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const sceneRef      = useRef<THREE.Scene | null>(null);
  const cameraRef     = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef   = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef   = useRef<OrbitControls | null>(null);
  const passengerMapRef   = useRef<Map<string, PassengerMeshGroup>>(new Map());
  const zoneMeshesRef     = useRef<Map<string, THREE.Mesh>>(new Map());
  const heatmapRef        = useRef(false);
  const trailsRef         = useRef(true);
  const labelsRef         = useRef(true);
  const labelMeshesRef    = useRef<THREE.Object3D[]>([]);
  const raycasterRef      = useRef(new THREE.Raycaster());
  const mouseRef          = useRef(new THREE.Vector2());
  const clickCallbackRef  = useRef<((id: string) => void) | null>(null);
  const canvasElRef       = useRef<HTMLCanvasElement | null>(null);
  const mixamoTemplateRef = useRef<MixamoTemplate | null>(null);
  const defaultCameraPoseRef  = useRef<{ position: THREE.Vector3; target: THREE.Vector3 } | null>(null);
  const overviewCameraPoseRef = useRef<{ position: THREE.Vector3; target: THREE.Vector3 } | null>(null);
  const mapTargetRef      = useRef<THREE.Vector3>(new THREE.Vector3());
  const defaultDistanceRef    = useRef(600);
  const zoomPercentRef    = useRef(DEFAULT_ZOOM_PERCENT);
  const detailObjectsRef  = useRef<THREE.Object3D[]>([]);
  const structureObjectsRef   = useRef<THREE.Object3D[]>([]);
  const nodeObjectsRef    = useRef<THREE.Object3D[]>([]);
  const materialStateRef  = useRef<{ material: THREE.Material; opacity: number; transparent: boolean }[]>([]);
  const [zoomPercent, setZoomPercentState] = useState(DEFAULT_ZOOM_PERCENT);
  const [viewMode, setViewMode] = useState<"2D" | "Detail" | "3D">("3D");

  const applyZoomPercent = useCallback((nextZoom: number, animate = true) => {
    const camera   = cameraRef.current;
    const controls = controlsRef.current;
    const clamped  = THREE.MathUtils.clamp(Math.round(nextZoom), MIN_ZOOM_PERCENT, MAX_ZOOM_PERCENT);
    zoomPercentRef.current = clamped;
    setZoomPercentState(clamped);

    const mode = clamped < 80 ? "2D" : clamped < 140 ? "Detail" : "3D";
    setViewMode(mode);

    materialStateRef.current.forEach(({ material, opacity, transparent }) => {
      material.opacity = opacity;
      material.transparent = transparent;
      material.needsUpdate = true;
    });
    materialStateRef.current = [];

    detailObjectsRef.current.forEach((obj) => { obj.visible = clamped >= 60; });
    nodeObjectsRef.current.forEach((obj)   => { obj.visible = clamped >= 100; });
    passengerMapRef.current.forEach((pg) => {
      pg.group.visible     = clamped >= 85;
      pg.trailLine.visible = trailsRef.current;
      pg.nameBadge.visible = labelsRef.current && clamped >= 120;
    });

    if (clamped < 80) {
      structureObjectsRef.current.forEach((obj) => setObjectOpacity(obj, 0.42, materialStateRef.current));
      labelMeshesRef.current.forEach((label) => { label.visible = labelsRef.current; });
    } else if (clamped < 140) {
      structureObjectsRef.current.forEach((obj) => setObjectOpacity(obj, 0.78, materialStateRef.current));
      labelMeshesRef.current.forEach((label) => { label.visible = labelsRef.current; });
    } else {
      labelMeshesRef.current.forEach((label) => { label.visible = labelsRef.current; });
    }

    if (!camera || !controls) return;
    const target   = mapTargetRef.current.clone();
    const distance = zoomToDistance(defaultDistanceRef.current, clamped);
    const position = cameraPose(target, distance, clamped);

    controls.enableRotate  = clamped >= 80;
    controls.minPolarAngle = clamped < 80 ? 0.01 : Math.PI / 12;
    controls.maxPolarAngle = clamped < 80 ? 0.01 : Math.PI / 2.25;
    controls.minDistance   = zoomToDistance(defaultDistanceRef.current, MAX_ZOOM_PERCENT) * 0.85;
    controls.maxDistance   = zoomToDistance(defaultDistanceRef.current, MIN_ZOOM_PERCENT) * 1.12;

    const duration = animate ? 0.85 : 0;
    gsap.to(camera.position,  { x: position.x, y: position.y, z: position.z, duration, ease: "power3.inOut" });
    gsap.to(controls.target,  { x: target.x,   y: target.y,   z: target.z,   duration, ease: "power3.inOut" });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvasElRef.current = canvas;

    RectAreaLightUniformsLib.init();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeaf1f6);
    scene.fog = null;
    sceneRef.current = scene;

    const initialSize = getCanvasRenderSize(canvas);
    const aspect = initialSize.width / initialSize.height || 1;
    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 2400);
    camera.position.set(0, 850, 900);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace  = THREE.SRGBColorSpace;
    renderer.toneMapping       = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    renderer.setSize(initialSize.width, initialSize.height, false);
    rendererRef.current = renderer;

    const pmremGenerator    = new THREE.PMREMGenerator(renderer);
    const environmentScene  = new RoomEnvironment();
    const environmentTexture = pmremGenerator.fromScene(environmentScene, 0.04).texture;
    scene.environment = environmentTexture;
    pmremGenerator.dispose();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan    = true;
    controls.enableZoom   = true;
    controls.enableRotate = true;
    controls.minPolarAngle = 0.02;
    controls.maxPolarAngle = Math.PI / 2.25;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // ── Lighting
    scene.add(new THREE.AmbientLight(0xfff7ed, 0.62));
    scene.add(new THREE.HemisphereLight(0xffffff, 0xc8b9a4, 0.55));

    const keyLight = new THREE.DirectionalLight(0xfff4df, 1.25);
    keyLight.position.set(150, 300, 150);
    keyLight.castShadow = true;
    keyLight.shadow.camera.left   = -350;
    keyLight.shadow.camera.right  =  350;
    keyLight.shadow.camera.top    =  250;
    keyLight.shadow.camera.bottom = -250;
    keyLight.shadow.camera.far    = 800;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdde4ff, 0.35);
    fillLight.position.set(-100, 200, -100);
    scene.add(fillLight);

    // Interior warmth lights for hall realism
    const hallLight1 = new THREE.PointLight(0xfff3e0, 0.4, 400);
    hallLight1.position.set(-100, 80, -50);
    scene.add(hallLight1);
    const hallLight2 = new THREE.PointLight(0xfff3e0, 0.4, 400);
    hallLight2.position.set(100, 80, 50);
    scene.add(hallLight2);

    const mapRoot = new THREE.Group();
    scene.add(mapRoot);

    const airportBounds = computeAirportBounds();

    // ── Ground floor
    const floorTexture = createFloorTileTexture();
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(airportBounds.width, airportBounds.depth),
        createStandardMaterial({
          color: 0xbfb7aa, roughness: 0.72, metalness: 0.02,
          emissive: new THREE.Color(0x6d6254), emissiveIntensity: 0.025,
          map: floorTexture,
        })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(airportBounds.centerX, FLOOR_HEIGHT, airportBounds.centerZ);
    floor.receiveShadow = true;
    mapRoot.add(floor);

    AIRPORT_PATHS.forEach((path) => {
      mapRoot.add(createPathSegments(path));
    });

    // ── Pentagon main terminal hall (extruded polygon)
    AIRPORT_POLYGONS.forEach((poly) => {
      const shape = new THREE.Shape();
      const startWorld = sourceToWorld(poly.points[0][0], poly.points[0][1]);
      shape.moveTo(startWorld[0], -startWorld[1]);
      for (let i = 1; i < poly.points.length; i++) {
        const pt = sourceToWorld(poly.points[i][0], poly.points[i][1]);
        shape.lineTo(pt[0], -pt[1]);
      }

      const slabHeight = poly.height3d ?? BASE_SLAB_HEIGHT;

      // Slab (floor of the polygon zone)
      const slabGeo = new THREE.ExtrudeGeometry(shape, { depth: slabHeight, bevelEnabled: false });
      slabGeo.rotateX(-Math.PI / 2);
      const slabMat = createStandardMaterial({
        color: poly.color,
        emissive: new THREE.Color(poly.color),
        emissiveIntensity: 0.12,
      });
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.receiveShadow = true;
      slab.castShadow    = true;
      mapRoot.add(slab);
      zoneMeshesRef.current.set(poly.id, slab);
      structureObjectsRef.current.push(slab);

      // Transparent walls
      const polyEdgeColor = colorStringToNumber(poly.edgeColor, 0x7a78a0);
      const wallGeo = new THREE.ExtrudeGeometry(shape, { depth: WALL_HEIGHT, bevelEnabled: false });
      wallGeo.rotateX(-Math.PI / 2);
      wallGeo.translate(0, slabHeight, 0);
      const wallMat = createStandardMaterial({ color: polyEdgeColor, transparent: true, opacity: 0.08 });
      const wall = new THREE.Mesh(wallGeo, wallMat);
      mapRoot.add(wall);
      structureObjectsRef.current.push(wall);

      // Edge lines
      const polyEdgesMat = new THREE.LineBasicMaterial({ color: polyEdgeColor, linewidth: 2 });
      const polyEdges    = new THREE.LineSegments(new THREE.EdgesGeometry(wallGeo), polyEdgesMat);
      mapRoot.add(polyEdges);
      structureObjectsRef.current.push(polyEdges);

      // Zone label sprite
      const labelCanvas = document.createElement("canvas");
      labelCanvas.width = 512; labelCanvas.height = 128;
      const ctx = labelCanvas.getContext("2d")!;
      ctx.clearRect(0, 0, 512, 128);
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.beginPath(); ctx.roundRect(80, 28, 352, 54, 12); ctx.fill();
      ctx.fillStyle = "#3a3860";
      ctx.font = "bold 28px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(poly.label, 256, 64);
      const labelTexture = new THREE.CanvasTexture(labelCanvas);
      labelTexture.colorSpace = THREE.SRGBColorSpace;
      const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTexture, transparent: true, depthWrite: false }));
      const polyCenter = new THREE.Box3().setFromObject(slab).getCenter(new THREE.Vector3());
      label.position.set(polyCenter.x, slabHeight + 12, polyCenter.z + 4);
      label.scale.set(120, 30, 1);
      mapRoot.add(label);
      labelMeshesRef.current.push(label);
    });

    // ── Rectangular zones
    AIRPORT_ZONES.forEach((zone) => {
      const world = rectToWorld(zone);
      const zoneEdgeColor = colorStringToNumber(
          zone.edgeColor,
          zone.type === "landmark" ? 0x8ab870
              : zone.type === "facility" ? 0x5599bb
                  : zone.type === "shop"     ? 0xc8a830
                      : 0x9b9890
      );

      // Slab
      const slabGeo = new THREE.BoxGeometry(world.width, zone.height3d ?? BASE_SLAB_HEIGHT, world.depth);
      const slabMat = createStandardMaterial({
        color: zone.color,
        emissive: new THREE.Color(zone.color),
        emissiveIntensity: zone.type === "landmark" ? 0.1 : 0.05,
      });
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.position.set(world.x, (zone.height3d ?? BASE_SLAB_HEIGHT) / 2, world.z);
      slab.receiveShadow = true;
      slab.castShadow    = true;
      mapRoot.add(slab);
      zoneMeshesRef.current.set(zone.id, slab);
      structureObjectsRef.current.push(slab);

      // Transparent wall
      const wallGeo = new THREE.BoxGeometry(world.width, WALL_HEIGHT, world.depth);
      const wallMat = createStandardMaterial({ color: zoneEdgeColor, transparent: true, opacity: 0.08 });
      const wall    = new THREE.Mesh(wallGeo, wallMat);
      wall.position.set(world.x, WALL_HEIGHT / 2 + (zone.height3d ?? BASE_SLAB_HEIGHT) / 2, world.z);
      mapRoot.add(wall);
      structureObjectsRef.current.push(wall);

      // Edge lines
      const edgesGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(world.width, WALL_HEIGHT, world.depth));
      const edges    = new THREE.LineSegments(edgesGeo, new THREE.LineBasicMaterial({ color: zoneEdgeColor, linewidth: 2 }));
      edges.position.copy(wall.position);
      mapRoot.add(edges);
      structureObjectsRef.current.push(edges);

      // Bottom edge highlight
      const bottomEdges = new THREE.LineSegments(
          new THREE.EdgesGeometry(new THREE.BoxGeometry(world.width, 0.4, world.depth)),
          new THREE.LineBasicMaterial({ color: zoneEdgeColor })
      );
      bottomEdges.position.set(world.x, (zone.height3d ?? BASE_SLAB_HEIGHT) + 0.2, world.z);
      mapRoot.add(bottomEdges);
      structureObjectsRef.current.push(bottomEdges);

      // Zone label
      const labelCanvas = document.createElement("canvas");
      labelCanvas.width = 512; labelCanvas.height = 128;
      const ctx = labelCanvas.getContext("2d")!;
      ctx.clearRect(0, 0, 512, 128);
      ctx.fillStyle = "rgba(255,255,255,0.58)";
      ctx.beginPath(); ctx.roundRect(88, 28, 336, 52, 12); ctx.fill();
      ctx.fillStyle = zone.type === "landmark" ? "#2a5a10"
          : zone.type === "facility" ? "#1a4a6a"
              : zone.type === "shop"     ? "#6b4c00"
                  : "#444444";
      ctx.font = zone.label.length > 18 ? "bold 18px Inter, sans-serif" : "bold 24px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(zone.label, 256, 62);
      const labelTexture = new THREE.CanvasTexture(labelCanvas);
      labelTexture.colorSpace = THREE.SRGBColorSpace;
      const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTexture, transparent: true, depthWrite: false }));
      label.position.set(world.x, (zone.height3d ?? BASE_SLAB_HEIGHT) + 8, world.z);
      label.scale.set(Math.max(22, world.width * 0.85), Math.max(8, world.depth * 0.35), 1);
      mapRoot.add(label);
      labelMeshesRef.current.push(label);

      // Gate number sprite
      if (zone.id.startsWith("gate-") && !zone.id.startsWith("gate-zone") && !zone.id.startsWith("gate-zone-wc")) {
        const gateNumber = createGateNumberSprite(zone.label);
        gateNumber.position.set(world.x, (zone.height3d ?? BASE_SLAB_HEIGHT) + 28, world.z);
        gateNumber.scale.set(26, 26, 1);
        mapRoot.add(gateNumber);
        labelMeshesRef.current.push(gateNumber);
        detailObjectsRef.current.push(gateNumber);
      }

      // Detail objects for this zone
      createAirportDetailObjects(zone, world).forEach((obj) => {
        mapRoot.add(obj);
        detailObjectsRef.current.push(obj);
      });

      // POI sprites for key zones
      const poiConfig =
          zone.id.startsWith("wc") || zone.id.endsWith("-wc")
              ? { icon: "🚻", label: "Washroom", color: "#0284c7" }
              : zone.id === "check-in"
                  ? { icon: "🎫", label: "Check-in", color: "#16a34a" }
                  : zone.id === "duty-free"
                      ? { icon: "🛍", label: "Duty Free", color: "#b45309" }
                      : zone.id === "cafe" || zone.id.endsWith("-cafe")
                          ? { icon: "☕", label: "Café", color: "#7c3f1e" }
                          : zone.id === "pharmacy"
                              ? { icon: "💊", label: "Pharmacy", color: "#166534" }
                              : zone.id === "prayer-room"
                                  ? { icon: "🕌", label: "Prayer", color: "#166534" }
                                  : null;

      if (poiConfig) {
        const poi = createPoiSprite(poiConfig.icon, poiConfig.label, poiConfig.color);
        poi.position.set(world.x, (zone.height3d ?? BASE_SLAB_HEIGHT) + 34, world.z);
        poi.scale.set(Math.max(64, world.width * 1.35), Math.max(32, world.depth * 1.05), 1);
        mapRoot.add(poi);
        labelMeshesRef.current.push(poi);
        detailObjectsRef.current.push(poi);
      }
    });

    // ── BLE beacon nodes
    AIRPORT_NODES.forEach((node) => {
      const world   = nodeToWorld(node);
      const nodeMesh = new THREE.Mesh(
          new THREE.SphereGeometry(Math.max(2.4, world.radius * 1.05), 18, 18),
          createStandardMaterial({ color: node.color, emissive: new THREE.Color(node.color), emissiveIntensity: 0.35 })
      );
      nodeMesh.position.set(world.x, 9, world.z);
      nodeMesh.castShadow = true;
      mapRoot.add(nodeMesh);
      nodeObjectsRef.current.push(nodeMesh);
      detailObjectsRef.current.push(nodeMesh);
    });

    // ── Google-Maps-level interior hall props (columns, benches, signs, strips)
    createHallInteriorProps(mapRoot, detailObjectsRef.current);

    // ── Context geometry: tarmac, aircraft, glass facades, trusses, columns
    const contextMat = createStandardMaterial({ color: 0x9aa4ad, roughness: 0.86, metalness: 0.02 });
    const tarmac = new THREE.Mesh(new THREE.PlaneGeometry(airportBounds.width * 0.96, 380), contextMat);
    tarmac.rotation.x = -Math.PI / 2;
    tarmac.position.set(airportBounds.centerX, FLOOR_HEIGHT + 0.05, airportBounds.maxZ - 200);
    tarmac.receiveShadow = true;
    mapRoot.add(tarmac);

    const runwayMat = createStandardMaterial({ color: 0x475569, roughness: 0.9 });
    for (let i = 0; i < 3; i++) {
      const road = new THREE.Mesh(new THREE.BoxGeometry(airportBounds.width * 0.7, 0.5, 10), runwayMat.clone());
      road.position.set(airportBounds.centerX, 0.45, airportBounds.maxZ - 100 - i * 75);
      road.receiveShadow = true;
      mapRoot.add(road);
    }

    const aircraftMat = createStandardMaterial({ color: 0xf8fafc, metalness: 0.25, roughness: 0.28 });
    for (const [ax, az, rot] of [
      [-430, airportBounds.maxZ - 190, -0.18],
      [-180, airportBounds.maxZ - 155,  0.08],
      [100,  airportBounds.maxZ - 140,  0.05],
      [380,  airportBounds.maxZ - 185,  0.16],
      [580,  airportBounds.maxZ - 210, -0.12],
    ] as const) {
      const plane = new THREE.Group();
      const body  = new THREE.Mesh(new THREE.CapsuleGeometry(9, 78, 10, 22), aircraftMat.clone());
      body.rotation.z = Math.PI / 2; body.castShadow = true; plane.add(body);
      const wing  = new THREE.Mesh(new THREE.BoxGeometry(86, 2.6, 15), aircraftMat.clone());
      wing.castShadow = true; plane.add(wing);
      const tail  = new THREE.Mesh(new THREE.BoxGeometry(22, 3, 22), createStandardMaterial({ color: 0x2563eb, metalness: 0.2, roughness: 0.35 }));
      tail.position.x = -42; tail.castShadow = true; plane.add(tail);
      plane.position.set(ax, 9, az);
      plane.rotation.y = rot;
      plane.scale.setScalar(1.35);
      mapRoot.add(plane);
      detailObjectsRef.current.push(plane);
    }

    const glassMat = createStandardMaterial({
      color: 0x9bd7ef, transparent: true, opacity: 0.28,
      metalness: 0.05, roughness: 0.08,
      emissive: new THREE.Color(0x5bbfe6), emissiveIntensity: 0.07,
    });
    for (const z of [-245, -135, 160, 315, 420]) {
      const facade = new THREE.Mesh(new THREE.BoxGeometry(1100, 34, 3), glassMat.clone());
      facade.position.set(0, 30, z);
      facade.castShadow = true;
      mapRoot.add(facade);
      structureObjectsRef.current.push(facade);
    }

    const trussMat = createStandardMaterial({ color: 0x475569, metalness: 0.45, roughness: 0.26 });
    for (let i = 0; i < 14; i++) {
      const x     = -500 + i * 78;
      const truss = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 520), trussMat.clone());
      truss.position.set(x, 58, -25);
      truss.rotation.z = i % 2 ? 0.12 : -0.12;
      truss.castShadow = true;
      mapRoot.add(truss);
      detailObjectsRef.current.push(truss);
    }

    for (let i = 0; i < 20; i++) {
      const x = -500 + (i % 10) * 108;
      const z = -190 + Math.floor(i / 10) * 270;
      const col = new THREE.Mesh(
          new THREE.CylinderGeometry(4.8, 4.8, 50, 24),
          createStandardMaterial({ color: 0xf8fafc, roughness: 0.42 })
      );
      col.position.set(x, 25, z);
      col.castShadow = true; col.receiveShadow = true;
      mapRoot.add(col);
      detailObjectsRef.current.push(col);
    }

    const pendantMat = createStandardMaterial({ color: 0xffffff, emissive: new THREE.Color(0xffffff), emissiveIntensity: 0.75 });
    for (let i = 0; i < 20; i++) {
      const strip = new THREE.Mesh(new THREE.BoxGeometry(42, 1.2, 2.2), pendantMat.clone());
      strip.position.set(-440 + (i % 10) * 104, 50, -130 + Math.floor(i / 10) * 230);
      mapRoot.add(strip);
      detailObjectsRef.current.push(strip);
    }

    // ── Camera setup
    const mapBounds  = new THREE.Box3().setFromObject(mapRoot);
    const mapSize    = mapBounds.getSize(new THREE.Vector3());
    const mapCenter  = mapBounds.getCenter(new THREE.Vector3());
    mapCenter.y = 0;

    const defaultDistance = distanceToFitBounds(camera, mapSize.x, mapSize.z, 0.82);
    defaultDistanceRef.current = defaultDistance;
    mapTargetRef.current.copy(mapCenter);

    const overviewTarget  = mapCenter.clone();
    const defaultTarget   = mapCenter.clone();
    const overviewPosition = cameraPose(overviewTarget, zoomToDistance(defaultDistance, OVERVIEW_ZOOM_PERCENT), OVERVIEW_ZOOM_PERCENT);
    const defaultPosition  = cameraPose(defaultTarget,  zoomToDistance(defaultDistance, DEFAULT_ZOOM_PERCENT),  DEFAULT_ZOOM_PERCENT);

    overviewCameraPoseRef.current = { position: overviewPosition.clone(), target: overviewTarget.clone() };
    defaultCameraPoseRef.current  = { position: defaultPosition.clone(),  target: defaultTarget.clone() };

    camera.position.copy(defaultPosition);
    controls.target.copy(defaultTarget);
    controls.minDistance      = zoomToDistance(defaultDistance, MAX_ZOOM_PERCENT) * 0.85;
    controls.maxDistance      = zoomToDistance(defaultDistance, MIN_ZOOM_PERCENT) * 1.12;
    controls.maxTargetRadius  = Math.max(mapSize.x, mapSize.z) * 0.35;
    controls.update();
    applyZoomPercent(DEFAULT_ZOOM_PERCENT, false);

    let disposed = false;
    new GLTFLoader().load(
        MIXAMO_CHARACTER_URL,
        (gltf) => {
          if (disposed) return;
          mixamoTemplateRef.current = { scene: gltf.scene, animations: gltf.animations };
        },
        undefined,
        (error) => { console.warn(`Failed to load Mixamo model at ${MIXAMO_CHARACTER_URL}`, error); }
    );

    const onResize = () => {
      const { width: w, height: h } = getCanvasRenderSize(canvas);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);

      const nd = distanceToFitBounds(camera, mapSize.x, mapSize.z, 0.82);
      defaultDistanceRef.current = nd;
      mapTargetRef.current.copy(mapCenter);
      overviewCameraPoseRef.current = {
        position: cameraPose(mapCenter.clone(), zoomToDistance(nd, OVERVIEW_ZOOM_PERCENT), OVERVIEW_ZOOM_PERCENT),
        target:   mapCenter.clone(),
      };
      defaultCameraPoseRef.current = {
        position: cameraPose(mapCenter.clone(), zoomToDistance(nd, DEFAULT_ZOOM_PERCENT), DEFAULT_ZOOM_PERCENT),
        target:   mapCenter.clone(),
      };
      controls.minDistance = zoomToDistance(nd, MAX_ZOOM_PERCENT) * 0.85;
      controls.maxDistance = zoomToDistance(nd, MIN_ZOOM_PERCENT) * 1.12;
      applyZoomPercent(zoomPercentRef.current, false);
    };
    window.addEventListener("resize", onResize);
    requestAnimationFrame(onResize);

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const allMeshes: THREE.Object3D[] = [];
      passengerMapRef.current.forEach((pg) => pg.group.traverse((c) => { if ((c as THREE.Mesh).isMesh) allMeshes.push(c); }));
      const hits = raycasterRef.current.intersectObjects(allMeshes, false);
      if (hits.length > 0) {
        let obj: THREE.Object3D | null = hits[0].object;
        while (obj) { if (obj.userData?.passengerId) { canvas.style.cursor = "pointer"; return; } obj = obj.parent; }
      }
      canvas.style.cursor = "default";
    };
    canvas.addEventListener("mousemove", onMouseMove);

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const allMeshes: THREE.Object3D[] = [];
      passengerMapRef.current.forEach((pg) => pg.group.traverse((c) => { if ((c as THREE.Mesh).isMesh) allMeshes.push(c); }));
      const hits = raycasterRef.current.intersectObjects(allMeshes, false);
      if (hits.length > 0) {
        let obj: THREE.Object3D | null = hits[0].object;
        while (obj) { if (obj.userData?.passengerId) { clickCallbackRef.current?.(obj.userData.passengerId); break; } obj = obj.parent; }
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
      floorTexture.dispose();
      // Don't call renderer.dispose() — it calls WEBGL_lose_context
      // which kills the canvas context. In StrictMode re-mount the new
      // renderer can't get a valid context and the canvas goes black.
      controls.dispose();
      // Clear passenger & scene refs so strict-mode re-mount creates fresh everything
      passengerMapRef.current.clear();
      zoneMeshesRef.current.clear();
      labelMeshesRef.current.forEach((obj) => { if (obj.parent) obj.parent.remove(obj); });
      labelMeshesRef.current = [];
      detailObjectsRef.current = [];
      structureObjectsRef.current = [];
      nodeObjectsRef.current = [];
      materialStateRef.current = [];
    };
  }, [canvasRef, applyZoomPercent]);

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

            const badgeCanvas  = createNameBadgeCanvas(p.id, p.status);
            const badgeTexture = new THREE.CanvasTexture(badgeCanvas);
            const badge = new THREE.Sprite(new THREE.SpriteMaterial({ map: badgeTexture, transparent: true, depthWrite: false }));
            badge.position.set(0, 36, 0);
            badge.scale.set(18, 5, 1);
            group.add(badge);

            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(6, 0.7, 8, 32),
                new THREE.MeshBasicMaterial({ color: getStatusColor(p.status) })
            );
            ring.rotation.x = -Math.PI / 2;
            ring.position.y = 0.5;
            group.add(ring);

            const maxTrail      = 40 * 3;
            const trailPositions = new Float32Array(maxTrail);
            const trailColors    = new Float32Array(maxTrail);
            const trailGeo       = new THREE.BufferGeometry();
            trailGeo.setAttribute("position", new THREE.BufferAttribute(trailPositions, 3));
            trailGeo.setAttribute("color",    new THREE.BufferAttribute(trailColors,    3));
            const trailLine = new THREE.Line(trailGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.5 }));
            trailLine.visible = trailsRef.current;
            scene.add(trailLine);
            scene.add(group);

            pg = { group, model: null, mixer: null, fallbackHuman, nameBadge: badge, statusRing: ring, trailLine, trailPositions, trailColors, lastBadgeKey: `${p.id}:${p.status}` };
            passengerMapRef.current.set(p.id, pg);
          }

          const template = mixamoTemplateRef.current;
          if (template && !pg.model) attachMixamoModel(pg, template, p);

          pg.group.visible          = zoomPercentRef.current >= 85;
          pg.fallbackHuman.group.visible = !pg.model;
          pg.nameBadge.visible      = labelsRef.current && zoomPercentRef.current >= 120;
          let floorY = 0;
          try { floorY = getFloorHeightAtPosition(p.position[0], p.position[1]); } catch {}
          pg.group.position.set(p.position[0], floorY, p.position[1]);

          if (p.trail.length >= 2) {
            const prev  = p.trail[p.trail.length - 2];
            const curr  = p.trail[p.trail.length - 1];
            pg.group.rotation.y = -Math.atan2(curr[1] - prev[1], curr[0] - prev[0]) + Math.PI / 2;
          }

          // Walking animation driven by actual movement
          const idPhase = p.id.charCodeAt(p.id.length - 1) * 10;
          pg.userData = pg.userData || { walkPhase: 0, prevPos: new THREE.Vector3() };
          if (!pg.userData.prevPos) pg.userData.prevPos = new THREE.Vector3();
          const moved = pg.userData.prevPos.distanceTo(pg.group.position);
          pg.userData.prevPos.copy(pg.group.position);

          const legSwing = Math.sin(pg.userData.walkPhase) * Math.min(0.15, moved * 12);
          const armSwing = Math.sin(pg.userData.walkPhase) * Math.min(0.1, moved * 8);
          const bobAmount = Math.abs(Math.sin(pg.userData.walkPhase)) * Math.min(0.15, moved * 8);
          pg.userData.walkPhase = (pg.userData.walkPhase || 0) + moved * 30;

          // When almost not moving, keep slight idle sway
          const still = moved < 0.01;
          const finalLegSwing = still ? Math.sin(performance.now() * 0.002 + idPhase) * 0.05 : legSwing;
          const finalArmSwing = still ? Math.sin(performance.now() * 0.002 + idPhase) * 0.03 : armSwing;
          const finalBob = still ? 0 : bobAmount;

          pg.fallbackHuman.legL.rotation.x = finalLegSwing;
          pg.fallbackHuman.legR.rotation.x = -finalLegSwing;
          pg.fallbackHuman.armL.rotation.x = -finalArmSwing;
          pg.fallbackHuman.armR.rotation.x = finalArmSwing;
          pg.fallbackHuman.group.position.y = finalBob;

          (pg.statusRing.material as THREE.MeshBasicMaterial).color.setHex(getStatusColor(p.status));
          pg.statusRing.rotation.z += 0.01;

          const badgeKey = `${p.id}:${p.status}`;
          if (pg.lastBadgeKey !== badgeKey) {
            const badgeCanvas = createNameBadgeCanvas(p.id, p.status);
            const badgeMat = pg.nameBadge.material as THREE.SpriteMaterial;
            badgeMat.map?.dispose();
            badgeMat.map = new THREE.CanvasTexture(badgeCanvas);
            badgeMat.map.needsUpdate = true;
            pg.lastBadgeKey = badgeKey;
          }

          pg.trailLine.visible = zoomPercentRef.current >= 85 && trailsRef.current;
          if (p.trail.length > 1) {
            const posArr = pg.trailPositions;
            const colArr = pg.trailColors;
            const len    = Math.min(p.trail.length, 40);
            for (let i = 0; i < len; i++) {
              posArr[i * 3]     = p.trail[i][0];
              const floorY = getFloorHeightAtPosition(p.position[0], p.position[1]);
              posArr[i * 3 + 1] = floorY + 0.8;
              posArr[i * 3 + 2] = p.trail[i][1];
              const alpha = i / len;
              const c = new THREE.Color(p.shirtColor);
              c.multiplyScalar(alpha * 0.7 + 0.3);
              colArr[i * 3] = c.r; colArr[i * 3 + 1] = c.g; colArr[i * 3 + 2] = c.b;
            }
            pg.trailLine.geometry.setDrawRange(0, len);
            pg.trailLine.geometry.attributes.position.needsUpdate = true;
            pg.trailLine.geometry.attributes.color.needsUpdate    = true;
          }
        });
      },
      []
  );

  const setHeatmap = useCallback((fn: (v: boolean) => boolean) => {
    const newVal = fn(heatmapRef.current);
    heatmapRef.current = newVal;
    zoneMeshesRef.current.forEach((mesh, id) => {
      const zone = AIRPORT_ZONES.find((z) => z.id === id);
      if (!zone) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (newVal) mat.color.lerp(new THREE.Color(0xff2200), 0.6);
      else        mat.color.set(zone.color);
    });
  }, []);

  const setTrails = useCallback((fn: (v: boolean) => boolean) => {
    trailsRef.current = fn(trailsRef.current);
    passengerMapRef.current.forEach((pg) => {
      pg.trailLine.visible = zoomPercentRef.current >= 85 && trailsRef.current;
    });
  }, []);

  const setLabels = useCallback((fn: (v: boolean) => boolean) => {
    const newVal = fn(labelsRef.current);
    labelsRef.current = newVal;
    labelMeshesRef.current.forEach((m) => (m.visible = newVal));
    passengerMapRef.current.forEach((pg) => {
      pg.nameBadge.visible = newVal && zoomPercentRef.current >= 120;
    });
  }, []);

  const flyToPassenger = useCallback((id: string) => {
    const pg       = passengerMapRef.current.get(id);
    const camera   = cameraRef.current;
    const controls = controlsRef.current;
    if (!pg || !camera || !controls) return;
    const pos = pg.group.position;
    gsap.to(camera.position,  { x: pos.x + 40, y: 120, z: pos.z + 80, duration: 1.5, ease: "power3.inOut" });
    gsap.to(controls.target,  { x: pos.x,       y: 0,   z: pos.z,      duration: 1.5, ease: "power3.inOut" });
  }, []);

  const setZoomPercent = useCallback((nextZoom: number) => { applyZoomPercent(nextZoom, true); }, [applyZoomPercent]);
  const zoomIn  = useCallback(() => { applyZoomPercent(zoomPercentRef.current + ZOOM_STEP_PERCENT, true); }, [applyZoomPercent]);
  const zoomOut = useCallback(() => { applyZoomPercent(zoomPercentRef.current - ZOOM_STEP_PERCENT, true); }, [applyZoomPercent]);
  const resetCamera    = useCallback(() => { applyZoomPercent(DEFAULT_ZOOM_PERCENT,  true); }, [applyZoomPercent]);
  const zoomToOverview = useCallback(() => { applyZoomPercent(OVERVIEW_ZOOM_PERCENT, true); }, [applyZoomPercent]);

  return { syncPassengers, setHeatmap, setTrails, setLabels, flyToPassenger, resetCamera, zoomToOverview, setZoomPercent, zoomIn, zoomOut, zoomPercent, viewMode };
}