import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileMenu from './MobileMenu';

export const AppLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex relative overflow-hidden font-sans">
      {/* Premium background decorative blur circles */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-brand-violet/5 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-brand-cyan/5 rounded-full blur-[150px] pointer-events-none animate-float" />
      <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-brand-rose/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Sidebar (Desktop only) */}
      <div className="hidden md:block w-64 shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Menu Drawer */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main viewport */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Header */}
        <Header onMenuToggle={() => setMobileMenuOpen(true)} />

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 z-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default AppLayout;
