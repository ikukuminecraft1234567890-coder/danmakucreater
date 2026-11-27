/**
 * 2D疑似3D背景レンダラ パックC (js/bg3d/pack_c.js)
 * TH12〜TH16 (星蓮船後半・神霊廟・輝針城・紺珠伝・天空璋) の6ステージを実装:
 * 1. makai_esoteria          (星蓮船5面 魔界地方都市エソテリア)
 * 2. hokkai                  (星蓮船6面 法界の幾何学光線・蓮華紋様)
 * 3. divine_spirit_mausoleum (神霊廟5-6面 夢殿大祀廟・神霊)
 * 4. shining_needle_castle   (輝針城5-6面 逆さ城・輝針城天守)
 * 5. lunar_capital           (紺珠伝5-6面 静かの海と月の都・青い地球)
 * 6. back_door               (天空璋6面 後戸の国・無数の扉と四季)
 */
(function (global) {
    'use strict';

    const Core = global.BG3DCore || (typeof window !== 'undefined' ? window.BG3DCore : null);
    if (!Core) {
        throw new Error('BG3DCore must be loaded before js/bg3d/pack_c.js');
    }

    const {
        hashIdx,
        modPos,
        clamp,
        lerp,
        makeCamera,
        toView,
        drawStamp3D,
        drawSkyGrad,
        drawStars,
        drawAtmosphericGlow,
        drawHorizonGlow,
        drawLightShafts,
        drawQuad3D,
        drawLine3D,
        drawCatenary3D,
        drawRing3D,
        fillGroundBase,
        drawTexturedGroundStrip,
        drawWaterPlane,
        drawBox3D,
        drawCylinder3D,
        drawSoriRoof3D,
        drawArch3D,
        drawPyramid3D,
        forWorldSlices,
        drawWorldParticles
    } = Core;

    function safeStop(grad, offset, color) {
        if (grad && typeof grad.addColorStop === 'function') {
            grad.addColorStop(clamp(offset, 0, 1), color);
        }
    }

    function safeEllipse(ctx, x, y, rx, ry, rot) {
        if (typeof ctx.ellipse === 'function') {
            ctx.ellipse(x, y, Math.max(0.2, rx), Math.max(0.2, ry), rot || 0, 0, Math.PI * 2);
        } else if (typeof ctx.arc === 'function') {
            ctx.arc(x, y, Math.max(0.2, (rx + ry) * 0.5), 0, Math.PI * 2);
        }
    }

    function rotYPoint(cx, cy, cz, lx, ly, lz, yaw) {
        const c = Math.cos(yaw), s = Math.sin(yaw);
        return [cx + lx * c - lz * s, cy + ly, cz + lx * s + lz * c];
    }

    // =========================================================================
    // 1. 星蓮船5面: 魔界地方都市エソテリア (makai_esoteria)
    //    原作リスペクト：真紅の濃密な雲海の下に青白い幾何学格子大地を見下ろす紅×蒼空間
    // =========================================================================
    function drawMakaiEsoteria(ctx, W, H, t) {
        const cam = makeCamera(W, H, {
            x: Math.sin(t * 0.28) * 32,
            y: 290,
            z: t * 175,
            yaw: Math.sin(t * 0.2) * 0.03,
            pitch: -0.36,
            roll: Math.sin(t * 0.18) * 0.035,
            horizonY: H * 0.12,
            fogRGB: [110, 12, 22],
            fogDist: 1220,
            maxZ: 2300
        });

        // 燃えるような真紅〜暗紅の魔界空
        drawSkyGrad(ctx, W, H, [
            [0, '#36040a'],
            [0.14, '#7d0a16'],
            [0.36, '#580814'],
            [0.72, '#22081c'],
            [1, '#0d0618']
        ]);

        // 地平線の鮮烈な真紅グロー
        drawAtmosphericGlow(ctx, W * 0.5, H * 0.14, W * 0.78, [
            [0, 'rgba(245, 36, 44, 0.52)'],
            [0.45, 'rgba(175, 14, 32, 0.28)'],
            [1, 'rgba(110, 12, 22, 0)']
        ], null, { scaleX: 1.4, scaleY: 0.65 });

        // 下界の魔界大地ベース（深い紺青〜青紫）
        fillGroundBase(ctx, cam, 0, 2200, [24, 34, 78], 8, {
            farRGB: [88, 16, 36]
        });

        const spacing = 190;
        forWorldSlices(cam, spacing, 40, (idx, wz) => {
            const z0 = wz;
            const z1 = wz + spacing;
            const zMid = wz + spacing * 0.5;
            const h0 = hashIdx(idx, 1);
            const h1 = hashIdx(idx, 2);

            // 下界に広がる「青白く光る幾何学格子（魔界グリッド大地）」
            for (let gx = -520; gx <= 520; gx += 130) {
                drawLine3D(ctx, cam, [gx, 2, z0], [gx, 2, z1], [118, 164, 245], 1.6, 0.58);
            }
            drawLine3D(ctx, cam, [-540, 2, z0], [540, 2, z0], [118, 164, 245], 1.6, 0.54);
            drawLine3D(ctx, cam, [-540, 2, zMid], [540, 2, zMid], [88, 126, 212], 1.1, 0.36);

            // 格子の合間に点在する暗い紅黒の魔界島影・紋様タイル
            for (let k = -2; k <= 2; k++) {
                const hk = hashIdx(idx * 7 + k + 10, 5);
                if (hk > 0.42) {
                    const ix = k * 175 + (hashIdx(idx * 7 + k + 10, 6) - 0.5) * 65;
                    const iw = 65 + hk * 55;
                    drawQuad3D(ctx, cam,
                        [ix - iw, 4, z0 + 18], [ix + iw, 4, z0 + 28],
                        [ix + iw * 0.85, 4, z1 - 18], [ix - iw * 0.9, 4, z1 - 24],
                        [112, 14, 24], 0.95, 0.78
                    );
                }
            }

            // ★原作星蓮船5面の象徴：下界の青い格子の上を幾重にも覆う真紅〜血赤の雲海
            const drift = Math.sin(t * 0.5 + idx * 0.85) * 38;
            for (let c = -2; c <= 2; c++) {
                const hc = hashIdx(idx * 11 + c + 20, 7);
                if (hc < 0.24) continue; // 雲の切れ目を作って下の青格子を覗かせる
                const cx = c * 225 + drift * (c & 1 ? 0.7 : -0.6) + (hc - 0.5) * 110;
                const cy = 28 + hashIdx(idx * 11 + c + 20, 8) * 58;
                const cz = z0 + hashIdx(idx * 11 + c + 20, 9) * spacing;
                const isCrimson = ((idx + c) & 1) === 0;
                drawStamp3D(ctx, cam, 'cloud_bank', cx, cy, cz, 440 + hc * 140, 155, {
                    rgb: isCrimson ? [196, 18, 28] : [132, 10, 22],
                    alpha: isCrimson ? 0.64 : 0.58,
                    fogStrength: 0.32
                });
            }
            // 上層を流れる明るい紅炎の薄雲
            if (modPos(idx, 2) === 0) {
                drawStamp3D(ctx, cam, 'cloud_bank', (h0 - 0.5) * 560 - drift, 92 + h1 * 28, zMid, 520, 140, {
                    rgb: [228, 34, 38],
                    alpha: 0.36,
                    fogStrength: 0.36
                });
            }
        });

        // 魔界の真紅・蒼白エネルギー粒子
        drawWorldParticles(ctx, cam, t, {
            count: 42,
            vx: 16,
            vy: 18,
            vz: -60,
            sway: 20,
            size: 4.5,
            shape: 'diamond',
            glow: true,
            rgb: [255, 78, 78],
            rgb2: [128, 192, 255],
            alpha: 0.78
        });
    }

    // =========================================================================
    // 2. 星蓮船6面: 法界 (hokkai)
    //    原作リスペクト：漆黒のシルエット地平線に燃える真紅の巨大太陽＋ネオン青紫の雲文様格子床
    // =========================================================================
    function drawHokkai(ctx, W, H, t) {
        const cam = makeCamera(W, H, {
            x: Math.sin(t * 0.24) * 20,
            y: 158,
            z: t * 155,
            pitch: -0.10,
            horizonY: H * 0.33,
            fogRGB: [8, 2, 12],
            fogDist: 1320,
            maxZ: 2300
        });

        // 漆黒〜暗紅の法界空（太陽の周囲だけ劇的に赤く燃え上がる高コントラスト設計）
        drawSkyGrad(ctx, W, H, [
            [0, '#020104'],
            [0.16, '#0a0204'],
            [0.31, '#320604'],
            [0.36, '#08020c'],
            [1, '#020208']
        ]);

        // ★原作星蓮船6面の象徴：地平線に燃え盛る巨大な真紅〜朱橙の太陽（白核）
        const sunX = W * 0.5 - cam.x * 0.12;
        const sunY = cam.horizonY - 18;
        const sunR = Math.min(W, H) * 0.16;
        const pulse = 1 + 0.04 * Math.sin(t * 2.2);

        // 広範囲を真っ赤に焼き焦がす法界太陽の紅蓮ハロー
        drawAtmosphericGlow(ctx, sunX, sunY, W * 0.58 * pulse, [
            [0, 'rgba(255, 252, 224, 0.94)'],
            [0.14, 'rgba(255, 198, 72, 0.86)'],
            [0.32, 'rgba(235, 62, 12, 0.68)'],
            [0.58, 'rgba(138, 12, 6, 0.32)'],
            [1, 'rgba(8, 2, 12, 0)']
        ], null, { scaleX: 1.35, scaleY: 0.72 });

        // 太陽の白熱コア
        ctx.save();
        const coreG = ctx.createRadialGradient(sunX, sunY, 2, sunX, sunY, sunR * 0.55 * pulse);
        safeStop(coreG, 0, 'rgba(255, 255, 240, 0.96)');
        safeStop(coreG, 0.48, 'rgba(255, 222, 118, 0.82)');
        safeStop(coreG, 1, 'rgba(238, 86, 18, 0)');
        ctx.fillStyle = coreG;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR * 0.55 * pulse, 0, Math.PI * 2);
        ctx.fill();

        // 地平線を横切る真っ黒な法界都市・山並みのギザギザシルエット（太陽の下縁を切る）
        const hy = cam.horizonY + 2;
        ctx.fillStyle = '#030106';
        ctx.beginPath();
        ctx.moveTo(0, hy + 28);
        const steps = 42;
        for (let i = 0; i <= steps; i++) {
            const u = i / steps;
            const x = u * W;
            const centerDip = Math.exp(-Math.pow((u - 0.5) * 4.4, 2));
            const h = (1 - centerDip * 0.82) * (18 + hashIdx(i, 61) * 46);
            ctx.lineTo(x, hy - h);
        }
        ctx.lineTo(W, hy + 28);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // 漆黒の法界床ベース
        fillGroundBase(ctx, cam, 0, 2200, [4, 3, 12], 6, { farRGB: [12, 4, 16] });

        // ★原作星蓮船6面の象徴：漆黒の床に浮かぶネオンブルー＆紫の幾何学格子と仏教瑞雲・蓮華紋様
        const spacing = 210;
        forWorldSlices(cam, spacing, 45, (idx, wz) => {
            const z0 = wz;
            const z1 = wz + spacing;
            const zMid = wz + spacing * 0.5;

            // 繊細な青紫の幾何学格子（法界グリッド）
            for (let gx = -560; gx <= 560; gx += 140) {
                drawLine3D(ctx, cam, [gx, 1, z0], [gx, 1, z1], [52, 74, 186], 1.4, 0.42);
            }
            drawLine3D(ctx, cam, [-580, 1, z0], [580, 1, z0], [58, 82, 198], 1.4, 0.40);

            // 左右・中央に床面へ水平に張り付くネオンブルー＆鮮紫の「仏教瑞雲・法界文様」
            function drawFlatCloudMotif(cx, cz, rx, rz, col1, col2) {
                // 水平XZ平面に描く瑞雲の3連オーバル＆渦巻き輪郭
                const lobes = [
                    [0, 0, rx * 0.62, rz * 0.52, col1],
                    [-rx * 0.52, rz * 0.14, rx * 0.42, rz * 0.36, col2],
                    [rx * 0.52, -rz * 0.12, rx * 0.44, rz * 0.38, col2]
                ];
                for (let l = 0; l < lobes.length; l++) {
                    const lb = lobes[l];
                    const lx = cx + lb[0], lz = cz + lb[1], lrx = lb[2], lrz = lb[3], lcol = lb[4];
                    const segs = 12;
                    for (let s = 0; s < segs; s++) {
                        const a0 = (s / segs) * Math.PI * 2;
                        const a1 = ((s + 1) / segs) * Math.PI * 2;
                        drawLine3D(ctx, cam,
                            [lx + Math.cos(a0) * lrx, 2.5, lz + Math.sin(a0) * lrz],
                            [lx + Math.cos(a1) * lrx, 2.5, lz + Math.sin(a1) * lrz],
                            lcol, 2.2, 0.68
                        );
                    }
                    // 内側の細い同心雲渦
                    for (let s = 0; s < 8; s++) {
                        const a0 = (s / 8) * Math.PI * 2;
                        const a1 = ((s + 1) / 8) * Math.PI * 2;
                        drawLine3D(ctx, cam,
                            [lx + Math.cos(a0) * lrx * 0.52, 3.0, lz + Math.sin(a0) * lrz * 0.52],
                            [lx + Math.cos(a1) * lrx * 0.52, 3.0, lz + Math.sin(a1) * lrz * 0.52],
                            [135, 192, 255], 1.4, 0.52
                        );
                    }
                }
                // 瑞雲の下を縁取る淡い光タイル
                drawQuad3D(ctx, cam,
                    [cx - rx * 0.9, 1.8, cz - rz * 0.35], [cx + rx * 0.9, 1.8, cz - rz * 0.35],
                    [cx + rx * 0.72, 1.8, cz + rz * 0.35], [cx - rx * 0.72, 1.8, cz + rz * 0.35],
                    col2, 1.0, 0.14
                );
            }
            const shiftX = Math.sin(idx * 1.1) * 55;
            drawFlatCloudMotif(-235 + shiftX, zMid, 128, 76, [74, 122, 255], [176, 62, 238]);
            drawFlatCloudMotif(235 - shiftX, zMid, 128, 76, [74, 122, 255], [176, 62, 238]);
            if (modPos(idx, 2) === 0) {
                drawFlatCloudMotif((hashIdx(idx, 12) - 0.5) * 140, z0 + 50, 96, 56, [172, 74, 245], [76, 152, 255]);
            }
        });

        // 空間を静かに舞う紅金と蒼紫の法界粒子
        drawWorldParticles(ctx, cam, t, {
            count: 34,
            vx: 6,
            vy: 24,
            vz: -20,
            sway: 16,
            size: 4.5,
            shape: 'diamond',
            glow: true,
            rgb: [122, 178, 255],
            rgb2: [255, 138, 72],
            alpha: 0.72
        });
    }

    // =========================================================================
    // 3. 神霊廟5-6面: 夢殿大祀廟・神霊 (divine_spirit_mausoleum)
    //    原作リスペクト：暗紫の神秘空間に斜めにそびえ立つ巨大な多層木造大祀廟＋
    //    ピンク・水色・黄金の鮮やかな神霊オーブと光の花びらが舞う仙界
    // =========================================================================
    function drawDivineSpiritMausoleum(ctx, W, H, t) {
        const cam = makeCamera(W, H, {
            x: -55 + Math.sin(t * 0.28) * 18,
            y: 185 + Math.cos(t * 0.24) * 10,
            z: t * 135,
            yaw: 0.08,
            pitch: -0.16,
            roll: -0.20 + Math.sin(t * 0.22) * 0.025,
            horizonY: H * 0.28,
            fogRGB: [24, 12, 46],
            fogDist: 1250,
            maxZ: 2250
        });

        // 神霊廟5-6面：深い藍紫〜夜紫の幻想空間
        drawSkyGrad(ctx, W, H, [
            [0, '#09061a'],
            [0.24, '#1b113c'],
            [0.50, '#2a1852'],
            [0.78, '#1a103a'],
            [1, '#0b071e']
        ]);
        drawStars(ctx, W, H * 0.75, t, 56, '#e6dcff', 1.25);

        // 背後から淡く漂う仙界の紫藍〜水色のオーラ
        drawAtmosphericGlow(ctx, W * 0.34, H * 0.34, W * 0.56, [
            [0, 'rgba(176, 98, 245, 0.32)'],
            [0.45, 'rgba(84, 152, 238, 0.16)'],
            [1, 'rgba(24, 12, 46, 0)']
        ]);
        drawAtmosphericGlow(ctx, W * 0.72, H * 0.62, W * 0.45, [
            [0, 'rgba(112, 218, 255, 0.20)'],
            [0.55, 'rgba(155, 88, 225, 0.10)'],
            [1, 'rgba(24, 12, 46, 0)']
        ]);

        // 下方の暗い藍紫の霧ベース
        fillGroundBase(ctx, cam, -60, 2100, [22, 14, 46], 6, { farRGB: [36, 20, 68] });

        const spacing = 225;
        forWorldSlices(cam, spacing, 45, (idx, wz) => {
            const z0 = wz;
            const z1 = wz + spacing;
            const zMid = wz + spacing * 0.5;
            const h0 = hashIdx(idx, 1);

            // 左側の開けた仙界虚空に漂う紫の雲霧と巨大な神霊オーブ（原作6面要素）
            if (modPos(idx, 2) === 0) {
                drawStamp3D(ctx, cam, 'cloud_bank', -260 - h0 * 120, 40 + hashIdx(idx, 2) * 80, zMid, 380, 150, {
                    rgb: [82, 54, 148], alpha: 0.34, fogStrength: 0.38
                });
            }

            // ★原作神霊廟5面の象徴：右側〜中央にかけて斜めにそびえ立つ巨大な多層木造「夢殿大祀廟」外壁
            const xFront = 48;
            const xBack = 320;
            // 1層目（下部）：黒漆と白の菱格子（なまこ壁・格子戸）
            drawBox3D(ctx, cam, xFront, -40, z0 + 6, xBack, 118, z1 - 6, [52, 34, 58], {
                material: 'wood_planks', materialAlpha: 0.34, topRGB: [72, 48, 82], strokeRGB: [28, 16, 36], skipBack: true, skipBottom: true
            });
            drawQuad3D(ctx, cam,
                [xFront - 1.5, -18, z0 + 18], [xFront - 1.5, -18, z1 - 18],
                [xFront - 1.5, 92, z1 - 18], [xFront - 1.5, 92, z0 + 18],
                [158, 148, 182], 0.92, 0.84, [38, 24, 48], { material: 'shoji', materialAlpha: 0.62 }
            );
            // 1層目の反り瓦庇（深い暗紫の重厚な瓦庇）
            drawBox3D(ctx, cam, xFront - 28, 108, z0, xBack, 124, z1, [38, 26, 56], {
                material: 'kawara_tile', materialAlpha: 0.48, topRGB: [56, 44, 82], strokeRGB: [98, 86, 138], skipBack: true
            });

            // 2層目（中段）：重厚な暗紫茶の木組み格子と青白の欄間彫刻
            drawBox3D(ctx, cam, xFront + 12, 124, z0 + 10, xBack, 242, z1 - 10, [68, 42, 66], {
                material: 'wood_planks', materialAlpha: 0.44, strokeRGB: [32, 18, 36], skipBack: true, skipBottom: true
            });
            // 細かい木組の横桟・縦柱
            for (let k = 0; k < 3; k++) {
                const gz = lerp(z0 + 20, z1 - 20, k / 2);
                drawLine3D(ctx, cam, [xFront + 10, 124, gz], [xFront + 10, 242, gz], [34, 18, 38], 3.0, 0.88);
            }
            // 青白い唐草彫刻の欄間帯
            drawQuad3D(ctx, cam,
                [xFront + 10.5, 134, z0 + 14], [xFront + 10.5, 134, z1 - 14],
                [xFront + 10.5, 166, z1 - 14], [xFront + 10.5, 166, z0 + 14],
                [56, 84, 148], 1.0, 0.85, [132, 162, 224], { lineWidth: 1.3 }
            );
            // 2層目の瓦庇
            drawBox3D(ctx, cam, xFront - 16, 234, z0 + 4, xBack, 252, z1 - 4, [38, 26, 54], {
                material: 'kawara_tile', materialAlpha: 0.48, topRGB: [58, 46, 84], strokeRGB: [108, 96, 148], skipBack: true
            });

            // 3層目（上段）：さらに高くそびえる重層楼閣の格子壁と黄金装飾
            drawBox3D(ctx, cam, xFront + 24, 254, z0 + 14, xBack, 368, z1 - 14, [58, 36, 58], {
                material: 'wood_planks', materialAlpha: 0.42, strokeRGB: [188, 152, 92], skipBack: true, skipBottom: true
            });
            drawQuad3D(ctx, cam,
                [xFront + 22.5, 272, z0 + 28], [xFront + 22.5, 272, z1 - 28],
                [xFront + 22.5, 344, z1 - 28], [xFront + 22.5, 344, z0 + 28],
                [98, 72, 118], 0.96, 0.78, [202, 168, 102], { material: 'shoji', materialAlpha: 0.52 }
            );

            // ★原作神霊廟6面の象徴：空間の左〜中央を彩る鮮やかな「神霊オーブ」（桃・水色・黄・紫の光の玉）
            const orbPalette = [
                [245, 92, 212],  // ピンク神霊
                [88, 226, 255],  // 水色神霊
                [255, 218, 96],  // 黄金神霊
                [178, 112, 255]  // 紫神霊
            ];
            for (let o = 0; o < 2; o++) {
                const oCol = orbPalette[modPos(idx * 2 + o, orbPalette.length)];
                const ox = -220 + hashIdx(idx * 5 + o, 14) * 260 + Math.sin(t * 1.1 + idx + o) * 22;
                const oy = 48 + hashIdx(idx * 5 + o, 15) * 240 + Math.cos(t * 0.9 + idx) * 16;
                const oz = z0 + 40 + hashIdx(idx * 5 + o, 16) * 140;
                const osz = 48 + hashIdx(idx * 5 + o, 17) * 44;
                drawStamp3D(ctx, cam, 'lantern_glow', ox, oy, oz, osz, osz, {
                    rgb: oCol,
                    alpha: 0.74
                });
            }
        });

        // 仙界の空間を舞い散る白紫の花びらと神霊粒子
        drawWorldParticles(ctx, cam, t, {
            count: 42,
            vx: 14,
            vy: -24,
            vz: -18,
            sway: 24,
            size: 5.2,
            shape: 'petal',
            rgb: [222, 206, 255],
            rgb2: [255, 182, 236],
            alpha: 0.76
        });
        drawWorldParticles(ctx, cam, t + 1.8, {
            count: 26,
            vx: -8,
            vy: 34,
            vz: 0,
            sway: 18,
            size: 5.0,
            shape: 'circle',
            glow: true,
            rgb: [96, 236, 255],
            rgb2: [255, 224, 118],
            alpha: 0.76
        });
    }

    // =========================================================================
    // 4. 輝針城5-6面: 逆さ城・輝針城内部 (shining_needle_castle)
    //    原作リスペクト：上下反転した和室木廊下＋黄金に光る障子格子(5面)＆蒼い夜空窓(6面)＋吊り行灯
    // =========================================================================
    function drawShiningNeedleCastle(ctx, W, H, t) {
        // 原作輝針城5-6面リスペクト：赤絨毯や外瓦を撤去し、
        // 上下に反転した重厚な和室木廊下・黄金に輝く障子格子・蒼い夜空の格子窓・吊り行灯を再現
        const cam = makeCamera(W, H, {
            x: Math.sin(t * 0.34) * 14,
            y: 138,
            z: t * 146,
            pitch: 0.015,
            roll: Math.sin(t * 0.25) * 0.018,
            horizonY: H * 0.44,
            fogRGB: [44, 28, 12],
            fogDist: 1080,
            maxZ: 2150
        });

        // 輝針城内部の黄金琥珀ミストと蒼紫の奥行き空
        drawSkyGrad(ctx, W, H, [
            [0, '#120b06'],
            [0.30, '#2a1b0b'],
            [0.46, '#4c3210'],
            [0.70, '#261709'],
            [1, '#0e0804']
        ]);

        // 廊下奥から漂う黄金〜琥珀の妖しい霞（原作5面の象徴的な金色フォグ）
        drawAtmosphericGlow(ctx, W * 0.5, cam.horizonY + 12, W * 0.62, [
            [0, 'rgba(248, 186, 62, 0.44)'],
            [0.44, 'rgba(178, 112, 26, 0.24)'],
            [1, 'rgba(44, 28, 12, 0)']
        ], null, { scaleX: 1.35, scaleY: 0.75 });

        // 上側（逆さになった畳敷き天井）と下側（暗い板張り廊下床）のベース
        fillGroundBase(ctx, cam, 290, 950, [68, 72, 46], 6, { farRGB: [44, 30, 14], material: 'tatami', materialAlpha: 0.36 });
        fillGroundBase(ctx, cam, 0, 950, [34, 22, 12], 6, { farRGB: [44, 30, 14], material: 'wood_planks', materialAlpha: 0.36 });

        const spacing = 200;
        forWorldSlices(cam, spacing, 45, (idx, wz) => {
            const z0 = wz;
            const z1 = wz + spacing;
            const zMid = wz + spacing * 0.5;
            const isBlueWindow = modPos(idx, 3) === 2; // 3スライスに1回は6面風の蒼い夜空窓を織り交ぜる

            // 上側天井(y=290)：逆さに敷き詰められた和室の畳と黒漆の畳縁・木梁
            drawTexturedGroundStrip(ctx, cam, -225, 225, 290, z0, z1, [106, 112, 72], {
                material: 'tatami',
                materialAlpha: 0.56,
                materialScale: 0.65,
                curbWidth: 16,
                curbRGB: [36, 22, 14]
            });
            drawLine3D(ctx, cam, [-220, 289, z0], [220, 289, z0], [34, 22, 12], 3.0, 0.85);
            drawLine3D(ctx, cam, [-110, 289, z0], [-110, 289, z1], [34, 22, 12], 2.4, 0.78);
            drawLine3D(ctx, cam, [110, 289, z0], [110, 289, z1], [34, 22, 12], 2.4, 0.78);

            // 下側床(y=0)：暗い重厚な木板張り廊下（障子の光がうっすら反射）
            drawTexturedGroundStrip(ctx, cam, -225, 225, 0, z0, z1, [44, 28, 16], {
                material: 'wood_planks',
                materialAlpha: 0.48,
                curbWidth: 14,
                curbRGB: [28, 18, 10]
            });
            // 床面に映り込む障子の黄金／蒼光反射
            const refRGB = isBlueWindow ? [68, 112, 235] : [242, 168, 48];
            drawQuad3D(ctx, cam, [-210, 1.2, z0 + 18], [-95, 1.2, z0 + 18], [-95, 1.2, z1 - 18], [-210, 1.2, z1 - 18], refRGB, 1.0, 0.14);
            drawQuad3D(ctx, cam, [95, 1.2, z0 + 18], [210, 1.2, z0 + 18], [210, 1.2, z1 - 18], [95, 1.2, z1 - 18], refRGB, 1.0, 0.14);

            // 左右の壁：原作5-6面の「黄金に光る障子格子」＆「蒼い夜空が見える竹格子窓」
            const sides = [-1, 1];
            for (let si = 0; si < 2; si++) {
                const s = sides[si];
                const wx = s * 225;
                const faceIn = -s;

                // 重厚な暗木柱と鴨居・長押（なげし）
                drawBox3D(ctx, cam, wx - 12, 0, z0 - 8, wx + 12, 290, z0 + 12, [34, 20, 12], {
                    material: 'wood_planks', materialAlpha: 0.36, strokeRGB: [18, 10, 6]
                });
                drawBox3D(ctx, cam, wx - 8, 226, z0, wx + 8, 246, z1, [42, 24, 14]);
                drawBox3D(ctx, cam, wx - 8, 0, z0, wx + 8, 48, z1, [32, 18, 10]);

                // 欄間（らんま：上部246..288）
                drawQuad3D(ctx, cam,
                    [wx + faceIn * 2, 246, z0 + 12], [wx + faceIn * 2, 246, z1 - 12],
                    [wx + faceIn * 2, 286, z1 - 12], [wx + faceIn * 2, 286, z0 + 12],
                    isBlueWindow ? [46, 86, 88] : [76, 52, 24], 0.92, 0.9, [26, 16, 10], { material: 'shoji', materialAlpha: 0.42 }
                );

                // メイン障子／格子窓パネル（y=48..226）
                const winRGB = isBlueWindow ? [82, 122, 242] : [248, 178, 44];
                const frameCol = isBlueWindow ? [36, 78, 66] : [58, 30, 12];
                drawQuad3D(ctx, cam,
                    [wx + faceIn * 2, 48, z0 + 14], [wx + faceIn * 2, 48, z1 - 14],
                    [wx + faceIn * 2, 226, z1 - 14], [wx + faceIn * 2, 226, z0 + 14],
                    winRGB, 1.04, 0.94, frameCol, { material: 'shoji', materialAlpha: 0.64 }
                );
                // 障子の腰板・縦格子アクセント
                drawLine3D(ctx, cam, [wx + faceIn * 3, 136, z0 + 14], [wx + faceIn * 3, 136, z1 - 14], frameCol, 2.2, 0.85);

                // 天井から吊り下がる白い円筒形の和風吊り行灯（原作5-6面の特徴的照明）
                const lx = s * 176;
                drawLine3D(ctx, cam, [lx, 290, zMid], [lx, 246, zMid], [44, 28, 18], 2.0, 0.85);
                drawCylinder3D(ctx, cam, lx, 206, 246, zMid, 12, 12, 8, [238, 242, 250], {
                    capTop: true, capRGB: [46, 30, 20], strokeRGB: [68, 52, 40]
                });
                drawStamp3D(ctx, cam, 'lantern_glow', lx, 226, zMid, 52, 56, {
                    rgb: isBlueWindow ? [186, 218, 255] : [255, 226, 152],
                    alpha: 0.68
                });
            }
        });

        // 逆さ城内を漂う小槌の金塵と紫の妖気粒子
        drawWorldParticles(ctx, cam, t, {
            count: 34,
            vx: 8,
            vy: 28,
            vz: -24,
            sway: 14,
            size: 4.4,
            shape: 'circle',
            glow: true,
            rgb: [255, 208, 96],
            rgb2: [168, 138, 255],
            alpha: 0.72
        });
    }

    // =========================================================================
    // 5. 紺珠伝4/6面: 月の都・中華風白壁丸窓回廊と静かの海 (lunar_capital)
    //    原作リスペクト：青白い月光に照らされた石畳・朱柱・丸窓・瓦屋根の回廊を斜め上から見下ろし、
    //    上空には静かの海と輝く地球が広がる
    // =========================================================================
    function drawBlueEarth(ctx, W, H, t, ex, ey, er) {
        // 地球の淡い青〜桃紫のコロナ
        drawAtmosphericGlow(ctx, ex, ey, er * 2.5, [
            [0, 'rgba(135, 212, 255, 0.44)'],
            [0.45, 'rgba(182, 112, 225, 0.22)'],
            [1, 'rgba(18, 28, 72, 0)']
        ]);

        ctx.save();
        if (typeof ctx.beginPath === 'function') {
            ctx.beginPath();
            ctx.arc(ex, ey, er, 0, Math.PI * 2);
            if (typeof ctx.clip === 'function') ctx.clip();
        }
        const ocean = ctx.createRadialGradient(ex - er * 0.3, ey - er * 0.28, er * 0.1, ex, ey, er * 1.12);
        safeStop(ocean, 0, '#72d2ff');
        safeStop(ocean, 0.48, '#2878e8');
        safeStop(ocean, 0.85, '#12368a');
        safeStop(ocean, 1, '#061242');
        ctx.fillStyle = ocean;
        ctx.fillRect(ex - er - 2, ey - er - 2, er * 2 + 4, er * 2 + 4);

        const spin = t * 0.045;
        for (let i = 0; i < 6; i++) {
            const lon = modPos(hashIdx(i, 71) * Math.PI * 2 + spin, Math.PI * 2) - Math.PI;
            if (Math.abs(lon) > Math.PI * 0.55) continue;
            const lat = (hashIdx(i, 72) - 0.5) * 1.15;
            const lx = ex + Math.sin(lon) * Math.cos(lat) * er * 0.82;
            const ly = ey + Math.sin(lat) * er * 0.82;
            const rx = er * (0.22 + hashIdx(i, 73) * 0.22) * Math.cos(lon);
            const ry = er * (0.14 + hashIdx(i, 74) * 0.14);
            ctx.fillStyle = 'rgba(84, 186, 134, 0.72)';
            ctx.beginPath();
            safeEllipse(ctx, lx, ly, Math.abs(rx), ry, hashIdx(i, 75) * 1.2);
            ctx.fill();
        }
        for (let c = 0; c < 6; c++) {
            const lon = modPos(hashIdx(c, 81) * Math.PI * 2 + spin * 1.35, Math.PI * 2) - Math.PI;
            if (Math.abs(lon) > Math.PI * 0.58) continue;
            const lat = (hashIdx(c, 82) - 0.5) * 1.35;
            const cx = ex + Math.sin(lon) * er * 0.85;
            const cy = ey + Math.sin(lat) * er * 0.84;
            ctx.fillStyle = 'rgba(246, 252, 255, 0.52)';
            ctx.beginPath();
            safeEllipse(ctx, cx, cy, er * 0.38 * Math.cos(lon), er * 0.085, -0.15);
            ctx.fill();
        }
        const shadow = ctx.createRadialGradient(ex - er * 0.35, ey - er * 0.3, er * 0.38, ex + er * 0.15, ey + er * 0.15, er * 1.15);
        safeStop(shadow, 0, 'rgba(0,0,0,0)');
        safeStop(shadow, 0.72, 'rgba(6, 14, 46, 0.34)');
        safeStop(shadow, 1, 'rgba(4, 8, 28, 0.86)');
        ctx.fillStyle = shadow;
        ctx.fillRect(ex - er - 2, ey - er - 2, er * 2 + 4, er * 2 + 4);
        ctx.restore();
    }

    function drawLunarCapital(ctx, W, H, t) {
        // 原作紺珠伝4面＆6面リスペクト：斜め上から見下ろす青白い月光の中華風回廊（朱柱＋白壁＋丸窓＋瓦屋根）と、
        // 左奥に広がる静かの海＆青い地球
        const cam = makeCamera(W, H, {
            x: -55 + Math.sin(t * 0.25) * 16,
            y: 238,
            z: t * 138,
            yaw: 0.06,
            pitch: -0.26,
            roll: -0.15 + Math.sin(t * 0.22) * 0.018,
            horizonY: H * 0.22,
            fogRGB: [32, 46, 108],
            fogDist: 1320,
            maxZ: 2300
        });

        // 紺珠伝の深宇宙〜月光青紫グラデーション
        drawSkyGrad(ctx, W, H, [
            [0, '#040920'],
            [0.16, '#14245e'],
            [0.25, '#3b4a96'],
            [0.52, '#223274'],
            [1, '#0c1640']
        ]);
        drawStars(ctx, W, H * 0.26, t, 64, '#f0f6ff', 1.15);

        // 上空左寄りに堂々と輝く地球（回廊の邪魔をしない絶好の位置）
        drawBlueEarth(ctx, W, H, t, W * 0.32, H * 0.13, Math.min(W, H) * 0.095);

        // 地平線の淡い桃紫〜青白グロー（静かの海の照り返し）
        drawHorizonGlow(ctx, W, cam.horizonY, 'rgba(182, 148, 245, 0.36)', 'rgba(32, 46, 108, 0)', W * 0.65);

        // 左側に広がる静かの海＋青白い月光の大理石広場ベース
        drawWaterPlane(ctx, cam, -6, 1800, [26, 42, 102], [186, 168, 252], t, {
            steps: 10,
            reflectWidth: 260,
            waveSpeed: 1.5,
            waveAmp: 14,
            material: 'water_ripples',
            materialAlpha: 0.32
        });

        const spacing = 215;
        forWorldSlices(cam, spacing, 45, (idx, wz) => {
            const z0 = wz;
            const z1 = wz + spacing;
            const zMid = wz + spacing * 0.5;

            // 月光に照らされた青白石畳の大広場（弾が見やすい適度な明度に制御）
            drawTexturedGroundStrip(ctx, cam, -210, 120, 2, z0, z1, [104, 122, 178], {
                material: 'marble_veins',
                materialAlpha: 0.34,
                materialScale: 0.55,
                curbWidth: 12,
                curbRGB: [158, 174, 224],
                centerWidth: 96,
                centerRGB: [88, 106, 164],
                centerMaterial: 'stone_tiles',
                centerMaterialAlpha: 0.28
            });
            // 広場に淡く映り込む桃紫の月光反射
            drawQuad3D(ctx, cam, [-140, 2.8, z0 + 24], [65, 2.8, z0 + 24], [65, 2.8, z1 - 24], [-140, 2.8, z1 - 24], [198, 142, 238], 1.0, 0.14);

            // ★原作紺珠伝4面の象徴：右側に連なる「中華風の白壁・朱柱・丸窓・瓦屋根」の月の都回廊
            const colX = 82;
            const wallX = 148;
            // 白亜の回廊基壇
            drawBox3D(ctx, cam, colX - 16, 0, z0, 320, 18, z1, [142, 152, 194], {
                material: 'marble_veins', materialAlpha: 0.28, topRGB: [168, 176, 214], skipBack: true, skipBottom: true
            });
            // 回廊の白壁本体（淡い月光の青白）
            drawBox3D(ctx, cam, wallX, 18, z0 + 4, 320, 184, z1 - 4, [152, 162, 204], {
                material: 'marble_veins', materialAlpha: 0.24, strokeRGB: [98, 112, 158], skipBack: true, skipBottom: true
            });
            // 白壁に並ぶ中華風の「丸窓」（内側から淡い桃紫〜青白に光る）
            drawStamp3D(ctx, cam, 'lantern_glow', wallX - 4, 114, zMid, 68, 68, {
                rgb: [215, 162, 255],
                alpha: 0.72
            });
            drawRing3D(ctx, cam, wallX - 2, 114, zMid, 30, 0, 0, 18, [86, 52, 102], 3.2, 0.88);
            // 丸窓内の十字格子
            drawLine3D(ctx, cam, [wallX - 3, 84, zMid], [wallX - 3, 144, zMid], [96, 66, 118], 1.6, 0.72);
            drawLine3D(ctx, cam, [wallX - 3, 114, zMid - 30], [wallX - 3, 114, zMid + 30], [96, 66, 118], 1.6, 0.72);

            // 手前に等間隔で立ち並ぶ鮮烈な「朱色の円柱」（丸窓を隠さないようスライス両端に配置）
            drawCylinder3D(ctx, cam, colX, 18, 184, z0 + 10, 10, 11, 6, [188, 42, 62], {
                strokeRGB: [122, 26, 44]
            });
            // 柱頭を繋ぐ朱色の軒桁
            drawBox3D(ctx, cam, colX - 10, 174, z0, colX + 10, 188, z1, [168, 38, 56]);

            // 回廊を覆う重厚な中華風反り瓦屋根（高速化 segs=3, zSegs=1 で <2ms を達成）
            drawSoriRoof3D(ctx, cam, 188, 184, zMid, 245, spacing + 6, 78, 22, [212, 198, 162], [86, 94, 128], {
                axis: 'z',
                segs: 3,
                zSegs: 1,
                sori: 0.22,
                material: 'kawara_tile',
                materialAlpha: 0.48,
                strokeRGB: [46, 52, 78]
            });
        });

        // 月都の空間に漂う清浄な光塵
        drawWorldParticles(ctx, cam, t, {
            count: 34,
            vx: 8,
            vy: -14,
            vz: -16,
            sway: 16,
            size: 4.2,
            shape: 'diamond',
            glow: true,
            rgb: [212, 232, 255],
            rgb2: [232, 178, 255],
            alpha: 0.72
        });
    }

    // =========================================================================
    // 6. 天空璋6面: 後戸の国・無数の扉と四季 (back_door)
    // =========================================================================
    const SEASONS = [
        {
            name: 'spring',
            rimRGB: [255, 172, 212],
            skyRGB: [232, 145, 192],
            groundRGB: [88, 158, 105],
            frameRGB: [112, 54, 74],
            stamp: 'sakura_cluster',
            stampRGB: [255, 195, 225]
        },
        {
            name: 'summer',
            rimRGB: [92, 245, 175],
            skyRGB: [52, 168, 228],
            groundRGB: [42, 148, 88],
            frameRGB: [42, 88, 62],
            stamp: 'pine_bough',
            stampRGB: [105, 235, 150]
        },
        {
            name: 'autumn',
            rimRGB: [255, 152, 68],
            skyRGB: [228, 118, 48],
            groundRGB: [142, 52, 28],
            frameRGB: [98, 46, 24],
            stamp: 'maple_cluster',
            stampRGB: [255, 132, 52]
        },
        {
            name: 'winter',
            rimRGB: [168, 235, 255],
            skyRGB: [96, 168, 226],
            groundRGB: [215, 236, 250],
            frameRGB: [44, 68, 96],
            stamp: 'cloud_bank',
            stampRGB: [235, 248, 255]
        }
    ];

    function drawPortalDoor3D(ctx, cam, cx, cy, cz, yaw, dw, dh, seasonIdx, t) {
        const sea = SEASONS[modPos(seasonIdx, 4)];
        const hw = dw * 0.5;
        const hh = dh * 0.5;

        // 光る四季の敷居リム (扉の外側を取り巻くオーラ縁)
        const rW = hw * 1.12;
        const rH = hh * 1.09;
        drawQuad3D(ctx, cam,
            rotYPoint(cx, cy, cz, -rW, -rH, 2, yaw),
            rotYPoint(cx, cy, cz, rW, -rH, 2, yaw),
            rotYPoint(cx, cy, cz, rW, rH, 2, yaw),
            rotYPoint(cx, cy, cz, -rW, rH, 2, yaw),
            sea.rimRGB, 1.08, 0.28, sea.rimRGB, { lineWidth: 1.8 }
        );

        // 扉の木枠ボディ
        drawQuad3D(ctx, cam,
            rotYPoint(cx, cy, cz, -hw, -hh, 0, yaw),
            rotYPoint(cx, cy, cz, hw, -hh, 0, yaw),
            rotYPoint(cx, cy, cz, hw, hh, 0, yaw),
            rotYPoint(cx, cy, cz, -hw, hh, 0, yaw),
            sea.frameRGB, 0.92, 0.96, [228, 192, 98], {
                material: 'wood_planks',
                materialAlpha: 0.42,
                lineWidth: 1.6
            }
        );

        // 扉の内側：明確な四季の景色（上半分＝季節の空、下半分＝季節の大地/景観）
        const iw = hw * 0.76;
        const ih = hh * 0.80;
        const splitY = -ih * 0.14;
        // 季節の空（上部）
        drawQuad3D(ctx, cam,
            rotYPoint(cx, cy, cz, -iw, splitY, -1.5, yaw),
            rotYPoint(cx, cy, cz, iw, splitY, -1.5, yaw),
            rotYPoint(cx, cy, cz, iw, ih, -1.5, yaw),
            rotYPoint(cx, cy, cz, -iw, ih, -1.5, yaw),
            sea.skyRGB, 1.04, 0.86, sea.rimRGB, { lineWidth: 1.2 }
        );
        // 季節の大地・景色（下部）
        drawQuad3D(ctx, cam,
            rotYPoint(cx, cy, cz, -iw, -ih, -1.5, yaw),
            rotYPoint(cx, cy, cz, iw, -ih, -1.5, yaw),
            rotYPoint(cx, cy, cz, iw, splitY, -1.5, yaw),
            rotYPoint(cx, cy, cz, -iw, splitY, -1.5, yaw),
            sea.groundRGB, 0.98, 0.90
        );

        // 扉内の季節モチーフスタンプ (春桜・夏緑陰・秋紅葉・冬雪景/氷輪)
        drawStamp3D(ctx, cam, sea.stamp, cx, cy + ih * 0.22, cz - 4, dw * 0.72, dw * 0.62, {
            rgb: sea.stampRGB,
            alpha: 0.94
        });
        if (sea.name === 'winter') {
            drawStamp3D(ctx, cam, 'magic_seal', cx, cy + ih * 0.26, cz - 5, dw * 0.48, dw * 0.48, {
                rgb: [195, 242, 255],
                alpha: 0.75,
                rot: t * 0.45
            });
        } else if (sea.name === 'summer') {
            // 夏の強い日差しポイント
            drawStamp3D(ctx, cam, 'lantern_glow', cx + iw * 0.35, cy + ih * 0.48, cz - 5, dw * 0.32, dw * 0.32, {
                rgb: [255, 245, 165],
                alpha: 0.82
            });
        }

        // 半開きに開いた3D障子・木製扉板
        const openAngle = yaw + 0.72 + Math.sin(t * 1.1 + seasonIdx) * 0.14;
        const hinge = rotYPoint(cx, cy, cz, -iw, 0, -2, yaw);
        const leafW = iw * 1.55;
        drawQuad3D(ctx, cam,
            rotYPoint(hinge[0], hinge[1], hinge[2], 0, -ih, 0, openAngle),
            rotYPoint(hinge[0], hinge[1], hinge[2], leafW, -ih, 0, openAngle),
            rotYPoint(hinge[0], hinge[1], hinge[2], leafW, ih, 0, openAngle),
            rotYPoint(hinge[0], hinge[1], hinge[2], 0, ih, 0, openAngle),
            [72, 44, 28], 0.85, 0.92, [228, 190, 96], {
                material: 'shoji',
                materialAlpha: 0.34,
                lineWidth: 1.2
            }
        );
    }

    function drawBackDoor(ctx, W, H, t) {
        const cam = makeCamera(W, H, {
            x: Math.sin(t * 0.28) * 18,
            y: 142 + Math.cos(t * 0.24) * 12,
            z: t * 135,
            pitch: 0.01,
            roll: Math.sin(t * 0.19) * 0.018,
            horizonY: H * 0.42,
            fogRGB: [10, 20, 26],
            fogDist: 1120,
            maxZ: 2150
        });

        // 後戸の国の秘境虚空
        drawSkyGrad(ctx, W, H, [
            [0, '#040a0e'],
            [0.34, '#0c2026'],
            [0.52, '#16142c'],
            [1, '#04070c']
        ]);
        drawStars(ctx, W, H, t, 54, '#c8f5e8', 1.2);

        // 最奥の四季渦巻・隠岐奈の後戸後光
        const vortexZ = cam.z + 1650;
        drawAtmosphericGlow(ctx, W * 0.5, cam.horizonY, W * 0.44, [
            [0, 'rgba(130,245,195,0.28)'],
            [0.45, 'rgba(185,120,245,0.16)'],
            [1, 'rgba(10,20,26,0)']
        ]);
        for (let r = 0; r < 4; r++) {
            const sea = SEASONS[r];
            drawRing3D(ctx, cam, 0, 142, vortexZ - r * 40, 220 + r * 55, Math.PI * 0.5, t * 0.35 * (r & 1 ? -1 : 1) + r, 28, sea.rimRGB, 2.4, 0.45);
        }

        drawLightShafts(ctx, W, H, {
            count: 4,
            x: W * 0.5,
            spread: W * 0.74,
            rgb: [125, 245, 195],
            alpha: 0.08,
            angle: 0.16,
            y0: 0,
            y1: H * 0.85
        }, t);

        // 無数の四季の扉の螺旋回廊
        const spacing = 190;
        forWorldSlices(cam, spacing, 45, (idx, wz) => {
            // 外周リングの補助扉（奥行き感）
            for (let b = 0; b < 2; b++) {
                const bgAng = idx * 0.95 + b * Math.PI + 0.5;
                const bgRad = 365 + hashIdx(idx, b + 20) * 95;
                const bx = Math.cos(bgAng) * bgRad;
                const by = 142 + Math.sin(bgAng) * bgRad * 0.68;
                const bz = wz + 110;
                drawPortalDoor3D(ctx, cam, bx, by, bz, -Math.cos(bgAng) * 0.35, 62, 102, idx + b + 2, t);
            }

            // 手前側の螺旋回廊3枚の扉
            const doorsInSlice = 3;
            for (let k = 0; k < doorsInSlice; k++) {
                const angle = idx * 0.62 + (k * Math.PI * 2) / doorsInSlice;
                const rad = 215 + hashIdx(idx, k + 5) * 76;
                const dx = Math.cos(angle) * rad;
                const dy = 142 + Math.sin(angle) * rad * 0.74;
                const dz = wz + hashIdx(idx, k + 9) * 55;
                const yaw = -Math.cos(angle) * 0.42;
                drawPortalDoor3D(ctx, cam, dx, dy, dz, yaw, 78, 130, idx + k, t);
            }
        });

        // 四季のパーティクル
        drawWorldParticles(ctx, cam, t, {
            count: 14, vx: 16, vy: -28, vz: 0, sway: 16, size: 5.2,
            shape: 'petal', glow: true, rgb: [255, 165, 208], alpha: 0.78
        });
        drawWorldParticles(ctx, cam, t + 1.3, {
            count: 14, vx: -14, vy: 24, vz: 0, sway: 14, size: 4.5,
            shape: 'diamond', glow: true, rgb: [98, 248, 172], alpha: 0.78
        });
        drawWorldParticles(ctx, cam, t + 2.6, {
            count: 14, vx: 20, vy: -32, vz: 0, sway: 18, size: 5.2,
            shape: 'leaf', glow: true, rgb: [252, 148, 64], alpha: 0.78
        });
        drawWorldParticles(ctx, cam, t + 3.9, {
            count: 14, vx: 6, vy: -24, vz: 0, sway: 10, size: 4.4,
            shape: 'diamond', glow: true, rgb: [165, 235, 255], alpha: 0.78
        });
    }

    Core.registerRenderer('makai_esoteria', drawMakaiEsoteria);
    Core.registerRenderer('hokkai', drawHokkai);
    Core.registerRenderer('divine_spirit_mausoleum', drawDivineSpiritMausoleum);
    Core.registerRenderer('shining_needle_castle', drawShiningNeedleCastle);
    Core.registerRenderer('lunar_capital', drawLunarCapital);
    Core.registerRenderer('back_door', drawBackDoor);
})(typeof window !== 'undefined' ? window : globalThis);
