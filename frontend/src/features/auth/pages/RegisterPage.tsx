import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUIStore } from '../../../stores/uiStore';
import { Button, Input } from '../../../components/common';
import { Cpu, Eye, EyeOff } from 'lucide-react';
import styles from './RegisterPage.module.css';

const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { addToast } = useUIStore();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string }>({});

  const validateForm = () => {
    const newErrors: { name?: string; email?: string; password?: string; confirmPassword?: string } = {};
    if (!name.trim()) {
      newErrors.name = 'Full name is required';
    }
    if (!email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await register(name, email, password);
      addToast("Account successfully created. Welcome to OSLab!", "success");
      navigate('/dashboard');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Registration failed. Email might be in use.";
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
            <h2 className={styles.panelHeading}>Join OSLab Laboratory</h2>
            <p className={styles.panelSub}>
              Establish your student account to trace learning progress, store algorithm configurations, and log simulated computer exercises.
            </p>
            <div className={styles.terminalBox}>
              <div className={styles.terminalHeader}>
                <span className={styles.dot} />
                <span className={styles.dot} />
                <span className={styles.dot} />
                <span className={styles.terminalTitle}>register_session.log</span>
              </div>
              <div className={styles.terminalBody}>
                <p className={styles.greenText}>$ oslab --create-account</p>
                <p className={styles.mutedText}>[INFO] Preparing database schemas for user progress...</p>
                <p className={styles.mutedText}>[INFO] Linking experiments and achievements module...</p>
                <p className={styles.cyanText}>[READY] Ready to accept new student credentials.</p>
                <p className={styles.mutedText}>_</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Register Form */}
        <div className={styles.formPanel}>
          <div className={styles.formContainer}>
            <div className={styles.mobileBrand}>
              <Cpu className={styles.brandIcon} size={24} />
              <span>OS<span className={styles.brandAccent}>Lab</span></span>
            </div>

            <div className={styles.formHeader}>
              <h1 className={styles.formTitle}>Create account</h1>
              <p className={styles.formSubtitle}>Join the operating systems laboratory</p>
            </div>

            <form onSubmit={handleRegister} className={styles.form} noValidate>
              <Input
                label="Full Name"
                type="text"
                placeholder="Student Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
                required
                autoComplete="name"
              />

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
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={errors.password}
                  required
                  autoComplete="new-password"
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

              <Input
                label="Confirm Password"
                type={showPassword ? "text" : "password"}
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={errors.confirmPassword}
                required
                autoComplete="new-password"
              />

              <Button 
                variant="primary" 
                type="submit" 
                isLoading={isLoading}
                className={styles.submitBtn}
              >
                Create Account
              </Button>
            </form>

            <p className={styles.footerText}>
              Already have an account?{' '}
              <Link to="/login" className={styles.signupLink}>
                Sign in instead
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
