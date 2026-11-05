(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!window.gsap || !window.ScrollTrigger) { document.documentElement.classList.remove('js'); return; }
  gsap.registerPlugin(ScrollTrigger);

  // なめらかなスクロール
  if (!reduced && window.Lenis) {
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -64, duration: 1.2 });
      });
    });
  }

  // ヘッダーとスマホの帯
  const header = document.querySelector('.header');
  ScrollTrigger.create({ trigger: '.hero', start: 'bottom 80px', onEnter: () => header.classList.add('is-solid'), onLeaveBack: () => header.classList.remove('is-solid') });
  const bar = document.querySelector('.spBar');
  ScrollTrigger.create({ trigger: '.hero', start: 'bottom 70%', endTrigger: '.entry', end: 'top bottom', onToggle: (s) => bar.classList.toggle('is-on', s.isActive) });

  if (reduced) return;

  // ---------- 開くとき：写真がカプセルの形からふくらみ、文字が下から ----------
  const open = gsap.timeline({ defaults: { ease: 'power3.out' } });
  open
    .fromTo('.hero_photo', { clipPath: 'inset(30% 30% 30% 30% round 999px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', clearProps: 'clipPath', duration: 1.5, ease: 'power4.inOut' }, 0)
    .fromTo('.hero_photo img', { scale: 1.2 }, { scale: 1, duration: 2.2 }, 0)
    .fromTo('.hero_tag', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8 }, 0.5)
    .fromTo('.hero_line', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, stagger: 0.14 }, 0.65)
    .fromTo('.hero_lead, .hero_btns', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1 }, 1.05)
    .to('.header', { opacity: 1, duration: 0.8, ease: 'sine.out' }, 1.1)
    .fromTo('.cap', { opacity: 0, scale: 0.6 }, { opacity: (i, el) => el.classList.contains('cap--b') ? 0.8 : 1, scale: 1, duration: 0.9, stagger: 0.1, ease: 'back.out(1.6)' }, 1.2);

  // 浮かぶカプセル：ゆっくり上下にただよう
  gsap.utils.toArray('.cap').forEach((c, i) => {
    gsap.to(c, { y: i % 2 ? 14 : -14, rotation: `+=${i % 2 ? 6 : -6}`, duration: 3.2 + i * 0.6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 2 });
  });

  // ---------- 出てくる動き ----------
  const up = (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1, overwrite: true });
  document.querySelectorAll('[data-each]').forEach((g) => {
    const kids = g.querySelectorAll(':scope > [data-up]');
    ScrollTrigger.create({ trigger: g, start: 'top 85%', once: true, onEnter: () => up(kids) });
  });
  document.querySelectorAll('[data-up]').forEach((el) => {
    if (el.parentElement.hasAttribute('data-each')) return;
    ScrollTrigger.create({ trigger: el, start: 'top 88%', once: true, onEnter: () => up(el) });
  });

  // 数字：見えたら0から数える（何の数字かが目に残るように）
  document.querySelectorAll('[data-count]').forEach((el) => {
    const end = Number(el.dataset.count);
    const o = { v: 0 };
    el.textContent = '0';
    ScrollTrigger.create({
      trigger: el, start: 'top 85%', once: true,
      onEnter: () => gsap.to(o, { v: end, duration: 1.4, ease: 'power2.out', onUpdate: () => { el.textContent = Math.round(o.v); } }),
    });
  });

  // 写真：下から幕が上がるように出る
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    const st = { trigger: el, start: 'top 82%', once: true };
    gsap.fromTo(el, { clipPath: 'inset(100% 0 0 0 round 40px)' }, { clipPath: 'inset(0% 0 0 0 round 40px)', duration: 1.3, ease: 'power4.inOut', scrollTrigger: st });
    gsap.fromTo(el.querySelector('img'), { scale: 1.15 }, { scale: 1, duration: 2, ease: 'power3.out', scrollTrigger: st });
  });

  // 先輩の写真：小さなカプセルから大きくなる
  gsap.utils.toArray('[data-capsule]').forEach((el) => {
    gsap.fromTo(el, { scale: 0.82, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2, ease: 'back.out(1.3)', scrollTrigger: { trigger: el, start: 'top 82%', once: true } });
  });

  // 1日の流れ：スクロールに合わせて時間の線が伸びる
  const line = document.querySelector('.day_line span');
  gsap.fromTo(line, { '--p': 0 }, { '--p': 1, ease: 'none', scrollTrigger: { trigger: '.day_list', start: 'top 70%', end: 'bottom 60%', scrub: 0.4 } });

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
