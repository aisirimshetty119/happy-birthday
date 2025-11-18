/* ---------------------------
   Shared settings & assets
   --------------------------- */

/* slideshow photos (the filenames you uploaded to photos/) */
const PHOTOS = [
  "photos/Pic1.jpg",
  "photos/Pic2.jpg",
  "photos/Pic3.jpg",
  "photos/Pic5.jpg",
  "photos/Pic6.jpg",
  "photos/Pic8.jpg",
  "photos/Pic9.jpg",
  "photos/Pic10.jpg"
];

const CAPTIONS = [
  "The smile that made me fall in love with you every day ❤️",
  "My safe place… my favourite person in the whole world.",
  "I love the way your eyes look at me — like I’m your entire universe.",
  "With you, even the normal moments feel magical.",
  "You don’t even know how beautiful you are to me, muddu.",
  "Every memory with you is a treasure I’ll keep forever.",
  "You are the happiness I prayed for… the love I waited for.",
  "My heart belongs to you, now and always. I love you kanda."
];

/* small helpers */
function tryPlay(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.play?.().catch(()=>{});
}

/* ---------------------------
   LOGIN (login.html)
   --------------------------- */
function login(){
  const u = (document.getElementById('username') || {}).value || '';
  const p = (document.getElementById('password') || {}).value || '';
  if(u.trim().toLowerCase() === 'muddu' && p.trim().toLowerCase() === 'muddu'){
    // mark logged in (optional)
    localStorage.setItem('hb_logged', '1');
    // attempt to start music (most browsers require user interaction)
    tryPlay('bgm');
    // navigate
    window.location.href = 'birthday.html';
  } else {
    alert('Incorrect nickname or password. Try again ❤️');
  }
}

/* ---------------------------
   BIRTHDAY SLIDESHOW + TYPER
   --------------------------- */
let slideIndex = 0;
function showSlideAt(i){
  const img = document.getElementById('slide');
  const cap = document.getElementById('caption');
  if(!img || !cap) return;
  slideIndex = ( (i % PHOTOS.length) + PHOTOS.length ) % PHOTOS.length;
  img.src = PHOTOS[slideIndex];
  cap.textContent = CAPTIONS[slideIndex] || '';
}
function nextSlide(){ showSlideAt(slideIndex + 1); }
function prevSlide(){ showSlideAt(slideIndex - 1); }

function startBirthdayPage(){
  showSlideAt(0);
  // auto-slide
  setInterval(()=>{ nextSlide(); }, 3600);

  // typing text
  const typedEl = document.getElementById('typed');
  if(typedEl){
    const text = "Happy birthday my baby. You are the world to me. You complete me. You make me the happiest. Child inside me is alive only with you. I love you the most. I want to celebrate all your birthdays planning surprise next to you without your knowledge. I want to live all my days, mins, seconds with you in my heart! Love you muddu kanda 😘";
    let i=0;
    function step(){ if(i < text.length){ typedEl.innerHTML += text.charAt(i); i++; setTimeout(step, 28); } }
    typedEl.innerHTML = '';
    step();
  }

  // ensure music plays on first click
  document.addEventListener('click', function once(){ tryPlay('bgm'); document.removeEventListener('click', once); }, {once:true});
}

/* navigation from birthday to game */
function goGame(){ window.location.href = 'game.html'; }

/* ---------------------------
   GAME (game.html)
   --------------------------- */
let score = 0;
let spawnInterval = null;

function spawnHeart(){
  const area = document.getElementById('gameArea');
  if(!area) return;
  const heart = document.createElement('div');
  heart.className = 'heart';
  heart.innerText = '❤';
  // random position inside area
  const rect = area.getBoundingClientRect();
  const x = Math.random() * (rect.width - 80) + 40;
  const y = Math.random() * (rect.height - 80) + 40;
  heart.style.left = `${x}px`;
  heart.style.top = `${y}px`;
  area.appendChild(heart);

  // floating motion
  const dx = (Math.random()-0.5) * 40;
  const dy = (Math.random()-0.5) * 40;
  let t=0;
  const anim = setInterval(()=>{
    t+=0.02;
    heart.style.left = `${x + Math.sin(t*2 + Math.random()) * 20}px`;
    heart.style.top  = `${y + Math.cos(t*1.2 + Math.random()) * 12}px`;
  }, 60);

  function removeHeart(){
    clearInterval(anim);
    if(heart.parentNode) heart.parentNode.removeChild(heart);
  }

  heart.addEventListener('click', function tapped(e){
    e.stopPropagation();
    score++;
    document.getElementById('score').textContent = score;
    playPopTiny();
    removeHeart();
    if(score >= 10){
      // win
      setTimeout(()=> launchConfetti(), 100);
      setTimeout(()=> window.location.href = 'surprise.html', 1800);
    }
  }, {passive:true});

  // auto-remove after 5-7s
  setTimeout(removeHeart, 5000 + Math.random()*2500);
}

function startGameSpawning(){
  if(spawnInterval) clearInterval(spawnInterval);
  spawnInterval = setInterval(()=>{ // keep up to 6 hearts
    const area = document.getElementById('gameArea');
    if(!area) return;
    const heartsCount = area.querySelectorAll('.heart').length;
    if(heartsCount < 6) spawnHeart();
  }, 800);
}

function resetGame(){
  score = 0;
  const area = document.getElementById('gameArea');
  if(area) area.innerHTML = '';
  document.getElementById('score').textContent = '0';
  startGameSpawning();
}

/* tiny pop sound fallback using WebAudio (so we don't need pop.mp3) */
let audioCtx = null;
function playPopTiny(){
  try{
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine';
    o.frequency.value = 900 + Math.random()*300;
    g.gain.value = 0.03;
    o.connect(g); g.connect(audioCtx.destination);
    o.start();
    setTimeout(()=> o.stop(), 60);
  }catch(e){}
}

/* ---------------------------
   CONFETTI (canvas)
   --------------------------- */
function launchConfetti(){
  const canvas = document.getElementById('confetti');
  if(!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');
  const pieces = [];
  for(let i=0;i<140;i++){
    pieces.push({
      x: Math.random()*canvas.width,
      y: Math.random()*-canvas.height,
      vx: (Math.random()-0.5)*6,
      vy: 2 + Math.random()*4,
      r: 6 + Math.random()*10,
      color: ['#ff88c2','#ffd6e8','#ffd166','#a29bfe'][Math.floor(Math.random()*4)],
      rot: Math.random()*360,
      vr: (Math.random()-0.5)*10
    });
  }
  function frame(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for(let i=0;i<pieces.length;i++){
      const p = pieces[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x,p.y);
      ctx.rotate(p.rot * Math.PI/180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r/2, -p.r/2, p.r, p.r*0.6);
      ctx.restore();
    }
    if(pieces.some(p=>p.y < canvas.height + 50)) requestAnimationFrame(frame);
    else ctx.clearRect(0,0,canvas.width,canvas.height);
  }
  frame();
}

/* ---------------------------
   SURPRISES (surprise.html)
   --------------------------- */
function openLoveLetter(){
  const el = document.getElementById('surpriseResult');
  el.innerHTML = `<div class="card" style="padding:14px;text-align:left">
    <h3>My Dearest Muddu 💌</h3>
    <p>From the moment I called you by that little nickname, my heart knew — you are my home. Every laugh, every look, every silly moment with you is a treasure. Today is your day, and I hope this surprise makes you smile the brightest. I love you more than words can hold. — Yours forever ❤️</p>
  </div>`;
}
function openChoice(){
  const el = document.getElementById('surpriseResult');
  el.innerHTML = `<div style="display:flex;gap:12px;justify-content:center">
    <button class="small" onclick="choiceA()">A — Free Spa 🧖‍♂️</button>
    <button class="small" onclick="choiceB()">B — Pizza Date 🍕</button>
  </div>`;
}
function choiceA(){ document.getElementById('surpriseResult').innerHTML = '<p>Relaxing spa day is booked for you ❤️</p>'; }
function choiceB(){ document.getElementById('surpriseResult').innerHTML = '<p>Pizza date planned — get ready for cheesy fun 🍕😚</p>'; }
function openAsk(){
  document.getElementById('surpriseResult').innerHTML = `<div style="text-align:center">
    <input id="wish" placeholder="Ask anything you want..." style="width:86%;padding:10px;border-radius:8px;border:1px solid #f0cfe0" />
    <div style="margin-top:8px"><button class="small" onclick="sendWish()">Send</button></div>
    <div id="wishRes" style="margin-top:10px"></div>
  </div>`;
}
function sendWish(){
  const v = (document.getElementById('wish')||{}).value || '';
  if(!v.trim()) return alert('Type something sweet 😊');
  document.getElementById('wishRes').innerHTML = `<em>Done! I will make it happen: <strong>${escapeHtml(v)}</strong> ❤️</em>`;
}

/* ---------------------------
   PHOTO GALLERY functions
   --------------------------- */
let galleryIndex = 0;
function showGalleryAt(i){
  galleryIndex = ( (i % PHOTOS.length) + PHOTOS.length ) % PHOTOS.length;
  const img = document.getElementById('galleryPic');
  const cap = document.getElementById('galleryCaption');
  if(img) img.src = PHOTOS[galleryIndex];
  if(cap) cap.textContent = CAPTIONS[galleryIndex] || '';
}
function nextGallery(){ showGalleryAt(galleryIndex + 1); }
function prevGallery(){ showGalleryAt(galleryIndex - 1); }

/* ---------------------------
   SMALL utils
   --------------------------- */
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

/* ---------------------------
   Auto-run depending on page
   --------------------------- */
document.addEventListener('DOMContentLoaded', ()=>{
  // attempt to play page bgm on first user click (click handled globally)
  document.addEventListener('click', ()=>{
    tryPlay('bgm');
    tryPlay('sing');
  }, {once:true});

  // birthday page
  if(document.getElementById('slide')) startBirthdayPage();

  // gallery
  if(document.getElementById('galleryPic')) showGalleryAt(0);

  // game
  if(document.getElementById('gameArea')){
    resetGame();
    startGameSpawning();
  }
});
