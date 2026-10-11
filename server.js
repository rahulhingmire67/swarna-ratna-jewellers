/**
 * SWARNA RATNA JEWELLERS - PRODUCTION BACKEND (Express + MongoDB)
 */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rahulhingmire67_db_user:d4Oul5UOKmb4wnRS@cluster0.zpjv4se.mongodb.net/jewellery_db?retryWrites=true&w=majority&appName=Cluster0';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Support base64 image uploads up to 10MB
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve frontend static assets
app.use(express.static(path.join(__dirname, '.')));

// ==========================================
// MONGOOSE SCHEMAS & MODELS
// ==========================================

const productSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  purity: { type: String, required: true },
  weight: { type: Number, required: true },
  price: { type: Number, required: true },
  huid: { type: String, default: 'BIS-916-HUID' },
  image: { type: String, required: true },
  featured: { type: Boolean, default: false },
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const bullionRateSchema = new mongoose.Schema({
  gold24: { type: Number, default: 7680 },
  gold22: { type: Number, default: 7040 },
  gold18: { type: Number, default: 5760 },
  silver: { type: Number, default: 94 },
  updatedAt: { type: Date, default: Date.now }
});

const storeSettingSchema = new mongoose.Schema({
  storeName: { type: String, default: 'SWARNA RATNA' },
  tagline: { type: String, default: 'HAUTE JOAILLERIE • ESTD. 1986' },
  phone: { type: String, default: '+91 98765 43210' },
  whatsapp: { type: String, default: '919876543210' },
  address: { type: String, default: 'Heritage Plaza, MG Road, Pune / Mumbai - 411001' }
});

const Product = mongoose.model('Product', productSchema);
const BullionRate = mongoose.model('BullionRate', bullionRateSchema);
const StoreSetting = mongoose.model('StoreSetting', storeSettingSchema);

// Initial starter seed data if collection is empty
const INITIAL_SEED = [
  {
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

// Seed DB if collection is empty
async function initDatabaseDefaults() {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany(INITIAL_SEED);
      console.log('✨ Seeded initial jewellery showroom products into MongoDB');
    }

    const rateCount = await BullionRate.countDocuments();
    if (rateCount === 0) {
      await BullionRate.create({});
      console.log('✨ Initialized default daily bullion rates in MongoDB');
    }

    const settingCount = await StoreSetting.countDocuments();
    if (settingCount === 0) {
      await StoreSetting.create({});
      console.log('✨ Initialized default showroom settings in MongoDB');
    }
  } catch (err) {
    console.error('Error during database initialization:', err.message);
  }
}

// ==========================================
// REST API ROUTES
// ==========================================

// Health Check
app.get('/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({
    status: 'healthy',
    database: isConnected ? 'connected' : 'disconnected',
    timestamp: new Date()
  });
});

// Products API
app.get('/api/products', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { purity: { $regex: search, $options: 'i' } },
        { huid: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products', details: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { title, category, purity, weight, price, huid, image, featured, description } = req.body;
    if (!title || !weight || !price) {
      return res.status(400).json({ error: 'Title, weight, and price are required' });
    }

    const newProduct = await Product.create({
      title,
      category,
      purity,
      weight,
      price,
      huid: huid || 'BIS-916-HUID',
      image,
      featured: !!featured,
      description: description || ''
    });

    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product', details: err.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Product not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product', details: err.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product', details: err.message });
  }
});

// Bullion Rates API
app.get('/api/rates', async (req, res) => {
  try {
    let rates = await BullionRate.findOne();
    if (!rates) rates = await BullionRate.create({});
    res.json(rates);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch rates', details: err.message });
  }
});

app.put('/api/rates', async (req, res) => {
  try {
    const { gold24, gold22, gold18, silver } = req.body;
    let rates = await BullionRate.findOne();
    if (!rates) {
      rates = await BullionRate.create({ gold24, gold22, gold18, silver });
    } else {
      rates.gold24 = gold24 || rates.gold24;
      rates.gold22 = gold22 || rates.gold22;
      rates.gold18 = gold18 || rates.gold18;
      rates.silver = silver || rates.silver;
      rates.updatedAt = new Date();
      await rates.save();
    }
    res.json(rates);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update rates', details: err.message });
  }
});

// Store Settings API
app.get('/api/settings', async (req, res) => {
  try {
    let settings = await StoreSetting.findOne();
    if (!settings) settings = await StoreSetting.create({});
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings', details: err.message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    let settings = await StoreSetting.findOne();
    if (!settings) {
      settings = await StoreSetting.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings', details: err.message });
  }
});

// Catch-all route to serve the public showroom
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ==========================================
// CONNECT TO MONGODB & START SERVER
// ==========================================
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
    initDatabaseDefaults();
    app.listen(PORT, () => {
      console.log(`🚀 Swarna Ratna Jewellers server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.warn('⚠️ MongoDB connection note:', err.message);
    console.log(`Starting Express server at http://localhost:${PORT} in fallback mode...`);
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  });
