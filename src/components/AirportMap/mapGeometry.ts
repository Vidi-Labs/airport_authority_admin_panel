export type ZoneDef = {
  id: string;
  label: string;
  x: number;
  z: number;
  width: number;
  depth: number;
  color: string;
  type: "corridor" | "gate" | "shop" | "facility" | "security";
};

export const TERMINAL_ZONES: ZoneDef[] = [
  // Main corridor — long horizontal spine
  { id: "main-corridor", label: "Main Corridor", x: 0, z: 0, width: 500, depth: 60, color: "#1a1f35", type: "corridor" },

  // Gates — left side
  { id: "gate-a1", label: "Gate A1", x: -200, z: -80, width: 60, depth: 80, color: "#0f1628", type: "gate" },
  { id: "gate-a2", label: "Gate A2", x: -120, z: -80, width: 60, depth: 80, color: "#0f1628", type: "gate" },
  { id: "gate-b1", label: "Gate B1", x: -40, z: -80, width: 60, depth: 80, color: "#0f1628", type: "gate" },
  { id: "gate-b2", label: "Gate B2", x: 40, z: -80, width: 60, depth: 80, color: "#0f1628", type: "gate" },
  { id: "gate-c1", label: "Gate C1", x: 120, z: -80, width: 60, depth: 80, color: "#0f1628", type: "gate" },
  { id: "gate-c2", label: "Gate C2", x: 200, z: -80, width: 60, depth: 80, color: "#0f1628", type: "gate" },

  // Shops — along corridor, south side
  { id: "cafe", label: "Sky Cafe", x: -180, z: 60, width: 80, depth: 60, color: "#1a1228", type: "shop" },
  { id: "duty-free", label: "Duty Free", x: -60, z: 60, width: 100, depth: 60, color: "#121a28", type: "shop" },
  { id: "pharmacy", label: "Pharmacy", x: 80, z: 60, width: 60, depth: 60, color: "#12281a", type: "shop" },
  { id: "bookstore", label: "Bookstore", x: 180, z: 60, width: 60, depth: 60, color: "#1a2812", type: "shop" },

  // Facilities
  { id: "restroom-w", label: "Restrooms West", x: -220, z: 10, width: 40, depth: 40, color: "#0d1f3c", type: "facility" },
  { id: "restroom-e", label: "Restrooms East", x: 220, z: 10, width: 40, depth: 40, color: "#0d1f3c", type: "facility" },
  { id: "security", label: "Security Check", x: -280, z: 0, width: 60, depth: 60, color: "#3c0d0d", type: "security" },
  { id: "immigration", label: "Immigration", x: 280, z: 0, width: 60, depth: 60, color: "#3c0d0d", type: "security" },
  { id: "elevator", label: "Elevator", x: 0, z: -20, width: 30, depth: 30, color: "#1a1a3c", type: "facility" },
  { id: "info-desk", label: "Info Desk", x: 0, z: 20, width: 40, depth: 30, color: "#1a2a1a", type: "facility" },
];

export const ZONE_COLORS: Record<string, string> = {
  corridor: "#1a1f35",
  gate: "#0f1628",
  shop: "#1a1228",
  facility: "#0d1f3c",
  security: "#3c0d0d",
};

export const FLOOR_COLOR = "#0a0e1a";
export const WALL_HEIGHT = 8;
export const FLOOR_THICKNESS = 1;

export function getZoneAtPosition(x: number, z: number): string {
  for (const zone of TERMINAL_ZONES) {
    const halfW = zone.width / 2;
    const halfD = zone.depth / 2;
    if (x >= zone.x - halfW && x <= zone.x + halfW && z >= zone.z - halfD && z <= zone.z + halfD) {
      return zone.label;
    }
  }
  return "Transit Area";
}
