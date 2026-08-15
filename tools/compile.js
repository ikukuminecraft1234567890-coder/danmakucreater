const fs = require('fs');
const path = require('path');

// Mocks for browser environment so game.js and editor.js can run in Node
global.window = global; global.window.addEventListener = () => {}; global.addEventListener = () => {};
global.addEventListener = () => {};
global.document = { addEventListener: () => {},
    getElementById: (id) => ({ addEventListener: () => {}, 
        getContext: () => ({
            fillRect: () => {},
            clearRect: () => {},
            drawImage: () => {},
            fillText: () => {},
            measureText: () => ({ width: 0 }),
            beginPath: () => {},
            arc: () => {},
            fill: () => {},
            stroke: () => {},
            save: () => {},
            restore: () => {},
            translate: () => {},
            rotate: () => {},
            scale: () => {}
        }),
        addEventListener: () => {},
        width: 640,
        height: 960,
        style: {},
        classList: { add: () => {}, remove: () => {}, contains: () => false },
        value: ''
    }),
    createElement: () => ({
        getContext: () => ({}),
        style: {}
    }),
    querySelector: () => null,
    querySelectorAll: () => []
};
global.Image = class {};
global.Audio = class {
    constructor() { this.src = ''; }
    play() {}
    pause() {}
    cloneNode() { return new Audio(); }
};
global.requestAnimationFrame = () => {};
global.cancelAnimationFrame = () => {};
global.localStorage = { getItem: () => null, setItem: () => {} };
global.navigator = { userAgent: '' };

const jsDir = path.join(__dirname, '..', 'js');

// Load files
const gameJs = fs.readFileSync(path.join(jsDir, 'game.js'), 'utf8');
const editorJs = fs.readFileSync(path.join(jsDir, 'editor.js'), 'utf8');
const compilerJs = fs.readFileSync(path.join(jsDir, 'compiler.js'), 'utf8');
const danmakuJs = fs.readFileSync(path.join(jsDir, 'danmaku.js'), 'utf8');
const emitterJs = fs.readFileSync(path.join(jsDir, 'emitter.js'), 'utf8');

// Evaluate in global scope
eval(gameJs);
eval(editorJs);
eval(compilerJs);
eval(danmakuJs + ';\nwindow.sharedDanmakuList = sharedDanmakuList;');

function compileDanmakuToJS() {
    console.log("Compiling danmaku..."); console.log("compileIndentedBlocks typeof:", typeof compileIndentedBlocks);
    try {
        let emitterText = emitterJs;

        let switchMatches = [...emitterText.matchAll(/switch\s*\(\s*block\.type\s*\)\s*\{/g)];
        if (switchMatches.length === 0) {
            console.error("Could not find the switch statement in executeBlock!");
            return;
        }

        let startIndex = switchMatches[0].index;
        let braceCount = 0;
        let endIndex = -1;
        let started = false;

        for (let i = startIndex; i < emitterText.length; i++) {
            if (emitterText[i] === '{') {
                braceCount++;
                started = true;
            } else if (emitterText[i] === '}') {
                braceCount--;
                if (started && braceCount === 0) {
                    endIndex = i;
                    break;
                }
            }
        }

        let switchBody1 = emitterText.substring(startIndex, endIndex); // 最後の '}' を含めない
        
        let switchBody2 = "";
        if (switchMatches.length > 1) {
            let startIndex2 = switchMatches[1].index;
            let braceCount2 = 0;
            let endIndex2 = -1;
            let started2 = false;
            for (let i = startIndex2; i < emitterText.length; i++) {
                if (emitterText[i] === '{') {
                    braceCount2++;
                    started2 = true;
                } else if (emitterText[i] === '}') {
                    braceCount2--;
                    if (started2 && braceCount2 === 0) {
                        endIndex2 = i;
                        break;
                    }
                }
            }
            let fullSwitch2 = emitterText.substring(startIndex2, endIndex2);
            let firstBrace = fullSwitch2.indexOf('{');
            if (firstBrace !== -1) {
                switchBody2 = fullSwitch2.substring(firstBrace + 1);
            }
        }

        let switchBody = switchBody1 + "\n" + switchBody2 + "\n        }";

        let runtimeBlocksCode = switchBody;
        runtimeBlocksCode = runtimeBlocksCode.replace(/block\.params/g, 'p');
        runtimeBlocksCode = runtimeBlocksCode.replace(/block\.type/g, 'p.type');
        runtimeBlocksCode = runtimeBlocksCode.replace(/block\.children/g, 'p.children');
        runtimeBlocksCode = runtimeBlocksCode.replace(/resolveColorParam\(/g, 'window.DanmakuCompilerRuntime.resolveColorParam(');
        runtimeBlocksCode = runtimeBlocksCode.replace(/initBulletState\(/g, '_util._initBulletState(');
        runtimeBlocksCode = runtimeBlocksCode.replace(/runCustomBulletScript\(/g, '_util._runCustomBulletScript(');
        runtimeBlocksCode = runtimeBlocksCode.replace(/computeBulletThreatWeight\(/g, '_util._computeBulletThreatWeight(');
        runtimeBlocksCode = runtimeBlocksCode.replace(/attacker\.x/g, '(window.DanmakuCompilerRuntime._getCurrentX(b, attacker, state))');
        runtimeBlocksCode = runtimeBlocksCode.replace(/attacker\.y/g, '(window.DanmakuCompilerRuntime._getCurrentY(b, attacker, state, window.canvas ? window.canvas.height : 900))');


        let outputJS = `// ==========================================
// PRE-COMPILED DANMAKU GENERATORS
// Auto-generated by tools/compile.js
// ==========================================

window.compiledDanmaku = window.compiledDanmaku || {};
window.DanmakuCompilerRuntime = window.DanmakuCompilerRuntime || {};

// Helpers
window.DanmakuCompilerRuntime.resolveColorParam = function(val, vars) {
    if (!val) return null;
    let s = String(val);
    if (s.startsWith('#')) return s;
    if (vars && vars[s]) return String(vars[s]);
    return s;
};

// 実行エンジン (extracted from emitter.js)
window.DanmakuCompilerRuntime.executeBlock = function(p, state, b, attacker, target, _util) {
    let isPlayerSide = state ? state.isPlayerSide : false;
    let canvas = window.canvas || {width: 640, height: 960};
    let PLAY_WIDTH = typeof window.PLAY_WIDTH !== 'undefined' ? window.PLAY_WIDTH : 768;
    let dt = (state && state.dt !== undefined) ? state.dt : ((window.DanmakuCompilerRuntime && window.DanmakuCompilerRuntime.currentDt) || window.dt || 1 / 60);
    let block = p;
    let brokeToWait = false;
    let advancePC = true;
    
    ${runtimeBlocksCode}
    
    return brokeToWait;
};

window.DanmakuCompilerRuntime.fuzzyEqual = function(a, b) {
    let sa = String(a).trim().toLowerCase();
    let sb = String(b).trim().toLowerCase();
    if (sa === sb) return true;
    let na = Number(sa);
    let nb = Number(sb);
    if (!isNaN(na) && !isNaN(nb)) return Math.abs(na - nb) < 0.0001;
    return false;
};
window.DanmakuCompilerRuntime.fuzzyNotEqual = function(a, b) { return !window.DanmakuCompilerRuntime.fuzzyEqual(a, b); };
window.DanmakuCompilerRuntime.rand = function(a, b) {
    if (b !== undefined) return Number(a || 0) + Math.random() * (Number(b || 0) - Number(a || 0));
    if (a !== undefined) return Math.random() * Number(a || 0);
    return Math.random();
};
window.DanmakuCompilerRuntime.seedrandom = function(baseSeed, a, b, vars) {
    let n = vars.n !== undefined ? vars.n : 0;
    let t = vars.t !== undefined ? vars.t : 0;
    let seed = Math.floor(Number(baseSeed)) + Math.floor(n) * 2654435761 + Math.floor(t * 1000) * 314159265;
    let s = (seed >>> 0) + 0x6D2B79F5;
    s = Math.imul(s ^ (s >>> 15), s | 1);
    s ^= s + Math.imul(s ^ (s >>> 7), s | 61);
    let r = ((s ^ (s >>> 14)) >>> 0) / 4294967296;
    if (b !== undefined) return Number(a || 0) + r * (Number(b || 0) - Number(a || 0));
    if (a !== undefined) return r * Number(a || 0);
    return r;
};
window.DanmakuCompilerRuntime.checkInterval = function(currentVal, interval, stateKey, variables) {
    if (!interval || interval <= 0) return false;
    let prevVal = variables[stateKey];
    variables[stateKey] = currentVal;
    if (prevVal === undefined) { prevVal = 0; }
    return Math.floor(prevVal / interval) !== Math.floor(currentVal / interval);
};


`;

        let compiledCount = 0;
        for (let danmaku of window.sharedDanmakuList) {
            let idx = window.sharedDanmakuList.indexOf(danmaku);
            
            let id = danmaku.id || ('danmaku_' + idx);
            
            // Compile emitterScript
            let blocks = Array.isArray(danmaku.emitterScript) ? danmaku.emitterScript : (typeof codeToBlocks === 'function' ? codeToBlocks(danmaku.emitterScript) : []);
            let compiledBlocks = typeof compileIndentedBlocks === 'function' ? compileIndentedBlocks(JSON.parse(JSON.stringify(blocks))) : [];
            let threadGroups = typeof window.DanmakuCompiler.splitParallelThreadGroups === 'function'
                ? window.DanmakuCompiler.splitParallelThreadGroups(compiledBlocks)
                : null;

            if (threadGroups && threadGroups.length >= 2) {
                let funcs = threadGroups.map(group => window.DanmakuCompiler.compileSingle(group));
                outputJS += `window.compiledDanmaku['${id}'] = [\n  ${funcs.join(',\n  ')}\n];\n`;
            } else {
                let funcStr = window.DanmakuCompiler.compileSingle(compiledBlocks);
                outputJS += `window.compiledDanmaku['${id}'] = ${funcStr};\n`;
            }
            
            // Compile bulletScript
            let bBlocks = Array.isArray(danmaku.bulletScript) ? danmaku.bulletScript : (typeof codeToBlocks === 'function' ? codeToBlocks(danmaku.bulletScript) : []);
            let bCompiled = typeof compileIndentedBlocks === 'function' ? compileIndentedBlocks(JSON.parse(JSON.stringify(bBlocks))) : [];
            let bFuncStr = window.DanmakuCompiler.compileSingle(bCompiled, true);
            outputJS += `window.compiledDanmaku['${id}_bullet'] = ${bFuncStr};\n`;

            // Compile magicCircleScript
            let mBlocks = Array.isArray(danmaku.magicCircleScript) ? danmaku.magicCircleScript : (typeof codeToBlocks === 'function' ? codeToBlocks(danmaku.magicCircleScript) : []);
            let mCompiled = typeof compileIndentedBlocks === 'function' ? compileIndentedBlocks(JSON.parse(JSON.stringify(mBlocks))) : [];
            let mFuncStr = window.DanmakuCompiler.compileSingle(mCompiled, true);
            outputJS += `window.compiledDanmaku['${id}_magic'] = ${mFuncStr};\n\n`;

            compiledCount++;

        }

        fs.writeFileSync(path.join(jsDir, 'compiledanmaku.js'), outputJS, 'utf8');
        console.log(`Successfully compiled ${compiledCount} danmaku scripts to js/compiledanmaku.js!`);
        
    } catch (e) {
        console.error("Compilation failed:", e);
    }
}

compileDanmakuToJS();
