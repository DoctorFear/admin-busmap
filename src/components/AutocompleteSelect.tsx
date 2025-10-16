'use client';

import Select from 'react-select';
import styles from '../styles/AutocompleteSelect.module.css';

interface AutocompleteSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export default function AutocompleteSelect({ options, value, onChange, placeholder }: AutocompleteSelectProps) {
  const selectOptions = options.map((option) => ({
    value: option,
    label: option,
  }));

  return (
    <Select
      options={selectOptions}
      value={selectOptions.find((option) => option.value === value) || null}
      onChange={(selected) => onChange(selected ? selected.value : '')}
      placeholder={placeholder}
      className={styles.autocomplete}
      classNamePrefix="react-select"
      isClearable
      isSearchable
    />
  );
}