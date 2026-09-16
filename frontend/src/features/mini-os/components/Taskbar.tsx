import React, { useState, useRef, useEffect } from 'react';
import { useSimulationStore } from '../../../stores/simulationStore';
import { Search, ChevronRight, Activity, Monitor, AppWindow, Cpu, Zap, Clock } from 'lucide-react';
import { MiniOSIcon } from './MiniOSIcon';
import styles from './Taskbar.module.css';

interface WindowInstance {
  id: string;
  title: string;
  icon: string;
  isOpen: boolean;
  isMinimized: boolean;
}

interface TaskbarProps {
  onToggleApp: (id: string) => void;
  openWindows: WindowInstance[];
}

export const Taskbar: React.FC<TaskbarProps> = ({ onToggleApp, openWindows }) => {
  const { ticks, isRunning, processes } = useSimulationStore();
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const activeProcs = processes.filter(p => p.state !== 'TERMINATED');

  // Compute memory usage
  const totalMem = 4096;
  const usedMem = activeProcs.reduce((acc, pr) => acc + (pr.memoryRequired || 0), 256);
  const memPct = Math.round((usedMem / totalMem) * 100);

  // App definitions matching Desktop.tsx
  const appsList = [
    { id: 'browser', title: 'Web Browser', icon: 'browser', desc: 'Simulated internet browser' },
    { id: 'editor', title: 'Code Editor', icon: 'editor', desc: 'Write and run script programs' },
    { id: 'music', title: 'Music Player', icon: 'music', desc: 'Play simulated daemons' },
    { id: 'files', title: 'File Manager', icon: 'files', desc: 'Simulated storage inspector' },
    { id: 'notes', title: 'Text Editor', icon: 'notes', desc: 'Edit local text documents' },
    { id: 'compress', title: 'File Compressor', icon: 'compress', desc: 'Run disk-heavy zip compressions' },
    { id: 'tasks', title: 'Task Manager', icon: 'tasks', desc: 'Monitor active system processes' },
    { id: 'terminal', title: 'Terminal', icon: 'terminal', desc: 'Control via UNIX command line' },
  ];

  // Close start menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setStartMenuOpen(false);
      }
    };
    if (startMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [startMenuOpen]);

  const filteredApps = appsList.filter(app => 
    app.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    app.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartItemClick = (id: string) => {
    onToggleApp(id);
    setStartMenuOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={styles.taskbarWrapper}>
      {/* Floating Start Menu */}
      {startMenuOpen && (
        <div ref={menuRef} className={`${styles.startMenu} animate-fade-in`}>
          <div className={styles.startMenuLeft}>
            <div className={styles.systemHeader}>
              <Monitor size={20} className={styles.sysIcon} />
              <div>
                <div className={styles.sysTitle}>OSLab Virtual OS</div>
                <div className={styles.sysSubtitle}>State: Active</div>
              </div>
            </div>
            
            <div className={styles.searchBar}>
              <Search size={14} className={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Search applications..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
                autoFocus
              />
            </div>

            <div className={styles.menuScrollArea}>
              <div className={styles.sectionLabel}>
                {searchQuery ? 'Search Results' : 'Pinned Applications'}
              </div>
              <div className={styles.appsListStack}>
                {filteredApps.map(app => (
                  <button 
                    key={app.id} 
                    onClick={() => handleStartItemClick(app.id)}
                    className={styles.startMenuItem}
                  >
                    <span className={styles.startItemIcon}>
                      <MiniOSIcon name={app.icon} size={18} />
                    </span>
                    <div className={styles.startItemInfo}>
                      <span className={styles.startItemTitle}>{app.title}</span>
                      <span className={styles.startItemDesc}>{app.desc}</span>
                    </div>
                    <ChevronRight size={14} className={styles.itemArrow} />
                  </button>
                ))}
                {filteredApps.length === 0 && (
                  <div className={styles.noResults}>No applications match search</div>
                )}
              </div>
            </div>
          </div>
          
          <div className={styles.startMenuRight}>
            <div className={styles.sideStats}>
              <div className={styles.statLabel}>SIMULATOR STATS</div>
              <div className={styles.sideStatBlock}>
                <div className={styles.sideStatVal}>{ticks}</div>
                <div className={styles.sideStatName}>System Ticks</div>
              </div>
              <div className={styles.sideStatBlock}>
                <div className={styles.sideStatVal}>{activeProcs.length}</div>
                <div className={styles.sideStatName}>Active Tasks</div>
              </div>
              <div className={styles.sideStatBlock}>
                <div className={styles.sideStatVal}>{memPct}%</div>
                <div className={styles.sideStatName}>RAM Allocated</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Taskbar Row */}
      <div className={styles.taskbar}>
        <button 
          onClick={() => setStartMenuOpen(!startMenuOpen)} 
          className={`${styles.startButton} ${startMenuOpen ? styles.startButtonActive : ''}`}
        >
          <AppWindow size={16} />
          <span>OSLab OS</span>
        </button>

        <div className={styles.divider} />

        <div className={styles.apps}>
          {openWindows.map(win => (
            <button 
              key={win.id} 
              onClick={() => onToggleApp(win.id)}
              className={`${styles.appButton} ${!win.isMinimized ? styles.active : ''}`}
            >
              <MiniOSIcon name={win.icon} size={15} />
              <span className={styles.appTitle}>{win.title}</span>
            </button>
          ))}
        </div>

        <div className={styles.tray}>
          <span className={styles.trayStat}>
            <Activity size={12} className={isRunning ? styles.pulseGreen : ''} />
            {isRunning ? 'Running' : 'Paused'}
          </span>
          <span className={styles.trayStat}>
            <Cpu size={12} style={{ color: '#38bdf8' }} /> CPU: {activeProcs.length > 0 ? '42%' : '0%'}
          </span>
          <span className={styles.trayStat}>
            <Zap size={12} style={{ color: '#eab308' }} /> RAM: {memPct}%
          </span>
          <span className={styles.trayStat}>
            <Clock size={12} style={{ color: '#a855f7' }} /> Ticks: {ticks}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Taskbar;
