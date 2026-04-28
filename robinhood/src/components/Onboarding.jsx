import { useState } from 'react';
import { TrendingUp, Shield, Zap, BarChart2 } from 'lucide-react';

const FEATURES = [
  { Icon: BarChart2, text: 'Real-time prices on 15 stocks, updated every 3 seconds' },
  { Icon: Zap,       text: 'Market & limit orders, price alerts, and portfolio analytics' },
  { Icon: Shield,    text: 'Paper trading only — no real money, zero risk' },
];

export default function Onboarding({ onComplete }) {
  const [animating, setAnimating] = useState(false);

  function handleStart() {
    setAnimating(true);
    setTimeout(onComplete, 400);
  }

  return (
    <div className={`onboarding${animating ? ' onboarding-exit' : ''}`}>
      <div className="onboarding-card">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 32 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'var(--green-bg)', border: '2px solid var(--green)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <TrendingUp size={28} color="var(--green)" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px' }}>
            Robinhood
          </span>
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 700, textAlign: 'center', marginBottom: 8, letterSpacing: '-0.5px' }}>
          Welcome to paper trading
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text2)', textAlign: 'center', marginBottom: 32 }}>
          Practice investing without risking real money
        </p>

        {/* Starting balance */}
        <div style={{
          background: 'var(--green-bg)',
          border: '1px solid rgba(0,200,5,0.3)',
          borderRadius: 16,
          padding: '20px 24px',
          textAlign: 'center',
          marginBottom: 32,
        }}>
          <div style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
            Your Starting Balance
          </div>
          <div style={{ fontSize: 44, fontWeight: 800, color: 'var(--green)', letterSpacing: '-1px' }}>
            $10,000.00
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
            Paper money — practice freely
          </div>
        </div>

        {/* Feature list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
          {FEATURES.map(({ Icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'var(--bg3)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={16} color="var(--text2)" />
              </div>
              <span style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.4 }}>{text}</span>
            </div>
          ))}
        </div>

        <button className="btn btn-buy" onClick={handleStart} style={{ fontSize: 16, padding: '16px' }}>
          Get Started →
        </button>

        <p style={{ fontSize: 11, color: 'var(--text3)', textAlign: 'center', marginTop: 16 }}>
          No account needed · No real money · Resets any time
        </p>
      </div>
    </div>
  );
}
