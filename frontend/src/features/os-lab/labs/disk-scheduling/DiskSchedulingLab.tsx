import React, { useState, useEffect } from 'react';
import LabLayout from '../../components/LabLayout';
import ExperimentControls from '../../components/ExperimentControls';
import { Card, Button, Modal, Table, Input, Select } from '../../../../components/common';
import MetricCard from '../../../../components/charts/MetricCard';
import { useLabStore, type SavedExperiment } from '../../../../stores/labStore';
import { useUIStore } from '../../../../stores/uiStore';
import { simulationService } from '../../../../services/simulationService';
import type { DiskSimulationResult } from '../../../../services/simulationService';
import { Save, Trash2, Disc3 } from 'lucide-react';
import styles from './DiskSchedulingLab.module.css';

export const DiskSchedulingLab: React.FC = () => {
  const [algorithm, setAlgorithm] = useState<'fcfs' | 'sstf' | 'scan' | 'cscan' | 'look' | 'clook'>('fcfs');
  const [requestsInput, setRequestsInput] = useState<string>('98, 183, 37, 122, 14, 124, 65, 67');
  const [initialHead, setInitialHead] = useState<number>(50);
  const [diskSize, setDiskSize] = useState<number>(200);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiskSimulationResult | null>(null);

  // Step-by-Step execution state
  const [isStepMode, setIsStepMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Persistence modal state
  const { experiments, loadExperiments, saveNewExperiment, deleteSavedExperiment } = useLabStore();
  const { addToast } = useUIStore();
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [savedListModalOpen, setSavedListModalOpen] = useState(false);
  const [expName, setExpName] = useState('');

  useEffect(() => {
    loadExperiments();
  }, [loadExperiments]);

  const executeSimulation = async () => {
    const reqArray = requestsInput
      .split(',')
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n) && n >= 0 && n < diskSize);

    if (reqArray.length === 0) {
      addToast('Please provide valid disk track requests within disk size range.', 'warning');
      return null;
    }

    return await simulationService.runDiskSimulation(
      algorithm,
      reqArray,
      initialHead,
      diskSize,
      direction
    );
  };

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const res = await executeSimulation();
      if (res) {
        setResults(res);
        setIsStepMode(false);
        if (res.steps.length > 0) {
          setCurrentStep(res.steps.length);
        }
        addToast(`Disk Scheduling Simulation completed (${algorithm.toUpperCase()}).`, 'success');
      }
    } catch (err: any) {
      addToast(err.message || 'Disk simulation failed.', 'error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleStepsClick = async () => {
    let res = results;
    if (!res) {
      setIsRunning(true);
      try {
        res = await executeSimulation();
        if (res) {
          setResults(res);
        }
      } catch (err: any) {
        addToast(err.message || 'Simulation failed.', 'error');
        setIsRunning(false);
        return;
      } finally {
        setIsRunning(false);
      }
    }
    if (res && res.steps.length > 0) {
      setIsStepMode(true);
      setCurrentStep(1);
      addToast('Step-by-Step mode activated for Disk Scheduling.', 'info');
    }
  };

  const handleNextStep = () => {
    if (!results) return;
    if (currentStep < results.steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleCompleteSteps = () => {
    if (!results) return;
    setCurrentStep(results.steps.length);
    setIsStepMode(false);
    addToast('Simulation fast-forwarded to full completion.', 'success');
  };

  const handleReset = () => {
    setIsRunning(false);
    setResults(null);
    setIsStepMode(false);
    setCurrentStep(1);
    addToast('Simulation results cleared.', 'info');
  };

  const handleSaveClick = () => {
    setExpName(`Disk ${algorithm.toUpperCase()} (Head=${initialHead}, ${requestsInput.split(',').length} reqs)`);
    setSaveModalOpen(true);
  };

  const handleConfirmSave = async () => {
    if (!expName.trim()) return;
    const saved = await saveNewExperiment({
      type: 'disk-scheduling',
      algorithm,
      input: { requestsInput, initialHead, diskSize, direction, name: expName },
      results
    });

    if (saved) {
      addToast(`Experiment "${expName}" saved to database!`, 'success');
      setSaveModalOpen(false);
    } else {
      addToast('Failed to save experiment.', 'error');
    }
  };

  const handleLoadSaved = (exp: SavedExperiment) => {
    if (exp.input) {
      if (exp.input.requestsInput) setRequestsInput(exp.input.requestsInput);
      if (exp.input.initialHead !== undefined) setInitialHead(exp.input.initialHead);
      if (exp.input.diskSize !== undefined) setDiskSize(exp.input.diskSize);
      if (exp.input.direction) setDirection(exp.input.direction);
      if (exp.algorithm) setAlgorithm(exp.algorithm as any);
      setResults(exp.results || null);
      setSavedListModalOpen(false);
      addToast(`Loaded experiment "${exp.input.name || exp.algorithm}".`, 'info');
    }
  };

  const getStepExplanation = (): string => {
    if (!results || results.steps.length === 0) return '';
    const idx = Math.min(currentStep - 1, results.steps.length - 1);
    const step = results.steps[idx];
    if (!step) return '';

    if (step.type === 'request') {
      return `Step ${step.step}: Disk head moves from Cylinder ${step.from} → ${step.to} (seek distance: ${step.distance} cylinders). Target cylinder ${step.to} reached and I/O request is serviced.`;
    }
    if (step.type === 'boundary') {
      return `Step ${step.step}: Disk head sweeps from Cylinder ${step.from} → ${step.to} (seek distance: ${step.distance} cylinders) reaching the physical boundary limit. Head changes direction.`;
    }
    return `Step ${step.step}: Circular Reset! Disk head wraps around from Cylinder ${step.from} → ${step.to} (seek distance: ${step.distance} cylinders) without servicing requests on the return path.`;
  };

  // Build SVG points for disk arm path chart
  const renderDiskArmChart = () => {
    if (!results || results.steps.length === 0) return null;

    const width = 600;
    const height = 240;
    const padding = 40;

    const pathPoints: { x: number; y: number; label: string; isBoundary?: boolean }[] = [];
    
    // Initial position
    const startX = padding + (initialHead / (diskSize - 1)) * (width - 2 * padding);
    const startY = padding;
    pathPoints.push({ x: startX, y: startY, label: `${initialHead}` });

    const totalSteps = results.steps.length;
    const visibleSteps = isStepMode ? results.steps.slice(0, currentStep) : results.steps;
    visibleSteps.forEach((step, idx) => {
      const x = padding + (step.to / (diskSize - 1)) * (width - 2 * padding);
      const y = padding + ((idx + 1) / totalSteps) * (height - 2 * padding);
      pathPoints.push({
        x,
        y,
        label: `${step.to}`,
        isBoundary: step.type === 'boundary' || step.type === 'wrap'
      });
    });

    const polylineStr = pathPoints.map(p => `${p.x},${p.y}`).join(' ');

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
        {/* Track Lines */}
        <line x1={padding} y1={padding - 15} x2={width - padding} y2={padding - 15} stroke="var(--color-border)" strokeDasharray="4 4" />
        <text x={padding} y={padding - 20} fill="var(--color-text-muted)" fontSize="10" textAnchor="middle">0</text>
        <text x={width - padding} y={padding - 20} fill="var(--color-text-muted)" fontSize="10" textAnchor="middle">{diskSize - 1}</text>

        {/* Head Movement Path */}
        <polyline points={polylineStr} fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinejoin="round" />

        {/* Data Nodes */}
        {pathPoints.map((pt, i) => (
          <g key={i}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={i === 0 ? 6 : 4.5}
              fill={i === 0 ? '#10b981' : pt.isBoundary ? '#ef4444' : '#3b82f6'}
              stroke="#fff"
              strokeWidth="1.5"
            />
            <text
              x={pt.x}
              y={pt.y - 8}
              fill="var(--color-text-primary)"
              fontSize="10"
              fontWeight="600"
              textAnchor="middle"
            >
              {pt.label}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  const visibleSteps = results ? (isStepMode ? results.steps.slice(0, currentStep) : results.steps) : [];

  return (
    <LabLayout
      title="Disk Scheduling & I/O Subsystem Lab"
      description="Simulate disk arm movement strategies across magnetic platter tracks to minimize seek latency."
      controls={
        <ExperimentControls
          onRun={handleRun}
          onReset={handleReset}
          onSave={handleSaveClick}
          onOpenSaved={() => setSavedListModalOpen(true)}
          isRunning={isRunning}
          isCompleted={!!results}
          isStepMode={isStepMode}
          currentStep={currentStep}
          totalSteps={results ? results.steps.length : 0}
          stepExplanation={getStepExplanation()}
          onStepsClick={handleStepsClick}
          onNextStep={handleNextStep}
          onPrevStep={handlePrevStep}
          onCompleteSteps={handleCompleteSteps}
        />
      }
    >
      <div className={styles.workspaceGrid}>
        
        {/* Left Column: Input Settings */}
        <Card className={styles.cardSection}>
          <div className={styles.sectionHeader}>
            <h2>Disk Parameters</h2>
          </div>

          <Select
            label="Disk Scheduling Algorithm"
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as any)}
            options={[
              { label: 'First-Come First-Served (FCFS)', value: 'fcfs' },
              { label: 'Shortest Seek Time First (SSTF)', value: 'sstf' },
              { label: 'SCAN (Elevator Algorithm)', value: 'scan' },
              { label: 'Circular SCAN (C-SCAN)', value: 'cscan' },
              { label: 'LOOK', value: 'look' },
              { label: 'Circular LOOK (C-LOOK)', value: 'clook' }
            ]}
          />

          <Input
            label="Request Track Queue (Comma Separated)"
            value={requestsInput}
            onChange={(e) => setRequestsInput(e.target.value)}
            placeholder="e.g. 98, 183, 37, 122, 14, 124, 65, 67"
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Input
              label="Initial Head Position"
              type="number"
              min={0}
              max={diskSize - 1}
              value={initialHead}
              onChange={(e) => setInitialHead(Number(e.target.value))}
            />
            <Input
              label="Total Disk Tracks"
              type="number"
              min={10}
              value={diskSize}
              onChange={(e) => setDiskSize(Number(e.target.value))}
            />
          </div>

          {(algorithm === 'scan' || algorithm === 'cscan' || algorithm === 'look' || algorithm === 'clook') && (
            <Select
              label="Initial Head Movement Direction"
              value={direction}
              onChange={(e) => setDirection(e.target.value as any)}
              options={[
                { label: 'Right (Towards higher track numbers)', value: 'right' },
                { label: 'Left (Towards track 0)', value: 'left' }
              ]}
            />
          )}
        </Card>

        {/* Right Column: Visualization & Results */}
        <div className={styles.cardSection}>
          {results ? (
            <Card className={styles.cardSection}>
              <div className={styles.sectionHeader}>
                <h2>Seek Path & Metrics ({results.algorithm})</h2>
              </div>

              {(!isStepMode || (results && currentStep === results.steps.length)) ? (
                <div className={styles.metricsGrid}>
                  <MetricCard label="Total Head Movement" value={`${results.metrics.totalHeadMovement} Cylinders`} />
                  <MetricCard label="Avg Seek Distance" value={`${results.metrics.averageSeekDistance} Cylinders`} />
                  <MetricCard label="Total Requests" value={results.metrics.totalRequests} />
                </div>
              ) : (
                <div style={{
                  padding: '0.85rem 1rem',
                  marginBottom: '1rem',
                  borderRadius: 'var(--border-radius-md)',
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: '1px dashed var(--color-border)',
                  textAlign: 'center',
                  color: 'var(--color-text-muted)',
                  fontSize: '0.85rem'
                }}>
                  Overall head movement metrics will finalize at the final step ({results.steps.length}).
                </div>
              )}

              {/* Disk Seek Path SVG Graph */}
              <div className={styles.chartContainer}>
                <div className={styles.chartHeader}>
                  <h3>Disk Arm Head Movement Graph</h3>
                </div>
                <div className={styles.svgBox}>
                  {renderDiskArmChart()}
                </div>
              </div>

              {/* Step Sequence Table */}
              <div className={styles.tableBox}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Seek Step Sequence Breakdown {isStepMode && `(Viewing up to Step ${currentStep} of ${results.steps.length})`}
                </h3>
                <Table>
                  <thead>
                    <tr>
                      <th>Step</th>
                      <th>From Track</th>
                      <th>To Track</th>
                      <th>Distance Traveled</th>
                      <th>Action Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleSteps.map((step) => (
                      <tr 
                        key={step.step}
                        style={isStepMode && step.step === currentStep ? { backgroundColor: 'var(--color-bg-secondary)', fontWeight: 600 } : undefined}
                      >
                        <td>#{step.step}</td>
                        <td>Track {step.from}</td>
                        <td>Track {step.to}</td>
                        <td>{step.distance} cylinders</td>
                        <td>
                          {step.type === 'request' ? (
                            <span style={{ color: '#3b82f6', fontWeight: 600 }}>Serviced Request</span>
                          ) : step.type === 'boundary' ? (
                            <span style={{ color: '#f59e0b', fontWeight: 600 }}>Disk Boundary Reached</span>
                          ) : (
                            <span style={{ color: '#ec4899', fontWeight: 600 }}>Circular Reset Wrap</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

            </Card>
          ) : (
            <Card className={styles.cardSection}>
              <div className={styles.noResultsBox}>
                <div className={styles.emptyIcon}>
                  <Disc3 size={40} color="var(--color-primary)" />
                </div>
                <h3>Ready for Disk Scheduling Simulation</h3>
                <p>Configure track request queue and initial head position, then click <strong>Run Experiment</strong>.</p>
              </div>
            </Card>
          )}
        </div>

      </div>

      {/* Save Experiment Modal */}
      <Modal isOpen={saveModalOpen} onClose={() => setSaveModalOpen(false)} title="Save Experiment">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Experiment Name"
            value={expName}
            onChange={(e) => setExpName(e.target.value)}
            placeholder="e.g. Disk SCAN Right Direction Test"
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button variant="ghost" onClick={() => setSaveModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleConfirmSave} leftIcon={<Save size={14} />}>Save</Button>
          </div>
        </div>
      </Modal>

      {/* Saved Experiments Picker Modal */}
      <Modal isOpen={savedListModalOpen} onClose={() => setSavedListModalOpen(false)} title="Saved Experiments">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
          {experiments.length > 0 ? (
            experiments.map((exp) => (
              <Card
                key={exp._id}
                variant="interactive"
                onClick={() => handleLoadSaved(exp)}
                style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {exp.input?.name || `${exp.algorithm} Experiment`}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Algorithm: {exp.algorithm}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteSavedExperiment(exp._id); }}
                  style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer' }}
                >
                  <Trash2 size={16} />
                </button>
              </Card>
            ))
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem 0' }}>No saved experiments found.</p>
          )}
        </div>
      </Modal>

    </LabLayout>
  );
};

export default DiskSchedulingLab;
