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
let resetEmail = '';

/* ══════════════════════════════════════════════════
   PARTICLES EFFECTS
══════════════════════════════════════════════════ */
(function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if(!canvas) return;
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
  if(!el) return;
  function type() {
    const phrases = phrasesData[window.currentLang || 'en'] || phrasesData.en;
    if (idx >= phrases.length) idx = 0;
    const phrase = phrases[idx];
    if (!deleting) { el.textContent = phrase.substring(0, charIdx + 1); charIdx++; if (charIdx === phrase.length) { deleting = true; setTimeout(type, 1800); return; } }
    else { el.textContent = phrase.substring(0, charIdx - 1); charIdx--; if (charIdx === 0) { deleting = false; idx = (idx + 1) % phrases.length; setTimeout(type, 300); return; } }
    setTimeout(type, deleting ? 40 : 60);
  }
  setTimeout(type, 1000);
})();

/* ══════════════════════════════════════════════════
   SCROLL EFFECTS & OBSERVER
══════════════════════════════════════════════════ */
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar'); if(nav) nav.classList.toggle('scrolled', window.scrollY > 50);
  const bt = document.getElementById('backTop'); if(bt) bt.classList.toggle('show', window.scrollY > 400);
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

function observeAnimated() { document.querySelectorAll('.anim-fade-up, .anim-fade-left, .anim-fade-right').forEach(el => observer.observe(el)); }

function animateCounter(el) {
  const target = parseInt(el.dataset.target); let count = 0;
  const step = Math.ceil(target / 30);
  const interval = setInterval(() => {
    count = Math.min(count + step, target); el.textContent = count + (target > 10 ? '+' : '');
    if (count >= target) clearInterval(interval);
  }, 40);
}

function escHtml(str) { if (str == null) return ''; return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;'); }

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container'); if(!container) return;
  const icons = { success: 'fas fa-check-circle', error: 'fas fa-exclamation-circle', info: 'fas fa-info-circle' };
  const toast = document.createElement('div'); toast.className = `toast toast-${type}`;
  toast.innerHTML = `<i class="${icons[type]}"></i>${escHtml(message)}`; container.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

/* ══════════════════════════════════════════════════
   DATA LOADING
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
  } catch (err) { console.error(err); }
}

function renderAbout() {
  const p = appData.profile; if (!p) return;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || ''; };
  set('about-name', p.full_name); set('about-title', p.title); set('about-bio', p.biography);
  if (p.photo_url) {
    const ap = document.getElementById('about-photo'); if(ap) ap.src = p.photo_url;
    const prev = document.getElementById('admin-profile-preview'); if (prev) prev.src = p.photo_url;
  }
  const viewBtn = document.getElementById('hero-view-cv-btn'); const dlBtn = document.getElementById('hero-download-cv-btn');
  if (p.cv_url) {
    if (viewBtn) { viewBtn.href = p.cv_url; viewBtn.classList.remove('hidden'); }
    if (dlBtn) { dlBtn.href = p.cv_url; dlBtn.classList.remove('hidden'); }
  } else {
    if (viewBtn) viewBtn.classList.add('hidden'); if (dlBtn) dlBtn.classList.add('hidden');
  }
  renderAdminCvSection(p.cv_url);
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

function renderSkills(filter) {
  if (filter !== undefined) currentFilter.skills = filter;
  const skills = currentFilter.skills === 'all' ? appData.allSkills : appData.allSkills.filter(s => s.category === currentFilter.skills);
  const grid = document.getElementById('skills-grid'); if (!grid) return;
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
  btn.classList.add('active'); renderSkills(cat);
}

function renderProjects(filter) {
  if (filter !== undefined) currentFilter.projects = filter;
  const projects = currentFilter.projects === 'all' ? appData.allProjects : appData.allProjects.filter(p => p.category === currentFilter.projects);
  const grid = document.getElementById('projects-grid'); if (!grid) return;
  if (!projects.length) { grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:#475569;padding:40px;font-family:\'Share Tech Mono\',monospace;">No projects found.</div>'; return; }
  grid.innerHTML = projects.map((p, i) => {
    const techs = (p.technologies || '').split(',').slice(0,4).map(t => `<span class="tech-tag">${escHtml(t.trim())}</span>`).join('');
    return `<div class="project-card anim-fade-up" style="transition-delay:${i*0.1}s;">
      <div class="project-img-wrap">
        <img src="${escHtml(p.image_url || 'https://picsum.photos/seed/' + p.id + '/600/300.webp')}" alt="${escHtml(p.title)} project screenshot" class="project-img" loading="lazy" />
        <div class="project-overlay"></div> <span class="project-category">${escHtml(p.category || 'Project')}</span>
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
  btn.classList.add('active'); renderProjects(cat);
}

function renderTimeline() {
  const timelineData = {
    en: [
      { year: '2025', title: 'Security Research & Pen Testing', subtitle: 'Self-Study & Labs', desc: 'Actively learning ethical hacking, CTF challenges, and building security labs with FortiGate and Kali Linux.', type: 'achievement' },
      { year: '2024', title: 'Network Security Internship', subtitle: 'IT Department', desc: 'Configured FortiGate firewalls, managed MikroTik routers, monitored network traffic, and improved security posture.', type: 'work' },
      { year: '2024', title: 'FortiGate NSE 1 & 2 Certified', subtitle: 'Fortinet Network Security', desc: 'Earned Fortinet Network Security certifications covering cybersecurity concepts and FortiGate fundamentals.', type: 'cert' },
      { year: '2023', title: 'Bachelor of Computer Science', subtitle: 'University – Cybersecurity Major', desc: 'Pursuing Computer Science with focus on network security, cryptography, and system administration.', type: 'edu' }
    ],
    km: [
      { year: '2025', title: 'ការស្រាវជ្រាវ Security & Pen Testing', subtitle: 'ការសិក្សាដោយខ្លួនឯង', desc: 'រៀន ethical hacking, CTF challenges, និងការសាងសង់ security labs ជាមួយ FortiGate និង Kali Linux.', type: 'achievement' },
      { year: '2024', title: 'កម្មសិក្សា Network Security', subtitle: 'នាយកដ្ឋាន IT', desc: 'កំណត់រចនាសម្ព័ន្ធ FortiGate, គ្រប់គ្រង MikroTik router, ត្រួតពិនិត្យ traffic.', type: 'work' },
      { year: '2024', title: 'FortiGate NSE 1 & 2', subtitle: 'Fortinet Network Security', desc: 'ទទួលបាន Fortinet certifications ស្ត឵បិ cybersecurity និង FortiGate fundamentals.', type: 'cert' },
      { year: '2023', title: 'បរិញ្ញាបត្រ Computer Science', subtitle: 'សាកលវិទ្យាល័យ – ឯកទេសសន្តិសុខ', desc: 'កំពុងសិក្សា Computer Science នា network security, cryptography.', type: 'edu' }
    ]
  };
  const timeline = timelineData[window.currentLang || 'en'] || timelineData.en;
  const list = document.getElementById('timeline-list'); if (!list) return;
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
   HAMBURGER MENU
══════════════════════════════════════════════════ */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
if(hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open'); mobileMenu.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
  });
}
window.closeMobileMenu = function() {
  if(hamburger && mobileMenu) { hamburger.classList.remove('open'); mobileMenu.classList.remove('open'); hamburger.setAttribute('aria-expanded', false); }
}

document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').substring(1); if (id === 'admin') return;
    const el = document.getElementById(id); if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth' }); }
  });
});

/* ══════════════════════════════════════════════════
   PUBLIC ACTIONS
══════════════════════════════════════════════════ */
window.handleContactSubmit = async function(e) {
  e.preventDefault(); const form = e.target; const btn = form.querySelector('button[type="submit"]');
  const name = form.name.value.trim(); const email = form.email.value.trim(); const message = form.message.value.trim();
  btn.disabled = true; btn.innerHTML = '<span><i class="fas fa-spinner fa-spin" style="margin-right:8px;"></i>SENDING...</span>';
  try {
    const { data, error } = await sb.functions.invoke('send-telegram', { body: { name, email, message } });
    if (error) throw new Error(error.message);
    showToast('Message sent! I\'ll get back to you soon.', 'success'); form.reset();
  } catch (err) { showToast('Failed to send: ' + err.message, 'error'); }
  finally { btn.disabled = false; btn.innerHTML = '<span><i class="fas fa-shield-halved" style="margin-right:8px;"></i>SEND MESSAGE</span>'; }
}

window.showAdmin = function(e) { if (e) e.preventDefault(); document.getElementById('public-site').style.display = 'none'; const adm = document.getElementById('admin-section'); adm.style.display = 'flex'; adm.classList.add('active'); window.location.hash = 'admin'; }
window.exitAdmin = function() { document.getElementById('admin-section').style.display = 'none'; document.getElementById('admin-section').classList.remove('active'); document.getElementById('public-site').style.display = 'block'; window.location.hash = ''; }
window.viewPortfolio = function() { exitAdmin(); window.scrollTo({ top: 0, behavior: 'smooth' }); }

window.showLoginView = function() { document.getElementById('login-view').classList.remove('hidden'); document.getElementById('forgot-view').classList.add('hidden'); document.getElementById('otp-view').classList.add('hidden'); document.getElementById('login-error').classList.add('hidden'); }
window.showForgotView = function() { document.getElementById('login-view').classList.add('hidden'); document.getElementById('forgot-view').classList.remove('hidden'); document.getElementById('otp-view').classList.add('hidden'); document.getElementById('login-error').classList.add('hidden'); }
window.showOtpView = function() { document.getElementById('forgot-view').classList.add('hidden'); document.getElementById('otp-view').classList.remove('hidden'); }

function setLoginError(msg) { const el = document.getElementById('login-error'); if(el){ el.textContent = msg; el.classList.remove('hidden'); } }

window.handleAdminLogin = async function(e) {
  e.preventDefault(); const email = document.getElementById('login-email').value.trim(); const password = document.getElementById('login-password').value;
  const btn = document.getElementById('login-btn'); btn.disabled = true; btn.innerHTML = '<span><i class="fas fa-spinner fa-spin" style="margin-right:8px;"></i>Authenticating...</span>';
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  btn.disabled = false; btn.innerHTML = '<span><i class="fas fa-right-to-bracket" style="margin-right:8px;"></i>ACCESS DASHBOARD</span>';
  if (error) { setLoginError(error.message); } else { showDashboard(data.user); }
}

window.handleForgotPassword = async function(e) {
  e.preventDefault(); const email = document.getElementById('forgot-email').value.trim(); const btn = document.getElementById('forgot-btn');
  btn.disabled = true; btn.innerHTML = '<span><i class="fas fa-spinner fa-spin" style="margin-right:8px;"></i>Sending...</span>'; resetEmail = email;
  const { error } = await sb.auth.resetPasswordForEmail(email); btn.disabled = false; btn.innerHTML = '<span><i class="fas fa-paper-plane" style="margin-right:8px;"></i>SEND OTP</span>';
  if (error) { setLoginError(error.message); } else { showToast('OTP sent to ' + email, 'success'); showOtpView(); }
}

window.handleOtpVerify = async function(e) {
  e.preventDefault(); const token = document.getElementById('otp-code').value.trim(); const password = document.getElementById('new-password').value;
  const btn = document.getElementById('otp-btn'); btn.disabled = true;
  const { error: verifyErr } = await sb.auth.verifyOtp({ email: resetEmail, token, type: 'recovery' });
  if (verifyErr) { btn.disabled = false; setLoginError(verifyErr.message); return; }
  const { error: updateErr } = await sb.auth.updateUser({ password }); btn.disabled = false;
  if (updateErr) { setLoginError(updateErr.message); } else { showToast('Password reset successful!', 'success'); showLoginView(); }
}

window.handleAdminLogout = async function() { await sb.auth.signOut(); document.getElementById('admin-login').style.display = 'flex'; document.getElementById('admin-dashboard').classList.add('hidden'); showLoginView(); }
window.togglePasswordVisibility = function() { const inp = document.getElementById('login-password'); const icon = document.getElementById('pwd-toggle'); if(inp && icon){ inp.type = inp.type === 'password' ? 'text' : 'password'; icon.className = inp.type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash'; } }

function showDashboard(user) { document.getElementById('admin-login').style.display = 'none'; document.getElementById('admin-dashboard').classList.remove('hidden'); if (user) { const em = document.getElementById('admin-user-email'); if (em) em.textContent = user.email; } refreshAdminData(); }

/* ══════════════════════════════════════════════════
   ADMIN — BACKEND REFRESH
══════════════════════════════════════════════════ */
async function refreshAdminData() {
  try {
    const [profileRes, skillsRes, projectsRes] = await Promise.all([
      sb.from('profiles').select('*').limit(1).single(), sb.from('skills').select('*').order('category'), sb.from('projects').select('*').order('created_at', { ascending: false })
    ]);
    const profile = profileRes.data; const skills = skillsRes.data || []; const projects = projectsRes.data || [];
    if (profile) { appData.profile = profile; renderAbout(); }
    appData.allSkills = skills; appData.skills = skills; renderSkills();
    appData.allProjects = projects; appData.projects = projects; renderProjects();
    
    document.getElementById('stat-projects').textContent = projects.length;
    document.getElementById('stat-skills').textContent = skills.length;
    
    if (profile) {
      document.getElementById('profile-name').value = profile.full_name || ''; document.getElementById('profile-title').value = profile.title || '';
      document.getElementById('profile-bio').value = profile.biography || ''; document.getElementById('profile-email').value = profile.email || '';
      document.getElementById('profile-telegram').value = profile.telegram || ''; document.getElementById('profile-github').value = profile.github || '';
      document.getElementById('profile-linkedin').value = profile.linkedin || '';
      if (profile.photo_url) document.getElementById('admin-profile-preview').src = profile.photo_url;
    }
    renderAdminProjects(projects); renderAdminSkills(skills); renderAdminMedia();
  } catch (err) { console.error(err); }
}

function renderAdminProjects(projects) {
  const tbody = document.getElementById('admin-projects-body'); if (!tbody) return;
  tbody.innerHTML = projects.map(p => `<tr>
    <td><img src="${escHtml(p.image_url)}" style="width:60px;height:40px;object-fit:cover;border-radius:6px;" /></td>
    <td style="color:#fff;">${escHtml(p.title)}</td> <td><span class="badge badge-cyan">${escHtml(p.category)}</span></td>
    <td>${escHtml(p.technologies)}</td> <td>${escHtml((p.created_at||'').split('T')[0])}</td>
    <td><div style="display:flex;gap:8px;"><button class="btn-outline btn-sm" onclick="openProjectModal('${p.id}')"><i class="fas fa-edit"></i></button><button class="btn-danger btn-sm" onclick="deleteItem('project','${p.id}')"><i class="fas fa-trash"></i></button></div></td>
  </tr>`).join('');
}

function renderAdminSkills(skills) {
  const tbody = document.getElementById('admin-skills-body'); if (!tbody) return;
  tbody.innerHTML = skills.map(s => `<tr>
    <td style="color:#fff;"><i class="${s.icon||'fas fa-code'}" style="color:var(--cyan);margin-right:8px;"></i>${escHtml(s.skill_name)}</td>
    <td><span class="badge badge-purple">${escHtml(s.category)}</span></td> <td>${s.percentage}%</td>
    <td><div style="background:rgba(255,255,255,0.06);height:4px;width:100px;border-radius:2px;"><div style="height:100%;width:${s.percentage}%;background:var(--cyan);"></div></div></td>
    <td><div style="display:flex;gap:8px;"><button class="btn-outline btn-sm" onclick="openSkillModal('${s.id}')"><i class="fas fa-edit"></i></button><button class="btn-danger btn-sm" onclick="deleteItem('skill','${s.id}')"><i class="fas fa-trash"></i></button></div></td>
  </tr>`).join('');
}

async function renderAdminMedia() {
  const grid = document.getElementById('media-grid'); if (!grid) return;
  const { data: files } = await sb.storage.from('media-library').list('');
  const mediaFiles = (files || []).filter(f => f.name !== '.emptyFolderPlaceholder');
  grid.innerHTML = mediaFiles.map(f => {
    const url = sb.storage.from('media-library').getPublicUrl(f.name).data.publicUrl;
    return `<div style="position:relative;border-radius:10px;overflow:hidden;border:1px solid var(--border);aspect-ratio:1;">
      <img src="${url}" style="width:100%;height:100%;object-fit:cover;" />
      <div style="position:absolute;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;gap:8px;opacity:0;transition:0.3s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0">
        <button class="btn-outline btn-sm" onclick="copyToClipboard('${url}')"><i class="fas fa-copy"></i></button>
        <button class="btn-danger btn-sm" onclick="deleteMedia('${f.name}')"><i class="fas fa-trash"></i></button>
      </div>
    </div>`;
  }).join('');
}

window.copyToClipboard = function(text) { navigator.clipboard.writeText(text).then(() => showToast('Copied URL!', 'success')); }

window.handleProfileSave = async function(e) {
  e.preventDefault(); const currentProfile = appData.profile;
  const payload = {
    full_name: document.getElementById('profile-name').value, title: document.getElementById('profile-title').value,
    biography: document.getElementById('profile-bio').value, email: document.getElementById('profile-email').value,
    telegram: document.getElementById('profile-telegram').value, github: document.getElementById('profile-github').value, linkedin: document.getElementById('profile-linkedin').value
  };
  let res = currentProfile?.id ? await sb.from('profiles').update(payload).eq('id', currentProfile.id) : await sb.from('profiles').insert(payload);
  if (res.error) showToast(res.error.message, 'error'); else { showToast('Saved!', 'success'); refreshAdminData(); }
}

window.handlePhotoUpload = async function(e) {
  const file = e.target.files[0]; if (!file) return;
  const fileName = `profile-${Date.now()}.${file.name.split('.').pop()}`;
  await sb.storage.from('profile-photos').upload(fileName, file);
  const url = sb.storage.from('profile-photos').getPublicUrl(fileName).data.publicUrl;
  await sb.from('profiles').update({ photo_url: url }).eq('id', appData.profile.id);
  refreshAdminData(); showToast('Photo updated!', 'success');
}

window.openProjectModal = function(id) {
  document.getElementById('project-modal').classList.add('open'); document.getElementById('project-form').reset(); document.getElementById('project-id').value = '';
  if(id) {
    const p = appData.allProjects.find(x => x.id === id); if(!p) return;
    document.getElementById('project-id').value = p.id; document.getElementById('proj-title').value = p.title; document.getElementById('proj-category').value = p.category;
    document.getElementById('proj-description').value = p.description; document.getElementById('proj-technologies').value = p.technologies;
    document.getElementById('proj-github').value = p.github_url; document.getElementById('proj-demo').value = p.demo_url; document.getElementById('proj-image').value = p.image_url;
    setProjImagePreview(p.image_url);
  }
}
window.closeProjectModal = function() { document.getElementById('project-modal').classList.remove('open'); }

window.handleProjectSave = async function(e) {
  e.preventDefault(); const id = document.getElementById('project-id').value;
  const payload = {
    title: document.getElementById('proj-title').value, category: document.getElementById('proj-category').value, description: document.getElementById('proj-description').value,
    technologies: document.getElementById('proj-technologies').value, github_url: document.getElementById('proj-github').value||null, demo_url: document.getElementById('proj-demo').value||null, image_url: document.getElementById('proj-image').value||null
  };
  let res = id ? await sb.from('projects').update(payload).eq('id', id) : await sb.from('projects').insert(payload);
  if(res.error) showToast(res.error.message, 'error'); else { closeProjectModal(); showToast('Saved!', 'success'); refreshAdminData(); }
}

window.openSkillModal = function(id) {
  document.getElementById('skill-modal').classList.add('open'); document.getElementById('skill-form').reset(); document.getElementById('skill-id').value = '';
  if(id) {
    const s = appData.allSkills.find(x => x.id === id); if(!s) return;
    document.getElementById('skill-id').value = s.id; document.getElementById('skill-name').value = s.skill_name;
    document.getElementById('skill-category').value = s.category; document.getElementById('skill-percentage').value = s.percentage; document.getElementById('skill-icon').value = s.icon;
  }
}
window.closeSkillModal = function() { document.getElementById('skill-modal').classList.remove('open'); }

window.handleSkillSave = async function(e) {
  e.preventDefault(); const id = document.getElementById('skill-id').value;
  const payload = { skill_name: document.getElementById('skill-name').value, category: document.getElementById('skill-category').value, percentage: parseInt(document.getElementById('skill-percentage').value), icon: document.getElementById('skill-icon').value };
  let res = id ? await sb.from('skills').update(payload).eq('id', id) : await sb.from('skills').insert(payload);
  if(res.error) showToast(res.error.message, 'error'); else { closeSkillModal(); showToast('Saved!', 'success'); refreshAdminData(); }
}

window.deleteItem = function(type, id) {
  document.getElementById('confirm-modal').classList.add('open');
  document.getElementById('confirm-action-btn').onclick = async () => {
    const table = type === 'project' ? 'projects' : 'skills';
    await sb.from(table).delete().eq('id', id); closeConfirmModal(); showToast('Deleted!', 'success'); refreshAdminData();
  };
}
window.closeConfirmModal = function() { document.getElementById('confirm-modal').classList.remove('open'); }

window.switchPage = function(page) {
  document.querySelectorAll('.dashboard-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sidebar-nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelector(`.sidebar-nav-item[data-page="${page}"]`)?.classList.add('active');
}
window.toggleSidebar = function() { document.getElementById('admin-sidebar').classList.toggle('open'); }

/* ══════════════════════════════════════════════════
   I18N SYSTEM — MULTILINGUAL
══════════════════════════════════════════════════ */
const i18n = {
  en: { 'nav.home':'Home','nav.about':'About','nav.skills':'Skills','nav.experience':'Experience','nav.projects':'Projects','nav.contact':'Contact','nav.admin':'ADMIN','hero.badge':'> CYBERSECURITY_PORTFOLIO.EXE' },
  km: { 'nav.home':'ទំព័រដើម','nav.about':'អំពីខ្ញុំ','nav.skills':'ជំនាញ','nav.experience':'បទពិសោធន៍','nav.projects':'គម្រោង','nav.contact':'ទំនាក់ទំនង','nav.admin':'គ្រប់គ្រង','hero.badge':'> ផលប័ត្រសន្តិសុខ.EXE' }
};

window.currentLang = localStorage.getItem('portfolio_lang') || 'en';

function translatePage() {
  document.querySelectorAll('[data-i18n]').forEach(el => { const key = el.getAttribute('data-i18n'); const val = i18n[window.currentLang]?.[key] || i18n['en']?.[key]; if (val) el.textContent = val; });
}

window.setLanguage = function(lang) {
  window.currentLang = lang; localStorage.setItem('portfolio_lang', lang);
  document.body.classList.toggle('lang-km', lang === 'km');
  document.getElementById('btn-lang-en').classList.toggle('active', lang === 'en');
  document.getElementById('btn-lang-km').classList.toggle('active', lang === 'km');
  translatePage(); renderSkills(); renderProjects(); renderTimeline();
}

/* ══════════════════════════════════════════════════
   THEME SWITCHER
══════════════════════════════════════════════════ */
let currentTheme = localStorage.getItem('portfolio_theme') || 'dark';
function applyTheme(theme) {
  currentTheme = theme; const isLight = theme === 'light'; document.body.classList.toggle('light-mode', isLight);
  const icon = document.getElementById('theme-icon'); if (icon) icon.className = isLight ? 'fas fa-moon' : 'fas fa-sun';
  localStorage.setItem('portfolio_theme', theme);
}
window.toggleTheme = function() { applyTheme(currentTheme === 'dark' ? 'light' : 'dark'); }

/* ══════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  applyTheme(currentTheme); window.setLanguage(window.currentLang); await loadPublicData(); observeAnimated();
  const loader = document.getElementById('pageLoader'); if (loader) { loader.classList.add('fade-out'); setTimeout(() => loader.remove(), 500); }
});