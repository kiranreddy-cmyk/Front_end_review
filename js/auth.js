/**
 * auth.js - Authentication, Role Protection, and Dynamic Navigation
 * Online Art Gallery (ArtVista) - SDC Project Review-1
 * Strictly Vanilla JavaScript & LocalStorage
 */

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

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Unauthorized role
    if (user.role === 'admin') {
      window.location.href = 'admin-dashboard.html';
    } else if (user.role === 'artist') {
      window.location.href = 'artist-dashboard.html';
    } else {
      window.location.href = 'user-dashboard.html';
    }
    return null;
  }

  return user;
}

// Render Dynamic Header Navigation
function renderNavigation() {
  const user = getCurrentUser();
  const navLinksContainer = document.getElementById('navLinks');
  const navActionsContainer = document.getElementById('navActions');

  if (!navActionsContainer) return;

  if (user) {
    // Determine dashboard link based on role
    let dashboardLink = 'user-dashboard.html';
    if (user.role === 'admin') dashboardLink = 'admin-dashboard.html';
    if (user.role === 'artist') dashboardLink = 'artist-dashboard.html';

    const avatarUrl = user.avatar || (user.role === 'artist' ? 'images/avatar-artist.svg' : user.role === 'admin' ? 'images/avatar-admin.svg' : 'images/avatar-user.svg');

    navActionsContainer.innerHTML = `
      <div class="user-badge-pill">
        <img src="${avatarUrl}" alt="${user.name}" class="user-avatar-sm">
        <span>${user.name.split(' ')[0]}</span>
        <span class="role-tag role-${user.role}">${user.role}</span>
      </div>
      <a href="${dashboardLink}" class="btn btn-sm btn-primary">Dashboard</a>
      <button onclick="logout()" class="btn btn-sm btn-outline" title="Logout">Logout</button>
    `;
  } else {
    navActionsContainer.innerHTML = `
      <a href="login.html" class="btn btn-sm btn-outline">Login</a>
      <a href="signup.html" class="btn btn-sm btn-accent">Sign Up</a>
    `;
  }

  // Setup Mobile Hamburger Menu Toggle
  const menuToggle = document.getElementById('menuToggle');
  if (menuToggle && navLinksContainer) {
    menuToggle.addEventListener('click', () => {
      navLinksContainer.classList.toggle('show');
    });
  }
}

// Quick Fill Demo Credentials (For SDC Review-1 Live Presentation)
function fillCredentials(role) {
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  if (!emailInput || !passwordInput) return;

  if (role === 'admin') {
    emailInput.value = 'admin@artgallery.com';
    passwordInput.value = 'admin123';
    showToast('Filled Admin credentials', 'info');
  } else if (role === 'artist') {
    emailInput.value = 'artist@artgallery.com';
    passwordInput.value = 'artist123';
    showToast('Filled Artist credentials', 'info');
  } else if (role === 'user') {
    emailInput.value = 'user@artgallery.com';
    passwordInput.value = 'user123';
    showToast('Filled User credentials', 'info');
  }
}

// Handle Login Form Submission
function initLoginForm() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('loginError');

    if (!email || !password) {
      if (errorEl) {
        errorEl.textContent = 'Please enter both email and password.';
        errorEl.classList.add('show');
      }
      return;
    }

    const users = getData('users', []);
    const matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (!matchedUser) {
      if (errorEl) {
        errorEl.textContent = 'Invalid email or password. Please try again.';
        errorEl.classList.add('show');
      }
      showToast('Invalid login credentials', 'error');
      return;
    }

    // Login successful
    if (errorEl) errorEl.classList.remove('show');
    setCurrentUser(matchedUser);
    showToast(`Welcome back, ${matchedUser.name}!`, 'success');

    // Role-based redirection
    setTimeout(() => {
      if (matchedUser.role === 'admin') {
        window.location.href = 'admin-dashboard.html';
      } else if (matchedUser.role === 'artist') {
        window.location.href = 'artist-dashboard.html';
      } else {
        window.location.href = 'user-dashboard.html';
      }
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

    // Create New User Object
    const newUser = {
      id: getNextId(users),
      name: name,
      email: email,
      password: password,
      role: role,
      avatar: role === 'artist' ? 'images/avatar-artist.svg' : 'images/avatar-user.svg',
      createdAt: new Date().toISOString().slice(0, 10)
    };

    if (role === 'artist') {
      newUser.specialization = 'Visual Arts';
      newUser.bio = 'Contemporary artist contributing original creative works to the ArtVista platform.';
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
