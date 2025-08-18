// Canvas-driven particle background + interactive UI for login/signup with 3D flip
// Simplified: Sign up is demo-only (does NOT store new accounts).
// Login authenticates only against hardcoded dummy accounts.

// ===== Background Particles =====
const canvas = document.getElementById('bg');
const ctx = canvas.getContext('2d', { alpha: true });
let W, H, particles;

/**
 * Match canvas to viewport size (on load and resize)
 */
function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

/**
 * Create n lightweight particles for the animated background
 */
function makeParticles(n = 80){
  return Array.from({length:n}, () => ({
    x: Math.random()*W,
    y: Math.random()*H,
    r: Math.random()*2 + 0.6,
    vx: (Math.random()-0.5)*0.4,
    vy: (Math.random()-0.5)*0.4,
    a: Math.random()*360
  }));
}
particles = makeParticles();

/**
 * Main animation loop that updates and draws particles
 */
function tick(){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  particles.forEach(p=>{
    p.x += p.vx; p.y += p.vy; p.a += 0.3;

    // Wrap around edges to keep particles in motion
    if(p.x < -10) p.x = W+10;
    if(p.x > W+10) p.x = -10;
    if(p.y < -10) p.y = H+10;
    if(p.y > H+10) p.y = -10;

    // Draw soft dot
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fill();
  });
  requestAnimationFrame(tick);
}
tick();

// ===== Parallax Tilt on Card =====
const card = document.getElementById('card');

/**
 * Subtle 3D tilt based on pointer position over the card
 */
card.addEventListener('mousemove', e=>{
  const r = card.getBoundingClientRect();
  const cx = r.left + r.width/2;
  const cy = r.top + r.height/2;
  const dx = (e.clientX - cx)/r.width;
  const dy = (e.clientY - cy)/r.height;
  card.style.transform = `rotateX(${(-dy*6).toFixed(2)}deg) rotateY(${(dx*8).toFixed(2)}deg)`;
});

/**
 * Reset tilt when pointer leaves the card
 */
card.addEventListener('mouseleave', ()=>{
  card.style.transform = `rotateX(0) rotateY(0)`;
});

// ===== Element refs =====
const flip = document.getElementById('flip');
const form = document.getElementById('loginForm');
const u = document.getElementById('username');
const p = document.getElementById('password');
const toggle = document.querySelector('.front .field.password .toggle');
const meter = document.querySelector('.front .meter span');
const capsToast = document.getElementById('capsToast');
const live = document.getElementById('live-region');
const submitBtn = document.getElementById('submitBtn');
const remember = document.getElementById('remember');
const cardEl = document.getElementById('card');

const toSignup = document.getElementById('toSignup');
const toLogin = document.getElementById('toLogin');

const signupForm = document.getElementById('signupForm');
const suEmail = document.getElementById('su_email');
const suUser = document.getElementById('su_username');
const suPass = document.getElementById('su_password');
const suPassToggle = document.querySelector('.back .field.password .toggle');
const suMeter = document.querySelector('.back .meter span');
const suConfirm = document.getElementById('su_confirm');
const suMatchHint = document.getElementById('su_match_hint');

// ===== Remember-me glow =====

/**
 * Toggle a persistent glow on the entire card based on Remember me
 */
function applyRememberGlow() {
  if (remember.checked) {
    cardEl.classList.add('glow');
  } else {
    cardEl.classList.remove('glow');
  }
}
applyRememberGlow();                       // initialize based on current checkbox state (no default ON)
remember.addEventListener('change', applyRememberGlow); // toggle glow live

// ===== Password visibility toggles =====

/**
 * Toggle login password visibility
 */
toggle.addEventListener('click', ()=>{
  p.type = p.type === 'password' ? 'text' : 'password';
});

/**
 * Toggle signup password visibility
 */
suPassToggle.addEventListener('click', ()=>{
  suPass.type = suPass.type === 'password' ? 'text' : 'password';
});

// ===== Password strength/meter =====

/**
 * Return a simple strength score 0..5 based on common rules
 */
function strength(s){
  let score = 0;
  if(s.length >= 8) score++;
  if(/[A-Z]/.test(s)) score++;
  if(/[a-z]/.test(s)) score++;
  if(/[0-9]/.test(s)) score++;
  if(/[^A-Za-z0-9]/.test(s)) score++;
  return score;
}

/**
 * Update a strength meter bar for a given input + bar span
 */
function updateMeter(inputEl, barEl){
  const sc = strength(inputEl.value);
  const widths = ['10%','25%','40%','60%','80%','100%'];
  barEl.style.width = widths[sc];
  barEl.style.background = sc >= 4 ? 'var(--ok)' : sc >= 2 ? 'var(--accent-2)' : 'var(--error)';
}
p.addEventListener('input', ()=> updateMeter(p, meter));
suPass.addEventListener('input', ()=> { updateMeter(suPass, suMeter); checkMatch(); });

// ===== Caps Lock Detector (login password only) =====
let capsTimer = null;

/**
 * Show a temporary toast message (e.g., Caps Lock warning)
 */
function showCaps(message){
  capsToast.textContent = message;
  capsToast.classList.add('show');
  clearTimeout(capsTimer);
  capsTimer = setTimeout(()=> capsToast.classList.remove('show'), 2000);
}

/**
 * Hide the Caps/status toast
 */
function hideCaps(){
  capsToast.classList.remove('show');
  clearTimeout(capsTimer);
}

/**
 * Detect Caps Lock state from keyboard events and warn if ON
 */
function capsHandler(e){
  const caps = e.getModifierState && e.getModifierState('CapsLock');
  if(caps) showCaps('Yo, watch out — CAPS is ON 🔒');
  else hideCaps();
}
p.addEventListener('keyup', capsHandler);
p.addEventListener('keydown', capsHandler);
p.addEventListener('focus', (e)=> {  // warn immediately if already ON
  if (e.getModifierState && e.getModifierState('CapsLock')) {
    showCaps('Yo, watch out — CAPS is ON 🔒');
  }
});
p.addEventListener('blur', hideCaps);

// ===== Ripple on primary buttons =====

/**
 * Position an ink ripple under the pointer for a given button
 */
function ripple(btn, e){
  const rect = btn.getBoundingClientRect();
  const x = ((e.clientX - rect.left)/rect.width)*100 + '%';
  const y = ((e.clientY - rect.top)/rect.height)*100 + '%';
  btn.style.setProperty('--x', x);
  btn.style.setProperty('--y', y);
}
submitBtn.addEventListener('pointerdown', e=> ripple(submitBtn, e));
document.getElementById('signupBtn').addEventListener('pointerdown', e=> ripple(e.currentTarget, e));

// ===== Dummy Accounts (hardcoded; no persistence) =====

/**
 * Default demo accounts for login.
 * These are the ONLY credentials that will ever work in this simplified build.
 * - demo / SuperSecret!123
 * - neo / ThereIsNoSpoon_42
 * - admin / P@ssw0rd!P@ssw0rd!
 */
const demoAccounts = [
  { username: 'demo',  password: 'SuperSecret!123' },
  { username: 'neo',   password: 'ThereIsNoSpoon_42' },
  { username: 'admin', password: 'P@ssw0rd!P@ssw0rd!' }
];

/**
 * Check if a username exists in the demo accounts
 */
function accountExists(username){
  username = username.trim();
  return demoAccounts.some(a => a.username === username);
}

/**
 * Verify a username/password pair against demo accounts
 */
function verifyCredentials(username, password){
  username = username.trim();
  return demoAccounts.some(a => a.username === username && a.password === password);
}

// ===== "Check account" feature (login side) =====
document.getElementById('checkBtn').addEventListener('click', ()=>{
  const found = accountExists(u.value);
  toast(found ? 'Account exists' : 'No account found');
});

// ===== Login Submit =====

/**
 * Handle login submission against demo accounts only
 */
form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const name = u.value.trim();
  const pass = p.value;
  const ok = verifyCredentials(name, pass);
  if(ok) success(); else fail();
});

/**
 * Show login failure (toast + shake + ARIA live)
 */
function fail(){
  toast('Invalid credentials');
  form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake');
  live.textContent = 'Login failed';
}

/**
 * Show login success (toast + confetti + ARIA live)
 */
function success(){
  toast('Welcome!');
  live.textContent = 'Login success';
  confettiBurst();
}

// ===== Signup Validation (Demo-only; does NOT store accounts) =====

/**
 * Show "Passwords match" hint when confirm matches password
 */
function checkMatch(){
  const match = suPass.value.length && suPass.value === suConfirm.value;
  suMatchHint.textContent = match ? 'Passwords match' : 'Must match password';
  suMatchHint.style.color = match ? 'var(--ok)' : 'var(--muted)';
}
suConfirm.addEventListener('input', checkMatch);

/**
 * Handle sign up (demo):
 * - validate inputs
 * - show success toast
 * - flip back to login (no account saved)
 */
signupForm.addEventListener('submit', (e)=>{
  e.preventDefault();

  const emailOk = /\S+@\S+\.\S+/.test(suEmail.value.trim());
  const userVal = suUser.value.trim();
  const userOk = /^[A-Za-z0-9_]{3,16}$/.test(userVal);
  const passVal = suPass.value;
  const passScore = strength(passVal) >= 3;
  const match = passVal === suConfirm.value;

  if(!emailOk || !userOk || !passScore || !match){
    toast('Check your details');
    signupForm.classList.remove('shake'); void signupForm.offsetWidth; signupForm.classList.add('shake');
    return;
  }

  // Demo only: do not store account. Just delight and flip back.
  toast('Account created (demo only)');
  setTimeout(()=> flipTo('login'), 700);

  // Prefill the username field on the login face for convenience
  u.value = userVal;

  // Clear the signup form visuals
  signupForm.reset();
  updateMeter(suPass, suMeter);
  checkMatch();
});

// ===== Flip Logic (Login <-> Sign up) =====

/**
 * Flip to the requested side and move focus to the first field
 */
function flipTo(side){
  if(side === 'signup'){
    flip.classList.add('flipped');
    setTimeout(()=> suEmail.focus(), 350);
    document.querySelector('.front').setAttribute('aria-hidden', 'true');
    document.querySelector('.back').setAttribute('aria-hidden', 'false');
  }else{
    flip.classList.remove('flipped');
    setTimeout(()=> u.focus(), 350);
    document.querySelector('.front').setAttribute('aria-hidden', 'false');
    document.querySelector('.back').setAttribute('aria-hidden', 'true');
  }
}
toSignup.addEventListener('click', ()=> flipTo('signup'));
toLogin.addEventListener('click', ()=> flipTo('login'));

// ===== Toast Utility =====
let toastTimer = null;

/**
 * Generic toast for short status messages
 */
function toast(msg){
  capsToast.textContent = msg;
  capsToast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> capsToast.classList.remove('show'), 1800);
}

// ===== Forgot Password Modal =====
const forgotBtn = document.getElementById('forgotBtn');
const forgotModal = document.getElementById('forgotModal');
const closeForgot = document.getElementById('closeForgot');

/**
 * Open the demo reset dialog (no backend)
 */
forgotBtn.addEventListener('click', ()=>{
  if(typeof forgotModal.showModal === 'function'){ forgotModal.showModal(); }
});

/**
 * Close the demo reset dialog
 */
closeForgot.addEventListener('click', ()=> forgotModal.close());

// ===== Keyboard Aids & Easter Eggs =====

/**
 * Pressing Enter in inputs triggers login for convenience
 */
[u,p].forEach(el=>{
  el.addEventListener('keydown', e=>{
    if(e.key === 'Enter'){ submitBtn.click(); }
  });
});

/**
 * Holding Alt shows a faint layout outline to aid debugging
 */
let altDown = false;
document.addEventListener('keydown', e=>{
  if(e.key === 'Alt') altDown = true;
  document.body.style.outline = altDown ? '1px dashed rgba(255,255,255,.15)' : 'none';
});
document.addEventListener('keyup', e=>{
  if(e.key === 'Alt') { altDown = false; document.body.style.outline = 'none'; }
});

/**
 * Konami code easter egg (Up,Up,Down,Down,Left,Right,Left,Right,b,a)
 */
const seq = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
let buffer = [];
document.addEventListener('keydown', e=>{
  buffer.push(e.key);
  buffer = buffer.slice(-seq.length);
  if(seq.every((k,i)=> buffer[i] === k)){
    toast('Admin mode unlocked');
  }
});

// ===== Confetti =====

/**
 * Small confetti burst animation using DOM + Web Animations API
 */
function confettiBurst(){
  const layer = document.querySelector('.confetti');
  const N = 36;
  for(let i=0;i<N;i++){
    const p = document.createElement('i');
    const size = Math.random()*8+6;
    p.style.position = 'absolute';
    p.style.left = Math.random()*100 + 'vw';
    p.style.top = '-10px';
    p.style.width = size+'px';
    p.style.height = (size*0.6)+'px';
    p.style.background = `hsl(${Math.random()*60+90} 80% 60% / .9)`;
    p.style.transform = `rotate(${Math.random()*360}deg)`;
    p.style.filter = 'drop-shadow(0 4px 6px rgba(0,0,0,.3))';
    p.style.borderRadius = '2px';
    layer.appendChild(p);

    const dx = (Math.random()-0.5)*60;
    p.animate([
      { transform:`translate3d(0,0,0) rotate(0deg)` },
      { transform:`translate3d(${dx}px, 90vh, 0) rotate(${Math.random()*600+360}deg)` }
    ], { duration: 1400+Math.random()*800, easing:'cubic-bezier(.22,.61,.36,1)', fill:'forwards' })
    .onfinish = ()=> p.remove();
  }
}
