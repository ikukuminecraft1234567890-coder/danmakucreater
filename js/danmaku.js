/**
 * 共有弾幕データの一覧
 * 
 * 弾幕を作ったら、以下のフォーマットでコピペして追加してください。
 * 
 * {
 *     name: "弾幕名",
 *     desc: "説明文や作成者名など",
 *     duration: 15,            // 制限時間（秒）
 *     x_offset: 0,             // 出現位置の横オフセット
 *     y_offset: 0,             // 出現位置の縦オフセット
 *     despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
 *     // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
 *     emitterScript: `
 *         // コア挙動の独自コード
 *     `,
 *     bulletScript: `
 *         // 弾挙動の独自コード
 *     `,
 *     magicCircleScript: `
 *         // 子弾挙動の独自コード（任意）
 *     `
 * }
 */
const sharedDanmakuList = [
    {
        name: "【サンプル】スパイラルレイン",
        desc: "全方位に螺旋を描く弾を発射します（サンプル）",
        duration: 15,
        x_offset: 0,
        y_offset: 0,
        despawnTime: 1.5,
        emitterScript: `
let r = 0;
while (true) {
    aimAtTarget()
    spawnRing("normal", "#33ffff", 180, r, 8, 0, 0, 6, "none", "relative")
    r += 15
    angle = r
    wait(0.1)
}
        `,
        bulletScript: `
speed = 180
bounce()
if (isBounced) {
    aimAtTarget()
    color = "#ff33ff"
}
        `,
        magicCircleScript: ``
    },
    {
        name: "【サンプル】十字レーザー格子",
        desc: "設置レーザーによる格子状の弾幕を形成します（サンプル）",
        duration: 15,
        x_offset: 0,
        y_offset: 0,
        despawnTime: 2.0,
        emitterScript: `
let d = 0;
while (true) {
    warningTime = 1.0
    activeTime = 1.5
    laserWidth = 10
    
    for (let i = 0; i < 4; i++) {
        spawnBullet("laser", "#ff3333", 0, d + i * 90, 0, 0, 8, "none", "relative")
    }
    d += 12
    wait(1.2)
}
        `,
        bulletScript: `
// 設置レーザーなので弾の挙動は特になし
        `,
        magicCircleScript: ``
    }
];
