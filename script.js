/* ============================================
   SAMANTHA SMITH – PORTFOLIO 2025
   script.js
============================================ */
 
/* ============================================
   1. DISNEY-STYLE STAR PRELOADER (canvas)
      A glowing star arcs across the night sky,
      leaves a trail, and "writes" a castle
      silhouette before the site loads.
============================================ */
(function () {
  const canvas  = document.getElementById('disney-canvas');
  const ctx     = canvas.getContext('2d');
  const W       = () => canvas.width  = window.innerWidth;
  const H       = () => canvas.height = window.innerHeight;
  W(); H();
  window.addEventListener('resize', () => { W(); H(); });
 
  /* --- background stars --- */
  const bgStars = Array.from({ length: 220 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.5 + 0.3,
    a: Math.random(),
    speed: Math.random() * 0.008 + 0.002
  }));
 
  /* --- star drawing --- */
  function drawStar(ctx, x, y, r, glow, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowBlur  = glow;
    ctx.shadowColor = '#FF5500';
    ctx.fillStyle   = '#ffffff';
 
    const pts = 5, outer = r, inner = r * 0.45;
    ctx.beginPath();
    for (let i = 0; i < pts * 2; i++) {
      const ang  = (i * Math.PI) / pts - Math.PI / 2;
      const dist = i % 2 === 0 ? outer : inner;
      const px = x + Math.cos(ang) * dist;
      const py = y + Math.sin(ang) * dist;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
 
  /* ---- animation state ---- */
  const TOTAL_MS = 3800;   // total preloader duration
  let start  = null;
  let trail  = [];          // [{x,y,a}]
 
  // Arc: star travels from bottom-left across to center-top of castle
  function starPos(t) {          // t ∈ [0,1]
    const startX = canvas.width  * 0.05;
    const startY = canvas.height * 0.85;
    const endX   = canvas.width  * 0.5;
    const endY   = canvas.height * 0.38;
    const cpX    = canvas.width  * 0.6;
    const cpY    = canvas.height * 0.1;
 
    const mt = 1 - t;
    return {
      x: mt*mt*startX + 2*mt*t*cpX + t*t*endX,
      y: mt*mt*startY + 2*mt*t*cpY + t*t*endY
    };
  }
 
  /* ---- main animation loop ---- */
  function animate(ts) {
    if (!start) start = ts;
    const elapsed = ts - start;
    const progress = Math.min(elapsed / TOTAL_MS, 1);   // 0→1
 
    const w = canvas.width, h = canvas.height;
 
    // clear
    ctx.clearRect(0, 0, w, h);
 
    // deep night sky background
    const sky = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w,h)*0.7);
    sky.addColorStop(0,   '#12000a');
    sky.addColorStop(0.5, '#0a0005');
    sky.addColorStop(1,   '#000000');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
 
    // twinkling bg stars
    bgStars.forEach(s => {
      s.a += s.speed;
      const brightness = (Math.sin(s.a) * 0.4 + 0.6);
      ctx.save();
      ctx.globalAlpha = brightness * Math.min(progress * 3, 1);
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
 
    /* star arc: moves for the first 80% of the animation */
    const starProgress = Math.min(progress / 0.8, 1);
    const pos = starPos(starProgress);
 
    // add to trail
    if (progress < 0.82) {
      trail.push({ x: pos.x, y: pos.y, a: 1.0 });
    }
    // fade trail
    trail = trail
      .map(p => ({ ...p, a: p.a - 0.018 }))
      .filter(p => p.a > 0);
 
    // draw trail
    trail.forEach((p, i) => {
      const ratio = i / trail.length;
      ctx.save();
      ctx.globalAlpha = p.a * 0.6 * ratio;
      ctx.fillStyle   = '#FF5500';
      ctx.shadowBlur  = 10;
      ctx.shadowColor = '#FF5500';
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.5 * ratio, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
 
    // sparkles along trail
    if (Math.random() < 0.35 && trail.length > 5) {
      const sp = trail[Math.floor(Math.random() * trail.length)];
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.fillStyle   = '#ffcc88';
      ctx.shadowColor = '#FF5500';
      ctx.shadowBlur  = 14;
      ctx.beginPath();
      ctx.arc(sp.x + (Math.random()-0.5)*12, sp.y + (Math.random()-0.5)*12, 2, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
    }
 
    // star itself
    if (progress < 0.85) {
      const starR = 10 + Math.sin(ts * 0.01) * 3;
      drawStar(ctx, pos.x, pos.y, starR, 30, 1);
      // burst at castle top when it "arrives"
      if (starProgress > 0.97) {
        const burst = (starProgress - 0.97) / 0.03;
        ctx.save();
        ctx.globalAlpha = (1 - burst) * 0.8;
        const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 80 * burst);
        grad.addColorStop(0,   'rgba(255,200,100,0.9)');
        grad.addColorStop(0.4, 'rgba(255,85,0,0.4)');
        grad.addColorStop(1,   'rgba(255,85,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 80 * burst, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
      }
    }
 
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // Preloader done → show site
      setTimeout(showSite, 400);
    }
  }
 
  requestAnimationFrame(animate);
 
  function showSite() {
    const preloader = document.getElementById('preloader');
    preloader.style.transition = 'opacity 0.7s ease';
    preloader.style.opacity    = '0';
    setTimeout(() => {
      preloader.style.display = 'none';
      const site = document.getElementById('main-site');
      site.classList.remove('hidden');
      site.style.opacity = '0';
      site.style.transition = 'opacity 0.6s ease';
      requestAnimationFrame(() => { site.style.opacity = '1'; });
    }, 700);
  }
})();
 
 
/* ============================================
   2. NAVIGATION – active state + mobile menu
============================================ */
document.addEventListener('DOMContentLoaded', () => {
 
  /* Mobile menu toggle */
  const toggle  = document.getElementById('menuToggle');
  const navList = document.querySelector('.nav-links');
  toggle?.addEventListener('click', () => {
    navList.classList.toggle('open');
  });
 
  /* Close mobile menu on link click */
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navList.classList.remove('open');
    });
  });
 
  /* Active nav based on scroll */
  const sections = document.querySelectorAll('.section');
  const navLinks = document.querySelectorAll('.nav-link');
 
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(l => {
          l.classList.toggle('active', l.dataset.section === id);
        });
      }
    });
  }, { threshold: 0.35 });
 
  sections.forEach(s => observer.observe(s));
 
  /* ============================================
     3. CONTACT FORM – fake send feedback
  ============================================ */
  const sendBtn = document.getElementById('sendBtn');
  sendBtn?.addEventListener('click', () => {
    const inputs = document.querySelectorAll('.contact-form input, .contact-form textarea');
    let allFilled = true;
    inputs.forEach(i => { if (!i.value.trim()) allFilled = false; });
 
    if (!allFilled) {
      sendBtn.textContent = '⚠ Please fill all fields';
      sendBtn.style.background = '#8B0000';
      setTimeout(() => {
        sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
        sendBtn.style.background = '';
      }, 2000);
      return;
    }
 
    sendBtn.innerHTML = '<i class="fas fa-check"></i> Sent Successfully!';
    sendBtn.style.background = '#00a86b';
    sendBtn.style.boxShadow  = '0 0 20px #00a86b';
    inputs.forEach(i => { i.value = ''; });
    setTimeout(() => {
      sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
      sendBtn.style.background = '';
      sendBtn.style.boxShadow  = '';
    }, 3000);
  });
 
  /* ============================================
     4. SMOOTH section entrance animations
  ============================================ */
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity    = '1';
        entry.target.style.transform  = 'translateY(0)';
      }
    });
  }, { threshold: 0.08 });
 
  const animTargets = document.querySelectorAll(
    '.glass-card, .service-card, .portfolio-card, .stat-card, .about-left, .contact-left, .contact-right'
  );
  animTargets.forEach(el => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(30px)';
    el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
    revealObs.observe(el);
  });
 
  /* ============================================
     5. STATUS BAR ANIMATION (home section)
  ============================================ */
  const fill = document.querySelector('.status-fill');
  if (fill) {
    fill.style.width = '0%';
    setTimeout(() => {
      fill.style.transition = 'width 1.8s ease';
      fill.style.width = '87%';
    }, 600);
  }
 
  /* ============================================
     6. CORE UI CIRCLE – rotate rings and pulse
        (already via CSS animation, but
         we add a data-pulse to the welcome text)
  ============================================ */
  const coreWelcome = document.querySelector('.core-welcome');
  if (coreWelcome) {
    let visible = true;
    setInterval(() => {
      visible = !visible;
      coreWelcome.style.opacity = visible ? '1' : '0.3';
      coreWelcome.style.transition = 'opacity 0.4s';
    }, 1800);
  }
 
});