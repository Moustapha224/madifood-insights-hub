import * as XLSX from 'xlsx';
import type { MadiFoodData, User, Order, Plat, Wallet } from '@/types/madifood';

/**
 * ETL Pipeline for MadiFood Excel Data
 * Handles data cleaning and transformation
 */

// Clean phone numbers: remove +224, spaces, and non-digit characters
export function cleanPhoneNumber(phone: string | number | undefined): string {
  if (!phone) return '';
  const phoneStr = String(phone);
  // Remove +224, spaces, and keep only digits
  return phoneStr.replace(/^\+?224/g, '').replace(/\s+/g, '').replace(/[^0-9]/g, '');
}

// Parse time to cook: "30 min", "45mn", etc. -> number
export function parseTimeToCook(time: string | number | undefined): number {
  if (!time) return 0;
  if (typeof time === 'number') return time;
  // Extract digits from string
  const match = String(time).match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

// Parse date from Excel format
export function parseExcelDate(date: any): string {
  if (!date) return '';
  
  // If it's already a string in date format
  if (typeof date === 'string') {
    // Handle MM/DD/YY format
    if (date.includes('/')) {
      const parts = date.split('/');
      if (parts.length === 3) {
        const month = parts[0].padStart(2, '0');
        const day = parts[1].padStart(2, '0');
        let year = parts[2];
        if (year.length === 2) {
          year = parseInt(year, 10) >= 50 ? `19${year}` : `20${year}`;
        }
        return `${year}-${month}-${day}`;
      }
    }
    // Already in YYYY-MM-DD format
    if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return date;
    }
  }
  
  // If it's a number (Excel serial date)
  if (typeof date === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    const jsDate = new Date(excelEpoch.getTime() + date * 86400000);
    return jsDate.toISOString().split('T')[0];
  }
  
  return String(date);
}

// Ensure total is numeric
export function parseAmount(amount: any): number {
  if (!amount) return 0;
  if (typeof amount === 'number') return amount;
  const cleaned = String(amount).replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
}

// Parse users from worksheet
function parseUsers(worksheet: XLSX.WorkSheet): User[] {
  const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  
  return data.map((row: any) => ({
    id: String(row.id || row.Id || ''),
    username: String(row.username || row.Username || ''),
    firstname: String(row.firstname || row.Firstname || row.firstName || ''),
    lastname: String(row.lastname || row.Lastname || row.lastName || ''),
    email: String(row.email || row.Email || ''),
    phoneNumber: cleanPhoneNumber(row.phoneNumber || row.PhoneNumber || row.phone),
    profession: String(row.profession || row.Profession || ''),
    isDeleted: row.isDeleted === true || row.isDeleted === 'TRUE' || row.isDeleted === 'true',
    source: String(row.source || row.Source || ''),
    createdAtDate: parseExcelDate(row.createdAtDate || row.CreatedAtDate || row.created_at_date),
    createdAtTime: String(row.createdAtTime || row.CreatedAtTime || row.created_at_time || ''),
  }));
}

// Parse orders from worksheet
function parseOrders(worksheet: XLSX.WorkSheet): Order[] {
  const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  
  return data.map((row: any) => ({
    orderId: String(row.orderId || row.OrderId || row.order_id || row.id || ''),
    userId: String(row.userId || row.UserId || row.user_id || ''),
    userName: String(row.userName || row.UserName || row.user_name || ''),
    restaurantId: String(row.restaurantId || row.RestaurantId || row.restaurant_id || ''),
    restaurantName: String(row.restaurantName || row.RestaurantName || row.restaurant_name || ''),
    restaurantPhone: cleanPhoneNumber(row.restaurantPhone || row.RestaurantPhone),
    customerPhone: cleanPhoneNumber(row.customerPhone || row.CustomerPhone || row.clientPhone),
    total: parseAmount(row.total || row.Total),
    subTotal: parseAmount(row.subTotal || row.SubTotal || row.sub_total),
    deliveryFee: parseAmount(row.deliveryFee || row.DeliveryFee || row.delivery_fee),
    serviceFee: parseAmount(row.serviceFee || row.ServiceFee || row.service_fee),
    paymentMethod: String(row.paymentMethod || row.PaymentMethod || row.payment_method || ''),
    status: String(row.status || row.Status || ''),
    createdAtDate: parseExcelDate(row.createdAtDate || row.CreatedAtDate || row.created_at_date),
    createdAtTime: String(row.createdAtTime || row.CreatedAtTime || row.created_at_time || ''),
  }));
}

// Parse plats from worksheet
function parsePlats(worksheet: XLSX.WorkSheet): Plat[] {
  const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  
  return data.map((row: any) => ({
    id: String(row.id || row.Id || ''),
    name: String(row.name || row.Name || ''),
    price: parseAmount(row.price || row.Price),
    restaurantId: String(row.restaurantId || row.RestaurantId || row.restaurant_id || ''),
    restaurantName: String(row.restaurantName || row.RestaurantName || row.restaurant_name || ''),
    category: String(row.category || row.Category || ''),
    timeToCook: parseTimeToCook(row.timeToCook || row.TimeToCook || row.time_to_cook),
  }));
}

// Parse wallets from worksheet
function parseWallets(worksheet: XLSX.WorkSheet): Wallet[] {
  const data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  
  return data.map((row: any) => ({
    userId: String(row.userId || row.UserId || row.user_id || row.id || ''),
    balance: parseAmount(row.balance || row.Balance || row.amount || 0),
    lastUpdated: parseExcelDate(row.lastUpdated || row.LastUpdated || row.last_updated || row.updatedAtDate),
  }));
}

// Find sheet by name (case-insensitive, partial match)
function findSheet(workbook: XLSX.WorkBook, names: string[]): XLSX.WorkSheet | null {
  const sheetNames = workbook.SheetNames;
  
  for (const targetName of names) {
    const found = sheetNames.find(name => 
      name.toLowerCase().includes(targetName.toLowerCase())
    );
    if (found) {
      return workbook.Sheets[found];
    }
  }
  
  return null;
}

// Main ETL function
export async function processExcelFile(file: File): Promise<MadiFoodData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        
        // Find sheets
        const usersSheet = findSheet(workbook, ['users', 'user', 'utilisateurs', 'utilisateur']);
        const ordersSheet = findSheet(workbook, ['orders', 'order', 'commandes', 'commande']);
        const platsSheet = findSheet(workbook, ['plats', 'plat', 'dishes', 'dish', 'items', 'menu']);
        const walletsSheet = findSheet(workbook, ['wallet', 'wallets', 'portefeuille', 'balance']);
        
        const result: MadiFoodData = {
          users: usersSheet ? parseUsers(usersSheet) : [],
          orders: ordersSheet ? parseOrders(ordersSheet) : [],
          plats: platsSheet ? parsePlats(platsSheet) : [],
          wallets: walletsSheet ? parseWallets(walletsSheet) : [],
        };
        
        // Validate required data
        if (result.users.length === 0 && result.orders.length === 0) {
          reject(new Error('Aucune donnée utilisateur ou commande trouvée. Vérifiez que le fichier contient les feuilles "users" et/ou "orders".'));
          return;
        }
        
        resolve(result);
      } catch (error) {
        reject(new Error(`Erreur lors du traitement du fichier: ${error instanceof Error ? error.message : 'Erreur inconnue'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

// Calculate KPIs from data
export function calculateKPIs(data: MadiFoodData, startDate?: Date, endDate?: Date) {
  // Filter orders by date range if provided
  let filteredOrders = data.orders;
  
  if (startDate && endDate) {
    filteredOrders = filteredOrders.filter(order => {
      const orderDate = new Date(order.createdAtDate);
      return orderDate >= startDate && orderDate <= endDate;
    });
  }
  
  // Total revenue = sum of all 'total' amounts from orders
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  
  // Total orders = count of orders (by orderId)
  const totalOrders = filteredOrders.length;
  
  // Average basket = total revenue / total orders
  const averageBasket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Unique customers from users table
  const totalCustomers = new Set(data.users.map(u => u.id)).size;
  
  // Unique restaurants from orders
  const uniqueRestaurants = new Set(data.orders.map(o => o.restaurantId).filter(id => id));
  const totalRestaurants = uniqueRestaurants.size;
  
  // Active customers = unique customers who ordered in the filtered period
  const activeCustomerIds = new Set(filteredOrders.map(order => order.userId));
  const activeCustomers = activeCustomerIds.size;
  
  const inactiveCustomers = totalCustomers - activeCustomers;
  
  return {
    totalRevenue,
    totalOrders,
    averageBasket,
    activeCustomers,
    totalCustomers,
    inactiveCustomers: Math.max(0, inactiveCustomers),
    totalRestaurants,
  };
}

// Get monthly revenue data
export function getMonthlyData(data: MadiFoodData, startDate?: Date, endDate?: Date) {
  let filteredOrders = data.orders.filter(order => 
    order.status === 'Terminée' || order.status === 'terminée' || order.status === 'Completed' || order.status === '4'
  );
  
  if (startDate && endDate) {
    filteredOrders = filteredOrders.filter(order => {
      const orderDate = new Date(order.createdAtDate);
      return orderDate >= startDate && orderDate <= endDate;
    });
  }
  
  const monthlyMap = new Map<string, { revenue: number; orders: number }>();
  
  filteredOrders.forEach(order => {
    if (!order.createdAtDate) return;
    const date = new Date(order.createdAtDate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    const current = monthlyMap.get(monthKey) || { revenue: 0, orders: 0 };
    current.revenue += order.total;
    current.orders += 1;
    monthlyMap.set(monthKey, current);
  });
  
  // Sort by date and format for display
  const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  
  return Array.from(monthlyMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => {
      const [year, month] = key.split('-');
      return {
        month: `${monthNames[parseInt(month, 10) - 1]} ${year}`,
        revenue: value.revenue,
        orders: value.orders,
      };
    });
}

// Get restaurant data
export function getRestaurantData(data: MadiFoodData, startDate?: Date, endDate?: Date) {
  let filteredOrders = data.orders.filter(order => 
    order.status === 'Terminée' || order.status === 'terminée' || order.status === 'Completed' || order.status === '4'
  );
  
  if (startDate && endDate) {
    filteredOrders = filteredOrders.filter(order => {
      const orderDate = new Date(order.createdAtDate);
      return orderDate >= startDate && orderDate <= endDate;
    });
  }
  
  const restaurantMap = new Map<string, { totalOrders: number; revenue: number }>();
  
  filteredOrders.forEach(order => {
    const name = order.restaurantName || 'Non spécifié';
    const current = restaurantMap.get(name) || { totalOrders: 0, revenue: 0 };
    current.totalOrders += 1;
    current.revenue += order.total;
    restaurantMap.set(name, current);
  });
  
  return Array.from(restaurantMap.entries())
    .map(([name, value]) => ({ name, ...value }))
    .sort((a, b) => b.revenue - a.revenue);
}

// Get unique restaurants for filtering
export function getUniqueRestaurants(data: MadiFoodData): string[] {
  const restaurants = new Set<string>();
  data.orders.forEach(order => {
    if (order.restaurantName) {
      restaurants.add(order.restaurantName);
    }
  });
  return Array.from(restaurants).sort();
}
