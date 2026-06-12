import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Radio,
  Route,
  Footprints,
  ChevronDown,
  Maximize2,
  Layers,
  Volume2,
  VolumeX,
} from 'lucide-react';

import Skeleton from '@/components/Skeleton';
import { CURVES, DURATION } from '@/lib/animations';

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

const PASSENGERS = [
  { id: 'PSG-1001', name: 'Passenger 1', dest: 'Gate A12', status: 'active' },
  { id: 'PSG-1002', name: 'Passenger 2', dest: 'Gate B18', status: 'deviated' },
  { id: 'PSG-1003', name: 'Passenger 3', dest: 'Gate C32', status: 'active' },
  { id: 'PSG-1004', name: 'Passenger 4', dest: 'Baggage Claim', status: 'idle' },
  { id: 'PSG-1005', name: 'Passenger 5', dest: 'Gate A24', status: 'active' },
];

const NAV_INSTRUCTIONS = [
  { step: 1, text: 'Proceed straight through main concourse', distance: '120m' },
  { step: 2, text: 'Turn right at the information desk', distance: '45m' },
  { step: 3, text: 'Continue past security checkpoint B', distance: '80m' },
  { step: 4, text: 'Gate A12 will be on your left', distance: '15m' },
];

export default function LiveMonitoring() {
  const [selectedId, setSelectedId] = useState('PSG-1001');
  const [showTrail, setShowTrail] = useState(true);
  const [showRoute, setShowRoute] = useState(true);
  const [terminalMuted, setTerminalMuted] = useState(false);
  const [cameraMuted, setCameraMuted] = useState(true);
  const [loading] = useState(false);

  const selectedPassenger = PASSENGERS.find(p => p.id === selectedId) || PASSENGERS[0];

  function toggleMute(iframeId: string, muted: boolean) {
    const iframe = document.getElementById(iframeId) as HTMLIFrameElement;
    if (!iframe) return;
    const cmd = muted
        ? '{"event":"command","func":"mute","args":""}'
        : '{"event":"command","func":"unMute","args":""}';
    iframe.contentWindow?.postMessage(cmd, '*');
  }

  if (loading) {
    return (
        <div className="h-full flex gap-4 p-4">
          <div className="flex-[3]">
            <Skeleton variant="card" className="h-full" />
          </div>
          <div className="flex-[2] space-y-4">
            <Skeleton variant="card" className="h-48" />
            <Skeleton variant="card" className="h-64" />
          </div>
        </div>
    );
  }

  return (
      <div className="h-full flex flex-col gap-4 p-4">
        {/* Element 0: Header */}
        <motion.div {...el(0)} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <Radio size={18} className="text-blue-500" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-800">Live Monitoring</h1>
              <p className="text-xs text-slate-400">Real-time passenger tracking and camera feeds</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-600">Live</span>
            </div>
          </div>
        </motion.div>

        {/* Element 1: Passenger Selector */}
        <motion.div {...el(1)} className="rounded-xl border border-slate-100 bg-white p-4">
          <label className="text-xs font-medium text-slate-500 mb-2 block">Select Passenger</label>
          <div className="relative">
            <select
                value={selectedId}
                onChange={e => setSelectedId(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-100 rounded-lg px-3 py-2.5 text-sm text-slate-700 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-colors"
            >
              {PASSENGERS.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.id} - {p.dest}
                  </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <div className="flex items-center gap-2 mt-3">
          <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${
                  selectedPassenger.status === 'active'
                      ? 'bg-emerald-50 text-emerald-600'
                      : selectedPassenger.status === 'deviated'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-slate-50 text-slate-500'
              }`}
          >
            {selectedPassenger.status}
          </span>
            <span className="text-xs text-slate-400">Destination: {selectedPassenger.dest}</span>
          </div>
        </motion.div>

        {/* Element 2: Trail/Route Controls */}
        <motion.div {...el(2)} className="flex items-center gap-2">
          <button
              onClick={() => setShowTrail(!showTrail)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  showTrail
                      ? 'bg-blue-50 text-blue-600 border border-blue-100'
                      : 'bg-slate-50 text-slate-500 border border-slate-100'
              }`}
          >
            <Footprints size={12} />
            Trail
          </button>
          <button
              onClick={() => setShowRoute(!showRoute)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  showRoute
                      ? 'bg-blue-50 text-blue-600 border border-blue-100'
                      : 'bg-slate-50 text-slate-500 border border-slate-100'
              }`}
          >
            <Route size={12} />
            Route
          </button>
          <button className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-500 hover:bg-slate-100 transition-colors">
            <Layers size={12} />
          </button>
        </motion.div>

        {/* Main Content */}
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Element 3: Terminal View */}
          <motion.div {...el(3)} className="flex-[3] min-w-0">
            <div className="h-full rounded-xl border border-slate-100 bg-white overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/60 to-transparent">
                <div className="flex items-center gap-2">
                  <Layers size={14} className="text-white" />
                  <span className="text-xs font-medium text-white">Terminal View</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                      onClick={() => {
                        setTerminalMuted(!terminalMuted);
                        toggleMute('terminal-video', terminalMuted);
                      }}
                      className="p-1.5 rounded-md bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
                  >
                    {terminalMuted ? <Volume2 size={12} /> : <VolumeX size={12} />}
                  </button>
                  <button className="p-1.5 rounded-md bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors">
                    <Maximize2 size={12} />
                  </button>
                </div>
              </div>

              <div className="absolute inset-0">
                <iframe
                    id="terminal-video"
                    src="https://www.youtube.com/embed/JpS7E5O2FrA?autoplay=1&mute=1&loop=1&playlist=JpS7E5O2FrA&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&fs=0&cc_load_policy=0&enablejsapi=1"
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ width: '178%', height: '178%' }}
                    allow="autoplay; encrypted-media"
                    allowFullScreen={false}
                    frameBorder="0"
                    title="Terminal View"
                />
              </div>
            </div>
          </motion.div>

          {/* Right Panel */}
          <div className="flex-[2] min-w-0 flex flex-col gap-4">

            {/* Element 4: Camera Feed — same oversized+centered technique as Terminal View */}
            <motion.div
                {...el(4)}
                className="rounded-xl border border-slate-100 bg-black overflow-hidden relative"
                style={{ minHeight: '240px' }}
            >
              {/* Oversized iframe centered — clips YouTube branding off all edges */}
              <div className="absolute inset-0">
                <iframe
                    id="camera-video"
                    src="https://www.youtube.com/embed/h7duPDlUddw?autoplay=1&mute=1&loop=1&playlist=h7duPDlUddw&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&fs=0&cc_load_policy=0&enablejsapi=1"
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ width: '178%', height: '178%' }}
                    allow="autoplay; encrypted-media"
                    allowFullScreen={false}
                    frameBorder="0"
                    title="Camera Feed"
                />
              </div>

              {/* Top bar */}
              <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/65 via-black/20 to-transparent pointer-events-none">
                <span className="text-xs font-medium text-white">Live Camera Feed</span>
                <div className="flex items-center gap-1.5">
                  <button
                      onClick={() => {
                        const next = !cameraMuted;
                        setCameraMuted(next);
                        toggleMute('camera-video', next);
                      }}
                      className="pointer-events-auto p-1.5 rounded-md bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors"
                  >
                    {cameraMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                  </button>
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] font-mono text-red-400 font-bold">REC</span>
                </div>
              </div>
            </motion.div>

            {/* Element 5: Navigation Instructions */}
            <motion.div {...el(5)} className="rounded-xl border border-slate-100 bg-white p-4">
              <h3 className="text-xs font-medium text-slate-500 mb-3">Navigation Instructions</h3>
              <div className="space-y-2">
                {NAV_INSTRUCTIONS.map((inst, i) => (
                    <div
                        key={inst.step}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                            i === 0
                                ? 'bg-blue-50 border border-blue-100'
                                : 'bg-slate-50 border border-transparent'
                        }`}
                    >
                      <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              i === 0 ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'
                          }`}
                      >
                        {inst.step}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs ${i === 0 ? 'text-blue-700 font-medium' : 'text-slate-600'}`}>
                          {inst.text}
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{inst.distance}</span>
                    </div>
                ))}
              </div>
            </motion.div>



          </div>
        </div>
      </div>
  );
}