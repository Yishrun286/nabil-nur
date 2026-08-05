// ===================================================================
// NABIL. — site interactions
// ===================================================================
(() => {
  'use strict';

  /* ---------- Config: business contact numbers ---------- */
  const TELEGRAM_USERNAME = 'Nebilnur1';
  const WHATSAPP_NUMBER   = '+251 93 030 5014';       // replace with real number, no +

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile nav toggle ---------- */
  const burgerBtn = document.getElementById('burgerBtn');
  const mainNav = document.getElementById('mainNav');
  if (burgerBtn && mainNav) {
    burgerBtn.addEventListener('click', () => {
      mainNav.classList.toggle('open');
      burgerBtn.classList.toggle('active');
    });
    mainNav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        mainNav.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    });
  }

  /* ---------- Header shrink / active link on scroll ---------- */
  const header = document.getElementById('header');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const onScroll = () => {
    if (header) header.style.boxShadow = window.scrollY > 20 ? '0 6px 24px rgba(0,0,0,0.35)' : 'none';

    let currentId = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 140;
      if (window.scrollY >= top) currentId = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Animated stat counters (hero) ---------- */
  const statNums = document.querySelectorAll('.stat-num');
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const isDecimal = String(el.dataset.count).includes('.');
    const duration = 1400;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = (isDecimal ? value.toFixed(1) : Math.round(value)) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if ('IntersectionObserver' in window) {
    const statObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    statNums.forEach(el => statObserver.observe(el));
  } else {
    statNums.forEach(animateCount);
  }

  /* ---------- Scroll reveal for cards/sections ---------- */
  const revealTargets = document.querySelectorAll('.video-card, .product-card, .pillar, .acc-item');
  if ('IntersectionObserver' in window) {
    revealTargets.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealTargets.forEach(el => revealObserver.observe(el));
  }

  /* ---------- Accordion (brand packages) ---------- */
  const accItems = document.querySelectorAll('.acc-item');
  accItems.forEach(item => {
    const head = item.querySelector('.acc-head');
    head.addEventListener('click', () => {
      const wasActive = item.classList.contains('active');
      accItems.forEach(i => i.classList.remove('active'));
      if (!wasActive) item.classList.add('active');
    });
  });

  /* ---------- Product quantity selectors ---------- */
  document.querySelectorAll('.qty-control').forEach(control => {
    const minus = control.querySelector('.minus');
    const plus = control.querySelector('.plus');
    const valEl = control.querySelector('.qty-val');

    const setQty = (n) => {
      const qty = Math.max(1, Math.min(20, n));
      control.dataset.qty = qty;
      valEl.textContent = qty;
    };
    minus.addEventListener('click', () => setQty(parseInt(control.dataset.qty, 10) - 1));
    plus.addEventListener('click', () => setQty(parseInt(control.dataset.qty, 10) + 1));
  });

  /* ---------- Order modal ---------- */
  const orderModal = document.getElementById('orderModal');
  const modalClose = document.getElementById('modalClose');
  const modalProductName = document.getElementById('modalProductName');
  const modalTotal = document.getElementById('modalTotal');
  const orderForm = document.getElementById('orderForm');

  let currentOrder = { name: '', price: 0, qty: 1 };

  document.querySelectorAll('.btn-order').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.product-card');
      const name = card.dataset.name;
      const price = parseInt(card.dataset.price, 10);
      const qty = parseInt(card.querySelector('.qty-control').dataset.qty, 10);

      currentOrder = { name, price, qty };
      modalProductName.textContent = name;
      modalTotal.textContent = `ETB ${(price * qty).toLocaleString()} (Qty: ${qty})`;

      orderModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  const closeModal = () => {
    orderModal.classList.remove('open');
    document.body.style.overflow = '';
  };
  modalClose.addEventListener('click', closeModal);
  orderModal.addEventListener('click', (e) => {
    if (e.target === orderModal) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && orderModal.classList.contains('open')) closeModal();
  });

  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const submitter = e.submitter;
    const channel = submitter ? submitter.dataset.channel : 'telegram';

    const formData = new FormData(orderForm);
    const fullname = formData.get('fullname');
    const phone = formData.get('phone');
    const address = formData.get('address');

    const total = currentOrder.price * currentOrder.qty;
    const message =
`New order from NABIL. Shop:
------------------------
Item: ${currentOrder.name}
Quantity: ${currentOrder.qty}
Total: ETB ${total.toLocaleString()}
------------------------
Name: ${fullname}
Phone: ${phone}
Address: ${address}`;

    const encoded = encodeURIComponent(message);
    let url = '';
    if (channel === 'whatsapp') {
      url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
    } else {
      url = `https://t.me/${TELEGRAM_USERNAME}?text=${encoded}`;
    }

    window.open(url, '_blank', 'noopener');
    closeModal();
    orderForm.reset();
    showToast(`Order ready — opening ${channel === 'whatsapp' ? 'WhatsApp' : 'Telegram'}...`);
  });

 /* ---------- Booking form ---------- */
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(bookingForm);
      const name = formData.get('name');
      const contact = formData.get('contact');
      const type = formData.get('type');
      const message = formData.get('message');

      const text = `📩 *New Contact Message*\n\n*Name:* ${name}\n*Contact/Phone:* ${contact}\n*Inquiry Type:* ${type}\n*Message:* ${message}`;
      const encoded = encodeURIComponent(text);
      
      // በቀጥታ ወደ ዋትስአፕ እንዲመጣ ከፈለጉ (የራሰን ስልክ ቁጥር ያስገቡ)
      const whatsappNumber = '+251 93 030 5014'; 
      window.open(`https://wa.me/${whatsappNumber}?text=${encoded}`, '_blank');

      bookingForm.reset();
      showToast('Message ready — opening WhatsApp...');
    });
  }
  /* ---------- Toast ---------- */
  const toast = document.getElementById('toast');
  let toastTimer = null;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  }

})();
