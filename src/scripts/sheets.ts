const STAGE = matchMedia('(min-width: 901px) and (min-height: 700px)');
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const E = 'cubic-bezier(.6,0,.2,1)';
const OUT_E = 'cubic-bezier(.5,0,.75,0)';

const scenes = [...document.querySelectorAll<HTMLElement>('.stage > .scene')];
const root = document.documentElement;
let cur = -1;
let hideTimer: number | undefined;

type Geo = SVGGeometryElement;
const geo = (svg: SVGSVGElement): Geo[] =>
  [...svg.querySelectorAll<Geo>('path,rect,circle,polygon,line')].filter((n) => !n.closest('defs') && !n.closest('.pk'));
const stroked = (n: Element) => { const s = getComputedStyle(n); return (s.stroke !== 'none' && s.fill === 'none') || !!n.closest('.slab'); };
const dashed = (n: Element) => getComputedStyle(n).strokeDasharray !== 'none';
const keyX = (n: Geo) => { try { const b = n.getBBox(); return b.x + b.y * 0.25; } catch { return 0; } };
const halt = (sc: Element) => sc.getAnimations({ subtree: true }).forEach((a) => { if (!(a instanceof CSSTransition)) a.cancel(); });
const anim = (el: Element, k: Keyframe[], o: KeyframeAnimationOptions) => el.animate(k, o);

function drawIn(svg: SVGSVGElement, delay: number) {
  const nodes = geo(svg).sort((a, b) => keyX(a) - keyX(b));
  nodes.forEach((n, i) => {
    const d = delay + i * 18;
    if (stroked(n) && !dashed(n)) {
      const L = Math.ceil(n.getTotalLength());
      anim(n, [{ strokeDasharray: `${L} ${L}`, strokeDashoffset: L }, { strokeDasharray: `${L} ${L}`, strokeDashoffset: 0 }], { duration: 900, delay: d, easing: E, fill: 'backwards' });
    } else anim(n, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: d, easing: E, fill: 'backwards' });
  });
  svg.querySelectorAll('text').forEach((t, i) => anim(t, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 500, delay: delay + 300 + i * 22, easing: E, fill: 'backwards' }));
  svg.querySelectorAll('.pk').forEach((p) => anim(p, [{ opacity: 0 }, { opacity: 1 }], { duration: 400, delay: delay + nodes.length * 18 + 400, fill: 'backwards' }));
}

function textIn(sc: HTMLElement, delay: number) {
  sc.querySelectorAll('[data-h]').forEach((h) => anim(h, [{ clipPath: 'inset(0 0 100% 0)', transform: 'translateY(40%)' }, { clipPath: 'inset(0 0 -10% 0)', transform: 'none' }], { duration: 900, delay: delay + 80, easing: E, fill: 'backwards' }));
  sc.querySelectorAll('[data-a]').forEach((a, i) => anim(a, [{ opacity: 0, transform: 'translateY(22px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: delay + (i === 0 ? 0 : 260 + i * 90), easing: E, fill: 'backwards' }));
  sc.querySelectorAll('.big').forEach((b) => anim(b, [{ opacity: 0, transform: 'translateX(8vw)' }, { opacity: 1, transform: 'none' }], { duration: 1400, delay, easing: E, fill: 'backwards' }));
  sc.querySelectorAll('.bar').forEach((b) => anim(b, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay, fill: 'backwards' }));
  sc.querySelectorAll('.cap').forEach((c) => anim(c, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 600, delay: delay + 700, easing: E, fill: 'backwards' }));
}

function textOut(sc: HTMLElement) {
  sc.querySelectorAll('[data-a],[data-h],.cap,.bar').forEach((a, i) => anim(a, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-26px)' }], { duration: 420, delay: i * 25, easing: OUT_E, fill: 'forwards' }));
  sc.querySelectorAll('.big').forEach((b) => anim(b, [{ opacity: 1 }, { opacity: 0, transform: 'translateX(-6vw)' }], { duration: 600, easing: OUT_E, fill: 'forwards' }));
}

const OUTS: Record<string, (sc: HTMLElement) => number> = {
  explode(sc) {
    sc.querySelectorAll<SVGElement>('.slab').forEach((s) => {
      const i = Number(s.dataset.i);
      anim(s, [{ transform: 'none', opacity: 1 }, { transform: `translateY(${(i - 1.5) * 170}px)`, opacity: 0 }], { duration: 650, delay: Math.abs(i - 1.5) * 40, easing: OUT_E, fill: 'forwards' });
    });
    sc.querySelectorAll('#stack > path, #stack > text').forEach((n) => anim(n, [{ opacity: 1 }, { opacity: 0 }], { duration: 250, fill: 'forwards' }));
    return 700;
  },
  scan(sc) {
    const svg = sc.querySelector('.fig svg'); const scan = sc.querySelector('.scan');
    if (svg) anim(svg, [{ clipPath: 'inset(0 0 0 0)' }, { clipPath: 'inset(0 0 0 100%)' }], { duration: 650, easing: 'cubic-bezier(.7,0,.3,1)', fill: 'forwards' });
    if (scan) anim(scan, [{ left: '0%', opacity: 1 }, { left: '100%', opacity: 1 }, { left: '100%', opacity: 0 }], { duration: 720, easing: 'cubic-bezier(.7,0,.3,1)', fill: 'forwards' });
    return 720;
  },
  scatter(sc) {
    sc.querySelectorAll<SVGElement | HTMLElement>('svg path, svg rect, svg circle, svg polygon, svg text, .endwm span').forEach((n) => {
      const a = Math.random() * Math.PI * 2, r = 40 + Math.random() * 90;
      n.style.transformBox = 'fill-box'; n.style.transformOrigin = 'center';
      anim(n, [{ transform: 'none', opacity: 1 }, { transform: `translate(${Math.cos(a) * r}px,${Math.sin(a) * r}px) rotate(${(Math.random() - 0.5) * 50}deg)`, opacity: 0 }], { duration: 620, delay: Math.random() * 160, easing: OUT_E, fill: 'forwards' });
    });
    return 780;
  },
  undraw(sc) {
    const svg = sc.querySelector<SVGSVGElement>('.fig svg'); if (!svg) return 0;
    const nodes = geo(svg).sort((a, b) => keyX(b) - keyX(a));
    nodes.forEach((n, i) => {
      if (stroked(n) && !dashed(n)) { const L = Math.ceil(n.getTotalLength()); anim(n, [{ strokeDasharray: `${L} ${L}`, strokeDashoffset: 0 }, { strokeDasharray: `${L} ${L}`, strokeDashoffset: -L }], { duration: 500, delay: i * 8, easing: OUT_E, fill: 'forwards' }); }
      else anim(n, [{ opacity: 1 }, { opacity: 0 }], { duration: 300, delay: i * 8, fill: 'forwards' });
    });
    svg.querySelectorAll('text, .pk').forEach((t) => anim(t, [{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }));
    return Math.min(800, 500 + nodes.length * 8);
  },
  flicker(sc) {
    sc.querySelectorAll('svg path, svg rect, svg circle, svg text').forEach((n) => anim(n, [{ opacity: 1 }, { opacity: 0.2, offset: 0.3 }, { opacity: 0.9, offset: 0.45 }, { opacity: 0 }], { duration: 500, delay: Math.random() * 300, fill: 'forwards' }));
    return 800;
  },
};

function enter(sc: HTMLElement, d: number) {
  textIn(sc, d);
  const stack = sc.querySelector('#stack');
  if (stack) {
    sc.querySelectorAll<SVGElement>('.slab').forEach((s) => anim(s, [{ transform: 'translateY(-70px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 800, delay: d + 250 + Number(s.dataset.i) * 260, easing: E, fill: 'backwards' }));
    stack.querySelectorAll(':scope > path, :scope > text').forEach((p) => anim(p, [{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay: d + 1300, fill: 'backwards' }));
  } else {
    const svg = sc.querySelector<SVGSVGElement>('.fig svg'); if (svg) drawIn(svg, d + 150);
  }
  sc.querySelectorAll('.endwm span').forEach((s, i) => anim(s, [{ transform: 'translateY(110%)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 800, delay: d + i * 35, easing: E, fill: 'backwards' }));
}

function show(n: number, first = false) {
  if (n === cur) return;
  const prev = cur; cur = n; root.dataset.sheet = String(n);
  document.querySelectorAll('.rail a').forEach((a, i) => a.classList.toggle('on', i === n));
  scenes.forEach((s, i) => { if (i !== n && i !== prev) { halt(s); s.classList.remove('show'); } });
  const next = scenes[n];
  clearTimeout(hideTimer);
  if (RM) {
    if (prev >= 0) { halt(scenes[prev]); scenes[prev].classList.remove('show'); }
    halt(next); next.classList.add('show');
    anim(next, [{ opacity: 0 }, { opacity: 1 }], { duration: 250 });
    return;
  }
  let wait = 0;
  if (prev >= 0 && !first) {
    const ps = scenes[prev]; halt(ps);
    wait = Math.min(OUTS[ps.dataset.out ?? 'scatter'](ps), 800); textOut(ps);
    hideTimer = window.setTimeout(() => { if (cur !== prev) { halt(ps); ps.classList.remove('show'); } }, wait + 60);
  }
  halt(next); next.classList.add('show');
  enter(next, first ? 150 : Math.max(0, wait - 250));
}

const indexFromScroll = () => Math.max(0, Math.min(scenes.length - 1, Math.round(scrollY / innerHeight)));
const goTo = (n: number) => scrollTo({ top: n * innerHeight, behavior: RM ? 'auto' : 'smooth' });
const hashIndex = () => { const m = /^#s(\d+)$/.exec(location.hash); return m ? Math.min(Number(m[1]), scenes.length - 1) : null; };

function fitWordmark() {
  const wm = document.querySelector<HTMLElement>('.endwm'); if (!wm) return;
  if (!wm.dataset.split) { wm.innerHTML = [...(wm.textContent ?? '')].map((c) => `<span>${c}</span>`).join(''); wm.dataset.split = '1'; }
  const box = wm.parentElement!.clientWidth; if (!box) return;
  wm.style.fontSize = '100px';
  wm.style.fontSize = `${(100 * box) / wm.getBoundingClientRect().width * 0.995}px`;
}

function init() {
  fitWordmark();
  document.fonts.ready.then(fitWordmark);
  addEventListener('resize', fitWordmark);
  STAGE.addEventListener('change', () => location.reload());
  if (!STAGE.matches) return; // flowing layout: anchors and native scroll do the work
  root.classList.add('stage-on'); // CSS hides sheets only once this script is running
  document.querySelectorAll<HTMLElement | SVGElement>('[data-go]').forEach((a) => a.addEventListener('click', (e) => {
    if (location.pathname !== '/') return; // header links from other pages navigate normally
    e.preventDefault(); const n = Number(a.dataset.go); history.replaceState(null, '', n ? `#s${n}` : '/'); goTo(n);
  }));
  let ticking = false;
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; show(indexFromScroll()); }); } }, { passive: true });
  addEventListener('keydown', (e) => {
    if (['ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); goTo(Math.min(cur + 1, scenes.length - 1)); }
    if (['ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); goTo(Math.max(cur - 1, 0)); }
  });
  const h = hashIndex();
  if (h !== null) scrollTo({ top: h * innerHeight, behavior: 'auto' });
  show(h ?? indexFromScroll(), true);
}

init();
