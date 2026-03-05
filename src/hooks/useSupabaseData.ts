import { useState, useCallback, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { MadiFoodData, KPIData, MonthlyData, DateRange, User, Order, Plat, Wallet } from '@/types/madifood';
import { processExcelFile, calculateKPIs, getMonthlyData, getRestaurantData, getUniqueRestaurants } from '@/utils/etl';

interface UseSupabaseDataReturn {
  data: MadiFoodData | null;
  isLoading: boolean;
  error: string | null;
  uploadFile: (file: File) => Promise<void>;
  refreshData: () => Promise<void>;
  resetDatabase: () => Promise<void>;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  selectedRestaurants: string[];
  setSelectedRestaurants: (restaurants: string[]) => void;
  kpis: KPIData;
  monthlyData: MonthlyData[];
  restaurantData: ReturnType<typeof getRestaurantData>;
  availableRestaurants: string[];
  importStats: { users: number; orders: number; plats: number; wallets: number } | null;
}

// Helper to deduplicate rows by conflict column (keep last occurrence)
function deduplicateRows(rows: Record<string, any>[], conflictCol: string): Record<string, any>[] {
  const map = new Map<string, Record<string, any>>();
  for (const row of rows) {
    map.set(String(row[conflictCol]), row);
  }
  return Array.from(map.values());
}

// Helper to batch upserts in chunks
async function batchUpsert(table: string, rows: Record<string, any>[], conflictCol: string, chunkSize = 500) {
  const uniqueRows = deduplicateRows(rows, conflictCol);
  for (let i = 0; i < uniqueRows.length; i += chunkSize) {
    const chunk = uniqueRows.slice(i, i + chunkSize);
    const { error } = await (supabase as any).from(table).upsert(chunk, { onConflict: conflictCol });
    if (error) throw new Error(`Erreur insertion ${table}: ${error.message}`);
  }
}

// Fetch all rows from a table, handling the 1000-row limit
async function fetchAll<T>(table: string): Promise<T[]> {
  const all: T[] = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await (supabase as any).from(table).select('*').range(from, from + pageSize - 1);
    if (error) throw new Error(`Erreur lecture ${table}: ${error.message}`);
    if (!data || data.length === 0) break;
    all.push(...(data as T[]));
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

export function useSupabaseData(): UseSupabaseDataReturn {
  const [data, setData] = useState<MadiFoodData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);
  const [importStats, setImportStats] = useState<{ users: number; orders: number; plats: number; wallets: number } | null>(null);

  // Convert Supabase rows to app types
  const mapUsers = (rows: any[]): User[] => rows.map(r => ({
    id: r.id, username: r.username, firstname: r.firstname, lastname: r.lastname,
    email: r.email, phoneNumber: r.phone_number, profession: r.profession,
    isDeleted: r.is_deleted, source: r.source, createdAtDate: r.created_at_date, createdAtTime: r.created_at_time,
  }));

  const mapOrders = (rows: any[]): Order[] => rows.map(r => ({
    orderId: r.order_id, userId: r.user_id, userName: r.user_name,
    restaurantId: r.restaurant_id, restaurantName: r.restaurant_name,
    restaurantPhone: r.restaurant_phone, customerPhone: r.customer_phone,
    total: Number(r.total), subTotal: Number(r.sub_total), deliveryFee: Number(r.delivery_fee),
    serviceFee: Number(r.service_fee), paymentMethod: r.payment_method, status: r.status,
    createdAtDate: r.created_at_date, createdAtTime: r.created_at_time,
  }));

  const mapPlats = (rows: any[]): Plat[] => rows.map(r => ({
    id: r.id, name: r.name, price: Number(r.price), restaurantId: r.restaurant_id,
    restaurantName: r.restaurant_name, category: r.category, timeToCook: r.time_to_cook,
  }));

  const mapWallets = (rows: any[]): Wallet[] => rows.map(r => ({
    userId: r.user_id, balance: Number(r.balance), lastUpdated: r.last_updated,
  }));

  const loadFromSupabase = useCallback(async () => {
    try {
      const [usersRaw, ordersRaw, platsRaw, walletsRaw] = await Promise.all([
        fetchAll('mf_users'),
        fetchAll('mf_orders'),
        fetchAll('mf_plats'),
        fetchAll('mf_wallets'),
      ]);

      const madifoodData: MadiFoodData = {
        users: mapUsers(usersRaw),
        orders: mapOrders(ordersRaw),
        plats: mapPlats(platsRaw),
        wallets: mapWallets(walletsRaw),
      };

      if (madifoodData.users.length === 0 && madifoodData.orders.length === 0) {
        setData(null);
      } else {
        setData(madifoodData);
        // Auto-detect date range
        const dates = madifoodData.orders
          .map(o => new Date(o.createdAtDate))
          .filter(d => !isNaN(d.getTime()))
          .sort((a, b) => a.getTime() - b.getTime());
        if (dates.length > 0) {
          setDateRange({ start: dates[0], end: dates[dates.length - 1] });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    }
  }, []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await loadFromSupabase();
    setIsLoading(false);
  }, [loadFromSupabase]);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const uploadFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);
    setImportStats(null);

    try {
      const processedData = await processExcelFile(file);

      // Convert to Supabase format and upsert
      const usersRows = processedData.users.map(u => ({
        id: u.id, username: u.username, firstname: u.firstname, lastname: u.lastname,
        email: u.email, phone_number: u.phoneNumber, profession: u.profession,
        is_deleted: u.isDeleted, source: u.source, created_at_date: u.createdAtDate, created_at_time: u.createdAtTime,
      }));

      const ordersRows = processedData.orders.map(o => ({
        order_id: o.orderId, user_id: o.userId, user_name: o.userName,
        restaurant_id: o.restaurantId, restaurant_name: o.restaurantName,
        restaurant_phone: o.restaurantPhone, customer_phone: o.customerPhone,
        total: o.total, sub_total: o.subTotal, delivery_fee: o.deliveryFee,
        service_fee: o.serviceFee, payment_method: o.paymentMethod, status: o.status,
        created_at_date: o.createdAtDate, created_at_time: o.createdAtTime,
      }));

      const platsRows = processedData.plats.map(p => ({
        id: p.id, name: p.name, price: p.price, restaurant_id: p.restaurantId,
        restaurant_name: p.restaurantName, category: p.category, time_to_cook: p.timeToCook,
      }));

      const walletsRows = processedData.wallets.map(w => ({
        user_id: w.userId, balance: w.balance, last_updated: w.lastUpdated,
      }));

      await Promise.all([
        usersRows.length > 0 ? batchUpsert('mf_users', usersRows, 'id') : Promise.resolve(),
        ordersRows.length > 0 ? batchUpsert('mf_orders', ordersRows, 'order_id') : Promise.resolve(),
        platsRows.length > 0 ? batchUpsert('mf_plats', platsRows, 'id') : Promise.resolve(),
        walletsRows.length > 0 ? batchUpsert('mf_wallets', walletsRows, 'user_id') : Promise.resolve(),
      ]);

      setImportStats({
        users: processedData.users.length,
        orders: processedData.orders.length,
        plats: processedData.plats.length,
        wallets: processedData.wallets.length,
      });

      // Reload from Supabase to get merged data
      await loadFromSupabase();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  }, [loadFromSupabase]);

  const resetDatabase = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        (supabase as any).from('mf_users').delete().neq('id', ''),
        (supabase as any).from('mf_orders').delete().neq('order_id', ''),
        (supabase as any).from('mf_plats').delete().neq('id', ''),
        (supabase as any).from('mf_wallets').delete().neq('user_id', ''),
      ]);
      setData(null);
      setDateRange({ start: null, end: null });
      setSelectedRestaurants([]);
      setImportStats(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de réinitialisation');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Filter data by selected restaurants
  const filteredData = useMemo(() => {
    if (!data) return null;
    if (selectedRestaurants.length === 0) return data;
    return {
      ...data,
      orders: data.orders.filter(order => selectedRestaurants.includes(order.restaurantName)),
    };
  }, [data, selectedRestaurants]);

  const kpis = useMemo(() => {
    if (!filteredData) return { totalRevenue: 0, totalOrders: 0, averageBasket: 0, activeCustomers: 0, totalCustomers: 0, inactiveCustomers: 0, totalRestaurants: 0 };
    return calculateKPIs(filteredData, dateRange.start || undefined, dateRange.end || undefined);
  }, [filteredData, dateRange]);

  const monthlyData = useMemo(() => {
    if (!filteredData) return [];
    return getMonthlyData(filteredData, dateRange.start || undefined, dateRange.end || undefined);
  }, [filteredData, dateRange]);

  const restaurantData = useMemo(() => {
    if (!filteredData) return [];
    return getRestaurantData(filteredData, dateRange.start || undefined, dateRange.end || undefined);
  }, [filteredData, dateRange]);

  const availableRestaurants = useMemo(() => {
    if (!data) return [];
    return getUniqueRestaurants(data);
  }, [data]);

  return {
    data, isLoading, error, uploadFile, refreshData, resetDatabase,
    dateRange, setDateRange, selectedRestaurants, setSelectedRestaurants,
    kpis, monthlyData, restaurantData, availableRestaurants, importStats,
  };
}
