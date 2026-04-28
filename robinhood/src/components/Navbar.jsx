import { useState, useEffect } from 'react';
import { Home, Star, Search, ClipboardList, TrendingUp, BarChart2, Sun, Moon, Keyboard } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getMarketStatus } from '../utils/market';

const NAV = [
  { id: 'home',      label: 'Home',      Icon: Home,          key: 'H' },
  { id: 'watchlist', label: 'Watchlist', Icon: Star,          key: 'W' },
  { id: 'search',    label: 'Search',    Icon: Search,        key: '/' },
  { id: 'orders',    label: 'Orders',    Icon: ClipboardList, key: 'O' },
  { id: 'analytics', label: 'Analytics', Icon: BarChart2,     key: 'A' },
];

const SHORTCUTS = [
  ['H', 'Home'],
  ['W', 'Watchlist'],
  ['/', 'Search'],
  ['O', 'Orders'],
  ['A', 'Analytics'],
  ['Esc', 'Go back'],
];

export default function Navbar() {
  const { page, navigate } = useApp();
  const [market, setMarket] = useState(getMarketStatus);
  const [theme, setTheme]   = useState(() => localStorage.getItem('rh_theme') || 'dark');
  const [showKeys, setShowKeys] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setMarket(getMarketStatus()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (theme === 'light') document.documentElement.classList.add('light');
    else document.documentElement.classList.remove('light');
    localStorage.setItem('rh_theme', theme);
  }, [theme]);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <TrendingUp size={20} strokeWidth={2.5} />
        Robinhood
      </div>

      <nav className="sidebar-nav">
        {NAV.map(({ id, label, Icon, key }) => (
          <button
            key={id}
            className={`nav-item${page === id ? ' active' : ''}`}
            onClick={() => navigate(id)}
          >
            <Icon size={17} />
            <span style={{ flex: 1 }}>{label}</span>
            <kbd style={{
              fontSize: 9, fontFamily: 'monospace', fontWeight: 700,
              padding: '1px 5px', borderRadius: 4,
              border: '1px solid var(--border)',
              color: 'var(--text3)', background: 'var(--bg2)',
            }}>{key}</kbd>
          </button>
        ))}
      </nav>

      {/* Market status */}
      <div style={{ padding: '12px 20px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '7px 12px', borderRadius: 8,
          background: market.open ? 'rgba(0,200,5,0.08)' : 'rgba(255,80,0,0.08)',
          border: `1px solid ${market.open ? 'rgba(0,200,5,0.2)' : 'rgba(255,80,0,0.2)'}`,
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
            background: market.open ? 'var(--green)' : 'var(--red)',
            boxShadow: market.open ? '0 0 6px var(--green)' : 'none',
            animation: market.open ? 'price-pulse 2s ease infinite' : 'none',
          }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: market.open ? 'var(--green)' : 'var(--red)' }}>
            {market.label}
          </span>
        </div>
      </div>

      {/* Bottom controls */}
      <div style={{ padding: '0 16px 16px', display: 'flex', gap: 8 }}>
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '8px', borderRadius: 8,
            border: '1px solid var(--border)', background: 'none',
            color: 'var(--text2)', cursor: 'pointer',
            fontSize: 11, fontWeight: 500, transition: 'all 0.12s',
          }}
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>

        {/* Keyboard shortcuts hint */}
        <button
          onClick={() => setShowKeys(v => !v)}
          title="Keyboard shortcuts"
          style={{
            padding: '8px 10px', borderRadius: 8,
            border: '1px solid var(--border)', background: 'none',
            color: 'var(--text2)', cursor: 'pointer', transition: 'all 0.12s',
          }}
        >
          <Keyboard size={14} />
        </button>
      </div>

      {/* Shortcuts popover */}
      {showKeys && (
        <div style={{
          position: 'absolute', bottom: 80, left: 16, right: 16,
          background: 'var(--bg3)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '12px 14px', zIndex: 200,
          animation: 'page-in 0.15s ease both',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Shortcuts
          </div>
          {SHORTCUTS.map(([key, label]) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text2)' }}>{label}</span>
              <kbd style={{
                fontSize: 10, fontFamily: 'monospace', fontWeight: 700,
                padding: '2px 6px', borderRadius: 4,
                border: '1px solid var(--border)', background: 'var(--bg2)',
                color: 'var(--text)',
              }}>{key}</kbd>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
