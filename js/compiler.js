window.DanmakuCompiler = window.DanmakuCompiler || {};

window.DanmakuCompiler.getExpr = function(block, key, defaultVal) {
    if (block.compiledParams && block.compiledParams[key]) {
        let fn = block.compiledParams[key];
        if (typeof fn === 'function') {
            let str = fn.toString();
            let match = str.match(/return\s+(.*);/s);
            if (match) {
                let body = match[1].trim();
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
            js += ind + `yield (${window.DanmakuCompiler.getExpr(block, 'duration', '0.01')});\n`;
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
            js += ind + `  yield 0;\n`;
            js += ind + `}\n`;
        } else if (t === 'repeat') {
            let idxVar = block.params && block.params.indexVar ? `vars['${block.params.indexVar}']` : `_i${indent}`;
            let count = window.DanmakuCompiler.getExpr(block, 'count', '1');
            js += ind + `for (let _limit${indent} = Math.round(${count}), ${idxVar} = 0; ${idxVar} < _limit${indent}; ${idxVar}++) {\n`;
            js += window.DanmakuCompiler.generateBlocksJS(block.children || [], indent + 1);
            js += ind + `}\n`;
        } else if (t === 'while') {
            let cond = window.DanmakuCompiler.getExpr(block, 'cond', 'false');
            js += ind + `while (${cond}) {\n`;
            js += window.DanmakuCompiler.generateBlocksJS(block.children || [], indent + 1);
            js += ind + `  yield 0;\n`;
            js += ind + `}\n`;
        } else if (t === 'if') {
            let cond = window.DanmakuCompiler.getExpr(block, 'cond', 'false');
            js += ind + `if (${cond}) {\n`;
            js += window.DanmakuCompiler.generateBlocksJS(block.children || [], indent + 1);
            js += ind + `}\n`;
        } else {
            js += ind + `_util.executeBlock({ type: '${t}', `;
            if (block.params) {
                for (let key in block.params) {
                    let exprVal = window.DanmakuCompiler.getExpr(block, key, 'undefined');
                    js += `${key}: ${exprVal}, `;
                }
            }
            if (block.children && block.children.length > 0) {
                js += `children: ${JSON.stringify(block.children)}, `;
            }
            js += `}, state, b, attacker, target, _util);\n`;
        }
    }
    return js;
};

window.DanmakuCompiler.compileSingle = function(blocks) {
    let funcStr = `function*(state, b, attacker, target, _util) {\n`;
    funcStr += `  let vars = state.variables;\n`;
    funcStr += window.DanmakuCompiler.generateBlocksJS(blocks, 1);
    funcStr += `}`;
    return funcStr;
};
