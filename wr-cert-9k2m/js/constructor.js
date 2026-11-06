(function () {
  'use strict';
  const W = window.WRCert, state = W.loadState(), $ = id => document.getElementById(id);
  const tags = {kitten:'котёнок',puppy:'щенок',cake:'торт',flowers:'цветы',sparkling:'игристое',stars:'звёзды'};
  const greetings = {
    'Подруга':'Пусть этот вечер будет только для тебя: огни Москвы, любимые вкусы и разговоры, которые не хочется заканчивать.',
    'Коллега':'Пусть за большим трудом последует прекрасный вечер. Время отложить дела и открыть для себя новые вкусы над Москвой.',
    'Девушка':'Хочу подарить тебе вечер ближе к звёздам. Пусть под стеклянным небом будет столько же тепла, сколько рядом с тобой.',
    'Сестра':'Для тебя — вечер без спешки, с любимыми людьми и маленькими открытиями. Пусть поводов улыбаться будет больше.',
    'Друг':'За новые истории, хорошие разговоры и вкус к жизни. Пусть этот вечер над Москвой станет одним из наших любимых.'
  };
  let completed = false, wheelTimer, wheelSyncUntil = 0, generation = 0;
  $('templates').innerHTML = Object.values(W.COVERS).map(c => `<button class="opt cover" data-cover="${c.id}" aria-label="${c.label}"><img src="${c.src}" alt="Готовый дизайн White Rabbit: ${c.label}"><span>${c.label}</span></button>`).join('');
  $('ai-tags').innerHTML = Object.entries(tags).map(([id,label])=>`<button class="chip" data-ai="${id}">${label}</button>`).join('');
  $('greeting-tags').innerHTML = Object.keys(greetings).map(label=>`<button class="tpl" data-greeting="${label}">${label}</button>`).join('');
  $('amount-wheel').innerHTML = Array.from({length:298},(_,i)=>{const n=(i+3)*1000;return `<button class="wheel-option" role="option" data-wheel="${n}" tabindex="-1">${n.toLocaleString('ru-RU')}</button>`}).join('');
  if (!state.sendDate) {
    const d=new Date(); d.setDate(d.getDate()+3);
    state.sendDate=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
  function selected(selector, key, value) {
    document.querySelectorAll(selector).forEach(b=>{const on=b.getAttribute(key)===String(value);b.classList.toggle('is-on',on);b.setAttribute('aria-pressed',on);});
  }
  function wheelToAmount() {
    wheelSyncUntil=performance.now()+250;
    $('amount-wheel').scrollTop=(Math.round(state.amount/1000)-3)*54;

  }
  function guide() {
    const options=[
      [5000,'Десерт и игристое / коктейли','Небольшой повод для красивой встречи.'],
      [10000,'Бранч','Неспешное начало дня над городом.'],
      [15000,'Основные блюда','Знакомство с сезонной кухней ресторана.'],
      [25000,'Ужин для двоих','Два места у панорамы, сезонное меню шефа.'],
      [27300,'Дегустационный сет «Золотая осень»','С винным сопровождением: 17 500 + 9 800 ₽.'],
      [45000,"Chef’s table",'Вечер за столом шефа.']
    ];
    const fitting=options.filter(o=>o[0]<=state.amount), best=fitting.at(-1);
    $('guide-title').textContent=best?best[1]:'Часть вашего будущего вечера';
    $('guide-detail').textContent=best?'≈ '+W.formatRub(best[0])+' · '+best[2]:'Сертификат можно использовать в счёт заказа. Ближайший ориентир: десерт и игристое / коктейли — около 5 000 ₽.';
  }
  function render() {
    $('cert-preview').innerHTML=W.renderCertHTML(state);
    [['[data-cover]','data-cover',state.cover],['[data-color]','data-color',state.color],['[data-shape].opt','data-shape',state.shape],['[data-amount]','data-amount',state.amount],['[data-channel]','data-channel',state.channel],['[data-timing]','data-timing',state.timing],['[data-font]','data-font',state.msgFont],['[data-ai]','data-ai',state.cover==='ai'?state.aiDesign:'']].forEach(a=>selected(...a));
    document.querySelectorAll('[data-screen]').forEach(el=>el.hidden=Number(el.dataset.screen)!==state.step);
    document.querySelectorAll('[data-step]').forEach(el=>{const n=Number(el.dataset.step);el.classList.toggle('current',n===state.step);el.classList.toggle('done',n<state.step);if(n===state.step)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
    const fields={'amount':W.formatRub(state.amount).replace(' ₽',''),'message':state.message,'signature':state.signature,'recipient-name':state.recipientName,'recipient-phone':state.recipientPhone,'recipient-email':state.recipientEmail,'send-date':state.sendDate,'send-time':state.sendTime,'buyer-phone':state.buyerPhone};
    Object.entries(fields).forEach(([id,value])=>{if(document.activeElement!==$(id))$(id).value=value;});
    $('phone-field').hidden=state.channel!=='sms';$('email-field').hidden=state.channel!=='email';
    $('when-fields').hidden=state.timing!=='later';
    $('counter').textContent=state.message.length+' / 300';
    const text=state.message||'Пусть этот вечер станет вашей любимой историей.';
    if($('greeting-animation').textContent!==text)$('greeting-animation').textContent=text;
    $('preview-title').textContent=state.step===3?'Пример дизайна':'Ваш сертификат';
    $('back').hidden=state.step===0;$('next').hidden=state.step===5;
    $('next').textContent=state.step===4?'К оплате →':'Далее →';
    const e=W.escapeHtml, cover=W.coverOf(state);
    $('order-summary').innerHTML=`<p class="eyebrow">Ваш подарок</p><h2>${e(cover.label)}</h2><div class="summary-price">${W.formatRub(state.amount)}</div><dl><dt>Получатель</dt><dd>${e(state.recipientName||'Не указан')}</dd><dt>Доставка</dt><dd>${state.channel==='sms'?'SMS':'PDF на почту'} · ${e((state.channel==='sms'?state.recipientPhone:state.recipientEmail)||'контакт не указан')}</dd><dt>Когда</dt><dd>${state.timing==='now'?'Сразу после оплаты':e(state.sendDate+' · '+state.sendTime+' МСК')}</dd></dl>`;
    document.querySelectorAll('[data-wheel]').forEach(b=>b.setAttribute('aria-selected',Number(b.dataset.wheel)===state.amount?'true':'false'));
    guide(); W.saveState(state);
  }
  function move(step) {
    if(step>state.step&&!validate())return;
    state.step=step;$('validation').textContent='';render();
    if(step===1)wheelToAmount();
    if(step===3){$('greeting-animation').classList.remove('animate');requestAnimationFrame(()=>$('greeting-animation').classList.add('animate'));}
    window.scrollTo({top:0,behavior:'instant'});
    document.querySelector(`[data-screen="${step}"] h1`).focus({preventScroll:true});
  }
  function validate() {
    let msg='';
    if(state.step===2) {
      if(!state.recipientName.trim())msg='Укажите имя получателя.';
      else if(state.channel==='sms'&&state.recipientPhone.replace(/\D/g,'').length<10)msg='Укажите телефон получателя (не менее 10 цифр).';
      else if(state.channel==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.recipientEmail))msg='Укажите корректную почту получателя.';
    }
    if(state.step===4&&state.timing==='later') {
      const planned=new Date(state.sendDate+'T'+state.sendTime+':00+03:00');
      if(!Number.isFinite(planned.getTime())||planned.getTime()<Date.now())msg='Выберите будущую дату и время по Москве.';
    }
    $('validation').textContent=msg;return !msg;
  }
  $('next').onclick=()=>move(Math.min(5,state.step+1));$('back').onclick=()=>move(Math.max(0,state.step-1));
  document.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>move(Number(b.dataset.step)));
  [['cover','cover'],['color','color'],['shape','shape'],['channel','channel'],['timing','timing'],['font','msgFont']].forEach(([attr,key])=>{
    document.querySelectorAll(`button[data-${attr}]`).forEach(b=>b.onclick=()=>{state[key]=b.getAttribute('data-'+attr);if(attr==='cover'){state.imageData='';generation++;}render();});
  });
  document.querySelectorAll('[data-amount]').forEach(b=>b.onclick=()=>{state.amount=Number(b.dataset.amount);render();wheelToAmount();});
  $('amount').oninput=()=>{const n=$('amount').value.replace(/\D/g,'');if(n){state.amount=W.clampAmount(n);render();wheelToAmount();}};
  $('amount').onblur=()=>{state.amount=W.clampAmount($('amount').value.replace(/\D/g,''));render();wheelToAmount();};
  const wheel=$('amount-wheel');
  wheel.addEventListener('scroll',()=>{if(performance.now()<wheelSyncUntil)return;clearTimeout(wheelTimer);wheelTimer=setTimeout(()=>{state.amount=W.clampAmount((Math.round(wheel.scrollTop/54)+3)*1000);render();},90);});
  wheel.addEventListener('click',ev=>{const b=ev.target.closest('[data-wheel]');if(b){state.amount=Number(b.dataset.wheel);render();wheelToAmount();}});
  wheel.tabIndex=0;
  wheel.addEventListener('keydown',ev=>{if(['ArrowUp','ArrowDown','Home','End'].includes(ev.key)){ev.preventDefault();state.amount=ev.key==='Home'?3000:ev.key==='End'?300000:W.clampAmount(state.amount+(ev.key==='ArrowDown'?1000:-1000));render();wheelToAmount();}});
  const binds={'message':'message','signature':'signature','recipient-name':'recipientName','recipient-phone':'recipientPhone','recipient-email':'recipientEmail','send-date':'sendDate','send-time':'sendTime','buyer-phone':'buyerPhone'};
  Object.entries(binds).forEach(([id,key])=>$(id).addEventListener('input',()=>{state[key]=$(id).value;render();}));
  document.querySelectorAll('[data-ai]').forEach(b=>b.onclick=()=>{$('ai-prompt').value=tags[b.dataset.ai];selected('[data-ai]','data-ai',b.dataset.ai);});
  $('generate').onclick=async()=>{
    const prompt=$('ai-prompt').value.trim()||'звёзды',token=++generation;
    $('generate').disabled=true;$('generate').textContent='Создаём…';$('ai-status').textContent='Подбираем образ для вашего особенного вечера…';
    await new Promise(resolve=>setTimeout(resolve,1100));
    if(token===generation){state.aiDesign=/кот|кош|kitten|cat/i.test(prompt)?'kitten':/щен|собак|puppy|dog/i.test(prompt)?'puppy':/торт|cake/i.test(prompt)?'cake':/цвет|flower/i.test(prompt)?'flowers':/игрист|шампан|champagne/i.test(prompt)?'sparkling':'stars';state.cover='ai';state.imageData='';state.aiPrompt=prompt;render();$('ai-status').textContent='Готово — дизайн на вашей карте. Демо: использован готовый образ, не живая генерация.';}
    $('generate').disabled=false;$('generate').textContent='Сгенерировать';
  };
  $('upload').onchange=()=>{
    const file=$('upload').files[0];if(!file)return;
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>3*1024*1024){$('upload-status').textContent='Выберите JPG, PNG или WebP размером до 3 МБ.';$('upload').value='';return;}
    const reader=new FileReader();reader.onerror=()=>$('upload-status').textContent='Не удалось прочитать файл. Попробуйте другой.';
    reader.onload=()=>{const img=new Image();img.onerror=()=>$('upload-status').textContent='Файл не похож на изображение.';img.onload=()=>{const canvas=document.createElement('canvas'),scale=Math.min(1,1400/img.width,1400/img.height);canvas.width=Math.round(img.width*scale);canvas.height=Math.round(img.height*scale);canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);state.imageData=canvas.toDataURL('image/jpeg',.85);state.cover='upload';generation++;render();$('upload-status').textContent='Ваш дизайн применён. Изображение сохранено в текущей сессии.';};img.src=reader.result;};reader.readAsDataURL(file);
  };
  function animateGreeting(){render();$('greeting-animation').classList.remove('animate');requestAnimationFrame(()=>$('greeting-animation').classList.add('animate'));}
  document.querySelectorAll('[data-greeting]').forEach(b=>b.onclick=()=>{state.message=greetings[b.dataset.greeting];animateGreeting();selected('[data-greeting]','data-greeting',b.dataset.greeting);});
  let textIndex=0;
  $('generate-text').onclick=()=>{const phrases=['Пусть этот вечер подарит новые вкусы, тёплые разговоры и Москву, сияющую только для вас.','Иногда лучший подарок — время для себя. Насладитесь прекрасным вечером под стеклянным небом.','Пусть за этим столом рождаются счастливые воспоминания. Вас ждёт вечер открытий над Москвой.'];state.message=(state.recipientName?state.recipientName+', ':'')+phrases[textIndex++%phrases.length];animateGreeting();};
  $('pay').onclick=()=>{if(completed)return;if(state.buyerPhone.replace(/\D/g,'').length<10){$('validation').textContent='Укажите телефон покупателя (не менее 10 цифр). Для проверки можно использовать тестовый номер.';return;}completed=true;$('validation').textContent='';$('checkout').hidden=true;$('success').hidden=false;};
  $('btn-open').onclick=()=>{W.saveState(state);location.href='open.html'+location.hash;};
  $('btn-pdf').onclick=()=>window.print();
  render();if(state.step===1)wheelToAmount();
})();
