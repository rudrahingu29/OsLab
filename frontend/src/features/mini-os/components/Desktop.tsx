import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSimulationStore } from '../../../stores/simulationStore';
import Taskbar from './Taskbar';
import SimulationControls from './SimulationControls';
import OSInspector from '../panels/OSInspector';
import AppIcon from './AppIcon';
import OSWindow from './OSWindow';
import {
  BrowserApp,
  CodeEditorApp,
  MusicPlayerApp,
  FileManagerApp,
  TextEditorApp,
  FileCompressorApp,
  TaskManagerApp,
  TerminalApp
} from '../apps';
import styles from './Desktop.module.css';

interface DesktopProps {
  mode: 'learning' | 'realism';
  onSwitchMode?: () => void;
}

interface WindowInstance {
  id: string;
  title: string;
  icon: string;
  isOpen: boolean;
  isMinimized: boolean;
  component: React.ReactNode;
}

export const Desktop: React.FC<DesktopProps> = ({ mode, onSwitchMode }) => {
  const { tick, isRunning } = useSimulationStore();
  const [searchParams] = useSearchParams();
  const scenario = searchParams.get('scenario');

  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const [focusStack, setFocusStack] = useState<string[]>([]);

  // Side Panel Resizing and Visibility state
  const [panelWidth, setPanelWidth] = useState<number>(440);
  const [isPanelHidden, setIsPanelHidden] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartPos = useRef<{ x: number; hasMoved: boolean }>({ x: 0, hasMoved: false });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    dragStartPos.current = { x: e.clientX, hasMoved: false };
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (Math.abs(e.clientX - dragStartPos.current.x) > 3) {
        dragStartPos.current.hasMoved = true;
      }
      // Desktop workArea margin/padding right is 16px
      const newWidth = window.innerWidth - e.clientX - 16;
      if (newWidth < 180) {
        setIsPanelHidden(true);
        setIsDragging(false);
      } else {
        const clampedWidth = Math.min(Math.max(newWidth, 260), window.innerWidth * 0.7);
        setPanelWidth(clampedWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);
  
  const [windows, setWindows] = useState<WindowInstance[]>([
    { id: 'browser', title: 'Web Browser', icon: 'browser', isOpen: false, isMinimized: false, component: <BrowserApp /> },
    { id: 'editor', title: 'Code Editor', icon: 'editor', isOpen: false, isMinimized: false, component: <CodeEditorApp /> },
    { id: 'music', title: 'Music Player', icon: 'music', isOpen: false, isMinimized: false, component: <MusicPlayerApp /> },
    { id: 'files', title: 'File Manager', icon: 'files', isOpen: false, isMinimized: false, component: <FileManagerApp /> },
    { id: 'notes', title: 'Text Editor', icon: 'notes', isOpen: false, isMinimized: false, component: <TextEditorApp /> },
    { id: 'compress', title: 'File Compressor', icon: 'compress', isOpen: false, isMinimized: false, component: <FileCompressorApp /> },
    { id: 'tasks', title: 'Task Manager', icon: 'tasks', isOpen: false, isMinimized: false, component: <TaskManagerApp /> },
    { id: 'terminal', title: 'Terminal', icon: 'terminal', isOpen: false, isMinimized: false, component: <TerminalApp /> },
  ]);

  // Simulation running loop
  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => {
      tick();
    }, 1000); // 1 tick per second
    return () => clearInterval(timer);
  }, [isRunning, tick]);

  // Boot in Scenario triggers
  useEffect(() => {
    if (scenario === 'process-creation') {
      openApp('terminal');
      openApp('tasks');
    } else if (scenario === 'process-lifecycle') {
      openApp('tasks');
      openApp('editor');
    }
  }, [scenario]);

  const openApp = (id: string) => {
    setWindows(prev => prev.map(w => {
      if (w.id === id) {
        return { ...w, isOpen: true, isMinimized: false };
      }
      return w;
    }));
    setActiveWindow(id);
    setFocusStack(prev => [...prev.filter(x => x !== id), id]);
  };

  const closeApp = (id: string) => {
    setWindows(prev => prev.map(w => {
      if (w.id === id) {
        return { ...w, isOpen: false };
      }
      return w;
    }));
    setFocusStack(prev => prev.filter(x => x !== id));
    if (activeWindow === id) {
      setActiveWindow(null);
    }
  };

  const minimizeApp = (id: string) => {
    setWindows(prev => prev.map(w => {
      if (w.id === id) {
        return { ...w, isMinimized: true };
      }
      return w;
    }));
    if (activeWindow === id) {
      setActiveWindow(null);
    }
  };

  const focusApp = (id: string) => {
    setWindows(prev => prev.map(w => {
      if (w.id === id && w.isMinimized) {
        return { ...w, isMinimized: false };
      }
      return w;
    }));
    setActiveWindow(id);
    setFocusStack(prev => [...prev.filter(x => x !== id), id]);
  };

  return (
    <div className={styles.desktop}>
      <div className={styles.workArea}>
        {/* Desktop Shortcut Grid */}
        <div className={styles.shortcutGrid}>
          {windows.map(app => (
            <AppIcon
              key={app.id}
              id={app.id}
              title={app.title}
              icon={app.icon}
              onDoubleClick={() => openApp(app.id)}
            />
          ))}
        </div>

        {/* Windows Rendering */}
        {windows.map((win, idx) => {
          const zIndexValue = 10 + focusStack.indexOf(win.id) * 5;
          return (
            <OSWindow
              key={win.id}
              title={win.title}
              icon={win.icon}
              isOpen={win.isOpen && !win.isMinimized}
              onClose={() => closeApp(win.id)}
              onMinimize={() => minimizeApp(win.id)}
              isActive={activeWindow === win.id}
              onFocus={() => focusApp(win.id)}
              zIndex={zIndexValue}
              defaultX={60 + idx * 30}
              defaultY={60 + idx * 25}
            >
              {win.component}
            </OSWindow>
          );
        })}

        {/* OS Inspector Side Panel with Sliderbar / Resizer */}
        {!isPanelHidden ? (
          <div
            className={`${styles.learningPanelWrapper} ${isDragging ? styles.resizerActive : ''}`}
            style={{ width: `${panelWidth}px` }}
          >
            {/* Attached Square Interactive Button: Drag to resize or Click to hide */}
            <button
              type="button"
              className={styles.squareToggleBtn}
              onMouseDown={handleMouseDown}
              onClick={(e) => {
                e.stopPropagation();
                if (!dragStartPos.current.hasMoved) {
                  setIsPanelHidden(true);
                }
              }}
              title="Click to hide panel, or drag to resize"
            >
              <ChevronRight size={18} />
            </button>

            {/* Vertical sliderbar resizer handle */}
            <div
              className={styles.resizerBar}
              onMouseDown={handleMouseDown}
              title="Drag to resize panel"
            >
              <div className={styles.resizerHandleGrip} />
            </div>

            <div className={styles.learningPanel}>
              <OSInspector mode={mode} />
            </div>
          </div>
        ) : (
          <button
            type="button"
            className={styles.showPanelFloatingBtn}
            onClick={() => setIsPanelHidden(false)}
            title="Show OS Inspector"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      <SimulationControls mode={mode} onSwitchMode={onSwitchMode} />
      <Taskbar onToggleApp={focusApp} openWindows={windows.filter(w => w.isOpen)} />
    </div>
  );
};

export default Desktop;
