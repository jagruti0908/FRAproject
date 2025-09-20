import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import FRAAtlas from './pages/FRAAtlas';
import Reports from './pages/Reports';
import CommunityPortal from './pages/CommunityPortal';
import Settings from './pages/Settings';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setSidebarOpen(true);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onMenuClick={handleMenuClick} />;
      case 'claims':
        return <Dashboard onMenuClick={handleMenuClick} />; // Using Dashboard for Claims as they're similar
      case 'fra-atlas':
        return <FRAAtlas onMenuClick={handleMenuClick} />;
      case 'reports':
        return <Reports onMenuClick={handleMenuClick} />;
      case 'community':
        return <CommunityPortal onMenuClick={handleMenuClick} />;
      case 'settings':
        return <Settings onMenuClick={handleMenuClick} />;
      default:
        return <Dashboard onMenuClick={handleMenuClick} />;
    }
  };

  return (
    <div className="flex">
      <Sidebar 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        isOpen={sidebarOpen}
        onClose={handleSidebarClose}
      />
      <div className="flex-1 lg:ml-64">
        {renderPage()}
      </div>
    </div>
  );
}

export default App;