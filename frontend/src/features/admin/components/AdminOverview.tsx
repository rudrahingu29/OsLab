import React from 'react';
import { Card, ProgressBar } from '../../../components/common';
import type { AdminUser, AdminQuestion, AdminAnnouncement, SimulationStat } from '../types';
import { 
  Users, 
  FlaskConical, 
  CheckCircle2, 
  Activity, 
  Cpu, 
  HardDrive, 
  Layers, 
  AlertTriangle,
  Server
} from 'lucide-react';
import styles from '../AdminPage.module.css';

interface AdminOverviewProps {
  users: AdminUser[];
  questions: AdminQuestion[];
  announcements: AdminAnnouncement[];
  simStats: SimulationStat[];
  onNavigateTab: (tab: string) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  users,
  questions,
  announcements,
  simStats,
  onNavigateTab,
}) => {
  const totalStudents = users.filter((u) => u.role === 'student').length;
  const activeStudents = users.filter((u) => u.role === 'student' && u.status === 'active').length;
  const totalSimulations = simStats.reduce((acc, curr) => acc + curr.runsCount, 0);
  const avgQuizSuccess = Math.round(
    questions.reduce((acc, q) => acc + q.successRate, 0) / (questions.length || 1)
  );
  const activeAnnouncements = announcements.filter((a) => a.active).length;

  return (
    <div className={styles.tabContent}>
      {/* Top Stat Cards */}
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: 'rgba(34, 211, 238, 0.12)', color: 'var(--color-primary)' }}>
            <Users size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total Students</span>
            <div className={styles.statValue}>{totalStudents}</div>
            <span className={styles.statSub}>{activeStudents} active learners</span>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: 'rgba(34, 197, 94, 0.12)', color: 'var(--color-success)' }}>
            <FlaskConical size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Lab Simulations Run</span>
            <div className={styles.statValue}>{totalSimulations.toLocaleString()}</div>
            <span className={styles.statSub}>Across CPU, Disk, Memory</span>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: 'rgba(245, 158, 11, 0.12)', color: 'var(--color-warning)' }}>
            <CheckCircle2 size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Avg Quiz Pass Rate</span>
            <div className={styles.statValue}>{avgQuizSuccess}%</div>
            <span className={styles.statSub}>{questions.length} active questions</span>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: 'rgba(139, 92, 246, 0.12)', color: 'var(--color-secondary)' }}>
            <Activity size={22} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>System Health</span>
            <div className={styles.statValue} style={{ color: 'var(--color-success)', fontSize: 'var(--font-lg)' }}>
              100% Operational
            </div>
            <span className={styles.statSub}>DB Latency: 12ms</span>
          </div>
        </Card>
      </div>

      {/* Main Grid: Popular Algorithms + System Telemetry */}
      <div className={styles.twoColGrid}>
        {/* Popular Simulation Algorithms */}
        <Card className={styles.panelCard}>
          <div className={styles.panelHeader}>
            <div>
              <h3>Algorithm Usage Breakdown</h3>
              <p className={styles.panelSub}>Most frequently simulated OS algorithms by students</p>
            </div>
            <button className={styles.linkButton} onClick={() => onNavigateTab('labs')}>
              View All Labs →
            </button>
          </div>

          <div className={styles.algorithmList}>
            {simStats.slice(0, 5).map((stat) => {
              const maxRuns = Math.max(...simStats.map((s) => s.runsCount));
              const percent = Math.round((stat.runsCount / maxRuns) * 100);
              return (
                <div key={stat.algorithm} className={styles.algoRow}>
                  <div className={styles.algoMeta}>
                    <div className={styles.algoTitle}>
                      {stat.type === 'CPU' && <Cpu size={14} style={{ color: 'var(--color-primary)' }} />}
                      {stat.type === 'Memory' && <Layers size={14} style={{ color: 'var(--color-warning)' }} />}
                      {stat.type === 'Disk' && <HardDrive size={14} style={{ color: 'var(--color-success)' }} />}
                      <span>{stat.algorithm}</span>
                    </div>
                    <span className={styles.algoRuns}>{stat.runsCount} runs</span>
                  </div>
                  <ProgressBar value={percent} size="sm" />
                </div>
              );
            })}
          </div>
        </Card>

        {/* Quick System & Broadcast Overview */}
        <Card className={styles.panelCard}>
          <div className={styles.panelHeader}>
            <div>
              <h3>Server & Curriculum Status</h3>
              <p className={styles.panelSub}>Infrastructure telemetry & active broadcasts</p>
            </div>
          </div>

          <div className={styles.statusStack}>
            <div className={styles.statusItem}>
              <div className={styles.statusIconWrap}>
                <Server size={18} />
              </div>
              <div className={styles.statusDetails}>
                <div className={styles.statusTitle}>Backend API & Simulation Engine</div>
                <div className={styles.statusDesc}>Vite + Express Node.js Server • Uptime 99.98%</div>
              </div>
              <span className={styles.statusBadgeLive}>Online</span>
            </div>

            <div className={styles.statusItem}>
              <div className={styles.statusIconWrap}>
                <AlertTriangle size={18} />
              </div>
              <div className={styles.statusDetails}>
                <div className={styles.statusTitle}>Active Broadcasts ({activeAnnouncements})</div>
                <div className={styles.statusDesc}>
                  {activeAnnouncements > 0
                    ? announcements.find((a) => a.active)?.title
                    : 'No urgent banners currently active.'}
                </div>
              </div>
              <button className={styles.linkButton} onClick={() => onNavigateTab('broadcasts')}>
                Manage
              </button>
            </div>

            <div className={styles.statusItem}>
              <div className={styles.statusIconWrap}>
                <Users size={18} />
              </div>
              <div className={styles.statusDetails}>
                <div className={styles.statusTitle}>Registered User Base</div>
                <div className={styles.statusDesc}>{users.length} accounts configured in database</div>
              </div>
              <button className={styles.linkButton} onClick={() => onNavigateTab('users')}>
                View Users
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;
