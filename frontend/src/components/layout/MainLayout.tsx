import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import { ToastContainer } from '../common';
import styles from './MainLayout.module.css';

const MainLayout: React.FC = () => {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  );
};

export default MainLayout;
