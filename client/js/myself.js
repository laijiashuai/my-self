/* ============================================
   个人简历 JS — 导航栏 + 滚动动画 + 证书弹窗
   ============================================ */
(function () {
  'use strict';

  // ========== 工具 ==========
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return [].slice.call((ctx || document).querySelectorAll(sel)); };

  // ========== 1. 导航栏滚动行为 ==========
  function initNavbar() {
    var nav = $('#navbar');
    if (!nav) return;
    var lastY = 0, ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          var y = window.scrollY;
          if (y > 100 && y > lastY + 5) nav.classList.add('nav-hidden');
          else if (y < lastY - 5 || y < 60) nav.classList.remove('nav-hidden');
          lastY = y; ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    // 锚点平滑滚动
    $$('.nav-links a').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var target = $(link.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
        var nl = $('.nav-links');
        var tg = $('.nav-toggle');
        if (nl) nl.classList.remove('open');
        if (tg) tg.classList.remove('active');
      });
    });
    // 汉堡菜单
    var toggle = $('.nav-toggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        var nl = $('.nav-links');
        toggle.classList.toggle('active');
        if (nl) nl.classList.toggle('open');
      });
    }
  }

  // ========== 2. 渐入动画 ==========
  function initScrollReveal() {
    var targets = $$('.section, .info-item, .timeline-item, .exp-card, .cert-card, .skill-card, .narrative-card');
    targets.forEach(function (el) { el.classList.add('fade-up'); });
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('visible'); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
    targets.forEach(function (el) { obs.observe(el); });
  }

  // ========== 3. 证书弹窗 Lightbox ==========
  function initLightbox() {
    var lightbox = $('#lightbox');
    var lightboxImg = $('#lightbox-img');
    var lightboxClose = $('.lightbox-close');

    if (!lightbox || !lightboxImg) return;

    // 点击证书卡片
    $$('.cert-card[data-img]').forEach(function (card) {
      card.addEventListener('click', function () {
        var src = card.getAttribute('data-img');
        if (src) {
          lightboxImg.src = src;
          lightbox.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      });
    });

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  // ========== 入口 ==========
  document.addEventListener('DOMContentLoaded', function () {
    initNavbar();
    initScrollReveal();
    initLightbox();
  });
})();
