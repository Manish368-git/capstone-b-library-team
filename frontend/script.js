// ===== Books =====
const addBookForm = document.getElementById('add-book-form');
const bookList = document.getElementById('book-list');
const addBookMessage = document.getElementById('add-book-message');

async function loadBooks() {
    const response = await fetch('http://127.0.0.1:5000/api/books/');
    const books = await response.json();
    bookList.innerHTML = '';
    const borrowSelect = document.getElementById('borrow-book');
    borrowSelect.innerHTML = '';
    books.forEach(book => {
        const li = document.createElement('li');
        li.textContent = `${book.title} by ${book.author} (ISBN: ${book.isbn}) - ${book.available ? 'Available' : 'Not Available'}`;
        bookList.appendChild(li);

        if(book.available) {
            const option = document.createElement('option');
            option.value = book.id;
            option.textContent = `${book.title} by ${book.author}`;
            borrowSelect.appendChild(option);
        }
    });
}

addBookForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const isbn = document.getElementById('isbn').value;

    const response = await fetch('http://127.0.0.1:5000/api/books/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, author, isbn })
    });

    const result = await response.json();
    addBookMessage.textContent = result.message;
    addBookForm.reset();
    loadBooks();
});

loadBooks();

// ===== Users =====
const addUserForm = document.getElementById('add-user-form');
const userList = document.getElementById('user-list');
const addUserMessage = document.getElementById('add-user-message');

async function loadUsers() {
    const response = await fetch('http://127.0.0.1:5000/api/users/');
    const users = await response.json();
    userList.innerHTML = '';
    const borrowSelect = document.getElementById('borrow-user');
    borrowSelect.innerHTML = '';
    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = `${user.name} (${user.email})`;
        userList.appendChild(li);

        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = user.name;
        borrowSelect.appendChild(option);
    });
}

addUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('user-name').value;
    const email = document.getElementById('user-email').value;

    const response = await fetch('http://127.0.0.1:5000/api/users/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
    });

    const result = await response.json();
    addUserMessage.textContent = result.message;
    addUserForm.reset();
    loadUsers();
});

loadUsers();

// ===== Borrow Book =====
const borrowForm = document.getElementById('borrow-book-form');
const borrowedList = document.getElementById('borrowed-books-list');
const borrowMessage = document.getElementById('borrow-book-message');

async function loadBorrowedBooks() {
    const response = await fetch('http://127.0.0.1:5000/api/borrow/report');
    const borrows = await response.json();
    borrowedList.innerHTML = '';
    borrows.forEach(b => {
        const li = document.createElement('li');
        li.textContent = `User: ${b.user_name} borrowed "${b.book_title}" on ${b.borrow_date} - Returned: ${b.returned ? 'Yes' : 'No'}`;

        if(!b.returned) {
            const returnBtn = document.createElement('button');
            returnBtn.textContent = 'Return';
            returnBtn.addEventListener('click', async () => {
                const res = await fetch(`http://127.0.0.1:5000/api/borrow/return/${b.id}`, { method: 'PUT' });
                const result = await res.json();
                borrowMessage.textContent = result.message;
                loadBooks();
                loadBorrowedBooks();
            });
            li.appendChild(returnBtn);
        }

        borrowedList.appendChild(li);
    });
}

borrowForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userId = document.getElementById('borrow-user').value;
    const bookId = document.getElementById('borrow-book').value;

    const response = await fetch('http://127.0.0.1:5000/api/borrow/borrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, book_id: bookId })
    });

    const result = await response.json();
    borrowMessage.textContent = result.message;
    loadBooks();
    loadBorrowedBooks();
});

loadBorrowedBooks();
