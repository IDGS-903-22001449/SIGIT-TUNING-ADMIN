import { useEffect } from 'react';
import { Icons } from '../Icons/Icons';
import './Toast.css';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Icons.Package />;
      case 'error':
        return <Icons.Close />;
      case 'warning':
        return <Icons.Activity />;
      default:
        return <Icons.Activity />;
    }
  };

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-icon">
        {getIcon()}
      </div>
      <p className="toast-message">{message}</p>
      <button className="toast-close" onClick={onClose}>
        <Icons.Close />
      </button>
    </div>
  );
};

export default Toast;