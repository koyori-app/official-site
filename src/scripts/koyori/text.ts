/**
 * ヒーローの見出しを 2D canvas に描き、WebGL の紙面へ貼るためのテクスチャを作る。
 * DOM の見出しはそのまま残し（読み上げ・選択・検索のため）、WebGL の準備ができたら文字色だけ透明にする。
 * 位置は DOM の行ボックスから取るので、1 要素 = 1 行（white-space: nowrap）で書くこと。
 */

function fontOf(cs: CSSStyleDeclaration): string {
  return `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
}

export function textLeaves(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>('[data-gl-text]'));
}

/** 見出しで使うフォントを読み込み終えるまで待つ */
export async function loadFonts(root: HTMLElement): Promise<void> {
  if (!('fonts' in document)) return;
  await Promise.all(
    textLeaves(root).map((el) =>
      document.fonts.load(fontOf(getComputedStyle(el)), el.textContent ?? '').catch(() => []),
    ),
  );
  await document.fonts.ready;
}

/**
 * target を描画バッファと同じ大きさにし、見出しを描く。
 * reference は WebGL の canvas（座標の基準）。
 */
export function drawText(
  root: HTMLElement,
  reference: HTMLCanvasElement,
  target: HTMLCanvasElement,
  bufferWidth: number,
  bufferHeight: number,
): boolean {
  const ctx = target.getContext('2d');
  if (!ctx) return false;
  const box = reference.getBoundingClientRect();
  if (box.width === 0 || box.height === 0) return false;
  target.width = bufferWidth;
  target.height = bufferHeight;
  ctx.setTransform(bufferWidth / box.width, 0, 0, bufferHeight / box.height, 0, 0);
  ctx.clearRect(0, 0, box.width, box.height);
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';

  for (const el of textLeaves(root)) {
    const text = el.textContent ?? '';
    if (!text.trim()) continue;
    const rect = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    ctx.font = fontOf(cs);
    const spacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
    if ('letterSpacing' in ctx) {
      (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = spacing;
    }
    ctx.fillStyle = cs.getPropertyValue('--gl-ink').trim() || '#18161d';
    const metrics = ctx.measureText(text);
    const ascent = metrics.fontBoundingBoxAscent ?? metrics.actualBoundingBoxAscent;
    const descent = metrics.fontBoundingBoxDescent ?? metrics.actualBoundingBoxDescent;
    const baseline = rect.top - box.top + (rect.height - (ascent + descent)) / 2 + ascent;
    ctx.fillText(text, rect.left - box.left, baseline);
  }
  return true;
}
