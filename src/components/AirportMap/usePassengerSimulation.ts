import { useState, useEffect, useRef } from "react";
import { passengersData, type Passenger } from "./passengerData";
import { getZoneAtPosition } from "./mapGeometry";

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
    passengersData.map((p) => ({
      ...p,
      position: [...p.pathPoints[0]] as [number, number],
      trail: [],
      tickCount: 0,
    }))
  );
  const passengersRef = useRef(passengers);
  passengersRef.current = passengers;

  useEffect(() => {
    const interval = setInterval(() => {
      setPassengers((prev) =>
        prev.map((p) => {
          const speed = p.id === "PAX-003" ? 0.8 : p.id === "PAX-010" ? 2.0 : 1.5;
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
              newZone === "Sky Cafe" || newZone === "Duty Free" || newZone === "Pharmacy" || newZone === "Bookstore";
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
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return { passengers };
}
