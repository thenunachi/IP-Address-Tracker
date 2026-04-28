import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { STOCKS_BASE } from '../data/stocks';
import { playAlertSound, playFillSound } from '../utils/sounds';

const Ctx = createContext(null);

function load(key, def) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : def;
  } catch {
    return def;
  }
}

export function AppProvider({ children }) {
  const [page, setPage] = useState('home');
  const [selectedTicker, setSelectedTicker] = useState(null);
  const [portfolio, setPortfolio] = useState(() => load('rh_portfolio', { cash: 10000, holdings: [] }));
  const [watchlist, setWatchlist] = useState(() => load('rh_watchlist', ['AAPL', 'TSLA', 'NVDA', 'META']));
  const [orders, setOrders] = useState(() => load('rh_orders', []));
  const [alerts, setAlerts] = useState(() => load('rh_alerts', []));
  const [limitOrders, setLimitOrders] = useState(() => load('rh_limit_orders', []));
  const [globalToast, setGlobalToast] = useState(null);

  const [prices, setPrices] = useState(() => {
    const p = {};
    STOCKS_BASE.forEach(s => { p[s.ticker] = s.basePrice; });
    return p;
  });
  const [priceFlash, setPriceFlash] = useState({});
  const [tickCount, setTickCount] = useState(0);

  // Refs so the interval always reads fresh values without stale closures
  const pricesRef = useRef({});
  const alertsRef = useRef([]);
  const limitOrdersRef = useRef([]);
  useEffect(() => { pricesRef.current = prices; }, [prices]);
  useEffect(() => { alertsRef.current = alerts; }, [alerts]);
  useEffect(() => { limitOrdersRef.current = limitOrders; }, [limitOrders]);

  // Persistence
  useEffect(() => { localStorage.setItem('rh_portfolio', JSON.stringify(portfolio)); }, [portfolio]);
  useEffect(() => { localStorage.setItem('rh_watchlist', JSON.stringify(watchlist)); }, [watchlist]);
  useEffect(() => { localStorage.setItem('rh_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('rh_alerts', JSON.stringify(alerts)); }, [alerts]);
  useEffect(() => { localStorage.setItem('rh_limit_orders', JSON.stringify(limitOrders)); }, [limitOrders]);

  // Price tick: update prices, check alerts, check limit orders
  useEffect(() => {
    const id = setInterval(() => {
      // 1. Compute new prices
      const prev = pricesRef.current;
      const next = {};
      const flash = {};
      STOCKS_BASE.forEach(s => {
        const drift = (Math.random() - 0.48) * 0.002;
        const newPrice = Math.max(1, parseFloat((prev[s.ticker] * (1 + drift)).toFixed(2)));
        flash[s.ticker] = newPrice >= prev[s.ticker] ? 'up' : 'down';
        next[s.ticker] = newPrice;
      });
      setPrices(next);
      setPriceFlash(flash);
      setTickCount(c => c + 1);

      // 2. Check price alerts
      const currentAlerts = alertsRef.current;
      let firstTriggered = null;
      const updatedAlerts = currentAlerts.map(alert => {
        if (alert.triggered) return alert;
        const price = next[alert.ticker];
        const hit = alert.direction === 'above'
          ? price >= alert.targetPrice
          : price <= alert.targetPrice;
        if (hit && !firstTriggered) firstTriggered = alert;
        return hit ? { ...alert, triggered: true } : alert;
      });
      if (firstTriggered) {
        setAlerts(updatedAlerts);
        playAlertSound();
        setGlobalToast({
          id: Date.now(),
          msg: `🔔 ${firstTriggered.ticker} reached $${firstTriggered.targetPrice.toFixed(2)}`,
          type: 'info',
        });
      }

      // 3. Check and fill pending limit orders
      const currentLimitOrders = limitOrdersRef.current;
      const toFill = currentLimitOrders.filter(o => {
        if (o.status !== 'pending') return false;
        const price = next[o.ticker];
        return o.type === 'buy' ? price <= o.limitPrice : price >= o.limitPrice;
      });

      if (toFill.length > 0) {
        toFill.forEach(order => {
          if (order.type === 'buy') {
            const cost = order.shares * order.limitPrice;
            setPortfolio(prev => {
              if (cost > prev.cash) return prev;
              const existing = prev.holdings.find(h => h.ticker === order.ticker);
              let holdings;
              if (existing) {
                const total = existing.shares + order.shares;
                const avg = parseFloat(
                  ((existing.shares * existing.avgCost + order.shares * order.limitPrice) / total).toFixed(2)
                );
                holdings = prev.holdings.map(h =>
                  h.ticker === order.ticker ? { ...h, shares: total, avgCost: avg } : h
                );
              } else {
                holdings = [...prev.holdings, { ticker: order.ticker, shares: order.shares, avgCost: order.limitPrice }];
              }
              return { cash: parseFloat((prev.cash - cost).toFixed(2)), holdings };
            });
          } else {
            const proceeds = order.shares * order.limitPrice;
            setPortfolio(prev => {
              const h = prev.holdings.find(h => h.ticker === order.ticker);
              if (!h || h.shares < order.shares) return prev;
              const holdings = h.shares === order.shares
                ? prev.holdings.filter(hh => hh.ticker !== order.ticker)
                : prev.holdings.map(hh =>
                    hh.ticker === order.ticker ? { ...hh, shares: hh.shares - order.shares } : hh
                  );
              return { cash: parseFloat((prev.cash + proceeds).toFixed(2)), holdings };
            });
          }

          setOrders(prev => [{
            id: Date.now() + Math.random(),
            ticker: order.ticker,
            type: order.type,
            shares: order.shares,
            price: order.limitPrice,
            total: parseFloat((order.shares * order.limitPrice).toFixed(2)),
            date: new Date().toISOString(),
            isLimit: true,
          }, ...prev]);
        });

        setLimitOrders(
          currentLimitOrders.map(o =>
            toFill.some(f => f.id === o.id)
              ? { ...o, status: 'filled', filledAt: new Date().toISOString() }
              : o
          )
        );

        playFillSound();
        const first = toFill[0];
        setGlobalToast({
          id: Date.now(),
          msg: `✓ Limit ${first.type} filled — ${first.shares} ${first.ticker} @ $${first.limitPrice.toFixed(2)}`,
          type: 'success',
        });
      }
    }, 3000);

    return () => clearInterval(id);
  }, []); // stable: uses refs + stable setState functions

  function navigate(newPage, ticker = null) {
    setPage(newPage);
    if (ticker !== null) setSelectedTicker(ticker);
  }

  function buyStock(ticker, shares, price) {
    const cost = parseFloat((shares * price).toFixed(2));
    if (cost > portfolio.cash) return { ok: false, msg: 'Insufficient funds' };

    setPortfolio(prev => {
      const existing = prev.holdings.find(h => h.ticker === ticker);
      let holdings;
      if (existing) {
        const totalShares = existing.shares + shares;
        const avgCost = parseFloat(
          ((existing.shares * existing.avgCost + shares * price) / totalShares).toFixed(2)
        );
        holdings = prev.holdings.map(h =>
          h.ticker === ticker ? { ...h, shares: totalShares, avgCost } : h
        );
      } else {
        holdings = [...prev.holdings, { ticker, shares, avgCost: price }];
      }
      return { cash: parseFloat((prev.cash - cost).toFixed(2)), holdings };
    });

    recordOrder(ticker, 'buy', shares, price);
    return { ok: true };
  }

  function sellStock(ticker, shares, price) {
    const holding = portfolio.holdings.find(h => h.ticker === ticker);
    if (!holding || holding.shares < shares) return { ok: false, msg: 'Not enough shares' };

    const proceeds = parseFloat((shares * price).toFixed(2));
    setPortfolio(prev => {
      const h = prev.holdings.find(h => h.ticker === ticker);
      const holdings =
        h.shares === shares
          ? prev.holdings.filter(hh => hh.ticker !== ticker)
          : prev.holdings.map(hh =>
              hh.ticker === ticker ? { ...hh, shares: hh.shares - shares } : hh
            );
      return { cash: parseFloat((prev.cash + proceeds).toFixed(2)), holdings };
    });

    recordOrder(ticker, 'sell', shares, price);
    return { ok: true };
  }

  function recordOrder(ticker, type, shares, price, extra = {}) {
    setOrders(prev => [
      {
        id: Date.now(),
        ticker, type, shares, price,
        total: parseFloat((shares * price).toFixed(2)),
        date: new Date().toISOString(),
        ...extra,
      },
      ...prev,
    ]);
  }

  function resetPortfolio() {
    setPortfolio({ cash: 10000, holdings: [] });
    setOrders([]);
    setAlerts([]);
    setLimitOrders([]);
  }

  function depositCash(amount) {
    setPortfolio(prev => ({
      ...prev,
      cash: parseFloat((prev.cash + amount).toFixed(2)),
    }));
  }

  function toggleWatchlist(ticker) {
    setWatchlist(prev =>
      prev.includes(ticker) ? prev.filter(t => t !== ticker) : [...prev, ticker]
    );
  }

  function addAlert(ticker, targetPrice, direction) {
    setAlerts(prev => [
      ...prev,
      { id: Date.now(), ticker, targetPrice, direction, triggered: false, createdAt: new Date().toISOString() },
    ]);
  }

  function removeAlert(id) {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }

  function placeLimitOrder(ticker, type, shares, limitPrice) {
    setLimitOrders(prev => [
      ...prev,
      { id: Date.now(), ticker, type, shares, limitPrice, status: 'pending', createdAt: new Date().toISOString() },
    ]);
  }

  function cancelLimitOrder(id) {
    setLimitOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'cancelled' } : o));
  }

  const portfolioValue = parseFloat(
    (
      portfolio.cash +
      portfolio.holdings.reduce((sum, h) => sum + h.shares * (prices[h.ticker] ?? 0), 0)
    ).toFixed(2)
  );

  return (
    <Ctx.Provider
      value={{
        page, navigate, selectedTicker,
        portfolio, portfolioValue,
        watchlist, toggleWatchlist,
        orders,
        alerts, addAlert, removeAlert,
        limitOrders, placeLimitOrder, cancelLimitOrder,
        globalToast, setGlobalToast,
        prices, priceFlash, tickCount,
        buyStock, sellStock, depositCash, resetPortfolio,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useApp = () => useContext(Ctx);
