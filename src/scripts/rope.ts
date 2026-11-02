import { animateWhileVisible, fitCanvas, strokeCord, type Point } from './cord2d';

/**
 * トップ末尾の「引っぱれる紙縒り」。上端から垂れ下がる紐を Verlet 積分で動かす。
 * マウスやペンでは端をつかんで引ける。近くを通るだけでも揺れ、スクロールでも少し揺れる。
 * 装飾なので aria-hidden。動きを減らす設定では、垂れ下がった形を 1 枚だけ描く。
 */
export function mountRope(canvas: HTMLCanvasElement, colors: string[]) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  const COUNT = 28;
  const pos: Point[] = [];
  const prev: Point[] = [];
  let seg = 10;
  let size = { width: 1, height: 1 };
  let anchor = { x: 0, y: -12 };
  const pointer = { x: -999, y: -999, active: false };
  let grabbed = false;
  let energy = 1;

  const reset = () => {
    size = fitCanvas(canvas, ctx);
    anchor = { x: size.width * 0.5, y: 10 };
    seg = (size.height * 0.72) / COUNT;
    pos.length = 0;
    prev.length = 0;
    for (let i = 0; i < COUNT; i++) {
      // 少し斜めから始めて、最初に一度揺れるようにする
      const p = { x: anchor.x + i * seg * 0.35, y: anchor.y + i * seg * 0.94 };
      pos.push(p);
      prev.push({ ...p });
    }
    energy = 1;
  };

  const step = () => {
    let moved = 0;
    for (let i = 1; i < COUNT; i++) {
      const p = pos[i];
      const q = prev[i];
      const vx = (p.x - q.x) * 0.985;
      const vy = (p.y - q.y) * 0.985;
      q.x = p.x;
      q.y = p.y;
      p.x += vx;
      p.y += vy + 0.32;
      moved = Math.max(moved, Math.abs(vx) + Math.abs(vy));
      if (pointer.active && !grabbed) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const d = Math.hypot(dx, dy);
        if (d < 36 && d > 0.01) {
          p.x += (dx / d) * (36 - d) * 0.25;
          p.y += (dy / d) * (36 - d) * 0.25;
        }
      }
    }
    if (grabbed) {
      pos[COUNT - 1].x = pointer.x;
      pos[COUNT - 1].y = pointer.y;
    }
    for (let k = 0; k < 14; k++) {
      pos[0].x = anchor.x;
      pos[0].y = anchor.y;
      for (let i = 1; i < COUNT; i++) {
        const a = pos[i - 1];
        const b = pos[i];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.hypot(dx, dy) || 0.0001;
        const diff = (d - seg) / d;
        const wa = i === 1 ? 0 : 0.5;
        const wb = grabbed && i === COUNT - 1 ? 0 : 1 - wa;
        const total = wa + wb || 1;
        a.x += dx * diff * (wa / total);
        a.y += dy * diff * (wa / total);
        b.x -= dx * diff * (wb / total);
        b.y -= dy * diff * (wb / total);
      }
    }
    for (let i = 0; i < COUNT; i++) {
      const p = pos[i];
      p.x = Math.min(Math.max(p.x, 6), size.width - 6);
      p.y = Math.min(p.y, size.height - 6);
      moved = Math.max(moved, Math.abs(p.x - prev[i].x) + Math.abs(p.y - prev[i].y));
    }
    return moved;
  };

  const draw = () => {
    ctx.clearRect(0, 0, size.width, size.height);
    // 留めている釘
    ctx.fillStyle = colors[3] ?? colors[0];
    ctx.fillRect(anchor.x - 14, anchor.y - 3, 28, 3);
    const width = Math.min(Math.max(size.width * 0.05, 9), 14);
    strokeCord(ctx, pos, { width, base: colors[0], twist: colors[1], pitch: width * 1.05 });
    // 端の房（ほつれた紙）
    const end = pos[COUNT - 1];
    const before = pos[COUNT - 2];
    const ang = Math.atan2(end.y - before.y, end.x - before.x);
    ctx.save();
    ctx.translate(end.x, end.y);
    ctx.rotate(ang);
    ctx.lineCap = 'round';
    colors.forEach((c, i) => {
      ctx.strokeStyle = c;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      const spread = (i - (colors.length - 1) / 2) * 0.32;
      ctx.quadraticCurveTo(10, spread * 10, 22 + i * 2, spread * 26);
      ctx.stroke();
    });
    ctx.fillStyle = colors[1];
    ctx.beginPath();
    ctx.arc(0, 0, width * 0.62, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const settle = () => {
    for (let i = 0; i < 600; i++) step();
    for (let i = 0; i < COUNT; i++) prev[i] = { ...pos[i] };
  };

  reset();
  if (reduce.matches) settle();

  const loop = animateWhileVisible(canvas, (time) => {
    if (time === 0) {
      // 静止フレーム
      if (reduce.matches) settle();
      draw();
      return;
    }
    const moved = step();
    draw();
    energy = Math.max(moved, pointer.active ? 1 : 0, grabbed ? 1 : 0);
    return energy > 0.015;
  });

  const local = (event: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    return { x: event.clientX - r.left, y: event.clientY - r.top };
  };
  const onMove = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return;
    const p = local(event);
    const inside = p.x >= -40 && p.y >= -40 && p.x <= size.width + 40 && p.y <= size.height + 40;
    pointer.x = p.x;
    pointer.y = p.y;
    pointer.active = inside;
    if (inside || grabbed) loop.wake();
  };
  const onDown = (event: PointerEvent) => {
    if (event.pointerType === 'touch' || reduce.matches) return;
    const p = local(event);
    const end = pos[COUNT - 1];
    const near = pos.some((q, i) => i > COUNT * 0.5 && Math.hypot(q.x - p.x, q.y - p.y) < 28);
    if (near || Math.hypot(end.x - p.x, end.y - p.y) < 40) {
      grabbed = true;
      canvas.setPointerCapture(event.pointerId);
      canvas.style.cursor = 'grabbing';
      loop.wake();
    }
  };
  const onUp = () => {
    grabbed = false;
    canvas.style.cursor = '';
  };
  let lastScroll = window.scrollY;
  const onScroll = () => {
    const dy = window.scrollY - lastScroll;
    lastScroll = window.scrollY;
    if (reduce.matches) return;
    for (let i = 1; i < COUNT; i++)
      prev[i].x += Math.max(Math.min(dy, 60), -60) * 0.03 * (i / COUNT);
    loop.wake();
  };
  const resizeObserver = new ResizeObserver(() => {
    reset();
    if (reduce.matches) settle();
    loop.wake();
  });
  resizeObserver.observe(canvas);
  window.addEventListener('pointermove', onMove, { passive: true });
  canvas.addEventListener('pointerdown', onDown);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('scroll', onScroll, { passive: true });
  canvas.dataset.ready = 'true';

  return () => {
    loop.dispose();
    resizeObserver.disconnect();
    window.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerdown', onDown);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('scroll', onScroll);
  };
}
