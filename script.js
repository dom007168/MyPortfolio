'use strict';

/* ══════════════════════════════════════════════════
   SUPABASE CLIENT
══════════════════════════════════════════════════ */
const SUPABASE_URL = 'https://dnsgpjepcavqnnddsbzm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuc2dwamVwY2F2cW5uZGRzYnptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MDMyNTcsImV4cCI6MjA5NTM3OTI1N30.UbjtH1myWZmKDbbvO2J-FPUhL1HznvUcEQPi3rN2jRE';

const { createClient } = window.supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

/* ══════════════════════════════════════════════════
   STATE
══════════════════════════════════════════════════ */
let appData = { profile: null, skills: [], projects: [], allSkills: [], allProjects: [] };
let currentFilter = { skills: 'all', projects: 'all' };
let pendingDeleteFn = null;
let resetEmail = '';

/* ══════════════════════════════════════════════════
   PARTICLES
══════════════════════════════════════════════════ */
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resize() { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.5; this.vy = (Math.random() - 0.5) * 0.5;
      this.r = Math.random() * 2 + 0.5; this.alpha = Math.random() * 0.5 + 0.1;
      this.color = ['#00d4ff','#0066ff','#7c3aed','#00ff88'][Math.floor(Math.random()*4)];
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }
    draw() {
      ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
      ctx.fillStyle = this.color; ctx.globalAlpha = this.alpha; ctx.fill(); ctx.globalAlpha = 1;
    }
  }

  function init() {
    resize();
    const count = Math.min(80, Math.floor(canvas.width * canvas.height / 15000));
    particles = Array.from({ length: count }, () => new Particle());
  }
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 120) {
          ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = '#00d4ff'; ctx.globalAlpha = (1 - dist/120) * 0.12; ctx.lineWidth = 0.5; ctx.stroke(); ctx.globalAlpha = 1;
        }
      }
    }
  }
  function animate() { ctx.clearRect(0, 0, canvas.width, canvas.height); particles.forEach(p => { p.update(); p.draw(); }); drawConnections(); requestAnimationFrame(animate); }
  window.addEventListener('resize', init); init(); animate();
})();

/* ══════════════════════════════════════════════════
   TYPING ANIMATION
══════════════════════════════════════════════════ */
(function initTyping() {
  const phrasesData = {
    en: ['Cybersecurity Enthusiast','Network Security Learner','Web Developer','FortiGate & MikroTik Enthusiast','Ethical Hacker in Training'],
    km: ['អ្នកចូលចិត្តសន្តិសុខ','កំពុងរៀនសន្តិសុខបណ្តាញ','វិស្វករម្មWeb','FortiGate & MikroTik','ហ័ក្កែរក្រម់សីលធម៌']
  };
  let idx = 0, charIdx = 0, deleting = false;
  const el = document.getElementById('typed-text');
  let phrases = phrasesData.en;
  function getphrases() { return phrasesData[typeof currentLang!=='undefined'?currentLang:'en']||phrasesData.en; }
  function type() {
    phrases = getphrases();
    if (idx >= phrases.length) idx = 0;
    const phrase = phrases[idx];
    if (!deleting) { el.textContent = phrase.substring(0, charIdx + 1); charIdx++; if (charIdx === phrase.length) { deleting = true; setTimeout(type, 1800); return; } }
    else { el.textContent = phrase.substring(0, charIdx - 1); charIdx--; if (charIdx === 0) { deleting = false; idx = (idx + 1) % phrases.length; setTimeout(type, 300); return; } }
    setTimeout(type, deleting ? 40 : 60);
  }
  setTimeout(type, 1000);
})();

/* ══════════════════════════════════════════════════
   SCROLL EFFECTS & INTERSECTION OBSERVER
══════════════════════════════════════════════════ */
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
  document.getElementById('backTop').classList.toggle('show', window.scrollY > 400);
  const sections = ['hero','about','skills','experience','projects','contact'];
  sections.forEach(id => {
    const el = document.getElementById(id); if (!el) return;
    const rect = el.getBoundingClientRect();
    const link = document.querySelector(`.nav-link[data-section="${id}"]`);
    if (link) link.classList.toggle('active', rect.top <= 100 && rect.bottom > 100);
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      entry.target.querySelectorAll('.skill-bar-fill').forEach(bar => { bar.style.width = bar.dataset.width || '0%'; });
      entry.target.querySelectorAll('.counter').forEach(el => animateCounter(el));
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

function observeAnimated() {
  document.querySelectorAll('.anim-fade-up, .anim-fade-left, .anim-fade-right').forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const target = parseInt(el.dataset.target); let count = 0;
  const step = Math.ceil(target / 30);
  const interval = setInterval(() => {
    count = Math.min(count + step, target);
    el.textContent = count + (target > 10 ? '+' : '');
    if (count >= target) clearInterval(interval);
  }, 40);
}

/* ══════════════════════════════════════════════════
   SECURITY UTILITY
══════════════════════════════════════════════════ */
function escHtml(str) {
  if (str == null) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

/* ══════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════ */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const icons = { success: 'fas fa-check-circle', error: 'fas fa-exclamation-circle', info: 'fas fa-info-circle' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<i class="${icons[type]}"></i>${escHtml(message)}`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

/* ══════════════════════════════════════════════════
   DATA LOADING FROM SUPABASE
══════════════════════════════════════════════════ */
async function loadPublicData() {
  try {
    const [profileRes, skillsRes, projectsRes] = await Promise.all([
      sb.from('profiles').select('*').limit(1).single(),
      sb.from('skills').select('*').order('category'),
      sb.from('projects').select('*').order('created_at', { ascending: false })
    ]);

    if (profileRes.data) { appData.profile = profileRes.data; renderAbout(); }
    if (skillsRes.data) { appData.allSkills = skillsRes.data; appData.skills = skillsRes.data; renderSkills(); }
    if (projectsRes.data) { appData.allProjects = projectsRes.data; appData.projects = projectsRes.data; renderProjects(); }

    renderTimeline();
  } catch (err) {
    console.error('Error loading data:', err);
  }
}

/* ══════════════════════════════════════════════════
   RENDER: ABOUT
══════════════════════════════════════════════════ */
function renderAbout() {
  const p = appData.profile;
  if (!p) return;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || ''; };
  set('about-name', p.full_name);
  set('about-title', p.title);
  set('about-bio', p.biography);

  if (p.photo_url) {
    document.getElementById('about-photo').src = p.photo_url;
    const prev = document.getElementById('admin-profile-preview');
    if (prev) prev.src = p.photo_url;
  }

  // CV buttons
  const viewBtn = document.getElementById('hero-view-cv-btn');
  const dlBtn = document.getElementById('hero-download-cv-btn');
  if (p.cv_url) {
    if (viewBtn) { viewBtn.href = p.cv_url; viewBtn.classList.remove('hidden'); }
    if (dlBtn) { dlBtn.href = p.cv_url; dlBtn.classList.remove('hidden'); }
  } else {
    if (viewBtn) viewBtn.classList.add('hidden');
    if (dlBtn) dlBtn.classList.add('hidden');
  }
  renderAdminCvSection(p.cv_url);

  // Contact cards
  if (p.telegram) {
    const t = p.telegram.replace('@','');
    const ccT = document.getElementById('cc-telegram'); if (ccT) ccT.href = 'https://t.me/' + t;
    const ccTV = document.getElementById('cc-telegram-val'); if (ccTV) ccTV.textContent = p.telegram;
    const fT = document.getElementById('footer-telegram'); if (fT) fT.href = 'https://t.me/' + t;
  }
  if (p.github) {
    const ccG = document.getElementById('cc-github'); if (ccG) ccG.href = p.github;
    const ccGV = document.getElementById('cc-github-val'); if (ccGV) ccGV.textContent = p.github.replace('https://','');
    const fG = document.getElementById('footer-github'); if (fG) fG.href = p.github;
  }
  if (p.linkedin) {
    const ccL = document.getElementById('cc-linkedin'); if (ccL) ccL.href = p.linkedin;
    const ccLV = document.getElementById('cc-linkedin-val'); if (ccLV) ccLV.textContent = p.linkedin.replace('https://','');
    const fL = document.getElementById('footer-linkedin'); if (fL) fL.href = p.linkedin;
  }
  if (p.email) {
    const ccE = document.getElementById('cc-email'); if (ccE) ccE.href = 'mailto:' + p.email;
    const ccEV = document.getElementById('cc-email-val'); if (ccEV) ccEV.textContent = p.email;
    const fE = document.getElementById('footer-email'); if (fE) fE.href = 'mailto:' + p.email;
  }
}

/* ══════════════════════════════════════════════════
   RENDER: SKILLS
══════════════════════════════════════════════════ */
function renderSkills(filter) {
  if (filter !== undefined) currentFilter.skills = filter;
  const skills = currentFilter.skills === 'all'
    ? appData.allSkills
    : appData.allSkills.filter(s => s.category === currentFilter.skills);
  const grid = document.getElementById('skills-grid');
  if (!grid) return;
  if (!skills.length) { grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:#475569;padding:40px;font-family:\'Share Tech Mono\',monospace;">No skills found.</div>'; return; }
  const colors = { 'Cybersecurity': 'linear-gradient(90deg,#f43f5e,#7c3aed)', 'Networking': 'linear-gradient(90deg,#0066ff,#00d4ff)', 'Web Development': 'linear-gradient(90deg,#00d4ff,#00ff88)', 'System Administration': 'linear-gradient(90deg,#7c3aed,#0066ff)' };
  grid.innerHTML = skills.map((s, i) => {
    const color = colors[s.category] || 'linear-gradient(90deg,var(--cyan),var(--blue))';
    return `<div class="skill-card anim-fade-up" style="transition-delay:${i*0.07}s;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
        <div style="width:40px;height:40px;background:rgba(0,212,255,0.1);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;">
          <i class="${s.icon || 'fas fa-code'}" style="color:var(--cyan);"></i>
        </div>
        <div style="flex:1;">
          <div style="font-family:'Orbitron',sans-serif;font-size:13px;font-weight:600;color:#fff;margin-bottom:2px;">${escHtml(s.skill_name)}</div>
          <div style="font-size:11px;font-family:'Share Tech Mono',monospace;color:#475569;">${escHtml(s.category)}</div>
        </div>
        <div style="font-family:'Orbitron',sans-serif;font-size:14px;font-weight:700;color:var(--cyan);">${s.percentage}%</div>
      </div>
      <div class="skill-bar-bg"><div class="skill-bar-fill" style="background:${color};" data-width="${s.percentage}%"></div></div>
    </div>`;
  }).join('');
  document.querySelectorAll('#skills-grid .anim-fade-up').forEach(el => { el.classList.remove('visible'); observer.observe(el); });
}

window.filterSkills = function(btn, cat) {
  document.querySelectorAll('#skill-filter .cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderSkills(cat);
}

/* ══════════════════════════════════════════════════
   RENDER: PROJECTS
══════════════════════════════════════════════════ */
function renderProjects(filter) {
  if (filter !== undefined) currentFilter.projects = filter;
  const projects = currentFilter.projects === 'all'
    ? appData.allProjects
    : appData.allProjects.filter(p => p.category === currentFilter.projects);
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  if (!projects.length) { grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:#475569;padding:40px;font-family:\'Share Tech Mono\',monospace;">No projects found.</div>'; return; }
  grid.innerHTML = projects.map((p, i) => {
    const techs = (p.technologies || '').split(',').slice(0,4).map(t => `<span class="tech-tag">${escHtml(t.trim())}</span>`).join('');
    return `<div class="project-card anim-fade-up" style="transition-delay:${i*0.1}s;">
      <div class="project-img-wrap">
        <img src="${escHtml(p.image_url || 'https://picsum.photos/seed/' + p.id + '/600/300.webp')}"
          alt="${escHtml(p.title)} project screenshot" class="project-img" loading="lazy" />
        <div class="project-overlay"></div>
        <span class="project-category">${escHtml(p.category || 'Project')}</span>
      </div>
      <div class="project-body">
        <div class="project-title">${escHtml(p.title)}</div>
        <p style="font-size:13px;color:#64748b;margin-bottom:14px;line-height:1.7;">${escHtml((p.description||'').substring(0,120))}...</p>
        <div style="margin-bottom:16px;display:flex;flex-wrap:wrap;">${techs}</div>
        <div style="display:flex;gap:8px;">
          ${p.github_url ? `<a href="${escHtml(p.github_url)}" target="_blank" rel="noopener" class="btn-outline btn-sm" style="text-decoration:none;"><i class="fab fa-github" style="margin-right:6px;"></i>Code</a>` : ''}
          ${p.demo_url ? `<a href="${escHtml(p.demo_url)}" target="_blank" rel="noopener" class="btn-primary btn-sm" style="text-decoration:none;"><span><i class="fas fa-external-link-alt" style="margin-right:6px;"></i>Demo</span></a>` : ''}
        </div>
      </div>
    </div>`;
  }).join('');
  document.querySelectorAll('#projects-grid .anim-fade-up').forEach(el => { el.classList.remove('visible'); observer.observe(el); });
}

window.filterProjects = function(btn, cat) {
  document.querySelectorAll('#project-filter .cat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderProjects(cat);
}

/* ══════════════════════════════════════════════════
   RENDER: TIMELINE (static)
══════════════════════════════════════════════════ */
function renderTimeline() {
  const timelineData = {
    en: [
      { year: '2025', title: 'Security Research & Pen Testing', subtitle: 'Self-Study & Labs', desc: 'Actively learning ethical hacking, CTF challenges, and building security labs with FortiGate and Kali Linux.', type: 'achievement' },
      { year: '2024', title: 'Network Security Internship', subtitle: 'IT Department', desc: 'Configured FortiGate firewalls, managed MikroTik routers, monitored network traffic, and improved security posture.', type: 'work' },
      { year: '2024', title: 'FortiGate NSE 1 & 2 Certified', subtitle: 'Fortinet Network Security', desc: 'Earned Fortinet Network Security certifications covering cybersecurity concepts and FortiGate fundamentals.', type: 'cert' },
      { year: '2023', title: 'Bachelor of Computer Science', subtitle: 'University – Cybersecurity Major', desc: 'Pursuing Computer Science with focus on network security, cryptography, and system administration.', type: 'edu' },
      { year: '2023', title: 'MikroTik MTCNA Prep', subtitle: 'MikroTik Academy', desc: 'Completed hands-on training for MikroTik router configuration, OSPF, BGP, and wireless security.', type: 'cert' },
      { year: '2022', title: 'Web Development Projects', subtitle: 'Personal & Freelance', desc: 'Built PHP/MySQL web applications, e-commerce sites, and inventory management systems.', type: 'work' },
    ],
    km: [
      { year: '2025', title: 'ការស្រាវជ្រាវ Security & Pen Testing', subtitle: 'ការសិក្សាដោយខ្លួនឯង', desc: 'រៀន ethical hacking, CTF challenges, និងការសាងសង់ security labs ជាមួយ FortiGate និង Kali Linux.', type: 'achievement' },
      { year: '2024', title: 'កម្មសិក្សា Network Security', subtitle: 'នាយកដ្ឋាន IT', desc: 'កំណត់រចនាសម្ព័ន្ធ FortiGate, គ្រប់គ្រង MikroTik router, ត្រួតពិនិត្យ traffic.', type: 'work' },
      { year: '2024', title: 'FortiGate NSE 1 & 2', subtitle: 'Fortinet Network Security', desc: 'ទទួលបាន Fortinet certifications ស្ត឵បិ cybersecurity និង FortiGate fundamentals.', type: 'cert' },
      { year: '2023', title: 'បរិញ្ញាបត្រ Computer Science', subtitle: 'សាកលវិទ្យាល័យ – ឯកទេសសន្តិសុខ', desc: 'កំពុងសិក្សា Computer Science នា network security, cryptography.', type: 'edu' },
      { year: '2023', title: 'MikroTik MTCNA', subtitle: 'MikroTik Academy', desc: 'បញ្ចប់ការហ្វឹកហ្វឺន MikroTik router, OSPF, BGP.', type: 'cert' },
      { year: '2022', title: 'គម្រោង Web Development', subtitle: 'ផ្ទាល់ខ្លួន & Freelance', desc: 'បង្កើត web app PHP/MySQL, e-commerce.', type: 'work' },
    ]
  };
  const timeline = timelineData[typeof currentLang!=='undefined'?currentLang:'en'] || timelineData.en;
  const list = document.getElementById('timeline-list');
  if (!list) return;
  const typeColors = { achievement: 'var(--cyan)', work: 'var(--blue)', cert: 'var(--purple)', edu: 'var(--green)' };
  const typeIcons = { achievement: 'fas fa-trophy', work: 'fas fa-briefcase', cert: 'fas fa-certificate', edu: 'fas fa-graduation-cap' };
  list.innerHTML = timeline.map((item, i) => `
    <div class="timeline-item anim-fade-up" style="transition-delay:${i*0.1}s;">
      <div class="timeline-dot" style="border-color:${typeColors[item.type]||'var(--cyan)'};" aria-hidden="true"></div>
      <div class="timeline-card">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
          <div style="background:rgba(0,212,255,0.08);border-radius:8px;width:34px;height:34px;display:flex;align-items:center;justify-content:center;">
            <i class="${typeIcons[item.type]||'fas fa-star'}" style="color:${typeColors[item.type]||'var(--cyan)'};font-size:14px;"></i>
          </div>
          <div>
            <div style="font-family:'Orbitron',sans-serif;font-size:14px;font-weight:600;color:#fff;">${escHtml(item.title)}</div>
            <div style="font-size:12px;color:#475569;font-family:'Share Tech Mono',monospace;">${escHtml(item.subtitle)}</div>
          </div>
          <span class="badge badge-cyan" style="margin-left:auto;">${escHtml(item.year)}</span>
        </div>
        <p style="font-size:13px;color:#64748b;line-height:1.7;">${escHtml(item.desc)}</p>
      </div>
    </div>`).join('');
  document.querySelectorAll('#timeline-list .anim-fade-up').forEach(el => { el.classList.remove('visible'); observer.observe(el); });
}

/* ══════════════════════════════════════════════════
   NAVBAR / MOBILE
══════════════════════════════════════════════════ */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger.addEventListener('click', () => {
  const open = hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', open);
});
hamburger.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') hamburger.click(); });
window.closeMobileMenu = function() { hamburger.classList.remove('open'); mobileMenu.classList.remove('open'); hamburger.setAttribute('aria-expanded', false); }

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').substring(1);
    if (id === 'admin') return;
    const el = document.getElementById(id);
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
  });
});

/* ══════════════════════════════════════════════════
   CONTACT FORM → TELEGRAM
══════════════════════════════════════════════════ */
window.handleContactSubmit = async function(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  const name    = form.name.value.trim();
  const email   = form.email.value.trim();
  const message = form.message.value.trim();

  btn.disabled = true;
  btn.innerHTML = '<span><i class="fas fa-spinner fa-spin" style="margin-right:8px;"></i>SENDING...</span>';

  try {
    const { data, error } = await sb.functions.invoke('send-telegram', {
      body: { name, email, message }
    });

    if (error) {
      let errMsg = error.message || 'Failed to send message.';
      try {
        if (error.context) {
          const text = await error.context.text();
          errMsg = text || errMsg;
        }
      } catch {}
      throw new Error(errMsg);
    }

    showToast('Message sent! I\'ll get back to you soon.', 'success');
    form.reset();
  } catch (err) {
    console.error('Contact form error:', err);
    showToast('Failed to send: ' + (err.message || 'Unknown error'), 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span><i class="fas fa-shield-halved" style="margin-right:8px;"></i>SEND MESSAGE</span>';
  }
}

/* ══════════════════════════════════════════════════
   ADMIN — ROUTING
══════════════════════════════════════════════════ */
window.showAdmin = function(e) {
  if (e) e.preventDefault();
  document.getElementById('public-site').style.display = 'none';
  const adm = document.getElementById('admin-section');
  adm.style.display = 'flex'; adm.classList.add('active');
}
window.exitAdmin = function() {
  document.getElementById('admin-section').style.display = 'none';
  document.getElementById('admin-section').classList.remove('active');
  document.getElementById('public-site').style.display = 'block';
}
window.viewPortfolio = function() { exitAdmin(); window.scrollTo({ top: 0, behavior: 'smooth' }); }

/* ══════════════════════════════════════════════════
   ADMIN — AUTH (SUPABASE)
══════════════════════════════════════════════════ */
window.showLoginView = function() {
  document.getElementById('login-view').classList.remove('hidden');
  document.getElementById('forgot-view').classList.add('hidden');
  document.getElementById('otp-view').classList.add('hidden');
  document.getElementById('login-error').classList.add('hidden');
}
window.showForgotView = function() {
  document.getElementById('login-view').classList.add('hidden');
  document.getElementById('forgot-view').classList.remove('hidden');
  document.getElementById('otp-view').classList.add('hidden');
  document.getElementById('login-error').classList.add('hidden');
}
window.showOtpView = function() {
  document.getElementById('forgot-view').classList.add('hidden');
  document.getElementById('otp-view').classList.remove('hidden');
}

function setLoginError(msg) {
  const el = document.getElementById('login-error');
  el.textContent = msg; el.classList.remove('hidden');
}

window.handleAdminLogin = async function(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const btn = document.getElementById('login-btn');
  btn.disabled = true;
  btn.innerHTML = '<span><i class="fas fa-spinner fa-spin" style="margin-right:8px;"></i>Authenticating...</span>';
  document.getElementById('login-error').classList.add('hidden');

  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  btn.disabled = false;
  btn.innerHTML = '<span><i class="fas fa-right-to-bracket" style="margin-right:8px;"></i>ACCESS DASHBOARD</span>';

  if (error) {
    setLoginError(error.message || 'Invalid email or password.');
    document.getElementById('login-form').style.animation = 'glitchX 0.3s ease';
    setTimeout(() => document.getElementById('login-form').style.animation = '', 300);
  } else {
    showDashboard(data.user);
  }
}

window.handleForgotPassword = async function(e) {
  e.preventDefault();
  const email = document.getElementById('forgot-email').value.trim();
  const btn = document.getElementById('forgot-btn');
  btn.disabled = true;
  btn.innerHTML = '<span><i class="fas fa-spinner fa-spin" style="margin-right:8px;"></i>Sending...</span>';
  resetEmail = email;

  const { error } = await sb.auth.resetPasswordForEmail(email);
  btn.disabled = false;
  btn.innerHTML = '<span><i class="fas fa-paper-plane" style="margin-right:8px;"></i>SEND OTP</span>';

  if (error) { setLoginError(error.message); }
  else { showToast('OTP sent to ' + email, 'success'); showOtpView(); }
}

window.handleOtpVerify = async function(e) {
  e.preventDefault();
  const token = document.getElementById('otp-code').value.trim();
  const password = document.getElementById('new-password').value;
  const btn = document.getElementById('otp-btn');
  btn.disabled = true;
  btn.innerHTML = '<span><i class="fas fa-spinner fa-spin" style="margin-right:8px;"></i>Verifying...</span>';

  const { error: verifyErr } = await sb.auth.verifyOtp({ email: resetEmail, token, type: 'recovery' });
  if (verifyErr) {
    btn.disabled = false; btn.innerHTML = '<span><i class="fas fa-key" style="margin-right:8px;"></i>RESET PASSWORD</span>';
    setLoginError(verifyErr.message); return;
  }

  const { error: updateErr } = await sb.auth.updateUser({ password });
  btn.disabled = false; btn.innerHTML = '<span><i class="fas fa-key" style="margin-right:8px;"></i>RESET PASSWORD</span>';

  if (updateErr) { setLoginError(updateErr.message); }
  else { showToast('Password reset successful! Please log in.', 'success'); showLoginView(); }
}

window.handleAdminLogout = async function() {
  await sb.auth.signOut();
  document.getElementById('admin-login').style.display = 'flex';
  const dash = document.getElementById('admin-dashboard');
  dash.classList.add('hidden'); dash.style.display = 'none';
  document.getElementById('login-email').value = '';
  document.getElementById('login-password').value = '';
  showLoginView();
  showToast('Logged out successfully.', 'info');
}

window.togglePasswordVisibility = function() {
  const inp = document.getElementById('login-password');
  const icon = document.getElementById('pwd-toggle');
  inp.type = inp.type === 'password' ? 'text' : 'password';
  icon.className = inp.type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
  icon.style.cssText = 'position:absolute;right:14px;top:36px;color:#475569;cursor:pointer;font-size:14px;';
}

function showDashboard(user) {
  document.getElementById('admin-login').style.display = 'none';
  const dash = document.getElementById('admin-dashboard');
  dash.classList.remove('hidden'); dash.style.display = 'flex';
  if (user) {
    const emailEl = document.getElementById('admin-user-email');
    if (emailEl) emailEl.textContent = user.email;
  }
  refreshAdminData();
}

/* ══════════════════════════════════════════════════
   ADMIN — DASHBOARD DATA REFRESH
══════════════════════════════════════════════════ */
async function refreshAdminData() {
  try {
    const [profileRes, skillsRes, projectsRes] = await Promise.all([
      sb.from('profiles').select('*').limit(1).single(),
      sb.from('skills').select('*').order('category'),
      sb.from('projects').select('*').order('created_at', { ascending: false })
    ]);

    const profile = profileRes.data;
    const skills = skillsRes.data || [];
    const projects = projectsRes.data || [];

    if (profile) { appData.profile = profile; renderAbout(); }
    appData.allSkills = skills; appData.skills = skills; renderSkills();
    appData.allProjects = projects; appData.projects = projects; renderProjects();

    document.getElementById('stat-projects').textContent = projects.length;
    document.getElementById('stat-skills').textContent = skills.length;

    try {
      const { data: mediaFiles } = await sb.storage.from('media-library').list('', { limit: 100 });
      document.getElementById('stat-media').textContent = mediaFiles ? mediaFiles.filter(f => f.name !== '.emptyFolderPlaceholder').length : 0;
    } catch { document.getElementById('stat-media').textContent = '—'; }

    if (profile) {
      document.getElementById('profile-name').value = profile.full_name || '';
      document.getElementById('profile-title').value = profile.title || '';
      document.getElementById('profile-bio').value = profile.biography || '';
      document.getElementById('profile-email').value = profile.email || '';
      document.getElementById('profile-telegram').value = profile.telegram || '';
      document.getElementById('profile-github').value = profile.github || '';
      document.getElementById('profile-linkedin').value = profile.linkedin || '';
      if (profile.photo_url) document.getElementById('admin-profile-preview').src = profile.photo_url;
    }

    const tbody = document.getElementById('recent-projects-body');
    if (tbody) {
      tbody.innerHTML = projects.slice(0,5).map(p => `<tr>
        <td style="color:#fff;font-weight:500;">${escHtml(p.title)}</td>
        <td><span class="badge badge-cyan">${escHtml(p.category||'')}</span></td>
        <td><span class="badge badge-green">Published</span></td>
        <td style="color:var(--text-muted);">${escHtml((p.created_at||'').split('T')[0])}</td>
      </tr>`).join('') || '<tr><td colspan="4" style="text-align:center;color:#475569;padding:24px;">No projects yet</td></tr>';
    }

    renderAdminProjects(projects);
    renderAdminSkills(skills);
    renderAdminMedia();
  } catch (err) { console.error('Refresh error:', err); showToast('Error loading data: ' + err.message, 'error'); }
}

/* ══════════════════════════════════════════════════
   ADMIN — TABLES
══════════════════════════════════════════════════ */
function renderAdminProjects(projects) {
  const list = projects || appData.allProjects;
  const tbody = document.getElementById('admin-projects-body');
  if (!tbody) return;
  tbody.innerHTML = list.map(p => `<tr>
    <td><img src="${escHtml(p.image_url||'https://picsum.photos/seed/'+p.id+'/60/40.webp')}"
      alt="${escHtml(p.title)} thumbnail" style="width:60px;height:40px;object-fit:cover;border-radius:6px;border:1px solid var(--border);" loading="lazy" /></td>
    <td style="color:#fff;font-weight:500;">${escHtml(p.title)}</td>
    <td><span class="badge badge-cyan">${escHtml(p.category||'')}</span></td>
    <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtml(p.technologies||'')}</td>
    <td style="color:var(--text-muted);">${escHtml((p.created_at||'').split('T')[0])}</td>
    <td><div style="display:flex;gap:8px;">
      <button class="btn-outline btn-sm" onclick="openProjectModal('${escHtml(p.id)}')"><i class="fas fa-edit"></i></button>
      <button class="btn-danger btn-sm" onclick="deleteItem('project','${escHtml(p.id)}')"><i class="fas fa-trash"></i></button>
    </div></td>
  </tr>`).join('') || '<tr><td colspan="6" style="text-align:center;color:#475569;padding:24px;">No projects yet.</td></tr>';
}

function renderAdminSkills(skills) {
  const list = skills || appData.allSkills;
  const tbody = document.getElementById('admin-skills-body');
  if (!tbody) return;
  tbody.innerHTML = list.map(s => `<tr>
    <td style="color:#fff;font-weight:500;"><div style="display:flex;align-items:center;gap:10px;">
      <i class="${s.icon||'fas fa-code'}" style="color:var(--cyan);width:16px;"></i>${escHtml(s.skill_name)}
    </div></td>
    <td><span class="badge badge-purple">${escHtml(s.category||'')}</span></td>
    <td style="color:var(--cyan);font-family:'Orbitron',sans-serif;font-weight:600;">${s.percentage}%</td>
    <td style="width:150px;"><div style="background:rgba(255,255,255,0.06);height:4px;border-radius:2px;overflow:hidden;">
      <div style="height:100%;width:${s.percentage}%;background:linear-gradient(90deg,var(--cyan),var(--blue));border-radius:2px;"></div>
    </div></td>
    <td><div style="display:flex;gap:8px;">
      <button class="btn-outline btn-sm" onclick="openSkillModal('${escHtml(s.id)}')"><i class="fas fa-edit"></i></button>
      <button class="btn-danger btn-sm" onclick="deleteItem('skill','${escHtml(s.id)}')"><i class="fas fa-trash"></i></button>
    </div></td>
  </tr>`).join('') || '<tr><td colspan="5" style="text-align:center;color:#475569;padding:24px;">No skills yet.</td></tr>';
}

async function renderAdminMedia() {
  const grid = document.getElementById('media-grid');
  if (!grid) return;
  try {
    const { data: files, error } = await sb.storage.from('media-library').list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
    if (error || !files) { grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:#475569;padding:40px;font-family:\'Share Tech Mono\',monospace;">No media files yet.</div>'; return; }
    const mediaFiles = files.filter(f => f.name !== '.emptyFolderPlaceholder');
    if (!mediaFiles.length) { grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:#475569;padding:40px;font-family:\'Share Tech Mono\',monospace;">No media files yet. Upload some!</div>'; return; }
    grid.innerHTML = mediaFiles.map(f => {
      const url = sb.storage.from('media-library').getPublicUrl(f.name).data.publicUrl;
      return `<div style="position:relative;border-radius:10px;overflow:hidden;border:1px solid var(--border);aspect-ratio:1;background:rgba(10,20,40,0.5);">
        <img src="${escHtml(url)}" alt="${escHtml(f.name)}" style="width:100%;height:100%;object-fit:cover;" loading="lazy" />
        <div style="position:absolute;inset:0;background:rgba(0,0,0,0.5);opacity:0;transition:opacity 0.3s;display:flex;align-items:center;justify-content:center;gap:8px;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0">
          <button class="btn-outline btn-sm" onclick="copyToClipboard('${escHtml(url)}')" title="Copy URL"><i class="fas fa-copy"></i></button>
          <button class="btn-danger btn-sm" onclick="deleteMedia('${escHtml(f.name)}')"><i class="fas fa-trash"></i></button>
        </div>
        <div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,0.8));padding:8px;font-size:10px;font-family:'Share Tech Mono',monospace;color:#94a3b8;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtml(f.name)}</div>
      </div>`;
    }).join('');
  } catch (err) { grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--pink);padding:40px;font-family:\'Share Tech Mono\',monospace;">Error loading media: ' + escHtml(err.message) + '</div>'; }
}

window.copyToClipboard = function(text) {
  navigator.clipboard.writeText(text).then(() => showToast(typeof t==='function'?t('toast.url.copied'):'URL copied to clipboard!', 'success')).catch(() => showToast('Could not copy URL.', 'error'));
}

/* ══════════════════════════════════════════════════
   PROFILE SAVE
══════════════════════════════════════════════════ */
window.handleProfileSave = async function(e) {
  e.preventDefault();
  const btn = document.getElementById('save-profile-btn');
  btn.disabled = true; btn.innerHTML = '<span><i class="fas fa-spinner fa-spin" style="margin-right:8px;"></i>Saving...</span>';

  const currentProfile = appData.profile;
  const payload = {
    full_name: document.getElementById('profile-name').value,
    title: document.getElementById('profile-title').value,
    biography: document.getElementById('profile-bio').value,
    email: document.getElementById('profile-email').value,
    telegram: document.getElementById('profile-telegram').value,
    github: document.getElementById('profile-github').value,
    linkedin: document.getElementById('profile-linkedin').value,
    updated_at: new Date().toISOString(),
    ...(currentProfile?.photo_url ? { photo_url: currentProfile.photo_url } : {})
  };

  let res;
  if (currentProfile?.id) {
    res = await sb.from('profiles').update(payload).eq('id', currentProfile.id);
  } else {
    res = await sb.from('profiles').insert(payload);
  }

  btn.disabled = false; btn.innerHTML = '<span><i class="fas fa-save" style="margin-right:8px;"></i>SAVE PROFILE</span>';

  if (res.error) { showToast('Error: ' + res.error.message, 'error'); }
  else { showToast('Profile saved successfully!', 'success'); await refreshAdminData(); }
}

/* ══════════════════════════════════════════════════
   PHOTO UPLOAD → SUPABASE STORAGE
══════════════════════════════════════════════════ */
window.handlePhotoUpload = async function(e) {
  const file = e.target.files[0]; if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast('File too large. Max 5MB.', 'error'); return; }

  const progress = document.getElementById('photo-upload-progress');
  if (progress) progress.classList.remove('hidden');

  const ext = file.name.split('.').pop();
  const fileName = `profile-${Date.now()}.${ext}`;

  const { data: uploadData, error: uploadErr } = await sb.storage.from('profile-photos').upload(fileName, file, { upsert: true });

  if (uploadErr) {
    if (progress) progress.classList.add('hidden');
    showToast('Upload failed: ' + uploadErr.message, 'error'); return;
  }

  const { data: urlData } = sb.storage.from('profile-photos').getPublicUrl(fileName);
  const publicUrl = urlData.publicUrl;

  const currentProfile = appData.profile;
  let res;
  if (currentProfile?.id) {
    res = await sb.from('profiles').update({ photo_url: publicUrl, updated_at: new Date().toISOString() }).eq('id', currentProfile.id);
  } else {
    res = await sb.from('profiles').insert({ photo_url: publicUrl });
  }

  if (progress) progress.classList.add('hidden');
  if (res.error) { showToast('Could not save photo URL: ' + res.error.message, 'error'); return; }

  document.getElementById('admin-profile-preview').src = publicUrl;
  document.getElementById('about-photo').src = publicUrl;
  if (appData.profile) appData.profile.photo_url = publicUrl;
  showToast('Profile photo updated!', 'success');
}

/* ══════════════════════════════════════════════════
   PROJECT CRUD
══════════════════════════════════════════════════ */
window.openProjectModal = function(id) {
  const modal = document.getElementById('project-modal');
  modal.classList.add('open');
  document.getElementById('project-id').value = '';
  document.getElementById('project-modal-title').textContent = 'Add Project';
  document.getElementById('project-form').reset();
  setProjImagePreview('');
  if (id) {
    const p = appData.allProjects.find(x => x.id === id);
    if (!p) return;
    document.getElementById('project-modal-title').textContent = 'Edit Project';
    document.getElementById('project-id').value = p.id;
    document.getElementById('proj-title').value = p.title || '';
    document.getElementById('proj-category').value = p.category || '';
    document.getElementById('proj-description').value = p.description || '';
    document.getElementById('proj-technologies').value = p.technologies || '';
    document.getElementById('proj-github').value = p.github_url || '';
    document.getElementById('proj-demo').value = p.demo_url || '';
    document.getElementById('proj-image').value = p.image_url || '';
    setProjImagePreview(p.image_url || '');
  }
}
window.closeProjectModal = function() { document.getElementById('project-modal').classList.remove('open'); }

function setProjImagePreview(url) {
  const wrap = document.getElementById('proj-img-preview-wrap');
  const placeholder = document.getElementById('proj-img-placeholder');
  const img = document.getElementById('proj-img-preview');
  const progress = document.getElementById('proj-img-progress');
  if (progress) progress.style.display = 'none';
  if (url) {
    img.src = url;
    wrap.style.display = 'block';
    placeholder.style.display = 'none';
  } else {
    wrap.style.display = 'none';
    placeholder.style.display = 'block';
    img.src = '';
  }
}
window.syncProjImagePreview = function(url) { setProjImagePreview(url); }

window.handleProjectImageUpload = async function(e) {
  const file = e.target.files[0]; if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast('File too large. Max 5MB.', 'error'); e.target.value = ''; return; }

  const reader = new FileReader();
  reader.onload = ev => {
    document.getElementById('proj-img-preview').src = ev.target.result;
    document.getElementById('proj-img-preview-wrap').style.display = 'block';
    document.getElementById('proj-img-placeholder').style.display = 'none';
  };
  reader.readAsDataURL(file);

  document.getElementById('proj-img-progress').style.display = 'block';
  document.getElementById('proj-img-preview-wrap').style.display = 'none';
  document.getElementById('proj-img-placeholder').style.display = 'none';
  document.getElementById('proj-img-file').disabled = true;

  const ext = file.name.split('.').pop().toLowerCase();
  const fileName = `project-${Date.now()}-${Math.random().toString(36).substring(2,7)}.${ext}`;

  const { error: upErr } = await sb.storage.from('project-images').upload(fileName, file, { upsert: true });

  document.getElementById('proj-img-progress').style.display = 'none';
  document.getElementById('proj-img-file').disabled = false;
  e.target.value = '';

  if (upErr) {
    setProjImagePreview('');
    showToast('Upload failed: ' + upErr.message, 'error');
    return;
  }

  const { data: urlData } = sb.storage.from('project-images').getPublicUrl(fileName);
  const publicUrl = urlData.publicUrl;
  document.getElementById('proj-image').value = publicUrl;
  setProjImagePreview(publicUrl);
  showToast('Image uploaded successfully!', 'success');
}

window.handleProjectSave = async function(e) {
  e.preventDefault();
  const id = document.getElementById('project-id').value;
  const btn = document.getElementById('save-proj-btn');
  btn.disabled = true; btn.innerHTML = '<span><i class="fas fa-spinner fa-spin" style="margin-right:8px;"></i>Saving...</span>';

  const payload = {
    title: document.getElementById('proj-title').value,
    category: document.getElementById('proj-category').value,
    description: document.getElementById('proj-description').value,
    technologies: document.getElementById('proj-technologies').value,
    github_url: document.getElementById('proj-github').value || null,
    demo_url: document.getElementById('proj-demo').value || null,
    image_url: document.getElementById('proj-image').value || null,
  };

  let res;
  if (id) { res = await sb.from('projects').update(payload).eq('id', id); }
  else { res = await sb.from('projects').insert(payload); }

  btn.disabled = false; btn.innerHTML = '<span>Save Project</span>';
  if (res.error) { showToast('Error: ' + res.error.message, 'error'); return; }

  closeProjectModal();
  showToast(id ? 'Project updated!' : 'Project added!', 'success');
  await refreshAdminData();
}

/* ══════════════════════════════════════════════════
   SKILL CRUD
══════════════════════════════════════════════════ */
window.openSkillModal = function(id) {
  const modal = document.getElementById('skill-modal');
  modal.classList.add('open');
  document.getElementById('skill-id').value = '';
  document.getElementById('skill-modal-title').textContent = 'Add Skill';
  document.getElementById('skill-form').reset();
  if (id) {
    const s = appData.allSkills.find(x => x.id === id);
    if (!s) return;
    document.getElementById('skill-modal-title').textContent = 'Edit Skill';
    document.getElementById('skill-id').value = s.id;
    document.getElementById('skill-name').value = s.skill_name || '';
    document.getElementById('skill-category').value = s.category || '';
    document.getElementById('skill-percentage').value = s.percentage || '';
    document.getElementById('skill-icon').value = s.icon || '';
  }
}
window.closeSkillModal = function() { document.getElementById('skill-modal').classList.remove('open'); }

window.handleSkillSave = async function(e) {
  e.preventDefault();
  const id = document.getElementById('skill-id').value;
  const btn = document.getElementById('save-skill-btn');
  btn.disabled = true; btn.innerHTML = '<span><i class="fas fa-spinner fa-spin" style="margin-right:8px;"></i>Saving...</span>';

  const payload = {
    skill_name: document.getElementById('skill-name').value,
    category: document.getElementById('skill-category').value,
    percentage: parseInt(document.getElementById('skill-percentage').value),
    icon: document.getElementById('skill-icon').value || 'fas fa-code'
  };

  let res;
  if (id) { res = await sb.from('skills').update(payload).eq('id', id); }
  else { res = await sb.from('skills').insert(payload); }

  btn.disabled = false; btn.innerHTML = '<span>Save Skill</span>';
  if (res.error) { showToast('Error: ' + res.error.message, 'error'); return; }

  closeSkillModal();
  showToast(id ? 'Skill updated!' : 'Skill added!', 'success');
  await refreshAdminData();
}

/* ══════════════════════════════════════════════════
   DELETE
══════════════════════════════════════════════════ */
window.deleteItem = function(type, id) {
  document.getElementById('confirm-message').textContent = `Delete this ${type}? This cannot be undone.`;
  document.getElementById('confirm-modal').classList.add('open');
  document.getElementById('confirm-action-btn').onclick = async () => {
    const table = type === 'project' ? 'projects' : 'skills';
    const { error } = await sb.from(table).delete().eq('id', id);
    if (error) { showToast('Error: ' + error.message, 'error'); closeConfirmModal(); return; }
    closeConfirmModal();
    showToast(`${type.charAt(0).toUpperCase()+type.slice(1)} deleted.`, 'success');
    await refreshAdminData();
  };
}
window.closeConfirmModal = function() { document.getElementById('confirm-modal').classList.remove('open'); }

window.deleteMedia = async function(fileName) {
  const { error } = await sb.storage.from('media-library').remove([fileName]);
  if (error) { showToast('Error: ' + error.message, 'error'); return; }
  showToast('Media file deleted.', 'success');
  renderAdminMedia();
  const statEl = document.getElementById('stat-media');
  if (statEl) statEl.textContent = Math.max(0, parseInt(statEl.textContent) - 1);
}

/* ══════════════════════════════════════════════════
   MEDIA UPLOAD → SUPABASE STORAGE
══════════════════════════════════════════════════ */
window.handleMediaUpload = async function(e) {
  const files = Array.from(e.target.files);
  for (const file of files) {
    if (file.size > 10 * 1024 * 1024) { showToast(`${file.name} too large. Max 10MB.`, 'error'); continue; }
    const ext = file.name.split('.').pop();
    const fileName = `media-${Date.now()}-${Math.random().toString(36).substring(2,8)}.${ext}`;
    showToast(`Uploading ${file.name}...`, 'info');
    const { error } = await sb.storage.from('media-library').upload(fileName, file, { upsert: false });
    if (error) { showToast(`Upload failed: ${error.message}`, 'error'); continue; }
    showToast(`${file.name} uploaded!`, 'success');
  }
  e.target.value = '';
  renderAdminMedia();
  try {
    const { data: mf } = await sb.storage.from('media-library').list('', { limit: 100 });
    document.getElementById('stat-media').textContent = mf ? mf.filter(f => f.name !== '.emptyFolderPlaceholder').length : 0;
  } catch {}
}

/* ══════════════════════════════════════════════════
   SIDEBAR
══════════════════════════════════════════════════ */
window.switchPage = function(page) {
  document.querySelectorAll('.dashboard-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-nav-item').forEach(n => n.classList.remove('active'));
  const pageEl = document.getElementById('page-' + page);
  if (pageEl) pageEl.classList.add('active');
  document.querySelector(`.sidebar-nav-item[data-page="${page}"]`)?.classList.add('active');
  if (window.innerWidth <= 768) toggleSidebar(false);
}
window.toggleSidebar = function(force) {
  const sidebar = document.getElementById('admin-sidebar');
  const state = force !== undefined ? force : !sidebar.classList.contains('open');
  sidebar.classList.toggle('open', state);
}

/* ══════════════════════════════════════════════════
   DRAG AND DROP HANDLERS
══════════════════════════════════════════════════ */
const projImgZone = document.getElementById('proj-img-upload-zone');
if (projImgZone) {
  projImgZone.addEventListener('dragover', e => { e.preventDefault(); projImgZone.classList.add('dragover'); });
  projImgZone.addEventListener('dragleave', () => projImgZone.classList.remove('dragover'));
  projImgZone.addEventListener('drop', e => {
    e.preventDefault(); projImgZone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files && files.length) handleProjectImageUpload({ target: { files, value: '' } });
  });
  projImgZone.addEventListener('mouseover', () => {
    const overlay = document.getElementById('proj-img-overlay');
    if (overlay) overlay.style.opacity = '1';
  });
  projImgZone.addEventListener('mouseout', () => {
    const overlay = document.getElementById('proj-img-overlay');
    if (overlay) overlay.style.opacity = '0';
  });
}

['project-modal','skill-modal','confirm-modal'].forEach(id => {
  document.getElementById(id).addEventListener('click', e => {
    if (e.target.id === id) {
      if (id === 'project-modal') closeProjectModal();
      else if (id === 'skill-modal') closeSkillModal();
      else closeConfirmModal();
    }
  });
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeProjectModal(); closeSkillModal(); closeConfirmModal(); }
});

const photoDropZone = document.getElementById('photo-drop-zone');
const photoHoverOverlay = document.getElementById('photo-hover-overlay');
if (photoDropZone && photoHoverOverlay) {
  photoDropZone.addEventListener('mouseover', () => { photoHoverOverlay.style.opacity = '1'; });
  photoDropZone.addEventListener('mouseout', () => { photoHoverOverlay.style.opacity = '0'; });
}

window.photoDrop = function(e) {
  e.preventDefault();
  const zone = document.getElementById('photo-drop-zone');
  if (zone) { zone.style.borderColor = ''; zone.style.background = ''; }
  const files = e.dataTransfer.files;
  if (files && files.length) handlePhotoUpload({ target: { files } });
}

document.querySelectorAll('.upload-zone').forEach(zone => {
  if (zone.id === 'photo-drop-zone') return;
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length) handleMediaUpload({ target: { files, value: '' } });
  });
});

/* ══════════════════════════════════════════════════
   PARALLAX HERO
══════════════════════════════════════════════════ */
document.addEventListener('mousemove', e => {
  const hero = document.getElementById('hero'); if (!hero) return;
  if (e.clientY < hero.getBoundingClientRect().bottom) {
    const x = (e.clientX / window.innerWidth - 0.5) * 20, y = (e.clientY / window.innerHeight - 0.5) * 20;
    document.querySelectorAll('.float-icon').forEach((el, i) => {
      el.style.transform = `translate(${x*(i+1)*0.1}px,${y*(i+1)*0.1}px)`;
    });
  }
});

/* ══════════════════════════════════════════════════
   AUTH STATE LISTENER + INIT
══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  const savedLang = localStorage.getItem('portfolio_lang') || 'en';
  if (savedLang !== 'en') { setLanguage(savedLang); } else { translatePage(); }

  await loadPublicData();
  observeAnimated();

  const { data: { session } } = await sb.auth.getSession();

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('error') === 'access_denied') {
    setLoginError('Login was cancelled.');
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  sb.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      if (document.getElementById('admin-section').classList.contains('active')) {
        showDashboard(session.user);
      }
    }
  });

  if (window.location.hash === '#admin') {
    showAdmin(null);
    if (session?.user) showDashboard(session.user);
  }

  const loader = document.getElementById('pageLoader');
  if (loader) { loader.classList.add('fade-out'); setTimeout(() => loader.remove(), 500); }
});

/* ══════════════════════════════════════════════════
   I18N SYSTEM — BILINGUAL EN / KH
══════════════════════════════════════════════════ */
const i18n = {
  en: {
    'nav.home':'Home','nav.about':'About','nav.skills':'Skills','nav.experience':'Experience',
    'nav.projects':'Projects','nav.contact':'Contact','nav.admin':'ADMIN',
    'hero.badge':'> CYBERSECURITY_PORTFOLIO.EXE',
    'hero.desc':'Passionate about network security and ethical hacking. Specializing in FortiGate & MikroTik configurations, penetration testing, and building robust security architectures.',
    'hero.btn.projects':'View Projects','hero.btn.contact':'Contact Me',
    'about.tag':'ABOUT.ME','about.title':'Who I Am','about.status':'Available for hire',
    'about.stat.projects':'PROJECTS','about.stat.tech':'TECHNOLOGIES','about.stat.labs':'SECURITY LABS',
    'skills.tag':'CAPABILITIES','skills.title':'Technical Skills',
    'skills.filter.all':'All','skills.filter.cyber':'Cybersecurity','skills.filter.network':'Networking',
    'skills.filter.web':'Web Dev','skills.filter.sysadmin':'SysAdmin',
    'exp.tag':'JOURNEY','exp.title':'Experience & Timeline',
    'projects.tag':'PORTFOLIO','projects.title':'Featured Projects',
    'projects.filter.all':'All','projects.filter.security':'Security',
    'projects.filter.web':'Web','projects.filter.network':'Networking',
    'contact.tag':'CONNECT','contact.title':'Get In Touch',
    'contact.subtitle':"Whether you have a question, project idea, or just want to say hello — my inbox is always open.",
    'contact.form.title':'Send a Message','contact.form.name':'Name','contact.form.email':'Email',
    'contact.form.message':'Message','contact.form.name.ph':'Your name',
    'contact.form.msg.ph':'Your message...','contact.form.btn':'SEND MESSAGE',
    'footer.tagline':'Cybersecurity enthusiast and network security learner. Building secure digital futures one packet at a time.',
    'footer.nav':'NAVIGATION','footer.expertise':'EXPERTISE',
    'admin.title':'Admin Access','admin.subtitle':'SECURE_LOGIN // SUPABASE AUTH',
    'admin.email':'Email','admin.password':'Password','admin.login.btn':'ACCESS DASHBOARD',
    'admin.forgot':'Forgot password?',
    'admin.nav.overview':'Overview','admin.nav.profile':'Profile','admin.nav.projects':'Projects',
    'admin.nav.skills':'Skills','admin.nav.media':'Media','admin.nav.cv':'CV / Resume','admin.nav.viewsite':'View Site','admin.nav.logout':'Logout',
    'hero.btn.view.cv':'View CV','hero.btn.download.cv':'Download CV',
    'toast.msg.sent':"Message sent! I\'ll get back to you soon.",'toast.msg.failed':'Failed to send: ',
    'toast.profile.saved':'Profile saved successfully!','toast.photo.updated':'Profile photo updated!',
    'toast.photo.large':'File too large. Max 5MB.',
    'toast.proj.added':'Project added!','toast.proj.updated':'Project updated!','toast.proj.deleted':'Project deleted.',
    'toast.skill.added':'Skill added!','toast.skill.updated':'Skill updated!','toast.skill.deleted':'Skill deleted.',
    'toast.media.deleted':'Media file deleted.','toast.url.copied':'URL copied to clipboard!',
    'toast.logged.out':'Logged out successfully.'
  },
  km: {
    'nav.home':'ទំព័រដើម','nav.about':'អំពីខ្ញុំ','nav.skills':'ជំនាញ','nav.experience':'បទពិសោធន៍',
    'nav.projects':'គម្រោង','nav.contact':'ទំនាក់ទំនង','nav.admin':'គ្រប់គ្រង',
    'hero.badge':'> ផលប័ត្រសន្តិសុខ.EXE',
    'hero.desc':'ចូលចិត្តសន្តិសុខបណ្តាញ និងការ hack ប្រកបដោយក្រមសីលធម៌។ ជំនាញលើ FortiGate, MikroTik, ការ testing ចូលប្រើ និងការសាង​សង់ architecture សន្តិសុខ​ដ៏រឹង​មាំ Bowen',
    'hero.btn.projects':'មើលគម្រោង','hero.btn.contact':'ទំនាក់ទំនង',
    'about.tag':'អំពីខ្ញុំ','about.title':'ខ្ញុំជានរណា','about.status':'ទទួលការងារ',
    'about.stat.projects':'គម្រោង','about.stat.tech':'បច្ចេកវិទ្យា','about.stat.labs':'មន្ទីរពិសោធន៍',
    'skills.tag':'សមត្ថភាព','skills.title':'ជំនាញបច្ចេកទេស',
    'skills.filter.all':'ទាំងអស់','skills.filter.cyber':'សន្តិសុខ','skills.filter.network':'បណ្តាញ',
    'skills.filter.web':'Web','skills.filter.sysadmin':'SysAdmin',
    'exp.tag':'ដំណើរ','exp.title':'បទពិសោធន៍ & ប្រវត្តិ',
    'projects.tag':'ផលប័ត្រ','projects.title':'គម្រោងពិសេស',
    'projects.filter.all':'ទាំងអស់','projects.filter.security':'សន្តិសុខ',
    'projects.filter.web':'Web','projects.filter.network':'បណ្តាញ',
    'contact.tag':'ភ្ជាប់','contact.title':'ទំនាក់ទំនង',
    'contact.subtitle':'មិនថា​ អ្នក​មាន​សំណួរ, គំនិត​គម្រោង, ឬ​គ្រាន់​តែ​ចង់​ស្វាគមន៍ — ខ្ញុំ​តែងតែ​ចង់​ឮ​ពីអ្នក',
    'contact.form.title':'ផ្ញើ​សារ','contact.form.name':'ឈ្មោះ','contact.form.email':'អ៊ីមែល',
    'contact.form.message':'សារ','contact.form.name.ph':'ឈ្មោះ​របស់​អ្នក',
    'contact.form.msg.ph':'សារ​របស់​អ្នក...','contact.form.btn':'ផ្ញើ​សារ',
    'footer.tagline':'អ្នក​ចូល​ចិត្ត​សន្តិសុខ cyber និង​ការ​រៀន​សន្តិសុខ​បណ្តាញ Bowen ការ​សាង​សង់​អនាគត​ digital ប្រកប​ដោយ​សុវត្ថិភាព​ម្ដង​មួយ​ packet។',
    'footer.nav':'រុករក','footer.expertise':'ជំនាញ',
    'admin.title':'ចូល​ Admin','admin.subtitle':'ចូល​ប្រើ​ប្រាស់​ប្រកប​ដោយ​សុវត្ថិភាព',
    'admin.email':'អ៊ីមែល','admin.password':'ពាក្យ​សម្ងាត់','admin.login.btn':'ចូល Dashboard',
    'admin.forgot':'ភ្លេច​ពាក្យ​សម្ងាត់?',
    'admin.nav.overview':'ទិដ្ឋភាព','admin.nav.profile':'ប្រវត្តិ','admin.nav.projects':'គម្រោង',
    'admin.nav.skills':'ជំនាញ','admin.nav.media':'មេឌៀ','admin.nav.cv':'CV / Resume','admin.nav.viewsite':'មើល​គេហទំព័រ','admin.nav.logout':'ចេញ',
    'hero.btn.view.cv':'មើល CV','hero.btn.download.cv':'ទាញ CV',
    'toast.msg.sent':'សារ​បាន​ផ្ញើ! ខ្ញុំ​នឹង​ឆ្លើយ​ក្នុង​ពេល​ឆាប់ៗ','toast.msg.failed':'បរាជ័យ​ក្នុង​ការ​ផ្ញើ: ',
    'toast.profile.saved':'Profile ​បាន​រក្សា​ទុក!','toast.photo.updated':'រូបថត Profile បាន​ធ្វើ​បច្ចុប្បន្ន​ភាព!',
    'toast.photo.large':'ឯកសារ​ធំ​ពេក។ អតិបរមា 5MB.',
    'toast.proj.added':'គម្រោង​បាន​បន្ថែម!','toast.proj.updated':'គម្រោង​បាន​ធ្វើ​បច្ចុប្បន្ន​ភាព!','toast.proj.deleted':'គម្រោង​ត្រូវ​បាន​លុប។',
    'toast.skill.added':'ជំនាញ​បាន​បន្ថែម!','toast.skill.updated':'ជំនាញ​បាន​ធ្វើ​បច្ចុប្បន្ន​ភាព!','toast.skill.deleted':'ជំនាញ​ត្រូវ​បាន​លុប។',
    'toast.media.deleted':'ឯកសារ​មេឌៀ​ត្រូវ​បាន​លុប។','toast.url.copied':'URL ​ត្រូវ​បាន​ចម្លង!',
    'toast.logged.out':'ចេញ​ដោយ​ជោគជ័យ Burt'
  }
};

let currentLang = localStorage.getItem('portfolio_lang') || 'en';

function t(key) {
  return (i18n[currentLang] && i18n[currentLang][key]) || (i18n['en'][key]) || key;
}

function translatePage() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = t(key);
    if (val) el.textContent = val;
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.getAttribute('data-i18n-ph');
    const val = t(key);
    if (val) el.placeholder = val;
  });
  document.title = currentLang === 'km' ? 'Horn Oudom | ផលប័ត្រ​សន្តិសុខ' : 'Horn Oudom | Cybersecurity Portfolio';
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = currentLang === 'km' ? 'Horn Oudom – អ្នក​ចូល​ចិត្ត​សន្តិសុខ​ cyber, FortiGate, MikroTik' : 'Horn Oudom – Cybersecurity Enthusiast, Network Security Learner';
}

window.setLanguage = function(lang) {
  currentLang = lang;
  localStorage.setItem('portfolio_lang', lang);
  document.body.classList.toggle('lang-km', lang === 'km');
  document.body.classList.toggle('lang-en', lang === 'en');
  document.documentElement.lang = lang === 'km' ? 'km' : 'en';
  document.getElementById('btn-lang-en').classList.toggle('active', lang === 'en');
  document.getElementById('btn-lang-km').classList.toggle('active', lang === 'km');
  translatePage();
  renderSkills();
  renderProjects();
  renderTimeline();
}

const _origLoadPublicData = loadPublicData;
async function loadPublicDataWithTranslate() {
  await _origLoadPublicData.call(this);
  translatePage();
}

/* ══════════════════════════════════════════════════
   CV / RESUME MANAGEMENT
══════════════════════════════════════════════════ */
function renderAdminCvSection(cvUrl) {
  const noFile = document.getElementById('cv-no-file');
  const fileInfo = document.getElementById('cv-file-info');
  const urlDisplay = document.getElementById('cv-url-display');
  const viewLink = document.getElementById('cv-view-link');
  const dlLink = document.getElementById('cv-download-link');
  if (!noFile || !fileInfo) return;
  if (cvUrl) {
    noFile.classList.add('hidden');
    fileInfo.classList.remove('hidden');
    if (urlDisplay) urlDisplay.textContent = cvUrl.split('/').pop() || cvUrl;
    if (viewLink) viewLink.href = cvUrl;
    if (dlLink) dlLink.href = cvUrl;
  } else {
    noFile.classList.remove('hidden');
    fileInfo.classList.add('hidden');
  }
}

window.handleCvUpload = async function(e) {
  const files = e.target ? e.target.files : e;
  const file = files[0]; if (!file) return;
  if (file.size > 10 * 1024 * 1024) { showToast('File too large. Max 10MB.', 'error'); return; }

  try { if (e.target && e.target.value !== undefined) e.target.value = ''; } catch(ex) {}

  const progress = document.getElementById('cv-upload-progress');
  const dropZone = document.getElementById('cv-drop-zone');
  const chooseBtn = document.querySelector('#page-cv .btn-primary');
  if (progress) progress.classList.remove('hidden');
  if (dropZone) dropZone.style.display = 'none';
  if (chooseBtn) chooseBtn.disabled = true;

  try {
    const ext = file.name.split('.').pop().toLowerCase();
    const fileName = `cv-hornoudom-${Date.now()}.${ext}`;

    const { data: uploadData, error: upErr } = await sb.storage
      .from('media-library')
      .upload(fileName, file, { upsert: true, cacheControl: '3600' });

    if (upErr) {
      let errMsg = upErr.message || 'Storage upload failed.';
      if (upErr.statusCode) errMsg += ' (code ' + upErr.statusCode + ')';
      throw new Error(errMsg);
    }

    const { data: urlData } = sb.storage.from('media-library').getPublicUrl(fileName);
    const publicUrl = urlData.publicUrl;

    const { data: freshProfile, error: profFetchErr } = await sb.from('profiles').select('id').limit(1).single();

    let saveRes;
    if (freshProfile?.id) {
      saveRes = await sb.from('profiles')
        .update({ cv_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', freshProfile.id);
    } else {
      saveRes = await sb.from('profiles').insert({ cv_url: publicUrl });
    }

    if (saveRes.error) throw new Error('Could not save CV link: ' + saveRes.error.message);

    if (!appData.profile) appData.profile = {};
    appData.profile.cv_url = publicUrl;
    if (freshProfile?.id) appData.profile.id = freshProfile.id;

    renderAdminCvSection(publicUrl);

    const viewBtn = document.getElementById('hero-view-cv-btn');
    const dlBtn   = document.getElementById('hero-download-cv-btn');
    if (viewBtn) { viewBtn.href = publicUrl; viewBtn.classList.remove('hidden'); }
    if (dlBtn)   { dlBtn.href   = publicUrl; dlBtn.classList.remove('hidden'); }

    showToast('CV uploaded successfully!', 'success');
  } catch (err) {
    console.error('CV upload error:', err);
    showToast('Upload failed: ' + (err.message || 'Unknown error'), 'error');
  } finally {
    if (progress) progress.classList.add('hidden');
    if (dropZone) dropZone.style.display = '';
    if (chooseBtn) chooseBtn.disabled = false;
  }
}

window.cvDrop = function(e) {
  e.preventDefault();
  const zone = document.getElementById('cv-drop-zone');
  if (zone) zone.classList.remove('dragover');
  const files = e.dataTransfer.files;
  if (files && files.length) handleCvUpload({ target: { files } });
}

window.removeCv = async function() {
  if (!appData.profile?.cv_url) return;
  const currentProfile = appData.profile;
  const res = await sb.from('profiles').update({ cv_url: null, updated_at: new Date().toISOString() }).eq('id', currentProfile.id);
  if (res.error) { showToast('Error: ' + res.error.message, 'error'); return; }
  if (appData.profile) appData.profile.cv_url = null;
  renderAdminCvSection(null);
  const viewBtn = document.getElementById('hero-view-cv-btn');
  const dlBtn = document.getElementById('hero-download-cv-btn');
  if (viewBtn) viewBtn.classList.add('hidden');
  if (dlBtn) dlBtn.classList.add('hidden');
  showToast('CV removed.', 'info');
}

/* ══════════════════════════════════════════════════
   DARK / LIGHT MODE TOGGLE
══════════════════════════════════════════════════ */
let currentTheme = localStorage.getItem('portfolio_theme') || 'dark';

function applyTheme(theme) {
  currentTheme = theme;
  const isLight = theme === 'light';
  document.body.classList.toggle('light-mode', isLight);
  const icon = document.getElementById('theme-icon');
  if (icon) icon.className = isLight ? 'fas fa-moon' : 'fas fa-sun';
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    btn.title = isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode';
    btn.setAttribute('aria-label', isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode');
  }
  const loader = document.getElementById('pageLoader');
  if (loader) loader.style.background = isLight ? '#f0f4f8' : '#030712';
  localStorage.setItem('portfolio_theme', theme);
}

window.toggleTheme = function() {
  applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
}

document.addEventListener('DOMContentLoaded', () => {
  applyTheme(localStorage.getItem('portfolio_theme') || 'dark');
}, { once: true });

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    setLanguage(currentLang);
  }, 100);
});

window.onload = function() {
  var d = document.createElement('div');
  d.id = 'appLoadFinished';
  document.body.appendChild(d);
};