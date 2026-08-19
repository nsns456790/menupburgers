/* =============================================================
   menup — محرك الموقع
   بيانات المحل كلها في كائن واحد تحت. تغييرها يغيّر الموقع كله.
   ============================================================= */

const SHOP = {
  name: 'menup',
  city: 'مكة المكرمة',
  branch: 'فرع العزيزية',
  address: 'شارع الحج، حي العزيزية، مكة المكرمة',
  hours: 'يومياً من ١٢ ظهراً إلى ٢ بعد منتصف الليل',
  openHour: 12,          // بتوقيت مكة
  closeHour: 26,         // ٢ بعد منتصف الليل
  phone: '0500000000',            // مؤقت
  phoneDisplay: '05X XXX XXXX',   // مؤقت حتى يصل الرقم الحقيقي
  whatsapp: '966500000000',       // مؤقت
  instagram: 'https://instagram.com/',
  tiktok: 'https://tiktok.com/',
  maps: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('برجر العزيزية مكة المكرمة')
};

/* ---------- أدوات ---------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
const lerp  = (a, b, t) => a + (b - a) * t;
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeBack = t => { const c = 1.32; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const ar = n => String(n).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
const softMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isPhone = () => matchMedia('(max-width: 900px)').matches;

/* ---------- تعبئة بيانات المحل ---------- */
(function fill() {
  const waText = encodeURIComponent(`السلام عليكم، أبغى أطلب من ${SHOP.name} 👋`);
  const waHref = `https://wa.me/${SHOP.whatsapp}?text=${waText}`;

  $$('.js-name').forEach(el => el.textContent = SHOP.name);
  $$('.js-wa').forEach(el => { el.href = waHref; el.target = '_blank'; el.rel = 'noopener'; });
  $$('.js-phone-text').forEach(el => {
    el.href = 'tel:' + SHOP.phone;
    if (el.textContent.trim().startsWith('٠')) {
      el.textContent = SHOP.phoneDisplay;
      el.dir = 'ltr';
      el.style.display = 'inline-block';
    }
  });
  $$('.js-address').forEach(el => el.textContent = SHOP.address);
  $$('.js-hours').forEach(el => el.textContent = SHOP.hours);
  $$('.js-branch').forEach(el => el.textContent = SHOP.branch);
  $$('.js-map').forEach(el => el.href = SHOP.maps);
  const handle = el => { el.textContent = '@' + SHOP.name; el.dir = 'ltr'; el.style.display = 'inline-block'; };
  $$('.js-ig').forEach(el => { el.href = SHOP.instagram; if (el.textContent.trim().startsWith('@')) handle(el); });
  $$('.js-tt').forEach(el => { el.href = SHOP.tiktok; if (el.textContent.trim().startsWith('@')) handle(el); });

  // طلب صنف واحد من المنيو
  $$('.js-wa-item').forEach(el => {
    const item = el.dataset.item || '';
    el.href = `https://wa.me/${SHOP.whatsapp}?text=` + encodeURIComponent(`السلام عليكم، أبغى أطلب: ${item}`);
    el.target = '_blank'; el.rel = 'noopener';
  });

  const y = $('#year'); if (y) y.textContent = ar(new Date().getFullYear());
})();

/* ---------- مفتوح الآن (بتوقيت مكة UTC+3) ---------- */
(function openNow() {
  const el = $('#openNow'); if (!el) return;
  const now = new Date();
  const mk = new Date(now.getTime() + (now.getTimezoneOffset() + 180) * 60000);
  const h = mk.getHours() + mk.getMinutes() / 60;
  const open = h >= SHOP.openHour || h < (SHOP.closeHour - 24);
  el.textContent = open ? 'مفتوح الآن' : 'مغلق الآن، نفتح ١٢ ظهراً';
  el.classList.toggle('shut', !open);
})();

/* =============================================================
   المشهد الافتتاحي: رحلة بناء البرجر عبر السحب
   ============================================================= */
const LAYERS = [
  { id: 'bun-bottom', s: .05, e: .17, y:  260, x: 0,    r: 0,   sx: .84, sy: .84 },
  { id: 'patty',      s: .18, e: .31, y: -420, x: 0,    r: -9,  sx: 1,   sy: 1   },
  { id: 'cheese',     s: .32, e: .45, y: -240, x: 0,    r: 0,   sx: 1,   sy: .38 },
  { id: 'pickle',     s: .46, e: .54, y:  -90, x: 0,    r: 0,   sx: .3,  sy: .3  },
  { id: 'tomato',     s: .48, e: .58, y:  -40, x: -480, r: -16, sx: 1,   sy: 1   },
  { id: 'lettuce',    s: .51, e: .62, y:  -40, x:  480, r: 14,  sx: 1,   sy: 1   },
  { id: 'sauce',      s: .62, e: .71, y: -160, x: 0,    r: 0,   sx: 1,   sy: .25 },
  { id: 'bun-top',    s: .72, e: .85, y: -600, x: 0,    r: 0,   sx: 1.07,sy: .9  }
];
const BANDS = [[.06,.175],[.185,.315],[.325,.455],[.465,.60],[.615,.715],[.725,.855]];
const OPENER_TO = .05;
const SETTLE_AT = .88;

const hero    = $('.hero');
const stage   = $('.hero__stage');
const artEls  = {};
$$('.hero__art g[data-layer]').forEach(g => artEls[g.dataset.layer] = g);
const bandEls = $$('.band');
const settleEl= $('#settle');
const hintEl  = $('#hint');
const brandEl = $('#brandline');
const openerEl= $('#opener');
const railEl  = $('#rail');
const railTicks = $$('#rail li');
const glowEl  = $('#envGlow');
const navEl   = $('#nav');

const staticHero = () => {
  Object.values(artEls).forEach(g => { g.style.opacity = 1; g.style.transform = 'none'; });
  settleEl && settleEl.classList.add('is-on');
  openerEl && openerEl.classList.remove('is-on');
  brandEl && brandEl.classList.add('is-on');
  navEl && navEl.classList.add('is-on');
};

if (softMotion || isPhone() || !hero) {
  staticHero();
} else {
  let target = 0, shown = -1, raf = 0, resting = true;
  const cache = {};

  const readProgress = () => {
    const r = hero.getBoundingClientRect();
    const span = hero.offsetHeight - stage.offsetHeight;
    return span <= 0 ? 0 : clamp(-r.top / span);
  };

  const paint = p => {
    // الطبقات
    for (const L of LAYERS) {
      const t = easeOut(clamp((p - L.s) / (L.e - L.s)));
      const b = L.id === 'patty' || L.id === 'bun-top' ? easeBack(clamp((p - L.s) / (L.e - L.s))) : t;
      const y  = lerp(L.y, 0, b);
      const x  = lerp(L.x, 0, t);
      const rot= lerp(L.r, 0, t);
      const sx = lerp(L.sx, 1, t);
      const sy = lerp(L.sy, 1, t);
      const tf = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${rot.toFixed(2)}deg) scale(${sx.toFixed(3)},${sy.toFixed(3)})`;
      const op = clamp(t * 3).toFixed(2);
      const g  = artEls[L.id]; if (!g) continue;
      if (cache[L.id + 't'] !== tf) { g.style.transform = tf; cache[L.id + 't'] = tf; }
      if (cache[L.id + 'o'] !== op) { g.style.opacity = op;   cache[L.id + 'o'] = op; }
    }
    // التعليقات
    let active = -1;
    for (let i = 0; i < BANDS.length; i++) if (p >= BANDS[i][0] && p < BANDS[i][1]) active = i;
    if (p >= SETTLE_AT) active = -1;
    if (cache.band !== active) {
      bandEls.forEach((el, i) => el.classList.toggle('is-on', i === active));
      railTicks.forEach((el, i) => el.classList.toggle('on', active >= 0 ? i <= active : p >= SETTLE_AT));
      cache.band = active;
    }
    const railOn = p >= OPENER_TO && p < SETTLE_AT;
    if (cache.rail !== railOn) { railEl.classList.toggle('is-on', railOn); cache.rail = railOn; }
    const opener = p < OPENER_TO;
    if (cache.opener !== opener) { openerEl.classList.toggle('is-on', opener); cache.opener = opener; }
    // الاستقرار والتفاصيل
    const settled = p >= SETTLE_AT;
    if (cache.settle !== settled) { settleEl.classList.toggle('is-on', settled); cache.settle = settled; }
    const brand = p > .01;
    if (cache.brand !== brand) { brandEl.classList.toggle('is-on', brand); cache.brand = brand; }
    const hintOp = p < .045 ? '1' : '0';
    if (cache.hint !== hintOp) { hintEl.style.opacity = hintOp; cache.hint = hintOp; }
    const glow = (.45 + p * .8).toFixed(2);
    if (cache.glow !== glow) { glowEl.style.opacity = glow; cache.glow = glow; }
    const nav = p > .92;
    if (cache.nav !== nav) { navEl.classList.toggle('is-on', nav); cache.nav = nav; }
  };

  const tick = () => {
    shown = lerp(shown, target, .16);
    if (Math.abs(shown - target) < .0004) { shown = target; resting = true; }
    paint(shown);
    if (!resting) raf = requestAnimationFrame(tick); else raf = 0;
  };
  const wake = () => {
    target = readProgress();
    if (shown < 0) shown = target;
    resting = false;
    if (!raf) raf = requestAnimationFrame(tick);
  };

  addEventListener('scroll', wake, { passive: true });
  addEventListener('resize', wake);
  wake();
  paint(readProgress());

  /* ---------- شرر ودخان على Canvas ---------- */
  const cv = $('#spark'), cx = cv.getContext('2d');
  let W = 0, H = 0, dpr = Math.min(devicePixelRatio || 1, 2), parts = [], alive = true;
  const size = () => { W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr,0,0,dpr,0,0); };
  size(); addEventListener('resize', size);

  const spawn = () => {
    const p = shown < 0 ? 0 : shown;
    const grill = p > .14 && p < .5;          // مرحلة الشوي: شرر
    const rest  = p > .82;                     // الاستقرار: بخار
    if (!grill && !rest) return;
    const n = grill ? 2 : 1;
    for (let i = 0; i < n; i++) parts.push({
      x: W * (.13 + Math.random() * .3),
      y: H * (grill ? .68 : .58) + Math.random() * 26,
      vx: (Math.random() - .5) * .28,
      vy: -(grill ? .5 + Math.random() * .9 : .22 + Math.random() * .3),
      r: grill ? .8 + Math.random() * 1.7 : 5 + Math.random() * 12,
      life: 1,
      decay: grill ? .006 + Math.random() * .008 : .004,
      hot: grill
    });
  };

  const draw = () => {
    if (!alive) return;
    cx.clearRect(0, 0, W, H);
    spawn();
    for (let i = parts.length - 1; i >= 0; i--) {
      const s = parts[i];
      s.x += s.vx; s.y += s.vy; s.vy *= .995; s.life -= s.decay;
      if (s.life <= 0 || s.y < -40) { parts.splice(i, 1); continue; }
      cx.beginPath();
      if (s.hot) {
        cx.fillStyle = `rgba(240,${140 + Math.round(60 * s.life)},60,${(s.life * .85).toFixed(3)})`;
        cx.arc(s.x, s.y, s.r, 0, 6.284);
      } else {
        cx.fillStyle = `rgba(246,236,217,${(s.life * .05).toFixed(3)})`;
        cx.arc(s.x, s.y, s.r * (2 - s.life), 0, 6.284);
      }
      cx.fill();
    }
    if (parts.length > 260) parts.splice(0, parts.length - 260);
    requestAnimationFrame(draw);
  };
  new IntersectionObserver(es => {
    alive = es[0].isIntersecting;
    if (alive) requestAnimationFrame(draw); else cx.clearRect(0, 0, W, H);
  }, { threshold: 0 }).observe(stage);
}

/* ---------- شريط التنقل بعد المشهد (احتياط للجوال) ---------- */
if (isPhone() || softMotion) navEl && navEl.classList.add('is-on');

/* =============================================================
   ظهور الأقسام عند التمرير
   ============================================================= */
const io = new IntersectionObserver((es, o) => {
  es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    el.classList.add('is-in');
    const delay = [...(el.parentElement?.children || [])].indexOf(el) * 90;
    el.style.transitionDelay = Math.min(delay, 360) + 'ms';
    o.unobserve(el);
    if (el.dataset.count !== undefined) count(el);
  });
}, { threshold: .16, rootMargin: '0px 0px -8% 0px' });

$$('.rise, .thread, .stat b').forEach(el => io.observe(el));

function count(el) {
  if (el.dataset.fixed) { el.textContent = el.dataset.fixed; return; }
  const to = +el.dataset.count, t0 = performance.now(), dur = 1300;
  const step = now => {
    const t = clamp((now - t0) / dur);
    el.textContent = ar(Math.round(to * easeOut(t)));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* =============================================================
   ابنِ برجرك
   ============================================================= */
(function builder() {
  const box = $('#opts'), stageSvg = $('#bstage'), totalEl = $('#total');
  if (!box) return;
  const BASE = 25;
  const on = new Set();

  // ترتيب التكديس من الأسفل للأعلى، وارتفاع كل طبقة
  const SLOTS = [['patty2',24],['cheese',13],['smoked',11],['onion',13],['pickle',9],['hot',10]];
  const TOP_Y = 118;   // سطح الخضار في الرسمة

  const stack = () => {
    let acc = 0;
    for (const [k, h] of SLOTS) {
      const g = stageSvg.querySelector(`g[data-b="${k}"]`);
      if (!g) continue;
      if (on.has(k)) { acc += h; g.style.transform = `translateY(${TOP_Y - acc}px)`; }
      else g.style.transform = `translateY(${TOP_Y - acc - h}px)`;
    }
    const bt = stageSvg.querySelector('#btop');
    bt && (bt.style.transform = `translateY(${-acc}px)`);
    const hint = stageSvg.querySelector('#bhint');
    hint && hint.classList.toggle('off', acc > 24);
  };

  const render = () => {
    let sum = BASE;
    $$('.opt', box).forEach(b => {
      const k = b.dataset.b, active = on.has(k);
      b.classList.toggle('on', active);
      b.setAttribute('aria-pressed', active);
      const g = stageSvg.querySelector(`g[data-b="${k}"]`);
      g && g.classList.toggle('on', active);
      if (active) sum += +b.dataset.p;
    });
    stack();
    totalEl.textContent = ar(sum);
    totalEl.classList.add('pop');
    setTimeout(() => totalEl.classList.remove('pop'), 260);
    return sum;
  };

  box.addEventListener('click', e => {
    const b = e.target.closest('.opt'); if (!b) return;
    const k = b.dataset.b;
    on.has(k) ? on.delete(k) : on.add(k);
    const sum = render();
    const picks = [...on].map(k => $(`.opt[data-b="${k}"]`, box).dataset.label);
    const msg = `السلام عليكم، أبغى برجر مخصص من ${SHOP.name}:\n• الأساس: خبز سمسم + لحم طازج + خس وطماطم` +
                (picks.length ? `\n• إضافات: ${picks.join('، ')}` : '') +
                `\n• التقديري: ${sum} ريال`;
    const link = $('.js-wa-build');
    link && (link.href = `https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(msg)}`, link.target = '_blank', link.rel = 'noopener');
  });

  on.add('cheese');
  render();
  const link = $('.js-wa-build');
  link && (link.href = `https://wa.me/${SHOP.whatsapp}?text=` + encodeURIComponent(`السلام عليكم، أبغى برجر مخصص من ${SHOP.name}`), link.target = '_blank', link.rel = 'noopener');
})();

/* =============================================================
   الأسئلة الشائعة
   ============================================================= */
$$('.qa__q').forEach(btn => {
  const qa = btn.parentElement;
  btn.setAttribute('aria-expanded', 'false');
  btn.addEventListener('click', () => {
    const open = qa.classList.toggle('on');
    btn.setAttribute('aria-expanded', open);
  });
});

/* =============================================================
   نموذج الطلب → واتساب
   ============================================================= */
(function orderForm() {
  const f = $('#orderForm'), ok = $('#formOk');
  if (!f) return;
  f.addEventListener('submit', e => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f));
    const missing = ['name', 'phone', 'order'].filter(k => !String(d[k] || '').trim());
    if (missing.length) {
      ok.textContent = 'ناقص: ' + missing.map(k => ({ name: 'الاسم', phone: 'رقم الجوال', order: 'تفاصيل الطلب' }[k])).join('، ');
      ok.classList.add('on');
      ok.style.background = 'rgba(214,64,47,.14)';
      ok.style.borderColor = 'rgba(214,64,47,.45)';
      f.querySelector(`[name="${missing[0]}"]`).focus();
      return;
    }
    const msg = `السلام عليكم ${SHOP.name} 👋\n\nالاسم: ${d.name}\nالجوال: ${d.phone}\nنوع الطلب: ${d.type}\n\nالطلب:\n${d.order}`;
    ok.style.background = ''; ok.style.borderColor = '';
    ok.textContent = 'فتحنا لك واتساب والرسالة جاهزة. اضغط إرسال داخل واتساب عشان يوصلنا الطلب.';
    ok.classList.add('on');
    window.open(`https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });
})();
