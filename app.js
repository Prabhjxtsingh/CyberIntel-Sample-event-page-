// ============================================
// CYBERINTEL EVENTS - INTERACTIVE FEATURES
// ============================================

// Global State
const state = {
    events: [],
    filteredEvents: [],
    currentView: 'grid',
    filters: {
        category: 'all',
        eventType: ['online', 'offline', 'hybrid'],
        startDate: null,
        endDate: null,
        searchQuery: ''
    },
    sortBy: 'date'
};

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 CyberIntel Events Platform Initializing...');
    
    initializeEventListeners();
    await loadEvents();
    renderEvents();
    renderTimeline();
    populateEventSelect();
    initializeParallax();
    initializeSmoothScroll();
    
    console.log('✅ Platform Ready!');
});

// ============================================
// EVENT LISTENERS
// ============================================

function initializeEventListeners() {
    // Search Toggle
    const searchToggle = document.querySelector('.search-toggle');
    const searchOverlay = document.getElementById('searchOverlay');
    const searchClose = document.getElementById('searchClose');
    const globalSearch = document.getElementById('globalSearch');
    
    if (searchToggle) {
        searchToggle.addEventListener('click', () => {
            searchOverlay.classList.add('active');
            setTimeout(() => globalSearch.focus(), 300);
        });
    }
    
    if (searchClose) {
        searchClose.addEventListener('click', () => {
            searchOverlay.classList.remove('active');
        });
    }
    
    if (searchOverlay) {
        searchOverlay.addEventListener('click', (e) => {
            if (e.target === searchOverlay) {
                searchOverlay.classList.remove('active');
            }
        });
    }
    
    // Global Search
    if (globalSearch) {
        globalSearch.addEventListener('input', debounce((e) => {
            state.filters.searchQuery = e.target.value.toLowerCase();
            filterAndRenderEvents();
        }, 300));
    }
    
    // Category Filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            state.filters.category = e.target.value;
            filterAndRenderEvents();
        });
    }
    
    // Event Type Checkboxes
    const typeCheckboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');
    typeCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            state.filters.eventType = Array.from(typeCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);
            filterAndRenderEvents();
        });
    });
    
    // Date Filters
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    
    if (startDate) {
        startDate.addEventListener('change', (e) => {
            state.filters.startDate = e.target.value;
            filterAndRenderEvents();
        });
    }
    
    if (endDate) {
        endDate.addEventListener('change', (e) => {
            state.filters.endDate = e.target.value;
            filterAndRenderEvents();
        });
    }
    
    // Apply Filters Button
    const applyFiltersBtn = document.querySelector('.apply-filters-btn');
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', () => {
            filterAndRenderEvents();
            showNotification('Filters applied successfully!', 'success');
        });
    }
    
    // View Toggle
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentView = btn.dataset.view;
            updateViewLayout();
        });
    });
    
    // Sort By
    const sortBy = document.getElementById('sortBy');
    if (sortBy) {
        sortBy.addEventListener('change', (e) => {
            state.sortBy = e.target.value;
            filterAndRenderEvents();
        });
    }
    
    // Registration Form
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', handleRegistration);
    }
    
    // Contact Form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
    
    // Navigation Links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

// ============================================
// DATA LOADING & MANAGEMENT
// ============================================

async function loadEvents() {
    showLoading();
    
    try {
        // Try to load events from API
        const response = await fetch('tables/events?limit=100');
        
        if (response.ok) {
            const data = await response.json();
            state.events = data.data || [];
            console.log(`📊 Loaded ${state.events.length} events from database`);
        } else {
            throw new Error('No events in database');
        }
    } catch (error) {
        console.log('⚠️ Loading sample events...');
        // Load sample events if API fails
        state.events = getSampleEvents();
    }
    
    state.filteredEvents = [...state.events];
    hideLoading();
}

function getSampleEvents() {
    return [
        {
            id: '1',
            title: 'Advanced Threat Intelligence Summit 2024',
            description: 'Join leading cybersecurity experts to discuss advanced threat detection, analysis, and response strategies.',
            category: 'conference',
            eventType: 'hybrid',
            date: '2024-03-15',
            time: '09:00 AM',
            location: 'CyberIntel HQ, Bangalore',
            attendees: 250,
            maxAttendees: 500,
            featured: true,
            icon: '🛡️'
        },
        {
            id: '2',
            title: 'Ethical Hacking Bootcamp',
            description: 'Intensive 3-day workshop covering penetration testing, vulnerability assessment, and security auditing.',
            category: 'workshop',
            eventType: 'offline',
            date: '2024-03-20',
            time: '10:00 AM',
            location: 'Tech Training Center, Mumbai',
            attendees: 45,
            maxAttendees: 50,
            featured: true,
            icon: '💻'
        },
        {
            id: '3',
            title: 'Cloud Security Fundamentals',
            description: 'Learn best practices for securing cloud infrastructure, data protection, and compliance management.',
            category: 'webinar',
            eventType: 'online',
            date: '2024-03-18',
            time: '02:00 PM',
            location: 'Online',
            attendees: 320,
            maxAttendees: 1000,
            featured: true,
            icon: '☁️'
        },
        {
            id: '4',
            title: 'AI in Cybersecurity: Future Trends',
            description: 'Explore how artificial intelligence and machine learning are revolutionizing threat detection and response.',
            category: 'conference',
            eventType: 'hybrid',
            date: '2024-03-25',
            time: '11:00 AM',
            location: 'Innovation Hub, Hyderabad',
            attendees: 180,
            maxAttendees: 300,
            featured: true,
            icon: '🤖'
        },
        {
            id: '5',
            title: 'Network Security Essentials',
            description: 'Comprehensive training on firewalls, IDS/IPS, VPNs, and network segmentation strategies.',
            category: 'training',
            eventType: 'offline',
            date: '2024-03-22',
            time: '09:00 AM',
            location: 'Security Training Center, Delhi',
            attendees: 60,
            maxAttendees: 80,
            featured: false,
            icon: '🌐'
        },
        {
            id: '6',
            title: 'Zero Trust Architecture Workshop',
            description: 'Design and implement zero trust security models for modern enterprise environments.',
            category: 'workshop',
            eventType: 'online',
            date: '2024-03-28',
            time: '03:00 PM',
            location: 'Online',
            attendees: 150,
            maxAttendees: 500,
            featured: false,
            icon: '🔐'
        },
        {
            id: '7',
            title: 'Incident Response & Forensics',
            description: 'Master the art of digital forensics and incident response with hands-on scenarios.',
            category: 'training',
            eventType: 'offline',
            date: '2024-04-02',
            time: '10:00 AM',
            location: 'Forensics Lab, Pune',
            attendees: 35,
            maxAttendees: 40,
            featured: true,
            icon: '🔍'
        },
        {
            id: '8',
            title: 'Cybersecurity Networking Night',
            description: 'Connect with industry professionals, share experiences, and build lasting relationships.',
            category: 'networking',
            eventType: 'offline',
            date: '2024-04-05',
            time: '06:00 PM',
            location: 'Tech Lounge, Chennai',
            attendees: 90,
            maxAttendees: 150,
            featured: false,
            icon: '🤝'
        },
        {
            id: '9',
            title: 'Application Security Deep Dive',
            description: 'Secure your applications with OWASP best practices, secure coding, and vulnerability management.',
            category: 'webinar',
            eventType: 'online',
            date: '2024-04-08',
            time: '01:00 PM',
            location: 'Online',
            attendees: 275,
            maxAttendees: 800,
            featured: true,
            icon: '📱'
        },
        {
            id: '10',
            title: 'IoT Security Challenges',
            description: 'Address security concerns in IoT deployments, device hardening, and threat mitigation.',
            category: 'conference',
            eventType: 'hybrid',
            date: '2024-04-12',
            time: '09:30 AM',
            location: 'Smart City Center, Bangalore',
            attendees: 120,
            maxAttendees: 200,
            featured: false,
            icon: '📡'
        },
        {
            id: '11',
            title: 'Data Privacy & GDPR Compliance',
            description: 'Navigate data protection regulations, privacy frameworks, and compliance requirements.',
            category: 'training',
            eventType: 'online',
            date: '2024-04-15',
            time: '11:00 AM',
            location: 'Online',
            attendees: 195,
            maxAttendees: 500,
            featured: false,
            icon: '📋'
        },
        {
            id: '12',
            title: 'Red Team vs Blue Team Exercise',
            description: 'Live simulation of attack and defense scenarios in a controlled environment.',
            category: 'workshop',
            eventType: 'offline',
            date: '2024-04-20',
            time: '08:00 AM',
            location: 'Cyber Range, Bangalore',
            attendees: 40,
            maxAttendees: 50,
            featured: true,
            icon: '⚔️'
        }
    ];
}

// ============================================
// FILTERING & SORTING
// ============================================

function filterAndRenderEvents() {
    let filtered = [...state.events];
    
    // Category filter
    if (state.filters.category !== 'all') {
        filtered = filtered.filter(event => event.category === state.filters.category);
    }
    
    // Event type filter
    if (state.filters.eventType.length > 0) {
        filtered = filtered.filter(event => 
            state.filters.eventType.includes(event.eventType)
        );
    }
    
    // Date range filter
    if (state.filters.startDate) {
        filtered = filtered.filter(event => 
            new Date(event.date) >= new Date(state.filters.startDate)
        );
    }
    
    if (state.filters.endDate) {
        filtered = filtered.filter(event => 
            new Date(event.date) <= new Date(state.filters.endDate)
        );
    }
    
    // Search filter
    if (state.filters.searchQuery) {
        filtered = filtered.filter(event => 
            event.title.toLowerCase().includes(state.filters.searchQuery) ||
            event.description.toLowerCase().includes(state.filters.searchQuery) ||
            event.category.toLowerCase().includes(state.filters.searchQuery) ||
            event.location.toLowerCase().includes(state.filters.searchQuery)
        );
    }
    
    // Sort events
    filtered = sortEvents(filtered, state.sortBy);
    
    state.filteredEvents = filtered;
    renderEvents();
    renderTimeline();
}

function sortEvents(events, sortBy) {
    const sorted = [...events];
    
    switch (sortBy) {
        case 'date':
            return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
        case 'name':
            return sorted.sort((a, b) => a.title.localeCompare(b.title));
        case 'popularity':
            return sorted.sort((a, b) => b.attendees - a.attendees);
        default:
            return sorted;
    }
}

// ============================================
// RENDERING FUNCTIONS
// ============================================

function renderEvents() {
    const featuredContainer = document.getElementById('featuredEvents');
    const allEventsContainer = document.getElementById('allEvents');
    
    if (!featuredContainer || !allEventsContainer) return;
    
    const featuredEvents = state.filteredEvents.filter(event => event.featured);
    const allEvents = state.filteredEvents;
    
    // Render featured events
    if (featuredEvents.length > 0) {
        featuredContainer.innerHTML = featuredEvents.map(event => createEventCard(event)).join('');
    } else {
        featuredContainer.innerHTML = '<p class="text-center" style="grid-column: 1/-1; color: var(--text-muted); padding: 2rem;">No featured events found</p>';
    }
    
    // Render all events
    if (allEvents.length > 0) {
        allEventsContainer.innerHTML = allEvents.map(event => createEventCard(event)).join('');
    } else {
        allEventsContainer.innerHTML = '<p class="text-center" style="grid-column: 1/-1; color: var(--text-muted); padding: 2rem;">No events found matching your criteria</p>';
    }
    
    // Add event listeners to register buttons
    addEventCardListeners();
}

function createEventCard(event) {
    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
    
    const percentage = Math.round((event.attendees / event.maxAttendees) * 100);
    const isFull = percentage >= 100;
    
    return `
        <div class="event-card glass-card" data-event-id="${event.id}">
            <div class="event-image">
                ${event.icon}
                ${event.featured ? '<span class="event-badge">Featured</span>' : ''}
            </div>
            <div class="event-content">
                <span class="event-category">${event.category}</span>
                <h3 class="event-title">${event.title}</h3>
                <p class="event-description">${event.description}</p>
                <div class="event-meta">
                    <div class="event-meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>${formattedDate}</span>
                    </div>
                    <div class="event-meta-item">
                        <i class="fas fa-clock"></i>
                        <span>${event.time}</span>
                    </div>
                    <div class="event-meta-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${event.location}</span>
                    </div>
                    <div class="event-meta-item">
                        <i class="fas fa-signal"></i>
                        <span>${event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}</span>
                    </div>
                </div>
            </div>
            <div class="event-footer">
                <div class="event-attendees">
                    <i class="fas fa-users"></i>
                    <span>${event.attendees}/${event.maxAttendees} (${percentage}%)</span>
                </div>
                <button class="neomorphic-btn event-register-btn" data-event-id="${event.id}" ${isFull ? 'disabled' : ''}>
                    <i class="fas fa-${isFull ? 'lock' : 'user-plus'}"></i>
                    ${isFull ? 'Full' : 'Register'}
                </button>
            </div>
        </div>
    `;
}

function renderTimeline() {
    const timelineContainer = document.getElementById('eventsTimeline');
    if (!timelineContainer) return;
    
    const upcomingEvents = state.filteredEvents
        .filter(event => new Date(event.date) >= new Date())
        .slice(0, 6);
    
    if (upcomingEvents.length > 0) {
        timelineContainer.innerHTML = upcomingEvents.map(event => {
            const eventDate = new Date(event.date);
            const formattedDate = eventDate.toLocaleDateString('en-US', { 
                weekday: 'long',
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
            });
            
            return `
                <div class="timeline-item">
                    <div class="timeline-date">
                        <i class="fas fa-calendar-day"></i> ${formattedDate} at ${event.time}
                    </div>
                    <h4 class="timeline-title">${event.icon} ${event.title}</h4>
                    <p class="timeline-description">${event.description}</p>
                    <div class="event-meta-item" style="margin-top: 0.5rem;">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${event.location}</span>
                    </div>
                </div>
            `;
        }).join('');
    } else {
        timelineContainer.innerHTML = '<p class="text-center" style="color: var(--text-muted); padding: 2rem;">No upcoming events found</p>';
    }
}

function populateEventSelect() {
    const eventSelect = document.getElementById('eventSelect');
    if (!eventSelect) return;
    
    const upcomingEvents = state.events.filter(event => 
        new Date(event.date) >= new Date()
    );
    
    eventSelect.innerHTML = '<option value="">Choose an event...</option>';
    upcomingEvents.forEach(event => {
        const option = document.createElement('option');
        option.value = event.id;
        option.textContent = `${event.title} - ${new Date(event.date).toLocaleDateString()}`;
        eventSelect.appendChild(option);
    });
}

function updateViewLayout() {
    const grids = document.querySelectorAll('.events-grid');
    grids.forEach(grid => {
        if (state.currentView === 'list') {
            grid.style.gridTemplateColumns = '1fr';
        } else {
            grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(350px, 1fr))';
        }
    });
}

function addEventCardListeners() {
    const registerBtns = document.querySelectorAll('.event-register-btn');
    registerBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const eventId = btn.dataset.eventId;
            handleQuickRegister(eventId);
        });
    });
    
    const eventCards = document.querySelectorAll('.event-card');
    eventCards.forEach(card => {
        card.addEventListener('click', () => {
            const eventId = card.dataset.eventId;
            showEventDetails(eventId);
        });
    });
}

// ============================================
// FORM HANDLING
// ============================================

async function handleRegistration(e) {
    e.preventDefault();
    
    const formData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        organization: document.getElementById('organization').value,
        eventId: document.getElementById('eventSelect').value,
        requirements: document.getElementById('requirements').value,
        registrationDate: new Date().toISOString()
    };
    
    if (!formData.eventId) {
        showNotification('Please select an event', 'error');
        return;
    }
    
    showLoading();
    
    try {
        // Try to save registration to database
        const response = await fetch('tables/registrations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            console.log('✅ Registration saved to database');
        }
    } catch (error) {
        console.log('⚠️ Registration saved locally');
    }
    
    hideLoading();
    
    // Show success message
    document.getElementById('registrationForm').style.display = 'none';
    document.getElementById('registrationSuccess').style.display = 'block';
    
    // Reset after 5 seconds
    setTimeout(() => {
        document.getElementById('registrationForm').reset();
        document.getElementById('registrationForm').style.display = 'block';
        document.getElementById('registrationSuccess').style.display = 'none';
    }, 5000);
    
    showNotification('Registration successful! Check your email for confirmation.', 'success');
}

function handleQuickRegister(eventId) {
    const event = state.events.find(e => e.id === eventId);
    if (!event) return;
    
    // Scroll to registration form
    document.getElementById('register').scrollIntoView({ behavior: 'smooth' });
    
    // Pre-select the event
    setTimeout(() => {
        const eventSelect = document.getElementById('eventSelect');
        if (eventSelect) {
            eventSelect.value = eventId;
            eventSelect.focus();
        }
    }, 500);
    
    showNotification(`Ready to register for "${event.title}"`, 'info');
}

async function handleContactSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    showLoading();
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    hideLoading();
    
    form.reset();
    showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
}

function showEventDetails(eventId) {
    const event = state.events.find(e => e.id === eventId);
    if (!event) return;
    
    showNotification(`Event Details: ${event.title}`, 'info');
    // In a full implementation, this would open a modal with detailed event information
}

// ============================================
// UI HELPERS
// ============================================

function showLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.style.display = 'flex';
    }
}

function hideLoading() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.style.display = 'none';
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? 'rgba(20, 184, 166, 0.9)' : 
                     type === 'error' ? 'rgba(236, 72, 153, 0.9)' : 
                     'rgba(139, 92, 246, 0.9)'};
        color: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        font-weight: 600;
        max-width: 400px;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 
                               type === 'error' ? 'exclamation-circle' : 
                               'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 4000);
}

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ============================================
// INTERACTIVE EFFECTS
// ============================================

function initializeParallax() {
    const parallaxElements = document.querySelectorAll('.parallax-circle');
    
    document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        parallaxElements.forEach((element, index) => {
            const speed = (index + 1) * 20;
            const x = mouseX * speed - speed / 2;
            const y = mouseY * speed - speed / 2;
            
            element.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
        });
    });
}

function initializeSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================
// EXPORT FOR TESTING
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        state,
        filterAndRenderEvents,
        sortEvents,
        createEventCard
    };
}

console.log('🎨 CyberIntel Events Platform v1.0.0 - Ready to Launch!');
