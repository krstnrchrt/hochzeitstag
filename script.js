(() => {
  'use strict';

  const CFG = Object.assign({
    names: { groom: 'Андрей', bride: 'Ольга' },
    village: 'Есиль',
    city: 'Düsseldorf',
    message: '',
    signature: 'Eure Kinder - Helena, Thomas, Kristina & Sayon',
    music: 'music.mp3'
  }, window.CONFIG || {});
  const PHOTOS = Array.isArray(window.PHOTOS) ? window.PHOTOS : [];
  const ICONS = window.ICONS || {};
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  // ---------- Daten ----------
  const now = new Date();
  const years = now.getFullYear() - 1989 - (now < new Date(now.getFullYear(), 9, 21) ? 1 : 0);
  const days = Math.floor(
    (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) - Date.UTC(1989, 9, 21)) / 864e5
  );
  const coupleNames = `${CFG.names.groom} & ${CFG.names.bride}`;

  const fills = {
    names: coupleNames,
    years,
    days: days.toLocaleString('de-DE'),
    year: 1989 + years,
    village: CFG.village,
    villageUpper: CFG.village.toUpperCase(),
    city: CFG.city,
    signature: CFG.signature
  };
  $$('[data-fill]').forEach((el) => { el.textContent = fills[el.dataset.fill] ?? ''; });
  $$('[data-icon]').forEach((el) => { el.innerHTML = ICONS[el.dataset.icon] || ''; });
  document.title = `Alles Gute zum ${years}. Hochzeitstag, ${coupleNames}!`;

  // ---------- Deko ----------
  const FLOATERS = [
    ['tulip', 7, 9], ['apple', 82, 7], ['sputnik', 46, 4], ['sunflower', 4, 40], ['samovar', 88, 36],
    ['yurt', 8, 76], ['birch', 86, 70], ['house', 30, 90], ['dombra', 64, 89], ['matryoshka', 92, 90],
    ['heart', 20, 22], ['star', 74, 22]
  ];
  const floaters = $('.floaters');
  FLOATERS.forEach(([name, left, top], i) => {
    const s = document.createElement('span');
    s.innerHTML = ICONS[name] || '';
    s.style.left = `calc(${left}% - 18px)`;
    s.style.top = `${top}%`;
    s.style.animationDelay = `${-i * 0.7}s`;
    floaters.appendChild(s);
  });

  const ROW = ['tulip', 'apple', 'yurt', 'samovar', 'dombra', 'heart', 'house', 'sunflower', 'train', 'birch', 'cake', 'matryoshka', 'sputnik', 'star'];
  const row = $('.icon-row');
  ROW.forEach((name, i) => {
    const s = document.createElement('span');
    s.innerHTML = ICONS[name] || '';
    s.style.setProperty('--i', i);
    row.appendChild(s);
  });

  // ---------- Nachricht ----------
  const msgEl = $('#message');
  const msg = (CFG.message || '').trim();
  msgEl.textContent = msg || 'Platzhalter für eure Nachricht';
  if (!msg || /platzhalter/i.test(msg)) msgEl.classList.add('placeholder');

  // ---------- Fotofilm: Serienbilder schnell hintereinander wie ein Daumenkino ----------
  const REEL_FIRST = 1000, REEL_STEP = 480, REEL_LAST = 2800;
  const reelStage = $('#reelStage');
  const reelBar = $('#reelBar');
  let reelImgs = [];
  let reelTimer = 0;
  let reelDone = null;

  function loadReel() {
    if (reelImgs.length || !PHOTOS.length) return;
    reelImgs = PHOTOS.map((p) => {
      const img = new Image();
      img.src = p.src;
      img.alt = '';
      img.decoding = 'async';
      img.addEventListener('load', () => {
        if (img.naturalHeight > img.naturalWidth) img.classList.add('portrait');
      });
      reelStage.appendChild(img);
      return img;
    });
  }
  function reelDuration(i) {
    if (i === 0) return REEL_FIRST;
    return i === reelImgs.length - 1 ? REEL_LAST : REEL_STEP;
  }
  function playReel(onDone) {
    loadReel();
    reelDone = onDone;
    $$('.screen').forEach((s) => { s.hidden = s.id !== 'reel'; });
    window.scrollTo(0, 0);
    const total = reelImgs.reduce((a, _, i) => a + reelDuration(i), 0);
    let i = 0;
    reelBar.style.transition = 'none';
    reelBar.style.width = '0';
    void reelBar.offsetWidth;
    reelBar.style.transition = `width ${total}ms linear`;
    reelBar.style.width = '100%';
    const step = () => {
      reelImgs.forEach((img, k) => img.classList.toggle('on', k === i));
      if (i === reelImgs.length - 1) { reelTimer = setTimeout(endReel, reelDuration(i)); return; }
      reelTimer = setTimeout(() => { i++; step(); }, reelDuration(i));
    };
    clearTimeout(reelTimer);
    step();
  }
  function endReel() {
    clearTimeout(reelTimer);
    const cb = reelDone;
    reelDone = null;
    if (cb) cb();
  }
  $('#reelSkip').addEventListener('click', endReel);
  if (PHOTOS.length) {
    $('#replayReel').hidden = false;
    $('#replayReel').addEventListener('click', () => playReel(() => showCard(false)));
  }

  // ---------- Musik ----------
  const audio = $('#music');
  const musicBtn = $('#musicBtn');
  let musicStarted = false;
  function startMusic() {
    if (musicStarted || !CFG.music) return;
    musicStarted = true;
    audio.src = CFG.music;
    audio.volume = 0.7;
    const p = audio.play();
    if (p) p.catch(() => {});
  }
  audio.addEventListener('playing', () => { musicBtn.hidden = false; musicBtn.classList.remove('muted'); });
  audio.addEventListener('pause', () => musicBtn.classList.add('muted'));
  musicBtn.addEventListener('click', () => {
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  });

  // ---------- Konfetti ----------
  const CONFETTI = ['#c8102e', '#f2c14e', '#1f6fb0', '#3b7d3a', '#fffaf0', '#e8467c'];
  function confetti(n) {
    const box = $('#confetti');
    for (let i = 0; i < n; i++) {
      const c = document.createElement('i');
      c.style.left = `${Math.random() * 100}vw`;
      c.style.background = CONFETTI[i % CONFETTI.length];
      c.style.width = `${6 + Math.random() * 6}px`;
      c.style.height = `${8 + Math.random() * 8}px`;
      c.style.animationDuration = `${2.6 + Math.random() * 2.6}s`;
      c.style.animationDelay = `${Math.random() * 0.8}s`;
      c.style.setProperty('--x', `${Math.random() * 160 - 80}px`);
      c.style.setProperty('--rot', `${360 + Math.random() * 720}deg`);
      c.addEventListener('animationend', () => c.remove());
      box.appendChild(c);
    }
  }

  // ---------- Umschlag ----------
  const envelope = $('#envelope');
  let opened = false;
  envelope.addEventListener('click', () => {
    if (opened) return;
    opened = true;
    startMusic();
    loadReel();
    envelope.classList.add('open');
    $('.intro-hint').style.visibility = 'hidden';
    confetti(60);
    setTimeout(() => $('#intro').classList.add('leaving'), 1800);
    setTimeout(() => { $('#intro').hidden = true; showStory(); }, 2500);
  });

  // =====================================================================
  //  Pixel-Animation (160 × 120 Pixel, per CSS hochskaliert)
  // =====================================================================
  const canvas = $('#stage');
  const ctx = canvas.getContext('2d');
  const W = 160, H = 120;
  let NIGHT = false;

  function rect(x, y, w, h, c) {
    ctx.fillStyle = c;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }
  function px(x, y, c) { rect(x, y, 1, 1, c); }
  function sprite(rows, x, y, pal, s = 1) {
    x = Math.round(x); y = Math.round(y);
    for (let j = 0; j < rows.length; j++) {
      const r = rows[j];
      for (let i = 0; i < r.length; i++) {
        const c = pal[r[i]];
        if (!c) continue;
        ctx.fillStyle = c;
        ctx.fillRect(x + i * s, y + j * s, s, s);
      }
    }
  }
  function disc(cx, cy, r, c) {
    for (let dy = -r; dy <= r; dy++) {
      const w = Math.round(Math.sqrt(r * r - dy * dy));
      rect(cx - w, cy + dy, w * 2 + 1, 1, c);
    }
  }
  function line(x0, y0, x1, y1, c) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    ctx.fillStyle = c;
    for (let n = 0; n < 400; n++) {
      ctx.fillRect(x0, y0, 1, 1);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }
  function rng(seed) {
    let s = seed;
    return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  }
  const mod = (a, n) => ((a % n) + n) % n;

  // ---------- Figuren ----------
  // Hauttöne: Familie hell, Schwiegersohn dunkler
  const SKIN = { s: '#f6d3b3', p: '#eaa08a', e: '#2b1d16', k: '#2b1d16' };
  const P = {
    dadWed: { ...SKIN, h: '#3d2414', b: '#2e3b5e', w: '#fffaf0', r: '#c8102e', l: '#2e3b5e' },
    dad: { ...SKIN, h: '#3d2414', b: '#7a3b2e', w: '#e9dcc0', r: '#7a3b2e', l: '#3b3b4a' },
    momWed: { ...SKIN, h: '#6b3f22', i: '#8a5732', c: '#fffaf0', g: '#d9cfbd' },
    mom: { ...SKIN, h: '#6b3f22', i: '#8a5732', c: '#3a6fb0' },
    // heute – wie auf den Fotos: Mama hellblond glänzend im weinroten Oberteil, Papa im hellen Hemd mit Jeans
    momToday: { ...SKIN, h: '#f2d78e', i: '#fff6d2', c: '#9e1b32' },
    dadToday: { ...SKIN, h: '#b9b4ab', b: '#c3cede', w: '#e9eef5', r: '#c3cede', l: '#2f4a7a' },
    helena: { ...SKIN, h: '#4e2c14', c: '#c8102e' },
    helenaGrown: { ...SKIN, h: '#4e2c14', c: '#2f8a6a' },
    kristina: { ...SKIN, h: '#7a4a2a', c: '#f2b630' },
    kristinaGrown: { ...SKIN, h: '#7a4a2a', c: '#9d88b9' },
    thomasGrown: { ...SKIN, h: '#e6c25a', b: '#3a6fb0', w: '#fffaf0', r: '#3a6fb0', l: '#3b3b4a' },
    sayon: { s: '#dcab84', p: '#cf9670', e: '#1a110c', k: '#1a110c', h: '#16110e', b: '#9fb6cf', w: '#dfe8f2', r: '#9fb6cf', l: '#2e3b5e' }
  };
  // Köpfe werden über den Körper gelegt, lange Haare reichen bis über die Schultern.
  const HEAD = {
    shortCurly: ['..h.h.h..', '.hhhhhhh.', '.hsssssh.', '..seses..', '..psssp..', '...sss...'],
    shortBlond: ['...hhhh..', '..hhhhhh.', '..hhsss..', '..seses..', '..psssp..', '...sss...'],
    curlyMedium: ['.h.h.h.h.', 'hhhhhhhhh', 'hhssssshh', 'hhseseshh', 'hhpsssphh', 'h..sss..h', 'h.......h'],
    longCurly: ['..hhhhh..', '.hhiihhh.', 'hhssssshh', 'hhseseshh', 'hhpsssphh', 'hi.sss.hh', '.h.....i.', 'h.......h', '.h.....h.'],
    veryCurly: ['.h.h.h.h.', 'hhhhhhhhh', 'hhssssshh', 'hhseseshh', 'hhpsssphh', 'hhhssshhh', 'hh.....hh', '.h.....h.'],
    mediumCurl: ['...hhh...', '..hhhhhh.', '.hssssshh', '.hseseshh', '.hpsssphh', '.hhssshh.', 'h.......h']
  };
  const BODY_MAN = ['.bbbwbbb.', 'bbbbrbbbb', 'bbbbrbbbb', 'sbbbbbbbs', '.bbbbbbb.', '..bbbbb..'];
  const MAN_LEGS = [
    ['..ll.ll..', '..ll.ll..', '..ll.ll..', '.kkk.kkk.'],
    ['...lll...', '..ll.ll..', '.ll...ll.', 'kkk...kkk']
  ];
  const BODY_WOMAN = ['..ccccc..', '.ccccccc.', '.scccccs.', '..ccccc..', '..ccccc..', '.ccccccc.'];
  const WOMAN_HEM = [
    ['.ccccccc.', 'ccccccccc', 'ccccccccc', '..k...k..'],
    ['cccccccc.', '.cccccccc', 'cccccccc.', '.k....k..']
  ];
  const GOWN_HEM = [
    ['.ccccccc.', 'ccccccccc', 'ccccccccc', 'ggggggggg'],
    ['cccccccc.', '.cccccccc', 'cccccccc.', 'ggggggggg']
  ];
  // Helena mit 4 (sehr lockig), Kristina mit 8 (mittellange Locken)
  const TODDLER_CURLY = ['.h.h.h.', 'hhhhhhh', 'hsesesh', 'hhssshh', '..ccc..', '.scccs.', '.ccccc.', '..k.k..'];
  const KID_MEDIUM = ['..hhh..', '.hhhhhh', 'hsssssh', 'hsesesh', 'hpsssph', 'h.sss.h', '..ccc..', '.ccccc.', 'scccccs', '.ccccc.', '.k...k.'];
  const TEEN_HEM = ['.ccccccc.', 'ccccccccc', '..k...k..'];
  const HEART = ['.r.r.', 'rrrrr', '.rrr.', '..r..'];
  const BIG_HEART = ['.rr.rr.', 'rrrrrrr', 'rrrrrrr', '.rrrrr.', '..rrr..', '...r...'];
  const EAGLE = [['k.....k', '.k...k.', '..kkk..'], ['.......', 'kkkkkkk', '..k.k..']];
  const STORK = [['kk...kk', '.wwwwwwr', '...r...'], ['.......', 'kwwwwwwr', 'k..r..k']];
  const DIGITS = {
    0: ['111', '101', '101', '101', '111'], 1: ['010', '110', '010', '010', '111'],
    2: ['111', '001', '111', '100', '111'], 3: ['111', '001', '111', '001', '111'],
    4: ['101', '101', '111', '001', '001'], 5: ['111', '100', '111', '001', '111'],
    6: ['111', '100', '111', '101', '111'], 7: ['111', '001', '010', '010', '010'],
    8: ['111', '101', '111', '101', '111'], 9: ['111', '101', '111', '001', '111']
  };

  function man(x, y, head, pal, f = 0) {
    y -= f;
    sprite(BODY_MAN, x, y + 6, pal);
    sprite(MAN_LEGS[f], x, y + 12, pal);
    sprite(head, x, y, pal);
  }
  function woman(x, y, head, pal, f = 0, gown = false) {
    y -= f;
    sprite(BODY_WOMAN, x, y + 6, pal);
    sprite((gown ? GOWN_HEM : WOMAN_HEM)[f], x, y + 12, pal);
    sprite(head, x, y, pal);
  }
  // Helena mit 12: etwas kleiner als die Erwachsenen (14 statt 16 Pixel)
  function teen(x, y, head, pal) {
    sprite(BODY_WOMAN.slice(0, 5), x, y + 6, pal);
    sprite(TEEN_HEM, x, y + 11, pal);
    sprite(head, x, y, pal);
  }
  function bride(x, y, f = 0) {
    woman(x, y, HEAD.longCurly, P.momWed, f, true);
    y -= f;
    rect(x + 2, y - 1, 5, 1, '#fff'); px(x + 1, y, '#fff'); px(x + 7, y, '#fff');
    for (let i = 0; i < 9; i++) px(x + 8, y + 1 + i, i % 2 ? '#efe9dc' : '#fff');
    px(x + 4, y + 6, '#c8102e'); px(x + 3, y + 7, '#c8102e'); px(x + 4, y + 7, '#f2b630');
    px(x + 5, y + 7, '#e8467c'); px(x + 4, y + 8, '#3b7d3a');
  }
  function babyBundle(x, y) {
    rect(x + 2, y, 5, 3, '#f4b6c8'); rect(x + 2, y, 5, 1, '#f9d3de');
    rect(x, y, 3, 3, SKIN.s); px(x, y, '#7a4a2a'); px(x + 1, y + 1, SKIN.e);
  }
  function pram(x, y) {
    line(x + 10, y + 3, x + 13, y - 1, '#555'); rect(x + 12, y - 2, 3, 1, '#555');
    rect(x, y + 3, 11, 5, '#3a6fb0'); rect(x, y + 3, 11, 1, '#5b8fd0');
    rect(x, y, 4, 3, '#2c5a94'); rect(x + 1, y - 1, 3, 1, '#2c5a94');
    rect(x + 5, y + 1, 3, 2, SKIN.s); px(x + 6, y, '#e6c25a'); px(x + 5, y + 1, '#e6c25a'); px(x + 7, y + 2, SKIN.e);
    disc(x + 2, y + 9, 1, '#222'); disc(x + 8, y + 9, 1, '#222');
  }
  function popIn(t, dur = 0.5, height = 5) {
    return t < dur ? Math.round(Math.sin((t / dur) * Math.PI) * height) : 0;
  }
  function number(str, x, y, s, c) {
    String(str).split('').forEach((d, i) => sprite(DIGITS[d] || [], x + i * 4 * s, y, { 1: c }, s));
  }

  // ---------- Kulissen ----------
  const DAY_SKY = ['#4a9fd8', '#68b3e0', '#8bc6e8', '#b2dbef'];
  const NIGHT_SKY = ['#0b1230', '#121c42', '#1b2856', '#27366a'];
  function sky(pal) {
    const hs = [16, 16, 16, 14];
    let y = 0;
    for (let i = 0; i < 4; i++) {
      rect(0, y, W, hs[i], pal[i]);
      if (i > 0) for (let x = i % 2; x < W; x += 2) px(x, y, pal[i - 1]);
      y += hs[i];
    }
  }
  function sun(x, y) { disc(x, y, 8, '#fff1b8'); disc(x, y, 6, '#ffd34e'); }
  function moon(x, y) { disc(x, y, 6, '#fff6d5'); disc(x + 3, y - 2, 5, NIGHT_SKY[0]); }
  function cloud(x, y) {
    rect(x + 3, y, 8, 2, '#fff'); rect(x, y + 2, 16, 3, '#fff');
    rect(x + 11, y + 1, 4, 2, '#fff'); rect(x + 1, y + 5, 14, 1, '#e3f1f8');
  }
  function stars(t) {
    const r = rng(3);
    for (let i = 0; i < 45; i++) {
      const x = r() * W, y = r() * 58, ph = r() * 6;
      if (Math.sin(t * 3 + ph) > -0.3) px(x, y, '#fff6d5');
    }
  }
  function yurt(x, y) {
    rect(x + 3, y, 6, 1, '#f6f0e2'); rect(x + 1, y + 1, 10, 2, '#f6f0e2'); rect(x, y + 3, 12, 5, '#f6f0e2');
    rect(x, y + 4, 12, 1, '#c8102e'); rect(x + 5, y + 5, 2, 3, '#c8102e'); px(x + 6, y - 1, '#f2b630');
  }
  function win(x, y) {
    const glass = NIGHT ? '#ffd76a' : '#bfe3f2';
    rect(x - 2, y, 2, 7, '#3a6fb0'); rect(x + 7, y, 2, 7, '#3a6fb0');
    rect(x, y, 7, 7, '#3a6fb0'); rect(x + 1, y + 1, 5, 5, glass);
    rect(x + 3, y + 1, 1, 5, '#3a6fb0'); rect(x + 1, y + 3, 5, 1, '#3a6fb0');
  }
  function house(x, y, roof, wall = '#f3eee2') {
    rect(x + 24, y - 1, 3, 5, '#9b5a3c');
    for (let i = 0; i < 9; i++) { const ins = 8 - i; rect(x - 2 + ins, y + 1 + i, 38 - 2 * ins, 1, roof); }
    rect(x - 2, y + 9, 38, 1, 'rgba(0,0,0,.25)');
    rect(x, y + 10, 34, 16, wall);
    rect(x, y + 25, 34, 1, 'rgba(0,0,0,.15)');
    win(x + 4, y + 13); win(x + 23, y + 13);
    rect(x + 14, y + 15, 6, 11, '#7a4a2a'); px(x + 18, y + 20, '#f2b630');
  }
  function flag(x, y, t) {
    rect(x, y, 1, 13, '#5a4a3a');
    for (let i = 0; i < 7; i++) rect(x + 1 + i, y + Math.round(Math.sin(t * 5 + i * 0.8) * 0.7), 1, 5, '#c8102e');
    px(x + 2, y + 1, '#f2b630');
  }
  function fence(x, y, len, c = '#8a5a34') {
    for (let i = 0; i < len; i += 3) rect(x + i, y, 1, 8, c);
    rect(x, y + 2, len, 1, c); rect(x, y + 5, len, 1, c);
  }
  function sunflower(x, y) {
    rect(x + 2, y + 5, 1, 9, '#3b7d3a'); px(x + 3, y + 8, '#4f9a45'); px(x + 1, y + 10, '#4f9a45');
    rect(x, y + 1, 5, 3, '#f2b630'); rect(x + 1, y, 3, 5, '#f2b630'); rect(x + 1, y + 1, 3, 3, '#6b3e1f');
  }
  function birchTrunk(x, y) {
    rect(x, y + 12, 3, 28, '#f4f1ea');
    for (const k of [15, 20, 26, 31, 36]) { px(x + (k % 2), y + k, '#2b1d16'); px(x + 1 + (k % 2), y + k, '#2b1d16'); }
  }
  function birch(x, y, leaves = ['#e2b23a', '#d49a2a', '#ecc552']) {
    disc(x + 1, y + 8, 8, leaves[0]); disc(x - 4, y + 12, 5, leaves[1]); disc(x + 7, y + 13, 5, leaves[2]);
    birchTrunk(x, y);
  }
  function bareBirch(x, y) {
    const c = '#8a7a6a';
    line(x + 1, y + 16, x - 6, y + 5, c); line(x + 1, y + 20, x + 9, y + 8, c);
    line(x - 3, y + 11, x - 5, y + 3, c); line(x + 6, y + 12, x + 11, y + 6, c); line(x + 1, y + 13, x + 2, y + 1, c);
    birchTrunk(x, y);
    px(x - 6, y + 4, '#fff'); px(x + 9, y + 7, '#fff'); px(x + 2, y, '#fff');
  }
  function snowRoof(x, y) {
    for (let i = 0; i < 3; i++) { const ins = 8 - i; rect(x - 2 + ins, y + 1 + i, 38 - 2 * ins, 1, '#fbfdff'); }
    rect(x + 24, y - 2, 3, 1, '#fff');
  }
  function chimneySmoke(x, y, t) {
    for (let i = 0; i < 4; i++) {
      const p = mod(t * 0.5 + i / 4, 1);
      disc(x + p * 6, y - p * 14, 1 + Math.round(p * 2), '#e8eef3');
    }
  }
  function well(x, y, t) {
    rect(x, y, 2, 24, '#7a4a2a');
    const a = -0.35 + Math.sin(t * 0.8) * 0.12;
    const cx = x + 1, cy = y + 1, dx = Math.cos(a), dy = Math.sin(a);
    const ex = cx + dx * 18, ey = cy + dy * 18;
    line(cx - dx * 9, cy - dy * 9, ex, ey, '#5a3d24');
    line(ex, ey, ex, y + 12, '#3b2a1e');
    rect(ex - 1, y + 12, 3, 3, '#6b6b6b');
    rect(x + 13, y + 15, 10, 8, '#9b6a3c'); rect(x + 13, y + 15, 10, 1, '#6b4a2e');
  }
  function eagle(x, y, f) { sprite(EAGLE[f], x, y, { k: '#4a2c17' }); }
  function stork(x, y, f) { sprite(STORK[f], x, y, { k: '#222', w: '#fff', r: '#e0402a' }); }
  function appleTree(x, y) {
    rect(x + 2, y + 12, 3, 16, '#6b3e1f');
    disc(x + 3, y + 8, 9, NIGHT ? '#244a24' : '#3f8a3a');
    disc(x - 1, y + 5, 4, NIGHT ? '#2c5a2c' : '#4f9a45');
    for (const [ax, ay] of [[0, 6], [5, 3], [8, 9], [2, 11], [-3, 9], [6, 13]]) px(x + 3 + ax - 3, y + ay, '#d7263d');
  }
  function brandenburgerTor(x, y) {
    rect(x + 11, y - 8, 4, 3, '#3f6b5a'); rect(x + 9, y - 5, 8, 2, '#3f6b5a');
    rect(x + 3, y - 3, 20, 3, '#d9c79a');
    rect(x, y, 26, 4, '#d9c79a'); rect(x, y + 3, 26, 1, '#b8a575');
    for (let i = 0; i < 6; i++) rect(x + 1 + Math.round(i * 4.6), y + 4, 2, 22, '#d9c79a');
    rect(x - 1, y + 25, 28, 2, '#b8a575');
  }
  function fernsehturm(x) {
    rect(x, 40, 3, 52, '#cfd3d8');
    disc(x + 1, 47, 5, '#b9bec4'); rect(x - 4, 47, 11, 1, '#8e959c');
    rect(x + 1, 26, 1, 16, '#e9eef5'); px(x + 1, 27, '#c8102e'); px(x + 1, 32, '#c8102e');
  }
  function rheinturm(x, top = 22) {
    rect(x, top + 24, 4, 70, '#e6e8eb'); rect(x + 1, top + 24, 1, 70, '#c9cdd2');
    rect(x - 2, top + 14, 8, 2, '#c9cdd2');
    rect(x - 3, top + 16, 10, 6, '#a3acb6'); rect(x - 3, top + 18, 10, 1, NIGHT ? '#ffd76a' : '#4a5560');
    for (let i = 0; i < 14; i += 2) rect(x + 1, top + i, 2, 2, i % 4 ? '#fff' : '#c8102e');
  }

  // ---------- Dorf in Kasachstan (Herbst, Winter oder Sommer) ----------
  const WINTER_SKY = ['#8fb4cc', '#a3c2d6', '#b8d0df', '#cfdfe9'];
  const SUMMER_BIRCH = ['#4f9a45', '#3f8a3a', '#62ad52'];
  function villageBg(t, season) {
    NIGHT = false;
    const winter = season === 'winter';
    sky(winter ? WINTER_SKY : DAY_SKY);
    if (!winter) sun(132, 16);
    cloud(mod(t * 4 + 10, 200) - 30, 8); cloud(mod(t * 3 + 110, 200) - 30, 22);
    if (!winter) eagle(-10 + t * 18, 30 + Math.sin(t * 2) * 2, Math.floor(t * 4) % 2);

    rect(0, 62, W, 8, winter ? '#dfe8ef' : '#cdb36a');
    yurt(94, 56); yurt(108, 57);
    rect(0, 70, W, 50, winter ? '#eef3f7' : '#dcc47c');
    const r = rng(11);
    for (let i = 0; i < 70; i++) {
      px(r() * W, 71 + r() * 48, winter ? (i % 3 ? '#dbe4ec' : '#cbd6e0') : (i % 3 ? '#c4a95c' : '#b0904a'));
    }

    house(4, 64, '#3f7f6e');
    well(76, 64, t);
    if (winter) bareBirch(56, 50);
    else if (season === 'summer') birch(56, 50, SUMMER_BIRCH);
    else birch(56, 50);
    house(120, 66, '#9a4434');
    flag(137, 53, t);
    fence(40, 80, 78);
    if (winter) {
      snowRoof(4, 64); snowRoof(120, 66);
      chimneySmoke(29, 61, t); chimneySmoke(145, 63, t + 1);
      for (let i = 0; i < 78; i += 3) px(40 + i, 79, '#fff');
    } else {
      sunflower(42, 72); sunflower(104, 73); sunflower(110, 71);
    }

    rect(0, 100, W, 6, winter ? '#dde4ea' : '#c49a63');
    const r2 = rng(5);
    for (let i = 0; i < 25; i++) px(r2() * W, 100 + r2() * 6, winter ? '#c9d3dc' : '#a8814f');

    if (winter) {
      const rs = rng(77);
      for (let i = 0; i < 50; i++) {
        const x0 = rs() * W, sp = 8 + rs() * 10, ph = rs() * 120;
        px(mod(x0 + Math.sin(t * 1.5 + i) * 3, W), mod(ph + t * sp, H), '#fff');
      }
    } else if (season === 'autumn') {
      // fallende Birkenblätter
      const r4 = rng(41);
      for (let i = 0; i < 8; i++) {
        const ph = r4() * 6, sp = 5 + r4() * 4;
        px(52 + r4() * 20 + Math.sin(t * 2 + ph) * 3, 60 + mod(t * sp + ph * 6, 44), '#e2b23a');
      }
    }
  }

  // ---------- Szene 1: Hochzeit im Dorf ----------
  const CONF_PX = ['#c8102e', '#f2b630', '#fff', '#1f6fb0', '#e8467c', '#4f9a45'];
  function sceneWedding(t) {
    villageBg(t, 'autumn');
    const walk = Math.min(t / 3.2, 1);
    const f = walk < 1 ? Math.floor(t * 6) % 2 : 0;
    let gx = -12 + 78 * walk, bx = 172 - 92 * walk;
    if (t > 4) { const k = Math.min((t - 4) / 0.6, 1); gx += 2 * k; bx -= 2 * k; }
    man(gx, 88, HEAD.shortCurly, P.dadWed, f);
    bride(bx, 88, f);

    if (t > 4.4) {
      for (let k = 0; k < 6; k++) {
        const p = t - 4.4 - k * 0.55;
        if (p > 0 && p < 4.5) sprite(HEART, 75 + Math.sin(p * 3 + k) * 5, 82 - p * 14, { r: '#e8264a' });
      }
    }
    if (t > 4.6) {
      const r3 = rng(23);
      for (let i = 0; i < 55; i++) {
        const x0 = r3() * W, sp = 14 + r3() * 18, st = 4.6 + r3() * 2;
        const y = -4 + (t - st) * sp;
        if (y > -4 && y < H) px(x0 + Math.sin(t * 3 + i) * 3, y, CONF_PX[i % CONF_PX.length]);
      }
    }
  }

  // ---------- Szene 2 + 3: Helena (März 1991) und Kristina (Juni 1995) ----------
  function newbornInArms(t, start) {
    if (t < start) return;
    const a = t - start;
    babyBundle(81, 95 - popIn(a, 0.4, 3));
    if (a < 1.8) sprite(HEART, 83, 86 - a * 10, { r: '#e8264a' });
  }
  function sceneHelena(t) {
    villageBg(t, 'winter');
    man(60, 88, HEAD.shortCurly, P.dad);
    woman(80, 88, HEAD.longCurly, P.mom);
    newbornInArms(t, 1.2);
  }
  function sceneKristina(t) {
    villageBg(t, 'summer');
    man(56, 88, HEAD.shortCurly, P.dad);
    sprite(TODDLER_CURLY, 68, 96, P.helena);
    woman(80, 88, HEAD.longCurly, P.mom);
    newbornInArms(t, 1.2);
  }

  // ---------- Szene 2: Zugfahrt ----------
  function carriage(x, y, passengers, t) {
    rect(x + 1, y - 2, 42, 2, '#6b6b6b');
    rect(x, y, 44, 16, '#2f6b3a'); rect(x, y + 11, 44, 1, '#f2b630');
    for (let i = 0; i < 5; i++) rect(x + 3 + i * 8, y + 3, 6, 6, '#bfe3f2');
    if (passengers) {
      // Papa, Mama, Tochter mit Locken und das Baby
      const hy = y + 4;
      const head = (hx, hair, long) => {
        rect(hx + 1, hy, 3, 1, hair); px(hx, hy + 1, hair); px(hx + 4, hy + 1, hair);
        if (long) { px(hx, hy + 2, hair); px(hx + 4, hy + 2, hair); px(hx, hy + 3, hair); px(hx + 4, hy + 3, hair); }
        rect(hx + 1, hy + 1, 3, 3, SKIN.s); px(hx + 1, hy + 2, SKIN.e); px(hx + 3, hy + 2, SKIN.e);
      };
      head(x + 19, P.dad.h, false);
      head(x + 27, P.mom.h, true);
      rect(x + 35, y + 4, 4, 1, P.helena.h); px(x + 35, y + 5, P.helena.h); px(x + 38, y + 5, P.helena.h); px(x + 35, y + 6, P.helena.h);
      rect(x + 36, y + 5, 2, 3, SKIN.s); px(x + 36, y + 6, SKIN.e);
      rect(x + 39, y + 7, 2, 1, '#f4b6c8'); px(x + 39, y + 6, SKIN.s);
      if (Math.floor(t * 4) % 2) px(x + 32, y + 3, SKIN.s); else px(x + 32, y + 4, SKIN.s);
    }
    disc(x + 9, y + 17, 2, '#222'); disc(x + 35, y + 17, 2, '#222');
    rect(x - 4, y + 12, 4, 1, '#333');
  }
  function loco(x, y, t) {
    rect(x - 1, y - 5, 16, 2, '#5a1015');
    rect(x, y - 3, 14, 19, '#8e1b22'); rect(x + 3, y - 1, 8, 6, '#bfe3f2');
    rect(x + 14, y + 2, 24, 14, '#b0222a'); rect(x + 14, y + 2, 24, 2, '#d0343c');
    rect(x + 14, y + 12, 24, 1, '#f2b630');
    rect(x + 23, y + 8, 3, 1, '#f2b630'); rect(x + 24, y + 7, 1, 3, '#f2b630');
    rect(x + 28, y - 5, 4, 7, '#2b2b2b'); rect(x + 27, y - 6, 6, 2, '#3b3b3b');
    rect(x + 36, y + 4, 4, 12, '#2b2b2b'); rect(x + 38, y + 5, 2, 2, '#ffe9a0');
    for (let i = 0; i < 4; i++) rect(x + 40, y + 12 + i, i + 1, 1, '#555');
    for (const wx of [6, 20, 32]) {
      disc(x + wx, y + 17, 3, '#222');
      const a = t * 10 + wx;
      px(x + wx + Math.round(Math.cos(a) * 2), y + 17 + Math.round(Math.sin(a) * 2), '#999');
    }
  }
  function sceneTrain(t) {
    NIGHT = false;
    const cam = t * 32;
    const L = cam * 0.8;
    sky(DAY_SKY); sun(140, 14);
    cloud(mod(10 - cam * 0.1, 220) - 30, 10); cloud(mod(130 - cam * 0.1, 220) - 30, 24);

    for (let x = 0; x < W; x++) {
      const steppe = x + L < 175;
      rect(x, 62, 1, 6, steppe ? '#cdb36a' : '#76a84d');
      rect(x, 68, 1, 52, steppe ? '#dcc47c' : '#8fbf5c');
    }
    const sx = (wx) => wx - L;
    yurt(sx(56), 57); yurt(sx(88), 58);
    eagle(sx(70) + t * 6, 28, Math.floor(t * 4) % 2);
    for (const bx of [180, 193, 204, 218, 231]) birch(sx(bx), 48 + (bx % 3), ['#4f9a45', '#3f8a3a', '#62ad52']);
    stork(sx(196) + t * 12, 24, Math.floor(t * 3) % 2);
    brandenburgerTor(sx(262), 66);
    fernsehturm(sx(296));
    rect(sx(330), 88, 100, 4, '#3d7cc9');
    for (const [hx, hw, hh] of [[334, 8, 10], [343, 6, 14], [362, 9, 12], [372, 7, 9]]) rect(sx(hx), 92 - hh, hw, hh, '#c9a27a');
    rheinturm(sx(352));

    const P = cam * 0.95;
    const first = Math.floor(P / 50) - 1;
    for (let k = first; k < first + 6; k++) {
      const x = k * 50 - P;
      rect(x, 66, 1, 28, '#6b4a2e'); rect(x - 3, 68, 7, 1, '#6b4a2e');
      for (let i = 1; i < 50; i += 1) px(x + i, 68 + Math.round(4 * Math.sin(Math.PI * i / 50)), '#3b2a1e');
    }

    rect(0, 102, W, 8, '#9a8f7f');
    for (let k = -1; k < W / 6 + 1; k++) rect(k * 6 - mod(cam, 6), 103, 3, 5, '#5a3d24');
    rect(0, 102, W, 1, '#b9bec4');
    rect(0, 110, W, 10, '#7f6f5a');

    for (let i = 0; i < 7; i++) {
      const p = mod(t * 0.9 + i / 7, 1);
      disc(132 - p * 60, 77 - p * 22 - Math.sin(p * 6 + i) * 2, 1 + Math.round(p * 4), p < 0.5 ? '#f0f0f0' : '#d6d6d6');
    }
    const b1 = Math.floor(t * 8) % 2, b2 = Math.floor(t * 8 + 1) % 2;
    carriage(6, 83 - b1, false, t);
    carriage(54, 83 - b2, true, t);
    loco(102, 83 - b1, t);
  }

  // ---------- Szene 3 + 4: Düsseldorf ----------
  function sceneHome(t, night = false) {
    NIGHT = night;
    sky(night ? NIGHT_SKY : DAY_SKY);
    if (night) { stars(t); moon(28, 14); }
    else { sun(26, 16); cloud(mod(t * 4 + 60, 200) - 30, 12); cloud(mod(t * 3 + 150, 200) - 30, 26); }

    rect(0, 60, W, 10, night ? '#2c3d3a' : '#86b067');
    for (const [bx, bw, bh, c] of [[70, 8, 10, '#c9a27a'], [79, 6, 14, '#d8b48a'], [86, 9, 8, '#b98e66'], [104, 7, 12, '#d8b48a'], [140, 10, 9, '#c9a27a'], [151, 6, 13, '#b98e66']]) {
      rect(bx, 70 - bh, bw, bh, night ? '#3a3550' : c);
      if (night) for (let i = 1; i < bh - 1; i += 3) px(bx + 2, 70 - bh + i, '#ffd76a');
    }
    rheinturm(126, 18);
    const steel = night ? '#9fb0c8' : '#e9eef5';
    rect(0, 66, 104, 2, steel);
    rect(44, 44, 2, 22, steel);
    for (const ex of [6, 18, 30, 58, 72, 86, 100]) line(45, 45, ex, 66, steel);

    rect(0, 70, W, 12, night ? '#1d3557' : '#3d7cc9');
    for (let i = 0; i < 18; i++) {
      px(mod(i * 23 + t * 6 * (i % 2 ? 1 : -1), W), 72 + (i * 5) % 9, night ? '#ffd76a' : '#9cc7f0');
    }
    rect(0, 82, W, 38, night ? '#2f4a2a' : '#79b04f');
    const r = rng(17);
    for (let i = 0; i < 50; i++) px(r() * W, 84 + r() * 34, night ? '#28401f' : '#5f9a3c');
    rect(0, 100, W, 6, night ? '#5a5244' : '#d8c9a3');

    house(4, 66, '#b5452e', night ? '#cfc6b3' : '#f3eee2');
    appleTree(118, 72);
    sunflower(140, 86); sunflower(146, 84);

    if (night) {
      // Heute: alle erwachsen
      // Thomas, Helena, Papa, Mama, Kristina, Sayon
      man(38, 88, HEAD.shortBlond, P.thomasGrown);
      woman(50, 88, HEAD.veryCurly, P.helenaGrown);
      man(62, 88, HEAD.shortCurly, P.dadToday);
      woman(74, 88, HEAD.longCurly, P.momToday);
      woman(86, 88, HEAD.mediumCurl, P.kristinaGrown);
      man(98, 88, HEAD.curlyMedium, P.sayon);
      return;
    }
    // 2003: Helena (12), Kristina (8) und Thomas im Kinderwagen
    man(46, 88, HEAD.shortCurly, P.dad);
    woman(58, 88, HEAD.longCurly, P.mom);
    teen(70, 90, HEAD.veryCurly, P.helena);
    sprite(KID_MEDIUM, 81, 93, P.kristina);
    if (t >= 2.4) {
      const a = t - 2.4;
      pram(91, 94 - popIn(a, 0.5, 3));
      if (a < 1.8) sprite(HEART, 95, 84 - a * 10, { r: '#e8264a' });
    }
  }
  const FIREWORK = ['#f2c14e', '#e8467c', '#7fd1ff', '#ffffff', '#c8102e', '#9be37a'];
  function sceneFinale(t) {
    sceneHome(t, true);
    for (let b = 0; b < 8; b++) {
      const r = rng(100 + b);
      const cx = 16 + r() * 128, cy = 12 + r() * 28, col = FIREWORK[b % FIREWORK.length];
      const a = t - (0.4 + b * 0.8);
      if (a > -0.5 && a < 0) px(cx, cy + (-a) * 60, '#fff6d5');
      if (a > 0 && a < 1.6) {
        for (let k = 0; k < 14; k++) {
          const ang = (k / 14) * Math.PI * 2, d = a * 16;
          if (a < 1.1 || (Math.floor(t * 12) + k) % 2) px(cx + Math.cos(ang) * d, cy + Math.sin(ang) * d + a * a * 6, col);
        }
      }
    }
    if (t > 2.6) {
      const grow = Math.min((t - 2.6) / 0.5, 1);
      const s = grow < 1 ? Math.max(1, Math.round(grow * 4)) : (Math.floor(t * 2.5) % 2 ? 4 : 5);
      const hx = Math.round(80 - 3.5 * s), hy = Math.round(32 - 3 * s);
      sprite(BIG_HEART, hx, hy, { r: '#e8264a' }, s);
      if (grow >= 1) {
        const str = String(years), ns = 2;
        const w = str.length * 3 * ns + (str.length - 1) * ns;
        number(str, Math.round(80 - w / 2), hy + s + 1, ns, '#fffaf0');
      }
    }
  }

  // ---------- Ablauf ----------
  const SCENES = [
    { d: 9.5, draw: sceneWedding, caps: [
      [0.3, `${CFG.village}, Kasachische SSR · Oktober 1989`],
      [4.3, `21. Oktober 1989: ${coupleNames} sagen „Ja!“`]
    ] },
    { d: 6, draw: sceneHelena, caps: [
      [0.3, '24. März 1991: Helena kommt zur Welt!']
    ] },
    { d: 7, draw: sceneKristina, caps: [
      [0.3, '14. Juni 1995: Kristina kommt dazu.'],
      [4.0, 'Helena ist jetzt eine große Schwester.']
    ] },
    { d: 12.5, draw: sceneTrain, caps: [
      [0.3, 'Dann ging es zu viert mit dem Zug in ein neues Leben …'],
      [3.2, '… über Belarus …'],
      [6.4, '… über Berlin …'],
      [9.4, `… bis nach ${CFG.city}.`]
    ] },
    { d: 11, draw: (t) => sceneHome(t), caps: [
      [0.3, `${CFG.city}: ein neues Zuhause`],
      [2.3, '2. April 2003: Thomas, das dritte Kind, segnet die Familie.'],
      [7.2, '… und aus der Fremde wurde Heimat.']
    ] },
    { d: 9, draw: sceneFinale, caps: [
      [0.3, 'Und heute: eine große Familie!'],
      [2.8, `${years} Jahre Liebe. Alles Gute zum Hochzeitstag!`]
    ] }
  ];
  const SPEED = 1.3; // > 1 = langsamer (Bewegung und Text)
  const TOTAL = SCENES.reduce((a, s) => a + s.d, 0);
  const capEl = $('#caption');
  let rafId = 0, last = 0, T = 0, lastCap = null;

  function fade(t, d) {
    const f = 0.45;
    let a = 0;
    if (t < f) a = 1 - t / f;
    else if (d - t < f) a = 1 - (d - t) / f;
    if (a > 0) rect(0, 0, W, H, `rgba(20,8,6,${Math.ceil(a * 4) / 4})`);
  }
  function caption(sc, t) {
    let cur = null;
    for (const c of sc.caps) if (t >= c[0]) cur = c;
    const shown = cur ? cur[1].slice(0, Math.floor((t - cur[0]) * 28)) : '';
    if (shown !== lastCap) { capEl.textContent = shown; lastCap = shown; }
  }
  function render(time) {
    let acc = 0;
    for (const sc of SCENES) {
      if (time < acc + sc.d) {
        const t = time - acc;
        sc.draw(t);
        fade(t, sc.d);
        caption(sc, t);
        return;
      }
      acc += sc.d;
    }
  }
  function tick(ts) {
    const dt = last ? Math.min((ts - last) / 1000, 0.1) : 0;
    last = ts;
    T += dt / SPEED;
    if (T >= TOTAL) { finishStory(); return; }
    render(T);
    rafId = requestAnimationFrame(tick);
  }
  function showStory() {
    clearTimeout(reelTimer);
    reelDone = null;
    $$('.screen').forEach((s) => { s.hidden = s.id !== 'story'; });
    window.scrollTo(0, 0);
    cancelAnimationFrame(rafId);
    T = 0; last = 0; lastCap = null;
    render(0);
    rafId = requestAnimationFrame(tick);
  }
  function showCard(withConfetti) {
    $$('.screen').forEach((s) => { s.hidden = s.id !== 'card'; });
    window.scrollTo(0, 0);
    if (withConfetti) confetti(120);
  }
  function finishStory() {
    cancelAnimationFrame(rafId);
    if (PHOTOS.length) playReel(() => showCard(true));
    else showCard(true);
  }
  $('#skip').addEventListener('click', finishStory);
  $('#replay').addEventListener('click', showStory);

  // Debug/Vorschau: index.html#karte springt direkt zur Postkarte, #film direkt zur Animation
  // #frame=12.5 zeigt ein Standbild bei Sekunde 12,5
  const frameMatch = location.hash.match(/^#frame=([\d.]+)$/);
  if (location.hash === '#karte') showCard(false);
  else if (location.hash === '#fotos') playReel(() => showCard(true));
  else if (location.hash === '#film') showStory();
  else if (frameMatch) {
    $('#intro').hidden = true;
    $('#story').hidden = false;
    lastCap = null;
    render(Math.min(parseFloat(frameMatch[1]), TOTAL - 0.01));
  }
})();
