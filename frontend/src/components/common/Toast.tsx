import React from 'react';
import { useUIStore } from '../../stores/uiStore';
import styles from './Toast.module.css';

export const ToastContainer: React.FC = () => {
  const toasts = useUIStore((state) => state.toasts);
  const removeToast = useUIStore((state) => state.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <div 
          key={toast.id} 
          className={`${styles.toast} ${styles[toast.type]} animate-fade-in`}
          onClick={() => removeToast(toast.id)}
        >
          <span className={styles.message}>{toast.message}</span>
          <button className={styles.closeBtn}>&times;</button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
