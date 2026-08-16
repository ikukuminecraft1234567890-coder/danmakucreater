const vscode = require('vscode');

/**
 * Danmaku DSL VS Code Extension
 */

const BULLET_IMAGES = [
    { label: 'kome', desc: '米弾 (小さな米粒状の弾)', insertText: 'kome' },
    { label: 'ohuda', desc: 'お札 (長方形の御札弾)', insertText: 'ohuda' },
    { label: 'star', desc: '星弾 (小さな星型の弾)', insertText: 'star' },
    { label: 'b_star', desc: '大星弾 (大きな星型の弾)', insertText: 'b_star' },
    { label: 'onmyoutama', desc: '陰陽玉 (大型の陰陽玉弾)', insertText: 'onmyoutama' },
    { label: 'marutama', desc: '丸弾 (中型の円形弾)', insertText: 'marutama' },
    { label: 'ootama', desc: '大玉 (超大型の円形弾)', insertText: 'ootama' },
    { label: 'poihuru', desc: 'ポイフル弾 (楕円カプセル弾)', insertText: 'poihuru' },
    { label: 'uroko', desc: '鱗弾 (鋭利なウロコ状の弾)', insertText: 'uroko' },
    { label: 'sword', desc: '剣弾 (直剣状の鋭い弾)', insertText: 'sword' },
    { label: 'knife', desc: 'ナイフ弾 (投げナイフ弾)', insertText: 'knife' },
    { label: 'kunai1', desc: 'クナイ弾1 (細身のクナイ弾)', insertText: 'kunai1' },
    { label: 'kunai2', desc: 'クナイ弾2 (幅広のクナイ弾)', insertText: 'kunai2' },
    { label: 'virus', desc: 'ウイルス弾 (トゲ付き球体弾)', insertText: 'virus' },
    { label: 'dangan', desc: '弾丸 (小型の銃弾)', insertText: 'dangan' },
    { label: 'none', desc: '通常弾 (標準の丸弾)', insertText: 'none' }
];

const COORD_MODES = [
    { label: 'relative', desc: '相対座標 (ボス/発射元を基準とした座標)', insertText: 'relative' },
    { label: 'absolute', desc: '絶対座標 (ゲーム画面左上 (0,0) を基準とした座標)', insertText: 'absolute' }
];

const BULLET_TYPES = [
    { label: 'normal', desc: '通常弾', insertText: 'normal' },
    { label: 'trail', desc: 'トレイル弾 (光の尾を引く弾)', insertText: 'trail' },
    { label: 'laser', desc: 'レーザー弾', insertText: 'laser' }
];

const SOUND_EFFECTS = [
    { label: 'shot', desc: '通常ショット発射音' },
    { label: 'tan00', desc: '敵弾発射音・弾消去音' },
    { label: 'kira00', desc: 'キラキラ効果音' },
    { label: 'cat00', desc: 'スペルカード発動・宣言音' },
    { label: 'damage00', desc: 'ボス通常被弾音' },
    { label: 'damage01', desc: 'ボス瀕死(HP10%以下)被弾音' },
    { label: 'cardget', desc: 'スペルカード取得ファンファーレ' },
    { label: 'pldead00', desc: '自機被弾・撃破音' },
    { label: 'timeout', desc: 'スペルカード時間切れ音' },
    { label: 'fault', desc: 'ミス・警告音' }
];

const DSL_FUNCTIONS = [
    {
        name: 'spawnRing',
        snippet: 'spawnRing("${1:normal}", "${2:#ff3344}", ${3:170}, ${4:angle}, ${5:16}, ${6:0}, ${7:0}, ${8:20}, "${9|ohuda,kome,star,b_star,onmyoutama,marutama,ootama,poihuru,uroko,sword,knife,kunai1,kunai2,virus,dangan,none|}", "${10|relative,absolute|}", ${11:6})',
        doc: '全方位リング弾を生成します。\n\n**引数**:\n1. `bulletType`: 弾種 (`"normal"`, `"trail"`, `"laser"`)\n2. `color`: 弾色 (例: `"#ff3344"`)\n3. `speed`: 弾速 (例: `170`)\n4. `angle`: 発射角度 (例: `angle`, `angle + 15`)\n5. `count`: 弾数 (例: `16`)\n6. `offsetX`: Xオフセット (`0`)\n7. `offsetY`: Yオフセット (`0`)\n8. `radius`: 描画サイズ (`20`)\n9. `bulletImage`: 弾画像 (`"ohuda"`, `"kome"`, `"star"` 等)\n10. `coordMode`: 座標系 (`"relative"`, `"absolute"`)\n11. `hitRadius`: 当たり判定半径 (`6`)',
        params: ['bulletType', 'color', 'speed', 'angle', 'count', 'offsetX', 'offsetY', 'radius', 'bulletImage', 'coordMode', 'hitRadius']
    },
    {
        name: 'spawnWay',
        snippet: 'spawnWay("${1:normal}", "${2:#ff3344}", ${3:180}, ${4:angle}, ${5:3}, ${6:30}, ${7:0}, ${8:0}, ${9:20}, "${10|ohuda,kome,star,b_star,onmyoutama,marutama,ootama,poihuru,uroko,sword,knife,kunai1,kunai2,virus,dangan,none|}", "${11|relative,absolute|}", ${12:6})',
        doc: '扇状（Way）に弾を生成します。\n\n**引数**:\n1. `bulletType`\n2. `color`\n3. `speed`\n4. `angle`\n5. `count` (Way数)\n6. `spread` (拡散角度幅)\n7. `offsetX`\n8. `offsetY`\n9. `radius`\n10. `bulletImage`\n11. `coordMode`\n12. `hitRadius`',
        params: ['bulletType', 'color', 'speed', 'angle', 'count', 'spread', 'offsetX', 'offsetY', 'radius', 'bulletImage', 'coordMode', 'hitRadius']
    },
    {
        name: 'spawnStraight',
        snippet: 'spawnStraight("${1:normal}", "${2:#ff3344}", ${3:200}, ${4:angle}, ${5:0}, ${6:0}, ${7:20}, "${8|ohuda,kome,star,b_star,onmyoutama,marutama,ootama,poihuru,uroko,sword,knife,kunai1,kunai2,virus,dangan,none|}", "${9|relative,absolute|}", ${10:6})',
        doc: '単発の直線弾を生成します。\n\n**引数**: (bulletType, color, speed, angle, offsetX, offsetY, radius, bulletImage, coordMode, hitRadius)',
        params: ['bulletType', 'color', 'speed', 'angle', 'offsetX', 'offsetY', 'radius', 'bulletImage', 'coordMode', 'hitRadius']
    },
    {
        name: 'spawnTrail',
        snippet: 'spawnTrail("${1:#00ffff}", ${2:200}, ${3:angle}, ${4:0}, ${5:0}, ${6:8}, ${7:0.2}, ${8:0.3}, ${9:0.5}, ${10:true}, "${11|relative,absolute|}", ${12:6})',
        doc: '光の尾を引くトレイル弾を生成します。',
        params: ['color', 'speed', 'angle', 'offsetX', 'offsetY', 'radius', 'growTime', 'keepTime', 'shrinkTime', 'round', 'coordMode', 'hitRadius']
    },
    {
        name: 'spawnBeam',
        snippet: 'spawnBeam(${1:1.0}, ${2:1.5}, ${3:12}, ${4:angle}, ${5:0}, ${6:0}, "${7|relative,absolute|}", ${8:8})',
        doc: '予告線付きの極太ビーム（レーザー）を生成します。',
        params: ['warningTime', 'activeTime', 'laserWidth', 'angle', 'offsetX', 'offsetY', 'coordMode', 'hitRadius']
    },
    {
        name: 'spawnLaserWay',
        snippet: 'spawnLaserWay("${1:#ff3333}", ${2:6}, ${3:200}, ${4:angle}, ${5:3}, ${6:45}, ${7:0}, ${8:0}, ${9:0.2}, ${10:0.3}, ${11:0.5}, ${12:true}, "${13|relative,absolute|}", ${14:6})',
        doc: '扇状に伸びるレーザー弾を生成します。',
        params: ['color', 'radius', 'speed', 'angle', 'count', 'spread', 'offsetX', 'offsetY', 'growTime', 'keepTime', 'shrinkTime', 'round', 'coordMode', 'hitRadius']
    },
    {
        name: 'spawnLaserRing',
        snippet: 'spawnLaserRing("${1:#ff3333}", ${2:6}, ${3:200}, ${4:angle}, ${5:12}, ${6:0}, ${7:0}, ${8:0.2}, ${9:0.3}, ${10:0.5}, ${11:true}, "${12|relative,absolute|}", ${13:6})',
        doc: '全方位に伸びるリングレーザーを生成します。',
        params: ['color', 'radius', 'speed', 'angle', 'count', 'offsetX', 'offsetY', 'growTime', 'keepTime', 'shrinkTime', 'round', 'coordMode', 'hitRadius']
    },
    {
        name: 'spawnMagicCircle',
        snippet: 'spawnMagicCircle("${1:#ff00ff}", ${2:30}, ${3:3.0}, ${4:0}, ${5:0}, "${6|relative,absolute|}")',
        doc: '独自スクリプトを実行する魔法陣（ビット/子機）を配置します。',
        params: ['color', 'radius', 'duration', 'offsetX', 'offsetY', 'coordMode']
    },
    {
        name: 'aimAtTarget',
        snippet: 'aimAtTarget()',
        doc: '自機の方向へ発射角度（angle）を自動計算・設定します。',
        params: []
    },
    {
        name: 'aimAt',
        snippet: 'aimAt(${1:targetX}, ${2:targetY})',
        doc: '指定した座標へ向けて発射角度（angle）を設定します。',
        params: ['targetX', 'targetY']
    },
    {
        name: 'moveTo',
        snippet: 'moveTo(${1:0}, ${2:0})',
        doc: '発射元（ボス等）を指定の座標へ即座に移動させます。',
        params: ['x', 'y']
    },
    {
        name: 'slideTo',
        snippet: 'slideTo(${1:0}, ${2:0}, ${3:1.0})',
        doc: '発射元（ボス等）を指定の座標へ指定秒数かけて移動させます。',
        params: ['x', 'y', 'duration']
    },
    {
        name: 'wait',
        snippet: 'wait(${1:0.2})',
        doc: '指定秒数だけ処理を待機します。',
        params: ['seconds']
    },
    {
        name: 'repeat',
        snippet: 'repeat(${1:10}) {\n    $0\n}',
        doc: '指定した回数だけ処理を繰り返します。',
        params: ['count']
    },
    {
        name: 'playSound',
        snippet: 'playSound("${1|shot,tan00,kira00,cat00,damage00,damage01,cardget,fault,pldead00,timeout|}")',
        doc: '指定した効果音（SE）を再生します。',
        params: ['soundName']
    },
    {
        name: 'tween',
        snippet: 'tween("${1|angle,speed,x_offset,y_offset,radius,scale|}", ${2:0}, ${3:360}, "${4|seconds,frames,step,vecstep|}\", ${5:1.0}, \"${6|linear,easeIn,easeOut,easeInOut|}\")',
        doc: '指定した変数を時間をかけて滑らかに変化させます。',
        params: ['varName', 'fromVal', 'toVal', 'mode', 'duration', 'easing']
    },
    {
        name: 'slow',
        snippet: 'slow(${1:0.5}, ${2:0})',
        doc: '弾速を減速させます。',
        params: ['effect', 'delay']
    },
    {
        name: 'fast',
        snippet: 'fast(${1:2.0}, ${2:0})',
        doc: '弾速を加速させます。',
        params: ['effect', 'delay']
    },
    {
        name: 'bounce',
        snippet: 'bounce()',
        doc: '弾が画面端に触れた際に跳ね返るように設定します。',
        params: []
    },
    {
        name: 'homing',
        snippet: 'homing(${1:3.0})',
        doc: '弾が自機を追尾するホーミング弾になります。',
        params: ['turnSpeed']
    },
    {
        name: 'rand',
        snippet: 'rand(${1:-15}, ${2:15})',
        doc: 'ランダムな数値を返します。',
        params: ['min', 'max']
    }
];

function activate(context) {
    // 1. Completion Provider
    const completionProvider = vscode.languages.registerCompletionItemProvider(
        ['javascript', 'javascriptreact', 'typescript'],
        {
            provideCompletionItems(document, position) {
                const linePrefix = document.lineAt(position).text.substr(0, position.character);
                const lineFull = document.lineAt(position).text;
                
                // Determine if we are inside a function call
                const matchFunc = linePrefix.match(/(\b\w+)\s*\(([^)]*)$/);
                if (matchFunc) {
                    const funcName = matchFunc[1];
                    const argsPart = matchFunc[2];
                    
                    // Count commas outside of quotes to know argument index
                    let inQuotes = false;
                    let quoteChar = '';
                    let argIndex = 0;
                    for (let i = 0; i < argsPart.length; i++) {
                        let c = argsPart[i];
                        if (c === '"' || c === "'") {
                            if (!inQuotes) { inQuotes = true; quoteChar = c; }
                            else if (quoteChar === c) { inQuotes = false; }
                        } else if (c === ',' && !inQuotes) {
                            argIndex++;
                        }
                    }

                    // Context: bulletImage argument
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

                    // Context: coordMode argument
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

                    // Context: bulletType argument
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

                    // Context: playSound argument
                    if (funcName === 'playSound' && argIndex === 0) {
                        return SOUND_EFFECTS.map((se, idx) => {
                            const item = new vscode.CompletionItem(se.label, vscode.CompletionItemKind.Value);
                            item.detail = `効果音 (SE): ${se.desc}`;
                            item.insertText = inQuotes ? se.label : `"${se.label}"`;
                            item.sortText = String(idx).padStart(3, '0');
                            return item;
                        });
                    }
                }

                // Default: Suggest all DSL functions and helpers
                const items = [];
                for (const fn of DSL_FUNCTIONS) {
                    const item = new vscode.CompletionItem(fn.name, vscode.CompletionItemKind.Function);
                    item.detail = `弾幕DSL: ${fn.name}`;
                    item.documentation = new vscode.MarkdownString(fn.doc);
                    item.insertText = new vscode.SnippetString(fn.snippet);
                    items.push(item);
                }

                // Add bullet images as reference
                for (const img of BULLET_IMAGES) {
                    const item = new vscode.CompletionItem(img.label, vscode.CompletionItemKind.EnumMember);
                    item.detail = `弾画像: ${img.desc}`;
                    item.insertText = img.insertText;
                    items.push(item);
                }

                return items;
            }
        },
        '(', ',', '"', "'", '`', ' ', ''
    );

    // 2. Signature Help Provider
    const signatureProvider = vscode.languages.registerSignatureHelpProvider(
        ['javascript', 'javascriptreact', 'typescript'],
        {
            provideSignatureHelp(document, position) {
                const linePrefix = document.lineAt(position).text.substr(0, position.character);
                const matchFunc = linePrefix.match(/(\b\w+)\s*\(([^)]*)$/);
                if (!matchFunc) return null;

                const funcName = matchFunc[1];
                const argsPart = matchFunc[2];
                const fnInfo = DSL_FUNCTIONS.find(f => f.name === funcName);
                if (!fnInfo) return null;

                // Count active parameter
                let inQuotes = false;
                let quoteChar = '';
                let activeParam = 0;
                for (let i = 0; i < argsPart.length; i++) {
                    let c = argsPart[i];
                    if (c === '"' || c === "'") {
                        if (!inQuotes) { inQuotes = true; quoteChar = c; }
                        else if (quoteChar === c) inQuotes = false;
                    } else if (c === ',' && !inQuotes) {
                        activeParam++;
                    }
                }

                const sigHelp = new vscode.SignatureHelp();
                const sig = new vscode.SignatureInformation(
                    `${fnInfo.name}(${fnInfo.params.join(', ')})`,
                    new vscode.MarkdownString(fnInfo.doc)
                );
                sig.parameters = fnInfo.params.map(p => new vscode.ParameterInformation(p));
                sigHelp.signatures = [sig];
                sigHelp.activeSignature = 0;
                sigHelp.activeParameter = Math.min(activeParam, fnInfo.params.length - 1);
                return sigHelp;
            }
        },
        '(', ','
    );

    // 3. Auto Trigger Suggestion on Cursor Movement (Zero-Typing Popup!)
    let suggestDebounceTimer = null;
    const selectionChangeDisposable = vscode.window.onDidChangeTextEditorSelection((e) => {
        if (!e.textEditor || !e.selections || e.selections.length === 0) return;
        const selection = e.selections[0];
        if (!selection.isEmpty) return;

        const doc = e.textEditor.document;
        if (!['javascript', 'javascriptreact', 'typescript'].includes(doc.languageId)) return;

        const pos = selection.active;
        const lineText = doc.lineAt(pos.line).text;
        const prefix = lineText.substring(0, pos.character);

        // Check if cursor is inside function call or quotes
        const matchFunc = prefix.match(/(\b\w+)\s*\(([^)]*)$/);
        if (matchFunc) {
            clearTimeout(suggestDebounceTimer);
            suggestDebounceTimer = setTimeout(() => {
                vscode.commands.executeCommand('editor.action.triggerSuggest');
            }, 60);
        }
    });

    context.subscriptions.push(completionProvider, signatureProvider, selectionChangeDisposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
