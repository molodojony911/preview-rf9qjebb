(function (global) {
  const STORAGE_KEY = 'wrCertWidget_v1';

  const EXPERIENCES = {
    dinner: {
      id: 'dinner',
      title: 'Ужин для двоих',
      desc: 'Два места у панорамы, сезонное меню шефа и вечер, который не спешит.',
      price: 25000,
      priceLabel: '25 000 ₽',
      priceNote: 'ориентир меню · пример для макета',
      photo: 'assets/hall.webp',
    },
    tasting: {
      id: 'tasting',
      title: 'Дегустационный сет с винным сопровождением',
      desc: 'Сет «Золотая осень» Владимира Мухина и вино к каждому блюду.',
      price: 27300,
      priceLabel: '27 300 ₽',
      priceNote: 'ориентир меню · 17 500 + 9 800 ₽',
      photo: 'assets/g1.webp',
    },
    chef: {
      id: 'chef',
      title: "Chef's table",
      desc: 'Стол у кухни, разговор с бригадой и блюда, которых нет в открытом меню.',
      price: 45000,
      priceLabel: '45 000 ₽',
      priceNote: 'ориентир меню · пример для макета',
      photo: 'assets/chef.webp',
    },
    brunch: {
      id: 'brunch',
      title: 'Бранч',
      desc: 'Медленное утро под куполом: лёгкие блюда, игристое и Москва внизу.',
      price: 12000,
      priceLabel: '12 000 ₽',
      priceNote: 'ориентир меню · пример для макета',
      photo: 'assets/dome.webp',
    },
  };

  const COVERS = {
    birthday: { id: 'birthday', label: 'День рождения', src: 'assets/hall.webp' },
    anniversary: { id: 'anniversary', label: 'Годовщина', src: 'assets/dome.webp' },
    valentine: { id: 'valentine', label: '14 февраля', src: 'assets/night.webp' },
    winter: { id: 'winter', label: 'Зимний вечер', src: 'assets/hero.webp' },
    thanks: { id: 'thanks', label: 'Спасибо', src: 'assets/chef.webp' },
    dome: { id: 'dome', label: 'Под куполом', src: 'assets/g5.webp' },
  };

  const SHAPES = {
    classic: { id: 'classic', label: 'Классика' },
    menu: { id: 'menu', label: 'Меню-карта' },
    plate: { id: 'plate', label: 'Тарелка' },
    envelope: { id: 'envelope', label: 'Конверт' },
    ticket: { id: 'ticket', label: 'Билет' },
  };

  const COLORS = {
    'ivory-black': { id: 'ivory-black', label: 'Слоновая кость' },
    'black-ivory': { id: 'black-ivory', label: 'Парчмент' },
    midnight: { id: 'midnight', label: 'Полночь' },
    forest: { id: 'forest', label: 'Лес' },
    wine: { id: 'wine', label: 'Бордо' },
    cream: { id: 'cream', label: 'Крем' },
  };

  const TEMPLATES = [
    { id: 't1', text: 'Пусть этот вечер станет дверью в другой мир — под куполом, над Москвой.' },
    { id: 't2', text: 'Для тех, кто всегда опаздывает на самое интересное. Жду тебя на шестнадцатом этаже.' },
    { id: 't3', text: 'С днём рождения. Пусть стол будет накрыт, а время — чуть медленнее обычного.' },
    { id: 't4', text: 'Спасибо тебе. За всё, что не умещается в слова, но умещается в один ужин.' },
    { id: 't5', text: 'На годовщину. Под стеклянным небом, где Москва смотрит снизу вверх.' },
  ];

  const DEFAULTS = {
    amount: 10000,
    experience: '',
    shape: 'classic',
    color: 'ivory-black',
    cover: 'dome',
    message: '',
    signature: '',
    msgFont: 'serif',
    recipientName: '',
    recipientPhone: '',
    recipientEmail: '',
    channel: 'email',
    timing: 'now',
    sendDate: '',
    sendTime: '19:00',
    code: 'WR-1842',
  };

  function clampAmount(n) {
    const v = Math.round(Number(String(n).replace(/\s/g, '').replace(',', '.')) || 0);
    return Math.min(300000, Math.max(3000, v));
  }

  function formatRub(n) {
    return clampAmount(n).toLocaleString('ru-RU') + ' ₽';
  }

  function migrateState(raw) {
    const state = Object.assign({}, DEFAULTS, raw || {});
    // Old two-type model: experience type kept the id as a wish; money type had no wish.
    if (state.type === 'experience') {
      if (!state.experience || !EXPERIENCES[state.experience]) {
        state.experience = 'dinner';
      }
      // Never overwrite amount with experience price.
      state.amount = clampAmount(state.amount || DEFAULTS.amount);
    } else if (state.type === 'money') {
      state.experience = '';
      state.amount = clampAmount(state.amount || DEFAULTS.amount);
    } else {
      // New model or unknown: keep amount; treat unknown experience ids as none.
      state.amount = clampAmount(state.amount || DEFAULTS.amount);
      if (state.experience && !EXPERIENCES[state.experience]) {
        state.experience = '';
      }
      if (state.experience == null) state.experience = '';
    }
    delete state.type;
    return state;
  }

  function saveState(state) {
    const payload = migrateState(Object.assign({}, DEFAULTS, state));
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (_) {}
    try {
      const compact = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
      if (compact.length < 1800) {
        location.hash = 'c=' + compact;
      }
    } catch (_) {}
    return payload;
  }

  function loadState() {
    let fromHash = null;
    try {
      const m = (location.hash || '').match(/c=([^&]+)/);
      if (m) {
        fromHash = JSON.parse(decodeURIComponent(escape(atob(m[1]))));
      }
    } catch (_) {}
    let fromStore = null;
    try {
      fromStore = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
    } catch (_) {}
    return migrateState(Object.assign({}, fromStore || {}, fromHash || {}));
  }

  function valueLabel(state) {
    return {
      title: 'Подарочный сертификат',
      value: formatRub(state.amount),
      note: 'на сумму',
    };
  }

  function wishOf(state) {
    if (!state || !state.experience) return null;
    return EXPERIENCES[state.experience] || null;
  }

  function coverOf(state) {
    return COVERS[state.cover] || COVERS.dome;
  }

  function renderCertHTML(state, opts) {
    opts = opts || {};
    const v = valueLabel(state);
    const cover = coverOf(state);
    const wish = wishOf(state);
    const msg = (state.message || '').trim();
    const sig = (state.signature || '').trim();
    const to = (state.recipientName || '').trim();
    const msgClass = state.msgFont === 'sans' ? 'cert-msg is-sans' : 'cert-msg';
    const who = to ? escapeHtml(to) : 'гость White Rabbit';
    const wishHtml = wish
      ? '<p class="cert-wish"><span>Хотелось бы</span> ' + escapeHtml(wish.title) + '</p>'
      : '';
    return (
      '<article class="cert" data-shape="' +
      escapeHtml(state.shape) +
      '" data-color="' +
      escapeHtml(state.color) +
      '"' +
      (opts.id ? ' id="' + opts.id + '"' : '') +
      '>' +
      '<span class="cert-suit tl" aria-hidden="true">♠</span>' +
      '<span class="cert-suit br" aria-hidden="true">♠</span>' +
      '<div class="cert-cover"><img src="' +
      escapeHtml(cover.src) +
      '" alt=""></div>' +
      '<div class="cert-body">' +
      '<div class="cert-top"><span class="cert-word">White Rabbit</span><span class="cert-occ">' +
      escapeHtml(cover.label) +
      '</span></div>' +
      '<div class="cert-mid">' +
      '<div class="cert-title">' +
      escapeHtml(v.title) +
      '</div>' +
      '<div class="cert-value">' +
      escapeHtml(v.value) +
      '<small>' +
      escapeHtml(v.note) +
      '</small></div>' +
      wishHtml +
      (msg ? '<p class="' + msgClass + '">' + escapeHtml(msg) + '</p>' : '') +
      '</div>' +
      '<div class="cert-bot"><div class="cert-from">для<span><b>' +
      who +
      '</b></span>' +
      (sig ? '<span class="sig-line">от ' + escapeHtml(sig) + '</span>' : '') +
      '</div><div class="cert-seal" aria-hidden="true">WR</div></div>' +
      '</div></article>'
    );
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** Minimal QR-like SVG (visual dummy, not a real encoder). */
  function qrSvg(text) {
    const size = 21;
    const seed = String(text || 'WR-1842');
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    const cells = [];
    function bit(x, y) {
      const n = (h ^ (x * 73856093) ^ (y * 19349663)) >>> 0;
      return n % 3 !== 0;
    }
    function finder(ox, oy) {
      for (let y = 0; y < 7; y++)
        for (let x = 0; x < 7; x++) {
          const edge = x === 0 || y === 0 || x === 6 || y === 6;
          const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
          cells.push([ox + x, oy + y, edge || core]);
        }
    }
    finder(0, 0);
    finder(size - 7, 0);
    finder(0, size - 7);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const inFinder =
          (x < 8 && y < 8) || (x >= size - 8 && y < 8) || (x < 8 && y >= size - 8);
        if (inFinder) continue;
        cells.push([x, y, bit(x, y)]);
      }
    }
    const scale = 4;
    let rects = '';
    cells.forEach(function (c) {
      if (c[2]) rects += '<rect x="' + c[0] * scale + '" y="' + c[1] * scale + '" width="' + scale + '" height="' + scale + '"/>';
    });
    const dim = size * scale;
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' +
      dim +
      ' ' +
      dim +
      '" width="' +
      dim +
      '" height="' +
      dim +
      '" role="img" aria-label="QR-код сертификата"><rect width="100%" height="100%" fill="#F2EFE9"/>' +
      '<g fill="#0B0B0B">' +
      rects +
      '</g></svg>'
    );
  }

  global.WRCert = {
    STORAGE_KEY,
    EXPERIENCES,
    COVERS,
    SHAPES,
    COLORS,
    TEMPLATES,
    DEFAULTS,
    clampAmount,
    formatRub,
    saveState,
    loadState,
    valueLabel,
    wishOf,
    coverOf,
    renderCertHTML,
    escapeHtml,
    qrSvg,
  };
})(window);
