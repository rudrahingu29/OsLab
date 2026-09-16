import { type InputHTMLAttributes, forwardRef } from 'react';
import styles from './Toggle.module.css';

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

const Toggle = forwardRef<HTMLInputElement, ToggleProps>(({
  label,
  className = '',
  disabled,
  id,
  ...props
}, ref) => {
  const toggleId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <label className={`${styles.wrapper} ${disabled ? styles.disabled : ''} ${className}`} htmlFor={toggleId}>
      <input
        ref={ref}
        type="checkbox"
        id={toggleId}
        className={styles.input}
        disabled={disabled}
        {...props}
      />
      <span className={styles.slider} />
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
});

Toggle.displayName = 'Toggle';

export default Toggle;
