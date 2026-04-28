import { useState } from 'react';
import { X, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const QUICK = [100, 500, 1000, 5000];

function fmt(n) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function DepositModal({ onClose }) {
  const { portfolio, depositCash } = useApp();
  const [tab, setTab]       = useState('deposit');
  const [amount, setAmount] = useState('');

  const num        = Math.max(0, parseFloat(amount) || 0);
  const canDeposit = tab === 'deposit'  && num > 0;
  const canWithdraw = tab === 'withdraw' && num > 0 && num <= portfolio.cash;
  const canGo      = tab === 'deposit' ? canDeposit : canWithdraw;

  function confirm() {
    depositCash(tab === 'deposit' ? num : -num);
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Transfer Cash</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Deposit / Withdraw tabs */}
        <div className="trade-tabs" style={{ marginBottom: 20 }}>
          <button
            className={`trade-tab${tab === 'deposit'  ? ' active buy'  : ''}`}
            onClick={() => { setTab('deposit');  setAmount(''); }}
          >
            <ArrowDownCircle size={14} style={{ marginRight: 5, verticalAlign: 'middle' }} />
            Deposit
          </button>
          <button
            className={`trade-tab${tab === 'withdraw' ? ' active sell' : ''}`}
            onClick={() => { setTab('withdraw'); setAmount(''); }}
          >
            <ArrowUpCircle size={14} style={{ marginRight: 5, verticalAlign: 'middle' }} />
            Withdraw
          </button>
        </div>

        {/* Quick amounts */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {QUICK.map(q => (
            <button
              key={q}
              className="quick-amount-btn"
              onClick={() => setAmount(String(q))}
            >
              ${q.toLocaleString()}
            </button>
          ))}
        </div>

        {/* Amount input */}
        <div className="trade-input-label">Amount</div>
        <input
          type="number"
          className="trade-input"
          placeholder="0.00"
          min="0"
          step="0.01"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          autoFocus
        />

        {/* Info row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>
          <span>{tab === 'deposit' ? 'Simulated bank transfer' : 'Buying Power Available'}</span>
          <strong style={{ color: 'var(--text)' }}>
            {tab === 'withdraw' ? `$${fmt(portfolio.cash)}` : '∞'}
          </strong>
        </div>

        <button
          className={`btn btn-${tab === 'deposit' ? 'buy' : 'sell'}`}
          disabled={!canGo}
          onClick={confirm}
        >
          {tab === 'deposit' ? 'Deposit' : 'Withdraw'} {num > 0 ? `$${fmt(num)}` : ''}
        </button>
      </div>
    </div>
  );
}
