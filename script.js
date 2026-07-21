// ---------- Animated gradient blob + particle background ----------
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let w, h;
function resize(){
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const blobs = [
  {x:0.15, y:0.25, r:0.32, color:'123,47,247', dx:0.00018, dy:0.00012, t:0},
  {x:0.8, y:0.2, r:0.28, color:'233,69,96', dx:-0.00014, dy:0.00020, t:2},
  {x:0.5, y:0.8, r:0.30, color:'0,224,255', dx:0.00016, dy:-0.00015, t:4},
  {x:0.88, y:0.75, r:0.20, color:'255,217,61', dx:-0.00012, dy:-0.00018, t:6},
];

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Cursor-reactive particles ----------
const particleColors = ['0,224,255', '233,69,96', '255,217,61', '123,47,247', '46,230,166'];
const PARTICLE_COUNT = 85;
let particles = [];
function makeParticle(){
  return {
    x: Math.random()*w,
    y: Math.random()*h,
    vx: (Math.random()-0.5)*0.15,
    vy: (Math.random()-0.5)*0.15,
    r: Math.random()*1.7 + 0.6,
    color: particleColors[Math.floor(Math.random()*particleColors.length)],
    baseAlpha: Math.random()*0.4 + 0.25
  };
}
function initParticles(){
  particles = Array.from({length:PARTICLE_COUNT}, makeParticle);
}
initParticles();
window.addEventListener('resize', initParticles);

const mouse = {x: w/2, y: h/2, active:false};
window.addEventListener('mousemove', (e)=>{
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  mouse.active = true;
});
window.addEventListener('mouseleave', ()=>{ mouse.active = false; });
window.addEventListener('touchmove', (e)=>{
  if(e.touches && e.touches[0]){
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
    mouse.active = true;
  }
}, {passive:true});

const REPEL_RADIUS = 150;

function updateParticles(){
  particles.forEach(p=>{
    p.x += p.vx;
    p.y += p.vy;

    if(p.x < -10) p.x = w+10;
    if(p.x > w+10) p.x = -10;
    if(p.y < -10) p.y = h+10;
    if(p.y > h+10) p.y = -10;

    if(mouse.active){
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if(dist < REPEL_RADIUS && dist > 0.01){
        const force = (REPEL_RADIUS - dist) / REPEL_RADIUS;
        p.x += (dx/dist) * force * 2.4;
        p.y += (dy/dist) * force * 2.4;
      }
    }
  });
}

function drawParticles(){
  particles.forEach(p=>{
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
    ctx.fillStyle = `rgba(${p.color},${p.baseAlpha})`;
    ctx.fill();
  });
}

function draw(time){
  ctx.clearRect(0,0,w,h);
  ctx.fillStyle = '#0a0e1a';
  ctx.fillRect(0,0,w,h);

  blobs.forEach(b=>{
    const bx = (b.x + Math.sin(time*b.dx + b.t)*0.08) * w;
    const by = (b.y + Math.cos(time*b.dy + b.t)*0.08) * h;
    const radius = b.r * Math.max(w,h);
    const grad = ctx.createRadialGradient(bx, by, 0, bx, by, radius);
    grad.addColorStop(0, `rgba(${b.color},0.5)`);
    grad.addColorStop(1, `rgba(${b.color},0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,w,h);
  });

  if(!reduceMotion){
    updateParticles();
    drawParticles();
    requestAnimationFrame(draw);
  } else {
    drawParticles();
  }
}
requestAnimationFrame(draw);

// ---------- Nav toggle (mobile) ----------
const navToggle = document.getElementById('navToggle');
const navList = document.getElementById('navList');
navToggle.addEventListener('click', ()=>{
  navList.classList.toggle('open');
});
navList.querySelectorAll('a').forEach(link=>{
  link.addEventListener('click', ()=> navList.classList.remove('open'));
});

// ---------- Fade-in sections on scroll ----------
const sections = document.querySelectorAll('.section');
const secObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, {threshold:0.08});
sections.forEach(s=>{
  s.style.opacity = '0';
  s.style.transform = 'translateY(24px)';
  s.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
  secObserver.observe(s);
});

// ---------- Contact form (front-end only demo) ----------
const form = document.getElementById('contactForm');
const formNote = document.getElementById('formNote');
if(form){
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    formNote.textContent = "Thanks! Your message has been noted — I'll get back to you soon.";
    form.reset();
    setTimeout(()=>{ formNote.textContent = ''; }, 5000);
  });
}