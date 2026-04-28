import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';
import { getStockHistory } from '../data/stocks';

const PERIODS = ['1D', '1W', '1M', '1Y'];
const TICK_INTERVALS = { '1D': 12, '1W': 0, '1M': 4, '1Y': 7 };

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg3)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '5px 10px',
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--text)',
    }}>
      ${payload[0].value.toFixed(2)}
    </div>
  );
}

export default function PriceChart({ ticker, currentPrice }) {
  const [period, setPeriod] = useState('1D');
  const [chartKey, setChartKey] = useState('1D');

  function changePeriod(p) {
    setPeriod(p);
    setChartKey(`${p}-${Date.now()}`);
  }

  const data = getStockHistory(ticker, period);
  const open = data[0]?.price ?? currentPrice;
  const isUp = currentPrice >= open;
  const color = isUp ? 'var(--green)' : 'var(--red)';
  const gradId = `grad_${ticker}_${period}`;

  const prices = data.map(d => d.price);
  const lo = Math.min(...prices) * 0.998;
  const hi = Math.max(...prices) * 1.002;

  return (
    <div>
      <div key={chartKey} className="chart-fade">
      <ResponsiveContainer width="100%" height={210}>
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={color} stopOpacity={0.28} />
              <stop offset="95%" stopColor={color} stopOpacity={0}    />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: 'var(--text3)' }}
            axisLine={false}
            tickLine={false}
            interval={TICK_INTERVALS[period]}
          />
          <YAxis domain={[lo, hi]} hide />
          <Tooltip content={<ChartTooltip />} />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradId})`}
            dot={false}
            activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      </div>

      <div className="period-selector" style={{ justifyContent: 'center', marginTop: 6 }}>
        {PERIODS.map(p => (
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
  );
}
