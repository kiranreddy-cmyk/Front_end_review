/**
 * cart.js - Shopping Cart Drawer, Checkout Simulation & Acquisition Receipt
 * ZENITH Fine Art Gallery & Auction House
 * Pure Vanilla JavaScript & LocalStorage
 */

function getCartItems() {
  const cart = getData('cart', []);
  return Array.isArray(cart) ? cart : [];
}

function updateCartBadges() {
  const count = getCartItems().length;
  document.querySelectorAll('.cart-count-badge').forEach(badge => {
    badge.textContent = count;
    badge.classList.toggle('is-empty', count === 0);
  });
}

function ensureCartDrawerDOM() {
  let overlay = document.getElementById('cartDrawerOverlay');
  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.id = 'cartDrawerOverlay';
  overlay.className = 'cart-drawer-overlay';
  overlay.innerHTML = `
    <div class="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cartDrawerTitle">
      <div class="cart-drawer-header">
        <h3 id="cartDrawerTitle">Acquisition Cart</h3>
        <button type="button" class="modal-close-btn" onclick="closeCartDrawer()" aria-label="Close Cart">&times;</button>
      </div>
      <div class="cart-drawer-body" id="cartDrawerBody"></div>
      <div class="cart-drawer-footer">
        <div style="display: flex; justify-content: space-between; font-size: 0.88rem; color: var(--text-muted); margin-bottom: 6px;">
          <span>Artwork Subtotal</span>
          <strong id="cartSubtotalVal" style="color: #ffffff;">₹0</strong>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.88rem; color: var(--text-muted); margin-bottom: 12px;">
          <span>White-Glove Transport &amp; Insurance</span>
          <strong style="color: var(--success);">Complimentary</strong>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 1.15rem; font-weight: 700; padding-top: 10px; border-top: 1px solid var(--border); margin-bottom: 16px;">
          <span style="color: #ffffff;">Total</span>
          <span id="cartTotalVal" style="color: var(--gold-primary);">₹0</span>
        </div>
        <div style="display: flex; gap: 10px;">
          <button type="button" class="btn btn-outline btn-sm" onclick="clearCart()" id="cartClearBtn">Clear</button>
          <button type="button" class="btn btn-gold btn-block" onclick="openCartCheckoutModal()" id="cartCheckoutBtn">Proceed to Checkout</button>
        </div>
      </div>
    </div>
  `;

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeCartDrawer();
  });

  document.body.appendChild(overlay);
  return overlay;
}

function renderCartDrawer() {
  ensureCartDrawerDOM();
  const body = document.getElementById('cartDrawerBody');
  const subtotalEl = document.getElementById('cartSubtotalVal');
  const totalEl = document.getElementById('cartTotalVal');
  const checkoutBtn = document.getElementById('cartCheckoutBtn');
  const clearBtn = document.getElementById('cartClearBtn');

  if (!body) return;

  const cart = getCartItems();
  updateCartBadges();

  if (cart.length === 0) {
    body.innerHTML = `
      <div class="empty-state" style="margin: 20px 0; padding: 36px 16px;">
        <div class="empty-state-icon">🖼️</div>
        <h3>Your Cart Is Empty</h3>
        <p>Explore the ZENITH collection to curate original paintings for your private space.</p>
        <a href="artworks.html" class="btn btn-sm btn-outline-gold" onclick="closeCartDrawer()">Browse Collection</a>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = formatCurrency(0);
    if (totalEl) totalEl.textContent = formatCurrency(0);
    if (checkoutBtn) checkoutBtn.disabled = true;
    if (clearBtn) clearBtn.disabled = true;
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + Number(item.price || 0), 0);
  if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
  if (totalEl) totalEl.textContent = formatCurrency(subtotal);
  if (checkoutBtn) checkoutBtn.disabled = false;
  if (clearBtn) clearBtn.disabled = false;

  body.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}" onerror="this.src='assets/images/floral-classical-still-life.jpg'">
      <div style="flex: 1; min-width: 0;">
        <div style="font-weight: 700; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          <a href="artwork-details.html?id=${item.artworkId}">${item.name}</a>
        </div>
        <div style="font-size: 0.8rem; color: var(--text-muted);">by ${item.artist}</div>
        <div style="font-weight: 700; color: var(--gold-primary); margin-top: 4px;">${formatCurrency(item.price)}</div>
      </div>
      <button type="button" class="btn btn-sm btn-danger" onclick="removeFromCart(${item.artworkId})" title="Remove">✕</button>
    </div>
  `).join('');
}

function openCartDrawer() {
  renderCartDrawer();
  const overlay = document.getElementById('cartDrawerOverlay');
  if (overlay) overlay.classList.add('active');
}

function closeCartDrawer() {
  const overlay = document.getElementById('cartDrawerOverlay');
  if (overlay) overlay.classList.remove('active');
}

function addToCart(artworkId, openCheckoutImmediately = false) {
  const artworks = getData('artworks', []);
  const art = artworks.find(a => Number(a.id) === Number(artworkId));
  if (!art) {
    showToast('Artwork not found.', 'error');
    return;
  }

  if (art.type === 'Auction') {
    showToast('Auction works are acquired via live bidding on the Auctions page.', 'warning');
    return;
  }

  if (String(art.status).toLowerCase() === 'sold') {
    showToast('This artwork has already been acquired.', 'warning');
    return;
  }

  const cart = getCartItems();
  const exists = cart.some(c => Number(c.artworkId) === Number(art.id));

  if (!exists) {
    cart.push({
      artworkId: art.id,
      name: art.name,
      artist: art.artist,
      category: art.category,
      price: Number(art.price || 0),
      image: art.image
    });
    setData('cart', cart);
    showToast(`Added "${art.name}" to your acquisition cart.`, 'success');
  } else {
    showToast(`"${art.name}" is already in your cart.`, 'info');
  }

  renderCartDrawer();
  if (openCheckoutImmediately) {
    openCartCheckoutModal();
  } else {
    openCartDrawer();
  }
}

function removeFromCart(artworkId) {
  const cart = getCartItems().filter(item => Number(item.artworkId) !== Number(artworkId));
  setData('cart', cart);
  renderCartDrawer();
  showToast('Artwork removed from cart.', 'info');
}

function clearCart() {
  setData('cart', []);
  renderCartDrawer();
  showToast('Acquisition cart cleared.', 'info');
}

function getCartModalOverlay() {
  let overlay = document.getElementById('cartCheckoutOverlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'cartCheckoutOverlay';
    overlay.className = 'modal-overlay';
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeCartCheckoutModal();
    });
    document.body.appendChild(overlay);
  }
  return overlay;
}

function closeCartCheckoutModal() {
  const overlay = document.getElementById('cartCheckoutOverlay');
  if (overlay) overlay.classList.remove('active');
}

function openCartCheckoutModal() {
  const user = getCurrentUser();
  if (!user) {
    closeCartDrawer();
    showToast('Please sign in to complete your acquisition.', 'warning');
    setTimeout(() => { window.location.href = 'login.html'; }, 800);
    return;
  }

  const cart = getCartItems();
  if (cart.length === 0) {
    showToast('Your cart is empty.', 'warning');
    return;
  }

  closeCartDrawer();
  const subtotal = cart.reduce((sum, item) => sum + Number(item.price || 0), 0);

  const overlay = getCartModalOverlay();
  overlay.innerHTML = `
    <div class="modal-card modal-card-lg">
      <div class="modal-header">
        <h3>Secure Artwork Acquisition</h3>
        <button type="button" class="modal-close-btn" onclick="closeCartCheckoutModal()">&times;</button>
      </div>
      <form id="cartCheckoutForm" onsubmit="submitCartCheckout(event)">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px;">
          <div>
            <h4 style="color: var(--gold-primary); font-size: 1rem; margin-bottom: 14px;">Delivery &amp; Provenance Dispatch</h4>
            <div class="form-group">
              <label for="coRecipientName">Recipient Name *</label>
              <input type="text" id="coRecipientName" class="form-control" value="${user.name || ''}" required>
            </div>
            <div class="form-group">
              <label for="coRecipientEmail">Email Address *</label>
              <input type="email" id="coRecipientEmail" class="form-control" value="${user.email || ''}" required>
            </div>
            <div class="form-group">
              <label for="coAddress">Shipping Address *</label>
              <input type="text" id="coAddress" class="form-control" placeholder="Street, City, Postal Code" required>
            </div>
            <div class="form-group" style="margin-bottom: 0;">
              <label for="coPaymentRef">Card Number (Simulated) *</label>
              <input type="text" id="coPaymentRef" class="form-control" placeholder="4242 •••• •••• 4242" value="4242 •••• •••• 4242" required>
            </div>
          </div>

          <div style="background: var(--bg-black); border: 1px solid var(--border-gold); border-radius: var(--radius-md); padding: 20px; display: flex; flex-direction: column;">
            <h4 style="color: var(--gold-primary); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 14px;">Order Summary</h4>
            <div style="flex: 1; display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px;">
              ${cart.map(item => `
                <div style="display: flex; justify-content: space-between; font-size: 0.88rem; border-bottom: 1px solid var(--border); padding-bottom: 8px;">
                  <span style="color: #ffffff;">${item.name}</span>
                  <strong style="color: var(--gold-light);">${formatCurrency(item.price)}</strong>
                </div>
              `).join('')}
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.86rem; color: var(--text-muted); margin-bottom: 6px;">
              <span>White-Glove Courier</span>
              <span style="color: var(--success);">Complimentary</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: 700; border-top: 1px solid var(--border); padding-top: 12px; margin-bottom: 16px;">
              <span style="color: #ffffff;">Total Due</span>
              <span style="color: var(--gold-primary);">${formatCurrency(subtotal)}</span>
            </div>
            <button type="submit" class="btn btn-gold btn-block">Authorize Acquisition</button>
          </div>
        </div>
      </form>
    </div>
  `;
  overlay.classList.add('active');
}

function submitCartCheckout(e) {
  e.preventDefault();
  const user = getCurrentUser();
  if (!user) return;

  const cart = getCartItems();
  if (cart.length === 0) return;

  const recipientName = document.getElementById('coRecipientName').value.trim();
  const recipientEmail = document.getElementById('coRecipientEmail').value.trim();
  const address = document.getElementById('coAddress').value.trim();
  const today = new Date().toISOString().slice(0, 10);

  const purchases = getData('purchases', []);
  const createdOrders = [];

  cart.forEach(item => {
    const newOrder = {
      id: getNextId(purchases),
      userId: user.id,
      userName: recipientName || user.name,
      userEmail: recipientEmail || user.email,
      artworkId: item.artworkId,
      artworkName: item.name,
      artist: item.artist,
      price: Number(item.price || 0),
      date: today,
      image: item.image,
      shippingAddress: address,
      status: 'Confirmed',
      paymentMethod: 'Online Card (Simulated)'
    };
    purchases.push(newOrder);
    createdOrders.push(newOrder);
  });

  setData('purchases', purchases);
  setData('cart', []);
  renderCartDrawer();
  showCertificateModal(createdOrders, address, recipientName, recipientEmail);
  showToast('Acquisition confirmed! Certificate of Authenticity generated.', 'success');
}

function showCertificateModal(orders, address, recipientName, recipientEmail) {
  const overlay = getCartModalOverlay();
  const total = orders.reduce((s, o) => s + Number(o.price || 0), 0);
  const firstOrder = orders[0];

  overlay.innerHTML = `
    <div class="modal-card modal-card-lg">
      <div class="modal-header">
        <h3>Acquisition Receipt &amp; Certificate</h3>
        <button type="button" class="modal-close-btn" onclick="closeCartCheckoutModal()">&times;</button>
      </div>
      <div style="background: var(--bg-black); border: 1px solid var(--border-gold); border-radius: var(--radius-md); padding: 26px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid var(--border); padding-bottom: 16px; margin-bottom: 18px; flex-wrap: wrap; gap: 12px;">
          <div>
            <div class="font-serif" style="font-size: 1.5rem; color: var(--gold-primary); font-weight: 700;">ZENITH FINE ART</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">Curated Gallery &amp; Auction House</div>
          </div>
          <div style="text-align: right;">
            <span class="cert-stamp">VERIFIED ORIGINAL</span>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 8px;">Order Ref: <strong style="color: #ffffff;">#ORD-${firstOrder.id}</strong></div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">Date: ${firstOrder.date}</div>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 0.86rem; margin-bottom: 18px;">
          <div>
            <div style="color: var(--text-muted); text-transform: uppercase; font-size: 0.72rem;">Billed To Collector</div>
            <div style="color: #ffffff; font-weight: 600;">${recipientName}</div>
            <div style="color: var(--text-muted);">${recipientEmail}</div>
          </div>
          <div style="text-align: right;">
            <div style="color: var(--text-muted); text-transform: uppercase; font-size: 0.72rem;">Dispatch Address</div>
            <div style="color: #ffffff;">${address}</div>
          </div>
        </div>

        <div class="table-container" style="margin-bottom: 18px;">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Artwork Title &amp; Artist</th>
                <th style="text-align: right;">Acquisition Value</th>
              </tr>
            </thead>
            <tbody>
              ${orders.map(o => `
                <tr>
                  <td>
                    <strong style="color: #ffffff;">${o.artworkName}</strong>
                    <div style="font-size: 0.8rem; color: var(--text-muted);">by ${o.artist}</div>
                  </td>
                  <td style="text-align: right; color: var(--gold-primary); font-weight: 700;">${formatCurrency(o.price)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 1.15rem; font-weight: 700;">
          <span style="color: #ffffff;">Total Paid</span>
          <span style="color: var(--gold-primary);">${formatCurrency(total)}</span>
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; flex-wrap: wrap;">
        <button type="button" class="btn btn-outline btn-sm" onclick="window.print()">Print Certificate</button>
        <a href="purchases.html" class="btn btn-gold btn-sm">View Order History</a>
      </div>
    </div>
  `;
  overlay.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartBadges();
});
