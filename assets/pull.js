/* ============================================================
   ES Consultoria — Pull-to-Refresh com a nova marca
   16 fragmentos do PNG original convergem e recompõem o símbolo;
   ao completar: pulso dourado + reload
   ============================================================ */
(() => {
  const page = document.getElementById('page');
  if (!page) return;

  const ROWS = 4;
  const COLS = 4;
  const PIECES = ROWS * COLS;
  const TH = 132;
  const DAMP = .5;

  const ptr = document.createElement('div');
  ptr.className = 'ptr';
  ptr.innerHTML = `
    <div class="ptr-bg"></div>
    <div class="ptr-rays" aria-hidden="true">
      <i></i><i></i><i></i><i></i>
    </div>
    <div class="ptr-mark" aria-hidden="true"></div>
    <span class="ptr-label">ES · Atualizando</span>`;
  document.body.appendChild(ptr);

  const mark = ptr.querySelector('.ptr-mark');
  const pieces = [];

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const piece = document.createElement('span');
      piece.className = 'ptr-piece';
      piece.style.left = `${col * 25}%`;
      piece.style.top = `${row * 25}%`;

      const img = document.createElement('img');
      img.src = 'assets/img/logo-exata-sq.png?v=2';
      img.alt = '';
      img.draggable = false;
      img.style.left = `${-col * 100}%`;
      img.style.top = `${-row * 100}%`;
      piece.appendChild(img);
      mark.appendChild(piece);

      const dx = col - (COLS - 1) / 2;
      const dy = row - (ROWS - 1) / 2;
      const len = Math.hypot(dx, dy) || 1;
      const spread = 54 + ((row * 7 + col * 11) % 26);
      const t0 = .06 + ((row + col) % 4) * .045;
      pieces.push({
        el: piece,
        t0,
        t1: Math.min(.92, t0 + .58),
        sx: (dx / len) * spread + (col % 2 ? 12 : -12),
        sy: (dy / len) * spread - 24 + (row % 2 ? 9 : -9),
        sr: ((row * 31 + col * 47) % 86) - 43,
      });
    }
  }

  const easeOut = x => 1 - Math.pow(1 - x, 3);
  const clamp01 = x => Math.max(0, Math.min(1, x));

  function render(progress) {
    pieces.forEach(piece => {
      const local = clamp01((progress - piece.t0) / (piece.t1 - piece.t0));
      const eased = easeOut(local);
      piece.el.style.opacity = String(Math.min(1, local * 1.65));
      piece.el.style.transform =
        `translate(${piece.sx * (1 - eased)}px, ${piece.sy * (1 - eased)}px) ` +
        `rotate(${piece.sr * (1 - eased)}deg) scale(${.72 + eased * .28})`;
    });
    ptr.style.setProperty('--pull-progress', String(progress));
  }
  render(0);

  let pulling = false;
  let dist = 0;
  let prog = 0;
  let touchStart = null;
  let mouseStart = null;
  let animation = null;

  function setDist(distance) {
    dist = Math.max(0, Math.min(distance, TH * 1.18));
    prog = clamp01(dist / TH);
    render(prog);
    page.style.transform = `translateY(${dist * .3}px)`;
  }

  function stop() {
    pulling = false;
    touchStart = null;
    mouseStart = null;
    document.body.classList.remove('ptr-pulling');
    ptr.classList.remove('on');
  }

  function springBack() {
    cancelAnimationFrame(animation);
    const initialProgress = prog;
    const initialDistance = dist;
    const startedAt = performance.now();

    const frame = time => {
      const phase = Math.min(1, (time - startedAt) / 460);
      const eased = easeOut(phase);
      render(initialProgress * (1 - eased));
      page.style.transform = `translateY(${initialDistance * .3 * (1 - eased)}px)`;
      if (phase < 1) animation = requestAnimationFrame(frame);
      else stop();
    };
    animation = requestAnimationFrame(frame);
  }

  function complete() {
    ptr.classList.add('done');
    render(1);
    setTimeout(() => location.reload(), 680);
  }

  function release() {
    if (!pulling) return;
    if (prog >= .995) complete();
    else springBack();
  }

  function begin() {
    pulling = true;
    cancelAnimationFrame(animation);
    document.body.classList.add('ptr-pulling');
    ptr.classList.add('on');
  }

  addEventListener('touchstart', event => {
    if (scrollY <= 0 && !pulling) touchStart = event.touches[0].clientY;
  }, { passive: true });

  addEventListener('touchmove', event => {
    if (touchStart == null) return;
    const delta = event.touches[0].clientY - touchStart;
    if (!pulling && delta > 10 && scrollY <= 0) begin();
    if (pulling) {
      event.preventDefault();
      setDist(delta * DAMP);
    }
  }, { passive: false });

  addEventListener('touchend', release);
  addEventListener('touchcancel', release);

  addEventListener('mousedown', event => {
    if (scrollY <= 0 && !pulling && event.button === 0) mouseStart = event.clientY;
  });

  addEventListener('mousemove', event => {
    if (mouseStart == null) return;
    const delta = event.clientY - mouseStart;
    if (!pulling && delta > 12 && scrollY <= 0) begin();
    if (pulling) setDist(delta * DAMP);
  });

  addEventListener('mouseup', release);
  addEventListener('blur', release);
})();
