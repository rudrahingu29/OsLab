import React, { useState, useRef, useEffect } from 'react';
import { useSimulationStore } from '../../../stores/simulationStore';
import styles from './TerminalApp.module.css';

export const TerminalApp: React.FC = () => {
  const { processes, ticks, isRunning, engine } = useSimulationStore();
  const [history, setHistory] = useState<string[]>([
    'OSLab Terminal Shell v1.0.0',
    'Type "help" for a list of available system commands.',
    ''
  ]);
  const [inputVal, setInputVal] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const command = inputVal.trim();
    if (!command) return;

    setHistory(prev => [...prev, `$ ${command}`]);
    const parts = command.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case 'help':
        setHistory(prev => [
          ...prev,
          'Available Commands:',
          '  help      - Display this help message',
          '  clear     - Clear the terminal screen',
          '  ps        - List active processes in Process Table',
          '  ls        - List directory contents in simulated file system',
          '  pwd       - Print simulated working directory',
          '  mkdir     - Create a folder (e.g. mkdir project)',
          '  touch     - Create an empty text file (e.g. touch file.txt)',
          '  kill      - Terminate a process by PID (e.g. kill 2)',
          '  memory    - Check RAM partition details',
          '  cpu       - Check CPU status and clock tick count',
          '  status    - General OS status'
        ]);
        break;
      case 'clear':
        setHistory([]);
        break;
      case 'ps': {
        const active = processes.filter(p => p.state !== 'TERMINATED');
        if (active.length === 0) {
          setHistory(prev => [...prev, 'No active processes.']);
        } else {
          setHistory(prev => [
            ...prev,
            'PID\tNAME\t\tSTATE\t\tMEMORY',
            ...active.map(p => `${p.id}\t${p.name.padEnd(12)}\t${p.state.padEnd(10)}\t${p.memoryRequired} MB`)
          ]);
        }
        break;
      }
      case 'ls': {
        const files = engine.fileSystem.listDirectory('/home/user');
        setHistory(prev => [
          ...prev,
          ...files.map((f: any) => `${f.type === 'directory' ? '[DIR] ' : '[FILE]'} ${f.name.padEnd(16)} (${f.size} B)`)
        ]);
        break;
      }
      case 'pwd':
        setHistory(prev => [...prev, '/home/user']);
        break;
      case 'mkdir':
        if (!args[0]) {
          setHistory(prev => [...prev, 'Error: mkdir expects a directory name.']);
        } else {
          engine.fileSystem.createDirectory(`/home/user/${args[0]}`);
          setHistory(prev => [...prev, `Directory /home/user/${args[0]} created.`]);
        }
        break;
      case 'touch':
        if (!args[0]) {
          setHistory(prev => [...prev, 'Error: touch expects a file name.']);
        } else {
          engine.fileSystem.createFile(`/home/user/${args[0]}`, 'Empty file.');
          setHistory(prev => [...prev, `File /home/user/${args[0]} created.`]);
        }
        break;
      case 'kill': {
        const pid = parseInt(args[0], 10);
        if (isNaN(pid)) {
          setHistory(prev => [...prev, 'Error: kill expects a valid PID.']);
        } else {
          const p = engine.processManager.getProcess(pid);
          if (p) {
            p.setState('TERMINATED');
            engine.cpu.removeProcess(pid);
            // Sync React store state
            useSimulationStore.setState({
              processes: engine.processManager.getAllProcesses().map(pr => pr.clone())
            });
            setHistory(prev => [...prev, `Process ${pid} killed.`]);
          } else {
            setHistory(prev => [...prev, `Error: Process with PID ${pid} not found.`]);
          }
        }
        break;
      }
      case 'memory': {
        const total = 4096;
        const used = processes
          .filter(p => p.state !== 'TERMINATED')
          .reduce((acc, p) => acc + (p.memoryRequired || 0), 256);
        setHistory(prev => [
          ...prev,
          `RAM CAPACITY: ${total} MB`,
          `SYSTEM RESERVED (KERNEL): 256 MB`,
          `ALLOCATED FOR APPS: ${used - 256} MB`,
          `FREE MEMORY: ${total - used} MB`
        ]);
        break;
      }
      case 'cpu':
        setHistory(prev => [
          ...prev,
          `SYSTEM TICK COUNTER: ${ticks} ms`,
          `SIMULATION CLOCK STATUS: ${isRunning ? 'Running' : 'Paused'}`
        ]);
        break;
      case 'status':
        setHistory(prev => [
          ...prev,
          '--- OSLAB SYSTEM REPORT ---',
          `Uptime: ${ticks} ticks`,
          `Active Tasks: ${processes.filter(p => p.state !== 'TERMINATED').length}`,
          `Total RAM usage: ${processes.filter(p => p.state !== 'TERMINATED').reduce((acc, p) => acc + (p.memoryRequired || 0), 256)} MB`
        ]);
        break;
      default:
        setHistory(prev => [...prev, `sh: command not found: ${cmd}`]);
    }

    setInputVal('');
  };

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  return (
    <div className={styles.terminalContainer}>
      <div className={styles.output}>
        {history.map((line, idx) => (
          <div key={idx} className={styles.line}>{line}</div>
        ))}
        <div ref={terminalEndRef} />
      </div>
      <form onSubmit={handleCommand} className={styles.inputForm}>
        <span className={styles.prompt}>$</span>
        <input 
          type="text" 
          value={inputVal} 
          onChange={(e) => setInputVal(e.target.value)} 
          className={styles.input}
          autoFocus
        />
      </form>
    </div>
  );
};

export default TerminalApp;
