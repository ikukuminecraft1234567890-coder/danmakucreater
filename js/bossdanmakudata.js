/**
 * ボス専用弾幕データの一覧 (bossdanmakudata.js / bdd.js)
 * 
 * ボスが使用する各スペルカード（弾幕）の定義・スクリプトを記述します。
 * ボス本体の情報（名前、肩書、使用スペル一覧等）は js/bossdata.js に記述します。
 * compile.bat を実行することで js/bossdanmakucompiledata.js (bdcd.js) に高速化コンパイルされます。
 */
const bossDanmakuList = [
    // ── 博麗 霊夢 ──────────────────────────────────────
    {
        id: "spell_reimu_non_1",
        name: "",
        hp: 900,
        duration: 25,
        x_offset: 0,
        y_offset: 0,
        despawnTime: 1.5,
        emitterScript: `
while (true) {
    aimAtTarget()
    spawnRing("normal", "#ff3344", 170, angle, 16, 0, 0, 20, "ohuda", "relative", 6)
    wait(0.35)
    spawnRing("normal", "#33aaff", 210, angle + 11.25, 16, 0, 0, 20, "kome", "relative", 4)
    wait(0.35)
}
        `,
        bulletScript: `
speed = 170
        `,
        magicCircleScript: ``
    },
    {
        id: "spell_reimu_1",
        name: "霊符「夢想封印 集」",
        hp: 1200,
        duration: 30,
        x_offset: 0,
        y_offset: 0,
        despawnTime: 1.5,
        emitterScript: `
while (true) {
    aimAtTarget()
    spawnRing("normal", "#ff4466", 160, angle, 36, 0, 0, 20, "ohuda", "relative", 6)
    wait(0.2)
    spawnRing("normal", "#ffcc00", 220, angle + 15, 8, 0, 0, 6, "star", "relative", 5)
    wait(0.25)
}
        `,
        bulletScript: `
        if (color == #ff4466) {
            speed = 500
            for (let g = 0; g < 20; g++) {
                speed += -25
                wait(0.04)
            }
            aimAtTarget()
            wait(0.2)
            spriteAngle = angle
            color = #ff6600
        }
        if (color == #ff6600) {
            speed = 750
            for (let g = 0; g < 20; g++) {
                speed += -25 * 1.5
                wait(0.04)
            }
            aimAtTarget()
            wait(0.2)
            spriteAngle = angle
            color = #9900ff
            speed = 300
        }
        `,
        magicCircleScript: ``
    },
    {
        id: "spell_reimu_non_2",
        name: "",
        hp: 1100,
        duration: 25,
        x_offset: 0,
        y_offset: 0,
        despawnTime: 1.5,
        emitterScript: `
while (true) {
    aimAtTarget()
    spawnRing("normal", "#ff2255", 150, angle, 8, 0, 0, 16, "onmyoutama", "relative", 12)
    for (let k = 0; k < 3; k++) {
        spawnRing("normal", "#ffaa33", 190 + k * 20, angle + rand(-15, 15), 12, 0, 0, 20, "ohuda", "relative", 6)
        wait(0.1)
    }
    wait(0.4)
}
        `,
        bulletScript: `
speed = 170
        `,
        magicCircleScript: ``
    },
    {
        id: "spell_reimu_2",
        name: "夢境「二重結界」",
        hp: 1800,
        duration: 35,
        x_offset: 0,
        y_offset: 0,
        despawnTime: 1.5,
        emitterScript: `
while (true) {
    aimAtTarget()
    spawnRing("normal", "#ff3333", 140, angle, 6, 0, 0, 16, "onmyoutama", "relative", 12)
    for (let i = 0; i < 4; i++) {
        spawnRing("normal", "#33ccff", 200, angle + i * 15, 10, 0, 0, 20, "ohuda", "relative", 6)
        wait(0.12)
    }
    wait(0.6)
}
        `,
        bulletScript: `
speed = 180
bounce()
spriteAngle = angle
if (isBounced) {
    color = "#ff8800"
    speed = 220
}
        `,
        magicCircleScript: ``
    },

    //ラッシュ1
    {
        id: "spell_rush1_non_1",
        name: "",
        hp: 600,
        duration: 40,
        x_offset: 0,
        y_offset: 0,
        despawnTime: 1.5,
        emitterScript: `
while (true) {
    ey = 300
    aimAtTarget()
    spawnWay("normal", "#ff3333", 500, angle, 2, 90, 0, 0, 9, "dangan", "relative", "6")
    spawnWay("normal", "#ff3333", 500, angle, 3, 2, 0, 0, 9, "dangan", "relative", "3")
    spawnWay("normal", "#ff3333", 500, angle + 180, 5, 50, 0, 0, 9, "dangan", "relative", "6")
    wait(0.0167 * 4)
}
        `,
        bulletScript: `
        `,
        magicCircleScript: ``
    },{
        id: "spell_rush1_1",
        name: "飛翔「ストライクバーン」",
        hp: 2000,
        duration: 40,
        x_offset: 0,
        y_offset: 0,
        despawnTime: 1.5,
        emitterScript: `
        while (true) {
    angle = random(0,360)
    muki = 1
    spawnRing("normal", "#999999", 200, angle, 36, 0, 0, 9, "dangan", "relative", "6")
    spawnRing("normal", "#999999", 300, angle, 36, 0, 0, 9, "dangan", "relative", "6")
    spawnRing("normal", "#999999", 400, angle, 36, 0, 0, 9, "dangan", "relative", "6")
    spawnRing("normal", "#999999", 500, angle, 36, 0, 0, 9, "dangan", "relative", "6")
    muki = -1
    spawnRing("normal", "#999999", 200, angle, 36, 0, 0, 9, "dangan", "relative", "6")
    spawnRing("normal", "#999999", 300, angle, 36, 0, 0, 9, "dangan", "relative", "6")
    spawnRing("normal", "#999999", 400, angle, 36, 0, 0, 9, "dangan", "relative", "6")
    spawnRing("normal", "#999999", 500, angle, 36, 0, 0, 9, "dangan", "relative", "6")
    muki = 0
    spawnRing("normal", "#ff3333", 200, angle, 36, 0, 0, 9, "dangan", "relative", "6")
    spawnRing("normal", "#ff3333", 300, angle, 36, 0, 0, 9, "dangan", "relative", "6")
    spawnRing("normal", "#ff3333", 400, angle, 36, 0, 0, 9, "dangan", "relative", "6")
    spawnRing("normal", "#ff3333", 500, angle, 36, 0, 0, 9, "dangan", "relative", "6")
    wait(1.67)
}
        `,
        bulletScript: `
if (color==#999999) {
    if (frame ==20..21) {
        once {
            angle += 10 * muki
            spriteAngle = angle
        }
    }
}
        `,
        magicCircleScript: `
        
        `
    },{
        id: "spell_rush1_non_2",
        name: "",
        hp: 1600,
        duration: 25,
        x_offset: 0,
        y_offset: 0,
        despawnTime: 1.5,
        emitterScript: `
while (true) {
spd = 0
    for (let i = 0; i < 10; i++) {
        spawnRing("normal", "#ff3333", 300 + spd, angle, 12, 0, 0, 9, "kunai1", "relative", "6")
angle += 1
spd -= 5
wait(0.0167)
    }
    angle += 10
    wait(0.2)
}
        `,
        bulletScript: `

        `,
        magicCircleScript: ``

        },{
        id: "spell_rush1_2",
        name: "「バタフライガン」",
        hp: 800,
        duration: 50,
        x_offset: 0,
        y_offset: 0,
        despawnTime: 1.5,
        emitterScript: `
while (true) {
    for (let i = 0; i < 30; i++) {
        spawnBullet("normal", "#ff3333", 600, angle, 100, 0, 9, "dangan", "relative", "5")
        spawnBullet("normal", "#ff3333", 600, angle, -100, 0, 9, "dangan", "relative", "5")
        wait(0.0167 * 2)
    }
    wait(0.5)
    spawnRing("normal", "#ffdd33", 200, 0, 36, 0, 0, 30, "tyoudan", "relative", "15")
    spawnRing("normal", "#33ff88", 400, 0, 36, 0, 0, 30, "tyoudan", "relative", "15")
    spawnRing("normal", "#3388ff", 600, 0, 36, 0, 0, 30, "tyoudan", "relative", "15")
    wait(0.5)
}
        `,
        bulletScript: `
if (color==#ff3333) {
    once {
        aimAtTarget()
        angle += random(-3,3)
        spriteAngle = angle
    }
}
        `,
        magicCircleScript: ``

        },{
        id: "spell_rush1_non_3",
        name: "",
        hp: 1600,
        duration: 25,
        x_offset: 0,
        y_offset: 0,
        despawnTime: 1.5,
        emitterScript: `
while (true) {
    aimAtTarget()
    spawnBullet("normal", "#ff3333", 200, angle + angleoffset, 0, 0, 20, "tyoudan", "relative", "6")
    spawnBullet("normal", "#ff3333", 400, angle + angleoffset, 0, 0, 20, "tyoudan", "relative", "6")
    angleoffset += 10
    spawnBullet("normal", "#ff3333", 200, angle + angleoffset, 0, 0, 20, "tyoudan", "relative", "6")
    spawnBullet("normal", "#ff3333", 400, angle + angleoffset, 0, 0, 20, "tyoudan", "relative", "6")
    angleoffset += 10
    wait(0.0167)
}
        `,
        bulletScript: `

        `,
        magicCircleScript: ``

        },{
        id: "spell_rush1_3",
        name: "雷撃「破壊電磁砲」",
        hp: 2500,
        duration: 50,
        x_offset: 0,
        y_offset: 0,
        despawnTime: 1.5,
        emitterScript: `
while (true) {
    wait(1)
    while (true) {
        spawnLaserRing("#ff3333", 6, 10, angle1, 36, 0, 0, 0.1, 0.8, 0.1, "true", "relative", "3")
        spawnLaserRing("#ff3333", 6, 10, angle2, 36, 0, 0, 0.1, 0.8, 0.1, "true", "relative", "3")
        wait(1)
        spawnLaserRing("#ff3333", 6, 10, angle3, 36, 250, 150, 0.1, 0.8, 0.1, "true", "relative", "3")
        spawnLaserRing("#ff3333", 6, 10, angle4, 36, -250, 150, 0.1, 0.8, 0.1, "true", "relative", "3")
        spawnLaserRing("#ff3333", 6, 10, angle5, 36, 100, -50, 0.1, 0.8, 0.1, "true", "relative", "3")
        spawnLaserRing("#ff3333", 6, 10, angle6, 36, -100, -50, 0.1, 0.8, 0.1, "true", "relative", "3")
        wait(1)
    }
}
while (true) {
    aimAtTarget()
    angle1 = angle
    spawnLaserRing("#dddddd", 2, 10, angle, 36, 0, 0, 0.1, 0.8, 0.1, "true", "relative", "0")
    angle += 10
    angle2 = angle
    spawnLaserRing("#dddddd", 2, 10, angle, 36, 0, 0, 0.1, 0.8, 0.1, "true", "relative", "0")
    wait(1)
    angle = random(0,360)
    angle3 = angle
    spawnLaserRing("#dddddd", 2, 10, angle, 36, 250, 150, 0.1, 0.8, 0.1, "true", "relative", "0")
    angle = random(0,360)
    angle4 = angle
    spawnLaserRing("#dddddd", 2, 10, angle, 36, -250, 150, 0.1, 0.8, 0.1, "true", "relative", "0")
    angle = random(0,360)
    angle5 = angle
    spawnLaserRing("#dddddd", 2, 10, angle, 36, 100, -50, 0.1, 0.8, 0.1, "true", "relative", "0")
    angle = random(0,360)
    angle6 = angle
    spawnLaserRing("#dddddd", 2, 10, angle, 36, -100, -50, 0.1, 0.8, 0.1, "true", "relative", "0")
    wait(1)
}
        `,
        bulletScript: `
if (frame==2..5) {
    once {
        speed = 30000
    }
}
        `,
        magicCircleScript: ``

        },{
        id: "spell_rush1_non_4",
        name: "",
        hp: 2000,
        duration: 25,
        x_offset: 0,
        y_offset: 0,
        despawnTime: 1.5,
        emitterScript: `
while (true) {
    for (let i = 0; i < 30; i++) {
        spd = 0
        for (let i = 0; i < 3; i++) {
            spawnRing("normal", "#ff3333", 200 + spd, angle, 4, 0, 0, 8, "dangan", "relative", "4")
            spd += 50
        }
        angle += 9.346
        wait(0.0167 * 3)
    }
    wait(0.5)
    idousakix = 384 + random(-100,100)
    idousakiy = 200 + random(-100,100)
    tween("ex", ex, idousakix, "seconds", 0.6, "easeOut")
    tween("ey", ey, idousakiy, "seconds", 0.6, "easeOut")
    wait(0.8)
}
        `,
        bulletScript: `

        `,
        magicCircleScript: ``

        },{
        id: "spell_rush1_4",
        name: "熾烈「弾幕戦争」",
        hp: 2000,
        duration: 50,
        x_offset: 0,
        y_offset: 0,
        despawnTime: 0.1,
        emitterScript: `
while (true) {
    once {
        spawnBulletResist("normal", "#ff3333", 700, 0, 0, 100, 10, "knife", "absolute", "10")
        wait(10)
        spawnBulletResist("normal", "#ff3333", 700, 0, 0, 300, 10, "knife", "absolute", "10")
        wait(10)
        spawnBulletResist("normal", "#ff3333", 700, 0, 0, 500, 10, "knife", "absolute", "10")
        wait(10)
        spawnBulletResist("normal", "#ff3333", 700, 0, 0, 700, 10, "knife", "absolute", "10")
        wait(10)
    }
    wait(0.1)
}
while (true) {
    wait(3)
    idousakix = 384 + random(-100,100)
    idousakiy = 200 + random(-100,100)
    tween("ex", ex, idousakix, "seconds", 0.6, "easeOut")
    tween("ey", ey, idousakiy, "seconds", 0.6, "easeOut")
}
        `,
        bulletScript: `
if (frame == 1 * n) {
    spawnBullet("normal", "#ff3333", 0, span, 0, 0, 9, "dangan", "relative", "6")
    span += 10
}
bounce()
        `,
        magicCircleScript: `
        if (frame == 50..60) {
    speed += 15
}`

        },{
        id: "spell_rush1_non_5",
        name: "",
        hp: 1000,
        duration: 20,
        x_offset: 0,
        y_offset: 0,
        despawnTime: 1.5,
        emitterScript: `
while (true) {
ey = 348
spd = 0
    for (let i = 0; i < 9; i++) {
        spawnRing("normal", "#ff3333", 300 + spd, angle, 12, 0, 0, 9, "kunai1", "relative", "6")
angle += 0.8
spd += 1
wait(0.0167)
    }
    angle += -20 + 1.5
    wait(0.0167)
}
        `,
        bulletScript: `

        `,
        magicCircleScript: ``

        },{
        id: "spell_rush1_5",
        name: "秘鳳「光王弾撃」",
        hp: 2000,
        duration: 60,
        x_offset: 0,
        y_offset: 0,
        despawnTime: 800,
        emitterScript: `
while (true) {
    spawnRingResist("normal", "#ff3333", 200, 6, 24, 0, 0, 6, "light", "relative", "6")
    angle += 30
    wait(500000)
}
        `,
        bulletScript: `
if (radius == 6) {
    if (isTouchEdge) {
        radius = 12
        if (x < 10) {
            angle = -angle
            angle += 180
        }
        if (x > 758) {
            angle = -angle
            angle += 180
        }
        if (y < 10) {
            angle = -angle
        }
        if (y > 886) {
            angle = -angle
        }
        wait(0.1)
    }
}
if (radius == 12) {
    if (isTouchEdge) {
        radius = 24
        if (x < 10) {
            angle = -angle
            angle += 180
        }
        if (x > 758) {
            angle = -angle
            angle += 180
        }
        if (y < 10) {
            angle = -angle
        }
        if (y > 886) {
            angle = -angle
        }
        wait(0.1)
    }
}
if (radius == 24) {
    if (isTouchEdge) {
        radius = 32
        if (x < 10) {
            angle = -angle
            angle += 180
        }
        if (x > 758) {
            angle = -angle
            angle += 180
        }
        if (y < 10) {
            angle = -angle
        }
        if (y > 886) {
            angle = -angle
        }
        wait(0.1)
    }
}
if (radius == 32) {
    if (isTouchEdge) {
        radius = 48
        if (x < 10) {
            angle = -angle
            angle += 180
        }
        if (x > 758) {
            angle = -angle
            angle += 180
        }
        if (y < 10) {
            angle = -angle
        }
        if (y > 886) {
            angle = -angle
        }
        wait(0.1)
    }
}
if (radius == 48) {
    if (isTouchEdge) {
        radius = 64
        if (x < 10) {
            angle = -angle
            angle += 180
        }
        if (x > 758) {
            angle = -angle
            angle += 180
        }
        if (y < 10) {
            angle = -angle
        }
        if (y > 886) {
            angle = -angle
        }
        wait(0.1)
    }
}
if (radius == 64) {
    if (isTouchEdge) {
        radius = 80
        if (x < 10) {
            angle = -angle
            angle += 180
        }
        if (x > 758) {
            angle = -angle
            angle += 180
        }
        if (y < 10) {
            angle = -angle
        }
        if (y > 886) {
            angle = -angle
        }
        wait(0.1)
    }
}
if (radius == 80) {
    if (isTouchEdge) {
        radius = 80
        if (x < 10) {
            angle = -angle
            angle += 180
        }
        if (x > 758) {
            angle = -angle
            angle += 180
        }
        if (y < 10) {
            angle = -angle
        }
        if (y > 886) {
            angle = -angle
        }
        wait(0.1)
    }
}
hitRadius = radius / 1.5
        `,
        magicCircleScript: ``

        },{
        id: "spell_rush1_non_6",
        name: "",
        hp: 1200,
        duration: 25,
        x_offset: 0,
        y_offset: 0,
        despawnTime: 0.1,
        emitterScript: `
while (true) {
    aimAtTarget()
    spawnBullet("normal", "#ff3333", 200, angle + angleoffset, 0, 0, 20, "tyoudan", "relative", "6")
    spawnBullet("normal", "#ff3333", 300, angle + angleoffset, 0, 0, 20, "tyoudan", "relative", "6")
    spawnBullet("normal", "#ff3333", 400, angle + angleoffset, 0, 0, 20, "tyoudan", "relative", "6")
    spawnBullet("normal", "#ff3333", 200, angle + angleoffset + 180, 0, 0, 20, "tyoudan", "relative", "6")
    spawnBullet("normal", "#ff3333", 300, angle + angleoffset + 180, 0, 0, 20, "tyoudan", "relative", "6")
    spawnBullet("normal", "#ff3333", 400, angle + angleoffset + 180, 0, 0, 20, "tyoudan", "relative", "6")
    spawnBullet("normal", "#ff3333", 200, angle + angleoffset + 90, 0, 0, 20, "tyoudan", "relative", "6")
    spawnBullet("normal", "#ff3333", 300, angle + angleoffset + 90, 0, 0, 20, "tyoudan", "relative", "6")
    spawnBullet("normal", "#ff3333", 400, angle + angleoffset + 90, 0, 0, 20, "tyoudan", "relative", "6")
    spawnBullet("normal", "#ff3333", 200, angle + angleoffset + 270, 0, 0, 20, "tyoudan", "relative", "6")
    spawnBullet("normal", "#ff3333", 300, angle + angleoffset + 270, 0, 0, 20, "tyoudan", "relative", "6")
    spawnBullet("normal", "#ff3333", 400, angle + angleoffset + 270, 0, 0, 20, "tyoudan", "relative", "6")
    angleoffset += 9
    wait(0.0167 * 4)
}
        `,
        bulletScript: `

        `,
        magicCircleScript: ``

        },{
        id: "spell_rush1_6",
        name: "虚符「迷宮を真似るライフガンフォーム」",
        hp: 1600,
        duration: 60,
        x_offset: 0,
        y_offset: 0,
        despawnTime: 0.2,
        emitterScript: `
while (true) {
    spawnRing("normal", "#ff3333", 0, angle, 4, spx, spy, 9, "dangan", "relative", "3")
    wait(0.0167 * 2)
}
while (true) {
    tween("ex", ex, 768 - 100, "seconds", 3, "easeInOut")
    tween("ey", ey, 100, "seconds", 3, "easeInOut")
    wait(3)
    tween("ex", ex, 768 - 100, "seconds", 3, "easeInOut")
    tween("ey", ey, 896 - 100, "seconds", 3, "easeInOut")
    wait(3)
    tween("ex", ex, 100, "seconds", 3, "easeInOut")
    tween("ey", ey, 896 - 100, "seconds", 3, "easeInOut")
    wait(3)
    tween("ex", ex, 100, "seconds", 3, "easeInOut")
    tween("ey", ey, 100, "seconds", 3, "easeInOut")
    wait(3)
}
        `,
        bulletScript: `
if (frame == 15 * n) {
    kakudo = random(1,4)
    if (kakudo == 0..1.9999) {
        speed = 400
        wait(0.175)
        speed = 1
    }
    if (kakudo == 2..2.9999) {
        angle += 90
        spriteAngle = angle
    }
    if (kakudo == 3..4) {
        angle -= 90
        spriteAngle = angle
    }
}
if (frame == 180..99999) {
    once {
        imanokakudo = angle
    }
    angle = imanokakudo
    spriteAngle = angle
    speed = 400
}
        `,
        magicCircleScript: ``

        },{
        id: "spell_rush1_non_7",
        name: "",
        hp: 1000,
        duration: 25,
        x_offset: 0,
        y_offset: 0,
        despawnTime: 1.5,
        emitterScript: `
while (true) {
    for (let i = 0; i < 3; i++) {
        idousakix = 384 + random(-250,250)
        idousakiy = 200 + random(-100,100)
        tween("ex", ex, idousakix, "seconds", 0.1, "easeOut")
        tween("ey", ey, idousakiy, "seconds", 0.1, "easeOut")
        wait(0.1)
        for (let i = 0; i < 20; i++) {
            spd = 0
            for (let i = 0; i < 3; i++) {
                spawnRing("normal", "#ff3333", 200 + spd, angle, 4, 0, 0, 8, "dangan", "relative", "4")
                spd += 50
            }
            angle += 9.346
            wait(0.0167 * 2)
        }
        wait(0.1)
    }
    wait(0.2)
    idousakix = 384
    idousakiy = 200
    tween("ex", ex, idousakix, "seconds", 0.6, "easeOut")
    tween("ey", ey, idousakiy, "seconds", 0.6, "easeOut")
    wait(1.5)
}
        `,
        bulletScript: `

        `,
        magicCircleScript: ``

        },{
        id: "spell_rush1_7",
        name: "射符「レミントンシュート」",
        hp: 1200,
        duration: 60,
        x_offset: 0,
        y_offset: 0,
        despawnTime: 1.5,
        emitterScript: `
while (true) {
    wait(1)
        idousakix = 384 + random(-250,250)
        idousakiy = 200 + random(-100,100)
        tween("ex", ex, idousakix, "seconds", 0.6, "easeOut")
        tween("ey", ey, idousakiy, "seconds", 0.6, "easeOut")
    wait(1)
    aimAtTarget()
    for (let i = 0; i < 100; i++) {
        bure = random(-100,300)
        bure2 = random(-10,10)
        bure2 += random(-10,10)
        bure2 += random(-10,10)
        spawnBullet("normal", "#ff3333", 200 + bure, angle + bure2, 0, 0, 6, "dangan", "relative", "4")
    }
    wait(0.8)
    aimAtTarget()
    for (let i = 0; i < 100; i++) {
        bure = random(-100,300)
        bure2 = random(-10,10)
        bure2 += random(-10,10)
        bure2 += random(-10,10)
        spawnBullet("normal", "#ff3333", 200 + bure, angle + bure2, 0, 0, 6, "dangan", "relative", "4")
    }
    wait(1.5)
    aimAtTarget()
    for (let i = 0; i < 13; i++) {
        for (let i = 0; i < 100; i++) {
            bure = random(-100,300)
            bure2 = random(-10,10)
            bure2 += random(-10,10)
            bure2 += random(-10,10)
            spawnBullet("normal", "#ff3333", 200 + bure, angle + bure2, 0, 0, 6, "dangan", "relative", "4")
        }
        angle += 30
        wait(0.1)
    }
}
        `,
        bulletScript: `

        `,
        magicCircleScript: ``

        },{
        id: "spell_rush1_non_8",
        name: "",
        hp: 1200,
        duration: 25,
        x_offset: 0,
        y_offset: 0,
        despawnTime: 1.5,
        emitterScript: `
while (true) {
    l = 0
    for (let i = 0; i < 120; i++) {
        for (let f = 0; f < 2; f++) {
            for (let g = 0; g < 8; g++) {
                spawnBullet("normal", "#ff3333", 300, angle, 0, 0, 9, "dangan", "relative", "3")
                angle += 45
            }
            angle += 1
        }
        angle -= 3
        angle += 2 + l
        l += 0.83 + random(0,1)
        wait(0.0167)
    }
    wait(0.8)
}
        `,
        bulletScript: `

        `,
        magicCircleScript: ``

        }
        ,{
        id: "spell_rush1_8",
        name: "弾動「歩引連動の妙術」",
        hp: 2000,
        duration: 60,
        x_offset: 0,
        y_offset: 0,
        despawnTime: 0.1,
        emitterScript: `
while (true) {
    for (let i = 0; i < 50; i++) {
        aimAtTarget()
        spawnWay("normal", "#ff3333", 200 + spd, angle, 4, 40, 0, 0, 9, "dangan", "relative", "5")
        spawnWay("normal", "#ff3333", 200 + spd, angle, 5, 3, 0, 0, 9, "dangan", "relative", "5")
        spawnWay("normal", "#ff3333", 200 + spd, angle + 180, 8, 20, 0, 0, 9, "dangan", "relative", "5")
        spd += 14
        wait(0.0167 * 2)
    }
    spd = 0
    wait(1)
}
        `,
        bulletScript: `
if (color==#ff3333) {
    if (isTouchEdge) {
        bounce()
        color = = #ff3332
    }
}
if (color==#ff3332) {
    if (isTouchEdge) {
        bounce()
        color = = #ff3322
    }
}
spriteAngle = angle
        `,
        magicCircleScript: ``

        },{
        id: "spell_rush1_9",
        name: "「サイケデリックオービット」",
        hp: 100000000000000000000,
        duration: 80,
        x_offset: 0,
        y_offset: 0,
        despawnTime: 1.5,
        emitterScript: `
while (true) {
    ey = 448
    wait(0.0167 * 10)
    if (cardSecond == 0..40) {
        if (cardSecond == 0..20) {
            angle = -90 + seedrandom[5 + frame](-70,70)
        }
        if (cardSecond == 20..40) {
            angle = 90 + seedrandom[5 + frame](-70,70)
        }
        spawnWay("normal", "#ff3333", 150, angle, 3, 30, 0, 0, 12, "dangan", "relative", "6")
    }
    if (cardSecond == 40..80) {
        if (cardSecond == 40..60) {
            angle = 180 + seedrandom[5 + frame](-70,70)
        }
        if (cardSecond == 60..80) {
            angle = 0 + seedrandom[5 + frame](-70,70)
        }
        spawnWay("normal", "#ffaa33", 150, angle, 3, 30, 0, 0, 12, "dangan", "relative", "6")
    }
}
while (true) {
    wait(1.3)
    spd = 0
    for (let i = 0; i < 10; i++) {
        if (cardSecond == 0..40) {
            spawnBullet("normal", "#00ffff", 50 + spd, 180, 768, ty, 20, "tyoudan", "absolute", "6")
        }
        if (cardSecond == 40..80) {
            spawnBullet("normal", "#00ffff", 50 + spd, 90, tx, 0, 20, "tyoudan", "absolute", "6")
        }
        spd += 50
    }
    wait(1.3)
    spd = 0
    for (let i = 0; i < 10; i++) {
        if (cardSecond == 0..40) {
            spawnBullet("normal", "#00ffff", 50 + spd, 0, 0, ty, 20, "tyoudan", "absolute", "6")
        }
        if (cardSecond == 40..80) {
            spawnBullet("normal", "#00ffff", 50 + spd, 270, tx, 896, 20, "tyoudan", "absolute", "6")
        }
        spd += 50
    }
}
if (x < 10) {
}
        `,
        bulletScript: `
if (color==#ff3333) {
    if (y < 0) {
        y = 886
    }
    if (y > 896) {
        y = 10
    }
}
if (color==#ffaa33) {
    if (x < 0) {
        x = 758
    }
    if (x > 768) {
        x = 10
    }
}
if (cardSecond == 20 * n) {
    for (let i = 0; i < 120; i++) {
        y = -8900
        wait(0.0167)
    }
}
        `,
        magicCircleScript: ``

        },{
        id: "spell_rush1_10",
        name: "「10」",
        hp: 1000,
        duration: 25,
        x_offset: 0,
        y_offset: 0,
        despawnTime: 1.5,
        emitterScript: `

        `,
        bulletScript: `

        `,
        magicCircleScript: ``

        }
];


if (typeof window !== 'undefined') {
    window.bossDanmakuList = bossDanmakuList;
}


/*
,{
        id: "spell_base_non_",
        name: "Base Spell",
        hp: 1000,
        duration: 25,
        x_offset: 0,
        y_offset: 0,
        despawnTime: 1.5,
        emitterScript: `

        `,
        bulletScript: `

        `,
        magicCircleScript: ``

        }
*/
