/* ============================================================
   Codex — Library Management System
   ============================================================ */

const API      = 'http://127.0.0.1:5000/api';
const LOAN_DAYS = 14;

/* ---- Avatar colours ---- */
const AVATAR_COLORS = [
  ['#1a3a5c','#4a90d9'], ['#1a3324','#3ecf8e'],
  ['#3a1a1a','#f76e6e'], ['#2e2010','#f0a500'],
  ['#1e1a3a','#9b7fe8'], ['#0d2e2e','#2ec4b6'],
];

function getAvatarStyle(name) {
  let hash = 0;
  for (const c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  const [bg, fg] = AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  return { bg, fg };
}

function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  return parts.length === 1
    ? parts[0][0].toUpperCase()
    : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* ---- Navigation ---- */
const navItems   = document.querySelectorAll('.nav-item');
const pages      = document.querySelectorAll('.page');
const breadcrumb = document.getElementById('breadcrumb');
const menuToggle = document.getElementById('menu-toggle');
const sidebar    = document.querySelector('.sidebar');

const overlay = document.createElement('div');
overlay.className = 'sidebar-overlay';
document.body.appendChild(overlay);

function navigate(section) {
  navItems.forEach(n => n.classList.toggle('active', n.dataset.section === section));
  pages.forEach(p => p.classList.toggle('active', p.id === `page-${section}`));
  const names = {
    dashboard: 'Dashboard', books: 'Books',
    members: 'Members', borrowing: 'Borrow a Book', records: 'Borrow Records'
  };
  breadcrumb.textContent = names[section] || section;
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
}

navItems.forEach(item =>
  item.addEventListener('click', e => { e.preventDefault(); navigate(item.dataset.section); })
);

document.querySelectorAll('.quick-btn').forEach(btn =>
  btn.addEventListener('click', () => navigate(btn.dataset.goto))
);

menuToggle.addEventListener('click', () => {
  sidebar.classList.toggle('open');
  overlay.classList.toggle('show');
});

overlay.addEventListener('click', () => {
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
});

/* ---- Nav Badges ---- */
function updateNavBadges() {
  const bookBadge    = document.getElementById('nav-badge-books');
  const memberBadge  = document.getElementById('nav-badge-members');
  const overdueBadge = document.getElementById('nav-badge-overdue');

  bookBadge.textContent = allBooks.length;
  bookBadge.classList.toggle('visible', allBooks.length > 0);

  memberBadge.textContent = allUsers.length;
  memberBadge.classList.toggle('visible', allUsers.length > 0);

  const overdueCount = allBorrows.filter(b => !b.returned && isOverdue(b.borrow_date)).length;
  overdueBadge.textContent = overdueCount;
  overdueBadge.classList.toggle('visible', overdueCount > 0);
}

/* ---- Toasts ---- */
function showToast(title, msg = '', type = 'success') {
  const icons = {
    success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
    error:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    info:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${icons[type]}</div>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      ${msg ? `<div class="toast-msg">${msg}</div>` : ''}
    </div>`;
  document.getElementById('toast-container').appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-out');
    toast.addEventListener('animationend', () => toast.remove());
  }, 3500);
}

/* ---- Loading ---- */
const loadingOverlay = document.getElementById('loading-overlay');
function setLoading(val) { loadingOverlay.classList.toggle('hidden', !val); }

/* ---- Activity Log ---- */
const activityLog = [];

function logActivity(text, color = '#f0a500') {
  activityLog.unshift({
    text, color,
    time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })
  });
  if (activityLog.length > 8) activityLog.pop();
  renderActivity();
}

function renderActivity() {
  const list = document.getElementById('activity-list');
  if (!activityLog.length) {
    list.innerHTML = '<li class="activity-empty">No recent activity yet.</li>';
    return;
  }
  list.innerHTML = activityLog.map(a => `
    <li class="activity-item">
      <span class="activity-dot" style="background:${a.color}"></span>
      <span style="flex:1">${a.text}</span>
      <span style="font-size:0.75rem;color:var(--text-dim)">${a.time}</span>
    </li>`).join('');
}

/* ---- Overdue Helpers ---- */
function isOverdue(borrowDate) {
  if (!borrowDate) return false;
  const due = new Date(borrowDate);
  due.setDate(due.getDate() + LOAN_DAYS);
  return new Date() > due;
}

function dueDate(borrowDate) {
  if (!borrowDate) return null;
  const d = new Date(borrowDate);
  d.setDate(d.getDate() + LOAN_DAYS);
  return d;
}

/* ---- Form Validation ---- */
function setFieldError(inputEl, errorId, msg) {
  const err = document.getElementById(errorId);
  if (msg) {
    inputEl.classList.add('is-error');
    if (err) err.textContent = msg;
    return false;
  }
  inputEl.classList.remove('is-error');
  if (err) err.textContent = '';
  return true;
}

function clearErrors(...ids) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
}

/* ---- Return Modal ---- */
const returnModal  = document.getElementById('return-modal');
const modalMsg     = document.getElementById('modal-msg');
const modalCancel  = document.getElementById('modal-cancel');
const modalConfirm = document.getElementById('modal-confirm');
let pendingReturn  = null;

function openReturnModal(bookTitle, callback) {
  modalMsg.textContent = `Mark "${bookTitle}" as returned?`;
  returnModal.classList.remove('hidden');
  pendingReturn = callback;
}

modalCancel.addEventListener('click', () => {
  returnModal.classList.add('hidden');
  pendingReturn = null;
});

modalConfirm.addEventListener('click', async () => {
  returnModal.classList.add('hidden');
  if (pendingReturn) await pendingReturn();
  pendingReturn = null;
});

returnModal.addEventListener('click', e => {
  if (e.target === returnModal) {
    returnModal.classList.add('hidden');
    pendingReturn = null;
  }
});

/* ---- Export CSV ---- */
document.getElementById('btn-export-csv').addEventListener('click', () => {
  if (!allBorrows.length) {
    showToast('Nothing to export', 'No records available.', 'error');
    return;
  }
  const rows = [['Member','Book','Borrow Date','Due Date','Status']];
  allBorrows.forEach(b => {
    const due    = dueDate(b.borrow_date);
    const status = b.returned ? 'Returned' : isOverdue(b.borrow_date) ? 'Overdue' : 'Active';
    rows.push([
      b.user_name, b.book_title,
      formatDate(b.borrow_date),
      due ? formatDate(due.toISOString()) : '—',
      status,
    ]);
  });
  const csv  = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type:'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `Codex_records_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Exported', 'Records downloaded as CSV.', 'success');
});

/* ---- Due Date Preview ---- */
function updateDueDatePreview() {
  const due = new Date();
  due.setDate(due.getDate() + LOAN_DAYS);
  document.getElementById('due-date-text').textContent = formatDate(due.toISOString());
}

updateDueDatePreview();

/* ====================================================
   BOOKS
   ==================================================== */
let allBooks = [];

async function loadBooks() {
  try {
    const res = await fetch(`${API}/books/`);
    allBooks  = await res.json();
    renderBooks(allBooks);
    updateBorrowBookSelect(allBooks);
    updateDashboardStats();
    updateNavBadges();
  } catch {
    showToast('Connection Error', 'Could not load books.', 'error');
  }
}

function renderBooks(books) {
  const tbody = document.getElementById('book-list');
  const empty = document.getElementById('book-empty');
  const table = document.getElementById('book-table');
  tbody.innerHTML = '';
  if (!books || !books.length) {
    table.classList.add('hidden'); empty.classList.remove('hidden'); return;
  }
  table.classList.remove('hidden'); empty.classList.add('hidden');
  books.forEach(book => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escHtml(book.title)}</td>
      <td>${escHtml(book.author)}</td>
      <td style="font-family:monospace;font-size:0.8rem">${escHtml(book.isbn)}</td>
      <td><span class="badge ${book.available ? 'badge-green' : 'badge-red'}">${book.available ? 'Available' : 'On Loan'}</span></td>`;
    tbody.appendChild(tr);
  });
}

function updateBorrowBookSelect(books) {
  const sel = document.getElementById('borrow-book');
  sel.innerHTML = '<option value="" disabled selected>Select a book…</option>';
  books.filter(b => b.available).forEach(b => {
    const opt = document.createElement('option');
    opt.value = b.id;
    opt.textContent = `${b.title} — ${b.author}`;
    sel.appendChild(opt);
  });
}

document.getElementById('book-search').addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  renderBooks(allBooks.filter(b =>
    b.title.toLowerCase().includes(q) ||
    b.author.toLowerCase().includes(q) ||
    b.isbn.toLowerCase().includes(q)
  ));
});

document.getElementById('add-book-form').addEventListener('submit', async e => {
  e.preventDefault();
  const titleEl  = document.getElementById('title');
  const authorEl = document.getElementById('author');
  const isbnEl   = document.getElementById('isbn');
  clearErrors('err-title','err-author','err-isbn');
  let valid = true;
  if (!titleEl.value.trim())  valid = setFieldError(titleEl,  'err-title',  'Book title is required.') && valid;
  if (!authorEl.value.trim()) valid = setFieldError(authorEl, 'err-author', 'Author is required.')     && valid;
  if (!isbnEl.value.trim())   valid = setFieldError(isbnEl,   'err-isbn',   'ISBN is required.')       && valid;
  if (!valid) return;
  setLoading(true);
  try {
    await fetch(`${API}/books/`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ title:titleEl.value.trim(), author:authorEl.value.trim(), isbn:isbnEl.value.trim() }),
    });
    showToast('Book Added', `"${titleEl.value.trim()}" has been added.`, 'success');
    logActivity(`Added book: "${titleEl.value.trim()}"`, '#f0a500');
    e.target.reset();
    await loadBooks();
  } catch { showToast('Error', 'Failed to add book.', 'error'); }
  finally  { setLoading(false); }
});

/* ====================================================
   MEMBERS
   ==================================================== */
let allUsers = [];

async function loadUsers() {
  try {
    const res = await fetch(`${API}/users/`);
    allUsers  = await res.json();
    renderUsers(allUsers);
    updateBorrowUserSelect(allUsers);
    updateDashboardStats();
    updateNavBadges();
  } catch {
    showToast('Connection Error', 'Could not load members.', 'error');
  }
}

function renderUsers(users) {
  const tbody = document.getElementById('user-list');
  const empty = document.getElementById('member-empty');
  const table = document.getElementById('user-table');
  tbody.innerHTML = '';
  if (!users || !users.length) {
    table.classList.add('hidden'); empty.classList.remove('hidden'); return;
  }
  table.classList.remove('hidden'); empty.classList.add('hidden');
  users.forEach(user => {
    const { bg, fg } = getAvatarStyle(user.name);
    const initials   = getInitials(user.name);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="member-cell">
          <div class="member-avatar" style="background:${bg};color:${fg}">${initials}</div>
          <span class="member-name">${escHtml(user.name)}</span>
        </div>
      </td>
      <td style="color:var(--text-muted)">${escHtml(user.email)}</td>
      <td style="font-family:monospace;font-size:0.8rem;color:var(--text-dim)">#${user.id}</td>`;
    tbody.appendChild(tr);
  });
}

function updateBorrowUserSelect(users) {
  const sel = document.getElementById('borrow-user');
  sel.innerHTML = '<option value="" disabled selected>Select a member…</option>';
  users.forEach(u => {
    const opt = document.createElement('option');
    opt.value = u.id;
    opt.textContent = `${u.name} (${u.email})`;
    sel.appendChild(opt);
  });
}

document.getElementById('member-search').addEventListener('input', e => {
  const q = e.target.value.toLowerCase();
  renderUsers(allUsers.filter(u =>
    u.name.toLowerCase().includes(q) ||
    u.email.toLowerCase().includes(q)
  ));
});

document.getElementById('add-user-form').addEventListener('submit', async e => {
  e.preventDefault();
  const nameEl  = document.getElementById('user-name');
  const emailEl = document.getElementById('user-email');
  clearErrors('err-user-name','err-user-email');
  let valid = true;
  if (!nameEl.value.trim())  valid = setFieldError(nameEl,  'err-user-name',  'Full name is required.')     && valid;
  if (!emailEl.value.trim()) valid = setFieldError(emailEl, 'err-user-email', 'Email is required.')         && valid;
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim()))
    valid = setFieldError(emailEl, 'err-user-email', 'Please enter a valid email.') && valid;
  if (!valid) return;
  setLoading(true);
  try {
    await fetch(`${API}/users/`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ name:nameEl.value.trim(), email:emailEl.value.trim() }),
    });
    showToast('Member Added', `${nameEl.value.trim()} has been registered.`, 'success');
    logActivity(`New member: ${nameEl.value.trim()}`, '#4a90d9');
    e.target.reset();
    await loadUsers();
  } catch { showToast('Error', 'Failed to add member.', 'error'); }
  finally  { setLoading(false); }
});

/* ====================================================
   BORROW RECORDS
   ==================================================== */
let allBorrows    = [];
let currentFilter = 'all';

async function loadBorrowedBooks() {
  try {
    const res  = await fetch(`${API}/borrow/report`);
    allBorrows = await res.json();
    renderBorrows(allBorrows, currentFilter);
    updateDashboardStats();
    updateNavBadges();
  } catch {
    showToast('Connection Error', 'Could not load borrow records.', 'error');
  }
}

function renderBorrows(borrows, filter = 'all') {
  const filtered = borrows.filter(b => {
    if (filter === 'active')   return !b.returned && !isOverdue(b.borrow_date);
    if (filter === 'overdue')  return !b.returned &&  isOverdue(b.borrow_date);
    if (filter === 'returned') return  b.returned;
    return true;
  });

  const tbody = document.getElementById('borrowed-books-list');
  const empty = document.getElementById('records-empty');
  const table = document.getElementById('borrow-table');
  tbody.innerHTML = '';

  if (!filtered || !filtered.length) {
    table.classList.add('hidden'); empty.classList.remove('hidden'); return;
  }
  table.classList.remove('hidden'); empty.classList.add('hidden');

  filtered.forEach(b => {
    const due      = dueDate(b.borrow_date);
    const overdue  = !b.returned && isOverdue(b.borrow_date);
    const badgeCls = b.returned ? 'badge-green' : overdue ? 'badge-red' : 'badge-orange';
    const badgeTxt = b.returned ? 'Returned'    : overdue ? 'Overdue'   : 'Active';
    const dueStr   = due ? formatDate(due.toISOString()) : '—';
    const dueStyle = overdue ? 'color:var(--red);font-weight:600' : '';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${escHtml(b.user_name)}</td>
      <td>${escHtml(b.book_title)}</td>
      <td style="color:var(--text-dim);font-size:0.82rem">${formatDate(b.borrow_date)}</td>
      <td style="font-size:0.82rem;${dueStyle}">${dueStr}</td>
      <td><span class="badge ${badgeCls}">${badgeTxt}</span></td>
      <td>${!b.returned
        ? `<button class="btn-return" data-id="${b.id}" data-book="${escHtml(b.book_title)}">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
             Return
           </button>`
        : '<span style="color:var(--text-dim);font-size:0.8rem">—</span>'
      }</td>`;
    tbody.appendChild(tr);
  });

  document.querySelectorAll('.btn-return').forEach(btn => {
    btn.addEventListener('click', () => {
      openReturnModal(btn.dataset.book, async () => {
        setLoading(true);
        try {
          await fetch(`${API}/borrow/return/${btn.dataset.id}`, { method:'PUT' });
          showToast('Book Returned', `"${btn.dataset.book}" returned.`, 'info');
          logActivity(`Returned: "${btn.dataset.book}"`, '#3ecf8e');
          await loadBooks();
          await loadBorrowedBooks();
        } catch { showToast('Error', 'Failed to return book.', 'error'); }
        finally  { setLoading(false); }
      });
    });
  });
}

document.getElementById('borrow-book-form').addEventListener('submit', async e => {
  e.preventDefault();
  const userSel = document.getElementById('borrow-user');
  const bookSel = document.getElementById('borrow-book');
  clearErrors('err-borrow-user','err-borrow-book');
  let valid = true;
  if (!userSel.value) valid = setFieldError(userSel, 'err-borrow-user', 'Please select a member.') && valid;
  if (!bookSel.value) valid = setFieldError(bookSel, 'err-borrow-book', 'Please select a book.')   && valid;
  if (!valid) return;
  const userName = userSel.selectedOptions[0]?.text || '';
  const bookName = bookSel.selectedOptions[0]?.text || '';
  setLoading(true);
  try {
    await fetch(`${API}/borrow/borrow`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ user_id:userSel.value, book_id:bookSel.value }),
    });
    showToast('Book Issued', `${userName} borrowed "${bookName}".`, 'success');
    logActivity(`${userName} borrowed "${bookName}"`, '#f0a500');
    e.target.reset();
    updateDueDatePreview();
    await loadBooks();
    await loadBorrowedBooks();
  } catch { showToast('Error', 'Failed to issue book.', 'error'); }
  finally  { setLoading(false); }
});

document.querySelectorAll('.filter-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentFilter = tab.dataset.filter;
    renderBorrows(allBorrows, currentFilter);
  });
});

/* ---- Dashboard Stats ---- */
function updateDashboardStats() {
  animateNumber('dash-total-books',     allBooks.length);
  animateNumber('dash-available-books', allBooks.filter(b => b.available).length);
  animateNumber('dash-total-members',   allUsers.length);
  animateNumber('dash-borrowed',        allBorrows.filter(b => !b.returned).length);
  animateNumber('dash-overdue',         allBorrows.filter(b => !b.returned && isOverdue(b.borrow_date)).length);
}

function animateNumber(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  const start = parseInt(el.textContent) || 0;
  const t0    = performance.now();
  function step(now) {
    const p = Math.min((now - t0) / 500, 1);
    el.textContent = Math.round(start + (target - start) * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ---- Global Search ---- */
document.getElementById('global-search').addEventListener('input', e => {
  const q = e.target.value.trim().toLowerCase();
  if (!q) return;
  const bookMatch   = allBooks.find(b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
  const memberMatch = allUsers.find(u => u.name.toLowerCase().includes(q)  || u.email.toLowerCase().includes(q));
  if (bookMatch) {
    navigate('books');
    document.getElementById('book-search').value = q;
    renderBooks(allBooks.filter(b => b.title.toLowerCase().includes(q)));
  } else if (memberMatch) {
    navigate('members');
    document.getElementById('member-search').value = q;
    renderUsers(allUsers.filter(u => u.name.toLowerCase().includes(q)));
  }
});

/* ---- Utilities ---- */
function escHtml(str) {
  return String(str || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isNaN(d) ? dateStr : d.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
}

/* ---- Init ---- */
(async function init() {
  setLoading(true);
  try { await Promise.all([loadBooks(), loadUsers(), loadBorrowedBooks()]); }
  finally { setLoading(false); }
})();