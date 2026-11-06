(function () {
  const W = window.WRCert;
  const state = W.loadState();
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const envelope = document.getElementById('envelope');
  const result = document.getElementById('open-result');
  const certMount = document.getElementById('open-cert');
  const msgCard = document.getElementById('open-msg');
  const qrMount = document.getElementById('qr');
  const codeEl = document.getElementById('human-code');
  const bookBtn = document.getElementById('btn-book');

  function showOpened() {
    envelope.classList.add('is-open');
    result.classList.add('is-shown');
    envelope.setAttribute('aria-expanded', 'true');
    envelope.blur();
    envelope.setAttribute('tabindex','-1');
  }

  function paint() {
    certMount.innerHTML = W.renderCertHTML(state);
    const msg = (state.message || '').trim();
    const sig = (state.signature || '').trim();
    const to = (state.recipientName || '').trim();
    msgCard.classList.toggle('is-sans', state.msgFont === 'sans');
    msgCard.querySelector('[data-msg]').textContent = msg || 'Вам подарили вечер в White Rabbit.';
    msgCard.querySelector('[data-to]').textContent = to ? to : 'Гость';
    msgCard.querySelector('[data-sig]').textContent = sig ? sig : 'White Rabbit';
    const code = state.code || 'WR-1842';
    codeEl.textContent = code;
    qrMount.innerHTML = W.qrSvg(code + '|' + state.amount);
  }

  paint();

  if (reduce) {
    showOpened();
  }

  function open() {
    if (envelope.classList.contains('is-open')) return;
    showOpened();
  }

  envelope.addEventListener('click', open);
  envelope.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
  });

  if (bookBtn) {
    bookBtn.addEventListener('click', function () {
      window.alert('В этой версии виджет бронирования Remarked ещё не подключён. На живом сайте кнопка откроет бронь стола.');
    });
  }

  // Auto-hint pulse for demo screenshots: leave closed unless reduced motion
  if (!reduce) {
    envelope.focus({ preventScroll: true });
  }
})();
