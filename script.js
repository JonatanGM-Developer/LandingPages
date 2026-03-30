'use strict';

let cart = [];

window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

function toggleMenu() {
  const links = document.getElementById('navLinks');
  links.classList.toggle('open');
}

// Close menu when a link is clicked
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('navLinks').classList.remove('open');
  });
});

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

const fadeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger delay for grid children
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => entry.target.classList.add('visible'), delay);
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-in').forEach((el, i) => {
  // Add stagger for grid siblings
  const parent = el.parentElement;
  if (parent && (parent.classList.contains('products-grid') ||
                  parent.classList.contains('features-grid') ||
                  parent.classList.contains('testimonials-grid') ||
                  parent.classList.contains('about-stats'))) {
    el.dataset.delay = (i % 6) * 100;
  }
  fadeObserver.observe(el);
});

(function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left   = Math.random() * 100 + '%';
    p.style.top    = Math.random() * 100 + '%';
    p.style.width  = (Math.random() * 4 + 2) + 'px';
    p.style.height = p.style.width;
    p.style.animationDuration  = (Math.random() * 8 + 5) + 's';
    p.style.animationDelay     = (Math.random() * 6) + 's';
    p.style.opacity = (Math.random() * 0.5 + 0.2).toString();
    container.appendChild(p);
  }
})();

function filterProducts(category) {
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');

  document.querySelectorAll('.product-card').forEach(card => {
    if (category === 'all' || card.dataset.category === category) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
}

function addToCart(name, price, category) {
  const existing = cart.find(item => item.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price, qty: 1, category });
  }
  updateCartUI();
  showAddedFeedback(event.target);

  // Auto-open cart on first add
  if (cart.length === 1) {
    setTimeout(() => openCart(), 400);
  }
}

function showAddedFeedback(btn) {
  const original = btn.textContent;
  btn.textContent = '✓ Agregado';
  btn.classList.add('added');
  setTimeout(() => {
    btn.textContent = original;
    btn.classList.remove('added');
  }, 1500);
}

function removeFromCart(name) {
  cart = cart.filter(item => item.name !== name);
  updateCartUI();
}

function changeQty(name, delta) {
  const item = cart.find(i => i.name === name);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(name);
  else updateCartUI();
}

function updateCartUI() {
  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  // Navbar badge
  document.getElementById('cartCount').textContent = totalItems;

  // Sidebar items
  const cartItemsEl = document.getElementById('cartItems');
  const cartFooterEl = document.getElementById('cartFooter');

  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p class="empty-cart">Tu carrito está vacío.<br/>¡Agrega algunas velas!</p>';
    cartFooterEl.style.display = 'none';
  } else {
    cartItemsEl.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-name">🕯️ ${item.name}</div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="changeQty('${item.name}', -1)">−</button>
          <span>${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.name}', 1)">+</button>
        </div>
        <div class="cart-item-price">${formatPrice(item.price * item.qty)}</div>
        <button class="qty-btn" onclick="removeFromCart('${item.name}')" title="Eliminar">🗑</button>
      </div>
    `).join('');
    document.getElementById('cartTotal').textContent = formatPrice(totalPrice);
    cartFooterEl.style.display = 'block';
  }

  // Form summary
  updateFormCart(totalPrice);
}

function updateFormCart(totalPrice) {
  const formItemsEl    = document.getElementById('formCartItems');
  const formTotalEl    = document.getElementById('formCartTotal');
  const formAmountEl   = document.getElementById('formTotalAmount');
  const formAnticipoEl = document.getElementById('formAnticipo');
  const formAnticipoAmountEl = document.getElementById('formAnticipoAmount');

  if (!formItemsEl) return;

  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
  const envio = totalItems >= 3 ? 0 : 25;
  const totalConEnvio = totalPrice + envio;
  const anticipo = Math.ceil(totalConEnvio * 0.5);

  if (cart.length === 0) {
    formItemsEl.innerHTML = '<p class="empty-cart-msg">No has agregado productos aún. Ve al catálogo y agrega velas a tu pedido.</p>';
    formTotalEl.style.display = 'none';
    if (formAnticipoEl) formAnticipoEl.style.display = 'none';
  } else {
    formItemsEl.innerHTML = cart.map(item => `
      <div class="form-cart-item">
        <span>🕯️ ${item.name} × ${item.qty}</span>
        <span style="font-weight:700;color:var(--gold-dark)">${formatPrice(item.price * item.qty)}</span>
      </div>
    `).join('') + `
      <div class="form-cart-item" style="color:var(--text-light);font-size:0.85rem;">
        <span>🚚 Envío${envio === 0 ? ' (¡Gratis! 🎉)' : ' a domicilio'}</span>
        <span>${envio === 0 ? 'Q0.00' : formatPrice(envio)}</span>
      </div>`;
    formAmountEl.textContent = formatPrice(totalConEnvio);
    formTotalEl.style.display = 'flex';
    if (formAnticipoEl) {
      formAnticipoAmountEl.textContent = formatPrice(anticipo);
      formAnticipoEl.style.display = 'flex';
    }
  }
}

function formatPrice(n) {
  return 'Q' + n.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function toggleCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('open');
  document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
}

function openCart() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  sidebar.classList.add('open');
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function submitOrder(e) {
  e.preventDefault();

  const name         = document.getElementById('clientName').value.trim();
  const phone        = document.getElementById('clientPhone').value.trim();
  const address      = document.getElementById('clientAddress').value.trim();
  const city         = document.getElementById('clientCity').value.trim();
  const neighborhood = document.getElementById('clientNeighborhood').value.trim();
  const products     = document.getElementById('clientProducts').value.trim();
  const notes        = document.getElementById('clientNotes').value.trim();

  if (!name || !phone || !address || !city) {
    showToast('Por favor completa los campos requeridos.', 'error');
    return;
  }

  // Build WhatsApp message
  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
  const envio = totalItems >= 3 ? 0 : 25;
  const totalConEnvio = totalPrice + envio;
  const anticipo = Math.ceil(totalConEnvio * 0.5);
  const saldo = totalConEnvio - anticipo;

  let cartLines = '';
  if (cart.length > 0) {
    cartLines = cart.map(i => `• ${i.name} x${i.qty} — ${formatPrice(i.price * i.qty)}`).join('\n');
    cartLines += `\n• 🚚 Envío — ${envio === 0 ? 'GRATIS (3+ productos)' : formatPrice(envio)}`;
    cartLines += `\n\n*Total del pedido:* ${formatPrice(totalConEnvio)}`;
    cartLines += `\n💳 *Anticipo requerido (50%):* ${formatPrice(anticipo)}`;
    cartLines += `\n💵 *Saldo contra entrega:* ${formatPrice(saldo)}`;
  } else if (products) {
    cartLines = products;
  } else {
    cartLines = 'No especificado';
  }

  const address_full = neighborhood ? `${address}, ${neighborhood}, ${city}` : `${address}, ${city}`;

  const msg = `🕯️ *NUEVO PEDIDO – Velas Luz y Elegancia*

👤 *Cliente:* ${name}
📞 *Teléfono:* ${phone}
📍 *Dirección:* ${address_full}

🛍️ *Productos:*
${cartLines}

💳 *Forma de pago:* 50% anticipo (transferencia/depósito) + 50% efectivo al recibir
${notes ? `\n📝 *Notas:* ${notes}` : ''}

_Pedido realizado desde la web_`;

  const waUrl = `https://wa.me/50248843997?text=${encodeURIComponent(msg)}`;

  // Open WhatsApp
  window.open(waUrl, '_blank');

  // Show success modal
  document.getElementById('successModal').classList.add('open');

  // Reset
  document.getElementById('orderForm').reset();
  cart = [];
  updateCartUI();
}

function closeModal() {
  document.getElementById('successModal').classList.remove('open');
}

function openLightbox(src, title) {
  document.getElementById('lightboxImg').src = src;
  document.getElementById('lightboxImg').alt = title;
  document.getElementById('lightboxCaption').textContent = title;
  document.getElementById('lightboxOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightboxOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});

// Close modal on overlay click
document.getElementById('successModal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

function submitContact(e) {
  e.preventDefault();

  const name    = document.getElementById('contactName').value.trim();
  const email   = document.getElementById('contactEmail').value.trim();
  const message = document.getElementById('contactMessage').value.trim();

  const msg = `📩 *SOLICITUD DE INFORMACIÓN – Velas Luz y Elegancia*

👤 *Nombre:* ${name}
📧 *Email:* ${email}

💬 *Mensaje:*
${message}

_Enviado desde el formulario de contacto_`;

  const waUrl = `https://wa.me/50248843997?text=${encodeURIComponent(msg)}`;
  window.open(waUrl, '_blank');

  showToast('Abriendo WhatsApp con tu mensaje... 💛', 'success');
  e.target.reset();
}

function showToast(msg, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  toast.style.cssText = `
    position: fixed;
    bottom: 30px; left: 50%;
    transform: translateX(-50%) translateY(80px);
    background: ${type === 'success' ? 'linear-gradient(135deg,#4caf50,#2e7d32)' : 'linear-gradient(135deg,#ef5350,#b71c1c)'};
    color: white;
    padding: 14px 28px;
    border-radius: 50px;
    font-family: 'Lato', sans-serif;
    font-size: 0.95rem;
    font-weight: 700;
    z-index: 9999;
    box-shadow: 0 8px 30px rgba(0,0,0,0.25);
    transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
    max-width: 90vw;
    text-align: center;
  `;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    toast.style.transform = 'translateX(-50%) translateY(80px)';
    setTimeout(() => toast.remove(), 400);
  }, 3200);
}

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

function animateCounter(el, target, suffix) {
  let current = 0;
  const step = target / 60;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      clearInterval(timer);
      el.textContent = (target % 1 === 0 ? target : target.toFixed(0)) + suffix;
    } else {
      el.textContent = Math.floor(current) + suffix;
    }
  }, 16);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const nums = entry.target.querySelectorAll('.stat-num');
      nums.forEach(num => {
        const text = num.textContent;
        if (text.includes('+')) {
          const val = parseInt(text.replace(/[^0-9]/g, ''));
          animateCounter(num, val, '+');
        } else if (text.includes('★')) {
          // Keep as is
        } else if (!isNaN(parseInt(text))) {
          const val = parseInt(text);
          animateCounter(num, val, '');
        }
      });
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const statsEl = document.querySelector('.about-stats');
if (statsEl) statsObserver.observe(statsEl);

const sections = document.querySelectorAll('section[id]');
const navLinksAll = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  const scrollPos = window.scrollY + 100;
  sections.forEach(section => {
    if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
      navLinksAll.forEach(a => {
        a.classList.remove('active-nav');
        if (a.getAttribute('href') === '#' + section.id) {
          a.classList.add('active-nav');
        }
      });
    }
  });
}, { passive: true });

// Active nav style
const style = document.createElement('style');
style.textContent = '.nav-links a.active-nav { color: var(--gold) !important; } .nav-links a.active-nav::after { width: 100% !important; }';
document.head.appendChild(style);