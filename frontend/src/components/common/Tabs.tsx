import React from 'react';
import styles from './Tabs.module.css';

interface TabOption {
  value: string;
  label: string;
}

interface TabsProps {
  options: TabOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({
  options,
  selectedValue,
  onChange,
  className = '',
}) => {
  return (
    <div className={`${styles.tabs} ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`${styles.tab} ${selectedValue === option.value ? styles.active : ''}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
