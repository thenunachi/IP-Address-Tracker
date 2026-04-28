import { Home, Star, Search, ClipboardList, BarChart2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const NAV = [
  { id: 'home',      label: 'Home',      Icon: Home          },
  { id: 'watchlist', label: 'Watchlist', Icon: Star          },
  { id: 'search',    label: 'Search',    Icon: Search        },
  { id: 'orders',    label: 'Orders',    Icon: ClipboardList },
  { id: 'analytics', label: 'Analytics', Icon: BarChart2     },
];

export default function BottomNav() {
  const { page, navigate } = useApp();

  return (
    <nav className="bottom-nav">
      {NAV.map(({ id, label, Icon }) => (
        <button
          key={id}
          className={`bottom-nav-item${page === id ? ' active' : ''}`}
          onClick={() => navigate(id)}
        >
          <Icon size={19} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
