import React from 'react';
import styles from './AlgorithmSelector.module.css';

interface AlgorithmSelectorProps {
  selected: string;
  onSelect: (alg: string) => void;
  algorithms: string[];
}

const AlgorithmSelector: React.FC<AlgorithmSelectorProps> = ({ selected, onSelect, algorithms }) => {
  return (
    <div className={styles.container}>
      <label className={styles.label}>Algorithm:</label>
      <select 
        value={selected} 
        onChange={(e) => onSelect(e.target.value)}
        className={styles.select}
      >
        {algorithms.map(alg => (
          <option key={alg} value={alg}>{alg}</option>
        ))}
      </select>
    </div>
  );
};

export default AlgorithmSelector;
