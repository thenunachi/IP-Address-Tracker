import { useApp } from '../../context/AppContext';
import ordersBg from './images/orders.png';

function fmt(n) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(iso) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function TypeBadge({ type, isLimit }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 4,
      textTransform: 'uppercase', letterSpacing: '0.5px',
      background: type === 'buy' ? 'var(--green-bg)' : 'var(--red-bg)',
      color:       type === 'buy' ? 'var(--green)'   : 'var(--red)',
    }}>
      {type}{isLimit ? ' limit' : ''}
    </span>
  );
}

export default function Orders() {
  const { orders, limitOrders, navigate, cancelLimitOrder } = useApp();

  const pendingOrders = limitOrders.filter(o => o.status === 'pending');
  const hasHistory = orders.length > 0;

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <img
        src={ordersBg}
        alt=""
        aria-hidden="true"
        className="orders-bg-image"
      />
      <div className="orders-bg-overlay" />
      <div style={{ position: 'relative', zIndex: 1 }}>
      {/* Pending limit orders */}
      {pendingOrders.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div className="section-header" style={{ marginBottom: 4 }}>Pending Orders</div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 12 }}>
            Will execute automatically when price condition is met
          </div>
          {pendingOrders.map(order => (
            <div
              key={order.id}
              className="stock-row"
              style={{ cursor: 'default' }}
            >
              <div className="stock-row-left" onClick={() => navigate('detail', order.ticker)} style={{ cursor: 'pointer', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <TypeBadge type={order.type} isLimit />
                  <span className="stock-ticker">{order.ticker}</span>
                  {/* Pulsing dot to show "live" */}
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: 'var(--green)',
                    display: 'inline-block',
                    animation: 'price-pulse 2s ease infinite',
                  }} />
                </div>
                <span className="stock-name" style={{ marginTop: 3 }}>
                  {order.shares} shares · Limit ${fmt(order.limitPrice)} ·{' '}
                  {order.type === 'buy' ? 'Fills when price ≤' : 'Fills when price ≥'} ${fmt(order.limitPrice)}
                </span>
              </div>
              <button
                onClick={() => cancelLimitOrder(order.id)}
                style={{
                  background: 'none', border: '1px solid var(--border)',
                  borderRadius: 6, color: 'var(--text2)',
                  fontSize: 12, fontWeight: 500,
                  padding: '5px 12px', cursor: 'pointer',
                  transition: 'all 0.12s', flexShrink: 0, marginLeft: 12,
                }}
                onMouseEnter={e => { e.target.style.borderColor = 'var(--red)'; e.target.style.color = 'var(--red)'; }}
                onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text2)'; }}
              >
                Cancel
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Order history */}
      <div className="section-header">Order History</div>

      {!hasHistory ? (
        <div className="empty-state">
          <h3>No orders yet</h3>
          <p>Your trade history will appear here</p>
        </div>
      ) : (
        orders.map(order => (
          <div
            key={order.id}
            className="stock-row"
            onClick={() => navigate('detail', order.ticker)}
          >
            <div className="stock-row-left">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <TypeBadge type={order.type} isLimit={order.isLimit} />
                <span className="stock-ticker">{order.ticker}</span>
              </div>
              <span className="stock-name" style={{ marginTop: 3 }}>
                {order.shares} {order.shares === 1 ? 'share' : 'shares'} · {fmtDate(order.date)}
              </span>
            </div>
            <div className="stock-row-right">
              <span className="stock-price">${fmt(order.total)}</span>
              <span className="stock-name">@ ${fmt(order.price)}</span>
            </div>
          </div>
        ))
      )}
      </div>
    </div>
  );
}
