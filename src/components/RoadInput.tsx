'use client';

import { useState } from 'react';
import styles from '../styles/RoadInput.module.css';

interface RoadInputProps {
  roads: string[];
  onAddRoad: (road: string) => void;
  onRemoveRoad: (road: string) => void;
  error: string;
  setError: (error: string) => void;
}

export default function RoadInput({ roads, onAddRoad, onRemoveRoad, error, setError }: RoadInputProps) {
  const [newRoad, setNewRoad] = useState('');

  const handleAdd = () => {
    if (!newRoad) {
      setError('Tên đường không được để trống.');
      return;
    }
    if (roads.includes(newRoad)) {
      setError('Tên đường đã tồn tại trong danh sách.');
      return;
    }
    onAddRoad(newRoad);
    setNewRoad('');
    setError('');
  };

  return (
    <div className={styles.roadContainer}>
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.roadInput}>
        <input
          type="text"
          value={newRoad}
          onChange={(e) => setNewRoad(e.target.value)}
          placeholder="Nhập tên đường"
          className={styles.input}
        />
        <button onClick={handleAdd} className={styles.addButton}>Thêm</button>
      </div>
      <ul className={styles.roadList}>
        {roads.map((road, index) => (
          <li key={index} className={styles.roadItem}>
            {road}
            <button
              onClick={() => onRemoveRoad(road)}
              className={styles.removeButton}
            >
              Xóa
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}