import React from 'react';
import { 
  Cpu, 
  Server, 
  ShieldCheck, 
  Terminal, 
  Activity, 
  GitBranch, 
  Network, 
  Share2, 
  Clock, 
  SlidersHorizontal, 
  KeyRound, 
  Lock, 
  Layers, 
  Grid3X3, 
  Database, 
  Disc, 
  FolderTree, 
  Cable, 
  Shield, 
  Boxes,
  BookOpen
} from 'lucide-react';

interface TopicIconProps {
  icon: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const TopicIcon: React.FC<TopicIconProps> = ({ icon, size = 18, className, style }) => {
  const getIconElement = () => {
    switch (icon) {
      case 'cpu':
        return <Cpu size={size} color="#3b82f6" />;
      case 'server':
        return <Server size={size} color="#10b981" />;
      case 'shield-check':
        return <ShieldCheck size={size} color="#8b5cf6" />;
      case 'terminal':
        return <Terminal size={size} color="#f59e0b" />;
      case 'activity':
        return <Activity size={size} color="#06b6d4" />;
      case 'git-branch':
        return <GitBranch size={size} color="#ec4899" />;
      case 'network':
        return <Network size={size} color="#6366f1" />;
      case 'share-2':
        return <Share2 size={size} color="#14b8a6" />;
      case 'clock':
        return <Clock size={size} color="#f97316" />;
      case 'sliders':
        return <SlidersHorizontal size={size} color="#a855f7" />;
      case 'key':
        return <KeyRound size={size} color="#eab308" />;
      case 'lock':
        return <Lock size={size} color="#ef4444" />;
      case 'layers':
        return <Layers size={size} color="#8b5cf6" />;
      case 'grid':
        return <Grid3X3 size={size} color="#3b82f6" />;
      case 'database':
        return <Database size={size} color="#0ea5e9" />;
      case 'disc':
        return <Disc size={size} color="#f43f5e" />;
      case 'folder-tree':
        return <FolderTree size={size} color="#eab308" />;
      case 'cable':
        return <Cable size={size} color="#10b981" />;
      case 'shield':
        return <Shield size={size} color="#6366f1" />;
      case 'boxes':
        return <Boxes size={size} color="#ec4899" />;
      default:
        return <BookOpen size={size} color="var(--color-primary)" />;
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
      {getIconElement()}
    </span>
  );
};

export default TopicIcon;
