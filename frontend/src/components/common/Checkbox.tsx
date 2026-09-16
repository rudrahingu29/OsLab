import { type InputHTMLAttributes, forwardRef } from 'react';
import styles from './Checkbox.module.css';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  className = '',
  disabled,
  id,
  ...props
}, ref) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <label className={`${styles.wrapper} ${disabled ? styles.disabled : ''} ${className}`} htmlFor={checkboxId}>
      <input
        ref={ref}
        type="checkbox"
        id={checkboxId}
        className={styles.input}
        disabled={disabled}
        {...props}
      />
      <span className={styles.checkbox} />
      <span className={styles.label}>{label}</span>
    </label>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
