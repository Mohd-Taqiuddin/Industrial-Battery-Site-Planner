import React from 'react';

interface NavbarProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ theme, toggleTheme }) => (
  <nav className="navbar">
    <div className="brand">TESLA <span>Energy Planner</span></div>
    <button onClick={toggleTheme} className="theme-btn">
      {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
    </button>
  </nav>
);