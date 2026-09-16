import React, { useState, useEffect } from 'react';
import { Folder, FileText, CornerLeftUp } from 'lucide-react';
import { useSimulationStore } from '../../../stores/simulationStore';
import styles from './AppContent.module.css';

export const FileManagerApp: React.FC = () => {
  const { engine, createProcess } = useSimulationStore();
  const [currentPath, setCurrentPath] = useState<string[]>([ 'home', 'user' ]);
  const [contents, setContents] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileData, setFileData] = useState<string | null>(null);

  // Sync with actual filesystem simulation
  const refresh = () => {
    const list = engine.fileSystem.listDirectory('/' + currentPath.join('/'));
    setContents(list);
    setSelectedFile(null);
    setFileData(null);
  };

  useEffect(() => {
    refresh();
  }, [currentPath]);

  const navigateToDir = (name: string) => {
    if (name === '..') {
      setCurrentPath(prev => prev.slice(0, -1));
    } else {
      setCurrentPath(prev => [...prev, name]);
    }
  };

  const handleReadFile = (fileName: string) => {
    setSelectedFile(fileName);
    // Simulate process
    createProcess(
      'Disk_Read_File',
      0,
      2, // CPU burst
      1, // Normal priority
      4, // Disk Read I/O burst
      40 // 40 MB Memory
    );

    // Fetch the file contents from simulated FileSystem
    const path = '/' + [...currentPath, fileName].join('/');
    const node = engine.fileSystem.getFile(path);
    if (node) {
      setFileData(node.content || 'Empty file.');
    } else {
      setFileData('Could not read file contents.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <button 
          onClick={() => navigateToDir('..')} 
          disabled={currentPath.length === 0}
          className={`${styles.btn} ${styles.btnSecondary}`}
        >
          ⬆ Up
        </button>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontStyle: 'monospace' }}>
          Path: /{currentPath.join('/')}
        </span>
      </div>

      <div className={styles.content} style={{ display: 'flex', flexDirection: 'row', gap: '16px' }}>
        <div style={{ flexGrow: 1, border: '1px solid var(--color-border)', borderRadius: '6px', overflowY: 'auto', backgroundColor: 'var(--color-surface)' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Size</th>
              </tr>
            </thead>
            <tbody>
              {currentPath.length > 0 && (
                <tr onClick={() => navigateToDir('..')} style={{ cursor: 'pointer' }}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CornerLeftUp size={14} color="var(--color-text-muted)" /> ..
                  </td>
                  <td>Parent Directory</td>
                  <td>-</td>
                </tr>
              )}
              {contents.map((item, idx) => (
                <tr 
                  key={idx} 
                  onClick={() => item.isDir ? navigateToDir(item.name) : handleReadFile(item.name)}
                  style={{ cursor: 'pointer' }}
                >
                  <td style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {item.isDir ? <Folder size={14} color="#eab308" /> : <FileText size={14} color="var(--color-primary)" />}
                    <span style={{ color: 'var(--color-text-primary)' }}>{item.name}</span>
                  </td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{item.isDir ? 'Directory' : 'File'}</td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{item.isDir ? '-' : `${item.size} bytes`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedFile && (
          <div className={styles.cardPanel} style={{ width: '240px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: 'var(--color-text-primary)' }}>File Preview</h4>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              <strong>Name:</strong> {selectedFile}<br/>
              <strong>Type:</strong> Text Document
            </div>
            <hr style={{ border: 'none', borderBottom: '1px solid var(--color-border)', margin: '4px 0' }}/>
            <div style={{ flexGrow: 1, backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', padding: '8px', fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--color-text-primary)', borderRadius: '4px', overflowY: 'auto', whiteSpace: 'pre-wrap' }}>
              {fileData || 'Loading content...'}
            </div>
          </div>
        )}
      </div>

      <div className={styles.infoBox}>
        <strong>Learning Tip:</strong> Browsing files uses memory tables to map files to nodes. Opening a file performs a Disk Read I/O block, mimicking physical block-level seek times.
      </div>
    </div>
  );
};

export default FileManagerApp;
