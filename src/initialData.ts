import { Customer, Product, MonthlyExpense } from './types';

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Ananya Roy',
    mobile: '9876543210',
    email: 'ananya.roy@gmail.com',
    customerSince: 'June 2016',
    prescriptions: [
      {
        id: 'rx-1-3',
        date: '2026-03-12',
        doctorName: 'Kiran Shantaram Sanap',
        odSph: '-2.25',
        odCyl: '-0.50',
        odAxis: '180',
        odAdd: '+1.50',
        odVa: '6/6',
        osSph: '-2.00',
        osCyl: '-0.25',
        osAxis: '175',
        osAdd: '+1.50',
        osVa: '6/6',
        pd: '64',
        notes: 'Progressive lens recommended. Blue-cut coating for high screen-time usage.'
      },
      {
        id: 'rx-1-2',
        date: '2021-02-15',
        doctorName: 'Kiran Shantaram Sanap',
        odSph: '-1.75',
        odCyl: '-0.50',
        odAxis: '180',
        odAdd: '+1.00',
        odVa: '6/6',
        osSph: '-1.50',
        osCyl: '0.00',
        osAxis: '0',
        osAdd: '+1.00',
        osVa: '6/6',
        pd: '64',
        notes: 'Bifocals recommended. Photochromic lens (Transitions) for outdoor activities.'
      },
      {
        id: 'rx-1-1',
        date: '2016-06-20',
        doctorName: 'Dr. Rajesh Patel',
        odSph: '-1.00',
        odCyl: '0.00',
        odAxis: '0',
        odAdd: '0.00',
        odVa: '6/9',
        osSph: '-1.00',
        osCyl: '0.00',
        osAxis: '0',
        osAdd: '0.00',
        osVa: '6/9',
        pd: '63',
        notes: 'Single vision distance specs required. Anti-reflective coating recommended.'
      }
    ],
    orders: [
      {
        id: 'TX-9082',
        date: '2026-03-12',
        items: [
          { id: 'item-1_1', name: 'RayBan Classic Wayfarer', category: 'Specs', price: 6500, quantity: 1 },
          { id: 'item-1_2', name: 'Essilor Progressive Crizal BlueKids', category: 'Specs', price: 4500, quantity: 1 }
        ],
        prescriptionId: 'rx-1-3',
        subtotal: 11000,
        discount: 1000,
        tax: 500,
        total: 10500,
        paymentMethod: 'UPI',
        status: 'Delivered',
        notes: 'Fitted with progressive spectacles.'
      },
      {
        id: 'TX-7210',
        date: '2021-02-17',
        items: [
          { id: 'item-1_3', name: 'Bausch & Lomb Monthly PureVision 2 (6 pack)', category: 'Contact Lenses', price: 1800, quantity: 2 }
        ],
        prescriptionId: 'rx-1-2',
        subtotal: 3600,
        discount: 200,
        tax: 150,
        total: 3550,
        paymentMethod: 'Card',
        status: 'Paid',
        notes: 'Dispatched via courier.'
      },
      {
        id: 'TX-4412',
        date: '2016-06-20',
        items: [
          { id: 'item-1_4', name: 'Titan Rimless Flex', category: 'Specs', price: 4200, quantity: 1 },
          { id: 'item-1_5', name: 'Crizal Easy Single Vision Lens', category: 'Specs', price: 1500, quantity: 1 }
        ],
        prescriptionId: 'rx-1-1',
        subtotal: 5700,
        discount: 500,
        tax: 250,
        total: 5450,
        paymentMethod: 'Cash',
        status: 'Archived',
        notes: '10-yr archive import.'
      }
    ]
  },
  {
    id: 'cust-2',
    name: 'Devansh Sharma',
    mobile: '9123456789',
    email: 'devansh.s@gmail.com',
    customerSince: 'August 2018',
    prescriptions: [
      {
        id: 'rx-2-2',
        date: '2025-11-05',
        doctorName: 'Kiran Shantaram Sanap',
        odSph: '0.00',
        odCyl: '-1.00',
        odAxis: '90',
        odAdd: '0.00',
        odVa: '6/6',
        osSph: '+0.25',
        osCyl: '-1.25',
        osAxis: '95',
        osAdd: '0.00',
        osVa: '6/6',
        pd: '62',
        notes: 'High astigmatism. Double-aspheric lens for minimal lens distortion.'
      },
      {
        id: 'rx-2-1',
        date: '2018-08-14',
        doctorName: 'Dr. Arvinder Singh',
        odSph: '0.00',
        odCyl: '-0.75',
        odAxis: '90',
        odAdd: '0.00',
        odVa: '6/6',
        osSph: '0.00',
        osCyl: '-1.00',
        osAxis: '90',
        osAdd: '0.00',
        osVa: '6/6',
        pd: '62',
        notes: 'Acupuncture eye exercises suggested. Ordinary anti-glare specs.'
      }
    ],
    orders: [
      {
        id: 'TX-5510',
        date: '2025-11-05',
        items: [
          { id: 'item-2_1', name: 'Oakley Pitchman R Matte Black', category: 'Specs', price: 9800, quantity: 1 },
          { id: 'item-2_2', name: 'Premium High-Index Cylindrical Lens', category: 'Specs', price: 3800, quantity: 1 }
        ],
        prescriptionId: 'rx-2-2',
        subtotal: 13600,
        discount: 1600,
        tax: 600,
        total: 12600,
        paymentMethod: 'UPI',
        status: 'Delivered',
        notes: 'Delivered in store.'
      },
      {
        id: 'TX-1054',
        date: '2018-08-14',
        items: [
          { id: 'item-2_3', name: 'Fastrack Sporty Rectangular Frame', category: 'Specs', price: 1999, quantity: 1 },
          { id: 'item-2_4', name: 'Hard Coat Anti-Glare Lens', category: 'Specs', price: 900, quantity: 1 }
        ],
        prescriptionId: 'rx-2-1',
        subtotal: 2899,
        discount: 299,
        tax: 150,
        total: 2750,
        paymentMethod: 'Cash',
        status: 'Archived',
        notes: 'Complete set with case and cleaning solution.'
      }
    ]
  },
  {
    id: 'cust-3',
    name: 'Meera Krishnan',
    mobile: '9845012345',
    email: 'meera.krishnan@outlook.com',
    customerSince: 'November 2017',
    prescriptions: [
      {
        id: 'rx-3-2',
        date: '2024-05-18',
        doctorName: 'Kiran Shantaram Sanap',
        odSph: '-4.50',
        odCyl: '-1.00',
        odAxis: '15',
        odAdd: '0.00',
        odVa: '6/6',
        osSph: '-4.75',
        osCyl: '-0.75',
        osAxis: '165',
        osAdd: '0.00',
        osVa: '6/6',
        pd: '61',
        notes: 'High Myopia. 1.67 High-Index thinned lenses strongly recommended.'
      },
      {
        id: 'rx-3-1',
        date: '2017-11-22',
        doctorName: 'Dr. Rajesh Patel',
        odSph: '-3.75',
        odCyl: '-0.50',
        odAxis: '10',
        odAdd: '0.00',
        odVa: '6/6',
        osSph: '-4.00',
        osCyl: '-0.50',
        osAxis: '170',
        osAdd: '0.00',
        osVa: '6/6',
        pd: '60',
        notes: '1.61 High-Index thin lens recommended.'
      }
    ],
    orders: [
      {
        id: 'TX-8822',
        date: '2024-05-18',
        items: [
          { id: 'item-3_1', name: 'Prada Elegant Cat-Eye', category: 'Specs', price: 14500, quantity: 1 },
          { id: 'item-3_2', name: 'Zeiss Duravision Platinum 1.67 thinned', category: 'Specs', price: 8500, quantity: 1 }
        ],
        prescriptionId: 'rx-3-2',
        subtotal: 23000,
        discount: 2500,
        tax: 1200,
        total: 21700,
        paymentMethod: 'Card',
        status: 'Delivered',
        notes: 'Patient opted for premium frames.'
      }
    ]
  },
  {
    id: 'cust-4',
    name: 'Balaji Venkat',
    mobile: '9444055555',
    email: 'b.venkat@yahoo.com',
    customerSince: 'September 2020',
    prescriptions: [
      {
        id: 'rx-4-1',
        date: '2020-09-02',
        doctorName: 'Dr. Rajesh Patel',
        odSph: '+2.50',
        odCyl: '0.00',
        odAxis: '0',
        odAdd: '0.00',
        odVa: '6/6',
        osSph: '+2.50',
        osCyl: '0.00',
        osAxis: '0',
        osAdd: '0.00',
        osVa: '6/6',
        pd: '65',
        notes: 'Reading glasses only. Half-eye frame comfortable for downward look.'
      }
    ],
    orders: [
      {
        id: 'TX-3021',
        date: '2020-09-02',
        items: [
          { id: 'item-4_1', name: 'Polaroid Retro Goggles Combo', category: 'Goggles', price: 3400, quantity: 1 },
          { id: 'item-4_2', name: 'Microfiber Smart Cleaning Solution', category: 'Accessories', price: 250, quantity: 2 }
        ],
        subtotal: 3900,
        discount: 400,
        tax: 180,
        total: 3680,
        paymentMethod: 'UPI',
        status: 'Paid',
        notes: 'Handover in store.'
      }
    ]
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  // Specs Frames
  { id: 'p-1', name: 'RayBan Classic Wayfarer', category: 'Specs', price: 6500, costPrice: 3200, stock: 12, initialStockBought: 25 },
  { id: 'p-2', name: 'Titan Rimless Flex', category: 'Specs', price: 4200, costPrice: 1950, stock: 8, initialStockBought: 15 },
  { id: 'p-3', name: 'Oakley Pitchman R Matte Black', category: 'Specs', price: 9800, costPrice: 4600, stock: 4, initialStockBought: 10 },
  { id: 'p-4', name: 'Prada Elegant Cat-Eye', category: 'Specs', price: 14500, costPrice: 6500, stock: 3, initialStockBought: 8 },
  { id: 'p-5', name: 'Vogue Chic Round Frame', category: 'Specs', price: 3800, costPrice: 1600, stock: 15, initialStockBought: 25 },
  
  // Goggles
  { id: 'p-6', name: 'Polaroid Sport Polarized Goggles', category: 'Goggles', price: 3400, costPrice: 1500, stock: 22, initialStockBought: 30 },
  { id: 'p-7', name: 'RayBan Aviator Gold Mirror', category: 'Goggles', price: 8200, costPrice: 3800, stock: 7, initialStockBought: 15 },
  { id: 'p-8', name: 'Fastrack Active Wrap-around', category: 'Goggles', price: 1800, costPrice: 850, stock: 18, initialStockBought: 25 },

  // Lenses (Fitting items)
  { id: 'p-9', name: 'Essilor Progressive Crizal BlueKids', category: 'Specs', price: 4500, costPrice: 2000, stock: 40, initialStockBought: 50 },
  { id: 'p-10', name: 'Zeiss Duravision Platinum 1.67 thinned', category: 'Specs', price: 8500, costPrice: 3500, stock: 20, initialStockBought: 30 },
  { id: 'p-11', name: 'Crizal Easy Single Vision Lens', category: 'Specs', price: 1500, costPrice: 600, stock: 50, initialStockBought: 70 },

  // Contact Lenses
  { id: 'p-12', name: 'Bausch & Lomb Monthly PureVision 2 (6 pack)', category: 'Contact Lenses', price: 1800, costPrice: 900, stock: 5, initialStockBought: 15 },
  { id: 'p-13', name: 'Acuvue Oasys 2-Week Disposable (6 pack)', category: 'Contact Lenses', price: 2100, costPrice: 1050, stock: 4, initialStockBought: 12 },
  { id: 'p-14', name: 'Alcon Air Optix Aqua Monthly', category: 'Contact Lenses', price: 1950, costPrice: 950, stock: 3, initialStockBought: 10 },
  { id: 'p-15', name: 'Bausch & Lomb Biotrue OneDay (30 pack)', category: 'Contact Lenses', price: 3200, costPrice: 1600, stock: 3, initialStockBought: 8 },
  { id: 'p-16', name: 'FreshLook ColorBlends Monthly (2 pack)', category: 'Contact Lenses', price: 1100, costPrice: 500, stock: 2, initialStockBought: 10 },

  // Care Accessories
  { id: 'p-17', name: 'Bausch & Lomb Renu Fresh Multi-Purpose Solution 355ml', category: 'Accessories', price: 470, costPrice: 220, stock: 30, initialStockBought: 50 },
  { id: 'p-18', name: 'Opti-Free Express Replenish Solution 300ml', category: 'Accessories', price: 520, costPrice: 250, stock: 25, initialStockBought: 40 },
  { id: 'p-19', name: 'Microfiber Smart Cleaning Spray 100ml', category: 'Accessories', price: 120, costPrice: 40, stock: 100, initialStockBought: 150 },
  { id: 'p-20', name: 'Designer Polyurethane Specs Case', category: 'Accessories', price: 350, costPrice: 130, stock: 45, initialStockBought: 60 }
];

export const INITIAL_EXPENSES: MonthlyExpense[] = [
  {
    id: 'exp-1',
    month: 'May 2026',
    rent: 25000,
    lightBill: 4500,
    salaries: 40000,
    misc: 3500,
    notes: 'May standard operating bills. Paid in full.'
  },
  {
    id: 'exp-2',
    month: 'April 2026',
    rent: 25000,
    lightBill: 3800,
    salaries: 40000,
    misc: 2200,
    notes: 'April billing cycle. AC cooling was on.'
  },
  {
    id: 'exp-3',
    month: 'March 2026',
    rent: 25000,
    lightBill: 3200,
    salaries: 38000,
    misc: 1200,
    notes: 'March cycle. Seeding phase.'
  }
];

