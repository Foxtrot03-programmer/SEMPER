/* ================================================================
   SEHEMU 1: VARIABLES ZA HALI YA PROGRAMU
   ================================================================ */

const ADMIN_CREDS = { user: 'Thedora Sikazwe', pass: 'tinkebell2025' };
const PASS_KEY    = 'tinkebell_admin_pass';

// Maombi yote - yanajazwa kutoka Supabase
let allMaombi   = [];
let editingId   = null;   // ID ya ombi linaloharirishwa (null = jipya)
let currentPage = 'overview';


/* ================================================================
   SEHEMU 2: UTILITY FUNCTIONS
   ================================================================ */

// Fomati tarehe: "2025-03-15" -> "15 Mac 2025"
function fomatiTarehe(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  const miezi = ['Jan','Feb','Mac','Apr','Mei','Jun','Jul','Ago','Sep','Okt','Nov','Des'];
  return d.getDate() + ' ' + miezi[d.getMonth()] + ' ' + d.getFullYear();
}

// Tarehe ya leo kama "YYYY-MM-DD"
function tareheLeo() {
  return new Date().toISOString().split('T')[0];
}

// Pata CSS class ya badge kulingana na hali
function badgeClass(hali) {
  const map = {
    'Jipya':             'badge-new',
    'Inaendelea':        'badge-progress',
    'Imekamilika':       'badge-done',
    'Inahitaji Nyaraka': 'badge-docs',
    'Imebatilishwa':     'badge-cancelled'
  };
  return map[hali] || 'badge-new';
}

// Onyesha toast (ujumbe mfupi)
function onyeshaToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = (type === 'success' ? '✅ ' : '❌ ') + msg;
  t.className = 'show ' + type;
  setTimeout(() => { t.className = ''; }, 3000);
}

// Epuka XSS - badilisha < > & kuwa salama
function escHtml(str) {
  return String(str || '')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

// Onyesha loading state kwenye table
function onyeshaLoading(tbodyId) {
  const tbody = document.getElementById(tbodyId);
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;padding:2rem;color:var(--text2);">
          ⏳ Inapakia data kutoka Supabase...
        </td>
      </tr>`;
  }
}


/* ================================================================
   SEHEMU 3: LOGIN NA LOGOUT
   ================================================================ */

function fanyaLogin() {
  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value;
  const savedPass = localStorage.getItem(PASS_KEY) || ADMIN_CREDS.pass;

  if (user === ADMIN_CREDS.user && pass === savedPass) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboard').style.display  = 'block';

    // Pakia data kutoka Supabase mara baada ya login
    paikiDataSupabase();
    onyeshaDateDisplay();

    // Auto-refresh kila sekunde 30 - ona maombi mapya otomatiki
    setInterval(function() {
      paikiDataSupabase();
    }, 30000);
  } else {
    document.getElementById('loginError').style.display = 'block';
    setTimeout(() => {
      document.getElementById('loginError').style.display = 'none';
    }, 3000);
  }
}

function toka() {
  if (!confirm('Unataka kutoka kwenye dashboard?')) return;
  document.getElementById('dashboard').style.display  = 'none';
  document.getElementById('loginScreen').style.display = 'flex';
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
  allMaombi = []; // Futa data kutoka memory
}


/* ================================================================
   SEHEMU 4: PAKIA DATA KUTOKA SUPABASE
   ================================================================
   Hii ndiyo tofauti kubwa na toleo la zamani!
   Badala ya localStorage.getItem(), tunatumia db.selectAll()
   ambayo inawasiliana na Supabase mtandaoni
*/

async function paikiDataSupabase() {
  // Onyesha loading kwanza
  onyeshaLoading('recentTable');

  // Wasiliana na Supabase - pata maombi yote
  // await = subiri jibu kabla ya kuendelea
  const { data, error } = await db.selectAll();

  if (error) {
    console.error('Kosa la Supabase:', JSON.stringify(error));
    onyeshaToast('Kosa la kupakia data! Angalia connection.', 'error');
    allMaombi = [];
  } else {
    // data = array ya maombi yote kutoka Supabase
    allMaombi = data || [];
    console.log('Maombi yaliyopatikana:', allMaombi.length);
  }

  // Sasisha dashboard na data mpya
  sasishaDashboard();

  // Kama tuko kwenye page ya maombi, refresh table
  if (currentPage === 'maombi') renderMaombiTable(allMaombi);
  if (currentPage === 'ripoti') renderRipoti();
}


/* ================================================================
   SEHEMU 5: NAVIGATION
   ================================================================ */

function onyeshePage(page, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  if (btn) btn.classList.add('active');
  currentPage = page;

  // Reload data kutoka Supabase kila ukibadilisha page
  // Hii inahakikisha unaona data ya sasa hivi daima
  if (page === 'maombi') {
    paikiDataSupabase().then(() => filterMaombi());
  }
  if (page === 'ripoti') {
    paikiDataSupabase().then(() => renderRipoti());
  }
}

function onyeshaDateDisplay() {
  const leo   = new Date();
  const siku  = ['Jumapili','Jumatatu','Jumanne','Jumatano','Alhamisi','Ijumaa','Jumamosi'];
  const miezi = ['Januari','Februari','Machi','Aprili','Mei','Juni','Julai','Agosti','Septemba','Oktoba','Novemba','Desemba'];
  const el    = document.getElementById('dateDisplay');
  if (el) {
    el.textContent = siku[leo.getDay()] + ', ' +
                     leo.getDate() + ' ' +
                     miezi[leo.getMonth()] + ' ' +
                     leo.getFullYear();
  }
}


/* ================================================================
   SEHEMU 6: SASISHA TAKWIMU ZA DASHBOARD
   ================================================================ */

function sasishaDashboard() {
  const total    = allMaombi.length;
  const mapya    = allMaombi.filter(m => m.hali === 'Jipya').length;
  const progress = allMaombi.filter(m => m.hali === 'Inaendelea').length;
  const done     = allMaombi.filter(m => m.hali === 'Imekamilika').length;
  const rate     = total > 0 ? Math.round(done / total * 100) : 0;

  document.getElementById('statTotal').textContent    = total;
  document.getElementById('statNew').textContent      = mapya;
  document.getElementById('statProgress').textContent = progress;
  document.getElementById('statDone').textContent     = done;
  document.getElementById('statDoneRate').textContent = rate + '% ya mafanikio';
  document.getElementById('sidebarBadge').textContent = mapya;

  // Onyesha maombi 5 ya hivi karibuni
  const recent = allMaombi.slice(0, 5);
  renderTableRows(document.getElementById('recentTable'), recent);
}


/* ================================================================
   SEHEMU 7: RENDER TABLES
   ================================================================ */

function renderTableRows(tbody, data) {
  if (!data || !data.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;color:var(--text2);padding:2rem;">
          Hakuna maombi bado
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = data.map((m, i) => `
    <tr>
      <td style="color:var(--text2);font-size:.8rem;">${i + 1}</td>
      <td>
        <div class="td-name">${escHtml(m.jina)}</div>
        <div class="td-phone">${escHtml(m.simu)}</div>
      </td>
      <td>${escHtml(m.huduma)}</td>
      <td style="color:var(--text2);font-size:.82rem;">${fomatiTarehe(m.tarehe)}</td>
      <td><span class="badge ${badgeClass(m.hali)}">${escHtml(m.hali)}</span></td>
      <td>
        <div class="action-btns">
          <button class="action-btn" onclick="funguaModalEdit(${m.id})">✏️ Hariri</button>
          <button class="action-btn" onclick="tumaWhatsAppDirect(${m.id})">📱 WA</button>
          <button class="action-btn danger" onclick="funaOmbi(${m.id})">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderMaombiTable(data) {
  renderTableRows(document.getElementById('mainTable'), data);
  document.getElementById('tableCount').textContent = data.length + ' maombi';
  document.getElementById('emptyState').style.display = data.length ? 'none' : 'block';
}


/* ================================================================
   SEHEMU 8: FILTER NA SEARCH
   ================================================================ */

function filterMaombi() {
  const q       = document.getElementById('searchInput').value.toLowerCase();
  const status  = document.getElementById('statusFilter').value;
  const service = document.getElementById('serviceFilter').value;

  const filtered = allMaombi.filter(m => {
    const matchQ = !q ||
      (m.jina   || '').toLowerCase().includes(q) ||
      (m.simu   || '').includes(q) ||
      (m.huduma || '').toLowerCase().includes(q) ||
      (m.email  || '').toLowerCase().includes(q);
    const matchStatus  = !status  || m.hali    === status;
    const matchService = !service || m.huduma  === service;
    return matchQ && matchStatus && matchService;
  });

  renderMaombiTable(filtered);
}


/* ================================================================
   SEHEMU 9: MODAL
   ================================================================ */

function funguaModalMpya() {
  editingId = null;
  document.getElementById('modalTitle').textContent = '+ Ombi Jipya';
  ['mJina','mSimu','mEmail','mNotes'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('mHuduma').value = '';
  document.getElementById('mStatus').value = 'Jipya';
  document.getElementById('mTarehe').value = tareheLeo();
  document.getElementById('editModal').classList.add('open');
}

function funguaModalEdit(id) {
  // Tafuta ombi kwa id yake (Supabase inatumia nambari za kawaida: 1, 2, 3...)
  const ombi = allMaombi.find(m => m.id === id);
  if (!ombi) return;

  editingId = id;
  document.getElementById('modalTitle').textContent = 'Hariri Ombi — ' + ombi.jina;
  document.getElementById('mJina').value   = ombi.jina   || '';
  document.getElementById('mSimu').value   = ombi.simu   || '';
  document.getElementById('mEmail').value  = ombi.email  || '';
  document.getElementById('mHuduma').value = ombi.huduma || '';
  document.getElementById('mStatus').value = ombi.hali   || 'Jipya';
  document.getElementById('mTarehe').value = ombi.tarehe || tareheLeo();
  document.getElementById('mNotes').value  = ombi.notes  || '';
  document.getElementById('editModal').classList.add('open');
}

function fungaModal() {
  document.getElementById('editModal').classList.remove('open');
  editingId = null;
}


/* ================================================================
   SEHEMU 10: HIFADHI OMBI KWENYE SUPABASE
   ================================================================
   Hii ndiyo mabadiliko makuu:
   - ZAMANI: allMaombi.push(ombi) + localStorage.setItem(...)
   - MPYA:   await db.insert(ombi) au await db.update(id, ombi)
*/

async function hifadhiOmbi() {
  const jina   = document.getElementById('mJina').value.trim();
  const simu   = document.getElementById('mSimu').value.trim();
  const huduma = document.getElementById('mHuduma').value;

  // Validation
  if (!jina)   { onyeshaToast('Tafadhali jaza jina la mteja!', 'error'); return; }
  if (!simu)   { onyeshaToast('Tafadhali jaza nambari ya simu!', 'error'); return; }
  if (!huduma) { onyeshaToast('Tafadhali chagua huduma!', 'error'); return; }

  // Tengeneza object ya ombi
  const ombiData = {
    jina,
    simu,
    email:  document.getElementById('mEmail').value.trim(),
    huduma,
    hali:   document.getElementById('mStatus').value,
    tarehe: document.getElementById('mTarehe').value || tareheLeo(),
    notes:  document.getElementById('mNotes').value.trim()
  };

  // Badilisha kitufe - onyesha inapohifadhi
  const btnSave = document.querySelector('.btn-save');
  if (btnSave) {
    btnSave.textContent = 'Inahifadhi... ⏳';
    btnSave.disabled = true;
  }

  let error;

  if (editingId) {
    // HARIRI - tumia db.update()
    // editingId = id ya rekodi kwenye Supabase
    const result = await db.update(editingId, ombiData);
    error = result.error;
    if (!error) onyeshaToast('Ombi la ' + jina + ' limeharirishwa!');
  } else {
    // ONGEZA MPYA - tumia db.insert()
    const result = await db.insert(ombiData);
    error = result.error;
    if (!error) onyeshaToast('Ombi la ' + jina + ' limeongezwa!');
  }

  // Rudisha kitufe
  if (btnSave) {
    btnSave.textContent = 'Hifadhi Ombi';
    btnSave.disabled = false;
  }

  if (error) {
    console.error('Kosa la Supabase:', error);
    onyeshaToast('Kosa! Ombi halikuhifadhiwa. Jaribu tena.', 'error');
    return;
  }

  // Pakia upya data kutoka Supabase
  await paikiDataSupabase();
  if (currentPage === 'maombi') filterMaombi();
  fungaModal();
}


/* ================================================================
   SEHEMU 11: FUTA OMBI KUTOKA SUPABASE
   ================================================================ */

async function funaOmbi(id) {
  const ombi = allMaombi.find(m => m.id === id);
  if (!ombi) return;
  if (!confirm('Futa ombi la ' + ombi.jina + '?\nHatua hii haiwezi kurejeshwa!')) return;

  // Tuma delete request kwenye Supabase
  const { error } = await db.delete(id);

  if (error) {
    console.error('Kosa la kufuta:', error);
    onyeshaToast('Kosa la kufuta! Jaribu tena.', 'error');
    return;
  }

  onyeshaToast('Ombi limefutwa.', 'error');

  // Ondoa kutoka memory na sasisha UI
  allMaombi = allMaombi.filter(m => m.id !== id);
  sasishaDashboard();
  if (currentPage === 'maombi') filterMaombi();
  if (currentPage === 'ripoti') renderRipoti();
}


/* ================================================================
   SEHEMU 12: WHATSAPP
   ================================================================ */

function tumaWhatsApp() {
  const jina   = document.getElementById('mJina').value  || '—';
  const simu   = document.getElementById('mSimu').value.replace(/\s/g, '');
  const huduma = document.getElementById('mHuduma').value || '—';
  const hali   = document.getElementById('mStatus').value || 'Jipya';

  if (!simu) { onyeshaToast('Jaza nambari ya simu kwanza!', 'error'); return; }

  const emoji = {
    'Jipya':'🔵','Inaendelea':'🟡','Imekamilika':'✅',
    'Inahitaji Nyaraka':'🟣','Imebatilishwa':'❌'
  };

  const ujumbe =
`Habari ${jina}! 👋

Hii ni TINKEBELL SOLUTION.

📋 *Huduma yako:* ${huduma}
${emoji[hali]||'🔵'} *Hali ya Ombi:* ${hali}

${hali==='Inahitaji Nyaraka'?'⚠️ Ombi lako linahitaji nyaraka zaidi. Tafadhali wasiliana nasi haraka.\n':''}${hali==='Imekamilika'?'🎉 Hongera! Hati yako iko tayari. Wasiliana nasi ili kupokea.\n':''}${hali==='Inaendelea'?'⚙️ Ombi lako linashughulikiwa. Tutakujulisha hivi karibuni.\n':''}
Kwa maswali zaidi piga simu au tuma WhatsApp.

*TINKEBELL SOLUTION* 🔔
_Huduma za Serikali — Haraka, Salama, Rahisi_`;

  let waSimu = simu;
  if (simu.startsWith('+'))  waSimu = simu.slice(1);
  else if (simu.startsWith('0')) waSimu = '255' + simu.slice(1);

  window.open('https://wa.me/' + waSimu + '?text=' + encodeURIComponent(ujumbe), '_blank');
}

function tumaWhatsAppDirect(id) {
  const ombi = allMaombi.find(m => m.id === id);
  if (!ombi) return;
  document.getElementById('mJina').value   = ombi.jina;
  document.getElementById('mSimu').value   = ombi.simu;
  document.getElementById('mHuduma').value = ombi.huduma;
  document.getElementById('mStatus').value = ombi.hali;
  tumaWhatsApp();
}


/* ================================================================
   SEHEMU 13: EXPORT CSV
   ================================================================ */

function exportCSV() {
  if (!allMaombi.length) { onyeshaToast('Hakuna data ya kuexport!', 'error'); return; }

  const headers = ['ID','Jina','Simu','Email','Huduma','Hali','Tarehe','Notes'];
  const rows = allMaombi.map(m => [
    m.id, m.jina, m.simu, m.email||'',
    m.huduma, m.hali, m.tarehe, (m.notes||'').replace(/\n/g,' ')
  ]);

  const csv = [headers, ...rows]
    .map(r => r.map(c => '"' + String(c||'').replace(/"/g,'""') + '"').join(','))
    .join('\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = 'tinkebell_maombi_' + tareheLeo() + '.csv';
  a.click();
  URL.revokeObjectURL(url);
  onyeshaToast('CSV imepakuliwa! Fungua na Excel.');
}


/* ================================================================
   SEHEMU 14: RIPOTI
   ================================================================ */

function renderRipoti() {
  const hudumaCounts = {};
  allMaombi.forEach(m => {
    hudumaCounts[m.huduma] = (hudumaCounts[m.huduma] || 0) + 1;
  });
  const maxH    = Math.max(...Object.values(hudumaCounts), 1);
  const colors  = ['#3B82F6','#10B981','#F59E0B','#8B5CF6','#EF4444','#06B6D4'];

  const serviceChartEl = document.getElementById('serviceChart');
  serviceChartEl.innerHTML = Object.entries(hudumaCounts).length
    ? Object.entries(hudumaCounts)
        .sort((a,b) => b[1]-a[1])
        .map(([h,n],i) => `
          <div class="bar-item">
            <div class="bar-label">${escHtml(h)}</div>
            <div class="bar-track">
              <div class="bar-fill" style="width:${Math.round(n/maxH*100)}%;background:${colors[i%colors.length]}"></div>
            </div>
            <div class="bar-count" style="color:${colors[i%colors.length]}">${n}</div>
          </div>`).join('')
    : '<p style="color:var(--text2);font-size:.85rem;">Hakuna data bado.</p>';

  const haliOrder = [
    {k:'Jipya',c:'#3B82F6'},{k:'Inaendelea',c:'#F59E0B'},
    {k:'Imekamilika',c:'#10B981'},{k:'Inahitaji Nyaraka',c:'#8B5CF6'},
    {k:'Imebatilishwa',c:'#EF4444'}
  ];

  document.getElementById('statusChart').innerHTML = `
    <div class="donut-wrap"><div>
      ${haliOrder.map(({k,c}) => {
        const n = allMaombi.filter(m => m.hali===k).length;
        return `<div class="legend-item">
          <div class="legend-dot" style="background:${c}"></div>
          <span style="color:var(--text2)">${k}</span>
          <strong style="margin-left:auto;padding-left:.5rem">${n}</strong>
        </div>`;
      }).join('')}
    </div></div>`;

  const doneCount = allMaombi.filter(m => m.hali==='Imekamilika').length;
  document.getElementById('summaryStats').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
      ${[
        ['Jumla','#3B82F6',allMaombi.length],
        ['Imekamilika','#10B981',doneCount],
        ['Yanayoendelea','#F59E0B',allMaombi.filter(m=>m.hali==='Inaendelea').length],
        ['Mafanikio','#10B981', allMaombi.length ? Math.round(doneCount/allMaombi.length*100)+'%':'—']
      ].map(([l,c,v]) => `
        <div style="background:var(--bg);border-radius:10px;padding:1rem;text-align:center;">
          <div style="font-family:'Syne',sans-serif;font-size:1.6rem;font-weight:800;color:${c}">${v}</div>
          <div style="font-size:.75rem;color:var(--text2);margin-top:.2rem">${l}</div>
        </div>`).join('')}
    </div>`;

  const recent = allMaombi.slice(0, 10);
  const emojiH = {'Jipya':'🔵','Inaendelea':'🟡','Imekamilika':'✅','Inahitaji Nyaraka':'🟣','Imebatilishwa':'❌'};
  document.getElementById('activityLog').innerHTML = recent.length
    ? recent.map(m => `
        <div style="display:flex;gap:.8rem;padding:.6rem 0;border-bottom:1px solid var(--border);font-size:.82rem;">
          <span>${emojiH[m.hali]||'📋'}</span>
          <div>
            <strong>${escHtml(m.jina)}</strong>
            <span style="color:var(--text2)"> — ${escHtml(m.huduma)}</span>
            <div style="color:var(--text2);margin-top:.1rem">${fomatiTarehe(m.tarehe)}</div>
          </div>
        </div>`).join('')
    : '<p style="color:var(--text2);font-size:.85rem;">Hakuna shughuli bado.</p>';
}

function printRipoti() { window.print(); }


/* ================================================================
   SEHEMU 15: BADILISHA NYWILA
   ================================================================ */

function badilishaNywila() {
  const old     = document.getElementById('oldPass').value;
  const newP    = document.getElementById('newPass').value;
  const confirm = document.getElementById('confirmPass').value;
  const current = localStorage.getItem(PASS_KEY) || ADMIN_CREDS.pass;

  if (old !== current)  { onyeshaToast('Nywila ya sasa si sahihi!', 'error'); return; }
  if (newP.length < 6)  { onyeshaToast('Nywila mpya iwe na herufi angalau 6!', 'error'); return; }
  if (newP !== confirm)  { onyeshaToast('Nywila mpya hazifanani!', 'error'); return; }

  localStorage.setItem(PASS_KEY, newP);
  ['oldPass','newPass','confirmPass'].forEach(id => document.getElementById(id).value='');
  onyeshaToast('Nywila imebadilishwa!');
}

function futaDataYote() {
  onyeshaToast('Kwa usalama, futa data moja kwa moja kwenye Supabase Table Editor.', 'error');
}



/* ================================================================
   FORGOT PASSWORD - Kubadilisha nywila bila kujua ya zamani
   Inafanya kazi kwa sababu mtumiaji yuko kwenye device yake mwenyewe
   ================================================================ */

/*
  funguaForgotPassword() - Fungua modal ya kubadilisha nywila
  Inaitwa onclick ya "Umesahau nywila?" link
*/
function funguaForgotPassword() {
  // Futa fields za zamani
  document.getElementById('forgotNewPass').value     = '';
  document.getElementById('forgotConfirmPass').value = '';

  // Ficha ujumbe wa kosa/mafanikio
  document.getElementById('forgotError').style.display   = 'none';
  document.getElementById('forgotSuccess').style.display = 'none';

  // Onyesha modal
  document.getElementById('forgotModal').classList.add('open');
}

/*
  fungaForgotModal() - Funga modal ya forgot password
*/
function fungaForgotModal() {
  document.getElementById('forgotModal').classList.remove('open');
}

/*
  hifadhiNywilaMpya() - Hifadhi nywila mpya
  Haihitaji nywila ya zamani - ni "reset" kamili
*/
function hifadhiNywilaMpya() {
  const newPass     = document.getElementById('forgotNewPass').value;
  const confirmPass = document.getElementById('forgotConfirmPass').value;
  const errorEl     = document.getElementById('forgotError');
  const successEl   = document.getElementById('forgotSuccess');

  // Ficha ujumbe wa zamani
  errorEl.style.display   = 'none';
  successEl.style.display = 'none';

  // Validation
  if (newPass.length < 6) {
    errorEl.textContent    = '⚠️ Nywila iwe na herufi angalau 6!';
    errorEl.style.display  = 'block';
    return;
  }

  if (newPass !== confirmPass) {
    errorEl.textContent    = '⚠️ Nywila mbili hazifanani!';
    errorEl.style.display  = 'block';
    return;
  }

  // Hifadhi nywila mpya kwenye localStorage
  localStorage.setItem(PASS_KEY, newPass);

  // Onyesha mafanikio
  successEl.style.display = 'block';

  // Funga modal baada ya sekunde 2
  setTimeout(function() {
    fungaForgotModal();
    // Weka focus kwenye password field ya login
    document.getElementById('loginPass').focus();
    onyeshaToast && onyeshaToast('Nywila imebadilishwa! Ingia sasa.', 'success');
  }, 2000);
}

/* ================================================================
   SEHEMU 16: INIT
   ================================================================ */

document.addEventListener('DOMContentLoaded', function() {
  onyeshaDateDisplay();

  // Login kwa Enter key
  const passInput = document.getElementById('loginPass');
  if (passInput) {
    passInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') fanyaLogin();
    });
  }

  // Funga modal ukibonyeza nje
  const overlay = document.getElementById('editModal');
  if (overlay) {
    overlay.addEventListener('click', function(e) {
      if (e.target === this) fungaModal();
    });
  }

  // Funga forgotModal ukibonyeza nje
  const forgotOverlay = document.getElementById('forgotModal');
  if (forgotOverlay) {
    forgotOverlay.addEventListener('click', function(e) {
      if (e.target === this) fungaForgotModal();
    });
  }
});