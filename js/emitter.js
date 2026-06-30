function stepEmitter(c, state, attacker, target, dt) {
            if (!state) return;
            
            let isPlayerSide = state.isPlayerSide;

            // --- tween処理（スムーズ移行）を毎フレーム先に適用 ---
            if (state.tweens && state.tweens.length > 0) {
                state.tweens = state.tweens.filter(tw => {
                    if (tw.mode === 'step') {
                        // 毎フレーム固定量加算
                        let cur = Number(state.variables[tw.name]) || 0;
                        let step = tw.stepVal;
                        let next = cur + step;
                        if ((step > 0 && next >= tw.to) || (step < 0 && next <= tw.to)) {
                            state.variables[tw.name] = tw.to;
                            return false; // done
                        }
                        state.variables[tw.name] = next;
                        return true;
                    } else {
                        // 時間 / フレーム制御の線形補間
                        tw.elapsed += (tw.mode === 'seconds') ? dt : 1;
                        let t = Math.min(1, tw.elapsed / tw.total);
                        state.variables[tw.name] = tw.from + (tw.to - tw.from) * t;
                        return t < 1; // done if t==1
                    }
                });
            }


            
            // コアの現在位置、ターゲットの現在位置、および距離情報を毎フレーム同期
            state.variables.x = attacker.x;
            state.variables.y = isPlayerSide ? (canvas.height - attacker.y) : attacker.y;
            state.variables.tx = target.x;
            state.variables.ty = isPlayerSide ? (canvas.height - target.y) : target.y;
            // プレイヤーの絶対座標（常にプレイヤー側、Y軸は画面下が0の論理座標）
            state.variables.player_x = player.x;
            state.variables.player_y = canvas.height - player.y;
            if (!state.isParallelThread) {
                state.variables.second = (Number(state.variables.second) || 0) + dt;
                state.variables.frame = (Number(state.variables.frame) || 0) + 1;
                state.variables.cardSecond = state.variables.second;
                state.variables.cardFrame = state.variables.frame;
            }
            
            let dx = target.x - attacker.x;
            let dy = isPlayerSide ? (attacker.y - target.y) : (target.y - attacker.y);
            state.variables.dist = Math.sqrt(dx * dx + dy * dy);

            if (state.parallelThreads) {
                let allFinished = true;
                for (let thread of state.parallelThreads) {
                    syncParallelThreadState(state, thread);
                    stepEmitter(c, thread, attacker, target, dt);
                    if (!thread.finished) allFinished = false;
                }
                state.finished = allFinished;
                return;
            }
            
            if (state.finished) return;
            
            let dtRemaining = dt;
            while (dtRemaining > 0 && !state.finished) {
                if (state.waitTimer > 0) {
                    if (dtRemaining >= state.waitTimer) {
                        dtRemaining -= state.waitTimer;
                        state.waitTimer = 0;
                    } else {
                        state.waitTimer -= dtRemaining;
                        dtRemaining = 0;
                        break;
                    }
                }
                if (state.waitingTweenName) {
                    if (state.tweens && state.tweens.some(t => t.name === state.waitingTweenName)) {
                        break;
                    }
                    state.waitingTweenName = null;
                }
                
                let safetyCounter = 0;
                let brokeToWait = false;
                while (safetyCounter < 1000) {
                safetyCounter++;
                
                let currentBlocks = state.stack.length > 0 ? state.stack[state.stack.length - 1].blocks : state.blocks;
                let currentPC = state.stack.length > 0 ? state.stack[state.stack.length - 1].pc : state.pc;
                
                if (currentPC >= currentBlocks.length) {
                    if (state.stack.length > 0) {
                        let loopState = state.stack[state.stack.length - 1];
                        if (loopState.forever) {
                            loopState.pc = 0;
                            state.waitTimer = Math.max(state.waitTimer || 0, 0.001);
                            break;
                        } else if (loopState.type === 'while') {
                            if (evalCondition(loopState.cond || 'false', state.variables)) {
                                loopState.pc = 0;
                                state.waitTimer = Math.max(state.waitTimer || 0, 0.001);
                                break;
                            }
                            state.stack.pop();
                            if (state.stack.length > 0) {
                                state.stack[state.stack.length - 1].pc++;
                            } else {
                                state.pc++;
                            }
                            continue;
                        } else {
                            loopState.iterationsLeft--;
                            if (loopState.iterationsLeft > 0) {
                                if (loopState.indexVar) {
                                    loopState.index++;
                                    state.variables[loopState.indexVar] = loopState.index;
                                }
                                loopState.pc = 0;
                                continue;
                            } else {
                                state.stack.pop();
                                if (state.stack.length > 0) {
                                    state.stack[state.stack.length - 1].pc++;
                                } else {
                                    state.pc++;
                                }
                                continue;
                            }
                        }
                    } else {
                        state.finished = true;
                        break;
                    }
                }
                
                let block = currentBlocks[currentPC];
                if (!block) {
                    state.finished = true;
                    break;
                }
                
                let advancePC = true;
                
                switch (block.type) {
                    case 'wait': {
                        let dur = evalExpr(block.params.duration, state.variables);
                        state.waitTimer = Math.max(0.001, dur);
                        brokeToWait = true;
                        break;
                    }
                    case 'repeat': {
                        let count = Math.round(evalExpr(block.params.count, state.variables));
                        let loopCount = Math.max(1, count);
                        if (block.params.indexVar) state.variables[block.params.indexVar] = 0;
                        state.stack.push({
                            type: 'repeat',
                            pc: 0,
                            iterationsLeft: loopCount,
                            totalIterations: loopCount,
                            index: 0,
                            indexVar: block.params.indexVar || null,
                            forever: false,
                            blocks: block.children || []
                        });
                        advancePC = false;
                        break;
                    }
                    case 'forever': {
                        state.stack.push({
                            type: 'forever',
                            pc: 0,
                            iterationsLeft: 999999,
                            forever: true,
                            blocks: block.children || []
                        });
                        advancePC = false;
                        break;
                    }
                    case 'while': {
                        let condStr = block.params.cond || 'false';
                        if (evalCondition(condStr, state.variables) && block.children && block.children.length > 0) {
                            state.stack.push({
                                type: 'while',
                                pc: 0,
                                iterationsLeft: 999999,
                                forever: false,
                                cond: condStr,
                                blocks: block.children || []
                            });
                            advancePC = false;
                        }
                        break;
                    }
                    case 'if': {
                        let condStr = block.params.cond || 'x < 10';
                        let isTrue = evalCondition(condStr, state.variables);
                        if (isTrue && block.children && block.children.length > 0) {
                            state.stack.push({
                                type: 'if',
                                pc: 0,
                                iterationsLeft: 1,
                                forever: false,
                                blocks: block.children
                            });
                            advancePC = false;
                        }
                        break;
                    }
                    case 'once': {
                        advancePC = executeOnceBlock(block, state);
                        break;
                    }
                    case 'const_var':
                    case 'set_var': {
                        let varName = block.params.name;
                        let val = evalValue(block.params.value, state.variables);
                        setScriptVariable(state, varName, val, block.type === 'const_var');
                        break;
                    }
                    case 'change_var': {
                        let varName = block.params.name;
                        let val = evalExpr(block.params.value, state.variables);
                        let delta = block.params.op === '-' ? -val : val;
                        if (!state.constVars || typeof state.constVars.has !== 'function') state.constVars = new Set();
                        if (!state.constVars.has(varName)) state.variables[varName] = (Number(state.variables[varName]) || 0) + delta;
                        break;
                    }
                    case 'aim_at_target': {
                        let dx = target.x - (attacker.x + (state.variables.x_offset || 0));
                        let dy = target.y - (attacker.y + (state.variables.y_offset || 0));
                        if (isPlayerSide) {
                            let targetVirtualY = canvas.height - target.y;
                            let spawnVirtualY = (canvas.height - attacker.y) + (state.variables.y_offset || 0);
                            dy = targetVirtualY - spawnVirtualY;
                        }
                        state.variables.angle = Math.atan2(dy, dx) * 180 / Math.PI;
                        break;
                    }
                    case 'move_owner': {
                        const owner = attacker === player ? 'PLAYER' : 'CPU';
                        const preset = resolveTextParam(block.params.preset || 'center', state.variables);
                        const duration = evalExpr(block.params.duration || '0', state.variables);
                        setCustomOwnerPosition(owner, preset, duration);
                        applyCustomOwnerPositionLock(owner, 0);
                        break;
                    }
                    case 'spawn_bullet': {
                        let speed = evalExpr(block.params.speed, state.variables);
                        let angle = evalExpr(block.params.angle, state.variables);
                        let bColor = resolveColorParam(block.params.color, state.variables);
                        
                        let ox = evalExpr(block.params.offsetX || '0', state.variables);
                        let oy = evalExpr(block.params.offsetY || '0', state.variables);

                        let spawnX = attacker.x + (state.variables.x_offset || 0) + ox;
                        let spawnY = attacker.y + (state.variables.y_offset || 0) + (isPlayerSide ? -oy : oy);
                        let angleRad = angle * Math.PI / 180;
                        if (isPlayerSide) {
                            angleRad = -angleRad;
                        }
                        
                        let newBullet = {
                            x: spawnX,
                            y: spawnY,
                            startX: spawnX, // 初期位置保存
                            startY: spawnY,
                            vx: Math.cos(angleRad) * speed,
                            vy: Math.sin(angleRad) * speed,
                            radius: 6, // 弾の大きさは6に固定
                            team: attacker.team,
                            color: bColor,
                            customDmg: 20, // custom card damage balanced to 20
                            isCustom: true,
                            update: null
                        };
                        
                        if (block.params.bulletType === 'laser') {
                            newBullet.isLaser = true;
                        }

                        newBullet.threatWeight = computeBulletThreatWeight(
                            spawnX, spawnY, newBullet.vx, newBullet.vy, target.x, target.y
                        );

                        newBullet.bulletState = initBulletState(c.bulletScript || [], speed, angle, attacker, target);
                        newBullet.bulletState.isPlayerSide = isPlayerSide;
                        inheritEmitterVariablesToBullet(state, newBullet.bulletState);
                        newBullet.bulletState.variables.color = bColor;
                        newBullet.sharedEmitterState = state;
                        newBullet.update = (b, bdt) => {
                            runCustomBulletScript(b, bdt, attacker, target);
                        };
                        
                        bullets.push(newBullet);
                        break;
                    }
                    case 'spawn_ring': {
                        let speed = evalExpr(block.params.speed, state.variables);
                        let bColor = resolveColorParam(block.params.color, state.variables);
                        let count = Math.max(3, Math.min(CUSTOM_SPAWN_RING_MAX_COUNT, parseInt(evalExpr(block.params.count || '12', state.variables))));
                        
                        let ox = evalExpr(block.params.offsetX || '0', state.variables);
                        let oy = evalExpr(block.params.offsetY || '0', state.variables);

                        let spawnX = attacker.x + (state.variables.x_offset || 0) + ox;
                        let spawnY = attacker.y + (state.variables.y_offset || 0) + (isPlayerSide ? -oy : oy);
                        
                        for (let k = 0; k < count; k++) {
                            let angle = (360 / count) * k;
                            let angleRad = angle * Math.PI / 180;
                            if (isPlayerSide) {
                                angleRad = -angleRad;
                            }
                            
                            let newBullet = {
                                x: spawnX,
                                y: spawnY,
                                startX: spawnX, // 初期位置保存
                                startY: spawnY,
                                vx: Math.cos(angleRad) * speed,
                                vy: Math.sin(angleRad) * speed,
                                radius: 6, // 弾の大きさは6に固定
                                team: attacker.team,
                                color: bColor,
                                customDmg: 20,
                                isCustom: true,
                                update: null
                            };
                            
                            if (block.params.bulletType === 'laser') {
                                newBullet.isLaser = true;
                            }
                            
                            newBullet.threatWeight = computeBulletThreatWeight(
                                spawnX, spawnY, newBullet.vx, newBullet.vy, target.x, target.y
                            );

                            newBullet.bulletState = initBulletState(c.bulletScript || [], speed, angle, attacker, target);
                            newBullet.bulletState.isPlayerSide = isPlayerSide;
                            inheritEmitterVariablesToBullet(state, newBullet.bulletState);
                            newBullet.bulletState.variables.color = bColor;
                            newBullet.sharedEmitterState = state;
                            newBullet.update = (b, bdt) => {
                                runCustomBulletScript(b, bdt, attacker, target);
                            };
                            
                            bullets.push(newBullet);
                        }
                        break;
                    }
                    case 'spawn_way': {
                        let speed = evalExpr(block.params.speed, state.variables);
                        let centerAngle = evalExpr(block.params.angle || 'angle', state.variables);
                        let bColor = resolveColorParam(block.params.color, state.variables);
                        let count = Math.max(1, Math.min(CUSTOM_SPAWN_WAY_MAX_COUNT, parseInt(evalExpr(block.params.count || '3', state.variables))));
                        let spread = evalExpr(block.params.spread || '15', state.variables);
                        
                        let ox = evalExpr(block.params.offsetX || '0', state.variables);
                        let oy = evalExpr(block.params.offsetY || '0', state.variables);

                        let spawnX = attacker.x + (state.variables.x_offset || 0) + ox;
                        let spawnY = attacker.y + (state.variables.y_offset || 0) + (isPlayerSide ? -oy : oy);
                        
                        let startAngle = centerAngle - (spread * (count - 1)) / 2;
                        
                        for (let k = 0; k < count; k++) {
                            let angle = startAngle + spread * k;
                            let angleRad = angle * Math.PI / 180;
                            if (isPlayerSide) {
                                angleRad = -angleRad;
                            }
                            
                            let newBullet = {
                                x: spawnX,
                                y: spawnY,
                                startX: spawnX, // 初期位置保存
                                startY: spawnY,
                                vx: Math.cos(angleRad) * speed,
                                vy: Math.sin(angleRad) * speed,
                                radius: 6, // 弾の大きさは6に固定
                                team: attacker.team,
                                color: bColor,
                                customDmg: 20,
                                isCustom: true,
                                update: null
                            };
                            
                            if (block.params.bulletType === 'laser') {
                                newBullet.isLaser = true;
                            }
                            
                            newBullet.threatWeight = computeBulletThreatWeight(
                                spawnX, spawnY, newBullet.vx, newBullet.vy, target.x, target.y
                            );

                            newBullet.bulletState = initBulletState(c.bulletScript || [], speed, angle, attacker, target);
                            newBullet.bulletState.isPlayerSide = isPlayerSide;
                            inheritEmitterVariablesToBullet(state, newBullet.bulletState);
                            newBullet.bulletState.variables.color = bColor;
                            newBullet.sharedEmitterState = state;
                            newBullet.update = (b, bdt) => {
                                runCustomBulletScript(b, bdt, attacker, target);
                            };
                            
                            bullets.push(newBullet);
                        }
                        break;
                    }
                    case 'spawn_magic_circle': {
                        let bColor = resolveColorParam(block.params.color, state.variables);
                        let ox = evalExpr(block.params.offsetX || '0', state.variables);
                        let oy = evalExpr(block.params.offsetY || '0', state.variables);

                        let spawnX = attacker.x + (state.variables.x_offset || 0) + ox;
                        let spawnY = attacker.y + (state.variables.y_offset || 0) + (isPlayerSide ? -oy : oy);

                        let mcId = 'MC_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

                        let newMagicCircle = {
                            id: mcId,
                            x: spawnX,
                            y: spawnY,
                            radius: 18,
                            color: bColor,
                            team: attacker.team,
                            isCustom: true,
                            emitterState: initEmitterState(c.magicCircleScript || [], { x: spawnX, y: spawnY }, target, 0, 0),
                            bulletScript: c.bulletScript || []
                        };

                        magicCircles.push(newMagicCircle);
                        break;
                    }
                    case 'tween_var':
                    case 'tween_var_wait': {
                        let varName = block.params.name || 'angle';
                        let fromVal = evalExpr(block.params.from, state.variables);
                        let toVal   = evalExpr(block.params.to,   state.variables);
                        let mode    = block.params.mode || 'seconds'; // 'seconds' | 'frames' | 'step'
                        if (!state.tweens) state.tweens = [];
                        // 同じ変数の既存tweenを上書き
                        state.tweens = state.tweens.filter(t => t.name !== varName);
                        if (mode === 'step') {
                            let stepVal = evalExpr(block.params.stepVal || '5', state.variables);
                            if (fromVal > toVal && stepVal > 0) stepVal = -stepVal;
                            state.variables[varName] = fromVal;
                            state.tweens.push({ name: varName, to: toVal, mode: 'step', stepVal });
                        } else {
                            let total = evalExpr(block.params.duration || '1', state.variables);
                            if (mode === 'frames') total = Math.max(1, total);
                            else total = Math.max(0.001, total);
                            state.variables[varName] = fromVal;
                            state.tweens.push({ name: varName, from: fromVal, to: toVal, mode, total, elapsed: 0 });
                        }
                        if (block.type === 'tween_var_wait') {
                            state.waitingTweenName = varName;
                        }
                        break;
                    }
                }
                
                if (advancePC) {
                    if (state.stack.length > 0) {
                        state.stack[state.stack.length - 1].pc++;
                    } else {
                        state.pc++;
                    }
                }
                
                if (state.waitTimer > 0 || state.waitingTweenName) {
                    break;
                }
            } // 内側ループ
            
            if (brokeToWait || state.waitingTweenName) {
                // 次のループで waitTimer が消費される
            } else if (!state.finished) {
                break;
            }
        } // 外側ループ
    }

        function initBulletState(script, initialSpeed, initialAngle, attacker, target) {
            let variables = {
                speed: initialSpeed,
                angle: initialAngle,
                timer: 0,
                second: 0,
                frame: 0,
                cardSecond: 0,
                cardFrame: 0,
                isBounced: 0,
                isTouchWall: 0,
                touchingWall: 0,
                isTouchBullet: 0,
                touchingBullet: 0,
                touchColor: '',
                touchX: 0,
                touchY: 0,
                warningTime: 0,
                activeTime: 0,
                laserWidth: 12,
                laserStartTime: null
            };
            let compiledBlocks = (!script || script.length === 0) ? [] : compileIndentedBlocks(JSON.parse(JSON.stringify(script)));

            return {
                blocks: compiledBlocks,
                pc: 0,
                waitTimer: 0,
                stack: [],
                variables: variables,
                lifetimeOnce: new Set(),
                constVars: new Set(),
                speedScaleApplied: new Set(),
                finished: false
            };
        }

        function isBulletExpired(b) {
            if (!b) return true;
            if (b._expired) return true;
            if (!Number.isFinite(b.x) || !Number.isFinite(b.y)) return true;
            if (b.bulletState) {
                let warnT = parseFloat(b.bulletState.variables.warningTime) || 0;
                warnT = Math.max(0, warnT);
                let actT = parseFloat(b.bulletState.variables.activeTime) || 0;
                if (actT > 0 && b.bulletState.variables.warningTime !== undefined) {
                    let laserStart = b.bulletState.variables.laserStartTime;
                    if (laserStart === null || laserStart === undefined) return false;
                    let laserElapsed = (b.bulletState.variables.timer || 0) - laserStart;
                    if (laserElapsed >= warnT + actT) {
                        return true;
                    }
                }
            }
            // 速度ゼロの移動レーザーは線が描画されず配列に残留する
            if (b.isLaser && !b.isWarningLaser && !b.isCustomBeam) {
                if (Math.hypot(b.vx || 0, b.vy || 0) < 1) {
                    return true;
                }
            }
            return false;
        }

        function canTouchOtherBullet(b) {
            return !!(
                b && b.bulletState && !b._expired &&
                !b.isLaser && !b.isWarningLaser && !b.isBombPiece &&
                Number.isFinite(b.x) && Number.isFinite(b.y)
            );
        }

        function getBulletTouchRadius(b) {
            let radius = Number(b && b.hitRadius);
            if (!Number.isFinite(radius) || radius <= 0) radius = Number(b && b.radius);
            if (!Number.isFinite(radius) || radius <= 0) radius = 4;
            return radius;
        }

        window.needsBulletTouchDetection = false;
        window.needsWallTouchDetection = false;
        window.needsEmitterSync = false;

        function checkBulletTouchRequirement() {
            try {
                let allScripts = [];
                if (typeof customCards !== 'undefined') allScripts.push(JSON.stringify(customCards));
                if (typeof activeCards !== 'undefined') allScripts.push(JSON.stringify(activeCards));
                const codeStr = allScripts.join(' ');
                window.needsBulletTouchDetection = (
                    codeStr.includes('isTouchBullet') ||
                    codeStr.includes('touchingBullet') ||
                    codeStr.includes('touchColor') ||
                    codeStr.includes('touchX') ||
                    codeStr.includes('touchY')
                );
                window.needsWallTouchDetection = (
                    codeStr.includes('isBounced') ||
                    codeStr.includes('isTouchWall') ||
                    codeStr.includes('touchingWall') ||
                    codeStr.includes('leftWall') ||
                    codeStr.includes('rightWall') ||
                    codeStr.includes('topWall') ||
                    codeStr.includes('bottomWall')
                );
                window.needsEmitterSync = (
                    codeStr.includes('e_') ||
                    codeStr.includes('emitter_')
                );
            } catch (e) {
                window.needsBulletTouchDetection = true;
                window.needsWallTouchDetection = true;
                window.needsEmitterSync = true;
            }
        }

        function updateBulletTouchStates() {
            if (!Array.isArray(bullets)) return;

            // 定期的に弾の接触判定が必要かをチェック (不要なら即時 return)
            if (Math.random() < 0.02) {
                checkBulletTouchRequirement();
            }
            if (!window.needsBulletTouchDetection) {
                return;
            }

            const candidates = [];
            for (let i = 0; i < bullets.length; i++) {
                const b = bullets[i];
                if (!b) continue;
                b.pendingTouchBullet = null;
                if (canTouchOtherBullet(b)) {
                    b._cachedRadius = getBulletTouchRadius(b);
                    candidates.push(b);
                }
            }

            const len = candidates.length;
            for (let i = 0; i < len; i++) {
                const a = candidates[i];
                const ax = a.x;
                const ay = a.y;
                const ar = a._cachedRadius;
                const aTeam = a.team;
                for (let j = i + 1; j < len; j++) {
                    const b = candidates[j];
                    if (aTeam !== b.team) continue;
                    const rr = ar + b._cachedRadius;
                    const dx = ax - b.x;
                    const dy = ay - b.y;
                    if (dx * dx + dy * dy <= rr * rr) {
                        if (!a.pendingTouchBullet) a.pendingTouchBullet = b;
                        if (!b.pendingTouchBullet) b.pendingTouchBullet = a;
                    }
                }
            }
        }

        function getLaserWidth(b) {
            let width = b && b.bulletState ? parseFloat(b.bulletState.variables.laserWidth) : NaN;
            if (!Number.isFinite(width) || width <= 0) width = b && b.laserWidth ? parseFloat(b.laserWidth) : NaN;
            if (!Number.isFinite(width) || width <= 0) width = 12;
            return Math.max(0, width);
        }

        function runCustomBulletScript(b, dt, attacker, target) {
            let state = b.bulletState;
            if (!state) return;
            if (b.sharedEmitterState && b.sharedEmitterState.variables) {
                state.variables.cardSecond = Number(b.sharedEmitterState.variables.cardSecond || b.sharedEmitterState.variables.second || 0);
                state.variables.cardFrame = Number(b.sharedEmitterState.variables.cardFrame || b.sharedEmitterState.variables.frame || 0);
            } else {
                state.variables.cardSecond = Number(state.variables.cardSecond || state.variables.second || 0);
                state.variables.cardFrame = Number(state.variables.cardFrame || state.variables.frame || 0);
            }
            
            let isPlayerSide = state.isPlayerSide;
            
            // 開始時の座標と角度、速度を記録
            let initX = b.x;
            let initY = isPlayerSide ? (canvas.height - b.y) : b.y;
            let initAngle = Number(state.variables.angle) || 0;
            let initSpeed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
            
            // 毎フレーム壁との接触を判定（スクリプトで壁判定を使用する場合のみ実行）
            if (window.needsWallTouchDetection) {
                let currentlyTouching;
                let hitLeftWall = b.x < 10;
                let hitRightWall = b.x > PLAY_WIDTH - 10;
                let hitTopWall = b.y < 10;
                let hitBottomWall = b.y > canvas.height - 10;
                if (isPlayerSide) { currentlyTouching = (hitLeftWall || hitRightWall || hitBottomWall); }
                else { currentlyTouching = (hitLeftWall || hitRightWall || hitTopWall); }
                let wallTouchTrigger = (currentlyTouching && !b.wasTouchingWall) ? 1 : 0;
                state.variables.isBounced = wallTouchTrigger;
                state.variables.isTouchWall = wallTouchTrigger;
                state.variables.touchingWall = currentlyTouching ? 1 : 0;
                state.variables.leftWall = hitLeftWall ? 1 : 0;
                state.variables.rightWall = hitRightWall ? 1 : 0;
                state.variables.topWall = hitTopWall ? 1 : 0;
                state.variables.bottomWall = hitBottomWall ? 1 : 0;
                b.wasTouchingWall = currentlyTouching;
            } else {
                state.variables.isBounced = 0;
                state.variables.isTouchWall = 0;
                state.variables.touchingWall = 0;
            }

            // 弾同士の接触判定（スクリプトで使用する場合のみ実行）
            if (window.needsBulletTouchDetection) {
                let touchingBullet = b.pendingTouchBullet || null;
                let bulletTouching = !!touchingBullet;
                let bulletTouchTrigger = (bulletTouching && !b.wasTouchingBullet) ? 1 : 0;
                state.variables.isTouchBullet = bulletTouchTrigger;
                state.variables.touchingBullet = bulletTouching ? 1 : 0;
                state.variables.touchColor = touchingBullet ? (touchingBullet.color || '') : '';
                state.variables.touchX = touchingBullet ? touchingBullet.x : 0;
                state.variables.touchY = touchingBullet ? (isPlayerSide ? (canvas.height - touchingBullet.y) : touchingBullet.y) : 0;
                b.wasTouchingBullet = bulletTouching;
            } else {
                state.variables.isTouchBullet = 0;
                state.variables.touchingBullet = 0;
            }
            
            // 初回フレームのみの初期化処理
            if (state.variables.timer === 0) {
                if (b.isLaser && (state.variables.warningTime === undefined || state.variables.warningTime === null)) {
                    state.variables.warningTime = 1.0;
                    state.variables.activeTime = 1.5;
                }
            }
            
            state.variables.timer += dt;
            state.variables.second = (Number(state.variables.second) || 0) + dt;
            state.variables.frame = (Number(state.variables.frame) || 0) + 1;
            if (b.sharedEmitterState && b.sharedEmitterState.variables) {
                state.variables.cardSecond = Number(b.sharedEmitterState.variables.cardSecond || b.sharedEmitterState.variables.second || 0);
                state.variables.cardFrame = Number(b.sharedEmitterState.variables.cardFrame || b.sharedEmitterState.variables.frame || 0);
                
                // コア（エミッター）の変数同期（スクリプトで使用する場合のみ実行）
                if (window.needsEmitterSync) {
                    Object.keys(b.sharedEmitterState.variables).forEach(key => {
                        state.variables['e_' + key] = b.sharedEmitterState.variables[key];
                        state.variables['emitter_' + key] = b.sharedEmitterState.variables[key];
                    });
                }
            } else {
                state.variables.cardSecond = state.variables.second;
                state.variables.cardFrame = state.variables.frame;
            }
            
            state.variables.x = b.x;
            state.variables.y = isPlayerSide ? (canvas.height - b.y) : b.y;
            state.variables.speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
            state.variables.tx = target.x;
            state.variables.ty = isPlayerSide ? (canvas.height - target.y) : target.y;
            
            // 送信機（エミッター）の現在位置
            state.variables.ex = attacker.x;
            state.variables.ey = isPlayerSide ? (canvas.height - attacker.y) : attacker.y;
            state.variables.emitter_x = state.variables.ex;
            state.variables.emitter_y = state.variables.ey;
            
            let dx = target.x - b.x;
            let dy = isPlayerSide ? (b.y - target.y) : (target.y - b.y);
            state.variables.dist = Math.sqrt(dx * dx + dy * dy);
            
            if (!state.finished) {
                let dtRemaining = dt;
                while (dtRemaining > 0 && !state.finished) {
                    if (state.waitTimer > 0) {
                        if (dtRemaining >= state.waitTimer) {
                            dtRemaining -= state.waitTimer;
                            state.waitTimer = 0;
                        } else {
                            state.waitTimer -= dtRemaining;
                            dtRemaining = 0;
                            break;
                        }
                    }
                    
                    let safetyCounter = 0;
                    let brokeToWait = false;
                    while (safetyCounter < 1000) {
                        safetyCounter++;
                        let currentBlocks = state.stack.length > 0 ? state.stack[state.stack.length - 1].blocks : state.blocks;
                        let currentPC = state.stack.length > 0 ? state.stack[state.stack.length - 1].pc : state.pc;
                        
                        if (currentPC >= currentBlocks.length) {
                            if (state.stack.length > 0) {
                                let loopState = state.stack[state.stack.length - 1];
                                if (loopState.forever) {
                                    loopState.pc = 0;
                                    state.waitTimer = Math.max(state.waitTimer || 0, 0.001);
                                    break;
                                } else if (loopState.type === 'while') {
                                    if (evalCondition(loopState.cond || 'false', state.variables)) {
                                        loopState.pc = 0;
                                        state.waitTimer = Math.max(state.waitTimer || 0, 0.001);
                                        break;
                                    }
                                    state.stack.pop();
                                    if (state.stack.length > 0) {
                                        state.stack[state.stack.length - 1].pc++;
                                    } else {
                                        state.pc++;
                                    }
                                    continue;
                                } else {
                                    loopState.iterationsLeft--;
                                    if (loopState.iterationsLeft > 0) {
                                        if (loopState.indexVar) {
                                            loopState.index++;
                                            state.variables[loopState.indexVar] = loopState.index;
                                        }
                                        loopState.pc = 0;
                                        continue;
                                    } else {
                                        state.stack.pop();
                                        if (state.stack.length > 0) {
                                            state.stack[state.stack.length - 1].pc++;
                                        } else {
                                            state.pc++;
                                        }
                                        continue;
                                    }
                                }
                            } else {
                                // 弾の挙動は、最後まで実行し終えたら自動的に最初からループ実行する
                                // once は弾生（この弾が存在する間）で一度きり — ループしてもリセットしない
                                state.pc = 0;
                                state.waitTimer = 0.01; // 1フレーム待機
                                brokeToWait = true;
                                break;
                            }
                        }
                        
                        let block = currentBlocks[currentPC];
                        if (!block) {
                            state.pc = 0;
                            state.waitTimer = 0.01;
                            brokeToWait = true;
                            break;
                        }
                        
                        let advancePC = true;
                        switch (block.type) {
                            case 'wait': {
                                let dur = evalExpr(block.params.duration, state.variables);
                                state.waitTimer = Math.max(0.001, dur);
                                brokeToWait = true;
                                break;
                            }
                            case 'repeat': {
                                let count = Math.round(evalExpr(block.params.count, state.variables));
                                let loopCount = Math.max(1, count);
                                if (block.params.indexVar) state.variables[block.params.indexVar] = 0;
                                state.stack.push({
                                    type: 'repeat',
                                    pc: 0,
                                    iterationsLeft: loopCount,
                                    totalIterations: loopCount,
                                    index: 0,
                                    indexVar: block.params.indexVar || null,
                                    forever: false,
                                    blocks: block.children || []
                                });
                                advancePC = false;
                                break;
                            }
                            case 'forever': {
                                state.stack.push({
                                    type: 'forever',
                                    pc: 0,
                                    iterationsLeft: 999999,
                                    forever: true,
                                    blocks: block.children || []
                                });
                                advancePC = false;
                                break;
                            }
                            case 'while': {
                                let condStr = block.params.cond || 'false';
                                if (evalCondition(condStr, state.variables) && block.children && block.children.length > 0) {
                                    state.stack.push({
                                        type: 'while',
                                        pc: 0,
                                        iterationsLeft: 999999,
                                        forever: false,
                                        cond: condStr,
                                        blocks: block.children || []
                                    });
                                    advancePC = false;
                                }
                                break;
                            }
                            case 'if': {
                                let condStr = block.params.cond || 'x < 10';
                                let isTrue = evalCondition(condStr, state.variables);
                                
                                if (isTrue && block.children && block.children.length > 0) {
                                    state.stack.push({
                                        type: 'if',
                                        pc: 0,
                                        iterationsLeft: 1,
                                        forever: false,
                                        blocks: block.children
                                    });
                                    advancePC = false;
                                }
                                break;
                            }
                            case 'once': {
                                advancePC = executeOnceBlock(block, state);
                                break;
                            }
                            case 'set_laser': {
                                state.variables.warningTime = evalExpr(block.params.warningTime || '1.0', state.variables);
                                state.variables.activeTime = evalExpr(block.params.activeTime || '1.5', state.variables);
                                state.variables.laserWidth = evalExpr(block.params.laserWidth || '12', state.variables);
                                if (state.variables.laserStartTime === null || state.variables.laserStartTime === undefined) {
                                    state.variables.laserStartTime = state.variables.timer;
                                    b.laserStartX = b.x;
                                    b.laserStartY = b.y;
                                }
                                break;
                            }
                            case 'const_var':
                    case 'set_var': {
                                let varName = block.params.name;
                                let val = evalValue(block.params.value, state.variables);
                        setScriptVariable(state, varName, val, block.type === 'const_var');
                                break;
                            }
                            case 'change_var': {
                                let varName = block.params.name;
                                let val = evalExpr(block.params.value, state.variables);
                                let delta = block.params.op === '-' ? -val : val;
                                if (!state.constVars || typeof state.constVars.has !== 'function') state.constVars = new Set();
                                if (!state.constVars.has(varName)) state.variables[varName] = (Number(state.variables[varName]) || 0) + delta;
                                break;
                            }
                            case 'aim_at_target': {
                                let dx = target.x - b.x;
                                let dy = isPlayerSide ? (b.y - target.y) : (target.y - b.y);
                                state.variables.angle = Math.atan2(dy, dx) * 180 / Math.PI;
                                break;
                            }
                            case 'speed_scale': {
                                advancePC = applySpeedScaleBlock(block, state);
                                break;
                            }
                            case 'homing': {
                                let turnSpeed = evalExpr(block.params.turnSpeed || '90', state.variables);
                                let dx = target.x - b.x;
                                let dy = isPlayerSide ? (b.y - target.y) : (target.y - b.y);
                                let targetAngle = Math.atan2(dy, dx) * 180 / Math.PI;
                                
                                let diff = targetAngle - state.variables.angle;
                                diff = ((diff + 180) % 360 + 360) % 360 - 180;
                                
                                let step = turnSpeed * dt;
                                if (Math.abs(diff) < step) {
                                    state.variables.angle = targetAngle;
                                } else {
                                    state.variables.angle += Math.sign(diff) * step;
                                }
                                break;
                            }
                            case 'bounce': {
                                let x = state.variables.x;
                                let y = state.variables.y;
                                let angle = state.variables.angle;
                                let bounced = false;
                                if (x < 10 && Math.cos(angle * Math.PI / 180) < 0) {
                                    angle = 180 - angle;
                                    bounced = true;
                                }
                                if (x > PLAY_WIDTH - 10 && Math.cos(angle * Math.PI / 180) > 0) {
                                    angle = 180 - angle;
                                    bounced = true;
                                }
                                if (y < 10 && Math.sin(angle * Math.PI / 180) < 0) {
                                    angle = -angle;
                                    bounced = true;
                                }
                                // Bottom wall is excluded from bouncing
                                state.variables.angle = ((angle % 360) + 360) % 360;
                                if (bounced) {
                                    state.variables.isBounced = 1;
                                }
                                break;
                            }
                        }
                        
                        if (advancePC) {
                            if (state.stack.length > 0) {
                                state.stack[state.stack.length - 1].pc++;
                            } else {
                                state.pc++;
                            }
                        }
                        
                        if (state.waitTimer > 0) {
                            break;
                        }
                    } // 内側ループ
                    
                    if (brokeToWait) {
                        // 次のループで waitTimer が消費される
                    } else if (!state.finished) {
                        break;
                    }
                } // 外側ループ
            }
            
            // Physics update
            let finalAngleRad = state.variables.angle * Math.PI / 180;
            if (isPlayerSide) {
                finalAngleRad = -finalAngleRad;
            }
            b.vx = Math.cos(finalAngleRad) * state.variables.speed;
            b.vy = Math.sin(finalAngleRad) * state.variables.speed;
            
            // Sync mutated coordinates
            let xChanged = false;
            let yChanged = false;
            let speedChanged = false;
            let angleChanged = false;

            if (state.variables.x !== undefined) {
                if (Math.abs(state.variables.x - initX) > 0.001) {
                    b.x = state.variables.x;
                    xChanged = true;
                }
            }
            if (state.variables.y !== undefined) {
                let targetY = isPlayerSide ? (canvas.height - state.variables.y) : state.variables.y;
                if (Math.abs(targetY - b.y) > 0.001) {
                    b.y = targetY;
                    yChanged = true;
                }
            }
            let currentSpeed = Number(state.variables.speed) || 0;
            if (Math.abs(currentSpeed - initSpeed) > 0.001) {
                speedChanged = true;
            }
            let currentAngle = Number(state.variables.angle) || 0;
            if (Math.abs(currentAngle - initAngle) > 0.001) {
                angleChanged = true;
            }
            if (state.variables.isBounced) {
                angleChanged = true;
            }

            if (xChanged || yChanged || speedChanged || angleChanged || b.laserMoved) {
                b.laserMoved = true;
            }
            
            // Sync custom variables to bullet physics properties
            if (state.variables.bulletType === 'laser') {
                b.isLaser = true;
            } else if (state.variables.bulletType === 'normal') {
                b.isLaser = false;
            }
            if (state.variables.color !== undefined) {
                b.color = state.variables.color;
            }
            b.laserWidth = getLaserWidth(b);
            
            // 設置レーザー（警告線付きビーム）の制御
            let warnT = parseFloat(state.variables.warningTime) || 0;
            warnT = Math.max(0, warnT);
            let actT = parseFloat(state.variables.activeTime) || 0;
            if (actT > 0 && state.variables.warningTime !== undefined) {
                state.variables.warningTime = warnT; // スクリプト側にも反映
                if (state.variables.laserStartTime === null || state.variables.laserStartTime === undefined) {
                    state.variables.laserStartTime = state.variables.timer;
                }
                if (b.laserStartX === undefined) {
                    b.laserStartX = b.x;
                    b.laserStartY = b.y;
                }
                
                if (b.laserMoved) {
                    // 通常の物理演算に基づく移動量を laserStartX / Y に加算
                    b.laserStartX += b.vx * dt;
                    b.laserStartY += b.vy * dt;
                    
                    if (xChanged) b.laserStartX = b.x;
                    if (yChanged) b.laserStartY = b.y;
                    
                    b.x = b.laserStartX;
                    b.y = b.laserStartY;
                    state.variables.x = b.x;
                    state.variables.y = isPlayerSide ? (canvas.height - b.y) : b.y;
                    
                    // 二重移動を防ぐために vx, vy はリセットするが、次回のために speed や angle は維持
                    b.vx = 0;
                    b.vy = 0;
                } else {
                    b.x = b.laserStartX;
                    b.y = b.laserStartY;
                    state.variables.x = b.x;
                    state.variables.y = isPlayerSide ? (canvas.height - b.y) : b.y;
                    b.vx = 0;
                    b.vy = 0;
                    state.variables.speed = 0;
                }
                
                let elapsed = state.variables.timer - state.variables.laserStartTime;
                if (elapsed < warnT) {
                    b.isWarningLaser = true;
                    b.isLaser = false;
                    b.isCustomBeam = false;
                } else if (elapsed < warnT + actT) {
                    b.isWarningLaser = false;
                    b.isLaser = true;
                    b.isCustomBeam = true; // 設置ビームフラグ
                } else {
                    b._expired = true;
                    b.isWarningLaser = false;
                    b.isLaser = false;
                    b.isCustomBeam = false;
                }
            }
        }

        // ==========================================
        // 自作カード作成画面 (管理・ブロックエディタ)
        // ==========================================
        function getBlockCost(block) {
            switch (block.type) {
                case 'repeat':
                case 'forever':
                case 'while':
                case 'wait':
                case 'set_var':
                case 'change_var':
                case 'if':
                case 'const_var':
                case 'aim_at_target':
                case 'move_owner':
                    return 0;
                case 'spawn_bullet':
                case 'bounce':
                    return 1;
                case 'speed_scale':
                    return 1;
                case 'homing':
                    return 2;
                case 'spawn_ring':
                case 'spawn_way':
                case 'tween_var_wait':
                case 'spawn_magic_circle':
                    return 2;
                default:
                    return 0;
            }
        }

        function getStaticComplexityCost(rawBlockCost) {
            // Static syntax is only a small complexity modifier. Real density/danger is measured by simulation.
            let raw = Math.max(0, Number(rawBlockCost) || 0);
            return Math.min(4, Math.sqrt(raw) * 0.55);
        }

        let customCardCostCalcTimer = null;
        let customCardCostCalcSeq = 0;

        function estimateCustomCardEditCost(emitterScript, bulletScript) {
            let baseBlockCost = 0;
            (emitterScript || []).forEach(b => baseBlockCost += getBlockCost(b));
            (bulletScript || []).forEach(b => baseBlockCost += getBlockCost(b));
            return Math.max(1, Math.round(getStaticComplexityCost(baseBlockCost)));
        }

        function setCustomCardCostIndicator(cost, pending = false) {
            let costIndicator = document.getElementById('custom-card-cost-indicator');
            let costVal = document.getElementById('custom-card-cost');
            let testBtn = document.getElementById('custom-card-test-btn');
            let saveBtn = document.getElementById('custom-card-save-btn');
            if (!costVal || !costIndicator) return;

            costVal.textContent = pending ? (cost + '...') : cost;
            let isCostValid = cost <= CUSTOM_CARD_COST_LIMIT;
            if (isCostValid) {
                costIndicator.style.borderColor = pending ? '#ffcc66' : '#00ffcc';
                costIndicator.style.color = pending ? '#ffcc66' : '#00ffcc';
                costIndicator.style.background = pending ? 'rgba(255,204,102,0.1)' : 'rgba(0,255,200,0.1)';
                if (testBtn) {
                    testBtn.disabled = false;
                    testBtn.style.opacity = '1';
                }
                if (saveBtn) saveBtn.disabled = false;
            } else {
                costIndicator.style.borderColor = '#ff3366';
                costIndicator.style.color = '#ff3366';
                costIndicator.style.background = 'rgba(255,50,100,0.1)';
                if (testBtn) {
                    testBtn.disabled = true;
                    testBtn.style.opacity = '0.4';
                }
                if (saveBtn) saveBtn.disabled = false;
            }
        }

        function scheduleCustomCardCostCalculation() {
            let estimate = estimateCustomCardEditCost(customCardMaker.emitterScript, customCardMaker.bulletScript);
            setCustomCardCostIndicator(estimate, true);

            if (customCardCostCalcTimer) clearTimeout(customCardCostCalcTimer);
            let seq = ++customCardCostCalcSeq;
            customCardCostCalcTimer = setTimeout(() => {
                customCardCostCalcTimer = null;
                if (seq !== customCardCostCalcSeq) return;
                setCustomCardCostIndicator(estimate, false);
            }, 250);
        }

        // 弾の進行方向と自機方向の一致度から脅威度(0.15〜1.0)を算出
        function computeBulletThreatWeight(spawnX, spawnY, vx, vy, targetX, targetY) {
            let speed = Math.hypot(vx, vy);
            if (speed < 1) return 0.4;

            let bdx = vx / speed;
            let bdy = vy / speed;
            let tx = targetX - spawnX;
            let ty = targetY - spawnY;
            let tDist = Math.hypot(tx, ty);
            if (tDist < 1) return 1.0;

            tx /= tDist;
            ty /= tDist;
            let alignment = Math.max(-1, Math.min(1, bdx * tx + bdy * ty));

            if (alignment >= 0.75) return 0.75 + 0.25 * ((alignment - 0.75) / 0.25);
            if (alignment >= 0) return 0.35 + 0.4 * (alignment / 0.75);
            return 0.15;
        }

        function calculateCustomCardCost(emitterScript, bulletScript) {
            // 1. 各ブロックの最低基本コストを算出（静的な評価）
            let baseBlockCost = 0;
            (emitterScript || []).forEach(b => baseBlockCost += getBlockCost(b));
            (bulletScript || []).forEach(b => baseBlockCost += getBlockCost(b));

            // 点からレイ（半直線）への最短距離を計算するヘルパー（レーザーの脅威度計算用）
            function getDistanceToRay(px, py, sx, sy, angleDeg) {
                let angleRad = angleDeg * Math.PI / 180;
                let dx = Math.cos(angleRad);
                let dy = Math.sin(angleRad);
                
                let vx = px - sx;
                let vy = py - sy;
                
                let t = vx * dx + vy * dy;
                if (t < 0) {
                    return Math.sqrt(vx * vx + vy * vy);
                } else {
                    let perpX = vx - t * dx;
                    let perpY = vy - t * dy;
                    return Math.sqrt(perpX * perpX + perpY * perpY);
                }
            }

            // 2. シミュレーションによる動的コスト計算
            let simDuration = 15; // スペルカード全体の時間（15秒）
            let fps = 30; // 30FPSで十分高精度かつ高速
            let dt = 1 / fps;
            let totalFrames = simDuration * fps;

            let attacker = { x: PLAY_WIDTH / 2, y: 150, team: 'ENEMY' };
            let target = { x: PLAY_WIDTH / 2, y: (canvas ? canvas.height : 896) * 0.8 };

            let emitterState = initEmitterState(emitterScript, attacker, target);
            let simBullets = [];

            // 実行中のゲームに影響を与えないようにグローバル bullets, magicCircles 配列を退避
            let originalBullets = bullets;
            let originalMagicCircles = magicCircles;
            bullets = [];
            magicCircles = [];

            const MAX_BULLETS_PER_SECOND = 60;
            const MAX_THREAT_PER_SECOND = 60;
            let totalFired = 0;
            let totalWeightedThreat = 0;
            let closeToPlayerScore = 0;
            let activeBulletLoadScore = 0;
            let spawnsThisSecond = 0;
            let lastSimSecond = -1;

            for (let frame = 0; frame < totalFrames; frame++) {
                let currentSecond = Math.floor(frame / fps);
                if (currentSecond !== lastSimSecond) {
                    lastSimSecond = currentSecond;
                    spawnsThisSecond = 0;
                }

                // Emitterの状態更新
                if (!emitterState.finished) {
                    emitterState.variables.x = attacker.x;
                    emitterState.variables.y = attacker.y;
                    emitterState.variables.tx = target.x;
                    emitterState.variables.ty = target.y;
                    let dx = target.x - attacker.x;
                    let dy = target.y - attacker.y;
                    emitterState.variables.dist = Math.sqrt(dx * dx + dy * dy);

                    stepEmitter({ bulletScript: bulletScript }, emitterState, attacker, target, dt);
                }

                // 生成された弾を検知してシミュレーション用配列へ移す（秒間60発まで）
                if (bullets.length > 0) {
                    let spawnedThisFrame = bullets;
                    bullets = [];
                    spawnedThisFrame.forEach(b => {
                        if (spawnsThisSecond >= MAX_BULLETS_PER_SECOND) return;

                        spawnsThisSecond++;
                        let vx = b.vx || 0;
                        let vy = b.vy || 0;
                        let speed = Math.sqrt(vx * vx + vy * vy);
                        let threatWeight = b.threatWeight !== undefined
                            ? b.threatWeight
                            : computeBulletThreatWeight(b.x, b.y, vx, vy, target.x, target.y);
                        totalFired++;
                        totalWeightedThreat += threatWeight;

                        // 異常な無限ループ等でメモリが溢れるのを防ぐため、シミュレート対象は500発に制限
                        if (simBullets.length < 500) {
                            simBullets.push({
                                x: b.x,
                                y: b.y,
                                startX: b.startX,
                                startY: b.startY,
                                vx: vx,
                                vy: vy,
                                radius: b.radius || 6,
                                isLaser: b.isLaser || false,
                                threatWeight: threatWeight,
                                bulletState: b.bulletState ? JSON.parse(JSON.stringify(b.bulletState)) : null,
                                sharedEmitterState: b.sharedEmitterState || emitterState,
                                gotClose: false,
                                offScreen: false
                            });
                        }
                    });
                }

                // シミュレーション中の弾の移動 ＆ 近接判定
                for (let i = 0; i < simBullets.length; i++) {
                    let b = simBullets[i];
                    if (b.offScreen) continue;

                    if (b.bulletState) {
                        runCustomBulletScript(b, dt, attacker, target);
                    } else {
                        b.x += b.vx * dt;
                        b.y += b.vy * dt;
                    }

                    // プレイヤーとの距離計算
                    let distToPlayer;
                    if (b.isLaser) {
                        let angle = (b.bulletState && b.bulletState.variables.angle !== undefined) ? b.bulletState.variables.angle : 0;
                        distToPlayer = getDistanceToRay(target.x, target.y, b.x, b.y, angle);
                    } else {
                        let pdx = b.x - target.x;
                        let pdy = b.y - target.y;
                        distToPlayer = Math.sqrt(pdx * pdx + pdy * pdy);
                    }

                    // 近接加点は弾ごとの脅威度で重み付け（自機狙いは高く、全方位の外れ弾は低く）
                    let warnT = b.bulletState ? (parseFloat(b.bulletState.variables.warningTime) || 0) : 0;
                    let actT = b.bulletState ? (parseFloat(b.bulletState.variables.activeTime) || 0) : 0;
                    let isBeamThreat = b.isLaser || (warnT > 0 && actT > 0);
                    let threatW = b.threatWeight !== undefined ? b.threatWeight : 0.5;
                    let currentSpeed = Math.hypot(b.vx || 0, b.vy || 0);
                    activeBulletLoadScore += threatW * Math.min(2.5, 0.35 + currentSpeed / 220);
                    if (!b.gotClose && distToPlayer < 150) {
                        b.gotClose = true;
                        closeToPlayerScore += isBeamThreat ? (1.5 * threatW) : threatW;
                    }

                    // 画面外判定
                    let currentHeight = canvas ? canvas.height : 896;
                    let isOff = (b.x < 0 || b.x > PLAY_WIDTH || b.y < 0 || b.y > currentHeight);
                    if (isOff) {
                        b.offscreenTime = (b.offscreenTime || 0) + dt;
                    } else {
                        b.offscreenTime = 0;
                    }
                    if (b.x < -PLAY_WIDTH || b.x > PLAY_WIDTH * 2 || b.y < -currentHeight || b.y > currentHeight * 2 || b.offscreenTime >= 10.0) {
                        b.offScreen = true;
                    }
                }

                // すべて処理し終えたら早期ブレイク
                if (emitterState.finished && simBullets.every(b => b.offScreen)) {
                    break;
                }
            }

            // グローバル bullets, magicCircles 配列を復元
            bullets = originalBullets;
            magicCircles = originalMagicCircles;

            // 指標の計算（物理弾数は60発/秒、脅威度は60/秒で上限）
            let threatPerSecond = Math.min(MAX_THREAT_PER_SECOND, totalWeightedThreat / simDuration);
            let closeScorePerSecond = closeToPlayerScore / simDuration;
            let fireRatePerSecond = totalFired / simDuration;
            let activeLoadPerFrame = activeBulletLoadScore / Math.max(1, totalFrames);

            // コスト計算式（脅威度＋近接脅威＋弾速）
            let simCost = Math.sqrt(Math.max(0, threatPerSecond)) * 0.95
                        + Math.sqrt(Math.max(0, closeScorePerSecond)) * 0.75
                        + Math.sqrt(Math.max(0, fireRatePerSecond)) * 0.35
                        + Math.sqrt(Math.max(0, activeLoadPerFrame)) * 0.45;
            let totalCost = simCost + getStaticComplexityCost(baseBlockCost);

            // コストは四捨五入して整数（最低1）
            return Math.max(1, Math.round(totalCost));
        }

        function shareCustomCard(cardId) {
            const card = customCards.find(c => c.id === cardId);
            if (!card) return;
            try {
                const jsonStr = JSON.stringify(card);
                const compressed = LZString.compressToEncodedURIComponent(jsonStr);
                const shareUrl = window.location.origin + window.location.pathname + "?card=" + compressed;
                
                navigator.clipboard.writeText(shareUrl).then(() => {
                    alert(`「${card.name.replace('【A】', '')}」の共有URLをクリップボードにコピーしました！\nこのURLを他の人に教えることで、作成した弾幕を共有できます。`);
                }).catch(err => {
                    prompt("共有URLをコピーしてください：", shareUrl);
                });
            } catch (e) {
                alert("共有URLの作成に失敗しました: " + e.message);
            }
        }

        function importCustomCardFromCode() {
            const code = prompt("共有されたURL、または共有コードを入力してください：");
            if (!code) return;
            
            let cardDataStr = "";
            if (code.includes("?card=")) {
                const urlParams = new URLSearchParams(code.substring(code.indexOf("?")));
                cardDataStr = urlParams.get("card");
            } else {
                cardDataStr = code.trim();
            }
            
            if (cardDataStr) {
                try {
                    const decompressed = LZString.decompressFromEncodedURIComponent(cardDataStr);
                    if (!decompressed) {
                        throw new Error("デコンプレスに失敗しました（データ破損の可能性）");
                    }
                    const card = JSON.parse(decompressed);
                    importCard(card);
                } catch (e) {
                    alert("データのインポートに失敗しました。正しい共有URLまたはコードを入力してください。\nエラー: " + e.message);
                }
            } else {
                alert("有効なコードが見わからんでした。");
            }
        }

        function importCard(card) {
            if (!card.name || !card.emitterScript || !card.bulletScript) {
                alert("無効なカードデータです。");
                return;
            }
            
            card.id = 'cc_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
            let baseName = card.name.replace('【A】', '');
            let name = '【A】' + baseName;
            let count = 1;
            while (customCards.some(c => c.name === name)) {
                name = `【A】${baseName} (${count})`;
                count++;
            }
            card.name = name;
            
            customCards.push(card);
            try {
                localStorage.setItem('touhou_kyoukaisen_custom_cards', JSON.stringify(customCards));
            } catch (e) {}
            
            alert(`スペルカード「${card.name.replace('【A】', '')}」をインポートしました！`);
            integrateCustomCards();
            renderCardMakerList();
        }

        function checkUrlParams() {
            const params = new URLSearchParams(window.location.search);
            const cardDataStr = params.get('card');
            if (cardDataStr) {
                try {
                    const decompressed = LZString.decompressFromEncodedURIComponent(cardDataStr);
                    if (decompressed) {
                        const card = JSON.parse(decompressed);
                        setTimeout(() => {
                            if (confirm(`共有されたスペルカード「${card.name.replace('【A】', '')}」をインポートしますか？`)) {
                                importCard(card);
                                showScreen('screen-card-maker');
                            }
                            const newUrl = window.location.pathname;
                            window.history.replaceState({}, document.title, newUrl);
                        }, 500);
                    }
                } catch (e) {
                    console.error("URLパラメータからのインポートに失敗:", e);
                }
            }
        }

        function renderCardMakerList() {
            const container = document.getElementById('custom-cards-list-container');
            if (!container) return;
            
            container.innerHTML = '';
            
            if (customCards.length === 0) {
                container.innerHTML = '<div style="color:#aaa; font-size:12px; text-align:center; padding:30px 0;">登録されている自作カードはありません。</div>';
                return;
            }
            
            customCards.forEach(card => {
                const item = document.createElement('div');
                item.className = 'custom-card-item';
                
                let descText = card.desc ? card.desc.replace('【自作カード】', '') : '';
                
                item.innerHTML = `
                    <div class="custom-card-info">
                        <span class="custom-card-title">${card.name.replace('【A】', '')}</span>
                        <span class="custom-card-desc">${descText}</span>
                    </div>
                    <span class="custom-card-cost-badge">制限時間: ${getCustomCardDuration(card.duration)}s</span>
                    <div class="custom-card-actions">
                        <button class="custom-card-act-btn btn-edit" onclick="customCardMakerOpenEditor('${card.id}')">編集</button>
                        <button class="custom-card-act-btn btn-edit" style="border-color:#ffaa33 !important; color:#ffaa33 !important; background:rgba(255,170,51,0.05) !important;" onclick="shareCustomCard('${card.id}')">共有</button>
                        <button class="custom-card-act-btn btn-delete" onclick="customCardMakerDeleteCard('${card.id}')">削除</button>
                    </div>
                `;
                container.appendChild(item);
            });
        }

        let customCardDraftSaveTimer = null;

        function saveCustomCardDraft(showNotification = false, skipCodeParse = false, defer = false) {
            if (defer && !showNotification) {
                if (customCardDraftSaveTimer) clearTimeout(customCardDraftSaveTimer);
                customCardDraftSaveTimer = setTimeout(() => {
                    customCardDraftSaveTimer = null;
                    saveCustomCardDraft(false, skipCodeParse, false);
                }, 1200);
                const restoreBtn = document.getElementById('custom-card-draft-load-btn');
                if (restoreBtn) restoreBtn.style.display = 'inline-block';
                return;
            }

            if (customCardDraftSaveTimer) {
                clearTimeout(customCardDraftSaveTimer);
                customCardDraftSaveTimer = null;
            }

            let nameVal = document.getElementById('custom-card-name').value;
            let descVal = document.getElementById('custom-card-desc').value;
            let durationVal = document.getElementById('custom-card-duration') ? document.getElementById('custom-card-duration').value : customCardMaker.duration;
            customCardMaker.duration = getCustomCardDuration(durationVal);
            
            if (customCardMakerMode === 'code' && !skipCodeParse) {
                let code = document.getElementById('workspace-code-textarea').value;
                let parsed = codeToBlocks(code);
                if (customCardMaker.activeTab === 'emitter') {
                    customCardMaker.emitterScript = parsed;
                } else if (customCardMaker.activeTab === 'bullet') {
                    customCardMaker.bulletScript = parsed;
                } else if (customCardMaker.activeTab === 'magicCircle') {
                    customCardMaker.magicCircleScript = parsed;
                }
            }

            let draftData = {
                editingId: customCardMaker.editingId,
                name: nameVal,
                desc: descVal,
                duration: durationVal,
                activeTab: customCardMaker.activeTab,
                customCardMakerMode: customCardMakerMode,
                emitterScript: customCardMaker.emitterScript,
                bulletScript: customCardMaker.bulletScript,
                magicCircleScript: customCardMaker.magicCircleScript || [],
                testPassed: customCardMaker.testPassed,
                x_offset: document.getElementById('custom-card-x-offset') ? document.getElementById('custom-card-x-offset').value : "0",
                y_offset: document.getElementById('custom-card-y-offset') ? document.getElementById('custom-card-y-offset').value : "0",
                codeText: document.getElementById('workspace-code-textarea').value
            };
            
            localStorage.setItem('custom_card_draft', JSON.stringify(draftData));
            
            const restoreBtn = document.getElementById('custom-card-draft-load-btn');
            if (restoreBtn) restoreBtn.style.display = 'inline-block';
            
            if (showNotification) {
                alert("スペルカードの編集状態を一時保存しました。");
            }
        }

        function loadCustomCardDraft() {
            let draftStr = localStorage.getItem('custom_card_draft');
            if (!draftStr) {
                alert("一時保存されたデータがありません。");
                return;
            }
            
            try {
                let draftData = JSON.parse(draftStr);
                customCardMaker.editingId = draftData.editingId;
                customCardMaker.name = draftData.name || 'カスタムスペル';
                customCardMaker.desc = draftData.desc || 'オリジナルの弾幕パターン。';
                customCardMaker.duration = getCustomCardDuration(draftData.duration);
                customCardMaker.activeTab = draftData.activeTab || 'emitter';
                customCardMaker.emitterScript = draftData.emitterScript || [];
                customCardMaker.bulletScript = draftData.bulletScript || [];
                customCardMaker.magicCircleScript = draftData.magicCircleScript || [];
                customCardMaker.testPassed = draftData.testPassed || false;
                
                customCardMakerMode = draftData.customCardMakerMode || 'block';
                
                document.getElementById('custom-card-name').value = customCardMaker.name;
                document.getElementById('custom-card-desc').value = customCardMaker.desc;
                if (document.getElementById('custom-card-duration')) document.getElementById('custom-card-duration').value = customCardMaker.duration;
                customCardMaker.x_offset = Number(draftData.x_offset) || 0;
                customCardMaker.y_offset = Number(draftData.y_offset) || 0;
                if (document.getElementById('custom-card-x-offset')) document.getElementById('custom-card-x-offset').value = customCardMaker.x_offset;
                if (document.getElementById('custom-card-y-offset')) document.getElementById('custom-card-y-offset').value = customCardMaker.y_offset;
                
                document.getElementById('tab-btn-emitter').className = customCardMaker.activeTab === 'emitter' ? 'tab-btn active' : 'tab-btn';
                document.getElementById('tab-btn-bullet').className = customCardMaker.activeTab === 'bullet' ? 'tab-btn active' : 'tab-btn';
                
                const btnBlock = document.getElementById('mode-btn-block');
                const btnCode = document.getElementById('mode-btn-code');
                const blocksContainer = document.getElementById('workspace-blocks-container');
                const codeTextarea = document.getElementById('workspace-code-textarea');
                
                if (customCardMakerMode === 'block') {
                    if (btnBlock) btnBlock.className = 'tab-btn active';
                    if (btnCode) btnCode.className = 'tab-btn';
                    if (blocksContainer) blocksContainer.classList.remove('hidden');
                    if (codeTextarea) codeTextarea.classList.add('hidden');
                } else {
                    if (btnBlock) btnBlock.className = 'tab-btn';
                    if (btnCode) btnCode.className = 'tab-btn active';
                    if (blocksContainer) blocksContainer.classList.add('hidden');
                    if (codeTextarea) codeTextarea.classList.remove('hidden');
                }
                
                if (draftData.codeText !== undefined) {
                    document.getElementById('workspace-code-textarea').value = draftData.codeText;
                } else {
                    let script = customCardMaker.activeTab === 'emitter' ? customCardMaker.emitterScript 
                                : customCardMaker.activeTab === 'bullet' ? customCardMaker.bulletScript 
                                : (customCardMaker.magicCircleScript || []);
                    document.getElementById('workspace-code-textarea').value = blocksToCode(script);
                }
                
                renderCardMaker();
                alert("一時保存データから復元しました。");
            } catch (e) {
                console.error(e);
                alert("データの復元に失敗しました。");
            }
        }

        function customCardMakerOpenEditor(cardId) {
            document.getElementById('card-maker-list-view').classList.add('hidden');
            document.getElementById('card-maker-editor-view').classList.remove('hidden');
            
            const restoreBtn = document.getElementById('custom-card-draft-load-btn');
            if (restoreBtn) {
                if (localStorage.getItem('custom_card_draft')) {
                    restoreBtn.style.display = 'inline-block';
                } else {
                    restoreBtn.style.display = 'none';
                }
            }

            customCardMakerMode = 'block';
            const blocksContainer = document.getElementById('workspace-blocks-container');
            const codeTextarea = document.getElementById('workspace-code-textarea');
            if (blocksContainer) blocksContainer.classList.remove('hidden');
            if (codeTextarea) codeTextarea.classList.add('hidden');
            
            const btnBlock = document.getElementById('mode-btn-block');
            const btnCode = document.getElementById('mode-btn-code');
            if (btnBlock) btnBlock.className = 'tab-btn active';
            if (btnCode) btnCode.className = 'tab-btn';
            
            const palette = document.querySelector('.palette-panel');
            if (palette) {
                palette.style.opacity = '1.0';
                palette.style.pointerEvents = 'auto';
            }
            
            if (cardId) {
                let card = customCards.find(c => c.id === cardId);
                let migratedCard = migrateOldCustomCard(card);
                customCardMaker.editingId = migratedCard.id;
                customCardMaker.name = migratedCard.name.replace('【A】', '');
                customCardMaker.desc = migratedCard.desc;
                customCardMaker.duration = getCustomCardDuration(migratedCard.duration);
                customCardMaker.x_offset = migratedCard.x_offset || 0;
                customCardMaker.y_offset = migratedCard.y_offset || 0;
                customCardMaker.emitterScript = JSON.parse(JSON.stringify(migratedCard.emitterScript || []));
                customCardMaker.bulletScript = JSON.parse(JSON.stringify(migratedCard.bulletScript || []));
                customCardMaker.magicCircleScript = JSON.parse(JSON.stringify(migratedCard.magicCircleScript || []));
                customCardMaker.testPassed = true;
                document.getElementById('card-editor-title').textContent = "スペルカード編集";
            } else {
                customCardMaker.editingId = null;
                customCardMaker.name = 'カスタムスペル';
                customCardMaker.desc = 'オリジナルの弾幕パターン。';
                customCardMaker.duration = 15;
                customCardMaker.emitterScript = [
                    { type: 'repeat', params: { count: '12' }, indent: 0 },
                    { type: 'spawn_bullet', params: { bulletType: 'normal', color: '#ff3333', radius: '6', speed: '200', angle: 'angle' }, indent: 1 },
                    { type: 'change_var', params: { name: 'angle', value: '30' }, indent: 1 },
                    { type: 'wait', params: { duration: '0.2' }, indent: 1 }
                ];
                customCardMaker.x_offset = 0;
                customCardMaker.y_offset = 0;
                customCardMaker.bulletScript = [];
                customCardMaker.magicCircleScript = [];
                customCardMaker.testPassed = false;
                document.getElementById('card-editor-title').textContent = "新規スペルカード作成";
            }
            
            customCardMaker.activeTab = 'emitter';
            
            document.getElementById('custom-card-name').value = customCardMaker.name;
            document.getElementById('custom-card-desc').value = customCardMaker.desc;
            if (document.getElementById('custom-card-duration')) document.getElementById('custom-card-duration').value = customCardMaker.duration;
            if (document.getElementById('custom-card-x-offset')) document.getElementById('custom-card-x-offset').value = customCardMaker.x_offset || 0;
            if (document.getElementById('custom-card-y-offset')) document.getElementById('custom-card-y-offset').value = customCardMaker.y_offset || 0;
            
            renderCardMaker();
        }

        function customCardMakerCloseEditor() {
            document.getElementById('card-maker-editor-view').classList.add('hidden');
            document.getElementById('card-maker-list-view').classList.remove('hidden');
            renderCardMakerList();
        }