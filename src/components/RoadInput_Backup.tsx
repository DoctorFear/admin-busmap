'use client';

import { useState, useRef, useEffect } from 'react';
import styles from '../styles/RoadInput.module.css';

interface Parent {
  userID: number;
  name: string;
  username: string;
  password: string;
  phone: string;
  studentName: string;
  address: string;
}

interface RoadInputProps {
  roads: string[];
  onAddRoad: (road: string) => void;
  onRemoveRoad: (road: string) => void;
  error: string;
  setError: (error: string) => void;
  parents?: Parent[];
}

export default function RoadInput({ roads, onAddRoad, onRemoveRoad, error, setError, parents = [] }: RoadInputProps) {
  const [newRoad, setNewRoad] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredParents, setFilteredParents] = useState<Parent[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter parents based on input
  useEffect(() => {
    if (newRoad && parents.length > 0) {
      const filtered = parents.filter(parent => 
        parent.address.toLowerCase().includes(newRoad.toLowerCase()) ||
        parent.username.toLowerCase().includes(newRoad.toLowerCase()) ||
        parent.name.toLowerCase().includes(newRoad.toLowerCase())
      );
      setFilteredParents(filtered);
    } else {
      setFilteredParents(parents);
    }
  }, [newRoad, parents]);

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
    setShowDropdown(false);
  };

  const handleSelectParent = (address: string) => {
    setNewRoad(address);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <div className={styles.roadContainer}>
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.roadInput}>
        <div className={styles.inputWrapper} ref={dropdownRef}>
          <input
            ref={inputRef}
            type="text"
            value={newRoad}
            onChange={(e) => setNewRoad(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            placeholder="Nhập các điểm đến"
            className={styles.input}
          />
          <button 
            type="button"
            onClick={toggleDropdown} 
            className={styles.dropdownToggle}
            title="Chọn từ danh sách địa chỉ phụ huynh"
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 20 20" 
              fill="currentColor"
              style={{ transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}
            >
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </button>
          
          {showDropdown && parents.length > 0 && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>
                Chọn địa chỉ phụ huynh ({filteredParents.length})
              </div>
              <ul className={styles.dropdownList}>
                {filteredParents.length > 0 ? (
                  filteredParents.map((parent) => (
                    <li 
                      key={parent.userID}
                      onClick={() => handleSelectParent(parent.address)}
                      className={styles.dropdownItem}
                    >
                      <div className={styles.dropdownItemUsername}>[{parent.username}]</div>
                      <div className={styles.dropdownItemAddress}>{parent.address}</div>
                    </li>
                  ))
                ) : (
                  <li className={styles.dropdownItemEmpty}>Không tìm thấy địa chỉ phù hợp</li>
                )}
              </ul>
            </div>
          )}
        </div>
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