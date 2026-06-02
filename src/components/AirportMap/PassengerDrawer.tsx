import { useEffect, useState } from "react";
import type { Passenger } from "./passengerData";

const STATUS_COLORS: Record<string, string> = {
  navigating: "#22aaff",
  shopping: "#ffaa22",
  waiting: "#8888ff",
  difficulty: "#ff4444",
  boarded: "#22ff88",
};

interface Props {
  passenger: Passenger | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PassengerDrawer({ passenger, isOpen, onClose }: Props) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    if (!isOpen) return;
    const iv = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(iv);
  }, [isOpen]);

  if (!passenger) return null;

  const statusColor = STATUS_COLORS[passenger.status] || "#ffffff";
  const totalPurchases = passenger.purchases.reduce((s, p) => s + p.price, 0);

  return (
    <div
      className="fixed right-0 top-0 h-full z-[20] overflow-y-auto"
      style={{
        width: 380,
        background: "rgba(8,12,28,0.96)",
        backdropFilter: "blur(20px)",
        borderLeft: "1px solid rgba(255,255,255,0.08)",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1)",
        fontFamily: "'Sora', 'Inter', sans-serif",
      }}
    >
      {/* Header */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{passenger.avatar}</span>
            <div>
              <h2 className="text-lg font-bold text-white">{passenger.name}</h2>
              <p className="text-xs text-slate-400">
                {passenger.nationality} &middot; Flight {passenger.flightNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            &times;
          </button>
        </div>
        <span
          className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
          style={{
            color: statusColor,
            background: `${statusColor}20`,
            border: `1px solid ${statusColor}40`,
          }}
        >
          {passenger.status}
        </span>
      </div>

      {/* Flight Info Strip */}
      <div className="mx-5 mt-4 p-3 rounded-lg" style={{ background: "#0f1428" }}>
        <div className="flex items-center justify-between text-xs">
          <div className="flex-1 text-center">
            <p className="text-slate-500 mb-0.5">&#9992; Destination</p>
            <p className="text-white font-medium">{passenger.destination}</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex-1 text-center">
            <p className="text-slate-500 mb-0.5">&#128682; Gate</p>
            <p className="text-white font-medium">{passenger.boardingGate}</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div className="flex-1 text-center">
            <p className="text-slate-500 mb-0.5">&#128336; Boarding</p>
            <p className="text-white font-medium">{passenger.boardingTime}</p>
          </div>
        </div>
      </div>

      {/* Journey Timeline */}
      <div className="px-5 mt-5">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Journey Timeline
        </h3>
        <div className="space-y-0">
          {passenger.journeyLog.map((ev, i) => (
            <div key={i} className="flex gap-3 relative">
              {/* Timeline line */}
              {i < passenger.journeyLog.length - 1 && (
                <div
                  className="absolute left-[5px] top-[18px] w-px bg-white/10"
                  style={{ height: "calc(100% - 4px)" }}
                />
              )}
              {/* Dot */}
              <div
                className="w-[10px] h-[10px] rounded-full flex-shrink-0 mt-1"
                style={{
                  background: ev.difficulty ? "#ff4444" : "#22aaff",
                  boxShadow: ev.difficulty ? "0 0 8px #ff4444" : "none",
                }}
              />
              <div
                className={`pb-3 flex-1 ${ev.difficulty ? "border-l-2 border-red-500 pl-2 rounded" : ""}`}
                style={ev.difficulty ? { background: "rgba(255,68,68,0.05)", marginLeft: -8, paddingLeft: 10 } : {}}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-500">{ev.time}</span>
                  <span className="text-xs text-white font-medium">{ev.zone}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {ev.difficulty && <span className="text-red-400 mr-1">&#9888;</span>}
                  {ev.action}
                </p>
                {ev.difficultyNote && (
                  <p className="text-[10px] text-red-400 mt-0.5 italic">{ev.difficultyNote}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Purchases */}
      <div className="px-5 mt-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          &#128717; Purchases
        </h3>
        {passenger.purchases.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No purchases recorded</p>
        ) : (
          <div className="space-y-2">
            {passenger.purchases.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-slate-300">{p.item}</span>
                <span className="text-emerald-400 font-mono">${p.price.toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-white/10 pt-2 flex items-center justify-between">
              <span className="text-xs text-white font-bold">Total</span>
              <span className="text-sm text-emerald-400 font-mono font-bold">
                ${totalPurchases.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Live Stats */}
      <div className="px-5 mt-5 mb-5 flex gap-2">
        <div className="flex-1 p-2.5 rounded-lg" style={{ background: "#0f1428" }}>
          <p className="text-[9px] text-slate-500 uppercase">Zone</p>
          <p className="text-xs text-white font-medium mt-0.5">{passenger.currentZone}</p>
        </div>
        <div className="flex-1 p-2.5 rounded-lg" style={{ background: "#0f1428" }}>
          <p className="text-[9px] text-slate-500 uppercase">ETA</p>
          <p className="text-xs text-white font-medium mt-0.5">{passenger.eta}</p>
        </div>
        <div className="flex-1 p-2.5 rounded-lg" style={{ background: "#0f1428" }}>
          <p className="text-[9px] text-slate-500 uppercase">Help</p>
          <p className="text-xs font-medium mt-0.5">
            {passenger.needsHelp ? (
              <span className="text-red-400 animate-pulse">&#9888; Needs Help</span>
            ) : (
              <span className="text-emerald-400">&#10003; OK</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
