import './style.css';
import confetti from 'canvas-confetti';
import {
  getCourses,
  getCourseById,
  saveCourse,
  deleteCourse,
  addLessonToCourse,
  addResourceToCourse,
  getUser,
  saveUser,
  isCourseEnrolled,
  enrollInCourse,
  markLessonComplete,
  getTransactions,
  getStudents,
  toggleStudentStatus,
  getSettings,
  saveSettings,
  resetAllDemoData
} from './data.js';

// Application State
const state = {
  currentView: window.location.hash === '#admin' ? 'admin' : 'student', // 'student' or 'admin'
  adminTab: 'dashboard', // 'dashboard', 'courses', 'students', 'transactions', 'settings'
  selectedCategory: 'all',
  searchQuery: '',
  activeCourseModal: null, // Course object when player modal is open
  activeLesson: null, // Currently playing lesson
  playerSidebarTab: 'curriculum', // 'curriculum', 'resources', 'quiz', 'certificate'
  checkoutCourse: null, // Course object when checkout is open
  appliedCoupon: null, // { code: 'SKILL50', discountPercent: 50 }
  activePdfModal: null, // Resource object for in-app PDF reader
  adminCourseModalOpen: false, // For Add/Edit Course
  adminLessonModalCourseId: null, // For Add Lesson
  adminResourceModalCourseId: null, // For Add PDF
  chartTimeframe: '30d' // '7d', '30d', '1y'
};

// Listen for hash change (#admin or #student)
window.addEventListener('hashchange', () => {
  state.currentView = window.location.hash === '#admin' ? 'admin' : 'student';
  renderApp();
});

// Main App Container
const appElement = document.getElementById('app');

function renderApp() {
  if (state.currentView === 'admin') {
    renderAdminView();
  } else {
    renderStudentView();
  }
}

// =========================================================================
// STUDENT PORTAL VIEW
// =========================================================================

function renderStudentView() {
  const user = getUser();
  const courses = getCourses();
  const settings = getSettings();

  // Filter courses by category and search
  const filteredCourses = courses.filter(c => {
    const matchesCategory = state.selectedCategory === 'all' || c.categorySlug === state.selectedCategory;
    const matchesSearch = !state.searchQuery || 
      c.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      c.tagline.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      c.instructor.name.toLowerCase().includes(state.searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const enrolledCount = user.enrolledCourseIds ? user.enrolledCourseIds.length : 0;

  appElement.innerHTML = `
    <!-- Flash Sale Top Banner -->
    <div class="flash-sale-bar">
      <span class="flash-sale-badge">⚡ FLASH SALE</span>
      <span>Get <strong>50% OFF</strong> all Masterclasses with coupon <strong class="flash-coupon-tag" id="btn-copy-flash-code" title="Click to apply SKILL50">SKILL50</strong></span>
      <span>• Ends in: <strong class="flash-timer-display" id="flash-timer">03h 48m 22s</strong></span>
    </div>

    <!-- Top Demo Ribbon -->
    <div class="demo-topbar">
      <div class="demo-topbar-info">
        <span class="demo-pill">Client Demo Mode</span>
        <span>🔥 SkillFlix Next-Gen Online Course & Subscription Platform</span>
      </div>
      <div class="demo-actions">
        <button id="btn-switch-admin" class="demo-switch-btn ${state.currentView === 'admin' ? 'active' : ''}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          Open Admin Panel (/admin)
        </button>
        <button id="btn-reset-demo" class="demo-switch-btn" title="Reset sample courses, transactions & user access">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          Reset Demo Data
        </button>
      </div>
    </div>

    <!-- Navigation Header -->
    <header class="navbar">
      <div class="container nav-wrapper">
        <div class="nav-brand" id="brand-logo">
          <div class="brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
          <span>${settings.platformName || 'SkillFlix'}</span>
        </div>

        <ul class="nav-links">
          <li class="nav-link active" data-nav="explore">Explore Masterclasses</li>
          <li class="nav-link" data-nav="mylearning">My Learning (${enrolledCount})</li>
          <li class="nav-link" data-nav="resources">PDF Library</li>
        </ul>

        <div class="nav-search">
          <svg class="nav-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input type="text" id="course-search-input" placeholder="Search courses, skills, instructors..." value="${state.searchQuery}" />
        </div>

        <div class="nav-user-area">
          <button id="nav-btn-admin" class="admin-badge-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 9h6v6H9z"/></svg>
            Admin Panel
          </button>
          <div class="user-profile-badge" id="user-badge" title="Logged in as ${user.name}">
            <img class="user-avatar-img" src="${user.avatar}" alt="${user.name}" />
            <span class="user-name-text">${user.name.split(' ')[0]}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-glow-blob"></div>
      <div class="container hero-content">
        <div class="hero-pill">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          ${settings.heroHeadline ? 'Exclusive 2026 Curriculum' : 'SkillFlix Masterclass Experience'}
        </div>
        <h1 class="hero-title">
          Stream World-Class Masterclasses. <br />
          <span class="text-gradient">Architect High-Impact Systems.</span>
        </h1>
        <p class="hero-subtitle">
          ${settings.heroSubheadline}
        </p>

        <div class="hero-cta-group">
          <button id="hero-btn-explore" class="btn-primary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
            Explore Catalog (${courses.length} Masterclasses)
          </button>
          <button id="hero-btn-trailer" class="btn-secondary">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Watch Platform Showreel
          </button>
        </div>

        <div class="hero-stats-row">
          <div class="hero-stat-item">
            <div class="stat-icon">🎓</div>
            <div>
              <div class="stat-num">45,000+</div>
              <div class="stat-label">Active Global Learners</div>
            </div>
          </div>
          <div class="hero-stat-item">
            <div class="stat-icon">⚡</div>
            <div>
              <div class="stat-num">4.94 / 5</div>
              <div class="stat-label">Top Rated Masterclasses</div>
            </div>
          </div>
          <div class="hero-stat-item">
            <div class="stat-icon">📜</div>
            <div>
              <div class="stat-num">100%</div>
              <div class="stat-label">Instant Access & Certification</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Trust Brands Marquee Bar -->
    <section class="trust-bar-section">
      <div class="container">
        <div class="trust-bar-heading">Engineers & Creators Trained from Global Tech Giants</div>
        <div class="trust-logos-row">
          <div class="trust-logo-item">Google</div>
          <div class="trust-logo-item">Meta</div>
          <div class="trust-logo-item">Netflix</div>
          <div class="trust-logo-item">Stripe</div>
          <div class="trust-logo-item">Amazon AWS</div>
          <div class="trust-logo-item">Microsoft</div>
          <div class="trust-logo-item">OpenAI</div>
          <div class="trust-logo-item">Razorpay</div>
        </div>
      </div>
    </section>

    <!-- Category Filter Bar -->
    <section class="category-filter-section" id="catalog-section">
      <div class="container category-filter-wrapper">
        <div class="category-pills">
          <button class="category-pill-btn ${state.selectedCategory === 'all' ? 'active' : ''}" data-cat="all">All Masterclasses</button>
          <button class="category-pill-btn ${state.selectedCategory === 'web-ai' ? 'active' : ''}" data-cat="web-ai">Web & AI Engineering</button>
          <button class="category-pill-btn ${state.selectedCategory === 'system-design' ? 'active' : ''}" data-cat="system-design">System Design</button>
          <button class="category-pill-btn ${state.selectedCategory === 'ui-ux' ? 'active' : ''}" data-cat="ui-ux">UI/UX & Product</button>
          <button class="category-pill-btn ${state.selectedCategory === 'cloud-devops' ? 'active' : ''}" data-cat="cloud-devops">Cloud & DevOps</button>
          <button class="category-pill-btn ${state.selectedCategory === 'finance' ? 'active' : ''}" data-cat="finance">Finance & Quant</button>
        </div>
        <div class="courses-count-badge">
          Showing <strong>${filteredCourses.length}</strong> masterclasses
        </div>
      </div>
    </section>

    <!-- Courses Grid Section -->
    <main class="courses-section">
      <div class="container">
        <div class="section-header">
          <div>
            <h2 class="section-title">Featured Masterclasses</h2>
            <p class="section-desc">Designed with industry leaders to take you from foundational understanding to staff-level mastery.</p>
          </div>
        </div>

        <div class="courses-grid">
          ${filteredCourses.map(course => renderCourseCard(course)).join('')}
        </div>
      </div>
    </main>

    <!-- Testimonials Section -->
    <section class="testimonials-section">
      <div class="container">
        <div style="text-align: center; max-width: 680px; margin: 0 auto;">
          <span style="font-size: 0.75rem; font-weight: 800; color: var(--accent-cyan); letter-spacing: 0.12em; text-transform: uppercase;">HALL OF FAME & REVIEWS</span>
          <h2 style="font-size: 2.2rem; font-weight: 800; color: #fff; margin-top: 0.4rem;">Loved by Tech Industry Leaders</h2>
          <p style="font-size: 0.95rem; color: var(--text-secondary); margin-top: 0.5rem;">See how our masterclasses, system blueprints and verifiable certificates shaped engineering careers.</p>
        </div>

        <div class="testimonials-grid">
          <div class="testimonial-card">
            <div class="testimonial-quote">
              "The Next.js 15 & AI SaaS Architecture course is easily the best investment I made this year. I deployed my own multi-tenant AI tool within 10 days and cracked a Staff Engineer interview at an AI unicorn!"
            </div>
            <div class="testimonial-author-row">
              <img class="author-avatar" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" alt="Kavita Iyer" />
              <div class="author-meta">
                <div class="author-name">Kavita Iyer</div>
                <div class="author-role">Staff Engineer @ Stripe</div>
                <div class="verified-buyer-badge">✓ Verified Masterclass Graduate</div>
              </div>
            </div>
          </div>

          <div class="testimonial-card">
            <div class="testimonial-quote">
              "Alex Rivera's System Design handbook and video breakdowns on Kafka and distributed sharding are gold. The production blueprints alone are worth 10x the course price. Truly top-tier."
            </div>
            <div class="testimonial-author-row">
              <img class="author-avatar" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80" alt="Rohan Mehra" />
              <div class="author-meta">
                <div class="author-name">Rohan Mehra</div>
                <div class="author-role">Senior Systems Architect @ Uber</div>
                <div class="verified-buyer-badge">✓ Verified Masterclass Graduate</div>
              </div>
            </div>
          </div>

          <div class="testimonial-card">
            <div class="testimonial-quote">
              "Instant payment through UPI and the course was immediately unlocked without waiting for admin approval. The Cinema Player mode and in-app PDF reader are silky smooth. Highly recommended!"
            </div>
            <div class="testimonial-author-row">
              <img class="author-avatar" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80" alt="Arjun Nambiar" />
              <div class="author-meta">
                <div class="author-name">Arjun Nambiar</div>
                <div class="author-role">Full-Stack Lead @ FinTech Labs</div>
                <div class="verified-buyer-badge">✓ Verified Masterclass Graduate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Accordion Section -->
    <section class="faq-section">
      <div class="container">
        <div style="text-align: center; max-width: 680px; margin: 0 auto;">
          <span style="font-size: 0.75rem; font-weight: 800; color: var(--accent-cyan); letter-spacing: 0.12em; text-transform: uppercase;">FREQUENTLY ASKED QUESTIONS</span>
          <h2 style="font-size: 2.2rem; font-weight: 800; color: #fff; margin-top: 0.4rem;">Everything You Need to Know</h2>
          <p style="font-size: 0.95rem; color: var(--text-secondary); margin-top: 0.5rem;">Transparent, student-friendly policies with instant automated course access.</p>
        </div>

        <div class="faq-container">
          <div class="faq-item active">
            <button class="faq-question-btn">
              <span>How soon do I get access after payment?</span>
              <span class="faq-icon">+</span>
            </button>
            <div class="faq-answer">
              Immediately! Our Razorpay and UPI webhooks instantly verify your payment, trigger automated course provisioning, and unlock all video lessons, PDF materials, and quizzes within 2 seconds.
            </div>
          </div>

          <div class="faq-item">
            <button class="faq-question-btn">
              <span>Can I read and download the PDF resources on mobile?</span>
              <span class="faq-icon">+</span>
            </button>
            <div class="faq-answer">
              Yes, all course cheat sheets, production architecture blueprints, and code compendiums can be viewed directly inside our built-in reader or downloaded for offline study on any smartphone, tablet, or laptop.
            </div>
          </div>

          <div class="faq-item">
            <button class="faq-question-btn">
              <span>Will I receive a verified certificate upon completion?</span>
              <span class="faq-icon">+</span>
            </button>
            <div class="faq-answer">
              Yes. Once you complete all module video lessons and pass the interactive module quiz with 80%+ score, an official verifiable SkillFlix Certificate with your unique credential ID and QR code is instantly generated.
            </div>
          </div>

          <div class="faq-item">
            <button class="faq-question-btn">
              <span>Is this a one-time payment or a recurring subscription?</span>
              <span class="faq-icon">+</span>
            </button>
            <div class="faq-answer">
              Each masterclass is a one-time payment with lifetime access. You get all future video updates, newly added cheat sheets, and course discussions without any recurring fees.
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding: 3rem 0; background: #040406; text-align: center; color: var(--text-muted); font-size: 0.875rem;">
      <div class="container">
        <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 0.75rem; font-family: var(--font-heading); font-size: 1.25rem; font-weight: 700; color: #fff;">
          <span style="color: var(--accent-cyan);">⚡</span> ${settings.platformName}
        </div>
        <p style="margin-bottom: 1rem;">Ultra-High Definition Video Masterclasses • Curated PDF Publications • Instant Automated Access</p>
        <div style="display: flex; justify-content: center; gap: 1.5rem; font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 1rem;">
          <a href="#catalog-section">All Courses</a>
          <a href="#admin">Admin Panel</a>
          <a href="javascript:void(0)" onclick="alert('256-bit SSL secured payments with Razorpay & UPI.')">Security</a>
          <a href="javascript:void(0)" onclick="alert('Instant student support: support@skillflix.io')">Support</a>
        </div>
        <p style="font-size: 0.75rem; color: #475569;">© 2026 SkillFlix Pro Inc. Built for World-Class EdTech Experiences.</p>
      </div>
    </footer>

    <!-- Floating Live Purchase Toast -->
    <div id="live-social-toast" class="live-social-toast hide">
      <img id="toast-avatar" class="toast-avatar" src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80" alt="Learner" />
      <div class="toast-content">
        <div id="toast-title" class="toast-title">Aman P. enrolled in System Design</div>
        <div id="toast-subtitle" class="toast-subtitle">Mastering High-Scale System Design</div>
        <div class="toast-time">
          <span class="pulse-dot"></span>
          <span id="toast-time-text">Verified Enrollment • 2 mins ago</span>
        </div>
      </div>
    </div>

    <!-- Modals Container -->
    <div id="modal-root"></div>
  `;

  attachStudentEvents();
  renderActiveModals();
}

// Course Card Component
function renderCourseCard(course) {
  const isEnrolled = isCourseEnrolled(course.id);
  const badgeClass = course.badge ? course.badge.toLowerCase().replace(/\s+/g, '-') : '';

  return `
    <div class="course-card" data-course-id="${course.id}">
      <div class="card-media">
        <img src="${course.thumbnail}" alt="${course.title}" loading="lazy" onerror="this.onerror=null;this.src='/hero-banner.jpg';" />
        ${course.badge ? `<span class="card-badge ${badgeClass}">${course.badge}</span>` : ''}
        <div class="card-play-overlay">
          <div class="play-circle-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
        </div>
      </div>

      <div class="card-content">
        <div class="card-meta-top">
          <span class="card-category">${course.category}</span>
          <span class="card-rating">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            ${course.rating} (${course.reviewsCount || 820})
          </span>
        </div>

        <h3 class="card-title">${course.title}</h3>
        <p class="card-tagline">${course.tagline}</p>

        <div class="card-stats-row">
          <span class="card-stat">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${course.duration}
          </span>
          <span class="card-stat">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            ${course.lessonsCount} Lessons
          </span>
          <span class="card-stat">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            ${course.pdfCount} PDFs
          </span>
        </div>

        <div class="card-instructor">
          <img class="instructor-avatar" src="${course.instructor.avatar}" alt="${course.instructor.name}" />
          <div class="instructor-info">
            <div class="instructor-name">${course.instructor.name}</div>
            <div class="instructor-role">${course.instructor.role}</div>
          </div>
        </div>

        <div class="card-footer">
          <div class="card-pricing">
            <span class="card-price">₹${course.price.toLocaleString('en-IN')}</span>
            <span class="card-original-price">₹${course.originalPrice.toLocaleString('en-IN')}</span>
          </div>

          ${isEnrolled ? `
            <button class="btn-card-action btn-card-enrolled btn-open-course" data-course-id="${course.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              Continue Learning
            </button>
          ` : `
            <button class="btn-card-action btn-enroll-now" data-course-id="${course.id}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
              Enroll Now
            </button>
          `}
        </div>
      </div>
    </div>
  `;
}

// =========================================================================
// EVENT BINDINGS (STUDENT VIEW)
// =========================================================================

function attachStudentEvents() {
  // Top ribbon view switchers
  document.getElementById('btn-switch-admin')?.addEventListener('click', () => {
    window.location.hash = '#admin';
  });

  document.getElementById('nav-btn-admin')?.addEventListener('click', () => {
    window.location.hash = '#admin';
  });

  document.getElementById('btn-reset-demo')?.addEventListener('click', () => {
    if (confirm('Reset all courses, demo orders, and student access to original high-end state?')) {
      resetAllDemoData();
      renderApp();
    }
  });

  document.getElementById('brand-logo')?.addEventListener('click', () => {
    window.location.hash = '';
    state.currentView = 'student';
    state.selectedCategory = 'all';
    state.searchQuery = '';
    renderApp();
  });

  // Nav Links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const nav = e.currentTarget.dataset.nav;
      if (nav === 'mylearning') {
        const user = getUser();
        const enrolled = getCourses().filter(c => user.enrolledCourseIds?.includes(c.id));
        if (enrolled.length > 0) {
          openCourseModal(enrolled[0]);
        } else {
          alert('You have not enrolled in any courses yet. Click "Enroll Now" on any course to experience the payment & instant unlock flow!');
        }
      } else if (nav === 'resources') {
        // Open first course with PDFs
        const courses = getCourses();
        openCourseModal(courses[0], 'resources');
      } else {
        document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Search input
  const searchInput = document.getElementById('course-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      renderApp();
      // Keep focus
      const updated = document.getElementById('course-search-input');
      if (updated) {
        updated.focus();
        updated.setSelectionRange(state.searchQuery.length, state.searchQuery.length);
      }
    });
  }

  // Category filter pills
  document.querySelectorAll('.category-pill-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      state.selectedCategory = e.currentTarget.dataset.cat;
      renderApp();
    });
  });

  // Hero Buttons
  document.getElementById('hero-btn-explore')?.addEventListener('click', () => {
    document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
  });

  document.getElementById('hero-btn-trailer')?.addEventListener('click', () => {
    const featured = getCourses()[0];
    openCourseModal(featured);
  });

  // Card Clicks (Open Modal or Checkout)
  document.querySelectorAll('.course-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const courseId = card.dataset.courseId;
      const course = getCourseById(courseId);
      if (!course) return;

      // If clicked on Enroll Now button
      if (e.target.closest('.btn-enroll-now')) {
        e.stopPropagation();
        openCheckoutModal(course);
        return;
      }

      // If clicked on Continue Learning button or card media
      openCourseModal(course);
    });
  });

  // Copy / Apply Flash Code
  document.getElementById('btn-copy-flash-code')?.addEventListener('click', () => {
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.1 } });
    alert('🎉 Promo Code SKILL50 applied! Opening checkout with 50% discount...');
    const featured = getCourses()[0];
    if (featured) {
      openCheckoutModal(featured);
      state.appliedCoupon = { code: 'SKILL50', discountPercent: 50 };
      renderActiveModals();
    }
  });

  // FAQ Accordion click
  document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-question-btn')?.addEventListener('click', () => {
      const wasActive = item.classList.contains('active');
      document.querySelectorAll('.faq-item').forEach(f => f.classList.remove('active'));
      if (!wasActive) item.classList.add('active');
    });
  });
}

// =========================================================================
// COURSE DETAILS & CINEMA PLAYER MODAL
// =========================================================================

function openCourseModal(course, initialTab = 'curriculum') {
  state.activeCourseModal = course;
  state.playerSidebarTab = initialTab;
  
  // Set first lesson as active by default
  if (course.modules && course.modules.length > 0 && course.modules[0].lessons.length > 0) {
    state.activeLesson = course.modules[0].lessons[0];
  } else {
    state.activeLesson = {
      title: 'Course Overview & Syllabus',
      videoUrl: course.trailerVideo,
      duration: '15:00',
      summary: course.tagline
    };
  }
  renderActiveModals();
}

function closeCourseModal() {
  state.activeCourseModal = null;
  state.activeLesson = null;
  renderActiveModals();
}

function renderPlayerModal() {
  const course = state.activeCourseModal;
  if (!course) return '';

  const isEnrolled = isCourseEnrolled(course.id);
  const user = getUser();
  const courseProg = user.courseProgress?.[course.id] || { completedLessons: [], quizScore: 0 };
  const currentLesson = state.activeLesson || {};
  const isLessonCompleted = courseProg.completedLessons?.includes(currentLesson.id);

  return `
    <div class="player-modal-backdrop" id="player-modal-backdrop">
      <div class="player-modal-container" id="player-modal-container">
        
        <!-- Player Header -->
        <div class="player-modal-header">
          <div class="player-header-title">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            <span class="player-course-name">${course.title}</span>
            <span class="player-lesson-badge">${isEnrolled ? 'Learner Access Active' : 'Free Preview Mode'}</span>
          </div>

          <div class="player-header-actions">
            ${!isEnrolled ? `
              <button class="btn-card-action" id="modal-btn-enroll-header" style="padding: 0.45rem 1rem;">
                Unlock Full Course (₹${course.price})
              </button>
            ` : ''}
            <button class="modal-close-btn" id="btn-close-player" title="Close Player">✕</button>
          </div>
        </div>

        <!-- Player Body (2 Columns) -->
        <div class="player-modal-body">
          
          <!-- Left: High Definition Cinema Player -->
          <div class="player-video-viewport">
            <div class="video-element-wrapper">
              <video 
                id="active-player-video" 
                class="main-course-video" 
                src="${currentLesson.videoUrl || course.trailerVideo}" 
                controls 
                autoplay 
                poster="${course.thumbnail}">
              </video>
            </div>

            <div class="player-info-bar">
              <h2 class="current-lesson-heading">${currentLesson.title || 'Course Lesson'}</h2>
              <p class="current-lesson-summary">${currentLesson.summary || course.tagline}</p>

              <div class="player-controls-row">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <span style="font-size: 0.8125rem; color: var(--text-muted);">
                    Instructor: <strong>${course.instructor.name}</strong> (${course.instructor.role})
                  </span>
                </div>

                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  ${isEnrolled ? `
                    <button id="btn-toggle-complete-lesson" class="btn-complete-lesson ${isLessonCompleted ? 'completed' : ''}">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                      ${isLessonCompleted ? 'Completed ✓' : 'Mark as Complete'}
                    </button>
                  ` : `
                    <button class="btn-card-action" id="btn-player-unlock-now">
                      Unlock Course to Track Progress
                    </button>
                  `}
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Interactive Curriculum & Resources Hub -->
          <div class="player-sidebar">
            <div class="sidebar-tab-nav" style="grid-template-columns: repeat(5, 1fr);">
              <button class="sidebar-tab-btn ${state.playerSidebarTab === 'curriculum' ? 'active' : ''}" data-tab="curriculum">
                Curriculum
              </button>
              <button class="sidebar-tab-btn ${state.playerSidebarTab === 'resources' ? 'active' : ''}" data-tab="resources">
                PDFs (${course.resources?.length || 0})
              </button>
              <button class="sidebar-tab-btn ${state.playerSidebarTab === 'notes' ? 'active' : ''}" data-tab="notes">
                Notes
              </button>
              <button class="sidebar-tab-btn ${state.playerSidebarTab === 'quiz' ? 'active' : ''}" data-tab="quiz">
                Quiz
              </button>
              <button class="sidebar-tab-btn ${state.playerSidebarTab === 'certificate' ? 'active' : ''}" data-tab="certificate">
                Certificate
              </button>
            </div>

            <div class="sidebar-tab-content">
              ${renderPlayerSidebarContent(course, isEnrolled, courseProg)}
            </div>
          </div>

        </div>
      </div>
    </div>
  `;
}

function renderPlayerSidebarContent(course, isEnrolled, courseProg) {
  if (state.playerSidebarTab === 'curriculum') {
    return `
      <div class="curriculum-accordion">
        ${course.modules?.map((mod, modIdx) => `
          <div class="module-block">
            <div class="module-header">
              <span>${mod.title}</span>
              <span style="font-size: 0.7rem; color: var(--text-muted);">${mod.lessons.length} lessons</span>
            </div>
            <ul class="lesson-list">
              ${mod.lessons.map(lesson => {
                const isActive = state.activeLesson?.id === lesson.id;
                const isCompleted = courseProg.completedLessons?.includes(lesson.id);
                const canPlay = isEnrolled || lesson.freePreview;

                return `
                  <li class="lesson-item ${isActive ? 'active' : ''} ${!canPlay ? 'locked' : ''}" data-lesson-id="${lesson.id}">
                    <div class="lesson-left">
                      ${canPlay ? (
                        isCompleted ? 
                          '<span style="color: var(--success);">✓</span>' : 
                          '<svg width="12" height="12" viewBox="0 0 24 24" fill="var(--accent-cyan)"><polygon points="5 3 19 12 5 21 5 3"/></svg>'
                      ) : (
                        '<span class="lesson-lock-icon">🔒</span>'
                      )}
                      <span>${lesson.title}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.4rem;">
                      ${lesson.freePreview && !isEnrolled ? '<span style="font-size: 0.65rem; background: rgba(0, 210, 255, 0.2); color: var(--accent-cyan); padding: 0.1rem 0.4rem; border-radius: 4px;">FREE</span>' : ''}
                      <span class="lesson-duration">${lesson.duration}</span>
                    </div>
                  </li>
                `;
              }).join('')}
            </ul>
          </div>
        `).join('') || '<p style="color: var(--text-muted); font-size: 0.8125rem;">No modules added yet.</p>'}
      </div>
    `;
  }

  if (state.playerSidebarTab === 'resources') {
    return `
      <div class="resources-tab-pane">
        <p style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 1rem;">
          Downloadable high-yield PDFs, code blueprints, and architecture diagrams:
        </p>
        ${course.resources?.map(res => `
          <div class="resource-card">
            <div class="resource-title">${res.title}</div>
            <div class="resource-desc">${res.description}</div>
            <div class="resource-meta">
              <span>📄 ${res.type} • ${res.size}</span>
              <button class="btn-resource-view" data-resource-id="${res.id}">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                Read PDF
              </button>
            </div>
          </div>
        `).join('') || '<p style="color: var(--text-muted); font-size: 0.8125rem;">No PDF materials attached yet.</p>'}
      </div>
    `;
  }

  if (state.playerSidebarTab === 'notes') {
    const savedNotes = localStorage.getItem('notes_' + course.id) || '';
    return `
      <div class="player-notes-wrap">
        <div style="font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
          <span>📝 Notes for <strong>${course.title.slice(0, 20)}...</strong></span>
          <span style="color: var(--success); font-size: 0.7rem;">⚡ Local & Cloud Sync</span>
        </div>
        <textarea id="course-student-notes" class="notes-textarea" placeholder="Type key architectural insights, code snippets, and timestamps here...">${savedNotes}</textarea>
        <button id="btn-save-student-notes" class="btn-primary" style="padding: 0.65rem; justify-content: center; font-size: 0.8125rem;">
          Save Notes to Workspace
        </button>
      </div>
    `;
  }

  if (state.playerSidebarTab === 'quiz') {
    return `
      <div class="quiz-container">
        <h4 style="font-size: 0.95rem; font-weight: 700; color: #fff; margin-bottom: 0.5rem;">Module Assessment</h4>
        <p style="font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 1rem;">Answer all questions correctly to qualify for your verified certificate.</p>
        
        ${course.quiz?.map((q, idx) => `
          <div class="quiz-card" data-quiz-idx="${idx}">
            <div class="quiz-q-text">Q${idx + 1}: ${q.question}</div>
            ${q.options.map((opt, optIdx) => `
              <label class="quiz-option-label">
                <input type="radio" name="quiz_q_${idx}" value="${optIdx}" style="margin-right: 0.5rem;" />
                ${opt}
              </label>
            `).join('')}
          </div>
        `).join('') || '<p style="color: var(--text-muted); font-size: 0.8125rem;">No quiz for this module.</p>'}

        <button id="btn-submit-quiz" class="btn-primary" style="width: 100%; justify-content: center; padding: 0.75rem; margin-top: 0.5rem;">
          Submit Answers & Verify
        </button>
      </div>
    `;
  }

  if (state.playerSidebarTab === 'certificate') {
    const user = getUser();
    return `
      <div style="text-align: center; padding: 1.5rem 0.5rem;">
        <div style="width: 64px; height: 64px; background: rgba(0, 210, 255, 0.15); border: 1px solid var(--accent-cyan); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: var(--accent-cyan); font-size: 1.75rem;">
          🏆
        </div>
        <h3 style="font-size: 1.15rem; font-weight: 800; color: #fff; margin-bottom: 0.35rem;">Course Completion Certificate</h3>
        <p style="font-size: 0.8125rem; color: var(--text-secondary); margin-bottom: 1.5rem;">
          Issued to <strong>${user.name}</strong> upon mastering all modules in ${course.title}.
        </p>

        <div style="background: #000000; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 12px; padding: 1.25rem; text-align: left; margin-bottom: 1.5rem; position: relative;">
          <div style="font-size: 0.7rem; color: var(--accent-cyan); font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;">SKILLFLIX VERIFIED CREDENTIAL</div>
          <div style="font-size: 1rem; font-weight: 700; color: #fff; margin: 0.4rem 0;">Certificate of Excellence</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">Recipient: ${user.name}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">Credential ID: SKFX-${Math.floor(100000 + Math.random() * 900000)}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">Date: ${new Date().toLocaleDateString()}</div>
        </div>

        <button id="btn-download-cert" class="btn-primary" style="width: 100%; justify-content: center; padding: 0.75rem;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          Download PDF Certificate
        </button>
      </div>
    `;
  }

  return '';
}

function attachPlayerEvents() {
  const backdrop = document.getElementById('player-modal-backdrop');
  if (!backdrop) return;

  // Close player
  document.getElementById('btn-close-player')?.addEventListener('click', closeCourseModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeCourseModal();
  });

  // Enroll button inside modal
  document.getElementById('modal-btn-enroll-header')?.addEventListener('click', () => {
    openCheckoutModal(state.activeCourseModal);
  });
  document.getElementById('btn-player-unlock-now')?.addEventListener('click', () => {
    openCheckoutModal(state.activeCourseModal);
  });

  // Mark lesson complete
  document.getElementById('btn-toggle-complete-lesson')?.addEventListener('click', () => {
    if (!state.activeCourseModal || !state.activeLesson) return;
    markLessonComplete(state.activeCourseModal.id, state.activeLesson.id);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
    renderActiveModals();
  });

  // Switch sidebar tabs
  document.querySelectorAll('.sidebar-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      state.playerSidebarTab = e.currentTarget.dataset.tab;
      const content = document.querySelector('.sidebar-tab-content');
      if (content && state.activeCourseModal) {
        const isEnrolled = isCourseEnrolled(state.activeCourseModal.id);
        const user = getUser();
        const prog = user.courseProgress?.[state.activeCourseModal.id] || {};
        content.innerHTML = renderPlayerSidebarContent(state.activeCourseModal, isEnrolled, prog);
        attachSidebarSubEvents();
      }
      document.querySelectorAll('.sidebar-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  attachSidebarSubEvents();
}

function attachSidebarSubEvents() {
  const course = state.activeCourseModal;
  if (!course) return;
  const isEnrolled = isCourseEnrolled(course.id);

  // Lesson list click
  document.querySelectorAll('.lesson-item').forEach(item => {
    item.addEventListener('click', () => {
      const lessonId = item.dataset.lessonId;
      // find lesson in course modules
      for (const mod of (course.modules || [])) {
        const found = mod.lessons.find(l => l.id === lessonId);
        if (found) {
          if (!isEnrolled && !found.freePreview) {
            alert('🔒 This lesson is part of the full curriculum. Enroll in the masterclass to unlock all lessons, videos and PDFs.');
            openCheckoutModal(course);
            return;
          }
          state.activeLesson = found;
          const video = document.getElementById('active-player-video');
          if (video) {
            video.src = found.videoUrl;
            video.play().catch(() => {});
          }
          const heading = document.querySelector('.current-lesson-heading');
          if (heading) heading.textContent = found.title;
          const summary = document.querySelector('.current-lesson-summary');
          if (summary) summary.textContent = found.summary || course.tagline;

          document.querySelectorAll('.lesson-item').forEach(li => li.classList.remove('active'));
          item.classList.add('active');
          break;
        }
      }
    });
  });

  // PDF View Button
  document.querySelectorAll('.btn-resource-view').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const resId = btn.dataset.resourceId;
      const res = course.resources?.find(r => r.id === resId);
      if (res) openPdfModal(res, course);
    });
  });

  // Submit Quiz Button
  document.getElementById('btn-submit-quiz')?.addEventListener('click', () => {
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    alert('🎉 Congratulations! 100% Score on Module Quiz. Your certificate is ready!');
    state.playerSidebarTab = 'certificate';
    const content = document.querySelector('.sidebar-tab-content');
    if (content) {
      const user = getUser();
      const prog = user.courseProgress?.[course.id] || {};
      content.innerHTML = renderPlayerSidebarContent(course, isEnrolled, prog);
      attachSidebarSubEvents();
    }
  });

  // Save Student Notes
  document.getElementById('btn-save-student-notes')?.addEventListener('click', () => {
    const textarea = document.getElementById('course-student-notes');
    if (textarea) {
      localStorage.setItem('notes_' + course.id, textarea.value);
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
      alert('✅ Your personal learning notes for this course have been saved to workspace!');
    }
  });

  // Download Certificate Button
  document.getElementById('btn-download-cert')?.addEventListener('click', () => {
    confetti({ particleCount: 100, spread: 100, origin: { y: 0.5 } });
    alert('📥 Official Certificate PDF generated & download started!');
  });
}

// =========================================================================
// IN-APP PDF READER MODAL
// =========================================================================

function openPdfModal(resource, course) {
  state.activePdfModal = { resource, course };
  renderActiveModals();
}

function closePdfModal() {
  state.activePdfModal = null;
  renderActiveModals();
}

function renderPdfModal() {
  if (!state.activePdfModal) return '';
  const { resource, course } = state.activePdfModal;

  return `
    <div class="pdf-modal-backdrop" id="pdf-modal-backdrop">
      <div class="pdf-viewer-container">
        
        <div class="pdf-toolbar">
          <div style="display: flex; align-items: center; gap: 0.65rem; color: #fff; font-weight: 700; font-size: 0.9375rem;">
            <span>📄</span>
            <span>${resource.title}</span>
            <span style="font-size: 0.75rem; background: rgba(0, 210, 255, 0.2); color: var(--accent-cyan); padding: 0.15rem 0.5rem; border-radius: 4px;">
              ${resource.pages || 24} Pages
            </span>
          </div>

          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <button id="btn-pdf-download" style="background: var(--accent-gradient); color: #fff; padding: 0.4rem 0.9rem; border-radius: 6px; font-size: 0.8125rem; font-weight: 700; display: flex; align-items: center; gap: 0.4rem;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Download PDF (${resource.size})
            </button>
            <button id="btn-close-pdf" class="modal-close-btn" style="width: 32px; height: 32px;">✕</button>
          </div>
        </div>

        <div class="pdf-doc-content">
          <div style="max-width: 720px; margin: 0 auto; background: #1e293b; padding: 2.5rem; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <div style="border-bottom: 2px solid var(--accent-cyan); padding-bottom: 1rem; margin-bottom: 1.5rem;">
              <span style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: 800; text-transform: uppercase;">SKILLFLIX MASTERCLASS PUBLICATION</span>
              <h1 style="font-size: 1.5rem; color: #fff; margin-top: 0.4rem;">${resource.title}</h1>
              <p style="color: var(--text-muted); font-size: 0.8125rem;">Course: ${course.title} • Instructor: ${course.instructor.name}</p>
            </div>

            <h3 style="color: #38bdf8; font-size: 1.1rem; margin-bottom: 0.6rem;">1. Executive Summary & Architecture Overview</h3>
            <p style="margin-bottom: 1.25rem;">
              This comprehensive reference document outlines production strategies, low-latency data structures, and edge deployments. Follow each module's code walkthrough to implement the recommended architectural patterns.
            </p>

            <div style="background: #0f172a; border-left: 4px solid var(--accent-cyan); padding: 1rem; border-radius: 4px; margin-bottom: 1.5rem; font-family: monospace; font-size: 0.8125rem; color: #7dd3fc;">
              // Core Production Pattern<br />
              export async function initializeHighScalePipeline(config: EnterpriseConfig) {<br />
              &nbsp;&nbsp;const cluster = await KafkaCluster.connect({ brokers: config.brokers });<br />
              &nbsp;&nbsp;return cluster.createIdempotentProducer({ retryAttempts: 5 });<br />
              }
            </div>

            <h3 style="color: #38bdf8; font-size: 1.1rem; margin-bottom: 0.6rem;">2. Production Checklist & Best Practices</h3>
            <ul style="padding-left: 1.25rem; margin-bottom: 1.5rem;">
              <li>Strict type invariants across all ingress payloads</li>
              <li>Distributed tracing headers (OpenTelemetry / W3C TraceContext)</li>
              <li>Graceful degradation circuit breakers for dependent microservices</li>
              <li>Zero-trust token verification with ephemeral session rotation</li>
            </ul>

            <div style="text-align: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1.25rem; font-size: 0.75rem; color: var(--text-muted);">
              Page 1 of ${resource.pages || 24} • SkillFlix Confidential Educational Material
            </div>
          </div>
        </div>

      </div>
    </div>
  `;
}

function attachPdfEvents() {
  const backdrop = document.getElementById('pdf-modal-backdrop');
  if (!backdrop) return;

  document.getElementById('btn-close-pdf')?.addEventListener('click', closePdfModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closePdfModal();
  });

  document.getElementById('btn-pdf-download')?.addEventListener('click', () => {
    alert('📥 PDF download initiated successfully!');
  });
}

// =========================================================================
// PAYMENT GATEWAY CHECKOUT MODAL (RAZORPAY / UPI / CARDS)
// =========================================================================

function openCheckoutModal(course) {
  state.checkoutCourse = course;
  state.appliedCoupon = null;
  renderActiveModals();
}

function closeCheckoutModal() {
  state.checkoutCourse = null;
  state.appliedCoupon = null;
  renderActiveModals();
}

function renderCheckoutModal() {
  const course = state.checkoutCourse;
  if (!course) return '';

  let finalPrice = course.price;
  let discountAmount = 0;
  if (state.appliedCoupon) {
    discountAmount = Math.round((course.price * state.appliedCoupon.discountPercent) / 100);
    finalPrice = course.price - discountAmount;
  }

  return `
    <div class="checkout-modal-backdrop" id="checkout-modal-backdrop">
      <div class="checkout-box">
        
        <div class="checkout-header">
          <div class="checkout-brand-title">
            <span style="color: var(--accent-cyan);">⚡</span>
            <span>SkillFlix Pay • Secure Checkout</span>
          </div>
          <button id="btn-close-checkout" class="modal-close-btn" style="width: 30px; height: 30px;">✕</button>
        </div>

        <div class="checkout-body">
          
          <div class="order-summary-card">
            <div class="order-title">${course.title}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">
              Includes: Full HD Video Lessons • ${course.pdfCount} PDFs • Lifetime Access • Verified Certificate
            </div>

            <div class="order-price-row">
              <span style="font-size: 0.8125rem; color: var(--text-secondary);">Course Price</span>
              <span style="font-weight: 700; color: #fff;">₹${course.price.toLocaleString('en-IN')}</span>
            </div>

            ${state.appliedCoupon ? `
              <div class="order-price-row" style="color: var(--success); border-top: none; padding-top: 0.25rem;">
                <span style="font-size: 0.8125rem;">Coupon (${state.appliedCoupon.code} - ${state.appliedCoupon.discountPercent}% OFF)</span>
                <span style="font-weight: 700;">-₹${discountAmount.toLocaleString('en-IN')}</span>
              </div>
            ` : ''}

            <div class="order-price-row" style="border-top: 1px dashed var(--border-medium); margin-top: 0.5rem; padding-top: 0.5rem;">
              <span style="font-weight: 700; color: #fff;">Total Payable</span>
              <span style="font-family: var(--font-heading); font-size: 1.35rem; font-weight: 800; color: var(--accent-cyan);">
                ₹${finalPrice.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <!-- Coupon Code Input -->
          <div class="coupon-box">
            <input type="text" id="coupon-code-input" class="coupon-input" placeholder="Enter coupon (e.g. SKILL50)" value="${state.appliedCoupon ? state.appliedCoupon.code : ''}" />
            <button id="btn-apply-coupon" class="btn-apply-coupon">
              ${state.appliedCoupon ? 'Applied ✓' : 'Apply'}
            </button>
          </div>

          <!-- Payment Methods Tabs -->
          <div class="payment-tabs">
            <button class="payment-tab-btn active" data-paytab="upi">Instant UPI / QR</button>
            <button class="payment-tab-btn" data-paytab="cards">Credit / Debit Card</button>
            <button class="payment-tab-btn" data-paytab="netbanking">Net Banking</button>
          </div>

          <!-- Tab 1: UPI & QR Code (Default) -->
          <div id="tab-upi-content">
            <div class="upi-qr-box">
              <div class="qr-image-mock">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="#000"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              </div>
              <div style="font-size: 0.8125rem; font-weight: 700; color: #111;">Scan with any UPI App</div>
              <div style="display: flex; justify-content: center; gap: 0.75rem; margin: 0.5rem 0; font-size: 0.75rem; color: #475569; font-weight: 600;">
                <span>• GPay</span> <span>• PhonePe</span> <span>• Paytm</span> <span>• Cred</span>
              </div>
              <div class="qr-timer">⏳ Dynamic QR expires in <strong id="qr-countdown">14:59</strong></div>
            </div>
          </div>

          <!-- Pay Button -->
          <button id="btn-complete-payment" class="btn-pay-now">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
            Pay ₹${finalPrice.toLocaleString('en-IN')} & Unlock Instantly
          </button>

          <div style="display: flex; align-items: center; justify-content: center; gap: 0.4rem; margin-top: 1rem; font-size: 0.7rem; color: var(--text-muted);">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            256-Bit SSL Encryption • Instant Automated Course Access
          </div>

        </div>

      </div>
    </div>
  `;
}

function attachCheckoutEvents() {
  const backdrop = document.getElementById('checkout-modal-backdrop');
  if (!backdrop) return;

  document.getElementById('btn-close-checkout')?.addEventListener('click', closeCheckoutModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeCheckoutModal();
  });

  // Coupon apply
  document.getElementById('btn-apply-coupon')?.addEventListener('click', () => {
    const input = document.getElementById('coupon-code-input');
    const val = input ? input.value.trim().toUpperCase() : '';
    if (val === 'SKILL50' || val === 'VIP50' || val === 'CLIENT') {
      state.appliedCoupon = { code: val, discountPercent: 50 };
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
      renderActiveModals();
    } else if (val) {
      alert('Invalid coupon code. Try using "SKILL50" for 50% discount!');
    }
  });

  // Payment tab switching
  document.querySelectorAll('.payment-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.payment-tab-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
    });
  });

  // Complete Payment Action
  document.getElementById('btn-complete-payment')?.addEventListener('click', () => {
    const course = state.checkoutCourse;
    if (!course) return;

    const btn = document.getElementById('btn-complete-payment');
    if (btn) {
      btn.innerHTML = `<span style="display: inline-block; animation: spin 1s infinite linear;">⏳</span> Verifying Payment with Razorpay...`;
      btn.style.opacity = '0.75';
      btn.disabled = true;
    }

    setTimeout(() => {
      let finalAmount = course.price;
      if (state.appliedCoupon) {
        finalAmount = Math.round((course.price * (100 - state.appliedCoupon.discountPercent)) / 100);
      }

      // Execute enrollment in data layer
      const result = enrollInCourse(course.id, {
        amount: finalAmount,
        gateway: 'Razorpay UPI (Verified)'
      });

      // Trigger celebration confetti
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 }
      });

      // Show Payment Success Dialog
      showPaymentSuccessModal(result.transaction, course);
    }, 1200);
  });
}

function showPaymentSuccessModal(transaction, course) {
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return;

  modalRoot.innerHTML = `
    <div class="checkout-modal-backdrop">
      <div class="checkout-box" style="max-width: 480px; text-align: center;">
        <div class="checkout-body success-card">
          <div class="success-icon-badge">✓</div>
          <h2 style="font-size: 1.5rem; font-weight: 800; color: #fff; margin-bottom: 0.35rem;">Payment Successful!</h2>
          <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1.5rem;">
            Your transaction has been verified. <strong>${course.title}</strong> has been instantly unlocked!
          </p>

          <div style="background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 1.25rem; text-align: left; margin-bottom: 1.5rem; font-size: 0.8125rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span style="color: var(--text-muted);">Transaction ID:</span>
              <strong style="color: #fff;">${transaction.id}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span style="color: var(--text-muted);">Order Ref:</span>
              <span style="color: var(--accent-cyan); font-family: monospace;">${transaction.orderId}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
              <span style="color: var(--text-muted);">Amount Paid:</span>
              <strong style="color: var(--success);">₹${transaction.amount.toLocaleString('en-IN')}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: var(--text-muted);">Status:</span>
              <span class="status-pill success">Instant Access Granted</span>
            </div>
          </div>

          <button id="btn-start-learning-now" class="btn-primary" style="width: 100%; justify-content: center; padding: 0.85rem; margin-bottom: 0.75rem;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
            Start Learning Now (Cinema Mode)
          </button>

          <button id="btn-download-receipt" class="btn-secondary" style="width: 100%; justify-content: center; padding: 0.75rem;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Download GST Tax Invoice
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('btn-start-learning-now')?.addEventListener('click', () => {
    closeCheckoutModal();
    renderApp();
    openCourseModal(course);
  });

  document.getElementById('btn-download-receipt')?.addEventListener('click', () => {
    alert(`📥 Tax Invoice PDF for ${transaction.id} downloaded successfully!`);
  });
}

function renderActiveModals() {
  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return;

  if (state.activeCourseModal) {
    modalRoot.innerHTML = renderPlayerModal();
    attachPlayerEvents();
  } else if (state.activePdfModal) {
    modalRoot.innerHTML = renderPdfModal();
    attachPdfEvents();
  } else if (state.checkoutCourse) {
    modalRoot.innerHTML = renderCheckoutModal();
    attachCheckoutEvents();
  } else {
    modalRoot.innerHTML = '';
  }
}

// =========================================================================
// ADMIN PANEL VIEW (Reference: https://skillflix-app.netlify.app/admin)
// =========================================================================

function renderAdminView() {
  const courses = getCourses();
  const transactions = getTransactions();
  const students = getStudents();
  const settings = getSettings();

  // Calculate live analytics
  const totalRevenue = transactions.reduce((acc, t) => acc + (t.amount || 0), 0);
  const activeStudentsCount = students.length;
  const activeCoursesCount = courses.length;

  appElement.innerHTML = `
    <!-- Top Demo Ribbon -->
    <div class="demo-topbar">
      <div class="demo-topbar-info">
        <span class="demo-pill">Admin Dashboard Mode</span>
        <span>⚡ SkillFlix Content Management System & Live Sales Analytics</span>
      </div>
      <div class="demo-actions">
        <button id="btn-switch-student" class="demo-switch-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
          Back to Student Portal
        </button>
        <button id="btn-admin-reset" class="demo-switch-btn">
          Reset Demo
        </button>
      </div>
    </div>

    <div class="admin-view">
      <!-- Admin Header -->
      <header class="admin-header">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <div class="brand-icon" style="width: 34px; height: 34px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
          <span style="font-family: var(--font-heading); font-size: 1.25rem; font-weight: 800; color: #fff;">
            ${settings.platformName} <span style="color: var(--accent-cyan); font-size: 0.85rem; font-weight: 700; background: rgba(0,210,255,0.15); padding: 0.2rem 0.5rem; border-radius: 4px; margin-left: 0.4rem;">ADMIN CMS</span>
          </span>
        </div>

        <div style="display: flex; align-items: center; gap: 1rem;">
          <div style="font-size: 0.8125rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.4rem;">
            <span style="display: inline-block; width: 8px; height: 8px; background: var(--success); border-radius: 50%; box-shadow: 0 0 8px var(--success);"></span>
            Live Node v22.18 • Real-time Sync
          </div>
          <button id="btn-admin-add-course-top" class="btn-primary" style="padding: 0.45rem 1.1rem; font-size: 0.8125rem;">
            + Create New Course
          </button>
        </div>
      </header>

      <!-- Admin Layout (Sidebar + Main) -->
      <div class="admin-body">
        
        <!-- Sidebar Navigation -->
        <aside class="admin-sidebar">
          <div class="admin-nav-item ${state.adminTab === 'dashboard' ? 'active' : ''}" data-admintab="dashboard">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
            Overview & Analytics
          </div>

          <div class="admin-nav-item ${state.adminTab === 'courses' ? 'active' : ''}" data-admintab="courses">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6 6h10"/><path d="M6 10h10"/></svg>
            Course Management (${courses.length})
          </div>

          <div class="admin-nav-item ${state.adminTab === 'students' ? 'active' : ''}" data-admintab="students">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Student Directory (${students.length})
          </div>

          <div class="admin-nav-item ${state.adminTab === 'transactions' ? 'active' : ''}" data-admintab="transactions">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
            Sales & Orders Ledger
          </div>

          <div class="admin-nav-item ${state.adminTab === 'settings' ? 'active' : ''}" data-admintab="settings">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            Platform & Payments
          </div>
        </aside>

        <!-- Main View Area -->
        <main class="admin-main">
          ${renderAdminTabContent(state.adminTab, { courses, transactions, students, settings, totalRevenue, activeStudentsCount, activeCoursesCount })}
        </main>

      </div>
    </div>

    <!-- Admin Modals Placeholder -->
    <div id="admin-modal-root"></div>
  `;

  attachAdminEvents();
  renderAdminModals();
}

function renderAdminTabContent(tab, data) {
  if (tab === 'dashboard') {
    return `
      <!-- KPI Metric Cards -->
      <div class="admin-metrics-grid">
        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-title">Total Platform Sales</span>
            <div class="metric-icon-wrap">₹</div>
          </div>
          <div class="metric-value">₹${data.totalRevenue.toLocaleString('en-IN')}</div>
          <div class="metric-trend up">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            +28.4% from last month
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-title">Enrolled Students</span>
            <div class="metric-icon-wrap">👥</div>
          </div>
          <div class="metric-value">${data.activeStudentsCount + 3410}</div>
          <div class="metric-trend up">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            +182 learners this week
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-title">Active Masterclasses</span>
            <div class="metric-icon-wrap">🎓</div>
          </div>
          <div class="metric-value">${data.activeCoursesCount} Courses</div>
          <div class="metric-trend up">
            <span>100% Published & Streaming</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-header">
            <span class="metric-title">Average Completion</span>
            <div class="metric-icon-wrap">📈</div>
          </div>
          <div class="metric-value">84.2%</div>
          <div class="metric-trend up">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            Industry benchmark: 32%
          </div>
        </div>
      </div>

      <!-- Live Revenue Analytics SVG Chart -->
      <div class="chart-card">
        <div class="chart-header">
          <div>
            <h3 style="font-size: 1.15rem; font-weight: 700; color: #fff;">Live Revenue & Enrollment Velocity</h3>
            <p style="font-size: 0.8125rem; color: var(--text-muted);">Real-time payment gateway throughput & daily student enrollment</p>
          </div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="demo-switch-btn ${state.chartTimeframe === '7d' ? 'active' : ''}" data-timeframe="7d">Last 7 Days</button>
            <button class="demo-switch-btn ${state.chartTimeframe === '30d' ? 'active' : ''}" data-timeframe="30d">Last 30 Days</button>
            <button class="demo-switch-btn ${state.chartTimeframe === '1y' ? 'active' : ''}" data-timeframe="1y">1 Year</button>
          </div>
        </div>

        <div class="chart-svg-wrap">
          <svg viewBox="0 0 900 240" width="100%" height="100%" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#00d2ff" stop-opacity="0.45"/>
                <stop offset="100%" stop-color="#00d2ff" stop-opacity="0.0"/>
              </linearGradient>
            </defs>
            
            <!-- Grid Lines -->
            <line x1="0" y1="40" x2="900" y2="40" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
            <line x1="0" y1="100" x2="900" y2="100" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
            <line x1="0" y1="160" x2="900" y2="160" stroke="rgba(255,255,255,0.05)" stroke-width="1" />
            <line x1="0" y1="220" x2="900" y2="220" stroke="rgba(255,255,255,0.08)" stroke-width="1" />

            <!-- Area Fill -->
            <polygon points="0,220 0,160 120,140 240,110 360,130 480,80 600,60 720,40 840,30 900,20 900,220" fill="url(#chartGradient)"/>

            <!-- Stroke Path -->
            <polyline 
              points="0,160 120,140 240,110 360,130 480,80 600,60 720,40 840,30 900,20" 
              fill="none" 
              stroke="#00d2ff" 
              stroke-width="3" 
              stroke-linecap="round"
            />

            <!-- Data Point Circles -->
            <circle cx="120" cy="140" r="5" fill="#00d2ff" stroke="#fff" stroke-width="2"/>
            <circle cx="240" cy="110" r="5" fill="#00d2ff" stroke="#fff" stroke-width="2"/>
            <circle cx="360" cy="130" r="5" fill="#00d2ff" stroke="#fff" stroke-width="2"/>
            <circle cx="480" cy="80" r="5" fill="#00d2ff" stroke="#fff" stroke-width="2"/>
            <circle cx="600" cy="60" r="5" fill="#00d2ff" stroke="#fff" stroke-width="2"/>
            <circle cx="720" cy="40" r="5" fill="#00d2ff" stroke="#fff" stroke-width="2"/>
            <circle cx="840" cy="30" r="5" fill="#00d2ff" stroke="#fff" stroke-width="2"/>
            <circle cx="900" cy="20" r="5" fill="#00d2ff" stroke="#fff" stroke-width="2"/>
          </svg>
        </div>
      </div>

      <!-- Recent Transactions Mini Table -->
      <div class="admin-table-card">
        <div class="table-header-bar">
          <h3 style="font-size: 1.05rem; font-weight: 700; color: #fff;">Recent Live Enrollments & Payments</h3>
          <span style="font-size: 0.75rem; color: var(--text-muted);">Auto-refreshed from Razorpay & UPI Webhooks</span>
        </div>
        <div class="table-wrapper">
          <table class="admin-data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Student</th>
                <th>Course</th>
                <th>Amount</th>
                <th>Payment Mode</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${data.transactions.slice(0, 5).map(t => `
                <tr>
                  <td style="font-family: monospace; color: var(--accent-cyan);">${t.id}</td>
                  <td><strong>${t.studentName}</strong><br/><span style="font-size: 0.75rem; color: var(--text-muted);">${t.studentEmail}</span></td>
                  <td style="max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${t.courseTitle}</td>
                  <td><strong style="color: #fff;">₹${t.amount.toLocaleString('en-IN')}</strong></td>
                  <td>${t.gateway}</td>
                  <td><span class="status-pill success">${t.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  if (tab === 'courses') {
    return `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
        <div>
          <h2 style="font-size: 1.5rem; font-weight: 800; color: #fff;">Course & Curriculum Management</h2>
          <p style="font-size: 0.875rem; color: var(--text-secondary);">Upload video lessons, attach study PDFs, set pricing and manage syllabus.</p>
        </div>
        <button id="btn-admin-add-course" class="btn-primary">
          + Create New Course
        </button>
      </div>

      <div class="admin-table-card">
        <div class="table-wrapper">
          <table class="admin-data-table">
            <thead>
              <tr>
                <th>Thumbnail & Title</th>
                <th>Category</th>
                <th>Price</th>
                <th>Modules / Lessons</th>
                <th>PDF Resources</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${data.courses.map(course => `
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                      <img src="${course.thumbnail}" onerror="this.onerror=null;this.src='/hero-banner.jpg';" style="width: 54px; height: 34px; object-fit: cover; border-radius: 4px;" />
                      <div>
                        <strong style="color: #fff; font-size: 0.875rem;">${course.title}</strong>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">Instructor: ${course.instructor.name}</div>
                      </div>
                    </div>
                  </td>
                  <td><span style="color: var(--accent-cyan); font-size: 0.8125rem;">${course.category}</span></td>
                  <td><strong style="color: #fff;">₹${course.price.toLocaleString('en-IN')}</strong></td>
                  <td>${course.lessonsCount || 0} Lessons</td>
                  <td>${course.pdfCount || 0} PDFs</td>
                  <td><span class="status-pill published">Published</span></td>
                  <td>
                    <div style="display: flex; gap: 0.4rem;">
                      <button class="btn-secondary btn-admin-add-lesson" data-course-id="${course.id}" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" title="Add Video Lesson">
                        + Video
                      </button>
                      <button class="btn-secondary btn-admin-add-pdf" data-course-id="${course.id}" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;" title="Upload PDF">
                        + PDF
                      </button>
                      <button class="btn-secondary btn-admin-delete-course" data-course-id="${course.id}" style="padding: 0.3rem 0.6rem; font-size: 0.75rem; color: var(--danger);" title="Delete Course">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  if (tab === 'students') {
    return `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
        <div>
          <h2 style="font-size: 1.5rem; font-weight: 800; color: #fff;">Registered Students & Learners</h2>
          <p style="font-size: 0.875rem; color: var(--text-secondary);">Manage learner access, view course progress, and handle enrollments.</p>
        </div>
      </div>

      <div class="admin-table-card">
        <div class="table-wrapper">
          <table class="admin-data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Enrolled Courses</th>
                <th>Total Investment</th>
                <th>Joined Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${data.students.map(student => `
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                      <img src="${student.avatar}" style="width: 34px; height: 34px; border-radius: 50%; object-fit: cover;" />
                      <div>
                        <strong style="color: #fff;">${student.name}</strong>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">${student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>${student.enrolledCourses?.length || 0} Courses</td>
                  <td><strong style="color: var(--success);">₹${(student.totalSpent || 0).toLocaleString('en-IN')}</strong></td>
                  <td>${student.joinedDate}</td>
                  <td>
                    <span class="status-pill ${student.status === 'Active' ? 'success' : 'draft'}">
                      ${student.status}
                    </span>
                  </td>
                  <td>
                    <button class="btn-secondary btn-toggle-student" data-student-id="${student.id}" style="padding: 0.3rem 0.7rem; font-size: 0.75rem;">
                      ${student.status === 'Active' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  if (tab === 'transactions') {
    return `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
        <div>
          <h2 style="font-size: 1.5rem; font-weight: 800; color: #fff;">Sales & Invoices Ledger</h2>
          <p style="font-size: 0.875rem; color: var(--text-secondary);">Every incoming transaction, payment gateway authorization, and GST receipt.</p>
        </div>
        <button id="btn-export-csv" class="btn-secondary" style="font-size: 0.8125rem;">
          📥 Export CSV Report
        </button>
      </div>

      <div class="admin-table-card">
        <div class="table-wrapper">
          <table class="admin-data-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Student</th>
                <th>Course Name</th>
                <th>Amount</th>
                <th>Payment Gateway</th>
                <th>Date / Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${data.transactions.map(t => `
                <tr>
                  <td style="font-family: monospace; color: var(--accent-cyan);">${t.id}</td>
                  <td><strong>${t.studentName}</strong><br/><span style="font-size: 0.75rem; color: var(--text-muted);">${t.studentEmail}</span></td>
                  <td>${t.courseTitle}</td>
                  <td><strong style="color: #fff;">₹${t.amount.toLocaleString('en-IN')}</strong></td>
                  <td>${t.gateway}</td>
                  <td style="font-size: 0.75rem; color: var(--text-muted);">${t.date}</td>
                  <td><span class="status-pill success">${t.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  if (tab === 'settings') {
    return `
      <div style="max-width: 720px;">
        <h2 style="font-size: 1.5rem; font-weight: 800; color: #fff; margin-bottom: 0.35rem;">Platform & Payment Gateway Configuration</h2>
        <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1.75rem;">Manage payment keys, platform branding, UPI IDs, and notifications.</p>

        <form id="admin-settings-form">
          <div class="form-group">
            <label class="form-label">Platform Name</label>
            <input type="text" id="setting-platformName" class="form-input" value="${data.settings.platformName}" />
          </div>

          <div class="form-group">
            <label class="form-label">Razorpay Key ID</label>
            <input type="text" id="setting-razorpayKey" class="form-input" value="${data.settings.razorpayKey}" />
            <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem; display: block;">
              Toggle between test credentials and live production keys.
            </span>
          </div>

          <div class="form-group">
            <label class="form-label">UPI VPA / QR ID</label>
            <input type="text" id="setting-upiId" class="form-input" value="${data.settings.upiId}" />
          </div>

          <div class="form-group">
            <label class="form-label">Support Email</label>
            <input type="email" id="setting-supportEmail" class="form-input" value="${data.settings.supportEmail}" />
          </div>

          <button type="submit" class="btn-primary" style="padding: 0.75rem 1.75rem; margin-top: 1rem;">
            Save Platform Settings
          </button>
        </form>
      </div>
    `;
  }

  return '';
}

function attachAdminEvents() {
  // Switch back to Student Portal
  document.getElementById('btn-switch-student')?.addEventListener('click', () => {
    window.location.hash = '';
    state.currentView = 'student';
    renderApp();
  });

  document.getElementById('btn-admin-reset')?.addEventListener('click', () => {
    if (confirm('Reset all demo data to initial sample courses?')) {
      resetAllDemoData();
      renderApp();
    }
  });

  // Sidebar Tab Switch
  document.querySelectorAll('.admin-nav-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      state.adminTab = e.currentTarget.dataset.admintab;
      renderAdminView();
    });
  });

  // Timeframe buttons
  document.querySelectorAll('[data-timeframe]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      state.chartTimeframe = e.currentTarget.dataset.timeframe;
      renderAdminView();
    });
  });

  // Create New Course Top / Body
  const handleOpenCourseModal = () => {
    state.adminCourseModalOpen = true;
    renderAdminModals();
  };
  document.getElementById('btn-admin-add-course-top')?.addEventListener('click', handleOpenCourseModal);
  document.getElementById('btn-admin-add-course')?.addEventListener('click', handleOpenCourseModal);

  // Add Lesson
  document.querySelectorAll('.btn-admin-add-lesson').forEach(btn => {
    btn.addEventListener('click', () => {
      state.adminLessonModalCourseId = btn.dataset.courseId;
      renderAdminModals();
    });
  });

  // Add PDF
  document.querySelectorAll('.btn-admin-add-pdf').forEach(btn => {
    btn.addEventListener('click', () => {
      state.adminResourceModalCourseId = btn.dataset.courseId;
      renderAdminModals();
    });
  });

  // Delete Course
  document.querySelectorAll('.btn-admin-delete-course').forEach(btn => {
    btn.addEventListener('click', () => {
      const courseId = btn.dataset.courseId;
      if (confirm('Are you sure you want to delete this course from the catalog?')) {
        deleteCourse(courseId);
        renderAdminView();
      }
    });
  });

  // Toggle student status
  document.querySelectorAll('.btn-toggle-student').forEach(btn => {
    btn.addEventListener('click', () => {
      const studentId = btn.dataset.studentId;
      toggleStudentStatus(studentId);
      renderAdminView();
    });
  });

  // Export CSV
  document.getElementById('btn-export-csv')?.addEventListener('click', () => {
    alert('📥 Exporting Sales Report as CSV. Download initiated!');
  });

  // Settings Save
  document.getElementById('admin-settings-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const updated = {
      platformName: document.getElementById('setting-platformName').value,
      razorpayKey: document.getElementById('setting-razorpayKey').value,
      upiId: document.getElementById('setting-upiId').value,
      supportEmail: document.getElementById('setting-supportEmail').value
    };
    saveSettings(updated);
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
    alert('✅ Platform & Payment settings saved successfully!');
    renderAdminView();
  });
}

function renderAdminModals() {
  const root = document.getElementById('admin-modal-root');
  if (!root) return;

  if (state.adminCourseModalOpen) {
    root.innerHTML = `
      <div class="admin-modal-backdrop" id="admin-course-backdrop">
        <div class="admin-modal-box">
          <div class="admin-modal-header">
            <h3 style="font-size: 1.15rem; font-weight: 700; color: #fff;">Create New Masterclass</h3>
            <button id="btn-close-course-modal" class="modal-close-btn" style="width: 32px; height: 32px;">✕</button>
          </div>
          <div class="admin-modal-body">
            <form id="new-course-form">
              <div class="form-group">
                <label class="form-label">Course Title</label>
                <input type="text" id="nc-title" class="form-input" required placeholder="e.g. Advanced Rust & WebAssembly Microservices" />
              </div>

              <div class="form-group">
                <label class="form-label">Tagline & Summary</label>
                <textarea id="nc-tagline" class="form-textarea" rows="2" required placeholder="High-throughput systems, zero-cost abstractions..."></textarea>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                  <label class="form-label">Category</label>
                  <select id="nc-category" class="form-select">
                    <option value="Web & AI Engineering">Web & AI Engineering</option>
                    <option value="System Design">System Design</option>
                    <option value="UI/UX & Product">UI/UX & Product</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                    <option value="Finance & Quant">Finance & Quant</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Badge</label>
                  <select id="nc-badge" class="form-select">
                    <option value="New Launch">New Launch</option>
                    <option value="Bestseller">Bestseller</option>
                    <option value="Staff Pick">Staff Pick</option>
                    <option value="Trending">Trending</option>
                  </select>
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                  <label class="form-label">Price (₹)</label>
                  <input type="number" id="nc-price" class="form-input" required value="2499" />
                </div>
                <div class="form-group">
                  <label class="form-label">Original MRP (₹)</label>
                  <input type="number" id="nc-original-price" class="form-input" required value="7999" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Instructor Name</label>
                <input type="text" id="nc-instructor-name" class="form-input" required value="Sarah Jenkins" />
              </div>

              <div class="form-group">
                <label class="form-label">Course Thumbnail URL</label>
                <input type="text" id="nc-thumbnail" class="form-input" value="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=900&q=80" />
              </div>

              <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; padding: 0.85rem; margin-top: 0.5rem;">
                Publish Course to SkillFlix Catalog
              </button>
            </form>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-close-course-modal')?.addEventListener('click', () => {
      state.adminCourseModalOpen = false;
      renderAdminModals();
    });

    document.getElementById('new-course-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const cat = document.getElementById('nc-category').value;
      const catSlug = cat.toLowerCase().includes('web') ? 'web-ai' :
                      cat.toLowerCase().includes('system') ? 'system-design' :
                      cat.toLowerCase().includes('ui') ? 'ui-ux' :
                      cat.toLowerCase().includes('cloud') ? 'cloud-devops' : 'finance';

      const newCourseData = {
        title: document.getElementById('nc-title').value,
        tagline: document.getElementById('nc-tagline').value,
        category: cat,
        categorySlug: catSlug,
        price: parseInt(document.getElementById('nc-price').value, 10),
        originalPrice: parseInt(document.getElementById('nc-original-price').value, 10),
        badge: document.getElementById('nc-badge').value,
        thumbnail: document.getElementById('nc-thumbnail').value || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=900&q=80',
        trailerVideo: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        duration: '18h 30m',
        lessonsCount: 1,
        pdfCount: 1,
        instructor: {
          name: document.getElementById('nc-instructor-name').value,
          role: 'Industry Specialist & Lead Engineer',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80'
        }
      };

      saveCourse(newCourseData);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      state.adminCourseModalOpen = false;
      renderAdminView();
    });
  } else if (state.adminLessonModalCourseId) {
    const course = getCourseById(state.adminLessonModalCourseId);
    root.innerHTML = `
      <div class="admin-modal-backdrop" id="admin-lesson-backdrop">
        <div class="admin-modal-box" style="max-width: 500px;">
          <div class="admin-modal-header">
            <h3 style="font-size: 1.15rem; font-weight: 700; color: #fff;">Add Video Lesson</h3>
            <button id="btn-close-lesson-modal" class="modal-close-btn" style="width: 32px; height: 32px;">✕</button>
          </div>
          <div class="admin-modal-body">
            <p style="font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 1.25rem;">Adding lesson to: <strong>${course?.title}</strong></p>
            <form id="new-lesson-form">
              <div class="form-group">
                <label class="form-label">Lesson Title</label>
                <input type="text" id="nl-title" class="form-input" required placeholder="e.g. 04. Zero-Downtime Blue-Green Deployment" />
              </div>
              <div class="form-group">
                <label class="form-label">Video Stream URL (MP4 / HLS / YouTube)</label>
                <input type="text" id="nl-url" class="form-input" value="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" />
              </div>
              <div class="form-group">
                <label class="form-label">Duration</label>
                <input type="text" id="nl-duration" class="form-input" value="28:45" />
              </div>
              <div class="form-group">
                <label class="form-label">Lesson Summary / Notes</label>
                <textarea id="nl-summary" class="form-textarea" rows="2" placeholder="Key takeaways and code walk..."></textarea>
              </div>
              <div class="form-group">
                <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8125rem; color: #fff; cursor: pointer;">
                  <input type="checkbox" id="nl-free-preview" />
                  Free Preview (Non-enrolled students can watch)
                </label>
              </div>
              <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; padding: 0.85rem;">
                Upload & Attach Video Lesson
              </button>
            </form>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-close-lesson-modal')?.addEventListener('click', () => {
      state.adminLessonModalCourseId = null;
      renderAdminModals();
    });

    document.getElementById('new-lesson-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      addLessonToCourse(state.adminLessonModalCourseId, {
        title: document.getElementById('nl-title').value,
        videoUrl: document.getElementById('nl-url').value,
        duration: document.getElementById('nl-duration').value,
        summary: document.getElementById('nl-summary').value,
        freePreview: document.getElementById('nl-free-preview').checked
      });
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      state.adminLessonModalCourseId = null;
      renderAdminView();
    });
  } else if (state.adminResourceModalCourseId) {
    const course = getCourseById(state.adminResourceModalCourseId);
    root.innerHTML = `
      <div class="admin-modal-backdrop" id="admin-pdf-backdrop">
        <div class="admin-modal-box" style="max-width: 500px;">
          <div class="admin-modal-header">
            <h3 style="font-size: 1.15rem; font-weight: 700; color: #fff;">Upload PDF Study Resource</h3>
            <button id="btn-close-pdf-modal" class="modal-close-btn" style="width: 32px; height: 32px;">✕</button>
          </div>
          <div class="admin-modal-body">
            <p style="font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 1.25rem;">Attaching to: <strong>${course?.title}</strong></p>
            <form id="new-pdf-form">
              <div class="form-group">
                <label class="form-label">Document Title</label>
                <input type="text" id="np-title" class="form-input" required placeholder="e.g. System Design Architectural Cheat Sheet 2026" />
              </div>
              <div class="form-group">
                <label class="form-label">Document Type</label>
                <select id="np-type" class="form-select">
                  <option value="PDF Guide">PDF Guide</option>
                  <option value="PDF Notes">PDF Notes</option>
                  <option value="Architecture Blueprint">Architecture Blueprint</option>
                  <option value="Code & Boilerplate">Code & Boilerplate</option>
                </select>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group">
                  <label class="form-label">File Size</label>
                  <input type="text" id="np-size" class="form-input" value="16.8 MB" />
                </div>
                <div class="form-group">
                  <label class="form-label">Pages</label>
                  <input type="number" id="np-pages" class="form-input" value="38" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Brief Description</label>
                <textarea id="np-desc" class="form-textarea" rows="2" placeholder="Summary of topics covered..."></textarea>
              </div>
              <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; padding: 0.85rem;">
                Attach PDF to Course Library
              </button>
            </form>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btn-close-pdf-modal')?.addEventListener('click', () => {
      state.adminResourceModalCourseId = null;
      renderAdminModals();
    });

    document.getElementById('new-pdf-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      addResourceToCourse(state.adminResourceModalCourseId, {
        title: document.getElementById('np-title').value,
        type: document.getElementById('np-type').value,
        size: document.getElementById('np-size').value,
        pages: parseInt(document.getElementById('np-pages').value, 10),
        description: document.getElementById('np-desc').value
      });
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      state.adminResourceModalCourseId = null;
      renderAdminView();
    });
  } else {
    root.innerHTML = '';
  }
}

// Initialize Application
renderApp();

// =========================================================================
// LUXURY ENGINES: Live Flash Sale Clock & Social Proof Purchase Loop
// =========================================================================

// 1. Flash Timer Clock (Countdown)
let flashSecondsRemaining = 13824; // ~3h 50m
setInterval(() => {
  flashSecondsRemaining = Math.max(0, flashSecondsRemaining - 1);
  const h = String(Math.floor(flashSecondsRemaining / 3600)).padStart(2, '0');
  const m = String(Math.floor((flashSecondsRemaining % 3600) / 60)).padStart(2, '0');
  const s = String(flashSecondsRemaining % 60).padStart(2, '0');
  const timerEl = document.getElementById('flash-timer');
  if (timerEl) {
    timerEl.textContent = `${h}h ${m}m ${s}s`;
  }
}, 1000);

// 2. Live Social Proof Purchase Ticker Loop
const SOCIAL_PROOF_EVENTS = [
  {
    name: 'Aman P.',
    city: 'Bengaluru',
    course: 'Mastering High-Scale System Design',
    time: '2 mins ago',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80'
  },
  {
    name: 'Sneha K.',
    city: 'Mumbai',
    course: 'UI/UX Design Mastery with Figma',
    time: 'just now',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80'
  },
  {
    name: 'Vikram S.',
    city: 'Delhi NCR',
    course: 'Algorithmic Trading & Financial Modeling',
    time: '4 mins ago',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80'
  },
  {
    name: 'Priya Sharma',
    city: 'Hyderabad',
    course: 'Full-Stack Next.js 15 & AI SaaS',
    time: '6 mins ago',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80'
  },
  {
    name: 'Dr. Rohan M.',
    city: 'Pune',
    course: 'Autonomous AI Agents & LangGraph',
    time: '8 mins ago',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
  }
];

let socialProofIndex = 0;
setInterval(() => {
  if (state.currentView !== 'student') return;
  const toast = document.getElementById('live-social-toast');
  if (!toast) return;

  const event = SOCIAL_PROOF_EVENTS[socialProofIndex];
  socialProofIndex = (socialProofIndex + 1) % SOCIAL_PROOF_EVENTS.length;

  const avatar = document.getElementById('toast-avatar');
  const title = document.getElementById('toast-title');
  const sub = document.getElementById('toast-subtitle');
  const time = document.getElementById('toast-time-text');

  if (avatar) avatar.src = event.avatar;
  if (title) title.textContent = `🔥 ${event.name} from ${event.city} enrolled`;
  if (sub) sub.textContent = event.course;
  if (time) time.textContent = `Verified Enrollment • ${event.time}`;

  toast.classList.remove('hide');

  // Hide toast after 4.5 seconds
  setTimeout(() => {
    toast.classList.add('hide');
  }, 4500);
}, 8000);
