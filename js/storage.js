/**
 * storage.js - Local Storage Abstraction, Sample Data & Safe Migration
 * ZENITH Fine Art Gallery & Auction House
 * Pure Vanilla JavaScript & LocalStorage
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

// Toast Notification System
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
    <button type="button" class="toast-close" onclick="this.parentElement.remove()" aria-label="Close">&times;</button>
  `;

  toastContainer.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 300);
  }, 3800);
}

// Format Currency (INR)
function formatCurrency(amount) {
  return '₹' + Number(amount || 0).toLocaleString('en-IN');
}

// Generate Next ID for an entity array
function getNextId(array) {
  if (!array || array.length === 0) return 1;
  const max = array.reduce((prev, curr) => (Number(curr.id) > prev ? Number(curr.id) : prev), 0);
  return max + 1;
}

// Helper for future/past ISO timestamps (used by auction countdown timers)
function offsetHoursISO(hoursOffset) {
  return new Date(Date.now() + hoursOffset * 3600 * 1000).toISOString();
}

// Initialize and Seed Sample Data & Perform Safe Credential/Image Migration
function initializeSampleData() {
  const localCfg = (typeof window !== 'undefined' && window.ZENITH_LOCAL_CONFIG) ? window.ZENITH_LOCAL_CONFIG : {};
  const localAdmin = localCfg.admin || {};
  const localUserPassword = String(localCfg.demoUserPassword || '');
  const localArtistPassword = String(localCfg.demoArtistPassword || '');

  // 1. Initial Users (Admin, Collectors, and 10 Resident Artists)
  // Note: Private credentials are loaded locally from gitignored js/config.local.js for demonstration only.
  const initialUsers = [
    {
      id: 1,
      name: "Gallery Administrator",
      email: localAdmin.email || "admin@zenith-gallery.local",
      password: localAdmin.password || "",
      role: "admin",
      avatar: "images/avatar-admin.svg",
      createdAt: "2026-01-10"
    },
    {
      id: 2,
      name: "Kiran Reddy",
      email: "user@artgallery.com",
      password: localUserPassword,
      role: "user",
      avatar: "images/avatar-user.svg",
      createdAt: "2026-02-15"
    },
    {
      id: 3,
      name: "Elena Vance",
      email: "artist@artgallery.com",
      password: localArtistPassword,
      role: "artist",
      avatar: "images/avatar-artist.svg",
      specialization: "Landscape & Oil Painting",
      bio: "Elena Vance is celebrated for luminous oil landscapes, maritime horizons, and atmospheric light on Belgian linen.",
      createdAt: "2026-01-20"
    },
    {
      id: 4,
      name: "Marcus Sterling",
      email: "marcus@artgallery.com",
      password: localArtistPassword,
      role: "artist",
      avatar: "images/avatar-artist.svg",
      specialization: "Abstract & Modern Art",
      bio: "Marcus Sterling explores bold constructivist geometry, monochrome contrasts, and vibrant impasto color planes.",
      createdAt: "2026-02-01"
    },
    {
      id: 5,
      name: "Rahul Sharma",
      email: "rahul@artgallery.com",
      password: localUserPassword,
      role: "user",
      avatar: "images/avatar-user.svg",
      createdAt: "2026-02-20"
    },
    {
      id: 6,
      name: "Sophia Bennett",
      email: "sophia@artgallery.com",
      password: localArtistPassword,
      role: "artist",
      avatar: "images/avatar-artist.svg",
      specialization: "Nature & Watercolor Painting",
      bio: "Sophia Bennett captures tranquil woodlands, highland fauna, and translucent watercolor meadows.",
      createdAt: "2026-02-05"
    },
    {
      id: 7,
      name: "Daniel Carter",
      email: "daniel@artgallery.com",
      password: localArtistPassword,
      role: "artist",
      avatar: "images/avatar-artist.svg",
      specialization: "Classical & Contemporary Portraits",
      bio: "Daniel Carter creates deeply expressive figurative portraits studying light, drapery, and quiet human poise.",
      createdAt: "2026-02-08"
    },
    {
      id: 8,
      name: "Olivia Morgan",
      email: "olivia@artgallery.com",
      password: localArtistPassword,
      role: "artist",
      avatar: "images/avatar-artist.svg",
      specialization: "Contemporary & Abstract Art",
      bio: "Olivia Morgan composes large-scale contemporary and abstract works driven by chromatic energy and fluid gesture.",
      createdAt: "2026-02-12"
    },
    {
      id: 9,
      name: "Arjun Mehta",
      email: "arjun@artgallery.com",
      password: localArtistPassword,
      role: "artist",
      avatar: "images/avatar-artist.svg",
      specialization: "Traditional & Heritage Painting",
      bio: "Arjun Mehta preserves classical architectural frescoes, historical narratives, and traditional painterly mastery.",
      createdAt: "2026-02-15"
    },
    {
      id: 10,
      name: "Maya Anderson",
      email: "maya@artgallery.com",
      password: localArtistPassword,
      role: "artist",
      avatar: "images/avatar-artist.svg",
      specialization: "Floral & Still Life Oil Painting",
      bio: "Maya Anderson paints heirloom botanical still lifes and lush floral arrangements with rich oil glazes.",
      createdAt: "2026-02-18"
    },
    {
      id: 11,
      name: "Ethan Williams",
      email: "ethan@artgallery.com",
      password: localArtistPassword,
      role: "artist",
      avatar: "images/avatar-artist.svg",
      specialization: "Modern Art & Color Studies",
      bio: "Ethan Williams investigates organic modernist forms, rhythmic color blocks, and contemporary minimalism.",
      createdAt: "2026-02-22"
    },
    {
      id: 12,
      name: "Isabella Rossi",
      email: "isabella@artgallery.com",
      password: localArtistPassword,
      role: "artist",
      avatar: "images/avatar-artist.svg",
      specialization: "Watercolor & Botanical Art",
      bio: "Isabella Rossi blends delicate cold-pressed watercolor washes with lyrical pastoral and floral compositions.",
      createdAt: "2026-02-25"
    },
    {
      id: 13,
      name: "Noah Thompson",
      email: "noah@artgallery.com",
      password: localArtistPassword,
      role: "artist",
      avatar: "images/avatar-artist.svg",
      specialization: "Contemporary & Oil Studies",
      bio: "Noah Thompson bridges luminous contemporary brushwork with timeless maritime and horizon studies.",
      createdAt: "2026-03-01"
    }
  ];

  // 2. Categories (10 Curated Painting Varieties)
  const initialCategories = [
    { id: 1, name: "Abstract", description: "Expressive brushstrokes, layered forms, and chromatic abstractions", icon: "🌀" },
    { id: 2, name: "Oil Painting", description: "Richly glazed oil originals on stretched canvas and Belgian linen", icon: "🎨" },
    { id: 3, name: "Watercolor", description: "Translucent pigment washes and luminous paper compositions", icon: "💧" },
    { id: 4, name: "Landscape", description: "Alpine peaks, river vistas, and dramatic coastal horizons", icon: "🌄" },
    { id: 5, name: "Nature", description: "Woodland sanctuaries, wildlife studies, and organic serenity", icon: "🌿" },
    { id: 6, name: "Portrait", description: "Expressive figurative portraits capturing character and grace", icon: "👤" },
    { id: 7, name: "Contemporary", description: "Dynamic modern voices exploring bold light and movement", icon: "✨" },
    { id: 8, name: "Modern Art", description: "Constructivist geometry, organic shapes, and avant-garde color", icon: "🔶" },
    { id: 9, name: "Traditional", description: "Classical frescoes, heritage scenes, and timeless mastery", icon: "🏛️" },
    { id: 10, name: "Floral", description: "Heirloom botanical bouquets and luminous floral still lifes", icon: "🌸" }
  ];

  // 3. 50 Sample Artworks (Every image uniquely sourced from Unsplash paintings in assets/images/)
  const initialArtworks = [
    // --- Elena Vance (Artist ID: 3) ---
    {
      id: 1,
      name: "Alpine Waters at Dusk",
      artist: "Elena Vance",
      artistId: 3,
      category: "Landscape",
      medium: "Oil on Belgian Linen",
      dimensions: "36 x 48 in",
      year: "2025",
      description: "Luminous mountain peaks mirrored in tranquil alpine waters as evening amber light settles across the valley.",
      price: 18500,
      type: "For Sale",
      image: "assets/images/landscape-alpine-waters.jpg",
      altText: "Painting of mountains near a calm body of water",
      featured: true,
      status: "active",
      isSample: true,
      createdAt: "2026-02-10"
    },
    {
      id: 2,
      name: "Voyage Through Twilight",
      artist: "Elena Vance",
      artistId: 3,
      category: "Oil Painting",
      medium: "Oil on Canvas",
      dimensions: "30 x 40 in",
      year: "2025",
      description: "Classical maritime oil painting depicting a tall-masted sailing ship cutting across deep slate-blue ocean swells.",
      price: 22000,
      type: "For Sale",
      image: "assets/images/oil-sail-ship-sea.jpg",
      altText: "Oil painting of a brown and white sail ship on open sea",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-02-14"
    },
    {
      id: 3,
      name: "River Crossing at Dawn",
      artist: "Elena Vance",
      artistId: 3,
      category: "Landscape",
      medium: "Oil on Panel",
      dimensions: "24 x 36 in",
      year: "2025",
      description: "Figures ferrying across a misty river beneath warm morning clouds, painted with soft atmospheric brushwork.",
      price: 19500,
      type: "For Sale",
      image: "assets/images/landscape-river-boat.jpg",
      altText: "Landscape painting of figures in a boat on a river",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-02-18"
    },
    {
      id: 4,
      name: "Golden Wheat Harvest",
      artist: "Elena Vance",
      artistId: 3,
      category: "Oil Painting",
      medium: "Oil on Linen",
      dimensions: "32 x 44 in",
      year: "2026",
      description: "Sun-warmed haystacks rising over a sweeping golden wheat field under a pale countryside sky.",
      price: 22000,
      startingPrice: 22000,
      currentBid: 25000,
      currentBidder: "Kiran Reddy",
      bidsCount: 2,
      type: "Auction",
      auctionStatus: "LIVE",
      endTime: offsetHoursISO(52),
      image: "assets/images/oil-golden-wheatfield.jpg",
      altText: "Oil painting of a golden wheat field with haystacks",
      featured: true,
      status: "active",
      isSample: true,
      createdAt: "2026-02-22"
    },
    {
      id: 5,
      name: "Highland Lake Passage",
      artist: "Elena Vance",
      artistId: 3,
      category: "Landscape",
      medium: "Oil on Canvas",
      dimensions: "28 x 38 in",
      year: "2025",
      description: "A solitary wooden boat gliding across crystalline blue lake waters below snow-crowned mountain peaks.",
      price: 15000,
      startingPrice: 15000,
      currentBid: 18500,
      winningBid: 18500,
      winnerName: "Kiran Reddy",
      winnerEmail: "user@artgallery.com",
      currentBidder: "Kiran Reddy",
      bidsCount: 2,
      type: "Auction",
      auctionStatus: "WINNER ANNOUNCED",
      endTime: offsetHoursISO(-24),
      image: "assets/images/landscape-glacial-boat.jpg",
      altText: "Painting of a small boat on a blue lake beneath snow-capped mountains",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-02-26"
    },

    // --- Marcus Sterling (Artist ID: 4) ---
    {
      id: 6,
      name: "Vibrant Brushwork Symphony",
      artist: "Marcus Sterling",
      artistId: 4,
      category: "Abstract",
      medium: "Acrylic & Impasto on Canvas",
      dimensions: "40 x 50 in",
      year: "2026",
      description: "Energetic abstract composition combining bold sweeping brushstrokes and rich chromatic layering.",
      price: 16500,
      startingPrice: 16500,
      currentBid: 19000,
      currentBidder: "Kiran Reddy",
      bidsCount: 2,
      type: "Auction",
      auctionStatus: "LIVE",
      endTime: offsetHoursISO(34),
      image: "assets/images/abstract-bold-brushstrokes.jpg",
      altText: "Abstract painting with bold brushstrokes and vibrant colors",
      featured: true,
      status: "active",
      isSample: true,
      createdAt: "2026-02-12"
    },
    {
      id: 7,
      name: "Obsidian & Chalk Contrast",
      artist: "Marcus Sterling",
      artistId: 4,
      category: "Abstract",
      medium: "Mixed Media on Canvas",
      dimensions: "36 x 36 in",
      year: "2025",
      description: "Striking monochrome abstraction balancing textured ivory planes against deep charcoal strokes.",
      price: 21000,
      type: "For Sale",
      image: "assets/images/abstract-monochrome-contrast.jpg",
      altText: "White and black abstract painting with rich texture",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-02-16"
    },
    {
      id: 8,
      name: "Crimson & Amber Surge",
      artist: "Marcus Sterling",
      artistId: 4,
      category: "Abstract",
      medium: "Acrylic on Stretched Linen",
      dimensions: "30 x 42 in",
      year: "2026",
      description: "Radiant interplay of vermilion red and warm ochre pigment sculpted with palette-knife tension.",
      price: 14000,
      startingPrice: 14000,
      currentBid: 16500,
      currentBidder: "Rahul Sharma",
      bidsCount: 2,
      type: "Auction",
      auctionStatus: "LIVE",
      endTime: offsetHoursISO(18),
      image: "assets/images/abstract-crimson-amber.jpg",
      altText: "Red and yellow abstract painting",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-02-20"
    },
    {
      id: 9,
      name: "Cobalt & Crimson Harmony",
      artist: "Marcus Sterling",
      artistId: 4,
      category: "Abstract",
      medium: "Oil & Cold Wax on Panel",
      dimensions: "36 x 48 in",
      year: "2025",
      description: "Expressive chromatic dialogue between deep ultramarine currents and vivid crimson highlights.",
      price: 28000,
      startingPrice: 28000,
      currentBid: 33000,
      winningBid: 33000,
      winnerName: "Kiran Reddy",
      winnerEmail: "user@artgallery.com",
      currentBidder: "Kiran Reddy",
      bidsCount: 2,
      type: "Auction",
      auctionStatus: "WINNER ANNOUNCED",
      endTime: offsetHoursISO(-18),
      image: "assets/images/abstract-cobalt-crimson.jpg",
      altText: "Blue and red abstract painting",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-02-24"
    },
    {
      id: 10,
      name: "Azure & Earth Drift",
      artist: "Marcus Sterling",
      artistId: 4,
      category: "Abstract",
      medium: "Acrylic on Canvas",
      dimensions: "32 x 40 in",
      year: "2026",
      description: "Layered composition of cerulean blue, umber earth, and chalk white evoking coastal strata.",
      price: 17500,
      type: "For Sale",
      image: "assets/images/abstract-azure-earth.jpg",
      altText: "Abstract painting of blue, brown, and white colors",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-02-28"
    },

    // --- Sophia Bennett (Artist ID: 6) ---
    {
      id: 11,
      name: "Emerald Woodland Mirror",
      artist: "Sophia Bennett",
      artistId: 6,
      category: "Nature",
      medium: "Oil on Canvas",
      dimensions: "30 x 40 in",
      year: "2025",
      description: "Tranquil forest lake bordered by sunlit foliage and serene reflections of overhanging trees.",
      price: 24000,
      type: "For Sale",
      image: "assets/images/nature-forest-waters.jpg",
      altText: "Painting of a calm body of water surrounded by trees",
      featured: true,
      status: "active",
      isSample: true,
      createdAt: "2026-02-15"
    },
    {
      id: 12,
      name: "Avian Sanctuary",
      artist: "Sophia Bennett",
      artistId: 6,
      category: "Nature",
      medium: "Gouache & Watercolor on Paper",
      dimensions: "22 x 30 in",
      year: "2025",
      description: "Delicate natural history painting of songbirds perched among flowering vines in a verdant canopy.",
      price: 16800,
      type: "For Sale",
      image: "assets/images/nature-avian-forest.jpg",
      altText: "Painting of grey and orange birds perched on vines in a green forest",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-02-19"
    },
    {
      id: 13,
      name: "Highland Stag Meadow",
      artist: "Sophia Bennett",
      artistId: 6,
      category: "Nature",
      medium: "Oil on Linen",
      dimensions: "32 x 44 in",
      year: "2026",
      description: "Graceful deer grazing across a misty hillside meadow beneath distant mountain ridges.",
      price: 19000,
      startingPrice: 19000,
      currentBid: 21500,
      currentBidder: "Rahul Sharma",
      bidsCount: 2,
      type: "Auction",
      auctionStatus: "LIVE",
      endTime: offsetHoursISO(41),
      image: "assets/images/nature-highland-deer.jpg",
      altText: "Painting of deer grazing on a grassy hillside with mountains behind",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-02-23"
    },
    {
      id: 14,
      name: "Sunlit Meadow Canopy",
      artist: "Sophia Bennett",
      artistId: 6,
      category: "Watercolor",
      medium: "Watercolor on Cold-Pressed Paper",
      dimensions: "20 x 28 in",
      year: "2025",
      description: "Translucent watercolor wash study of sweeping open fields framed by soft summer trees.",
      price: 13500,
      type: "For Sale",
      image: "assets/images/watercolor-meadow-trees.jpg",
      altText: "Watercolor painting of a grassy field with trees",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-02-27"
    },
    {
      id: 15,
      name: "Wildflower Ridge Wash",
      artist: "Sophia Bennett",
      artistId: 6,
      category: "Watercolor",
      medium: "Watercolor on Arches Paper",
      dimensions: "24 x 32 in",
      year: "2026",
      description: "Impressionistic watercolor landscape alive with blooming meadow wildflowers and distant misty groves.",
      price: 20000,
      startingPrice: 20000,
      currentBid: 26000,
      winningBid: 26000,
      winnerName: "Kiran Reddy",
      winnerEmail: "user@artgallery.com",
      currentBidder: "Kiran Reddy",
      bidsCount: 2,
      type: "Auction",
      auctionStatus: "WINNER ANNOUNCED",
      endTime: offsetHoursISO(-12),
      image: "assets/images/watercolor-wildflower-hills.jpg",
      altText: "Watercolor landscape painting with wildflowers and distant trees",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-03-02"
    },

    // --- Daniel Carter (Artist ID: 7) ---
    {
      id: 16,
      name: "Child in the Wildflower Meadow",
      artist: "Daniel Carter",
      artistId: 7,
      category: "Portrait",
      medium: "Oil on Canvas",
      dimensions: "28 x 36 in",
      year: "2025",
      description: "Tender sunlit portrait of a young figure seated amidst summer meadow blossoms in flowing white linen.",
      price: 23500,
      type: "For Sale",
      image: "assets/images/portrait-wildflower-field.jpg",
      altText: "Portrait painting of a child in white dress holding wildflowers",
      featured: true,
      status: "active",
      isSample: true,
      createdAt: "2026-02-17"
    },
    {
      id: 17,
      name: "Keeper of the Cobalt Bowl",
      artist: "Daniel Carter",
      artistId: 7,
      category: "Portrait",
      medium: "Oil on Belgian Linen",
      dimensions: "26 x 34 in",
      year: "2025",
      description: "Dignified figurative portrait balancing crisp white drapery against a luminous cobalt ceramic vessel.",
      price: 21000,
      type: "For Sale",
      image: "assets/images/portrait-blue-vessel.jpg",
      altText: "Portrait painting of a woman in white headdress holding a blue bowl",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-02-21"
    },
    {
      id: 18,
      name: "Quiet Reflection in Ivory",
      artist: "Daniel Carter",
      artistId: 7,
      category: "Portrait",
      medium: "Oil on Canvas",
      dimensions: "24 x 30 in",
      year: "2026",
      description: "Contemplative portrait study highlighting soft facial chiaroscuro and delicate linen folds.",
      price: 16000,
      startingPrice: 16000,
      currentBid: 19500,
      currentBidder: "Kiran Reddy",
      bidsCount: 2,
      type: "Auction",
      auctionStatus: "LIVE",
      endTime: offsetHoursISO(29),
      image: "assets/images/portrait-white-scarf.jpg",
      altText: "Portrait painting of a woman wearing a white headscarf",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-02-25"
    },
    {
      id: 19,
      name: "Nocturne in Obsidian Silk",
      artist: "Daniel Carter",
      artistId: 7,
      category: "Portrait",
      medium: "Oil & Charcoal on Canvas",
      dimensions: "30 x 38 in",
      year: "2026",
      description: "Expressive modern portrait rendered in rich dark tones with poised, understated elegance.",
      price: 24500,
      type: "For Sale",
      image: "assets/images/portrait-dark-elegance.jpg",
      altText: "Expressive portrait painting of a woman with dark hair",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-03-01"
    },
    {
      id: 20,
      name: "Profile with Lace Collar",
      artist: "Daniel Carter",
      artistId: 7,
      category: "Portrait",
      medium: "Oil on Oak Panel",
      dimensions: "22 x 28 in",
      year: "2025",
      description: "Classical side-profile portrait demonstrating refined Renaissance precision and translucent glazing.",
      price: 27000,
      type: "For Sale",
      image: "assets/images/portrait-profile-collar.jpg",
      altText: "Classical profile painting of a woman with a ruffled collar",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-03-05"
    },

    // --- Olivia Morgan (Artist ID: 8) ---
    {
      id: 21,
      name: "Chromatic Tide",
      artist: "Olivia Morgan",
      artistId: 8,
      category: "Contemporary",
      medium: "Acrylic & Pigment on Canvas",
      dimensions: "40 x 54 in",
      year: "2026",
      description: "Sweeping contemporary canvas alive with saturated cobalt, cadmium red, and sunlit gold waves.",
      price: 26500,
      type: "For Sale",
      image: "assets/images/contemporary-chromatic-wave.jpg",
      altText: "Contemporary painting in bold red, blue, and yellow brushstrokes",
      featured: true,
      status: "active",
      isSample: true,
      createdAt: "2026-02-18"
    },
    {
      id: 22,
      name: "Expressive Field Study",
      artist: "Olivia Morgan",
      artistId: 8,
      category: "Contemporary",
      medium: "Mixed Media on Linen",
      dimensions: "34 x 46 in",
      year: "2026",
      description: "Layered contemporary gesture work balancing spontaneous ink lines with luminous color washes.",
      price: 15000,
      startingPrice: 15000,
      currentBid: 17500,
      currentBidder: "Kiran Reddy",
      bidsCount: 2,
      type: "Auction",
      auctionStatus: "LIVE",
      endTime: offsetHoursISO(63),
      image: "assets/images/contemporary-expressive-field.jpg",
      altText: "Expressive contemporary abstract painting",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-02-22"
    },
    {
      id: 23,
      name: "Solar Crimson Horizon",
      artist: "Olivia Morgan",
      artistId: 8,
      category: "Contemporary",
      medium: "Acrylic & Gold Leaf on Canvas",
      dimensions: "36 x 48 in",
      year: "2025",
      description: "Radiant contemporary composition contrasting warm amber and crimson against crisp ivory space.",
      price: 19500,
      type: "For Sale",
      image: "assets/images/contemporary-gold-crimson.jpg",
      altText: "Contemporary painting in yellow, red, and white tones",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-02-26"
    },
    {
      id: 24,
      name: "Solstice Over Calm Waters",
      artist: "Olivia Morgan",
      artistId: 8,
      category: "Contemporary",
      medium: "Oil & Acrylic on Canvas",
      dimensions: "30 x 40 in",
      year: "2026",
      description: "Minimalist contemporary seascape featuring a glowing tangerine sun suspended above twilight waters.",
      price: 18000,
      type: "For Sale",
      image: "assets/images/contemporary-solar-waters.jpg",
      altText: "Contemporary painting of an orange sun over dark water",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-03-02"
    },
    {
      id: 25,
      name: "Emerald & Ochre Pulse",
      artist: "Olivia Morgan",
      artistId: 8,
      category: "Modern Art",
      medium: "Acrylic on Stretched Canvas",
      dimensions: "36 x 44 in",
      year: "2026",
      description: "Modernist exploration of organic green and sunlit ochre rhythms layered over bright gesso.",
      price: 19000,
      startingPrice: 19000,
      currentBid: 23000,
      winningBid: 23000,
      winnerName: "Rahul Sharma",
      winnerEmail: "rahul@artgallery.com",
      currentBidder: "Rahul Sharma",
      bidsCount: 2,
      type: "Auction",
      auctionStatus: "WINNER ANNOUNCED",
      endTime: offsetHoursISO(-8),
      image: "assets/images/modern-emerald-ochre.jpg",
      altText: "Modern yellow, green, and white abstract painting",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-03-06"
    },

    // --- Arjun Mehta (Artist ID: 9) ---
    {
      id: 26,
      name: "Cottage Gate at Twilight",
      artist: "Arjun Mehta",
      artistId: 9,
      category: "Traditional",
      medium: "Oil on Canvas",
      dimensions: "28 x 38 in",
      year: "2025",
      description: "Pastoral heritage scene portraying a mother and child beside a timber gate framed by ancient oaks.",
      price: 29000,
      type: "For Sale",
      image: "assets/images/traditional-cabin-gate.jpg",
      altText: "Traditional painting of figures at a wooden gate near a cottage and trees",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-02-19"
    },
    {
      id: 27,
      name: "Celestial Baroque Vault",
      artist: "Arjun Mehta",
      artistId: 9,
      category: "Traditional",
      medium: "Tempera & Fresco Study",
      dimensions: "36 x 48 in",
      year: "2025",
      description: "Grand classical ceiling fresco study filled with luminous clouds, gilded light, and Renaissance figures.",
      price: 25000,
      startingPrice: 25000,
      currentBid: 28000,
      currentBidder: "Kiran Reddy",
      bidsCount: 2,
      type: "Auction",
      auctionStatus: "LIVE",
      endTime: offsetHoursISO(46),
      image: "assets/images/traditional-baroque-fresco.jpg",
      altText: "Traditional Baroque ceiling fresco painting",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-02-23"
    },
    {
      id: 28,
      name: "Riders of the Valley",
      artist: "Arjun Mehta",
      artistId: 9,
      category: "Traditional",
      medium: "Oil on Linen",
      dimensions: "34 x 46 in",
      year: "2025",
      description: "Classical equestrian narrative painting capturing movement, warm earth tones, and dramatic sky light.",
      price: 24000,
      type: "For Sale",
      image: "assets/images/traditional-equestrian-group.jpg",
      altText: "Traditional painting of riders on horses",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-02-27"
    },
    {
      id: 29,
      name: "Grand Dome on the Lagoon",
      artist: "Arjun Mehta",
      artistId: 9,
      category: "Traditional",
      medium: "Oil on Canvas",
      dimensions: "30 x 42 in",
      year: "2026",
      description: "Architectural veduta painting of a classical domed basilica rising above shimmering waterfront reflections.",
      price: 26500,
      type: "For Sale",
      image: "assets/images/traditional-dome-waterfront.jpg",
      altText: "Traditional painting of a domed building near water",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-03-03"
    },
    {
      id: 30,
      name: "Sanctuary Procession",
      artist: "Arjun Mehta",
      artistId: 9,
      category: "Traditional",
      medium: "Oil on Panel",
      dimensions: "26 x 36 in",
      year: "2025",
      description: "Detailed classical interior painting illuminating sunlit stone arches and quiet congregational life.",
      price: 21500,
      type: "For Sale",
      image: "assets/images/traditional-cathedral-gathering.jpg",
      altText: "Traditional painting of a cathedral interior with figures",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-03-07"
    },

    // --- Maya Anderson (Artist ID: 10) ---
    {
      id: 31,
      name: "Crown of Wild Blooms",
      artist: "Maya Anderson",
      artistId: 10,
      category: "Floral",
      medium: "Oil on Belgian Linen",
      dimensions: "26 x 34 in",
      year: "2026",
      description: "Vibrant crimson, cobalt, and ivory blossoms arranged in an opulent classical floral still life.",
      price: 21000,
      type: "For Sale",
      image: "assets/images/floral-bloom-bouquet.jpg",
      altText: "Floral still life painting of red, blue, and white flowers",
      featured: true,
      status: "active",
      isSample: true,
      createdAt: "2026-02-20"
    },
    {
      id: 32,
      name: "Botanical Table Arrangement",
      artist: "Maya Anderson",
      artistId: 10,
      category: "Floral",
      medium: "Oil on Canvas",
      dimensions: "24 x 32 in",
      year: "2025",
      description: "Heirloom ceramic vase overflowing with seasonal garden blooms resting on a draped walnut table.",
      price: 18500,
      type: "For Sale",
      image: "assets/images/floral-vase-table.jpg",
      altText: "Painting of flowers in a vase on a table",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-02-24"
    },
    {
      id: 33,
      name: "Summer Meadow Bouquet",
      artist: "Maya Anderson",
      artistId: 10,
      category: "Floral",
      medium: "Oil on Panel",
      dimensions: "24 x 30 in",
      year: "2026",
      description: "Luminous wildflower bouquet rendered with impasto petals against a moody dark studio backdrop.",
      price: 14500,
      startingPrice: 14500,
      currentBid: 16500,
      currentBidder: "Kiran Reddy",
      bidsCount: 2,
      type: "Auction",
      auctionStatus: "LIVE",
      endTime: offsetHoursISO(38),
      image: "assets/images/floral-wildflowers-vase.jpg",
      altText: "Painting of a colorful bouquet of wildflowers in a vase",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-02-28"
    },
    {
      id: 34,
      name: "Porcelain Roses on Slate",
      artist: "Maya Anderson",
      artistId: 10,
      category: "Floral",
      medium: "Oil on Linen",
      dimensions: "20 x 28 in",
      year: "2025",
      description: "Delicate pale blush roses and emerald stems emerging softly from a textured dove-grey ground.",
      price: 17000,
      type: "For Sale",
      image: "assets/images/floral-pale-roses.jpg",
      altText: "Painting of pale pink roses with green leaves on grey background",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-03-04"
    },
    {
      id: 35,
      name: "Crimson & Cobalt Petals",
      artist: "Maya Anderson",
      artistId: 10,
      category: "Floral",
      medium: "Oil on Canvas",
      dimensions: "24 x 32 in",
      year: "2026",
      description: "Rich botanical study uniting deep indigo bellflowers and velvety scarlet blooms.",
      price: 16200,
      type: "For Sale",
      image: "assets/images/floral-crimson-indigo-blooms.jpg",
      altText: "Painting of red, blue, and white flowers",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-03-08"
    },

    // --- Ethan Williams (Artist ID: 11) ---
    {
      id: 36,
      name: "Primary Geometry III",
      artist: "Ethan Williams",
      artistId: 11,
      category: "Modern Art",
      medium: "Acrylic on Canvas",
      dimensions: "38 x 48 in",
      year: "2026",
      description: "Bold modernist composition contrasting cobalt blue, cadmium yellow, and crimson architectural planes.",
      price: 25000,
      type: "For Sale",
      image: "assets/images/modern-primary-composition.jpg",
      altText: "Modern blue, yellow, and red abstract painting",
      featured: true,
      status: "active",
      isSample: true,
      createdAt: "2026-02-22"
    },
    {
      id: 37,
      name: "Organic Equilibrium",
      artist: "Ethan Williams",
      artistId: 11,
      category: "Modern Art",
      medium: "Gouache & Ink on Canvas",
      dimensions: "32 x 42 in",
      year: "2026",
      description: "Playful mid-century modernist study of interlocking organic silhouettes and vibrant pigment fields.",
      price: 30000,
      startingPrice: 30000,
      currentBid: 34500,
      currentBidder: "Kiran Reddy",
      bidsCount: 2,
      type: "Auction",
      auctionStatus: "LIVE",
      endTime: offsetHoursISO(58),
      image: "assets/images/modern-organic-forms.jpg",
      altText: "Modernist painting of colorful organic geometric shapes",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-02-26"
    },
    {
      id: 38,
      name: "Twin Monoliths",
      artist: "Ethan Williams",
      artistId: 11,
      category: "Modern Art",
      medium: "Acrylic & Plaster on Panel",
      dimensions: "30 x 40 in",
      year: "2025",
      description: "Minimalist modernist diptych exploring balance, silence, and sculptural contour in warm neutrals.",
      price: 22500,
      type: "For Sale",
      image: "assets/images/modern-twin-forms.jpg",
      altText: "Modernist painting of two abstract forms",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-03-02"
    },
    {
      id: 39,
      name: "Palazzo Triumph Fresco",
      artist: "Ethan Williams",
      artistId: 11,
      category: "Traditional",
      medium: "Oil & Fresco Glaze on Canvas",
      dimensions: "42 x 54 in",
      year: "2025",
      description: "Monumental classical tribute inspired by Roman Baroque ceiling frescoes and architectural illusionism.",
      price: 40000,
      startingPrice: 40000,
      currentBid: 45000,
      winningBid: 45000,
      winnerName: "Rahul Sharma",
      winnerEmail: "rahul@artgallery.com",
      currentBidder: "Rahul Sharma",
      bidsCount: 2,
      type: "Auction",
      auctionStatus: "WINNER ANNOUNCED",
      endTime: offsetHoursISO(-36),
      image: "assets/images/traditional-palazzo-fresco.jpg",
      altText: "Traditional Baroque ceiling fresco painting in Rome",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-03-06"
    },
    {
      id: 40,
      name: "Misty Crags & Pines",
      artist: "Ethan Williams",
      artistId: 11,
      category: "Landscape",
      medium: "Oil on Linen",
      dimensions: "32 x 44 in",
      year: "2026",
      description: "Dramatic rocky cliffs and windswept woodland rendered in earthy umber and slate tones.",
      price: 23000,
      type: "For Sale",
      image: "assets/images/landscape-trees-rock.jpg",
      altText: "Landscape painting of trees and rock formations",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-03-10"
    },

    // --- Isabella Rossi (Artist ID: 12) ---
    {
      id: 41,
      name: "Cerulean Drift Wash",
      artist: "Isabella Rossi",
      artistId: 12,
      category: "Watercolor",
      medium: "Watercolor on Cotton Rag",
      dimensions: "22 x 30 in",
      year: "2026",
      description: "Fluid sky-blue watercolor clouds blooming softly across textured handmade cotton paper.",
      price: 9500,
      type: "For Sale",
      image: "assets/images/watercolor-cerulean-wash.jpg",
      altText: "Light blue watercolor wash painting",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-02-23"
    },
    {
      id: 42,
      name: "Amber Rose Horizon",
      artist: "Isabella Rossi",
      artistId: 12,
      category: "Watercolor",
      medium: "Watercolor & Mineral Pigment",
      dimensions: "20 x 28 in",
      year: "2026",
      description: "Warm coral and apricot watercolor blooms evoking desert twilight and delicate silk petals.",
      price: 10200,
      type: "For Sale",
      image: "assets/images/watercolor-amber-rose.jpg",
      altText: "Pink and orange watercolor wash painting",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-02-27"
    },
    {
      id: 43,
      name: "Blush Garden Still Life",
      artist: "Isabella Rossi",
      artistId: 12,
      category: "Floral",
      medium: "Watercolor & Gouache on Paper",
      dimensions: "22 x 28 in",
      year: "2026",
      description: "Soft rose and ivory petals arranged in graceful natural harmony against shadowed leaves.",
      price: 7500,
      startingPrice: 7500,
      currentBid: 9200,
      currentBidder: "Kiran Reddy",
      bidsCount: 2,
      type: "Auction",
      auctionStatus: "LIVE",
      endTime: offsetHoursISO(22),
      image: "assets/images/floral-blush-petals.jpg",
      altText: "Pink and white flower painting",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-03-03"
    },
    {
      id: 44,
      name: "Amber Vase Heritage",
      artist: "Isabella Rossi",
      artistId: 12,
      category: "Floral",
      medium: "Oil & Gouache on Panel",
      dimensions: "24 x 30 in",
      year: "2025",
      description: "Luminous floral tabletop study capturing delicate reflections on glass and polished timber.",
      price: 12500,
      type: "For Sale",
      image: "assets/images/floral-amber-vase.jpg",
      altText: "Painting of flowers in a vase on a table",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-03-07"
    },
    {
      id: 45,
      name: "Alpine Valley Mirror",
      artist: "Isabella Rossi",
      artistId: 12,
      category: "Landscape",
      medium: "Oil on Canvas",
      dimensions: "28 x 38 in",
      year: "2026",
      description: "Grand mountain valley illuminated by golden afternoon light reflecting over still glacial waters.",
      price: 19800,
      type: "For Sale",
      image: "assets/images/landscape-mountain-lake.jpg",
      altText: "Landscape painting of a mountain scene with a lake",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-03-11"
    },

    // --- Noah Thompson (Artist ID: 13) ---
    {
      id: 46,
      name: "Pastoral Grazing Light",
      artist: "Noah Thompson",
      artistId: 13,
      category: "Oil Painting",
      medium: "Oil on Canvas",
      dimensions: "30 x 42 in",
      year: "2025",
      description: "Sun-dappled green pasture painted in rich Dutch-school oil glazes beneath dramatic cumulus clouds.",
      price: 18500,
      type: "For Sale",
      image: "assets/images/oil-pastoral-meadow.jpg",
      altText: "Oil painting of cattle in a sunlit green meadow",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-02-24"
    },
    {
      id: 47,
      name: "Dutch Botanical Table",
      artist: "Noah Thompson",
      artistId: 13,
      category: "Oil Painting",
      medium: "Oil on Belgian Linen",
      dimensions: "26 x 34 in",
      year: "2026",
      description: "Classical still-life oil study celebrating sculptural blossoms and warm chiaroscuro shadows.",
      price: 21500,
      type: "For Sale",
      image: "assets/images/oil-botanical-table.jpg",
      altText: "Oil painting of flowers in a vase on a table",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-02-28"
    },
    {
      id: 48,
      name: "Velvet Crimson Roses",
      artist: "Noah Thompson",
      artistId: 13,
      category: "Oil Painting",
      medium: "Oil on Canvas",
      dimensions: "24 x 30 in",
      year: "2026",
      description: "Lush red and blush roses nestled in twin ceramic vases, layered with luminous impasto highlights.",
      price: 19200,
      type: "For Sale",
      image: "assets/images/oil-crimson-roses.jpg",
      altText: "Oil still life painting of red and pink roses in vases",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-03-04"
    },
    {
      id: 49,
      name: "Emerald Vase & White Roses",
      artist: "Noah Thompson",
      artistId: 13,
      category: "Oil Painting",
      medium: "Oil on Canvas",
      dimensions: "24 x 32 in",
      year: "2026",
      description: "Museum-inspired oil composition pairing creamy white roses with an emerald glazed vessel.",
      price: 23000,
      type: "For Sale",
      image: "assets/images/oil-white-roses.jpg",
      altText: "Oil painting of white roses in a green vase on a table",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-03-08"
    },
    {
      id: 50,
      name: "Coastal Horizon & Island",
      artist: "Noah Thompson",
      artistId: 13,
      category: "Landscape",
      medium: "Oil on Linen",
      dimensions: "34 x 46 in",
      year: "2026",
      description: "Serene coastal seascape capturing golden evening light spilling across tranquil island waters.",
      price: 21000,
      type: "For Sale",
      image: "assets/images/landscape-island-vista.jpg",
      altText: "Landscape painting of a coastal island vista",
      featured: false,
      status: "active",
      isSample: true,
      createdAt: "2026-03-12"
    }
  ];

  // 4. Sample Exhibitions (Using dedicated Unsplash painting cover images)
  const initialExhibitions = [
    {
      id: "exh-1",
      title: "Luminescence: Light & Chiaroscuro in Oil",
      curator: "Gallery Administrator",
      coverImage: "assets/images/oil-blossom-still-life.jpg",
      startDate: "2026-10-01",
      endDate: "2026-12-30",
      description: "An intimate curatorial showcase exploring luminous oil glazing, golden hour horizons, and botanical still lifes.",
      artworkIds: [1, 4, 31, 49],
      featured: true
    },
    {
      id: "exh-2",
      title: "Chromatic Horizon: Contemporary & Abstract Voices",
      curator: "Olivia Morgan",
      coverImage: "assets/images/landscape-coastal-waters.jpg",
      startDate: "2026-11-01",
      endDate: "2027-01-31",
      description: "Celebrating expressive brushwork, bold modernist geometry, and dynamic color fields from leading contemporary painters.",
      artworkIds: [6, 21, 24, 36],
      featured: true
    },
    {
      id: "exh-3",
      title: "Heritage & Nature: Classical Landscapes & Frescoes",
      curator: "Arjun Mehta",
      coverImage: "assets/images/oil-arranged-bouquet.jpg",
      startDate: "2026-11-15",
      endDate: "2027-02-15",
      description: "A bridge between timeless European landscape traditions, woodland sanctuaries, and architectural fresco heritage.",
      artworkIds: [11, 16, 27, 45],
      featured: true
    }
  ];

  // 5. Initial Purchases
  const initialPurchases = [
    {
      id: 1,
      userId: 2,
      userName: "Kiran Reddy",
      artworkId: 1,
      artworkName: "Alpine Waters at Dusk",
      artist: "Elena Vance",
      price: 18500,
      date: "2026-03-10",
      image: "assets/images/landscape-alpine-waters.jpg",
      status: "Confirmed",
      paymentMethod: "Online Card (Simulated)"
    },
    {
      id: 2,
      userId: 2,
      userName: "Kiran Reddy",
      artworkId: 5,
      artworkName: "Highland Lake Passage",
      artist: "Elena Vance",
      price: 18500,
      date: "2026-03-22",
      image: "assets/images/landscape-glacial-boat.jpg",
      status: "Confirmed",
      paymentMethod: "Won at Auction"
    },
    {
      id: 3,
      userId: 5,
      userName: "Rahul Sharma",
      artworkId: 25,
      artworkName: "Emerald & Ochre Pulse",
      artist: "Olivia Morgan",
      price: 23000,
      date: "2026-03-24",
      image: "assets/images/modern-emerald-ochre.jpg",
      status: "Confirmed",
      paymentMethod: "Won at Auction"
    }
  ];

  // 6. Initial Bids
  const initialBids = [
    { id: 1, artworkId: 4, artworkName: "Golden Wheat Harvest", userId: 5, userName: "Rahul Sharma", userEmail: "rahul@artgallery.com", bidAmount: 23000, date: "2026-03-16 11:20", status: "Outbid" },
    { id: 2, artworkId: 4, artworkName: "Golden Wheat Harvest", userId: 2, userName: "Kiran Reddy", userEmail: "user@artgallery.com", bidAmount: 25000, date: "2026-03-18 14:15", status: "Leading" },
    { id: 3, artworkId: 5, artworkName: "Highland Lake Passage", userId: 5, userName: "Rahul Sharma", userEmail: "rahul@artgallery.com", bidAmount: 16500, date: "2026-03-14 09:30", status: "Outbid" },
    { id: 4, artworkId: 5, artworkName: "Highland Lake Passage", userId: 2, userName: "Kiran Reddy", userEmail: "user@artgallery.com", bidAmount: 18500, date: "2026-03-20 18:40", status: "Leading" },
    { id: 5, artworkId: 6, artworkName: "Vibrant Brushwork Symphony", userId: 5, userName: "Rahul Sharma", userEmail: "rahul@artgallery.com", bidAmount: 17500, date: "2026-03-15 10:00", status: "Outbid" },
    { id: 6, artworkId: 6, artworkName: "Vibrant Brushwork Symphony", userId: 2, userName: "Kiran Reddy", userEmail: "user@artgallery.com", bidAmount: 19000, date: "2026-03-17 15:45", status: "Leading" },
    { id: 7, artworkId: 8, artworkName: "Crimson & Amber Surge", userId: 2, userName: "Kiran Reddy", userEmail: "user@artgallery.com", bidAmount: 15000, date: "2026-03-16 16:30", status: "Outbid" },
    { id: 8, artworkId: 8, artworkName: "Crimson & Amber Surge", userId: 5, userName: "Rahul Sharma", userEmail: "rahul@artgallery.com", bidAmount: 16500, date: "2026-03-19 12:10", status: "Leading" },
    { id: 9, artworkId: 9, artworkName: "Cobalt & Crimson Harmony", userId: 5, userName: "Rahul Sharma", userEmail: "rahul@artgallery.com", bidAmount: 30000, date: "2026-03-18 10:20", status: "Outbid" },
    { id: 10, artworkId: 9, artworkName: "Cobalt & Crimson Harmony", userId: 2, userName: "Kiran Reddy", userEmail: "user@artgallery.com", bidAmount: 33000, date: "2026-03-21 16:00", status: "Leading" },
    { id: 11, artworkId: 13, artworkName: "Highland Stag Meadow", userId: 2, userName: "Kiran Reddy", userEmail: "user@artgallery.com", bidAmount: 20000, date: "2026-03-17 11:45", status: "Outbid" },
    { id: 12, artworkId: 13, artworkName: "Highland Stag Meadow", userId: 5, userName: "Rahul Sharma", userEmail: "rahul@artgallery.com", bidAmount: 21500, date: "2026-03-19 17:20", status: "Leading" },
    { id: 13, artworkId: 15, artworkName: "Wildflower Ridge Wash", userId: 5, userName: "Rahul Sharma", userEmail: "rahul@artgallery.com", bidAmount: 23000, date: "2026-03-19 14:00", status: "Outbid" },
    { id: 14, artworkId: 15, artworkName: "Wildflower Ridge Wash", userId: 2, userName: "Kiran Reddy", userEmail: "user@artgallery.com", bidAmount: 26000, date: "2026-03-22 15:30", status: "Leading" },
    { id: 15, artworkId: 18, artworkName: "Quiet Reflection in Ivory", userId: 5, userName: "Rahul Sharma", userEmail: "rahul@artgallery.com", bidAmount: 17500, date: "2026-03-18 13:10", status: "Outbid" },
    { id: 16, artworkId: 18, artworkName: "Quiet Reflection in Ivory", userId: 2, userName: "Kiran Reddy", userEmail: "user@artgallery.com", bidAmount: 19500, date: "2026-03-20 19:00", status: "Leading" },
    { id: 17, artworkId: 22, artworkName: "Expressive Field Study", userId: 5, userName: "Rahul Sharma", userEmail: "rahul@artgallery.com", bidAmount: 16000, date: "2026-03-18 11:00", status: "Outbid" },
    { id: 18, artworkId: 22, artworkName: "Expressive Field Study", userId: 2, userName: "Kiran Reddy", userEmail: "user@artgallery.com", bidAmount: 17500, date: "2026-03-20 14:15", status: "Leading" },
    { id: 19, artworkId: 25, artworkName: "Emerald & Ochre Pulse", userId: 2, userName: "Kiran Reddy", userEmail: "user@artgallery.com", bidAmount: 21000, date: "2026-03-20 16:30", status: "Outbid" },
    { id: 20, artworkId: 25, artworkName: "Emerald & Ochre Pulse", userId: 5, userName: "Rahul Sharma", userEmail: "rahul@artgallery.com", bidAmount: 23000, date: "2026-03-23 11:20", status: "Leading" },
    { id: 21, artworkId: 27, artworkName: "Celestial Baroque Vault", userId: 5, userName: "Rahul Sharma", userEmail: "rahul@artgallery.com", bidAmount: 26500, date: "2026-03-19 15:40", status: "Outbid" },
    { id: 22, artworkId: 27, artworkName: "Celestial Baroque Vault", userId: 2, userName: "Kiran Reddy", userEmail: "user@artgallery.com", bidAmount: 28000, date: "2026-03-21 17:50", status: "Leading" },
    { id: 23, artworkId: 33, artworkName: "Summer Meadow Bouquet", userId: 5, userName: "Rahul Sharma", userEmail: "rahul@artgallery.com", bidAmount: 15500, date: "2026-03-20 12:00", status: "Outbid" },
    { id: 24, artworkId: 33, artworkName: "Summer Meadow Bouquet", userId: 2, userName: "Kiran Reddy", userEmail: "user@artgallery.com", bidAmount: 16500, date: "2026-03-22 18:10", status: "Leading" },
    { id: 25, artworkId: 37, artworkName: "Organic Equilibrium", userId: 5, userName: "Rahul Sharma", userEmail: "rahul@artgallery.com", bidAmount: 32000, date: "2026-03-21 14:20", status: "Outbid" },
    { id: 26, artworkId: 37, artworkName: "Organic Equilibrium", userId: 2, userName: "Kiran Reddy", userEmail: "user@artgallery.com", bidAmount: 34500, date: "2026-03-23 20:00", status: "Leading" },
    { id: 27, artworkId: 39, artworkName: "Palazzo Triumph Fresco", userId: 2, userName: "Kiran Reddy", userEmail: "user@artgallery.com", bidAmount: 42500, date: "2026-03-21 10:15", status: "Outbid" },
    { id: 28, artworkId: 39, artworkName: "Palazzo Triumph Fresco", userId: 5, userName: "Rahul Sharma", userEmail: "rahul@artgallery.com", bidAmount: 45000, date: "2026-03-23 16:45", status: "Leading" },
    { id: 29, artworkId: 43, artworkName: "Blush Garden Still Life", userId: 5, userName: "Rahul Sharma", userEmail: "rahul@artgallery.com", bidAmount: 8200, date: "2026-03-22 13:30", status: "Outbid" },
    { id: 30, artworkId: 43, artworkName: "Blush Garden Still Life", userId: 2, userName: "Kiran Reddy", userEmail: "user@artgallery.com", bidAmount: 9200, date: "2026-03-24 19:15", status: "Leading" }
  ];

  // 7. Initial Reviews
  const initialReviews = [
    { id: 1, artworkId: 1, artworkName: "Alpine Waters at Dusk", userId: 2, userName: "Kiran Reddy", rating: 5, comment: "Luminous brushwork and remarkable reflection depth across the mountain lake.", date: "2026-03-12" },
    { id: 2, artworkId: 6, artworkName: "Vibrant Brushwork Symphony", userId: 5, userName: "Rahul Sharma", rating: 5, comment: "Dynamic energy and richly textured impasto layers that command the entire room.", date: "2026-03-14" },
    { id: 3, artworkId: 11, artworkName: "Emerald Woodland Mirror", userId: 2, userName: "Kiran Reddy", rating: 5, comment: "Peaceful, museum-grade woodland composition with wonderful depth of field.", date: "2026-03-16" },
    { id: 4, artworkId: 16, artworkName: "Child in the Wildflower Meadow", userId: 5, userName: "Rahul Sharma", rating: 5, comment: "Gentle natural lighting and exquisite tenderness in the brushwork.", date: "2026-03-17" },
    { id: 5, artworkId: 21, artworkName: "Chromatic Tide", userId: 2, userName: "Kiran Reddy", rating: 5, comment: "Bold contemporary color balance with extraordinary movement and warmth.", date: "2026-03-18" },
    { id: 6, artworkId: 31, artworkName: "Crown of Wild Blooms", userId: 5, userName: "Rahul Sharma", rating: 5, comment: "Crisp botanical detail and timeless Dutch still-life richness.", date: "2026-03-20" },
    { id: 7, artworkId: 36, artworkName: "Primary Geometry III", userId: 2, userName: "Kiran Reddy", rating: 5, comment: "Clean modernist proportions with vivid, museum-worthy color saturation.", date: "2026-03-21" }
  ];

  // 8. Initial Auction Results
  const initialAuctionResults = [
    { id: 1, artworkId: 5, artworkName: "Highland Lake Passage", artist: "Elena Vance", winnerName: "Kiran Reddy", winnerEmail: "user@artgallery.com", winningBid: 18500, announcedAt: "2026-03-22" },
    { id: 2, artworkId: 9, artworkName: "Cobalt & Crimson Harmony", artist: "Marcus Sterling", winnerName: "Kiran Reddy", winnerEmail: "user@artgallery.com", winningBid: 33000, announcedAt: "2026-03-23" },
    { id: 3, artworkId: 15, artworkName: "Wildflower Ridge Wash", artist: "Sophia Bennett", winnerName: "Kiran Reddy", winnerEmail: "user@artgallery.com", winningBid: 26000, announcedAt: "2026-03-23" },
    { id: 4, artworkId: 25, artworkName: "Emerald & Ochre Pulse", artist: "Olivia Morgan", winnerName: "Rahul Sharma", winnerEmail: "rahul@artgallery.com", winningBid: 23000, announcedAt: "2026-03-24" },
    { id: 5, artworkId: 39, artworkName: "Palazzo Triumph Fresco", artist: "Ethan Williams", winnerName: "Rahul Sharma", winnerEmail: "rahul@artgallery.com", winningBid: 45000, announcedAt: "2026-03-24" }
  ];

  // First-load seeding
  if (!localStorage.getItem('users')) setData('users', initialUsers);
  if (!localStorage.getItem('categories')) setData('categories', initialCategories);
  if (!localStorage.getItem('artworks')) setData('artworks', initialArtworks);
  if (!localStorage.getItem('exhibitions')) setData('exhibitions', initialExhibitions);
  if (!localStorage.getItem('purchases')) setData('purchases', initialPurchases);
  if (!localStorage.getItem('favorites')) setData('favorites', { "2": [1, 4, 11, 21, 31, 36] });
  if (!localStorage.getItem('bids')) {
    setData('bids', initialBids);
    setData('auctionBids', initialBids);
  }
  if (!localStorage.getItem('reviews')) setData('reviews', initialReviews);
  if (!localStorage.getItem('auctionResults')) setData('auctionResults', initialAuctionResults);
  if (!localStorage.getItem('cart')) setData('cart', []);

  // Safe Non-Destructive Migration (v3: ZENITH Branding, Admin Credentials & Painting Images)
  try {
    const migrationKey = 'zenith_migration_v3';
    const needsMigration = localStorage.getItem(migrationKey) !== 'done';

    // A. Sync admin & sample user credentials from local config without deleting any user
    const currentUsers = getData('users', []);
    if (Array.isArray(currentUsers) && currentUsers.length > 0) {
      let usersModified = false;
      const adminUser = currentUsers.find(u => (u.role || '').toLowerCase() === 'admin');
      if (adminUser && localAdmin.email && localAdmin.password) {
        if (adminUser.email !== localAdmin.email || adminUser.password !== localAdmin.password) {
          adminUser.email = localAdmin.email;
          adminUser.password = localAdmin.password;
          usersModified = true;
        }
      } else if (!adminUser) {
        currentUsers.unshift(initialUsers[0]);
        usersModified = true;
      }

      initialUsers.forEach(initUser => {
        const found = currentUsers.find(u => u.id === initUser.id || (u.email && u.email.toLowerCase() === initUser.email.toLowerCase()));
        if (!found) {
          currentUsers.push(initUser);
          usersModified = true;
        } else {
          if (initUser.role === 'artist' && needsMigration) {
            found.specialization = initUser.specialization;
            found.bio = initUser.bio;
            usersModified = true;
          }
          if (initUser.password && !found.password) {
            found.password = initUser.password;
            usersModified = true;
          }
        }
      });

      if (usersModified) setData('users', currentUsers);
    }

    if (needsMigration) {
      // B. Invalidate any existing admin session from before credential migration
      const activeSession = getData('currentUser', null);
      if (activeSession && String(activeSession.role || '').toLowerCase() === 'admin') {
        removeData('currentUser');
      }

      // C. Upgrade categories to the 10 curated painting varieties
      setData('categories', initialCategories);

      // D. Upgrade ONLY sample artworks (preserving any user/artist-uploaded artworks!)
      const sampleMap = {};
      initialArtworks.forEach(a => { sampleMap[a.id] = a; });

      const storedArtworks = getData('artworks', []);
      if (!Array.isArray(storedArtworks) || storedArtworks.length === 0) {
        setData('artworks', initialArtworks);
      } else {
        let artworksChanged = false;
        const upgraded = storedArtworks.map(art => {
          const sample = sampleMap[art.id];
          const isLegacySample = sample && (art.isSample === true || (typeof art.image === 'string' && art.image.startsWith('images/artworks/')));
          if (isLegacySample) {
            artworksChanged = true;
            return {
              ...sample,
              // Preserve live auction state if bids were already placed
              currentBid: art.currentBid || sample.currentBid,
              currentBidder: art.currentBidder || sample.currentBidder,
              currentBidderEmail: art.currentBidderEmail || sample.currentBidderEmail,
              currentBidderId: art.currentBidderId || sample.currentBidderId,
              auctionStatus: art.auctionStatus || sample.auctionStatus,
              winnerName: art.winnerName || sample.winnerName,
              winnerEmail: art.winnerEmail || sample.winnerEmail,
              winningBid: art.winningBid || sample.winningBid,
              announcedAt: art.announcedAt || sample.announcedAt
            };
          }
          return art;
        });

        // Ensure all 50 sample artworks exist if missing
        initialArtworks.forEach(sample => {
          if (!upgraded.some(a => Number(a.id) === Number(sample.id))) {
            upgraded.push(sample);
            artworksChanged = true;
          }
        });

        if (artworksChanged) setData('artworks', upgraded);
      }

      // E. Update legacy SVG thumbnails in purchases without deleting user orders
      const storedPurchases = getData('purchases', []);
      if (Array.isArray(storedPurchases) && storedPurchases.length > 0) {
        let purchasesChanged = false;
        storedPurchases.forEach(p => {
          const sample = sampleMap[p.artworkId];
          if (sample && typeof p.image === 'string' && p.image.startsWith('images/artworks/')) {
            p.image = sample.image;
            p.artworkName = sample.name;
            purchasesChanged = true;
          }
        });
        if (purchasesChanged) setData('purchases', storedPurchases);
      }

      // F. Ensure exhibitions exist
      if (!localStorage.getItem('exhibitions')) {
        setData('exhibitions', initialExhibitions);
      }

      localStorage.setItem(migrationKey, 'done');
    } else {
      // Ensure live auction items always have a valid endTime for countdown timers
      const storedArtworks = getData('artworks', []);
      let timerUpdated = false;
      storedArtworks.forEach((art, idx) => {
        if (art.type === 'Auction' && (art.auctionStatus || 'LIVE') === 'LIVE' && !art.endTime) {
          art.endTime = offsetHoursISO(16 + (idx % 48));
          timerUpdated = true;
        }
      });
      if (timerUpdated) setData('artworks', storedArtworks);
    }
  } catch (syncErr) {
    console.warn('Storage migration note:', syncErr);
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

// Automatically initialize sample data & safe migration on load
initializeSampleData();
