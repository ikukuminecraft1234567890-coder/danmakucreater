/**
 * ボス情報データの一覧 (bossdata.js)
 * 
 * 各ボスの設定項目:
 * - id: ボス識別子 (string)
 * - name: ボス名 (string)
 * - color: テーマカラー (string)
 * - playerLives: 残機数（現在の機体を除くミス可能回数。0なら1度死んだら終了、2なら2回までミス可能。デフォルト: 2）
 * - spells: 使用するスペルIDの配列 (js/bossdanmakudata.js に定義)
 */
const bossList = [
    {
        id: "boss_reimu",
        name: "博麗 霊夢",
        color: "#ff3366",
        playerLives: 2, // 残機2（2回ミス可能）
        spells: [
            "spell_reimu_non_1",
            "spell_reimu_1",
            "spell_reimu_non_2",
            "spell_reimu_2"
        ]
    }
];

if (typeof window !== 'undefined') {
    window.bossList = bossList;
}
