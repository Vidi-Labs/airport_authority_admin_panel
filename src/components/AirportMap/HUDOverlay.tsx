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
  onLabelsToggle: () => void;
  onZoomOutAll: () => void;
  zoomPercent: number;
  viewMode: "2D" | "Detail" | "3D";
  onZoomPercentChange: (zoom: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onPassengerSelect: (id: string) => void;
  selectedId: string | null;
}

export function HUDOverlay({
  passengers,
  onHeatmapToggle,
  onLabelsToggle,
  onZoomOutAll,
  zoomPercent,
  viewMode,
  onZoomPercentChange,
  onZoomIn,
  onZoomOut,
  onPassengerSelect,
  selectedId,
}: Props) {
  const [time, setTime] = useState(new Date());
  const [heatmapActive, setHeatmapActive] = useState(false);
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
        style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,0,0,0.08)", backdropFilter: "blur(12px)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <span className="text-xs">&#9992;</span>
        <span className="text-[11px] text-slate-700 font-medium">Terminal 2 — Live Operations</span>
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#22ff88" }} />
        <span className="text-[10px] font-mono text-slate-500 ml-1">{formatTime(time)}</span>
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
              background: chip.pulse ? "rgba(255,68,68,0.08)" : "rgba(255,255,255,0.9)",
              border: `1px solid ${chip.pulse ? "#ff444430" : "rgba(0,0,0,0.08)"}`,
              color: chip.color,
              backdropFilter: "blur(12px)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              animation: chip.pulse ? "pulse 1.5s ease-in-out infinite" : "none",
            }}
          >
            {chip.label}: {chip.value}
          </div>
        ))}
      </div>

      {/* Bottom-Left: Legend */}
      <div className="absolute bottom-28 left-3 px-3 py-2 rounded-lg pointer-events-auto"
        style={{ background: "rgba(255,255,255,0.9)", border: "1px solid rgba(0,0,0,0.08)", backdropFilter: "blur(12px)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
        <div className="flex items-center gap-3">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="text-[9px] text-slate-500 capitalize">{status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom-Right: Controls */}
      <div className="absolute bottom-28 right-3 flex flex-col gap-1.5 pointer-events-auto">
        <div
          className="rounded-lg overflow-hidden flex flex-row"
          style={{
            background: "rgba(255,255,255,0.96)",
            border: "1px solid rgba(0,0,0,0.12)",
            color: "#334155",
            backdropFilter: "blur(12px)",
            boxShadow: "0 2px 6px rgba(0,0,0,0.16)",
          }}
        >
          <button
            onClick={onZoomIn}
            className="w-10 h-10 text-xl font-semibold hover:bg-slate-50 transition-colors"
            title="Zoom in"
          >
            +
          </button>
          <div className="w-px bg-slate-200" />
          <button
            onClick={onZoomOut}
            className="w-10 h-10 text-xl leading-none font-light hover:bg-slate-50 transition-colors"
            title="Zoom out"
          >
            −
          </button>
        </div>

        <div
          className="w-52 rounded-lg px-3 py-2"
          style={{
            background: "rgba(255,255,255,0.92)",
            border: "1px solid rgba(0,0,0,0.08)",
            color: "#334155",
            backdropFilter: "blur(12px)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Map Zoom</span>
            <button
              onClick={onZoomOutAll}
              className="text-[10px] font-semibold text-blue-500 hover:text-blue-700 transition-colors"
              title="Zoom to full airport map"
            >
              Full map
            </button>
          </div>
          <div className="mb-1 text-[11px] font-mono font-bold text-slate-700">{zoomPercent}% · {viewMode}</div>
          <input
            type="range"
            min={25}
            max={500}
            step={25}
            value={zoomPercent}
            onChange={(e) => onZoomPercentChange(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="mt-1 flex justify-between text-[9px] text-slate-400">
            <span>Full map</span>
            <span>POIs</span>
            <span>Street detail</span>
          </div>
        </div>

        {[
          { label: "Heatmap", active: heatmapActive, toggle: () => { setHeatmapActive(!heatmapActive); onHeatmapToggle(); } },
          { label: "Labels", active: labelsActive, toggle: () => { setLabelsActive(!labelsActive); onLabelsToggle(); } },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={btn.toggle}
            className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-left transition-all"
            style={{
              background: btn.active ? "rgba(34,170,255,0.1)" : "rgba(255,255,255,0.9)",
              border: `1px solid ${btn.active ? "#22aaff40" : "rgba(0,0,0,0.08)"}`,
              color: btn.active ? "#22aaff" : "#64748b",
              backdropFilter: "blur(12px)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Left Sidebar: Passenger List */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-start pointer-events-auto z-30">
        {/* Toggle tab */}
        <button
          onClick={(e) => { e.stopPropagation(); setSidebarOpen((prev) => !prev); }}
          className="w-7 h-20 rounded-r-lg flex items-center justify-center transition-colors"
          style={{
            background: sidebarOpen ? "rgba(34,170,255,0.15)" : "rgba(255,255,255,0.95)",
            border: "1px solid rgba(0,0,0,0.1)",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            color: sidebarOpen ? "#22aaff" : "#64748b",
          }}
          title={sidebarOpen ? "Close passenger list" : "Open passenger list"}
        >
          <span className="text-xs font-bold">{sidebarOpen ? "\u2715" : "\u2630"}</span>
        </button>

        {/* Panel */}
        {sidebarOpen && (
          <div
            className="max-h-[60vh] overflow-y-auto rounded-r-lg"
            style={{
              background: "rgba(255,255,255,0.97)",
              border: "1px solid rgba(0,0,0,0.08)",
              backdropFilter: "blur(12px)",
              width: 220,
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            }}
          >
            <div className="px-3 py-2 border-b border-slate-100">
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                Passengers ({passengers.length})
              </span>
            </div>
            {passengers.map((p) => {
              const isSelected = selectedId === p.id;
              const lastEvent = p.journeyLog[p.journeyLog.length - 1];
              return (
                <div key={p.id}>
                  <button
                    onClick={() => onPassengerSelect(p.id)}
                    className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50 transition-colors"
                    style={{
                      borderLeft: isSelected ? "2px solid #22aaff" : "2px solid transparent",
                    }}
                  >
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[p.status] }} />
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-700 truncate">{p.name}</p>
                      <p className="text-[9px] text-slate-400">{p.flightNumber}</p>
                    </div>
                  </button>
                  {isSelected && (
                    <div className="px-3 pb-2 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLORS[p.status] }} />
                        <span className="text-[10px] font-medium capitalize" style={{ color: STATUS_COLORS[p.status] }}>
                          {p.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        <span className="font-medium text-slate-600">Zone:</span> {p.currentZone}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        <span className="font-medium text-slate-600">Destination:</span> {p.destination} ({p.boardingGate})
                      </div>
                      <div className="text-[10px] text-slate-500">
                        <span className="font-medium text-slate-600">ETA:</span> {p.eta}
                      </div>
                      {lastEvent && (
                        <div className="text-[10px] text-slate-500">
                          <span className="font-medium text-slate-600">Last:</span> {lastEvent.action}
                          <span className="text-slate-400 ml-1">at {lastEvent.time}</span>
                        </div>
                      )}
                      {p.journeyLog.length > 1 && (
                        <div className="text-[10px] text-slate-400 italic">
                          {p.journeyLog.length} stops recorded
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
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
