window.DanmakuCompiler = window.DanmakuCompiler || {};

window.DanmakuCompiler.getExpr = function(block, key, defaultVal) {
    if (block.compiledParams && block.compiledParams[key]) {
        let fn = block.compiledParams[key];
        if (typeof fn === 'function') {
            let body = fn.__sourceCode;
            if (body) {
                body = body.replace(/__v/g, 'vars');
                body = body.replace(/__rand/g, 'Math.random()');
                body = body.replace(/__fuzzyEqual/g, '_util.fuzzyEqual');
                body = body.replace(/__fuzzyNotEqual/g, '_util.fuzzyNotEqual');
                body = body.replace(/__seedrandom/g, '_util.seedrandom');
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
            js += ind + `state.waitTimer = Math.max(0.001, ${window.DanmakuCompiler.getExpr(block, 'duration', '0.01')});\n`;
            js += ind + `yield;\n`;
        } else if (t === 'assign' || t === 'set_var' || t === 'const_var') {
            let varName = block.params.var || block.params.name;
            if (varName) {
                js += ind + `vars['${varName}'] = ${window.DanmakuCompiler.getExpr(block, 'value', '0')};\n`;
            }
        } else if (t === 'change_var') {
            let varName = block.params.var || block.params.name;
            if (varName) {
                js += ind + `vars['${varName}'] = (vars['${varName}'] || 0) + (${window.DanmakuCompiler.getExpr(block, 'value', '0')});\n`;
            }
        } else if (t === 'forever') {
            js += ind + `while (true) {\n`;
            js += window.DanmakuCompiler.generateBlocksJS(block.children || [], indent + 1);
            js += ind + `  state.waitTimer = Math.max(state.waitTimer || 0, 0.001);\n`;
            js += ind + `  yield;\n`;
            js += ind + `}\n`;
        } else if (t === 'repeat') {
            let count = window.DanmakuCompiler.getExpr(block, 'count', '1');
            if (block.params && block.params.indexVar) {
                let idxVar = `vars['${block.params.indexVar}']`;
                js += ind + `${idxVar} = 0;\n`;
                js += ind + `for (let _limit${indent} = Math.round(${count}); ${idxVar} < _limit${indent}; ${idxVar}++) {\n`;
            } else {
                let idxVar = `_i${indent}`;
                js += ind + `for (let _limit${indent} = Math.round(${count}), ${idxVar} = 0; ${idxVar} < _limit${indent}; ${idxVar}++) {\n`;
            }
            js += window.DanmakuCompiler.generateBlocksJS(block.children || [], indent + 1);
            js += ind + `}\n`;
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
            js += ind + `_util.executeBlock({ type: '${t}', `;
            if (block.id) {
                js += `id: "${block.id}", `;
            }
            if (block.params) {
                for (let key in block.params) {
                    let exprVal = window.DanmakuCompiler.getExpr(block, key, 'undefined');
                    js += `${key}: ${exprVal}, `;
                }
            }
            if (block.children && block.children.length > 0) {
                js += `children: ${JSON.stringify(block.children)}, `;
                let childFuncStr = window.DanmakuCompiler.compileSingle(block.children, true);
                js += `compiledFn: ${childFuncStr}, `;
            }
            js += `}, state, b, attacker, target, _util);\n`;
        }
    }
    return js;
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
        funcStr += `    state.waitTimer = Math.max(state.waitTimer || 0, 0.01);\n`;
        funcStr += `    yield;\n`;
        funcStr += `  }\n`;
    } else {
        funcStr += window.DanmakuCompiler.generateBlocksJS(blocks || [], 1);
    }
    
    funcStr += `}`;
    return funcStr;
};
