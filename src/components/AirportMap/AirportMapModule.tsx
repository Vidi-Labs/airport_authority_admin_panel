import { useRef, useEffect, useState, useCallback } from "react";
import { usePassengerSimulation } from "./usePassengerSimulation";
import { useThreeScene } from "./useThreeScene";
import { PassengerDrawer } from "./PassengerDrawer";
import { HUDOverlay } from "./HUDOverlay";
import styles from "./AirportMap.module.css";

export function AirportMapModule() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { passengers } = usePassengerSimulation();
  const { syncPassengers, setHeatmap, setLabels, flyToPassenger, zoomToOverview, setZoomPercent, zoomIn, zoomOut, zoomPercent, viewMode } = useThreeScene(canvasRef);
  const [selectedPassengerId, setSelectedPassengerId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Sync simulation state into Three.js only when passenger data changes.
  // Do NOT run this on every animation frame: syncPassengers touches many Three
  // objects and previously recreated badge textures per frame, which saturated
  // the main thread and made sidebar navigation feel frozen on first load.
  useEffect(() => {
    syncPassengers(passengers, (pid) => {
      setSelectedPassengerId(pid);
      setDrawerOpen(true);
    });
  }, [passengers, syncPassengers]);

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
        onLabelsToggle={() => setLabels((v) => !v)}
        onZoomOutAll={zoomToOverview}
        zoomPercent={zoomPercent}
        viewMode={viewMode}
        onZoomPercentChange={setZoomPercent}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
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
