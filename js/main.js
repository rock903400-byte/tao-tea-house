/* ============================================================
   陶茶雅舍 - 互動功能
   ============================================================ */

(function () {
  'use strict';

  /* ---------- 1. Navbar 滾動樣式 ---------- */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    const onScroll = () => {
      if (window.scrollY > 40) navbar.classList.add('scrolled');
      else navbar.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- 2. 手機漢堡選單 ---------- */
  const toggle = document.querySelector('.navbar__toggle');
  const menu = document.querySelector('.navbar__menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => menu.classList.toggle('active'));
    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => menu.classList.remove('active'));
    });
  }

  /* ---------- 3. 元素進場動畫 ---------- */
  const fadeTargets = document.querySelectorAll('.fade-in');
  if ('IntersectionObserver' in window && fadeTargets.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    fadeTargets.forEach(el => io.observe(el));
  } else {
    fadeTargets.forEach(el => el.classList.add('visible'));
  }

  /* ---------- 4. Lightbox 作品放大 ---------- */
  const galleryItems = document.querySelectorAll('.gallery__item');
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = document.querySelector('.lightbox img');

  if (galleryItems.length && lightbox && lightboxImg) {
    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        if (!img) return;
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || '';
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });
    const closeLightbox = () => {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    };
    lightbox.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  /* ---------- 5. Smooth scroll ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const id = this.getAttribute('href');
      if (id === '#' || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ---------- 6. 報名進度條 ---------- */
  const progressBars = document.querySelectorAll('[data-progress]');
  progressBars.forEach(bar => {
    const enrolled = parseInt(bar.dataset.enrolled || '0', 10);
    const total = parseInt(bar.dataset.total || '6', 10);
    const pct = Math.min(100, (enrolled / total) * 100);
    const fill = bar.querySelector('.progress-bar__fill');
    const text = bar.querySelector('.progress-bar__text');
    const remain = Math.max(0, total - enrolled);

    /* 延遲動畫，進場時才跑 */
    if ('IntersectionObserver' in window) {
      const pio = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && fill) {
            fill.style.width = pct + '%';
            pio.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      pio.observe(bar);
    } else if (fill) {
      fill.style.width = pct + '%';
    }

    /* 動態訊息 */
    if (text) {
      if (remain === 0) {
        text.innerHTML = '🔥 已額滿，歡迎來電預約候補';
        text.style.color = '#C04545';
      } else if (remain <= 2) {
        text.innerHTML = '⚠️ 僅剩 ' + remain + ' 名，請盡快報名';
        text.style.color = '#C04545';
      } else {
        text.innerHTML = '✦ 還有 ' + remain + ' 個名額';
      }
    }
  });

  /* ---------- 7. Timeline 折疊 ---------- */
  const timelineToggles = document.querySelectorAll('.timeline-toggle');
  timelineToggles.forEach(btn => {
    const targetSelector = btn.dataset.toggle;
    const target = targetSelector ? document.getElementById(targetSelector) : null;
    if (!target) return;
    const extras = target.querySelectorAll('.timeline__item--extra');
    const total = target.querySelectorAll('.timeline__item').length;
    btn.addEventListener('click', () => {
      const isExpanded = target.classList.toggle('expanded');
      btn.textContent = isExpanded
        ? '收合 ↑'
        : '展開全部 ' + total + ' 筆經歷 ↓';
    });
  });

})();
