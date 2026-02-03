import { useState } from 'react';
import { 
  DollarSign, 
  ShoppingCart, 
  Wallet, 
  Users,
  Store,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { KPICard } from '@/components/dashboard/KPICard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { OrdersChart } from '@/components/dashboard/OrdersChart';
import { CustomerSegmentationChart } from '@/components/dashboard/CustomerSegmentationChart';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useMadiFoodData } from '@/hooks/useMadiFoodData';
import { cn } from '@/lib/utils';
import madifoodLogo from '@/assets/madifood-logo.png';

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const {
    data,
    isLoading,
    error,
    uploadFile,
    dateRange,
    setDateRange,
    selectedRestaurants,
    setSelectedRestaurants,
    kpis,
    monthlyData,
    availableRestaurants,
  } = useMadiFoodData();

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(2)} Md`;
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)} M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)} K`;
    }
    return value.toLocaleString('fr-FR');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <DashboardSidebar
        onFileUpload={uploadFile}
        isLoading={isLoading}
        error={error}
        hasData={!!data}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        restaurants={availableRestaurants}
        selectedRestaurants={selectedRestaurants}
        onRestaurantsChange={setSelectedRestaurants}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <main 
        className={cn(
          'transition-all duration-300 min-h-screen',
          sidebarCollapsed ? 'ml-16' : 'ml-72'
        )}
      >
        <div className="p-8">
          {/* Header */}
          <header className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src={madifoodLogo} 
                alt="MadiFood" 
                className="h-12 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  MadiFood
                </h1>
                <p className="text-muted-foreground text-sm">
                  Tableau de bord analytique
                </p>
              </div>
            </div>
            <ThemeToggle />
          </header>

          {/* Empty State */}
          {!data && !isLoading && (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <div className="w-24 h-24 rounded-2xl bg-muted flex items-center justify-center mb-6">
                <FileSpreadsheet className="w-12 h-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Bienvenue sur MadiFood Analytics
              </h2>
              <p className="text-muted-foreground max-w-md mb-8">
                Importez votre fichier Excel <strong>Madifood_DB.xlsx</strong> via la barre latérale 
                pour visualiser vos données et KPIs en temps réel.
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span>Analyse automatique • Graphiques interactifs • Filtres dynamiques</span>
              </div>
            </div>
          )}

          {/* Dashboard Content */}
          {data && (
            <div className="space-y-8 animate-fade-in">
              {/* KPI Cards */}
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-secondary rounded-full"></span>
                  Indicateurs Clés de Performance
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  <KPICard
                    title="Chiffre d'Affaires Total"
                    value={`${formatCurrency(kpis.totalRevenue)} GNF`}
                    icon={DollarSign}
                    highlight
                  />
                  <KPICard
                    title="Nombre Total de Commandes"
                    value={kpis.totalOrders.toLocaleString('fr-FR')}
                    icon={ShoppingCart}
                  />
                  <KPICard
                    title="Clients Distincts"
                    value={kpis.totalCustomers.toLocaleString('fr-FR')}
                    icon={Users}
                  />
                  <KPICard
                    title="Restaurants Partenaires"
                    value={kpis.totalRestaurants.toLocaleString('fr-FR')}
                    icon={Store}
                  />
                  <KPICard
                    title="Panier Moyen Global"
                    value={`${formatCurrency(kpis.averageBasket)} GNF`}
                    icon={Wallet}
                  />
                </div>
              </section>

              {/* Charts Grid */}
              <section>
                <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-secondary rounded-full"></span>
                  Visualisations
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <RevenueChart data={monthlyData} />
                  <OrdersChart data={monthlyData} />
                </div>
              </section>

              {/* Customer Segmentation */}
              <section>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <CustomerSegmentationChart kpis={kpis} />
                  
                  {/* Data Summary Card */}
                  <div className="chart-container">
                    <h3 className="chart-title">📋 Résumé des Données</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-4 rounded-lg bg-muted/50">
                        <span className="text-sm text-muted-foreground">Utilisateurs importés</span>
                        <span className="font-semibold text-foreground">{data.users.length.toLocaleString('fr-FR')}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 rounded-lg bg-muted/50">
                        <span className="text-sm text-muted-foreground">Commandes importées</span>
                        <span className="font-semibold text-foreground">{data.orders.length.toLocaleString('fr-FR')}</span>
                      </div>
                      <div className="flex justify-between items-center p-4 rounded-lg bg-muted/50">
                        <span className="text-sm text-muted-foreground">Restaurants uniques</span>
                        <span className="font-semibold text-foreground">{availableRestaurants.length.toLocaleString('fr-FR')}</span>
                      </div>
                      {dateRange.start && dateRange.end && (
                        <div className="flex justify-between items-center p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                          <span className="text-sm text-muted-foreground">Période analysée</span>
                          <span className="font-medium text-secondary">
                            {dateRange.start.toLocaleDateString('fr-FR')} - {dateRange.end.toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
