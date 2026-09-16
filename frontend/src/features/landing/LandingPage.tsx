import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/context/AuthContext';
import { Button, Card, StatusBadge } from '../../components/common';
import { 
  BookOpen, 
  Terminal, 
  Settings, 
  ChevronRight, 
  Layers, 
  FolderTree, 
  Activity,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import styles from './LandingPage.module.css';

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // If the user is authenticated, render a "Welcome Back / Workspace Hub"
  if (user) {
    return (
      <div className="container-width animate-fade-in" style={{ paddingBottom: '4rem' }}>
        <div className={styles.welcomeHero}>
          <div className={styles.welcomeInfo}>
            <div className={styles.welcomeLabel}>
              <Sparkles size={14} className={styles.welcomeIcon} />
              <span>ACADEMIC WORKSPACE</span>
            </div>
            <h1 className={styles.welcomeTitle}>Welcome back, {user.name}</h1>
            <p className={styles.welcomeDesc}>
              Select an OSLab module below to resume your operating system experiments and studies.
            </p>
          </div>
          <div className={styles.quickMetrics}>
            <div className={styles.metricCard}>
              <span className={styles.metricVal}>Active</span>
              <span className={styles.metricLabel}>Simulation Node</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricVal}>Local</span>
              <span className={styles.metricLabel}>Vanguard Kernel</span>
            </div>
          </div>
        </div>

        <h2 className={styles.gridHeading}>Workspace Modules</h2>
        <div className={styles.dashboardGrid}>
          <Card variant="interactive" onClick={() => navigate('/learn')} className={styles.moduleCard}>
            <div className={styles.moduleHeader}>
              <div className={`${styles.iconWrap} ${styles.blue}`}>
                <BookOpen size={24} />
              </div>
              <ChevronRight size={18} className={styles.cardArrow} />
            </div>
            <h3 className={styles.moduleTitle}>1. Interactive Learn</h3>
            <p className={styles.moduleDesc}>
              Master operating systems concepts (processes, scheduling, memory, file systems) through structured, interactive textbook topics.
            </p>
            <div className={styles.moduleFooter}>
              <span>Resume Studying</span>
            </div>
          </Card>

          <Card variant="interactive" onClick={() => navigate('/mini-os')} className={styles.moduleCard}>
            <div className={styles.moduleHeader}>
              <div className={`${styles.iconWrap} ${styles.purple}`}>
                <Terminal size={24} />
              </div>
              <ChevronRight size={18} className={styles.cardArrow} />
            </div>
            <h3 className={styles.moduleTitle}>2. Mini-OS Simulated Desktop</h3>
            <p className={styles.moduleDesc}>
              Launch a virtual operating system directly in your web browser. Monitor simulated process lifecycles and run CLI commands.
            </p>
            <div className={styles.moduleFooter}>
              <span>Boot Simulated OS</span>
            </div>
          </Card>

          <Card variant="interactive" onClick={() => navigate('/os-lab')} className={styles.moduleCard}>
            <div className={styles.moduleHeader}>
              <div className={`${styles.iconWrap} ${styles.cyan}`}>
                <Settings size={24} />
              </div>
              <ChevronRight size={18} className={styles.cardArrow} />
            </div>
            <h3 className={styles.moduleTitle}>3. CPU Scheduling Lab</h3>
            <p className={styles.moduleDesc}>
              Configure custom process arrival times, priority parameters, choose a scheduling policy, and observe timeline charts.
            </p>
            <div className={styles.moduleFooter}>
              <span>Open Simulations</span>
            </div>
          </Card>
        </div>

        <div className={styles.recentsBox}>
          <h3 className={styles.recentsTitle}>System Node Status</h3>
          <div className={styles.statusRow}>
            <div className={styles.statusCol}>
              <span className={styles.indicatorGreen} />
              <span>Kernel Simulation Engine (Online)</span>
            </div>
            <div className={styles.statusCol}>
              <span className={styles.indicatorGreen} />
              <span>Local Database Sync (Connected)</span>
            </div>
            <div className={styles.statusCol}>
              <Link to="/design-system" className={styles.designSystemLink}>
                Launch Design System Playground &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Public Landing Page
  return (
    <div className={styles.publicContainer}>
      
      {/* Hero Section */}
      <section className={`${styles.hero} container-width`}>
        <div className={styles.heroLeft}>
          <div className={styles.pillLabel}>OSLab Virtual Learning Lab</div>
          <h1 className={styles.heroTitle}>
            Interactive Operating System Learning & Virtual Laboratory
          </h1>
          <p className={styles.heroDesc}>
            Learn core computer science concepts, experiment with process scheduling algorithms, and interact with a virtual operating system environment.
          </p>
          <div className={styles.heroActions}>
            <Link to="/register">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight size={16} />}>
                Start Learning
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">
                Explore OS Lab
              </Button>
            </Link>
          </div>
        </div>

        <div className={styles.heroRight}>
          <div className={styles.simPanelPreview}>
            <div className={styles.previewHeader}>
              <span className={styles.previewTitle}>CPU Scheduler Simulation</span>
              <StatusBadge status="Running" />
            </div>
            <div className={styles.ganttChart}>
              <div className={styles.ganttRow}>
                <span className={styles.ganttLabel}>P1 (FCFS)</span>
                <div className={styles.ganttBar} style={{ width: '60%', backgroundColor: 'var(--color-primary)' }} />
              </div>
              <div className={styles.ganttRow}>
                <span className={styles.ganttLabel}>P2 (FCFS)</span>
                <div className={styles.ganttBar} style={{ width: '30%', marginLeft: '60%', backgroundColor: 'var(--color-success)' }} />
              </div>
              <div className={styles.ganttRow}>
                <span className={styles.ganttLabel}>P3 (FCFS)</span>
                <div className={styles.ganttBar} style={{ width: '10%', marginLeft: '90%', backgroundColor: 'var(--color-warning)' }} />
              </div>
            </div>
            <div className={styles.metricRow}>
              <div>
                <span className={styles.metricDesc}>Avg Waiting Time</span>
                <span className={styles.metricNum}>3.42 ms</span>
              </div>
              <div>
                <span className={styles.metricDesc}>Avg Turnaround Time</span>
                <span className={styles.metricNum}>8.71 ms</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className={`${styles.pillarsSection} container-width`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Three Primary Operating System Pillars</h2>
          <p className={styles.sectionSubtitle}>OSLab links theoretical study directly with visual execution metrics.</p>
        </div>

        <div className={styles.pillarsGrid}>
          <Card className={styles.pillarCard}>
            <div className={`${styles.pillarIconWrap} ${styles.blue}`}>
              <BookOpen size={24} />
            </div>
            <h3 className={styles.pillarTitle}>Learn</h3>
            <p className={styles.pillarDesc}>
              Read clear academic guides covering basic concepts: CPU management, process states, synchronization parameters, paging algorithms, and system architecture.
            </p>
          </Card>

          <Card className={styles.pillarCard}>
            <div className={`${styles.pillarIconWrap} ${styles.purple}`}>
              <Terminal size={24} />
            </div>
            <h3 className={styles.pillarTitle}>Mini-OS</h3>
            <p className={styles.pillarDesc}>
              Log in to a simulated windowing terminal. Interact with custom filesystem commands, kill run processes inside a task manager, and inspect resource utilization.
            </p>
          </Card>

          <Card className={styles.pillarCard}>
            <div className={`${styles.pillarIconWrap} ${styles.cyan}`}>
              <Settings size={24} />
            </div>
            <h3 className={styles.pillarTitle}>OS Lab</h3>
            <p className={styles.pillarDesc}>
              Input process datasets with varied burst thresholds, choose algorithms (FCFS, SJF, RR), trigger execution, and review performance reports.
            </p>
          </Card>
        </div>
      </section>

      {/* Educational Flow (Concept -> Simulation -> Observation) */}
      <section className={styles.flowSection}>
        <div className={`${styles.flowContent} container-width`}>
          <h2 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '3rem' }}>
            The OSLab Educational Workflow
          </h2>
          <div className={styles.flowSteps}>
            <div className={styles.flowStep}>
              <div className={styles.stepNum}>01</div>
              <h4 className={styles.stepTitle}>Study Concept</h4>
              <p className={styles.stepDesc}>Review theoretical notes on algorithms, process lifecycles, and synchronization hazards.</p>
            </div>
            <div className={styles.flowArrow}>
              <ArrowRight size={24} />
            </div>
            <div className={styles.flowStep}>
              <div className={styles.stepNum}>02</div>
              <h4 className={styles.stepTitle}>Simulate Behavior</h4>
              <p className={styles.stepDesc}>Define a CPU process block queue and execute under different scheduling rules.</p>
            </div>
            <div className={styles.flowArrow}>
              <ArrowRight size={24} />
            </div>
            <div className={styles.flowStep}>
              <div className={styles.stepNum}>03</div>
              <h4 className={styles.stepTitle}>Observe Results</h4>
              <p className={styles.stepDesc}>Trace chronological Gantt charts, measure response delays, and compare efficiency metrics.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Capabilities */}
      <section className={`${styles.featuresSection} container-width`}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Lab System Capabilities</h2>
          <p className={styles.sectionSubtitle}>A fully functional toolkit designed for computer science classrooms and students.</p>
        </div>
        <div className={styles.featuresGrid}>
          <div className={styles.featureItem}>
            <Layers className={styles.featureIcon} size={20} />
            <div>
              <h4 className={styles.featureName}>CPU Scheduling Simulation</h4>
              <p className={styles.featureDesc}>Run preemptive scheduling policies and audit performance states.</p>
            </div>
          </div>
          <div className={styles.featureItem}>
            <Activity className={styles.featureIcon} size={20} />
            <div>
              <h4 className={styles.featureName}>Process State Tracing</h4>
              <p className={styles.featureDesc}>Watch process transitions between New, Ready, Running, and Blocked blocks.</p>
            </div>
          </div>
          <div className={styles.featureItem}>
            <FolderTree className={styles.featureIcon} size={20} />
            <div>
              <h4 className={styles.featureName}>Virtual File System</h4>
              <p className={styles.featureDesc}>Create directories, save files, and verify memory layout nodes.</p>
            </div>
          </div>
          <div className={styles.featureItem}>
            <Terminal className={styles.featureIcon} size={20} />
            <div>
              <h4 className={styles.featureName}>Simulated Shell Terminal</h4>
              <p className={styles.featureDesc}>Open command shells inside Mini-OS to explore basic Unix commands.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className="container-width">
          <p className={styles.footerText}>
            &copy; {new Date().getFullYear()} OSLab — Interactive Operating System Learning & Virtual Laboratory. Developed for computer science education.
          </p>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
