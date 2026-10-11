/**
 * PUBLIC SHOWROOM ENGINE (app.js)
 * Clean, reactive consumer showroom logic with async MongoDB API support.
 */

document.addEventListener('DOMContentLoaded', async () => {
  let settings = await API.getSettings();
  let rates = await API.getRates();
  let products = await API.getProducts();
  let currentCategory = 'all';
  let searchQuery = '';

  // Elements
  const grid = document.getElementById('productsGrid');
  const noResults = document.getElementById('noResults');
  const searchInput = document.getElementById('catalogSearch');
  const categoryTabs = document.querySelectorAll('.pill-btn');
  const modal = document.getElementById('detailModal');
  const modalBody = document.getElementById('detailModalBody');

  // Populate Dynamic Store Branding & Rates
  function applyStoreSettings() {
    // Rates
    const currentRates = rates || settings.rates || { gold24: 7680, gold22: 7040, gold18: 5760, silver: 94 };
    document.getElementById('ticker24').textContent = `₹${(currentRates.gold24 || 7680).toLocaleString('en-IN')}/g`;
    document.getElementById('ticker22').textContent = `₹${(currentRates.gold22 || 7040).toLocaleString('en-IN')}/g`;
    document.getElementById('ticker18').textContent = `₹${(currentRates.gold18 || 5760).toLocaleString('en-IN')}/g`;
    document.getElementById('tickerSilver').textContent = `₹${(currentRates.silver || 94).toLocaleString('en-IN')}/g`;

    // Branding
    document.getElementById('navStoreName').textContent = settings.storeName || 'SWARNA RATNA';
    document.getElementById('navTagline').textContent = settings.tagline || 'HAUTE JOAILLERIE • ESTD. 1986';
    document.getElementById('footerStoreName').textContent = settings.storeName || 'SWARNA RATNA';
    document.getElementById('boutiqueAddress').textContent = settings.address || 'Heritage Plaza, MG Road, Pune / Mumbai';

    // Contact & WhatsApp
    const waNumber = settings.whatsapp || '919876543210';
    const waBase = `https://wa.me/${waNumber}`;
    document.getElementById('headerWaLink').href = waBase;
    document.getElementById('headerWaLink').textContent = settings.phone || '+91 98765 43210';
    document.getElementById('floatingWaBtn').href = waBase;
    document.getElementById('boutiqueWaBtn').href = waBase;
    document.getElementById('boutiqueCallBtn').href = `tel:${(settings.phone || '').replace(/[^0-9+]/g, '')}`;
    document.getElementById('navConsultBtn').href = `${waBase}?text=Namaste!%20I%20would%20like%20to%20book%20a%20private%20jewellery%20consultation.`;
  }

  // Render Product Cards
  function renderCatalog() {
    const q = searchQuery.toLowerCase();
    const filtered = products.filter(item => {
      const matchCat = currentCategory === 'all' || item.category === currentCategory;
      const matchSearch = !q ||
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.purity.toLowerCase().includes(q) ||
        (item.huid && item.huid.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      grid.style.display = 'none';
      noResults.style.display = 'block';
      return;
    }

    grid.style.display = 'grid';
    noResults.style.display = 'none';

    grid.innerHTML = filtered.map(item => {
      const itemId = item._id || item.id;
      const waMsg = encodeURIComponent(
        `Namaste ${settings.storeName}! I am interested in inquiring about this jewellery piece:\n*${item.title}*\nCode: ${itemId}\nPurity: ${item.purity}\nNet Gold Weight: ${item.weight}g\nPrice: ₹${item.price.toLocaleString('en-IN')}\nPlease share live availability.`
      );
      const waUrl = `https://wa.me/${settings.whatsapp}?text=${waMsg}`;

      return `
        <article class="product-card" id="card-${itemId}">
          <div class="card-image-box">
            <img src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'">
            <span class="hallmark-stamp">✦ BIS 916</span>
            ${item.featured ? '<span class="showcase-badge">Showcase</span>' : ''}
          </div>

          <div class="card-details">
            <span class="card-category-tag">${item.category}</span>
            <h3 class="card-product-title">${item.title}</h3>

            <div class="card-spec-strip">
              <span class="spec-entry"><strong>${item.purity}</strong></span>
              <span class="spec-entry">Weight: <strong>${parseFloat(item.weight).toFixed(2)}g</strong></span>
            </div>

            <div class="card-pricing-row">
              <span class="price-sublabel">Showroom Price:</span>
              <span class="price-amount">₹${item.price.toLocaleString('en-IN')}</span>
            </div>

            <div class="card-actions-grid">
              <a href="${waUrl}" target="_blank" rel="noopener" class="btn-card-inquire">
                WhatsApp Inquire
              </a>
              <button class="btn-card-quickview" data-id="${itemId}">
                Details
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');

    // Attach Details Modal Listener
    grid.querySelectorAll('.btn-card-quickview').forEach(btn => {
      btn.addEventListener('click', () => {
        openQuickView(btn.dataset.id);
      });
    });
  }

  // Open Quick View Modal
  function openQuickView(id) {
    const item = products.find(p => (p._id || p.id) === id);
    if (!item) return;

    const itemId = item._id || item.id;
    const waMsg = encodeURIComponent(
      `Namaste ${settings.storeName}! I am viewing *${item.title}* (Code: ${itemId}, ${item.weight}g, ₹${item.price.toLocaleString('en-IN')}). Please share video call preview.`
    );
    const waUrl = `https://wa.me/${settings.whatsapp}?text=${waMsg}`;

    modalBody.innerHTML = `
      <div class="modal-media-pane">
        <img src="${item.image}" alt="${item.title}" onerror="this.src='https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'">
      </div>
      <div class="modal-info-pane">
        <span class="modal-cat-tag">${item.category} • ${item.purity}</span>
        <h2 class="modal-title">${item.title}</h2>

        <div class="modal-price-box">
          <span>Showroom Value:</span>
          <strong>₹${item.price.toLocaleString('en-IN')}</strong>
        </div>

        <table class="modal-specs-table">
          <tbody>
            <tr>
              <td>Product Code:</td>
              <td>${itemId}</td>
            </tr>
            <tr>
              <td>BIS Hallmark / HUID:</td>
              <td>${item.huid || 'BIS-916 Stamped'}</td>
            </tr>
            <tr>
              <td>Net Metal Weight:</td>
              <td>${parseFloat(item.weight).toFixed(2)} Grams</td>
            </tr>
            <tr>
              <td>Purity Assurance:</td>
              <td>100% Karatmeter Verified</td>
            </tr>
          </tbody>
        </table>

        <p class="modal-desc">${item.description || 'Exquisite handcrafted Indian jewellery created by master artisans.'}</p>

        <a href="${waUrl}" target="_blank" rel="noopener" class="btn btn-whatsapp" style="width: 100%; text-align: center;">
          Inquire on WhatsApp
        </a>
      </div>
    `;

    modal.classList.add('active');
  }

  // Dismiss Modal
  document.getElementById('closeDetailModal').addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  // Category Tabs Filter
  categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      categoryTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.dataset.cat;
      renderCatalog();
    });
  });

  // Search Filter
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    renderCatalog();
  });

  // Init
  applyStoreSettings();
  renderCatalog();
});
