import { useApp } from '../../context/AppContext';
import { STOCKS_BASE, getDayOpen } from '../../data/stocks';
import MiniSparkline from '../MiniSparkline';
import watchlistBg from './images/watchlist.png';

function fmt(n) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Watchlist() {
  const { watchlist, prices, navigate, priceFlash, tickCount } = useApp();

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <img
        src={watchlistBg}
        alt=""
        aria-hidden="true"
        className="watchlist-bg-image"
      />
      <div className="watchlist-bg-overlay" />
      <div style={{ position: 'relative', zIndex: 1 }}>
      <div className="section-header" style={{ marginBottom: 20 }}>Watchlist</div>

      {watchlist.length === 0 ? (
        <div className="empty-state">
          <h3>Your watchlist is empty</h3>
          <p>Open any stock and tap "Add to Watchlist"</p>
        </div>
      ) : (
        watchlist.map((ticker, idx) => {
          const stock = STOCKS_BASE.find(s => s.ticker === ticker);
          if (!stock) return null;

          const price = prices[ticker] ?? stock.basePrice;
          const open = getDayOpen(ticker);
          const change = price - open;
          const changePct = open > 0 ? (change / open) * 100 : 0;
          const isUp = change >= 0;
          const flash = priceFlash[ticker];

          return (
            <div
              key={ticker}
              className="stock-row list-item"
              style={{ animationDelay: `${idx * 0.05}s` }}
              onClick={() => navigate('detail', ticker)}
            >
              <div className="stock-row-left">
                <span className="stock-ticker">{ticker}</span>
                <span className="stock-name">{stock.name}</span>
              </div>
              <MiniSparkline ticker={ticker} isUp={isUp} />
              <div className="stock-row-right">
                <span
                  key={`${ticker}-${tickCount}`}
                  className={`stock-price${flash ? ` price-flash-${flash}` : ''}`}
                >
                  ${fmt(price)}
                </span>
                <span className={`stock-badge ${isUp ? 'up' : 'down'}`}>
                  {isUp ? '+' : ''}{changePct.toFixed(2)}%
                </span>
              </div>
            </div>
          );
        })
      )}
      </div>
    </div>
  );
}
