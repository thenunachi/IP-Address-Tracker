import { useEffect } from 'react';

export default function Toast({ msg, type = 'success', onClose, duration = 3500 }) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);
  return <div className={`toast ${type}`}>{msg}</div>;
}
