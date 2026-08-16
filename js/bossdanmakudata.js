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
        hp: 1000,
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
        hp: 1200,
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
        angle += random(-5,5)
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
    spawnBullet("normal", "#ff3333", 200, angle + angleoffset, 0, 0, 20, "tyoudan", "relative", "10")
    spawnBullet("normal", "#ff3333", 400, angle + angleoffset, 0, 0, 20, "tyoudan", "relative", "10")
    angleoffset += 10
    spawnBullet("normal", "#ff3333", 200, angle + angleoffset, 0, 0, 20, "tyoudan", "relative", "10")
    spawnBullet("normal", "#ff3333", 400, angle + angleoffset, 0, 0, 20, "tyoudan", "relative", "10")
    angleoffset += 10
    wait(0.0167)
}
        `,
        bulletScript: `

        `,
        magicCircleScript: ``

        },{
        id: "spell_rush1_3",
        name: "「破壊光線」",
        hp: 2500,
        duration: 50,
        x_offset: 0,
        y_offset: 0,
        despawnTime: 1.5,
        emitterScript: `
while (true) {
    aimAtTarget()
    spawnRing("normal", "#ff3333", 200, angle, 18, 0, 0, 6, "none", "relative", "#ff3333")
    angle += 10
    spawnRing("normal", "#ff3333", 200, angle, 18, 0, 0, 6, "none", "relative", "#ff3333")
    wait(1)
    angle = random(0,360)
    spawnRing("normal", "#ff3333", 200, angle, 18, 250, 150, 6, "none", "relative", "#ff3333")
    angle += 10
    spawnRing("normal", "#ff3333", 200, angle, 18, 250, 150, 6, "none", "relative", "#ff3333")
    angle = random(0,360)
    spawnRing("normal", "#ff3333", 200, angle, 18, -250, 150, 6, "none", "relative", "#ff3333")
    angle += 10
    spawnRing("normal", "#ff3333", 200, angle, 18, -250, 150, 6, "none", "relative", "#ff3333")
    angle = random(0,360)
    spawnRing("normal", "#ff3333", 200, angle, 18, 100, -50, 6, "none", "relative", "#ff3333")
    angle += 10
    spawnRing("normal", "#ff3333", 200, angle, 18, 100, -50, 6, "none", "relative", "#ff3333")
    angle = random(0,360)
    spawnRing("normal", "#ff3333", 200, angle, 18, -100, -50, 6, "none", "relative", "#ff3333")
    angle += 10
    spawnRing("normal", "#ff3333", 200, angle, 18, -100, -50, 6, "none", "relative", "#ff3333")
    wait(1)
}
        `,
        bulletScript: `
warningTime = 1
activeTime = 1
laserWidth = 12
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
        id: "spell_rush1_5",
        name: "「」",
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

        },{
        id: "spell_rush1_non_6",
        name: "",
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

        },{
        id: "spell_rush1_6",
        name: "「」",
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

        },{
        id: "spell_rush1_non_7",
        name: "",
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

        },{
        id: "spell_rush1_7",
        name: "「」",
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

        },{
        id: "spell_rush1_non_8",
        name: "",
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

        },{
        id: "spell_rush1_8",
        name: "「」",
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

        },{
        id: "spell_rush1_9",
        name: "「」",
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

        },{
        id: "spell_rush1_10",
        name: "「」",
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