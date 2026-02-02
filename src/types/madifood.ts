// MadiFood Database Types

export interface User {
  id: string;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  profession: string;
  isDeleted: boolean;
  source: string;
  createdAtDate: string;
  createdAtTime: string;
}

export interface Order {
  orderId: string;
  userId: string;
  userName: string;
  restaurantId: string;
  restaurantName: string;
  restaurantPhone: string;
  customerPhone: string;
  total: number;
  subTotal: number;
  deliveryFee: number;
  serviceFee: number;
  paymentMethod: string;
  status: string;
  createdAtDate: string;
  createdAtTime: string;
}

export interface Plat {
  id: string;
  name: string;
  price: number;
  restaurantId: string;
  restaurantName: string;
  category: string;
  timeToCook: number;
}

export interface Wallet {
  userId: string;
  balance: number;
  lastUpdated: string;
}

export interface MadiFoodData {
  users: User[];
  orders: Order[];
  plats: Plat[];
  wallets: Wallet[];
}

export interface KPIData {
  totalRevenue: number;
  totalOrders: number;
  averageBasket: number;
  activeCustomers: number;
  totalCustomers: number;
  inactiveCustomers: number;
}

export interface MonthlyData {
  month: string;
  revenue: number;
  orders: number;
}

export interface RestaurantData {
  name: string;
  totalOrders: number;
  revenue: number;
}

export interface DateRange {
  start: Date | null;
  end: Date | null;
}
