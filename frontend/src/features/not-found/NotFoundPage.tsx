import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card } from '../../components/common';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import styles from './NotFoundPage.module.css';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={`${styles.container} animate-fade-in`}>
      <Card className={styles.card}>
        <div className={styles.iconBox}>
          <AlertCircle size={48} />
        </div>
        <h1 className={styles.code}>404</h1>
        <h2 className={styles.title}>Page Not Found</h2>
        <p className={styles.desc}>
          The requested system route could not be resolved by the virtual router. Please check the URL or return to the main dashboard.
        </p>
        <Button 
          variant="primary" 
          onClick={() => navigate('/dashboard')} 
          leftIcon={<ArrowLeft size={16} />}
        >
          Return to OSLab
        </Button>
      </Card>
    </div>
  );
};

export default NotFoundPage;
