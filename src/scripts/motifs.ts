import { animateWhileVisible, fitCanvas, strokeCord, type Point } from './cord2d';

/**
 * プロダクトページのモチーフ。すべて 2D canvas で、three.js は使わない。
 *   task: 縦糸と横糸の織り。終わったマス目に印がつく
 *   vrt : baseline の糸と今回の糸を重ね、走査線が差分を見つける
 *   ui  : 1 本の糸（共通ソース）が 2 本（Vue と React）に分かれる
 *   arc : ガントチャートの帯を、依存関係の糸が弧でつなぐ
 * 画面に入ったときに一度だけ END 秒かけて描き進め、最後の 1 枚で止まる（繰り返さない）。
 * 動きを減らす設定では最後の 1 枚だけを描く。
 */

/** 描き終わるまでの秒数 */
const END = 3.2;

type Palette = {
  strand: string;
  ink: string;
  ink3: string;
  paper: string;
  paper2: string;
  lav: string;
  lavDeep: string;
  sage: string;
  sageDeep: string;
};

type Draw = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number, p: Palette) => void;

const smooth = (x: number) => x * x * (3 - 2 * x);
const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);

function shade(ctx: CanvasRenderingContext2D, color: string) {
  ctx.fillStyle = color;
}

const task: Draw = (ctx, w, h, t, p) => {
  const cols = Math.max(4, Math.min(7, Math.floor(w / 64)));
  const rows = Math.max(4, Math.min(6, Math.floor(h / 64)));
  const gap = Math.min((w * 0.82) / cols, (h * 0.82) / rows);
  const x0 = (w - gap * (cols - 1)) / 2;
  const y0 = (h - gap * (rows - 1)) / 2;
  const cw = Math.max(8, gap * 0.26);
  const warpColor = (i: number) => (i % 2 ? p.sageDeep : p.lavDeep);
  const warp = (i: number, ya: number, yb: number) =>
    strokeCord(
      ctx,
      [
        { x: x0 + i * gap, y: ya },
        { x: x0 + i * gap, y: yb },
      ],
      { width: cw, base: warpColor(i), twist: 'rgba(24, 22, 29, 0.45)', offset: -t * 10 },
    );
  for (let i = 0; i < cols; i++) warp(i, y0 - gap * 0.7, y0 + gap * (rows - 1) + gap * 0.7);
  for (let j = 0; j < rows; j++) {
    const y = y0 + j * gap;
    const sway = Math.sin(t * 0.8 + j) * 2;
    strokeCord(
      ctx,
      [
        { x: x0 - gap * 0.7, y: y + sway },
        { x: x0 + gap * (cols - 1) + gap * 0.7, y: y - sway },
      ],
      {
        width: cw,
        base: j % 2 ? p.sage : p.strand,
        twist: j % 2 ? p.sageDeep : p.lavDeep,
        offset: t * 14,
      },
    );
    // 縦糸が上に来る交点だけ、縦糸を描き直す
    for (let i = 0; i < cols; i++) {
      if ((i + j) % 2 === 0) warp(i, y - cw * 0.9, y + cw * 0.9);
    }
  }
  // 終わったタスク: マス目に順に印がつく
  const cells = (cols - 1) * (rows - 1);
  const done = Math.min(Math.floor(t * 3), Math.round(cells * 0.6));
  for (let k = 0; k < Math.min(done, cells); k++) {
    const i = (k * 3) % (cols - 1);
    const j = Math.floor(k / (cols - 1)) % (rows - 1);
    const cx = x0 + (i + 0.5) * gap;
    const cy = y0 + (j + 0.5) * gap;
    const s = gap * 0.14;
    ctx.strokeStyle = p.ink;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - s, cy);
    ctx.lineTo(cx - s * 0.3, cy + s * 0.7);
    ctx.lineTo(cx + s, cy - s * 0.7);
    ctx.stroke();
  }
};

const vrt: Draw = (ctx, w, h, t, p) => {
  const pad = w * 0.08;
  const mid = h * 0.5;
  const cw = Math.max(8, Math.min(w, h) * 0.028);
  const cycle = Math.min(t / END, 1) * 0.86;
  const scanX = pad + (w - pad * 2) * smooth(clamp01(cycle * 1.25));
  const bumpCenter = w * 0.62;
  const path = (diff: number) => {
    const pts: Point[] = [];
    for (let i = 0; i <= 80; i++) {
      const x = pad + ((w - pad * 2) * i) / 80;
      const d = (x - bumpCenter) / (w * 0.08);
      const bump = Math.exp(-d * d) * diff;
      pts.push({ x, y: mid + Math.sin(x / (w * 0.14) + 0.6) * h * 0.16 - bump });
    }
    return pts;
  };
  const base = path(0);
  const current = path(h * 0.16);
  // baseline は細い破線で
  ctx.save();
  ctx.setLineDash([3, 6]);
  ctx.strokeStyle = p.ink3;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  base.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)));
  ctx.stroke();
  ctx.restore();
  // 走査線より左だけ、今回の糸が見える
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, scanX, h);
  ctx.clip();
  strokeCord(ctx, current, { width: cw, base: p.strand, twist: p.sageDeep, offset: t * 8 });
  ctx.restore();
  // 差分の枠
  const found = scanX > bumpCenter + w * 0.1;
  if (found) {
    const a = clamp01((scanX - bumpCenter - w * 0.1) / (w * 0.05));
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(196, 181, 223, 0.45)';
    const bx = bumpCenter - w * 0.13;
    const by = mid - h * 0.42;
    const bw = w * 0.26;
    const bh = h * 0.42;
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = p.lavDeep;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle = p.ink;
    ctx.font = '500 12px "Instrument Sans Variable", sans-serif';
    ctx.fillText('diff', bx + 8, by + 18);
    ctx.restore();
  }
  ctx.fillStyle = p.ink;
  ctx.fillRect(scanX - 0.75, h * 0.08, 1.5, h * 0.84);
};

const ui: Draw = (ctx, w, h, t, p) => {
  const split = { x: w * 0.46, y: h * 0.5 };
  const cw = Math.max(12, Math.min(w, h) * 0.06);
  const source: Point[] = [];
  for (let i = 0; i <= 30; i++) {
    const x = w * 0.04 + ((split.x - w * 0.04) * i) / 30;
    source.push({ x, y: split.y + Math.sin(i * 0.25 + t * 0.6) * h * 0.02 * (1 - i / 30) });
  }
  const branch = (dir: number) => {
    const pts: Point[] = [];
    for (let i = 0; i <= 40; i++) {
      const f = i / 40;
      const x = split.x + (w * 0.8 - split.x) * f;
      const y = split.y + dir * h * 0.26 * smooth(f) + Math.sin(f * 6 + t) * 2 * f;
      pts.push({ x, y });
    }
    return pts;
  };
  const top = branch(-1);
  const bottom = branch(1);
  strokeCord(ctx, top, { width: cw * 0.62, base: p.sage, twist: p.sageDeep, offset: t * 12 });
  strokeCord(ctx, bottom, { width: cw * 0.62, base: p.lav, twist: p.lavDeep, offset: t * 12 });
  strokeCord(ctx, source, { width: cw, base: p.strand, twist: p.lav, offset: t * 12 });
  const card = (pt: Point, label: string, accent: string) => {
    const cwid = Math.min(w * 0.17, 120);
    const chei = cwid * 0.62;
    ctx.fillStyle = p.paper;
    ctx.strokeStyle = p.ink;
    ctx.lineWidth = 1.5;
    ctx.fillRect(pt.x, pt.y - chei / 2, cwid, chei);
    ctx.strokeRect(pt.x, pt.y - chei / 2, cwid, chei);
    ctx.fillStyle = accent;
    ctx.fillRect(pt.x + 8, pt.y - chei / 2 + 8, cwid * 0.4, 6);
    ctx.fillStyle = p.ink3;
    ctx.fillRect(pt.x + 8, pt.y - chei / 2 + 20, cwid * 0.7, 3);
    ctx.fillRect(pt.x + 8, pt.y - chei / 2 + 28, cwid * 0.55, 3);
    ctx.fillStyle = p.ink;
    ctx.font = '500 12px "Instrument Sans Variable", sans-serif';
    ctx.fillText(label, pt.x, pt.y + chei / 2 + 16);
  };
  card(top[top.length - 1], 'Vue', p.sageDeep);
  card(bottom[bottom.length - 1], 'React', p.lavDeep);
  ctx.fillStyle = p.ink;
  ctx.font = '500 12px "Instrument Sans Variable", sans-serif';
  ctx.fillText('Mitosis', w * 0.04, split.y - cw - 6);
};

const arc: Draw = (ctx, w, h, t, p) => {
  const rows = 5;
  const top = h * 0.12;
  const rowH = (h * 0.76) / rows;
  const left = w * 0.06;
  const unit = (w * 0.88) / 12;
  const bars = [
    { r: 0, s: 0, d: 3 },
    { r: 1, s: 3.6, d: 2.5 },
    { r: 2, s: 3.4, d: 3 },
    { r: 3, s: 6.6, d: 2.8 },
    { r: 4, s: 7.4, d: 4.2 },
  ];
  const deps: [number, number][] = [
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 4],
  ];
  // 目盛り
  ctx.strokeStyle = 'rgba(24, 22, 29, 0.14)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 12; i++) {
    const x = left + i * unit;
    ctx.beginPath();
    ctx.moveTo(x, top - 10);
    ctx.lineTo(x, top + rows * rowH);
    ctx.stroke();
  }
  const barH = Math.min(rowH * 0.44, 22);
  const rect = (b: (typeof bars)[number]) => ({
    x: left + b.s * unit,
    y: top + b.r * rowH + (rowH - barH) / 2,
    w: b.d * unit,
  });
  const cycle = Math.min(t / END, 1) * 0.75;
  deps.forEach(([a, b], k) => {
    const A = rect(bars[a]);
    const B = rect(bars[b]);
    const from = { x: A.x + A.w, y: A.y + barH / 2 };
    const to = { x: B.x, y: B.y + barH / 2 };
    const pts: Point[] = [];
    const prog = clamp01(cycle * 2.4 - k * 0.22);
    const n = 40;
    for (let i = 0; i <= n * prog; i++) {
      const f = i / n;
      const cx1 = from.x + unit * 1.2;
      const cx2 = to.x - unit * 1.2;
      const y =
        (1 - f) ** 3 * from.y +
        3 * (1 - f) ** 2 * f * from.y +
        3 * (1 - f) * f * f * to.y +
        f ** 3 * to.y;
      const x =
        (1 - f) ** 3 * from.x +
        3 * (1 - f) ** 2 * f * cx1 +
        3 * (1 - f) * f * f * cx2 +
        f ** 3 * to.x;
      pts.push({ x, y: y - Math.sin(f * Math.PI) * rowH * 0.35 });
    }
    if (pts.length > 1)
      strokeCord(ctx, pts, { width: 7, base: p.strand, twist: p.lav, offset: t * 10 });
  });
  bars.forEach((b, i) => {
    const r = rect(b);
    ctx.fillStyle = 'rgba(24, 22, 29, 0.12)';
    ctx.fillRect(r.x + 3, r.y + 4, r.w, barH);
    shade(ctx, i % 2 ? p.lav : p.paper2);
    ctx.fillRect(r.x, r.y, r.w, barH);
    ctx.strokeStyle = p.ink;
    ctx.lineWidth = 1.25;
    ctx.strokeRect(r.x, r.y, r.w, barH);
  });
};

const draws: Record<string, Draw> = { task, vrt, ui, arc };

export function mountMotif(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  const draw = draws[canvas.dataset.motif ?? ''];
  if (!ctx || !draw) return () => {};
  const css = getComputedStyle(document.documentElement);
  const v = (name: string) => css.getPropertyValue(name).trim();
  const palette: Palette = {
    strand: canvas.dataset.strand ?? v('--koyori-lav'),
    ink: v('--koyori-ink'),
    ink3: v('--koyori-ink-3'),
    paper: v('--koyori-paper-3'),
    paper2: v('--koyori-paper-2'),
    lav: v('--koyori-lav'),
    lavDeep: v('--koyori-lav-deep'),
    sage: v('--koyori-sage'),
    sageDeep: v('--koyori-sage-deep'),
  };
  let size = fitCanvas(canvas, ctx);
  let shown = END;
  const render = (t: number) => {
    shown = t;
    ctx.clearRect(0, 0, size.width, size.height);
    draw(ctx, size.width, size.height, t, palette);
  };
  // time = 0 は「止めて 1 枚描いて」の合図（画面外、または動きを減らす設定）
  let startedAt = -1;
  const loop = animateWhileVisible(canvas, (time) => {
    if (time === 0) {
      render(END);
      return;
    }
    if (startedAt < 0) startedAt = time;
    const t = Math.min(time - startedAt, END);
    render(t);
    return t < END;
  });
  const ro = new ResizeObserver(() => {
    size = fitCanvas(canvas, ctx);
    render(shown);
  });
  ro.observe(canvas);
  canvas.dataset.ready = 'true';
  return () => {
    loop.dispose();
    ro.disconnect();
  };
}
