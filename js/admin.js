/**
 * admin.js - Professional Admin Dashboard & Management Functions
 * Online Art Gallery (ArtLoom) - SDC Project Review-1
 * Strictly Vanilla JavaScript & LocalStorage
 */

// Route Guard: Ensure Admin Access Only
const currentAdmin = requireAuth(['admin']);

// Initialize Admin Dashboard
function initAdminDashboard() {
  if (!currentAdmin) return;

  renderAdminStats();
  renderAdminArtworksTable();
  renderAdminUsersTable();
  renderAdminCategoriesList();
  renderAdminPurchasesTable();
  renderAdminAuctionsTable();
  renderAdminReviewsTable();

  // Tab switching logic
  const tabButtons = document.querySelectorAll('.dash-tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetTab = document.getElementById(btn.getAttribute('data-target'));
      if (targetTab) targetTab.classList.add('active');
    });
  });
}

// 1. Calculate & Render Dynamic Summary Cards
function renderAdminStats() {
  const users = getData('users', []);
  const artworks = getData('artworks', []);
  const purchases = getData('purchases', []);
  const reviews = getData('reviews', []);

  const totalUsers = users.length;
  const totalArtists = users.filter(u => (u.role || '').toLowerCase() === 'artist').length;
  const totalArtworks = artworks.length;
  const totalPurchases = purchases.length;
  const liveAuctions = artworks.filter(a => a.type === 'Auction' && (a.auctionStatus || 'LIVE') === 'LIVE').length;
  const totalReviews = reviews.length;
  const totalRevenue = purchases.reduce((sum, p) => sum + Number(p.price || 0), 0);

  // Update DOM elements
  const elUsers = document.getElementById('statTotalUsers');
  const elArtists = document.getElementById('statTotalArtists');
  const elArtworks = document.getElementById('statTotalArtworks');
  const elPurchases = document.getElementById('statTotalPurchases');
  const elAuctions = document.getElementById('statTotalAuctions');
  const elReviews = document.getElementById('statTotalReviews');
  const elRevenue = document.getElementById('statTotalRevenue');

  if (elUsers) elUsers.textContent = totalUsers;
  if (elArtists) elArtists.textContent = totalArtists;
  if (elArtworks) elArtworks.textContent = totalArtworks;
  if (elPurchases) elPurchases.textContent = totalPurchases;
  if (elAuctions) elAuctions.textContent = liveAuctions;
  if (elReviews) elReviews.textContent = totalReviews;
  if (elRevenue) elRevenue.textContent = formatCurrency(totalRevenue);
}

// 2. Render Artworks Management Table
function renderAdminArtworksTable() {
  const tableBody = document.getElementById('adminArtworksTableBody');
  if (!tableBody) return;

  const artworks = getData('artworks', []);

  if (artworks.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">No artworks available.</td></tr>`;
    return;
  }

  tableBody.innerHTML = artworks.map(art => `
    <tr>
      <td>#${art.id}</td>
      <td>
        <img src="${art.image}" alt="${art.name}" class="table-thumb" onerror="this.src='images/artworks/artwork-1.svg'">
      </td>
      <td><strong>${art.name}</strong></td>
      <td>${art.artist}</td>
      <td><span class="badge badge-category">${art.category}</span></td>
      <td><span class="badge ${art.type === 'Auction' ? 'badge-auction' : 'badge-sale'}">${art.type}</span></td>
      <td><strong>${formatCurrency(art.type === 'Auction' ? (art.currentBid || art.price) : art.price)}</strong></td>
      <td>
        <div style="display: flex; gap: 6px;">
          <button onclick="openEditArtworkModal(${art.id})" class="btn btn-sm btn-outline" title="Edit">Edit</button>
          <button onclick="deleteArtwork(${art.id})" class="btn btn-sm btn-danger" title="Delete">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Open Add Artwork Modal
function openAddArtworkModal() {
  let modalOverlay = document.getElementById('artworkModalOverlay');
  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.id = 'artworkModalOverlay';
    modalOverlay.className = 'modal-overlay';
    document.body.appendChild(modalOverlay);
  }

  modalOverlay.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3 style="font-size: 1.3rem; font-weight: 800;">Add New Artwork</h3>
        <button class="modal-close-btn" onclick="closeArtworkModal()">&times;</button>
      </div>
      <form id="addArtworkForm" onsubmit="handleSaveNewArtwork(event)">
        <div class="form-group">
          <label>Artwork Name *</label>
          <input type="text" id="newArtName" class="form-control" required placeholder="e.g. Celestial Dawn">
        </div>
        <div class="form-group">
          <label>Artist Name *</label>
          <input type="text" id="newArtArtist" class="form-control" required placeholder="e.g. Elena Vance">
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div class="form-group">
            <label>Category *</label>
            <select id="newArtCategory" class="form-control" required>
              <option value="Painting">Painting</option>
              <option value="Digital Art">Digital Art</option>
              <option value="Photography">Photography</option>
              <option value="Drawing">Drawing</option>
              <option value="Portrait">Portrait</option>
              <option value="Landscape">Landscape</option>
              <option value="Abstract">Abstract</option>
              <option value="Sculpture">Sculpture</option>
            </select>
          </div>
          <div class="form-group">
            <label>Type *</label>
            <select id="newArtType" class="form-control" required>
              <option value="For Sale">For Sale</option>
              <option value="Auction">Auction</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Price (₹) *</label>
          <input type="number" id="newArtPrice" class="form-control" required min="100" placeholder="e.g. 15000">
        </div>
        <div class="form-group">
          <label>Image (Local SVG or Web URL)</label>
          <input type="text" id="newArtImage" class="form-control" placeholder="images/artworks/artwork-1.svg" value="images/artworks/artwork-1.svg">
        </div>
        <div class="form-group">
          <label>Description *</label>
          <textarea id="newArtDesc" class="form-control" rows="3" required placeholder="Detailed description of the artwork..."></textarea>
        </div>
        <div style="display: flex; gap: 12px; margin-top: 20px;">
          <button type="button" class="btn btn-outline btn-block" onclick="closeArtworkModal()">Cancel</button>
          <button type="submit" class="btn btn-accent btn-block">Add Artwork</button>
        </div>
      </form>
    </div>
  `;
  modalOverlay.classList.add('active');
}

// Handle Add Artwork Form Save
function handleSaveNewArtwork(e) {
  e.preventDefault();
  const artworks = getData('artworks', []);

  const name = document.getElementById('newArtName').value.trim();
  const artist = document.getElementById('newArtArtist').value.trim();
  const category = document.getElementById('newArtCategory').value;
  const type = document.getElementById('newArtType').value;
  const price = Number(document.getElementById('newArtPrice').value);
  const image = document.getElementById('newArtImage').value.trim() || 'images/artworks/artwork-1.svg';
  const description = document.getElementById('newArtDesc').value.trim();

  const newArt = {
    id: getNextId(artworks),
    name,
    artist,
    artistId: currentAdmin.id,
    category,
    type,
    price,
    startingPrice: type === 'Auction' ? price : undefined,
    currentBid: type === 'Auction' ? price : undefined,
    currentBidder: type === 'Auction' ? 'Starting Price' : undefined,
    image,
    description,
    featured: false,
    status: 'active',
    createdAt: new Date().toISOString().slice(0, 10)
  };

  artworks.push(newArt);
  setData('artworks', artworks);

  closeArtworkModal();
  showToast('Artwork added successfully!', 'success');
  renderAdminStats();
  renderAdminArtworksTable();
}

// Open Edit Artwork Modal
function openEditArtworkModal(artId) {
  const artworks = getData('artworks', []);
  const art = artworks.find(a => a.id === artId);
  if (!art) return;

  let modalOverlay = document.getElementById('artworkModalOverlay');
  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.id = 'artworkModalOverlay';
    modalOverlay.className = 'modal-overlay';
    document.body.appendChild(modalOverlay);
  }

  modalOverlay.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3 style="font-size: 1.3rem; font-weight: 800;">Edit Artwork #${art.id}</h3>
        <button class="modal-close-btn" onclick="closeArtworkModal()">&times;</button>
      </div>
      <form id="editArtworkForm" onsubmit="handleUpdateArtwork(event, ${art.id})">
        <div class="form-group">
          <label>Artwork Name *</label>
          <input type="text" id="editArtName" class="form-control" required value="${art.name}">
        </div>
        <div class="form-group">
          <label>Artist Name *</label>
          <input type="text" id="editArtArtist" class="form-control" required value="${art.artist}">
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div class="form-group">
            <label>Category *</label>
            <select id="editArtCategory" class="form-control" required>
              <option value="Painting" ${art.category === 'Painting' ? 'selected' : ''}>Painting</option>
              <option value="Digital Art" ${art.category === 'Digital Art' ? 'selected' : ''}>Digital Art</option>
              <option value="Photography" ${art.category === 'Photography' ? 'selected' : ''}>Photography</option>
              <option value="Drawing" ${art.category === 'Drawing' ? 'selected' : ''}>Drawing</option>
              <option value="Portrait" ${art.category === 'Portrait' ? 'selected' : ''}>Portrait</option>
              <option value="Landscape" ${art.category === 'Landscape' ? 'selected' : ''}>Landscape</option>
              <option value="Abstract" ${art.category === 'Abstract' ? 'selected' : ''}>Abstract</option>
              <option value="Sculpture" ${art.category === 'Sculpture' ? 'selected' : ''}>Sculpture</option>
            </select>
          </div>
          <div class="form-group">
            <label>Type *</label>
            <select id="editArtType" class="form-control" required>
              <option value="For Sale" ${art.type === 'For Sale' ? 'selected' : ''}>For Sale</option>
              <option value="Auction" ${art.type === 'Auction' ? 'selected' : ''}>Auction</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Price (₹) *</label>
          <input type="number" id="editArtPrice" class="form-control" required value="${art.price}">
        </div>
        <div class="form-group">
          <label>Image URL</label>
          <input type="text" id="editArtImage" class="form-control" value="${art.image}">
        </div>
        <div class="form-group">
          <label>Description *</label>
          <textarea id="editArtDesc" class="form-control" rows="3" required>${art.description}</textarea>
        </div>
        <div style="display: flex; gap: 12px; margin-top: 20px;">
          <button type="button" class="btn btn-outline btn-block" onclick="closeArtworkModal()">Cancel</button>
          <button type="submit" class="btn btn-accent btn-block">Save Changes</button>
        </div>
      </form>
    </div>
  `;
  modalOverlay.classList.add('active');
}

// Handle Artwork Update Save
function handleUpdateArtwork(e, artId) {
  e.preventDefault();
  const artworks = getData('artworks', []);
  const index = artworks.findIndex(a => a.id === artId);
  if (index === -1) return;

  artworks[index].name = document.getElementById('editArtName').value.trim();
  artworks[index].artist = document.getElementById('editArtArtist').value.trim();
  artworks[index].category = document.getElementById('editArtCategory').value;
  artworks[index].type = document.getElementById('editArtType').value;
  artworks[index].price = Number(document.getElementById('editArtPrice').value);
  artworks[index].image = document.getElementById('editArtImage').value.trim();
  artworks[index].description = document.getElementById('editArtDesc').value.trim();

  setData('artworks', artworks);
  closeArtworkModal();
  showToast('Artwork updated successfully!', 'success');
  renderAdminStats();
  renderAdminArtworksTable();
}

function closeArtworkModal() {
  const modalOverlay = document.getElementById('artworkModalOverlay');
  if (modalOverlay) modalOverlay.classList.remove('active');
}

// Delete Artwork with Confirmation
function deleteArtwork(artId) {
  if (!confirm(`Are you sure you want to delete artwork #${artId}? This action cannot be undone.`)) {
    return;
  }

  let artworks = getData('artworks', []);
  artworks = artworks.filter(a => a.id !== artId);
  setData('artworks', artworks);

  showToast(`Artwork #${artId} deleted successfully.`, 'info');
  renderAdminStats();
  renderAdminArtworksTable();
}

// 3. Render Users Management Table
function renderAdminUsersTable() {
  const tableBody = document.getElementById('adminUsersTableBody');
  if (!tableBody) return;

  const users = getData('users', []);

  tableBody.innerHTML = users.map(u => `
    <tr>
      <td>#${u.id}</td>
      <td>
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="${u.avatar || 'images/avatar-user.svg'}" class="user-avatar-sm" alt="${u.name}">
          <strong>${u.name}</strong>
        </div>
      </td>
      <td>${u.email}</td>
      <td><span class="role-tag role-${u.role}">${u.role}</span></td>
      <td>${u.createdAt || '2026-01-01'}</td>
      <td>
        ${u.id === currentAdmin.id ? `
          <span style="color: var(--text-muted); font-size: 0.85rem;">Active Admin</span>
        ` : `
          <button onclick="deleteUser(${u.id})" class="btn btn-sm btn-outline" style="color: var(--danger); border-color: var(--danger);">Remove</button>
        `}
      </td>
    </tr>
  `).join('');
}

// Delete User
function deleteUser(userId) {
  if (userId === currentAdmin.id) {
    showToast('Cannot delete your own active administrator account.', 'error');
    return;
  }

  if (!confirm(`Are you sure you want to remove user #${userId}?`)) {
    return;
  }

  let users = getData('users', []);
  users = users.filter(u => u.id !== userId);
  setData('users', users);

  showToast('User removed successfully.', 'info');
  renderAdminStats();
  renderAdminUsersTable();
}

// 4. Render Categories List
function renderAdminCategoriesList() {
  const container = document.getElementById('adminCategoriesContainer');
  if (!container) return;

  const categories = getData('categories', []);
  const artworks = getData('artworks', []);

  container.innerHTML = categories.map(cat => {
    const count = artworks.filter(a => a.category.toLowerCase() === cat.name.toLowerCase()).length;
    return `
      <div class="category-card" style="text-align: left; align-items: flex-start;">
        <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
          <div class="category-icon-box">${cat.icon || '🎨'}</div>
          <span class="badge badge-category">${count} Artworks</span>
        </div>
        <h3 style="margin-top: 10px;">${cat.name}</h3>
        <p>${cat.description}</p>
      </div>
    `;
  }).join('');
}

// 5. Render Purchases Log
function renderAdminPurchasesTable() {
  const tableBody = document.getElementById('adminPurchasesTableBody');
  if (!tableBody) return;

  const purchases = getData('purchases', []);

  if (purchases.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No purchases logged yet.</td></tr>`;
    return;
  }

  tableBody.innerHTML = purchases.map(p => `
    <tr>
      <td>#ORD-${p.id}</td>
      <td>
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="${p.image || 'images/artworks/artwork-1.svg'}" class="table-thumb" alt="${p.artworkName}">
          <strong>${p.artworkName}</strong>
        </div>
      </td>
      <td>${p.userName || 'User #' + p.userId}</td>
      <td>${p.artist}</td>
      <td><strong>${formatCurrency(p.price)}</strong></td>
      <td>${p.date}</td>
      <td><span class="badge badge-sale">${p.status || 'Completed'}</span></td>
    </tr>
  `).join('');
}

// 6. Render Auction & Bidding Management Table
function renderAdminAuctionsTable() {
  const tableBody = document.getElementById('adminAuctionsTableBody');
  if (!tableBody) return;

  const artworks = getData('artworks', []).filter(a => a.type === 'Auction');
  const allBids = getData('bids', []);

  // Update status badges if present in tab header
  const liveCountEl = document.getElementById('adminAuctionLiveCount');
  const closedCountEl = document.getElementById('adminAuctionClosedCount');
  const announcedCountEl = document.getElementById('adminAuctionAnnouncedCount');

  const liveCount = artworks.filter(a => (a.auctionStatus || 'LIVE') === 'LIVE').length;
  const closedCount = artworks.filter(a => a.auctionStatus === 'CLOSED').length;
  const announcedCount = artworks.filter(a => a.auctionStatus === 'WINNER ANNOUNCED').length;

  if (liveCountEl) liveCountEl.textContent = `${liveCount} Live`;
  if (closedCountEl) closedCountEl.textContent = `${closedCount} Closed`;
  if (announcedCountEl) announcedCountEl.textContent = `${announcedCount} Winner Announced`;

  if (artworks.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 24px;">No auction items configured yet.</td></tr>`;
    return;
  }

  tableBody.innerHTML = artworks.map(art => {
    const artBids = allBids.filter(b => Number(b.artworkId) === Number(art.id));
    const bidsCount = artBids.length;
    const currentHighBid = Number(art.currentBid || art.startingPrice || art.price);
    const status = art.auctionStatus || 'LIVE';

    // Status Badge
    let statusBadgeHTML = '<span class="badge badge-auction">LIVE</span>';
    if (status === 'WINNER ANNOUNCED') {
      statusBadgeHTML = '<span class="badge badge-sale">WINNER ANNOUNCED</span>';
    } else if (status === 'CLOSED') {
      statusBadgeHTML = '<span class="badge" style="background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5;">CLOSED</span>';
    }

    // Highest Bidder display
    let topBidderHTML = 'None yet';
    if (status === 'WINNER ANNOUNCED' && art.winnerName) {
      topBidderHTML = `<strong>${art.winnerName}</strong>`;
      if (art.winnerEmail) {
        topBidderHTML += `<div style="font-size: 0.76rem; color: var(--text-muted);">${art.winnerEmail}</div>`;
      }
    } else if (art.currentBidder && art.currentBidder !== 'None yet') {
      topBidderHTML = `<strong>${art.currentBidder}</strong>`;
      if (art.currentBidderEmail) {
        topBidderHTML += `<div style="font-size: 0.76rem; color: var(--text-muted);">${art.currentBidderEmail}</div>`;
      }
    } else if (artBids.length > 0) {
      const lastBid = artBids[artBids.length - 1];
      topBidderHTML = `<strong>${lastBid.userName}</strong>`;
      if (lastBid.userEmail) {
        topBidderHTML += `<div style="font-size: 0.76rem; color: var(--text-muted);">${lastBid.userEmail}</div>`;
      }
    }

    // Action buttons based on status
    let actionButtonsHTML = '';
    if (status === 'LIVE') {
      actionButtonsHTML = `
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          <button onclick="openAdminBidHistoryModal(${art.id})" class="btn btn-sm btn-outline">View Bids</button>
          <button onclick="confirmCloseAuctionAdmin(${art.id})" class="btn btn-sm btn-danger">Close Auction</button>
        </div>
      `;
    } else if (status === 'CLOSED') {
      actionButtonsHTML = `
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          <button onclick="openAdminBidHistoryModal(${art.id})" class="btn btn-sm btn-outline">View Bids</button>
          <button onclick="openAnnounceWinnerModal(${art.id})" class="btn btn-sm btn-accent">Announce Winner</button>
        </div>
      `;
    } else if (status === 'WINNER ANNOUNCED') {
      actionButtonsHTML = `
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          <button onclick="openAdminBidHistoryModal(${art.id})" class="btn btn-sm btn-outline">View Bids</button>
          <button onclick="openAuctionResultModal(${art.id})" class="btn btn-sm btn-primary">View Result</button>
        </div>
      `;
    }

    return `
      <tr>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${art.image || 'images/artworks/artwork-1.svg'}" class="table-thumb" alt="${art.name}" onerror="this.src='images/artworks/artwork-1.svg'">
            <div>
              <strong>${art.name}</strong>
              <div style="font-size: 0.78rem; color: var(--text-muted);">by ${art.artist}</div>
            </div>
          </div>
        </td>
        <td>${formatCurrency(art.startingPrice || art.price)}</td>
        <td style="color: var(--accent); font-weight: 800; font-size: 1.05rem;">${formatCurrency(currentHighBid)}</td>
        <td>${topBidderHTML}</td>
        <td><span class="badge badge-category">${bidsCount}</span></td>
        <td>${statusBadgeHTML}</td>
        <td>${actionButtonsHTML}</td>
      </tr>
    `;
  }).join('');
}

// Ensure Admin Auction Modal Container exists
function getAdminAuctionModalOverlay() {
  let overlay = document.getElementById('adminAuctionModalOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'adminAuctionModalOverlay';
    overlay.className = 'modal-overlay';
    document.body.appendChild(overlay);
  }
  return overlay;
}

function closeAdminAuctionModal() {
  const overlay = document.getElementById('adminAuctionModalOverlay');
  if (overlay) overlay.classList.remove('active');
}

// 1. Admin Complete Bid History Modal
function openAdminBidHistoryModal(artId) {
  const artworks = getData('artworks', []);
  const art = artworks.find(a => a.id === artId);
  if (!art) return;

  const allBids = getData('bids', []);
  const artBids = allBids.filter(b => Number(b.artworkId) === Number(art.id));
  const maxBidVal = artBids.length > 0 ? Math.max(...artBids.map(b => Number(b.bidAmount))) : 0;
  const status = art.auctionStatus || 'LIVE';

  const overlay = getAdminAuctionModalOverlay();
  overlay.innerHTML = `
    <div class="modal-card" style="max-width: 650px;">
      <div class="modal-header">
        <div>
          <h3 style="font-size: 1.25rem; font-weight: 800;">Complete Bid History</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 2px;">Artwork: <strong>${art.name}</strong> • by ${art.artist}</p>
        </div>
        <button class="modal-close-btn" onclick="closeAdminAuctionModal()">&times;</button>
      </div>

      <!-- Quick KPI summary -->
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

      <div class="table-container" style="max-height: 320px; overflow-y: auto;">
        <table class="custom-table">
          <thead>
            <tr>
              <th>Bidder Name</th>
              <th>Bidder Email / ID</th>
              <th>Bid Amount</th>
              <th>Date &amp; Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${artBids.length === 0 ? `
              <tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 24px;">No bids have been placed yet for this artwork.</td></tr>
            ` : artBids.map(b => {
              const isHighest = Number(b.bidAmount) === maxBidVal;
              const rowStyle = isHighest ? 'style="background-color: #fef3c7; font-weight: 700;"' : '';
              const badgeHTML = isHighest 
                ? '<span class="badge badge-sale">★ Highest Bid</span>' 
                : '<span class="badge badge-category">Outbid</span>';

              return `
                <tr ${rowStyle}>
                  <td><strong>${b.userName}</strong></td>
                  <td><span style="font-size: 0.82rem; color: var(--text-muted);">${b.userEmail || ('User #' + b.userId)}</span></td>
                  <td><strong style="color: var(--accent);">${formatCurrency(b.bidAmount)}</strong></td>
                  <td style="font-size: 0.82rem;">${b.date}</td>
                  <td>${badgeHTML}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 22px; padding-top: 14px; border-top: 1px solid var(--border);">
        <div>
          ${status === 'LIVE' ? `
            <button onclick="confirmCloseAuctionAdmin(${art.id})" class="btn btn-sm btn-danger">Close Auction</button>
          ` : (status === 'CLOSED' ? `
            <button onclick="openAnnounceWinnerModal(${art.id})" class="btn btn-sm btn-accent">Announce Winner</button>
          ` : `
            <button onclick="openAuctionResultModal(${art.id})" class="btn btn-sm btn-primary">View Result</button>
          `)}
        </div>
        <button onclick="closeAdminAuctionModal()" class="btn btn-sm btn-outline">Close</button>
      </div>
    </div>
  `;
  overlay.classList.add('active');
}

// 2. Admin Close Auction Action
function confirmCloseAuctionAdmin(artId) {
  if (!confirm('Are you sure you want to close this auction?')) {
    return;
  }

  const artworks = getData('artworks', []);
  const art = artworks.find(a => a.id === artId);
  if (!art) return;

  const allBids = getData('bids', []);
  const artBids = allBids.filter(b => Number(b.artworkId) === Number(art.id));

  // Determine highest valid bid
  let highestBid = Number(art.currentBid || art.startingPrice || art.price);
  let highestBidder = art.currentBidder || 'None';
  let highestBidderEmail = art.currentBidderEmail || '';
  let highestBidderUserId = art.currentBidderId || null;

  if (artBids.length > 0) {
    const sorted = artBids.slice().sort((a, b) => Number(b.bidAmount) - Number(a.bidAmount));
    const topBid = sorted[0];
    highestBid = Number(topBid.bidAmount);
    highestBidder = topBid.userName;
    highestBidderEmail = topBid.userEmail || '';
    highestBidderUserId = topBid.userId || null;
  }

  // Update Artwork
  art.currentBid = highestBid;
  art.currentBidder = highestBidder;
  art.currentBidderEmail = highestBidderEmail;
  art.currentBidderId = highestBidderUserId;
  art.auctionStatus = 'CLOSED';
  setData('artworks', artworks);

  showToast(`Auction closed successfully! Status changed to CLOSED.`, 'success');
  renderAdminStats();
  renderAdminAuctionsTable();

  // Show summary modal
  showAuctionClosedSummaryModal(artId);
}

// 3. Post-Close Summary Modal
function showAuctionClosedSummaryModal(artId) {
  const artworks = getData('artworks', []);
  const art = artworks.find(a => a.id === artId);
  if (!art) return;

  const allBids = getData('bids', []);
  const artBids = allBids.filter(b => Number(b.artworkId) === Number(art.id));
  const hasBids = artBids.length > 0;

  const overlay = getAdminAuctionModalOverlay();
  overlay.innerHTML = `
    <div class="modal-card" style="max-width: 500px;">
      <div class="modal-header">
        <h3 style="font-size: 1.3rem; font-weight: 800; color: #b91c1c;">Auction Closed</h3>
        <button class="modal-close-btn" onclick="closeAdminAuctionModal()">&times;</button>
      </div>

      <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <p style="color: #991b1b; font-size: 0.95rem; margin: 0; line-height: 1.5;">
          This auction lot is now officially <strong>CLOSED</strong>. Collectors can no longer place bids.
        </p>
      </div>

      <div style="background-color: var(--surface-alt); padding: 18px; border-radius: 8px; margin-bottom: 24px;">
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 4px;">Artwork Lot</div>
        <div style="font-size: 1.15rem; font-weight: 700; margin-bottom: 14px;">${art.name} by ${art.artist}</div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; border-top: 1px solid var(--border); padding-top: 12px;">
          <div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">Highest Bidder:</div>
            <div style="font-size: 1.15rem; font-weight: 800; color: var(--text-main); margin-top: 2px;">
              ${art.currentBidder || 'No bids placed'}
            </div>
            ${art.currentBidderEmail ? `<div style="font-size: 0.78rem; color: var(--text-muted);">${art.currentBidderEmail}</div>` : ''}
          </div>
          <div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">Highest Bid:</div>
            <div style="font-size: 1.35rem; font-weight: 800; color: var(--accent); margin-top: 2px;">
              ${formatCurrency(art.currentBid || art.price)}
            </div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">${artBids.length} total bids received</div>
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 10px;">
        ${hasBids ? `
          <button onclick="openAnnounceWinnerModal(${art.id})" class="btn btn-accent btn-block">
            🏆 Announce Winner Now
          </button>
        ` : `
          <button onclick="closeAdminAuctionModal()" class="btn btn-outline btn-block">Close</button>
        `}
        <button onclick="closeAdminAuctionModal()" class="btn btn-outline btn-block">Done</button>
      </div>
    </div>
  `;
  overlay.classList.add('active');
}

// 4. Admin Announce Winner Modal
function openAnnounceWinnerModal(artId) {
  const artworks = getData('artworks', []);
  const art = artworks.find(a => a.id === artId);
  if (!art) return;

  const allBids = getData('bids', []);
  const artBids = allBids.filter(b => Number(b.artworkId) === Number(art.id));

  if (artBids.length === 0) {
    showToast('Cannot announce winner because no bids were received on this artwork.', 'warning');
    return;
  }

  const sorted = artBids.slice().sort((a, b) => Number(b.bidAmount) - Number(a.bidAmount));
  const topBid = sorted[0];
  const winnerName = topBid.userName || art.currentBidder;
  const winnerEmail = topBid.userEmail || art.currentBidderEmail || '';
  const winningBid = Number(topBid.bidAmount || art.currentBid);

  const overlay = getAdminAuctionModalOverlay();
  overlay.innerHTML = `
    <div class="modal-card" style="max-width: 500px;">
      <div class="modal-header">
        <h3 style="font-size: 1.3rem; font-weight: 800; color: #047857;">🏆 Announce Official Winner</h3>
        <button class="modal-close-btn" onclick="closeAdminAuctionModal()">&times;</button>
      </div>

      <div style="background-color: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
        <p style="color: #065f46; font-size: 0.9rem; margin: 0; line-height: 1.5;">
          Confirming this action will officially publish the winning bidder to all gallery collectors.
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
            <div>Total Bids: ${artBids.length}</div>
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 10px;">
        <button onclick="closeAdminAuctionModal()" class="btn btn-outline btn-block">Cancel</button>
        <button onclick="confirmAnnounceWinner(${art.id})" class="btn btn-accent btn-block">
          Announce Winner
        </button>
      </div>
    </div>
  `;
  overlay.classList.add('active');
}

// 5. Confirm Announce Winner
function confirmAnnounceWinner(artId) {
  const artworks = getData('artworks', []);
  const art = artworks.find(a => a.id === artId);
  if (!art) return;

  const allBids = getData('bids', []);
  const artBids = allBids.filter(b => Number(b.artworkId) === Number(art.id));

  if (artBids.length === 0) {
    showToast('Cannot announce winner because no bids were received.', 'error');
    return;
  }

  const sorted = artBids.slice().sort((a, b) => Number(b.bidAmount) - Number(a.bidAmount));
  const topBid = sorted[0];
  const winnerName = topBid.userName || art.currentBidder;
  const winnerEmail = topBid.userEmail || art.currentBidderEmail || '';
  const winnerUserId = topBid.userId || null;
  const winningBid = Number(topBid.bidAmount || art.currentBid);
  const announcementTime = new Date().toLocaleString();

  // Store in auctionResults in LocalStorage
  const auctionResults = getData('auctionResults', []);
  const filteredResults = auctionResults.filter(r => Number(r.artworkId) !== Number(art.id));
  const newResultRecord = {
    id: getNextId(auctionResults),
    artworkId: art.id,
    artworkName: art.name,
    artist: art.artist,
    winnerName: winnerName,
    winnerEmail: winnerEmail,
    winnerUserId: winnerUserId,
    winningBid: winningBid,
    startingPrice: Number(art.startingPrice || art.price),
    totalBids: artBids.length,
    announcedAt: announcementTime,
    status: 'Winner Announced'
  };
  filteredResults.push(newResultRecord);
  setData('auctionResults', filteredResults);

  // Update artwork object
  art.auctionStatus = 'WINNER ANNOUNCED';
  art.winnerName = winnerName;
  art.winnerEmail = winnerEmail;
  art.winnerUserId = winnerUserId;
  art.winningBid = winningBid;
  art.announcedAt = announcementTime;
  setData('artworks', artworks);

  showToast(`Winner officially announced: ${winnerName} (${formatCurrency(winningBid)})!`, 'success');
  renderAdminStats();
  renderAdminAuctionsTable();

  // Open the official result certificate
  openAuctionResultModal(art.id);
}

// 6. View Official Auction Result Modal
function openAuctionResultModal(artId) {
  const artworks = getData('artworks', []);
  const art = artworks.find(a => a.id === artId);
  if (!art) return;

  const results = getData('auctionResults', []);
  const result = results.find(r => Number(r.artworkId) === Number(art.id)) || {};

  const winnerName = art.winnerName || result.winnerName || art.currentBidder || 'Winner Announced';
  const winnerEmail = art.winnerEmail || result.winnerEmail || art.currentBidderEmail || '';
  const winningBid = Number(art.winningBid || result.winningBid || art.currentBid);
  const announcedAt = art.announcedAt || result.announcedAt || 'Recorded';
  const totalBids = result.totalBids || art.bidsCount || getData('bids', []).filter(b => Number(b.artworkId) === Number(art.id)).length;

  const overlay = getAdminAuctionModalOverlay();
  overlay.innerHTML = `
    <div class="modal-card" style="max-width: 520px;">
      <div class="modal-header">
        <h3 style="font-size: 1.3rem; font-weight: 800; color: #047857; display: flex; align-items: center; gap: 8px;">
          🏆 Official Auction Result
        </h3>
        <button class="modal-close-btn" onclick="closeAdminAuctionModal()">&times;</button>
      </div>

      <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(245, 158, 11, 0.12)); border: 2px solid #10b981; border-radius: 12px; padding: 22px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid rgba(16, 185, 129, 0.2); padding-bottom: 8px;">
          <span style="font-weight: 800; color: #047857; font-size: 1.1rem;">${art.name}</span>
          <span class="badge badge-sale">Winner Announced</span>
        </div>
        <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 16px;">by ${art.artist} • Category: ${art.category}</p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
          <div>
            <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Winning Bid:</div>
            <div style="font-size: 2rem; font-weight: 850; color: var(--accent);">${formatCurrency(winningBid)}</div>
          </div>
          <div>
            <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Declared Winner:</div>
            <div style="font-size: 1.4rem; font-weight: 850; color: var(--text-main); margin-top: 2px;">${winnerName}</div>
            ${winnerEmail ? `<div style="font-size: 0.78rem; color: var(--text-muted);">${winnerEmail}</div>` : ''}
          </div>
        </div>

        <div style="background-color: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 10px 14px; font-size: 0.82rem; display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
          <span>Starting Price: ${formatCurrency(art.startingPrice || art.price)}</span>
          <span>Total Bids: ${totalBids}</span>
          <span>Announced: ${announcedAt}</span>
        </div>
      </div>

      <div style="display: flex; gap: 10px;">
        <button onclick="openAdminBidHistoryModal(${art.id})" class="btn btn-outline btn-block">
          View Complete Bid History
        </button>
        <button onclick="closeAdminAuctionModal()" class="btn btn-primary btn-block">
          Close
        </button>
      </div>
    </div>
  `;
  overlay.classList.add('active');
}

// 7. Render Reviews Log
function renderAdminReviewsTable() {
  const tableBody = document.getElementById('adminReviewsTableBody');
  if (!tableBody) return;

  const reviews = getData('reviews', []);

  if (reviews.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No reviews submitted yet.</td></tr>`;
    return;
  }

  tableBody.innerHTML = reviews.map(r => `
    <tr>
      <td>#${r.id}</td>
      <td><strong>${r.artworkName || 'Artwork #' + r.artworkId}</strong></td>
      <td>${r.userName}</td>
      <td><span style="color: #f59e0b; font-weight: 700;">★ ${r.rating} / 5</span></td>
      <td>"${r.comment}"</td>
      <td>
        <button onclick="deleteReviewAdmin(${r.id})" class="btn btn-sm btn-outline" style="color: var(--danger); border-color: var(--danger);">Delete</button>
      </td>
    </tr>
  `).join('');
}

function deleteReviewAdmin(reviewId) {
  if (!confirm('Are you sure you want to remove this review?')) return;
  let reviews = getData('reviews', []);
  reviews = reviews.filter(r => r.id !== reviewId);
  setData('reviews', reviews);
  showToast('Review removed.', 'info');
  renderAdminStats();
  renderAdminReviewsTable();
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initAdminDashboard();
});
