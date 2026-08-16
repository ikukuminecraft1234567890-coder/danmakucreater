/**
 * ボス情報データの一覧 (bossdata.js)
 * 
 * 各ボスの設定項目:
 * - id: ボス識別子 (string)
 * - name: ボス名 (string)
 * - color: テーマカラー (string)
 * - devOnly: 開発者のみ表示フラグ（boolean。trueにするとローカル環境や ?dev=1 以外では非表示になります）
 * - playerLives: 残機数（現在の機体を除くミス可能回数。0なら1度死んだら終了、2なら2回までミス可能。デフォルト: 2）
 * - spells: 使用するスペルIDの配列 (js/bossdanmakudata.js に定義)
 */
const bossList = [
    {
        id: "boss_reimu",
        name: "博麗 霊夢",
        color: "#ff3366",
        devOnly: false, // 公開ボス
        playerLives: 2,
        spells: [
            "spell_reimu_non_1",
            "spell_reimu_1",
            "spell_reimu_non_2",
            "spell_reimu_2"
        ]
    },
    {
        id: "boss_rush1",
        name: "ラッシュ1",
        color: "#ff3366",
        devOnly: true, // 開発中ボス（開発者以外非表示）
        playerLives: 3,
        spells: [
            "spell_rush1_non_1",
            "spell_rush1_1",
            "spell_rush1_non_2",
            "spell_rush1_2",
            "spell_rush1_non_3",
            "spell_rush1_3",
            "spell_rush1_non_4",
            "spell_rush1_4",
            "spell_rush1_non_5",
            "spell_rush1_5",
            "spell_rush1_non_6",
            "spell_rush1_6",
            "spell_rush1_non_7",
            "spell_rush1_7",
            "spell_rush1_non_8",
            "spell_rush1_8",
            "spell_rush1_non_9",
            "spell_rush1_non_10",
        ]
    }
];

if (typeof window !== 'undefined') {
    window.bossList = bossList;
}
