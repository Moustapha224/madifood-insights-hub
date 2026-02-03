import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  highlight?: boolean;
  className?: string;
}

export function KPICard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  highlight = false,
  className 
}: KPICardProps) {
  return (
    <div className={cn(
      highlight ? 'kpi-card-highlight' : 'kpi-card',
      'animate-fade-in',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="kpi-label">{title}</p>
          <p className="kpi-value mt-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              'mt-2',
              trend.isPositive ? 'kpi-trend-up' : 'kpi-trend-down'
            )}>
              <span>{trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
              <span className="text-muted-foreground ml-1">vs mois précédent</span>
            </div>
          )}
        </div>
        <div className={cn(
          'p-3 rounded-xl transition-all',
          highlight 
            ? 'bg-secondary/10 dark:bg-secondary/15' 
            : 'bg-muted dark:bg-white/5'
        )}>
          <Icon className={cn(
            'w-6 h-6',
            highlight 
              ? 'text-secondary' 
              : 'text-muted-foreground opacity-70 dark:opacity-60'
          )} />
        </div>
      </div>
    </div>
  );
}
