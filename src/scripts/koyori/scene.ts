import {
  DoubleSide,
  Mesh,
  NormalBlending,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  Vector4,
  WebGLRenderer,
  type IUniform,
} from 'three';
import { paperFragment, paperVertex, stripFragment, stripVertex } from './shaders';

/**
 * トップのヒーロー。紙（生成り）の上を、4 色の紙の帯を撚った紙縒りが縫うように通り、
 * 最後は 4 本の糸にほどけて、下に並ぶ 4 つのプロダクトの列へ降りていく。
 * 見出しは DOM のまま紙の上に置き、紐は見出しを避けた側を通す。
 *
 * 形の基準はすべて DOM から読む。
 *   [data-gl-anchor="start"] 紙縒りの始点
 *   [data-gl-anchor="split"] ほどけ始める点
 *   [data-gl-exit]           4 本の糸の出口（見えているものを使う。x だけを使い、y は canvas の下端）
 *
 * 動きは 3 つだけ: 読み込み時に紐が引かれていく一度きりの登場、紐がゆっくり撚れる回転、
 * ポインターが近くを通ったときに糸が弾かれる反応。動きを減らす設定では 1 フレームだけ描く。
 */

const FOV = 30;
const DISTANCE = 10;
const SEGMENTS = 900;
const PAPER = '#f1ece2';
const PAPER_BACK = '#f7f3ec';
/** shaders.ts の axisAt と揃える。紙の下にいる時間を少し長くして、文字を隠しすぎない */
const STITCH_BIAS = 0.22;

type Uniforms = Record<string, IUniform>;

/** シェーダーは sRGB のまま計算するので、three の色管理（線形変換）を通さずに渡す */
function srgb(hex: string): Vector3 {
  const n = parseInt(hex.replace('#', ''), 16);
  return new Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

export function mount(hero: HTMLElement, canvas: HTMLCanvasElement): () => void {
  const renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(PAPER, 1);

  const strandColors: string[] = JSON.parse(hero.dataset.strands ?? '[]');
  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 100);
  camera.position.set(0, 0, DISTANCE);
  const tanHalf = Math.tan(((FOV / 2) * Math.PI) / 180);

  // ---- 紙面 ----
  const holes = Array.from({ length: 16 }, () => new Vector4());
  const paperUniforms: Uniforms = {
    uDpr: { value: 1 },
    uPaper: { value: srgb(PAPER) },
    uHoles: { value: holes },
    uHoleCount: { value: 0 },
    uHoleR: { value: 10 },
    uReveal: { value: 0 },
  };
  const paperGeometry = new PlaneGeometry(1, 1);
  const paperMaterial = new ShaderMaterial({
    vertexShader: paperVertex,
    fragmentShader: paperFragment,
    uniforms: paperUniforms,
  });
  const paper = new Mesh(paperGeometry, paperMaterial);
  paper.renderOrder = 0;
  scene.add(paper);

  // ---- 紙縒り ----
  const shared: Uniforms = {
    uS: { value: new Vector2() },
    uU: { value: new Vector2(1, 0) },
    uLc: { value: 1 },
    uA: { value: 0.3 },
    uOmega: { value: 1 },
    uR: { value: 0.1 },
    uK: { value: 1 },
    uRoll: { value: 0 },
    uSJ: { value: 0.7 },
    uWEnd: { value: 0.01 },
    uPluckAmp: { value: 0 },
    uPluckT: { value: 0 },
    uPluckSigma: { value: 1 },
    uShadowDir: { value: new Vector2(0.32, -0.48) },
    uReveal: paperUniforms.uReveal,
    uBack: { value: srgb(PAPER_BACK) },
  };
  const stripGeometry = new PlaneGeometry(1, 1, SEGMENTS, 6);
  const strands = strandColors.map((hex, i) => {
    const own: Uniforms = {
      uI: { value: i },
      uColor: { value: srgb(hex) },
      uP1: { value: new Vector3() },
      uP2: { value: new Vector3() },
      uP3: { value: new Vector3() },
      // 出口で表（色のついた面）が正面を向く角度
      uPsiEnd: { value: Math.PI * (1 + 2 * (i % 2)) },
    };
    const make = (mode: number, order: number) => {
      const material = new ShaderMaterial({
        vertexShader: stripVertex,
        fragmentShader: stripFragment,
        uniforms: { ...shared, ...own, uMode: { value: mode } },
        side: DoubleSide,
        transparent: mode !== 0,
        blending: NormalBlending,
        depthWrite: true,
      });
      const mesh = new Mesh(stripGeometry, material);
      mesh.frustumCulled = false;
      mesh.renderOrder = order;
      scene.add(mesh);
      return material;
    };
    // 2 = 紙の裏に透ける色、1 = 影、0 = 本体
    return { own, materials: [make(2, 1), make(1, 2), make(0, 3)] };
  });

  // ---- レイアウト ----
  const view = { width: 1, height: 1, hw: 1, ww: 1, dpr: 1 };
  const cord = { s: new Vector2(), u: new Vector2(1, 0), n: new Vector2(0, 1), lc: 1, r: 0.1 };

  const toWorld = (x: number, y: number) =>
    new Vector2((x / view.width - 0.5) * view.ww, (0.5 - y / view.height) * view.hw);

  const centerOf = (el: Element, box: DOMRect) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
  };
  const visible = (el: Element) => el.getClientRects().length > 0;

  const layout = () => {
    const width = canvas.clientWidth || 1;
    const height = canvas.clientHeight || 1;
    // 大きな画面では解像度を少し抑える（DPR は最大 2）
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (width * height * dpr * dpr > 3.6e6) dpr = Math.max(1, Math.sqrt(3.6e6 / (width * height)));
    view.width = width;
    view.height = height;
    view.dpr = dpr;
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    view.hw = 2 * DISTANCE * tanHalf;
    view.ww = view.hw * camera.aspect;
    paper.scale.set(view.ww * 1.04, view.hw * 1.04, 1);

    const buffer = renderer.getDrawingBufferSize(new Vector2());
    paperUniforms.uDpr.value = buffer.x / width;

    const box = canvas.getBoundingClientRect();
    const startEl = hero.querySelector('[data-gl-anchor="start"]');
    const splitEl = hero.querySelector('[data-gl-anchor="split"]');
    const exitEls = Array.from(hero.querySelectorAll('[data-gl-exit]')).filter(visible);
    if (!startEl || !splitEl) return;
    const a = centerOf(startEl, box);
    const b = centerOf(splitEl, box);
    const S = toWorld(a.x, a.y);
    const Q = toWorld(b.x, b.y);
    const pxToWorld = view.hw / height;

    const dir = Q.clone().sub(S);
    const lc = dir.length();
    dir.normalize();
    const R = Math.min(Math.max(Math.min(width, height) * 0.024, 9), 19) * pxToWorld;
    const A = R * 2.5;
    const lambdaPx = Math.min(Math.max(width * 0.2, 150), 300);
    // ほどけ始め（t = Lc）では cos(0) = 1 なので、紐は必ず紙の上に出ている
    const omega = (Math.PI * 2) / (lambdaPx * pxToWorld);

    cord.s.copy(S);
    cord.u.copy(dir);
    cord.n.set(-dir.y, dir.x);
    cord.lc = lc;
    cord.r = R;

    shared.uS.value.copy(S);
    shared.uU.value.copy(dir);
    shared.uLc.value = lc;
    shared.uA.value = A;
    shared.uOmega.value = omega;
    shared.uR.value = R;
    shared.uK.value = 1 / (1.2 * R);
    shared.uWEnd.value = 3 * pxToWorld;
    shared.uPluckSigma.value = lambdaPx * pxToWorld * 0.32;

    // ほどけた糸の行き先
    let strandLength = 0;
    strands.forEach((strand, i) => {
      const exit = exitEls[i];
      const e = exit ? centerOf(exit, box) : { x: b.x, y: height };
      const E = toWorld(e.x, height + 24);
      const span = Q.distanceTo(E);
      strandLength = Math.max(strandLength, span * 1.25);
      const lead = new Vector2(dir.x * 0.6, dir.y * 0.6 - 0.4).normalize();
      const p1 = Q.clone().addScaledVector(lead, span * 0.34);
      p1.addScaledVector(cord.n, (i - 1.5) * R * 1.8);
      // 画面の外へ膨らまないように、始点と出口の間に収める
      const lo = Math.min(Q.x, E.x) - R * 2;
      const hi = Math.max(Q.x, E.x) + span * 0.4;
      p1.x = Math.min(Math.max(p1.x, Math.max(lo, -view.ww / 2 + R * 3)), hi);
      const drop = Math.max((Q.y - E.y) * 0.42, R * 6);
      strand.own.uP1.value.set(p1.x, p1.y, A * 0.9);
      strand.own.uP2.value.set(E.x, E.y + drop, A * 0.35);
      strand.own.uP3.value.set(E.x, E.y, 0.004);
    });
    const sj = lc / (lc + strandLength);
    shared.uSJ.value = sj;

    // 紙を通る穴（z = A (cos(ω(t - Lc)) - BIAS) が 0 になる位置）
    let count = 0;
    const a0 = Math.acos(STITCH_BIAS);
    const phases: number[] = [];
    for (let m = 0; m < 20; m++)
      phases.push(-a0 - Math.PI * 2 * m, -(Math.PI * 2 - a0) - Math.PI * 2 * m);
    for (const phase of phases) {
      if (count >= holes.length) break;
      const t = lc + phase / omega;
      if (t < 0) break;
      const p = S.clone().addScaledVector(dir, t);
      const px = (p.x / view.ww + 0.5) * width;
      const py = (p.y / view.hw + 0.5) * height;
      if (px < -40 || px > width + 40 || py < -40 || py > height + 40) continue;
      holes[count].set(px, py, Math.atan2(dir.y, dir.x), (t / lc) * sj);
      count++;
    }
    paperUniforms.uHoleCount.value = count;
    paperUniforms.uHoleR.value = R / pxToWorld;
  };

  // ---- 入力 ----
  const pointer = { x: -9999, y: -9999, inside: false };
  const pluck = { amp: 0, vel: 0, target: 0, t: 0 };
  const onPointerMove = (event: PointerEvent) => {
    const box = canvas.getBoundingClientRect();
    pointer.x = event.clientX - box.left;
    pointer.y = event.clientY - box.top;
    pointer.inside =
      pointer.x >= 0 && pointer.y >= 0 && pointer.x <= box.width && pointer.y <= box.height;
    // 紙縒りの近くを通ると、糸が弾かれる
    const w = toWorld(pointer.x, pointer.y);
    const rel = w.sub(cord.s);
    const along = rel.dot(cord.u);
    const across = rel.dot(cord.n);
    const reach = cord.r * 4.5;
    if (pointer.inside && along > 0 && along < cord.lc && Math.abs(across) < reach) {
      pluck.target = -Math.sign(across) * (reach - Math.abs(across)) * 0.55;
      pluck.t = along;
    } else {
      pluck.target = 0;
    }
  };
  const onPointerLeave = () => {
    pointer.inside = false;
    pluck.target = 0;
  };
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  document.documentElement.addEventListener('pointerleave', onPointerLeave);

  // ---- 描画 ----
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const startedAt = performance.now();
  const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  let ready = false;

  const frame = () => {
    const now = performance.now();
    const t = (now - startedAt) / 1000;
    const still = reduceMotion.matches;

    paperUniforms.uReveal.value = still ? 1.02 : easeInOut(Math.min(t / 2.6, 1)) * 1.02;
    // 指で紙縒りを転がすような、ゆっくりした撚れ
    shared.uRoll.value = still ? 0 : 0.5 * Math.sin(t * 0.45);

    if (!still) {
      pluck.vel += (pluck.target - pluck.amp) * 0.09;
      pluck.vel *= 0.86;
      pluck.amp += pluck.vel;
      shared.uPluckT.value += (pluck.t - shared.uPluckT.value) * 0.2;
      shared.uPluckAmp.value = pluck.amp;
    } else {
      shared.uPluckAmp.value = 0;
    }

    renderer.render(scene, camera);
    if (!ready) {
      ready = true;
      canvas.dataset.ready = 'true';
      hero.dataset.gl = 'ready';
    }
  };

  let inView = true;
  let running = false;
  const applyLoop = () => {
    const shouldRun = inView && !reduceMotion.matches;
    if (shouldRun && !running) {
      renderer.setAnimationLoop(frame);
      running = true;
    } else if (!shouldRun) {
      renderer.setAnimationLoop(null);
      running = false;
      frame();
    }
  };

  const io = new IntersectionObserver(
    (entries) => {
      inView = entries.some((entry) => entry.isIntersecting);
      applyLoop();
    },
    { threshold: 0 },
  );
  io.observe(canvas);

  let resizeQueued = false;
  const resizeObserver = new ResizeObserver(() => {
    if (resizeQueued) return;
    resizeQueued = true;
    requestAnimationFrame(() => {
      resizeQueued = false;
      layout();
      if (!running) frame();
    });
  });
  resizeObserver.observe(canvas);
  reduceMotion.addEventListener('change', applyLoop);

  const onContextLost = (event: Event) => {
    event.preventDefault();
    renderer.setAnimationLoop(null);
    running = false;
    hero.dataset.gl = 'fallback';
  };
  canvas.addEventListener('webglcontextlost', onContextLost);

  layout();
  applyLoop();

  return () => {
    renderer.setAnimationLoop(null);
    io.disconnect();
    resizeObserver.disconnect();
    reduceMotion.removeEventListener('change', applyLoop);
    window.removeEventListener('pointermove', onPointerMove);
    document.documentElement.removeEventListener('pointerleave', onPointerLeave);
    canvas.removeEventListener('webglcontextlost', onContextLost);
    strands.forEach((strand) => strand.materials.forEach((material) => material.dispose()));
    stripGeometry.dispose();
    paperGeometry.dispose();
    paperMaterial.dispose();
    renderer.dispose();
    delete hero.dataset.gl;
    delete canvas.dataset.ready;
  };
}
