document.addEventListener('DOMContentLoaded', ()=>{
  const openBtn = document.getElementById('openBtn');
  const modal = document.getElementById('modal');
  const yesBtn = document.getElementById('yesBtn');
  const noBtn = document.getElementById('noBtn');
  const confettiCanvas = document.getElementById('confetti');
  const ctx = confettiCanvas.getContext('2d');
  const starsCanvas = document.getElementById('stars');
  const sctx = starsCanvas.getContext('2d');
  const audioToggle = document.getElementById('audioToggle');
  const mysteryBtn = document.getElementById('mysteryBtn');
  const mysteryText = document.getElementById('mysteryText');

  let audioCtx = null, ambientGain = null, ambientNodes = [];

  function resize(){ confettiCanvas.width = innerWidth; confettiCanvas.height = innerHeight }
  addEventListener('resize', ()=>{ resize(); resizeStars(); }); resize();

  function resizeStars(){ starsCanvas.width = innerWidth; starsCanvas.height = innerHeight }
  addEventListener('resize', resizeStars); resizeStars();

  // build starfield
  const stars = [];
  for(let i=0;i<300;i++) stars.push({ x: Math.random()*innerWidth, y: Math.random()*innerHeight, r: Math.random()*1.8+0.4, a: Math.random(), d: Math.random()*0.03+0.002 });
  function drawStars(){ sctx.clearRect(0,0,starsCanvas.width,starsCanvas.height); for(const st of stars){ st.a += st.d; if(st.a>1 || st.a<0.12) st.d *= -1; sctx.fillStyle = `rgba(255,255,255,${st.a})`; sctx.beginPath(); sctx.arc(st.x, st.y, st.r, 0, Math.PI*2); sctx.fill(); } }
  setInterval(drawStars, 80);

  openBtn.addEventListener('click', ()=>{
    startAmbient();
    spawnHearts(12);
    setTimeout(()=> modal.classList.remove('hidden'), 1200);
  });

  noBtn.addEventListener('click', ()=>{
    modal.classList.add('hidden');
    spawnHearts(6, false);
  });

  yesBtn.addEventListener('click', async ()=>{
    modal.classList.add('hidden');
    await playTone();
    launchConfetti();
    showBigHeart();
  });

  // hearts
  function spawnHearts(n, fromTop=true){
    for(let i=0;i<n;i++){
      const h = document.createElement('div'); h.className = 'heart';
      const size = 12 + Math.random()*28; h.style.width = size + 'px'; h.style.height = size + 'px';
      h.style.left = (6 + Math.random()*88) + '%';
      h.style.top = (fromTop ? 60 + Math.random()*30 : 70 + Math.random()*20) + 'vh';
      h.style.transform = `rotate(${Math.random()*60-30}deg)`;
      h.style.background = 'transparent';
      document.body.appendChild(h);
      h.style.animation = `floatUp ${6+Math.random()*6}s linear ${Math.random()*1}s forwards`;
      setTimeout(()=>h.remove(),9000);
    }
  }

  // typing mystery
  mysteryBtn.addEventListener('click', ()=>{
    mysteryBtn.disabled = true; mysteryText.classList.add('loading');
    const lines = [
      'Do you remember the first time we watched the stars?',
      'Little moments folded into big promises…',
      "Tonight the sky whispers a question just for you."
    ];
    typeLines(lines, 0, ()=>{ mysteryText.classList.remove('loading'); setTimeout(()=>{ modal.classList.remove('hidden') }, 700); });
  });

  function typeLines(lines, idx, cb){
    if(idx >= lines.length) { cb(); return }
    mysteryText.textContent = '';
    const line = lines[idx]; let p=0;
    const t = setInterval(()=>{ mysteryText.textContent += line[p++]; if(p >= line.length){ clearInterval(t); setTimeout(()=> typeLines(lines, idx+1, cb), 700); } }, 36);
  }

  // gentle arpeggio
  async function playTone(){
    try{
      const ctx = new (window.AudioContext||window.webkitAudioContext)();
      const now = ctx.currentTime;
      const freqs = [440,660,880];
      freqs.forEach((f,i)=>{
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.type = 'sine'; o.frequency.value = f; g.gain.value = 0.001 + 0.12 * (1 - i*0.25);
        o.connect(g); g.connect(ctx.destination);
        o.start(now + i*0.12); o.stop(now + i*0.9 + i*0.12);
      });
      await new Promise(r=>setTimeout(r,900));
    }catch(e){ console.log('Audio error', e) }
  }

  // ambient pad
  function startAmbient(){
    try{
      if(audioCtx && audioCtx.state === 'running') return;
      audioCtx = audioCtx || new (window.AudioContext||window.webkitAudioContext)();
      ambientGain = ambientGain || audioCtx.createGain(); ambientGain.gain.value = 0; ambientGain.connect(audioCtx.destination);
      const freqs = [110, 138.5, 165];
      ambientNodes = freqs.map((f, i)=>{
        const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
        o.type = (i%2? 'sine' : 'triangle'); o.frequency.value = f; o.detune.value = (Math.random()-0.5)*12;
        g.gain.value = 0.02; o.connect(g); g.connect(ambientGain); o.start(); return {o,g};
      });
      ambientGain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 2.2);
    }catch(e){ console.log('ambient err', e) }
  }

  function stopAmbient(){ if(!audioCtx) return; ambientGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.2); setTimeout(()=>{ ambientNodes.forEach(n=>n.o.stop()); audioCtx.close(); audioCtx = null },1400) }

  audioToggle.addEventListener('click', ()=>{
    if(!audioCtx) { startAmbient(); audioToggle.textContent = '🔈'; }
    else if(audioCtx.state === 'running') { audioCtx.suspend(); audioToggle.textContent = '🔇'; }
    else { audioCtx.resume(); audioToggle.textContent = '🔈'; }
  });

  // Confetti particle system
  function launchConfetti(){
    const particles = [];
    const colors = ['#ff6b6b','#ffd166','#f4a261','#ff9aa2','#cdb4db','#9be7ff','#bde0fe'];
    for(let i=0;i<260;i++){
      particles.push({ x: innerWidth/2 + (Math.random()-0.5)*240, y: innerHeight/2 + (Math.random()-0.5)*100, vx: (Math.random()-0.5)*9, vy: (Math.random()-6)*7, size: 2+Math.random()*8, color: colors[Math.floor(Math.random()*colors.length)], rot: Math.random()*360, dr: Math.random()*6-3, life: 100+Math.random()*80 });
    }
    let running = true;
    function frame(){
      ctx.clearRect(0,0,innerWidth,innerHeight);
      for(const p of particles){ p.x += p.vx; p.y += p.vy; p.vy += 0.24; p.rot += p.dr; p.life -= 1; ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot*Math.PI/180); ctx.fillStyle = p.color; ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*1.6); ctx.restore(); }
      for(let i=particles.length-1;i>=0;i--) if(particles[i].life<=0 || particles[i].y>innerHeight+50) particles.splice(i,1);
      if(particles.length>0 && running) requestAnimationFrame(frame); else ctx.clearRect(0,0,innerWidth,innerHeight);
    }
    frame(); setTimeout(()=>running=false,8200);
  }

  // Show a big expanding heart in center
  function showBigHeart(){
    const el = document.createElement('div'); el.className = 'big-heart';
    Object.assign(el.style, { position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: '220px', height: '220px', zIndex: 50 });
    el.innerHTML = `<svg viewBox="0 0 32 29.6" width="220" height="220"><path d="M23.6,0c-2.7,0-5,1.6-6.6,3.9C15.4,1.6,13.1,0,10.4,0C4.7,0,0,4.7,0,10.4c0,7.9,14.8,15.6,16,17.1c1.2-1.6,16-9.2,16-17.1C32,4.7,27.3,0,23.6,0z" fill="#ff6b6b"/></svg>`;
    document.body.appendChild(el);
    el.animate([{opacity:0,transform:'translate(-50%,-50%) scale(.6)'},{opacity:1,transform:'translate(-50%,-50%) scale(1)'}],{duration:700,easing:'cubic-bezier(.2,.9,.3,1)'});
    setTimeout(()=>{ el.animate([{opacity:1,transform:'translate(-50%,-50%) scale(1)'},{opacity:0,transform:'translate(-50%,-50%) scale(1.6)'}],{duration:900}); setTimeout(()=>el.remove(),900) },3000);
  }

});
