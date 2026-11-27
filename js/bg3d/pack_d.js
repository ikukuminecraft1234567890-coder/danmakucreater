/**
 * 2D疑似3D背景レンダラ パックD (TH17鬼形獣・TH18虹龍洞・TH20東方錦上京)
 * Round 2 高精細ビジュアル版:
 * - hell (鬼形獣4-5面 地獄・血の池と針山 / 獣界鉄骨構造物)
 * - primate_spirit_garden (鬼形獣6面 霊長園・前方後円墳と埴輪 / 電脳幾何学光)
 * - lunar_rainbow_market (虹龍洞6面 誰のものでもない市場「月虹市場」)
 * - sanctuary (東方錦上京 TH20 Fossilized Wonders 聖域)
 * - pyramid (東方錦上京 TH20 Fossilized Wonders ピラミッド)
 * - pyramid_sanctum (東方錦上京 TH20 Fossilized Wonders ピラミッドの神域)
 */
(function (global) {
    'use strict';

    const C = global.BG3DCore || (typeof require === 'function' ? require('./core.js') : null);
    if (!C) {
        throw new Error('BG3DCore must be loaded before js/bg3d/pack_d.js');
    }

    const {
        NEAR_Z, hash01, hashIdx, modPos, clamp, clampByte, lerp, lerpRGB,
        makeCamera, toView, projectView, projectWorld, fogFactor, foggedRGBA,
        drawStamp3D, drawSkyGrad, drawStars, drawAtmosphericGlow, drawLightShafts,
        drawViewPoly, drawQuad3D, drawLine3D, drawCatenary3D, drawRing3D,
        fillGroundBase, drawTexturedGroundStrip, drawWaterPlane,
        drawBox3D, drawCylinder3D, drawSoriRoof3D, drawArch3D, drawPyramid3D,
        drawBillboard3D, forWorldSlices, drawWorldParticles
    } = C;

    // ── 共通ローカル3Dヘルパ ────────────────────────────────────

    function drawDoubleOctahedron(ctx, cam, cx, cy, cz, radius, halfH, rotY, rgbTop, rgbBot, alpha, wireRGB) {
        drawPyramid3D(ctx, cam, cx, cy, cz, radius, halfH, rotY, rgbTop, alpha, false, wireRGB ? { wireframe: true, wireRGB: wireRGB } : undefined);
        drawPyramid3D(ctx, cam, cx, cy - halfH, cz, radius, halfH, rotY, rgbBot || rgbTop, alpha, true, wireRGB ? { wireframe: true, wireRGB: wireRGB } : undefined);
    }

    /**
     * 明確な明暗面を持つ4面（または3面）の立体針山・岩峰を描画します（空洞に見えないソリッド表現）。
     */
    function drawSolidSpire3D(ctx, cam, cx, baseY, cz, radius, height, rotY, litRGB, darkRGB, rimRGB) {
        const sides = 4;
        const apex = [cx, baseY + height, cz];
        const base = [];
        for (let i = 0; i < sides; i++) {
            const a = rotY + (Math.PI * 2 * i) / sides + Math.PI * 0.25;
            base.push([cx + Math.cos(a) * radius, baseY, cz + Math.sin(a) * radius]);
        }
        const faces = [];
        for (let i = 0; i < sides; i++) {
            const pA = base[i];
            const pB = base[(i + 1) % sides];
            const mx = (pA[0] + pB[0] + apex[0]) / 3;
            const my = (pA[1] + pB[1] + apex[1]) / 3;
            const mz = (pA[2] + pB[2] + apex[2]) / 3;
            const midZ = toView(cam, mx, my, mz)[2];
            const nx = (pA[0] + pB[0]) * 0.5 - cx;
            const nz = (pA[2] + pB[2]) * 0.5 - cz;
            const lightFactor = clamp(0.5 + (-nx * 0.65 - nz * 0.55) / (radius || 1) * 0.55, 0, 1);
            faces.push({ pA, pB, midZ, lightFactor });
        }
        faces.sort((a, b) => b.midZ - a.midZ);
        for (let i = 0; i < faces.length; i++) {
            const f = faces[i];
            const v0 = toView(cam, f.pA[0], f.pA[1], f.pA[2]);
            const v1 = toView(cam, f.pB[0], f.pB[1], f.pB[2]);
            const v2 = toView(cam, apex[0], apex[1], apex[2]);
            if (Math.max(v0[2], v1[2], v2[2]) < NEAR_Z) continue;
            const vz = Math.max(NEAR_Z, f.midZ);
            if (vz > cam.maxZ) continue;
            const colRGB = lerpRGB(darkRGB, litRGB, f.lightFactor);
            const fill = foggedRGBA(cam, colRGB, 1, vz, 1);
            const stroke = rimRGB ? foggedRGBA(cam, rimRGB, 0.85, vz, 0.55) : null;
            if (fill) drawViewPoly(ctx, cam, [v0, v1, v2], fill, stroke, 1.1);
        }
    }

    function drawSilhouetteMountainBand(ctx, W, horizonY, baseY, amp, seed, color, ridgeColor) {
        const steps = 28;
        ctx.save();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(0, baseY);
        for (let i = 0; i <= steps; i++) {
            const u = i / steps;
            const x = u * W;
            const h = (0.35 + 0.65 * hash01(i * 4.7 + seed)) * amp
                + Math.sin(u * Math.PI * 3.2 + seed) * (amp * 0.25);
            ctx.lineTo(x, horizonY - h);
        }
        ctx.lineTo(W, baseY);
        ctx.closePath();
        ctx.fill();
        if (ridgeColor) {
            ctx.strokeStyle = ridgeColor;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (let i = 0; i <= steps; i++) {
                const u = i / steps;
                const x = u * W;
                const h = (0.35 + 0.65 * hash01(i * 4.7 + seed)) * amp
                    + Math.sin(u * Math.PI * 3.2 + seed) * (amp * 0.25);
                if (i === 0) ctx.moveTo(x, horizonY - h);
                else ctx.lineTo(x, horizonY - h);
            }
            ctx.stroke();
        }
        ctx.restore();
    }

    /**
     * 化石（アンモナイト渦巻き・古代文様）の浮彫りメダリオンを3D空間に描画します。
     */
    function drawFossilMedallion3D(ctx, cam, wx, wy, wz, size, stoneRGB, accentRGB) {
        drawBillboard3D(ctx, cam, wx, wy, wz, size, size, (g, sw, sh, vz, scale, fog) => {
            const r = Math.max(2, sw * 0.45);
            const alpha = clamp(1 - fog * 0.78, 0, 1);
            if (alpha <= 0.02) return;
            const fillCol = foggedRGBA(cam, stoneRGB, 1, vz, alpha);
            const lineCol = foggedRGBA(cam, accentRGB, 1.05, vz, alpha * 0.9);
            if (!fillCol || !lineCol) return;

            g.fillStyle = fillCol;
            g.strokeStyle = lineCol;
            g.lineWidth = Math.max(1, r * 0.09);
            g.beginPath();
            g.arc(0, 0, r, 0, Math.PI * 2);
            g.fill();
            g.stroke();

            // アンモナイト状の黄金比風スパイラル＋放射隔壁
            g.lineWidth = Math.max(0.8, r * 0.065);
            g.beginPath();
            const turns = 2.4;
            const segs = 22;
            for (let i = 0; i <= segs; i++) {
                const u = i / segs;
                const ang = u * Math.PI * 2 * turns;
                const sr = r * 0.12 + u * r * 0.7;
                const px = Math.cos(ang) * sr;
                const py = Math.sin(ang) * sr;
                if (i === 0) g.moveTo(px, py);
                else g.lineTo(px, py);
            }
            g.stroke();

            for (let k = 0; k < 8; k++) {
                const a = (k / 8) * Math.PI * 2;
                g.beginPath();
                g.moveTo(Math.cos(a) * r * 0.42, Math.sin(a) * r * 0.42);
                g.lineTo(Math.cos(a) * r * 0.86, Math.sin(a) * r * 0.86);
                g.stroke();
            }
        });
    }

    function draw3DHaniwa(ctx, cam, cx, baseY, cz, scale, side, idx, t) {
        const s = scale || 1;
        const clayRGB = [194, 146, 102];
        const clayDark = [138, 96, 62];
        const rimGold = [235, 198, 105];
        const eyeCol = [22, 16, 14];

        // 翡翠・金縁の段築石台座
        drawBox3D(ctx, cam, cx - 28 * s, baseY, cz - 26 * s, cx + 28 * s, baseY + 18 * s, cz + 26 * s, [46, 68, 64], {
            topRGB: [72, 110, 100],
            strokeRGB: [95, 225, 190]
        });
        drawBox3D(ctx, cam, cx - 23 * s, baseY + 18 * s, cz - 22 * s, cx + 23 * s, baseY + 52 * s, cz + 22 * s, [68, 86, 80], {
            topRGB: rimGold,
            material: 'stone_tiles',
            materialAlpha: 0.34,
            strokeRGB: [98, 228, 192]
        });

        const bodyY0 = baseY + 52 * s;
        // 裾広がりの袴＋腰帯＋胴体円筒
        drawCylinder3D(ctx, cam, cx, bodyY0, bodyY0 + 38 * s, cz, 15 * s, 22 * s, 8, clayDark, {
            strokeRGB: [98, 66, 42]
        });
        drawCylinder3D(ctx, cam, cx, bodyY0 + 36 * s, bodyY0 + 44 * s, cz, 16.5 * s, 16.5 * s, 8, rimGold);
        drawCylinder3D(ctx, cam, cx, bodyY0 + 44 * s, bodyY0 + 94 * s, cz, 14 * s, 15 * s, 8, clayRGB, {
            strokeRGB: [112, 74, 46]
        });

        // 左右の腕（武人埴輪らしい屈曲した腕シルエット）
        const armY = bodyY0 + 68 * s;
        const armWave = Math.sin(t * 1.4 + idx) * 3.5 * s;
        drawBox3D(ctx, cam, cx - 28 * s, armY, cz - 7 * s, cx - 14 * s, armY + 13 * s, cz + 7 * s, clayRGB);
        drawBox3D(ctx, cam, cx - 28 * s, armY + 10 * s, cz - 6 * s, cx - 19 * s, armY + 28 * s + armWave, cz + 6 * s, clayRGB);
        drawBox3D(ctx, cam, cx + 14 * s, armY, cz - 7 * s, cx + 28 * s, armY + 13 * s, cz + 7 * s, clayRGB);
        drawBox3D(ctx, cam, cx + 19 * s, armY + 10 * s, cz - 6 * s, cx + 28 * s, armY + 28 * s - armWave, cz + 6 * s, clayRGB);

        // 頭部＋埴輪の空洞目口＋武人兜
        const headY0 = bodyY0 + 94 * s;
        drawCylinder3D(ctx, cam, cx, headY0, headY0 + 34 * s, cz, 14.5 * s, 13.5 * s, 8, clayRGB, {
            capTop: true,
            capRGB: [208, 162, 116]
        });
        // 兜・冠
        drawPyramid3D(ctx, cam, cx, headY0 + 33 * s, cz, 17 * s, 18 * s, 0.4, [158, 118, 76], 1, false, {
            sides: 6,
            strokeRGB: rimGold
        });

        // 空洞の目・口（くっきり見える前面）
        const fz = cz - 15 * s;
        drawQuad3D(ctx, cam, [cx - 8.5 * s, headY0 + 18 * s, fz], [cx - 3 * s, headY0 + 18 * s, fz], [cx - 3 * s, headY0 + 24 * s, fz], [cx - 8.5 * s, headY0 + 24 * s, fz], eyeCol, 1, 0.96);
        drawQuad3D(ctx, cam, [cx + 3 * s, headY0 + 18 * s, fz], [cx + 8.5 * s, headY0 + 18 * s, fz], [cx + 8.5 * s, headY0 + 24 * s, fz], [cx + 3 * s, headY0 + 24 * s, fz], eyeCol, 1, 0.96);
        drawQuad3D(ctx, cam, [cx - 4.5 * s, headY0 + 6.5 * s, fz], [cx + 4.5 * s, headY0 + 6.5 * s, fz], [cx + 4.5 * s, headY0 + 11.5 * s, fz], [cx - 4.5 * s, headY0 + 11.5 * s, fz], eyeCol, 1, 0.94);

        // 電脳霊光の小さな光輪
        if (modPos(idx, 2) === 0) {
            drawRing3D(ctx, cam, cx, headY0 + 20 * s, cz, 23 * s, 0.45, Math.sin(t * 1.1 + idx) * 0.25, 14, side < 0 ? [95, 245, 205] : [245, 210, 105], 2, 0.72);
        }
    }

    // ── 1. 地獄風 (鬼形獣 4-5面: 血の池と立体針山・獣界鉄骨構造物) ──────

    function drawHell(ctx, W, H, t) {
        const cam = makeCamera(W, H, {
            x: Math.sin(t * 0.38) * 16,
            y: 138,
            z: t * 142,
            pitch: -0.04,
            horizonY: H * 0.33,
            fogRGB: [36, 6, 12],
            fogDist: 1080,
            maxZ: 2150
        });

        // 鬼形獣4-5面: 暗紫〜紅蓮〜焦土の地獄空
        drawSkyGrad(ctx, W, H, [
            [0, '#0a0206'],
            [0.24, '#2b0614'],
            [0.36, '#540d1d'],
            [0.66, '#23040a'],
            [1, '#0d0204']
        ]);

        drawAtmosphericGlow(ctx, W * 0.5, H * 0.28, W * 0.56, [
            [0, 'rgba(255, 92, 54, 0.44)'],
            [0.44, 'rgba(180, 24, 52, 0.22)'],
            [1, 'rgba(36, 6, 12, 0)']
        ]);
        drawLightShafts(ctx, W, H, {
            count: 5,
            x: W * 0.5,
            spread: W * 0.78,
            topW: 22,
            botW: 112,
            angle: -0.18,
            y0: 0,
            y1: H * 0.72,
            rgb: [240, 62, 58],
            alpha: 0.11,
            speed: 0.65
        }, t);

        drawSilhouetteMountainBand(ctx, W, H * 0.33 + 8, H * 0.42, 82, 13.7, '#1d040a', 'rgba(195, 48, 54, 0.45)');

        // 遠景: 畜生メトロポリスの鉄骨高層ビル群（左右の遠方、空に映えるスリット窓）
        const cityZ = cam.z + 1780;
        for (let b = -3; b <= 3; b++) {
            if (b === 0) continue;
            const bx = b * 170 + (hashIdx(b + 10, 2) - 0.5) * 30;
            const bh = 250 + hashIdx(b + 10, 3) * 200;
            const bw = 46 + hashIdx(b + 10, 4) * 24;
            drawBox3D(ctx, cam, bx - bw, 0, cityZ, bx + bw, bh, cityZ + 70, [48, 18, 28], {
                topRGB: [88, 30, 42],
                material: 'metal_rivets',
                materialAlpha: 0.35,
                strokeRGB: [155, 48, 56]
            });
            drawBox3D(ctx, cam, bx - 7, 45, cityZ - 2, bx + 7, bh - 26, cityZ, [242, 92, 56], { alpha: 0.62 });
        }

        // マグマ亀裂の河岸＋中央の血の池
        fillGroundBase(ctx, cam, 0, 1300, [34, 9, 13], 7, {
            farRGB: [22, 5, 8],
            material: 'magma_crust',
            materialAlpha: 0.42
        });

        // 血の池の深い艶のある水面（細かい透視帯反射・霧）
        drawWaterPlane(ctx, cam, 0.8, 168, [96, 8, 16], [210, 42, 46], t, {
            steps: 14,
            reflectWidth: 118,
            waveSpeed: 2.1,
            waveAmp: 14,
            alpha: 0.92,
            material: 'water_ripples',
            materialAlpha: 0.24
        });

        const spacing = 195;
        forWorldSlices(cam, spacing, 50, (idx, wz) => {
            const z0 = wz, z1 = wz + spacing;

            // 血の池を縁取る黒鉄・焦岩の堤防
            drawTexturedGroundStrip(ctx, cam, -255, -165, 2, z0, z1, [48, 14, 18], {
                material: 'magma_crust',
                materialAlpha: 0.36,
                curbRGB: [175, 48, 38],
                curbWidth: 10
            });
            drawTexturedGroundStrip(ctx, cam, 165, 255, 2, z0, z1, [48, 14, 18], {
                material: 'magma_crust',
                materialAlpha: 0.36,
                curbRGB: [175, 48, 38],
                curbWidth: 10
            });

            // 血の池表面の紅蓮の霧（控えめに低層へ）
            if (modPos(idx, 2) === 1) {
                drawStamp3D(ctx, cam, 'cloud_bank', -120, 14, wz + 90, 210, 75, { rgb: [135, 24, 34], alpha: 0.35 });
                drawStamp3D(ctx, cam, 'cloud_bank', 120, 14, wz + 90, 210, 75, { rgb: [135, 24, 34], alpha: 0.35 });
            }

            // 明確に陰影分けされた立体針山クラスター（左右に2層）
            for (let side = -1; side <= 1; side += 2) {
                const hMain = 175 + hashIdx(idx, side > 0 ? 11 : 12) * 115;
                const hSub = 105 + hashIdx(idx, side > 0 ? 13 : 14) * 75;
                const px = side * (250 + hashIdx(idx, side > 0 ? 15 : 16) * 42);
                drawSolidSpire3D(ctx, cam, px, 0, wz + 95, 68, hMain, side * 0.35,
                    [138, 36, 44], [28, 7, 12], [215, 68, 58]);
                drawSolidSpire3D(ctx, cam, px + side * 66, 0, wz + 35, 48, hSub, -side * 0.25,
                    [112, 28, 38], [22, 5, 10], [185, 52, 48]);
            }

            // 獣界鉄骨ガントリ（2スライスごとに鉄骨支柱・トラス・鎖・鬼火篝火）
            if (modPos(idx, 2) === 0) {
                const gz = wz + 42;
                drawBox3D(ctx, cam, -214, 0, gz - 14, -182, 308, gz + 14, [66, 42, 46], {
                    material: 'metal_rivets',
                    materialAlpha: 0.55,
                    strokeRGB: [158, 66, 60]
                });
                drawBox3D(ctx, cam, 182, 0, gz - 14, 214, 308, gz + 14, [66, 42, 46], {
                    material: 'metal_rivets',
                    materialAlpha: 0.55,
                    strokeRGB: [158, 66, 60]
                });
                // 地獄門の鉄製笠木・棘飾り＋クロスブレース
                drawBox3D(ctx, cam, -222, 290, gz - 12, 222, 314, gz + 12, [58, 34, 38], {
                    material: 'metal_rivets',
                    materialAlpha: 0.5,
                    topRGB: [115, 42, 42],
                    strokeRGB: [175, 76, 64]
                });
                drawBox3D(ctx, cam, -182, 252, gz - 6, 182, 264, gz + 6, [74, 38, 40], {
                    material: 'metal_rivets',
                    materialAlpha: 0.45
                });
                drawLine3D(ctx, cam, [-182, 215, gz], [-110, 290, gz], [168, 70, 58], 3.4, 0.85);
                drawLine3D(ctx, cam, [182, 215, gz], [110, 290, gz], [168, 70, 58], 3.4, 0.85);
                drawLine3D(ctx, cam, [-182, 290, gz], [-110, 252, gz], [148, 58, 52], 2.4, 0.78);
                drawLine3D(ctx, cam, [182, 290, gz], [110, 252, gz], [148, 58, 52], 2.4, 0.78);

                // 垂れ下がる鎖と吊り篝火・鬼火
                drawCatenary3D(ctx, cam, [-182, 252, gz], [182, 252, gz], 48, 10, [162, 78, 68], 3.6, 0.84);
                drawStamp3D(ctx, cam, 'lantern_glow', -145, 215, gz, 46, 52, {
                    rgb: [255, 92, 44],
                    alpha: 0.9
                });
                drawStamp3D(ctx, cam, 'lantern_glow', 145, 215, gz, 46, 52, {
                    rgb: [255, 92, 44],
                    alpha: 0.9
                });
            }
        });

        drawWorldParticles(ctx, cam, t, {
            count: 38,
            vx: 12,
            vy: 64,
            vz: 0,
            sway: 20,
            size: 4.5,
            shape: 'spark',
            rgb: [255, 98, 42],
            rgb2: [225, 42, 86],
            glow: true,
            alpha: 0.86
        });
    }

    // ── 2. 霊長園風 (鬼形獣 6面道中「エレクトリックヘリテージ」: 紅黒の電脳古代遺跡回廊) ──

    function drawPrimateSpiritGarden(ctx, W, H, t) {
        // 鬼形獣6面道中（エレクトリックヘリテージ）準拠：
        // 深紅の闇へ真っ直ぐ吸い込まれる左右の電脳遺跡壁（赤い前方後円墳シンボル・黄金/白の回路ビル模様・
        // エメラルド/シアンの電脳ライン・六角ハニカム）＋紫〜橙〜真紅へ移ろう高速床＋渦巻く黒い瘴気煙
        const cam = makeCamera(W, H, {
            x: Math.sin(t * 0.42) * 8,
            y: 136,
            z: t * 235,
            pitch: -0.02,
            horizonY: H * 0.37,
            fogRGB: [88, 6, 8],
            fogDist: 1020,
            maxZ: 2100
        });

        // 深紅〜漆黒の霊長園電脳空間ベース
        drawSkyGrad(ctx, W, H, [
            [0, '#2e0204'],
            [0.20, '#5a0508'],
            [0.37, '#8e0a0e'],
            [0.52, '#3a0610'],
            [1, '#12040a']
        ]);

        // 消失点奥から放たれる強烈な真紅のバックライト
        drawAtmosphericGlow(ctx, W * 0.5, cam.horizonY + 8, W * 0.56, [
            [0, 'rgba(255, 36, 26, 0.58)'],
            [0.42, 'rgba(182, 14, 18, 0.32)'],
            [1, 'rgba(58, 4, 8, 0)']
        ], null, { scaleX: 0.9, scaleY: 1.15 });

        // 奥へ真っ直ぐ伸びる回廊の床ベース（手前＝紫〜ピンク、中景＝橙〜黄、奥＝真紅）
        fillGroundBase(ctx, cam, 0, 1400, [92, 34, 68], 8, { farRGB: [152, 16, 16] });

        const spacing = 220;
        forWorldSlices(cam, spacing, 60, (idx, wz) => {
            const z0 = wz;
            const z1 = wz + spacing;
            const zMid = (z0 + z1) * 0.5;
            const dist = clamp((zMid - cam.z) / 1450, 0, 1);

            // ★床面：手前の古代紫〜桃色から中景の橙、奥の真紅へグラデーションする高速スリット床
            let floorCol;
            if (dist < 0.38) {
                floorCol = lerpRGB([158, 102, 128], [186, 112, 68], dist / 0.38);
            } else if (dist < 0.72) {
                floorCol = lerpRGB([186, 112, 68], [218, 46, 24], (dist - 0.38) / 0.34);
            } else {
                floorCol = lerpRGB([218, 46, 24], [142, 10, 12], (dist - 0.72) / 0.28);
            }
            drawQuad3D(ctx, cam, [-178, 0, z0], [178, 0, z0], [178, 0, z1], [-178, 0, z1], floorCol, 1.0, 0.96);

            // 床面を横切る鮮やかな光スリット帯＆古代幾何学ライン（エレクトリックヘリテージの高速感）
            for (let s = 0; s < 4; s++) {
                const sz = lerp(z0, z1, (s + 0.5) / 4);
                const isLit = ((idx + s) % 2) === 0;
                const bandCol = isLit
                    ? (dist < 0.45 ? [255, 198, 132] : [255, 92, 48])
                    : (dist < 0.45 ? [96, 46, 108] : [132, 18, 28]);
                drawQuad3D(ctx, cam,
                    [-174, 0.8, sz - 10], [174, 0.8, sz - 10],
                    [174, 0.8, sz + 10], [-174, 0.8, sz + 10],
                    bandCol, 1.0, isLit ? 0.42 : 0.30
                );
            }
            // 床両脇の古代幾何学装飾ライン
            drawLine3D(ctx, cam, [-162, 1.4, z0], [-162, 1.4, z1], [255, 178, 112], 2.0, 0.55);
            drawLine3D(ctx, cam, [162, 1.4, z0], [162, 1.4, z1], [255, 178, 112], 2.0, 0.55);

            // ★左右の電脳古代遺跡ウォール（壁面）
            for (let side = -1; side <= 1; side += 2) {
                const wx = side * 178;
                const faceIn = -side; // 内向き法線方向
                const wIn = wx + faceIn * 1.5;
                const wTop = 305;

                // 1. 真紅〜暗紅の壁本体
                drawQuad3D(ctx, cam,
                    [wx, 0, z0], [wx, 0, z1], [wx, wTop, z1], [wx, wTop, z0],
                    [112, 10, 14], 0.92, 0.98, [48, 4, 8], { lineWidth: 1.2 }
                );

                // 2. 下段の鮮烈なシアン〜エメラルドグリーンの電脳回路ライン＆光帯
                const isGreenSeg = (idx & 1) === 0;
                const lowCol = isGreenSeg ? [68, 255, 132] : [92, 245, 255];
                drawQuad3D(ctx, cam,
                    [wIn, 6, z0 + 6], [wIn, 6, z1 - 6],
                    [wIn, 52, z1 - 6], [wIn, 52, z0 + 6],
                    lowCol, 1.0, 0.24
                );
                drawLine3D(ctx, cam, [wIn + faceIn, 12, z0], [wIn + faceIn, 12, z1], [210, 255, 248], 3.2, 0.92);
                drawLine3D(ctx, cam, [wIn + faceIn, 26, z0 + 18], [wIn + faceIn, 44, zMid], lowCol, 2.4, 0.85);
                drawLine3D(ctx, cam, [wIn + faceIn, 44, zMid], [wIn + faceIn, 44, z1 - 12], lowCol, 2.4, 0.85);

                // 3. 中〜上段の黄金・白の高密度電脳ドット回路／摩天楼パネル
                const pz0 = z0 + 18;
                const pz1 = zMid - 8;
                drawQuad3D(ctx, cam,
                    [wIn, 56, pz0], [wIn, 56, pz1], [wIn, 248, pz1], [wIn, 248, pz0],
                    [44, 14, 14], 1.0, 0.82, [248, 178, 86], { lineWidth: 1.4 }
                );
                // パネル内の細かな黄金ドット窓・回路横筋
                for (let row = 0; row < 6; row++) {
                    const ry = 70 + row * 28;
                    const barCol = (row === 4) ? [196, 248, 255] : [255, 198, 108];
                    drawLine3D(ctx, cam, [wIn + faceIn, ry, pz0 + 8], [wIn + faceIn, ry, pz1 - 8], barCol, 2.0, 0.78);
                }

                // 上段の眩しいシアン白デジタル発光ウィンドウ
                if (modPos(idx, 2) === 0) {
                    drawQuad3D(ctx, cam,
                        [wIn + faceIn, 188, pz0 + 10], [wIn + faceIn, 188, pz1 - 10],
                        [wIn + faceIn, 236, pz1 - 10], [wIn + faceIn, 236, pz0 + 10],
                        [208, 252, 255], 1.08, 0.90, [255, 165, 68], { lineWidth: 2.0 }
                    );
                }

                // 4. ★壁面の超象徴モチーフ：鮮烈な朱赤の「鍵穴型（前方後円墳）ネオンマーク」
                const kz = zMid + 46;
                const ky = 148;
                // 後円部の赤円リング（壁面YZ平面上にポリゴンで描く）
                const rOut = 32;
                const rIn = 18;
                const cSegs = 10;
                for (let c = 0; c < cSegs; c++) {
                    const a0 = (c / cSegs) * Math.PI * 2;
                    const a1 = ((c + 1) / cSegs) * Math.PI * 2;
                    drawQuad3D(ctx, cam,
                        [wIn + faceIn, ky - 22 + Math.sin(a0) * rIn, kz + Math.cos(a0) * rIn],
                        [wIn + faceIn, ky - 22 + Math.sin(a0) * rOut, kz + Math.cos(a0) * rOut],
                        [wIn + faceIn, ky - 22 + Math.sin(a1) * rOut, kz + Math.cos(a1) * rOut],
                        [wIn + faceIn, ky - 22 + Math.sin(a1) * rIn, kz + Math.cos(a1) * rIn],
                        [255, 76, 36], 1.05, 0.92
                    );
                }
                // 円内側の深い暗緑コア
                drawQuad3D(ctx, cam,
                    [wIn + faceIn * 0.6, ky - 36, kz - 14], [wIn + faceIn * 0.6, ky - 36, kz + 14],
                    [wIn + faceIn * 0.6, ky - 8, kz + 14], [wIn + faceIn * 0.6, ky - 8, kz - 14],
                    [26, 78, 42], 1.0, 0.85
                );
                // 前方部の上向き三角・台形赤ネオン
                drawQuad3D(ctx, cam,
                    [wIn + faceIn, ky + 10, kz - 18], [wIn + faceIn, ky + 10, kz + 18],
                    [wIn + faceIn, ky + 72, kz + 6], [wIn + faceIn, ky + 72, kz - 6],
                    [255, 86, 42], 1.08, 0.92, [255, 206, 118], { lineWidth: 1.4 }
                );

                // 5. 六角形（ハニカム）の暗橙電脳パターン（壁面アクセント）
                const hz = z1 - 24;
                const hy = 98 + (idx & 1) * 44;
                const hr = 22;
                for (let h = 0; h < 6; h++) {
                    const a0 = (h / 6) * Math.PI * 2;
                    const a1 = ((h + 1) / 6) * Math.PI * 2;
                    drawLine3D(ctx, cam,
                        [wIn + faceIn, hy + Math.sin(a0) * hr, hz + Math.cos(a0) * hr],
                        [wIn + faceIn, hy + Math.sin(a1) * hr, hz + Math.cos(a1) * hr],
                        [188, 72, 42], 1.8, 0.68
                    );
                }
            }
        });

        // ★左右上端を疾走する緑・白の高速電脳スピードライン
        ctx.save();
        for (let i = 0; i < 10; i++) {
            const side = (i & 1) ? 1 : -1;
            const ly = H * (0.28 + hashIdx(i, 61) * 0.36);
            const phase = modPos(t * (1.8 + hashIdx(i, 62) * 1.4) + hashIdx(i, 63), 1);
            const len = 65 + hashIdx(i, 64) * 90;
            const lx = side < 0 ? lerp(-len, W * 0.24, phase) : lerp(W + len, W * 0.76, phase);
            const alpha = Math.sin(phase * Math.PI) * 0.55;
            ctx.fillStyle = (i % 3 === 0) ? `rgba(220, 255, 196, ${alpha.toFixed(2)})` : `rgba(68, 255, 118, ${alpha.toFixed(2)})`;
            ctx.fillRect(lx - len * 0.5, ly, len, 3.2);
        }

        // ★添付画像の特徴的エフェクト：画面手前・中央下〜左右上に漂う不気味な黒い瘴気モヤ（黒煙オーブ群）
        for (let s = 0; s < 18; s++) {
            const h0 = hashIdx(s, 81), h1 = hashIdx(s, 82), h2 = hashIdx(s, 83);
            const phase = modPos(t * (0.16 + h2 * 0.14) + h0, 1);
            // 中央下〜左右へ沸き上がる黒い瘴気
            const isSide = s >= 12;
            const sx = isSide
                ? ((s & 1) ? W * (0.06 + h1 * 0.14) : W * (0.80 + h1 * 0.14))
                : W * (0.20 + h1 * 0.60) + Math.sin(t * 0.9 + s) * 28;
            const sy = isSide
                ? H * (0.12 + phase * 0.38)
                : H * (0.98 - phase * 0.44);
            const sr = (28 + h2 * 42) * (0.7 + 0.5 * Math.sin(phase * Math.PI));
            const alpha = Math.sin(phase * Math.PI) * (isSide ? 0.62 : 0.54);
            if (alpha <= 0.02) continue;
            const sg = ctx.createRadialGradient(sx, sy, sr * 0.15, sx, sy, sr);
            if (sg && typeof sg.addColorStop === 'function') {
                sg.addColorStop(0, `rgba(6, 2, 8, ${alpha.toFixed(2)})`);
                sg.addColorStop(0.62, `rgba(14, 4, 16, ${(alpha * 0.65).toFixed(2)})`);
                sg.addColorStop(1, 'rgba(0, 0, 0, 0)');
            }
            ctx.fillStyle = sg;
            ctx.beginPath();
            ctx.arc(sx, sy, sr, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        // 回廊を高速に飛び抜ける電脳光粒子
        drawWorldParticles(ctx, cam, t, {
            count: 28, vx: 6, vy: 12, vz: -160, sway: 12, size: 3.8,
            shape: 'diamond', rgb: [255, 212, 128], rgb2: [96, 255, 168], glow: true, alpha: 0.72
        });
    }

    // ── 3. 月虹市場風 (虹龍洞 6面: 誰のものでもない市場・滑らかに回転する万華鏡月虹) ──

    function drawLunarRainbowMarket(ctx, W, H, t) {
        // 原作虹龍洞6面リスペクト：離散ジャンプ(Math.floor等)を一切排除し、
        // 連続色相補間と連続回転だけで完全に滑らか（カクつきゼロ）に輝く満月と七色の月虹空間
        drawSkyGrad(ctx, W, H, [
            [0, '#2a0c3e'],
            [0.35, '#461452'],
            [0.65, '#3b1048'],
            [1, '#1d082e']
        ]);

        const cx = W * 0.5 + Math.sin(t * 0.22) * 8;
        const cy = H * 0.42 + Math.cos(t * 0.19) * 6;
        const maxR = Math.hypot(W, H) * 0.68;
        const pulse = 1 + 0.028 * Math.sin(t * 1.4);

        // 主役1：画面いっぱいに広がる多層スペクトル月虹（滑らかな同心グラデーション）
        const haloGrad = ctx.createRadialGradient(cx, cy, maxR * 0.03, cx, cy, maxR * pulse);
        if (haloGrad && typeof haloGrad.addColorStop === 'function') {
            haloGrad.addColorStop(0.00, 'rgba(255, 252, 245, 0.94)');
            haloGrad.addColorStop(0.11, 'rgba(255, 212, 224, 0.82)');
            haloGrad.addColorStop(0.24, 'rgba(132, 216, 146, 0.72)');
            haloGrad.addColorStop(0.40, 'rgba(208, 214, 78, 0.70)');
            haloGrad.addColorStop(0.56, 'rgba(228, 128, 52, 0.68)');
            haloGrad.addColorStop(0.74, 'rgba(182, 54, 126, 0.62)');
            haloGrad.addColorStop(0.90, 'rgba(112, 34, 148, 0.56)');
            haloGrad.addColorStop(1.00, 'rgba(34, 10, 56, 0.78)');
        }
        ctx.fillStyle = haloGrad;
        ctx.fillRect(0, 0, W, H);

        // 連続色相サンプリング関数（カクつきゼロ）
        const spectrum = [
            [255, 118, 162],
            [255, 182, 74],
            [236, 232, 92],
            [114, 232, 138],
            [86, 206, 245],
            [186, 112, 248]
        ];
        function sampleSpectrum(u) {
            const p = modPos(u, spectrum.length);
            const i0 = Math.floor(p);
            const i1 = (i0 + 1) % spectrum.length;
            return lerpRGB(spectrum[i0], spectrum[i1], p - i0);
        }

        ctx.save();
        ctx.translate(cx, cy);

        // 主役2：完全に滑らかに回転し続ける放射状プリズム光帯（万華鏡カーテン）
        const rayCount = 48;
        for (let i = 0; i < rayCount; i++) {
            const ang = (i / rayCount) * Math.PI * 2 + t * 0.065;
            const waveLen = maxR * (0.54 + 0.18 * Math.sin(i * 3.0 + t * 0.9) + 0.12 * Math.cos(i * 5.0 - t * 0.7));
            const innerR = maxR * 0.11;
            const spread = (Math.PI / rayCount) * 1.18;
            const col = sampleSpectrum((i / rayCount) * spectrum.length + t * 0.25);
            const g = ctx.createLinearGradient(
                Math.cos(ang) * innerR, Math.sin(ang) * innerR,
                Math.cos(ang) * waveLen, Math.sin(ang) * waveLen
            );
            if (g && typeof g.addColorStop === 'function') {
                g.addColorStop(0, `rgba(${col[0]},${col[1]},${col[2]},0.24)`);
                g.addColorStop(0.55, `rgba(${col[0]},${col[1]},${col[2]},0.16)`);
                g.addColorStop(1, `rgba(${col[0]},${col[1]},${col[2]},0)`);
            }
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.moveTo(Math.cos(ang - spread * 0.4) * innerR, Math.sin(ang - spread * 0.4) * innerR);
            ctx.lineTo(Math.cos(ang - spread) * waveLen, Math.sin(ang - spread) * waveLen);
            ctx.lineTo(Math.cos(ang + spread) * waveLen, Math.sin(ang + spread) * waveLen);
            ctx.lineTo(Math.cos(ang + spread * 0.4) * innerR, Math.sin(ang + spread * 0.4) * innerR);
            ctx.closePath();
            ctx.fill();
        }

        // 連続位相で途切れなく広がり消えていく月虹の波紋リング（カクつき・ポップ一切なし）
        for (let w = 0; w < 4; w++) {
            const phase = modPos(t * 0.11 + w * 0.25, 1);
            const rr = maxR * (0.12 + phase * 0.84);
            const alpha = Math.sin(phase * Math.PI) * 0.26;
            if (alpha <= 0.005) continue;
            for (let c = 0; c < 3; c++) {
                const col = sampleSpectrum(phase * 3.0 + c * 1.6 + w * 1.5);
                ctx.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${alpha.toFixed(3)})`;
                ctx.lineWidth = 3.8;
                ctx.beginPath();
                ctx.arc(0, 0, rr + c * 6, 0, Math.PI * 2);
                ctx.stroke();
            }
        }

        // 滑らかに旋回する虹色の微細光結晶パーティクル
        for (let p = 0; p < 34; p++) {
            const phase = modPos(t * (0.08 + hashIdx(p, 91) * 0.07) + hashIdx(p, 92), 1);
            const ang = hashIdx(p, 93) * Math.PI * 2 + t * (0.08 + hashIdx(p, 94) * 0.12) * ((p & 1) ? 1 : -1);
            const pr = maxR * (0.14 + phase * 0.78);
            const px = Math.cos(ang) * pr;
            const py = Math.sin(ang) * pr;
            const sz = 2.2 + hashIdx(p, 95) * 3.2;
            const alpha = Math.sin(phase * Math.PI) * 0.78;
            const col = sampleSpectrum(p * 0.7 + t * 0.3);
            ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${alpha.toFixed(2)})`;
            ctx.beginPath();
            ctx.moveTo(px, py - sz);
            ctx.lineTo(px + sz * 0.7, py);
            ctx.lineTo(px, py + sz);
            ctx.lineTo(px - sz * 0.7, py);
            ctx.closePath();
            ctx.fill();
        }

        // 主役3：中央に清らかに輝く白い満月（月虹の中心核）
        const moonR = Math.min(W, H) * 0.088 * pulse;
        drawAtmosphericGlow(ctx, 0, 0, moonR * 3.0, [
            [0, 'rgba(255, 255, 252, 0.96)'],
            [0.32, 'rgba(255, 232, 238, 0.65)'],
            [0.65, 'rgba(255, 198, 175, 0.24)'],
            [1, 'rgba(255, 180, 150, 0)']
        ]);
        const mGrad = ctx.createRadialGradient(-moonR * 0.15, -moonR * 0.15, moonR * 0.08, 0, 0, moonR);
        if (mGrad && typeof mGrad.addColorStop === 'function') {
            mGrad.addColorStop(0, '#ffffff');
            mGrad.addColorStop(0.75, '#fff6f0');
            mGrad.addColorStop(1, '#ffdcd6');
        }
        ctx.fillStyle = mGrad;
        ctx.beginPath();
        ctx.arc(0, 0, moonR, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 弾幕視認性を守る繊細な外周ビネット
        const vig = ctx.createRadialGradient(cx, cy, maxR * 0.22, cx, cy, maxR * 1.05);
        if (vig && typeof vig.addColorStop === 'function') {
            vig.addColorStop(0, 'rgba(0, 0, 0, 0.08)');
            vig.addColorStop(0.65, 'rgba(18, 4, 28, 0.24)');
            vig.addColorStop(1, 'rgba(10, 2, 20, 0.56)');
        }
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, W, H);
    }

    // ── 4. 聖域風 (東方錦上京 TH20: 苔むした古代森・蔦・化石レリーフ・異変石) ──

    function drawSanctuary(ctx, W, H, t) {
        const cam = makeCamera(W, H, {
            x: Math.sin(t * 0.28) * 14,
            y: 136,
            z: t * 124,
            pitch: -0.03,
            horizonY: H * 0.33,
            fogRGB: [18, 46, 44],
            fogDist: 1120,
            maxZ: 2200
        });

        // 聖域の澄んだ深翠〜朝露色の山霧空
        drawSkyGrad(ctx, W, H, [
            [0, '#071a18'],
            [0.24, '#133b34'],
            [0.36, '#23594b'],
            [0.7, '#0f2d28'],
            [1, '#071815']
        ]);

        // 森の隙間から差し込む柔らかな金色と翡翠の木漏れ日
        drawAtmosphericGlow(ctx, W * 0.5, H * 0.26, W * 0.56, [
            [0, 'rgba(255, 246, 195, 0.48)'],
            [0.45, 'rgba(128, 228, 178, 0.22)'],
            [1, 'rgba(18, 46, 44, 0)']
        ]);
        drawLightShafts(ctx, W, H, {
            count: 5,
            x: W * 0.48,
            spread: W * 0.72,
            topW: 28,
            botW: 140,
            angle: 0.24,
            y0: 0,
            y1: H * 0.85,
            rgb: [255, 242, 182],
            alpha: 0.14,
            speed: 0.55
        }, t);

        drawSilhouetteMountainBand(ctx, W, H * 0.33 + 8, H * 0.42, 66, 4.3, '#102e28', 'rgba(148, 218, 180, 0.25)');

        // 地面: 深い苔むした森の林床
        fillGroundBase(ctx, cam, 0, 1300, [20, 48, 34], 7, {
            farRGB: [10, 28, 22],
            material: 'stone_tiles',
            materialAlpha: 0.24
        });

        const stoneColors = [
            [235, 72, 82],
            [78, 185, 255],
            [248, 208, 86],
            [86, 232, 148]
        ];

        const spacing = 220;
        forWorldSlices(cam, spacing, 50, (idx, wz) => {
            const z0 = wz, z1 = wz + spacing;

            // 苔むした石畳参道（中央は落ち着いた深苔石、両端に苔石縁取り）
            drawTexturedGroundStrip(ctx, cam, -172, 172, 0.8, z0, z1, [46, 78, 62], {
                material: 'stone_tiles',
                materialAlpha: 0.38,
                strokeRGB: [115, 168, 136],
                curbRGB: [88, 138, 92],
                curbWidth: 14,
                centerRGB: [62, 98, 78],
                centerWidth: 44
            });

            // 鬱蒼と生い茂る原生林の巨木・下草・シダ・頭上の重層緑樹冠（植物密度を大幅増強）
            for (let side = -1; side <= 1; side += 2) {
                const hA = hashIdx(idx, side * 7 + 3);
                const hB = hashIdx(idx, side * 11 + 5);
                const tx = side * 278;
                drawCylinder3D(ctx, cam, tx, 0, 345, z0 + 95, 20, 28, 7, [64, 46, 30], {
                    strokeRGB: [40, 28, 16]
                });
                // 参道脇・足元を覆うこんもりした下草＆シダの茂み
                drawStamp3D(ctx, cam, 'pine_bough', side * (162 + hA * 28), 22 + hB * 14, z0 + 55, 165, 118, {
                    flipX: side > 0, rgb: [42, 112, 58], alpha: 0.94
                });
                drawStamp3D(ctx, cam, 'pine_bough', side * (215 + hB * 36), 44 + hA * 18, z0 + 165, 195, 145, {
                    flipX: side < 0, rgb: [30, 92, 48], alpha: 0.92
                });
                // 中層：列柱の間から茂り出す深い緑の枝葉
                drawStamp3D(ctx, cam, 'pine_bough', side * (255 + hA * 32), 148 + hB * 28, z0 + 115, 235, 185, {
                    flipX: side < 0, rgb: [34, 98, 54], alpha: 0.92
                });
                // 上層：頭上を緑のトンネルのように覆う濃密な原生林キャノピー
                drawStamp3D(ctx, cam, 'pine_bough', side * (215 + hB * 38), 275 + hA * 24, z0 + 75, 275, 205, {
                    flipX: side > 0, rgb: [48, 122, 64], alpha: 0.95
                });
                drawStamp3D(ctx, cam, 'pine_bough', side * (112 + hA * 46), 312 + hB * 18, z0 + 150, 240, 175, {
                    flipX: side < 0, rgb: [62, 138, 74], alpha: 0.88
                });
            }

            // 苔むした古代石門列柱＋石柱に絡みつき垂れ下がる豊かな森の蔦（ツタ）
            const pillarRGB = [142, 168, 148];
            const mossCapRGB = [76, 132, 78];
            drawCylinder3D(ctx, cam, -206, 0, 282, z0 + 24, 17, 22, 8, pillarRGB, {
                material: 'marble_veins',
                materialAlpha: 0.34,
                strokeRGB: [88, 128, 98]
            });
            drawCylinder3D(ctx, cam, 206, 0, 282, z0 + 24, 17, 22, 8, pillarRGB, {
                material: 'marble_veins',
                materialAlpha: 0.34,
                strokeRGB: [88, 128, 98]
            });
            // 柱の根元と柱頭に茂る苔・蔓の房
            drawStamp3D(ctx, cam, 'pine_bough', -196, 265, z0 + 22, 118, 92, { rgb: [54, 128, 66], alpha: 0.92 });
            drawStamp3D(ctx, cam, 'pine_bough', 196, 265, z0 + 22, 118, 92, { flipX: true, rgb: [54, 128, 66], alpha: 0.92 });
            drawBox3D(ctx, cam, -234, 282, z0 + 6, -178, 306, z0 + 42, mossCapRGB, { material: 'stone_tiles', materialAlpha: 0.3 });
            drawBox3D(ctx, cam, 178, 282, z0 + 6, 234, 306, z0 + 42, mossCapRGB, { material: 'stone_tiles', materialAlpha: 0.3 });
            drawBox3D(ctx, cam, -240, 304, z0 + 10, 240, 328, z0 + 38, [122, 156, 132], {
                topRGB: mossCapRGB,
                material: 'stone_tiles',
                materialAlpha: 0.38
            });
            // 古代石梁を覆う苔樹冠＋幾筋も垂れ下がる森の蔦カーテン
            drawStamp3D(ctx, cam, 'pine_bough', (hashIdx(idx, 19) - 0.5) * 140, 328, z0 + 24, 250, 128, {
                rgb: [52, 124, 68], alpha: 0.88
            });
            drawCatenary3D(ctx, cam, [-204, 304, z0 + 24], [-62, 304, z0 + 24], 56, 7, [58, 138, 72], 3.8, 0.88);
            drawCatenary3D(ctx, cam, [62, 304, z0 + 24], [204, 304, z0 + 24], 56, 7, [58, 138, 72], 3.8, 0.88);
            drawCatenary3D(ctx, cam, [-155, 304, z0 + 24], [155, 304, z0 + 24], 34, 8, [72, 154, 82], 2.4, 0.72);
            // 柱に沿って垂れ下がる垂直の蔦ツル
            for (let side = -1; side <= 1; side += 2) {
                const vx = side * 184;
                const sway = Math.sin(t * 1.4 + idx + side) * 6;
                drawLine3D(ctx, cam, [vx, 296, z0 + 24], [vx + sway, 185, z0 + 24], [64, 146, 74], 2.6, 0.82);
                drawLine3D(ctx, cam, [vx - side * 26, 296, z0 + 24], [vx - side * 26 - sway * 0.7, 215, z0 + 24], [52, 126, 66], 2.2, 0.76);
            }

            // 化石レリーフ石碑＆4色異変石クリスタル祭壇
            for (let side = -1; side <= 1; side += 2) {
                const ax = side * 165;
                const az = z0 + 115;
                drawBox3D(ctx, cam, ax - 18, 0, az - 18, ax + 18, 50, az + 18, [74, 102, 84], {
                    material: 'stone_tiles',
                    materialAlpha: 0.38,
                    topRGB: [158, 178, 136]
                });
                if (modPos(idx, 2) === 0) {
                    const sCol = stoneColors[modPos(idx + (side > 0 ? 1 : 0), stoneColors.length)];
                    const hoverY = 76 + Math.sin(t * 2.0 + idx + side) * 7;
                    drawDoubleOctahedron(ctx, cam, ax, hoverY, az, 14, 22, t * 0.8 + idx, sCol, sCol, 0.92, [255, 250, 225]);
                } else {
                    // 古代化石レリーフ石碑（アンモナイト文様）
                    drawBox3D(ctx, cam, ax - 16, 50, az - 8, ax + 16, 118, az + 8, [104, 122, 102], {
                        material: 'stone_tiles',
                        materialAlpha: 0.35,
                        strokeRGB: [168, 192, 152]
                    });
                    drawFossilMedallion3D(ctx, cam, ax, 86, az - 10, 34, [132, 148, 118], [232, 206, 128]);
                }
            }
        });

        // 緑の木の葉と柔らかな森の胞子光
        drawWorldParticles(ctx, cam, t, {
            count: 24,
            vx: 14,
            vy: -26,
            vz: 0,
            sway: 20,
            size: 5.4,
            shape: 'leaf',
            rgb: [96, 205, 108],
            rgb2: [162, 238, 138],
            alpha: 0.84
        });
        drawWorldParticles(ctx, cam, t + 1.5, {
            count: 22,
            vx: 6,
            vy: -16,
            vz: 0,
            sway: 16,
            size: 4.2,
            shape: 'circle',
            rgb: [255, 242, 175],
            rgb2: [145, 245, 205],
            glow: true,
            alpha: 0.78
        });
    }

    // ── 5. ピラミッド風 (東方錦上京 TH20 3-4面: 漆黒に聳える黄金石積み巨大ピラミッド＆異空間の青亀裂) ──

    function drawPyramid(ctx, W, H, t) {
        // 原作東方錦上京3面（漆黒の闇に浮かび上がる黄金石積みの巨大ピラミッド本体）＋
        // 4面（赤黒くうねる壁画空間と鮮烈なコバルトブルーの稲妻亀裂）を圧倒的スケールで融合
        const orbit = t * 0.22;
        const cam = makeCamera(W, H, {
            x: Math.sin(orbit) * 145,
            y: 350 + Math.sin(t * 0.42) * 18,
            z: -360 + Math.cos(orbit) * 45,
            yaw: -Math.sin(orbit) * 0.16,
            pitch: -0.28,
            horizonY: H * 0.34,
            fogRGB: [8, 5, 10],
            fogDist: 1750,
            maxZ: 2800
        });

        // 漆黒の異空間ベース（原作3面の完全な闇＋奥に滲む4面の赤黒＆青亀裂）
        drawSkyGrad(ctx, W, H, [
            [0, '#020205'],
            [0.35, '#07040a'],
            [0.65, '#0c0508'],
            [1, '#030206']
        ]);

        // 背後空間：原作4面を想起させる赤黒い渦巻き壁画グロー＋鮮やかなコバルトブルーの亀裂稲妻
        const bgCx = W * 0.5;
        const bgCy = H * 0.36;
        drawAtmosphericGlow(ctx, bgCx, bgCy, W * 0.65, [
            [0, 'rgba(128, 32, 18, 0.26)'],
            [0.48, 'rgba(68, 16, 14, 0.16)'],
            [1, 'rgba(4, 2, 6, 0)']
        ]);
        ctx.save();
        ctx.translate(bgCx, bgCy);
        const crackCount = 6;
        for (let c = 0; c < crackCount; c++) {
            const baseAng = (c / crackCount) * Math.PI * 2 + t * 0.08;
            ctx.strokeStyle = (c & 1) ? 'rgba(28, 72, 255, 0.58)' : 'rgba(54, 118, 255, 0.42)';
            ctx.lineWidth = (c & 1) ? 5.5 : 3.2;
            ctx.lineJoin = 'miter';
            ctx.beginPath();
            let rCur = 110;
            let aCur = baseAng;
            ctx.moveTo(Math.cos(aCur) * rCur, Math.sin(aCur) * rCur);
            for (let s = 1; s <= 5; s++) {
                rCur += 68 + hashIdx(c * 10 + s, 51) * 45;
                aCur += (hashIdx(c * 10 + s, 52) - 0.5) * 0.48;
                ctx.lineTo(Math.cos(aCur) * rCur, Math.sin(aCur) * rCur);
            }
            ctx.stroke();
        }
        ctx.restore();

        // ★主役：漆黒の空間から画面いっぱいに堂々と迫る「黄金石積みの巨大ピラミッド本体」
        // 原作3面の鋭い明暗2面＋緻密な石積みブロック目地を3D面分割で緻密に描画
        const pz = 260;
        const pyrR = 460;
        const pyrH = 440;
        const baseY = -120;
        const rotY = Math.PI * 0.22 + Math.sin(t * 0.18) * 0.12;
        const apex = [0, baseY + pyrH, pz];

        const corners = [];
        for (let i = 0; i < 4; i++) {
            const a = rotY + (i * Math.PI) * 0.5;
            corners.push([Math.cos(a) * pyrR, baseY, pz + Math.sin(a) * pyrR]);
        }

        // ピラミッドの4面を奥→手前にソートし、各面を石積み段(12段)＆ブロック目地付きで立体レンダリング
        const faces = [];
        for (let i = 0; i < 4; i++) {
            const pA = corners[i];
            const pB = corners[(i + 1) % 4];
            const mx = (pA[0] + pB[0] + apex[0]) / 3;
            const my = (pA[1] + pB[1] + apex[1]) / 3;
            const mz = (pA[2] + pB[2] + apex[2]) / 3;
            const midZ = toView(cam, mx, my, mz)[2];
            // 左手前から強い黄金光、右奥は深い暗褐色に落とす（原作3面の強烈な2面コントラスト！）
            const nx = (pA[0] + pB[0]) * 0.5;
            const nz = (pA[2] + pB[2]) * 0.5 - pz;
            const light = clamp(0.48 + (-nx * 0.55 - nz * 0.65) / pyrR * 0.72, 0.08, 1.0);
            faces.push({ pA, pB, midZ, light, idx: i });
        }
        faces.sort((a, b) => b.midZ - a.midZ);

        const tiers = 11;
        for (let fi = 0; fi < faces.length; fi++) {
            const f = faces[fi];
            const baseLit = lerpRGB([52, 34, 14], [198, 152, 68], f.light);
            const mortarCol = lerpRGB([22, 14, 6], [88, 60, 24], f.light);

            // ピラミッド面を水平の石積み層＋千鳥ブロックに分割して原作3面の「不規則な石積み感」を再現
            for (let row = 0; row < tiers; row++) {
                const u0 = row / tiers;
                const u1 = (row + 1) / tiers;
                const left0 = [lerp(f.pA[0], apex[0], u0), lerp(f.pA[1], apex[1], u0), lerp(f.pA[2], apex[2], u0)];
                const right0 = [lerp(f.pB[0], apex[0], u0), lerp(f.pB[1], apex[1], u0), lerp(f.pB[2], apex[2], u0)];
                const left1 = [lerp(f.pA[0], apex[0], u1), lerp(f.pA[1], apex[1], u1), lerp(f.pA[2], apex[2], u1)];
                const right1 = [lerp(f.pB[0], apex[0], u1), lerp(f.pB[1], apex[1], u1), lerp(f.pB[2], apex[2], u1)];

                const cols = Math.max(1, tiers - row);
                for (let col = 0; col < cols; col++) {
                    const v0 = col / cols;
                    const v1 = (col + 1) / cols;
                    const q0 = [lerp(left0[0], right0[0], v0), lerp(left0[1], right0[1], v0), lerp(left0[2], right0[2], v0)];
                    const q1 = [lerp(left0[0], right0[0], v1), lerp(left0[1], right0[1], v1), lerp(left0[2], right0[2], v1)];
                    const q2 = [lerp(left1[0], right1[0], v1), lerp(left1[1], right1[1], v1), lerp(left1[2], right1[2], v1)];
                    const q3 = [lerp(left1[0], right1[0], v0), lerp(left1[1], right1[1], v0), lerp(left1[2], right1[2], v0)];

                    const hBlock = hashIdx(f.idx * 131 + row * 17 + col, 61);
                    const shade = 0.78 + hBlock * 0.36;
                    // 石ブロック1個ごとに明暗差と溝をつける
                    drawQuad3D(ctx, cam, q0, q1, q2, q3, baseLit, shade, 1, mortarCol, { lineWidth: 1.4 });
                }
            }
            // ピラミッド稜線の鋭い黄金ハイライトエッジ
            drawLine3D(ctx, cam, f.pA, apex, lerpRGB([96, 68, 28], [248, 212, 120], f.light), 2.0, 0.75);
        }

        // ピラミッド頂点から漆黒へ淡く滲む黄金の聖光
        const apexProj = projectWorld(cam, apex[0], apex[1], apex[2]);
        if (apexProj) {
            drawAtmosphericGlow(ctx, apexProj[0], apexProj[1], 115, [
                [0, 'rgba(255, 224, 132, 0.42)'],
                [0.45, 'rgba(186, 134, 52, 0.16)'],
                [1, 'rgba(8, 5, 10, 0)']
            ]);
        }

        // 周囲を静かに漂う黄金の砂塵と青い異変粒子
        drawWorldParticles(ctx, cam, t, {
            count: 34,
            vx: 8,
            vy: 14,
            vz: -18,
            sway: 16,
            size: 4.2,
            shape: 'diamond',
            rgb: [248, 206, 112],
            rgb2: [78, 148, 255],
            glow: true,
            alpha: 0.74
        });
    }

    // ── 6. ピラミッドの神域風 (東方錦上京 TH20 6面: 畏怖の巨大石鳥居・プロビデンスの目・深奥の暗黒ピラミッド・厳粛な奉納布) ──

    function drawPyramidSanctum(ctx, W, H, t) {
        // 原作東方錦上京6面「ピラミッドの神域」リスペクト：
        // ラスボス前の圧倒的な「物々しさ・畏怖感」を重視。
        // 漆黒と重厚な暗紫の石畳神域に、巨大な風化石鳥居・睨み据えるプロビデンスの目・極太の古注連縄・
        // 背後に聳える暗黒ピラミッド影と巨石群を据え、中央の視界を邪魔しない深い色調の奉納布が柱の脇から厳かに揺れる
        const cam = makeCamera(W, H, {
            x: Math.sin(t * 0.18) * 18,
            y: 148 + Math.sin(t * 0.28) * 6,
            z: -215 + Math.cos(t * 0.18) * 16,
            yaw: -Math.sin(t * 0.18) * 0.032,
            pitch: -0.05,
            horizonY: H * 0.45,
            fogRGB: [14, 7, 26],
            fogDist: 1280,
            maxZ: 2400
        });

        // 圧迫感のある漆黒〜深紫の神域空
        drawSkyGrad(ctx, W, H, [
            [0, '#010103'],
            [0.26, '#06030e'],
            [0.46, '#160c2b'],
            [0.70, '#110922'],
            [1, '#06030c']
        ]);

        // 鳥居の奥底から滲み出る重苦しく神聖な蒼紫の逆光＋斜め光条
        const pulse = 0.86 + 0.14 * Math.sin(t * 1.4);
        drawAtmosphericGlow(ctx, W * 0.5 - cam.x * 0.12, H * 0.36, W * 0.65, [
            [0, `rgba(116, 84, 212, ${(0.34 * pulse).toFixed(3)})`],
            [0.42, `rgba(54, 34, 118, ${(0.20 * pulse).toFixed(3)})`],
            [1, 'rgba(14, 7, 26, 0)']
        ], null, { scaleX: 1.25, scaleY: 0.78 });
        drawLightShafts(ctx, W, H, {
            count: 5, x: W * 0.5, spread: W * 0.56,
            topW: 16, botW: 96, angle: 0.06,
            y0: H * 0.06, y1: H * 0.84,
            rgb: [122, 98, 224], alpha: 0.08, speed: 0.25
        }, t);

        // ★遠景の物々しさ：鳥居の奥の漆黒にぼんやりと聳え立つ巨大な黒ピラミッド神殿シルエット＆古代封印円環
        const farZ = 980;
        drawSolidSpire3D(ctx, cam, 0, -20, farZ, 520, 490, 0.05,
            [28, 20, 48], [8, 5, 16], [78, 62, 134]);
        drawStamp3D(ctx, cam, 'magic_seal', 0, 220, farZ - 120, 440, 440, {
            rgb: [122, 96, 218], alpha: 0.20, rot: t * 0.08, fogStrength: 0.35
        });

        // 紫暗の重厚な石畳・玉砂利床ベース
        fillGroundBase(ctx, cam, 0, 2200, [22, 16, 40], 9, {
            farRGB: [12, 7, 24],
            material: 'cobblestone',
            materialAlpha: 0.48
        });

        // 鳥居の奥に林立する不気味な古代の巨石メンヒル（尖った立石群・原作6面の奥の石柱シルエット）
        for (let m = -3; m <= 3; m++) {
            if (m === 0) continue;
            const mx = m * 125 + (hashIdx(m + 10, 41) - 0.5) * 24;
            const mz = 460 + Math.abs(m) * 90;
            const mh = 120 + hashIdx(m + 10, 42) * 95;
            drawSolidSpire3D(ctx, cam, mx, 0, mz, 22, mh, m * 0.3,
                [56, 48, 86], [16, 12, 28], [108, 96, 158]);
        }

        // 奥の地面を低く這う濃密な暗紫の神域霧
        for (let m = -2; m <= 2; m++) {
            drawStamp3D(ctx, cam, 'cloud_bank', m * 185 + Math.sin(t * 0.32 + m) * 20, 22, 420 + Math.abs(m) * 70, 420, 125, {
                rgb: [78, 58, 138], alpha: 0.40, fogStrength: 0.32
            });
        }

        // ★4色の厳粛な奉納布（鳥居の奥・左右の柱の脇から垂れ下がり・ゆっくり揺れる：中央の視界を一切邪魔しない！）
        function drawSolemnStreamer(rgb, xBase, yTop, yBot, zBase, swayAmp, width, phase) {
            const segs = 12;
            let pL = null, pR = null;
            for (let i = 0; i <= segs; i++) {
                const u = i / segs;
                const y = lerp(yTop, yBot, u);
                const drift = Math.sin(u * Math.PI * 1.8 - t * 1.25 + phase) * swayAmp * u;
                const driftZ = Math.cos(u * Math.PI * 1.4 - t * 0.95 + phase) * (swayAmp * 0.6) * u;
                const w = width * (0.65 + 0.35 * Math.abs(Math.cos(u * Math.PI * 1.5 + t * 0.9 + phase)));
                const curL = [xBase + drift - w, y, zBase + driftZ];
                const curR = [xBase + drift + w, y, zBase + driftZ];
                if (pL && pR) {
                    const shade = 0.62 + 0.36 * (0.5 + 0.5 * Math.sin(u * Math.PI * 2 + phase));
                    drawQuad3D(ctx, cam, pL, pR, curR, curL, rgb, shade, 0.72);
                }
                pL = curL;
                pR = curR;
            }
        }
        // 奥側・左右の柱脇に垂下する深みのある4色の神事奉納布（深菫・深紅・深翠・古金）
        drawSolemnStreamer([92, 68, 178], -220, 298, 22, 275, 28, 9, 0.4);   // 左外・深菫
        drawSolemnStreamer([156, 28, 38], -168, 255, 8, 255, 24, 8, 1.9);    // 左柱脇・深紅
        drawSolemnStreamer([38, 132, 62], 168, 255, 12, 255, 24, 8, 3.4);    // 右柱脇・深翠
        drawSolemnStreamer([178, 148, 42], 220, 298, 26, 275, 28, 9, 4.8);   // 右外・古金

        // ★主役1：圧倒的な威圧感でそびえる「風化した巨大石鳥居」
        const tz = 240;
        const span = 152;
        const toriiH = 286;
        const stoneMain = [98, 92, 128];
        const stoneDark = [42, 38, 64];
        const stoneEdge = [148, 142, 184];

        // 左右の極太石柱＋重厚な段築礎石（亀腹）
        for (let side = -1; side <= 1; side += 2) {
            const px = side * span;
            drawCylinder3D(ctx, cam, px, 0, 32, tz, 34, 42, 10, stoneDark, {
                capTop: true, capRGB: stoneMain, material: 'stone_tiles', materialAlpha: 0.42
            });
            drawCylinder3D(ctx, cam, px, 30, toriiH, tz, 23, 29, 10, stoneMain, {
                material: 'stone_tiles', materialAlpha: 0.48, strokeRGB: [32, 28, 50]
            });
            // 石柱の深い縦溝影
            drawLine3D(ctx, cam, [px - side * 8, 34, tz - 25], [px - side * 6, toriiH - 6, tz - 22], [28, 24, 46], 2.4, 0.72);
        }
        // 貫（重厚な下の横石梁）
        drawBox3D(ctx, cam, -span - 64, toriiH * 0.71, tz - 16, span + 64, toriiH * 0.80, tz + 16, stoneMain, {
            topRGB: stoneEdge, material: 'stone_tiles', materialAlpha: 0.46, strokeRGB: stoneDark
        });
        // 笠木・島木（二段重ねの巨大石梁）
        drawBox3D(ctx, cam, -span - 82, toriiH - 6, tz - 22, span + 82, toriiH + 22, tz + 22, stoneMain, {
            topRGB: stoneEdge, material: 'stone_tiles', materialAlpha: 0.46, strokeRGB: stoneDark
        });
        drawBox3D(ctx, cam, -span - 94, toriiH + 20, tz - 25, span + 94, toriiH + 38, tz + 25, [122, 116, 154], {
            topRGB: [168, 162, 204], strokeRGB: stoneDark
        });

        // ★主役2：闇の中からこちらを睨み据える「プロビデンスの目（三角の目玉）」巨大扁額
        const eyeCx = 0;
        const eyeBaseY = toriiH * 0.79;
        const eyeTopY = toriiH + 20;
        const eyeHalfW = 58;
        const eyeZ = tz - 22;
        const triV0 = toView(cam, eyeCx - eyeHalfW, eyeBaseY, eyeZ);
        const triV1 = toView(cam, eyeCx + eyeHalfW, eyeBaseY, eyeZ);
        const triV2 = toView(cam, eyeCx, eyeTopY, eyeZ);
        drawViewPoly(ctx, cam, [triV0, triV1, triV2], 'rgba(20, 16, 38, 0.98)', 'rgba(182, 178, 224, 0.95)', 3.6);
        const inV0 = toView(cam, eyeCx - eyeHalfW * 0.76, eyeBaseY + 8, eyeZ - 1);
        const inV1 = toView(cam, eyeCx + eyeHalfW * 0.76, eyeBaseY + 8, eyeZ - 1);
        const inV2 = toView(cam, eyeCx, eyeTopY - 12, eyeZ - 1);
        drawViewPoly(ctx, cam, [inV0, inV1, inV2], 'rgba(38, 32, 68, 0.94)', 'rgba(208, 214, 255, 0.88)', 2.0);

        const eyeProj = projectWorld(cam, eyeCx, (eyeBaseY + eyeTopY) * 0.47 + 6, eyeZ - 2);
        if (eyeProj && eyeProj[3] > 20) {
            const ex = eyeProj[0];
            const ey = eyeProj[1];
            const er = clamp(26 * eyeProj[2], 6, 46);
            ctx.save();
            // 目の周囲に宿る不気味で神聖な蒼紫のオーラ
            drawAtmosphericGlow(ctx, ex, ey, er * 2.8 * pulse, [
                [0, 'rgba(186, 224, 255, 0.56)'],
                [0.42, 'rgba(128, 98, 238, 0.24)'],
                [1, 'rgba(0, 0, 0, 0)']
            ]);
            // 白目（鋭いアーモンド型）
            ctx.fillStyle = '#e8ecff';
            ctx.strokeStyle = '#b4b8e8';
            ctx.lineWidth = Math.max(1.5, er * 0.11);
            ctx.beginPath();
            ctx.moveTo(ex - er * 1.18, ey);
            ctx.quadraticCurveTo(ex, ey - er * 0.72, ex + er * 1.18, ey);
            ctx.quadraticCurveTo(ex, ey + er * 0.72, ex - er * 1.18, ey);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            // 深い蒼紫の虹彩と鋭い黒瞳孔
            ctx.fillStyle = '#323a82';
            ctx.beginPath();
            ctx.arc(ex, ey, er * 0.42, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#080818';
            ctx.beginPath();
            ctx.arc(ex, ey, er * 0.20, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(ex - er * 0.11, ey - er * 0.10, er * 0.085, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // ★主役3：極太の古びた注連縄と揺れ下がる重い縄房（9本）
        const ropeY = toriiH * 0.71;
        const ropeZ = tz - 17;
        drawCatenary3D(ctx, cam, [-span + 22, ropeY, ropeZ], [span - 22, ropeY, ropeZ], 38, 12, [142, 112, 64], 12.5, 0.98);
        drawCatenary3D(ctx, cam, [-span + 22, ropeY - 5, ropeZ], [span - 22, ropeY - 5, ropeZ], 42, 12, [96, 72, 38], 7.0, 0.95);
        for (let k = -4; k <= 4; k++) {
            const u = (k + 5) / 10;
            const sx = lerp(-span + 24, span - 24, u);
            const sy = ropeY - 4 * 38 * u * (1 - u);
            const sway = Math.sin(t * 1.5 + k * 0.85) * 4;
            const len = 36 + (4 - Math.abs(k)) * 6;
            drawQuad3D(ctx, cam,
                [sx - 4.8, sy - 2, ropeZ - 1], [sx + 4.8, sy - 2, ropeZ - 1],
                [sx + 2.2 + sway, sy - len, ropeZ - 2], [sx - 2.2 + sway, sy - len, ropeZ - 2],
                [128, 100, 58], 0.92, 0.94
            );
        }

        // 足元を這う重厚な暗紫の霧（手前左右）
        drawStamp3D(ctx, cam, 'cloud_bank', -175 + Math.sin(t * 0.35) * 26, 12, 48, 360, 105, {
            rgb: [72, 54, 128], alpha: 0.36, fogStrength: 0.25
        });
        drawStamp3D(ctx, cam, 'cloud_bank', 185 - Math.sin(t * 0.35) * 26, 12, 72, 360, 105, {
            rgb: [72, 54, 128], alpha: 0.36, fogStrength: 0.25
        });

        // 画面四隅を重く引き締める神域ビネット（物々しさを倍増）
        const vig = ctx.createRadialGradient(W * 0.5, H * 0.44, Math.min(W, H) * 0.28, W * 0.5, H * 0.44, Math.hypot(W, H) * 0.65);
        if (vig && typeof vig.addColorStop === 'function') {
            vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
            vig.addColorStop(0.68, 'rgba(8, 3, 18, 0.22)');
            vig.addColorStop(1, 'rgba(2, 1, 8, 0.64)');
        }
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, W, H);

        // 静謐に舞い上がる蒼紫・古金の神域光塵
        drawWorldParticles(ctx, cam, t, {
            count: 28,
            vx: 6,
            vy: 14,
            vz: -8,
            sway: 14,
            size: 3.8,
            shape: 'diamond',
            rgb: [176, 148, 255],
            rgb2: [228, 198, 108],
            glow: true,
            alpha: 0.66
        });
    }

    C.registerRenderer('hell', drawHell);
    C.registerRenderer('primate_spirit_garden', drawPrimateSpiritGarden);
    C.registerRenderer('lunar_rainbow_market', drawLunarRainbowMarket);
    C.registerRenderer('sanctuary', drawSanctuary);
    C.registerRenderer('pyramid', drawPyramid);
    C.registerRenderer('pyramid_sanctum', drawPyramidSanctum);
})(typeof window !== 'undefined' ? window : globalThis);
