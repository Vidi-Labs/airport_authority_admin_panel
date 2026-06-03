import { motion } from 'framer-motion';
import SpatialMap from '@/sections/SpatialMap';
import TelemetryRibbon from '@/sections/TelemetryRibbon';
import LivePassengerMonitor from '@/sections/LivePassengerMonitor';
import DisruptionControl from '@/sections/DisruptionControl';
import IntelligenceFooter from '@/sections/IntelligenceFooter';
import { CURVES, DURATION } from '@/lib/animations';
import type { Passenger, Disruption, SystemLog } from '@/types/dashboard';

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
  const delay = index * DURATION.stagger;
  return {
    initial: { opacity: 0, y: 20, scale: 0.97 },
    animate: {
      opacity: 1,
      y: 0,
      scale: [0.97, 1.03, 0.99, 1],
      transition: {
        delay,
        duration: DURATION.page,
        ease: CURVES.easeOutSmooth as any,
        opacity: { delay, duration: DURATION.fadeSlow, ease: 'linear' },
        scale: { delay, duration: DURATION.page, times: [0, 0.45, 0.7, 1], ease: CURVES.easeOutSmooth as any },
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
        <SpatialMap
          passengers={passengers}
          highlightedFilter={highlightedFilter}
          onFilterChange={onFilterChange}
        />
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
