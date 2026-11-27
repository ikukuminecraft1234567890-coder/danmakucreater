/**
 * 2D疑似3D背景パックA (TH06 紅魔郷 〜 TH08 永夜抄) — Round 2 High-Craft Edition
 * 担当プリセット (7種):
 * - misty_lake (紅魔郷2面 霧の湖)
 * - scarlet_mansion (紅魔郷3-6面 紅魔館大廊下/時計塔)
 * - hakurei_shrine (博麗神社参道・鳥居)
 * - netherworld_gate (妖々夢4面 雲上〜冥界の門)
 * - hakugyokurou (妖々夢5-6面 白玉楼階段と西行妖)
 * - bamboo_forest (永夜抄4面 迷いの竹林)
 * - fake_moon (永夜抄5-6面 永遠亭廊下と偽りの満月)
 */
(function (global) {
    'use strict';

    const C = global.BG3DCore || (typeof require === 'function' ? require('./core.js') : null);
    if (!C) return;

    function safeGradStop(g, offset, col) {
        if (g && typeof g.addColorStop === 'function') {
            g.addColorStop(C.clamp(offset, 0, 1), col);
        }
    }

    // ── 1. misty_lake (紅魔郷2面 霧の湖) ────────────────────────────
    function drawMistyLake(ctx, W, H, t) {
        const cam = C.makeCamera(W, H, {
            x: Math.sin(t * 0.24) * 28,
            y: 124 + Math.sin(t * 0.42) * 4,
            z: t * 112,
            yaw: Math.sin(t * 0.18) * 0.022,
            pitch: -0.055,
            horizonY: H * 0.34,
            fogRGB: [16, 40, 66],
            fogDist: 1020,
            maxZ: 2100
        });

        C.drawSkyGrad(ctx, W, H, [
            [0, '#040c1a'],
            [0.22, '#0c213b'],
            [0.34, '#1b4264'],
            [0.45, '#102942'],
            [1, '#051220']
        ]);
        C.drawStars(ctx, W, H * 0.31, t, 48, '#daf4ff', 1.15);

        // 紅霧を帯びた夜空の満月と柔らかな月暈
        const moonX = W * 0.5 - cam.x * 0.11;
        const moonY = H * 0.155;
        C.drawAtmosphericGlow(ctx, moonX, moonY, 155, [
            [0, 'rgba(240, 252, 255, 0.88)'],
            [0.2, 'rgba(175, 225, 255, 0.44)'],
            [0.52, 'rgba(95, 165, 215, 0.14)'],
            [0.82, 'rgba(120, 55, 85, 0.05)'],
            [1, 'rgba(16, 40, 66, 0)']
        ]);
        ctx.fillStyle = 'rgba(242, 251, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(moonX, moonY, 23, 0, Math.PI * 2);
        ctx.fill();

        // 柔らかな水平月霧グロー（硬い矩形光条ではなく大気光で包む）
        C.drawAtmosphericGlow(ctx, moonX, H * 0.345, W * 0.62, [
            [0, 'rgba(150, 215, 250, 0.22)'],
            [0.5, 'rgba(85, 150, 200, 0.09)'],
            [1, 'rgba(16, 40, 66, 0)']
        ], null, { scaleX: 1.5, scaleY: 0.34 });

        // 遠景の森林山並み＋湖畔の紅魔館シルエット（双塔・切妻屋根・時計窓）
        const hy = H * 0.345;
        ctx.fillStyle = '#081728';
        ctx.beginPath();
        ctx.moveTo(0, hy + 10);
        for (let x = 0; x <= W; x += 16) {
            const ridge = Math.sin(x * 0.016 + 0.6) * 10 + Math.cos(x * 0.042) * 5 + C.hash01(x * 0.5) * 4;
            ctx.lineTo(x, hy - 8 - ridge);
        }
        ctx.lineTo(W, hy + 10);
        ctx.closePath();
        ctx.fill();

        // 紅魔館シルエット（左寄りの遠景島/湖畔に聳える洋館）
        const silX = W * 0.62 - cam.x * 0.07;
        ctx.fillStyle = '#141026';
        ctx.fillRect(silX - 54, hy - 26, 108, 28);
        ctx.fillRect(silX - 46, hy - 44, 20, 22);
        ctx.fillRect(silX + 26, hy - 44, 20, 22);
        ctx.fillRect(silX - 13, hy - 66, 26, 44);
        ctx.beginPath();
        ctx.moveTo(silX - 50, hy - 44); ctx.lineTo(silX - 36, hy - 60); ctx.lineTo(silX - 22, hy - 44);
        ctx.moveTo(silX + 22, hy - 44); ctx.lineTo(silX + 36, hy - 60); ctx.lineTo(silX + 50, hy - 44);
        ctx.moveTo(silX - 17, hy - 66); ctx.lineTo(silX, hy - 94); ctx.lineTo(silX + 17, hy - 66);
        ctx.closePath();
        ctx.fill();
        // 紅魔館の紅い窓灯りと時計窓
        ctx.fillStyle = 'rgba(240, 88, 118, 0.72)';
        ctx.beginPath();
        ctx.arc(silX, hy - 50, 4.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 175, 120, 0.55)';
        ctx.fillRect(silX - 39, hy - 34, 4, 6);
        ctx.fillRect(silX + 35, hy - 34, 4, 6);
        ctx.fillRect(silX - 24, hy - 18, 4, 6);
        ctx.fillRect(silX + 20, hy - 18, 4, 6);

        // 水面ベース（継ぎ目のない滑らかな湖面＋シームレスな月光シマー線）
        C.drawWaterPlane(ctx, cam, 0, 1850, [13, 41, 68], [155, 226, 255], t, {
            steps: 14,
            shimmerCount: 28,
            reflectX: -cam.x * 0.09,
            reflectWidth: 105,
            waveSpeed: 1.75,
            waveAmp: 16,
            materialAlpha: 0.22,
            materialScale: 1.35
        });

        // 湖面へ落ちる柔らかな月光反射の縦帯（シルク状の光柱）
        C.drawAtmosphericGlow(ctx, moonX, H * 0.56, W * 0.26, [
            [0, 'rgba(155, 220, 252, 0.16)'],
            [0.45, 'rgba(95, 170, 220, 0.07)'],
            [1, 'rgba(16, 40, 66, 0)']
        ], null, { scaleX: 0.52, scaleY: 1.75 });

        // 湖上の小島・針葉樹・漂う濃厚な霧の帯（遠→近）
        const spacing = 225;
        C.forWorldSlices(cam, spacing, 60, (idx, wz) => {
            const z0 = wz;
            const h0 = C.hashIdx(idx, 1);
            const h1 = C.hashIdx(idx, 2);

            if (idx % 2 === 0 || h0 > 0.45) {
                const side = (idx & 1) ? 1 : -1;
                const ix = side * (225 + h0 * 205);
                const iz = z0 + 65 + h1 * 80;
                const rBase = 64 + h1 * 42;

                // 岩礁と苔むした小島
                C.drawCylinder3D(ctx, cam, ix, -6, 15, iz, rBase * 0.76, rBase, 6, [32, 46, 58], {
                    capTop: true,
                    capRGB: [28, 64, 54]
                });
                C.drawRing3D(ctx, cam, ix, 1.5, iz, rBase + 12, 0, 0, 12, [150, 220, 248], 1.3, 0.22);

                const treeCount = 1 + (h0 > 0.58 ? 1 : 0);
                for (let k = 0; k < treeCount; k++) {
                    const tx = ix + (k === 0 ? -10 : 18) * side;
                    const tz = iz + (k === 0 ? -6 : 12);
                    const th = 74 + C.hashIdx(idx * 5 + k, 4) * 50;
                    C.drawCylinder3D(ctx, cam, tx, 14, 14 + th, tz, 4.5, 8.5, 5, [42, 34, 34]);
                    C.drawStamp3D(ctx, cam, 'pine_bough', tx, 14 + th * 0.85, tz, 122, 98, {
                        anchorY: 0.65,
                        rgb: [22, 66, 54],
                        alpha: 0.92
                    });
                    C.drawStamp3D(ctx, cam, 'pine_bough', tx + 4 * side, 14 + th * 1.06, tz - 4, 88, 74, {
                        anchorY: 0.65,
                        flipX: side < 0,
                        rgb: [30, 84, 68],
                        alpha: 0.88
                    });
                }

                if (C.modPos(idx, 3) === 0) {
                    const lx = ix - side * (rBase * 0.45);
                    C.drawCylinder3D(ctx, cam, lx, 14, 42, iz - 10, 3, 4, 5, [64, 74, 90]);
                    C.drawStamp3D(ctx, cam, 'lantern_glow', lx, 48, iz - 10, 40, 40, {
                        rgb: [155, 235, 255],
                        alpha: 0.88
                    });
                }
            }

            // 濃厚な湖霧バンク（2層重ねて霧の湖らしさを強調）
            const fogX1 = (h1 - 0.5) * 620 + Math.sin(t * 0.45 + idx * 1.3) * 55;
            C.drawStamp3D(ctx, cam, 'cloud_bank', fogX1, 16 + h0 * 22, z0 + 95, 420, 110, {
                rgb: [185, 228, 250],
                alpha: 0.30,
                fogStrength: 0.42
            });
            if (idx % 2 === 1) {
                const fogX2 = -fogX1 * 0.65 + Math.cos(t * 0.35 + idx) * 40;
                C.drawStamp3D(ctx, cam, 'cloud_bank', fogX2, 28 + h1 * 18, z0 + 165, 380, 96, {
                    rgb: [165, 214, 242],
                    alpha: 0.22,
                    fogStrength: 0.48
                });
            }
        });

        C.drawWorldParticles(ctx, cam, t, {
            count: 46,
            vx: 14,
            vy: -28,
            vz: 12,
            sway: 12,
            size: 2.5,
            shape: 'diamond',
            rgb: [215, 248, 255],
            rgb2: [145, 222, 255],
            alpha: 0.72,
            glow: true
        });
    }

    // ── 2. scarlet_mansion (紅魔郷3-6面 紅魔館大廊下/時計塔) ─────────
    function drawScarletMansion(ctx, W, H, t) {
        const cam = C.makeCamera(W, H, {
            x: Math.sin(t * 0.36) * 16,
            y: 138,
            z: t * 145,
            pitch: -0.015,
            horizonY: H * 0.37,
            fogRGB: [22, 5, 11],
            fogDist: 980,
            maxZ: 2050
        });

        C.drawSkyGrad(ctx, W, H, [
            [0, '#0d0206'],
            [0.32, '#240610'],
            [0.42, '#340917'],
            [1, '#090205']
        ]);

        // 奥の時計塔大文字盤（ダークフェイスの本格文字盤＋金の指針＋ローマ数字目盛＋歯車シルエット）
        const dialX = W * 0.5 - cam.x * 0.14;
        const dialY = H * 0.255;
        const dialR = Math.min(W, H) * 0.135;
        C.drawAtmosphericGlow(ctx, dialX, dialY, dialR * 2.0, [
            [0, 'rgba(255, 95, 120, 0.38)'],
            [0.45, 'rgba(180, 25, 55, 0.2)'],
            [1, 'rgba(22, 5, 11, 0)']
        ]);
        ctx.save();
        ctx.translate(dialX, dialY);
        // 背面歯車シルエット
        ctx.fillStyle = 'rgba(72, 24, 34, 0.75)';
        for (let g = 0; g < 16; g++) {
            const ga = t * 0.18 + (g / 16) * Math.PI * 2;
            ctx.save();
            ctx.rotate(ga);
            ctx.fillRect(-5, -dialR * 1.13, 10, 14);
            ctx.restore();
        }
        // 暗い文字盤ベース＋外周金縁
        ctx.fillStyle = 'rgba(28, 8, 16, 0.92)';
        ctx.beginPath();
        ctx.arc(0, 0, dialR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(225, 178, 84, 0.85)';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.strokeStyle = 'rgba(180, 125, 55, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, dialR * 0.78, 0, Math.PI * 2);
        ctx.stroke();
        // 12時間の金色目盛
        for (let k = 0; k < 12; k++) {
            const a = (k / 12) * Math.PI * 2;
            ctx.strokeStyle = (k % 3 === 0) ? 'rgba(255, 220, 125, 0.92)' : 'rgba(225, 175, 88, 0.62)';
            ctx.lineWidth = (k % 3 === 0) ? 2.6 : 1.4;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * dialR * 0.78, Math.sin(a) * dialR * 0.78);
            ctx.lineTo(Math.cos(a) * dialR * 0.94, Math.sin(a) * dialR * 0.94);
            ctx.stroke();
        }
        // 中央の装飾と槍型の時計針
        const minAng = t * 0.65 - Math.PI * 0.5;
        const hrAng = t * 0.08 - Math.PI * 0.5;
        const drawHand = (ang, len, wid, col) => {
            ctx.save();
            ctx.rotate(ang);
            ctx.fillStyle = col;
            ctx.beginPath();
            ctx.moveTo(-len * 0.14, -wid * 0.5);
            ctx.lineTo(len, 0);
            ctx.lineTo(-len * 0.14, wid * 0.5);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        };
        drawHand(hrAng, dialR * 0.52, 6, 'rgba(245, 200, 105, 0.92)');
        drawHand(minAng, dialR * 0.76, 4, 'rgba(255, 228, 155, 0.95)');
        ctx.fillStyle = '#f2c86b';
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 天井と大理石床ベース
        C.fillGroundBase(ctx, cam, 0, 480, [36, 14, 22], 6);
        C.fillGroundBase(ctx, cam, 370, 480, [24, 7, 13], 5);

        // ステンドグラスの柔らかな斜光
        C.drawLightShafts(ctx, W, H, [
            { x: W * 0.14, y0: H * 0.14, y1: H * 0.85, topW: 24, botW: 130, angle: 0.28, rgb: [245, 70, 105], alpha: 0.09, speed: 0.6, phase: 0 },
            { x: W * 0.86, y0: H * 0.14, y1: H * 0.85, topW: 24, botW: 130, angle: -0.28, rgb: [245, 70, 105], alpha: 0.09, speed: 0.6, phase: 2.1 }
        ], t);

        const spacing = 255;
        C.forWorldSlices(cam, spacing, 60, (idx, wz) => {
            const z0 = wz;
            const z1 = wz + spacing;
            const vzApprox = z0 - cam.z;
            const useTex = vzApprox < 1350;

            // 大理石回廊床＋真紅の絨毯＋控えめな金縁
            C.drawTexturedGroundStrip(ctx, cam, -315, 315, 0, z0, z1, [46, 22, 32], {
                material: useTex ? 'marble_veins' : null,
                materialAlpha: 0.30,
                centerRGB: [148, 16, 40],
                centerWidth: 196,
                centerMaterial: useTex ? 'red_carpet' : null,
                centerMaterialAlpha: 0.52,
                curbRGB: [152, 114, 48],
                curbWidth: 5
            });
            C.drawLine3D(ctx, cam, [-100, 1.5, z0], [-100, 1.5, z1], [235, 190, 88], 2.2, 0.82);
            C.drawLine3D(ctx, cam, [100, 1.5, z0], [100, 1.5, z1], [235, 190, 88], 2.2, 0.82);

            // 左右のゴシック石壁
            const wallMat = useTex ? { material: 'stone_tiles', materialAlpha: 0.24 } : undefined;
            C.drawQuad3D(ctx, cam, [-315, 0, z0], [-315, 0, z1], [-315, 370, z1], [-315, 370, z0], [44, 14, 24], 0.9, 1, null, wallMat);
            C.drawQuad3D(ctx, cam, [315, 0, z1], [315, 0, z0], [315, 370, z0], [315, 370, z1], [44, 14, 24], 0.9, 1, null, wallMat);

            // ステンドグラス窓と床への紅い光溜まり
            const winZ = (z0 + z1) * 0.5;
            C.drawStamp3D(ctx, cam, 'stained_glass', -310, 195, winZ, 95, 165, { alpha: 0.85, fogStrength: 0.5 });
            C.drawStamp3D(ctx, cam, 'stained_glass', 310, 195, winZ, 95, 165, { alpha: 0.85, fogStrength: 0.5 });
            C.drawQuad3D(ctx, cam, [-290, 1.8, z0 + 48], [-135, 1.8, z0 + 48], [-135, 1.8, z1 - 48], [-290, 1.8, z1 - 48], [220, 52, 92], 1, 0.14);
            C.drawQuad3D(ctx, cam, [135, 1.8, z0 + 48], [290, 1.8, z0 + 48], [290, 1.8, z1 - 48], [135, 1.8, z1 - 48], [220, 52, 92], 1, 0.14);

            // 尖頭ゴシックアーチ（高速化のためseg=6, マテリアル省略で重厚な陰影）
            C.drawArch3D(ctx, cam, 0, 225, 255, 368, z0 + 18, 252, 24, 30, [68, 26, 40], {
                style: 'pointed',
                segs: 6,
                piers: false,
                keystoneRGB: [195, 148, 66]
            });

            // 左右の円柱ピラスターと暖かな燭台ウォールライト
            for (let side = -1; side <= 1; side += 2) {
                const px = side * 268;
                C.drawBox3D(ctx, cam, px - 22, 0, z0, px + 22, 34, z0 + 36, [54, 20, 32]);
                C.drawCylinder3D(ctx, cam, px, 34, 255, z0 + 18, 17, 20, 6, [74, 28, 44], useTex ? { material: 'marble_veins', materialAlpha: 0.22 } : undefined);
                // 壁面の暖色燭台バウンス光
                const sconceP = C.projectWorld(cam, px - side * 24, 172, z0 + 18);
                if (sconceP && sconceP[3] > 30 && sconceP[3] < 1300) {
                    const rad = C.clamp(56 * sconceP[2], 8, 95);
                    C.drawAtmosphericGlow(ctx, sconceP[0], sconceP[1], rad, 'rgba(255, 175, 95, 0.24)', 'rgba(255, 120, 60, 0)');
                }
                C.drawStamp3D(ctx, cam, 'lantern_glow', px - side * 24, 172, z0 + 18, 42, 42, {
                    rgb: [255, 175, 95],
                    alpha: 0.88
                });
            }

            // 奇数スライスの天井に重厚なゴシック真鍮シャンデリア（裸の線輪ではなく鎖＋燭台輪）
            if (idx & 1) {
                const cz = z0 + 18;
                C.drawLine3D(ctx, cam, [0, 370, cz], [0, 316, cz], [175, 132, 60], 3.0, 0.85);
                C.drawCylinder3D(ctx, cam, 0, 304, 316, cz, 38, 42, 8, [120, 84, 38], { strokeRGB: [215, 170, 82] });
                C.drawStamp3D(ctx, cam, 'lantern_glow', -38, 308, cz, 26, 26, { rgb: [255, 205, 120], alpha: 0.85 });
                C.drawStamp3D(ctx, cam, 'lantern_glow', 38, 308, cz, 26, 26, { rgb: [255, 205, 120], alpha: 0.85 });
            }
        });

        C.drawWorldParticles(ctx, cam, t, {
            count: 30,
            vx: 8,
            vy: 14,
            vz: 0,
            sway: 14,
            size: 3.6,
            shape: 'spark',
            rgb: [255, 125, 150],
            rgb2: [245, 200, 110],
            alpha: 0.68,
            glow: true
        });
    }

    // ── 3. hakurei_shrine (博麗神社・春の桜参道俯瞰 / 天空璋3面風) ──────
    function drawHakureiShrine(ctx, W, H, t) {
        // 原作天空璋3面リスペクト：左右を覆い尽くす濃密な桜の樹冠の間から参道を見下ろす急俯瞰カメラ
        const cam = C.makeCamera(W, H, {
            x: Math.sin(t * 0.30) * 18,
            y: 255,
            z: t * 138,
            yaw: Math.sin(t * 0.22) * 0.025,
            pitch: -0.34,
            horizonY: H * 0.14,
            fogRGB: [44, 18, 42],
            fogDist: 1180,
            maxZ: 2250
        });

        // 春霞の夜桜〜薄紅紫の空と柔らかな桃色ミスト
        C.drawSkyGrad(ctx, W, H, [
            [0, '#16071c'],
            [0.14, '#3a1438'],
            [0.28, '#280e28'],
            [0.65, '#19081b'],
            [1, '#0e0410']
        ]);
        C.drawAtmosphericGlow(ctx, W * 0.5, H * 0.16, W * 0.72, [
            [0, 'rgba(255, 165, 215, 0.42)'],
            [0.42, 'rgba(185, 78, 150, 0.20)'],
            [1, 'rgba(44, 18, 42, 0)']
        ], null, { scaleX: 1.35, scaleY: 0.65 });

        // 参道中央の淡い霞と苔むした境内林床（急俯瞰で画面下部まで広がる）
        C.fillGroundBase(ctx, cam, 0, 2200, [34, 18, 32], 10, {
            farRGB: [52, 22, 48],
            material: 'cobblestone',
            materialAlpha: 0.16
        });

        const spacing = 210;
        C.forWorldSlices(cam, spacing, 40, (idx, wz) => {
            const z0 = wz;
            const z1 = wz + spacing;
            const zMid = (z0 + z1) * 0.5;
            const vzApprox = z0 - cam.z;
            const useTex = vzApprox < 1400;

            // 中央の参道石畳（桜の合間から覗く落ち着いた暗紫〜石色）
            C.drawTexturedGroundStrip(ctx, cam, -108, 108, 0.6, z0, z1, [68, 44, 62], {
                material: useTex ? 'stone_tiles' : null,
                materialAlpha: 0.34,
                curbRGB: [98, 62, 84],
                curbWidth: 10,
                centerRGB: [96, 60, 86],
                centerWidth: 46,
                centerMaterial: useTex ? 'stone_tiles' : null,
                centerMaterialAlpha: 0.25
            });

            // 参道に淡く落ちる桜霞の光帯
            C.drawQuad3D(ctx, cam, [-58, 1.2, z0], [58, 1.2, z0], [58, 1.2, z1], [-58, 1.2, z1], [235, 132, 188], 1.0, 0.11);

            // 間隔をあけて荘厳に1基ずつ現れる博麗神社の朱塗り鳥居（手前で途中消失しないようハードカット撤去）
            if (C.modPos(idx, 5) === 2) {
                const span = 128;
                const toriiZ = zMid;
                const toriiH = 172;
                for (let side = -1; side <= 1; side += 2) {
                    const px = side * span;
                    C.drawCylinder3D(ctx, cam, px, 0, 22, toriiZ, 12, 15, 6, [34, 24, 34]);
                    C.drawCylinder3D(ctx, cam, px, 20, toriiH, toriiZ, 9.5, 12, 6, [196, 38, 36]);
                }
                C.drawBox3D(ctx, cam, -span - 28, toriiH * 0.74, toriiZ - 5, span + 28, toriiH * 0.80, toriiZ + 5, [186, 34, 34]);
                C.drawBox3D(ctx, cam, -10, toriiH * 0.80, toriiZ - 6, 10, toriiH, toriiZ + 6, [36, 22, 32], { strokeRGB: [228, 186, 86] });
                C.drawBox3D(ctx, cam, -span - 38, toriiH - 2, toriiZ - 8, span + 38, toriiH + 9, toriiZ + 8, [208, 46, 40]);
                C.drawSoriRoof3D(ctx, cam, 0, toriiH + 8, toriiZ, (span + 44) * 2, 20, 12, 4, [26, 18, 28], [40, 26, 38], {
                    segs: 5,
                    zSegs: 1,
                    sori: -0.3,
                    material: null
                });
                C.drawCatenary3D(ctx, cam, [-span + 12, toriiH * 0.74, toriiZ], [span - 12, toriiH * 0.74, toriiZ], 16, 7, [220, 198, 138], 3.0, 0.88);
            }

            // 参道脇の控えめな石灯籠
            if (C.modPos(idx, 3) === 0) {
                for (let side = -1; side <= 1; side += 2) {
                    const lx = side * 120;
                    C.drawBox3D(ctx, cam, lx - 10, 0, zMid - 10, lx + 10, 48, zMid + 10, [78, 62, 78]);
                    C.drawStamp3D(ctx, cam, 'lantern_glow', lx, 56, zMid, 34, 34, {
                        rgb: [255, 205, 135],
                        alpha: 0.82
                    });
                }
            }

            // 画面左右全体（上から下まで）を濃密に覆い尽くす重層的な桜の樹冠（中央に細い参道スリットを残す）
            for (let side = -1; side <= 1; side += 2) {
                const hA = C.hashIdx(idx, side * 13 + 3);
                const hB = C.hashIdx(idx, side * 17 + 7);
                const hC = C.hashIdx(idx, side * 23 + 11);

                // 外縁から画面端を埋め尽くす深い紅紫の桜層（低めの高さで画面下部までみっちり映る）
                C.drawStamp3D(ctx, cam, 'sakura_cluster', side * (250 + hA * 85), 26 + hB * 28, z0 + 45, 340, 285, {
                    flipX: side < 0,
                    rgb: [188, 66, 138],
                    alpha: 0.94
                });
                C.drawStamp3D(ctx, cam, 'sakura_cluster', side * (320 + hC * 75), 54 + hA * 32, z1 - 30, 360, 290, {
                    flipX: side > 0,
                    rgb: [212, 92, 164],
                    alpha: 0.92
                });
                // 中間の華やかなピンク桜層
                C.drawStamp3D(ctx, cam, 'sakura_cluster', side * (168 + hB * 62), 42 + hC * 26, z0 + 115, 290, 240, {
                    flipX: (idx & 1) === 0,
                    rgb: [238, 128, 192],
                    alpha: 0.95
                });
                // 参道際へ張り出す明るい淡桃の桜花房
                C.drawStamp3D(ctx, cam, 'sakura_cluster', side * (108 + hC * 42), 62 + hA * 22, z0 + 75, 225, 185, {
                    flipX: side > 0,
                    rgb: [255, 182, 224],
                    alpha: 0.93
                });
                C.drawStamp3D(ctx, cam, 'sakura_cluster', side * (128 + hA * 48), 32 + hB * 20, z1 - 25, 235, 190, {
                    flipX: side < 0,
                    rgb: [248, 152, 208],
                    alpha: 0.90
                });
            }
        });

        // 参道中央から立ち昇る柔らかな桜色の花霞
        C.drawAtmosphericGlow(ctx, W * 0.5, H * 0.52, W * 0.42, [
            [0, 'rgba(235, 132, 192, 0.16)'],
            [0.55, 'rgba(165, 72, 132, 0.06)'],
            [1, 'rgba(44, 18, 42, 0)']
        ], null, { scaleX: 0.65, scaleY: 1.8 });

        // 画面全体を舞う濃密な春桜の花吹雪
        C.drawWorldParticles(ctx, cam, t, {
            count: 64,
            vx: 28,
            vy: -38,
            vz: -18,
            sway: 24,
            size: 5.6,
            shape: 'petal',
            rgb: [255, 182, 224],
            rgb2: [255, 228, 245],
            alpha: 0.90
        });
    }

    // ── 4. netherworld_gate (妖々夢4面 雲海見下ろし〜冥界の四本木柱と結界) ──
    function drawNetherworldGate(ctx, W, H, t) {
        // 原作妖々夢4面リスペクト：白〜藤紫の厚い雲海を急角度で見下ろし、
        // 雲海を突き抜けて立つ4本組の太い木柱と奥の結界門を通り抜ける幻想構図
        const cam = C.makeCamera(W, H, {
            x: Math.sin(t * 0.28) * 24,
            y: 305,
            z: t * 145,
            yaw: Math.sin(t * 0.19) * 0.025,
            pitch: -0.44,
            horizonY: H * 0.08,
            fogRGB: [82, 70, 128],
            fogDist: 1220,
            maxZ: 2250
        });

        // 明るく幻想的な白紫〜藤青の雲上空ベース（弾幕視認性を保ちつつ妖々夢4面の白紫雲海を再現）
        C.drawSkyGrad(ctx, W, H, [
            [0, '#2a2252'],
            [0.14, '#4d417f'],
            [0.36, '#625696'],
            [0.68, '#463b78'],
            [1, '#2d2556']
        ]);

        // 画面上部に淡く広がる幽世の白紫グロー
        C.drawAtmosphericGlow(ctx, W * 0.5, H * 0.18, W * 0.78, [
            [0, 'rgba(218, 206, 250, 0.36)'],
            [0.52, 'rgba(148, 134, 212, 0.18)'],
            [1, 'rgba(82, 70, 128, 0)']
        ], null, { scaleX: 1.35, scaleY: 0.78 });

        // 遠景奥にぼんやりと浮かぶ冥界の境界結界紋（雲霧の向こうに透ける白玉楼への門印）
        const sealZ = cam.z + 1180;
        C.drawStamp3D(ctx, cam, 'magic_seal', 0, 75, sealZ, 420, 420, {
            rgb: [236, 208, 255],
            alpha: 0.24,
            rot: t * 0.14,
            fogStrength: 0.35
        });
        C.drawRing3D(ctx, cam, 0, 75, sealZ - 20, 210, Math.PI * 0.48, t * 0.12, 28, [232, 185, 245], 2.2, 0.24);

        // 下層の深い雲海ベース（藤紫〜銀青）
        C.fillGroundBase(ctx, cam, -25, 2200, [86, 76, 136], 8, {
            farRGB: [122, 110, 174]
        });

        const spacing = 340;
        C.forWorldSlices(cam, spacing, 55, (idx, wz) => {
            const z0 = wz;
            const zMid = wz + spacing * 0.5;
            const h0 = C.hashIdx(idx, 1);
            const h1 = C.hashIdx(idx, 2);
            const drift = Math.sin(t * 0.45 + idx * 1.1) * 32;

            // 第1層：下層を広く覆う厚い藤色〜銀白のもくもく雲海バンク（コントラスト豊かに重ねる）
            for (let c = -2; c <= 2; c++) {
                const cx = c * 190 + drift * (c & 1 ? 0.7 : -0.5) + (C.hashIdx(idx * 7 + c + 10, 3) - 0.5) * 80;
                const cy = 2 + (C.hashIdx(idx * 7 + c + 10, 4) - 0.5) * 26;
                const cz = z0 + 50 + C.hashIdx(idx * 7 + c + 10, 5) * 240;
                const isBright = ((idx + c) & 1) === 0;
                C.drawStamp3D(ctx, cam, 'cloud_bank', cx, cy, cz, 560, 255, {
                    rgb: isBright ? [228, 220, 250] : [136, 124, 198],
                    alpha: isBright ? 0.72 : 0.62,
                    fogStrength: 0.28
                });
            }
            // 中層の白銀ハイライト雲（雲海のうねりと立体感を強調）
            C.drawStamp3D(ctx, cam, 'cloud_bank', -185 + drift * 0.6, 22, zMid - 45, 420, 175, {
                rgb: [236, 230, 255], alpha: 0.56, fogStrength: 0.28
            });
            C.drawStamp3D(ctx, cam, 'cloud_bank', 185 - drift * 0.6, 22, zMid + 45, 420, 175, {
                rgb: [236, 230, 255], alpha: 0.56, fogStrength: 0.28
            });

            // 雲海の中に淡く透ける紅白の境界結界紋（2スライスおき）
            if (C.modPos(idx, 2) === 0) {
                C.drawRing3D(ctx, cam, 0, 22, zMid, 165, 0, t * 0.25 + idx, 24, [235, 165, 220], 2.2, 0.32);
                C.drawStamp3D(ctx, cam, 'magic_seal', 0, 24, zMid, 240, 240, {
                    rgb: [242, 200, 248],
                    alpha: 0.22,
                    rot: -t * 0.18 + idx
                });
            }

            // ★原作妖々夢4面の象徴：雲海から垂直に突き抜ける4本組（2x2配置）の太い木造角柱
            const pillarHalfX = 112;
            const pillarDz = 76;
            const pW = 24;
            const pTopY = 175;
            const pBotY = -40;
            const woodBody = [104, 54, 34];
            const woodTop = [152, 96, 58];
            const woodStroke = [56, 26, 16];

            // 奥の2本→手前の2本の順に描画して正確な前後関係を保つ
            const rowsZ = [zMid + pillarDz, zMid - pillarDz];
            for (let ri = 0; ri < rowsZ.length; ri++) {
                const pz = rowsZ[ri];
                for (let side = -1; side <= 1; side += 2) {
                    const px = side * pillarHalfX;
                    // 柱の根元を包む雲の巻き上がり
                    C.drawStamp3D(ctx, cam, 'cloud_bank', px, 14, pz + 8, 180, 76, {
                        rgb: [212, 206, 242],
                        alpha: 0.48,
                        fogStrength: 0.3
                    });
                    // 太い木目角柱本体（上端の切り口面が急俯瞰でくっきり見える）
                    C.drawBox3D(ctx, cam, px - pW, pBotY, pz - pW, px + pW, pTopY, pz + pW, woodBody, {
                        topRGB: woodTop,
                        strokeRGB: woodStroke,
                        material: 'wood_planks',
                        materialAlpha: 0.46,
                        skipBottom: true
                    });
                    // 柱上端の年輪・木枠エッジ装飾
                    C.drawQuad3D(ctx, cam,
                        [px - pW + 5, pTopY + 0.6, pz - pW + 5],
                        [px + pW - 5, pTopY + 0.6, pz - pW + 5],
                        [px + pW - 5, pTopY + 0.6, pz + pW - 5],
                        [px - pW + 5, pTopY + 0.6, pz + pW - 5],
                        [122, 72, 42], 1.0, 0.85, [76, 40, 24], { lineWidth: 1.2 }
                    );
                }
            }

            // 3スライスに1回、左右の雲の縁に朱色の結界鳥居片・桜枝が霞んで覗く
            if (C.modPos(idx, 3) === 1) {
                const sSide = (idx & 1) ? 1 : -1;
                C.drawStamp3D(ctx, cam, 'sakura_cluster', sSide * (285 + h0 * 65), 110 + h1 * 30, zMid, 190, 150, {
                    flipX: sSide < 0,
                    rgb: [248, 178, 218],
                    alpha: 0.56
                });
            }

            // 上層の薄いベール雲（柱の中腹をかすめて浮遊感を強調）
            const veilX = (h1 - 0.5) * 460 - drift * 0.9;
            C.drawStamp3D(ctx, cam, 'cloud_bank', veilX, 52 + h0 * 24, z0 + 235, 520, 145, {
                rgb: [215, 208, 246],
                alpha: 0.34,
                fogStrength: 0.38
            });
        });

        // 雲上を舞う桜花びらと淡い冥界の霊光
        C.drawWorldParticles(ctx, cam, t, {
            count: 46,
            vx: 16,
            vy: -24,
            vz: -14,
            sway: 24,
            size: 5.0,
            shape: 'petal',
            rgb: [255, 204, 236],
            rgb2: [222, 205, 255],
            alpha: 0.82
        });
        C.drawWorldParticles(ctx, cam, t + 1.4, {
            count: 20,
            vx: -10,
            vy: 18,
            vz: 0,
            sway: 18,
            size: 4.2,
            shape: 'circle',
            glow: true,
            rgb: [210, 238, 255],
            alpha: 0.62
        });
    }

    // ── 5. hakugyokurou (妖々夢5-6面 白玉楼階段と西行妖) ───────────
    function drawHakugyokurou(ctx, W, H, t) {
        const spacing = 86;
        const stepRise = 26;
        const camZ = t * 148;
        const slopeY = (camZ / spacing) * stepRise;
        const cam = C.makeCamera(W, H, {
            x: Math.sin(t * 0.34) * 14,
            y: slopeY + 138,
            z: camZ,
            pitch: 0.062,
            horizonY: H * 0.42,
            fogRGB: [30, 16, 44],
            fogDist: 1040,
            maxZ: 1860
        });

        C.drawSkyGrad(ctx, W, H, [
            [0, '#0f081e'],
            [0.32, '#28153b'],
            [0.44, '#3d1d4d'],
            [1, '#120a1f']
        ]);
        C.drawStars(ctx, W, H * 0.38, t, 36, '#ffe4f0', 1.0);

        // 山頂の西行妖（節くれだった巨幹＋垂れ下がる多層の満開・半開花桜雲＋白玉楼の楼閣）
        const treeX = W * 0.5 - cam.x * 0.07;
        const treeY = H * 0.255;
        C.drawAtmosphericGlow(ctx, treeX, treeY - 20, 205, [
            [0, 'rgba(255, 165, 215, 0.34)'],
            [0.45, 'rgba(185, 85, 175, 0.16)'],
            [1, 'rgba(30, 16, 44, 0)']
        ]);

        // 白玉楼本館の反り屋根シルエット（左右に灯る暖かな障子窓）
        ctx.fillStyle = '#1b0f2c';
        ctx.beginPath();
        ctx.moveTo(treeX - 195, H * 0.365);
        ctx.quadraticCurveTo(treeX - 142, H * 0.32, treeX - 96, H * 0.295);
        ctx.lineTo(treeX - 48, H * 0.365);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(treeX + 48, H * 0.365);
        ctx.lineTo(treeX + 96, H * 0.295);
        ctx.quadraticCurveTo(treeX + 142, H * 0.32, treeX + 195, H * 0.365);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 195, 180, 0.45)';
        ctx.fillRect(treeX - 135, H * 0.342, 16, 9);
        ctx.fillRect(treeX + 119, H * 0.342, 16, 9);

        // 西行妖の巨木（ねじれた樹皮・立体陰影付き大枝・反魂封印輪・多層桜房）
        ctx.save();
        ctx.translate(treeX, treeY + 95);
        ctx.strokeStyle = 'rgba(255, 185, 225, 0.25)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(0, -96, 86, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255, 145, 200, 0.14)';
        ctx.beginPath();
        ctx.arc(0, -96, 106, 0, Math.PI * 2);
        ctx.stroke();

        // 根を張る太い幹（暗部＋ピンクの照り返しハイライト）
        ctx.fillStyle = '#1c0d24';
        ctx.beginPath();
        ctx.moveTo(-36, 18);
        ctx.quadraticCurveTo(-20, -24, -15, -72);
        ctx.lineTo(15, -72);
        ctx.quadraticCurveTo(22, -24, 38, 18);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(195, 115, 165, 0.42)';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(-26, 14);
        ctx.quadraticCurveTo(-15, -24, -11, -70);
        ctx.stroke();

        // 幾重にも分岐する大枝・小枝
        ctx.lineCap = 'round';
        const branches = [
            [-10, -70, -58, -104, -124, -98, 10],
            [10, -70, 58, -104, 126, -96, 10],
            [-6, -74, -28, -126, -68, -148, 7],
            [6, -74, 28, -126, 70, -148, 7],
            [-68, -100, -108, -122, -152, -112, 5],
            [68, -100, 108, -122, 154, -110, 5],
            [0, -74, -4, -130, -12, -162, 6],
            [0, -74, 14, -128, 28, -158, 5]
        ];
        for (let i = 0; i < branches.length; i++) {
            const b = branches[i];
            ctx.strokeStyle = '#1d0e26';
            ctx.lineWidth = b[6];
            ctx.beginPath();
            ctx.moveTo(b[0], b[1]);
            ctx.quadraticCurveTo(b[2], b[3], b[4], b[5]);
            ctx.stroke();
            ctx.strokeStyle = 'rgba(215, 130, 180, 0.28)';
            ctx.lineWidth = Math.max(1.2, b[6] * 0.28);
            ctx.stroke();
        }

        // 垂れ下がる西行妖の華やかな桜雲（暗→明の多層ブロッサム）
        const canopy = [
            [0, -148, 70, 'rgba(225, 110, 175, 0.34)'],
            [-78, -125, 62, 'rgba(225, 110, 175, 0.32)'],
            [80, -124, 62, 'rgba(225, 110, 175, 0.32)'],
            [-132, -104, 48, 'rgba(245, 150, 200, 0.30)'],
            [134, -102, 48, 'rgba(245, 150, 200, 0.30)'],
            [-38, -158, 52, 'rgba(255, 185, 222, 0.36)'],
            [40, -156, 52, 'rgba(255, 185, 222, 0.36)'],
            [0, -124, 54, 'rgba(255, 205, 234, 0.38)']
        ];
        for (let i = 0; i < canopy.length; i++) {
            const cl = canopy[i];
            const g = ctx.createRadialGradient(cl[0], cl[1], 4, cl[0], cl[1], cl[2]);
            safeGradStop(g, 0, cl[3]);
            safeGradStop(g, 0.65, 'rgba(235, 135, 195, 0.16)');
            safeGradStop(g, 1, 'rgba(235, 135, 195, 0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(cl[0], cl[1], cl[2], 0, Math.PI * 2);
            ctx.fill();
        }
        // 枝先の細かい桜花房ドット
        for (let i = 0; i < 42; i++) {
            const ang = C.hashIdx(i, 41) * Math.PI * 2;
            const rad = Math.sqrt(C.hashIdx(i, 42)) * 128;
            const bx = Math.cos(ang) * rad * 1.18;
            const by = -126 + Math.sin(ang) * rad * 0.45;
            const sz = 4 + C.hashIdx(i, 43) * 6;
            ctx.fillStyle = (i % 3 === 0) ? 'rgba(255, 220, 238, 0.65)' : 'rgba(255, 162, 208, 0.56)';
            ctx.beginPath();
            ctx.arc(bx, by, sz, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

        // 無限に登る白玉楼の石段（蹴上げ陰影＋踏面ハイライト付き）
        C.forWorldSlices(cam, spacing, 60, (idx, wz) => {
            const wy0 = idx * stepRise;
            const wy1 = (idx + 1) * stepRise;
            const z0 = wz;
            const z1 = wz + spacing;
            const shade = (idx % 2 === 0) ? 1.0 : 0.88;
            const vzApprox = z0 - cam.z;
            const useTex = vzApprox < 1200;

            // 蹴上げ面（上端に段差の影、下側は暗め）
            C.drawQuad3D(ctx, cam, [-195, wy0, z0], [195, wy0, z0], [195, wy1, z0], [-195, wy1, z0], [88, 72, 114], shade * 0.72, 1, null, useTex ? {
                material: 'stone_tiles',
                materialAlpha: 0.28
            } : undefined);
            // 踏面（月光を受ける上面＋段鼻ハイライト線）
            C.drawTexturedGroundStrip(ctx, cam, -195, 195, wy1, z0, z1, [142, 124, 168], {
                shade: shade * 1.06,
                material: useTex ? 'stone_tiles' : null,
                materialAlpha: 0.34,
                curbRGB: [98, 84, 126],
                curbWidth: 16
            });
            C.drawLine3D(ctx, cam, [-195, wy1 + 0.5, z0], [195, wy1 + 0.5, z0], [205, 185, 232], 1.8, 0.55);

            // 左右の石垣ベースと幽世の雲海縁
            C.drawBox3D(ctx, cam, -238, wy0 - 24, z0, -195, wy1 + 12, z1, [74, 62, 96]);
            C.drawBox3D(ctx, cam, 195, wy0 - 24, z0, 238, wy1 + 12, z1, [74, 62, 96]);
            if (idx % 2 === 0) {
                C.drawStamp3D(ctx, cam, 'cloud_bank', -330, wy0 - 22, z0 + 42, 260, 110, { rgb: [130, 108, 175], alpha: 0.34, fogStrength: 0.5 });
                C.drawStamp3D(ctx, cam, 'cloud_bank', 330, wy0 - 22, z0 + 42, 260, 110, { flipX: true, rgb: [130, 108, 175], alpha: 0.34, fogStrength: 0.5 });
            }

            // 手すり連続ビーム
            C.drawLine3D(ctx, cam, [-216, wy1 + 66, z0], [-216, wy1 + stepRise + 66, z1], [126, 108, 154], 4.5, 0.85);
            C.drawLine3D(ctx, cam, [216, wy1 + 66, z0], [216, wy1 + stepRise + 66, z1], [126, 108, 154], 4.5, 0.85);

            if (C.modPos(idx, 3) === 0) {
                for (let side = -1; side <= 1; side += 2) {
                    const px = side * 216;
                    C.drawCylinder3D(ctx, cam, px, wy0, wy1 + 78, z0 + 18, 13, 16, 6, [96, 80, 120]);
                    C.drawStamp3D(ctx, cam, 'lantern_glow', px, wy1 + 92, z0 + 18, 42, 42, {
                        rgb: [255, 185, 225],
                        alpha: 0.9
                    });
                }
            }

            if (C.modPos(idx, 4) === 2) {
                const side = (idx % 8 === 2) ? -1 : 1;
                const tx = side * 288;
                C.drawCylinder3D(ctx, cam, tx, wy0 - 15, wy1 + 165, z0 + 30, 11, 18, 6, [58, 34, 48]);
                C.drawStamp3D(ctx, cam, 'sakura_cluster', tx - side * 26, wy1 + 172, z0 + 30, 190, 150, {
                    flipX: side < 0,
                    alpha: 0.9
                });
                C.drawStamp3D(ctx, cam, 'spirit_wisp', -side * 255, wy1 + 115 + Math.sin(t * 2 + idx) * 12, z0 + 25, 38, 48, {
                    rgb: [175, 235, 255],
                    alpha: 0.8
                });
            }
        });

        C.drawWorldParticles(ctx, cam, t, {
            count: 58,
            vx: 26,
            vy: -48,
            vz: 0,
            sway: 24,
            size: 5.5,
            shape: 'petal',
            rgb: [255, 185, 222],
            rgb2: [255, 225, 242],
            alpha: 0.88
        });
    }

    // ── 6. bamboo_forest (永夜抄4面 迷いの竹林) ─────────────────────
    function drawBambooForest(ctx, W, H, t) {
        const cam = C.makeCamera(W, H, {
            x: Math.sin(t * 0.44) * 20,
            y: 122,
            z: t * 172,
            pitch: -0.02,
            horizonY: H * 0.34,
            fogRGB: [8, 28, 18],
            fogDist: 860,
            maxZ: 1920
        });

        C.drawSkyGrad(ctx, W, H, [
            [0, '#030f0a'],
            [0.28, '#0b291b'],
            [0.38, '#133b27'],
            [1, '#040e09']
        ]);

        // 竹林の梢を透かす銀蒼の月光と斜め光条
        const glowX = W * 0.62 - cam.x * 0.1;
        C.drawAtmosphericGlow(ctx, glowX, H * 0.19, W * 0.44, [
            [0, 'rgba(195, 255, 222, 0.28)'],
            [0.5, 'rgba(75, 185, 130, 0.11)'],
            [1, 'rgba(8, 28, 18, 0)']
        ]);
        C.drawLightShafts(ctx, W, H, {
            count: 5,
            x: glowX,
            spread: W * 0.65,
            y0: 0,
            y1: H * 0.88,
            topW: 16,
            botW: 88,
            angle: -0.34,
            rgb: [190, 255, 220],
            alpha: 0.08,
            speed: 0.65
        }, t);

        // 落ち葉と苔の林床（世界座標に固定された暗い土面）
        C.fillGroundBase(ctx, cam, 0, 1800, [14, 34, 21], 8, {
            farRGB: [8, 22, 15],
            material: 'cobblestone',
            materialAlpha: 0.14
        });

        const spacing = 128;
        C.forWorldSlices(cam, spacing, 40, (idx, wz) => {
            const z0 = wz;
            const z1 = wz + spacing;
            const vzApprox = z0 - cam.z;
            const useTex = vzApprox < 1200;

            // 踏み固められた土の小道（自然なアースカラー＋苔縁＋落ち葉）
            C.drawTexturedGroundStrip(ctx, cam, -94, 94, 0.5, z0, z1, [27, 46, 31], {
                material: useTex ? 'cobblestone' : null,
                materialAlpha: 0.22,
                curbRGB: [18, 40, 25],
                curbWidth: 14,
                centerRGB: [36, 56, 38],
                centerWidth: 44
            });
            // 道に散る竹の落ち葉（小片）
            for (let lf = 0; lf < 3; lf++) {
                const lx = (C.hashIdx(idx, 50 + lf) - 0.5) * 145;
                const lz = z0 + C.hashIdx(idx, 60 + lf) * spacing;
                C.drawQuad3D(ctx, cam, [lx - 4, 0.9, lz], [lx + 5, 0.9, lz + 2], [lx + 3, 0.9, lz + 7], [lx - 6, 0.9, lz + 5], [76, 112, 62], 1, 0.65);
            }

            // 4スライスおきに道端の行灯石灯籠
            if (C.modPos(idx, 4) === 0) {
                const side = (idx % 8 === 0) ? -1 : 1;
                const lx = side * 112;
                C.drawCylinder3D(ctx, cam, lx, 0, 48, z0 + 36, 7, 10, 6, [66, 80, 72]);
                C.drawStamp3D(ctx, cam, 'lantern_glow', lx, 56, z0 + 36, 36, 36, {
                    rgb: [200, 255, 205],
                    alpha: 0.84
                });
            }

            // 地面に根付く3D竹幹（傾きバリエーション付き＋節＋豊かな竹葉冠）
            for (let side = -1; side <= 1; side += 2) {
                for (let layer = 0; layer < 2; layer++) {
                    const hA = C.hashIdx(idx, side * 10 + layer);
                    const hB = C.hashIdx(idx, side * 20 + layer);
                    const hLean = C.hashIdx(idx, side * 30 + layer) - 0.5;
                    const bx = side * (120 + layer * 102 + hA * 62);
                    const bz = wz + hB * 72;
                    const rad = 7.5 + layer * 2.5;
                    const lean = hLean * 46;
                    const sway = Math.sin(t * 1.35 + idx * 0.7 + layer) * 9;
                    const rgb = (layer === 0) ? [44, 122, 68] : [22, 78, 45];

                    // 傾き竹幹（下段＋上段で滑らかに湾曲）
                    const midX = bx + lean * 0.45 + sway * 0.35;
                    const topX = bx + lean + sway;
                    C.drawQuad3D(ctx, cam,
                        [bx - rad, 0, bz], [bx + rad, 0, bz],
                        [midX + rad * 0.9, 240, bz], [midX - rad * 0.9, 240, bz],
                        rgb, 1.0, 1, null, useTex ? { material: 'bark_bamboo', materialAlpha: 0.36 } : undefined
                    );
                    C.drawQuad3D(ctx, cam,
                        [midX - rad * 0.88, 238, bz], [midX + rad * 0.88, 238, bz],
                        [topX + rad * 0.62, 530, bz], [topX - rad * 0.62, 530, bz],
                        rgb, 0.9, 1
                    );

                    // 竹の節（傾きに沿う座標）
                    for (let nodeY = 75; nodeY <= 310; nodeY += 78) {
                        const u = nodeY / 530;
                        const nx = bx + (lean + sway) * u;
                        C.drawLine3D(ctx, cam, [nx - rad * 1.15, nodeY, bz - 2], [nx + rad * 1.15, nodeY, bz - 2], [148, 234, 170], 2.2, 0.78);
                    }

                    // 密生する竹葉の梢（上部を覆うアーチ状の葉冠）
                    C.drawStamp3D(ctx, cam, 'pine_bough', midX - side * 26, 255 + hA * 65, bz, 148, 92, {
                        rgb: (layer === 0) ? [52, 138, 76] : [36, 102, 58],
                        alpha: 0.82,
                        flipX: side < 0
                    });
                    if ((idx + layer) % 2 === 0) {
                        C.drawStamp3D(ctx, cam, 'pine_bough', topX - side * 42, 345 + hB * 55, bz, 170, 105, {
                            rgb: [64, 152, 88],
                            alpha: 0.74,
                            flipX: side > 0
                        });
                    }
                }
            }

            if (idx % 3 === 0) {
                const mx = (C.hashIdx(idx, 31) - 0.5) * 420;
                C.drawStamp3D(ctx, cam, 'cloud_bank', mx, 18, z0 + 60, 290, 76, {
                    rgb: [120, 200, 155],
                    alpha: 0.18,
                    fogStrength: 0.5
                });
            }
        });

        C.drawWorldParticles(ctx, cam, t, {
            count: 34,
            vx: 16,
            vy: -14,
            vz: 0,
            sway: 18,
            size: 4,
            shape: 'circle',
            rgb: [170, 255, 195],
            rgb2: [225, 255, 165],
            alpha: 0.74,
            glow: true
        });
    }

    // ── 7. fake_moon (永夜抄5-6面 永遠亭廊下と偽りの満月) ──────────
    function drawFakeMoon(ctx, W, H, t) {
        const cam = C.makeCamera(W, H, {
            x: Math.sin(t * 0.34) * 14,
            y: 126,
            z: t * 142,
            pitch: -0.012,
            horizonY: H * 0.36,
            fogRGB: [24, 7, 20],
            fogDist: 1000,
            maxZ: 2050
        });

        C.drawSkyGrad(ctx, W, H, [
            [0, '#0a020e'],
            [0.24, '#22071c'],
            [0.39, '#3a0f28'],
            [1, '#090208']
        ]);
        C.drawStars(ctx, W, H * 0.36, t, 46, '#ffd8ec', 1.3);

        // 開放廊下の上空に完全に姿を現す巨大な「偽りの満月」
        const cx = W * 0.5 - cam.x * 0.11;
        const moonY = H * 0.19;
        const moonR = Math.min(W, H) * 0.16;
        C.drawAtmosphericGlow(ctx, cx, moonY, moonR * 1.95, [
            [0, 'rgba(255, 232, 205, 0.82)'],
            [0.36, 'rgba(235, 68, 108, 0.44)'],
            [0.72, 'rgba(130, 18, 56, 0.16)'],
            [1, 'rgba(24, 7, 20, 0)']
        ]);
        ctx.save();
        ctx.translate(cx, moonY);
        ctx.fillStyle = 'rgba(255, 224, 204, 0.76)';
        ctx.beginPath();
        ctx.arc(0, 0, moonR * 0.76, 0, Math.PI * 2);
        ctx.fill();

        // 月面の微細な模様と偽月を示す紅い輪郭・幾何学封紋
        ctx.fillStyle = 'rgba(195, 125, 130, 0.22)';
        ctx.beginPath(); ctx.arc(-moonR * 0.22, -moonR * 0.12, moonR * 0.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(moonR * 0.18, moonR * 0.16, moonR * 0.15, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(moonR * 0.12, -moonR * 0.24, moonR * 0.11, 0, Math.PI * 2); ctx.fill();

        ctx.strokeStyle = 'rgba(225, 65, 110, 0.42)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(0, 0, moonR * 0.76, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(225, 85, 130, 0.26)';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.arc(0, 0, moonR * 0.58, 0, Math.PI * 2);
        ctx.stroke();
        for (let k = 0; k < 8; k++) {
            const a = t * 0.14 + (k / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * moonR * 0.58, Math.sin(a) * moonR * 0.58);
            ctx.lineTo(Math.cos(a) * moonR * 0.76, Math.sin(a) * moonR * 0.76);
            ctx.stroke();
        }
        ctx.restore();

        // 紅い幻覚光条
        C.drawLightShafts(ctx, W, H, {
            count: 4,
            x: cx,
            spread: W * 0.6,
            y0: moonY + moonR * 0.5,
            y1: H * 0.85,
            topW: 20,
            botW: 112,
            angle: 0.15,
            rgb: [245, 95, 145],
            alpha: 0.08,
            speed: 0.8
        }, t);

        // 落ち着いた漆塗り木板と陰翳ある畳敷き＋開放庭園（中央が明るすぎないようにトーンを調整）
        C.fillGroundBase(ctx, cam, 0, 2200, [24, 18, 26], 8, {
            farRGB: [18, 10, 18],
            material: 'cobblestone',
            materialAlpha: 0.14
        });

        const spacing = 195;
        C.forWorldSlices(cam, spacing, 50, (idx, wz) => {
            const z0 = wz;
            const z1 = wz + spacing;
            const vzApprox = z0 - cam.z;
            const useTex = vzApprox < 1300;

            // 外側は深紅艶の縁側木板、中央は落ち着いた紅月照り返し畳＋紺縁
            C.drawTexturedGroundStrip(ctx, cam, -230, 230, 0.6, z0, z1, [66, 28, 36], {
                material: useTex ? 'wood_planks' : null,
                materialAlpha: 0.44,
                centerRGB: [72, 54, 62],
                centerWidth: 128,
                centerMaterial: useTex ? 'tatami' : null,
                centerMaterialAlpha: 0.36,
                curbRGB: [38, 15, 22],
                curbWidth: 12
            });
            // 畳縁（濃い藍紫ライン）
            C.drawLine3D(ctx, cam, [-64, 1.2, z0], [-64, 1.2, z1], [34, 24, 46], 2.2, 0.85);
            C.drawLine3D(ctx, cam, [64, 1.2, z0], [64, 1.2, z1], [34, 24, 46], 2.2, 0.85);

            // 左右の障子壁（暖色灯りの和紙＋竹影シルエット）と開放庭園ベイ
            const isOpenBay = (idx % 3 === 1);
            if (!isOpenBay) {
                C.drawQuad3D(ctx, cam, [-228, 0, z0], [-228, 0, z1], [-228, 245, z1], [-228, 245, z0], [185, 118, 132], 0.44, 0.9, [58, 22, 30], useTex ? {
                    material: 'shoji',
                    materialAlpha: 0.56
                } : undefined);
                C.drawQuad3D(ctx, cam, [228, 0, z1], [228, 0, z0], [228, 245, z0], [228, 245, z1], [185, 118, 132], 0.44, 0.9, [58, 22, 30], useTex ? {
                    material: 'shoji',
                    materialAlpha: 0.56
                } : undefined);
                // 障子越しに揺れる竹のシルエット線
                const sMid = (z0 + z1) * 0.5;
                C.drawLine3D(ctx, cam, [-226, 24, sMid - 18], [-226, 210, sMid + 22], [48, 18, 28], 3.2, 0.45);
                C.drawLine3D(ctx, cam, [226, 24, sMid + 18], [226, 210, sMid - 22], [48, 18, 28], 3.2, 0.45);
            } else {
                for (let side = -1; side <= 1; side += 2) {
                    C.drawCylinder3D(ctx, cam, side * 305, -10, 260, z0 + 95, 7, 9, 5, [32, 62, 48]);
                    C.drawStamp3D(ctx, cam, 'lantern_glow', side * 208, 198, z0 + 95, 42, 42, {
                        rgb: [255, 165, 130],
                        alpha: 0.9
                    });
                }
            }

            // 木造柱・左右の鴨居・吹き抜け（中央に梁を渡さず偽りの満月を開放表示！）
            for (let side = -1; side <= 1; side += 2) {
                const px = side * 228;
                C.drawCylinder3D(ctx, cam, px, 0, 265, z0 + 10, 11, 13, 6, [54, 22, 28]);
                // 外側軒庇（中央空域を遮らない位置）
                C.drawSoriRoof3D(ctx, cam, side * 252, 250, (z0 + z1) * 0.5, 78, spacing, 26, 8, [88, 52, 68], [48, 34, 52], {
                    axis: 'z',
                    segs: 4,
                    zSegs: 1,
                    sori: 0.14,
                    material: null
                });
            }
            // 奥（遠方 z > cam.z + 1150）だけ回廊の横梁を繋ぎ「永遠に続く廊下」と「開けた月空」を両立
            if (vzApprox > 1150) {
                C.drawBox3D(ctx, cam, -234, 248, z0, 234, 264, z0 + 16, [44, 18, 24]);
            }
        });

        C.drawWorldParticles(ctx, cam, t, {
            count: 30,
            vx: 10,
            vy: 16,
            vz: 0,
            sway: 16,
            size: 4,
            shape: 'diamond',
            rgb: [255, 175, 205],
            rgb2: [220, 225, 255],
            alpha: 0.7,
            glow: true
        });
    }

    C.registerRenderer('misty_lake', drawMistyLake);
    C.registerRenderer('scarlet_mansion', drawScarletMansion);
    C.registerRenderer('hakurei_shrine', drawHakureiShrine);
    C.registerRenderer('netherworld_gate', drawNetherworldGate);
    C.registerRenderer('hakugyokurou', drawHakugyokurou);
    C.registerRenderer('bamboo_forest', drawBambooForest);
    C.registerRenderer('fake_moon', drawFakeMoon);
})(typeof window !== 'undefined' ? window : globalThis);
