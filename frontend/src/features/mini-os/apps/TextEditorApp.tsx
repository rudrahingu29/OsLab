import React, { useState } from 'react';
import { useSimulationStore } from '../../../stores/simulationStore';
import styles from './AppContent.module.css';

export const TextEditorApp: React.FC = () => {
  const { engine, createProcess } = useSimulationStore();
  const [fileName, setFileName] = useState('notes.txt');
  const [text, setText] = useState('Type your notepad content here...');
  const [status, setStatus] = useState<string | null>(null);

  const handleSave = () => {
    if (!fileName) return;
    
    // Save to actual filesystem model
    const path = `/home/user/${fileName}`;
    engine.fileSystem.createFile(path, text);
    
    // Simulate process
    createProcess(
      'Notepad_Write',
      0,
      2,  // CPU burst
      1,  // Normal
      5,  // Disk Write I/O burst
      30  // 30 MB Memory
    );

    setStatus(`Saved to ${path} successfully!`);
    setTimeout(() => setStatus(null), 3000);
  };

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Save as:</span>
        <input 
          type="text" 
          value={fileName} 
          onChange={(e) => setFileName(e.target.value)} 
          className={styles.input}
          style={{ flexGrow: 0, width: '150px' }}
        />
        <button onClick={handleSave} className={styles.btn}>Save File</button>
        {status && <span style={{ fontSize: '0.8rem', color: 'var(--color-success)', marginLeft: 'auto' }}>{status}</span>}
      </div>

      <div className={styles.content} style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className={styles.editorArea}
          style={{ fontFamily: 'inherit' }}
        />
      </div>

      <div className={styles.infoBox}>
        <strong>Learning Tip:</strong> Text editors are interactive. Modifying documents triggers light CPU bursts to render typography. Saving performs a disk write system call, writing blocks of sectors on disk.
      </div>
    </div>
  );
};

export default TextEditorApp;
