import React, { useState } from 'react';
import { useSimulationStore } from '../../../stores/simulationStore';
import styles from './AppContent.module.css';

export const CodeEditorApp: React.FC = () => {
  const { createProcess } = useSimulationStore();
  const [editorText, setEditorText] = useState(`// OS Simulation Experiment
#include <stdio.h>

int main() {
    printf("Welcome to OSLab Virtual Machine!\\n");
    return 0;
}`);

  const handleSave = () => {
    // Simulate Editor Write I/O (Disk I/O burst)
    createProcess(
      'Editor_Save',
      0,
      3, // CPU Burst
      2, // High Priority
      5, // Disk Write I/O burst
      80 // 80 MB Memory Required
    );
  };

  const handleCompile = () => {
    // CPU-intensive workload
    createProcess(
      'gcc_compiler',
      0,
      12, // heavy CPU burst
      3,  // Very high priority
      2,  // light I/O burst
      350 // 350 MB Memory Required
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <button onClick={handleSave} className={styles.btn}>Save File (Disk Write)</button>
        <button onClick={handleCompile} className={`${styles.btn} ${styles.btnSecondary}`}>Compile Code (CPU Burst)</button>
      </div>

      <div className={styles.content} style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <textarea
          value={editorText}
          onChange={(e) => setEditorText(e.target.value)}
          className={styles.editorArea}
          spellCheck={false}
        />
      </div>
      
      <div className={styles.infoBox}>
        <strong>Learning Tip:</strong> Saving files schedules a Disk Write request, blocking the editor (WAITING state) while the Disk I/O completes. Compilation requires substantial CPU operations, placing high demands on scheduler algorithms.
      </div>
    </div>
  );
};

export default CodeEditorApp;
