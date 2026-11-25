/**
 * reviews.js - Reviews & Ratings Module
 * Online Art Gallery (ArtLoom) - SDC Project Review-1
 * Strictly Vanilla JavaScript & LocalStorage
 */

// Helper to generate star HTML string (e.g. ★★★★★)
function getStarRatingHTML(rating) {
  const fullStars = Math.round(Number(rating || 5));
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    stars += i <= fullStars ? '★' : '☆';
  }
  return `<span class="star-rating">${stars}</span>`;
}

// 1. Render Reviews on artwork-details.html
function renderArtworkReviews(artworkId) {
  const reviewsContainer = document.getElementById('artworkReviewsList');
  const reviewCountEl = document.getElementById('artworkReviewCount');
  if (!reviewsContainer) return;

  const reviews = getData('reviews', []).filter(r => r.artworkId === Number(artworkId));

  if (reviewCountEl) {
    reviewCountEl.textContent = `(${reviews.length} Customer Reviews)`;
  }

  if (reviews.length === 0) {
    reviewsContainer.innerHTML = `
      <div style="padding: 24px; text-align: center; color: var(--text-muted); background-color: var(--surface-alt); border-radius: 8px;">
        No reviews yet for this masterpiece. Be the first to share your appreciation!
      </div>
    `;
    return;
  }

  reviewsContainer.innerHTML = reviews.map(r => `
    <div class="review-item-card">
      <div class="review-header">
        <div>
          <strong style="font-size: 1rem;">${r.userName}</strong>
          <span style="color: var(--text-muted); font-size: 0.85rem; margin-left: 8px;">• ${r.date}</span>
        </div>
        <div>${getStarRatingHTML(r.rating)}</div>
      </div>
      <p style="color: var(--text-main); font-size: 0.95rem; margin-top: 6px;">"${r.comment}"</p>
    </div>
  `).join('');
}

// Submit Review for specific Artwork on details page
function submitArtworkReview(e, artworkId) {
  e.preventDefault();
  const user = getCurrentUser();
  if (!user) {
    showToast('Please login to leave a review', 'warning');
    setTimeout(() => { window.location.href = 'login.html'; }, 1000);
    return;
  }

  const commentInput = document.getElementById('reviewCommentInput');
  const ratingInput = document.querySelector('input[name="ratingStar"]:checked');

  if (!commentInput || !commentInput.value.trim()) {
    showToast('Please enter your review comment.', 'error');
    return;
  }

  const rating = ratingInput ? Number(ratingInput.value) : 5;
  const comment = commentInput.value.trim();

  const artworks = getData('artworks', []);
  const art = artworks.find(a => a.id === Number(artworkId));

  const reviews = getData('reviews', []);
  const newReview = {
    id: getNextId(reviews),
    artworkId: Number(artworkId),
    artworkName: art ? art.name : 'Artwork #' + artworkId,
    userId: user.id,
    userName: user.name,
    rating: rating,
    comment: comment,
    date: new Date().toISOString().slice(0, 10)
  };

  reviews.push(newReview);
  setData('reviews', reviews);

  showToast('Thank you! Your review was published.', 'success');
  commentInput.value = '';

  // Re-render reviews
  renderArtworkReviews(artworkId);

  // If on details page, refresh details
  if (typeof initArtworkDetailsPage === 'function') {
    initArtworkDetailsPage();
  }
}

// 2. Initialize Community Reviews Page (reviews.html)
function initReviewsPage() {
  const reviewsFeed = document.getElementById('communityReviewsFeed');
  const artworkSelect = document.getElementById('reviewArtworkSelect');
  if (!reviewsFeed) return;

  const reviews = getData('reviews', []);
  const artworks = getData('artworks', []);

  // Populate Artwork Dropdown in Review Submission Form
  if (artworkSelect) {
    artworkSelect.innerHTML = '<option value="">-- Choose an Artwork --</option>' +
      artworks.map(a => `<option value="${a.id}">${a.name} (by ${a.artist})</option>`).join('');
  }

  // Render Reviews Feed
  if (reviews.length === 0) {
    reviewsFeed.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">✍️</div>
        <h3>No Reviews Yet</h3>
        <p>Submit the first review using the form above!</p>
      </div>
    `;
    return;
  }

  reviewsFeed.innerHTML = reviews.slice().reverse().map(r => `
    <div class="review-item-card" style="margin-bottom: 20px; padding: 22px;">
      <div class="review-header">
        <div>
          <h4 style="font-size: 1.15rem; font-weight: 700; color: var(--primary);">
            <a href="artwork-details.html?id=${r.artworkId}">${r.artworkName || 'Artwork Piece'}</a>
          </h4>
          <span style="color: var(--text-muted); font-size: 0.88rem;">Reviewed by <strong>${r.userName}</strong> on ${r.date}</span>
        </div>
        <div style="font-size: 1.25rem;">${getStarRatingHTML(r.rating)}</div>
      </div>
      <p style="color: var(--text-main); font-size: 1rem; margin-top: 10px; line-height: 1.6;">
        "${r.comment}"
      </p>
    </div>
  `).join('');
}

// Handle Form Submission on reviews.html
function handleGlobalReviewSubmit(e) {
  e.preventDefault();
  const user = getCurrentUser();
  if (!user) {
    showToast('Please login to submit a review', 'warning');
    setTimeout(() => { window.location.href = 'login.html'; }, 1000);
    return;
  }

  const artworkSelect = document.getElementById('reviewArtworkSelect');
  const commentInput = document.getElementById('globalReviewComment');
  const ratingInput = document.querySelector('input[name="globalRatingStar"]:checked');

  if (!artworkSelect || !artworkSelect.value) {
    showToast('Please select an artwork to review.', 'error');
    return;
  }

  if (!commentInput || !commentInput.value.trim()) {
    showToast('Please write a comment.', 'error');
    return;
  }

  const artworkId = Number(artworkSelect.value);
  const artworks = getData('artworks', []);
  const art = artworks.find(a => a.id === artworkId);

  const rating = ratingInput ? Number(ratingInput.value) : 5;
  const comment = commentInput.value.trim();

  const reviews = getData('reviews', []);
  const newReview = {
    id: getNextId(reviews),
    artworkId: artworkId,
    artworkName: art ? art.name : 'Artwork #' + artworkId,
    userId: user.id,
    userName: user.name,
    rating: rating,
    comment: comment,
    date: new Date().toISOString().slice(0, 10)
  };

  reviews.push(newReview);
  setData('reviews', reviews);

  showToast('Your review was published successfully!', 'success');
  commentInput.value = '';
  artworkSelect.value = '';

  initReviewsPage();
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('communityReviewsFeed')) {
    initReviewsPage();
  }
});
