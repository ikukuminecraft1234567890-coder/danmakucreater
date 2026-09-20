/**
 * 共有弾幕データの一覧 【Season 2 (S2)】
 * 
 * S2ではすべての弾幕にHPがあり、自機ショットで速攻・撃破が可能です。
 * 早く倒すほど高いタイムボーナス（最大10,000,000点）を獲得できます。
 * 
 * 弾幕を作ったら、以下のフォーマットでコピペして配列内に追加してください。
 * 
,{
    difficulty: "NORMAL",       // 難易度: EASY, NORMAL(NN OK), HARD(NM xor NB), LUNATIC(Not NM/NB)
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
    spawnRing("normal", "#33ccff", 180, angle, 6, 0, 0, 8, "star", "relative", 3)
    spawnRing("normal", "#ff3388", 140, angle + 30, 6, 0, 0, 8, "star", "relative", 3)
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
    difficulty: "Hard",       // 難易度: EASY, NORMAL(NN OK), HARD(NM xor NB), LUNATIC(Not NM/NB)
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
    difficulty: "easy",       // 難易度: EASY, NORMAL(NN OK), HARD(NM xor NB), LUNATIC(Not NM/NB)
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
    difficulty: "NORMAL",       // 難易度: EASY, NORMAL(NN OK), HARD(NM xor NB), LUNATIC(Not NM/NB)
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
    difficulty: "hard",       // 難易度: EASY, NORMAL(NN OK), HARD(NM xor NB), LUNATIC(Not NM/NB)
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
    difficulty: "NORMAL",       // 難易度: EASY, NORMAL(NN OK), HARD(NM xor NB), LUNATIC(Not NM/NB)
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
    difficulty: "NORMAL",       // 難易度: EASY, NORMAL(NN OK), HARD(NM xor NB), LUNATIC(Not NM/NB)
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
    difficulty: "NORMAL",       // 難易度: EASY, NORMAL(NN OK), HARD(NM xor NB), LUNATIC(Not NM/NB)
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
    difficulty: "lunatic",       // 難易度: EASY, NORMAL(NN OK), HARD(NM xor NB), LUNATIC(Not NM/NB)
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
    difficulty: "NORMAL",       // 難易度: EASY, NORMAL(NN OK), HARD(NM xor NB), LUNATIC(Not NM/NB)
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
    difficulty: "NORMAL",       // 難易度: EASY, NORMAL(NN OK), HARD(NM xor NB), LUNATIC(Not NM/NB)
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
},{
    difficulty: "NORMAL",       // 難易度: EASY, NORMAL(NN OK), HARD(NM xor NB), LUNATIC(Not NM/NB)
    name: "壁「ウォーターウォール」",           // 弾幕名・スペルカード名
    desc: "普通にやってておもろかったです、うん。ちなみに私は取得した",
    hp: 2000,                   // ボスHP（ショットで削って撃破可能）
    duration: 120,               // 制限時間（秒）
    maxMisses: 3,               // 許容被弾回数（"inf"で無限）
    x_offset: 0,                // 出現位置の横オフセット (画面中央=0)
    y_offset: 0,                // 出現位置の縦オフセット
    despawnTime: 1.5,           // 画面外に出てから弾が消滅するまでの秒数
    emitterScript: `
while (true) {
    for (let i = 0; i < 120; i++) {
        bullet({ "type": "normal", "image": "onryou_red", "radius": 20, "hitRadius": 10, "color": "#ffaa33", "way": 8 })
        angle += 31.3
        wf(1)
    }
    wf(120)
    fl = 0
    for (let i = 0; i < 50; i++) {
        wf(1)
        fl += 1
        for (let i = 0; i < 4; i++) {
            bullet({ "type": "life", "image": "bluenormal", "speed": 0, "hitRadius": 20, "color": "#6688ff", "way": 2, "health": 30 })
            angle += 3.6
        }
    }
    fl = 0
    wf(200)
}
    `,
    bulletScript: `
if (color==#6688ff) {
    once {
        hensuu = random(50,200)
        advance(hensuu)
        tween("radius", 20, 6, "seconds", 0.5)
        wait(0.5)
        imageTo("light")
        wf(55 - fl)
        hitRadius = 6
        angle += 180 + random(-18,18)
        tween("speed", speed, 20 + hensuu, "seconds", 1)
    }
}
if (isDestroyed) {
    enemyHp -= 2
}
    `,
    magicCircleScript: `

    `
},{
    difficulty: "hard",       // 難易度: EASY, NORMAL(NN OK), HARD(NM xor NB), LUNATIC(Not NM/NB)
    name: "兆候「フラワーストレート」",           // 弾幕名・スペルカード名
    desc: "https://x.com/cobrablitzz/status/2096907938376081639",
    hp: 2000,                   // ボスHP（ショットで削って撃破可能）
    duration: 50,               // 制限時間（秒）
    maxMisses: 3,               // 許容被弾回数（"inf"で無限）
    x_offset: 0,                // 出現位置の横オフセット (画面中央=0)
    y_offset: 0,                // 出現位置の縦オフセット
    despawnTime: 1.5,           // 画面外に出てから弾が消滅するまでの秒数
    emitterScript: `
while (true) {
    angle = random(0,360)
    spx = random(360,430)
    spy = random(50,800)
    bullet({ "type": "normal", "image": "kunai2", "radius": 12, "hitRadius": 6, "isAbsolute": true, "x": spx * 1.8, "y": spy, "way": 6, "destroyResist": true })
    wf(4)
}
    `,
    bulletScript: `
once {
    syoyou = random(0.5,2)
    syoyou2 = random(2,7)
    kakudo = random(-0.5,0.5)
    tween("speed", 0, 300, "seconds", syoyou)
}
if (x < 400) {
    once {
        tween("speed", 300, 0, "seconds", syoyou2)
    }
}
if (frame == 60..100) {
    angle += kakudo
    spriteAngle = angle
}
    `,
    magicCircleScript: `

    `
},{
    difficulty: "normal",       // 難易度: EASY, NORMAL(NN OK), HARD(NM xor NB), LUNATIC(Not NM/NB)
    name: "換符「弾幕のカタリスト」",           // 弾幕名・スペルカード名
    desc: "説明文や作成者名",
    hp: 3500,                   // ボスHP（ショットで削って撃破可能）
    duration: 60,               // 制限時間（秒）
    maxMisses: 3,               // 許容被弾回数（"inf"で無限）
    x_offset: 0,                // 出現位置の横オフセット (画面中央=0)
    y_offset: 0,                // 出現位置の縦オフセット
    despawnTime: 0.1,           // 画面外に出てから弾が消滅するまでの秒数
    emitterScript: `
while (true) {
    bullet({ "type": "normal", "image": "onryou_red", "radius": 20, "hitRadius": 25, "way": 72 })
    angle += 3
    wf(30)
}
    `,
    bulletScript: `
if (color==#ff3333) {
    once {
        advance(10)
    }
    if (dist < 150) {
        once {
            speed = 0
            imageTo("rednormal")
            tween("radius", 40, 10, "seconds", 0.4, "easeOut")
            hitRadius = 10
            wf(60)
            tween("radius", 40, 0, "seconds", 0.4, "easeOut")
            aimAtTarget()
            bullet({ "type": "normal", "image": "redknife", "speed": 0, "radius": 20, "hitRadius": 10 })
            y = -8000000
        }
    }
}
    `,
    magicCircleScript: `
if (frame == 30) {
    tween("speed", 0, 200, "seconds", 1)
}
    `
},{
    difficulty: "hard",       // 難易度: EASY, NORMAL(NN OK), HARD(NM xor NB), LUNATIC(Not NM/NB)
    name: "「四重モノリス」",           // 弾幕名・スペルカード名
    desc: "腹痛なう😇",
    hp: 3000,                   // ボスHP（ショットで削って撃破可能）
    duration: 80,               // 制限時間（秒）
    maxMisses: 3,               // 許容被弾回数（"inf"で無限）
    x_offset: 0,                // 出現位置の横オフセット (画面中央=0)
    y_offset: 0,                // 出現位置の縦オフセット
    despawnTime: 1.5,           // 画面外に出てから弾が消滅するまでの秒数
    emitterScript: `
while (true) {
    bullet({ "type": "normal", "radius": 0, "way": 18, "transparency":100, "destroyResist": true })
    angle = random(0,360)
    wf(120)
}
    `,
    bulletScript: `
if (cardFrame == 30 * n) {
    bullet({ "type": "normal", "image": "rednormal", "speed": 0, "angle": 270, "radius": 40, "hitRadius": 0, "transparency": 100, "way": 4 })
}
    `,
    magicCircleScript: `
once {
    tween("radius", 40, 10, "frames", 30)
    tween("transparency", 100, 50, "frames", 30)
    wf(30)
    imageTo("redgun")
    transparency = 0
    speed = 110
    hitRadius = 5
}
    `
},{
    difficulty: "hard",       // 難易度: EASY, NORMAL(NN OK), HARD(NM xor NB), LUNATIC(Not NM/NB)
    name: "模擬「無窮黒死蝶」",           // 弾幕名・スペルカード名
    desc: "時間長め！でも飽きにくいとは思う。",
    hp: 4000,                   // ボスHP（ショットで削って撃破可能）
    duration: 80,               // 制限時間（秒）
    maxMisses: 2,               // 許容被弾回数（"inf"で無限）
    x_offset: 0,                // 出現位置の横オフセット (画面中央=0)
    y_offset: 0,                // 出現位置の縦オフセット
    despawnTime: 3,           // 画面外に出てから弾が消滅するまでの秒数
    emitterScript: `
while (true) {
    spd = 0
    ey = 388
    wf(60)
    for (let i = 0; i < 3; i++) {
        bullet({ "type": "normal", "image": "tyoudan", "speed": 3 + spd, "radius": 20, "hitRadius": 5, "way": 9, "destroyResist": true, "muki": 230 })
        angle += 15
        bullet({ "type": "normal", "image": "tyoudan", "speed": 3 + spd, "radius": 20, "hitRadius": 5, "color": "#3388ff", "way": 9, "destroyResist": true, "muki": -230 })
        spd += random(20,100)
        angle += 15
    }
}
    `,
    bulletScript: `
once {
    speed += random(0,100)
    wf(120)
    tween("angle", angle, angle + muki, "seconds", 8)
}
spriteAngle = angle
if (cardFrame == 600 * n) {
    tween("speed", speed, 200, "seconds", 2)
}
    `,
    magicCircleScript: `

    `
},{
    difficulty: "Easy",       // 難易度: EASY, NORMAL(NN OK), HARD(NM xor NB), LUNATIC(Not NM/NB)
    name: "紅符「レッドカーテン」",           // 弾幕名・スペルカード名
    desc: "意図的に簡単にした！",
    hp: 2500,                   // ボスHP（ショットで削って撃破可能）
    duration: 30,               // 制限時間（秒）
    maxMisses: 2,               // 許容被弾回数（"inf"で無限）
    x_offset: 0,                // 出現位置の横オフセット (画面中央=0)
    y_offset: 0,                // 出現位置の縦オフセット
    despawnTime: 1.5,           // 画面外に出てから弾が消滅するまでの秒数
    emitterScript: `
while (true) {
    sd = 0
    time = 600
    for (let i = 0; i < 13; i++) {
        spx = 0 + random(-80,-20)
        sd += 70
        for (let i = 0; i < 25; i++) {
            spx += 70
            bullet({ "type": "normal", "image": "rednormal", "speed": 0, "angle": 90, "radius": 40, "hitRadius": 0, "isAbsolute": true, "x": spx })
        }
        wf(20)
    }
    wf(30)
    sd = -900
    time = 600
    for (let i = 0; i < 13; i++) {
        spx = 0 + random(-80,-20)
        sd += 70
        for (let i = 0; i < 25; i++) {
            spx += 70
            bullet({ "type": "normal", "image": "rednormal", "speed": 0, "angle": -90, "radius": 40, "hitRadius": 0, "isAbsolute": true, "x": spx })
        }
        wf(20)
    }
    wf(30)
}
    `,
    bulletScript: `
once {
    advance(sd - 40)
    tween("radius", radius, 10, "seconds", 0.5)
    wf(31)
    radius = 20
    imageTo("onryou_red")
    hitRadius = 10
    angle += random(-40,40)
    spriteAngle = angle
}
if (frame==200) {
    tween("speed", 0, 140, "seconds", 1)
}
    `,
    magicCircleScript: `

    `
},{
    difficulty: "hard",       // 難易度: EASY, NORMAL(NN OK), HARD(NM xor NB), LUNATIC(Not NM/NB)
    name: "抽出「狂気の射撃」",           // 弾幕名・スペルカード名
    desc: "",
    hp: 600,                   // ボスHP（ショットで削って撃破可能）
    duration: 45,               // 制限時間（秒）
    maxMisses: 2,               // 許容被弾回数（"inf"で無限）
    x_offset: 0,                // 出現位置の横オフセット (画面中央=0)
    y_offset: 0,                // 出現位置の縦オフセット
    despawnTime: 1.5,           // 画面外に出てから弾が消滅するまでの秒数
    emitterScript: `
while (true) {
    spd = 0
    aimAtTarget()
    for (let i = 0; i < 40; i++) {
        spd += 12
        bullet({ "type": "normal", "image": "redsimple", "speed": 50 + spd, "radius": 25, "hitRadius": 15, "way": 12 })
    }
    wf(20)
    idoux = 378 + random(-200,200)
    idouy = 300 + random(-200,50)
    tween("ex", ex, idoux, "seconds", 0.5, "easeOut")
    tween("ey", ey, idouy, "seconds", 0.5, "easeOut")
    wf(40)
    spd = 0
    aimAtTarget()
    for (let i = 0; i < 40; i++) {
        spd += 12
        bullet({ "type": "normal", "image": "redsimple", "speed": 50 + spd, "radius": 25, "hitRadius": 15, "way": 12 })
    }
    wf(20)
    idoux = tx + random(-60,60)
    idouy = 300 + random(-200,50)
    tween("ex", ex, idoux, "seconds", 0.5, "easeOut")
    tween("ey", ey, idouy, "seconds", 0.5, "easeOut")
    wf(40)
}
    `,
    bulletScript: `

    `,
    magicCircleScript: `

    `
},{
    difficulty: "NORMAL",       // 難易度: EASY, NORMAL(NN OK), HARD(NM xor NB), LUNATIC(Not NM/NB)
    name: "禁術「圧爆殺」",           // 弾幕名・スペルカード名
    desc: "どう見ても紅魔郷四面道中",
    hp: 8000,                   // ボスHP（ショットで削って撃破可能）
    duration: 100,               // 制限時間（秒）
    maxMisses: 3,               // 許容被弾回数（"inf"で無限）
    x_offset: 0,                // 出現位置の横オフセット (画面中央=0)
    y_offset: 0,                // 出現位置の縦オフセット
    despawnTime: 1.5,           // 画面外に出てから弾が消滅するまでの秒数
    emitterScript: `
while (true) {
    l = 0
    motox = ex + random(-50,50)
    motoy = ey + random(-50,50)
    for (let i = 0; i < 1; i++) {
        bullet({ "type": "life", "image": "mahoujin128", "speed": 0, "hitRadius": 64, "color": "#dfafef", "destroyResist": true, "health": 200, "type2": 1 })
        ix = 384 + 250 + random(-100,100)
        iy = 250 + random(-100,100) + l
        tween("ex", ex, ix, "seconds", 0.8, "easeOut")
        tween("ey", ey, iy, "seconds", 0.8, "easeOut")
        wf(50)
        bullet({ "type": "life", "image": "mahoujin128", "speed": 0, "hitRadius": 64, "color": "#dfafef", "destroyResist": true, "health": 200, "type2": 1 })
        ix = 384 - 250 + random(-100,100)
        iy = 250 + random(-100,100) + l
        tween("ex", ex, ix, "seconds", 0.8, "easeOut")
        tween("ey", ey, iy, "seconds", 0.8, "easeOut")
        wf(50)
        bullet({ "type": "life", "image": "mahoujin128", "speed": 0, "hitRadius": 64, "color": "#dfafef", "destroyResist": true, "health": 200, "type2": 1 })
    }
    tween("ex", ex, motox, "seconds", 0.8, "easeOut")
    tween("ey", ey, motoy, "seconds", 0.8, "easeOut")
    wf(240)
    l = 0
    motox = ex + random(-50,50)
    motoy = ey + random(-50,50)
    for (let i = 0; i < 1; i++) {
        aimAtTarget()
        bullet({ "type": "life", "image": "mahoujin128", "speed": 50, "hitRadius": 64, "color": "#B455A0", "destroyResist": true, "health": 200, "type2": 2 })
        ix = 384 + 250 + random(-100,100)
        iy = 250 + random(-100,100) + l
        tween("ex", ex, ix, "seconds", 0.8, "easeOut")
        tween("ey", ey, iy, "seconds", 0.8, "easeOut")
        wf(50)
        bullet({ "type": "life", "image": "mahoujin128", "speed": 50, "hitRadius": 64, "color": "#B455A0", "destroyResist": true, "health": 200, "type2": 2 })
        ix = 384 - 250 + random(-100,100)
        iy = 250 + random(-100,100) + l
        tween("ex", ex, ix, "seconds", 0.8, "easeOut")
        tween("ey", ey, iy, "seconds", 0.8, "easeOut")
        wf(50)
        bullet({ "type": "life", "image": "mahoujin128", "speed": 50, "hitRadius": 64, "color": "#B455A0", "destroyResist": true, "health": 200, "type2": 2 })
    }
    tween("ex", ex, motox, "seconds", 0.8, "easeOut")
    tween("ey", ey, motoy, "seconds", 0.8, "easeOut")
    wf(240)
}
    `,
    bulletScript: `
if (type2 == 1) {
    once {
        tween("radius", 0, 64, "seconds", 1, "easeOut")
    }
    y += 0.4
    spriteAngle += 1.3
    if (frame == 25 * n) {
        angle += random(0,360)
        bullet({ "type": "normal", "image": "rednormal", "radius": 9, "hitRadius": 3, "color": "#ffffff", "way": 8 })
    }
    if (frame == 600) {
        tween("radius", 64, 0, "seconds", 1, "easeOut")
        wf(60)
        y = -800000
    }
}
if (type2 == 2) {
    once {
        tween("radius", 0, 64, "seconds", 1, "easeOut")
    }
    spriteAngle += 1.3
    if (frame == 25 * n) {
        motoangle = angle
        aimAtTarget()
        angle += random(-10,10)
        bullet({ "type": "normal", "image": "rednormal", "radius": 9, "hitRadius": 3, "color": "#ffffff", "way": 8 })
        angle = motoangle
    }
    if (frame == 600) {
        tween("radius", 64, 0, "seconds", 1, "easeOut")
        wf(60)
        y = -800000
    }
}
if (isDestroyed) {
    for (let i = 0; i < 10; i++) {
        spd += 20
        angle += random(0,30)
        bullet({ "type": "normal", "image": "light", "speed": 0 + spd, "radius": 1, "hitRadius": 0, "way": 18, "destroyResist": true })
        enemyHp += -30
    }
}
    `,
    magicCircleScript: `
if (color==#ff3333) {
    once {
        tween("speed", speed, 0, "seconds", 2)
        tween("radius", 0, 30, "seconds", 0.8, "easeOut")
        wait(0.8)
        tween("radius", 30, 0, "seconds", 0.8, "easeIn")
        wait(0.8)
        y = -8000
    }
}
    `
},{
    difficulty: "NORMAL",       // 難易度: EASY, NORMAL(NN OK), HARD(NM xor NB), LUNATIC(Not NM/NB)
    name: "呪砲「血みどろの星」",           // 弾幕名・スペルカード名
    desc: "説明文や作成者名",
    hp: 1000,                   // ボスHP（ショットで削って撃破可能）
    duration: 50,               // 制限時間（秒）
    maxMisses: 0,               // 許容被弾回数（"inf"で無限）
    x_offset: 0,                // 出現位置の横オフセット (画面中央=0)
    y_offset: 0,                // 出現位置の縦オフセット
    despawnTime: 1.5,           // 画面外に出てから弾が消滅するまでの秒数
    emitterScript: `
while (true) {
    ey = 348
    bullet({ "type": "normal", "image": "yellowstar", "speed": 250, "angle": sangle, "way": 6, "muki": 1, "btype": 1 })
    sangle += 178.2
    wf(2)
    bullet({ "type": "normal", "image": "yellowstar", "speed": 250, "angle": sangle, "way": 6, "muki": -1, "btype": 1 })
    sangle += 178.2
    wf(2)
}
while (true) {
    ransuu = random(-8,8)
    xr = random(-120,120)
    yr = random(-120,120)
    bullet({ "type": "normal", "image": "whitenormal", "speed": 1, "hitRadius": 0, "x": xr, "y": yr, "destroyResist": true, "btype": 2, "tien": 1 })
    bullet({ "type": "normal", "image": "bluenormal", "speed": 1, "hitRadius": 0, "x": xr, "y": yr, "destroyResist": true, "btype": 2, "tien": 2 })
    bullet({ "type": "normal", "image": "bluenormal", "speed": 1, "hitRadius": 0, "x": xr, "y": yr, "color": "#3388ff", "destroyResist": true, "btype": 2, "tien": 3 })
    wf(30)
}
    `,
    bulletScript: `
if (btype == 1) {
    if (color==#ff3333) {
        spriteAngle += 6 * muki
    }
    once {
        angle += random(-5,5)
    }
}
if (btype == 2) {
    once {
        aimAtTarget()
        angle += ransuu
        spriteAngle = angle
    }
    if (tien == 1) {
        once {
            multf = 90
            multlr = 0.2
            wf(50)
            y = -80000
        }
    }
    if (tien == 2) {
        once {
            multf = 90
            multlr = 0
            wf(30)
            tween("multlr", 0, 2.5, "seconds", 0.25)
            tween("hitmultlr", 0, 1, "seconds", 0.25)
            wf(20)
            hitRadius = 4
            hitmultf = 200
            wf(25)
            hitRadius = 0
            wf(5)
            tween("multlr", 2.5, 0, "seconds", 0.25)
            tween("hitmultlr", 1, 0, "seconds", 0.25)
        }
    }
    if (tien == 3) {
        once {
            radius = 0
            wf(30)
            tween("radius", 0, 15, "seconds", 0.25)
            wf(20)
            wf(25)
            wf(5)
            tween("radius", 15, 0, "seconds", 0.25)
        }
    }
}
    `,
    magicCircleScript: `

    `
},{
    difficulty: "NORMAL",       // 難易度: EASY, NORMAL(NN OK), HARD(NM xor NB), LUNATIC(Not NM/NB)
    name: "時符「虐殺ドール」",           // 弾幕名・スペルカード名
    desc: "説明文や作成者名",
    hp: 3000,                   // ボスHP（ショットで削って撃破可能）
    duration: 80,               // 制限時間（秒）
    maxMisses: 3,               // 許容被弾回数（"inf"で無限）
    x_offset: 0,                // 出現位置の横オフセット (画面中央=0)
    y_offset: 0,                // 出現位置の縦オフセット
    despawnTime: 1.5,           // 画面外に出てから弾が消滅するまでの秒数
    emitterScript: `
while (true) {
    wf(10)
    tween("ex", ex, 384 + random(-200,200), "seconds", 0.5, "easeOut")
    tween("ey", ey, 200 + random(-100,100), "seconds", 0.5, "easeOut")
    wf(50)
    while (true) {
        for (let i = 0; i < 30; i++) {
            if (!(cardFrame % 300 < 90)) {
                bullet({ "type": "normal", "image": "redknife", "speed": 150, "radius": 20, "hitRadius": 7, "way": 3 })
            }
            angle += 19
            wf(1)
        }
        angle += random(-50.50)
        for (let i = 0; i < 30; i++) {
            if (!(cardFrame % 300 < 90)) {
                bullet({ "type": "normal", "image": "redknife", "speed": 150, "radius": 20, "hitRadius": 7, "way": 3 })
            }
            angle += 19
            wf(1)
        }
        wf(0)
        for (let i = 0; i < 30; i++) {
            if (!(cardFrame % 300 < 90)) {
                bullet({ "type": "normal", "image": "redknife", "speed": 150, "radius": 20, "hitRadius": 7, "way": 3 })
            }
            angle += 19
            wf(1)
        }
        tween("ex", ex, tx + random(-80,80), "seconds", 0.5, "easeOut")
        tween("ey", ey, 200 + random(-100,100), "seconds", 0.5, "easeOut")
        angle += random(-50.50)
        for (let i = 0; i < 30; i++) {
            if (!(cardFrame % 300 < 90)) {
                bullet({ "type": "normal", "image": "redknife", "speed": 150, "radius": 20, "hitRadius": 7, "way": 3 })
            }
            angle += 19
            wf(1)
        }
        wf(0)
    }
}
    `,
    bulletScript: `
if (cardFrame == 300 * n) {
    imageTo("whiteknife")
    speed = 0
    kakudo = random(-150,150)
    matu = random(0,90)
    if (matu == 0..60) {
        wf(matu)
        angle += kakudo
        spriteAngle = angle
        wf(60 - matu)
        wf(30)
        imageTo("greenknife")
        speed = 100
    }
    if (matu == 60..120) {
        wf(90)
        imageTo("redknife")
        speed = 150
    }
}
    `,
    magicCircleScript: `

    `
},{
    difficulty: "hard",       // 難易度: EASY, NORMAL(NN OK), HARD(NM xor NB), LUNATIC(Not NM/NB)
    name: "熈符「色即是空」",           // 弾幕名・スペルカード名
    desc: "けっこう単純で難しい弾幕になったと思います",
    hp: 2000,                   // ボスHP（ショットで削って撃破可能）
    duration: 60,               // 制限時間（秒）
    maxMisses: 3,               // 許容被弾回数（"inf"で無限）
    x_offset: 0,                // 出現位置の横オフセット (画面中央=0)
    y_offset: 0,                // 出現位置の縦オフセット
    despawnTime: 1.5,           // 画面外に出てから弾が消滅するまでの秒数
    emitterScript: `
while (true) {
    bullet({ "type": "normal", "image": "onryou_light_green", "radius": 20, "hitRadius": 10, "way": 21 })
    bullet({ "type": "normal", "image": "onryou_light_blue", "angle": angle + 8.5714285715, "radius": 20, "hitRadius": 10, "way": 21 })
    angle += 30
    wf(12)
}
    `,
    bulletScript: `
once {
    ram = random(-1,1)
}
if (frame == 60..120) {
    if (ram == -1..0) {
        angle += -1
    }
    if (ram == 0..1) {
        angle += 1
    }
    spriteAngle = angle
}
    `,
    magicCircleScript: `

    `
},{
    difficulty: "hard",       // 難易度: EASY, NORMAL(NN OK), HARD(NM xor NB), LUNATIC(Not NM/NB)
    name: "「原生代の神霊界」",           // 弾幕名・スペルカード名
    desc: "理不尽感はあんま無くて、結構避けるのも楽しい弾幕になったとおもいます！！",
    hp: 1500,                   // ボスHP（ショットで削って撃破可能）
    duration: 70,               // 制限時間（秒）
    maxMisses: 2,               // 許容被弾回数（"inf"で無限）
    x_offset: 0,                // 出現位置の横オフセット (画面中央=0)
    y_offset: 0,                // 出現位置の縦オフセット
    despawnTime: 1.5,           // 画面外に出てから弾が消滅するまでの秒数
    emitterScript: `
while (true) {
    ey = 300
    time = random(10,110)
    time2 = time * 2
    r = random(-2,2)
    henkouspd = random(100,200)
    sa = 0
    bullet({ "type": "normal", "image": "onryou_light_blue", "radius": 40, "hitRadius": 45, "way": 4 })
    sa = -0.25
    bullet({ "type": "normal", "image": "onryou_light_red", "radius": 40, "hitRadius": 45, "way": 4 })
    sa = 0.25
    bullet({ "type": "normal", "image": "onryou_light_green", "radius": 40, "hitRadius": 45, "way": 4 })
    sa = 0.5
    bullet({ "type": "normal", "image": "onryou_light_yellow", "radius": 40, "hitRadius": 45, "way": 4 })
    angle += random(0,180)
    wf(20)
}
    `,
    bulletScript: `
if (frame == time..time2) {
    angle += r * 0
    spriteAngle = angle
}
once {
    speed = 300
}
if (isBounced) {
    once {
        bounce()
        angle += sa *50
        spriteAngle = angle
        tween("radius", radius, 20, "seconds", 1)
        tween("speed", speed, henkouspd, "seconds", 1)
        tween("hitRadius", hitRadius, 10, "seconds", 1)
    }
}
    `,
    magicCircleScript: `

    `
},{
    difficulty: "NORMAL",       // 難易度: EASY, NORMAL(NN OK), HARD(NM xor NB), LUNATIC(Not NM/NB)
    name: "「燻蝶劣勢」",           // 弾幕名・スペルカード名
    desc: "うおおおリベンジ！無理にでも打ち込みにいかないとずっと隙間を抜けないといけない地獄になる！",
    hp: 3000,                   // ボスHP（ショットで削って撃破可能）
    duration: 60,               // 制限時間（秒）
    maxMisses: 3,               // 許容被弾回数（"inf"で無限）
    x_offset: 0,                // 出現位置の横オフセット (画面中央=0)
    y_offset: 0,                // 出現位置の縦オフセット
    despawnTime: 1.5,           // 画面外に出てから弾が消滅するまでの秒数
    emitterScript: `
while (true) {
    ey = 448
    wf(2)
    while (true) {
        angle = 0
        for (let i = 0; i < 10; i++) {
            bullet({ "type": "normal", "image": "rednormal", "speed": 0, "angle": -angle +45, "radius": 10, "hitRadius": 7, "way": 4, "destroyResist": true, "muki": 1 })
            angle -= 5.5
            wf(10)
        }
        for (let i = 0; i < 4; i++) {
            bullet({ "type": "normal", "image": "rednormal", "speed": 0, "angle": -angle + l + 45 + 45, "radius": 10, "hitRadius": 7, "way": 10 + w, "distance": 3.5, "distanceType": "step", "destroyResist": true, "muki": -1 })
            l += 90
        }
        w += 1
        if (w==14..800) {
            w = 14
        }
        for (let i = 0; i < 10; i++) {
            bullet({ "type": "normal", "image": "rednormal", "speed": 0, "angle": -angle, "radius": 10, "hitRadius": 7, "way": 4, "destroyResist": true, "muki": -1 })
            angle += 5.5
            wf(10)
        }
        for (let i = 0; i < 4; i++) {
            bullet({ "type": "normal", "image": "rednormal", "speed": 0, "angle": -angle + l + 90 + 45, "radius": 10, "hitRadius": 7, "way": 10 + w, "distance": 3.5, "distanceType": "step", "destroyResist": true, "muki": 1 })
            l += 90
        }
        w += 1
        if (w==14..800) {
            w = 14
        }
    }
}
while (true) {
    if (cardFrame == 80 * n) {
        sd = 0
        for (let i = 0; i < 5; i++) {
            sd += 40
            bullet({ "type": "normal", "image": "tyoudan", "angle": 180 + 20, "radius": 20, "hitRadius": 5, "color": "#3333ff", "way": 2 })
            bullet({ "type": "normal", "image": "tyoudan", "angle": 180 - 20, "radius": 20, "hitRadius": 5, "color": "#3333ff", "way": 2 })
        }
    }
}
    `,
    bulletScript: `
if (color==#ff3333) {
    once {
        advance(50)
        g = 50
    }
    advance(-g)
    angle += muki * 0.7
    spriteAngle = angle
    advance(g)
    g += 1
}
if (color==#3333ff) {
    if (frame==1) {
        tween("speed", 0, 200, "seconds", 1)
    }
    if (frame==60) {
        tween("speed", 200, 0, "seconds", 1)
    }
    if (frame==120) {
        angle += random(-175,175)
        spriteAngle = angle
        tween("speed", 0, 100 + sd, "seconds", 1)
    }
}
    `,
    magicCircleScript: `

    `
},{
    difficulty: "NORMAL",       // 難易度: EASY, NORMAL(NN OK), HARD(NM xor NB), LUNATIC(Not NM/NB)
    name: "「アグニシャイン：球」",           // 弾幕名・スペルカード名
    desc: "どっちかっていうとニューワールドオーダーとか無意識の遺伝子（笑）",
    hp: 3000,                   // ボスHP（ショットで削って撃破可能）
    duration: 100,               // 制限時間（秒）
    maxMisses: 3,               // 許容被弾回数（"inf"で無限）
    x_offset: 0,                // 出現位置の横オフセット (画面中央=0)
    y_offset: 0,                // 出現位置の縦オフセット
    despawnTime: 1.5,           // 画面外に出てから弾が消滅するまでの秒数
    emitterScript: `
while (true) {
    bullet({ "type": "normal", "image": "onryou_light_red", "radius": 20, "hitRadius": 10, "way": 3, "muki": 1 })
    bullet({ "type": "normal", "image": "onryou_light_red", "radius": 20, "hitRadius": 10, "way": 3, "muki": -1 })
    angle += random(0,360)
    wf(12)
}
while (true) {
    tween("ex", ex, 384, "seconds", 5, "easeInOut")
    tween("ey", ey, 350, "seconds", 5, "easeInOut")
    wf(240)
    bullet({ "type": "normal", "image": "onryou_light_red", "radius": 20, "hitRadius": 5, "color": "#ffffff", "way": 36 })
    wf(60)
    tween("ex", ex, tx + random(-60,60), "seconds", 5, "easeInOut")
    tween("ey", ey, ty + random(-60,60), "seconds", 5, "easeInOut")
    wf(300)
}
    `,
    bulletScript: `
if (color==#ff3333) {
    if (frame == 0..300) {
        angle += muki * 1.5
        spriteAngle = angle
    }
}
    `,
    magicCircleScript: `

    `
},{
    difficulty: "NORMAL",       // 難易度: EASY, NORMAL(NN OK), HARD(NM xor NB), LUNATIC(Not NM/NB)
    name: "「プラネットガンフィクス」",           // 弾幕名・スペルカード名
    desc: "安置はないです。当たりますよ！？！？",
    hp: 2000,                   // ボスHP（ショットで削って撃破可能）
    duration: 30,               // 制限時間（秒）
    maxMisses: 3,               // 許容被弾回数（"inf"で無限）
    x_offset: 0,                // 出現位置の横オフセット (画面中央=0)
    y_offset: 0,                // 出現位置の縦オフセット
    despawnTime: 1.5,           // 画面外に出てから弾が消滅するまでの秒数
    emitterScript: `
while (true) {
    if (enemyHp = 2500..4000) {
        r = -45
        for (let i = 0; i < 45; i++) {
            bullet({ "type": "normal", "image": "redsmall", "angle": -90 + r, "radius": 0, "hitRadius": 0, "isAbsolute": true, "x": 378, "y": 448 })
            r += 2
            wf(2)
        }
        for (let i = 0; i < 45; i++) {
            bullet({ "type": "normal", "image": "redsmall", "angle": -90 + r, "radius": 0, "hitRadius": 0, "isAbsolute": true, "x": 378, "y": 448 })
            r -= 2
            wf(2)
        }
    }
    if (enemyHp = 0..2500) {
        r = -45
        for (let i = 0; i < 90; i++) {
            bullet({ "type": "normal", "image": "redsmall", "angle": -90 + r, "radius": 0, "hitRadius": 0, "isAbsolute": true, "x": 378, "y": 448 })
            r += 1
            wf(1)
        }
        for (let i = 0; i < 90; i++) {
            bullet({ "type": "normal", "image": "redsmall", "angle": -90 + r, "radius": 0, "hitRadius": 00, "isAbsolute": true, "x": 378, "y": 448 })
            r -= 1
            wf(1)
        }
    }
}
    `,
    bulletScript: `
once {
    speed = random(200,450)
}
if (y < 5) {
    once {
        radius = 10
        imageTo("bluenormal")
        angle = 90
        motospd = speed
        speed = 0
        y = 10
        tween("radius", 40, 4, "seconds", 0.3)
        tween("transparency", 100, 0, "seconds", 0.2)
        wf(20)
        imageTo("bluegun")
        radius = 10
        angle = 90
        spriteAngle = angle
        speed = motospd
        hitRadius = 5
    }
}
    `,
    magicCircleScript: `

    `
},{
    difficulty: "Easy",       // 難易度: EASY, NORMAL(NN OK), HARD(NM xor NB), LUNATIC(Not NM/NB)
    name: "虹符「弾虹貫日」",           // 弾幕名・スペルカード名
    desc: "だいぶスマートに作れたと思ってる！ちなみに何故かラグい。",
    hp: 2400,                   // ボスHP（ショットで削って撃破可能）
    duration: 70,               // 制限時間（秒）
    maxMisses: 2,               // 許容被弾回数（"inf"で無限）
    x_offset: 0,                // 出現位置の横オフセット (画面中央=0)
    y_offset: 0,                // 出現位置の縦オフセット
    despawnTime: 1.5,           // 画面外に出てから弾が消滅するまでの秒数
    emitterScript: `
while (true) {
    tamac = 7
    while (true) {
        matu = 5
        if (cardSecond == 20..6000) {
            matu = 3
        }
        wf(matu * 4)
        aimAtTarget()
        angle += 120
        for (let i = 0; i < 20; i++) {
            angle -= 10
            spd = 0
            tamac += 1
            for (let i = 0; i < 10; i++) {
                spd += 40
                bullet({ "type": "normal", "image": "redbig", "speed": 100 + spd, "radius": 8, "hitRadius": 5 })
            }
            wf(matu)
        }
        wf(matu * 4)
        aimAtTarget()
        angle -= 120
        for (let i = 0; i < 20; i++) {
            angle += 10
            spd = 0
            tamac += 1
            for (let i = 0; i < 10; i++) {
                spd += 40
                bullet({ "type": "normal", "image": "redbig", "speed": 100 + spd, "radius": 8, "hitRadius": 5 })
            }
            wf(matu)
        }
    }
}
    `,
    bulletScript: `
once {
    angle += random(-2,2)
    if (tamac == 1 + 7 * n) {
        imageTo("redbig")
    }
    if (tamac == 2 + 7 * n) {
        imageTo("orangebig")
    }
    if (tamac == 3 + 7 * n) {
        imageTo("yellowbig")
    }
    if (tamac == 4 + 7 * n) {
        imageTo("limebig")
    }
    if (tamac == 5 + 7 * n) {
        imageTo("bluebig")
    }
    if (tamac == 6 + 7 * n) {
        imageTo("purplebig")
    }
    if (tamac == 7 + 7 * n) {
        imageTo("pinkbig")
    }
    wait(99999999999999999)
}
    `,
    magicCircleScript: `

    `
},{
    difficulty: "Hard",       // 難易度: EASY, NORMAL(NN OK), HARD(NM xor NB), LUNATIC(Not NM/NB)
    name: "虹符「弾虹貫日・強」",           // 弾幕名・スペルカード名
    desc: "むずくしたい欲を発散します（笑）",
    hp: 2000,                   // ボスHP（ショットで削って撃破可能）
    duration: 70,               // 制限時間（秒）
    maxMisses: 2,               // 許容被弾回数（"inf"で無限）
    x_offset: 0,                // 出現位置の横オフセット (画面中央=0)
    y_offset: 0,                // 出現位置の縦オフセット
    despawnTime: 0.1,           // 画面外に出てから弾が消滅するまでの秒数
    emitterScript: `
while (true) {
    tamac = 7
    while (true) {
        matu = 2
        wf(60)
        aimAtTarget()
        angle += 120
        for (let i = 0; i < 40; i++) {
            angle -= 10
            spd = 0
            tamac += 1
            for (let i = 0; i < 10; i++) {
                spd += 40
                bullet({ "type": "normal", "image": "redbig", "speed": 100 + spd, "radius": 15, "hitRadius": 10 })
            }
            wf(matu)
        }
        aimAtTarget()
        angle -= 120
        for (let i = 0; i < 40; i++) {
            angle += 10
            spd = 0
            tamac += 1
            for (let i = 0; i < 10; i++) {
                spd += 40
                bullet({ "type": "normal", "image": "redbig", "speed": 100 + spd, "radius": 15, "hitRadius": 10 })
            }
            wf(matu)
        }
        aimAtTarget()
        for (let i = 0; i < 10; i++) {
            spd += 60
            bullet({ "type": "normal", "image": "redknife", "speed": 20 + spd, "radius": 30, "hitRadius": 10, "way": 36, "anana": 1 })
        }
    }
}
    `,
    bulletScript: `
if(anana != 1) {
    once {
        angle += random(-4,4)
        speed += random(-60,60)
        if (tamac == 1 + 7 * n) {
            imageTo("redbig")
        }
        if (tamac == 2 + 7 * n) {
            imageTo("orangebig")
        }
        if (tamac == 3 + 7 * n) {
            imageTo("yellowbig")
        }
        if (tamac == 4 + 7 * n) {
            imageTo("limebig")
        }
        if (tamac == 5 + 7 * n) {
            imageTo("bluebig")
        }
        if (tamac == 6 + 7 * n) {
            imageTo("purplebig")
        }
        if (tamac == 7 + 7 * n) {
            imageTo("pinkbig")
        }
        wait(99999999999999999)
    }
}
    `,
    magicCircleScript: `

    `
},{
    difficulty: "NORMAL",       // 難易度: EASY, NORMAL(NN OK), HARD(NM xor NB), LUNATIC(Not NM/NB)
    name: "「氷結晶スプリット」",           // 弾幕名・スペルカード名
    desc: "結晶ができてそれが炸裂するイメージ？",
    hp: 3000,                   // ボスHP（ショットで削って撃破可能）
    duration: 80,               // 制限時間（秒）
    maxMisses: 2,               // 許容被弾回数（"inf"で無限）
    x_offset: 0,                // 出現位置の横オフセット (画面中央=0)
    y_offset: 0,                // 出現位置の縦オフセット
    despawnTime: 1.5,           // 画面外に出てから弾が消滅するまでの秒数
    emitterScript: `
while (true) {
    ey = 260
    wf(50)
    for (let i = 0; i < 75; i++) {
        angle += 4.8
        iku = random(0,300)
        iku += random(-100,100)
        bullet({ "type": "normal", "image": "cyankunai2", "speed": 0, "radius": 20, "hitRadius": 6, "way": 4, "t": 1 })
        bullet({ "type": "normal", "image": "cyankunai2", "speed": 0, "radius": 20, "hitRadius": 6, "way": 4, "t": 2 })
        bullet({ "type": "normal", "image": "cyankunai2", "speed": 0, "radius": 20, "hitRadius": 6, "way": 4, "t": 3 })
    }
    wf(200)
    for (let i = 0; i < 10; i++) {
        wf(20)
        aimAtTarget()
        bullet({ "type": "normal", "image": "bluekunai2", "speed": 300, "angle": angle + 5, "radius": 20, "hitRadius": 10, "color": "#ffffff", "way": 24, "destroyResist": true })
    }
    wf(50)
}
    `,
    bulletScript: `
if (color==#ff3333) {
    once {
        advance(iku)
        if (t=1) {
            angle += 180
        }
        if (t=2) {
            angle += 120 + 180
        }
        if (t=3) {
            angle += -120 - 180
        }
        tween("radius", 0, 20, "seconds", 0.5)
    }
    spriteAngle = angle
    if (frame==60) {
        tween("speed", speed, iku, "seconds", 2)
    }
    if (frame==120) {
        if (t=1) {
            speed = iku
        }
        tween("radius", 20, 15, "seconds", 1)
        hitRadius = 3
    }
    if (frame==200) {
        tween("speed", speed, 300, "seconds", 5)
    }
}
    `,
    magicCircleScript: `

    `
},{
    difficulty: "NORMAL",       // 難易度: EASY, NORMAL(NN OK), HARD(NM xor NB), LUNATIC(Not NM/NB)
    name: "幻符「ディストートバレル」",           // 弾幕名・スペルカード名
    desc: "説明文や作成者名",
    hp: 2000,                   // ボスHP（ショットで削って撃破可能）
    duration: 60,               // 制限時間（秒）
    maxMisses: 3,               // 許容被弾回数（"inf"で無限）
    x_offset: 0,                // 出現位置の横オフセット (画面中央=0)
    y_offset: 0,                // 出現位置の縦オフセット
    despawnTime: 1.5,           // 画面外に出てから弾が消滅するまでの秒数
    emitterScript: `
while (true) {
    bullet({ "type": "normal", "image": "redkunai2", "radius": 12, "hitRadius": 3, "way": 3, "muki": 1 })
    bullet({ "type": "normal", "image": "redkunai2", "angle": -angle, "radius": 12, "hitRadius": 3, "way": 3, "muki": 1 })
    bullet({ "type": "normal", "image": "redkunai2", "radius": 12, "hitRadius": 3, "way": 3, "muki": -1 })
    bullet({ "type": "normal", "image": "redkunai2", "angle": -angle, "radius": 12, "hitRadius": 3, "way": 3, "muki": -1 })
    angle += 7
    wf(2)
}
    `,
    bulletScript: `
if (frame == 60) {
    angle += 50 * muki
    spriteAngle = angle
}
if (frame == 180) {
    angle -= 15 * muki
    spriteAngle = angle
}
    `,
    magicCircleScript: `

    `
},{
    difficulty: "NORMAL",       // 難易度: EASY, NORMAL(NN OK), HARD(NM xor NB), LUNATIC(Not NM/NB)
    name: "神薙「二重錦紗」",           // 弾幕名・スペルカード名
    desc: "説明文や作成者名",
    hp: 2000,                   // ボスHP（ショットで削って撃破可能）
    duration: 60,               // 制限時間（秒）
    maxMisses: 3,               // 許容被弾回数（"inf"で無限）
    x_offset: 0,                // 出現位置の横オフセット (画面中央=0)
    y_offset: 0,                // 出現位置の縦オフセット
    despawnTime: 1.5,           // 画面外に出てから弾が消滅するまでの秒数
    emitterScript: `
while (true) {
    aimAtTarget()
    angle += random(-50,50)
    bullet({ "type": "normal", "image": "greendiamond", "radius": 10, "hitRadius": 3, "gensoku": 300 })
    bullet({ "type": "normal", "image": "greendiamond", "angle": angle + 1.3, "radius": 10, "hitRadius": 3, "gensoku": 300 })
    wf(1)
    angle = 90
    angle += random(-50,50)
    bullet({ "type": "normal", "image": "greendiamond", "radius": 10, "hitRadius": 3, "gensoku": 200 })
    bullet({ "type": "normal", "image": "greendiamond", "angle": angle + 1.3, "radius": 10, "hitRadius": 3, "gensoku": 200 })
    wf(1)
}
    `,
    bulletScript: `
once {
    tween("speed", 600, gensoku, "seconds", 1)
}
    `,
    magicCircleScript: `

    `
},{
    difficulty: "easy",       // 難易度: EASY, NORMAL(NN OK), HARD(NM xor NB), LUNATIC(Not NM/NB)
    name: "狡符「詰みの三十手」",           // 弾幕名・スペルカード名
    desc: "ちなみにいうて詰まない（笑）",
    hp: 2000,                   // ボスHP（ショットで削って撃破可能）
    duration: 70,               // 制限時間（秒）
    maxMisses: 2,               // 許容被弾回数（"inf"で無限）
    x_offset: 0,                // 出現位置の横オフセット (画面中央=0)
    y_offset: 0,                // 出現位置の縦オフセット
    despawnTime: 1.5,           // 画面外に出てから弾が消滅するまでの秒数
    emitterScript: `
while (true) {
    aimAtTarget()
    angle += random(-70,70)
    r = random(-1,1)
    r2 = random(-1,1)
    if (r==-1..0) {
        if (r2 == -1..0) {
            spd = -100
            for (let i = 0; i < 10; i++) {
                bullet({ "type": "normal", "image": "oliveknife", "speed": 200 + spd, "radius": 20, "hitRadius": 8 })
                angle += 4
                spd += 20
                wf(1)
            }
        }
        if (r2 ==0..1) {
            spd = 100
            for (let i = 0; i < 10; i++) {
                bullet({ "type": "normal", "image": "oliveknife", "speed": 200 + spd, "radius": 20, "hitRadius": 8 })
                angle += 4
                spd -= 10
                wf(1)
            }
        }
    }
    if (r==0..1) {
        if (r2 == -1..0) {
            spd = -100
            for (let i = 0; i < 10; i++) {
                bullet({ "type": "normal", "image": "oliveknife", "speed": 200 + spd, "radius": 20, "hitRadius": 8 })
                angle += 4
                spd += 20
                wf(1)
            }
        }
        if (r2 ==0..1) {
            spd = 100
            for (let i = 0; i < 10; i++) {
                bullet({ "type": "normal", "image": "oliveknife", "speed": 200 + spd, "radius": 20, "hitRadius": 8 })
                angle += 4
                spd -= 10
                wf(1)
            }
        }
    }
    wf(1)
}
    `,
    bulletScript: `

    `,
    magicCircleScript: `

    `
},{
    difficulty: "NORMAL",       // 難易度: EASY, NORMAL(NN OK), HARD(NM xor NB), LUNATIC(Not NM/NB)
    name: "本能「イドの埋火」",           // 弾幕名・スペルカード名
    desc: "適当につくった",
    hp: 2500,                   // ボスHP（ショットで削って撃破可能）
    duration: 60,               // 制限時間（秒）
    maxMisses: 2,               // 許容被弾回数（"inf"で無限）
    x_offset: 0,                // 出現位置の横オフセット (画面中央=0)
    y_offset: 0,                // 出現位置の縦オフセット
    despawnTime: 0.1,           // 画面外に出てから弾が消滅するまでの秒数
    emitterScript: `
while (true) {
    ra = 120
    bullet({ "type": "normal", "image": "redheart", "speed": 300, "radius": 20, "hitRadius": 10, "way": 8, "destroyResist": true })
    ra = -120
    bullet({ "type": "normal", "image": "redheart", "speed": 300, "radius": 20, "hitRadius": 10, "way": 8, "destroyResist": true })
    angle += 15
    wf(40)
}
    `,
    bulletScript: `
if (frame ==40) {
    tween("angle", angle, angle + ra, "seconds", 3, "seconds")
}
if (frame ==70) {
    tween("speed", speed, 200, "seconds", 1, "seconds")
}
spriteAngle = angle
if (frame == 10 * n) {
    dx = random(-20,20)
    dy = random(-20,20)
    dangle += random(-15,15)
    bullet({ "type": "normal", "image": "light", "speed": 50, "angle": angle + dangle, "hitRadius": 3, "x": dx, "y": dy })
}
    `,
    magicCircleScript: `

    `
},{
    difficulty: "hard",       // 難易度: EASY, NORMAL(NN OK), HARD(NM xor NB), LUNATIC(Not NM/NB)
    name: "神海「弾幕の海」",           // 弾幕名・スペルカード名
    desc: "桜色の弾幕を泳いで～",
    hp: 1500,                   // ボスHP（ショットで削って撃破可能）
    duration: 60,               // 制限時間（秒）
    maxMisses: 3,               // 許容被弾回数（"inf"で無限）
    x_offset: 0,                // 出現位置の横オフセット (画面中央=0)
    y_offset: 0,                // 出現位置の縦オフセット
    despawnTime: 1.5,           // 画面外に出てから弾が消滅するまでの秒数
    emitterScript: `
while (true) {
    ey = 200
    for (let i = 0; i < 4; i++) {
        spd = random(100,900)
        bullet({ "type": "normal", "image": "redsmall", "speed": spd, "angle": angle + 0.5, "hitRadius": 2, "x": -spx })
        angle += 1
    }
    wf(1)
}
while (true) {
    syageki = 0
    wf(200)
    syageki = 1
    for (let i = 0; i < 5; i++) {
        bullet({ "type": "normal", "image": "mahoujin64", "speed": 300, "angle": 0, "radius": 30, "color": "#ffffff", "destroyResist": true })
        wf(40)
    }
    syageki = 0
    wf(400)
    syageki = 1
    for (let i = 0; i < 2; i++) {
        bullet({ "type": "normal", "image": "mahoujin64", "speed": 300, "angle": 180, "radius": 30, "color": "#fffffe", "destroyResist": true })
        wf(40)
    }
    syageki = 0
    wf(200)
}
while (true) {
    if (syageki==1) {
        motoangle = angle
        aimAtTarget()
        bullet({ "type": "normal", "image": "redscale", "speed": 400, "radius": 9, "hitRadius": 4, "way": 4, "distance": 1, "distanceType": "step", "IsNormal": 1 })
        angle = motoangle
        wf(60)
    }
}
    `,
    bulletScript: `
if (color==#ff3333) {
    once {
        if (IsNormal != 1) {
            tween("speed", speed, 180, "seconds", 1, "easeOut")
        }
    }
}
if (color==#ffffff) {
    spriteAngle -= 3
    if (frame == 50) {
        tween("angle", angle, 180, "seconds", 0.5)
    }
    if (frame == 180) {
        tween("angle", angle, 0, "seconds", 0.5)
    }
    if (frame == 350) {
        y = -9000
    }
    if (frame == 60 * n) {
        motoangle = angle
        aimAtTarget()
        bullet({ "type": "normal", "image": "redscale", "speed": 400, "radius": 9, "hitRadius": 2, "way": 4, "distance": 1, "distanceType": "step" })
        angle = motoangle
    }
}
if (color==#fffffe) {
    spriteAngle += 3
    if (frame == 50) {
        tween("angle", angle, 0, "seconds", 0.5)
    }
    if (frame == 180) {
        tween("angle", angle, 180, "seconds", 0.5)
    }
    if (frame == 350) {
        y = -9000
    }
    if (frame == 60 * n) {
        motoangle = angle
        aimAtTarget()
        bullet({ "type": "normal", "image": "redscale", "speed": 400, "radius": 9, "hitRadius": 2, "way": 4, "distance": 1, "distanceType": "step" })
        angle = motoangle
    }
}
    `,
    magicCircleScript: `

    `
},{
    difficulty: "NORMAL",       // 難易度: EASY, NORMAL(NN OK), HARD(NM xor NB), LUNATIC(Not NM/NB)
    name: "「虹輪」",           // 弾幕名・スペルカード名
    desc: "うおっｗ",
    hp: 2500,                   // ボスHP（ショットで削って撃破可能）
    duration: 70,               // 制限時間（秒）
    maxMisses: 3,               // 許容被弾回数（"inf"で無限）
    x_offset: 0,                // 出現位置の横オフセット (画面中央=0)
    y_offset: 0,                // 出現位置の縦オフセット
    despawnTime: 1.5,           // 画面外に出てから弾が消滅するまでの秒数
    emitterScript: `
while (true) {
    ey = 300
    bullet({ "type": "normal", "image": "redbig", "angle": angle + 51.4285714286 * 1, "radius": 12, "hitRadius": 0, "transparency": 100 })
    bullet({ "type": "normal", "image": "orangebig", "angle": angle + 51.4285714286 * 2, "radius": 12, "hitRadius": 0, "transparency": 100 })
    bullet({ "type": "normal", "image": "yellowbig", "angle": angle + 51.4285714286 * 3, "radius": 12, "hitRadius": 0, "transparency": 100 })
    bullet({ "type": "normal", "image": "limebig", "angle": angle + 51.4285714286 * 4, "radius": 12, "hitRadius": 0, "transparency": 100 })
    bullet({ "type": "normal", "image": "cobaltbig", "angle": angle + 51.4285714286 * 5, "radius": 12, "hitRadius": 0, "transparency": 100 })
    bullet({ "type": "normal", "image": "purplebig", "angle": angle + 51.4285714286 * 6, "radius": 12, "hitRadius": 0, "transparency": 100 })
    bullet({ "type": "normal", "image": "pinkbig", "angle": angle + 51.4285714286 * 7, "radius": 12, "hitRadius": 0, "transparency": 100 })
    angle += 5
    wf(3)
}
    `,
    bulletScript: `
once {
    advance(20)
    tween("transparency", 100, 0, "frame", 5)
    tween("radius", 40, 12, "frame", 5)
    wf(5)
    hitRadius = 6
    radius = 12
    tween("speed", 600, 0, "seconds", 0.8)
    wf(60)
    angle = angle + cardFrame * 10
    tween("speed", 0, 1000, "seconds", 20)
    spriteAngle = angle
}
    `,
    magicCircleScript: `

    `
}
];

/**
,{
    difficulty: "NORMAL",       // 難易度: EASY, NORMAL(NN OK), HARD(NM xor NB), LUNATIC(Not NM/NB)
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
