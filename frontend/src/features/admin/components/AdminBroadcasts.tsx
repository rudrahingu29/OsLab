import React, { useState } from 'react';
import { Card, Button, Input, Textarea, Select } from '../../../components/common';
import type { AdminAnnouncement, AnnouncementType } from '../types';
import { Megaphone, Trash2, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import styles from '../AdminPage.module.css';

interface AdminBroadcastsProps {
  announcements: AdminAnnouncement[];
  onAddAnnouncement: (a: Omit<AdminAnnouncement, 'id' | 'createdAt'>) => void;
  onToggleAnnouncement: (id: string) => void;
  onDeleteAnnouncement: (id: string) => void;
}

export const AdminBroadcasts: React.FC<AdminBroadcastsProps> = ({
  announcements,
  onAddAnnouncement,
  onToggleAnnouncement,
  onDeleteAnnouncement,
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<AnnouncementType>('urgent');
  const [target, setTarget] = useState<'all' | 'students' | 'instructors'>('students');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    onAddAnnouncement({
      title: title.trim(),
      message: message.trim(),
      type,
      active: true,
      target,
    });

    setTitle('');
    setMessage('');
    setType('urgent');
  };

  const getAlertIcon = (t: AnnouncementType) => {
    switch (t) {
      case 'urgent':
        return <AlertTriangle size={16} className={styles.alertUrgentIcon} />;
      case 'success':
        return <CheckCircle size={16} className={styles.alertSuccessIcon} />;
      default:
        return <Info size={16} className={styles.alertInfoIcon} />;
    }
  };

  return (
    <div className={styles.tabContent}>
      <div className={styles.twoColGrid}>
        {/* Create Broadcast Form */}
        <Card className={styles.panelCard}>
          <div className={styles.panelHeader}>
            <div>
              <h3>Broadcast New Announcement</h3>
              <p className={styles.panelSub}>Post live alert banners across user dashboards</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input
              label="Announcement Title"
              placeholder="e.g. Lab 3 Submission Reminder"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <Textarea
              label="Announcement Message"
              placeholder="Details regarding deadline, new feature, or instructions..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <Select
                label="Alert Severity"
                value={type}
                onChange={(e) => setType(e.target.value as AnnouncementType)}
                options={[
                  { value: 'urgent', label: 'Urgent / Deadline (Amber)' },
                  { value: 'info', label: 'Info / Notice (Cyan)' },
                  { value: 'success', label: 'Feature / Success (Green)' },
                ]}
              />

              <Select
                label="Target Audience"
                value={target}
                onChange={(e) => setTarget(e.target.value as 'all' | 'students' | 'instructors')}
                options={[
                  { value: 'all', label: 'All Users' },
                  { value: 'students', label: 'Students Only' },
                  { value: 'instructors', label: 'Instructors Only' },
                ]}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              leftIcon={<Megaphone size={16} />}
              style={{ marginTop: '0.5rem' }}
            >
              Publish Announcement
            </Button>
          </form>
        </Card>

        {/* Existing Announcements List */}
        <Card className={styles.panelCard}>
          <div className={styles.panelHeader}>
            <div>
              <h3>Active & Past Broadcasts</h3>
              <p className={styles.panelSub}>Manage visibility and delete expired notices</p>
            </div>
          </div>

          <div className={styles.announcementList}>
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className={`${styles.announcementCard} ${ann.active ? styles.annActive : styles.annInactive}`}
              >
                <div className={styles.annHeader}>
                  <div className={styles.annTitleRow}>
                    {getAlertIcon(ann.type)}
                    <span className={styles.annTitle}>{ann.title}</span>
                  </div>
                  <div className={styles.actionButtonRow}>
                    <button
                      className={`${styles.pillToggleBtn} ${ann.active ? styles.activeToggle : ''}`}
                      onClick={() => onToggleAnnouncement(ann.id)}
                    >
                      {ann.active ? 'Active' : 'Hidden'}
                    </button>
                    <button
                      className={`${styles.iconActionBtn} ${styles.dangerBtn}`}
                      onClick={() => onDeleteAnnouncement(ann.id)}
                      title="Delete Announcement"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <p className={styles.annMessage}>{ann.message}</p>

                <div className={styles.annFooter}>
                  <span>Audience: {ann.target.toUpperCase()}</span>
                  <span>Posted: {ann.createdAt}</span>
                </div>
              </div>
            ))}

            {announcements.length === 0 && (
              <div className={styles.emptyTableState}>
                No announcements created yet.
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminBroadcasts;
