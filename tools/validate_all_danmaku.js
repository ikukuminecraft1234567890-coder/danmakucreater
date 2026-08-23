const fs = require('fs');
const path = require('path');

// Mock browser environment
const mockElement = {
    width: 768,
    height: 896,
    getContext: () => ({
        fillRect: () => {},
        clearRect: () => {},
        measureText: () => ({ width: 10 }),
        drawImage: () => {},
        beginPath: () => {},
        arc: () => {},
        fill: () => {},
        stroke: () => {},
        save: () => {},
        restore: () => {},
        translate: () => {},
        rotate: () => {},
        createRadialGradient: () => ({ addColorStop: () => {} }),
        createLinearGradient: () => ({ addColorStop: () => {} })
    }),
    addEventListener: () => {},
    removeEventListener: () => {},
    style: {},
    classList: { add: () => {}, remove: () => {}, contains: () => false },
    appendChild: () => {},
    removeChild: () => {},
    innerHTML: '',
    value: ''
};
global.window = global;
global.CUSTOM_SPAWN_RING_MAX_COUNT = 9999;
global.CUSTOM_SPAWN_WAY_MAX_COUNT = 9999;
global.CUSTOM_SPAWN_BULLET_MAX_COUNT = 9999;
global.Image = class { constructor() { this.src = ''; } };
global.document = {
    createElement: () => mockElement,
    addEventListener: () => {},
    removeEventListener: () => {},
    getElementById: (id) => mockElement,
    querySelector: () => mockElement,
    querySelectorAll: () => [mockElement]
};
global.window.addEventListener = () => {};
global.window.removeEventListener = () => {};
global.canvas = mockElement;
global.PLAY_WIDTH = 768;
global.Audio = class {
    constructor() { this.src = ''; }
    play() {}
    pause() {}
    cloneNode() { return new Audio(); }
};
global.requestAnimationFrame = () => {};
global.cancelAnimationFrame = () => {};
global.localStorage = { getItem: () => null, setItem: () => {} };
global.navigator = { userAgent: '', getGamepads: () => [] };
global.setInterval = () => {};
global.setTimeout = () => {};

const jsDir = path.join(__dirname, '..', 'js');
eval(fs.readFileSync(path.join(jsDir, 'data.js'), 'utf8'));
eval(fs.readFileSync(path.join(jsDir, 'game.js'), 'utf8'));
eval(fs.readFileSync(path.join(jsDir, 'editor.js'), 'utf8'));
eval(fs.readFileSync(path.join(jsDir, 'compiler.js'), 'utf8'));
eval(fs.readFileSync(path.join(jsDir, 'danmaku.js'), 'utf8') + ';\nwindow.sharedDanmakuList = sharedDanmakuList;');
if (fs.existsSync(path.join(jsDir, 'danmaku2.js'))) {
    eval(fs.readFileSync(path.join(jsDir, 'danmaku2.js'), 'utf8') + ';\nwindow.sharedDanmakuListS2 = typeof sharedDanmakuListS2 !== "undefined" ? sharedDanmakuListS2 : [];');
} else {
    window.sharedDanmakuListS2 = [];
}
eval(fs.readFileSync(path.join(jsDir, 'emitter.js'), 'utf8'));
eval(fs.readFileSync(path.join(jsDir, 'compiledanmaku.js'), 'utf8'));

console.log(`========================================`);
console.log(`DANMAKU VALIDATION & STATIC ANALYSIS`);
console.log(`Total S1 danmaku to test: ${window.sharedDanmakuList.length}`);
console.log(`Total S2 danmaku to test: ${window.sharedDanmakuListS2.length}`);
console.log(`========================================\n`);

let issuesFound = 0;

const allDanmakuToTest = [
    ...window.sharedDanmakuList.map((d, i) => ({ ...d, _season: 1, _id: d.id || ('danmaku_' + i) })),
    ...window.sharedDanmakuListS2.map((d, i) => ({ ...d, _season: 2, _id: d.id || ('danmaku_s2_' + i) }))
];

allDanmakuToTest.forEach((danmaku, idx) => {
    const cardId = danmaku._id;
    const cardName = `[S${danmaku._season}] ` + (danmaku.name || `Card #${idx}`);
    let cardIssues = [];

    // 1. 静的コード解析 (Static Analysis)
    const emitterCode = danmaku.emitterScript || '';
    const bulletCode = danmaku.bulletScript || '';

    // Check A: Nested for loops with same variable name in raw script
    const lines = (typeof emitterCode === 'string' ? emitterCode : '').split('\n');
    let loopStack = [];
    lines.forEach((line, lineIdx) => {
        let m = line.match(/for\s*\(\s*let\s+([a-zA-Z0-9_]+)\s*=/);
        if (m) {
            let varName = m[1];
            if (loopStack.includes(varName)) {
                cardIssues.push(`[WARN: Nested Loop Variable Shadowing] Line ${lineIdx + 1}: Loop variable '${varName}' shadows outer loop variable.`);
            }
            loopStack.push(varName);
        }
        let openBraces = (line.match(/\{/g) || []).length;
        let closeBraces = (line.match(/\}/g) || []).length;
        for (let b = 0; b < (closeBraces - openBraces); b++) {
            loopStack.pop();
        }
    });

    // Check B: while (true) or forever without any wait()
    if (typeof emitterCode === 'string') {
        if ((emitterCode.includes('while (true)') || emitterCode.includes('while(true)') || emitterCode.includes('forever')) && !emitterCode.includes('wait(')) {
            cardIssues.push(`[CRITICAL: Infinite Loop without wait] Infinite loop found without any wait() call.`);
        }
    }

    // 2. 動作シミュレーション比較 (Interpreter vs AOT Compiler)
    let attacker = { x: 384, y: 180, team: 'CPU' };
    let target = { x: 384, y: 700, team: 'PLAYER' };
    let player = target;
    global.player = player;
    global.cpu = attacker;

    let eBlocks = Array.isArray(danmaku.emitterScript) ? danmaku.emitterScript : (typeof codeToBlocks === 'function' ? codeToBlocks(danmaku.emitterScript) : []);
    let bBlocks = Array.isArray(danmaku.bulletScript) ? danmaku.bulletScript : (typeof codeToBlocks === 'function' ? codeToBlocks(danmaku.bulletScript) : []);

    // Test AOT Compiled Generator
    let aotState = initEmitterState(eBlocks, attacker, target, 0, 0, cardId);
    aotState.bulletScript = bBlocks;

    let aotBullets = [];
    let prevBullets = global.bullets;
    global.bullets = aotBullets;

    let aotError = null;
    try {
        for (let frame = 0; frame < 600; frame++) {
            stepEmitter({ emitterState: aotState }, aotState, attacker, target, 1 / 60);
        }
    } catch (e) {
        aotError = e;
    }

    if (aotError) {
        cardIssues.push(`[ERROR: AOT Runtime Exception] ${aotError.message} at frame ${aotState.variables.frame}`);
    }

    // Test AST Interpreter (Bypass compiledFn)
    let interpState = initEmitterState(eBlocks, attacker, target, 0, 0, null); // compiledFn = null
    interpState.bulletScript = bBlocks;
    interpState.compiledFn = null;

    let interpBullets = [];
    global.bullets = interpBullets;

    let interpError = null;
    try {
        for (let frame = 0; frame < 600; frame++) {
            stepEmitter({ emitterState: interpState }, interpState, attacker, target, 1 / 60);
        }
    } catch (e) {
        interpError = e;
    }

    if (interpError) {
        cardIssues.push(`[ERROR: Interpreter Runtime Exception] ${interpError.message}`);
    }

    // Compare spawned bullet counts (ignoring slight random differences if random is used)
    let hasRandom = typeof emitterCode === 'string' && (emitterCode.includes('rand') || emitterCode.includes('Math.random'));
    if (!aotError && !interpError && !hasRandom) {
        let aotCount = aotBullets.length;
        let interpCount = interpBullets.length;
        if (Math.abs(aotCount - interpCount) > 2) {
            cardIssues.push(`[DISCREPANCY: Bullet Count Mismatch] AOT produced ${aotCount} bullets, Interpreter produced ${interpCount} bullets.`);
        }
    }

    global.bullets = prevBullets;

    if (cardIssues.length > 0) {
        issuesFound++;
        console.log(`[Card #${idx}] "${cardName}" (ID: ${cardId})`);
        cardIssues.forEach(iss => console.log(`  ${iss}`));
        console.log('');
    }
});

console.log(`========================================`);
console.log(`ANALYSIS COMPLETE: Found issues in ${issuesFound} cards.`);
console.log(`========================================`);
process.exit(0);
