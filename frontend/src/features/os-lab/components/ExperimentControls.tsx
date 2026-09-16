import React from 'react';
import { Button, StatusBadge } from '../../../components/common';
import { 
  Play, 
  RotateCcw, 
  Save, 
  FolderOpen, 
  Footprints, 
  ChevronLeft, 
  ChevronRight, 
  FastForward,
  Info
} from 'lucide-react';
import styles from './ExperimentControls.module.css';

export interface ExperimentControlsProps {
  onRun: () => void;
  onStepsClick: () => void;
  onNextStep?: () => void;
  onPrevStep?: () => void;
  onCompleteSteps?: () => void;
  onReset: () => void;
  onSave?: () => void;
  onOpenSaved?: () => void;
  isRunning?: boolean;
  isCompleted?: boolean;
  isStepMode?: boolean;
  currentStep?: number;
  totalSteps?: number;
  stepExplanation?: string;
}

export const ExperimentControls: React.FC<ExperimentControlsProps> = ({ 
  onRun, 
  onStepsClick,
  onNextStep,
  onPrevStep,
  onCompleteSteps,
  onReset, 
  onSave,
  onOpenSaved,
  isRunning = false,
  isCompleted = false,
  isStepMode = false,
  currentStep = 0,
  totalSteps = 0,
  stepExplanation
}) => {
  const currentStatus = isRunning ? 'RUNNING' : isStepMode ? 'STEPPING' : isCompleted ? 'COMPLETED' : 'READY';

  return (
    <div className={styles.container}>
      <div className={styles.controlsRow}>
        <div className={styles.statusIndicator}>
          <span className={styles.statusLabel}>Status:</span>
          <StatusBadge status={currentStatus === 'STEPPING' ? 'RUNNING' : currentStatus} />
        </div>

        <div className={styles.actionButtons}>
          <Button 
            onClick={onRun} 
            variant="primary" 
            leftIcon={<Play size={14} />}
            disabled={isRunning}
          >
            {isCompleted ? 'Re-run Experiment' : 'Run Experiment'}
          </Button>

          {(isCompleted || isStepMode) && (
            <Button 
              onClick={onStepsClick} 
              variant={isStepMode ? 'primary' : 'secondary'} 
              leftIcon={<Footprints size={14} />}
              style={isStepMode ? { background: '#8b5cf6', borderColor: '#7c3aed' } : undefined}
            >
              Steps
            </Button>
          )}

          <Button onClick={onReset} variant="ghost" leftIcon={<RotateCcw size={14} />}>
            Reset
          </Button>

          {onSave && (
            <Button onClick={onSave} variant="secondary" leftIcon={<Save size={14} />}>
              Save
            </Button>
          )}

          {onOpenSaved && (
            <Button onClick={onOpenSaved} variant="ghost" leftIcon={<FolderOpen size={14} />}>
              Saved Experiments
            </Button>
          )}
        </div>
      </div>

      {/* Step-by-Step Interactive Navigation & Explanation Toolbar */}
      {isStepMode && totalSteps > 0 && (
        <div className={styles.stepToolbar}>
          <div className={styles.stepControls}>
            <Button 
              size="sm" 
              variant="secondary" 
              onClick={onPrevStep} 
              disabled={currentStep <= 1}
              leftIcon={<ChevronLeft size={14} />}
            >
              Previous
            </Button>

            <span className={styles.stepCounter}>
              Step <strong>{currentStep}</strong> of <strong>{totalSteps}</strong>
            </span>

            <Button 
              size="sm" 
              variant="primary" 
              onClick={onNextStep} 
              disabled={currentStep >= totalSteps}
              rightIcon={<ChevronRight size={14} />}
            >
              Next Step
            </Button>

            {onCompleteSteps && currentStep < totalSteps && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={onCompleteSteps}
                leftIcon={<FastForward size={14} />}
                style={{ fontSize: '0.8rem' }}
              >
                Fast-Forward All
              </Button>
            )}
          </div>

          {stepExplanation && (
            <div className={styles.stepExplanationBox}>
              <Info size={16} className={styles.infoIcon} />
              <div className={styles.stepExplanationText}>{stepExplanation}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExperimentControls;
