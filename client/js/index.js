/* ============================================
   项目简介页 JS — SVG 图表 + 滚动动画 + 数字递增
   复用 design-showcase.js 的 elSVG / initScrollReveal 模式
   ============================================ */

// SVG 命名空间
const NS = 'http://www.w3.org/2000/svg';
function elSVG(tag, attrs) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k === 'text') el.textContent = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v);
  }
  return el;
}
const $ = (sel, ctx) => (ctx || document).querySelector(sel);
const $$ = (sel, ctx) => [...(ctx || document).querySelectorAll(sel)];

// ============================================================
// 1. 滚动渐入动画
// ============================================================
function initScrollReveal() {
  const targets = $$('.section, .highlight-card, .stat-card, .deploy-step, .flow-card, .diagram-container');
  targets.forEach(el => el.classList.add('fade-up'));
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  targets.forEach(el => obs.observe(el));
}

// ============================================================
// 2. 数字递增动画
// ============================================================
function initCounters() {
  const counters = $$('.stat-number[data-target]');
  const animated = new Set();
  function animate(counter) {
    const target = parseInt(counter.dataset.target, 10);
    const suffix = counter.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();
    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      counter.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3))) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    animated.add(counter);
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting && !animated.has(entry.target)) animate(entry.target); });
  }, { threshold: 0.5 });
  counters.forEach(c => obs.observe(c));
}

// ============================================================
// 3. 导航栏行为
// ============================================================
function initNavbar() {
  const nav = $('#navbar');
  if (!nav) return;
  let lastY = 0, ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y > 100 && y > lastY + 5) nav.classList.add('nav-hidden');
        else if (y < lastY - 5 || y < 60) nav.classList.remove('nav-hidden');
        lastY = y; ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
  $$('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = $(link.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
      const navLinks = $('.nav-links');
      const toggle = $('.nav-toggle');
      if (navLinks) navLinks.classList.remove('open');
      if (toggle) toggle.classList.remove('active');
    });
  });
  // 汉堡菜单
  const toggle = $('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const nl = $('.nav-links');
      toggle.classList.toggle('active');
      if (nl) nl.classList.toggle('open');
    });
  }
}

// ============================================================
// 4. SVG Tooltip 系统
// ============================================================
function initTooltips(container) {
  let tooltip = $('.arch-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.className = 'arch-tooltip';
    document.body.appendChild(tooltip);
  }
  let activeTouchNode = null;
  container.addEventListener('mouseover', (e) => {
    const node = e.target.closest('[data-tooltip]');
    if (!node) return;
    tooltip.innerHTML = '<strong>' + node.dataset.tooltip.replace(/\n/g, '<br>') + '</strong>';
    tooltip.classList.add('show');
  });
  container.addEventListener('mousemove', (e) => {
    if (!tooltip.classList.contains('show')) return;
    let x = e.clientX + 16, y = e.clientY + 12;
    if (x + 280 > window.innerWidth) x = e.clientX - 296;
    if (y + 80 > window.innerHeight) y = e.clientY - 90;
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
  });
  container.addEventListener('mouseout', (e) => {
    if (e.target.closest('[data-tooltip]')) tooltip.classList.remove('show');
  });
  container.addEventListener('touchstart', (e) => {
    const node = e.target.closest('[data-tooltip]');
    if (!node) { tooltip.classList.remove('show'); activeTouchNode = null; return; }
    if (activeTouchNode === node) { tooltip.classList.remove('show'); activeTouchNode = null; return; }
    activeTouchNode = node;
    tooltip.innerHTML = '<strong>' + node.dataset.tooltip.replace(/\n/g, '<br>') + '</strong>';
    tooltip.classList.add('show');
    let x = e.touches[0].clientX + 16, y = e.touches[0].clientY + 12;
    tooltip.style.left = x + 'px'; tooltip.style.top = y + 'px';
  });
}

// ============================================================
// 5. 主架构图 — 浏览器→Nginx→PHP/Node→MySQL/Puppeteer→抖音
// ============================================================
function drawArchDiagram() {
  const container = $('#arch-main');
  if (!container) return;
  const W = 1100, H = 560, PAD = 20;

  const svg = elSVG('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', style: 'min-height:460px;background:#0d1117;border-radius:12px' });

  // 渐变
  const defs = elSVG('defs');
  [['g-front','#58a6ff','#1f6feb'],['g-php','#3fb950','#238636'],['g-node','#a371f7','#7c3aed'],['g-db','#d2991d','#9e6a03']].forEach(([id,c1,c2]) => {
    const g = elSVG('linearGradient', { id, x1:'0',y1:'0',x2:'1',y2:'0' });
    g.appendChild(elSVG('stop', { offset:'0%','stop-color':c1,'stop-opacity':'0.9' }));
    g.appendChild(elSVG('stop', { offset:'100%','stop-color':c2,'stop-opacity':'0.85' }));
    defs.appendChild(g);
  });
  const arrow = elSVG('marker', { id:'ahead', markerWidth:'10',markerHeight:'8',refX:'9',refY:'4',orient:'auto' });
  arrow.appendChild(elSVG('path', { d:'M0,0 L10,4 L0,8 Z', fill:'#8b949e' }));
  defs.appendChild(arrow);
  svg.appendChild(defs);

  function node(x, y, w, h, label, color, tooltip) {
    const g = elSVG('g', { class:'arch-node' });
    if (tooltip) g.setAttribute('data-tooltip', tooltip);
    g.appendChild(elSVG('rect', { x, y, width:w, height:h, rx:6, fill:color,'fill-opacity':'0.12', stroke:color,'stroke-opacity':'0.5','stroke-width':'1.2' }));
    g.appendChild(elSVG('rect', { x, y, width:3, height:h, rx:3, fill:color }));
    const t = elSVG('text', { x:x+14, y:y+h/2+5, fill:'#e6edf3','font-size':'12.5','font-family':'var(--font-body),sans-serif' });
    if (label.includes('\n')) {
      const [l1,l2] = label.split('\n');
      t.setAttribute('y', y+h/2-4); t.textContent = l1; g.appendChild(t);
      g.appendChild(elSVG('text', { x:x+14, y:y+h/2+18, fill:'#8b949e','font-size':'10.5','font-family':'var(--font-mono),monospace', text:l2 }));
    } else { t.textContent = label; g.appendChild(t); }
    svg.appendChild(g); return g;
  }
  function arrowLine(x1,y1,x2,y2, dash) {
    svg.appendChild(elSVG('line', { x1,y1,x2,y2, stroke:'#8b949e','stroke-width':'1.2', 'stroke-dasharray':dash||'', 'marker-end':'url(#ahead)' }));
  }

  // 层背景
  const layers = [
    { y:8, h:98, color:'#58a6ff', label:'客户端' },
    { y:116, h:132, color:'#a371f7', label:'反向代理层' },
    { y:258, h:180, color:'#3fb950', label:'后端服务层' },
    { y:448, h:100, color:'#d2991d', label:'数据与外部' },
  ];
  layers.forEach(l => {
    svg.appendChild(elSVG('rect', { x:PAD, y:l.y, width:W-PAD*2, height:l.h, rx:8, fill:l.color,'fill-opacity':'0.05', stroke:l.color,'stroke-opacity':'0.2','stroke-width':'1' }));
    svg.appendChild(elSVG('text', { x:PAD+14, y:l.y+24, fill:l.color,'font-size':'13','font-weight':'700','font-family':'var(--font-body),sans-serif', text:l.label }));
  });

  // 浏览器
  node(60, 42, 160, 48, '浏览器\nChrome / Safari / Edge', '#58a6ff', '用户通过浏览器访问网站\n支持桌面端和移动端');
  // Nginx
  node(60, 155, 240, 48, 'Nginx\n静态文件 · 反向代理 · 负载均衡', '#a371f7', '统一入口：静态资源直返\nPHP 请求 → fastcgi_pass\nNode 请求 → proxy_pass');
  // 静态文件
  node(360, 155, 120, 48, '静态文件\nHTML/CSS/JS', '#a371f7', 'client/ 目录直接托管\n无需后端处理');
  // PHP
  node(60, 295, 200, 48, 'PHP-FPM\n招聘 · 查重 · 邮件', '#3fb950', '3 个 API 端点\n数据库 CRUD 操作\nPHPMailer 邮件发送');
  // Node
  node(290, 295, 200, 48, 'Node.js Express\nPuppeteer 爬虫 · API', '#a371f7', '定时/手动双模式\n无头浏览器数据爬取\nJSON 格式返回');
  // MySQL
  node(60, 480, 200, 48, 'MySQL 8.0\nrecruitment_info', '#d2991d', '招聘信息持久化存储\nphone UNIQUE 约束');
  // Puppeteer→抖音
  node(520, 295, 180, 48, 'Puppeteer → 抖音\n无头浏览器爬取', '#d2991d', 'Chromium 无头模式\ncookie 模拟登录\n数据提取与解析');
  // JSON 文件
  node(730, 295, 130, 48, 'accounts.json\n定时落盘', '#d2991d', 'cron 每 2 小时写入\n前端直接读取静态 JSON');
  // cron
  node(520, 480, 160, 40, 'node-cron\n每 2 小时触发', '#d2991d', '自动定时爬取\n数据持久化到文件');

  // 连线
  arrowLine(140, 90, 140, 155);  // Browser → Nginx
  arrowLine(200, 179, 360, 179); // Nginx → Static
  arrowLine(140, 203, 140, 295); // Nginx → PHP
  arrowLine(260, 179, 380, 295); // Nginx → Node
  arrowLine(140, 343, 140, 480); // PHP → MySQL
  arrowLine(370, 343, 370, 420); // Node → cron(虚线)
  arrowLine(370, 343, 520, 343); // Node → Puppeteer
  arrowLine(620, 295, 730, 295); // Puppeteer → JSON
  // cron 虚线
  arrowLine(600, 480, 600, 440);

  container.appendChild(svg);
  initTooltips(container);
}

// ============================================================
// 6. 招聘三段式流程图
// ============================================================
function drawFormFlowDiagram() {
  const container = $('#form-flow-diagram');
  if (!container) return;
  const W = 900, H = 130;

  const svg = elSVG('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', style: 'min-height:120px;background:transparent' });
  const defs = elSVG('defs');
  const arrow = elSVG('marker', { id:'farrow', markerWidth:'10',markerHeight:'8',refX:'9',refY:'4',orient:'auto' });
  arrow.appendChild(elSVG('path', { d:'M0,0 L10,4 L0,8 Z', fill:'#8b949e' }));
  defs.appendChild(arrow);
  svg.appendChild(defs);

  function fnode(x, y, w, h, text, color, sub) {
    svg.appendChild(elSVG('rect', { x, y, width:w, height:h, rx:8, fill:color,'fill-opacity':'0.12', stroke:color,'stroke-opacity':'0.5','stroke-width':'1.2' }));
    svg.appendChild(elSVG('rect', { x, y, width:3, height:h, rx:3, fill:color }));
    svg.appendChild(elSVG('text', { x:x+14, y:y+22, fill:'#e6edf3','font-size':'13','font-weight':'700','font-family':'var(--font-body),sans-serif', text }));
    if (sub) svg.appendChild(elSVG('text', { x:x+14, y:y+42, fill:'#8b949e','font-size':'10.5','font-family':'var(--font-mono),monospace', text:sub }));
  }

  fnode(20, 30, 240, 60, '① 手机号查重', '#58a6ff', 'POST /api/check_phone.php');
  fnode(330, 30, 240, 60, '② 数据入库', '#3fb950', 'POST /api/recruitment.php');
  fnode(640, 30, 240, 60, '③ 邮件通知', '#a371f7', 'POST /api/hire_email.php');

  // 箭头
  [270, 580].forEach(x => {
    svg.appendChild(elSVG('line', { x1:x, y1:60, x2:x+48, y2:60, stroke:'#8b949e','stroke-width':'1.5','marker-end':'url(#farrow)' }));
  });

  // 分支标注
  svg.appendChild(elSVG('text', { x:265, y:20, fill:'#8b949e','font-size':'10','font-family':'var(--font-mono),monospace', text:'重复→拒绝' }));
  svg.appendChild(elSVG('text', { x:575, y:20, fill:'#8b949e','font-size':'10','font-family':'var(--font-mono),monospace', text:'失败→不触发邮件' }));

  container.appendChild(svg);
}

// ============================================================
// 7. 抖音双模式对比图
// ============================================================
function drawDouyinModeDiagram() {
  const container = $('#douyin-mode-diagram');
  if (!container) return;
  const W = 900, H = 150;

  const svg = elSVG('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', style: 'min-height:140px;background:transparent' });
  const defs = elSVG('defs');
  const arrow = elSVG('marker', { id:'darrow', markerWidth:'10',markerHeight:'8',refX:'9',refY:'4',orient:'auto' });
  arrow.appendChild(elSVG('path', { d:'M0,0 L10,4 L0,8 Z', fill:'#8b949e' }));
  defs.appendChild(arrow);
  svg.appendChild(defs);

  function dnode(x, y, w, h, text, color) {
    svg.appendChild(elSVG('rect', { x, y, width:w, height:h, rx:8, fill:color,'fill-opacity':'0.12', stroke:color,'stroke-opacity':'0.5','stroke-width':'1.2' }));
    svg.appendChild(elSVG('text', { x:x+w/2, y:y+h/2+5, fill:'#e6edf3','font-size':'12','font-weight':'600','font-family':'var(--font-body),sans-serif','text-anchor':'middle', text }));
  }
  function darrowLine(x1,y1,x2,y2) {
    svg.appendChild(elSVG('line', { x1,y1,x2,y2, stroke:'#8b949e','stroke-width':'1.2','marker-end':'url(#darrow)' }));
  }

  // 左侧标题
  svg.appendChild(elSVG('text', { x:120, y:22, fill:'var(--accent-blue)','font-size':'13','font-weight':'700','font-family':'var(--font-body),sans-serif','text-anchor':'middle', text:'手动模式 (douyin_server.js)' }));
  svg.appendChild(elSVG('text', { x:630, y:22, fill:'var(--accent-orange)','font-size':'13','font-weight':'700','font-family':'var(--font-body),sans-serif','text-anchor':'middle', text:'定时模式 (auto_douyin.js)' }));

  // 手动模式
  dnode(10, 40, 100, 36, '用户请求', '#58a6ff');
  dnode(130, 40, 110, 36, 'Puppeteer', '#a371f7');
  darrowLine(110, 58, 128, 58);
  darrowLine(240, 58, 260, 58);
  dnode(260, 40, 100, 36, '实时返回', '#3fb950');

  // 定时模式
  dnode(400, 40, 100, 36, 'node-cron', '#d2991d');
  dnode(520, 40, 110, 36, 'Puppeteer', '#a371f7');
  darrowLine(500, 58, 518, 58);
  darrowLine(630, 58, 650, 58);
  dnode(650, 40, 120, 36, 'accounts.json', '#3fb950');
  darrowLine(770, 58, 790, 58);
  dnode(790, 40, 100, 36, '前端读取', '#58a6ff');

  // 底部共享标注
  svg.appendChild(elSVG('text', { x:W/2, y:120, fill:'#8b949e','font-size':'11','font-family':'var(--font-mono),monospace','text-anchor':'middle', text:'共享: Cookie 配置 · /api/update-cookie 热更新 · /api/cookie 查看' }));
  svg.appendChild(elSVG('text', { x:W/2, y:140, fill:'#6e7681','font-size':'10','font-family':'var(--font-mono),monospace','text-anchor':'middle', text:'部署: pm2 进程守护 · Nginx 反向代理 · 腾讯云北京节点' }));

  container.appendChild(svg);
}

// ============================================================
// 入口
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initCounters();
  initNavbar();
  drawArchDiagram();
  drawFormFlowDiagram();
  drawDouyinModeDiagram();
});
