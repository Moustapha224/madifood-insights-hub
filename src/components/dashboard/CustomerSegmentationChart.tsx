import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { KPIData } from '@/types/madifood';

interface CustomerSegmentationChartProps {
  kpis: KPIData;
}

export function CustomerSegmentationChart({ kpis }: CustomerSegmentationChartProps) {
  const data = [
    { 
      name: 'Clients Actifs', 
      value: kpis.activeCustomers, 
      color: 'hsl(142, 71%, 45%)',
      description: 'Ont commandé sur la période'
    },
    { 
      name: 'Clients Inactifs', 
      value: kpis.inactiveCustomers, 
      color: 'hsl(220, 9%, 46%)',
      description: 'Aucune commande sur la période'
    },
  ];

  const total = kpis.totalCustomers;
  const activePercentage = total > 0 ? ((kpis.activeCustomers / total) * 100).toFixed(1) : 0;

  if (total === 0) {
    return (
      <div className="chart-container h-80">
        <h3 className="chart-title">🥧 Segmentation Clients</h3>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Aucune donnée disponible
        </div>
      </div>
    );
  }

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    if (percent < 0.05) return null; // Don't show labels for very small slices
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontSize={14}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="chart-container">
      <h3 className="chart-title">🥧 Segmentation Clients</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="45%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={100}
              innerRadius={50}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number, name: string) => [
                `${value.toLocaleString('fr-FR')} clients`,
                name
              ]}
              contentStyle={{
                backgroundColor: 'hsl(0, 0%, 100%)',
                border: '1px solid hsl(220, 13%, 91%)',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <Legend 
              verticalAlign="bottom"
              height={36}
              formatter={(value: string, entry: any) => (
                <span className="text-sm text-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 p-4 rounded-lg bg-muted/50 text-center">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{activePercentage}%</span> de vos clients sont actifs
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          sur un total de <span className="font-medium">{total.toLocaleString('fr-FR')}</span> utilisateurs
        </p>
      </div>
    </div>
  );
}
