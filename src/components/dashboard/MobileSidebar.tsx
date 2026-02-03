import { LayoutDashboard, Upload } from 'lucide-react';
import { FileUploadZone } from './FileUploadZone';
import { DateRangeFilter } from './DateRangeFilter';
import { RestaurantFilter } from './RestaurantFilter';
import { cn } from '@/lib/utils';
import type { DateRange } from '@/types/madifood';
import madifoodLogo from '@/assets/madifood-logo.png';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onFileUpload: (file: File) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  hasData: boolean;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  restaurants: string[];
  selectedRestaurants: string[];
  onRestaurantsChange: (selected: string[]) => void;
}

export function MobileSidebar({
  isOpen,
  onClose,
  onFileUpload,
  isLoading,
  error,
  hasData,
  dateRange,
  onDateRangeChange,
  restaurants,
  selectedRestaurants,
  onRestaurantsChange,
}: MobileSidebarProps) {
  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'lg:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          'lg:hidden fixed left-0 top-0 h-full w-72 bg-sidebar z-50 transition-transform duration-300 flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand Header */}
        <div className="sidebar-brand">
          <img 
            src={madifoodLogo} 
            alt="MadiFood" 
            className="h-12 object-contain"
          />
          <div>
            <p className="text-xs text-sidebar-foreground/60">Data Intelligence</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
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
        </nav>
      </aside>
    </>
  );
}
