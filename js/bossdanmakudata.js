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
        duration: 25,
        x_offset: 0,
        y_offset: 0,
        despawnTime: 1.5,
        emitterScript: `
while (true) {
    ey = 300
    aimAtTarget()
    spawnWay("normal", "#ff3333", 500, angle, 2, 30, 0, 0, 9, "dangan", "relative", "6")
    spawnWay("normal", "#ff3333", 500, angle, 3, 2, 0, 0, 9, "dangan", "relative", "6")
    spawnWay("normal", "#ff3333", 500, angle + 180, 5, 60, 0, 0, 9, "dangan", "relative", "6")
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