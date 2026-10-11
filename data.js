/**
 * SWARNA RATNA JEWELLERS - PRODUCTION HYBRID DATA LAYER
 * Connects seamlessly to MongoDB REST API with local persistence fallback.
 */

const DEFAULT_SETTINGS = {
  storeName: "SWARNA RATNA",
  tagline: "HAUTE JOAILLERIE • ESTD. 1986",
  phone: "+91 98765 43210",
  whatsapp: "919876543210",
  address: "Heritage Plaza, MG Road, Pune / Mumbai - 411001",
  rates: {
    gold24: 7680,
    gold22: 7040,
    gold18: 5760,
    silver: 94
  }
};

const INITIAL_CATALOG = [
  {
    _id: "SR-101",
    id: "SR-101",
    title: "Noor-E-Kundan Bridal Choker",
    category: "Bridal",
    purity: "22K BIS 916",
    weight: 68.40,
    price: 495000,
    featured: true,
    huid: "HUID-MH-916-BR101",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80",
    description: "Opulent handcrafted royal choker set embedded with uncut polki, rubies, and freshwater pearls."
  },
  {
    _id: "SR-102",
    id: "SR-102",
    title: "Gaja Lakshmi Antique Temple Haram",
    category: "Necklaces",
    purity: "22K BIS 916",
    weight: 54.20,
    price: 408000,
    featured: true,
    huid: "HUID-MH-916-NL102",
    image: "https://images.unsplash.com/photo-1611591475152-47eac98068ac?auto=format&fit=crop&w=800&q=80",
    description: "Sacred South Indian temple antique gold haram sculpted with Goddess Lakshmi and elephant crests."
  },
  {
    _id: "SR-103",
    id: "SR-103",
    title: "Mehrunisa Emerald Chandbali Jhumkas",
    category: "Earrings",
    purity: "22K BIS 916",
    weight: 23.60,
    price: 178000,
    featured: true,
    huid: "HUID-MH-916-ER103",
    image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80",
    description: "Crescent-shaped heritage chandbalis adorned with natural Zambian emerald droplets and seed pearls."
  },
  {
    _id: "SR-104",
    id: "SR-104",
    title: "Mayur Nakshi Handcarved Gold Kadas",
    category: "Bangles",
    purity: "22K BIS 916",
    weight: 46.00,
    price: 345000,
    featured: false,
    huid: "HUID-MH-916-BG104",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80",
    description: "Pair of solid 22K royal Nakshi kadas featuring embossed dancing peacocks and filigree motifs."
  },
  {
    _id: "SR-105",
    id: "SR-105",
    title: "Sitara Solitaire Cluster Mangalsutra",
    category: "Mangalsutra",
    purity: "18K Diamond",
    weight: 14.50,
    price: 135000,
    featured: true,
    huid: "HUID-18K-DIA-MS105",
    image: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80",
    description: "Modern minimalist mangalsutra strung on auspicious black beads with a certified diamond cluster."
  },
  {
    _id: "SR-106",
    id: "SR-106",
    title: "Samriddhi 24K Laxmi Ganesh Coin (10g)",
    category: "Coins",
    purity: "24K (999.9)",
    weight: 10.00,
    price: 78500,
    featured: false,
    huid: "MMTC-999-10G",
    image: "https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=800&q=80",
    description: "Govt-accredited 999.9 fine pure gold bullion coin in tamper-proof CertiCard packaging."
  }
];

// Asynchronous API calls with fallback to localStorage
const API = {
  isHttp: typeof window !== 'undefined' && window.location.protocol.startsWith('http'),

  // Fetch Products
  async getProducts() {
    if (this.isHttp) {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            localStorage.setItem('swarna_products', JSON.stringify(data));
            return data.map(p => ({ ...p, id: p._id || p.id }));
          }
        }
      } catch (e) {
        // Backend offline, fall through
      }
    }
    const saved = localStorage.getItem('swarna_products');
    return saved ? JSON.parse(saved) : INITIAL_CATALOG;
  },

  // Create Product in MongoDB
  async createProduct(productData) {
    if (this.isHttp) {
      try {
        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
        if (res.ok) {
          const saved = await res.json();
          return { ...saved, id: saved._id || saved.id };
        }
      } catch (e) {}
    }
    // Local fallback
    const local = JSON.parse(localStorage.getItem('swarna_products') || JSON.stringify(INITIAL_CATALOG));
    const newProd = { ...productData, id: "SR-" + Date.now().toString(36).toUpperCase() };
    local.unshift(newProd);
    localStorage.setItem('swarna_products', JSON.stringify(local));
    return newProd;
  },

  // Update Product in MongoDB
  async updateProduct(id, productData) {
    if (this.isHttp) {
      try {
        const res = await fetch(`/api/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });
        if (res.ok) return await res.json();
      } catch (e) {}
    }
    const local = JSON.parse(localStorage.getItem('swarna_products') || JSON.stringify(INITIAL_CATALOG));
    const idx = local.findIndex(p => (p._id || p.id) === id);
    if (idx !== -1) {
      local[idx] = { ...local[idx], ...productData };
      localStorage.setItem('swarna_products', JSON.stringify(local));
    }
    return productData;
  },

  // Delete Product from MongoDB
  async deleteProduct(id) {
    if (this.isHttp) {
      try {
        const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        if (res.ok) return true;
      } catch (e) {}
    }
    const local = JSON.parse(localStorage.getItem('swarna_products') || JSON.stringify(INITIAL_CATALOG));
    const filtered = local.filter(p => (p._id || p.id) !== id);
    localStorage.setItem('swarna_products', JSON.stringify(filtered));
    return true;
  },

  // Bullion Rates
  async getRates() {
    if (this.isHttp) {
      try {
        const res = await fetch('/api/rates');
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem('swarna_rates', JSON.stringify(data));
          return data;
        }
      } catch (e) {}
    }
    const saved = localStorage.getItem('swarna_rates');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS.rates;
  },

  async updateRates(rates) {
    if (this.isHttp) {
      try {
        const res = await fetch('/api/rates', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rates)
        });
        if (res.ok) return await res.json();
      } catch (e) {}
    }
    localStorage.setItem('swarna_rates', JSON.stringify(rates));
    return rates;
  },

  // Store Settings
  async getSettings() {
    if (this.isHttp) {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem('swarna_settings', JSON.stringify(data));
          return data;
        }
      } catch (e) {}
    }
    const saved = localStorage.getItem('swarna_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  },

  async updateSettings(settings) {
    if (this.isHttp) {
      try {
        const res = await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings)
        });
        if (res.ok) return await res.json();
      } catch (e) {}
    }
    localStorage.setItem('swarna_settings', JSON.stringify(settings));
    return settings;
  }
};
