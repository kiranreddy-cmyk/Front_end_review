/**
 * exhibitions.js - Curated Virtual Exhibitions & Salon Viewer
 * ZENITH Fine Art Gallery & Auction House
 * Pure Vanilla JavaScript & LocalStorage
 */

function renderExhibitionsList(containerId = 'exhibitionsGrid', limit = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const exhibitions = getData('exhibitions', []);
  const artworks = getData('artworks', []);
  const list = limit ? exhibitions.slice(0, limit) : exhibitions;

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">🏛️</div>
        <h3>No Exhibitions Currently Open</h3>
        <p>Our curators are preparing the next seasonal showcase.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(exh => {
    const includedArtworks = (exh.artworkIds || [])
      .map(id => artworks.find(a => Number(a.id) === Number(id)))
      .filter(Boolean);

    return `
      <article class="exhibition-card">
        <div class="exhibition-cover-wrapper">
          <img src="${exh.coverImage}" alt="${exh.title}" loading="lazy" onerror="this.src='assets/images/oil-blossom-still-life.jpg'">
          <div class="exhibition-overlay">
            <span class="badge badge-auction" style="align-self: flex-start;">${exh.startDate} – ${exh.endDate}</span>
            <h3>${exh.title}</h3>
          </div>
        </div>
        <div class="exhibition-body">
          <div style="display: flex; justify-content: space-between; align-items: center; gap: 10px; flex-wrap: wrap;">
            <span style="font-size: 0.85rem; color: var(--text-muted);">
              Curated by <strong style="color: #ffffff;">${exh.curator}</strong>
            </span>
            <span class="badge badge-category" style="color: var(--gold-primary);">${includedArtworks.length} Works Included</span>
          </div>
          <p style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.6; flex: 1;">
            ${exh.description}
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 14px; border-top: 1px solid var(--border); gap: 12px;">
            <div class="artwork-avatars-preview">
              ${includedArtworks.slice(0, 4).map(art => `
                <img src="${art.image}" alt="${art.name}" title="${art.name}" onerror="this.src='assets/images/floral-classical-still-life.jpg'">
              `).join('')}
            </div>
            <button type="button" class="btn btn-sm btn-outline-gold" onclick="openExhibitionRoom('${exh.id}')">
              Enter Exhibition Room
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function getExhibitionModalOverlay() {
  let overlay = document.getElementById('exhibitionModalOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'exhibitionModalOverlay';
    overlay.className = 'modal-overlay';
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeExhibitionModal();
    });
    document.body.appendChild(overlay);
  }
  return overlay;
}

function closeExhibitionModal() {
  const overlay = document.getElementById('exhibitionModalOverlay');
  if (overlay) overlay.classList.remove('active');
}

function openExhibitionRoom(exhibitionId) {
  const exhibitions = getData('exhibitions', []);
  const exh = exhibitions.find(e => String(e.id) === String(exhibitionId));
  if (!exh) return;

  const artworks = getData('artworks', []);
  const includedArtworks = (exh.artworkIds || [])
    .map(id => artworks.find(a => Number(a.id) === Number(id)))
    .filter(Boolean);

  const overlay = getExhibitionModalOverlay();
  overlay.innerHTML = `
    <div class="modal-card modal-card-xl">
      <div class="modal-header">
        <div>
          <span class="section-subtitle" style="margin-bottom: 2px;">Virtual Exhibition Hall</span>
          <h3>${exh.title}</h3>
        </div>
        <button type="button" class="modal-close-btn" onclick="closeExhibitionModal()">&times;</button>
      </div>

      <div style="position: relative; border-radius: var(--radius-md); overflow: hidden; height: 220px; margin-bottom: 20px; border: 1px solid var(--border-gold);">
        <img src="${exh.coverImage}" alt="${exh.title}" style="width: 100%; height: 100%; object-fit: cover;">
        <div class="exhibition-overlay">
          <span style="color: var(--gold-primary); font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700;">
            Curated by ${exh.curator}
          </span>
          <div style="color: #ffffff; font-size: 0.9rem;">${exh.startDate} – ${exh.endDate}</div>
        </div>
      </div>

      <p style="color: var(--text-muted); margin-bottom: 24px; line-height: 1.7;">${exh.description}</p>

      <h4 style="color: #ffffff; font-size: 1.3rem; margin-bottom: 16px;">Featured Artworks in This Exhibition</h4>
      <div class="artwork-grid" style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 18px;">
        ${includedArtworks.length === 0 ? `
          <p style="color: var(--text-muted); grid-column: 1 / -1;">No artworks assigned to this exhibition yet.</p>
        ` : includedArtworks.map(art => `
          <div class="artwork-card">
            <div class="artwork-image-wrap" style="height: 175px;">
              <img src="${art.image}" alt="${art.altText || art.name}" onerror="this.src='assets/images/floral-classical-still-life.jpg'">
              <span class="badge ${art.type === 'Auction' ? 'badge-auction' : 'badge-sale'} artwork-badge-floating">${art.type}</span>
            </div>
            <div class="artwork-body" style="padding: 14px;">
              <span class="artwork-category">${art.category}</span>
              <h5 class="artwork-title" style="font-size: 1.05rem;">
                <a href="artwork-details.html?id=${art.id}">${art.name}</a>
              </h5>
              <p class="artwork-artist" style="margin-bottom: 10px;">by ${art.artist}</p>
              <div class="artwork-footer" style="padding-top: 10px;">
                <strong style="color: var(--gold-primary);">${formatCurrency(art.currentBid || art.price)}</strong>
                <a href="artwork-details.html?id=${art.id}" class="btn btn-sm btn-outline-gold">Inspect</a>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  overlay.classList.add('active');
}

function openCreateExhibitionModal() {
  const user = getCurrentUser();
  const role = getNormalizedRole(user);
  if (!user || (role !== 'admin' && role !== 'artist')) {
    showToast('Only Artists and Administrators can inaugurate exhibitions.', 'warning');
    return;
  }

  const artworks = getData('artworks', []);
  const overlay = getExhibitionModalOverlay();
  overlay.innerHTML = `
    <div class="modal-card modal-card-lg">
      <div class="modal-header">
        <h3>Inaugurate Virtual Exhibition</h3>
        <button type="button" class="modal-close-btn" onclick="closeExhibitionModal()">&times;</button>
      </div>
      <form onsubmit="handleCreateExhibition(event)">
        <div class="form-group">
          <label for="newExhTitle">Exhibition Title *</label>
          <input type="text" id="newExhTitle" class="form-control" placeholder="e.g. Nocturnes in Gold & Shadow" required>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px;">
          <div class="form-group">
            <label for="newExhCurator">Curator Name *</label>
            <input type="text" id="newExhCurator" class="form-control" value="${user.name}" required>
          </div>
          <div class="form-group">
            <label for="newExhCover">Cover Image Path / URL *</label>
            <input type="text" id="newExhCover" class="form-control" value="assets/images/oil-blossom-still-life.jpg" required>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div class="form-group">
            <label for="newExhStart">Opening Date *</label>
            <input type="date" id="newExhStart" class="form-control" value="2026-11-25" required>
          </div>
          <div class="form-group">
            <label for="newExhEnd">Closing Date *</label>
            <input type="date" id="newExhEnd" class="form-control" value="2027-01-31" required>
          </div>
        </div>
        <div class="form-group">
          <label for="newExhDesc">Curatorial Statement *</label>
          <textarea id="newExhDesc" class="form-control" rows="3" placeholder="Describe the curatorial concept and artistic dialogue..." required></textarea>
        </div>
        <div class="form-group">
          <label>Select Artworks for Exhibition</label>
          <div style="max-height: 160px; overflow-y: auto; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 12px; background: var(--bg-black); display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 8px;">
            ${artworks.slice(0, 24).map(a => `
              <label style="display: flex; align-items: center; gap: 8px; font-size: 0.84rem; text-transform: none; color: #e5e7eb; cursor: pointer;">
                <input type="checkbox" name="exhArtId" value="${a.id}">
                <span>${a.name}</span>
              </label>
            `).join('')}
          </div>
        </div>
        <div style="display: flex; gap: 12px;">
          <button type="button" class="btn btn-outline btn-block" onclick="closeExhibitionModal()">Cancel</button>
          <button type="submit" class="btn btn-gold btn-block">Launch Exhibition</button>
        </div>
      </form>
    </div>
  `;
  overlay.classList.add('active');
}

function handleCreateExhibition(e) {
  e.preventDefault();
  const title = document.getElementById('newExhTitle').value.trim();
  const curator = document.getElementById('newExhCurator').value.trim();
  const coverImage = document.getElementById('newExhCover').value.trim() || 'assets/images/oil-blossom-still-life.jpg';
  const startDate = document.getElementById('newExhStart').value;
  const endDate = document.getElementById('newExhEnd').value;
  const description = document.getElementById('newExhDesc').value.trim();
  const checked = Array.from(document.querySelectorAll('input[name="exhArtId"]:checked')).map(el => Number(el.value));

  const exhibitions = getData('exhibitions', []);
  exhibitions.unshift({
    id: 'exh-' + Date.now(),
    title,
    curator,
    coverImage,
    startDate,
    endDate,
    description,
    artworkIds: checked,
    featured: true
  });
  setData('exhibitions', exhibitions);
  closeExhibitionModal();
  showToast(`Exhibition "${title}" inaugurated!`, 'success');

  if (document.getElementById('exhibitionsGrid')) {
    renderExhibitionsList('exhibitionsGrid', null);
  }
  if (document.getElementById('homeExhibitionsGrid')) {
    renderExhibitionsList('homeExhibitionsGrid', 2);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('homeExhibitionsGrid')) {
    renderExhibitionsList('homeExhibitionsGrid', 2);
  }
  if (document.getElementById('exhibitionsGrid')) {
    renderExhibitionsList('exhibitionsGrid', null);
  }
});
