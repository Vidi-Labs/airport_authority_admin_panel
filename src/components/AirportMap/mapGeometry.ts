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
  { id: "main-corridor", label: "Main Corridor", x: 0, z: 0, width: 500, depth: 60, color: "#e2e8f0", type: "corridor" },

  // Gates — left side
  { id: "gate-a1", label: "Gate A1", x: -200, z: -80, width: 60, depth: 80, color: "#dbeafe", type: "gate" },
  { id: "gate-a2", label: "Gate A2", x: -120, z: -80, width: 60, depth: 80, color: "#dbeafe", type: "gate" },
  { id: "gate-b1", label: "Gate B1", x: -40, z: -80, width: 60, depth: 80, color: "#dbeafe", type: "gate" },
  { id: "gate-b2", label: "Gate B2", x: 40, z: -80, width: 60, depth: 80, color: "#dbeafe", type: "gate" },
  { id: "gate-c1", label: "Gate C1", x: 120, z: -80, width: 60, depth: 80, color: "#dbeafe", type: "gate" },
  { id: "gate-c2", label: "Gate C2", x: 200, z: -80, width: 60, depth: 80, color: "#dbeafe", type: "gate" },

  // Shops — along corridor, south side
  { id: "cafe", label: "Sky Cafe", x: -180, z: 60, width: 80, depth: 60, color: "#fef3c7", type: "shop" },
  { id: "duty-free", label: "Duty Free", x: -60, z: 60, width: 100, depth: 60, color: "#fce7f3", type: "shop" },
  { id: "pharmacy", label: "Pharmacy", x: 80, z: 60, width: 60, depth: 60, color: "#d1fae5", type: "shop" },
  { id: "bookstore", label: "Bookstore", x: 180, z: 60, width: 60, depth: 60, color: "#e0e7ff", type: "shop" },

  // Facilities
  { id: "restroom-w", label: "Restrooms West", x: -220, z: 10, width: 40, depth: 40, color: "#e0f2fe", type: "facility" },
  { id: "restroom-e", label: "Restrooms East", x: 220, z: 10, width: 40, depth: 40, color: "#e0f2fe", type: "facility" },
  { id: "security", label: "Security Check", x: -280, z: 0, width: 60, depth: 60, color: "#fee2e2", type: "security" },
  { id: "immigration", label: "Immigration", x: 280, z: 0, width: 60, depth: 60, color: "#fee2e2", type: "security" },
  { id: "elevator", label: "Elevator", x: 0, z: -20, width: 30, depth: 30, color: "#f3e8ff", type: "facility" },
  { id: "info-desk", label: "Info Desk", x: 0, z: 20, width: 40, depth: 30, color: "#ecfdf5", type: "facility" },
];

export const ZONE_COLORS: Record<string, string> = {
  corridor: "#e2e8f0",
  gate: "#dbeafe",
  shop: "#fef3c7",
  facility: "#e0f2fe",
  security: "#fee2e2",
};

export const FLOOR_COLOR = "#f8fafc";
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
