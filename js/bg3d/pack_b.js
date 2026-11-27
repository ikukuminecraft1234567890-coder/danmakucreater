/**
 * 2D疑似3D背景プリセット パックB (js/bg3d/pack_b.js)
 * TH10 風神録 〜 TH12 星蓮船前半 (7プリセット)
 *   1. youkai_mountain  (風神録3-4面: 妖怪の山 渓谷と九天の滝・紅葉)
 *   2. moriya_shrine    (風神録5-6面: 守矢神社・風神の湖・御柱と注連縄)
 *   3. old_hell         (地霊殿3-5面: 旧都の街並みと太鼓橋・地霊殿地下空間)
 *   4. mantle           (地霊殿6面:   灼熱地獄跡・核融合炉マントル)
 *   5. haru_no_minato   (星蓮船1面:   春の湊に・残雪と雲海)
 *   6. sky_ruin         (星蓮船2-3面: 雲上のスカイルーイン・高速浮遊遺跡)
 *   7. palanquin_ship   (星蓮船4面:   聖輦船甲板・宝船の飛翔)
 */
(function (global) {
    'use strict';

    const Core = (typeof window !== 'undefined' && window.BG3DCore) || global.BG3DCore ||
        (typeof require === 'function' ? require('./core.js') : null);
    if (!Core) return;

    const {
        NEAR_Z, hashIdx, modPos, clamp, lerp,
        makeCamera, toView, projectWorld, foggedRGBA,
        drawStamp3D, drawSkyGrad, drawStars, drawAtmosphericGlow,
        drawLightShafts, drawViewPoly, drawQuad3D, drawLine3D, drawCatenary3D,
        drawRing3D, fillGroundBase, drawTexturedGroundStrip, drawWaterPlane,
        drawBox3D, drawCylinder3D, drawSoriRoof3D, drawArch3D, drawPyramid3D,
        forWorldSlices, drawWorldParticles
    } = Core;

    // ── 共通ローカルヘルパー ────────────────────────────────────────

    function drawDistantMountainBand(ctx, cam, wz, baseY, peakBase, spanW, segs, rgb, seed, alpha) {
        const half = spanW * 0.5;
        const step = spanW / segs;
        for (let i = 0; i < segs; i++) {
            const x0 = -half + i * step;
            const x1 = x0 + step;
            const xm = (x0 + x1) * 0.5;
            const hL = peakBase * (0.45 + hashIdx(i, seed) * 0.65);
            const hM = peakBase * (0.65 + hashIdx(i, seed + 7) * 0.85);
            const hR = peakBase * (0.45 + hashIdx(i + 1, seed) * 0.65);
            const v0 = toView(cam, x0, baseY, wz);
            const v1 = toView(cam, x0, baseY + hL, wz);
            const v2 = toView(cam, xm, baseY + hM, wz);
            const v3 = toView(cam, x1, baseY + hR, wz);
            const v4 = toView(cam, x1, baseY, wz);
            const avgZ = Math.max(NEAR_Z, (v0[2] + v2[2] + v4[2]) / 3);
            if (avgZ > cam.maxZ) continue;
            const col = foggedRGBA(cam, rgb, 1, avgZ, alpha !== undefined ? alpha : 0.92);
            if (col) drawViewPoly(ctx, cam, [v0, v1, v2, v3, v4], col, null, 1);
        }
    }

    /**
     * 太く編み込んだ注連縄と控えめな紙垂を描画します（近距離クリップ対策で適切なスケールを保持）。
     */
    function drawShimenawaSpan(ctx, cam, xL, xR, y, z, sag, ropeRGB, shideCount, thickScale) {
        const sc = thickScale || 1;
        drawCatenary3D(ctx, cam, [xL, y + 3, z], [xR, y + 3, z], sag, 10, ropeRGB, 8.5 * sc, 0.96);
        drawCatenary3D(ctx, cam, [xL, y - 2, z], [xR, y - 2, z], sag + 2.5, 10, [168, 142, 82], 4.5 * sc, 0.9);
        const cnt = shideCount || 5;
        for (let k = 0; k < cnt; k++) {
            const u = (k + 1) / (cnt + 1);
            const sx = lerp(xL, xR, u);
            const sy = y - 4 * sag * u * (1 - u);
            const sw = 4.2 * sc;
            const sh = 11 * sc;
            drawQuad3D(ctx, cam,
                [sx - sw, sy - sh, z], [sx + sw, sy - sh, z],
                [sx + sw * 0.75, sy, z], [sx - sw * 0.75, sy, z],
                [244, 248, 244], 1.0, 0.94
            );
            drawQuad3D(ctx, cam,
                [sx - sw * 0.65, sy - sh * 1.95, z], [sx + sw * 0.95, sy - sh * 1.95, z],
                [sx + sw * 0.65, sy - sh * 0.9, z], [sx - sw, sy - sh * 0.9, z],
                [226, 235, 232], 0.92, 0.9
            );
        }
    }

    function drawTorii3D(ctx, cam, cx, y0, cz, halfSpan, height, vermilionRGB, capRGB) {
        const yTop = y0 + height;
        const rPillar = Math.max(8, halfSpan * 0.085);
        for (let side = -1; side <= 1; side += 2) {
            const px = cx + side * halfSpan;
            drawCylinder3D(ctx, cam, px, y0, y0 + 24, cz, rPillar * 1.25, rPillar * 1.38, 8, [34, 34, 40]);
            drawCylinder3D(ctx, cam, px, y0 + 22, yTop - 6, cz, rPillar * 0.88, rPillar, 8, vermilionRGB);
        }
        const nukiY = yTop - height * 0.22;
        drawBox3D(ctx, cam, cx - halfSpan * 1.24, nukiY - 8, cz - 7, cx + halfSpan * 1.24, nukiY + 7, cz + 7, vermilionRGB);
        const kasagiW = halfSpan * 1.42;
        drawBox3D(ctx, cam, cx - kasagiW * 0.92, yTop - 12, cz - 11, cx + kasagiW * 0.92, yTop + 2, cz + 11, vermilionRGB);
        drawBox3D(ctx, cam, cx - kasagiW, yTop + 2, cz - 13, cx + kasagiW, yTop + 14, cz + 13, capRGB || [28, 26, 32]);
        for (let side = -1; side <= 1; side += 2) {
            const xIn = cx + side * kasagiW * 0.88;
            const xOut = cx + side * (kasagiW + 22);
            drawQuad3D(ctx, cam, [xIn, yTop + 2, cz - 12], [xOut, yTop + 11, cz - 12], [xOut, yTop + 21, cz - 12], [xIn, yTop + 14, cz - 12], capRGB || [28, 26, 32], 1.05, 1);
        }
        drawBox3D(ctx, cam, cx - 12, nukiY + 6, cz - 8, cx + 12, yTop - 11, cz + 8, [30, 26, 28], { strokeRGB: [215, 178, 76] });
    }

    // ── 1. youkai_mountain (風神録 3-4面: 妖怪の山 渓谷・紅葉・清流・九天の滝) ────

    function drawYoukaiMountain(ctx, W, H, t) {
        // 幻想郷の原風景：上部に夕陽×青天の多層連山と壮大な「九天の滝」、
        // 中〜下部に透明なエメラルド渓流・白い渓谷岩場・燃える真紅の紅葉と深山松が重なり合う極上構成
        const cam = makeCamera(W, H, {
            x: Math.sin(t * 0.30) * 24,
            y: 190 + Math.sin(t * 0.55) * 5,
            z: t * 124,
            yaw: Math.sin(t * 0.22) * 0.025,
            pitch: -0.14,
            horizonY: H * 0.27,
            fogRGB: [30, 56, 70],
            fogDist: 1320,
            maxZ: 2400
        });

        // 澄んだ青天〜茜夕焼けが溶け合う幻想郷の山空
        drawSkyGrad(ctx, W, H, [
            [0, '#0a2244'],
            [0.15, '#1e5282'],
            [0.27, '#b26e58'],
            [0.36, '#485d6c'],
            [0.58, '#163c48'],
            [1, '#081b24']
        ]);
        // 滝の上から差し込む柔らかな夕陽の逆光グロー＋斜め光芒
        drawAtmosphericGlow(ctx, W * 0.52 - cam.x * 0.1, H * 0.25, W * 0.72, [
            [0, 'rgba(255, 228, 174, 0.60)'],
            [0.35, 'rgba(255, 168, 108, 0.32)'],
            [0.7, 'rgba(130, 198, 228, 0.14)'],
            [1, 'rgba(30, 56, 70, 0)']
        ], null, { scaleX: 1.35, scaleY: 0.62 });
        drawLightShafts(ctx, W, H, {
            count: 6, x: W * 0.52, spread: W * 0.78,
            rgb: [255, 222, 160], alpha: 0.11, angle: 0.22, y0: 0, y1: H * 0.84
        }, t);

        // 遠景：3層の空気遠近山並み＋壮大な「九天の滝」
        const wfZ = cam.z + 1320;
        drawDistantMountainBand(ctx, cam, wfZ + 380, 10, 580, 3400, 12, [46, 68, 94], 17, 0.86);
        drawDistantMountainBand(ctx, cam, wfZ + 180, -10, 470, 2900, 11, [30, 56, 64], 11, 0.94);

        // 九天の滝を挟み込む険しい多段断崖絶壁と苔・紅葉
        drawBox3D(ctx, cam, -660, -20, wfZ - 35, -195, 540, wfZ + 80, [48, 42, 42], {
            material: 'stone_tiles', materialAlpha: 0.30, topRGB: [52, 74, 48], skipBack: true, skipBottom: true
        });
        drawBox3D(ctx, cam, 195, -20, wfZ - 35, 660, 540, wfZ + 80, [48, 42, 42], {
            material: 'stone_tiles', materialAlpha: 0.30, topRGB: [52, 74, 48], skipBack: true, skipBottom: true
        });
        // 滝の左右断崖を飾る豊かな紅葉と深山針葉樹
        drawStamp3D(ctx, cam, 'maple_cluster', -225, 360, wfZ - 45, 265, 210);
        drawStamp3D(ctx, cam, 'maple_cluster', 225, 380, wfZ - 45, 265, 210, { flipX: true });
        drawStamp3D(ctx, cam, 'pine_bough', -335, 445, wfZ - 30, 270, 210);
        drawStamp3D(ctx, cam, 'pine_bough', 335, 435, wfZ - 30, 270, 210, { flipX: true });

        // 轟々と落ちる壮大な「九天の滝」（青白の基層＋夕陽に染まる飛沫＋高速落下する多層白泡スジ）
        drawQuad3D(ctx, cam, [-205, -8, wfZ], [205, -8, wfZ], [186, 530, wfZ + 28], [-186, 530, wfZ + 28],
            [134, 218, 246], 1.0, 0.92, null, { material: 'water_ripples', materialAlpha: 0.40 });
        // 夕陽の照り返し帯（風神録4面の青×夕焼けオレンジのグラデーション表現）
        drawQuad3D(ctx, cam, [18, 20, wfZ - 2], [200, 20, wfZ - 2], [182, 520, wfZ + 24], [24, 520, wfZ + 24],
            [254, 172, 118], 1.0, 0.34);
        for (let s = 0; s < 14; s++) {
            const sx = -168 + s * 25.5;
            const spd = 190 + (s % 3) * 45;
            const dropOff = modPos(-t * spd + s * 61, 470);
            const yTop = clamp(dropOff + 135, 10, 490);
            const yBot = clamp(dropOff, 0, 470);
            if (yTop > yBot + 12) {
                const isWarm = s >= 9;
                drawQuad3D(ctx, cam,
                    [sx - 8, yBot, wfZ - 6], [sx + 8, yBot, wfZ - 6],
                    [sx + 6, yTop, wfZ + 14], [sx - 6, yTop, wfZ + 14],
                    isWarm ? [255, 224, 198] : [232, 250, 255], 1.08, 0.72
                );
            }
        }
        // 滝壺から立ち昇る幾重もの水煙バンク
        for (let m = -3; m <= 3; m++) {
            const mx = m * 72 + Math.sin(t * 0.9 + m) * 14;
            drawStamp3D(ctx, cam, 'cloud_bank', mx, 26 + Math.abs(m) * 14, wfZ - 65, 260, 145, {
                alpha: 0.58, rgb: m > 0 ? [242, 224, 218] : [214, 240, 255]
            });
        }

        // 渓谷底を流れる透明度の高いエメラルド青緑の清流（風神録3面リスペクト）
        drawWaterPlane(ctx, cam, 0, 1100, [14, 78, 88], [156, 236, 242], t, {
            steps: 12, reflectWidth: 155, waveSpeed: 2.9, waveAmp: 18, material: 'water_ripples', materialAlpha: 0.36
        });

        const spacing = 185;
        forWorldSlices(cam, spacing, 40, (idx, wz) => {
            const z0 = wz, z1 = wz + spacing;
            const zMid = (z0 + z1) * 0.5;
            const distCam = zMid - cam.z;
            const meander0 = Math.sin(idx * 0.45) * 48;
            const meander1 = Math.sin((idx + 1) * 0.45) * 48;
            const meanderM = (meander0 + meander1) * 0.5;

            // 蛇行する左右の河岸幅（単調な直線を排除）
            const bankL0 = -148 + meander0 - hashIdx(idx, 11) * 32;
            const bankR0 = 148 + meander0 + hashIdx(idx, 12) * 32;
            const bankL1 = -148 + meander1 - hashIdx(idx + 1, 11) * 32;
            const bankR1 = 148 + meander1 + hashIdx(idx + 1, 12) * 32;
            const bankLM = (bankL0 + bankL1) * 0.5;
            const bankRM = (bankR0 + bankR1) * 0.5;

            // 澄んだ川底の浅瀬ハイライト・苔石の透け表現
            const poolX = meanderM + (hashIdx(idx, 15) - 0.5) * 95;
            drawQuad3D(ctx, cam,
                [poolX - 58, 0.8, z0 + 18], [poolX + 58, 0.8, z0 + 18],
                [poolX + 48, 0.8, z1 - 18], [poolX - 48, 0.8, z1 - 18],
                [38, 126, 124], 1.0, 0.28
            );

            // 岩場に砕ける早瀬の白波筋＋川中の苔岩
            const foamZ = z0 + modPos(spacing - (t * 140) % spacing, spacing);
            for (let f = 0; f < 5; f++) {
                const fx0 = meanderM - 98 + f * 48 + (hashIdx(idx, 21 + f) - 0.5) * 18;
                const fx1 = fx0 + 20 + hashIdx(idx, 25 + f) * 18;
                const fz = foamZ + (hashIdx(idx, 29 + f) - 0.5) * 28;
                drawLine3D(ctx, cam, [fx0, 2.5, fz], [fx1, 2.5, fz + 10], [218, 248, 255], 1.5, 0.48);
            }
            if (modPos(idx, 2) === 0) {
                const rockX = meanderM + (hashIdx(idx, 19) - 0.5) * 130;
                drawCylinder3D(ctx, cam, rockX, -4, 18 + hashIdx(idx, 20) * 14, zMid, 16, 26, 6, [72, 76, 74], {
                    capTop: true, capRGB: [62, 92, 58]
                });
                drawRing3D(ctx, cam, rockX, 2.2, zMid, 28, 0, 0, 12, [224, 250, 255], 1.6, 0.44);
            }

            // 蛇行する1段目の明るい灰白岩岸（風神録3面の特徴的な白い渓谷岩場）
            drawQuad3D(ctx, cam,
                [-540, 44, z0], [bankL0, 12, z0], [bankL1, 12, z1], [-540, 44, z1],
                [122, 116, 108], 0.96, 1, [64, 58, 54], { material: 'stone_tiles', materialAlpha: 0.34 }
            );
            drawQuad3D(ctx, cam,
                [bankR0, 12, z0], [540, 44, z0], [540, 44, z1], [bankR1, 12, z1],
                [122, 116, 108], 0.88, 1, [64, 58, 54], { material: 'stone_tiles', materialAlpha: 0.34 }
            );
            // 岸の垂直段差（水際）
            drawQuad3D(ctx, cam, [bankL0, -4, z0], [bankL1, -4, z1], [bankL1, 12, z1], [bankL0, 12, z0], [56, 54, 52], 0.9, 1);
            drawQuad3D(ctx, cam, [bankR1, -4, z1], [bankR0, -4, z0], [bankR0, 12, z0], [bankR1, 12, z1], [56, 54, 52], 0.9, 1);

            // 2段目・3段目の渓谷岩壁（苔と岩肌が重なる重厚な谷）
            const hL1 = 108 + hashIdx(idx, 1) * 78;
            const hR1 = 108 + hashIdx(idx, 2) * 78;
            drawBox3D(ctx, cam, -520, 28, z0 + 4, bankLM - 42, hL1, z1 - 4, [62, 54, 50], {
                topRGB: [72, 84, 52], material: 'stone_tiles', materialAlpha: 0.28, skipBack: true, skipBottom: true
            });
            drawBox3D(ctx, cam, bankRM + 42, 28, z0 + 4, 520, hR1, z1 - 4, [62, 54, 50], {
                topRGB: [72, 84, 52], material: 'stone_tiles', materialAlpha: 0.28, skipBack: true, skipBottom: true
            });
            const hL2 = hL1 + 88 + hashIdx(idx, 3) * 72;
            const hR2 = hR1 + 88 + hashIdx(idx, 4) * 72;
            drawBox3D(ctx, cam, -680, hL1 - 12, z0, bankLM - 148, hL2, z1, [44, 42, 46], {
                topRGB: [52, 68, 46], skipBack: true, skipBottom: true
            });
            drawBox3D(ctx, cam, bankRM + 148, hR1 - 12, z0, 680, hR2, z1, [44, 42, 46], {
                topRGB: [52, 68, 46], skipBack: true, skipBottom: true
            });

            // 燃えるような赤・朱・金の紅葉＋深山針葉樹（渓流の上まで枝を張り出して濃密に彩る）
            const treeLx = bankLM - 36;
            const treeRx = bankRM + 36;
            // 渓流へ張り出す曲がった枝
            drawLine3D(ctx, cam, [treeLx - 30, hL1 - 8, zMid], [bankLM + 28, hL1 + 26, zMid - 14], [58, 36, 24], 5.5, 0.92);
            drawLine3D(ctx, cam, [treeRx + 30, hR1 - 8, zMid], [bankRM - 28, hR1 + 26, zMid + 14], [58, 36, 24], 5.5, 0.92);

            // 下段（水際に映える真紅のモミジ）
            drawStamp3D(ctx, cam, 'maple_cluster', bankLM + 16, 46 + hashIdx(idx, 5) * 18, z0 + 52, 155, 125, {
                alpha: 0.95, rot: (hashIdx(idx, 7) - 0.5) * 0.4
            });
            drawStamp3D(ctx, cam, 'maple_cluster', bankRM - 16, 46 + hashIdx(idx, 6) * 18, z0 + 126, 155, 125, {
                flipX: true, alpha: 0.95, rot: (hashIdx(idx, 8) - 0.5) * 0.4
            });
            // 中段（崖上の濃密な紅葉＆深緑松の混交林）
            drawStamp3D(ctx, cam, (idx % 3 === 0) ? 'pine_bough' : 'maple_cluster', treeLx - 22, hL1 + 36, zMid, 215, 170, { alpha: 0.94 });
            drawStamp3D(ctx, cam, (idx % 3 === 1) ? 'pine_bough' : 'maple_cluster', treeRx + 22, hR1 + 36, zMid, 215, 170, { flipX: true, alpha: 0.94 });
            // 上段（奥の深山樹冠）
            drawStamp3D(ctx, cam, (idx & 1) ? 'maple_cluster' : 'pine_bough', bankLM - 155, hL2 + 24, zMid + 22, 240, 185, { alpha: 0.88 });
            drawStamp3D(ctx, cam, (idx & 1) ? 'pine_bough' : 'maple_cluster', bankRM + 155, hR2 + 24, zMid - 22, 240, 185, { flipX: true, alpha: 0.88 });

            // 渓谷に棚引く柔らかな山霧（幻想郷の神秘感）
            if (modPos(idx, 3) === 1) {
                drawStamp3D(ctx, cam, 'cloud_bank', meanderM + (hashIdx(idx, 31) - 0.5) * 260, 72, zMid, 380, 115, {
                    rgb: [216, 238, 246], alpha: 0.24, fogStrength: 0.45
                });
            }

            // 5スライスごとに幻想的な結界注連縄と苔石灯籠（手前で途中消失しないようハードカット撤去）
            if (modPos(idx, 5) === 2) {
                drawBox3D(ctx, cam, bankLM - 16, 12, zMid - 10, bankLM + 4, 72, zMid + 10, [86, 86, 90]);
                drawBox3D(ctx, cam, bankRM - 4, 12, zMid - 10, bankRM + 16, 72, zMid + 10, [86, 86, 90]);
                drawStamp3D(ctx, cam, 'lantern_glow', bankLM - 6, 78, zMid, 34, 34, { rgb: [255, 202, 102], alpha: 0.88 });
                drawStamp3D(ctx, cam, 'lantern_glow', bankRM + 6, 78, zMid, 34, 34, { rgb: [255, 202, 102], alpha: 0.88 });
                drawShimenawaSpan(ctx, cam, bankLM - 14, bankRM + 14, 168, zMid, 24, [224, 198, 132], 5, 0.92);
            }
        });

        // 渓谷を舞い落ちる真紅・黄金の紅葉と滝の水飛沫
        drawWorldParticles(ctx, cam, t, { count: 56, vx: 38, vy: -52, vz: -12, sway: 28, size: 6.4, shape: 'leaf', rgb: [242, 56, 24], rgb2: [252, 186, 44], alpha: 0.92 });
        drawWorldParticles(ctx, cam, t + 1.5, { count: 24, vx: 12, vy: 20, vz: -48, sway: 14, size: 3.0, shape: 'circle', rgb: [215, 248, 255], alpha: 0.46 });
    }

    // ── 2. moriya_shrine (風神録 5-6面: 守矢神社・風神の湖・御柱と注連縄) ──

    function drawMoriyaShrine(ctx, W, H, t) {
        const cam = makeCamera(W, H, {
            x: Math.sin(t * 0.32) * 18,
            y: 138,
            z: t * 125,
            pitch: -0.045,
            horizonY: H * 0.32,
            fogRGB: [10, 40, 44],
            fogDist: 1180,
            maxZ: 2150
        });

        drawSkyGrad(ctx, W, H, [
            [0, '#04141c'],
            [0.25, '#0b3840'],
            [0.36, '#1c605a'],
            [1, '#041418']
        ]);
        drawAtmosphericGlow(ctx, W * 0.5, H * 0.31, W * 0.56, 'rgba(175, 248, 218, 0.38)', 'rgba(10, 40, 44, 0)', { scaleY: 0.52 });
        drawLightShafts(ctx, W, H, {
            count: 5, x: W * 0.5, spread: W * 0.78,
            rgb: [182, 250, 218], alpha: 0.1, angle: 0.14, y0: 0, y1: H * 0.72
        }, t);

        // 遠景：風神の湖の対岸にそびえる守矢神社本殿（シルエットがくっきり見える距離・高さへ）
        const shrineZ = cam.z + 1380;
        drawDistantMountainBand(ctx, cam, shrineZ + 180, -10, 320, 2600, 9, [16, 46, 48], 23, 0.92);
        drawBox3D(ctx, cam, -300, 0, shrineZ - 60, 300, 52, shrineZ + 80, [78, 86, 90], { material: 'stone_tiles', materialAlpha: 0.35, skipBack: true, skipBottom: true });
        drawBox3D(ctx, cam, -190, 52, shrineZ - 20, 190, 158, shrineZ + 60, [154, 46, 36], { material: 'wood_planks', materialAlpha: 0.25 });
        // 温かい本殿の灯り
        drawQuad3D(ctx, cam, [-58, 72, shrineZ - 22], [58, 72, shrineZ - 22], [58, 128, shrineZ - 22], [-58, 128, shrineZ - 22], [255, 212, 124], 1.0, 0.85, null, { material: 'shoji', materialAlpha: 0.45 });
        drawSoriRoof3D(ctx, cam, 0, 156, shrineZ + 20, 440, 150, 96, 42, [224, 190, 88], [48, 60, 68], { sori: 0.28, segs: 8 });
        // 千木（ちぎ）交差飾りと背後の御神木
        drawLine3D(ctx, cam, [-145, 238, shrineZ + 20], [-115, 286, shrineZ + 20], [228, 195, 92], 5, 0.92);
        drawLine3D(ctx, cam, [-115, 238, shrineZ + 20], [-145, 286, shrineZ + 20], [228, 195, 92], 5, 0.92);
        drawLine3D(ctx, cam, [115, 238, shrineZ + 20], [145, 286, shrineZ + 20], [228, 195, 92], 5, 0.92);
        drawLine3D(ctx, cam, [145, 238, shrineZ + 20], [115, 286, shrineZ + 20], [228, 195, 92], 5, 0.92);
        drawStamp3D(ctx, cam, 'pine_bough', -280, 130, shrineZ + 25, 230, 185, { alpha: 0.86 });
        drawStamp3D(ctx, cam, 'pine_bough', 280, 130, shrineZ + 25, 230, 185, { flipX: true, alpha: 0.86 });

        // 風神の湖（翡翠の水面）
        drawWaterPlane(ctx, cam, 0, 1450, [14, 68, 72], [162, 248, 220], t, {
            steps: 9, reflectWidth: 145, waveSpeed: 1.7, waveAmp: 20, material: 'water_ripples', materialAlpha: 0.34
        });

        const spacing = 240;
        forWorldSlices(cam, spacing, 50, (idx, wz) => {
            const z0 = wz, z1 = wz + spacing;
            const zMid = (z0 + z1) * 0.5;
            const distCam = zMid - cam.z;

            // 湖上参道橋（板張り + 朱塗り欄干）
            drawTexturedGroundStrip(ctx, cam, -112, 112, 10, z0, z1, [98, 68, 46], {
                material: 'wood_planks', materialAlpha: 0.45,
                curbRGB: [138, 44, 34], curbWidth: 12,
                centerRGB: [76, 56, 42], centerWidth: 52, centerMaterial: 'stone_tiles', centerMaterialAlpha: 0.25
            });
            drawCylinder3D(ctx, cam, -95, -14, 10, z0 + 30, 10, 12, 6, [62, 42, 30]);
            drawCylinder3D(ctx, cam, 95, -14, 10, z0 + 30, 10, 12, 6, [62, 42, 30]);
            drawBox3D(ctx, cam, -112, 28, z0, -104, 35, z1, [152, 48, 36], { skipBack: true, skipBottom: true });
            drawBox3D(ctx, cam, 104, 28, z0, 112, 35, z1, [152, 48, 36], { skipBack: true, skipBottom: true });

            // 左右の巨大な御柱（明るいリムライト入りの樅の巨木＋三重巻き太注連縄）
            const px = 195;
            for (let side = -1; side <= 1; side += 2) {
                const cx = side * px;
                drawCylinder3D(ctx, cam, cx, -8, 18, z0 + 28, 36, 42, 8, [74, 80, 84]);
                drawCylinder3D(ctx, cam, cx, 16, 345, z0 + 28, 23, 30, 8, [142, 102, 62], { material: 'wood_planks', materialAlpha: 0.34, capTop: true, capRGB: [176, 134, 86] });
                // 巻き付けられた極太の注連縄リング（3段）
                drawRing3D(ctx, cam, cx, 238, z0 + 28, 27, 0, 0, 16, [235, 218, 152], 7.5, 0.98);
                drawRing3D(ctx, cam, cx, 229, z0 + 28, 28, 0, 0, 16, [198, 174, 104], 6.0, 0.94);
                drawRing3D(ctx, cam, cx, 220, z0 + 28, 27, 0, 0, 16, [235, 218, 152], 6.5, 0.95);
                // 参道脇の石灯籠
                drawBox3D(ctx, cam, side * 124 - 9, 10, zMid - 9, side * 124 + 9, 44, zMid + 9, [82, 86, 90]);
                drawStamp3D(ctx, cam, 'lantern_glow', side * 124, 52, zMid, 42, 42, { rgb: [255, 224, 132], alpha: 0.88 });
            }

            // 御柱間の太い編み注連縄（途中消失しないようハードカット撤去）
            drawShimenawaSpan(ctx, cam, -px + 24, px - 24, 230, z0 + 28, 32, [232, 214, 148], 5, 1.15);

            // 鳥居と両脇の御神木（途中消失しないようハードカット撤去）
            if (modPos(idx, 3) === 0) {
                drawTorii3D(ctx, cam, 0, 10, zMid, 128, 205, [182, 48, 36], [28, 28, 36]);
                drawStamp3D(ctx, cam, 'pine_bough', -320, 75, zMid, 210, 160, { alpha: 0.82 });
                drawStamp3D(ctx, cam, 'pine_bough', 320, 75, zMid, 210, 160, { flipX: true, alpha: 0.82 });
            }
        });

        drawWorldParticles(ctx, cam, t, { count: 36, vx: 22, vy: 26, vz: 0, sway: 22, size: 5, shape: 'diamond', glow: true, rgb: [145, 255, 220], rgb2: [248, 238, 145], alpha: 0.82 });
    }

    // ── 3. old_hell (地霊殿 3面: 蒼い格子窓の旧都通り急俯瞰) ─────────

    function drawOldHell(ctx, W, H, t) {
        // 原作地霊殿3面リスペクト：深く暗い地下の石畳通りを急角度で見下ろし、
        // 左右に高くそびえ立つ鮮烈なコバルトブルーの格子窓の町家と、点々と灯る赤い提灯・白い雪/灰を描く
        const cam = makeCamera(W, H, {
            x: Math.sin(t * 0.28) * 14,
            y: 265,
            z: t * 130,
            pitch: -0.34,
            horizonY: H * 0.14,
            fogRGB: [8, 10, 28],
            fogDist: 1080,
            maxZ: 2100
        });

        drawSkyGrad(ctx, W, H, [
            [0, '#03040e'],
            [0.18, '#0b1030'],
            [0.40, '#080b20'],
            [1, '#04040c']
        ]);
        drawAtmosphericGlow(ctx, W * 0.5, H * 0.16, W * 0.55, [
            [0, 'rgba(58, 92, 225, 0.32)'],
            [0.5, 'rgba(26, 36, 118, 0.14)'],
            [1, 'rgba(8, 10, 28, 0)']
        ], null, { scaleX: 1.2, scaleY: 0.65 });

        // 暗い地下旧都の石畳床
        fillGroundBase(ctx, cam, 0, 1250, [14, 14, 24], 7, {
            farRGB: [8, 10, 28],
            material: 'stone_tiles',
            materialAlpha: 0.28
        });

        const spacing = 195;
        forWorldSlices(cam, spacing, 40, (idx, wz) => {
            const z0 = wz, z1 = wz + spacing;
            const zMid = (z0 + z1) * 0.5;

            // 中央の暗い石畳・階段状大通り（青暗い地下の反射）
            drawTexturedGroundStrip(ctx, cam, -128, 128, 1, z0, z1, [28, 26, 42], {
                material: 'stone_tiles', materialAlpha: 0.44,
                curbRGB: [52, 62, 102], curbWidth: 10,
                centerRGB: [38, 34, 54], centerWidth: 56, centerMaterial: 'cobblestone', centerMaterialAlpha: 0.30
            });
            // 横断する石段ステップ線（地霊殿3面通りのリズム感）
            for (let st = 0; st < 3; st++) {
                const sz = lerp(z0, z1, (st + 0.5) / 3);
                drawLine3D(ctx, cam, [-118, 1.8, sz], [118, 1.8, sz], [72, 84, 138], 1.4, 0.32);
            }

            // 左右に高くそびえる「鮮烈な青い格子窓」の旧都町家壁面
            const hL = 265 + (idx % 2) * 32;
            const hR = 265 + ((idx + 1) % 2) * 32;
            const xInL = -134, xOutL = -370;
            const xInR = 134, xOutR = 370;

            drawBox3D(ctx, cam, xOutL, 0, z0 + 6, xInL, hL, z1 - 6, [18, 24, 58], {
                material: 'wood_planks', materialAlpha: 0.32, topRGB: [22, 26, 48], strokeRGB: [10, 12, 26], skipBack: true, skipBottom: true
            });
            drawBox3D(ctx, cam, xInR, 0, z0 + 6, xOutR, hR, z1 - 6, [18, 24, 58], {
                material: 'wood_planks', materialAlpha: 0.32, topRGB: [22, 26, 48], strokeRGB: [10, 12, 26], skipBack: true, skipBottom: true
            });

            // 全面に広がる鮮やかなコバルトブルーの格子スクリーン（原作3面の象徴的テクスチャ）
            drawQuad3D(ctx, cam,
                [xInL + 1.5, 16, z0 + 12], [xInL + 1.5, 16, z1 - 12],
                [xInL + 1.5, 205, z1 - 12], [xInL + 1.5, 205, z0 + 12],
                [34, 68, 198], 1.0, 0.88, [12, 16, 44], { material: 'shoji', materialAlpha: 0.58 }
            );
            drawQuad3D(ctx, cam,
                [xInR - 1.5, 16, z1 - 12], [xInR - 1.5, 16, z0 + 12],
                [xInR - 1.5, 205, z0 + 12], [xInR - 1.5, 205, z1 - 12],
                [34, 68, 198], 1.0, 0.88, [12, 16, 44], { material: 'shoji', materialAlpha: 0.58 }
            );
            // 細かい格子桟ラインで青格子を強調
            for (let g = 1; g <= 4; g++) {
                const gy = 16 + g * 38;
                drawLine3D(ctx, cam, [xInL + 2.5, gy, z0 + 12], [xInL + 2.5, gy, z1 - 12], [10, 14, 34], 1.6, 0.82);
                drawLine3D(ctx, cam, [xInR - 2.5, gy, z0 + 12], [xInR - 2.5, gy, z1 - 12], [10, 14, 34], 1.6, 0.82);
            }

            // 上階の暖色に灯る障子窓（青格子との強烈な色彩対比！）
            if (modPos(idx, 2) === 0) {
                drawQuad3D(ctx, cam,
                    [xInL + 2, 214, z0 + 36], [xInL + 2, 214, z1 - 36],
                    [xInL + 2, 256, z1 - 36], [xInL + 2, 256, z0 + 36],
                    [252, 196, 98], 1.06, 0.92, [42, 24, 16], { material: 'shoji', materialAlpha: 0.5 }
                );
                drawQuad3D(ctx, cam,
                    [xInR - 2, 214, z1 - 36], [xInR - 2, 214, z0 + 36],
                    [xInR - 2, 256, z0 + 36], [xInR - 2, 256, z1 - 36],
                    [252, 196, 98], 1.06, 0.92, [42, 24, 16], { material: 'shoji', materialAlpha: 0.5 }
                );
            }

            // 軒先に点々と燃えるような赤橙の街灯・提灯
            if (modPos(idx, 2) === 1) {
                drawStamp3D(ctx, cam, 'lantern_glow', xInL + 16, 132, zMid, 44, 44, { rgb: [255, 92, 34], alpha: 0.95 });
                drawStamp3D(ctx, cam, 'lantern_glow', xInR - 16, 132, zMid, 44, 44, { rgb: [255, 92, 34], alpha: 0.95 });
                // 路面にうっすら落ちる赤い提灯照り返し
                drawQuad3D(ctx, cam, [-124, 1.5, z0 + 40], [-70, 1.5, z0 + 40], [-70, 1.5, z1 - 40], [-124, 1.5, z1 - 40], [235, 76, 36], 1, 0.14);
                drawQuad3D(ctx, cam, [70, 1.5, z0 + 40], [124, 1.5, z0 + 40], [124, 1.5, z1 - 40], [70, 1.5, z1 - 40], [235, 76, 36], 1, 0.14);
            }
        });

        // 地下の雪・灰と青い怨霊パーティクル
        drawWorldParticles(ctx, cam, t, { count: 42, vx: 8, vy: -32, vz: 0, sway: 22, size: 3.4, shape: 'diamond', glow: true, rgb: [195, 224, 255], rgb2: [120, 175, 255], alpha: 0.72 });
        drawWorldParticles(ctx, cam, t + 1.4, { count: 16, vx: -6, vy: 28, vz: 0, sway: 16, size: 5.0, shape: 'circle', glow: true, rgb: [82, 218, 255], alpha: 0.75 });
    }

    // ── 4. mantle (地霊殿 6面: 灼熱地獄跡・核融合炉の人工太陽と回転プラズマリング) ──

    function drawMantle(ctx, W, H, t) {
        // 原作地霊殿6面準拠：前後移動（トンネル飛翔）せず、暗紅の深淵中央に鎮座する
        // 巨大な核融合人工太陽と、その周囲を取り巻く多重の円形制御リング・魔方陣がその場で重厚に回転する
        drawSkyGrad(ctx, W, H, [
            [0, '#050102'],
            [0.26, '#140204'],
            [0.48, '#220406'],
            [0.74, '#130204'],
            [1, '#040102']
        ]);

        const cx = W * 0.5;
        const cy = H * 0.46;
        const baseR = Math.min(W, H) * 0.245;
        const pulse = 1 + 0.025 * Math.sin(t * 2.4);

        // 外周の広大な深紅〜青紫の磁場コロナハロー（原作6面の赤×青紫の多重オーラ）
        drawAtmosphericGlow(ctx, cx, cy, baseR * 3.3 * pulse, [
            [0, 'rgba(255, 224, 118, 0.78)'],
            [0.26, 'rgba(255, 86, 20, 0.52)'],
            [0.50, 'rgba(195, 26, 46, 0.28)'],
            [0.72, 'rgba(84, 42, 168, 0.18)'],
            [1, 'rgba(12, 2, 4, 0)']
        ]);

        ctx.save();
        ctx.translate(cx, cy);

        // 第1層：放射状にゆっくり回転する核融合コロナ光条（2層逆回転）
        const rays = 24;
        for (let i = 0; i < rays; i++) {
            const ang = (i / rays) * Math.PI * 2 + t * 0.08;
            const len = baseR * (2.35 + 0.42 * Math.sin(i * 2.3 + t * 1.1));
            const spread = 0.04;
            const g = ctx.createLinearGradient(0, 0, Math.cos(ang) * len, Math.sin(ang) * len);
            if (g && typeof g.addColorStop === 'function') {
                g.addColorStop(0, 'rgba(255, 165, 58, 0.22)');
                g.addColorStop(0.55, (i % 3 === 0) ? 'rgba(138, 72, 232, 0.12)' : 'rgba(225, 42, 18, 0.14)');
                g.addColorStop(1, 'rgba(0, 0, 0, 0)');
            }
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(ang - spread) * len, Math.sin(ang - spread) * len);
            ctx.lineTo(Math.cos(ang + spread) * len, Math.sin(ang + spread) * len);
            ctx.closePath();
            ctx.fill();
        }

        // 第2層：その場で重厚に正逆回転する多重の同心円制御リング＆目盛り（原作6面リスペクト）
        const ringSpecs = [
            { r: baseR * 1.14, col: 'rgba(154, 142, 255, 0.55)', lw: 3.0, segs: 32, spd: -0.18, duty: 0.72 },
            { r: baseR * 1.32, col: 'rgba(255, 128, 48, 0.52)', lw: 5.0, segs: 16, spd: 0.14, duty: 0.58 },
            { r: baseR * 1.54, col: 'rgba(224, 48, 56, 0.44)', lw: 2.8, segs: 36, spd: -0.11, duty: 0.65 },
            { r: baseR * 1.78, col: 'rgba(118, 66, 212, 0.36)', lw: 4.0, segs: 12, spd: 0.08, duty: 0.52 },
            { r: baseR * 2.08, col: 'rgba(235, 76, 32, 0.28)', lw: 2.4, segs: 24, spd: -0.06, duty: 0.48 },
            { r: baseR * 2.45, col: 'rgba(148, 62, 198, 0.20)', lw: 2.2, segs: 18, spd: 0.045, duty: 0.55 }
        ];
        for (let k = 0; k < ringSpecs.length; k++) {
            const rs = ringSpecs[k];
            ctx.strokeStyle = rs.col;
            ctx.lineWidth = rs.lw;
            const step = (Math.PI * 2) / rs.segs;
            for (let s = 0; s < rs.segs; s++) {
                const a0 = s * step + t * rs.spd;
                const a1 = a0 + step * rs.duty;
                ctx.beginPath();
                ctx.arc(0, 0, rs.r * pulse, a0, a1);
                ctx.stroke();
            }
        }

        // 外周リング上の回転放射線インジケータ・幾何学ノード
        for (let m = 0; m < 6; m++) {
            const a = (m / 6) * Math.PI * 2 - t * 0.12;
            const rIn = baseR * 1.36 * pulse;
            const rOut = baseR * 1.72 * pulse;
            ctx.strokeStyle = 'rgba(255, 152, 68, 0.34)';
            ctx.lineWidth = 2.0;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * rIn, Math.sin(a) * rIn);
            ctx.lineTo(Math.cos(a) * rOut, Math.sin(a) * rOut);
            ctx.stroke();
        }

        // 第3層：巨大な燃え盛る人工太陽本体（その場でゆっくり自転・対流する溶融プラズマ球）
        const sunR = baseR * pulse;
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, sunR, 0, Math.PI * 2);
        if (typeof ctx.clip === 'function') ctx.clip();

        const coreGrad = ctx.createRadialGradient(-sunR * 0.08, -sunR * 0.08, sunR * 0.05, 0, 0, sunR);
        if (coreGrad && typeof coreGrad.addColorStop === 'function') {
            coreGrad.addColorStop(0, '#fff2b2');
            coreGrad.addColorStop(0.24, '#ff9c24');
            coreGrad.addColorStop(0.58, '#e22a08');
            coreGrad.addColorStop(0.86, '#920a04');
            coreGrad.addColorStop(1, '#440304');
        }
        ctx.fillStyle = coreGrad;
        ctx.fillRect(-sunR - 2, -sunR - 2, sunR * 2 + 4, sunR * 2 + 4);

        // 太陽表面のうねる灼熱プラズマ斑（ゆっくり回転するのみ）
        for (let b = 0; b < 24; b++) {
            const a = hashIdx(b, 41) * Math.PI * 2 + t * (0.12 + (b % 3) * 0.04) * ((b & 1) ? 1 : -1);
            const dist = Math.sqrt(hashIdx(b, 42)) * sunR * 0.80;
            const bx = Math.cos(a) * dist;
            const by = Math.sin(a) * dist;
            const br = sunR * (0.11 + hashIdx(b, 43) * 0.16);
            const isBright = (b % 3) !== 0;
            const pg = ctx.createRadialGradient(bx, by, 1, bx, by, br);
            if (pg && typeof pg.addColorStop === 'function') {
                pg.addColorStop(0, isBright ? 'rgba(255, 208, 86, 0.56)' : 'rgba(84, 6, 4, 0.62)');
                pg.addColorStop(1, 'rgba(0, 0, 0, 0)');
            }
            ctx.fillStyle = pg;
            ctx.beginPath();
            ctx.arc(bx, by, br, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        // 太陽外周の灼熱リム＋青白いプラズマ放電輪
        ctx.strokeStyle = 'rgba(255, 178, 72, 0.82)';
        ctx.lineWidth = 3.2;
        ctx.beginPath();
        ctx.arc(0, 0, sunR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(155, 145, 255, 0.52)';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.arc(0, 0, sunR * 1.07, 0, Math.PI * 2);
        ctx.stroke();

        // 周囲をゆっくり旋回する灼熱火の粉（前後移動せず太陽の周りを旋回＆微浮遊）
        for (let i = 0; i < 36; i++) {
            const ang = hashIdx(i, 71) * Math.PI * 2 + t * (0.10 + hashIdx(i, 72) * 0.18) * ((i & 1) ? 1 : -1);
            const rad = baseR * (1.12 + hashIdx(i, 73) * 1.65) + Math.sin(t * 1.3 + i) * 14;
            const px = Math.cos(ang) * rad;
            const py = Math.sin(ang) * rad;
            const pr = 1.6 + hashIdx(i, 74) * 2.4;
            const alpha = 0.35 + 0.45 * Math.sin(t * 2.2 + i * 1.7) * 0.5 + 0.25;
            ctx.fillStyle = (i % 3 === 0) ? `rgba(182, 152, 255, ${alpha.toFixed(2)})` : `rgba(255, 192, 86, ${alpha.toFixed(2)})`;
            ctx.beginPath();
            ctx.arc(px, py, pr, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    // ── 5. haru_no_minato (星蓮船 1面: 春の湊に・残雪と雲海の空中俯瞰) ──

    function drawHaruNoMinato(ctx, W, H, t) {
        // 原作星蓮船1面リスペクト：川や一本道をやめ、白い残雪と淡紫〜水色の春雲の上空から
        // 雪解けで芽吹く緑の山肌・森を真下寄りの急俯瞰で見下ろす爽やかな飛翔構図
        const cam = makeCamera(W, H, {
            x: Math.sin(t * 0.32) * 38,
            y: 325,
            z: t * 168,
            pitch: -0.46,
            roll: Math.sin(t * 0.32) * 0.03,
            horizonY: H * 0.06,
            fogRGB: [128, 146, 184],
            fogDist: 1320,
            maxZ: 2350
        });

        // 春の淡い水色〜薄紫の柔らかな空と霞（白飛びを抑えて弾が見やすい彩度・明度）
        drawSkyGrad(ctx, W, H, [
            [0, '#4a6898'],
            [0.16, '#768db8'],
            [0.45, '#8a99be'],
            [0.80, '#6a7ca6'],
            [1, '#4c5f8a']
        ]);

        // 下界の残雪の大地ベース（淡雪灰青）
        fillGroundBase(ctx, cam, -10, 2400, [132, 142, 168], 8, {
            farRGB: [148, 158, 186]
        });

        const spacing = 225;
        forWorldSlices(cam, spacing, 45, (idx, wz) => {
            const z0 = wz, z1 = wz + spacing;
            const zMid = (z0 + z1) * 0.5;
            const meander0 = Math.sin(idx * 0.52) * 95;
            const meander1 = Math.sin((idx + 1) * 0.52) * 95;
            const meanderM = (meander0 + meander1) * 0.5;

            // 雪解けの切れ目から覗く柔らかな若草・深緑の森と山肌（四角エッジを樹冠と雲で完全に溶かす）
            const w0 = 96 + hashIdx(idx, 1) * 58;
            const w1 = 96 + hashIdx(idx + 1, 1) * 58;
            drawQuad3D(ctx, cam,
                [meander0 - w0, 0, z0], [meander0 + w0, 0, z0],
                [meander1 + w1, 0, z1], [meander1 - w1, 0, z1],
                [92, 126, 70], 0.96, 0.78
            );
            // 境界を有機的にぼかす若草・深緑の多層森林樹冠クラスター
            for (let k = 0; k < 4; k++) {
                const tx = meanderM + (hashIdx(idx * 7 + k, 7) - 0.5) * 230;
                const tz = z0 + 25 + hashIdx(idx * 7 + k, 8) * 180;
                const isSakura = (k === 0 && modPos(idx, 4) === 0);
                drawStamp3D(ctx, cam, isSakura ? 'sakura_cluster' : 'pine_bough', tx, 14, tz, 175 + hashIdx(idx, k + 19) * 65, 145, {
                    rgb: isSakura ? [242, 192, 220] : ((k & 1) ? [82, 124, 66] : [118, 152, 78]),
                    alpha: 0.78
                });
            }

            // 左右と山肌の縁をふわっと覆う白い残雪＆薄紫の春雲バンク（山肌の四角い輪郭を完全に隠す）
            const drift = Math.sin(t * 0.42 + idx * 0.9) * 32;
            for (let side = -1; side <= 1; side += 2) {
                const cx0 = meanderM + side * (128 + hashIdx(idx, side + 9) * 55) + drift * 0.4;
                drawStamp3D(ctx, cam, 'cloud_bank', cx0, 18, zMid, 380, 175, {
                    rgb: [222, 224, 246], alpha: 0.68, fogStrength: 0.30
                });
                const cx1 = meanderM + side * (225 + hashIdx(idx, side + 12) * 95) + drift * 0.5;
                drawStamp3D(ctx, cam, 'cloud_bank', cx1, 32, z0 + 65, 500, 200, {
                    rgb: [212, 214, 240], alpha: 0.66, fogStrength: 0.32
                });
                const cx2 = meanderM + side * (330 + hashIdx(idx, side + 16) * 110) - drift * 0.4;
                drawStamp3D(ctx, cam, 'cloud_bank', cx2, 58, z0 + 165, 540, 210, {
                    rgb: [192, 196, 232], alpha: 0.58, fogStrength: 0.36
                });
            }
            // 中央の空をかすめる薄い春霞（緑の大地を優しく包み込む）
            drawStamp3D(ctx, cam, 'cloud_bank', meanderM + drift, 86, zMid, 460, 150, {
                rgb: [220, 224, 246], alpha: 0.28, fogStrength: 0.38
            });
        });

        // 雲の上をゆっくり横切る「聖輦船（謎の宝船）」の巨大な影（星蓮船1面の象徴演出）
        const shadowPhase = modPos(t * 0.09, 1);
        const sx = lerp(-W * 0.25, W * 1.25, shadowPhase);
        const sy = H * (0.28 + Math.sin(shadowPhase * Math.PI) * 0.08);
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(-0.18);
        ctx.fillStyle = 'rgba(26, 36, 68, 0.22)';
        ctx.beginPath();
        ctx.moveTo(-110, 18);
        ctx.quadraticCurveTo(0, 42, 125, 10);
        ctx.lineTo(95, -18);
        ctx.lineTo(18, -56);
        ctx.lineTo(-42, -48);
        ctx.lineTo(-92, -16);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // 空を舞う白い花びらと名残雪のパーティクル
        drawWorldParticles(ctx, cam, t, {
            count: 48, vx: 22, vy: -30, vz: -24, sway: 24,
            size: 5.0, shape: 'petal', rgb: [248, 246, 255], rgb2: [255, 212, 232], alpha: 0.86
        });
    }

    // ── 6. sky_ruin (星蓮船 3面: 桃紫の雲海と斜めに駆ける巨大浮遊外壁・スカイルーイン) ──

    function drawSkyRuin(ctx, W, H, t) {
        // 原作星蓮船3面リスペクト：ギリシャ風アーチを撤去し、
        // 桃色〜薄紫〜淡青の雲海の中を、斜めに傾いた巨大な石造船体（聖輦船の外壁・甲板縁）が
        // 猛スピードで横切って飛翔するダイナミックな斜め俯瞰
        const cam = makeCamera(W, H, {
            x: 115 + Math.sin(t * 0.35) * 16,
            y: 268,
            z: t * 245,
            yaw: -0.06,
            pitch: -0.34,
            roll: -0.26 + Math.sin(t * 0.28) * 0.025,
            horizonY: H * 0.12,
            fogRGB: [128, 98, 152],
            fogDist: 1320,
            maxZ: 2350
        });

        // 桃紫〜ラベンダー〜淡青の幻想的な天空グラデーション
        drawSkyGrad(ctx, W, H, [
            [0, '#44386e'],
            [0.18, '#7a5c96'],
            [0.44, '#9a72a8'],
            [0.74, '#7d629c'],
            [1, '#4c3e72']
        ]);

        // 雲海の奥から差す桃色〜青白の高速光条
        drawAtmosphericGlow(ctx, W * 0.72, H * 0.24, W * 0.62, [
            [0, 'rgba(248, 206, 240, 0.42)'],
            [0.5, 'rgba(172, 136, 214, 0.20)'],
            [1, 'rgba(128, 98, 152, 0)']
        ], null, { scaleX: 1.2, scaleY: 0.85 });
        drawLightShafts(ctx, W, H, {
            count: 5, x: W * 0.75, spread: W * 0.65,
            rgb: [242, 205, 245], alpha: 0.09, angle: -0.26, y0: 0, y1: H * 0.9
        }, t);

        // 右〜下方に広がる広大な桃紫の雲海ベース
        fillGroundBase(ctx, cam, -90, 2300, [118, 92, 148], 7, {
            farRGB: [158, 126, 178]
        });

        const spacing = 220;
        forWorldSlices(cam, spacing, 40, (idx, wz) => {
            const z0 = wz, z1 = wz + spacing;
            const zMid = (z0 + z1) * 0.5;
            const h0 = hashIdx(idx, 1);
            const h1 = hashIdx(idx, 2);

            // 右側の広大な雲海（桃色・薄紫・銀青が幾重にも高速スクロール）
            drawStamp3D(ctx, cam, 'cloud_bank', 280 + h0 * 210, -24 + h1 * 28, zMid, 560, 215, {
                rgb: [222, 180, 224], alpha: 0.62, fogStrength: 0.30
            });
            drawStamp3D(ctx, cam, 'cloud_bank', 460 + h1 * 180, 12 + h0 * 24, z0 + 60, 580, 220, {
                rgb: [188, 176, 226], alpha: 0.54, fogStrength: 0.34
            });
            drawStamp3D(ctx, cam, 'cloud_bank', 180 + (h0 - 0.5) * 140, -58, z1 - 40, 480, 180, {
                rgb: [236, 198, 234], alpha: 0.48, fogStrength: 0.32
            });

            // ★原作星蓮船3面の象徴：左〜中央を斜めに貫く巨大な石造浮遊船体（聖輦船の巨大甲板縁）
            const deckLeft = -460;
            const deckRight = 72;
            const deckY = 18;
            // 重厚な石ブロック甲板面（灰紫〜薄紅の石タイル）
            drawTexturedGroundStrip(ctx, cam, deckLeft, deckRight, deckY, z0, z1, [124, 102, 134], {
                material: 'stone_tiles', materialAlpha: 0.52,
                curbRGB: [84, 152, 156], curbWidth: 16,
                centerRGB: [108, 88, 122], centerWidth: 110, centerMaterial: 'stone_tiles', centerMaterialAlpha: 0.38
            });
            // 甲板上の石目ライン（高速移動のスピード感を強調）
            drawLine3D(ctx, cam, [deckLeft + 40, deckY + 1, z0], [deckRight - 14, deckY + 1, z0], [72, 56, 86], 2.0, 0.55);
            drawLine3D(ctx, cam, [deckRight - 14, deckY + 1.5, z0], [deckRight - 14, deckY + 1.5, z1], [136, 212, 206], 2.4, 0.72);

            // 船体右縁の翡翠（青緑）の立体縁石＋分厚い垂直外壁（雲海へ落ち込む重厚感）
            drawBox3D(ctx, cam, deckRight - 18, deckY - 68, z0, deckRight + 10, deckY + 4, z1, [74, 138, 144], {
                topRGB: [106, 174, 176], strokeRGB: [44, 84, 92],
                material: 'stone_tiles', materialAlpha: 0.32, skipBack: true, skipBottom: true
            });
            // 外壁に並ぶ古代彫刻パネル・法輪の浮彫り
            if (modPos(idx, 2) === 0) {
                drawBox3D(ctx, cam, -260, deckY, zMid - 42, -160, deckY + 10, zMid + 42, [144, 118, 152], {
                    topRGB: [162, 136, 168], strokeRGB: [92, 72, 104], material: 'stone_tiles', materialAlpha: 0.36
                });
                drawStamp3D(ctx, cam, 'magic_seal', -210, deckY + 14, zMid, 82, 82, {
                    rgb: [152, 224, 218], alpha: 0.34, rot: t * 0.4 + idx
                });
            }
            // 甲板をかすめる高速雲霧の切れ端
            if (modPos(idx, 3) === 0) {
                drawStamp3D(ctx, cam, 'cloud_bank', 20 + h1 * 120, 42, zMid, 320, 95, {
                    rgb: [238, 208, 240], alpha: 0.30, fogStrength: 0.35
                });
            }
        });

        // 高速飛翔に伴う気流スパーク＆光の粒子
        drawWorldParticles(ctx, cam, t, { count: 40, vx: -18, vy: -8, vz: -180, sway: 10, size: 4.5, shape: 'diamond', glow: true, rgb: [248, 224, 255], rgb2: [148, 232, 236], alpha: 0.78 });
    }

    // ── 7. palanquin_ship (星蓮船 4面: 幽霊客船 船内・斜め畳と妖しく光る障子) ──

    function drawPalanquinShip(ctx, W, H, t) {
        // 原作星蓮船4面リスペクト：屋外甲板を完全廃止し、
        // 大きく斜めに傾いた暗い紫がかった畳敷きの船室と、右側から暖かな黄金〜朱色に光る障子窓、
        // 床を揺らめく丸い提灯スポットライトを描く妖艶な和風客船内部
        const cam = makeCamera(W, H, {
            x: -24 + Math.sin(t * 0.42) * 14,
            y: 235 + Math.sin(t * 0.9) * 5,
            z: t * 155,
            yaw: 0.08,
            pitch: -0.36,
            roll: 0.22 + Math.sin(t * 0.36) * 0.024,
            horizonY: H * 0.14,
            fogRGB: [22, 12, 24],
            fogDist: 1020,
            maxZ: 2050
        });

        // 暗い船内空間ベース
        drawSkyGrad(ctx, W, H, [
            [0, '#07040a'],
            [0.24, '#180c1c'],
            [0.52, '#221226'],
            [1, '#0c0610']
        ]);

        // 船内奥の仄暗い畳ベース（薄紫がかった暗い畳色）
        fillGroundBase(ctx, cam, 0, 1400, [34, 28, 44], 7, {
            farRGB: [18, 10, 22],
            material: 'tatami',
            materialAlpha: 0.36
        });

        const spacing = 205;
        forWorldSlices(cam, spacing, 35, (idx, wz) => {
            const z0 = wz, z1 = wz + spacing;
            const zMid = (z0 + z1) * 0.5;

            // 左〜中央に広がる斜め畳敷きの船室フロア（紫暗い畳＋濃紺の畳縁）
            drawTexturedGroundStrip(ctx, cam, -340, 148, 0.5, z0, z1, [54, 48, 66], {
                material: 'tatami', materialAlpha: 0.52,
                curbRGB: [28, 22, 36], curbWidth: 14,
                centerRGB: [62, 56, 74], centerWidth: 120, centerMaterial: 'tatami', centerMaterialAlpha: 0.48
            });
            // 畳の区切り線（格子状の和室畳敷き感）
            drawLine3D(ctx, cam, [-340, 1.5, z0], [148, 1.5, z0], [22, 18, 30], 3.2, 0.82);
            drawLine3D(ctx, cam, [-140, 1.5, z0], [-140, 1.5, z1], [22, 18, 30], 2.8, 0.78);
            drawLine3D(ctx, cam, [10, 1.5, z0], [10, 1.5, z1], [22, 18, 30], 2.8, 0.78);

            // 畳の上に障子から漏れ落ちる温かな光溜まり
            const glowShift = Math.sin(t * 1.4 + idx * 0.9) * 14;
            drawQuad3D(ctx, cam,
                [-18 + glowShift, 1.8, z0 + 28], [136, 1.8, z0 + 28],
                [136, 1.8, z1 - 28], [-18 + glowShift, 1.8, z1 - 28],
                [242, 178, 92], 1.0, 0.16
            );

            // 左奥の暗い木柱と襖壁（閉鎖的な船内感）
            drawBox3D(ctx, cam, -390, 0, z0, -340, 265, z1, [34, 22, 32], {
                material: 'wood_planks', materialAlpha: 0.34, strokeRGB: [18, 10, 16], skipBack: true, skipBottom: true
            });

            // ★原作星蓮船4面の象徴：右側に連なる朱漆枠＋黄金に光る障子格子壁
            const wallX = 148;
            drawBox3D(ctx, cam, wallX, 0, z0, 340, 275, z1, [118, 22, 16], {
                material: 'wood_planks', materialAlpha: 0.36, topRGB: [88, 18, 14], strokeRGB: [48, 10, 8], skipBack: true, skipBottom: true
            });
            // 朱塗りの太い縦柱・鴨居・敷居
            drawBox3D(ctx, cam, wallX - 8, 0, z0, wallX + 6, 275, z0 + 18, [142, 28, 18], { strokeRGB: [44, 10, 8] });
            drawBox3D(ctx, cam, wallX - 8, 224, z0, wallX + 6, 244, z1, [132, 24, 16], { strokeRGB: [44, 10, 8] });
            drawBox3D(ctx, cam, wallX - 8, 0, z0, wallX + 6, 28, z1, [98, 22, 16]);

            // 黄金〜琥珀色に妖しく発光する障子パネル（細かい格子入り）
            const flicker = 0.92 + 0.08 * Math.sin(t * 2.6 + idx * 1.9);
            drawQuad3D(ctx, cam,
                [wallX - 1.5, 28, z0 + 20], [wallX - 1.5, 28, z1 - 20],
                [wallX - 1.5, 224, z1 - 20], [wallX - 1.5, 224, z0 + 20],
                [clamp(Math.floor(245 * flicker), 0, 255), clamp(Math.floor(194 * flicker), 0, 255), 76],
                1.05, 0.94, [68, 22, 12], { material: 'shoji', materialAlpha: 0.62 }
            );

            // 天井の暗い木梁（時おり上部を横切る）
            if (modPos(idx, 2) === 0) {
                drawBox3D(ctx, cam, -340, 255, zMid - 10, 152, 278, zMid + 10, [48, 22, 20], { strokeRGB: [22, 10, 10] });
            }
        });

        // ★原作4面の象徴演出：暗い畳の床をゆっくり揺れ動く丸い提灯スポットライト（柔らかな円形光＋周囲ビネット）
        const spotX = W * (0.40 + Math.sin(t * 0.72) * 0.09);
        const spotY = H * (0.56 + Math.cos(t * 0.58) * 0.07);
        drawAtmosphericGlow(ctx, spotX, spotY, W * 0.34, [
            [0, 'rgba(255, 224, 164, 0.30)'],
            [0.48, 'rgba(225, 168, 96, 0.14)'],
            [0.82, 'rgba(120, 62, 42, 0.04)'],
            [1, 'rgba(22, 12, 24, 0)']
        ]);
        // 右側障子からの柔らかな暖色バウンス光
        drawAtmosphericGlow(ctx, W * 0.88, H * 0.45, W * 0.42, [
            [0, 'rgba(255, 168, 62, 0.24)'],
            [0.55, 'rgba(188, 52, 24, 0.10)'],
            [1, 'rgba(22, 12, 24, 0)']
        ]);

        // 船内に漂う妖しい鬼火・金塵パーティクル
        drawWorldParticles(ctx, cam, t, { count: 28, vx: -8, vy: 18, vz: -24, sway: 16, size: 4.2, shape: 'circle', glow: true, rgb: [255, 212, 128], rgb2: [165, 188, 255], alpha: 0.72 });
    }

    // ── レジストリ登録 ──────────────────────────────────────────────

    Core.registerRenderer('youkai_mountain', drawYoukaiMountain);
    Core.registerRenderer('moriya_shrine', drawMoriyaShrine);
    Core.registerRenderer('old_hell', drawOldHell);
    Core.registerRenderer('mantle', drawMantle);
    Core.registerRenderer('haru_no_minato', drawHaruNoMinato);
    Core.registerRenderer('sky_ruin', drawSkyRuin);
    Core.registerRenderer('palanquin_ship', drawPalanquinShip);
})(typeof window !== 'undefined' ? window : globalThis);
