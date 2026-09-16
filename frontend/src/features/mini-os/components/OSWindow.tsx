import React, { useState, useRef, useEffect } from 'react';
import { Minus, Square, Copy, X } from 'lucide-react';
import { MiniOSIcon } from './MiniOSIcon';
import styles from './OSWindow.module.css';

interface OSWindowProps {
  title: string;
  icon: string;
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
  isActive: boolean;
  onFocus: () => void;
  children: React.ReactNode;
  defaultX?: number;
  defaultY?: number;
  defaultWidth?: number;
  defaultHeight?: number;
  zIndex?: number;
}

export const OSWindow: React.FC<OSWindowProps> = ({
  title,
  icon,
  isOpen,
  onClose,
  onMinimize,
  isActive,
  onFocus,
  children,
  defaultX = 50,
  defaultY = 50,
  defaultWidth = 600,
  defaultHeight = 400,
  zIndex,
}) => {
  const [position, setPosition] = useState({ x: defaultX, y: defaultY });
  const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight });
  const [isMaximized, setIsMaximized] = useState(false);
  const [preMaxState, setPreMaxState] = useState({ x: defaultX, y: defaultY, w: defaultWidth, h: defaultHeight });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const windowRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return;
    
    // Ignore if clicking on title actions
    if ((e.target as HTMLElement).closest(`.${styles.actions}`)) {
      return;
    }

    onFocus();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    // Boundary checks: keep title bar visible inside the workspace
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    setPosition({
      x: Math.max(-size.width + 100, Math.min(window.innerWidth - 50, newX)),
      y: Math.max(0, Math.min(window.innerHeight - 150, newY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, position]);

  if (!isOpen) return null;

  const toggleMaximize = () => {
    if (isMaximized) {
      setPosition({ x: preMaxState.x, y: preMaxState.y });
      setSize({ width: preMaxState.w, height: preMaxState.h });
      setIsMaximized(false);
    } else {
      setPreMaxState({ x: position.x, y: position.y, w: size.width, h: size.height });
      setPosition({ x: 0, y: 0 });
      setIsMaximized(true);
    }
    onFocus();
  };

  const windowStyle: React.CSSProperties = isMaximized
    ? {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: zIndex ?? (isActive ? 100 : 10),
      }
    : {
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        zIndex: zIndex ?? (isActive ? 100 : 10),
      };

  return (
    <div
      ref={windowRef}
      className={`${styles.window} ${isActive ? styles.active : ''} ${isMaximized ? styles.maximized : ''}`}
      style={windowStyle}
      onClick={onFocus}
      onMouseDown={onFocus}
    >
      <div 
        className={styles.titleBar}
        onMouseDown={handleMouseDown}
        onDoubleClick={toggleMaximize}
      >
        <div className={styles.titleInfo}>
          <span className={styles.icon}>
            <MiniOSIcon name={icon} size={15} />
          </span>
          <span className={styles.titleText}>{title}</span>
        </div>
        <div className={styles.actions} onMouseDown={(e) => e.stopPropagation()}>
          <button 
            className={`${styles.actionBtn} ${styles.minimize}`} 
            onClick={(e) => { e.stopPropagation(); onMinimize(); }}
            title="Minimize"
          >
            <Minus size={12} />
          </button>
          <button 
            className={`${styles.actionBtn} ${styles.maximize}`} 
            onClick={(e) => { e.stopPropagation(); toggleMaximize(); }}
            title={isMaximized ? "Restore" : "Maximize"}
          >
            {isMaximized ? <Copy size={12} /> : <Square size={10} />}
          </button>
          <button 
            className={`${styles.actionBtn} ${styles.close}`} 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            title="Close"
          >
            <X size={12} />
          </button>
        </div>
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  );
};

export default OSWindow;
