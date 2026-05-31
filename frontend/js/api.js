/* MediTrace — API client & shared utilities */

const API_BASE = '/api';
const TOKEN_KEY = 'meditrace_token';
const USER_KEY = 'meditrace_user';
const THEME_KEY = 'meditrace_theme';

const Auth = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  getUser: () => {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); }
    catch { return null; }
  },
  setSession: (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  updateUser: (patch) => {
    const cur = Auth.getUser() || {};
    localStorage.setItem(USER_KEY, JSON.stringify({ ...cur, ...patch }));
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  isLoggedIn: () => !!localStorage.getItem(TOKEN_KEY),
  logout: () => {
    Auth.clear();
    window.location.href = '/';
  }
};

async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  const token = Auth.getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(API_BASE + path, {
    method: opts.method || 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  let data;
  try { data = await res.json(); }
  catch { data = { success: false, message: 'Invalid server response' }; }

  if (res.status === 401) {
    Auth.clear();
    if (!window.location.pathname.endsWith('/') && !window.location.pathname.endsWith('index.html')) {
      window.location.href = '/';
      return data;
    }
  }
  return data;
}

/* ============ THEME ============ */
const Theme = {
  get: () => localStorage.getItem(THEME_KEY) || 'light',
  set: (theme) => {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
    // Persist to server in background (if logged in)
    if (Auth.isLoggedIn()) {
      api('/auth/preferences', { method: 'PUT', body: { theme } }).catch(() => {});
    }
  },
  toggle: () => {
    const cur = Theme.get();
    Theme.set(cur === 'light' ? 'dark' : 'light');
  },
  init: () => {
    const t = Theme.get();
    document.documentElement.setAttribute('data-theme', t);
  }
};
// Apply theme immediately to avoid flash
Theme.init();


function toast(message, type = 'info', duration = 3500) {
  let stack = document.querySelector('.toast-stack');
  if (!stack) {
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    document.body.appendChild(stack);
  }
  const t = document.createElement('div');
  t.className = `toast ${type === 'error' ? 'err' : type === 'success' ? 'ok' : type === 'warn' ? 'warn' : ''}`;
  t.textContent = message;
  stack.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transition = 'opacity .25s';
    setTimeout(() => t.remove(), 250);
  }, duration);
}

/* Modal helper */
function openModal(content) {
  let backdrop = document.querySelector('.modal-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = '<div class="modal"></div>';
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal();
    });
    document.body.appendChild(backdrop);
  }
  backdrop.querySelector('.modal').innerHTML = content;
  backdrop.classList.add('show');
}
function closeModal() {
  const backdrop = document.querySelector('.modal-backdrop');
  if (backdrop) backdrop.classList.remove('show');
}

/* Route guard */
function requireLogin(allowedTypes) {
  const user = Auth.getUser();
  if (!Auth.isLoggedIn() || !user) {
    window.location.href = '/';
    return null;
  }
  if (allowedTypes && !allowedTypes.includes(user.user_type)) {
    const target = user.user_type === 'patient' ? '/pages/patient.html'
                 : user.user_type === 'doctor' ? '/pages/doctor.html'
                 : '/pages/medical.html';
    window.location.href = target;
    return null;
  }
  return user;
}

/* Format helpers */
function fmtDate(s) {
  if (!s) return '—';
  const d = new Date(s);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtDateTime(s) {
  if (!s) return '—';
  const d = new Date(s);
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function fmtTime(t) {
  if (!t) return '—';
  const [h, m] = t.split(':');
  const hh = parseInt(h, 10);
  const ampm = hh >= 12 ? 'PM' : 'AM';
  const h12 = hh % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}
function escapeHtml(s) {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function initials(name) {
  if (!name) return '?';
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

/* Decorative heartbeat SVG */
function heartbeatSVG(color = 'currentColor') {
  return `<svg class="heartbeat-line" viewBox="0 0 800 40" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 20 L100 20 L120 20 L140 5 L160 35 L180 5 L200 35 L220 20 L350 20 L370 12 L385 28 L400 5 L415 35 L430 12 L450 20 L600 20 L620 20 L640 8 L660 32 L680 20 L800 20" stroke="${color}" stroke-width="1.5" fill="none"/>
  </svg>`;
}

/* Probability ring SVG */
function probRingSVG(pct, color = '#1f4f47') {
  const r = 24, c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return `<svg width="60" height="60" viewBox="0 0 60 60">
    <circle cx="30" cy="30" r="${r}" fill="none" stroke="#e8e2d3" stroke-width="4"/>
    <circle cx="30" cy="30" r="${r}" fill="none" stroke="${color}" stroke-width="4"
      stroke-dasharray="${c}" stroke-dashoffset="${offset}" stroke-linecap="round"/>
  </svg>`;
}

/* Profile photo HTML helper */
function photoHtml(user, size = '') {
  // size: '', 'sm', 'xs'
  const cls = size ? `profile-photo-${size}` : '';
  if (user && user.profile_image && user.profile_image.startsWith('data:')) {
    return `<span class="profile-photo ${cls}"><img src="${user.profile_image}" alt=""/></span>`;
  }
  return `<span class="profile-photo ${cls}">${initials(user?.full_name || user?.name || '?')}</span>`;
}

/* Theme toggle widget — call this in sidebars */
function renderThemeToggle(container) {
  if (!container) return;
  const cur = Theme.get();
  const icon = cur === 'dark' ? '☀️' : '🌙';
  const label = cur === 'dark' ? 'Light mode' : 'Dark mode';
  container.innerHTML = `<button class="theme-toggle" onclick="Theme.toggle(); renderThemeToggle(this.parentElement);"><span class="toggle-icon">${icon}</span><span>${label}</span></button>`;
}


