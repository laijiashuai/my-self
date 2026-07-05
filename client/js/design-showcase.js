/* ============================================
   Shuyran 电商平台 — 设计方案展示页面 JS
   架构图 / RBAC 图 / 部署流程 / CI/CD / 交互动效
   ============================================ */

// Canvas roundRect polyfill（兼容旧浏览器）
(function () {
  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
      if (typeof r === 'number') r = { tl: r, tr: r, br: r, bl: r };
      else if (Array.isArray(r)) {
        const [tl, tr = tl, br = tl, bl = tr] = r.length === 1 ? [r[0], r[0], r[0], r[0]]
          : r.length === 2 ? [r[0], r[1], r[0], r[1]]
          : [r[0], r[1], r[2], r[3]];
        r = { tl, tr, br, bl };
      }
      this.beginPath();
      this.moveTo(x + r.tl, y);
      this.lineTo(x + w - r.tr, y);
      this.quadraticCurveTo(x + w, y, x + w, y + r.tr);
      this.lineTo(x + w, y + h - r.br);
      this.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
      this.lineTo(x + r.bl, y + h);
      this.quadraticCurveTo(x, y + h, x, y + h - r.bl);
      this.lineTo(x, y + r.tl);
      this.quadraticCurveTo(x, y, x + r.tl, y);
      this.closePath();
    };
  }
})();

// ============================================================
// 工具函数
// ============================================================
const $ = (sel, ctx) => (ctx || document).querySelector(sel);
const $$ = (sel, ctx) => [...(ctx || document).querySelectorAll(sel)];

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

// ============================================================
// 1. 滚动渐入动画（Intersection Observer）
// ============================================================
function initScrollReveal() {
  const targets = $$('.section, .highlight-card, .stat-card, .deploy-step, .flow-card, .security-item, .config-layer, .summary-col, .diagram-container');

  targets.forEach(el => el.classList.add('fade-up'));

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
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
      // ease-out
      const val = Math.round(target * (1 - Math.pow(1 - progress, 3)));
      counter.textContent = val + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    animated.add(counter);
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated.has(entry.target)) {
        animate(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => obs.observe(c));
}

// ============================================================
// 3. 导航栏行为
// ============================================================
function initNavbar() {
  const nav = $('#navbar');
  let lastY = 0;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y > 100 && y > lastY + 5) {
          nav.classList.add('nav-hidden');
        } else if (y < lastY - 5 || y < 60) {
          nav.classList.remove('nav-hidden');
        }
        lastY = y;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // 平滑滚动
  $$('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = $(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        // 关闭移动端菜单
        const navLinks = $('.nav-links');
        const toggle = $('.nav-toggle');
        if (navLinks) navLinks.classList.remove('open');
        if (toggle) toggle.classList.remove('active');
      }
    });
  });

  // 汉堡菜单切换
  const toggle = $('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const navLinks = $('.nav-links');
      toggle.classList.toggle('active');
      navLinks.classList.toggle('open');
    });
  }
}

// ============================================================
// 4. 四层架构图（SVG）
// ============================================================
function drawArchDiagram() {
  const container = $('#arch-diagram');
  const W = 1100;
  const H = 620;
  const PAD = 24; // 内边距

  const svg = elSVG('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', style: 'min-height:500px;background:#0d1117;border-radius:12px' });

  // 渐变定义
  const defs = elSVG('defs');
  [
    ['grad-front', '#58a6ff', '#1f6feb'],
    ['grad-gateway', '#a371f7', '#7c3aed'],
    ['grad-service', '#3fb950', '#238636'],
    ['grad-infra', '#d2991d', '#9e6a03'],
  ].forEach(([id, c1, c2]) => {
    const grad = elSVG('linearGradient', { id, x1: '0', y1: '0', x2: '1', y2: '0' });
    grad.appendChild(elSVG('stop', { offset: '0%', 'stop-color': c1, 'stop-opacity': '0.9' }));
    grad.appendChild(elSVG('stop', { offset: '100%', 'stop-color': c2, 'stop-opacity': '0.85' }));
    defs.appendChild(grad);
  });
  // 箭头标记
  const arrow = elSVG('marker', { id: 'arrowhead', markerWidth: '10', markerHeight: '8', refX: '9', refY: '4', orient: 'auto' });
  arrow.appendChild(elSVG('path', { d: 'M0,0 L10,4 L0,8 Z', fill: '#8b949e' }));
  defs.appendChild(arrow);
  svg.appendChild(defs);

  // --- 辅助函数 ---
  function layerBox(y, h, color) {
    const rect = elSVG('rect', { x: PAD, y, width: W - PAD * 2, height: h, rx: 10, fill: color, 'fill-opacity': '0.08', stroke: color, 'stroke-opacity': '0.3', 'stroke-width': '1.5' });
    svg.appendChild(rect);
  }
  function layerLabel(y, text, color, icon) {
    const t = elSVG('text', { x: PAD + 16, y: y + 26, fill: color, 'font-size': '14', 'font-weight': '700', 'font-family': 'var(--font-body), sans-serif', text: `${icon || ''} ${text}` });
    svg.appendChild(t);
  }
  function node(x, y, w, h, label, color, dataTooltip) {
    const g = elSVG('g', { class: 'arch-node' });
    if (dataTooltip) g.setAttribute('data-tooltip', dataTooltip);
    const r = elSVG('rect', { x, y, width: w, height: h, rx: 6, fill: color, 'fill-opacity': '0.12', stroke: color, 'stroke-opacity': '0.5', 'stroke-width': '1.2' });
    g.appendChild(r);
    // 左边色条
    g.appendChild(elSVG('rect', { x, y, width: 3, height: h, rx: 3, fill: color }));
    const t = elSVG('text', { x: x + 14, y: y + h / 2 + 5, fill: '#e6edf3', 'font-size': '12.5', 'font-family': 'var(--font-body), sans-serif' });
    if (label.includes('\n')) {
      const lines = label.split('\n');
      t.setAttribute('y', y + h / 2 - 4);
      t.textContent = lines[0];
      g.appendChild(t);
      const t2 = elSVG('text', { x: x + 14, y: y + h / 2 + 18, fill: '#8b949e', 'font-size': '10.5', 'font-family': 'var(--font-mono), monospace', text: lines[1] });
      g.appendChild(t2);
    } else {
      t.textContent = label;
      g.appendChild(t);
    }
    svg.appendChild(g);
    return g;
  }

  // --- 绘制层 ---
  const layers = [
    { y: 10, h: 115, color: '#58a6ff', label: '前端层 Frontend' },
    { y: 135, h: 155, color: '#a371f7', label: '网关层 Gateway (:8181)' },
    { y: 300, h: 170, color: '#3fb950', label: '业务服务层 Microservices' },
    { y: 480, h: 130, color: '#d2991d', label: '基础设施层 Infrastructure' },
  ];
  layers.forEach(l => { layerBox(l.y, l.h, l.color); layerLabel(l.y, l.label, l.color); });

  // 前端层节点
  node(60, 55, 180, 48, '用户端商城\nVue 3 · 自定义组件', '#58a6ff', '用户端：Vue 3 + Pinia + Vue Router\n纯自定义组件 + SCSS\ncreateWebHistory 路由模式');
  node(270, 55, 180, 48, '管理后台\nElement Plus · ECharts', '#58a6ff', '管理端：Element Plus + ECharts\n全局注册 UI 库 + 图标\ncreateWebHashHistory 路由模式');
  node(500, 55, 140, 48, '共享模块 common\nAPI / 组件 / 工具', '#58a6ff', 'Axios 双实例 · 设计令牌双轨制\nToken 拦截 · 响应解包\n两端共享类型定义');

  // 前端到网关连线
  [60, 270, 500].forEach(x => {
    svg.appendChild(elSVG('line', { x1: x + 70, y1: 103, x2: W / 2, y2: 135, stroke: '#8b949e', 'stroke-width': '1.2', 'stroke-dasharray': '4,3', 'marker-end': 'url(#arrowhead)' }));
  });

  // 网关节点
  node(60, 180, 430, 40, 'Spring Cloud Gateway · 路由转发 · JWT 鉴权 · 7 过滤器链', '#a371f7', '网关核心能力：\n7 过滤器: Auth→CSRF→灰度→HTTPS→限流→日志→XSS\nResilience4j 熔断 · CORS 热更新\nRedis Lua 限流 · Token 黑名单');

  // 7 过滤器标签
  const filters = ['Auth', 'CSRF', '灰度', 'HTTPS', '限流', '日志', 'XSS'];
  filters.forEach((f, i) => {
    const fx = 60 + i * 134;
    node(fx, 235, 118, 32, f, '#a371f7');
    if (i < filters.length - 1) {
      svg.appendChild(elSVG('text', { x: fx + 122, y: 255, fill: '#8b949e', 'font-size': '14', 'font-family': 'var(--font-mono), monospace', text: '→' }));
    }
  });

  // 网关到服务连线
  svg.appendChild(elSVG('line', { x1: W / 2, y1: 290, x2: W / 2, y2: 300, stroke: '#8b949e', 'stroke-width': '1.5', 'marker-end': 'url(#arrowhead)' }));

  // 业务服务节点
  const svcRow1 = [
    ['user\n用户服务 :8081', 60], ['product\n商品服务 :8082', 210], ['order\n订单服务 :8083', 360], ['cart\n购物车 :8084', 510],
  ];
  const svcRow2 = [
    ['payment\n支付服务 :8085', 60], ['marketing\n营销服务 :8086', 210], ['message\n消息服务 :8087', 360], ['admin\n管理后台 :8088', 510],
  ];

  svcRow1.forEach(([label, x]) => {
    node(x, 340, 136, 48, label, '#3fb950', `微服务: ${label.split('\n')[0]}\n端口: ${label.split(':')[1]}\nNacos 注册 · Feign 通信 · 独立部署`);
    // 向下连线
    svg.appendChild(elSVG('line', { x1: x + 68, y1: 388, x2: x + 68, y2: 415, stroke: '#3fb950', 'stroke-opacity': '0.3', 'stroke-width': '1' }));
  });
  svcRow2.forEach(([label, x]) => {
    node(x, 418, 136, 48, label, '#3fb950', `微服务: ${label.split('\n')[0]}\n端口: ${label.split(':')[1]}\nNacos 注册 · Feign 通信 · 独立部署`);
  });

  // common 模块标签
  node(680, 340, 130, 40, 'common\nFeign 契约/DTO/工具', '#3fb950', 'Feign 契约集中管理\nJWT/Redis/Snowflake 工具\n统一异常体系 · UserContext');

  // 服务间 Feign 调用示意
  svg.appendChild(elSVG('text', { x: 822, y: 400, fill: '#8b949e', 'font-size': '11', 'font-family': 'var(--font-mono), monospace', text: '↕ OpenFeign' }));

  // 服务到基础设施连线
  svg.appendChild(elSVG('line', { x1: W / 2, y1: 470, x2: W / 2, y2: 480, stroke: '#8b949e', 'stroke-width': '1.5', 'marker-end': 'url(#arrowhead)' }));

  // 基础设施节点
  const infra = [
    ['MySQL 8.0', 60, '主数据库 · ecommerce_platform\n实体 @TableLogic 逻辑删除'],
    ['Nacos 2.4', 170, '注册发现 + 配置中心\n13 个 Data ID 动态管理\n路由/限流/灰度/CORS'],
    ['Redis 7', 310, '缓存(商品/购物车)\nToken 黑名单\n分布式锁'],
    ['RocketMQ', 440, '订单状态监听\n营销消息推送\n服务异步解耦'],
    ['ES + Kibana', 570, '商品搜索\n日志分析\n可视化面板'],
    ['Docker\nCompose', 700, '14 个容器统一编排\ndev/prod 分离\n健康检查全覆盖'],
  ];
  infra.forEach(([label, x, tip]) => {
    node(x, 520, 120, 72, label, '#d2991d', tip);
  });

  container.appendChild(svg);

  // ===== Tooltip 交互 =====
  initTooltips(container);
}

// Tooltip 系统（支持鼠标悬停 + 触摸点击）
function initTooltips(container) {
  let tooltip = null;
  const nodes = $$('.arch-node[data-tooltip]', container);
  let activeTouchNode = null;

  function createTooltip() {
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.className = 'arch-tooltip';
      document.body.appendChild(tooltip);
    }
  }

  function showTooltip(e, el) {
    createTooltip();
    const text = el.getAttribute('data-tooltip');
    tooltip.innerHTML = text.replace(/\n/g, '<br>');
    tooltip.classList.add('show');
    positionTooltip(e);
  }

  function positionTooltip(e) {
    if (!tooltip) return;
    let cx, cy;
    if (e.touches && e.touches.length > 0) {
      cx = e.touches[0].clientX;
      cy = e.touches[0].clientY;
    } else {
      cx = e.clientX;
      cy = e.clientY;
    }
    let x = cx + 16;
    let y = cy - 10;
    const tw = tooltip.offsetWidth;
    const th = tooltip.offsetHeight;
    if (x + tw > window.innerWidth - 16) x = cx - tw - 16;
    if (y + th > window.innerHeight - 16) y = cy - th - 16;
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
  }

  function hideTooltip() {
    if (tooltip) tooltip.classList.remove('show');
    activeTouchNode = null;
  }

  nodes.forEach(node => {
    // 鼠标事件
    node.addEventListener('mouseenter', (e) => showTooltip(e, node));
    node.addEventListener('mousemove', positionTooltip);
    node.addEventListener('mouseleave', hideTooltip);

    // 触摸事件
    node.addEventListener('touchstart', (e) => {
      if (activeTouchNode === node) {
        hideTooltip();
        return;
      }
      hideTooltip();
      e.preventDefault();
      showTooltip(e, node);
      activeTouchNode = node;
    }, { passive: false });
  });

  // 点击空白关闭 tooltip
  document.addEventListener('touchstart', (e) => {
    if (activeTouchNode && !e.target.closest('.arch-node')) {
      hideTooltip();
    }
  }, { passive: true });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.arch-node')) hideTooltip();
  });
}

// ============================================================
// 5. RBAC 五表 ER 图（Canvas）
// ============================================================
function drawRbacDiagram() {
  const cvs = document.createElement('canvas');
  const container = $('#rbac-diagram');
  const rawW = container.clientWidth || 700;
  // 保证移动端最小可读宽度
  const W = Math.max(rawW, 680);
  const H = 320;
  const dpr = Math.min(window.devicePixelRatio || 1, 2); // 限制像素比，省内存

  cvs.width = W * dpr;
  cvs.height = H * dpr;
  cvs.style.width = W + 'px';
  cvs.style.height = H + 'px';
  if (rawW < 680) cvs.style.minWidth = '680px'; // 触发容器横滑
  const ctx = cvs.getContext('2d');
  ctx.scale(dpr, dpr);

  // 配色
  const colors = {
    entity: '#161b22',
    entityStroke: '#30363d',
    titleBg: '#a371f7',
    titleFg: '#ffffff',
    fieldFg: '#c9d1d9',
    pkFg: '#d2991d',
    fkFg: '#58a6ff',
    line: '#30363d',
    relation: '#8b949e',
  };

  // 实体定义
  const tables = [
    {
      name: 'admin_user', x: 50, y: 20, w: 175,
      fields: [
        { name: 'id', pk: true },
        { name: 'username (U)', pk: false },
        { name: 'password (BCrypt)', pk: false },
        { name: 'real_name', pk: false },
        { name: 'status', pk: false },
        { name: 'last_login_time', pk: false },
      ]
    },
    {
      name: 'admin_user_role', x: 270, y: 20, w: 175,
      fields: [
        { name: 'admin_user_id', fk: true },
        { name: 'role_id', fk: true },
      ]
    },
    {
      name: 'admin_role', x: 490, y: 20, w: 175,
      fields: [
        { name: 'id', pk: true },
        { name: 'role_name', pk: false },
        { name: 'role_code (U)', pk: false },
        { name: 'description', pk: false },
        { name: 'status', pk: false },
      ]
    },
    {
      name: 'admin_role_menu', x: 270, y: 180, w: 175,
      fields: [
        { name: 'role_id', fk: true },
        { name: 'menu_id', fk: true },
      ]
    },
    {
      name: 'admin_menu', x: 50, y: 180, w: 175,
      fields: [
        { name: 'id', pk: true },
        { name: 'parent_id', pk: false },
        { name: 'name', pk: false },
        { name: 'perms', pk: false },
        { name: 'type (M/C/F)', pk: false },
        { name: 'visible', pk: false },
      ]
    },
  ];

  function drawEntity(t) {
    const fh = 22;
    const headH = 28;
    const h = headH + t.fields.length * fh;

    // 表体
    ctx.fillStyle = colors.entity;
    ctx.strokeStyle = colors.entityStroke;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(t.x, t.y, t.w, h, 6);
    ctx.fill();
    ctx.stroke();

    // 标题栏
    ctx.fillStyle = colors.titleBg;
    ctx.beginPath();
    ctx.roundRect(t.x + 1, t.y + 1, t.w - 2, headH, [6, 6, 0, 0]);
    ctx.fill();
    ctx.fillStyle = colors.titleFg;
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(t.name, t.x + 10, t.y + 19);

    // 字段
    ctx.textAlign = 'left';
    t.fields.forEach((f, i) => {
      const fy = t.y + headH + i * fh;
      // 行分隔
      ctx.strokeStyle = colors.entityStroke;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(t.x + 1, fy);
      ctx.lineTo(t.x + t.w - 1, fy);
      ctx.stroke();

      // PK 左边色标
      let fg = colors.fieldFg;
      if (f.pk) {
        ctx.fillStyle = colors.pkFg;
        ctx.fillRect(t.x + 4, fy + 4, 3, fh - 8);
        fg = colors.pkFg;
      }
      if (f.fk) {
        ctx.fillStyle = colors.fkFg;
        ctx.fillRect(t.x + 4, fy + 4, 3, fh - 8);
        fg = colors.fkFg;
      }
      ctx.fillStyle = fg;
      ctx.font = '11px "JetBrains Mono", monospace';
      const prefix = f.pk ? 'PK ' : (f.fk ? 'FK ' : '   ');
      ctx.fillText(`${prefix}${f.name}`, t.x + 14, fy + fh - 6);
    });

    return { x: t.x, y: t.y, w: t.w, h };
  }

  tables.forEach(t => drawEntity(t));

  // 连线
  ctx.strokeStyle = colors.line;
  ctx.lineWidth = 1.8;

  // admin_user → admin_user_role (1:N)
  drawLineWithLabels(225, 65, 270, 65, '1', 'N');
  // admin_role → admin_user_role (1:N)
  drawLineWithLabels(490, 65, 465, 65, '1', 'N');
  // admin_role → admin_role_menu (1:N)
  drawLineWithLabels(560, 152, 446, 202, '1', 'N');
  // admin_menu → admin_role_menu (1:N)
  drawLineWithLabels(180, 246, 270, 224, '1', 'N');

  function drawLineWithLabels(x1, y1, x2, y2, label1, label2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // 标签
    ctx.fillStyle = colors.relation;
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2 - 6;
    ctx.fillText(label1, x1 + (x2 - x1) * 0.2, my);
    ctx.fillText(label2, x1 + (x2 - x1) * 0.8, my);
  }

  // 底部说明
  ctx.fillStyle = '#8b949e';
  ctx.font = '11px "PingFang SC", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('admin_user 1:N admin_user_role N:1 admin_role   |   admin_role 1:N admin_role_menu N:1 admin_menu', W / 2, H - 12);

  container.appendChild(cvs);
}

// ============================================================
// 6. 部署流程图（SVG）
// ============================================================
function drawDeployDiagram() {
  const container = $('#deploy-diagram');
  const W = 1100;
  const H = 340;
  const svg = elSVG('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', style: 'min-height:320px;background:#0d1117;border-radius:12px' });

  // 渐变定义
  const defs = elSVG('defs');
  ['#58a6ff', '#a371f7', '#3fb950', '#d2991d', '#f85149'].forEach((c, i) => {
    const grad = elSVG('linearGradient', { id: `dgrad${i}`, x1: '0', y1: '0', x2: '0', y2: '1' });
    grad.appendChild(elSVG('stop', { offset: '0%', 'stop-color': c, 'stop-opacity': '0.95' }));
    grad.appendChild(elSVG('stop', { offset: '100%', 'stop-color': c, 'stop-opacity': '0.7' }));
    defs.appendChild(grad);
  });
  // 箭头
  const marr = elSVG('marker', { id: 'darrow', markerWidth: '10', markerHeight: '8', refX: '9', refY: '4', orient: 'auto' });
  marr.appendChild(elSVG('path', { d: 'M0,0 L10,4 L0,8 Z', fill: '#8b949e' }));
  defs.appendChild(marr);
  svg.appendChild(defs);

  function box(x, y, w, h, text, colorIdx, sub) {
    const g = elSVG('g');
    g.appendChild(elSVG('rect', { x, y, width: w, height: h, rx: 8, fill: `url(#dgrad${colorIdx})`, 'fill-opacity': '0.15', stroke: `url(#dgrad${colorIdx})`, 'stroke-opacity': '0.5', 'stroke-width': '1.5' }));
    const textY = sub ? y + h / 2 - 4 : y + h / 2 + 5;
    g.appendChild(elSVG('text', { x: x + w / 2, y: textY, fill: '#e6edf3', 'font-size': '13', 'font-weight': '700', 'font-family': 'var(--font-body), sans-serif', 'text-anchor': 'middle', text }));
    if (sub) {
      g.appendChild(elSVG('text', { x: x + w / 2, y: y + h / 2 + 18, fill: '#8b949e', 'font-size': '10.5', 'font-family': 'var(--font-mono), monospace', 'text-anchor': 'middle', text: sub }));
    }
    svg.appendChild(g);
    return g;
  }

  function arrow(x1, y1, x2, y2) {
    svg.appendChild(elSVG('line', { x1, y1, x2, y2, stroke: '#8b949e', 'stroke-width': '2', 'marker-end': 'url(#darrow)' }));
  }
  function label(x, y, text) {
    svg.appendChild(elSVG('text', { x, y, fill: '#8b949e', 'font-size': '10.5', 'font-family': 'var(--font-mono), monospace', 'text-anchor': 'middle', text }));
  }

  // ===== 上半部分: 开发部署流水线 =====
  // 第 1 行：源
  box(40, 30, 180, 56, 'Git 仓库', 0, '子模块独立演进');
  box(260, 30, 180, 56, 'GitHub Actions', 1, '每日自动同步');
  box(480, 30, 180, 56, 'Docker 构建', 2, '多阶段 Maven+JRE');
  box(700, 30, 180, 56, 'Compose 编排', 3, '14 容器统一管理');
  box(920, 30, 140, 56, '服务上线', 4, '健康检查就绪');

  [220, 440, 660, 880].forEach(x => arrow(x, 58, x + 40, 58));

  // 第 2 行：关键步骤
  const steps = [
    ['子模块检出', 40, 'git submodule\nupdate --init'],
    ['智能检测变更', 190, 'commit hash\n增量识别'],
    ['分批并行构建', 370, '每批 2 个\nspinner UI'],
    ['密钥自动生成', 550, 'openssl rand\n8 个随机密钥'],
    ['Nacos 配置导入', 700, '13 Data ID\n批量发布'],
    ['一键部署', 870, 'docker-prod.sh\n全流程自动化'],
  ];
  steps.forEach(([title, x, sub]) => {
    box(x, 120, 150, 60, title, 2, sub);
  });

  // 垂直连线
  [115, 265, 445, 625, 775, 945].forEach(x => {
    svg.appendChild(elSVG('line', { x1: x, y1: 86, x2: x, y2: 120, stroke: '#8b949e', 'stroke-width': '1.2', 'stroke-dasharray': '4,3' }));
  });

  // ===== 下半部分: dev / prod 双线 =====
  label(540, 210, '━━━ 开发环境 (dev) ━━━━━━━━━━━━━━━━━━━━━━━━ 生产环境 (prod) ━━━');

  box(100, 225, 280, 50, 'docker-dev.sh', 3, 'HMR 热更新 · 源码挂载');
  box(540, 225, 320, 50, 'docker-prod.sh', 4, 'Nginx 托管 · 端口隔离 · 资源限制');
  box(440, 290, 240, 40, '健康检查全覆盖 → 就绪', 2);


  arrow(380, 250, 540, 250);
  svg.appendChild(elSVG('line', { x1: 550, y1: 275, x2: 550, y2: 290, stroke: '#8b949e', 'stroke-width': '1.5', 'marker-end': 'url(#darrow)' }));

  container.appendChild(svg);
}

// ============================================================
// 7. CI/CD 发布流程图（SVG）
// ============================================================
function drawCicdDiagram() {
  const container = $('#cicd-diagram');
  const W = 1100;
  const H = 340;
  const svg = elSVG('svg', { viewBox: `0 0 ${W} ${H}`, width: '100%', style: 'min-height:320px;background:#0d1117;border-radius:12px' });

  const defs = elSVG('defs');
  const marr = elSVG('marker', { id: 'carrow', markerWidth: '10', markerHeight: '8', refX: '8', refY: '4', orient: 'auto' });
  marr.appendChild(elSVG('path', { d: 'M0,0 L10,4 L0,8 Z', fill: '#8b949e' }));
  defs.appendChild(marr);
  svg.appendChild(defs);

  function node(x, y, w, h, title, desc, color) {
    const g = elSVG('g');
    g.appendChild(elSVG('rect', { x, y, width: w, height: h, rx: 10, fill: color, 'fill-opacity': '0.12', stroke: color, 'stroke-opacity': '0.5', 'stroke-width': '1.5' }));
    g.appendChild(elSVG('rect', { x, y, width: 3, height: h, rx: 3, fill: color }));
    g.appendChild(elSVG('text', { x: x + 14, y: y + 26, fill: '#e6edf3', 'font-size': '13', 'font-weight': '700', 'font-family': 'var(--font-body), sans-serif', text: title }));
    g.appendChild(elSVG('text', { x: x + 14, y: y + h - 10, fill: '#8b949e', 'font-size': '10', 'font-family': 'var(--font-mono), monospace', text: desc }));
    svg.appendChild(g);
  }

  function flowArrow(x1, y1, x2, y2) {
    svg.appendChild(elSVG('line', { x1, y1, x2, y2, stroke: '#8b949e', 'stroke-width': '2', 'marker-end': 'url(#carrow)' }));
  }
  function sectionTitle(x, y, text, color) {
    svg.appendChild(elSVG('text', { x, y, fill: color, 'font-size': '12', 'font-weight': '700', 'font-family': 'var(--font-body), sans-serif', text }));
  }

  // ===== 三行流程 =====

  // 第 1 行：日常开发
  sectionTitle(30, 30, '日常开发流程', '#58a6ff');
  node(30, 42, 170, 56, '子模块独立开发', 'git checkout -b feat/x', '#58a6ff');
  flowArrow(200, 70, 240, 70);
  node(240, 42, 160, 56, '子模块提交推送', 'git commit && push', '#58a6ff');
  flowArrow(400, 70, 440, 70);
  node(440, 42, 150, 56, 'PR 审查合并', 'Code Review', '#58a6ff');
  flowArrow(590, 70, 630, 70);
  node(630, 42, 170, 56, '根仓库更新指针', 'git add submodule', '#58a6ff');
  flowArrow(800, 70, 840, 70);
  node(840, 42, 170, 56, 'GitHub Actions', '每日自动同步', '#a371f7');

  // 第 2 行：一键部署
  sectionTitle(30, 130, '一键部署流程', '#3fb950');
  node(30, 142, 200, 56, 'git clone --recurse', '克隆 + 子模块初始化', '#3fb950');
  flowArrow(230, 170, 270, 170);
  node(270, 142, 210, 56, 'docker-prod.sh', '检测 CHANGE_ME → 生成密钥', '#3fb950');
  flowArrow(480, 170, 520, 170);
  node(520, 142, 190, 56, 'Docker 多阶段构建', 'Maven → JRE → 镜像', '#3fb950');
  flowArrow(710, 170, 750, 170);
  node(750, 142, 170, 56, 'Compose up -d', '14 容器启动', '#3fb950');
  flowArrow(920, 170, 960, 170);
  node(960, 142, 110, 56, '✅ 上线', '', '#3fb950');

  // 第 3 行：增量更新
  sectionTitle(30, 230, '增量更新流程', '#d2991d');
  node(30, 242, 200, 56, '代码修改推送', '子模块 push 新 commit', '#d2991d');
  flowArrow(230, 270, 270, 270);
  node(270, 242, 220, 56, '检测子模块变更', 'commit hash 智能比对', '#d2991d');
  flowArrow(490, 270, 530, 270);
  node(530, 242, 200, 56, '增量构建镜像', '仅重建变更服务', '#d2991d');
  flowArrow(730, 270, 770, 270);
  node(770, 242, 210, 56, '滚动重启容器', '--force-recreate', '#d2991d');
  flowArrow(980, 270, 1020, 270);
  node(1020, 242, 50, 56, '✅', '', '#d2991d');

  // 底部关键标注
  svg.appendChild(elSVG('text', { x: 540, y: H - 10, fill: '#8b949e', 'font-size': '10', 'font-family': 'var(--font-mono), monospace', 'text-anchor': 'middle', text: 'common 模块变更 → 全量重建    |    单个服务变更 → 仅重建该服务    |    无变更 → 跳过构建' }));

  container.appendChild(svg);
}

// ============================================================
// 8. 启动
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  initScrollReveal();
  initCounters();
  initNavbar();
  drawArchDiagram();
  drawRbacDiagram();
  drawDeployDiagram();
  drawCicdDiagram();
});
