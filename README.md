# ZENITH — Fine Art Gallery & Live Auctions

A responsive, multi-page frontend web application for a curated fine art gallery and live auction marketplace, built with semantic HTML5, CSS3 (CSS Grid & Flexbox), Vanilla JavaScript, and browser `localStorage` persistence.

---

## Key Features

- **Curated Fine Art Showcase (`index.html`, `artworks.html`, `artwork-details.html`)**: Browse 50 original paintings across 10 disciplines (*Abstract*, *Oil Painting*, *Watercolor*, *Landscape*, *Nature*, *Portrait*, *Contemporary*, *Modern Art*, *Traditional*, and *Floral*) with real-time search, category filtering, availability filtering, and sorting.
- **Shopping Cart & Checkout Simulation (`js/cart.js`)**: Slide-over acquisition cart drawer available across every page, simulated checkout workflow, order history (`purchases.html`), and printable Acquisition Receipts & Certificates of Authenticity.
- **Live Auctions & Countdown Timers (`auction.html`, `js/auction.js`)**: Timed competitive bidding with live 1-second countdown timers, bid validation, personal bid history, and administrator auction closing & winner declaration controls.
- **Virtual Exhibitions (`exhibitions.html`, `js/exhibitions.js`)**: Curated seasonal exhibition cards with an interactive Exhibition Room viewer modal and exhibition creation support for artists and administrators.
- **Exhibiting Artists & Collector Reviews (`artist-profile.html`, `reviews.html`)**: Resident artist directory, portfolio showcases, and 1–5 star collector critiques.
- **Role-Based Dashboards (`user-dashboard.html`, `artist-dashboard.html`, `admin-dashboard.html`)**: Dedicated portals for Collectors (favorites, purchases, bids), Artists (artwork upload, edit, delete, revenue stats), and Administrators (KPI overview, catalog CRUD, user management, auction moderation, and review moderation).

---

## Security & Local Configuration

Authentication in this frontend project (`js/auth.js` and `js/storage.js`) uses client-side validation and `localStorage` strictly for **frontend demonstration purposes** and **is not production-level security**. A production deployment must implement server-side authentication, password hashing, CSRF protection, and HTTP-only session tokens.

Private local credentials are excluded from version control via `.gitignore`:
1. Copy `js/config.example.js` to `js/config.local.js`.
2. Populate your local administrator and demonstration credentials inside `js/config.local.js`.

---

## Project Structure

- `index.html` — Homepage (Hero spotlight, Browse by Category, Featured Artworks, Live Auction banner, Exhibitions, Footer)
- `artworks.html` — Full artwork catalog with search, category pills, and sorting
- `artwork-details.html` — Artwork provenance, purchase/bidding actions, and critiques
- `auction.html` — Live auctions with real-time countdown timers and bid history
- `exhibitions.html` — Virtual exhibitions hall and room viewer
- `artist-profile.html` — Exhibiting artists directory and individual portfolios
- `favorites.html` — Collector saved favorites wishlist
- `purchases.html` — Order history and acquisition ledger
- `reviews.html` — Community critiques and star ratings
- `about.html` — Gallery mission, curatorial standards, and provenance overview
- `login.html` & `signup.html` — Manual sign-in and account registration
- `user-dashboard.html`, `artist-dashboard.html`, `admin-dashboard.html` — Role-protected portals
- `css/style.css` — Obsidian & Champagne Gold CSS3 stylesheet (CSS Grid & Flexbox)
- `js/` — `storage.js`, `auth.js`, `cart.js`, `artworks.js`, `auction.js`, `exhibitions.js`, `artist.js`, `user.js`, `admin.js`, `reviews.js`
- `assets/images/` — Curated painting images sourced from Unsplash (`IMAGE_CREDITS.md`)
