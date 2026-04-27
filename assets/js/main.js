/**
 * Portfolio – Rina Maya Safira
 * Property Agent | PT Prospect Property
 */
(function () {
  "use strict";

  const select = (el, all = false) => {
    el = el.trim();
    return all ? [...document.querySelectorAll(el)] : document.querySelector(el);
  };

  const on = (type, el, listener, all = false) => {
    const selectEl = select(el, all);
    if (selectEl) {
      if (all) selectEl.forEach(e => e.addEventListener(type, listener));
      else selectEl.addEventListener(type, listener);
    }
  };

  const onscroll = (el, listener) => el.addEventListener('scroll', listener);

  /* ── Navbar active on scroll ── */
  let navbarlinks = select('#navbar .scrollto', true);
  const navbarlinksActive = () => {
    const position = window.scrollY + 200;
    navbarlinks.forEach(link => {
      if (!link.hash) return;
      const section = select(link.hash);
      if (!section) return;
      if (position >= section.offsetTop && position <= section.offsetTop + section.offsetHeight) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  };
  window.addEventListener('load', navbarlinksActive);
  onscroll(document, navbarlinksActive);

  /* ── Smooth scroll ── */
  const scrollto = (el) => {
    const elementPos = select(el).offsetTop;
    window.scrollTo({ top: elementPos, behavior: 'smooth' });
  };

  /* ── Back to top ── */
  const backtotop = select('.back-to-top');
  if (backtotop) {
    const toggleBacktotop = () =>
      window.scrollY > 100
        ? backtotop.classList.add('active')
        : backtotop.classList.remove('active');
    window.addEventListener('load', toggleBacktotop);
    onscroll(document, toggleBacktotop);
  }

  /* ── Mobile nav toggle ── */
  on('click', '.mobile-nav-toggle', function () {
    select('body').classList.toggle('mobile-nav-active');
    this.classList.toggle('bi-list');
    this.classList.toggle('bi-x');
  });

  /* ── Scrollto links ── */
  on('click', '.scrollto', function (e) {
    if (select(this.hash)) {
      e.preventDefault();
      const body = select('body');
      if (body.classList.contains('mobile-nav-active')) {
        body.classList.remove('mobile-nav-active');
        const toggle = select('.mobile-nav-toggle');
        toggle.classList.toggle('bi-list');
        toggle.classList.toggle('bi-x');
      }
      scrollto(this.hash);
    }
  }, true);

  window.addEventListener('load', () => {
    if (window.location.hash && select(window.location.hash)) {
      scrollto(window.location.hash);
    }
  });

  /* ── Typed.js ── */
  const typed = select('.typed');
  if (typed) {
    const strings = typed.getAttribute('data-typed-items').split(',');
    new Typed('.typed', {
      strings,
      loop: true,
      typeSpeed: 80,
      backSpeed: 40,
      backDelay: 2200
    });
  }

  /* ── Skill Orbs – animate SVG rings on scroll ── */
  const skillsContent = select('.skills-content');
  if (skillsContent) {
    const C = +(2 * Math.PI * 42).toFixed(2); // circumference ≈ 263.89 for r=42
    let triggered = false;
    new Waypoint({
      element: skillsContent,
      offset: '85%',
      handler: function () {
        if (triggered) return;
        triggered = true;
        select('.ring-fg', true).forEach(ring => {
          const pct = parseInt(ring.getAttribute('data-pct'), 10);
          const len = ((pct / 100) * C).toFixed(2);
          ring.style.strokeDasharray = len + ' ' + C;
        });
      }
    });
  }

  /* ── KPR Calculator ── */
  (function () {
    const hargaEl = document.getElementById('kpr-harga');
    const dpEl    = document.getElementById('kpr-dp');
    const bungaEl = document.getElementById('kpr-bunga');
    if (!hargaEl) return;

    let tenor = 15;

    const fmt = n => 'Rp\u00a0' + Math.round(n).toLocaleString('id-ID');

    function parseHarga() {
      return parseInt((hargaEl.value || '').replace(/\D/g, ''), 10) || 0;
    }

    function setSliderFill(el) {
      const pct = ((el.value - el.min) / (el.max - el.min) * 100).toFixed(1);
      el.style.setProperty('--fill', pct + '%');
    }

    function hitungAfford(cicilan) {
      const incomeEl  = document.getElementById('kpr-income');
      const minEl     = document.getElementById('kpr-income-min');
      const affordEl  = document.getElementById('kpr-afford');
      const minIncome = cicilan > 0 ? cicilan / 0.3 : 0;

      if (minEl) minEl.textContent = cicilan > 0 ? fmt(minIncome) : 'Rp \u2014';
      if (!incomeEl || !affordEl) return;

      const income = parseInt((incomeEl.value || '').replace(/\D/g, ''), 10) || 0;
      if (income <= 0) { affordEl.style.display = 'none'; return; }

      affordEl.style.display = 'block';
      const pct   = cicilan / income * 100;
      const barEl = document.getElementById('kpr-afford-bar');
      const pctEl = document.getElementById('kpr-afford-pct');
      const badge = document.getElementById('kpr-afford-badge');

      if (barEl) {
        barEl.style.width = Math.min(pct, 100).toFixed(1) + '%';
        barEl.className = 'kpr-afford-bar' + (pct > 40 ? ' over' : pct > 30 ? ' warn' : '');
      }
      if (pctEl) pctEl.textContent = pct.toFixed(1) + '%';
      if (badge) {
        if (pct <= 30)      { badge.textContent = 'Aman';  badge.className = 'kpr-afford-badge'; }
        else if (pct <= 40) { badge.textContent = 'Batas'; badge.className = 'kpr-afford-badge warn'; }
        else                { badge.textContent = 'Berat'; badge.className = 'kpr-afford-badge over'; }
      }
    }

    function hitung() {
      const harga   = parseHarga();
      const dpInput = document.getElementById('dp-val');
      const bInput  = document.getElementById('bunga-val');
      const dpPct   = (parseFloat(dpInput ? dpInput.value : dpEl.value) || 0) / 100;
      const bungaPA = (parseFloat(bInput  ? bInput.value  : bungaEl.value) || 0) / 100;
      const n       = tenor * 12;
      const r       = bungaPA / 12;
      const dpAmt   = harga * dpPct;
      const pokok   = harga - dpAmt;

      let cicilan = 0;
      if (r > 0 && pokok > 0 && n > 0) {
        const rn = Math.pow(1 + r, n);
        cicilan = pokok * (r * rn) / (rn - 1);
      } else if (r === 0 && pokok > 0 && n > 0) {
        cicilan = pokok / n;
      }

      const totalBayar  = cicilan * n;
      const totalBunga  = totalBayar - pokok;
      const pPct        = totalBayar > 0 ? (pokok / totalBayar * 100) : 100;
      const bPct        = 100 - pPct;

      const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
      set('res-cicilan',     fmt(cicilan));
      set('res-tenor-info',  'selama ' + tenor + ' tahun (' + n + '\u00d7 angsuran)');
      set('res-harga',       fmt(harga));
      set('res-dp-amt',      fmt(dpAmt));
      set('res-pokok',       fmt(pokok));
      set('res-total-bunga', fmt(totalBunga));
      set('res-total',       fmt(totalBayar));

      const barP = document.getElementById('kpr-bar-p');
      const barB = document.getElementById('kpr-bar-b');
      if (barP) barP.style.width = pPct.toFixed(1) + '%';
      if (barB) barB.style.width = bPct.toFixed(1) + '%';

      hitungAfford(cicilan);
    }

    /* Format harga input */
    hargaEl.addEventListener('input', function () {
      const raw = this.value.replace(/\D/g, '');
      const num = parseInt(raw, 10);
      this.value = num > 0 ? num.toLocaleString('id-ID') : '';
      hitung();
    });

    /* DP slider → sync ke input manual */
    dpEl.addEventListener('input', function () {
      const inp = document.getElementById('dp-val');
      if (inp) inp.value = parseInt(this.value, 10);
      setSliderFill(this);
      hitung();
    });

    /* DP input manual → sync ke slider */
    const dpValEl = document.getElementById('dp-val');
    if (dpValEl) {
      dpValEl.addEventListener('input', function () {
        const v = Math.min(90, Math.max(0, parseFloat(this.value) || 0));
        dpEl.value = v;
        setSliderFill(dpEl);
        hitung();
      });
    }

    /* Bunga slider → sync ke input manual */
    bungaEl.addEventListener('input', function () {
      const inp = document.getElementById('bunga-val');
      if (inp) inp.value = parseFloat(this.value).toFixed(1);
      setSliderFill(this);
      hitung();
    });

    /* Bunga input manual → sync ke slider */
    const bungaValEl = document.getElementById('bunga-val');
    if (bungaValEl) {
      bungaValEl.addEventListener('input', function () {
        const v = Math.min(20, Math.max(0, parseFloat(this.value) || 0));
        bungaEl.value = v;
        setSliderFill(bungaEl);
        hitung();
      });
    }

    /* Tenor buttons */
    document.querySelectorAll('.kpr-tenor').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.kpr-tenor').forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        tenor = parseInt(this.dataset.v, 10);
        hitung();
      });
    });

    /* Format penghasilan input */
    const incomeEl = document.getElementById('kpr-income');
    if (incomeEl) {
      incomeEl.addEventListener('input', function () {
        const raw = this.value.replace(/\D/g, '');
        const num = parseInt(raw, 10);
        this.value = num > 0 ? num.toLocaleString('id-ID') : '';
        hitung();
      });
    }

    /* Init */
    hargaEl.value = (500000000).toLocaleString('id-ID');
    setSliderFill(dpEl);
    setSliderFill(bungaEl);
    hitung();
  })();

  /* ── GLightbox ── */
  GLightbox({ selector: '.listing-lightbox' });

  /* ── AOS ── */
  window.addEventListener('load', () => {
    AOS.init({ duration: 900, easing: 'ease-in-out', once: true, mirror: false });
  });

  /* ── PureCounter ── */
  new PureCounter();

})();
