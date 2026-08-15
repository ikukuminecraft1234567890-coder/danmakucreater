window.DanmakuCompiler = window.DanmakuCompiler || {};

window.DanmakuCompiler.getExpr = function(block, key, defaultVal) {
    if (block.compiledParams && block.compiledParams[key]) {
        let fn = block.compiledParams[key];
        if (typeof fn === 'function') {
            let body = fn.__sourceCode;
            if (body) {
                body = body.replace(/__v/g, 'vars');
                body = body.replace(/__rand/g, 'random');
                body = body.replace(/__fuzzyEqual/g, '_util.fuzzyEqual');
                body = body.replace(/__fuzzyNotEqual/g, '_util.fuzzyNotEqual');
                body = body.replace(/__seedrandom/g, '_util.seedrandom');
                body = body.replace(/__checkInterval/g, '_util.checkInterval');
                return body;
            }
        } else if (typeof fn === 'number') {
            return String(fn);
        } else if (typeof fn === 'string') {
            return JSON.stringify(fn);
        }
    }
    if (block.params && block.params[key] !== undefined) {
        return JSON.stringify(block.params[key]);
    }
    return defaultVal;
};

window.DanmakuCompiler.generateBlocksJS = function(blocks, indent) {
    let js = "";
    let ind = "  ".repeat(indent);
    for (let i = 0; i < blocks.length; i++) {
        let block = blocks[i];
        let t = block.type;
        if (t === 'wait') {
            js += ind + `state.waitTimer = ${window.DanmakuCompiler.getExpr(block, 'duration', '0')};\n`;
            js += ind + `yield;\n`;
        } else if (t === 'assign' || t === 'set_var' || t === 'const_var') {
            let varName = block.params.var || block.params.name;
            if (varName) {
                js += ind + `vars['${varName}'] = ${window.DanmakuCompiler.getExpr(block, 'value', '0')};\n`;
            }
        } else if (t === 'change_var') {
            let varName = block.params.var || block.params.name;
            if (varName) {
                let op = block.params.op === '-' ? '-' : '+';
                js += ind + `vars['${varName}'] = (vars['${varName}'] || 0) ${op} (${window.DanmakuCompiler.getExpr(block, 'value', '0')});\n`;
            }
        } else if (t === 'forever') {
            js += ind + `while (true) {\n`;
            js += window.DanmakuCompiler.generateBlocksJS(block.children || [], indent + 1);
            js += ind + `  state.waitTimer = Math.max(state.waitTimer || 0, 0.001);\n`;
            js += ind + `  yield;\n`;
            js += ind + `}\n`;
        } else if (t === 'repeat') {
            let uid = (window.DanmakuCompiler._uid = (window.DanmakuCompiler._uid || 0) + 1);
            let count = window.DanmakuCompiler.getExpr(block, 'count', '1');
            if (block.params && block.params.indexVar) {
                let idxVar = `vars['${block.params.indexVar}']`;
                let prevVar = `_prev_${block.params.indexVar}_${uid}`;
                let loopIdx = `_loopIdx_${uid}`;
                // ローカル変数でループカウンターを管理し、vars['i']はスクリプト参照用に同期
                // これにより並列スレッドがvars['i']を共有してもforカウンターが狂わない
                js += ind + `let ${prevVar} = ${idxVar};\n`;
                js += ind + `for (let ${loopIdx} = 0, _limit_${uid} = Math.round(${count}); ${loopIdx} < _limit_${uid}; ${loopIdx}++) {\n`;
                js += ind + `  ${idxVar} = ${loopIdx};\n`;
                js += window.DanmakuCompiler.generateBlocksJS(block.children || [], indent + 1);
                js += ind + `}\n`;
                js += ind + `${idxVar} = ${prevVar};\n`;
            } else {
                let idxVar = `_i_${uid}`;
                js += ind + `for (let _limit_${uid} = Math.round(${count}), ${idxVar} = 0; ${idxVar} < _limit_${uid}; ${idxVar}++) {\n`;
                js += window.DanmakuCompiler.generateBlocksJS(block.children || [], indent + 1);
                js += ind + `}\n`;
            }
        } else if (t === 'while') {
            let cond = window.DanmakuCompiler.getExpr(block, 'cond', 'false');
            js += ind + `while (${cond}) {\n`;
            js += window.DanmakuCompiler.generateBlocksJS(block.children || [], indent + 1);
            js += ind + `  state.waitTimer = Math.max(state.waitTimer || 0, 0.001);\n`;
            js += ind + `  yield;\n`;
            js += ind + `}\n`;
        } else if (t === 'if') {
            let cond = window.DanmakuCompiler.getExpr(block, 'cond', 'false');
            js += ind + `if (${cond}) {\n`;
            js += window.DanmakuCompiler.generateBlocksJS(block.children || [], indent + 1);
            js += ind + `}\n`;
        } else if (t === 'once') {
            let bid = block.id || Math.random().toString(36).substr(2, 9);
            js += ind + `if (!state.onceMap) state.onceMap = {};\n`;
            js += ind + `if (!state.onceMap['${bid}']) {\n`;
            js += ind + `  state.onceMap['${bid}'] = true;\n`;
            js += window.DanmakuCompiler.generateBlocksJS(block.children || [], indent + 1);
            js += ind + `}\n`;
        } else {
            js += ind + `if (_util.executeBlock({ type: '${t}', `;
            if (block.id) {
                js += `id: "${block.id}", `;
            }
            if (block.params) {
                for (let key in block.params) {
                    let rawVal = block.params[key];
                    js += `${key}: ${JSON.stringify(rawVal)}, `;
                }
            }
            if (block.children && block.children.length > 0) {
                js += `children: ${JSON.stringify(block.children)}, `;
                let childFuncStr = window.DanmakuCompiler.compileSingle(block.children, true);
                js += `compiledFn: ${childFuncStr}, `;
            }
            js += `}, state, b, attacker, target, _util)) {\n`;
            js += ind + `  yield;\n`;
            js += ind + `}\n`;
        }
    }
    return js;
};

window.DanmakuCompiler.isParallelRootBlock = function(block) {
    return block && ['repeat', 'forever', 'while', 'if', 'once'].includes(block.type);
};

window.DanmakuCompiler.splitParallelThreadGroups = function(blocks) {
    const rootBlocks = blocks || [];
    if (rootBlocks.filter(window.DanmakuCompiler.isParallelRootBlock).length < 2) return null;

    const setupBlocks = [];
    const threadGroups = [];
    let currentGroup = null;

    rootBlocks.forEach(block => {
        if (window.DanmakuCompiler.isParallelRootBlock(block)) {
            currentGroup = [block];
            threadGroups.push(currentGroup);
        } else if (currentGroup) {
            currentGroup.push(block);
        } else {
            setupBlocks.push(block);
        }
    });

    if (setupBlocks.length > 0) {
        threadGroups.forEach(group => {
            group.unshift(...JSON.parse(JSON.stringify(setupBlocks)));
        });
    }

    return threadGroups;
};

window.DanmakuCompiler.compileSingle = function(blocks, isBulletScript) {
    let funcStr = `function*(state, b, attacker, target, _util) {\n`;
    funcStr += `  let vars = state.variables;\n`;
    funcStr += `  const random = _util.rand;\n`;
    funcStr += `  const rand = _util.rand;\n`;
    funcStr += `  const seedrandom = _util.seedrandom;\n`;
    
    if (isBulletScript && blocks && blocks.length > 0) {
        funcStr += `  while (true) {\n`;
        funcStr += window.DanmakuCompiler.generateBlocksJS(blocks, 2);
        funcStr += `    state.waitTimer = Math.max(state.waitTimer || 0, 0.001);\n`;
        funcStr += `    yield;\n`;
        funcStr += `  }\n`;
    } else {
        funcStr += window.DanmakuCompiler.generateBlocksJS(blocks || [], 1);
    }
    
    funcStr += `}`;
    return funcStr;
};
