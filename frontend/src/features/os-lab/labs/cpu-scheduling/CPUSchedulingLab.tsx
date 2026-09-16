import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GanttChart from '../../../../components/charts/GanttChart';
import MetricCard from '../../../../components/charts/MetricCard';
import ProcessInputPanel from './ProcessInputPanel';
import LabLayout from '../../components/LabLayout';
import ExperimentControls from '../../components/ExperimentControls';
import { Card, Button, Modal, Table, Input, Select } from '../../../../components/common';
import { useLabStore, type SavedExperiment } from '../../../../stores/labStore';
import { useUIStore } from '../../../../stores/uiStore';
import { BookOpen, Save, Trash2, BarChart3 } from 'lucide-react';
import styles from './CPUSchedulingLab.module.css';
import { SchedulingCalculator } from '../../../../algorithms/scheduling/SchedulingCalculator';
import { FCFSScheduler, SJFScheduler, PriorityScheduler, RoundRobinScheduler } from '../../../../algorithms/scheduling';
import type { ProcessControlBlock, SchedulingResult } from '../../../../types/simulation';

const algorithmDescriptions: Record<string, { name: string; type: string; desc: string; learnSlug: string }> = {
  FCFS: {
    name: 'First Come First Serve (FCFS)',
    type: 'Non-preemptive',
    desc: 'Processes are dispatched strictly according to their arrival time in the ready queue. Simple, but vulnerable to the convoy effect.',
    learnSlug: 'cpu-scheduling'
  },
  SJF: {
    name: 'Shortest Job First (SJF)',
    type: 'Preemptive (SRTF)',
    desc: 'Selects the process with the smallest remaining CPU burst time. Minimizes average waiting time across all processes.',
    learnSlug: 'cpu-scheduling'
  },
  Priority: {
    name: 'Priority Scheduling',
    type: 'Preemptive',
    desc: 'Allocates CPU to the process with the highest priority rank (lowest numerical value). High-priority tasks execute first.',
    learnSlug: 'cpu-scheduling'
  },
  RR: {
    name: 'Round Robin (RR)',
    type: 'Preemptive',
    desc: 'Assigns each process a fixed CPU time slice (Quantum). Enables interactive multitasking and ensures equal fairness.',
    learnSlug: 'cpu-scheduling'
  }
};

export const CPUSchedulingLab: React.FC = () => {
  const [processes, setProcesses] = useState<ProcessControlBlock[]>([
    { id: 1, name: 'P1', state: 'NEW', arrivalTime: 0, burstTime: 6, priority: 2, remainingTime: 6, waitingTime: 0, turnaroundTime: 0, responseTime: 0, firstRunTime: null, completionTime: null, ioBurstTime: 0, ioRemainingTime: 0, memoryRequired: 64 },
    { id: 2, name: 'P2', state: 'NEW', arrivalTime: 1, burstTime: 3, priority: 1, remainingTime: 3, waitingTime: 0, turnaroundTime: 0, responseTime: 0, firstRunTime: null, completionTime: null, ioBurstTime: 0, ioRemainingTime: 0, memoryRequired: 64 },
    { id: 3, name: 'P3', state: 'NEW', arrivalTime: 2, burstTime: 4, priority: 3, remainingTime: 4, waitingTime: 0, turnaroundTime: 0, responseTime: 0, firstRunTime: null, completionTime: null, ioBurstTime: 0, ioRemainingTime: 0, memoryRequired: 64 }
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const [algorithm, setAlgorithm] = useState<string>('FCFS');
  const [quantum, setQuantum] = useState<number>(2);
  const [results, setResults] = useState<SchedulingResult | null>(null);

  // Step-by-Step execution state
  const [isStepMode, setIsStepMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Persistence Modal states
  const { experiments, loadExperiments, saveNewExperiment, deleteSavedExperiment } = useLabStore();
  const { addToast } = useUIStore();
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [savedListModalOpen, setSavedListModalOpen] = useState(false);
  const [expName, setExpName] = useState('');

  useEffect(() => {
    loadExperiments();
  }, [loadExperiments]);

  const computeSimulation = () => {
    let scheduler;
    switch (algorithm) {
      case 'SJF':
        scheduler = new SJFScheduler();
        break;
      case 'Priority':
        scheduler = new PriorityScheduler();
        break;
      case 'RR':
        scheduler = new RoundRobinScheduler(quantum);
        break;
      case 'FCFS':
      default:
        scheduler = new FCFSScheduler();
        break;
    }
    const procs = JSON.parse(JSON.stringify(processes));
    return SchedulingCalculator.calculate(scheduler, procs);
  };

  const handleRun = () => {
    if (processes.length === 0) {
      addToast('Please add at least one process to run the experiment.', 'warning');
      return;
    }
    setIsRunning(true);
    const res = computeSimulation();
    setResults(res);
    setIsStepMode(false);
    if (res.ganttChart.length > 0) {
      setCurrentStep(res.ganttChart.length);
    }
    setIsRunning(false);
    addToast(`Simulation completed using ${algorithm} algorithm.`, 'success');
  };

  const handleStepsClick = () => {
    if (processes.length === 0) {
      addToast('Please add at least one process to run step-by-step.', 'warning');
      return;
    }
    let res = results;
    if (!res) {
      res = computeSimulation();
      setResults(res);
    }
    setIsStepMode(true);
    setCurrentStep(1);
    addToast('Step-by-Step mode activated. Use Next / Previous to explore.', 'info');
  };

  const handleNextStep = () => {
    if (!results) return;
    if (currentStep < results.ganttChart.length) {
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
    setCurrentStep(results.ganttChart.length);
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

  const handleSaveExperimentClick = () => {
    if (processes.length === 0) {
      addToast('Configure processes before saving an experiment.', 'warning');
      return;
    }
    setExpName(`${algorithm} Experiment - ${processes.length} Processes`);
    setSaveModalOpen(true);
  };

  const handleConfirmSave = async () => {
    if (!expName.trim()) return;
    const saved = await saveNewExperiment({
      type: 'cpu-scheduling',
      algorithm,
      input: { processes, quantum, name: expName },
      results
    });

    if (saved) {
      addToast(`Experiment "${expName}" saved to MongoDB!`, 'success');
      setSaveModalOpen(false);
    } else {
      addToast('Failed to save experiment to database.', 'error');
    }
  };

  const handleLoadSavedExperiment = (exp: SavedExperiment) => {
    if (exp.input && exp.input.processes) {
      setProcesses(exp.input.processes);
      if (exp.algorithm) setAlgorithm(exp.algorithm);
      if (exp.input.quantum) setQuantum(exp.input.quantum);
      setResults(exp.results || null);
      setSavedListModalOpen(false);
      addToast(`Loaded experiment "${exp.input.name || exp.algorithm}".`, 'info');
    }
  };

  const handleDeleteSavedExperiment = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteSavedExperiment(id);
    addToast('Saved experiment deleted.', 'info');
  };

  const calculateTotalTime = (blocks: any[]) => {
    if (!blocks || blocks.length === 0) return 0;
    return blocks[blocks.length - 1].endTime;
  };

  const getStepExplanation = (): string => {
    if (!results || results.ganttChart.length === 0) return '';
    const idx = Math.min(currentStep - 1, results.ganttChart.length - 1);
    const block = results.ganttChart[idx];
    if (!block) return '';
    const duration = block.endTime - block.startTime;
    
    if (block.processId === null) {
      return `Timeline [${block.startTime}ms → ${block.endTime}ms]: CPU is IDLE for ${duration}ms because no ready process exists in the queue.`;
    }

    const proc = results.processes.find(p => p.id === block.processId) || processes.find(p => p.id === block.processId);
    const isCompleted = proc && proc.completionTime === block.endTime;

    if (isCompleted) {
      return `Timeline [${block.startTime}ms → ${block.endTime}ms]: Process P${block.processId} executes for ${duration}ms and completes its execution. (Completion: ${proc.completionTime}ms, TAT: ${proc.turnaroundTime}ms, WT: ${proc.waitingTime}ms).`;
    }

    return `Timeline [${block.startTime}ms → ${block.endTime}ms]: Process P${block.processId} executes for ${duration}ms under ${algorithm} policy before context-switching or yielding.`;
  };

  const currentAlgoMeta = algorithmDescriptions[algorithm] || algorithmDescriptions.FCFS;
  const visibleGantt = results ? (isStepMode ? results.ganttChart.slice(0, currentStep) : results.ganttChart) : [];
  const currentEndTime = visibleGantt.length > 0 ? visibleGantt[visibleGantt.length - 1].endTime : 0;
  const currentActivePid = visibleGantt.length > 0 ? visibleGantt[visibleGantt.length - 1].processId : null;

  // Show average metrics only if in full execution mode OR if user reached the final step
  const showAverageMetrics = !isStepMode || (results ? currentStep === results.ganttChart.length : false);

  // In step mode, add processes dynamically as they arrive or execute up to the current timeline step
  const visibleProcesses = results
    ? (isStepMode
        ? results.processes.filter(p => {
            const hasAppearedInGantt = visibleGantt.some(g => g.processId === p.id);
            const hasArrived = p.arrivalTime <= currentEndTime;
            return hasAppearedInGantt || hasArrived;
          })
        : results.processes)
    : [];

  return (
    <LabLayout 
      title="CPU Scheduling Laboratory"
      description="Configure process arrival times, burst cycles, and priority rankings to analyze scheduling metrics."
      controls={
        <ExperimentControls 
          onRun={handleRun}
          onReset={handleReset}
          onSave={handleSaveExperimentClick}
          onOpenSaved={() => setSavedListModalOpen(true)}
          isRunning={isRunning}
          isCompleted={!!results}
          isStepMode={isStepMode}
          currentStep={currentStep}
          totalSteps={results ? results.ganttChart.length : 0}
          stepExplanation={getStepExplanation()}
          onStepsClick={handleStepsClick}
          onNextStep={handleNextStep}
          onPrevStep={handlePrevStep}
          onCompleteSteps={handleCompleteSteps}
        />
      }
    >
      <div className={styles.workspaceGrid}>
        
        {/* Left Column: Configuration Panel */}
        <div className={styles.configCol}>
          <Card className={styles.cardSection}>
            <div className={styles.sectionHeader}>
              <h2>Scheduling Policy</h2>
            </div>
            
            <div className={styles.policyRow}>
              <Select 
                label="Algorithm" 
                value={algorithm} 
                onChange={(e) => setAlgorithm(e.target.value)}
                options={[
                  { label: 'First Come First Serve (FCFS)', value: 'FCFS' },
                  { label: 'Shortest Job First (SJF / SRTF)', value: 'SJF' },
                  { label: 'Priority Scheduling', value: 'Priority' },
                  { label: 'Round Robin (RR)', value: 'RR' }
                ]}
              />

              {algorithm === 'RR' && (
                <Input 
                  label="Time Quantum (ms)" 
                  type="number" 
                  min="1" 
                  value={quantum} 
                  onChange={(e) => setQuantum(Number(e.target.value))}
                />
              )}
            </div>

            {/* Algorithm Info Box */}
            <div className={styles.algoInfoBox}>
              <div className={styles.algoInfoHeader}>
                <span className={styles.algoName}>{currentAlgoMeta.name}</span>
                <span className={styles.algoTypeBadge}>{currentAlgoMeta.type}</span>
              </div>
              <p className={styles.algoDesc}>{currentAlgoMeta.desc}</p>
              <Link to={`/learn/${currentAlgoMeta.learnSlug}`} className={styles.learnLink}>
                <BookOpen size={12} />
                <span>Learn concept in depth →</span>
              </Link>
            </div>
          </Card>

          <Card className={styles.cardSection}>
            <ProcessInputPanel 
              processes={processes} 
              setProcesses={setProcesses} 
              showPriority={algorithm === 'Priority'} 
            />
          </Card>
        </div>

        {/* Right Column: Visualization & Results Panel */}
        <div className={styles.resultsCol}>
          <Card className={styles.cardSection}>
            <div className={styles.sectionHeader}>
              <h2>Simulation Timeline & Metrics</h2>
            </div>

            {results ? (
              <div className={styles.resultsWrapper}>
                
                {/* Gantt Chart Panel */}
                <div className={styles.ganttBox}>
                  <h3 className={styles.subHeading}>
                    Gantt Chart Execution Timeline {isStepMode && `(Step ${currentStep} of ${results.ganttChart.length} • Time: ${currentEndTime}ms)`}
                  </h3>
                  <GanttChart 
                    blocks={visibleGantt.map(block => ({
                      ...block,
                      processId: block.processId === null ? 'Idle' : `P${block.processId}`
                    }))} 
                    totalTime={calculateTotalTime(results.ganttChart)} 
                  />
                </div>

                {/* Overall Summary Metrics - Only displayed on full completion */}
                {showAverageMetrics ? (
                  <div className={styles.metricsGrid}>
                    <MetricCard label="Avg Turnaround Time" value={`${results.averageTurnaroundTime.toFixed(2)} ms`} />
                    <MetricCard label="Avg Waiting Time" value={`${results.averageWaitingTime.toFixed(2)} ms`} />
                    <MetricCard label="Avg Response Time" value={`${results.averageResponseTime.toFixed(2)} ms`} />
                  </div>
                ) : (
                  <div style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--border-radius-md)',
                    backgroundColor: 'var(--color-bg-secondary)',
                    border: '1px dashed var(--color-border)',
                    textAlign: 'center',
                    color: 'var(--color-text-muted)',
                    fontSize: '0.85rem'
                  }}>
                    Average metrics (Turnaround, Waiting, Response) will calculate when all processes finish at the final step.
                  </div>
                )}

                {/* Per-Process Detailed Metrics */}
                <div className={styles.detailsBox}>
                  <h3 className={styles.subHeading}>
                    Per-Process Breakdown {isStepMode && `(Step ${currentStep} of ${results.ganttChart.length})`}
                  </h3>
                  <Table>
                    <thead>
                      <tr>
                        <th>PID</th>
                        <th>Arrival</th>
                        <th>Burst</th>
                        {isStepMode && <th>Status</th>}
                        <th>Completion</th>
                        <th>Turnaround (TAT)</th>
                        <th>Waiting (WT)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleProcesses.length > 0 ? (
                        visibleProcesses.map(p => {
                          const isFinished = isStepMode ? (p.completionTime !== null && p.completionTime <= currentEndTime) : true;
                          const isCurrentRunning = isStepMode && currentActivePid === p.id && !isFinished;

                          return (
                            <tr 
                              key={p.id}
                              style={isCurrentRunning ? { backgroundColor: 'var(--color-bg-secondary)', fontWeight: 600 } : undefined}
                            >
                              <td className={styles.pidFont}>P{p.id}</td>
                              <td>{p.arrivalTime} ms</td>
                              <td>{p.burstTime} ms</td>
                              {isStepMode && (
                                <td>
                                  {isFinished ? (
                                    <span style={{ color: '#10b981', fontWeight: 600 }}>Completed</span>
                                  ) : isCurrentRunning ? (
                                    <span style={{ color: '#3b82f6', fontWeight: 600 }}>Running CPU</span>
                                  ) : (
                                    <span style={{ color: '#f59e0b', fontWeight: 600 }}>In Ready Queue</span>
                                  )}
                                </td>
                              )}
                              <td>{isFinished ? `${p.completionTime} ms` : (isCurrentRunning ? 'Executing...' : '-')}</td>
                              <td>{isFinished ? `${p.turnaroundTime} ms` : '-'}</td>
                              <td>{isFinished ? `${p.waitingTime} ms` : '-'}</td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={isStepMode ? 7 : 6} style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '1rem' }}>
                            No processes have arrived at this timeline mark ({currentEndTime}ms).
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>

              </div>
            ) : (
              <div className={styles.noResultsBox}>
                <div className={styles.emptyIcon}>
                  <BarChart3 size={40} color="var(--color-primary)" />
                </div>
                <h3>Ready to Simulate</h3>
                <p>Configure process queue on the left and click <strong>Run Experiment</strong> to view the Gantt chart and calculated turnaround metrics.</p>
              </div>
            )}
          </Card>
        </div>

      </div>

      {/* Save Experiment Modal */}
      <Modal isOpen={saveModalOpen} onClose={() => setSaveModalOpen(false)} title="Save Experiment Configuration">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input 
            label="Experiment Name" 
            value={expName} 
            onChange={e => setExpName(e.target.value)} 
            placeholder="e.g. Round Robin Quantum=2 Test"
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
            <Button variant="ghost" onClick={() => setSaveModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleConfirmSave} leftIcon={<Save size={14} />}>Save to MongoDB</Button>
          </div>
        </div>
      </Modal>

      {/* Saved Experiments Picker Modal */}
      <Modal isOpen={savedListModalOpen} onClose={() => setSavedListModalOpen(false)} title="Saved Experiments">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
          {experiments.length > 0 ? (
            experiments.map(exp => (
              <Card 
                key={exp._id} 
                variant="interactive" 
                onClick={() => handleLoadSavedExperiment(exp)}
                style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                    {exp.input?.name || `${exp.algorithm} Experiment`}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                    Algorithm: {exp.algorithm} • Saved {new Date(exp.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <button 
                  onClick={(e) => handleDeleteSavedExperiment(exp._id, e)}
                  style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', padding: '4px' }}
                  title="Delete experiment"
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

export default CPUSchedulingLab;
