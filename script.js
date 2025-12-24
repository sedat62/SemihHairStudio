
document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const navbar = document.querySelector('.navbar');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Navbar Scroll Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(9, 9, 11, 0.95)';
            navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(9, 9, 11, 0.85)';
            navbar.style.boxShadow = 'none';
        }
    });

    // Simple Gallery Lightbox
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.getElementById('lightboxClose');

    // (Assuming static images for now as Firebase logic was stripped in revert to match "working" state, 
    // but originally script.js might have had it. I will add basic listener.)
    document.querySelectorAll('.gallery-item img').forEach(img => {
        img.addEventListener('click', () => {
            lightboxImg.src = img.src;
            lightbox.classList.remove('hidden');
            lightbox.classList.remove('opacity-0');
        });
    });

    if (lightboxClose) {
        lightboxClose.addEventListener('click', () => {
            lightbox.classList.add('hidden');
            lightbox.classList.add('opacity-0');
        });
    }

    // Contact Form - Basic Handler to prevent default if no backend
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Collect Data
            const formData = {
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                date: document.getElementById('date').value,
                service: document.getElementById('service').value,
                message: document.getElementById('message').value,
                timestamp: Date.now(),
                status: 'pending'
            };

            // Firebase Save
            if (typeof db !== 'undefined') {
                db.collection('appointments').add(formData).then(() => {
                    alert('Randevu talebiniz alındı! En kısa sürede dönüş yapacağız.');
                    contactForm.reset();
                }).catch(err => {
                    console.error(err);
                    alert('Bir hata oluştu. Lütfen telefonla iletişime geçin.');
                });
            } else {
                alert('Sistem şu an çevrimdışı. Lütfen telefon ile arayınız.');
            }
        });
    }

    // Load Gallery from Firebase
    if (typeof db !== 'undefined') {
        const galleryGrid = document.getElementById('galleryGrid');
        if (galleryGrid) {
            db.collection('gallery').orderBy('timestamp', 'desc').limit(6).get().then(snapshot => {
                let html = '';
                snapshot.forEach(doc => {
                    const data = doc.data();
                    html += `
                        <div class="gallery-item relative aspect-square rounded-xl overflow-hidden cursor-pointer group">
                            <img src="${data.url}" alt="${data.title}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                            <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span class="text-white font-bold text-lg">🔍 İncele</span>
                            </div>
                        </div>
                    `;
                });
                if (html) galleryGrid.innerHTML = html;

                // Re-attach lightbox listeners
                galleryGrid.querySelectorAll('.gallery-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const img = item.querySelector('img');
                        lightboxImg.src = img.src;
                        lightbox.classList.remove('hidden');
                        lightbox.classList.remove('opacity-0');
                    });
                });
            });
        }
    }
});
