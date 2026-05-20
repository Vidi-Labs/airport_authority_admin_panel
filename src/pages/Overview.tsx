import { motion } from 'framer-motion';
import SpatialMap from '@/sections/SpatialMap';
import TelemetryRibbon from '@/sections/TelemetryRibbon';
import LivePassengerMonitor from '@/sections/LivePassengerMonitor';
import DisruptionControl from '@/sections/DisruptionControl';
import IntelligenceFooter from '@/sections/IntelligenceFooter';
import { staggerContainer, staggerItem } from '@/lib/animations';
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
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className="w-full flex flex-col h-full overflow-hidden"
    >
      {/* Hero Map Section */}
      <motion.div
        variants={staggerItem}
        className="w-full h-[55vh] rounded-xl border border-slate-100 overflow-hidden relative mb-4 bg-white"
      >
        <SpatialMap
          passengers={passengers}
          highlightedFilter={highlightedFilter}
          onFilterChange={onFilterChange}
        />
      </motion.div>

      {/* Telemetry Ribbon */}
      <motion.div variants={staggerItem} className="mb-4">
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

      {/* Operations Workspace */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-[1.5fr_1fr] gap-4"
        style={{ minHeight: '400px' }}
      >
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

      {/* Bottom spacer */}
      <div className="h-4" />

      {/* Intelligence Footer */}
      <motion.div variants={staggerItem}>
        <IntelligenceFooter logs={logs} />
      </motion.div>
    </motion.div>
  );
}
