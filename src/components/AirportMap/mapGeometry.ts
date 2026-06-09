export type ZoneType = "corridor" | "shop" | "facility" | "security" | "landmark";

export type SourceRect = {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: ZoneType;
  color: string;
  edgeColor?: string;
  height3d?: number;
};

export type SourceNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  radius: number;
  type: ZoneType;
  color: string;
};

export type SourcePath = {
  id: string;
  points: [number, number][];
  width: number;
  color: string;
  height3d?: number;
};

export type SourcePolygon = {
  id: string;
  label: string;
  points: [number, number][];
  type: ZoneType;
  color: string;
  edgeColor?: string;
  height3d?: number;
};

export const SOURCE_VIEWBOX = { width: 1000, height: 700 };
export const WORLD_SIZE = { width: 1200, depth: 840 };
export const FLOOR_HEIGHT = 0;
export const BASE_SLAB_HEIGHT = 7;
export const WALL_HEIGHT = 30;
export const PATH_ELEVATION = 1.1;

export function worldToSource(x: number, z: number): [number, number] {
  return [
    (x / WORLD_SIZE.width) * SOURCE_VIEWBOX.width + SOURCE_VIEWBOX.width / 2,
    (z / WORLD_SIZE.depth) * SOURCE_VIEWBOX.height + SOURCE_VIEWBOX.height / 2,
  ];
}

export function sourceToWorld(x: number, y: number): [number, number] {
  return [
    ((x - SOURCE_VIEWBOX.width / 2) / SOURCE_VIEWBOX.width) * WORLD_SIZE.width,
    ((y - SOURCE_VIEWBOX.height / 2) / SOURCE_VIEWBOX.height) * WORLD_SIZE.depth,
  ];
}

export function rectToWorld(rect: SourceRect): { x: number; z: number; width: number; depth: number } {
  const [x, z] = sourceToWorld(rect.x + rect.width / 2, rect.y + rect.height / 2);
  return {
    x,
    z,
    width: (rect.width / SOURCE_VIEWBOX.width) * WORLD_SIZE.width,
    depth: (rect.height / SOURCE_VIEWBOX.height) * WORLD_SIZE.depth,
  };
}

export function nodeToWorld(node: SourceNode): { x: number; z: number; radius: number } {
  const [x, z] = sourceToWorld(node.x, node.y);
  return {
    x,
    z,
    radius: (node.radius / SOURCE_VIEWBOX.width) * WORLD_SIZE.width,
  };
}

// ── POLYGONS ─────────────────────────────────────────────────────────────────
// Main terminal hall: pentagon / home-icon roof shape.
// Points listed clockwise from bottom-left.
// Bottom edge y=470 aligns exactly with top of gate zone.
// Tip at y=110 forms the pointed roof pointing upward.
export const AIRPORT_POLYGONS: SourcePolygon[] = [
  {
    id: "main-terminal-hall",
    label: "Main Terminal Hall",
    points: [
      [165, 470], // bottom-left  (wide base, flush with gate zone top)
      [835, 470], // bottom-right
      [795, 305], // right shoulder
      [500, 108], // top tip — pointed roof
      [205, 305], // left shoulder
    ],
    type: "corridor",
    color: "#d9d0ee",
    edgeColor: "#8274a8",
    height3d: 13,
  },
];

// ── ZONES (rects) ─────────────────────────────────────────────────────────────
export const AIRPORT_ZONES: SourceRect[] = [

  // ── Jetbridge vertical spine (top-center) — VERY long pipe matching original image
  {
    id: "jetbridge-corridor",
    label: "Jetbridge Spine",
    x: 475, y: -60, width: 50, height: 250,
    type: "corridor", color: "#cfd8dc", edgeColor: "#6f8794", height3d: 10,
  },

  // ── Horizontal glass bridge to remote gate — branches off spine, very long
  {
    id: "jetbridge-horizontal-connector",
    label: "Glass Bridge",
    x: 620, y: 55, width: 310, height: 42,
    type: "corridor", color: "#cfe5ee", edgeColor: "#668797", height3d: 10,
  },

  // ── Remote gate building (top-right) — large rectangular block
  {
    id: "remote-gate-building",
    label: "Remote Gate Building",
    x: 890, y: 10, width: 100, height: 100,
    type: "landmark", color: "#e2ddd2", edgeColor: "#83786b", height3d: 17,
  },

  // ── Remote gate building internal gates
  {
    id: "remote-gate-rg1", label: "RG1",
    x: 896, y: 16, width: 40, height: 40,
    type: "landmark", color: "#e8e4d8", edgeColor: "#7e9070", height3d: 14,
  },
  {
    id: "remote-gate-rg2", label: "RG2",
    x: 944, y: 16, width: 40, height: 40,
    type: "landmark", color: "#e8e4d8", edgeColor: "#7e9070", height3d: 14,
  },
  {
    id: "remote-gate-rg3", label: "RG3",
    x: 896, y: 62, width: 40, height: 40,
    type: "landmark", color: "#e8e4d8", edgeColor: "#7e9070", height3d: 14,
  },
  {
    id: "remote-gate-rg4", label: "RG4",
    x: 944, y: 62, width: 40, height: 40,
    type: "landmark", color: "#e8e4d8", edgeColor: "#7e9070", height3d: 14,
  },
  {
    id: "remote-gate-wc", label: "WC",
    x: 896, y: 62, width: 30, height: 30,
    type: "facility", color: "#9fc7d3", edgeColor: "#4f8596", height3d: 10,
  },
  {
    id: "remote-gate-cafe", label: "Café",
    x: 940, y: 62, width: 44, height: 30,
    type: "shop", color: "#b98357", edgeColor: "#7b4f30", height3d: 12,
  },

  // ── Main hall interior — check-in & security
  {
    id: "check-in",
    label: "12 Kiosk Check-in Island",
    x: 308, y: 340, width: 155, height: 65,
    type: "facility", color: "#c8c1b8", edgeColor: "#766d62", height3d: 13,
  },
  {
    id: "security",
    label: "Security Screening",
    x: 520, y: 340, width: 172, height: 65,
    type: "security", color: "#c8c1b8", edgeColor: "#766d62", height3d: 13,
  },

  // ── Main hall — information & services
  {
    id: "info-desk",
    label: "Info Kiosks",
    x: 438, y: 248, width: 124, height: 48,
    type: "facility", color: "#bfc6d4", edgeColor: "#6e7a90", height3d: 12,
  },
  {
    id: "currency-exchange",
    label: "Currency Exchange",
    x: 310, y: 228, width: 108, height: 48,
    type: "facility", color: "#d7cfaa", edgeColor: "#8b7b3f", height3d: 13,
  },
  {
    id: "prayer-room",
    label: "Prayer Room",
    x: 585, y: 228, width: 88, height: 48,
    type: "facility", color: "#d6eadf", edgeColor: "#5e8e75", height3d: 12,
  },
  {
    id: "nursing-room",
    label: "Nursing Room",
    x: 682, y: 265, width: 78, height: 50,
    type: "facility", color: "#f2d7df", edgeColor: "#a85f76", height3d: 12,
  },
  {
    id: "pharmacy",
    label: "Pharmacy",
    x: 230, y: 265, width: 88, height: 50,
    type: "shop", color: "#d7ead7", edgeColor: "#5c8f63", height3d: 13,
  },

  // ── Main hall — washrooms (west + east)
  {
    id: "wc-west",
    label: "Washrooms ♂♀",
    x: 188, y: 330, width: 80, height: 56,
    type: "facility", color: "#9fc7d3", edgeColor: "#4f8596", height3d: 12,
  },
  {
    id: "wc-east",
    label: "Washrooms ♂♀",
    x: 732, y: 330, width: 80, height: 56,
    type: "facility", color: "#9fc7d3", edgeColor: "#4f8596", height3d: 12,
  },

  // ── Main hall — retail row
  {
    id: "duty-free",
    label: "Duty Free",
    x: 248, y: 400, width: 120, height: 55,
    type: "shop", color: "#c69b55", edgeColor: "#8b6426", height3d: 14,
  },
  {
    id: "bookstore",
    label: "Bookstore",
    x: 382, y: 402, width: 96, height: 52,
    type: "shop", color: "#c4b5fd", edgeColor: "#6d5aa7", height3d: 13,
  },
  {
    id: "cafe",
    label: "Café",
    x: 492, y: 400, width: 110, height: 55,
    type: "shop", color: "#b98357", edgeColor: "#7b4f30", height3d: 14,
  },
  {
    id: "convenience-store",
    label: "Convenience Store",
    x: 616, y: 400, width: 122, height: 55,
    type: "shop", color: "#e0b36a", edgeColor: "#9a6e2f", height3d: 14,
  },

  // ── Left wing corridor (west) — extended much wider
  {
    id: "left-wing-corridor",
    label: "West Wing Corridor",
    x: 0, y: 385, width: 280, height: 88,
    type: "corridor", color: "#d4cec1", edgeColor: "#8b8173", height3d: 12,
  },
  {
    id: "left-wing-exit",
    label: "West Exit",
    x: 0, y: 365, width: 72, height: 128,
    type: "facility", color: "#c8c0b2", edgeColor: "#8b8173", height3d: 13,
  },
  {
    id: "left-wing-cafe",
    label: "Café Kiosk",
    x: 80, y: 392, width: 78, height: 46,
    type: "shop", color: "#b98357", edgeColor: "#7b4f30", height3d: 11,
  },
  {
    id: "left-wing-wc",
    label: "WC",
    x: 170, y: 392, width: 48, height: 46,
    type: "facility", color: "#9fc7d3", edgeColor: "#4f8596", height3d: 10,
  },

  // ── Right wing corridor (east) — extended much wider
  {
    id: "right-wing-corridor",
    label: "East Wing Corridor",
    x: 720, y: 385, width: 280, height: 88,
    type: "corridor", color: "#d4cec1", edgeColor: "#8b8173", height3d: 12,
  },
  {
    id: "right-wing-exit",
    label: "East Exit",
    x: 928, y: 365, width: 72, height: 128,
    type: "facility", color: "#c8c0b2", edgeColor: "#8b8173", height3d: 13,
  },
  {
    id: "right-wing-cafe",
    label: "Café Kiosk",
    x: 780, y: 392, width: 78, height: 46,
    type: "shop", color: "#b98357", edgeColor: "#7b4f30", height3d: 11,
  },
  {
    id: "right-wing-wc",
    label: "WC",
    x: 870, y: 392, width: 48, height: 46,
    type: "facility", color: "#9fc7d3", edgeColor: "#4f8596", height3d: 10,
  },

  // ── Gate zone (wide green rectangle — base of home icon) — taller with more gates
  {
    id: "gate-zone",
    label: "Departure Gate Zone",
    x: 165, y: 470, width: 670, height: 230,
    type: "corridor", color: "#b8d3ab", edgeColor: "#5f8a53", height3d: 9,
  },

  // Gate pods — row 1 (top row)
  { id: "gate-1",  label: "G1",  x: 178, y: 488, width: 96, height: 58, type: "landmark", color: "#e1ddcf", edgeColor: "#7e9070", height3d: 16 },
  { id: "gate-2",  label: "G2",  x: 298, y: 488, width: 96, height: 58, type: "landmark", color: "#e1ddcf", edgeColor: "#7e9070", height3d: 16 },
  { id: "gate-3",  label: "G3",  x: 418, y: 488, width: 96, height: 58, type: "landmark", color: "#e1ddcf", edgeColor: "#7e9070", height3d: 16 },
  { id: "gate-4",  label: "G4",  x: 538, y: 488, width: 96, height: 58, type: "landmark", color: "#e1ddcf", edgeColor: "#7e9070", height3d: 16 },
  { id: "gate-5",  label: "G5",  x: 658, y: 488, width: 96, height: 58, type: "landmark", color: "#e1ddcf", edgeColor: "#7e9070", height3d: 16 },

  // Gate pods — row 2 (middle row)
  { id: "gate-6",  label: "G6",  x: 178, y: 580, width: 96, height: 58, type: "landmark", color: "#e1ddcf", edgeColor: "#7e9070", height3d: 16 },
  { id: "gate-7",  label: "G7",  x: 298, y: 580, width: 96, height: 58, type: "landmark", color: "#e1ddcf", edgeColor: "#7e9070", height3d: 16 },
  { id: "gate-8",  label: "G8",  x: 418, y: 580, width: 96, height: 58, type: "landmark", color: "#e1ddcf", edgeColor: "#7e9070", height3d: 16 },
  { id: "gate-9",  label: "G9",  x: 538, y: 580, width: 96, height: 58, type: "landmark", color: "#e1ddcf", edgeColor: "#7e9070", height3d: 16 },
  { id: "gate-10", label: "G10", x: 658, y: 580, width: 96, height: 58, type: "landmark", color: "#e1ddcf", edgeColor: "#7e9070", height3d: 16 },

  // Gate pods — row 3 (bottom row — new)
  { id: "gate-11", label: "G11", x: 178, y: 660, width: 96, height: 52, type: "landmark", color: "#e1ddcf", edgeColor: "#7e9070", height3d: 16 },
  { id: "gate-12", label: "G12", x: 298, y: 660, width: 96, height: 52, type: "landmark", color: "#e1ddcf", edgeColor: "#7e9070", height3d: 16 },
  { id: "gate-13", label: "G13", x: 418, y: 660, width: 96, height: 52, type: "landmark", color: "#e1ddcf", edgeColor: "#7e9070", height3d: 16 },
  { id: "gate-14", label: "G14", x: 538, y: 660, width: 96, height: 52, type: "landmark", color: "#e1ddcf", edgeColor: "#7e9070", height3d: 16 },
  { id: "gate-15", label: "G15", x: 658, y: 660, width: 96, height: 52, type: "landmark", color: "#e1ddcf", edgeColor: "#7e9070", height3d: 16 },

  // Vertical jetbridge corridors between gate rows (matching original image)
  { id: "jetbridge-v-1", label: "Jetbridge", x: 185, y: 546, width: 22, height: 34, type: "corridor", color: "#c8c0b2", edgeColor: "#8b8173", height3d: 8 },
  { id: "jetbridge-v-2", label: "Jetbridge", x: 305, y: 546, width: 22, height: 34, type: "corridor", color: "#c8c0b2", edgeColor: "#8b8173", height3d: 8 },
  { id: "jetbridge-v-3", label: "Jetbridge", x: 425, y: 546, width: 22, height: 34, type: "corridor", color: "#c8c0b2", edgeColor: "#8b8173", height3d: 8 },
  { id: "jetbridge-v-4", label: "Jetbridge", x: 545, y: 546, width: 22, height: 34, type: "corridor", color: "#c8c0b2", edgeColor: "#8b8173", height3d: 8 },
  { id: "jetbridge-v-5", label: "Jetbridge", x: 665, y: 546, width: 22, height: 34, type: "corridor", color: "#c8c0b2", edgeColor: "#8b8173", height3d: 8 },
  { id: "jetbridge-v-6", label: "Jetbridge", x: 185, y: 638, width: 22, height: 22, type: "corridor", color: "#c8c0b2", edgeColor: "#8b8173", height3d: 8 },
  { id: "jetbridge-v-7", label: "Jetbridge", x: 305, y: 638, width: 22, height: 22, type: "corridor", color: "#c8c0b2", edgeColor: "#8b8173", height3d: 8 },
  { id: "jetbridge-v-8", label: "Jetbridge", x: 425, y: 638, width: 22, height: 22, type: "corridor", color: "#c8c0b2", edgeColor: "#8b8173", height3d: 8 },
  { id: "jetbridge-v-9", label: "Jetbridge", x: 545, y: 638, width: 22, height: 22, type: "corridor", color: "#c8c0b2", edgeColor: "#8b8173", height3d: 8 },
  { id: "jetbridge-v-10", label: "Jetbridge", x: 665, y: 638, width: 22, height: 22, type: "corridor", color: "#c8c0b2", edgeColor: "#8b8173", height3d: 8 },

  // Gate zone amenities (right side)
  {
    id: "gate-zone-wc",
    label: "Gate Washrooms",
    x: 772, y: 496, width: 44, height: 78,
    type: "facility", color: "#9fc7d3", edgeColor: "#4f8596", height3d: 12,
  },
  {
    id: "vending",
    label: "Vending",
    x: 772, y: 586, width: 44, height: 52,
    type: "shop", color: "#f3b562", edgeColor: "#a96521", height3d: 13,
  },
  {
    id: "water-fountain",
    label: "Water",
    x: 772, y: 648, width: 44, height: 32,
    type: "facility", color: "#9fd3e7", edgeColor: "#4c8ca4", height3d: 10,
  },

  // ── Bottom-right cargo/maintenance building (visible in original image)
  {
    id: "cargo-building",
    label: "Cargo Terminal",
    x: 860, y: 540, width: 120, height: 120,
    type: "landmark", color: "#e8ddd0", edgeColor: "#a89880", height3d: 15,
  },
  {
    id: "cargo-loading",
    label: "Loading Bay",
    x: 868, y: 548, width: 50, height: 48,
    type: "facility", color: "#d4c8b8", edgeColor: "#8b7d6a", height3d: 12,
  },
  {
    id: "cargo-storage",
    label: "Storage",
    x: 926, y: 548, width: 46, height: 48,
    type: "facility", color: "#d4c8b8", edgeColor: "#8b7d6a", height3d: 12,
  },
  {
    id: "cargo-office",
    label: "Office",
    x: 868, y: 604, width: 104, height: 44,
    type: "facility", color: "#ddd4c6", edgeColor: "#8b7d6a", height3d: 11,
  },
];

// ── NODES (BLE beacons) ───────────────────────────────────────────────────────
export const AIRPORT_NODES: SourceNode[] = [
  // Jetbridge spine (VERY long — matching original image)
  { id: "beacon-j-1", label: "BLE Beacon", x: 483, y: -40,  radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-j-2", label: "BLE Beacon", x: 517, y: -40,  radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-j-3", label: "BLE Beacon", x: 483, y: 0,     radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-j-4", label: "BLE Beacon", x: 517, y: 0,     radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-j-5", label: "BLE Beacon", x: 483, y: 40,    radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-j-6", label: "BLE Beacon", x: 517, y: 40,    radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-j-7", label: "BLE Beacon", x: 483, y: 80,    radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-j-8", label: "BLE Beacon", x: 517, y: 80,    radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-j-9", label: "BLE Beacon", x: 483, y: 120,   radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-j-10", label: "BLE Beacon", x: 517, y: 120,  radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-j-11", label: "BLE Beacon", x: 483, y: 160,  radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-j-12", label: "BLE Beacon", x: 517, y: 160,  radius: 5, type: "facility", color: "#2a2880" },

  // Horizontal connector (extended right)
  { id: "beacon-c-1", label: "BLE Beacon", x: 660, y: 76, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-c-2", label: "BLE Beacon", x: 750, y: 76, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-c-3", label: "BLE Beacon", x: 840, y: 76, radius: 5, type: "facility", color: "#2a2880" },

  // Remote gate building (repositioned)
  { id: "beacon-rg-1", label: "BLE Beacon", x: 910, y: 35, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-rg-2", label: "BLE Beacon", x: 960, y: 35, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-rg-3", label: "BLE Beacon", x: 910, y: 85, radius: 5, type: "facility", color: "#2a2880" },

  // Main hall — spread across pentagon interior
  { id: "beacon-main-1",  label: "BLE Beacon", x: 340, y: 290, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-main-2",  label: "BLE Beacon", x: 500, y: 200, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-main-3",  label: "BLE Beacon", x: 660, y: 290, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-main-4",  label: "BLE Beacon", x: 390, y: 375, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-main-5",  label: "BLE Beacon", x: 500, y: 375, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-main-6",  label: "BLE Beacon", x: 610, y: 375, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-main-7",  label: "BLE Beacon", x: 280, y: 440, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-main-8",  label: "BLE Beacon", x: 720, y: 440, radius: 5, type: "facility", color: "#2a2880" },

  // Left wing (extended)
  { id: "beacon-left-1",  label: "BLE Beacon", x: 60,  y: 428, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-left-2",  label: "BLE Beacon", x: 140, y: 428, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-left-3",  label: "BLE Beacon", x: 220, y: 428, radius: 5, type: "facility", color: "#2a2880" },

  // Right wing (extended)
  { id: "beacon-right-1", label: "BLE Beacon", x: 780, y: 428, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-right-2", label: "BLE Beacon", x: 860, y: 428, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-right-3", label: "BLE Beacon", x: 940, y: 428, radius: 5, type: "facility", color: "#2a2880" },

  // Gate zone — row 1
  { id: "beacon-gate-1",  label: "BLE Beacon", x: 226, y: 518, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-gate-2",  label: "BLE Beacon", x: 346, y: 518, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-gate-3",  label: "BLE Beacon", x: 466, y: 518, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-gate-4",  label: "BLE Beacon", x: 586, y: 518, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-gate-5",  label: "BLE Beacon", x: 706, y: 518, radius: 5, type: "facility", color: "#2a2880" },

  // Gate zone — row 2
  { id: "beacon-gate-6",  label: "BLE Beacon", x: 226, y: 610, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-gate-7",  label: "BLE Beacon", x: 346, y: 610, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-gate-8",  label: "BLE Beacon", x: 466, y: 610, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-gate-9",  label: "BLE Beacon", x: 586, y: 610, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-gate-10", label: "BLE Beacon", x: 706, y: 610, radius: 5, type: "facility", color: "#2a2880" },

  // Gate zone — row 3 (new)
  { id: "beacon-gate-11", label: "BLE Beacon", x: 226, y: 688, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-gate-12", label: "BLE Beacon", x: 346, y: 688, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-gate-13", label: "BLE Beacon", x: 466, y: 688, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-gate-14", label: "BLE Beacon", x: 586, y: 688, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-gate-15", label: "BLE Beacon", x: 706, y: 688, radius: 5, type: "facility", color: "#2a2880" },

  // Gate zone corridor between rows
  { id: "beacon-gate-mid-1", label: "BLE Beacon", x: 346, y: 565, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-gate-mid-2", label: "BLE Beacon", x: 466, y: 565, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-gate-mid-3", label: "BLE Beacon", x: 586, y: 565, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-gate-mid-4", label: "BLE Beacon", x: 346, y: 650, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-gate-mid-5", label: "BLE Beacon", x: 466, y: 650, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-gate-mid-6", label: "BLE Beacon", x: 586, y: 650, radius: 5, type: "facility", color: "#2a2880" },

  // Cargo building
  { id: "beacon-cargo-1", label: "BLE Beacon", x: 900, y: 580, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-cargo-2", label: "BLE Beacon", x: 950, y: 620, radius: 5, type: "facility", color: "#2a2880" },
];

export const AIRPORT_PATHS: SourcePath[] = [];

export const ZONE_COLORS: Record<ZoneType, string> = {
  corridor: "#e2e8f0",
  shop: "#f8fafc",
  facility: "#e0f2fe",
  security: "#fee2e2",
  landmark: "#fef3c7",
};

function isPointInPolygon(point: [number, number], vs: [number, number][]) {
  const x = point[0];
  const y = point[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0];
    const yi = vs[i][1];
    const xj = vs[j][0];
    const yj = vs[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export function getZoneAtPosition(x: number, z: number): string {
  const [sx, sy] = worldToSource(x, z);

  for (const zone of AIRPORT_ZONES) {
    const world = rectToWorld(zone);
    const halfW = world.width / 2;
    const halfD = world.depth / 2;
    if (x >= world.x - halfW && x <= world.x + halfW && z >= world.z - halfD && z <= world.z + halfD) {
      return zone.label;
    }
  }

  for (const poly of AIRPORT_POLYGONS) {
    if (isPointInPolygon([sx, sy], poly.points)) {
      return poly.label;
    }
  }

  return "Transit Corridor";
}

export function getFloorHeightAtPosition(x: number, z: number): number {
  const [sx, sy] = worldToSource(x, z);

  for (const zone of AIRPORT_ZONES) {
    const world = rectToWorld(zone);
    const halfW = world.width / 2;
    const halfD = world.depth / 2;
    if (x >= world.x - halfW && x <= world.x + halfW && z >= world.z - halfD && z <= world.z + halfD) {
      return zone.height3d ?? BASE_SLAB_HEIGHT;
    }
  }

  for (const poly of AIRPORT_POLYGONS) {
    if (isPointInPolygon([sx, sy], poly.points)) {
      return poly.height3d ?? BASE_SLAB_HEIGHT;
    }
  }

  return BASE_SLAB_HEIGHT;
}