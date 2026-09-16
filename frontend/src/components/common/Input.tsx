import { type InputHTMLAttributes, forwardRef } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  className = '',
  disabled,
  id,
  type = 'text',
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`${styles.wrapper} ${disabled ? styles.disabled : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        id={inputId}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        disabled={disabled}
        {...props}
      />
      {error && <span className={styles.errorText}>{error}</span>}
      {!error && helperText && <span className={styles.helperText}>{helperText}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
