/**
 * 共有弾幕データの一覧 【Season 2 (S2)】
 * 
 * S2ではすべての弾幕にHPがあり、自機ショットで速攻・撃破が可能です。
 * 早く倒すほど高いタイムボーナス（最大10,000,000点）を獲得できます。
 * 
 * 弾幕を作ったら、以下のフォーマットでコピペして配列内に追加してください。
 * 
,{
    difficulty: "NORMAL",       // 難易度: EASY, NORMAL, HARD, LUNATIC, EXTRA
    name: "スペル名",           // 弾幕名・スペルカード名
    desc: "説明文や作成者名",
    hp: 2000,                   // ボスHP（ショットで削って撃破可能）
    duration: 30,               // 制限時間（秒）
    maxMisses: 3,               // 許容被弾回数（"inf"で無限）
    x_offset: 0,                // 出現位置の横オフセット (画面中央=0)
    y_offset: 0,                // 出現位置の縦オフセット
    despawnTime: 1.5,           // 画面外に出てから弾が消滅するまでの秒数
    emitterScript: `

    `,
    bulletScript: `

    `,
    magicCircleScript: `

    `
}
 */
const sharedDanmakuListS2 = [
    {
        difficulty: "NORMAL",
        name: "【S2サンプル】瞬光スパイラルバースト",
        desc: "S2開幕記念サンプル！HPを削って速攻を狙おう！",
        hp: 1400,
        duration: 25,
        maxMisses: 3,
        x_offset: 0,
        y_offset: 0,
        despawnTime: 1.5,
        emitterScript: `
while (true) {
    aimAtTarget()
    spawnRing("normal", "#33ccff", 180, angle, 12, 0, 0, 8, "star", "relative", 6)
    spawnRing("normal", "#ff3388", 140, angle + 15, 12, 0, 0, 8, "star", "relative", 6)
    angle += 7
    wait(0.18)
}
while (true) {
    wait(2.0)
    aimAtTarget()
    spawnWay("normal", "#ffcc00", 240, angle, 5, 40, 0, 0, 30, "kome", "relative", 6)
    wait(0.1)
    spawnWay("normal", "#ffaa00", 260, angle, 5, 40, 0, 0, 30, "kome", "relative", 6)
}
        `,
        bulletScript: `
speed = 180
bounce()
if (isBounced) {
    color = #ffdd00
    aimAtTarget()
}
        `,
        magicCircleScript: ``
    },{
    difficulty: "Hard",       // 難易度: EASY, NORMAL, HARD, LUNATIC, EXTRA
    name: "天秤「光魔のペンデュラム」",           // 弾幕名・スペルカード名
    desc: "説明文や作成者名",
    hp: 2000,                   // ボスHP（ショットで削って撃破可能）
    duration: 30,               // 制限時間（秒）
    maxMisses: 3,               // 許容被弾回数（"inf"で無限）
    x_offset: 0,                // 出現位置の横オフセット (画面中央=0)
    y_offset: 0,                // 出現位置の縦オフセット
    despawnTime: 1.5,           // 画面外に出てから弾が消滅するまでの秒数
    emitterScript: `
while (true) {
    once {
        spawnRingResist("normal", "#888888", 0, 0, 9, 0, 0, 20, "greenscale", "relative", "20")
        spawnRingResist("normal", "#000000", 0, 20, 9, 0, 0, 20, "yellowscale", "relative", "20")
    }
    spangle += 0.6
    wait(0.0167)
}
while (true) {
    wait(2.0)
    while (true) {
        spawnRing("normal", "#ff3333", 200, spangle, 9, 0, 0, 8, "goldbig", "relative", "3")
        spawnRing("normal", "#ffaa33", 200, -spangle + 20, 9, 0, 0, 9, "orangebig", "relative", "3")
        wait(0.0167 * 3)
    }
}
while (true) {
    tween("mukukakudo", 0, 180, "seconds", 3, "easeInOut")
    wait(1.5)
    tween("mukukakudo2", 180, 0, "seconds", 3, "easeInOut")
    wait(1.5)
    tween("mukukakudo", 180, 0, "seconds", 3, "easeInOut")
    wait(1.5)
    tween("mukukakudo2", 0, 180, "seconds", 3, "easeInOut")
    wait(1.5)
}
    `,
    bulletScript: `
if (color==#888888) {
    once {
        tween("multf", 0, 7, "seconds", 0.6, "easeOut")
        tween("hitmultf", 0, 8, "seconds", 0.6, "easeOut")
        tween("multlr", 0, 0.8, "seconds", 0.6, "easeOut")
        advance(150)
    }
    advance(-150)
    angle += 0.6
    spriteAngle = angle
    advance(150)
}
if (color==#000000) {
    once {
        tween("multf", 0, 3, "seconds", 0.6, "easeOut")
        tween("hitmultf", 0, 6, "seconds", 0.6, "easeOut")
        tween("multlr", 0, 0.6, "seconds", 0.6, "easeOut")
        advance(90)
    }
    advance(-90)
    angle -= 0.6
    spriteAngle = angle
    advance(90)
}
if (color==#ff3333) {
    once {
        advance(180)
        angle = mukukakudo
        angle += random(-3,3)
    }
}
if (color==#ffaa33) {
    once {
        advance(90)
        angle = mukukakudo2
        angle += random(-3,3)
    }
}
    `,
    magicCircleScript: `

    `
},{
    difficulty: "easy",       // 難易度: EASY, NORMAL, HARD, LUNATIC, EXTRA
    name: "天祝「アポロ11」",           // 弾幕名・スペルカード名
    desc: "説明文や作成者名",
    hp: 2000,                   // ボスHP（ショットで削って撃破可能）
    duration: 50,               // 制限時間（秒）
    maxMisses: 3,               // 許容被弾回数（"inf"で無限）
    x_offset: 0,                // 出現位置の横オフセット (画面中央=0)
    y_offset: 0,                // 出現位置の縦オフセット
    despawnTime: 4,           // 画面外に出てから弾が消滅するまでの秒数
    emitterScript: `
while (true) {
    angle = -90
    kawaru = 0
    kawaru2 = 0.6012
    for (let i = 0; i < 36; i++) {
        spd = 0
        ang = 0
        for (let i = 0; i < 10; i++) {
            spawnWay("normal", "#ff3333", 0 + spd, angle + ang, 1, 15, 0, 0, 6, "reddiamond", "relative", "6")
            spawnWay("normal", "#3388ff", 200 + spd, angle + ang + 7.5, 1, 15, 0, 0, 6, "bluediamond", "relative", "6")
            spd += 20
            ang += -5
        }
        angle += 10
        kawaru += 0.0167
        kawaru2 -= 0.0167
    }
    wait(1.67)
    wait(1.67)
    for (let i = 0; i < 10; i++) {
        wait(0.167)
        spawnRing("normal", "#888888", 300, angle, 12, 0, 0, 30, "redbig2", "relative", "20")
        angle = random(0,360)
    }
}
    `,
    bulletScript: `
if (color!=#888888) {
    once {
        advance(50)
        tween("speed", speed, 1, "seconds", 2.5, "easeOut")
        wait(2.3)
        if (color==#ff3333) {
            wait(kawaru)
        }
        if (color==#3388ff) {
            wait(kawaru2)
        }
        imageTo("redeye")
        angle += 160
        if (color==#3388ff) {
            imageTo("blueeye")
            angle += 40
        }
        if (color==#ff3333) {
            wait(1 - kawaru)
        }
        if (color==#3388ff) {
            wait(1 - kawaru2)
        }
        speed = 200
    }
}
    `,
    magicCircleScript: `

    `
}
];

/**
,{
    difficulty: "NORMAL",       // 難易度: EASY, NORMAL, HARD, LUNATIC, EXTRA
    name: "スペル名",           // 弾幕名・スペルカード名
    desc: "説明文や作成者名",
    hp: 2000,                   // ボスHP（ショットで削って撃破可能）
    duration: 30,               // 制限時間（秒）
    maxMisses: 3,               // 許容被弾回数（"inf"で無限）
    x_offset: 0,                // 出現位置の横オフセット (画面中央=0)
    y_offset: 0,                // 出現位置の縦オフセット
    despawnTime: 1.5,           // 画面外に出てから弾が消滅するまでの秒数
    emitterScript: `

    `,
    bulletScript: `

    `,
    magicCircleScript: `

    `
}
 */


if (typeof window !== 'undefined') {
    window.sharedDanmakuListS2 = sharedDanmakuListS2;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { sharedDanmakuListS2 };
}
