import React, { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import { AppProviders } from './providers';

const App: React.FC = () => {
  return (
    <AppProviders>
      <Suspense fallback={<div>Loading...</div>}>
        <RouterProvider router={router} />
      </Suspense>
    </AppProviders>
  );
};

export default App;
