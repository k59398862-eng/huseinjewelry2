export interface Product {
  id: number;
  name: string;
  price: number;
  weight: string;
  karat: string;
  description: string;
  imageUrl?: string | null;
  images?: string | null;
  order?: number;
  isDefault?: boolean;
}

const newImageUrl = "https://raw.githubusercontent.com/tamata3m3na-oss/golden-glow-emporium/main/src/assets/gold-photo.png";

export const defaultProducts: Product[] = [
  {
    id: 1,
    name: "سبيكة ذهب 44.8 جرام عيار 24",
    price: 27776,
    weight: "44.8",
    karat: "24",
    description: "سبيكة ذهب خالص عيار 24 قيراط بوزن 44.8 جرام",
    imageUrl: newImageUrl,
    isDefault: true,
    order: 1,
  },
  {
    id: 2,
    name: "سبيكة ذهب 105.4 جرام عيار 24",
    price: 65348,
    weight: "105.4",
    karat: "24",
    description: "سبيكة ذهب خالص عيار 24 قيراط بوزن 105.4 جرام",
    imageUrl: newImageUrl,
    isDefault: true,
    order: 2,
  },
  {
    id: 3,
    name: "سبيكة ذهب 211 جرام عيار 24",
    price: 130820,
    weight: "211",
    karat: "24",
    description: "سبيكة ذهب خالص عيار 24 قيراط بوزن 211 جرام",
    imageUrl: newImageUrl,
    isDefault: true,
    order: 3,
  },
  {
    id: 4,
    name: "سبيكة ذهب 13 جرام عيار 24",
    price: 8060,
    weight: "13",
    karat: "24",
    description: "سبيكة ذهب خالص عيار 24 قيراط بوزن 13 جرام",
    imageUrl: newImageUrl,
    isDefault: true,
    order: 4,
  },
  {
    id: 5,
    name: "سبيكة ذهب 65 جرام عيار 24",
    price: 40300,
    weight: "65",
    karat: "24",
    description: "سبيكة ذهب خالص عيار 24 قيراط بوزن 65 جرام",
    imageUrl: newImageUrl,
    isDefault: true,
    order: 5,
  },
  {
    id: 6,
    name: "سبيكة ذهب 26 جرام عيار 24",
    price: 16120,
    weight: "26",
    karat: "24",
    description: "سبيكة ذهب خالص عيار 24 قيراط بوزن 26 جرام",
    imageUrl: newImageUrl,
    isDefault: true,
    order: 6,
  },
  {
    id: 7,
    name: "سبيكة ذهب 9 جرام عيار 24",
    price: 5580,
    weight: "9",
    karat: "24",
    description: "سبيكة ذهب خالص عيار 24 قيراط بوزن 9 جرام",
    imageUrl: newImageUrl,
    isDefault: true,
    order: 7,
  },
  {
    id: 8,
    name: "سبيكة ذهب 43 جرام عيار 24",
    price: 26660,
    weight: "43",
    karat: "24",
    description: "سبيكة ذهب خالص عيار 24 قيراط بوزن 43 جرام",
    imageUrl: newImageUrl,
    isDefault: true,
    order: 8,
  },
  {
    id: 9,
    name: "سبيكة ذهب 17.5 جرام عيار 24",
    price: 10850,
    weight: "17.5",
    karat: "24",
    description: "سبيكة ذهب خالص عيار 24 قيراط بوزن 17.5 جرام",
    imageUrl: newImageUrl,
    isDefault: true,
    order: 9,
  },
  {
    id: 10,
    name: "سبيكة ذهب 12 جرام عيار 24",
    price: 7440,
    weight: "12",
    karat: "24",
    description: "سبيكة ذهب خالص عيار 24 قيراط بوزن 12 جرام",
    imageUrl: newImageUrl,
    isDefault: true,
    order: 10,
  },
  {
    id: 11,
    name: "سبيكة ذهب 36 جرام عيار 24",
    price: 22320,
    weight: "36",
    karat: "24",
    description: "سبيكة ذهب خالص عيار 24 قيراط بوزن 36 جرام",
    imageUrl: newImageUrl,
    isDefault: true,
    order: 11,
  },
];

export const getProducts = (): Product[] => {
  try {
    const custom = localStorage.getItem('custom_products');
    const customProducts: Product[] = custom ? JSON.parse(custom) : [];
    const all = [...defaultProducts, ...customProducts];
    return all.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  } catch {
    return [...defaultProducts];
  }
};

export const getProductById = (id: number): Product | undefined => {
  return getProducts().find(p => p.id === id);
};

export const addProduct = (product: Omit<Product, 'id'>) => {
  const custom = localStorage.getItem('custom_products');
  const customProducts: Product[] = custom ? JSON.parse(custom) : [];
  const maxOrder = getProducts().reduce((max, p) => Math.max(max, p.order ?? 0), 0);
  const newProduct: Product = { ...product, id: Date.now(), order: maxOrder + 1, isDefault: false };
  customProducts.push(newProduct);
  localStorage.setItem('custom_products', JSON.stringify(customProducts));
  return newProduct;
};

export const updateProduct = (id: number, updates: Partial<Product>) => {
  const custom = localStorage.getItem('custom_products');
  const customProducts: Product[] = custom ? JSON.parse(custom) : [];
  const idx = customProducts.findIndex(p => p.id === id);
  if (idx !== -1) {
    customProducts[idx] = { ...customProducts[idx], ...updates };
    localStorage.setItem('custom_products', JSON.stringify(customProducts));
    return customProducts[idx];
  }
  return null;
};

export const deleteProduct = (id: number) => {
  const custom = localStorage.getItem('custom_products');
  const customProducts: Product[] = custom ? JSON.parse(custom) : [];
  const updated = customProducts.filter(p => p.id !== id);
  localStorage.setItem('custom_products', JSON.stringify(updated));
};

export const reorderProduct = (id: number, direction: 'up' | 'down') => {
  const all = getProducts();
  const custom = localStorage.getItem('custom_products');
  const customProducts: Product[] = custom ? JSON.parse(custom) : [];

  const idx = all.findIndex(p => p.id === id);
  if (idx === -1) return;

  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= all.length) return;

  const aOrder = all[idx].order ?? idx;
  const bOrder = all[swapIdx].order ?? swapIdx;

  const updateCustom = (pid: number, newOrder: number) => {
    const ci = customProducts.findIndex(p => p.id === pid);
    if (ci !== -1) customProducts[ci].order = newOrder;
  };
  const updateDefault = (pid: number, newOrder: number) => {
    const di = defaultProducts.findIndex(p => p.id === pid);
    if (di !== -1) defaultProducts[di].order = newOrder;
  };

  [all[idx], all[swapIdx]].forEach((p, i) => {
    const newOrder = i === 0 ? bOrder : aOrder;
    if (p.isDefault) updateDefault(p.id, newOrder);
    else updateCustom(p.id, newOrder);
  });

  localStorage.setItem('custom_products', JSON.stringify(customProducts));
};
