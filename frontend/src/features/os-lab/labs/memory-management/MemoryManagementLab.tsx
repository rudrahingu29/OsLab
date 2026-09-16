import React, { useState, useEffect } from 'react';
import LabLayout from '../../components/LabLayout';
import ExperimentControls from '../../components/ExperimentControls';
import { Card, Button, Modal, Table, Input, Select } from '../../../../components/common';
import MetricCard from '../../../../components/charts/MetricCard';
import { useLabStore, type SavedExperiment } from '../../../../stores/labStore';
import { useUIStore } from '../../../../stores/uiStore';
import { simulationService } from '../../../../services/simulationService';
import type { MemorySimulationResult, PagingSimulationResult, MemoryBlockInput, MemoryProcessInput } from '../../../../services/simulationService';
import { Plus, Trash2, Save, Layers, HardDrive, Cpu, FileSpreadsheet } from 'lucide-react';
import styles from './MemoryManagementLab.module.css';

export const MemoryManagementLab: React.FC = () => {
  const [subMode, setSubMode] = useState<'partition' | 'paging'>('partition');
  const [isRunning, setIsRunning] = useState(false);

  // Step-by-Step execution state
  const [isStepMode, setIsStepMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Partition mode state
  const [partitionAlgorithm, setPartitionAlgorithm] = useState<'first-fit' | 'best-fit' | 'worst-fit' | 'next-fit'>('first-fit');
  const [blocks, setBlocks] = useState<MemoryBlockInput[]>([
    { id: 1, size: 100 },
    { id: 2, size: 500 },
    { id: 3, size: 200 },
    { id: 4, size: 300 },
    { id: 5, size: 600 }
  ]);
  const [processes, setProcesses] = useState<MemoryProcessInput[]>([
    { id: 1, size: 212 },
    { id: 2, size: 417 },
    { id: 3, size: 112 },
    { id: 4, size: 426 }
  ]);
  const [partitionResult, setPartitionResult] = useState<MemorySimulationResult | null>(null);

  // Paging mode state
  const [pagingAlgorithm, setPagingAlgorithm] = useState<'fifo' | 'lru' | 'optimal'>('fifo');
  const [refStringInput, setRefStringInput] = useState<string>('7, 0, 1, 2, 0, 3, 0, 4, 2, 3, 0, 3, 2, 1, 2, 0, 1, 7, 0, 1');
  const [frameCount, setFrameCount] = useState<number>(3);
  const [pagingResult, setPagingResult] = useState<PagingSimulationResult | null>(null);

  // Persistence modal state
  const { experiments, loadExperiments, saveNewExperiment, deleteSavedExperiment } = useLabStore();
  const { addToast } = useUIStore();
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [savedListModalOpen, setSavedListModalOpen] = useState(false);
  const [expName, setExpName] = useState('');

  useEffect(() => {
    loadExperiments();
  }, [loadExperiments]);

  const executePartitionSimulation = async () => {
    return await simulationService.runMemorySimulation(partitionAlgorithm, blocks, processes);
  };

  const executePagingSimulation = async () => {
    const refArray = refStringInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    return await simulationService.runPagingSimulation(pagingAlgorithm, refArray, frameCount);
  };

  const handleRun = async () => {
    setIsRunning(true);
    try {
      if (subMode === 'partition') {
        const res = await executePartitionSimulation();
        setPartitionResult(res);
        setIsStepMode(false);
        if (res.allocations.length > 0) {
          setCurrentStep(res.allocations.length);
        }
        addToast(`Memory Partition Simulation completed (${partitionAlgorithm}).`, 'success');
      } else {
        const res = await executePagingSimulation();
        setPagingResult(res);
        setIsStepMode(false);
        if (res.steps.length > 0) {
          setCurrentStep(res.steps.length);
        }
        addToast(`Page Replacement Simulation completed (${pagingAlgorithm.toUpperCase()}).`, 'success');
      }
    } catch (err: any) {
      addToast(err.message || 'Simulation failed to run.', 'error');
    } finally {
      setIsRunning(false);
    }
  };

  const totalSteps = subMode === 'partition'
    ? (partitionResult ? partitionResult.allocations.length : processes.length)
    : (pagingResult ? pagingResult.steps.length : refStringInput.split(',').filter(s => s.trim()).length);

  const handleStepsClick = async () => {
    setIsRunning(true);
    try {
      if (subMode === 'partition') {
        let res = partitionResult;
        if (!res) {
          res = await executePartitionSimulation();
          setPartitionResult(res);
        }
        setIsStepMode(true);
        setCurrentStep(1);
        addToast('Step-by-Step mode activated for Contiguous Memory Allocation.', 'info');
      } else {
        let res = pagingResult;
        if (!res) {
          res = await executePagingSimulation();
          setPagingResult(res);
        }
        setIsStepMode(true);
        setCurrentStep(1);
        addToast('Step-by-Step mode activated for Page Replacement.', 'info');
      }
    } catch (err: any) {
      addToast(err.message || 'Failed to start step mode.', 'error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleNextStep = () => {
    const max = subMode === 'partition'
      ? (partitionResult ? partitionResult.allocations.length : 0)
      : (pagingResult ? pagingResult.steps.length : 0);
    if (currentStep < max) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleCompleteSteps = () => {
    const max = subMode === 'partition'
      ? (partitionResult ? partitionResult.allocations.length : 0)
      : (pagingResult ? pagingResult.steps.length : 0);
    setCurrentStep(max);
    setIsStepMode(false);
    addToast('Simulation fast-forwarded to full completion.', 'success');
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsStepMode(false);
    setCurrentStep(1);
    if (subMode === 'partition') {
      setPartitionResult(null);
    } else {
      setPagingResult(null);
    }
    addToast('Simulation results cleared.', 'info');
  };

  const getStepExplanation = (): string => {
    if (subMode === 'partition') {
      if (!partitionResult || partitionResult.allocations.length === 0) return '';
      const idx = Math.min(currentStep - 1, partitionResult.allocations.length - 1);
      const alloc = partitionResult.allocations[idx];
      if (!alloc) return '';
      if (alloc.allocated) {
        return `Step ${idx + 1}: Process P${alloc.id} (size: ${alloc.requestedSize} KB) evaluated under ${partitionResult.algorithm}. Successfully allocated to Block ${alloc.allocatedBlockId}.`;
      } else {
        return `Step ${idx + 1}: Process P${alloc.id} (size: ${alloc.requestedSize} KB) evaluated under ${partitionResult.algorithm}. No single free partition is large enough. Process must wait.`;
      }
    } else {
      if (!pagingResult || pagingResult.steps.length === 0) return '';
      const idx = Math.min(currentStep - 1, pagingResult.steps.length - 1);
      const s = pagingResult.steps[idx];
      if (!s) return '';
      if (s.hit) {
        return `Step ${s.step}: CPU requests Page ${s.reference}. Page is already present in physical frame (PAGE HIT). No secondary storage swap required.`;
      } else if (s.replacedPage !== undefined && s.replacedPage !== null) {
        return `Step ${s.step}: CPU requests Page ${s.reference}. PAGE FAULT occurred! All frames are full. Page ${s.replacedPage} is evicted under ${pagingResult.algorithm.toUpperCase()} policy and Page ${s.reference} is loaded.`;
      } else {
        return `Step ${s.step}: CPU requests Page ${s.reference}. PAGE FAULT occurred! An empty frame was available, so Page ${s.reference} was loaded without replacement.`;
      }
    }
  };

  const handleSaveClick = () => {
    setExpName(
      subMode === 'partition'
        ? `Memory Partition (${partitionAlgorithm})`
        : `Paging ${pagingAlgorithm.toUpperCase()} (${frameCount} frames)`
    );
    setSaveModalOpen(true);
  };

  const handleConfirmSave = async () => {
    if (!expName.trim()) return;
    const saved = await saveNewExperiment({
      type: subMode === 'partition' ? 'memory-allocation' : 'page-replacement',
      algorithm: subMode === 'partition' ? partitionAlgorithm : pagingAlgorithm,
      input: subMode === 'partition' ? { blocks, processes, name: expName } : { refStringInput, frameCount, name: expName },
      results: subMode === 'partition' ? partitionResult : pagingResult
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
      if (exp.type === 'memory-allocation') {
        setSubMode('partition');
        if (exp.input.blocks) setBlocks(exp.input.blocks);
        if (exp.input.processes) setProcesses(exp.input.processes);
        if (exp.algorithm) setPartitionAlgorithm(exp.algorithm as any);
        setPartitionResult(exp.results || null);
      } else {
        setSubMode('paging');
        if (exp.input.refStringInput) setRefStringInput(exp.input.refStringInput);
        if (exp.input.frameCount) setFrameCount(exp.input.frameCount);
        if (exp.algorithm) setPagingAlgorithm(exp.algorithm as any);
        setPagingResult(exp.results || null);
      }
      setSavedListModalOpen(false);
      addToast(`Loaded experiment "${exp.input.name || exp.algorithm}".`, 'info');
    }
  };

  const addBlock = () => {
    const nextId = blocks.length > 0 ? Math.max(...blocks.map(b => Number(b.id))) + 1 : 1;
    setBlocks([...blocks, { id: nextId, size: 200 }]);
  };

  const removeBlock = (id: string | number) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const updateBlockSize = (id: string | number, size: number) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, size: Math.max(1, size) } : b));
  };

  const addProcess = () => {
    const nextId = processes.length > 0 ? Math.max(...processes.map(p => Number(p.id))) + 1 : 1;
    setProcesses([...processes, { id: nextId, size: 150 }]);
  };

  const removeProcess = (id: string | number) => {
    setProcesses(processes.filter(p => p.id !== id));
  };

  const updateProcessSize = (id: string | number, size: number) => {
    setProcesses(processes.map(p => p.id === id ? { ...p, size: Math.max(1, size) } : p));
  };

  const visibleAllocations = partitionResult
    ? (isStepMode ? partitionResult.allocations.slice(0, currentStep) : partitionResult.allocations)
    : [];

  const visiblePagingSteps = pagingResult
    ? (isStepMode ? pagingResult.steps.slice(0, currentStep) : pagingResult.steps)
    : [];

  return (
    <LabLayout
      title="Memory Management & Virtual Memory Lab"
      description="Simulate Contiguous Memory Partition Allocation and Page Replacement algorithms with interactive visual metrics."
      controls={
        <ExperimentControls
          onRun={handleRun}
          onReset={handleReset}
          onSave={handleSaveClick}
          onOpenSaved={() => setSavedListModalOpen(true)}
          isRunning={isRunning}
          isCompleted={!!(partitionResult || pagingResult)}
          isStepMode={isStepMode}
          currentStep={currentStep}
          totalSteps={totalSteps}
          stepExplanation={getStepExplanation()}
          onStepsClick={handleStepsClick}
          onNextStep={handleNextStep}
          onPrevStep={handlePrevStep}
          onCompleteSteps={handleCompleteSteps}
        />
      }
    >
      <div className={styles.workspaceGrid}>
        
        {/* Left Column: Configuration Controls */}
        <div className={styles.inputGroup}>
          <Card className={styles.cardSection}>
            <div className={styles.modeToggle}>
              <button
                className={`${styles.modeBtn} ${subMode === 'partition' ? styles.modeBtnActive : ''}`}
                onClick={() => {
                  setSubMode('partition');
                  setIsStepMode(false);
                  setCurrentStep(1);
                }}
              >
                <HardDrive size={14} style={{ display: 'inline', marginRight: 4 }} />
                Contiguous Allocation
              </button>
              <button
                className={`${styles.modeBtn} ${subMode === 'paging' ? styles.modeBtnActive : ''}`}
                onClick={() => {
                  setSubMode('paging');
                  setIsStepMode(false);
                  setCurrentStep(1);
                }}
              >
                <Layers size={14} style={{ display: 'inline', marginRight: 4 }} />
                Page Replacement
              </button>
            </div>

            {subMode === 'partition' ? (
              <>
                <Select
                  label="Allocation Algorithm"
                  value={partitionAlgorithm}
                  onChange={(e) => setPartitionAlgorithm(e.target.value as any)}
                  options={[
                    { label: 'First Fit', value: 'first-fit' },
                    { label: 'Best Fit', value: 'best-fit' },
                    { label: 'Worst Fit', value: 'worst-fit' },
                    { label: 'Next Fit', value: 'next-fit' }
                  ]}
                />

                <div className={styles.inputGroup}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Memory Blocks (KB)</span>
                    <Button variant="ghost" size="sm" onClick={addBlock} leftIcon={<Plus size={12} />}>
                      Add Block
                    </Button>
                  </div>
                  <div className={styles.inputList}>
                    {blocks.map(b => (
                      <div key={b.id} className={styles.inputRow}>
                        <label>Block {b.id}</label>
                        <Input
                          type="number"
                          value={b.size}
                          onChange={(e) => updateBlockSize(b.id, Number(e.target.value))}
                        />
                        <button className={styles.deleteBtn} onClick={() => removeBlock(b.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.inputGroup} style={{ marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Process Requests (KB)</span>
                    <Button variant="ghost" size="sm" onClick={addProcess} leftIcon={<Plus size={12} />}>
                      Add Process
                    </Button>
                  </div>
                  <div className={styles.inputList}>
                    {processes.map(p => (
                      <div key={p.id} className={styles.inputRow}>
                        <label>Process {p.id}</label>
                        <Input
                          type="number"
                          value={p.size}
                          onChange={(e) => updateProcessSize(p.id, Number(e.target.value))}
                        />
                        <button className={styles.deleteBtn} onClick={() => removeProcess(p.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <Select
                  label="Page Replacement Algorithm"
                  value={pagingAlgorithm}
                  onChange={(e) => setPagingAlgorithm(e.target.value as any)}
                  options={[
                    { label: 'First In First Out (FIFO)', value: 'fifo' },
                    { label: 'Least Recently Used (LRU)', value: 'lru' },
                    { label: 'Optimal Page Replacement', value: 'optimal' }
                  ]}
                />

                <Input
                  label="Page Reference String (Comma Separated)"
                  value={refStringInput}
                  onChange={(e) => setRefStringInput(e.target.value)}
                  placeholder="e.g. 7, 0, 1, 2, 0, 3, 0, 4"
                />

                <Input
                  label="Number of Page Frames"
                  type="number"
                  min={1}
                  max={8}
                  value={frameCount}
                  onChange={(e) => setFrameCount(Math.max(1, Number(e.target.value)))}
                />
              </>
            )}
          </Card>
        </div>

        {/* Right Column: Visualization Panel */}
        <div className={styles.resultsCol}>
          {subMode === 'partition' ? (
            partitionResult ? (
              <Card className={styles.cardSection}>
                <div className={styles.sectionHeader}>
                  <h2>Memory Block Allocation Overview ({partitionResult.algorithm})</h2>
                </div>

                {(!isStepMode || currentStep === partitionResult.allocations.length) ? (
                  <div className={styles.metricsGrid}>
                    <MetricCard label="Total Memory" value={`${partitionResult.metrics.totalMemory} KB`} />
                    <MetricCard label="Allocated Memory" value={`${partitionResult.metrics.totalAllocatedMemory} KB`} />
                    <MetricCard label="Free Memory" value={`${partitionResult.metrics.totalFreeMemory} KB`} />
                    <MetricCard label="Internal Frag." value={`${partitionResult.metrics.internalFragmentation} KB`} />
                    <MetricCard label="External Frag." value={`${partitionResult.metrics.externalFragmentation} KB`} />
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
                    Overall fragmentation and allocation metrics will finalize at the final step ({partitionResult.allocations.length}).
                  </div>
                )}

                {/* Visual Block Representation */}
                <div className={styles.blocksVisual}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0, marginBottom: '0.5rem' }}>
                    Block Occupation Map
                  </h3>
                  {partitionResult.blocks.map((block) => {
                    const allocatedProcText = block.allocatedProcessIds.length > 0
                      ? block.allocatedProcessIds.map(p => `P${p}`).join(', ')
                      : 'Free';
                    const used = block.initialSize - block.remainingSize;
                    const usedPct = ((used / block.initialSize) * 100).toFixed(1);

                    return (
                      <div key={block.id} className={styles.blockRow}>
                        <div className={styles.blockLabel}>
                          <span>Block {block.id} (Capacity: {block.initialSize} KB)</span>
                          <span>Allocated: {used} KB ({usedPct}%)</span>
                        </div>
                        <div className={styles.blockTrack}>
                          {used > 0 && (
                            <div className={styles.allocatedChunk} style={{ width: `${usedPct}%` }}>
                              {allocatedProcText} ({used} KB)
                            </div>
                          )}
                          <div className={styles.freeChunk}>
                            Free: {block.remainingSize} KB
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Allocation Table */}
                <div style={{ marginTop: '0.5rem' }}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Process Allocation Status Table {isStepMode && `(Viewing Process 1 to ${currentStep} of ${partitionResult.allocations.length})`}
                  </h3>
                  <Table>
                    <thead>
                      <tr>
                        <th>Process</th>
                        <th>Requested Size</th>
                        <th>Status</th>
                        <th>Assigned Block</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleAllocations.map((alloc, idx) => (
                        <tr 
                          key={alloc.id}
                          style={isStepMode && idx === currentStep - 1 ? { backgroundColor: 'var(--color-bg-secondary)', fontWeight: 600 } : undefined}
                        >
                          <td>P{alloc.id}</td>
                          <td>{alloc.requestedSize} KB</td>
                          <td>
                            {alloc.allocated ? (
                              <span style={{ color: '#10b981', fontWeight: 600 }}>Allocated</span>
                            ) : (
                              <span style={{ color: '#ef4444', fontWeight: 600 }}>Not Allocated (Must Wait)</span>
                            )}
                          </td>
                          <td>{alloc.allocatedBlockId !== null ? `Block ${alloc.allocatedBlockId}` : '-'}</td>
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
                    <Cpu size={40} color="var(--color-primary)" />
                  </div>
                  <h3>Ready for Partition Simulation</h3>
                  <p>Configure memory blocks and process requests on the left, then click <strong>Run Experiment</strong>.</p>
                </div>
              </Card>
            )
          ) : (
            pagingResult ? (
              <Card className={styles.cardSection}>
                <div className={styles.sectionHeader}>
                  <h2>Page Replacement Step Matrix ({pagingResult.algorithm})</h2>
                </div>

                {(!isStepMode || currentStep === pagingResult.steps.length) ? (
                  <div className={styles.metricsGrid}>
                    <MetricCard label="Total References" value={pagingResult.metrics.totalReferences} />
                    <MetricCard label="Page Hits" value={pagingResult.metrics.pageHits} />
                    <MetricCard label="Page Faults" value={pagingResult.metrics.pageFaults} />
                    <MetricCard label="Hit Ratio" value={`${(pagingResult.metrics.hitRatio * 100).toFixed(1)}%`} />
                    <MetricCard label="Fault Ratio" value={`${(pagingResult.metrics.faultRatio * 100).toFixed(1)}%`} />
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
                    Overall page hit and fault metrics will calculate at the final step ({pagingResult.steps.length}).
                  </div>
                )}

                {/* Matrix Step visualization */}
                <div className={styles.pagingTable}>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0, marginBottom: '0.75rem' }}>
                    Frame Allocation Sequence {isStepMode && `(Step ${currentStep} of ${pagingResult.steps.length})`}
                  </h3>
                  <div className={styles.pagingMatrix}>
                    {visiblePagingSteps.map((s) => (
                      <div 
                        key={s.step} 
                        className={styles.stepColumn}
                        style={isStepMode && s.step === currentStep ? { outline: '2px solid var(--color-primary)', borderRadius: '6px' } : undefined}
                      >
                        <div className={styles.stepHeader}>#{s.step}</div>
                        <div className={styles.pageRefBox}>{s.reference}</div>
                        {s.frames.map((frame, fIdx) => (
                          <div key={fIdx} className={styles.frameCell}>
                            {frame !== null ? frame : '-'}
                          </div>
                        ))}
                        {s.hit ? (
                          <div className={styles.hitBadge}>HIT</div>
                        ) : (
                          <div className={styles.faultBadge}>FAULT</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ) : (
              <Card className={styles.cardSection}>
                <div className={styles.noResultsBox}>
                  <div className={styles.emptyIcon}>
                    <FileSpreadsheet size={40} color="var(--color-primary)" />
                  </div>
                  <h3>Ready for Page Replacement Simulation</h3>
                  <p>Configure page reference sequence and frame count, then click <strong>Run Experiment</strong>.</p>
                </div>
              </Card>
            )
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
            placeholder="e.g. Memory First-Fit 5 Blocks Test"
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
                    Type: {exp.type} • Algorithm: {exp.algorithm}
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

export default MemoryManagementLab;
