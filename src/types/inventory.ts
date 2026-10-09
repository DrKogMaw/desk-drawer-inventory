export interface Drawer {
  id: number; // 1 to 5
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  drawerId: number; // 1 to 5
  category: string;
  emoji: string;
  minThreshold: number; // Default 1
  createdAt: string;
  updatedAt: string;
}

export const CATEGORY_EMOJIS: Record<string, string> = {
  'Stationery & Paper': '✏️',
  'Cables & Tech': '⚡',
  'Hardware & Tools': '🛠️',
  'Office Supplies': '📦',
  'Audio & Media': '🎧',
  'Personal & Keys': '🔑',
  'Medical & Care': '💊',
  'Miscellaneous': '🎲',
};

export const DEFAULT_DRAWERS: Drawer[] = [
  {
    id: 1,
    name: 'Top Drawer - Stationery & Notes',
    description: 'Sticky notes, pens, highlighters, and quick access notebooks',
    color: '#0c8de9',
    icon: 'PenTool',
  },
  {
    id: 2,
    name: 'Middle Drawer 1 - Cables & Adapters',
    description: 'USB-C cables, chargers, dongles, and power banks',
    color: '#10b981',
    icon: 'Zap',
  },
  {
    id: 3,
    name: 'Middle Drawer 2 - Office Supplies',
    description: 'Staplers, paperclips, sticky tape, scissors, and envelopes',
    color: '#f59e0b',
    icon: 'Package',
  },
  {
    id: 4,
    name: 'Drawer 4 - Tools & Maintenance',
    description: 'Precision screwdrivers, flashlights, tape measure, and batteries',
    color: '#ec4899',
    icon: 'Wrench',
  },
  {
    id: 5,
    name: 'Bottom Drawer - Heavy & Misc Storage',
    description: 'Spare peripherals, documentation, headphones, and backup storage',
    color: '#8b5cf6',
    icon: 'Archive',
  },
];

export const INITIAL_ITEMS: InventoryItem[] = [
  {
    id: 'item-101',
    name: 'Pilot G2 Gel Pens (Black 0.7mm)',
    description: 'Smooth writing retractable gel ink pens. Pack of 4 remaining.',
    quantity: 4,
    drawerId: 1,
    category: 'Stationery & Paper',
    emoji: '✏️',
    minThreshold: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-102',
    name: '3M Post-it Yellow Sticky Notes (3x3)',
    description: 'Standard canary yellow self-adhesive note pads.',
    quantity: 1, // Low stock!
    drawerId: 1,
    category: 'Stationery & Paper',
    emoji: '📝',
    minThreshold: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-103',
    name: 'Faber-Castell Highlighters Set',
    description: 'Neon yellow, green, and pink text markers.',
    quantity: 3,
    drawerId: 1,
    category: 'Stationery & Paper',
    emoji: '🖊️',
    minThreshold: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-201',
    name: 'Anker USB-C to USB-C Braided Cable (6ft)',
    description: '100W fast charging cable for laptops and smartphones.',
    quantity: 2,
    drawerId: 2,
    category: 'Cables & Tech',
    emoji: '⚡',
    minThreshold: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-202',
    name: 'Apple USB-C to HDMI Digital AV Adapter',
    description: 'Multiport adapter with 4K HDMI, USB-A, and USB-C pass-through charging.',
    quantity: 1, // Low stock!
    drawerId: 2,
    category: 'Cables & Tech',
    emoji: '🔌',
    minThreshold: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-203',
    name: 'Anker PowerCore 10000mAh Power Bank',
    description: 'Portable external battery charger with PowerIQ technology.',
    quantity: 0, // Out of stock!
    drawerId: 2,
    category: 'Cables & Tech',
    emoji: '🔋',
    minThreshold: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-301',
    name: 'Heavy Duty Metal Desk Stapler',
    description: 'Standard 26/6 staple capacity desk stapler in matte black.',
    quantity: 1,
    drawerId: 3,
    category: 'Office Supplies',
    emoji: '📎',
    minThreshold: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-302',
    name: 'Standard Staples Box (5000 count)',
    description: 'Refill box for standard office staplers.',
    quantity: 2,
    drawerId: 3,
    category: 'Office Supplies',
    emoji: '📦',
    minThreshold: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-303',
    name: 'Stainless Steel Craft Scissors 8"',
    description: 'Ergonomic soft-grip handle precision cutting shears.',
    quantity: 1,
    drawerId: 3,
    category: 'Office Supplies',
    emoji: '✂️',
    minThreshold: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-401',
    name: 'iFixit Precision Screwdriver Bit Set (24-in-1)',
    description: 'Magnetic steel bits for electronic repair, laptop, and eyeglasses.',
    quantity: 1,
    drawerId: 4,
    category: 'Hardware & Tools',
    emoji: '🛠️',
    minThreshold: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-402',
    name: 'Duracell AA Rechargeable Batteries (4-Pack)',
    description: 'Pre-charged NiMH 2500mAh high capacity batteries.',
    quantity: 0, // Out of stock!
    drawerId: 4,
    category: 'Hardware & Tools',
    emoji: '🔋',
    minThreshold: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-403',
    name: 'Microfiber Cleaning Cloths (Pack of 3)',
    description: 'Ultra-soft cloths for monitor screen and optical glass cleaning.',
    quantity: 5,
    drawerId: 4,
    category: 'Hardware & Tools',
    emoji: '🧹',
    minThreshold: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-501',
    name: 'Sony WH-1000XM4 Noise Canceling Headphones',
    description: 'Over-ear wireless headphones with carrying case and flight adapter.',
    quantity: 1,
    drawerId: 5,
    category: 'Audio & Media',
    emoji: '🎧',
    minThreshold: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'item-502',
    name: 'SanDisk 1TB Extreme Portable External SSD',
    description: 'USB 3.2 Gen 2 rugged NVMe portable solid state drive.',
    quantity: 2,
    drawerId: 5,
    category: 'Cables & Tech',
    emoji: '💾',
    minThreshold: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
