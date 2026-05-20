import { useState, useEffect, useCallback } from 'react';
import type { Disruption } from '@/types/dashboard';

const DISRUPTION_TEMPLATES = [
  { type: 'blocked' as const, title: 'Corridor Blocked', desc: 'Cleaning crew active at concourse B junction', severity: 'medium' as const },
  { type: 'gate_change' as const, title: 'Gate Reassignment', desc: 'Gate B12 moved to B15 due to maintenance', severity: 'high' as const },
  { type: 'new_facility' as const, title: 'New Shop Detected', desc: 'Retail unit identified near Gate C32', severity: 'low' as const },
  { type: 'sign_mismatch' as const, title: 'Sign Mismatch', desc: 'OCR reading differs from map at waypoint 7', severity: 'medium' as const },
  { type: 'renovation' as const, title: 'Renovation Zone', desc: 'Seating area under construction, path rerouted', severity: 'high' as const },
  { type: 'emergency' as const, title: 'Emergency Alert', desc: 'Medical assistance requested at Gate A24', severity: 'critical' as const },
  { type: 'blocked' as const, title: 'Elevator Out of Service', desc: 'Primary elevator at concourse C non-functional', severity: 'medium' as const },
  { type: 'gate_change' as const, title: 'Flight Delay Impact', desc: 'Passengers for EK202 rerouting to lounge', severity: 'low' as const },
  { type: 'new_facility' as const, title: 'Temporary Seating', desc: 'Additional seating added near Gate A12', severity: 'low' as const },
  { type: 'sign_mismatch' as const, title: 'Direction Inconsistency', desc: 'Passenger backtracking detected at T-junction', severity: 'medium' as const },
];

const LOCATIONS = [
  { name: 'Concourse B Junction', x: 600, y: 400 },
  { name: 'Gate B12', x: 400, y: 200 },
  { name: 'Gate C32', x: 1200, y: 200 },
  { name: 'Waypoint 7', x: 800, y: 400 },
  { name: 'Seating Area C', x: 1000, y: 500 },
  { name: 'Gate A24', x: 300, y: 600 },
  { name: 'Elevator C', x: 1000, y: 300 },
  { name: 'Main Lounge', x: 700, y: 200 },
  { name: 'Gate A12', x: 250, y: 200 },
  { name: 'T-Junction 4', x: 500, y: 600 },
];

function generateId() {
  return `ALERT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

const INITIAL_DISRUPTIONS: Disruption[] = [
  {
    id: 'ALERT-001',
    type: 'blocked',
    title: 'Corridor Blocked',
    description: 'Cleaning crew active at concourse B junction - rerouting active',
    location: 'Concourse B Junction',
    x: 600,
    y: 400,
    severity: 'medium',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    status: 'pending',
    affectedPassengers: 4,
  },
  {
    id: 'ALERT-002',
    type: 'gate_change',
    title: 'Gate Reassignment',
    description: 'Gate B12 moved to B15 due to scheduled maintenance',
    location: 'Gate B12',
    x: 400,
    y: 200,
    severity: 'high',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    status: 'approved',
    affectedPassengers: 12,
  },
  {
    id: 'ALERT-003',
    type: 'new_facility',
    title: 'New Retail Detected',
    description: 'Unmapped retail unit identified near Gate C32 by AI vision',
    location: 'Gate C32',
    x: 1200,
    y: 200,
    severity: 'low',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    status: 'pending',
    affectedPassengers: 0,
  },
  {
    id: 'ALERT-004',
    type: 'sign_mismatch',
    title: 'OCR Sign Mismatch',
    description: 'Camera reading "Gates A1-A10" but map shows "A1-A8"',
    location: 'Waypoint 7',
    x: 800,
    y: 400,
    severity: 'medium',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    status: 'flagged',
    affectedPassengers: 2,
  },
  {
    id: 'ALERT-005',
    type: 'emergency',
    title: 'Medical Assistance',
    description: 'Passenger PSG-1007 requested emergency help near Gate A24',
    location: 'Gate A24',
    x: 300,
    y: 600,
    severity: 'critical',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    status: 'resolved',
    affectedPassengers: 1,
  },
];

export function useDisruptions() {
  const [disruptions, setDisruptions] = useState<Disruption[]>(INITIAL_DISRUPTIONS);

  const addDisruption = useCallback(() => {
    const template = DISRUPTION_TEMPLATES[Math.floor(Math.random() * DISRUPTION_TEMPLATES.length)];
    const location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];
    const disruption: Disruption = {
      id: generateId(),
      type: template.type,
      title: template.title,
      description: template.desc,
      location: location.name,
      x: location.x,
      y: location.y,
      severity: template.severity,
      timestamp: new Date().toISOString(),
      status: 'pending',
      affectedPassengers: Math.floor(Math.random() * 8),
    };
    setDisruptions(prev => [disruption, ...prev].slice(0, 20));
  }, []);

  // Auto-generate disruptions periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() < 0.3) {
        addDisruption();
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [addDisruption]);

  const approveDisruption = useCallback((id: string) => {
    setDisruptions(prev => prev.map(d => d.id === id ? { ...d, status: 'approved' as const } : d));
  }, []);

  const flagDisruption = useCallback((id: string) => {
    setDisruptions(prev => prev.map(d => d.id === id ? { ...d, status: 'flagged' as const } : d));
  }, []);

  const resolveDisruption = useCallback((id: string) => {
    setDisruptions(prev => prev.map(d => d.id === id ? { ...d, status: 'resolved' as const } : d));
  }, []);

  const pendingCount = disruptions.filter(d => d.status === 'pending').length;
  const criticalCount = disruptions.filter(d => d.severity === 'critical' && d.status !== 'resolved').length;

  return {
    disruptions,
    pendingCount,
    criticalCount,
    approveDisruption,
    flagDisruption,
    resolveDisruption,
    addDisruption,
  };
}
