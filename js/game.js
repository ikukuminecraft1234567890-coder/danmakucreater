// 数学用ヘルパー関数群（度数法対応）をグローバルに展開
window.sin = function(deg) { return Math.sin((Number(deg) || 0) * Math.PI / 180); };
window.cos = function(deg) { return Math.cos((Number(deg) || 0) * Math.PI / 180); };
window.tan = function(deg) { return Math.tan((Number(deg) || 0) * Math.PI / 180); };
window.atan2 = function(y, x) { return Math.atan2(Number(y) || 0, Number(x) || 0) * 180 / Math.PI; };
window.sqrt = Math.sqrt;
window.abs = Math.abs;
window.min = Math.min;
window.max = Math.max;
window.PI = Math.PI;
window.PI2 = Math.PI * 2;
window.pow = Math.pow;
window.log = Math.log;
window.exp = Math.exp;
window.floor = Math.floor;
window.round = Math.round;
window.ceil = Math.ceil;

function applyAbilityEffect(cardId, owner) {
            let user = owner === 'PLAYER' ? player : cpu;
            let target = owner === 'PLAYER' ? cpu : player;

            let cardData = defaultCards.ability.find(c => c.id === cardId);
            if (!cardData) return;

            if (!user.usedAbilities) user.usedAbilities = [];
            user.usedAbilities.push(cardId);

            let effectMsg = "";
            let color = "#ffcc00";

            switch (cardId) {
                case 'ab1': // 【急】霊力充填
                    user.bombs = Math.min(user.maxBombs, user.bombs + 1);
                    effectMsg = `${owner === 'PLAYER' ? 'あなた' : '相手'}の【霊力充填】：ボムが1つ回復！`;
                    break;
                case 'ab2': // 【急】生命息吹
                    let heal = 200;
                    user.hp = Math.min(user.maxHp || 1000, user.hp + heal);
                    effectMsg = `${owner === 'PLAYER' ? 'あなた' : '相手'}の【生命息吹】：HPが${heal}回復！`;
                    color = "#aaffaa";
                    break;
                case 'ab3': // 【急】精神統一
                    user.ab3Shield = true;
                    effectMsg = `${owner === 'PLAYER' ? 'あなた' : '相手'}の【精神統一】：被弾半減結界を展開！`;
                    color = "#aae0ff";
                    break;
                case 'ab4': // 【急】波状爆撃
                    let dmg = 60;
                    target.hp = Math.max(0, target.hp - dmg);
                    effectMsg = `${owner === 'PLAYER' ? 'あなた' : '相手'}の【波状爆撃】：相手に${dmg}の直接打撃！`;
                    color = "#ff8888";
                    checkDeath(); // 撃破判定
                    break;
                case 'ab5': // 【急】瞬間結界
                    user.isInvincible = true;
                    user.invincibleTimer = 1.5;
                    effectMsg = `${owner === 'PLAYER' ? 'あなた' : '相手'}の【瞬間結界】：1.5秒間の完全無敵！`;
                    color = "#ffffff";
                    break;
                case 'ab6': // 【急】霊力還元
                    user.grazeCount = (user.grazeCount || 0) + 150;
                    user.hp = Math.min(1000, user.hp + 50);
                    effectMsg = `${owner === 'PLAYER' ? 'あなた' : '相手'}の【霊力還元】：グレイズ+150 ＆ HP+50！`;
                    color = "#ffffcc";
                    break;
            }

            // バトルエフェクトのフワッとした発動表示
            addBattleEffect(effectMsg, color);
        }

        function isCustomActiveCardId(cardId) {
            if (!cardId || String(cardId).startsWith('ab')) return false;
            const card = defaultCards.active.find(c => c.id === cardId);
            return !!(card && card.isCustom);
        }

        function filterCustomCompatibleCastIds(cardIds) {
            const ids = (cardIds || []).filter(Boolean);
            const hasCustom = ids.some(id => isCustomActiveCardId(id));
            if (!hasCustom) return ids;
            return ids.filter(id => String(id).startsWith('ab') || isCustomActiveCardId(id));
        }

        function castSelectedSpells() {
            if (selectedPlayerCards.length === 0) return;
            // インデックスが大きい方から順に取り除いてバグを防ぐ
            selectedPlayerCards.sort((a, b) => b - a);
            const selectedEntries = selectedPlayerCards.map(i => ({ index: i, id: player.hand[i] })).filter(e => e.id);
            let cardIds = filterCustomCompatibleCastIds(selectedEntries.map(e => e.id));
            selectedEntries
                .filter(e => cardIds.includes(e.id))
                .sort((a, b) => b.index - a.index)
                .forEach(e => player.hand.splice(e.index, 1));
            selectedPlayerCards = [];

            

            let abilityIds = cardIds.filter(id => id && id.startsWith('ab'));
            let activeIds = cardIds.filter(id => id && !id.startsWith('ab'));

            if (abilityIds.length > 0) {
                // アビリティの効果を即時適用
                abilityIds.forEach(id => {
                    applyAbilityEffect(id, 'PLAYER');
                });
            }

            // 減った手札枠をアビリティカードで即座に補充
            fillHandAbilities('PLAYER');
            renderHand();

            if (activeIds.length > 0) {
                startActionPhase(activeIds);
            } else {
                // アビリティのみの場合は即座に精算フェーズ（タイマーを極小の0.8秒にしてテンポ良く）に移行し、相手にターンを渡す
                changePhase('RESOLUTION', 'PLAYER');
                resolutionTimer = 0.8;
            }
        }

        function selectPlayerCard(idx) {
            let neededCount = turnCount >= 7 ? 2 : 1;
            neededCount = Math.min(neededCount, player.hand.length);
            const cardId = player.hand[idx];
            const isAbility = cardId && String(cardId).startsWith('ab');
            const isCustom = isCustomActiveCardId(cardId);
            let alreadyIdx = selectedPlayerCards.indexOf(idx);
            if (alreadyIdx !== -1) {
                // 選択解除
                selectedPlayerCards.splice(alreadyIdx, 1);
            } else {
                if (isCustom) {
                    selectedPlayerCards = selectedPlayerCards.filter(i => {
                        const id = player.hand[i];
                        return id && String(id).startsWith('ab');
                    });
                } else if (!isAbility) {
                    selectedPlayerCards = selectedPlayerCards.filter(i => !isCustomActiveCardId(player.hand[i]));
                }
                // 選択追加（Wave 7以降は最大2枚、それ以外は最大1枚）
                if (selectedPlayerCards.length < neededCount) {
                    selectedPlayerCards.push(idx);
                } else if (neededCount === 1) {
                    // 1枚制限の時に別のカードを選んだら、自動で前回の選択を上書きトグルする親切設計
                    selectedPlayerCards = [idx];
                }
            }
            renderHand();
        }

        function renderHand() {
            // 古い決定ボタンがあれば確実に削除
            const oldBtn = document.querySelector('.cast-btn');
            if (oldBtn) oldBtn.remove();

            handContainer.innerHTML = '';

            // 6ターンごとの一括カードリセットにするため、ここでの自動即時リロードは行いません。
            if (player.hand.length === 0) {
                const msg = document.createElement('div');
                msg.textContent = "手札がありません！次のリロード（6ターンごと）を待つか、ボムを使用してください。";
                msg.style.color = "#ff5555"; msg.style.marginBottom = "10px"; msg.style.fontSize = "13px";
                handContainer.appendChild(msg);
            }

            // カード要素を配置するコンテナ
            const cardsWrapper = document.createElement('div');
            cardsWrapper.style.display = 'flex';
            cardsWrapper.style.justifyContent = 'center';
            cardsWrapper.style.gap = '10px';
            cardsWrapper.style.flexWrap = 'wrap';

            // focusedCardIndex の調整（手札が減った場合のバグ防止）
            if (focusedCardIndex >= player.hand.length) {
                focusedCardIndex = Math.max(0, player.hand.length - 1);
            }

            player.hand.forEach((cardId, idx) => {
                const cardData = defaultCards.active.find(c => c.id === cardId) || defaultCards.ability.find(c => c.id === cardId);
                if (!cardData) return;

                const cardEl = document.createElement('div');
                const isSelected = selectedPlayerCards.includes(idx);
                const isFocused = (idx === focusedCardIndex);

                let classes = ['hand-card'];
                if (isSelected) classes.push('selected-card');
                if (isFocused) classes.push('focused-card');
                cardEl.className = classes.join(' ');

                let isAbility = cardId.startsWith('ab');
                if (isAbility) {
                    cardEl.style.border = '2px solid #ffcc00';
                    cardEl.style.boxShadow = isSelected ? '0 0 15px rgba(255,204,0,0.9)' : '0 0 8px rgba(255,204,0,0.5)';
                    cardEl.style.background = 'linear-gradient(135deg, #2a2200 0%, #110e00 100%)';
                }

                // キー名
                let shortcutKey = idx + 1;
                if (idx === 0 && keyConfig.card1 !== '1') shortcutKey = keyConfig.card1;
                if (idx === 1 && keyConfig.card2 !== '2') shortcutKey = keyConfig.card2;
                if (idx === 2 && keyConfig.card3 !== '3') shortcutKey = keyConfig.card3;
                if (idx === 3 && keyConfig.card4 !== '4') shortcutKey = keyConfig.card4;
                if (idx === 4 && keyConfig.card5 !== '5') shortcutKey = keyConfig.card5;
                if (idx === 5 && keyConfig.card6 !== '6') shortcutKey = keyConfig.card6;
                if (shortcutKey === ' ') shortcutKey = 'Space';

                if (isAbility) {
                    let descText = cardData.desc ? cardData.desc.replace('【即時アビリティ】', '') : '';
                    cardEl.innerHTML = `
                        <div class="card-shortcut" style="background:#ffcc00; color:#000;">${shortcutKey}</div>
                        <div class="card-name" style="color:#ffcc00; font-size:12px; margin-top:4px;">${cardData.name.replace('【急】', '')}</div>
                        <div class="card-desc" style="font-size:8.5px; color:#ffdd88; line-height:1.25; padding:4px 2px; text-align:center; flex-grow:1; display:flex; align-items:center; justify-content:center; word-break:break-all;">${descText}</div>
                        <div class="card-stats" style="font-size:9px; color:#ffcc00; border-top:1px solid rgba(255,204,0,0.2); padding-top:4px;">即時アビリティ</div>
                    `;
                } else {
                    let descText = cardData.desc ? cardData.desc.replace('【移植スペル】', '').replace('【靈刻門】', '').replace('【新スペル】', '').replace('【博麗霊夢】', '').replace('【霧雨魔理沙】', '').replace('【レミリア】', '') : '';
                    cardEl.innerHTML = `
                        <div class="card-shortcut">${shortcutKey}</div>
                        <div class="card-name" style="font-size:12px; margin-top:4px;">${cardData.name.replace('【A】', '')}</div>
                        <div class="card-desc" style="font-size:8.5px; color:#ccc; line-height:1.25; padding:4px 2px; text-align:center; flex-grow:1; display:flex; align-items:center; justify-content:center; word-break:break-all;">${descText}</div>
                        <div class="card-stats" style="font-size:9px; padding-top:4px;">時間 ${cardData.duration}s<br>間隔 ${cardData.interval}s</div>
                    `;
                }

                cardEl.onclick = () => {
                    focusedCardIndex = idx;
                    selectPlayerCard(idx);
                };

                cardsWrapper.appendChild(cardEl);
            });
            handContainer.appendChild(cardsWrapper);

            // 選択要件（T7以上なら2枚、それ以外なら1枚）を満たしているときのみ、決定ボタンを phaseMessage にふわっと表示
            let neededCount = turnCount >= 7 ? 2 : 1;
            neededCount = Math.min(neededCount, player.hand.length);
            if (selectedPlayerCards.length === neededCount) {
                const btnEl = document.createElement('button');
                btnEl.className = 'cast-btn';

                let castKeyName = keyConfig.castSpell === ' ' ? 'Space' : keyConfig.castSpell;
                btnEl.innerHTML = `弾幕展開！ <span style="font-size:11px;color:#88ffdd;">[${castKeyName} / Enter / GP(Y)]</span>`;
                btnEl.onclick = () => {
                    castSelectedSpells();
                };
                const phaseMessage = document.getElementById('phaseMessage');
                if (phaseMessage) {
                    phaseMessage.appendChild(btnEl);
                }
            }
        }

        function startActionPhase(cardIds) {
            let ids = filterCustomCompatibleCastIds(Array.isArray(cardIds) ? cardIds : [cardIds]);
            let attacker = turnOwner === 'PLAYER' ? player : cpu;
            let target = turnOwner === 'PLAYER' ? cpu : player;
            let selectedCards = ids.map(id => {
                let found = defaultCards.active.find(c => c.id === id);
                if (found) {
                    let copy = { ...found, spawnTimer: found.interval };
                    return copy;
                }
                return null;
            }).filter(Boolean);

            if (selectedCards.length === 0) return;
            if (selectedCards.some(c => c.isCustom)) {
                setCustomOwnerPosition(turnOwner, 'center', 0);
                attacker = turnOwner === 'PLAYER' ? player : cpu;
                target = turnOwner === 'PLAYER' ? cpu : player;
            }

            selectedCards.forEach(copy => {
                if (copy.isCustom) {
                    copy.emitterState = initEmitterState(copy.emitterScript, attacker, target, copy.x_offset || 0, copy.y_offset || 0);
                }
            });

            activeCards = selectedCards;
            if (activeCards.length === 0) return;
            actionTimer = Math.max(...activeCards.map(c => c.duration));
            window.currentCardSecond = 0;
            window.currentCardFrame = 0;
            normalShotTimer = 0;
            changePhase('ACTION', turnOwner);
        }

        // 弾幕パターンジェネレータ (靈刻門から3つのスペルを追加インポート)
        const CardLogic = {
            'starbow': (attacker, target) => {
                // 星弓「スターボウ」
                let dx = target.x - attacker.x;
                let dy = target.y - attacker.y;
                let aimBase = Math.atan2(dy, dx);

                // ターン開始時に回転角度をリセットし、毎発0.42ラジアンずつスピン加速（通常比3倍速）
                if (actionTimer > 14.8) {
                    attacker.starbowAngle = 0;
                }
                attacker.starbowAngle = (attacker.starbowAngle || 0) + 0.42;

                let aim = aimBase + attacker.starbowAngle;
                let speed = 230;
                let res = [];
                let ways = 8;
                let bCurve = 1.85; // 3x accelerated curve rate (originally 0.95)
                for (let i = 0; i < ways; i++) {
                    let angle = aim + (Math.PI * 2 / ways) * i;
                    res.push({
                        x: attacker.x,
                        y: attacker.y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        radius: 8.5,
                        team: attacker.team,
                        color: 'hsl(' + ((i * 72 + (attacker.timer || 0) * 100) % 360) + ', 100%, 65%)', // beautiful rainbow arrow!
                        curve: bCurve,
                        trailTimer: 0,
                        lifeTimer: 0,
                        update: (b, dt) => {
                            b.lifeTimer += dt;
                            // 1. Curve logic (accelerated 3x decay to match curve speed)
                            if (b.curve > 0) {
                                b.curve -= 1.05 * dt;
                                if (b.curve < 0) b.curve = 0;
                            }
                            let currentAngle = Math.atan2(b.vy, b.vx);
                            let newAngle = currentAngle + b.curve * dt;
                            let speedVal = Math.hypot(b.vx, b.vy);
                            b.vx = Math.cos(newAngle) * speedVal;
                            b.vy = Math.sin(newAngle) * speedVal;

                            // Trail spawn removed for performance
                        }
                    });
                }
                return res;
            },
            'hellcurve': (attacker, target) => {
                // 獄符「ヘルカーブ」
                let dx = target.x - attacker.x;
                let dy = target.y - attacker.y;
                let aim = Math.atan2(dy, dx);
                let speed = 230;
                let res = [];
                let ways = 4;
                let baseCurve = 0.55;

                let actionCount = attacker.actionCount || 0;
                let offset = actionCount * 0.18;

                for (let i = 0; i < ways; i++) {
                    let angleRight = aim + (Math.PI * 2 / ways) * i + offset;
                    let angleLeft = aim - (Math.PI * 2 / ways) * i - offset;

                    // Red bullet curving right (clockwise)
                    res.push({
                        x: attacker.x,
                        y: attacker.y,
                        vx: Math.cos(angleRight) * speed,
                        vy: Math.sin(angleRight) * speed,
                        radius: 7.5,
                        team: attacker.team,
                        color: '#ff3333',
                        curve: baseCurve,
                        update: (b, dt) => {
                            let currentAngle = Math.atan2(b.vy, b.vx);
                            let newAngle = currentAngle + b.curve * dt;
                            let speedVal = Math.hypot(b.vx, b.vy);
                            b.vx = Math.cos(newAngle) * speedVal;
                            b.vy = Math.sin(newAngle) * speedVal;
                        }
                    });

                    // Yellow bullet curving left (counter-clockwise)
                    res.push({
                        x: attacker.x,
                        y: attacker.y,
                        vx: Math.cos(angleLeft) * speed,
                        vy: Math.sin(angleLeft) * speed,
                        radius: 7.5,
                        team: attacker.team,
                        color: '#ffdd33',
                        curve: -baseCurve,
                        update: (b, dt) => {
                            let currentAngle = Math.atan2(b.vy, b.vx);
                            let newAngle = currentAngle + b.curve * dt;
                            let speedVal = Math.hypot(b.vx, b.vy);
                            b.vx = Math.cos(newAngle) * speedVal;
                            b.vy = Math.sin(newAngle) * speedVal;
                        }
                    });
                }
                attacker.actionCount = (actionCount + 1) % 100;
                return res;
            },
            '3way': (attacker, target) => {
                let dx = target.x - attacker.x;
                let dy = target.y - attacker.y;
                let baseAngle = Math.atan2(dy, dx);
                let speed = 380; let res = [];
                for (let i = -1; i <= 1; i++) {
                    let angle = baseAngle + i * 0.15;
                    res.push({ x: attacker.x, y: attacker.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, radius: 8.5, team: attacker.team });
                }
                return res;
            },
            'place': (attacker, target) => {
                let dir = attacker.team === 'CPU' ? 1 : -1;
                let res = [];
                for (let i = 0; i < 3; i++) {
                    res.push({
                        x: Math.max(15, Math.min(PLAY_WIDTH - 15, attacker.x + (Math.random() - 0.5) * 300)),
                        y: attacker.y + dir * (40 + Math.random() * 100),
                        vx: (Math.random() - 0.5) * 15,
                        vy: dir * 25, // 最初は極めてゆっくり浮遊
                        radius: 35,
                        hitRadius: 16,
                        team: attacker.team,
                        color: 'rgba(150, 50, 255, 0.3)',
                        isSweeper: true,
                        lifeTimer: 0,
                        update: (b, dt) => {
                            b.lifeTimer += dt;
                            // 0.5秒経過したあたりから、徐々に加速を開始する
                            if (b.lifeTimer >= 0.5) {
                                let accel = 320; // 毎秒320px/sの加速
                                b.vy += dir * accel * dt;
                                b.vx += (b.vx >= 0 ? 1 : -1) * 20 * dt;
                            }
                        }
                    });
                }
                return res;
            },
            'dense': (attacker, target) => {
                let dir = attacker.team === 'CPU' ? 1 : -1;
                let baseAngle = dir === 1 ? Math.PI / 2 : -Math.PI / 2;
                let speed = 270;
                let res = [];
                for (let i = -2; i <= 2; i++) {
                    let angle = baseAngle + i * 0.15;
                    res.push({ x: attacker.x, y: attacker.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, radius: 6, team: attacker.team });
                }
                return res;
            },
            'evolution': (attacker, target) => {
                // 進符「エボリューション・ブラスト」の移植・カスタム版
                // 直進する親弾を放ち、親弾が一定時間ごとに左右に子弾を分裂させる
                let dir = attacker.team === 'CPU' ? 1 : -1;
                let speed = 220;
                let pAngle = dir === 1 ? Math.PI / 2 : -Math.PI / 2;

                // 親弾の生成
                let parentBullet = {
                    x: attacker.x,
                    y: attacker.y,
                    vx: Math.cos(pAngle) * speed,
                    vy: Math.sin(pAngle) * speed,
                    radius: 12,
                    team: attacker.team,
                    color: '#ffcc00', // 親弾は金色
                    customDmg: 30,
                    splitTimer: 0,
                    update: (b, dt) => {
                        b.splitTimer += dt;
                        if (b.splitTimer >= 0.22) {
                            b.splitTimer = 0;
                            // 左右へ子弾を分裂
                            let leftAngle = Math.atan2(b.vy, b.vx) + Math.PI / 2;
                            let rightAngle = Math.atan2(b.vy, b.vx) - Math.PI / 2;
                            let childSpeed = 160;
                            bullets.push(
                                { x: b.x, y: b.y, vx: Math.cos(leftAngle) * childSpeed, vy: Math.sin(leftAngle) * childSpeed, radius: 5.5, team: b.team, color: '#ff55aa', customDmg: 15 },
                                { x: b.x, y: b.y, vx: Math.cos(rightAngle) * childSpeed, vy: Math.sin(rightAngle) * childSpeed, radius: 5.5, team: b.team, color: '#ff55aa', customDmg: 15 }
                            );
                        }
                    }
                };
                return [parentBullet];
            },
            'vanishing': (attacker, target) => {
                // 滅符「消える魔球」の移植・カスタム版
                // 最初は全方位に弾を放ち、途中で完全静止した後、少し精度の悪い（バラつきのある）自機狙いになって再追尾・急加速！
                let ways = 8; // 全方位8方向
                let initSpeed = 200;
                let res = [];

                for (let i = 0; i < ways; i++) {
                    let angle = (Math.PI * 2 / ways) * i;
                    res.push({
                        x: attacker.x,
                        y: attacker.y,
                        vx: Math.cos(angle) * initSpeed,
                        vy: Math.sin(angle) * initSpeed,
                        radius: 8.5,
                        team: attacker.team,
                        color: '#00ffff', // 最初は青緑
                        lifeTimer: 0,
                        state: 0, // 0: 進む, 1: 停止中, 2: 再加速
                        update: (b, dt) => {
                            b.lifeTimer += dt;
                            if (b.state === 0 && b.lifeTimer >= 0.5) {
                                // 停止状態へ
                                b.state = 1;
                                b.vx = 0;
                                b.vy = 0;
                                b.color = '#aa00ff'; // 停止中は紫色
                            } else if (b.state === 1 && b.lifeTimer >= 1.1) {
                                // 再加速！ちょっと精度の悪い自機狙い
                                b.state = 2;
                                let currTarget = b.team === 'PLAYER' ? cpu : player;
                                let rDx = currTarget.x - b.x;
                                let rDy = currTarget.y - b.y;

                                // 自機狙い角度を計算し、少しバラつき（精度を落とす）を付与する
                                let baseAngle = Math.atan2(rDy, rDx);
                                let spreadAngle = baseAngle + (Math.random() - 0.5) * 0.38; // 少しブレを持たせる

                                let chaseSpeed = 480; // 高速で襲いかかる
                                b.vx = Math.cos(spreadAngle) * chaseSpeed;
                                b.vy = Math.sin(spreadAngle) * chaseSpeed;
                                b.color = '#ff0055'; // 急加速時は真っ赤に光る！
                            }
                        }
                    });
                }
                return res;
            },
            'spiral': (attacker, target) => {
                // 捻符「スパイラル・リバーサル」の移植・カスタム版
                // 回転全方位弾。時間の経過とともに回転角度が急激に逆回転する
                let dir = attacker.team === 'CPU' ? 1 : -1;
                let res = [];
                let speed = 250;

                // 現在のアクションタイマーの時間を使って回転角度を求める
                let rotateAngle = actionTimer * 8.5; // 回転速度
                let ways = 4; // 同時に4方向

                // 3秒経過するごとに回転方向を逆転する
                if (Math.floor(actionTimer / 3) % 2 === 0) {
                    rotateAngle = -rotateAngle;
                }

                for (let i = 0; i < ways; i++) {
                    let angle = rotateAngle + (Math.PI * 2 / ways) * i;
                    res.push({
                        x: attacker.x,
                        y: attacker.y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        radius: 6.5,
                        team: attacker.team,
                        color: 'hsl(' + (Math.floor(actionTimer * 60) % 360) + ', 100%, 70%)' // 虹色にきらめく
                    });
                }
                return res;
            },
            'charge_corner': (attacker, target) => {
                // 突符「チャージ曲がり角」の移植・回転高速化版 (15倍速・逆回転・長鎖対応)
                attacker.speed = 27; // マスパのさらに半分 (80 / 2) の 2/3
                attacker.slowSpeed = 10; // マスパのさらに半分 (30 / 2) の 2/3

                let res = [];
                let lines = 8; // 8 lines
                let bulletsPerLine = 8; // 8 bullets per line for perfect spacing
                
                // Rotation angle increment (reversed: subtraction instead of addition)
                attacker.chargeCornerAngle = (attacker.chargeCornerAngle || 0) - 0.16;
                let baseAngle = attacker.chargeCornerAngle;
                
                let minSpeed = 20; // 30 * 2/3
                let maxSpeed = 410; // 620 * 2/3
                let accelSpd = 120; // 180 * 2/3

                // Throttled charge sound
                if (typeof attacker.lastChargeCornerSound === 'undefined' || actionTimer - attacker.lastChargeCornerSound > 1.2) {
                    attacker.lastChargeCornerSound = actionTimer;
                    if (typeof playSound === 'function') {
                        playSound('charge');
                    }
                }

                // Define local functions to reuse for this invocation (captures current context)
                const ccChildUpdate = (cb, cdt) => {
                    cb.vx += cb.accelX * cdt;
                    cb.vy += cb.accelY * cdt;
                };

                const ccMainUpdate = (b, dt) => {
                    b.lifeTimer += dt;
                    if (b.state === 0) {
                        // Decelerate quickly but allow spreading out
                        b.vx *= 0.95;
                        b.vy *= 0.95;
                        if (b.lifeTimer >= 0.8) {
                            b.state = 1;
                            b.vx = 0;
                            b.vy = 0;
                            b.color = b.colorIndex % 2 === 0 ? '#ff3366' : '#33ffaa'; // alternating colors
                        }
                    } else if (b.state === 1) {
                        // Shrink slightly to indicate splitting
                        if (b.radius > 3) {
                            b.radius -= 12 * dt;
                        }
                        if (b.lifeTimer >= 1.1) {
                            b.state = 2;
                            
                            // Throttled kawaru sound
                            if (typeof playSound === 'function') {
                                let now = Date.now();
                                if (typeof attacker.lastKawaruTime === 'undefined' || now - attacker.lastKawaruTime > 120) {
                                    attacker.lastKawaruTime = now;
                                    playSound('kawaru');
                                }
                            }
                            
                            // Spawn two child bullets splitting perpendicular (90 degrees) to original trajectory
                            let splitAngle1 = b.initAngle + Math.PI / 2;
                            let splitAngle2 = b.initAngle - Math.PI / 2;
                            
                            let child1 = {
                                x: b.x,
                                y: b.y,
                                vx: Math.cos(splitAngle1) * 40, // 60 * 2/3
                                vy: Math.sin(splitAngle1) * 40, // 60 * 2/3
                                radius: 3.75, // half of 7.5
                                team: b.team,
                                color: b.color,
                                accelX: Math.cos(splitAngle1) * b.accelSpeed,
                                accelY: Math.sin(splitAngle1) * b.accelSpeed,
                                update: ccChildUpdate
                            };
                            
                            let child2 = {
                                x: b.x,
                                y: b.y,
                                vx: Math.cos(splitAngle2) * 40, // 60 * 2/3
                                vy: Math.sin(splitAngle2) * 40, // 60 * 2/3
                                radius: 3.75, // half of 7.5
                                team: b.team,
                                color: b.color,
                                accelX: Math.cos(splitAngle2) * b.accelSpeed,
                                accelY: Math.sin(splitAngle2) * b.accelSpeed,
                                update: ccChildUpdate
                            };
                            
                            bullets.push(child1, child2);
                            
                            b.x = -9999;
                            b.y = -9999;
                        }
                    }
                };

                for (let i = 0; i < lines; i++) {
                    let lineAngle = baseAngle + (Math.PI * 2 / lines) * i;
                    for (let j = 0; j < bulletsPerLine; j++) {
                        let angle = lineAngle + (Math.random() - 0.5) * 0.01;
                        let speed = minSpeed + (maxSpeed - minSpeed) * (j / (bulletsPerLine - 1));
                        
                        res.push({
                            x: attacker.x,
                            y: attacker.y,
                            vx: Math.cos(angle) * speed,
                            vy: Math.sin(angle) * speed,
                            radius: 7.5,
                            team: attacker.team,
                            color: '#ffffff', // white bullet
                            lifeTimer: 0,
                            state: 0, // 0: moving & decelerating, 1: stopped, 2: split
                            initAngle: angle,
                            accelSpeed: accelSpd,
                            colorIndex: i,
                            update: ccMainUpdate
                        });
                    }
                }
                
                // Throttled shot sound
                if (typeof playSound === 'function') {
                    let now = Date.now();
                    if (typeof attacker.lastCCShotTime === 'undefined' || now - attacker.lastCCShotTime > 150) {
                        attacker.lastCCShotTime = now;
                        playSound('shot');
                    }
                }
                
                return res;
            },
            'cross': (attacker, target) => {
                // 交符「クロスカーブ・レクイエム」
                // さらに後ろめで、大量の70発が一斉にばらけながら射出。
                let targetDx = target.x - attacker.x;
                let targetDy = target.y - attacker.y;
                let baseAngle = Math.atan2(targetDy, targetDx);

                let res = [];
                let totalBulletsPerSide = 35; // 左右35発ずつ（計70発の圧倒的弾幕！）

                for (let i = 0; i < totalBulletsPerSide; i++) {
                    // 速度に大きなランダムばらつき
                    let speed = 190 + Math.random() * 170;

                    // 完全に背後（基準角度から約150度＝ほぼ真後ろの極めてキツい角度）＋ 横方向へ超大拡散させる大きなばらつき (1.35ラジアン)
                    let leftAngle = (baseAngle - Math.PI * 0.83) + (Math.random() - 0.5) * 1.35;
                    res.push({
                        x: attacker.x,
                        y: attacker.y,
                        vx: Math.cos(leftAngle) * speed,
                        vy: Math.sin(leftAngle) * speed,
                        radius: 5.5,
                        team: attacker.team,
                        color: '#ff00aa', // 鮮やかなネオンピンク
                        lifeTimer: 0,
                        moveAngle: leftAngle,
                        speed: speed,
                        isLeft: true,
                        state: 0, // 0: ぶれ拡散後退, 1: 大外カーブ, 2: 軌道修正＆超加速突撃
                        update: (b, dt) => {
                            b.lifeTimer += dt;

                            // フェーズ0: ぶれながら後退（約0.48秒間）
                            if (b.state === 0) {
                                // 角度にランダムな微小ノイズを加え、激しく「ブルブル」と横揺れさせてばらけさせる
                                b.moveAngle += (Math.random() - 0.5) * 1.65 * dt;
                                if (b.lifeTimer >= 0.48) {
                                    b.state = 1;
                                }
                            }

                            // フェーズ1: 大外カーブ（0.48s 〜 1.08s の約0.6秒間）
                            if (b.state === 1) {
                                // 左側は時計回り（プラス）に固定の角速度（毎秒4.8ラジアン）で旋回
                                let angularSpeed = 4.8;
                                b.moveAngle += angularSpeed * dt;

                                if (b.lifeTimer >= 1.08) {
                                    b.state = 2;
                                    // 直進フェーズ突入時にターゲットの最新座標をロックオンして「軌道を完璧に修正＆収束」
                                    let currTarget = b.team === 'PLAYER' ? cpu : player;
                                    let rDx = currTarget.x - b.x;
                                    let rDy = currTarget.y - b.y;
                                    b.moveAngle = Math.atan2(rDy, rDx) + (Math.random() - 0.5) * 0.05; // 収束しつつ微小な余韻ブレ
                                }
                            }

                            // フェーズ2: 直進＆超々加速
                            if (b.state === 2) {
                                b.speed += 620 * dt; // 毎秒620pxの超急加速！
                            }

                            b.vx = Math.cos(b.moveAngle) * b.speed;
                            b.vy = Math.sin(b.moveAngle) * b.speed;
                        }
                    });

                    // 右側ストリーム：完全に背後（基準角度から約150度）＋ 横方向へ超大拡散させる大きなばらつき (1.35ラジアン)
                    let rightAngle = (baseAngle + Math.PI * 0.83) + (Math.random() - 0.5) * 1.35;
                    res.push({
                        x: attacker.x,
                        y: attacker.y,
                        vx: Math.cos(rightAngle) * speed,
                        vy: Math.sin(rightAngle) * speed,
                        radius: 5.5,
                        team: attacker.team,
                        color: '#00ffcc', // 鮮やかなネオンシアン
                        lifeTimer: 0,
                        moveAngle: rightAngle,
                        speed: speed,
                        isLeft: false,
                        state: 0,
                        update: (b, dt) => {
                            b.lifeTimer += dt;

                            if (b.state === 0) {
                                b.moveAngle += (Math.random() - 0.5) * 1.65 * dt;
                                if (b.lifeTimer >= 0.48) {
                                    b.state = 1;
                                }
                            }

                            if (b.state === 1) {
                                let angularSpeed = 4.8;
                                b.moveAngle -= angularSpeed * dt; // 右側は反時計回り

                                if (b.lifeTimer >= 1.08) {
                                    b.state = 2;
                                    let currTarget = b.team === 'PLAYER' ? cpu : player;
                                    let rDx = currTarget.x - b.x;
                                    let rDy = currTarget.y - b.y;
                                    b.moveAngle = Math.atan2(rDy, rDx) + (Math.random() - 0.5) * 0.05;
                                }
                            }

                            if (b.state === 2) {
                                b.speed += 620 * dt;
                            }

                            b.vx = Math.cos(b.moveAngle) * b.speed;
                            b.vy = Math.sin(b.moveAngle) * b.speed;
                        }
                    });
                }
                return res;
            },
            'overdrive': (attacker, target) => {
                // 「オーバードライブ」の移植・プレミアム版
                let res = [];
                res.push({
                    x: PLAY_WIDTH / 2,
                    y: canvas.height / 2,
                    vx: 0,
                    vy: 0,
                    radius: 0.1,
                    team: attacker.team,
                    color: 'transparent',
                    isNormal: false,
                    lifeTimer: 0,
                    phase: 0, // 0: charge, 1: dash, 2: mesh, 3: bounce burst
                    phaseTimer: 0,
                    shootTimer: 0,
                    placedBullets: [],
                    dashVx: 0,
                    dashVy: 0,
                    shootAngle: 0,
                    update: (b, dt) => {
                        b.lifeTimer += dt;
                        b.phaseTimer += dt;

                        if (b.lifeTimer >= 20.0) {
                            b.x = -9999;
                            b.y = -9999;
                            return;
                        }

                        // Keep controller bullet inside boundaries so it is never cleaned up
                        b.x = PLAY_WIDTH / 2;
                        b.y = canvas.height / 2;

                        // Phase 0: Charge (0s - 2.0s)
                        if (b.phase === 0) {
                            b.shootTimer -= dt;
                            if (b.shootTimer <= 0) {
                                b.shootTimer = 0.08;
                                if (typeof playSound === 'function') {
                                    playSound('charge');
                                }
                                let angle = Math.random() * Math.PI * 2;
                                let dist = 50 + Math.random() * 50;
                                let orbBullet = {
                                    x: attacker.x + Math.cos(angle) * dist,
                                    y: attacker.y + Math.sin(angle) * dist,
                                    vx: 0,
                                    vy: 0,
                                    radius: 6,
                                    team: b.team,
                                    color: '#ff3344',
                                    isOrbit: true,
                                    angle: angle,
                                    dist: dist,
                                    orbitSpeed: 3.5,
                                    update: (ob, odt) => {
                                        if (ob.isOrbit) {
                                            ob.angle += ob.orbitSpeed * odt;
                                            ob.x = attacker.x + Math.cos(ob.angle) * ob.dist;
                                            ob.y = attacker.y + Math.sin(ob.angle) * ob.dist;
                                        }
                                    }
                                };
                                bullets.push(orbBullet);
                                b.placedBullets.push(orbBullet);
                            }

                            if (b.phaseTimer >= 2.0) {
                                b.phase = 1;
                                b.phaseTimer = 0;
                                b.shootTimer = 0;
                                
                                if (typeof playSound === 'function') {
                                    playSound('bomb_explode');
                                }
                                let aimAngle = Math.atan2(target.y - attacker.y, target.x - attacker.x);
                                let dashSpeed = 550;
                                b.dashVx = Math.cos(aimAngle) * dashSpeed;
                                b.dashVy = Math.sin(aimAngle) * dashSpeed;

                                // Launch the charged bullets forward
                                for (let ob of b.placedBullets) {
                                    if (ob && bullets.includes(ob)) {
                                        ob.isOrbit = false;
                                        ob.update = null;
                                        let spread = Math.PI / 3;
                                        let obAngle = aimAngle + (Math.random() - 0.5) * spread;
                                        let obSpd = 200 + Math.random() * 250;
                                        ob.vx = Math.cos(obAngle) * obSpd;
                                        ob.vy = Math.sin(obAngle) * obSpd;
                                    }
                                }
                                b.placedBullets = [];
                            }
                        }
                        // Phase 1: Dash (2.0s - 5.0s)
                        else if (b.phase === 1) {
                            // Dash movement
                            attacker.x += b.dashVx * dt;
                            attacker.y += b.dashVy * dt;

                            // Keep caster within play area boundaries
                            let limitMinY = 15;
                            let limitMaxY = canvas.height - 15;
                            attacker.x = Math.max(15, Math.min(PLAY_WIDTH - 15, attacker.x));
                            attacker.y = Math.max(limitMinY, Math.min(limitMaxY, attacker.y));

                            b.shootTimer -= dt;
                            if (b.shootTimer <= 0) {
                                b.shootTimer = 0.06;
                                if (typeof playSound === 'function') {
                                    playSound('shot');
                                }
                                let ways = 3;
                                for (let i = 0; i < ways; i++) {
                                    let angle = Math.random() * Math.PI * 2;
                                    let speed = 90 + Math.random() * 120;
                                    bullets.push({
                                        x: attacker.x,
                                        y: attacker.y,
                                        vx: Math.cos(angle) * speed,
                                        vy: Math.sin(angle) * speed,
                                        radius: 5.5,
                                        team: b.team,
                                        color: '#ffaa00'
                                    });
                                }
                            }

                            if (b.phaseTimer >= 3.0) {
                                b.phase = 2;
                                b.phaseTimer = 0;
                                b.shootTimer = 0;
                                // Reset position
                                let startX = PLAY_WIDTH / 2;
                                let startY = b.team === 'PLAYER' ? canvas.height * 0.8 : canvas.height * 0.2;
                                attacker.x = startX;
                                attacker.y = startY;
                            }
                        }
                        // Phase 2: Mesh / Cross patterns (5.0s - 12.0s)
                        else if (b.phase === 2) {
                            b.shootTimer -= dt;
                            if (b.shootTimer <= 0) {
                                b.shootTimer = 0.12;
                                if (typeof playSound === 'function') {
                                    playSound('shot');
                                }
                                b.shootAngle += 0.08;

                                let ways = 4;
                                let speed = 160;

                                let spawnCircle = (cx, cy, ways, angle, speed, color) => {
                                    for (let i = 0; i < ways; i++) {
                                        let a = angle + (Math.PI * 2 / ways) * i;
                                        bullets.push({
                                            x: cx,
                                            y: cy,
                                            vx: Math.cos(a) * speed,
                                            vy: Math.sin(a) * speed,
                                            radius: 6,
                                            team: b.team,
                                            color: color
                                        });
                                    }
                                };

                                spawnCircle(attacker.x, attacker.y, ways, b.shootAngle, speed, '#00ffff');
                                spawnCircle(attacker.x, attacker.y, ways, -b.shootAngle, speed, '#3366ff');

                                // Extra side-spawners
                                let topY = b.team === 'PLAYER' ? canvas.height - 20 : 20;
                                spawnCircle(20, topY, 2, b.shootAngle * 0.5, speed * 0.8, '#00ffff');
                                spawnCircle(PLAY_WIDTH - 20, topY, 2, -b.shootAngle * 0.5, speed * 0.8, '#3366ff');
                            }

                            if (b.phaseTimer >= 7.0) {
                                b.phase = 3;
                                b.phaseTimer = 0;
                                b.shootTimer = 0;
                            }
                        }
                        // Phase 3: Bouncing Burst (12.0s - 20.0s)
                        else if (b.phase === 3) {
                            b.shootTimer -= dt;
                            if (b.shootTimer <= 0) {
                                b.shootTimer = 0.6;
                                if (typeof playSound === 'function') {
                                    playSound('shot');
                                }
                                let ways = 16;
                                let speed = 150;
                                let bx = attacker.x + (Math.random() - 0.5) * 80;
                                let by = attacker.y + (Math.random() - 0.5) * 80;

                                for (let i = 0; i < ways; i++) {
                                    let angle = (Math.PI * 2 / ways) * i;
                                    bullets.push({
                                        x: bx,
                                        y: by,
                                        vx: Math.cos(angle) * speed,
                                        vy: Math.sin(angle) * speed,
                                        radius: 6,
                                        team: b.team,
                                        color: '#ff33aa',
                                        reflectCount: 0,
                                        maxReflect: 1,
                                        update: (mb, mdt) => {
                                            let margin = mb.radius;
                                            let hitWall = false;
                                            
                                            if (mb.x < margin && mb.vx < 0) { mb.vx = -mb.vx; hitWall = true; }
                                            if (mb.x > PLAY_WIDTH - margin && mb.vx > 0) { mb.vx = -mb.vx; hitWall = true; }
                                            
                                            let minY = 0;
                                            let maxY = canvas.height;
                                            if (mb.y < minY + margin && mb.vy < 0) { mb.vy = -mb.vy; hitWall = true; }
                                            if (mb.y > maxY - margin && mb.vy > 0) { mb.vy = -mb.vy; hitWall = true; }

                                            if (hitWall) {
                                                mb.reflectCount++;
                                                if (mb.reflectCount > mb.maxReflect) {
                                                    mb.x = -9999;
                                                    mb.y = -9999;
                                                }
                                            }
                                        }
                                    });
                                }
                            }
                        }
                    }
                });
                return res;
            },
            'myouju': (attacker, target) => {
                let res = [];
                let ways = 25;
                let startRadius = 15;
                for (let i = 0; i < ways; i++) {
                    let initialAngle = (Math.PI * 2 / ways) * i;
                    res.push({
                        x: attacker.x + Math.cos(initialAngle) * startRadius,
                        y: attacker.y + Math.sin(initialAngle) * startRadius,
                        vx: 0,
                        vy: 0,
                        radius: 9,
                        team: attacker.team,
                        color: 'hsl(' + (i * (360 / ways)) + ', 100%, 70%)',
                        state: 0, // 0: 回転拡大, 1: 追尾
                        rotAngle: initialAngle,
                        distRadius: startRadius,
                        lifeTimer: 0,
                        update: (b, dt) => {
                            b.lifeTimer += dt;
                            b.color = 'hsl(' + ((b.rotAngle * 180 / Math.PI + b.lifeTimer * 200) % 360) + ', 100%, 70%)';

                            if (b.state === 0) {
                                b.rotAngle += 4.5 * dt;
                                b.distRadius = Math.min(80, b.distRadius + 75 * dt);
                                b.x = attacker.x + Math.cos(b.rotAngle) * b.distRadius;
                                b.y = attacker.y + Math.sin(b.rotAngle) * b.distRadius;

                                if (b.lifeTimer >= 0.8) {
                                    b.state = 1;
                                    let currTarget = b.team === 'PLAYER' ? cpu : player;
                                    let angle = Math.atan2(currTarget.y - b.y, currTarget.x - b.x);
                                    b.vx = Math.cos(angle) * 350;
                                    b.vy = Math.sin(angle) * 350;
                                }
                            } else {
                                // 🌟 15秒経過するか、壁に当たったら爆発して6分裂する！
                                let margin = 12;
                                let hitWall = false;
                                if (b.x < margin && b.vx < 0) hitWall = true;
                                if (b.x > PLAY_WIDTH - margin && b.vx > 0) hitWall = true;
                                if (b.y < margin && b.vy < 0) hitWall = true;
                                if (b.y > canvas.height - margin && b.vy > 0) hitWall = true;

                                if (b.lifeTimer >= 15.0 || hitWall) {
                                    // 爆発分裂！
                                    let splitWays = 18;
                                    let childSpeed = 260;
                                    for (let k = 0; k < splitWays; k++) {
                                        let splitAngle = (Math.PI * 2 / splitWays) * k + (Math.random() - 0.5) * 0.1;
                                        bullets.push({
                                            x: b.x,
                                            y: b.y,
                                            vx: Math.cos(splitAngle) * childSpeed,
                                            vy: Math.sin(splitAngle) * childSpeed,
                                            radius: 6,
                                            team: b.team,
                                            color: 'hsl(' + (k * (360 / splitWays)) + ', 100%, 75%)',
                                            isNormal: true,
                                            customDmg: 15,
                                            lifeTimer: 0,
                                            update: (cb, cdt) => {
                                                cb.lifeTimer += cdt;
                                                // 0.6秒間進んだら消滅 (一定距離で消滅)
                                                if (cb.lifeTimer >= 6.0) {
                                                    cb.x = -9999;
                                                    cb.y = -9999;
                                                }
                                            }
                                        });
                                    }
                                    // 親弾消滅
                                    b.x = -9999;
                                    b.y = -9999;
                                    return;
                                }

                                let currTarget = b.team === 'PLAYER' ? cpu : player;
                                let tx = currTarget.x;
                                let ty = currTarget.y;
                                let dx = tx - b.x;
                                let dy = ty - b.y;
                                let dist = Math.hypot(dx, dy) || 1;

                                // 現在の慣性（速度ベクトル）に相手方向のベクトルを加算するベクトル追尾ロジック
                                let speed = 350;
                                let force = 580; // 追尾力（加速度）の調整値
                                b.vx += (dx / dist) * force * dt;
                                b.vy += (dy / dist) * force * dt;

                                // 速度を一定スピード(350)に正規化
                                let currentSpeed = Math.hypot(b.vx, b.vy) || 1;
                                b.vx = (b.vx / currentSpeed) * speed;
                                b.vy = (b.vy / currentSpeed) * speed;
                            }
                        }
                    });
                }
                return res;
            },
            'masterspark': (attacker, target) => {
                let res = [];
                res.push({
                    x: attacker.x,
                    y: attacker.y,
                    vx: 0,
                    vy: 0,
                    radius: 8, // 初期半径 (予告フェーズ用)
                    warningWidth: 180, // 予告範囲の枠幅 (ビーム実サイズに連動)
                    team: attacker.team,
                    color: 'rgba(255, 255, 255, 0.95)',
                    isBeam: true,
                    isWarning: true,
                    lifeTimer: 0,
                    angle: attacker.team === 'CPU' ? Math.PI / 2 : -Math.PI / 2, // プレイヤーは上向き、CPUは下向き
                    update: (b, dt) => {
                        b.lifeTimer += dt;

                        // 26秒のスペルカード時間切れでビーム消滅
                        if (b.lifeTimer >= 26.0) {
                            b.x = -9999;
                            b.y = -9999;
                            return;
                        }

                        // キャスター（攻撃側）の速度をマスタースパーク中は激減
                        attacker.speed = 80;
                        attacker.slowSpeed = 30;

                        // マスタースパークの強烈な反動（ノックバック）
                        let knockbackDir = attacker.team === 'PLAYER' ? 1 : -1;
                        attacker.y += knockbackDir * 20 * dt;
                        let boundaryY = 120;
                        attacker.y = Math.max(boundaryY + attacker.grazeRadius, Math.min(canvas.height - attacker.grazeRadius, attacker.y));

                        // 7秒間のサイクルループ：1sチャージ、3s発射、1s収束、2s休憩
                        let cycleTime = b.lifeTimer % 7.0;

                        // 1. チャージフェーズ (0.0秒 〜 1.0秒): 吸い込みチャージ粒子を発生
                        if (cycleTime < 1.0) {
                            b.isWarning = true;
                            b.isResting = false;
                            b.radius = 8;
                            b.x = attacker.x; // キャスター位置に完全固定（自動追尾なし）

                            // 周囲からキャスターの元へと急激に収束する美しい魔力粒子（星）を生成
                            if (Math.random() < 0.45) {
                                let spawnAngle = Math.random() * Math.PI * 2;
                                let spawnDist = 120 + Math.random() * 160;
                                let starX = attacker.x + Math.cos(spawnAngle) * spawnDist;
                                let starY = attacker.y + Math.sin(spawnAngle) * spawnDist;

                                bullets.push({
                                    x: starX,
                                    y: starY,
                                    vx: -Math.cos(spawnAngle) * 230,
                                    vy: -Math.sin(spawnAngle) * 230,
                                    radius: 7.0,
                                    team: b.team,
                                    color: 'hsl(' + (Math.random() * 360) + ', 100%, 70%)',
                                    isNormal: false,
                                    lifeTimer: 0,
                                    update: (cb, cdt) => {
                                        cb.lifeTimer += cdt;
                                        // キャスターに近づいたら消去
                                        let dx = attacker.x - cb.x;
                                        let dy = attacker.y - cb.y;
                                        let dist = Math.hypot(dx, dy);
                                        if (dist < 15 || cb.lifeTimer > 1.0) {
                                            cb.x = -9999;
                                            cb.y = -9999;
                                        }
                                    }
                                });
                            }
                        }
                        // 2. 本射フェーズ (1.0秒 〜 4.0秒): 画面を揺らす極太レーザー ＆ 七色星弾スプレー
                        else if (cycleTime >= 1.0 && cycleTime < 4.0) {
                            b.isWarning = false;
                            b.isResting = false;

                            // 急激に極太サイズまでビームを拡大
                            let targetRadius = 90;
                            b.radius = Math.min(targetRadius, b.radius + (targetRadius - b.radius) * 12 * dt);

                            // 自動追尾なし、キャスターのX座標に完全に追従
                            b.x = attacker.x;

                            // 画面を豪快に揺らす
                            screenShakeAmount = 9.0;

                            // レーザーの判定幅の中に入った相手の通常弾をすべて消滅（かき消し）させる
                            let beamLeft = b.x - b.radius;
                            let beamRight = b.x + b.radius;
                            for (let k = bullets.length - 1; k >= 0; k--) {
                                let eb = bullets[k];
                                if (eb.team !== b.team && eb.isNormal) {
                                    if (eb.x >= beamLeft && eb.x <= beamRight) {
                                        if (attacker.team === 'PLAYER' && eb.y < b.y) {
                                            bullets.splice(k, 1);
                                        } else if (attacker.team === 'CPU' && eb.y > b.y) {
                                            bullets.splice(k, 1);
                                        }
                                    }
                                }
                            }

                            // ビーム射線上の相手に連続ヒット
                            let targetDx = Math.abs(target.x - b.x);
                            if (targetDx < b.radius + target.hitboxRadius) {
                                let isTargetInBeam = false;
                                if (attacker.team === 'PLAYER' && target.y < b.y) {
                                    isTargetInBeam = true;
                                } else if (attacker.team === 'CPU' && target.y > b.y) {
                                    isTargetInBeam = true;
                                }

                                if (isTargetInBeam && !target.isInvincible) {
                                    target.pendingDamage += 75 * dt; // 極太レーザーの壊滅的持続ダメージ
                                }
                            }

                            // 美しい虹色のうねる星弾スプレー射出
                            if (b.starSpawnTimer === undefined) b.starSpawnTimer = 0;
                            b.starSpawnTimer += dt;
                            if (b.starSpawnTimer >= 0.10) {
                                b.starSpawnTimer = 0;
                                let ways = 4;
                                let baseAngle = attacker.team === 'CPU' ? Math.PI / 2 : -Math.PI / 2;
                                for (let i = 0; i < ways; i++) {
                                    let offsetAngle = -0.45 + (0.9 / (ways - 1)) * i;
                                    let sprayAngle = baseAngle + offsetAngle + (Math.random() - 0.5) * 0.1;
                                    let starSpeed = 160 + Math.random() * 100;
                                    bullets.push({
                                        x: attacker.x + (Math.random() - 0.5) * 30,
                                        y: attacker.y + knockbackDir * 15,
                                        vx: Math.cos(sprayAngle) * starSpeed,
                                        vy: Math.sin(sprayAngle) * starSpeed,
                                        radius: 6.5,
                                        team: b.team,
                                        color: 'hsl(' + ((performance.now() / 3.5 + i * 120) % 360) + ', 100%, 65%)',
                                        isNormal: false,
                                        isStar: true,
                                        customDmg: 15, // かすり傷程度の15ダメージ
                                        curve: (Math.random() - 0.5) * 0.5,
                                        update: (sb, sdt) => {
                                            if (sb.curve !== 0) {
                                                let currentAngle = Math.atan2(sb.vy, sb.vx);
                                                let newAngle = currentAngle + sb.curve * sdt;
                                                let speedVal = Math.hypot(sb.vx, sb.vy);
                                                sb.vx = Math.cos(newAngle) * speedVal;
                                                sb.vy = Math.sin(newAngle) * speedVal;
                                            }
                                        }
                                    });
                                }
                            }
                        }
                        // 3. 収束フェーズ (4.0秒 〜 5.0秒): レーザーが超高速でしぼみながら消失
                        else if (cycleTime >= 4.0 && cycleTime < 5.0) {
                            b.isWarning = false;
                            b.isResting = false;
                            b.radius = Math.max(0, b.radius - 320 * dt);
                            b.x = attacker.x;
                        }
                        // 4. 休憩フェーズ (5.0秒 〜 7.0秒): 判定と描画を完全にオフ
                        else {
                            b.isWarning = false;
                            b.isResting = true;
                            b.radius = 0;
                            b.x = attacker.x;
                        }
                    }
                });
                return res;
            },
            'gungnir': (attacker, target) => {
                let res = [];
                let angle = Math.atan2(target.y - attacker.y, target.x - attacker.x);
                res.push({
                    x: attacker.x,
                    y: attacker.y,
                    vx: Math.cos(angle) * 750, // 存在感のあるスピード
                    vy: Math.sin(angle) * 750,
                    radius: 20, // 槍の判定サイズ
                    team: attacker.team,
                    color: '#ff1111',
                    isGungnir: true,
                    state: 0,
                    lifeTimer: 0,
                    hasHitTarget: false,
                    update: (b, dt) => {
                        b.lifeTimer += dt;

                        if (b.state === 0) {
                            // 槍が通過した跡（軌跡）に赤い弾幕を撒き散らす
                            // Trail spawn removed for performance

                            // すべての敵弾を貫通して消滅させる (55pxの超広範囲)
                            for (let k = bullets.length - 1; k >= 0; k--) {
                                let eb = bullets[k];
                                if (eb && eb.team !== b.team) {
                                    let dist = Math.hypot(eb.x - b.x, eb.y - b.y);
                                    if (dist < 55) {
                                        bullets.splice(k, 1);
                                    }
                                }
                            }

                            // ターゲット（機体）との当たり判定（貫通時の一撃）
                            let distToTarget = Math.hypot(target.x - b.x, target.y - b.y);
                            if (distToTarget < (target.hitboxRadius + b.radius)) {
                                if (!b.hasHitTarget) {
                                    b.hasHitTarget = true;
                                    if (!target.isInvincible) {
                                        target.pendingDamage += 50; // 貫通時に50ダメージ！
                                        if (!target.recentHits) target.recentHits = [];
                                        target.recentHits.push({ damage: 50, timestamp: performance.now() });
                                        addBattleEffect("◆ GUNGNIR PIERCE! ◆", "#ff3333");
                                    }
                                }
                            }

                            let reachWall = b.x < 10 || b.x > PLAY_WIDTH - 10 || b.y < 10 || b.y > canvas.height - 10;
                            if (reachWall || b.lifeTimer >= 1.2) {
                                b.state = 1;
                                b.vx = 0;
                                b.vy = 0;
                                b.radius = 20;
                                b.lifeTimer = 0;

                                let distToTarget = Math.hypot(target.x - b.x, target.y - b.y);
                                if (distToTarget < 120 && !target.isInvincible) {
                                    target.pendingDamage += 30; // 爆発時に追加で30ダメージ！
                                    if (!target.recentHits) target.recentHits = [];
                                    target.recentHits.push({ damage: 30, timestamp: performance.now() });
                                }

                                let ways = 16; // 爆発破片を16方向に減らしてダメージを抑える
                                let fragmentSpeed = 300;
                                for (let i = 0; i < ways; i++) {
                                    let fragAngle = (Math.PI * 2 / ways) * i;
                                    bullets.push({
                                        x: b.x,
                                        y: b.y,
                                        vx: Math.cos(fragAngle) * fragmentSpeed,
                                        vy: Math.sin(fragAngle) * fragmentSpeed,
                                        radius: 6,
                                        team: b.team,
                                        color: '#ff3355',
                                        isNormal: false,
                                        customDmg: 15
                                    });
                                }
                            }
                        } else if (b.state === 1) {
                            b.radius = 20 + b.lifeTimer * 250; // 爆発規模拡大
                            if (b.lifeTimer >= 0.45) {
                                b.x = -9999;
                                b.y = -9999;
                            }
                        }
                    }
                });
                return res;
            }
        };

        let lastTime = 0;
        let timeAccumulator = 0;
        let gameLoopFrameId = null;
        let fpsDisplay = 60;
        let fpsFrameCount = 0;
        let fpsAccumTime = 0;


        function startGameLoop() {
            if (gameLoopFrameId !== null) {
                cancelAnimationFrame(gameLoopFrameId);
            }
            gameLoopFrameId = requestAnimationFrame(update);
        }

        function update(timestamp) {
            gameLoopFrameId = null;


            if (!isGameRunning) return;
            if (!lastTime) lastTime = timestamp;
            let dt = (timestamp - lastTime) / 1000;
            lastTime = timestamp;
            if (dt > 0.1) dt = 0.1;
            window.currentDt = dt;

            // FPS計測
            fpsFrameCount++;
            fpsAccumTime += dt;
            if (fpsAccumTime >= 0.5) {
                fpsDisplay = Math.round(fpsFrameCount / fpsAccumTime);
                fpsFrameCount = 0;
                fpsAccumTime = 0;
            }


            let tStart = performance.now();

            timeAccumulator += dt;
            if (timeAccumulator > 0.1) {
                timeAccumulator = 0.1;
            }
            const FIXED_DT = 1 / 60;

            // 毎フレーム入力を更新（ゲームパッド ＆ キーコンフィグ）
            updateInputState();
            window.perfInput = performance.now() - tStart;

            let tSimStart = performance.now();
            let stepCount = 0;
            let ended = false;
            while (timeAccumulator >= FIXED_DT && stepCount < 1) {
                let res = tickSimulation(FIXED_DT);
                timeAccumulator -= FIXED_DT;
                stepCount++;
                if (res === 'ended') {
                    ended = true;
                    break;
                }
            }
            window.perfSim = performance.now() - tSimStart;

            if (ended) return;

            let tDrawStart = performance.now();
            draw();
            window.perfDraw = performance.now() - tDrawStart;
            window.perfTotal = performance.now() - tStart;

            // 10フレームごとに詳細プロファイルをコンソールに垂れ流す（window.showDebugProfiler が有効な場合のみ）
            if (window.showDebugProfiler) {
                if (!window.profileFrameCount) window.profileFrameCount = 0;
                window.profileFrameCount++;
                if (window.profileFrameCount % 10 === 0) {
                    console.log(
                        `[PERF] FPS:${fpsDisplay} | ` +
                        `Total:${window.perfTotal.toFixed(1)}ms | ` +
                        `Sim:${window.perfSim.toFixed(1)}ms (Touch:${(window.perfTouch || 0).toFixed(1)}ms, Bullet:${(window.perfBullet || 0).toFixed(1)}ms, Emitter:${(window.perfEmitter || 0).toFixed(1)}ms) | ` +
                        `Draw:${window.perfDraw.toFixed(1)}ms (BltDraw:${(window.perfDrawB || 0).toFixed(1)}ms) | ` +
                        `Bullets:${bullets.length} | ` +
                        `Cache:${numericExprCache.size}`
                    );
                }
            }
            window.perfTouch = 0;
            window.perfBullet = 0;
            window.perfEmitter = 0;

            startGameLoop();
        }

        function tickSimulation(dt) {
            // エディタ表示中、またはゲーム中(BATTLE)でない場合はシミュレーションを進めない (裏でのエミッターや弾の暴走を完全にブロック)
            if (!isGameRunning || gameState !== 'BATTLE') {
                return;
            }

            // バトルエフェクトのタイマー更新
            for (let i = activeEffects.length - 1; i >= 0; i--) {
                activeEffects[i].timer -= dt;
                if (activeEffects[i].timer <= 0) {
                    activeEffects.splice(i, 1);
                }
            }

            // 被弾履歴タイマーの更新
            if (player.recentHits) {
                let now = performance.now();
                player.recentHits = player.recentHits.filter(h => now - h.timestamp <= 250);
            }
            if (cpu.recentHits) {
                let now = performance.now();
                cpu.recentHits = cpu.recentHits.filter(h => now - h.timestamp <= 250);
            }

            // 画面揺れ（スクリーンの振動）の減衰更新
            if (screenShakeAmount > 0) {
                screenShakeAmount -= 15 * dt;
                if (screenShakeAmount < 0) screenShakeAmount = 0;
            }

            // 毎フレーム入力を更新（ゲームパッド ＆ キーコンフィグ）
            updateInputState();

            // スマホ用：遅延・速度制限なしで完全同期
            if (gameState === 'BATTLE' && mobileTargetX !== null && mobileTargetY !== null) {
                player.x = mobileTargetX;
                player.y = mobileTargetY;
            }

            if (gameState === 'BATTLE') {
                // オンライン対戦時、相手からキャスト情報（カード決定）が届いたらアクションフェーズを開始
                if (isOnlineMode && battlePhase === 'PLANNING' && turnOwner === 'CPU' && receivedCastIds) {
                    let cardIds = filterCustomCompatibleCastIds(receivedCastIds);
                    receivedCastIds = null; // リセット

                    // 相手手札から消費
                    cardIds.forEach(id => {
                        if (cpu.hand && id) {
                            let idx = cpu.hand.indexOf(id);
                            if (idx !== -1) cpu.hand.splice(idx, 1);
                        }
                    });

                    let abilityIds = cardIds.filter(id => id && id.startsWith('ab'));
                    let activeIds = cardIds.filter(id => id && !id.startsWith('ab'));

                    if (abilityIds.length > 0) {
                        // 相手側のアビリティ効果を即時適用
                        abilityIds.forEach(id => {
                            applyAbilityEffect(id, 'CPU');
                        });
                    }

                    // 相手の手札を補充
                    fillHandAbilities('CPU');

                    if (activeIds.length > 0) {
                        startActionPhase(activeIds);
                    } else {
                        // 精算フェーズへ直行
                        changePhase('RESOLUTION', 'CPU');
                        resolutionTimer = 0.8;
                    }
                }

                // 霊撃の発動処理 (回避側で戦闘フェーズ中のみ)
                if (battlePhase === 'ACTION' && turnOwner === 'CPU') {
                    let bombTriggered = (inputState.bomb && !prevBombInput) || mobileBombTriggered;
                    if (isCustomCardTesting) bombTriggered = false;
                    mobileBombTriggered = false; // 消費
                    if (bombTriggered && player.bombs >= 1 && !player.isInvincible) {
                        let consumed = true;
                        if (turnCount > 1 && player.passives.includes('p20') && Math.random() < 0.08) {
                            consumed = false;
                            addBattleEffect("【霊力節約】 ボムが消費されなかった！", "#aaffaa");
                        }
                        if (consumed) {
                            player.bombs -= 1;
                        }
                        player.isInvincible = true;
                        let now = performance.now();
                        let refund = player.recentHits ? player.recentHits
                            .filter(h => now - h.timestamp <= 250)
                            .reduce((sum, h) => sum + h.damage, 0) : 0;
                        player.pendingDamage = Math.max(0, player.pendingDamage - refund);
                        player.recentHits = [];

                        // p19 乾坤一擲
                        if (turnCount > 1 && player.passives.includes('p19')) {
                            cpu.hp = Math.max(0, cpu.hp - 30);
                            addBattleEffect("【乾坤一擲】 霊撃で相手に30ダメージ！", "#ff8888");
                            checkDeath();
                        }

                        // パッシブp11判定 (無敵時間2.0s ➔ 3.0s)
                        if (turnCount > 1 && player.passives.includes('p11')) {
                            player.invincibleTimer = 3.0;
                            addBattleEffect("【八卦の加護】 霊撃の無敵時間延長！", "#00ffff");
                        } else {
                            player.invincibleTimer = 2.0;
                        }

                        activeReigekis.push({
                            team: 'PLAYER',
                            x: player.x,
                            y: player.y,
                            radius: 30,
                            maxRadius: 260,
                            duration: 2.0,
                            timer: 0
                        });

                        reigekiCutinTimer = 1.0;
                        reigekiCutinOwner = 'PLAYER';

                        // オンライン対戦中は相手にボム発動を通知
                        if (isOnlineMode && conn && onlineConnected) {
                            conn.send({
                                type: 'bomb'
                            });
                        }
                    }
                }
                prevBombInput = inputState.bomb;

                // CPU（または相手プレイヤー）のボム発動処理 (回避側で戦闘フェーズ中のみ)
                if (battlePhase === 'ACTION' && turnOwner === 'PLAYER') {
                    if (isOnlineMode) {
                        // 相手からボム発動情報を受信した場合
                        if (receivedBomb) {
                            receivedBomb = false;
                            let consumed = true;
                            if (turnCount > 1 && cpu.passives.includes('p20') && Math.random() < 0.08) {
                                consumed = false;
                                addBattleEffect("【霊力節約】 相手のボムが消費されなかった！", "#ffaacc");
                            }
                            if (consumed) {
                                    cpu.bombs -= 1;
                                }
                                cpu.isInvincible = true;
                                let now = performance.now();
                                let refund = cpu.recentHits ? cpu.recentHits
                                    .filter(h => now - h.timestamp <= 250)
                                    .reduce((sum, h) => sum + h.damage, 0) : 0;
                                cpu.pendingDamage = Math.max(0, cpu.pendingDamage - refund);
                                cpu.recentHits = [];

                            // p19 乾坤一擲
                            if (turnCount > 1 && cpu.passives.includes('p19')) {
                                player.hp = Math.max(0, player.hp - 30);
                                addBattleEffect("【乾坤一擲】 霊撃であなたに30ダメージ！", "#ff8888");
                                checkDeath();
                            }

                            if (turnCount > 1 && cpu.passives.includes('p11')) {
                                cpu.invincibleTimer = 3.0;
                                addBattleEffect("【八卦の加護】 相手の霊撃無敵時間が延長！", "#ff5555");
                            } else {
                                cpu.invincibleTimer = 2.0;
                            }

                            activeReigekis.push({
                                team: 'CPU',
                                x: cpu.x,
                                y: cpu.y,
                                radius: 30,
                                maxRadius: 260,
                                duration: 2.0,
                                timer: 0
                            });

                            reigekiCutinTimer = 1.0;
                            reigekiCutinOwner = 'CPU';
                        }
                    } else {
                        // 通常の自律CPU of bomb trigger
                        if (cpu.bombs >= 1 && !cpu.isInvincible && cpu.bombCooldown <= 0) {
                            let activePlayerBulletsCount = bullets.filter(b => b.team === 'PLAYER' && !b.isNormal).length;
                            // 画面上にプレイヤーのスペル弾があり、かつ被弾ダメージが大きい場合、または低HP時に確率で緊急回避
                            if (activePlayerBulletsCount > 0 && (cpu.pendingDamage > 40 || (cpu.hp < 300 && Math.random() < 0.005))) {
                                let consumed = true;
                                if (turnCount > 1 && cpu.passives.includes('p20') && Math.random() < 0.08) {
                                    consumed = false;
                                    addBattleEffect("【霊力節約】 相手のボムが消費されなかった！", "#ffaacc");
                                }
                                if (consumed) {
                                    cpu.bombs -= 1;
                                }
                                cpu.isInvincible = true;
                                let now = performance.now();
                                let refund = cpu.recentHits ? cpu.recentHits
                                    .filter(h => now - h.timestamp <= 250)
                                    .reduce((sum, h) => sum + h.damage, 0) : 0;
                                cpu.pendingDamage = Math.max(0, cpu.pendingDamage - refund);
                                cpu.recentHits = [];

                                // p19 乾坤一擲
                                if (turnCount > 1 && cpu.passives.includes('p19')) {
                                    player.hp = Math.max(0, player.hp - 30);
                                    addBattleEffect("【乾坤一擲】 霊撃であなたに30ダメージ！", "#ff8888");
                                    checkDeath();
                                }

                                if (turnCount > 1 && cpu.passives.includes('p11')) {
                                    cpu.invincibleTimer = 3.0;
                                    addBattleEffect("【八卦の加護】 相手の霊撃無敵時間が延長！", "#ff5555");
                                } else {
                                    cpu.invincibleTimer = 2.0;
                                }
                                cpu.bombCooldown = 5.0; // クールダウン5秒

                                activeReigekis.push({
                                    team: 'CPU',
                                    x: cpu.x,
                                    y: cpu.y,
                                    radius: 30,
                                    maxRadius: 260,
                                    duration: 2.0,
                                    timer: 0
                                });

                                reigekiCutinTimer = 1.0;
                                reigekiCutinOwner = 'CPU';
                            }
                        }
                    }
                }

                // CPUのボムクールダウンと無敵更新
                if (cpu.bombCooldown > 0) {
                    cpu.bombCooldown -= dt;
                }
                if (cpu.isInvincible) {
                    cpu.invincibleTimer -= dt;
                    if (cpu.invincibleTimer <= 0) {
                        cpu.isInvincible = false;
                    }
                }

                // 無敵タイマーの更新
                if (player.isInvincible) {
                    player.invincibleTimer -= dt;
                    if (player.invincibleTimer <= 0) {
                        player.isInvincible = false;
                    }
                }

                // 霊撃カットインタイマーの更新
                if (reigekiCutinTimer > 0) {
                    reigekiCutinTimer -= dt;
                }

                // 霊撃の更新
                for (let i = activeReigekis.length - 1; i >= 0; i--) {
                    let r = activeReigekis[i];
                    r.timer += dt;

                    // 半径を徐々に広げる
                    r.radius = 30 + (r.maxRadius - 30) * (r.timer / r.duration);

                    if (r.team === 'PLAYER') {
                        r.x = player.x;
                        r.y = player.y;

                        // 敵の弾を消去
                        for (let j = bullets.length - 1; j >= 0; j--) {
                            let b = bullets[j];
                            if (b.team === 'CPU') {
                                if (b.hitRadius === 0) continue;
                                let distSq = (b.x - r.x) ** 2 + (b.y - r.y) ** 2;
                                let bHitR = b.hitRadius !== undefined ? b.hitRadius : b.radius;
                                if (distSq < (r.radius + bHitR) ** 2) {
                                    bullets.splice(j, 1); // 弾消去のみ（ボムによる弾消去時はかけらはドロップしない）
                                }
                            }
                        }

                        // 敵(CPU)に持続ダメージ
                        let distCpuSq = (cpu.x - r.x) ** 2 + (cpu.y - r.y) ** 2;
                        if (distCpuSq < (r.radius + cpu.hitboxRadius) ** 2) {
                            cpu.pendingDamage += 120 * dt;
                        }
                    } else if (r.team === 'CPU') {
                        r.x = cpu.x;
                        r.y = cpu.y;

                        // プレイヤーの弾を消去
                        for (let j = bullets.length - 1; j >= 0; j--) {
                            let b = bullets[j];
                            if (b.team === 'PLAYER') {
                                if (b.hitRadius === 0) continue;
                                let distSq = (b.x - r.x) ** 2 + (b.y - r.y) ** 2;
                                let bHitR = b.hitRadius !== undefined ? b.hitRadius : b.radius;
                                if (distSq < (r.radius + bHitR) ** 2) {
                                    bullets.splice(j, 1);
                                }
                            }
                        }

                        // プレイヤーに持続ダメージ
                        let distPlayerSq = (player.x - r.x) ** 2 + (player.y - r.y) ** 2;
                        if (distPlayerSq < (r.radius + player.hitboxRadius) ** 2) {
                            player.pendingDamage += 120 * dt;
                        }
                    }

                    if (r.timer >= r.duration) {
                        activeReigekis.splice(i, 1);
                    }
                }

                // 自機・敵機の移動処理（統合入力マネージャ inputState を参照 - 斜め移動の正規化処理を追加）
                let dx = 0;
                let dy = 0;
                if (inputState.up) dy -= 1;
                if (inputState.down) dy += 1;
                if (inputState.left) dx -= 1;
                if (inputState.right) dx += 1;

                if (dx !== 0 && dy !== 0) {
                    dx *= 0.70710678;
                    dy *= 0.70710678;
                }

                const currentSpeed = (inputState.slow || mobileSlowActive) ? player.slowSpeed : player.speed;
                player.x += dx * currentSpeed * dt;
                player.y += dy * currentSpeed * dt;

                player.x = Math.max(player.grazeRadius, Math.min(PLAY_WIDTH - player.grazeRadius, player.x));
                player.y = Math.max(player.grazeRadius, Math.min(canvas.height - player.grazeRadius, player.y));
                if (isCustomActionLocked('PLAYER')) {
                    applyCustomOwnerPositionLock('PLAYER', dt);
                    dx = 0;
                }

                
                // CPUの自律移動（軽量な単純回避移動に統一）
                let isDanger = false;
                if (cpu.thinkTimer === undefined) cpu.thinkTimer = 0;
                cpu.thinkTimer++;
                let shouldThink = (cpu.thinkTimer % cpu.thinkInterval === 0);

                // 危険判定（周囲にプレイヤーの弾があるか）
                for (let b of bullets) {
                    if (b.team === 'PLAYER' && !b.isNormal) {
                        if (Math.random() < cpu.ignoreChance) continue;
                        if (b.isBeam) {
                            let rx = cpu.x - b.x, ry = cpu.y - b.y;
                            let distAlong = rx * Math.cos(b.angle) + ry * Math.sin(b.angle);
                            let distPerp  = -rx * Math.sin(b.angle) + ry * Math.cos(b.angle);
                            if (distAlong > 0 && distAlong < 1200 && Math.abs(distPerp) < b.radius + 80) {
                                isDanger = true; break;
                            }
                        } else {
                            if (Math.abs(b.x - cpu.x) < 200 && Math.abs(b.y - cpu.y) < 250) {
                                isDanger = true; break;
                            }
                        }
                    }
                }

                if (shouldThink && (isDanger || cpu.evadeTimer <= 0)) {
                    let bestScore = -Infinity;
                    let bestTx = cpu.x, bestTy = cpu.y;
                    const moveAngles = [0, Math.PI/4, Math.PI/2, Math.PI*3/4, Math.PI, -Math.PI*3/4, -Math.PI/2, -Math.PI/4];
                    const moveDists = [0, 10, 20, 40, 70];

                    for (let d of moveDists) {
                        let angles = d === 0 ? [0] : moveAngles;
                        for (let a of angles) {
                            let tx = cpu.x + Math.cos(a) * d;
                            let ty = cpu.y + Math.sin(a) * d;
                            if (tx < cpu.hitboxRadius + 10 || tx > PLAY_WIDTH - cpu.hitboxRadius - 10) continue;
                            if (ty < cpu.hitboxRadius + 10 || ty > canvas.height - cpu.hitboxRadius - 10) continue;
                            let minTDist = Infinity;
                            for (let t = 0.1; t <= 0.4; t += 0.1) {
                                let pCpuX = cpu.x + Math.cos(a) * (d / 0.4) * t;
                                let pCpuY = cpu.y + Math.sin(a) * (d / 0.4) * t;
                                for (let b of bullets) {
                                    if (b.team === 'PLAYER' && !b.isNormal) {
                                        if (b.hitRadius === 0) continue;
                                        if (Math.random() < cpu.ignoreChance) continue;
                                        if (b.isBeam) {
                                            let rx = pCpuX - b.x, ry = pCpuY - b.y;
                                            let distAlong = rx * Math.cos(b.angle) + ry * Math.sin(b.angle);
                                            let distPerp  = -rx * Math.sin(b.angle) + ry * Math.cos(b.angle);
                                            if (distAlong > 0 && distAlong < 1200) {
                                                let dist = Math.abs(distPerp) - (b.isWarning ? 90 : b.radius) - cpu.hitboxRadius;
                                                if (dist < minTDist) minTDist = dist;
                                            }
                                        } else {
                                            let pBx = b.x + b.vx * t, pBy = b.y + b.vy * t;
                                            let bHitR = b.hitRadius !== undefined ? b.hitRadius : b.radius;
                                            let dist = Math.sqrt((pBx - pCpuX) ** 2 + (pBy - pCpuY) ** 2) - bHitR - cpu.hitboxRadius;
                                            if (dist < minTDist) minTDist = dist;
                                        }
                                    }
                                }
                            }
                            if (minTDist === Infinity) minTDist = 10000;
                            let score = minTDist;
                            if (minTDist > 30) {
                                score -= Math.abs(tx - player.x) * 0.05;
                                score -= Math.abs(ty - canvas.height * 0.2) * 0.1;
                            }
                            if (score > bestScore) { bestScore = score; bestTx = tx; bestTy = ty; }
                        }
                    }
                    cpu.targetX = bestTx;
                    cpu.targetY = bestTy;
                    if (isDanger) cpu.evadeTimer = 0.5;
                }

                if (cpu.evadeTimer > 0) cpu.evadeTimer -= dt;
                if (!isDanger && cpu.evadeTimer <= 0) {
                    if (Math.random() < 0.03) {
                        cpu.targetX = player.x + (Math.random() - 0.5) * 100;
                        cpu.targetY = canvas.height * 0.2 + (Math.random() - 0.5) * 50;
                        cpu.evadeTimer = 0.5;
                    }
                }

                cpu.targetX = Math.max(cpu.hitboxRadius + 10, Math.min(PLAY_WIDTH - cpu.hitboxRadius - 10, cpu.targetX));
                cpu.targetY = Math.max(cpu.hitboxRadius + 10, Math.min(canvas.height - cpu.hitboxRadius - 10, cpu.targetY));

                let cdx = cpu.targetX - cpu.x, cdy = cpu.targetY - cpu.y;
                let cdist = Math.sqrt(cdx * cdx + cdy * cdy);
                if (cpuDifficulty === 'EASY') {
                    cpu.isSlow = false;
                } else {
                    cpu.isSlow = isDanger && cdist > 0 && cdist < 30;
                }
                let currentCpuSpeed = cpu.isSlow ? cpu.speed * 0.4 : cpu.speed;
                let moveDist = currentCpuSpeed * dt;
                if (cdist > moveDist) {
                    cpu.x += (cdx / cdist) * moveDist;
                    cpu.y += (cdy / cdist) * moveDist;
                } else {
                    cpu.x = cpu.targetX;
                    cpu.y = cpu.targetY;
                }

                if (cpu.x < cpu.prevX - 0.1) {
                    cpu.moveDir = -1; // left
                } else if (cpu.x > cpu.prevX + 0.1) {
                    cpu.moveDir = 1; // right
                } else {
                    cpu.moveDir = 0; // idle
                }
                cpu.prevX = cpu.x;
                
                enforceCustomActionLock(dt);

                // アクションフェーズの弾幕展開
                if (battlePhase === 'ACTION') {
                    actionTimer -= dt;
                    window.currentCardSecond = (window.currentCardSecond || 0) + dt;
                    window.currentCardFrame = (window.currentCardFrame || 0) + 1;

                    // 制限時間内のみ弾を生成する
                    if (actionTimer > 0) {
                        let attacker = turnOwner === 'PLAYER' ? player : cpu;
                        let target = turnOwner === 'PLAYER' ? cpu : player;

                        let tEmitStart = performance.now();
                        activeCards.forEach(c => {
                            if (c.isCustom) {
                                if (c.emitterState) {
                                    stepEmitter(c, c.emitterState, attacker, target, dt);
                                }
                            } else {
                                c.spawnTimer += dt;
                                let currentInterval = c.interval;
                                if (turnOwner === 'CPU') {
                                    if (cpuDifficulty === 'EASY') {
                                        currentInterval = c.interval * 1.25; // 弾幕が25%まばらに
                                    } else if (cpuDifficulty === 'HARD') {
                                        currentInterval = c.interval * 0.8; // 20%短縮 (弾幕密度アップ)
                                    } else if (cpuDifficulty === 'LUNATIC') {
                                        currentInterval = c.interval * 0.6; // 40%短縮 (超高密度弾幕)
                                    }
                                }
                                if (c.spawnTimer >= currentInterval) {
                                    c.spawnTimer -= currentInterval;
                                    bullets.push(...CardLogic[c.pattern](attacker, target));
                                }
                            }
                        });
                        window.perfEmitter = (window.perfEmitter || 0) + (performance.now() - tEmitStart);

                        // 魔法陣の更新処理
                        if (magicCircles.length > 0) {
                            magicCircles.forEach(mc => {
                                if (mc.emitterState && !mc.emitterState.finished) {
                                    mc.emitterState.variables.x = mc.x;
                                    mc.emitterState.variables.y = mc.y;
                                    mc.emitterState.variables.tx = target.x;
                                    mc.emitterState.variables.ty = target.y;

                                    let mcCardObj = {
                                        bulletScript: mc.bulletScript || []
                                    };

                                    stepEmitter(mcCardObj, mc.emitterState, mc, target, dt);
                                }
                            });
                        }

                        // 常時発射：通常ショット（同時攻撃）
                        normalShotTimer += dt;
                        if (normalShotTimer >= 0.2) {
                            normalShotTimer = 0;
                            // スペル発動中（ターンオーナー）は通常攻撃を撃たない（防御側のみ反撃）
                            if (turnOwner !== 'PLAYER' && !isCustomCardTesting) {
                                let bCount = player.bombs;
                                if (bCount <= 1) {
                                    bullets.push({ x: player.x, y: player.y - 15, vx: 0, vy: -650, radius: 3.5, team: 'PLAYER', isNormal: true });
                                } else if (bCount === 2) {
                                    bullets.push({ x: player.x - 8, y: player.y - 15, vx: 0, vy: -650, radius: 3.5, team: 'PLAYER', isNormal: true });
                                    bullets.push({ x: player.x + 8, y: player.y - 15, vx: 40, vy: -650, radius: 3.5, team: 'PLAYER', isNormal: true });
                                } else if (bCount === 3) {
                                    bullets.push({ x: player.x, y: player.y - 15, vx: 0, vy: -650, radius: 3.5, team: 'PLAYER', isNormal: true });
                                    bullets.push({ x: player.x - 16, y: player.y - 10, vx: -30, vy: -650, radius: 3.5, team: 'PLAYER', isNormal: true });
                                    bullets.push({ x: player.x + 16, y: player.y - 10, vx: 30, vy: -650, radius: 3.5, team: 'PLAYER', isNormal: true });
                                } else if (bCount >= 4) {
                                    bullets.push({ x: player.x, y: player.y - 15, vx: 0, vy: -650, radius: 3.5, team: 'PLAYER', isNormal: true });
                                    bullets.push({ x: player.x - 12, y: player.y - 12, vx: -40, vy: -650, radius: 3.5, team: 'PLAYER', isNormal: true });
                                    bullets.push({ x: player.x + 12, y: player.y - 12, vx: 40, vy: -650, radius: 3.5, team: 'PLAYER', isNormal: true });
                                    bullets.push({ x: player.x - 24, y: player.y - 8, vx: -90, vy: -630, radius: 3.5, team: 'PLAYER', isNormal: true });
                                    bullets.push({ x: player.x + 24, y: player.y - 8, vx: 90, vy: -630, radius: 3.5, team: 'PLAYER', isNormal: true });
                                }
                            }
                            if (turnOwner !== 'CPU') {
                                let bCount = cpu.bombs;
                                if (bCount <= 1) {
                                    bullets.push({ x: cpu.x, y: cpu.y + 15, vx: 0, vy: 450, radius: 3, team: 'CPU', isNormal: true });
                                } else if (bCount === 2) {
                                    bullets.push({ x: cpu.x - 8, y: cpu.y + 15, vx: -20, vy: 450, radius: 3, team: 'CPU', isNormal: true });
                                    bullets.push({ x: cpu.x + 8, y: cpu.y + 15, vx: 20, vy: 450, radius: 3, team: 'CPU', isNormal: true });
                                } else if (bCount === 3) {
                                    bullets.push({ x: cpu.x, y: cpu.y + 15, vx: 0, vy: 450, radius: 3, team: 'CPU', isNormal: true });
                                    bullets.push({ x: cpu.x - 16, y: cpu.y + 10, vx: -30, vy: 450, radius: 3, team: 'CPU', isNormal: true });
                                    bullets.push({ x: cpu.x + 16, y: cpu.y + 10, vx: 30, vy: 450, radius: 3, team: 'CPU', isNormal: true });
                                } else if (bCount >= 4) {
                                    bullets.push({ x: cpu.x, y: cpu.y + 15, vx: 0, vy: 450, radius: 3, team: 'CPU', isNormal: true });
                                    bullets.push({ x: cpu.x - 12, y: cpu.y + 12, vx: -25, vy: 450, radius: 3, team: 'CPU', isNormal: true });
                                    bullets.push({ x: cpu.x + 12, y: cpu.y + 12, vx: 25, vy: 450, radius: 3, team: 'CPU', isNormal: true });
                                    bullets.push({ x: cpu.x - 24, y: cpu.y + 8, vx: -60, vy: 430, radius: 3, team: 'CPU', isNormal: true });
                                    bullets.push({ x: cpu.x + 24, y: cpu.y + 8, vx: 60, vy: 430, radius: 3, team: 'CPU', isNormal: true });
                                }
                            }
                        }
                    }

                    // 制限時間が切れ、かつ画面上の弾がすべて消えたら精算フェーズへ（自作カードテストプレイ中は除く）
                    if (actionTimer <= 0 && bullets.length === 0 && !isCustomCardTesting) {
                        if (isOnlineMode) {
                            if (!sentDamageSync) {
                                sentDamageSync = true;
                                conn.send({
                                    type: 'damageSync',
                                    damage: player.pendingDamage,
                                    heal: player.pendingHeal,
                                    bombs: player.bombs
                                });
                            }
                            // 相手からも精算完了（damageSync）が届いたらRESOLUTIONフェーズへ移行
                            if (receivedDamageSync) {
                                receivedDamageSync = false;
                                sentDamageSync = false;
                                changePhase('RESOLUTION', turnOwner);
                            }
                        } else {
                            changePhase('RESOLUTION', turnOwner);
                        }
                    }
                } else if (battlePhase === 'RESOLUTION') {
                    resolutionTimer -= dt;
                    if (resolutionTimer <= 0) {
                        // 自然治癒 (p13) の適用
                        if (player.passives.includes('p13')) {
                            player.hp = Math.min(player.maxHp || 1000, player.hp + 30);
                        }
                        if (cpu.passives.includes('p13')) {
                            cpu.hp = Math.min(cpu.maxHp || 1000, cpu.hp + 30);
                        }

                        let nextOwner = turnOwner === 'PLAYER' ? 'CPU' : 'PLAYER';
                        // 後手(CPU)の精算が終わったタイミングで次のターンに進む
                        if (turnOwner === 'CPU') {
                            turnCount++;
                        }
                        changePhase('PLANNING', nextOwner);
                    }
                }

                // 弾の更新と当たり判定
                let tTouchStart = performance.now();
                updateBulletTouchStates();
                window.perfTouch = (window.perfTouch || 0) + (performance.now() - tTouchStart);

                let tBulletStart = performance.now();
                const useFastRemove = bullets.length > 200;
                for (let i = bullets.length - 1; i >= 0; i--) {
                    let b = bullets[i];
                    if (!b) continue; // 安全対策: ループ内で配列が縮小して範囲外になった場合の回避
                    if (b.update) b.update(b, dt); // 弾個別の状態更新 (消える魔球やエボリューションなど)
                    if (isBulletExpired(b)) {
                        if (useFastRemove) { b._dead = true; continue; }
                        bullets.splice(i, 1);
                        continue;
                    }
                    b.x += b.vx * dt; b.y += b.vy * dt;

                    let isOff = (b.x < 0 || b.x > PLAY_WIDTH || b.y < 0 || b.y > canvas.height);
                    if (isOff) {
                        b.offscreenTime = (b.offscreenTime || 0) + dt;
                    } else {
                        b.offscreenTime = 0;
                    }

                    let shouldDespawn = false;
                    if (b.isBombPiece) {
                        let maxY = canvas.height + 60;
                        if (b.y > maxY || b.y < -30 || b.x < -30 || b.x > PLAY_WIDTH + 30) {
                            shouldDespawn = true;
                        }
                    } else if (b.isCustom) {
                        // Custom spells: can go offscreen, keep active up to despawnTime (default 1.5) to prevent mobile lag
                        let despawnLimit = 1.5;
                        if (activeCards && activeCards[0] && activeCards[0].despawnTime !== undefined) {
                            despawnLimit = Number(activeCards[0].despawnTime) || 1.5;
                        }
                        if (b.x < -500 || b.x > PLAY_WIDTH + 500 || b.y < -500 || b.y > canvas.height + 500) {
                            shouldDespawn = true;
                        } else if (b.offscreenTime >= despawnLimit) {
                            shouldDespawn = true;
                        }
                    } else {
                        // Default spells and normal shots: despawn immediately when offscreen (with a small 30px visual margin)
                        if (b.x < -30 || b.x > PLAY_WIDTH + 30 || b.y < -30 || b.y > canvas.height + 30) {
                            shouldDespawn = true;
                        }
                    }

                    if (shouldDespawn) {
                        if (useFastRemove) { b._dead = true; continue; }
                        bullets.splice(i, 1); continue;
                    }

                    if (b.isBeam || b.isGungnir) {
                        continue;
                    }

                    if (b.hitRadius === 0) {
                        continue;
                    }

                    let bHitR = b.isLaser ? getLaserWidth(b) / 2 : (b.hitRadius !== undefined ? b.hitRadius : b.radius);

                    if (b.isBombPiece) {
                        let distSq = (player.x - b.x) ** 2 + (player.y - b.y) ** 2;
                        if (distSq < (15 + b.radius) ** 2) {
                            player.bombPieces += b.pieceValue;
                            if (player.bombPieces >= 100) {
                                if (player.bombs < player.maxBombs) {
                                    player.bombs++;
                                } else {
                                    player.hp = Math.min(player.maxHp, player.hp + 20); // ボムMAXならHP回復
                                }
                                player.bombPieces -= 100;
                            }
                            bullets.splice(i, 1);
                            continue;
                        }
                    } else if (b.team === 'CPU') {
                        let isInv = player.isInvincible || (typeof window.playerInvincibleTimer === 'number' && window.playerInvincibleTimer > 0);
                        if (isInv || b.isWarningLaser) {
                            continue;
                        }
                        let distSq;
                        if (b.isLaser) {
                            let x1 = b.x;
                            let y1 = b.y;
                            let x2, y2;
                            if (b.isCustomBeam && b.bulletState) {
                                let rad = (b.bulletState.variables.angle || 0) * Math.PI / 180;
                                if (b.bulletState.isPlayerSide) {
                                    rad = -rad;
                                }
                                x2 = b.x + Math.cos(rad) * 1200;
                                y2 = b.y + Math.sin(rad) * 1200;
                            } else {
                                let speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
                                let dx = b.vx / (speed || 1);
                                let dy = b.vy / (speed || 1);
                                let len = 80;
                                x2 = b.x - dx * len;
                                y2 = b.y - dy * len;
                            }
                            
                            let A = player.x - x1;
                            let B = player.y - y1;
                            let C = x2 - x1;
                            let D = y2 - y1;
                            
                            let dot = A * C + B * D;
                            let lenSq = C * C + D * D;
                            let param = -1;
                            if (lenSq !== 0) param = dot / lenSq;
                            
                            let xx, yy;
                            if (param < 0) {
                                xx = x1;
                                yy = y1;
                            } else if (param > 1) {
                                xx = x2;
                                yy = y2;
                            } else {
                                xx = x1 + param * C;
                                yy = y1 + param * D;
                            }
                            distSq = (player.x - xx) ** 2 + (player.y - yy) ** 2;
                        } else if (b.bulletImage === 'sword') {
                            // 剣弾の5点マルチサークル判定（プレイヤー）
                            let speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
                            let dx = b.vx / (speed || 1);
                            let dy = b.vy / (speed || 1);
                            let step = bHitR * 1.3;
                            
                            let isSwordHit = false;
                            let isSwordGraze = false;
                            for (let k = 0; k <= 4; k++) {
                                let cx = b.x + dx * (k * step);
                                let cy = b.y + dy * (k * step);
                                let dSq = (player.x - cx) ** 2 + (player.y - cy) ** 2;
                                if (dSq < (player.hitboxRadius + bHitR) ** 2) isSwordHit = true;
                                if (!b.grazed && dSq < (player.grazeRadius + bHitR) ** 2) isSwordGraze = true;
                            }
                            
                            distSq = isSwordHit ? 0 : (isSwordGraze ? (player.hitboxRadius + bHitR) ** 2 + 1 : Infinity);
                        } else {
                            distSq = (player.x - b.x) ** 2 + (player.y - b.y) ** 2;
                        }
                        if (distSq < (player.hitboxRadius + bHitR) ** 2) {
                            let dmg = b.customDmg !== undefined ? b.customDmg : (b.isNormal ? 2 : 50);
                            if (!b.isNormal && activeCards.length >= 2) {
                                dmg = Math.floor(dmg / 2);
                            }
                            // 攻撃側（CPU）のパッシブ補正
                            if (turnCount > 1 && cpu.passives.includes('p8') && cpu.bombs === 0) {
                                dmg = Math.floor(dmg * 1.25);
                            }
                            if (turnCount > 1 && cpu.passives.includes('p14')) {
                                dmg = Math.floor(dmg * 1.10); // 気炎万丈 (+10%)
                            }
                            if (turnCount > 1 && cpu.passives.includes('p16') && cpu.hp <= 300) {
                                dmg = Math.floor(dmg * 1.25); // 背水の陣 (+25%)
                            }
                            if (cpu.p22Buff && turnCount > 1 && cpu.passives.includes('p22')) {
                                dmg = Math.floor(dmg * 1.20); // 憤怒の炎 (+20%)
                            }

                            // 防御側（PLAYER）のパッシブ補正
                            if (turnCount > 1 && player.passives.includes('p1')) dmg = Math.max(1, dmg - 20); // 被弾軽減
                            if (turnCount > 1 && player.passives.includes('p15') && !b.isNormal) {
                                dmg = Math.max(1, dmg - 15); // 弾幕結界 (スペル被弾-15)
                            }
                            if (turnCount > 1 && player.passives.includes('p17') && player.hp <= 300) {
                                dmg = Math.floor(dmg * 0.80); // 金剛結界 (-20%)
                            }

                            player.pendingDamage += dmg;
                            if (!player.recentHits) player.recentHits = [];
                            player.recentHits.push({ damage: dmg, timestamp: performance.now() });
                            player.hitLastTurn = true; // 被弾履歴

                            if (!isCustomCardTesting && !b.destroyResist) {
                                if (useFastRemove) { b._dead = true; continue; }
                                bullets.splice(i, 1); continue;
                            }
                        }
                        if (!b.grazed && distSq < (player.grazeRadius + bHitR) ** 2) {
                            b.grazed = true; player.grazeCount++;
                            if (turnCount > 1 && player.passives.includes('p6') && Math.random() < 0.5) {
                                player.pendingHeal += 1;
                            }

                            // p21 吸血の牙 (20グレイズごとにHP回復)
                            if (turnCount > 1 && player.passives.includes('p21') && player.grazeCount % 20 === 0) {
                                player.pendingHeal += 10;
                                addBattleEffect("【吸血の牙】 HP回復量+10！", "#88ff88");
                            }

                            spawnBombPiece(b.x, b.y, 3);

                            // パッシブp5の判定 (500グレイズごとに回復に調整)
                            if (turnCount > 1 && player.passives.includes('p5') && player.grazeCount % 500 === 0) {
                                if (player.bombs < player.maxBombs) player.bombs++;
                            }
                            // パッシブp10の判定 (1%でボム回復)
                            if (turnCount > 1 && player.passives.includes('p10') && Math.random() < 0.01) {
                                if (player.bombs < player.maxBombs) {
                                    player.bombs++;
                                    addBattleEffect("【霊力還元】 ボムが1つ回復！", "#aaffaa");
                                }
                            }
                        }
                    } else if (b.team === 'PLAYER') {
                        if (cpu.isInvincible || b.isWarningLaser) {
                            continue;
                        }
                        let distSq;
                        if (b.isLaser) {
                            let x1 = b.x;
                            let y1 = b.y;
                            let x2, y2;
                            if (b.isCustomBeam && b.bulletState) {
                                let rad = (b.bulletState.variables.angle || 0) * Math.PI / 180;
                                if (b.bulletState.isPlayerSide) {
                                    rad = -rad;
                                }
                                x2 = b.x + Math.cos(rad) * 1200;
                                y2 = b.y + Math.sin(rad) * 1200;
                            } else {
                                let speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
                                let dx = b.vx / (speed || 1);
                                let dy = b.vy / (speed || 1);
                                let len = 80;
                                x2 = b.x - dx * len;
                                y2 = b.y - dy * len;
                            }
                            
                            let A = cpu.x - x1;
                            let B = cpu.y - y1;
                            let C = x2 - x1;
                            let D = y2 - y1;
                            
                            let dot = A * C + B * D;
                            let lenSq = C * C + D * D;
                            let param = -1;
                            if (lenSq !== 0) param = dot / lenSq;
                            
                            let xx, yy;
                            if (param < 0) {
                                xx = x1;
                                yy = y1;
                            } else if (param > 1) {
                                xx = x2;
                                yy = y2;
                            } else {
                                xx = x1 + param * C;
                                yy = y1 + param * D;
                            }
                            distSq = (cpu.x - xx) ** 2 + (cpu.y - yy) ** 2;
                        } else if (b.bulletImage === 'sword') {
                            // 剣弾 of 5点マルチサークル判定（CPU）
                            let speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
                            let dx = b.vx / (speed || 1);
                            let dy = b.vy / (speed || 1);
                            let step = bHitR * 1.3;
                            
                            let isSwordHit = false;
                            for (let k = 0; k <= 4; k++) {
                                let cx = b.x + dx * (k * step);
                                let cy = b.y + dy * (k * step);
                                let dSq = (cpu.x - cx) ** 2 + (cpu.y - cy) ** 2;
                                if (dSq < (cpu.hitboxRadius + bHitR) ** 2) {
                                    isSwordHit = true;
                                    break;
                                }
                            }
                            distSq = isSwordHit ? 0 : Infinity;
                        } else {
                            distSq = (cpu.x - b.x) ** 2 + (cpu.y - b.y) ** 2;
                        }
                        if (distSq < (cpu.hitboxRadius + bHitR) ** 2) {
                            let dmg = b.customDmg !== undefined ? b.customDmg : (b.isNormal ? 1 : 40); // 通常弾は一発1ダメージ固定
                            if (!b.isNormal && activeCards.length >= 2) {
                                dmg = Math.floor(dmg / 2);
                            }
                            // 攻撃側（PLAYER）のパッシブ補正
                            if (turnCount > 1 && player.passives.includes('p8') && player.bombs === 0) {
                                dmg = Math.floor(dmg * 1.25);
                            }
                            if (turnCount > 1 && player.passives.includes('p14')) {
                                dmg = Math.floor(dmg * 1.10); // 気炎万丈 (+10%)
                            }
                            if (turnCount > 1 && player.passives.includes('p16') && player.hp <= 300) {
                                dmg = Math.floor(dmg * 1.25); // 背水の陣 (+25%)
                            }
                            if (player.p22Buff && turnCount > 1 && player.passives.includes('p22')) {
                                dmg = Math.floor(dmg * 1.20); // 憤怒の炎 (+20%)
                            }

                            // 防御側（CPU）のパッシブ補正
                            if (turnCount > 1 && cpu.passives.includes('p1')) dmg = Math.max(1, dmg - 20); // 被弾軽減
                            if (turnCount > 1 && cpu.passives.includes('p15') && !b.isNormal) {
                                dmg = Math.max(1, dmg - 15); // 弾幕結界 (スペル被弾-15)
                            }
                            if (turnCount > 1 && cpu.passives.includes('p17') && cpu.hp <= 300) {
                                dmg = Math.floor(dmg * 0.80); // 金剛結界 (-20%)
                            }

                            cpu.pendingDamage += dmg;
                            if (!cpu.recentHits) cpu.recentHits = [];
                            cpu.recentHits.push({ damage: dmg, timestamp: performance.now() });
                            cpu.hitLastTurn = true; // 被弾履歴

                            if (b.isNormal) {
                                if (Math.random() < 0.25) spawnBombPiece(cpu.x, cpu.y, 2); // 25%の確率で2かけら
                            } else {
                                spawnBombPiece(cpu.x, cpu.y, 15); // スペルカード命中時は15かけら
                            }
                            if (useFastRemove) { b._dead = true; continue; }
                            bullets.splice(i, 1); continue;
                        }
                        if (!b.grazed && distSq < (cpu.grazeRadius + bHitR) ** 2) {
                            b.grazed = true; cpu.grazeCount++;
                            if (turnCount > 1 && cpu.passives.includes('p6') && Math.random() < 0.5) {
                                cpu.pendingHeal += 1;
                            }

                            // p21 吸血の牙 (20グレイズごとにHP回復)
                            if (turnCount > 1 && cpu.passives.includes('p21') && cpu.grazeCount % 20 === 0) {
                                cpu.pendingHeal += 10;
                                addBattleEffect("【吸血の牙】 相手のHP回復量+10！", "#ffaacc");
                            }

                            // CPUのパッシブ判定
                            if (turnCount > 1 && cpu.passives.includes('p5') && cpu.grazeCount % 500 === 0) {
                                if (cpu.bombs < cpu.maxBombs) cpu.bombs++;
                            }
                            if (turnCount > 1 && cpu.passives.includes('p10') && Math.random() < 0.01) {
                                if (cpu.bombs < cpu.maxBombs) {
                                    cpu.bombs++;
                                    addBattleEffect("【霊力還元】 相手のボムが回復！", "#ff8888");
                                }
                            }
                        }
                    }
                }
                if (useFastRemove) {
                    // 参照を壊さないようにインプレース（破壊的）に生存している弾のみを残す
                    let writeIdx = 0;
                    for (let i = 0; i < bullets.length; i++) {
                        if (!bullets[i]._dead) {
                            bullets[writeIdx++] = bullets[i];
                        }
                    }
                    bullets.length = writeIdx;
                }
                window.perfBullet = (window.perfBullet || 0) + (performance.now() - tBulletStart);
            }

            if (isCustomCardTesting) {
                // 被弾無敵時間の更新
                if (typeof window.playerInvincibleTimer === 'number' && window.playerInvincibleTimer > 0) {
                    window.playerInvincibleTimer -= dt;
                    player.pendingDamage = 0; // 無敵中はダメージを無効化
                }

                // 耐えた時の小さな爆発パーティクルの更新
                if (window.miniExplosionEffect) {
                    window.miniExplosionEffect.forEach(p => {
                        p.x += p.vx * dt;
                        p.y += p.vy * dt;
                        p.life -= dt;
                        p.alpha = Math.max(0, p.life / p.maxLife);
                    });
                    window.miniExplosionEffect = window.miniExplosionEffect.filter(p => p.life > 0);
                    if (window.miniExplosionEffect.length === 0) window.miniExplosionEffect = null;
                }

                // 衝撃波（波紋）の更新と当たり判定による弾消去
                if (window.miniExplosionShockwave) {
                    window.miniExplosionShockwave.r += window.miniExplosionShockwave.speed * dt;
                    window.miniExplosionShockwave.life -= dt;
                    
                    bullets = bullets.filter(b => {
                        const isLaserOrBeam = b.isLaser || b.isBeam || b.isWarningLaser || b.isCustomBeam || b.isGungnir;
                        if (isLaserOrBeam || b.destroyResist) return true;
                        let dist = Math.sqrt((b.x - window.miniExplosionShockwave.x) ** 2 + (b.y - window.miniExplosionShockwave.y) ** 2);
                        return dist > window.miniExplosionShockwave.r;
                    });
                    
                    if (window.miniExplosionShockwave.life <= 0) {
                        window.miniExplosionShockwave = null;
                    }
                }

                // クリアエフェクト進行中はタイマーを減らして待つ
                if (window.customCardClearEffect) {
                    window.customCardClearEffect.elapsed = (window.customCardClearEffect.elapsed || 0) + dt;
                    // お祝いの虹色パーティクルを更新
                    window.customCardClearEffect.particles.forEach(p => {
                        p.x += p.vx * dt;
                        p.y += p.vy * dt;
                        p.vy += p.gravity * dt; // 重力
                        p.life -= dt;
                        p.alpha = Math.max(0, p.life / p.maxLife);
                    });
                    window.customCardClearEffect.particles = window.customCardClearEffect.particles.filter(p => p.life > 0);
                    // タップ5回で終了
                    if (window.customCardClearEffect.tapCount >= 5) {
                        window.customCardClearEffect = null;
                        endCustomCardTest(true);
                        return 'ended';
                    }
                    return; // エフェクト中は他の処理をスキップ
                }

                // 死亡エフェクト進行中はタイマーを減らして待つ
                if (customCardDeathEffect) {
                    customCardDeathEffect.timer -= dt;
                    // パーティクルを更新
                    customCardDeathEffect.particles.forEach(p => {
                        p.x += p.vx * dt;
                        p.y += p.vy * dt;
                        p.vy += 200 * dt; // 重力
                        p.life -= dt;
                        p.alpha = Math.max(0, p.life / p.maxLife);
                    });
                    customCardDeathEffect.particles = customCardDeathEffect.particles.filter(p => p.life > 0);
                    if (customCardDeathEffect.timer <= 0) {
                        customCardDeathEffect = null;
                        endCustomCardTest(false);
                        return 'ended';
                    }
                    return; // エフェクト中はダメージ判定・終了チェックをスキップ
                }

                if (player.pendingDamage > 0) {
                    if (typeof window.playerMissCount !== 'number') {
                        window.playerMissCount = 0;
                    }
                    
                    let maxMisses = (typeof window.playerMaxMisses === 'number') ? window.playerMaxMisses : 2;
                    if (window.playerMissCount < maxMisses) {
                        window.playerMissCount++;
                        player.pendingDamage = 0;
                        window.playerInvincibleTimer = 1.5; // 無敵時間1.5秒
                        
                        // 小さな爆発エフェクトの生成
                        let particles = [];
                        for (let i = 0; i < 30; i++) {
                            let angle = Math.random() * Math.PI * 2;
                            let speed = 50 + Math.random() * 180;
                            particles.push({
                                x: player.x, y: player.y,
                                vx: Math.cos(angle) * speed,
                                vy: Math.sin(angle) * speed,
                                life: 0.3 + Math.random() * 0.3,
                                maxLife: 0.3 + Math.random() * 0.3,
                                alpha: 1,
                                r: 2 + Math.random() * 4,
                                color: '#00ffff' // シアン色の火花
                            });
                        }
                        window.miniExplosionEffect = particles;
                        
                        // 衝撃波（波紋）の生成 (半径 200px まで広がる)
                        window.miniExplosionShockwave = {
                            x: player.x,
                            y: player.y,
                            r: 10,
                            maxR: 200,
                            speed: 380, // 約0.5秒で最大
                            life: 0.5
                        };
                        
                        // 周囲の弾を即座に消去（レーザーは除く）
                        bullets = bullets.filter(b => {
                            const isLaserOrBeam = b.isLaser || b.isBeam || b.isWarningLaser || b.isCustomBeam || b.isGungnir;
                            if (isLaserOrBeam || b.destroyResist) return true;
                            let dist = Math.sqrt((b.x - player.x) ** 2 + (b.y - player.y) ** 2);
                            return dist > 200;
                        });
                    } else {
                        // 3回目で死亡エフェクト開始（3秒）
                        let particles = [];
                        for (let i = 0; i < 60; i++) {
                            let angle = Math.random() * Math.PI * 2;
                            let speed = 80 + Math.random() * 300;
                            particles.push({
                                x: player.x, y: player.y,
                                vx: Math.cos(angle) * speed,
                                vy: Math.sin(angle) * speed - 150,
                                life: 0.8 + Math.random() * 1.5,
                                maxLife: 0.8 + Math.random() * 1.5,
                                alpha: 1,
                                r: 3 + Math.random() * 6,
                                hue: Math.random() * 60 // 赤〜オレンジ
                            });
                        }
                        customCardDeathEffect = { timer: 3.0, particles };
                    }
                }
                // actionTimer が切れたら即座に全弾を消去してクリアエフェクトを開始
                if (actionTimer <= 0 && !customCardDeathEffect && !window.customCardClearEffect) {
                    bullets.length = 0; // 弾を全消去
                    let particles = [];
                    for (let i = 0; i < 80; i++) {
                        let angle = Math.random() * Math.PI * 2;
                        let speed = 100 + Math.random() * 250;
                        particles.push({
                            x: PLAY_WIDTH / 2 + (Math.random() - 0.5) * 100, // 画面中央付近
                            y: canvas.height / 2 + (Math.random() - 0.5) * 100,
                            vx: Math.cos(angle) * speed,
                            vy: Math.sin(angle) * speed - 50,
                            gravity: -50 + Math.random() * 100, // フワフワ落ちる
                            life: 1.0 + Math.random() * 1.5,
                            maxLife: 1.0 + Math.random() * 1.5,
                            alpha: 1,
                            r: 4 + Math.random() * 5,
                            hue: Math.random() * 360 // 虹色
                        });
                    }
                    window.customCardClearEffect = { elapsed: 0, tapCount: 0, particles };
                    customCardTestEmitterDone = true;
                }
            }
        }

        function checkDeath() {
            // パッシブ p7：豊穣の守り（HPが25%以下になったとき、一度だけHPを300回復）
            if (turnCount > 1) {
                if (player.hp > 0 && player.hp <= player.maxHp * 0.25 && player.passives.includes('p7') && !player.p7Triggered) {
                    player.hp = Math.min(player.maxHp, player.hp + 300);
                    player.p7Triggered = true;
                    addBattleEffect("【豊穣の守り】 PLAYER: HPが300自動回復！", "#55ff55");
                }
                if (cpu.hp > 0 && cpu.hp <= cpu.maxHp * 0.25 && cpu.passives.includes('p7') && !cpu.p7Triggered) {
                    cpu.hp = Math.min(cpu.maxHp, cpu.hp + 300);
                    cpu.p7Triggered = true;
                    let oppLabel = isOnlineMode ? "ENEMY" : "CPU";
                    addBattleEffect(`【豊穣の守り】 ${oppLabel}: HPが300自動回復！`, "#ff5555");
                }
            }

            if (player.hp <= 0 || cpu.hp <= 0) {
                gameState = 'RESULT';
                battleOverlay.classList.remove('hidden');
                handContainer.innerHTML = '';
                phaseText.textContent = player.hp <= 0 ? "YOU LOSE..." : "YOU WIN!!";
                phaseText.style.color = player.hp <= 0 ? "#ff5555" : "#55ff55";

                const btn = document.createElement('button');
                btn.className = 'hand-btn'; btn.textContent = 'タイトルに戻る';
                btn.onclick = () => {
                    isGameRunning = false;
                    battleOverlay.classList.add('hidden');
                    document.getElementById('titleScreen').style.display = 'flex';
                    showScreen('screen-menu');
                };
                handContainer.appendChild(btn);
            }
        }

        function draw() {
            ctx.save(); // 画面揺れ用のカメラ状態保存
            if (screenShakeAmount > 0) {
                let dx = (Math.random() - 0.5) * screenShakeAmount;
                let dy = (Math.random() - 0.5) * screenShakeAmount;
                ctx.translate(dx, dy);
            }

            ctx.clearRect(0, 0, PLAY_WIDTH, canvas.height);
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, PLAY_WIDTH, canvas.height);

            // ── プレイ領域の境界線（スマホで画面内外を明確に区別） ──────
            {
                const W = PLAY_WIDTH;
                const H = canvas.height;
                const t = performance.now();

                // 薄いグリッド線（縦4本・横6本）
                ctx.save();
                ctx.strokeStyle = 'rgba(255,255,255,0.03)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                const cols = 4, rows = 6;
                for (let i = 1; i < cols; i++) {
                    const x = W / cols * i;
                    ctx.moveTo(x, 0); ctx.lineTo(x, H);
                }
                for (let j = 1; j < rows; j++) {
                    const y = H / rows * j;
                    ctx.moveTo(0, y); ctx.lineTo(W, y);
                }
                ctx.stroke();

                // 四辺のボーダー（アニメーションするグロー）
                const glow = 0.55 + 0.2 * Math.sin(t / 800);
                ctx.lineWidth = 2;
                ctx.strokeStyle = `rgba(120, 200, 255, ${glow})`;
                ctx.shadowColor = 'rgba(100, 180, 255, 0.8)';
                ctx.shadowBlur = 8;
                ctx.strokeRect(1, 1, W - 2, H - 2);

                // 四隅のコーナーマーカー（L字）
                const cLen = 18, cW = 3;
                ctx.lineWidth = cW;
                ctx.strokeStyle = `rgba(180, 230, 255, ${0.7 + 0.3 * Math.sin(t / 500)})`;
                ctx.shadowColor = 'rgba(120, 200, 255, 1.0)';
                ctx.shadowBlur = 10;
                // 左上
                ctx.beginPath(); ctx.moveTo(0, cLen); ctx.lineTo(0, 0); ctx.lineTo(cLen, 0); ctx.stroke();
                // 右上
                ctx.beginPath(); ctx.moveTo(W - cLen, 0); ctx.lineTo(W, 0); ctx.lineTo(W, cLen); ctx.stroke();
                // 左下
                ctx.beginPath(); ctx.moveTo(0, H - cLen); ctx.lineTo(0, H); ctx.lineTo(cLen, H); ctx.stroke();
                // 右下
                ctx.beginPath(); ctx.moveTo(W - cLen, H); ctx.lineTo(W, H); ctx.lineTo(W, H - cLen); ctx.stroke();

                ctx.shadowBlur = 0;
                ctx.restore();
            }

            const blurScale = 0; // shadowBlur is disabled for performance
            let tDrawBStart = performance.now();

            // ── 光弾のオーラ（グロー）を先行して描画（加算合成＋揺らぎエフェクト） ──
            ctx.save();
            ctx.globalCompositeOperation = 'lighter'; // 加算合成で光っぽく繋げる
            bullets.forEach(b => {
                // 画面外カリング（オーラ分を考慮して通常より広い範囲でカリング判定）
                if (b.x < -b.radius - 35 || b.x > PLAY_WIDTH + b.radius + 35 || b.y < -b.radius - 35 || b.y > canvas.height + b.radius + 35) return;
                
                if (b.bulletImage === 'light') {
                    let time = performance.now();
                    // 弾ごとに異なる揺らぎを作るためのシード値
                    let seed = b.x * 0.05 + b.y * 0.05;

                    // 変数から光の範囲 (auraRange) と強さ (auraIntensity) を取得できるようにする（大文字小文字無視）
                    let auraRangeVal = 2.75;
                    let auraIntensityVal = 1.0;
                    if (b.bulletState && b.bulletState.variables) {
                        let vRange = window.getBulletVar(b.bulletState.variables, 'auraRange');
                        if (vRange !== undefined && vRange !== null) {
                            auraRangeVal = parseFloat(vRange) || 0;
                        }
                        let vIntensity = window.getBulletVar(b.bulletState.variables, 'auraIntensity');
                        if (vIntensity !== undefined && vIntensity !== null) {
                            auraIntensityVal = parseFloat(vIntensity) || 0;
                        }
                    }
                    
                    // オーラのサイズは auraRangeVal を基準にし、非常に微弱かつゆっくりとうねるように調整
                    let auraRadius = b.radius * (auraRangeVal + 0.08 * Math.sin(time * 0.002 + seed));
                    let auraColor = b.color || '#ff3333';
                    
                    // 位置の揺れもごくわずかに抑え、ゆっくりと浮遊する程度にする (最大0.3px)
                    let waveX = b.x + Math.sin(time * 0.003 + seed) * 0.3;
                    let waveY = b.y + Math.cos(time * 0.0025 + seed) * 0.3;

                    // キャッシュからテクスチャを取得して描画
                    let tex = window.getLightBulletTexture(auraColor, b.radius);
                    let scale = auraRadius / tex.baseAuraRadius;
                    let drawSize = tex.size * scale;

                    ctx.save();
                    ctx.globalAlpha = Math.max(0, Math.min(1.0, auraIntensityVal));
                    ctx.drawImage(
                        tex.canvas,
                        waveX - drawSize / 2,
                        waveY - drawSize / 2,
                        drawSize,
                        drawSize
                    );
                    ctx.restore();
                }
            });
            ctx.restore();

            bullets.forEach(b => {
                // 画面外カリング（通常弾のみ）
                // 予告線・設置ビームは発射点が画面外でも線本体が画面内に伸びるためカリング除外
                if (!b.isBeam && !b.isLaser && !b.isWarningLaser && !b.isCustomBeam && !b.isGungnir && !b.isStar && !b.isBombPiece) {
                    if (b.x < -b.radius - 4 || b.x > PLAY_WIDTH + b.radius + 4 || b.y < -b.radius - 4 || b.y > canvas.height + b.radius + 4) return;
                }

                if (b.isBombPiece) {
                    ctx.save();
                    ctx.translate(b.x, b.y);
                    let size = b.pieceValue >= 30 ? 18 : 12;
                    ctx.fillStyle = b.color;

                    ctx.beginPath();
                    for (let k = 0; k < 6; k++) {
                        let angle = (Math.PI / 3) * k;
                        let rx = Math.cos(angle) * (size / 2);
                        let ry = Math.sin(angle) * (size / 2);
                        if (k === 0) ctx.moveTo(rx, ry);
                        else ctx.lineTo(rx, ry);
                    }
                    ctx.closePath();
                    ctx.fill();

                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = 1.5;
                    ctx.stroke();
                    ctx.fillStyle = '#ffffff';
                    ctx.font = `bold ${b.pieceValue >= 30 ? '12px' : '9px'} sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('B', 0, 0);
                    ctx.restore();
                } else if (b.isBeam) {
                    if (b.isResting) return;
                    ctx.save();
                    ctx.translate(b.x, b.y);
                    ctx.rotate(b.angle - Math.PI / 2); // 角度可変に対応した回転

                    if (b.isWarning) {
                        // 予告レーザーの描画：半透明の赤と細い白線で本家風のチャージ警告を表現
                        let pulseAlpha = 0.08 + Math.abs(Math.sin(performance.now() / 90)) * 0.16;
                        ctx.fillStyle = `rgba(255, 50, 50, ${pulseAlpha})`;
                        ctx.fillRect(-b.warningWidth / 2, 0, b.warningWidth, 1200);
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
                        ctx.lineWidth = 2.5;
                        ctx.beginPath();
                        ctx.moveTo(0, 0);
                        ctx.lineTo(0, 1200);
                        ctx.stroke();

                        // 魔理沙風：キャスターの手元にチャージ魔法陣リングを重ねる
                        ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 + Math.random() * 0.5})`;
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.arc(0, 0, 35 + Math.random() * 15, 0, Math.PI * 2);
                        ctx.stroke();
                    } else {
                        let grad = ctx.createLinearGradient(-b.radius, 0, b.radius, 0);
                        let baseHue = (performance.now() / 6) % 360;
                        grad.addColorStop(0, `hsla(${baseHue}, 100%, 50%, 0.15)`);
                        grad.addColorStop(0.2, `hsla(${(baseHue + 60) % 360}, 100%, 50%, 0.85)`);
                        grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.98)');
                        grad.addColorStop(0.8, `hsla(${(baseHue + 180) % 360}, 100%, 50%, 0.85)`);
                        grad.addColorStop(1, `hsla(${(baseHue + 240) % 360}, 100%, 50%, 0.15)`);

                        ctx.fillStyle = grad;
                        ctx.fillRect(-b.radius, 0, b.radius * 2, 1200);

                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(-b.radius * 0.35, 0, b.radius * 0.7, 1200);

                        // 飛び散る七色スパーク粒子の量を少し増量して豪華に！
                        for (let k = 0; k < 4; k++) {
                            let sparkX = (Math.random() - 0.5) * b.radius * 2.5;
                            let sparkY = Math.random() * 1200;
                            ctx.fillStyle = `hsla(${Math.random() * 360}, 100%, 75%, 0.95)`;
                            ctx.beginPath();
                            ctx.arc(sparkX, sparkY, 4 + Math.random() * 7, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    }
                    ctx.restore();
                } else if (b.isWarningLaser && b.bulletState) {
                    // 予告線（ガイドライン）の描画 - 東方STG風
                    ctx.save();
                    let rad = (b.bulletState.variables.angle || 0) * Math.PI / 180;
                    if (b.bulletState.isPlayerSide) {
                        rad = -rad;
                    }
                    let x2 = b.x + Math.cos(rad) * 1200;
                    let y2 = b.y + Math.sin(rad) * 1200;
                    
                    let warnT = parseFloat(b.bulletState.variables.warningTime) || 1.0;
                    let laserStart = b.bulletState.variables.laserStartTime || 0;
                    let elapsed = Math.max(0, b.bulletState.variables.timer - laserStart);
                    let progress = Math.min(1.0, elapsed / warnT);
                    let laserWidth = getLaserWidth(b);
                    
                    // パルス（点滅）効果
                    let pulse = 0.5 + 0.5 * Math.sin(performance.now() / 80);
                    let lineAlpha = (0.15 + 0.25 * progress) * (0.6 + 0.4 * pulse);
                    
                    // 弾の色のグロー
                    ctx.shadowBlur = (6 + 4 * pulse) * blurScale;
                    ctx.shadowColor = b.color || '#ff3333';
                    ctx.strokeStyle = `rgba(255, 255, 255, ${lineAlpha})`;
                    ctx.lineWidth = Math.max(1.5, laserWidth * 0.12);
                    ctx.beginPath();
                    ctx.moveTo(b.x, b.y);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                    
                    // 射出位置に小さなチャージ円（progress に応じて拡大）
                    let ringR = 3 + 5 * progress + pulse * 2;
                    ctx.strokeStyle = b.color || '#ff3333';
                    ctx.lineWidth = 1.5;
                    ctx.globalAlpha = 0.5 + 0.5 * progress;
                    ctx.beginPath();
                    ctx.arc(b.x, b.y, ringR, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.globalAlpha = 1.0;
                    ctx.restore();
                } else if (b.isLaser) {
                    ctx.save();
                    if (b.isCustomBeam && b.bulletState) {
                        // 設置ビーム（ビーム状レーザー）の描画 - 東方STG風
                        let rad = (b.bulletState.variables.angle || 0) * Math.PI / 180;
                        if (b.bulletState.isPlayerSide) {
                            rad = -rad;
                        }
                        let x2 = b.x + Math.cos(rad) * 1200;
                        let y2 = b.y + Math.sin(rad) * 1200;
                        
                        let laserStart = b.bulletState.variables.laserStartTime || 0;
                        let elapsed = b.bulletState.variables.timer - laserStart - parseFloat(b.bulletState.variables.warningTime);
                        let actT = parseFloat(b.bulletState.variables.activeTime) || 1.0;
                        let laserWidth = getLaserWidth(b);
                        
                        // アニメーション：開始0.08秒で太くなり、終了前0.15秒で細くなる
                        let widthFactor = 1.0;
                        if (elapsed < 0.08) {
                            widthFactor = elapsed / 0.08;
                        } else {
                            let timeLeft = actT - elapsed;
                            if (timeLeft < 0.15) {
                                widthFactor = Math.max(0, timeLeft / 0.15);
                            }
                        }
                        
                        // 外側：弾の色で発光する広めのグロー
                        ctx.shadowBlur = 18 * blurScale;
                        ctx.shadowColor = b.color || '#ff3333';
                        ctx.strokeStyle = b.color || '#ff3333';
                        ctx.lineWidth = Math.max(0.1, laserWidth * widthFactor);
                        ctx.globalAlpha = 0.5;
                        ctx.lineCap = 'butt';
                        ctx.beginPath();
                        ctx.moveTo(b.x, b.y);
                        ctx.lineTo(x2, y2);
                        ctx.stroke();
                        
                        // 内側：細い白いコア
                        ctx.shadowBlur = 8 * blurScale;
                        ctx.shadowColor = '#ffffff';
                        ctx.strokeStyle = '#ffffff';
                        ctx.lineWidth = Math.max(0.1, laserWidth * 0.42 * widthFactor);
                        ctx.globalAlpha = 1.0;
                        ctx.beginPath();
                        ctx.moveTo(b.x, b.y);
                        ctx.lineTo(x2, y2);
                        ctx.stroke();
                        
                        ctx.shadowBlur = 0;
                        ctx.globalAlpha = 1.0;
                    } else {
                        // 通常の移動レーザーの描画
                        let speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
                        let dx = b.vx / (speed || 1);
                        let dy = b.vy / (speed || 1);
                        let len = 80;
                        
                        ctx.shadowBlur = 12 * blurScale;
                        ctx.shadowColor = b.color || '#00ffff';
                        ctx.strokeStyle = '#ffffff';
                        ctx.lineWidth = Math.max(0.1, getLaserWidth(b) * 0.5); // 移動レーザーは少し細め
                        ctx.lineCap = 'round';
                        
                        ctx.beginPath();
                        ctx.moveTo(b.x, b.y);
                        ctx.lineTo(b.x - dx * len, b.y - dy * len);
                        ctx.stroke();
                        
                        ctx.shadowBlur = 0;
                    }
                    ctx.restore();
                } else if (b.isGungnir) {
                    ctx.save();
                    ctx.translate(b.x, b.y);
                    if (b.state === 0) {
                        let angle = Math.atan2(b.vy, b.vx);
                        ctx.rotate(angle);

                        ctx.fillStyle = 'rgba(255, 10, 10, 0.2)';
                        ctx.beginPath();
                        ctx.moveTo(90, 0);
                        ctx.lineTo(-65, -45);
                        ctx.lineTo(-65, 45);
                        ctx.closePath();
                        ctx.fill();

                        ctx.fillStyle = 'rgba(255, 30, 30, 0.45)';
                        ctx.beginPath();
                        ctx.moveTo(80, 0);
                        ctx.lineTo(-55, -35);
                        ctx.lineTo(-55, 35);
                        ctx.closePath();
                        ctx.fill();

                        ctx.fillStyle = '#ff1111';
                        ctx.beginPath();
                        ctx.moveTo(70, 0);
                        ctx.lineTo(-45, -16);
                        ctx.lineTo(-45, 16);
                        ctx.closePath();
                        ctx.fill();

                        ctx.fillStyle = '#ffffff';
                        ctx.beginPath();
                        ctx.moveTo(55, 0);
                        ctx.lineTo(-30, -6);
                        ctx.lineTo(-30, 6);
                        ctx.closePath();
                        ctx.fill();
                    } else if (b.state === 1) {
                        let grad = ctx.createRadialGradient(0, 0, 0, 0, 0, b.radius);
                        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
                        grad.addColorStop(0.2, 'rgba(255, 50, 50, 0.9)');
                        grad.addColorStop(0.7, 'rgba(255, 0, 0, 0.4)');
                        grad.addColorStop(1, 'rgba(255, 0, 0, 0)');
                        ctx.fillStyle = grad;
                        ctx.beginPath();
                        ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    ctx.restore();
                } else if (b.isNormal && b.team === 'PLAYER') {
                    ctx.save();
                    ctx.translate(b.x, b.y);
                    ctx.rotate(Math.atan2(b.vy, b.vx) + Math.PI / 2);
                    let w = 8, h = 16;
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(-w / 2, -h / 2, w, h);
                    ctx.strokeStyle = '#aaaa88';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(-w / 2, -h / 2, w, h);
                    ctx.restore();
                } else if (b.isSweeper) {
                    ctx.fillStyle = b.color; ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2); ctx.fill();
                    let grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius);
                    grad.addColorStop(0, 'rgba(0, 100, 255, 0)');
                    grad.addColorStop(0.5, 'rgba(0, 100, 255, 0)');
                    grad.addColorStop(0.75, 'rgba(0, 100, 255, 0.6)');
                    grad.addColorStop(0.8, 'rgba(255, 255, 255, 0.9)');
                    grad.addColorStop(1, 'rgba(255, 255, 255, 1)');

                    ctx.fillStyle = grad;
                    ctx.beginPath(); ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2); ctx.fill();
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'; ctx.lineWidth = 1; ctx.stroke();
                } else if (b.isStar) {
                    ctx.save();
                    ctx.translate(b.x, b.y);
                    let rotAngle = (performance.now() * 0.005) + (b.x * 0.05);
                    ctx.rotate(rotAngle);
                    let drawRadius = b.radius * 1.6;
                    let color = b.color || (b.team === 'PLAYER' ? '#55aaff' : '#ff4444');
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    for (let i = 0; i < 10; i++) {
                        let r = (i % 2 === 0) ? drawRadius : drawRadius * 0.45;
                        let a = (Math.PI * 2 / 10) * i - Math.PI / 2;
                        if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
                        else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
                    }
                    ctx.closePath();
                    ctx.fill();
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath(); ctx.arc(0, 0, drawRadius * 0.3, 0, Math.PI * 2); ctx.fill();

                    ctx.restore();
                } else if (b.bulletImage === 'light') {
                    // 光弾の実体（白い円、コア）の描画
                    let drawRadius = b.radius * 1.2;
                    ctx.save();
                    ctx.fillStyle = '#ffffff'; // 中央は白固定
                    ctx.beginPath();
                    ctx.arc(b.x, b.y, drawRadius, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                } else {
                    let drawRadius = b.radius * 1.5;
                    if (b.bulletImage && b.bulletImage !== 'none') {
                        // オフスクリーンCanvasキャッシュから着色済みテクスチャを取得
                        if (!window.bulletTextureCache) window.bulletTextureCache = {};
                        const cacheKey = `${b.bulletImage}_${b.color || '#ff3333'}`;
                        let texture = window.bulletTextureCache[cacheKey];
                        
                        if (!texture) {
                            const baseImg = (window.bulletImages) ? window.bulletImages[b.bulletImage] : null;
                            if (baseImg && baseImg.complete && baseImg.naturalWidth > 0) {
                                const offscreen = document.createElement('canvas');
                                const w = baseImg.naturalWidth;
                                const h = baseImg.naturalHeight;
                                offscreen.width = w;
                                offscreen.height = h;
                                const oCtx = offscreen.getContext('2d');
                                
                                // 色相計算
                                let colorStr = b.color || '#ff3333';
                                let [rInt, gInt, bInt] = parseColorToRgb(colorStr);
                                let r = rInt / 255, g = gInt / 255, bVal = bInt / 255;
                                
                                let isMonochrome = (Math.abs(r - g) < 0.05 && Math.abs(g - bVal) < 0.05);
                                if (isMonochrome) {
                                    let brightness = (r + g + bVal) / 3;
                                    if (brightness > 0.9) {
                                        oCtx.filter = 'grayscale(1) brightness(2.0) contrast(1.5)';
                                    } else if (brightness < 0.08) {
                                        oCtx.filter = 'brightness(0)';
                                    } else {
                                        oCtx.filter = `grayscale(1) brightness(${brightness * 1.5}) contrast(1.2)`;
                                    }
                                } else {
                                    let max = Math.max(r, g, bVal), min = Math.min(r, g, bVal);
                                    if (max !== min) {
                                        let d = max - min;
                                        switch (max) {
                                            case r: hue = (g - bVal) / d + (g < bVal ? 6 : 0); break;
                                            case g: hue = (bVal - r) / d + 2; break;
                                            case bVal: hue = (r - g) / d + 4; break;
                                        }
                                        hue = Math.round((hue / 6) * 360);
                                    }
                                    oCtx.filter = `hue-rotate(${hue}deg)`;
                                }
                                oCtx.drawImage(baseImg, 0, 0, w, h);
                                window.bulletTextureCache[cacheKey] = offscreen;
                                texture = offscreen;
                            }
                        }

                        if (texture) {
                            ctx.save();
                            ctx.translate(b.x, b.y);
                            
                            // spriteAngleが定義されている場合はその絶対角度、なければ進行方向の角度を使用
                            let angle;
                            if (b.bulletState && b.bulletState.variables && b.bulletState.variables.spriteAngle !== undefined && b.bulletState.variables.spriteAngle !== null) {
                                let spriteAngleRad = (Number(b.bulletState.variables.spriteAngle) || 0) * Math.PI / 180;
                                if (b.bulletState.isPlayerSide) {
                                    spriteAngleRad = -spriteAngleRad;
                                }
                                angle = spriteAngleRad + Math.PI / 2;
                            } else {
                                angle = Math.atan2(b.vy, b.vx) + Math.PI / 2;
                            }
                            ctx.rotate(angle);
                            ctx.drawImage(texture, -drawRadius, -drawRadius, drawRadius * 2, drawRadius * 2);
                            ctx.restore();
                        } else {
                            let color = b.color || (b.team === 'PLAYER' ? '#55aaff' : '#ff4444');
                            ctx.fillStyle = color;
                            ctx.beginPath(); ctx.arc(b.x, b.y, drawRadius, 0, Math.PI * 2); ctx.fill();
                        }
                    } else {
                        let color = b.color || (b.team === 'PLAYER' ? '#55aaff' : '#ff4444');
                        ctx.fillStyle = color;
                        ctx.beginPath(); ctx.arc(b.x, b.y, drawRadius, 0, Math.PI * 2); ctx.fill();
                    }
                }

                // デバッグ用当たり判定の描画（Dキー押下時）
                if (window.debugShowHitboxes) {
                    let bHitR = b.isLaser ? getLaserWidth(b) / 2 : (b.hitRadius !== undefined ? b.hitRadius : b.radius);
                    ctx.save();
                    if (b.isLaser) {
                        let x1 = b.x;
                        let y1 = b.y;
                        let x2, y2;
                        if (b.isCustomBeam && b.bulletState) {
                            let rad = (b.bulletState.variables.angle || 0) * Math.PI / 180;
                            if (b.bulletState.isPlayerSide) rad = -rad;
                            x2 = b.x + Math.cos(rad) * 1200;
                            y2 = b.y + Math.sin(rad) * 1200;
                        } else {
                            let speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
                            let dx = b.vx / (speed || 1);
                            let dy = b.vy / (speed || 1);
                            let len = 80;
                            x2 = b.x - dx * len;
                            y2 = b.y - dy * len;
                        }
                        ctx.beginPath();
                        ctx.moveTo(x1, y1);
                        ctx.lineTo(x2, y2);
                        ctx.lineWidth = bHitR * 2;
                        ctx.strokeStyle = 'rgba(0, 255, 0, 0.4)';
                        ctx.stroke();
                    } else if (b.bulletImage === 'sword') {
                        ctx.strokeStyle = '#00ff00';
                        ctx.lineWidth = 1.5;
                        ctx.fillStyle = 'rgba(0, 255, 0, 0.35)';
                        
                        let speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
                        let dx = b.vx / (speed || 1);
                        let dy = b.vy / (speed || 1);
                        let step = bHitR * 1.3;
                        
                        for (let k = 0; k <= 4; k++) {
                            let cx = b.x + dx * (k * step);
                            let cy = b.y + dy * (k * step);
                            ctx.beginPath();
                            ctx.arc(cx, cy, bHitR, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.stroke();
                        }
                    } else {
                        ctx.strokeStyle = '#00ff00';
                        ctx.lineWidth = 1.5;
                        ctx.fillStyle = 'rgba(0, 255, 0, 0.35)';
                        ctx.beginPath();
                        ctx.arc(b.x, b.y, bHitR, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.stroke();
                    }
                    ctx.restore();
                }
            });
            window.perfDrawB = performance.now() - tDrawBStart;

            // 魔法陣（Magic Circles）の描画
            magicCircles.forEach(mc => {
                ctx.save();
                
                // 外側リング
                let pulse = 1 + 0.05 * Math.sin(performance.now() / 120 + mc.x);
                let angle = (performance.now() * 0.001) % (Math.PI * 2);
                
                ctx.strokeStyle = mc.color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(mc.x, mc.y, mc.radius * pulse, 0, Math.PI * 2);
                ctx.stroke();
                
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(mc.x, mc.y, mc.radius * pulse * 0.85, 0, Math.PI * 2);
                ctx.stroke();
                
                ctx.translate(mc.x, mc.y);
                ctx.rotate(angle);
                ctx.shadowBlur = 0;
                
                // 六角星の描画
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    let a1 = (Math.PI / 3) * i;
                    let a2 = (Math.PI / 3) * (i + 2);
                    let x1 = Math.cos(a1) * mc.radius * 0.75;
                    let y1 = Math.sin(a1) * mc.radius * 0.75;
                    let x2 = Math.cos(a2) * mc.radius * 0.75;
                    let y2 = Math.sin(a2) * mc.radius * 0.75;
                    if (i === 0) ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                }
                ctx.strokeStyle = mc.color;
                ctx.lineWidth = 1;
                ctx.stroke();
                
                // 内側の小さな円
                ctx.beginPath();
                ctx.arc(0, 0, mc.radius * 0.4, 0, Math.PI * 2);
                ctx.stroke();
                
                ctx.restore();
            });

            // 自機の描画
            let pImg = reimuImg_idle;
            let pFlipX = false;
 
            if (inputState.left) { pImg = reimuImg_left; }
            else if (inputState.right) { pImg = reimuImg_left; pFlipX = true; }
            else { pImg = reimuImg_idle; } // 待機または上下移動
 
            const animIndex = Math.floor(performance.now() / 150) % 4;
            const drawW = 48, drawH = 48;
 
            let showPlayer = true;
            if (isCustomCardTesting && typeof window.playerInvincibleTimer === 'number' && window.playerInvincibleTimer > 0) {
                showPlayer = (Math.floor(performance.now() / 80) % 2 === 0);
            }
 
            if (showPlayer) {
                ctx.save();
                ctx.translate(player.x, player.y);
                if (pFlipX) ctx.scale(-1, 1);
                if (pImg && pImg.complete && pImg.naturalWidth > 0 && pImg.src.indexOf("dummy") === -1) {
                    let spriteW = pImg.naturalWidth >= 192 ? 48 : pImg.naturalWidth;
                    let spriteH = pImg.naturalHeight >= 48 ? 48 : pImg.naturalHeight;
                    let srcX = (pImg.naturalWidth >= 192) ? animIndex * 48 : 0;
                    ctx.drawImage(pImg, srcX, 0, spriteW, spriteH, -drawW / 2, -drawH / 2, drawW, drawH);
                } else {
                    ctx.fillStyle = '#888888';
                    ctx.fillRect(-12, -16, 24, 32);
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 12px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText("自機", 0, 0);
                }
                ctx.restore();
            }

            // 霊撃（ボム）の描画
            activeReigekis.forEach(r => {
                ctx.save();
                let isPlayer = r.team === 'PLAYER';
                let grad = ctx.createRadialGradient(r.x, r.y, r.radius * 0.4, r.x, r.y, r.radius);
                if (isPlayer) {
                    grad.addColorStop(0, 'rgba(0, 255, 120, 0)');
                    grad.addColorStop(0.7, 'rgba(0, 255, 150, 0.15)');
                    grad.addColorStop(0.9, 'rgba(0, 255, 180, 0.45)');
                    grad.addColorStop(1, 'rgba(200, 255, 220, 0.8)');
                } else {
                    grad.addColorStop(0, 'rgba(255, 0, 80, 0)');
                    grad.addColorStop(0.7, 'rgba(255, 50, 100, 0.15)');
                    grad.addColorStop(0.9, 'rgba(255, 80, 120, 0.45)');
                    grad.addColorStop(1, 'rgba(255, 200, 220, 0.8)');
                }

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = isPlayer ? 'rgba(150, 255, 200, 0.7)' : 'rgba(255, 150, 180, 0.7)';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
                ctx.stroke();

                let spellCount = 8;
                for (let k = 0; k < spellCount; k++) {
                    let spellAngle = (r.timer * 3) + (Math.PI * 2 / spellCount) * k;
                    let sx = r.x + Math.cos(spellAngle) * (r.radius * 0.8);
                    let sy = r.y + Math.sin(spellAngle) * (r.radius * 0.8);

                    ctx.save();
                    ctx.translate(sx, sy);
                    ctx.rotate(spellAngle + Math.PI / 2);

                    if (isPlayer) {
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(-4, -9, 8, 18);
                        ctx.strokeStyle = '#ff3333';
                        ctx.lineWidth = 1;
                        ctx.strokeRect(-4, -9, 8, 18);

                        ctx.fillStyle = '#ff3333';
                        ctx.fillRect(-2, -5, 4, 10);
                    } else {
                        ctx.fillStyle = '#ffbbee';
                        ctx.beginPath();
                        ctx.ellipse(0, 0, 5, 8, 0, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.strokeStyle = '#ff66aa';
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                    ctx.restore();
                }
                ctx.restore();
            });

            // オプション（陰陽玉）の描画
            let bCount = player.bombs;
            if (bCount >= 2) {
                player.optionAngle = (player.optionAngle || 0) + 0.05;
                let optionCount = bCount - 1;
                if (bCount >= 4) optionCount = 4;

                for (let k = 0; k < optionCount; k++) {
                    let angle = player.optionAngle + (Math.PI * 2 / optionCount) * k;
                    let radius = 24;
                    let ox = player.x + Math.cos(angle) * radius;
                    let oy = player.y + Math.sin(angle) * radius + 5;

                    ctx.save();
                    ctx.translate(ox, oy);
                    ctx.rotate(angle * 2);

                    ctx.beginPath();
                    ctx.arc(0, 0, 6, 0, Math.PI * 2);
                    ctx.fillStyle = '#ffffff';
                    ctx.fill();
                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 1;
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.arc(0, 0, 6, -Math.PI / 2, Math.PI / 2);
                    ctx.fillStyle = '#000000';
                    ctx.fill();

                    ctx.beginPath();
                    ctx.arc(0, -3, 3, 0, Math.PI * 2);
                    ctx.fillStyle = '#000000';
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(0, 3, 3, 0, Math.PI * 2);
                    ctx.fillStyle = '#ffffff';
                    ctx.fill();
                    ctx.restore();
                }
            }

            // 低速移動（Shiftキー）押下時のみグレイズ範囲を表示
            if (inputState.slow) {
                ctx.beginPath();
                ctx.arc(player.x, player.y, player.grazeRadius, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // 自機の当たり判定（白と枠線の色の逆転＆赤・青切り替え）
            if (showPlayer) {
                let outerColor = (window.hitboxColorSetting === 'blue') ? '#0088ff' : 'red';
                ctx.beginPath();
                ctx.arc(player.x, player.y, player.hitboxRadius + 1.5, 0, Math.PI * 2);
                ctx.fillStyle = 'white';
                ctx.fill();
                ctx.strokeStyle = outerColor;
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            // 耐えた時の小さな爆発エフェクトの描画
            if (isCustomCardTesting && window.miniExplosionEffect) {
                window.miniExplosionEffect.forEach(p => {
                    ctx.save();
                    ctx.globalAlpha = p.alpha;
                    ctx.fillStyle = p.color || 'white';
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                });
            }

            // 耐えた時の衝撃波（波紋）の描画
            if (isCustomCardTesting && window.miniExplosionShockwave) {
                ctx.save();
                let sw = window.miniExplosionShockwave;
                let alpha = Math.max(0, sw.life / 0.5);
                ctx.globalAlpha = alpha;
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 3;
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#00ffff';
                ctx.beginPath();
                ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }

            // 敵機の描画
            let cImg;
            if (cpu.moveDir === -1) { cImg = youmuImg_left; }
            else if (cpu.moveDir === 1) { cImg = youmuImg_right; }
            else { cImg = youmuImg_idle; }

            const cpuAnimIndex = Math.floor(performance.now() / 150) % 4;
            const cpuDrawW = 48, cpuDrawH = 48;

            ctx.save();
            ctx.translate(cpu.x, cpu.y);
            if (cImg && cImg.complete && cImg.naturalWidth > 0 && cImg.src.indexOf("dummy") === -1) {
                let spriteW = cImg.naturalWidth >= 192 ? 48 : cImg.naturalWidth;
                let spriteH = cImg.naturalHeight >= 48 ? 48 : cImg.naturalHeight;
                let srcX = (cImg.naturalWidth >= 192) ? cpuAnimIndex * 48 : 0;
                ctx.drawImage(cImg, srcX, 0, spriteW, spriteH, -cpuDrawW / 2, -cpuDrawH / 2, cpuDrawW, cpuDrawH);
            } else {
                ctx.fillStyle = '#ff5555';
                ctx.fillRect(-12, -16, 24, 32);
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 12px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText("敵機", 0, 0);
            }
            ctx.restore();

            ctx.beginPath(); ctx.arc(cpu.x, cpu.y, cpu.hitboxRadius + 1.5, 0, Math.PI * 2);
            ctx.fillStyle = cpu.isSlow ? '#ff00ff' : '#aa44ff'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();

            ctx.beginPath(); ctx.arc(cpu.x, cpu.y, cpu.grazeRadius, 0, Math.PI * 2);
            ctx.strokeStyle = cpu.isSlow ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.2)'; ctx.lineWidth = 1; ctx.stroke();

            // 霊撃カットイン
            if (reigekiCutinTimer > 0) {
                ctx.save();
                ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
                ctx.fillRect(0, canvas.height / 2 - 60, PLAY_WIDTH, 120);

                let isPlayer = reigekiCutinOwner === 'PLAYER';
                ctx.strokeStyle = isPlayer ? 'rgba(0, 255, 150, 0.8)' : 'rgba(255, 50, 100, 0.8)';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(0, canvas.height / 2 - 60);
                ctx.lineTo(PLAY_WIDTH, canvas.height / 2 - 60);
                ctx.moveTo(0, canvas.height / 2 + 60);
                ctx.lineTo(PLAY_WIDTH, canvas.height / 2 + 60);
                ctx.stroke();

                ctx.shadowColor = isPlayer ? 'rgba(0, 255, 120, 0.8)' : 'rgba(255, 50, 100, 0.8)';
                ctx.shadowBlur = 15;
                ctx.fillStyle = '#ffffff';
                ctx.font = "italic bold 36px 'Noto Serif JP', serif";
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(isPlayer ? '霊 撃 展開' : '敵 霊 撃 展開', PLAY_WIDTH / 2, canvas.height / 2 - 10);

                ctx.shadowBlur = 8;
                ctx.fillStyle = isPlayer ? '#ffdd33' : '#ff55aa';
                ctx.font = "bold 16px sans-serif";
                ctx.fillText(isPlayer ? '- REIGEKI CASTING -' : '- ENEMY REIGEKI CASTING -', PLAY_WIDTH / 2, canvas.height / 2 + 25);
                ctx.restore();
            }

            // バトルエフェクトの描画
            if (activeEffects.length > 0) {
                ctx.save();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                activeEffects.forEach((eff, idx) => {
                    let alpha = Math.min(1, eff.timer / 0.5); // フェードアウト
                    if (eff.timer > eff.maxTime - 0.3) {
                        alpha = Math.min(1, (eff.maxTime - eff.timer) / 0.3); // フェードイン
                    }
                    ctx.fillStyle = eff.color;
                    ctx.globalAlpha = alpha;
                    ctx.font = "bold 16px sans-serif";

                    // 重ならないようにずらす。かつ、徐々に上にスライドする
                    let slideY = (eff.maxTime - eff.timer) * 35;
                    let yPos = canvas.height / 2 - 100 - idx * 24 - slideY;

                    ctx.shadowColor = 'rgba(0,0,0,0.8)';
                    ctx.shadowBlur = 4;
                    ctx.fillText(eff.text, PLAY_WIDTH / 2, yPos);
                });
                ctx.restore();
            }

            if (isCustomCardTesting) {
                ctx.save();
                if (customCardTestEmitterDone && window.showDebugProfiler) {
                    // 弾消滅待ちフェーズ
                    ctx.fillStyle = 'rgba(0, 180, 255, 0.2)';
                    ctx.fillRect(0, 0, PLAY_WIDTH, 40);
                    ctx.strokeStyle = 'rgba(0, 180, 255, 0.6)';
                    ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.moveTo(0, 40); ctx.lineTo(PLAY_WIDTH, 40); ctx.stroke();
                    ctx.fillStyle = '#00cfff';
                    ctx.font = "bold 14px 'Noto Serif JP', sans-serif";
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(`◆ 弾消滅待ち… 残り${bullets.length}発 (全弾が消えたらクリア) ◆`, PLAY_WIDTH / 2, 20);
                    
                    if (bullets.length > 0) {
                        ctx.fillStyle = '#ffffff';
                        ctx.font = "10px monospace";
                        let first = bullets[0];
                        let stateText = `x:${first.x ? first.x.toFixed(1) : 'null'} y:${first.y ? first.y.toFixed(1) : 'null'} vx:${first.vx ? first.vx.toFixed(1) : 'null'} vy:${first.vy ? first.vy.toFixed(1) : 'null'} isL:${first.isLaser} isW:${first.isWarningLaser} isCB:${first.isCustomBeam}`;
                        if (first.bulletState) {
                            let vars = first.bulletState.variables;
                            stateText += ` timer:${vars.timer.toFixed(1)} warn:${vars.warningTime} active:${vars.activeTime}`;
                        }
                        ctx.fillText(stateText, PLAY_WIDTH / 2, 35);
                    }
                } else {
                    // 自作弾幕テストプレイ中の上部バナー表示を非表示にする
                }
                ctx.restore();
            }

            ctx.restore(); // 画面揺れ用のカメラ状態復元（右側UI描画の前に揺れを停止）

            // ── スペルカード名を左上に表示 ──────────────────────────────
            if (gameState === 'BATTLE' && activeCards && activeCards[0]) {
                ctx.save();
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                ctx.font = "italic bold 16px 'Noto Serif JP', sans-serif";
                // テキストのシャドウ（視認性向上）
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillText(activeCards[0].name, 12, 12);
                // 金〜白のグラデーション
                let grad = ctx.createLinearGradient(10, 10, 10, 26);
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(1, '#ffe066');
                ctx.fillStyle = grad;
                ctx.fillText(activeCards[0].name, 10, 10);
                ctx.restore();
            }

            // ── 残り時間を右上に表示 ──────────────────────────────
            if (isCustomCardTesting && !customCardTestEmitterDone) {
                let t = Math.max(0, actionTimer);
                ctx.save();
                ctx.textAlign = 'right';
                ctx.textBaseline = 'top';
                // 残り5秒以下で赤く点滅
                if (t <= 5) {
                    let blink = 0.6 + 0.4 * Math.sin(performance.now() / 120);
                    ctx.globalAlpha = blink;
                    ctx.fillStyle = '#ff4444';
                } else {
                    ctx.fillStyle = '#ffffff';
                }
                // 背景パネル
                ctx.fillStyle = t <= 5 ? 'rgba(180,0,0,0.45)' : 'rgba(0,0,0,0.45)';
                ctx.fillRect(PLAY_WIDTH - 90, 6, 84, 36);
                // 文字
                ctx.globalAlpha = t <= 5 ? (0.6 + 0.4 * Math.sin(performance.now() / 120)) : 1.0;
                ctx.fillStyle = t <= 5 ? '#ff6666' : '#ffffff';
                ctx.font = 'bold 26px monospace';
                ctx.fillText(t.toFixed(1) + 's', PLAY_WIDTH - 10, 10);
                ctx.globalAlpha = 1.0;
                ctx.restore();
            }

            // ── ライフ（被弾耐性）を右上に表示 ──────────────────────────────
            if (isCustomCardTesting && !customCardTestEmitterDone) {
                let missCount = typeof window.playerMissCount === 'number' ? window.playerMissCount : 0;
                let lives = Math.max(0, 2 - missCount);
                
                ctx.save();
                ctx.textAlign = 'right';
                ctx.textBaseline = 'top';
                
                // 背景パネル
                ctx.fillStyle = 'rgba(0,0,0,0.45)';
                ctx.fillRect(PLAY_WIDTH - 90, 48, 84, 24);
                
                // 文字
                ctx.fillStyle = lives === 0 ? '#ff4444' : '#ff99bb';
                ctx.font = 'bold 14px sans-serif';
                let starText = '';
                for (let li = 0; li < lives; li++) starText += '★';
                if (starText === '') starText = '無残機';
                ctx.fillText(starText, PLAY_WIDTH - 12, 53);
                
                ctx.restore();
            }

            // ── 死亡エフェクト描画 ───────────────────────────────
            if (isCustomCardTesting && customCardDeathEffect) {
                ctx.save();
                // パーティクル
                customCardDeathEffect.particles.forEach(p => {
                    ctx.globalAlpha = p.alpha * 0.9;
                    ctx.fillStyle = `hsl(${p.hue}, 100%, 65%)`;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    ctx.fill();
                });
                // 「FAILED」テキスト（エフェクト開始から0.5秒後にフェードイン）
                let elapsed = 3.0 - customCardDeathEffect.timer;
                let textAlpha = Math.min(1.0, Math.max(0, (elapsed - 0.4) / 0.3));
                if (textAlpha > 0) {
                    ctx.globalAlpha = textAlpha;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    // 影
                    ctx.fillStyle = 'rgba(0,0,0,0.7)';
                    ctx.font = 'bold 72px sans-serif';
                    ctx.fillText('FAILED', PLAY_WIDTH / 2 + 3, canvas.height / 2 + 3);
                    // 本体（赤グラデ）
                    let grad = ctx.createLinearGradient(0, canvas.height/2 - 40, 0, canvas.height/2 + 40);
                    grad.addColorStop(0, '#ff8888');
                    grad.addColorStop(1, '#cc0000');
                    ctx.fillStyle = grad;
                    ctx.fillText('FAILED', PLAY_WIDTH / 2, canvas.height / 2);
                    // 残り秒数
                    ctx.font = 'bold 20px sans-serif';
                    ctx.fillStyle = '#ffaaaa';
                    ctx.fillText(Math.ceil(customCardDeathEffect.timer) + '秒後に終了...', PLAY_WIDTH / 2, canvas.height / 2 + 55);
                }
                ctx.globalAlpha = 1.0;
                ctx.restore();
            }

            // ── クリアエフェクト描画 ───────────────────────────────
            if (isCustomCardTesting && window.customCardClearEffect) {
                ctx.save();
                // 虹色の紙吹雪（パーティクル）
                window.customCardClearEffect.particles.forEach(p => {
                    ctx.globalAlpha = p.alpha * 0.9;
                    ctx.fillStyle = `hsl(${p.hue}, 100%, 65%)`;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                    ctx.fill();
                });
                
                // 「SPELL CARD CLEAR!」テキスト（エフェクト開始から0.3秒でフェードイン）
                let elapsed = window.customCardClearEffect.elapsed || 0;
                let textAlpha = Math.min(1.0, Math.max(0, (elapsed - 0.3) / 0.3));
                if (textAlpha > 0) {
                    ctx.globalAlpha = textAlpha;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    
                    // 背景の帯状の半透明パネル
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
                    ctx.fillRect(0, canvas.height / 2 - 85, PLAY_WIDTH, 200);
                    
                    // 影
                    ctx.fillStyle = 'rgba(0,0,0,0.85)';
                    ctx.font = "italic bold 34px sans-serif";
                    ctx.fillText('SPELL CARD', PLAY_WIDTH / 2 + 2, canvas.height / 2 - 30 + 2);
                    ctx.font = "italic bold 56px sans-serif";
                    ctx.fillText('CLEAR!', PLAY_WIDTH / 2 + 3, canvas.height / 2 + 25 + 3);
                    
                    // 本体（金色の文字グラデーション）
                    let gradText = ctx.createLinearGradient(0, canvas.height / 2 - 50, 0, canvas.height / 2 + 50);
                    gradText.addColorStop(0, '#ffe066');
                    gradText.addColorStop(0.5, '#f5b041');
                    gradText.addColorStop(1, '#d35400');
                    ctx.fillStyle = gradText;
                    
                    ctx.font = "italic bold 34px sans-serif";
                    ctx.fillText('SPELL CARD', PLAY_WIDTH / 2, canvas.height / 2 - 30);
                    ctx.font = "italic bold 56px sans-serif";
                    ctx.fillText('CLEAR!', PLAY_WIDTH / 2, canvas.height / 2 + 25);

                    // ミス数（被弾数）の表示
                    let missCount = typeof window.playerMissCount === 'number' ? window.playerMissCount : 0;
                    ctx.fillStyle = 'rgba(0,0,0,0.85)';
                    ctx.font = 'bold 20px sans-serif';
                    ctx.fillText('Miss: ' + missCount, PLAY_WIDTH / 2 + 1.5, canvas.height / 2 + 70 + 1.5);
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 20px sans-serif';
                    ctx.fillText('Miss: ' + missCount, PLAY_WIDTH / 2, canvas.height / 2 + 70);
                    
                    // タップ数インジケーター（5回でエディタに戻る）
                    let tapCount = window.customCardClearEffect.tapCount || 0;
                    let remaining = 5 - tapCount;
                    ctx.fillStyle = '#aaffaa';
                    ctx.font = 'bold 16px sans-serif';
                    ctx.fillText('タップして戻る (' + tapCount + '/5)', PLAY_WIDTH / 2, canvas.height / 2 + 105);
                    // ●の連打インジケーター
                    let dotSpacing = 22;
                    let dotStartX = PLAY_WIDTH / 2 - dotSpacing * 2;
                    for (let di = 0; di < 5; di++) {
                        ctx.globalAlpha = textAlpha;
                        ctx.beginPath();
                        ctx.arc(dotStartX + di * dotSpacing, canvas.height / 2 + 130, 7, 0, Math.PI * 2);
                        ctx.fillStyle = di < tapCount ? '#ffe066' : 'rgba(255,255,255,0.25)';
                        ctx.fill();
                    }
                }
                ctx.globalAlpha = 1.0;
                ctx.restore();
            }

            // 右側UI領域の描画
            if (canvas.width > PLAY_WIDTH) {
                const UI_X = PLAY_WIDTH + 20;
                ctx.fillStyle = '#222';
                ctx.fillRect(PLAY_WIDTH, 0, canvas.width - PLAY_WIDTH, canvas.height);

                // クリア・死亡エフェクト進行中は右側UIのテキストやライフバーを非表示にする
                if (isCustomCardTesting && (customCardDeathEffect || window.customCardClearEffect)) {
                    return;
                }

                ctx.strokeStyle = '#555';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(PLAY_WIDTH, 0);
                ctx.lineTo(PLAY_WIDTH, canvas.height);
                ctx.stroke();

                ctx.textAlign = 'left';

                // CPU情報
                ctx.fillStyle = '#fff';
                ctx.font = '20px sans-serif';
                ctx.fillText(isOnlineMode ? 'ENEMY' : 'CPU', UI_X, 40);

                // CPUのボム（スペル）残数表示 (星マーク) - 表示位置は 75 (HPの上)
                ctx.fillStyle = '#ff3366';
                ctx.font = 'bold 20px sans-serif';
                ctx.fillText('Spell: ', UI_X, 75);
                let cpuBombStr = '';
                for (let k = 0; k < cpu.maxBombs; k++) {
                    cpuBombStr += k < cpu.bombs ? '★' : '☆';
                }
                ctx.fillStyle = '#ff3366';
                ctx.fillText(cpuBombStr, UI_X + 60, 75);

                // CPUのHP表示 - 表示位置は 110 (逆レイアウト)
                ctx.fillStyle = cpu.hp < 300 ? '#ff5555' : '#55ff55';
                ctx.font = 'bold 24px sans-serif';
                ctx.fillText('HP: ' + Math.floor(Math.max(0, cpu.hp)), UI_X, 110);
                if (cpu.pendingDamage > 0) {
                    let t = turnCount - 1;
                    let dmgMult = Math.pow(2, (t * t + 15 * t) / 450);
                    ctx.fillStyle = '#ff5555';
                    ctx.font = '18px sans-serif';
                    ctx.fillText(`(-${Math.floor(cpu.pendingDamage * dmgMult)})`, UI_X + 120, 110);
                }

                ctx.fillStyle = '#aaffaa';
                ctx.font = '20px sans-serif';
                ctx.fillText('Graze: ' + cpu.grazeCount, UI_X, 145);

                // フェーズ・ターン情報
                ctx.fillStyle = '#fff';
                ctx.font = '20px sans-serif';
                let phaseName = battlePhase === 'PLANNING' ? '策謀' : (battlePhase === 'ACTION' ? '戦闘' : '精算');
                ctx.fillText('Phase: ' + phaseName, UI_X, 400);

                let ownerText = turnOwner === 'PLAYER' ? '自ターン' : '敵ターン';
                ctx.fillStyle = turnOwner === 'PLAYER' ? '#55ff55' : '#ff5555';
                ctx.fillText(ownerText, UI_X, 435);

                if (battlePhase === 'ACTION' || battlePhase === 'RESOLUTION') {
                    let displayTime = battlePhase === 'ACTION' ? actionTimer : resolutionTimer;
                    ctx.fillStyle = '#fff';
                    ctx.font = 'bold 28px sans-serif';
                    ctx.fillText(Math.max(0, displayTime).toFixed(1) + 's', UI_X, 475);
                }

                // プレイヤー情報
                ctx.fillStyle = '#fff';
                ctx.font = '20px sans-serif';
                ctx.fillText('PLAYER', UI_X, 765);

                // プレイヤーのHP表示 - 表示位置は 800 (位置を上げる)
                ctx.fillStyle = player.hp < 300 ? '#ff5555' : '#55ff55';
                ctx.font = 'bold 24px sans-serif';
                ctx.fillText('HP: ' + Math.floor(Math.max(0, player.hp)), UI_X, 800);
                if (player.pendingDamage > 0) {
                    let t = turnCount - 1;
                    let dmgMult = Math.pow(2, (t * t + 15 * t) / 450);
                    ctx.fillStyle = '#ff5555';
                    ctx.font = '18px sans-serif';
                    ctx.fillText(`(-${Math.floor(player.pendingDamage * dmgMult)})`, UI_X + 120, 800);
                }

                // プレイヤーのボム表示 - 表示位置は 835 (HPがあった位置)
                ctx.fillStyle = '#ffcc00';
                ctx.font = 'bold 20px sans-serif';
                ctx.fillText('Bomb: ', UI_X, 835);
                let playerBombStr = '';
                for (let k = 0; k < player.maxBombs; k++) {
                    playerBombStr += k < player.bombs ? '★' : '☆';
                }
                ctx.fillStyle = '#ffaa00';
                ctx.fillText(playerBombStr, UI_X + 65, 835);

                ctx.fillStyle = '#aaffaa';
                ctx.font = '18px sans-serif';
                ctx.fillText('Graze: ' + player.grazeCount, UI_X, 875);
            }

            // FPS表示（プレイ領域の左上）と詳細プロファイラー表示 (window.showDebugProfiler が有効な場合のみ描画)
            if (window.showDebugProfiler) {
                const fpsColor = fpsDisplay >= 55 ? '#00ff88' : fpsDisplay >= 30 ? '#ffcc00' : '#ff4444';
                ctx.font = 'bold 11px monospace';
                ctx.fillStyle = 'rgba(0,0,0,0.8)';
                ctx.fillRect(4, 4, 150, 135);
                ctx.fillStyle = fpsColor;
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';
                ctx.fillText('FPS  : ' + fpsDisplay, 8, 8);
                ctx.fillStyle = '#ffffff';
                ctx.fillText('Total: ' + (window.perfTotal || 0).toFixed(1) + 'ms', 8, 22);
                ctx.fillText('Sim  : ' + (window.perfSim || 0).toFixed(1) + 'ms', 8, 36);
                ctx.fillText(' -Tch: ' + (window.perfTouch || 0).toFixed(1) + 'ms', 8, 50);
                ctx.fillText(' -Blt: ' + (window.perfBullet || 0).toFixed(1) + 'ms', 8, 64);
                ctx.fillText(' -Emt: ' + (window.perfEmitter || 0).toFixed(1) + 'ms', 8, 78);
                ctx.fillText('Draw : ' + (window.perfDraw || 0).toFixed(1) + 'ms', 8, 92);
                ctx.fillText(' -Blt: ' + (window.perfDrawB || 0).toFixed(1) + 'ms', 8, 106);
                ctx.fillStyle = '#ffcc00';
                ctx.fillText('Count: ' + bullets.length + ' bullets', 8, 120);
            }
            ctx.textBaseline = 'alphabetic';
        }


        // ==========================================
        // スマートフォン用 タッチ操作・コントロール初期化システム
        // ==========================================
        function initTouchControls() {
            const canvas = document.getElementById('gameCanvas');
            const container = document.getElementById('gameContainer');
            if (!canvas || !container) return;

            // タッチ操作デバイスの自動検出＆クラス付与（スマホUI表示を強制する）
            if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
                document.body.classList.add('mobile-mode');
            }

            // 【超重要】手札モーダル内でのタッチ操作が背後の自機移動ドラッグに吸い取られないようにイベント伝播を完全遮断！
            const phaseMsg = document.getElementById('phaseMessage');
            if (phaseMsg) {
                const stopTouchPropagation = (e) => {
                    e.stopPropagation(); // 背後の window.touchmove 等へのバブリングを完全防止！
                };
                // パッシブをtrueにしてスクロール動作を最高に軽くスムーズにする
                phaseMsg.addEventListener('touchstart', stopTouchPropagation, { passive: true });
                phaseMsg.addEventListener('touchmove', stopTouchPropagation, { passive: true });
                phaseMsg.addEventListener('touchend', stopTouchPropagation, { passive: true });
            }

            // 共通ドラッグ処理関数
            const onDragStart = (clientX, clientY) => {
                if (!isGameRunning || gameState !== 'BATTLE') return;
                // カード選択中（PLANNINGフェーズ）はドラッグ移動を行わない
                if (battlePhase === 'PLANNING') return;

                touchStartX = clientX;
                touchStartY = clientY;
                mobileTargetX = player.x;
                mobileTargetY = player.y;
                isDragging = true;
            };

            const onDragMove = (clientX, clientY) => {
                if (!isGameRunning || gameState !== 'BATTLE' || !isDragging) return;
                if (battlePhase === 'PLANNING') return;

                // 前フレームからのタッチ位置の移動差分（delta）を計算
                const deltaX = clientX - touchStartX;
                const deltaY = clientY - touchStartY;

                // 次フレームのためにタッチ位置を更新
                touchStartX = clientX;
                touchStartY = clientY;

                const scaleX = PLAY_WIDTH / canvas.clientWidth;
                const scaleY = canvas.height / canvas.clientHeight;

                // 操作感度の係数（等倍に変更）
                const sensitivity = 1.0;

                // 現在の移動ターゲットに対して差分を加算
                const baseTargetX = (mobileTargetX !== null) ? mobileTargetX : player.x;
                const baseTargetY = (mobileTargetY !== null) ? mobileTargetY : player.y;

                const newX = baseTargetX + deltaX * scaleX * sensitivity;
                const newY = baseTargetY + deltaY * scaleY * sensitivity;

                // 移動範囲制限（画面外に出ないようにクリップ）
                mobileTargetX = Math.max(player.grazeRadius, Math.min(PLAY_WIDTH - player.grazeRadius, newX));
                mobileTargetY = Math.max(player.grazeRadius, Math.min(canvas.height - player.grazeRadius, newY));
            };

            const onDragEnd = () => {
                isDragging = false;
                mobileTargetX = null;
                mobileTargetY = null;
            };

            // 1. 自機のドラッグ（スライド）移動操作 (container全体で検知して前面UIとの干渉を完全に防ぐ)
            container.addEventListener('touchstart', (e) => {
                // クリアエフェクト中はタップでカウントアップ
                if (window.customCardClearEffect) {
                    window.customCardClearEffect.tapCount = (window.customCardClearEffect.tapCount || 0) + 1;
                    return;
                }
                // 開発者ツールなどのエミュレータ対策としてタッチ開始時にも強制付与
                document.body.classList.add('mobile-mode');

                if (e.touches.length > 0) {
                    onDragStart(e.touches[0].clientX, e.touches[0].clientY);
                }
            }, { passive: false });

            container.addEventListener('touchmove', (e) => {
                if (isGameRunning && gameState === 'BATTLE' && battlePhase !== 'PLANNING' && isDragging) {
                    if (e.touches.length > 0) {
                        e.preventDefault(); // スクロールやスワイプバウンスを防ぐ
                        onDragMove(e.touches[0].clientX, e.touches[0].clientY);
                    }
                }
            }, { passive: false });

            window.addEventListener('touchend', (e) => {
                onDragEnd();
            }, { passive: false });

            // PCマウスでのドラッグ操作にも完全対応！
            container.addEventListener('mousedown', (e) => {
                // クリアエフェクト中はクリックでカウントアップ
                if (window.customCardClearEffect) {
                    window.customCardClearEffect.tapCount = (window.customCardClearEffect.tapCount || 0) + 1;
                    return;
                }
                onDragStart(e.clientX, e.clientY);
            });

            window.addEventListener('mousemove', (e) => {
                if (isDragging) {
                    onDragMove(e.clientX, e.clientY);
                }
            });

            window.addEventListener('mouseup', (e) => {
                if (isDragging) {
                    onDragEnd();
                }
            });


        }

        // ==========================================
        // 戦闘中以外のピンチズーム・ドラッグ移動システム
        // ==========================================
        let currentScale = 1.0;
        let startScale = 1.0;
        let startDistance = 0;
        let zoomOffsetX = 0;
        let zoomOffsetY = 0;
        let lastTouchX = 0;
        let lastTouchY = 0;
        let isZoomDragging = false;

        function applyZoom() {
            const container = document.getElementById('gameContainer');
            if (!container) return;
            
            let maxOffsetX = 0;
            let maxOffsetY = 0;
            const origWidth = container.clientWidth || 480;
            const origHeight = container.clientHeight || 540;

            if (currentScale > 1.0) {
                // コンテナがはみ出る最大距離をバウンディング上限に設定
                maxOffsetX = (origWidth * (currentScale - 1)) / 2;
                maxOffsetY = (origHeight * (currentScale - 1)) / 2;
            }

            zoomOffsetX = Math.max(-maxOffsetX, Math.min(maxOffsetX, zoomOffsetX));
            zoomOffsetY = Math.max(-maxOffsetY, Math.min(maxOffsetY, zoomOffsetY));

            container.style.transformOrigin = 'center center';
            container.style.transform = `translate(${zoomOffsetX}px, ${zoomOffsetY}px) scale(${currentScale})`;
        }

        function resetZoom() {
            currentScale = 1.0;
            zoomOffsetX = 0;
            zoomOffsetY = 0;
            applyZoom();
        }

        function initZoomControls() {
            window.addEventListener('touchstart', (e) => {
                if (isGameRunning) {
                    resetZoom();
                    return;
                }

                if (e.touches.length === 2) {
                    isZoomDragging = false;
                    startDistance = Math.hypot(
                        e.touches[0].clientX - e.touches[1].clientX,
                        e.touches[0].clientY - e.touches[1].clientY
                    );
                    startScale = currentScale;
                    lastTouchX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                    lastTouchY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
                } else if (e.touches.length === 1 && currentScale > 1.0) {
                    isZoomDragging = true;
                    lastTouchX = e.touches[0].clientX;
                    lastTouchY = e.touches[0].clientY;
                }
            }, { passive: false });

            window.addEventListener('touchmove', (e) => {
                if (isGameRunning) return;

                if (e.touches.length === 2) {
                    e.preventDefault(); // デフォルトスクロール防止
                    const dist = Math.hypot(
                        e.touches[0].clientX - e.touches[1].clientX,
                        e.touches[0].clientY - e.touches[1].clientY
                    );
                    const touchCenterX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
                    const touchCenterY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

                    if (startDistance > 0) {
                        const factor = dist / startDistance;
                        const nextScale = Math.min(2.5, Math.max(1.0, startScale * factor));
                        
                        if (nextScale !== currentScale) {
                            const scaleRatio = nextScale / currentScale;
                            // 画面中央（変形基準点 center center）からの相対的なタッチ中心点
                            const relTouchX = touchCenterX - window.innerWidth / 2;
                            const relTouchY = touchCenterY - window.innerHeight / 2;
                            // 画面中央を基準とした数学的に正しいズーム中心追従計算
                            zoomOffsetX = relTouchX - (relTouchX - zoomOffsetX) * scaleRatio;
                            zoomOffsetY = relTouchY - (relTouchY - zoomOffsetY) * scaleRatio;
                            currentScale = nextScale;
                        }

                        // ズームしながらの二本指での並行スライド移動 (パン) も反映
                        zoomOffsetX += (touchCenterX - lastTouchX);
                        zoomOffsetY += (touchCenterY - lastTouchY);
                    }
                    
                    startDistance = dist;
                    startScale = currentScale;
                    lastTouchX = touchCenterX;
                    lastTouchY = touchCenterY;
                    applyZoom();
                } else if (e.touches.length === 1 && isZoomDragging && currentScale > 1.0) {
                    e.preventDefault();
                    const touchX = e.touches[0].clientX;
                    const touchY = e.touches[0].clientY;
                    // 指の移動距離そのものをオフセットに加算することで、ドラッグの追従性を100%一致させる
                    zoomOffsetX += (touchX - lastTouchX);
                    zoomOffsetY += (touchY - lastTouchY);
                    lastTouchX = touchX;
                    lastTouchY = touchY;
                    applyZoom();
                }
            }, { passive: false });

            window.addEventListener('touchend', (e) => {
                if (e.touches.length < 2) {
                    startDistance = 0;
                }
                if (e.touches.length === 0) {
                    isZoomDragging = false;
                }
            });
        }

        // ==========================================
        // 自作カード用ブロックコンパイラ＆インタプリタ
        // ==========================================
        function executeOnceBlock(block, state) {
            if (!state.lifetimeOnce || typeof state.lifetimeOnce.has !== 'function') state.lifetimeOnce = new Set();
            let onceId = block.onceId || 'once_default';
            if (state.lifetimeOnce.has(onceId)) {
                return true;
            }
            state.lifetimeOnce.add(onceId);
            if (block.children && block.children.length > 0) {
                state.stack.push({
                    type: 'once',
                    pc: 0,
                    iterationsLeft: 1,
                    forever: false,
                    blocks: block.children
                });
                return false;
            }
            return true;
        }

        function compileIndentedBlocks(flatBlocks) {
            let root = [];
            let stack = [{ indent: -1, children: root }];
            let onceCounter = 0;
            
            // Clamp indent levels first to prevent gaps
            for (let i = 0; i < flatBlocks.length; i++) {
                if (i === 0) {
                    flatBlocks[i].indent = 0;
                } else {
                    flatBlocks[i].indent = Math.min(flatBlocks[i].indent || 0, flatBlocks[i - 1].indent + 1);
                }
            }

            const keysToCompile = new Set([
                'speed', 'angle', 'duration', 'delay', 'effect', 'count', 'spread', 
                'offsetX', 'offsetY', 'radius', 'hitRadius', 'value', 'cond', 
                'warningTime', 'activeTime', 'laserWidth', 'targetX', 'targetY'
            ]);

            for (let block of flatBlocks) {
                let b = {
                    type: block.type,
                    params: { ...block.params },
                    children: [],
                    compiledParams: {}
                };
                for (let key in b.params) {
                    if (Object.prototype.hasOwnProperty.call(b.params, key)) {
                        let val = b.params[key];
                        if (typeof val === 'string' && val.trim() !== '' && keysToCompile.has(key)) {
                            if (key === 'cond') {
                                b.compiledParams[key] = compileCondition(val);
                            } else {
                                b.compiledParams[key] = compileNumericExpr(val);
                            }
                        }
                    }
                }
                if (block.type === 'once') {
                    b.onceId = 'once_' + (onceCounter++);
                }
                if (block.type === 'speed_scale') {
                    b.speedScaleId = 'speed_scale_' + (onceCounter++);
                }
                
                // Find parent in stack
                while (stack.length > 1 && stack[stack.length - 1].indent >= block.indent) {
                    stack.pop();
                }
                
                let parent = stack[stack.length - 1];
                parent.children.push(b);
                
                if (block.type === 'repeat' || block.type === 'forever' || block.type === 'while' || block.type === 'if' || block.type === 'once') {
                    stack.push({ indent: block.indent, children: b.children });
                }
            }
            return root;
        }
        function isParallelRootBlock(block) {
            return block && ['repeat', 'forever', 'while', 'if', 'once'].includes(block.type);
        }

        function createParallelThreadsForState(state) {
            const rootBlocks = state.blocks || [];
            if (rootBlocks.filter(isParallelRootBlock).length < 2) return;

            const setupBlocks = [];
            const threadGroups = [];
            let currentGroup = null;

            rootBlocks.forEach(block => {
                if (isParallelRootBlock(block)) {
                    currentGroup = [block];
                    threadGroups.push(currentGroup);
                } else if (currentGroup) {
                    currentGroup.push(block);
                } else {
                    setupBlocks.push(block);
                }
            });

            setupBlocks.forEach(block => {
                if (!block || !block.params) return;
                if (block.type === 'const_var' || block.type === 'set_var') {
                    setScriptVariable(state, block.params.name, evalValue(block.params.value, state.variables), block.type === 'const_var');
                } else if (block.type === 'change_var') {
                    const varName = block.params.name;
                    const val = evalExpr(block.params.value, state.variables);
                    const delta = block.params.op === '-' ? -val : val;
                    if (!state.constVars || typeof state.constVars.has !== 'function') state.constVars = new Set();
                    if (!state.constVars.has(varName)) state.variables[varName] = (Number(state.variables[varName]) || 0) + delta;
                }
            });

            state.parallelThreads = threadGroups.map(group => ({
                blocks: group,
                pc: 0,
                waitTimer: 0,
                stack: [],
                variables: state.variables,
                finished: false,
                isPlayerSide: state.isPlayerSide,
                isParallelThread: true,
                lifetimeOnce: state.lifetimeOnce,
                constVars: state.constVars,
                speedScaleApplied: state.speedScaleApplied
            }));
            state.finished = false;
        }

        function syncParallelThreadState(parent, thread) {
            thread.variables = parent.variables;
            thread.isPlayerSide = parent.isPlayerSide;
            thread.lifetimeOnce = parent.lifetimeOnce;
            thread.constVars = parent.constVars;
            thread.speedScaleApplied = parent.speedScaleApplied;
        }

        function evalValue(expr, variables, block, key) {
            if (typeof expr === 'number') return expr;
            let s = String(expr).trim();
            if (s === '') return 0;
            if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) return s.substring(1, s.length - 1);
            if (variables && variables[s] !== undefined) return variables[s];
            if (isCssColorLiteral(s)) return s;
            // "12,522" のようなコンマ区切り座標リテラルは数式評価せずそのまま文字列として返す
            if (/^-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?$/.test(s)) return s;
            return evalExpr(expr, variables || {}, block, key);
        }

        function resolveTextParam(textParam, variables) {
            let raw = String(textParam || '').trim();
            if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
                raw = raw.substring(1, raw.length - 1);
            }
            if (variables && variables[raw] !== undefined) return String(variables[raw]);
            // カンマ区切りの座標指定（例: x0,y0 など）の各大要素を個別に evalExpr する
            if (raw.includes(',')) {
                let parts = raw.split(',').map(part => {
                    let trimmed = part.trim();
                    if (variables && variables[trimmed] !== undefined) return variables[trimmed];
                    let val = evalExpr(trimmed, variables);
                    return val !== null && val !== undefined ? val : trimmed;
                });
                return parts.join(',');
            }
            return raw;
        }

        function isCssColorLiteral(value) {
            let s = String(value || '').trim();
            return /^#([0-9a-f]{3,8})$/i.test(s) ||
                /^rgba?\(/i.test(s) ||
                /^hsla?\(/i.test(s) ||
                /^(red|blue|green|yellow|white|black|cyan|magenta|purple|orange|pink|lime|gray|grey)$/i.test(s);
        }

        function resolveColorParam(colorParam, variables) {
            let raw = String(colorParam || '#ff3333').trim();
            if (variables && variables[raw] !== undefined) return String(variables[raw]);
            if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
                raw = raw.substring(1, raw.length - 1);
            }
            if (isCssColorLiteral(raw)) return raw;
            let resolved = evalValue(raw, variables || {});
            if (isCssColorLiteral(resolved)) return String(resolved);
            if (resolved === 0 || resolved === undefined || resolved === null || resolved === '') return '#ff3333';
            return String(resolved);
        }
        function normalizeConditionOperators(cond) {
            return String(cond || '').replace(/(^|[^!<>=])=([^=]|$)/g, '$1==$2');
        }
        function replaceRangeConditions(s) {
            return String(s || '').replace(/(.+?)\s*(==|!=)\s*([^=!<>\s]+?)\.\.([^=!<>\s]+)/g, function(match, left, op, min, max) {
                if (op === '==') {
                    return '((' + left + ') >= (' + min + ') && (' + left + ') <= (' + max + '))';
                } else {
                    return '((' + left + ') < (' + min + ') || (' + left + ') > (' + max + '))';
                }
            });
        }

        function readConditionValue(raw, variables) {
            let s = String(raw || '').trim();
            if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
                return s.substring(1, s.length - 1);
            }
            if (variables && variables[s] !== undefined) return variables[s];
            return s;
        }

        function evalStringCondition(cond, variables) {
            let m = String(cond || '').match(/^(.+?)\s*(==|!=)\s*(.+)$/);
            if (!m) return null;

            let left = readConditionValue(m[1], variables);
            let right = readConditionValue(m[3], variables);
            let hasQuotedSide = /^['"]/.test(m[1].trim()) || /^['"]/.test(m[3].trim());
            let hasColorSide = isCssColorLiteral(left) || isCssColorLiteral(right) || /#(?:[0-9a-f]{3,8})\b/i.test(m[1] + m[3]);
            let hasStringVar = (typeof left === 'string' && isNaN(Number(left))) || (typeof right === 'string' && isNaN(Number(right)));
            if (!hasQuotedSide && !hasColorSide && !hasStringVar) return null;

            left = String(left).trim().toLowerCase();
            right = String(right).trim().toLowerCase();
            return m[2] === '==' ? left === right : left !== right;
        }

        const conditionCache = new Map();

        function compileCondition(cond) {
            if (conditionCache.has(cond)) return conditionCache.get(cond);
            if (conditionCache.size > 2000) conditionCache.clear();

            let s = String(cond || '').trim();
            let normalized = s.replace(/\s+/g, '').toLowerCase();
            if (normalized === 'bounced') s = 'isBounced';
            else if (normalized === 'wall' || normalized === 'touchwall') s = 'isTouchWall';
            else if (normalized === 'touchingwall') s = 'touchingWall';
            else if (normalized === 'bullet' || normalized === 'touchbullet') s = 'isTouchBullet';
            else if (normalized === 'touchingbullet') s = 'touchingBullet';
            else {
                let mAfter = s.match(/^after\((.*?)\)$/i);
                let mBefore = s.match(/^before\((.*?)\)$/i);
                let mNear = s.match(/^near\((.*?)\)$/i);
                if (mAfter) s = 'timer >= (' + mAfter[1] + ')';
                if (mBefore) s = 'timer <= (' + mBefore[1] + ')';
                if (mNear) s = 'dist <= (' + mNear[1] + ')';
            }
            let normalizedCond = normalizeConditionOperators(s);
            normalizedCond = replaceRangeConditions(normalizedCond);

            // 文字列比較の最適化コンパイル
            let stringResultFn = null;
            let m = normalizedCond.match(/^(.+?)\s*(==|!=)\s*(.+)$/);
            if (m) {
                let leftRaw = m[1].trim();
                let rightRaw = m[3].trim();
                let hasQuotedSide = /^['"]/.test(leftRaw) || /^['"]/.test(rightRaw);
                let hasColorSide = /#(?:[0-9a-f]{3,8})\b/i.test(leftRaw + rightRaw);
                if (hasQuotedSide || hasColorSide) {
                    const isValidIdentifier = name => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
                    let leftExpr = (leftRaw.startsWith('"') || leftRaw.startsWith("'")) ? leftRaw : 
                                   (isValidIdentifier(leftRaw) ? '(__v.' + leftRaw + ' !== undefined ? __v.' + leftRaw + ' : "")' : '"' + leftRaw + '"');
                    let rightExpr = (rightRaw.startsWith('"') || rightRaw.startsWith("'")) ? rightRaw : 
                                    (isValidIdentifier(rightRaw) ? '(__v.' + rightRaw + ' !== undefined ? __v.' + rightRaw + ' : "")' : '"' + rightRaw + '"');

                    stringResultFn = new Function('__v', 
                        'let left = ' + leftExpr + ';' +
                        'let right = ' + rightExpr + ';' +
                        'return ' + (m[2] === '==' ? 'String(left).trim().toLowerCase() === String(right).trim().toLowerCase()' : 'String(left).trim().toLowerCase() !== String(right).trim().toLowerCase()') + ';'
                    );
                }
            }

            if (stringResultFn) {
                conditionCache.set(cond, stringResultFn);
                return stringResultFn;
            }

            const exprFn = compileNumericExpr(normalizedCond);
            if (exprFn) {
                const condFn = function(variables) {
                    return !!exprFn(variables, Math.random);
                };
                conditionCache.set(cond, condFn);
                return condFn;
            }

            const fallbackFn = function(variables) {
                return !!evalExpr(normalizedCond, variables);
            };
            conditionCache.set(cond, fallbackFn);
            return fallbackFn;
        }

        function evalCondition(cond, variables, block, key) {
            if (block && block.compiledParams && block.compiledParams[key]) {
                return !!block.compiledParams[key](variables || EMPTY_OBJECT);
            }
            const fn = compileCondition(cond);
            return fn(variables || EMPTY_OBJECT);
        }
        function setScriptVariable(state, name, value, isConst) {
            if (!name) return;
            if (!state.constVars || typeof state.constVars.has !== 'function') state.constVars = new Set();
            if (state.constVars.has(name) && !isConst) return;
            state.variables[name] = value;
            if (isConst) state.constVars.add(name);
            
            // 座標ペア（コンマ区切り）の自動パース機能
            if (typeof value === 'string' && value.includes(',')) {
                let parts = value.split(',').map(p => parseFloat(p.trim()));
                if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                    state.variables[name + '_x'] = parts[0];
                    state.variables[name + '_y'] = parts[1];
                    state.variables[name + '.x'] = parts[0];
                    state.variables[name + '.y'] = parts[1];
                }
            }
        }
        function applySpeedScaleBlock(block, state) {
            if (!state.speedScaleApplied || typeof state.speedScaleApplied.has !== 'function') state.speedScaleApplied = new Set();
            const id = block.speedScaleId || ((block.params.mode || 'scale') + ':' + (block.params.delay || '0') + ':' + (block.params.effect || '1'));
            if (state.speedScaleApplied.has(id)) return true;
            const delay = evalExpr(block.params.delay || '0', state.variables);
            if ((state.variables.timer || 0) < delay) return false;
            const effect = evalExpr(block.params.effect || '1', state.variables);
            state.variables.speed = (Number(state.variables.speed) || 0) * effect;
            state.speedScaleApplied.add(id);
            return true;
        }

        function inheritEmitterVariablesToBullet(emitterState, bulletState) {
            if (!emitterState || !bulletState || !emitterState.variables || !bulletState.variables) return;
            const reserved = new Set([
                'speed', 'angle', 'spriteAngle', 'timer', 'second', 'frame', 'cardSecond', 'cardFrame', 'x', 'y', 'tx', 'ty', 'dist',
                'ex', 'ey', 'emitter_x', 'emitter_y',
                'x_offset', 'y_offset', 'isBounced', 'isTouchWall', 'touchingWall',
                'isTouchBullet', 'touchingBullet', 'touchColor', 'touchX', 'touchY',
                'warningTime', 'activeTime', 'laserStartTime', 'laserWidth', 'color', 'bulletType'
            ]);
            let copiedCount = 0;
            Object.keys(emitterState.variables).forEach(name => {
                if (reserved.has(name)) return;
                bulletState.variables[name] = emitterState.variables[name];
                copiedCount++;
            });
            if (window.showDebugProfiler) {
                console.log(`[DEBUG] inheritEmitterVariablesToBullet: copied ${copiedCount} custom variables`);
            }
        }

        const numericExprCache = new Map();
        const EMPTY_OBJECT = Object.freeze({});
        const RESERVED_WORDS = new Set([
            'true', 'false', 'null', 'undefined', 'NaN', 'Infinity',
            'sin', 'cos', 'tan', 'sqrt', 'abs', 'min', 'max', 'PI', 'PI2',
            'atan2', 'pow', 'log', 'exp', 'floor', 'round', 'ceil', 'random', 'rand',
            'const', 'let', 'var', 'function', 'return', 'n',
            '__fuzzyEqual', '__fuzzyNotEqual', '__v'
        ]);

        function compileNumericExpr(expr) {
            if (numericExprCache.has(expr)) return numericExprCache.get(expr);
            if (numericExprCache.size > 2000) numericExprCache.clear();
            if (expr.length > 500) {
                numericExprCache.set(expr, null);
                return null;
            }

            try {
                // 1. レンジ条件 (x..y) をキャッシュ作成時に1回だけ置換
                let s = replaceRangeConditions(expr);

                // 2. 文字列リテラル（"..." や '...'）を一時的に退避して保護する
                const literals = [];
                s = s.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, function(match) {
                    literals.push(match);
                    return '___LITERAL_' + (literals.length - 1) + '___';
                });

                // 3. 厳密等価演算子（=== と !==）を退避して保護する
                let strictEquals = [];
                s = s.replace(/===/g, function() {
                    strictEquals.push('===');
                    return '___STRICT_EQ_' + (strictEquals.length - 1) + '___';
                });
                s = s.replace(/!==/g, function() {
                    strictEquals.push('!==');
                    return '___STRICT_EQ_' + (strictEquals.length - 1) + '___';
                });



                // 5. a == b / a != b を誤差許容関数呼び出しに置換
                s = s.replace(/([^&|?,:=()]+)\s*==\s*([^&|?,:=()]+)/g, '__fuzzyEqual($1,$2)');
                s = s.replace(/([^&|?,:=()]+)\s*!=\s*([^&|?,:=()]+)/g, '__fuzzyNotEqual($1,$2)');

                // 6. 退避した厳密比較演算子を復元
                s = s.replace(/___STRICT_EQ_(\d+)___/g, function(match, index) {
                    return strictEquals[parseInt(index, 10)];
                });

                // 7. 変数部分を __v.変数名 にトランスパイル (最後のフェーズで実行して構文破壊を完璧に防ぐ)
                s = s.replace(/[a-zA-Z_][a-zA-Z0-9_]*/g, function(match) {
                    if (RESERVED_WORDS.has(match)) {
                        if (match === 'random' || match === 'rand') {
                            return '__rand';
                        }
                        return match;
                    }
                    if (match.startsWith('___LITERAL_')) return match; // 退避した文字列リテラルはスキップ
                    return '(__v.' + match + ' !== undefined ? __v.' + match + ' : 0)';
                });

                // 8. 退避していた文字列リテラルを元に戻す
                s = s.replace(/___LITERAL_(\d+)___/g, function(match, index) {
                    return literals[parseInt(index, 10)];
                });

                // cardSecond == 5 * n や cardFrame == 60 * n などの等式を O(1) にトランスパイル
                let optimized = false;
                let optMatch = expr.trim().match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*(===|==)\s*([\d.]+)\s*\*\s*n$/);
                if (!optMatch) {
                    optMatch = expr.trim().match(/^([\d.]+)\s*\*\s*n\s*(===|==)\s*([a-zA-Z_][a-zA-Z0-9_]*)$/);
                }
                if (optMatch) {
                    let varName = optMatch[1];
                    let coeff = parseFloat(optMatch[3]);
                    if (isNaN(coeff)) {
                        varName = optMatch[3];
                        coeff = parseFloat(optMatch[1]);
                    }
                    s = `(__v.n !== undefined ? (__v.${varName} === ${coeff} * __v.n) : (Math.round(__v.${varName} / ${coeff}) >= 1 && Math.round(__v.${varName} / ${coeff}) <= 1000 && Math.abs(__v.${varName} - ${coeff} * Math.round(__v.${varName} / ${coeff})) < 0.017))`;
                    optimized = true;
                }

                // 4.8. 特殊変数 n が数式に含まれているか確認
                const hasN = !optimized && /\bn\b/.test(expr);

                let functionBody = 
                    'const __rand = (a, b) => {' +
                    '  if (b !== undefined) return Number(a || 0) + __random() * (Number(b || 0) - Number(a || 0));' +
                    '  if (a !== undefined) return __random() * Number(a || 0);' +
                    '  return __random();' +
                    '};' +
                    'const __checkInterval = (currentVal, interval, stateKey, variables) => {' +
                    '  if (!interval || interval <= 0) return false;' +
                    '  let prevVal = variables[stateKey];' +
                    '  variables[stateKey] = currentVal;' +
                    '  if (prevVal === undefined) {' +
                    '    prevVal = 0;' +
                    '  }' +
                    '  return Math.floor(prevVal / interval) !== Math.floor(currentVal / interval);' +
                    '};' +
                    'const __fuzzyEqual = (a, b) => (typeof a === "number" && typeof b === "number") ? Math.abs(a - b) < (window.currentDt || 0.017) : a == b;' +
                    'const __fuzzyNotEqual = (a, b) => (typeof a === "number" && typeof b === "number") ? Math.abs(a - b) >= (window.currentDt || 0.017) : a != b;';

                if (hasN) {
                    functionBody += 
                        'if (__v.n !== undefined) {' +
                        '  const n = __v.n;' +
                        '  return (' + s + ');' +
                        '} else {' +
                        '  for (let n = 1; n <= 1000; n++) {' +
                        '    if (' + s + ') return true;' +
                        '  }' +
                        '  return false;' +
                        '}';
                } else {
                    functionBody += 
                        'return (' + s + ');';
                }

                const fn = new Function('__v', '__random', functionBody);
                numericExprCache.set(expr, fn);
                return fn;
            } catch(e) {
                if (window.showDebugProfiler) {
                    console.warn('Failed to compile expression:', expr, e);
                }
                numericExprCache.set(expr, null);
                return null;
            }
        }

        function evalNumericExprFast(expr, variables) {
            const fn = compileNumericExpr(expr);
            if (!fn) return null;
            try {
                const value = fn(variables || EMPTY_OBJECT, Math.random);
                return Number.isNaN(value) ? 0 : value;
            } catch(e) {
                console.error(`[DANMAKU EVAL ERROR] 式 "${expr}" の実行中にエラーが発生しました:`, e);
                return null;
            }
        }

        function parseColorToRgb(colorStr) {
            let r = 255, g = 51, bVal = 51;
            let c = String(colorStr || '#ff3333').trim();
            if (c.startsWith('#')) {
                let hex = c.substring(1);
                if (hex.length === 3) {
                    r = parseInt(hex[0] + hex[0], 16);
                    g = parseInt(hex[1] + hex[1], 16);
                    bVal = parseInt(hex[2] + hex[2], 16);
                } else if (hex.length === 6) {
                    r = parseInt(hex.substring(0, 2), 16);
                    g = parseInt(hex.substring(2, 4), 16);
                    bVal = parseInt(hex.substring(4, 6), 16);
                }
            } else if (c.startsWith('rgb')) {
                let m = c.match(/\d+/g);
                if (m && m.length >= 3) {
                    r = parseInt(m[0]);
                    g = parseInt(m[1]);
                    bVal = parseInt(m[2]);
                }
            } else {
                const names = {
                    red: [255, 0, 0], green: [0, 255, 0], blue: [0, 0, 255],
                    yellow: [255, 255, 0], purple: [128, 0, 128], cyan: [0, 255, 255],
                    magenta: [255, 0, 255], orange: [255, 165, 0],
                    white: [255, 255, 255], black: [0, 0, 0],
                    gray: [128, 128, 128], grey: [128, 128, 128],
                    silver: [192, 192, 192], darkgray: [169, 169, 169]
                };
                let norm = c.toLowerCase();
                if (names[norm]) [r, g, bVal] = names[norm];
            }
            return [r, g, bVal];
        }

        window.getLightBulletTexture = function(color, radius) {
            if (!window.lightBulletTextureCache) window.lightBulletTextureCache = {};
            const cacheKey = `${color}_${radius}`;
            let cached = window.lightBulletTextureCache[cacheKey];
            if (cached) return cached;

            const size = Math.ceil(radius * 8);
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');

            const center = size / 2;
            const baseAuraRadius = radius * 3.5;
            const coreRadius = radius * 1.2;

            let grad = ctx.createRadialGradient(center, center, coreRadius * 0.5, center, center, baseAuraRadius);
            let [r, g, bVal] = parseColorToRgb(color);

            grad.addColorStop(0, `rgba(${r}, ${g}, ${bVal}, 1.0)`);
            grad.addColorStop(0.2, `rgba(${r}, ${g}, ${bVal}, 0.9)`);
            grad.addColorStop(0.55, `rgba(${r}, ${g}, ${bVal}, 0.35)`);
            grad.addColorStop(1.0, `rgba(${r}, ${g}, ${bVal}, 0.0)`);

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(center, center, baseAuraRadius, 0, Math.PI * 2);
            ctx.fill();

            window.lightBulletTextureCache[cacheKey] = {
                canvas: canvas,
                size: size,
                center: center,
                baseAuraRadius: baseAuraRadius
            };
            return window.lightBulletTextureCache[cacheKey];
        };

        function evalExpr(expr, variables, block, key) {
            if (typeof expr === 'number') return expr;
            if (block && block.compiledParams && block.compiledParams[key]) {
                const val = block.compiledParams[key](variables || EMPTY_OBJECT, Math.random);
                return Number.isNaN(val) ? 0 : val;
            }
            const vars = variables || EMPTY_OBJECT;
            let s = String(expr).trim();
            if (s === '') return 0;
            
            if (vars[s] !== undefined) return vars[s];

            // 高速なJITコンパイル評価
            const fastValue = evalNumericExprFast(s, vars);
            if (fastValue !== null) return fastValue;

            // コンパイルできなかった場合（文字列リテラルや色コードなどの定数）は
            // 重い動的RegExpのループは一切走らせず、クォーテーションを剥いでそのまま返す
            if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
                return s.substring(1, s.length - 1);
            }
            let num = parseFloat(s);
            return isNaN(num) ? s : num; // 数値化できれば数値、できなければ文字列としてそのまま返す
        }

        function initEmitterState(script, attacker, target, initXOffset = 0, initYOffset = 0) {
            let variables = {
                angle: 0,
                speed: 200,
                x_offset: initXOffset,
                y_offset: initYOffset,
                second: 0,
                frame: 0,
                cardSecond: 0,
                cardFrame: 0
            };
            let isPlayerSide = (attacker === player);
            let dx = target.x - attacker.x;
            let dy = target.y - attacker.y;
            if (isPlayerSide) {
                dy = -dy;
            }
            variables.angle = Math.atan2(dy, dx) * 180 / Math.PI;

            let compiledBlocks = compileIndentedBlocks(JSON.parse(JSON.stringify(script || [])));

            let state = {
                blocks: compiledBlocks,
                pc: 0,
                waitTimer: 0,
                stack: [],
                variables: variables,
                finished: false,
                isPlayerSide: isPlayerSide,
                lifetimeOnce: new Set(),
                constVars: new Set(),
                speedScaleApplied: new Set()
            };
            createParallelThreadsForState(state);
            return state;
        }