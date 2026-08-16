/**
 * ボス情報データの一覧 (bossdata.js)
 * 
 * ボスの名前、肩書、説明、テーマカラー、および使用するスペル一覧（js/bossdanmakudata.js に定義したスペルIDの配列）を定義します。
 * 通常 → スペカ → 通常 → スペカ の構成となっています。
 */
const bossList = [
    {
        id: "boss_reimu",
        name: "博麗 霊夢",
        color: "#ff3366",
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
