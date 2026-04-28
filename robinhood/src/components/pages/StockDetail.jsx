import { useState } from 'react';
import { ChevronLeft, Star, Bell, X, ExternalLink } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { STOCKS_BASE, getDayOpen } from '../../data/stocks';
import { getNews } from '../../data/news';
import PriceChart from '../PriceChart';
import Toast from '../Toast';

function fmt(n) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function Confetti() {
  const colors = ['#00C805', '#FFD700', '#FF5000', '#00BFFF', '#FF69B4', '#7B68EE'];
  const pieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    color: colors[i % colors.length],
    delay: Math.random() * 0.8,
    dur: 2.2 + Math.random() * 1.5,
    size: 7 + Math.random() * 7,
  }));
  return (
    <>
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`, top: '-12px',
            background: p.color, width: p.size, height: p.size,
            animationDelay: `${p.delay}s`, animationDuration: `${p.dur}s`,
          }}
        />
      ))}
    </>
  );
}

export default function StockDetail() {
  const {
    selectedTicker, prices, navigate,
    watchlist, toggleWatchlist,
    buyStock, sellStock,
    portfolio,
    alerts, addAlert, removeAlert,
    placeLimitOrder,
  } = useApp();

  const [tab, setTab] = useState('buy');
  const [orderType, setOrderType] = useState('market');
  const [sharesInput, setSharesInput] = useState('');
  const [limitPriceInput, setLimitPriceInput] = useState('');
  const [alertPriceInput, setAlertPriceInput] = useState('');
  const [toast, setToast] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const ticker = selectedTicker;
  const stock = STOCKS_BASE.find(s => s.ticker === ticker);
  if (!stock) return null;

  const price = prices[ticker] ?? stock.basePrice;
  const open = getDayOpen(ticker);
  const change = price - open;
  const changePct = open > 0 ? (change / open) * 100 : 0;
  const isUp = change >= 0;

  const isWatched = watchlist.includes(ticker);
  const holding = portfolio.holdings.find(h => h.ticker === ticker);
  const stockAlerts = alerts.filter(a => a.ticker === ticker);

  const sharesNum = Math.max(0, parseFloat(sharesInput) || 0);
  const limitPriceNum = Math.max(0, parseFloat(limitPriceInput) || 0);
  const alertPriceNum = Math.max(0, parseFloat(alertPriceInput) || 0);
  const total = orderType === 'limit'
    ? parseFloat((sharesNum * limitPriceNum).toFixed(2))
    : parseFloat((sharesNum * price).toFixed(2));

  const canBuy = tab === 'buy' && sharesNum > 0 && (
    orderType === 'limit'
      ? limitPriceNum > 0
      : total <= portfolio.cash
  );
  const canSell = tab === 'sell' && sharesNum > 0 && !!holding && sharesNum <= holding.shares && (
    orderType === 'limit' ? limitPriceNum > 0 : true
  );
  const canExecute = tab === 'buy' ? canBuy : canSell;

  function showToast(msg, type) { setToast({ msg, type }); }

  function handleTrade() {
    if (orderType === 'limit') {
      placeLimitOrder(ticker, tab, sharesNum, limitPriceNum);
      showToast(
        `Limit ${tab} placed — ${sharesNum} ${ticker} @ $${fmt(limitPriceNum)}`,
        'success'
      );
      setSharesInput('');
      setLimitPriceInput('');
      return;
    }

    const isFirstTrade = !localStorage.getItem('rh_first_trade');
    const result = tab === 'buy'
      ? buyStock(ticker, sharesNum, price)
      : sellStock(ticker, sharesNum, price);

    if (result.ok) {
      if (isFirstTrade) {
        localStorage.setItem('rh_first_trade', '1');
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 4000);
      }
      showToast(
        `${tab === 'buy' ? 'Bought' : 'Sold'} ${sharesNum} share${sharesNum !== 1 ? 's' : ''} of ${ticker}`,
        'success'
      );
      setSharesInput('');
    } else {
      showToast(result.msg, 'error');
    }
  }

  function handleAddAlert() {
    if (!alertPriceNum || alertPriceNum <= 0) return;
    const direction = alertPriceNum >= price ? 'above' : 'below';
    addAlert(ticker, alertPriceNum, direction);
    setAlertPriceInput('');
  }

  const gain = holding ? holding.shares * price - holding.shares * holding.avgCost : 0;
  const alertDirection = alertPriceNum > 0 ? (alertPriceNum >= price ? 'above' : 'below') : null;

  return (
    <div>
      {showConfetti && <Confetti />}
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <button
          onClick={() => navigate('home')}
          style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: 14 }}
        >
          <ChevronLeft size={17} /> Back
        </button>
        <button
          onClick={() => toggleWatchlist(ticker)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: isWatched ? 'var(--green)' : 'var(--text2)', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}
        >
          <Star size={15} fill={isWatched ? 'currentColor' : 'none'} />
          {isWatched ? 'Watching' : 'Add to Watchlist'}
        </button>
      </div>

      {/* Price header */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ fontSize: 13, color: 'var(--text2)' }}>{stock.name} · {stock.sector}</div>
        <div className="price-large" style={{ marginTop: 6 }}>${fmt(price)}</div>
        <div className={`price-change ${isUp ? 'up' : 'down'}`} style={{ marginTop: 6 }}>
          {isUp ? '+' : ''}${fmt(Math.abs(change))} ({isUp ? '+' : ''}{changePct.toFixed(2)}%) Today
        </div>
      </div>

      {/* Chart */}
      <div style={{ marginBottom: 32 }}>
        <PriceChart ticker={ticker} currentPrice={price} />
      </div>

      {/* Two-column layout — stacks on mobile via .stock-detail-grid */}
      <div className="stock-detail-grid">

        {/* Left: position + info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {holding && (
            <div className="card">
              <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 14, fontWeight: 600 }}>Your Position</div>
              {[
                ['Shares',       holding.shares],
                ['Avg Cost',     `$${fmt(holding.avgCost)}`],
                ['Market Value', `$${fmt(holding.shares * price)}`],
                ['Total Return', (
                  <span style={{ color: gain >= 0 ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
                    {gain >= 0 ? '+' : ''}${fmt(gain)}
                  </span>
                )],
              ].map(([label, value]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ color: 'var(--text2)', fontSize: 13 }}>{label}</span>
                  <span style={{ fontWeight: 600 }}>{value}</span>
                </div>
              ))}
            </div>
          )}

          <div className="card">
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 14, fontWeight: 600 }}>About {ticker}</div>
            {[
              ['Sector',       stock.sector],
              ["Today's Open", `$${fmt(open)}`],
              ['Market Cap',   stock.mcap],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ color: 'var(--text2)', fontSize: 13 }}>{label}</span>
                <span style={{ fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: trade panel */}
        <div className="trade-panel">
          {/* Buy / Sell tabs */}
          <div className="trade-tabs">
            <button className={`trade-tab${tab === 'buy'  ? ' active buy'  : ''}`} onClick={() => setTab('buy')}>Buy</button>
            <button className={`trade-tab${tab === 'sell' ? ' active sell' : ''}`} onClick={() => setTab('sell')}>Sell</button>
          </div>

          {/* Order type toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: 'var(--text2)' }}>Order Type</span>
            <div className="order-type-toggle">
              <button
                className={`order-type-btn${orderType === 'market' ? ' active' : ''}`}
                onClick={() => setOrderType('market')}
              >
                Market
              </button>
              <button
                className={`order-type-btn${orderType === 'limit' ? ' active' : ''}`}
                onClick={() => setOrderType('limit')}
              >
                Limit
              </button>
            </div>
          </div>

          {/* Shares input */}
          <div className="trade-input-label">Shares</div>
          <input
            type="number"
            className="trade-input"
            placeholder="0"
            min="0"
            step="1"
            value={sharesInput}
            onChange={e => setSharesInput(e.target.value)}
          />

          {/* Limit price input */}
          {orderType === 'limit' && (
            <>
              <div className="trade-input-label">Limit Price</div>
              <input
                type="number"
                className="trade-input"
                placeholder={price.toFixed(2)}
                min="0"
                step="0.01"
                value={limitPriceInput}
                onChange={e => setLimitPriceInput(e.target.value)}
              />
              {limitPriceNum > 0 && (
                <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: -10, marginBottom: 12 }}>
                  {tab === 'buy'
                    ? `Executes when ${ticker} drops to $${fmt(limitPriceNum)} or below`
                    : `Executes when ${ticker} rises to $${fmt(limitPriceNum)} or above`}
                </div>
              )}
            </>
          )}

          {/* Price info rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text2)' }}>
              <span>{orderType === 'limit' ? 'Market Price' : 'Price'}</span>
              <strong style={{ color: 'var(--text)' }}>${fmt(price)}</strong>
            </div>
            {tab === 'buy' && orderType === 'market' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text2)' }}>
                <span>Buying Power</span>
                <strong style={{ color: 'var(--text)' }}>${fmt(portfolio.cash)}</strong>
              </div>
            )}
            {tab === 'sell' && holding && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text2)' }}>
                <span>Available</span>
                <strong style={{ color: 'var(--text)' }}>{holding.shares} shares</strong>
              </div>
            )}
          </div>

          <div className="trade-summary">
            <span>{orderType === 'limit' ? 'Order Value' : 'Est. Total'}</span>
            <strong style={{ color: 'var(--text)' }}>
              {orderType === 'limit' && limitPriceNum === 0 ? '—' : `$${fmt(total)}`}
            </strong>
          </div>

          <button
            className={`btn btn-${tab}`}
            disabled={!canExecute}
            onClick={handleTrade}
          >
            {orderType === 'limit'
              ? `Place Limit ${tab === 'buy' ? 'Buy' : 'Sell'}`
              : `${tab === 'buy' ? 'Buy' : 'Sell'} ${ticker}`}
          </button>
        </div>
      </div>

      {/* Price Alerts */}
      <div className="card" style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Bell size={15} color="var(--text2)" />
          <span className="section-header" style={{ margin: 0 }}>Price Alerts</span>
        </div>

        {/* Add alert row */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text3)', fontSize: 14, fontWeight: 600, pointerEvents: 'none',
            }}>$</span>
            <input
              type="number"
              className="trade-input"
              style={{ paddingLeft: 24, marginBottom: 0 }}
              placeholder={price.toFixed(2)}
              value={alertPriceInput}
              onChange={e => setAlertPriceInput(e.target.value)}
            />
          </div>
          <button
            className="btn btn-buy"
            style={{ width: 'auto', padding: '10px 18px', borderRadius: 8, fontSize: 13, flexShrink: 0 }}
            onClick={handleAddAlert}
            disabled={!alertPriceNum}
          >
            Set Alert
          </button>
        </div>

        {/* Direction hint */}
        {alertDirection && (
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 12 }}>
            Notify when {ticker} goes{' '}
            <span style={{ color: alertDirection === 'above' ? 'var(--green)' : 'var(--red)', fontWeight: 600 }}>
              {alertDirection}
            </span>{' '}
            ${fmt(alertPriceNum)}
          </div>
        )}

        {/* Active alerts */}
        {stockAlerts.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--text3)', padding: '8px 0', textAlign: 'center' }}>
            No alerts for {ticker}
          </div>
        ) : (
          stockAlerts.map(alert => (
            <div
              key={alert.id}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderTop: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  padding: '2px 8px', borderRadius: 20,
                  background: alert.direction === 'above' ? 'var(--green-bg)' : 'var(--red-bg)',
                  color: alert.direction === 'above' ? 'var(--green)' : 'var(--red)',
                }}>
                  {alert.direction === 'above' ? '↑' : '↓'} ${fmt(alert.targetPrice)}
                </span>
                <span style={{ fontSize: 12, color: alert.triggered ? 'var(--green)' : 'var(--text3)' }}>
                  {alert.triggered ? '✓ Triggered' : 'Active'}
                </span>
              </div>
              <button
                onClick={() => removeAlert(alert.id)}
                style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 4, display: 'flex' }}
              >
                <X size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* News feed */}
      {getNews(ticker).length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div style={{ fontWeight: 600, marginBottom: 14 }}>News · {ticker}</div>
          {getNews(ticker).map((item, i) => (
            <div
              key={item.id}
              style={{
                paddingTop: i === 0 ? 0 : 14,
                paddingBottom: 14,
                borderBottom: i < getNews(ticker).length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', lineHeight: 1.45, marginBottom: 6 }}>
                {item.headline}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600 }}>{item.source}</span>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>·</span>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
