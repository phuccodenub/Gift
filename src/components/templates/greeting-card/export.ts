import type { GiftData } from "@/types/gift";
import { wrapExportHTML } from "@/lib/export-html";
import { createDeterministicRandom, randomInRange } from "@/lib/deterministic";
import { shouldUseLegacyImageLayout } from "@/lib/gift-effects";

export function generateGreetingCardExportHTML(gift: GiftData): string {
  const { colors } = gift.config;
  const p = colors.primary;
  const s = colors.secondary;
  const a = colors.accent || colors.primary;
  const bg = colors.background || "#fdf2f8";
  const showLegacyImages = shouldUseLegacyImageLayout(gift);

  const css = `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,sans-serif;min-height:100vh;display:flex;align-items:center;
  justify-content:center;background:radial-gradient(ellipse at 50% 0%,${p}18,transparent 50%),radial-gradient(circle at 18% 12%,${s}20,transparent 36%),radial-gradient(circle at 82% 16%,${a}16,transparent 34%),linear-gradient(155deg,${bg},#f9e8f0,${bg});padding:16px;overflow:hidden}
.floating-heart{position:fixed;bottom:-20px;pointer-events:none;animation:float-up linear infinite}
@keyframes float-up{0%{transform:translateY(0);opacity:0}10%{opacity:0.7}100%{transform:translateY(-110vh);opacity:0}}
.sparkle{position:fixed;border-radius:50%;background:radial-gradient(circle,#fff,#fff8,transparent);pointer-events:none;animation:sparkle ease-in-out infinite}
@keyframes sparkle{0%,100%{opacity:0.1;transform:scale(0.5)}50%{opacity:0.9;transform:scale(1.2)}}
.bokeh{position:fixed;border-radius:50%;pointer-events:none;filter:blur(50px);opacity:0.08}
.confetti{position:fixed;pointer-events:none;animation:confetti-fall forwards}
@keyframes confetti-fall{0%{opacity:1}100%{opacity:0}}
.card-wrap{perspective:1200px;cursor:pointer;position:relative;z-index:2}
.card{position:relative;width:320px;height:440px;transform-style:preserve-3d;transition:transform 0.2s}
.card:hover{transform:scale(1.02)}
.card:active{transform:scale(0.98)}
.front,.back{position:absolute;inset:0;border-radius:28px;backface-visibility:hidden}
.front{background:linear-gradient(132deg,${p},${s});display:flex;flex-direction:column;
  align-items:center;justify-content:center;gap:20px;padding:32px;color:#fff;
  box-shadow:0 30px 58px -20px rgba(43,16,31,0.6);transform-origin:left center;
  transition:transform 0.8s cubic-bezier(0.4,0,0.2,1);overflow:hidden}
.front.open{transform:rotateY(-180deg)}
.front .pattern{position:absolute;inset:0;opacity:0.06;
  background-image:repeating-linear-gradient(45deg,transparent,transparent 20px,rgba(255,255,255,0.3) 20px,rgba(255,255,255,0.3) 21px),repeating-linear-gradient(-45deg,transparent,transparent 20px,rgba(255,255,255,0.3) 20px,rgba(255,255,255,0.3) 21px)}
.front .inner-glow{position:absolute;inset:0;border-radius:28px;background:radial-gradient(ellipse at 50% 35%,rgba(255,255,255,0.12),transparent 60%);pointer-events:none}
.front .icon-ring{position:relative;width:96px;height:96px;border-radius:50%;border:2px solid rgba(255,255,255,0.25);
  background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;
  box-shadow:0 0 30px rgba(255,255,255,0.08);animation:wobble 3s ease-in-out infinite 2s}
@keyframes wobble{0%,100%{transform:rotate(0)}25%{transform:rotate(-5deg)}75%{transform:rotate(5deg)}}
.front .icon-ring span{font-size:48px}
.front h2{font-size:24px;font-weight:700;text-shadow:0 2px 8px rgba(0,0,0,0.15);text-align:center}
.front .divider{width:64px;height:1px;background:rgba(255,255,255,0.3);border-radius:1px}
.front .hint{font-size:14px;opacity:0.6;animation:pulse-hint 2s infinite}
@keyframes pulse-hint{0%,100%{opacity:0.6}50%{opacity:0.9}}
.front .bottom-hearts{margin-top:16px;opacity:0.4;font-size:14px;letter-spacing:8px}
.back{overflow:hidden;border-radius:28px;padding:2px}
.back .border-glow{position:absolute;inset:0;border-radius:28px;background:linear-gradient(135deg,${p}44,${s}44,${p}44)}
.back .inner{position:relative;height:100%;border-radius:26px;background:linear-gradient(180deg,#fffbf7,#fef7ed);
  padding:32px;display:flex;flex-direction:column;justify-content:space-between;
  box-shadow:inset 0 2px 0 rgba(255,255,255,0.8),0 30px 62px -38px rgba(51,19,37,0.7)}
.back .flourish{text-align:center;font-size:20px;opacity:0.4;color:${p};letter-spacing:4px}
.msg-to{font-size:16px;color:${p};margin-bottom:8px;font-style:italic;font-weight:500}
.msg-text{font-size:17px;line-height:1.85;color:#2f1a2a;white-space:pre-wrap;flex:1}
.msg-from{text-align:right;font-size:16px;color:${p};font-style:italic;margin-top:16px;font-weight:500}
.note{text-align:center;margin-top:20px;font-size:14px;color:${p};opacity:0;transition:opacity 0.5s 0.5s;font-weight:500}
.note.show{opacity:0.7}
.images{display:flex;gap:8px;margin-top:8px}
.images img{width:48px;height:48px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,0.4);box-shadow:0 2px 8px rgba(0,0,0,0.15)}
`;

  const imagesHTML = showLegacyImages && gift.images.length
    ? `<div class="images">${gift.images.slice(0, 3).map((img) => `<img src="${img.publicUrl || img.url}" alt="">`).join("")}</div>`
    : "";

  const heartsHTML = Array.from({ length: 8 }).map((_, i) => {
    const random = createDeterministicRandom(`greeting-export:${gift.id ?? gift.templateId}:heart:${i}`);
    const hColors = [p, s, a];
    return `<div class="floating-heart" style="left:${randomInRange(random, 5, 95)}%;font-size:${randomInRange(random, 14, 24)}px;color:${hColors[i % 3]};animation-duration:${randomInRange(random, 6, 10)}s;animation-delay:${randomInRange(random, 0, 6)}s;filter:drop-shadow(0 0 4px ${hColors[i % 3]}66)">♥</div>`;
  }).join("");

  const sparklesHTML = Array.from({ length: 10 }).map((_, i) => {
    const random = createDeterministicRandom(`greeting-export:${gift.id ?? gift.templateId}:sparkle:${i}`);
    return `<div class="sparkle" style="left:${randomInRange(random, 5, 95)}%;top:${randomInRange(random, 5, 95)}%;width:${randomInRange(random, 3, 7)}px;height:${randomInRange(random, 3, 7)}px;animation-duration:2s;animation-delay:${randomInRange(random, 0, 4)}s"></div>`;
  }).join("");

  const bodyHTML = `
${heartsHTML}
${sparklesHTML}
<div class="bokeh" style="left:10%;top:20%;width:300px;height:300px;background:${p}88"></div>
<div class="bokeh" style="right:8%;bottom:15%;width:240px;height:240px;background:${s}88"></div>
<div class="card-wrap" id="cardWrap">
  <div class="card" onclick="toggleCard()">
    <div class="back">
      <div class="border-glow"></div>
      <div class="inner">
        <div class="flourish">✿ ── ✿ ── ✿</div>
        <div style="flex:1;display:flex;flex-direction:column;justify-content:center">
          ${gift.recipientName ? `<p class="msg-to">Gửi ${gift.recipientName} thương mến,</p>` : ""}
          <p class="msg-text">${gift.message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
        </div>
        ${gift.senderName ? `<p class="msg-from">Yêu thương, ${gift.senderName} 💕</p>` : ""}
        <div class="flourish">✿ ── ✿ ── ✿</div>
      </div>
    </div>
    <div class="front" id="front">
      <div class="pattern"></div>
      <div class="inner-glow"></div>
      <div class="icon-ring"><span>🌸</span></div>
      <h2>Thiệp 8/3</h2>
      <div class="divider"></div>
      <p class="hint">✨ Chạm để mở thiệp ✨</p>
      ${imagesHTML}
      <div class="bottom-hearts">♥ ♥ ♥</div>
    </div>
  </div>
</div>
<p class="note" id="note">Chạm lại để đóng thiệp</p>`;

  const js = `
var isOpen=false;
var confettiColors=['${p}','${s}','${a}','#f472b6','#a78bfa'];
function toggleCard(){
  isOpen=!isOpen;
  document.getElementById('front').classList.toggle('open',isOpen);
  document.getElementById('note').classList.toggle('show',isOpen);
  if(isOpen)spawnConfetti();
}
function spawnConfetti(){
  for(var i=0;i<18;i++){
    var angle=(i/18)*360;var rad=angle*Math.PI/180;
    var dist=120+Math.random()*80;
    var c=document.createElement('div');c.className='confetti';
    var sz=6+Math.random()*6;
    c.style.width=sz+'px';c.style.height=(sz*1.5)+'px';
    c.style.background=confettiColors[i%confettiColors.length];
    c.style.borderRadius='2px';
    var wrap=document.getElementById('cardWrap').getBoundingClientRect();
    c.style.left=(wrap.left+wrap.width/2)+'px';
    c.style.top=(wrap.top+wrap.height/2)+'px';
    c.style.transition='all 0.9s ease-out';
    document.body.appendChild(c);
    requestAnimationFrame(function(el,dx,dy,a2){return function(){
      el.style.transform='translate('+dx+'px,'+dy+'px) rotate('+(a2+180)+'deg)';
      el.style.opacity='0';
      setTimeout(function(){el.remove()},1000);
    }}(c,Math.cos(rad)*dist,Math.sin(rad)*dist,angle));
  }
}`;

  const title = gift.recipientName
    ? `Thiệp chúc mừng ${gift.recipientName}`
    : "Thiệp chúc mừng 8/3";

  return wrapExportHTML(title, css, bodyHTML, js, gift);
}
