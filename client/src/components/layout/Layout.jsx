import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children, headerTitle }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      {sidebarOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}
      <div className="main-wrapper">
        <Header 
          title={headerTitle} 
          onToggleSidebar={() => setSidebarOpen(prev => !prev)} 
        />

        <main className="content-body">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
