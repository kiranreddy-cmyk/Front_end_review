/**
 * auth.js - Authentication, Role Protection, and Dynamic Navigation
 * Online Art Gallery (ArtLoom) - SDC Project Review-1
 * Strictly Vanilla JavaScript & LocalStorage
 */

// ============================================================================
// Single-location Default Admin Credentials Configuration
// Note: Client-side authentication is for frontend demonstration only and is
// not production-level security. Uses gitignored js/config.local.js locally
// when present, falling back to public academic demo credentials on static hosts.
// ============================================================================
const LOCAL_ADMIN_CFG = (typeof window !== 'undefined' && window.ZENITH_LOCAL_CONFIG && window.ZENITH_LOCAL_CONFIG.admin)
  ? window.ZENITH_LOCAL_CONFIG.admin
  : {};

const PUBLIC_DEMO_ADMIN = {
  email: '2500031595cse4@gmail.com',
  password: 'ArtLoomDemo@123',
  securityCode: '123',
  authVersion: 3
};

const DEFAULT_ADMIN_CONFIG = {
  email: String(LOCAL_ADMIN_CFG.email || PUBLIC_DEMO_ADMIN.email).trim().toLowerCase(),
  password: String(LOCAL_ADMIN_CFG.password || PUBLIC_DEMO_ADMIN.password),
  securityCode: String(LOCAL_ADMIN_CFG.securityCode || PUBLIC_DEMO_ADMIN.securityCode).trim(),
  authVersion: Number(LOCAL_ADMIN_CFG.authVersion || PUBLIC_DEMO_ADMIN.authVersion)
};
const ADMIN_SECURITY_CODE = DEFAULT_ADMIN_CONFIG.securityCode;

// Normalize any role string to 'user', 'artist', or 'admin'
function normalizeRoleString(roleValue) {
  if (!roleValue) return '';
  const val = String(roleValue).trim().toLowerCase();
  if (val === 'buyer' || val === 'buyer / user' || val === 'buyer/user' || val === 'user') {
    return 'user';
  }
  if (val === 'artist') return 'artist';
  if (val === 'admin' || val === 'administrator') return 'admin';
  return val;
}

// Helper to safely get normalized lowercase role from a user object
function getNormalizedRole(user) {
  if (!user || !user.role) return '';
  return normalizeRoleString(user.role);
}

// Helper to check whether the current logged-in account is an Administrator
function isCurrentUserAdmin() {
  return getNormalizedRole(getCurrentUser()) === 'admin';
}

// Helper to check whether the current logged-in account is restricted from customer actions (Admin or Artist)
function isCustomerActionRestrictedRole() {
  const role = getNormalizedRole(getCurrentUser());
  return role === 'admin' || role === 'artist';
}

// Get Logged In User
function getCurrentUser() {
  const user = getData('currentUser', null);
  if (user && getNormalizedRole(user) === 'admin') {
    const normalizedUserEmail = String(user.email || '').trim().toLowerCase();
    const expectedAdminEmail = String(DEFAULT_ADMIN_CONFIG.email || '').trim().toLowerCase();
    const emailMatches = Boolean(expectedAdminEmail && normalizedUserEmail && normalizedUserEmail === expectedAdminEmail);
    if (!emailMatches || user.authVersion !== DEFAULT_ADMIN_CONFIG.authVersion) {
      removeData('currentUser');
      return null;
    }
  }
  return user;
}

// Set Logged In User
function setCurrentUser(user) {
  return setData('currentUser', user);
}

// Logout
function logout() {
  removeData('currentUser');
  showToast('Logged out successfully', 'info');
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 600);
}

// Route Guard & Protection for Dashboard Pages
function requireAuth(allowedRoles = []) {
  const user = getCurrentUser();
  if (!user) {
    // Guest trying to access protected page
    window.location.href = 'login.html';
    return null;
  }

  const role = getNormalizedRole(user);

  if (allowedRoles.length > 0) {
    const normalizedAllowed = allowedRoles.map(r => normalizeRoleString(r));
    if (!normalizedAllowed.includes(role)) {
      // Unauthorized role - redirect to appropriate dashboard
      if (role === 'admin') {
        window.location.href = 'admin-dashboard.html';
      } else if (role === 'artist') {
        window.location.href = 'artist-dashboard.html';
      } else {
        window.location.href = 'user-dashboard.html';
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

  // Detect current page filename
  let currentFile = window.location.pathname.split('/').pop().toLowerCase();
  if (!currentFile || currentFile === '') {
    currentFile = 'index.html';
  }

  // 1. Render main navigation links consistently across ALL pages
  if (navLinksContainer) {
    let linksHTML = `
      <li><a href="index.html" class="${currentFile === 'index.html' ? 'active' : ''}">Home</a></li>
      <li><a href="artworks.html" class="${currentFile === 'artworks.html' || currentFile === 'artwork-details.html' ? 'active' : ''}">Gallery</a></li>
      <li><a href="artist-profile.html" class="${currentFile === 'artist-profile.html' ? 'active' : ''}">Artists</a></li>
      <li><a href="auction.html" class="${currentFile === 'auction.html' ? 'active' : ''}">Auctions</a></li>
      <li><a href="reviews.html" class="${currentFile === 'reviews.html' ? 'active' : ''}">Reviews</a></li>
      <li><a href="about.html" class="${currentFile === 'about.html' ? 'active' : ''}">About</a></li>
    `;

    // Role-specific dashboard link in main navigation
    if (role === 'admin') {
      linksHTML += `<li><a href="admin-dashboard.html" class="${currentFile === 'admin-dashboard.html' ? 'active' : ''}">Admin Dashboard</a></li>`;
    } else if (role === 'artist') {
      linksHTML += `<li><a href="artist-dashboard.html" class="${currentFile === 'artist-dashboard.html' ? 'active' : ''}">Artist Dashboard</a></li>`;
    } else if (role === 'user') {
      linksHTML += `<li><a href="user-dashboard.html" class="${currentFile === 'user-dashboard.html' ? 'active' : ''}">User Dashboard</a></li>`;
    }

    navLinksContainer.innerHTML = linksHTML;
  }

  // 2. Render user action controls (Badge, Dashboard, Logout or Login/Signup)
  if (navActionsContainer) {
    if (user) {
      let dashboardLink = 'user-dashboard.html';
      let dashboardBtnText = 'User Dashboard';
      if (role === 'admin') {
        dashboardLink = 'admin-dashboard.html';
        dashboardBtnText = 'Admin Dashboard';
      } else if (role === 'artist') {
        dashboardLink = 'artist-dashboard.html';
        dashboardBtnText = 'Artist Dashboard';
      }

      const avatarUrl = user.avatar || (role === 'artist' ? 'images/avatar-artist.svg' : role === 'admin' ? 'images/avatar-admin.svg' : 'images/avatar-user.svg');

      navActionsContainer.innerHTML = `
        <div class="user-badge-pill">
          <img src="${avatarUrl}" alt="${user.name}" class="user-avatar-sm">
          <span>${user.name.split(' ')[0]}</span>
          <span class="role-tag role-${role}">${user.role}</span>
        </div>
        <a href="${dashboardLink}" class="btn btn-sm btn-primary">${dashboardBtnText}</a>
        <button onclick="logout()" class="btn btn-sm btn-outline" title="Logout">Logout</button>
      `;
    } else {
      navActionsContainer.innerHTML = `
        <a href="login.html" class="btn btn-sm btn-outline ${currentFile === 'login.html' ? 'active' : ''}">Login</a>
        <a href="signup.html" class="btn btn-sm btn-accent ${currentFile === 'signup.html' ? 'active' : ''}">Sign Up</a>
      `;
    }
  }

  // Setup Mobile Hamburger Menu Toggle (safely bind once)
  const menuToggle = document.getElementById('menuToggle');
  if (menuToggle && navLinksContainer && !menuToggle.dataset.bound) {
    menuToggle.dataset.bound = 'true';
    menuToggle.addEventListener('click', () => {
      navLinksContainer.classList.toggle('show');
    });
  }
}

// Show/Hide Admin Security Code field based on selected role
function handleLoginRoleChange() {
  const roleSelect = document.getElementById('loginRole');
  const adminCodeGroup = document.getElementById('adminCodeGroup');
  const adminCodeInput = document.getElementById('adminCode');
  const errorEl = document.getElementById('loginError');

  if (!roleSelect) return;

  const selectedRole = normalizeRoleString(roleSelect.value);

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
}

// Core Login Authentication & Role Verification Logic
function authenticateLogin({ selectedRole, email, password, adminCode }) {
  const normSelectedRole = normalizeRoleString(selectedRole);
  const trimmedEmail = String(email || '').trim();
  const normalizedEmail = trimmedEmail.toLowerCase();
  const rawPassword = String(password || '');
  const trimmedAdminCode = String(adminCode || '').trim();

  if (!normSelectedRole || !['user', 'artist', 'admin'].includes(normSelectedRole)) {
    return { success: false, error: 'Please select a valid Account Type (Buyer / User, Artist, or Admin).' };
  }

  // Admin Login Flow (Requires: Email, Password, Admin Security Code)
  if (normSelectedRole === 'admin') {
    if (!normalizedEmail) {
      return { success: false, error: 'Please enter your Admin email address.' };
    }
    if (!rawPassword) {
      return { success: false, error: 'Please enter your Admin password.' };
    }
    if (!trimmedAdminCode) {
      return { success: false, error: 'Admin Security Code is required for Admin login.' };
    }
    if (trimmedAdminCode !== ADMIN_SECURITY_CODE) {
      return { success: false, error: 'Invalid Admin Security Code. Admin login denied.' };
    }

    const expectedAdminEmail = String(DEFAULT_ADMIN_CONFIG.email || '').trim().toLowerCase();
    if (normalizedEmail !== expectedAdminEmail) {
      return { success: false, error: 'Invalid Admin email address. Please check your credentials.' };
    }

    if (rawPassword !== DEFAULT_ADMIN_CONFIG.password) {
      return { success: false, error: 'Invalid Admin password. Please check your credentials.' };
    }

    const users = getData('users', []);
    const nonAdminUsers = Array.isArray(users)
      ? users.filter(u => (u.role || '').toLowerCase() !== 'admin')
      : [];
    let adminUser = Array.isArray(users)
      ? users.find(u =>
          (u.role || '').toLowerCase() === 'admin' &&
          String(u.email || '').trim().toLowerCase() === expectedAdminEmail
        )
      : null;

    const syncedAdminUser = {
      id: adminUser ? adminUser.id : 1,
      name: adminUser ? adminUser.name : "Admin Administrator",
      email: expectedAdminEmail,
      password: DEFAULT_ADMIN_CONFIG.password,
      role: "admin",
      avatar: (adminUser && adminUser.avatar) ? adminUser.avatar : "images/avatar-admin.svg",
      createdAt: (adminUser && adminUser.createdAt) ? adminUser.createdAt : "2026-01-10"
    };

    const updatedUsers = [syncedAdminUser, ...nonAdminUsers];
    if (JSON.stringify(users) !== JSON.stringify(updatedUsers)) {
      setData('users', updatedUsers);
    }

    return {
      success: true,
      user: { ...syncedAdminUser, authVersion: DEFAULT_ADMIN_CONFIG.authVersion },
      redirectUrl: 'admin-dashboard.html'
    };
  }

  // Buyer/User and Artist Login Flow (Security Code NOT required)
  if (!trimmedEmail || !rawPassword) {
    return { success: false, error: 'Please enter both Email/Username and Password.' };
  }

  const users = getData('users', []);
  const matchedUser = users.find(u => {
    const emailMatch = u.email && u.email.toLowerCase() === trimmedEmail.toLowerCase();
    const nameMatch = u.name && u.name.toLowerCase() === trimmedEmail.toLowerCase();
    return (emailMatch || nameMatch) && u.password === rawPassword;
  });

  if (!matchedUser) {
    return { success: false, error: 'Invalid email/username or password. Please try again.' };
  }

  const actualUserRole = getNormalizedRole(matchedUser);

  // Strictly validate selected role against stored user role
  if (actualUserRole !== normSelectedRole) {
    if (actualUserRole === 'admin') {
      return {
        success: false,
        error: 'Access denied: Admin accounts must log in via the Admin option with the Admin Security Code.'
      };
    }
    return {
      success: false,
      error: `Role mismatch: This account is registered as "${matchedUser.role}". Please select the correct Account Type.`
    };
  }

  // Determine role-based dashboard redirect
  let redirectUrl = 'user-dashboard.html';
  if (actualUserRole === 'artist') {
    redirectUrl = 'artist-dashboard.html';
  }

  return {
    success: true,
    user: matchedUser,
    redirectUrl: redirectUrl
  };
}

// Handle Login Form Submission
function initLoginForm() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

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

    // Login successful - store in localStorage
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('show');
    }
    setCurrentUser(result.user);
    showToast(`Welcome back, ${result.user.name}!`, 'success');

    setTimeout(() => {
      window.location.href = result.redirectUrl;
    }, 800);
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

    // Form Validations
    if (!name || !email || !password || !confirmPassword || !role) {
      if (errorEl) {
        errorEl.textContent = 'All fields are required.';
        errorEl.classList.add('show');
      }
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      if (errorEl) {
        errorEl.textContent = 'Please provide a valid email address.';
        errorEl.classList.add('show');
      }
      return;
    }

    // Password length
    if (password.length < 6) {
      if (errorEl) {
        errorEl.textContent = 'Password must be at least 6 characters long.';
        errorEl.classList.add('show');
      }
      return;
    }

    // Password match
    if (password !== confirmPassword) {
      if (errorEl) {
        errorEl.textContent = 'Passwords do not match.';
        errorEl.classList.add('show');
      }
      return;
    }

    // Duplicate email check
    const users = getData('users', []);
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      if (errorEl) {
        errorEl.textContent = 'An account with this email already exists. Please login.';
        errorEl.classList.add('show');
      }
      return;
    }

    const normalizedRole = normalizeRoleString(role);

    // Create New User Object (ID >= 101 avoids colliding with legacy artwork/bid/purchase/review IDs)
    const newUser = {
      id: Math.max(getNextId(users), 101),
      name: name,
      email: email,
      password: password,
      role: normalizedRole,
      avatar: normalizedRole === 'artist' ? 'images/avatar-artist.svg' : 'images/avatar-user.svg',
      createdAt: new Date().toISOString().slice(0, 10)
    };

    if (normalizedRole === 'artist') {
      newUser.specialization = 'Visual Arts';
      newUser.bio = 'Contemporary artist contributing original creative works to the ArtLoom platform.';
    }

    users.push(newUser);
    setData('users', users);

    if (errorEl) errorEl.classList.remove('show');
    showToast('Registration successful! Redirecting to login...', 'success');

    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1200);
  });
}

// Run dynamic navigation render on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  renderNavigation();
  initLoginForm();
  initSignupForm();
});
