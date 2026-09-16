import os

base_dir = "e:/OsLab_1/frontend/src"

files = {
    "styles/tokens.css": """
:root {
  --color-bg-primary: #0f172a;
  --color-bg-secondary: #1e293b;
  --color-bg-tertiary: #334155;
  --color-text-primary: #f8fafc;
  --color-text-secondary: #cbd5e1;
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-secondary: #8b5cf6;
  --color-danger: #ef4444;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  
  --color-process-ready: var(--color-primary);
  --color-process-running: var(--color-success);
  --color-process-blocked: var(--color-warning);
  --color-process-terminated: var(--color-text-secondary);

  --font-family: 'Inter', sans-serif;
  
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  
  --border-radius-sm: 0.25rem;
  --border-radius-md: 0.5rem;
  --border-radius-lg: 0.75rem;
  
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}
""",
    "styles/global.css": """
@import './tokens.css';
@import './animations.css';
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-family);
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  line-height: 1.5;
}

a {
  color: inherit;
  text-decoration: none;
}
""",
    "styles/animations.css": """
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}

.animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
.animate-slide-up { animation: slideUp 0.4s ease-out; }
.animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
""",
    "app/App.tsx": """
import React, { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import { AuthProvider } from '../features/auth/context/AuthContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <RouterProvider router={router} />
      </Suspense>
    </AuthProvider>
  );
};

export default App;
""",
    "app/router.tsx": """
import React, { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import ProtectedRoute from '../features/auth/components/ProtectedRoute';

const LandingPage = lazy(() => import('../features/landing/LandingPage'));
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('../features/auth/pages/RegisterPage'));
const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage'));
const OSLabPage = lazy(() => import('../features/os-lab/pages/OSLabPage'));
const CPUSchedulingLab = lazy(() => import('../features/os-lab/labs/cpu-scheduling/CPUSchedulingLab'));

// Mocking parallel components
const LearnPage = lazy(() => Promise.resolve({ default: () => <div>Learn Page Placeholder</div> }));
const TopicPage = lazy(() => Promise.resolve({ default: () => <div>Topic Page Placeholder</div> }));
const MiniOSPage = lazy(() => Promise.resolve({ default: () => <div>Mini OS Page Placeholder</div> }));
const ScenarioPage = lazy(() => Promise.resolve({ default: () => <div>Scenario Page Placeholder</div> }));


const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      {
        path: 'dashboard',
        element: <ProtectedRoute><DashboardPage /></ProtectedRoute>
      },
      {
        path: 'learn',
        element: <ProtectedRoute><LearnPage /></ProtectedRoute>
      },
      {
        path: 'learn/:topicSlug',
        element: <ProtectedRoute><TopicPage /></ProtectedRoute>
      },
      {
        path: 'mini-os',
        element: <ProtectedRoute><MiniOSPage /></ProtectedRoute>
      },
      {
        path: 'mini-os/:scenario',
        element: <ProtectedRoute><ScenarioPage /></ProtectedRoute>
      },
      {
        path: 'os-lab',
        element: <ProtectedRoute><OSLabPage /></ProtectedRoute>
      },
      {
        path: 'os-lab/cpu-scheduling',
        element: <ProtectedRoute><CPUSchedulingLab /></ProtectedRoute>
      }
    ]
  }
]);

export default router;
""",
    "app/providers.tsx": """
import React from 'react';
import { AuthProvider } from '../features/auth/context/AuthContext';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};
""",
    "components/layout/MainLayout.tsx": """
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import styles from './MainLayout.module.css';

const MainLayout: React.FC = () => {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
""",
    "components/layout/MainLayout.module.css": """
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
}
""",
    "components/layout/Header.tsx": """
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/context/AuthContext';
import styles from './Header.module.css';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  
  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link to="/">OSLab</Link>
      </div>
      <nav className={styles.nav}>
        {user ? (
          <>
            <Link to="/dashboard" className={styles.link}>Dashboard</Link>
            <Link to="/learn" className={styles.link}>Learn</Link>
            <Link to="/mini-os" className={styles.link}>Mini-OS</Link>
            <Link to="/os-lab" className={styles.link}>OS Lab</Link>
            <button onClick={logout} className={styles.logoutBtn}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className={styles.link}>Login</Link>
            <Link to="/register" className={styles.link}>Register</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
""",
    "components/layout/Header.module.css": """
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-4) var(--spacing-8);
  background-color: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-bg-tertiary);
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
}

.nav {
  display: flex;
  gap: var(--spacing-4);
  align-items: center;
}

.link {
  color: var(--color-text-secondary);
  font-weight: 500;
  transition: color 0.2s;
}

.link:hover {
  color: var(--color-text-primary);
}

.logoutBtn {
  background: none;
  border: none;
  color: var(--color-danger);
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
}
""",
    "components/common/Button.tsx": """
import React, { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', className, ...props }) => {
  return (
    <button className={`${styles.button} ${styles[variant]} ${className || ''}`} {...props} />
  );
};

export default Button;
""",
    "components/common/Button.module.css": """
.button {
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--border-radius-md);
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.primary {
  background-color: var(--color-primary);
  color: white;
}
.primary:hover {
  background-color: var(--color-primary-hover);
}

.secondary {
  background-color: var(--color-secondary);
  color: white;
}

.ghost {
  background-color: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-text-secondary);
}

.danger {
  background-color: var(--color-danger);
  color: white;
}
""",
    "components/common/Card.tsx": """
import React, { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'interactive';
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, variant = 'default', className, onClick }) => {
  return (
    <div 
      className={`${styles.card} ${styles[variant]} ${className || ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;
""",
    "components/common/Card.module.css": """
.card {
  background-color: var(--color-bg-secondary);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-6);
  border: 1px solid var(--color-bg-tertiary);
}

.elevated {
  box-shadow: var(--shadow-lg);
}

.interactive {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.interactive:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary);
}
""",
    "components/common/Badge.tsx": """
import React from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, color = 'var(--color-primary)' }) => {
  return (
    <span className={styles.badge} style={{ backgroundColor: color }}>
      {children}
    </span>
  );
};

export default Badge;
""",
    "components/common/Badge.module.css": """
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}
""",
    "components/charts/GanttChart.tsx": """
import React from 'react';
import styles from './GanttChart.module.css';

interface GanttBlock {
  processId: string;
  startTime: number;
  endTime: number;
  color?: string;
}

interface GanttChartProps {
  blocks: GanttBlock[];
  totalTime: number;
}

const GanttChart: React.FC<GanttChartProps> = ({ blocks, totalTime }) => {
  if (totalTime === 0 || blocks.length === 0) return <div className={styles.empty}>No execution data</div>;

  return (
    <div className={styles.container}>
      <div className={styles.chart}>
        {blocks.map((block, i) => (
          <div 
            key={i} 
            className={styles.block}
            style={{
              left: `${(block.startTime / totalTime) * 100}%`,
              width: `${((block.endTime - block.startTime) / totalTime) * 100}%`,
              backgroundColor: block.color || 'var(--color-primary)'
            }}
          >
            {block.processId}
          </div>
        ))}
      </div>
      <div className={styles.timeline}>
        {Array.from({ length: totalTime + 1 }).map((_, i) => (
          <div key={i} className={styles.tick} style={{ left: `${(i / totalTime) * 100}%` }}>
            {i}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GanttChart;
""",
    "components/charts/GanttChart.module.css": """
.container {
  margin: var(--spacing-4) 0;
  position: relative;
}

.chart {
  height: 40px;
  background-color: var(--color-bg-tertiary);
  border-radius: var(--border-radius-sm);
  position: relative;
  overflow: hidden;
}

.block {
  position: absolute;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.8rem;
  border-right: 1px solid rgba(0,0,0,0.2);
}

.timeline {
  position: relative;
  height: 20px;
  margin-top: 4px;
}

.tick {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.empty {
  color: var(--color-text-secondary);
  text-align: center;
  padding: var(--spacing-4);
  font-style: italic;
}
""",
    "components/charts/MetricCard.tsx": """
import React from 'react';
import styles from './MetricCard.module.css';

interface MetricCardProps {
  label: string;
  value: string | number;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value }) => {
  return (
    <div className={styles.card}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{value}</div>
    </div>
  );
};

export default MetricCard;
""",
    "components/charts/MetricCard.module.css": """
.card {
  background-color: var(--color-bg-secondary);
  padding: var(--spacing-4);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-bg-tertiary);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-1);
}

.value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
}
""",
    "components/simulation/ProcessStateBadge.tsx": """
import React from 'react';
import Badge from '../common/Badge';

interface ProcessStateBadgeProps {
  state: 'READY' | 'RUNNING' | 'BLOCKED' | 'TERMINATED';
}

const colorMap = {
  READY: 'var(--color-process-ready)',
  RUNNING: 'var(--color-process-running)',
  BLOCKED: 'var(--color-process-blocked)',
  TERMINATED: 'var(--color-process-terminated)',
};

const ProcessStateBadge: React.FC<ProcessStateBadgeProps> = ({ state }) => {
  return <Badge color={colorMap[state]}>{state}</Badge>;
};

export default ProcessStateBadge;
""",
    "features/landing/LandingPage.tsx": """
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './LandingPage.module.css';

const LandingPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <section className={styles.hero}>
        <h1 className={styles.title}>Welcome to OSLab</h1>
        <p className={styles.subtitle}>Interactive Operating Systems Learning & Simulation</p>
        <Link to="/register" className={styles.cta}>Get Started</Link>
      </section>
      <section className={styles.pillars}>
        <div className={styles.pillar}>
          <h2>Learn</h2>
          <p>Structured topics on OS concepts.</p>
        </div>
        <div className={styles.pillar}>
          <h2>Mini-OS</h2>
          <p>Gamified scenarios of OS functionality.</p>
        </div>
        <div className={styles.pillar}>
          <h2>OS Lab</h2>
          <p>Technical laboratory for simulation and algorithms.</p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
""",
    "features/landing/LandingPage.module.css": """
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-8);
}
.hero {
  text-align: center;
  margin-bottom: var(--spacing-8);
}
.title {
  font-size: 3rem;
  color: var(--color-primary);
}
.subtitle {
  font-size: 1.5rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-4);
}
.cta {
  display: inline-block;
  background-color: var(--color-primary);
  color: white;
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--border-radius-md);
  font-weight: bold;
}
.pillars {
  display: flex;
  gap: var(--spacing-8);
  width: 100%;
  max-width: 1000px;
}
.pillar {
  flex: 1;
  background-color: var(--color-bg-secondary);
  padding: var(--spacing-6);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-bg-tertiary);
}
""",
    "features/auth/context/AuthContext.tsx": """
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  user: any;
  login: (userData: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);

  const login = (userData: any) => setUser(userData);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
""",
    "features/auth/components/ProtectedRoute.tsx": """
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
""",
    "features/auth/pages/LoginPage.tsx": """
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './LoginPage.module.css';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    login({ id: 1, name: 'Student' });
    navigate('/dashboard');
  };

  return (
    <div className={styles.container}>
      <h2>Login</h2>
      <form onSubmit={handleLogin} className={styles.form}>
        <input type="text" placeholder="Username" className={styles.input} />
        <input type="password" placeholder="Password" className={styles.input} />
        <button type="submit" className={styles.submit}>Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
""",
    "features/auth/pages/LoginPage.module.css": """
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
}
.form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
  width: 300px;
  background-color: var(--color-bg-secondary);
  padding: var(--spacing-6);
  border-radius: var(--border-radius-lg);
}
.input {
  padding: var(--spacing-2);
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--color-bg-tertiary);
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
}
.submit {
  padding: var(--spacing-2);
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
}
""",
    "features/auth/pages/RegisterPage.tsx": """
import React from 'react';
import styles from './RegisterPage.module.css';

const RegisterPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <h2>Register</h2>
      <p>Registration form placeholder</p>
    </div>
  );
};

export default RegisterPage;
""",
    "features/auth/pages/RegisterPage.module.css": """
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
}
""",
    "features/dashboard/DashboardPage.tsx": """
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/common/Card';
import styles from './DashboardPage.module.css';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dashboard</h1>
      <div className={styles.grid}>
        <Card variant="interactive" onClick={() => navigate('/learn')} className={styles.card}>
          <h2>Learn</h2>
          <p>Master OS concepts step by step.</p>
        </Card>
        <Card variant="interactive" onClick={() => navigate('/mini-os')} className={styles.card}>
          <h2>Mini-OS</h2>
          <p>Engage with gamified OS scenarios.</p>
        </Card>
        <Card variant="interactive" onClick={() => navigate('/os-lab')} className={styles.card}>
          <h2>OS Lab</h2>
          <p>Run simulations and compare algorithms.</p>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
""",
    "features/dashboard/DashboardPage.module.css": """
.container {
  padding: var(--spacing-8);
}
.title {
  margin-bottom: var(--spacing-6);
  font-size: 2rem;
}
.grid {
  display: flex;
  gap: var(--spacing-6);
}
.card {
  flex: 1;
  text-align: center;
}
""",
    "features/os-lab/pages/OSLabPage.tsx": """
import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../../../components/common/Card';
import styles from './OSLabPage.module.css';

const OSLabPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1>OS Laboratory</h1>
      <div className={styles.grid}>
        <Link to="/os-lab/cpu-scheduling">
          <Card variant="interactive">
            <h2>CPU Scheduling</h2>
            <p>Simulate and compare scheduling algorithms.</p>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default OSLabPage;
""",
    "features/os-lab/pages/OSLabPage.module.css": """
.container {
  padding: var(--spacing-8);
}
.grid {
  margin-top: var(--spacing-6);
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-6);
}
""",
    "features/os-lab/labs/cpu-scheduling/CPUSchedulingLab.tsx": """
import React, { useState } from 'react';
import GanttChart from '../../../../components/charts/GanttChart';
import MetricCard from '../../../../components/charts/MetricCard';
import styles from './CPUSchedulingLab.module.css';
// Note: Assumes simulation engine exists
// import { SchedulingCalculator } from '../../../../algorithms/scheduling/SchedulingCalculator';

const CPUSchedulingLab: React.FC = () => {
  const [processes, setProcesses] = useState<any[]>([]);
  
  return (
    <div className={styles.container}>
      <h1>CPU Scheduling Laboratory</h1>
      <div className={styles.layout}>
        <div className={styles.panel}>
          <h2>Processes</h2>
          <p>Add processes here to simulate scheduling.</p>
        </div>
        <div className={styles.panel}>
          <h2>Simulation Results</h2>
          <GanttChart blocks={[]} totalTime={0} />
          <div className={styles.metrics}>
            <MetricCard label="Average Turnaround Time" value="0.0" />
            <MetricCard label="Average Waiting Time" value="0.0" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CPUSchedulingLab;
""",
    "features/os-lab/labs/cpu-scheduling/CPUSchedulingLab.module.css": """
.container {
  padding: var(--spacing-8);
}
.layout {
  display: flex;
  gap: var(--spacing-6);
  margin-top: var(--spacing-4);
}
.panel {
  flex: 1;
  background-color: var(--color-bg-secondary);
  padding: var(--spacing-6);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-bg-tertiary);
}
.metrics {
  display: flex;
  gap: var(--spacing-4);
  margin-top: var(--spacing-6);
}
""",
    "stores/authStore.ts": """
import { create } from 'zustand';

interface AuthState {
  user: any;
  setUser: (user: any) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
""",
    "stores/labStore.ts": """
import { create } from 'zustand';

interface LabState {
  experiments: any[];
}

export const useLabStore = create<LabState>((set) => ({
  experiments: [],
}));
""",
    "stores/uiStore.ts": """
import { create } from 'zustand';

interface UIState {
  theme: 'dark' | 'light';
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'dark',
}));
""",
    "services/api.ts": """
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  // Add auth logic here if needed
  return config;
});

export default api;
""",
    "services/experimentService.ts": """
import api from './api';

export const fetchExperiments = async () => {
  const response = await api.get('/experiments');
  return response.data;
};
""",
    "services/progressService.ts": """
import api from './api';

export const fetchProgress = async () => {
  const response = await api.get('/progress');
  return response.data;
};
"""
}

for path, content in files.items():
    full_path = os.path.join(base_dir, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content.strip() + "\\n")

print("Files created successfully.")
