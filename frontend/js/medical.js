/* MediTrace — Pharmacy Dashboard */

const user = requireLogin(['medical']);
if (user) initMedical();

const state = {
  inventory: [],
  invFilter: 'all',
};

async function initMedical() {
  renderSidebarUserMed();
  const themeContainer = document.getElementById('theme-toggle-container');
  const langContainer = document.getElementById('lang-switcher-container');
  if (themeContainer) renderThemeToggle(themeContainer);
  if (langContainer) renderLangSwitcher(langContainer);

  document.querySelectorAll('.dash-nav-item').forEach(b => {
    b.addEventListener('click', () => switchTab(b.dataset.tab));
  });
  document.querySelectorAll('.inv-filter').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.inv-filter').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      state.invFilter = b.dataset.status;
      renderInventory();
    });
  });
  document.getElementById('inv-search').addEventListener('input', renderInventory);
  document.getElementById('add-form').addEventListener('submit', submitInventory);
  document.getElementById('profile-form').addEventListener('submit', saveProfile);

  const photoInput = document.getElementById('photo-input');
  if (photoInput) photoInput.addEventListener('change', handlePhotoUpload);

  loadInventory();
}

function renderSidebarUserMed() {
  const sb = document.getElementById('sidebar-user');
  if (!sb) {
    document.getElementById('u-name').textContent = user.full_name;
    document.getElementById('u-id').textContent = user.unique_id;
    return;
  }
  sb.innerHTML = `
    ${photoHtml(user, 'sm')}
    <div class="uname">
      <div class="nm">${escapeHtml(user.full_name)}</div>
      <div class="uid">${escapeHtml(user.unique_id)}</div>
    </div>
  `;
}

async function handlePhotoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { toast('Image too large. Max 2MB.', 'warn'); return; }
  const reader = new FileReader();
  reader.onload = async (event) => {
    try {
      const compressed = await compressImage(event.target.result, 400);
      const res = await api('/auth/profile-photo', { method: 'POST', body: { image_data: compressed } });
      if (res.success) {
        toast('Photo updated!', 'success');
        Auth.updateUser({ profile_image: compressed });
        user.profile_image = compressed;
        renderSidebarUserMed();
        const photoEl = document.getElementById('current-photo');
        if (photoEl) photoEl.innerHTML = photoHtml(user);
      } else { toast(res.message || 'Upload failed', 'error'); }
    } catch (err) { toast('Image processing failed', 'error'); }
  };
  reader.readAsDataURL(file);
}

function compressImage(dataUrl, maxDim) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let w = img.width, h = img.height;
      if (w > h && w > maxDim) { h = h * maxDim / w; w = maxDim; }
      else if (h > maxDim) { w = w * maxDim / h; h = maxDim; }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/* INCOMING MEDICINE REQUESTS */
async function loadIncomingRequests() {
  const el = document.getElementById('incoming-requests');
  el.innerHTML = '<div class="page-loader"><span class="spinner"></span></div>';
  const res = await api('/medicine-requests/');
  if (!res.success || !res.requests?.length) {
    el.innerHTML = `<div class="empty"><div class="empty-icon">·</div><p>No incoming requests yet. They'll appear here when patients request medicines from your shop.</p></div>`;
    return;
  }
  el.innerHTML = res.requests.map(r => `
    <div class="req-card">
      <div class="head">
        <div>
          <h4>${escapeHtml(r.medicine_name)} <span class="text-mute text-sm">× ${r.quantity}</span></h4>
          <div class="text-sm text-mute">From: <strong>${escapeHtml(r.patient_name)}</strong> ${r.patient_unique_id ? `(${escapeHtml(r.patient_unique_id)})` : ''} ${r.patient_phone ? `· 📞 ${escapeHtml(r.patient_phone)}` : ''}</div>
        </div>
        <span class="req-status ${r.status}">${r.status}</span>
      </div>
      ${r.notes ? `<div class="text-sm mt-1"><strong>Patient note:</strong> ${escapeHtml(r.notes)}</div>` : ''}
      ${r.pharmacy_notes ? `<div class="text-sm mt-1" style="background: var(--bg-soft); padding: 0.5rem 0.75rem; border-radius: var(--radius-sm);"><strong>Your reply:</strong> ${escapeHtml(r.pharmacy_notes)}</div>` : ''}
      <div class="text-xs text-mute mt-2">Received ${fmtDateTime(r.created_at)}</div>
      <div class="flex gap-1 mt-2" style="flex-wrap: wrap;">
        ${r.status === 'pending' ? `
          <button class="btn btn-primary btn-sm" onclick="respondRequest(${r.id}, 'accepted')">Accept</button>
          <button class="btn btn-ghost btn-sm" onclick="respondRequest(${r.id}, 'rejected')">Reject</button>
        ` : ''}
        ${r.status === 'accepted' ? `<button class="btn btn-primary btn-sm" onclick="respondRequest(${r.id}, 'ready')">Mark ready for pickup</button>` : ''}
        ${r.status === 'ready' ? `<button class="btn btn-primary btn-sm" onclick="respondRequest(${r.id}, 'completed')">Mark completed</button>` : ''}
        ${!['completed','rejected'].includes(r.status) ? `<button class="btn btn-ghost btn-sm" onclick="addPharmacyNote(${r.id})">Add note</button>` : ''}
      </div>
    </div>
  `).join('');
}
async function respondRequest(id, status) {
  const res = await api(`/medicine-requests/${id}/status`, { method: 'PUT', body: { status } });
  if (res.success) { toast(`Marked ${status}`, 'success'); loadIncomingRequests(); }
  else toast(res.message || 'Failed', 'error');
}
window.respondRequest = respondRequest;

function addPharmacyNote(id) {
  const html = `
    <h3>Add a note to patient</h3>
    <form id="note-form">
      <div class="form-group">
        <label class="form-label">Your message</label>
        <textarea name="note" class="form-textarea" required placeholder="e.g. We have it in stock. Please bring prescription. Available till 9pm."></textarea>
      </div>
      <div class="flex gap-1">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Send note</button>
      </div>
    </form>
  `;
  openModal(html);
  document.getElementById('note-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const note = e.target.note.value.trim();
    if (!note) return;
    // Use current status to preserve it
    const res = await api(`/medicine-requests/${id}/status`, { method: 'PUT', body: { status: 'accepted', pharmacy_notes: note } });
    if (res.success) { toast('Note sent', 'success'); closeModal(); loadIncomingRequests(); }
    else toast(res.message || 'Failed', 'error');
  });
}
window.addPharmacyNote = addPharmacyNote;

const tabMeta = {
  home: ['Overview', 'Pharmacy dashboard'],
  inventory: ['Stock', 'Medicine inventory'],
  add: ['New entry', 'Add medicine'],
  requests: ['Incoming', 'Medicine requests'],
  profile: ['Account', 'Shop profile'],
};
function switchTab(tab) {
  document.querySelectorAll('.dash-nav-item').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-section').forEach(s => s.classList.toggle('active', s.id === 'tab-' + tab));
  document.getElementById('sidebar').classList.remove('open');
  const [eyebrow, title] = tabMeta[tab] || ['', ''];
  document.getElementById('tab-eyebrow').textContent = eyebrow;
  document.getElementById('tab-title').textContent = title;
  if (tab === 'inventory') loadInventory();
  if (tab === 'requests') loadIncomingRequests();
  if (tab === 'profile') loadProfile();
}
window.switchTab = switchTab;

/* derive a stock status from quantity & availability */
function stockStatus(item) {
  const qty = item.stock_quantity || 0;
  if (!item.is_available || qty === 0) return 'out_of_stock';
  if (qty < 10) return 'low_stock';
  return 'in_stock';
}

/* ============ INVENTORY ============ */
async function loadInventory() {
  const res = await api('/medicines/my-inventory');
  state.inventory = (res.inventory || []).map(i => ({ ...i, _status: stockStatus(i) }));
  updateStats();
  renderInventory();
}
function updateStats() {
  const inv = state.inventory;
  document.getElementById('stat-total').textContent = inv.length;
  document.getElementById('stat-in').textContent = inv.filter(i => i._status === 'in_stock').length;
  document.getElementById('stat-low').textContent = inv.filter(i => i._status === 'low_stock').length;
  document.getElementById('stat-out').textContent = inv.filter(i => i._status === 'out_of_stock').length;
}
function renderInventory() {
  let list = state.inventory;
  if (state.invFilter !== 'all') list = list.filter(i => i._status === state.invFilter);
  const q = (document.getElementById('inv-search').value || '').toLowerCase();
  if (q) list = list.filter(i =>
    (i.medicine_name || '').toLowerCase().includes(q) ||
    (i.generic_name || '').toLowerCase().includes(q)
  );

  const el = document.getElementById('inventory-list');
  if (!list.length) {
    el.innerHTML = `<div class="empty"><div class="empty-icon">·</div><p>No items match. <button class="btn btn-primary btn-sm mt-2" onclick="switchTab('add')">+ Add medicine</button></p></div>`;
    return;
  }
  el.innerHTML = `<div class="medicine-list">
    ${list.map(it => `
      <div class="medicine-row" style="grid-template-columns: 1fr auto auto auto auto;">
        <div class="name">
          ${escapeHtml(it.medicine_name)}
          <div class="generic">${escapeHtml(it.generic_name || '')} ${it.category ? `· ${escapeHtml(it.category)}` : ''} ${it.manufacturer ? `· ${escapeHtml(it.manufacturer)}` : ''}</div>
        </div>
        <div class="price">₹${it.price}</div>
        <div class="text-sm text-mute mono">Qty ${it.stock_quantity ?? 0}</div>
        <span class="stock-tag ${it._status}">${it._status.replace('_',' ')}</span>
        <div class="flex gap-1">
          <button class="btn btn-ghost btn-sm" onclick='editInventory(${it.id})'>Edit</button>
          <button class="btn btn-ghost btn-sm" onclick="deleteInventory(${it.id})">×</button>
        </div>
      </div>
    `).join('')}
  </div>`;
}

function editInventory(id) {
  const it = state.inventory.find(x => x.id === id);
  if (!it) return;
  const html = `
    <h3>Edit: ${escapeHtml(it.medicine_name)}</h3>
    <form id="edit-form">
      <div class="grid-2">
        <div class="form-group">
          <label class="form-label">Price (₹)</label>
          <input type="number" step="0.01" name="price" class="form-input" value="${it.price}" required />
        </div>
        <div class="form-group">
          <label class="form-label">Stock quantity</label>
          <input type="number" name="stock_quantity" class="form-input" value="${it.stock_quantity || 0}" />
        </div>
        <div class="form-group">
          <label class="form-label">Available</label>
          <select name="is_available" class="form-select">
            <option value="true" ${it.is_available ? 'selected' : ''}>Available</option>
            <option value="false" ${!it.is_available ? 'selected' : ''}>Not available</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Expiry</label>
          <input type="date" name="expiry_date" class="form-input" value="${it.expiry_date ? String(it.expiry_date).split('T')[0] : ''}" />
        </div>
      </div>
      <div class="flex gap-1">
        <button type="submit" class="btn btn-primary">Save</button>
        <button type="button" class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      </div>
    </form>
  `;
  openModal(html);
  document.getElementById('edit-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    const body = {
      price: parseFloat(f.price.value),
      stock_quantity: parseInt(f.stock_quantity.value) || 0,
      is_available: f.is_available.value === 'true',
      expiry_date: f.expiry_date.value || null,
    };
    const res = await api(`/medicines/inventory/${id}`, { method: 'PUT', body });
    if (res.success) { toast('Updated', 'success'); closeModal(); loadInventory(); }
    else toast(res.message || 'Failed', 'error');
  });
}

async function deleteInventory(id) {
  if (!confirm('Remove this item from inventory?')) return;
  const res = await api(`/medicines/inventory/${id}`, { method: 'DELETE' });
  if (res.success) { toast('Removed', 'success'); loadInventory(); }
  else toast(res.message || 'Failed', 'error');
}

/* ============ ADD ============ */
async function submitInventory(e) {
  e.preventDefault();
  const body = {
    medicine_name: document.getElementById('med-name').value.trim(),
    generic_name: document.getElementById('med-generic').value.trim() || null,
    manufacturer: document.getElementById('med-mfr').value.trim() || null,
    category: document.getElementById('med-category').value || null,
    description: document.getElementById('med-desc').value.trim() || null,
    price: parseFloat(document.getElementById('inv-price').value),
    stock_quantity: parseInt(document.getElementById('inv-stock').value) || 0,
    expiry_date: document.getElementById('inv-expiry').value || null,
  };
  if (!body.medicine_name || isNaN(body.price)) { toast('Name and price required', 'warn'); return; }
  const res = await api('/medicines/inventory', { method: 'POST', body });
  if (res.success) {
    toast('Added to inventory', 'success');
    document.getElementById('add-form').reset();
    switchTab('inventory');
  } else toast(res.message || 'Failed', 'error');
}

/* ============ PROFILE ============ */
async function loadProfile() {
  const res = await api('/auth/me');
  if (!res.success) return;
  const p = res.profile || {};
  const u = res.user;
  const f = document.getElementById('profile-form');
  f.full_name.value = u.full_name || '';
  f.phone.value = u.phone || '';
  // Time fields HH:MM:SS -> HH:MM
  ['opening_time','closing_time'].forEach(k => {
    if (p[k] && typeof p[k] === 'string' && p[k].length > 5) p[k] = p[k].substring(0, 5);
  });
  ['shop_name','license_number','city','state','pincode','address','latitude','longitude','opening_time','closing_time'].forEach(k => {
    if (f[k]) f[k].value = p[k] ?? '';
  });
  if (f.delivery_available) f.delivery_available.checked = !!p.delivery_available;
  if (f.is_24_hours) f.is_24_hours.checked = !!p.is_24_hours;
  // Load photo
  const photoEl = document.getElementById('current-photo');
  if (photoEl) photoEl.innerHTML = photoHtml(u);
}
async function saveProfile(e) {
  e.preventDefault();
  const f = e.target;
  const body = {};
  for (const el of f.elements) {
    if (!el.name) continue;
    if (el.type === 'checkbox') body[el.name] = el.checked;
    else body[el.name] = el.value || null;
  }
  const res = await api('/auth/profile', { method: 'PUT', body });
  if (res.success) toast('Profile updated', 'success');
  else toast(res.message || 'Failed', 'error');
}

window.editInventory = editInventory;
window.deleteInventory = deleteInventory;
