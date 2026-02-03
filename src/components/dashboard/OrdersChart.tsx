import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import type { MonthlyData } from '@/types/madifood';

interface OrdersChartProps {
  data: MonthlyData[];
}

export function OrdersChart({ data }: OrdersChartProps) {
  if (data.length === 0) {
    return (
      <div className="chart-container h-80">
        <h3 className="chart-title">📊 Évolution Mensuelle des Commandes</h3>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Aucune donnée disponible
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <h3 className="chart-title">📊 Évolution Mensuelle des Commandes</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={1}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.7}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              className="text-muted-foreground"
              stroke="hsl(var(--border))"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={40}
              className="text-muted-foreground"
            />
            <Tooltip 
              formatter={(value: number) => [value.toLocaleString('fr-FR'), 'Commandes']}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                color: 'hsl(var(--foreground))',
              }}
              labelStyle={{ fontWeight: 600, color: 'hsl(var(--foreground))' }}
              cursor={{ fill: 'hsl(var(--muted))', opacity: 0.5 }}
            />
            <Bar 
              dataKey="orders" 
              fill="url(#colorOrders)"
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
