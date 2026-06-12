import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
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
  const [, setNow] = useState(new Date());
  const [passengerMuted, setPassengerMuted] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    const iv = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(iv);
  }, [isOpen]);

  function toggleMute(muted: boolean) {
    const iframe = document.getElementById('passenger-video') as HTMLIFrameElement;
    if (!iframe) return;
    const cmd = muted
      ? '{"event":"command","func":"mute","args":""}'
      : '{"event":"command","func":"unMute","args":""}';
    iframe.contentWindow?.postMessage(cmd, '*');
  }

  if (!passenger) return null;

  const statusColor = STATUS_COLORS[passenger.status] || "#64748b";
  const totalPurchases = passenger.purchases.reduce((s, p) => s + p.price, 0);

  return (
    <div
      className="fixed right-3 top-16 bottom-3 z-[50] overflow-y-auto rounded-2xl"
      style={{
        width: 320,
        background: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        border: "1px solid rgba(0, 0, 0, 0.06)",
        boxShadow: "0 4px 24px rgba(0, 0, 0, 0.04), 0 1px 4px rgba(0, 0, 0, 0.02)",
        transform: isOpen ? "translateX(0)" : "translateX(120%)",
        transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1)",
        fontFamily: "'Sora', 'Inter', sans-serif",
      }}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{passenger.avatar}</span>
            <div>
              <h2 className="text-base font-bold text-slate-800">{passenger.name}</h2>
              <p className="text-[11px] text-slate-500">
                {passenger.nationality} &middot; Flight {passenger.flightNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center font-bold transition-colors flex-shrink-0"
            style={{
              background: "#fee2e2",
              color: "#dc2626",
              border: "1px solid #fecaca",
              fontSize: 16,
            }}
            title="Close"
          >
            &times;
          </button>
        </div>
        <span
          className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
          style={{
            color: statusColor,
            background: `${statusColor}15`,
            border: `1px solid ${statusColor}30`,
          }}
        >
          {passenger.status}
        </span>
      </div>

      {/* Flight Info Strip */}
      <div className="mx-4 mt-3 p-2.5 rounded-lg" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex-1 text-center">
            <p className="text-slate-400 mb-0.5">&#9992; Destination</p>
            <p className="text-slate-700 font-medium text-[11px]">{passenger.destination}</p>
          </div>
          <div className="w-px h-6 bg-slate-200" />
          <div className="flex-1 text-center">
            <p className="text-slate-400 mb-0.5">&#128682; Gate</p>
            <p className="text-slate-700 font-medium text-[11px]">{passenger.boardingGate}</p>
          </div>
          <div className="w-px h-6 bg-slate-200" />
          <div className="flex-1 text-center">
            <p className="text-slate-400 mb-0.5">&#128336; Boarding</p>
            <p className="text-slate-700 font-medium text-[11px]">{passenger.boardingTime}</p>
          </div>
        </div>
      </div>

      {/* Journey Timeline */}
      <div className="px-4 mt-4">
        <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
          Journey Timeline
        </h3>
        <div className="space-y-0">
          {passenger.journeyLog.map((ev, i) => (
            <div key={i} className="flex gap-2.5 relative">
              {i < passenger.journeyLog.length - 1 && (
                <div
                  className="absolute left-[5px] top-[16px] w-px bg-slate-200"
                  style={{ height: "calc(100% - 4px)" }}
                />
              )}
              <div
                className="w-[10px] h-[10px] rounded-full flex-shrink-0 mt-0.5"
                style={{
                  background: ev.difficulty ? "#ff4444" : "#22aaff",
                  boxShadow: ev.difficulty ? "0 0 8px #ff444460" : "none",
                }}
              />
              <div
                className={`pb-2 flex-1 ${ev.difficulty ? "border-l-2 border-red-400 pl-2 rounded" : ""}`}
                style={ev.difficulty ? { background: "rgba(255,68,68,0.04)", marginLeft: -8, paddingLeft: 10 } : {}}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-slate-400">{ev.time}</span>
                  <span className="text-[11px] text-slate-700 font-medium">{ev.zone}</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {ev.difficulty && <span className="text-red-500 mr-1">&#9888;</span>}
                  {ev.action}
                </p>
                {ev.difficultyNote && (
                  <p className="text-[9px] text-red-500 mt-0.5 italic">{ev.difficultyNote}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Purchases */}
      <div className="px-4 mt-3">
        <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
          &#128717; Purchases
        </h3>
        {passenger.purchases.length === 0 ? (
          <p className="text-[11px] text-slate-400 italic">No purchases recorded</p>
        ) : (
          <div className="space-y-1.5">
            {passenger.purchases.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600">{p.item}</span>
                <span className="text-emerald-600 font-mono">${p.price.toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-slate-100 pt-1.5 flex items-center justify-between">
              <span className="text-[11px] text-slate-700 font-bold">Total</span>
              <span className="text-sm text-emerald-600 font-mono font-bold">
                ${totalPurchases.toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Live Stats */}
      <div className="px-4 mt-4 mb-4 flex gap-2">
        <div className="flex-1 p-2 rounded-lg" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
          <p className="text-[8px] text-slate-400 uppercase">Zone</p>
          <p className="text-[11px] text-slate-700 font-medium mt-0.5">{passenger.currentZone}</p>
        </div>
        <div className="flex-1 p-2 rounded-lg" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
          <p className="text-[8px] text-slate-400 uppercase">ETA</p>
          <p className="text-[11px] text-slate-700 font-medium mt-0.5">{passenger.eta}</p>
        </div>
        <div className="flex-1 p-2 rounded-lg" style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>
          <p className="text-[8px] text-slate-400 uppercase">Help</p>
          <p className="text-[11px] font-medium mt-0.5">
            {passenger.needsHelp ? (
              <span className="text-red-500 animate-pulse">&#9888; Needs Help</span>
            ) : (
              <span className="text-emerald-500">&#10003; OK</span>
            )}
          </p>
        </div>
      </div>

      {/* Live Feed */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            &#128250; Live Feed
          </h3>
          <button
            onClick={() => {
              const next = !passengerMuted;
              setPassengerMuted(next);
              toggleMute(next);
            }}
            className="p-1 rounded-md bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
          >
            {passengerMuted ? <Volume2 size={12} /> : <VolumeX size={12} />}
          </button>
        </div>
        <div className="relative rounded-lg overflow-hidden" style={{ height: 160 }}>
          <iframe
            id="passenger-video"
            src="https://www.youtube.com/embed/q83bhmzABGE?autoplay=1&mute=1&loop=1&playlist=q83bhmzABGE&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&fs=0&cc_load_policy=0&enablejsapi=1"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ width: '178%', height: '178%' }}
            allow="autoplay; encrypted-media"
            allowFullScreen={false}
            frameBorder="0"
            title="Live Passenger Feed"
          />
        </div>
      </div>
    </div>
  );
}
