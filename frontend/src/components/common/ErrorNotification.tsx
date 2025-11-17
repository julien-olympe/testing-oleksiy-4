import React, { useEffect } from 'react';
import './ErrorNotification.css';

interface ErrorNotificationProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  message,
  onClose,
  duration = 5000,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="error-notification">
      <span className="error-message">{message}</span>
      <button className="error-close" onClick={onClose}>×</button>
    </div>
  );
};
