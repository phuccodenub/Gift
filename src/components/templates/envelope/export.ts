import type { GiftData } from "@/types/gift";
import { wrapExportHTML } from "@/lib/export-html";
import { createDeterministicRandom, randomInRange } from "@/lib/deterministic";
import { shouldUseLegacyImageLayout } from "@/lib/gift-effects";

export function generateEnvelopeExportHTML(gift: GiftData): string {
  const { colors } = gift.config;
  const p = colors.primary;
  const s = colors.secondary;
  const bg = colors.background || "#1a1a2e";
  const showLegacyImages = shouldUseLegacyImageLayout(gift);

  const css = `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,sans-serif;min-height:100vh;display:flex;align-items:center;
  justify-content:center;background:radial-gradient(ellipse at 50% 0%,${bg},transparent 50%),radial-gradient(circle at 20% 80%,${p}16,transparent 40%),linear-gradient(165deg,#0a0618,${bg} 50%,#110a1a);overflow:hidden}
.sparkle{position:fixed;width:3px;height:3px;border-radius:50%;background:radial-gradient(circle,#fff,#fff6,transparent);pointer-events:none;animation:sparkle ease-in-out infinite}
@keyframes sparkle{0%,100%{opacity:0.1;transform:scale(0.7)}50%{opacity:0.9;transform:scale(1.2)}}
.bokeh{position:fixed;border-radius:50%;pointer-events:none;filter:blur(40px);opacity:0.08}
.envelope-wrap{position:relative;cursor:pointer;z-index:2}
.envelope{position:relative;width:300px;height:200px}
.env-body{position:absolute;inset:0;border-radius:16px;background:linear-gradient(135deg,${p},${s});
  box-shadow:0 20px 50px -10px rgba(0,0,0,0.5)}
.env-pattern{position:absolute;inset:0;border-radius:16px;opacity:0.06;
  background-image:repeating-linear-gradient(45deg,transparent,transparent 12px,rgba(255,255,255,0.3) 12px,rgba(255,255,255,0.3) 13px)}
.env-flap{position:absolute;left:0;right:0;top:0;height:100px;
  background:linear-gradient(180deg,${p}ee,${s});clip-path:polygon(0 0,50% 100%,100% 0);
  border-radius:16px 16px 0 0;transform-origin:top center;transition:transform 0.8s ease-in-out;z-index:1}
.envelope.open .env-flap{transform:rotateX(180deg)}
.seal{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:36px;z-index:2;
  transition:opacity 0.3s;text-shadow:0 0 20px ${p}66}
.seal-glow{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:60px;height:60px;
  border-radius:50%;background:radial-gradient(circle,${p}44,transparent);animation:pulse-glow 2s infinite;z-index:1}
@keyframes pulse-glow{0%,100%{opacity:0.3;transform:translate(-50%,-50%) scale(1)}50%{opacity:0.7;transform:translate(-50%,-50%) scale(1.3)}}
.envelope.open .seal,.envelope.open .seal-glow{opacity:0}
.hint{text-align:center;color:rgba(255,255,255,0.6);font-size:14px;margin-top:16px;transition:opacity 0.3s}
.envelope.open~.hint{opacity:0}
.confetti{position:fixed;pointer-events:none;border-radius:2px;animation:confetti-fall forwards}
.confetti.heart{border-radius:0;background:none !important;font-size:14px}
@keyframes confetti-fall{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(600px) rotate(720deg);opacity:0}}
.letter{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  opacity:0;pointer-events:none;transition:opacity 0.5s 0.5s;padding:16px;z-index:2}
.letter.show{opacity:1;pointer-events:auto}
.letter-card{position:relative;background:linear-gradient(180deg,#fffbf5,#fef7ed);border-radius:24px;
  padding:32px;max-width:400px;width:100%;box-shadow:inset 0 2px 0 rgba(255,255,255,0.5),0 20px 50px -15px rgba(0,0,0,0.4);
  border:2px solid ${p}22;transform:translateY(30px);transition:transform 0.5s ease 0.6s}
.letter.show .letter-card{transform:translateY(0)}
.letter .icon{text-align:center;font-size:36px;margin-bottom:16px}
.stamp{position:absolute;top:12px;right:12px;width:42px;height:50px;border:2px dashed ${p}33;
  border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:20px;background:${p}08}
.msg-to{font-size:15px;color:${p};margin-bottom:12px;font-style:italic;font-weight:500}
.msg-text{font-size:17px;line-height:1.85;color:#2a1a2e;white-space:pre-wrap}
.msg-from{text-align:right;font-size:15px;color:${p};font-style:italic;margin-top:24px;font-weight:500}
.back-btn{display:block;margin:12px auto 0;background:none;border:none;color:rgba(255,255,255,0.6);
  font-size:14px;cursor:pointer;transition:color 0.2s}
.back-btn:hover{color:#fff}
.images{display:flex;flex-wrap:wrap;gap:12px;margin-top:16px}
.images img{width:64px;height:64px;border-radius:12px;object-fit:cover;box-shadow:0 2px 12px rgba(0,0,0,0.15)}
`;

  const imagesHTML = showLegacyImages && gift.images.length
    ? `<div class="images">${gift.images.map((img) => `<img src="${img.publicUrl || img.url}" alt="">`).join("")}</div>`
    : "";

  const confettiPieces = Array.from({ length: 30 }).map((_, index) => {
    const random = createDeterministicRandom(`envelope-export:${gift.id ?? gift.templateId}:confetti:${index}`);
    return {
      left: randomInRange(random, 0, 100),
      width: randomInRange(random, 6, 14),
      height: randomInRange(random, 4, 9),
      duration: randomInRange(random, 1.5, 3.5),
      delay: randomInRange(random, 0, 0.5),
      color: index % 4,
    };
  });

  const sparklesHTML = Array.from({ length: 15 }).map((_, i) => {
    const random = createDeterministicRandom(`envelope-export:${gift.id ?? gift.templateId}:sparkle:${i}`);
    return `<div class="sparkle" style="left:${randomInRange(random, 0, 100)}%;top:${randomInRange(random, 0, 100)}%;width:${randomInRange(random, 2, 5)}px;height:${randomInRange(random, 2, 5)}px;animation-duration:${randomInRange(random, 2, 5)}s;animation-delay:${randomInRange(random, 0, 3)}s"></div>`;
  }).join("");

  const bodyHTML = `
${sparklesHTML}
<div class="bokeh" style="left:10%;top:30%;width:200px;height:200px;background:${p}"></div>
<div class="bokeh" style="right:5%;bottom:15%;width:160px;height:160px;background:${s}"></div>
<div class="envelope-wrap" id="envWrap">
  <div class="envelope" id="envelope" onclick="openEnvelope()">
    <div class="env-body"></div>
    <div class="env-pattern"></div>
    <div class="env-flap"></div>
    <div class="seal-glow"></div>
    <div class="seal">💌</div>
  </div>
  <p class="hint">✨ Nhấn để mở thư ✨</p>
</div>
<div class="letter" id="letter">
  <div>
    <div class="letter-card">
      <div class="stamp">🌸</div>
      <div class="icon">✨</div>
      ${gift.recipientName ? `<p class="msg-to">Thân gửi ${gift.recipientName} thương mến,</p>` : ""}
      <p class="msg-text">${gift.message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
      ${imagesHTML}
      ${gift.senderName ? `<p class="msg-from">Với tất cả yêu thương, ${gift.senderName} 💕</p>` : ""}
    </div>
    <button class="back-btn" onclick="closeLetter()">← Xem lại phong bì</button>
  </div>
</div>`;

  const js = `
var confettiColors=['${p}','${s}','${colors.accent || "#fde68a"}','#fff'];
var confettiPieces=${JSON.stringify(confettiPieces)};
function openEnvelope(){
  var env=document.getElementById('envelope');
  if(env.classList.contains('open'))return;
  env.classList.add('open');
  for(var i=0;i<confettiPieces.length;i++){
    var piece=confettiPieces[i];
    var c=document.createElement('div');c.className='confetti';
    if(i%5===0){c.className='confetti heart';c.textContent='♥';c.style.color=confettiColors[piece.color]}
    else{c.style.width=piece.width+'px';c.style.height=piece.height+'px';c.style.background=confettiColors[piece.color]}
    c.style.left=piece.left+'%';c.style.top='40%';
    c.style.animationDuration=piece.duration+'s';
    c.style.animationDelay=piece.delay+'s';
    document.body.appendChild(c);
  }
  setTimeout(function(){
    document.getElementById('envWrap').style.display='none';
    document.getElementById('letter').classList.add('show');
  },1200);
}
function closeLetter(){
  document.getElementById('letter').classList.remove('show');
  var env=document.getElementById('envelope');env.classList.remove('open');
  document.getElementById('envWrap').style.display='block';
  document.querySelectorAll('.confetti').forEach(function(c){c.remove()});
}`;

  const title = gift.recipientName
    ? `Thư gửi ${gift.recipientName}`
    : "Phong bì yêu thương";

  return wrapExportHTML(title, css, bodyHTML, js, gift);
}
