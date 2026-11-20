/* Alfa Fitness · LP v5. JS mínimo e opcional: sem ele a página funciona inteira. */
(function () {
  var d = document, root = d.documentElement;

  /* ---------- menu mobile ---------- */
  var btn = d.querySelector('.menu-btn'), menu = d.getElementById('menu');
  if (btn && menu) {
    var setOpen = function (open) {
      btn.setAttribute('aria-expanded', open);
      btn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
      btn.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
      root.classList.toggle('menu-open', open);
      menu.hidden = !open;
      d.querySelectorAll('main,footer,.wa').forEach(function (el) { el.inert = open; });
      if (open) menu.querySelector('a').focus();
    };
    btn.addEventListener('click', function () { setOpen(btn.getAttribute('aria-expanded') !== 'true'); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { setOpen(false); btn.focus(); } });
    matchMedia('(min-width:64em)').addEventListener('change', function (m) { if (m.matches) setOpen(false); });
  }

  /* ---------- header: sombra ao rolar ---------- */
  var hdr = d.getElementById('hdr');
  var onScroll = function () { hdr.classList.toggle('is-scrolled', scrollY > 8); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- aberto/fechado agora e dia de hoje (fuso de Ocara/CE) ---------- */
  try {
    var parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Fortaleza', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
    var get = function (t) { return (parts.find(function (p) { return p.type === t; }) || {}).value; };
    var wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
    var mins = (+get('hour')) * 60 + (+get('minute'));
    var weekday = wd >= 1 && wd <= 5, open = weekday && mins >= 300 && mins < 1260;
    var strong = open ? 'Aberto agora' : 'Fechado agora', rest;
    if (open) rest = ' · fecha às 21:00';
    else if (weekday && mins < 300) rest = ' · abre hoje às 05:00';
    else if (wd >= 1 && wd <= 4) rest = ' · abre amanhã às 05:00';
    else rest = ' · abre segunda às 05:00';
    d.querySelectorAll('[data-status]').forEach(function (st) {
      var el = st.querySelector('.status__txt'), b = d.createElement('b');
      b.textContent = strong; el.textContent = ''; el.append(b, rest);
      st.classList.add(open ? 'is-open' : 'is-closed');
    });
    var today = d.querySelector('.hours tr[data-d="' + wd + '"]');
    if (today) today.classList.add('is-today');
  } catch (e) { /* mantém o texto estático */ }

  /* ---------- copiar endereço ---------- */
  var cp = d.querySelector('[data-copy]');
  if (cp && navigator.clipboard && window.isSecureContext) {
    cp.hidden = false;
    var lbl = cp.querySelector('[data-copy-label]'), use = cp.querySelector('use'), t;
    cp.addEventListener('click', function () {
      navigator.clipboard.writeText(cp.getAttribute('data-copy')).then(function () {
        lbl.textContent = 'Endereço copiado'; use.setAttribute('href', '#i-check'); cp.classList.add('is-done');
        clearTimeout(t); t = setTimeout(function () { lbl.textContent = 'Copiar endereço'; use.setAttribute('href', '#i-copy'); cp.classList.remove('is-done'); }, 2200);
      });
    });
  }

  /* ---------- mapa: carrega o Google Maps só quando a pessoa pede ---------- */
  var map = d.querySelector('[data-map]'), cta = d.querySelector('[data-map-cta]'), load = d.querySelector('[data-map-load]');
  if (map && cta && load) {
    cta.hidden = false;
    load.addEventListener('click', function () {
      var f = d.createElement('iframe');
      f.src = 'https://www.google.com/maps?q=-4.4893769,-38.5944826&z=18&output=embed';
      f.title = 'Mapa: Academia Alfa Fitness, Rua José Correia, 217, Centro, Ocara/CE';
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      f.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups');
      f.setAttribute('allow', '');
      f.className = 'map__frame';
      map.appendChild(f); map.classList.add('is-live'); cta.remove(); f.focus();
    });
  }

  /* ---------- WhatsApp flutuante: some quando (a) outro link de WhatsApp está na tela
     ou (b) algum botão/link passa pelo canto onde ele fica. Sem JS, fica sempre visível. ---------- */
  var wa = d.querySelector('.wa');
  if (wa && 'IntersectionObserver' in window) {
    var waSeen = new Set(), cornerSeen = new Set(), cornerIO;
    var sync = function () { wa.classList.toggle('is-away', waSeen.size > 0 || cornerSeen.size > 0); };
    var track = function (set) {
      return function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) set.add(e.target); else set.delete(e.target); });
        sync();
      };
    };
    var waIO = new IntersectionObserver(track(waSeen));
    d.querySelectorAll('main a[href*="wa.me/"]').forEach(function (a) { waIO.observe(a); });
    var targets = d.querySelectorAll('main a, main button, main summary, footer a');
    var setupCorner = function () {
      if (cornerIO) cornerIO.disconnect();
      cornerSeen.clear();
      var zone = 96; /* área do botão (56px + 16px de margem) com folga */
      cornerIO = new IntersectionObserver(track(cornerSeen), {
        rootMargin: -(innerHeight - zone) + 'px 0px 0px ' + -(innerWidth - zone) + 'px'
      });
      targets.forEach(function (el) { cornerIO.observe(el); });
    };
    setupCorner();
    var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(setupCorner, 150); });
  }
})();
