import { CheckCircle } from 'lucide-react';

interface ImportStatsProps {
  stats: { users: number; orders: number; plats: number; wallets: number } | null;
}

export function ImportStats({ stats }: ImportStatsProps) {
  if (!stats) return null;

  return (
    <div className="flex items-start gap-2 p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-sm">
      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <div>
        <span className="font-medium">Import réussi !</span>
        <span className="ml-1">
          {stats.users} utilisateurs, {stats.orders} commandes, {stats.plats} plats, {stats.wallets} portefeuilles
        </span>
      </div>
    </div>
  );
}
