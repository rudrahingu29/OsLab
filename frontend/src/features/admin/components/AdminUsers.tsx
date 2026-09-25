import React, { useState } from 'react';
import { Card, Button, Table, ProgressBar } from '../../../components/common';
import type { AdminUser, UserRole } from '../types';
import { Search, UserPlus, Trash2, RotateCcw, Shield, GraduationCap, UserCheck, ShieldAlert } from 'lucide-react';
import AdminAddUserModal from './AdminAddUserModal';
import styles from '../AdminPage.module.css';

interface AdminUsersProps {
  users: AdminUser[];
  onUpdateRole: (userId: string, newRole: UserRole) => void;
  onToggleStatus: (userId: string) => void;
  onResetProgress: (userId: string) => void;
  onDeleteUser: (userId: string) => void;
  onAddUser: (user: Omit<AdminUser, 'id' | 'createdAt' | 'lastActive' | 'progress' | 'quizzesCompleted' | 'experimentsCount'>) => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({
  users,
  onUpdateRole,
  onToggleStatus,
  onResetProgress,
  onDeleteUser,
  onAddUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className={`${styles.roleBadge} ${styles.roleAdmin}`}>
            <Shield size={12} /> Admin
          </span>
        );
      case 'instructor':
        return (
          <span className={`${styles.roleBadge} ${styles.roleInstructor}`}>
            <UserCheck size={12} /> Instructor
          </span>
        );
      default:
        return (
          <span className={`${styles.roleBadge} ${styles.roleStudent}`}>
            <GraduationCap size={12} /> Student
          </span>
        );
    }
  };

  return (
    <div className={styles.tabContent}>
      <Card className={styles.panelCard}>
        {/* Controls Bar */}
        <div className={styles.tableControls}>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search student or staff by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterActions}>
            <div className={styles.pillGroup}>
              {(['all', 'student', 'instructor', 'admin'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`${styles.filterPill} ${roleFilter === r ? styles.activePill : ''}`}
                  onClick={() => setRoleFilter(r)}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>

            <Button
              variant="primary"
              size="sm"
              leftIcon={<UserPlus size={14} />}
              onClick={() => setIsAddModalOpen(true)}
            >
              Add User
            </Button>
          </div>
        </div>

        {/* Users Table */}
        <div className={styles.tableWrapper}>
          <Table>
            <thead>
              <tr>
                <th>User Details</th>
                <th>Role</th>
                <th>Status</th>
                <th>Curriculum Progress</th>
                <th>Quizzes</th>
                <th>Experiments</th>
                <th>Last Active</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.userAvatarSmall}>
                        {user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                      <div>
                        <div className={styles.userNameText}>{user.name}</div>
                        <div className={styles.userEmailText}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>
                    <span
                      className={`${styles.statusPill} ${
                        user.status === 'active' ? styles.statusActive : styles.statusSuspended
                      }`}
                    >
                      {user.status === 'active' ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td>
                    <div style={{ width: '100px' }}>
                      <ProgressBar value={user.progress} size="sm" showValue />
                    </div>
                  </td>
                  <td className={styles.metricText}>{user.quizzesCompleted}</td>
                  <td className={styles.metricText}>{user.experimentsCount}</td>
                  <td className={styles.dateText}>{user.lastActive}</td>
                  <td>
                    <div className={styles.actionButtonRow}>
                      <select
                        className={styles.roleSelect}
                        value={user.role}
                        onChange={(e) => onUpdateRole(user.id, e.target.value as UserRole)}
                        title="Change role"
                      >
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Admin</option>
                      </select>

                      <button
                        className={styles.iconActionBtn}
                        onClick={() => onToggleStatus(user.id)}
                        title={user.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                      >
                        <ShieldAlert size={14} />
                      </button>

                      <button
                        className={styles.iconActionBtn}
                        onClick={() => onResetProgress(user.id)}
                        title="Reset Student Progress"
                      >
                        <RotateCcw size={14} />
                      </button>

                      <button
                        className={`${styles.iconActionBtn} ${styles.dangerBtn}`}
                        onClick={() => onDeleteUser(user.id)}
                        title="Delete User"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {filteredUsers.length === 0 && (
            <div className={styles.emptyTableState}>
              No users found matching your search filter.
            </div>
          )}
        </div>
      </Card>

      <AdminAddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddUser={onAddUser}
      />
    </div>
  );
};

export default AdminUsers;
