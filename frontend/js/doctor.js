/* MediTrace — Doctor Dashboard */

const user = requireLogin(['doctor']);
if (user) initDoctor();

const state = {
  appointments: [],
  apptFilter: 'all',
  patients: new Map(),
  prescriptions: [],
  medCount: 0,
  exCount: 0,
};

async function initDoctor() {
  renderSidebarUserDoc();
  const themeContainer = document.getElementById('theme-toggle-container');
  if (themeContainer) renderThemeToggle(themeContainer);

  document.querySelectorAll('.dash-nav-item').forEach(b => {
    b.addEventListener('click', () => switchTab(b.dataset.tab));
  });
  document.querySelectorAll('.appt-filter').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.appt-filter').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      state.apptFilter = b.dataset.status;
      renderAppointments();
    });
  });
  document.getElementById('patient-search').addEventListener('input', renderPatients);
  document.getElementById('rx-form').addEventListener('submit', submitRx);
  document.getElementById('profile-form').addEventListener('submit', saveProfile);

  const photoInput = document.getElementById('photo-input');
  if (photoInput) photoInput.addEventListener('change', handlePhotoUpload);

  addMedRow();
  loadHome();
}

function renderSidebarUserDoc() {
  const sb = document.getElementById('sidebar-user');
  if (!sb) {
    document.getElementById('u-name').textContent = user.full_name;
    document.getElementById('u-id').textContent = user.unique_id;
    return;
  }
  sb.innerHTML = `
    ${photoHtml(user, 'sm')}
    <div class="uname">
      <div class="nm">Dr. ${escapeHtml(user.full_name)}</div>
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
        renderSidebarUserDoc();
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

const tabMeta = {
  home: ['Overview', 'Practice dashboard'],
  appointments: ['Schedule', 'Appointments'],
  patients: ['Records', 'Patients'],
  prescribe: ['Rx', 'Write a prescription'],
  'rx-list': ['History', 'Prescriptions issued'],
  profile: ['Account', 'Your profile'],
};
function switchTab(tab) {
  document.querySelectorAll('.dash-nav-item').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-section').forEach(s => s.classList.toggle('active', s.id === 'tab-' + tab));
  document.getElementById('sidebar').classList.remove('open');
  const [eyebrow, title] = tabMeta[tab] || ['', ''];
  document.getElementById('tab-eyebrow').textContent = eyebrow;
  document.getElementById('tab-title').textContent = title;
  if (tab === 'appointments') loadAppointments();
  if (tab === 'patients') loadPatients();
  if (tab === 'prescribe') loadPrescribeForm();
  if (tab === 'rx-list') loadMyPrescriptions();
  if (tab === 'profile') loadProfile();
}

/* ============ HOME ============ */
async function loadHome() {
  const [aRes, rRes] = await Promise.all([
    api('/appointments/my-appointments'),
    api('/prescriptions/'),
  ]);
  const appts = aRes.appointments || [];
  state.appointments = appts;
  const rx = rRes.prescriptions || [];
  state.prescriptions = rx;

  const today = dateOnly(new Date());
  document.getElementById('stat-today').textContent = appts.filter(a => dateOnly(a.appointment_date) === today).length;
  document.getElementById('stat-pending').textContent = appts.filter(a => a.status === 'pending').length;
  const uniquePatients = new Set(appts.map(a => a.patient_id));
  document.getElementById('stat-patients').textContent = uniquePatients.size;
  document.getElementById('stat-rx').textContent = rx.length;

  // Upcoming — today + tomorrow
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const tStr = dateOnly(tomorrow);
  const upcoming = appts.filter(a => {
    const d = dateOnly(a.appointment_date);
    return (d === today || d === tStr) && ['pending', 'confirmed'].includes(a.status);
  });

  const el = document.getElementById('upcoming-appts');
  if (!upcoming.length) {
    el.innerHTML = `<div class="empty"><p>No upcoming appointments today or tomorrow.</p></div>`;
  } else {
    el.innerHTML = upcoming.map(a => apptCardHtml(a)).join('');
  }
}

/* ============ APPOINTMENTS ============ */
async function loadAppointments() {
  const res = await api('/appointments/my-appointments');
  state.appointments = res.appointments || [];
  renderAppointments();
}
function renderAppointments() {
  const list = state.apptFilter === 'all' ? state.appointments : state.appointments.filter(a => a.status === state.apptFilter);
  const el = document.getElementById('appointments-list');
  if (!list.length) {
    if (state.appointments.length === 0) {
      el.innerHTML = `<div class="empty">
        <div class="empty-icon">·</div>
        <p><strong>No appointments yet for your account.</strong></p>
        <p class="text-sm text-mute">When a patient books with you (Dr. ${escapeHtml(user.full_name)}, ID: ${escapeHtml(user.unique_id)}), it will appear here.</p>
        <p class="text-sm text-mute mt-2">Patients can find you under specialization "${escapeHtml(state.specialization || 'your specialty')}" in the Symptom Checker results or in the "Book new appointment" doctor list.</p>
      </div>`;
    } else {
      el.innerHTML = `<div class="empty"><div class="empty-icon">·</div><p>No appointments in "${escapeHtml(state.apptFilter)}" filter.</p><p class="text-sm text-mute">Try clicking "All" above to see all your appointments.</p></div>`;
    }
    return;
  }
  el.innerHTML = list.map(a => apptCardHtml(a)).join('');
}
function apptCardHtml(a) {
  return `<div class="list-card">
    <div class="list-card-head">
      <div>
        <h4>${escapeHtml(a.patient_name)} <span class="text-mute text-sm">${a.patient_age ? `· ${a.patient_age} yrs` : ''} ${a.gender ? `· ${a.gender}` : ''}</span></h4>
        <div class="text-sm text-mute">${fmtDate(a.appointment_date)} at ${fmtTime(a.appointment_time)}</div>
      </div>
      <span class="status-tag ${a.status}">${a.status}</span>
    </div>
    ${a.reason ? `<div class="text-sm mt-1"><strong>Reason:</strong> ${escapeHtml(a.reason)}</div>` : ''}
    <div class="flex gap-1 mt-2" style="flex-wrap: wrap;">
      ${a.status === 'pending' ? `<button class="btn btn-primary btn-sm" onclick="updateAppt(${a.id}, 'confirmed')">Confirm</button>` : ''}
      ${a.status === 'confirmed' ? `<button class="btn btn-primary btn-sm" onclick="updateAppt(${a.id}, 'completed')">Mark complete</button>` : ''}
      ${['pending','confirmed'].includes(a.status) ? `<button class="btn btn-ghost btn-sm" onclick="updateAppt(${a.id}, 'cancelled')">Cancel</button>` : ''}
      <button class="btn btn-ghost btn-sm" onclick='viewPatient(${a.patient_id}, ${JSON.stringify(a.patient_name)})'>View record</button>
      <button class="btn btn-ember btn-sm" onclick='quickPrescribe(${a.patient_id}, ${JSON.stringify(a.patient_name)})'>Prescribe</button>
    </div>
  </div>`;
}
async function updateAppt(id, status) {
  const res = await api(`/appointments/${id}/status`, { method: 'PUT', body: { status } });
  if (res.success) { toast(`Marked ${status}`, 'success'); loadAppointments(); loadHome(); }
  else toast(res.message || 'Failed', 'error');
}

/* ============ PATIENTS ============ */
async function loadPatients() {
  const res = await api('/appointments/my-appointments');
  const appts = res.appointments || [];
  state.patients.clear();
  appts.forEach(a => {
    if (!state.patients.has(a.patient_id)) {
      state.patients.set(a.patient_id, {
        id: a.patient_id,
        name: a.patient_name,
        unique_id: a.patient_unique_id,
        age: a.patient_age,
        gender: a.gender,
        phone: a.patient_phone,
        last_visit: a.appointment_date,
        visit_count: 1,
      });
    } else {
      state.patients.get(a.patient_id).visit_count++;
    }
  });
  renderPatients();
}
function renderPatients() {
  const q = (document.getElementById('patient-search').value || '').toLowerCase();
  const list = Array.from(state.patients.values()).filter(p => p.name.toLowerCase().includes(q));
  const el = document.getElementById('patients-list');
  if (!list.length) {
    el.innerHTML = `<div class="empty"><p>No patients yet. They'll appear here after their first appointment.</p></div>`;
    return;
  }
  el.innerHTML = list.map(p => `
    <div class="doctor-card">
      <div class="doctor-avatar">${initials(p.name)}</div>
      <div class="doctor-info">
        <h4>${escapeHtml(p.name)}</h4>
        <div class="meta">
          ${p.unique_id ? `<span class="mono text-xs">${escapeHtml(p.unique_id)}</span>` : ''}
          ${p.age ? `<span>· ${p.age} yrs</span>` : ''}
          ${p.gender ? `<span>· ${escapeHtml(p.gender)}</span>` : ''}
          <span>· ${p.visit_count} visit${p.visit_count > 1 ? 's' : ''}</span>
        </div>
      </div>
      <div class="doctor-actions flex gap-1">
        <button class="btn btn-ghost btn-sm" onclick='viewPatient(${p.id}, ${JSON.stringify(p.name)})'>View</button>
        <button class="btn btn-ember btn-sm" onclick='quickPrescribe(${p.id}, ${JSON.stringify(p.name)})'>Prescribe</button>
      </div>
    </div>
  `).join('');
}

async function viewPatient(patientId, patientName) {
  openModal(`<h3>${escapeHtml(patientName)}</h3><div class="page-loader"><span class="spinner"></span></div>`);
  const [vRes, lRes] = await Promise.all([
    api(`/vitals/${patientId}`),
    api(`/prescriptions/medication-logs/${patientId}`),
  ]);
  const vitals = vRes.vitals || [];
  const stats = vRes.stats || {};
  const logs = lRes.logs || [];

  const html = `
    <h3>${escapeHtml(patientName)}</h3>
    <p class="text-mute text-sm">Recent vitals & medication adherence</p>

    <h4 class="mt-3">Vital trends</h4>
    ${vitals.length ? `
      <div class="grid-3">
        <div class="stat"><div class="label">Avg HR</div><div class="value">${stats.avg_heart_rate ? Math.round(stats.avg_heart_rate) : '—'}</div></div>
        <div class="stat"><div class="label">Avg BP</div><div class="value">${stats.avg_bp_systolic ? Math.round(stats.avg_bp_systolic) : '—'}/${stats.avg_bp_diastolic ? Math.round(stats.avg_bp_diastolic) : '—'}</div></div>
        <div class="stat"><div class="label">Readings</div><div class="value">${vitals.length}</div></div>
      </div>
      <table class="simple mt-2" style="font-size: 0.8rem;">
        <thead><tr><th>Date</th><th>HR</th><th>BP</th><th>SpO₂</th><th>Sugar</th><th>Temp</th></tr></thead>
        <tbody>
          ${vitals.slice(0, 8).map(v => `<tr>
            <td>${fmtDate(v.recorded_at)}</td>
            <td>${v.heart_rate ?? '—'}</td>
            <td>${v.bp_systolic ?? '—'}/${v.bp_diastolic ?? '—'}</td>
            <td>${v.oxygen_level ?? '—'}</td>
            <td>${v.blood_sugar ?? '—'}</td>
            <td>${v.temperature ?? '—'}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    ` : `<p class="text-mute text-sm">No vitals recorded yet.</p>`}

    <h4 class="mt-3">Medication adherence (last 30)</h4>
    ${logs.length ? `
      <table class="simple" style="font-size: 0.8rem;">
        <thead><tr><th>Medicine</th><th>Status</th><th>When</th></tr></thead>
        <tbody>
          ${logs.slice(0, 15).map(l => `<tr>
            <td>${escapeHtml(l.medicine_name || '—')}</td>
            <td><span class="status-tag ${l.status === 'taken' ? 'completed' : 'cancelled'}">${l.status}</span></td>
            <td>${fmtDateTime(l.taken_at)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    ` : `<p class="text-mute text-sm">No medication logs.</p>`}

    <div class="flex gap-1 mt-3">
      <button class="btn btn-primary" onclick='closeModal(); quickPrescribe(${patientId}, ${JSON.stringify(patientName)})'>Write prescription</button>
      <button class="btn btn-ghost" onclick="closeModal()">Close</button>
    </div>
  `;
  document.querySelector('.modal').innerHTML = html;
}

function quickPrescribe(patientId, patientName) {
  switchTab('prescribe');
  setTimeout(() => {
    const sel = document.getElementById('rx-patient');
    // ensure option exists
    if (![...sel.options].some(o => o.value == patientId)) {
      const o = document.createElement('option');
      o.value = patientId; o.textContent = patientName;
      sel.appendChild(o);
    }
    sel.value = patientId;
  }, 100);
}

/* ============ PRESCRIBE ============ */
async function loadPrescribeForm() {
  // Populate patient dropdown from appointments
  const res = await api('/appointments/my-appointments');
  const appts = res.appointments || [];
  const seen = new Set();
  const sel = document.getElementById('rx-patient');
  const current = sel.value;
  sel.innerHTML = '<option value="">Select patient…</option>';
  appts.forEach(a => {
    if (seen.has(a.patient_id)) return;
    seen.add(a.patient_id);
    const o = document.createElement('option');
    o.value = a.patient_id;
    o.textContent = `${a.patient_name} (${a.patient_unique_id || ''})`;
    sel.appendChild(o);
  });
  if (current) sel.value = current;
}

function addMedRow() {
  state.medCount++;
  const idx = state.medCount;
  const row = document.createElement('div');
  row.className = 'card-soft card';
  row.style.marginBottom = '0.5rem';
  row.dataset.medRow = idx;
  row.innerHTML = `
    <div class="grid-2">
      <div class="form-group" style="margin: 0;">
        <label class="form-label">Medicine name</label>
        <input type="text" data-field="medicine_name" class="form-input" required placeholder="e.g. Amoxicillin 500mg" />
      </div>
      <div class="form-group" style="margin: 0;">
        <label class="form-label">Dosage</label>
        <input type="text" data-field="dosage" class="form-input" placeholder="1 tab" />
      </div>
      <div class="form-group" style="margin: 0;">
        <label class="form-label">Frequency</label>
        <input type="text" data-field="frequency" class="form-input" placeholder="3 times a day" />
      </div>
      <div class="form-group" style="margin: 0;">
        <label class="form-label">Duration (days)</label>
        <input type="number" data-field="duration_days" class="form-input" placeholder="5" />
      </div>
    </div>
    <div class="form-group mt-2" style="margin-bottom: 0;">
      <label class="form-label">Instructions</label>
      <input type="text" data-field="instructions" class="form-input" placeholder="After meals, with water…" />
    </div>
    <button type="button" class="btn btn-ghost btn-sm mt-2" onclick="this.parentElement.remove()">Remove</button>
  `;
  document.getElementById('med-rows').appendChild(row);
}

function addExRow() {
  state.exCount++;
  const row = document.createElement('div');
  row.className = 'card-soft card';
  row.style.marginBottom = '0.5rem';
  row.innerHTML = `
    <div class="grid-2">
      <div class="form-group" style="margin: 0;">
        <label class="form-label">Exercise</label>
        <input type="text" data-field="exercise_name" class="form-input" placeholder="e.g. Brisk walking" />
      </div>
      <div class="form-group" style="margin: 0;">
        <label class="form-label">Frequency</label>
        <input type="text" data-field="frequency" class="form-input" placeholder="Daily" />
      </div>
      <div class="form-group" style="margin: 0;">
        <label class="form-label">Duration (min)</label>
        <input type="number" data-field="duration_minutes" class="form-input" placeholder="30" />
      </div>
      <div class="form-group" style="margin: 0;">
        <label class="form-label">Notes</label>
        <input type="text" data-field="notes" class="form-input" placeholder="Optional" />
      </div>
    </div>
    <button type="button" class="btn btn-ghost btn-sm mt-2" onclick="this.parentElement.remove()">Remove</button>
  `;
  document.getElementById('ex-rows').appendChild(row);
}

function gatherRows(containerId) {
  return [...document.querySelectorAll(`#${containerId} > .card`)].map(row => {
    const out = {};
    row.querySelectorAll('[data-field]').forEach(inp => {
      const v = inp.value.trim();
      if (v) {
        if (inp.dataset.field === 'duration_minutes' || inp.dataset.field === 'duration_days') out[inp.dataset.field] = +v;
        else out[inp.dataset.field] = v;
      }
    });
    return out;
  }).filter(r => Object.keys(r).length > 0 && (r.medicine_name || r.exercise_name));
}

async function submitRx(e) {
  e.preventDefault();
  const patient_id = document.getElementById('rx-patient').value;
  if (!patient_id) { toast('Select a patient', 'warn'); return; }
  const meds = gatherRows('med-rows');
  if (!meds.length) { toast('Add at least one medicine', 'warn'); return; }
  const ex = gatherRows('ex-rows');

  const body = {
    patient_id: +patient_id,
    diagnosis: document.getElementById('rx-diagnosis').value.trim() || null,
    notes: document.getElementById('rx-notes').value.trim() || null,
    medicines: meds,
    exercises: ex,
  };
  const res = await api('/prescriptions/', { method: 'POST', body });
  if (res.success) {
    toast('Prescription issued ✓', 'success');
    resetRxForm();
    switchTab('rx-list');
  } else {
    toast(res.message || 'Failed', 'error');
  }
}

function resetRxForm() {
  document.getElementById('rx-form').reset();
  document.getElementById('med-rows').innerHTML = '';
  document.getElementById('ex-rows').innerHTML = '';
  addMedRow();
}

/* ============ MY RX LIST ============ */
async function loadMyPrescriptions() {
  const res = await api('/prescriptions/');
  const list = res.prescriptions || [];
  const el = document.getElementById('rx-list');
  if (!list.length) {
    el.innerHTML = `<div class="empty"><p>No prescriptions issued yet.</p></div>`;
    return;
  }
  el.innerHTML = list.map(p => `
    <div class="list-card">
      <div class="list-card-head">
        <div>
          <h4>${escapeHtml(p.patient_name || '—')} <span class="text-mute text-sm">${p.patient_unique_id ? `· ${escapeHtml(p.patient_unique_id)}` : ''}</span></h4>
          <div class="text-sm text-mute">${escapeHtml(p.diagnosis || 'No diagnosis')} · ${fmtDate(p.prescribed_date || p.created_at)}</div>
        </div>
        <span class="status-tag active">active</span>
      </div>
      ${(p.medicines || []).length ? `
        <table class="simple mt-2">
          <thead><tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th></tr></thead>
          <tbody>${p.medicines.map(it => `<tr><td>${escapeHtml(it.medicine_name)}</td><td>${escapeHtml(it.dosage || '—')}</td><td>${escapeHtml(it.frequency || '—')}</td><td>${it.duration_days ? `${it.duration_days} days` : '—'}</td></tr>`).join('')}</tbody>
        </table>
      ` : ''}
      ${(p.exercises || []).length ? `<p class="text-sm mt-2"><strong>Exercises:</strong> ${p.exercises.map(e => escapeHtml(e.exercise_name)).join(', ')}</p>` : ''}
    </div>
  `).join('');
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
  // Time fields HH:MM:SS -> HH:MM for input[type=time]
  ['available_from','available_to'].forEach(k => {
    if (p[k] && typeof p[k] === 'string' && p[k].length > 5) p[k] = p[k].substring(0, 5);
  });
  ['specialization','license_number','qualification','experience_years','consultation_fee','city','state','pincode','clinic_name','clinic_address','available_days','available_from','available_to','bio'].forEach(k => {
    if (f[k]) f[k].value = p[k] || '';
  });
  // Load photo
  const photoEl = document.getElementById('current-photo');
  if (photoEl) photoEl.innerHTML = photoHtml(u);
}
async function saveProfile(e) {
  e.preventDefault();
  const f = e.target;
  const body = {};
  for (const el of f.elements) {
    if (el.name) body[el.name] = el.value || null;
  }
  const res = await api('/auth/profile', { method: 'PUT', body });
  if (res.success) toast('Profile updated', 'success');
  else toast(res.message || 'Failed', 'error');
}

// Expose inline-handler functions to window so they work from HTML onclick
window.switchTab = switchTab;
window.updateAppt = updateAppt;
window.viewPatient = viewPatient;
window.quickPrescribe = quickPrescribe;
window.addMedRow = addMedRow;
window.addExRow = addExRow;
window.resetRxForm = resetRxForm;
