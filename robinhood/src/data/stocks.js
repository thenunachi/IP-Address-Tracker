export const STOCKS_BASE = [
  { ticker: 'AAPL', name: 'Apple Inc.',             sector: 'Technology',     basePrice: 189.30, mcap: '2.97T' },
  { ticker: 'TSLA', name: 'Tesla, Inc.',            sector: 'Automotive',     basePrice: 177.82, mcap: '0.57T' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.',         sector: 'Technology',     basePrice: 172.63, mcap: '2.16T' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.',        sector: 'E-Commerce',     basePrice: 185.07, mcap: '1.95T' },
  { ticker: 'MSFT', name: 'Microsoft Corp.',        sector: 'Technology',     basePrice: 415.50, mcap: '3.09T' },
  { ticker: 'NVDA', name: 'NVIDIA Corp.',           sector: 'Semiconductors', basePrice: 875.40, mcap: '2.17T' },
  { ticker: 'META', name: 'Meta Platforms',         sector: 'Social Media',   basePrice: 503.25, mcap: '1.29T' },
  { ticker: 'NFLX', name: 'Netflix Inc.',           sector: 'Entertainment',  basePrice: 628.90, mcap: '0.28T' },
  { ticker: 'AMD',  name: 'Adv. Micro Devices',     sector: 'Semiconductors', basePrice: 162.48, mcap: '0.26T' },
  { ticker: 'COIN', name: 'Coinbase Global',        sector: 'Finance',        basePrice: 225.31, mcap: '0.06T' },
  { ticker: 'SPOT', name: 'Spotify Technology',     sector: 'Entertainment',  basePrice: 312.50, mcap: '0.07T' },
  { ticker: 'UBER', name: 'Uber Technologies',      sector: 'Transportation', basePrice: 78.20,  mcap: '0.16T' },
  { ticker: 'DIS',  name: 'The Walt Disney Co.',    sector: 'Entertainment',  basePrice: 91.45,  mcap: '0.17T' },
  { ticker: 'PYPL', name: 'PayPal Holdings',        sector: 'Finance',        basePrice: 62.80,  mcap: '0.07T' },
  { ticker: 'SQ',   name: 'Block, Inc.',            sector: 'Finance',        basePrice: 67.30,  mcap: '0.04T' },
];

// Generate price history backward in time so the last element == basePrice
function genHistory(basePrice, count, vol) {
  const arr = new Array(count);
  arr[count - 1] = basePrice;
  for (let i = count - 2; i >= 0; i--) {
    const chg = (Math.random() - 0.48) * vol;
    arr[i] = Math.max(1, parseFloat((arr[i + 1] / (1 + chg)).toFixed(2)));
  }
  return arr;
}

function labels1D() {
  const out = [];
  for (let h = 9; h <= 15; h++) {
    for (let m = 0; m < 60; m += 5) {
      if (h === 9 && m < 30) continue;
      if (h === 15 && m > 30) break;
      out.push(`${h}:${String(m).padStart(2, '0')}`);
    }
  }
  return out; // ~73 points
}

function labels1W() {
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
}

function labels1M() {
  const now = new Date();
  return Array.from({ length: 22 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (21 - i));
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });
}

function labels1Y() {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const now = new Date();
  return Array.from({ length: 52 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (51 - i) * 7);
    return months[d.getMonth()];
  });
}

const VOL = { '1D': 0.003, '1W': 0.022, '1M': 0.016, '1Y': 0.026 };
const LABEL_FNS = { '1D': labels1D, '1W': labels1W, '1M': labels1M, '1Y': labels1Y };
const cache = {};

export function getStockHistory(ticker, period) {
  const key = `${ticker}_${period}`;
  if (cache[key]) return cache[key];

  const stock = STOCKS_BASE.find(s => s.ticker === ticker);
  if (!stock) return [];

  const lbls = LABEL_FNS[period]();
  const prices = genHistory(stock.basePrice, lbls.length, VOL[period] ?? 0.015);
  const result = lbls.map((label, i) => ({ label, price: prices[i] }));
  cache[key] = result;
  return result;
}

export function getDayOpen(ticker) {
  const h = getStockHistory(ticker, '1D');
  return h.length > 0 ? h[0].price : 0;
}
