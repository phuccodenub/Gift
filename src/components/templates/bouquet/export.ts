import type { GiftData } from "@/types/gift";
import { wrapExportHTML } from "@/lib/export-html";
import { createDeterministicRandom, randomInRange } from "@/lib/deterministic";

export function generateBouquetExportHTML(gift: GiftData): string {
  const { colors } = gift.config;
  const p = colors.primary;
  const s = colors.secondary;
  const a = colors.accent || colors.primary;
  const bg = colors.background || "#fdf2f8";

  const css = `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,sans-serif;overflow-x:hidden;min-height:100vh;
  background:radial-gradient(ellipse at 50% 0%,${bg},transparent 60%),radial-gradient(circle at 20% 80%,${p}18,transparent 40%),radial-gradient(circle at 80% 20%,${s}14,transparent 30%),linear-gradient(170deg,#fdf2f8,${bg} 50%,#fce7f3)}
.scene{display:flex;align-items:center;justify-content:center;min-height:100vh;position:relative;overflow:hidden}
.mountains{position:absolute;bottom:0;left:0;right:0;height:30%;pointer-events:none;z-index:0}
.petal{position:absolute;top:-20px;opacity:0.6;animation:fall linear infinite;pointer-events:none}
.petal svg{filter:drop-shadow(0 1px 2px rgba(0,0,0,0.1))}
@keyframes fall{0%{transform:translateY(-20px) rotate(0);opacity:0.7}100%{transform:translateY(110vh) rotate(720deg);opacity:0}}
.firefly{position:absolute;border-radius:50%;background:radial-gradient(circle,${p}cc,${p}44,transparent);pointer-events:none;animation:firefly ease-in-out infinite}
@keyframes firefly{0%,100%{opacity:0;transform:translateY(0)}30%{opacity:0.8}60%{opacity:0.3}90%{opacity:0.7;transform:translateY(-30px)}}
.bokeh{position:absolute;border-radius:50%;pointer-events:none;filter:blur(40px);opacity:0.08}
.opening,.bouquet-scene,.message-scene{position:absolute;display:flex;flex-direction:column;align-items:center;
  gap:16px;text-align:center;transition:all 0.6s ease;padding:16px;z-index:2}
.hidden{opacity:0;pointer-events:none;transform:scale(0.8)}
.gift-icon{font-size:80px;animation:float 3s ease-in-out infinite}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
h1{font-size:28px;font-weight:700;color:${p};text-shadow:0 2px 12px ${p}22}
.subtitle{font-size:14px;color:#9b5a6a;max-width:300px;line-height:1.6}
.btn{position:relative;overflow:hidden;background:linear-gradient(135deg,${p},${s});color:#fff;border:none;padding:14px 32px;
  border-radius:50px;font-size:16px;font-weight:700;cursor:pointer;box-shadow:0 8px 30px ${p}44;transition:transform 0.2s}
.btn:hover{transform:scale(1.05)}
.btn::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent);
  animation:shimmer 2s infinite;border-radius:50px}
@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
.bouquet{position:relative;width:280px;height:300px;margin:0 auto}
.flower{position:absolute;transform:scale(0);transition:transform 0.6s cubic-bezier(0.34,1.56,0.64,1)}
.flower.show{transform:scale(1)}
.flower-petal{position:absolute;left:50%;top:50%;border-radius:50%;transform-origin:50% 100%;filter:saturate(1.3)}
.flower-center{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);border-radius:50%;
  background:radial-gradient(circle,#fde68a,#f59e0b);box-shadow:0 0 10px #f59e0b55;z-index:1}
.flower-glow{position:absolute;border-radius:50%;filter:blur(6px);pointer-events:none}
.stem{position:absolute;bottom:0;width:4px;border-radius:2px;background:linear-gradient(to top,#16a34a,#4ade80);
  transform-origin:bottom;transform:scaleY(0);transition:transform 0.5s ease}
.stem.show{transform:scaleY(1)}
.leaf{position:absolute;width:30px;height:16px;background:linear-gradient(135deg,#4ade80,#16a34a);
  transform:scale(0);transition:transform 0.4s ease 0.8s}
.leaf.show{transform:scale(1) rotate(var(--r))}
.leaf.left{border-radius:0 80% 0 80%}
.leaf.right{border-radius:80% 0 80% 0}
.wrap{position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);width:120px;height:70px;
  background:linear-gradient(135deg,${a},${s});clip-path:polygon(10% 0,90% 0,100% 100%,0 100%);
  border-radius:0 0 40px 40px;transform:translateX(-50%) scaleY(0);transition:transform 0.4s ease;
  box-shadow:0 4px 12px rgba(0,0,0,0.12)}
.wrap.show{transform:translateX(-50%) scaleY(1)}
.msg-card{position:relative;background:linear-gradient(180deg,#fffbf5,#fef7ed);border-radius:24px;padding:32px;
  max-width:400px;width:90%;box-shadow:inset 0 2px 0 rgba(255,255,255,0.5),0 20px 50px -15px rgba(0,0,0,0.15);
  border:2px solid ${p}22;transform:translateY(40px) rotate(1deg);opacity:0;transition:all 0.6s ease}
.msg-card.show{transform:translateY(0) rotate(0);opacity:1}
.msg-tape{position:absolute;width:32px;height:32px;border:1px dashed ${p}44;background:${p}15;border-radius:3px}
.msg-tape.tl{top:-6px;left:-6px;transform:rotate(-15deg)}
.msg-tape.br{bottom:-6px;right:-6px;transform:rotate(15deg)}
.msg-to{font-size:15px;color:${p};margin-bottom:8px;font-style:italic;font-weight:500}
.msg-text{font-size:18px;line-height:1.85;color:#2a1a2e;white-space:pre-wrap}
.msg-from{text-align:right;font-size:15px;color:${p};font-style:italic;margin-top:24px;font-weight:500}
.back-link{color:${p}aa;font-size:14px;cursor:pointer;margin-top:16px;border:none;background:none;transition:color 0.2s}
.back-link:hover{color:${p}}
.images{display:flex;gap:12px;margin-top:8px}
.images img{width:56px;height:56px;border-radius:50%;object-fit:cover;border:2px solid ${p};box-shadow:0 2px 12px rgba(0,0,0,0.12)}
`;

  const imagesHTML = gift.images.length
    ? `<div class="images">${gift.images
        .slice(0, 4)
        .map((img) => `<img src="${img.publicUrl || img.url}" alt="">`)
        .join("")}</div>`
    : "";

  const flowerPositions = [
    { x: 105, y: 10, size: 70 },
    { x: 45, y: 30, size: 55 },
    { x: 165, y: 30, size: 55 },
    { x: 12, y: 55, size: 45 },
    { x: 192, y: 55, size: 45 },
    { x: 72, y: 45, size: 60 },
    { x: 132, y: 50, size: 50 },
  ];

  const flowersHTML = flowerPositions
    .map((f, i) => {
      const c = i % 3 === 0 ? p : i % 3 === 1 ? s : a;
      const petalsHTML = Array.from({ length: 5 })
        .map(
          (_, j) =>
            `<div class="flower-petal" style="width:${f.size * 0.45}px;height:${f.size * 0.65}px;background:radial-gradient(ellipse at 50% 30%,${c},${c}cc);transform:translate(-50%,-100%) rotate(${j * 72}deg);box-shadow:inset 0 -4px 8px ${c}88"></div>`,
        )
        .join("");
      return `<div class="flower" data-delay="${300 + i * 200}" style="left:${f.x}px;top:${f.y}px;width:${f.size}px;height:${f.size}px">
  ${petalsHTML}
  <div class="flower-center" style="width:${f.size * 0.22}px;height:${f.size * 0.22}px"></div>
</div>`;
    })
    .join("\n");

  const petalsHTML = Array.from({ length: 12 })
    .map((_, i) => {
      const random = createDeterministicRandom(`bouquet-export:${gift.id ?? gift.templateId}:petal:${i}`);
      const left = randomInRange(random, 0, 100);
      const dur = randomInRange(random, 6, 10);
      const delay = randomInRange(random, 0, 8);
      const c = i % 2 === 0 ? p : s;
      return `<div class="petal" style="left:${left}%;animation-duration:${dur}s;animation-delay:${delay}s"><svg width="16" height="22" viewBox="0 0 16 22"><ellipse cx="8" cy="11" rx="7" ry="10" fill="${c}" opacity="0.7"/></svg></div>`;
    })
    .join("");

  const firefliesHTML = Array.from({ length: 6 })
    .map((_, i) => {
      const random = createDeterministicRandom(`bouquet-export:${gift.id ?? gift.templateId}:ff:${i}`);
      const x = randomInRange(random, 10, 90);
      const y = randomInRange(random, 20, 80);
      const size = randomInRange(random, 4, 8);
      const dur = randomInRange(random, 3, 6);
      const delay = randomInRange(random, 0, 4);
      return `<div class="firefly" style="left:${x}%;top:${y}%;width:${size}px;height:${size}px;animation-duration:${dur}s;animation-delay:${delay}s"></div>`;
    })
    .join("");

  const bodyHTML = `
<div class="scene">
  <svg class="mountains" viewBox="0 0 1440 300" preserveAspectRatio="none"><path d="M0,200Q300,100 600,180Q900,260 1200,150Q1350,100 1440,160L1440,300L0,300Z" fill="${p}08"/><path d="M0,240Q200,180 400,220Q600,260 800,200Q1000,160 1200,220Q1350,250 1440,230L1440,300L0,300Z" fill="${p}10"/></svg>
  <div class="bokeh" style="left:10%;top:30%;width:200px;height:200px;background:${p}"></div>
  <div class="bokeh" style="right:5%;bottom:20%;width:160px;height:160px;background:${s}"></div>
  ${petalsHTML}
  ${firefliesHTML}
  <div class="opening" id="opening">
    <div class="gift-icon">🎁</div>
    <h1>${gift.recipientName ? `${gift.recipientName} ơi, bạn có một món quà!` : "Bạn có một món quà!"}</h1>
    <p class="subtitle">Một bó hoa đặc biệt đang chờ bạn khám phá</p>
    <button class="btn" onclick="showBouquet()">✨ Mở quà thôi!</button>
  </div>
  <div class="bouquet-scene hidden" id="bouquetScene">
    <div class="bouquet">
      ${flowersHTML}
      <div class="stem" data-delay="100" style="left:136px;height:140px"></div>
      <div class="stem" data-delay="100" style="left:76px;height:120px"></div>
      <div class="stem" data-delay="100" style="left:196px;height:120px"></div>
      <div class="leaf left" style="left:110px;top:220px;--r:-20deg"></div>
      <div class="leaf right" style="left:150px;top:240px;--r:20deg"></div>
      <div class="leaf left" style="left:60px;top:210px;--r:-20deg"></div>
      <div class="leaf right" style="left:190px;top:220px;--r:20deg"></div>
      <div class="wrap"></div>
    </div>
    ${imagesHTML}
    <button class="btn" id="msgBtn" style="opacity:0;transition:opacity 0.5s" onclick="showMessage()">💌 Xem lời chúc</button>
  </div>
  <div class="message-scene hidden" id="messageScene">
    <div class="msg-card" id="msgCard">
      <div class="msg-tape tl"></div>
      <div class="msg-tape br"></div>
      ${gift.recipientName ? `<p class="msg-to">Gửi ${gift.recipientName} thương mến,</p>` : ""}
      <p class="msg-text">${gift.message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
      ${gift.senderName ? `<p class="msg-from">${gift.senderName} 💕</p>` : ""}
    </div>
    <button class="back-link" onclick="showBouquet()">← Xem lại bó hoa</button>
  </div>
</div>`;

  const js = `
function showBouquet(){
  document.getElementById('opening').classList.add('hidden');
  document.getElementById('messageScene').classList.add('hidden');
  var bs=document.getElementById('bouquetScene');
  bs.classList.remove('hidden');
  bs.querySelectorAll('.stem').forEach(function(s){setTimeout(function(){s.classList.add('show')},parseInt(s.dataset.delay||0))});
  bs.querySelectorAll('.flower').forEach(function(f){setTimeout(function(){f.classList.add('show')},parseInt(f.dataset.delay||0))});
  bs.querySelectorAll('.leaf').forEach(function(l){setTimeout(function(){l.classList.add('show')},800)});
  var w=bs.querySelector('.wrap');if(w)setTimeout(function(){w.classList.add('show')},200);
  setTimeout(function(){document.getElementById('msgBtn').style.opacity='1'},1800);
}
function showMessage(){
  document.getElementById('bouquetScene').classList.add('hidden');
  var ms=document.getElementById('messageScene');
  ms.classList.remove('hidden');
  setTimeout(function(){document.getElementById('msgCard').classList.add('show')},100);
}`;

  const title = gift.recipientName
    ? `Quà tặng dành cho ${gift.recipientName}`
    : "Quà tặng bó hoa";

  return wrapExportHTML(title, css, bodyHTML, js);
}
