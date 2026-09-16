import React from 'react';
import { 
  Globe, 
  Code2, 
  Music, 
  FolderArchive, 
  FileEdit, 
  Archive, 
  Activity, 
  Terminal, 
  Folder, 
  FileText, 
  Cpu, 
  Zap, 
  Clock, 
  AppWindow 
} from 'lucide-react';

interface MiniOSIconProps {
  name: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const MiniOSIcon: React.FC<MiniOSIconProps> = ({ name, size = 18, className, style }) => {
  const getIcon = () => {
    switch (name) {
      case 'browser':
        return <Globe size={size} color="#38bdf8" />;
      case 'editor':
        return <Code2 size={size} color="#a855f7" />;
      case 'music':
        return <Music size={size} color="#ec4899" />;
      case 'files':
        return <FolderArchive size={size} color="#eab308" />;
      case 'notes':
        return <FileEdit size={size} color="#3b82f6" />;
      case 'compress':
        return <Archive size={size} color="#f97316" />;
      case 'tasks':
        return <Activity size={size} color="#10b981" />;
      case 'terminal':
        return <Terminal size={size} color="#22c55e" />;
      case 'folder':
        return <Folder size={size} color="#eab308" />;
      case 'file':
        return <FileText size={size} color="#94a3b8" />;
      case 'cpu':
        return <Cpu size={size} color="#38bdf8" />;
      case 'ram':
        return <Zap size={size} color="#eab308" />;
      case 'ticks':
        return <Clock size={size} color="#a855f7" />;
      default:
        return <AppWindow size={size} color="#38bdf8" />;
    }
  };

  return (
    <span 
      className={className} 
      style={{ 
        display: 'inline-flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        ...style 
      }}
    >
      {getIcon()}
    </span>
  );
};

export default MiniOSIcon;
