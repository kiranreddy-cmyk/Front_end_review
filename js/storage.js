/**
 * storage.js - Local Storage Abstraction and Sample Data Seeding
 * Online Art Gallery (ArtLoom) - SDC Project Review-1
 * Strictly Vanilla JavaScript & LocalStorage
 */

// Core Storage Utility Functions
function getData(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) return defaultValue;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading key "${key}" from localStorage:`, err);
    return defaultValue;
  }
}

function setData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`Error writing key "${key}" to localStorage:`, err);
    return false;
  }
}

function removeData(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (err) {
    console.error(`Error removing key "${key}" from localStorage:`, err);
    return false;
  }
}

// User-friendly Toast Notification System
function showToast(message, type = 'success') {
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast-item toast-${type}`;

  const iconMap = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  toast.innerHTML = `
    <span class="toast-icon">${iconMap[type] || '•'}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
  `;

  toastContainer.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Auto remove after 3.8 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 300);
  }, 3800);
}

// Format Currency
function formatCurrency(amount) {
  return '₹' + Number(amount || 0).toLocaleString('en-IN');
}

// Generate Next ID for an entity array
function getNextId(array) {
  if (!array || array.length === 0) return 1;
  const max = array.reduce((prev, curr) => (curr.id > prev ? curr.id : prev), 0);
  return max + 1;
}

// Initialize and Seed Sample Data if not present
function initializeSampleData() {
  // 1. Users (Admin, User, Artist)
  if (!localStorage.getItem('users')) {
    const initialUsers = [
      {
        id: 1,
        name: "Admin Administrator",
        email: "gajulashanmendrasai@gmail.com",
        password: "Kiran@2507518",
        role: "admin",
        avatar: "images/avatar-admin.svg",
        createdAt: "2026-01-10"
      },
      {
        id: 2,
        name: "Kiran Reddy",
        email: "user@artgallery.com",
        password: "user123",
        role: "user",
        avatar: "images/avatar-user.svg",
        createdAt: "2026-02-15"
      },
      {
        id: 3,
        name: "Elena Vance",
        email: "artist@artgallery.com",
        password: "artist123",
        role: "artist",
        avatar: "images/avatar-artist.svg",
        specialization: "Landscape & Impressionism",
        bio: "Elena Vance is a contemporary fine artist celebrated for vivid light play, serene natural vistas, and expressive oil paintings. Her works are held in private galleries across the country.",
        createdAt: "2026-01-20"
      },
      {
        id: 4,
        name: "Marcus Sterling",
        email: "marcus@artgallery.com",
        password: "artist123",
        role: "artist",
        avatar: "images/avatar-artist.svg",
        specialization: "Digital Art & Sculpture",
        bio: "Marcus Sterling merges tactile sculpting with generative 3D digital mediums, creating visionary pieces that question space, geometry, and human emotion.",
        createdAt: "2026-02-01"
      },
      {
        id: 5,
        name: "Rahul Sharma",
        email: "rahul@artgallery.com",
        password: "user123",
        role: "user",
        avatar: "images/avatar-user.svg",
        createdAt: "2026-02-20"
      }
    ];
    setData('users', initialUsers);
  }

  // 2. Categories
  if (!localStorage.getItem('categories')) {
    const initialCategories = [
      { id: 1, name: "Painting", description: "Oil, acrylic, and watercolor originals on canvas", icon: "🎨" },
      { id: 2, name: "Digital Art", description: "3D concepts, generative vectors, and digital matte painting", icon: "💻" },
      { id: 3, name: "Photography", description: "Fine art, documentary, and wildlife captures", icon: "📷" },
      { id: 4, name: "Drawing", description: "Charcoal, graphite, and expressive ink drawings", icon: "✏️" },
      { id: 5, name: "Portrait", description: "Evocative human characters, cultural depictions, and profiles", icon: "👤" },
      { id: 6, name: "Landscape", description: "Breathtaking natural horizons, mountains, and seascapes", icon: "🌄" },
      { id: 7, name: "Abstract", description: "Harmonic forms, color psychology, and modern compositions", icon: "🌀" },
      { id: 8, name: "Sculpture", description: "Three-dimensional carved marble, cast bronze, and mixed media", icon: "🗿" }
    ];
    setData('categories', initialCategories);
  }

  // 3. Artworks (12 sample artworks covering all 8 categories)
  if (!localStorage.getItem('artworks')) {
    const initialArtworks = [
      {
        id: 1,
        name: "Golden Horizon",
        artist: "Elena Vance",
        artistId: 3,
        category: "Landscape",
        description: "An evocative oil-on-canvas masterpiece depicting the tranquil golden hour over jagged mountain peaks and reflecting alpine waters.",
        price: 18000,
        type: "For Sale",
        image: "images/artworks/artwork-1.svg",
        featured: true,
        status: "active",
        createdAt: "2026-02-10"
      },
      {
        id: 2,
        name: "Neon Cyber Odyssey",
        artist: "Marcus Sterling",
        artistId: 4,
        category: "Digital Art",
        description: "A visionary 3D rendered futuristic cityscape celebrating vaporwave aesthetics, holographic geometry, and neon cyberpunk architecture.",
        price: 12500,
        startingPrice: 12500,
        currentBid: 14000,
        currentBidder: "Kiran Reddy",
        type: "Auction",
        image: "images/artworks/artwork-2.svg",
        featured: true,
        status: "active",
        createdAt: "2026-02-12"
      },
      {
        id: 3,
        name: "Soul of the Wild",
        artist: "Elena Vance",
        artistId: 3,
        category: "Photography",
        description: "A misty, cinematic wildlife photograph capturing the quiet majesty of a forest stag amid early morning emerald light and gentle bokeh.",
        price: 9800,
        type: "For Sale",
        image: "images/artworks/artwork-3.svg",
        featured: true,
        status: "active",
        createdAt: "2026-02-14"
      },
      {
        id: 4,
        name: "Graphite Elegance",
        artist: "Elena Vance",
        artistId: 3,
        category: "Drawing",
        description: "Masterful cross-hatch charcoal and graphite study of an Arabian stallion in motion, capturing muscular tension and dynamic energy.",
        price: 6500,
        type: "For Sale",
        image: "images/artworks/artwork-4.svg",
        featured: false,
        status: "active",
        createdAt: "2026-02-16"
      },
      {
        id: 5,
        name: "Lady in Saffron",
        artist: "Elena Vance",
        artistId: 3,
        category: "Portrait",
        description: "A poignant portrait capturing a serene woman adorned in flowing saffron silk drapery with intricate gold ornaments against deep chiaroscuro.",
        price: 22000,
        startingPrice: 22000,
        currentBid: 25000,
        currentBidder: "Kiran Reddy",
        type: "Auction",
        image: "images/artworks/artwork-5.svg",
        featured: true,
        status: "active",
        createdAt: "2026-02-18"
      },
      {
        id: 6,
        name: "Whispers of the Ocean",
        artist: "Elena Vance",
        artistId: 3,
        category: "Landscape",
        description: "An impressionist coastal scene depicting powerful cerulean ocean swells cresting into luminous sea-foam along a sun-drenched shore.",
        price: 15000,
        type: "For Sale",
        image: "images/artworks/artwork-6.svg",
        featured: false,
        status: "active",
        createdAt: "2026-02-20"
      },
      {
        id: 7,
        name: "Geometric Reverie",
        artist: "Marcus Sterling",
        artistId: 4,
        category: "Abstract",
        description: "Constructivist vector abstract piece exploring color psychology, bold architectural arches, vibrant teal planes, and balance.",
        price: 11000,
        startingPrice: 11000,
        currentBid: 13500,
        currentBidder: "Art Collector",
        type: "Auction",
        image: "images/artworks/artwork-7.svg",
        featured: false,
        status: "active",
        createdAt: "2026-02-22"
      },
      {
        id: 8,
        name: "Bronze Harmony",
        artist: "Marcus Sterling",
        artistId: 4,
        category: "Sculpture",
        description: "Cast bronze infinity ribbon sculpture with polished golden patinas, mounted on an authentic honed volcanic slate plinth.",
        price: 35000,
        type: "For Sale",
        image: "images/artworks/artwork-8.svg",
        featured: true,
        status: "active",
        createdAt: "2026-02-25"
      },
      {
        id: 9,
        name: "Midnight Serenade",
        artist: "Elena Vance",
        artistId: 3,
        category: "Abstract",
        description: "Expressive lyrical brushstrokes of royal violet, turquoise, and gold leaf evoking the rhythmic harmony of midnight orchestral jazz.",
        price: 19500,
        type: "For Sale",
        image: "images/artworks/artwork-9.svg",
        featured: false,
        status: "active",
        createdAt: "2026-02-27"
      },
      {
        id: 10,
        name: "The Old Craftsman",
        artist: "Marcus Sterling",
        artistId: 4,
        category: "Portrait",
        description: "Documentary fine art photograph exploring age, generational wisdom, and craftsmanship inside a heritage woodcarver's sunlit workshop.",
        price: 8900,
        type: "For Sale",
        image: "images/artworks/artwork-10.svg",
        featured: false,
        status: "active",
        createdAt: "2026-03-01"
      },
      {
        id: 11,
        name: "Metropolis Awakening",
        artist: "Marcus Sterling",
        artistId: 4,
        category: "Digital Art",
        description: "A sweeping digital panoramic matte capturing a bustling glass-and-steel megalopolis as the dawn sun emerges over harbor waters.",
        price: 16000,
        startingPrice: 16000,
        currentBid: 18000,
        currentBidder: "Urban Collector",
        type: "Auction",
        image: "images/artworks/artwork-11.svg",
        featured: false,
        status: "active",
        createdAt: "2026-03-04"
      },
      {
        id: 12,
        name: "Marble Flora",
        artist: "Marcus Sterling",
        artistId: 4,
        category: "Sculpture",
        description: "Hand-chiseled organic botanical form in genuine Carrara white marble, featuring translucent delicate curves and soft light interplay.",
        price: 42000,
        startingPrice: 42000,
        currentBid: 45000,
        currentBidder: "Gallery Sovereign",
        type: "Auction",
        image: "images/artworks/artwork-12.svg",
        featured: true,
        status: "active",
        createdAt: "2026-03-06"
      },
      {
        id: 13,
        name: "Sunset Dreams",
        artist: "Elena Vance",
        artistId: 3,
        category: "Painting",
        description: "A breathtaking impressionist sunset panorama over coastal dunes and glowing tidal waters, blending vivid amber, crimson, and lavender hues.",
        price: 5000,
        startingPrice: 5000,
        currentBid: 5000,
        currentBidder: "None yet",
        bidsCount: 0,
        type: "Auction",
        auctionStatus: "LIVE",
        image: "images/artworks/artwork-1.svg",
        featured: true,
        status: "active",
        createdAt: "2026-03-08"
      }
    ];
    setData('artworks', initialArtworks);
  }

  // 4. Purchases
  if (!localStorage.getItem('purchases')) {
    const initialPurchases = [
      {
        id: 1,
        userId: 2,
        userName: "Kiran Reddy",
        artworkId: 1,
        artworkName: "Golden Horizon",
        artist: "Elena Vance",
        price: 18000,
        date: "2026-03-10",
        image: "images/artworks/artwork-1.svg",
        status: "Confirmed",
        paymentMethod: "Online Card (Simulated)"
      }
    ];
    setData('purchases', initialPurchases);
  }

  // 5. Favorites
  if (!localStorage.getItem('favorites')) {
    // Stored as an object: { [userId]: [artworkId, artworkId, ...] }
    const initialFavorites = {
      "2": [1, 3, 5]
    };
    setData('favorites', initialFavorites);
  }

  // 6. Bids History
  if (!localStorage.getItem('bids')) {
    const initialBids = [
      {
        id: 1,
        artworkId: 2,
        artworkName: "Neon Cyber Odyssey",
        userId: 2,
        userName: "Kiran Reddy",
        userEmail: "user@artgallery.com",
        bidAmount: 14000,
        date: "2026-03-15 14:30",
        status: "Leading"
      },
      {
        id: 2,
        artworkId: 5,
        artworkName: "Lady in Saffron",
        userId: 2,
        userName: "Kiran Reddy",
        userEmail: "user@artgallery.com",
        bidAmount: 25000,
        date: "2026-03-18 10:15",
        status: "Leading"
      },
      {
        id: 3,
        artworkId: 7,
        artworkName: "Geometric Reverie",
        userId: 1,
        userName: "Art Collector",
        userEmail: "collector@artgallery.com",
        bidAmount: 13500,
        date: "2026-03-19 16:45",
        status: "Leading"
      },
      {
        id: 4,
        artworkId: 11,
        artworkName: "Metropolis Awakening",
        userId: 1,
        userName: "Urban Collector",
        userEmail: "urban@artgallery.com",
        bidAmount: 18000,
        date: "2026-03-19 18:20",
        status: "Leading"
      },
      {
        id: 5,
        artworkId: 12,
        artworkName: "Marble Flora",
        userId: 1,
        userName: "Gallery Sovereign",
        userEmail: "sovereign@artgallery.com",
        bidAmount: 45000,
        date: "2026-03-20 11:00",
        status: "Leading"
      }
    ];
    setData('bids', initialBids);
    setData('auctionBids', initialBids);
  }

  // 7. Reviews
  if (!localStorage.getItem('reviews')) {
    const initialReviews = [
      {
        id: 1,
        artworkId: 1,
        artworkName: "Golden Horizon",
        userId: 2,
        userName: "Kiran Reddy",
        rating: 5,
        comment: "Absolutely breathtaking texture and warm tones. Transforms the ambience of the entire room!",
        date: "2026-03-12"
      },
      {
        id: 2,
        artworkId: 3,
        artworkName: "Soul of the Wild",
        userId: 2,
        userName: "Kiran Reddy",
        rating: 5,
        comment: "The depth and atmospheric lighting in this wildlife photograph are truly world-class.",
        date: "2026-03-14"
      },
      {
        id: 3,
        artworkId: 5,
        artworkName: "Lady in Saffron",
        userId: 1,
        userName: "Art Connoisseur",
        rating: 4,
        comment: "Vibrant and evocative portraiture. The saffron drapery folds are painted with masterful finesse.",
        date: "2026-03-16"
      },
      {
        id: 4,
        artworkId: 8,
        artworkName: "Bronze Harmony",
        userId: 2,
        userName: "Kiran Reddy",
        rating: 5,
        comment: "The metallic sheen and graceful curves make it an incredible focal point.",
        date: "2026-03-17"
      }
    ];
    setData('reviews', initialReviews);
  }

  // 8. Auction Results Store
  if (!localStorage.getItem('auctionResults')) {
    setData('auctionResults', []);
  }

  // 9. Retro-compatibility & Sync for Live Storage
  try {
    // Sync auctionBids key
    if (!localStorage.getItem('auctionBids')) {
      setData('auctionBids', getData('bids', []));
    }

    // Ensure default admin user and secondary user (Rahul Sharma) exist in users
    const currentUsers = getData('users', []);
    if (currentUsers && currentUsers.length > 0) {
      let usersModified = false;
      const adminUser = currentUsers.find(u => (u.role || '').toLowerCase() === 'admin');
      if (adminUser) {
        if (adminUser.email !== 'gajulashanmendrasai@gmail.com' || adminUser.password !== 'Kiran@2507518') {
          adminUser.email = 'gajulashanmendrasai@gmail.com';
          adminUser.password = 'Kiran@2507518';
          usersModified = true;
        }
      } else {
        currentUsers.unshift({
          id: 1,
          name: "Admin Administrator",
          email: "gajulashanmendrasai@gmail.com",
          password: "Kiran@2507518",
          role: "admin",
          avatar: "images/avatar-admin.svg",
          createdAt: "2026-01-10"
        });
        usersModified = true;
      }

      if (!currentUsers.some(u => u.email === 'rahul@artgallery.com')) {
        currentUsers.push({
          id: 5,
          name: "Rahul Sharma",
          email: "rahul@artgallery.com",
          password: "user123",
          role: "user",
          avatar: "images/avatar-user.svg",
          createdAt: "2026-02-20"
        });
        usersModified = true;
      }

      if (usersModified) {
        setData('users', currentUsers);
      }
    }

    // Ensure Sunset Dreams and auctionStatus exist in artworks
    const currentArtworks = getData('artworks', []);
    let artworksModified = false;
    if (currentArtworks && currentArtworks.length > 0) {
      if (!currentArtworks.some(a => a.name === 'Sunset Dreams')) {
        currentArtworks.push({
          id: 13,
          name: "Sunset Dreams",
          artist: "Elena Vance",
          artistId: 3,
          category: "Painting",
          description: "A breathtaking impressionist sunset panorama over coastal dunes and glowing tidal waters, blending vivid amber, crimson, and lavender hues.",
          price: 5000,
          startingPrice: 5000,
          currentBid: 5000,
          currentBidder: "None yet",
          bidsCount: 0,
          type: "Auction",
          auctionStatus: "LIVE",
          image: "images/artworks/artwork-1.svg",
          featured: true,
          status: "active",
          createdAt: "2026-03-08"
        });
        artworksModified = true;
      }

      currentArtworks.forEach(art => {
        if (art.type === 'Auction') {
          if (!art.auctionStatus) {
            art.auctionStatus = 'LIVE';
            artworksModified = true;
          }
          if (art.startingPrice === undefined) {
            art.startingPrice = art.price;
            artworksModified = true;
          }
        }
      });

      if (artworksModified) {
        setData('artworks', currentArtworks);
      }
    }

    // Ensure all bids have userEmail
    const currentBids = getData('bids', []);
    let bidsModified = false;
    if (currentBids && currentBids.length > 0) {
      currentBids.forEach(b => {
        if (!b.userEmail) {
          const userObj = (currentUsers || []).find(u => u.id === b.userId);
          b.userEmail = userObj ? userObj.email : 'user@artgallery.com';
          bidsModified = true;
        }
      });
      if (bidsModified) {
        setData('bids', currentBids);
        setData('auctionBids', currentBids);
      }
    }
  } catch (syncErr) {
    console.warn("Storage sync check warning:", syncErr);
  }
}

// Auction Storage Helper Functions
function getAuctionBids(artworkId = null) {
  const bids = getData('bids', getData('auctionBids', []));
  if (!artworkId) return bids;
  return bids.filter(b => Number(b.artworkId) === Number(artworkId));
}

function saveAuctionBid(bidRecord) {
  const bids = getData('bids', []);
  bids.push(bidRecord);
  setData('bids', bids);
  setData('auctionBids', bids);
  return bids;
}

function getAuctionResults() {
  return getData('auctionResults', []);
}

function getAuctionResult(artworkId) {
  const results = getData('auctionResults', []);
  return results.find(r => Number(r.artworkId) === Number(artworkId)) || null;
}

function saveAuctionResult(resultRecord) {
  const results = getData('auctionResults', []);
  const index = results.findIndex(r => Number(r.artworkId) === Number(resultRecord.artworkId));
  if (index > -1) {
    results[index] = { ...results[index], ...resultRecord };
  } else {
    results.push(resultRecord);
  }
  setData('auctionResults', results);
  return results;
}

// Automatically seed sample data on first load
initializeSampleData();
