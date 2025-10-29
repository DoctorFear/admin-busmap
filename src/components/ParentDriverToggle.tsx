// components/ParentDriverToggle.tsx
'use client';

import styles from '@/styles/ParentDriverToggle.module.css';

interface ToggleProps {
  selected: 'parent' | 'driver';
  onToggle: (type: 'parent' | 'driver') => void;
}

export default function ParentDriverToggle({ selected, onToggle }: ToggleProps) {
  return (
    <div className={styles.toggleContainer}>
      <button
        className={`${styles.toggleBtn} ${selected === 'parent' ? styles.active : ''}`}
        onClick={() => onToggle('parent')}
      >
        Phụ huynh
      </button>
      <button
        className={`${styles.toggleBtn} ${selected === 'driver' ? styles.active : ''}`}
        onClick={() => onToggle('driver')}
      >
        Tài xế
      </button>
    </div>
  );
}