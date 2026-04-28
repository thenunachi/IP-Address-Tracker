import { useState } from 'react';
import { Search as SearchIcon, ArrowUpDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { STOCKS_BASE, getDayOpen } from '../../data/stocks';
import searchBg from './images/search.png';

function fmt(n) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const SECTORS = ['All', ...new Set(STOCKS_BASE.map(s => s.sector))];
const SORTS = [
  { id: 'default',  label: 'Default'  },
  { id: 'gainers',  label: 'Gainers'  },
  { id: 'losers',   label: 'Losers'   },
  { id: 'name',     label: 'A → Z'    },
  { id: 'price',    label: 'Price ↓'  },
];

export default function Search() {
  const [query,  setQuery]  = useState('');
  const [sector, setSector] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const { prices, navigate, priceFlash, tickCount } = useApp();

  function changePct(ticker) {
    const price = prices[ticker] ?? 0;
    const open  = getDayOpen(ticker);
    return open > 0 ? (price - open) / open * 100 : 0;
  }

  const filtered = STOCKS_BASE
    .filter(s => {
      const matchQuery  = !query.trim() || s.ticker.toLowerCase().includes(query.toLowerCase()) || s.name.toLowerCase().includes(query.toLowerCase());
      const matchSector = sector === 'All' || s.sector === sector;
      return matchQuery && matchSector;
    })
    .sort((a, b) => {
      if (sortBy === 'gainers') return changePct(b.ticker) - changePct(a.ticker);
      if (sortBy === 'losers')  return changePct(a.ticker) - changePct(b.ticker);
      if (sortBy === 'name')    return a.name.localeCompare(b.name);
      if (sortBy === 'price')   return (prices[b.ticker] ?? 0) - (prices[a.ticker] ?? 0);
      return 0;
    });

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <img
        src={searchBg}
        alt="" aria-hidden="true" className="search-bg-image"
      />
      <div className="search-bg-overlay" />
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Search input */}
        <div className="search-wrapper">
          <SearchIcon size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search stocks by name or ticker…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        {/* Sector filter chips */}
        <div className="filter-chips" style={{ marginBottom: 10 }}>
          {SECTORS.map(s => (
            <button
              key={s}
              className={`filter-chip${sector === s ? ' active' : ''}`}
              onClick={() => setSector(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Sort bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, overflowX: 'auto', scrollbarWidth: 'none' }}>
          <ArrowUpDown size={13} color="var(--text3)" style={{ flexShrink: 0 }} />
          {SORTS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setSortBy(id)}
              style={{
                flexShrink: 0,
                padding: '4px 10px', borderRadius: 6, border: 'none',
                background: sortBy === id ? 'var(--hover)' : 'none',
                color: sortBy === id ? 'var(--text)' : 'var(--text3)',
                fontSize: 12, fontWeight: sortBy === id ? 700 : 500,
                cursor: 'pointer', transition: 'all 0.12s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="empty-state">
            <h3>No results</h3>
            <p>Try a different ticker, company name, or sector</p>
          </div>
        )}

        {filtered.map((stock, idx) => {
          const price     = prices[stock.ticker] ?? stock.basePrice;
          const pct       = changePct(stock.ticker);
          const isUp      = pct >= 0;
          const flash     = priceFlash[stock.ticker];

          return (
            <div
              key={stock.ticker}
              className="stock-row list-item"
              style={{ animationDelay: `${idx * 0.03}s` }}
              onClick={() => navigate('detail', stock.ticker)}
            >
              <div className="stock-row-left">
                <span className="stock-ticker">{stock.ticker}</span>
                <span className="stock-name">{stock.name} · {stock.sector}</span>
              </div>
              <div className="stock-row-right">
                <span key={`${stock.ticker}-${tickCount}`} className={`stock-price${flash ? ` price-flash-${flash}` : ''}`}>
                  ${fmt(price)}
                </span>
                <span className={`stock-badge ${isUp ? 'up' : 'down'}`}>
                  {isUp ? '+' : ''}{pct.toFixed(2)}%
                </span>
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
}
