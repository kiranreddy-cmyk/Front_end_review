# Online Art Gallery — ArtVista

**SDC Project Review-1 | Frontend Web Development**

A complete, fully functional, college-level web application designed and built for **SDC Project Review-1**. The platform connects art lovers, collectors, and independent artists within a digital art ecosystem.

---

## 📋 Technology Restrictions Compliance

In strict accordance with the college guidelines:
* **HTML5**: Semantic, accessible markup across 14 pages.
* **CSS3**: Built entirely using **CSS Grid** and **Flexbox** layouts with custom design tokens. No Bootstrap, no Tailwind, and no external CSS libraries.
* **Vanilla JavaScript (ES6+)**: Pure client-side JavaScript for all logic, routing, search, filtering, and CRUD operations. No React, no Vue, no Angular, and no external libraries.
* **Local Storage**: Complete browser-based persistence layer (`localStorage`) handling users, artwork catalogs, purchases, bids, favorites, categories, and reviews.
* **Zero Backend**: Works natively by opening HTML files directly in any modern browser (`file:///` protocol or local web server).

---

## 🎨 Problem Statement & Solution

### The Problem
Traditional art commerce frequently marginalizes emerging artists through prohibitive exhibition costs, high gallery commissions, and lack of accessible digital storefronts. Concurrently, collectors struggle to find verified original art across diverse media (paintings, photography, digital art, sculptures) with transparent pricing and real-time bidding mechanisms.

### The Solution
**ArtVista** is a lightweight, responsive online art gallery web application providing:
1. **Curated Art Discovery**: 8 distinct categories with instant search, category filtering, and sorting.
2. **Collector Ecosystem**: Full purchase simulation, receipt tracking, wishlist favoriting, and critique reviews.
3. **Live Auction Simulation**: Dynamic bidding system with real-time validation and leading/outbid tracking.
4. **Artist Studio**: Dedicated portal for independent artists to showcase and manage their portfolios.
5. **Admin Control Center**: Comprehensive KPI counters, artwork CRUD, user moderation, and transaction logs.

---

## 👥 User Roles & Modules

### 1. Admin Module
* **Access**: Restricted to accounts with role `admin` (`admin-dashboard.html`).
* **KPI Metrics**: Dynamic dashboard cards showing Total Users, Total Artists, Total Artworks, Total Purchases, Total Auctions, Total Reviews, and Platform Sales Volume.
* **Artwork Catalog Management**: Full CRUD capabilities — Add Artwork, Edit Artwork, and Delete Artwork with confirmation.
* **User Management**: Audit registered users and remove accounts.
* **Category Distribution**: Real-time artwork count per category.
* **Audit Logs**: Transaction log for purchases and active auction bidding status.

### 2. User (Collector) Module
* **Access**: Authenticated collectors (`user-dashboard.html`).
* **Personalized Workspace**: Welcome banner, active bid counts, favorite count, and purchase statistics.
* **Purchases & Orders**: "Buy Now" flow with confirmation modal; generates transaction records and displays invoices on `purchases.html`.
* **Wishlist / Favorites**: One-click heart toggle saving artworks to `favorites.html` with remove capability.
* **Live Auction Bidding**: Interactive bid placement with validation (bid must exceed current highest bid) and personal bid history tracking.
* **Community Reviews**: 1–5 star rating submissions and detailed written feedback.

### 3. Artist Module
* **Access**: Exhibiting artists (`artist-dashboard.html`).
* **Artist Studio**: Track my exhibited works, total sales revenue, active auction lots, and collector reviews.
* **Artwork Upload**: Add new creations with medium, category, description, and price pre-assigned to the artist.
* **Catalog Control**: Edit and delete only the artist's own artworks.
* **Public Profile**: Verified artist portfolio showcase (`artist-profile.html`) displaying biography, specialization, and exhibition gallery.

---

## 📁 Project Structure

```text
front_end_review_1/
├── index.html                 # Main Homepage (Hero, Categories, Featured Artworks)
├── login.html                 # Authentication & Quick-Fill Demo Credentials
├── signup.html                # Registration Form with LocalStorage validation
├── admin-dashboard.html       # Administrator Control Panel
├── user-dashboard.html        # Collector User Dashboard
├── artist-dashboard.html      # Artist Studio Workspace
├── artworks.html              # Gallery with Real-time Search & Category Filters
├── artwork-details.html       # Detailed Artwork View, Buy Now modal, Auction & Reviews
├── artist-profile.html        # Public Artist Bio and Artworks Showcase
├── favorites.html             # User Shortlisted Favorites
├── purchases.html             # Transaction History & Order Receipts
├── auction.html               # Live Auction Hub & My Bids tracker
├── reviews.html               # Community Feedback & Review Submission
├── about.html                 # Project Objectives, Architecture & Demo Guide
│
├── css/
│   └── style.css              # Unified CSS3 Design System (CSS Grid & Flexbox)
│
├── js/
│   ├── storage.js             # Local Storage helper & Sample Data Initializer
│   ├── auth.js                # Auth, Role-based Route Protection & Dynamic Navbar
│   ├── artworks.js            # Gallery, Real-time Search, Filters, Buy Modal & Details
│   ├── admin.js               # Admin KPI counters, CRUD Artworks & User moderation
│   ├── artist.js              # Artist Studio stats, My Artworks CRUD & Profile logic
│   ├── user.js                # User Dashboard stats, Favorites & Purchases rendering
│   ├── auction.js             # Live Auction Hub, Bidding Validation & Bid History
│   └── reviews.js             # Review submission, Average rating & Stars renderer
│
├── images/
│   ├── logo.svg               # ArtVista SVG Brand Logo
│   ├── avatar-admin.svg       # Administrator Avatar
│   ├── avatar-user.svg        # Collector Avatar
│   ├── avatar-artist.svg      # Artist Avatar
│   └── artworks/              # 12 Local SVG artworks for 100% offline reliability
│       ├── artwork-1.svg      # Golden Horizon (Landscape / Painting)
│       ├── artwork-2.svg      # Neon Cyber Odyssey (Digital Art)
│       ├── artwork-3.svg      # Soul of the Wild (Photography)
│       ├── artwork-4.svg      # Graphite Elegance (Drawing)
│       ├── artwork-5.svg      # Lady in Saffron (Portrait)
│       ├── artwork-6.svg      # Whispers of the Ocean (Landscape)
│       ├── artwork-7.svg      # Geometric Reverie (Abstract)
│       ├── artwork-8.svg      # Bronze Harmony (Sculpture)
│       ├── artwork-9.svg      # Midnight Serenade (Abstract)
│       ├── artwork-10.svg     # The Old Craftsman (Portrait)
│       ├── artwork-11.svg     # Metropolis Awakening (Digital Art)
│       └── artwork-12.svg     # Marble Flora (Sculpture)
│
└── README.md                  # Project Documentation & SDC Review Guide
```

---

## 🔑 Pre-Configured Sample Login Credentials

When first opened, sample data is automatically seeded into `localStorage`. On `login.html`, one-click **Quick-Fill** buttons are provided for fast evaluator testing.

| Role | Email Address | Password | Landing Page |
|---|---|---|---|
| **Admin** | `admin@artgallery.com` | `admin123` | `admin-dashboard.html` |
| **User (Collector)** | `user@artgallery.com` | `user123` | `user-dashboard.html` |
| **Artist** | `artist@artgallery.com` | `artist123` | `artist-dashboard.html` |

---

## 🚀 How to Run the Application

1. **Clone or Download** this project directory:
   ```bash
   cd front_end_review_1
   ```
2. **Open in Browser**:
   * Double-click `index.html` directly in your file explorer, OR
   * Right-click `index.html` $\rightarrow$ Open With $\rightarrow$ Google Chrome / Microsoft Edge / Mozilla Firefox.
3. **No Setup Required**:
   * No `npm install`, no `node`, no Python server, and no database setup required.
   * All data automatically initializes on first page load.

---

## 🎯 Demonstration Flow for SDC Review-1

Follow this recommended sequence for the examiner/evaluator:

### Phase 1: Visitor Experience & Catalog Exploration
1. Open `index.html`. Observe the **ArtVista** header, hero section, 8 categories, and featured artworks.
2. Click **Gallery** (`artworks.html`).
3. Test **Real-time Search**: Type `Landscape` or `Elena`. Observe real-time filtering without page refresh.
4. Test **Category Filter**: Click `Sculpture` or `Digital Art`.
5. Test **Sorting**: Switch sort order to `Price: Low to High`.
6. Click **View Details** on any artwork (`artwork-details.html`).

### Phase 2: User Sign Up & Purchase Simulation
1. Click **Sign Up** (`signup.html`). Register a new test collector.
2. Or go to **Login** (`login.html`), click `👤 User` Quick-Fill, and click **Sign In**.
3. Arrive at `user-dashboard.html` showing dynamic collector stats.
4. Navigate to `artworks.html`, click the heart icon (♡ $\rightarrow$ ♥) to add to favorites. Open `favorites.html` to verify persistence.
5. Open an artwork marked **For Sale** $\rightarrow$ Click **Buy Now** $\rightarrow$ Confirm modal $\rightarrow$ Navigate to `purchases.html` to view the invoice receipt and total collection value.

### Phase 3: Live Auction Simulation
1. Navigate to `auction.html`.
2. Review current highest bid and top bidder.
3. Enter a bid lower than current: observe the validation error toast.
4. Enter a higher bid and click **Bid**: observe the instant toast confirmation, updated top bidder, and new entry in **My Bids History**.

### Phase 4: Artist Studio Demonstration
1. Click **Logout** $\rightarrow$ Go to `login.html`.
2. Click `🎨 Artist` Quick-Fill $\rightarrow$ Login as `artist@artgallery.com`.
3. Arrive at `artist-dashboard.html`.
4. Click **+ Upload New Artwork** $\rightarrow$ Fill form $\rightarrow$ Submit.
5. Observe the new artwork appear in "My Artwork Catalog" and in the public gallery.
6. Click **View Public Profile** to inspect `artist-profile.html`.

### Phase 5: Administrator Panel Demonstration
1. Click **Logout** $\rightarrow$ Go to `login.html`.
2. Click `👑 Admin` Quick-Fill $\rightarrow$ Login as `admin@artgallery.com`.
3. Arrive at `admin-dashboard.html`. Inspect the 7 dynamic metric cards.
4. Switch to **Manage Artworks** tab: click **Edit** or **Delete** on an artwork.
5. Switch to **Manage Users** tab: observe registered accounts and removal control.
6. Switch to **Purchases Log** & **Auctions Log** to audit all collector activities.

---

## 📊 SDC Requirements Mapping Table

| SDC Requirement | Implementation Details | Status |
|---|---|:---:|
| **1. Online Art Gallery Problem Statement** | Clearly demonstrated through dedicated collector, artist, and admin portals addressing art discovery, direct acquisition, and auction transparency. | ✅ Satisfied |
| **2. Admin and User Modules** | Fully implemented `admin-dashboard.html` and `user-dashboard.html`, supplemented with an `artist-dashboard.html`. | ✅ Satisfied |
| **3. Only HTML, CSS, and Vanilla JavaScript** | 100% zero external dependencies. No React, Angular, Vue, Bootstrap, Tailwind, Node, PHP, or Python. | ✅ Satisfied |
| **4. CSS Grid and Flexbox for UI Layouts** | CSS Grid used for artwork cards, dashboard KPI cards, categories showcase; Flexbox used for navbars, filters, action buttons, and modals. | ✅ Satisfied |
| **5. Signup and Login using Local Storage** | Validated signup form (regex, min length, password match, duplicate email check) storing user objects in `localStorage.users`. Session managed via `localStorage.currentUser`. | ✅ Satisfied |
| **6. Module-wise Navigation & Redirection** | Dynamic JavaScript navigation with page protection (`requireAuth`). Automatic role routing: Admin $\rightarrow$ Admin Dashboard, User $\rightarrow$ User Dashboard, Artist $\rightarrow$ Artist Dashboard. | ✅ Satisfied |
| **7. All Major Functionalities Working** | Real-time search, category filtering, artwork details, Buy Now flow, live auction bidding validation, favorites toggle, reviews with star ratings, and full Admin CRUD. | ✅ Satisfied |
| **8. GitHub-Ready** | Clean directory structure, meaningful naming conventions, git-friendly layout, comprehensive documentation, and local SVG fallbacks for offline evaluation. | ✅ Satisfied |
| **9. Easy to Demonstrate during SDC Review** | Pre-seeded with 12 artworks across all 8 categories, pre-configured demo users, one-click demo credentials fill, and interactive toast feedback. | ✅ Satisfied |

---

## 📜 License & Academic Integrity
Developed by **Kiran Reddy** for **SDC Project Review-1**. All code adheres to the academic guidelines set forth by the evaluation committee.
