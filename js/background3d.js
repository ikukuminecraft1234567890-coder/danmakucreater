/**
 * 2D疑似3D背景プリセットエンジン ディスパッチャ (js/background3d.js)
 * コアモジュール (js/bg3d/core.js) および各ステージパック (js/bg3d/pack_a.js..pack_d.js) に
 * 登録された26種類の東方風3D空間レンダラを統合・公開します。
 */
(function (global) {
    'use strict';

    const BG3D_PRESETS = [
        { id: 'none', label: 'なし（デフォルト黒背景）' },
        { id: 'misty_lake', label: '霧の湖風' },
        { id: 'scarlet_mansion', label: '紅魔館風' },
        { id: 'hakurei_shrine', label: '博麗神社風' },
        { id: 'netherworld_gate', label: '冥界へのゲート風' },
        { id: 'hakugyokurou', label: '白玉楼風' },
        { id: 'bamboo_forest', label: '迷いの竹林風' },
        { id: 'fake_moon', label: '偽の月風' },
        { id: 'youkai_mountain', label: '妖怪の山風' },
        { id: 'moriya_shrine', label: '守矢神社風' },
        { id: 'old_hell', label: '旧地獄風' },
        { id: 'mantle', label: 'マントル風' },
        { id: 'haru_no_minato', label: '春の湊に風' },
        { id: 'sky_ruin', label: 'スカイルーイン風' },
        { id: 'palanquin_ship', label: '幽霊客船風' },
        { id: 'makai_esoteria', label: '魔界地方都市エソテリア風' },
        { id: 'hokkai', label: '法界風' },
        { id: 'divine_spirit_mausoleum', label: '神霊廟風' },
        { id: 'shining_needle_castle', label: '輝針城風' },
        { id: 'lunar_capital', label: '月の都市風' },
        { id: 'back_door', label: '後戸風' },
        { id: 'hell', label: '地獄風' },
        { id: 'primate_spirit_garden', label: '霊長園風' },
        { id: 'lunar_rainbow_market', label: '誰のものでもない市場「月虹市場」風' },
        { id: 'sanctuary', label: '聖域風' },
        { id: 'pyramid', label: 'ピラミッド風' },
        { id: 'pyramid_sanctum', label: 'ピラミッドの神域風' }
    ];

    const BG3D_PRESET_MAP = {};
    for (let i = 0; i < BG3D_PRESETS.length; i++) {
        BG3D_PRESET_MAP[BG3D_PRESETS[i].id] = BG3D_PRESETS[i].label;
    }

    function getBg3dPresetLabel(id) {
        return BG3D_PRESET_MAP[id] || BG3D_PRESETS[0].label;
    }

    /**
     * 指定プリセットの2D疑似3D背景を描画します。
     * @returns {boolean} 描画したなら true、なし/OFF なら false
     */
    function drawPseudo3DBackground(ctx, presetId, W, H, timeSec, brightness01) {
        if (!ctx || !presetId || presetId === 'none') return false;
        const core = global.BG3DCore;
        const renderer = core && core.RENDERERS ? core.RENDERERS[presetId] : null;
        if (!renderer) return false;
        const b = (typeof brightness01 === 'number' && !isNaN(brightness01)) ? Math.max(0, Math.min(1, brightness01)) : 0.7;
        if (b <= 0.001) return false;

        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, W, H);
        ctx.clip();

        renderer(ctx, W, H, Number(timeSec) || 0);

        // 弾幕の視認性確保用暗めオーバーレイ
        const darkAlpha = 1 - b * 0.85;
        if (darkAlpha > 0.01) {
            ctx.fillStyle = `rgba(0, 0, 8, ${darkAlpha.toFixed(3)})`;
            ctx.fillRect(0, 0, W, H);
        }
        ctx.restore();
        return true;
    }

    global.BG3D_PRESETS = BG3D_PRESETS;
    global.getBg3dPresetLabel = getBg3dPresetLabel;
    global.drawPseudo3DBackground = drawPseudo3DBackground;
})(typeof window !== 'undefined' ? window : globalThis);
