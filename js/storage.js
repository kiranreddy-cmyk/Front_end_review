/**
 * storage.js - Local Storage Abstraction and Sample Data Seeding
 * Online Art Gallery (ArtLoom)
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

// Format Currency (INR)
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
  const localCfg = (typeof window !== 'undefined' && window.ZENITH_LOCAL_CONFIG) ? window.ZENITH_LOCAL_CONFIG : {};
  const localAdmin = localCfg.admin || {};
  const adminEmail = String(localAdmin.email || '').trim();
  const adminPassword = String(localAdmin.password || '');
  const hasLocalAdmin = Boolean(adminEmail && adminPassword);

  // 1. Default Admin Account Only (loaded from gitignored js/config.local.js; old default users/artists removed)
  const initialUsers = hasLocalAdmin ? [
    {
      id: 1,
      name: "Admin Administrator",
      email: adminEmail,
      password: adminPassword,
      role: "admin",
      avatar: "images/avatar-admin.svg",
      createdAt: "2026-01-10"
    }
  ] : [];

  if (!localStorage.getItem('users')) {
    setData('users', initialUsers);
  }

  // 2. Categories (8 Standard Categories)
  if (!localStorage.getItem('categories') || localStorage.getItem('zenith_migration_v3')) {
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

  // 3. Artworks (50 Curated Artworks: Exactly 5 per Artist across all 10 Artists)
  // Distribution: 35 For Sale (70%), 10 Live Auction (20%), 5 Winner Announced (10%)
  const initialArtworks = [
    // --- Elena Vance (Artist ID: 3, Landscape & Impressionism) ---
    {
      id: 1,
      name: "Golden Horizon",
      artist: "Elena Vance",
      artistId: 3,
      category: "Landscape",
      description: "An evocative oil-on-canvas masterpiece depicting the tranquil golden hour over jagged mountain peaks and reflecting alpine waters.",
      price: 18000,
      type: "For Sale",
      image: "assets/images/landscape-alpine-waters.jpg",
      featured: true,
      status: "active",
      createdAt: "2026-02-10"
    },
    {
      id: 2,
      name: "Whispers of the Ocean",
      artist: "Elena Vance",
      artistId: 3,
      category: "Landscape",
      description: "An impressionist coastal scene depicting powerful cerulean ocean swells cresting into luminous sea-foam along a sun-drenched shore.",
      price: 15000,
      type: "For Sale",
      image: "assets/images/landscape-coastal-waters.jpg",
      featured: false,
      status: "active",
      createdAt: "2026-02-14"
    },
    {
      id: 3,
      name: "Midnight Serenade",
      artist: "Elena Vance",
      artistId: 3,
      category: "Abstract",
      description: "Expressive lyrical brushstrokes of royal violet, turquoise, and gold leaf evoking the rhythmic harmony of midnight orchestral jazz.",
      price: 19500,
      type: "For Sale",
      image: "assets/images/abstract-cobalt-crimson.jpg",
      featured: false,
      status: "active",
      createdAt: "2026-02-18"
    },
    {
      id: 4,
      name: "Lady in Saffron",
      artist: "Elena Vance",
      artistId: 3,
      category: "Portrait",
      description: "A poignant portrait capturing a serene woman adorned in flowing saffron silk drapery with intricate gold ornaments against deep chiaroscuro.",
      price: 22000,
      startingPrice: 22000,
      currentBid: 25000,
      currentBidder: "Kiran Reddy",
      bidsCount: 3,
      type: "Auction",
      auctionStatus: "LIVE",
      image: "assets/images/portrait-blue-vessel.jpg",
      featured: true,
      status: "active",
      createdAt: "2026-02-22"
    },
    {
      id: 5,
      name: "Sunset Dreams",
      artist: "Elena Vance",
      artistId: 3,
      category: "Painting",
      description: "A breathtaking impressionist sunset panorama over coastal dunes and glowing tidal waters, blending vivid amber, crimson, and lavender hues.",
      price: 5000,
      startingPrice: 5000,
      currentBid: 8500,
      winningBid: 8500,
      winnerName: "Kiran Reddy",
      winnerEmail: "user@artgallery.com",
      currentBidder: "Kiran Reddy",
      bidsCount: 4,
      type: "Auction",
      auctionStatus: "WINNER ANNOUNCED",
      image: "assets/images/contemporary-solar-waters.jpg",
      featured: true,
      status: "active",
      createdAt: "2026-02-26"
    },

    // --- Marcus Sterling (Artist ID: 4, Digital Art & Sculpture) ---
    {
      id: 6,
      name: "Neon Cyber Odyssey",
      artist: "Marcus Sterling",
      artistId: 4,
      category: "Digital Art",
      description: "A visionary 3D rendered futuristic cityscape celebrating vaporwave aesthetics, holographic geometry, and neon cyberpunk architecture.",
      price: 12500,
      startingPrice: 12500,
      currentBid: 14000,
      currentBidder: "Kiran Reddy",
      bidsCount: 2,
      type: "Auction",
      auctionStatus: "LIVE",
      image: "assets/images/contemporary-chromatic-wave.jpg",
      featured: true,
      status: "active",
      createdAt: "2026-02-12"
    },
    {
      id: 7,
      name: "Bronze Harmony",
      artist: "Marcus Sterling",
      artistId: 4,
      category: "Sculpture",
      description: "Cast bronze infinity ribbon sculpture with polished golden patinas, mounted on an authentic honed volcanic slate plinth.",
      price: 35000,
      type: "For Sale",
      image: "assets/images/modern-twin-forms.jpg",
      featured: true,
      status: "active",
      createdAt: "2026-02-16"
    },
    {
      id: 8,
      name: "Geometric Reverie",
      artist: "Marcus Sterling",
      artistId: 4,
      category: "Abstract",
      description: "Constructivist vector abstract piece exploring color psychology, bold architectural arches, vibrant teal planes, and balance.",
      price: 11000,
      startingPrice: 11000,
      currentBid: 13500,
      currentBidder: "Rahul Sharma",
      bidsCount: 3,
      type: "Auction",
      auctionStatus: "LIVE",
      image: "assets/images/modern-primary-composition.jpg",
      featured: false,
      status: "active",
      createdAt: "2026-02-20"
    },
    {
      id: 9,
      name: "Marble Flora",
      artist: "Marcus Sterling",
      artistId: 4,
      category: "Sculpture",
      description: "Hand-chiseled organic botanical form in genuine Carrara white marble, featuring translucent delicate curves and soft light interplay.",
      price: 42000,
      startingPrice: 42000,
      currentBid: 47000,
      winningBid: 47000,
      winnerName: "Kiran Reddy",
      winnerEmail: "user@artgallery.com",
      currentBidder: "Kiran Reddy",
      bidsCount: 5,
      type: "Auction",
      auctionStatus: "WINNER ANNOUNCED",
      image: "assets/images/floral-pale-roses.jpg",
      featured: true,
      status: "active",
      createdAt: "2026-02-24"
    },
    {
      id: 10,
      name: "Metropolis Awakening",
      artist: "Marcus Sterling",
      artistId: 4,
      category: "Digital Art",
      description: "A sweeping digital panoramic matte capturing a bustling glass-and-steel megalopolis as the dawn sun emerges over harbor waters.",
      price: 16000,
      type: "For Sale",
      image: "assets/images/traditional-dome-waterfront.jpg",
      featured: false,
      status: "active",
      createdAt: "2026-02-28"
    },

    // --- Sophia Bennett (Artist ID: 6, Nature Art & Oil Painting) ---
    {
      id: 11,
      name: "Emerald Canopy",
      artist: "Sophia Bennett",
      artistId: 6,
      category: "Painting",
      description: "Richly glazed oil painting capturing dappled forest sunlight illuminating ancient ferns, moss-draped branches, and woodland stream banks.",
      price: 24000,
      type: "For Sale",
      image: "assets/images/nature-forest-waters.jpg",
      featured: true,
      status: "active",
      createdAt: "2026-02-15"
    },
    {
      id: 12,
      name: "Alpine Blossom",
      artist: "Sophia Bennett",
      artistId: 6,
      category: "Landscape",
      description: "A tranquil depiction of high-altitude alpine wildflowers blooming against the dramatic backdrop of snow-dusted granite crags.",
      price: 17500,
      type: "For Sale",
      image: "assets/images/watercolor-wildflower-hills.jpg",
      featured: false,
      status: "active",
      createdAt: "2026-02-19"
    },
    {
      id: 13,
      name: "Sylvan Solitude",
      artist: "Sophia Bennett",
      artistId: 6,
      category: "Painting",
      description: "Moody, atmospheric oil-on-panel portrayal of a misty forest clearing at daybreak, alive with golden god rays and dew-laden flora.",
      price: 18000,
      startingPrice: 18000,
      currentBid: 21500,
      currentBidder: "Rahul Sharma",
      bidsCount: 3,
      type: "Auction",
      auctionStatus: "LIVE",
      image: "assets/images/watercolor-meadow-trees.jpg",
      featured: false,
      status: "active",
      createdAt: "2026-02-23"
    },
    {
      id: 14,
      name: "Whispering Pines",
      artist: "Sophia Bennett",
      artistId: 6,
      category: "Landscape",
      description: "Panoramic landscape study of towering evergreen ridges silhouetted against twilight violet skies and distant mountain ridges.",
      price: 14000,
      type: "For Sale",
      image: "assets/images/landscape-trees-rock.jpg",
      featured: false,
      status: "active",
      createdAt: "2026-02-27"
    },
    {
      id: 15,
      name: "Autumn Reverence",
      artist: "Sophia Bennett",
      artistId: 6,
      category: "Painting",
      description: "An evocative seasonal work capturing blazing russet, vermilion, and ochre foliage mirrored in still woodland lake waters.",
      price: 20000,
      startingPrice: 20000,
      currentBid: 26000,
      winningBid: 26000,
      winnerName: "Kiran Reddy",
      winnerEmail: "user@artgallery.com",
      currentBidder: "Kiran Reddy",
      bidsCount: 4,
      type: "Auction",
      auctionStatus: "WINNER ANNOUNCED",
      image: "assets/images/oil-golden-wheatfield.jpg",
      featured: false,
      status: "active",
      createdAt: "2026-03-02"
    },

    // --- Daniel Carter (Artist ID: 7, Contemporary Portraiture) ---
    {
      id: 16,
      name: "The Old Craftsman",
      artist: "Daniel Carter",
      artistId: 7,
      category: "Portrait",
      description: "Intimate and deeply detailed portrait celebrating generational wisdom, etched character lines, and focused craftsmanship in a woodshop.",
      price: 8900,
      type: "For Sale",
      image: "assets/images/traditional-cabin-gate.jpg",
      featured: false,
      status: "active",
      createdAt: "2026-02-17"
    },
    {
      id: 17,
      name: "Gaze of Resilience",
      artist: "Daniel Carter",
      artistId: 7,
      category: "Portrait",
      description: "Powerful contemporary oil portrait depicting unwavering human strength and dignity illuminated by dramatic side lighting.",
      price: 21000,
      type: "For Sale",
      image: "assets/images/portrait-dark-elegance.jpg",
      featured: true,
      status: "active",
      createdAt: "2026-02-21"
    },
    {
      id: 18,
      name: "Nomad of Ladakh",
      artist: "Daniel Carter",
      artistId: 7,
      category: "Portrait",
      description: "Expressive figurative study of a Himalayan shepherd dressed in traditional woven wool garments against high-altitude winds.",
      price: 16000,
      startingPrice: 16000,
      currentBid: 19500,
      currentBidder: "Kiran Reddy",
      bidsCount: 3,
      type: "Auction",
      auctionStatus: "LIVE",
      image: "assets/images/portrait-white-scarf.jpg",
      featured: false,
      status: "active",
      createdAt: "2026-02-25"
    },
    {
      id: 19,
      name: "Velvet Contemplation",
      artist: "Daniel Carter",
      artistId: 7,
      category: "Portrait",
      description: "A sensitive portrait exploring internal reflection and quiet grace, framed by deep Prussian blue textiles and golden ambient warmth.",
      price: 23500,
      type: "For Sale",
      image: "assets/images/portrait-profile-collar.jpg",
      featured: false,
      status: "active",
      createdAt: "2026-03-01"
    },
    {
      id: 20,
      name: "The Weaver's Daughter",
      artist: "Daniel Carter",
      artistId: 7,
      category: "Drawing",
      description: "Delicate charcoal and sepia wash study of hands diligently threading an artisanal wooden handloom with raw silk yarn.",
      price: 9500,
      type: "For Sale",
      image: "assets/images/portrait-wildflower-field.jpg",
      featured: false,
      status: "active",
      createdAt: "2026-03-05"
    },

    // --- Olivia Morgan (Artist ID: 8, Abstract & Color Psychology) ---
    {
      id: 21,
      name: "Chromatic Symphony",
      artist: "Olivia Morgan",
      artistId: 8,
      category: "Abstract",
      description: "Vibrant large-format acrylic composition orchestrating intense cadmium orange, cobalt blue, and radiant gold leaf accents.",
      price: 26000,
      type: "For Sale",
      image: "assets/images/abstract-bold-brushstrokes.jpg",
      featured: true,
      status: "active",
      createdAt: "2026-02-18"
    },
    {
      id: 22,
      name: "Prismatic Horizon",
      artist: "Olivia Morgan",
      artistId: 8,
      category: "Abstract",
      description: "Dynamic geometric study contrasting clean modern architectural lines against organic chromatic watercolor washes.",
      price: 15000,
      startingPrice: 15000,
      currentBid: 17500,
      currentBidder: "Kiran Reddy",
      bidsCount: 2,
      type: "Auction",
      auctionStatus: "LIVE",
      image: "assets/images/modern-emerald-ochre.jpg",
      featured: false,
      status: "active",
      createdAt: "2026-02-22"
    },
    {
      id: 23,
      name: "Resonance in Indigo",
      artist: "Olivia Morgan",
      artistId: 8,
      category: "Abstract",
      description: "Subtle minimalist color field exploration in hand-ground organic indigo pigment, layered for infinite atmospheric depth.",
      price: 18500,
      type: "For Sale",
      image: "assets/images/abstract-azure-earth.jpg",
      featured: false,
      status: "active",
      createdAt: "2026-02-26"
    },
    {
      id: 24,
      name: "Kinetic Geometry",
      artist: "Olivia Morgan",
      artistId: 8,
      category: "Abstract",
      description: "Bold optical abstractions playing with sharp diagonals, intersecting concentric circles, and optical dimensional vibration.",
      price: 13000,
      type: "For Sale",
      image: "assets/images/modern-organic-forms.jpg",
      featured: false,
      status: "active",
      createdAt: "2026-03-02"
    },
    {
      id: 25,
      name: "Ethereal Pulse",
      artist: "Olivia Morgan",
      artistId: 8,
      category: "Abstract",
      description: "An energetic color study capturing musical rhythms and sonic vibrations converted into layered flowing pigment ribbons.",
      price: 19000,
      startingPrice: 19000,
      currentBid: 23000,
      winningBid: 23000,
      winnerName: "Rahul Sharma",
      winnerEmail: "rahul@artgallery.com",
      currentBidder: "Rahul Sharma",
      bidsCount: 3,
      type: "Auction",
      auctionStatus: "WINNER ANNOUNCED",
      image: "assets/images/abstract-crimson-amber.jpg",
      featured: false,
      status: "active",
      createdAt: "2026-03-06"
    },

    // --- Arjun Mehta (Artist ID: 9, Traditional Art & Heritage) ---
    {
      id: 26,
      name: "Royal Court of Mewar",
      artist: "Arjun Mehta",
      artistId: 9,
      category: "Painting",
      description: "Intricately detailed gouache and 24-karat gold leaf painting reviving classical Rajasthani miniature painting techniques.",
      price: 32000,
      type: "For Sale",
      image: "assets/images/traditional-palazzo-fresco.jpg",
      featured: true,
      status: "active",
      createdAt: "2026-02-19"
    },
    {
      id: 27,
      name: "Temple of the Rising Sun",
      artist: "Arjun Mehta",
      artistId: 9,
      category: "Painting",
      description: "Splendid heritage architectural painting showcasing carved stone spires of ancient Khajuraho glowing under dawn mist.",
      price: 25000,
      startingPrice: 25000,
      currentBid: 28000,
      currentBidder: "Kiran Reddy",
      bidsCount: 2,
      type: "Auction",
      auctionStatus: "LIVE",
      image: "assets/images/traditional-baroque-fresco.jpg",
      featured: false,
      status: "active",
      createdAt: "2026-02-23"
    },
    {
      id: 28,
      name: "Heritage Courtyard",
      artist: "Arjun Mehta",
      artistId: 9,
      category: "Landscape",
      description: "Serene portrayal of a traditional sandstone haveli courtyard with shaded arched verandas, brass urns, and sacred tulsi planter.",
      price: 19000,
      type: "For Sale",
      image: "assets/images/traditional-cathedral-gathering.jpg",
      featured: false,
      status: "active",
      createdAt: "2026-02-27"
    },
    {
      id: 29,
      name: "The Sacred River",
      artist: "Arjun Mehta",
      artistId: 9,
      category: "Painting",
      description: "An atmospheric impressionist riverfront view capturing flickering earthen lamps floating on sacred waters at evening aarti.",
      price: 22500,
      type: "For Sale",
      image: "assets/images/landscape-river-boat.jpg",
      featured: false,
      status: "active",
      createdAt: "2026-03-03"
    },
    {
      id: 30,
      name: "Mughal Botanical Study",
      artist: "Arjun Mehta",
      artistId: 9,
      category: "Drawing",
      description: "Refined handmade wasli paper drawing of blooming desert poppies with fine squirrel-hair brushwork and natural mineral pigments.",
      price: 11000,
      type: "For Sale",
      image: "assets/images/floral-wildflowers-vase.jpg",
      featured: false,
      status: "active",
      createdAt: "2026-03-07"
    },

    // --- Maya Anderson (Artist ID: 10, Fine Art Photography) ---
    {
      id: 31,
      name: "Soul of the Wild",
      artist: "Maya Anderson",
      artistId: 10,
      category: "Photography",
      description: "A misty, cinematic wildlife photograph capturing the quiet majesty of a forest stag amid early morning emerald light and gentle bokeh.",
      price: 9800,
      type: "For Sale",
      image: "assets/images/nature-highland-deer.jpg",
      featured: true,
      status: "active",
      createdAt: "2026-02-20"
    },
    {
      id: 32,
      name: "Mist Over the Valley",
      artist: "Maya Anderson",
      artistId: 10,
      category: "Photography",
      description: "Large-format archival landscape print recording dramatic cloud inversions pouring over jagged alpine spruce forests.",
      price: 12000,
      type: "For Sale",
      image: "assets/images/landscape-mountain-lake.jpg",
      featured: false,
      status: "active",
      createdAt: "2026-02-24"
    },
    {
      id: 33,
      name: "Coastal Solitude",
      artist: "Maya Anderson",
      artistId: 10,
      category: "Photography",
      description: "Long-exposure monochrome study of sea stacks emerging from silky white surf along a remote northern shoreline.",
      price: 14000,
      startingPrice: 14000,
      currentBid: 16500,
      currentBidder: "Kiran Reddy",
      bidsCount: 2,
      type: "Auction",
      auctionStatus: "LIVE",
      image: "assets/images/landscape-island-vista.jpg",
      featured: false,
      status: "active",
      createdAt: "2026-02-28"
    },
    {
      id: 34,
      name: "Monolith at Dusk",
      artist: "Maya Anderson",
      artistId: 10,
      category: "Photography",
      description: "Fine art photographic capture of isolated sandstone towers glowing ember-red beneath the first emerging twilight constellations.",
      price: 15500,
      type: "For Sale",
      image: "assets/images/landscape-glacial-boat.jpg",
      featured: false,
      status: "active",
      createdAt: "2026-03-04"
    },
    {
      id: 35,
      name: "Echoes of the Dunes",
      artist: "Maya Anderson",
      artistId: 10,
      category: "Photography",
      description: "Hypnotic patterns of wind-sculpted golden sand ridges in the Thar desert captured under low-raking sunset illumination.",
      price: 13200,
      type: "For Sale",
      image: "assets/images/watercolor-amber-rose.jpg",
      featured: false,
      status: "active",
      createdAt: "2026-03-08"
    },

    // --- Ethan Williams (Artist ID: 11, Modern Sculpture & Bronze) ---
    {
      id: 36,
      name: "Infinity in Bronze",
      artist: "Ethan Williams",
      artistId: 11,
      category: "Sculpture",
      description: "Seamless mobius loop cast in mirror-polished bronze, balanced effortlessly on a hand-carved black basalt pedestal.",
      price: 38000,
      type: "For Sale",
      image: "assets/images/abstract-monochrome-contrast.jpg",
      featured: true,
      status: "active",
      createdAt: "2026-02-22"
    },
    {
      id: 37,
      name: "Monolithic Spiral",
      artist: "Ethan Williams",
      artistId: 11,
      category: "Sculpture",
      description: "Brutalist architectural sculpture interweaving verdigris patinated bronze and raw quarried travertine stone blocks.",
      price: 30000,
      startingPrice: 30000,
      currentBid: 34500,
      currentBidder: "Kiran Reddy",
      bidsCount: 3,
      type: "Auction",
      auctionStatus: "LIVE",
      image: "assets/images/contemporary-expressive-field.jpg",
      featured: false,
      status: "active",
      createdAt: "2026-02-26"
    },
    {
      id: 38,
      name: "Flight of the Falcon",
      artist: "Ethan Williams",
      artistId: 11,
      category: "Sculpture",
      description: "Kinetic abstract bronze capturing the sweeping wingspan and aerodynamic tension of a falcon in high-speed dive.",
      price: 29000,
      type: "For Sale",
      image: "assets/images/nature-avian-forest.jpg",
      featured: false,
      status: "active",
      createdAt: "2026-03-02"
    },
    {
      id: 39,
      name: "Echoes of Carrara",
      artist: "Ethan Williams",
      artistId: 11,
      category: "Sculpture",
      description: "Monumental organic stone sculpture carved from pure Statuario marble, exploring flowing fluid forms frozen in solid mineral.",
      price: 40000,
      startingPrice: 40000,
      currentBid: 45000,
      winningBid: 45000,
      winnerName: "Rahul Sharma",
      winnerEmail: "rahul@artgallery.com",
      currentBidder: "Rahul Sharma",
      bidsCount: 4,
      type: "Auction",
      auctionStatus: "WINNER ANNOUNCED",
      image: "assets/images/oil-white-roses.jpg",
      featured: false,
      status: "active",
      createdAt: "2026-03-06"
    },
    {
      id: 40,
      name: "Sentinel of Stone",
      artist: "Ethan Williams",
      artistId: 11,
      category: "Sculpture",
      description: "Towering mixed-medium sculpture combining forged weathering steel, reclaimed teakwood, and hand-chiseled granite.",
      price: 48000,
      type: "For Sale",
      image: "assets/images/traditional-equestrian-group.jpg",
      featured: false,
      status: "active",
      createdAt: "2026-03-10"
    },

    // --- Isabella Rossi (Artist ID: 12, Minimalist & Line Art) ---
    {
      id: 41,
      name: "Graphite Elegance",
      artist: "Isabella Rossi",
      artistId: 12,
      category: "Drawing",
      description: "Masterful cross-hatch charcoal and graphite study of an Arabian stallion in motion, capturing muscular tension and dynamic energy.",
      price: 6500,
      type: "For Sale",
      image: "assets/images/oil-pastoral-meadow.jpg",
      featured: false,
      status: "active",
      createdAt: "2026-02-23"
    },
    {
      id: 42,
      name: "Line of Serenity",
      artist: "Isabella Rossi",
      artistId: 12,
      category: "Drawing",
      description: "Minimalist continuous-line drawing exploring the graceful contours of feminine movement with exquisite Zen simplicity.",
      price: 8200,
      type: "For Sale",
      image: "assets/images/floral-blush-petals.jpg",
      featured: true,
      status: "active",
      createdAt: "2026-02-27"
    },
    {
      id: 43,
      name: "Silent Silhouette",
      artist: "Isabella Rossi",
      artistId: 12,
      category: "Drawing",
      description: "Sumi ink wash and fine Japanese calligraphy pen illustration celebrating negative space and meditative balance.",
      price: 7500,
      startingPrice: 7500,
      currentBid: 9200,
      currentBidder: "Kiran Reddy",
      bidsCount: 2,
      type: "Auction",
      auctionStatus: "LIVE",
      image: "assets/images/floral-classical-still-life.jpg",
      featured: false,
      status: "active",
      createdAt: "2026-03-03"
    },
    {
      id: 44,
      name: "Fluid Equilibrium",
      artist: "Isabella Rossi",
      artistId: 12,
      category: "Drawing",
      description: "Experimental charcoal and raw pigment powder composition capturing tidal ripples and wind patterns over river sediment.",
      price: 10500,
      type: "For Sale",
      image: "assets/images/watercolor-cerulean-wash.jpg",
      featured: false,
      status: "active",
      createdAt: "2026-03-07"
    },
    {
      id: 45,
      name: "Contours of Dawn",
      artist: "Isabella Rossi",
      artistId: 12,
      category: "Drawing",
      description: "Intimate silverpoint drawing on prepared gesso ground, depicting botanical ivy vines intertwining in early morning light.",
      price: 7800,
      type: "For Sale",
      image: "assets/images/floral-vase-table.jpg",
      featured: false,
      status: "active",
      createdAt: "2026-03-11"
    },

    // --- Noah Thompson (Artist ID: 13, Cyberpunk & Generative 3D Art) ---
    {
      id: 46,
      name: "Neural Matrix 2099",
      artist: "Noah Thompson",
      artistId: 13,
      category: "Digital Art",
      description: "Algorithmic 3D generative simulation depicting synthetic neural pathways connecting across high-density quantum processors.",
      price: 17000,
      type: "For Sale",
      image: "assets/images/contemporary-gold-crimson.jpg",
      featured: true,
      status: "active",
      createdAt: "2026-02-24"
    },
    {
      id: 47,
      name: "Quantum Labyrinth",
      artist: "Noah Thompson",
      artistId: 13,
      category: "Digital Art",
      description: "Complex multi-dimensional fractal geometry rendered in ray-traced glass, obsidian, and chromatic dispersion.",
      price: 16500,
      type: "For Sale",
      image: "assets/images/oil-botanical-table.jpg",
      featured: false,
      status: "active",
      createdAt: "2026-02-28"
    },
    {
      id: 48,
      name: "Synthwave Horizon",
      artist: "Noah Thompson",
      artistId: 13,
      category: "Digital Art",
      description: "Retro-futuristic digital composition celebrating neon wireframe grids, chrome spheres, and endless glowing retro-tech horizons.",
      price: 13500,
      type: "For Sale",
      image: "assets/images/oil-sail-ship-sea.jpg",
      featured: false,
      status: "active",
      createdAt: "2026-03-04"
    },
    {
      id: 49,
      name: "Holographic Bloom",
      artist: "Noah Thompson",
      artistId: 13,
      category: "Digital Art",
      description: "Volumetric light simulation of an ethereal bioluminescent flower blossoming inside a cyberpunk megacity greenhouse.",
      price: 15000,
      type: "For Sale",
      image: "assets/images/floral-bloom-bouquet.jpg",
      featured: false,
      status: "active",
      createdAt: "2026-03-08"
    },
    {
      id: 50,
      name: "Cybernetic Renaissance",
      artist: "Noah Thompson",
      artistId: 13,
      category: "Digital Art",
      description: "Masterwork blending classical anatomical marble proportions with exposed fiber-optic nervous systems and liquid gold coolant conduits.",
      price: 21000,
      type: "For Sale",
      image: "assets/images/oil-crimson-roses.jpg",
      featured: false,
      status: "active",
      createdAt: "2026-03-12"
    }
  ];

  if (!localStorage.getItem('artworks')) {
    setData('artworks', initialArtworks);
  } else {
    // Enhance existing stored artworks with diverse fine art imagery
    try {
      const stored = getData('artworks', []);
      if (Array.isArray(stored) && stored.length > 0) {
        let changed = false;
        const diverseMap = {
          5: "assets/images/contemporary-solar-waters.jpg",
          12: "assets/images/watercolor-wildflower-hills.jpg",
          13: "assets/images/watercolor-meadow-trees.jpg",
          15: "assets/images/oil-golden-wheatfield.jpg",
          18: "assets/images/portrait-white-scarf.jpg",
          20: "assets/images/portrait-wildflower-field.jpg",
          23: "assets/images/abstract-azure-earth.jpg",
          26: "assets/images/traditional-palazzo-fresco.jpg",
          29: "assets/images/landscape-river-boat.jpg",
          30: "assets/images/floral-wildflowers-vase.jpg",
          32: "assets/images/landscape-mountain-lake.jpg",
          34: "assets/images/landscape-glacial-boat.jpg",
          42: "assets/images/floral-blush-petals.jpg",
          43: "assets/images/floral-classical-still-life.jpg",
          44: "assets/images/watercolor-cerulean-wash.jpg",
          48: "assets/images/oil-sail-ship-sea.jpg",
          50: "assets/images/oil-crimson-roses.jpg"
        };
        stored.forEach(a => {
          if (diverseMap[a.id] && a.image && a.image.startsWith('images/artworks/artwork-') && a.image !== diverseMap[a.id]) {
            a.image = diverseMap[a.id];
            changed = true;
          }
        });
        if (changed) {
          setData('artworks', stored);
        }
      }
    } catch (e) {
      console.warn("Artwork image mapping update skipped:", e);
    }
  }

  // 4. Sample Purchases (Buyer Orders)
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
      image: "assets/images/landscape-alpine-waters.jpg",
      status: "Confirmed",
      paymentMethod: "Online Card (Simulated)"
    },
    {
      id: 2,
      userId: 2,
      userName: "Kiran Reddy",
      artworkId: 5,
      artworkName: "Sunset Dreams",
      artist: "Elena Vance",
      price: 8500,
      date: "2026-03-22",
      image: "assets/images/contemporary-solar-waters.jpg",
      status: "Confirmed",
      paymentMethod: "Won at Auction"
    },
    {
      id: 3,
      userId: 5,
      userName: "Rahul Sharma",
      artworkId: 25,
      artworkName: "Ethereal Pulse",
      artist: "Olivia Morgan",
      price: 23000,
      date: "2026-03-24",
      image: "assets/images/abstract-crimson-amber.jpg",
      status: "Confirmed",
      paymentMethod: "Won at Auction"
    }
  ];

  if (!localStorage.getItem('purchases')) {
    setData('purchases', initialPurchases);
  }

  // 5. Favorites
  if (!localStorage.getItem('favorites')) {
    const initialFavorites = {
      "2": [1, 4, 11, 21, 36, 42]
    };
    setData('favorites', initialFavorites);
  }

  // 6. Bids History (10 LIVE Auctions & 5 Closed Auctions)
  const initialBids = [
    // Artwork #4: Lady in Saffron (Elena Vance, LIVE)
    { id: 1, artworkId: 4, artworkName: "Lady in Saffron", userId: 5, userName: "Rahul Sharma", userEmail: "rahul@artgallery.com", bidAmount: 23000, date: "2026-03-16 11:20", status: "Outbid" },
    { id: 2, artworkId: 4, artworkName: "Lady in Saffron", userId: 2, userName: "Kiran Reddy", userEmail: "user@artgallery.com", bidAmount: 25000, date: "2026-03-18 14:15", status: "Leading" },

    // Artwork #5: Sunset Dreams (Elena Vance, WINNER ANNOUNCED)
    { id: 3, artworkId: 5, artworkName: "Sunset Dreams", userId: 5, userName: "Rahul Sharma", userEmail: "rahul@artgallery.com", bidAmount: 6000, date: "2026-03-14 09:30", status: "Outbid" },
    { id: 4, artworkId: 5, artworkName: "Sunset Dreams", userId: 2, userName: "Kiran Reddy", userEmail: "user@artgallery.com", bidAmount: 8500, date: "2026-03-20 18:40", status: "Leading" },

    // Artwork #6: Neon Cyber Odyssey (Marcus Sterling, LIVE)
    { id: 5, artworkId: 6, artworkName: "Neon Cyber Odyssey", userId: 5, userName: "Rahul Sharma", userEmail: "rahul@artgallery.com", bidAmount: 13000, date: "2026-03-15 10:00", status: "Outbid" },
    { id: 6, artworkId: 6, artworkName: "Neon Cyber Odyssey", userId: 2, userName: "Kiran Reddy", userEmail: "user@artgallery.com", bidAmount: 14000, date: "2026-03-17 15:45", status: "Leading" },

    // Artwork #8: Geometric Reverie (Marcus Sterling, LIVE)
    { id: 7, artworkId: 8, artworkName: "Geometric Reverie", userId: 2, userName: "Kiran Reddy", userEmail: "user@artgallery.com", bidAmount: 12000, date: "2026-03-16 16:30", status: "Outbid" },
    { id: 8, artworkId: 8, artworkName: "Geometric Reverie", userId: 5, userName: "Rahul Sharma", userEmail: "rahul@artgallery.com", bidAmount: 13500, date: "2026-03-19 12:10", status: "Leading" },

    // Artwork #9: Marble Flora (Marcus Sterling, WINNER ANNOUNCED)
    { id: 9, artworkId: 9, artworkName: "Marble Flora", userId: 5, userName: "Rahul Sharma", userEmail: "rahul@artgallery.com", bidAmount: 44000, date: "2026-03-18 10:20", status: "Outbid" },
    { id: 10, artworkId: 9, artworkName: "Marble Flora", userId: 2, userName: "Kiran Reddy", userEmail: "user@artgallery.com", bidAmount: 47000, date: "2026-03-21 16:00", status: "Leading" },

    // Artwork #13: Sylvan Solitude (Sophia Bennett, LIVE)
    { id: 11, artworkId: 13, artworkName: "Sylvan Solitude", userId: 2, userName: "Kiran Reddy", userEmail: "user@artgallery.com", bidAmount: 19500, date: "2026-03-17 11:45", status: "Outbid" },
    { id: 12, artworkId: 13, artworkName: "Sylvan Solitude", userId: 5, userName: "Rahul Sharma", userEmail: "rahul@artgallery.com", bidAmount: 21500, date: "2026-03-19 17:20", status: "Leading" },

    // Artwork #15: Autumn Reverence (Sophia Bennett, WINNER ANNOUNCED)
    { id: 13, artworkId: 15, artworkName: "Autumn Reverence", userId: 5, userName: "Rahul Sharma", userEmail: "rahul@artgallery.com", bidAmount: 23000, date: "2026-03-19 14:00", status: "Outbid" },
    { id: 14, artworkId: 15, artworkName: "Autumn Reverence", userId: 2, userName: "Kiran Reddy", userEmail: "user@artgallery.com", bidAmount: 26000, date: "2026-03-22 15:30", status: "Leading" },

    // Artwork #18: Nomad of Ladakh (Daniel Carter, LIVE)
    { id: 15, artworkId: 18, artworkName: "Nomad of Ladakh", userId: 5, userName: "Rahul Sharma", userEmail: "rahul@artgallery.com", bidAmount: 17500, date: "2026-03-18 13:10", status: "Outbid" },
    { id: 16, artworkId: 18, artworkName: "Nomad of Ladakh", userId: 2, userName: "Kiran Reddy", userEmail: "user@artgallery.com", bidAmount: 19500, date: "2026-03-20 19:00", status: "Leading" },

    // Artwork #22: Prismatic Horizon (Olivia Morgan, LIVE)
    { id: 17, artworkId: 22, artworkName: "Prismatic Horizon", userId: 5, userName: "Rahul Sharma", userEmail: "rahul@artgallery.com", bidAmount: 16000, date: "2026-03-18 11:00", status: "Outbid" },
    { id: 18, artworkId: 22, artworkName: "Prismatic Horizon", userId: 2, userName: "Kiran Reddy", userEmail: "user@artgallery.com", bidAmount: 17500, date: "2026-03-20 14:15", status: "Leading" },

    // Artwork #25: Ethereal Pulse (Olivia Morgan, WINNER ANNOUNCED)
    { id: 19, artworkId: 25, artworkName: "Ethereal Pulse", userId: 2, userName: "Kiran Reddy", userEmail: "user@artgallery.com", bidAmount: 21000, date: "2026-03-20 16:30", status: "Outbid" },
    { id: 20, artworkId: 25, artworkName: "Ethereal Pulse", userId: 5, userName: "Rahul Sharma", userEmail: "rahul@artgallery.com", bidAmount: 23000, date: "2026-03-23 11:20", status: "Leading" },

    // Artwork #27: Temple of the Rising Sun (Arjun Mehta, LIVE)
    { id: 21, artworkId: 27, artworkName: "Temple of the Rising Sun", userId: 5, userName: "Rahul Sharma", userEmail: "rahul@artgallery.com", bidAmount: 26500, date: "2026-03-19 15:40", status: "Outbid" },
    { id: 22, artworkId: 27, artworkName: "Temple of the Rising Sun", userId: 2, userName: "Kiran Reddy", userEmail: "user@artgallery.com", bidAmount: 28000, date: "2026-03-21 17:50", status: "Leading" },

    // Artwork #33: Coastal Solitude (Maya Anderson, LIVE)
    { id: 23, artworkId: 33, artworkName: "Coastal Solitude", userId: 5, userName: "Rahul Sharma", userEmail: "rahul@artgallery.com", bidAmount: 15000, date: "2026-03-20 12:00", status: "Outbid" },
    { id: 24, artworkId: 33, artworkName: "Coastal Solitude", userId: 2, userName: "Kiran Reddy", userEmail: "user@artgallery.com", bidAmount: 16500, date: "2026-03-22 18:10", status: "Leading" },

    // Artwork #37: Monolithic Spiral (Ethan Williams, LIVE)
    { id: 25, artworkId: 37, artworkName: "Monolithic Spiral", userId: 5, userName: "Rahul Sharma", userEmail: "rahul@artgallery.com", bidAmount: 32000, date: "2026-03-21 14:20", status: "Outbid" },
    { id: 26, artworkId: 37, artworkName: "Monolithic Spiral", userId: 2, userName: "Kiran Reddy", userEmail: "user@artgallery.com", bidAmount: 34500, date: "2026-03-23 20:00", status: "Leading" },

    // Artwork #39: Echoes of Carrara (Ethan Williams, WINNER ANNOUNCED)
    { id: 27, artworkId: 39, artworkName: "Echoes of Carrara", userId: 2, userName: "Kiran Reddy", userEmail: "user@artgallery.com", bidAmount: 42500, date: "2026-03-21 10:15", status: "Outbid" },
    { id: 28, artworkId: 39, artworkName: "Echoes of Carrara", userId: 5, userName: "Rahul Sharma", userEmail: "rahul@artgallery.com", bidAmount: 45000, date: "2026-03-23 16:45", status: "Leading" },

    // Artwork #43: Silent Silhouette (Isabella Rossi, LIVE)
    { id: 29, artworkId: 43, artworkName: "Silent Silhouette", userId: 5, userName: "Rahul Sharma", userEmail: "rahul@artgallery.com", bidAmount: 8200, date: "2026-03-22 13:30", status: "Outbid" },
    { id: 30, artworkId: 43, artworkName: "Silent Silhouette", userId: 2, userName: "Kiran Reddy", userEmail: "user@artgallery.com", bidAmount: 9200, date: "2026-03-24 19:15", status: "Leading" }
  ];

  if (!localStorage.getItem('bids')) {
    setData('bids', initialBids);
    setData('auctionBids', initialBids);
  }

  // 7. Reviews (Collector Testimonials)
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
        artworkId: 6,
        artworkName: "Neon Cyber Odyssey",
        userId: 5,
        userName: "Rahul Sharma",
        rating: 5,
        comment: "The 3D cybernetic atmosphere and lighting contrasts are unreal. Truly top-tier digital mastery.",
        date: "2026-03-14"
      },
      {
        id: 3,
        artworkId: 11,
        artworkName: "Emerald Canopy",
        userId: 2,
        userName: "Kiran Reddy",
        rating: 5,
        comment: "Sophia Bennett captures forest light like no one else. The delicate glaze layers give remarkable depth.",
        date: "2026-03-16"
      },
      {
        id: 4,
        artworkId: 17,
        artworkName: "Gaze of Resilience",
        userId: 5,
        userName: "Rahul Sharma",
        rating: 5,
        comment: "The emotional gravitas in this portrait is mesmerizing. An instant conversation starter in our home.",
        date: "2026-03-17"
      },
      {
        id: 5,
        artworkId: 21,
        artworkName: "Chromatic Symphony",
        userId: 2,
        userName: "Kiran Reddy",
        rating: 5,
        comment: "A joyful explosion of harmonic color. Olivia Morgan's color psychology creates extraordinary energy.",
        date: "2026-03-18"
      },
      {
        id: 6,
        artworkId: 26,
        artworkName: "Royal Court of Mewar",
        userId: 5,
        userName: "Rahul Sharma",
        rating: 5,
        comment: "The gold leaf detailing and miniature precision remind one of royal museum collections. Truly magnificent.",
        date: "2026-03-19"
      },
      {
        id: 7,
        artworkId: 31,
        artworkName: "Soul of the Wild",
        userId: 2,
        userName: "Kiran Reddy",
        rating: 5,
        comment: "The depth and atmospheric lighting in this wildlife photograph are world-class fine art.",
        date: "2026-03-20"
      },
      {
        id: 8,
        artworkId: 36,
        artworkName: "Infinity in Bronze",
        userId: 5,
        userName: "Rahul Sharma",
        rating: 5,
        comment: "The balance and flawless mirror-polish finish of this bronze mobius loop are breathtaking.",
        date: "2026-03-21"
      },
      {
        id: 9,
        artworkId: 42,
        artworkName: "Line of Serenity",
        userId: 2,
        userName: "Kiran Reddy",
        rating: 5,
        comment: "Minimalist perfection. Isabella Rossi achieves so much emotion with pure, fluid continuous line work.",
        date: "2026-03-22"
      },
      {
        id: 10,
        artworkId: 46,
        artworkName: "Neural Matrix 2099",
        userId: 5,
        userName: "Rahul Sharma",
        rating: 5,
        comment: "Noah Thompson's generative cyberpunk aesthetic is unlike anything in contemporary digital art. Stunning.",
        date: "2026-03-23"
      }
    ];
    setData('reviews', initialReviews);
  }

  // 8. Auction Results Store (Official Admin Announced Winners)
  const initialAuctionResults = [
    {
      id: 1,
      artworkId: 5,
      artworkName: "Sunset Dreams",
      artist: "Elena Vance",
      winnerName: "Kiran Reddy",
      winnerEmail: "user@artgallery.com",
      winningBid: 8500,
      announcedAt: "2026-03-22"
    },
    {
      id: 2,
      artworkId: 9,
      artworkName: "Marble Flora",
      artist: "Marcus Sterling",
      winnerName: "Kiran Reddy",
      winnerEmail: "user@artgallery.com",
      winningBid: 47000,
      announcedAt: "2026-03-23"
    },
    {
      id: 3,
      artworkId: 15,
      artworkName: "Autumn Reverence",
      artist: "Sophia Bennett",
      winnerName: "Kiran Reddy",
      winnerEmail: "user@artgallery.com",
      winningBid: 26000,
      announcedAt: "2026-03-23"
    },
    {
      id: 4,
      artworkId: 25,
      artworkName: "Ethereal Pulse",
      artist: "Olivia Morgan",
      winnerName: "Rahul Sharma",
      winnerEmail: "rahul@artgallery.com",
      winningBid: 23000,
      announcedAt: "2026-03-24"
    },
    {
      id: 5,
      artworkId: 39,
      artworkName: "Echoes of Carrara",
      artist: "Ethan Williams",
      winnerName: "Rahul Sharma",
      winnerEmail: "rahul@artgallery.com",
      winningBid: 45000,
      announcedAt: "2026-03-24"
    }
  ];

  if (!localStorage.getItem('auctionResults')) {
    setData('auctionResults', initialAuctionResults);
  }

  // 9. Retro-compatibility & Live Storage Migration
  // Automatically upgrades active browser sessions to the complete 10-artist, 50-artwork catalog
  try {
    // A. One-time Account Reset & Admin Sync (Preserves all artworks, categories, bids, reviews, and purchases)
    if (localStorage.getItem('artloom_account_reset_v3') !== 'done') {
      // Clear existing login sessions across all roles (user, artist, admin)
      removeData('currentUser');
      // Remove previously registered user, artist, and old admin accounts without recreating defaults
      setData('users', initialUsers.slice());
      localStorage.setItem('artloom_account_reset_v3', 'done');
      localStorage.setItem('artloom_sec_v2', 'done');
    } else {
      const currentUsers = getData('users', []);
      let filteredUsers = Array.isArray(currentUsers)
        ? currentUsers.filter(u => (u.role || '').toLowerCase() !== 'admin')
        : [];

      if (hasLocalAdmin) {
        const existingAdmin = Array.isArray(currentUsers)
          ? currentUsers.find(u => (u.role || '').toLowerCase() === 'admin' && u.email && u.email.toLowerCase() === adminEmail.toLowerCase())
          : null;
        const adminRecord = existingAdmin
          ? { ...existingAdmin, email: adminEmail, password: adminPassword }
          : initialUsers[0];
        filteredUsers.unshift(adminRecord);
      }

      if (JSON.stringify(currentUsers) !== JSON.stringify(filteredUsers)) {
        setData('users', filteredUsers);
      }
    }

    // B. Sync and Upgrade Artworks (Ensure all 50 sample artworks exist)
    const currentArtworks = getData('artworks', []);
    if (!currentArtworks || currentArtworks.length < 40) {
      setData('artworks', initialArtworks);
    } else {
      if (localStorage.getItem('zenith_migration_v3')) {
        const sampleById = {};
        initialArtworks.forEach(s => { sampleById[s.id] = s; });
        currentArtworks.forEach((art, idx) => {
          if (sampleById[art.id] && art.isSample) {
            currentArtworks[idx] = {
              ...sampleById[art.id],
              currentBid: art.currentBid || sampleById[art.id].currentBid,
              currentBidder: art.currentBidder || sampleById[art.id].currentBidder,
              auctionStatus: art.auctionStatus || sampleById[art.id].auctionStatus,
              winnerName: art.winnerName || sampleById[art.id].winnerName,
              winningBid: art.winningBid || sampleById[art.id].winningBid
            };
          }
        });
        localStorage.removeItem('zenith_migration_v3');
        setData('artworks', currentArtworks);
      }
      // Validate auction properties on existing artworks
    const curatedGalleryMap = {
      1: "assets/images/landscape-alpine-waters.jpg",
      2: "assets/images/landscape-coastal-waters.jpg",
      3: "assets/images/abstract-cobalt-crimson.jpg",
      4: "assets/images/portrait-blue-vessel.jpg",
      5: "assets/images/contemporary-solar-waters.jpg",
      6: "assets/images/contemporary-chromatic-wave.jpg",
      7: "assets/images/modern-twin-forms.jpg",
      8: "assets/images/modern-primary-composition.jpg",
      9: "assets/images/floral-pale-roses.jpg",
      10: "assets/images/traditional-dome-waterfront.jpg",
      11: "assets/images/nature-forest-waters.jpg",
      12: "assets/images/watercolor-wildflower-hills.jpg",
      13: "assets/images/watercolor-meadow-trees.jpg",
      14: "assets/images/landscape-trees-rock.jpg",
      15: "assets/images/oil-golden-wheatfield.jpg",
      16: "assets/images/traditional-cabin-gate.jpg",
      17: "assets/images/portrait-dark-elegance.jpg",
      18: "assets/images/portrait-white-scarf.jpg",
      19: "assets/images/portrait-profile-collar.jpg",
      20: "assets/images/portrait-wildflower-field.jpg",
      21: "assets/images/abstract-bold-brushstrokes.jpg",
      22: "assets/images/modern-emerald-ochre.jpg",
      23: "assets/images/abstract-azure-earth.jpg",
      24: "assets/images/modern-organic-forms.jpg",
      25: "assets/images/abstract-crimson-amber.jpg",
      26: "assets/images/traditional-palazzo-fresco.jpg",
      27: "assets/images/traditional-baroque-fresco.jpg",
      28: "assets/images/traditional-cathedral-gathering.jpg",
      29: "assets/images/landscape-river-boat.jpg",
      30: "assets/images/floral-wildflowers-vase.jpg",
      31: "assets/images/nature-highland-deer.jpg",
      32: "assets/images/landscape-mountain-lake.jpg",
      33: "assets/images/landscape-island-vista.jpg",
      34: "assets/images/landscape-glacial-boat.jpg",
      35: "assets/images/watercolor-amber-rose.jpg",
      36: "assets/images/abstract-monochrome-contrast.jpg",
      37: "assets/images/contemporary-expressive-field.jpg",
      38: "assets/images/nature-avian-forest.jpg",
      39: "assets/images/oil-white-roses.jpg",
      40: "assets/images/traditional-equestrian-group.jpg",
      41: "assets/images/oil-pastoral-meadow.jpg",
      42: "assets/images/floral-blush-petals.jpg",
      43: "assets/images/floral-classical-still-life.jpg",
      44: "assets/images/watercolor-cerulean-wash.jpg",
      45: "assets/images/floral-vase-table.jpg",
      46: "assets/images/contemporary-gold-crimson.jpg",
      47: "assets/images/oil-botanical-table.jpg",
      48: "assets/images/oil-sail-ship-sea.jpg",
      49: "assets/images/floral-bloom-bouquet.jpg",
      50: "assets/images/oil-crimson-roses.jpg"
    };
    let artworksModified = false;
    currentArtworks.forEach(art => {
      const isSampleImg = !art.image || art.image.startsWith("images/artworks/") || art.image.startsWith("assets/images/");
      if (curatedGalleryMap[art.id] && isSampleImg && art.image !== curatedGalleryMap[art.id]) {
        art.image = curatedGalleryMap[art.id];
        artworksModified = true;
      }
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

    // C. Sync auctionBids key
    const currentBids = getData('bids', []);
    if (!currentBids || currentBids.length < 20) {
      setData('bids', initialBids);
      setData('auctionBids', initialBids);
    } else if (!localStorage.getItem('auctionBids')) {
      setData('auctionBids', currentBids);
    }

    // D. Sync auctionResults
    const currentResults = getData('auctionResults', []);
    if (!currentResults || currentResults.length < 5) {
      setData('auctionResults', initialAuctionResults);
    }

    // E. Sync purchases
    const currentPurchases = getData('purchases', []);
    if (!currentPurchases || currentPurchases.length < 3) {
      setData('purchases', initialPurchases);
    }

    // F. Ensure all bids have userEmail
    const bidsToCheck = getData('bids', []);
    let bidsModified = false;
    if (bidsToCheck && bidsToCheck.length > 0) {
      const allUsers = getData('users', initialUsers);
      bidsToCheck.forEach(b => {
        if (!b.userEmail) {
          const userObj = allUsers.find(u => u.id === b.userId);
          b.userEmail = userObj ? userObj.email : '';
          bidsModified = true;
        }
      });
      if (bidsModified) {
        setData('bids', bidsToCheck);
        setData('auctionBids', bidsToCheck);
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
