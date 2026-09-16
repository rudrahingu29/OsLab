import React, { useState, useEffect } from 'react';
import { Music, Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { useSimulationStore } from '../../../stores/simulationStore';
import styles from './AppContent.module.css';

const TRACKS = [
  { title: 'The Kernel Blues', duration: '3:45' },
  { title: 'Round Robin Shuffle', duration: '2:30' },
  { title: 'Deadlock Waltz', duration: '4:12' },
  { title: 'Virtual Memory Dream', duration: '5:02' }
];

export const MusicPlayerApp: React.FC = () => {
  const { createProcess, isRunning } = useSimulationStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIdx, setCurrentTrackIdx] = useState(0);
  const [playSeconds, setPlaySeconds] = useState(0);

  // Periodically generate audio buffer requests (I/O burst) when playing and sim runs
  useEffect(() => {
    if (!isPlaying || !isRunning) return;

    const timer = setInterval(() => {
      setPlaySeconds(s => s + 1);
      // Create a background process for audio decoding
      createProcess(
        'AudioDaemon',
        0,  // Arrival time
        1,  // Burst: short processing
        1,  // Priority 1
        6,  // Audio I/O burst: reading buffers
        60  // 60 MB Memory Required
      );
    }, 4000); // Trigger every 4s

    return () => clearInterval(timer);
  }, [isPlaying, isRunning, createProcess]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className={styles.container}>
      <div className={styles.cardPanel} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          background: 'rgba(236, 72, 153, 0.15)', 
          padding: '16px', 
          borderRadius: '12px' 
        }}>
          <Music size={32} color="#ec4899" />
        </div>
        <div style={{ flexGrow: 1 }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: 'var(--color-text-primary)' }}>{TRACKS[currentTrackIdx].title}</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>Status: {isPlaying ? 'Playing' : 'Paused'} | Track Time: {Math.floor(playSeconds / 60)}:{(playSeconds % 60).toString().padStart(2, '0')}</span>
          <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--color-border)', borderRadius: '2px', marginTop: '8px', overflow: 'hidden' }}>
            <div style={{ width: `${(playSeconds % 60) * 1.6}%`, height: '100%', backgroundColor: '#8b5cf6' }} />
          </div>
        </div>
      </div>

      <div className={styles.toolbar} style={{ justifyContent: 'center' }}>
        <button onClick={() => { setCurrentTrackIdx(idx => (idx - 1 + TRACKS.length) % TRACKS.length); setPlaySeconds(0); }} className={`${styles.btn} ${styles.btnSecondary}`}>
          <SkipBack size={14} />
        </button>
        <button onClick={togglePlay} className={styles.btn} style={{ backgroundColor: '#8b5cf6', width: '90px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          {isPlaying ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Play</>}
        </button>
        <button onClick={() => { setCurrentTrackIdx(idx => (idx + 1) % TRACKS.length); setPlaySeconds(0); }} className={`${styles.btn} ${styles.btnSecondary}`}>
          <SkipForward size={14} />
        </button>
      </div>

      <div className={styles.content}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Track List:</div>
        {TRACKS.map((t, idx) => (
          <div 
            key={idx} 
            onClick={() => { setCurrentTrackIdx(idx); setPlaySeconds(0); setIsPlaying(true); }}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              backgroundColor: idx === currentTrackIdx ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
              border: idx === currentTrackIdx ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid transparent',
              color: idx === currentTrackIdx ? 'var(--color-secondary)' : 'var(--color-text-primary)',
              fontWeight: idx === currentTrackIdx ? 600 : 400,
              fontSize: '0.85rem'
            }}
          >
            <span>{idx + 1}. {t.title}</span>
            <span>{t.duration}</span>
          </div>
        ))}
      </div>

      <div className={styles.infoBox} style={{ borderLeftColor: '#8b5cf6' }}>
        <strong>Learning Tip:</strong> Audio playback is time-sensitive (real-time). A decoder daemon process wakes up periodically, requests I/O blocks, and goes back to sleep. Dropped frames result in audio stuttering, showing why the scheduler must prioritize it.
      </div>
    </div>
  );
};

export default MusicPlayerApp;
