/**
 * artist.js - Artist Dashboard, My Artworks CRUD, & Artist Profile Showcase
 * Online Art Gallery (ArtLoom) - SDC Project Review-1
 * Strictly Vanilla JavaScript & LocalStorage
 */

// Route Guard: Ensure Artist Access
function getAuthorizedArtist() {
  return requireAuth(['artist']);
}

// 1. Initialize Artist Dashboard
function initArtistDashboard() {
  const artist = getAuthorizedArtist();
  if (!artist) return;

  // Set greeting
  const greetingEl = document.getElementById('artistGreeting');
  if (greetingEl) {
    greetingEl.textContent = `Welcome, Artist ${artist.name}`;
  }

  // Profile link
  const profileLink = document.getElementById('artistProfileLink');
  if (profileLink) {
    profileLink.href = `artist-profile.html?artist=${encodeURIComponent(artist.name)}`;
  }

  renderArtistStats(artist);
  renderArtistArtworksTable(artist);
}

// Render Artist KPI Stats
function renderArtistStats(artist) {
  const artworks = getData('artworks', []).filter(a => a.artist === artist.name || a.artistId === artist.id);
  const purchases = getData('purchases', []).filter(p => p.artist === artist.name);
  const auctions = artworks.filter(a => a.type === 'Auction');
  
  // Collect reviews for artist's artworks
  const myArtIds = artworks.map(a => a.id);
  const reviews = getData('reviews', []).filter(r => myArtIds.includes(r.artworkId));

  const totalSalesVal = purchases.reduce((sum, p) => sum + Number(p.price || 0), 0);

  const elArtworks = document.getElementById('artistTotalArtworks');
  const elSales = document.getElementById('artistTotalSales');
  const elAuctions = document.getElementById('artistActiveAuctions');
  const elReviews = document.getElementById('artistTotalReviews');

  if (elArtworks) elArtworks.textContent = artworks.length;
  if (elSales) elSales.textContent = formatCurrency(totalSalesVal);
  if (elAuctions) elAuctions.textContent = auctions.length;
  if (elReviews) elReviews.textContent = reviews.length;
}

// Render My Artworks Table
function renderArtistArtworksTable(artist) {
  const tableBody = document.getElementById('artistArtworksTableBody');
  if (!tableBody) return;

  const artworks = getData('artworks', []).filter(a => a.artist === artist.name || a.artistId === artist.id);

  if (artworks.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px;">
          You haven't uploaded any artworks yet. Click "Upload New Artwork" to get started!
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = artworks.map(art => `
    <tr>
      <td>#${art.id}</td>
      <td>
        <img src="${art.image}" alt="${art.name}" class="table-thumb" onerror="this.src='images/artworks/artwork-1.svg'">
      </td>
      <td><strong>${art.name}</strong></td>
      <td><span class="badge badge-category">${art.category}</span></td>
      <td><span class="badge ${art.type === 'Auction' ? 'badge-auction' : 'badge-sale'}">${art.type}</span></td>
      <td><strong>${formatCurrency(art.type === 'Auction' ? (art.currentBid || art.price) : art.price)}</strong></td>
      <td>
        <div style="display: flex; gap: 6px;">
          <button onclick="openArtistEditModal(${art.id})" class="btn btn-sm btn-outline">Edit</button>
          <button onclick="deleteArtistArtwork(${art.id})" class="btn btn-sm btn-danger">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Open Modal to Upload New Artwork for Artist
function openArtistAddModal() {
  const artist = getAuthorizedArtist();
  if (!artist) return;

  let modalOverlay = document.getElementById('artistArtworkModalOverlay');
  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.id = 'artistArtworkModalOverlay';
    modalOverlay.className = 'modal-overlay';
    document.body.appendChild(modalOverlay);
  }

  modalOverlay.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3 style="font-size: 1.3rem; font-weight: 800;">Upload New Artwork</h3>
        <button class="modal-close-btn" onclick="closeArtistArtworkModal()">&times;</button>
      </div>
      <form id="artistAddArtworkForm" onsubmit="handleArtistSaveArtwork(event)">
        <div class="form-group">
          <label>Artwork Name *</label>
          <input type="text" id="artistArtName" class="form-control" required placeholder="e.g. Symphony in Blue">
        </div>
        <div class="form-group">
          <label>Artist Name</label>
          <input type="text" class="form-control" value="${artist.name}" disabled>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div class="form-group">
            <label>Category *</label>
            <select id="artistArtCategory" class="form-control" required>
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
            <select id="artistArtType" class="form-control" required>
              <option value="For Sale">For Sale</option>
              <option value="Auction">Auction</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>Price / Starting Bid (₹) *</label>
          <input type="number" id="artistArtPrice" class="form-control" required min="100" placeholder="e.g. 20000">
        </div>
        <div class="form-group">
          <label>Artwork Image File or URL</label>
          <input type="text" id="artistArtImage" class="form-control" value="images/artworks/artwork-1.svg">
        </div>
        <div class="form-group">
          <label>Description *</label>
          <textarea id="artistArtDesc" class="form-control" rows="3" required placeholder="Describe your concept, medium, and inspiration..."></textarea>
        </div>
        <div style="display: flex; gap: 12px; margin-top: 20px;">
          <button type="button" class="btn btn-outline btn-block" onclick="closeArtistArtworkModal()">Cancel</button>
          <button type="submit" class="btn btn-accent btn-block">Publish Artwork</button>
        </div>
      </form>
    </div>
  `;

  modalOverlay.classList.add('active');
}

// Handle Save Artwork by Artist
function handleArtistSaveArtwork(e) {
  e.preventDefault();
  const artist = getAuthorizedArtist();
  if (!artist) return;

  const artworks = getData('artworks', []);

  const name = document.getElementById('artistArtName').value.trim();
  const category = document.getElementById('artistArtCategory').value;
  const type = document.getElementById('artistArtType').value;
  const price = Number(document.getElementById('artistArtPrice').value);
  const image = document.getElementById('artistArtImage').value.trim() || 'images/artworks/artwork-1.svg';
  const description = document.getElementById('artistArtDesc').value.trim();

  const newArt = {
    id: getNextId(artworks),
    name,
    artist: artist.name,
    artistId: artist.id,
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

  closeArtistArtworkModal();
  showToast('Artwork published successfully!', 'success');
  renderArtistStats(artist);
  renderArtistArtworksTable(artist);
}

// Open Edit Artwork Modal for Artist
function openArtistEditModal(artId) {
  const artist = getAuthorizedArtist();
  if (!artist) return;

  const artworks = getData('artworks', []);
  const art = artworks.find(a => a.id === artId && (a.artist === artist.name || a.artistId === artist.id));
  if (!art) {
    showToast('Artwork not found or unauthorized.', 'error');
    return;
  }

  let modalOverlay = document.getElementById('artistArtworkModalOverlay');
  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.id = 'artistArtworkModalOverlay';
    modalOverlay.className = 'modal-overlay';
    document.body.appendChild(modalOverlay);
  }

  modalOverlay.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3 style="font-size: 1.3rem; font-weight: 800;">Edit Artwork #${art.id}</h3>
        <button class="modal-close-btn" onclick="closeArtistArtworkModal()">&times;</button>
      </div>
      <form id="artistEditForm" onsubmit="handleArtistUpdateArtwork(event, ${art.id})">
        <div class="form-group">
          <label>Artwork Name *</label>
          <input type="text" id="editArtName" class="form-control" required value="${art.name}">
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
          <button type="button" class="btn btn-outline btn-block" onclick="closeArtistArtworkModal()">Cancel</button>
          <button type="submit" class="btn btn-accent btn-block">Save Updates</button>
        </div>
      </form>
    </div>
  `;

  modalOverlay.classList.add('active');
}

// Handle Update Artwork by Artist
function handleArtistUpdateArtwork(e, artId) {
  e.preventDefault();
  const artist = getAuthorizedArtist();
  if (!artist) return;

  const artworks = getData('artworks', []);
  const index = artworks.findIndex(a => a.id === artId && (a.artist === artist.name || a.artistId === artist.id));
  if (index === -1) return;

  artworks[index].name = document.getElementById('editArtName').value.trim();
  artworks[index].category = document.getElementById('editArtCategory').value;
  artworks[index].type = document.getElementById('editArtType').value;
  artworks[index].price = Number(document.getElementById('editArtPrice').value);
  artworks[index].image = document.getElementById('editArtImage').value.trim();
  artworks[index].description = document.getElementById('editArtDesc').value.trim();

  setData('artworks', artworks);
  closeArtistArtworkModal();
  showToast('Artwork updated successfully!', 'success');
  renderArtistStats(artist);
  renderArtistArtworksTable(artist);
}

function closeArtistArtworkModal() {
  const modalOverlay = document.getElementById('artistArtworkModalOverlay');
  if (modalOverlay) modalOverlay.classList.remove('active');
}

// Delete Artwork by Artist
function deleteArtistArtwork(artId) {
  const artist = getAuthorizedArtist();
  if (!artist) return;

  if (!confirm('Are you sure you want to delete this artwork?')) return;

  let artworks = getData('artworks', []);
  artworks = artworks.filter(a => !(a.id === artId && (a.artist === artist.name || a.artistId === artist.id)));
  setData('artworks', artworks);

  showToast('Artwork deleted.', 'info');
  renderArtistStats(artist);
  renderArtistArtworksTable(artist);
}

// 2. Render Public Artist Profile (artist-profile.html)
function initArtistProfilePage() {
  const profileContainer = document.getElementById('artistProfileContainer');
  const directoryContainer = document.getElementById('artistDirectoryGrid');
  if (!profileContainer && !directoryContainer) return;

  const users = getData('users', []);
  const allArtists = users.filter(u => getNormalizedRole(u) === 'artist');

  function getSelectedArtistFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const artistIdQuery = urlParams.get('id');
    const artistNameQuery = urlParams.get('artist');

    if (artistIdQuery) {
      const match = allArtists.find(u => Number(u.id) === Number(artistIdQuery));
      if (match) return match;
    }
    if (artistNameQuery) {
      const match = allArtists.find(u => u.name.toLowerCase() === artistNameQuery.toLowerCase());
      if (match) return match;
    }
    // Default to the first artist (Elena Vance) or fallback
    return allArtists[0] || {
      id: 3,
      name: 'Elena Vance',
      specialization: 'Landscape & Impressionism',
      bio: 'Elena Vance is a contemporary fine artist celebrated for vivid light play, serene natural vistas, and expressive oil paintings.',
      avatar: 'images/avatar-artist.svg'
    };
  }

  function renderDirectory(selectedArtist) {
    if (!directoryContainer) return;

    const allArtworks = getData('artworks', []);

    directoryContainer.innerHTML = allArtists.map(artist => {
      const isSelected = artist.id === selectedArtist.id;
      const count = allArtworks.filter(a => a.artistId === artist.id || a.artist.toLowerCase() === artist.name.toLowerCase()).length;
      return `
        <div class="artist-dir-card ${isSelected ? 'active' : ''}" 
             data-artist-id="${artist.id}" 
             onclick="selectArtistProfile(${artist.id})"
             role="button"
             tabindex="0"
             title="View ${artist.name}'s portfolio">
          <img src="${artist.avatar || 'images/avatar-artist.svg'}" alt="${artist.name}" class="artist-dir-avatar" onerror="this.src='images/avatar-artist.svg'">
          <h4 class="artist-dir-name">${artist.name}</h4>
          <div class="artist-dir-spec">${artist.specialization || 'Fine Artist'}</div>
          <div class="artist-dir-meta">
            <span class="artist-dir-badge">${count} Artworks</span>
            <span style="color: var(--accent); font-weight: 700;">5.0 ★</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderProfileHeroAndArtworks(artistUser) {
    if (!profileContainer) return;

    const artworks = getData('artworks', []).filter(a =>
      a.artistId === artistUser.id || (a.artist && a.artist.toLowerCase() === artistUser.name.toLowerCase())
    );

    profileContainer.innerHTML = `
      <div style="background-color: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 36px; margin-bottom: 40px; box-shadow: var(--shadow-sm);">
        <div style="display: flex; gap: 30px; align-items: center; flex-wrap: wrap;">
          <img src="${artistUser.avatar || 'images/avatar-artist.svg'}" alt="${artistUser.name}" style="width: 110px; height: 110px; border-radius: 50%; object-fit: cover; border: 4px solid var(--accent-light);">
          <div style="flex: 1; min-width: 260px;">
            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
              <h1 style="font-size: 2rem; font-weight: 800; margin: 0;">${artistUser.name}</h1>
              <span class="role-tag role-artist">Verified Master Artist</span>
            </div>
            <p style="color: var(--accent); font-weight: 600; margin: 6px 0 10px; font-size: 1.05rem;">${artistUser.specialization || 'Contemporary Fine Artist'}</p>
            <p style="color: var(--text-muted); max-width: 720px; line-height: 1.6; font-size: 0.96rem;">${artistUser.bio || 'Creating original artworks with deep expression and technique.'}</p>
            <div style="display: flex; gap: 28px; margin-top: 20px; flex-wrap: wrap;">
              <div>
                <strong style="font-size: 1.3rem; color: var(--primary);">${artworks.length}</strong>
                <div style="font-size: 0.82rem; color: var(--text-muted); text-transform: uppercase;">Original Artworks</div>
              </div>
              <div>
                <strong style="font-size: 1.3rem; color: var(--accent);">5.0 ★</strong>
                <div style="font-size: 0.82rem; color: var(--text-muted); text-transform: uppercase;">Collector Rating</div>
              </div>
              <div>
                <strong style="font-size: 1.3rem; color: var(--text-main);">100%</strong>
                <div style="font-size: 0.82rem; color: var(--text-muted); text-transform: uppercase;">Authenticity Verified</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Artist's Gallery Showcase -->
      <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 24px; flex-wrap: wrap; gap: 10px;">
        <h2 style="font-size: 1.6rem; font-weight: 800; margin: 0;">Artworks by ${artistUser.name}</h2>
        <span style="font-size: 0.9rem; color: var(--text-muted); font-weight: 600;">Showing all ${artworks.length} creations</span>
      </div>

      <div class="artwork-grid" id="artistArtworksGrid">
        ${artworks.length > 0 ? artworks.map(createArtworkCardHTML).join('') : `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-state-icon">🎨</div>
            <h3>No Artworks Listed</h3>
            <p>This artist currently has no active artworks in the gallery.</p>
          </div>
        `}
      </div>
    `;
  }

  // Global selector exposed for interactive card clicks
  window.selectArtistProfile = function(artistId, updateHistory = true) {
    const selected = allArtists.find(u => Number(u.id) === Number(artistId));
    if (!selected) return;

    if (updateHistory && window.history && window.history.pushState) {
      const newUrl = `${window.location.pathname}?artist=${encodeURIComponent(selected.name)}`;
      window.history.pushState({ artistId: selected.id, artistName: selected.name }, '', newUrl);
    }

    renderDirectory(selected);
    renderProfileHeroAndArtworks(selected);

    // Smooth scroll to showcase
    if (profileContainer) {
      profileContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Initial load
  const initialArtist = getSelectedArtistFromURL();
  renderDirectory(initialArtist);
  renderProfileHeroAndArtworks(initialArtist);

  // Handle browser back/forward buttons
  window.addEventListener('popstate', () => {
    const artist = getSelectedArtistFromURL();
    renderDirectory(artist);
    renderProfileHeroAndArtworks(artist);
  });
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('artistGreeting')) {
    initArtistDashboard();
  }
  if (document.getElementById('artistProfileContainer') || document.getElementById('artistDirectoryGrid')) {
    initArtistProfilePage();
  }
});
