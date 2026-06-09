import { lazy, Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import TelemetryRibbon from '@/sections/TelemetryRibbon';
import MapLoadingShimmer from '@/components/MapLoadingShimmer';
import LivePassengerMonitor from '@/sections/LivePassengerMonitor';
import DisruptionControl from '@/sections/DisruptionControl';
import IntelligenceFooter from '@/sections/IntelligenceFooter';
import { CURVES } from '@/lib/animations';
import type { Passenger, Disruption, SystemLog } from '@/types/dashboard';

const AirportMapModule = lazy(() => import('@/components/AirportMap/AirportMapModule').then((m) => ({ default: m.AirportMapModule })));

function MapShimmer() {
  return (
    <MapLoadingShimmer
      label="Rendering overview map"
      sublabel="Loading terminal geometry, passenger flow, beacons and heat layers…"
    />
  );
}

function DeferredAirportMap() {
  const [mountMap, setMountMap] = useState(false);

  useEffect(() => {
    // Let the route/page shell paint and complete the visible slow ease-in first.
    // The Three.js scene creation is heavy; mounting it during the transition is
    // what caused a white/stuck frame instead of the animation being visible.
    const delayId = window.setTimeout(() => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => setMountMap(true), { timeout: 900 });
      } else {
        setMountMap(true);
      }
    }, 720);

    return () => window.clearTimeout(delayId);
  }, []);

  if (!mountMap) return <MapShimmer />;

  return (
    <Suspense fallback={<MapShimmer />}>
      <AirportMapModule />
    </Suspense>
  );
}

interface OverviewProps {
  highlightedFilter: string | null;
  onFilterChange: (filter: string | null) => void;
  passengers: Passenger[];
  selectedPassenger: string | null;
  setSelectedPassenger: (id: string | null) => void;
  activeCount: number;
  deviatedCount: number;
  emergencyCount: number;
  avgDeviation: number;
  avgConfidence: number;
  passengerCount: number;
  disruptions: Disruption[];
  pendingCount: number;
  criticalCount: number;
  approveDisruption: (id: string) => void;
  flagDisruption: (id: string) => void;
  resolveDisruption: (id: string) => void;
  logs: SystemLog[];
}

// Per-element stagger: each element gets its own delay
function el(index: number) {
  const delay = index * 0.04;
  return {
    initial: { opacity: 0, y: 8 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        delay,
        duration: 0.16,
        ease: CURVES.easeOutSmooth as any,
      },
    },
  };
}

export default function Overview({
  highlightedFilter,
  onFilterChange,
  passengers,
  selectedPassenger,
  setSelectedPassenger,
  activeCount,
  deviatedCount,
  emergencyCount,
  avgDeviation,
  avgConfidence,
  passengerCount,
  disruptions,
  pendingCount,
  criticalCount,
  approveDisruption,
  flagDisruption,
  resolveDisruption,
  logs,
}: OverviewProps) {
  return (
    <div className="w-full flex flex-col">
      {/* Element 0: Hero Map */}
      <motion.div {...el(0)} className="w-full h-[55vh] rounded-xl border border-slate-100 overflow-hidden relative mb-4 bg-white">
        
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10 }}>
          <DeferredAirportMap />
        </div>

      </motion.div>

      {/* Element 1: Telemetry Ribbon */}
      <motion.div {...el(1)} className="mb-4">
        <TelemetryRibbon
          activeCount={activeCount}
          deviatedCount={deviatedCount}
          emergencyCount={emergencyCount}
          avgDeviation={avgDeviation}
          avgConfidence={avgConfidence}
          passengerCount={passengerCount}
          pendingAlerts={pendingCount}
          criticalAlerts={criticalCount}
          onFilterClick={onFilterChange}
          activeFilter={highlightedFilter}
        />
      </motion.div>

      {/* Element 2: Operations Workspace */}
      <motion.div {...el(2)} className="grid grid-cols-[1.5fr_1fr] gap-4" style={{ minHeight: '400px' }}>
        <LivePassengerMonitor
          passengers={passengers}
          selectedPassenger={selectedPassenger}
          onSelectPassenger={setSelectedPassenger}
        />
        <DisruptionControl
          disruptions={disruptions}
          onApprove={approveDisruption}
          onFlag={flagDisruption}
          onResolve={resolveDisruption}
        />
      </motion.div>

      {/* Spacer */}
      <div className="h-4" />

      {/* Element 3: Intelligence Footer */}
      <motion.div {...el(3)}>
        <IntelligenceFooter logs={logs} />
      </motion.div>
    </div>
  );
}
