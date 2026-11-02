import { useEffect, useRef } from 'react';

type Three = typeof import('three');

interface Props {
  className?: string;
}

/**
 * ヒーローの WebGL シーン。紙縒り（こより）のように、ラベンダーとセージの帯が
 * ねじれながら流れる。マウスで傾き、スクロールで沈む。
 * prefers-reduced-motion のときは 1 フレームだけ描いて止める。
 */
export default function KoyoriScene({ className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;
    let cleanup = () => {};
    import('three').then((THREE) => {
      if (disposed) return;
      cleanup = start(THREE, canvas);
    });
    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}

function start(THREE: Three, canvas: HTMLCanvasElement): () => void {
  let renderer: InstanceType<Three['WebGLRenderer']>;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
  } catch {
    return () => {};
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0e0d12, 0.055);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80);
  camera.position.set(0, 0, 11);

  // 螺旋。x 軸に沿って伸びる
  class Helix extends THREE.Curve<InstanceType<Three['Vector3']>> {
    constructor(
      private phase: number,
      private turns = 3.4,
      private radius = 0.72,
      private length = 18,
    ) {
      super();
    }
    override getPoint(t: number, target = new THREE.Vector3()) {
      const a = t * Math.PI * 2 * this.turns + this.phase;
      return target.set(
        (t - 0.5) * this.length,
        Math.cos(a) * this.radius,
        Math.sin(a) * this.radius,
      );
    }
  }

  const tilt = new THREE.Group(); // 固定の傾き + マウスの傾き
  const spin = new THREE.Group(); // 軸回転。螺旋が流れて見える
  tilt.add(spin);
  scene.add(tilt);
  tilt.rotation.set(0, 0.55, -0.42);
  tilt.position.set(1.6, 0.2, 0);

  const strand = (phase: number, color: number, emissive: number) => {
    const geometry = new THREE.TubeGeometry(new Helix(phase), 420, 0.27, 28, false);
    const material = new THREE.MeshPhysicalMaterial({
      color,
      emissive,
      emissiveIntensity: 0.28,
      roughness: 0.3,
      metalness: 0.12,
      clearcoat: 0.9,
      clearcoatRoughness: 0.25,
      sheen: 0.4,
      sheenColor: new THREE.Color(color),
    });
    const mesh = new THREE.Mesh(geometry, material);
    spin.add(mesh);
    return { geometry, material };
  };
  const lavender = strand(0, 0xc4b5df, 0x3e3058);
  const sage = strand(Math.PI, 0x9fc2a9, 0x1f3a2a);

  scene.add(new THREE.AmbientLight(0x7a6a9c, 0.55));
  const key = new THREE.DirectionalLight(0xfff6ff, 2.4);
  key.position.set(4, 6, 8);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x9fc2a9, 3);
  rim.position.set(-7, -2, -6);
  scene.add(rim);
  const glow = new THREE.PointLight(0xc4b5df, 40, 40, 2);
  glow.position.set(-4, 3, 4);
  scene.add(glow);

  // 粒子
  const count = 420;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 26;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 12 - 2;
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const dustMaterial = new THREE.PointsMaterial({
    color: 0xdfd5f3,
    size: 0.045,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
  });
  const dust = new THREE.Points(dustGeometry, dustMaterial);
  scene.add(dust);

  // 入力
  const pointer = { x: 0, y: 0 };
  const eased = { x: 0, y: 0 };
  let scroll = 0;
  const onPointerMove = (event: PointerEvent) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
  };
  const onScroll = () => {
    scroll = window.scrollY;
  };
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });

  // astro-island は display: contents なので、親ではなく canvas 自身の寸法を使う
  const resize = () => {
    const width = canvas.clientWidth || 1;
    const height = canvas.clientHeight || 1;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // 縦長の画面では引いて、帯が画面を横切るようにする
    camera.position.z = camera.aspect < 0.8 ? 15 : camera.aspect < 1.2 ? 13 : 11;
    camera.updateProjectionMatrix();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const startedAt = performance.now();
  let visible = true;

  const frame = () => {
    const t = (performance.now() - startedAt) / 1000;
    eased.x += (pointer.x - eased.x) * 0.04;
    eased.y += (pointer.y - eased.y) * 0.04;
    spin.rotation.x = t * 0.32;
    tilt.rotation.y = 0.55 + eased.x * 0.18;
    tilt.rotation.z = -0.42 - eased.y * 0.08;
    tilt.position.y = 0.2 - scroll * 0.0025;
    dust.rotation.y = t * 0.015;
    dust.position.y = -scroll * 0.0012;
    glow.position.x = -4 + eased.x * 2;
    glow.position.y = 3 - eased.y * 2;
    renderer.render(scene, camera);
  };

  const applyLoop = () => {
    if (reduceMotion.matches || !visible) {
      renderer.setAnimationLoop(null);
      frame();
    } else {
      renderer.setAnimationLoop(frame);
    }
  };
  const io = new IntersectionObserver(
    (entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      applyLoop();
    },
    { threshold: 0 },
  );
  io.observe(canvas);
  reduceMotion.addEventListener('change', applyLoop);
  applyLoop();
  canvas.dataset.ready = 'true';

  return () => {
    renderer.setAnimationLoop(null);
    io.disconnect();
    observer.disconnect();
    reduceMotion.removeEventListener('change', applyLoop);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('scroll', onScroll);
    lavender.geometry.dispose();
    lavender.material.dispose();
    sage.geometry.dispose();
    sage.material.dispose();
    dustGeometry.dispose();
    dustMaterial.dispose();
    renderer.dispose();
  };
}
