/* ============================================================
   LOGIN SYSTEM
   ============================================================ */

function getToken() {
  return localStorage.getItem('gyaan_token');
}

function setToken(token, username) {
  localStorage.setItem('gyaan_token', token);
  localStorage.setItem('gyaan_username', username);
}

function clearToken() {
  localStorage.removeItem('gyaan_token');
  localStorage.removeItem('gyaan_username');
}

function isLoggedIn() {
  return !!getToken();
}

function showLoginPage() {
  document.getElementById('login-overlay').classList.remove('hidden');
}

function hideLoginPage() {
  document.getElementById('login-overlay').classList.add('hidden');
}

// Check login on page load
if (!isLoggedIn()) {
  showLoginPage();
}

// Toggle password visibility
document.getElementById('toggle-password').addEventListener('click', () => {
  const input = document.getElementById('login-password');
  input.type = input.type === 'password' ? 'text' : 'password';
});

// Login form submit
document.getElementById('login-form').addEventListener('submit', async e => {
  e.preventDefault();
  const usernameEl = document.getElementById('login-username');
  const passwordEl = document.getElementById('login-password');
  const errorBox   = document.getElementById('login-error');
  const errorMsg   = document.getElementById('login-error-msg');
  const btnText    = document.getElementById('btn-login-text');
  const btnSpinner = document.getElementById('btn-login-spinner');

  errorBox.classList.add('hidden');

  const username = usernameEl.value.trim();
  const password = passwordEl.value.trim();

  if (!username || !password) {
    errorMsg.textContent = 'Please enter username and password.';
    errorBox.classList.remove('hidden');
    return;
  }

  btnText.textContent = 'Signing in...';
  btnSpinner.classList.remove('hidden');

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      errorMsg.textContent = data.error || 'Invalid username or password.';
      errorBox.classList.remove('hidden');
      return;
    }

    setToken(data.token, data.username);
    hideLoginPage();
    showToast('Welcome back!', `Logged in as ${data.username}`, 'success');

  } catch {
    errorMsg.textContent = 'Could not connect to server. Is the backend running?';
    errorBox.classList.remove('hidden');
  } finally {
    btnText.textContent = 'Sign In';
    btnSpinner.classList.add('hidden');
  }
});

// Logout button
document.getElementById('btn-logout').addEventListener('click', () => {
  clearToken();
  showLoginPage();
  showToast('Logged out', 'See you next time!', 'info');
});

const API = (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
) ? 'http://127.0.0.1:5001/api'
  : 'https://capstone-b-library-team.onrender.com/api';

const LOAN_DAYS = 14;

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

(function setPageDate() {
  const el = document.getElementById('page-date');
  if (el) {
    el.textContent = new Date().toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }
})();

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
    dashboard: 'Dashboard',
    books:     'Books',
    members:   'Members',
    borrowing: 'Borrow a Book',
    records:   'Borrow Records',
  };
  breadcrumb.textContent = names[section] || section;
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
  if (section === 'borrowing') {
    updateBorrowUserSelect(allUsers);
    updateBorrowBookSelect(allBooks);
  }
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

function updateNavBadges() {
  const bookBadge    = document.getElementById('nav-badge-books');
  const memberBadge  = document.getElementById('nav-badge-members');
  const overdueBadge = document.getElementById('nav-badge-overdue');
  bookBadge.textContent = allBooks.length;
  bookBadge.classList.toggle('visible', allBooks.length > 0);
  memberBadge.textContent = allUsers.length;
  memberBadge.classList.toggle('visible', allUsers.length > 0);
  const overdueCount = allBorrows.filter(b => b.status === 'overdue').length;
  overdueBadge.textContent = overdueCount;
  overdueBadge.classList.toggle('visible', overdueCount > 0);
}

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

const loadingOverlay = document.getElementById('loading-overlay');
function setLoading(val) { loadingOverlay.classList.toggle('hidden', !val); }

const activityLog = [];
function logActivity(text, color = '#f0a500') {
  activityLog.unshift({
    text, color,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
      <span style="font-size:0.75rem;color:var(--text-3)">${a.time}</span>
    </li>`).join('');
}

function calcDueDate(borrowDateStr) {
  if (!borrowDateStr) return null;
  const d = new Date(borrowDateStr);
  d.setDate(d.getDate() + LOAN_DAYS);
  return d;
}

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

document.getElementById('btn-export-csv').addEventListener('click', () => {
  if (!allBorrows.length) {
    showToast('Nothing to export', 'No records available.', 'error');
    return;
  }
  const rows = [['Member','Book','Borrow Date','Due Date','Status']];
  allBorrows.forEach(b => {
    const due = calcDueDate(b.borrow_date);
    rows.push([
      b.user_name, b.book_title,
      formatDate(b.borrow_date),
      due ? formatDate(due.toISOString()) : '—',
      b.status ? (b.status.charAt(0).toUpperCase() + b.status.slice(1)) : '—',
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

function updateDueDatePreview() {
  const due = new Date();
  due.setDate(due.getDate() + LOAN_DAYS);
  const el = document.getElementById('due-date-text');
  if (el) el.textContent = formatDate(due.toISOString());
}
updateDueDatePreview();

let allBooks = [];

async function loadBooks() {
  try {
    const res = await fetch(`${API}/books/`);
    if (!res.ok) throw new Error('Failed to load books');
    allBooks = await res.json();
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
      <td style="font-weight:500;color:var(--text-1)">${escHtml(book.title)}</td>
      <td>${escHtml(book.author)}</td>
      <td style="font-family:monospace;font-size:0.78rem;color:var(--text-3)">${escHtml(book.isbn)}</td>
      <td><span class="category-badge">${escHtml(book.category || 'General')}</span></td>
      <td><span class="badge ${book.available ? 'badge-green' : 'badge-red'}">${book.available ? 'Available' : 'On Loan'}</span></td>
      <td>
        <div class="action-btns">
          <button class="btn-edit" data-id="${book.id}" title="Edit">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit
          </button>
          <button class="btn-delete" data-id="${book.id}" data-title="${escHtml(book.title)}" title="Delete">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            Delete
          </button>
        </div>
      </td>`;
    tbody.appendChild(tr);
  });

  document.querySelectorAll('#book-list .btn-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const book = allBooks.find(b => b.id === parseInt(btn.dataset.id));
      if (book) openEditBookModal(book);
    });
  });

  document.querySelectorAll('#book-list .btn-delete').forEach(btn => {
    btn.addEventListener('click', () => {
      openDeleteModal(`Delete "${btn.dataset.title}"?`, 'This action cannot be undone.', async () => {
        setLoading(true);
        try {
          const res = await fetch(`${API}/books/${btn.dataset.id}`, { method: 'DELETE' });
          if (!res.ok) {
            const data = await res.json();
            showToast('Error', data.error || 'Failed to delete book.', 'error');
            return;
          }
          showToast('Book Deleted', `"${btn.dataset.title}" has been removed.`, 'info');
          logActivity(`Deleted book: "${btn.dataset.title}"`, '#f76e6e');
          await loadBooks();
        } catch {
          showToast('Error', 'Failed to delete book.', 'error');
        } finally {
          setLoading(false);
        }
      });
    });
  });
}

function updateBorrowBookSelect(books) {
  const sel = document.getElementById('borrow-book');
  sel.innerHTML = '<option value="" disabled selected>Choose a book…</option>';
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
    const res = await fetch(`${API}/books/`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ title:titleEl.value.trim(), author:authorEl.value.trim(), isbn:isbnEl.value.trim(), category:document.getElementById('book-category').value }),
    });
    if (!res.ok) {
      const data = await res.json();
      const err  = data.errors?.[0];
      if (err?.field === 'isbn') setFieldError(isbnEl, 'err-isbn', err.message);
      else showToast('Error', err?.message || 'Failed to add book.', 'error');
      return;
    }
    showToast('Book Added', `"${titleEl.value.trim()}" has been added.`, 'success');
    logActivity(`Added book: "${titleEl.value.trim()}"`, '#d4a843');
    e.target.reset();
    await loadBooks();
  } catch {
    showToast('Error', 'Failed to add book.', 'error');
  } finally {
    setLoading(false);
  }
});

let allUsers = [];

async function loadUsers() {
  try {
    const res = await fetch(`${API}/users/`);
    if (!res.ok) throw new Error('Failed to load users');
    allUsers = await res.json();
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
      <td style="color:var(--text-3);font-size:0.84rem">${escHtml(user.email)}</td>
      <td style="font-family:monospace;font-size:0.78rem;color:var(--text-4)">#${user.id}</td>`;
    tbody.appendChild(tr);
  });
}

function updateBorrowUserSelect(users) {
  const sel = document.getElementById('borrow-user');
  sel.innerHTML = '<option value="" disabled selected>Choose a member…</option>';
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
  if (!nameEl.value.trim())  valid = setFieldError(nameEl,  'err-user-name',  'Full name is required.')    && valid;
  if (!emailEl.value.trim()) valid = setFieldError(emailEl, 'err-user-email', 'Email is required.')        && valid;
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim()))
    valid = setFieldError(emailEl, 'err-user-email', 'Please enter a valid email.') && valid;
  if (!valid) return;
  setLoading(true);
  try {
    const res = await fetch(`${API}/users/`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ name:nameEl.value.trim(), email:emailEl.value.trim() }),
    });
    if (!res.ok) {
      const data = await res.json();
      const err  = data.errors?.[0];
      if (err?.field === 'email') setFieldError(emailEl, 'err-user-email', err.message);
      else showToast('Error', err?.message || 'Failed to add member.', 'error');
      return;
    }
    showToast('Member Added', `${nameEl.value.trim()} has been registered.`, 'success');
    logActivity(`New member: ${nameEl.value.trim()}`, '#4a90d9');
    e.target.reset();
    await loadUsers();
  } catch {
    showToast('Error', 'Failed to add member.', 'error');
  } finally {
    setLoading(false);
  }
});

let allBorrows        = [];
let currentFilter     = 'all';
let currentBorrowSearch = '';

async function loadBorrowedBooks() {
  try {
    const url = currentBorrowSearch
      ? `${API}/borrow/report?search=${encodeURIComponent(currentBorrowSearch)}`
      : `${API}/borrow/report`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load records');
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
    if (filter === 'active')   return b.status === 'active';
    if (filter === 'overdue')  return b.status === 'overdue';
    if (filter === 'returned') return b.status === 'returned';
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
    const due      = calcDueDate(b.borrow_date);
    const overdue  = b.status === 'overdue';
    const returned = b.status === 'returned';
    const badgeCls = returned ? 'badge-green' : overdue ? 'badge-red' : 'badge-orange';
    const badgeTxt = returned ? 'Returned' : overdue ? 'Overdue' : 'Active';
    const dueStr   = due ? formatDate(due.toISOString()) : '—';
    const dueStyle = overdue ? 'color:var(--red);font-weight:600' : 'color:var(--text-3)';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight:500;color:var(--text-1)">${escHtml(b.user_name)}</td>
      <td>${escHtml(b.book_title)}</td>
      <td style="font-size:0.82rem;color:var(--text-3)">${formatDate(b.borrow_date)}</td>
      <td style="font-size:0.82rem;${dueStyle}">${dueStr}</td>
      <td><span class="badge ${badgeCls}">${badgeTxt}</span></td>
      <td>${!returned
        ? `<button class="btn-return" data-book-id="${b.book_id}" data-book="${escHtml(b.book_title)}">
             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
             Return
           </button>`
        : '<span style="color:var(--text-4);font-size:0.8rem">—</span>'
      }</td>`;
    tbody.appendChild(tr);
  });
  document.querySelectorAll('.btn-return').forEach(btn => {
    btn.addEventListener('click', () => {
      openReturnModal(btn.dataset.book, async () => {
        setLoading(true);
        try {
          const res = await fetch(`${API}/borrow/return`, {
            method:'PUT', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ book_id: Number(btn.dataset.bookId) }),
          });
          if (!res.ok) throw new Error('Return failed');
          showToast('Book Returned', `"${btn.dataset.book}" has been returned.`, 'info');
          logActivity(`Returned: "${btn.dataset.book}"`, '#3ecf8e');
          await loadBooks();
          await loadBorrowedBooks();
        } catch {
          showToast('Error', 'Failed to return book.', 'error');
        } finally {
          setLoading(false);
        }
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
  if (!userSel.value || isNaN(userSel.value)) valid = setFieldError(userSel, 'err-borrow-user', 'Please select a member.') && valid;
  if (!bookSel.value || isNaN(bookSel.value)) valid = setFieldError(bookSel, 'err-borrow-book', 'Please select a book.')   && valid;
  if (!valid) return;
  const userName = userSel.selectedOptions[0]?.text || '';
  const bookName = bookSel.selectedOptions[0]?.text || '';
  setLoading(true);
  try {
    const res = await fetch(`${API}/borrow/`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ user_id:parseInt(userSel.value), book_id:parseInt(bookSel.value) }),
    });
    if (!res.ok) {
      const data = await res.json();
      showToast('Error', data.error || 'Failed to issue book.', 'error');
      return;
    }
    showToast('Book Issued', `${userName} borrowed "${bookName}".`, 'success');
    logActivity(`${userName} borrowed "${bookName}"`, '#d4a843');
    e.target.reset();
    updateDueDatePreview();
    await loadBooks();
    await loadBorrowedBooks();
  } catch {
    showToast('Error', 'Failed to issue book.', 'error');
  } finally {
    setLoading(false);
  }
});

document.querySelectorAll('.filter-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentFilter = tab.dataset.filter;
    renderBorrows(allBorrows, currentFilter);
  });
});

const borrowSearchInput = document.getElementById('borrow-search');
if (borrowSearchInput) {
  borrowSearchInput.addEventListener('input', async e => {
    currentBorrowSearch = e.target.value.trim();
    await loadBorrowedBooks();
  });
}

function updateDashboardStats() {
  renderChart();
  animateNumber('dash-total-books',     allBooks.length);
  animateNumber('dash-available-books', allBooks.filter(b => b.available).length);
  animateNumber('dash-total-members',   allUsers.length);
  animateNumber('dash-borrowed',        allBorrows.filter(b => b.status === 'active' || b.status === 'overdue').length);
  animateNumber('dash-overdue',         allBorrows.filter(b => b.status === 'overdue').length);
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

(async function init() {
  setLoading(true);
  try {
    await Promise.all([loadBooks(), loadUsers(), loadBorrowedBooks()]);
  } finally {
    setLoading(false);
  }
})();

/* ============================================================
   DASHBOARD CHART
   ============================================================ */
let libraryChart = null;

function renderChart() {
  const canvas = document.getElementById('library-chart');
  if (!canvas) return;

  const totalBooks     = allBooks.length;
  const availableBooks = allBooks.filter(b => b.available).length;
  const onLoan         = allBorrows.filter(b => b.status === 'active' || b.status === 'overdue').length;
  const overdue        = allBorrows.filter(b => b.status === 'overdue').length;
  const returned       = allBorrows.filter(b => b.status === 'returned').length;

  if (libraryChart) {
    libraryChart.data.datasets[0].data = [totalBooks, availableBooks, onLoan, overdue, returned];
    libraryChart.update();
    return;
  }

  libraryChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: ['Total Books', 'Available', 'On Loan', 'Overdue', 'Returned'],
      datasets: [{
        label: 'Books',
        data: [totalBooks, availableBooks, onLoan, overdue, returned],
        backgroundColor: [
          'rgba(212,168,67,0.7)',
          'rgba(62,207,142,0.7)',
          'rgba(240,168,50,0.7)',
          'rgba(247,110,110,0.7)',
          'rgba(74,144,217,0.7)',
        ],
        borderColor: [
          '#d4a843',
          '#3ecf8e',
          '#f0a832',
          '#f76e6e',
          '#4a90d9',
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#181e32',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          titleColor: '#f0ebe0',
          bodyColor: '#b8bece',
          padding: 12,
          cornerRadius: 8,
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: { color: '#6e7a92', font: { family: 'Outfit', size: 12 } },
          border: { color: 'rgba(255,255,255,0.05)' }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: {
            color: '#6e7a92',
            font: { family: 'Outfit', size: 12 },
            stepSize: 1,
            precision: 0
          },
          border: { color: 'rgba(255,255,255,0.05)' }
        }
      }
    }
  });
}


/* ============================================================
   MEMBER HISTORY
   ============================================================ */
async function openMemberHistory(userId, userName) {
  document.getElementById('history-modal-title').textContent = `${userName} — Borrow History`;
  document.getElementById('history-list').innerHTML = '';
  document.getElementById('history-stats').innerHTML = '';
  document.getElementById('history-empty').classList.add('hidden');
  document.getElementById('history-modal').classList.remove('hidden');

  try {
    const res  = await fetch(`${API}/borrow/member/${userId}`);
    const data = await res.json();

    // Stats
    document.getElementById('history-stats').innerHTML = `
      <div class="history-stat">
        <span class="history-stat-value">${data.total}</span>
        <span class="history-stat-label">Total</span>
      </div>
      <div class="history-stat">
        <span class="history-stat-value" style="color:var(--amber)">${data.active}</span>
        <span class="history-stat-label">Active</span>
      </div>
      <div class="history-stat">
        <span class="history-stat-value" style="color:var(--red)">${data.overdue}</span>
        <span class="history-stat-label">Overdue</span>
      </div>
      <div class="history-stat">
        <span class="history-stat-value" style="color:var(--green)">${data.returned}</span>
        <span class="history-stat-label">Returned</span>
      </div>`;

    if (!data.borrows.length) {
      document.getElementById('history-empty').classList.remove('hidden');
      return;
    }

    const tbody = document.getElementById('history-list');
    data.borrows.forEach(b => {
      const badgeCls = b.status === 'returned' ? 'badge-green' : b.status === 'overdue' ? 'badge-red' : 'badge-orange';
      const badgeTxt = b.status === 'returned' ? 'Returned'   : b.status === 'overdue' ? 'Overdue'  : 'Active';
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight:500;color:var(--text-1)">${escHtml(b.book_title)}</td>
        <td style="font-size:0.82rem;color:var(--text-3)">${formatDate(b.borrow_date)}</td>
        <td style="font-size:0.82rem;color:${b.status === 'overdue' ? 'var(--red)' : 'var(--text-3)'}">${formatDate(b.due_date)}</td>
        <td><span class="badge ${badgeCls}">${badgeTxt}</span></td>`;
      tbody.appendChild(tr);
    });

  } catch {
    showToast('Error', 'Could not load member history.', 'error');
    document.getElementById('history-modal').classList.add('hidden');
  }
}

document.getElementById('history-modal-close').addEventListener('click', () => {
  document.getElementById('history-modal').classList.add('hidden');
});

document.getElementById('history-modal').addEventListener('click', e => {
  if (e.target === document.getElementById('history-modal')) {
    document.getElementById('history-modal').classList.add('hidden');
  }
});
