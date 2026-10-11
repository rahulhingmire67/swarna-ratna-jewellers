/**
 * STORE MANAGEMENT PORTAL (ADMIN LOGIC)
 * Fully connected to MongoDB API with async operations.
 */

document.addEventListener('DOMContentLoaded', async () => {
  let products = await API.getProducts();
  let settings = await API.getSettings();
  let rates = await API.getRates();
  let stagedImage = '';

  // Elements
  const inventoryBody = document.getElementById('inventoryTableBody');
  const searchInput = document.getElementById('adminSearchInput');
  const modal = document.getElementById('productModal');
  const productForm = document.getElementById('productForm');
  const fileInput = document.getElementById('productFileInput');
  const urlInput = document.getElementById('productUrlInput');
  const previewBox = document.getElementById('adminPreviewBox');
  const previewImg = document.getElementById('adminPreviewImg');
  const toast = document.getElementById('adminToast');

  // Stats Elements
  const statTotalItems = document.getElementById('statTotalItems');
  const statTotalWeight = document.getElementById('statTotalWeight');
  const statRate22 = document.getElementById('statRate22');
  const statWhatsapp = document.getElementById('statWhatsapp');

  // Rates Form Elements
  const ratesForm = document.getElementById('bullionRatesForm');
  const rate24Input = document.getElementById('adminRate24');
  const rate22Input = document.getElementById('adminRate22');
  const rate18Input = document.getElementById('adminRate18');
  const rateSilverInput = document.getElementById('adminRateSilver');

  // Store Settings Form Elements
  const storeForm = document.getElementById('storeSettingsForm');
  const storeNameInput = document.getElementById('adminStoreName');
  const storeTaglineInput = document.getElementById('adminStoreTagline');
  const storeWhatsappInput = document.getElementById('adminWhatsapp');
  const storePhoneInput = document.getElementById('adminPhone');
  const storeAddressInput = document.getElementById('adminAddress');

  // Tab Navigation
  const navBtns = document.querySelectorAll('.nav-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const pageHeading = document.getElementById('pageHeading');

  navBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = btn.dataset.tab;
      
      navBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));
      
      btn.classList.add('active');
      const targetPane = document.getElementById(`${targetTab}Pane`);
      if (targetPane) targetPane.classList.add('active');

      if (targetTab === 'inventory') pageHeading.textContent = "Product Inventory Management";
      else if (targetTab === 'rates') pageHeading.textContent = "Daily Bullion Rates";
      else if (targetTab === 'store') pageHeading.textContent = "Showroom Profile & Settings";
    });
  });

  // Calculate & Update Dashboard Stats
  function updateStats() {
    statTotalItems.textContent = products.length;
    const totalGrams = products.reduce((acc, p) => acc + (parseFloat(p.weight) || 0), 0);
    statTotalWeight.textContent = `${totalGrams.toFixed(1)}g`;
    const r22 = rates?.gold22 || settings?.rates?.gold22 || 7040;
    statRate22.textContent = `₹${r22.toLocaleString('en-IN')}/g`;
    statWhatsapp.textContent = `+${settings.whatsapp || '919876543210'}`;
  }

  // Render Table
  function renderTable(filterText = '') {
    const q = filterText.toLowerCase();
    const filtered = products.filter(p => 
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.huid && p.huid.toLowerCase().includes(q))
    );

    if (filtered.length === 0) {
      inventoryBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 40px; color: var(--admin-muted);">No products found. Click "+ Add New Jewellery Piece" to add items.</td></tr>`;
      return;
    }

    inventoryBody.innerHTML = filtered.map(item => {
      const id = item._id || item.id;
      return `
        <tr>
          <td>
            <div class="product-cell">
              <img class="table-thumb" src="${item.image}" alt="${item.title}" onerror="this.src='https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=150&q=80'">
              <div>
                <strong>${item.title}</strong>
                <small style="display:block; color: var(--admin-muted);">${id}</small>
              </div>
            </div>
          </td>
          <td>${item.category}</td>
          <td>${item.purity}</td>
          <td><strong>${parseFloat(item.weight).toFixed(2)}g</strong></td>
          <td><strong style="color: var(--admin-gold-bright);">₹${item.price.toLocaleString('en-IN')}</strong></td>
          <td><small>${item.huid || 'BIS-916'}</small></td>
          <td>${item.featured ? '<span class="featured-pill">Showcase</span>' : '<span style="color: var(--admin-muted);">Standard</span>'}</td>
          <td class="text-right">
            <div class="actions-cell">
              <button class="btn btn-outline btn-sm edit-btn" data-id="${id}">Edit</button>
              <button class="btn btn-danger btn-sm delete-btn" data-id="${id}">Delete</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach Event Listeners
    inventoryBody.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => openEditModal(btn.dataset.id));
    });

    inventoryBody.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteProduct(btn.dataset.id));
    });
  }

  // Open Modal for Add
  document.getElementById('openAddModalBtn').addEventListener('click', () => {
    document.getElementById('modalTitle').textContent = "Add New Jewellery Product";
    document.getElementById('editProductId').value = "";
    productForm.reset();
    stagedImage = "";
    previewBox.style.display = "none";
    modal.classList.add('active');
  });

  // Open Modal for Edit
  function openEditModal(id) {
    const item = products.find(p => (p._id || p.id) === id);
    if (!item) return;

    document.getElementById('modalTitle').textContent = "Edit Jewellery Product";
    document.getElementById('editProductId').value = item._id || item.id;
    document.getElementById('productTitle').value = item.title;
    document.getElementById('productCategory').value = item.category;
    document.getElementById('productPurity').value = item.purity;
    document.getElementById('productWeight').value = item.weight;
    document.getElementById('productPrice').value = item.price;
    document.getElementById('productHuid').value = item.huid || '';
    document.getElementById('productDesc').value = item.description || '';
    document.getElementById('productFeatured').checked = !!item.featured;

    stagedImage = item.image;
    previewImg.src = item.image;
    previewBox.style.display = "block";

    modal.classList.add('active');
  }

  // Delete Product from MongoDB
  async function deleteProduct(id) {
    const item = products.find(p => (p._id || p.id) === id);
    if (!item) return;

    if (confirm(`Remove "${item.title}" from showroom catalog?`)) {
      await API.deleteProduct(id);
      products = await API.getProducts();
      renderTable(searchInput.value);
      updateStats();
      showToast(`Removed "${item.title}"`);
    }
  }

  // Handle Image File Upload
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      stagedImage = evt.target.result;
      previewImg.src = stagedImage;
      previewBox.style.display = 'block';
      urlInput.value = '';
    };
    reader.readAsDataURL(file);
  });

  // Handle Image URL
  urlInput.addEventListener('input', (e) => {
    const url = e.target.value.trim();
    if (url) {
      stagedImage = url;
      previewImg.src = url;
      previewBox.style.display = 'block';
    }
  });

  // Save Product (Add / Edit to MongoDB)
  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const editId = document.getElementById('editProductId').value;
    const title = document.getElementById('productTitle').value.trim();
    const category = document.getElementById('productCategory').value;
    const purity = document.getElementById('productPurity').value;
    const weight = parseFloat(document.getElementById('productWeight').value) || 0;
    const price = parseInt(document.getElementById('productPrice').value, 10) || 0;
    const huid = document.getElementById('productHuid').value.trim() || 'BIS-916-HUID';
    const description = document.getElementById('productDesc').value.trim();
    const featured = document.getElementById('productFeatured').checked;

    const defaultImg = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80";
    const image = stagedImage || defaultImg;

    const payload = { title, category, purity, weight, price, huid, description, featured, image };

    if (editId) {
      await API.updateProduct(editId, payload);
      showToast("Product updated in MongoDB!");
    } else {
      await API.createProduct(payload);
      showToast("New jewellery piece saved to MongoDB!");
    }

    products = await API.getProducts();
    renderTable(searchInput.value);
    updateStats();
    modal.classList.remove('active');
  });

  // Search input
  searchInput.addEventListener('input', (e) => {
    renderTable(e.target.value);
  });

  // Modal dismissals
  document.getElementById('closeProductModal').addEventListener('click', () => modal.classList.remove('active'));
  document.getElementById('cancelProductBtn').addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  // Populate & Save Daily Bullion Rates
  function populateRatesForm() {
    rate24Input.value = rates?.gold24 || 7680;
    rate22Input.value = rates?.gold22 || 7040;
    rate18Input.value = rates?.gold18 || 5760;
    rateSilverInput.value = rates?.silver || 94;
  }

  ratesForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newRates = {
      gold24: parseFloat(rate24Input.value) || 7680,
      gold22: parseFloat(rate22Input.value) || 7040,
      gold18: parseFloat(rate18Input.value) || 5760,
      silver: parseFloat(rateSilverInput.value) || 94
    };
    rates = await API.updateRates(newRates);
    updateStats();
    showToast("Today's Bullion Rates saved to database!");
  });

  // Populate & Save Store Settings
  function populateStoreForm() {
    storeNameInput.value = settings.storeName || 'SWARNA RATNA';
    storeTaglineInput.value = settings.tagline || 'HAUTE JOAILLERIE • ESTD. 1986';
    storeWhatsappInput.value = settings.whatsapp || '919876543210';
    storePhoneInput.value = settings.phone || '+91 98765 43210';
    storeAddressInput.value = settings.address || 'Heritage Plaza, MG Road, Pune / Mumbai';
  }

  storeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const updated = {
      storeName: storeNameInput.value.trim(),
      tagline: storeTaglineInput.value.trim(),
      whatsapp: storeWhatsappInput.value.trim(),
      phone: storePhoneInput.value.trim(),
      address: storeAddressInput.value.trim()
    };

    settings = await API.updateSettings(updated);
    updateStats();
    showToast("Showroom profile & WhatsApp contact updated in database!");
  });

  // Toast Helper
  function showToast(msg) {
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(() => {
      toast.style.display = 'none';
    }, 3000);
  }

  // Initial Boot
  updateStats();
  renderTable();
  populateRatesForm();
  populateStoreForm();
});
