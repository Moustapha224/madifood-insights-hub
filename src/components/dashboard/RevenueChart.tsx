import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import type { MonthlyData } from '@/types/madifood';

interface RevenueChartProps {
  data: MonthlyData[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  if (data.length === 0) {
    return (
      <div className="chart-container h-80">
        <h3 className="chart-title">📈 Évolution Mensuelle du CA</h3>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Aucune donnée disponible
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3 className="chart-title">📈 Évolution Mensuelle du CA</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(24, 95%, 53%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(24, 95%, 53%)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12, fill: 'hsl(220, 9%, 46%)' }}
              tickLine={false}
              axisLine={{ stroke: 'hsl(220, 13%, 91%)' }}
            />
            <YAxis 
              tickFormatter={formatCurrency}
              tick={{ fontSize: 12, fill: 'hsl(220, 9%, 46%)' }}
              tickLine={false}
              axisLine={false}
              width={60}
            />
            <Tooltip 
              formatter={(value: number) => [`${value.toLocaleString('fr-FR')} GNF`, 'Chiffre d\'affaires']}
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(220, 13%, 91%)',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              labelStyle={{ fontWeight: 600, color: 'hsl(222, 47%, 11%)' }}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="hsl(24, 95%, 53%)" 
              strokeWidth={3}
              dot={{ fill: 'hsl(24, 95%, 53%)', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: 'hsl(24, 95%, 53%)', stroke: 'white', strokeWidth: 2 }}
              fill="url(#colorRevenue)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
