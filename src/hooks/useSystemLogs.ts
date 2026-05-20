import { useState, useEffect } from 'react';
import type { SystemLog } from '@/types/dashboard';

const LOG_MESSAGES = [
  { module: 'NAV', message: 'Path recalculated for PSG-1042 - avoiding blocked node', level: 'info' as const },
  { module: 'OCR', message: 'Sign recognized: "Gates A1-A10" at waypoint 7', level: 'info' as const },
  { module: 'LOC', message: 'Particle filter updated - accuracy 1.2m deviation', level: 'info' as const },
  { module: 'ML', message: 'Environment comparison: 3 new objects detected', level: 'warn' as const },
  { module: 'REROUTE', message: 'Active rerouting triggered for concourse B', level: 'warn' as const },
  { module: 'OCR', message: 'Low confidence reading on sign "B15" - retrying', level: 'warn' as const },
  { module: 'NAV', message: 'Passenger PSG-1018 reached destination Gate C32', level: 'info' as const },
  { module: 'LOC', message: 'WiFi fingerprint matched - position confirmed', level: 'info' as const },
  { module: 'ML', message: 'Seating area deviation exceeds threshold at node 12', level: 'warn' as const },
  { module: 'NAV', message: 'New session started: PSG-1056 heading to Baggage Claim', level: 'info' as const },
  { module: 'OCR', message: 'Direction arrow detected: 45-degree right turn', level: 'info' as const },
  { module: 'EMRG', message: 'Emergency button pressed by PSG-1007', level: 'error' as const },
  { module: 'REROUTE', message: 'Corridor B-C junction cleared - restoring path', level: 'info' as const },
  { module: 'ML', message: 'Map integrity check passed - 0 critical mismatches', level: 'info' as const },
  { module: 'LOC', message: 'BLE beacon B-12 signal strength low', level: 'warn' as const },
  { module: 'NAV', message: 'Voice instruction sent: "Turn right at the next corridor"', level: 'info' as const },
  { module: 'OCR', message: 'Gate number "C45" recognized with 98% confidence', level: 'info' as const },
  { module: 'ML', message: 'Heatmap peak detected at concourse C entrance', level: 'warn' as const },
];

function generateId() {
  return `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

const INITIAL_LOGS: SystemLog[] = Array.from({ length: 10 }, (_, i) => {
  const tmpl = LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)];
  return {
    id: `LOG-${1000 + i}`,
    timestamp: new Date(Date.now() - (10 - i) * 30000).toISOString(),
    level: tmpl.level,
    module: tmpl.module,
    message: tmpl.message,
  };
});

export function useSystemLogs() {
  const [logs, setLogs] = useState<SystemLog[]>(INITIAL_LOGS);

  useEffect(() => {
    const interval = setInterval(() => {
      const tmpl = LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)];
      const newLog: SystemLog = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        level: tmpl.level,
        module: tmpl.module,
        message: tmpl.message,
      };
      setLogs(prev => [newLog, ...prev].slice(0, 50));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return logs;
}
