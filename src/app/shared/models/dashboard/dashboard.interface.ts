// dashboard.interface.ts
export interface DashboardSummary {
  totalSalesThisMonth: number;
  inStoreOrdersCount: number;
  onlineOrdersPercentage: number;
  starProductsCount: number;
}

export interface SalesAnalytics {
  period: string;
  productOrders: number;
  serviceOrders: number;
  totalOrders: number;
}

export interface TodayTransaction {
  orderId: string;
  customerName: string;
  orderType: string;
  orderDate: Date;
  status: string;
  amount: number;
}

export interface TopProduct {
  productImage: string;
  productName: string;
  category: string;
  price: number;
  totalSold: number;
}
