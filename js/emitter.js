function applyEasing(t, easing) {
    if (easing === 'easeIn') {
        return t * t;
    } else if (easing === 'easeOut') {
        return t * (2 - t);
    } else if (easing === 'easeInOut') {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    return t; // linear
}

function stepEmitter(c, state, attacker, target, dt) {
            if (!state) return;
            
            let isPlayerSide = state.isPlayerSide;

            // --- tween処理（スムーズ移行）を毎フレーム先に適用 ---
            if (state.tweens && state.tweens.length > 0) {
                state.tweens = state.tweens.filter(tw => {
                    if (tw.isCoordPair) {
                        let nextX, nextY;
                        let isDone = false;
                        
                        if (tw.isStep) {
                            let curX, curY;
                            if (tw.name.includes(',')) {
                                let varNames = tw.name.split(',').map(n => n.trim());
                                curX = Number(state.variables[varNames[0]]) || tw.fromX;
                                curY = Number(state.variables[varNames[1]]) || tw.fromY;
                            } else {
                                curX = Number(state.variables[tw.name + '_x']) || tw.fromX;
                                curY = Number(state.variables[tw.name + '_y']) || tw.fromY;
                            }
                            
                            if (tw.isVecStep) {
                                // 新規：ベクトルベースの等速直線移動（vecstep）
                                let dx = tw.toX - curX;
                                let dy = tw.toY - curY;
                                let dist = Math.sqrt(dx * dx + dy * dy);
                                
                                if (dist <= tw.stepVal || dist === 0) {
                                    nextX = tw.toX;
                                    nextY = tw.toY;
                                    isDone = true;
                                } else {
                                    nextX = curX + (dx / dist) * tw.stepVal;
                                    nextY = curY + (dy / dist) * tw.stepVal;
                                    isDone = false;
                                }
                            } else {
                                // 復元：従来の個別軸加算（step）
                                nextX = curX + tw.stepX;
                                nextY = curY + tw.stepY;
                                
                                let xDone = false;
                                if ((tw.stepX > 0 && nextX >= tw.toX) || (tw.stepX < 0 && nextX <= tw.toX) || tw.stepX === 0) {
                                    nextX = tw.toX;
                                    xDone = true;
                                }
                                let yDone = false;
                                if ((tw.stepY > 0 && nextY >= tw.toY) || (tw.stepY < 0 && nextY <= tw.toY) || tw.stepY === 0) {
                                    nextY = tw.toY;
                                    yDone = true;
                                }
                                isDone = xDone && yDone;
                            }
                        } else {
                            tw.elapsed += (tw.mode === 'seconds') ? dt : 1;
                            let t = Math.min(1, tw.elapsed / tw.total);
                            let easedT = applyEasing(t, tw.easing);
                            nextX = tw.fromX + (tw.toX - tw.fromX) * easedT;
                            nextY = tw.fromY + (tw.toY - tw.fromY) * easedT;
                            isDone = (t >= 1);
                        }
                        
                        // 変数へ書き戻し
                        if (tw.name.includes(',')) {
                            let varNames = tw.name.split(',').map(n => n.trim());
                            state.variables[varNames[0]] = nextX;
                            state.variables[varNames[1]] = nextY;
                        } else {
                            state.variables[tw.name] = `${nextX},${nextY}`;
                            state.variables[tw.name + '_x'] = nextX;
                            state.variables[tw.name + '_y'] = nextY;
                            state.variables[tw.name + '.x'] = nextX;
                            state.variables[tw.name + '.y'] = nextY;
                        }
                        return !isDone;
                    }
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
                    } else if (tw.mode === 'addOverTime') {
                        tw.elapsed += (tw.timeMode === 'seconds') ? dt : 1;
                        let varVal = Number(state.variables[tw.name]) || 0;
                        state.variables[tw.name] = varVal + tw.stepVal;
                        return tw.elapsed < tw.total;
                    } else {
                        // 時間 / フレーム制御の線形補間
                        tw.elapsed += (tw.mode === 'seconds') ? dt : 1;
                        let t = Math.min(1, tw.elapsed / tw.total);
                        let easedT = applyEasing(t, tw.easing);
                        
                        if (tw.isAngleTween) {
                            if (tw.rotMode === 'direct') {
                                state.variables[tw.name] = tw.from + (tw.to - tw.from) * easedT;
                            } else {
                                let diff = ((tw.to - tw.from + 180) % 360 + 360) % 360 - 180;
                                let newAngle = tw.from + diff * easedT;
                                state.variables[tw.name] = ((newAngle % 360) + 360) % 360;
                            }
                        } else {
                            state.variables[tw.name] = tw.from + (tw.to - tw.from) * easedT;
                        }
                        
                        return t < 1; // done if t==1
                    }
                });
            }


            
            // コアの現在位置、ターゲットの現在位置、および距離情報を毎フレーム同期
            state.variables.x = attacker.x;
            state.variables.y = isPlayerSide ? (canvas.height - attacker.y) : attacker.y;
            state.variables.tx = target.x;
            state.variables.ty = isPlayerSide ? (canvas.height - target.y) : target.y;

            // 環境変数 exy, txy (座標ペア) の初期定義
            if (state.variables.exy === undefined) {
                state.variables.exy = `${attacker.x},${state.variables.y}`;
            }
            if (state.variables.ex === undefined) {
                state.variables.ex = attacker.x;
            }
            if (state.variables.ey === undefined) {
                state.variables.ey = state.variables.y;
            }
            // 現在スライド移動中かどうか判定
            const ownerKey = isPlayerSide ? 'PLAYER' : 'CPU';
            const slideLock = (typeof customOwnerPositionLocks !== 'undefined') ? customOwnerPositionLocks[ownerKey] : null;
            const isSliding = slideLock && slideLock.elapsed < slideLock.duration;

            if (isSliding) {
                // スライド中なら、ex / ey / exy をスライド中の現在座標にリアルタイム同期する
                state.variables.ex = attacker.x;
                state.variables.ey = state.variables.y;
                state.variables.exy = `${attacker.x},${state.variables.y}`;
            } else {
                // ドット記法およびアンダーバー記法の子変数同期
                let curExy = String(state.variables.exy).split(',').map(p => parseFloat(p.trim()));
                if (curExy.length === 2 && !isNaN(curExy[0]) && !isNaN(curExy[1])) {
                    state.variables['exy_x'] = curExy[0];
                    state.variables['exy_y'] = curExy[1];
                    state.variables['exy.x'] = curExy[0];
                    state.variables['exy.y'] = curExy[1];
                    // 敵本体の座標を直接 exy に合わせる（見た目も動く）
                    attacker.x = curExy[0];
                    attacker.y = curExy[1];
                    // x_offset/y_offset は 0 に保つ（発射位置は attacker.x/y 基準になる）
                    state.variables.x_offset = 0;
                    state.variables.y_offset = 0;
                }

                // ex / ey 変数による attacker 座標の更新（exy ととは独立して動作）
                if (state.variables.ex !== undefined && !isNaN(Number(state.variables.ex))) {
                    attacker.x = Number(state.variables.ex);
                }
                if (state.variables.ey !== undefined && !isNaN(Number(state.variables.ey))) {
                    // ey は Y軸の論理座標系（自機側なら画面下0、敵機側なら画面上0）なので画面座標に変換
                    attacker.y = isPlayerSide ? (canvas.height - Number(state.variables.ey)) : Number(state.variables.ey);
                }
            }
            state.variables.txy = `${state.variables.tx},${state.variables.ty}`;
            state.variables['txy_x'] = state.variables.tx;
            state.variables['txy_y'] = state.variables.ty;
            state.variables['txy.x'] = state.variables.tx;
            state.variables['txy.y'] = state.variables.ty;
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

            // インラインのparallel{}ブロックのスレッドを毎フレーム実行
            if (state.inlineThreads && state.inlineThreads.length > 0) {
                for (const group of state.inlineThreads) {
                    if (group.done) continue;
                    let allDone = true;
                    for (const thread of group.threads) {
                        if (thread.finished) continue;
                        thread.variables = state.variables;
                        thread.isPlayerSide = state.isPlayerSide;
                        thread.constVars = state.constVars;
                        thread.lifetimeOnce = state.lifetimeOnce;
                        thread.speedScaleApplied = state.speedScaleApplied;
                        stepEmitter(c, thread, attacker, target, dt);
                        if (!thread.finished) allDone = false;
                    }
                    if (allDone) group.done = true;
                }
                state.inlineThreads = state.inlineThreads.filter(g => !g.done);
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
                    case 'play_sound': {
                        let name = block.params.soundName || 'shot';
                        if (typeof playSound === 'function') {
                            playSound(name);
                        }
                        break;
                    }
                    case 'wait': {
                        let dur = evalExpr(block.params.duration, state.variables, block, 'duration');
                        state.waitTimer = Math.max(0.001, dur);
                        brokeToWait = true;
                        break;
                    }
                    case 'repeat': {
                        let count = Math.round(evalExpr(block.params.count, state.variables, block, 'count'));
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
                        if (evalCondition(condStr, state.variables, block, 'cond') && block.children && block.children.length > 0) {
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
                        let isTrue = evalCondition(condStr, state.variables, block, 'cond');
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
                    case 'aim_at_coord': {
                        let txRaw = evalExpr(block.params.targetX || '0', state.variables);
                        let tyRaw = evalExpr(block.params.targetY || '0', state.variables);
                        let txAbs = Number(txRaw) || 0;
                        let tyAbs = isPlayerSide ? (canvas.height - (Number(tyRaw) || 0)) : (Number(tyRaw) || 0);
                        let dxC = txAbs - (attacker.x + (state.variables.x_offset || 0));
                        let dyC = tyAbs - (attacker.y + (state.variables.y_offset || 0));
                        state.variables.angle = Math.atan2(dyC, dxC) * 180 / Math.PI;
                        break;
                    }
                    case 'move_owner': {
                        const owner = attacker === player ? 'PLAYER' : 'CPU';
                        const preset = resolveTextParam(block.params.preset || 'center', state.variables);
                        const duration = evalExpr(block.params.duration || '0', state.variables);
                        setCustomOwnerPosition(owner, preset, duration);
                        applyCustomOwnerPositionLock(owner, 0);
                        
                        // 移動先の座標を取得して ex, ey, exy に即座に反映させ、古い座標への引き戻しを防ぐ
                        if (typeof getCustomOwnerPosition !== 'undefined') {
                            const targetPos = getCustomOwnerPosition(owner, preset);
                            if (targetPos) {
                                state.variables.ex = targetPos.x;
                                state.variables.ey = isPlayerSide ? (canvas.height - targetPos.y) : targetPos.y;
                                state.variables.exy = `${targetPos.x},${state.variables.ey}`;
                            }
                        }
                        break;
                    }
                    case 'spawn_bullet':
                    case 'spawn_bullet_resist':
                    case 'spawn_trail':
                    case 'spawn_trail_resist': {
                        let isTrail = block.type === 'spawn_trail' || block.type === 'spawn_trail_resist';
                        let speed = evalExpr(block.params.speed, state.variables);
                        let angle = evalExpr(block.params.angle, state.variables);
                        let bColor = resolveColorParam(block.params.color, state.variables);
                        
                        let ox = evalExpr(block.params.offsetX || '0', state.variables);
                        let oy = evalExpr(block.params.offsetY || '0', state.variables);

                        let coordMode = block.params.coordMode || 'relative';
                        let spawnX, spawnY;
                        if (coordMode === 'absolute') {
                            spawnX = ox;
                            spawnY = isPlayerSide ? (canvas.height - oy) : oy;
                        } else {
                            spawnX = attacker.x + (state.variables.x_offset || 0) + ox;
                            spawnY = attacker.y + (state.variables.y_offset || 0) + (isPlayerSide ? -oy : oy);
                        }

                        let angleRad = angle * Math.PI / 180;
                        if (isPlayerSide) {
                            angleRad = -angleRad;
                        }
                        
                        let bRadius = evalExpr(block.params.radius || (isTrail ? '8' : '6'), state.variables);
                        let bHitRadius = block.params.hitRadius ? evalExpr(block.params.hitRadius, state.variables) : undefined;
                        if (bHitRadius !== undefined) {
                            let hrNum = Number(bHitRadius);
                            if (!isNaN(hrNum) && hrNum < 0.1) bHitRadius = 0;
                        }
                        let bImg = isTrail ? 'none' : (block.params.bulletImage || 'none');

                        let newBullet = {
                            x: spawnX,
                            y: spawnY,
                            startX: spawnX, // 初期位置保存
                            startY: spawnY,
                            vx: Math.cos(angleRad) * speed,
                            vy: Math.sin(angleRad) * speed,
                            radius: bRadius,
                            hitRadius: bHitRadius,
                            bulletImage: bImg,
                            team: attacker.team,
                            color: bColor,
                            customDmg: 20, // custom card damage balanced to 20
                            isCustom: true,
                            update: null
                        };
                        
                        if (block.params.bulletType === 'laser') {
                            newBullet.isLaser = true;
                        }
                        if (block.params.bulletType === 'trail') {
                            isTrail = true;
                        }
                        if (isTrail) {
                            newBullet.isTrail = true;
                            newBullet.growTime = (block.params.growTime !== undefined && block.params.growTime !== '') ? Number(evalExpr(block.params.growTime, state.variables)) : 0.2;
                            newBullet.keepTime = (block.params.keepTime !== undefined && block.params.keepTime !== '') ? Number(evalExpr(block.params.keepTime, state.variables)) : 0.3;
                            newBullet.shrinkTime = (block.params.shrinkTime !== undefined && block.params.shrinkTime !== '') ? Number(evalExpr(block.params.shrinkTime, state.variables)) : 0.5;
                            newBullet.round = (block.params.round !== undefined) ? (block.params.round === 'true' || block.params.round === true) : true;
                            newBullet.trailHistory = [];
                        }
                        if (block.type === 'spawn_bullet_resist' || block.type === 'spawn_trail_resist') {
                            newBullet.destroyResist = true;
                        }

                        newBullet.threatWeight = computeBulletThreatWeight(
                            spawnX, spawnY, newBullet.vx, newBullet.vy, target.x, target.y
                        );

                        newBullet.bulletState = initBulletState(c.bulletScript || [], speed, angle, attacker, target);
                        newBullet.bulletState.magicCircleScript = c.magicCircleScript || [];
                        newBullet.bulletState.isPlayerSide = isPlayerSide;
                        inheritEmitterVariablesToBullet(state, newBullet.bulletState);
                        newBullet.bulletState.variables.bulletType = isTrail ? 'trail' : (block.params.bulletType || 'normal');
                        if (isTrail) {
                            newBullet.bulletState.variables.growTime = block.params.growTime || '0.2';
                            newBullet.bulletState.variables.keepTime = block.params.keepTime || '0.3';
                            newBullet.bulletState.variables.shrinkTime = block.params.shrinkTime || '0.5';
                            newBullet.bulletState.variables.round = (block.params.round !== undefined) ? String(block.params.round) : 'true';
                        }
                        newBullet.bulletState.variables.color = bColor;
                        newBullet.bulletState.variables.radius = bRadius;
                        newBullet.bulletState.variables.hitRadius = bHitRadius !== undefined ? bHitRadius : '';
                        newBullet.bulletState.variables.bulletImage = bImg;
                        newBullet.sharedEmitterState = state;
                        newBullet.update = (b, bdt) => {
                            runCustomBulletScript(b, bdt, attacker, target);
                        };
                        
                        if (window.showDebugProfiler) {
                            console.log(`[DEBUG] spawn_bullet: x=${spawnX.toFixed(1)}, y=${spawnY.toFixed(1)}, color=${bColor}, speed=${speed}, angle=${angle}`);
                        }
                        bullets.push(newBullet);
                        break;
                    }
                    case 'spawn_ring':
                    case 'spawn_ring_resist': {
                        let speed = evalExpr(block.params.speed, state.variables);
                        let bColor = resolveColorParam(block.params.color, state.variables);
                        let count = Math.max(3, Math.min(CUSTOM_SPAWN_RING_MAX_COUNT, parseInt(evalExpr(block.params.count || '12', state.variables))));
                        
                        let ox = evalExpr(block.params.offsetX || '0', state.variables);
                        let oy = evalExpr(block.params.offsetY || '0', state.variables);

                        let coordMode = block.params.coordMode || 'relative';
                        let spawnX, spawnY;
                        if (coordMode === 'absolute') {
                            spawnX = ox;
                            spawnY = isPlayerSide ? (canvas.height - oy) : oy;
                        } else {
                            spawnX = attacker.x + (state.variables.x_offset || 0) + ox;
                            spawnY = attacker.y + (state.variables.y_offset || 0) + (isPlayerSide ? -oy : oy);
                        }
                        
                        let bRadius = evalExpr(block.params.radius || '6', state.variables);
                        let bHitRadius = block.params.hitRadius ? evalExpr(block.params.hitRadius, state.variables) : undefined;
                        if (bHitRadius !== undefined) {
                            let hrNum = Number(bHitRadius);
                            if (!isNaN(hrNum) && hrNum < 0.1) bHitRadius = 0;
                        }
                        let bImg = block.params.bulletImage || 'none';
                        let centerAngle = evalExpr(block.params.angle || '0', state.variables);

                        for (let k = 0; k < count; k++) {
                            let angle = centerAngle + (360 / count) * k;
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
                                radius: bRadius,
                                hitRadius: bHitRadius,
                                bulletImage: bImg,
                                team: attacker.team,
                                color: bColor,
                                customDmg: 20,
                                isCustom: true,
                                update: null
                            };
                            
                            if (block.params.bulletType === 'laser') {
                                newBullet.isLaser = true;
                            }
                            if (block.type === 'spawn_ring_resist') {
                                newBullet.destroyResist = true;
                            }
                            
                            newBullet.threatWeight = computeBulletThreatWeight(
                                spawnX, spawnY, newBullet.vx, newBullet.vy, target.x, target.y
                            );

                            newBullet.bulletState = initBulletState(c.bulletScript || [], speed, angle, attacker, target);
                            newBullet.bulletState.magicCircleScript = c.magicCircleScript || [];
                            newBullet.bulletState.isPlayerSide = isPlayerSide;
                            inheritEmitterVariablesToBullet(state, newBullet.bulletState);
                            newBullet.bulletState.variables.color = bColor;
                            newBullet.bulletState.variables.radius = bRadius;
                            newBullet.bulletState.variables.hitRadius = bHitRadius !== undefined ? bHitRadius : '';
                            newBullet.bulletState.variables.bulletImage = bImg;
                            newBullet.sharedEmitterState = state;
                            newBullet.update = (b, bdt) => {
                                runCustomBulletScript(b, bdt, attacker, target);
                            };
                            
                            bullets.push(newBullet);
                        }
                        if (window.showDebugProfiler) {
                            console.log(`[DEBUG] spawn_ring: x=${spawnX.toFixed(1)}, y=${spawnY.toFixed(1)}, color=${bColor}, speed=${speed}, count=${count}, angle=${centerAngle}`);
                        }
                        break;
                    }
                    case 'spawn_way':
                    case 'spawn_way_resist': {
                        let speed = evalExpr(block.params.speed, state.variables);
                        let centerAngle = evalExpr(block.params.angle || 'angle', state.variables);
                        let bColor = resolveColorParam(block.params.color, state.variables);
                        let count = Math.max(1, Math.min(CUSTOM_SPAWN_WAY_MAX_COUNT, parseInt(evalExpr(block.params.count || '3', state.variables))));
                        let spread = evalExpr(block.params.spread || '15', state.variables);
                        
                        let ox = evalExpr(block.params.offsetX || '0', state.variables);
                        let oy = evalExpr(block.params.offsetY || '0', state.variables);

                        let coordMode = block.params.coordMode || 'relative';
                        let spawnX, spawnY;
                        if (coordMode === 'absolute') {
                            spawnX = ox;
                            spawnY = isPlayerSide ? (canvas.height - oy) : oy;
                        } else {
                            spawnX = attacker.x + (state.variables.x_offset || 0) + ox;
                            spawnY = attacker.y + (state.variables.y_offset || 0) + (isPlayerSide ? -oy : oy);
                        }
                        
                        let bRadius = evalExpr(block.params.radius || '6', state.variables);
                        let bHitRadius = block.params.hitRadius ? evalExpr(block.params.hitRadius, state.variables) : undefined;
                        if (bHitRadius !== undefined) {
                            let hrNum = Number(bHitRadius);
                            if (!isNaN(hrNum) && hrNum < 0.1) bHitRadius = 0;
                        }
                        let bImg = block.params.bulletImage || 'none';

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
                                radius: bRadius,
                                hitRadius: bHitRadius,
                                bulletImage: bImg,
                                team: attacker.team,
                                color: bColor,
                                customDmg: 20,
                                isCustom: true,
                                update: null
                            };
                            
                            if (block.params.bulletType === 'laser') {
                                newBullet.isLaser = true;
                            }
                            if (block.type === 'spawn_way_resist') {
                                newBullet.destroyResist = true;
                            }
                            
                            newBullet.threatWeight = computeBulletThreatWeight(
                                spawnX, spawnY, newBullet.vx, newBullet.vy, target.x, target.y
                            );

                            newBullet.bulletState = initBulletState(c.bulletScript || [], speed, angle, attacker, target);
                            newBullet.bulletState.magicCircleScript = c.magicCircleScript || [];
                            newBullet.bulletState.isPlayerSide = isPlayerSide;
                            inheritEmitterVariablesToBullet(state, newBullet.bulletState);
                            newBullet.bulletState.variables.color = bColor;
                            newBullet.bulletState.variables.radius = bRadius;
                            newBullet.bulletState.variables.hitRadius = bHitRadius !== undefined ? bHitRadius : '';
                            newBullet.bulletState.variables.bulletImage = bImg;
                            newBullet.sharedEmitterState = state;
                            newBullet.update = (b, bdt) => {
                                runCustomBulletScript(b, bdt, attacker, target);
                            };
                            
                            bullets.push(newBullet);
                        }
                        if (window.showDebugProfiler) {
                            console.log(`[DEBUG] spawn_way: x=${spawnX.toFixed(1)}, y=${spawnY.toFixed(1)}, color=${bColor}, speed=${speed}, count=${count}, spread=${spread}, centerAngle=${centerAngle}`);
                        }
                        break;
                    }
                    case 'spawn_beam':
                    case 'spawn_beam_resist': {
                        let wt = Number(evalExpr(block.params.warningTime || '1.0', state.variables));
                        let at = Number(evalExpr(block.params.activeTime || '1.5', state.variables));
                        let lw = Number(evalExpr(block.params.laserWidth || '12', state.variables));
                        let angle = evalExpr(block.params.angle || 'angle', state.variables);
                        let ox = evalExpr(block.params.offsetX || '0', state.variables);
                        let oy = evalExpr(block.params.offsetY || '0', state.variables);
                        let cm = block.params.coordMode || 'relative';
                        let spawnX, spawnY;
                        if (cm === 'absolute') {
                            spawnX = ox;
                            spawnY = isPlayerSide ? (canvas.height - oy) : oy;
                        } else {
                            spawnX = attacker.x + (state.variables.x_offset || 0) + ox;
                            spawnY = attacker.y + (state.variables.y_offset || 0) + (isPlayerSide ? -oy : oy);
                        }
                        let bHitRadius = block.params.hitRadius ? evalExpr(block.params.hitRadius, state.variables) : undefined;
                        if (bHitRadius !== undefined) {
                            let hrNum = Number(bHitRadius);
                            if (!isNaN(hrNum) && hrNum < 0.1) bHitRadius = 0;
                        }
                        let bColor = resolveColorParam('#ff3333', state.variables);

                        let angleRad = angle * Math.PI / 180;
                        if (isPlayerSide) angleRad = -angleRad;

                        let newBullet = {
                            x: spawnX,
                            y: spawnY,
                            startX: spawnX,
                            startY: spawnY,
                            vx: 0,
                            vy: 0,
                            radius: 8,
                            hitRadius: bHitRadius,
                            bulletImage: 'none',
                            team: attacker.team,
                            color: bColor,
                            customDmg: 20,
                            isCustom: true,
                            isWarningLaser: true,
                            isLaser: false,
                            isCustomBeam: false,
                            laserStartX: spawnX,
                            laserStartY: spawnY,
                            update: null
                        };
                        if (block.type === 'spawn_beam_resist') {
                            newBullet.destroyResist = true;
                        }
                        newBullet.threatWeight = 100;
                        newBullet.bulletState = initBulletState([], 0, angle, attacker, target);
                        newBullet.bulletState.isPlayerSide = isPlayerSide;
                        inheritEmitterVariablesToBullet(state, newBullet.bulletState);
                        newBullet.bulletState.variables.bulletType = 'laser';
                        newBullet.bulletState.variables.warningTime = String(wt);
                        newBullet.bulletState.variables.activeTime = String(at);
                        newBullet.bulletState.variables.laserWidth = String(lw);
                        newBullet.bulletState.variables.laserStartTime = state.variables.timer;
                        newBullet.bulletState.variables.timer = 0;
                        newBullet.bulletState.variables.color = bColor;
                        newBullet.bulletState.variables.radius = 8;
                        newBullet.bulletState.variables.hitRadius = bHitRadius !== undefined ? bHitRadius : '';
                        newBullet.sharedEmitterState = state;
                        newBullet.update = (b, bdt) => {
                            runCustomBulletScript(b, bdt, attacker, target);
                        };
                        bullets.push(newBullet);
                        break;
                    }
                    case 'spawn_laser_way':
                    case 'spawn_laser_way_resist': {
                        let speed = evalExpr(block.params.speed || '200', state.variables);
                        let centerAngle = evalExpr(block.params.angle || 'angle', state.variables);
                        let bColor = resolveColorParam(block.params.color || '#ff3333', state.variables);
                        let count = Math.max(1, Math.min(CUSTOM_SPAWN_WAY_MAX_COUNT, parseInt(evalExpr(block.params.count || '3', state.variables))));
                        let spread = evalExpr(block.params.spread || '45', state.variables);
                        let ox = evalExpr(block.params.offsetX || '0', state.variables);
                        let oy = evalExpr(block.params.offsetY || '0', state.variables);
                        let cm = block.params.coordMode || 'relative';
                        let spawnX, spawnY;
                        if (cm === 'absolute') {
                            spawnX = ox;
                            spawnY = isPlayerSide ? (canvas.height - oy) : oy;
                        } else {
                            spawnX = attacker.x + (state.variables.x_offset || 0) + ox;
                            spawnY = attacker.y + (state.variables.y_offset || 0) + (isPlayerSide ? -oy : oy);
                        }
                        let bRadius = evalExpr(block.params.radius || '6', state.variables);
                        let bHitRadius = block.params.hitRadius ? evalExpr(block.params.hitRadius, state.variables) : undefined;
                        if (bHitRadius !== undefined) {
                            let hrNum = Number(bHitRadius);
                            if (!isNaN(hrNum) && hrNum < 0.1) bHitRadius = 0;
                        }
                        let startAngle = centerAngle - (spread * (count - 1)) / 2;
                        for (let k = 0; k < count; k++) {
                            let angle = startAngle + spread * k;
                            let angleRad = angle * Math.PI / 180;
                            if (isPlayerSide) angleRad = -angleRad;
                            let newBullet = {
                                x: spawnX,
                                y: spawnY,
                                startX: spawnX,
                                startY: spawnY,
                                vx: Math.cos(angleRad) * speed,
                                vy: Math.sin(angleRad) * speed,
                                radius: bRadius,
                                hitRadius: bHitRadius,
                                bulletImage: 'none',
                                team: attacker.team,
                                color: bColor,
                                customDmg: 20,
                                isCustom: true,
                                isTrail: true,
                                trailHistory: [],
                                growTime: (block.params.growTime !== undefined && block.params.growTime !== '') ? Number(evalExpr(block.params.growTime, state.variables)) : 0.2,
                                keepTime: (block.params.keepTime !== undefined && block.params.keepTime !== '') ? Number(evalExpr(block.params.keepTime, state.variables)) : 0.3,
                                shrinkTime: (block.params.shrinkTime !== undefined && block.params.shrinkTime !== '') ? Number(evalExpr(block.params.shrinkTime, state.variables)) : 0.5,
                                round: block.params.round !== 'false' && block.params.round !== false,
                                update: null
                            };
                            if (block.type === 'spawn_laser_way_resist') {
                                newBullet.destroyResist = true;
                            }
                            newBullet.threatWeight = computeBulletThreatWeight(spawnX, spawnY, newBullet.vx, newBullet.vy, target.x, target.y);
                            newBullet.bulletState = initBulletState(c.bulletScript || [], speed, angle, attacker, target);
                            newBullet.bulletState.magicCircleScript = c.magicCircleScript || [];
                            newBullet.bulletState.isPlayerSide = isPlayerSide;
                            inheritEmitterVariablesToBullet(state, newBullet.bulletState);
                            newBullet.bulletState.variables.color = bColor;
                            newBullet.bulletState.variables.radius = bRadius;
                            newBullet.bulletState.variables.hitRadius = bHitRadius !== undefined ? bHitRadius : '';
                            newBullet.bulletState.variables.growTime = newBullet.growTime;
                            newBullet.bulletState.variables.keepTime = newBullet.keepTime;
                            newBullet.bulletState.variables.shrinkTime = newBullet.shrinkTime;
                            newBullet.bulletState.variables.bulletImage = 'none';
                            newBullet.sharedEmitterState = state;
                            newBullet.update = (b, bdt) => {
                                runCustomBulletScript(b, bdt, attacker, target);
                            };
                            bullets.push(newBullet);
                        }
                        break;
                    }
                    case 'spawn_laser_ring':
                    case 'spawn_laser_ring_resist': {
                        let speed = evalExpr(block.params.speed || '200', state.variables);
                        let centerAngle = evalExpr(block.params.angle || 'angle', state.variables);
                        let bColor = resolveColorParam(block.params.color || '#ff3333', state.variables);
                        let count = Math.max(3, Math.min(CUSTOM_SPAWN_RING_MAX_COUNT, parseInt(evalExpr(block.params.count || '12', state.variables))));
                        let ox = evalExpr(block.params.offsetX || '0', state.variables);
                        let oy = evalExpr(block.params.offsetY || '0', state.variables);
                        let cm = block.params.coordMode || 'relative';
                        let spawnX, spawnY;
                        if (cm === 'absolute') {
                            spawnX = ox;
                            spawnY = isPlayerSide ? (canvas.height - oy) : oy;
                        } else {
                            spawnX = attacker.x + (state.variables.x_offset || 0) + ox;
                            spawnY = attacker.y + (state.variables.y_offset || 0) + (isPlayerSide ? -oy : oy);
                        }
                        let bRadius = evalExpr(block.params.radius || '6', state.variables);
                        let bHitRadius = block.params.hitRadius ? evalExpr(block.params.hitRadius, state.variables) : undefined;
                        if (bHitRadius !== undefined) {
                            let hrNum = Number(bHitRadius);
                            if (!isNaN(hrNum) && hrNum < 0.1) bHitRadius = 0;
                        }
                        for (let k = 0; k < count; k++) {
                            let angle = centerAngle + (360 / count) * k;
                            let angleRad = angle * Math.PI / 180;
                            if (isPlayerSide) angleRad = -angleRad;
                            let newBullet = {
                                x: spawnX,
                                y: spawnY,
                                startX: spawnX,
                                startY: spawnY,
                                vx: Math.cos(angleRad) * speed,
                                vy: Math.sin(angleRad) * speed,
                                radius: bRadius,
                                hitRadius: bHitRadius,
                                bulletImage: 'none',
                                team: attacker.team,
                                color: bColor,
                                customDmg: 20,
                                isCustom: true,
                                isTrail: true,
                                trailHistory: [],
                                growTime: (block.params.growTime !== undefined && block.params.growTime !== '') ? Number(evalExpr(block.params.growTime, state.variables)) : 0.2,
                                keepTime: (block.params.keepTime !== undefined && block.params.keepTime !== '') ? Number(evalExpr(block.params.keepTime, state.variables)) : 0.3,
                                shrinkTime: (block.params.shrinkTime !== undefined && block.params.shrinkTime !== '') ? Number(evalExpr(block.params.shrinkTime, state.variables)) : 0.5,
                                round: block.params.round !== 'false' && block.params.round !== false,
                                update: null
                            };
                            if (block.type === 'spawn_laser_ring_resist') {
                                newBullet.destroyResist = true;
                            }
                            newBullet.threatWeight = computeBulletThreatWeight(spawnX, spawnY, newBullet.vx, newBullet.vy, target.x, target.y);
                            newBullet.bulletState = initBulletState(c.bulletScript || [], speed, angle, attacker, target);
                            newBullet.bulletState.magicCircleScript = c.magicCircleScript || [];
                            newBullet.bulletState.isPlayerSide = isPlayerSide;
                            inheritEmitterVariablesToBullet(state, newBullet.bulletState);
                            newBullet.bulletState.variables.color = bColor;
                            newBullet.bulletState.variables.radius = bRadius;
                            newBullet.bulletState.variables.hitRadius = bHitRadius !== undefined ? bHitRadius : '';
                            newBullet.bulletState.variables.growTime = newBullet.growTime;
                            newBullet.bulletState.variables.keepTime = newBullet.keepTime;
                            newBullet.bulletState.variables.shrinkTime = newBullet.shrinkTime;
                            newBullet.bulletState.variables.bulletImage = 'none';
                            newBullet.sharedEmitterState = state;
                            newBullet.update = (b, bdt) => {
                                runCustomBulletScript(b, bdt, attacker, target);
                            };
                            bullets.push(newBullet);
                        }
                        break;
                    }
                    case 'spawn_beam_way':
                    case 'spawn_beam_way_resist': {
                        let wt = Number(evalExpr(block.params.warningTime || '1.0', state.variables));
                        let at = Number(evalExpr(block.params.activeTime || '1.5', state.variables));
                        let lw = Number(evalExpr(block.params.laserWidth || '12', state.variables));
                        let centerAngle = evalExpr(block.params.angle || 'angle', state.variables);
                        let count = Math.max(1, Math.min(CUSTOM_SPAWN_WAY_MAX_COUNT, parseInt(evalExpr(block.params.count || '3', state.variables))));
                        let spread = evalExpr(block.params.spread || '45', state.variables);
                        let ox = evalExpr(block.params.offsetX || '0', state.variables);
                        let oy = evalExpr(block.params.offsetY || '0', state.variables);
                        let cm = block.params.coordMode || 'relative';
                        let spawnX, spawnY;
                        if (cm === 'absolute') {
                            spawnX = ox;
                            spawnY = isPlayerSide ? (canvas.height - oy) : oy;
                        } else {
                            spawnX = attacker.x + (state.variables.x_offset || 0) + ox;
                            spawnY = attacker.y + (state.variables.y_offset || 0) + (isPlayerSide ? -oy : oy);
                        }
                        let bHitRadius = block.params.hitRadius ? evalExpr(block.params.hitRadius, state.variables) : undefined;
                        if (bHitRadius !== undefined) {
                            let hrNum = Number(bHitRadius);
                            if (!isNaN(hrNum) && hrNum < 0.1) bHitRadius = 0;
                        }
                        let bColor = resolveColorParam('#ff3333', state.variables);
                        let startAngle = centerAngle - (spread * (count - 1)) / 2;
                        for (let k = 0; k < count; k++) {
                            let angle = startAngle + spread * k;
                            let newBullet = {
                                x: spawnX,
                                y: spawnY,
                                startX: spawnX,
                                startY: spawnY,
                                vx: 0,
                                vy: 0,
                                radius: 8,
                                hitRadius: bHitRadius,
                                bulletImage: 'none',
                                team: attacker.team,
                                color: bColor,
                                customDmg: 20,
                                isCustom: true,
                                isWarningLaser: true,
                                isLaser: false,
                                isCustomBeam: false,
                                laserStartX: spawnX,
                                laserStartY: spawnY,
                                update: null
                            };
                            if (block.type === 'spawn_beam_way_resist') {
                                newBullet.destroyResist = true;
                            }
                            newBullet.threatWeight = 100;
                            newBullet.bulletState = initBulletState([], 0, angle, attacker, target);
                            newBullet.bulletState.isPlayerSide = isPlayerSide;
                            inheritEmitterVariablesToBullet(state, newBullet.bulletState);
                            newBullet.bulletState.variables.bulletType = 'laser';
                            newBullet.bulletState.variables.warningTime = String(wt);
                            newBullet.bulletState.variables.activeTime = String(at);
                            newBullet.bulletState.variables.laserWidth = String(lw);
                            newBullet.bulletState.variables.laserStartTime = state.variables.timer;
                            newBullet.bulletState.variables.timer = 0;
                            newBullet.bulletState.variables.color = bColor;
                            newBullet.bulletState.variables.radius = 8;
                            newBullet.bulletState.variables.hitRadius = bHitRadius !== undefined ? bHitRadius : '';
                            newBullet.sharedEmitterState = state;
                            newBullet.update = (b, bdt) => {
                                runCustomBulletScript(b, bdt, attacker, target);
                            };
                            bullets.push(newBullet);
                        }
                        break;
                    }
                    case 'spawn_beam_ring':
                    case 'spawn_beam_ring_resist': {
                        let wt = Number(evalExpr(block.params.warningTime || '1.0', state.variables));
                        let at = Number(evalExpr(block.params.activeTime || '1.5', state.variables));
                        let lw = Number(evalExpr(block.params.laserWidth || '12', state.variables));
                        let centerAngle = evalExpr(block.params.angle || 'angle', state.variables);
                        let count = Math.max(3, Math.min(CUSTOM_SPAWN_RING_MAX_COUNT, parseInt(evalExpr(block.params.count || '12', state.variables))));
                        let ox = evalExpr(block.params.offsetX || '0', state.variables);
                        let oy = evalExpr(block.params.offsetY || '0', state.variables);
                        let cm = block.params.coordMode || 'relative';
                        let spawnX, spawnY;
                        if (cm === 'absolute') {
                            spawnX = ox;
                            spawnY = isPlayerSide ? (canvas.height - oy) : oy;
                        } else {
                            spawnX = attacker.x + (state.variables.x_offset || 0) + ox;
                            spawnY = attacker.y + (state.variables.y_offset || 0) + (isPlayerSide ? -oy : oy);
                        }
                        let bHitRadius = block.params.hitRadius ? evalExpr(block.params.hitRadius, state.variables) : undefined;
                        if (bHitRadius !== undefined) {
                            let hrNum = Number(bHitRadius);
                            if (!isNaN(hrNum) && hrNum < 0.1) bHitRadius = 0;
                        }
                        let bColor = resolveColorParam('#ff3333', state.variables);
                        for (let k = 0; k < count; k++) {
                            let angle = centerAngle + (360 / count) * k;
                            let newBullet = {
                                x: spawnX,
                                y: spawnY,
                                startX: spawnX,
                                startY: spawnY,
                                vx: 0,
                                vy: 0,
                                radius: 8,
                                hitRadius: bHitRadius,
                                bulletImage: 'none',
                                team: attacker.team,
                                color: bColor,
                                customDmg: 20,
                                isCustom: true,
                                isWarningLaser: true,
                                isLaser: false,
                                isCustomBeam: false,
                                laserStartX: spawnX,
                                laserStartY: spawnY,
                                update: null
                            };
                            if (block.type === 'spawn_beam_ring_resist') {
                                newBullet.destroyResist = true;
                            }
                            newBullet.threatWeight = 100;
                            newBullet.bulletState = initBulletState([], 0, angle, attacker, target);
                            newBullet.bulletState.isPlayerSide = isPlayerSide;
                            inheritEmitterVariablesToBullet(state, newBullet.bulletState);
                            newBullet.bulletState.variables.bulletType = 'laser';
                            newBullet.bulletState.variables.warningTime = String(wt);
                            newBullet.bulletState.variables.activeTime = String(at);
                            newBullet.bulletState.variables.laserWidth = String(lw);
                            newBullet.bulletState.variables.laserStartTime = state.variables.timer;
                            newBullet.bulletState.variables.timer = 0;
                            newBullet.bulletState.variables.color = bColor;
                            newBullet.bulletState.variables.radius = 8;
                            newBullet.bulletState.variables.hitRadius = bHitRadius !== undefined ? bHitRadius : '';
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
                            emitterState: initEmitterState(c.magicCircleScript || [], { x: spawnX, y: spawnY }, target, 0, 0, c.id, '_magic'),
                            bulletScript: c.magicCircleScript || []
                        };
                        newMagicCircle.emitterState.magicCircleScript = c.magicCircleScript || [];

                        magicCircles.push(newMagicCircle);
                        break;
                    }
                    case 'tween_angle':
                    case 'tween_angle_wait': {
                        let varName = 'angle';
                        let fromVal = evalExpr(block.params.from || '0', state.variables);
                        let toVal = evalExpr(block.params.to || '360', state.variables);
                        let duration = evalExpr(block.params.duration || '1', state.variables);
                        let mode = block.params.mode || 'seconds';
                        if (mode === 'frames') duration = Math.max(1, duration);
                        else duration = Math.max(0.001, duration);
                        
                        if (!state.tweens) state.tweens = [];
                        state.tweens = state.tweens.filter(t => t.name !== varName);
                        
                        state.tweens.push({
                            name: varName,
                            mode: mode,
                            from: fromVal,
                            to: toVal,
                            total: duration,
                            elapsed: 0,
                            easing: block.params.easing || 'linear',
                            isAngleTween: true,
                            rotMode: block.params.rotMode || 'shortest'
                        });
                        
                        if (block.type === 'tween_angle_wait') {
                            state.waitingTweenName = varName;
                        }
                        break;
                    }

                    case 'tween_var':
                    case 'tween_var_wait': {
                        let varName = block.params.name || 'angle';
                        let isMultiVar = varName.includes(',');
                        
                        let fromVal, toVal;
                        if (isMultiVar) {
                            let fromParts = (block.params.from || '').split(',').map(p => evalExpr(p.trim(), state.variables));
                            let toParts = (block.params.to || '').split(',').map(p => evalExpr(p.trim(), state.variables));
                            fromVal = `${fromParts[0] || 0},${fromParts[1] || 0}`;
                            toVal = `${toParts[0] || 0},${toParts[1] || 0}`;
                        } else {
                            fromVal = evalExpr(block.params.from, state.variables);
                            toVal   = evalExpr(block.params.to,   state.variables);
                        }

                        let mode    = block.params.mode || 'seconds'; // 'seconds' | 'frames' | 'step'
                        if (!state.tweens) state.tweens = [];
                        // 同じ変数の既存tweenを上書き
                        state.tweens = state.tweens.filter(t => t.name !== varName);

                        // 座標ペア（コンマ区切り文字列）の tween 補間の処理
                        if (typeof toVal === 'string' && toVal.includes(',')) {
                            let toParts = toVal.split(',').map(p => parseFloat(p.trim()));
                            let fromParts = String(fromVal).split(',').map(p => parseFloat(p.trim()));
                            if (toParts.length === 2 && fromParts.length === 2 && !isNaN(toParts[0]) && !isNaN(toParts[1]) && !isNaN(fromParts[0]) && !isNaN(fromParts[1])) {
                                state.variables[varName] = fromVal;
                                if (mode === 'step' || mode === 'vecstep') {
                                    let stepVal = evalExpr(block.params.stepVal || block.params.value || '5', state.variables);
                                    if (mode === 'vecstep') {
                                        state.tweens.push({
                                            name: varName,
                                            isCoordPair: true,
                                            isStep: true,
                                            isVecStep: true,
                                            fromX: fromParts[0],
                                            toX: toParts[0],
                                            fromY: fromParts[1],
                                            toY: toParts[1],
                                            stepVal: stepVal,
                                            mode,
                                            total: 1,
                                            elapsed: 0
                                        });
                                    } else {
                                        // 従来の step モードの復元（各軸独立して加算）
                                        let stepX = stepVal;
                                        let stepY = stepVal;
                                        if (fromParts[0] > toParts[0] && stepX > 0) stepX = -stepX;
                                        if (fromParts[1] > toParts[1] && stepY > 0) stepY = -stepY;
                                        if (fromParts[0] === toParts[0]) stepX = 0;
                                        if (fromParts[1] === toParts[1]) stepY = 0;

                                        state.tweens.push({
                                            name: varName,
                                            isCoordPair: true,
                                            isStep: true,
                                            isVecStep: false,
                                            fromX: fromParts[0],
                                            toX: toParts[0],
                                            fromY: fromParts[1],
                                            toY: toParts[1],
                                            stepX: stepX,
                                            stepY: stepY,
                                            mode,
                                            total: 1,
                                            elapsed: 0
                                        });
                                    }
                                } else {
                                    // 通常の時間ベースの補間
                                    let total = evalExpr(block.params.duration || '1', state.variables);
                                    if (mode === 'frames') total = Math.max(1, total);
                                    else total = Math.max(0.001, total);
                                    state.tweens.push({
                                        name: varName,
                                        isCoordPair: true,
                                        isStep: false,
                                        fromX: fromParts[0],
                                        toX: toParts[0],
                                        fromY: fromParts[1],
                                        toY: toParts[1],
                                        mode,
                                        total,
                                        elapsed: 0,
                                        easing: block.params.easing || 'linear'
                                    });
                                }
                                // 子変数を即座に初期化
                                state.variables[varName + '_x'] = fromParts[0];
                                state.variables[varName + '_y'] = fromParts[1];
                                state.variables[varName + '.x'] = fromParts[0];
                                state.variables[varName + '.y'] = fromParts[1];
                                if (block.type === 'tween_var_wait') {
                                    state.waitingTweenName = varName;
                                }
                                break;
                            }
                        }

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
                            state.tweens.push({ name: varName, from: fromVal, to: toVal, mode, total, elapsed: 0, easing: block.params.easing || 'linear' });
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

        function initBulletState(script, initialSpeed, initialAngle, attacker, target, compiledFn) {

            let variables = {
                speed: initialSpeed,
                angle: initialAngle,
                spriteAngle: initialAngle,
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
                finished: false,
                compiledFn: compiledFn || null
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
                b.hitRadius !== 0 &&
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
        window.needsDistanceCalc = false;
        window.needsXyCoord = false;

        function checkBulletTouchRequirement() {
            try {
                let allScripts = [];
                if (typeof activeCards !== 'undefined' && Array.isArray(activeCards)) {
                    activeCards.forEach(c => {
                        if (!c) return;
                        if (c.emitterScript) {
                            if (typeof c.emitterScript === 'string') {
                                allScripts.push(c.emitterScript);
                            } else {
                                allScripts.push(JSON.stringify(c.emitterScript));
                            }
                        }
                        if (c.bulletScript) {
                            if (typeof c.bulletScript === 'string') {
                                allScripts.push(c.bulletScript);
                            } else {
                                allScripts.push(JSON.stringify(c.bulletScript));
                            }
                        }
                    });
                }
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
                    codeStr.includes('bottomWall') ||
                    codeStr.includes('Edge')
                );
                window.needsEmitterSync = (
                    /\be_[a-zA-Z0-9_]+/i.test(codeStr) ||
                    /\bemitter_[a-zA-Z0-9_]+/i.test(codeStr)
                );
                window.needsDistanceCalc = (
                    codeStr.includes('dist') ||
                    codeStr.includes('speed') ||
                    codeStr.includes('aim') ||
                    codeStr.includes('homing')
                );
                window.needsXyCoord = (
                    codeStr.includes('xy')
                );
            } catch (e) {
                console.error("Error in checkBulletTouchRequirement:", e);
                window.needsBulletTouchDetection = true;
                window.needsWallTouchDetection = true;
                window.needsEmitterSync = true;
                window.needsDistanceCalc = true;
                window.needsXyCoord = true;
            }
        }

        let lastActiveCardsRef = null;

        function updateBulletTouchStates() {
            if (!Array.isArray(bullets)) return;

            // 新しくアクティブなカードがセットされた、またはカード切り替え時に即座に要件スキャンを実行する
            let currentCardsRef = (typeof activeCards !== 'undefined') ? activeCards : null;
            if (currentCardsRef !== lastActiveCardsRef) {
                lastActiveCardsRef = currentCardsRef;
                checkBulletTouchRequirement();
            }

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
            if (len === 0) return;

            // 簡易空間分割法 (Grid Spatial Partitioning) の導入
            const cellSize = 64;
            const grid = new Map();

            // 弾をセルに登録
            for (let i = 0; i < len; i++) {
                const b = candidates[i];
                b._candidateId = i;
                const col = Math.floor(b.x / cellSize);
                const row = Math.floor(b.y / cellSize);
                const key = `${col}_${row}`;
                let list = grid.get(key);
                if (!list) {
                    list = [];
                    grid.set(key, list);
                }
                list.push(b);
            }

            // 近傍セルの弾同士のみで当たり判定
            for (let i = 0; i < len; i++) {
                const a = candidates[i];
                const ax = a.x;
                const ay = a.y;
                const ar = a._cachedRadius;
                const aTeam = a.team;
                const aId = a._candidateId;

                const col = Math.floor(ax / cellSize);
                const row = Math.floor(ay / cellSize);

                // 自身と周囲8セルの計9セルを調べる
                for (let dCol = -1; dCol <= 1; dCol++) {
                    for (let dRow = -1; dRow <= 1; dRow++) {
                        const targetKey = `${col + dCol}_${row + dRow}`;
                        const cellBullets = grid.get(targetKey);
                        if (!cellBullets) continue;

                        const cellLen = cellBullets.length;
                        for (let j = 0; j < cellLen; j++) {
                            const b = cellBullets[j];
                            // aId < b._candidateId で重複判定を完全に防ぐ
                            if (aId >= b._candidateId || aTeam !== b.team) continue;

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

            // ── 超軽量化処理：完了済みの弾は b.update を削除して二度と処理しない ──
            // (Reverted to ensure 100% original behavior)
            const _t0 = performance.now();

            const _hasTweens = state.tweens && state.tweens.length > 0;            
            // --- tween処理（スムーズ移行）を毎フレーム先に適用 ---
            if (state.tweens && state.tweens.length > 0) {
                state.tweens = state.tweens.filter(tw => {
                    if (tw.isCoordPair) {
                        let nextX, nextY;
                        let isDone = false;
                        
                        if (tw.isStep) {
                            let curX, curY;
                            if (tw.name.includes(',')) {
                                let varNames = tw.name.split(',').map(n => n.trim());
                                curX = Number(state.variables[varNames[0]]) || tw.fromX;
                                curY = Number(state.variables[varNames[1]]) || tw.fromY;
                            } else {
                                curX = Number(state.variables[tw.name + '_x']) || tw.fromX;
                                curY = Number(state.variables[tw.name + '_y']) || tw.fromY;
                            }
                            
                            if (tw.isVecStep) {
                                let dx = tw.toX - curX;
                                let dy = tw.toY - curY;
                                let dist = Math.sqrt(dx * dx + dy * dy);
                                
                                if (dist <= tw.stepVal || dist === 0) {
                                    nextX = tw.toX;
                                    nextY = tw.toY;
                                    isDone = true;
                                } else {
                                    nextX = curX + (dx / dist) * tw.stepVal;
                                    nextY = curY + (dy / dist) * tw.stepVal;
                                    isDone = false;
                                }
                            } else {
                                nextX = curX + tw.stepX;
                                nextY = curY + tw.stepY;
                                
                                let xDone = false;
                                if ((tw.stepX > 0 && nextX >= tw.toX) || (tw.stepX < 0 && nextX <= tw.toX) || tw.stepX === 0) {
                                    nextX = tw.toX;
                                    xDone = true;
                                }
                                let yDone = false;
                                if ((tw.stepY > 0 && nextY >= tw.toY) || (tw.stepY < 0 && nextY <= tw.toY) || tw.stepY === 0) {
                                    nextY = tw.toY;
                                    yDone = true;
                                }
                                isDone = xDone && yDone;
                            }
                        } else {
                            tw.elapsed += (tw.mode === 'seconds') ? dt : 1;
                            let t = Math.min(1, tw.elapsed / tw.total);
                            let easedT = applyEasing(t, tw.easing);
                            nextX = tw.fromX + (tw.toX - tw.fromX) * easedT;
                            nextY = tw.fromY + (tw.toY - tw.fromY) * easedT;
                            isDone = (t >= 1);
                        }
                        
                        // 変数へ書き戻し
                        if (tw.name.includes(',')) {
                            let varNames = tw.name.split(',').map(n => n.trim());
                            state.variables[varNames[0]] = nextX;
                            state.variables[varNames[1]] = nextY;
                        } else {
                            state.variables[tw.name] = `${nextX},${nextY}`;
                            state.variables[tw.name + '_x'] = nextX;
                            state.variables[tw.name + '_y'] = nextY;
                            state.variables[tw.name + '.x'] = nextX;
                            state.variables[tw.name + '.y'] = nextY;
                        }
                        return !isDone;
                    }
                    if (tw.mode === 'step') {
                        let cur = Number(state.variables[tw.name]) || 0;
                        let step = tw.stepVal;
                        let next = cur + step;
                        if ((step > 0 && next >= tw.to) || (step < 0 && next <= tw.to)) {
                            state.variables[tw.name] = tw.to;
                            return false; // done
                        }
                        state.variables[tw.name] = next;
                        return true;
                    } else if (tw.mode === 'addOverTime') {
                        tw.elapsed += (tw.timeMode === 'seconds') ? dt : 1;
                        let varVal = Number(state.variables[tw.name]) || 0;
                        state.variables[tw.name] = varVal + tw.stepVal;
                        return tw.elapsed < tw.total;
                    } else {
                        tw.elapsed += (tw.mode === 'seconds') ? dt : 1;
                        let t = Math.min(1, tw.elapsed / tw.total);
                        let easedT = applyEasing(t, tw.easing);
                        
                        if (tw.isAngleTween) {
                            if (tw.rotMode === 'direct') {
                                state.variables[tw.name] = tw.from + (tw.to - tw.from) * easedT;
                            } else {
                                let diff = ((tw.to - tw.from + 180) % 360 + 360) % 360 - 180;
                                let newAngle = tw.from + diff * easedT;
                                state.variables[tw.name] = ((newAngle % 360) + 360) % 360;
                            }
                        } else {
                            state.variables[tw.name] = tw.from + (tw.to - tw.from) * easedT;
                        }
                        
                        return t < 1; // done if t==1
                    }
                });
            }
            const _t1 = performance.now(); // tween完了
            if (window.bulletDebugCount === undefined) window.bulletDebugCount = 0;
            if (b.bulletDebugId === undefined) {
                b.bulletDebugId = window.bulletDebugCount++;
            }
            let shouldLog = window.showDebugProfiler && b.bulletDebugId < 15; // デバッグモード時のみ最初の15発のみログ対象
            if (window.currentCardSecond !== undefined) {
                state.variables.cardSecond = window.currentCardSecond;
                state.variables.cardFrame = window.currentCardFrame || 0;
            } else if (b.sharedEmitterState && b.sharedEmitterState.variables) {
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
            
            // 毎フレーム壁および画面端との接触を判定（スクリプトで使用する場合のみ実行）
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

                // 新規：画面端（Edge）の判定 (x <= 0 や y <= 0 など、完全に画面外・境界線に達したか)
                let hitLeftEdge = b.x <= 0;
                let hitRightEdge = b.x >= PLAY_WIDTH;
                let hitTopEdge = b.y <= 0;
                let hitBottomEdge = b.y >= canvas.height;
                let currentlyTouchingEdge = (hitLeftEdge || hitRightEdge || hitTopEdge || hitBottomEdge);
                let edgeTouchTrigger = (currentlyTouchingEdge && !b.wasTouchingEdge) ? 1 : 0;
                state.variables.isTouchEdge = edgeTouchTrigger;
                state.variables.touchingEdge = currentlyTouchingEdge ? 1 : 0;
                state.variables.leftEdge = hitLeftEdge ? 1 : 0;
                state.variables.rightEdge = hitRightEdge ? 1 : 0;
                state.variables.topEdge = hitTopEdge ? 1 : 0;
                state.variables.bottomEdge = hitBottomEdge ? 1 : 0;
                b.wasTouchingEdge = currentlyTouchingEdge;
            } else {
                state.variables.isBounced = 0;
                state.variables.isTouchWall = 0;
                state.variables.touchingWall = 0;
                state.variables.isTouchEdge = 0;
                state.variables.touchingEdge = 0;
                state.variables.leftEdge = 0;
                state.variables.rightEdge = 0;
                state.variables.topEdge = 0;
                state.variables.bottomEdge = 0;
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
            if (window.currentCardSecond !== undefined) {
                state.variables.cardSecond = window.currentCardSecond;
                state.variables.cardFrame = window.currentCardFrame || 0;
                
                // コア（エミッター）の変数同期（スクリプトで使用する場合のみ実行）
                if (window.needsEmitterSync && b.sharedEmitterState && b.sharedEmitterState.variables) {
                    const vars = b.sharedEmitterState.variables;
                    for (let key in vars) {
                        if (Object.prototype.hasOwnProperty.call(vars, key)) {
                            state.variables['e_' + key] = vars[key];
                            state.variables['emitter_' + key] = vars[key];
                        }
                    }
                }
            } else if (b.sharedEmitterState && b.sharedEmitterState.variables) {
                state.variables.cardSecond = Number(b.sharedEmitterState.variables.cardSecond || b.sharedEmitterState.variables.second || 0);
                state.variables.cardFrame = Number(b.sharedEmitterState.variables.cardFrame || b.sharedEmitterState.variables.frame || 0);
                
                // コア（エミッター）の変数同期（スクリプトで使用する場合のみ実行）
                if (window.needsEmitterSync) {
                    const vars = b.sharedEmitterState.variables;
                    for (let key in vars) {
                        if (Object.prototype.hasOwnProperty.call(vars, key)) {
                            state.variables['e_' + key] = vars[key];
                            state.variables['emitter_' + key] = vars[key];
                        }
                    }
                }
            } else {
                state.variables.cardSecond = state.variables.second;
                state.variables.cardFrame = state.variables.frame;
            }
            
            state.variables.x = b.x;
            state.variables.y = isPlayerSide ? (canvas.height - b.y) : b.y;
            let initXY = undefined;
            if (window.needsXyCoord) {
                state.variables.xy = `${state.variables.x},${state.variables.y}`;
                initXY = state.variables.xy;
                state.variables['xy_x'] = state.variables.x;
                state.variables['xy_y'] = state.variables.y;
                state.variables['xy.x'] = state.variables.x;
                state.variables['xy.y'] = state.variables.y;
            }
            state.variables.tx = target.x;
            state.variables.ty = isPlayerSide ? (canvas.height - target.y) : target.y;

            // 送信機（エミッター）の現在位置（差分追従方式で上書きを防ぐ）
            let emitterDx = attacker.x - (b.prevEmitterX !== undefined ? b.prevEmitterX : attacker.x);
            let emitterDy = attacker.y - (b.prevEmitterY !== undefined ? b.prevEmitterY : attacker.y);
            
            if (state.variables.ex === undefined || state.variables.ex === null) {
                state.variables.ex = attacker.x;
                state.variables.ey = isPlayerSide ? (canvas.height - attacker.y) : attacker.y;
            } else {
                state.variables.ex += emitterDx;
                state.variables.ey += isPlayerSide ? -emitterDy : emitterDy;
            }
            state.variables.emitter_x = state.variables.ex;
            state.variables.emitter_y = state.variables.ey;
            
            b.prevEmitterX = attacker.x;
            b.prevEmitterY = attacker.y;

            // スクリプトで使用する場合のみ、Math.sqrt (平方根) 計算を実行して高速化
            if (window.needsDistanceCalc) {
                state.variables.speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
                let dx = target.x - b.x;
                let dy = isPlayerSide ? (b.y - target.y) : (target.y - b.y);
                state.variables.dist = Math.sqrt(dx * dx + dy * dy);
            } else {
                state.variables.speed = b.vx * b.vx + b.vy * b.vy === 0 ? 0 : 200; // ダミー値（平方根を回避）
                state.variables.dist = 0;
            }
            
            const _t2 = performance.now(); // セットアップ完了

            if (!state.finished) {
                // --- AOT コンパイル済みジェネレータパス ---
                if (state.compiledFn) {
                    if (!state.compiledGenerator) {
                        window.DanmakuCompilerRuntime._initBulletState = initBulletState;
                        window.DanmakuCompilerRuntime._runCustomBulletScript = runCustomBulletScript;
                        window.DanmakuCompilerRuntime._computeBulletThreatWeight = computeBulletThreatWeight;
                        state.compiledGenerator = state.compiledFn(state, b, attacker, target, window.DanmakuCompilerRuntime);
                    }
                    const result = state.compiledGenerator.next();
                    if (result.done) { state.finished = true; }
                } else {
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
                    const stack = state.stack;
                    const vars = state.variables;
                    while (safetyCounter < 1000) {
                        safetyCounter++;
                        const stackLen = stack.length;
                        const currentBlocks = stackLen > 0 ? stack[stackLen - 1].blocks : state.blocks;
                        const currentPC = stackLen > 0 ? stack[stackLen - 1].pc : state.pc;
                        
                        if (currentPC >= currentBlocks.length) {
                            if (stackLen > 0) {
                                let loopState = stack[stackLen - 1];
                                if (loopState.forever) {
                                    loopState.pc = 0;
                                    state.waitTimer = Math.max(state.waitTimer || 0, 0.001);
                                    break;
                                } else if (loopState.type === 'while') {
                                    if (evalCondition(loopState.cond || 'false', vars)) {
                                        loopState.pc = 0;
                                        state.waitTimer = Math.max(state.waitTimer || 0, 0.001);
                                        break;
                                    }
                                    stack.pop();
                                    if (stack.length > 0) {
                                        stack[stack.length - 1].pc++;
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
                                let dur = evalExpr(block.params.duration, state.variables, block, 'duration');
                                state.waitTimer = Math.max(0.001, dur);
                                brokeToWait = true;
                                break;
                            }
                            case 'repeat': {
                                let count = Math.round(evalExpr(block.params.count, state.variables, block, 'count'));
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
                                if (evalCondition(condStr, state.variables, block, 'cond') && block.children && block.children.length > 0) {
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
                                let isTrue = evalCondition(condStr, state.variables, block, 'cond');
                                
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
                                state.variables.warningTime = evalExpr(block.params.warningTime || '1.0', state.variables, block, 'warningTime');
                                state.variables.activeTime = evalExpr(block.params.activeTime || '1.5', state.variables, block, 'activeTime');
                                state.variables.laserWidth = evalExpr(block.params.laserWidth || '12', state.variables, block, 'laserWidth');
                                if (state.variables.laserStartTime === null || state.variables.laserStartTime === undefined) {
                                    state.variables.laserStartTime = state.variables.timer;
                                    b.laserStartX = b.x;
                                    b.laserStartY = b.y;
                                }
                                break;
                            }
                            case 'spawn_bullet':
                            case 'spawn_trail':
                            case 'spawn_trail_resist': {
                                let isTrail = block.type === 'spawn_trail' || block.type === 'spawn_trail_resist';
                                let speed = evalExpr(block.params.speed, state.variables, block, 'speed');
                                let angle = evalExpr(block.params.angle || 'angle', state.variables, block, 'angle');
                                let bColor = resolveColorParam(block.params.color, state.variables);
                                let ox = evalExpr(block.params.offsetX || '0', state.variables, block, 'offsetX');
                                let oy = evalExpr(block.params.offsetY || '0', state.variables, block, 'offsetY');

                                let coordMode = block.params.coordMode || 'relative';
                                let spawnX, spawnY;
                                if (coordMode === 'absolute') {
                                    spawnX = ox;
                                    spawnY = isPlayerSide ? (canvas.height - oy) : oy;
                                } else {
                                    spawnX = b.x + (state.variables.x_offset || 0) + ox;
                                    spawnY = b.y + (state.variables.y_offset || 0) + (isPlayerSide ? -oy : oy);
                                }
                                
                                let bRadius = evalExpr(block.params.radius || (isTrail ? '8' : '6'), state.variables, block, 'radius');
                                let bHitRadius = block.params.hitRadius ? evalExpr(block.params.hitRadius, state.variables, block, 'hitRadius') : undefined;
                                if (bHitRadius !== undefined) {
                                    let hrNum = Number(bHitRadius);
                                    if (!isNaN(hrNum) && hrNum < 0.1) bHitRadius = 0;
                                }
                                let bImg = isTrail ? 'none' : (block.params.bulletImage || 'none');

                                let angleRad = angle * Math.PI / 180;
                                if (isPlayerSide) {
                                    angleRad = -angleRad;
                                }

                                let newBullet = {
                                    x: spawnX,
                                    y: spawnY,
                                    startX: spawnX,
                                    startY: spawnY,
                                    vx: Math.cos(angleRad) * speed,
                                    vy: Math.sin(angleRad) * speed,
                                    radius: bRadius,
                                    hitRadius: bHitRadius,
                                    bulletImage: bImg,
                                    team: attacker.team,
                                    color: bColor,
                                    customDmg: 20,
                                    isCustom: true,
                                    update: null
                                };

                                if (block.params.bulletType === 'laser') {
                                    newBullet.isLaser = true;
                                }
                                if (block.params.bulletType === 'trail') {
                                    isTrail = true;
                                }
                                if (isTrail) {
                                    newBullet.isTrail = true;
                                    newBullet.growTime = (block.params.growTime !== undefined && block.params.growTime !== '') ? Number(evalExpr(block.params.growTime, state.variables, block, 'growTime')) : 0.2;
                                    newBullet.keepTime = (block.params.keepTime !== undefined && block.params.keepTime !== '') ? Number(evalExpr(block.params.keepTime, state.variables, block, 'keepTime')) : 0.3;
                                    newBullet.shrinkTime = (block.params.shrinkTime !== undefined && block.params.shrinkTime !== '') ? Number(evalExpr(block.params.shrinkTime, state.variables, block, 'shrinkTime')) : 0.5;
                                    newBullet.round = (block.params.round !== undefined) ? (block.params.round === 'true' || block.params.round === true) : true;
                                    newBullet.trailHistory = [];
                                }
                                if (block.type === 'spawn_trail_resist') {
                                    newBullet.destroyResist = true;
                                }

                                newBullet.threatWeight = computeBulletThreatWeight(
                                    spawnX, spawnY, newBullet.vx, newBullet.vy, target.x, target.y
                                );

                                let childScript = state.magicCircleScript || [];
                                newBullet.bulletState = initBulletState(childScript, speed, angle, attacker, target);
                                newBullet.bulletState.magicCircleScript = childScript;
                                newBullet.bulletState.isPlayerSide = isPlayerSide;
                                inheritEmitterVariablesToBullet(state, newBullet.bulletState);
                                newBullet.bulletState.variables.bulletType = isTrail ? 'trail' : (block.params.bulletType || 'normal');
                                if (isTrail) {
                                    newBullet.bulletState.variables.growTime = block.params.growTime || '0.2';
                                    newBullet.bulletState.variables.keepTime = block.params.keepTime || '0.3';
                                    newBullet.bulletState.variables.shrinkTime = block.params.shrinkTime || '0.5';
                                    newBullet.bulletState.variables.round = (block.params.round !== undefined) ? String(block.params.round) : 'true';
                                }
                                newBullet.bulletState.variables.color = bColor;
                                newBullet.bulletState.variables.radius = bRadius;
                                newBullet.bulletState.variables.hitRadius = bHitRadius !== undefined ? bHitRadius : '';
                                newBullet.bulletState.variables.bulletImage = bImg;
                                newBullet.sharedEmitterState = state.sharedEmitterState || state;
                                newBullet.update = (childB, childBDT) => {
                                    runCustomBulletScript(childB, childBDT, attacker, target);
                                };

                                bullets.push(newBullet);
                                break;
                            }
                            case 'spawn_ring': {
                                let speed = evalExpr(block.params.speed, state.variables, block, 'speed');
                                let bColor = resolveColorParam(block.params.color, state.variables);
                                let count = Math.max(1, Math.min(CUSTOM_SPAWN_RING_MAX_COUNT, parseInt(evalExpr(block.params.count || '12', state.variables, block, 'count'))));
                                let ox = evalExpr(block.params.offsetX || '0', state.variables, block, 'offsetX');
                                let oy = evalExpr(block.params.offsetY || '0', state.variables, block, 'offsetY');

                                let coordMode = block.params.coordMode || 'relative';
                                let spawnX, spawnY;
                                if (coordMode === 'absolute') {
                                    spawnX = ox;
                                    spawnY = isPlayerSide ? (canvas.height - oy) : oy;
                                } else {
                                    spawnX = b.x + (state.variables.x_offset || 0) + ox;
                                    spawnY = b.y + (state.variables.y_offset || 0) + (isPlayerSide ? -oy : oy);
                                }
                                
                                let bRadius = evalExpr(block.params.radius || '6', state.variables, block, 'radius');
                                let bHitRadius = block.params.hitRadius ? evalExpr(block.params.hitRadius, state.variables, block, 'hitRadius') : undefined;
                                if (bHitRadius !== undefined) {
                                    let hrNum = Number(bHitRadius);
                                    if (!isNaN(hrNum) && hrNum < 0.1) bHitRadius = 0;
                                }
                                let bImg = block.params.bulletImage || 'none';
                                let centerAngle = evalExpr(block.params.angle || '0', state.variables, block, 'angle');

                                for (let k = 0; k < count; k++) {
                                    let angle = centerAngle + (360 / count) * k;
                                    let angleRad = angle * Math.PI / 180;
                                    if (isPlayerSide) {
                                        angleRad = -angleRad;
                                    }
                                    
                                    let newBullet = {
                                        x: spawnX,
                                        y: spawnY,
                                        startX: spawnX,
                                        startY: spawnY,
                                        vx: Math.cos(angleRad) * speed,
                                        vy: Math.sin(angleRad) * speed,
                                        radius: bRadius,
                                        hitRadius: bHitRadius,
                                        bulletImage: bImg,
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

                                    let childScript = state.magicCircleScript || [];
                                    newBullet.bulletState = initBulletState(childScript, speed, angle, attacker, target);
                                    newBullet.bulletState.magicCircleScript = childScript;
                                    newBullet.bulletState.isPlayerSide = isPlayerSide;
                                    inheritEmitterVariablesToBullet(state, newBullet.bulletState);
                                    newBullet.bulletState.variables.color = bColor;
                                    newBullet.bulletState.variables.radius = bRadius;
                                    newBullet.bulletState.variables.hitRadius = bHitRadius !== undefined ? bHitRadius : '';
                                    newBullet.bulletState.variables.bulletImage = bImg;
                                    newBullet.sharedEmitterState = state.sharedEmitterState || state;
                                    newBullet.update = (childB, childBDT) => {
                                        runCustomBulletScript(childB, childBDT, attacker, target);
                                    };
                                    
                                    bullets.push(newBullet);
                                }
                                break;
                            }
                            case 'spawn_way': {
                                let speed = evalExpr(block.params.speed, state.variables, block, 'speed');
                                let centerAngle = evalExpr(block.params.angle || 'angle', state.variables, block, 'angle');
                                let bColor = resolveColorParam(block.params.color, state.variables);
                                let count = Math.max(1, Math.min(CUSTOM_SPAWN_WAY_MAX_COUNT, parseInt(evalExpr(block.params.count || '3', state.variables, block, 'count'))));
                                let spread = evalExpr(block.params.spread || '15', state.variables, block, 'spread');
                                
                                let ox = evalExpr(block.params.offsetX || '0', state.variables, block, 'offsetX');
                                let oy = evalExpr(block.params.offsetY || '0', state.variables, block, 'offsetY');

                                let coordMode = block.params.coordMode || 'relative';
                                let spawnX, spawnY;
                                if (coordMode === 'absolute') {
                                    spawnX = ox;
                                    spawnY = isPlayerSide ? (canvas.height - oy) : oy;
                                } else {
                                    spawnX = b.x + (state.variables.x_offset || 0) + ox;
                                    spawnY = b.y + (state.variables.y_offset || 0) + (isPlayerSide ? -oy : oy);
                                }
                                
                                let bRadius = evalExpr(block.params.radius || '6', state.variables, block, 'radius');
                                let bHitRadius = block.params.hitRadius ? evalExpr(block.params.hitRadius, state.variables, block, 'hitRadius') : undefined;
                                if (bHitRadius !== undefined) {
                                    let hrNum = Number(bHitRadius);
                                    if (!isNaN(hrNum) && hrNum < 0.1) bHitRadius = 0;
                                }
                                let bImg = block.params.bulletImage || 'none';

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
                                        startX: spawnX,
                                        startY: spawnY,
                                        vx: Math.cos(angleRad) * speed,
                                        vy: Math.sin(angleRad) * speed,
                                        radius: bRadius,
                                        hitRadius: bHitRadius,
                                        bulletImage: bImg,
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

                                    let childScript = state.magicCircleScript || [];
                                    newBullet.bulletState = initBulletState(childScript, speed, angle, attacker, target);
                                    newBullet.bulletState.magicCircleScript = childScript;
                                    newBullet.bulletState.isPlayerSide = isPlayerSide;
                                    inheritEmitterVariablesToBullet(state, newBullet.bulletState);
                                    newBullet.bulletState.variables.color = bColor;
                                    newBullet.bulletState.variables.radius = bRadius;
                                    newBullet.bulletState.variables.hitRadius = bHitRadius !== undefined ? bHitRadius : '';
                                    newBullet.bulletState.variables.bulletImage = bImg;
                                    newBullet.sharedEmitterState = state.sharedEmitterState || state;
                                    newBullet.update = (childB, childBDT) => {
                                        runCustomBulletScript(childB, childBDT, attacker, target);
                                    };
                                    
                                    bullets.push(newBullet);
                                }
                                break;
                            }
                            case 'spawn_beam':
                            case 'spawn_beam_resist': {
                                let wt = Number(evalExpr(block.params.warningTime || '1.0', state.variables, block, 'warningTime'));
                                let at = Number(evalExpr(block.params.activeTime || '1.5', state.variables, block, 'activeTime'));
                                let lw = Number(evalExpr(block.params.laserWidth || '12', state.variables, block, 'laserWidth'));
                                let angle = evalExpr(block.params.angle || 'angle', state.variables, block, 'angle');
                                let ox = evalExpr(block.params.offsetX || '0', state.variables, block, 'offsetX');
                                let oy = evalExpr(block.params.offsetY || '0', state.variables, block, 'offsetY');
                                let cm = block.params.coordMode || 'relative';
                                let spawnX, spawnY;
                                if (cm === 'absolute') {
                                    spawnX = ox;
                                    spawnY = isPlayerSide ? (canvas.height - oy) : oy;
                                } else {
                                    spawnX = b.x + (state.variables.x_offset || 0) + ox;
                                    spawnY = b.y + (state.variables.y_offset || 0) + (isPlayerSide ? -oy : oy);
                                }
                                let bHitRadius = block.params.hitRadius ? evalExpr(block.params.hitRadius, state.variables, block, 'hitRadius') : undefined;
                                if (bHitRadius !== undefined) {
                                    let hrNum = Number(bHitRadius);
                                    if (!isNaN(hrNum) && hrNum < 0.1) bHitRadius = 0;
                                }
                                let bColor = resolveColorParam('#ff3333', state.variables);

                                let angleRad = angle * Math.PI / 180;
                                if (isPlayerSide) angleRad = -angleRad;

                                let newBullet = {
                                    x: spawnX,
                                    y: spawnY,
                                    startX: spawnX,
                                    startY: spawnY,
                                    vx: 0,
                                    vy: 0,
                                    radius: 8,
                                    hitRadius: bHitRadius,
                                    bulletImage: 'none',
                                    team: attacker.team,
                                    color: bColor,
                                    customDmg: 20,
                                    isCustom: true,
                                    isWarningLaser: true,
                                    isLaser: false,
                                    isCustomBeam: false,
                                    laserStartX: spawnX,
                                    laserStartY: spawnY,
                                    update: null
                                };
                                if (block.type === 'spawn_beam_resist') {
                                    newBullet.destroyResist = true;
                                }
                                newBullet.threatWeight = 100;
                                newBullet.bulletState = initBulletState([], 0, angle, attacker, target);
                                newBullet.bulletState.isPlayerSide = isPlayerSide;
                                inheritEmitterVariablesToBullet(state, newBullet.bulletState);
                                newBullet.bulletState.variables.bulletType = 'laser';
                                newBullet.bulletState.variables.warningTime = String(wt);
                                newBullet.bulletState.variables.activeTime = String(at);
                                newBullet.bulletState.variables.laserWidth = String(lw);
                                newBullet.bulletState.variables.laserStartTime = state.variables.timer;
                                newBullet.bulletState.variables.timer = 0;
                                newBullet.bulletState.variables.color = bColor;
                                newBullet.bulletState.variables.radius = 8;
                                newBullet.bulletState.variables.hitRadius = bHitRadius !== undefined ? bHitRadius : '';
                                newBullet.sharedEmitterState = state.sharedEmitterState || state;
                                newBullet.update = (childB, childBDT) => {
                                    runCustomBulletScript(childB, childBDT, attacker, target);
                                };
                                bullets.push(newBullet);
                                break;
                            }
                            case 'spawn_laser_way':
                            case 'spawn_laser_way_resist': {
                                let speed = evalExpr(block.params.speed || '200', state.variables, block, 'speed');
                                let centerAngle = evalExpr(block.params.angle || 'angle', state.variables, block, 'angle');
                                let bColor = resolveColorParam(block.params.color || '#ff3333', state.variables);
                                let count = Math.max(1, Math.min(CUSTOM_SPAWN_WAY_MAX_COUNT, parseInt(evalExpr(block.params.count || '3', state.variables, block, 'count'))));
                                let spread = evalExpr(block.params.spread || '45', state.variables, block, 'spread');
                                let ox = evalExpr(block.params.offsetX || '0', state.variables, block, 'offsetX');
                                let oy = evalExpr(block.params.offsetY || '0', state.variables, block, 'offsetY');
                                let cm = block.params.coordMode || 'relative';
                                let spawnX, spawnY;
                                if (cm === 'absolute') {
                                    spawnX = ox;
                                    spawnY = isPlayerSide ? (canvas.height - oy) : oy;
                                } else {
                                    spawnX = b.x + (state.variables.x_offset || 0) + ox;
                                    spawnY = b.y + (state.variables.y_offset || 0) + (isPlayerSide ? -oy : oy);
                                }
                                let bRadius = evalExpr(block.params.radius || '6', state.variables, block, 'radius');
                                let bHitRadius = block.params.hitRadius ? evalExpr(block.params.hitRadius, state.variables, block, 'hitRadius') : undefined;
                                if (bHitRadius !== undefined) {
                                    let hrNum = Number(bHitRadius);
                                    if (!isNaN(hrNum) && hrNum < 0.1) bHitRadius = 0;
                                }
                                let startAngle = centerAngle - (spread * (count - 1)) / 2;
                                let childScript = state.magicCircleScript || [];
                                for (let k = 0; k < count; k++) {
                                    let angle = startAngle + spread * k;
                                    let angleRad = angle * Math.PI / 180;
                                    if (isPlayerSide) angleRad = -angleRad;
                                    let newBullet = {
                                        x: spawnX,
                                        y: spawnY,
                                        startX: spawnX,
                                        startY: spawnY,
                                        vx: Math.cos(angleRad) * speed,
                                        vy: Math.sin(angleRad) * speed,
                                        radius: bRadius,
                                        hitRadius: bHitRadius,
                                        bulletImage: 'none',
                                        team: attacker.team,
                                        color: bColor,
                                        customDmg: 20,
                                        isCustom: true,
                                        isTrail: true,
                                        trailHistory: [],
                                        growTime: (block.params.growTime !== undefined && block.params.growTime !== '') ? Number(evalExpr(block.params.growTime, state.variables, block, 'growTime')) : 0.2,
                                        keepTime: (block.params.keepTime !== undefined && block.params.keepTime !== '') ? Number(evalExpr(block.params.keepTime, state.variables, block, 'keepTime')) : 0.3,
                                        shrinkTime: (block.params.shrinkTime !== undefined && block.params.shrinkTime !== '') ? Number(evalExpr(block.params.shrinkTime, state.variables, block, 'shrinkTime')) : 0.5,
                                        round: block.params.round !== 'false' && block.params.round !== false,
                                        update: null
                                    };
                                    if (block.type === 'spawn_laser_way_resist') {
                                        newBullet.destroyResist = true;
                                    }
                                    newBullet.threatWeight = computeBulletThreatWeight(spawnX, spawnY, newBullet.vx, newBullet.vy, target.x, target.y);
                                    newBullet.bulletState = initBulletState(childScript, speed, angle, attacker, target);
                                    newBullet.bulletState.magicCircleScript = childScript;
                                    newBullet.bulletState.isPlayerSide = isPlayerSide;
                                    inheritEmitterVariablesToBullet(state, newBullet.bulletState);
                                    newBullet.bulletState.variables.color = bColor;
                                    newBullet.bulletState.variables.radius = bRadius;
                                    newBullet.bulletState.variables.hitRadius = bHitRadius !== undefined ? bHitRadius : '';
                                    newBullet.bulletState.variables.growTime = newBullet.growTime;
                                    newBullet.bulletState.variables.keepTime = newBullet.keepTime;
                                    newBullet.bulletState.variables.shrinkTime = newBullet.shrinkTime;
                                    newBullet.bulletState.variables.bulletImage = 'none';
                                    newBullet.sharedEmitterState = state.sharedEmitterState || state;
                                    newBullet.update = (childB, childBDT) => {
                                        runCustomBulletScript(childB, childBDT, attacker, target);
                                    };
                                    bullets.push(newBullet);
                                }
                                break;
                            }
                            case 'spawn_laser_ring':
                            case 'spawn_laser_ring_resist': {
                                let speed = evalExpr(block.params.speed || '200', state.variables, block, 'speed');
                                let centerAngle = evalExpr(block.params.angle || 'angle', state.variables, block, 'angle');
                                let bColor = resolveColorParam(block.params.color || '#ff3333', state.variables);
                                let count = Math.max(3, Math.min(CUSTOM_SPAWN_RING_MAX_COUNT, parseInt(evalExpr(block.params.count || '12', state.variables, block, 'count'))));
                                let ox = evalExpr(block.params.offsetX || '0', state.variables, block, 'offsetX');
                                let oy = evalExpr(block.params.offsetY || '0', state.variables, block, 'offsetY');
                                let cm = block.params.coordMode || 'relative';
                                let spawnX, spawnY;
                                if (cm === 'absolute') {
                                    spawnX = ox;
                                    spawnY = isPlayerSide ? (canvas.height - oy) : oy;
                                } else {
                                    spawnX = b.x + (state.variables.x_offset || 0) + ox;
                                    spawnY = b.y + (state.variables.y_offset || 0) + (isPlayerSide ? -oy : oy);
                                }
                                let bRadius = evalExpr(block.params.radius || '6', state.variables, block, 'radius');
                                let bHitRadius = block.params.hitRadius ? evalExpr(block.params.hitRadius, state.variables, block, 'hitRadius') : undefined;
                                if (bHitRadius !== undefined) {
                                    let hrNum = Number(bHitRadius);
                                    if (!isNaN(hrNum) && hrNum < 0.1) bHitRadius = 0;
                                }
                                let childScript = state.magicCircleScript || [];
                                for (let k = 0; k < count; k++) {
                                    let angle = centerAngle + (360 / count) * k;
                                    let angleRad = angle * Math.PI / 180;
                                    if (isPlayerSide) angleRad = -angleRad;
                                    let newBullet = {
                                        x: spawnX,
                                        y: spawnY,
                                        startX: spawnX,
                                        startY: spawnY,
                                        vx: Math.cos(angleRad) * speed,
                                        vy: Math.sin(angleRad) * speed,
                                        radius: bRadius,
                                        hitRadius: bHitRadius,
                                        bulletImage: 'none',
                                        team: attacker.team,
                                        color: bColor,
                                        customDmg: 20,
                                        isCustom: true,
                                        isTrail: true,
                                        trailHistory: [],
                                        growTime: (block.params.growTime !== undefined && block.params.growTime !== '') ? Number(evalExpr(block.params.growTime, state.variables, block, 'growTime')) : 0.2,
                                        keepTime: (block.params.keepTime !== undefined && block.params.keepTime !== '') ? Number(evalExpr(block.params.keepTime, state.variables, block, 'keepTime')) : 0.3,
                                        shrinkTime: (block.params.shrinkTime !== undefined && block.params.shrinkTime !== '') ? Number(evalExpr(block.params.shrinkTime, state.variables, block, 'shrinkTime')) : 0.5,
                                        round: block.params.round !== 'false' && block.params.round !== false,
                                        update: null
                                    };
                                    if (block.type === 'spawn_laser_ring_resist') {
                                        newBullet.destroyResist = true;
                                    }
                                    newBullet.threatWeight = computeBulletThreatWeight(spawnX, spawnY, newBullet.vx, newBullet.vy, target.x, target.y);
                                    newBullet.bulletState = initBulletState(childScript, speed, angle, attacker, target);
                                    newBullet.bulletState.magicCircleScript = childScript;
                                    newBullet.bulletState.isPlayerSide = isPlayerSide;
                                    inheritEmitterVariablesToBullet(state, newBullet.bulletState);
                                    newBullet.bulletState.variables.color = bColor;
                                    newBullet.bulletState.variables.radius = bRadius;
                                    newBullet.bulletState.variables.hitRadius = bHitRadius !== undefined ? bHitRadius : '';
                                    newBullet.bulletState.variables.growTime = newBullet.growTime;
                                    newBullet.bulletState.variables.keepTime = newBullet.keepTime;
                                    newBullet.bulletState.variables.shrinkTime = newBullet.shrinkTime;
                                    newBullet.bulletState.variables.bulletImage = 'none';
                                    newBullet.sharedEmitterState = state.sharedEmitterState || state;
                                    newBullet.update = (childB, childBDT) => {
                                        runCustomBulletScript(childB, childBDT, attacker, target);
                                    };
                                    bullets.push(newBullet);
                                }
                                break;
                            }
                            case 'spawn_beam_way':
                            case 'spawn_beam_way_resist': {
                                let wt = Number(evalExpr(block.params.warningTime || '1.0', state.variables, block, 'warningTime'));
                                let at = Number(evalExpr(block.params.activeTime || '1.5', state.variables, block, 'activeTime'));
                                let lw = Number(evalExpr(block.params.laserWidth || '12', state.variables, block, 'laserWidth'));
                                let centerAngle = evalExpr(block.params.angle || 'angle', state.variables, block, 'angle');
                                let count = Math.max(1, Math.min(CUSTOM_SPAWN_WAY_MAX_COUNT, parseInt(evalExpr(block.params.count || '3', state.variables, block, 'count'))));
                                let spread = evalExpr(block.params.spread || '45', state.variables, block, 'spread');
                                let ox = evalExpr(block.params.offsetX || '0', state.variables, block, 'offsetX');
                                let oy = evalExpr(block.params.offsetY || '0', state.variables, block, 'offsetY');
                                let cm = block.params.coordMode || 'relative';
                                let spawnX, spawnY;
                                if (cm === 'absolute') {
                                    spawnX = ox;
                                    spawnY = isPlayerSide ? (canvas.height - oy) : oy;
                                } else {
                                    spawnX = b.x + (state.variables.x_offset || 0) + ox;
                                    spawnY = b.y + (state.variables.y_offset || 0) + (isPlayerSide ? -oy : oy);
                                }
                                let bHitRadius = block.params.hitRadius ? evalExpr(block.params.hitRadius, state.variables, block, 'hitRadius') : undefined;
                                if (bHitRadius !== undefined) {
                                    let hrNum = Number(bHitRadius);
                                    if (!isNaN(hrNum) && hrNum < 0.1) bHitRadius = 0;
                                }
                                let bColor = resolveColorParam('#ff3333', state.variables);
                                let startAngle = centerAngle - (spread * (count - 1)) / 2;
                                for (let k = 0; k < count; k++) {
                                    let angle = startAngle + spread * k;
                                    let newBullet = {
                                        x: spawnX,
                                        y: spawnY,
                                        startX: spawnX,
                                        startY: spawnY,
                                        vx: 0,
                                        vy: 0,
                                        radius: 8,
                                        hitRadius: bHitRadius,
                                        bulletImage: 'none',
                                        team: attacker.team,
                                        color: bColor,
                                        customDmg: 20,
                                        isCustom: true,
                                        isWarningLaser: true,
                                        isLaser: false,
                                        isCustomBeam: false,
                                        laserStartX: spawnX,
                                        laserStartY: spawnY,
                                        update: null
                                    };
                                    if (block.type === 'spawn_beam_way_resist') {
                                        newBullet.destroyResist = true;
                                    }
                                    newBullet.threatWeight = 100;
                                    newBullet.bulletState = initBulletState([], 0, angle, attacker, target);
                                    newBullet.bulletState.isPlayerSide = isPlayerSide;
                                    inheritEmitterVariablesToBullet(state, newBullet.bulletState);
                                    newBullet.bulletState.variables.bulletType = 'laser';
                                    newBullet.bulletState.variables.warningTime = String(wt);
                                    newBullet.bulletState.variables.activeTime = String(at);
                                    newBullet.bulletState.variables.laserWidth = String(lw);
                                    newBullet.bulletState.variables.laserStartTime = state.variables.timer;
                                    newBullet.bulletState.variables.timer = 0;
                                    newBullet.bulletState.variables.color = bColor;
                                    newBullet.bulletState.variables.radius = 8;
                                    newBullet.bulletState.variables.hitRadius = bHitRadius !== undefined ? bHitRadius : '';
                                    newBullet.sharedEmitterState = state.sharedEmitterState || state;
                                    newBullet.update = (childB, childBDT) => {
                                        runCustomBulletScript(childB, childBDT, attacker, target);
                                    };
                                    bullets.push(newBullet);
                                }
                                break;
                            }
                            case 'spawn_beam_ring':
                            case 'spawn_beam_ring_resist': {
                                let wt = Number(evalExpr(block.params.warningTime || '1.0', state.variables, block, 'warningTime'));
                                let at = Number(evalExpr(block.params.activeTime || '1.5', state.variables, block, 'activeTime'));
                                let lw = Number(evalExpr(block.params.laserWidth || '12', state.variables, block, 'laserWidth'));
                                let centerAngle = evalExpr(block.params.angle || 'angle', state.variables, block, 'angle');
                                let count = Math.max(3, Math.min(CUSTOM_SPAWN_RING_MAX_COUNT, parseInt(evalExpr(block.params.count || '12', state.variables, block, 'count'))));
                                let ox = evalExpr(block.params.offsetX || '0', state.variables, block, 'offsetX');
                                let oy = evalExpr(block.params.offsetY || '0', state.variables, block, 'offsetY');
                                let cm = block.params.coordMode || 'relative';
                                let spawnX, spawnY;
                                if (cm === 'absolute') {
                                    spawnX = ox;
                                    spawnY = isPlayerSide ? (canvas.height - oy) : oy;
                                } else {
                                    spawnX = b.x + (state.variables.x_offset || 0) + ox;
                                    spawnY = b.y + (state.variables.y_offset || 0) + (isPlayerSide ? -oy : oy);
                                }
                                let bHitRadius = block.params.hitRadius ? evalExpr(block.params.hitRadius, state.variables, block, 'hitRadius') : undefined;
                                if (bHitRadius !== undefined) {
                                    let hrNum = Number(bHitRadius);
                                    if (!isNaN(hrNum) && hrNum < 0.1) bHitRadius = 0;
                                }
                                let bColor = resolveColorParam('#ff3333', state.variables);
                                for (let k = 0; k < count; k++) {
                                    let angle = centerAngle + (360 / count) * k;
                                    let newBullet = {
                                        x: spawnX,
                                        y: spawnY,
                                        startX: spawnX,
                                        startY: spawnY,
                                        vx: 0,
                                        vy: 0,
                                        radius: 8,
                                        hitRadius: bHitRadius,
                                        bulletImage: 'none',
                                        team: attacker.team,
                                        color: bColor,
                                        customDmg: 20,
                                        isCustom: true,
                                        isWarningLaser: true,
                                        isLaser: false,
                                        isCustomBeam: false,
                                        laserStartX: spawnX,
                                        laserStartY: spawnY,
                                        update: null
                                    };
                                    if (block.type === 'spawn_beam_ring_resist') {
                                        newBullet.destroyResist = true;
                                    }
                                    newBullet.threatWeight = 100;
                                    newBullet.bulletState = initBulletState([], 0, angle, attacker, target);
                                    newBullet.bulletState.isPlayerSide = isPlayerSide;
                                    inheritEmitterVariablesToBullet(state, newBullet.bulletState);
                                    newBullet.bulletState.variables.bulletType = 'laser';
                                    newBullet.bulletState.variables.warningTime = String(wt);
                                    newBullet.bulletState.variables.activeTime = String(at);
                                    newBullet.bulletState.variables.laserWidth = String(lw);
                                    newBullet.bulletState.variables.laserStartTime = state.variables.timer;
                                    newBullet.bulletState.variables.timer = 0;
                                    newBullet.bulletState.variables.color = bColor;
                                    newBullet.bulletState.variables.radius = 8;
                                    newBullet.bulletState.variables.hitRadius = bHitRadius !== undefined ? bHitRadius : '';
                                    newBullet.sharedEmitterState = state.sharedEmitterState || state;
                                    newBullet.update = (childB, childBDT) => {
                                        runCustomBulletScript(childB, childBDT, attacker, target);
                                    };
                                    bullets.push(newBullet);
                                }
                                break;
                            }
                            case 'const_var':
                            case 'set_var': {
                                let varName = block.params.name;
                                let val = evalValue(block.params.value, state.variables, block, 'value');
                                if (shouldLog) console.log(`[DEBUG] Bullet #${b.bulletDebugId} set_var: ${varName} = ${val} (raw: ${block.params.value})`);
                        setScriptVariable(state, varName, val, block.type === 'const_var');
                                break;
                            }
                            case 'change_var': {
                                let varName = block.params.name;
                                let val = evalExpr(block.params.value, state.variables, block, 'value');
                                let delta = block.params.op === '-' ? -val : val;
                                let before = state.variables[varName];
                                if (!state.constVars || typeof state.constVars.has !== 'function') state.constVars = new Set();
                                if (!state.constVars.has(varName)) state.variables[varName] = (Number(state.variables[varName]) || 0) + delta;
                                if (shouldLog) console.log(`[DEBUG] Bullet #${b.bulletDebugId} change_var: ${varName} ${block.params.op === '-' ? '-=' : '+='} ${val} (before: ${before}, after: ${state.variables[varName]})`);
                                break;
                            }
                            case 'aim_at_target': {
                                let dx = target.x - b.x;
                                let dy = isPlayerSide ? (b.y - target.y) : (target.y - b.y);
                                state.variables.angle = Math.atan2(dy, dx) * 180 / Math.PI;
                                break;
                            }
                            case 'aim_at_coord': {
                                let txRawB = evalExpr(block.params.targetX || '0', state.variables, block, 'targetX');
                                let tyRawB = evalExpr(block.params.targetY || '0', state.variables, block, 'targetY');
                                let txAbsB = Number(txRawB) || 0;
                                let tyAbsB = isPlayerSide ? (canvas.height - (Number(tyRawB) || 0)) : (Number(tyRawB) || 0);
                                let dxB = txAbsB - b.x;
                                let dyB = isPlayerSide ? (b.y - tyAbsB) : (tyAbsB - b.y);
                                state.variables.angle = Math.atan2(dyB, dxB) * 180 / Math.PI;
                                break;
                            }
                            case 'speed_scale': {
                                advancePC = applySpeedScaleBlock(block, state);
                                break;
                            }
                            case 'homing': {
                                let turnSpeed = evalExpr(block.params.turnSpeed || '90', state.variables, block, 'turnSpeed');
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
                            case 'advance': {
                                let dist = evalExpr(block.params.distance || '50', state.variables, block, 'distance');
                                let rad = (Number(state.variables.angle) || 0) * Math.PI / 180;
                                state.variables.x = (Number(state.variables.x) || 0) + Math.cos(rad) * dist;
                                state.variables.y = (Number(state.variables.y) || 0) + Math.sin(rad) * dist;
                                break;
                            }
                            case 'tween_angle':
                            case 'tween_angle_wait': {
                                let varName = 'angle';
                                let fromVal = evalExpr(block.params.from || '0', state.variables);
                                let toVal = evalExpr(block.params.to || '360', state.variables);
                                let duration = evalExpr(block.params.duration || '1', state.variables);
                                let mode = block.params.mode || 'seconds';
                                if (mode === 'frames') duration = Math.max(1, duration);
                                else duration = Math.max(0.001, duration);
                                
                                if (!state.tweens) state.tweens = [];
                                state.tweens = state.tweens.filter(t => t.name !== varName);
                                
                                state.tweens.push({
                                    name: varName,
                                    mode: mode,
                                    from: fromVal,
                                    to: toVal,
                                    total: duration,
                                    elapsed: 0,
                                    easing: block.params.easing || 'linear',
                                    isAngleTween: true,
                                    rotMode: block.params.rotMode || 'shortest'
                                });
                                
                                if (block.type === 'tween_angle_wait') {
                                    state.waitingTweenName = varName;
                                }
                                break;
                            }
                            case 'tween_var':
                            case 'tween_var_wait': {
                                let varName = block.params.name || 'angle';
                                let isMultiVar = varName.includes(',');
                                
                                let fromVal, toVal;
                                if (isMultiVar) {
                                    let fromParts = (block.params.from || '').split(',').map(p => evalExpr(p.trim(), state.variables, block, 'from'));
                                    let toParts = (block.params.to || '').split(',').map(p => evalExpr(p.trim(), state.variables, block, 'to'));
                                    fromVal = `${fromParts[0] || 0},${fromParts[1] || 0}`;
                                    toVal = `${toParts[0] || 0},${toParts[1] || 0}`;
                                } else {
                                    fromVal = evalExpr(block.params.from, state.variables, block, 'from');
                                    toVal   = evalExpr(block.params.to,   state.variables, block, 'to');
                                }

                                let mode    = block.params.mode || 'seconds';
                                if (!state.tweens) state.tweens = [];
                                state.tweens = state.tweens.filter(t => t.name !== varName);

                                if (typeof toVal === 'string' && toVal.includes(',')) {
                                    let toParts = toVal.split(',').map(p => parseFloat(p.trim()));
                                    let fromParts = String(fromVal).split(',').map(p => parseFloat(p.trim()));
                                    if (toParts.length === 2 && fromParts.length === 2 && !isNaN(toParts[0]) && !isNaN(toParts[1]) && !isNaN(fromParts[0]) && !isNaN(fromParts[1])) {
                                        state.variables[varName] = fromVal;
                                        if (mode === 'step' || mode === 'vecstep') {
                                            let stepVal = evalExpr(block.params.stepVal || block.params.value || '5', state.variables, block, 'stepVal');
                                            if (mode === 'vecstep') {
                                                state.tweens.push({
                                                    name: varName,
                                                    isCoordPair: true,
                                                    isStep: true,
                                                    isVecStep: true,
                                                    fromX: fromParts[0],
                                                    toX: toParts[0],
                                                    fromY: fromParts[1],
                                                    toY: toParts[1],
                                                    stepVal: stepVal,
                                                    mode,
                                                    total: 1,
                                                    elapsed: 0
                                                });
                                            } else {
                                                let stepX = stepVal;
                                                let stepY = stepVal;
                                                if (fromParts[0] > toParts[0] && stepX > 0) stepX = -stepX;
                                                if (fromParts[1] > toParts[1] && stepY > 0) stepY = -stepY;
                                                if (fromParts[0] === toParts[0]) stepX = 0;
                                                if (fromParts[1] === toParts[1]) stepY = 0;

                                                state.tweens.push({
                                                    name: varName,
                                                    isCoordPair: true,
                                                    isStep: true,
                                                    isVecStep: false,
                                                    fromX: fromParts[0],
                                                    toX: toParts[0],
                                                    fromY: fromParts[1],
                                                    toY: toParts[1],
                                                    stepX: stepX,
                                                    stepY: stepY,
                                                    mode,
                                                    total: 1,
                                                    elapsed: 0
                                                });
                                            }
                                        } else {
                                            let total = evalExpr(block.params.duration || '1', state.variables, block, 'duration');
                                            if (mode === 'frames') total = Math.max(1, total);
                                            else total = Math.max(0.001, total);
                                            state.tweens.push({
                                                name: varName,
                                                isCoordPair: true,
                                                isStep: false,
                                                fromX: fromParts[0],
                                                toX: toParts[0],
                                                fromY: fromParts[1],
                                                toY: toParts[1],
                                                mode,
                                                total,
                                                elapsed: 0,
                                                easing: block.params.easing || 'linear'
                                            });
                                        }
                                        state.variables[varName + '_x'] = fromParts[0];
                                        state.variables[varName + '_y'] = fromParts[1];
                                        state.variables[varName + '.x'] = fromParts[0];
                                        state.variables[varName + '.y'] = fromParts[1];
                                        if (block.type === 'tween_var_wait') {
                                            state.waitingTweenName = varName;
                                        }
                                    }
                                } else {
                                    if (mode === 'step') {
                                        let stepVal = evalExpr(block.params.stepVal || '5', state.variables, block, 'stepVal');
                                        if (fromVal > toVal && stepVal > 0) stepVal = -stepVal;
                                        state.variables[varName] = fromVal;
                                        state.tweens.push({ name: varName, to: toVal, mode: 'step', stepVal });
                                    } else {
                                        let total = evalExpr(block.params.duration || '1', state.variables, block, 'duration');
                                        if (mode === 'frames') total = Math.max(1, total);
                                        else total = Math.max(0.001, total);
                                        state.variables[varName] = fromVal;
                                        state.tweens.push({ name: varName, from: fromVal, to: toVal, mode, total, elapsed: 0, easing: block.params.easing || 'linear' });
                                    }
                                    if (block.type === 'tween_var_wait') {
                                        state.waitingTweenName = varName;
                                    }
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
                    
                    if (brokeToWait) {
                        // 次のループで waitTimer が消費される
                    } else if (!state.finished) {
                        break;
                    }
                } // 外側ループ
                } // else (インタプリタフォールバック)
            }
            
            const _t3 = performance.now(); // スクリプト実行完了

            // Physics update
            let finalAngleRad = state.variables.angle * Math.PI / 180;
            if (isPlayerSide) {
                finalAngleRad = -finalAngleRad;
            }
            b.vx = Math.cos(finalAngleRad) * state.variables.speed;
            b.vy = Math.sin(finalAngleRad) * state.variables.speed;
            
            // Sync mutated coordinates
            // xy の変更を x, y に同期 (開始時の initXY から明示的に変化した時のみ同期することで、x や y 単体を個別に変更した際に古い xy でリセットされるのを防ぐ)
            if (state.variables.xy !== initXY) {
                let xyParts = String(state.variables.xy).split(',').map(p => parseFloat(p.trim()));
                if (xyParts.length === 2 && !isNaN(xyParts[0]) && !isNaN(xyParts[1])) {
                    state.variables.x = xyParts[0];
                    state.variables.y = xyParts[1];
                    state.variables['xy_x'] = xyParts[0];
                    state.variables['xy_y'] = xyParts[1];
                    state.variables['xy.x'] = xyParts[0];
                    state.variables['xy.y'] = xyParts[1];
                }
            }

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

            if (shouldLog) {
                console.log(`[DEBUG] Bullet #${b.bulletDebugId} FrameSyncEnd - color: ${state.variables.color}, speed (start: ${initSpeed}, current: ${state.variables.speed}), angle (start: ${initAngle}, current: ${state.variables.angle}), vx: ${b.vx}, vy: ${b.vy}`);
            }

            if (xChanged || yChanged || speedChanged || angleChanged || b.laserMoved) {
                b.laserMoved = true;
            }
            
            // Sync custom variables to bullet physics properties
            if (state.variables.bulletType === 'laser') {
                b.isLaser = true;
                b.isTrail = false;
            } else if (state.variables.bulletType === 'trail') {
                b.isTrail = true;
                b.isLaser = false;
                if (!b.trailHistory) b.trailHistory = [];
            } else if (state.variables.bulletType === 'normal') {
                b.isLaser = false;
                b.isTrail = false;
            }
            let vGrowTime = window.getBulletVar(state.variables, 'growTime');
            if (vGrowTime !== undefined) {
                b.growTime = parseFloat(vGrowTime) || 0.2;
            }
            let vKeepTime = window.getBulletVar(state.variables, 'keepTime');
            if (vKeepTime !== undefined) {
                b.keepTime = parseFloat(vKeepTime) || 0.3;
            }
            let vShrinkTime = window.getBulletVar(state.variables, 'shrinkTime');
            if (vShrinkTime !== undefined) {
                b.shrinkTime = parseFloat(vShrinkTime) || 0.5;
            }
            let vRound = window.getBulletVar(state.variables, 'round');
            if (vRound !== undefined) {
                b.round = (vRound === 'true' || vRound === true);
            }
            let vBulletImage = window.getBulletVar(state.variables, 'bulletImage');
            if (vBulletImage !== undefined) {
                b.bulletImage = vBulletImage;
            }
            let vColor = window.getBulletVar(state.variables, 'color');
            if (vColor !== undefined) {
                b.color = vColor;
            }
            let vRadius = window.getBulletVar(state.variables, 'radius');
            if (vRadius !== undefined) {
                let rNum = parseFloat(evalExpr(vRadius, state.variables));
                if (!isNaN(rNum)) {
                    b.radius = rNum;
                }
            }
            let vHitRadius = window.getBulletVar(state.variables, 'hitRadius');
            if (vHitRadius !== undefined) {
                let hrVal = vHitRadius;
                if (hrVal === '' || hrVal === 'none' || hrVal === '""' || hrVal === "''" || hrVal === undefined || hrVal === null) {
                    b.hitRadius = undefined;
                } else {
                    let hrNum = parseFloat(evalExpr(hrVal, state.variables));
                    if (!isNaN(hrNum)) {
                        if (hrNum < 0.1) hrNum = 0;
                        b.hitRadius = hrNum;
                        window.setBulletVar(state.variables, 'hitRadius', hrNum);
                    }
                }
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
            const _t4 = performance.now(); // 物理書き戻し完了
            // フェーズ別計測を累積
            window._bsT = window._bsT || { tw:0, su:0, sc:0, po:0, n:0 };
            window._bsT.tw += _t1 - _t0;
            window._bsT.su += _t2 - _t1;
            window._bsT.sc += _t3 - _t2;
            window._bsT.po += _t4 - _t3;
            window._bsT.n++;
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
                case 'aim_at_coord':
                case 'move_owner':
                    return 0;
                case 'spawn_bullet':
                case 'spawn_bullet_resist':
                case 'spawn_trail':
                case 'spawn_trail_resist':
                case 'spawn_beam':
                case 'spawn_beam_resist':
                case 'bounce':
                case 'advance':
                    return 1;
                case 'speed_scale':
                    return 1;
                case 'homing':
                    return 2;
                case 'spawn_ring':
                case 'spawn_way':
                case 'spawn_laser_way':
                case 'spawn_laser_way_resist':
                case 'spawn_laser_ring':
                case 'spawn_laser_ring_resist':
                case 'spawn_beam_way':
                case 'spawn_beam_way_resist':
                case 'spawn_beam_ring':
                case 'spawn_beam_ring_resist':
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

        function isUuidParam(str) {
            if (!str) return false;
            // cc_ で始まるローカルUUID、または jb_ で始まるJSONBlob ID
            return str.length < 50 && (str.startsWith('cc_') || str.startsWith('jb_') || /^[A-Za-z0-9_-]+$/.test(str));
        }

        function fetchCardByUuid(uuid, callback) {
            let url;
            if (uuid.startsWith('jb_')) {
                const id = uuid.replace('jb_', '');
                url = `https://jsonblob.com/api/jsonBlob/${id}`;
            } else {
                url = `./cards/${uuid}.json`;
            }
            fetch(url)
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`データが見つかりません (${res.status})`);
                    }
                    return res.json();
                })
                .then(card => {
                    const imported = importCard(card);
                    if (callback) callback(imported);
                })
                .catch(err => {
                    alert(`カードのデータ取得に失敗しました。\n\n詳細: ${err.message}`);
                });
        }

        // ブロック配列を極小シリアライズするための順番定義
        const BLOCK_PARAM_ORDER = {
            'repeat': ['count', 'indexVar'],
            'forever': [],
            'wait': ['duration'],
            'if': ['cond'],
            'once': [],
            'const_var': ['name', 'value'],
            'set_var': ['name', 'value'],
            'change_var': ['name', 'op', 'value'],
            'tween_var': ['name', 'from', 'to', 'mode', 'duration', 'stepVal', 'easing'],
            'tween_var_wait': ['name', 'from', 'to', 'mode', 'duration', 'stepVal', 'easing'],
            'tween_angle': ['from', 'to', 'mode', 'duration', 'easing', 'rotMode'],
            'tween_angle_wait': ['from', 'to', 'mode', 'duration', 'easing', 'rotMode'],
            'set_laser': ['warningTime', 'activeTime', 'laserWidth'],
            'aim_at_target': [],
            'aim_at_coord': ['targetX', 'targetY'],
            'move_owner': ['preset', 'duration'],
            'slide_owner': ['preset', 'duration'],
            'spawn_bullet': ['type', 'color', 'speed', 'angle', 'offsetX', 'offsetY', 'radius', 'bulletImage', 'coordMode', 'hitRadius'],
            'spawn_bullet_resist': ['type', 'color', 'speed', 'angle', 'offsetX', 'offsetY', 'radius', 'bulletImage', 'coordMode', 'hitRadius'],
            'spawn_trail': ['type', 'color', 'speed', 'angle', 'offsetX', 'offsetY', 'radius', 'growTime', 'keepTime', 'shrinkTime', 'round', 'coordMode', 'hitRadius'],
            'spawn_trail_resist': ['type', 'color', 'speed', 'angle', 'offsetX', 'offsetY', 'radius', 'growTime', 'keepTime', 'shrinkTime', 'round', 'coordMode', 'hitRadius'],
            'spawn_ring': ['type', 'color', 'speed', 'angle', 'count', 'offsetX', 'offsetY', 'radius', 'bulletImage', 'coordMode', 'hitRadius'],
            'spawn_ring_resist': ['type', 'color', 'speed', 'angle', 'count', 'offsetX', 'offsetY', 'radius', 'bulletImage', 'coordMode', 'hitRadius'],
            'spawn_way': ['type', 'color', 'speed', 'angle', 'count', 'spread', 'offsetX', 'offsetY', 'radius', 'bulletImage', 'coordMode', 'hitRadius'],
            'spawn_way_resist': ['type', 'color', 'speed', 'angle', 'count', 'spread', 'offsetX', 'offsetY', 'radius', 'bulletImage', 'coordMode', 'hitRadius'],
            'spawn_beam': ['warningTime', 'activeTime', 'laserWidth', 'angle', 'offsetX', 'offsetY', 'coordMode', 'hitRadius'],
            'spawn_beam_resist': ['warningTime', 'activeTime', 'laserWidth', 'angle', 'offsetX', 'offsetY', 'coordMode', 'hitRadius'],
            'spawn_laser_way': ['type', 'color', 'speed', 'angle', 'count', 'spread', 'offsetX', 'offsetY', 'radius', 'growTime', 'keepTime', 'shrinkTime', 'round', 'coordMode', 'hitRadius'],
            'spawn_laser_way_resist': ['type', 'color', 'speed', 'angle', 'count', 'spread', 'offsetX', 'offsetY', 'radius', 'growTime', 'keepTime', 'shrinkTime', 'round', 'coordMode', 'hitRadius'],
            'spawn_laser_ring': ['type', 'color', 'speed', 'angle', 'count', 'offsetX', 'offsetY', 'radius', 'growTime', 'keepTime', 'shrinkTime', 'round', 'coordMode', 'hitRadius'],
            'spawn_laser_ring_resist': ['type', 'color', 'speed', 'angle', 'count', 'offsetX', 'offsetY', 'radius', 'growTime', 'keepTime', 'shrinkTime', 'round', 'coordMode', 'hitRadius'],
            'spawn_beam_way': ['warningTime', 'activeTime', 'laserWidth', 'angle', 'count', 'spread', 'offsetX', 'offsetY', 'coordMode', 'hitRadius'],
            'spawn_beam_way_resist': ['warningTime', 'activeTime', 'laserWidth', 'angle', 'count', 'spread', 'offsetX', 'offsetY', 'coordMode', 'hitRadius'],
            'spawn_beam_ring': ['warningTime', 'activeTime', 'laserWidth', 'angle', 'count', 'offsetX', 'offsetY', 'coordMode', 'hitRadius'],
            'spawn_beam_ring_resist': ['warningTime', 'activeTime', 'laserWidth', 'angle', 'count', 'offsetX', 'offsetY', 'coordMode', 'hitRadius'],
            'homing': ['turnSpeed'],
            'speed_add': ['value'],
            'speed_set': ['value'],
            'angle_add': ['value'],
            'angle_set': ['value'],
            'color_set': ['value'],
            'speed_scale_slow': ['effect', 'delay'],
            'speed_scale_fast': ['effect', 'delay'],
            'bounce': [],
            'advance': ['distance']
        };

        const BLOCK_TYPE_MAP = {
            'repeat': 'r', 'forever': 'f', 'wait': 'w', 'if': 'i', 'once': 'o',
            'const_var': 'v', 'set_var': 's', 'change_var': 'c',
            'tween_var': 't', 'tween_var_wait': 'tw',
            'tween_angle': 'ta', 'tween_angle_wait': 'taw',
            'set_laser': 'sl',
            'aim_at_target': 'a', 'aim_at_coord': 'ac', 'move_owner': 'm', 'slide_owner': 'd',
            'spawn_bullet': 'sb', 'spawn_bullet_resist': 'sbr', 
            'spawn_trail': 'st', 'spawn_trail_resist': 'str',
            'spawn_ring': 'sr', 'spawn_ring_resist': 'srr', 
            'spawn_way': 'sw', 'spawn_way_resist': 'swr',
            'spawn_beam': 'sbe', 'spawn_beam_resist': 'sber',
            'spawn_laser_way': 'slw', 'spawn_laser_way_resist': 'slwr',
            'spawn_laser_ring': 'slr', 'spawn_laser_ring_resist': 'slrr',
            'spawn_beam_way': 'sbw', 'spawn_beam_way_resist': 'sbwr',
            'spawn_beam_ring': 'sbrg', 'spawn_beam_ring_resist': 'sbrgr',
            'homing': 'h', 'speed_add': 'sa', 'speed_set': 'ss',
            'angle_add': 'aa', 'angle_set': 'as', 'color_set': 'cs',
            'speed_scale_slow': 'sls', 'speed_scale_fast': 'ssf', 'bounce': 'b',
            'advance': 'ad'
        };

        const BLOCK_TYPE_REVERSE_MAP = {};
        for (let k in BLOCK_TYPE_MAP) {
            BLOCK_TYPE_REVERSE_MAP[BLOCK_TYPE_MAP[k]] = k;
        }

        function serializeBlocks(blocks) {
            if (!Array.isArray(blocks)) return [];
            return blocks.map(b => {
                const shortType = BLOCK_TYPE_MAP[b.type] || b.type;
                const indent = b.indent || 0;
                const params = [];
                const keys = BLOCK_PARAM_ORDER[b.type];
                if (keys && b.params) {
                    keys.forEach(k => {
                        params.push(b.params[k] !== undefined ? b.params[k] : '');
                    });
                }
                return [indent, shortType, params];
            });
        }

        function deserializeBlocks(serialized) {
            if (!Array.isArray(serialized)) return [];
            return serialized.map(item => {
                const indent = item[0];
                const shortType = item[1];
                const paramValues = item[2] || [];
                const type = BLOCK_TYPE_REVERSE_MAP[shortType] || shortType;
                const params = {};
                const keys = BLOCK_PARAM_ORDER[type];
                if (keys) {
                    keys.forEach((k, idx) => {
                        params[k] = paramValues[idx] !== undefined ? paramValues[idx] : '';
                    });
                }
                return { type, params, indent };
            });
        }

        function parseSharedCard(decompressed) {
            const parsed = JSON.parse(decompressed);
            
            let name, cost, desc, duration, emitterData, bulletData, magicCircleData, despawnTime, difficulty;
            
            if (Array.isArray(parsed)) {
                // 配列形式のデシリアライズ (新フォーマット)
                name = parsed[0] || '無名カード';
                cost = parsed[1] !== undefined ? parsed[1] : 100;
                desc = parsed[2] || '';
                duration = parsed[3] !== undefined ? parsed[3] : 10;
                emitterData = parsed[4] || [];
                bulletData = parsed[5] || [];
                magicCircleData = parsed[6] || [];
                despawnTime = parsed[7] !== undefined ? parsed[7] : 1.5;
                difficulty = parsed[8] || 'NORMAL';
            } else {
                // オブジェクト形式のデシリアライズ (旧フォーマット)
                name = parsed.n || parsed.name || '無名カード';
                cost = parsed.c !== undefined ? parsed.c : (parsed.cost || 100);
                desc = parsed.d || parsed.desc || '';
                duration = parsed.t !== undefined ? parsed.t : (parsed.duration || 10);
                despawnTime = parsed.despawnTime !== undefined ? parsed.despawnTime : 1.5;
                difficulty = parsed.difficulty || 'NORMAL';
                
                emitterData = parsed.e !== undefined ? parsed.e : parsed.emitterScript;
                bulletData = parsed.b !== undefined ? parsed.b : parsed.bulletScript;
                magicCircleData = parsed.m !== undefined ? parsed.m : parsed.magicCircleScript;
            }
            
            // emitterScript の復元
            let emitterScript = [];
            if (Array.isArray(emitterData)) {
                if (emitterData.length > 0 && Array.isArray(emitterData[0])) {
                    emitterScript = deserializeBlocks(emitterData);
                } else {
                    emitterScript = emitterData;
                }
            } else if (typeof emitterData === 'string') {
                emitterScript = typeof _codeToBlocksBrace === 'function' ? _codeToBlocksBrace(emitterData) : [];
            }
            
            // bulletScript の復元
            let bulletScript = [];
            if (Array.isArray(bulletData)) {
                if (bulletData.length > 0 && Array.isArray(bulletData[0])) {
                    bulletScript = deserializeBlocks(bulletData);
                } else {
                    bulletScript = bulletData;
                }
            } else if (typeof bulletData === 'string') {
                bulletScript = typeof _codeToBlocksBrace === 'function' ? _codeToBlocksBrace(bulletData) : [];
            }
            
            // magicCircleScript の復元
            let magicCircleScript = [];
            if (Array.isArray(magicCircleData)) {
                if (magicCircleData.length > 0 && Array.isArray(magicCircleData[0])) {
                    magicCircleScript = deserializeBlocks(magicCircleData);
                } else {
                    magicCircleScript = magicCircleData;
                }
            } else if (typeof magicCircleData === 'string') {
                magicCircleScript = typeof _codeToBlocksBrace === 'function' ? _codeToBlocksBrace(magicCircleData) : [];
            }
            
            return {
                id: 'cc_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                name: name,
                cost: cost,
                rawCost: cost,
                desc: desc,
                duration: duration,
                despawnTime: despawnTime,
                difficulty: difficulty,
                emitterScript: emitterScript,
                bulletScript: bulletScript,
                magicCircleScript: magicCircleScript
            };
        }

        function shareCustomCard(cardId) {
            const card = customCards.find(c => c.id === cardId);
            if (!card) return;
            try {
                // 配列かつ極小シリアライズされたデータをパック
                const miniCard = [
                    card.name,
                    card.cost || 100,
                    card.desc || '',
                    card.duration || 10,
                    serializeBlocks(card.emitterScript || []),
                    serializeBlocks(card.bulletScript || []),
                    serializeBlocks(card.magicCircleScript || []),
                    card.despawnTime !== undefined ? card.despawnTime : 1.5,
                    card.difficulty || 'NORMAL'
                ];

                const jsonStr = JSON.stringify(miniCard);
                
                // Deflate + Base64url で圧縮
                let compressed = deflateAndBase64url(jsonStr);
                let shareUrl;
                if (compressed) {
                    shareUrl = `${window.location.origin}${window.location.pathname}?card=pk_${compressed}`;
                } else {
                    // pakoがロードされていない等の場合のセーフティフォールバック（旧LZString）
                    const lzCompressed = LZString.compressToEncodedURIComponent(jsonStr);
                    shareUrl = `${window.location.origin}${window.location.pathname}?card=${lzCompressed}`;
                }

                // クリップボードにコピー
                navigator.clipboard.writeText(shareUrl).then(() => {
                    alert(`「${card.name.replace('【A】', '')}」の共有URLをコピーしました！\n完全オフライン対応の超圧縮URLです。\n\nURL: ${shareUrl}`);
                }).catch(err => {
                    prompt("共有URLをコピーしてください：", shareUrl);
                });
            } catch (e) {
                alert("共有URLの作成に失敗しました: " + e.message);
            }
        }

        function importCustomCardFromCode() {
            const code = prompt("共有されたURL、コード、またはカードID(UUID)を入力してください：");
            if (!code) return;
            
            let cardDataStr = "";
            if (code.includes("?card=")) {
                const urlParams = new URLSearchParams(code.substring(code.indexOf("?")));
                cardDataStr = urlParams.get("card");
            } else {
                cardDataStr = code.trim();
            }
            
            if (cardDataStr) {
                if (isUuidParam(cardDataStr)) {
                    fetchCardByUuid(cardDataStr);
                } else {
                    try {
                        let decompressed = "";
                        if (cardDataStr.startsWith('pk_')) {
                            const cleanB64 = cardDataStr.slice(3);
                            decompressed = inflateAndBase64url(cleanB64);
                        } else {
                            decompressed = LZString.decompressFromEncodedURIComponent(cardDataStr);
                        }
                        if (!decompressed) {
                            throw new Error("デコンプレスに失敗しました（データ破損の可能性）");
                        }
                        const card = parseSharedCard(decompressed);
                        importCard(card);
                    } catch (e) {
                        alert("データのインポートに失敗しました。正しい共有URLまたはコードを入力してください。\nエラー: " + e.message);
                    }
                }
            } else {
                alert("有効なコードが見わからんでした。");
            }
        }

        function importCard(card) {
            if (!card.name || !card.emitterScript || !card.bulletScript) {
                alert("無効なカードデータです。");
                return null;
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
            return card;
        }

        // --- オフライン用 Deflate (pako.js) + Base64url 圧縮ヘルパー ---
        function deflateAndBase64url(jsonStr) {
            if (typeof pako === 'undefined') return "";
            try {
                const enc = new TextEncoder();
                const bytes = enc.encode(jsonStr);
                const compressed = pako.deflate(bytes);
                let binary = '';
                const len = compressed.byteLength;
                for (let i = 0; i < len; i++) {
                    binary += String.fromCharCode(compressed[i]);
                }
                const b64 = btoa(binary);
                return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
            } catch (e) {
                console.error("Deflate error:", e);
                return "";
            }
        }

        function inflateAndBase64url(compressedB64) {
            if (typeof pako === 'undefined') return "";
            try {
                let b64 = compressedB64.replace(/-/g, '+').replace(/_/g, '/');
                while (b64.length % 4) {
                    b64 += '=';
                }
                const binary = atob(b64);
                const bytes = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) {
                    bytes[i] = binary.charCodeAt(i);
                }
                const decompressed = pako.inflate(bytes);
                const dec = new TextDecoder();
                return dec.decode(decompressed);
            } catch (e) {
                console.error("Inflate error:", e);
                return "";
            }
        }

        function checkUrlParams() {
            const params = new URLSearchParams(window.location.search);
            const cardDataStr = params.get('card');
            if (cardDataStr) {
                if (isUuidParam(cardDataStr)) {
                    setTimeout(() => {
                        if (confirm(`共有されたスペルカード (ID: ${cardDataStr}) をインポートして即座にテストプレイしますか？`)) {
                            fetchCardByUuid(cardDataStr, (importedCard) => {
                                if (importedCard) {
                                    customCardMakerOpenEditor(importedCard.id);
                                    startCustomCardTest();
                                }
                            });
                        }
                        const newUrl = window.location.pathname;
                        window.history.replaceState({}, document.title, newUrl);
                    }, 500);
                } else {
                    try {
                        let decompressed = "";
                        if (cardDataStr.startsWith('pk_')) {
                            // 新フォーマット：pako (deflate) による解凍
                            const cleanB64 = cardDataStr.slice(3); // 'pk_' プレフィックスを除去
                            decompressed = inflateAndBase64url(cleanB64);
                        } else {
                            // 旧フォーマット：LZString による解凍
                            decompressed = LZString.decompressFromEncodedURIComponent(cardDataStr);
                        }

                        if (decompressed) {
                            const card = parseSharedCard(decompressed);
                            setTimeout(() => {
                                if (confirm(`共有されたスペルカード「${card.name.replace('【A】', '')}」をインポートして即座にテストプレイしますか？`)) {
                                    const importedCard = importCard(card);
                                    if (importedCard) {
                                        customCardMakerOpenEditor(importedCard.id);
                                        startCustomCardTest();
                                    }
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
            let difficultyVal = document.getElementById('custom-card-difficulty') ? document.getElementById('custom-card-difficulty').value : (customCardMaker.difficulty || 'NORMAL');
            difficultyVal = typeof normalizeDifficulty === 'function' ? normalizeDifficulty(difficultyVal) : difficultyVal.toUpperCase();
            customCardMaker.difficulty = difficultyVal;
            
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
                difficulty: difficultyVal,
                activeTab: customCardMaker.activeTab,
                customCardMakerMode: customCardMakerMode,
                emitterScript: customCardMaker.emitterScript,
                bulletScript: customCardMaker.bulletScript,
                magicCircleScript: customCardMaker.magicCircleScript || [],
                testPassed: customCardMaker.testPassed,
                x_offset: document.getElementById('custom-card-x-offset') ? document.getElementById('custom-card-x-offset').value : "0",
                y_offset: document.getElementById('custom-card-y-offset') ? document.getElementById('custom-card-y-offset').value : "0",
                despawnTime: document.getElementById('custom-card-despawn-time') ? document.getElementById('custom-card-despawn-time').value : "1.5",
                maxMisses: document.getElementById('custom-card-max-misses') ? document.getElementById('custom-card-max-misses').value : "2",
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
                customCardMaker.maxMisses = draftData.maxMisses !== undefined ? Number(draftData.maxMisses) : 2;
                customCardMaker.difficulty = draftData.difficulty || 'NORMAL';
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
                customCardMaker.despawnTime = Number(draftData.despawnTime) || 1.5;
                if (document.getElementById('custom-card-x-offset')) document.getElementById('custom-card-x-offset').value = customCardMaker.x_offset;
                if (document.getElementById('custom-card-y-offset')) document.getElementById('custom-card-y-offset').value = customCardMaker.y_offset;
                if (document.getElementById('custom-card-despawn-time')) document.getElementById('custom-card-despawn-time').value = customCardMaker.despawnTime;
                if (document.getElementById('custom-card-max-misses')) document.getElementById('custom-card-max-misses').value = customCardMaker.maxMisses;
                if (document.getElementById('custom-card-difficulty')) document.getElementById('custom-card-difficulty').value = customCardMaker.difficulty;
                
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
                customCardMaker.despawnTime = migratedCard.despawnTime !== undefined ? migratedCard.despawnTime : 1.5;
                customCardMaker.maxMisses = migratedCard.maxMisses !== undefined ? migratedCard.maxMisses : 2;
                customCardMaker.difficulty = migratedCard.difficulty || 'NORMAL';
                customCardMaker.testPassed = true;
                document.getElementById('card-editor-title').textContent = "スペルカード編集";
            } else {
                customCardMaker.editingId = null;
                customCardMaker.name = 'カスタムスペル';
                customCardMaker.desc = 'オリジナルの弾幕パターン。';
                customCardMaker.duration = 15;
                customCardMaker.despawnTime = 1.5;
                customCardMaker.maxMisses = 2;
                customCardMaker.difficulty = 'NORMAL';
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
            if (document.getElementById('custom-card-despawn-time')) document.getElementById('custom-card-despawn-time').value = customCardMaker.despawnTime !== undefined ? customCardMaker.despawnTime : 1.5;
            if (document.getElementById('custom-card-max-misses')) document.getElementById('custom-card-max-misses').value = customCardMaker.maxMisses !== undefined ? customCardMaker.maxMisses : 2;
            if (document.getElementById('custom-card-difficulty')) document.getElementById('custom-card-difficulty').value = customCardMaker.difficulty;
            
            renderCardMaker();
        }

        function customCardMakerCloseEditor() {
            document.getElementById('card-maker-editor-view').classList.add('hidden');
            document.getElementById('card-maker-list-view').classList.remove('hidden');
            renderCardMakerList();
        }