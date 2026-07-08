/**
共有弾幕データの一覧
 * 
 * 弾幕を作ったら、以下のフォーマットでコピペして追加してください。
 * 
,{
    name: "弾幕名",
    desc: "説明文や作成者名など",
    duration: 15,            // 制限時間（秒）
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
        name: "【サンプル】スパイラルレイン",
        desc: "全方位に螺旋を描く弾を発射します（サンプル）",
        duration: 15,
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
        name: "華符「大輪舞転」",
        desc: "とにかく綺麗に作った。",
        duration: 30,
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
    name: "サンライトインパクト~Normal~",
    desc: "ルナティックインパクトのパク...オマージュ。",
    duration: 50,            // 制限時間（秒）
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
    name: "サンライトインパクト",
    desc: "ルナティックインパクトのパク...オマージュ。",
    duration: 50,            // 制限時間（秒）
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
    while (true) {
    m = 0
    aimAtTarget()
    spawnBullet("normal", "#ffdd33", 0, angle, 0, 0, 70, "ootama", "relative", "70")
    wait(10)
    m = 0
    aimAtTarget()
    spawnBullet("normal", "#ffdd33", 0, angle, 0, 0, 70, "ootama", "relative", "70")
    wait(6)
    m = 0
    aimAtTarget()
    spawnBullet("normal", "#ffdd33", 0, angle, 0, 0, 70, "ootama", "relative", "70")
    wait(10)
    m = 0
    aimAtTarget()
    spawnBullet("normal", "#ffdd33", 0, angle, 0, 0, 70, "ootama", "relative", "70")
    wait(10)
    m = 0
    aimAtTarget()
    spawnBullet("normal", "#ffdd33", 0, angle, 0, 0, 70, "ootama", "relative", "70")
    wait(10)
    m = 0
    aimAtTarget()
    spawnBullet("normal", "#ffdd33", 0, angle, 0, 0, 70, "ootama", "relative", "70")
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
    name: "弾幕の檻",
    desc: "自機狙いと自機外しの弾が発射され、壁に当たるとレーザーを放つ。もちろん殺意の百合のオマージュ",
    duration: 15,            // 制限時間（秒）
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
    name: "超絶気合符「インフィニットスパイラル」",
    desc: "楽しい！好き！",
    duration: 15,            // 制限時間（秒）
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
    name: "技符「陰陽掃除機」",
    desc: "完全パターンスペル。そこそこ作るのに苦労しました",
    duration: 30,            // 制限時間（秒）
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
    while (true) {
    spawnBullet("normal", "#ff3333", 150, 45, 0, 0, 100, "b_knife", "relative", "40")
    spawnBullet("normal", "#ff3333", 150, 45 + 90 + 90, 0, 0, 100, "b_knife", "relative", "40")
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
    name: "上は洪水下は大火事",
    desc: "普通にお気に入りのスペル！楽しい！",
    duration: 32,            // 制限時間（秒）
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
    name: "フラッシュレートレイン",
    desc: "雨と巨大レーザー！",
    duration: 30,            // 制限時間（秒）
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
    name: "札と刃の境界",
    desc: "うおっ、となるスペルです。",
    duration: 67,            // 制限時間（秒）
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
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
    speed = speed / 1.001
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
    name: "双毒「絡みつく赤大蛇」",
    desc: "クリアチェックはしました。",
    duration: 60,            // 制限時間（秒）
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
            spawnBullet("normal", "#ff3333", 300, angle, 0, 0, 30, "uroko", "relative", "20")
            spawnBullet("normal", "#ff3333", 300, -angle, 0, 0, 30, "uroko", "relative", "20")
            angle += 10
            wait(0.05)
        }
    }
    if (cardSecond == 15..30) {
        for (let i = 0; i < 16; i++) {
            spawnBullet("normal", "#ff3333", 300, angle, 0, 0, 30, "uroko", "relative", "20")
            spawnBullet("normal", "#ff3333", 300, -angle, 0, 0, 30, "uroko", "relative", "20")
            angle += 10
            wait(0.05)
        }
    }
    if (cardSecond == 30..45) {
        for (let i = 0; i < 24; i++) {
            spawnBullet("normal", "#ff3333", 300, angle, 0, 0, 30, "uroko", "relative", "20")
            spawnBullet("normal", "#ff3333", 300, -angle, 0, 0, 30, "uroko", "relative", "20")
            angle += 10
            wait(0.05)
        }
    }
    if (cardSecond == 45..60) {
        for (let i = 0; i < 32; i++) {
            spawnBullet("normal", "#ff3333", 300, angle, 0, 0, 30, "uroko", "relative", "20")
            spawnBullet("normal", "#ff3333", 300, -angle, 0, 0, 30, "uroko", "relative", "20")
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
}
];

/**
共有弾幕データの一覧
 * 
 * 弾幕を作ったら、以下のフォーマットでコピペして追加してください。
 * 
,
{
    name: "弾幕名",
    desc: "説明文や作成者名など",
    duration: 15,            // 制限時間（秒）
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