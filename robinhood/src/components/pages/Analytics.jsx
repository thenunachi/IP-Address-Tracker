import { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useApp } from '../../context/AppContext';
import { STOCKS_BASE } from '../../data/stocks';
import analyticsBg from './images/portfolio-analytics.png';

function fmt(n) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const SECTOR_COLORS = {
  'Technology':     '#00C805',
  'Automotive':     '#4a9eff',
  'E-Commerce':     '#FFD700',
  'Semiconductors': '#c084fc',
  'Social Media':   '#f472b6',
  'Entertainment':  '#fb923c',
  'Finance':        '#34d399',
  'Transportation': '#60a5fa',
};

function StatCard({ label, value, sub, color }) {
  return (
    <div className="card" style={{ flex: 1, minWidth: 0, background: 'rgba(0,0,0,0.35)' }}>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: color ?? 'var(--text)' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 5 }}>{sub}</div>}
    </div>
  );
}

export default function Analytics() {
  const { portfolio, portfolioValue, prices, orders, resetPortfolio } = useApp();
  const [confirmReset, setConfirmReset] = useState(false);

  // Sector breakdown for pie chart
  const sectorMap = {};
  portfolio.holdings.forEach(h => {
    const stock = STOCKS_BASE.find(s => s.ticker === h.ticker);
    const sector = stock?.sector ?? 'Other';
    const value  = h.shares * (prices[h.ticker] ?? 0);
    sectorMap[sector] = (sectorMap[sector] ?? 0) + value;
  });
  const pieData = Object.entries(sectorMap).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2)),
  }));

  // Unrealized P&L
  const unrealized = portfolio.holdings.reduce((sum, h) => {
    return sum + (h.shares * (prices[h.ticker] ?? 0) - h.shares * h.avgCost);
  }, 0);

  // Realized P&L from sell orders (gross proceeds)
  const realizedProceeds = orders.filter(o => o.type === 'sell').reduce((s, o) => s + o.total, 0);

  // Per-position performance
  const positions = portfolio.holdings.map(h => {
    const price    = prices[h.ticker] ?? 0;
    const value    = h.shares * price;
    const cost     = h.shares * h.avgCost;
    const gain     = value - cost;
    const gainPct  = cost > 0 ? (gain / cost) * 100 : 0;
    return { ticker: h.ticker, value, cost, gain, gainPct };
  }).sort((a, b) => b.gainPct - a.gainPct);

  const top    = positions[0];
  const worst  = positions[positions.length - 1];
  const isEmpty = portfolio.holdings.length === 0;

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <img src={analyticsBg} alt="" aria-hidden="true" className="analytics-bg-image" />
      <div className="analytics-bg-overlay" />
      <div style={{ position: 'relative', zIndex: 1 }}>
      <div className="section-header" style={{ marginBottom: 20 }}>Portfolio Analytics</div>

      {isEmpty ? (
        <div className="empty-state">
          <h3>No positions to analyse</h3>
          <p>Buy some stocks and come back here to see your analytics</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <StatCard
              label="Portfolio Value"
              value={`$${fmt(portfolioValue)}`}
              sub={`$${fmt(portfolio.cash)} cash available`}
            />
            <StatCard
              label="Unrealized P&L"
              value={`${unrealized >= 0 ? '+' : ''}$${fmt(unrealized)}`}
              sub={`${((unrealized / 10000) * 100).toFixed(2)}% vs starting balance`}
              color={unrealized >= 0 ? 'var(--green)' : 'var(--red)'}
            />
            <StatCard
              label="Realized Proceeds"
              value={`$${fmt(realizedProceeds)}`}
              sub={`${orders.filter(o => o.type === 'sell').length} sell orders`}
            />
          </div>

          {/* Sector pie chart */}
          <div className="card" style={{ marginBottom: 20, background: 'rgba(0,0,0,0.35)' }}>
            <div style={{ fontWeight: 600, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Holdings by Sector</div>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  dataKey="value"
                  paddingAngle={2}
                  stroke="rgba(0,0,0,0.4)"
                  strokeWidth={2}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={SECTOR_COLORS[entry.name] ?? '#888'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [`$${fmt(v)}`, 'Value']}
                  contentStyle={{
                    background: 'var(--bg3)', border: '1px solid var(--border)',
                    borderRadius: 8, fontSize: 12, color: 'var(--text)',
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(v) => <span style={{ fontSize: 12, color: 'var(--text2)' }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top / worst performer */}
          {positions.length >= 2 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {[
                { label: '🏆 Top Performer', pos: top,   color: 'var(--green)' },
                { label: '📉 Worst Performer', pos: worst, color: 'var(--red)'   },
              ].map(({ label, pos, color }) => pos && (
                <div key={label} className="card" style={{ background: 'rgba(0,0,0,0.35)' }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginBottom: 8, fontWeight: 600 }}>{label}</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{pos.ticker}</div>
                  <div style={{ fontSize: 13, color, fontWeight: 600, marginTop: 4 }}>
                    {pos.gainPct >= 0 ? '+' : ''}{pos.gainPct.toFixed(2)}%
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                    {pos.gain >= 0 ? '+' : ''}${fmt(pos.gain)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Position breakdown table */}
          <div className="card" style={{ background: 'rgba(0,0,0,0.35)' }}>
            <div style={{ fontWeight: 600, marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Position Breakdown</div>
            {positions.map(pos => (
              <div key={pos.ticker} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: '1px solid var(--border)',
              }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{pos.ticker}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>Cost ${fmt(pos.cost)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600 }}>${fmt(pos.value)}</div>
                  <div style={{ fontSize: 12, color: pos.gain >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                    {pos.gain >= 0 ? '+' : ''}${fmt(pos.gain)} ({pos.gainPct >= 0 ? '+' : ''}{pos.gainPct.toFixed(2)}%)
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Reset portfolio */}
      <div className="card" style={{ marginTop: 20, background: 'rgba(0,0,0,0.35)' }}>
        <div style={{ fontWeight: 600, marginBottom: 6, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Reset Portfolio</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 14 }}>
          Wipes all positions, orders and alerts — restores $10,000 buying power.
        </div>
        {confirmReset ? (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn btn-sell"
              style={{ fontSize: 13, padding: '10px' }}
              onClick={() => { resetPortfolio(); setConfirmReset(false); }}
            >
              Yes, reset everything
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              style={{
                flex: 1, padding: '10px', borderRadius: 50,
                border: '1px solid var(--border)', background: 'none',
                color: 'var(--text2)', fontSize: 13, cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            style={{
              padding: '9px 20px', borderRadius: 8,
              border: '1px solid var(--border)', background: 'none',
              color: 'var(--red)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.12s',
            }}
          >
            Reset Portfolio
          </button>
        )}
      </div>
      </div>
    </div>
  );
}
