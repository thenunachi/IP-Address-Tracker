# Trade — Paper Trading App

A fully-featured stock trading simulator built with React and Vite. No real money, no API keys — everything runs locally with simulated live prices.

---

## Features

### Trading
- **Market orders** — buy and sell at the current simulated price
- **Limit orders** — set a target price; orders fill automatically when the price crosses it
- **Paper portfolio** — starts with $10,000 in buying power
- **Deposit / Withdraw** — add or remove cash via the Home page transfer modal

### Live Data (Simulated)
- **15 stocks** — AAPL, TSLA, GOOGL, AMZN, MSFT, NVDA, META, NFLX, AMD, COIN, SPOT, UBER, DIS, PYPL, SQ
- **Price ticks every 3 seconds** — random walk ±0.2% per tick with green/red flash animation
- **Price alerts** — set a target price; get a toast + audio chime when it crosses
- **Market status badge** — live Open / Closed indicator using `America/New_York` timezone

### Pages

| Page | What's on it |
|------|-------------|
| **Home** | Portfolio value card with 1D/1W/1M/1Y chart, Top Movers strip, positions with mini sparklines, Deposit button |
| **Watchlist** | Saved stocks with live prices, daily % change, and 1M sparklines |
| **Search** | All 15 stocks with sector filter chips, sort by Gainers / Losers / A→Z / Price |
| **Stock Detail** | Area price chart (1D/1W/1M/1Y), Buy/Sell panel, limit order toggle, price alerts, news feed |
| **Orders** | Pending limit orders (with Cancel) + filled order history |
| **Analytics** | Sector allocation donut chart, unrealized P&L, top/worst performer, per-position table, portfolio reset |

### UI & UX
- **Dark / Light theme** — toggle in sidebar, saved to `localStorage`
- **Keyboard shortcuts** — `H` Home · `W` Watchlist · `/` Search · `O` Orders · `A` Analytics · `Esc` Back
- **Page transitions** — fade + slide on navigation
- **Staggered list animations** — rows animate in on page load
- **Confetti** — fires on your very first trade
- **Onboarding screen** — shown once on first visit
- **Fully responsive** — sidebar on desktop, bottom tab bar on mobile

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | React 19 + Vite |
| Charts | Recharts |
| Icons | Lucide React |
| State | React Context + `useRef` for stable intervals |
| Storage | `localStorage` — portfolio, watchlist, orders, alerts |
| Styling | Plain CSS with custom properties (no Tailwind) |
| Sound | Web Audio API — alert chime + order-fill jingle |

---

## Project Structure

```
src/
├── components/
│   ├── pages/
│   │   ├── Home.jsx          # Portfolio overview
│   │   ├── Watchlist.jsx     # Saved stocks
│   │   ├── Search.jsx        # Stock search + filters
│   │   ├── StockDetail.jsx   # Chart, trade panel, alerts, news
│   │   ├── Orders.jsx        # Pending + history
│   │   └── Analytics.jsx     # Pie chart, P&L, reset
│   ├── Navbar.jsx            # Desktop sidebar + market status + theme toggle
│   ├── BottomNav.jsx         # Mobile tab bar
│   ├── MiniSparkline.jsx     # Inline 1M chart for position rows
│   ├── DepositModal.jsx      # Cash transfer modal
│   ├── Onboarding.jsx        # First-visit welcome screen
│   └── Toast.jsx             # Shared notification component
├── context/
│   └── AppContext.jsx        # Global state, price ticks, limit order fills
├── data/
│   ├── stocks.js             # 15 stocks, price history generator, cache
│   └── news.js               # Mock headlines per ticker
├── hooks/
│   └── useKeyboardShortcuts.js
└── utils/
    ├── market.js             # Market open/closed check (ET timezone)
    └── sounds.js             # Web Audio API — alert + fill sounds
```

---

## Getting Started

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) — or whichever port Vite picks.

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `H` | Home |
| `W` | Watchlist |
| `/` | Search |
| `O` | Orders |
| `A` | Analytics |
| `Esc` | Go back (from Stock Detail) |

Click the ⌨️ button in the sidebar to see the shortcut cheatsheet at any time.

---

## Notes

- All prices are simulated — no Finnhub, Alpha Vantage, or any other API key required
- Data resets on hard refresh (price history is re-generated each session); portfolio state persists via `localStorage`
- The background images are loaded from Unsplash — they require an internet connection to display but the app works fully offline without them
# trading
