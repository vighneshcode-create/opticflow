export interface Prescription {
  id: string;
  date: string;
  doctorName: string;
  
  // Right Eye (Oculus Dexter)
  odSph: string;
  odCyl: string;
  odAxis: string;
  odAdd: string;
  odVa: string; // Visual Acuity
  
  // Left Eye (Oculus Sinister)
  osSph: string;
  osCyl: string;
  osAxis: string;
  osAdd: string;
  osVa: string; // Visual Acuity
  
  pd: string; // Pupillary Distance
  notes: string;
  lensRecommended?: string; // e.g. Blue Block, Blue Max, Antiglare, etc.
  lensPrice?: number;
}

export interface OrderItem {
  id: string;
  name: string;
  category: 'Specs' | 'Goggles' | 'Contact Lenses' | 'Accessories';
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  prescriptionId?: string; // Optional reference to associated prescription
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'Cash' | 'UPI' | 'Card' | 'Pending';
  status: 'Pending' | 'Paid' | 'Delivered' | 'Archived';
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  customerSince: string;
  prescriptions: Prescription[];
  orders: Order[];
}

export interface Product {
  id: string;
  name: string;
  category: 'Specs' | 'Goggles' | 'Contact Lenses' | 'Accessories';
  price: number; // Selling Price to customers
  costPrice: number; // Cost Price (Purchase expense)
  stock: number;
  initialStockBought: number; // For computing total expense of stock
}

export interface MonthlyExpense {
  id: string;
  month: string; // Format "January 2026" or "2026-05"
  rent: number;
  lightBill: number;
  salaries: number;
  misc: number;
  notes?: string;
}

