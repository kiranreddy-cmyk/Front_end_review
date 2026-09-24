/**
 * user.js - User Dashboard, Favorites Management, & Purchases History
 * Online Art Gallery (ArtVista) - SDC Project Review-1
 * Strictly Vanilla JavaScript & LocalStorage
 */

// 1. Initialize User Dashboard (user-dashboard.html)
function initUserDashboard() {
  const user = requireAuth();
  if (!user) return;

  const greetingEl = document.getElementById('userGreeting');
  if (greetingEl) {
    greetingEl.textContent = `Welcome, ${user.name}`;
  }

  // Load User Stats
  const favorites = getData('favorites', {});
  const userFavs = favorites[user.id] || [];

  const purchases = getData('purchases', []).filter(p => p.userId === user.id);
  const bids = getData('bids', []).filter(b => b.userId === user.id);
  const reviews = getData('reviews', []).filter(r => r.userId === user.id);

  const elFavs = document.getElementById('userTotalFavorites');
  const elPurchases = document.getElementById('userTotalPurchases');
  const elBids = document.getElementById('userTotalBids');
  const elReviews = document.getElementById('userTotalReviews');

  if (elFavs) elFavs.textContent = userFavs.length;
  if (elPurchases) elPurchases.textContent = purchases.length;
  if (elBids) elBids.textContent = bids.length;
  if (elReviews) elReviews.textContent = reviews.length;

  // Render Recent Purchases Table on Dashboard
  const recentTable = document.getElementById('userRecentPurchasesTable');
  if (recentTable) {
    if (purchases.length === 0) {
      recentTable.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 20px;">No purchases made yet. <a href="artworks.html" style="color: var(--accent); font-weight: 600;">Browse Gallery</a></td></tr>`;
    } else {
      recentTable.innerHTML = purchases.slice(-4).reverse().map(p => `
        <tr>
          <td>#ORD-${p.id}</td>
          <td><strong>${p.artworkName}</strong></td>
          <td>${p.artist}</td>
          <td>${formatCurrency(p.price)}</td>
          <td><span class="badge badge-sale">${p.status || 'Completed'}</span></td>
        </tr>
      `).join('');
    }
  }
}

// 2. Initialize Favorites Page (favorites.html)
function renderFavoritesPage() {
  const user = getCurrentUser();
  const container = document.getElementById('favoritesGrid');
  if (!container) return;

  if (!user) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">♡</div>
        <h3>Please Log In</h3>
        <p>You must be logged in to view and manage your favorite artworks.</p>
        <a href="login.html" class="btn btn-primary">Login Now</a>
      </div>
    `;
    return;
  }

  const favorites = getData('favorites', {});
  const userFavIds = favorites[user.id] || [];

  if (userFavIds.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">♡</div>
        <h3>No Favorites Saved Yet</h3>
        <p>Browse our art gallery and tap the heart icon on any artwork to save it here.</p>
        <a href="artworks.html" class="btn btn-accent">Explore Gallery</a>
      </div>
    `;
    return;
  }

  const artworks = getData('artworks', []);
  const favArtworks = artworks.filter(a => userFavIds.includes(a.id));

  container.innerHTML = favArtworks.map(art => `
    <div class="artwork-card" data-id="${art.id}">
      <div class="artwork-image-wrap">
        <img src="${art.image}" alt="${art.name}" onerror="this.src='images/artworks/artwork-1.svg'">
        <span class="badge ${art.type === 'Auction' ? 'badge-auction' : 'badge-sale'} artwork-badge-floating">${art.type}</span>
      </div>
      <div class="artwork-body">
        <div class="artwork-meta-row">
          <span class="artwork-category">${art.category}</span>
        </div>
        <h3 class="artwork-title">${art.name}</h3>
        <p class="artwork-artist">by ${art.artist}</p>
        <div class="artwork-footer" style="margin-top: 10px;">
          <div>
            <div class="artwork-price-label">Price</div>
            <div class="artwork-price-val">${formatCurrency(art.type === 'Auction' ? (art.currentBid || art.price) : art.price)}</div>
          </div>
          <div style="display: flex; gap: 8px;">
            <button onclick="toggleFavorite(${art.id}, this)" class="btn btn-sm btn-outline" style="color: var(--danger); border-color: var(--danger);" title="Remove">Remove</button>
            <a href="artwork-details.html?id=${art.id}" class="btn btn-sm btn-primary">View</a>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

// 3. Initialize Purchases Page (purchases.html)
function initPurchasesPage() {
  const user = requireAuth();
  if (!user) return;

  const tableBody = document.getElementById('userPurchasesTableBody');
  const emptyState = document.getElementById('purchasesEmptyState');
  const totalSpentEl = document.getElementById('userTotalSpent');
  const purchaseCountEl = document.getElementById('userPurchaseCount');

  if (!tableBody) return;

  const purchases = getData('purchases', []).filter(p => p.userId === user.id);

  const totalSpent = purchases.reduce((sum, p) => sum + Number(p.price || 0), 0);
  if (totalSpentEl) totalSpentEl.textContent = formatCurrency(totalSpent);
  if (purchaseCountEl) purchaseCountEl.textContent = `${purchases.length} Items`;

  if (purchases.length === 0) {
    if (emptyState) emptyState.style.display = 'block';
    tableBody.innerHTML = '';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  tableBody.innerHTML = purchases.map(p => `
    <tr>
      <td><strong>#ORD-${p.id}</strong></td>
      <td>
        <div style="display: flex; align-items: center; gap: 12px;">
          <img src="${p.image || 'images/artworks/artwork-1.svg'}" class="table-thumb" alt="${p.artworkName}">
          <div>
            <div style="font-weight: 700;">${p.artworkName}</div>
            <div style="font-size: 0.82rem; color: var(--text-muted);">${p.artist}</div>
          </div>
        </div>
      </td>
      <td><strong>${formatCurrency(p.price)}</strong></td>
      <td>${p.date}</td>
      <td><span class="badge badge-sale">${p.status || 'Completed'}</span></td>
      <td>
        <a href="artwork-details.html?id=${p.artworkId}" class="btn btn-sm btn-outline">View Artwork</a>
      </td>
    </tr>
  `).join('');
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('userGreeting')) {
    initUserDashboard();
  }
  if (document.getElementById('favoritesGrid')) {
    renderFavoritesPage();
  }
  if (document.getElementById('userPurchasesTableBody')) {
    initPurchasesPage();
  }
});
