import React from 'react';
import { useSearchParams } from 'react-router-dom';
import Desktop from '../components/Desktop';
import ModeSelector from '../components/ModeSelector';
import styles from './MiniOSPage.module.css';

const MiniOSPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawMode = searchParams.get('mode');
  const mode: 'learning' | 'realism' | null = (rawMode === 'learning' || rawMode === 'realism') ? rawMode : null;

  const handleSelectMode = (newMode: 'learning' | 'realism') => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('mode', newMode);
    setSearchParams(newParams);
  };

  const handleSwitchMode = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('mode');
    setSearchParams(newParams);
  };

  if (!mode) {
    return <ModeSelector onSelectMode={handleSelectMode} />;
  }

  return (
    <div className={styles.container}>
      <Desktop mode={mode} onSwitchMode={handleSwitchMode} />
    </div>
  );
};

export default MiniOSPage;
