import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import gsap from "gsap";
import { TERMINAL_ZONES, WALL_HEIGHT, FLOOR_COLOR, type ZoneDef } from "./mapGeometry";
import type { Passenger } from "./passengerData";

const DEFAULT_CAMERA_POS = new THREE.Vector3(0, 280, 220);
const DEFAULT_CAMERA_TARGET = new THREE.Vector3(0, 0, 0);

type PassengerMeshGroup = {
  group: THREE.Group;
  legL: THREE.Mesh;
  legR: THREE.Mesh;
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

function darkenColor(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.floor(r * factor)}, ${Math.floor(g * factor)}, ${Math.floor(b * factor)})`;
}

function getSkinTone(nationality: string): string {
  switch (nationality) {
    case "Ghanaian":
    case "Nigerian":
      return "#8D5524";
    case "Japanese":
    case "Chinese":
      return "#F1C27D";
    case "Indian":
      return "#C68642";
    case "Brazilian":
      return "#D4A574";
    case "Saudi":
      return "#D2A679";
    case "Russian":
    case "French":
      return "#FFDBB4";
    default: return "#E8B88A";
  }
}

function createNameBadgeCanvas(id: string, status: string): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 32;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, 128, 32);

  // Status dot
  const statusHex = status === "navigating" ? "#22aaff"
    : status === "shopping" ? "#ffaa22"
    : status === "waiting" ? "#8888ff"
    : status === "difficulty" ? "#ff4444"
    : "#22ff88";
  ctx.beginPath();
  ctx.arc(10, 16, 5, 0, Math.PI * 2);
  ctx.fillStyle = statusHex;
  ctx.fill();

  // Text
  ctx.font = "bold 14px monospace";
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.fillText(id, 22, 21);

  return canvas;
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0e1a);
    scene.fog = new THREE.Fog(0x0a0e1a, 400, 800);
    sceneRef.current = scene;

    // Camera
    const aspect = canvas.clientWidth / canvas.clientHeight || 1;
    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 2000);
    camera.position.set(0, 600, 600); // start high for cinematic entry
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.minPolarAngle = Math.PI / 6;
    controls.maxPolarAngle = Math.PI / 2.2;
    controls.minDistance = 80;
    controls.maxDistance = 600;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // Lighting
    const ambient = new THREE.AmbientLight(0x1a2040, 0.8);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0x4080ff, 1.2);
    keyLight.position.set(100, 200, 100);
    keyLight.castShadow = true;
    keyLight.shadow.camera.far = 800;
    keyLight.shadow.mapSize.set(2048, 2048);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xff6030, 0.4);
    fillLight.position.set(-100, 150, -100);
    scene.add(fillLight);

    const centerLight = new THREE.PointLight(0x00aaff, 0.6, 300);
    centerLight.position.set(0, 100, 0);
    scene.add(centerLight);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(700, 400);
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x0a0e1a });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    // Grid
    const grid = new THREE.GridHelper(700, 70, 0x1a2040, 0x111828);
    grid.position.y = 0.5;
    scene.add(grid);

    // Terminal zones
    TERMINAL_ZONES.forEach((zone) => {
      // Floor slab
      const slabGeo = new THREE.BoxGeometry(zone.width, 2, zone.depth);
      const slabMat = new THREE.MeshLambertMaterial({ color: zone.color });
      const slab = new THREE.Mesh(slabGeo, slabMat);
      slab.position.set(zone.x, 1, zone.z);
      slab.receiveShadow = true;
      scene.add(slab);
      zoneMeshesRef.current.set(zone.id, slab);

      // Low transparent walls
      const wallGeo = new THREE.BoxGeometry(zone.width, WALL_HEIGHT, zone.depth);
      const wallMat = new THREE.MeshLambertMaterial({
        color: zone.color,
        transparent: true,
        opacity: 0.15,
      });
      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.set(zone.x, WALL_HEIGHT / 2 + 2, zone.z);
      scene.add(wall);

      // Neon edge lines
      const edgesGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(zone.width, WALL_HEIGHT, zone.depth));
      const edgesMat = new THREE.LineBasicMaterial({ color: 0x2244aa });
      const edges = new THREE.LineSegments(edgesGeo, edgesMat);
      edges.position.set(zone.x, WALL_HEIGHT / 2 + 2, zone.z);
      scene.add(edges);
    });

    // Zone labels
    TERMINAL_ZONES.forEach((zone) => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, 256, 64);
      ctx.font = "bold 20px Inter, sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.globalAlpha = 0.7;
      ctx.fillText(zone.label, 128, 40);

      const texture = new THREE.CanvasTexture(canvas);
      const labelGeo = new THREE.PlaneGeometry(zone.width * 0.6, 10);
      const labelMat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
      });
      const label = new THREE.Mesh(labelGeo, labelMat);
      label.position.set(zone.x, 12, zone.z);
      label.rotation.x = -Math.PI / 2;
      scene.add(label);
      labelMeshesRef.current.push(label);
    });

    // Cinematic entry
    gsap.fromTo(
      camera.position,
      { x: 0, y: 600, z: 600 },
      { x: 0, y: 280, z: 220, duration: 2.5, ease: "power3.out" }
    );
    gsap.fromTo(
      canvas,
      { opacity: 0 },
      { opacity: 1, duration: 1.5, ease: "power2.out" }
    );

    // Resize handler
    const onResize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // Click detection
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
    canvas.addEventListener("mousedown", onClick);

    // Animation loop
    renderer.setAnimationLoop(() => {
      controls.update();
      renderer.render(scene, camera);
    });

    return () => {
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("mousedown", onClick);
      renderer.setAnimationLoop(null);
      renderer.dispose();
      controls.dispose();
    };
  }, [canvasRef]);

  // Sync passengers
  const syncPassengers = useCallback(
    (passengers: Passenger[], onClick: (id: string) => void) => {
      const scene = sceneRef.current;
      if (!scene) return;
      clickCallbackRef.current = onClick;

      const now = Date.now();

      passengers.forEach((p) => {
        let pg = passengerMapRef.current.get(p.id);

        if (!pg) {
          // Create new passenger group
          const group = new THREE.Group();
          group.userData.passengerId = p.id;

          // Shadow disc
          const shadowGeo = new THREE.CircleGeometry(5, 16);
          const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 });
          const shadow = new THREE.Mesh(shadowGeo, shadowMat);
          shadow.rotation.x = -Math.PI / 2;
          shadow.position.y = 0.1;
          group.add(shadow);

          // Legs
          const legColor = darkenColor(p.shirtColor, 0.6);
          const legGeo = new THREE.CylinderGeometry(1, 1, 8, 8);
          const legMatL = new THREE.MeshLambertMaterial({ color: legColor });
          const legMatR = new THREE.MeshLambertMaterial({ color: legColor });
          const legL = new THREE.Mesh(legGeo, legMatL);
          const legR = new THREE.Mesh(legGeo, legMatR);
          legL.position.set(-2, 4, 0);
          legR.position.set(2, 4, 0);
          legL.castShadow = true;
          legR.castShadow = true;
          group.add(legL);
          group.add(legR);

          // Body
          const bodyGeo = new THREE.CylinderGeometry(3, 3.5, 10, 12);
          const bodyMat = new THREE.MeshLambertMaterial({ color: p.shirtColor });
          const body = new THREE.Mesh(bodyGeo, bodyMat);
          body.position.y = 13;
          body.castShadow = true;
          group.add(body);

          // Head
          const headGeo = new THREE.SphereGeometry(4, 16, 16);
          const headMat = new THREE.MeshLambertMaterial({ color: getSkinTone(p.nationality) });
          const head = new THREE.Mesh(headGeo, headMat);
          head.position.y = 21;
          head.castShadow = true;
          group.add(head);

          // Eyes
          const eyeGeo = new THREE.SphereGeometry(0.6, 8, 8);
          const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
          const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
          const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
          eyeL.position.set(-1.5, 22, 3.5);
          eyeR.position.set(1.5, 22, 3.5);
          group.add(eyeL);
          group.add(eyeR);

          // Name badge
          const badgeCanvas = createNameBadgeCanvas(p.id, p.status);
          const badgeTexture = new THREE.CanvasTexture(badgeCanvas);
          const badgeGeo = new THREE.PlaneGeometry(16, 4);
          const badgeMat = new THREE.MeshBasicMaterial({ map: badgeTexture, transparent: true, depthWrite: false });
          const badge = new THREE.Sprite(badgeMat);
          badge.position.set(0, 30, 0);
          badge.scale.set(16, 4, 1);
          group.add(badge);

          // Status ring
          const ringGeo = new THREE.TorusGeometry(5, 0.5, 8, 32);
          const ringMat = new THREE.MeshBasicMaterial({ color: getStatusColor(p.status) });
          const ring = new THREE.Mesh(ringGeo, ringMat);
          ring.rotation.x = -Math.PI / 2;
          ring.position.y = 0.5;
          group.add(ring);

          // Trail line
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
          pg = { group, legL, legR, nameBadge: badge, statusRing: ring, trailLine, trailPositions, trailColors };
          passengerMapRef.current.set(p.id, pg);
        }

        // Update position
        pg.group.position.set(p.position[0], 0, p.position[1]);

        // Face direction
        if (p.trail.length >= 2) {
          const prev = p.trail[p.trail.length - 2];
          const curr = p.trail[p.trail.length - 1];
          const angle = Math.atan2(curr[1] - prev[1], curr[0] - prev[0]);
          pg.group.rotation.y = -angle + Math.PI / 2;
        }

        // Leg animation
        const legSwing = Math.sin(now * 0.008 + p.id.charCodeAt(4) * 10) * 0.3;
        pg.legL.rotation.x = p.status === "boarded" ? 0 : legSwing;
        pg.legR.rotation.x = p.status === "boarded" ? 0 : -legSwing;

        // Status ring color
        (pg.statusRing.material as THREE.MeshBasicMaterial).color.setHex(getStatusColor(p.status));
        pg.statusRing.rotation.z += 0.01;

        // Name badge
        const badgeCanvas = createNameBadgeCanvas(p.id, p.status);
        (pg.nameBadge.material as THREE.SpriteMaterial).map = new THREE.CanvasTexture(badgeCanvas);
        (pg.nameBadge.material as THREE.SpriteMaterial).map!.needsUpdate = true;

        // Trail
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

  // Heatmap
  const setHeatmap = useCallback((fn: (v: boolean) => boolean) => {
    const newVal = fn(heatmapRef.current);
    heatmapRef.current = newVal;

    zoneMeshesRef.current.forEach((mesh, id) => {
      const zone = TERMINAL_ZONES.find((z) => z.id === id);
      if (!zone) return;
      if (newVal) {
        (mesh.material as THREE.MeshLambertMaterial).color.lerp(new THREE.Color(0xff4400), 0.3);
      } else {
        (mesh.material as THREE.MeshLambertMaterial).color.set(zone.color);
      }
    });
  }, []);

  // Trails toggle
  const setTrails = useCallback((fn: (v: boolean) => boolean) => {
    trailsRef.current = fn(trailsRef.current);
  }, []);

  // Labels toggle
  const setLabels = useCallback((fn: (v: boolean) => boolean) => {
    const newVal = fn(labelsRef.current);
    labelsRef.current = newVal;
    labelMeshesRef.current.forEach((m) => (m.visible = newVal));
  }, []);

  // Fly to passenger
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

  // Reset camera
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
