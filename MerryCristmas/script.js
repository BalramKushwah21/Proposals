const heartsContainer = document.getElementById('hearts');
const sendBtn = document.getElementById('sendLove');

function createHeart(x, y){
  const el = document.createElement('div');
  el.className = 'heart';
  el.style.left = x + 'px';
  el.style.top = y + 'px';
  // random color tint
  const hue = 330 + Math.round(Math.random()*30) - 15;
  const scale = 0.8 + Math.random()*0.6;
  el.style.width = (24*scale) + 'px';
  el.style.height = (24*scale) + 'px';

  el.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 21s-7.5-4.35-9-6.9C1.6 11.85 4.1 8 7.5 8c1.9 0 3.1 1.1 4.5 2.8C13.4 9.1 14.6 8 16.5 8 19.9 8 22.4 11.85 21 14.1 19.5 16.65 12 21 12 21z" fill="hsl(${hue} 100% 72%)"/>
    </svg>`;

  heartsContainer.appendChild(el);
  // remove after animation
  setTimeout(()=> el.remove(), 4200 + Math.random()*800);
}

// create a heart at a random position near center
function spawnRandom(){
  const rect = heartsContainer.getBoundingClientRect();
  const x = rect.left + rect.width * (0.3 + Math.random()*0.4);
  const y = rect.top + rect.height * (0.5 + Math.random()*0.3);
  createHeart(x, y);
}

// click anywhere to create a heart
document.addEventListener('click', (e)=>{
  createHeart(e.clientX, e.clientY);
});

sendBtn.addEventListener('click', ()=>{
  // burst of hearts
  for(let i=0;i<8;i++){
    setTimeout(()=> spawnRandom(), i*120);
  }
  // show gift popup
  showGiftPopup();
});

// gentle automatic hearts for ambience
setInterval(()=>{
  if(Math.random() < 0.6) spawnRandom();
}, 900);

/* Gift popup logic */
const giftModal = document.getElementById('giftModal');
const giftBox = document.getElementById('giftBox');
const giftOverlay = document.getElementById('giftOverlay');
const closeGift = document.getElementById('closeGift');

function showGiftPopup(){
  if(!giftModal) return;
  giftModal.setAttribute('aria-hidden','false');
  // open lid after short delay
  setTimeout(()=> giftBox.classList.add('open'), 260);
  // spawn a few small hearts inside modal
  for(let i=0;i<6;i++){
    setTimeout(()=>{
      const h = document.createElement('div');
      h.className = 'modal-heart';
      h.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 21s-7.5-4.35-9-6.9C1.6 11.85 4.1 8 7.5 8c1.9 0 3.1 1.1 4.5 2.8C13.4 9.1 14.6 8 16.5 8 19.9 8 22.4 11.85 21 14.1 19.5 16.65 12 21 12 21z" fill="#ffd1dc"/></svg>`;
      giftModal.querySelector('.modal-content').appendChild(h);
      setTimeout(()=> h.remove(), 2600);
    }, i*160);
  }
  // auto-close after 5.2s
  setTimeout(hideGiftPopup, 5200);
}

function hideGiftPopup(){
  if(!giftModal) return;
  giftBox.classList.remove('open');
  giftModal.setAttribute('aria-hidden','true');
  // remove any leftover modal hearts
  const leftovers = giftModal.querySelectorAll('.modal-heart');
  leftovers.forEach(n=>n.remove());
}

if(giftOverlay) giftOverlay.addEventListener('click', hideGiftPopup);
if(closeGift) closeGift.addEventListener('click', hideGiftPopup);

