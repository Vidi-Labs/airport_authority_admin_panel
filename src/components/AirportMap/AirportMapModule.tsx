import { useRef, useEffect, useState, useCallback } from "react";
import { usePassengerSimulation } from "./usePassengerSimulation";
import { useThreeScene } from "./useThreeScene";
import { PassengerDrawer } from "./PassengerDrawer";
import { HUDOverlay } from "./HUDOverlay";
import styles from "./AirportMap.module.css";

export function AirportMapModule() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { passengers } = usePassengerSimulation();
  const { syncPassengers, setHeatmap, setTrails, setLabels, flyToPassenger, resetCamera } = useThreeScene(canvasRef);
  const [selectedPassengerId, setSelectedPassengerId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const passengersRef = useRef(passengers);
  passengersRef.current = passengers;

  // Sync simulation state into Three.js
  useEffect(() => {
    let running = true;
    const loop = () => {
      if (!running) return;
      syncPassengers(passengersRef.current, (pid) => {
        setSelectedPassengerId(pid);
        setDrawerOpen(true);
      });
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return () => { running = false; };
  }, [syncPassengers]);

  const selectedPassenger = passengers.find((p) => p.id === selectedPassengerId) ?? null;

  const handlePassengerSelect = useCallback(
    (id: string) => {
      setSelectedPassengerId(id);
      setDrawerOpen(true);
      flyToPassenger(id);
    },
    [flyToPassenger]
  );

  return (
    <div className={styles.root}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <HUDOverlay
        passengers={passengers}
        onHeatmapToggle={() => setHeatmap((v) => !v)}
        onTrailsToggle={() => setTrails((v) => !v)}
        onLabelsToggle={() => setLabels((v) => !v)}
        onPassengerSelect={handlePassengerSelect}
        selectedId={selectedPassengerId}
      />
      <PassengerDrawer
        passenger={selectedPassenger}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
