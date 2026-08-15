/**
共有弾幕データの一覧
 * 
 * 弾幕を作ったら、以下のフォーマットでコピペして追加してください。
 * 
,{
    difficulty: "NORMAL",
    name: "弾幕名",
    desc: "説明文や作成者名など",
    duration: 15,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
        // コア挙動の独自コード
    `,
    bulletScript: `
        // 弾挙動の独自コード
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
}
 */
const sharedDanmakuList = [
    {
        difficulty: "NORMAL",
        name: "【サンプル】スパイラルレイン",
        desc: "全方位に螺旋を描く弾を発射します（サンプル）",
        duration: 15,
        maxMisses: 2,
        x_offset: 0,
        y_offset: 0,
        despawnTime: 1.5,
        emitterScript: `
while (true) {
    aimAtTarget()
    spawnRing("normal", "#33ffff", 180, angle, 8, 0, 0, 6, "none", "relative")
    angle += 5
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
        difficulty: "EASY",
        name: "華符「大輪舞転」",
        desc: "とにかく綺麗に作った。",
        duration: 30,
        maxMisses: 2,
        x_offset: 0,
        y_offset: 0,
        despawnTime: 2.0,
        emitterScript: `
angle2 = 0
xspa2 = x
yspa2 = y
while (true) {
    spawnWay("normal", "#ff3333", 1000, angle + 180, 5, 72, 0, 0, 16, "ohuda", "relative", "2")
    spawnWay("normal", "#ff3333", 1000, angle, 5, 72, 0, 0, 16, "ohuda", "relative", "2")
    if (second >= 10) {
        angle2 -= 43.5
    }
    angle += 0.2
    wait(0.008)
}
while (true) {
    tween("xspa", x, 384, "step", 1)
    tween("yspa", y, 448, "step", 1)
    xspa = 384
    yspa = 448
    wait(3)
    while (true) {
        tween("xspa", xspa, 384, "step", 0.1)
        tween("yspa", yspa, 448, "step", 0.1)
        wait(3)
    }
}
while (true) {
    spawnRing("normal", "#ffffff", 200, 0, 18, 0, 0, 9, "poihuru", "relative", "7")
    wait(0.6)
}
        `,
        bulletScript: `
if (color != #ffffff) {
    if (frame == 1) {
        if (color == "#ff3333") {
            x = e_xspa
            y = e_yspa
            prev_x = e_xspa
            prev_y = e_yspa
        }
        if (color == "#3366ff") {
            x = e_xspa2
            y = e_yspa2
            prev_x = e_xspa2
            prev_y = e_yspa2
        }
    }
    if (color == "#ff3333") {
        dx = e_xspa - prev_x
        dy = e_yspa - prev_y
        prev_x = e_xspa
        prev_y = e_yspa
    }
    if (color == "#3366ff") {
        dx = e_xspa2 - prev_x
        dy = e_yspa2 - prev_y
        prev_x = e_xspa2
        prev_y = e_yspa2
    }
    x += dx
    y += dy
    if (frame == 5..150) {
        angle += 2
    }
    if (frame == 170..250) {
        angle += 0
    }
    if (frame == 110..2510) {
        y += 800000
        angle -= 0
    }
}
if (color == #ffffff) {
    once {
        x = 384
        y = 448
    }
}
        `,
        magicCircleScript: ``
    },
    {
    difficulty: "HARD",
    name: "サンライトインパクト~Normal~",
    desc: "ルナティックインパクトのパク...オマージュ。",
    duration: 50,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
    while (true) {
    m = 0
    aimAtTarget()
    spawnBulletResist("normal", "#ffdd33", 0, angle, 0, 0, 70, "ootama", "relative", "70")
    wait(10)
    m = 0
    aimAtTarget()
    spawnBulletResist("normal", "#ffdd33", 0, angle, 0, 0, 70, "ootama", "relative", "70")
    wait(6)
    m = 0
    aimAtTarget()
    spawnBulletResist("normal", "#ffdd33", 0, angle, 0, 0, 70, "ootama", "relative", "70")
    wait(10)
    m = 0
    aimAtTarget()
    spawnBulletResist("normal", "#ffdd33", 0, angle, 0, 0, 70, "ootama", "relative", "70")
    wait(10)
    m = 0
    aimAtTarget()
    spawnBulletResist("normal", "#ffdd33", 0, angle, 0, 0, 70, "ootama", "relative", "70")
    wait(10)
    m = 0
    aimAtTarget()
    spawnBulletResist("normal", "#ffdd33", 0, angle, 0, 0, 70, "ootama", "relative", "70")
    wait(10)
}
    `,
    bulletScript: `
    once {
    m = 1
}
if (isTouchEdge) {
    aimAtTarget()
    spriteAngle = angle
    speed = 0
    m = 0
}
if (m===0) {
    for (let i = 0; i < 2; i++) {
        rang = random(0,360)
        spawnRing("normal", "#ff3333", 300, rang, 36, 0, 0, 9, "star", "relative", "3")
        wait(0.2)
    }
    m = 1
}
if (m === 1) {
    speed += 2.5
}
    `,
    magicCircleScript: `
    spriteAngle += 3
    `
    },
    {
    difficulty: "LUNATIC",
    name: "サンライトインパクト",
    desc: "ルナティックインパクトのパク...オマージュ。",
    duration: 50,            // 制限時間（秒）
    maxMisses: 3,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
    while (true) {
    m = 0
    aimAtTarget()
    spawnBulletResist("normal", "#ffdd33", 0, angle, 0, 0, 70, "ootama", "relative", "70")
    wait(10)
    m = 0
    aimAtTarget()
    spawnBulletResist("normal", "#ffdd33", 0, angle, 0, 0, 70, "ootama", "relative", "70")
    wait(6)
    m = 0
    aimAtTarget()
    spawnBulletResist("normal", "#ffdd33", 0, angle, 0, 0, 70, "ootama", "relative", "70")
    wait(10)
    m = 0
    aimAtTarget()
    spawnBulletResist("normal", "#ffdd33", 0, angle, 0, 0, 70, "ootama", "relative", "70")
    wait(10)
    m = 0
    aimAtTarget()
    spawnBulletResist("normal", "#ffdd33", 0, angle, 0, 0, 70, "ootama", "relative", "70")
    wait(10)
    m = 0
    aimAtTarget()
    spawnBulletResist("normal", "#ffdd33", 0, angle, 0, 0, 70, "ootama", "relative", "70")
    wait(10)
}
    `,
    bulletScript: `
    once {
    m = 1
}
if (isTouchEdge) {
    aimAtTarget()
    spriteAngle = angle
    speed = 0
    m = 0
}
if (m===0) {
    for (let i = 0; i < 5; i++) {
        rang = random(0,360)
        spawnRing("normal", "#ff3333", 300, rang, 36, 0, 0, 9, "star", "relative", "6")
        wait(0.05)
    }
    m = 1
}
if (m === 1) {
    speed += 2.5
}
    `,
    magicCircleScript: `
    spriteAngle += 3
    `
    },
    {
    difficulty: "NORMAL",
    name: "弾幕の檻",
    desc: "自機狙いと自機外しの弾が発射され、壁に当たるとレーザーを放つ。もちろん殺意の百合のオマージュ",
    duration: 15,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
    while (true) {
    aimAtTarget()
    spawnWay("normal", "#ff3333", 500, angle, 5, 20, 0, 0, 30, "ootama", "relative", "15")
    wait(0.1)
    aimAtTarget()
    spawnWay("normal", "#ff3333", 500, angle + 50, 5, 20, 0, 0, 30, "ootama", "relative", "15")
    wait(0.1)
    aimAtTarget()
    spawnWay("normal", "#ff3333", 500, angle - 50, 5, 20, 0, 0, 30, "ootama", "relative", "15")
    wait(2)
    aimAtTarget()
    for (let i = 0; i < 36; i++) {
        spawnWay("normal", "#3333ff", 500, angle, 1, 10, 0, 0, 20, "ohuda", "relative", "6")
        angle += 25
        wait(0.01)
    }
    wait(3)
}
    `,
    bulletScript: `
    if (color != #ffffff) {
    if (x > 758) {
        angle = 180
        warningTime = 1
        activeTime = 1.5
        laserWidth = 20
    }
    if (y < 10) {
        angle = 90
        warningTime = 1
        activeTime = 1.5
        laserWidth = 20
    }
    if (x < 10) {
        angle = 0
        warningTime = 1
        activeTime = 1.5
        laserWidth = 20
    }
    if (y > 886) {
        angle = 270
        warningTime = 1
        activeTime = 1.5
        laserWidth = 20
    }
}
    `,
    magicCircleScript: `
    `
    },
    {
    difficulty: "EASY",
    name: "超絶気合符「インフィニットスパイラル」",
    desc: "楽しい！好き！",
    duration: 15,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
    for (let i = 0; i < 1200000000; i++) {
    spawnRing("normal", "#ff3333", 200, angle, 36 + way, 0, 0, 20, "ohuda", "relative", "6")
    way += 2
    angle += 16
    wait(0.26)
}
while (true) {
    moveTo("center")
}
    `,
    bulletScript: `
    if (isBounced) {
    y = -80000
}
if (y > 886) {
    y = -80000
}
    `,
    magicCircleScript: `
    `
    },
    {
    difficulty: "HARD",
    name: "技符「陰陽掃除機」",
    desc: "完全パターンスペル。そこそこ作るのに苦労しました",
    duration: 30,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
    while (true) {
    spawnBulletResist("normal", "#ff3333", 150, 45, 0, 0, 100, "b_knife", "relative", "40")
    spawnBulletResist("normal", "#ff3333", 150, 45 + 90 + 90, 0, 0, 100, "b_knife", "relative", "40")
    wait(200)
}
    `,
    bulletScript: `
    once {
    shotTimer = 0
}
speed += 2
spriteAngle = angle
if (y > 886) {
    angle = -angle
    speed = 150
    y = 886
}
if (y < 10) {
    angle = -angle
    speed = 150
    y = 10
}
if (x < 10) {
    angle = 180 - angle
    speed = 150
    x = 10
}
if (x > 758) {
    angle = 180 - angle
    speed = 150
    x = 758
}
shotTimer = shotTimer + 1
if (shotTimer >= 12) {
    spawnWay("normal", "#3388ff", 200, angle + 180, 5, 72, 0, 0, 6, "onmyoutama", "relative", "6")
    shotTimer = 0
}
    `,
    magicCircleScript: `
    spriteAngle += 5
    `
    },
    {
    difficulty: "HARD",
    name: "上は洪水下は大火事",
    desc: "普通にお気に入りのスペル！楽しい！",
    duration: 32,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
    while (true) {
    angle = -90 + random(-20,20)
    if (cardSecond == 15..30) {
        angle += random(-30,30)
    }
    if (cardSecond == 30..35) {
        angle += random(-50,50)
    }
    spawnBullet("normal", "#ff3333", 200, angle, 0, 886, 20, "poihuru", "relative", "10")
    if (cardSecond == 0..15) {
        wait(0.05)
    }
    if (cardSecond == 15..30) {
        wait(0.02)
    }
    if (cardSecond == 30..35) {
        wait(0.0002)
    }
}
    `,
    bulletScript: `
    if (color == #ff3333) {
    if (y < 0) {
        angle = 90 + random(-5,5)
        speed = 5
        color = #33ffff
        y = 5
    }
    speed += 0.4
}
if (color == #33ffff) {
    speed += 2
}
spriteAngle = angle
    `,
    magicCircleScript: `
    `
    },{
    difficulty: "NORMAL",
    name: "フラッシュレートレイン",
    desc: "雨と巨大レーザー！",
    duration: 30,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
for (let i = 0; i < 1200000; i++) {
    spawn = random(0,768)
    for (let i = 0; i < 3; i++) {
        spawnBullet("normal", "#ff3333", 300, 90, 0, -200, 7, "uroko", "relative", "4")
        wait(0.03)
    }
}
for (let i = 0; i < 1200000; i++) {
    spawn2 = random(0,768)
    for (let i = 0; i < 5; i++) {
        spawnBullet("normal", "#ff3323", 300, 90, 0, -200, 7, "uroko", "relative", "4")
        wait(0.03)
    }
}
for (let i = 0; i < 1200000; i++) {
    spawn3 = random(0,768)
    for (let i = 0; i < 7; i++) {
        spawnBullet("normal", "#ff3332", 300, 90, 0, -200, 7, "uroko", "relative", "4")
        wait(0.03)
    }
}
while (true) {
    wait(4)
    spawnBullet("normal", "#33ffff", 200, 90, 0, -150)
}
    `,
    bulletScript: `
once {
    if (color == #ff3333) {
        x = spawn
    }
    if (color == #ff3332) {
        x = spawn2
    }
    if (color == #ff3323) {
        x = spawn3
    }
    if (color == #33ffff) {
        x = tx
        warningTime = 3
        activeTime = 1.5
        laserWidth = 900
    }
    wait(0.1)
}
if (y > 896) {
    y = -580000
}
    `,
    magicCircleScript: `
    `
},
{
    difficulty: "Lunatic",
    name: "札と刃の境界",
    desc: "うおっ、となるスペルです。",
    duration: 65,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 10,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    for (let i = 0; i < 20; i++) {
        ys = 0
        for (let i = 0; i < 10; i++) {
            spawnBullet("normal", "#33ffff", 120, 0, -100, ys + 15, 23, "ohuda", "absolute", "12")
            spawnBullet("normal", "#33ffff", 120, 0, -100, ys - 15, 23, "ohuda", "absolute", "12")
            ys += 100
        }
        ys = 0
        for (let i = 0; i < 10; i++) {
            spawnBullet("normal", "#33ff88", 120, 180, 868, ys + 65, 23, "ohuda", "absolute", "12")
            spawnBullet("normal", "#33ff88", 120, 180, 868, ys + 35, 23, "ohuda", "absolute", "12")
            ys += 100
        }
        wait(0.7)
    }
    wait(1)
    for (let i = 0; i < 20; i++) {
        xs = 0
        for (let i = 0; i < 10; i++) {
            spawnBullet("normal", "#33ffff", 120, 90, xs + 15, 0, 23, "ohuda", "absolute", "12")
            spawnBullet("normal", "#33ffff", 120, 90, xs - 15, 0, 23, "ohuda", "absolute", "12")
            xs += 100
        }
        xs = 0
        for (let i = 0; i < 10; i++) {
            spawnBullet("normal", "#33ff88", 120, -90, xs + 15 + 50, 996, 23, "ohuda", "absolute", "12")
            spawnBullet("normal", "#33ff88", 120, -90, xs - 15 + 50, 996, 23, "ohuda", "absolute", "12")
            xs += 100
        }
        wait(0.7)
    }
    wait(1)
    for (let i = 0; i < 20; i++) {
        xs = -650
        ys = 550
        for (let i = 0; i < 25; i++) {
            xs -= 11
            ys += 11
            spawnBullet("normal", "#33ffff", 120, 45, xs, ys, 23, "ohuda", "absolute", "12")
            xs += 22
            ys -= 22
            spawnBullet("normal", "#33ffff", 120, 45, xs, ys, 23, "ohuda", "absolute", "12")
            xs -= 11
            ys += 11
            xs += 71
            ys -= 71
        }
        xs = 1500
        ys = 357
        for (let i = 0; i < 25; i++) {
            xs += 11
            ys -= 11
            spawnBullet("normal", "#33ff88", 120, 225, xs, ys, 23, "ohuda", "absolute", "12")
            xs -= 22
            ys += 22
            spawnBullet("normal", "#33ff88", 120, 225, xs, ys, 23, "ohuda", "absolute", "12")
            xs += 11
            ys -= 11
            xs -= 71
            ys += 71
        }
        wait(0.7)
    }
    wait(2)
    for (let i = 0; i < 20; i++) {
        xs = 1418
        ys = 550
        for (let i = 0; i < 25; i++) {
            xs -= 11
            ys -= 11
            spawnBullet("normal", "#33ffff", 120, 135, xs, ys, 23, "ohuda", "absolute", "12")
            xs += 22
            ys += 22
            spawnBullet("normal", "#33ffff", 120, 135, xs, ys, 23, "ohuda", "absolute", "12")
            xs -= 11
            ys -= 11
            xs -= 71
            ys -= 71
        }
        xs = -732
        ys = 357
        for (let i = 0; i < 25; i++) {
            xs -= 11
            ys -= 11
            spawnBullet("normal", "#33ff88", 120, 315, xs, ys, 23, "ohuda", "absolute", "12")
            xs += 22
            ys += 22
            spawnBullet("normal", "#33ff88", 120, 315, xs, ys, 23, "ohuda", "absolute", "12")
            xs -= 11
            ys -= 11
            xs += 71
            ys += 71
        }
        wait(0.7)
    }
    wait(2)
}
while (true) {
    xdao = tx
    spawnWay("normal", "#ff3333", 1, angle, 1, 20, xdao, 0, 30, "knife", "absolute", "6")
    wait(1)
}
    `,
    bulletScript: `
if (color==#ff3333) {
    once {
        x = tx
        angle = 90
    }
    speed += 1
}
if (speed == 50..10000) {
    speed = speed / 1.0005
}
if (speed == 200..202) {
    angle += random(0,0)
}
once {
    speed += 40
}
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "Hard",
    name: "双毒「絡みつく赤大蛇」",
    desc: "クリアチェックはしました。",
    duration: 60,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    if (cardSecond == 0..15) {
        xs = random(-600,600)
        spawnBullet("normal", "#33ffff", 200, 90, 0, -200, 10, "onmyoutama", "relative", "10")
        wait(0.1)
    }
}
while (true) {
    if (cardSecond == 15..30) {
        xs = random(-600,600)
        spawnBullet("normal", "#33ffff", 200, 90, 0, -200, 10, "onmyoutama", "relative", "10")
        wait(0.06)
    }
}
while (true) {
    if (cardSecond == 30..60) {
        xs = random(-600,600)
        spawnBullet("normal", "#33ffff", 200, 90, 0, -200, 10, "onmyoutama", "relative", "10")
        wait(0.04)
    }
}
while (true) {
    if (cardSecond == 15..60) {
        xs = random(-600,600)
        spawnBullet("normal", "#ffaa33", 200, 90, 0, -200, 30, "onmyoutama", "relative", "35")
        wait(0.4)
    }
}
while (true) {
    if (cardSecond == 35..60) {
        xs = random(-600,600)
        spawnBullet("normal", "#ffaa33", 200, 90, 0, -200, 30, "onmyoutama", "relative", "35")
        wait(0.4)
    }
}
while (true) {
    if (cardSecond == 0..15) {
        for (let i = 0; i < 8; i++) {
            spawnBullet("normal", "#ff3333", 300, angle, 0, 0, 30, "b_uroko", "relative", "20")
            spawnBullet("normal", "#ff3333", 300, -angle, 0, 0, 30, "b_uroko", "relative", "20")
            angle += 10
            wait(0.05)
        }
    }
    if (cardSecond == 15..30) {
        for (let i = 0; i < 16; i++) {
            spawnBullet("normal", "#ff3333", 300, angle, 0, 0, 30, "b_uroko", "relative", "20")
            spawnBullet("normal", "#ff3333", 300, -angle, 0, 0, 30, "b_uroko", "relative", "20")
            angle += 10
            wait(0.05)
        }
    }
    if (cardSecond == 30..45) {
        for (let i = 0; i < 24; i++) {
            spawnBullet("normal", "#ff3333", 300, angle, 0, 0, 30, "b_uroko", "relative", "20")
            spawnBullet("normal", "#ff3333", 300, -angle, 0, 0, 30, "b_uroko", "relative", "20")
            angle += 10
            wait(0.05)
        }
    }
    if (cardSecond == 45..60) {
        for (let i = 0; i < 32; i++) {
            spawnBullet("normal", "#ff3333", 300, angle, 0, 0, 30, "b_uroko", "relative", "20")
            spawnBullet("normal", "#ff3333", 300, -angle, 0, 0, 30, "b_uroko", "relative", "20")
            angle += 10
            wait(0.05)
        }
    }
    wait(0.8)
    angle += 20
}
while (true) {
    if (cardSecond == 45..60) {
        aimAtTarget()
        spawnWay("normal", "#ffdd33", 400, angle, 3, 30, 0, 0, 30, "onmyoutama", "relative", "35")
        wait(1)
    }
}
    `,
    bulletScript: `
if (color == #ff3333) {
    if (timer == 1..1.4) {
        speed += -7
    }
    if (timer == 1.4..2) {
        speed = 300
        once {
            aimAtTarget()
            if (cardSecond == 30..60) {
                angle += random(-3,3)
            }
        }
    }
}
if (color == #33ffff) {
    speed = 150
    m += 5
    once {
        y = 0
        xs = random(-600,600)
        x += xs
    }
}
if (color == #ffaa33) {
    speed = 100
    m += 5
    once {
        y = 0
        xs = random(-600,600)
        x += xs
    }
}
if (color == #ffdd33) {
    m += 5
}
if (cardSecond == 15) {
    y = -8000
}
if (cardSecond == 30) {
    y = -8000
}
if (cardSecond == 45) {
    y = -8000
}
spriteAngle = angle + m
if (dist < 50) {
    y = y
}
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "LUNATIC",
    name: "旋風「ビッグトルネード」",
    desc: "圧倒的弾速、圧倒的気合避け",
    duration: 25,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    angle = 0
    for (let i = 0; i < 3; i++) {
        spawnWay("normal", "#ff3333", 1000, angle + 45, 20, 18, 0, 0, 30, "ootama", "relative", "15")
        wait(0.08)
    }
    angle = 9
    for (let i = 0; i < 3; i++) {
        spawnWay("normal", "#ff3333", 1000, angle + 45, 20, 18, 0, 0, 30, "ootama", "relative", "15")
        wait(0.08)
    }
}
    `,
    bulletScript: `
once {
    angle += random(-2,2)
    speed += random(0,0)
}
if (speed == 400..100000) {
    speed += -5
}
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "NORMAL",
    name: "偽符「ダブルスパイル」",
    desc: "攻略法が分かると簡単なタイプ。",
    duration: 25,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 7,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    for (let i = 0; i < 10; i++) {
        spawnWay("normal", "#ff3333", 35000, angle, 10, 36, 384, 448, 10, "marutama", "absolute", "4")
        wait(0.05)
        angle += 2
    }
    for (let i = 0; i < 10; i++) {
        spawnWay("normal", "#ff3333", 35000, angle, 10, 36, 384, 448, 10, "marutama", "absolute", "4")
        wait(0.05)
        angle -= 9
    }
}
    `,
    bulletScript: `
if (frame = 30..30000) {
    if (x == 374..394) {
        if (y == 438..458) {
            color = #3333ff
        }
    }
}
if (frame = 2..3) {
    angle += 180
    speed = 200
}
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "EASY",
    name: "秘儀「十三頭の龍」",
    desc: "結構いい感じに作れました。下からの反射を追加したことでそこそこの難易度になったかも...",
    duration: 30,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
for (let i = 0; i < 1200; i++) {
    aimAtTarget()
    for (let i = 0; i < 12; i++) {
        spawnp = spawnp + 1
        for (let i = 0; i < 4; i++) {
            spawnBullet("normal", "#ff3333", 300 + spd, angle, 0, 0, 10, "uroko", "relative", "5")
            spawnBullet("normal", "#ff3332", 300 + spd, angle, 0, 0, 10, "uroko", "relative", "5")
            spd += 20
        }
        spd = 0
        wait(0.02)
    }
    for (let i = 0; i < 12; i++) {
        spawnp = spawnp - 1
        for (let i = 0; i < 4; i++) {
            spawnBullet("normal", "#ff3333", 300 + spd, angle, 0, 0, 10, "uroko", "relative", "5")
            spawnBullet("normal", "#ff3332", 300 + spd, angle, 0, 0, 10, "uroko", "relative", "5")
            spd += 20
        }
        spd = 0
        wait(0.02)
    }
    spawnp = -10
    wait(0.15)
}
    `,
    bulletScript: `
if (color == #ff3333) {
    once {
        x = 379 + spawnp * 60
    }
}
if (color == #ff3332) {
    once {
        x = 379 - spawnp * 60
    }
}
if (y > 890) {
    angle = -90
}
if (y < 10) {
    y = -50000
}
if (x > 758) {
}
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "EASY",
    name: "波符「白銀のタイダルウェーブ」",
    desc: "気づいたら星蓮船四面ボスのアレみたいになってた。",
    duration: 30,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    tween("ex", ex, tx, "vecstep", 0.1)
    tween("ey", ey, ty, "vecstep", 0.1)
    wait(1 - t)
    wait(1 - t)
    wait(0.5)
    spawnRing("normal", "#ffffff", 200, 0, 72, 0, 0, 10, "b_uroko", "relative", "5")
    wait(0.2)
    spawnRing("normal", "#ffffff", 200, 0, 72, 0, 0, 10, "b_uroko", "relative", "5")
    wait(0.2)
    spawnRing("normal", "#ffffff", 200, 0, 72, 0, 0, 10, "b_uroko", "relative", "5")
    wait(0.2)
    t += 0.05
    t2 += 0.0175
}
    `,
    bulletScript: `
    speed += 1
    `,
    magicCircleScript: `
    `
},
{
    difficulty: "EASY",
    name: "白銀のタルタルソース",
    desc: "",
    duration: 20,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
for (let i = 0; i < 1200000000; i++) {
    spawnBullet("normal", "#ffffff", 200, -90 + angle, 0, 0, 30, "b_marutama", "relative", "20")
    angle = random(-50,50)
    wait(0.02)
}
while (true) {
    r = random(-100,100)
    r2 = random(-100,100)
    tween("ex", ex, 384 + r, "seconds", 0.4)
    tween("ey", ey, 370 + r2, "seconds", 0.4)
    wait(5)
}
    `,
    bulletScript: `
once {
    yp = -40
}
y += yp / 10
yp += 0.4
if (yp = -5..5) {
    SpriteAngle = 90
}
wait(0.00001)
if (yp = -5..5) {
    SpriteAngle = 90
}
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "Hard",
    name: "熱符「真紅たる太陽風」",
    desc: "交差する弾って...楽しいですよね。",
    duration: 20,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
for (let i = 0; i < 1200; i++) {
    spawnRingResist("normal", "#ff3333", 300, angle, 36, 0, 0, 10, "b_marutama", "relative", "6")
    spawnRingResist("normal", "#ff3332", 300, angle, 36, 0, 0, 10, "b_marutama", "relative", "6")
    angle += random(-5,5)
    wait(0.3)
}
    `,
    bulletScript: `
if (color == #ff3333) {
    angle += 0.2 - m
}
if (color == #ff3332) {
    angle -= 0.2 - m
}
m += 0.0003
spriteAngle = angle
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "NORMAL",
    name: "忌符「フライングスター」",
    desc: "全方位反射って難しいですよねぇ...",
    duration: 30,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
cx = 384
cy = 350
R = 200
bx = 0
by = 0
bx2 = 0
by2 = 0
angle = 0
angle2 = 0
while (true) {
    // 1ループごとに、星全体の傾きをランダム（0〜360度）で決める
    base_angle = random(0, 360)
    // 決まった傾きを足して、星の頂点座標を毎回計算し直す
    x0 = cx + R * cos(-90 + base_angle)
    y0 = cy + R * sin(-90 + base_angle)
    x1 = cx + R * cos(-18 + base_angle)
    y1 = cy + R * sin(-18 + base_angle)
    x2 = cx + R * cos(54 + base_angle)
    y2 = cy + R * sin(54 + base_angle)
    x3 = cx + R * cos(126 + base_angle)
    y3 = cy + R * sin(126 + base_angle)
    x4 = cx + R * cos(198 + base_angle)
    y4 = cy + R * sin(198 + base_angle)
    rx0 = cx + R * cos(90 + base_angle)
    ry0 = cy + R * sin(90 + base_angle)
    rx1 = cx + R * cos(162 + base_angle)
    ry1 = cy + R * sin(162 + base_angle)
    rx2 = cx + R * cos(234 + base_angle)
    ry2 = cy + R * sin(234 + base_angle)
    rx3 = cx + R * cos(306 + base_angle)
    ry3 = cy + R * sin(306 + base_angle)
    rx4 = cx + R * cos(18 + base_angle)
    ry4 = cy + R * sin(18 + base_angle)
    bx = x0
    by = y0
    bx2 = rx0
    by2 = ry0
    wait(0.3)
    star = 1
    t = 0
    // ナイフの向き（進行方向）にも傾きを足して、綺麗に星の辺に沿わせる
    angle = 72 + base_angle
    angle2 = -108 + base_angle
    tween("bx", x0, x2, "seconds", 0.3)
    tween("by", y0, y2, "seconds", 0.3)
    tween("bx2", rx0, rx2, "seconds", 0.3)
    tween("by2", ry0, ry2, "seconds", 0.3)
    wait(0.3)
    angle = -144 + base_angle
    angle2 = 36 + base_angle
    tween("bx", x2, x4, "seconds", 0.3)
    tween("by", y2, y4, "seconds", 0.3)
    tween("bx2", rx2, rx4, "seconds", 0.3)
    tween("by2", ry2, ry4, "seconds", 0.3)
    wait(0.3)
    angle = 0 + base_angle
    angle2 = 180 + base_angle
    tween("bx", x4, x1, "seconds", 0.3)
    tween("by", y4, y1, "seconds", 0.3)
    tween("bx2", rx4, rx1, "seconds", 0.3)
    tween("by2", ry4, ry1, "seconds", 0.3)
    wait(0.3)
    angle = 144 + base_angle
    angle2 = -36 + base_angle
    tween("bx", x1, x3, "seconds", 0.3)
    tween("by", y1, y3, "seconds", 0.3)
    tween("bx2", rx1, rx3, "seconds", 0.3)
    tween("by2", ry1, ry3, "seconds", 0.3)
    wait(0.3)
    angle = -72 + base_angle
    angle2 = 108 + base_angle
    tween("bx", x3, x0, "seconds", 0.3)
    tween("by", y3, y0, "seconds", 0.3)
    tween("bx2", rx3, rx0, "seconds", 0.3)
    tween("by2", ry3, ry0, "seconds", 0.3)
    wait(0.3)
    star = 0
    angle = 90 + base_angle
    angle2 = -90 + base_angle
    tween("bx", x0, cx, "seconds", 0.3)
    tween("by", y0, cy, "seconds", 0.3)
    tween("bx2", rx0, cx, "seconds", 0.3)
    tween("by2", ry0, cy, "seconds", 0.3)
    wait(0.3)
    wait(0.1)
    t = 1
    wait(0.3)
}
while (true) {
    if (star == 1) {
        spawnBullet("normal", "#ff3366", 0, angle, bx, by, 20, "b_star", "absolute", "15")
        spawnBullet("normal", "#ff3366", 0, angle2, bx2, by2, 20, "b_star", "absolute", "15")
    }
    wait(0.00005)
}
    `,
    bulletScript: `
if (e_t==1) {
    once {
        flag = 1
    }
}
if (flag=1) {
    if (speed==0..400) {
        speed += 2
    }
    if (x < 10) {
        once {
            speed = 0
            angle = -angle
            angle = angle - 180
        }
    }
    if (x > 758) {
        once {
            speed = 0
            angle = -angle
            angle = angle - 180
        }
    }
    if (y < 10) {
        once {
            speed = 0
            angle = -angle
        }
    }
    if (y > 886) {
        once {
            speed = 0
            angle = -angle
        }
    }
}
spriteAngle = spriteAngle + 3
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "NORMAL",
    name: "恕符「血濡れのアナザーディメンション」",
    desc: "どう見ても輝針城モチーフ。",
    duration: 30,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    spawnRing("normal", "#ff3333", 200, angleg, 8, 0, 0, 6, "ootama", "relative", "6")
    angleg += 16
    wait(0.6)
}
while (true) {
    offset = 0
    spawnBullet("normal", "#dddddd", 200, angle, 300, 0, 30, "b_knife", "relative", "6")
    spawnBullet("normal", "#ddddde", 200, angle, -300, 0, 30, "b_knife", "relative", "6")
    offset = 30
    spawnBullet("normal", "#dddddd", 200, angle, 300, 0, 30, "b_knife", "relative", "6")
    spawnBullet("normal", "#ddddde", 200, angle, -300, 0, 30, "b_knife", "relative", "6")
    offset = -30
    spawnBullet("normal", "#dddddd", 200, angle, 300, 0, 30, "b_knife", "relative", "6")
    spawnBullet("normal", "#ddddde", 200, angle, -300, 0, 30, "b_knife", "relative", "6")
    aimAtTarget()
    wait(0.6)
}
    `,
    bulletScript: `
while (true) {
    if (color==#ff3333) {
        radius += 0.8
        hitRadius += 0.7
        speed += 2
    }
    if (color==#dddddd) {
        radius += 1
        hitRadius += 0.2
        speed += 2
        once {
            aimAtTarget()
            angle += offset
        }
    }
    if (color==#ddddde) {
        radius += 1
        hitRadius += 0.2
        speed += 2
        once {
            aimAtTarget()
            angle += offset
        }
    }
    spriteAngle = angle
    wait(0.01)
    spriteAngle = angle
}
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "HARD",
    name: "真実「静焔のレプティリアン」",
    desc: "作ってる途中、赤色の幻想郷とレプティリアンインテリジェンスを行ったり来たりしてました。",
    duration: 35,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    angle = random(0,360)
    for (let i = 0; i < 9; i++) {
        spawnBullet("normal", "#ff3333", 300, angle, 0, 0, 40, "ootama", "relative", "30")
        angle += 40
    }
    wait(5)
    angle = random(0,360)
    for (let i = 0; i < 9; i++) {
        spawnBullet("normal", "#3333ff", 300, angle, 0, 0, 40, "ootama", "relative", "30")
        angle += 40
    }
    wait(5)
    angle = random(0,360)
    for (let i = 0; i < 9; i++) {
        spawnBullet("normal", "#ff3333", 300, angle, 0, 0, 40, "ootama", "relative", "30")
        angle += 40
    }
    wait(5)
    angle = random(0,360)
    for (let i = 0; i < 9; i++) {
        spawnBullet("normal", "#3333ff", 300, angle, 0, 0, 40, "ootama", "relative", "30")
        angle += 40
    }
    wait(5)
    angle = random(0,360)
    for (let i = 0; i < 9; i++) {
        spawnBullet("normal", "#ff3333", 300, angle, 0, 0, 40, "ootama", "relative", "30")
        angle += 40
    }
    wait(5)
    angle = random(0,360)
    for (let i = 0; i < 9; i++) {
        spawnBullet("normal", "#3333ff", 300, angle, 0, 0, 40, "ootama", "relative", "30")
        angle += 40
    }
    wait(50)
}
    `,
    bulletScript: `
if (timer < 3) {
    if (color==#ff3333) {
        angle += 0.1
    }
    if (color==#3333ff) {
        angle += -0.1
    }
}
g += 1
if (g == 40) {
    g = 0
}
if (g == 10) {
    if (color==#ff3333) {
        spawnRing("normal", "#ff3333", 250, 0, 5, 0, 0, 10, "uroko", "relative", "4")
    }
    if (color==#3333ff) {
        spawnRing("normal", "#3333ff", 250, 0, 5, 0, 0, 10, "uroko", "relative", "4")
    }
}
    `,
    magicCircleScript: `
if (timer == 3..4) {
    homing(90)
    angle += random(-1,1)
}
if (timer == 4) {
    angle += random(-5,5)
}
if (timer == 3..5) {
    speed += random(0.5,1.5)
}
if (timer == 0.1) {
    speed = 1
}
spriteAngle = angle
    `
},
{
    difficulty: "EASY",
    name: "「完全自動殺戮マシン」",
    desc: "弾から弾が出るスペルを作るのが楽しいんだよなあ！！",
    duration: 35,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    spawnBulletResist("normal", "#ff3333", 400, -15, 0, 0, 50, "ootama", "relative", "40")
    spawnBulletResist("normal", "#ff3333", 400, 195, 0, 0, 50, "ootama", "relative", "40")
    wait(1)
    spawnBulletResist("normal", "#ff3333", 400, -15, 0, 0, 50, "ootama", "relative", "40")
    spawnBulletResist("normal", "#ff3333", 400, 195, 0, 0, 50, "ootama", "relative", "40")
    wait(7)
}
    `,
    bulletScript: `
while (true) {
    bounce()
    m += 1
    if (m==12..20) {
        spawnBullet("normal", "#ff3333", spd, 90 + r, 0, 0, 30, "b_knife", "relative", "5")
        spd = random(150,250)
        r = rand(-5,5)
        m = random(0,6)
    }
}
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "NORMAL",
    name: "鋒符「尾を噛む龍」",
    desc: "万物は流転する。自らの尾を喰らう龍のように、終わりなき円環を描く。",
    duration: 35,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    spawnRingResist("normal", "#ffffff", 500, spangle, 16, 0, 0, 0, "ohuda", "relative", "0")
    wait(4 - w)
    wait(2)
    w += 0.6
    w2 += 0.1
    w3 += 10
    spangle += random(0,360)
}
    `,
    bulletScript: `
if (timer > 0.2) {
    wait(0.04)
    spawnRing("normal", "#ffffff", 0, angle, 1, 0, 0, 20, "kome", "relative", "6")
    angle += kaku
    spriteAngle = angle
}
speed = 200
if (flag != 1) {
    kaku += 2
}
if (kaku == 11..500) {
    flag = 1
}
if (flag == 1) {
    kaku -= 2
}
if (kaku == -500..-11) {
    flag = 0
}
    `,
    magicCircleScript: `
if (timer == 1) {
    speed = 50 + random(-10,50) + w3
    angle += random(-180,180)
    color = #ff3333
    hitRadius = 6
}
spriteAngle = angle
if (timer == 3 - w2) {
    y = -546546456
}
    `
},
{
    difficulty: "Lunatic",
    name: "蛇符「人間殺しの大白蛇」",
    desc: "最近こういうスペルしか作ってないｗ",
    duration: 35,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    for (let i = 0; i < 15; i++) {
        spawnBullet("normal", "#ffffff", 400, 90, spx, 0, 20, "b_uroko", "absolute", "12")
        spx += 60
        wait(0.2)
    }
    for (let i = 0; i < 15; i++) {
        spawnBullet("normal", "#ffffff", 400, 90, spx, 0, 20, "b_uroko", "absolute", "12")
        spx -= 60
        wait(0.2)
    }
}
while (true) {
    for (let i = 0; i < 5; i++) {
        aimAtTarget()
        spawnWayResist("normal", "#ff3333", 300, angle, 1 + wa, 5, 0, 0, 15, "b_poihuru", "relative", "7")
        wait(0.3)
    }
    wait(2)
    wa += 1
}
    `,
    bulletScript: `
if (color == #ffffff) {
    period = 60
    amp = 30
    baseAngle = 90
    frame2 = 0
    y = random(-200,0)
    x += random(-30,30)
    while (true) {
        frame2 += 1
        l += 1
        angle = baseAngle - amp * sin(frame2 * 360 / period)
        spriteAngle = angle
        if (l == 3) {
            spawnRing("normal", "#ffffff", 0, angle + 180, 1, 0, 0, 12, "b_marutama", "relative", "12")
            l = 0
        }
    }
}
    `,
    magicCircleScript: `
if (timer > 1) {
    y = -8000
}
    `
},
{
    difficulty: "EASY",
    name: "獄符「スターアンドプリズン」",
    desc: "上下で挟んでくるタイプの弾幕。ちなみにガチで苦手。",
    duration: 35,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    ey = 448
    wait(0.5)
    for (let i = 0; i < 1000000000000; i++) {
        spawnRing("normal", "#ffff66", 35000, angle, 6, 0, 0, 30, "b_star", "relative", "20")
        spawnRing("normal", "#ffff66", 35000, -angle, 6, 0, 0, 30, "b_star", "relative", "20")
        angle += 6
        wait(0.5)
    }
}
if (x < 10) {
}
    `,
    bulletScript: `
once {
    wait(0.02)
    speed = 200
    angle += 180
}
spriteAngle = angle + m
m += 5
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "NORMAL",
    name: "ドパ符「ドーパミンの極致」",
    desc: "ドーパドパドパドパｗｗｗｗｗドーパミンの放出は楽しいドパねぇｗｗｗｗｗｗｗｗ",
    duration: 10,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    for (let i = 0; i < 100; i++) {
        spawnRing("normal", "#ff3333", 600, angle, 4, 0, 0, 15, "b_uroko", "relative", "10")
        angle += random(0,360)
        wait(0.01)
    }
    for (let i = 0; i < 50; i++) {
        spawnRing("normal", "#ffaa33", 700, angle, 2, 0, 0, 40, "ootama", "relative", "30")
        angle += 12.2
        wait(0.02)
    }
    for (let i = 0; i < 50; i++) {
        aimAtTarget()
        angle += random(-7,7)
        spawnWay("normal", "#ffdd33", 700, angle, 5, 25, 0, 0, 20, "b_ohuda", "relative", "10")
        wait(0.0167)
    }
    for (let i = 0; i < 50; i++) {
        angle += 25
        w = 0
        sp = 0
        for (let i = 0; i < 7; i++) {
            spawnWay("normal", "#33ff88", 300 + sp, angle, 1 + w, 2, 0, 0, 20, "b_poihuru", "relative", "20")
            w += 1
            sp += 30
        }
        wait(0.03)
    }
    for (let i = 0; i < 20; i++) {
        angle = random(-80,80)
        spawnWay("normal", "#3388ff", 700, -90 + angle, 3, 10, 0, 0, 30, "b_star", "relative", "20")
        wait(0.05)
    }
    for (let i = 0; i < 50; i++) {
        xsp = random(0,768)
        spawnWay("normal", "#9E76B4", 700, 90, 1, 10, 0, 0, 10, "poihuru", "relative", "6")
        wait(0.02)
    }
    for (let i = 0; i < 500000; i++) {
        for (let i = 0; i < 10; i++) {
            spawnRing("normal", "#ff3333", 600, angle, 4, 0, 0, 15, "b_uroko", "relative", "10")
            angle += random(0,360)
            wait(0.01)
        }
        for (let i = 0; i < 10; i++) {
            spawnRing("normal", "#ffaa33", 700, angle, 2, 0, 0, 40, "ootama", "relative", "30")
            angle += 12.2
            wait(0.02)
        }
        for (let i = 0; i < 10; i++) {
            aimAtTarget()
            angle += random(-7,7)
            spawnWay("normal", "#ffdd33", 700, angle, 5, 25, 0, 0, 20, "b_ohuda", "relative", "10")
            wait(0.02)
        }
        for (let i = 0; i < 10; i++) {
            angle += 25
            w = 0
            sp = 0
            for (let i = 0; i < 7; i++) {
                spawnWay("normal", "#33ff88", 300 + sp, angle, 1 + w, 2, 0, 0, 20, "b_poihuru", "relative", "20")
                w += 1
                sp += 30
            }
            wait(0.04)
        }
        for (let i = 0; i < 10; i++) {
            angle = random(-80,80)
            spawnWay("normal", "#3388ff", 700, -90 + angle, 3, 10, 0, 0, 30, "b_star", "relative", "20")
            wait(0.05)
        }
        for (let i = 0; i < 10; i++) {
            xsp = random(0,768)
            spawnWay("normal", "#9E76B4", 700, 90, 1, 10, 0, 0, 10, "poihuru", "relative", "6")
            wait(0.02)
        }
    }
}
    `,
    bulletScript: `
if (color==#3388ff) {
    if (y < 10) {
        angle = 90
    }
    spriteAngle += 5
}
if (color==#9E76B4) {
    once {
        xsp = random(-200,968)
        x = xsp
        y = 0
    }
    homing(10)
    spriteAngle = angle
}
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "LUNATIC",
    name: "奇跡「九字切り」",
    desc: "どうみても早苗のパクリです。本当にありがとうございました。",
    duration: 60,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 10,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    xp = 0
    for (let i = 0; i < 30; i++) {
        xp += 60
        spawnWayResist("normal", "#ff3333", 100, -90, 1, 0, xp + ex - 700, ey, 10, "none", "absolute", "10")
        spawnWayResist("normal", "#ff3333", 100, 90, 1, 0, xp + ex - 700, ey, 10, "none", "absolute", "10")
        wait(0.01)
    }
    wait(0.4)
    yp = 0
    for (let i = 0; i < 30; i++) {
        yp += 60
        spawnWayResist("normal", "#ff3333", 100, 0, 1, 0, ex, ey + yp - 700, 10, "none", "absolute", "10")
        spawnWayResist("normal", "#ff3333", 100, 180, 1, 0, ex, ey + yp - 700, 10, "none", "absolute", "10")
        wait(0.01)
    }
    wait(2)
    mx = random(200,568)
    tween("ex", ex, mx, "seconds", 1)
    my = random(100,443)
    tween("ey", ey, my, "seconds", 1)
    wait(1.2)
}
once {
    w = 0.6
}
while (true) {
    spawnRing("normal", "#ffffff", 200, fff, 36, 0, 0, 10, "b_uroko", "relative", "6")
    fff += 5
    wait(0.4)
    wait(w)
    w -= 0.005
}
    `,
    bulletScript: `
if (color == #ff3333) {
    speed = 0
    warningTime = 1
    activeTime = 2
    laserWidth = 12
}
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "LUNATIC",
    name: "威符「完全無欠の幾何学牢」",
    desc: "こいしのアレのパクリ",
    duration: 50,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    spawnWay("normal", "#ff3333", 100, 0 + m, 3, 60, 0, ty, 20, "b_knife", "absolute", "4")
    spawnWay("normal", "#3388ff", 100, 180 + m, 3, 60, 768, ty, 20, "b_knife", "absolute", "4")
    spawnWay("normal", "#ffdd33", 100, 90 + m, 3, 60, tx, 0, 20, "b_knife", "absolute", "4")
    spawnWay("normal", "#33ff88", 100, -90 + m, 3, 60, tx, 896, 20, "b_knife", "absolute", "4")
    wait(0.07)
}
    `,
    bulletScript: `
        // 弾挙動の独自コード
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "NORMAL",
    name: "フラッシュアンドブラスト",
    desc: "マインブラストみたいなのが作ってみたくて...",
    duration: 44,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    ey = 448
    aimAtTarget()
    for (let i = 0; i < 25; i++) {
        angle += random(-20,20)
        spawnBulletResist("normal", "#ffdd33", 200, angle, 0, 0, 30, "light", "relative", "30")
        wait(0.04)
    }
    wait(6)
}
if (x < 10) {
}
    `,
    bulletScript: `
if (color==#ffdd33) {
    if (isTouchEdge) {
        for (let i = 0; i < 2; i++) {
            spd = random(100,400)
            ang = random(0,360)
            wa = random(3,16)
            sz = random(5,20)
            spawnRing("normal", "#ffaa33", spd, ang, wa, 0, 0, sz, "light", "relative", sz)
        }
        speed = 0
        auraIntensity = 2.5
        for (let i = 0; i < 20; i++) {
            auraRange += 1
            auraIntensity -= 0.1
            hitRadius += 12
            wait(0.03)
        }
        for (let i = 0; i < 10; i++) {
            auraRange += 1
            auraIntensity -= 0.1
            hitRadius -= 8
            radius -= 2
            wait(0.03)
        }
        y = -8000
    }
}
if (color==#ff3333) {
    angle += 5
    spriteAngle = angle
}
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "EASY",
    name: "輝く双炎の地",
    desc: "光弾を使ってみたかった。",
    duration: 35,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
for (let i = 0; i < 12000; i++) {
    spawnBullet("normal", "#ff3333", 200, angle2, 0, 0, 25, "light", "relative", "25")
    angle2 += 6
    wait(0.02 - t)
    wait(0.01)
    t += 0.00001
}
for (let i = 0; i < 12000; i++) {
    aimAtTarget()
    spawnBullet("normal", "#33ffff", 200, angle, 0, 0, 30, "light", "relative", "30")
    wait(0.8)
}
    `,
    bulletScript: `
        // 弾挙動の独自コード
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "NORMAL",
    name: "雷符「ライトニングスパーク」",
    desc: "どうみてもマスパ",
    duration: 30,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    playSound("charge")
    aimAtTarget()
    for (let i = 0; i < 150; i++) {
        spd = random(8500,14000)
        angle2 += random(0,360)
        spawnBullet("normal", "#fffffe", spd, angle2, 0, 0, 10, "light", "relative", "10")
        wait(0.01)
    }
    wait(0.5)
    playSound("maspa_long")
    sp = 1
    for (let i = 0; i < 5000; i++) {
        ang = angle
        ag = angle
        ang += random(-40,40)
        spawnBulletResist("normal", "#ffff99", 1500, ang, 0, 0, 30, "light", "relative", "20")
        wait(0.000005)
        angle += 0.001
    }
    sp = 0
    wait(2)
}
while (true) {
    if (cardSecond == 3..757575757) {
        angle2 += random(0,360)
        spawnRing("normal", "#ffdd33", 300, angle2, 10, 0, 0, 15, "b_star", "relative", "7")
        wait(0.2)
    }
}
    `,
    bulletScript: `
if (color==#fffffe) {
    if (frame == 2..3) {
        speed = 320
        once {
            angle += 180
        }
    }
    if (frame == 20..3000) {
        if (x == 374..394) {
            y = -8000
        }
    }
}
if (color==#ffff99) {
    once {
        tween("angle", angle, ag, "seconds", 0.6)
        auraRange = 5.5
        auraIntensity = 0.1
    }
}
spriteAngle += 3
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "NORMAL",
    name: "彩符「天使の光輪」",
    desc: "結構面白く作れたと思う。難易度はしらん。",
    duration: 30,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 7,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
for (let i = 0; i < 50000; i++) {
    ey = 350
    for (let i = 0; i < 72; i++) {
        spawnBullet("normal", "#ff33aa", 200, angle, 0, 0, 8, "light", "relative", "6")
        spawnBullet("normal", "#33ff88", 200, angle, 0, 0, 8, "light", "relative", "6")
        henkat = random(1.5,2)
        spawnBullet("normal", "#3388ff", 200, angle, 0, 0, 8, "light", "relative", "6")
        henkat = random(0.5,1)
        spawnBullet("normal", "#ffdd33", 200, angle, 0, 0, 8, "light", "relative", "6")
        henkat = random(0.5,1)
        spawnBullet("normal", "#ffaa33", 200, angle, 0, 0, 8, "light", "relative", "6")
        henkat = random(1.5,2)
        spawnBullet("normal", "#ff3333", 200, angle, 0, 0, 8, "light", "relative", "6")
        angle += 5
    }
    wait(5)
}
    `,
    bulletScript: `
if (timer == henkat) {
    if (color == #ff3333) {
        once {
            aimAtTarget()
        }
    }
}
if (color==#ffdd33) {
    if (timer == henkat..henkat+3) {
        angle += 1
    }
}
if (color==#ffaa33) {
    if (timer == henkat..henkat+3) {
        angle -= 1
    }
}
if (color==#33ff88) {
    if (isTouchEdge) {
        once {
            bounce()
        }
    }
}
if (color==#ff33aa) {
    if (dist < 150) {
        speed = 100
    }
}
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "NORMAL",
    name: "「処刑人の剣」",
    desc: "気合避けスペルを作った。",
    duration: 40,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    spawnRing("normal", "#ff3333", 200, angle, 8, 0, 0, 30, "sword", "relative", "6")
    spawnRing("normal", "#ff3333", 200, -angle, 8, 0, 0, 30, "sword", "relative", "6")
    angle += 5.2
    wait(0.05)
}
while (true) {
    ex = tx
}
    `,
    bulletScript: `
speed += 1
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "NORMAL",
    name: "橙藍",
    desc: "とても好み。",
    duration: 40,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
once {
    t = 1.5
}
for (let i = 0; i < 1200; i++) {
    spawnRingResist("normal", "#ff5100", 200, angle, 36, 0, 0, 20, "light", "relative", "15")
    angle = random(0,360)
    wait(0.5)
    wait(t)
    t -= 0.05
}
    `,
    bulletScript: `
wait(2)
spawnRing("normal", "#6200ff", 120, angle, 4, 0, 0, 6, "light", "relative", "6")
wait(2)
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "Easy",
    name: "流符「弾幕の川」",
    desc: "軌道意味不明！",
    duration: 25,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
for (let i = 0; i < 12000; i++) {
    spawnBullet("normal", "#ffffff", 300, ang, 0, 0, 20, "light", "relative", "15")
    spawnBullet("normal", "#ffffff", 300, ang + 180, 0, 0, 20, "light", "relative", "15")
    spawnBullet("normal", "#ffffff", 300, ang + 90, 0, 0, 20, "light", "relative", "15")
    spawnBullet("normal", "#ffffff", 300, ang + 180 + 90, 0, 0, 20, "light", "relative", "15")
    ang += 4 + random(1,6)
    wait(0.06)
}
    `,
    bulletScript: `
if (color == #ffffff) {
    period = 120
    amp = 60
    baseAngle = angle
    frame2 = 0
    while (true) {
        frame2 += 1
        l += 1
        angle = baseAngle - amp * sin(frame2 * 360 / period)
        spriteAngle = angle
        if (l == 3) {
            l = 0
        }
    }
}
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "Hard",
    name: "核熱「核分裂」",
    desc: "弾幕作りあるある。最初に作る弾幕を決めるんじゃなくて適当に作ってそれっぽい名前にする",
    duration: 33,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
for (let i = 0; i < 6; i++) {
    ey = 448
    playSound("charge2")
    wait(1.15)
    spawnRingResist("normal", "#ff3333", 50, -90, 4 + w, 0, 0, 10, "light", "relative", "10")
    playSound("don00")
    wait(3.5)
    w += 1
}
    `,
    bulletScript: `
if (timer == 0..0.9) {
    radius += 1
    hitRadius += 1
    speed += 1
    auraIntensity += 0.2
}
if (isTouchEdge) {
    spawnRing("normal", "#ff8811", 200, angle + 5, 36, 0, 0, 30, "light", "relative", "25")
    y = -80000
}
    `,
    magicCircleScript: `
if (timer == 0.2..1) {
    radius -= 0.2
    hitRadius -= 0.2
}
    `
},
{
    difficulty: "EASY",
    name: "四季符「完全な四種の季節」",
    desc: "6個も残機あるなら、55秒の超激ムズスペルでも許されますよね...?",
    duration: 55,            // 制限時間（秒）
    maxMisses: 6,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    spawnBullet("normal", "#3388ff", 200, angle, 0, 0, 8, "light", "relative", "6")
    spawnBullet("normal", "#ffdd33", 200, angle, 0, 0, 8, "light", "relative", "6")
    spawnBullet("normal", "#33ff88", 200, angle, 0, 0, 8, "light", "relative", "6")
    spawnBullet("normal", "#ff33aa", 200, angle, 0, 0, 8, "light", "relative", "6")
    angle = random(40,140)
    wait(0.05)
}
while (true) {
    wait(1)
    r = random(-50,100)
    tween("ex", ex, 100 + r, "seconds", 0.5, "easeOut")
    r = random(-50,100)
    tween("ey", ey, 100 + r, "seconds", 0.5, "easeOut")
    playSound("shot")
    if (cardSecond == 20..60) {
        spawnRing("normal", "#ffffff", 200, 0, 36, 0, 0, 8, "light", "relative", "6")
    }
    wait(0.5)
    r = random(-50,100)
    tween("ex", ex, 700 + r, "seconds", 0.5, "easeOut")
    r = random(-50,100)
    tween("ey", ey, 100 + r, "seconds", 0.5, "easeOut")
    playSound("shot")
    if (cardSecond == 20..60) {
        spawnRing("normal", "#ffffff", 200, 0, 36, 0, 0, 8, "light", "relative", "6")
    }
    wait(0.5)
    r = random(-50,100)
    tween("ex", ex, 100 + r, "seconds", 0.5, "easeOut")
    r = random(-50,100)
    tween("ey", ey, 400 + r, "seconds", 0.5, "easeOut")
    playSound("shot")
    if (cardSecond == 20..60) {
        spawnRing("normal", "#ffffff", 200, 0, 36, 0, 0, 8, "light", "relative", "6")
    }
    wait(0.5)
    r = random(-50,100)
    tween("ex", ex, 700 + r, "seconds", 0.5, "easeOut")
    r = random(-50,100)
    tween("ey", ey, 400 + r, "seconds", 0.5, "easeOut")
    playSound("shot")
    if (cardSecond == 20..60) {
        spawnRing("normal", "#ffffff", 200, 0, 36, 0, 0, 8, "light", "relative", "6")
    }
    wait(0.5)
    tween("ex", ex, 384, "seconds", 0.5, "easeOut")
    tween("ey", ey, 224, "seconds", 0.5, "easeOut")
    playSound("shot")
    if (cardSecond == 20..60) {
        spawnRing("normal", "#ffffff", 200, 0, 36, 0, 0, 8, "light", "relative", "6")
    }
    wait(4)
}
while (true) {
    spawnWayResist("normal", "#ff3333", 1000, -90, 25, 7, 0, 0, 30, "b_knife", "relative", "15")
    wait(0.05)
}
while (true) {
    if (cardSecond == 40..60) {
        aimAtTarget()
        spawnWay("normal", "#ffffff", 300, angle, 8, 12, 0, 0, 12, "uroko", "relative", "6")
        wait(0.7)
    }
}
while (true) {
    if (cardSecond == 50..60) {
        aimAtTarget()
        spawnRing("normal", "#ffffff", 300, 0, 36, 0, 0, 8, "light", "relative", "6")
        wait(0.3)
    }
}
    `,
    bulletScript: `
if (timer == 0.8) {
    if (color == #3388ff) {
        angle += random(10,15)
    }
    if (color == #33ff88) {
        angle -= random(10,15)
    }
    if (color == #ffdd33) {
        angle += random(-15,15)
    }
}
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "Normal",
    name: "華符「白銀の結晶」",
    desc: "たまには展開される系の弾幕も作る。",
    duration: 30,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 8,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    playSound("shot")
    ang = 10
    for (let i = 0; i < 20; i++) {
        spawnRing("normal", "#ffffff", 100 + spdd, 95, 35, 0, 0, 15, "b_uroko", "relative", "1")
        spdd += 10
        ang -= 1
    }
    spdd = 0
    ang = 0
    wait(1.5)
    playSound("boon01")
    wait(1.5)
    playSound("shot")
    ang = -10
    for (let i = 0; i < 20; i++) {
        spawnRing("normal", "#ffffff", 100 + spdd, 95, 35, 0, 0, 15, "uroko", "relative", "1")
        spdd += 10
        ang += 1
    }
    spdd = 0
    wait(1.5)
    playSound("boon01")
    wait(1.5)
}
    `,
    bulletScript: `
if (timer ==1.5..1.65) {
    angle += ang
}
if (timer ==0.3) {
    tween("hitRadius", 1, 8, "seconds", 6)
}
spriteAngle = angle
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "EASY",
    name: "純符「純粋な光の粒子」",
    desc: "説明文や作成者名など",
    duration: 20,            // 制限時間（秒）
    maxMisses: 0,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    spawnRingResist("normal", "#ffdd33", 200, angle, 36, 0, 0, 20, "light", "relative", "20")
    spawnRingResist("normal", "#ffdd33", 200, angle + 5, 18, 0, 0, 20, "light", "relative", "20")
    spawnRingResist("normal", "#ffdd33", 200, angle + 2.5, 18, 0, 0, 20, "light", "relative", "20")
    spawnRingResist("normal", "#ffdd33", 200, angle + 7.5, 18, 0, 0, 20, "light", "relative", "20")
    playSound("shot")
    wait(0.5)
    spawnRingResist("normal", "#ac008f", 200, angle, 36, 0, 0, 20, "light", "relative", "20")
    spawnRingResist("normal", "#ac008f", 200, angle - 5, 18, 0, 0, 20, "light", "relative", "20")
    spawnRingResist("normal", "#ac008f", 200, angle - 2.5, 18, 0, 0, 20, "light", "relative", "20")
    spawnRingResist("normal", "#ac008f", 200, angle - 7.5, 18, 0, 0, 20, "light", "relative", "20")
    playSound("shot")
    wait(0.5)
}
    `,
    bulletScript: `
        // 弾挙動の独自コード
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "Hard",
    name: "枝符「囚人の牢獄」",
    desc: "回転＆列抜け",
    duration: 40,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    playSound("shot")
    playSound("laser")
    spawnRing("normal", "#ffaa33", 200, 0, 6, 384, 448, 6, "none", "absolute", "#ff3333")
    wait(2)
    while (true) {
        for (let i = 0; i < 38; i++) {
            spawnBulletResist("normal", "#ff3333", 300, 90, xp, 0, 20, "b_knife", "absolute", "4")
            xp += 20
            wait(0.16)
            playSound("shot")
        }
        for (let i = 0; i < 38; i++) {
            spawnBulletResist("normal", "#ff3333", 300, 90, xp, 0, 20, "b_knife", "absolute", "4")
            xp -= 20
            wait(0.16)
            playSound("shot")
        }
        while (true) {
            for (let i = 0; i < 38; i++) {
                spawnBulletResist("normal", "#ff3333", 300, 90, xp, 0, 20, "b_knife", "absolute", "4")
                spawnBulletResist("normal", "#ff3333", 300, -90, 768 - xp, 896, 20, "b_knife", "absolute", "4")
                spawnBulletResist("normal", "#ff3333", 300, 0, 0, yp, 20, "b_knife", "absolute", "4")
                spawnBulletResist("normal", "#ff3333", 300, 180, 768, 896 - yp, 20, "b_knife", "absolute", "4")
                xp += 20
                yp += 23.5789473684
                wait(0.16)
                playSound("shot")
            }
            for (let i = 0; i < 38; i++) {
                spawnBulletResist("normal", "#ff3333", 300, 90, xp, 0, 20, "b_knife", "absolute", "4")
                spawnBulletResist("normal", "#ff3333", 300, -90, 768 - xp, 896, 20, "b_knife", "absolute", "4")
                spawnBulletResist("normal", "#ff3333", 300, 0, 0, yp, 20, "b_knife", "absolute", "4")
                spawnBulletResist("normal", "#ff3333", 300, 180, 768, 896 - yp, 20, "b_knife", "absolute", "4")
                xp -= 20
                yp -= 23.5789473684
                wait(0.16)
                playSound("shot")
            }
        }
    }
}
if (y > 886) {
}
while (true) {
    if (cardSecond == 15) {
        playSound("boon01")
    }
}
    `,
    bulletScript: `
if (color == #ffaa33) {
    warningTime = 0
    activeTime = 150
    laserWidth = 20
    if (cardSecond == 15..40) {
        angle += 0.2
    }
}
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "NORMAL",
    name: "上は洪水、下は大火事(リメイク)",
    desc: "光弾が実装されたのでリメイク。",
    duration: 20,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    xsp = random(0,768)
    spawnBulletResist("normal", "#ff661f", 200, angle, xsp, 896, 10, "light", "absolute", "10")
    wait(0.02)
}
    `,
    bulletScript: `
if (isTouchEdge) {
    a = random(-20,20)
    spawnWay("normal", "#ff3333", 200, -90 + a, 1, 30, 0, 0, 6, "light", "relative", "6")
    speed = 0
    auraIntensity = 2.5
    for (let i = 0; i < 20; i++) {
        auraRange += 2.5
        auraIntensity -= 0.1
        hitRadius += 12
        wait(0.03)
    }
    for (let i = 0; i < 20; i++) {
        auraRange += 1.5
        auraIntensity -= 0.01
        hitRadius -= 4
        radius -= 1
        wait(0.03)
    }
    y = -8000
}
    `,
    magicCircleScript: `
if (color == #ff3333) {
    if (y < 0) {
        angle = 90 + random(-5,5)
        speed = 5
        color = #33ffff
        y = 5
    }
}
if (color == #33ffff) {
    speed += 1.5
}
spriteAngle = angle
    `
},
{
    difficulty: "Easy",
    name: "封符「停滞するレッドマジック」",
    desc: "直近でやった作品の弾幕っぽく作っちゃう病",
    duration: 40,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 8,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    playSound("boon01")
    tween("ey", 180, 448, "seconds", 3, "easeOut")
    wait(3)
    playSound("charge2")
    wait(1.5)
    while (true) {
        playSound("shot")
        for (let i = 0; i < 4; i++) {
            for (let i = 0; i < 2; i++) {
                spawnBulletResist("normal", "#ff3333", 34000, angle, 0, 0, 8, "b_marutama", "relative", "5")
            }
            angle += 6
            wait(0.025)
        }
    }
}
    `,
    bulletScript: `
if (frame == 2..4) {
    once {
        speed = 80
        angle += 180
        angle += random(-10,10)
        speed += random(-5,5)
    }
}
if (timer == 7.5) {
    once {
        speed = 30
        color = #dddddd
    }
}
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "Hard",
    name: "奥義「弾幕結界・陽」",
    desc: "白くなった奴には当たり判定ありません",
    duration: 78,            // 制限時間（秒）
    maxMisses: 3,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 20,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    if (cardSecond == 0.1 + 10 * n) {
        offset = 0
        spawnBullet("normal", "#ffaa33", 200, agg, 0, 0, 6, "none", "relative", "3")
        offset = 72 * 1
        spawnBullet("normal", "#ffaa33", 200, agg, 0, 0, 6, "none", "relative", "3")
        offset = 72 * 2
        spawnBullet("normal", "#ffaa33", 200, agg, 0, 0, 6, "none", "relative", "3")
        offset = 72 * 3
        spawnBullet("normal", "#ffaa33", 200, agg, 0, 0, 6, "none", "relative", "3")
        offset = 72 * 4
        spawnBullet("normal", "#ffaa33", 200, agg, 0, 0, 6, "none", "relative", "3")
    }
}
while (true) {
    ey = 448
    if (cardSecond == 1..50000) {
        if (cardSecond == 0..15) {
            spawnRingResist("normal", "#ff3333", 260, -agg, 5, 0, 0, 20, "b_ohuda", "relative", "6")
            playSound("shot")
            wait(0.15)
        }
        if (cardSecond == 5) {
            playSound("change")
        }
        if (cardSecond == 10) {
            playSound("change")
        }
        if (cardSecond == 15) {
            playSound("change")
        }
        if (cardSecond == 20) {
            playSound("boon01")
        }
        if (cardSecond == 25..40) {
            spawnRingResist("normal", "#ff3333", 200, agg, 5, 0, 0, 20, "b_ohuda", "relative", "6")
            playSound("shot")
            wait(0.15)
        }
        if (cardSecond == 30) {
            playSound("change")
        }
        if (cardSecond == 35) {
            playSound("change")
        }
        if (cardSecond == 40) {
            playSound("change")
        }
        if (cardSecond == 45) {
            playSound("boon01")
        }
        if (cardSecond == 50..65) {
            spawnRingResist("normal", "#ff3332", 160, agg * -10, 5, 0, 0, 20, "b_ohuda", "relative", "6")
            playSound("shot")
            wait(0.08)
        }
        if (cardSecond == 55) {
            playSound("change")
        }
        if (cardSecond == 60) {
            playSound("change")
        }
        if (cardSecond == 65) {
            playSound("change")
        }
        if (cardSecond == 70) {
            playSound("boon01")
        }
    }
}
while (true) {
    tween("agg", 0, 360, "seconds", 15)
    wait(15)
}
    `,
    bulletScript: `
if (color==#ffaa33) {
    warningTime = 1
    activeTime = 4
    laserWidth = 60
    angle = e_agg + offset
}
if (color !=#ffaa33) {
    if (cardSecond == 5) {
        speed = 0
        color = #ffffff
        hitRadius = 0
    }
    if (cardSecond == 10) {
        speed = 0
        color = #ffffff
        hitRadius = 0
    }
    if (cardSecond == 15) {
        speed = 0
        color = #ffffff
        hitRadius = 0
    }
    if (cardSecond == 20) {
        aimAt(ex, ey)
        color = #ff3333
        hitRadius = 6
    }
    if (cardSecond == 20..25) {
        speed += 1.5
    }
    if (cardSecond == 30) {
        speed = 0
        color = #ffffff
        hitRadius = 0
    }
    if (cardSecond == 35) {
        speed = 0
        color = #ffffff
        hitRadius = 0
    }
    if (cardSecond == 40) {
        speed = 0
        color = #ffffff
        hitRadius = 0
    }
    if (cardSecond == 45) {
        aimAt(ex, ey)
        color = #ff3333
        hitRadius = 6
    }
    if (cardSecond == 45..50) {
        speed += 1.5
    }
    if (cardSecond == 55) {
        speed = 0
        color = #ffffff
        hitRadius = 0
    }
    if (cardSecond == 60) {
        speed = 0
        color = #ffffff
        hitRadius = 0
    }
    if (cardSecond == 65) {
        speed = 0
        color = #ffffff
        hitRadius = 0
    }
    if (cardSecond == 70) {
        aimAt(ex, ey)
        color = #ff3333
        hitRadius = 6
    }
    if (cardSecond == 70..73) {
        speed += 0.5
    }
}
spriteAngle = angle
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "NORMAL",
    name: "「常闇幻朧月睨」",
    desc: "説明文や作成者名など",
    duration: 30,            // 制限時間（秒）
    maxMisses: 1,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 0.1,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    idousakix = random(-200,200)
    idousakiy = random(-100,100)
    tween("ex", ex, 384 + idousakix, "seconds", 1)
    tween("ey", ey, 179 + idousakiy, "seconds", 1)
    stop = 0
    for (let i = 0; i < 40; i++) {
        spawnRing("normal", "#ff3333", 200, angle, 12, 0, 0, 6, "kome", "relative", "6")
        angle += 4
        wait(0.02)
    }
    wait(0.5)
    stop = 1
    kaisi = 0.1
    kaisi2 = 2
    for (let i = 0; i < 10; i++) {
        kaisi += 0.01
        kaisi2 += 0.1
        spawnRingResist("normal", "#3333ff", 800, angle, 24, 0, 0, 30, "b_knife", "relative", "6")
        angle += 6.5
        wait(0.02)
    }
    for (let i = 0; i < 10; i++) {
        kaisi += 0.01
        kaisi2 += 0.1
        spawnRingResist("normal", "#3333ff", 800, angle, 24, 0, 0, 30, "b_knife", "relative", "6")
        angle -= -2
        wait(0.02)
    }
    wait(1)
    stop = 2
    wait(0.5)
    stop = 0
    wait(1.5 - minus)
    minus += 0.1
}
    `,
    bulletScript: `
if (color==#ff3333) {
    if (e_stop == 0) {
        hitRadius = 12
        radius = 20
        speed = 500
    }
    if (e_stop == 1) {
        hitRadius = 0
        radius = 0
        speed = 0
    }
    if (e_stop == 2) {
        radius = 20
        speed = 0
    }
}
if (color==#3333ff) {
    if (timer == kaisi) {
        speed = 0
    }
    if (timer == kaisi2..9000) {
        speed = 600
    }
}
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},



//ここから下、💩
{
    difficulty: "NORMAL",
    name: "否符「生命搾取」",
    desc: "タッチだと簡単です。",
    duration: 32,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置否横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 0.1,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    for (let i = 0; i < 2; i++) {
        wait(1.5)
        sp = 550
        ll = 4
        for (let i = 0; i < 120; i++) {
            sp -= 5
            angle += 6 + ll
            spawnRingResist("normal", "#ff3333", 0, angle, 12, 0, 0, 6, "light", "relative", "3")
            //spawnRingResist("normal", "#ffffff", 0, angle, 20, 0, 0, 4, "none", "relative", "3")
            wait(0.03)
            ll -= 0.02
        }
        wait(2)
        wait(1.5)
        sp = 550
        ll = 4
        for (let i = 0; i < 120; i++) {
            sp -= 5
            angle -= 6 + ll
            spawnRingResist("normal", "#3333ff", 0, angle, 12, 0, 0, 6, "light", "relative", "3")
            //spawnRingResist("normal", "#ffffff", 0, angle, 20, 0, 0, 4, "none", "relative", "3")
            wait(0.03)
            ll -= 0.02
        }
        wait(2)
    }
    wait(20)
}
    `,
    bulletScript: `
once {
    hitRadius = 0
    advance(sp / 4)
    speed = 50
    wait(0.5)
    hitRadius = 3
}
if (timer == 3..6) {
    speed += 1
}
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "NORMAL",
    name: "神「暗殺神」",
    desc: "全方位反射+弾から出る+自機狙い←神すぎる",
    duration: 20,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    ey = 448
    wait(1)
    spawnRingResist("normal", "#ff3333", 200, 0, 6, 0, 0, 45, "ootama", "relative", "20")
    wait(9)
}
    `,
    bulletScript: `
if (cardFrame == 30 * n) {
    l = angle
    aimAtTarget()
    spawnRing("normal", "#ff3333", 200, angle, 3, 0, 0, 6, "light", "relative", "3")
    angle = l
}
if (x < 10) {
    once {
        bounce()
    }
}
if (x > 758) {
    once {
        bounce()
    }
}
if (y < 10) {
    once {
        bounce()
    }
}
if (y > 886) {
    once {
        angle = -angle
    }
}
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "NORMAL",
    name: "模倣「レッドマジック」",
    desc: "レミリアのそれより圧倒的に簡単。というか、ほぼ下位互換ｗ",
    duration: 20,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    wait(2)
    angle = random(0,360)
    spawnRingResist("normal", "#ff3333", 300, 0, 7, 0, 0, 60, "ootama", "relative", "40")
    playSound("shot_raw")
    wait(3)
}
    `,
    bulletScript: `
bounce()
if (cardFrame == 10 * n) {
    spangle = random(0,360)
    spawnBullet("normal", "#ff3333", 0, spangle, 0, 0, 10, "b_marutama", "relative", "4")
}
    `,
    magicCircleScript: `
if (timer == 1..4) {
    speed += 0.4
}
    `
},
{
    difficulty: "h",
    name: "「唸る秘神の牙」",
    desc: "ついにへにょりレーザー登場",
    duration: 20,            // 制限時間（秒）
    maxMisses: 0,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
for (let i = 0; i < 12000; i++) {
    spawnTrail("#00ffff", 400, angle, 0, 0, 8, 0.2, 0.3, 0.2, "false", "relative", "8")
    spawnTrail("#00ffff", 400, angle + 90, 0, 0, 8, 0.2, 0.3, 0.2, "false", "relative", "8")
    spawnTrail("#00ffff", 400, angle + 180, 0, 0, 8, 0.2, 0.3, 0.2, "false", "relative", "8")
    spawnTrail("#00ffff", 400, angle + 270, 0, 0, 8, 0.2, 0.3, 0.2, "false", "relative", "8")
    angle += random(0,40)
    wait(0.2)
    spawnLaserWay("#ff3333", 6, 450, angle, 2, 45, 0, 0, "relative", "3")
}
    `,
    bulletScript: `
period = 60 + random(-20,20)
amp = 30
baseAngle = angle
frame2 = 0
while (true) {
    frame2 += 1
    l += 1
    angle = baseAngle - amp * sin(frame2 * 360 / period)
}
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "Lunatic",
    name: "魔符「殺人の流星群」",
    desc: "シリンダーフォックスっぽいものを作ったけど多分本家よりムズいです。",
    duration: 30,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    angle = 6 + offset
    spawnRingResist("normal", "#ff3333", 0, angle, 18 + way, 0, 0, 12, "star", "relative", "4")
    spawnLaserRingResist("#ff3333", 6, 0, angle, 18 + way, 0, 0, "relative", "4")
    wait(3)
    offset += 3
    way += 1
}
    `,
    bulletScript: `
spriteAngle += 7
if (x < 10) {
    once {
        angle = -angle
        angle += 180
        speed = 0
    }
}
if (x > 758) {
    once {
        angle = -angle
        angle += 180
        speed = 0
    }
}
if (y < 10) {
    once {
        angle = -angle
        speed = 0
    }
}
if (y > 886) {
    once {
        angle = -angle
        speed = 0
    }
}
if (speed == 0..400) {
    speed += 3
}
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "h",
    name: "恋符「ミラクルスパーク」",
    desc: "っぱ、レーザーなんよ。",
    duration: 40,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    for (let i = 0; i < 3; i++) {
        aimAtTarget()
        spawnLaserRingResist("#ffdd33", 50, 15, angle, 12, 0, 0, "relative", "10")
        playSound("laser_heavy")
        wait(2)
        playSound("boon01")
        wait(3)
    }
    for (let i = 0; i < 3; i++) {
        aimAtTarget()
        spawnLaserRingResist("#ffdd33", 50, 15, angle, 12, 0, 0, "relative", "10")
        playSound("laser_heavy")
        wait(1)
        aimAtTarget()
        spawnLaserRingResist("#ffdd33", 50, 15, angle, 12, 0, 0, "relative", "10")
        playSound("laser_heavy")
        wait(1)
        playSound("boon01")
        wait(1)
        playSound("boon01")
        wait(2)
    }
    aimAtTarget()
    spawnLaserRingResist("#ffdd33", 50, 15, angle, 12, 0, 0, "relative", "10")
    playSound("laser_heavy")
    wait(0.6666666667)
    aimAtTarget()
    spawnLaserRingResist("#ffdd33", 50, 15, angle, 12, 0, 0, "relative", "10")
    playSound("laser_heavy")
    wait(0.6666666667)
    aimAtTarget()
    spawnLaserRingResist("#ffdd33", 50, 15, angle, 12, 0, 0, "relative", "10")
    playSound("laser_heavy")
    wait(0.6666666667)
    playSound("boon01")
    wait(0.6666666667)
    playSound("boon01")
    wait(0.6666666667)
    playSound("boon01")
    wait(20)
}
    `,
    bulletScript: `
if (frame == 2) {
    speed = 1500
}
if (frame == 3..870000) {
    spangle = random(0,360)
    spawnBullet("normal", "#ffdd33", 1, spangle, 0, 0, 6, "light", "relative", "6")
    wait(0.007)
}
    `,
    magicCircleScript: `
if (timer == 2..3) {
    speed += 2
}
    `
},
{
    difficulty: "NORMAL",
    name: "「混沌なる狂気」",
    desc: "予告線ありver",
    duration: 30,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 8,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    angle += random(0,360)
    wait(3)
    spawnLaserRingResist("#ff3333", 1, 400, angle, 36, 0, 0, "relative", "0")
    wait(0.5)
    spawnLaserRingResist("#33ffff", 1, 500, angle, 36, 0, 0, "relative", "0")
    wait(0.5)
    spawnLaserRingResist("#ff3333", 6, 400, angle, 36, 0, 0, "relative", "6")
    wait(0.5)
    spawnLaserRingResist("#33ffff", 6, 500, angle, 36, 0, 0, "relative", "6")
    wait(0.5)
    ex = 384 + random(-100,100)
    ey = 400 + random(-100,100)
}
    `,
    bulletScript: `
if (color==#ff3333) {
    offset = 0.8
}
if (color==#33ffff) {
    offset = -0.8
}
if (timer == 0..0.5) {
    angle += 3 * offset
}
if (timer == 0.5..1.5) {
    angle += -2 * offset
}
if (timer == 1.5..2.5) {
    angle += 7 - plus * offset
    plus += 0.2
}
if (timer == 3.5..4) {
    angle += 4 * offset
}
if (timer == 4..4.5) {
    angle -= 1 * offset
}
if (timer == 4.5..5) {
    angle += 1 * offset
}
if (timer == 5..5.5) {
    angle -= 1
}
if (timer == 5.5..6) {
    angle += 1
}
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "Lunatic",
    name: "「混沌なる狂気～Lunatic」",
    desc: "予告線なしver",
    duration: 30,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 8,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    angle += random(0,360)
    wait(4)
    spawnLaserRingResist("#ff3333", 6, 400, angle, 36, 0, 0, "relative", "6")
    wait(0.5)
    spawnLaserRingResist("#33ffff", 6, 500, angle, 36, 0, 0, "relative", "6")
    wait(0.5)
    ex = 384 + random(-100,100)
    ey = 400 + random(-100,100)
}
    `,
    bulletScript: `
if (color==#ff3333) {
    offset = 0.8
}
if (color==#33ffff) {
    offset = -0.8
}
if (timer == 0..0.5) {
    angle += 3 * offset
}
if (timer == 0.5..1.5) {
    angle += -2 * offset
}
if (timer == 1.5..2.5) {
    angle += 7 - plus * offset
    plus += 0.2
}
if (timer == 3.5..4) {
    angle += 4 * offset
}
if (timer == 4..4.5) {
    angle -= 1 * offset
}
if (timer == 4.5..5) {
    angle += 1 * offset
}
if (timer == 5..5.5) {
    angle -= 1
}
if (timer == 5.5..6) {
    angle += 1
}
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "NORMAL",
    name: "「宝永四年の赤蛇」",
    desc: "説明文や作成者名など",
    duration: 30,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 3,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    spawnBulletResist("normal", "#ff3333", 1, angle, 0, 0, 0, "none", "relative", "0")
    wait(6)
}
    `,
    bulletScript: `
if (cardFrame == 2 * n) {
    spawnBullet("normal", "#ffffff", 0, angle, rx, ry, 15, "b_marutama", "relative", "0")
}
if (cardFrame == 30 * n) {
    speed = 1600
    aimAtTarget()
}
speed += -30
    `,
    magicCircleScript: `
if (timer > 0.5) {
    hitRadius = 6
    color = = #ff3333
}
if (timer > 6) {
    y = -80000
}
    `
},
{
    difficulty: "NORMAL",
    name: "「博麗霊夢のエア結界」",
    desc: "陰陽玉を陰陽弾無しで作ったｗ",
    duration: 30,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    ey = 348
    wait(0.2)
    heru = 600000
    spawnBullet("normal", "#ff3332", 120, angle, 0, 0, 30, "light", "relative", "30")
    spawnBullet("normal", "#3332ff", 120, angle + 180, 0, 0, 30, "light", "relative", "30")
    for (let i = 0; i < 48; i++) {
        for (let j = 0; j < 3; j++) {
            spawnBullet("normal", "#ff3333", 240, angle, 0, 0, 20, "b_ohuda", "relative", "4")
            spawnBullet("normal", "#3333ff", 240, angle + 180, 0, 0, 20, "b_ohuda", "relative", "4")
            angle += 1.25
            ikouangle += 0.25
        }
        ikouangle += 3.5
        wait(0.035)
        playSound("shot")
    }
    heru = 1.6
    for (let i = 0; i < 52; i++) {
            spawnBullet("normal", "#ff3333", 240, angle - 6, 0, 0, 20, "ohuda", "relative", "4")
            spawnBullet("normal", "#ff3333", 240, angle + 180 + 6, 0, 0, 20, "b_ohuda", "relative", "4")
            spawnBullet("normal", "#3333ff", 240, angle + 6, 0, 0, 20, "ohuda", "relative", "4")
            spawnBullet("normal", "#3333ff", 240, angle + 180 - 6, 0, 0, 20, "b_ohuda", "relative", "4")
        for (let j = 0; j < 3; j++) {
            angle += 0.7
            ikouangle += 2
            heru -= 0.01
        }
        wait(0.03)
        playSound("shot")
    }
    wait(2.2 - hakkyou)
    wait(1 - hakkyou2)
    hakkyou += 1
    hakkyou += 0.5
}
    `,
    bulletScript: `
if (frame == 60..180) {
    speed -= 4
}
if (frame == 180..190) {
    speed = 0
}
if (frame == 260..305) {
    once {
        angle -= 90
        angle += ikouangle * 3
        speed = 0
        spriteAngle = angle
    }
    if (color == #ff3332) {
        angle -= 2
        spriteAngle = angle
    }
    if (color == #3332ff) {
        angle -= 2
        spriteAngle = angle
    }
    speed = 200
}
if (timer == heru) {
    speed = 0
}
// ★ここが究極の軽量化ポイント！
// 305フレームを超えたら、このスクリプトの計算を「99999秒待機（実質停止）」させる
if (frame > 305) {
    wait(99999)
}
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "lunatic",
    name: "超人「博麗霊夢」",
    desc: "「博麗霊夢のエア結界」の難易度上昇版",
    duration: 30,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    ey = 348
    wait(0.2)
    heru = 600000
    spawnBullet("normal", "#ff3332", 120, angle, 0, 0, 30, "light", "relative", "30")
    spawnBullet("normal", "#3332ff", 120, angle + 180, 0, 0, 30, "light", "relative", "30")
    for (let i = 0; i < 48; i++) {
        for (let j = 0; j < 6; j++) {
            spawnBullet("normal", "#ff3333", 240, angle, 0, 0, 20, "b_ohuda", "relative", "4")
            spawnBullet("normal", "#3333ff", 240, angle + 180, 0, 0, 20, "b_ohuda", "relative", "4")
            angle += 1.25 / 2
            ikouangle += 0.25
        }
        ikouangle += 3.5
        wait(0.035)
        playSound("shot")
    }
    heru = 1.6
    for (let i = 0; i < 52; i++) {
        for (let j = 0; j < 3; j++) {
            spawnBullet("normal", "#ff3333", 240, angle - 6, 0, 0, 20, "ohuda", "relative", "4")
            spawnBullet("normal", "#ff3333", 240, angle + 180 + 6, 0, 0, 20, "b_ohuda", "relative", "4")
            spawnBullet("normal", "#3333ff", 240, angle + 6, 0, 0, 20, "ohuda", "relative", "4")
            spawnBullet("normal", "#3333ff", 240, angle + 180 - 6, 0, 0, 20, "b_ohuda", "relative", "4")
            angle += 0.7
            ikouangle += 2
            heru -= 0.01
        }
        wait(0.03)
        playSound("shot")
    }
    wait(2.2 - hakkyou)
    wait(1 - hakkyou2)
    hakkyou += 1
    hakkyou += 0.5
}
    `,
    bulletScript: `
if (frame == 60..180) {
    speed -= 4
}
if (frame == 180..190) {
    speed = 0
}
if (frame == 260..305) {
    once {
        angle -= 90
        angle += ikouangle * 3
        speed = 0
        spriteAngle = angle
    }
    if (color == #ff3332) {
        angle -= 2
        spriteAngle = angle
    }
    if (color == #3332ff) {
        angle -= 2
        spriteAngle = angle
    }
    speed = 200
}
if (timer == heru) {
    speed = 0
}
// ★ここが究極の軽量化ポイント！
// 305フレームを超えたら、このスクリプトの計算を「99999秒待機（実質停止）」させる
if (frame > 305) {
    wait(99999)
}
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "Hard",
    name: "「天守閣の侍」",
    desc: "青娥パクリ",
    duration: 30,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    ey = 448
    kaisuu += 1
    angle = seedrandom[1000 + kaisuu](-160,160)
    angle2 = seedrandom[100 + kaisuu * 2](-160,160)
    plusangle = seedrandom[200 + kaisuu](-2,2)
    for (let i = 0; i < 60; i++) {
        spawnBullet("normal", "#ff3333", 400, -90 + angle, 0, 0, 19, "kome", "relative", "6")
        spawnBullet("normal", "#ff3333", 400, -90 + angle2, 0, 0, 19, "kome", "relative", "6")
        wait(0.016)
    }
}
    `,
    bulletScript: `
if (timer == 0..1) {
    angle += plusangle
}
if (timer == 1) {
    angle = random(0,360)
    speed = 300
}
spriteAngle = angle
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "NORMAL",
    name: "「イラプトオブリコイル」",
    desc: "結構頑張った",
    duration: 20,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    for (let i = 0; i < 3; i++) {
        spawnBeam(1.0, 0, 60, 90 + 60, 0, 0, "relative", "#ff3333")
        spawnBeam(1.0, 0, 60, 90 - 60, 0, 0, "relative", "#ff3333")
        wait(1)
        spawnTrailResist("#00ffff", 1000, 90 + 60, 0, 0, 20, 0.2, 2, 0.0001, "true", "relative", "10")
        spawnTrailResist("#00ffff", 1000, 90 - 60, 0, 0, 20, 0.2, 2, 0.0001, "true", "relative", "10")
        playSound("laser_heavy")
        wait(4)
    }
    wait(400)
}
    `,
    bulletScript: `
if (color == #00ffff) {
    if (frame === 10 * n) {
        second2 = 1
        spangle = random(0,360)
        spawnRing("normal", "#ff3333", 0, spangle, 7, 0, 0, 6, "b_marutama", "relative", "6")
        second2 = 2
        spangle = random(0,360)
        spawnRing("normal", "#ff3333", 0, spangle, 7, 0, 0, 6, "b_marutama", "relative", "6")
        second2 = 3
        spangle = random(0,360)
        spawnRing("normal", "#ff3333", 0, spangle, 7, 0, 0, 6, "b_marutama", "relative", "6")
    }
}
if (second == 15..30000) {
    wait(99999999)
}
bounce()
    `,
    magicCircleScript: `
if (second == second2) {
    speed = 200
}
if (second == 4..30000) {
    wait(99999999)
}
    `
},
{
    difficulty: "HARD",
    name: "フィーリングウォール",
    desc: "おｗうｗ",
    duration: 22.5,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
  while (true) {
        playSound("shot")
    wait(0.1)
    playSound("charge2")
    wait(2)
    while (true) {
        spawnRing("normal", "#9457eb", 700, angle, 7, 0, 0, 12, "light", "relative", "10")
        angle += 45.2
        playSound("shot")
        wait(0.016)
    }
}
while (true) {
    muki = 1
    spawnBullet("normal", "#ff3333", 200, 90, 0, 0, 6, "none", "absolute", "6")
    muki = -1
    spawnBullet("normal", "#ff3333", 200, 90, 768, 0, 6, "none", "absolute", "6")
    wait(2)
}
if (x < 10) {
}
    `,
    bulletScript: `
if (color==#9457eb) {
    once {
        advance(10)
        auraIntensity = 10
        auraRange = 7
        tween("auraRange", auraRange, 2.75, "seconds", 0.5)
    }
    if (speed == 200..70000) {
        speed += -2
    }
}
if (color==#ff3333) {
    once {
        warningTime = 0.0
        activeTime = 70
        laserWidth = 30
        tanaka = 0
    }
    if (muki==1) {
        x += 0.1
        x += 5 - tanaka
        if (tanaka == 0..4.9) {
            tanaka += 0.1
        }
    }
    if (muki==-1) {
        x -= 0.1
        x -= 5 - tanaka
        if (tanaka == 0..4.9) {
            tanaka += 0.1
        }
    }
}
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
}
,
{
    difficulty: "Normal",
    name: "「夢想結界」",
    desc: "失敗作供養",
    duration: 20,
    maxMisses: 2,
    x_offset: 0,
    y_offset: 0,
    despawnTime: 2.0,
    emitterScript: `
rot = 0
while (true) {
    baseRot = rot
    rot += 11
    
    spawnAngle1 = baseRot
    spawnAngle2 = -baseRot
    
    for (let i = 0; i < 10; i++) {
        spawnRing("normal", "#cc33ff", 160, spawnAngle1, 24, -114, 54, 10, "ohuda", "relative", "4")
        spawnRing("normal", "#cc33ff", 160, spawnAngle1, 24, 64, -80, 10, "ohuda", "relative", "4")
        spawnRing("normal", "#3333ff", 160, spawnAngle2, 24, 114, 54, 10, "ohuda", "relative", "5")
        spawnRing("normal", "#3333ff", 160, spawnAngle2, 24, -64, -80, 10, "ohuda", "relative", "5")
        
        spawnAngle1 += 36
        spawnAngle2 -= 36
        
        wait(0.13)
    }
    
    wait(1.2)
}
    `,
    bulletScript: `
if (param == "4") {
    angle -= 0.35
}
if (param == "5") {
    angle += 0.35
}
    `,
    magicCircleScript: ``
},
{
    difficulty: "LUNATIC",
    name: "飛鉢「伝説の飛空円盤」",
    desc: "ほぼ完全再現。私の最高記録は10ミスです。",
    duration: 90,
    maxMisses: "inf",
    x_offset: 0,
    y_offset: 0,
    despawnTime: 200.0,
    emitterScript: `
    while(true) {
    for (let i = 0; i < 2; i++) {
        aimAtTarget()
        baseAngle = random(0,360)
        spawnRingResist("normal", "#cc33ff", 140, baseAngle, 18, -114 * 1.5, 54 * 1.5, 20, "ohuda", "relative", "10")
        baseAngle = random(0,360)
        spawnRingResist("normal", "#cc33ff", 141, baseAngle, 18, 114 * 1.5, 54 * 1.5, 20, "ohuda", "relative", "10")
        baseAngle = random(0,360)
        spawnRingResist("normal", "#cc33ff", 141, baseAngle, 18, -64 * 1.5, -80 * 1.5, 20, "ohuda", "relative", "10")
        baseAngle = random(0,360)
        spawnRingResist("normal", "#cc33ff", 140, baseAngle, 18, 64 * 1.5, -80 * 1.5, 20, "ohuda", "relative", "10")
        baseAngle = random(0,360)
        wait(5)

        aimAtTarget()
        baseAngle = random(0,360)
        spawnRingResist("normal", "#cc33ff", 141, baseAngle, 18, -114 * 1.5, 54 * 1.5, 20, "ohuda", "relative", "10")
        baseAngle = random(0,360)
        spawnRingResist("normal", "#cc33ff", 140, baseAngle, 18, 114 * 1.5,  54 * 1.5, 20, "ohuda", "relative", "10")
        baseAngle = random(0,360)
        spawnRingResist("normal", "#cc33ff", 140, baseAngle, 18, -64 * 1.5, -80 * 1.5, 20, "ohuda", "relative", "10")
        baseAngle = random(0,360)
        spawnRingResist("normal", "#cc33ff", 141, baseAngle, 18, 64 * 1.5,  -80 * 1.5, 20, "ohuda", "relative", "10")
        baseAngle = random(0,360)
        wait(5)
    }
    for (let i = 0; i < 2; i++) {
        aimAtTarget()
        baseAngle = random(0,360)
        spawnRingResist("normal", "#33e0ff", 140, baseAngle, 24, -114 * 1.5, 54 * 1.5, 20, "ohuda", "relative", "10")
        baseAngle = random(0,360)
        spawnRingResist("normal", "#33e0ff", 141, baseAngle, 24,  114 * 1.5, 54 * 1.5, 20, "ohuda", "relative", "10")
        baseAngle = random(0,360)
        spawnRingResist("normal", "#33e0ff", 141, baseAngle, 24, -64 * 1.5, -80 * 1.5, 20, "ohuda", "relative", "10")
        baseAngle = random(0,360)
        spawnRingResist("normal", "#33e0ff", 140, baseAngle, 24,  64 * 1.5, -80 * 1.5, 20, "ohuda", "relative", "10")
        baseAngle += 36
        wait(5)

        aimAtTarget()
        baseAngle = random(0,360)
        spawnRingResist("normal", "#33e0ff", 141, baseAngle, 24, -114 * 1.5, 54 * 1.5, 20, "ohuda", "relative", "10")
        baseAngle = random(0,360)
        spawnRingResist("normal", "#33e0ff", 140, baseAngle, 24,  114 * 1.5, 54 * 1.5, 20, "ohuda", "relative", "10")
        baseAngle = random(0,360)
        spawnRingResist("normal", "#33e0ff", 140, baseAngle, 24, -64 * 1.5, -80 * 1.5, 20, "ohuda", "relative", "10")
        baseAngle = random(0,360)
        spawnRingResist("normal", "#33e0ff", 141, baseAngle, 24,  64 * 1.5, -80 * 1.5, 20, "ohuda", "relative", "10")
        
        wait(5)
    }
        aimAtTarget()
        baseAngle = random(0,360)
        spawnRingResist("normal", "#cc33ff", 140, baseAngle, 32, -114 * 1.5, 54 * 1.5, 20, "ohuda", "relative", "10")
        baseAngle = random(0,360)
        spawnRingResist("normal", "#cc33ff", 141, baseAngle, 32, 114 * 1.5, 54 * 1.5, 20, "ohuda", "relative", "10")
        baseAngle = random(0,360)
        spawnRingResist("normal", "#cc33ff", 141, baseAngle, 32, -64 * 1.5, -80 * 1.5, 20, "ohuda", "relative", "10")
        baseAngle = random(0,360)
        spawnRingResist("normal", "#cc33ff", 140, baseAngle, 32, 64 * 1.5, -80 * 1.5, 20, "ohuda", "relative", "10")
        baseAngle = random(0,360)
        wait(5)

        aimAtTarget()
        baseAngle = random(0,360)
        spawnRingResist("normal", "#cc33ff", 141, baseAngle, 32, -114 * 1.5, 54 * 1.5, 20, "ohuda", "relative", "10")
        baseAngle = random(0,360)
        spawnRingResist("normal", "#cc33ff", 140, baseAngle, 32, 114 * 1.5,  54 * 1.5, 20, "ohuda", "relative", "10")
        baseAngle = random(0,360)
        spawnRingResist("normal", "#cc33ff", 140, baseAngle, 32, -64 * 1.5, -80 * 1.5, 20, "ohuda", "relative", "10")
        baseAngle = random(0,360)
        spawnRingResist("normal", "#cc33ff", 141, baseAngle, 32, 64  * 1.5,  -80 * 1.5, 20, "ohuda", "relative", "10")
        baseAngle = random(0,360)
        wait(5)

        aimAtTarget()
        baseAngle = random(0,360)
        spawnRingResist("normal", "#cc33ff", 140, baseAngle, 32, -114 * 1.5, 54 * 1.5, 20, "ohuda", "relative", "10")
        baseAngle = random(0,360)
        spawnRingResist("normal", "#cc33ff", 141, baseAngle, 32, 114 * 1.5, 54 * 1.5, 20, "ohuda", "relative", "10")
        baseAngle = random(0,360)
        spawnRingResist("normal", "#cc33ff", 141, baseAngle, 32, -64 * 1.5, -80 * 1.5, 20, "ohuda", "relative", "10")
        baseAngle = random(0,360)
        spawnRingResist("normal", "#cc33ff", 140, baseAngle, 32, 64 * 1.5, -80 * 1.5, 20, "ohuda", "relative", "10")
        baseAngle = random(0,360)
        wait(7)
    for (let i = 0; i < 20; i++) {
        aimAtTarget()
        baseAngle = random(0,360)
        spawnRingResist("normal", "#ff3333", 140, baseAngle, 32, -114 * 1.5, 54 * 1.5, 20, "ohuda", "relative", "10")
        baseAngle = random(0,360)
        spawnRingResist("normal", "#ff3333", 141, baseAngle, 32,  114 * 1.5, 54 * 1.5, 20, "ohuda", "relative", "10")
        baseAngle = random(0,360)
        spawnRingResist("normal", "#ff3333", 141, baseAngle, 32, -64 * 1.5, -80 * 1.5, 20, "ohuda", "relative", "10")
        baseAngle = random(0,360)
        spawnRingResist("normal", "#ff3333", 140, baseAngle, 32,  64 * 1.5, -80 * 1.5, 20, "ohuda", "relative", "10")
        
        wait(3.5)

        aimAtTarget()
        baseAngle = random(0,360)
        spawnRingResist("normal", "#ff3333", 141, baseAngle, 32, -114 * 1.5, 54 * 1.5, 20, "ohuda", "relative", "10")
        baseAngle = random(0,360)
        spawnRingResist("normal", "#ff3333", 140, baseAngle, 32,  114 * 1.5, 54 * 1.5, 20, "ohuda", "relative", "10")
        baseAngle = random(0,360)
        spawnRingResist("normal", "#ff3333", 140, baseAngle, 32, -64 * 1.5, -80 * 1.5, 20, "ohuda", "relative", "10")
        baseAngle = random(0,360)
        spawnRingResist("normal", "#ff3333", 141, baseAngle, 32,  64 * 1.5, -80 * 1.5, 20, "ohuda", "relative", "10")
        
        wait(3.5)
    }
}
    `,
    bulletScript: `
    spriteAngle = angle
once {
    if (speed == 140) { curve = -1.6 }
    if (speed == 141) { curve = 1.6 }
    speed = 200
}
if (frame < 51) {
    speed -= 0.7
    angle += curve
    y += 0.6
}
if (frame == 60..600000) {
    angle += curve / 6
    y += 1
}
    `,
    magicCircleScript: ``
},
{
    difficulty: "NORMAL",
    name: "「天邪鬼の死」",
    desc: "回転避けはできません",
    duration: 25,            // 制限時間（秒）
    maxMisses: "inf",
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    spawnRingResist("normal", "#ff3333", 200, angle, 150, 0, 0, 12, "light", "relative", "10")
    angle += random(0,360)
    wait(1)
}
while (true) {
    playSound("shot")
    aimAtTarget()
    spawnWay("normal", "#33ffff", 1000, angle, 10, 6, 0, 0, 20, "kome", "relative", "6")
    wait(0.016)
}
    `,
    bulletScript: `
once {
    if (color != #33ffff) {
        advance(20)
        auraRange = 6
        auraIntensity = 3
        tween("auraRange", auraRange, 2.75, "seconds", 1)
        tween("auraIntensity", auraIntensity, 1, "seconds", 1)
    }
    if (color == #33ffff) {
        advance(10)
    }
}
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "h",
    name: "快符「朝の光の中で」",
    desc: "Ah～朝の光の中で Ah Ah Ah～ 光 Ah～",
    duration: 15,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    for (let i = 0; i < 100; i++) {
        angle += 31
        spawnWay("normal", "#ff3333", 500, angle, 6, 1, 0, 0, 6, "light", "relative", "6")
        wait(0.01)
    }
    for (let i = 0; i < 100; i++) {
        angle += 30.3
        spawnWay("normal", "#ff3333", 700, angle, 6, 2, 0, 0, 6, "light", "relative", "6")
        wait(0.01)
    }
    for (let i = 0; i < 10; i++) {
        aimAtTarget()
        spawnRing("normal", "#ffaa33", 900, angle, 21, 0, 0, 40, "ootama", "relative", "20")
        wait(0.1)
    }
    angle = 0
    for (let i = 0; i < 18; i++) {
        spawnBullet("normal", "#ffdd33", 700, angle, 0, 0, 6, "light", "relative", "6")
        spawnBullet("normal", "#ffdd33", 700, -angle, 0, 0, 6, "light", "relative", "6")
        angle += 20
        wait(0.01)
    }
    for (let i = 0; i < 5; i++) {
        aimAtTarget()
        spd = 0
        wa = 15
        for (let i = 0; i < 15; i++) {
            spawnWay("normal", "#33ff88", 500 + spd, angle, wa, 1, 0, 0, 6, "light", "relative", "6")
            spd += 50
            wa -= 1
            wait(0.02)
        }
        wait(0.05)
    }
    for (let i = 0; i < 30; i++) {
        muki = 1
        spawnRing("normal", "#3388ff", 800, 0, 18, 0, 0, 20, "light", "relative", "15")
        muki = -1
        spawnRing("normal", "#3388ff", 800, 0, 18, 0, 0, 20, "light", "relative", "15")
        wait(0.05)
    }
    for (let i = 0; i < 50; i++) {
        spawnRing("normal", "#884898", 800, frame * 3, 18, 0, 0, 20, "light", "relative", "15")
        wait(0.05)
    }
    while (true) {
        for (let i = 0; i < 2; i++) {
            for (let i = 0; i < 5; i++) {
                wait(0.06)
                rspx = seedrandom[6 + seedcount](0,768)
                seedcount += 1
                rsped = 0
                for (let i = 0; i < 3; i++) {
                    spawnBullet("normal", "#ff3333", 400 + rsped, 90, rspx, 0, 6, "light", "absolute", "5")
                    rsped += 16
                }
                orspx = seedrandom[600 + seedcount](0,768)
                spawnBullet("normal", "#ffaa32", 800, 90, orspx, 0, 9, "light", "absolute", "6")
                spawnBullet("normal", "#3387ff", 800, 90, 758, 0, 10, "light", "absolute", "7")
                spawnBullet("normal", "#3387ff", 800, 90, 10, 0, 10, "light", "absolute", "7")
            }
            spawnRing("normal", "#884898", 800, frame * 3, 18, 0, 0, 20, "light", "relative", "15")
        }
        yelangle += 10
        spawnLaserRing("#ffdd32", 6, 900, yelangle, 8, 0, 0, 0.2, 0.3, 0.2, "true", "relative", "6")
        wa = 5
        spd = 0
        for (let i = 0; i < 5; i++) {
            spawnWay("normal", "#33ff87", 800 + spd, 90, wa, 1, tx, 0, 6, "light", "absolute", "6")
            spd += 80
            wa -= 1
        }
    }
}
    `,
    bulletScript: `
if (color == #ffdd33) {
    if (isBounced) {
        bounce()
        warningTime = 1.0
        activeTime = 0.7
        laserWidth = 12
    }
}
if (color == #3388ff) {
    if (timer == 0..0.7) {
        angle += 2 * muki
    }
}
if (color == #ffaa32) {
    once {
        aimAtTarget()
    }
}
if (color == #3387ff) {
    once {
        aimAtTarget()
    }
}
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "h",
    name: "快符「朝の光の中で」",
    desc: "軽量版です",
    duration: 15,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    for (let i = 0; i < 100; i++) {
        angle += 31
        spawnWay("normal", "#ff3333", 500, angle, 6, 1, 0, 0, 6, "None", "relative", "6")
        wait(0.01)
    }
    for (let i = 0; i < 100; i++) {
        angle += 30.3
        spawnWay("normal", "#ff3333", 700, angle, 6, 2, 0, 0, 6, "None", "relative", "6")
        wait(0.01)
    }
    for (let i = 0; i < 10; i++) {
        aimAtTarget()
        spawnRing("normal", "#ffaa33", 900, angle, 21, 0, 0, 40, "ootama", "relative", "20")
        wait(0.1)
    }
    angle = 0
    for (let i = 0; i < 18; i++) {
        spawnBullet("normal", "#ffdd33", 700, angle, 0, 0, 6, "None", "relative", "6")
        spawnBullet("normal", "#ffdd33", 700, -angle, 0, 0, 6, "None", "relative", "6")
        angle += 20
        wait(0.01)
    }
    for (let i = 0; i < 5; i++) {
        aimAtTarget()
        spd = 0
        wa = 15
        for (let i = 0; i < 15; i++) {
            spawnWay("normal", "#33ff88", 500 + spd, angle, wa, 1, 0, 0, 6, "None", "relative", "6")
            spd += 50
            wa -= 1
            wait(0.02)
        }
        wait(0.05)
    }
    for (let i = 0; i < 30; i++) {
        muki = 1
        spawnRing("normal", "#3388ff", 800, 0, 18, 0, 0, 20, "None", "relative", "15")
        muki = -1
        spawnRing("normal", "#3388ff", 800, 0, 18, 0, 0, 20, "None", "relative", "15")
        wait(0.05)
    }
    for (let i = 0; i < 50; i++) {
        spawnRing("normal", "#884898", 800, frame * 3, 18, 0, 0, 20, "None", "relative", "15")
        wait(0.05)
    }
    while (true) {
        for (let i = 0; i < 2; i++) {
            for (let i = 0; i < 5; i++) {
                wait(0.06)
                rspx = seedrandom[6 + seedcount](0,768)
                seedcount += 1
                rsped = 0
                for (let i = 0; i < 3; i++) {
                    spawnBullet("normal", "#ff3333", 400 + rsped, 90, rspx, 0, 6, "None", "absolute", "5")
                    rsped += 16
                }
                orspx = seedrandom[600 + seedcount](0,768)
                spawnBullet("normal", "#ffaa32", 800, 90, orspx, 0, 9, "None", "absolute", "6")
                spawnBullet("normal", "#3387ff", 800, 90, 758, 0, 10,  "None", "absolute", "7")
                spawnBullet("normal", "#3387ff", 800, 90, 10, 0, 10,   "None", "absolute", "7")
            }
            spawnRing("normal", "#884898", 800, frame * 3, 18, 0, 0, 20, "None", "relative", "15")
        }
        yelangle += 10
        spawnLaserRing("#ffdd32", 6, 900, yelangle, 8, 0, 0, 0.2, 0.3, 0.2, "true", "relative", "6")
        wa = 5
        spd = 0
        for (let i = 0; i < 5; i++) {
            spawnWay("normal", "#33ff87", 800 + spd, 90, wa, 1, tx, 0, 6, "None", "absolute", "6")
            spd += 80
            wa -= 1
        }
    }
}
    `,
    bulletScript: `
if (color == #ffdd33) {
    if (isBounced) {
        bounce()
        warningTime = 1.0
        activeTime = 0.7
        laserWidth = 12
    }
}
if (color == #3388ff) {
    if (timer == 0..0.7) {
        angle += 2 * muki
    }
}
if (color == #ffaa32) {
    once {
        aimAtTarget()
    }
}
if (color == #3387ff) {
    once {
        aimAtTarget()
    }
}
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "hard",
    name: "星の通常",
    desc: "よりもムズい。",
    duration: 20,            // 制限時間（秒）
    maxMisses: 1,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    type = 1
    angle += random(-70,70)
    bairitu = 1
    spawnLaserRingResist("#ff3333", 7, 800, angle, 24, 0, 0, 0.2, 0.3, 0.5, "true", "relative", "5")
    wait(0.5)
    angle += random(-70,70)
    bairitu = -1
    spawnLaserRingResist("#ff3333", 7, 800, angle, 24, 0, 0, 0.2, 0.3, 0.5, "true", "relative", "5")
    wait(0.5)
    aimAtTarget()
    bairitu = 0.085
    type = 2
    spawnLaserRingResist("#ff3333", 7, 60, angle + 5, 36, 0, 0, 0.2, 0.3, 0.5, "true", "relative", "5")
    bairitu = -0.085
    spawnLaserRingResist("#ff3333", 7, 60, angle + 5, 36, 0, 0, 0.2, 0.3, 0.5, "true", "relative", "5")
    wait(0.5)
    bairitu = 0
    type = 3
    spawnRing("normal", "#ffffff", 400, angle, 37, 0, 0, 18, "b_marutama", "relative", "15")
    spawnRing("normal", "#ffffff", 600, angle, 37, 0, 0, 18, "b_marutama", "relative", "15")
    spawnRing("normal", "#ffffff", 800, angle, 37, 0, 0, 18, "b_marutama", "relative", "15")
    wait(1)
    angle += random(-70,70)
}
    `,
    bulletScript: `
if (timer == 0..1) {
    angle += 3 * bairitu - minus * bairitu
    minus += 0.02
}
angle += 0.6 * bairitu
if (type == 2) {
    speed += 4
    angle += 1.5 * bairitu
}
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "hard",
    name: "バレットドミニオンの消失",
    desc: "説明文や作成者名など",
    duration: 25,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
// 楕円のサイズ設定
ey = 248
a = 150
b = 50
// ボスからのズレ具合（偏り）
shiftX = 75
// 角度の初期化
theta = 0
while (true) {
    // 1. 基本の楕円のX, Y座標を計算し、shiftXぶんズラす
    cx = a * cos(theta)
    cy = b * sin(theta)
    rx = cx + shiftX
    ry = cy
    // 2. 0 から 7 まで 8回 繰り返す
    for (let i = 0; i < 8; i++) {
        // 角度の計算
        dir = i * 45
        // ★ i の数字（方向）に合わせて色を変数 c に入れる
        c = "#ffffff" // 初期値
        if (i == 0) {
            c = "#ff3333"
        }
        // 1方向目：赤
        if (i == 1) {
            c = "#ff9933"
        }
        // 2方向目：橙
        if (i == 2) {
            c = "#ffff33"
        }
        // 3方向目：黄
        if (i == 3) {
            c = "#33ff33"
        }
        // 4方向目：緑
        if (i == 4) {
            c = "#33ffff"
        }
        // 5方向目：シアン
        if (i == 5) {
            c = "#3333ff"
        }
        // 6方向目：青
        if (i == 6) {
            c = "#9933ff"
        }
        // 7方向目：紫
        if (i == 7) {
            c = "#ff33cc"
        }
        // 8方向目：ピンク
        // 数学の「回転行列」で、rxとryを dir 度ぶん回転させる
        rotX = rx * cos(dir) - ry * sin(dir)
        rotY = rx * sin(dir) + ry * cos(dir)
        // 3. ボスの現在位置(ex, ey)を足して、実際の出現座標を決定
        ox = ex + rotX
        oy = ey + rotY
        // 4. 計算した座標に配置（ここで変数 c を使う）
        ofangle -= 2
        spawnBullet("normal", c, 0, theta + dir, ox, oy, 20, "kome", "absolute", "5")
    }
    // 5. 角度の更新
    theta += 12
    wait(0.02)
}
    `,
    bulletScript: `
speed += 1 + kasoku
kasoku += 0.02
once {
    angle += 45 + ofangle
}
spriteAngle = angle
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "lunatic",
    name: "「業火優勢」",
    desc: "通常版",
    duration: 20,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    ey = 448
    wait(0.1)
    while (true) {
        angle += seedrandom[50 + kaisu](0,500)
        kaisu += 1
        angle += 9 * kakudo
        kakudo = 1.2
        spawnWay("normal", "#ff3333", 300, angle, 25, 3, 0, 0, 6, "light", "relative", "6")
        spawnWay("normal", "#ff3333", 300, angle + 90, 25, 3, 0, 0, 6, "light", "relative", "6")
        spawnWay("normal", "#ff3333", 300, angle + 180, 25, 3, 0, 0, 6, "light", "relative", "6")
        spawnWay("normal", "#ff3333", 300, angle + 270, 25, 3, 0, 0, 6, "light", "relative", "6")
        for (let i = 0; i < 9; i++) {
            spawnWay("normal", "#ff3332", 300, angle + 45, 4, 90, 0, 0, 6, "light", "relative", "6")
            angle += 3
            wait(0.1)
        }
        angle += seedrandom[50 + kaisu](0,500)
        kaisu += 1
        angle += 9 * kakudo
        kakudo = -1.2
        spawnWay("normal", "#ff3333", 300, angle, 25, 3, 0, 0, 6, "light", "relative", "6")
        spawnWay("normal", "#ff3333", 300, angle + 90, 25, 3, 0, 0, 6, "light", "relative", "6")
        spawnWay("normal", "#ff3333", 300, angle + 180, 25, 3, 0, 0, 6, "light", "relative", "6")
        spawnWay("normal", "#ff3333", 300, angle + 270, 25, 3, 0, 0, 6, "light", "relative", "6")
        for (let i = 0; i < 9; i++) {
            spawnWay("normal", "#ff3332", 300, angle + 45, 4, 90, 0, 0, 6, "light", "relative", "6")
            angle -= 3
            wait(0.1)
        }
    }
}
while (true) {
    wait(0.5)
    spawnLaserWay("#33ffff", 6, 800, -90 + 50, 7, 10, 0, 0, 0.1, 0.01, 0.1, "true", "relative", "6")
    spawnLaserWay("#33ffff", 6, 800, -90 - 50, 7, 10, 0, 0, 0.1, 0.01, 0.1, "true", "relative", "6")
    wait(0.4)
}
    `,
    bulletScript: `
if (color!=#33ffff) {
    angle += 0.4 * kakudo - l * kakudo
    l += 0.000
    once {
        speed = 100
    }
    speed += 0.5
}
if (color==#33ffff) {
    if (frame == 20..50) {
        speed -= 15
        homing(360)
    }
    if (frame == 50..51) {
        aimAtTarget()
    }
    if (frame == 50..120) {
        speed += 10
    }
}
radius = 10
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "NORMAL",
    name: "「回天之勢」",
    desc: "ドパガキ向け！",
    duration: 15,            // 制限時間（秒）
    maxMisses: 1,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    for (let i = 0; i < 10; i++) {
        spawnBullet("normal", "#ff3333", 200, angle, 0, 0, 30, "b_knife", "relative", "6")
        angle += angled
        wait(0.016 / 8)
    }
    angled = seedrandom[second](-5000,10)
}
    `,
    bulletScript: `
speed += 2
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "Lunatic",
    name: "「嵐光明媚」",
    desc: "説明文や作成者名など",
    duration: 15,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    kakudo = 1
    spawnBullet("normal", "#ff3333", 200, angle, 0, 0, 13, "b_uroko", "relative", "6")
    kakudo = -1
    spawnBullet("normal", "#ff3333", 200, angle, 0, 0, 13, "b_uroko", "relative", "6")
    wait(0.02)
}
    `,
    bulletScript: `
once {
    x = random(-300,1000)
    y = 0
    angle = 90 + 10 * kakudo
    spriteAngle = angle
}
speed += 5
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "hard",
    name: "魔砲「大葬滅光線」",
    desc: "先に作るものを決めてから作り始めた極めて珍しい例の弾幕。",
    duration: 20,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    spd = 0
    for (let i = 0; i < 10; i++) {
        spawnRingResist("normal", "#ff3333", 50 + spd, angle, 1, 200, 0, 6, "light", "relative", "0")
        spawnRingResist("normal", "#ff3333", 50 + spd, angle, 1, -200, 0, 6, "light", "relative", "0")
        angle += 10
        spd += 2.5
    }
    spawnTrailResist("#ffffff", 1, angle, 200, 0, 2, 0.001, 2, 0.001, "true", "relative", "0")
    spawnTrailResist("#ffffff", 1, angle, -200, 0, 2, 0.001, 2, 0.001, "true", "relative", "0")
    spawnTrailResist("#33ffff", 0, angle, 200, 0, 30, 0.3, 0.6, 1, "true", "relative", "0")
    spawnTrailResist("#33ffff", 0, angle, -200, 0, 30, 0.3, 0.6, 1, "true", "relative", "0")
    for (let i = 0; i < 50; i++) {
        spawnRingResist("normal", "#ff3333", 50 + spd, angle, 1, 200, 0, 6, "light", "relative", "0")
        spawnRingResist("normal", "#ff3333", 50 + spd, angle, 1, -200, 0, 6, "light", "relative", "0")
        angle += 10
        spd += 2.5
    }
    wait(2)
}
    `,
    bulletScript: `
if (color == #ff3333) {
    once {
        advance(120 + seedrandom[5](-0,50))
        angle += 180
    }
    if (frame == 70) {
        hitRadius = 5
        idoukakudo = random(-0.3,0.3)
        speed += random(0,200)
    }
    if (frame == 80..) {
        angle += idoukakudo
    }
}
if (color==#ffffff) {
    once {
        aimAtTarget()
        x += offsetx
        y += offsety
    }
    if (frame == 2) {
        speed = 8000
    }
}
if (color==#33ffff) {
    once {
        aimAtTarget()
        x += offsetx
        y += offsety
    }
    if (frame == 70) {
        speed = 80000
        hitRadius = 20
    }
}
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "hard",
    name: "「ミニ弾幕結界]",
    desc: "だいーぶ前に作ったやつ",
    duration: 30,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    ey = 448
    wait(0.03)
    ey = 448
    if (cardSecond == 0..10) {
        spawnWay("normal", "#ff3333", 200, angle, 1, 120, 0, 0, 12, "b_uroko", "relative", "6")
        angle += 4
    }
    if (cardSecond == 10..20) {
        spawnWay("normal", "#ff3333", 200, angle, 2, 180, 0, 0, 12, "b_uroko", "relative", "6")
        angle += 2
    }
    if (cardSecond == 20..30) {
        spawnWay("normal", "#ff3333", 200, angle, 3, 120, 0, 0, 12, "b_uroko", "relative", "6")
        angle += 1.5
    }
    if (cardFrame == 5 * n) {
        playSound("shot")
    }
}
    `,
    bulletScript: `
once {
    count = 0
    angle += random(-10,10)
}
if (color == #ffffff) {
    y = -80000
}
if (y < 0) {
    if (count == 1) {
        color = #ffffff
        y = -8000
    }
    count = 1
    y = 886
}
if (color == #ffffff) {
    y = -80000
}
if (y > 896) {
    if (count == 1) {
        color = #ffffff
        y = -8000
    }
    count = 1
    y = 10
}
if (color == #ffffff) {
    y = -80000
}
if (x < 0) {
    if (count == 1) {
        color = #ffffff
        y = -8000
    }
    count = 1
    x = 758
}
if (color == #ffffff) {
    y = -80000
}
if (x > 768) {
    if (count == 1) {
        color = #ffffff
        y = -8000
    }
    count = 1
    x = 10
}
if (color == #ffffff) {
    y = -80000
}
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "NORMAL",
    name: "「やんごとある威光」",
    desc: "過去に作ったやつ",
    duration: 15,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    if (cardSecond == 0..5) {
        offset = 1
        spawnRing("normal", "#ff3333", 50, angle, 26, 0, 0, 6, "virus", "relative", "6")
        angle = random(0,20)
        wait(0.05)
    }
    if (cardSecond == 4..10) {
        offset = -1
        spawnRing("normal", "#ff3333", 50, angle, 26, 0, 0, 6, "virus", "relative", "6")
        angle = random(0,20)
        wait(0.05)
    }
    if (cardSecond == 10..18) {
        offset = 1
        spawnRing("normal", "#ff3333", 50, angle, 26, 0, 0, 6, "virus", "relative", "6")
        angle = random(0,20)
        wait(0.1)
        offset = -1
        spawnRing("normal", "#ff3333", 50, angle, 26, 0, 0, 6, "virus", "relative", "6")
        angle = random(0,20)
        wait(0.1)
    }
}
    `,
    bulletScript: `
if (timer == 0..5) {
    angle += 0.2 * offset
}
speed = 300
spriteAngle += 7
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "NORMAL",
    name: "「サイド暗器」",
    desc: "過去作ったやつ",
    duration: 18,            // 制限時間（秒）
    maxMisses: 0,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    spx = 300
    spawnBullet("normal", "#ff3333", 200, angle, spx, -160, 15, "light", "relative", "6")
    spawnBullet("normal", "#ff3333", 200, angle + 180, -spx, 850, 15, "light", "relative", "6")
    wait(0.03)
    wait(0.1-hindo)
    hindo += 0.001
}
    `,
    bulletScript: `
once {
    y -= 100
    speed = 400
    x += random(-200,200)
    y += random(-70,70)
    speed += random(-70,70)
    angle += random(-3,3)
}
speed += 1
aif[20](y == ty) {
    once {
        speed = 0
        angle = 90
        if (x < tx) {
            angle = 0
        }
        if (x > tx) {
            angle = 180
        }
        spawnBullet("normal", "#ff3333", 100, angle, 0, 0, 30, "knife", "relative", "6")
        y = -80000
    }
}
    `,
    magicCircleScript: `
speed += 1
once {
    angle += random(-6,6)
}
    `
},
{
    difficulty: "Hard",
    name: "「弾幕の乱」",
    desc: "ラグテスト用の弾幕を改造してできた。",
    duration: 25,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 0.1,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    offset += 0
    for (let i = 0; i < 8; i++) {
        offset += 40
        offset = random(0,360)
        spawnBulletResist("normal", "#ff3333", 80, angle, 384, 600, 15, "kome", "absolute", "3")
    }
    offset = 90
    spawnBulletResist("normal", "#ff3333", 320, angle, 384, 600, 30, "knife", "absolute", "12")
    angle += 0.8
    wait(0.016)
}
    `,
    bulletScript: `
once {
    advance(200)
    angle += offset
    spriteAngle = angle
}
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "hard",
    name: "「アリュージョンクロック」",
    desc: "なんと、1000発程度が飛び交う。物量弾幕",
    duration: 20,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 0.1,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    wait(0.1)
    for (let i = 0; i < 36; i++) {
        spawnBullet("normal", "#ff3333", 500, -angle, 0, 0, 8, "dangan", "relative", "6")
        spawnBullet("normal", "#ffdd33", 400, angle, 0, 0, 8, "dangan", "relative", "6")
        spawnBullet("normal", "#33ff88", 300, -angle, 0, 0, 8, "dangan", "relative", "6")
        angle += 5
    }
    angle += 160.5
}
    `,
    bulletScript: `
        // 弾挙動の独自コード
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "normal",
    name: "「幻視狂言(ファントムディセプション)」",
    desc: "説明文や作成者名など",
    duration: 20,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 0.1,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    kaisuu = 0
    for (let i = 0; i < 700; i++) {
        spawnBullet("normal", "#ff3333", 300 + spd, angle, 0, 0, 10, "kunai2", "relative", "3")
        angle += seedrandom[kaisuu](0,360)
        spd = seedrandom[kaisuu](-250,150)
        kaisuu += 1
    }
    wait(2)
    kaisuu = 0
    for (let i = 0; i < 700; i++) {
        spawnBullet("normal", "#3388ff", 300 + spd, angle, 0, 0, 10, "kunai2", "relative", "3")
        angle += seedrandom[kaisuu](0,360)
        spd = seedrandom[kaisuu](-250,150)
        kaisuu += 1
    }
    wait(2)
}
    `,
    bulletScript: `
once {
    motospd = speed
    motocolor = color
}
if (frame == 120..121) {
    speed = 0
    radius = 0
    hitRadius = 0
    color = #aaaaaa
}
if (frame == 200..241) {
    radius = 10
}
if (frame == 240..241) {
    speed = 300
    color = motocolor
    hitRadius = 3
}
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
},
{
    difficulty: "normal",
    name: "「ワカサギペンデュラム」",
    desc: "ナズーリンペンデュラム、好きです。",
    duration: 20,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 0.1,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    ey = 300
    spawnRing("normal", "#ff3333", 200, angle, 6, 0, 0, 10, "dangan", "relative", "6")
    spawnRing("normal", "#3388ff", 200, kasu, 36, 0, 0, 10, "dangan", "relative", "7")
    kasu += 2
    wait(0.0167)
}
while (true) {
    tween("syutugen", syutugen, 500, "seconds", 2, "easeInOut")
    wait(2)
    tween("syutugen", syutugen, -100, "seconds", 2, "easeInOut")
    wait(2)
}
while (true) {
    tween("angle", angle, 360, "seconds", 4, "easeInOut")
    wait(4)
    tween("angle", angle, -360, "seconds", 4, "easeInOut")
    wait(4)
    tween("angle", angle, 0, "seconds", 4, "easeInOut")
    wait(4)
    tween("angle", angle, -360, "seconds", 4, "easeInOut")
    wait(4)
    tween("angle", angle, 360, "seconds", 4, "easeInOut")
    wait(4)
    tween("angle", angle, 720, "seconds", 4, "easeInOut")
    wait(4)
    tween("angle", angle, 0, "seconds", 4, "easeInOut")
    wait(4)
}
    `,
    bulletScript: `
once {
    if (color==#ff3333) {
        advance(syutugen)
    }
    if (color==#3388ff) {
        advance(600)
        spriteAngle = angle
    }
}
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
}
];

/**
共有弾幕データの一覧
 * 
 * 弾幕を作ったら、以下のフォーマットでコピペして追加してください。
 * 


,
{
    difficulty: "NORMAL",
    name: "弾幕名",
    desc: "説明文や作成者名など",
    duration: 15,            // 制限時間（秒）
    maxMisses: 2,
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
        // コア挙動の独自コード
    `,
    bulletScript: `
        // 弾挙動の独自コード
    `,
    magicCircleScript: `
        // 子弾挙動の独自コード（任意）
    `
}


 */