import { useState, useEffect, useMemo } from "react";
import type { Passenger } from "./passengerData";

const STATUS_COLORS: Record<string, string> = {
  navigating: "#22aaff",
  shopping: "#ffaa22",
  waiting: "#8888ff",
  difficulty: "#ff4444",
  boarded: "#22ff88",
};

interface Props {
  passengers: Passenger[];
  onHeatmapToggle: () => void;
  onTrailsToggle: () => void;
  onLabelsToggle: () => void;
  onPassengerSelect: (id: string) => void;
  selectedId: string | null;
}

export function HUDOverlay({
  passengers,
  onHeatmapToggle,
  onTrailsToggle,
  onLabelsToggle,
  onPassengerSelect,
  selectedId,
}: Props) {
  const [time, setTime] = useState(new Date());
  const [heatmapActive, setHeatmapActive] = useState(false);
  const [trailsActive, setTrailsActive] = useState(true);
  const [labelsActive, setLabelsActive] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const iv = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  const counts = useMemo(() => {
    const active = passengers.filter((p) => p.status === "navigating").length;
    const difficulty = passengers.filter((p) => p.status === "difficulty").length;
    const boarded = passengers.filter((p) => p.status === "boarded").length;
    return { total: passengers.length, active, difficulty, boarded };
  }, [passengers]);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <div className="absolute inset-0 z-10 pointer-events-none" style={{ fontFamily: "'Sora', 'Inter', sans-serif" }}>
      {/* Top-Left: Terminal Info */}
      <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-2 rounded-lg pointer-events-auto"
        style={{ background: "rgba(8,12,28,0.8)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}>
        <span className="text-xs">&#9992;</span>
        <span className="text-[11px] text-white font-medium">Terminal 2 — Live Operations</span>
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#22ff88" }} />
        <span className="text-[10px] font-mono text-slate-400 ml-1">{formatTime(time)}</span>
      </div>

      {/* Top-Right: Passenger Counts */}
      <div className="absolute top-3 right-3 flex gap-1.5 pointer-events-auto">
        {[
          { label: "Active", value: counts.total, color: "#22aaff" },
          { label: "Navigating", value: counts.active, color: "#22aaff" },
          { label: "Difficulty", value: counts.difficulty, color: "#ff4444", pulse: true },
          { label: "Boarded", value: counts.boarded, color: "#22ff88" },
        ].map((chip) => (
          <div
            key={chip.label}
            className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium"
            style={{
              background: chip.pulse ? "rgba(255,68,68,0.2)" : "rgba(8,12,28,0.8)",
              border: `1px solid ${chip.pulse ? "#ff444440" : "rgba(255,255,255,0.08)"}`,
              color: chip.color,
              backdropFilter: "blur(12px)",
              animation: chip.pulse ? "pulse 1.5s ease-in-out infinite" : "none",
            }}
          >
            {chip.label}: {chip.value}
          </div>
        ))}
      </div>

      {/* Bottom-Left: Legend */}
      <div className="absolute bottom-3 left-3 px-3 py-2 rounded-lg pointer-events-auto"
        style={{ background: "rgba(8,12,28,0.8)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-3">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="text-[9px] text-slate-400 capitalize">{status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom-Right: Controls */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1.5 pointer-events-auto">
        {[
          { label: "Heatmap", active: heatmapActive, toggle: () => { setHeatmapActive(!heatmapActive); onHeatmapToggle(); } },
          { label: "Trails", active: trailsActive, toggle: () => { setTrailsActive(!trailsActive); onTrailsToggle(); } },
          { label: "Labels", active: labelsActive, toggle: () => { setLabelsActive(!labelsActive); onLabelsToggle(); } },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={btn.toggle}
            className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-left transition-all"
            style={{
              background: btn.active ? "rgba(34,170,255,0.15)" : "rgba(8,12,28,0.8)",
              border: `1px solid ${btn.active ? "#22aaff40" : "rgba(255,255,255,0.08)"}`,
              color: btn.active ? "#22aaff" : "#94a3b8",
              backdropFilter: "blur(12px)",
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Left Sidebar: Passenger List */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center pointer-events-auto">
        {/* Toggle tab */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-6 h-16 rounded-r-lg flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          style={{ background: "rgba(8,12,28,0.8)", borderLeft: "1px solid rgba(255,255,255,0.08)" }}
        >
          <span className="text-[10px]">{sidebarOpen ? "\u25C0" : "\u25B6"}</span>
        </button>

        {/* Panel */}
        {sidebarOpen && (
          <div
            className="max-h-[60vh] overflow-y-auto rounded-r-lg"
            style={{
              background: "rgba(8,12,28,0.92)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(12px)",
              width: 200,
            }}
          >
            <div className="px-3 py-2 border-b border-white/5">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Passengers ({passengers.length})
              </span>
            </div>
            {passengers.map((p) => (
              <button
                key={p.id}
                onClick={() => onPassengerSelect(p.id)}
                className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-white/5 transition-colors"
                style={{
                  borderLeft: selectedId === p.id ? "2px solid #22aaff" : "2px solid transparent",
                }}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[p.status] }} />
                <div className="min-w-0">
                  <p className="text-[11px] text-white truncate">{p.name}</p>
                  <p className="text-[9px] text-slate-500">{p.flightNumber}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
