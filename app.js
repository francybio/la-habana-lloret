/* ==========================================================
   LA HABANA — interacciones
   Persianas de entrada, fachada con siete ventanas y puertas
   que se abren (cada una enseña un rincón de la casa), pizarra
   escrita con tiza, azulejos de platos en bucle, noche cubana
   y apartamentos.
   ========================================================== */
(() => {
'use strict';

const $  = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const STATIC = /[?&]static\b/.test(location.search);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches || STATIC;
const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
const motion = hasGSAP && !reduced;
if (hasGSAP) gsap.registerPlugin(ScrollTrigger);
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
const IMG = (f) => 'assets/img/' + f;
const play = (v) => { if (!v) return; if (v.preload === 'none') v.preload = 'auto'; const p = v.play(); if (p) p.catch(() => {}); };

/* ----------------------------------------------------------
   DATOS
   ---------------------------------------------------------- */
const OPENINGS = [
  { kind: 'win', x: 165, y: 78, w: 180, h: 164, tag: 'Habitaciones', img: 'hab-1.jpg', t: 'Las habitaciones', d: 'Apartamentos de distintos tamaños justo encima del restaurante, con papel de hojas tropicales y colchas de coral. Se admiten mascotas.' },
  { kind: 'win', x: 530, y: 70, w: 140, h: 210, slat: 7, tag: 'La barra', img: 'gm-17.jpg', t: 'La barra', d: 'Retratos de Cuba, botellas en fila y el cartel de los 500 años de La Habana. Aquí empiezan los mojitos y la sangría.' },
  { kind: 'win', x: 855, y: 78, w: 180, h: 164, tag: 'De noche', video: 'ambiente.mp4', poster: 'v-ambiente.jpg', t: 'Desde el balcón', d: 'Mesas largas en la calle, brindis y buena música cuando cae la noche en el casco antiguo.' },
  { kind: 'door', x: 130, y: 470, w: 140, h: 290, tag: 'El comedor', img: 'comedor.jpg', t: 'El comedor del piano', d: 'Paredes amarillas, techo lila, un piano y lámparas de mimbre. Mesas redondas con mantel para comer sin prisa.' },
  { kind: 'door', x: 590, y: 460, w: 200, h: 300, tag: 'La cocina', img: 'paella.jpg', t: 'La paella de la casa', d: 'Paella casera para compartir, con sangría o con vino. Tanto gusta que hasta la sorteamos en Instagram.' },
  { kind: 'port', x: 812, y: 522, w: 76, h: 76, tag: 'Desayunos', img: 'tapeo-cafe.jpg', t: 'Café, zumos y desayunos', d: 'De 9 a 12 h: zumos naturales recién exprimidos, bocadillos y café. Y si aprieta el calor, café con helado.' },
  { kind: 'door', x: 920, y: 470, w: 140, h: 290, tag: 'La terraza', img: 'terraza-perro.jpg', t: 'La terraza', d: 'Terraza delante y detrás de la casa, con sillas de mimbre, cojines y algún perro tumbado a la sombra. Pet friendly.' }
];
const BOARD = [['Lasaña', '10,00'], ['Pizzas', 'desde 13,00'], ['Omelettes', '6,00'], ['Sardinas', '6,50'], ['Escalibadas', '11,50'], ['Ensaladas', '10,00'], ['Calamares', '7,50'], ['Mejillones', '6,50'], ['Pescadito frito', '8,00'], ['Espaguetti', '11,00'], ['Pincho', '11,00'], ['¼ pollo a l’ast', '10,00']];
const TILES = [
  ['paella.jpg', 'Paella casera', 'para compartir'],
  ['mixto.jpg', 'Mixto de 7 tapas', 'un poco de todo'],
  ['burrata.jpg', 'Tomate, atún y burrata', 'tomate de la huerta'],
  ['gm-00.jpg', 'Tapas variadas', 'mejillones, croquetas, ibérico'],
  ['gm-29.jpg', 'Sardinas', 'a la plancha'],
  ['gm-08.jpg', 'Pizzas', 'de la casa'],
  ['gm-28.jpg', 'Pescadito frito', 'con limón'],
  ['cheesecake.jpg', 'Cheesecake', '¿team tarta de queso?'],
  ['gm-32.jpg', 'Patatas bravas', 'con el vermut'],
  ['gm-03.jpg', 'Paella', 'vista por un cliente'],
  ['carrot.jpg', 'Carrot cake', '¿o team zanahoria?'],
  ['gm-31.jpg', 'Ensaladas', 'para el calor'],
  ['gm-30.jpg', 'Postre casero', 'con nata']
];

/* ----------------------------------------------------------
   HORARIO · todos los días 9–23
   ---------------------------------------------------------- */
const madridMin = () => {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()).map((x) => [x.type, x.value]));
  return +p.hour * 60 + +p.minute;
};
const paintLive = () => {
  const m = madridMin(), open = m >= 540 && m < 1380;
  const txt = open ? (m < 720 ? 'Abierto · sirviendo desayunos' : 'Abierto ahora · hasta las 23:00') : (m < 540 ? 'Cerrado · abrimos a las 9:00' : 'Cerrado · mañana a las 9:00');
  $$('[data-live]').forEach((el) => { el.classList.toggle('is-open', open); el.classList.toggle('is-closed', !open); $('[data-live-text]', el).textContent = txt; });
};
paintLive(); setInterval(paintLive, 30000);

/* ----------------------------------------------------------
   SCROLL · NAV · MENÚ
   ---------------------------------------------------------- */
let lenis = null;
if (motion && typeof window.Lenis !== 'undefined') {
  lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
const nav = $('#nav'), burger = $('#burger'), drawer = $('#drawer');
let lastY = 0;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  nav.classList.toggle('is-scrolled', y > 30);
  nav.classList.toggle('is-hidden', y > 600 && y > lastY && !drawer.classList.contains('is-open'));
  lastY = y;
}, { passive: true });
const setDrawer = (open) => { burger.setAttribute('aria-expanded', open); drawer.classList.toggle('is-open', open); document.body.style.overflow = open ? 'hidden' : ''; if (lenis) open ? lenis.stop() : lenis.start(); };
burger.addEventListener('click', () => setDrawer(burger.getAttribute('aria-expanded') !== 'true'));
$$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
  const id = a.getAttribute('href'); if (id.length < 2) return;
  const t = $(id); if (!t) return;
  e.preventDefault(); setDrawer(false);
  if (lenis) lenis.scrollTo(t, { offset: -70 }); else t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
}));

/* ----------------------------------------------------------
   ENTRADA · las persianas se abren
   ---------------------------------------------------------- */
const blinds = $('#blinds');
if (reduced) blinds.remove();
else {
  setTimeout(() => blinds.classList.add('is-open'), 700);
  setTimeout(() => blinds.remove(), 2200);
  if (motion) {
    gsap.from('.hero__title', { y: 40, opacity: 0, duration: 1.1, ease: 'power3.out', delay: 1 });
    gsap.from('.hero__kicker, .hero__lead', { y: 20, opacity: 0, duration: .9, ease: 'power3.out', delay: 1.15, stagger: .1 });
    gsap.from('.op', { scale: .92, opacity: 0, duration: .7, ease: 'back.out(1.6)', stagger: .07, delay: 1.3 });
  }
}

/* ----------------------------------------------------------
   LA FACHADA · ventanas y puertas que se abren
   ---------------------------------------------------------- */
(() => {
  const box = $('#openings');
  const lb = $('#lb'), lbMedia = $('#lbMedia'), lbCap = $('#lbCap');
  let current = -1;
  box.innerHTML = OPENINGS.map((o, i) => {
    const media = o.video
      ? `<video muted loop playsinline preload="none" poster="${IMG(o.poster)}" aria-hidden="true"><source src="assets/video/${o.video}" type="video/mp4"></video>`
      : `<img src="${IMG(o.img)}" alt="" loading="lazy" draggable="false">`;
    const leaves = '<span class="leaf leaf--l"></span><span class="leaf leaf--r"></span>';
    const rad = o.kind === 'door' ? '' : '';
    return `<button class="op op--${o.kind}" type="button" data-i="${i}" style="--x:${o.x};--y:${o.y};--w:${o.w};--h:${o.h}${o.slat ? `;--slat:${o.slat}px` : ''}${rad}" aria-pressed="false" aria-label="Abrir: ${o.t}">
      <span class="op__in">${media}</span>${leaves}<span class="op__tag">${o.tag}</span></button>`;
  }).join('');
  const ops = $$('.op', box);
  const roomNo = $('#roomNo'), roomT = $('#roomT'), roomD = $('#roomD'), zoom = $('#zoomRoom'), all = $('#openAll');
  const paint = (i) => {
    const o = OPENINGS[i];
    const seen = ops.filter((b) => b.classList.contains('is-seen')).length;
    roomNo.textContent = `${o.tag} · ${seen}/${OPENINGS.length} abiertas`;
    roomT.textContent = o.t; roomD.textContent = o.d;
    zoom.disabled = false;
    if (motion) gsap.fromTo([roomT, roomD], { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .45, stagger: .06 });
  };
  const setOpen = (i, open) => {
    const b = ops[i]; if (!b) return;
    b.classList.toggle('is-open', open); b.setAttribute('aria-pressed', open);
    const v = $('video', b);
    if (v) open ? play(v) : v.pause();
    if (open) b.classList.add('is-seen');
  };
  box.addEventListener('click', (e) => {
    const b = e.target.closest('.op'); if (!b) return;
    const i = +b.dataset.i;
    const open = !b.classList.contains('is-open');
    setOpen(i, open);
    if (open) { current = i; paint(i); }
  });
  all.addEventListener('click', () => {
    const anyClosed = ops.some((b) => !b.classList.contains('is-open'));
    ops.forEach((b, i) => setTimeout(() => setOpen(i, anyClosed), reduced ? 0 : i * 110));
    all.querySelector('span').textContent = anyClosed ? 'Cerrar todas' : 'Abrir todas';
    if (anyClosed) { current = current < 0 ? 4 : current; setTimeout(() => paint(current), reduced ? 0 : 700); }
  });
  // visor
  const openLB = (src, isVideo, title, sub) => {
    lbMedia.innerHTML = isVideo ? `<video src="${src}" controls autoplay playsinline loop></video>` : `<img src="${src}" alt="${title}">`;
    lbCap.innerHTML = `${title}${sub ? `<small>${sub}</small>` : ''}`;
    lb.hidden = false; if (lenis) lenis.stop();
    $('.lb__close', lb).focus();
  };
  const closeLB = () => { lb.hidden = true; lbMedia.innerHTML = ''; if (lenis) lenis.start(); };
  zoom.addEventListener('click', () => { if (current < 0) return; const o = OPENINGS[current]; o.video ? openLB('assets/video/' + o.video, true, o.t, o.d) : openLB(IMG(o.img), false, o.t, o.d); });
  lb.addEventListener('click', (e) => { if (e.target === lb || e.target.closest('.lb__close')) closeLB(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !lb.hidden) closeLB(); });
  window.__habanaLB = openLB;
  if (STATIC) { [0, 3, 4, 6].forEach((i) => setOpen(i, true)); current = 4; paint(4); }
})();

/* ----------------------------------------------------------
   LA PIZARRA · se escribe con tiza al entrar en pantalla
   ---------------------------------------------------------- */
(() => {
  const list = $('#boardList');
  list.innerHTML = BOARD.map(([n, p]) => `<li><span>${n}</span><i></i><b>${p}</b></li>`).join('');
  const lines = $$('.board__h, .board__line, .board__list li', $('#board'));
  if (reduced) return;
  lines.forEach((l) => { l.style.clipPath = 'inset(0 100% 0 0)'; });
  const io = new IntersectionObserver(([en]) => {
    if (!en.isIntersecting) return;
    io.disconnect();
    lines.forEach((l, i) => setTimeout(() => { l.style.clipPath = ''; l.classList.add('is-wr'); }, i * 160));
  }, { threshold: .35 });
  io.observe($('#board'));
})();

/* ----------------------------------------------------------
   AZULEJOS · bucle infinito que se puede arrastrar
   ---------------------------------------------------------- */
(() => {
  const wrap = $('#tiles'), track = $('#tilesTrack');
  const html = TILES.map(([f, t, s], i) => `<figure class="tile" data-i="${i}"><div class="tile__pic"><img src="${IMG(f)}" alt="${t}" loading="lazy" draggable="false"><figcaption class="tile__cap">${t}<small>${s}</small></figcaption></div></figure>`).join('');
  track.innerHTML = html + html;
  let x = 0, half = 0, drag = false, sx = 0, sxx = 0, moved = 0, hover = false, vis = false, raf = 0, last = performance.now();
  const measure = () => { half = track.scrollWidth / 2; };
  const tick = (now) => {
    raf = 0;
    const dt = Math.min(50, now - last); last = now;
    if (!drag && !hover && !reduced) x -= dt * .045;
    if (half) { while (x <= -half) x += half; while (x > 0) x -= half; }
    track.style.transform = `translate3d(${x}px,0,0)`;
    if (vis) raf = requestAnimationFrame(tick);
  };
  const go = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } };
  wrap.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') hover = true; });
  wrap.addEventListener('pointerleave', () => { hover = false; });
  wrap.addEventListener('pointerdown', (e) => { drag = true; moved = 0; sx = e.clientX; sxx = x; wrap.classList.add('is-drag'); });
  window.addEventListener('pointermove', (e) => { if (!drag) return; const dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx)); x = sxx + dx; if (reduced) tick(performance.now()); });
  window.addEventListener('pointerup', () => { drag = false; wrap.classList.remove('is-drag'); });
  track.addEventListener('click', (e) => {
    const f = e.target.closest('.tile'); if (!f || moved > 6) return;
    const [img, t, s] = TILES[+f.dataset.i];
    window.__habanaLB(IMG(img), false, t, s);
  });
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  measure();
  new IntersectionObserver(([en]) => { vis = en.isIntersecting; if (vis) { measure(); go(); } }).observe(wrap);
  tick(performance.now());
})();

/* ----------------------------------------------------------
   NOCHE CUBANA · vídeos
   ---------------------------------------------------------- */
(() => {
  const vids = [$('#vAmb'), $('#vFie')];
  const io = new IntersectionObserver((ens) => ens.forEach((en) => { if (en.isIntersecting) { if (!reduced) play(en.target); } else en.target.pause(); }), { threshold: .3 });
  vids.forEach((v) => io.observe(v));
  const b = $('#nocheSnd');
  b.addEventListener('click', () => {
    const on = vids[0].muted;
    vids.forEach((v) => { v.muted = true; });
    if (on) { vids[0].muted = false; play(vids[0]); }
    b.querySelector('i').className = on ? 'ph-bold ph-speaker-simple-high' : 'ph-bold ph-speaker-simple-slash';
    b.querySelector('span').textContent = on ? 'Silenciar' : 'Con sonido';
  });
})();

/* ----------------------------------------------------------
   APARTAMENTOS · fotos que se suceden
   ---------------------------------------------------------- */
(() => {
  const imgs = $$('#apartPics img'), dots = $('#apartDots');
  dots.innerHTML = imgs.map((_, i) => `<button type="button" aria-label="Foto ${i + 1}"${i ? '' : ' class="is-on"'}></button>`).join('');
  let i = 0, t;
  const show = (n) => { i = (n + imgs.length) % imgs.length; imgs.forEach((im, j) => im.classList.toggle('is-on', j === i)); $$('button', dots).forEach((d, j) => d.classList.toggle('is-on', j === i)); };
  const auto = () => { clearInterval(t); if (!reduced) t = setInterval(() => show(i + 1), 3800); };
  dots.addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) { show($$('button', dots).indexOf(b)); auto(); } });
  auto();
})();

/* ----------------------------------------------------------
   APARICIONES
   ---------------------------------------------------------- */
if (motion) {
  $$('.sec-head, .pizarra__copy, .board, .noche__copy, .apart__copy, .apart__pics, .visita__copy, .visita__pic').forEach((el) => {
    gsap.from(el, { y: 50, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 86%' } });
  });
  gsap.from('.stat', { y: 30, opacity: 0, duration: .8, stagger: .08, ease: 'power3.out', scrollTrigger: { trigger: '.stats', start: 'top 90%' } });
  gsap.from('.reel', { y: 80, opacity: 0, duration: 1.1, stagger: .15, ease: 'power3.out', scrollTrigger: { trigger: '.noche__grid', start: 'top 80%' } });
  gsap.from('.pc', { y: 60, opacity: 0, rotation: 0, duration: 1, stagger: .1, ease: 'power3.out', scrollTrigger: { trigger: '#postcards', start: 'top 85%' } });
  window.addEventListener('load', () => ScrollTrigger.refresh());
}
})();
