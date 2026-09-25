import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/context/AuthContext';
import { useUIStore } from '../../stores/uiStore';
import { Sun, Moon, Menu, X, ChevronDown, LogOut, User as UserIcon, ShieldCheck } from 'lucide-react';
import styles from './Header.module.css';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useUIStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminPage = location.pathname.startsWith('/admin');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/learn', label: 'Learn' },
    { to: '/mini-os', label: 'Mini-OS' },
    { to: '/os-lab', label: 'OS Lab' },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <Link to={user ? "/dashboard" : "/"}>
          <span className={styles.logoText}>OS<span className={styles.logoAccent}>Lab</span></span>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <nav className={styles.desktopNav}>
        {user && navLinks.map(link => (
          <NavLink 
            key={link.to} 
            to={link.to} 
            className={({ isActive }) => `${styles.link} ${isActive ? styles.activeLink : ''}`}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      {/* Actions (Theme + User Dropdown) */}
      <div className={styles.actions}>
        <button 
          onClick={toggleTheme} 
          className={styles.themeBtn}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          <div className={styles.iconWrapper}>
            <Sun className={`${styles.themeIcon} ${styles.sunIcon} ${theme === 'dark' ? styles.active : styles.inactive}`} size={20} />
            <Moon className={`${styles.themeIcon} ${styles.moonIcon} ${theme === 'light' ? styles.active : styles.inactive}`} size={20} />
          </div>
        </button>

        {user ? (
          <div className={styles.userDropdown} ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)} 
              className={styles.avatarBtn}
              aria-label="User Menu"
            >
              <div className={styles.avatar}>
                {getInitials(user.name || 'Student')}
              </div>
              <span className={styles.userName}>{user.name || 'Student'}</span>
              <ChevronDown size={14} className={`${styles.chevron} ${dropdownOpen ? styles.rotated : ''}`} />
            </button>

            {dropdownOpen && (
              <div className={styles.dropdownMenu}>
                <div className={styles.dropdownHeader}>
                  <p className={styles.userEmail}>{user.email || 'student@oslab.edu'}</p>
                </div>
                <Link 
                  to="/profile" 
                  className={styles.dropdownItem}
                  onClick={() => setDropdownOpen(false)}
                >
                  <UserIcon size={16} />
                  <span>My Profile</span>
                </Link>
                <Link 
                  to="/admin" 
                  className={styles.dropdownItem}
                  onClick={() => setDropdownOpen(false)}
                >
                  <ShieldCheck size={16} />
                  <span>Admin Console</span>
                </Link>
                <hr className={styles.divider} />
                <button onClick={handleLogout} className={styles.dropdownItemDanger}>
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        ) : isAdminPage ? (
          <div className={styles.guestLinks}>
            <button 
              onClick={handleLogout} 
              className={styles.registerBtn}
              style={{ 
                background: 'var(--color-surface-elevated)', 
                color: 'var(--color-text-primary)', 
                border: '1px solid var(--color-border)', 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <LogOut size={14} />
              <span>Logout / Exit</span>
            </button>
          </div>
        ) : (
          <div className={styles.guestLinks}>
            <Link to="/login" className={styles.loginLink}>Login</Link>
            <Link to="/register" className={styles.registerBtn}>Register</Link>
          </div>
        )}

        {/* Mobile Menu Toggle */}
        {user && (
          <button 
            className={styles.mobileMenuToggle} 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}
      </div>

      {/* Mobile Drawer Navigation */}
      {user && mobileMenuOpen && (
        <div className={styles.mobileDrawer} onClick={() => setMobileMenuOpen(false)}>
          <div className={styles.mobileMenuContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.mobileDrawerHeader}>
              <span className={styles.logoText}>OS<span className={styles.logoAccent}>Lab</span></span>
              <button onClick={() => setMobileMenuOpen(false)} className={styles.drawerCloseBtn}>
                <X size={24} />
              </button>
            </div>
            <nav className={styles.mobileLinks}>
              {navLinks.map(link => (
                <NavLink 
                  key={link.to} 
                  to={link.to} 
                  className={({ isActive }) => `${styles.mobileLink} ${isActive ? styles.mobileActiveLink : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </NavLink>
              ))}
              <hr className={styles.mobileDivider} />
              <div className={styles.mobileUserInfo}>
                <span className={styles.mobileUserEmail}>{user.email || 'student@oslab.edu'}</span>
              </div>
              <button onClick={handleLogout} className={styles.mobileLogoutBtn}>
                <LogOut size={18} style={{ marginRight: '8px' }} />
                Logout
              </button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
