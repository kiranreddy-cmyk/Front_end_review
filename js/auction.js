/**
 * auction.js - Live Auction Hub & User Bidding Simulation
 * Online Art Gallery (ArtLoom) - SDC Project Review-1
 * Strictly Vanilla JavaScript & LocalStorage
 */

// 1. Initialize Auction Hub Page (auction.html)
function initAuctionHub() {
  const auctionGrid = document.getElementById('auctionGrid');
  const activeAuctionsCountEl = document.getElementById('activeAuctionsCount');

  if (!auctionGrid) return;

  const artworks = getData('artworks', []).filter(a => a.type === 'Auction');
  const liveAuctions = artworks.filter(a => (a.auctionStatus || 'LIVE') === 'LIVE');

  if (activeAuctionsCountEl) {
    activeAuctionsCountEl.textContent = `${liveAuctions.length} Live Auctions (${artworks.length} Total Lots)`;
  }

  const currentUser = getCurrentUser();
  const currentRole = getNormalizedRole(currentUser);

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
      const currentHighest = Number(art.currentBid || art.startingPrice || art.price);
      const minNextBid = currentHighest + 1;
      const status = art.auctionStatus || 'LIVE';

      let floatingBadge = `<span class="badge badge-auction artwork-badge-floating">Live Auction</span>`;
      let statusMeta = `<span style="font-size: 0.8rem; color: #d97706; font-weight: 700;">⏱ Live Bidding</span>`;
      let actionAreaHTML = '';

      if (status === 'WINNER ANNOUNCED') {
        floatingBadge = `<span class="badge badge-sale artwork-badge-floating">🏆 Winner Announced</span>`;
        statusMeta = `<span style="font-size: 0.8rem; color: var(--success); font-weight: 700;">✓ Winner Declared</span>`;
        actionAreaHTML = `
          <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(245, 158, 11, 0.08)); border: 1.5px solid var(--success); border-radius: 8px; padding: 12px; margin: 12px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 0.88rem; font-weight: 850; color: #047857;">🏆 AUCTION RESULT</span>
              <span class="badge badge-sale" style="font-size: 0.72rem;">Winner Announced</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.88rem; margin-bottom: 4px;">
              <span style="color: var(--text-muted);">Winning Bid:</span>
              <strong style="color: var(--accent); font-size: 1.2rem;">${formatCurrency(art.winningBid || art.currentBid)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.88rem;">
              <span style="color: var(--text-muted);">Winner:</span>
              <strong style="color: var(--text-main);">${art.winnerName || 'Winner Announced'}</strong>
            </div>
          </div>
          <div style="margin-top: 10px; text-align: center;">
            <a href="artwork-details.html?id=${art.id}" class="btn btn-sm btn-outline btn-block">
              View Auction Result
            </a>
          </div>
        `;
      } else if (status === 'CLOSED') {
        floatingBadge = `<span class="badge artwork-badge-floating" style="background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5;">Auction Closed</span>`;
        statusMeta = `<span style="font-size: 0.8rem; color: #b91c1c; font-weight: 700;">⏱ Closed by Admin</span>`;
        actionAreaHTML = `
          <div style="background-color: var(--surface-alt); padding: 12px; border-radius: 8px; margin: 12px 0; border: 1px solid #fde68a;">
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
              <span style="color: var(--text-muted);">Starting Price:</span>
              <span>${formatCurrency(art.startingPrice || art.price)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <span style="font-size: 0.85rem; color: var(--text-muted);">Final Highest Bid:</span>
              <strong style="color: var(--accent); font-size: 1.2rem;">${formatCurrency(currentHighest)}</strong>
            </div>
            <div style="font-size: 0.8rem; color: #b45309; font-weight: 700; margin-top: 6px; text-align: center;">
              🔒 Auction Closed • Waiting for Winner Announcement
            </div>
          </div>
          <div style="margin-top: 10px; text-align: center;">
            <a href="artwork-details.html?id=${art.id}" class="btn btn-sm btn-outline btn-block">
              View Details
            </a>
          </div>
        `;
      } else {
        // LIVE AUCTION - Role-based controls
        let cardControlsHTML = '';
        if (currentRole === 'artist') {
          // Artist cannot participate in bidding
          cardControlsHTML = `
            <div style="background-color: var(--surface-alt); border: 1px dashed var(--border); border-radius: 6px; padding: 10px; margin: 8px 0; font-size: 0.84rem; color: var(--text-muted); text-align: center;">
              Artists cannot participate in bidding.
            </div>
            <div style="margin-top: 8px; text-align: center;">
              <a href="artwork-details.html?id=${art.id}" class="btn btn-sm btn-outline btn-block">
                View Artwork
              </a>
            </div>
          `;
        } else if (currentRole === 'admin') {
          // Admin manages auctions, does not participate in bidding
          cardControlsHTML = `
            <div style="display: flex; gap: 8px; margin-top: 8px;">
              <a href="artwork-details.html?id=${art.id}" class="btn btn-sm btn-outline btn-block">
                View Bids
              </a>
              <a href="admin-dashboard.html" class="btn btn-sm btn-primary btn-block">
                Admin Panel
              </a>
            </div>
          `;
        } else {
          // Buyer / User (or guest):
          cardControlsHTML = `
            <!-- Quick Bid Form -->
            <form onsubmit="handleQuickBid(event, ${art.id})" style="display: flex; gap: 8px; margin-top: 4px;">
              <input type="number" id="quickBidInput_${art.id}" class="form-control" style="padding: 8px 12px; font-size: 0.9rem;" 
                placeholder="Min ${formatCurrency(minNextBid)}" min="${currentHighest + 1}" required>
              <button type="submit" class="btn btn-sm btn-accent">Bid</button>
            </form>
            <div style="margin-top: 10px; text-align: center;">
              <a href="artwork-details.html?id=${art.id}" style="font-size: 0.88rem; color: var(--text-muted); text-decoration: underline;">
                View Details &amp; Full History
              </a>
            </div>
          `;
        }

        actionAreaHTML = `
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
              Top Bidder: <strong>${art.currentBidder || 'None yet'}</strong>
            </div>
          </div>
          ${cardControlsHTML}
        `;
      }

      return `
        <div class="artwork-card" data-id="${art.id}">
          <div class="artwork-image-wrap">
            <img src="${art.image}" alt="${art.name}" onerror="this.src='images/artworks/artwork-1.svg'">
            ${floatingBadge}
          </div>
          <div class="artwork-body">
            <div class="artwork-meta-row">
              <span class="artwork-category">${art.category}</span>
              ${statusMeta}
            </div>
            <h3 class="artwork-title">
              <a href="artwork-details.html?id=${art.id}">${art.name}</a>
            </h3>
            <p class="artwork-artist">by <a href="artist-profile.html?artist=${encodeURIComponent(art.artist)}">${art.artist}</a></p>
            ${actionAreaHTML}
          </div>
        </div>
      `;
    }).join('');
  }

  // Render My Bids
  renderMyBidsHistory();
}

// Quick Bid Handler on Auction Hub (Strict Buyer/User Validation)
function handleQuickBid(e, artId) {
  if (e && e.preventDefault) e.preventDefault();

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

  const inputEl = document.getElementById(`quickBidInput_${artId}`);
  if (!inputEl) return;

  const newBid = Number(inputEl.value);
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

  // Store in Bids history
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

  showToast(`Bid of ${formatCurrency(newBid)} placed successfully! You are the top bidder.`, 'success');
  initAuctionHub();
}

// Render "My Bids" History Table (Buyer/User only)
function renderMyBidsHistory() {
  const tableBody = document.getElementById('myBidsTableBody');
  const myBidsSection = document.getElementById('myBidsSection');
  if (!tableBody) return;

  const user = getCurrentUser();
  const role = getNormalizedRole(user);
  if (!user || role !== 'user') {
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
    let statusText = 'Outbid';
    let statusBadgeClass = 'badge-category';

    if (art) {
      const artStatus = art.auctionStatus || 'LIVE';
      const isTopBid = art.currentBid === b.bidAmount && (art.currentBidder === user.name || art.currentBidderId === user.id);

      if (artStatus === 'WINNER ANNOUNCED') {
        const isWinner = art.winnerName === user.name || art.winnerUserId === user.id || (art.winnerEmail && art.winnerEmail === user.email);
        if (isWinner) {
          statusText = '🏆 Won Auction';
          statusBadgeClass = 'badge-sale';
        } else {
          statusText = 'Ended (Outbid)';
          statusBadgeClass = 'badge-category';
        }
      } else if (artStatus === 'CLOSED') {
        if (isTopBid) {
          statusText = 'Leading (Closed)';
          statusBadgeClass = 'badge-sale';
        } else {
          statusText = 'Closed (Outbid)';
          statusBadgeClass = 'badge-category';
        }
      } else {
        // LIVE
        if (isTopBid) {
          statusText = 'Leading';
          statusBadgeClass = 'badge-sale';
        } else {
          statusText = 'Outbid';
          statusBadgeClass = 'badge-category';
        }
      }
    }

    return `
      <tr>
        <td>#BID-${b.id}</td>
        <td>
          <a href="artwork-details.html?id=${b.artworkId}" style="font-weight: 700; color: var(--text-main);">
            ${b.artworkName}
          </a>
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
