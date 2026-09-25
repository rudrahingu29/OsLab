import React, { useState } from 'react';
import { Modal, Button, Input, Select } from '../../../components/common';
import type { AdminUser, UserRole } from '../types';

interface AdminAddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser: (user: Omit<AdminUser, 'id' | 'createdAt' | 'lastActive' | 'progress' | 'quizzesCompleted' | 'experimentsCount'>) => void;
}

export const AdminAddUserModal: React.FC<AdminAddUserModalProps> = ({ isOpen, onClose, onAddUser }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('student');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    onAddUser({
      name: name.trim(),
      email: email.trim(),
      role,
      status: 'active',
    });

    setName('');
    setEmail('');
    setRole('student');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Register New Student / Staff">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Input
          label="Full Name"
          placeholder="e.g. John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="Email Address"
          type="email"
          placeholder="e.g. jdoe@university.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Select
          label="Assigned Role"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          options={[
            { value: 'student', label: 'Student (Learner)' },
            { value: 'instructor', label: 'Instructor / TA' },
            { value: 'admin', label: 'System Administrator' },
          ]}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Create User
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AdminAddUserModal;
