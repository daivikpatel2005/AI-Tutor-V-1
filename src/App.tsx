import React from 'react';
import { TeachingProvider, useTeaching } from './state/teachingStore';
import { Navbar } from './components/layout/Navbar';
import { HomePage } from './pages/Home/HomePage';
import { TeachingRoomPage } from './pages/TeachingRoom/TeachingRoomPage';

const AppContent: React.FC = () => {
  const { currentPage } = useTeaching();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-dark)', display: 'flex', flexDirection: 'column' }}>
      {currentPage === 'home' && <Navbar />}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'teaching' && <TeachingRoomPage />}
      </main>
    </div>
  );
};

export function App() {
  return (
    <TeachingProvider>
      <AppContent />
    </TeachingProvider>
  );
}

export default App;
