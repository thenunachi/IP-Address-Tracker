import { LineChart, Line, ReferenceLine, ResponsiveContainer } from 'recharts';
import { getStockHistory } from '../data/stocks';

export default function MiniSparkline({ ticker, isUp, avgCost }) {
  const data = getStockHistory(ticker, '1M');
  const color = isUp ? 'var(--green)' : 'var(--red)';

  return (
    <div style={{ width: 72, height: 36, flexShrink: 0, display: 'flex', alignItems: 'center' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 2, left: 2, bottom: 4 }}>
          {/* Dashed line shows the price they paid */}
          {avgCost != null && (
            <ReferenceLine
              y={avgCost}
              stroke="rgba(255,255,255,0.22)"
              strokeDasharray="3 2"
              strokeWidth={1}
            />
          )}
          <Line
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
