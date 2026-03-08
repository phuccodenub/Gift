import type { GiftData } from "@/types/gift";
import { wrapExportHTML } from "@/lib/export-html";
import { createDeterministicRandom, randomInRange } from "@/lib/deterministic";
import { getFlowerTreeScene } from "@/lib/flower-tree-scene";

export function generateFlowerTreeExportHTML(gift: GiftData): string {
  const { colors } = gift.config;
  const p = colors.primary;
  const s = colors.secondary;
  const a = colors.accent || colors.primary;
  const bg = colors.background || "#0f172a";

  const css = `
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',system-ui,sans-serif;min-height:100vh;overflow-x:hidden;
  background:radial-gradient(ellipse at 50% 0%,#1a1040,transparent 60%),radial-gradient(circle at 16% 8%,${p}22,transparent 34%),radial-gradient(circle at 82% 14%,${a}14,transparent 32%),linear-gradient(175deg,#0a0618,${bg} 50%,#0d0a14)}
.scene{display:flex;align-items:center;justify-content:center;min-height:100vh;position:relative;overflow:hidden}
.mountains{position:absolute;bottom:0;left:0;right:0;height:40%;pointer-events:none;z-index:0}
.star{position:absolute;background:radial-gradient(circle,#fff,#fff8);border-radius:50%;animation:twinkle ease-in-out infinite}
@keyframes twinkle{0%,100%{opacity:0.15;transform:scale(0.8)}50%{opacity:0.9;transform:scale(1.1)}}
.firefly{position:absolute;border-radius:50%;background:radial-gradient(circle,#ffe4b5,#ffd70066,transparent);pointer-events:none;filter:blur(1px);animation:firefly ease-in-out infinite}
@keyframes firefly{0%,100%{opacity:0;transform:translateY(0)}30%{opacity:0.8}60%{opacity:0.3}90%{opacity:0.9;transform:translateY(-25px)}}
.shooting-star{position:absolute;width:2px;height:2px;background:#fff;border-radius:50%;box-shadow:0 0 6px 2px rgba(255,255,255,0.6);animation:shoot linear infinite}
@keyframes shoot{0%{transform:translate(0,0);opacity:0}10%{opacity:1}100%{transform:translate(120px,60px);opacity:0}}
.bokeh{position:absolute;border-radius:50%;pointer-events:none;filter:blur(40px);opacity:0.1}
.intro,.tree-scene,.msg-scene{position:absolute;display:flex;flex-direction:column;
  align-items:center;gap:16px;text-align:center;transition:all 0.5s ease;padding:16px;z-index:2}
.hidden{opacity:0;pointer-events:none;transform:scale(0.9)}
.icon{font-size:72px;animation:float 3s ease-in-out infinite}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
h1{font-size:28px;font-weight:700;color:#fff;text-shadow:0 0 30px ${p}44}
.subtitle{font-size:14px;color:rgba(255,255,255,0.5);max-width:300px;line-height:1.6}
.btn{position:relative;overflow:hidden;background:linear-gradient(135deg,${p},${s});color:#fff;border:none;padding:14px 32px;
  border-radius:50px;font-size:16px;font-weight:700;cursor:pointer;box-shadow:0 0 40px ${p}44;transition:transform 0.2s}
.btn:hover{transform:scale(1.05)}
.btn::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent);
  animation:shimmer 2s infinite;border-radius:50px}
@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
.tree-container{position:relative;width:340px;height:400px;background:rgba(15,10,25,0.45);
  backdrop-filter:blur(8px);border-radius:32px;border:1px solid rgba(255,255,255,0.08);
  box-shadow:0 40px 80px -30px rgba(0,0,0,0.8);overflow:hidden;padding:16px}
.tree-glow{position:absolute;inset:0;border-radius:32px;background:radial-gradient(ellipse at 50% 60%,${p}12,transparent 70%);pointer-events:none}
.trunk{position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:16px;
  height:170px;background:linear-gradient(to top,#5b4a3f,#a08060);border-radius:8px;
  transform-origin:bottom;transform:translateX(-50%) scaleY(0);transition:transform 0.8s ease;
  box-shadow:0 0 12px #5b4a3f44}
.trunk.show{transform:translateX(-50%) scaleY(1)}
.branch{position:absolute;width:7px;background:linear-gradient(to top,#5b4a3f,#a08060);
  border-radius:4px;transform-origin:bottom center;transform:scaleY(0);transition:transform 0.6s ease}
.branch.show{transform:scaleY(1)}
.flower{position:absolute;transform:scale(0);transition:transform 0.5s cubic-bezier(0.34,1.56,0.64,1)}
.flower.show{transform:scale(1)}
.fpetal{position:absolute;left:50%;top:50%;border-radius:50%;transform-origin:50% 100%;filter:saturate(1.3)}
.fcenter{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);border-radius:50%;
  background:radial-gradient(circle,#fef3c7,#f59e0b);box-shadow:0 0 10px #f59e0b55;z-index:1}
.flower-glow{position:absolute;border-radius:50%;background:radial-gradient(circle,${p}22,transparent);filter:blur(4px);pointer-events:none}
.ground{position:absolute;bottom:-2px;left:50%;transform:translateX(-50%);width:220px;height:24px;
  border-radius:50%;background:radial-gradient(ellipse,${p}44,transparent);filter:blur(8px)}
.photo{position:absolute;border-radius:50%;overflow:hidden;
  border:3px solid ${p};box-shadow:0 0 20px ${p}44,0 4px 12px rgba(0,0,0,0.2);transform:rotate(var(--rot, 0deg)) scale(0);
  transform-origin:center center;transition:transform 0.5s ease}
.photo.show{transform:rotate(var(--rot, 0deg)) scale(1)}
.photo img{width:100%;height:100%;object-fit:cover}
.text-bubble{position:absolute;border:1px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.1);
  color:#fff;border-radius:16px;padding:8px 12px;font-size:12px;line-height:1.4;backdrop-filter:blur(4px);
  box-shadow:0 4px 16px rgba(0,0,0,0.3);opacity:0;transform:rotate(var(--rot, 0deg)) translateY(8px);transition:all 0.5s ease}
.text-bubble.show{opacity:1;transform:rotate(var(--rot, 0deg)) translateY(0)}
.msg-card{position:relative;background:linear-gradient(180deg,#fffbf5,#fef7ed);border-radius:24px;
  padding:32px;max-width:400px;width:90%;box-shadow:inset 0 2px 0 rgba(255,255,255,0.5),0 30px 60px -20px rgba(0,0,0,0.5);
  transform:translateY(40px);opacity:0;transition:all 0.6s ease;overflow:hidden}
.msg-card::before{content:'';position:absolute;inset:0;border-radius:24px;border:2px solid ${p}33;pointer-events:none}
.msg-card.show{transform:translateY(0);opacity:1}
.msg-tape{position:absolute;width:32px;height:32px;border:1px dashed ${p}44;background:${p}15;border-radius:3px}
.msg-tape.tl{top:-4px;left:-4px;transform:rotate(-15deg)}
.msg-tape.br{bottom:-4px;right:-4px;transform:rotate(15deg)}
.msg-to{font-size:15px;color:${p};margin-bottom:8px;font-style:italic;font-weight:500}
.msg-text{font-size:18px;line-height:1.85;color:#2a1a2e;white-space:pre-wrap}
.msg-from{text-align:right;font-size:15px;color:${p};font-style:italic;margin-top:24px;font-weight:500}
.back-btn{background:none;border:none;color:rgba(255,255,255,0.6);font-size:14px;
  cursor:pointer;margin-top:16px;transition:color 0.2s}
.back-btn:hover{color:#fff}
`;

  const starsHTML = Array.from({ length: 30 })
    .map((_, index) => {
      const random = createDeterministicRandom(`flower-tree-export:${gift.id ?? gift.templateId}:star:${index}`);
      const size = randomInRange(random, 1.5, 4);
      const left = randomInRange(random, 0, 100);
      const top = randomInRange(random, 0, 55);
      const duration = randomInRange(random, 2, 5);
      const delay = randomInRange(random, 0, 3);
      return `<div class="star" style="left:${left}%;top:${top}%;width:${size}px;height:${size}px;animation-duration:${duration}s;animation-delay:${delay}s"></div>`;
    })
    .join("");

  const firefliesHTML = Array.from({ length: 8 })
    .map((_, i) => {
      const random = createDeterministicRandom(`flower-tree-export:${gift.id ?? gift.templateId}:ff:${i}`);
      return `<div class="firefly" style="left:${randomInRange(random, 10, 90)}%;top:${randomInRange(random, 30, 85)}%;width:${randomInRange(random, 4, 9)}px;height:${randomInRange(random, 4, 9)}px;animation-duration:${randomInRange(random, 3, 7)}s;animation-delay:${randomInRange(random, 0, 5)}s"></div>`;
    })
    .join("");

  const shootingStarsHTML = Array.from({ length: 3 })
    .map((_, i) => {
      const random = createDeterministicRandom(`flower-tree-export:${gift.id ?? gift.templateId}:shoot:${i}`);
      return `<div class="shooting-star" style="left:${randomInRange(random, 10, 70)}%;top:${randomInRange(random, 5, 25)}%;animation-duration:1.2s;animation-delay:${randomInRange(random, 2, 12)}s"></div>`;
    })
    .join("");

  const flowerDefs = [
    { x: 150, y: 30, size: 40, c: p },
    { x: 90, y: 60, size: 35, c: s },
    { x: 210, y: 55, size: 35, c: a },
    { x: 60, y: 100, size: 30, c: p },
    { x: 240, y: 95, size: 30, c: s },
    { x: 120, y: 90, size: 32, c: a },
    { x: 190, y: 85, size: 32, c: p },
    { x: 150, y: 120, size: 28, c: s },
  ];

  const flowersHTML = flowerDefs
    .map((f, i) => {
      const petalsHTML = Array.from({ length: 6 })
        .map(
          (_, j) =>
            `<div class="fpetal" style="width:${f.size * 0.4}px;height:${f.size * 0.55}px;background:radial-gradient(ellipse at 50% 30%,${f.c},${f.c}aa);transform:translate(-50%,-100%) rotate(${j * 60}deg)"></div>`,
        )
        .join("");
      return `<div class="flower" data-delay="${1000 + i * 150}" style="left:${f.x - f.size / 2}px;top:${f.y - f.size / 2}px;width:${f.size}px;height:${f.size}px">
  ${petalsHTML}<div class="fcenter" style="width:${f.size * 0.2}px;height:${f.size * 0.2}px"></div></div>`;
    })
    .join("");

  const photoPos = [
    { x: 30, y: 40 },
    { x: 230, y: 35 },
    { x: 10, y: 140 },
    { x: 250, y: 140 },
  ];
  const scene = getFlowerTreeScene(gift);
  const sceneImageElements = (scene?.elements ?? []).filter((item) => item.type === "image");
  const sceneTextElements = (scene?.elements ?? []).filter((item) => item.type === "text");
  const imageByAssetId = new Map(
    gift.images
      .filter((img) => Boolean(img.assetId))
      .map((img) => [img.assetId as string, img] as const),
  );

  const photosHTML =
    sceneImageElements.length > 0
      ? sceneImageElements
          .map((element, i) => {
            const image = element.assetRef ? imageByAssetId.get(element.assetRef) : undefined;
            const src = image?.publicUrl || image?.url;
            if (!src) {
              return "";
            }
            const shape = element.style?.shape === "rounded" ? "12px" : "999px";
            return `<div class="photo" data-delay="${2000 + i * 150}" style="left:${element.transform.x}px;top:${element.transform.y}px;width:${element.transform.width}px;height:${element.transform.height}px;--rot:${element.transform.rotation ?? 0}deg;border-radius:${shape}"><img src="${src}" alt=""></div>`;
          })
          .join("")
      : gift.images
          .slice(0, 4)
          .map(
            (img, i) =>
              `<div class="photo" data-delay="${2000 + i * 200}" style="left:${photoPos[i].x}px;top:${photoPos[i].y}px"><img src="${img.publicUrl || img.url}" alt=""></div>`,
          )
          .join("");

  const textBubblesHTML = sceneTextElements
    .map(
      (element, index) =>
        `<div class="text-bubble" data-delay="${1800 + index * 120}" style="left:${element.transform.x}px;top:${element.transform.y}px;width:${element.transform.width}px;min-height:${element.transform.height}px;--rot:${element.transform.rotation ?? 0}deg">${element.content || ""}</div>`,
    )
    .join("");

  const bodyHTML = `
<div class="scene">
  <svg class="mountains" viewBox="0 0 1440 400" preserveAspectRatio="none"><path d="M0,280Q200,160 400,240Q600,320 800,200Q1000,120 1200,220Q1350,280 1440,240L1440,400L0,400Z" fill="${p}12"/><path d="M0,320Q180,240 360,290Q540,340 720,260Q900,200 1080,280Q1260,340 1440,300L1440,400L0,400Z" fill="${p}20"/><path d="M0,360Q240,310 480,340Q720,370 960,330Q1200,310 1440,350L1440,400L0,400Z" fill="${p}2a"/></svg>
  <div class="bokeh" style="left:5%;top:40%;width:250px;height:250px;background:${p}66"></div>
  <div class="bokeh" style="right:10%;bottom:15%;width:200px;height:200px;background:${s}66"></div>
  ${starsHTML}
  ${shootingStarsHTML}
  ${firefliesHTML}
  <div class="intro" id="intro">
    <div class="icon">🌸</div>
    <h1>${gift.recipientName ? `${gift.recipientName}, cây hoa kỷ niệm đang chờ bạn` : "Cây hoa kỷ niệm đang chờ bạn"}</h1>
    <p class="subtitle">Mỗi bông hoa mang một kỷ niệm, mỗi ánh sao là một lời chúc</p>
    <button class="btn" onclick="showTree()">✨ Khám phá ngay!</button>
  </div>
  <div class="tree-scene hidden" id="treeScene">
    <div class="tree-container">
      <div class="tree-glow"></div>
      <div class="trunk" id="trunk"></div>
      <div class="branch" style="left:153px;top:135px;height:85px;transform:rotate(-35deg) scaleY(0)" data-delay="500"></div>
      <div class="branch" style="left:160px;top:135px;height:85px;transform:rotate(35deg) scaleY(0)" data-delay="600"></div>
      <div class="branch" style="left:150px;top:178px;height:65px;transform:rotate(-25deg) scaleY(0)" data-delay="700"></div>
      <div class="branch" style="left:163px;top:178px;height:65px;transform:rotate(25deg) scaleY(0)" data-delay="800"></div>
      ${flowersHTML}
      ${photosHTML}
      ${textBubblesHTML}
      <div class="ground"></div>
      <div style="position:absolute;bottom:8px;left:20%;font-size:16px">🌱</div>
      <div style="position:absolute;bottom:8px;right:22%;font-size:16px">🌱</div>
    </div>
    <button class="btn" id="msgBtn" style="opacity:0;transition:opacity 0.5s" onclick="showMsg()">💌 Đọc lời nhắn</button>
  </div>
  <div class="msg-scene hidden" id="msgScene">
    <div class="msg-card" id="msgCard">
      <div class="msg-tape tl"></div>
      <div class="msg-tape br"></div>
      ${gift.recipientName ? `<p class="msg-to">Gửi ${gift.recipientName} thương mến,</p>` : ""}
      <p class="msg-text">${gift.message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
      ${gift.senderName ? `<p class="msg-from">${gift.senderName} 💕</p>` : ""}
    </div>
    <button class="back-btn" onclick="showTree()">← Xem lại cây hoa</button>
  </div>
</div>`;

  const js = `
function showTree(){
  document.getElementById('intro').classList.add('hidden');
  document.getElementById('msgScene').classList.add('hidden');
  var ts=document.getElementById('treeScene');ts.classList.remove('hidden');
  document.getElementById('trunk').classList.add('show');
  ts.querySelectorAll('.branch').forEach(function(b){
    var d=parseInt(b.dataset.delay||0);
    var a=b.style.transform.replace('scaleY(0)','');
    setTimeout(function(){b.style.transform=a+'scaleY(1)';b.classList.add('show')},d);
  });
  ts.querySelectorAll('.flower').forEach(function(f){setTimeout(function(){f.classList.add('show')},parseInt(f.dataset.delay||0))});
  ts.querySelectorAll('.photo').forEach(function(p){setTimeout(function(){p.classList.add('show')},parseInt(p.dataset.delay||0))});
  ts.querySelectorAll('.text-bubble').forEach(function(t){setTimeout(function(){t.classList.add('show')},parseInt(t.dataset.delay||0))});
  setTimeout(function(){document.getElementById('msgBtn').style.opacity='1'},2500);
}
function showMsg(){
  document.getElementById('treeScene').classList.add('hidden');
  var ms=document.getElementById('msgScene');ms.classList.remove('hidden');
  setTimeout(function(){document.getElementById('msgCard').classList.add('show')},100);
}`;

  const title = gift.recipientName
    ? `Cây hoa dành cho ${gift.recipientName}`
    : "Cây hoa huyền diệu";

  return wrapExportHTML(title, css, bodyHTML, js);
}
