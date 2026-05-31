/* MediTrace — Patient Dashboard (Phase 2) */

const user = requireLogin(['patient']);
const state = {
  symptoms: [],
  selectedSymptoms: new Set(),
  severity: {},
  predictions: null,
  habitFilter: 'all',
  habits: [],
};

if (user) initPatient();

async function initPatient() {
  renderSidebarUser();
  const themeContainer = document.getElementById('theme-toggle-container');
  const langContainer = document.getElementById('lang-switcher-container');
  if (themeContainer) renderThemeToggle(themeContainer);
  if (langContainer) renderLangSwitcher(langContainer);

  document.querySelectorAll('.dash-nav-item').forEach(b => {
    b.addEventListener('click', () => switchTab(b.dataset.tab));
  });

  document.getElementById('to-step-2-btn').addEventListener('click', goStep2);
  document.getElementById('analyze-btn').addEventListener('click', runAnalysis);
  document.getElementById('symptom-search').addEventListener('input', filterSymptoms);

  document.querySelectorAll('.habit-filter').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.habit-filter').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      state.habitFilter = b.dataset.cat;
      renderHabits();
    });
  });

  document.getElementById('profile-form').addEventListener('submit', saveProfile);

  const photoInput = document.getElementById('photo-input');
  if (photoInput) photoInput.addEventListener('change', handlePhotoUpload);

  const bookBtn = document.getElementById('book-new-btn');
  if (bookBtn) bookBtn.addEventListener('click', openDoctorBrowser);

  document.getElementById('med-search-btn').addEventListener('click', searchMedicines);
  document.getElementById('med-search').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); searchMedicines(); }
  });

  loadHome();
  loadSymptoms();
}

function renderSidebarUser() {
  const el = document.getElementById('sidebar-user');
  if (!el) return;
  el.innerHTML = `
    ${photoHtml(user, 'sm')}
    <div class="uname">
      <div class="nm">${escapeHtml(user.full_name)}</div>
      <div class="uid">${escapeHtml(user.unique_id)}</div>
    </div>
  `;
}

function filterSymptoms(e) {
  const q = e.target.value.toLowerCase();
  document.querySelectorAll('.symptom-chip').forEach(c => {
    const match = c.dataset.name.toLowerCase().includes(q);
    c.style.display = match ? '' : 'none';
  });
  document.querySelectorAll('.symptom-category').forEach(cat => {
    let next = cat.nextElementSibling;
    let anyVisible = false;
    while (next && !next.classList.contains('symptom-category')) {
      if (next.style.display !== 'none') { anyVisible = true; break; }
      next = next.nextElementSibling;
    }
    cat.style.display = anyVisible ? '' : 'none';
  });
}

const tabMeta = {
  home: ['Overview', 'Your health dashboard'],
  checker: ['Step 01', 'Symptom checker'],
  appointments: ['Schedule', 'Appointments'],
  habits: ['Daily care', 'Healthy habits'],
  medication: ['Adherence', 'Medications & vitals'],
  medicines: ['Locate', 'Find medicine'],
  requests: ['Pharmacy', 'My medicine requests'],
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
  if (tab === 'habits') loadHabits();
  if (tab === 'medication') loadMedications();
  if (tab === 'requests') loadMyRequests();
  if (tab === 'profile') loadProfile();
}
window.switchTab = switchTab;

/* HOME */
async function loadHome() {
  try {
    const [hist, appts, rx, vitals] = await Promise.all([
      api('/symptoms/history'),
      api('/appointments/my-appointments'),
      api('/prescriptions/'),
      api('/vitals/'),
    ]);
    document.getElementById('stat-checks').textContent = hist.history?.length || 0;
    document.getElementById('stat-appts').textContent = appts.appointments?.filter(a => ['pending', 'confirmed'].includes(a.status)).length || 0;
    document.getElementById('stat-rx').textContent = rx.prescriptions?.length || 0;

    const v = vitals.vitals?.[0];
    const rvEl = document.getElementById('recent-vitals');
    if (v) {
      rvEl.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
          <div><div class="text-xs text-mute mono" style="text-transform: uppercase; letter-spacing: 0.1em;">Heart Rate</div><div class="serif" style="font-size: 1.6rem;">${v.heart_rate ?? '—'} <span class="text-sm text-mute">bpm</span></div></div>
          <div><div class="text-xs text-mute mono" style="text-transform: uppercase; letter-spacing: 0.1em;">Blood Pressure</div><div class="serif" style="font-size: 1.6rem;">${v.bp_systolic ?? '—'}/${v.bp_diastolic ?? '—'}</div></div>
          <div><div class="text-xs text-mute mono" style="text-transform: uppercase; letter-spacing: 0.1em;">Oxygen</div><div class="serif" style="font-size: 1.6rem;">${v.oxygen_level ?? '—'}<span class="text-sm text-mute">%</span></div></div>
          <div><div class="text-xs text-mute mono" style="text-transform: uppercase; letter-spacing: 0.1em;">Glucose</div><div class="serif" style="font-size: 1.6rem;">${v.blood_sugar ?? '—'} <span class="text-sm text-mute">mg/dL</span></div></div>
        </div>
        <p class="text-xs text-mute mt-2">Logged ${fmtDateTime(v.recorded_at)}</p>
      `;
    } else {
      rvEl.innerHTML = `<p class="text-mute text-sm">No vitals logged yet. <a href="#" onclick="switchTab('medication'); return false;">Log your first reading →</a></p>`;
    }

    const recent = (hist.history || []).slice(0, 3);
    const rcEl = document.getElementById('recent-checks');
    if (!recent.length) {
      rcEl.innerHTML = `<div class="empty"><div class="empty-icon">·</div><p>No symptom checks yet. Run one to see it here.</p></div>`;
    } else {
      rcEl.innerHTML = recent.map(c => {
        let preds = [];
        try { preds = typeof c.predictions === 'string' ? JSON.parse(c.predictions) : (c.predictions || []); } catch {}
        const top = preds[0] || { disease_name: c.top_disease, probability: c.top_probability };
        return `<div class="list-card">
          <div class="list-card-head">
            <h4>${top.disease_name ? escapeHtml(top.disease_name) : 'Check'} <span class="text-mute text-sm">${top.probability != null ? `· ${Math.round(top.probability)}% confidence` : ''}</span></h4>
            <span class="text-xs text-mute">${fmtDateTime(c.checked_at)}</span>
          </div>
          <div class="text-sm text-mute">${preds.slice(0, 3).map(p => escapeHtml(p.disease_name)).join(' · ')}</div>
        </div>`;
      }).join('');
    }
  } catch (err) {
    console.error('Home load error:', err);
  }
}

/* SYMPTOM CHECKER */
async function loadSymptoms() {
  const res = await api('/symptoms/symptoms');
  if (!res.success) {
    document.getElementById('symptom-grid').innerHTML = '<p class="text-mute">Could not load symptoms.</p>';
    return;
  }
  state.symptoms = [];
  const grid = document.getElementById('symptom-grid');
  grid.innerHTML = '';
  const grouped = res.grouped || {};
  Object.keys(grouped).sort().forEach(cat => {
    const header = document.createElement('div');
    header.className = 'symptom-category';
    header.textContent = cat;
    grid.appendChild(header);
    grouped[cat].forEach(s => {
      state.symptoms.push(s);
      const chip = document.createElement('div');
      chip.className = 'symptom-chip';
      chip.dataset.id = s.id;
      chip.dataset.name = s.name;
      chip.textContent = s.name;
      chip.addEventListener('click', () => toggleSymptom(s.id, chip));
      grid.appendChild(chip);
    });
  });
}

function toggleSymptom(id, chip) {
  if (state.selectedSymptoms.has(id)) {
    state.selectedSymptoms.delete(id);
    chip.classList.remove('selected');
  } else {
    state.selectedSymptoms.add(id);
    chip.classList.add('selected');
  }
  document.getElementById('selected-count').textContent = state.selectedSymptoms.size;
  document.getElementById('to-step-2-btn').disabled = state.selectedSymptoms.size === 0;
}

function goStep2() {
  document.getElementById('checker-step-1').classList.add('hidden');
  document.getElementById('checker-step-2').classList.remove('hidden');
  const list = document.getElementById('severity-list');
  list.innerHTML = '';
  state.selectedSymptoms.forEach(id => {
    const s = state.symptoms.find(x => x.id === id);
    if (!s) return;
    state.severity[id] = state.severity[id] || 3;
    const row = document.createElement('div');
    row.className = 'severity-row';
    row.innerHTML = `
      <div>${escapeHtml(s.name)}</div>
      <div class="severity-pills">
        ${[1,2,3,4,5].map(n => `<button type="button" class="sev-pill ${state.severity[id] === n ? 'active' : ''}" data-id="${id}" data-n="${n}">${n}</button>`).join('')}
      </div>
    `;
    list.appendChild(row);
  });
  list.querySelectorAll('.sev-pill').forEach(p => {
    p.addEventListener('click', () => {
      const id = +p.dataset.id, n = +p.dataset.n;
      state.severity[id] = n;
      list.querySelectorAll(`.sev-pill[data-id="${id}"]`).forEach(x => x.classList.toggle('active', +x.dataset.n === n));
    });
  });
}

function checkerBack() {
  document.getElementById('checker-step-2').classList.add('hidden');
  document.getElementById('checker-step-1').classList.remove('hidden');
}
window.checkerBack = checkerBack;

async function runAnalysis() {
  const btn = document.getElementById('analyze-btn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Analyzing…';

  const vitals = {
    heart_rate: parseFloat(document.getElementById('v-hr').value) || null,
    bp_systolic: parseFloat(document.getElementById('v-sys').value) || null,
    bp_diastolic: parseFloat(document.getElementById('v-dia').value) || null,
    oxygen_level: parseFloat(document.getElementById('v-o2').value) || null,
    blood_sugar: parseFloat(document.getElementById('v-sugar').value) || null,
    temperature: parseFloat(document.getElementById('v-temp').value) || null,
    source: document.getElementById('v-source').value,
  };

  const res = await api('/symptoms/predict', { method: 'POST', body: {
    symptom_ids: [...state.selectedSymptoms],
    severity: state.severity,
    vitals,
  }});

  btn.disabled = false;
  btn.innerHTML = 'Analyze symptoms';

  if (!res.success) { toast(res.message || 'Analysis failed', 'error'); return; }

  state.predictions = res;
  document.getElementById('checker-step-2').classList.add('hidden');
  document.getElementById('checker-results').classList.remove('hidden');
  renderResults(res);
}

function renderResults(res) {
  const warnEl = document.getElementById('vitals-warnings');
  warnEl.innerHTML = '';
  if (res.warnings && res.warnings.length) {
    warnEl.innerHTML = res.warnings.map(w => `<div class="alert alert-warn"><strong>${escapeHtml(w.vital || 'Vitals notice')}:</strong> ${escapeHtml(w.message)}</div>`).join('');
  }

  const dEl = document.getElementById('disease-results');
  if (!res.predictions || !res.predictions.length) {
    dEl.innerHTML = '<div class="empty"><p>We couldn\'t match a strong pattern. Please consult a general physician.</p></div>';
  } else {
    dEl.innerHTML = res.predictions.map((d, i) => {
      const color = i === 0 ? '#1f4f47' : i === 1 ? '#2d7166' : '#b88a2e';
      const pct = Math.round(d.probability);
      return `
        <div class="disease-card">
          <div class="disease-prob">
            <div class="prob-ring">
              ${probRingSVG(pct, color)}
              <div class="pct">${pct}%</div>
            </div>
          </div>
          <div class="disease-info">
            <h4>${escapeHtml(d.disease_name)}</h4>
            <span class="sev-tag ${d.severity || 'mild'}">${d.severity || 'mild'}</span>
            <span class="spec-tag">→ ${escapeHtml(d.recommended_specialization || 'General Physician')}</span>
            <p class="desc">${escapeHtml(d.description || '')}</p>
            ${d.precautions ? `<p class="desc"><strong>Precautions:</strong> ${escapeHtml(d.precautions)}</p>` : ''}
          </div>
          <div>
            <button class="btn btn-ghost btn-sm" onclick='findDoctorsFor(${JSON.stringify(d.recommended_specialization || "General Physician")})'>Find doctor →</button>
          </div>
        </div>
      `;
    }).join('');
  }

  if (res.predictions && res.predictions[0]) {
    findDoctorsFor(res.predictions[0].recommended_specialization || 'General Physician');
  }
}

async function findDoctorsFor(spec) {
  const el = document.getElementById('suggested-doctors');
  el.innerHTML = '<div class="page-loader"><span class="spinner"></span></div>';
  const res = await api(`/symptoms/doctors/${encodeURIComponent(spec)}`);
  if (!res.success || !res.doctors?.length) {
    el.innerHTML = `<p class="text-mute">No doctors registered for "${escapeHtml(spec)}" yet. Try browsing all doctors.</p>`;
    return;
  }
  el.innerHTML = res.doctors.slice(0, 5).map(d => doctorCardHtml(d)).join('');
}
window.findDoctorsFor = findDoctorsFor;

function doctorCardHtml(d) {
  return `<div class="doctor-card">
    ${photoHtml(d)}
    <div class="doctor-info">
      <h4>Dr. ${escapeHtml(d.full_name)}</h4>
      <div class="meta">
        <span>${escapeHtml(d.specialization || 'General')}</span>
        ${d.experience_years ? `<span>· ${d.experience_years} yrs exp</span>` : ''}
        ${d.consultation_fee ? `<span>· ₹${d.consultation_fee}</span>` : ''}
        ${d.city ? `<span>· ${escapeHtml(d.city)}</span>` : ''}
      </div>
    </div>
    <div class="doctor-actions">
      <button class="btn btn-primary btn-sm" onclick='openBookingModal(${d.id}, ${JSON.stringify(d.full_name)}, ${JSON.stringify(d.specialization || "")})'>Book</button>
    </div>
  </div>`;
}

function resetChecker() {
  state.selectedSymptoms.clear();
  state.severity = {};
  state.predictions = null;
  document.getElementById('checker-results').classList.add('hidden');
  document.getElementById('checker-step-1').classList.remove('hidden');
  document.querySelectorAll('.symptom-chip').forEach(c => c.classList.remove('selected'));
  document.getElementById('selected-count').textContent = '0';
  document.getElementById('to-step-2-btn').disabled = true;
  ['v-hr','v-sys','v-dia','v-o2','v-sugar','v-temp'].forEach(id => document.getElementById(id).value = '');
}
window.resetChecker = resetChecker;

/* APPOINTMENTS */
async function loadAppointments() {
  const res = await api('/appointments/my-appointments');
  const el = document.getElementById('appointments-list');
  if (!res.success || !res.appointments?.length) {
    el.innerHTML = `<div class="empty"><div class="empty-icon">·</div><p>No appointments yet.</p><button class="btn btn-primary mt-2" onclick="openDoctorBrowser()">Book your first</button></div>`;
    return;
  }
  el.innerHTML = res.appointments.map(a => `
    <div class="list-card">
      <div class="list-card-head">
        <div>
          <h4>Dr. ${escapeHtml(a.doctor_name)}</h4>
          <div class="text-sm text-mute">${escapeHtml(a.specialization || 'General')}</div>
        </div>
        <span class="status-tag ${a.status}">${a.status}</span>
      </div>
      <div class="text-sm">
        <strong>${fmtDate(a.appointment_date)}</strong> at ${fmtTime(a.appointment_time)}
        ${a.reason ? `<br/><span class="text-mute">Reason:</span> ${escapeHtml(a.reason)}` : ''}
      </div>
      ${['pending','confirmed'].includes(a.status) ? `<button class="btn btn-ghost btn-sm mt-2" onclick="cancelAppt(${a.id})">Cancel</button>` : ''}
    </div>
  `).join('');
}

async function cancelAppt(id) {
  if (!confirm('Cancel this appointment?')) return;
  const res = await api(`/appointments/${id}/status`, { method: 'PUT', body: { status: 'cancelled' } });
  if (res.success) { toast('Appointment cancelled', 'success'); loadAppointments(); }
  else toast(res.message || 'Failed', 'error');
}
window.cancelAppt = cancelAppt;

async function openDoctorBrowser() {
  openModal(`<div class="page-loader"><span class="spinner"></span> Loading doctors…</div>`);
  const res = await api('/appointments/doctors');
  const doctors = res.doctors || [];
  const html = `
    <h3>Choose a doctor</h3>
    <input type="text" id="doc-search" class="form-input mb-2" placeholder="Search by name, specialization, city..." />
    <div id="doc-list" style="max-height: 50vh; overflow-y: auto;">
      ${doctors.length ? doctors.map(d => doctorCardHtml(d)).join('') : '<p class="text-mute">No doctors available.</p>'}
    </div>
    <button class="btn btn-ghost mt-2" onclick="closeModal()">Close</button>
  `;
  document.querySelector('.modal').innerHTML = html;
  document.getElementById('doc-search').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll('#doc-list .doctor-card').forEach(c => {
      c.style.display = c.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });
}
window.openDoctorBrowser = openDoctorBrowser;

function openBookingModal(doctorId, doctorName, specialization) {
  const today = new Date().toISOString().split('T')[0];
  const html = `
    <h3>Book with Dr. ${escapeHtml(doctorName)}</h3>
    <p class="text-mute text-sm">${escapeHtml(specialization)}</p>
    <form id="booking-form">
      <div class="form-group">
        <label class="form-label">Date</label>
        <input type="date" name="date" class="form-input" required min="${today}" value="${today}" />
      </div>
      <div class="form-group">
        <label class="form-label">Time</label>
        <input type="time" name="time" class="form-input" required value="10:00" />
      </div>
      <div class="form-group">
        <label class="form-label">Reason / chief complaint</label>
        <textarea name="reason" class="form-textarea" placeholder="What brings you in?"></textarea>
      </div>
      <div class="flex gap-1">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Confirm booking</button>
      </div>
    </form>
  `;
  openModal(html);
  const form = document.getElementById('booking-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type=submit]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Booking…';
    try {
      const timeVal = form.time.value;
      const timeFormatted = timeVal.length === 5 ? timeVal + ':00' : timeVal;
      const res = await api('/appointments/book', { method: 'POST', body: {
        doctor_id: doctorId,
        appointment_date: form.date.value,
        appointment_time: timeFormatted,
        reason: form.reason.value.trim() || null,
      }});
      if (res.success) {
        toast('Appointment booked!', 'success');
        closeModal();
        switchTab('appointments');
      } else {
        toast(res.message || 'Booking failed', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Confirm booking';
      }
    } catch (err) {
      toast('Network error — please try again', 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Confirm booking';
    }
  });
}
window.openBookingModal = openBookingModal;

/* HABITS */
async function loadHabits() {
  if (state.habits.length) { renderHabits(); return; }
  const res = await api('/habits/');
  state.habits = res.habits || [];
  renderHabits();
}
function renderHabits() {
  const list = state.habitFilter === 'all' ? state.habits : state.habits.filter(h => h.category === state.habitFilter);
  const el = document.getElementById('habits-grid');
  if (!list.length) { el.innerHTML = `<div class="empty"><p>No habits in this category yet.</p></div>`; return; }
  const icons = { exercise: '✦', diet: '◉', sleep: '◗', mental: '◍', lifestyle: '✧' };
  el.innerHTML = list.map(h => `
    <div class="habit-card">
      <div class="habit-thumb">
        <span class="cat-tag">${escapeHtml(h.category)}</span>
        ${icons[h.category] || '✻'}
      </div>
      <div class="habit-body">
        <h4>${escapeHtml(h.title)}</h4>
        <p>${escapeHtml((h.description || '').slice(0, 110))}${(h.description || '').length > 110 ? '…' : ''}</p>
        <div class="habit-meta">
          ${h.duration ? `<span>⏱ ${escapeHtml(h.duration)}</span>` : ''}
          ${h.difficulty ? `<span>● ${escapeHtml(h.difficulty)}</span>` : ''}
        </div>
        <div class="flex gap-1">
          <button class="btn btn-ghost btn-sm" onclick='viewHabit(${h.id})'>Details</button>
          <button class="btn btn-primary btn-sm" onclick="logHabit(${h.id}, this)">✓ Log</button>
        </div>
      </div>
    </div>
  `).join('');
}
function viewHabit(id) {
  const h = state.habits.find(x => x.id === id);
  if (!h) return;
  const html = `
    <h3>${escapeHtml(h.title)}</h3>
    <span class="status-tag ${h.category === 'exercise' ? 'active' : 'confirmed'}">${escapeHtml(h.category)}</span>
    <p class="mt-2">${escapeHtml(h.description || '')}</p>
    ${h.how_to ? `<h4 class="mt-3">How to do it</h4><p>${escapeHtml(h.how_to).replace(/\n/g, '<br/>')}</p>` : ''}
    ${h.benefits ? `<h4 class="mt-3">Benefits</h4><p>${escapeHtml(h.benefits)}</p>` : ''}
    ${h.video_url ? `<a href="${escapeHtml(h.video_url)}" target="_blank" rel="noopener" class="btn btn-ghost mt-2">▶ Watch video tutorial</a>` : ''}
    <div class="flex gap-1 mt-3">
      <button class="btn btn-primary" onclick="logHabit(${h.id}); closeModal();">Log as done</button>
      <button class="btn btn-ghost" onclick="closeModal()">Close</button>
    </div>
  `;
  openModal(html);
}
window.viewHabit = viewHabit;

async function logHabit(id, btn) {
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>'; }
  try {
    const res = await api('/habits/log', { method: 'POST', body: { habit_id: id, completed: true, duration_minutes: null, notes: '' } });
    if (res.success) {
      toast('Habit logged ✓', 'success');
      if (btn) {
        btn.innerHTML = '✓ Logged';
        setTimeout(() => { btn.disabled = false; btn.innerHTML = '✓ Log'; }, 2000);
      }
    } else {
      toast(res.message || 'Failed to log habit', 'error');
      if (btn) { btn.disabled = false; btn.innerHTML = '✓ Log'; }
    }
  } catch (err) {
    toast('Network error', 'error');
    if (btn) { btn.disabled = false; btn.innerHTML = '✓ Log'; }
  }
}
window.logHabit = logHabit;

/* MEDICATIONS */
async function loadMedications() {
  const res = await api('/prescriptions/');
  const list = res.prescriptions || [];
  document.getElementById('m-active').textContent = list.length;

  const logsRes = await api('/prescriptions/medication-logs');
  const logs = logsRes.logs || [];
  const weekAgo = Date.now() - 7 * 86400000;
  document.getElementById('m-logged').textContent = logs.filter(l => new Date(l.taken_at).getTime() > weekAgo && l.status === 'taken').length;

  const el = document.getElementById('rx-list');
  if (!list.length) {
    el.innerHTML = `<div class="empty"><div class="empty-icon">·</div><p>No prescriptions yet. They'll appear here when a doctor writes one.</p></div>`;
    return;
  }
  el.innerHTML = list.map(p => `
    <div class="list-card">
      <div class="list-card-head">
        <div>
          <h4>Dr. ${escapeHtml(p.doctor_name || '—')} ${p.specialization ? `<span class="text-mute text-sm">· ${escapeHtml(p.specialization)}</span>` : ''}</h4>
          <div class="text-sm text-mute">${escapeHtml(p.diagnosis || 'No diagnosis recorded')} · ${fmtDate(p.prescribed_date || p.created_at)}</div>
        </div>
        <span class="status-tag active">active</span>
      </div>
      ${(p.medicines || []).length ? `
        <table class="simple mt-2">
          <thead><tr><th>Medicine</th><th>Dosage</th><th>Frequency</th><th>Duration</th><th></th></tr></thead>
          <tbody>
            ${p.medicines.map(it => `<tr>
              <td><strong>${escapeHtml(it.medicine_name)}</strong></td>
              <td>${escapeHtml(it.dosage || '—')}</td>
              <td>${escapeHtml(it.frequency || '—')}</td>
              <td>${it.duration_days ? `${it.duration_days} days` : '—'}</td>
              <td><button class="btn btn-ghost btn-sm" onclick="logMedTaken(${it.id}, this)">✓ Taken</button></td>
            </tr>`).join('')}
          </tbody>
        </table>
      ` : ''}
      ${(p.exercises || []).length ? `
        <h4 class="mt-3">Prescribed exercises</h4>
        <ul class="text-sm" style="padding-left: 1.2rem;">
          ${p.exercises.map(ex => `<li><strong>${escapeHtml(ex.exercise_name)}</strong> — ${escapeHtml(ex.frequency || '')} ${ex.duration_minutes ? `(${ex.duration_minutes}m)` : ''}</li>`).join('')}
        </ul>
      ` : ''}
      ${p.notes ? `<p class="text-sm text-mute mt-2"><em>${escapeHtml(p.notes)}</em></p>` : ''}
    </div>
  `).join('');
}
async function logMedTaken(itemId, btn) {
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="spinner"></span>'; }
  const res = await api('/prescriptions/log-medication', { method: 'POST', body: { prescription_item_id: itemId, status: 'taken' } });
  if (res.success) { toast('Logged ✓', 'success'); if (btn) btn.innerHTML = '✓ Done'; }
  else { toast(res.message || 'Failed', 'error'); if (btn) { btn.disabled = false; btn.innerHTML = '✓ Taken'; } }
}
window.logMedTaken = logMedTaken;

async function logVitals() {
  const body = {
    heart_rate: parseFloat(document.getElementById('lv-hr').value) || null,
    bp_systolic: parseFloat(document.getElementById('lv-sys').value) || null,
    bp_diastolic: parseFloat(document.getElementById('lv-dia').value) || null,
    oxygen_level: parseFloat(document.getElementById('lv-o2').value) || null,
    sleep_hours: parseFloat(document.getElementById('lv-sleep').value) || null,
    steps: parseInt(document.getElementById('lv-steps').value) || null,
    source: 'manual',
  };
  const res = await api('/vitals/', { method: 'POST', body });
  if (res.success) {
    toast('Vitals saved', 'success');
    ['lv-hr','lv-sys','lv-dia','lv-o2','lv-sleep','lv-steps'].forEach(id => document.getElementById(id).value = '');
    loadHome();
  } else toast(res.message || 'Failed', 'error');
}
window.logVitals = logVitals;

/* MEDICINE SEARCH + REQUEST */
async function searchMedicines() {
  const q = document.getElementById('med-search').value.trim();
  const city = document.getElementById('med-city').value.trim();
  if (!q) { toast('Enter a medicine name', 'warn'); return; }
  const el = document.getElementById('medicine-results');
  el.innerHTML = '<div class="page-loader"><span class="spinner"></span></div>';
  const res = await api(`/medicines/search?query=${encodeURIComponent(q)}${city ? '&city=' + encodeURIComponent(city) : ''}`);
  if (!res.success || !res.results?.length) {
    el.innerHTML = `<div class="empty"><p>No matching medicines found at registered pharmacies.</p></div>`;
    return;
  }
  el.innerHTML = `<div class="medicine-list">
    ${res.results.map((m) => {
      const qty = m.stock_quantity || 0;
      const status = qty === 0 ? 'out_of_stock' : (qty < 10 ? 'low_stock' : 'in_stock');
      const statusText = status.replace('_', ' ');
      return `
      <div class="medicine-row" style="grid-template-columns: 1fr auto auto auto auto;">
        <div class="name">
          ${escapeHtml(m.medicine_name)}
          <div class="generic">${escapeHtml(m.generic_name || '')} ${m.manufacturer ? `· ${escapeHtml(m.manufacturer)}` : ''}</div>
        </div>
        <div class="price">₹${m.price}</div>
        <div class="shop">
          <strong>${escapeHtml(m.shop_name)}</strong><br/>
          <span class="text-xs">${escapeHtml(m.shop_city || '')}${m.shop_phone ? ` · ${escapeHtml(m.shop_phone)}` : ''}</span>
          ${m.latitude && m.longitude ? `<br/><a href="https://maps.google.com/?q=${m.latitude},${m.longitude}" target="_blank">Get directions →</a>` : ''}
        </div>
        <span class="stock-tag ${status}">${statusText}</span>
        <button class="btn btn-ember btn-sm" onclick='openMedRequestModal(${m.shop_id}, ${JSON.stringify(m.shop_name)}, ${JSON.stringify(m.medicine_name)}, ${m.id})'>📩 Request</button>
      </div>
    `;}).join('')}
  </div>`;
}
window.searchMedicines = searchMedicines;

function openMedRequestModal(shopId, shopName, medicineName, inventoryId) {
  const html = `
    <h3>Request medicine</h3>
    <p class="text-mute text-sm">Send a request to <strong>${escapeHtml(shopName)}</strong>. The pharmacy will be notified and respond to you.</p>
    <form id="med-req-form">
      <div class="form-group">
        <label class="form-label">Medicine</label>
        <input type="text" name="medicine_name" class="form-input" value="${escapeHtml(medicineName)}" required />
      </div>
      <div class="form-group">
        <label class="form-label">Quantity</label>
        <input type="number" name="quantity" class="form-input" value="1" min="1" />
      </div>
      <div class="form-group">
        <label class="form-label">Notes (prescription details, urgency, etc.)</label>
        <textarea name="notes" class="form-textarea" placeholder="e.g. I have a prescription from Dr. X, urgent need by tomorrow morning..."></textarea>
      </div>
      <div class="flex gap-1">
        <button type="button" class="btn btn-ghost" onclick="closeModal()">Cancel</button>
        <button type="submit" class="btn btn-primary">Send request</button>
      </div>
    </form>
  `;
  openModal(html);
  document.getElementById('med-req-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    const btn = f.querySelector('button[type=submit]');
    btn.disabled = true; btn.innerHTML = '<span class="spinner"></span> Sending…';
    const res = await api('/medicine-requests/', { method: 'POST', body: {
      shop_id: shopId,
      medicine_name: f.medicine_name.value.trim(),
      inventory_id: inventoryId || null,
      quantity: parseInt(f.quantity.value) || 1,
      notes: f.notes.value.trim() || null,
    }});
    if (res.success) {
      toast('Request sent to pharmacy!', 'success');
      closeModal();
      switchTab('requests');
    } else {
      toast(res.message || 'Failed to send', 'error');
      btn.disabled = false; btn.innerHTML = 'Send request';
    }
  });
}
window.openMedRequestModal = openMedRequestModal;

async function loadMyRequests() {
  const el = document.getElementById('requests-list');
  el.innerHTML = '<div class="page-loader"><span class="spinner"></span></div>';
  const res = await api('/medicine-requests/');
  if (!res.success || !res.requests?.length) {
    el.innerHTML = `<div class="empty"><div class="empty-icon">·</div><p>No medicine requests yet. Find a medicine and request it!</p>
      <button class="btn btn-primary mt-2" onclick="switchTab('medicines')">Find medicine →</button></div>`;
    return;
  }
  el.innerHTML = res.requests.map(r => `
    <div class="req-card">
      <div class="head">
        <div>
          <h4>${escapeHtml(r.medicine_name)} <span class="text-mute text-sm">× ${r.quantity}</span></h4>
          <div class="text-sm text-mute">From: <strong>${escapeHtml(r.shop_display_name || r.shop_name)}</strong> · ${escapeHtml(r.city || '')}</div>
        </div>
        <span class="req-status ${r.status}">${r.status}</span>
      </div>
      ${r.notes ? `<div class="text-sm mt-1"><strong>Your note:</strong> ${escapeHtml(r.notes)}</div>` : ''}
      ${r.pharmacy_notes ? `<div class="text-sm mt-1" style="background: var(--bg-soft); padding: 0.5rem 0.75rem; border-radius: var(--radius-sm);"><strong>Pharmacy reply:</strong> ${escapeHtml(r.pharmacy_notes)}</div>` : ''}
      <div class="text-xs text-mute mt-2">Sent ${fmtDateTime(r.created_at)}${r.shop_phone ? ` · Shop: ${escapeHtml(r.shop_phone)}` : ''}</div>
      ${r.status === 'pending' ? `<button class="btn btn-ghost btn-sm mt-2" onclick="cancelRequest(${r.id})">Cancel request</button>` : ''}
    </div>
  `).join('');
}
async function cancelRequest(id) {
  if (!confirm('Cancel this medicine request?')) return;
  const res = await api(`/medicine-requests/${id}`, { method: 'DELETE' });
  if (res.success) { toast('Request cancelled', 'success'); loadMyRequests(); }
  else toast(res.message || 'Failed', 'error');
}
window.cancelRequest = cancelRequest;

/* PROFILE + PHOTO */
async function loadProfile() {
  const res = await api('/auth/me');
  if (!res.success) return;
  const p = res.profile || {};
  const u = res.user;
  const f = document.getElementById('profile-form');
  f.full_name.value = u.full_name || '';
  f.phone.value = u.phone || '';
  if (p.date_of_birth && typeof p.date_of_birth === 'string') {
    p.date_of_birth = p.date_of_birth.split('T')[0];
  }
  ['date_of_birth','gender','blood_group','height_cm','weight_kg','city','state','pincode','address','allergies','chronic_conditions','emergency_contact'].forEach(k => {
    if (f[k]) f[k].value = p[k] || '';
  });
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
  if (res.success) {
    toast('Profile updated', 'success');
    if (body.full_name) {
      Auth.updateUser({ full_name: body.full_name });
      user.full_name = body.full_name;
      renderSidebarUser();
    }
  } else toast(res.message || 'Failed', 'error');
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
        renderSidebarUser();
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
