'use client';

import { useState } from 'react';
import styles from '../styles/SearchBar.module.css';
import { SearchIcon } from "lucide-react";

interface SearchBarProps {
  onSearch: (term: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  return (
    <div className={styles.searchContainer}>
      <input
        type="text"
        placeholder="Mời nhập nôi dung tìm kiếm..."
        className={styles.searchInput}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
      />
      <button className={styles.searchButton} onClick={handleSearch}>
        <SearchIcon />
      </button>
    </div>
  );
}
