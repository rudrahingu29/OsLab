import React from 'react';
import { Link } from 'react-router-dom';
import styles from './TopicContent.module.css';
import type { Topic } from '../data/topics';
import { ConceptDiagram } from './ConceptDiagram';

interface TopicContentProps {
  topic: Topic;
}

export const TopicContent: React.FC<TopicContentProps> = ({ topic }) => {
  if (!topic.content) {
    return <div className={styles.emptyState}>Content coming soon!</div>;
  }

  const {
    concept,
    simpleExplanation,
    whyNeeded,
    howItWorks,
    visualExample,
    realWorldContext,
    importantTerms,
    advantagesLimitations
  } = topic.content;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <span className={styles.icon}>{topic.icon}</span>
        <h1 className={styles.title}>{topic.title}</h1>
      </header>
      
      <p className={styles.description}>{topic.description}</p>
      
      {(topic.miniOsScenario || topic.labLink) && (
        <div className={styles.crossLinks}>
          <h4 className={styles.crossLinksTitle}>Try it out:</h4>
          <div className={styles.linksWrapper}>
            {topic.miniOsScenario && (
              <span className={styles.badge}>Mini-OS: {topic.miniOsScenario}</span>
            )}
            {topic.labLink && (
              <Link to={topic.labLink} className={styles.labLink}>
                Go to OS Lab Interactive Module
              </Link>
            )}
          </div>
        </div>
      )}

      <section className={styles.section}>
        <h2>The Concept</h2>
        <p>{concept}</p>
      </section>

      <section className={styles.section}>
        <h2>In Simple Terms</h2>
        <div className={styles.analogyBox}>
          <p><strong>Analogy:</strong> {simpleExplanation}</p>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Why is it Needed?</h2>
        <p>{whyNeeded}</p>
      </section>

      <section className={styles.section}>
        <h2>How It Works</h2>
        <p>{howItWorks}</p>
        <ConceptDiagram visualExample={visualExample} />
      </section>

      <section className={styles.section}>
        <h2>Real World Context</h2>
        <p>{realWorldContext}</p>
      </section>

      <section className={styles.section}>
        <h2>Important Terms</h2>
        <ul className={styles.termsList}>
          {importantTerms.map((item, idx) => (
            <li key={idx} className={styles.termItem}>
              <strong>{item.term}:</strong> {item.definition}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2>Advantages & Limitations</h2>
        <div className={styles.prosConsGrid}>
          <div className={styles.pros}>
            <h3>Advantages</h3>
            <ul>
              {advantagesLimitations.advantages.map((adv, idx) => (
                <li key={idx}>{adv}</li>
              ))}
            </ul>
          </div>
          <div className={styles.cons}>
            <h3>Limitations / Tradeoffs</h3>
            <ul>
              {advantagesLimitations.limitations.map((lim, idx) => (
                <li key={idx}>{lim}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
