/**
 * 共有弾幕データの一覧 【Season 3 (S3)】
 * 
 * S3では以下の新要素に対応しています:
 * - bg: 2D疑似3D背景プリセットID ("none", "hakurei_shrine", "lunar_rainbow_market" 等)
 * - bossMode: "single"（シングルボス） または "double"（ダブルボス・個別HP）
 * - hp2, x_offset2, y_offset2: ボス2のHPと出現位置オフセット
 * - emitterScript2, bulletScript2, magicCircleScript2: ボス2の独立スクリプト
 *   (スクリプト内では boss1Hp / boss2Hp / partnerHp / partnerAlive / enemyHp などが参照可能)
 */
const sharedDanmakuListS3 = [
    {
    difficulty: "NORMAL",
    name: "氷霧符「アイシクルフェアリー」",
    desc: "オリジナルの弾幕パターン。",
    bg: "misty_lake",
    bossMode: "double",
    hp2: 1000,
    x_offset2: 115,
    y_offset2: 100,
    hp: 1000,
    duration: 40,
    maxMisses: 2,
    x_offset: -115,
    y_offset: 100,
    despawnTime: 1.5,
    emitterScript: `
while (true) {
    for (let i = 0; i < 50; i++) {
        bullet({ "type": "normal", "image": "bluediamond", "speed": 250, "angle": frame * 2.1254, "radius": 12, "hitRadius": 5, "way": 5, "muki": 0.5 })
        wf(6)
    }
    wf(30)
    for (let i = 0; i < 50; i++) {
        bullet({ "type": "normal", "image": "bluediamond", "speed": 250, "angle": -frame * 2.1254, "radius": 12, "hitRadius": 5, "way": 5, "muki": -0.5 })
        wf(6)
    }
    wf(30)
}
    `,
    bulletScript: `
if (frame==90..90) {
    once {
        angle += muki * 120
        spriteAngle += muki * 120
        tween("speed", 0, 300, "seconds", 1)
        imageTo("whitekunai2")
    }
}
    `,
    magicCircleScript: ``,
    emitterScript2: `
while (true) {
    for (let i = 0; i < 25; i++) {
        bullet({ "type": "normal", "image": "greendiamond", "speed": 250, "angle": -frame * 2.1254, "radius": 12, "hitRadius": 5, "way": 5, "muki": -0.5 })
        wf(6)
    }
    wf(15)
    for (let i = 0; i < 25; i++) {
        bullet({ "type": "normal", "image": "greendiamond", "speed": 250, "angle": frame * 2.1254, "radius": 12, "hitRadius": 5, "way": 5, "muki": 0.5 })
        wf(6)
    }
    wf(15)
}
    `,
    bulletScript2: `
if (frame==0..180) {
    angle += muki
    spriteAngle += muki
}
    `,
    magicCircleScript2: ``
},{
    difficulty: "NORMAL",
    name: "紅魔符「セラギネラドール」",
    desc: "オリジナルの弾幕パターン。",
    bg: "scarlet_mansion",
    bossMode: "double",
    hp2: 1200,
    x_offset2: 0,
    y_offset2: 0,
    hp: 1200,
    duration: 50,
    maxMisses: 2,
    x_offset: 0,
    y_offset: 150,
    despawnTime: 1.5,
    emitterScript: `
while (true) {
    if (phase == 0) {
        bullet({ "type": "normal", "image": "yellowkunai2", "speed": 600, "angle": frame * 1.54, "radius": 12, "hitRadius": 4, "way": 5, "muki": 1 })
        bullet({ "type": "normal", "image": "yellowkunai2", "speed": 600, "angle": -frame * 1.54, "radius": 12, "hitRadius": 4, "way": 5, "muki": -1 })
        wf(6)
    }
}
    `,
    bulletScript: `
if (s == 0..60) {
    speed -= 10
}
if (s == 61) {
    angle += 190 * muki
    spriteAngle += 190 * muki
    speed = 200
}
s += 1
if (phase == 1) {
    once {
        imageTo("whitekunai2")
        speed = 0
        once {
            a = random(0,50)
        }
        wf(a)
        angle += random(-120,120)
        spriteAngle = angle
        wf(70 - a)
        imageTo("yellowkunai2")
        speed = 200
    }
}
    `,
    magicCircleScript: ``,
    emitterScript2: `
shared phase = 0
while (true) {
    wf(120)
    spd = 0
    aimAtTarget()
    for (let i = 0; i < 10; i++) {
        bullet({ "type": "normal", "image": "blueknife", "speed": 200 + spd, "radius": 20, "hitRadius": 10, "way": 9, "distance": 3, "distanceType": "step", "img": 1 })
        spd += 15
    }
    wf(40)
    spd = 0
    aimAtTarget()
    for (let i = 0; i < 10; i++) {
        bullet({ "type": "normal", "image": "redknife", "speed": 200 + spd, "radius": 20, "hitRadius": 10, "way": 7, "distance": 3, "distanceType": "step", "img": 2 })
        spd += 15
    }
    wf(30)
    phase = 1
    wf(70)
    phase = 0
    wf(120)
}
    `,
    bulletScript2: `
once {
    moto = speed
}
if (phase == 1) {
    once {
        imageTo("whiteknife")
        speed = 0
        once {
            a = random(0,50)
        }
        wf(a)
        angle += random(-120,120)
        spriteAngle = angle
    }
}
if (phase == 0) {
    if (img == 1) {
        imageTo("blueknife")
    }
    if (img == 2) {
        imageTo("redknife")
    }
    speed = moto
}
    `,
    magicCircleScript2: ``
},{
    difficulty: "NORMAL",
    name: "幽剣符「現世墨染斬」",
    desc: "オリジナルの弾幕パターン。",
    bg: "hakugyokurou",
    bossMode: "double",
    hp2: 1000,
    x_offset2: 0,
    y_offset2: -60,
    hp: 1000,
    duration: 15,
    maxMisses: 2,
    x_offset: -115,
    y_offset: 0,
    despawnTime: 1.5,
    emitterScript: `
shared slashActive = 0
shared slashX = -100
shared slashY = -100
shared slashWidth = 55
wf(50)
while (true) {
    wf(50)
    slashY = random(200, 460)
    tween("ex", ex, 36, "frames", 25, "easeOut")
    tween("ey", ey, slashY, "frames", 25, "easeOut")
    wf(25)
    playSound("charge")
    bullet({ "type": "trail", "coordMode": "absolute", "x": -20, "y": slashY, "angle": 0, "speed": 3200, "radius": 2, "hitRadius": 0, "color": "#ffffff", "blend": "lighter", "growTime": 0.04, "keepTime": 0.42, "shrinkTime": 0.06, "round": true })
    wf(30)
    playSound("laser")
    bullet({ "type": "trail", "coordMode": "absolute", "x": -20, "y": slashY, "angle": 0, "speed": 2880, "radius": 24, "hitRadius": 0, "color": "#99ffff", "blend": "lighter", "growTime": 0.03, "keepTime": 0.2, "shrinkTime": 0.25, "round": true })
    bullet({ "type": "trail", "coordMode": "absolute", "x": -20, "y": slashY, "angle": 0, "speed": 2880, "radius": 8, "hitRadius": 0, "color": "#ffffff", "blend": "lighter", "growTime": 0.02, "keepTime": 0.24, "shrinkTime": 0.2, "round": true })
    slashX = 0
    slashActive = 1
    for (let i = 0; i < 16; i++) {
        slashX += 48
        ex += 43.5
        wf(1)
    }
    wf(10)
    slashActive = 0
    wf(20)
    tween("ex", ex, 269, "frames", 30, "easeInOut")
    tween("ey", ey, 179, "frames", 30, "easeInOut")
    wf(30)
}
    `,
    bulletScript: `

    `,
    magicCircleScript: ``,
    emitterScript2: `
while (true) {
    wf(60)
    l = 50
    angle = random(0,360)
    for (let i = 0; i < 10; i++) {
        l += 50
        bullet({ "type": "normal", "image": "tyoudan", "radius": 25, "hitRadius": 10, "way": 18, "muki": 0.5 })
    }
    wf(30)
    l = 50
    angle = random(0,360)
    for (let i = 0; i < 10; i++) {
        l += 50
        bullet({ "type": "normal", "image": "tyoudan", "radius": 25, "hitRadius": 10, "way": 18, "muki": -0.5 })
    }
    wf(30)
    l = 50
    angle = random(0,360)
    for (let i = 0; i < 10; i++) {
        l += 50
        bullet({ "type": "normal", "image": "tyoudan", "radius": 25, "hitRadius": 10, "way": 18, "muki": 0.5 })
    }
    wf(30)
    l = 50
    angle = random(0,360)
    for (let i = 0; i < 10; i++) {
        l += 50
        bullet({ "type": "normal", "image": "tyoudan", "radius": 25, "hitRadius": 10, "way": 18, "muki": -0.5 })
    }
    wf(40)
}
    `,
    bulletScript2: `
if (slashed == 0 && frame == 70..80) {
    once {
        angle += 180 * muki
        tween("speed", speed, l, "frames", 20)
        spriteAngle = angle
    }
}
if (slashed == 0 && boss1Hp > 0 && slashActive == 1 && abs(y - slashY) <= slashWidth && x <= slashX) {
    once {
        slashed = 1
        imageTo("whiteknife")
        radius = 18
        hitRadius = 6
        speed = 0
        tween("speed", 0, 0, "frames", 1)
        aimAtTarget()
        spriteAngle = angle
        wf(20)
        tween("speed", 0, 240 + l * 0.2, "frames", 18, "easeIn")
    }
}
    `,
    magicCircleScript2: ``
}
];

if (typeof window !== 'undefined') {
    window.sharedDanmakuListS3 = sharedDanmakuListS3;
}
