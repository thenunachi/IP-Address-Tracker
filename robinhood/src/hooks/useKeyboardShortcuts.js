import { useEffect } from 'react';

export function useKeyboardShortcuts(navigate, page) {
  useEffect(() => {
    function onKey(e) {
      const tag = e.target.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable;

      if (e.key === 'Escape') {
        if (page === 'detail') navigate('home');
        return;
      }

      if (typing) return;

      switch (e.key) {
        case '/':
          e.preventDefault();
          navigate('search');
          break;
        case 'h': case 'H': navigate('home');      break;
        case 'w': case 'W': navigate('watchlist'); break;
        case 'o': case 'O': navigate('orders');    break;
        case 'a': case 'A': navigate('analytics'); break;
        default: break;
      }
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate, page]);
}
