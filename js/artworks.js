/**
 * artworks.js - Artwork Gallery, Categories, Search, Filter, Details, Cart & Favorites
 * ZENITH Fine Art Gallery & Auction House
 * Pure Vanilla JavaScript & LocalStorage
 */

const FALLBACK_PAINTING_IMAGE = 'assets/images/floral-classical-still-life.jpg';

// Check if artwork is favorited by current user
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
    showToast('Please sign in to save favorite artworks.', 'warning');
    setTimeout(() => { window.location.href = 'login.html'; }, 900);
    return;
  }

  const favorites = getData('favorites', {});
  if (!favorites[user.id]) {
    favorites[user.id] = [];
  }

  const artIdNum = Number(artworkId);
  const index = favorites[user.id].indexOf(artIdNum);

  if (index > -1) {
    favorites[user.id].splice(index, 1);
    setData('favorites', favorites);
    if (btnElement) {
      btnElement.classList.remove('active');
      btnElement.innerHTML = '♡';
    }
    showToast('Removed from saved favorites', 'info');
  } else {
    favorites[user.id].push(artIdNum);
    setData('favorites', favorites);
    if (btnElement) {
      btnElement.classList.add('active');
      btnElement.innerHTML = '♥';
    }
    showToast('Added to your saved favorites!', 'success');
  }

  if (typeof renderFavoritesPage === 'function') {
    renderFavoritesPage();
  }
}

// Render Category Showcase Grid on Homepage
function initHomeCategories() {
  const container = document.getElementById('homeCategoriesGrid');
  if (!container) return;

  const categories = getData('categories', []);
  const artworks = getData('artworks', []);

  container.innerHTML = categories.map(cat => {
    const count = artworks.filter(a => String(a.category).toLowerCase() === String(cat.name).toLowerCase()).length;
    return `
      <a href="artworks.html?category=${encodeURIComponent(cat.name)}" class="category-card">
        <div class="category-icon-box">${cat.icon || '🎨'}</div>
        <h3>${cat.name}</h3>
        <p>${cat.description}</p>
        <span style="font-size: 0.74rem; color: var(--gold-primary); font-weight: 700; margin-top: auto;">${count} Artworks</span>
      </a>
    `;
  }).join('');
}

// Render a single Artwork Card HTML
function createArtworkCardHTML(art) {
  const isFav = isArtworkFavorited(art.id);
  const isAuction = art.type === 'Auction';
  let typeBadgeClass = 'badge-sale';
  let badgeLabel = 'Available';
  let priceDisplay = art.price;
  let priceLabel = 'Price';

  if (isAuction) {
    const auctionStatus = art.auctionStatus || 'LIVE';
    if (auctionStatus === 'WINNER ANNOUNCED') {
      typeBadgeClass = 'badge-sale';
      badgeLabel = '🏆 Winner Announced';
      priceLabel = 'Winning Bid';
      priceDisplay = art.winningBid || art.currentBid || art.price;
    } else if (auctionStatus === 'CLOSED') {
      typeBadgeClass = 'badge-category';
      badgeLabel = 'Auction Closed';
      priceLabel = 'Final Bid';
      priceDisplay = art.currentBid || art.price;
    } else {
      typeBadgeClass = 'badge-auction';
      badgeLabel = 'Live Auction';
      priceLabel = 'Current Bid';
      priceDisplay = art.currentBid || art.startingPrice || art.price;
    }
  }

  const actionButtonHTML = isAuction
    ? `<a href="artwork-details.html?id=${art.id}" class="btn btn-sm btn-gold">Bid Now</a>`
    : `<button type="button" onclick="addToCart(${art.id}, false)" class="btn btn-sm btn-outline-gold" title="Add to Cart">+ Cart</button>
       <a href="artwork-details.html?id=${art.id}" class="btn btn-sm btn-outline">Details</a>`;

  return `
    <article class="artwork-card" data-id="${art.id}" data-category="${art.category}">
      <div class="artwork-image-wrap">
        <a href="artwork-details.html?id=${art.id}" style="display: block; width: 100%; height: 100%;">
          <img src="${art.image}" alt="${art.altText || art.name}" loading="lazy" onerror="this.src='${FALLBACK_PAINTING_IMAGE}'">
        </a>
        <span class="badge ${typeBadgeClass} artwork-badge-floating">${badgeLabel}</span>
        <button type="button" class="btn-fav-floating ${isFav ? 'active' : ''}" onclick="toggleFavorite(${art.id}, this)" title="${isFav ? 'Remove Favorite' : 'Add to Favorites'}" aria-label="Toggle Favorite">
          ${isFav ? '♥' : '♡'}
        </button>
      </div>
      <div class="artwork-body">
        <div class="artwork-meta-row">
          <span class="artwork-category">${art.category}</span>
          <span style="font-size: 0.76rem; color: var(--text-muted);">${art.medium || 'Fine Painting'}</span>
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
          <div class="artwork-card-actions">
            ${actionButtonHTML}
          </div>
        </div>
      </div>
    </article>
  `;
}

// Render Featured Artworks on Homepage
function initFeaturedArtworks() {
  const container = document.getElementById('featuredArtworksGrid');
  if (!container) return;

  const artworks = getData('artworks', []);
  const featured = artworks.filter(a => a.featured).slice(0, 6);
  const displayList = featured.length > 0 ? featured : artworks.slice(0, 6);

  if (displayList.length === 0) {
    container.innerHTML = '<p class="text-muted">No featured artworks available right now.</p>';
    return;
  }

  container.innerHTML = displayList.map(createArtworkCardHTML).join('');
}

// Render Gallery with Search, Filtering, and Sorting on artworks.html
let currentCategoryFilter = 'All';

function initGalleryPage() {
  const galleryGrid = document.getElementById('galleryGrid');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const typeSelect = document.getElementById('typeFilterSelect');
  const pillsContainer = document.getElementById('galleryCategoryPills');

  if (!galleryGrid) return;

  // Populate category filter pills dynamically from storage
  if (pillsContainer) {
    const categories = getData('categories', []);
    pillsContainer.innerHTML = `<button type="button" class="filter-pill active" data-category="All">All Categories</button>` +
      categories.map(c => `<button type="button" class="filter-pill" data-category="${c.name}">${c.name}</button>`).join('');
  }

  const filterPills = document.querySelectorAll('.filter-pill');

  function filterAndRender() {
    const artworks = getData('artworks', []);
    const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const sortBy = sortSelect ? sortSelect.value : 'default';
    const typeFilter = typeSelect ? typeSelect.value : 'All';

    let filtered = artworks.slice();

    if (currentCategoryFilter !== 'All') {
      filtered = filtered.filter(a => String(a.category).toLowerCase() === currentCategoryFilter.toLowerCase());
    }

    if (typeFilter !== 'All') {
      filtered = filtered.filter(a => String(a.type) === typeFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(a =>
        (a.name || '').toLowerCase().includes(searchQuery) ||
        (a.artist || '').toLowerCase().includes(searchQuery) ||
        (a.category || '').toLowerCase().includes(searchQuery) ||
        (a.medium || '').toLowerCase().includes(searchQuery)
      );
    }

    if (sortBy === 'price-low') {
      filtered.sort((a, b) => Number(a.currentBid || a.price) - Number(b.currentBid || b.price));
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => Number(b.currentBid || b.price) - Number(a.currentBid || a.price));
    } else if (sortBy === 'name-asc') {
      filtered.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => Number(b.id) - Number(a.id));
    }

    if (filtered.length === 0) {
      galleryGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">🎨</div>
          <h3>No Artworks Found</h3>
          <p>No paintings match your active search or category criteria.</p>
          <button type="button" class="btn btn-outline-gold" onclick="resetGalleryFilters()">Clear Filters</button>
        </div>
      `;
    } else {
      galleryGrid.innerHTML = filtered.map(createArtworkCardHTML).join('');
    }

    const countBadge = document.getElementById('artworksCount');
    if (countBadge) {
      countBadge.textContent = `${filtered.length} Artworks`;
    }
  }

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategoryFilter = pill.getAttribute('data-category') || 'All';
      filterAndRender();
    });
  });

  if (searchInput && !searchInput.dataset.bound) {
    searchInput.dataset.bound = 'true';
    searchInput.addEventListener('input', filterAndRender);
  }

  if (sortSelect && !sortSelect.dataset.bound) {
    sortSelect.dataset.bound = 'true';
    sortSelect.addEventListener('change', filterAndRender);
  }

  if (typeSelect && !typeSelect.dataset.bound) {
    typeSelect.dataset.bound = 'true';
    typeSelect.addEventListener('change', filterAndRender);
  }

  // Apply URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');
  if (categoryParam) {
    currentCategoryFilter = categoryParam;
    filterPills.forEach(pill => {
      pill.classList.toggle('active', pill.getAttribute('data-category')?.toLowerCase() === categoryParam.toLowerCase());
    });
  }

  const artistParam = urlParams.get('artist');
  if (artistParam && searchInput) {
    searchInput.value = artistParam;
  }

  filterAndRender();
}

function resetGalleryFilters() {
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const typeSelect = document.getElementById('typeFilterSelect');

  if (searchInput) searchInput.value = '';
  if (sortSelect) sortSelect.value = 'default';
  if (typeSelect) typeSelect.value = 'All';
  currentCategoryFilter = 'All';

  initGalleryPage();
}

// Live countdown formatter for details page
function formatCountdownText(endTimeStr) {
  if (!endTimeStr) return 'Live Salon';
  const diff = new Date(endTimeStr).getTime() - Date.now();
  if (isNaN(diff) || diff <= 0) return 'Bidding Closing';
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return `${days}d : ${String(hours).padStart(2, '0')}h : ${String(minutes).padStart(2, '0')}m : ${String(seconds).padStart(2, '0')}s`;
}

// Render Artwork Details on artwork-details.html
let detailsTimerInterval = null;

function initArtworkDetailsPage() {
  const detailsContainer = document.getElementById('artworkDetailsContainer');
  if (!detailsContainer) return;

  const urlParams = new URLSearchParams(window.location.search);
  const artworkId = Number(urlParams.get('id')) || 1;

  const artworks = getData('artworks', []);
  const art = artworks.find(a => Number(a.id) === artworkId);

  if (!art) {
    detailsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <h3>Artwork Not Found</h3>
        <p>The requested painting could not be found in our active catalog.</p>
        <a href="artworks.html" class="btn btn-gold">Browse Collection</a>
      </div>
    `;
    return;
  }

  const reviews = getData('reviews', []).filter(r => Number(r.artworkId) === Number(art.id));
  let avgRating = '5.0';
  if (reviews.length > 0) {
    const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 5), 0);
    avgRating = (sum / reviews.length).toFixed(1);
  }

  const isFav = isArtworkFavorited(art.id);
  const isAuction = art.type === 'Auction';
  const auctionStatus = art.auctionStatus || 'LIVE';
  const artworkBids = isAuction ? getData('bids', []).filter(b => Number(b.artworkId) === Number(art.id)) : [];
  const currentHighest = Number(art.currentBid || art.startingPrice || art.price);
  const currentUser = getCurrentUser();
  const currentRole = getNormalizedRole(currentUser);

  let typeBadgeClass = 'badge-sale';
  let typeBadgeText = 'Available';
  if (isAuction) {
    if (auctionStatus === 'WINNER ANNOUNCED') {
      typeBadgeClass = 'badge-sale';
      typeBadgeText = '🏆 Winner Announced';
    } else if (auctionStatus === 'CLOSED') {
      typeBadgeClass = 'badge-category';
      typeBadgeText = 'Auction Closed';
    } else {
      typeBadgeClass = 'badge-auction';
      typeBadgeText = 'Live Auction';
    }
  }

  let actionBoxHTML = '';
  if (isAuction) {
    if (auctionStatus === 'WINNER ANNOUNCED') {
      actionBoxHTML = `
        <div style="border-bottom: 1px solid var(--border); padding-bottom: 12px; margin-bottom: 14px; display: flex; justify-content: space-between; align-items: center;">
          <span style="color: var(--gold-primary); font-weight: 700;">🏆 AUCTION RESULT</span>
          <span class="badge badge-sale">Winner Announced</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 14px;">
          <div>
            <div class="artwork-price-label">Winning Bid</div>
            <div style="color: var(--gold-primary); font-size: 1.9rem; font-weight: 800;">${formatCurrency(art.winningBid || art.currentBid)}</div>
          </div>
          <div>
            <div class="artwork-price-label">Declared Winner</div>
            <div style="color: #ffffff; font-size: 1.3rem; font-weight: 700;">${art.winnerName || 'Winner Announced'}</div>
          </div>
        </div>
        <div style="padding: 12px; background: var(--surface-alt); border-radius: var(--radius-sm); color: var(--text-muted); font-size: 0.9rem; text-align: center; border: 1px dashed var(--border);">
          🔒 This auction has concluded and the winning collector has been declared.
        </div>
        ${currentRole === 'admin' ? `
          <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
            <button type="button" onclick="openArtworkBidHistoryModal(${art.id})" class="btn btn-sm btn-outline">View Bids (${artworkBids.length})</button>
            <a href="admin-dashboard.html" class="btn btn-sm btn-gold">Admin Panel</a>
          </div>
        ` : ''}
      `;
    } else if (auctionStatus === 'CLOSED') {
      actionBoxHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <strong style="color: var(--danger); font-size: 1.1rem;">⏱ Auction Closed</strong>
          <span class="badge badge-closed">CLOSED</span>
        </div>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 14px;">
          Bidding has closed. Awaiting official winner declaration.
        </p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: var(--surface-alt); padding: 12px 16px; border-radius: var(--radius-sm); border: 1px solid var(--border);">
          <div>
            <div class="artwork-price-label">Highest Bid</div>
            <div style="color: var(--gold-primary); font-size: 1.45rem; font-weight: 700;">${formatCurrency(currentHighest)}</div>
          </div>
          <div>
            <div class="artwork-price-label">Top Bidder</div>
            <div style="color: #ffffff; font-weight: 700;">${art.currentBidder || 'None yet'}</div>
          </div>
        </div>
        ${currentRole === 'admin' ? `
          <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
            <button type="button" onclick="openArtworkBidHistoryModal(${art.id})" class="btn btn-sm btn-outline">View Bids (${artworkBids.length})</button>
            <button type="button" onclick="openArtworkAnnounceWinnerModal(${art.id})" class="btn btn-sm btn-gold">🏆 Announce Winner</button>
          </div>
        ` : ''}
      `;
    } else {
      let roleBiddingActionHTML = '';
      if (currentRole === 'artist') {
        roleBiddingActionHTML = `
          <div style="background: var(--surface-alt); border: 1px dashed var(--border); border-radius: var(--radius-sm); padding: 14px; margin-top: 14px; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
            Artists cannot place bids in live auctions.
          </div>
        `;
      } else if (currentRole === 'admin') {
        roleBiddingActionHTML = `
          <div style="background: var(--surface-alt); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px; margin-top: 14px;">
            <div style="font-size: 0.82rem; color: var(--gold-primary); font-weight: 700; text-transform: uppercase; margin-bottom: 10px;">Administrator Auction Controls</div>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <button type="button" onclick="openArtworkBidHistoryModal(${art.id})" class="btn btn-sm btn-outline">View Bids (${artworkBids.length})</button>
              <button type="button" onclick="confirmCloseAuctionFromDetails(${art.id})" class="btn btn-sm btn-danger">Close Auction</button>
              <a href="admin-dashboard.html" class="btn btn-sm btn-gold">Admin Panel</a>
            </div>
          </div>
        `;
      } else {
        roleBiddingActionHTML = `
          <form id="bidForm" onsubmit="handlePlaceBid(event, ${art.id})" style="display: flex; gap: 10px; margin-top: 16px;">
            <input type="number" id="bidAmountInput" class="form-control" placeholder="Min ${formatCurrency(currentHighest + 1)}" min="${currentHighest + 1}" required>
            <button type="submit" class="btn btn-gold">Place Bid</button>
          </form>
        `;
      }

      actionBoxHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; background: var(--surface-alt); padding: 10px 14px; border-radius: var(--radius-sm); margin-bottom: 14px; border: 1px solid var(--border);">
          <span style="font-size: 0.78rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em;">Time Remaining</span>
          <strong id="detailsAuctionCountdown" style="color: var(--gold-primary); font-size: 0.95rem;">${formatCountdownText(art.endTime)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; flex-wrap: wrap;">
          <div>
            <div class="artwork-price-label">Current Highest Bid</div>
            <div class="artwork-price-val" style="color: var(--gold-primary); font-size: 2rem;">${formatCurrency(currentHighest)}</div>
            <div style="font-size: 0.84rem; color: var(--text-muted); margin-top: 4px;">
              Leader: <strong style="color: #ffffff;">${art.currentBidder || 'None yet'}</strong> • ${artworkBids.length} Bids
            </div>
          </div>
          <div style="text-align: right;">
            <div class="artwork-price-label">Starting Bid</div>
            <div style="font-weight: 700; color: #ffffff;">${formatCurrency(art.startingPrice || art.price)}</div>
          </div>
        </div>
        ${roleBiddingActionHTML}
      `;
    }
  } else {
    actionBoxHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; gap: 14px; flex-wrap: wrap;">
        <div>
          <div class="artwork-price-label">Listed Acquisition Value</div>
          <div class="artwork-price-val" style="color: var(--gold-primary); font-size: 2rem;">${formatCurrency(art.price)}</div>
        </div>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button type="button" onclick="addToCart(${art.id}, false)" class="btn btn-outline-gold">Add to Cart</button>
          <button type="button" onclick="openBuyModal(${art.id})" class="btn btn-gold">Buy Now</button>
        </div>
      </div>
    `;
  }

  const breadcrumbTitle = document.getElementById('breadcrumbTitle');
  if (breadcrumbTitle) breadcrumbTitle.textContent = art.name;

  detailsContainer.innerHTML = `
    <div class="artwork-details-grid">
      <div class="details-image-box">
        <img src="${art.image}" alt="${art.altText || art.name}" onerror="this.src='${FALLBACK_PAINTING_IMAGE}'">
      </div>

      <div class="details-info">
        <div class="artwork-meta-row" style="justify-content: flex-start; gap: 10px; margin-bottom: 12px;">
          <span class="badge ${typeBadgeClass}">${typeBadgeText}</span>
          <span class="badge badge-category">${art.category}</span>
        </div>

        <h1>${art.name}</h1>
        <div class="details-artist-line">
          Created by <a href="artist-profile.html?artist=${encodeURIComponent(art.artist)}">${art.artist}</a>
        </div>

        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 18px;">
          <span class="star-rating">★ ${avgRating}</span>
          <span style="color: var(--text-muted); font-size: 0.9rem;">(${reviews.length} collector critiques)</span>
        </div>

        <p style="color: var(--text-muted); font-size: 1rem; line-height: 1.75; margin-bottom: 18px;">
          ${art.description}
        </p>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; background: var(--surface-alt); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 12px 14px; font-size: 0.82rem;">
          <div>
            <div style="color: var(--text-muted);">Medium</div>
            <strong style="color: #ffffff;">${art.medium || 'Fine Painting'}</strong>
          </div>
          <div>
            <div style="color: var(--text-muted);">Dimensions</div>
            <strong style="color: #ffffff;">${art.dimensions || '24 x 36 in'}</strong>
          </div>
          <div>
            <div style="color: var(--text-muted);">Provenance</div>
            <strong style="color: var(--success);">Certified Original</strong>
          </div>
        </div>

        <div class="details-price-box">
          ${actionBoxHTML}
        </div>

        <div class="details-actions-row">
          <button type="button" class="btn btn-outline ${isFav ? 'active' : ''}" id="detailsFavBtn" onclick="toggleDetailsFavorite(${art.id})">
            ${isFav ? '♥ Saved in Favorites' : '♡ Add to Favorites'}
          </button>
          <a href="artist-profile.html?artist=${encodeURIComponent(art.artist)}" class="btn btn-outline">
            View Artist Portfolio
          </a>
        </div>
      </div>
    </div>

    ${isAuction ? `
      <div style="background: var(--surface-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 30px; margin-top: 32px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; flex-wrap: wrap; gap: 10px;">
          <div>
            <h2 style="font-size: 1.5rem; color: #ffffff;">Artwork Bidding History</h2>
            <p style="color: var(--text-muted); font-size: 0.88rem;">Verified audit log (${artworkBids.length} total bids)</p>
          </div>
          <span class="badge ${auctionStatus === 'WINNER ANNOUNCED' ? 'badge-sale' : (auctionStatus === 'CLOSED' ? 'badge-closed' : 'badge-auction')}">${auctionStatus}</span>
        </div>

        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Bid Ref</th>
                <th>Bidder</th>
                <th>Amount</th>
                <th>Timestamp</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${artworkBids.length === 0 ? `
                <tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 24px;">No bids placed yet. Be the first collector to bid!</td></tr>
              ` : artworkBids.slice().reverse().map(b => {
                const isTop = Number(b.bidAmount) === Number(art.currentBid);
                const isWinner = auctionStatus === 'WINNER ANNOUNCED' && (b.userName === art.winnerName || b.userId === art.winnerUserId);
                const statusBadge = isWinner ? '<span class="badge badge-sale">🏆 Winner</span>' : (isTop ? '<span class="badge badge-auction">★ Leading Bid</span>' : '<span class="badge badge-category">Outbid</span>');
                return `
                  <tr>
                    <td><code>#BID-${b.id}</code></td>
                    <td><strong>${b.userName}</strong></td>
                    <td><strong style="color: var(--gold-primary);">${formatCurrency(b.bidAmount)}</strong></td>
                    <td>${b.date}</td>
                    <td>${statusBadge}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    ` : ''}
  `;

  if (detailsTimerInterval) clearInterval(detailsTimerInterval);
  if (isAuction && auctionStatus === 'LIVE') {
    detailsTimerInterval = setInterval(() => {
      const el = document.getElementById('detailsAuctionCountdown');
      if (el) el.textContent = formatCountdownText(art.endTime);
    }, 1000);
  }

  if (typeof renderArtworkReviews === 'function') {
    renderArtworkReviews(art.id);
  }
}

function toggleDetailsFavorite(artId) {
  const btn = document.getElementById('detailsFavBtn');
  toggleFavorite(artId, null);
  const isFav = isArtworkFavorited(artId);
  if (btn) {
    btn.innerHTML = isFav ? '♥ Saved in Favorites' : '♡ Add to Favorites';
    btn.classList.toggle('active', isFav);
  }
}

// Buy Modal Implementation
function openBuyModal(artId) {
  const user = getCurrentUser();
  if (!user) {
    showToast('Please sign in to acquire artwork.', 'warning');
    setTimeout(() => { window.location.href = 'login.html'; }, 900);
    return;
  }

  const artworks = getData('artworks', []);
  const art = artworks.find(a => Number(a.id) === Number(artId));
  if (!art) return;

  let modalOverlay = document.getElementById('buyModalOverlay');
  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.id = 'buyModalOverlay';
    modalOverlay.className = 'modal-overlay';
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeBuyModal();
    });
    document.body.appendChild(modalOverlay);
  }

  modalOverlay.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3>Confirm Artwork Acquisition</h3>
        <button type="button" class="modal-close-btn" onclick="closeBuyModal()">&times;</button>
      </div>
      <div style="display: flex; gap: 16px; margin-bottom: 20px; align-items: center;">
        <img src="${art.image}" alt="${art.name}" style="width: 96px; height: 96px; border-radius: 10px; object-fit: cover; border: 1px solid var(--border-gold);" onerror="this.src='${FALLBACK_PAINTING_IMAGE}'">
        <div>
          <h4 style="font-size: 1.2rem; color: #ffffff;">${art.name}</h4>
          <p style="color: var(--text-muted); font-size: 0.9rem;">by ${art.artist}</p>
          <span class="badge badge-category" style="margin-top: 6px;">${art.category}</span>
        </div>
      </div>
      <div style="background: var(--bg-black); border: 1px solid var(--border); padding: 16px; border-radius: var(--radius-sm); margin-bottom: 22px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9rem;">
          <span style="color: var(--text-muted);">Artwork Value:</span>
          <strong style="color: #ffffff;">${formatCurrency(art.price)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 0.9rem;">
          <span style="color: var(--text-muted);">Gallery Courier &amp; Insurance:</span>
          <strong style="color: var(--success);">Complimentary</strong>
        </div>
        <div style="border-top: 1px solid var(--border); padding-top: 10px; display: flex; justify-content: space-between; font-size: 1.15rem; font-weight: 700;">
          <span style="color: #ffffff;">Total Payable:</span>
          <span style="color: var(--gold-primary);">${formatCurrency(art.price)}</span>
        </div>
      </div>
      <div style="display: flex; gap: 12px;">
        <button type="button" class="btn btn-outline btn-block" onclick="closeBuyModal()">Cancel</button>
        <button type="button" class="btn btn-gold btn-block" onclick="confirmPurchase(${art.id})">Confirm Purchase</button>
      </div>
    </div>
  `;

  modalOverlay.classList.add('active');
}

function closeBuyModal() {
  const modalOverlay = document.getElementById('buyModalOverlay');
  if (modalOverlay) modalOverlay.classList.remove('active');
}

function confirmPurchase(artId) {
  const user = getCurrentUser();
  if (!user) return;

  const artworks = getData('artworks', []);
  const art = artworks.find(a => Number(a.id) === Number(artId));
  if (!art) return;

  const purchases = getData('purchases', []);
  purchases.push({
    id: getNextId(purchases),
    userId: user.id,
    userName: user.name,
    artworkId: art.id,
    artworkName: art.name,
    artist: art.artist,
    price: art.price,
    date: new Date().toISOString().slice(0, 10),
    image: art.image,
    status: 'Confirmed',
    paymentMethod: 'Online Card (Simulated)'
  });

  setData('purchases', purchases);
  closeBuyModal();
  showToast('Acquisition confirmed! Redirecting to your order ledger...', 'success');

  setTimeout(() => {
    window.location.href = 'purchases.html';
  }, 1000);
}

// Handle Auction Bidding on details page (Buyer/Collector Validation)
function handlePlaceBid(event, artId) {
  if (event && event.preventDefault) event.preventDefault();

  const user = getCurrentUser();
  if (!user) {
    showToast('Please sign in to place auction bids.', 'warning');
    setTimeout(() => { window.location.href = 'login.html'; }, 900);
    return;
  }

  const role = getNormalizedRole(user);
  if (role !== 'user') {
    showToast('Only registered Collectors can place auction bids.', 'error');
    return;
  }

  const artworks = getData('artworks', []);
  const art = artworks.find(a => Number(a.id) === Number(artId));
  if (!art) return;

  const auctionStatus = art.auctionStatus || 'LIVE';
  if (auctionStatus === 'CLOSED' || auctionStatus === 'WINNER ANNOUNCED') {
    showToast('This auction has closed. Bidding is locked.', 'error');
    return;
  }

  const bidInput = document.getElementById('bidAmountInput');
  if (!bidInput) return;

  const newBid = Number(bidInput.value);
  const currentHighest = Number(art.currentBid || art.startingPrice || art.price);

  if (!newBid || isNaN(newBid) || newBid <= currentHighest) {
    showToast(`Your bid must exceed ${formatCurrency(currentHighest)}.`, 'error');
    return;
  }

  const bids = getData('bids', []);
  bids.forEach(b => {
    if (Number(b.artworkId) === Number(art.id) && b.status === 'Leading') {
      b.status = 'Outbid';
    }
  });

  bids.push({
    id: getNextId(bids),
    artworkId: art.id,
    artworkName: art.name,
    userId: user.id,
    userEmail: user.email || '',
    userName: user.name,
    bidAmount: newBid,
    date: new Date().toLocaleString(),
    status: 'Leading'
  });
  setData('bids', bids);
  setData('auctionBids', bids);

  art.currentBid = newBid;
  art.currentBidder = user.name;
  art.currentBidderEmail = user.email || '';
  art.currentBidderId = user.id;
  art.bidsCount = (art.bidsCount || 0) + 1;
  setData('artworks', artworks);

  showToast(`Bid of ${formatCurrency(newBid)} placed! You are the leading bidder.`, 'success');
  initArtworkDetailsPage();
}

// ============================================================================
// Administrator Auction Modals & Actions from Artwork Details Page
// ============================================================================
function getArtworkDetailsModalOverlay() {
  let overlay = document.getElementById('artworkDetailsModalOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'artworkDetailsModalOverlay';
    overlay.className = 'modal-overlay';
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeArtworkDetailsModal();
    });
    document.body.appendChild(overlay);
  }
  return overlay;
}

function closeArtworkDetailsModal() {
  const overlay = document.getElementById('artworkDetailsModalOverlay');
  if (overlay) overlay.classList.remove('active');
}

function openArtworkBidHistoryModal(artId) {
  const user = getCurrentUser();
  if (getNormalizedRole(user) !== 'admin') {
    showToast('Unauthorized action. Administrator access required.', 'error');
    return;
  }

  const artworks = getData('artworks', []);
  const art = artworks.find(a => Number(a.id) === Number(artId));
  if (!art) return;

  const allBids = getData('bids', []).filter(b => Number(b.artworkId) === Number(art.id));
  const maxBidVal = allBids.length > 0 ? Math.max(...allBids.map(b => Number(b.bidAmount))) : 0;
  const status = art.auctionStatus || 'LIVE';

  const overlay = getArtworkDetailsModalOverlay();
  overlay.innerHTML = `
    <div class="modal-card modal-card-lg">
      <div class="modal-header">
        <div>
          <h3>Complete Bid History</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted);">${art.name} • by ${art.artist}</p>
        </div>
        <button type="button" class="modal-close-btn" onclick="closeArtworkDetailsModal()">&times;</button>
      </div>

      <div style="background: var(--bg-black); border: 1px solid var(--border); padding: 14px; border-radius: var(--radius-sm); margin-bottom: 18px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; font-size: 0.88rem;">
        <div>
          <div style="color: var(--text-muted); font-size: 0.76rem;">Starting Bid</div>
          <strong style="color: #ffffff;">${formatCurrency(art.startingPrice || art.price)}</strong>
        </div>
        <div>
          <div style="color: var(--text-muted); font-size: 0.76rem;">Current Highest Bid</div>
          <strong style="color: var(--gold-primary);">${formatCurrency(art.currentBid || art.price)}</strong>
        </div>
        <div>
          <div style="color: var(--text-muted); font-size: 0.76rem;">Status</div>
          <span class="badge ${status === 'WINNER ANNOUNCED' ? 'badge-sale' : (status === 'CLOSED' ? 'badge-closed' : 'badge-auction')}">${status}</span>
        </div>
      </div>

      <div class="table-container" style="max-height: 300px; overflow-y: auto;">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Bidder</th>
              <th>Email / ID</th>
              <th>Bid Amount</th>
              <th>Timestamp</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${allBids.length === 0 ? `
              <tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 20px;">No bids placed yet.</td></tr>
            ` : allBids.map(b => {
              const isHighest = Number(b.bidAmount) === maxBidVal;
              return `
                <tr>
                  <td><strong>${b.userName}</strong></td>
                  <td style="font-size: 0.82rem; color: var(--text-muted);">${b.userEmail || ('User #' + b.userId)}</td>
                  <td><strong style="color: var(--gold-primary);">${formatCurrency(b.bidAmount)}</strong></td>
                  <td style="font-size: 0.82rem;">${b.date}</td>
                  <td>${isHighest ? '<span class="badge badge-sale">★ Highest Bid</span>' : '<span class="badge badge-category">Outbid</span>'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div style="display: flex; justify-content: flex-end; margin-top: 18px;">
        <button type="button" onclick="closeArtworkDetailsModal()" class="btn btn-sm btn-outline">Close</button>
      </div>
    </div>
  `;
  overlay.classList.add('active');
}

function confirmCloseAuctionFromDetails(artId) {
  const user = getCurrentUser();
  if (getNormalizedRole(user) !== 'admin') {
    showToast('Unauthorized action. Administrator access required.', 'error');
    return;
  }

  if (!confirm('Close this auction? Bidding will be locked.')) return;

  const artworks = getData('artworks', []);
  const art = artworks.find(a => Number(a.id) === Number(artId));
  if (!art) return;

  const allBids = getData('bids', []).filter(b => Number(b.artworkId) === Number(art.id));
  if (allBids.length > 0) {
    const sorted = allBids.slice().sort((a, b) => Number(b.bidAmount) - Number(a.bidAmount));
    art.currentBid = Number(sorted[0].bidAmount);
    art.currentBidder = sorted[0].userName;
    art.currentBidderEmail = sorted[0].userEmail || '';
    art.currentBidderId = sorted[0].userId || null;
  }

  art.auctionStatus = 'CLOSED';
  setData('artworks', artworks);

  showToast('Auction closed successfully.', 'success');
  initArtworkDetailsPage();
}

function openArtworkAnnounceWinnerModal(artId) {
  const user = getCurrentUser();
  if (getNormalizedRole(user) !== 'admin') {
    showToast('Unauthorized action. Administrator access required.', 'error');
    return;
  }

  const artworks = getData('artworks', []);
  const art = artworks.find(a => Number(a.id) === Number(artId));
  if (!art) return;

  const allBids = getData('bids', []).filter(b => Number(b.artworkId) === Number(art.id));
  if (allBids.length === 0) {
    showToast('Cannot announce winner because no bids were received.', 'error');
    return;
  }

  const sorted = allBids.slice().sort((a, b) => Number(b.bidAmount) - Number(a.bidAmount));
  const topBid = sorted[0];
  const winnerName = topBid.userName || art.currentBidder;
  const winnerEmail = topBid.userEmail || art.currentBidderEmail || '';
  const winningBid = Number(topBid.bidAmount || art.currentBid);

  const overlay = getArtworkDetailsModalOverlay();
  overlay.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3 style="color: var(--gold-primary);">🏆 Announce Official Winner</h3>
        <button type="button" class="modal-close-btn" onclick="closeArtworkDetailsModal()">&times;</button>
      </div>
      <div style="background: var(--bg-black); border: 1px solid var(--border); padding: 18px; border-radius: var(--radius-sm); margin-bottom: 20px;">
        <div style="color: var(--text-muted); font-size: 0.78rem; text-transform: uppercase;">Artwork</div>
        <div style="font-size: 1.15rem; font-weight: 700; color: #ffffff; margin-bottom: 12px;">${art.name} by ${art.artist}</div>
        <div style="color: var(--text-muted); font-size: 0.78rem; text-transform: uppercase;">Declared Winner</div>
        <div style="font-size: 1.3rem; font-weight: 700; color: #ffffff;">${winnerName}</div>
        ${winnerEmail ? `<div style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px;">${winnerEmail}</div>` : ''}
        <div style="color: var(--text-muted); font-size: 0.78rem; text-transform: uppercase;">Winning Bid</div>
        <div style="font-size: 1.55rem; font-weight: 800; color: var(--gold-primary);">${formatCurrency(winningBid)}</div>
      </div>
      <div style="display: flex; gap: 10px;">
        <button type="button" onclick="closeArtworkDetailsModal()" class="btn btn-outline btn-block">Cancel</button>
        <button type="button" onclick="confirmAnnounceWinnerFromDetails(${art.id})" class="btn btn-gold btn-block">Confirm &amp; Publish</button>
      </div>
    </div>
  `;
  overlay.classList.add('active');
}

function confirmAnnounceWinnerFromDetails(artId) {
  const user = getCurrentUser();
  if (getNormalizedRole(user) !== 'admin') return;

  const artworks = getData('artworks', []);
  const art = artworks.find(a => Number(a.id) === Number(artId));
  if (!art) return;

  const allBids = getData('bids', []).filter(b => Number(b.artworkId) === Number(art.id));
  if (allBids.length === 0) return;

  const sorted = allBids.slice().sort((a, b) => Number(b.bidAmount) - Number(a.bidAmount));
  const topBid = sorted[0];
  const winnerName = topBid.userName || art.currentBidder;
  const winnerEmail = topBid.userEmail || art.currentBidderEmail || '';
  const winnerUserId = topBid.userId || null;
  const winningBid = Number(topBid.bidAmount || art.currentBid);
  const announcementTime = new Date().toLocaleString();

  const auctionResults = getData('auctionResults', []);
  const filteredResults = auctionResults.filter(r => Number(r.artworkId) !== Number(art.id));
  filteredResults.push({
    id: getNextId(auctionResults),
    artworkId: art.id,
    artworkName: art.name,
    artist: art.artist,
    winnerName,
    winnerEmail,
    winnerUserId,
    winningBid,
    startingPrice: Number(art.startingPrice || art.price),
    totalBids: allBids.length,
    announcedAt: announcementTime,
    status: 'Winner Announced'
  });
  setData('auctionResults', filteredResults);

  art.auctionStatus = 'WINNER ANNOUNCED';
  art.winnerName = winnerName;
  art.winnerEmail = winnerEmail;
  art.winnerUserId = winnerUserId;
  art.winningBid = winningBid;
  art.announcedAt = announcementTime;
  setData('artworks', artworks);

  closeArtworkDetailsModal();
  showToast(`Winner announced: ${winnerName} (${formatCurrency(winningBid)})`, 'success');
  initArtworkDetailsPage();
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initHomeCategories();
  initFeaturedArtworks();
  initGalleryPage();
  initArtworkDetailsPage();
});
