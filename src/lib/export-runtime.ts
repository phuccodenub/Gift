import {
  buildFallingRuntimeItems,
  getGiftAudioConfig,
  hasClickHeartBurst,
} from "@/lib/gift-effects";
import type { GiftData } from "@/types/gift";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function buildSharedExportRuntime(gift?: GiftData): {
  css: string;
  bodyHTML: string;
  js: string;
} {
  if (!gift) {
    return { css: "", bodyHTML: "", js: "" };
  }

  const fallingItems = buildFallingRuntimeItems(gift);
  const audio = getGiftAudioConfig(gift);
  const heartBurstEnabled = hasClickHeartBurst(gift);

  const css = `
.giftfx-layer{position:fixed;inset:0;overflow:hidden;pointer-events:none;z-index:30}
.giftfx-item{position:fixed;top:0;left:0;pointer-events:none;opacity:0;animation-timing-function:linear;animation-iteration-count:infinite}
.giftfx-item.msg{min-width:120px;max-width:180px}
.giftfx-item.msg{animation-name:giftfx-fall-msg}
.giftfx-item.msg .giftfx-card{border-radius:22px;border:1px solid rgba(255,255,255,0.58);background:linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,244,248,0.9));padding:12px 16px;text-align:center;box-shadow:0 18px 36px -22px rgba(86,33,59,0.7);backdrop-filter:blur(8px)}
.giftfx-item.msg .giftfx-card span{font-size:14px;font-weight:700;line-height:1.55;color:rgba(102,30,66,0.92)}
.giftfx-item.photo .giftfx-card{border-radius:24px;border:1px solid rgba(255,255,255,0.72);background:linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,246,249,0.95));padding:8px;box-shadow:0 20px 42px -24px rgba(50,22,40,0.8)}
.giftfx-item.photo{animation-name:giftfx-fall-photo}
.giftfx-item.photo .giftfx-frame{overflow:hidden;border-radius:18px}
.giftfx-item.photo img{width:100%;aspect-ratio:1/1;object-fit:cover;display:block}
@keyframes giftfx-fall-msg{
  0%{transform:translate(-50%,-18vh) rotate(var(--rot));opacity:0}
  12%{opacity:0.98}
  38%{transform:translate(calc(-50% + var(--drift-a)),28vh) rotate(calc(var(--rot) + 6deg));opacity:0.98}
  72%{transform:translate(calc(-50% + var(--drift-b)),76vh) rotate(calc(var(--rot) - 5deg));opacity:0.98}
  100%{transform:translate(calc(-50% + var(--drift-c)),118vh) rotate(calc(var(--rot) + 2deg));opacity:0}
}
@keyframes giftfx-fall-photo{
  0%{transform:translate(-50%,-20vh) rotate(var(--rot));opacity:0}
  12%{opacity:0.98}
  38%{transform:translate(calc(-50% + var(--drift-a)),28vh) rotate(calc(var(--rot) - 8deg));opacity:0.98}
  72%{transform:translate(calc(-50% + var(--drift-b)),76vh) rotate(calc(var(--rot) + 7deg));opacity:0.98}
  100%{transform:translate(calc(-50% + var(--drift-c)),118vh) rotate(calc(var(--rot) - 3deg));opacity:0}
}
.giftfx-audio-wrap{position:fixed;right:16px;bottom:16px;z-index:45;pointer-events:none}
.giftfx-audio-toggle{pointer-events:auto;display:flex;align-items:center;gap:8px;min-height:44px;border-radius:999px;border:1px solid rgba(255,255,255,0.55);background:rgba(255,252,250,0.9);padding:10px 16px;font:600 14px/1 system-ui,sans-serif;color:rgba(99,28,65,0.9);box-shadow:0 18px 42px -24px rgba(60,21,45,0.8);backdrop-filter:blur(10px);cursor:pointer}
.giftfx-audio-toggle:hover{transform:translateY(-1px)}
.giftfx-heart-burst{position:fixed;left:0;top:0;pointer-events:none;z-index:44}
.giftfx-heart{position:absolute;left:0;top:0;font-size:14px;color:#fb7185;text-shadow:0 0 10px rgba(244,114,182,0.4);animation:giftfx-heart-pop 0.85s ease-out forwards}
@keyframes giftfx-heart-pop{
  0%{transform:translate(0,0) scale(0.5);opacity:1}
  100%{transform:translate(var(--dx),var(--dy)) scale(1.2);opacity:0}
}`;

  const itemsHTML = fallingItems
    .map((item) => {
      if (item.kind === "message") {
        return `<div class="giftfx-item msg" style="left:${item.left}%;width:${item.width}px;--rot:${item.rotation}deg;--drift-a:${Math.round(item.sway)}px;--drift-b:${Math.round(item.sway * -0.6)}px;--drift-c:${Math.round(item.sway * 0.3)}px;animation-duration:${item.duration}s;animation-delay:${item.delay}s"><div class="giftfx-card"><span>${escapeHtml(item.text)}</span></div></div>`;
      }

      return `<div class="giftfx-item photo" style="left:${item.left}%;width:${item.size}px;--rot:${item.rotation}deg;--drift-a:${Math.round(item.sway * -0.4)}px;--drift-b:${Math.round(item.sway)}px;--drift-c:${Math.round(item.sway * -0.2)}px;animation-duration:${item.duration}s;animation-delay:${item.delay}s"><div class="giftfx-card"><div class="giftfx-frame"><img src="${escapeAttribute(item.src)}" alt="${escapeAttribute(item.alt || "")}"></div></div></div>`;
    })
    .join("");

  const bodyHTML = `
${fallingItems.length ? `<div class="giftfx-layer" aria-hidden="true">${itemsHTML}</div>` : ""}
${audio ? `<div class="giftfx-audio-wrap"><button class="giftfx-audio-toggle" type="button" data-giftfx-audio-toggle><span data-giftfx-audio-icon>▶</span><span data-giftfx-audio-label>Phát nhạc</span></button><audio id="giftfx-audio" src="${escapeAttribute(audio.publicUrl)}" preload="metadata" loop></audio></div>` : ""}`;

  const js = `
(function(){
  var heartBurstEnabled=${heartBurstEnabled ? "true" : "false"};
  var audio=document.getElementById('giftfx-audio');
  var toggle=document.querySelector('[data-giftfx-audio-toggle]');
  var audioIcon=document.querySelector('[data-giftfx-audio-icon]');
  var audioLabel=document.querySelector('[data-giftfx-audio-label]');
  var hasAudioStarted=false;
  var userPausedAudio=false;

  function syncAudioUI(){
    if(!audioIcon||!audioLabel||!audio)return;
    if(audio.paused){
      audioIcon.textContent='▶';
      audioLabel.textContent='Phát nhạc';
    }else{
      audioIcon.textContent='❚❚';
      audioLabel.textContent='Tạm dừng';
    }
  }

  async function startAudioFromGesture(){
    if(!audio||hasAudioStarted||userPausedAudio)return;
    try{
      await audio.play();
      hasAudioStarted=true;
    }catch(_error){
      syncAudioUI();
      return;
    }
    syncAudioUI();
  }

  if(audio){
    audio.addEventListener('play',syncAudioUI);
    audio.addEventListener('pause',syncAudioUI);
    syncAudioUI();
  }

  if(toggle&&audio){
    toggle.addEventListener('click',async function(event){
      event.stopPropagation();
      if(audio.paused){
        userPausedAudio=false;
        hasAudioStarted=true;
        try{
          await audio.play();
        }catch(_error){
        }
      }else{
        userPausedAudio=true;
        audio.pause();
      }
      syncAudioUI();
    });
  }

  function spawnHeartBurst(x,y){
    if(!heartBurstEnabled)return;
    var burst=document.createElement('div');
    burst.className='giftfx-heart-burst';
    burst.style.left=x+'px';
    burst.style.top=y+'px';
    for(var index=0;index<9;index+=1){
      var angle=(Math.PI*2*index)/9;
      var distance=20+(index%3)*10;
      var heart=document.createElement('span');
      heart.className='giftfx-heart';
      heart.textContent='♥';
      heart.style.setProperty('--dx',Math.cos(angle)*distance+'px');
      heart.style.setProperty('--dy',Math.sin(angle)*distance+'px');
      if(index%2===1){
        heart.style.color='#f472b6';
      }
      burst.appendChild(heart);
    }
    document.body.appendChild(burst);
    window.setTimeout(function(){burst.remove()},850);
  }

  document.addEventListener('pointerdown',function(event){
    if(toggle&&event.target instanceof Element&&toggle.contains(event.target)){
      return;
    }
    spawnHeartBurst(event.clientX,event.clientY);
    startAudioFromGesture();
  },{passive:true});
})();
`;

  return {
    css,
    bodyHTML,
    js,
  };
}
