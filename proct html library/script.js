// Default Books Data (Saved in LocalStorage)
let books = JSON.parse(localStorage.getItem('libraryBooks')) || [
    { id: 'BK101', title: 'Introduction to Python Programming', author: 'Guido van Rossum', status: 'Available' },
    { id: 'BK102', title: 'Object Oriented Programming in C++', author: 'E. Balagurusamy', status: 'Available' },
    { id: 'BK103', title: 'Engineering Mathematics - I', author: 'B.S. Grewal', status: 'Available' },
    { id: 'BK104', title: 'HTML & CSS: Design and Build Websites', author: 'Jon Duckett', status: 'Available' },
    { id: 'BK105', title: 'Data Structures and Algorithms', author: 'Narasimha Karumanchi', status: 'Available' }
];

let requests = JSON.parse(localStorage.getItem('libraryRequests')) || [];
let selectedBookId = null;

// Admin Credentials
const ADMIN_EMAIL = "vardaanpanwar155@gmail.com";
const ADMIN_PASS = "admin123";

// Save data to LocalStorage
function saveData() {
    localStorage.setItem('libraryBooks', JSON.stringify(books));
    localStorage.setItem('libraryRequests', JSON.stringify(requests));
}

// Switch between Student and Admin Tabs
function switchRole(role) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));

    if (role === 'student') {
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        document.getElementById('student-section').classList.add('active');
    } else {
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        document.getElementById('admin-section').classList.add('active');
    }
    renderAll();
}

// Render all tables
function renderAll() {
    renderStudentBooks(books);
    renderStudentRequests();
    renderAdminRequests();
    renderAdminInventory();
}

// 1. Render Student Catalog
function renderStudentBooks(bookArray) {
    const tbody = document.getElementById('student-book-list');
    tbody.innerHTML = '';

    bookArray.forEach(book => {
        const isAvailable = book.status === 'Available';
        const badgeClass = isAvailable ? 'badge-available' : 'badge-issued';
        
        tbody.innerHTML += `
            <tr>
                <td>${book.id}</td>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td><span class="badge ${badgeClass}">${book.status}</span></td>
                <td>
                    <button class="btn btn-primary" 
                        ${!isAvailable ? 'disabled' : ''} 
                        onclick="openRequestModal('${book.id}')">
                        ${isAvailable ? 'Request Book' : 'Unavailable'}
                    </button>
                </td>
            </tr>
        `;
    });
}

// Search Filter
function filterBooks() {
    const query = document.getElementById('search-box').value.toLowerCase();
    const filtered = books.filter(b => 
        b.title.toLowerCase().includes(query) || 
        b.author.toLowerCase().includes(query)
    );
    renderStudentBooks(filtered);
}

// Open Request Modal
function openRequestModal(bookId) {
    selectedBookId = bookId;
    const book = books.find(b => b.id === bookId);
    document.getElementById('modal-book-name').innerText = `Book: ${book.title} (${book.id})`;
    document.getElementById('request-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('request-modal').style.display = 'none';
    document.getElementById('stu-name').value = '';
    document.getElementById('stu-reg').value = '';
}

// Submit Book Request
function submitBookRequest() {
    const stuName = document.getElementById('stu-name').value.trim();
    const stuReg = document.getElementById('stu-reg').value.trim();

    if (!stuName || !stuReg) {
        alert("Please enter both your Name and Registration Number.");
        return;
    }

    const book = books.find(b => b.id === selectedBookId);
    book.status = 'Requested';

    requests.push({
        reqId: Date.now(),
        bookId: book.id,
        bookTitle: book.title,
        studentName: stuName,
        regNo: stuReg,
        status: 'Issue Pending'
    });

    saveData();
    closeModal();
    renderAll();
    alert("Book request sent to Admin!");
}

// 2. Render Student's Requested/Issued Books
function renderStudentRequests() {
    const tbody = document.getElementById('student-request-list');
    tbody.innerHTML = '';

    if (requests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No active requests or issued books.</td></tr>';
        return;
    }

    requests.forEach(req => {
        let actionBtn = '-';
        if (req.status === 'Issued') {
            actionBtn = `<button class="btn btn-warning" onclick="requestReturn(${req.reqId})">Return Book</button>`;
        }

        tbody.innerHTML += `
            <tr>
                <td>${req.studentName}</td>
                <td>${req.regNo}</td>
                <td>${req.bookTitle}</td>
                <td><span class="badge badge-pending">${req.status}</span></td>
                <td>${actionBtn}</td>
            </tr>
        `;
    });
}

// Student initiates Return
function requestReturn(reqId) {
    const req = requests.find(r => r.reqId === reqId);
    req.status = 'Return Pending';
    saveData();
    renderAll();
    alert("Return request sent to Admin for verification.");
}

// ================= ADMIN FUNCTIONS =================

function loginAdmin() {
    const email = document.getElementById('admin-email').value.trim();
    const pass = document.getElementById('admin-pass').value.trim();

    if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
        document.getElementById('admin-login-box').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'block';
        renderAll();
    } else {
        alert("Invalid Admin Email or Password!");
    }
}

function logoutAdmin() {
    document.getElementById('admin-login-box').style.display = 'block';
    document.getElementById('admin-dashboard').style.display = 'none';
    document.getElementById('admin-email').value = '';
    document.getElementById('admin-pass').value = '';
}

// Add New Book
function addNewBook() {
    const title = document.getElementById('new-book-title').value.trim();
    const author = document.getElementById('new-book-author').value.trim();

    if (!title || !author) {
        alert("Please fill both Book Title and Author Name.");
        return;
    }

    const newId = 'BK' + (101 + books.length);
    books.push({ id: newId, title: title, author: author, status: 'Available' });
    
    document.getElementById('new-book-title').value = '';
    document.getElementById('new-book-author').value = '';
    
    saveData();
    renderAll();
    alert("New book added to catalog!");
}

// Render Admin Pending Requests
function renderAdminRequests() {
    const tbody = document.getElementById('admin-request-list');
    tbody.innerHTML = '';

    const pending = requests.filter(r => r.status === 'Issue Pending' || r.status === 'Return Pending');

    if (pending.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No pending requests.</td></tr>';
        return;
    }

    pending.forEach(req => {
        let btnHtml = '';
        if (req.status === 'Issue Pending') {
            btnHtml = `<button class="btn btn-success" onclick="approveIssue(${req.reqId})">Approve Issue</button>`;
        } else if (req.status === 'Return Pending') {
            btnHtml = `<button class="btn btn-primary" onclick="approveReturn(${req.reqId})">Confirm Return</button>`;
        }

        tbody.innerHTML += `
            <tr>
                <td>${req.studentName}</td>
                <td>${req.regNo}</td>
                <td>${req.bookTitle}</td>
                <td><span class="badge badge-pending">${req.status}</span></td>
                <td>${btnHtml}</td>
            </tr>
        `;
    });
}

// Approve Book Issue
function approveIssue(reqId) {
    const req = requests.find(r => r.reqId === reqId);
    req.status = 'Issued';

    const book = books.find(b => b.id === req.bookId);
    book.status = 'Issued';

    saveData();
    renderAll();
}

// Confirm Book Return
function approveReturn(reqId) {
    const reqIndex = requests.findIndex(r => r.reqId === reqId);
    const bookId = requests[reqIndex].bookId;

    // Make book available again
    const book = books.find(b => b.id === bookId);
    book.status = 'Available';

    // Remove completed request
    requests.splice(reqIndex, 1);

    saveData();
    renderAll();
}

// Render Admin Inventory
function renderAdminInventory() {
    const tbody = document.getElementById('admin-book-list');
    tbody.innerHTML = '';

    books.forEach(book => {
        const badgeClass = book.status === 'Available' ? 'badge-available' : 'badge-issued';
        tbody.innerHTML += `
            <tr>
                <td>${book.id}</td>
                <td>${book.title}</td>
                <td>${book.author}</td>
                <td><span class="badge ${badgeClass}">${book.status}</span></td>
            </tr>
        `;
    });
}

// Initial Load
renderAll();