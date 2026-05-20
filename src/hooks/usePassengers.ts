import { useState, useEffect, useRef, useCallback } from 'react';
import type { Passenger } from '@/types/dashboard';

// Terminal path segments that passengers follow
const TERMINAL_PATHS = [
  // Main concourse horizontal
  [{ x: 200, y: 200 }, { x: 1400, y: 200 }],
  // Return corridor
  [{ x: 200, y: 600 }, { x: 1400, y: 600 }],
  // South extension
  [{ x: 1400, y: 600 }, { x: 1400, y: 800 }],
  // B concourse branch
  [{ x: 600, y: 200 }, { x: 600, y: 600 }],
  // C concourse branch
  [{ x: 1000, y: 200 }, { x: 1000, y: 600 }],
  // North entrance to main
  [{ x: 200, y: 200 }, { x: 200, y: 600 }],
  // Diagonal B to main return
  [{ x: 600, y: 400 }, { x: 200, y: 600 }],
  // Diagonal C to main return
  [{ x: 1000, y: 400 }, { x: 1400, y: 600 }],
  // B to C via return
  [{ x: 600, y: 600 }, { x: 1000, y: 600 }],
];

const DESTINATIONS = [
  'Gate A12', 'Gate A24', 'Gate B05', 'Gate B18', 'Gate C32', 'Gate C45',
  'Baggage Claim', 'Security Check', 'Immigration', 'Customs',
  'Restroom', 'Prayer Room', 'Restaurant', 'Coffee Shop',
  'Currency Exchange', 'Information Desk', 'Car Rental', 'Taxi Stand',
];

const FLIGHT_CODES = [
  'EK202', 'QR890', 'LH440', 'BA118', 'AF226', 'TK072',
  'EY302', 'SQ318', 'CX880', 'AA101', 'UA840', 'DL450',
];

function generatePassengers(count: number): Passenger[] {
  return Array.from({ length: count }, (_, i) => {
    const pathIdx = Math.floor(Math.random() * TERMINAL_PATHS.length);
    const path = TERMINAL_PATHS[pathIdx];
    const startNode = path[0];
    const progress = Math.random();
    const speed = 0.0008 + Math.random() * 0.0015;
    const statuses: Passenger['status'][] = ['active', 'active', 'active', 'active', 'idle', 'deviated'];
    const status = Math.random() < 0.7 ? 'active' : statuses[Math.floor(Math.random() * statuses.length)];

    return {
      id: `PSG-${(1000 + i).toString()}`,
      name: `Passenger ${i + 1}`,
      destination: DESTINATIONS[Math.floor(Math.random() * DESTINATIONS.length)],
      status,
      confidence: 75 + Math.random() * 25,
      x: startNode.x,
      y: startNode.y,
      progress,
      pathIndex: pathIdx,
      speed,
      lastUpdate: new Date(Date.now() - Math.random() * 60000).toISOString(),
      flightCode: FLIGHT_CODES[Math.floor(Math.random() * FLIGHT_CODES.length)],
      deviation: Math.random() * 3.5,
    };
  });
}

export function usePassengers(initialCount = 24) {
  const [passengers, setPassengers] = useState<Passenger[]>(() => generatePassengers(initialCount));
  const [selectedPassenger, setSelectedPassenger] = useState<string | null>(null);
  const animationRef = useRef<number | undefined>(undefined);

  const animate = useCallback(() => {
    setPassengers(prev => prev.map(p => {
      const path = TERMINAL_PATHS[p.pathIndex];
      if (!path || p.status === 'completed') return p;

      let newProgress = p.progress + p.speed;
      let newPathIndex = p.pathIndex;

      // Path transition logic
      if (newProgress >= 1) {
        // At end of current path - find connecting path
        const endNode = path[path.length - 1];
        const connectingPaths = TERMINAL_PATHS
          .map((cp, idx) => ({ idx, start: cp[0] }))
          .filter(cp => Math.abs(cp.start.x - endNode.x) < 5 && Math.abs(cp.start.y - endNode.y) < 5);

        if (connectingPaths.length > 0 && Math.random() < 0.7) {
          const next = connectingPaths[Math.floor(Math.random() * connectingPaths.length)];
          newPathIndex = next.idx;
          newProgress = 0;
        } else {
          newProgress = 1;
        }
      }

      const newPath = TERMINAL_PATHS[newPathIndex];
      if (!newPath) return p;

      // Interpolate position along path
      const totalSegments = newPath.length - 1;
      const segmentProgress = newProgress * totalSegments;
      const segmentIdx = Math.min(Math.floor(segmentProgress), totalSegments - 1);
      const localProgress = segmentProgress - segmentIdx;

      const from = newPath[segmentIdx];
      const to = newPath[segmentIdx + 1] || newPath[segmentIdx];

      const x = from.x + (to.x - from.x) * localProgress + (Math.random() - 0.5) * 3;
      const y = from.y + (to.y - from.y) * localProgress + (Math.random() - 0.5) * 3;

      return {
        ...p,
        x,
        y,
        progress: newProgress,
        pathIndex: newPathIndex,
        lastUpdate: new Date().toISOString(),
        deviation: Math.max(0, p.deviation + (Math.random() - 0.5) * 0.1),
      };
    }));
    animationRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [animate]);

  const activeCount = passengers.filter(p => p.status === 'active').length;
  const deviatedCount = passengers.filter(p => p.status === 'deviated').length;
  const emergencyCount = passengers.filter(p => p.status === 'emergency').length;
  const avgDeviation = passengers.reduce((acc, p) => acc + p.deviation, 0) / passengers.length;
  const avgConfidence = passengers.reduce((acc, p) => acc + p.confidence, 0) / passengers.length;

  return {
    passengers,
    selectedPassenger,
    setSelectedPassenger,
    activeCount,
    deviatedCount,
    emergencyCount,
    avgDeviation,
    avgConfidence,
  };
}

export { TERMINAL_PATHS };
