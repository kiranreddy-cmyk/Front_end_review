/**
 * auth.js - Authentication, Role Protection, and Dynamic Navigation
 * ZENITH Fine Art Gallery & Auction House
 *
 * SECURITY NOTICE:
 * This project uses client-side authentication with LocalStorage purely for
 * frontend demonstration purposes. Client-side credential checks are NOT
 * production-level security; production deployments require server-side
 * authentication, password hashing, and HTTP-only session tokens.
 */

// ============================================================================
// Admin Credentials Configuration (Loaded from gitignored js/config.local.js)
// ============================================================================
const LOCAL_ADMIN_CFG = (typeof window !== 'undefined' && window.ZENITH_LOCAL_CONFIG && window.ZENITH_LOCAL_CONFIG.admin)
  ? window.ZENITH_LOCAL_CONFIG.admin
  : {};

const DEFAULT_ADMIN_CONFIG = {
  email: String(LOCAL_ADMIN_CFG.email || '').trim(),
  password: String(LOCAL_ADMIN_CFG.password || ''),
  securityCode: String(LOCAL_ADMIN_CFG.securityCode || '').trim(),
  authVersion: Number(LOCAL_ADMIN_CFG.authVersion || 2)
};
const ADMIN_SECURITY_CODE = DEFAULT_ADMIN_CONFIG.securityCode;

// Normalize any role string to 'user', 'artist', or 'admin'
function normalizeRoleString(roleValue) {
  if (!roleValue) return '';
  const val = String(roleValue).trim().toLowerCase();
  if (val === 'buyer' || val === 'buyer / user' || val === 'buyer/user' || val === 'collector' || val === 'user') {
    return 'user';
  }
  if (val === 'artist') return 'artist';
  if (val === 'admin' || val === 'administrator') return 'admin';
  return val;
}

// Safely get normalized lowercase role from a user object
function getNormalizedRole(user) {
  if (!user || !user.role) return '';
  return normalizeRoleString(user.role);
}

// Get Logged In User (validating migrated admin session integrity)
function getCurrentUser() {
  const user = getData('currentUser', null);
  if (!user) return null;

  // Invalidate any legacy admin session from before the credential migration
  if (getNormalizedRole(user) === 'admin') {
    const emailMatch = user.email && user.email.toLowerCase() === DEFAULT_ADMIN_CONFIG.email.toLowerCase();
    if (!emailMatch || user.authVersion !== DEFAULT_ADMIN_CONFIG.authVersion) {
      removeData('currentUser');
      return null;
    }
  }

  return user;
}

// Set Logged In User (omitting raw password from active session storage)
function setCurrentUser(user) {
  if (!user) {
    return removeData('currentUser');
  }
  const safeSessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    specialization: user.specialization,
    bio: user.bio,
    createdAt: user.createdAt,
    authVersion: getNormalizedRole(user) === 'admin' ? DEFAULT_ADMIN_CONFIG.authVersion : 1
  };
  return setData('currentUser', safeSessionUser);
}

// Logout
function logout() {
  removeData('currentUser');
  showToast('Logged out successfully', 'info');
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 500);
}

// Route Guard & Protection for Dashboard Pages
function requireAuth(allowedRoles = []) {
  const user = getCurrentUser();
  if (!user) {
    window.location.replace('login.html');
    return null;
  }

  const role = getNormalizedRole(user);

  if (allowedRoles.length > 0) {
    const normalizedAllowed = allowedRoles.map(r => normalizeRoleString(r));
    if (!normalizedAllowed.includes(role)) {
      if (role === 'admin') {
        window.location.replace('admin-dashboard.html');
      } else if (role === 'artist') {
        window.location.replace('artist-dashboard.html');
      } else {
        window.location.replace('user-dashboard.html');
      }
      return null;
    }
  }

  return user;
}

// Render Dynamic Header Navigation Consistently Across All Pages
function renderNavigation() {
  const user = getCurrentUser();
  const navLinksContainer = document.getElementById('navLinks');
  const navActionsContainer = document.getElementById('navActions');
  const role = getNormalizedRole(user);

  let currentFile = window.location.pathname.split('/').pop().toLowerCase();
  if (!currentFile || currentFile === '') {
    currentFile = 'index.html';
  }

  if (navLinksContainer) {
    let linksHTML = `
      <li><a href="index.html" class="${currentFile === 'index.html' ? 'active' : ''}">Home</a></li>
      <li><a href="artworks.html" class="${currentFile === 'artworks.html' || currentFile === 'artwork-details.html' ? 'active' : ''}">Gallery</a></li>
      <li><a href="artist-profile.html" class="${currentFile === 'artist-profile.html' ? 'active' : ''}">Artists</a></li>
      <li><a href="auction.html" class="${currentFile === 'auction.html' ? 'active' : ''}">Auctions</a></li>
      <li><a href="exhibitions.html" class="${currentFile === 'exhibitions.html' ? 'active' : ''}">Exhibitions</a></li>
      <li><a href="reviews.html" class="${currentFile === 'reviews.html' ? 'active' : ''}">Reviews</a></li>
      <li><a href="about.html" class="${currentFile === 'about.html' ? 'active' : ''}">About</a></li>
    `;

    if (role === 'admin') {
      linksHTML += `<li><a href="admin-dashboard.html" class="${currentFile === 'admin-dashboard.html' ? 'active' : ''}">Admin</a></li>`;
    } else if (role === 'artist') {
      linksHTML += `<li><a href="artist-dashboard.html" class="${currentFile === 'artist-dashboard.html' ? 'active' : ''}">Artist Studio</a></li>`;
    } else if (role === 'user') {
      linksHTML += `<li><a href="user-dashboard.html" class="${currentFile === 'user-dashboard.html' ? 'active' : ''}">My Salon</a></li>`;
    }

    navLinksContainer.innerHTML = linksHTML;
  }

  if (navActionsContainer) {
    const cart = getData('cart', []);
    const cartCount = Array.isArray(cart) ? cart.length : 0;
    const cartBtnHTML = `
      <button type="button" class="cart-trigger-btn" onclick="openCartDrawer()" aria-label="Open Shopping Cart" title="Acquisition Cart">
        <span>🛒</span>
        <span class="cart-count-badge ${cartCount === 0 ? 'is-empty' : ''}" id="navCartCount">${cartCount}</span>
      </button>
    `;

    if (user) {
      let dashboardLink = 'user-dashboard.html';
      let dashboardBtnText = 'Dashboard';
      if (role === 'admin') {
        dashboardLink = 'admin-dashboard.html';
        dashboardBtnText = 'Admin Panel';
      } else if (role === 'artist') {
        dashboardLink = 'artist-dashboard.html';
        dashboardBtnText = 'Studio';
      }

      const avatarUrl = user.avatar || (role === 'artist' ? 'images/avatar-artist.svg' : role === 'admin' ? 'images/avatar-admin.svg' : 'images/avatar-user.svg');

      navActionsContainer.innerHTML = `
        ${cartBtnHTML}
        <div class="user-badge-pill">
          <img src="${avatarUrl}" alt="${user.name}" class="user-avatar-sm">
          <span>${user.name.split(' ')[0]}</span>
          <span class="role-tag role-${role}">${role === 'user' ? 'Collector' : user.role}</span>
        </div>
        <a href="${dashboardLink}" class="btn btn-sm btn-primary nav-dashboard-btn">${dashboardBtnText}</a>
        <button type="button" onclick="logout()" class="btn btn-sm btn-outline" title="Logout">Logout</button>
      `;
    } else {
      navActionsContainer.innerHTML = `
        ${cartBtnHTML}
        <a href="login.html" class="btn btn-sm btn-outline ${currentFile === 'login.html' ? 'active' : ''}">Sign In</a>
        <a href="signup.html" class="btn btn-sm btn-accent ${currentFile === 'signup.html' ? 'active' : ''}">Join</a>
      `;
    }
  }

  // Mobile hamburger toggle
  const menuToggle = document.getElementById('menuToggle');
  if (menuToggle && navLinksContainer && !menuToggle.dataset.bound) {
    menuToggle.dataset.bound = 'true';
    menuToggle.addEventListener('click', () => {
      navLinksContainer.classList.toggle('show');
    });
  }
}

// Show/Hide Admin Security Code field & update button label based on selected role
function handleLoginRoleChange() {
  const roleSelect = document.getElementById('loginRole');
  const adminCodeGroup = document.getElementById('adminCodeGroup');
  const adminCodeInput = document.getElementById('adminCode');
  const submitBtn = document.getElementById('loginSubmitBtn');
  const errorEl = document.getElementById('loginError');
  const roleTabs = document.querySelectorAll('.auth-role-tab');

  if (!roleSelect) return;

  const selectedRole = normalizeRoleString(roleSelect.value);

  roleTabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.role === selectedRole);
  });

  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.remove('show');
  }

  if (adminCodeGroup && adminCodeInput) {
    if (selectedRole === 'admin') {
      adminCodeGroup.style.display = 'flex';
      adminCodeInput.required = true;
    } else {
      adminCodeGroup.style.display = 'none';
      adminCodeInput.required = false;
      adminCodeInput.value = '';
    }
  }

  if (submitBtn) {
    submitBtn.textContent = selectedRole === 'admin' ? 'Admin Login' : 'Sign In';
  }
}

// Switch login role via role tabs
function selectLoginRoleTab(role) {
  const roleSelect = document.getElementById('loginRole');
  if (!roleSelect) return;
  roleSelect.value = normalizeRoleString(role);
  handleLoginRoleChange();
}

// Toggle masked field visibility (Password / Security Code)
function toggleFieldVisibility(inputId, btnElement) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isMasked = input.type === 'password';
  input.type = isMasked ? 'text' : 'password';
  if (btnElement) {
    btnElement.textContent = isMasked ? 'Hide' : 'Show';
    btnElement.setAttribute('aria-pressed', String(isMasked));
  }
}

// Core Login Authentication & Role Verification Logic
function authenticateLogin({ selectedRole, email, password, adminCode }) {
  const normSelectedRole = normalizeRoleString(selectedRole);
  const trimmedEmail = String(email || '').trim();
  const rawPassword = String(password || '');
  const trimmedAdminCode = String(adminCode || '').trim();

  if (!normSelectedRole || !['user', 'artist', 'admin'].includes(normSelectedRole)) {
    return { success: false, error: 'Please select a valid account type (Collector, Artist, or Admin).' };
  }

  // Admin Login Flow (Requires Email Address, Password, and Security Code)
  if (normSelectedRole === 'admin') {
    if (!DEFAULT_ADMIN_CONFIG.email || !DEFAULT_ADMIN_CONFIG.password || !ADMIN_SECURITY_CODE) {
      return {
        success: false,
        error: 'Local administrator credentials are not configured. Copy js/config.example.js to js/config.local.js.'
      };
    }
    if (!trimmedEmail) {
      return { success: false, error: 'Please enter your Admin email address.' };
    }
    if (!rawPassword) {
      return { success: false, error: 'Please enter your Admin password.' };
    }
    if (!trimmedAdminCode) {
      return { success: false, error: 'Security Code is required for Admin login.' };
    }

    const users = getData('users', []);
    let adminUser = users.find(u =>
      getNormalizedRole(u) === 'admin' &&
      u.email && u.email.toLowerCase() === trimmedEmail.toLowerCase()
    );

    const isExpectedAdminEmail = trimmedEmail.toLowerCase() === DEFAULT_ADMIN_CONFIG.email.toLowerCase();
    if (!isExpectedAdminEmail || !adminUser) {
      return { success: false, error: 'Invalid Admin email address. Access denied.' };
    }

    if (rawPassword !== DEFAULT_ADMIN_CONFIG.password || rawPassword !== adminUser.password) {
      return { success: false, error: 'Invalid Admin password. Please verify your credentials.' };
    }

    if (trimmedAdminCode !== ADMIN_SECURITY_CODE) {
      return { success: false, error: 'Invalid Security Code. Admin authentication failed.' };
    }

    return {
      success: true,
      user: { ...adminUser, authVersion: DEFAULT_ADMIN_CONFIG.authVersion },
      redirectUrl: 'admin-dashboard.html'
    };
  }

  // Collector (User) and Artist Login Flow
  if (!trimmedEmail || !rawPassword) {
    return { success: false, error: 'Please enter both Email Address and Password.' };
  }

  const users = getData('users', []);
  const matchedUser = users.find(u => {
    const emailMatch = u.email && u.email.toLowerCase() === trimmedEmail.toLowerCase();
    const nameMatch = u.name && u.name.toLowerCase() === trimmedEmail.toLowerCase();
    return (emailMatch || nameMatch) && u.password === rawPassword;
  });

  if (!matchedUser) {
    return { success: false, error: 'Invalid email address or password. Please try again.' };
  }

  const actualUserRole = getNormalizedRole(matchedUser);

  if (actualUserRole !== normSelectedRole) {
    if (actualUserRole === 'admin') {
      return {
        success: false,
        error: 'Administrator accounts must sign in through the Admin portal with a valid Security Code.'
      };
    }
    return {
      success: false,
      error: `Account type mismatch: this account is registered as "${matchedUser.role}". Please choose the matching role.`
    };
  }

  const redirectUrl = actualUserRole === 'artist' ? 'artist-dashboard.html' : 'user-dashboard.html';
  return {
    success: true,
    user: matchedUser,
    redirectUrl
  };
}

// Handle Login Form Submission
function initLoginForm() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  // Ensure all login inputs are cleared on page load
  ['email', 'password', 'adminCode'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  const roleSelect = document.getElementById('loginRole');
  if (roleSelect && !roleSelect.dataset.bound) {
    roleSelect.dataset.bound = 'true';
    roleSelect.addEventListener('change', handleLoginRoleChange);
  }
  handleLoginRoleChange();

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const selectedRole = roleSelect ? roleSelect.value : 'user';
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const adminCodeEl = document.getElementById('adminCode');
    const adminCode = adminCodeEl ? adminCodeEl.value : '';
    const errorEl = document.getElementById('loginError');

    const result = authenticateLogin({
      selectedRole,
      email,
      password,
      adminCode
    });

    if (!result.success) {
      if (errorEl) {
        errorEl.textContent = result.error;
        errorEl.classList.add('show');
      }
      showToast(result.error, 'error');
      return;
    }

    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('show');
    }

    setCurrentUser(result.user);
    showToast(`Welcome back, ${result.user.name}!`, 'success');

    setTimeout(() => {
      window.location.href = result.redirectUrl;
    }, 650);
  });
}

// Handle Signup Form Submission
function initSignupForm() {
  const signupForm = document.getElementById('signupForm');
  if (!signupForm) return;

  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const role = document.getElementById('role').value;
    const errorEl = document.getElementById('signupError');

    if (!name || !email || !password || !confirmPassword || !role) {
      if (errorEl) {
        errorEl.textContent = 'All required fields must be filled.';
        errorEl.classList.add('show');
      }
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      if (errorEl) {
        errorEl.textContent = 'Please provide a valid email address.';
        errorEl.classList.add('show');
      }
      return;
    }

    if (password.length < 6) {
      if (errorEl) {
        errorEl.textContent = 'Password must be at least 6 characters long.';
        errorEl.classList.add('show');
      }
      return;
    }

    if (password !== confirmPassword) {
      if (errorEl) {
        errorEl.textContent = 'Passwords do not match.';
        errorEl.classList.add('show');
      }
      return;
    }

    const users = getData('users', []);
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      if (errorEl) {
        errorEl.textContent = 'An account with this email already exists. Please sign in.';
        errorEl.classList.add('show');
      }
      return;
    }

    const normalizedRole = normalizeRoleString(role);

    const newUser = {
      id: getNextId(users),
      name,
      email,
      password,
      role: normalizedRole === 'artist' ? 'artist' : 'user',
      avatar: normalizedRole === 'artist' ? 'images/avatar-artist.svg' : 'images/avatar-user.svg',
      createdAt: new Date().toISOString().slice(0, 10)
    };

    if (normalizedRole === 'artist') {
      newUser.specialization = 'Fine Art Painting';
      newUser.bio = 'Independent artist showcasing original works at ZENITH Fine Art Gallery.';
    }

    users.push(newUser);
    setData('users', users);

    if (errorEl) errorEl.classList.remove('show');
    showToast('Account created! Redirecting to sign in...', 'success');

    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1000);
  });
}

// Run dynamic navigation render on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  renderNavigation();
  initLoginForm();
  initSignupForm();
});
