import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout: React.FC = () => {
  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      <main className="py-4">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
