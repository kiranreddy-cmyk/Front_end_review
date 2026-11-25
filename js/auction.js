/**
 * auction.js - Live Auction Hub, Countdown Timers & Bidding Simulation
 * ZENITH Fine Art Gallery & Auction House
 * Pure Vanilla JavaScript & LocalStorage
 */

let auctionHubTimer = null;

function updateAuctionCountdowns() {
  const elements = document.querySelectorAll('[data-auction-countdown]');
  elements.forEach(el => {
    const endTimeStr = el.getAttribute('data-auction-countdown');
    const diff = new Date(endTimeStr).getTime() - Date.now();
    if (!endTimeStr || isNaN(diff) || diff <= 0) {
      el.innerHTML = `<span class="badge badge-closed">CLOSING SOON</span>`;
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    el.innerHTML = `
      <span class="timer-box">${days}d</span> :
      <span class="timer-box">${String(hours).padStart(2, '0')}h</span> :
      <span class="timer-box">${String(minutes).padStart(2, '0')}m</span> :
      <span class="timer-box gold">${String(seconds).padStart(2, '0')}s</span>
    `;
  });
}

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

  if (artworks.length === 0) {
    auctionGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">🔨</div>
        <h3>No Live Auctions Currently</h3>
        <p>Check back soon for new curated auction lots.</p>
        <a href="artworks.html" class="btn btn-gold">Browse Collection</a>
      </div>
    `;
  } else {
    auctionGrid.innerHTML = artworks.map(art => {
      const currentHighest = Number(art.currentBid || art.startingPrice || art.price);
      const minNextBid = currentHighest + 1;
      const status = art.auctionStatus || 'LIVE';

      let floatingBadge = `<span class="badge badge-live-red artwork-badge-floating">● Live Bidding</span>`;
      let statusMeta = `<span style="font-size: 0.78rem; color: var(--gold-primary); font-weight: 700;">LIVE</span>`;
      let actionAreaHTML = '';

      if (status === 'WINNER ANNOUNCED') {
        floatingBadge = `<span class="badge badge-sale artwork-badge-floating">🏆 Winner Announced</span>`;
        statusMeta = `<span style="font-size: 0.78rem; color: var(--success); font-weight: 700;">Winner Declared</span>`;
        actionAreaHTML = `
          <div style="background: var(--bg-black); border: 1px solid var(--border-gold); border-radius: var(--radius-sm); padding: 12px; margin: 12px 0;">
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
              <span style="color: var(--text-muted);">Winning Bid:</span>
              <strong style="color: var(--gold-primary); font-size: 1.15rem;">${formatCurrency(art.winningBid || art.currentBid)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
              <span style="color: var(--text-muted);">Winner:</span>
              <strong style="color: #ffffff;">${art.winnerName || 'Winner Announced'}</strong>
            </div>
          </div>
          <a href="artwork-details.html?id=${art.id}" class="btn btn-sm btn-outline-gold btn-block" style="margin-top: auto;">View Auction Result</a>
        `;
      } else if (status === 'CLOSED') {
        floatingBadge = `<span class="badge badge-closed artwork-badge-floating">Auction Closed</span>`;
        statusMeta = `<span style="font-size: 0.78rem; color: var(--danger); font-weight: 700;">Closed</span>`;
        actionAreaHTML = `
          <div style="background: var(--bg-black); padding: 12px; border-radius: var(--radius-sm); margin: 12px 0; border: 1px solid var(--border);">
            <div style="display: flex; justify-content: space-between; font-size: 0.84rem; margin-bottom: 4px;">
              <span style="color: var(--text-muted);">Final Highest Bid:</span>
              <strong style="color: var(--gold-primary);">${formatCurrency(currentHighest)}</strong>
            </div>
            <div style="font-size: 0.78rem; color: var(--text-muted); text-align: center; margin-top: 6px;">
              Awaiting Winner Announcement
            </div>
          </div>
          <a href="artwork-details.html?id=${art.id}" class="btn btn-sm btn-outline btn-block" style="margin-top: auto;">View Lot Details</a>
        `;
      } else {
        let cardControlsHTML = '';
        if (currentRole === 'artist') {
          cardControlsHTML = `
            <div style="background: var(--surface-alt); border: 1px dashed var(--border); border-radius: var(--radius-sm); padding: 10px; margin: 8px 0; font-size: 0.82rem; color: var(--text-muted); text-align: center;">
              Artists cannot participate in bidding.
            </div>
            <a href="artwork-details.html?id=${art.id}" class="btn btn-sm btn-outline btn-block">View Artwork</a>
          `;
        } else if (currentRole === 'admin') {
          cardControlsHTML = `
            <div style="display: flex; gap: 8px; margin-top: 8px;">
              <a href="artwork-details.html?id=${art.id}" class="btn btn-sm btn-outline btn-block">View Bids</a>
              <a href="admin-dashboard.html" class="btn btn-sm btn-gold btn-block">Admin Panel</a>
            </div>
          `;
        } else {
          cardControlsHTML = `
            <form onsubmit="handleQuickBid(event, ${art.id})" style="display: flex; gap: 8px; margin-top: 4px;">
              <input type="number" id="quickBidInput_${art.id}" class="form-control" style="padding: 8px 12px; font-size: 0.88rem;" placeholder="Min ${formatCurrency(minNextBid)}" min="${minNextBid}" required>
              <button type="submit" class="btn btn-sm btn-gold">Bid</button>
            </form>
            <div style="margin-top: 10px; text-align: center;">
              <a href="artwork-details.html?id=${art.id}" style="font-size: 0.84rem; color: var(--gold-primary);">View Lot &amp; Full Bid Log →</a>
            </div>
          `;
        }

        actionAreaHTML = `
          <div style="background: var(--bg-black); padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); margin-bottom: 10px; text-align: center;">
            <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px;">Time Remaining</div>
            <div class="auction-countdown" data-auction-countdown="${art.endTime || ''}">Loading...</div>
          </div>
          <div style="background: var(--bg-black); padding: 12px; border-radius: var(--radius-sm); margin-bottom: 12px; border: 1px solid var(--border-gold);">
            <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 4px;">
              <span style="color: var(--text-muted);">Starting Bid:</span>
              <span style="color: #ffffff;">${formatCurrency(art.startingPrice || art.price)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <span style="font-size: 0.82rem; color: var(--text-muted);">Current Highest:</span>
              <strong style="color: var(--gold-primary); font-size: 1.25rem;">${formatCurrency(currentHighest)}</strong>
            </div>
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 4px; text-align: right;">
              Leader: <strong style="color: #ffffff;">${art.currentBidder || 'None yet'}</strong>
            </div>
          </div>
          ${cardControlsHTML}
        `;
      }

      return `
        <article class="artwork-card" data-id="${art.id}">
          <div class="artwork-image-wrap">
            <a href="artwork-details.html?id=${art.id}" style="display: block; width: 100%; height: 100%;">
              <img src="${art.image}" alt="${art.altText || art.name}" loading="lazy" onerror="this.src='assets/images/floral-classical-still-life.jpg'">
            </a>
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
        </article>
      `;
    }).join('');
  }

  updateAuctionCountdowns();
  if (auctionHubTimer) clearInterval(auctionHubTimer);
  auctionHubTimer = setInterval(updateAuctionCountdowns, 1000);

  renderMyBidsHistory();
}

// Quick Bid Handler on Auction Hub
function handleQuickBid(e, artId) {
  if (e && e.preventDefault) e.preventDefault();

  const user = getCurrentUser();
  if (!user) {
    showToast('Please sign in to place bids.', 'warning');
    setTimeout(() => { window.location.href = 'login.html'; }, 900);
    return;
  }

  const role = getNormalizedRole(user);
  if (role !== 'user') {
    showToast('Only registered Collectors can place bids.', 'error');
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

  const inputEl = document.getElementById(`quickBidInput_${artId}`);
  if (!inputEl) return;

  const newBid = Number(inputEl.value);
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
  initAuctionHub();
}

// Render "My Bids" History Table
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
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 24px;">You haven't placed any bids yet.</td></tr>`;
    return;
  }

  const artworks = getData('artworks', []);

  tableBody.innerHTML = bids.slice().reverse().map(b => {
    const art = artworks.find(a => Number(a.id) === Number(b.artworkId));
    let statusText = 'Outbid';
    let statusBadgeClass = 'badge-category';

    if (art) {
      const artStatus = art.auctionStatus || 'LIVE';
      const isTopBid = Number(art.currentBid) === Number(b.bidAmount) && (art.currentBidder === user.name || art.currentBidderId === user.id);

      if (artStatus === 'WINNER ANNOUNCED') {
        const isWinner = art.winnerName === user.name || art.winnerUserId === user.id || (art.winnerEmail && art.winnerEmail === user.email);
        if (isWinner) {
          statusText = '🏆 Won Auction';
          statusBadgeClass = 'badge-sale';
        } else {
          statusText = 'Ended (Outbid)';
        }
      } else if (artStatus === 'CLOSED') {
        statusText = isTopBid ? 'Leading (Closed)' : 'Closed (Outbid)';
        statusBadgeClass = isTopBid ? 'badge-sale' : 'badge-category';
      } else {
        statusText = isTopBid ? 'Leading' : 'Outbid';
        statusBadgeClass = isTopBid ? 'badge-auction' : 'badge-category';
      }
    }

    return `
      <tr>
        <td><code>#BID-${b.id}</code></td>
        <td><a href="artwork-details.html?id=${b.artworkId}" style="font-weight: 700; color: #ffffff;">${b.artworkName}</a></td>
        <td><strong style="color: var(--gold-primary);">${formatCurrency(b.bidAmount)}</strong></td>
        <td>${b.date}</td>
        <td><span class="badge ${statusBadgeClass}">${statusText}</span></td>
      </tr>
    `;
  }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('auctionGrid')) {
    initAuctionHub();
  }
});
