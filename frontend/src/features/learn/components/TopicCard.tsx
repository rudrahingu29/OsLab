import React from 'react';
import { Link } from 'react-router-dom';
import { TopicIcon } from './TopicIcon';
import styles from './TopicCard.module.css';
import type { Topic } from '../data/topics';

interface TopicCardProps {
  topic: Topic;
}

export const TopicCard: React.FC<TopicCardProps> = ({ topic }) => {
  return (
    <div className={`${styles.card} ${topic.isComplete ? styles.complete : styles.incomplete}`}>
      <div className={styles.header}>
        <span className={styles.icon}><TopicIcon icon={topic.icon} size={20} /></span>
        <h3 className={styles.title}>{topic.title}</h3>
      </div>
      <p className={styles.description}>{topic.description}</p>
      
      <div className={styles.footer}>
        {!topic.isComplete ? (
          <span className={styles.comingSoon}>Coming Soon</span>
        ) : (
          <Link to={`/learn/${topic.slug}`} className={styles.readMore}>
            Start Learning →
          </Link>
        )}
      </div>
    </div>
  );
};
