import { type SelectHTMLAttributes, forwardRef } from 'react';
import styles from './Select.module.css';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Array<{ value: string | number; label: string }>;
  error?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  options,
  error,
  className = '',
  disabled,
  id,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`${styles.wrapper} ${disabled ? styles.disabled : ''} ${className}`}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
        </label>
      )}
      <div className={styles.selectContainer}>
        <select
          ref={ref}
          id={selectId}
          className={`${styles.select} ${error ? styles.selectError : ''}`}
          disabled={disabled}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className={styles.arrow} />
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
