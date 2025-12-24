// Admin Panel Logic

const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

let appointments = [];
let galleryImages = [];

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const adminDashboard = document.getElementById('adminDashboard');
const sidebar = document.getElementById('sidebar');

// Login
document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if (user === ADMIN_CREDENTIALS.username && pass === ADMIN_CREDENTIALS.password) {
        loginScreen.style.display = 'none';
        adminDashboard.classList.remove('hidden');
        initializeDashboard();
    } else {
        alert('Hatalı kullanıcı adı veya şifre!');
    }
});

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    adminDashboard.classList.add('hidden');
    loginScreen.style.display = 'flex';
    document.getElementById('loginForm').reset();
});

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.dataset.section;

        // Active State
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        item.classList.add('active');

        // Show Section
        document.querySelectorAll('.content-section').forEach(s => {
            s.classList.remove('active');
            s.classList.add('hidden');
        });
        const target = document.getElementById(`${section}Section`);
        target.classList.remove('hidden');
        target.classList.add('active');

        // Sidebar mobile close
        if (window.innerWidth < 1024) {
            sidebar.classList.remove('-translate-x-full');
        }
    });
});

function initializeDashboard() {
    subscribeToAppointments();
    subscribeToGallery();
    loadSettings();
}

// Subscribe Data
function subscribeToAppointments() {
    db.collection("appointments").orderBy("timestamp", "desc").onSnapshot((snapshot) => {
        appointments = [];
        snapshot.forEach((doc) => {
            appointments.push({ id: doc.id, ...doc.data() });
        });
        updateStats();
        renderRecentAppointments();
        renderAllAppointments();
    });
}

function subscribeToGallery() {
    db.collection("gallery").orderBy("timestamp", "desc").onSnapshot((snapshot) => {
        galleryImages = [];
        snapshot.forEach((doc) => {
            galleryImages.push({ id: doc.id, ...doc.data() });
        });
        updateStats();
        renderGallery();
    });
}

function updateStats() {
    document.getElementById('totalAppointments').textContent = appointments.length;
    document.getElementById('pendingAppointments').textContent = appointments.filter(a => a.status === 'pending').length;
    document.getElementById('completedAppointments').textContent = appointments.filter(a => a.status === 'completed').length;
    document.getElementById('totalImages').textContent = galleryImages.length;
}

// Rendering
function renderRecentAppointments() {
    const container = document.getElementById('recentAppointments');
    const recent = appointments.slice(0, 5);

    if (recent.length === 0) {
        container.innerHTML = '<p class="text-zinc-500 text-center py-4">Henüz randevu yok.</p>';
        return;
    }

    container.innerHTML = recent.map(app => `
        <div class="flex justify-between items-center p-3 hover:bg-zinc-800/50 rounded-lg cursor-pointer transition-colors" onclick="showAppointmentDetails('${app.id}')">
            <div class="flex items-center gap-3">
                 <div class="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-zinc-500">
                    ${app.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h4 class="text-sm font-medium text-white">${app.name}</h4>
                    <p class="text-xs text-zinc-500">${app.service}</p>
                </div>
            </div>
            <span class="px-2 py-1 rounded text-xs font-medium ${app.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'}">
                ${app.status === 'pending' ? 'Bekliyor' : 'Tamamlandı'}
            </span>
        </div>
    `).join('');
}

function renderAllAppointments(filter = 'all', search = '') {
    const container = document.getElementById('appointmentsList');
    let filtered = appointments;

    if (filter !== 'all') filtered = filtered.filter(a => a.status === filter);
    if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(a => a.name.toLowerCase().includes(s));
    }

    if (filtered.length === 0) {
        container.innerHTML = '<p class="text-zinc-500 text-center py-8">Kayıt bulunamadı.</p>';
        return;
    }

    container.innerHTML = filtered.map(app => `
        <div class="table-row hover:bg-zinc-900/50 transition-colors" onclick="showAppointmentDetails('${app.id}')">
            <div class="col-span-3 font-medium text-white">${app.name}</div>
            <div class="col-span-3 text-zinc-400">${app.service}</div>
            <div class="col-span-2 text-zinc-500 font-mono text-sm">${formatDate(app.date)}</div>
            <div class="col-span-2">
                <span class="px-2 py-1 rounded-full text-xs font-bold ${app.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'}">
                    ${app.status === 'pending' ? 'Bekliyor' : 'Tamamlandı'}
                </span>
            </div>
            <div class="col-span-2 text-right space-x-2">
                ${app.status === 'pending' ?
            `<button onclick="event.stopPropagation(); completeAppointment('${app.id}')" class="p-1 hover:bg-green-500/20 text-green-500 rounded transition-colors" title="Tamamla">✓</button>` :
            `<button onclick="event.stopPropagation(); pendingAppointment('${app.id}')" class="p-1 hover:bg-amber-500/20 text-amber-500 rounded transition-colors" title="Beklemeye Al">↺</button>`
        }
                <button onclick="event.stopPropagation(); deleteAppointment('${app.id}')" class="p-1 hover:bg-red-500/20 text-red-500 rounded transition-colors" title="Sil">🗑️</button>
            </div>
        </div>
    `).join('');
}

function renderGallery() {
    const container = document.getElementById('galleryGrid');
    container.innerHTML = galleryImages.map(img => `
        <div class="relative aspect-square rounded-xl overflow-hidden group bg-zinc-800">
            <img src="${img.url}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
            <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button onclick="deleteImage('${img.id}')" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors">
                    Sil
                </button>
            </div>
            <div class="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p class="text-white text-xs font-medium truncate">${img.title || ''}</p>
            </div>
        </div>
    `).join('');
}

// Actions
window.completeAppointment = (id) => db.collection("appointments").doc(id).update({ status: 'completed' });
window.pendingAppointment = (id) => db.collection("appointments").doc(id).update({ status: 'pending' });
window.deleteAppointment = (id) => { if (confirm('Silinsin mi?')) db.collection("appointments").doc(id).delete(); };
window.deleteImage = (id) => { if (confirm('Silinsin mi?')) db.collection("gallery").doc(id).delete(); };

// Settings
function loadSettings() {
    db.collection("settings").doc("config").get().then((doc) => {
        if (doc.exists) {
            const data = doc.data();
            if (document.getElementById('siteTitle')) document.getElementById('siteTitle').value = data.siteTitle || '';
            if (document.getElementById('sitePhone')) document.getElementById('sitePhone').value = data.sitePhone || '';
            if (document.getElementById('siteTheme')) document.getElementById('siteTheme').value = data.siteTheme || 'dark';
            if (document.getElementById('maintenanceMode')) document.getElementById('maintenanceMode').checked = data.maintenanceMode || false;
        }
    });
}

document.getElementById('settingsForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    db.collection("settings").doc("config").set({
        siteTitle: document.getElementById('siteTitle').value,
        sitePhone: document.getElementById('sitePhone').value,
        siteTheme: document.getElementById('siteTheme').value,
        maintenanceMode: document.getElementById('maintenanceMode').checked
    }).then(() => alert('Ayarlar kaydedildi!'));
});

// Modal Logic
window.showAppointmentDetails = (id) => {
    const app = appointments.find(a => a.id === id);
    if (!app) return;

    document.getElementById('detailName').textContent = app.name;
    document.getElementById('detailService').textContent = app.service;
    document.getElementById('detailPhone').textContent = app.phone;
    document.getElementById('detailDate').textContent = formatDate(app.date);
    document.getElementById('detailTimestamp').textContent = new Date(app.timestamp).toLocaleString('tr-TR');
    document.getElementById('detailMessage').textContent = app.message || '-';

    const btn = document.getElementById('detailActionBtn');
    if (app.status === 'pending') {
        btn.textContent = '✓ Tamamla';
        btn.className = 'px-4 py-3 rounded-xl font-bold bg-green-600 hover:bg-green-700 text-white transition-colors';
        btn.onclick = () => { completeAppointment(id); closeAppointmentDetails(); };
    } else {
        btn.textContent = '↺ Beklemeye Al';
        btn.className = 'px-4 py-3 rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white transition-colors';
        btn.onclick = () => { pendingAppointment(id); closeAppointmentDetails(); };
    }

    document.getElementById('appointmentDetailsModal').classList.remove('hidden', 'opacity-0');
};

window.closeAppointmentDetails = () => {
    document.getElementById('appointmentDetailsModal').classList.add('hidden', 'opacity-0');
};

function formatDate(ds) {
    if (!ds) return '-';
    return new Date(ds).toLocaleDateString('tr-TR');
}

// Image Upload
const uploadModal = document.getElementById('imageUploadModal');
document.getElementById('addImageBtn')?.addEventListener('click', () => {
    uploadModal.classList.remove('hidden');
});
document.querySelectorAll('.modal-close, .modal-cancel').forEach(el => {
    el.addEventListener('click', () => uploadModal.classList.add('hidden'));
});

document.getElementById('imageFile')?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = document.getElementById('previewImg');
            img.src = ev.target.result;
            document.getElementById('imagePreview').classList.remove('hidden');
            document.querySelector('.upload-placeholder').classList.add('hidden');
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('imageUploadForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('imageTitle').value;
    const file = document.getElementById('imageFile').files[0];

    if (file && title) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            db.collection("gallery").add({
                title: title,
                url: ev.target.result,
                timestamp: Date.now()
            }).then(() => {
                alert('Eklendi');
                uploadModal.classList.add('hidden');
                e.target.reset();
                document.getElementById('imagePreview').classList.add('hidden');
                document.querySelector('.upload-placeholder').classList.remove('hidden');
            });
        };
        reader.readAsDataURL(file);
    }
});

// Filters
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderAllAppointments(btn.dataset.filter, document.getElementById('searchAppointments').value);
    });
});
document.getElementById('searchAppointments')?.addEventListener('input', (e) => {
    renderAllAppointments(document.querySelector('.filter-btn.active').dataset.filter, e.target.value);
});
