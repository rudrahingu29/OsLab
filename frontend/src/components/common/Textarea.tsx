import { type TextareaHTMLAttributes, forwardRef } from 'react';
import styles from './Textarea.module.css';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  className = '',
  disabled,
  id,
  rows = 3,
  ...props
}, ref) => {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`${styles.wrapper} ${disabled ? styles.disabled : ''} ${className}`}>
      {label && (
        <label htmlFor={textareaId} className={styles.label}>
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={`${styles.textarea} ${error ? styles.textareaError : ''}`}
        disabled={disabled}
        {...props}
      />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
