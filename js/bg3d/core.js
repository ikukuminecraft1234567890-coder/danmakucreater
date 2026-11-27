/**
 * 2D疑似3D背景エンジン コアモジュール (js/bg3d/core.js)
 * 決定論的ノイズ・3Dカメラ/透視投影・デプスフォグ・キャッシュ済みプロシージャルテクスチャ・
 * オーガニックスタンプスプライト・高精度3D建築/自然プリミティブを提供します。
 *
 * 制約:
 * - ctx.shadowBlur 不使用 (ラジアルグラデーション等で発光表現)
 * - Node mockCtx セーフ (document / CanvasPattern / getImageData 非存在時もクラッシュしない)
 * - NaN / Infinity ガード済み、キャッシュ活用により <2ms/frame を維持
 */
(function (global) {
    'use strict';

    const NEAR_Z = 14;
    const RENDERERS = {};

    /**
     * プリセットIDに対応する3D背景レンダラを登録します。
     * @param {string} id
     * @param {Function} fn (ctx, W, H, t) => void
     */
    function registerRenderer(id, fn) {
        if (typeof id === 'string' && typeof fn === 'function') {
            RENDERERS[id] = fn;
        }
        return fn;
    }

    // ── 決定論的数学・ノイズ ──────────────────────────────────────

    function hash01(n) {
        const s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
        return s - Math.floor(s);
    }

    function hashIdx(idx, salt) {
        return hash01(idx * 17.13 + (salt || 0) * 53.71);
    }

    function clamp(v, lo, hi) {
        return v < lo ? lo : (v > hi ? hi : v);
    }

    function clampByte(v) {
        if (!(v >= 0)) return 0;
        return v > 255 ? 255 : (v | 0);
    }

    function modPos(x, m) {
        if (!m) return 0;
        const r = x % m;
        return r < 0 ? r + m : r;
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function lerpRGB(c1, c2, t) {
        const k = clamp(t, 0, 1);
        return [
            clampByte(c1[0] + (c2[0] - c1[0]) * k),
            clampByte(c1[1] + (c2[1] - c1[1]) * k),
            clampByte(c1[2] + (c2[2] - c1[2]) * k)
        ];
    }

    function hash2D(ix, iy, seed) {
        const s = Math.sin(ix * 127.1 + iy * 311.7 + (seed || 0) * 74.7) * 43758.5453123;
        return s - Math.floor(s);
    }

    function noise2D(x, y, seed) {
        const ix = Math.floor(x);
        const iy = Math.floor(y);
        const fx = x - ix;
        const fy = y - iy;
        const ux = fx * fx * (3 - 2 * fx);
        const uy = fy * fy * (3 - 2 * fy);
        const sd = seed || 0;
        const a = hash2D(ix, iy, sd);
        const b = hash2D(ix + 1, iy, sd);
        const c = hash2D(ix, iy + 1, sd);
        const d = hash2D(ix + 1, iy + 1, sd);
        return (a + (b - a) * ux) + ((c + (d - c) * ux) - (a + (b - a) * ux)) * uy;
    }

    function fbm2D(x, y, octaves, seed) {
        const oct = clamp(octaves || 4, 1, 8);
        const sd = seed || 0;
        let sum = 0;
        let amp = 0.5;
        let freq = 1;
        let norm = 0;
        for (let i = 0; i < oct; i++) {
            sum += noise2D(x * freq, y * freq, sd + i * 19.31) * amp;
            norm += amp;
            amp *= 0.5;
            freq *= 2.02;
        }
        return norm > 0 ? sum / norm : 0;
    }

    // ── 3Dカメラ・透視投影・フォグ ─────────────────────────────────

    function makeCamera(W, H, opts) {
        const o = opts || {};
        const yaw = o.yaw || 0;
        const pitch = o.pitch || 0;
        const roll = o.roll || 0;
        return {
            W: W,
            H: H,
            cx: W * 0.5,
            horizonY: o.horizonY !== undefined ? o.horizonY : H * 0.34,
            fov: o.fov || W * 0.72,
            x: o.x || 0,
            y: o.y !== undefined ? o.y : 140,
            z: o.z || 0,
            yaw: yaw,
            pitch: pitch,
            roll: roll,
            cosY: Math.cos(yaw),
            sinY: Math.sin(yaw),
            cosP: Math.cos(pitch),
            sinP: Math.sin(pitch),
            cosR: Math.cos(roll),
            sinR: Math.sin(roll),
            fogRGB: o.fogRGB || [10, 12, 24],
            fogDist: o.fogDist || 1200,
            maxZ: o.maxZ || 2200
        };
    }

    function toView(cam, wx, wy, wz) {
        const dx = wx - cam.x;
        const dy = wy - cam.y;
        const dz = wz - cam.z;
        const yx = cam.yaw ? (dx * cam.cosY - dz * cam.sinY) : dx;
        const yz = cam.yaw ? (dx * cam.sinY + dz * cam.cosY) : dz;
        const py = dy * cam.cosP - yz * cam.sinP;
        const vz = dy * cam.sinP + yz * cam.cosP;
        const vx = cam.roll ? (yx * cam.cosR - py * cam.sinR) : yx;
        const vy = cam.roll ? (yx * cam.sinR + py * cam.cosR) : py;
        return [vx, vy, vz];
    }

    function projectView(cam, vx, vy, vz) {
        if (!(vz > 0.001) || !Number.isFinite(vx) || !Number.isFinite(vy) || !Number.isFinite(vz)) return null;
        const s = cam.fov / vz;
        const sx = cam.cx + vx * s;
        const sy = cam.horizonY - vy * s;
        if (!Number.isFinite(sx) || !Number.isFinite(sy) || !Number.isFinite(s)) return null;
        return [sx, sy, s];
    }

    function projectWorld(cam, wx, wy, wz) {
        const v = toView(cam, wx, wy, wz);
        const p = projectView(cam, v[0], v[1], v[2]);
        if (!p) return null;
        return [p[0], p[1], p[2], v[2]];
    }

    function fogFactor(cam, vz) {
        const dist = cam.fogDist || 1200;
        const fRaw = 1 - Math.exp(-Math.max(0, vz) / dist);
        return fRaw < 0 ? 0 : (fRaw > 0.96 ? 0.96 : fRaw);
    }

    function foggedRGBA(cam, rgb, shade, vz, alpha) {
        if (!rgb) return null;
        const sh = shade !== undefined ? shade : 1;
        const f = fogFactor(cam, vz);
        const inv = 1 - f;
        const r = clampByte(rgb[0] * sh * inv + cam.fogRGB[0] * f);
        const g = clampByte(rgb[1] * sh * inv + cam.fogRGB[1] * f);
        const b = clampByte(rgb[2] * sh * inv + cam.fogRGB[2] * f);
        const farFade = vz > cam.maxZ * 0.78 ? Math.max(0, 1 - (vz - cam.maxZ * 0.78) / (cam.maxZ * 0.22)) : 1;
        const a = (alpha !== undefined ? alpha : 1) * farFade;
        if (!(a > 0.004)) return null;
        return a >= 0.996 ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a.toFixed(3)})`;
    }

    // ── オフスクリーンキャンバス安全生成 ────────────────────────────

    function createOffscreenCanvas(w, h) {
        if (typeof document === 'undefined' || typeof document.createElement !== 'function') return null;
        try {
            const c = document.createElement('canvas');
            if (!c || typeof c.getContext !== 'function') return null;
            c.width = w;
            c.height = h;
            const g = c.getContext('2d');
            if (!g || typeof g.fillRect !== 'function' || typeof g.beginPath !== 'function') return null;
            return { canvas: c, ctx: g };
        } catch (e) {
            return null;
        }
    }

    function safeAddColorStop(grad, offset, color) {
        if (grad && typeof grad.addColorStop === 'function') {
            grad.addColorStop(clamp(offset, 0, 1), color);
        }
    }

    function safeEllipse(ctx, x, y, rx, ry, rot) {
        if (typeof ctx.ellipse === 'function') {
            ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot || 0, 0, Math.PI * 2);
        } else {
            ctx.arc(x, y, Math.max(0.1, (rx + ry) * 0.5), 0, Math.PI * 2);
        }
    }

    // ── キャッシュ済みプロシージャルテクスチャ & パターン ─────────────

    const TEX_SIZE = 128;
    const _texCache = Object.create(null);
    const _patternCache = typeof WeakMap !== 'undefined' ? new WeakMap() : null;

    function fillWrappedRect(g, S, x, y, w, h) {
        for (let ox = -S; ox <= S; ox += S) {
            for (let oy = -S; oy <= S; oy += S) {
                const dx = x + ox, dy = y + oy;
                if (dx + w >= 0 && dx <= S && dy + h >= 0 && dy <= S) {
                    g.fillRect(dx, dy, w, h);
                }
            }
        }
    }

    function drawWrappedCircle(g, S, cx, cy, r, fill, stroke, lw) {
        for (let ox = -S; ox <= S; ox += S) {
            for (let oy = -S; oy <= S; oy += S) {
                const dx = cx + ox, dy = cy + oy;
                if (dx + r >= 0 && dx - r <= S && dy + r >= 0 && dy - r <= S) {
                    g.beginPath();
                    g.arc(dx, dy, r, 0, Math.PI * 2);
                    if (fill) { g.fillStyle = fill; g.fill(); }
                    if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw || 1; g.stroke(); }
                }
            }
        }
    }

    function addGrainDots(g, S, count, seed, lightCol, darkCol, maxSz) {
        for (let i = 0; i < count; i++) {
            const x = hashIdx(i, seed) * S;
            const y = hashIdx(i, seed + 7) * S;
            const sz = 1 + hashIdx(i, seed + 13) * (maxSz || 2);
            g.fillStyle = (i & 1) ? lightCol : darkCol;
            fillWrappedRect(g, S, x, y, sz, sz);
        }
    }

    function buildStoneTilesTex(g, S) {
        g.fillStyle = '#5c6068';
        g.fillRect(0, 0, S, S);
        const rows = 4, cols = 4;
        const th = S / rows, tw = S / cols;
        for (let r = 0; r < rows; r++) {
            const offset = (r & 1) ? tw * 0.5 : 0;
            for (let c = -1; c <= cols; c++) {
                const x = c * tw + offset;
                const y = r * th;
                const v = Math.floor((hashIdx(r * 13 + c + 10, 3) - 0.5) * 26);
                g.fillStyle = `rgb(${112 + v},${116 + v},${124 + v})`;
                g.fillRect(x + 2, y + 2, tw - 4, th - 4);
                g.fillStyle = 'rgba(255,255,255,0.16)';
                g.fillRect(x + 2, y + 2, tw - 4, 2);
                g.fillRect(x + 2, y + 2, 2, th - 4);
                g.fillStyle = 'rgba(10,12,18,0.45)';
                g.fillRect(x, y, tw, 2);
                g.fillRect(x, y, 2, th);
            }
        }
        addGrainDots(g, S, 180, 11, 'rgba(255,255,255,0.08)', 'rgba(0,0,0,0.14)', 2);
    }

    function drawWrappedRoundStone(g, S, x, y, w, h, rad, fill, stroke, hi) {
        const r = Math.min(rad, w * 0.38, h * 0.38);
        for (let ox = -S; ox <= S; ox += S) {
            for (let oy = -S; oy <= S; oy += S) {
                const dx = x + ox, dy = y + oy;
                if (dx + w < 0 || dx > S || dy + h < 0 || dy > S) continue;
                g.beginPath();
                g.moveTo(dx + r, dy);
                g.lineTo(dx + w - r, dy);
                g.quadraticCurveTo(dx + w, dy, dx + w, dy + r);
                g.lineTo(dx + w, dy + h - r);
                g.quadraticCurveTo(dx + w, dy + h, dx + w - r, dy + h);
                g.lineTo(dx + r, dy + h);
                g.quadraticCurveTo(dx, dy + h, dx, dy + h - r);
                g.lineTo(dx, dy + r);
                g.quadraticCurveTo(dx, dy, dx + r, dy);
                g.closePath();
                g.fillStyle = fill;
                g.fill();
                if (stroke) {
                    g.strokeStyle = stroke;
                    g.lineWidth = 1.6;
                    g.stroke();
                }
                if (hi) {
                    g.fillStyle = hi;
                    g.fillRect(dx + r, dy + 1.5, Math.max(2, w - r * 2), 1.6);
                }
            }
        }
    }

    function buildCobblestoneTex(g, S) {
        g.fillStyle = '#1b1f22';
        g.fillRect(0, 0, S, S);
        addGrainDots(g, S, 75, 20, 'rgba(44,72,46,0.28)', 'rgba(10,12,14,0.35)', 3);
        const rows = 5;
        const ch = S / rows;
        for (let r = 0; r < rows; r++) {
            const cols = (r & 1) ? 3 : 4;
            let cursor = ((r * 29) % S);
            for (let c = 0; c < cols; c++) {
                const idx = r * 7 + c;
                const w = (S / cols) - 3 + (hashIdx(idx, 1) - 0.5) * 6;
                const h = ch - 3.5 + (hashIdx(idx, 2) - 0.5) * 2.5;
                const sx = modPos(cursor, S);
                const sy = modPos(r * ch + 1.5 + (hashIdx(idx, 3) - 0.5) * 2, S);
                const tone = Math.floor(66 + hashIdx(idx, 4) * 32);
                const warm = Math.floor((hashIdx(idx, 5) - 0.5) * 10);
                drawWrappedRoundStone(
                    g, S, sx, sy, Math.max(14, w), Math.max(12, h), 5,
                    `rgb(${tone + warm},${tone + 2},${tone + 6 - warm})`,
                    'rgba(8,10,14,0.72)',
                    'rgba(205,215,230,0.12)'
                );
                cursor += S / cols;
            }
        }
        addGrainDots(g, S, 130, 21, 'rgba(165,180,175,0.09)', 'rgba(0,0,0,0.2)', 1.8);
    }

    function buildMarbleVeinsTex(g, S) {
        g.fillStyle = '#e8e4dc';
        g.fillRect(0, 0, S, S);
        for (let y = 0; y < S; y += 2) {
            for (let x = 0; x < S; x += 2) {
                const nx = Math.cos((x / S) * Math.PI * 2) * 1.4;
                const ny = Math.sin((y / S) * Math.PI * 2) * 1.4;
                const v = fbm2D(nx + 3.1, ny + 1.7, 3, 4);
                const vein = Math.abs(Math.sin((x + y) * 0.05 + v * 6.5));
                if (vein < 0.14) {
                    const a = (1 - vein / 0.14) * 0.38;
                    g.fillStyle = `rgba(88,92,108,${a.toFixed(2)})`;
                    g.fillRect(x, y, 2, 2);
                } else if (vein > 0.94) {
                    g.fillStyle = 'rgba(195,168,110,0.22)';
                    g.fillRect(x, y, 2, 2);
                }
            }
        }
        g.strokeStyle = 'rgba(120,115,108,0.16)';
        g.lineWidth = 1;
        g.strokeRect(0.5, 0.5, S - 1, S - 1);
    }

    function buildWoodPlanksTex(g, S) {
        const planks = 4;
        const ph = S / planks;
        for (let p = 0; p < planks; p++) {
            const y0 = p * ph;
            const tone = Math.floor(hashIdx(p, 5) * 18);
            g.fillStyle = `rgb(${118 + tone},${76 + Math.floor(tone * 0.7)},${46 + Math.floor(tone * 0.4)})`;
            g.fillRect(0, y0, S, ph);
            for (let s = 0; s < 7; s++) {
                const gy = y0 + 3 + (s / 7) * (ph - 6);
                g.strokeStyle = (s & 1) ? 'rgba(54,28,12,0.28)' : 'rgba(180,126,76,0.16)';
                g.lineWidth = 1;
                g.beginPath();
                for (let x = 0; x <= S; x += 8) {
                    const wave = Math.sin((x / S) * Math.PI * 2 + p * 1.9 + s) * 1.8;
                    if (x === 0) g.moveTo(x, gy + wave);
                    else g.lineTo(x, gy + wave);
                }
                g.stroke();
            }
            g.fillStyle = 'rgba(22,10,4,0.65)';
            g.fillRect(0, y0, S, 2);
            g.fillStyle = 'rgba(255,220,175,0.12)';
            g.fillRect(0, y0 + 2, S, 1);
            const jointX = modPos(p * 47 + 24, S);
            g.fillStyle = 'rgba(22,10,4,0.55)';
            g.fillRect(jointX, y0, 2, ph);
            drawWrappedCircle(g, S, modPos(jointX + 6, S), y0 + 7, 1.5, 'rgba(30,22,16,0.75)', null, 0);
            drawWrappedCircle(g, S, modPos(jointX + 6, S), y0 + ph - 7, 1.5, 'rgba(30,22,16,0.75)', null, 0);
        }
    }

    function buildRedCarpetTex(g, S) {
        g.fillStyle = '#7c121e';
        g.fillRect(0, 0, S, S);
        for (let y = 0; y < S; y += 4) {
            g.fillStyle = (y & 4) ? 'rgba(255,140,140,0.06)' : 'rgba(20,0,5,0.14)';
            g.fillRect(0, y, S, 2);
        }
        g.strokeStyle = 'rgba(232,190,88,0.34)';
        g.lineWidth = 1.4;
        const step = 32;
        for (let y = 0; y < S; y += step) {
            for (let x = 0; x < S; x += step) {
                const cx = x + step * 0.5, cy = y + step * 0.5;
                g.beginPath();
                g.moveTo(cx, y + 3);
                g.lineTo(x + step - 3, cy);
                g.lineTo(cx, y + step - 3);
                g.lineTo(x + 3, cy);
                g.closePath();
                g.stroke();
                drawWrappedCircle(g, S, cx, cy, 2.5, 'rgba(245,208,110,0.28)', null, 0);
            }
        }
        g.fillStyle = 'rgba(225,180,72,0.52)';
        g.fillRect(0, 0, 5, S);
        g.fillRect(S - 5, 0, 5, S);
    }

    function buildTatamiTex(g, S) {
        g.fillStyle = '#9ea672';
        g.fillRect(0, 0, S, S);
        for (let y = 0; y < S; y += 2) {
            const v = (hashIdx(y, 31) - 0.5) * 18;
            g.fillStyle = `rgb(${clampByte(156 + v)},${clampByte(166 + v)},${clampByte(108 + v)})`;
            g.fillRect(0, y, S, 1);
        }
        for (let x = 0; x < S; x += 8) {
            g.fillStyle = 'rgba(70,78,42,0.16)';
            g.fillRect(x, 0, 1, S);
        }
        g.fillStyle = '#243028';
        g.fillRect(0, 0, 8, S);
        g.fillRect(S - 8, 0, 8, S);
        g.fillStyle = 'rgba(212,186,96,0.35)';
        g.fillRect(2, 0, 1, S);
        g.fillRect(S - 3, 0, 1, S);
    }

    function buildShojiTex(g, S) {
        g.fillStyle = '#f2ebd8';
        g.fillRect(0, 0, S, S);
        addGrainDots(g, S, 90, 41, 'rgba(255,255,255,0.35)', 'rgba(205,190,160,0.2)', 3);
        const cols = 4, rows = 4;
        const cw = S / cols, rh = S / rows;
        g.fillStyle = '#4a3220';
        for (let i = 0; i <= cols; i++) {
            g.fillRect(i * cw - 2, 0, 4, S);
        }
        for (let j = 0; j <= rows; j++) {
            g.fillRect(0, j * rh - 2, S, 4);
        }
        g.fillStyle = 'rgba(255,244,210,0.2)';
        for (let j = 0; j < rows; j++) {
            for (let i = 0; i < cols; i++) {
                g.fillRect(i * cw + 3, j * rh + 3, cw - 6, 2);
            }
        }
    }

    function buildKawaraTileTex(g, S) {
        g.fillStyle = '#363d48';
        g.fillRect(0, 0, S, S);
        const cols = 4, rows = 4;
        const cw = S / cols, rh = S / rows;
        for (let r = 0; r < rows; r++) {
            const y0 = r * rh;
            for (let c = 0; c < cols; c++) {
                const x0 = c * cw;
                const grad = g.createLinearGradient(x0, y0, x0 + cw, y0);
                safeAddColorStop(grad, 0, '#232830');
                safeAddColorStop(0.45, '#525b68');
                safeAddColorStop(0.7, '#646f7e');
                safeAddColorStop(1, '#262b34');
                g.fillStyle = grad;
                g.fillRect(x0, y0, cw, rh);
                g.fillStyle = 'rgba(10,12,16,0.55)';
                g.fillRect(x0, y0 + rh - 3, cw, 3);
                g.fillStyle = 'rgba(205,220,240,0.16)';
                g.fillRect(x0 + cw * 0.45, y0, 2, rh - 2);
            }
        }
    }

    function buildSandstoneHieroglyphTex(g, S) {
        g.fillStyle = '#b48a52';
        g.fillRect(0, 0, S, S);
        addGrainDots(g, S, 160, 52, 'rgba(240,210,150,0.16)', 'rgba(85,58,28,0.2)', 2);
        const cells = 2;
        const cs = S / cells;
        for (let r = 0; r < cells; r++) {
            for (let c = 0; c < cells; c++) {
                const x = c * cs, y = r * cs;
                g.strokeStyle = 'rgba(72,48,22,0.58)';
                g.lineWidth = 2;
                g.strokeRect(x + 3, y + 3, cs - 6, cs - 6);
                g.strokeStyle = 'rgba(85,225,215,0.42)';
                g.lineWidth = 1.4;
                const cx = x + cs * 0.5, cy = y + cs * 0.5;
                g.beginPath();
                g.arc(cx, cy - 8, 7, 0, Math.PI * 2);
                g.moveTo(cx, cy - 1);
                g.lineTo(cx, cy + 16);
                g.moveTo(cx - 10, cy + 5);
                g.lineTo(cx + 10, cy + 5);
                g.stroke();
            }
        }
    }

    function buildMagmaCrustTex(g, S) {
        g.fillStyle = '#140f10';
        g.fillRect(0, 0, S, S);
        addGrainDots(g, S, 160, 61, 'rgba(48,32,30,0.45)', 'rgba(6,4,5,0.65)', 3);
        const cracks = 6;
        for (let i = 0; i < cracks; i++) {
            let x = hashIdx(i, 71) * S;
            let y = hashIdx(i, 72) * S;
            const segs = 5;
            const pts = [[x, y]];
            for (let s = 0; s < segs; s++) {
                const ang = hashIdx(i * 10 + s, 73) * Math.PI * 2;
                const len = 14 + hashIdx(i * 10 + s, 74) * 16;
                x += Math.cos(ang) * len;
                y += Math.sin(ang) * len;
                pts.push([x, y]);
            }
            const layers = [
                { col: 'rgba(125,24,10,0.34)', w: 4.5 },
                { col: 'rgba(185,52,14,0.52)', w: 1.8 },
                { col: 'rgba(225,105,28,0.62)', w: 0.9 }
            ];
            for (let l = 0; l < layers.length; l++) {
                g.strokeStyle = layers[l].col;
                g.lineWidth = layers[l].w;
                g.lineCap = 'round';
                g.lineJoin = 'round';
                for (let ox = -S; ox <= S; ox += S) {
                    for (let oy = -S; oy <= S; oy += S) {
                        g.beginPath();
                        g.moveTo(pts[0][0] + ox, pts[0][1] + oy);
                        for (let p = 1; p < pts.length; p++) g.lineTo(pts[p][0] + ox, pts[p][1] + oy);
                        g.stroke();
                    }
                }
            }
        }
    }

    function buildWaterRipplesTex(g, S) {
        // 透過ベースで波の陰影と細かな水平さざ波のみを描き、水面色への継ぎ目を防ぐ
        if (typeof g.clearRect === 'function') g.clearRect(0, 0, S, S);
        for (let i = 0; i < 28; i++) {
            const x = hashIdx(i, 81) * S;
            const y = hashIdx(i, 82) * S;
            const w = 14 + hashIdx(i, 83) * 24;
            const h = 1.4 + hashIdx(i, 84) * 1.4;
            g.fillStyle = (i % 3 === 0) ? 'rgba(175,230,255,0.22)' : 'rgba(6,18,34,0.32)';
            fillWrappedRect(g, S, x, y, w, h);
        }
        for (let r = 0; r < 10; r++) {
            const y = (r + 0.5) * (S / 10);
            g.strokeStyle = (r & 1) ? 'rgba(145,215,245,0.14)' : 'rgba(8,22,40,0.22)';
            g.lineWidth = 1.2;
            g.beginPath();
            for (let x = 0; x <= S; x += 8) {
                const wy = y + Math.sin((x / S) * Math.PI * 2 + r * 1.7) * 2.2;
                if (x === 0) g.moveTo(x, wy);
                else g.lineTo(x, wy);
            }
            g.stroke();
        }
        addGrainDots(g, S, 55, 85, 'rgba(210,248,255,0.18)', 'rgba(6,18,32,0.16)', 1.6);
    }

    function buildBarkBambooTex(g, S) {
        const culms = 4;
        const cw = S / culms;
        for (let c = 0; c < culms; c++) {
            const x0 = c * cw;
            const grad = g.createLinearGradient(x0, 0, x0 + cw, 0);
            safeAddColorStop(grad, 0, '#2a4a24');
            safeAddColorStop(0.35, '#5b8a42');
            safeAddColorStop(0.55, '#72a354');
            safeAddColorStop(1, '#223b1e');
            g.fillStyle = grad;
            g.fillRect(x0, 0, cw, S);
            for (let f = 3; f < cw - 2; f += 5) {
                g.fillStyle = 'rgba(25,45,18,0.2)';
                g.fillRect(x0 + f, 0, 1, S);
            }
            const nodeY = modPos(c * 37 + 20, S);
            g.fillStyle = 'rgba(28,46,20,0.72)';
            g.fillRect(x0, nodeY, cw, 3);
            g.fillStyle = 'rgba(185,220,130,0.35)';
            g.fillRect(x0, nodeY + 3, cw, 2);
        }
    }

    function buildMetalRivetsTex(g, S) {
        const grad = g.createLinearGradient(0, 0, S, S);
        safeAddColorStop(grad, 0, '#505762');
        safeAddColorStop(0.5, '#68707d');
        safeAddColorStop(1, '#3e444e');
        g.fillStyle = grad;
        g.fillRect(0, 0, S, S);
        const half = S * 0.5;
        g.fillStyle = 'rgba(18,22,28,0.68)';
        g.fillRect(0, 0, S, 2);
        g.fillRect(0, half, S, 2);
        g.fillRect(0, 0, 2, S);
        g.fillRect(half, 0, 2, S);
        g.fillStyle = 'rgba(220,235,255,0.18)';
        g.fillRect(2, 2, S - 2, 1);
        g.fillRect(2, half + 2, S - 2, 1);
        const offsets = [8, half - 8, half + 8, S - 8];
        for (let r = 0; r < offsets.length; r++) {
            for (let c = 0; c < offsets.length; c++) {
                const rx = offsets[c], ry = offsets[r];
                drawWrappedCircle(g, S, rx + 1, ry + 1, 2.8, 'rgba(10,12,16,0.55)', null, 0);
                drawWrappedCircle(g, S, rx, ry, 2.5, '#8a94a4', null, 0);
                drawWrappedCircle(g, S, rx - 0.8, ry - 0.8, 0.9, 'rgba(245,250,255,0.65)', null, 0);
            }
        }
    }

    const TEX_BUILDERS = {
        stone_tiles: buildStoneTilesTex,
        cobblestone: buildCobblestoneTex,
        marble_veins: buildMarbleVeinsTex,
        wood_planks: buildWoodPlanksTex,
        red_carpet: buildRedCarpetTex,
        tatami: buildTatamiTex,
        shoji: buildShojiTex,
        kawara_tile: buildKawaraTileTex,
        sandstone_hieroglyph: buildSandstoneHieroglyphTex,
        magma_crust: buildMagmaCrustTex,
        water_ripples: buildWaterRipplesTex,
        bark_bamboo: buildBarkBambooTex,
        metal_rivets: buildMetalRivetsTex
    };

    /**
     * プロシージャル128x128シームレステクスチャのオフスクリーンCanvasを取得（生成・キャッシュ）します。
     * Node環境等でCanvas作成不可の場合は null を返します。
     */
    function getTexture(name) {
        if (!name || !TEX_BUILDERS[name]) return null;
        if (name in _texCache) return _texCache[name];
        const off = createOffscreenCanvas(TEX_SIZE, TEX_SIZE);
        if (!off) {
            _texCache[name] = null;
            return null;
        }
        try {
            TEX_BUILDERS[name](off.ctx, TEX_SIZE);
            _texCache[name] = off.canvas;
        } catch (e) {
            _texCache[name] = null;
        }
        return _texCache[name];
    }

    /**
     * 指定ctx用のキャッシュ済みCanvasPatternを取得します。非対応環境では null を返します。
     */
    function getPattern(ctx, name) {
        if (!ctx || typeof ctx.createPattern !== 'function') return null;
        const tex = getTexture(name);
        if (!tex) return null;
        let map = _patternCache ? _patternCache.get(ctx) : null;
        if (map && (name in map)) return map[name];
        let pat = null;
        try {
            pat = ctx.createPattern(tex, 'repeat');
        } catch (e) {
            pat = null;
        }
        if (_patternCache) {
            if (!map) {
                map = Object.create(null);
                _patternCache.set(ctx, map);
            }
            map[name] = pat || null;
        }
        return pat || null;
    }

    // ── スタンプスプライト (drawStamp3D) ─────────────────────────────

    const STAMP_SIZE = 128;
    const _stampCache = Object.create(null);
    let _stampCacheCount = 0;

    function drawBlossomCluster(g, S, petalColors, centerCol, twigCol, leafStyle) {
        const c = S * 0.5;
        g.strokeStyle = twigCol;
        g.lineWidth = 4;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(c - 34, c + 24);
        g.quadraticCurveTo(c - 8, c + 4, c + 28, c - 14);
        g.moveTo(c - 4, c + 6);
        g.lineTo(c - 18, c - 22);
        g.stroke();

        const blobs = 18;
        for (let i = 0; i < blobs; i++) {
            const ang = hashIdx(i, 101) * Math.PI * 2;
            const dist = Math.sqrt(hashIdx(i, 102)) * (S * 0.32);
            const bx = c + Math.cos(ang) * dist;
            const by = c + Math.sin(ang) * dist * 0.82;
            const rad = 11 + hashIdx(i, 103) * 11;
            const col = petalColors[i % petalColors.length];
            g.fillStyle = col;
            if (leafStyle === 'pine') {
                for (let k = 0; k < 7; k++) {
                    const a = (k / 7) * Math.PI - Math.PI * 0.5 + (hashIdx(i, 104) - 0.5) * 0.5;
                    g.strokeStyle = col;
                    g.lineWidth = 2.4;
                    g.beginPath();
                    g.moveTo(bx, by + 6);
                    g.lineTo(bx + Math.cos(a) * rad * 1.4, by + Math.sin(a) * rad * 1.1 - 4);
                    g.stroke();
                }
            } else if (leafStyle === 'maple') {
                g.save();
                g.translate(bx, by);
                g.rotate(hashIdx(i, 105) * Math.PI * 2);
                g.beginPath();
                for (let p = 0; p < 10; p++) {
                    const pa = (p / 10) * Math.PI * 2;
                    const pr = (p & 1) ? rad * 0.45 : rad;
                    if (p === 0) g.moveTo(Math.cos(pa) * pr, Math.sin(pa) * pr);
                    else g.lineTo(Math.cos(pa) * pr, Math.sin(pa) * pr);
                }
                g.closePath();
                g.fill();
                g.restore();
            } else {
                for (let p = 0; p < 5; p++) {
                    const pa = (p / 5) * Math.PI * 2 + hashIdx(i, 106);
                    g.beginPath();
                    safeEllipse(g, bx + Math.cos(pa) * rad * 0.48, by + Math.sin(pa) * rad * 0.48, rad * 0.45, rad * 0.3, pa);
                    g.fill();
                }
                if (centerCol) {
                    g.fillStyle = centerCol;
                    g.beginPath();
                    g.arc(bx, by, rad * 0.18, 0, Math.PI * 2);
                    g.fill();
                }
            }
        }
    }

    function buildStampCanvas(kind, rgb) {
        const off = createOffscreenCanvas(STAMP_SIZE, STAMP_SIZE);
        if (!off) return null;
        const g = off.ctx;
        const S = STAMP_SIZE;
        const c = S * 0.5;
        const r = rgb ? clampByte(rgb[0]) : 255;
        const gr = rgb ? clampByte(rgb[1]) : 210;
        const b = rgb ? clampByte(rgb[2]) : 140;

        if (kind === 'sakura_cluster') {
            drawBlossomCluster(g, S, ['rgba(255,175,205,0.88)', 'rgba(255,208,226,0.9)', 'rgba(255,235,244,0.92)', 'rgba(232,128,172,0.85)'], 'rgba(255,235,140,0.85)', '#4a2a32', 'sakura');
        } else if (kind === 'maple_cluster') {
            drawBlossomCluster(g, S, ['rgba(185,32,24,0.9)', 'rgba(225,74,28,0.9)', 'rgba(242,136,36,0.88)', 'rgba(248,188,52,0.85)'], null, '#3b2416', 'maple');
        } else if (kind === 'pine_bough') {
            drawBlossomCluster(g, S, ['rgba(22,64,38,0.94)', 'rgba(34,88,50,0.92)', 'rgba(54,116,68,0.88)', 'rgba(16,44,28,0.95)'], null, '#3e2918', 'pine');
        } else if (kind === 'cloud_bank') {
            // 横長に広げても丸い玉に分離しないよう、幅広の霧クッションと重なり合う楕円層で構成
            const baseG = g.createRadialGradient(c, c + 4, 4, c, c + 4, S * 0.46);
            safeAddColorStop(baseG, 0, `rgba(${clampByte(r * 0.92)},${clampByte(gr * 0.94)},${b},0.48)`);
            safeAddColorStop(baseG, 0.55, `rgba(${clampByte(r * 0.82)},${clampByte(gr * 0.86)},${clampByte(b * 0.95)},0.24)`);
            safeAddColorStop(baseG, 1, `rgba(${r},${gr},${b},0)`);
            g.save();
            g.translate(c, c + 4);
            g.scale(1.1, 0.52);
            g.fillStyle = baseG;
            g.beginPath();
            g.arc(0, 0, S * 0.46, 0, Math.PI * 2);
            g.fill();
            g.restore();

            const puffs = [
                [-22, 6, 22, 1.35, 0.72, 0.44],
                [-10, -2, 24, 1.25, 0.76, 0.48],
                [0, -6, 26, 1.3, 0.78, 0.52],
                [12, -1, 24, 1.25, 0.75, 0.46],
                [24, 6, 21, 1.32, 0.7, 0.42],
                [-14, 10, 22, 1.4, 0.65, 0.36],
                [14, 10, 22, 1.4, 0.65, 0.36]
            ];
            for (let i = 0; i < puffs.length; i++) {
                const pf = puffs[i];
                const grad = g.createRadialGradient(0, -pf[2] * 0.15, 2, 0, 0, pf[2]);
                safeAddColorStop(grad, 0, `rgba(${r},${gr},${b},${pf[5]})`);
                safeAddColorStop(grad, 0.6, `rgba(${clampByte(r * 0.86)},${clampByte(gr * 0.89)},${clampByte(b * 0.96)},${(pf[5] * 0.48).toFixed(2)})`);
                safeAddColorStop(grad, 1, `rgba(${r},${gr},${b},0)`);
                g.save();
                g.translate(c + pf[0], c + pf[1]);
                g.scale(pf[3], pf[4]);
                g.fillStyle = grad;
                g.beginPath();
                g.arc(0, 0, pf[2], 0, Math.PI * 2);
                g.fill();
                g.restore();
            }
        } else if (kind === 'lantern_glow') {
            const aura = g.createRadialGradient(c, c, 4, c, c, S * 0.48);
            safeAddColorStop(aura, 0, `rgba(${r},${gr},${b},0.85)`);
            safeAddColorStop(aura, 0.45, `rgba(${r},${clampByte(gr * 0.75)},${clampByte(b * 0.45)},0.35)`);
            safeAddColorStop(aura, 1, `rgba(${r},${gr},${b},0)`);
            g.fillStyle = aura;
            g.beginPath(); g.arc(c, c, S * 0.48, 0, Math.PI * 2); g.fill();
            g.fillStyle = '#261812';
            g.fillRect(c - 16, c - 26, 32, 6);
            g.fillRect(c - 15, c + 20, 30, 6);
            const body = g.createRadialGradient(c, c, 2, c, c, 22);
            safeAddColorStop(body, 0, '#fffbe6');
            safeAddColorStop(body, 0.65, `rgb(${r},${gr},${b})`);
            safeAddColorStop(1, `rgb(${clampByte(r * 0.65)},${clampByte(gr * 0.35)},${clampByte(b * 0.15)})`);
            g.fillStyle = body;
            g.beginPath();
            safeEllipse(g, c, c, 19, 22, 0);
            g.fill();
            g.strokeStyle = 'rgba(65,24,10,0.45)';
            g.lineWidth = 1.2;
            for (let y = c - 12; y <= c + 12; y += 8) {
                g.beginPath();
                g.moveTo(c - 17, y);
                g.lineTo(c + 17, y);
                g.stroke();
            }
        } else if (kind === 'spirit_wisp') {
            const aura = g.createRadialGradient(c, c + 6, 4, c, c, S * 0.44);
            safeAddColorStop(aura, 0, `rgba(240,255,255,0.92)`);
            safeAddColorStop(aura, 0.35, `rgba(${r},${gr},${b},0.65)`);
            safeAddColorStop(aura, 1, `rgba(${r},${gr},${b},0)`);
            g.fillStyle = aura;
            g.beginPath(); g.arc(c, c, S * 0.44, 0, Math.PI * 2); g.fill();
            g.fillStyle = `rgba(${r},${gr},${b},0.78)`;
            g.beginPath();
            g.moveTo(c, c - 44);
            g.quadraticCurveTo(c + 22, c - 14, c + 15, c + 14);
            g.arc(c, c + 14, 15, 0, Math.PI);
            g.quadraticCurveTo(c - 20, c - 10, c, c - 44);
            g.fill();
            g.fillStyle = 'rgba(255,255,255,0.92)';
            g.beginPath();
            g.arc(c, c + 10, 7, 0, Math.PI * 2);
            g.fill();
        } else if (kind === 'stained_glass') {
            const rad = S * 0.44;
            const sectors = 12;
            const palette = ['#b81d38', '#2248a8', '#d69c24', '#228a62'];
            for (let i = 0; i < sectors; i++) {
                const a0 = (i / sectors) * Math.PI * 2;
                const a1 = ((i + 1) / sectors) * Math.PI * 2;
                g.fillStyle = palette[i % palette.length];
                g.beginPath();
                g.moveTo(c, c);
                g.arc(c, c, rad, a0, a1);
                g.closePath();
                g.fill();
                g.strokeStyle = '#18141c';
                g.lineWidth = 2.5;
                g.stroke();
            }
            const glow = g.createRadialGradient(c, c, 2, c, c, rad);
            safeAddColorStop(glow, 0, 'rgba(255,245,205,0.72)');
            safeAddColorStop(glow, 0.5, 'rgba(255,220,180,0.18)');
            safeAddColorStop(glow, 1, 'rgba(0,0,0,0.28)');
            g.fillStyle = glow;
            g.beginPath(); g.arc(c, c, rad, 0, Math.PI * 2); g.fill();
            g.strokeStyle = '#120e16';
            g.lineWidth = 4;
            g.beginPath(); g.arc(c, c, rad, 0, Math.PI * 2); g.stroke();
            g.beginPath(); g.arc(c, c, rad * 0.52, 0, Math.PI * 2); g.stroke();
        } else if (kind === 'magic_seal') {
            const rad = S * 0.43;
            const halo = g.createRadialGradient(c, c, rad * 0.3, c, c, rad * 1.12);
            safeAddColorStop(halo, 0, `rgba(${r},${gr},${b},0.18)`);
            safeAddColorStop(halo, 0.75, `rgba(${r},${gr},${b},0.28)`);
            safeAddColorStop(halo, 1, `rgba(${r},${gr},${b},0)`);
            g.fillStyle = halo;
            g.beginPath(); g.arc(c, c, rad * 1.12, 0, Math.PI * 2); g.fill();
            g.strokeStyle = `rgba(${r},${gr},${b},0.92)`;
            g.lineWidth = 2.4;
            g.beginPath(); g.arc(c, c, rad, 0, Math.PI * 2); g.stroke();
            g.lineWidth = 1.4;
            g.beginPath(); g.arc(c, c, rad * 0.82, 0, Math.PI * 2); g.stroke();
            g.beginPath(); g.arc(c, c, rad * 0.36, 0, Math.PI * 2); g.stroke();
            for (let tri = 0; tri < 2; tri++) {
                g.beginPath();
                for (let k = 0; k < 3; k++) {
                    const a = (k / 3) * Math.PI * 2 + tri * (Math.PI / 3);
                    const px = c + Math.cos(a) * rad * 0.8;
                    const py = c + Math.sin(a) * rad * 0.8;
                    if (k === 0) g.moveTo(px, py);
                    else g.lineTo(px, py);
                }
                g.closePath();
                g.stroke();
            }
            for (let t = 0; t < 12; t++) {
                const a = (t / 12) * Math.PI * 2;
                g.beginPath();
                g.moveTo(c + Math.cos(a) * rad * 0.84, c + Math.sin(a) * rad * 0.84);
                g.lineTo(c + Math.cos(a) * rad * 0.98, c + Math.sin(a) * rad * 0.98);
                g.stroke();
            }
        } else {
            return null;
        }
        return off.canvas;
    }

    function getStampCanvas(kind, rgb) {
        const key = rgb ? `${kind}_${rgb[0] >> 3}_${rgb[1] >> 3}_${rgb[2] >> 3}` : kind;
        if (key in _stampCache) return _stampCache[key];
        const canvas = buildStampCanvas(kind, rgb);
        if (_stampCacheCount < 96) {
            _stampCache[key] = canvas;
            _stampCacheCount++;
        }
        return canvas;
    }

    /**
     * 3Dワールド座標にリッチなキャッシュ済みオーナメント/自然スタンプを描画します。
     */
    function drawStamp3D(ctx, cam, kind, wx, wy, wz, worldW, worldH, opts) {
        const p = projectWorld(cam, wx, wy, wz);
        if (!p) return;
        const sx = p[0], sy = p[1], scale = p[2], vz = p[3];
        if (vz < NEAR_Z || vz > cam.maxZ) return;
        const sw = (worldW || 60) * scale;
        const sh = (worldH || worldW || 60) * scale;
        if (!(sw > 1.2 || sh > 1.2)) return;
        const margin = Math.max(80, Math.min(sw, sh) * 0.6);
        if (sx + sw < -margin || sx - sw > cam.W + margin || sy + sh < -margin || sy - sh > cam.H + margin) return;

        const o = opts || {};
        const fog = fogFactor(cam, vz);
        const farFade = vz > cam.maxZ * 0.78 ? Math.max(0, 1 - (vz - cam.maxZ * 0.78) / (cam.maxZ * 0.22)) : 1;
        const nearFade = vz < 72 ? clamp((vz - NEAR_Z) / (72 - NEAR_Z), 0, 1) : 1;
        const fogStrength = o.fogStrength !== undefined ? o.fogStrength : 0.72;
        const alpha = clamp((o.alpha !== undefined ? o.alpha : 1) * (1 - fog * fogStrength) * farFade * nearFade, 0, 1);
        if (alpha <= 0.006) return;

        const stamp = getStampCanvas(kind, o.rgb || o.tint);
        const anchorY = o.anchorY !== undefined ? o.anchorY : 0.5;
        const rot = o.rot || o.rotation || 0;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(sx, sy);
        if (rot) ctx.rotate(rot);
        if (o.flipX) ctx.scale(-1, 1);
        if (stamp && typeof ctx.drawImage === 'function') {
            ctx.drawImage(stamp, -sw * 0.5, -sh * anchorY, sw, sh);
        } else {
            const col = foggedRGBA(cam, o.rgb || [220, 220, 240], 1, vz, alpha);
            if (col) {
                ctx.fillStyle = col;
                ctx.beginPath();
                safeEllipse(ctx, 0, sh * (0.5 - anchorY), sw * 0.42, sh * 0.42, 0);
                ctx.fill();
            }
        }
        ctx.restore();
    }

    // ── 空・星・大気光・ゴッドレイ ──────────────────────────────────

    function drawSkyGrad(ctx, W, H, stops) {
        const g = ctx.createLinearGradient(0, 0, 0, H);
        if (stops && stops.length) {
            for (let i = 0; i < stops.length; i++) {
                safeAddColorStop(g, stops[i][0], stops[i][1]);
            }
        }
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
    }

    function drawStars(ctx, W, maxY, t, count, color, twinkleSpeed) {
        const n = count || 40;
        const spd = twinkleSpeed || 1.4;
        ctx.save();
        ctx.fillStyle = color || '#ffffff';
        for (let i = 0; i < n; i++) {
            const sx = hash01(i * 3.1 + 1) * W;
            const sy = hash01(i * 5.7 + 2) * maxY;
            const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * spd + i * 1.9));
            const r = 0.9 + hash01(i * 7.3) * 1.6;
            ctx.globalAlpha = tw;
            ctx.fillRect(sx, sy, r, r);
            if ((i % 7) === 0 && tw > 0.72) {
                ctx.globalAlpha = tw * 0.55;
                ctx.fillRect(sx - r * 1.4, sy + r * 0.25, r * 3.8, 0.9);
                ctx.fillRect(sx + r * 0.25, sy - r * 1.4, 0.9, r * 3.8);
            }
        }
        ctx.restore();
    }

    /**
     * shadowBlur を使わずにラジアルグラデーションによる大気光・天体・地平線グローを描画します。
     */
    function drawAtmosphericGlow(ctx, x, y, radius, colorInner, colorOuter, opts) {
        if (!Number.isFinite(x) || !Number.isFinite(y)) return;
        const o = opts || {};
        const r = Math.max(1, radius || 200);
        const rIn = clamp(o.innerRadius || 2, 0, r * 0.95);
        const g = ctx.createRadialGradient(0, 0, rIn, 0, 0, r);
        if (Array.isArray(colorInner)) {
            for (let i = 0; i < colorInner.length; i++) {
                safeAddColorStop(g, colorInner[i][0], colorInner[i][1]);
            }
        } else {
            safeAddColorStop(g, 0, colorInner || 'rgba(255,240,210,0.6)');
            if (o.midColor) safeAddColorStop(g, o.midStop || 0.45, o.midColor);
            safeAddColorStop(g, 1, colorOuter || 'rgba(0,0,0,0)');
        }
        ctx.save();
        if (o.alpha !== undefined) ctx.globalAlpha = clamp(o.alpha, 0, 1);
        ctx.translate(x, y);
        if (o.scaleX || o.scaleY) ctx.scale(o.scaleX || 1, o.scaleY || 1);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function drawHorizonGlow(ctx, W, hy, colorInner, colorOuter, radius) {
        drawAtmosphericGlow(ctx, W * 0.5, hy, radius || W * 0.65, colorInner, colorOuter);
    }

    /**
     * 斜め・放射状の光芒（ゴッドレイ）を描画します。
     * shafts にはシャフト配列、または { count, x, spread, rgb, alpha, angle, y0, y1 } を渡せます。
     */
    function drawLightShafts(ctx, W, H, shafts, t) {
        let list = shafts;
        if (!Array.isArray(shafts)) {
            const cfg = typeof shafts === 'object' && shafts ? shafts : {};
            const cnt = typeof shafts === 'number' ? shafts : (cfg.count || 5);
            list = [];
            for (let i = 0; i < cnt; i++) {
                const u = cnt > 1 ? (i / (cnt - 1)) - 0.5 : 0;
                list.push({
                    x: (cfg.x !== undefined ? cfg.x : W * 0.5) + u * (cfg.spread || W * 0.72),
                    y0: cfg.y0 !== undefined ? cfg.y0 : 0,
                    y1: cfg.y1 !== undefined ? cfg.y1 : H * 0.85,
                    topW: (cfg.topW || 24) * (0.8 + hashIdx(i, 12) * 0.5),
                    botW: (cfg.botW || 130) * (0.8 + hashIdx(i, 13) * 0.5),
                    angle: (cfg.angle !== undefined ? cfg.angle : 0.22) + u * 0.14,
                    rgb: cfg.rgb || [255, 235, 185],
                    alpha: cfg.alpha !== undefined ? cfg.alpha : 0.14,
                    speed: cfg.speed || 0.7,
                    phase: i * 1.4
                });
            }
        }
        ctx.save();
        for (let i = 0; i < list.length; i++) {
            const s = list[i];
            if (!s) continue;
            const y0 = s.y0 !== undefined ? s.y0 : 0;
            const y1 = s.y1 !== undefined ? s.y1 : H * 0.85;
            const dy = y1 - y0;
            if (!(dy > 1)) continue;
            const xTop = s.x !== undefined ? s.x : W * 0.5;
            const shift = Math.tan(clamp(s.angle !== undefined ? s.angle : 0.18, -1.1, 1.1)) * dy;
            const xBot = xTop + shift;
            const tw = (s.topW || 22) * 0.5;
            const bw = (s.botW || 120) * 0.5;
            const pulse = 0.65 + 0.35 * Math.sin((t || 0) * (s.speed || 0.8) + (s.phase || i));
            const a = clamp((s.alpha !== undefined ? s.alpha : 0.15) * pulse, 0, 1);
            if (a <= 0.004) continue;
            const rgb = s.rgb || [255, 235, 185];
            const g = ctx.createLinearGradient(xTop, y0, xBot, y1);
            safeAddColorStop(g, 0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a.toFixed(3)})`);
            safeAddColorStop(g, 0.55, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${(a * 0.45).toFixed(3)})`);
            safeAddColorStop(g, 1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.moveTo(xTop - tw, y0);
            ctx.lineTo(xTop + tw, y0);
            ctx.lineTo(xBot + bw, y1);
            ctx.lineTo(xBot - bw, y1);
            ctx.closePath();
            ctx.fill();
        }
        ctx.restore();
    }

    // ── 3Dポリゴン・統一平行光源・クアッド・サーフェスプリミティブ ──

    /**
     * ボックス・円柱・縁石・角錐で統一した平行光源シェーディング係数を返します。
     * 光源は左上・手前上方寄り (L ≈ [-0.38, 0.80, -0.25])。
     */
    function directionalShade(nx, ny, nz) {
        const dot = (nx || 0) * (-0.38) + (ny || 0) * 0.80 + (nz || 0) * (-0.25);
        return clamp(0.78 + dot * 0.30, 0.50, 1.14);
    }

    function clipViewPoly(vPts) {
        const len = vPts.length;
        if (len < 3) return null;
        const clipped = [];
        for (let i = 0; i < len; i++) {
            const a = vPts[i];
            const b = vPts[(i + 1) % len];
            const aIn = a[2] >= NEAR_Z;
            const bIn = b[2] >= NEAR_Z;
            if (aIn && bIn) {
                clipped.push(b);
            } else if (aIn && !bIn) {
                const denom = b[2] - a[2];
                const t = denom !== 0 ? (NEAR_Z - a[2]) / denom : 0;
                clipped.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, NEAR_Z]);
            } else if (!aIn && bIn) {
                const denom = b[2] - a[2];
                const t = denom !== 0 ? (NEAR_Z - a[2]) / denom : 0;
                clipped.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, NEAR_Z]);
                clipped.push(b);
            }
        }
        return clipped.length >= 3 ? clipped : null;
    }

    function drawViewPoly(ctx, cam, vPts, fillStyle, strokeStyle, lineWidth) {
        const clipped = clipViewPoly(vPts);
        if (!clipped) return;

        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        const screenPts = [];
        for (let i = 0; i < clipped.length; i++) {
            const p = clipped[i];
            const s = cam.fov / p[2];
            const sx = cam.cx + p[0] * s;
            const sy = cam.horizonY - p[1] * s;
            if (!Number.isFinite(sx) || !Number.isFinite(sy)) return;
            if (sx < minX) minX = sx;
            if (sx > maxX) maxX = sx;
            if (sy < minY) minY = sy;
            if (sy > maxY) maxY = sy;
            screenPts.push(sx, sy);
        }
        if (maxX < -40 || minX > cam.W + 40 || maxY < -40 || minY > cam.H + 40) return;

        ctx.beginPath();
        ctx.moveTo(screenPts[0], screenPts[1]);
        for (let i = 2; i < screenPts.length; i += 2) {
            ctx.lineTo(screenPts[i], screenPts[i + 1]);
        }
        ctx.closePath();
        if (fillStyle) {
            ctx.fillStyle = fillStyle;
            ctx.fill();
        }
        if (strokeStyle) {
            ctx.strokeStyle = strokeStyle;
            ctx.lineWidth = lineWidth || 1;
            ctx.stroke();
        }
    }

    function drawContactShadow3D(ctx, cam, wx, wy, wz, rx, rz, alpha) {
        const radX = rx || 20;
        const radZ = rz || radX;
        const offX = radX * 0.16;
        const offZ = -radZ * 0.10;
        const sy = wy + 0.28;
        const pts = [];
        for (let i = 0; i < 8; i++) {
            const a = (Math.PI * 2 * i) / 8;
            pts.push(toView(cam, wx + offX + Math.cos(a) * radX, sy, wz + offZ + Math.sin(a) * radZ));
        }
        const midZ = toView(cam, wx + offX, sy, wz + offZ)[2];
        if (midZ < NEAR_Z - radZ || midZ > cam.maxZ) return;
        const vz = Math.max(NEAR_Z, midZ);
        const fog = fogFactor(cam, vz);
        const farFade = vz > cam.maxZ * 0.78 ? Math.max(0, 1 - (vz - cam.maxZ * 0.78) / (cam.maxZ * 0.22)) : 1;
        const a = clamp((alpha !== undefined ? alpha : 0.30) * (1 - fog * 0.85) * farFade, 0, 0.55);
        if (a <= 0.006) return;
        drawViewPoly(ctx, cam, pts, `rgba(4,4,12,${a.toFixed(3)})`, null, 1);
    }

    function lerp3(a, b, t) {
        return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
    }

    function bilerpQuad(p0, p1, p2, p3, u, v) {
        const iu = 1 - u, iv = 1 - v;
        const w0 = iu * iv, w1 = u * iv, w2 = u * v, w3 = iu * v;
        return [
            p0[0] * w0 + p1[0] * w1 + p2[0] * w2 + p3[0] * w3,
            p0[1] * w0 + p1[1] * w1 + p2[1] * w2 + p3[1] * w3,
            p0[2] * w0 + p1[2] * w1 + p2[2] * w2 + p3[2] * w3
        ];
    }

    function appendLine3D(ctx, cam, ax, ay, az, bx, by, bz) {
        let va = toView(cam, ax, ay, az);
        let vb = toView(cam, bx, by, bz);
        if (va[2] < NEAR_Z && vb[2] < NEAR_Z) return false;
        if (va[2] < NEAR_Z) {
            const denom = vb[2] - va[2];
            const t = denom !== 0 ? (NEAR_Z - va[2]) / denom : 0;
            va = [va[0] + (vb[0] - va[0]) * t, va[1] + (vb[1] - va[1]) * t, NEAR_Z];
        } else if (vb[2] < NEAR_Z) {
            const denom = va[2] - vb[2];
            const t = denom !== 0 ? (NEAR_Z - vb[2]) / denom : 0;
            vb = [vb[0] + (va[0] - vb[0]) * t, vb[1] + (va[1] - vb[1]) * t, NEAR_Z];
        }
        const sa = projectView(cam, va[0], va[1], va[2]);
        const sb = projectView(cam, vb[0], vb[1], vb[2]);
        if (!sa || !sb) return false;
        if (Math.max(sa[0], sb[0]) < -60 || Math.min(sa[0], sb[0]) > cam.W + 60 ||
            Math.max(sa[1], sb[1]) < -60 || Math.min(sa[1], sb[1]) > cam.H + 60) {
            return false;
        }
        ctx.moveTo(sa[0], sa[1]);
        ctx.lineTo(sb[0], sb[1]);
        return true;
    }

    function appendWorldPts3D(ctx, cam, pA, pB) {
        return appendLine3D(ctx, cam, pA[0], pA[1], pA[2], pB[0], pB[1], pB[2]);
    }

    function strokeLineBatch3D(ctx, cam, segs, strokeStyle, lineWidth) {
        if (!strokeStyle || !segs || !segs.length) return;
        ctx.beginPath();
        let any = false;
        for (let i = 0; i < segs.length; i++) {
            const s = segs[i];
            if (appendLine3D(ctx, cam, s[0], s[1], s[2], s[3], s[4], s[5])) any = true;
        }
        if (any) {
            ctx.strokeStyle = strokeStyle;
            ctx.lineWidth = lineWidth || 1;
            ctx.stroke();
        }
    }

    function makeDepthLinePaint(ctx, cam, p0, p1, p2, p3, rgb, shade, alpha, avgVz) {
        const zLo = Math.min(p0[2], p1[2], p2[2], p3[2]);
        const zHi = Math.max(p0[2], p1[2], p2[2], p3[2]);
        const zA = Math.max(cam.z + NEAR_Z, zLo);
        const zB = Math.max(zA + 1, zHi);
        if (zB - zA > 36) {
            const cxA = (p0[0] + p1[0]) * 0.5, cyA = (p0[1] + p1[1]) * 0.5;
            const cxB = (p2[0] + p3[0]) * 0.5, cyB = (p2[1] + p3[1]) * 0.5;
            const tA = clamp((zA - p0[2]) / ((p3[2] - p0[2]) || 1), 0, 1);
            const tB = clamp((zB - p0[2]) / ((p3[2] - p0[2]) || 1), 0, 1);
            const sA = projectWorld(cam, lerp(cxA, cxB, tA), lerp(cyA, cyB, tA), zA);
            const sB = projectWorld(cam, lerp(cxA, cxB, tB), lerp(cyA, cyB, tB), zB);
            if (sA && sB && sA[3] >= NEAR_Z && sB[3] >= NEAR_Z) {
                const d2 = (sB[0] - sA[0]) * (sB[0] - sA[0]) + (sB[1] - sA[1]) * (sB[1] - sA[1]);
                if (d2 > 16) {
                    const g = ctx.createLinearGradient(sA[0], sA[1], sB[0], sB[1]);
                    const vzN = sA[3], vzF = sB[3];
                    const invN = 1 / vzN, invF = 1 / vzF;
                    const vzM = 1 / (invN + (invF - invN) * 0.5);
                    const fogFade = (vz) => clamp(1 - (vz - 180) / 920, 0, 1) * (1 - fogFactor(cam, vz) * 0.78);
                    const c0 = foggedRGBA(cam, rgb, shade, vzN, clamp(alpha * fogFade(vzN), 0, 0.88)) || `rgba(${cam.fogRGB[0]},${cam.fogRGB[1]},${cam.fogRGB[2]},0)`;
                    const cM = foggedRGBA(cam, rgb, shade, vzM, clamp(alpha * fogFade(vzM), 0, 0.88)) || `rgba(${cam.fogRGB[0]},${cam.fogRGB[1]},${cam.fogRGB[2]},0)`;
                    const c1 = foggedRGBA(cam, rgb, shade, vzF, clamp(alpha * fogFade(vzF), 0, 0.88)) || `rgba(${cam.fogRGB[0]},${cam.fogRGB[1]},${cam.fogRGB[2]},0)`;
                    safeAddColorStop(g, 0, c0);
                    safeAddColorStop(g, 0.5, cM);
                    safeAddColorStop(g, 1, c1);
                    return g;
                }
            }
        }
        return foggedRGBA(cam, rgb, shade, avgVz, clamp(alpha * clamp(1 - (avgVz - 180) / 920, 0, 1) * (1 - fogFactor(cam, avgVz) * 0.78), 0, 0.88));
    }

    function drawQuadMaterial3D(ctx, cam, p0, p1, p2, p3, rgb, shade, alpha, minVz, avgVz, o) {
        const mat = o && o.material;
        if (!mat || mat === 'water_ripples') return;
        if (minVz > 1180) return;

        const baseA = alpha !== undefined ? alpha : 1;
        if (baseA <= 0.02) return;
        const sh = shade !== undefined ? shade : 1;
        const fog = fogFactor(cam, avgVz);
        const distFade = clamp(1 - (avgVz - 180) / 920, 0, 1);
        const baseMatA = (o.materialAlpha !== undefined ? o.materialAlpha : 0.36) * baseA;
        const mAlpha = clamp(baseMatA * distFade * (1 - fog * 0.78), 0, 0.85);
        if (mAlpha <= 0.015) return;

        const sc = clamp(o.materialScale || 1, 0.45, 1.8) * (avgVz > 620 ? 1.5 : 1.0);
        const isGroundZ = Math.abs(p0[2] - p1[2]) < 2.5 && Math.abs(p2[2] - p3[2]) < 2.5 &&
            Math.abs(p3[2] - p0[2]) > 8 && Math.abs(p1[0] - p0[0]) > 6 && Math.abs(p1[1] - p0[1]) < 4;
        const darkLine = isGroundZ
            ? makeDepthLinePaint(ctx, cam, p0, p1, p2, p3, rgb, sh * 0.44, baseMatA * 1.4, avgVz)
            : foggedRGBA(cam, rgb, sh * 0.44, avgVz, clamp(mAlpha * 1.4, 0, 0.85));
        const hiRGB = [clampByte(rgb[0] + 46), clampByte(rgb[1] + 46), clampByte(rgb[2] + 50)];
        const lightLine = isGroundZ
            ? makeDepthLinePaint(ctx, cam, p0, p1, p2, p3, hiRGB, sh * 1.06, baseMatA * 0.65, avgVz)
            : foggedRGBA(cam, hiRGB, sh * 1.06, avgVz, clamp(mAlpha * 0.65, 0, 0.48));
        if (!darkLine) return;

        const isWallZ = !isGroundZ && Math.abs(p0[0] - p1[0]) < 8 && Math.abs(p2[0] - p3[0]) < 8 &&
            Math.abs(p0[1] - p1[1]) < 4 && Math.abs(p3[1] - p0[1]) > 8 && Math.abs(p1[2] - p0[2]) > 8;

        const segsDark = [];
        const segsLight = [];
        const segsAccent = [];
        let accentCol = null;
        let darkLW = clamp((cam.fov / Math.max(120, avgVz)) * 0.36, 0.8, 1.9);
        let lightLW = darkLW * 0.76;
        let accentLW = darkLW;

        if (isGroundZ) {
            const zDir = p3[2] >= p0[2] ? 1 : -1;
            const zLo = Math.min(p0[2], p3[2]);
            const zHi = Math.max(p0[2], p3[2]);
            const atZ = (wz) => {
                const t = clamp((wz - p0[2]) / ((p3[2] - p0[2]) || 1), 0, 1);
                return {
                    xL: lerp(p0[0], p3[0], t),
                    xR: lerp(p1[0], p2[0], t),
                    yL: lerp(p0[1], p3[1], t),
                    yR: lerp(p1[1], p2[1], t)
                };
            };
            const yDir = ((p0[1] + p3[1]) * 0.5 > cam.y) ? -0.15 : 0.15;

            if (mat === 'stone_tiles' || mat === 'cobblestone' || mat === 'sandstone_hieroglyph' || mat === 'marble_veins') {
                const isCobble = mat === 'cobblestone';
                const isMarble = mat === 'marble_veins';
                const isSand = mat === 'sandstone_hieroglyph';
                const stepZ = (isMarble ? 84 : (isSand ? 66 : (isCobble ? 42 : 52))) * sc;
                const stepX = (isMarble ? 88 : (isSand ? 74 : (isCobble ? 48 : 58))) * sc;
                const rowLo = Math.floor(zLo / stepZ);
                const rowHi = Math.min(rowLo + 14, Math.ceil(zHi / stepZ));
                const endE0 = atZ(zLo);
                const endE1 = atZ(zHi);

                if (isMarble) {
                    accentCol = makeDepthLinePaint(ctx, cam, p0, p1, p2, p3, [155, 162, 178], sh, baseMatA * 0.34, avgVz);
                    const k0 = Math.floor(Math.min(endE0.xL, endE1.xL) / stepX);
                    const k1 = Math.min(k0 + 16, Math.ceil(Math.max(endE0.xR, endE1.xR) / stepX));
                    for (let ix = k0; ix <= k1; ix++) {
                        const wx = ix * stepX;
                        if (wx > endE0.xL + 2 && wx < endE0.xR - 2 && wx > endE1.xL + 2 && wx < endE1.xR - 2) {
                            segsDark.push([wx, endE0.yL + yDir, zLo, wx, endE1.yL + yDir, zHi]);
                        }
                    }
                    for (let r = rowLo; r < rowHi; r++) {
                        const rz0 = clamp(r * stepZ, zLo, zHi);
                        const rz1 = clamp((r + 1) * stepZ, zLo, zHi);
                        if (r * stepZ > zLo + 1 && r * stepZ < zHi - 1) {
                            const b = atZ(r * stepZ);
                            segsDark.push([b.xL, b.yL + yDir, r * stepZ, b.xR, b.yR + yDir, r * stepZ]);
                        }
                        if (rz1 - rz0 > 8 && accentCol && avgVz < 620) {
                            const midZ = (rz0 + rz1) * 0.5;
                            const bMid = atZ(midZ);
                            const vx0 = clamp((hashIdx(r, 91) - 0.5) * (bMid.xR - bMid.xL) * 0.7, bMid.xL + 6, bMid.xR - 6);
                            const vx1 = clamp(vx0 + (hashIdx(r, 92) - 0.5) * 85, bMid.xL + 4, bMid.xR - 4);
                            segsAccent.push([vx0, bMid.yL + yDir, rz0 + 4, vx1, bMid.yL + yDir, rz1 - 4]);
                        }
                    }
                } else {
                    if (isSand) accentCol = makeDepthLinePaint(ctx, cam, p0, p1, p2, p3, [78, 224, 214], 1.05, baseMatA * 0.9, avgVz);
                    for (let r = rowLo; r < rowHi; r++) {
                        const wz0 = clamp(r * stepZ, zLo, zHi);
                        const wz1 = clamp((r + 1) * stepZ, zLo, zHi);
                        if (wz1 - wz0 < 2) continue;
                        const rowEdge = r * stepZ;
                        if (rowEdge > zLo + 1 && rowEdge < zHi - 1) {
                            const b = atZ(rowEdge);
                            segsDark.push([b.xL, b.yL + yDir, rowEdge, b.xR, b.yR + yDir, rowEdge]);
                            if (lightLine && avgVz < 620) {
                                segsLight.push([b.xL, b.yL + yDir, rowEdge + 1.4 * zDir, b.xR, b.yR + yDir, rowEdge + 1.4 * zDir]);
                            }
                        }

                        const b0 = atZ(wz0), b1 = atZ(wz1);
                        const xLo = Math.min(b0.xL, b1.xL), xHi = Math.max(b0.xR, b1.xR);
                        const rowPhase = (modPos(r, 2) === 1 ? 0.5 : 0) * stepX;
                        const colLo = Math.floor((xLo - rowPhase) / stepX);
                        const colHi = Math.min(colLo + 18, Math.ceil((xHi - rowPhase) / stepX));
                        for (let c = colLo; c <= colHi; c++) {
                            const jitter = isCobble ? (hash2D(c, r, 13) - 0.5) * stepX * 0.34 : 0;
                            const wx = c * stepX + rowPhase + jitter;
                            if (wx > b0.xL + 2 && wx < b0.xR - 2 && wx > b1.xL + 2 && wx < b1.xR - 2) {
                                segsDark.push([wx, b0.yL + yDir, wz0, wx, b1.yL + yDir, wz1]);
                                if (lightLine && !isCobble && avgVz < 560) {
                                    segsLight.push([wx + 1.4, b0.yL + yDir, wz0, wx + 1.4, b1.yL + yDir, wz1]);
                                }
                            }
                            if (isSand && accentCol && avgVz < 560 && (modPos(c + r, 3) === 0)) {
                                const sx0 = clamp(wx + 2, Math.max(b0.xL, b1.xL) + 1, Math.min(b0.xR, b1.xR) - 1);
                                const sx1 = clamp(wx + stepX - 2, Math.max(b0.xL, b1.xL) + 1, Math.min(b0.xR, b1.xR) - 1);
                                if (sx1 - sx0 > 10) {
                                    const cx = (sx0 + sx1) * 0.5, cz = (wz0 + wz1) * 0.5;
                                    const ry = (b0.yL + b1.yL) * 0.5 + yDir * 1.2;
                                    segsAccent.push([cx - 6, ry, cz, cx + 6, ry, cz]);
                                    segsAccent.push([cx, ry, cz - 7, cx, ry, cz + 7]);
                                }
                            }
                        }
                    }
                }
            } else if (mat === 'wood_planks') {
                const plankW = 28 * sc;
                const end0 = atZ(zLo), end1 = atZ(zHi);
                const xLo = Math.min(end0.xL, end1.xL), xHi = Math.max(end0.xR, end1.xR);
                const cLo = Math.floor(xLo / plankW), cHi = Math.min(cLo + 22, Math.ceil(xHi / plankW));
                for (let c = cLo; c <= cHi; c++) {
                    const wx = c * plankW;
                    if (wx > end0.xL + 2 && wx < end0.xR - 2 && wx > end1.xL + 2 && wx < end1.xR - 2) {
                        segsDark.push([wx, end0.yL + yDir, zLo, wx, end1.yL + yDir, zHi]);
                        if (lightLine && avgVz < 620) {
                            segsLight.push([wx + 1.3, end0.yL + yDir, zLo, wx + 1.3, end1.yL + yDir, zHi]);
                        }
                    }
                    const wxNext = (c + 1) * plankW;
                    const midX0 = Math.max(wx, end0.xL + 2), midX1 = Math.min(wxNext, end0.xR - 2);
                    if (midX1 - midX0 > 4) {
                        const jOff = modPos(c * 59, 130);
                        const jStep = 130 * sc;
                        const jStart = Math.floor((zLo - jOff) / jStep) * jStep + jOff;
                        for (let jz = jStart; jz <= zHi; jz += jStep) {
                            if (jz > zLo + 2 && jz < zHi - 2) {
                                const jb = atZ(jz);
                                const sx0 = Math.max(wx, jb.xL + 1), sx1 = Math.min(wxNext, jb.xR - 1);
                                if (sx1 > sx0 + 2) segsDark.push([sx0, jb.yL + yDir, jz, sx1, jb.yR + yDir, jz]);
                            }
                        }
                    }
                }
            } else if (mat === 'red_carpet') {
                accentCol = makeDepthLinePaint(ctx, cam, p0, p1, p2, p3, [242, 198, 92], 1.05, baseMatA * 1.15, avgVz);
                const e0 = atZ(zLo), e1 = atZ(zHi);
                const w0 = (e0.xR - e0.xL), w1 = (e1.xR - e1.xL);
                const trim0 = Math.min(9, w0 * 0.14), trim1 = Math.min(9, w1 * 0.14);
                segsAccent.push([e0.xL + trim0, e0.yL + yDir, zLo, e1.xL + trim1, e1.yL + yDir, zHi]);
                segsAccent.push([e0.xR - trim0, e0.yR + yDir, zLo, e1.xR - trim1, e1.yR + yDir, zHi]);
                segsDark.push([e0.xL + trim0 + 3, e0.yL + yDir, zLo, e1.xL + trim1 + 3, e1.yL + yDir, zHi]);
                segsDark.push([e0.xR - trim0 - 3, e0.yR + yDir, zLo, e1.xR - trim1 - 3, e1.yR + yDir, zHi]);
                const stepZ = 62 * sc;
                const rLo = Math.floor(zLo / stepZ), rHi = Math.min(rLo + 10, Math.ceil(zHi / stepZ));
                for (let r = rLo; r <= rHi; r++) {
                    const cz = (r + 0.5) * stepZ;
                    const d = stepZ * 0.34;
                    if (cz - d < zLo || cz + d > zHi) continue;
                    const bc = atZ(cz), bn = atZ(cz - d), bf = atZ(cz + d);
                    const cx = (bc.xL + bc.xR) * 0.5;
                    const rw = (bc.xR - bc.xL) * 0.22;
                    segsAccent.push([cx, bn.yL + yDir, cz - d, cx + rw, bc.yL + yDir, cz]);
                    segsAccent.push([cx + rw, bc.yL + yDir, cz, cx, bf.yL + yDir, cz + d]);
                    segsAccent.push([cx, bf.yL + yDir, cz + d, cx - rw, bc.yL + yDir, cz]);
                    segsAccent.push([cx - rw, bc.yL + yDir, cz, cx, bn.yL + yDir, cz - d]);
                }
            } else if (mat === 'tatami') {
                accentCol = makeDepthLinePaint(ctx, cam, p0, p1, p2, p3, [34, 42, 32], sh * 0.9, baseMatA * 1.45, avgVz);
                const stepZ = 96 * sc;
                const rLo = Math.floor(zLo / stepZ), rHi = Math.min(rLo + 10, Math.ceil(zHi / stepZ));
                const e0 = atZ(zLo), e1 = atZ(zHi);
                const cx0 = (e0.xL + e0.xR) * 0.5, cx1 = (e1.xL + e1.xR) * 0.5;
                if (e0.xR - e0.xL > 20) {
                    segsAccent.push([e0.xL + 2, e0.yL + yDir, zLo, e1.xL + 2, e1.yL + yDir, zHi]);
                    segsAccent.push([e0.xR - 2, e0.yR + yDir, zLo, e1.xR - 2, e1.yR + yDir, zHi]);
                    segsAccent.push([cx0, e0.yL + yDir, zLo, cx1, e1.yL + yDir, zHi]);
                }
                for (let r = rLo + 1; r < rHi; r++) {
                    const edgeZ = r * stepZ;
                    if (edgeZ > zLo + 2 && edgeZ < zHi - 2) {
                        const b = atZ(edgeZ);
                        segsAccent.push([b.xL, b.yL + yDir, edgeZ, b.xR, b.yR + yDir, edgeZ]);
                    }
                }
                if (avgVz < 520) {
                    const weaveZ = 18 * sc;
                    const wLo = Math.floor(zLo / weaveZ), wHi = Math.min(wLo + 14, Math.ceil(zHi / weaveZ));
                    for (let w = wLo + 1; w < wHi; w++) {
                        const wz = w * weaveZ;
                        if (wz > zLo + 1 && wz < zHi - 1) {
                            const b = atZ(wz);
                            segsDark.push([b.xL + 2, b.yL + yDir, wz, b.xR - 2, b.yR + yDir, wz]);
                        }
                    }
                }
            } else if (mat === 'magma_crust') {
                accentCol = foggedRGBA(cam, [225, 88, 22], 1.1, avgVz, clamp(mAlpha * 1.15, 0, 0.72));
                const cell = 84 * sc;
                const e0 = atZ(zLo), e1 = atZ(zHi);
                const xMin = Math.min(e0.xL, e1.xL), xMax = Math.max(e0.xR, e1.xR);
                const rLo = Math.floor(zLo / cell), rHi = Math.min(rLo + 10, Math.ceil(zHi / cell));
                const cLo = Math.floor(xMin / cell), cHi = Math.min(cLo + 12, Math.ceil(xMax / cell));
                const vtx = (cx, rz) => [
                    (cx + 0.25 + hash2D(cx, rz, 71) * 0.5) * cell,
                    (rz + 0.25 + hash2D(cx, rz, 72) * 0.5) * cell
                ];
                for (let r = rLo; r <= rHi; r++) {
                    for (let c = cLo; c <= cHi; c++) {
                        const pA = vtx(c, r);
                        if (pA[1] < zLo - cell || pA[1] > zHi + cell) continue;
                        const pR = vtx(c + 1, r);
                        const pD = vtx(c, r + 1);
                        if (pA[0] > xMin && pA[0] < xMax && pR[0] > xMin && pR[0] < xMax && pR[1] >= zLo && pR[1] <= zHi && pA[1] >= zLo && pA[1] <= zHi) {
                            const yA = atZ(pA[1]).yL + yDir, yR = atZ(pR[1]).yL + yDir;
                            segsDark.push([pA[0], yA, pA[1], pR[0], yR, pR[1]]);
                            if (accentCol && (hash2D(c, r, 73) > 0.35)) segsAccent.push([pA[0], yA, pA[1], pR[0], yR, pR[1]]);
                        }
                        if (pA[0] > xMin && pA[0] < xMax && pD[0] > xMin && pD[0] < xMax && pD[1] >= zLo && pD[1] <= zHi && pA[1] >= zLo && pA[1] <= zHi) {
                            const yA = atZ(pA[1]).yL + yDir, yD = atZ(pD[1]).yL + yDir;
                            segsDark.push([pA[0], yA, pA[1], pD[0], yD, pD[1]]);
                            if (accentCol && (hash2D(c, r, 74) > 0.45)) segsAccent.push([pA[0], yA, pA[1], pD[0], yD, pD[1]]);
                        }
                    }
                }
            } else {
                const steps = 4;
                for (let k = 1; k < steps; k++) {
                    const u = k / steps;
                    const a = bilerpQuad(p0, p1, p2, p3, u, 0), b = bilerpQuad(p0, p1, p2, p3, u, 1);
                    segsDark.push([a[0], a[1] + yDir, a[2], b[0], b[1] + yDir, b[2]]);
                }
            }
        } else if (isWallZ) {
            const zLo = Math.min(p0[2], p1[2]), zHi = Math.max(p0[2], p1[2]);
            const yLo = Math.min(p0[1], p3[1]), yHi = Math.max(p0[1], p3[1]);
            const wxMid = (p0[0] + p1[0] + p2[0] + p3[0]) * 0.25;
            const xOff = wxMid > cam.x ? -0.4 : 0.4;
            if (mat === 'shoji') {
                const stepZ = 34 * sc, stepY = 30 * sc;
                const frameCol = foggedRGBA(cam, [68, 42, 24], sh, avgVz, clamp(mAlpha * 1.45, 0, 0.88));
                const rLo = Math.floor(yLo / stepY), rHi = Math.min(rLo + 12, Math.ceil(yHi / stepY));
                for (let r = rLo + 1; r < rHi; r++) {
                    const wy = r * stepY;
                    if (wy > yLo + 2 && wy < yHi - 2) segsDark.push([wxMid + xOff, wy, zLo, wxMid + xOff, wy, zHi]);
                }
                const cLo = Math.floor(zLo / stepZ), cHi = Math.min(cLo + 10, Math.ceil(zHi / stepZ));
                for (let c = cLo + 1; c < cHi; c++) {
                    const wz = c * stepZ;
                    if (wz > zLo + 2 && wz < zHi - 2) segsDark.push([wxMid + xOff, yLo, wz, wxMid + xOff, yHi, wz]);
                }
                if (frameCol) strokeLineBatch3D(ctx, cam, segsDark, frameCol, Math.max(1.0, darkLW * 1.15));
                return;
            } else {
                const stepY = 44 * sc, stepZ = 58 * sc;
                const rLo = Math.floor(yLo / stepY), rHi = Math.min(rLo + 12, Math.ceil(yHi / stepY));
                for (let r = rLo; r < rHi; r++) {
                    const wy0 = clamp(r * stepY, yLo, yHi), wy1 = clamp((r + 1) * stepY, yLo, yHi);
                    if (r * stepY > yLo + 2 && r * stepY < yHi - 2) {
                        segsDark.push([wxMid + xOff, r * stepY, zLo, wxMid + xOff, r * stepY, zHi]);
                    }
                    const off = (modPos(r, 2) === 1 ? 0.5 : 0) * stepZ;
                    const cLo = Math.floor((zLo - off) / stepZ), cHi = Math.min(cLo + 10, Math.ceil((zHi - off) / stepZ));
                    for (let c = cLo; c <= cHi; c++) {
                        const wz = c * stepZ + off;
                        if (wz > zLo + 2 && wz < zHi - 2) segsDark.push([wxMid + xOff, wy0, wz, wxMid + xOff, wy1, wz]);
                    }
                }
            }
        } else {
            // 任意傾斜クアッド（反り屋根瓦、階段蹴上げ、開いた後戸、ピラミッド壁面）
            const rows = mat === 'kawara_tile' ? 3 : (mat === 'shoji' ? 4 : 3);
            const cols = mat === 'kawara_tile' ? 5 : (mat === 'shoji' ? 4 : 4);
            for (let r = 1; r < rows; r++) {
                const v = r / rows;
                const a = bilerpQuad(p0, p1, p2, p3, 0, v), b = bilerpQuad(p0, p1, p2, p3, 1, v);
                segsDark.push([a[0], a[1], a[2], b[0], b[1], b[2]]);
            }
            for (let c = 1; c < cols; c++) {
                const u = c / cols;
                const a = bilerpQuad(p0, p1, p2, p3, u, 0), b = bilerpQuad(p0, p1, p2, p3, u, 1);
                segsDark.push([a[0], a[1], a[2], b[0], b[1], b[2]]);
                if (mat === 'kawara_tile' && lightLine) {
                    const aHi = bilerpQuad(p0, p1, p2, p3, clamp(u + 0.04, 0, 1), 0);
                    const bHi = bilerpQuad(p0, p1, p2, p3, clamp(u + 0.04, 0, 1), 1);
                    segsLight.push([aHi[0], aHi[1], aHi[2], bHi[0], bHi[1], bHi[2]]);
                }
            }
        }

        if (segsDark.length) strokeLineBatch3D(ctx, cam, segsDark, darkLine, darkLW);
        if (segsLight.length && lightLine) strokeLineBatch3D(ctx, cam, segsLight, lightLine, lightLW);
        if (segsAccent.length && accentCol) strokeLineBatch3D(ctx, cam, segsAccent, accentCol, accentLW);
    }

    function drawSingleQuad3D(ctx, cam, p0, p1, p2, p3, rgb, shade, alpha, strokeRGB, o) {
        const v0 = toView(cam, p0[0], p0[1], p0[2]);
        const v1 = toView(cam, p1[0], p1[1], p1[2]);
        const v2 = toView(cam, p2[0], p2[1], p2[2]);
        const v3 = toView(cam, p3[0], p3[1], p3[2]);
        const maxVz = Math.max(v0[2], v1[2], v2[2], v3[2]);
        if (maxVz < NEAR_Z) return;
        const clipped = clipViewPoly([v0, v1, v2, v3]);
        if (!clipped) return;

        let minClipVz = Infinity, maxClipVz = 0;
        let nearIdx = 0, farIdx = 0;
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        const screenPts = [];
        for (let i = 0; i < clipped.length; i++) {
            const p = clipped[i];
            const s = cam.fov / p[2];
            const sx = cam.cx + p[0] * s;
            const sy = cam.horizonY - p[1] * s;
            if (!Number.isFinite(sx) || !Number.isFinite(sy)) return;
            if (sx < minX) minX = sx;
            if (sx > maxX) maxX = sx;
            if (sy < minY) minY = sy;
            if (sy > maxY) maxY = sy;
            if (p[2] < minClipVz) { minClipVz = p[2]; nearIdx = i; }
            if (p[2] > maxClipVz) { maxClipVz = p[2]; farIdx = i; }
            screenPts.push(sx, sy);
        }
        if (maxX < -40 || minX > cam.W + 40 || maxY < -40 || minY > cam.H + 40) return;

        const minVz = minClipVz;
        const avgVz = Math.max(NEAR_Z, (minClipVz + maxClipVz) * 0.5);
        if (minVz > cam.maxZ) return;

        const sh = shade !== undefined ? shade : 1;
        const baseA = alpha !== undefined ? alpha : 1;
        let fill = null;
        if (maxClipVz - minClipVz > 26 && nearIdx !== farIdx) {
            const nx = screenPts[nearIdx * 2], ny = screenPts[nearIdx * 2 + 1];
            const fx = screenPts[farIdx * 2], fy = screenPts[farIdx * 2 + 1];
            const d2 = (fx - nx) * (fx - nx) + (fy - ny) * (fy - ny);
            if (d2 > 16) {
                const transp = `rgba(${cam.fogRGB[0]},${cam.fogRGB[1]},${cam.fogRGB[2]},0)`;
                const c0 = foggedRGBA(cam, rgb, sh, minClipVz, baseA);
                const c3 = foggedRGBA(cam, rgb, sh, maxClipVz, baseA);
                if (c0 || c3) {
                    const invN = 1 / minClipVz, invF = 1 / maxClipVz;
                    const vz1 = 1 / lerp(invN, invF, 0.32);
                    const vz2 = 1 / lerp(invN, invF, 0.68);
                    const g = ctx.createLinearGradient(nx, ny, fx, fy);
                    safeAddColorStop(g, 0, c0 || transp);
                    safeAddColorStop(g, 0.32, foggedRGBA(cam, rgb, sh, vz1, baseA) || transp);
                    safeAddColorStop(g, 0.68, foggedRGBA(cam, rgb, sh, vz2, baseA) || transp);
                    safeAddColorStop(g, 1, c3 || transp);
                    fill = g;
                }
            }
        }
        if (!fill) {
            fill = foggedRGBA(cam, rgb, sh, avgVz, baseA);
        }
        if (!fill) return;
        const stroke = strokeRGB ? foggedRGBA(cam, strokeRGB, 1, avgVz, baseA * 0.85) : null;

        ctx.beginPath();
        ctx.moveTo(screenPts[0], screenPts[1]);
        for (let i = 2; i < screenPts.length; i += 2) {
            ctx.lineTo(screenPts[i], screenPts[i + 1]);
        }
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        if (stroke) {
            ctx.strokeStyle = stroke;
            ctx.lineWidth = o && o.lineWidth ? o.lineWidth : 1;
            ctx.stroke();
        }
        if (o && o.material) {
            drawQuadMaterial3D(ctx, cam, p0, p1, p2, p3, rgb, shade, alpha, minVz, avgVz, o);
        }
    }

    function drawQuad3D(ctx, cam, p0, p1, p2, p3, rgb, shade, alpha, strokeRGB, opts) {
        const o = opts || {};
        const nx = clamp(o.subdivideX || o.subdivide || 1, 1, 8);
        const nz = clamp(o.subdivideZ || o.subdivide || 1, 1, 8);
        if (nx === 1 && nz === 1) {
            drawSingleQuad3D(ctx, cam, p0, p1, p2, p3, rgb, shade, alpha, strokeRGB, o);
            return;
        }
        for (let iz = nz - 1; iz >= 0; iz--) {
            const vA = iz / nz;
            const vB = (iz + 1) / nz;
            const rowA0 = lerp3(p0, p3, vA), rowA1 = lerp3(p1, p2, vA);
            const rowB0 = lerp3(p0, p3, vB), rowB1 = lerp3(p1, p2, vB);
            for (let ix = 0; ix < nx; ix++) {
                const uA = ix / nx;
                const uB = (ix + 1) / nx;
                drawSingleQuad3D(
                    ctx, cam,
                    lerp3(rowA0, rowA1, uA), lerp3(rowA0, rowA1, uB),
                    lerp3(rowB0, rowB1, uB), lerp3(rowB0, rowB1, uA),
                    rgb, shade, alpha, strokeRGB, o
                );
            }
        }
    }

    function drawLine3D(ctx, cam, p0, p1, rgb, width, alpha) {
        const v0 = toView(cam, p0[0], p0[1], p0[2]);
        const v1 = toView(cam, p1[0], p1[1], p1[2]);
        if (v0[2] < NEAR_Z && v1[2] < NEAR_Z) return;
        let a = v0, b = v1;
        if (a[2] < NEAR_Z) {
            const denom = b[2] - a[2];
            const t = denom !== 0 ? (NEAR_Z - a[2]) / denom : 0;
            a = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, NEAR_Z];
        } else if (b[2] < NEAR_Z) {
            const denom = a[2] - b[2];
            const t = denom !== 0 ? (NEAR_Z - b[2]) / denom : 0;
            b = [b[0] + (a[0] - b[0]) * t, b[1] + (a[1] - b[1]) * t, NEAR_Z];
        }
        const minVz = Math.min(a[2], b[2]);
        const avgVz = (a[2] + b[2]) * 0.5;
        if (minVz > cam.maxZ) return;
        const s0 = projectView(cam, a[0], a[1], a[2]);
        const s1 = projectView(cam, b[0], b[1], b[2]);
        if (!s0 || !s1) return;
        const dx = s1[0] - s0[0];
        const dy = s1[1] - s0[1];
        const lenSq = dx * dx + dy * dy;
        if (lenSq < 0.09) return;
        const len = Math.sqrt(lenSq);

        const w = width || 2;
        const r0 = clamp(w * 0.5 * s0[2], 0.42, 14);
        const r1 = clamp(w * 0.5 * s1[2], 0.42, 14);
        const baseA = alpha !== undefined ? alpha : 1;

        let paint = null;
        if (Math.abs(a[2] - b[2]) > 26 && len > 8) {
            const transp = `rgba(${cam.fogRGB[0]},${cam.fogRGB[1]},${cam.fogRGB[2]},0)`;
            const c0 = foggedRGBA(cam, rgb, 1, a[2], baseA);
            const c1 = foggedRGBA(cam, rgb, 1, b[2], baseA);
            if (c0 || c1) {
                const vzM = 1 / ((1 / a[2] + 1 / b[2]) * 0.5);
                const g = ctx.createLinearGradient(s0[0], s0[1], s1[0], s1[1]);
                safeAddColorStop(g, 0, c0 || transp);
                safeAddColorStop(g, 0.5, foggedRGBA(cam, rgb, 1, vzM, baseA) || transp);
                safeAddColorStop(g, 1, c1 || transp);
                paint = g;
            }
        }
        if (!paint) paint = foggedRGBA(cam, rgb, 1, avgVz, baseA);
        if (!paint) return;

        // 奥行によって両端の太さが変わる真の透視テーパー帯として描画（手前での急激な極太化を防止）
        if (Math.abs(r0 - r1) >= 0.35 || r0 > 1.35 || r1 > 1.35) {
            const nx = -dy / len;
            const ny = dx / len;
            ctx.fillStyle = paint;
            ctx.beginPath();
            ctx.moveTo(s0[0] + nx * r0, s0[1] + ny * r0);
            ctx.lineTo(s1[0] + nx * r1, s1[1] + ny * r1);
            ctx.lineTo(s1[0] - nx * r1, s1[1] - ny * r1);
            ctx.lineTo(s0[0] - nx * r0, s0[1] - ny * r0);
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.strokeStyle = paint;
            ctx.lineWidth = r0 + r1;
            ctx.beginPath();
            ctx.moveTo(s0[0], s0[1]);
            ctx.lineTo(s1[0], s1[1]);
            ctx.stroke();
        }
    }

    function drawCatenary3D(ctx, cam, p0, p1, sag, segs, rgb, width, alpha) {
        const n = clamp(segs || 8, 2, 24);
        let prev = p0;
        for (let s = 1; s <= n; s++) {
            const u = s / n;
            const drop = 4 * sag * u * (1 - u);
            const cur = [
                p0[0] + (p1[0] - p0[0]) * u,
                p0[1] + (p1[1] - p0[1]) * u - drop,
                p0[2] + (p1[2] - p0[2]) * u
            ];
            drawLine3D(ctx, cam, prev, cur, rgb, width, alpha);
            prev = cur;
        }
    }

    function drawRing3D(ctx, cam, cx, cy, cz, radius, tiltX, tiltZ, segs, rgb, width, alpha) {
        const n = clamp(segs || 24, 6, 48);
        const cosX = Math.cos(tiltX || 0), sinX = Math.sin(tiltX || 0);
        const cosZ = Math.cos(tiltZ || 0), sinZ = Math.sin(tiltZ || 0);
        let prev = null;
        for (let i = 0; i <= n; i++) {
            const a = (Math.PI * 2 * i) / n;
            const lx = Math.cos(a) * radius;
            const lz = Math.sin(a) * radius;
            const y1 = -lz * sinX;
            const z1 = lz * cosX;
            const rx = lx * cosZ - y1 * sinZ;
            const ry = lx * sinZ + y1 * cosZ;
            const pt = [cx + rx, cy + ry, cz + z1];
            if (prev) drawLine3D(ctx, cam, prev, pt, rgb, width, alpha);
            prev = pt;
        }
    }

    function fillGroundBase(ctx, cam, y, halfWidth, baseRGB, steps, opts) {
        const o = opts || {};
        const zStart = cam.z + NEAR_Z;
        const zSpan = cam.maxZ - NEAR_Z;
        const n = clamp(steps || 9, 5, 20);
        const reqHw = halfWidth || 1600;
        const hw = reqHw >= 900
            ? Math.max(reqHw, (cam.W * 0.72) * (cam.maxZ / cam.fov) + Math.abs(cam.x) + 650)
            : reqHw;
        const shade = o.shade !== undefined ? o.shade : 1;
        const alpha = o.alpha !== undefined ? o.alpha : 1;

        for (let r = n - 1; r >= 0; r--) {
            const u0 = r / n;
            const u1 = (r + 1) / n;
            const z0 = zStart + zSpan * (u0 * u0);
            const z1 = zStart + zSpan * (u1 * u1);
            const col = o.farRGB ? lerpRGB(baseRGB, o.farRGB, (u0 * u0)) : baseRGB;
            drawSingleQuad3D(ctx, cam, [-hw, y, z0], [hw, y, z0], [hw, y, z1], [-hw, y, z1], col, shade, alpha, o.strokeRGB, null);
        }

        // ワールド座標固定のグラウンド表面ディテール（カメラ追従スイミングを完全防止）
        if (o.material) {
            const sp = 180;
            const zTexMax = cam.z + Math.min(1020, cam.maxZ);
            const iMin = Math.floor(zStart / sp);
            const iMax = Math.floor(zTexMax / sp);
            const texHw = Math.min(hw, 1050);
            const yOff = y > cam.y ? -0.15 : 0.15;
            for (let idx = iMax; idx >= iMin; idx--) {
                const wz0 = idx * sp;
                const wz1 = wz0 + sp;
                const avgVz = Math.max(NEAR_Z, wz0 + sp * 0.5 - cam.z);
                const minVz = Math.max(NEAR_Z, wz0 - cam.z);
                const col = o.farRGB ? lerpRGB(baseRGB, o.farRGB, clamp(avgVz / cam.maxZ, 0, 1)) : baseRGB;
                drawQuadMaterial3D(
                    ctx, cam,
                    [-texHw, y + yOff, wz0], [texHw, y + yOff, wz0],
                    [texHw, y + yOff, wz1], [-texHw, y + yOff, wz1],
                    col, shade, alpha, minVz, avgVz, o
                );
            }
        }
    }

    function drawTexturedGroundStrip(ctx, cam, xLeft, xRight, y, z0, z1, rgb, opts) {
        const o = opts || {};
        const shade = o.shade !== undefined ? o.shade : 1;
        const alpha = o.alpha !== undefined ? o.alpha : 1;
        const dirY = y > cam.y ? -1 : 1;
        const cw = (o.curbRGB && o.curbWidth > 0) ? Math.min(o.curbWidth, (xRight - xLeft) * 0.25) : 0;
        const innerL = xLeft + cw;
        const innerR = xRight - cw;
        const avgVz = Math.max(NEAR_Z, (z0 + z1) * 0.5 - cam.z);

        const baseMatOpts = o.material ? {
            material: o.material,
            materialAlpha: o.materialAlpha,
            materialScale: o.materialScale,
            lineWidth: o.lineWidth
        } : null;

        if (o.centerRGB && o.centerWidth > 0) {
            const cx = (innerL + innerR) * 0.5;
            const hw = Math.min(o.centerWidth * 0.5, (innerR - innerL) * 0.48);
            const cL = cx - hw, cR = cx + hw;
            if (cL > innerL + 0.5) {
                drawSingleQuad3D(ctx, cam, [innerL, y, z0], [cL, y, z0], [cL, y, z1], [innerL, y, z1], rgb, shade, alpha, null, baseMatOpts);
            }
            if (innerR > cR + 0.5) {
                drawSingleQuad3D(ctx, cam, [cR, y, z0], [innerR, y, z0], [innerR, y, z1], [cR, y, z1], rgb, shade, alpha, null, baseMatOpts);
            }
            const cMat = o.centerMaterial !== undefined ? o.centerMaterial : o.material;
            const cMatOpts = cMat ? {
                material: cMat,
                materialAlpha: o.centerMaterialAlpha !== undefined ? o.centerMaterialAlpha : (o.materialAlpha !== undefined ? o.materialAlpha * 0.9 : 0.34),
                materialScale: o.materialScale
            } : null;
            const cy = y + dirY * 0.28;
            drawSingleQuad3D(ctx, cam, [cL, cy, z0], [cR, cy, z0], [cR, cy, z1], [cL, cy, z1], o.centerRGB, shade * 1.03, alpha, null, cMatOpts);

            const seamCol = o.centerStrokeRGB || [
                clampByte(o.centerRGB[0] * 0.65),
                clampByte(o.centerRGB[1] * 0.65),
                clampByte(o.centerRGB[2] * 0.65)
            ];
            const seamRGBA = foggedRGBA(cam, seamCol, 1, avgVz, alpha * 0.72);
            if (seamRGBA) {
                strokeLineBatch3D(ctx, cam, [
                    [cL, cy + dirY * 0.15, z0, cL, cy + dirY * 0.15, z1],
                    [cR, cy + dirY * 0.15, z0, cR, cy + dirY * 0.15, z1]
                ], seamRGBA, 1.35);
            }
        } else {
            drawSingleQuad3D(ctx, cam, [innerL, y, z0], [innerR, y, z0], [innerR, y, z1], [innerL, y, z1], rgb, shade, alpha, null, baseMatOpts);
        }

        // スライス横断の繋ぎ目線は引かず、縦断の透視エッジ線のみを描画
        if (o.strokeRGB) {
            const edgeCol = foggedRGBA(cam, o.strokeRGB, 1, avgVz, alpha * 0.65);
            if (edgeCol) {
                strokeLineBatch3D(ctx, cam, [
                    [innerL, y + dirY * 0.2, z0, innerL, y + dirY * 0.2, z1],
                    [innerR, y + dirY * 0.2, z0, innerR, y + dirY * 0.2, z1]
                ], edgeCol, 1.25);
            }
        }

        // 立体縁石（統一光源シェードの立ち上がり面＋天端面＋接地AO陰＋ワールドZ目地）
        if (cw > 0) {
            const curbH = o.curbHeight !== undefined ? o.curbHeight : 4.2;
            const yBase = y;
            const yTop = y + dirY * curbH;
            const shSideL = shade * directionalShade(1, 0, 0);
            const shSideR = shade * directionalShade(-1, 0, 0);
            const cShadeTop = shade * directionalShade(0, dirY, 0);
            drawSingleQuad3D(ctx, cam, [innerL, yBase, z0], [innerL, yBase, z1], [innerL, yTop, z1], [innerL, yTop, z0], o.curbRGB, shSideL, alpha, null, null);
            drawSingleQuad3D(ctx, cam, [innerR, yBase, z1], [innerR, yBase, z0], [innerR, yTop, z0], [innerR, yTop, z1], o.curbRGB, shSideR, alpha, null, null);
            drawSingleQuad3D(ctx, cam, [xLeft, yTop, z0], [innerL, yTop, z0], [innerL, yTop, z1], [xLeft, yTop, z1], o.curbRGB, cShadeTop, alpha, null, null);
            drawSingleQuad3D(ctx, cam, [innerR, yTop, z0], [xRight, yTop, z0], [xRight, yTop, z1], [innerR, yTop, z1], o.curbRGB, cShadeTop, alpha, null, null);

            if (dirY > 0 && innerR - innerL > 32) {
                const aoW = Math.min(7, (innerR - innerL) * 0.08);
                drawSingleQuad3D(ctx, cam, [innerL, yBase + 0.35, z0], [innerL + aoW, yBase + 0.35, z0], [innerL + aoW, yBase + 0.35, z1], [innerL, yBase + 0.35, z1], [0, 0, 0], 1, alpha * 0.16, null, null);
                drawSingleQuad3D(ctx, cam, [innerR - aoW, yBase + 0.35, z0], [innerR, yBase + 0.35, z0], [innerR, yBase + 0.35, z1], [innerR - aoW, yBase + 0.35, z1], [0, 0, 0], 1, alpha * 0.16, null, null);
            }

            if (avgVz < 780) {
                const jointCol = foggedRGBA(cam, o.curbRGB, shade * 0.45, avgVz, alpha * 0.65);
                if (jointCol) {
                    const segs = [];
                    const jStep = 64;
                    const jLo = Math.floor(z0 / jStep) + 1;
                    const jHi = Math.min(jLo + 6, Math.ceil(z1 / jStep));
                    for (let j = jLo; j < jHi; j++) {
                        const jz = j * jStep;
                        if (jz > z0 + 2 && jz < z1 - 2) {
                            segs.push([xLeft, yTop + dirY * 0.1, jz, innerL, yTop + dirY * 0.1, jz]);
                            segs.push([innerR, yTop + dirY * 0.1, jz, xRight, yTop + dirY * 0.1, jz]);
                        }
                    }
                    if (segs.length) strokeLineBatch3D(ctx, cam, segs, jointCol, 1.1);
                }
            }
        }
    }

    function drawWaterPlane(ctx, cam, y, halfWidth, baseRGB, reflectRGB, t, opts) {
        const o = opts || {};
        const n = clamp(o.steps || 12, 6, 24);
        const reqHw = halfWidth || 1800;
        const hw = reqHw >= 900
            ? Math.max(reqHw, (cam.W * 0.72) * (cam.maxZ / cam.fov) + Math.abs(cam.x) + 650)
            : reqHw;
        const zStart = cam.z + NEAR_Z;
        const zSpan = cam.maxZ - NEAR_Z;
        const rRGB = reflectRGB || [175, 225, 255];
        const refX = o.reflectX !== undefined ? o.reflectX : 0;
        const refW = o.reflectWidth || 105;
        const spd = o.waveSpeed || 1.9;
        const amp = o.waveAmp || 18;
        const baseAlpha = o.alpha !== undefined ? o.alpha : 1;
        const horizonRGB = lerpRGB(baseRGB, rRGB, 0.22);

        for (let r = n - 1; r >= 0; r--) {
            const u0 = r / n;
            const u1 = (r + 1) / n;
            const z0 = zStart + zSpan * (u0 * u0);
            const z1 = zStart + zSpan * (u1 * u1);
            const waterCol = lerpRGB(baseRGB, horizonRGB, u0);
            drawSingleQuad3D(ctx, cam, [-hw, y, z0], [hw, y, z0], [hw, y, z1], [-hw, y, z1], waterCol, 1, baseAlpha, null, null);
        }

        // ワールド座標にロックされた3Dさざ波・水面谷線（透視法通りに手前から奥へ縮む）
        if (o.material !== null) {
            const tm = t || 0;
            const spW = 92;
            const zRippleMax = cam.z + Math.min(1100, cam.maxZ * 0.65);
            const iMin = Math.floor(zStart / spW);
            const iMax = Math.floor(zRippleMax / spW);
            const crestSegs = [];
            const troughSegs = [];
            const rippleHw = Math.min(hw, 720);
            for (let idx = iMax; idx >= iMin; idx--) {
                const baseZ = idx * spW;
                for (let k = 0; k < 3; k++) {
                    const hA = hashIdx(idx * 5 + k, 81);
                    const hB = hashIdx(idx * 5 + k, 82);
                    const wz = baseZ + modPos(hA * spW + Math.sin(tm * 0.7 + idx + k) * 9, spW);
                    if (wz - cam.z < 55) continue;
                    const wxC = (hB - 0.5) * rippleHw * 1.85 + Math.sin(tm * 0.55 + idx + k * 2) * 16;
                    const halfLen = 28 + hashIdx(idx * 5 + k, 83) * 44;
                    if (k === 0) {
                        crestSegs.push([wxC - halfLen, y + 0.25, wz, wxC + halfLen, y + 0.25, wz]);
                    } else {
                        troughSegs.push([wxC - halfLen, y + 0.2, wz, wxC + halfLen, y + 0.2, wz]);
                    }
                }
            }
            const rStrength = clamp((o.materialAlpha !== undefined ? o.materialAlpha : 0.34) * baseAlpha, 0.08, 0.5);
            const troughCol = `rgba(${clampByte(baseRGB[0] * 0.45)},${clampByte(baseRGB[1] * 0.48)},${clampByte(baseRGB[2] * 0.58)},${(rStrength * 0.75).toFixed(3)})`;
            const crestCol = `rgba(${rRGB[0]},${rRGB[1]},${rRGB[2]},${(rStrength * 0.55).toFixed(3)})`;
            if (troughSegs.length) strokeLineBatch3D(ctx, cam, troughSegs, troughCol, 1.35);
            if (crestSegs.length) strokeLineBatch3D(ctx, cam, crestSegs, crestCol, 1.15);
        }

        // ブロック状の矩形を出さず、両端が滑らかに消える有機的な水平シマー線で月光/水面の煌めきを描画
        const shimmerCount = clamp(o.shimmerCount || 26, 0, 40);
        if (shimmerCount > 0) {
            const tm = t || 0;
            const zShimmerSpan = Math.max(200, cam.maxZ - 120);
            ctx.save();
            ctx.lineCap = 'round';
            for (let k = shimmerCount - 1; k >= 0; k--) {
                const u = k / shimmerCount;
                const wz = cam.z + 85 + zShimmerSpan * (u * u);
                const nearFade = clamp((wz - cam.z - 80) / 170, 0, 1);
                const farFade = wz - cam.z > cam.maxZ * 0.76 ? Math.max(0, 1 - (wz - cam.z - cam.maxZ * 0.76) / (cam.maxZ * 0.24)) : 1;
                const phase = wz * 0.017 - tm * spd;
                const sway = Math.sin(phase) * amp * (0.3 + 0.7 * u) + Math.cos(phase * 0.63 + k) * (amp * 0.25);
                const wHalf = refW * (0.32 + 0.26 * Math.sin(phase * 1.45 + k * 0.9)) * (0.45 + u * 1.15);
                const pL = projectWorld(cam, refX + sway - wHalf, y + 0.3, wz);
                const pR = projectWorld(cam, refX + sway + wHalf, y + 0.3, wz);
                if (!pL || !pR || pL[3] < NEAR_Z || pR[3] < NEAR_Z) continue;
                const dx = pR[0] - pL[0], dy = pR[1] - pL[1];
                if (dx * dx + dy * dy < 4) continue;
                const avgVz = (pL[3] + pR[3]) * 0.5;
                const f = fogFactor(cam, avgVz);
                const inv = 1 - f;
                const rr = clampByte(rRGB[0] * inv + cam.fogRGB[0] * f);
                const gg = clampByte(rRGB[1] * inv + cam.fogRGB[1] * f);
                const bb = clampByte(rRGB[2] * inv + cam.fogRGB[2] * f);
                const pulse = 0.52 + 0.48 * Math.sin(phase * 1.8 + k * 1.3);
                const a = clamp((0.12 + 0.16 * pulse) * baseAlpha * nearFade * farFade * (1 - f * 0.55), 0, 0.5);
                if (a <= 0.008) continue;

                const grad = ctx.createLinearGradient(pL[0], pL[1], pR[0], pR[1]);
                safeAddColorStop(grad, 0, `rgba(${rr},${gg},${bb},0)`);
                safeAddColorStop(0.28, `rgba(${rr},${gg},${bb},${(a * 0.65).toFixed(3)})`);
                safeAddColorStop(0.5, `rgba(${rr},${gg},${bb},${a.toFixed(3)})`);
                safeAddColorStop(0.72, `rgba(${rr},${gg},${bb},${(a * 0.65).toFixed(3)})`);
                safeAddColorStop(1, `rgba(${rr},${gg},${bb},0)`);
                ctx.strokeStyle = grad;
                ctx.lineWidth = clamp(((pL[2] + pR[2]) * 0.5) * 3.2, 1.0, 4.2);
                ctx.beginPath();
                ctx.moveTo(pL[0], pL[1]);
                ctx.lineTo(pR[0], pR[1]);
                ctx.stroke();
            }
            ctx.restore();
        }
    }

    // ── 3D建築プリミティブ ─────────────────────────────────────────

    function drawBox3D(ctx, cam, x0, y0, z0, x1, y1, z1, rgb, opts) {
        const o = opts || {};
        const minX = x0 < x1 ? x0 : x1, maxX = x0 < x1 ? x1 : x0;
        const minY = y0 < y1 ? y0 : y1, maxY = y0 < y1 ? y1 : y0;
        const minZ = z0 < z1 ? z0 : z1, maxZ = z0 < z1 ? z1 : z0;
        const alpha = o.alpha !== undefined ? o.alpha : 1;
        const sideRGB = o.sideRGB || rgb;
        const topRGB = o.topRGB || rgb;
        const frontRGB = o.frontRGB || rgb;
        const bottomRGB = o.bottomRGB || topRGB;
        const centerVz = toView(cam, (minX + maxX) * 0.5, (minY + maxY) * 0.5, (minZ + maxZ) * 0.5)[2];
        if (centerVz > cam.maxZ + (maxZ - minZ)) return;
        if (maxZ < cam.z - 60) return;

        const sideOpts = o.sideMaterial || o.material ? { material: o.sideMaterial || o.material, materialAlpha: o.materialAlpha } : undefined;
        const topOpts = o.topMaterial || o.material ? { material: o.topMaterial || o.material, materialAlpha: o.materialAlpha } : undefined;
        const frontOpts = o.frontMaterial || o.material ? { material: o.frontMaterial || o.material, materialAlpha: o.materialAlpha } : undefined;

        if (maxZ < cam.z && !o.skipBack) {
            drawQuad3D(ctx, cam, [minX, minY, maxZ], [maxX, minY, maxZ], [maxX, maxY, maxZ], [minX, maxY, maxZ], frontRGB, directionalShade(0, 0, 1), alpha, o.strokeRGB, frontOpts);
        }
        if (cam.x > maxX) {
            drawQuad3D(ctx, cam, [maxX, minY, minZ], [maxX, minY, maxZ], [maxX, maxY, maxZ], [maxX, maxY, minZ], sideRGB, o.sideShade || directionalShade(1, 0, 0), alpha, o.strokeRGB, sideOpts);
        } else if (cam.x < minX) {
            drawQuad3D(ctx, cam, [minX, minY, maxZ], [minX, minY, minZ], [minX, maxY, minZ], [minX, maxY, maxZ], sideRGB, o.sideShade || directionalShade(-1, 0, 0), alpha, o.strokeRGB, sideOpts);
        }
        if (cam.y > maxY && !o.skipTop) {
            drawQuad3D(ctx, cam, [minX, maxY, minZ], [maxX, maxY, minZ], [maxX, maxY, maxZ], [minX, maxY, maxZ], topRGB, o.topShade || directionalShade(0, 1, 0), alpha, o.strokeRGB, topOpts);
        } else if (cam.y < minY && !o.skipBottom) {
            drawQuad3D(ctx, cam, [minX, minY, maxZ], [maxX, minY, maxZ], [maxX, minY, minZ], [minX, minY, minZ], bottomRGB, o.bottomShade || directionalShade(0, -1, 0), alpha, o.strokeRGB, topOpts);
        }
        if (minZ > cam.z - 20 && !o.skipFront) {
            drawQuad3D(ctx, cam, [minX, minY, minZ], [maxX, minY, minZ], [maxX, maxY, minZ], [minX, maxY, minZ], frontRGB, o.frontShade || directionalShade(0, 0, -1), alpha, o.strokeRGB, frontOpts);
        }
    }

    function drawCylinder3D(ctx, cam, cx, y0, y1, cz, rTop, rBot, sides, rgb, opts) {
        const o = opts || {};
        const n = clamp(sides || 10, 4, 24);
        const yb = y0 < y1 ? y0 : y1;
        const yt = y0 < y1 ? y1 : y0;
        const rb = y0 < y1 ? rBot : rTop;
        const rt = y0 < y1 ? rTop : rBot;
        const rotY = o.rotY || 0;
        const alpha = o.alpha !== undefined ? o.alpha : 1;

        const cViewZ = toView(cam, cx, (yb + yt) * 0.5, cz)[2];
        if (cViewZ < NEAR_Z - Math.max(rb, rt) || cViewZ > cam.maxZ + Math.max(rb, rt)) return;

        if (o.groundShadow && cam.y > yb) {
            drawContactShadow3D(ctx, cam, cx, yb, cz, rb * 1.45, rb * 1.45, o.shadowAlpha !== undefined ? o.shadowAlpha : 0.28);
        }

        const botRing = [];
        const topRing = [];
        for (let i = 0; i < n; i++) {
            const a = rotY + (Math.PI * 2 * i) / n;
            const ca = Math.cos(a), sa = Math.sin(a);
            botRing.push([cx + ca * rb, yb, cz + sa * rb]);
            topRing.push([cx + ca * rt, yt, cz + sa * rt]);
        }

        const faces = [];
        for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            const a = rotY + (Math.PI * 2 * (i + 0.5)) / n;
            const nx = Math.cos(a), nz = Math.sin(a);
            const shade = directionalShade(nx, 0.08, nz);
            const mx = (botRing[i][0] + botRing[j][0] + topRing[i][0] + topRing[j][0]) * 0.25;
            const mz = (botRing[i][2] + botRing[j][2] + topRing[i][2] + topRing[j][2]) * 0.25;
            const midZ = toView(cam, mx, (yb + yt) * 0.5, mz)[2];
            faces.push({ i, j, shade, midZ });
        }
        faces.sort((a, b) => b.midZ - a.midZ);

        const quadOpts = o.material ? { material: o.material, materialAlpha: o.materialAlpha } : undefined;
        for (let k = 0; k < faces.length; k++) {
            const f = faces[k];
            drawQuad3D(ctx, cam, botRing[f.i], botRing[f.j], topRing[f.j], topRing[f.i], rgb, f.shade, alpha, o.strokeRGB, quadOpts);
        }

        if (o.capTop && cam.y > yt) {
            const vTop = [];
            for (let i = 0; i < n; i++) vTop.push(toView(cam, topRing[i][0], topRing[i][1], topRing[i][2]));
            const capFill = foggedRGBA(cam, o.capRGB || rgb, 1.12, cViewZ, alpha);
            if (capFill) drawViewPoly(ctx, cam, vTop, capFill, null, 1);
        } else if (o.capBottom && cam.y < yb) {
            const vBot = [];
            for (let i = n - 1; i >= 0; i--) vBot.push(toView(cam, botRing[i][0], botRing[i][1], botRing[i][2]));
            const capFill = foggedRGBA(cam, o.capRGB || rgb, 0.6, cViewZ, alpha);
            if (capFill) drawViewPoly(ctx, cam, vBot, capFill, null, 1);
        }
    }

    function soriHeight(yBase, height, u, v, soriFactor, eaveLift) {
        const slope = 1 - Math.pow(v, 0.8);
        const tipUp = soriFactor * Math.pow(Math.abs(u), 3);
        const eaveUp = eaveLift * Math.pow(v, 2.2) * (0.35 + 0.65 * u * u);
        return yBase + height * (slope + tipUp + eaveUp);
    }

    /**
     * 反り（sori）を持つ日本の社寺・楼閣の屋根を描画します。
     */
    function drawSoriRoof3D(ctx, cam, cx, yBase, cz, width, depth, height, overhang, ridgeRGB, tileRGB, opts) {
        const o = opts || {};
        const cVz = toView(cam, cx, yBase + height * 0.5, cz)[2];
        if (cVz < NEAR_Z - depth || cVz > cam.maxZ + depth) return;

        const oh = overhang || 0;
        const hw = width * 0.5 + oh;
        const hd = depth * 0.5 + oh * 0.65;
        const xSegs = clamp(o.segs || 6, 2, 12);
        const zSegs = clamp(o.zSegs || 2, 1, 5);
        const sori = o.sori !== undefined ? o.sori : 0.22;
        const eaveLift = o.eaveLift !== undefined ? o.eaveLift : 0.14;
        const alpha = o.alpha !== undefined ? o.alpha : 1;
        const axisZ = o.axis === 'z';
        const mat = o.material === undefined ? 'kawara_tile' : o.material;
        const quadOpts = mat ? { material: mat, materialAlpha: o.materialAlpha !== undefined ? o.materialAlpha : 0.38 } : undefined;

        function roofPt(u, v, side) {
            const py = soriHeight(yBase, height, u, v, sori, eaveLift);
            if (axisZ) {
                return [cx + side * v * hw, py, cz + u * hd];
            }
            return [cx + u * hw, py, cz + side * v * hd];
        }

        const quads = [];
        const sides = [-1, 1];
        for (let si = 0; si < 2; si++) {
            const side = sides[si];
            for (let iz = 0; iz < zSegs; iz++) {
                const v0 = iz / zSegs, v1 = (iz + 1) / zSegs;
                for (let ix = 0; ix < xSegs; ix++) {
                    const u0 = -1 + (2 * ix) / xSegs;
                    const u1 = -1 + (2 * (ix + 1)) / xSegs;
                    const p0 = roofPt(u0, v0, side);
                    const p1 = roofPt(u1, v0, side);
                    const p2 = roofPt(u1, v1, side);
                    const p3 = roofPt(u0, v1, side);
                    const mx = (p0[0] + p2[0]) * 0.5;
                    const my = (p0[1] + p2[1]) * 0.5;
                    const mz = (p0[2] + p2[2]) * 0.5;
                    const midZ = toView(cam, mx, my, mz)[2];
                    const shade = side < 0 ? (0.98 - v0 * 0.12) : (0.68 - v0 * 0.1);
                    quads.push({ p0, p1, p2, p3, midZ, shade });
                }
            }
        }
        quads.sort((a, b) => b.midZ - a.midZ);
        for (let i = 0; i < quads.length; i++) {
            const q = quads[i];
            drawQuad3D(ctx, cam, q.p0, q.p1, q.p2, q.p3, tileRGB, q.shade, alpha, o.strokeRGB, quadOpts);
        }

        // 棟木（リッジビーム）
        const rThick = Math.max(4, height * 0.11);
        for (let ix = 0; ix < xSegs; ix++) {
            const u0 = -1 + (2 * ix) / xSegs;
            const u1 = -1 + (2 * (ix + 1)) / xSegs;
            const yL = soriHeight(yBase, height, u0, 0, sori, 0);
            const yR = soriHeight(yBase, height, u1, 0, sori, 0);
            if (axisZ) {
                drawQuad3D(ctx, cam, [cx - rThick * 0.5, yL, cz + u0 * hd], [cx - rThick * 0.5, yR, cz + u1 * hd], [cx - rThick * 0.5, yR + rThick, cz + u1 * hd], [cx - rThick * 0.5, yL + rThick, cz + u0 * hd], ridgeRGB, 1.08, alpha);
            } else {
                drawQuad3D(ctx, cam, [cx + u0 * hw, yL, cz - rThick * 0.5], [cx + u1 * hw, yR, cz - rThick * 0.5], [cx + u1 * hw, yR + rThick, cz - rThick * 0.5], [cx + u0 * hw, yL + rThick, cz - rThick * 0.5], ridgeRGB, 1.08, alpha);
            }
        }
    }

    function archProfile(t, style, innerHalf, thickness, ySpring, yPeak) {
        const outerHalf = innerHalf + thickness;
        if (style === 'pointed') {
            const u = Math.abs(t - 0.5) * 2;
            const sign = t < 0.5 ? -1 : 1;
            const xNorm = sign * Math.pow(u, 0.85);
            const yNorm = 1 - u * (0.45 + 0.55 * u);
            return {
                ix: xNorm * innerHalf,
                iy: ySpring + (yPeak - ySpring) * yNorm,
                ox: xNorm * outerHalf,
                oy: ySpring + (yPeak - ySpring + thickness) * yNorm
            };
        }
        const th = Math.PI * t;
        const c = -Math.cos(th), s = Math.sin(th);
        return {
            ix: c * innerHalf,
            iy: ySpring + s * (yPeak - ySpring),
            ox: c * outerHalf,
            oy: ySpring + s * (yPeak - ySpring + thickness)
        };
    }

    /**
     * 3Dアーチ構造（石橋・ゴシック回廊アーチ・尖頭アーチ）を描画します。
     */
    function drawArch3D(ctx, cam, cx, y0, ySpring, yPeak, cz, halfSpan, thickness, depth, rgb, opts) {
        const o = opts || {};
        const d = depth || 24;
        const zF = cz - d * 0.5;
        const zB = cz + d * 0.5;
        const cVz = toView(cam, cx, (y0 + yPeak) * 0.5, cz)[2];
        if (cVz < NEAR_Z - d || cVz > cam.maxZ + d) return;

        const segs = clamp(o.segs || 8, 4, 16);
        const thick = Math.max(2, thickness || 18);
        const span = Math.max(6, halfSpan || 90);
        const alpha = o.alpha !== undefined ? o.alpha : 1;
        const style = o.style || 'round';
        const quadOpts = o.material ? { material: o.material, materialAlpha: o.materialAlpha } : undefined;

        if (o.piers !== false && ySpring > y0) {
            drawBox3D(ctx, cam, cx - span - thick, y0, zF, cx - span, ySpring, zB, rgb, { alpha, material: o.material, materialAlpha: o.materialAlpha, strokeRGB: o.strokeRGB });
            drawBox3D(ctx, cam, cx + span, y0, zF, cx + span + thick, ySpring, zB, rgb, { alpha, material: o.material, materialAlpha: o.materialAlpha, strokeRGB: o.strokeRGB });
        }

        const pts = [];
        for (let i = 0; i <= segs; i++) {
            pts.push(archProfile(i / segs, style, span, thick, ySpring, yPeak));
        }

        const quads = [];
        const addQ = (p0, p1, p2, p3, shade, col) => {
            const mx = (p0[0] + p1[0] + p2[0] + p3[0]) * 0.25;
            const my = (p0[1] + p1[1] + p2[1] + p3[1]) * 0.25;
            const mz = (p0[2] + p1[2] + p2[2] + p3[2]) * 0.25;
            quads.push({ p0, p1, p2, p3, shade, col: col || rgb, midZ: toView(cam, mx, my, mz)[2] });
        };

        const midSeg = Math.floor(segs * 0.5);
        for (let i = 0; i < segs; i++) {
            const a = pts[i], b = pts[i + 1];
            const isKey = o.keystoneRGB && (i === midSeg || (segs % 2 === 0 && i === midSeg - 1));
            const segCol = isKey ? o.keystoneRGB : rgb;
            if (zB < cam.z) {
                addQ([cx + a.ix, a.iy, zB], [cx + b.ix, b.iy, zB], [cx + b.ox, b.oy, zB], [cx + a.ox, a.oy, zB], 0.72, segCol);
            }
            addQ([cx + a.ix, a.iy, zF], [cx + b.ix, b.iy, zF], [cx + b.ix, b.iy, zB], [cx + a.ix, a.iy, zB], 0.64, segCol);
            addQ([cx + a.ox, a.oy, zB], [cx + b.ox, b.oy, zB], [cx + b.ox, b.oy, zF], [cx + a.ox, a.oy, zF], 1.12, segCol);
            addQ([cx + a.ix, a.iy, zF], [cx + b.ix, b.iy, zF], [cx + b.ox, b.oy, zF], [cx + a.ox, a.oy, zF], 0.96, segCol);
        }
        quads.sort((a, b) => b.midZ - a.midZ);
        for (let i = 0; i < quads.length; i++) {
            const q = quads[i];
            drawQuad3D(ctx, cam, q.p0, q.p1, q.p2, q.p3, q.col, q.shade, alpha, o.strokeRGB, quadOpts);
        }
    }

    function drawPyramid3D(ctx, cam, cx, baseY, cz, halfBase, height, rotY, rgb, alpha, invert, opts) {
        const o = opts || {};
        const sides = clamp(o.sides || 4, 3, 8);
        const yaw = rotY || 0;
        const r = halfBase || 60;
        const h = height || 90;
        const isInv = invert === true;
        const bY = isInv ? baseY + h : baseY;
        const aY = isInv ? baseY : baseY + h;
        const apex = [cx, aY, cz];

        const corners = [];
        for (let k = 0; k < sides; k++) {
            const a = yaw + (Math.PI * 2 * k) / sides + (sides === 4 ? Math.PI * 0.25 : 0);
            corners.push([cx + Math.cos(a) * r, bY, cz + Math.sin(a) * r]);
        }

        const faces = [];
        for (let k = 0; k < sides; k++) {
            const cA = corners[k];
            const cB = corners[(k + 1) % sides];
            const midZ = toView(cam, (cA[0] + cB[0] + apex[0]) / 3, (cA[1] + cB[1] + apex[1]) / 3, (cA[2] + cB[2] + apex[2]) / 3)[2];
            const nx = (cA[0] + cB[0]) * 0.5 - cx;
            const nz = (cA[2] + cB[2]) * 0.5 - cz;
            const light = directionalShade(nx / (r || 1) * 0.85, isInv ? -0.45 : 0.45, nz / (r || 1) * 0.85);
            faces.push({ cA, cB, midZ, light });
        }
        faces.sort((a, b) => b.midZ - a.midZ);

        const wire = o.wireframe || false;
        const wireRGB = o.wireRGB || [255, 240, 170];
        for (let i = 0; i < faces.length; i++) {
            const f = faces[i];
            const v0 = toView(cam, f.cA[0], f.cA[1], f.cA[2]);
            const v1 = toView(cam, f.cB[0], f.cB[1], f.cB[2]);
            const v2 = toView(cam, apex[0], apex[1], apex[2]);
            if (Math.max(v0[2], v1[2], v2[2]) < NEAR_Z) continue;
            const vz = Math.max(NEAR_Z, f.midZ);
            if (vz > cam.maxZ) continue;
            const fill = foggedRGBA(cam, rgb, f.light, vz, alpha);
            const stroke = wire ? foggedRGBA(cam, wireRGB, 1, vz, 0.78) : (o.strokeRGB ? foggedRGBA(cam, o.strokeRGB, 1, vz, alpha) : null);
            if (fill) drawViewPoly(ctx, cam, [v0, v1, v2], fill, stroke, 1.3);
        }
    }

    function drawBillboard3D(ctx, cam, wx, wy, wz, worldW, worldH, drawFn) {
        if (typeof drawFn !== 'function') return;
        const p = projectWorld(cam, wx, wy, wz);
        if (!p) return;
        const sx = p[0], sy = p[1], scale = p[2], vz = p[3];
        if (vz < NEAR_Z || vz > cam.maxZ) return;
        const sw = (worldW || 40) * scale;
        const sh = (worldH || worldW || 40) * scale;
        if (!(sw > 0.8 || sh > 0.8)) return;
        if (sx + sw < -40 || sx - sw > cam.W + 40 || sy + sh < -40 || sy - sh > cam.H + 40) return;

        ctx.save();
        ctx.translate(sx, sy);
        drawFn(ctx, sw, sh, vz, scale, fogFactor(cam, vz));
        ctx.restore();
    }

    function forWorldSlices(cam, spacing, behindMargin, fn) {
        const sp = spacing || 100;
        const iMin = Math.floor((cam.z - (behindMargin !== undefined ? behindMargin : 40)) / sp) - 1;
        const iMax = Math.floor((cam.z + cam.maxZ) / sp);
        for (let idx = iMax; idx >= iMin; idx--) {
            fn(idx, idx * sp);
        }
    }

    function drawWorldParticles(ctx, cam, t, opts) {
        const o = opts || {};
        const count = o.count || 36;
        const boxW = o.boxW || 900;
        const boxH = o.boxH || 560;
        const boxD = o.boxD || 1500;
        const vx = o.vx || 0;
        const vy = o.vy || 0;
        const vz = o.vz || 0;
        const swayAmp = o.sway !== undefined ? o.sway : 18;
        const swaySpd = o.swaySpeed || 1.7;
        const baseSz = o.size || 6;
        const shape = o.shape || 'circle';
        const rgb = o.rgb || [255, 220, 235];
        const rgb2 = o.rgb2 || null;
        const yMin = cam.y - boxH * 0.45 + (o.yOffset || 0);
        const zNear = cam.z + 95;
        const alpha = o.alpha !== undefined ? o.alpha : 0.85;

        for (let i = 0; i < count; i++) {
            const h0 = hashIdx(i, 1);
            const h1 = hashIdx(i, 2);
            const h2 = hashIdx(i, 3);
            const spdScale = 0.7 + h2 * 0.6;
            const wx = cam.x - boxW * 0.5 + modPos(h0 * boxW + vx * spdScale * t, boxW) + Math.sin(t * swaySpd + i * 2.1) * swayAmp;
            const wy = yMin + modPos(h1 * boxH + vy * spdScale * t, boxH);
            const wz = zNear + modPos(h2 * boxD + vz * spdScale * t - cam.z, boxD);

            const v = toView(cam, wx, wy, wz);
            if (v[2] < 85 || v[2] > cam.maxZ * 0.92) continue;
            const sp = projectView(cam, v[0], v[1], v[2]);
            if (!sp) continue;
            if (sp[0] < -20 || sp[0] > cam.W + 20 || sp[1] < -20 || sp[1] > cam.H + 20) continue;

            const nearFade = clamp((v[2] - 85) / 115, 0, 1);
            const r = clamp(baseSz * sp[2], 1.1, Math.min(8.5, baseSz * 1.65));
            const pRGB = rgb2 ? lerpRGB(rgb, rgb2, h1) : rgb;
            const col = foggedRGBA(cam, pRGB, 1, v[2], alpha * nearFade);
            if (!col) continue;

            if (o.glow) {
                const glowCol = foggedRGBA(cam, pRGB, 1.1, v[2], alpha * nearFade * 0.28);
                if (glowCol) {
                    ctx.fillStyle = glowCol;
                    ctx.beginPath();
                    ctx.arc(sp[0], sp[1], r * 2.0, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            ctx.fillStyle = col;
            if (shape === 'petal') {
                const spin = t * (2.2 + h1 * 1.5) + i;
                const tilt = 0.45 + 0.55 * Math.abs(Math.cos(t * 1.8 + i));
                ctx.save();
                ctx.translate(sp[0], sp[1]);
                ctx.rotate(spin);
                ctx.beginPath();
                ctx.moveTo(-r * 1.25, 0);
                ctx.quadraticCurveTo(0, -r * 0.72 * tilt, r * 1.2, -r * 0.2 * tilt);
                ctx.lineTo(r * 0.78, 0);
                ctx.lineTo(r * 1.2, r * 0.2 * tilt);
                ctx.quadraticCurveTo(0, r * 0.72 * tilt, -r * 1.25, 0);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            } else if (shape === 'leaf') {
                const spin = t * (2.0 + h1 * 1.4) + i;
                const tilt = 0.45 + 0.55 * Math.abs(Math.cos(t * 1.7 + i));
                ctx.save();
                ctx.translate(sp[0], sp[1]);
                ctx.rotate(spin);
                ctx.beginPath();
                ctx.moveTo(0, -r * 1.25);
                ctx.lineTo(r * 0.85, -r * 0.1 * tilt);
                ctx.lineTo(0, r * 1.15);
                ctx.lineTo(-r * 0.85, -r * 0.1 * tilt);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            } else if (shape === 'diamond' || shape === 'spark') {
                const hRatio = shape === 'spark' ? 1.55 : 1;
                const wRatio = shape === 'spark' ? 0.45 : 0.7;
                ctx.beginPath();
                ctx.moveTo(sp[0], sp[1] - r * hRatio);
                ctx.lineTo(sp[0] + r * wRatio, sp[1]);
                ctx.lineTo(sp[0], sp[1] + r * hRatio);
                ctx.lineTo(sp[0] - r * wRatio, sp[1]);
                ctx.closePath();
                ctx.fill();
            } else if (shape === 'ring') {
                ctx.strokeStyle = col;
                ctx.lineWidth = Math.max(1, r * 0.28);
                ctx.beginPath();
                ctx.arc(sp[0], sp[1], r, 0, Math.PI * 2);
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.arc(sp[0], sp[1], r * 0.85, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    const BG3DCore = {
        RENDERERS: RENDERERS,
        registerRenderer: registerRenderer,
        NEAR_Z: NEAR_Z,
        hash01: hash01,
        hashIdx: hashIdx,
        noise2D: noise2D,
        fbm2D: fbm2D,
        modPos: modPos,
        clamp: clamp,
        clampByte: clampByte,
        lerp: lerp,
        lerpRGB: lerpRGB,
        makeCamera: makeCamera,
        toView: toView,
        projectView: projectView,
        projectWorld: projectWorld,
        fogFactor: fogFactor,
        foggedRGBA: foggedRGBA,
        getTexture: getTexture,
        getPattern: getPattern,
        drawStamp3D: drawStamp3D,
        drawSkyGrad: drawSkyGrad,
        drawStars: drawStars,
        drawAtmosphericGlow: drawAtmosphericGlow,
        drawHorizonGlow: drawHorizonGlow,
        drawLightShafts: drawLightShafts,
        directionalShade: directionalShade,
        drawContactShadow3D: drawContactShadow3D,
        drawViewPoly: drawViewPoly,
        drawQuad3D: drawQuad3D,
        drawLine3D: drawLine3D,
        drawCatenary3D: drawCatenary3D,
        drawRing3D: drawRing3D,
        fillGroundBase: fillGroundBase,
        drawTexturedGroundStrip: drawTexturedGroundStrip,
        drawWaterPlane: drawWaterPlane,
        drawBox3D: drawBox3D,
        drawCylinder3D: drawCylinder3D,
        drawSoriRoof3D: drawSoriRoof3D,
        drawArch3D: drawArch3D,
        drawPyramid3D: drawPyramid3D,
        drawBillboard3D: drawBillboard3D,
        forWorldSlices: forWorldSlices,
        drawWorldParticles: drawWorldParticles
    };

    global.BG3DCore = BG3DCore;
    if (typeof window !== 'undefined') window.BG3DCore = BG3DCore;
    if (typeof globalThis !== 'undefined') globalThis.BG3DCore = BG3DCore;
    if (typeof module !== 'undefined' && module.exports) module.exports = BG3DCore;
})(typeof window !== 'undefined' ? window : globalThis);
