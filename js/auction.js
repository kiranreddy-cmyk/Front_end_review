/**
 * auction.js - Live Auction Hub & User Bidding Simulation
 * Online Art Gallery (ArtLoom) - SDC Project Review-1
 * Strictly Vanilla JavaScript & LocalStorage
 */

// 1. Initialize Auction Hub Page (auction.html)
function initAuctionHub() {
  const auctionGrid = document.getElementById('auctionGrid');
  const myBidsTable = document.getElementById('myBidsTableBody');
  const activeAuctionsCountEl = document.getElementById('activeAuctionsCount');

  if (!auctionGrid) return;

  const artworks = getData('artworks', []).filter(a => a.type === 'Auction');

  if (activeAuctionsCountEl) {
    activeAuctionsCountEl.textContent = `${artworks.length} Live Auctions`;
  }

  // Render Auction Cards
  if (artworks.length === 0) {
    auctionGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">🔨</div>
        <h3>No Live Auctions Currently</h3>
        <p>Check back soon for new curated live auction pieces.</p>
        <a href="artworks.html" class="btn btn-primary">Browse Gallery</a>
      </div>
    `;
  } else {
    auctionGrid.innerHTML = artworks.map(art => {
      const currentHighest = Number(art.currentBid || art.price);
      const minNextBid = currentHighest + 500;
      return `
        <div class="artwork-card" data-id="${art.id}">
          <div class="artwork-image-wrap">
            <img src="${art.image}" alt="${art.name}" onerror="this.src='images/artworks/artwork-1.svg'">
            <span class="badge badge-auction artwork-badge-floating">Live Auction</span>
          </div>
          <div class="artwork-body">
            <div class="artwork-meta-row">
              <span class="artwork-category">${art.category}</span>
              <span style="font-size: 0.8rem; color: #d97706; font-weight: 700;">⏱ Closes Soon</span>
            </div>
            <h3 class="artwork-title">
              <a href="artwork-details.html?id=${art.id}">${art.name}</a>
            </h3>
            <p class="artwork-artist">by <a href="artist-profile.html?artist=${encodeURIComponent(art.artist)}">${art.artist}</a></p>
            
            <div style="background-color: var(--surface-alt); padding: 12px; border-radius: 8px; margin: 12px 0;">
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
                <span style="color: var(--text-muted);">Starting Price:</span>
                <span>${formatCurrency(art.startingPrice || art.price)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <span style="font-size: 0.85rem; color: var(--text-muted);">Current Bid:</span>
                <strong style="color: var(--accent); font-size: 1.3rem;">${formatCurrency(currentHighest)}</strong>
              </div>
              <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 4px; text-align: right;">
                Top Bidder: <strong>${art.currentBidder || 'None'}</strong>
              </div>
            </div>

            <!-- Quick Bid Form -->
            <form onsubmit="handleQuickBid(event, ${art.id})" style="display: flex; gap: 8px; margin-top: 4px;">
              <input type="number" id="quickBidInput_${art.id}" class="form-control" style="padding: 8px 12px; font-size: 0.9rem;" 
                placeholder="₹${minNextBid}+" min="${currentHighest + 1}" required>
              <button type="submit" class="btn btn-sm btn-accent">Bid</button>
            </form>

            <div style="margin-top: 10px; text-align: center;">
              <a href="artwork-details.html?id=${art.id}" style="font-size: 0.88rem; color: var(--text-muted); text-decoration: underline;">
                View Details &amp; Full History
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Render My Bids
  renderMyBidsHistory();
}

// Quick Bid Handler on Auction Hub
function handleQuickBid(e, artId) {
  e.preventDefault();
  const user = getCurrentUser();
  if (!user) {
    showToast('Please login to place bids', 'warning');
    setTimeout(() => { window.location.href = 'login.html'; }, 1000);
    return;
  }

  const inputEl = document.getElementById(`quickBidInput_${artId}`);
  if (!inputEl) return;

  const newBid = Number(inputEl.value);
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

  // Store in Bids history
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

  showToast('Bid placed successfully! You are the top bidder.', 'success');
  initAuctionHub();
}

// Render "My Bids" History Table
function renderMyBidsHistory() {
  const tableBody = document.getElementById('myBidsTableBody');
  const myBidsSection = document.getElementById('myBidsSection');
  if (!tableBody) return;

  const user = getCurrentUser();
  if (!user) {
    if (myBidsSection) myBidsSection.style.display = 'none';
    return;
  }

  if (myBidsSection) myBidsSection.style.display = 'block';

  const bids = getData('bids', []).filter(b => b.userId === user.id);

  if (bids.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 20px;">You haven't placed any bids yet.</td></tr>`;
    return;
  }

  const artworks = getData('artworks', []);

  tableBody.innerHTML = bids.slice().reverse().map(b => {
    const art = artworks.find(a => a.id === b.artworkId);
    const isStillLeading = art && art.currentBid === b.bidAmount && art.currentBidder === user.name;
    const statusText = isStillLeading ? 'Leading' : 'Outbid';
    const statusBadgeClass = isStillLeading ? 'badge-sale' : 'badge-category';

    return `
      <tr>
        <td>#BID-${b.id}</td>
        <td>
          <strong>${b.artworkName}</strong>
        </td>
        <td><strong style="color: var(--accent);">${formatCurrency(b.bidAmount)}</strong></td>
        <td>${b.date}</td>
        <td><span class="badge ${statusBadgeClass}">${statusText}</span></td>
      </tr>
    `;
  }).join('');
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('auctionGrid')) {
    initAuctionHub();
  }
});
