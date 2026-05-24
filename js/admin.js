// ============================================
// EXPERIENCE MANAGEMENT - NEW
// ============================================

// Initialize experiences array
if (!siteData.experiences) siteData.experiences = [];

/**
 * Load experiences in admin panel
 */
function loadAdminExperiences() {
    const container = document.getElementById('adminExperienceList');
    if (!container) {
        console.error('Admin experience list container not found!');
        return;
    }
    
    let experiences = siteData.experiences || [];
    
    if (experiences.length === 0) {
        container.innerHTML = '<p style="color: #64748b; padding: 20px; text-align: center;">No experiences added yet. Click "Add Experience" to create one.</p>';
        return;
    }
    
    // Sort: pinned first, then by order
    experiences.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return (a.order || 0) - (b.order || 0);
    });
    
    container.innerHTML = experiences.map((exp, index) => `
        <div class="admin-experience-item ${exp.pinned ? 'pinned' : ''}">
            <div class="item-info">
                <h4>${exp.pinned ? '📌 ' : ''}${escapeHTML(exp.title)}</h4>
                <p>${escapeHTML(exp.company)} | ${escapeHTML(exp.duration)}</p>
                <p>${escapeHTML((exp.description || '').substring(0, 60))}...</p>
                <small>${exp.images ? exp.images.length : 0} image(s)</small>
            </div>
            <div class="item-actions">
                <button class="btn btn-sm btn-outline" onclick="moveExperience('${exp.id}', 'up')" ${index === 0 ? 'disabled' : ''} title="Move Up">
                    <i class="fas fa-arrow-up"></i>
                </button>
                <button class="btn btn-sm btn-outline" onclick="moveExperience('${exp.id}', 'down')" ${index === experiences.length - 1 ? 'disabled' : ''} title="Move Down">
                    <i class="fas fa-arrow-down"></i>
                </button>
                <button class="btn btn-sm btn-outline" onclick="togglePinExperience('${exp.id}')" title="${exp.pinned ? 'Unpin' : 'Pin'}">
                    <i class="fas fa-thumbtack" style="color: ${exp.pinned ? 'var(--primary)' : 'inherit'}"></i>
                </button>
                <button class="btn btn-sm btn-outline" onclick="editExperience('${exp.id}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm" style="background: #ef4444; color: white;" onclick="deleteExperience('${exp.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * Show add experience form
 */
function showAddExperienceForm() {
    const container = document.getElementById('experienceFormContainer');
    const title = document.getElementById('experienceFormTitle');
    const form = document.getElementById('experienceForm');
    const preview = document.getElementById('experienceImagePreview');
    
    if (container) container.style.display = 'block';
    if (title) title.textContent = 'Add New Experience';
    if (form) form.reset();
    if (preview) preview.innerHTML = '';
    setInputValue('experienceId', '');
}

/**
 * Hide experience form
 */
function hideExperienceForm() {
    const container = document.getElementById('experienceFormContainer');
    if (container) container.style.display = 'none';
}

/**
 * Save experience (add or edit)
 */
function saveExperience(e) {
    e.preventDefault();
    
    const experienceId = document.getElementById('experienceId')?.value;
    const imageFiles = document.getElementById('experienceImages')?.files;
    const certFile = document.getElementById('experienceCert')?.files[0];
    
    const processExperience = function(imageDataArray, certData) {
        const experienceData = {
            id: experienceId || Date.now().toString(),
            title: document.getElementById('experienceTitle')?.value || '',
            company: document.getElementById('experienceCompany')?.value || '',
            duration: document.getElementById('experienceDuration')?.value || '',
            description: document.getElementById('experienceDesc')?.value || '',
            images: imageDataArray && imageDataArray.length > 0 ? imageDataArray : 
                    (experienceId ? (siteData.experiences.find(e => e.id === experienceId)?.images || []) : []),
            certFile: certData || (experienceId ? (siteData.experiences.find(e => e.id === experienceId)?.certFile || '') : ''),
            certLink: document.getElementById('experienceCertLink')?.value || '',
            pinned: experienceId ? (siteData.experiences.find(e => e.id === experienceId)?.pinned || false) : false,
            order: experienceId ? (siteData.experiences.find(e => e.id === experienceId)?.order) : siteData.experiences.length
        };
        
        if (!siteData.experiences) siteData.experiences = [];
        
        if (experienceId) {
            const index = siteData.experiences.findIndex(e => e.id === experienceId);
            if (index !== -1) {
                // Preserve existing images if no new ones uploaded
                if ((!imageDataArray || imageDataArray.length === 0) && siteData.experiences[index].images) {
                    experienceData.images = siteData.experiences[index].images;
                }
                if (!certData && siteData.experiences[index].certFile) {
                    experienceData.certFile = siteData.experiences[index].certFile;
                }
                siteData.experiences[index] = experienceData;
            }
        } else {
            siteData.experiences.push(experienceData);
        }
        
        saveData();
        loadAdminExperiences();
        hideExperienceForm();
    };
    
    // Handle multiple image uploads
    if (imageFiles && imageFiles.length > 0) {
        const imagePromises = [];
        for (let i = 0; i < imageFiles.length; i++) {
            const promise = new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = function(e) { resolve(e.target.result); };
                reader.readAsDataURL(imageFiles[i]);
            });
            imagePromises.push(promise);
        }
        
        Promise.all(imagePromises).then(imageDataArray => {
            if (certFile) {
                const reader = new FileReader();
                reader.onload = function(e) { processExperience(imageDataArray, e.target.result); };
                reader.readAsDataURL(certFile);
            } else {
                processExperience(imageDataArray, null);
            }
        });
    } else {
        if (certFile) {
            const reader = new FileReader();
            reader.onload = function(e) { processExperience(null, e.target.result); };
            reader.readAsDataURL(certFile);
        } else {
            processExperience(null, null);
        }
    }
}

/**
 * Edit experience
 */
function editExperience(experienceId) {
    const experience = siteData.experiences.find(e => e.id === experienceId);
    if (!experience) return;
    
    const container = document.getElementById('experienceFormContainer');
    const title = document.getElementById('experienceFormTitle');
    
    if (container) container.style.display = 'block';
    if (title) title.textContent = 'Edit Experience';
    
    setInputValue('experienceId', experience.id);
    setInputValue('experienceTitle', experience.title);
    setInputValue('experienceCompany', experience.company);
    setInputValue('experienceDuration', experience.duration);
    setInputValue('experienceDesc', experience.description);
    setInputValue('experienceCertLink', experience.certLink || '');
    
    // Show existing images preview
    const preview = document.getElementById('experienceImagePreview');
    if (preview && experience.images) {
        preview.innerHTML = experience.images.map(img => 
            `<img src="${img}" alt="Preview">`
        ).join('');
    }
}

/**
 * Delete experience
 */
function deleteExperience(experienceId) {
    if (confirm('Are you sure you want to delete this experience?')) {
        siteData.experiences = siteData.experiences.filter(e => e.id !== experienceId);
        saveData();
        loadAdminExperiences();
        loadDashboardStats();
    }
}

/**
 * Move experience up or down
 */
function moveExperience(experienceId, direction) {
    let experiences = [...siteData.experiences];
    experiences.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    const index = experiences.findIndex(e => e.id === experienceId);
    if (index === -1) return;
    
    if (direction === 'up' && index > 0) {
        [experiences[index], experiences[index - 1]] = [experiences[index - 1], experiences[index]];
    } else if (direction === 'down' && index < experiences.length - 1) {
        [experiences[index], experiences[index + 1]] = [experiences[index + 1], experiences[index]];
    }
    
    experiences.forEach((e, i) => e.order = i);
    siteData.experiences = experiences;
    saveData();
    loadAdminExperiences();
}

/**
 * Toggle pin status
 */
function togglePinExperience(experienceId) {
    const experience = siteData.experiences.find(e => e.id === experienceId);
    if (experience) {
        experience.pinned = !experience.pinned;
        saveData();
        loadAdminExperiences();
    }
}

// Update loadDashboardStats to include experience count
function loadDashboardStats() {
    const visitorEl = document.getElementById('visitorCount');
    const messageEl = document.getElementById('messageCount');
    const projectEl = document.getElementById('projectCount');
    const skillEl = document.getElementById('skillCount');
    const experienceEl = document.getElementById('experienceCount');
    
    if (visitorEl) visitorEl.textContent = localStorage.getItem('visitorCount') || '0';
    if (messageEl) messageEl.textContent = (siteData.messages?.length) || 0;
    if (projectEl) projectEl.textContent = (siteData.projects?.length) || 0;
    if (skillEl) skillEl.textContent = (siteData.skills?.length) || 0;
    if (experienceEl) experienceEl.textContent = (siteData.experiences?.length) || 0;
}

// Update initEventListeners to include experience form
function initEventListeners() {
    const profileForm = document.getElementById('profileForm');
    const singleImage = document.getElementById('singleImage');
    const projectForm = document.getElementById('projectForm');
    const skillForm = document.getElementById('skillForm');
    const experienceForm = document.getElementById('experienceForm');
    const resumeForm = document.getElementById('resumeForm');
    
    if (profileForm) profileForm.addEventListener('submit', saveProfile);
    if (singleImage) singleImage.addEventListener('change', handleImageUpload);
    if (projectForm) projectForm.addEventListener('submit', saveProject);
    if (skillForm) skillForm.addEventListener('submit', saveSkill);
    if (experienceForm) experienceForm.addEventListener('submit', saveExperience);
    if (resumeForm) resumeForm.addEventListener('submit', saveResume);
    
    // Experience image preview
    const experienceImages = document.getElementById('experienceImages');
    if (experienceImages) {
        experienceImages.addEventListener('change', function(e) {
            const preview = document.getElementById('experienceImagePreview');
            if (!preview) return;
            preview.innerHTML = '';
            for (let i = 0; i < e.target.files.length; i++) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    const img = document.createElement('img');
                    img.src = event.target.result;
                    img.alt = 'Preview ' + (i + 1);
                    preview.appendChild(img);
                };
                reader.readAsDataURL(e.target.files[i]);
            }
        });
    }
}
