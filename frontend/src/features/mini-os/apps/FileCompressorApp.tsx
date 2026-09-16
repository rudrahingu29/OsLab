import React, { useState, useEffect } from 'react';
import { Folder } from 'lucide-react';
import { useSimulationStore } from '../../../stores/simulationStore';
import styles from './AppContent.module.css';

export const FileCompressorApp: React.FC = () => {
  const { createProcess, isRunning } = useSimulationStore();
  const [compressing, setCompressing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleCompress = () => {
    setCompressing(true);
    setProgress(0);
    // Simulate process workload: name, arrivalTime, burstTime, priority, ioBurstTime, memoryRequired
    createProcess(
      'Zip_Compressor',
      0,
      10, // Medium-high CPU burst
      1,  // Normal priority
      8,  // Disk I/O burst (reading files, writing zip)
      120 // 120 MB Memory
    );
  };

  useEffect(() => {
    if (!compressing || !isRunning) return;
    
    // Increment fake progress on ticks
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          setCompressing(false);
          return 100;
        }
        return p + 10;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [compressing, isRunning]);

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <button 
          onClick={handleCompress} 
          disabled={compressing}
          className={styles.btn}
        >
          {compressing ? 'Compressing...' : 'Compress /home/user/ (ZIP)'}
        </button>
      </div>

      <div className={styles.content} style={{ gap: '16px' }}>
        {compressing ? (
          <div className={styles.cardPanel}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>Compression in Progress</h4>
            <div style={{ width: '100%', height: '16px', backgroundColor: 'var(--color-border)', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
              <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#ef4444', transition: 'width 0.3s ease' }} />
              <span style={{ position: 'absolute', width: '100%', textAlign: 'center', left: 0, top: 0, fontSize: '0.75rem', fontWeight: 600, color: '#f8fafc', lineHeight: '16px' }}>
                {progress}%
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
              Reading directory tree...<br/>
              Processing blocks...<br/>
              Writing archive...
            </div>
          </div>
        ) : (
          <div className={styles.cardPanel} style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '4px', color: 'var(--color-text-primary)', fontWeight: 600 }}>
              <Folder size={16} color="#eab308" /> Directory size: 45.2 MB
            </div><br/>
            Click button above to compress files.
          </div>
        )}

        <div className={styles.infoBox} style={{ borderLeftColor: '#ef4444' }}>
          <strong>Learning Tip:</strong> Compression tools read data from disk (Disk Read I/O), run compression algorithms (Heavy CPU computations), and write output zip file back to disk (Disk Write I/O). The OS scheduler must allocate resource cycles evenly.
        </div>
      </div>
    </div>
  );
};

export default FileCompressorApp;
