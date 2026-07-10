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
    duration: 65,            // 制限時間（秒）
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
    name: "旋風「ビッグトルネード」",
    desc: "圧倒的弾速、圧倒的気合避け",
    duration: 25,            // 制限時間（秒）
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
    angle += random(-3,3)
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
    name: "偽符「ダブルスパイル」",
    desc: "攻略法が分かると簡単なタイプ。",
    duration: 25,            // 制限時間（秒）
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
    name: "秘儀「十三頭の龍」",
    desc: "結構いい感じに作れました。下からの反射を追加したことでそこそこの難易度になったかも...",
    duration: 30,            // 制限時間（秒）
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
    name: "波符「白銀のタイダルウェーブ」",
    desc: "気づいたら星蓮船四面ボスのアレみたいになってた。",
    duration: 30,            // 制限時間（秒）
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    tween("ex", ex, tx, "vecstep", 0.1)
    tween("ey", ey, ty, "vecstep", 0.1)
    wait(1 - t)
    spawnRing("normal", "#ffffff", 200, 0, 72, 0, 0, 10, "b_uroko", "relative", "5")
    wait(0.2)
    spawnRing("normal", "#ffffff", 200, 0, 72, 0, 0, 10, "b_uroko", "relative", "5")
    wait(0.2)
    spawnRing("normal", "#ffffff", 200, 0, 72, 0, 0, 10, "b_uroko", "relative", "5")
    wait(1 - t)
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
    name: "白銀のタルタルソース",
    desc: "",
    duration: 20,            // 制限時間（秒）
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
    name: "熱符「真紅たる太陽風」",
    desc: "交差する弾って...楽しいですよね。",
    duration: 20,            // 制限時間（秒）
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
    name: "忌符「フライングスター」",
    desc: "全方位反射って難しいですよねぇ...",
    duration: 30,            // 制限時間（秒）
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
    name: "恕符「血濡れのアナザーディメンション」",
    desc: "どう見ても輝針城モチーフ。",
    duration: 30,            // 制限時間（秒）
    x_offset: 0,             // 出現位置の横オフセット
    y_offset: 0,             // 出現位置の縦オフセット
    despawnTime: 1.5,        // 画面外に弾が出てから消滅するまでの時間
    // エディタの「JSコード」からコピーした、独自のJS風コードをそのまま貼り付けられます
    emitterScript: `
while (true) {
    spawnRingResist("normal", "#ff3333", 200, angleg, 8, 0, 0, 6, "ootama", "relative", "6")
    angleg += 16
    wait(0.6)
}
while (true) {
    offset = 0
    spawnBulletResist("normal", "#dddddd", 200, angle, 300, 0, 30, "b_knife", "relative", "6")
    spawnBulletResist("normal", "#ddddde", 200, angle, -300, 0, 30, "b_knife", "relative", "6")
    offset = 30
    spawnBulletResist("normal", "#dddddd", 200, angle, 300, 0, 30, "b_knife", "relative", "6")
    spawnBulletResist("normal", "#ddddde", 200, angle, -300, 0, 30, "b_knife", "relative", "6")
    offset = -30
    spawnBulletResist("normal", "#dddddd", 200, angle, 300, 0, 30, "b_knife", "relative", "6")
    spawnBulletResist("normal", "#ddddde", 200, angle, -300, 0, 30, "b_knife", "relative", "6")
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
    name: "真実「静焔のレプティリアン」",
    desc: "作ってる途中、赤色の幻想郷とレプティリアンインテリジェンスを行ったり来たりしてました。",
    duration: 35,            // 制限時間（秒）
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
    name: "「完全自動殺戮マシン」",
    desc: "弾から弾が出るスペルを作るのが楽しいんだよなあ！！",
    duration: 35,            // 制限時間（秒）
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
    name: "鋒符「尾を噛む龍」",
    desc: "万物は流転する。自らの尾を喰らう龍のように、終わりなき円環を描く。",
    duration: 35,            // 制限時間（秒）
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
    name: "蛇符「人間殺しの大白蛇」",
    desc: "最近こういうスペルしか作ってないｗ",
    duration: 35,            // 制限時間（秒）
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
    name: "獄符「スターアンドプリズン」",
    desc: "上下で挟んでくるタイプの弾幕。ちなみにガチで苦手。",
    duration: 35,            // 制限時間（秒）
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