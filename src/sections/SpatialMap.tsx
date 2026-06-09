import { useRef, useMemo, useEffect, useState, useCallback, memo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { Passenger } from '@/types/dashboard';

// --- Shaders ---
const vertexShader = `
  uniform float time;
  varying float vAlpha;

  void main() {
    vec3 pos = position;
    float t = time * 0.1;
    pos.x += sin(t + position.y * 0.02) * 15.0;
    pos.y += cos(t + position.x * 0.02) * 15.0;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = 12.0 * (1.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    float dist = length(mvPosition.xyz);
    vAlpha = smoothstep(500.0, 100.0, dist);
  }
`;

const fragmentShader = `
  uniform vec3 color;
  uniform float time;
  varying float vAlpha;

  void main() {
    vec2 xy = gl_PointCoord.xy - vec2(0.5);
    float ll = length(xy);
    if (ll > 0.5) discard;
    float glow = 1.0 - (ll * 2.0);
    glow += sin(time * 2.0 + xy.x * 10.0) * 0.1;
    gl_FragColor = vec4(color, glow * vAlpha);
  }
`;

// --- Spotlight Effect ---
function SpotlightPlane() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport, pointer } = useThree();

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.set(
        (pointer.x * viewport.width) / 2,
        (pointer.y * viewport.height) / 2,
        0.1
      );
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[400, 400]} />
      <meshBasicMaterial
        color="#3b82f6"
        transparent
        opacity={0.04}
        depthWrite={false}
      >
        {/* Radial gradient via canvas texture would be ideal, using simple approach */}
      </meshBasicMaterial>
    </mesh>
  );
}

// --- Passenger Particles ---
interface ParticleSystemProps {
  passengers: Passenger[];
  highlightedFilter: string | null;
}

function ParticleSystem({ passengers, highlightedFilter }: ParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    time: { value: 0 },
    color: { value: new THREE.Color('#2563eb') },
  }), []);

  const { geometry } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(passengers.length * 3);
    const cols = new Float32Array(passengers.length * 3);

    passengers.forEach((p, i) => {
      positions[i * 3] = p.x - 800;
      positions[i * 3 + 1] = -(p.y - 500);
      positions[i * 3 + 2] = 0;

      // Color based on status
      let c = new THREE.Color('#2563eb'); // blue active
      if (p.status === 'deviated') c = new THREE.Color('#d97706'); // amber
      else if (p.status === 'emergency') c = new THREE.Color('#dc2626'); // red
      else if (p.status === 'idle') c = new THREE.Color('#059669'); // green
      else if (p.status === 'completed') c = new THREE.Color('#64748b'); // slate

      cols[i * 3] = c.r;
      cols[i * 3 + 1] = c.g;
      cols[i * 3 + 2] = c.b;
    });

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    return { geometry: geo, colors: cols };
  }, [passengers.length]);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }

    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      const colorAttr = pointsRef.current.geometry.attributes.color.array as Float32Array;

      passengers.forEach((p, i) => {
        const targetX = p.x - 800;
        const targetY = -(p.y - 500);

        // Smooth interpolation
        positions[i * 3] += (targetX - positions[i * 3]) * 0.08;
        positions[i * 3 + 1] += (targetY - positions[i * 3 + 1]) * 0.08;

        // Update color based on status and filter
        let c = new THREE.Color('#2563eb');
        if (p.status === 'deviated') c = new THREE.Color('#d97706');
        else if (p.status === 'emergency') c = new THREE.Color('#dc2626');
        else if (p.status === 'idle') c = new THREE.Color('#059669');
        else if (p.status === 'completed') c = new THREE.Color('#64748b');

        // Apply filter dimming
        if (highlightedFilter) {
          const matchesFilter =
            (highlightedFilter === 'blocked' && p.status === 'deviated') ||
            (highlightedFilter === 'active' && p.status === 'active') ||
            (highlightedFilter === 'emergency' && p.status === 'emergency');
          if (!matchesFilter) {
            c.lerp(new THREE.Color('#e2e8f0'), 0.85);
          }
        }

        colorAttr[i * 3] = c.r;
        colorAttr[i * 3 + 1] = c.g;
        colorAttr[i * 3 + 2] = c.b;
      });

      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      pointsRef.current.geometry.attributes.color.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// --- SVG Terminal Overlay ---
function TerminalSVG() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="neon-glow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="wall-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(59,130,246,0.4)" />
          <stop offset="50%" stopColor="rgba(30,41,59,0.15)" />
          <stop offset="100%" stopColor="rgba(59,130,246,0.4)" />
        </linearGradient>
      </defs>

      {/* Gate labels */}
      <g opacity="0.7">
        <text x="180" y="180" fill="#3b82f6" fontSize="14" fontFamily="JetBrains Mono">GATE A1-A10</text>
        <text x="580" y="180" fill="#3b82f6" fontSize="14" fontFamily="JetBrains Mono">GATE B1-B15</text>
        <text x="980" y="180" fill="#3b82f6" fontSize="14" fontFamily="JetBrains Mono">GATE C1-C32</text>
        <text x="1420" y="180" fill="#3b82f6" fontSize="14" fontFamily="JetBrains Mono">GATE D1-D8</text>
        <text x="180" y="640" fill="#d97706" fontSize="12" fontFamily="JetBrains Mono">SECURITY</text>
        <text x="580" y="640" fill="#059669" fontSize="12" fontFamily="JetBrains Mono">BAGGAGE</text>
        <text x="980" y="640" fill="#059669" fontSize="12" fontFamily="JetBrains Mono">IMMIGRATION</text>
        <text x="1420" y="820" fill="#d97706" fontSize="12" fontFamily="JetBrains Mono">EMERGENCY EXIT</text>
      </g>

      {/* Main terminal walls */}
      <g stroke="url(#wall-gradient)" strokeWidth="3" fill="none" filter="url(#neon-glow)" strokeLinecap="round" opacity="0.8">
        {/* Main concourse horizontal */}
        <path d="M 200,200 L 1400,200" />
        {/* Return corridor */}
        <path d="M 200,600 L 1400,600" />
        {/* B concourse vertical */}
        <path d="M 600,200 L 600,600" />
        {/* C concourse vertical */}
        <path d="M 1000,200 L 1000,600" />
        {/* South extension */}
        <path d="M 1400,600 L 1400,800" />
        {/* North wall segments */}
        <path d="M 200,200 L 200,600" />
        {/* C branch return */}
        <path d="M 1000,600 L 1000,800" opacity="0.4" />
        {/* B branch return */}
        <path d="M 600,600 L 600,800" opacity="0.4" />
        {/* Diagonal connector B */}
        <path d="M 600,400 L 200,600" opacity="0.3" strokeDasharray="8,4" />
        {/* Diagonal connector C */}
        <path d="M 1000,400 L 1400,600" opacity="0.3" strokeDasharray="8,4" />
        {/* Mid corridor */}
        <path d="M 200,400 L 600,400" opacity="0.4" />
        <path d="M 1000,400 L 1400,400" opacity="0.4" />
      </g>

      {/* Nodes */}
      <g>
        <circle cx="200" cy="200" r="5" fill="#2563eb" opacity="0.7" />
        <circle cx="600" cy="200" r="5" fill="#2563eb" opacity="0.7" />
        <circle cx="600" cy="400" r="5" fill="#d97706" opacity="0.8" />
        <circle cx="600" cy="600" r="5" fill="#2563eb" opacity="0.7" />
        <circle cx="1000" cy="200" r="5" fill="#2563eb" opacity="0.7" />
        <circle cx="1000" cy="400" r="5" fill="#2563eb" opacity="0.7" />
        <circle cx="1000" cy="600" r="5" fill="#2563eb" opacity="0.7" />
        <circle cx="1400" cy="200" r="5" fill="#2563eb" opacity="0.7" />
        <circle cx="1400" cy="600" r="5" fill="#2563eb" opacity="0.7" />
        <circle cx="1400" cy="800" r="5" fill="#dc2626" opacity="0.8" />
        <circle cx="200" cy="600" r="5" fill="#2563eb" opacity="0.7" />
        <circle cx="200" cy="400" r="5" fill="#2563eb" opacity="0.5" />
        <circle cx="1400" cy="400" r="5" fill="#2563eb" opacity="0.5" />
      </g>

      {/* Blocked area indicator */}
      <g opacity="0.6">
        <rect x="550" y="370" width="100" height="60" fill="none" stroke="#fde68a" strokeWidth="1" strokeDasharray="4,2" />
        <text x="560" y="435" fill="#d97706" fontSize="10" fontFamily="JetBrains Mono">BLOCKED</text>
      </g>

      {/* Gate markers */}
      {Array.from({ length: 8 }, (_, i) => (
        <g key={`a-${i}`} opacity="0.4">
          <rect x={240 + i * 45} y="210" width="30" height="8" rx="2" fill="none" stroke="#3b82f6" strokeWidth="0.5" />
          <text x={245 + i * 45} y="217" fill="#3b82f6" fontSize="6" fontFamily="JetBrains Mono">A{i + 1}</text>
        </g>
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <g key={`b-${i}`} opacity="0.4">
          <rect x={640 + i * 45} y="210" width="30" height="8" rx="2" fill="none" stroke="#3b82f6" strokeWidth="0.5" />
          <text x={645 + i * 45} y="217" fill="#3b82f6" fontSize="6" fontFamily="JetBrains Mono">B{i + 1}</text>
        </g>
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <g key={`c-${i}`} opacity="0.4">
          <rect x={1040 + i * 45} y="210" width="30" height="8" rx="2" fill="none" stroke="#3b82f6" strokeWidth="0.5" />
          <text x={1045 + i * 45} y="217" fill="#3b82f6" fontSize="6" fontFamily="JetBrains Mono">C{i + 1}</text>
        </g>
      ))}
    </svg>
  );
}

// --- Heatmap Canvas Overlay ---
interface HeatmapOverlayProps {
  passengers: Passenger[];
  visible: boolean;
}

function HeatmapOverlay({ passengers, visible }: HeatmapOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!visible || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      passengers.forEach((p) => {
        const x = p.x;
        const y = p.y;
        const radius = 80;

        const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
        grad.addColorStop(0, 'rgba(239, 68, 68, 0.5)');
        grad.addColorStop(0.3, 'rgba(245, 158, 11, 0.35)');
        grad.addColorStop(0.6, 'rgba(59, 130, 246, 0.15)');
        grad.addColorStop(1, 'rgba(59, 130, 246, 0)');

        ctx.fillStyle = grad;
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      });

      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(248, 250, 252, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => cancelAnimationFrame(animId);
  }, [visible, passengers]);

  if (!visible) return null;

  return (
    <canvas
      ref={canvasRef}
      width={1600}
      height={1000}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 5 }}
    />
  );
}

// --- Main Spatial Map Component ---
interface SpatialMapProps {
  passengers: Passenger[];
  highlightedFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}

const SpatialMap = memo(function SpatialMap({ passengers, highlightedFilter, onFilterChange }: SpatialMapProps) {
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showSigns, setShowSigns] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  return (
    <div className="relative w-full h-full" ref={containerRef} onMouseMove={handleMouseMove}>
      {/* CSS Floor Pattern Background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: '#f8fafc',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E"), linear-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.04) 1px, transparent 1px)`,
          backgroundSize: '200px 200px, 40px 40px, 40px 40px',
        }}
      />

      {/* SVG Terminal Walls */}
      <TerminalSVG />

      {/* Mouse spotlight */}
      <div
        className="absolute pointer-events-none transition-all duration-100"
        style={{
          left: mousePos.x - 200,
          top: mousePos.y - 200,
          width: 400,
          height: 400,
          background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
          zIndex: 3,
        }}
      />

      {/* Three.js Canvas */}
      <div className="absolute inset-0" style={{ zIndex: 4 }}>
        <Canvas
          orthographic
          camera={{ zoom: 0.8, position: [0, 0, 500], near: 0.1, far: 2000 }}
          style={{ background: 'transparent' }}
          gl={{ alpha: true, antialias: true }}
        >
          <ParticleSystem passengers={passengers} highlightedFilter={highlightedFilter} />
          <SpotlightPlane />
        </Canvas>
      </div>

      {/* Heatmap overlay */}
      <HeatmapOverlay passengers={passengers} visible={showHeatmap} />

      {/* Map Controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-2" style={{ zIndex: 10 }}>
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
            showHeatmap
              ? 'bg-blue-100 text-blue-600 border border-blue-400'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
          }`}
        >
          Heatmap
        </button>
        <button
          onClick={() => setShowSigns(!showSigns)}
          className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
            showSigns
              ? 'bg-blue-100 text-blue-600 border border-blue-400'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
          }`}
        >
          Signs
        </button>
        <button
          onClick={() => onFilterChange(highlightedFilter === 'active' ? null : 'active')}
          className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
            highlightedFilter === 'active'
              ? 'bg-emerald-100 text-emerald-600 border border-emerald-400'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300'
          }`}
        >
          Active Only
        </button>
        <button
          onClick={() => onFilterChange(highlightedFilter === 'blocked' ? null : 'blocked')}
          className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
            highlightedFilter === 'blocked'
              ? 'bg-amber-100 text-amber-600 border border-amber-400'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-amber-300'
          }`}
        >
          Deviated
        </button>
      </div>

      {/* Passenger count badge */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded bg-white/90 border border-slate-200" style={{ zIndex: 10 }}>
        <div className="status-dot status-dot-info" />
        <span className="text-xs font-mono text-slate-500">{passengers.length} TRACKED</span>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 right-3 flex items-center gap-4 px-3 py-1.5 rounded bg-white/90 border border-slate-200" style={{ zIndex: 10 }}>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-[10px] font-mono text-slate-500">Active</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-[10px] font-mono text-slate-500">Deviated</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-[10px] font-mono text-slate-500">Emergency</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-mono text-slate-500">Idle</span>
        </div>
      </div>
    </div>
  );
});

export default SpatialMap;
