import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './SettingsMenu.css';

export const SettingsMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  return (
    <div className="settings-menu-container" ref={menuRef}>
      <button
        className="settings-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Settings"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="2" fill="currentColor"/>
          <circle cx="12" cy="5" r="2" fill="currentColor"/>
          <circle cx="12" cy="19" r="2" fill="currentColor"/>
        </svg>
      </button>
      {isOpen && (
        <div className="settings-dropdown">
          <div className="settings-user-name">{user?.email || 'User'}</div>
          <button className="settings-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};
