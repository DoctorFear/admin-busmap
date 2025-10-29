// app/track/page.tsx
'use client';

import { useState, useEffect } from 'react';
import BusMap from '@/components/BusMap';
import BusInfoPanel from '@/components/BusInfoPanel';
import { mockBuses, Bus } from '@/lib/data_buses';
import styles from './page.module.css';

export default function TrackPage() {
  const [buses, setBuses] = useState<Bus[]>(mockBuses);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);

  useEffect(() => {
    const handler = (e: any) => setBuses(e.detail);
    window.addEventListener('gpsUpdate', handler);
    return () => window.removeEventListener('gpsUpdate', handler);
  }, []);

  const toggleTracking = (id: string) => {
    setBuses(prev => prev.map(b =>
      b.id === id ? { ...b, isTracking: !b.isTracking } : b
    ));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Theo dõi vị trí xe buýt</h1>
        <div className={styles.stats}>
          <span>Đang theo dõi: {buses.filter(b => b.isTracking && b.isOnline).length}</span>
          <span>Tổng: {buses.length}</span>
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.mapArea}>
          <BusMap
            buses={buses}
            selectedBus={selectedBus}
            onBusSelect={setSelectedBus}
            onToggleTracking={toggleTracking}
          />
        </div>
        <div className={styles.panelArea}>
          <BusInfoPanel bus={selectedBus} onToggleTracking={toggleTracking} />
        </div>
      </div>
    </div>
  );
}