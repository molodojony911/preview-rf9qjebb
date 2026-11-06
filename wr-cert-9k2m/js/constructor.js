(function () {
  const W = window.WRCert;
  const state = W.loadState();

  const els = {
    preview: document.getElementById('cert-preview'),
    amountInput: document.getElementById('amount'),
    message: document.getElementById('message'),
    counter: document.getElementById('counter'),
    signature: document.getElementById('signature'),
    recipientName: document.getElementById('recipient-name'),
    recipientPhone: document.getElementById('recipient-phone'),
    recipientEmail: document.getElementById('recipient-email'),
    whenFields: document.getElementById('when-fields'),
    sendDate: document.getElementById('send-date'),
    sendTime: document.getElementById('send-time'),
    openBtn: document.getElementById('btn-open'),
    pdfBtn: document.getElementById('btn-pdf'),
  };

  function syncChips(sel, key, val) {
    document.querySelectorAll(sel).forEach(function (btn) {
      btn.classList.toggle('is-on', btn.getAttribute(key) === String(val));
    });
  }

  function syncExperience() {
    const current = state.experience ? state.experience : 'none';
    document.querySelectorAll('[data-exp]').forEach(function (btn) {
      btn.classList.toggle('is-on', btn.getAttribute('data-exp') === current);
    });
  }

  function render() {
    els.preview.innerHTML = W.renderCertHTML(state);
    syncChips('[data-amount]', 'data-amount', state.amount);
    syncExperience();
    syncChips('[data-shape]', 'data-shape', state.shape);
    syncChips('[data-color]', 'data-color', state.color);
    syncChips('[data-cover]', 'data-cover', state.cover);
    syncChips('[data-tpl]', 'data-tpl', '');
    syncChips('[data-font]', 'data-font', state.msgFont);
    syncChips('[data-channel]', 'data-channel', state.channel);
    syncChips('[data-timing]', 'data-timing', state.timing);
    if (els.amountInput && document.activeElement !== els.amountInput) {
      els.amountInput.value = W.formatRub(state.amount).replace(' ₽', '');
    }
    if (els.message && document.activeElement !== els.message) {
      els.message.value = state.message || '';
    }
    els.counter.textContent = String((state.message || '').length) + ' / 300';
    if (els.signature && document.activeElement !== els.signature) {
      els.signature.value = state.signature || '';
    }
    if (els.recipientName && document.activeElement !== els.recipientName) {
      els.recipientName.value = state.recipientName || '';
    }
    if (els.recipientPhone && document.activeElement !== els.recipientPhone) {
      els.recipientPhone.value = state.recipientPhone || '';
    }
    if (els.recipientEmail && document.activeElement !== els.recipientEmail) {
      els.recipientEmail.value = state.recipientEmail || '';
    }
    els.whenFields.hidden = state.timing !== 'later';
    if (els.sendDate && state.sendDate) els.sendDate.value = state.sendDate;
    if (els.sendTime && state.sendTime) els.sendTime.value = state.sendTime;
    W.saveState(state);
  }

  document.querySelectorAll('[data-amount]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.amount = W.clampAmount(btn.getAttribute('data-amount'));
      render();
    });
  });

  if (els.amountInput) {
    els.amountInput.addEventListener('input', function () {
      const raw = els.amountInput.value.replace(/[^\d]/g, '');
      if (!raw) return;
      state.amount = W.clampAmount(raw);
      els.preview.innerHTML = W.renderCertHTML(state);
      syncChips('[data-amount]', 'data-amount', state.amount);
      W.saveState(state);
    });
    els.amountInput.addEventListener('blur', function () {
      state.amount = W.clampAmount(els.amountInput.value.replace(/[^\d]/g, '') || state.amount);
      render();
    });
  }

  document.querySelectorAll('[data-exp]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const id = btn.getAttribute('data-exp');
      if (id === 'none') {
        state.experience = '';
      } else if (state.experience === id) {
        // Second click on the same experience clears the wish.
        state.experience = '';
      } else {
        state.experience = id;
        // Amount stays untouched — experience is only a wish.
      }
      render();
    });
  });

  document.querySelectorAll('[data-shape]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.shape = btn.getAttribute('data-shape');
      render();
    });
  });

  document.querySelectorAll('[data-color]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.color = btn.getAttribute('data-color');
      render();
    });
  });

  document.querySelectorAll('[data-cover]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.cover = btn.getAttribute('data-cover');
      render();
    });
  });

  document.querySelectorAll('[data-tpl]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const id = btn.getAttribute('data-tpl');
      const t = W.TEMPLATES.find(function (x) {
        return x.id === id;
      });
      if (!t) return;
      state.message = t.text.slice(0, 300);
      render();
      document.querySelectorAll('[data-tpl]').forEach(function (b) {
        b.classList.toggle('is-on', b === btn);
      });
    });
  });

  document.querySelectorAll('[data-font]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.msgFont = btn.getAttribute('data-font');
      render();
    });
  });

  if (els.message) {
    els.message.addEventListener('input', function () {
      state.message = els.message.value.slice(0, 300);
      if (els.message.value.length > 300) els.message.value = state.message;
      els.counter.textContent = String(state.message.length) + ' / 300';
      els.preview.innerHTML = W.renderCertHTML(state);
      W.saveState(state);
    });
  }

  if (els.signature) {
    els.signature.addEventListener('input', function () {
      state.signature = els.signature.value.slice(0, 60);
      els.preview.innerHTML = W.renderCertHTML(state);
      W.saveState(state);
    });
  }

  ['recipientName', 'recipientPhone', 'recipientEmail'].forEach(function (key) {
    const el = els[key];
    if (!el) return;
    el.addEventListener('input', function () {
      state[key] = el.value;
      els.preview.innerHTML = W.renderCertHTML(state);
      W.saveState(state);
    });
  });

  document.querySelectorAll('[data-channel]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.channel = btn.getAttribute('data-channel');
      render();
    });
  });

  document.querySelectorAll('[data-timing]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      state.timing = btn.getAttribute('data-timing');
      render();
    });
  });

  if (els.sendDate) {
    els.sendDate.addEventListener('change', function () {
      state.sendDate = els.sendDate.value;
      W.saveState(state);
    });
  }
  if (els.sendTime) {
    els.sendTime.addEventListener('change', function () {
      state.sendTime = els.sendTime.value;
      W.saveState(state);
    });
  }

  if (els.openBtn) {
    els.openBtn.addEventListener('click', function () {
      W.saveState(state);
      window.location.href = 'open.html' + location.hash;
    });
  }

  if (els.pdfBtn) {
    els.pdfBtn.addEventListener('click', function () {
      state.channel = 'pdf';
      W.saveState(state);
      window.print();
    });
  }

  // Sensible demo defaults for first visit
  if (!state.message) {
    state.message = W.TEMPLATES[0].text;
  }
  if (!state.signature) state.signature = 'Максим';
  if (!state.recipientName) state.recipientName = 'Анна';
  if (!els.sendDate.value) {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    state.sendDate = d.toISOString().slice(0, 10);
    els.sendDate.value = state.sendDate;
  }

  render();
})();
