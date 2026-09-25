/**
 * auth.js - Authentication, Role Protection, and Dynamic Navigation
 * Online Art Gallery (ArtLoom) - SDC Project Review-1
 * Strictly Vanilla JavaScript & LocalStorage
 */

// Single-location Admin Security Code configuration (Easy to modify)
const ADMIN_SECURITY_CODE = 'ARTLOOM-ADMIN-2026';

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

// Get Logged In User
function getCurrentUser() {
  return getData('currentUser', null);
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

// Quick Fill Demo Credentials (For SDC Review-1 Live Presentation)
function fillCredentials(role) {
  const roleSelect = document.getElementById('loginRole');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const adminCodeInput = document.getElementById('adminCode');

  if (!emailInput || !passwordInput) return;

  const normalized = normalizeRoleString(role);

  if (roleSelect) {
    roleSelect.value = normalized;
    handleLoginRoleChange();
  }

  if (normalized === 'admin') {
    emailInput.value = 'admin@artgallery.com';
    passwordInput.value = 'admin123';
    if (adminCodeInput) {
      adminCodeInput.value = ADMIN_SECURITY_CODE;
    }
    showToast('Filled Admin credentials & Security Code', 'info');
  } else if (normalized === 'artist') {
    emailInput.value = 'artist@artgallery.com';
    passwordInput.value = 'artist123';
    if (adminCodeInput) {
      adminCodeInput.value = '';
    }
    showToast('Filled Artist credentials', 'info');
  } else if (normalized === 'user') {
    emailInput.value = 'user@artgallery.com';
    passwordInput.value = 'user123';
    if (adminCodeInput) {
      adminCodeInput.value = '';
    }
    showToast('Filled Buyer / User credentials', 'info');
  }
}

// Core Login Authentication & Role Verification Logic
function authenticateLogin({ selectedRole, email, password, adminCode }) {
  const normSelectedRole = normalizeRoleString(selectedRole);
  const trimmedEmail = String(email || '').trim();
  const rawPassword = String(password || '');
  const trimmedAdminCode = String(adminCode || '').trim();

  if (!normSelectedRole || !['user', 'artist', 'admin'].includes(normSelectedRole)) {
    return { success: false, error: 'Please select a valid Account Type (Buyer / User, Artist, or Admin).' };
  }

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
    if (normSelectedRole === 'admin' && trimmedAdminCode !== ADMIN_SECURITY_CODE) {
      return { success: false, error: 'Invalid Admin credentials or Admin Security Code.' };
    }
    return { success: false, error: 'Invalid email/username or password. Please try again.' };
  }

  const actualUserRole = getNormalizedRole(matchedUser);

  // Strictly validate selected role against stored user role
  if (actualUserRole !== normSelectedRole) {
    if (normSelectedRole === 'admin') {
      return {
        success: false,
        error: `Access denied: ${matchedUser.role} accounts are not authorized to log in as Admin.`
      };
    }
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

  // Validate Admin Security Code when logging in as Admin
  if (normSelectedRole === 'admin') {
    if (!trimmedAdminCode) {
      return {
        success: false,
        error: 'Admin Security Code is required for Admin login.'
      };
    }
    if (trimmedAdminCode !== ADMIN_SECURITY_CODE) {
      return {
        success: false,
        error: 'Invalid Admin Security Code. Admin login denied.'
      };
    }
  }

  // Determine role-based dashboard redirect
  let redirectUrl = 'user-dashboard.html';
  if (actualUserRole === 'admin') {
    redirectUrl = 'admin-dashboard.html';
  } else if (actualUserRole === 'artist') {
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

    // Create New User Object
    const newUser = {
      id: getNextId(users),
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
