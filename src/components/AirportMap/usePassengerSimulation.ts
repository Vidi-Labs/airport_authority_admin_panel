import { useState, useEffect, useRef } from "react";
import { passengersData, type Passenger } from "./passengerData";
import { sourceToWorld } from "./mapGeometry";
import { getZoneAtPosition } from "./mapGeometry";


const CROWD_COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#f97316", "#8b5cf6", "#ec4899", "#14b8a6", "#f59e0b", "#64748b", "#111827"];
const SIMULATION_INTERVAL_MS = 100;
const SPEED_SCALE = SIMULATION_INTERVAL_MS / 50;
const CROWD_ROUTES_SOURCE: [number, number][][] = [
  [[80, 410], [230, 410], [370, 390], [500, 420], [700, 520], [735, 620]],
  [[930, 410], [760, 410], [620, 388], [500, 420], [330, 520], [245, 620]],
  [[500, 35], [500, 120], [500, 245], [470, 340], [500, 450], [500, 620]],
  [[260, 525], [380, 525], [500, 555], [620, 525], [760, 525]],
  [[275, 430], [355, 405], [455, 365], [560, 365], [690, 430]],
  [[500, 625], [440, 555], [380, 455], [320, 360], [245, 300]],
  [[500, 625], [560, 555], [625, 455], [690, 360], [750, 300]],
];

function makeCrowdPassengers(): Passenger[] {
  return Array.from({ length: 62 }, (_, i) => {
    const route = CROWD_ROUTES_SOURCE[i % CROWD_ROUTES_SOURCE.length].map(([x, y]) => sourceToWorld(x + ((i % 5) - 2) * 7, y + ((Math.floor(i / 5) % 5) - 2) * 5) as [number, number]);
    const id = `PAX-${String(i + 11).padStart(3, "0")}`;
    const status = i % 13 === 0 ? "waiting" : i % 11 === 0 ? "shopping" : "navigating";
    return {
      id,
      name: `Passenger ${i + 11}`,
      age: 18 + (i * 7) % 58,
      nationality: ["UAE", "Indian", "British", "Japanese", "Brazilian", "Kenyan", "Canadian", "German"][i % 8],
      flightNumber: [`EK-${420 + i}`, `QR-${130 + i}`, `BA-${80 + i}`][i % 3],
      destination: ["Dubai", "London", "Tokyo", "Doha", "Toronto", "Mumbai"][i % 6],
      boardingGate: `G${(i % 10) + 1}`,
      boardingTime: `${10 + (i % 5)}:${String((i * 7) % 60).padStart(2, "0")}`,
      status: status as Passenger["status"],
      avatar: "🧑",
      shirtColor: CROWD_COLORS[i % CROWD_COLORS.length],
      journeyStart: "09:00 AM",
      currentZone: "Terminal",
      eta: `${6 + (i % 22)} mins`,
      journeyLog: [],
      pathIndex: 0,
      pathPoints: route,
      purchases: [],
      needsHelp: false,
      language: "English",
      position: route[0],
      trail: [],
      tickCount: 0,
    } satisfies Passenger;
  });
}

function dist(a: [number, number], b: [number, number]): number {
  const dx = a[0] - b[0];
  const dz = a[1] - b[1];
  return Math.sqrt(dx * dx + dz * dz);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function usePassengerSimulation() {
  const [passengers, setPassengers] = useState<Passenger[]>(() =>
    [...passengersData, ...makeCrowdPassengers()].map((p) => {
      const randomOffset = Math.floor(Math.random() * Math.max(1, p.pathPoints.length - 1));
      const startPos = p.pathPoints[randomOffset] || p.pathPoints[0];
      return {
        ...p,
        position: [...startPos] as [number, number],
        pathIndex: randomOffset,
        trail: [],
        tickCount: Math.floor(Math.random() * 20),
      };
    })
  );
  const passengersRef = useRef(passengers);
  passengersRef.current = passengers;

  useEffect(() => {
    const interval = setInterval(() => {
      setPassengers((prev) =>
        prev.map((p) => {
          const baseSpeed = p.id === "PAX-003" ? 0.8 : p.id === "PAX-010" ? 2.0 : p.id > "PAX-010" ? 0.7 + (Number(p.id.slice(4)) % 13) * 0.18 : 1.2 + (Number(p.id.slice(4)) % 5) * 0.25;
          const speed = baseSpeed * SPEED_SCALE;
          const targetIdx = Math.min(p.pathIndex + 1, p.pathPoints.length - 1);
          const target = p.pathPoints[targetIdx];

          if (!target) return p;

          const current: [number, number] = [...p.position];
          const d = dist(current, target);

          let newPos: [number, number];
          let newPathIndex = p.pathIndex;
          let newStatus = p.status;

          if (d < 1.5) {
            // Reached waypoint
            newPathIndex = p.pathIndex + 1;
            if (newPathIndex >= p.pathPoints.length) {
              // Loop back to start instead of stopping
              newPathIndex = 0;
              newPos = [...p.pathPoints[0]] as [number, number];
              newStatus = "navigating";
            } else {
              newPos = [...current];
            }
          } else {
            // Move toward target
            const t = Math.min(speed / d, 1);
            newPos = [
              lerp(current[0], target[0], t) + (Math.random() - 0.5) * 0.3,
              lerp(current[1], target[1], t) + (Math.random() - 0.5) * 0.3,
            ];
          }

          // Update trail every 10 ticks
          const newTick = p.tickCount + 1;
          let newTrail = p.trail;
          if (newTick % 10 === 0) {
            newTrail = [...p.trail, [...newPos]];
            if (newTrail.length > 40) newTrail = newTrail.slice(-40);
          }

          // Update zone
          const newZone = getZoneAtPosition(newPos[0], newPos[1]);

          // Random status flip for shoppers near shops
          if (p.status !== "difficulty" && p.id !== "PAX-004") {
            const nearShop =
              newZone === "Café" || newZone === "Duty Free" || newZone === "Pharmacy" || newZone === "Bookstore" || newZone === "Convenience Store";
            if (nearShop && Math.random() < 0.002) {
              newStatus = "shopping";
            } else if (newStatus === "shopping" && !nearShop && Math.random() < 0.005) {
              newStatus = "navigating";
            }
          }

          return {
            ...p,
            position: newPos,
            pathIndex: newPathIndex,
            status: newStatus,
            currentZone: newZone,
            trail: newTrail,
            tickCount: newTick,
          };
        })
      );
    }, SIMULATION_INTERVAL_MS);

    return () => clearInterval(interval);
  }, []);

  return { passengers };
}
