import React, { useState, useRef, useEffect } from 'react';
import { Card } from '../../../components/common';
import type { AdminUser, AdminQuestion, AdminAnnouncement, SimulationStat } from '../types';
import { Terminal } from 'lucide-react';
import styles from '../AdminPage.module.css';

interface AdminTerminalProps {
  users: AdminUser[];
  questions: AdminQuestion[];
  announcements: AdminAnnouncement[];
  simStats: SimulationStat[];
  onAddAnnouncement: (a: Omit<AdminAnnouncement, 'id' | 'createdAt'>) => void;
  onClearStats?: () => void;
}

interface CommandHistoryItem {
  id: string;
  command: string;
  output: React.ReactNode;
  time: string;
}

export const AdminTerminal: React.FC<AdminTerminalProps> = ({
  users,
  questions,
  announcements,
  simStats,
  onAddAnnouncement,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<CommandHistoryItem[]>([
    {
      id: 'init-1',
      command: 'system --status',
      output: (
        <div style={{ color: 'var(--color-primary)' }}>
          OSLab Kernel v2.4.0 (x86_64-oslab-admin) initialized.<br />
          Type <span style={{ color: 'var(--color-warning)' }}>help</span> to list all administrative commands.
        </div>
      ),
      time: new Date().toLocaleTimeString(),
    },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = inputVal.trim();
    if (!raw) return;

    const parts = raw.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    let output: React.ReactNode = null;

    switch (cmd) {
      case 'help':
        output = (
          <div className={styles.terminalHelpTable}>
            <div><strong>help</strong>: Display this command index</div>
            <div><strong>users</strong>: List registered students & staff accounts</div>
            <div><strong>stats</strong>: Output summary metrics and simulation totals</div>
            <div><strong>quizzes</strong>: List questions count per topic</div>
            <div><strong>broadcast &lt;message&gt;</strong>: Send urgent broadcast to students</div>
            <div><strong>health</strong>: Verify backend services, DB latency & kernel</div>
            <div><strong>whoami</strong>: Display current root administrator identity</div>
            <div><strong>clear</strong>: Wipe terminal scrollback history</div>
          </div>
        );
        break;

      case 'users':
        output = (
          <div className={styles.terminalOutputTable}>
            <div className={styles.termRowHeader}>
              <span>NAME</span>
              <span>ROLE</span>
              <span>PROGRESS</span>
              <span>STATUS</span>
            </div>
            {users.map((u) => (
              <div key={u.id} className={styles.termRow}>
                <span>{u.name}</span>
                <span style={{ color: u.role === 'admin' ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                  {u.role.toUpperCase()}
                </span>
                <span>{u.progress}%</span>
                <span style={{ color: u.status === 'active' ? 'var(--color-success)' : 'var(--color-error)' }}>
                  {u.status}
                </span>
              </div>
            ))}
          </div>
        );
        break;

      case 'stats':
        const totalRuns = simStats.reduce((a, b) => a + b.runsCount, 0);
        output = (
          <div>
            <div>[+] Total Users: {users.length} ({users.filter((u) => u.role === 'student').length} students)</div>
            <div>[+] Total Simulation Runs: {totalRuns}</div>
            <div>[+] Active Quizzes: {questions.length} questions</div>
            <div>[+] Active Announcements: {announcements.filter((a) => a.active).length}</div>
          </div>
        );
        break;

      case 'quizzes':
        output = (
          <div>
            <div>[+] Total Curated Questions: {questions.length}</div>
            {['processes-and-threads', 'cpu-scheduling', 'deadlocks-and-synchronization', 'memory-management', 'disk-scheduling'].map((slug) => (
              <div key={slug} style={{ marginLeft: '1rem' }}>
                • {slug}: {questions.filter((q) => q.topicSlug === slug).length} questions
              </div>
            ))}
          </div>
        );
        break;

      case 'broadcast':
        const msg = args.join(' ');
        if (!msg) {
          output = <span style={{ color: 'var(--color-error)' }}>Usage: broadcast &lt;message text&gt;</span>;
        } else {
          onAddAnnouncement({
            title: 'Admin Console Broadcast',
            message: msg,
            type: 'urgent',
            active: true,
            target: 'all',
          });
          output = (
            <span style={{ color: 'var(--color-success)' }}>
              [SUCCESS] Broadcast posted: "{msg}"
            </span>
          );
        }
        break;

      case 'health':
        output = (
          <div>
            <div>[OK] API Gateway: 200 OK (latency: 14ms)</div>
            <div>[OK] MongoDB Cluster: Connected (pool: 10 connections)</div>
            <div>[OK] Mini-OS Simulator Core: Ready</div>
            <div>[OK] CPU Gantt Scheduler Worker: Idle / Available</div>
          </div>
        );
        break;

      case 'whoami':
        output = <div>admin@oslab-core (superuser privileges: ALL)</div>;
        break;

      case 'clear':
        setHistory([]);
        setInputVal('');
        return;

      default:
        output = (
          <span style={{ color: 'var(--color-error)' }}>
            zsh: command not found: {cmd}. Type <strong>help</strong> for available commands.
          </span>
        );
    }

    setHistory((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        command: raw,
        output,
        time: new Date().toLocaleTimeString(),
      },
    ]);

    setInputVal('');
  };

  return (
    <div className={styles.tabContent}>
      <Card className={styles.terminalCard}>
        {/* Terminal Titlebar */}
        <div className={styles.termTitleBar}>
          <div className={styles.termDots}>
            <span className={styles.dotRed} />
            <span className={styles.dotYellow} />
            <span className={styles.dotGreen} />
          </div>
          <div className={styles.termTitle}>
            <Terminal size={14} /> admin@oslab-system-console:~
          </div>
          <span className={styles.termBashLabel}>bash</span>
        </div>

        {/* Terminal Screen */}
        <div className={styles.termScreen} onClick={() => inputRef.current?.focus()}>
          {history.map((item) => (
            <div key={item.id} className={styles.termEntry}>
              <div className={styles.termPromptLine}>
                <span className={styles.termUser}>admin@oslab</span>
                <span className={styles.termSep}>:</span>
                <span className={styles.termPath}>~#</span>
                <span className={styles.termCmd}>{item.command}</span>
                <span className={styles.termTime}>{item.time}</span>
              </div>
              <div className={styles.termResult}>{item.output}</div>
            </div>
          ))}

          {/* Prompt Input Line */}
          <form onSubmit={handleCommand} className={styles.termForm}>
            <span className={styles.termUser}>admin@oslab</span>
            <span className={styles.termSep}>:</span>
            <span className={styles.termPath}>~#</span>
            <input
              ref={inputRef}
              type="text"
              className={styles.termInput}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="type command (e.g. 'help', 'users', 'stats')..."
              autoFocus
            />
            <button type="submit" style={{ display: 'none' }} />
          </form>

          <div ref={bottomRef} />
        </div>
      </Card>
    </div>
  );
};

export default AdminTerminal;
