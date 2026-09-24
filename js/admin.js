/**
 * admin.js - Professional Admin Dashboard & Management Functions
 * Online Art Gallery (ArtVista) - SDC Project Review-1
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
  const totalArtists = users.filter(u => u.role === 'artist').length;
  const totalArtworks = artworks.length;
  const totalPurchases = purchases.length;
  const totalAuctions = artworks.filter(a => a.type === 'Auction').length;
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
  if (elAuctions) elAuctions.textContent = totalAuctions;
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

// 6. Render Auctions Log
function renderAdminAuctionsTable() {
  const tableBody = document.getElementById('adminAuctionsTableBody');
  if (!tableBody) return;

  const artworks = getData('artworks', []).filter(a => a.type === 'Auction');

  if (artworks.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No active auctions found.</td></tr>`;
    return;
  }

  tableBody.innerHTML = artworks.map(art => `
    <tr>
      <td>#${art.id}</td>
      <td><strong>${art.name}</strong></td>
      <td>${art.artist}</td>
      <td>${formatCurrency(art.startingPrice || art.price)}</td>
      <td style="color: var(--accent); font-weight: 800;">${formatCurrency(art.currentBid || art.price)}</td>
      <td>${art.currentBidder || 'None yet'}</td>
      <td>
        <a href="artwork-details.html?id=${art.id}" class="btn btn-sm btn-outline">View Auction</a>
      </td>
    </tr>
  `).join('');
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
