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
      [165, 470], // bottom-left
      [835, 470], // bottom-right
      [855, 305], // right shoulder (wider)
      [500, 108], // top tip
      [145, 305], // left shoulder (wider)
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
    x: 440, y: -300, width: 120, height: 550,
    type: "corridor", color: "#cfd8dc", edgeColor: "#6f8794", height3d: 10,
  },

  // ── Horizontal glass bridge to remote gate — branches off spine, very long
  {
    id: "jetbridge-horizontal-connector",
    label: "Glass Bridge",
    x: 560, y: -140, width: 370, height: 42,
    type: "corridor", color: "#cfe5ee", edgeColor: "#668797", height3d: 10,
  },

  // ── Remote gate building (top-right) — large rectangular block
  {
    id: "remote-gate-building",
    label: "Remote Gate Building",
    x: 890, y: -160, width: 100, height: 100,
    type: "landmark", color: "#e2ddd2", edgeColor: "#83786b", height3d: 17,
  },

  // ── Remote gate building internal gates
  {
    id: "remote-gate-rg1", label: "RG1",
    x: 896, y: -184, width: 40, height: 40,
    type: "landmark", color: "#e8e4d8", edgeColor: "#7e9070", height3d: 14,
  },
  {
    id: "remote-gate-rg2", label: "RG2",
    x: 944, y: -184, width: 40, height: 40,
    type: "landmark", color: "#e8e4d8", edgeColor: "#7e9070", height3d: 14,
  },
  {
    id: "remote-gate-rg3", label: "RG3",
    x: 896, y: -138, width: 40, height: 40,
    type: "landmark", color: "#e8e4d8", edgeColor: "#7e9070", height3d: 14,
  },
  {
    id: "remote-gate-rg4", label: "RG4",
    x: 944, y: -138, width: 40, height: 40,
    type: "landmark", color: "#e8e4d8", edgeColor: "#7e9070", height3d: 14,
  },
  {
    id: "remote-gate-wc", label: "WC",
    x: 896, y: -138, width: 30, height: 30,
    type: "facility", color: "#9fc7d3", edgeColor: "#4f8596", height3d: 10,
  },
  {
    id: "remote-gate-cafe", label: "Café",
    x: 940, y: -138, width: 44, height: 30,
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
    x: -300, y: 385, width: 580, height: 88,
    type: "corridor", color: "#d4cec1", edgeColor: "#8b8173", height3d: 12,
  },
  {
    id: "left-wing-exit",
    label: "West Exit",
    x: -300, y: 365, width: 72, height: 128,
    type: "facility", color: "#c8c0b2", edgeColor: "#8b8173", height3d: 13,
  },
  {
    id: "left-wing-cafe",
    label: "Café Kiosk",
    x: -220, y: 392, width: 78, height: 46,
    type: "shop", color: "#b98357", edgeColor: "#7b4f30", height3d: 11,
  },
  {
    id: "left-wing-wc",
    label: "WC",
    x: -130, y: 392, width: 48, height: 46,
    type: "facility", color: "#9fc7d3", edgeColor: "#4f8596", height3d: 10,
  },

  // ── Right wing corridor (east) — extended much wider
  {
    id: "right-wing-corridor",
    label: "East Wing Corridor",
    x: 720, y: 385, width: 580, height: 88,
    type: "corridor", color: "#d4cec1", edgeColor: "#8b8173", height3d: 12,
  },
  {
    id: "right-wing-exit",
    label: "East Exit",
    x: 1228, y: 365, width: 72, height: 128,
    type: "facility", color: "#c8c0b2", edgeColor: "#8b8173", height3d: 13,
  },
  {
    id: "right-wing-cafe",
    label: "Café Kiosk",
    x: 1000, y: 392, width: 78, height: 46,
    type: "shop", color: "#b98357", edgeColor: "#7b4f30", height3d: 11,
  },
  {
    id: "right-wing-wc",
    label: "WC",
    x: 1100, y: 392, width: 48, height: 46,
    type: "facility", color: "#9fc7d3", edgeColor: "#4f8596", height3d: 10,
  },

  // ── Left wing gates (G1-G4) — G1-G3 vertical bars, G4 perpendicular at wing tip
  { id: "gate-1", label: "G1", x: 20, y: 340, width: 18, height: 70, type: "landmark", color: "#e1ddcf", edgeColor: "#7e9070", height3d: 14 },
  { id: "gate-2", label: "G2", x: -80, y: 340, width: 18, height: 70, type: "landmark", color: "#e1ddcf", edgeColor: "#7e9070", height3d: 14 },
  { id: "gate-3", label: "G3", x: -180, y: 340, width: 18, height: 70, type: "landmark", color: "#e1ddcf", edgeColor: "#7e9070", height3d: 14 },
  { id: "gate-4", label: "G4", x: -360, y: 410, width: 70, height: 18, type: "landmark", color: "#e1ddcf", edgeColor: "#7e9070", height3d: 14 },

  // ── Right wing gates (G5-G9) — G5-G7 vertical bars, G8-G9 perpendicular at wing tip
  { id: "gate-5", label: "G5", x: 1000, y: 340, width: 18, height: 70, type: "landmark", color: "#e1ddcf", edgeColor: "#7e9070", height3d: 14 },
  { id: "gate-6", label: "G6", x: 1090, y: 340, width: 18, height: 70, type: "landmark", color: "#e1ddcf", edgeColor: "#7e9070", height3d: 14 },
  { id: "gate-7", label: "G7", x: 1180, y: 340, width: 18, height: 70, type: "landmark", color: "#e1ddcf", edgeColor: "#7e9070", height3d: 14 },
  { id: "gate-8", label: "G8", x: 1270, y: 390, width: 70, height: 18, type: "landmark", color: "#e1ddcf", edgeColor: "#7e9070", height3d: 14 },
  { id: "gate-9", label: "G9", x: 1270, y: 450, width: 70, height: 18, type: "landmark", color: "#e1ddcf", edgeColor: "#7e9070", height3d: 14 },

  // ── Spine gates (G10-G12) — near top junction
  { id: "gate-10", label: "G10", x: 550, y: 50, width: 70, height: 18, type: "landmark", color: "#e1ddcf", edgeColor: "#7e9070", height3d: 14 },
  { id: "gate-11", label: "G11", x: 380, y: 50, width: 70, height: 18, type: "landmark", color: "#e1ddcf", edgeColor: "#7e9070", height3d: 14 },
  { id: "gate-12", label: "G12", x: 550, y: -20, width: 70, height: 8, type: "landmark", color: "#e1ddcf", edgeColor: "#7e9070", height3d: 14 },

  // ── Gate zone (wide green rectangle — base of home icon) — taller with more gates
  {
    id: "gate-zone",
    label: "Departure Gate Zone",
    x: 165, y: 470, width: 670, height: 230,
    type: "corridor", color: "#b8d3ab", edgeColor: "#5f8a53", height3d: 9,
  },

  // Baggage reclaim belts — 14 vertical rectangular belts
  { id: "belt-1",  label: "Belt 1",  x: 180, y: 510, width: 20, height: 120, type: "facility", color: "#e0b36a", edgeColor: "#9a6e2f", height3d: 10 },
  { id: "belt-2",  label: "Belt 2",  x: 224, y: 510, width: 20, height: 120, type: "facility", color: "#e0b36a", edgeColor: "#9a6e2f", height3d: 10 },
  { id: "belt-3",  label: "Belt 3",  x: 268, y: 510, width: 20, height: 120, type: "facility", color: "#e0b36a", edgeColor: "#9a6e2f", height3d: 10 },
  { id: "belt-4",  label: "Belt 4",  x: 312, y: 510, width: 20, height: 120, type: "facility", color: "#e0b36a", edgeColor: "#9a6e2f", height3d: 10 },
  { id: "belt-5",  label: "Belt 5",  x: 356, y: 510, width: 20, height: 120, type: "facility", color: "#e0b36a", edgeColor: "#9a6e2f", height3d: 10 },
  { id: "belt-6",  label: "Belt 6",  x: 400, y: 510, width: 20, height: 120, type: "facility", color: "#e0b36a", edgeColor: "#9a6e2f", height3d: 10 },
  { id: "belt-7",  label: "Belt 7",  x: 444, y: 510, width: 20, height: 120, type: "facility", color: "#e0b36a", edgeColor: "#9a6e2f", height3d: 10 },
  { id: "belt-8",  label: "Belt 8",  x: 520, y: 510, width: 20, height: 120, type: "facility", color: "#e0b36a", edgeColor: "#9a6e2f", height3d: 10 },
  { id: "belt-9",  label: "Belt 9",  x: 564, y: 510, width: 20, height: 120, type: "facility", color: "#e0b36a", edgeColor: "#9a6e2f", height3d: 10 },
  { id: "belt-10", label: "Belt 10", x: 608, y: 510, width: 20, height: 120, type: "facility", color: "#e0b36a", edgeColor: "#9a6e2f", height3d: 10 },
  { id: "belt-11", label: "Belt 11", x: 652, y: 510, width: 20, height: 120, type: "facility", color: "#e0b36a", edgeColor: "#9a6e2f", height3d: 10 },
  { id: "belt-12", label: "Belt 12", x: 696, y: 510, width: 20, height: 120, type: "facility", color: "#e0b36a", edgeColor: "#9a6e2f", height3d: 10 },
  { id: "belt-13", label: "Belt 13", x: 740, y: 510, width: 20, height: 120, type: "facility", color: "#e0b36a", edgeColor: "#9a6e2f", height3d: 10 },
  { id: "belt-14", label: "Belt 14", x: 784, y: 510, width: 20, height: 120, type: "facility", color: "#e0b36a", edgeColor: "#9a6e2f", height3d: 10 },

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
  { id: "beacon-c-1", label: "BLE Beacon", x: 660, y: -119, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-c-2", label: "BLE Beacon", x: 750, y: -119, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-c-3", label: "BLE Beacon", x: 840, y: -119, radius: 5, type: "facility", color: "#2a2880" },

  // Remote gate building (repositioned)
  { id: "beacon-rg-1", label: "BLE Beacon", x: 910, y: -155, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-rg-2", label: "BLE Beacon", x: 960, y: -155, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-rg-3", label: "BLE Beacon", x: 910, y: -105, radius: 5, type: "facility", color: "#2a2880" },

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
  { id: "beacon-left-1",  label: "BLE Beacon", x: -240,  y: 428, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-left-2",  label: "BLE Beacon", x: -140, y: 428, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-left-3",  label: "BLE Beacon", x: -40, y: 428, radius: 5, type: "facility", color: "#2a2880" },

  // Right wing (extended)
  { id: "beacon-right-1", label: "BLE Beacon", x: 960, y: 428, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-right-2", label: "BLE Beacon", x: 1060, y: 428, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-right-3", label: "BLE Beacon", x: 1160, y: 428, radius: 5, type: "facility", color: "#2a2880" },

  // Baggage reclaim belts
  { id: "beacon-belt-1",  label: "BLE Beacon", x: 194, y: 575, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-belt-2",  label: "BLE Beacon", x: 242, y: 575, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-belt-3",  label: "BLE Beacon", x: 291, y: 575, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-belt-4",  label: "BLE Beacon", x: 339, y: 575, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-belt-5",  label: "BLE Beacon", x: 388, y: 575, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-belt-6",  label: "BLE Beacon", x: 436, y: 575, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-belt-7",  label: "BLE Beacon", x: 485, y: 575, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-belt-8",  label: "BLE Beacon", x: 533, y: 575, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-belt-9",  label: "BLE Beacon", x: 582, y: 575, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-belt-10", label: "BLE Beacon", x: 630, y: 575, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-belt-11", label: "BLE Beacon", x: 679, y: 575, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-belt-12", label: "BLE Beacon", x: 727, y: 575, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-belt-13", label: "BLE Beacon", x: 776, y: 575, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-belt-14", label: "BLE Beacon", x: 824, y: 575, radius: 5, type: "facility", color: "#2a2880" },

  // Wing gates — left wing (G1 near terminal, G4 far left)
  { id: "beacon-gate-1", label: "BLE Beacon", x: -40, y: 375, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-gate-2", label: "BLE Beacon", x: -110, y: 375, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-gate-3", label: "BLE Beacon", x: -180, y: 375, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-gate-4", label: "BLE Beacon", x: -310, y: 384, radius: 5, type: "facility", color: "#2a2880" },
  // Wing gates — right wing (G8,G9 near terminal, G5-G7 further right)
  { id: "beacon-gate-8", label: "BLE Beacon", x: 1265, y: 349, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-gate-9", label: "BLE Beacon", x: 1265, y: 399, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-gate-5", label: "BLE Beacon", x: 920, y: 375, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-gate-6", label: "BLE Beacon", x: 990, y: 375, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-gate-7", label: "BLE Beacon", x: 1060, y: 375, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-gate-10", label: "BLE Beacon", x: 460, y: 210, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-gate-11", label: "BLE Beacon", x: 500, y: 210, radius: 5, type: "facility", color: "#2a2880" },
  { id: "beacon-gate-12", label: "BLE Beacon", x: 540, y: 210, radius: 5, type: "facility", color: "#2a2880" },

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