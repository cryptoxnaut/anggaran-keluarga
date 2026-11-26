// DompetKeluarga — aplikasi: routing hash, ringkasan, transaksi, anggaran,
// tabungan, tagihan, dan laporan. Data awal dari data.js; perubahan pengguna
// disimpan di localStorage dan dipakai lagi saat dibuka kembali.

const STORE_KEY = 'dompetkeluarga-v1';

function loadState() {
  const base = {
    transactions: TRANSACTIONS.slice(),
    goals: GOALS.map((g) => ({ ...g })),
    bills: BILLS.map((b) => ({ ...b })),
    budgets: BUDGETS.map((b) => ({ ...b })),
  };
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return base;
    const saved = JSON.parse(raw);
    if (Array.isArray(saved.transactions) && saved.transactions.length) base.transactions = saved.transactions;
    if (Array.isArray(saved.goals) && saved.goals.length) base.goals = saved.goals;
    if (Array.isArray(saved.bills) && saved.bills.length) base.bills = saved.bills;
    if (Array.isArray(saved.budgets) && saved.budgets.length) base.budgets = saved.budgets;
  } catch (e) { /* penyimpanan tidak tersedia: pakai data awal */ }
  return base;
}

let state = loadState();

function saveState() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* abaikan */ }
}

function resetData() {
  try { localStorage.removeItem(STORE_KEY); } catch (e) { /* abaikan */ }
  state = loadState();
  render();
}

function fmtRp(n) {
  return 'Rp' + Math.round(n).toLocaleString('id-ID');
}

function fmtDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function catOf(id) {
  return CATEGORIES.find((c) => c.id === id)
    || INCOME_SOURCES.find((s) => s.id === id)
    || { label: id, color: '#8d99ae', icon: '•' };
}

function monthIncome() {
  return state.transactions.filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);
}

function monthExpense() {
  return state.transactions.filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0);
}

function spentByCategory() {
  const out = {};
  for (const c of CATEGORIES) out[c.id] = 0;
  for (const t of state.transactions) {
    if (t.type === 'expense' && out[t.category] !== undefined) out[t.category] += t.amount;
  }
  return out;
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ---------- Perute ----------

function currentRoute() {
  const hash = location.hash.replace(/^#\/?/, '');
  return hash.split('/')[0] || '';
}

function setActiveNav(route) {
  document.querySelectorAll('.mainnav a').forEach((a) => {
    a.classList.toggle('active', a.dataset.route === route);
  });
}

function render() {
  const route = currentRoute();
  setActiveNav(route);
  const app = document.getElementById('app');
  if (route === '') app.innerHTML = viewDashboard();
  else if (route === 'transaksi') app.innerHTML = viewTransactions();
  else if (route === 'anggaran') app.innerHTML = viewBudgets();
  else if (route === 'tabungan') app.innerHTML = viewGoals();
  else if (route === 'tagihan') app.innerHTML = viewBills();
  else if (route === 'laporan') app.innerHTML = viewReports();
  else app.innerHTML = viewNotFound();
  afterRender(route);
}

function afterRender(route) {
  if (route === '') drawDashboardCharts();
  if (route === 'laporan') drawReportCharts(document.getElementById('report-month').value);
  bindRoute(route);
}

// ---------- Dasbor ----------

function viewDashboard() {
  const income = monthIncome(), expense = monthExpense(), rest = income - expense;
  const rate = income > 0 ? Math.round((rest / income) * 100) : 0;
  const unpaid = state.bills.filter((b) => !b.paid);
  const unpaidTotal = unpaid.reduce((s, b) => s + b.amount, 0);
  const recent = state.transactions.slice(0, 5);
  return `
  <h1>Dasbor Anggaran — ${esc(HOUSEHOLD.month)}</h1>
  <p class="lede">Ringkasan keuangan ${esc(HOUSEHOLD.name)} (${HOUSEHOLD.members} anggota keluarga).
  Pemasukan bulan ini ${fmtRp(income)}, pengeluaran ${fmtRp(expense)} — sisa ${fmtRp(rest)} untuk ditabung.</p>

  <div class="grid4" style="margin-bottom:18px">
    <div class="stat"><div class="label">Pemasukan</div><div class="value pos">${fmtRp(income)}</div><div class="sub">Gaji + usaha sampingan</div></div>
    <div class="stat"><div class="label">Pengeluaran</div><div class="value neg">${fmtRp(expense)}</div><div class="sub">${state.transactions.filter((t) => t.type === 'expense').length} transaksi tercatat</div></div>
    <div class="stat accent"><div class="label">Sisa untuk Ditabung</div><div class="value">${fmtRp(rest)}</div><div class="sub">Tingkat tabungan ${rate}% dari pemasukan</div></div>
    <div class="stat"><div class="label">Tagihan Belum Lunas</div><div class="value">${unpaid.length} tagihan</div><div class="sub">${fmtRp(unpaidTotal)} jatuh tempo bulan ini</div></div>
  </div>

  <div class="grid2">
    <section class="card">
      <h2>Pengeluaran per Kategori</h2>
      <canvas class="chart" id="chart-donut" aria-label="Diagram donat pengeluaran per kategori"></canvas>
      <div class="legend" id="donut-legend"></div>
      <p class="muted"><a href="#/anggaran">Lihat anggaran tiap kategori →</a></p>
    </section>
    <section class="card">
      <h2>Tren 6 Bulan Terakhir</h2>
      <canvas class="chart" id="chart-trend" aria-label="Grafik batang pemasukan dan pengeluaran enam bulan"></canvas>
      <div class="legend"><span style="--c:#2a9d8f">Pemasukan</span><span style="--c:#e76f51">Pengeluaran</span></div>
      <p class="muted">Pengeluaran November lebih rendah dari bulan-bulan sebelumnya — belanja harian dan hiburan masih di bawah anggaran. <a href="#/laporan">Buka laporan →</a></p>
    </section>
  </div>

  <div class="grid2" style="margin-top:18px">
    <section class="card">
      <h2>Tagihan Berikutnya</h2>
      ${unpaid.length ? unpaid.map((b) => `
        <div class="progress-row"><span>${esc(b.name)} — jatuh tempo ${fmtDate(b.due)}</span><strong>${fmtRp(b.amount)}</strong></div>
      `).join('') : '<p class="muted">Semua tagihan bulan ini sudah lunas. 🎉</p>'}
      <p class="muted"><a href="#/tagihan">Kelola semua tagihan →</a></p>
    </section>
    <section class="card">
      <h2>Tabungan Terdekat ke Target</h2>
      ${state.goals.slice().sort((a, b) => (b.saved / b.target) - (a.saved / a.target)).slice(0, 2).map((g) => `
        <div class="progress-row"><span>${esc(g.name)}</span><span><strong>${Math.round((g.saved / g.target) * 100)}%</strong> · ${fmtRp(g.saved)} / ${fmtRp(g.target)}</span></div>
        <div class="bar"><span style="width:${Math.min(100, (g.saved / g.target) * 100)}%;background:${g.color}"></span></div>
      `).join('')}
      <p class="muted"><a href="#/tabungan">Lihat semua tujuan tabungan →</a></p>
    </section>
  </div>

  <section class="card">
    <h2>Transaksi Terakhir</h2>
    ${transactionTable(recent)}
    <p class="muted"><a href="#/transaksi">Lihat semua transaksi →</a></p>
  </section>`;
}

function drawDashboardCharts() {
  const spent = spentByCategory();
  const segs = CATEGORIES.map((c) => ({ label: c.label, value: spent[c.id], color: c.color }))
    .filter((s) => s.value > 0);
  const withPct = drawDonut(document.getElementById('chart-donut'), segs);
  document.getElementById('donut-legend').innerHTML = withPct.map((s) =>
    `<span style="--c:${s.color}">${esc(s.label)} · ${s.pct.toFixed(0)}%</span>`).join('');
  const months = liveMonthly();
  drawGroupedBars(document.getElementById('chart-trend'),
    months.map((m) => m.label),
    [
      { label: 'Pemasukan', color: '#2a9d8f', values: months.map((m) => m.income) },
      { label: 'Pengeluaran', color: '#e76f51', values: months.map((m) => m.expense) },
    ]);
}

// ---------- Transaksi ----------

function transactionTable(rows) {
  if (!rows.length) return '<p class="muted">Tidak ada transaksi yang cocok.</p>';
  return `<div class="table-wrap"><table>
    <thead><tr><th>Tanggal</th><th>Keterangan</th><th>Kategori</th><th class="num">Jumlah</th><th></th></tr></thead>
    <tbody>${rows.map((t) => {
      const c = catOf(t.category);
      return `<tr>
        <td>${fmtDate(t.date)}</td>
        <td>${esc(t.desc)}</td>
        <td><span class="cat-icon">${c.icon || ''}</span>${esc(c.label)}</td>
        <td class="num ${t.type === 'income' ? 'pos' : 'neg'}">${t.type === 'income' ? '+' : '−'} ${fmtRp(t.amount)}</td>
        <td><button class="danger" data-del="${t.id}" type="button">Hapus</button></td>
      </tr>`;
    }).join('')}</tbody></table></div>`;
}

function viewTransactions() {
  const q = (window._txFilter || {}).q || '';
  const type = (window._txFilter || {}).type || 'all';
  const cat = (window._txFilter || {}).cat || 'all';
  let rows = state.transactions.slice().sort((a, b) => b.date.localeCompare(a.date));
  if (type !== 'all') rows = rows.filter((t) => t.type === type);
  if (cat !== 'all') rows = rows.filter((t) => t.category === cat);
  if (q) rows = rows.filter((t) => t.desc.toLowerCase().includes(q.toLowerCase()));
  const inc = rows.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const exp = rows.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  return `
  <h1>Pemasukan &amp; Pengeluaran</h1>
  <p class="lede">Semua uang masuk dan keluar ${esc(HOUSEHOLD.name)} bulan ${esc(HOUSEHOLD.month)}.
  Tambah transaksi baru, cari, atau saring per kategori — jumlah di bawah ikut berubah.</p>

  <section class="card">
    <h2>Tambah Transaksi</h2>
    <form class="inline-form" id="tx-form">
      <label>Keterangan <input name="desc" required maxlength="80" placeholder="cth. Belanja sayur pasar" size="26"></label>
      <label>Jumlah (Rp) <input name="amount" type="number" min="1000" step="500" required placeholder="150000"></label>
      <label>Jenis <select name="type"><option value="expense">Pengeluaran</option><option value="income">Pemasukan</option></select></label>
      <label>Kategori <select name="category">
        ${CATEGORIES.map((c) => `<option value="${c.id}">${c.label}</option>`).join('')}
        ${INCOME_SOURCES.map((s) => `<option value="${s.id}">${s.label}</option>`).join('')}
      </select></label>
      <label>Tanggal <input name="date" type="date" value="2026-11-26" required></label>
      <button type="submit">Tambah</button>
    </form>
    <p class="muted" id="tx-msg">Transaksi baru langsung masuk ke daftar dan mengubah total di bawah.</p>
  </section>

  <section class="card">
    <h2>Daftar Transaksi <span class="muted">(${rows.length} dari ${state.transactions.length})</span></h2>
    <div class="toolbar">
      <input id="tx-search" type="search" placeholder="Cari keterangan…" value="${esc(q)}" aria-label="Cari transaksi">
      <select id="tx-type" aria-label="Saring jenis">
        <option value="all" ${type === 'all' ? 'selected' : ''}>Semua jenis</option>
        <option value="income" ${type === 'income' ? 'selected' : ''}>Pemasukan</option>
        <option value="expense" ${type === 'expense' ? 'selected' : ''}>Pengeluaran</option>
      </select>
      <select id="tx-cat" aria-label="Saring kategori">
        <option value="all">Semua kategori</option>
        ${CATEGORIES.map((c) => `<option value="${c.id}" ${cat === c.id ? 'selected' : ''}>${c.label}</option>`).join('')}
        ${INCOME_SOURCES.map((s) => `<option value="${s.id}" ${cat === s.id ? 'selected' : ''}>${s.label}</option>`).join('')}
      </select>
    </div>
    ${transactionTable(rows)}
    <p style="margin-top:12px">Total tampil: <span class="pos money">+ ${fmtRp(inc)}</span> &nbsp;·&nbsp;
    <span class="neg money">− ${fmtRp(exp)}</span> &nbsp;·&nbsp; Selisih: <strong class="money">${fmtRp(inc - exp)}</strong></p>
    <p><button class="ghost small" id="tx-reset" type="button">Kembalikan data contoh</button></p>
  </section>`;
}

// ---------- Anggaran ----------

function viewBudgets() {
  const spent = spentByCategory();
  const totalBudget = state.budgets.reduce((s, b) => s + b.budget, 0);
  const totalSpent = CATEGORIES.reduce((s, c) => s + spent[c.id], 0);
  return `
  <h1>Anggaran per Kategori</h1>
  <p class="lede">Batas belanja tiap kategori untuk ${esc(HOUSEHOLD.month)}. Total anggaran
  <strong>${fmtRp(totalBudget)}</strong>, sudah terpakai <strong>${fmtRp(totalSpent)}</strong>
  (${Math.round((totalSpent / totalBudget) * 100)}%) — masih ada sisa <strong class="pos">${fmtRp(totalBudget - totalSpent)}</strong>.</p>
  ${totalSpent > totalBudget ? '<div class="notice">Total pengeluaran sudah melewati anggaran bulan ini. Cek kategori yang berwarna merah di bawah.</div>' : '<div class="notice ok">Pengeluaran bulan ini masih di dalam anggaran. Pertahankan sampai akhir bulan.</div>'}

  <div class="grid2">
  ${CATEGORIES.map((c) => {
    const b = state.budgets.find((x) => x.category === c.id) || { budget: 0 };
    const used = spent[c.id];
    const pct = b.budget > 0 ? Math.round((used / b.budget) * 100) : 0;
    const left = b.budget - used;
    const cls = pct > 100 ? 'over' : pct >= 80 ? 'warn' : '';
    const status = pct > 100 ? '<span class="pill over">Melewati batas</span>' : pct >= 80 ? '<span class="pill due">Hampir habis</span>' : '<span class="pill paid">Aman</span>';
    return `<section class="card">
      <div class="goal-head"><strong><span class="cat-icon">${c.icon}</span>${esc(c.label)}</strong>${status}</div>
      <div class="progress-row"><span>Terpakai <strong>${fmtRp(used)}</strong> dari ${fmtRp(b.budget)}</span><span>${pct}%</span></div>
      <div class="bar"><span class="${cls}" style="width:${Math.min(100, pct)}%"></span></div>
      <p class="muted">${left >= 0 ? 'Sisa ' + fmtRp(left) : 'Lebih ' + fmtRp(-left) + ' dari anggaran'} · ${esc(c.label)} bulan ini.</p>
      <form class="inline-form budget-form" data-cat="${c.id}">
        <label>Ubah anggaran (Rp) <input name="budget" type="number" min="0" step="50000" value="${b.budget}" required></label>
        <button class="small" type="submit">Simpan</button>
      </form>
    </section>`;
  }).join('')}
  </div>

  <section class="card">
    <h2>Sumber Pemasukan Bulan Ini</h2>
    <div class="table-wrap"><table><thead><tr><th>Sumber</th><th>Catatan</th><th class="num">Perkiraan</th></tr></thead><tbody>
    ${INCOME_SOURCES.map((s) => `<tr><td>${esc(s.label)}</td><td class="muted">${esc(s.note)}</td><td class="num money">${fmtRp(s.amount)}</td></tr>`).join('')}
    <tr><td><strong>Total perkiraan</strong></td><td></td><td class="num money"><strong>${fmtRp(INCOME_SOURCES.reduce((s, x) => s + x.amount, 0))}</strong></td></tr>
    </tbody></table></div>
    <p class="muted">Perkiraan dihitung dari gaji tetap ditambah usaha sampingan. Yang sudah masuk tercatat di halaman transaksi.</p>
  </section>`;
}

// ---------- Tabungan ----------

function viewGoals() {
  const totalTarget = state.goals.reduce((s, g) => s + g.target, 0);
  const totalSaved = state.goals.reduce((s, g) => s + g.saved, 0);
  return `
  <h1>Tujuan Tabungan</h1>
  <p class="lede">Total terkumpul <strong>${fmtRp(totalSaved)}</strong> dari target
  <strong>${fmtRp(totalTarget)}</strong> (${Math.round((totalSaved / totalTarget) * 100)}%).
  Tambah dana kapan pun ada sisa anggaran — progres di bawah langsung bergerak.</p>

  <div class="grid2">
  ${state.goals.map((g) => {
    const pct = Math.round((g.saved / g.target) * 100);
    return `<section class="card">
      <div class="goal-head"><strong>${esc(g.name)}</strong><span class="pill ${pct >= 100 ? 'paid' : 'due'}">${pct}% tercapai</span></div>
      <p class="muted">${esc(g.note)}</p>
      <div class="progress-row"><span><strong>${fmtRp(g.saved)}</strong> dari ${fmtRp(g.target)}</span><span>Sisa ${fmtRp(Math.max(0, g.target - g.saved))}</span></div>
      <div class="bar"><span style="width:${Math.min(100, pct)}%;background:${g.color}"></span></div>
      <form class="inline-form goal-form" data-goal="${g.id}" style="margin-top:12px">
        <label>Tambah dana (Rp) <input name="amount" type="number" min="10000" step="10000" value="100000" required></label>
        <button class="small" type="submit">Tambah ke Tabungan</button>
      </form>
    </section>`;
  }).join('')}
  </div>

  <section class="card">
    <h2>Buat Tujuan Baru</h2>
    <form class="inline-form" id="goal-new-form">
      <label>Nama tujuan <input name="name" required maxlength="40" placeholder="cth. Renovasi dapur" size="24"></label>
      <label>Target (Rp) <input name="target" type="number" min="100000" step="100000" required placeholder="5000000"></label>
      <label>Tabungan awal (Rp) <input name="saved" type="number" min="0" step="100000" value="0" required></label>
      <button type="submit">Buat Tujuan</button>
    </form>
  </section>`;
}

// ---------- Tagihan ----------

function viewBills() {
  const total = state.bills.reduce((s, b) => s + b.amount, 0);
  const paid = state.bills.filter((b) => b.paid).reduce((s, b) => s + b.amount, 0);
  const unpaid = state.bills.filter((b) => !b.paid);
  const sorted = state.bills.slice().sort((a, b) => a.due.localeCompare(b.due));
  return `
  <h1>Tagihan &amp; Pembayaran Rutin</h1>
  <p class="lede">Total tagihan bulan ini <strong>${fmtRp(total)}</strong>:
  sudah dibayar <strong class="pos">${fmtRp(paid)}</strong>, masih menunggu
  <strong class="neg">${fmtRp(total - paid)}</strong> (${unpaid.length} tagihan).</p>
  ${unpaid.length ? `<div class="notice">Segera dibayar: <strong>${esc(unpaid[0].name)}</strong> ${fmtRp(unpaid[0].amount)} jatuh tempo ${fmtDate(unpaid[0].due)}.</div>` : '<div class="notice ok">Semua tagihan bulan ini sudah lunas.</div>'}

  <section class="card">
    <h2>Daftar Tagihan — ${esc(HOUSEHOLD.month)}</h2>
    <div class="table-wrap"><table><thead><tr><th>Tagihan</th><th class="hide-sm">Catatan</th><th>Jatuh Tempo</th><th class="num">Jumlah</th><th>Status</th><th></th></tr></thead><tbody>
    ${sorted.map((b) => `<tr>
      <td><strong>${esc(b.name)}</strong></td>
      <td class="muted hide-sm">${esc(b.note)}</td>
      <td>${fmtDate(b.due)}</td>
      <td class="num money">${fmtRp(b.amount)}</td>
      <td>${b.paid ? '<span class="pill paid">Lunas</span>' : '<span class="pill due">Belum lunas</span>'}</td>
      <td><button class="small ${b.paid ? 'ghost' : ''}" data-bill="${b.id}" type="button">${b.paid ? 'Batalkan' : 'Tandai Lunas'}</button></td>
    </tr>`).join('')}
    </tbody></table></div>
  </section>

  <section class="card">
    <h2>Tambah Tagihan</h2>
    <form class="inline-form" id="bill-form">
      <label>Nama tagihan <input name="name" required maxlength="40" placeholder="cth. Iuran sampah" size="22"></label>
      <label>Jumlah (Rp) <input name="amount" type="number" min="1000" step="1000" required placeholder="50000"></label>
      <label>Jatuh tempo <input name="due" type="date" value="2026-11-30" required></label>
      <button type="submit">Tambah Tagihan</button>
    </form>
  </section>`;
}

// ---------- Laporan ----------

function liveMonthly() {
  return MONTHLY.map((m) => m.key === '2026-11'
    ? { ...m, income: monthIncome(), expense: monthExpense() }
    : m);
}

function monthData(key) {
  if (key === '2026-11') {
    return { income: monthIncome(), expense: monthExpense(), byCat: spentByCategory() };
  }
  const m = MONTHLY.find((x) => x.key === key);
  return { income: m.income, expense: m.expense, byCat: MONTHLY_BY_CATEGORY[key] || {} };
}

function viewReports() {
  const sel = (window._reportMonth || '2026-11');
  const d = monthData(sel);
  const m = MONTHLY.find((x) => x.key === sel);
  const saved = d.income - d.expense;
  const rate = d.income > 0 ? Math.round((saved / d.income) * 100) : 0;
  const topCat = CATEGORIES.map((c) => ({ ...c, v: d.byCat[c.id] || 0 }))
    .sort((a, b) => b.v - a.v)[0];
  const biggest = state.transactions.filter((t) => t.type === 'expense')
    .slice().sort((a, b) => b.amount - a.amount)[0];
  return `
  <h1>Laporan Bulanan</h1>
  <p class="lede">Perbandingan pemasukan dan pengeluaran enam bulan terakhir, rincian per kategori,
  dan tingkat tabungan. Pilih bulan untuk melihat rinciannya.</p>

  <section class="card">
    <div class="toolbar">
      <label style="font-weight:700">Bulan
        <select id="report-month">
          ${MONTHLY.map((x) => `<option value="${x.key}" ${x.key === sel ? 'selected' : ''}>${x.label}</option>`).join('')}
        </select>
      </label>
    </div>
    <h2>${m.label}: Pemasukan vs Pengeluaran (6 bulan)</h2>
    <canvas class="chart" id="chart-report-bars" aria-label="Grafik batang pemasukan dan pengeluaran"></canvas>
    <div class="legend"><span style="--c:#2a9d8f">Pemasukan</span><span style="--c:#e76f51">Pengeluaran</span></div>
  </section>

  <div class="grid2">
    <section class="card">
      <h2>Rincian ${m.label}</h2>
      <div class="grid3" style="margin-bottom:12px">
        <div><div class="label muted small">Pemasukan</div><div class="money pos">${fmtRp(d.income)}</div></div>
        <div><div class="label muted small">Pengeluaran</div><div class="money neg">${fmtRp(d.expense)}</div></div>
        <div><div class="label muted small">Tingkat Tabungan</div><div class="money">${rate}%</div></div>
      </div>
      <canvas class="chart" id="chart-report-cats" aria-label="Grafik batang pengeluaran per kategori"></canvas>
    </section>
    <section class="card">
      <h2>Yang Bisa Dipetik dari ${m.label}</h2>
      <ul class="tip-list">
        <li>Kategori terbesar: <strong>${esc(topCat.label)}</strong> — ${fmtRp(topCat.v)} (${Math.round((topCat.v / Math.max(1, d.expense)) * 100)}% dari pengeluaran).</li>
        <li>Tingkat tabungan ${rate}% — ${rate >= 20 ? 'di atas patokan sehat 20%. Pertahankan.' : rate >= 10 ? 'di bawah patokan sehat 20%. Coba potong kategori hiburan bulan depan.' : 'sangat rendah. Tinjau lagi anggaran belanja dan hiburan.'}</li>
        ${sel === '2026-11' && biggest ? `<li>Pengeluaran tunggal terbesar: <strong>${esc(biggest.desc)}</strong> ${fmtRp(biggest.amount)} (${fmtDate(biggest.date)}).</li>` : ''}
        <li>Sisa bulan ini ${fmtRp(saved)} — ${saved > 0 ? 'alihkan ke Dana Darurat agar target tercapai lebih cepat.' : 'bulan ini defisit; ambil dari dana cadangan secukupnya.'}</li>
        <li>Pengeluaran rata-rata 6 bulan: <strong>${fmtRp(Math.round(MONTHLY.reduce((s, x) => s + x.expense, 0) / MONTHLY.length))}</strong> per bulan.</li>
      </ul>
      <p class="muted"><a href="#/anggaran">Sesuaikan anggaran bulan depan →</a></p>
    </section>
  </div>`;
}

function drawReportCharts(monthKey) {
  const months = liveMonthly();
  drawGroupedBars(document.getElementById('chart-report-bars'),
    months.map((m) => m.label),
    [
      { label: 'Pemasukan', color: '#2a9d8f', values: months.map((m) => m.income) },
      { label: 'Pengeluaran', color: '#e76f51', values: months.map((m) => m.expense) },
    ]);
  const d = monthData(monthKey);
  const rows = CATEGORIES.map((c) => ({
    label: c.label, value: d.byCat[c.id] || 0, color: c.color,
    max: monthKey === '2026-11'
      ? (state.budgets.find((b) => b.category === c.id) || { budget: 0 }).budget
      : d.byCat[c.id] || 0,
  }));
  drawCategoryBars(document.getElementById('chart-report-cats'), rows);
}

function viewNotFound() {
  return `
  <h1>Halaman Tidak Ditemukan</h1>
  <p class="lede">Tautan yang Anda buka tidak ada di DompetKeluarga. Coba salah satu halaman berikut:</p>
  <p><a href="#/">← Kembali ke Dasbor</a></p>`;
}

// ---------- Pengikatan kontrol ----------

function bindRoute(route) {
  if (route === 'transaksi') {
    document.getElementById('tx-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target;
      const amount = Number(f.amount.value);
      if (!f.desc.value.trim() || !(amount > 0)) return;
      state.transactions.unshift({
        id: 't' + Date.now(),
        date: f.date.value || '2026-11-26',
        desc: f.desc.value.trim(),
        category: f.category.value,
        type: f.type.value,
        amount,
      });
      saveState();
      document.getElementById('tx-msg').textContent = 'Ditambahkan: ' + f.desc.value.trim() + ' — ' + fmtRp(amount) + '.';
      render();
    });
    document.getElementById('tx-search').addEventListener('input', (e) => {
      window._txFilter = { ...(window._txFilter || {}), q: e.target.value };
      render();
      const s = document.getElementById('tx-search');
      s.focus(); s.setSelectionRange(s.value.length, s.value.length);
    });
    document.getElementById('tx-type').addEventListener('change', (e) => {
      window._txFilter = { ...(window._txFilter || {}), type: e.target.value };
      render();
    });
    document.getElementById('tx-cat').addEventListener('change', (e) => {
      window._txFilter = { ...(window._txFilter || {}), cat: e.target.value };
      render();
    });
    document.getElementById('tx-reset').addEventListener('click', resetData);
    document.querySelectorAll('[data-del]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.transactions = state.transactions.filter((t) => t.id !== btn.dataset.del);
        saveState();
        render();
      });
    });
  }
  if (route === 'anggaran') {
    document.querySelectorAll('.budget-form').forEach((form) => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const v = Number(form.budget.value);
        if (!(v >= 0)) return;
        const b = state.budgets.find((x) => x.category === form.dataset.cat);
        if (b) b.budget = v;
        saveState();
        render();
      });
    });
  }
  if (route === 'tabungan') {
    document.querySelectorAll('.goal-form').forEach((form) => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const v = Number(form.amount.value);
        if (!(v > 0)) return;
        const g = state.goals.find((x) => x.id === form.dataset.goal);
        if (g) g.saved += v;
        saveState();
        render();
      });
    });
    document.getElementById('goal-new-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target;
      const target = Number(f.target.value);
      if (!f.name.value.trim() || !(target > 0)) return;
      state.goals.push({
        id: 'g' + Date.now(),
        name: f.name.value.trim(),
        target,
        saved: Math.max(0, Number(f.saved.value) || 0),
        note: 'Tujuan baru — ditambahkan ' + fmtDate('2026-11-26'),
        color: '#0f766e',
      });
      saveState();
      render();
    });
  }
  if (route === 'tagihan') {
    document.querySelectorAll('[data-bill]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const b = state.bills.find((x) => x.id === btn.dataset.bill);
        if (b) b.paid = !b.paid;
        saveState();
        render();
      });
    });
    document.getElementById('bill-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.target;
      const amount = Number(f.amount.value);
      if (!f.name.value.trim() || !(amount > 0)) return;
      state.bills.push({
        id: 'b' + Date.now(),
        name: f.name.value.trim(),
        amount,
        due: f.due.value || '2026-11-30',
        paid: false,
        note: 'Tagihan baru',
      });
      saveState();
      render();
    });
  }
  if (route === 'laporan') {
    document.getElementById('report-month').addEventListener('change', (e) => {
      window._reportMonth = e.target.value;
      render();
    });
  }
}

window.addEventListener('hashchange', render);
render();
