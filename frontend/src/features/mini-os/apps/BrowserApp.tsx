import React, { useState } from 'react';
import { useSimulationStore } from '../../../stores/simulationStore';
import styles from './AppContent.module.css';

export const BrowserApp: React.FC = () => {
  const { createProcess } = useSimulationStore();
  const [url, setUrl] = useState('https://www.wikipedia.org');
  const [tabLogs, setTabLogs] = useState<string[]>(['Browser opened: welcome page.']);

  const handleGo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setTabLogs(prev => [...prev, `Visiting: ${url}...`]);
    // Simulate process workload: name, arrivalTime, burstTime, priority, ioBurstTime, memoryRequired
    createProcess(
      'WebBrowser_Tab',
      0, // immediately trigger next step (arrival relative to current tick)
      6, // CPU burst
      1, // Normal priority
      4, // Network I/O burst
      250 // 250 MB Memory Required
    );
  };

  const loadSample = (site: string) => {
    setUrl(site);
    setTabLogs(prev => [...prev, `Loading bookmark: ${site}`]);
    createProcess('WebBrowser_Fetch', 0, 4, 1, 6, 180);
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleGo} className={styles.toolbar}>
        <input 
          type="text" 
          value={url} 
          onChange={(e) => setUrl(e.target.value)} 
          className={styles.input}
          placeholder="Enter website URL..."
        />
        <button type="submit" className={styles.btn}>Go</button>
      </form>

      <div className={styles.toolbar} style={{ borderBottom: 'none', paddingBottom: 0 }}>
        <button type="button" onClick={() => loadSample('https://www.wikipedia.org')} className={`${styles.btn} ${styles.btnSecondary}`}>Wikipedia</button>
        <button type="button" onClick={() => loadSample('https://github.com')} className={`${styles.btn} ${styles.btnSecondary}`}>GitHub</button>
        <button type="button" onClick={() => loadSample('https://youtube.com')} className={`${styles.btn} ${styles.btnSecondary}`}>YouTube</button>
      </div>

      <div className={styles.content} style={{ gap: '10px' }}>
        <div className={styles.infoBox}>
          <strong>Learning Tip:</strong> Loading a webpage requires resolving the DNS, fetching files over the network (I/O burst), and rendering them via HTML engine (CPU burst). Clicking &quot;Go&quot; creates an OS process simulating this timeline.
        </div>
        <div className={styles.logContainer}>
          <h4 className={styles.logHeader}>Network &amp; Rendering Event Log:</h4>
          {tabLogs.map((log, idx) => (
            <div key={idx} className={styles.logRow}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BrowserApp;
