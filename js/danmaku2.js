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
        hp: 1000,
        duration: 25,
        maxMisses: 3,
        x_offset: 0,
        y_offset: 0,
        despawnTime: 1.5,
        emitterScript: `
while (true) {
    aimAtTarget()
    spawnRing("normal", "#33ccff", 180, angle, 6, 0, 0, 8, "star", "relative", 6)
    spawnRing("normal", "#ff3388", 140, angle + 30, 6, 0, 0, 8, "star", "relative", 6)
    wait(0.18)
}
        `,
        bulletScript: `
speed = 180
if(color!=#ffdd00) {
    if (isBounced) {
        color = #ffdd00
        aimAtTarget()
    }
}
        `,
        magicCircleScript: ``
    },{
    difficulty: "Hard",       // 難易度: EASY, NORMAL, HARD, LUNATIC, EXTRA
    name: "天秤「光魔のペンデュラム」",           // 弾幕名・スペルカード名
    desc: "ペンデュラムって天秤って意味なんだね...",
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
    desc: "やっぱZUNの弾幕パクっただけあってそこそこおもろい。",
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
},{
    difficulty: "NORMAL",       // 難易度: EASY, NORMAL, HARD, LUNATIC, EXTRA
    name: "「タケミナカタ再臨の儀」",           // 弾幕名・スペルカード名
    desc: "どうも東風谷早苗です",
    hp: 3000,                   // ボスHP（ショットで削って撃破可能）
    duration: 60,               // 制限時間（秒）
    maxMisses: 3,               // 許容被弾回数（"inf"で無限）
    x_offset: 0,                // 出現位置の横オフセット (画面中央=0)
    y_offset: 0,                // 出現位置の縦オフセット
    despawnTime: 0.1,           // 画面外に出てから弾が消滅するまでの秒数
    emitterScript: `
while (true) {
    ey = 250
    wait(0.5)
    count = 0
    s = 0
    for (let i = 0; i < 5; i++) {
        count += 1
        spawnBullet("normal", "#ff3333", 0, angle + 180, 0, 0, 0, "redbig", "relative", "3")
        spawnBullet("normal", "#ffffff", 0, angle + 180, 0, 0, 0, "redbig", "relative", "3")
        spawnBullet("normal", "#fffff2", 0, -angle - 180, 0, 0, 0, "redbig", "relative", "3")
        angle += 72 * 3
        wait(0.0167 * 11)
        s += 11
    }
    wait(5)
    angle += 15
}
    `,
    bulletScript: `
if (color==#ff3333) {
    advance(200)
    angle += 180
    angle += 72 / 4
    for (let i = 0; i < 10; i++) {
        for (let i = 0; i < 2; i++) {
            s2angle = -90
            for (let i = 0; i < 5; i++) {
                s2angle += 72
                spawnBullet("normal", "#ff3332", 0, angle, 0, 0, 9, "goldbig", "relative", "3")
            }
            advance(20)
            spangle -= -9.2
        }
        wait(0.0167)
        s += 1
    }
    y = -8000
}
if (color==#ffffff) {
    advance(100)
    angle += 180
    angle += 72 / 4
    for (let i = 0; i < 10; i++) {
        for (let i = 0; i < 2; i++) {
            s3angle = -90 + 60
            for (let i = 0; i < 3; i++) {
                s3angle += 120
                spawnBullet("normal", "#ffffff", 0, angle, 0, 0, 9, "bluebig", "relative", "6")
            }
            advance(10)
            spangle -= -9.2
        }
        wait(0.0167 * 2)
        s += 2
    }
    y = -8000
}
if (color==#fffff2) {
    advance(100)
    angle += 180
    angle += 72 / 4
    for (let i = 0; i < 10; i++) {
        for (let i = 0; i < 2; i++) {
            s3angle = 90 + 60
            for (let i = 0; i < 3; i++) {
                s3angle -= 120
                spawnBullet("normal", "#ffffff", 0, angle, 0, 0, 9, "bluebig", "relative", "6")
            }
            advance(10)
            spangle -= 9.2
        }
        wait(0.0167 * 2)
        s += 2
    }
    y = -8000
}
    `,
    magicCircleScript: `
once {
    motoangle = angle
    if (color==#ff3332) {
        angle = s2angle
    }
    if (color==#ffffff) {
        angle = s3angle
    }
}
if (frame == 65 - s) {
    if (color==#ff3332) {
        tween("speed", 0, 600, "seconds", 1)
        tween("speed", 600, 0, "seconds", 1)
    }
    if (color==#ffffff) {
        tween("speed", 0, 300, "seconds", 1)
        tween("speed", 300, 0, "seconds", 1)
    }
    wait(1)
    angle = motoangle
    if (color==#ff3332) {
        angle += spangle
    }
    if (color==#ffffff) {
        angle += spangle * 0.1
    }
    tween("speed", 0, 130, "seconds", 1)
}
    `
},{
    difficulty: "hard",       // 難易度: EASY, NORMAL, HARD, LUNATIC, EXTRA
    name: "「デストラクトオブアロー」",           // 弾幕名・スペルカード名
    desc: "そこそこ避けれそう。ちな俺は無理",
    hp: 1200,                   // ボスHP（ショットで削って撃破可能）
    duration: 60,               // 制限時間（秒）
    maxMisses: 3,               // 許容被弾回数（"inf"で無限）
    x_offset: 0,                // 出現位置の横オフセット (画面中央=0)
    y_offset: 0,                // 出現位置の縦オフセット
    despawnTime: 1.5,           // 画面外に出てから弾が消滅するまでの秒数
    emitterScript: `
while (true) {
    spd = 0
    wa = 0
    for (let i = 0; i < 20; i++) {
        spd += 50
        spawnRing("normal", "#ff3333", 100 + spd, angle, 18, 0, 0, 18, "yellowarrow", "relative", "6")
        angle += 1
    }
    angle += 14
    wait(0.0167 * 60)
    spd = 0
    wa = 0
    for (let i = 0; i < 20; i++) {
        spd += 50
        spawnRing("normal", "#ff3333", 100 + spd, angle, 18, 0, 0, 18, "yellowarrow", "relative", "6")
        angle -= 1
    }
    angle += 14
    wait(0.0167 * 60)
}
    `,
    bulletScript: `
once {
    tween("speed", speed, 0, "seconds", 1)
    advance(50)
    wait(1)
    imageTo("whitearrow")
}
if (frame == 120) {
    imageTo("yellowarrow")
    tween("speed", 400, 1000, "seconds", 1)
    angle += random(-11,11)
}
spriteAngle = angle
    `,
    magicCircleScript: `

    `
},{
    difficulty: "NORMAL",       // 難易度: EASY, NORMAL, HARD, LUNATIC, EXTRA
    name: "滅妖「妖怪圧殺陣」",           // 弾幕名・スペルカード名
    desc: "あまりにも最強すぎて妖怪であるあなたは一発触れただけで四肢がもげてしにます",
    hp: 1500,                   // ボスHP（ショットで削って撃破可能）
    duration: 40,               // 制限時間（秒）
    maxMisses: 0,               // 許容被弾回数（"inf"で無限）
    x_offset: 0,                // 出現位置の横オフセット (画面中央=0)
    y_offset: 0,                // 出現位置の縦オフセット
    despawnTime: 0.1,           // 画面外に出てから弾が消滅するまでの秒数
    emitterScript: `
while (true) {
    spawnRing("normal", "#ff3333", 200, angle * 546, 8, 0, 0, 8, "redkunai2", "relative", "3")
    spawnRing("normal", "#ff3333", 200, angle * 2.2, 8, 0, 0, 8, "redkunai2", "relative", "3")
    spawnRing("normal", "#ff3333", 200, -angle * 4562.2, 8, 0, 0, 8, "redkunai2", "relative", "3")
    angle += 1.345
    wait(0.0167 * 2)
}
    `,
    bulletScript: `

    `,
    magicCircleScript: `

    `
},{
    difficulty: "NORMAL",       // 難易度: EASY, NORMAL, HARD, LUNATIC, EXTRA
    name: "「緩急エンジン」",           // 弾幕名・スペルカード名
    desc: "乱数！",
    hp: 2000,                   // ボスHP（ショットで削って撃破可能）
    duration: 30,               // 制限時間（秒）
    maxMisses: 3,               // 許容被弾回数（"inf"で無限）
    x_offset: 0,                // 出現位置の横オフセット (画面中央=0)
    y_offset: 0,                // 出現位置の縦オフセット
    despawnTime: 1.5,           // 画面外に出てから弾が消滅するまでの秒数
    emitterScript: `
while (true) {
    for (let i = 0; i < 10; i++) {
        spawnBullet("normal", "#ff3333", 200, angle, 0, 0, 10, "redgun", "relative", "5")
        spawnBullet("normal", "#ff3333", 200, 180+angle, 0, 0, 10, "redgun", "relative", "5")
    }
    angle += 15
    wait(0.0167*3)
}
    `,
    bulletScript: `
once {
    angle += random(-cardSecond,cardSecond)
    speed += random(-cardSecond,cardSecond * 2)
    spriteAngle = angle
}
    `,
    magicCircleScript: `

    `
},{
    difficulty: "NORMAL",       // 難易度: EASY, NORMAL, HARD, LUNATIC, EXTRA
    name: "土着神「ミシャグジさま改」",           // 弾幕名・スペルカード名
    desc: "うおｗこんなんでZUNさんの弾幕の改善を名乗るとかきちーｗって思うかもしんないすけどこれ改善じゃなくて改造なんで。",
    hp: 3000,                   // ボスHP（ショットで削って撃破可能）
    duration: 120,               // 制限時間（秒）
    maxMisses: 4,               // 許容被弾回数（"inf"で無限）
    x_offset: 0,                // 出現位置の横オフセット (画面中央=0)
    y_offset: 0,                // 出現位置の縦オフセット
    despawnTime: 3,           // 画面外に出てから弾が消滅するまでの秒数
    emitterScript: `
while (true) {
    ey = 300
    angle = random(0,360)
    muki = 1
    spawnRingResist("normal", "#ff3333", 500, angle, 72, 0, 0, 8, "yellowgun", "relative", "4")
    muki = -1
    spawnRingResist("normal", "#ff3333", 500, angle + 2.5, 72, 0, 0, 8, "yellowgun", "relative", "4")
    wait(0.167 * 8)
}
while (true) {
    wait(0.0167)
    while (true) {
        wait(0.167 * 8)
        muki = 0
        aimAtTarget()
        spd = 0
        for (let i = 0; i < 4; i++) {
            spawnRingResist("normal", "#33ff88", 300 + spd, angle, 24, 0, 0, 20, "light", "relative", "10")
            spd += 50
        }
    }
}
    `,
    bulletScript: `
    once{
    advance(20)
    }
if (frame == 20) {
    tween("speed", speed, 100, "seconds", 0.6)
    tweenAngle(angle, angle + 80 * muki, "seconds", 0.6)
    for (let i = 0; i < 60; i++) {
        spriteAngle = angle
        wait(0.01)
    }
    tweenAngle(angle, angle + 20 * muki, "seconds", 5)
}
spriteAngle = angle
    `,
    magicCircleScript: `

    `
},{
    difficulty: "NORMAL",       // 難易度: EASY, NORMAL, HARD, LUNATIC, EXTRA
    name: "正体不明「三種の幻想飛行物体」",           // 弾幕名・スペルカード名
    desc: "てかマジで、あの、星蓮船exラスペ落ちほんとに悔しい。残0ボム1パワー1で突入した割には最終形態まで削ってそれも半分くらいまで削ったからマジで惜しい。悔しすぎる。焦ったな～...",
    hp: 8000,                   // ボスHP（ショットで削って撃破可能）
    duration: 120,               // 制限時間（秒）
    maxMisses: 3,               // 許容被弾回数（"inf"で無限）
    x_offset: 0,                // 出現位置の横オフセット (画面中央=0)
    y_offset: 0,                // 出現位置の縦オフセット
    despawnTime: 1.5,           // 画面外に出てから弾が消滅するまでの秒数
    emitterScript: `
while (true) {
    if (enemyHp == 6000..8000) {
        spd = 0
        aimAtTarget()
        for (let i = 0; i < 18; i++) {
            spawnWay("normal", "#ff3333", 200 + spd, angle + 90, 2, 180, 0, 0, 9, "blueamulet", "relative", "5")
            spd += 15
            angle += 5
        }
        for (let i = 0; i < 18; i++) {
            spawnWay("normal", "#ff3333", 200 + spd, angle + 90, 2, 180, 0, 0, 9, "blueamulet", "relative", "5")
            spd -= 15
            angle += 5
        }
        wait(0.167 * 2)
    }
}
while (true) {
    if (enemyHp == 4000..6000) {
        spd = 0
        angle = 0 + kaku
        for (let i = 0; i < 9; i++) {
            spawnWay("normal", "#ff3333", 200 + spd, angle, 2, 180, 0, 0, 9, "redamulet", "relative", "5")
            spawnWay("normal", "#ff3333", 200 + spd, -angle, 2, 180, 0, 0, 9, "redamulet", "relative", "5")
            spd += 30
            angle += 10
        }
        for (let i = 0; i < 9; i++) {
            spawnWay("normal", "#ff3333", 200 + spd, angle, 2, 180, 0, 0, 9, "redamulet", "relative", "5")
            spawnWay("normal", "#ff3333", 200 + spd, -angle, 2, 180, 0, 0, 9, "redamulet", "relative", "5")
            spd -= 30
            angle += 10
        }
        kaku += 5
        wait(0.167 * 2)
    }
}
while (true) {
    if (enemyHp == 2000..4000) {
        spd = 0
        aimAtTarget()
        for (let i = 0; i < 18; i++) {
            spawnWay("normal", "#ff3333", 200 + spd, angle, 2, 180, 0, 0, 9, "greenamulet", "relative", "5")
            spd += 15
            angle += 5
        }
        for (let i = 0; i < 18; i++) {
            spawnWay("normal", "#ff3333", 200 + spd, angle, 2, 180, 0, 0, 9, "greenamulet", "relative", "5")
            spd -= 15
            angle += 5
        }
        wait(0.167)
    }
}
while (true) {
    if (enemyHp == 0..2000) {
        spd = 0
        angle = 0 + kaku
        for (let i = 0; i < 9; i++) {
            spawnWay("normal", "#ff3333", 200 + spd, angle, 1, 180, 0, 0, 9, "redamulet", "relative", "5")
            spawnWay("normal", "#ff3333", 200 + spd, angle + 120, 1, 180, 0, 0, 9, "blueamulet", "relative", "5")
            spawnWay("normal", "#ff3333", 200 + spd, angle + 240, 1, 180, 0, 0, 9, "greenamulet", "relative", "5")
            spd += 15
            angle += 6
        }
        for (let i = 0; i < 9; i++) {
            spawnWay("normal", "#ff3333", 200 + spd, angle, 1, 180, 0, 0, 9, "redamulet", "relative", "5")
            spawnWay("normal", "#ff3333", 200 + spd, angle + 120, 1, 180, 0, 0, 9, "blueamulet", "relative", "5")
            spawnWay("normal", "#ff3333", 200 + spd, angle + 240, 1, 180, 0, 0, 9, "greenamulet", "relative", "5")
            spd -= 15
            angle += 6.6
        }
        kaku += 5
        wait(0.167)
    }
}
while (true) {
wait(5)
    idoux = 368 + random(-150,150)
    idouy = 200 + random(-100,100)
    tween("ex", ex, idoux, "seconds", 1, "easeOut")
    tween("ey", ey, idouy, "seconds", 1, "easeOut")
}
    `,
    bulletScript: `
once {
    angle += random(-5,5)
}
spriteAngle = angle
    `,
    magicCircleScript: `

    `
},{
    difficulty: "NORMAL",       // 難易度: EASY, NORMAL, HARD, LUNATIC, EXTRA
    name: "夢符「妖怪絶対殺害陣」",           // 弾幕名・スペルカード名
    desc: "たまには短めのスペルも作る",
    hp: 800,                   // ボスHP（ショットで削って撃破可能）
    duration: 40,               // 制限時間（秒）
    maxMisses: 3,               // 許容被弾回数（"inf"で無限）
    x_offset: 0,                // 出現位置の横オフセット (画面中央=0)
    y_offset: 0,                // 出現位置の縦オフセット
    despawnTime: 1.5,           // 画面外に出てから弾が消滅するまでの秒数
    emitterScript: `
while (true) {
    spx = 0
    for (let i = 0; i < 30; i++) {
        spawnBullet("normal", "#ff3333", 200, 90, spx + 10, 0, 10, "purpleamulet", "absolute", "3")
        spx += 30
    }
    r = random(0,500)
    spawnRing("normal", "#ff3333", 200, r, 100, 0, 0, 10, "redamulet", "relative", "3")
    spawnRing("normal", "#ff3333", 200, r, 36, 300, 0, 10, "orangeamulet", "relative", "3")
    spawnRing("normal", "#ff3333", 200, r, 36, -300, 0, 10, "yellowamulet", "relative", "3")
    spawnRing("normal", "#ff3333", 200, r, 36, 350, 200, 10, "greenamulet", "relative", "3")
    spawnRing("normal", "#ff3333", 200, r, 36, -350, 200, 10, "blueamulet", "relative", "3")
    wait(1)
}
    `,
    bulletScript: `

    `,
    magicCircleScript: `

    `
},{
    difficulty: "NORMAL",       // 難易度: EASY, NORMAL, HARD, LUNATIC, EXTRA
    name: "「おｗ」",           // 弾幕名・スペルカード名
    desc: "名前未定",
    hp: 2000,                   // ボスHP（ショットで削って撃破可能）
    duration: 80,               // 制限時間（秒）
    maxMisses: 3,               // 許容被弾回数（"inf"で無限）
    x_offset: 0,                // 出現位置の横オフセット (画面中央=0)
    y_offset: 0,                // 出現位置の縦オフセット
    despawnTime: 5,           // 画面外に出てから弾が消滅するまでの秒数
    emitterScript: `
while (true) {
    ey = 358
    wait(1)
    muki = 1
    bullet({ "type": "life", "image": "b_star", "speed": 300, "angle": angle + 45, "radius": 35, "hitRadius": 40, "color": "#ffdd33", "way": 4, "destroyResist": true, "health": 100 })
    muki = -1
    bullet({ "type": "life", "image": "b_star", "speed": 300, "radius": 35, "hitRadius": 40, "color": "#ffdd33", "way": 4, "destroyResist": true, "health": 100 })
    wait(6)
}
    `,
    bulletScript: `
if (color==#ffdd33) {
    once {
        tweenAngle(angle, angle + 180, "seconds", 1)
        for (let i = 0; i < 60; i++) {
            spriteAngle += 5 * muki
            wf(1)
        }
        tween("angle", angle, angle - 180, "seconds", 4)
    }
    spriteAngle += 5 * muki
    if (cardFrame == 5 * n) {
        bullet({ "type": "normal", "image": "redscale", "angle": angle - 90, "radius": 10, "hitRadius": 4, "destroyResist": true })
    }
    if (frame == 300) {
        y = -900000
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
