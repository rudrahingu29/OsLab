import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUIStore } from '../../../stores/uiStore';
import { Button, Input } from '../../../components/common';
import { Cpu, Eye, EyeOff } from 'lucide-react';
import styles from './LoginPage.module.css';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { addToast } = useUIStore();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await login(email, password);
      addToast("Successfully authenticated. Welcome back!", "success");
      navigate('/dashboard');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Invalid credentials. Please try again.";
      addToast(errorMsg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${styles.pageWrapper} animate-fade-in`}>
      <div className={styles.splitGrid}>
        
        {/* Left Side: Technical Info Panel */}
        <div className={styles.infoPanel}>
          <div className={styles.infoContent}>
            <div className={styles.brandTitle}>
              <Cpu className={styles.brandIcon} size={28} />
              <span>OS<span className={styles.brandAccent}>Lab</span></span>
            </div>
            <h2 className={styles.panelHeading}>The Virtual Operating Systems Laboratory</h2>
            <p className={styles.panelSub}>
              Experiment with process scheduling, trace virtual memory maps, and analyze simulation metrics through a unified academic workspace.
            </p>
            <div className={styles.terminalBox}>
              <div className={styles.terminalHeader}>
                <span className={styles.dot} />
                <span className={styles.dot} />
                <span className={styles.dot} />
                <span className={styles.terminalTitle}>system_monitor.sh</span>
              </div>
              <div className={styles.terminalBody}>
                <p className={styles.greenText}>$ oslab --init-simulation</p>
                <p className={styles.mutedText}>[INFO] Fetching scheduler algorithms database...</p>
                <p className={styles.mutedText}>[INFO] Gantt charts visualizer loaded successfully.</p>
                <p className={styles.cyanText}>[READY] Core OS simulation engine initialized.</p>
                <p className={styles.mutedText}>_</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className={styles.formPanel}>
          <div className={styles.formContainer}>
            <div className={styles.mobileBrand}>
              <Cpu className={styles.brandIcon} size={24} />
              <span>OS<span className={styles.brandAccent}>Lab</span></span>
            </div>

            <div className={styles.formHeader}>
              <h1 className={styles.formTitle}>Welcome back</h1>
              <p className={styles.formSubtitle}>Sign in to resume your OS laboratories</p>
            </div>

            <form onSubmit={handleLogin} className={styles.form} noValidate>
              <Input
                label="Email Address"
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                required
                autoComplete="email"
              />

              <div className={styles.passwordWrapper}>
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.passwordToggle}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <Button 
                variant="primary" 
                type="submit" 
                isLoading={isLoading}
                className={styles.submitBtn}
              >
                Sign In
              </Button>
            </form>

            <p className={styles.footerText}>
              Don't have an account?{' '}
              <Link to="/register" className={styles.signupLink}>
                Create an account
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
