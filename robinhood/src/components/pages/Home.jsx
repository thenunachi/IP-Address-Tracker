import { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../../context/AppContext';
import { STOCKS_BASE, getDayOpen } from '../../data/stocks';
import MiniSparkline from '../MiniSparkline';
import DepositModal from '../DepositModal';
import homeBg from './images/home-page.png';

function fmt(n) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── Generate portfolio history per period ──────────────────────────────────

function genPrices(count, vol) {
  let v = 9400 + Math.random() * 900;
  const arr = Array.from({ length: count }, () => {
    v = Math.max(500, v * (1 + (Math.random() - 0.47) * vol));
    return parseFloat(v.toFixed(2));
  });
  const scale = 10000 / arr[arr.length - 1];
  return arr.map(p => parseFloat((p * scale).toFixed(2)));
}

function makeLabels(period) {
  const now = new Date();
  switch (period) {
    case '1D': {
      const out = [];
      for (let h = 9; h <= 15; h++) {
        for (let m = 0; m < 60; m += 5) {
          if (h === 9 && m < 30) continue;
          if (h === 15 && m > 30) break;
          out.push(`${h}:${String(m).padStart(2, '0')}`);
        }
      }
      return out;
    }
    case '1W':
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (6 - i));
        return d.toLocaleDateString('en-US', { weekday: 'short' });
      });
    case '1M':
      return Array.from({ length: 30 }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (29 - i));
        return `${d.getMonth() + 1}/${d.getDate()}`;
      });
    case '1Y':
      return Array.from({ length: 52 }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (51 - i) * 7);
        return d.toLocaleDateString('en-US', { month: 'short' });
      });
    default: return [];
  }
}

const VOL  = { '1D': 0.003, '1W': 0.014, '1M': 0.013, '1Y': 0.025 };
const LABEL = { '1D': 'Today', '1W': 'Past week', '1M': 'Past month', '1Y': 'Past year' };

// Generated once per session so they don't re-randomise on re-render
const HISTORIES = Object.fromEntries(
  ['1D', '1W', '1M', '1Y'].map(p => {
    const labels  = makeLabels(p);
    const prices  = genPrices(labels.length, VOL[p]);
    return [p, labels.map((label, i) => ({ label, value: prices[i] }))];
  })
);

// ── Component ──────────────────────────────────────────────────────────────

export default function Home() {
  const { portfolio, portfolioValue, prices, navigate } = useApp();
  const [period, setPeriod] = useState('1M');
  const [chartKey, setChartKey] = useState('1M');

  function changePeriod(p) {
    setPeriod(p);
    setChartKey(`${p}-${Date.now()}`);
  }

  const historyData = useMemo(() => {
    const base = HISTORIES[period];
    const copy = [...base];
    copy[copy.length - 1] = { ...copy[copy.length - 1], value: portfolioValue };
    return copy;
  }, [period, portfolioValue]);

  const periodStartValue = historyData[0]?.value ?? 10000;
  const periodGain    = portfolioValue - periodStartValue;
  const periodGainPct = (periodGain / periodStartValue) * 100;
  const isUp  = periodGain >= 0;
  const color = isUp ? 'var(--green)' : 'var(--red)';
  const invested = portfolioValue - portfolio.cash;
  const [showDeposit, setShowDeposit] = useState(false);

  const topMovers = useMemo(() => {
    return STOCKS_BASE.map(s => {
      const price     = prices[s.ticker] ?? s.basePrice;
      const open      = getDayOpen(s.ticker);
      const changePct = open > 0 ? ((price - open) / open) * 100 : 0;
      return { ...s, price, changePct };
    })
      .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))
      .slice(0, 6);
  }, [prices]);

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <img src={homeBg} alt="" aria-hidden="true" className="home-bg-image" />
      <div className="home-bg-overlay" />

      {showDeposit && <DepositModal onClose={() => setShowDeposit(false)} />}

      {/* All page content sits above the background */}
      <div style={{ position: 'relative', zIndex: 1 }}>
      {/* Portfolio card: value + chart + period selector */}
      <div className="card" style={{ marginBottom: 20, padding: '28px 24px 14px' }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Portfolio Value</div>
          <div className="price-large">${fmt(portfolioValue)}</div>
          <div className={`price-change ${isUp ? 'up' : 'down'}`} style={{ marginTop: 6 }}>
            {isUp ? '+' : ''}{fmt(periodGain)} ({isUp ? '+' : ''}{periodGainPct.toFixed(2)}%) {LABEL[period]}
          </div>
        </div>

        <div style={{ marginLeft: -20, marginRight: -20 }}>
        <div key={chartKey} className="chart-fade">
          <ResponsiveContainer width="100%" height={155}>
            <AreaChart data={historyData} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={color} stopOpacity={0}   />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" hide />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip
                formatter={(v) => [`$${fmt(v)}`, 'Value']}
                contentStyle={{
                  background: 'var(--bg3)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 12,
                  color: 'var(--text)',
                }}
                labelStyle={{ display: 'none' }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill="url(#portGrad)"
                dot={false}
                activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        </div>

        <div className="period-selector" style={{ justifyContent: 'center', marginTop: 4 }}>
          {['1D', '1W', '1M', '1Y'].map(p => (
            <button
              key={p}
              className={`period-btn${period === p ? ' active' : ''}`}
              onClick={() => changePeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Cash / Invested + Deposit */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>Buying Power</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>${fmt(portfolio.cash)}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>Invested</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>${fmt(Math.max(0, invested))}</div>
        </div>
        <button
          onClick={() => setShowDeposit(true)}
          style={{
            padding: '8px 16px', borderRadius: 20, border: '1px solid var(--green)',
            background: 'var(--green-bg)', color: 'var(--green)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.12s', flexShrink: 0,
          }}
        >
          + Deposit
        </button>
      </div>

      {/* Top Movers */}
      <div style={{ marginBottom: 24 }}>
        <div className="section-header" style={{ marginBottom: 10 }}>Top Movers</div>
        <div className="movers-strip">
          {topMovers.map(s => (
            <div key={s.ticker} className="mover-card" onClick={() => navigate('detail', s.ticker)}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{s.ticker}</div>
              <div style={{ fontSize: 13, fontWeight: 600, margin: '4px 0' }}>${fmt(s.price)}</div>
              <span className={`stock-badge ${s.changePct >= 0 ? 'up' : 'down'}`}>
                {s.changePct >= 0 ? '+' : ''}{s.changePct.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Holdings */}
      <div className="section-header">Positions</div>

      {portfolio.holdings.length === 0 ? (
        <div className="empty-state">
          <h3>No positions yet</h3>
          <p>Search for stocks and place your first trade</p>
        </div>
      ) : (
        portfolio.holdings.map((h, idx) => {
          const price     = prices[h.ticker] ?? 0;
          const value     = h.shares * price;
          const costBasis = h.shares * h.avgCost;
          const gain      = value - costBasis;
          const gainPct   = costBasis > 0 ? (gain / costBasis) * 100 : 0;
          const isUp      = gain >= 0;

          return (
            <div
              key={h.ticker}
              className="list-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 12px',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'background 0.12s',
                animationDelay: `${idx * 0.06}s`,
              }}
              onClick={() => navigate('detail', h.ticker)}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Left: name + cost info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="stock-ticker">{h.ticker}</div>
                <div className="stock-name" style={{ marginTop: 2 }}>
                  {h.shares} {h.shares === 1 ? 'share' : 'shares'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>
                  Paid ${fmt(costBasis)}
                </div>
              </div>

              {/* Middle: sparkline with avg-cost reference line */}
              <MiniSparkline ticker={h.ticker} isUp={isUp} avgCost={h.avgCost} />

              {/* Right: current value + dollar + % gain */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div className="stock-price">${fmt(value)}</div>
                <div style={{
                  fontSize: 12, fontWeight: 600, marginTop: 2,
                  color: isUp ? 'var(--green)' : 'var(--red)',
                }}>
                  {isUp ? '+' : ''}${fmt(gain)}
                </div>
                <span className={`stock-badge ${isUp ? 'up' : 'down'}`} style={{ marginTop: 3, display: 'inline-block' }}>
                  {isUp ? '+' : ''}{gainPct.toFixed(2)}%
                </span>
              </div>
            </div>
          );
        })
      )}
      </div>{/* end content zIndex wrapper */}
    </div>
  );
}
