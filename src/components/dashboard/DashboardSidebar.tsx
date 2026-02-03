import { 
  LayoutDashboard, 
  Upload, 
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUploadZone } from './FileUploadZone';
import { DateRangeFilter } from './DateRangeFilter';
import { RestaurantFilter } from './RestaurantFilter';
import { cn } from '@/lib/utils';
import type { DateRange } from '@/types/madifood';
import madifoodLogo from '@/assets/madifood-logo.png';

interface DashboardSidebarProps {
  onFileUpload: (file: File) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  hasData: boolean;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  restaurants: string[];
  selectedRestaurants: string[];
  onRestaurantsChange: (selected: string[]) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function DashboardSidebar({
  onFileUpload,
  isLoading,
  error,
  hasData,
  dateRange,
  onDateRangeChange,
  restaurants,
  selectedRestaurants,
  onRestaurantsChange,
  isCollapsed,
  onToggleCollapse,
}: DashboardSidebarProps) {
  return (
    <aside 
      className={cn(
        'hidden lg:flex fixed left-0 top-0 h-full bg-sidebar z-50 transition-all duration-300 flex-col',
        isCollapsed ? 'w-16' : 'w-72'
      )}
    >
      {/* Brand Header */}
      <div className={cn(
        'sidebar-brand',
        isCollapsed && 'justify-center px-2'
      )}>
        <img 
          src={madifoodLogo} 
          alt="MadiFood" 
          className={cn(
            'object-contain',
            isCollapsed ? 'w-10 h-10' : 'h-12'
          )}
        />
        {!isCollapsed && (
          <div>
            <p className="text-xs text-sidebar-foreground/60">Data Intelligence</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {!isCollapsed && (
          <>
            {/* Dashboard Link */}
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground">
              <LayoutDashboard className="w-5 h-5" />
              <span className="text-sm font-medium">Dashboard</span>
            </div>

            {/* Divider */}
            <div className="py-4">
              <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                Importer les données
              </p>
              <FileUploadZone 
                onFileUpload={onFileUpload}
                isLoading={isLoading}
                error={error}
              />
            </div>

            {/* Filters */}
            {hasData && (
              <div className="space-y-4 pt-4 border-t border-sidebar-border">
                <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                  Filtres
                </p>
                
                <div className="px-1">
                  <label className="block text-xs font-medium text-sidebar-foreground/70 mb-2">
                    Période d'analyse
                  </label>
                  <DateRangeFilter 
                    dateRange={dateRange}
                    onDateRangeChange={onDateRangeChange}
                  />
                </div>
                
                <div className="px-1">
                  <label className="block text-xs font-medium text-sidebar-foreground/70 mb-2">
                    Restaurants
                  </label>
                  <RestaurantFilter
                    restaurants={restaurants}
                    selected={selectedRestaurants}
                    onSelectionChange={onRestaurantsChange}
                  />
                </div>
              </div>
            )}
          </>
        )}
        
        {isCollapsed && (
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 rounded-lg bg-sidebar-accent">
              <LayoutDashboard className="w-5 h-5 text-sidebar-accent-foreground" />
            </div>
            <div className="p-3 rounded-lg hover:bg-sidebar-accent cursor-pointer">
              <Upload className="w-5 h-5 text-sidebar-foreground/60" />
            </div>
          </div>
        )}
      </nav>

      {/* Toggle Button */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapse}
          className={cn(
            'w-full text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent',
            isCollapsed && 'justify-center'
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 mr-2" />
              <span className="text-sm">Réduire</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
