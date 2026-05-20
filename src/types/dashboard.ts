export interface Passenger {
  id: string;
  name: string;
  destination: string;
  status: 'active' | 'idle' | 'deviated' | 'emergency' | 'completed';
  confidence: number;
  x: number;
  y: number;
  progress: number;
  pathIndex: number;
  speed: number;
  lastUpdate: string;
  flightCode: string;
  deviation: number;
}

export interface Disruption {
  id: string;
  type: 'blocked' | 'gate_change' | 'new_facility' | 'sign_mismatch' | 'renovation' | 'emergency';
  title: string;
  description: string;
  location: string;
  x: number;
  y: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  status: 'pending' | 'approved' | 'flagged' | 'resolved';
  affectedPassengers: number;
}

export interface TelemetryMetric {
  id: string;
  label: string;
  value: string;
  delta: string;
  status: 'ok' | 'warn' | 'err' | 'info';
  icon: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  module: string;
  message: string;
}

export interface HeatmapPoint {
  x: number;
  y: number;
  intensity: number;
  radius: number;
}

export interface TerminalNode {
  id: string;
  label: string;
  x: number;
  y: number;
  type: 'gate' | 'facility' | 'checkpoint' | 'entrance' | 'intersection';
  status: 'open' | 'closed' | 'congested';
}
