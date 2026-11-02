/**
 * 2D canvas で「撚った紐」を描くための小さな道具。
 * 折れ線をなぞって地の色を引き、一定の間隔で斜めの撚り目を重ねる。
 */

export interface Point {
  x: number;
  y: number;
}

export interface CordStyle {
  width: number;
  base: string;
  twist: string;
  /** 撚り目の間隔（px）。省略すると太さの 0.9 倍 */
  pitch?: number;
  /** 撚り目を長さ方向へずらす量（px）。動かすと撚りが流れて見える */
  offset?: number;
}

export function strokeCord(ctx: CanvasRenderingContext2D, pts: Point[], style: CordStyle) {
  if (pts.length < 2) return;
  const w = style.width;
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.strokeStyle = style.base;
  ctx.lineWidth = w;
  ctx.stroke();

  // 撚り目
  const pitch = style.pitch ?? w * 0.9;
  let next = (((style.offset ?? 0) % pitch) + pitch) % pitch;
  let walked = 0;
  ctx.beginPath();
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    if (len === 0) continue;
    const tx = dx / len;
    const ty = dy / len;
    const nx = -ty;
    const ny = tx;
    while (next <= walked + len) {
      const f = (next - walked) / len;
      const px = a.x + dx * f;
      const py = a.y + dy * f;
      ctx.moveTo(px - nx * w * 0.46 - tx * w * 0.34, py - ny * w * 0.46 - ty * w * 0.34);
      ctx.lineTo(px + nx * w * 0.46 + tx * w * 0.34, py + ny * w * 0.46 + ty * w * 0.34);
      next += pitch;
    }
    walked += len;
  }
  ctx.strokeStyle = style.twist;
  ctx.lineWidth = Math.max(1, w * 0.36);
  ctx.lineCap = 'butt';
  ctx.stroke();

  // 片側に薄い影を落として丸みを出す
  ctx.beginPath();
  for (let i = 0; i < pts.length; i++) {
    const a = pts[Math.max(i - 1, 0)];
    const b = pts[Math.min(i + 1, pts.length - 1)];
    const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const nx = -(b.y - a.y) / len;
    const ny = (b.x - a.x) / len;
    const x = pts[i].x + nx * w * 0.3;
    const y = pts[i].y + ny * w * 0.3;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = 'rgba(20, 16, 28, 0.16)';
  ctx.lineWidth = w * 0.3;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();
}

/** canvas 自身の表示サイズに合わせて描画バッファを整える。DPR は最大 2 */
export function fitCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const width = canvas.clientWidth || 1;
  const height = canvas.clientHeight || 1;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const bw = Math.round(width * dpr);
  const bh = Math.round(height * dpr);
  if (canvas.width !== bw || canvas.height !== bh) {
    canvas.width = bw;
    canvas.height = bh;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { width, height, dpr };
}

/** 画面内にあり、動きを減らす設定でないときだけ loop を回す */
export function animateWhileVisible(
  canvas: HTMLCanvasElement,
  draw: (time: number) => boolean | void,
): { wake: () => void; dispose: () => void } {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  let raf = 0;
  let sleeping = false;
  const tick = (time: number) => {
    raf = 0;
    const keepGoing = draw(time / 1000);
    if (keepGoing === false) {
      sleeping = true;
      return;
    }
    schedule();
  };
  const schedule = () => {
    if (raf || !visible || reduce.matches || sleeping) return;
    raf = requestAnimationFrame(tick);
  };
  const stop = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  };
  const update = () => {
    if (visible && !reduce.matches) schedule();
    else {
      stop();
      draw(0);
    }
  };
  const io = new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting);
    update();
  });
  io.observe(canvas);
  reduce.addEventListener('change', update);
  return {
    wake: () => {
      sleeping = false;
      if (reduce.matches) draw(0);
      else schedule();
    },
    dispose: () => {
      stop();
      io.disconnect();
      reduce.removeEventListener('change', update);
    },
  };
}
