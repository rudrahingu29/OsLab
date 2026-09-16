import React from 'react';
import styles from './ConceptDiagram.module.css';

interface ConceptDiagramProps {
  visualExample: {
    title: string;
    description: string;
    diagramType: 'blocks' | 'flowchart' | 'states';
    elements: string[];
  };
}

export const ConceptDiagram: React.FC<ConceptDiagramProps> = ({ visualExample }) => {
  const { title, description, diagramType, elements } = visualExample;

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>{title}</h4>
      <p className={styles.description}>{description}</p>
      
      <div className={`${styles.diagramArea} ${styles[diagramType]}`}>
        {elements.map((element, index) => (
          <div key={index} className={styles.elementWrapper}>
            <div className={styles.elementNode}>
              {element}
            </div>
            {index < elements.length - 1 && (
              <div className={styles.connector}>
                {diagramType === 'blocks' ? '↓' : diagramType === 'flowchart' ? '→' : '⇄'}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
