/**
 * artworks.js - Artwork Gallery, Search, Filter, Details, Buy, & Favorites
 * Online Art Gallery (ArtLoom) - SDC Project Review-1
 * Strictly Vanilla JavaScript & LocalStorage
 */

// Helper to check if an artwork is favorited by current user
function isArtworkFavorited(artworkId) {
  const user = getCurrentUser();
  if (!user) return false;
  const favorites = getData('favorites', {});
  const userFavs = favorites[user.id] || [];
  return userFavs.includes(Number(artworkId));
}

// Toggle Favorite Status
function toggleFavorite(artworkId, btnElement) {
  const user = getCurrentUser();
  if (!user) {
    showToast('Please login to save favorite artworks', 'warning');
    setTimeout(() => { window.location.href = 'login.html'; }, 1000);
    return;
  }

  const favorites = getData('favorites', {});
  if (!favorites[user.id]) {
    favorites[user.id] = [];
  }

  const artIdNum = Number(artworkId);
  const index = favorites[user.id].indexOf(artIdNum);

  if (index > -1) {
    // Remove favorite
    favorites[user.id].splice(index, 1);
    setData('favorites', favorites);
    if (btnElement) {
      btnElement.classList.remove('active');
      btnElement.innerHTML = '♡';
    }
    showToast('Removed from favorites', 'info');
  } else {
    // Add favorite
    favorites[user.id].push(artIdNum);
    setData('favorites', favorites);
    if (btnElement) {
      btnElement.classList.add('active');
      btnElement.innerHTML = '♥';
    }
    showToast('Added to your favorites!', 'success');
  }

  // If on favorites.html, re-render
  if (typeof renderFavoritesPage === 'function') {
    renderFavoritesPage();
  }
}

// Render a single Artwork Card HTML
function createArtworkCardHTML(art) {
  const isFav = isArtworkFavorited(art.id);
  const typeBadgeClass = art.type === 'Auction' ? 'badge-auction' : 'badge-sale';
  const priceDisplay = art.type === 'Auction' ? (art.currentBid || art.price) : art.price;
  const priceLabel = art.type === 'Auction' ? 'Current Bid' : 'Price';

  return `
    <div class="artwork-card" data-id="${art.id}" data-category="${art.category}">
      <div class="artwork-image-wrap">
        <img src="${art.image}" alt="${art.name}" loading="lazy" onerror="this.src='images/artworks/artwork-1.svg'">
        <span class="badge ${typeBadgeClass} artwork-badge-floating">${art.type}</span>
        <button class="btn-fav-floating ${isFav ? 'active' : ''}" onclick="toggleFavorite(${art.id}, this)" title="${isFav ? 'Remove Favorite' : 'Add to Favorites'}">
          ${isFav ? '♥' : '♡'}
        </button>
      </div>
      <div class="artwork-body">
        <div class="artwork-meta-row">
          <span class="artwork-category">${art.category}</span>
          <span class="badge badge-category">${art.status || 'Active'}</span>
        </div>
        <h3 class="artwork-title" title="${art.name}">
          <a href="artwork-details.html?id=${art.id}">${art.name}</a>
        </h3>
        <p class="artwork-artist">by <a href="artist-profile.html?artist=${encodeURIComponent(art.artist)}">${art.artist}</a></p>
        
        <div class="artwork-footer">
          <div>
            <div class="artwork-price-label">${priceLabel}</div>
            <div class="artwork-price-val">${formatCurrency(priceDisplay)}</div>
          </div>
          <a href="artwork-details.html?id=${art.id}" class="btn btn-sm btn-outline-accent">View Details</a>
        </div>
      </div>
    </div>
  `;
}

// Render Featured Artworks on Homepage
function initFeaturedArtworks() {
  const container = document.getElementById('featuredArtworksGrid');
  if (!container) return;

  const artworks = getData('artworks', []);
  const featured = artworks.filter(a => a.featured).slice(0, 6);

  if (featured.length === 0) {
    container.innerHTML = '<p class="text-muted">No featured artworks available right now.</p>';
    return;
  }

  container.innerHTML = featured.map(createArtworkCardHTML).join('');
}

// Render Gallery with Search, Filtering, and Sorting on artworks.html
let currentCategoryFilter = 'All';

function initGalleryPage() {
  const galleryGrid = document.getElementById('galleryGrid');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const filterPills = document.querySelectorAll('.filter-pill');

  if (!galleryGrid) return;

  // Render function with filters
  function filterAndRender() {
    const artworks = getData('artworks', []);
    const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const sortBy = sortSelect ? sortSelect.value : 'default';

    // 1. Filter by Category
    let filtered = artworks;
    if (currentCategoryFilter !== 'All') {
      filtered = filtered.filter(a => a.category.toLowerCase() === currentCategoryFilter.toLowerCase());
    }

    // 2. Real-time Search by Name, Artist, or Category
    if (searchQuery) {
      filtered = filtered.filter(a =>
        a.name.toLowerCase().includes(searchQuery) ||
        a.artist.toLowerCase().includes(searchQuery) ||
        a.category.toLowerCase().includes(searchQuery)
      );
    }

    // 3. Sorting
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => (a.currentBid || a.price) - (b.currentBid || b.price));
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => (b.currentBid || b.price) - (a.currentBid || a.price));
    } else if (sortBy === 'name-asc') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => b.id - a.id);
    }

    // Render results or Empty state
    if (filtered.length === 0) {
      galleryGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">🎨</div>
          <h3>No artworks found</h3>
          <p>We couldn't find any artwork matching your current search or category filter.</p>
          <button class="btn btn-outline" onclick="resetGalleryFilters()">Clear Filters</button>
        </div>
      `;
    } else {
      galleryGrid.innerHTML = filtered.map(createArtworkCardHTML).join('');
    }

    // Update count display if present
    const countBadge = document.getElementById('artworksCount');
    if (countBadge) {
      countBadge.textContent = `${filtered.length} Artworks`;
    }
  }

  // Category Pill Click Handlers
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategoryFilter = pill.getAttribute('data-category') || 'All';
      filterAndRender();
    });
  });

  // Search Input Handler (Real-time debounced)
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      filterAndRender();
    });
  }

  // Sort Select Handler
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      filterAndRender();
    });
  }

  // Check URL query parameters for pre-selected category
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');
  if (categoryParam) {
    currentCategoryFilter = categoryParam;
    filterPills.forEach(pill => {
      if (pill.getAttribute('data-category')?.toLowerCase() === categoryParam.toLowerCase()) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
  }

  filterAndRender();
}

function resetGalleryFilters() {
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const filterPills = document.querySelectorAll('.filter-pill');

  if (searchInput) searchInput.value = '';
  if (sortSelect) sortSelect.value = 'default';
  currentCategoryFilter = 'All';

  filterPills.forEach(p => {
    if (p.getAttribute('data-category') === 'All') p.classList.add('active');
    else p.classList.remove('active');
  });

  initGalleryPage();
}

// Render Artwork Details on artwork-details.html
function initArtworkDetailsPage() {
  const detailsContainer = document.getElementById('artworkDetailsContainer');
  if (!detailsContainer) return;

  const urlParams = new URLSearchParams(window.location.search);
  const artworkId = Number(urlParams.get('id')) || 1;

  const artworks = getData('artworks', []);
  const art = artworks.find(a => a.id === artworkId);

  if (!art) {
    detailsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <h3>Artwork Not Found</h3>
        <p>The requested artwork does not exist or may have been removed.</p>
        <a href="artworks.html" class="btn btn-primary">Browse Gallery</a>
      </div>
    `;
    return;
  }

  // Calculate Average Rating
  const reviews = getData('reviews', []).filter(r => r.artworkId === art.id);
  let avgRating = 5;
  if (reviews.length > 0) {
    const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 5), 0);
    avgRating = (sum / reviews.length).toFixed(1);
  }

  const isFav = isArtworkFavorited(art.id);
  const typeBadgeClass = art.type === 'Auction' ? 'badge-auction' : 'badge-sale';

  // Render Detailed View
  detailsContainer.innerHTML = `
    <div class="artwork-details-grid">
      <div class="details-image-box">
        <img src="${art.image}" alt="${art.name}" onerror="this.src='images/artworks/artwork-1.svg'">
      </div>

      <div class="details-info">
        <div class="artwork-meta-row" style="margin-bottom: 12px;">
          <span class="badge ${typeBadgeClass}">${art.type}</span>
          <span class="badge badge-category">${art.category}</span>
        </div>

        <h1>${art.name}</h1>
        <div class="details-artist-line">
          Created by <a href="artist-profile.html?artist=${encodeURIComponent(art.artist)}">${art.artist}</a>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 18px;">
          <div class="star-rating">★ ${avgRating}</div>
          <span style="color: var(--text-muted); font-size: 0.9rem;">(${reviews.length} reviews)</span>
        </div>

        <p style="color: var(--text-muted); font-size: 1.05rem; line-height: 1.7; margin-bottom: 24px;">
          ${art.description}
        </p>

        <!-- Pricing & Action Box -->
        <div class="details-price-box">
          ${art.type === 'Auction' ? `
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 16px;">
              <div>
                <div class="artwork-price-label">Current Highest Bid</div>
                <div class="artwork-price-val" style="color: var(--accent); font-size: 2rem;">
                  ${formatCurrency(art.currentBid || art.price)}
                </div>
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">
                  Highest Bidder: <strong>${art.currentBidder || 'None yet'}</strong>
                </div>
              </div>
              <div style="text-align: right;">
                <div class="artwork-price-label">Starting Price</div>
                <div style="font-weight: 700; color: var(--text-main);">${formatCurrency(art.startingPrice || art.price)}</div>
              </div>
            </div>

            <!-- Bid Input Form -->
            <form id="bidForm" onsubmit="handlePlaceBid(event, ${art.id})" style="display: flex; gap: 10px;">
              <input type="number" id="bidAmountInput" class="form-control" 
                placeholder="Min ${formatCurrency((art.currentBid || art.price) + 500)}" 
                min="${(art.currentBid || art.price) + 1}" required>
              <button type="submit" class="btn btn-accent">Place Bid</button>
            </form>
          ` : `
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div class="artwork-price-label">Purchase Price</div>
                <div class="artwork-price-val" style="color: var(--success); font-size: 2rem;">
                  ${formatCurrency(art.price)}
                </div>
              </div>
              <button onclick="openBuyModal(${art.id})" class="btn btn-lg btn-accent">
                Buy Now
              </button>
            </div>
          `}
        </div>

        <div class="details-actions-row">
          <button class="btn btn-outline ${isFav ? 'active' : ''}" id="detailsFavBtn" onclick="toggleDetailsFavorite(${art.id})">
            ${isFav ? '♥ In Favorites' : '♡ Add to Favorites'}
          </button>
          <a href="artist-profile.html?artist=${encodeURIComponent(art.artist)}" class="btn btn-outline">
            View Artist Profile
          </a>
        </div>
      </div>
    </div>
  `;

  // Render Reviews for this artwork
  renderArtworkReviews(art.id);
}

function toggleDetailsFavorite(artId) {
  const btn = document.getElementById('detailsFavBtn');
  toggleFavorite(artId, null);
  const isFav = isArtworkFavorited(artId);
  if (btn) {
    btn.innerHTML = isFav ? '♥ In Favorites' : '♡ Add to Favorites';
    if (isFav) btn.classList.add('active');
    else btn.classList.remove('active');
  }
}

// Buy Modal Implementation
function openBuyModal(artId) {
  const user = getCurrentUser();
  if (!user) {
    showToast('Please login to purchase artwork', 'warning');
    setTimeout(() => { window.location.href = 'login.html'; }, 1000);
    return;
  }

  const artworks = getData('artworks', []);
  const art = artworks.find(a => a.id === artId);
  if (!art) return;

  let modalOverlay = document.getElementById('buyModalOverlay');
  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.id = 'buyModalOverlay';
    modalOverlay.className = 'modal-overlay';
    document.body.appendChild(modalOverlay);
  }

  modalOverlay.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3 style="font-size: 1.3rem; font-weight: 800;">Confirm Artwork Purchase</h3>
        <button class="modal-close-btn" onclick="closeBuyModal()">&times;</button>
      </div>
      <div style="display: flex; gap: 18px; margin-bottom: 20px;">
        <img src="${art.image}" style="width: 100px; height: 100px; border-radius: 8px; object-fit: cover;" onerror="this.src='images/artworks/artwork-1.svg'">
        <div>
          <h4 style="font-size: 1.15rem; font-weight: 700;">${art.name}</h4>
          <p style="color: var(--text-muted); font-size: 0.9rem;">by ${art.artist}</p>
          <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 4px;">Category: ${art.category}</p>
        </div>
      </div>
      <div style="background-color: var(--surface-alt); padding: 16px; border-radius: 8px; margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span>Artwork Price:</span>
          <strong>${formatCurrency(art.price)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: var(--text-muted);">
          <span>Gallery Delivery &amp; Insurance:</span>
          <strong style="color: var(--success);">FREE</strong>
        </div>
        <div style="border-top: 1px solid var(--border); padding-top: 8px; display: flex; justify-content: space-between; font-size: 1.1rem; font-weight: 800;">
          <span>Total Payable:</span>
          <span style="color: var(--primary);">${formatCurrency(art.price)}</span>
        </div>
      </div>
      <div style="display: flex; gap: 12px;">
        <button class="btn btn-outline btn-block" onclick="closeBuyModal()">Cancel</button>
        <button class="btn btn-accent btn-block" onclick="confirmPurchase(${art.id})">Yes, Purchase</button>
      </div>
    </div>
  `;

  modalOverlay.classList.add('active');
}

function closeBuyModal() {
  const modalOverlay = document.getElementById('buyModalOverlay');
  if (modalOverlay) modalOverlay.classList.remove('active');
}

// Confirm Purchase and Store in Local Storage
function confirmPurchase(artId) {
  const user = getCurrentUser();
  if (!user) return;

  const artworks = getData('artworks', []);
  const art = artworks.find(a => a.id === artId);
  if (!art) return;

  const purchases = getData('purchases', []);
  const newPurchase = {
    id: getNextId(purchases),
    userId: user.id,
    userName: user.name,
    artworkId: art.id,
    artworkName: art.name,
    artist: art.artist,
    price: art.price,
    date: new Date().toISOString().slice(0, 10),
    image: art.image,
    status: 'Completed',
    paymentMethod: 'Online Payment (Simulated)'
  };

  purchases.push(newPurchase);
  setData('purchases', purchases);

  closeBuyModal();
  showToast('Purchase successful! Added to your collection.', 'success');

  setTimeout(() => {
    window.location.href = 'purchases.html';
  }, 1200);
}

// Handle Auction Bidding on details page
function handlePlaceBid(event, artId) {
  event.preventDefault();
  const user = getCurrentUser();
  if (!user) {
    showToast('Please login to place bids', 'warning');
    setTimeout(() => { window.location.href = 'login.html'; }, 1000);
    return;
  }

  const bidInput = document.getElementById('bidAmountInput');
  if (!bidInput) return;

  const newBid = Number(bidInput.value);
  const artworks = getData('artworks', []);
  const art = artworks.find(a => a.id === artId);

  if (!art) return;

  const currentHighest = Number(art.currentBid || art.price);

  if (!newBid || isNaN(newBid) || newBid <= currentHighest) {
    showToast(`Your bid must be higher than current bid ${formatCurrency(currentHighest)}.`, 'error');
    return;
  }

  // Update Artwork
  art.currentBid = newBid;
  art.currentBidder = user.name;
  art.bidsCount = (art.bidsCount || 0) + 1;
  setData('artworks', artworks);

  // Record Bid in bids array
  const bids = getData('bids', []);
  const newBidRecord = {
    id: getNextId(bids),
    artworkId: art.id,
    artworkName: art.name,
    userId: user.id,
    userName: user.name,
    bidAmount: newBid,
    date: new Date().toLocaleString(),
    status: 'Leading'
  };
  bids.push(newBidRecord);
  setData('bids', bids);

  showToast('Bid placed successfully! You are the highest bidder.', 'success');
  initArtworkDetailsPage();
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initFeaturedArtworks();
  initGalleryPage();
  initArtworkDetailsPage();
});
