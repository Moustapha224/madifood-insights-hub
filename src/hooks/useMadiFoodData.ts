import { useState, useCallback, useMemo } from 'react';
import type { MadiFoodData, KPIData, MonthlyData, DateRange } from '@/types/madifood';
import { 
  processExcelFile, 
  calculateKPIs, 
  getMonthlyData, 
  getRestaurantData,
  getUniqueRestaurants 
} from '@/utils/etl';

interface UseMadiFoodDataReturn {
  data: MadiFoodData | null;
  isLoading: boolean;
  error: string | null;
  uploadFile: (file: File) => Promise<void>;
  clearData: () => void;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  selectedRestaurants: string[];
  setSelectedRestaurants: (restaurants: string[]) => void;
  kpis: KPIData;
  monthlyData: MonthlyData[];
  restaurantData: ReturnType<typeof getRestaurantData>;
  availableRestaurants: string[];
}

export function useMadiFoodData(): UseMadiFoodDataReturn {
  const [data, setData] = useState<MadiFoodData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);

  const uploadFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const processedData = await processExcelFile(file);
      setData(processedData);
      
      // Auto-detect date range from data
      const dates = processedData.orders
        .map(o => new Date(o.createdAtDate))
        .filter(d => !isNaN(d.getTime()))
        .sort((a, b) => a.getTime() - b.getTime());
      
      if (dates.length > 0) {
        setDateRange({
          start: dates[0],
          end: dates[dates.length - 1],
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearData = useCallback(() => {
    setData(null);
    setError(null);
    setDateRange({ start: null, end: null });
    setSelectedRestaurants([]);
  }, []);

  // Filter data by selected restaurants
  const filteredData = useMemo(() => {
    if (!data) return null;
    if (selectedRestaurants.length === 0) return data;
    
    return {
      ...data,
      orders: data.orders.filter(order => 
        selectedRestaurants.includes(order.restaurantName)
      ),
    };
  }, [data, selectedRestaurants]);

  // Memoized KPIs calculation
  const kpis = useMemo(() => {
    if (!filteredData) {
      return {
        totalRevenue: 0,
        totalOrders: 0,
        averageBasket: 0,
        activeCustomers: 0,
        totalCustomers: 0,
        inactiveCustomers: 0,
        totalRestaurants: 0,
      };
    }
    return calculateKPIs(filteredData, dateRange.start || undefined, dateRange.end || undefined);
  }, [filteredData, dateRange]);

  // Memoized monthly data
  const monthlyData = useMemo(() => {
    if (!filteredData) return [];
    return getMonthlyData(filteredData, dateRange.start || undefined, dateRange.end || undefined);
  }, [filteredData, dateRange]);

  // Memoized restaurant data
  const restaurantData = useMemo(() => {
    if (!filteredData) return [];
    return getRestaurantData(filteredData, dateRange.start || undefined, dateRange.end || undefined);
  }, [filteredData, dateRange]);

  // Available restaurants for filter
  const availableRestaurants = useMemo(() => {
    if (!data) return [];
    return getUniqueRestaurants(data);
  }, [data]);

  return {
    data,
    isLoading,
    error,
    uploadFile,
    clearData,
    dateRange,
    setDateRange,
    selectedRestaurants,
    setSelectedRestaurants,
    kpis,
    monthlyData,
    restaurantData,
    availableRestaurants,
  };
}
