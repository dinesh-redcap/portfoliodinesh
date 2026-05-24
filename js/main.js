// ============================================
// EXPERIENCE SECTION - NEW
// ============================================

// Add experiences to default data
// Update defaultData object to include:
// experiences: []

// Initialize experiences array
if (!siteData.experiences) siteData.experiences = [];

/**
 * Load and render all experiences
 */
function loadExperiences() {
    const experienceGrid = document.getElementById('experienceGrid');
    if (!experienceGrid) {
        console.error('Experience grid not found!');
        return;
    }
    
    let experiences = siteData.experiences || [];
    
    if (experiences.length === 0) {
        experienceGrid.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: var(--gray-400); grid-column: 1/-1;">
                <i class="fas fa-star" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
                <p style="font-size: 1.1rem;">No experiences added yet</p>
                <p style="font-size: 0.9rem; margin-top: 8px;">Add experiences from the admin panel</p>
            </div>`;
        return;
    }
    
    // Sort: pinned first, then by order
    experiences.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return (a.order || 0) - (b.order || 0);
    });
    
    experienceGrid.innerHTML = experiences.map(exp => `
        <div class="experience-card ${exp.pinned ? 'pinned' : ''}" onclick="openExperienceModal('${exp.id}')">
            <div class="experience-images">
                ${exp.images && exp.images.length > 0 ? 
                    `<img src="${exp.images[0]}" alt="${escapeHTML(exp.title)}" loading="lazy">
                     ${exp.images.length > 1 ? 
                        `<span class="image-count-badge"><i class="fas fa-images"></i> ${exp.images.length}</span>` : 
                        ''}` :
                    `<i class="fas fa-briefcase placeholder-icon"></i>`
                }
            </div>
            <div class="experience-content">
                <h3 class="experience-title">${escapeHTML(exp.title)}</h3>
                <p class="experience-company">
                    <i class="fas fa-building"></i> ${escapeHTML(exp.company)}
                </p>
                <p class="experience-duration">
                    <i class="fas fa-calendar-alt"></i> ${escapeHTML(exp.duration)}
                </p>
                <p class="experience-description">${escapeHTML(exp.description || '')}</p>
                <div>
                    ${(exp.certLink || exp.certFile) ? 
                        `<span class="experience-cert-badge" onclick="event.stopPropagation(); window.open('${exp.certLink || exp.certFile}', '_blank')">
                            <i class="fas fa-certificate"></i> Certificate
                        </span>` : ''
                    }
                    ${exp.pinned ? '<span class="experience-badge">📌 Pinned</span>' : ''}
                </div>
            </div>
        </div>
    `).join('');
    
    console.log('Experiences loaded:', experiences.length);
}

/**
 * Open experience detail modal
 */
function openExperienceModal(experienceId) {
    const experience = siteData.experiences.find(e => e.id === experienceId);
    if (!experience) return;
    
    const modal = document.getElementById('experienceModal');
    const modalBody = document.getElementById('experienceModalBody');
    
    if (!modal || !modalBody) return;
    
    // Generate image gallery HTML
    let imageGalleryHTML = '';
    if (experience.images && experience.images.length > 0) {
        const imagesHTML = experience.images.map((img, index) => 
            `<img src="${img}" alt="${escapeHTML(experience.title)} - Image ${index + 1}" class="${index === 0 ? 'active' : ''}">`
        ).join('');
        
        const dotsHTML = experience.images.length > 1 ? 
            experience.images.map((_, index) => 
                `<span class="image-dot ${index === 0 ? 'active' : ''}" onclick="event.stopPropagation(); changeExperienceImage(${index})"></span>`
            ).join('') : '';
        
        const navHTML = experience.images.length > 1 ? `
            <button class="image-nav prev" onclick="event.stopPropagation(); navigateExperienceImage(-1)">
                <i class="fas fa-chevron-left"></i>
            </button>
            <button class="image-nav next" onclick="event.stopPropagation(); navigateExperienceImage(1)">
                <i class="fas fa-chevron-right"></i>
            </button>
            <div class="image-dots">${dotsHTML}</div>
        ` : '';
        
        imageGalleryHTML = `
            <div class="experience-modal-images" id="expImageGallery">
                ${imagesHTML}
                ${navHTML}
            </div>`;
    }
    
    modalBody.innerHTML = `
        ${imageGalleryHTML}
        <div class="experience-modal-info">
            <h2>${escapeHTML(experience.title)}</h2>
            <p class="experience-modal-company">
                <i class="fas fa-building"></i> ${escapeHTML(experience.company)}
            </p>
            <p class="experience-modal-duration">
                <i class="fas fa-calendar-alt"></i> ${escapeHTML(experience.duration)}
            </p>
            <p class="experience-modal-description">${escapeHTML(experience.description)}</p>
            <div class="experience-modal-links">
                ${experience.certLink ? `
                    <a href="${experience.certLink}" target="_blank" class="btn btn-outline btn-sm">
                        <i class="fas fa-certificate"></i> View Certificate
                    </a>` : ''
                }
                ${experience.certFile ? `
                    <a href="${experience.certFile}" target="_blank" class="btn btn-outline btn-sm">
                        <i class="fas fa-download"></i> Download Certificate
                    </a>` : ''
                }
            </div>
        </div>
    `;
    
    // Store current experience for gallery navigation
    modal.dataset.experienceId = experienceId;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Navigate experience image gallery
 */
function navigateExperienceImage(direction) {
    const gallery = document.getElementById('expImageGallery');
    if (!gallery) return;
    
    const images = gallery.querySelectorAll('img');
    const dots = gallery.querySelectorAll('.image-dot');
    let activeIndex = Array.from(images).findIndex(img => img.classList.contains('active'));
    
    images[activeIndex].classList.remove('active');
    if (dots.length > 0) dots[activeIndex].classList.remove('active');
    
    activeIndex = (activeIndex + direction + images.length) % images.length;
    
    images[activeIndex].classList.add('active');
    if (dots.length > 0) dots[activeIndex].classList.add('active');
}

/**
 * Change to specific image in gallery
 */
function changeExperienceImage(index) {
    const gallery = document.getElementById('expImageGallery');
    if (!gallery) return;
    
    const images = gallery.querySelectorAll('img');
    const dots = gallery.querySelectorAll('.image-dot');
    
    images.forEach(img => img.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    if (images[index]) images[index].classList.add('active');
    if (dots[index]) dots[index].classList.add('active');
}

// Update initModalSystem to handle experience modal
function initModalSystem() {
    // Project Modal
    const projectModal = document.getElementById('projectModal');
    if (projectModal) {
        const closeBtn = projectModal.querySelector('.modal-close');
        const overlay = projectModal.querySelector('.modal-overlay');
        
        if (closeBtn) closeBtn.addEventListener('click', () => closeModalById('projectModal'));
        if (overlay) overlay.addEventListener('click', () => closeModalById('projectModal'));
    }
    
    // Experience Modal
    const experienceModal = document.getElementById('experienceModal');
    if (experienceModal) {
        const closeBtn = experienceModal.querySelector('.modal-close');
        const overlay = experienceModal.querySelector('.modal-overlay');
        
        if (closeBtn) closeBtn.addEventListener('click', () => closeModalById('experienceModal'));
        if (overlay) overlay.addEventListener('click', () => closeModalById('experienceModal'));
    }
    
    // Escape key closes all modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

function closeModalById(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal.active').forEach(modal => {
        modal.classList.remove('active');
    });
    document.body.style.overflow = '';
}

// Update loadAllContent to include experiences
function loadAllContent() {
    loadProfile();
    loadProjects();
    loadSkills();
    loadExperiences();  // NEW
    loadSocialLinks();
    loadResumeButton();
    updateWhatsApp();
    updateFooter();
}
