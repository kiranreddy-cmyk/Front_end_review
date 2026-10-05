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
  let typeBadgeClass = 'badge-sale';
  let badgeLabel = art.type;
  let priceDisplay = art.price;
  let priceLabel = 'Price';

  if (art.type === 'Auction') {
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
      badgeLabel = 'Auction';
      priceLabel = 'Current Bid';
      priceDisplay = art.currentBid || art.startingPrice || art.price;
    }
  }

  return `
    <div class="artwork-card" data-id="${art.id}" data-category="${art.category}">
      <div class="artwork-image-wrap">
        <img src="${art.image}" alt="${art.name}" loading="lazy" onerror="this.src='images/artworks/artwork-1.svg'">
        <span class="badge ${typeBadgeClass} artwork-badge-floating">${badgeLabel}</span>
        <button class="btn-fav-floating ${isFav ? 'active' : ''}" onclick="toggleFavorite(${art.id}, this)" title="${isFav ? 'Remove Favorite' : 'Add to Favorites'}">
          ${isFav ? '♥' : '♡'}
        </button>
      </div>
      <div class="artwork-body">
        <div class="artwork-meta-row">
          <span class="artwork-category">${art.category}</span>
          <span class="badge badge-category">${art.auctionStatus ? (art.auctionStatus === 'WINNER ANNOUNCED' ? 'Ended' : art.auctionStatus) : (art.status || 'Active')}</span>
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

  // Check URL query parameters for pre-selected category or artist
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

  const artistParam = urlParams.get('artist');
  if (artistParam && searchInput) {
    searchInput.value = artistParam;
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
  const isAuction = art.type === 'Auction';
  const auctionStatus = art.auctionStatus || 'LIVE';
  const artworkBids = isAuction ? getData('bids', []).filter(b => Number(b.artworkId) === Number(art.id)) : [];
  const currentHighest = Number(art.currentBid || art.startingPrice || art.price);
  const currentUser = getCurrentUser();
  const currentRole = getNormalizedRole(currentUser);

  let typeBadgeClass = 'badge-sale';
  let typeBadgeText = art.type;
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

  // Build Pricing / Auction Box HTML
  let actionBoxHTML = '';
  if (isAuction) {
    if (auctionStatus === 'WINNER ANNOUNCED') {
      actionBoxHTML = `
        <div class="auction-result-box" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(245, 158, 11, 0.1)); border: 2px solid var(--success); border-radius: 12px; padding: 22px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid rgba(16, 185, 129, 0.25); padding-bottom: 10px;">
            <span style="font-size: 1.25rem; font-weight: 850; color: #047857; display: flex; align-items: center; gap: 8px;">
              🏆 AUCTION RESULT
            </span>
            <span class="badge badge-sale" style="font-size: 0.82rem; padding: 6px 12px;">Winner Announced</span>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div>
              <div class="artwork-price-label" style="text-transform: uppercase; font-size: 0.8rem; color: var(--text-muted);">Winning Bid</div>
              <div style="color: var(--accent); font-size: 2.2rem; font-weight: 850;">
                ${formatCurrency(art.winningBid || art.currentBid)}
              </div>
            </div>
            <div>
              <div class="artwork-price-label" style="text-transform: uppercase; font-size: 0.8rem; color: var(--text-muted);">Winner</div>
              <div style="font-size: 1.6rem; font-weight: 850; color: var(--text-main); margin-top: 4px;">
                ${art.winnerName || 'Winner Announced'}
              </div>
            </div>
          </div>

          <div style="background: var(--surface); padding: 12px 14px; border-radius: 8px; border: 1px solid var(--border); font-size: 0.85rem; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
            <span>Artwork: <strong>${art.name}</strong></span>
            <span>Starting Price: <strong>${formatCurrency(art.startingPrice || art.price)}</strong></span>
            <span>Status: <strong style="color: var(--success);">Winner Announced</strong></span>
            ${art.announcedAt ? `<span>Announced: <strong>${art.announcedAt}</strong></span>` : ''}
          </div>
        </div>

        <div style="padding: 14px; background: var(--surface-alt); border-radius: 8px; color: var(--text-muted); font-size: 0.95rem; text-align: center; border: 1px dashed var(--border);">
          🔒 This auction has ended. The winner has been announced.
        </div>
        ${currentRole === 'admin' ? `
          <div style="margin-top: 14px; display: flex; gap: 10px; flex-wrap: wrap;">
            <button type="button" onclick="openArtworkBidHistoryModal(${art.id})" class="btn btn-sm btn-outline">View Bids (${artworkBids.length})</button>
            <a href="admin-dashboard.html" class="btn btn-sm btn-primary">Admin Control Center</a>
          </div>
        ` : ''}
      `;
    } else if (auctionStatus === 'CLOSED') {
      actionBoxHTML = `
        <div style="background: #fef3c7; border: 1.5px solid #f59e0b; border-radius: 12px; padding: 20px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <strong style="color: #92400e; font-size: 1.2rem; display: flex; align-items: center; gap: 8px;">
              ⏱ Auction Closed
            </strong>
            <span class="badge" style="background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; font-weight: 800;">CLOSED</span>
          </div>
          <p style="color: #78350f; font-size: 0.95rem; margin-bottom: 14px; line-height: 1.6;">
            This auction has been officially closed by the Administrator. Bidding is now locked while final results are being processed.
          </p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: rgba(255,255,255,0.7); padding: 12px 16px; border-radius: 8px;">
            <div>
              <div style="font-size: 0.8rem; color: #92400e;">Highest Bid Recorded</div>
              <div style="color: var(--accent); font-size: 1.6rem; font-weight: 800;">
                ${formatCurrency(currentHighest)}
              </div>
            </div>
            <div>
              <div style="font-size: 0.8rem; color: #92400e;">Top Bidder</div>
              <div style="font-size: 1.2rem; font-weight: 700; color: var(--text-main); margin-top: 4px;">
                ${art.currentBidder || 'None yet'}
              </div>
            </div>
          </div>
        </div>

        <div style="padding: 14px; background: var(--surface-alt); border-radius: 8px; color: var(--text-muted); font-size: 0.95rem; text-align: center; border: 1px dashed var(--border);">
          🔒 This auction is closed. Waiting for winner announcement.
        </div>
        ${currentRole === 'admin' ? `
          <div style="margin-top: 14px; background: var(--surface-alt); padding: 14px; border-radius: 8px; border: 1px solid var(--border);">
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px; font-weight: 600;">Administrator Actions:</div>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <button type="button" onclick="openArtworkBidHistoryModal(${art.id})" class="btn btn-sm btn-outline">View Bids (${artworkBids.length})</button>
              <button type="button" onclick="openArtworkAnnounceWinnerModal(${art.id})" class="btn btn-sm btn-accent">🏆 Announce Winner</button>
              <a href="admin-dashboard.html" class="btn btn-sm btn-primary">Admin Control Center</a>
            </div>
          </div>
        ` : ''}
      `;
    } else {
      // LIVE AUCTION - Render role-specific controls
      let roleBiddingActionHTML = '';
      if (currentRole === 'artist') {
        // Artist cannot participate in bidding
        roleBiddingActionHTML = `
          <div style="background-color: var(--surface-alt); border: 1.5px dashed var(--border); border-radius: 8px; padding: 16px; margin-top: 16px; text-align: center;">
            <div style="font-size: 1.25rem; margin-bottom: 4px;">🎨</div>
            <div style="color: var(--text-muted); font-size: 0.95rem; font-weight: 600;">
              Artists cannot participate in bidding.
            </div>
            <div style="color: var(--text-muted); font-size: 0.82rem; margin-top: 4px;">
              Artists can monitor their exhibited works and collector purchases from the Artist Dashboard.
            </div>
          </div>
        `;
      } else if (currentRole === 'admin') {
        // Admin manages auctions, cannot place bids
        roleBiddingActionHTML = `
          <div style="background-color: var(--surface-alt); border: 1px solid var(--border); border-radius: 8px; padding: 16px; margin-top: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Administrator Auction Controls</span>
              <span class="badge badge-auction">LIVE AUCTION</span>
            </div>
            <p style="font-size: 0.84rem; color: var(--text-muted); margin-bottom: 12px;">
              Administrators monitor live bids and declare winners, but do not participate in bidding.
            </p>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <button type="button" onclick="openArtworkBidHistoryModal(${art.id})" class="btn btn-sm btn-outline">View Bids (${artworkBids.length})</button>
              <button type="button" onclick="confirmCloseAuctionFromDetails(${art.id})" class="btn btn-sm btn-danger">Close Auction</button>
              <a href="admin-dashboard.html" class="btn btn-sm btn-primary">Admin Control Center</a>
            </div>
          </div>
        `;
      } else {
        // Buyer / User role (or guest prompting login)
        roleBiddingActionHTML = `
          <!-- Bid Input Form -->
          <form id="bidForm" onsubmit="handlePlaceBid(event, ${art.id})" style="display: flex; gap: 10px; margin-top: 16px;">
            <input type="number" id="bidAmountInput" class="form-control" 
              placeholder="Min ${formatCurrency(currentHighest + 1)}" 
              min="${currentHighest + 1}" required>
            <button type="submit" class="btn btn-accent">Place Bid</button>
          </form>
        `;
      }

      actionBoxHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 16px;">
          <div>
            <div class="artwork-price-label">Current Highest Bid</div>
            <div class="artwork-price-val" style="color: var(--accent); font-size: 2rem;">
              ${formatCurrency(currentHighest)}
            </div>
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">
              Highest Bidder: <strong>${art.currentBidder || 'None yet'}</strong> • Total Bids: <strong>${artworkBids.length}</strong>
            </div>
          </div>
          <div style="text-align: right;">
            <div class="artwork-price-label">Starting Price</div>
            <div style="font-weight: 700; color: var(--text-main);">${formatCurrency(art.startingPrice || art.price)}</div>
          </div>
        </div>
        ${roleBiddingActionHTML}
      `;
    }
  } else {
    // For Sale
    actionBoxHTML = `
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
    `;
  }

  // Update Breadcrumb if title element exists
  const breadcrumbTitle = document.getElementById('breadcrumbTitle');
  if (breadcrumbTitle) {
    breadcrumbTitle.textContent = art.name;
  }

  // Render Detailed View
  detailsContainer.innerHTML = `
    <div class="artwork-details-grid">
      <div class="details-image-box">
        <img src="${art.image}" alt="${art.name}" onerror="this.src='images/artworks/artwork-1.svg'">
      </div>

      <div class="details-info">
        <div class="artwork-meta-row" style="margin-bottom: 12px;">
          <span class="badge ${typeBadgeClass}">${typeBadgeText}</span>
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
          ${actionBoxHTML}
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

    ${isAuction ? `
      <!-- Complete Artwork Bidding History -->
      <div style="background-color: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 32px; box-shadow: var(--shadow-sm); margin-top: 36px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
          <div>
            <h2 style="font-size: 1.4rem; font-weight: 800;">Artwork Bidding History</h2>
            <p style="color: var(--text-muted); font-size: 0.9rem;">Audit trail of all bids placed on this artwork (${artworkBids.length} total bids).</p>
          </div>
          <div>
            <span class="badge ${auctionStatus === 'WINNER ANNOUNCED' ? 'badge-sale' : (auctionStatus === 'CLOSED' ? 'badge-category' : 'badge-auction')}">
              ${auctionStatus === 'WINNER ANNOUNCED' ? '🏆 Winner Announced' : (auctionStatus === 'CLOSED' ? 'Closed' : 'Live Bidding')}
            </span>
          </div>
        </div>

        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Bid Reference</th>
                <th>Bidder Name</th>
                <th>Bid Amount</th>
                <th>Date &amp; Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${artworkBids.length === 0 ? `
                <tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 24px;">No bids have been placed yet for this artwork. Be the first to place a bid!</td></tr>
              ` : artworkBids.slice().reverse().map(b => {
                const isTop = Number(b.bidAmount) === Number(art.currentBid);
                const isWinner = auctionStatus === 'WINNER ANNOUNCED' && (b.userName === art.winnerName || b.userId === art.winnerUserId);
                const rowHighlight = (isWinner || (isTop && auctionStatus === 'LIVE')) ? 'style="background-color: rgba(217, 119, 6, 0.08); font-weight: 700;"' : '';
                const statusBadge = isWinner ? '<span class="badge badge-sale">🏆 Winner</span>' : (isTop ? '<span class="badge badge-sale">★ Leading Bid</span>' : '<span class="badge badge-category">Outbid</span>');
                return `
                  <tr ${rowHighlight}>
                    <td>#BID-${b.id}</td>
                    <td><strong>${b.userName}</strong></td>
                    <td><strong style="color: var(--accent);">${formatCurrency(b.bidAmount)}</strong></td>
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

// Handle Auction Bidding on details page (Strict Buyer/User Validation)
function handlePlaceBid(event, artId) {
  if (event && event.preventDefault) event.preventDefault();

  // 1. A user must be logged in
  const user = getCurrentUser();
  if (!user) {
    showToast('Please login to place bids', 'warning');
    setTimeout(() => { window.location.href = 'login.html'; }, 1000);
    return;
  }

  // 2. The logged-in user's role must be Buyer/User ('user')
  const role = getNormalizedRole(user);
  if (role !== 'user') {
    showToast('Only Buyers can place bids.', 'error');
    return;
  }

  const artworks = getData('artworks', []);
  const art = artworks.find(a => a.id === artId);
  if (!art) return;

  // 3. The auction must be still LIVE
  const auctionStatus = art.auctionStatus || 'LIVE';
  if (auctionStatus === 'CLOSED' || auctionStatus === 'WINNER ANNOUNCED') {
    showToast('This auction has ended. Bidding is no longer available.', 'error');
    return;
  }

  const bidInput = document.getElementById('bidAmountInput');
  if (!bidInput) return;

  const newBid = Number(bidInput.value);
  const currentHighest = Number(art.currentBid || art.startingPrice || art.price);

  // 4. The bid amount must be higher than current highest bid
  if (!newBid || isNaN(newBid) || newBid <= currentHighest) {
    showToast('Your bid must be higher than the current highest bid.', 'error');
    return;
  }

  // Update previous bids for this artwork to Outbid
  const bids = getData('bids', []);
  bids.forEach(b => {
    if (Number(b.artworkId) === Number(art.id) && b.status === 'Leading') {
      b.status = 'Outbid';
    }
  });

  // Record Bid in bids and auctionBids array
  const newBidRecord = {
    id: getNextId(bids),
    artworkId: art.id,
    artworkName: art.name,
    userId: user.id,
    userEmail: user.email || '',
    userName: user.name,
    bidAmount: newBid,
    date: new Date().toLocaleString(),
    status: 'Leading'
  };
  bids.push(newBidRecord);
  setData('bids', bids);
  setData('auctionBids', bids);

  // Update Artwork
  art.currentBid = newBid;
  art.currentBidder = user.name;
  art.currentBidderEmail = user.email || '';
  art.currentBidderId = user.id;
  art.bidsCount = (art.bidsCount || 0) + 1;
  setData('artworks', artworks);

  showToast(`Bid of ${formatCurrency(newBid)} placed successfully! You are the highest bidder.`, 'success');
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
    document.body.appendChild(overlay);
  }
  return overlay;
}

function closeArtworkDetailsModal() {
  const overlay = document.getElementById('artworkDetailsModalOverlay');
  if (overlay) overlay.classList.remove('active');
}

// Admin: Open Complete Bid History Modal on Artwork Details page
function openArtworkBidHistoryModal(artId) {
  const user = getCurrentUser();
  if (getNormalizedRole(user) !== 'admin') {
    showToast('Unauthorized action. Admin access required.', 'error');
    return;
  }

  const artworks = getData('artworks', []);
  const art = artworks.find(a => a.id === artId);
  if (!art) return;

  const allBids = getData('bids', []).filter(b => Number(b.artworkId) === Number(art.id));
  const maxBidVal = allBids.length > 0 ? Math.max(...allBids.map(b => Number(b.bidAmount))) : 0;
  const status = art.auctionStatus || 'LIVE';

  const overlay = getArtworkDetailsModalOverlay();
  overlay.innerHTML = `
    <div class="modal-card" style="max-width: 650px;">
      <div class="modal-header">
        <div>
          <h3 style="font-size: 1.25rem; font-weight: 800;">Complete Bid History</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">Artwork: <strong>${art.name}</strong> • by ${art.artist}</p>
        </div>
        <button class="modal-close-btn" onclick="closeArtworkDetailsModal()">&times;</button>
      </div>

      <div style="background-color: var(--surface-alt); padding: 14px; border-radius: 8px; margin-bottom: 20px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; font-size: 0.88rem;">
        <div>
          <div style="color: var(--text-muted); font-size: 0.78rem;">Starting Price</div>
          <strong>${formatCurrency(art.startingPrice || art.price)}</strong>
        </div>
        <div>
          <div style="color: var(--text-muted); font-size: 0.78rem;">Current Highest Bid</div>
          <strong style="color: var(--accent);">${formatCurrency(art.currentBid || art.price)}</strong>
        </div>
        <div>
          <div style="color: var(--text-muted); font-size: 0.78rem;">Auction Status</div>
          <span class="badge ${status === 'WINNER ANNOUNCED' ? 'badge-sale' : (status === 'CLOSED' ? 'badge-category' : 'badge-auction')}">${status}</span>
        </div>
      </div>

      <div class="table-container" style="max-height: 300px; overflow-y: auto;">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Bidder Name</th>
              <th>Email / ID</th>
              <th>Bid Amount</th>
              <th>Date &amp; Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${allBids.length === 0 ? `
              <tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 20px;">No bids have been placed yet for this artwork.</td></tr>
            ` : allBids.map(b => {
              const isHighest = Number(b.bidAmount) === maxBidVal;
              return `
                <tr ${isHighest ? 'style="background-color: #fef3c7; font-weight: 700;"' : ''}>
                  <td><strong>${b.userName}</strong></td>
                  <td><span style="font-size: 0.82rem; color: var(--text-muted);">${b.userEmail || ('User #' + b.userId)}</span></td>
                  <td><strong style="color: var(--accent);">${formatCurrency(b.bidAmount)}</strong></td>
                  <td style="font-size: 0.82rem;">${b.date}</td>
                  <td>${isHighest ? '<span class="badge badge-sale">★ Highest Bid</span>' : '<span class="badge badge-category">Outbid</span>'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div style="display: flex; justify-content: flex-end; margin-top: 20px; padding-top: 14px; border-top: 1px solid var(--border);">
        <button onclick="closeArtworkDetailsModal()" class="btn btn-sm btn-outline">Close</button>
      </div>
    </div>
  `;
  overlay.classList.add('active');
}

// Admin: Close Auction from Details Page
function confirmCloseAuctionFromDetails(artId) {
  const user = getCurrentUser();
  if (getNormalizedRole(user) !== 'admin') {
    showToast('Unauthorized action. Admin access required.', 'error');
    return;
  }

  if (!confirm('Are you sure you want to close this auction? Bidding will be locked.')) {
    return;
  }

  const artworks = getData('artworks', []);
  const art = artworks.find(a => a.id === artId);
  if (!art) return;

  const allBids = getData('bids', []).filter(b => Number(b.artworkId) === Number(art.id));
  if (allBids.length > 0) {
    const sorted = allBids.slice().sort((a, b) => Number(b.bidAmount) - Number(a.bidAmount));
    const topBid = sorted[0];
    art.currentBid = Number(topBid.bidAmount);
    art.currentBidder = topBid.userName;
    art.currentBidderEmail = topBid.userEmail || '';
    art.currentBidderId = topBid.userId || null;
  }

  art.auctionStatus = 'CLOSED';
  setData('artworks', artworks);

  showToast('Auction closed successfully! Status changed to CLOSED.', 'success');
  initArtworkDetailsPage();
}

// Admin: Announce Winner Modal from Details Page
function openArtworkAnnounceWinnerModal(artId) {
  const user = getCurrentUser();
  if (getNormalizedRole(user) !== 'admin') {
    showToast('Unauthorized action. Admin access required.', 'error');
    return;
  }

  const artworks = getData('artworks', []);
  const art = artworks.find(a => a.id === artId);
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
    <div class="modal-card" style="max-width: 500px;">
      <div class="modal-header">
        <h3 style="font-size: 1.3rem; font-weight: 800; color: #047857;">🏆 Announce Official Winner</h3>
        <button class="modal-close-btn" onclick="closeArtworkDetailsModal()">&times;</button>
      </div>

      <div style="background-color: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
        <p style="color: #065f46; font-size: 0.9rem; margin: 0; line-height: 1.5;">
          Confirming this action will officially publish the winning bidder to all gallery visitors.
        </p>
      </div>

      <div style="background-color: var(--surface-alt); padding: 18px; border-radius: 8px; margin-bottom: 24px;">
        <div style="margin-bottom: 12px;">
          <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Artwork</span>
          <div style="font-size: 1.15rem; font-weight: 700;">${art.name}</div>
          <div style="font-size: 0.85rem; color: var(--text-muted);">by ${art.artist}</div>
        </div>

        <div style="border-top: 1px solid var(--border); padding-top: 12px; margin-bottom: 12px;">
          <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Winner</span>
          <div style="font-size: 1.35rem; font-weight: 800; color: var(--text-main);">${winnerName}</div>
          ${winnerEmail ? `<div style="font-size: 0.82rem; color: var(--text-muted);">${winnerEmail}</div>` : ''}
        </div>

        <div style="border-top: 1px solid var(--border); padding-top: 12px; display: flex; justify-content: space-between; align-items: baseline;">
          <div>
            <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Winning Bid</span>
            <div style="font-size: 1.6rem; font-weight: 800; color: var(--accent);">${formatCurrency(winningBid)}</div>
          </div>
          <div style="text-align: right; font-size: 0.85rem; color: var(--text-muted);">
            <div>Starting: ${formatCurrency(art.startingPrice || art.price)}</div>
            <div>Total Bids: ${allBids.length}</div>
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 10px;">
        <button onclick="closeArtworkDetailsModal()" class="btn btn-outline btn-block">Cancel</button>
        <button onclick="confirmAnnounceWinnerFromDetails(${art.id})" class="btn btn-accent btn-block">
          Announce Winner
        </button>
      </div>
    </div>
  `;
  overlay.classList.add('active');
}

// Admin: Confirm Announce Winner from Details Page
function confirmAnnounceWinnerFromDetails(artId) {
  const user = getCurrentUser();
  if (getNormalizedRole(user) !== 'admin') {
    showToast('Unauthorized action. Admin access required.', 'error');
    return;
  }

  const artworks = getData('artworks', []);
  const art = artworks.find(a => a.id === artId);
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
  const winnerUserId = topBid.userId || null;
  const winningBid = Number(topBid.bidAmount || art.currentBid);
  const announcementTime = new Date().toLocaleString();

  // Save to auctionResults
  const auctionResults = getData('auctionResults', []);
  const filteredResults = auctionResults.filter(r => Number(r.artworkId) !== Number(art.id));
  filteredResults.push({
    id: getNextId(auctionResults),
    artworkId: art.id,
    artworkName: art.name,
    artist: art.artist,
    winnerName: winnerName,
    winnerEmail: winnerEmail,
    winnerUserId: winnerUserId,
    winningBid: winningBid,
    startingPrice: Number(art.startingPrice || art.price),
    totalBids: allBids.length,
    announcedAt: announcementTime,
    status: 'Winner Announced'
  });
  setData('auctionResults', filteredResults);

  // Update Artwork
  art.auctionStatus = 'WINNER ANNOUNCED';
  art.winnerName = winnerName;
  art.winnerEmail = winnerEmail;
  art.winnerUserId = winnerUserId;
  art.winningBid = winningBid;
  art.announcedAt = announcementTime;
  setData('artworks', artworks);

  closeArtworkDetailsModal();
  showToast(`Winner officially announced: ${winnerName} (${formatCurrency(winningBid)})!`, 'success');
  initArtworkDetailsPage();
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initFeaturedArtworks();
  initGalleryPage();
  initArtworkDetailsPage();
});
