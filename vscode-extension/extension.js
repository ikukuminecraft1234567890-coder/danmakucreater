const vscode = require('vscode');

/**
 * Danmaku DSL VS Code Extension - Ultra Fast & Clean Context Autocomplete
 */

const BULLET_IMAGES = [
    { label: 'kome', desc: '米弾', insertText: 'kome' },
    { label: 'ohuda', desc: 'お札', insertText: 'ohuda' },
    { label: 'star', desc: '星弾', insertText: 'star' },
    { label: 'b_star', desc: '大星弾', insertText: 'b_star' },
    { label: 'onmyoutama', desc: '陰陽玉', insertText: 'onmyoutama' },
    { label: 'marutama', desc: '丸弾', insertText: 'marutama' },
    { label: 'ootama', desc: '大玉', insertText: 'ootama' },
    { label: 'poihuru', desc: 'ポイフル弾', insertText: 'poihuru' },
    { label: 'uroko', desc: '鱗弾', insertText: 'uroko' },
    { label: 'sword', desc: '剣弾', insertText: 'sword' },
    { label: 'knife', desc: 'ナイフ弾', insertText: 'knife' },
    { label: 'kunai1', desc: 'クナイ弾1', insertText: 'kunai1' },
    { label: 'kunai2', desc: 'クナイ弾2', insertText: 'kunai2' },
    { label: 'virus', desc: 'ウイルス弾', insertText: 'virus' },
    { label: 'dangan', desc: '弾丸', insertText: 'dangan' },
    { label: 'tyoudan', desc: '蝶弾 (蝶型の弾)', insertText: 'tyoudan' },
    { label: 'none', desc: '通常丸弾', insertText: 'none' }
];

const COORD_MODES = [
    { label: 'relative', desc: '相対座標 (ボス基準)', insertText: 'relative' },
    { label: 'absolute', desc: '絶対座標 (画面左上基準)', insertText: 'absolute' }
];

const BULLET_TYPES = [
    { label: 'normal', desc: '通常弾', insertText: 'normal' },
    { label: 'trail', desc: 'トレイル弾', insertText: 'trail' },
    { label: 'laser', desc: 'レーザー弾', insertText: 'laser' }
];

const SOUND_EFFECTS = [
    { label: 'shot', desc: '自機ショット音' },
    { label: 'tan00', desc: '敵弾発射音' },
    { label: 'kira00', desc: 'キラキラ音' },
    { label: 'cat00', desc: 'スペル宣言音' },
    { label: 'damage00', desc: '通常被弾音' },
    { label: 'damage01', desc: '瀕死被弾音' },
    { label: 'cardget', desc: '取得音' },
    { label: 'pldead00', desc: '自機被弾音' },
    { label: 'timeout', desc: '時間切れ音' },
    { label: 'fault', desc: '警告音' }
];

const DSL_FUNCTIONS = [
    { name: 'spawnRing', snippet: 'spawnRing("normal", "#ff3344", 170, angle, 16, 0, 0, 20, "ohuda", "relative", 6)', detail: '全方位リング弾' },
    { name: 'spawnWay', snippet: 'spawnWay("normal", "#ff3344", 180, angle, 3, 30, 0, 0, 20, "star", "relative", 6)', detail: 'Way弾 (扇状弾)' },
    { name: 'spawnStraight', snippet: 'spawnStraight("normal", "#ff3344", 200, angle, 0, 0, 20, "kome", "relative", 6)', detail: '直線単発弾' },
    { name: 'spawnTrail', snippet: 'spawnTrail("#00ffff", 200, angle, 0, 0, 8, 0.2, 0.3, 0.5, true, "relative", 6)', detail: 'トレイル弾' },
    { name: 'spawnBeam', snippet: 'spawnBeam(1.0, 1.5, 12, angle, 0, 0, "relative", 8)', detail: '極太ビーム' },
    { name: 'spawnLaserWay', snippet: 'spawnLaserWay("#ff3333", 6, 200, angle, 3, 45, 0, 0, 0.2, 0.3, 0.5, true, "relative", 6)', detail: 'レーザーWay弾' },
    { name: 'spawnLaserRing', snippet: 'spawnLaserRing("#ff3333", 6, 200, angle, 12, 0, 0, 0.2, 0.3, 0.5, true, "relative", 6)', detail: 'レーザーリング弾' },
    { name: 'spawnMagicCircle', snippet: 'spawnMagicCircle("#ff00ff", 30, 3.0, 0, 0, "relative")', detail: '魔法陣 (子機)' },
    { name: 'aimAtTarget', snippet: 'aimAtTarget()', detail: '自機狙い角度' },
    { name: 'aimAt', snippet: 'aimAt(${1:0}, ${2:0})', detail: '指定座標狙い' },
    { name: 'moveTo', snippet: 'moveTo(${1:0}, ${2:0})', detail: '瞬間移動' },
    { name: 'slideTo', snippet: 'slideTo(${1:0}, ${2:0}, ${3:1.0})', detail: 'スムーズ移動' },
    { name: 'wait', snippet: 'wait(${1:0.2})', detail: '指定秒数待機' },
    { name: 'repeat', snippet: 'repeat(${1:10}) {\n    $0\n}', detail: '指定回数ループ' },
    { name: 'while', snippet: 'while (true) {\n    $0\n}', detail: '無限ループ' },
    { name: 'playSound', snippet: 'playSound("${1:shot}")', detail: '効果音再生' },
    { name: 'tween', snippet: 'tween("${1:angle}", ${2:0}, ${3:360}, "seconds", ${4:1.0}, "linear")', detail: '変数アニメーション' },
    { name: 'slow', snippet: 'slow(${1:0.5}, ${2:0})', detail: '弾速減速' },
    { name: 'fast', snippet: 'fast(${1:2.0}, ${2:0})', detail: '弾速加速' },
    { name: 'bounce', snippet: 'bounce()', detail: '画面端バウンス' },
    { name: 'homing', snippet: 'homing(${1:3.0})', detail: 'ホーミング弾' },
    { name: 'rand', snippet: 'rand(${1:-15}, ${2:15})', detail: '乱数生成' }
];

function getFunctionContext(lineText, cursorCol) {
    const textBefore = lineText.substring(0, cursorCol);
    let parenDepth = 0;
    let argIndex = 0;
    let inQuotes = false;
    let quoteChar = '';
    let openParenIndex = -1;

    for (let i = 0; i < textBefore.length; i++) {
        const c = textBefore[i];
        if (c === '"' || c === "'") {
            if (!inQuotes) { inQuotes = true; quoteChar = c; }
            else if (quoteChar === c) { inQuotes = false; }
        } else if (!inQuotes) {
            if (c === '(') {
                parenDepth++;
                if (parenDepth === 1) {
                    openParenIndex = i;
                    argIndex = 0;
                }
            } else if (c === ')') {
                parenDepth--;
            } else if (c === ',' && parenDepth === 1) {
                argIndex++;
            }
        }
    }

    if (parenDepth >= 1 && openParenIndex !== -1) {
        const beforeParen = textBefore.substring(0, openParenIndex).trim();
        const match = beforeParen.match(/(\b\w+)$/);
        if (match) {
            return {
                funcName: match[1],
                argIndex: argIndex,
                inQuotes: inQuotes
            };
        }
    }
    return null;
}

function activate(context) {
    // 1. Completion Provider
    const completionProvider = vscode.languages.registerCompletionItemProvider(
        ['javascript', 'javascriptreact', 'typescript'],
        {
            provideCompletionItems(document, position) {
                const lineText = document.lineAt(position).text;
                const ctx = getFunctionContext(lineText, position.character);

                if (ctx) {
                    const { funcName, argIndex, inQuotes } = ctx;

                    // Bullet Image argument
                    const isBulletImageArg = (
                        (funcName === 'spawnRing' && argIndex === 8) ||
                        (funcName === 'spawnWay' && argIndex === 9) ||
                        (funcName === 'spawnStraight' && argIndex === 7) ||
                        (funcName === 'spawnBullet' && argIndex === 7) ||
                        (funcName === 'spawnRingResist' && argIndex === 8) ||
                        (funcName === 'spawnWayResist' && argIndex === 9)
                    );

                    if (isBulletImageArg) {
                        return BULLET_IMAGES.map((img, idx) => {
                            const item = new vscode.CompletionItem(img.label, vscode.CompletionItemKind.EnumMember);
                            item.detail = `弾画像: ${img.desc}`;
                            item.insertText = inQuotes ? img.insertText : `"${img.insertText}"`;
                            item.sortText = String(idx).padStart(3, '0');
                            return item;
                        });
                    }

                    // Coord Mode argument
                    const isCoordModeArg = (
                        (funcName === 'spawnRing' && argIndex === 9) ||
                        (funcName === 'spawnWay' && argIndex === 10) ||
                        (funcName === 'spawnStraight' && argIndex === 8) ||
                        (funcName === 'spawnBullet' && argIndex === 8) ||
                        (funcName === 'spawnTrail' && argIndex === 10) ||
                        (funcName === 'spawnBeam' && argIndex === 6)
                    );

                    if (isCoordModeArg) {
                        return COORD_MODES.map((cm, idx) => {
                            const item = new vscode.CompletionItem(cm.label, vscode.CompletionItemKind.EnumMember);
                            item.detail = `座標系: ${cm.desc}`;
                            item.insertText = inQuotes ? cm.insertText : `"${cm.insertText}"`;
                            item.sortText = String(idx).padStart(3, '0');
                            return item;
                        });
                    }

                    // Bullet Type argument
                    const isBulletTypeArg = (
                        (funcName === 'spawnRing' && argIndex === 0) ||
                        (funcName === 'spawnWay' && argIndex === 0) ||
                        (funcName === 'spawnStraight' && argIndex === 0) ||
                        (funcName === 'spawnBullet' && argIndex === 0)
                    );

                    if (isBulletTypeArg) {
                        return BULLET_TYPES.map((bt, idx) => {
                            const item = new vscode.CompletionItem(bt.label, vscode.CompletionItemKind.EnumMember);
                            item.detail = `弾種: ${bt.desc}`;
                            item.insertText = inQuotes ? bt.insertText : `"${bt.insertText}"`;
                            item.sortText = String(idx).padStart(3, '0');
                            return item;
                        });
                    }

                    // Sound Effect argument
                    if (funcName === 'playSound' && argIndex === 0) {
                        return SOUND_EFFECTS.map((se, idx) => {
                            const item = new vscode.CompletionItem(se.label, vscode.CompletionItemKind.Value);
                            item.detail = `SE: ${se.desc}`;
                            item.insertText = inQuotes ? se.label : `"${se.label}"`;
                            item.sortText = String(idx).padStart(3, '0');
                            return item;
                        });
                    }
                }

                // Default: Suggest clean DSL functions
                const items = [];
                for (const fn of DSL_FUNCTIONS) {
                    const item = new vscode.CompletionItem(fn.name, vscode.CompletionItemKind.Function);
                    item.detail = fn.detail;
                    item.insertText = new vscode.SnippetString(fn.snippet);
                    items.push(item);
                }

                // Add bullet images
                for (const img of BULLET_IMAGES) {
                    const item = new vscode.CompletionItem(img.label, vscode.CompletionItemKind.EnumMember);
                    item.detail = `弾画像: ${img.desc}`;
                    item.insertText = img.insertText;
                    items.push(item);
                }

                return items;
            }
        },
        '(', ',', '"', "'", '`', ' ', '', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
    );

    // 2. Real-time Continuous Auto-Trigger on Any Cursor Movement or Selection
    let suggestDebounceTimer = null;
    const selectionChangeDisposable = vscode.window.onDidChangeTextEditorSelection((e) => {
        if (!e.textEditor || !e.selections || e.selections.length === 0) return;
        const selection = e.selections[0];
        if (!selection.isEmpty) return;

        const doc = e.textEditor.document;
        if (!['javascript', 'javascriptreact', 'typescript'].includes(doc.languageId)) return;

        const pos = selection.active;
        const lineText = doc.lineAt(pos.line).text;
        
        // If line contains danmaku functions or cursor is inside function
        if (lineText.includes('spawn') || lineText.includes('aim') || lineText.includes('play') || lineText.includes('wait') || lineText.includes('emitterScript') || lineText.includes('bulletScript') || lineText.includes('(')) {
            clearTimeout(suggestDebounceTimer);
            suggestDebounceTimer = setTimeout(() => {
                vscode.commands.executeCommand('editor.action.triggerSuggest');
            }, 50);
        }
    });

    context.subscriptions.push(completionProvider, selectionChangeDisposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
