/**
 * トップのヒーローで使う GLSL。
 *
 * 紙の帯（strip）4 本を 1 枚の PlaneGeometry（uv.x = 長さ方向、uv.y = 幅方向）から作り、
 * 位置はすべて頂点シェーダーで計算する。
 *   - 前半（s < uSJ）: 4 本が螺旋状に重なって 1 本の紙縒りになり、紙面（z = 0）を縫うように出入りする
 *   - 後半（s >= uSJ）: 紙縒りがほどけ、4 本がそれぞれ細く撚られながら下端の出口（プロダクト）へ向かう
 * 同じ頂点計算を 3 つのモードで使う。0 = 本体、1 = 紙面に落ちる影、2 = 紙の裏に透ける色。
 */

const noise = /* glsl */ `
float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
`;

export const stripVertex = /* glsl */ `
precision highp float;

uniform float uI;          // 糸の番号 0..3
uniform vec2 uS;           // 紙縒りの始点（world xy）
uniform vec2 uU;           // 紙縒りの向き（単位ベクトル）
uniform float uLc;         // 始点からほどけ始めまでの長さ
uniform float uA;          // 紙面から浮き沈みする高さ
uniform float uOmega;      // 縫い目の角周波数
uniform float uR;          // 紙縒りの半径
uniform float uK;          // 撚りの強さ（rad / world）
uniform float uRoll;       // 指で転がすような撚りの揺れ
uniform float uSJ;         // メッシュ上でほどけ始める位置（0..1）
uniform vec3 uP1;          // ほどけた糸のベジエ制御点
uniform vec3 uP2;
uniform vec3 uP3;
uniform float uWEnd;       // 出口での糸の太さ
uniform float uPsiEnd;     // 出口で正面を向くための角度
uniform float uPluckAmp;   // ポインターで弾いた量
uniform float uPluckT;
uniform float uPluckSigma;
uniform int uMode;
uniform vec2 uShadowDir;

varying float vS;
varying float vV;
varying float vLen;
varying float vFlat;
varying float vStrand;
varying float vAlpha;
varying float vDist;
varying float vZ;
varying vec3 vN;

const float HALF_PI = 1.5707963;
const float PI = 3.1415926;

vec3 axisAt(float t) {
  float c = cos(uOmega * (t - uLc));
  float stitch = abs(c);
  vec2 n = vec2(-uU.y, uU.x);
  float d = (t - uPluckT) / uPluckSigma;
  float bump = uPluckAmp * exp(-d * d) * stitch;
  return vec3(uS + uU * t + n * bump, uA * (c - 0.22));
}

void frameAt(float t, out vec3 B1, out vec3 B2) {
  vec3 T = normalize(axisAt(t + 0.01) - axisAt(t - 0.01));
  B1 = normalize(cross(T, vec3(0.0, 0.0, 1.0)));
  B2 = cross(B1, T);
}

float lambda() { return 6.2831853 / uOmega; }
float flatAt(float t) { return smoothstep(uLc - 0.6 * lambda(), uLc, t); }
float thetaAt(float t) { return uI * HALF_PI + uK * (t - uLc) + uRoll; }
float halfWidthAt(float f) { return HALF_PI * 0.5 * mix(0.96, 0.82, f); }

// 紙縒り部分の点。v は幅方向 -0.5..0.5。center は帯の中心、axis は紙縒りの芯
vec3 cordPoint(float t, float v, out vec3 center, out vec3 axis) {
  vec3 B1; vec3 B2;
  frameAt(t, B1, B2);
  vec3 ax = axisAt(t);
  axis = ax;
  float f = flatAt(t);
  float loosen = 1.0 + 0.35 * f;
  float hw = halfWidthAt(f);
  float th = thetaAt(t);
  float r = uR * loosen * (1.0 + 0.07 * cos(v * PI));
  float phi = th + v * 2.0 * hw;
  vec3 arc = ax + r * (cos(phi) * B1 + sin(phi) * B2);
  center = ax + uR * loosen * (cos(th) * B1 + sin(th) * B2);
  vec3 tang = -sin(th) * B1 + cos(th) * B2;
  vec3 chord = center + tang * v * 2.0 * hw * uR * loosen;
  return mix(arc, chord, f);
}

vec3 bez(vec3 a, vec3 b, vec3 c, vec3 d, float x) {
  float y = 1.0 - x;
  return y * y * y * a + 3.0 * y * y * x * b + 3.0 * y * x * x * c + x * x * x * d;
}

// ほどけた糸の点。sb は 0..1
vec3 strandPoint(float sb, float v, out vec3 center) {
  vec3 root;
  vec3 rootAxis;
  cordPoint(uLc, 0.0, root, rootAxis);
  float hw0 = halfWidthAt(1.0);
  float w0 = 2.0 * hw0 * uR * 1.35;
  vec3 p1 = uP1;
  center = bez(root, p1, uP2, uP3, sb);
  vec3 T = normalize(bez(root, p1, uP2, uP3, sb + 0.002) - bez(root, p1, uP2, uP3, sb - 0.002));
  vec3 N1 = normalize(cross(T, vec3(0.0, 0.0, 1.0)));
  vec3 N2 = cross(N1, T);
  float psi0 = thetaAt(uLc) + HALF_PI;
  float e = smoothstep(0.0, 1.0, sb);
  float psi = mix(psi0, uPsiEnd, e);
  float w = mix(w0, uWEnd, smoothstep(0.2, 0.92, sb));
  return center + w * v * (cos(psi) * N1 + sin(psi) * N2);
}

// axis は影の基準にする線。紙縒りでは芯、ほどけた糸では糸の中心
vec3 pointAt(float s, float v, out vec3 axis) {
  vec3 center;
  if (s < uSJ) {
    return cordPoint(s / uSJ * uLc, v, center, axis);
  }
  vec3 p = strandPoint((s - uSJ) / (1.0 - uSJ), v, center);
  axis = center;
  return p;
}

void main() {
  float s = uv.x;
  float v = uv.y - 0.5;
  vec3 c0; vec3 c1; vec3 c2;
  vec3 P = pointAt(s, v, c0);
  vec3 Ps = pointAt(s + 0.0012, v, c1);
  vec3 Pv = pointAt(s, v + 0.05, c2);
  vN = normalize(cross(Ps - P, Pv - P));

  vS = s;
  vV = v;
  vStrand = step(uSJ, s);
  vFlat = s < uSJ ? flatAt(s / uSJ * uLc) : 1.0;
  vLen = s < uSJ ? s / uSJ * uLc : uLc + (s - uSJ) / (1.0 - uSJ) * 4.0;
  vZ = P.z;
  vAlpha = 1.0;
  vDist = 0.0;

  vec3 outP = P;
  if (uMode == 1) {
    // 影: 中心線から外へ膨らませて紙面に投影する。濃さは位置だけで決まるので、重なっても揃う
    float h = max(c0.z, 0.0);
    float inflate = 1.4 + h / uA * 0.9;
    vec3 Q = c0 + (P - c0) * inflate;
    outP = vec3(Q.xy + uShadowDir * h, 0.0016);
    vDist = vStrand > 0.5 ? abs(v) * 2.0 : length(Q.xy - c0.xy) / (uR * inflate);
    vAlpha = 0.24 * smoothstep(0.0, uA * 0.7, h) * (1.0 - 0.35 * h / uA);
  } else if (uMode == 2) {
    // 紙の裏に透ける色。紙面より奥にある部分だけ
    outP = vec3(P.xy, 0.0008);
    vAlpha = 0.3 * (1.0 - smoothstep(0.0, uA * 1.2, -P.z));
  }
  gl_Position = projectionMatrix * viewMatrix * vec4(outP, 1.0);
}
`;

export const stripFragment = /* glsl */ `
precision highp float;

uniform vec3 uColor;
uniform vec3 uBack;
uniform int uMode;
uniform float uReveal;

varying float vS;
varying float vV;
varying float vLen;
varying float vFlat;
varying float vStrand;
varying float vAlpha;
varying float vDist;
varying float vZ;
varying vec3 vN;

${noise}

void main() {
  if (vS > uReveal) discard;
  float edge = abs(vV) * 2.0;

  if (uMode == 1) {
    float a = vAlpha * (1.0 - smoothstep(0.2, 1.0, vDist));
    if (a < 0.004) discard;
    gl_FragColor = vec4(0.11, 0.09, 0.15, a);
    return;
  }
  if (uMode == 2) {
    if (vZ > 0.0) discard;
    float a = vAlpha * (1.0 - smoothstep(0.7, 1.0, edge));
    gl_FragColor = vec4(uColor, a);
    return;
  }

  // ほどけた糸の縁は、紙をちぎったように少し欠く
  if (vStrand > 0.5) {
    float tear = 0.93 - 0.14 * vnoise(vec2(vLen * 38.0, vS * 3.0));
    if (edge > tear) discard;
  }

  vec3 N = normalize(vN);
  vec3 base = uColor;
  if (!gl_FrontFacing) {
    N = -N;
    base = uBack;
  }
  // 紙の繊維は長さ方向に流れる
  float fib = vnoise(vec2(vLen * 22.0, vV * 5.0)) * 0.6 + vnoise(vec2(vLen * 70.0, vV * 28.0)) * 0.4;
  vec3 L = normalize(vec3(-0.45, 0.65, 0.62));
  float dif = max(dot(N, L), 0.0) * 0.5 + 0.58;
  float rim = 1.0 - 0.28 * pow(1.0 - abs(N.z), 2.0);
  float ao = mix(1.0, 0.7, smoothstep(0.6, 1.0, edge) * (1.0 - vFlat));
  vec3 col = base * dif * rim * ao * (0.95 + 0.08 * fib);
  gl_FragColor = vec4(col, 1.0);
}
`;

export const paperVertex = /* glsl */ `
void main() {
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
`;

export const paperFragment = /* glsl */ `
precision highp float;

uniform float uDpr;
uniform vec3 uPaper;
uniform vec4 uHoles[16]; // x, y（CSS px、左下原点）, 角度, 現れる位置（メッシュの s）
uniform float uHoleCount;
uniform float uHoleR;
uniform float uReveal;

void main() {
  vec2 px = gl_FragCoord.xy / uDpr;
  // 紙はページの地と同じ色のまま。紙縒りが紙を通る穴のまわりだけ、わずかに沈ませる
  vec3 col = uPaper;
  for (int k = 0; k < 16; k++) {
    if (float(k) >= uHoleCount) break;
    vec4 hk = uHoles[k];
    if (hk.w > uReveal) continue;
    vec2 q = px - hk.xy;
    float ca = cos(hk.z);
    float sa = sin(hk.z);
    vec2 r = vec2(ca * q.x + sa * q.y, -sa * q.x + ca * q.y);
    float e = length(r / vec2(uHoleR * 1.7, uHoleR * 1.25));
    col *= 1.0 - 0.2 * (1.0 - smoothstep(0.45, 1.0, e));
  }
  gl_FragColor = vec4(col, 1.0);
}
`;
