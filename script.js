

'use strict';


function normalizeEmailJsId(value) {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/[\u200B-\u200D\uFEFF]/g, '');
}

const EMAILJS_PUBLIC_KEY = normalizeEmailJsId('lX87LBdkxp1EoBjla');
const EMAILJS_SERVICE_ID = normalizeEmailJsId('service_hapdhca');
const EMAILJS_TEMPLATE_ID = normalizeEmailJsId('template_can6hi4');

/** Required by @emailjs/browser v4 for every request (init + optional per-send override). */
const emailJsOptions = { publicKey: EMAILJS_PUBLIC_KEY };

(function warnIfEmailJsIdsLookWrong() {
  if (typeof console === 'undefined' || !console.warn) return;
  if (EMAILJS_SERVICE_ID && !EMAILJS_SERVICE_ID.startsWith('service_')) {
    console.warn(
      '[EmailJS] SERVICE_ID should start with "service_". Check you did not paste the template ID here.'
    );
  }
  if (EMAILJS_TEMPLATE_ID && !EMAILJS_TEMPLATE_ID.startsWith('template_')) {
    console.warn(
      '[EmailJS] TEMPLATE_ID should start with "template_". Copy it from the template settings in the dashboard.'
    );
  }
})();

function initEmailJs() {
  if (typeof emailjs === 'undefined') return false;
  emailjs.init(emailJsOptions);
  return true;
}

function emailJsFailureDetail(err) {
  if (!err) return '';
  const status = typeof err.status === 'number' ? ` (${err.status})` : '';
  const text = typeof err.text === 'string' ? err.text.trim() : '';
  if (text) return text + status;
  if (err.message) return err.message;
  return '';
}

initEmailJs();

/* ===== NAVBAR: Scroll & Mobile Toggle ===== */
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  if (window.scrollY > 30) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  updateActiveNavLink();
});

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  navbar.classList.toggle('menu-open');
});

// Close mobile menu on link click
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navbar.classList.remove('menu-open');
  });
});

/* ===== ACTIVE NAV LINK on scroll ===== */
const sections = document.querySelectorAll('section[id]');

function updateActiveNavLink() {
  const scrollPos = window.scrollY + 100;
  sections.forEach(section => {
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;
    const id = section.getAttribute('id');
    const link = document.querySelector(`.nav-link[href="#${id}"]`);
    if (link) {
      if (scrollPos >= top && scrollPos < bottom) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    }
  });
}

/* ===== SERVICE TABS ===== */
const tabs = document.querySelectorAll('.service-tab');
const panels = document.querySelectorAll('.service-panel');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;

    tabs.forEach(t => t.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));

    tab.classList.add('active');
    const panel = document.getElementById(`tab-${target}`);
    if (panel) {
      panel.classList.add('active');
      // Trigger reveal animations in the newly shown panel
      panel.querySelectorAll('.reveal').forEach(el => {
        el.classList.add('visible');
      });
    }
  });
});

/* ===== BOOKING FORM: Dynamic service options ===== */
/* Labels match service cards + pricing on index.html */
const servicesByCategory = {
  'Car Washing & Detailing': ['Exterior Wash'],
  /* Match driveway pricing table labels (index.html) */
  'Driveway Cleaning': [
    'Pressure Wash',
  ],
  'Window Cleaning': [
    'Exterior Windows',
    'Interior Windows',
    'Full Window Package',
    'Small Commercial'
  ],
  /* Prices match bundle cards (from $35 + $120 + $100 “from” pricing) */
  'Bundle Package': [
    'Car + Driveway Bundle ($135)',
    'The Full Package ($225)',
    'Home Refresh ($185)'
  ]
};

const categorySelect = document.getElementById('bk-category');
const serviceSelect = document.getElementById('bk-service');

if (categorySelect && serviceSelect) {
  categorySelect.addEventListener('change', () => {
    const category = categorySelect.value;
    serviceSelect.innerHTML = '';

    if (!category) {
      serviceSelect.innerHTML = '<option value="">Select service type first...</option>';
      return;
    }

    const options = servicesByCategory[category] || [];
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Choose a service...';
    serviceSelect.appendChild(placeholder);

    options.forEach(opt => {
      const el = document.createElement('option');
      el.value = opt;
      el.textContent = opt;
      serviceSelect.appendChild(el);
    });
  });
}

/* ===== Set min date on booking form ===== */
const dateInput = document.getElementById('bk-date');
if (dateInput) {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];
  dateInput.setAttribute('min', minDate);
}

/* ===== BOOKING FORM VALIDATION & SUBMIT ===== */
const bookingForm = document.getElementById('bookingForm');
const bookingConfirm = document.getElementById('bookingConfirm');
const submitBtn = document.getElementById('submitBtn');

const bookingValidations = {
  'bk-name':     { required: true, min: 2, label: 'Full name' },
  'bk-phone':    { required: true, pattern: /^[\d\s\+\-\(\)]{8,15}$/, label: 'Phone number' },
  'bk-email':    { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, label: 'Email address' },
  'bk-address':  { required: true, min: 5, label: 'Address' },
  'bk-category': { required: true, label: 'Service category' },
  'bk-service':  { required: true, label: 'Specific service' },
  'bk-date':     { required: true, label: 'Date' },
  'bk-time':     { required: true, label: 'Time' }
};

function validateField(fieldId, rules) {
  const field = document.getElementById(fieldId);
  const errEl = document.getElementById(`err-${fieldId.replace('bk-', '')}`);
  if (!field) return true;

  const val = field.value.trim();
  let error = '';

  if (rules.required && !val) {
    error = `${rules.label} is required.`;
  } else if (val && rules.min && val.length < rules.min) {
    error = `${rules.label} must be at least ${rules.min} characters.`;
  } else if (val && rules.pattern && !rules.pattern.test(val)) {
    error = `Please enter a valid ${rules.label.toLowerCase()}.`;
  }

  if (errEl) errEl.textContent = error;
  field.style.borderColor = error ? '#e06b6b' : '';
  return !error;
}

if (bookingForm) {
  // Real-time validation
  Object.keys(bookingValidations).forEach(id => {
    const field = document.getElementById(id);
    if (field) {
      field.addEventListener('blur', () => validateField(id, bookingValidations[id]));
    }
  });

  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    let valid = true;
    Object.keys(bookingValidations).forEach(id => {
      if (!validateField(id, bookingValidations[id])) valid = false;
    });

    if (!valid) return;

    // Collect form data
    const data = {};
    new FormData(bookingForm).forEach((val, key) => { data[key] = val; });

    // Show loading state
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoad = submitBtn.querySelector('.btn-loading');
    submitBtn.disabled = true;
    if (btnText) btnText.style.display = 'none';
    if (btnLoad) btnLoad.style.display = 'inline';

    try {
      if (typeof emailjs === 'undefined') {
        throw new Error('EmailJS failed to load');
      }
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          name: data.name,
          phone: data.phone,
          email: data.email,
          address: data.address,
          category: data.category,
          service: data.service,
          date: data.date,
          time: data.time,
          notes: data.notes || ''
        },
        emailJsOptions
      );
      bookingForm.style.display = 'none';
      bookingConfirm.style.display = 'block';
    } catch (err) {
      const detail = emailJsFailureDetail(err);
      console.error('EmailJS booking send failed', err, detail || undefined, {
        service: EMAILJS_SERVICE_ID,
        template: EMAILJS_TEMPLATE_ID
      });
      alert(
        'Could not send your booking.' +
          (detail ? '\n\n' + detail : '') +
          '\n\nCheck the browser console (F12) or call 0468 549 363.'
      );
    } finally {
      submitBtn.disabled = false;
      if (btnText) btnText.style.display = 'inline';
      if (btnLoad) btnLoad.style.display = 'none';
    }
  });
}

/* ===== CONTACT FORM SUBMIT ===== */
const contactForm = document.getElementById('contactForm');
const contactConfirm = document.getElementById('contactConfirm');
const ctSubmitBtn = document.getElementById('ctSubmitBtn');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('ct-name').value.trim();
    const email = document.getElementById('ct-email').value.trim();
    const message = document.getElementById('ct-message').value.trim();

    if (!name || !email || !message) {
      alert('Please fill in all required fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    ctSubmitBtn.disabled = true;
    ctSubmitBtn.textContent = 'Sending...';

    const phone = document.getElementById('ct-phone').value.trim();

    try {
      if (typeof emailjs === 'undefined') {
        throw new Error('EmailJS failed to load');
      }
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          name,
          email,
          phone: phone || 'Not provided',
          address: '—',
          category: 'Website enquiry',
          service: 'Contact form',
          date: '—',
          time: '—',
          notes: message
        },
        emailJsOptions
      );
      contactForm.style.display = 'none';
      contactConfirm.style.display = 'block';
    } catch (err) {
      const detail = emailJsFailureDetail(err);
      console.error('EmailJS contact send failed', err, detail || undefined, {
        service: EMAILJS_SERVICE_ID,
        template: EMAILJS_TEMPLATE_ID
      });
      alert(
        'Could not send your message.' +
          (detail ? '\n\n' + detail : '') +
          '\n\nCheck the browser console (F12) or call 0468 549 363.'
      );
    } finally {
      ctSubmitBtn.disabled = false;
      ctSubmitBtn.textContent = 'Send Message';
    }
  });
}

/* ===== SCROLL REVEAL ANIMATION ===== */
function addRevealClasses() {
  const targets = document.querySelectorAll(
    '.intro-card, .why-item, .testimonial-card, .service-card, ' +
    '.pricing-block, .bundle-card, .gallery-item, .about-stat-card, ' +
    '.contact-detail'
  );
  targets.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.transitionDelay = `${(i % 4) * 0.08}s`;
  });
}

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

function observeReveal() {
  document.querySelectorAll('.reveal').forEach(el => {
    revealObserver.observe(el);
  });
}

/* ===== SMOOTH SCROLL for anchor links ===== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const offset = 75;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ===== BEFORE/AFTER hover interaction (visual enhancement) ===== */
document.querySelectorAll('.gallery-before-after').forEach(container => {
  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const divider = container.querySelector('.ba-divider');
    const afterHalf = container.querySelector('.ba-after');
    if (divider && afterHalf) {
      const clampedX = Math.max(10, Math.min(90, x));
      divider.style.left = `${clampedX}%`;
      afterHalf.style.clipPath = `inset(0 0 0 ${clampedX}%)`;
    }
  });
  container.addEventListener('mouseleave', () => {
    const divider = container.querySelector('.ba-divider');
    const afterHalf = container.querySelector('.ba-after');
    if (divider && afterHalf) {
      divider.style.left = '50%';
      afterHalf.style.clipPath = 'inset(0 0 0 50%)';
    }
  });
  // Init
  const afterHalf = container.querySelector('.ba-after');
  if (afterHalf) afterHalf.style.clipPath = 'inset(0 0 0 50%)';
});

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  addRevealClasses();
  observeReveal();
  // Also observe on tab switch (already handled in tab click, kept for safety)
});

// Also run after a short delay to catch anything missed
setTimeout(() => {
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 40) {
      el.classList.add('visible');
    }
  });
}, 300);
