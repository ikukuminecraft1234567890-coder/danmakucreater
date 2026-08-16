function customCardMakerSwitchTab(tab) {
            if (customCardMakerMode === 'code') {
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

            customCardMaker.activeTab = tab;
            document.getElementById('tab-btn-emitter').className = tab === 'emitter' ? 'tab-btn active' : 'tab-btn';
            document.getElementById('tab-btn-bullet').className = tab === 'bullet' ? 'tab-btn active' : 'tab-btn';
            document.getElementById('tab-btn-magic-circle').className = tab === 'magicCircle' ? 'tab-btn active' : 'tab-btn';
            
            if (customCardMakerMode === 'code') {
                let script = tab === 'emitter' ? customCardMaker.emitterScript 
                            : tab === 'bullet' ? customCardMaker.bulletScript 
                            : (customCardMaker.magicCircleScript || []);
                document.getElementById('workspace-code-textarea').value = blocksToCode(script);
                scheduleCustomCardCostCalculation();
            } else {
                renderCardMaker();
            }
        }

        function getActiveScript() {
            if (customCardMaker.activeTab === 'emitter') return customCardMaker.emitterScript;
            if (customCardMaker.activeTab === 'bullet') return customCardMaker.bulletScript;
            if (!customCardMaker.magicCircleScript) customCardMaker.magicCircleScript = [];
            return customCardMaker.magicCircleScript;
        }

        function customCardMakerAddBlock(type) {
            let script = getActiveScript();
            let block = { type: type, params: {}, indent: 0 };
            
            if (type === 'wait') {
                block.params.duration = '0.2';
            } else if (type === 'repeat') {
                block.params.count = '10';
            } else if (type === 'if') {
                block.params.cond = 'x < 10';
            } else if (type === 'aif') {
                block.type = 'if';
                block.params.cond = 'abs(y - ty) <= 3';
                block.params.aifTol = '3';
                block.params.aifCond = 'y == ty';
            } else if (type === 'const_var') {
                block.params.name = 'baseSpeed';
                block.params.value = '250';
            } else if (type === 'set_var') {
                block.params.name = 'speed';
                block.params.value = '250';
            } else if (type === 'change_var') {
                block.params.name = 'angle';
                block.params.value = '10';
                block.params.op = '+';
            } else if (type === 'speed_add') {
                block.type = 'change_var';
                block.params.name = 'speed';
                block.params.value = '10';
                block.params.op = '+';
            } else if (type === 'speed_set') {
                block.type = 'set_var';
                block.params.name = 'speed';
                block.params.value = '200';
            } else if (type === 'angle_add') {
                block.type = 'change_var';
                block.params.name = 'angle';
                block.params.value = '10';
                block.params.op = '+';
            } else if (type === 'angle_set') {
                block.type = 'set_var';
                block.params.name = 'angle';
                block.params.value = 'angle';
            } else if (type === 'color_set') {
                block.type = 'set_var';
                block.params.name = 'color';
                block.params.value = '#33ffff';
            } else if (type === 'bullet_image_set') {
                block.type = 'set_var';
                block.params.name = 'bulletImage';
                block.params.value = "'star'";
            } else if (type === 'move_owner') {
                block.params.preset = 'center';
                block.params.duration = '0';
            } else if (type === 'aim_at_coord') {
                block.params.targetX = '384';
                block.params.targetY = '300';
            } else if (type === 'slide_owner') {
                block.type = 'move_owner';
                block.params.preset = 'right';
                block.params.duration = '1.0';
            } else if (type === 'play_sound') {
                block.params.soundName = 'shot';
            } else if (type === 'spawn_bullet') {
                block.params.bulletType = 'normal';
                block.params.color = '#ff3333';
                block.params.speed = '200';
                block.params.angle = 'angle';
                block.params.radius = '6';
                block.params.hitRadius = '';
                block.params.bulletImage = 'none';
                block.params.coordMode = 'relative';
            } else if (type === 'spawn_bullet_resist') {
                block.type = 'spawn_bullet_resist';
                block.params.bulletType = 'normal';
                block.params.color = '#ff3333';
                block.params.speed = '200';
                block.params.angle = 'angle';
                block.params.radius = '6';
                block.params.hitRadius = '';
                block.params.bulletImage = 'none';
                block.params.coordMode = 'relative';
            } else if (type === 'spawn_ring') {
                block.params.bulletType = 'normal';
                block.params.color = '#ff3333';
                block.params.speed = '200';
                block.params.angle = '0';
                block.params.count = '12';
                block.params.radius = '6';
                block.params.hitRadius = '';
                block.params.bulletImage = 'none';
                block.params.coordMode = 'relative';
            } else if (type === 'spawn_ring_resist') {
                block.type = 'spawn_ring_resist';
                block.params.bulletType = 'normal';
                block.params.color = '#ff3333';
                block.params.speed = '200';
                block.params.angle = '0';
                block.params.count = '12';
                block.params.radius = '6';
                block.params.hitRadius = '';
                block.params.bulletImage = 'none';
                block.params.coordMode = 'relative';
            } else if (type === 'spawn_way') {
                block.params.bulletType = 'normal';
                block.params.color = '#ff3333';
                block.params.speed = '200';
                block.params.angle = 'angle';
                block.params.count = '3';
                block.params.spread = '30';
                block.params.radius = '6';
                block.params.hitRadius = '';
                block.params.bulletImage = 'none';
                block.params.coordMode = 'relative';
            } else if (type === 'spawn_way_resist') {
                block.type = 'spawn_way_resist';
                block.params.bulletType = 'normal';
                block.params.color = '#ff3333';
                block.params.speed = '200';
                block.params.angle = 'angle';
                block.params.count = '3';
                block.params.spread = '30';
                block.params.radius = '6';
                block.params.hitRadius = '';
                block.params.bulletImage = 'none';
                block.params.coordMode = 'relative';
            } else if (type === 'homing') {
                block.params.turnSpeed = '90';
            } else if (type === 'spawn_magic_circle') {
                block.params.color = '#00ffff';
                block.params.offsetX = '50';
                block.params.offsetY = '-50';
            } else if (type === 'spawn_trail' || type === 'spawn_trail_resist') {
                block.type = type;
                block.params.bulletType = 'trail';
                block.params.color = '#00ffff';
                block.params.speed = '200';
                block.params.angle = 'angle';
                block.params.offsetX = '0';
                block.params.offsetY = '0';
                block.params.radius = '8';
                block.params.growTime = '0.2';
                block.params.keepTime = '0.3';
                block.params.shrinkTime = '0.5';
                block.params.round = 'true';
                block.params.coordMode = 'relative';
                block.params.hitRadius = '';
            } else if (type === 'spawn_laser_way' || type === 'spawn_laser_way_resist') {
                block.type = type;
                block.params.bulletType = 'laser';
                block.params.color = '#ff3333';
                block.params.speed = '200';
                block.params.angle = 'angle';
                block.params.count = '3';
                block.params.spread = '45';
                block.params.offsetX = '0';
                block.params.offsetY = '0';
                block.params.radius = '6';
                block.params.coordMode = 'relative';
                block.params.hitRadius = '';
            } else if (type === 'spawn_laser_ring' || type === 'spawn_laser_ring_resist') {
                block.type = type;
                block.params.bulletType = 'laser';
                block.params.color = '#ff3333';
                block.params.speed = '200';
                block.params.angle = 'angle';
                block.params.count = '12';
                block.params.offsetX = '0';
                block.params.offsetY = '0';
                block.params.radius = '6';
                block.params.coordMode = 'relative';
                block.params.hitRadius = '';
            } else if (type === 'spawn_beam' || type === 'spawn_beam_resist') {
                block.type = type;
                block.params.warningTime = '1.0';
                block.params.activeTime = '1.5';
                block.params.laserWidth = '12';
                block.params.angle = 'angle';
                block.params.offsetX = '0';
                block.params.offsetY = '0';
                block.params.coordMode = 'relative';
                block.params.hitRadius = '';
            } else if (type === 'spawn_beam_way' || type === 'spawn_beam_way_resist') {
                block.type = type;
                block.params.warningTime = '1.0';
                block.params.activeTime = '1.5';
                block.params.laserWidth = '12';
                block.params.angle = 'angle';
                block.params.count = '3';
                block.params.spread = '45';
                block.params.offsetX = '0';
                block.params.offsetY = '0';
                block.params.coordMode = 'relative';
                block.params.hitRadius = '';
            } else if (type === 'spawn_beam_ring' || type === 'spawn_beam_ring_resist') {
                block.type = type;
                block.params.warningTime = '1.0';
                block.params.activeTime = '1.5';
                block.params.laserWidth = '12';
                block.params.angle = 'angle';
                block.params.count = '12';
                block.params.offsetX = '0';
                block.params.offsetY = '0';
                block.params.coordMode = 'relative';
                block.params.hitRadius = '';
            } else if (type === 'speed_scale_slow') {
                block.type = 'speed_scale'; block.params.mode = 'slow'; block.params.effect = '0.5'; block.params.delay = '0';
            } else if (type === 'speed_scale_fast') {
                block.type = 'speed_scale'; block.params.mode = 'fast'; block.params.effect = '2'; block.params.delay = '0';
            } else if (type === 'set_laser') {
                block.params.warningTime = '1.0';
                block.params.activeTime = '1.5';
                block.params.laserWidth = '12';
            } else if (type === 'tween_var' || type === 'tween_var_wait') {
                block.params.name = 'angle';
                block.params.from = '0';
                block.params.to = '360';
                block.params.mode = 'seconds';
                block.params.duration = '1';
                block.params.stepVal = '5';
                block.params.easing = 'linear';
            } else if (type === 'tween_angle' || type === 'tween_angle_wait') {
                block.params.from = '0';
                block.params.to = '360';
                block.params.mode = 'seconds';
                block.params.duration = '1';
                block.params.easing = 'linear';
            } else if (type === 'advance') {
                block.params.distance = '50';
            } else if (type === 'once') {
                block.params = {};
            }
            
            script.push(block);
            customCardMaker.testPassed = false;
            saveCustomCardDraft(false);
            renderCardMaker();
        }

        function customCardMakerUpdateParam(idx, paramName, value) {
            let script = getActiveScript();
            script[idx].params[paramName] = value;
            if (paramName === 'aifTol' || paramName === 'aifCond') {
                let tol = script[idx].params.aifTol || '0';
                let condStr = script[idx].params.aifCond || 'y == ty';
                condStr = condStr.replace(/([^&|?,:=()]+)\s*==\s*([^&|?,:=()]+)/g, `abs($1 - $2) <= ${tol}`);
                condStr = condStr.replace(/([^&|?,:=()]+)\s*!=\s*([^&|?,:=()]+)/g, `abs($1 - $2) > ${tol}`);
                script[idx].params.cond = condStr;
            }
            customCardMaker.testPassed = false;
            saveCustomCardDraft(false);
            renderCardMaker();
        }

        function customCardMakerOnIfCondSelectChange(idx, val) {
            let script = getActiveScript();
            if (val === 'custom') {
                let input = document.getElementById(`if-cond-input-${idx}`);
                if (input) {
                    input.style.display = 'inline-block';
                    input.focus();
                }
            } else {
                customCardMakerUpdateParam(idx, 'cond', val);
            }
        }

        function customCardMakerIndent(idx, dir) {
            let script = getActiveScript();
            script[idx].indent = Math.max(0, Math.min(20, (script[idx].indent || 0) + dir));
            customCardMaker.testPassed = false;
            saveCustomCardDraft(false);
            renderCardMaker();
        }

        function customCardMakerMove(idx, dir) {
            let script = getActiveScript();
            let targetIdx = idx + dir;
            if (targetIdx >= 0 && targetIdx < script.length) {
                let temp = script[idx];
                script[idx] = script[targetIdx];
                script[targetIdx] = temp;
                customCardMaker.testPassed = false;
                saveCustomCardDraft(false);
                renderCardMaker();
            }
        }

        function customCardMakerDelete(idx) {
            let script = getActiveScript();
            script.splice(idx, 1);
            customCardMaker.testPassed = false;
            saveCustomCardDraft(false);
            renderCardMaker();
        }

        function renderBlockControls(idx) {
            return `
                <div class="block-controls">
                    <button class="block-ctrl-btn" onclick="customCardMakerIndent(${idx}, -1)" title="インデントを下げる">◀</button>
                    <button class="block-ctrl-btn" onclick="customCardMakerIndent(${idx}, 1)" title="インデントを上げる">▶</button>
                    <button class="block-ctrl-btn" onclick="customCardMakerMove(${idx}, -1)" title="上に移動">▲</button>
                    <button class="block-ctrl-btn" onclick="customCardMakerMove(${idx}, 1)" title="下に移動">▼</button>
                    <button class="block-ctrl-btn btn-delete" onclick="customCardMakerDelete(${idx})" title="削除">×</button>
                </div>
            `;
        }

        function renderCardMaker() {
            let tab = customCardMaker.activeTab;
            
            // 制御グループ
            document.getElementById('palette-title-control').style.display = 'block';
            document.getElementById('palette-btn-repeat').style.display = 'block';
            document.getElementById('palette-btn-forever').style.display = 'block';
            document.getElementById('palette-btn-wait').style.display = 'block';
            document.getElementById('palette-btn-if').style.display = 'block';
            document.getElementById('palette-btn-once').style.display = 'block';
            
            // 変数グループ
            document.getElementById('palette-title-vars').style.display = 'block';
            document.getElementById('palette-btn-setconst').style.display = 'block';
            document.getElementById('palette-btn-setvar').style.display = 'block';
            document.getElementById('palette-btn-changevar').style.display = 'block';
            document.getElementById('palette-btn-tweenvar').style.display = 'block';
            document.getElementById('palette-btn-tweenvarwait').style.display = 'block';
            document.getElementById('palette-btn-setlaser').style.display = (tab === 'bullet') ? 'block' : 'none';
            
            // 動作グループ
            document.getElementById('palette-btn-aim').style.display = 'block';
            document.getElementById('palette-btn-move-owner').style.display = (tab === 'emitter') ? 'block' : 'none';
            document.getElementById('palette-btn-slide-owner').style.display = (tab === 'emitter') ? 'block' : 'none';
            document.getElementById('palette-btn-spawn').style.display = 'block';
            document.getElementById('palette-btn-spawn-ring').style.display = 'block';
            document.getElementById('palette-btn-spawn-way').style.display = 'block';
            if (document.getElementById('palette-btn-magic-circle')) {
                document.getElementById('palette-btn-magic-circle').style.display = 'block';
            }
            document.getElementById('palette-btn-homing').style.display = (tab === 'bullet') ? 'block' : 'none';
            document.getElementById('palette-btn-speed-add').style.display = (tab === 'bullet') ? 'block' : 'none';
            document.getElementById('palette-btn-speed-set').style.display = (tab === 'bullet') ? 'block' : 'none';
            document.getElementById('palette-btn-angle-add').style.display = (tab === 'bullet') ? 'block' : 'none';
            document.getElementById('palette-btn-angle-set').style.display = (tab === 'bullet') ? 'block' : 'none';
            document.getElementById('palette-btn-color-set').style.display = (tab === 'bullet') ? 'block' : 'none';
            document.getElementById('palette-btn-bullet-image-set').style.display = (tab === 'bullet') ? 'block' : 'none';
            document.getElementById('palette-btn-slow').style.display = (tab === 'bullet') ? 'block' : 'none';
            document.getElementById('palette-btn-fast').style.display = (tab === 'bullet') ? 'block' : 'none';
            document.getElementById('palette-btn-bounce').style.display = (tab === 'bullet') ? 'block' : 'none';
            document.getElementById('palette-btn-advance').style.display = (tab === 'bullet') ? 'block' : 'none';
            
            let container = document.getElementById('workspace-blocks-container');
            container.innerHTML = '';
            
            let script = getActiveScript();
            
            if (script.length === 0) {
                container.innerHTML = '<div style="color:#888; font-size:12px; text-align:center; padding:50px 0; border:1.5px dashed rgba(255,255,255,0.1); border-radius:8px;">ブロックがありません。左のパレットをクリックしてブロックを追加してください。</div>';
            } else {
                for (let i = 0; i < script.length; i++) {
                    if (i === 0) script[i].indent = 0;
                    else script[i].indent = Math.min(script[i].indent || 0, script[i - 1].indent + 1);
                }

                script.forEach((b, idx) => {
                    const blockDiv = document.createElement('div');
                    let margin = b.indent * 20;
                    blockDiv.style.marginLeft = margin + 'px';
                    
                    let html = '';
                    switch (b.type) {
                        case 'unknown':
                            blockDiv.className = 'maker-block color-unknown';
                            blockDiv.style.backgroundColor = '#3e3e3e';
                            blockDiv.style.borderLeft = '4px solid #888888';
                            html = `
                                <span style="color:#aaa; font-weight:bold; margin-right:5px;">[未解釈]</span>
                                <input type="text" style="width:260px; background:#1a1a1a; color:#fff; border:1px solid #444; padding:3px 6px; border-radius:4px; font-family:monospace;" value="${b.params.code}" onchange="customCardMakerUpdateParam(${idx}, 'code', this.value)">
                                ${renderBlockControls(idx)}
                            `;
                            break;
                        case 'wait':
                            blockDiv.className = 'maker-block color-control';
                            html = `
                                <span>[制御]</span>
                                <input type="text" list="val-suggestions" style="width:50px;" value="${b.params.duration}" onchange="customCardMakerUpdateParam(${idx}, 'duration', this.value)">
                                <span>秒待つ</span>
                                ${renderBlockControls(idx)}
                            `;
                            break;
                        case 'repeat':
                            blockDiv.className = 'maker-block color-control';
                            html = `
                                <span>[制御]</span>
                                <span>変数</span>
                                <input type="text" list="var-suggestions" style="width:44px; min-width:44px;" value="${b.params.indexVar || 'i'}" onchange="customCardMakerUpdateParam(${idx}, 'indexVar', this.value)">
                                <input type="text" list="val-suggestions" style="width:50px;" value="${b.params.count}" onchange="customCardMakerUpdateParam(${idx}, 'count', this.value)">
                                <span>回くりかえす</span>
                                ${renderBlockControls(idx)}
                            `;
                            break;
                        case 'forever':
                            blockDiv.className = 'maker-block color-control';
                            html = `
                                <span>[制御] ずっとくりかえす</span>
                                ${renderBlockControls(idx)}
                            `;
                            break;
                        case 'while':
                            blockDiv.className = 'maker-block color-control';
                            html = `
                                <span>[制御] while</span>
                                <input type="text" list="val-suggestions" style="width:110px;" value="${b.params.cond || 'second < 14'}" onchange="customCardMakerUpdateParam(${idx}, 'cond', this.value)">
                                <span>の間</span>
                                ${renderBlockControls(idx)}
                            `;
                            break;
                        case 'once':
                            blockDiv.className = 'maker-block color-control';
                            html = `
                                <span>[制御] 1度だけ実行する</span>
                                ${renderBlockControls(idx)}
                            `;
                            break;
                        case 'aim_at_coord':
                            blockDiv.className = 'maker-block color-control';
                            html = `
                                <span>[制御] <span style="color:#ffcc00;font-weight:bold;">aimAt</span>(${b.params.targetX || '0'}, ${b.params.targetY || '0'})</span>
                                ${renderBlockControls(idx)}
                            `;
                            break;
                        case 'if': {
                            if (b.params.aifTol !== undefined) {
                                blockDiv.className = 'maker-block color-control';
                                html = `
                                    <span>[制御] <span style="color:#ffcc00;font-weight:bold;">aif</span>[<input type="text" class="block-param-input" style="width:40px;" value="${b.params.aifTol}" onchange="customCardMakerUpdateParam(${idx}, 'aifTol', this.value)">] (
                                    <input type="text" class="block-param-input" style="width:120px;" value="${b.params.aifCond}" onchange="customCardMakerUpdateParam(${idx}, 'aifCond', this.value)"> )</span>
                                    ${renderBlockControls(idx)}
                                `;
                                break;
                            }
                            let cond = b.params.cond || 'isBounced';
                            let normalizedCond = cond.replace(/\s+/g, '');
                            let selectVal = 'custom';
                            if (normalizedCond === 'isbounced' || cond === 'isBounced') selectVal = 'isBounced';
                            else if (normalizedCond === 'istouchedge' || cond === 'isTouchEdge') selectVal = 'isTouchEdge';
                            else if (normalizedCond === 'touchingedge' || cond === 'touchingEdge') selectVal = 'touchingEdge';
                            else if (normalizedCond === 'istouchbullet' || cond === 'isTouchBullet') selectVal = 'isTouchBullet';
                            else if (normalizedCond === 'touchingbullet' || cond === 'touchingBullet') selectVal = 'touchingBullet';
                            else if (normalizedCond === 'cardsecond==5*n' || cond === 'cardSecond == 5 * n') selectVal = 'cardSecond == 5 * n';
                            else if (normalizedCond === 'cardframe==60*n' || cond === 'cardFrame == 60 * n') selectVal = 'cardFrame == 60 * n';
                            else if (normalizedCond === 'touchcolor==#ff3333') selectVal = 'touchColor == #ff3333';
                            else if (normalizedCond === 'timer>1' || normalizedCond === 'timer>1.0') selectVal = 'timer > 1';
                            else if (normalizedCond === 'x<10') selectVal = 'x < 10';
                            else if (normalizedCond === 'x>758' || normalizedCond === 'x>590' || normalizedCond === 'x>790') selectVal = 'x > 758';
                            else if (normalizedCond === 'y<10') selectVal = 'y < 10';
                            else if (normalizedCond === 'y>886' || normalizedCond === 'y>890') selectVal = 'y > 886';
                            else if (normalizedCond === 'dist<150') selectVal = 'dist < 150';
                            else if (normalizedCond === 'color==#33ffff') selectVal = 'color == #33ffff';
                            else if (normalizedCond === 'color!=#33ffff') selectVal = 'color != #33ffff';
                            
                            blockDiv.className = 'maker-block color-control';
                            html = `
                                <span>[制御] もし</span>
                                <select onchange="customCardMakerOnIfCondSelectChange(${idx}, this.value)" style="margin-right: 4px;">
                                    <option value="isBounced" ${selectVal === 'isBounced' ? 'selected' : ''}>壁に触れたら (isBounced)</option>
                                    <option value="isTouchEdge" ${selectVal === 'isTouchEdge' ? 'selected' : ''}>画面端に触れた瞬間 (isTouchEdge)</option>
                                    <option value="touchingEdge" ${selectVal === 'touchingEdge' ? 'selected' : ''}>画面端に接触中 (touchingEdge)</option>
                                    <option value="isTouchBullet" ${selectVal === 'isTouchBullet' ? 'selected' : ''}>弾に触れた瞬間 (isTouchBullet)</option>
                                    <option value="touchingBullet" ${selectVal === 'touchingBullet' ? 'selected' : ''}>弾に触れている間 (touchingBullet)</option>
                                    <option value="cardSecond == 5 * n" ${selectVal === 'cardSecond == 5 * n' ? 'selected' : ''}>5秒おきに (cardSecond == 5 * n)</option>
                                    <option value="cardFrame == 60 * n" ${selectVal === 'cardFrame == 60 * n' ? 'selected' : ''}>1秒(60F)おきに (cardFrame == 60 * n)</option>
                                    <option value="touchColor == #ff3333" ${selectVal === 'touchColor == #ff3333' ? 'selected' : ''}>触れた弾が赤なら (touchColor == #ff3333)</option>
                                    <option value="timer > 1" ${selectVal === 'timer > 1' ? 'selected' : ''}>1秒経過したら (timer > 1)</option>
                                    <option value="x < 10" ${selectVal === 'x < 10' ? 'selected' : ''}>画面左端に達したら (x < 10)</option>
                                    <option value="x > 758" ${selectVal === 'x > 758' ? 'selected' : ''}>画面右端に達したら (x > 758)</option>
                                    <option value="y < 10" ${selectVal === 'y < 10' ? 'selected' : ''}>画面上端に達したら (y < 10)</option>
                                    <option value="y > 886" ${selectVal === 'y > 886' ? 'selected' : ''}>画面下端に達したら (y > 886)</option>
                                    <option value="dist < 150" ${selectVal === 'dist < 150' ? 'selected' : ''}>相手に近づいたら (dist < 150)</option>
                                    <option value="color == #33ffff" ${selectVal === 'color == #33ffff' ? 'selected' : ''}>色がシアンなら (color == #33ffff)</option>
                                    <option value="color != #33ffff" ${selectVal === 'color != #33ffff' ? 'selected' : ''}>色がシアン以外なら (color != #33ffff)</option>
                                    <option value="custom" ${selectVal === 'custom' ? 'selected' : ''}>その他 (自由記述)</option>
                                </select>
                                <input type="text" id="if-cond-input-${idx}" list="val-suggestions" style="width:90px; display:${selectVal === 'custom' ? 'inline-block' : 'none'};" value="${cond}" onchange="customCardMakerUpdateParam(${idx}, 'cond', this.value)">
                                <span>なら</span>
                                ${renderBlockControls(idx)}
                            `;
                            break;
                        }
                        case 'const_var':
                            blockDiv.className = 'maker-block color-vars';
                            html = `
                                <span>[const]</span>
                                <input type="text" list="var-suggestions" style="width:75px;" value="${b.params.name}" onchange="customCardMakerUpdateParam(${idx}, 'name', this.value)">
                                <span>=</span>
                                <input type="text" list="val-suggestions" style="width:70px;" value="${b.params.value}" onchange="customCardMakerUpdateParam(${idx}, 'value', this.value)">
                                ${renderBlockControls(idx)}
                            `;
                            break;
                        case 'set_var':
                            blockDiv.className = 'maker-block color-vars';
                            html = `
                                <span>[変数]</span>
                                <input type="text" list="var-suggestions" style="width:75px;" value="${b.params.name}" onchange="customCardMakerUpdateParam(${idx}, 'name', this.value)">
                                <span>を</span>
                                <input type="text" list="${b.params.name === 'bulletImage' ? 'image-suggestions' : (b.params.name === 'color' ? 'color-suggestions' : 'val-suggestions')}" style="width:70px;" value="${b.params.value}" onchange="customCardMakerUpdateParam(${idx}, 'value', this.value)">
                                <span>にする</span>
                                ${renderBlockControls(idx)}
                            `;
                            break;
                        case 'change_var':
                            blockDiv.className = 'maker-block color-vars';
                            html = `
                                <span>[変数]</span>
                                <input type="text" list="var-suggestions" style="width:75px;" value="${b.params.name}" onchange="customCardMakerUpdateParam(${idx}, 'name', this.value)">
                                <span>を</span>
                                <select onchange="customCardMakerUpdateParam(${idx}, 'op', this.value)">
                                    <option value="+" ${(b.params.op || '+') === '+' ? 'selected' : ''}>+=</option>
                                    <option value="-" ${b.params.op === '-' ? 'selected' : ''}>-=</option>
                                </select>
                                <input type="text" list="val-suggestions" style="width:70px;" value="${b.params.value}" onchange="customCardMakerUpdateParam(${idx}, 'value', this.value)">
                                ${renderBlockControls(idx)}
                            `;
                            break;
                        case 'aim_at_target':
                            blockDiv.className = 'maker-block color-motion';
                            html = `
                                <span>[動作] 相手の方向を向く (angleを設定)</span>
                                ${renderBlockControls(idx)}
                            `;
                            break;
                        case 'aim_at_coord':
                            blockDiv.className = 'maker-block color-motion';
                            html = `
                                <span>[動作] 座標を向く X:</span>
                                <input type="text" list="val-suggestions" style="width:70px;" value="${b.params.targetX || '0'}" onchange="customCardMakerUpdateParam(${idx}, 'targetX', this.value)">
                                <span>Y:</span>
                                <input type="text" list="val-suggestions" style="width:70px;" value="${b.params.targetY || '0'}" onchange="customCardMakerUpdateParam(${idx}, 'targetY', this.value)">
                                <span>(angleを設定)</span>
                                ${renderBlockControls(idx)}
                            `;
                            break;
                        case 'move_owner':
                            blockDiv.className = 'maker-block color-motion';
                            html = `
                                <span>[位置]</span>
                                <select style="min-width:180px;" onchange="customCardMakerUpdateParam(${idx}, 'preset', this.value)">
                                    <option value="center" ${(b.params.preset || 'center') === 'center' ? 'selected' : ''}>中央</option>
                                    <option value="right" ${b.params.preset === 'right' ? 'selected' : ''}>右</option>
                                    <option value="left" ${b.params.preset === 'left' ? 'selected' : ''}>左</option>
                                    <option value="farRight" ${b.params.preset === 'farRight' ? 'selected' : ''}>最右</option>
                                    <option value="farLeft" ${b.params.preset === 'farLeft' ? 'selected' : ''}>最左</option>
                                    <option value="rightUp" ${(b.params.preset === 'rightUp' || b.params.preset === 'enemyRightUp') ? 'selected' : ''}>右上（敵使用時、こっちから見て右上）</option>
                                    <option value="leftUp" ${(b.params.preset === 'leftUp' || b.params.preset === 'enemyLeftUp') ? 'selected' : ''}>左上（敵使用時、こっちから見て左上）</option>
                                </select>
                                <span>へ</span><span>時間</span>
                                <input type="text" list="val-suggestions" style="width:70px; min-width:70px;" value="${b.params.duration || '0'}" onchange="customCardMakerUpdateParam(${idx}, 'duration', this.value)">
                                <span>秒</span>
                                ${renderBlockControls(idx)}
                            `;
                            break;
                        case 'play_sound':
                            blockDiv.className = 'maker-block color-action';
                            html = `
                                <span>[効果音]</span>
                                <select style="min-width:180px;" onchange="customCardMakerUpdateParam(${idx}, 'soundName', this.value)">
                                    <option value="shot" ${(b.params.soundName || 'shot') === 'shot' ? 'selected' : ''}>ショット音 (se_tan00/小)</option>
                                    <option value="shot_raw" ${b.params.soundName === 'shot_raw' ? 'selected' : ''}>等倍ショット音 (se_tan00/大)</option>
                                    <option value="laser" ${b.params.soundName === 'laser' ? 'selected' : ''}>細レーザー音 (se_lazer00)</option>
                                    <option value="laser_heavy" ${b.params.soundName === 'laser_heavy' ? 'selected' : ''}>太レーザー音 (se_gun00)</option>
                                    <option value="charge" ${b.params.soundName === 'charge' ? 'selected' : ''}>チャージ音1 (se_ch00)</option>
                                    <option value="charge2" ${b.params.soundName === 'charge2' ? 'selected' : ''}>チャージ音2 (se_ch02)</option>
                                    <option value="maspa_short" ${b.params.soundName === 'maspa_short' ? 'selected' : ''}>マスパ短 (bomb)</option>
                                    <option value="maspa_long" ${b.params.soundName === 'maspa_long' ? 'selected' : ''}>マスパ長 (bomb2)</option>
                                    <option value="don00" ${b.params.soundName === 'don00' ? 'selected' : ''}>ドン音 (se_don00)</option>
                                    <option value="change" ${b.params.soundName === 'change' ? 'selected' : ''}>切り替え音 (change)</option>
                                    <option value="boon00" ${b.params.soundName === 'boon00' ? 'selected' : ''}>アビリティ音 (se_boon00)</option>
                                    <option value="boon01" ${b.params.soundName === 'boon01' ? 'selected' : ''}>回復/警告音 (se_boon01)</option>
                                </select>
                                <button class="menu-btn" style="min-width:32px; height:24px; padding:0 6px; margin:0 0 0 6px; line-height:22px; vertical-align:middle; background:linear-gradient(135deg, #005544 0%, #002211 100%); border-color:#00ffcc; color:#00ffcc; font-weight:bold; cursor:pointer;" onclick="playSound('${b.params.soundName || 'shot'}')">試聴 ▶</button>
                                <span>を鳴らす</span>
                                ${renderBlockControls(idx)}
                            `;
                            break;
                        case 'spawn_bullet':
                            blockDiv.className = 'maker-block color-action';
                            html = `
                                <span>[発射] 弾を発射する - 見た目:</span>
                                <select onchange="customCardMakerUpdateParam(${idx}, 'bulletType', this.value)">
                                    <option value="normal" ${b.params.bulletType === 'normal' ? 'selected' : ''}>通常弾</option>
                                    <option value="laser" ${b.params.bulletType === 'laser' ? 'selected' : ''}>レーザー</option>
                                </select>
                                <span>画像:</span>
                                <select onchange="customCardMakerUpdateParam(${idx}, 'bulletImage', this.value)">
                                    <option value="none" ${b.params.bulletImage === 'none' ? 'selected' : ''}>丸（ドロー）</option>
                                    <option value="light" ${b.params.bulletImage === 'light' ? 'selected' : ''}>光弾</option>
                                    <option value="sword" ${b.params.bulletImage === 'sword' ? 'selected' : ''}>剣弾</option>
                                    <option value="marutama" ${b.params.bulletImage === 'marutama' ? 'selected' : ''}>丸弾</option>
                                    <option value="kome" ${b.params.bulletImage === 'kome' ? 'selected' : ''}>米弾</option>
                                    <option value="ootama" ${b.params.bulletImage === 'ootama' ? 'selected' : ''}>大玉</option>
                                    <option value="ohuda" ${b.params.bulletImage === 'ohuda' ? 'selected' : ''}>お札</option>
                                    <option value="star" ${b.params.bulletImage === 'star' ? 'selected' : ''}>星</option>
                                    <option value="knife" ${b.params.bulletImage === 'knife' ? 'selected' : ''}>ナイフ</option>
                                    <option value="uroko" ${b.params.bulletImage === 'uroko' ? 'selected' : ''}>鱗弾</option>
                                    <option value="poihuru" ${b.params.bulletImage === 'poihuru' ? 'selected' : ''}>ポイフル</option>
                                    <option value="virus" ${b.params.bulletImage === 'virus' ? 'selected' : ''}>ウイルス</option>
                                    <option value="onmyoutama" ${b.params.bulletImage === 'onmyoutama' || b.params.bulletImage === 'onmyoudama' ? 'selected' : ''}>陰陽弾</option>
                                    <option value="b_marutama" ${b.params.bulletImage === 'b_marutama' ? 'selected' : ''}>巨大丸弾</option>
                                    <option value="b_ohuda" ${b.params.bulletImage === 'b_ohuda' ? 'selected' : ''}>巨大お札</option>
                                    <option value="b_star" ${b.params.bulletImage === 'b_star' ? 'selected' : ''}>巨大星弾</option>
                                    <option value="b_knife" ${b.params.bulletImage === 'b_knife' ? 'selected' : ''}>巨大ナイフ</option>
                                    <option value="b_poihuru" ${b.params.bulletImage === 'b_poihuru' ? 'selected' : ''}>巨大ポイフル</option>
                                    <option value="b_uroko" ${b.params.bulletImage === 'b_uroko' ? 'selected' : ''}>巨大鱗弾</option>
                                    <option value="dangan" ${b.params.bulletImage === 'dangan' ? 'selected' : ''}>弾丸</option>
                                    <option value="kunai1" ${b.params.bulletImage === 'kunai1' ? 'selected' : ''}>クナイ1</option>
                                    <option value="kunai2" ${b.params.bulletImage === 'kunai2' ? 'selected' : ''}>クナイ2</option>
                                    <option value="tyoudan" ${b.params.bulletImage === 'tyoudan' ? 'selected' : ''}>蝶弾</option>
                                </select>
                                <span>半径:</span>
                                <input type="text" list="val-suggestions" style="width:30px;" value="${b.params.radius || '6'}" onchange="customCardMakerUpdateParam(${idx}, 'radius', this.value)">
                                <span>判定:</span>
                                <input type="text" placeholder="自動" list="val-suggestions" style="width:30px;" value="${b.params.hitRadius || ''}" onchange="customCardMakerUpdateParam(${idx}, 'hitRadius', this.value)">
                                <select onchange="customCardMakerUpdateParam(${idx}, 'coordMode', this.value)">
                                    <option value="relative" ${b.params.coordMode === 'relative' ? 'selected' : ''}>相対座標</option>
                                    <option value="absolute" ${b.params.coordMode === 'absolute' ? 'selected' : ''}>絶対座標</option>
                                </select>
                                <span>色:</span>
                                <input type="text" list="color-suggestions" style="width:76px;" value="${b.params.color || '#ff3333'}" onchange="customCardMakerUpdateParam(${idx}, 'color', this.value)">
                                <span>速度:</span>
                                <input type="text" list="val-suggestions" style="width:50px;" value="${b.params.speed}" onchange="customCardMakerUpdateParam(${idx}, 'speed', this.value)">
                                <span>角度:</span>
                                <input type="text" list="val-suggestions" style="width:50px;" value="${b.params.angle}" onchange="customCardMakerUpdateParam(${idx}, 'angle', this.value)">
                                <span>X:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.offsetX || '0'}" onchange="customCardMakerUpdateParam(${idx}, 'offsetX', this.value)">
                                <span>Y:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.offsetY || '0'}" onchange="customCardMakerUpdateParam(${idx}, 'offsetY', this.value)">
                                ${renderBlockControls(idx)}
                            `;
                            break;
                        case 'spawn_bullet_resist':
                            blockDiv.className = 'maker-block color-action';
                            blockDiv.style.border = '1.5px dashed #ffb833';
                            html = `
                                <span style="color:#ffcc66; font-weight:bold;">[発射] 弾を発射する(耐性) - 見た目:</span>
                                <select onchange="customCardMakerUpdateParam(${idx}, 'bulletType', this.value)">
                                    <option value="normal" ${b.params.bulletType === 'normal' ? 'selected' : ''}>通常弾</option>
                                    <option value="laser" ${b.params.bulletType === 'laser' ? 'selected' : ''}>レーザー</option>
                                </select>
                                <span>画像:</span>
                                <select onchange="customCardMakerUpdateParam(${idx}, 'bulletImage', this.value)">
                                    <option value="none" ${b.params.bulletImage === 'none' ? 'selected' : ''}>丸（ドロー）</option>
                                    <option value="light" ${b.params.bulletImage === 'light' ? 'selected' : ''}>光弾</option>
                                    <option value="sword" ${b.params.bulletImage === 'sword' ? 'selected' : ''}>剣弾</option>
                                    <option value="marutama" ${b.params.bulletImage === 'marutama' ? 'selected' : ''}>丸弾</option>
                                    <option value="kome" ${b.params.bulletImage === 'kome' ? 'selected' : ''}>米弾</option>
                                    <option value="ootama" ${b.params.bulletImage === 'ootama' ? 'selected' : ''}>大玉</option>
                                    <option value="ohuda" ${b.params.bulletImage === 'ohuda' ? 'selected' : ''}>お札</option>
                                    <option value="star" ${b.params.bulletImage === 'star' ? 'selected' : ''}>星</option>
                                    <option value="knife" ${b.params.bulletImage === 'knife' ? 'selected' : ''}>ナイフ</option>
                                    <option value="uroko" ${b.params.bulletImage === 'uroko' ? 'selected' : ''}>鱗弾</option>
                                    <option value="poihuru" ${b.params.bulletImage === 'poihuru' ? 'selected' : ''}>ポイフル</option>
                                    <option value="virus" ${b.params.bulletImage === 'virus' ? 'selected' : ''}>ウイルス</option>
                                    <option value="onmyoutama" ${b.params.bulletImage === 'onmyoutama' || b.params.bulletImage === 'onmyoudama' ? 'selected' : ''}>陰陽弾</option>
                                    <option value="b_marutama" ${b.params.bulletImage === 'b_marutama' ? 'selected' : ''}>巨大丸弾</option>
                                    <option value="b_ohuda" ${b.params.bulletImage === 'b_ohuda' ? 'selected' : ''}>巨大お札</option>
                                    <option value="b_star" ${b.params.bulletImage === 'b_star' ? 'selected' : ''}>巨大星弾</option>
                                    <option value="b_knife" ${b.params.bulletImage === 'b_knife' ? 'selected' : ''}>巨大ナイフ</option>
                                    <option value="b_poihuru" ${b.params.bulletImage === 'b_poihuru' ? 'selected' : ''}>巨大ポイフル</option>
                                    <option value="b_uroko" ${b.params.bulletImage === 'b_uroko' ? 'selected' : ''}>巨大鱗弾</option>
                                    <option value="dangan" ${b.params.bulletImage === 'dangan' ? 'selected' : ''}>弾丸</option>
                                    <option value="kunai1" ${b.params.bulletImage === 'kunai1' ? 'selected' : ''}>クナイ1</option>
                                    <option value="kunai2" ${b.params.bulletImage === 'kunai2' ? 'selected' : ''}>クナイ2</option>
                                    <option value="tyoudan" ${b.params.bulletImage === 'tyoudan' ? 'selected' : ''}>蝶弾</option>
                                </select>
                                <span>半径:</span>
                                <input type="text" list="val-suggestions" style="width:30px;" value="${b.params.radius || '6'}" onchange="customCardMakerUpdateParam(${idx}, 'radius', this.value)">
                                <span>判定:</span>
                                <input type="text" placeholder="自動" list="val-suggestions" style="width:30px;" value="${b.params.hitRadius || ''}" onchange="customCardMakerUpdateParam(${idx}, 'hitRadius', this.value)">
                                <select onchange="customCardMakerUpdateParam(${idx}, 'coordMode', this.value)">
                                    <option value="relative" ${b.params.coordMode === 'relative' ? 'selected' : ''}>相対座標</option>
                                    <option value="absolute" ${b.params.coordMode === 'absolute' ? 'selected' : ''}>絶対座標</option>
                                </select>
                                <span>色:</span>
                                <input type="text" list="color-suggestions" style="width:76px;" value="${b.params.color || '#ff3333'}" onchange="customCardMakerUpdateParam(${idx}, 'color', this.value)">
                                <span>速度:</span>
                                <input type="text" list="val-suggestions" style="width:50px;" value="${b.params.speed}" onchange="customCardMakerUpdateParam(${idx}, 'speed', this.value)">
                                <span>角度:</span>
                                <input type="text" list="val-suggestions" style="width:50px;" value="${b.params.angle}" onchange="customCardMakerUpdateParam(${idx}, 'angle', this.value)">
                                <span>X:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.offsetX || '0'}" onchange="customCardMakerUpdateParam(${idx}, 'offsetX', this.value)">
                                <span>Y:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.offsetY || '0'}" onchange="customCardMakerUpdateParam(${idx}, 'offsetY', this.value)">
                                ${renderBlockControls(idx)}
                            `;
                            break;
                        case 'spawn_ring':
                            blockDiv.className = 'maker-block color-action';
                            html = `
                                <span>[発射] 全方位円形弾 - 見た目:</span>
                                <select onchange="customCardMakerUpdateParam(${idx}, 'bulletType', this.value)">
                                    <option value="normal" ${b.params.bulletType === 'normal' ? 'selected' : ''}>通常弾</option>
                                    <option value="laser" ${b.params.bulletType === 'laser' ? 'selected' : ''}>レーザー</option>
                                </select>
                                <span>画像:</span>
                                <select onchange="customCardMakerUpdateParam(${idx}, 'bulletImage', this.value)">
                                    <option value="none" ${b.params.bulletImage === 'none' ? 'selected' : ''}>丸（ドロー）</option>
                                    <option value="light" ${b.params.bulletImage === 'light' ? 'selected' : ''}>光弾</option>
                                    <option value="sword" ${b.params.bulletImage === 'sword' ? 'selected' : ''}>剣弾</option>
                                    <option value="marutama" ${b.params.bulletImage === 'marutama' ? 'selected' : ''}>丸弾</option>
                                    <option value="kome" ${b.params.bulletImage === 'kome' ? 'selected' : ''}>米弾</option>
                                    <option value="ootama" ${b.params.bulletImage === 'ootama' ? 'selected' : ''}>大玉</option>
                                    <option value="ohuda" ${b.params.bulletImage === 'ohuda' ? 'selected' : ''}>お札</option>
                                    <option value="star" ${b.params.bulletImage === 'star' ? 'selected' : ''}>星</option>
                                    <option value="knife" ${b.params.bulletImage === 'knife' ? 'selected' : ''}>ナイフ</option>
                                    <option value="uroko" ${b.params.bulletImage === 'uroko' ? 'selected' : ''}>鱗弾</option>
                                    <option value="poihuru" ${b.params.bulletImage === 'poihuru' ? 'selected' : ''}>ポイフル</option>
                                    <option value="virus" ${b.params.bulletImage === 'virus' ? 'selected' : ''}>ウイルス</option>
                                    <option value="onmyoutama" ${b.params.bulletImage === 'onmyoutama' || b.params.bulletImage === 'onmyoudama' ? 'selected' : ''}>陰陽弾</option>
                                    <option value="b_marutama" ${b.params.bulletImage === 'b_marutama' ? 'selected' : ''}>巨大丸弾</option>
                                    <option value="b_ohuda" ${b.params.bulletImage === 'b_ohuda' ? 'selected' : ''}>巨大お札</option>
                                    <option value="b_star" ${b.params.bulletImage === 'b_star' ? 'selected' : ''}>巨大星弾</option>
                                    <option value="b_knife" ${b.params.bulletImage === 'b_knife' ? 'selected' : ''}>巨大ナイフ</option>
                                    <option value="b_poihuru" ${b.params.bulletImage === 'b_poihuru' ? 'selected' : ''}>巨大ポイフル</option>
                                    <option value="b_uroko" ${b.params.bulletImage === 'b_uroko' ? 'selected' : ''}>巨大鱗弾</option>
                                    <option value="dangan" ${b.params.bulletImage === 'dangan' ? 'selected' : ''}>弾丸</option>
                                    <option value="kunai1" ${b.params.bulletImage === 'kunai1' ? 'selected' : ''}>クナイ1</option>
                                    <option value="kunai2" ${b.params.bulletImage === 'kunai2' ? 'selected' : ''}>クナイ2</option>
                                    <option value="tyoudan" ${b.params.bulletImage === 'tyoudan' ? 'selected' : ''}>蝶弾</option>
                                </select>
                                <span>半径:</span>
                                <input type="text" list="val-suggestions" style="width:30px;" value="${b.params.radius || '6'}" onchange="customCardMakerUpdateParam(${idx}, 'radius', this.value)">
                                <span>判定:</span>
                                <input type="text" placeholder="自動" list="val-suggestions" style="width:30px;" value="${b.params.hitRadius || ''}" onchange="customCardMakerUpdateParam(${idx}, 'hitRadius', this.value)">
                                <select onchange="customCardMakerUpdateParam(${idx}, 'coordMode', this.value)">
                                    <option value="relative" ${b.params.coordMode === 'relative' ? 'selected' : ''}>相対座標</option>
                                    <option value="absolute" ${b.params.coordMode === 'absolute' ? 'selected' : ''}>絶対座標</option>
                                </select>
                                <span>色:</span>
                                <input type="text" list="color-suggestions" style="width:76px;" value="${b.params.color || '#ff3333'}" onchange="customCardMakerUpdateParam(${idx}, 'color', this.value)">
                                <span>速度:</span>
                                <input type="text" list="val-suggestions" style="width:50px;" value="${b.params.speed}" onchange="customCardMakerUpdateParam(${idx}, 'speed', this.value)">
                                <span>角度:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.angle || '0'}" onchange="customCardMakerUpdateParam(${idx}, 'angle', this.value)">
                                <span>弾数:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.count}" onchange="customCardMakerUpdateParam(${idx}, 'count', this.value)">
                                <span>X:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.offsetX || '0'}" onchange="customCardMakerUpdateParam(${idx}, 'offsetX', this.value)">
                                <span>Y:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.offsetY || '0'}" onchange="customCardMakerUpdateParam(${idx}, 'offsetY', this.value)">
                                ${renderBlockControls(idx)}
                            `;
                            break;
                        case 'spawn_ring_resist':
                            blockDiv.className = 'maker-block color-action';
                            blockDiv.style.border = '1.5px dashed #ffb833';
                            html = `
                                <span style="color:#ffcc66; font-weight:bold;">[発射] 全方位円形弾(耐性) - 見た目:</span>
                                <select onchange="customCardMakerUpdateParam(${idx}, 'bulletType', this.value)">
                                    <option value="normal" ${b.params.bulletType === 'normal' ? 'selected' : ''}>通常弾</option>
                                    <option value="laser" ${b.params.bulletType === 'laser' ? 'selected' : ''}>レーザー</option>
                                </select>
                                <span>画像:</span>
                                <select onchange="customCardMakerUpdateParam(${idx}, 'bulletImage', this.value)">
                                    <option value="none" ${b.params.bulletImage === 'none' ? 'selected' : ''}>丸（ドロー）</option>
                                    <option value="light" ${b.params.bulletImage === 'light' ? 'selected' : ''}>光弾</option>
                                    <option value="sword" ${b.params.bulletImage === 'sword' ? 'selected' : ''}>剣弾</option>
                                    <option value="marutama" ${b.params.bulletImage === 'marutama' ? 'selected' : ''}>丸弾</option>
                                    <option value="kome" ${b.params.bulletImage === 'kome' ? 'selected' : ''}>米弾</option>
                                    <option value="ootama" ${b.params.bulletImage === 'ootama' ? 'selected' : ''}>大玉</option>
                                    <option value="ohuda" ${b.params.bulletImage === 'ohuda' ? 'selected' : ''}>お札</option>
                                    <option value="star" ${b.params.bulletImage === 'star' ? 'selected' : ''}>星</option>
                                    <option value="knife" ${b.params.bulletImage === 'knife' ? 'selected' : ''}>ナイフ</option>
                                    <option value="uroko" ${b.params.bulletImage === 'uroko' ? 'selected' : ''}>鱗弾</option>
                                    <option value="poihuru" ${b.params.bulletImage === 'poihuru' ? 'selected' : ''}>ポイフル</option>
                                    <option value="virus" ${b.params.bulletImage === 'virus' ? 'selected' : ''}>ウイルス</option>
                                    <option value="onmyoutama" ${b.params.bulletImage === 'onmyoutama' || b.params.bulletImage === 'onmyoudama' ? 'selected' : ''}>陰陽弾</option>
                                    <option value="b_marutama" ${b.params.bulletImage === 'b_marutama' ? 'selected' : ''}>巨大丸弾</option>
                                    <option value="b_ohuda" ${b.params.bulletImage === 'b_ohuda' ? 'selected' : ''}>巨大お札</option>
                                    <option value="b_star" ${b.params.bulletImage === 'b_star' ? 'selected' : ''}>巨大星弾</option>
                                    <option value="b_knife" ${b.params.bulletImage === 'b_knife' ? 'selected' : ''}>巨大ナイフ</option>
                                    <option value="b_poihuru" ${b.params.bulletImage === 'b_poihuru' ? 'selected' : ''}>巨大ポイフル</option>
                                    <option value="b_uroko" ${b.params.bulletImage === 'b_uroko' ? 'selected' : ''}>巨大鱗弾</option>
                                    <option value="dangan" ${b.params.bulletImage === 'dangan' ? 'selected' : ''}>弾丸</option>
                                    <option value="kunai1" ${b.params.bulletImage === 'kunai1' ? 'selected' : ''}>クナイ1</option>
                                    <option value="kunai2" ${b.params.bulletImage === 'kunai2' ? 'selected' : ''}>クナイ2</option>
                                    <option value="tyoudan" ${b.params.bulletImage === 'tyoudan' ? 'selected' : ''}>蝶弾</option>
                                </select>
                                <span>半径:</span>
                                <input type="text" list="val-suggestions" style="width:30px;" value="${b.params.radius || '6'}" onchange="customCardMakerUpdateParam(${idx}, 'radius', this.value)">
                                <span>判定:</span>
                                <input type="text" placeholder="自動" list="val-suggestions" style="width:30px;" value="${b.params.hitRadius || ''}" onchange="customCardMakerUpdateParam(${idx}, 'hitRadius', this.value)">
                                <select onchange="customCardMakerUpdateParam(${idx}, 'coordMode', this.value)">
                                    <option value="relative" ${b.params.coordMode === 'relative' ? 'selected' : ''}>相対座標</option>
                                    <option value="absolute" ${b.params.coordMode === 'absolute' ? 'selected' : ''}>絶対座標</option>
                                </select>
                                <span>色:</span>
                                <input type="text" list="color-suggestions" style="width:76px;" value="${b.params.color || '#ff3333'}" onchange="customCardMakerUpdateParam(${idx}, 'color', this.value)">
                                <span>速度:</span>
                                <input type="text" list="val-suggestions" style="width:50px;" value="${b.params.speed}" onchange="customCardMakerUpdateParam(${idx}, 'speed', this.value)">
                                <span>角度:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.angle || '0'}" onchange="customCardMakerUpdateParam(${idx}, 'angle', this.value)">
                                <span>弾数:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.count}" onchange="customCardMakerUpdateParam(${idx}, 'count', this.value)">
                                <span>X:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.offsetX || '0'}" onchange="customCardMakerUpdateParam(${idx}, 'offsetX', this.value)">
                                <span>Y:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.offsetY || '0'}" onchange="customCardMakerUpdateParam(${idx}, 'offsetY', this.value)">
                                ${renderBlockControls(idx)}
                            `;
                            break;
                        case 'spawn_way':
                            blockDiv.className = 'maker-block color-action';
                            html = `
                                <span>[発射] Way弾 - 見た目:</span>
                                <select onchange="customCardMakerUpdateParam(${idx}, 'bulletType', this.value)">
                                    <option value="normal" ${b.params.bulletType === 'normal' ? 'selected' : ''}>通常弾</option>
                                    <option value="laser" ${b.params.bulletType === 'laser' ? 'selected' : ''}>レーザー</option>
                                </select>
                                <span>画像:</span>
                                <select onchange="customCardMakerUpdateParam(${idx}, 'bulletImage', this.value)">
                                    <option value="none" ${b.params.bulletImage === 'none' ? 'selected' : ''}>丸（ドロー）</option>
                                    <option value="light" ${b.params.bulletImage === 'light' ? 'selected' : ''}>光弾</option>
                                    <option value="sword" ${b.params.bulletImage === 'sword' ? 'selected' : ''}>剣弾</option>
                                    <option value="marutama" ${b.params.bulletImage === 'marutama' ? 'selected' : ''}>丸弾</option>
                                    <option value="kome" ${b.params.bulletImage === 'kome' ? 'selected' : ''}>米弾</option>
                                    <option value="ootama" ${b.params.bulletImage === 'ootama' ? 'selected' : ''}>大玉</option>
                                    <option value="ohuda" ${b.params.bulletImage === 'ohuda' ? 'selected' : ''}>お札</option>
                                    <option value="star" ${b.params.bulletImage === 'star' ? 'selected' : ''}>星</option>
                                    <option value="knife" ${b.params.bulletImage === 'knife' ? 'selected' : ''}>ナイフ</option>
                                    <option value="uroko" ${b.params.bulletImage === 'uroko' ? 'selected' : ''}>鱗弾</option>
                                    <option value="poihuru" ${b.params.bulletImage === 'poihuru' ? 'selected' : ''}>ポイフル</option>
                                    <option value="virus" ${b.params.bulletImage === 'virus' ? 'selected' : ''}>ウイルス</option>
                                    <option value="onmyoutama" ${b.params.bulletImage === 'onmyoutama' || b.params.bulletImage === 'onmyoudama' ? 'selected' : ''}>陰陽弾</option>
                                    <option value="b_marutama" ${b.params.bulletImage === 'b_marutama' ? 'selected' : ''}>巨大丸弾</option>
                                    <option value="b_ohuda" ${b.params.bulletImage === 'b_ohuda' ? 'selected' : ''}>巨大お札</option>
                                    <option value="b_star" ${b.params.bulletImage === 'b_star' ? 'selected' : ''}>巨大星弾</option>
                                    <option value="b_knife" ${b.params.bulletImage === 'b_knife' ? 'selected' : ''}>巨大ナイフ</option>
                                    <option value="b_poihuru" ${b.params.bulletImage === 'b_poihuru' ? 'selected' : ''}>巨大ポイフル</option>
                                    <option value="b_uroko" ${b.params.bulletImage === 'b_uroko' ? 'selected' : ''}>巨大鱗弾</option>
                                    <option value="dangan" ${b.params.bulletImage === 'dangan' ? 'selected' : ''}>弾丸</option>
                                    <option value="kunai1" ${b.params.bulletImage === 'kunai1' ? 'selected' : ''}>クナイ1</option>
                                    <option value="kunai2" ${b.params.bulletImage === 'kunai2' ? 'selected' : ''}>クナイ2</option>
                                    <option value="tyoudan" ${b.params.bulletImage === 'tyoudan' ? 'selected' : ''}>蝶弾</option>
                                </select>
                                <span>半径:</span>
                                <input type="text" list="val-suggestions" style="width:30px;" value="${b.params.radius || '6'}" onchange="customCardMakerUpdateParam(${idx}, 'radius', this.value)">
                                <span>判定:</span>
                                <input type="text" placeholder="自動" list="val-suggestions" style="width:30px;" value="${b.params.hitRadius || ''}" onchange="customCardMakerUpdateParam(${idx}, 'hitRadius', this.value)">
                                <select onchange="customCardMakerUpdateParam(${idx}, 'coordMode', this.value)">
                                    <option value="relative" ${b.params.coordMode === 'relative' ? 'selected' : ''}>相対座標</option>
                                    <option value="absolute" ${b.params.coordMode === 'absolute' ? 'selected' : ''}>絶対座標</option>
                                </select>
                                <span>色:</span>
                                <input type="text" list="color-suggestions" style="width:76px;" value="${b.params.color || '#ff3333'}" onchange="customCardMakerUpdateParam(${idx}, 'color', this.value)">
                                <span>速度:</span>
                                <input type="text" list="val-suggestions" style="width:50px;" value="${b.params.speed}" onchange="customCardMakerUpdateParam(${idx}, 'speed', this.value)">
                                <span>中心角:</span>
                                <input type="text" list="val-suggestions" style="width:50px;" value="${b.params.angle}" onchange="customCardMakerUpdateParam(${idx}, 'angle', this.value)">
                                <span>弾数:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.count}" onchange="customCardMakerUpdateParam(${idx}, 'count', this.value)">
                                <span>分散角:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.spread}" onchange="customCardMakerUpdateParam(${idx}, 'spread', this.value)">
                                <span>X:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.offsetX || '0'}" onchange="customCardMakerUpdateParam(${idx}, 'offsetX', this.value)">
                                <span>Y:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.offsetY || '0'}" onchange="customCardMakerUpdateParam(${idx}, 'offsetY', this.value)">
                                ${renderBlockControls(idx)}
                            `;
                            break;
                        case 'spawn_way_resist':
                            blockDiv.className = 'maker-block color-action';
                            blockDiv.style.border = '1.5px dashed #ffb833';
                            html = `
                                <span style="color:#ffcc66; font-weight:bold;">[発射] Way弾(耐性) - 見た目:</span>
                                <select onchange="customCardMakerUpdateParam(${idx}, 'bulletType', this.value)">
                                    <option value="normal" ${b.params.bulletType === 'normal' ? 'selected' : ''}>通常弾</option>
                                    <option value="laser" ${b.params.bulletType === 'laser' ? 'selected' : ''}>レーザー</option>
                                </select>
                                <span>画像:</span>
                                <select onchange="customCardMakerUpdateParam(${idx}, 'bulletImage', this.value)">
                                    <option value="none" ${b.params.bulletImage === 'none' ? 'selected' : ''}>丸（ドロー）</option>
                                    <option value="light" ${b.params.bulletImage === 'light' ? 'selected' : ''}>光弾</option>
                                    <option value="sword" ${b.params.bulletImage === 'sword' ? 'selected' : ''}>剣弾</option>
                                    <option value="marutama" ${b.params.bulletImage === 'marutama' ? 'selected' : ''}>丸弾</option>
                                    <option value="kome" ${b.params.bulletImage === 'kome' ? 'selected' : ''}>米弾</option>
                                    <option value="ootama" ${b.params.bulletImage === 'ootama' ? 'selected' : ''}>大玉</option>
                                    <option value="ohuda" ${b.params.bulletImage === 'ohuda' ? 'selected' : ''}>お札</option>
                                    <option value="star" ${b.params.bulletImage === 'star' ? 'selected' : ''}>星</option>
                                    <option value="knife" ${b.params.bulletImage === 'knife' ? 'selected' : ''}>ナイフ</option>
                                    <option value="uroko" ${b.params.bulletImage === 'uroko' ? 'selected' : ''}>鱗弾</option>
                                    <option value="poihuru" ${b.params.bulletImage === 'poihuru' ? 'selected' : ''}>ポイフル</option>
                                    <option value="virus" ${b.params.bulletImage === 'virus' ? 'selected' : ''}>ウイルス</option>
                                    <option value="onmyoutama" ${b.params.bulletImage === 'onmyoutama' || b.params.bulletImage === 'onmyoudama' ? 'selected' : ''}>陰陽弾</option>
                                    <option value="b_marutama" ${b.params.bulletImage === 'b_marutama' ? 'selected' : ''}>巨大丸弾</option>
                                    <option value="b_ohuda" ${b.params.bulletImage === 'b_ohuda' ? 'selected' : ''}>巨大お札</option>
                                    <option value="b_star" ${b.params.bulletImage === 'b_star' ? 'selected' : ''}>巨大星弾</option>
                                    <option value="b_knife" ${b.params.bulletImage === 'b_knife' ? 'selected' : ''}>巨大ナイフ</option>
                                    <option value="b_poihuru" ${b.params.bulletImage === 'b_poihuru' ? 'selected' : ''}>巨大ポイフル</option>
                                    <option value="b_uroko" ${b.params.bulletImage === 'b_uroko' ? 'selected' : ''}>巨大鱗弾</option>
                                    <option value="dangan" ${b.params.bulletImage === 'dangan' ? 'selected' : ''}>弾丸</option>
                                    <option value="kunai1" ${b.params.bulletImage === 'kunai1' ? 'selected' : ''}>クナイ1</option>
                                    <option value="kunai2" ${b.params.bulletImage === 'kunai2' ? 'selected' : ''}>クナイ2</option>
                                    <option value="tyoudan" ${b.params.bulletImage === 'tyoudan' ? 'selected' : ''}>蝶弾</option>
                                </select>
                                <span>半径:</span>
                                <input type="text" list="val-suggestions" style="width:30px;" value="${b.params.radius || '6'}" onchange="customCardMakerUpdateParam(${idx}, 'radius', this.value)">
                                <span>判定:</span>
                                <input type="text" placeholder="自動" list="val-suggestions" style="width:30px;" value="${b.params.hitRadius || ''}" onchange="customCardMakerUpdateParam(${idx}, 'hitRadius', this.value)">
                                <select onchange="customCardMakerUpdateParam(${idx}, 'coordMode', this.value)">
                                    <option value="relative" ${b.params.coordMode === 'relative' ? 'selected' : ''}>相対座標</option>
                                    <option value="absolute" ${b.params.coordMode === 'absolute' ? 'selected' : ''}>絶対座標</option>
                                </select>
                                <span>色:</span>
                                <input type="text" list="color-suggestions" style="width:76px;" value="${b.params.color || '#ff3333'}" onchange="customCardMakerUpdateParam(${idx}, 'color', this.value)">
                                <span>速度:</span>
                                <input type="text" list="val-suggestions" style="width:50px;" value="${b.params.speed}" onchange="customCardMakerUpdateParam(${idx}, 'speed', this.value)">
                                <span>中心角:</span>
                                <input type="text" list="val-suggestions" style="width:50px;" value="${b.params.angle}" onchange="customCardMakerUpdateParam(${idx}, 'angle', this.value)">
                                <span>弾数:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.count}" onchange="customCardMakerUpdateParam(${idx}, 'count', this.value)">
                                <span>分散角:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.spread}" onchange="customCardMakerUpdateParam(${idx}, 'spread', this.value)">
                                <span>X:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.offsetX || '0'}" onchange="customCardMakerUpdateParam(${idx}, 'offsetX', this.value)">
                                <span>Y:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.offsetY || '0'}" onchange="customCardMakerUpdateParam(${idx}, 'offsetY', this.value)">
                                ${renderBlockControls(idx)}
                            `;
                            break;
                        case 'spawn_trail':
                        case 'spawn_trail_resist': {
                            let isRes = b.type === 'spawn_trail_resist';
                            blockDiv.className = 'maker-block color-action';
                            if (isRes) blockDiv.style.border = '1.5px dashed #ffb833';
                            html = `
                                <span style="${isRes ? 'color:#ffcc66; font-weight:bold;' : ''}">[発射] 軌跡弾${isRes ? '(耐性)' : ''} - 色:</span>
                                <input type="text" list="color-suggestions" style="width:76px;" value="${b.params.color || '#00ffff'}" onchange="customCardMakerUpdateParam(${idx}, 'color', this.value)">
                                <span>速度:</span>
                                <input type="text" list="val-suggestions" style="width:50px;" value="${b.params.speed || '200'}" onchange="customCardMakerUpdateParam(${idx}, 'speed', this.value)">
                                <span>角度:</span>
                                <input type="text" list="val-suggestions" style="width:50px;" value="${b.params.angle || 'angle'}" onchange="customCardMakerUpdateParam(${idx}, 'angle', this.value)">
                                <span>半径:</span>
                                <input type="text" list="val-suggestions" style="width:30px;" value="${b.params.radius || '8'}" onchange="customCardMakerUpdateParam(${idx}, 'radius', this.value)">
                                <span>発生:</span>
                                <input type="text" list="val-suggestions" style="width:35px;" value="${b.params.growTime || '0.2'}" onchange="customCardMakerUpdateParam(${idx}, 'growTime', this.value)">
                                <span>持続:</span>
                                <input type="text" list="val-suggestions" style="width:35px;" value="${b.params.keepTime || '0.3'}" onchange="customCardMakerUpdateParam(${idx}, 'keepTime', this.value)">
                                <span>縮小:</span>
                                <input type="text" list="val-suggestions" style="width:35px;" value="${b.params.shrinkTime || '0.5'}" onchange="customCardMakerUpdateParam(${idx}, 'shrinkTime', this.value)">
                                <span>丸み:</span>
                                <select onchange="customCardMakerUpdateParam(${idx}, 'round', this.value)">
                                    <option value="true" ${b.params.round !== 'false' && b.params.round !== false ? 'selected' : ''}>あり</option>
                                    <option value="false" ${b.params.round === 'false' || b.params.round === false ? 'selected' : ''}>なし</option>
                                </select>
                                <span>X:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.offsetX || '0'}" onchange="customCardMakerUpdateParam(${idx}, 'offsetX', this.value)">
                                <span>Y:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.offsetY || '0'}" onchange="customCardMakerUpdateParam(${idx}, 'offsetY', this.value)">
                                <select onchange="customCardMakerUpdateParam(${idx}, 'coordMode', this.value)">
                                    <option value="relative" ${b.params.coordMode === 'relative' ? 'selected' : ''}>相対座標</option>
                                    <option value="absolute" ${b.params.coordMode === 'absolute' ? 'selected' : ''}>絶対座標</option>
                                </select>
                                <span>判定:</span>
                                <input type="text" placeholder="自動" list="val-suggestions" style="width:30px;" value="${b.params.hitRadius || ''}" onchange="customCardMakerUpdateParam(${idx}, 'hitRadius', this.value)">
                                ${renderBlockControls(idx)}
                            `;
                            break;
                        }
                        case 'spawn_laser_way':
                        case 'spawn_laser_way_resist': {
                            let isRes = b.type === 'spawn_laser_way_resist';
                            blockDiv.className = 'maker-block color-action';
                            if (isRes) blockDiv.style.border = '1.5px dashed #ffb833';
                            html = `
                                <span style="${isRes ? 'color:#ffcc66; font-weight:bold;' : ''}">[発射] 軌跡弾Way${isRes ? '(耐性)' : ''} - 色:</span>
                                <input type="text" list="color-suggestions" style="width:76px;" value="${b.params.color || '#ff3333'}" onchange="customCardMakerUpdateParam(${idx}, 'color', this.value)">
                                <span>速度:</span>
                                <input type="text" list="val-suggestions" style="width:50px;" value="${b.params.speed || '200'}" onchange="customCardMakerUpdateParam(${idx}, 'speed', this.value)">
                                <span>中心角:</span>
                                <input type="text" list="val-suggestions" style="width:50px;" value="${b.params.angle || 'angle'}" onchange="customCardMakerUpdateParam(${idx}, 'angle', this.value)">
                                <span>弾数:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.count || '3'}" onchange="customCardMakerUpdateParam(${idx}, 'count', this.value)">
                                <span>分散角:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.spread || '45'}" onchange="customCardMakerUpdateParam(${idx}, 'spread', this.value)">
                                <span>半径:</span>
                                <input type="text" list="val-suggestions" style="width:30px;" value="${b.params.radius || '6'}" onchange="customCardMakerUpdateParam(${idx}, 'radius', this.value)">
                                <span>発生:</span>
                                <input type="text" list="val-suggestions" style="width:35px;" value="${b.params.growTime || '0.2'}" onchange="customCardMakerUpdateParam(${idx}, 'growTime', this.value)">
                                <span>持続:</span>
                                <input type="text" list="val-suggestions" style="width:35px;" value="${b.params.keepTime || '0.3'}" onchange="customCardMakerUpdateParam(${idx}, 'keepTime', this.value)">
                                <span>縮小:</span>
                                <input type="text" list="val-suggestions" style="width:35px;" value="${b.params.shrinkTime || '0.5'}" onchange="customCardMakerUpdateParam(${idx}, 'shrinkTime', this.value)">
                                <span>丸み:</span>
                                <select onchange="customCardMakerUpdateParam(${idx}, 'round', this.value)">
                                    <option value="true" ${b.params.round !== 'false' && b.params.round !== false ? 'selected' : ''}>あり</option>
                                    <option value="false" ${b.params.round === 'false' || b.params.round === false ? 'selected' : ''}>なし</option>
                                </select>
                                <span>X:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.offsetX || '0'}" onchange="customCardMakerUpdateParam(${idx}, 'offsetX', this.value)">
                                <span>Y:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.offsetY || '0'}" onchange="customCardMakerUpdateParam(${idx}, 'offsetY', this.value)">
                                <select onchange="customCardMakerUpdateParam(${idx}, 'coordMode', this.value)">
                                    <option value="relative" ${b.params.coordMode === 'relative' ? 'selected' : ''}>相対座標</option>
                                    <option value="absolute" ${b.params.coordMode === 'absolute' ? 'selected' : ''}>絶対座標</option>
                                </select>
                                <span>判定:</span>
                                <input type="text" placeholder="自動" list="val-suggestions" style="width:30px;" value="${b.params.hitRadius || ''}" onchange="customCardMakerUpdateParam(${idx}, 'hitRadius', this.value)">
                                ${renderBlockControls(idx)}
                            `;
                            break;
                        }
                        case 'spawn_laser_ring':
                        case 'spawn_laser_ring_resist': {
                            let isRes = b.type === 'spawn_laser_ring_resist';
                            blockDiv.className = 'maker-block color-action';
                            if (isRes) blockDiv.style.border = '1.5px dashed #ffb833';
                            html = `
                                <span style="${isRes ? 'color:#ffcc66; font-weight:bold;' : ''}">[発射] 軌跡弾Ring${isRes ? '(耐性)' : ''} - 色:</span>
                                <input type="text" list="color-suggestions" style="width:76px;" value="${b.params.color || '#ff3333'}" onchange="customCardMakerUpdateParam(${idx}, 'color', this.value)">
                                <span>速度:</span>
                                <input type="text" list="val-suggestions" style="width:50px;" value="${b.params.speed || '200'}" onchange="customCardMakerUpdateParam(${idx}, 'speed', this.value)">
                                <span>角度:</span>
                                <input type="text" list="val-suggestions" style="width:50px;" value="${b.params.angle || '0'}" onchange="customCardMakerUpdateParam(${idx}, 'angle', this.value)">
                                <span>弾数:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.count || '12'}" onchange="customCardMakerUpdateParam(${idx}, 'count', this.value)">
                                <span>半径:</span>
                                <input type="text" list="val-suggestions" style="width:30px;" value="${b.params.radius || '6'}" onchange="customCardMakerUpdateParam(${idx}, 'radius', this.value)">
                                <span>発生:</span>
                                <input type="text" list="val-suggestions" style="width:35px;" value="${b.params.growTime || '0.2'}" onchange="customCardMakerUpdateParam(${idx}, 'growTime', this.value)">
                                <span>持続:</span>
                                <input type="text" list="val-suggestions" style="width:35px;" value="${b.params.keepTime || '0.3'}" onchange="customCardMakerUpdateParam(${idx}, 'keepTime', this.value)">
                                <span>縮小:</span>
                                <input type="text" list="val-suggestions" style="width:35px;" value="${b.params.shrinkTime || '0.5'}" onchange="customCardMakerUpdateParam(${idx}, 'shrinkTime', this.value)">
                                <span>丸み:</span>
                                <select onchange="customCardMakerUpdateParam(${idx}, 'round', this.value)">
                                    <option value="true" ${b.params.round !== 'false' && b.params.round !== false ? 'selected' : ''}>あり</option>
                                    <option value="false" ${b.params.round === 'false' || b.params.round === false ? 'selected' : ''}>なし</option>
                                </select>
                                <span>X:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.offsetX || '0'}" onchange="customCardMakerUpdateParam(${idx}, 'offsetX', this.value)">
                                <span>Y:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.offsetY || '0'}" onchange="customCardMakerUpdateParam(${idx}, 'offsetY', this.value)">
                                <select onchange="customCardMakerUpdateParam(${idx}, 'coordMode', this.value)">
                                    <option value="relative" ${b.params.coordMode === 'relative' ? 'selected' : ''}>相対座標</option>
                                    <option value="absolute" ${b.params.coordMode === 'absolute' ? 'selected' : ''}>絶対座標</option>
                                </select>
                                <span>判定:</span>
                                <input type="text" placeholder="自動" list="val-suggestions" style="width:30px;" value="${b.params.hitRadius || ''}" onchange="customCardMakerUpdateParam(${idx}, 'hitRadius', this.value)">
                                ${renderBlockControls(idx)}
                            `;
                            break;
                        }
                        case 'spawn_beam':
                        case 'spawn_beam_resist': {
                            let isRes = b.type === 'spawn_beam_resist';
                            blockDiv.className = 'maker-block color-action';
                            if (isRes) blockDiv.style.border = '1.5px dashed #ffb833';
                            html = `
                                <span style="${isRes ? 'color:#ffcc66; font-weight:bold;' : ''}">[発射] 設置レーザー${isRes ? '(耐性)' : ''} - 予告:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.warningTime || '1.0'}" onchange="customCardMakerUpdateParam(${idx}, 'warningTime', this.value)">
                                <span>秒, 照射:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.activeTime || '1.5'}" onchange="customCardMakerUpdateParam(${idx}, 'activeTime', this.value)">
                                <span>秒, 太さ:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.laserWidth || '12'}" onchange="customCardMakerUpdateParam(${idx}, 'laserWidth', this.value)">
                                <span>角度:</span>
                                <input type="text" list="val-suggestions" style="width:50px;" value="${b.params.angle || 'angle'}" onchange="customCardMakerUpdateParam(${idx}, 'angle', this.value)">
                                <span>X:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.offsetX || '0'}" onchange="customCardMakerUpdateParam(${idx}, 'offsetX', this.value)">
                                <span>Y:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.offsetY || '0'}" onchange="customCardMakerUpdateParam(${idx}, 'offsetY', this.value)">
                                <select onchange="customCardMakerUpdateParam(${idx}, 'coordMode', this.value)">
                                    <option value="relative" ${b.params.coordMode === 'relative' ? 'selected' : ''}>相対座標</option>
                                    <option value="absolute" ${b.params.coordMode === 'absolute' ? 'selected' : ''}>絶対座標</option>
                                </select>
                                <span>判定:</span>
                                <input type="text" placeholder="自動" list="val-suggestions" style="width:30px;" value="${b.params.hitRadius || ''}" onchange="customCardMakerUpdateParam(${idx}, 'hitRadius', this.value)">
                                ${renderBlockControls(idx)}
                            `;
                            break;
                        }
                        case 'spawn_beam_way':
                        case 'spawn_beam_way_resist': {
                            let isRes = b.type === 'spawn_beam_way_resist';
                            blockDiv.className = 'maker-block color-action';
                            if (isRes) blockDiv.style.border = '1.5px dashed #ffb833';
                            html = `
                                <span style="${isRes ? 'color:#ffcc66; font-weight:bold;' : ''}">[発射] 設置レーザーWay${isRes ? '(耐性)' : ''} - 予告:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.warningTime || '1.0'}" onchange="customCardMakerUpdateParam(${idx}, 'warningTime', this.value)">
                                <span>秒, 照射:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.activeTime || '1.5'}" onchange="customCardMakerUpdateParam(${idx}, 'activeTime', this.value)">
                                <span>秒, 太さ:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.laserWidth || '12'}" onchange="customCardMakerUpdateParam(${idx}, 'laserWidth', this.value)">
                                <span>中心角:</span>
                                <input type="text" list="val-suggestions" style="width:50px;" value="${b.params.angle || 'angle'}" onchange="customCardMakerUpdateParam(${idx}, 'angle', this.value)">
                                <span>本数:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.count || '3'}" onchange="customCardMakerUpdateParam(${idx}, 'count', this.value)">
                                <span>分散角:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.spread || '45'}" onchange="customCardMakerUpdateParam(${idx}, 'spread', this.value)">
                                <span>X:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.offsetX || '0'}" onchange="customCardMakerUpdateParam(${idx}, 'offsetX', this.value)">
                                <span>Y:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.offsetY || '0'}" onchange="customCardMakerUpdateParam(${idx}, 'offsetY', this.value)">
                                <select onchange="customCardMakerUpdateParam(${idx}, 'coordMode', this.value)">
                                    <option value="relative" ${b.params.coordMode === 'relative' ? 'selected' : ''}>相対座標</option>
                                    <option value="absolute" ${b.params.coordMode === 'absolute' ? 'selected' : ''}>絶対座標</option>
                                </select>
                                <span>判定:</span>
                                <input type="text" placeholder="自動" list="val-suggestions" style="width:30px;" value="${b.params.hitRadius || ''}" onchange="customCardMakerUpdateParam(${idx}, 'hitRadius', this.value)">
                                ${renderBlockControls(idx)}
                            `;
                            break;
                        }
                        case 'spawn_beam_ring':
                        case 'spawn_beam_ring_resist': {
                            let isRes = b.type === 'spawn_beam_ring_resist';
                            blockDiv.className = 'maker-block color-action';
                            if (isRes) blockDiv.style.border = '1.5px dashed #ffb833';
                            html = `
                                <span style="${isRes ? 'color:#ffcc66; font-weight:bold;' : ''}">[発射] 設置レーザーRing${isRes ? '(耐性)' : ''} - 予告:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.warningTime || '1.0'}" onchange="customCardMakerUpdateParam(${idx}, 'warningTime', this.value)">
                                <span>秒, 照射:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.activeTime || '1.5'}" onchange="customCardMakerUpdateParam(${idx}, 'activeTime', this.value)">
                                <span>秒, 太さ:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.laserWidth || '12'}" onchange="customCardMakerUpdateParam(${idx}, 'laserWidth', this.value)">
                                <span>角度:</span>
                                <input type="text" list="val-suggestions" style="width:50px;" value="${b.params.angle || '0'}" onchange="customCardMakerUpdateParam(${idx}, 'angle', this.value)">
                                <span>本数:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.count || '12'}" onchange="customCardMakerUpdateParam(${idx}, 'count', this.value)">
                                <span>X:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.offsetX || '0'}" onchange="customCardMakerUpdateParam(${idx}, 'offsetX', this.value)">
                                <span>Y:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.offsetY || '0'}" onchange="customCardMakerUpdateParam(${idx}, 'offsetY', this.value)">
                                <select onchange="customCardMakerUpdateParam(${idx}, 'coordMode', this.value)">
                                    <option value="relative" ${b.params.coordMode === 'relative' ? 'selected' : ''}>相対座標</option>
                                    <option value="absolute" ${b.params.coordMode === 'absolute' ? 'selected' : ''}>絶対座標</option>
                                </select>
                                <span>判定:</span>
                                <input type="text" placeholder="自動" list="val-suggestions" style="width:30px;" value="${b.params.hitRadius || ''}" onchange="customCardMakerUpdateParam(${idx}, 'hitRadius', this.value)">
                                ${renderBlockControls(idx)}
                            `;
                            break;
                        }
                        case 'spawn_magic_circle':
                            blockDiv.className = 'maker-block color-action';
                            html = `
                                <span>[子弾] 魔法陣弾を発射する - 色:</span>
                                <input type="text" list="color-suggestions" style="width:76px;" value="${b.params.color || '#00ffff'}" onchange="customCardMakerUpdateParam(${idx}, 'color', this.value)">
                                <span>X:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.offsetX || '0'}" onchange="customCardMakerUpdateParam(${idx}, 'offsetX', this.value)">
                                <span>Y:</span>
                                <input type="text" list="val-suggestions" style="width:40px;" value="${b.params.offsetY || '0'}" onchange="customCardMakerUpdateParam(${idx}, 'offsetY', this.value)">
                                ${renderBlockControls(idx)}
                            `;
                            break;
                        case 'speed_scale':
                            blockDiv.className = 'maker-block color-motion';
                            html = `
                                <span>[speed] ${b.params.mode === 'fast' ? 'fast' : 'slow'} e:</span>
                                <input type="text" list="val-suggestions" style="width:50px;" value="${b.params.effect || '1'}" onchange="customCardMakerUpdateParam(${idx}, 'effect', this.value)">
                                <span>f:</span>
                                <input type="text" list="val-suggestions" style="width:50px;" value="${b.params.delay || '0'}" onchange="customCardMakerUpdateParam(${idx}, 'delay', this.value)">
                                ${renderBlockControls(idx)}
                            `;
                            break;
                        case 'homing':
                            blockDiv.className = 'maker-block color-motion';
                            html = `
                                <span>[動作] 相手を追尾する - 回転速度:</span>
                                <input type="text" list="val-suggestions" style="width:50px;" value="${b.params.turnSpeed}" onchange="customCardMakerUpdateParam(${idx}, 'turnSpeed', this.value)">
                                <span>度/秒</span>
                                ${renderBlockControls(idx)}
                            `;
                            break;
                        case 'set_laser':
                            blockDiv.className = 'maker-block color-vars';
                            html = `
                                <span>[設定] 設置レーザー - 予告:</span>
                                <input type="text" list="val-suggestions" style="width:45px;" value="${b.params.warningTime || '1.0'}" onchange="customCardMakerUpdateParam(${idx}, 'warningTime', this.value)">
                                <span>秒, 照射:</span>
                                <input type="text" list="val-suggestions" style="width:45px;" value="${b.params.activeTime || '1.5'}" onchange="customCardMakerUpdateParam(${idx}, 'activeTime', this.value)">
                                <span>秒, 太さ:</span>
                                <input type="text" list="val-suggestions" style="width:45px;" value="${b.params.laserWidth || '12'}" onchange="customCardMakerUpdateParam(${idx}, 'laserWidth', this.value)">
                                ${renderBlockControls(idx)}
                            `;
                            break;
                        case 'tween_var':
                        case 'tween_var_wait': {
                            let mode = b.params.mode || 'seconds';
                            let isWait = b.type === 'tween_var_wait';
                            let easing = b.params.easing || 'linear';
                            blockDiv.className = 'maker-block color-vars';
                            html = `
                                <span>[変数] ${isWait ? 'スムーズ移行して待つ' : 'スムーズ移行'}</span>
                                <input type="text" list="var-suggestions" style="width:75px;" value="${b.params.name || 'angle'}" onchange="customCardMakerUpdateParam(${idx}, 'name', this.value)">
                                <span>を</span>
                                <input type="text" list="val-suggestions" style="width:55px;" value="${b.params.from || '0'}" onchange="customCardMakerUpdateParam(${idx}, 'from', this.value)">
                                <span>から</span>
                                <input type="text" list="val-suggestions" style="width:55px;" value="${b.params.to || '360'}" onchange="customCardMakerUpdateParam(${idx}, 'to', this.value)">
                                <span>へ</span>
                                <select onchange="customCardMakerUpdateParam(${idx}, 'mode', this.value)">
                                    <option value="seconds" ${mode === 'seconds' ? 'selected' : ''}>秒で</option>
                                    <option value="frames"  ${mode === 'frames'  ? 'selected' : ''}>フレームで</option>
                                    <option value="step"    ${mode === 'step'    ? 'selected' : ''}>ずつ（毎フレーム）</option>
                                    <option value="vecstep" ${mode === 'vecstep' ? 'selected' : ''}>等速（ベクトル）で</option>
                                </select>
                                ${(mode !== 'step' && mode !== 'vecstep') ? `
                                    <input type="text" list="val-suggestions" style="width:50px;" value="${b.params.duration || '1'}" onchange="customCardMakerUpdateParam(${idx}, 'duration', this.value)">
                                    <select onchange="customCardMakerUpdateParam(${idx}, 'easing', this.value)">
                                        <option value="linear" ${easing === 'linear' ? 'selected' : ''}>等速</option>
                                        <option value="easeIn" ${easing === 'easeIn' ? 'selected' : ''}>加速</option>
                                        <option value="easeOut" ${easing === 'easeOut' ? 'selected' : ''}>減速</option>
                                        <option value="easeInOut" ${easing === 'easeInOut' ? 'selected' : ''}>加減速</option>
                                    </select>
                                ` : `
                                    <input type="text" list="val-suggestions" style="width:50px;" value="${b.params.stepVal || '5'}" onchange="customCardMakerUpdateParam(${idx}, 'stepVal', this.value)">
                                `}
                                ${renderBlockControls(idx)}
                            `;
                            break;
                        }
                        case 'tween_angle':
                        case 'tween_angle_wait': {
                            let mode = b.params.mode || 'seconds';
                            let isWait = b.type === 'tween_angle_wait';
                            let easing = b.params.easing || 'linear';
                            blockDiv.className = 'maker-block color-motion';
                            html = `
                                <span>[動作] 角度を${isWait ? 'スムーズに変えて待つ' : 'スムーズに変える'}</span>
                                <input type="text" list="val-suggestions" style="width:55px;" value="${b.params.from || '0'}" onchange="customCardMakerUpdateParam(${idx}, 'from', this.value)">
                                <span>から</span>
                                <input type="text" list="val-suggestions" style="width:55px;" value="${b.params.to || '360'}" onchange="customCardMakerUpdateParam(${idx}, 'to', this.value)">
                                <span>へ</span>
                                <select onchange="customCardMakerUpdateParam(${idx}, 'mode', this.value)">
                                    <option value="seconds" ${mode === 'seconds' ? 'selected' : ''}>秒で</option>
                                    <option value="frames"  ${mode === 'frames'  ? 'selected' : ''}>フレームで</option>
                                </select>
                                <input type="text" list="val-suggestions" style="width:50px;" value="${b.params.duration || '1'}" onchange="customCardMakerUpdateParam(${idx}, 'duration', this.value)">
                                <select onchange="customCardMakerUpdateParam(${idx}, 'easing', this.value)">
                                    <option value="linear" ${easing === 'linear' ? 'selected' : ''}>等速</option>
                                    <option value="easeIn" ${easing === 'easeIn' ? 'selected' : ''}>加速</option>
                                    <option value="easeOut" ${easing === 'easeOut' ? 'selected' : ''}>減速</option>
                                    <option value="easeInOut" ${easing === 'easeInOut' ? 'selected' : ''}>加減速</option>
                                </select>
                                ${renderBlockControls(idx)}
                            `;
                            break;
                        }
                        case 'bounce':
                            blockDiv.className = 'maker-block color-motion';
                            html = `
                                <span>[動作] 壁で跳ね返る (isBouncedを設定)</span>
                                ${renderBlockControls(idx)}
                            `;
                            break;
                        case 'advance':
                            blockDiv.className = 'maker-block color-motion';
                            html = `
                                <span>[動作] 進行方向に </span>
                                <input type="text" list="val-suggestions" style="width:50px;" value="${b.params.distance || '50'}" onchange="customCardMakerUpdateParam(${idx}, 'distance', this.value)">
                                <span> px進める</span>
                                ${renderBlockControls(idx)}
                            `;
                            break;
                    }
                    
                    blockDiv.innerHTML = html;
                    container.appendChild(blockDiv);
                });
            }
            
            scheduleCustomCardCostCalculation();
        }

        function customCardMakerDeleteCard(cardId) {
            if (confirm('この自作カードを削除しますか？')) {
                customCards = customCards.filter(c => c.id !== cardId);
                try {
                    localStorage.setItem('touhou_kyoukaisen_custom_cards', JSON.stringify(customCards));
                } catch(e) {}
                integrateCustomCards();
                renderCardMakerList();
            }
        }

        function startCustomCardTest() {
            // コードエリアが非表示でない場合は、テキストコードからブロックを強制同期パースする
            // (リロード直後に変数モードとUIの表示がズレて、初回のテストプレイだけデフォルト赤弾が出る不具合を解消)
            const codeTextarea = document.getElementById('workspace-code-textarea');
            const compiledTextarea = document.getElementById('workspace-compiled-textarea');
            let isCompiled = false;
            
            if (compiledTextarea && compiledTextarea.value.trim().length > 0) {
                isCompiled = true;
                // コンパイル済みのコードがある場合、ASTパースを無視し、直接evalしてメモリに乗せる
                try {
                    eval(compiledTextarea.value);
                } catch (e) {
                    console.error("Failed to eval compiled code for test:", e);
                }
                
            } else {
                if (codeTextarea && !codeTextarea.classList.contains('hidden')) {
                    let code = codeTextarea.value;
                    let parsed = codeToBlocks(code);
                    if (customCardMaker.activeTab === 'emitter') {
                        customCardMaker.emitterScript = parsed;
                    } else if (customCardMaker.activeTab === 'bullet') {
                        customCardMaker.bulletScript = parsed;
                    } else if (customCardMaker.activeTab === 'magicCircle') {
                        customCardMaker.magicCircleScript = parsed;
                    }
                }
            }

            // コスト制限チェックを無効化
            let cardDuration = getCustomCardDuration(document.getElementById('custom-card-duration') ? document.getElementById('custom-card-duration').value : customCardMaker.duration);
            customCardMaker.duration = cardDuration;
            
            let xOffsetInput = document.getElementById('custom-card-x-offset') ? Number(document.getElementById('custom-card-x-offset').value) || 0 : 0;
            let yOffsetInput = document.getElementById('custom-card-y-offset') ? Number(document.getElementById('custom-card-y-offset').value) || 0 : 0;

            let currentDiffVal = document.getElementById('custom-card-difficulty') ? document.getElementById('custom-card-difficulty').value : 'NORMAL';
            let formattedDiff = typeof normalizeDifficulty === 'function' ? normalizeDifficulty(currentDiffVal) : currentDiffVal.toUpperCase();

            let rawName = document.getElementById('custom-card-name').value.trim() || 'テスト弾幕';
            let testName = (isCompiled ? '' : '【未コンパイル】') + rawName;

            let hpInput = document.getElementById('custom-card-hp') ? parseInt(document.getElementById('custom-card-hp').value, 10) || 0 : 0;

            let tempCustomCard = {
                id: 'custom_test',
                name: testName,
                duration: cardDuration,
                hp: hpInput,
                x_offset: xOffsetInput,
                y_offset: yOffsetInput,
                despawnTime: document.getElementById('custom-card-despawn-time') ? parseFloat(document.getElementById('custom-card-despawn-time').value) || 1.5 : 1.5,
                maxMisses: (() => {
                    if (!document.getElementById('custom-card-max-misses')) return 2;
                    let val = document.getElementById('custom-card-max-misses').value.trim().toLowerCase();
                    if (val === 'inf' || val === 'infinity') return Infinity;
                    let parsed = parseInt(val, 10);
                    return isNaN(parsed) ? 2 : parsed;
                })(),
                difficulty: formattedDiff,
                pattern: 'custom_test',
                interval: 0.1,
                rawCost: 0,
                cost: 0,
                desc: 'テスト中',
                isCustom: true,
                emitterScript: JSON.parse(JSON.stringify(customCardMaker.emitterScript)),
                bulletScript: JSON.parse(JSON.stringify(customCardMaker.bulletScript)),
                magicCircleScript: JSON.parse(JSON.stringify(customCardMaker.magicCircleScript || []))
            };
            
            window.cpuDifficulty = formattedDiff;
            window.currentDifficulty = formattedDiff;
            
            let testCardIdx = defaultCards.active.findIndex(c => c.id === 'custom_test');
            if (testCardIdx !== -1) {
                defaultCards.active[testCardIdx] = tempCustomCard;
            } else {
                defaultCards.active.push(tempCustomCard);
            }
            
            isCustomCardTesting = true;
            window.isBossMode = hpInput > 0;
            if (typeof checkBulletTouchRequirement === 'function') {
                checkBulletTouchRequirement();
            }
            currentTestPlaySource = 'maker';
            window.currentCardSecond = 0;
            window.currentCardFrame = 0;
            window.spellMissCount = 0;
            window.spellBombCount = 0;
            window.spellMaxBonus = 10000000;
            window.spellCurrentBonus = window.spellMaxBonus;
            window.spellBonusFailed = false;
            window.spellClearResult = null;
            window.spellTransitionTimer = 0;
            window.lastTimeoutSecond = 11;
            window.spellDeclarationTimer = 2.8;
            if (window.isBossMode && window.playSound) window.playSound('se_cat00');
            player.respawnTimer = 0;
            window.playerMissCount = 0;
            window.playerMaxMisses = tempCustomCard.maxMisses;
            window.playerInvincibleTimer = 0;
            window.miniExplosionEffect = null;
            window.miniExplosionShockwave = null;
            
            setCardMakerScreenActive(false);
            document.getElementById('titleScreen').style.display = 'none';
            isGameRunning = true;

            // モバイルボムボタンの表示切り替え（ボス戦モード時のみ表示）
            const bombBtn = document.getElementById('mobile-bomb-button');
            if (bombBtn) {
                if (window.isBossMode && window.mobileBombSetting !== 'double_tap') {
                    bombBtn.classList.remove('hidden');
                } else {
                    bombBtn.classList.add('hidden');
                }
            }
            
            // テストプレイ開始時に全キー入力をリセット（スタックキー防止）
            for (let k in keyboardState) keyboardState[k] = false;
            
            bullets.length = 0;
            magicCircles.length = 0;
            activeReigekis.length = 0;
            reigekiCutinTimer = 0;
            prevBombInput = false;
            activeEffects.length = 0;
            
            player.x = PLAY_WIDTH / 2;
            player.y = canvas.height * 0.8;
            player.targetX = player.x;
            player.targetY = player.y;
            player.prevX = player.x;
            player.prevY = player.y;
            player.isInvincible = false;
            player.invincibleTimer = 0;
            player.hp = 1000;
            player.maxHp = 1000;
            player.pendingDamage = 0;
            player.pendingHeal = 0;
            player.grazeCount = 0;
            player.bombs = window.isBossMode ? 2 : 0;
            player.maxBombs = window.isBossMode ? 2 : 0;
            player.passives = [];
            player.recentHits = [];
            
            cpu.x = PLAY_WIDTH / 2;
            cpu.y = canvas.height * 0.2;
            cpu.targetX = cpu.x;
            cpu.targetY = cpu.y;
            cpu.prevX = cpu.x;
            cpu.prevY = cpu.y;
            cpu.hp = hpInput > 0 ? hpInput : 1000;
            cpu.maxHp = hpInput > 0 ? hpInput : 1000;
            cpu.pendingDamage = 0;
            cpu.pendingHeal = 0;
            cpu.grazeCount = 0;
            cpu.bombs = 0;
            cpu.maxBombs = 0;
            cpu.passives = [];
            cpu.recentHits = [];
            
            gameState = 'BATTLE';
            battlePhase = 'ACTION';
            turnOwner = 'CPU';
            turnCount = 1;
            
            activeCards = [ tempCustomCard ];
            activeCards[0].emitterState = initEmitterState(tempCustomCard.emitterScript, cpu, player, tempCustomCard.x_offset || 0, tempCustomCard.y_offset || 0, tempCustomCard.id);
            activeCards[0].emitterState.bulletScript = tempCustomCard.bulletScript || [];
            activeCards[0].emitterState.magicCircleScript = tempCustomCard.magicCircleScript || [];
            actionTimer = tempCustomCard.duration;
            customCardTestEmitterDone = false;
            customCardDeathEffect = null;
            normalShotTimer = 0;
            
            lastTime = performance.now();
            timeAccumulator = 0;
            startGameLoop();
        }

        let currentTestPlaySource = 'maker';

        function endCustomCardTest(success) {
            if (typeof resumeGameFromPause === 'function') resumeGameFromPause();
            isCustomCardTesting = false;
            window.isBossMode = false;
            isGameRunning = false;
            gameState = 'TITLE';
            customCardDeathEffect = null;
            
            bullets.length = 0;
            magicCircles.length = 0;
            activeReigekis.length = 0;
            
            const bombBtn = document.getElementById('mobileBombBtn');
            if (bombBtn) bombBtn.style.display = 'none';
            const mBombBtn = document.getElementById('mobile-bomb-button');
            if (mBombBtn) mBombBtn.classList.add('hidden');
            const overlay = document.getElementById('battleOverlay');
            if (overlay) overlay.classList.add('hidden');
            
            document.getElementById('titleScreen').style.display = 'flex';
            
            if (success && typeof currentTestPlaySource !== 'undefined' && currentTestPlaySource === 'shared' && typeof currentSharedDanmakuName !== 'undefined' && currentSharedDanmakuName) {
                let missCount = typeof window.playerMissCount === 'number' ? window.playerMissCount : 0;
                let isNoMiss = missCount === 0;
                let maxMisses = window.playerMaxMisses;
                let isInfMisses = maxMisses === Infinity;
                saveClearedSharedDanmaku(currentSharedDanmakuName, isNoMiss, missCount, isInfMisses);
            }
            
            if (typeof currentTestPlaySource !== 'undefined' && currentTestPlaySource === 'boss' && typeof currentBoss !== 'undefined' && currentBoss && currentBoss.id) {
                if (typeof updateBossHighScore === 'function') {
                    updateBossHighScore(currentBoss.id, window.totalScore || 0);
                }
            }

            if (typeof currentTestPlaySource !== 'undefined' && currentTestPlaySource === 'shared') {
                showScreen('screen-shared-danmaku');
                renderSharedDanmakuList();
            } else if (typeof currentTestPlaySource !== 'undefined' && currentTestPlaySource === 'boss') {
                showBossListScreen();
            } else {
                showScreen('screen-card-maker');
                // プレイ結果による成否メッセージ表示を非表示にする
                customCardMaker.testPassed = true;
                renderCardMaker();
            }
        }

        function registerCustomCard() {
            if (customCardMakerMode === 'code') {
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

            // コスト制限チェックを無効化
            let cost = 0;
            // テストクリア状態の確認をバイパスします

            let nameInput = document.getElementById('custom-card-name').value.trim().replace(/^【A】/, '') || 'カスタムスペル';
            let descInput = document.getElementById('custom-card-desc').value.trim() || 'オリジナルの弾幕パターン。';
            let cardDuration = getCustomCardDuration(document.getElementById('custom-card-duration') ? document.getElementById('custom-card-duration').value : customCardMaker.duration);
            customCardMaker.duration = cardDuration;

            if (!descInput.startsWith('【自作カード】')) {
                descInput = '【自作カード】' + descInput;
            }

            let xOffsetInput = document.getElementById('custom-card-x-offset') ? Number(document.getElementById('custom-card-x-offset').value) || 0 : 0;
            let yOffsetInput = document.getElementById('custom-card-y-offset') ? Number(document.getElementById('custom-card-y-offset').value) || 0 : 0;

            let hpInput = document.getElementById('custom-card-hp') ? parseInt(document.getElementById('custom-card-hp').value, 10) || 0 : 0;
            let cardId = customCardMaker.editingId || ('custom_' + Date.now());
            let cardData = {
                id: cardId,
                name: nameInput,
                desc: descInput,
                duration: cardDuration,
                hp: hpInput,
                x_offset: xOffsetInput,
                y_offset: yOffsetInput,
                despawnTime: document.getElementById('custom-card-despawn-time') ? parseFloat(document.getElementById('custom-card-despawn-time').value) || 1.5 : 1.5,
                maxMisses: (() => {
                    if (!document.getElementById('custom-card-max-misses')) return 2;
                    let val = document.getElementById('custom-card-max-misses').value.trim().toLowerCase();
                    if (val === 'inf' || val === 'infinity') return Infinity;
                    let parsed = parseInt(val, 10);
                    return isNaN(parsed) ? 2 : parsed;
                })(),
                difficulty: typeof normalizeDifficulty === 'function' ? normalizeDifficulty(document.getElementById('custom-card-difficulty') ? document.getElementById('custom-card-difficulty').value : 'NORMAL') : (document.getElementById('custom-card-difficulty') ? document.getElementById('custom-card-difficulty').value.toUpperCase() : 'NORMAL'),
                rawCost: cost,
                cost: getCustomCardPlayCost(cost),
                isCustom: true,
                emitterScript: JSON.parse(JSON.stringify(customCardMaker.emitterScript)),
                bulletScript: JSON.parse(JSON.stringify(customCardMaker.bulletScript)),
                magicCircleScript: JSON.parse(JSON.stringify(customCardMaker.magicCircleScript || []))
            };

            if (customCardMaker.editingId) {
                let idx = customCards.findIndex(c => c.id === customCardMaker.editingId);
                if (idx !== -1) {
                    customCards[idx] = cardData;
                } else {
                    customCards.push(cardData);
                }
            } else {
                customCards.push(cardData);
            }
            try {
                const serializedCards = JSON.stringify(customCards);
                localStorage.setItem('touhou_kyoukaisen_custom_cards', serializedCards);
                const savedCards = localStorage.getItem('touhou_kyoukaisen_custom_cards');
                if (savedCards !== serializedCards) {
                    throw new Error('save verification failed');
                }
                localStorage.removeItem('custom_card_draft');
                const restoreBtn = document.getElementById('custom-card-draft-load-btn');
                if (restoreBtn) restoreBtn.style.display = 'none';
            } catch(e) {
                console.error("Failed to save custom cards:", e);
                alert('\u30ab\u30fc\u30c9\u4fdd\u5b58\u306b\u5931\u6557\u3057\u307e\u3057\u305f: ' + (e && e.message ? e.message : e));
                return;
            }

            integrateCustomCards();
            customCardMakerCloseEditor();
            alert('\u30ab\u30fc\u30c9\u3092\u4fdd\u5b58\u3057\u307e\u3057\u305f\u3002');
        }

        let customCardMakerMode = 'block';

        function toggleCustomCodeGuide(show) {
            const modal = document.getElementById('custom-code-guide-modal');
            if (!modal) return;
            modal.classList.toggle('hidden', !show);
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                toggleCustomCodeGuide(false);
            }
        });

        function customCardMakerCompileCurrent() {
            // 編集中のコードを反映
            const blocksContainer = document.getElementById('workspace-blocks-container');
            const codeTextarea = document.getElementById('workspace-code-textarea');
            const compiledTextarea = document.getElementById('workspace-compiled-textarea');

            if (!blocksContainer || !codeTextarea) {
                alert("コンパイル失敗: ワークスペース要素が見つかりません。");
                console.error("customCardMakerCompileCurrent: workspace elements not found");
                return;
            }

            let flatBlocks;
            if (!blocksContainer.classList.contains('hidden')) {
                flatBlocks = JSON.parse(JSON.stringify(getActiveScript()));
            } else {
                flatBlocks = codeToBlocks(codeTextarea.value);
            }
            
            // 現在のタブの最新コードを保存
            if (customCardMaker.activeTab === 'emitter') customCardMaker.emitterScript = flatBlocks;
            if (customCardMaker.activeTab === 'bullet') customCardMaker.bulletScript = flatBlocks;
            if (customCardMaker.activeTab === 'magicCircle') customCardMaker.magicCircleScript = flatBlocks;

            try {
                window.compiledDanmaku = window.compiledDanmaku || {};
                let finalJS = "";

                // Emitter
                let emBlocks = compileIndentedBlocks(JSON.parse(JSON.stringify(customCardMaker.emitterScript || [])));
                let emStr = window.DanmakuCompiler.compileSingle(emBlocks, false);
                finalJS += `// Emitter Script\nwindow.compiledDanmaku['custom_test'] = ${emStr};\n\n`;
                eval(`window.compiledDanmaku['custom_test'] = ${emStr};`);

                // Bullet
                let buBlocks = compileIndentedBlocks(JSON.parse(JSON.stringify(customCardMaker.bulletScript || [])));
                let buStr = window.DanmakuCompiler.compileSingle(buBlocks, true);
                finalJS += `// Bullet Script\nwindow.compiledDanmaku['custom_test_bullet'] = ${buStr};\n\n`;
                eval(`window.compiledDanmaku['custom_test_bullet'] = ${buStr};`);

                // Magic
                let maBlocks = compileIndentedBlocks(JSON.parse(JSON.stringify(customCardMaker.magicCircleScript || [])));
                let maStr = window.DanmakuCompiler.compileSingle(maBlocks, true);
                finalJS += `// Magic Circle Script\nwindow.compiledDanmaku['custom_test_magic'] = ${maStr};\n\n`;
                eval(`window.compiledDanmaku['custom_test_magic'] = ${maStr};`);
                
                if (compiledTextarea) {
                    compiledTextarea.value = finalJS;
                }
                
                customCardMakerSwitchMode('compiled');
                alert("コンパイル成功！全スクリプト（エミッター/弾/子弾）をメモリ上に展開しました。\nこのままテストプレイすると超高速で動作します。");
            } catch (e) {
                alert("コンパイルエラー: " + e.message);
                console.error(e);
            }
        }

function customCardMakerSwitchMode(mode) {
            if (customCardMakerMode === mode) return;
            
            const blocksContainer = document.getElementById('workspace-blocks-container');
            const codeTextarea = document.getElementById('workspace-code-textarea');
            const compiledTextarea = document.getElementById('workspace-compiled-textarea');
            const palette = document.querySelector('.palette-panel');
            const btnBlock = document.getElementById('mode-btn-block');
            const btnCode = document.getElementById('mode-btn-code');
            const btnCompiled = document.getElementById('mode-btn-compiled');

            const makerLayout = document.querySelector('.maker-layout');

            if (customCardMakerMode === 'code') {
                let code = codeTextarea ? codeTextarea.value : "";
                let parsedBlocks = codeToBlocks(code);
                
                if (customCardMaker.activeTab === 'emitter') {
                    customCardMaker.emitterScript = parsedBlocks;
                } else if (customCardMaker.activeTab === 'bullet') {
                    customCardMaker.bulletScript = parsedBlocks;
                }
            }
            
            // 一旦すべてのメインエリアを非表示にする
            if (blocksContainer) blocksContainer.classList.add('hidden');
            if (codeTextarea) {
                codeTextarea.classList.add('hidden');
                codeTextarea.style.flex = '';
                codeTextarea.style.minHeight = '';
                codeTextarea.style.height = '';
            }
            if (compiledTextarea) {
                compiledTextarea.classList.add('hidden');
                compiledTextarea.style.flex = '';
                compiledTextarea.style.minHeight = '';
                compiledTextarea.style.height = '';
            }
            if (palette) palette.classList.add('hidden');
            if (makerLayout) makerLayout.classList.remove('code-mode');

            if (mode === 'code') {
                let script = getActiveScript();
                let code = blocksToCode(script);
                if (codeTextarea) {
                    codeTextarea.value = code;
                    codeTextarea.classList.remove('hidden');
                    // コードモード時は全幅・全高でエディタを表示
                    codeTextarea.style.flex = '1';
                    codeTextarea.style.minHeight = '0';
                    codeTextarea.style.height = '100%';
                    // フォーカスを当ててすぐ編集できるようにする
                    setTimeout(() => codeTextarea.focus(), 50);
                }
                // レイアウトに code-mode クラスを付ける
                if (makerLayout) makerLayout.classList.add('code-mode');
            } else if (mode === 'compiled') {
                if (compiledTextarea) {
                    compiledTextarea.classList.remove('hidden');
                    compiledTextarea.style.flex = '1';
                    compiledTextarea.style.minHeight = '0';
                    compiledTextarea.style.height = '100%';
                }
                if (makerLayout) makerLayout.classList.add('code-mode');
            } else {
                if (blocksContainer) blocksContainer.classList.remove('hidden');
                // パレットパネルを再表示
                if (palette) {
                    palette.classList.remove('hidden');
                    palette.style.opacity = '1.0';
                    palette.style.pointerEvents = 'auto';
                }
                customCardMaker.testPassed = false;
                renderCardMaker();
            }
            
            customCardMakerMode = mode;
            if (btnBlock) btnBlock.className = mode === 'block' ? 'tab-btn active' : 'tab-btn';
            if (btnCode) btnCode.className = mode === 'code' ? 'tab-btn active' : 'tab-btn';
            if (btnCompiled) btnCompiled.className = mode === 'compiled' ? 'tab-btn active' : 'tab-btn';
        }

        function customCardMakerOnCodeInput() {
            let textarea = document.getElementById('workspace-code-textarea');
            let code = textarea ? textarea.value : "";
            let parsedBlocks = codeToBlocks(code);
            
            if (customCardMaker.activeTab === 'emitter') {
                customCardMaker.emitterScript = parsedBlocks;
            } else if (customCardMaker.activeTab === 'bullet') {
                customCardMaker.bulletScript = parsedBlocks;
            }
            
            customCardMaker.testPassed = false;
            scheduleCustomCardCostCalculation();
            saveCustomCardDraft(false, true);
        }

        function customCardMakerOnDurationInput() {
            const input = document.getElementById('custom-card-duration');
            customCardMaker.duration = getCustomCardDuration(input ? input.value : customCardMaker.duration);
            customCardMaker.testPassed = false;
            scheduleCustomCardCostCalculation();
            saveCustomCardDraft(false, false, true);
        }

        function formatCodeColorArg(color) {
            let s = String(color || '#ff3333').trim();
            if (!s) return '"#ff3333"';
            if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) return s;
            if (/^[A-Za-z_$][\w$]*$/.test(s)) return s;
            return JSON.stringify(s);
        }

        function blocksToCode(blocks) {
            if (!blocks || blocks.length === 0) return "";
            let lines = [];
            let activeIndent = 0;
            
            blocks.forEach(b => {
                let indent = b.indent || 0;
                while (activeIndent > indent) {
                    activeIndent--;
                    let indentStr = "    ".repeat(activeIndent);
                    lines.push(indentStr + "}");
                }
                
                let indentStr = "    ".repeat(indent);
                let line = "";
                 switch (b.type) {
                     case 'unknown':
                         line = b.params.code;
                         break;
                     case 'wait':
                        line = `wait(${b.params.duration || '0.2'})`;
                        break;
                    case 'repeat':
                        {
                            let indexVar = b.params.indexVar || 'i';
                            line = `for (let ${indexVar} = 0; ${indexVar} < ${b.params.count || '10'}; ${indexVar}++)`;
                        }
                        break;
                    case 'forever':
                        line = `while (true)`;
                        break;
                    case 'while':
                        line = `while (${b.params.cond || 'true'})`;
                        break;
                    case 'aim_at_coord':
                        line = `aimAt(${b.params.targetX || '0'}, ${b.params.targetY || '0'})`;
                        break;
                    case 'const_var':
                        line = `const ${b.params.name || 'angle'} = ${b.params.value || '0'}`;
                        break;
                    case 'set_var':
                        line = `${b.params.name || 'angle'} = ${b.params.value || '0'}`;
                        break;
                    case 'change_var':
                        line = `${b.params.name || 'angle'} ${b.params.op === '-' ? '-=' : '+='} ${b.params.value || '10'}`;
                        break;
                    case 'aim_at_target':
                        line = `aimAtTarget()`;
                        break;
                    case 'move_owner': {
                        let preset = b.params.preset || 'center';
                        if (preset === 'enemyRightUp') preset = 'rightUp';
                        if (preset === 'enemyLeftUp') preset = 'leftUp';
                        let duration = b.params.duration || '0';
                        if (String(preset).includes(',')) {
                            line = (String(duration).trim() === '0')
                                ? `moveTo(${preset})`
                                : `slideTo(${preset}, ${duration})`;
                        } else {
                            line = (String(duration).trim() === '0')
                                ? `moveTo("${preset}")`
                                : `slideTo("${preset}", ${duration})`;
                        }
                        break;
                    }
                    case 'play_sound': {
                        let name = b.params.soundName || 'shot';
                        line = `playSound("${name}")`;
                        break;
                    }
                    case 'spawn_bullet': {
                        let bt = b.params.bulletType || 'normal';
                        let col = b.params.color || '#ff3333';
                        let spd = b.params.speed || '200';
                        let ang = b.params.angle || 'angle';
                        let ox = b.params.offsetX || '0';
                        let oy = b.params.offsetY || '0';
                        let rad = b.params.radius || '6';
                        let img = b.params.bulletImage || 'none';
                        let cm = b.params.coordMode || 'relative';
                        let hr = b.params.hitRadius || '';

                        line = `spawnBullet("${bt}", ${formatCodeColorArg(col)}, ${spd}, ${ang}, ${ox}, ${oy}, ${rad}, "${img}", "${cm}", ${formatCodeColorArg(hr)})`;
                        break;
                    }
                    case 'spawn_bullet_resist': {
                        let bt = b.params.bulletType || 'normal';
                        let col = b.params.color || '#ff3333';
                        let spd = b.params.speed || '200';
                        let ang = b.params.angle || 'angle';
                        let ox = b.params.offsetX || '0';
                        let oy = b.params.offsetY || '0';
                        let rad = b.params.radius || '6';
                        let img = b.params.bulletImage || 'none';
                        let cm = b.params.coordMode || 'relative';
                        let hr = b.params.hitRadius || '';

                        line = `spawnBulletResist("${bt}", ${formatCodeColorArg(col)}, ${spd}, ${ang}, ${ox}, ${oy}, ${rad}, "${img}", "${cm}", ${formatCodeColorArg(hr)})`;
                        break;
                    }
                    case 'spawn_ring': {
                        let btRing = b.params.bulletType || 'normal';
                        let colRing = b.params.color || '#ff3333';
                        let spdRing = b.params.speed || '200';
                        let angRing = b.params.angle || '0';
                        let cntRing = b.params.count || '12';
                        let oxRing = b.params.offsetX || '0';
                        let oyRing = b.params.offsetY || '0';
                        let radRing = b.params.radius || '6';
                        let imgRing = b.params.bulletImage || 'none';
                        let cmRing = b.params.coordMode || 'relative';
                        let hrRing = b.params.hitRadius || '';

                        line = `spawnRing("${btRing}", ${formatCodeColorArg(colRing)}, ${spdRing}, ${angRing}, ${cntRing}, ${oxRing}, ${oyRing}, ${radRing}, "${imgRing}", "${cmRing}", ${formatCodeColorArg(hrRing)})`;
                        break;
                    }
                    case 'spawn_ring_resist': {
                        let btRing = b.params.bulletType || 'normal';
                        let colRing = b.params.color || '#ff3333';
                        let spdRing = b.params.speed || '200';
                        let angRing = b.params.angle || '0';
                        let cntRing = b.params.count || '12';
                        let oxRing = b.params.offsetX || '0';
                        let oyRing = b.params.offsetY || '0';
                        let radRing = b.params.radius || '6';
                        let imgRing = b.params.bulletImage || 'none';
                        let cmRing = b.params.coordMode || 'relative';
                        let hrRing = b.params.hitRadius || '';

                        line = `spawnRingResist("${btRing}", ${formatCodeColorArg(colRing)}, ${spdRing}, ${angRing}, ${cntRing}, ${oxRing}, ${oyRing}, ${radRing}, "${imgRing}", "${cmRing}", ${formatCodeColorArg(hrRing)})`;
                        break;
                    }
                    case 'spawn_way': {
                        let btWay = b.params.bulletType || 'normal';
                        let colWay = b.params.color || '#ff3333';
                        let spdWay = b.params.speed || '200';
                        let angWay = b.params.angle || 'angle';
                        let cntWay = b.params.count || '3';
                        let sprWay = b.params.spread || '30';
                        let oxWay = b.params.offsetX || '0';
                        let oyWay = b.params.offsetY || '0';
                        let radWay = b.params.radius || '6';
                        let imgWay = b.params.bulletImage || 'none';
                        let cmWay = b.params.coordMode || 'relative';
                        let hrWay = b.params.hitRadius || '';

                        line = `spawnWay("${btWay}", ${formatCodeColorArg(colWay)}, ${spdWay}, ${angWay}, ${cntWay}, ${sprWay}, ${oxWay}, ${oyWay}, ${radWay}, "${imgWay}", "${cmWay}", ${formatCodeColorArg(hrWay)})`;
                        break;
                    }
                    case 'spawn_way_resist': {
                        let btWay = b.params.bulletType || 'normal';
                        let colWay = b.params.color || '#ff3333';
                        let spdWay = b.params.speed || '200';
                        let angWay = b.params.angle || 'angle';
                        let cntWay = b.params.count || '3';
                        let sprWay = b.params.spread || '30';
                        let oxWay = b.params.offsetX || '0';
                        let oyWay = b.params.offsetY || '0';
                        let radWay = b.params.radius || '6';
                        let imgWay = b.params.bulletImage || 'none';
                        let cmWay = b.params.coordMode || 'relative';
                        let hrWay = b.params.hitRadius || '';

                        line = `spawnWayResist("${btWay}", ${formatCodeColorArg(colWay)}, ${spdWay}, ${angWay}, ${cntWay}, ${sprWay}, ${oxWay}, ${oyWay}, ${radWay}, "${imgWay}", "${cmWay}", ${formatCodeColorArg(hrWay)})`;
                        break;
                    }
                    case 'spawn_trail':
                    case 'spawn_trail_resist': {
                        let fnName = b.type === 'spawn_trail_resist' ? 'spawnTrailResist' : 'spawnTrail';
                        let col = b.params.color || '#00ffff';
                        let spd = b.params.speed || '200';
                        let ang = b.params.angle || 'angle';
                        let ox = b.params.offsetX || '0';
                        let oy = b.params.offsetY || '0';
                        let rad = b.params.radius || '8';
                        let gt = (b.params.growTime !== undefined && b.params.growTime !== '') ? b.params.growTime : '0.2';
                        let kt = (b.params.keepTime !== undefined && b.params.keepTime !== '') ? b.params.keepTime : '0.3';
                        let st = (b.params.shrinkTime !== undefined && b.params.shrinkTime !== '') ? b.params.shrinkTime : '0.5';
                        let rnd = (b.params.round !== undefined && b.params.round !== '') ? String(b.params.round) : 'true';
                        let cm = b.params.coordMode || 'relative';
                        let hr = b.params.hitRadius || '';
                        line = `${fnName}(${formatCodeColorArg(col)}, ${spd}, ${ang}, ${ox}, ${oy}, ${rad}, ${gt}, ${kt}, ${st}, "${rnd}", "${cm}", ${formatCodeColorArg(hr)})`;
                        break;
                    }
                    case 'spawn_laser_way':
                    case 'spawn_laser_way_resist': {
                        let fnName = b.type === 'spawn_laser_way_resist' ? 'spawnLaserWayResist' : 'spawnLaserWay';
                        let col = b.params.color || '#ff3333';
                        let rad = b.params.radius || '6';
                        let spd = b.params.speed || '200';
                        let ang = b.params.angle || 'angle';
                        let cnt = b.params.count || '3';
                        let spr = b.params.spread || '45';
                        let ox = b.params.offsetX || '0';
                        let oy = b.params.offsetY || '0';
                        let gt = (b.params.growTime !== undefined && b.params.growTime !== '') ? b.params.growTime : '0.2';
                        let kt = (b.params.keepTime !== undefined && b.params.keepTime !== '') ? b.params.keepTime : '0.3';
                        let st = (b.params.shrinkTime !== undefined && b.params.shrinkTime !== '') ? b.params.shrinkTime : '0.5';
                        let rnd = (b.params.round !== undefined && b.params.round !== '') ? String(b.params.round) : 'true';
                        let cm = b.params.coordMode || 'relative';
                        let hr = b.params.hitRadius || '';
                        line = `${fnName}(${formatCodeColorArg(col)}, ${rad}, ${spd}, ${ang}, ${cnt}, ${spr}, ${ox}, ${oy}, ${gt}, ${kt}, ${st}, "${rnd}", "${cm}", ${formatCodeColorArg(hr)})`;
                        break;
                    }
                    case 'spawn_laser_ring':
                    case 'spawn_laser_ring_resist': {
                        let fnName = b.type === 'spawn_laser_ring_resist' ? 'spawnLaserRingResist' : 'spawnLaserRing';
                        let col = b.params.color || '#ff3333';
                        let rad = b.params.radius || '6';
                        let spd = b.params.speed || '200';
                        let ang = b.params.angle || '0';
                        let cnt = b.params.count || '12';
                        let ox = b.params.offsetX || '0';
                        let oy = b.params.offsetY || '0';
                        let gt = (b.params.growTime !== undefined && b.params.growTime !== '') ? b.params.growTime : '0.2';
                        let kt = (b.params.keepTime !== undefined && b.params.keepTime !== '') ? b.params.keepTime : '0.3';
                        let st = (b.params.shrinkTime !== undefined && b.params.shrinkTime !== '') ? b.params.shrinkTime : '0.5';
                        let rnd = (b.params.round !== undefined && b.params.round !== '') ? String(b.params.round) : 'true';
                        let cm = b.params.coordMode || 'relative';
                        let hr = b.params.hitRadius || '';
                        line = `${fnName}(${formatCodeColorArg(col)}, ${rad}, ${spd}, ${ang}, ${cnt}, ${ox}, ${oy}, ${gt}, ${kt}, ${st}, "${rnd}", "${cm}", ${formatCodeColorArg(hr)})`;
                        break;
                    }
                    case 'spawn_beam':
                    case 'spawn_beam_resist': {
                        let fnName = b.type === 'spawn_beam_resist' ? 'spawnBeamResist' : 'spawnBeam';
                        let wt = b.params.warningTime || '1.0';
                        let at = b.params.activeTime || '1.5';
                        let lw = b.params.laserWidth || '12';
                        let ang = b.params.angle || 'angle';
                        let ox = b.params.offsetX || '0';
                        let oy = b.params.offsetY || '0';
                        let cm = b.params.coordMode || 'relative';
                        let hr = b.params.hitRadius || '';
                        line = `${fnName}(${wt}, ${at}, ${lw}, ${ang}, ${ox}, ${oy}, "${cm}", ${formatCodeColorArg(hr)})`;
                        break;
                    }
                    case 'spawn_beam_way':
                    case 'spawn_beam_way_resist': {
                        let fnName = b.type === 'spawn_beam_way_resist' ? 'spawnBeamWayResist' : 'spawnBeamWay';
                        let wt = b.params.warningTime || '1.0';
                        let at = b.params.activeTime || '1.5';
                        let lw = b.params.laserWidth || '12';
                        let ang = b.params.angle || 'angle';
                        let cnt = b.params.count || '3';
                        let spr = b.params.spread || '45';
                        let ox = b.params.offsetX || '0';
                        let oy = b.params.offsetY || '0';
                        let cm = b.params.coordMode || 'relative';
                        let hr = b.params.hitRadius || '';
                        line = `${fnName}(${wt}, ${at}, ${lw}, ${ang}, ${cnt}, ${spr}, ${ox}, ${oy}, "${cm}", ${formatCodeColorArg(hr)})`;
                        break;
                    }
                    case 'spawn_beam_ring':
                    case 'spawn_beam_ring_resist': {
                        let fnName = b.type === 'spawn_beam_ring_resist' ? 'spawnBeamRingResist' : 'spawnBeamRing';
                        let wt = b.params.warningTime || '1.0';
                        let at = b.params.activeTime || '1.5';
                        let lw = b.params.laserWidth || '12';
                        let ang = b.params.angle || '0';
                        let cnt = b.params.count || '12';
                        let ox = b.params.offsetX || '0';
                        let oy = b.params.offsetY || '0';
                        let cm = b.params.coordMode || 'relative';
                        let hr = b.params.hitRadius || '';
                        line = `${fnName}(${wt}, ${at}, ${lw}, ${ang}, ${cnt}, ${ox}, ${oy}, "${cm}", ${formatCodeColorArg(hr)})`;
                        break;
                    }
                    case 'spawn_magic_circle': {
                        let col = b.params.color || '#00ffff';
                        let ox = b.params.offsetX || '0';
                        let oy = b.params.offsetY || '0';
                        line = `spawnMagicCircle(${formatCodeColorArg(col)}, ${ox}, ${oy})`;
                        break;
                    }
                    case 'speed_scale':
                        line = `${b.params.mode === 'fast' ? 'fast' : 'slow'}(${b.params.effect || '1'}, ${b.params.delay || '0'})`;
                        break;
                    case 'homing':
                        line = `homing(${b.params.turnSpeed || '90'})`;
                        break;
                    case 'tween_var':
                    case 'tween_var_wait': {
                        let mode = b.params.mode || 'seconds';
                        let isWait = b.type === 'tween_var_wait';
                        let fnName = isWait ? 'tweenWait' : 'tween';
                        let nameStr = JSON.stringify(b.params.name || 'angle');
                        let fromVal = b.params.from || '0';
                        let toVal = b.params.to || '360';
                        let easingStr = b.params.easing && b.params.easing !== 'linear' ? `, "${b.params.easing}"` : '';
                        if (mode === 'step' || mode === 'vecstep') {
                            line = `${fnName}(${nameStr}, ${fromVal}, ${toVal}, "${mode}", ${b.params.stepVal || '5'})`;
                        } else {
                            line = `${fnName}(${nameStr}, ${fromVal}, ${toVal}, "${mode}", ${b.params.duration || '1'}${easingStr})`;
                        }
                        break;
                    }
                    case 'tween_angle':
                    case 'tween_angle_wait': {
                        let isWait = b.type === 'tween_angle_wait';
                        let fnName = isWait ? 'tweenAngleWait' : 'tweenAngle';
                        let easingStr = b.params.easing && b.params.easing !== 'linear' ? `, '${b.params.easing}'` : '';
                        line = `${fnName}(${b.params.from}, ${b.params.to}, "${b.params.mode}", ${b.params.duration}${easingStr})`;
                        break;
                    }
                    case 'bounce':
                        line = `bounce()`;
                        break;
                    case 'advance':
                        line = `advance(${b.params.distance || '50'})`;
                        break;
                    case 'set_laser':
                        line = `warningTime = ${b.params.warningTime || '1.0'}\n${indentStr}activeTime = ${b.params.activeTime || '1.5'}\n${indentStr}laserWidth = ${b.params.laserWidth || '12'}`;
                        break;
                    case 'if':
                        if (b.params.aifTol !== undefined) {
                            line = `aif[${b.params.aifTol}](${b.params.aifCond})`;
                        } else {
                            line = `if (${b.params.cond || 'x < 10'})`;
                        }
                        break;
                    case 'once':
                        line = `once`;
                        break;
                }
                
                if (line) {
                    let isContainer = ['repeat', 'forever', 'while', 'if', 'once'].includes(b.type);
                    if (isContainer) {
                        lines.push(indentStr + line + " {");
                        activeIndent = indent + 1;
                    } else {
                        lines.push(indentStr + line);
                    }
                }
            });
            
            while (activeIndent > 0) {
                activeIndent--;
                let indentStr = "    ".repeat(activeIndent);
                lines.push(indentStr + "}");
            }
            
            return lines.join("\n");
        }

        function stripComments(line) {
            if (!line) return '';
            let inQuote = null;
            let result = '';
            for (let i = 0; i < line.length; i++) {
                let ch = line[i];
                let prev = line[i - 1];
                if (inQuote) {
                    result += ch;
                    if (ch === inQuote && prev !== '\\') inQuote = null;
                } else if (ch === '"' || ch === "'") {
                    inQuote = ch;
                    result += ch;
                } else if (ch === '/' && line[i + 1] === '/') {
                    break;
                } else {
                    result += ch;
                }
            }
            return result;
        }

        // 最外のカンマだけで引数を分割するヘルパー（括弧のネストやクォートを考慮）
        function splitArgs(str) {
            const args = [];
            let current = '';
            let depth = 0;
            let quote = null;
            for (let i = 0; i < str.length; i++) {
                const ch = str[i];
                if (quote) {
                    if (ch === quote && str[i-1] !== '\\') {
                        quote = null;
                    }
                    current += ch;
                } else if (ch === '"' || ch === "'" || ch === '`') {
                    quote = ch;
                    current += ch;
                } else if (ch === '(' || ch === '[' || ch === '{') {
                    depth++;
                    current += ch;
                } else if (ch === ')' || ch === ']' || ch === '}') {
                    depth--;
                    current += ch;
                } else if (ch === ',' && depth === 0) {
                    args.push(current.trim());
                    current = '';
                } else {
                    current += ch;
                }
            }
            args.push(current.trim());
            return args;
        }

        // 波括弧スタイルのコードをブロックリストに変換するヘルパー
        // repeat(20){ spawnRing(...); } のようなスタイルに対応
        function _codeToBlocksBrace(code) {
            // トークン列に変換：各行を行ごとに処理しつつ { } を独立トークンとして扱う
            // アルゴリズム：再帰的に { } を認識してネストを解析し、indentを付ける
            const blocks = [];
            // スタックで現在の親ブロックを管理
            const stack = [{ children: blocks, indent: -1 }];

            function parseLine(rawLine, currentIndent) {
                // 行を前処理
                let trimmed = rawLine.trim();
                trimmed = trimmed.replace(/;+$/, "").trim();
                // コメント・空行・単独の { } をスキップ
                if (!trimmed || trimmed === '{' || trimmed === '}' || trimmed.startsWith('//')) return;

                // インデントを計算（スタックの深さで決定）
                let indent = Math.max(0, Math.min(20, currentIndent));

                const makeBlock = (trimmed, indent) => {
                    let block = null;
                    let mPlaySound = trimmed.match(/^playSound\((.*?)\)$/i);
                    if (mPlaySound) {
                        let args = splitArgs(mPlaySound[1]).map(s => s.trim().replace(/^['"]|['"]$/g, ''));
                        block = {
                            type: 'play_sound',
                            params: {
                                soundName: args[0] || 'shot'
                            },
                            indent
                        };
                    }
                    let mWait = trimmed.match(/^wait\((.*?)\)$/i);
                    if (mWait) block = { type: 'wait', params: { duration: mWait[1].trim() }, indent };
                    let mRepeat = trimmed.match(/^repeat\((.*?)\)$/i);
                    if (mRepeat) block = { type: 'repeat', params: { count: mRepeat[1].trim() }, indent };
                    let mForever = trimmed.match(/^forever\(\)$/i);
                    if (mForever) block = { type: 'forever', params: {}, indent };
                    let mWhileTrue = trimmed.match(/^while\s*\(\s*true\s*\)$/i);
                    if (mWhileTrue) block = { type: 'forever', params: {}, indent };
                    let mWhile = trimmed.match(/^while\s*\((.*?)\)$/i);
                    if (mWhile && !mWhileTrue) block = { type: 'while', params: { cond: mWhile[1].trim() }, indent };
                    let mForRepeat = trimmed.match(/^for\s*\(\s*(?:let|var)?\s*(\w+)\s*=\s*0\s*;\s*\1\s*<\s*(.*?)\s*;\s*\1\+\+\s*\)$/i);
                    if (mForRepeat) block = { type: 'repeat', params: { count: mForRepeat[2].trim(), indexVar: mForRepeat[1].trim() }, indent };
                    let mIf = trimmed.match(/^if\s*\((.*?)\)$/i);
                    if (mIf) block = { type: 'if', params: { cond: mIf[1].trim() }, indent };
                    let mAIf = trimmed.match(/^aif\s*\[(.*?)\]\s*\((.*?)\)$/i);
                    if (mAIf) {
                        let tol = mAIf[1].trim();
                        let condRaw = mAIf[2].trim();
                        let condStr = condRaw;
                        condStr = condStr.replace(/([^&|?,:=()]+)\s*==\s*([^&|?,:=()]+)/g, `abs($1 - $2) <= ${tol}`);
                        condStr = condStr.replace(/([^&|?,:=()]+)\s*!=\s*([^&|?,:=()]+)/g, `abs($1 - $2) > ${tol}`);
                        block = { type: 'if', params: { cond: condStr, aifTol: tol, aifCond: condRaw }, indent };
                    }
                    let mAim = trimmed.match(/^aimAtTarget\(\)$/i);
                    if (mAim) block = { type: 'aim_at_target', params: {}, indent };
                    let mAimCoord = trimmed.match(/^aimAt\((.*?)\)$/i);
                    if (mAimCoord) {
                        let args = splitArgs(mAimCoord[1]).map(s => s.trim());
                        block = { type: 'aim_at_coord', params: { targetX: args[0] || '0', targetY: args[1] || '0' }, indent };
                    }
                    let mMoveOwner = trimmed.match(/^moveTo\((.*?)\)$/i);
                    if (mMoveOwner) {
                        let args = splitArgs(mMoveOwner[1]).map(s => s.trim().replace(/^['"]|['"]$/g, ''));
                        let preset = 'center';
                        if (args.length >= 2) {
                            preset = args[0] + ',' + args[1];
                        } else if (args.length === 1) {
                            preset = args[0];
                        }
                        block = { type: 'move_owner', params: { preset: preset || 'center', duration: '0' }, indent };
                    }
                    let mSlideOwner = trimmed.match(/^slideTo\((.*?)\)$/i);
                    if (mSlideOwner) {
                        let args = splitArgs(mSlideOwner[1]).map(s => s.trim().replace(/^['"]|['"]$/g, ''));
                        let preset = 'center';
                        let duration = '1.0';
                        if (args.length >= 3) {
                            preset = args[0] + ',' + args[1];
                            duration = args[2];
                        } else if (args.length === 2) {
                            if (!isNaN(parseFloat(args[0])) && !isNaN(parseFloat(args[1]))) {
                                preset = args[0] + ',' + args[1];
                                duration = '1.0';
                            } else {
                                preset = args[0];
                                duration = args[1];
                            }
                        } else if (args.length === 1) {
                            preset = args[0];
                        }
                        block = { type: 'move_owner', params: { preset, duration }, indent };
                    }
                    let mBounce = trimmed.match(/^bounce\(\)$/i);
                    if (mBounce) block = { type: 'bounce', params: {}, indent };
                    let mAdvance = trimmed.match(/^advance\((.*?)\)$/i);
                    if (mAdvance) block = { type: 'advance', params: { distance: mAdvance[1].trim() }, indent };
                    let mOnce = trimmed.match(/^once(\(\))?$/i);
                    if (mOnce) block = { type: 'once', params: {}, indent };
                    let mHoming = trimmed.match(/^homing\((.*?)\)$/i);
                    if (mHoming) block = { type: 'homing', params: { turnSpeed: mHoming[1].trim() }, indent };
                    let mTween = trimmed.match(/^(tween|tweenWait)\((.*?)\)$/i);
                    if (mTween) {
                        let isWait = mTween[1].toLowerCase() === 'tweenwait';
                        let args = splitArgs(mTween[2]).map(s => s.trim().replace(/^['"]|['"]$/g, ''));
                        let varName = args[0] || 'angle';
                        let fromVal = args[1] || '0';
                        let toVal = args[2] || '360';
                        let mode = args[3] || 'seconds';
                        let modeVal = args[4] || '1';
                        let easing = args[5] || 'linear';
                        block = {
                            type: isWait ? 'tween_var_wait' : 'tween_var',
                            params: {
                                name: varName,
                                from: fromVal,
                                to: toVal,
                                mode: mode,
                                duration: (mode !== 'step' && mode !== 'vecstep') ? modeVal : '1',
                                stepVal: (mode === 'step' || mode === 'vecstep') ? modeVal : '5',
                                easing: easing
                            },
                            indent
                        };
                    }
                    let mTweenAngle = trimmed.match(/^tweenAngle(Wait)?\((.*?)\)$/i);
                    if (mTweenAngle) {
                        let isWait = !!mTweenAngle[1];
                        let args = splitArgs(mTweenAngle[2]).map(s => s.trim().replace(/^['"]|['"]$/g, ''));
                        block = {
                            type: isWait ? 'tween_angle_wait' : 'tween_angle',
                            params: {
                                from: args[0] || '0',
                                to: args[1] || '360',
                                mode: args[2] || 'seconds',
                                duration: args[3] || '1',
                                easing: args[4] || 'linear'
                            },
                            indent
                        };
                    }
                    let mSlow = trimmed.match(/^slow\((.*?)\)$/i);
                    if (mSlow) { let args = splitArgs(mSlow[1]).map(s => s.trim()); block = { type: 'speed_scale', params: { mode: 'slow', effect: args[0] || '0.5', delay: args[1] || '0' }, indent }; }
                    let mFast = trimmed.match(/^fast\((.*?)\)$/i);
                    if (mFast) { let args = splitArgs(mFast[1]).map(s => s.trim()); block = { type: 'speed_scale', params: { mode: 'fast', effect: args[0] || '2', delay: args[1] || '0' }, indent }; }
                    let mSpawn = trimmed.match(/^spawnBullet\((.*?)\)$/i);
                    if (mSpawn) {
                        let args = splitArgs(mSpawn[1]).map(s => s.trim().replace(/^['"]|['"]$/g, ''));
                        let isLegacy = false;
                        if (args.length === 5) {
                            let arg3IsNumber = !isNaN(parseFloat(args[3]));
                            let arg2IsRadius = args[2] === '6' || args[2] === '8' || args[2] === '12';
                            if (arg2IsRadius && arg3IsNumber) isLegacy = true;
                        }
                        block = {
                            type: 'spawn_bullet',
                            params: {
                                bulletType: args[0] || 'normal',
                                color: args[1] || '#ff3333',
                                speed: isLegacy ? (args[3] || '200') : (args[2] || '200'),
                                angle: isLegacy ? (args[4] || 'angle') : (args[3] || 'angle'),
                                offsetX: isLegacy ? '0' : (args[4] || '0'),
                                offsetY: isLegacy ? '0' : (args[5] || '0'),
                                radius: isLegacy ? args[2] : (args.length >= 7 ? args[6] : '6'),
                                bulletImage: args.length >= 8 ? args[7] : 'none',
                                coordMode: args.length >= 9 ? args[8] : 'relative',
                                hitRadius: (args.length >= 10 && args[9] !== '""') ? args[9] : ''
                            },
                            indent
                        };
                    }
                    let mSpawnResist = trimmed.match(/^spawnBulletResist\((.*?)\)$/i);
                    if (mSpawnResist) {
                        let args = splitArgs(mSpawnResist[1]).map(s => s.trim().replace(/^['"]|['"]$/g, ''));
                        let isLegacy = false;
                        if (args.length === 5) {
                            let arg3IsNumber = !isNaN(parseFloat(args[3]));
                            let arg2IsRadius = args[2] === '6' || args[2] === '8' || args[2] === '12';
                            if (arg2IsRadius && arg3IsNumber) isLegacy = true;
                        }
                        block = {
                            type: 'spawn_bullet_resist',
                            params: {
                                bulletType: args[0] || 'normal',
                                color: args[1] || '#ff3333',
                                speed: isLegacy ? (args[3] || '200') : (args[2] || '200'),
                                angle: isLegacy ? (args[4] || 'angle') : (args[3] || 'angle'),
                                offsetX: isLegacy ? '0' : (args[4] || '0'),
                                offsetY: isLegacy ? '0' : (args[5] || '0'),
                                radius: isLegacy ? args[2] : (args.length >= 7 ? args[6] : '6'),
                                bulletImage: args.length >= 8 ? args[7] : 'none',
                                coordMode: args.length >= 9 ? args[8] : 'relative',
                                hitRadius: (args.length >= 10 && args[9] !== '""') ? args[9] : ''
                            },
                            indent
                        };
                    }
                    let mSpawnRing = trimmed.match(/^spawnRing\((.*?)\)$/i);
                    if (mSpawnRing) {
                        let args = splitArgs(mSpawnRing[1]).map(s => s.trim().replace(/^['"]|['"]$/g, ''));
                        let isLegacy = args.length === 5 && (args[2] === '6' || args[2] === '8' || args[2] === '12');
                        block = {
                            type: 'spawn_ring',
                            params: {
                                bulletType: args[0] || 'normal',
                                color: args[1] || '#ff3333',
                                speed: isLegacy ? (args[3] || '200') : (args[2] || '200'),
                                angle: isLegacy ? '0' : (args[3] || '0'),
                                count: isLegacy ? (args[4] || '12') : (args[4] || '12'),
                                offsetX: isLegacy ? '0' : (args[5] || '0'),
                                offsetY: isLegacy ? '0' : (args[6] || '0'),
                                radius: isLegacy ? args[2] : (args.length >= 8 ? args[7] : '6'),
                                bulletImage: args.length >= 9 ? args[8] : 'none',
                                coordMode: args.length >= 10 ? args[9] : 'relative',
                                hitRadius: (args.length >= 11 && args[10] !== '""') ? args[10] : ''
                            },
                            indent
                        };
                    }
                    let mSpawnRingResist = trimmed.match(/^spawnRingResist\((.*?)\)$/i);
                    if (mSpawnRingResist) {
                        let args = splitArgs(mSpawnRingResist[1]).map(s => s.trim().replace(/^['"]|['"]$/g, ''));
                        let isLegacy = args.length === 5 && (args[2] === '6' || args[2] === '8' || args[2] === '12');
                        block = {
                            type: 'spawn_ring_resist',
                            params: {
                                bulletType: args[0] || 'normal',
                                color: args[1] || '#ff3333',
                                speed: isLegacy ? (args[3] || '200') : (args[2] || '200'),
                                angle: isLegacy ? '0' : (args[3] || '0'),
                                count: isLegacy ? (args[4] || '12') : (args[4] || '12'),
                                offsetX: isLegacy ? '0' : (args[5] || '0'),
                                offsetY: isLegacy ? '0' : (args[6] || '0'),
                                radius: isLegacy ? args[2] : (args.length >= 8 ? args[7] : '6'),
                                bulletImage: args.length >= 9 ? args[8] : 'none',
                                coordMode: args.length >= 10 ? args[9] : 'relative',
                                hitRadius: (args.length >= 11 && args[10] !== '""') ? args[10] : ''
                            },
                            indent
                        };
                    }
                    let mSpawnWay = trimmed.match(/^spawnWay\((.*?)\)$/i);
                    if (mSpawnWay) {
                        let args = splitArgs(mSpawnWay[1]).map(s => s.trim().replace(/^['"]|['"]$/g, ''));
                        let isLegacy = args.length === 7 && (args[2] === '6' || args[2] === '8' || args[2] === '12');
                        block = {
                            type: 'spawn_way',
                            params: {
                                bulletType: args[0] || 'normal',
                                color: args[1] || '#ff3333',
                                speed: isLegacy ? (args[3] || '200') : (args[2] || '200'),
                                angle: isLegacy ? (args[4] || 'angle') : (args[3] || 'angle'),
                                count: isLegacy ? (args[5] || '3') : (args[4] || '3'),
                                spread: isLegacy ? (args[6] || '30') : (args[5] || '30'),
                                offsetX: isLegacy ? '0' : (args[6] || '0'),
                                offsetY: isLegacy ? '0' : (args[7] || '0'),
                                radius: isLegacy ? args[2] : (args.length >= 9 ? args[8] : '6'),
                                bulletImage: args.length >= 10 ? args[9] : 'none',
                                coordMode: args.length >= 11 ? args[10] : 'relative',
                                hitRadius: (args.length >= 12 && args[11] !== '""') ? args[11] : ''
                            },
                            indent
                        };
                    }
                    let mSpawnWayResist = trimmed.match(/^spawnWayResist\((.*?)\)$/i);
                    if (mSpawnWayResist) {
                        let args = splitArgs(mSpawnWayResist[1]).map(s => s.trim().replace(/^['"]|['"]$/g, ''));
                        let isLegacy = args.length === 7 && (args[2] === '6' || args[2] === '8' || args[2] === '12');
                        block = {
                            type: 'spawn_way_resist',
                            params: {
                                bulletType: args[0] || 'normal',
                                color: args[1] || '#ff3333',
                                speed: isLegacy ? (args[3] || '200') : (args[2] || '200'),
                                angle: isLegacy ? (args[4] || 'angle') : (args[3] || 'angle'),
                                count: isLegacy ? (args[5] || '3') : (args[4] || '3'),
                                spread: isLegacy ? (args[6] || '30') : (args[5] || '30'),
                                offsetX: isLegacy ? '0' : (args[6] || '0'),
                                offsetY: isLegacy ? '0' : (args[7] || '0'),
                                radius: isLegacy ? args[2] : (args.length >= 9 ? args[8] : '6'),
                                bulletImage: args.length >= 10 ? args[9] : 'none',
                                coordMode: args.length >= 11 ? args[10] : 'relative',
                                hitRadius: (args.length >= 12 && args[11] !== '""') ? args[11] : ''
                            },
                            indent
                        };
                    }
                    let mSpawnMC = trimmed.match(/^spawnMagicCircle\((.*?)\)$/i);
                    if (mSpawnMC) {
                        let args = splitArgs(mSpawnMC[1]).map(s => s.trim().replace(/^['"]|['"]$/g, ''));
                        block = {
                            type: 'spawn_magic_circle',
                            params: {
                                color: args[0] || '#00ffff',
                                offsetX: args[1] || '0',
                                offsetY: args[2] || '0'
                            },
                            indent
                        };
                    }
                    let mSpawnTrail = trimmed.match(/^spawnTrail(Resist)?\((.*?)\)$/i);
                    if (mSpawnTrail) {
                        let isRes = !!mSpawnTrail[1];
                        let args = splitArgs(mSpawnTrail[2]).map(s => s.trim().replace(/^['"]|['"]$/g, ''));
                        block = {
                            type: isRes ? 'spawn_trail_resist' : 'spawn_trail',
                            params: {
                                bulletType: 'trail',
                                color: args[0] || '#00ffff',
                                speed: args[1] || '200',
                                angle: args[2] || 'angle',
                                offsetX: args[3] || '0',
                                offsetY: args[4] || '0',
                                radius: args[5] || '8',
                                growTime: args[6] || '0.2',
                                keepTime: args[7] || '0.3',
                                shrinkTime: args[8] || '0.5',
                                round: args[9] || 'true',
                                coordMode: args[10] || 'relative',
                                hitRadius: (args[11] !== undefined && args[11] !== '""') ? args[11] : ''
                            },
                            indent
                        };
                    }
                    let mSpawnBeam = trimmed.match(/^spawnBeam(Resist)?\((.*?)\)$/i);
                    if (mSpawnBeam) {
                        let isRes = !!mSpawnBeam[1];
                        let args = splitArgs(mSpawnBeam[2]).map(s => s.trim().replace(/^['"]|['"]$/g, ''));
                        block = {
                            type: isRes ? 'spawn_beam_resist' : 'spawn_beam',
                            params: {
                                warningTime: args[0] || '1.0',
                                activeTime: args[1] || '1.5',
                                laserWidth: args[2] || '12',
                                angle: args[3] || 'angle',
                                offsetX: args[4] || '0',
                                offsetY: args[5] || '0',
                                coordMode: args[6] || 'relative',
                                hitRadius: (args[7] !== undefined && args[7] !== '""') ? args[7] : ''
                            },
                            indent
                        };
                    }
                    let mSpawnLaserWay = trimmed.match(/^spawnLaserWay(Resist)?\((.*?)\)$/i);
                    if (mSpawnLaserWay) {
                        let isRes = !!mSpawnLaserWay[1];
                        let args = splitArgs(mSpawnLaserWay[2]).map(s => s.trim().replace(/^['"]|['"]$/g, ''));
                        let hasTrailArgs = args.length >= 13 || (args.length >= 12 && (args[11] === 'true' || args[11] === 'false' || args[12] === 'relative' || args[12] === 'absolute'));
                        block = {
                            type: isRes ? 'spawn_laser_way_resist' : 'spawn_laser_way',
                            params: {
                                bulletType: 'laser',
                                color: args[0] || '#ff3333',
                                radius: args[1] || '6',
                                speed: args[2] || '200',
                                angle: args[3] || 'angle',
                                count: args[4] || '3',
                                spread: args[5] || '45',
                                offsetX: args[6] || '0',
                                offsetY: args[7] || '0',
                                growTime: hasTrailArgs ? args[8] : '0.2',
                                keepTime: hasTrailArgs ? args[9] : '0.3',
                                shrinkTime: hasTrailArgs ? args[10] : '0.5',
                                round: hasTrailArgs ? args[11] : 'true',
                                coordMode: hasTrailArgs ? (args[12] || 'relative') : (args[8] || 'relative'),
                                hitRadius: hasTrailArgs ? ((args[13] !== undefined && args[13] !== '""') ? args[13] : '') : ((args[9] !== undefined && args[9] !== '""') ? args[9] : '')
                            },
                            indent
                        };
                    }
                    let mSpawnLaserRing = trimmed.match(/^spawnLaserRing(Resist)?\((.*?)\)$/i);
                    if (mSpawnLaserRing) {
                        let isRes = !!mSpawnLaserRing[1];
                        let args = splitArgs(mSpawnLaserRing[2]).map(s => s.trim().replace(/^['"]|['"]$/g, ''));
                        let hasTrailArgs = args.length >= 12 || (args.length >= 11 && (args[10] === 'true' || args[10] === 'false' || args[11] === 'relative' || args[11] === 'absolute'));
                        block = {
                            type: isRes ? 'spawn_laser_ring_resist' : 'spawn_laser_ring',
                            params: {
                                bulletType: 'laser',
                                color: args[0] || '#ff3333',
                                radius: args[1] || '6',
                                speed: args[2] || '200',
                                angle: args[3] || '0',
                                count: args[4] || '12',
                                offsetX: args[5] || '0',
                                offsetY: args[6] || '0',
                                growTime: hasTrailArgs ? args[7] : '0.2',
                                keepTime: hasTrailArgs ? args[8] : '0.3',
                                shrinkTime: hasTrailArgs ? args[9] : '0.5',
                                round: hasTrailArgs ? args[10] : 'true',
                                coordMode: hasTrailArgs ? (args[11] || 'relative') : (args[7] || 'relative'),
                                hitRadius: hasTrailArgs ? ((args[12] !== undefined && args[12] !== '""') ? args[12] : '') : ((args[8] !== undefined && args[8] !== '""') ? args[8] : '')
                            },
                            indent
                        };
                    }
                    let mSpawnBeamWay = trimmed.match(/^spawnBeamWay(Resist)?\((.*?)\)$/i);
                    if (mSpawnBeamWay) {
                        let isRes = !!mSpawnBeamWay[1];
                        let args = splitArgs(mSpawnBeamWay[2]).map(s => s.trim().replace(/^['"]|['"]$/g, ''));
                        block = {
                            type: isRes ? 'spawn_beam_way_resist' : 'spawn_beam_way',
                            params: {
                                warningTime: args[0] || '1.0',
                                activeTime: args[1] || '1.5',
                                laserWidth: args[2] || '12',
                                angle: args[3] || 'angle',
                                count: args[4] || '3',
                                spread: args[5] || '45',
                                offsetX: args[6] || '0',
                                offsetY: args[7] || '0',
                                coordMode: args[8] || 'relative',
                                hitRadius: (args[9] !== undefined && args[9] !== '""') ? args[9] : ''
                            },
                            indent
                        };
                    }
                    let mSpawnBeamRing = trimmed.match(/^spawnBeamRing(Resist)?\((.*?)\)$/i);
                    if (mSpawnBeamRing) {
                        let isRes = !!mSpawnBeamRing[1];
                        let args = splitArgs(mSpawnBeamRing[2]).map(s => s.trim().replace(/^['"]|['"]$/g, ''));
                        block = {
                            type: isRes ? 'spawn_beam_ring_resist' : 'spawn_beam_ring',
                            params: {
                                warningTime: args[0] || '1.0',
                                activeTime: args[1] || '1.5',
                                laserWidth: args[2] || '12',
                                angle: args[3] || '0',
                                count: args[4] || '12',
                                offsetX: args[5] || '0',
                                offsetY: args[6] || '0',
                                coordMode: args[7] || 'relative',
                                hitRadius: (args[8] !== undefined && args[8] !== '""') ? args[8] : ''
                            },
                            indent
                        };
                    }
                    if (!block) {
                        let mChange = trimmed.match(/^(\w+)\s*([+\-])=\s*(.+)$/);
                        if (mChange) block = { type: 'change_var', params: { name: mChange[1], op: mChange[2], value: mChange[3] }, indent };
                        else {
                            let mConst = trimmed.match(/^(const|let|var)\s+(\w+)\s*=\s*(.+)$/i);
                            if (mConst) block = { type: 'const_var', params: { name: mConst[2], value: mConst[3] }, indent };
                            else { let mSet = trimmed.match(/^(\w+)\s*=\s*(.+)$/); if (mSet) block = { type: 'set_var', params: { name: mSet[1], value: mSet[2] }, indent }; }
                        }
                    }
                    return block;
                };

                // ブロックを平坦リストへ追加
                let block = makeBlock(trimmed, indent);
                if (block) {
                    blocks.push(block);
                } else {
                    console.error(`[DANMAKU PARSE ERROR] 行: "${rawLine.trim()}" - 独自の弾幕構文として解釈できませんでした。スペルミス、引数の括弧の有無、代入式の形式などを確認してください。`);
                    blocks.push({
                        type: 'unknown',
                        params: { code: trimmed },
                        indent: indent
                    });
                }
            }

            const rawLines = [];
            let token = '';
            let parenDepth = 0;
            let quote = null;

            for (let i = 0; i < code.length; i++) {
                const ch = code[i];
                const prev = code[i - 1];

                if (quote) {
                    token += ch;
                    if (ch === quote && prev !== '\\') quote = null;
                    continue;
                }

                if (ch === '"' || ch === "'") {
                    quote = ch;
                    token += ch;
                    continue;
                }

                if (ch === '(') parenDepth++;
                if (ch === ')') parenDepth = Math.max(0, parenDepth - 1);

                if (ch === '{' || ch === '}') {
                    if (token.trim()) rawLines.push(token);
                    rawLines.push(ch);
                    token = '';
                    continue;
                }

                if ((ch === ';' && parenDepth === 0) || ch === '\n' || ch === '\r') {
                    if (token.trim()) rawLines.push(token);
                    token = '';
                    continue;
                }

                token += ch;
            }
            if (token.trim()) rawLines.push(token);
            let depth = 0;

            rawLines.forEach(rawLine => {
                const t = rawLine.trim();
                if (!t) return;
                if (t === '{') { depth++; return; }
                if (t === '}') { depth = Math.max(0, depth - 1); return; }
                let line = t;
                let hasBraceAtEnd = /\{\s*$/.test(line);
                line = line.replace(/\{\s*$/, '').trim();
                if (line) {
                    parseLine(line, depth);
                }
                if (hasBraceAtEnd) depth++;
            });

            return blocks;
        }

        function codeToBlocks(code) {
            if (!code) return [];

            // --- 波括弧ベースのパース ---
            // 波括弧が含まれている場合はブレースパーサーを使う
            // （repeat(20){ ... } のようなスタイルに対応）
            const hasBraces = /\{/.test(code);
            if (hasBraces) {
                return _codeToBlocksBrace(code);
            }

            // --- インデントベースのパース（従来）---

            let lines = code.split("\n");
            let blocks = [];
            
            lines.forEach(line => {
                let matchIndent = line.match(/^([ \t]*)/);
                let indentStr = matchIndent ? matchIndent[1] : "";
                let spaceCount = 0;
                for (let i = 0; i < indentStr.length; i++) {
                    if (indentStr[i] === '\t') spaceCount += 4;
                    else spaceCount += 1;
                }
                let indent = Math.floor(spaceCount / 4);
                indent = Math.max(0, Math.min(20, indent));

                let trimmed = line.trim();
                // セミコロン、行末の波括弧を除去
                trimmed = trimmed.replace(/;+$/, "").trim();
                trimmed = trimmed.replace(/\{\s*$/, "").trim();
                
                if (trimmed === "" || trimmed === "{" || trimmed === "}" || trimmed.startsWith("//")) return;
                
                let block = null;
                
                let mPlaySound = trimmed.match(/^playSound\((.*?)\)$/i);
                if (mPlaySound) {
                    let args = splitArgs(mPlaySound[1]).map(s => {
                        let sTrim = s.trim();
                        if ((sTrim.startsWith('"') && sTrim.endsWith('"')) || (sTrim.startsWith("'") && sTrim.endsWith("'"))) {
                            return sTrim.substring(1, sTrim.length - 1);
                        }
                        return sTrim;
                    });
                    block = {
                        type: 'play_sound',
                        params: {
                            soundName: args[0] || 'shot'
                        },
                        indent: indent
                    };
                }
                let mWait = trimmed.match(/^wait\((.*?)\)$/i);
                if (mWait) {
                    block = { type: 'wait', params: { duration: mWait[1].trim() }, indent: indent };
                }
                let mRepeat = trimmed.match(/^repeat\((.*?)\)$/i);
                if (mRepeat) {
                    block = { type: 'repeat', params: { count: mRepeat[1].trim() }, indent: indent };
                }
                let mForever = trimmed.match(/^forever\(\)$/i);
                if (mForever) {
                    block = { type: 'forever', params: {}, indent: indent };
                }
                let mWhileTrue = trimmed.match(/^while\s*\(\s*true\s*\)$/i);
                if (mWhileTrue) {
                    block = { type: 'forever', params: {}, indent: indent };
                }
                let mWhile = trimmed.match(/^while\s*\((.*?)\)$/i);
                if (mWhile && !mWhileTrue) {
                    block = { type: 'while', params: { cond: mWhile[1].trim() }, indent: indent };
                }
                let mForRepeat = trimmed.match(/^for\s*\(\s*(?:let|var)?\s*(\w+)\s*=\s*0\s*;\s*\1\s*<\s*(.*?)\s*;\s*\1\+\+\s*\)$/i);
                if (mForRepeat) {
                    block = { type: 'repeat', params: { count: mForRepeat[2].trim(), indexVar: mForRepeat[1].trim() }, indent: indent };
                }
                let mIf = trimmed.match(/^if\s*\((.*?)\)$/i);
                if (mIf) {
                    block = { type: 'if', params: { cond: mIf[1].trim() }, indent: indent };
                }
                let mAIf = trimmed.match(/^aif\s*\[(.*?)\]\s*\((.*?)\)$/i);
                if (mAIf) {
                    let tol = mAIf[1].trim();
                    let condRaw = mAIf[2].trim();
                    let condStr = condRaw;
                    condStr = condStr.replace(/([^&|?,:=()]+)\s*==\s*([^&|?,:=()]+)/g, `abs($1 - $2) <= ${tol}`);
                    condStr = condStr.replace(/([^&|?,:=()]+)\s*!=\s*([^&|?,:=()]+)/g, `abs($1 - $2) > ${tol}`);
                    block = { type: 'if', params: { cond: condStr, aifTol: tol, aifCond: condRaw }, indent: indent };
                }
                let mAim = trimmed.match(/^aimAtTarget\(\)$/i);
                if (mAim) {
                    block = { type: 'aim_at_target', params: {}, indent: indent };
                }
                let mAimCoord = trimmed.match(/^aimAt\((.*?)\)$/i);
                if (mAimCoord) {
                    let args = splitArgs(mAimCoord[1]).map(s => s.trim());
                    block = { type: 'aim_at_coord', params: { targetX: args[0] || '0', targetY: args[1] || '0' }, indent: indent };
                }
                let mMoveOwner = trimmed.match(/^moveTo\((.*?)\)$/i);
                if (mMoveOwner) {
                    let args = splitArgs(mMoveOwner[1]).map(s => s.trim().replace(/^['"]|['"]$/g, ''));
                    let preset = 'center';
                    if (args.length >= 2) {
                        preset = args[0] + ',' + args[1];
                    } else if (args.length === 1) {
                        preset = args[0];
                    }
                    block = { type: 'move_owner', params: { preset: preset || 'center', duration: '0' }, indent: indent };
                }
                let mSlideOwner = trimmed.match(/^slideTo\((.*?)\)$/i);
                if (mSlideOwner) {
                    let args = splitArgs(mSlideOwner[1]).map(s => s.trim().replace(/^['"]|['"]$/g, ''));
                    let preset = 'center';
                    let duration = '1.0';
                    if (args.length >= 3) {
                        preset = args[0] + ',' + args[1];
                        duration = args[2];
                    } else if (args.length === 2) {
                        if (!isNaN(parseFloat(args[0])) && !isNaN(parseFloat(args[1]))) {
                            preset = args[0] + ',' + args[1];
                            duration = '1.0';
                        } else {
                            preset = args[0];
                            duration = args[1];
                        }
                    } else if (args.length === 1) {
                        preset = args[0];
                    }
                    block = { type: 'move_owner', params: { preset, duration }, indent: indent };
                }
                let mBounce = trimmed.match(/^bounce\(\)$/i);
                if (mBounce) {
                    block = { type: 'bounce', params: {}, indent: indent };
                }
                let mAdvance = trimmed.match(/^advance\((.*?)\)$/i);
                if (mAdvance) {
                    block = { type: 'advance', params: { distance: mAdvance[1].trim() }, indent: indent };
                }
                let mOnce = trimmed.match(/^once(\(\))?$/i);
                if (mOnce) {
                    block = { type: 'once', params: {}, indent: indent };
                }
                let mHoming = trimmed.match(/^homing\((.*?)\)$/i);
                if (mHoming) {
                    block = { type: 'homing', params: { turnSpeed: mHoming[1].trim() }, indent: indent };
                }
                let mTween = trimmed.match(/^(tween|tweenWait)\((.*?)\)$/i);
                if (mTween) {
                    let isWait = mTween[1].toLowerCase() === 'tweenwait';
                    let args = splitArgs(mTween[2]).map(s => {
                        let sTrim = s.trim();
                        if ((sTrim.startsWith('"') && sTrim.endsWith('"')) || (sTrim.startsWith("'") && sTrim.endsWith("'"))) {
                            return sTrim.substring(1, sTrim.length - 1);
                        }
                        return sTrim;
                    });
                    let varName = args[0] || 'angle';
                    let fromVal = args[1] || '0';
                    let toVal = args[2] || '360';
                    let mode = args[3] || 'seconds';
                    let modeVal = args[4] || '1';
                    let easing = args[5] || 'linear';
                    block = {
                        type: isWait ? 'tween_var_wait' : 'tween_var',
                        params: {
                            name: varName,
                            from: fromVal,
                            to: toVal,
                            mode: mode,
                            duration: (mode !== 'step' && mode !== 'vecstep') ? modeVal : '1',
                            stepVal: (mode === 'step' || mode === 'vecstep') ? modeVal : '5',
                            easing: easing
                        },
                        indent: indent
                    };
                }
                let mTweenAngle = trimmed.match(/^tweenAngle(Wait)?\((.*?)\)$/i);
                if (mTweenAngle) {
                    let isWait = !!mTweenAngle[1];
                    let args = splitArgs(mTweenAngle[2]).map(s => s.trim().replace(/^['"]|['"]$/g, ''));
                    block = {
                        type: isWait ? 'tween_angle_wait' : 'tween_angle',
                        params: {
                            from: args[0] || '0',
                            to: args[1] || '360',
                            mode: args[2] || 'seconds',
                            duration: args[3] || '1',
                            easing: args[4] || 'linear'
                        },
                        indent: indent
                    };
                }
                let mSlow = trimmed.match(/^slow\((.*?)\)$/i);
                if (mSlow) { let args = splitArgs(mSlow[1]).map(s => s.trim()); block = { type: 'speed_scale', params: { mode: 'slow', effect: args[0] || '0.5', delay: args[1] || '0' }, indent: indent }; }
                let mFast = trimmed.match(/^fast\((.*?)\)$/i);
                if (mFast) { let args = splitArgs(mFast[1]).map(s => s.trim()); block = { type: 'speed_scale', params: { mode: 'fast', effect: args[0] || '2', delay: args[1] || '0' }, indent: indent }; }
                let mSpawnTrail = trimmed.match(/^spawnTrail\((.*?)\)$/i);
                if (mSpawnTrail) {
                    let args = splitArgs(mSpawnTrail[1]).map(s => {
                        let sTrim = s.trim();
                        if ((sTrim.startsWith('"') && sTrim.endsWith('"')) || (sTrim.startsWith("'") && sTrim.endsWith("'"))) {
                            return sTrim.substring(1, sTrim.length - 1);
                        }
                        return sTrim;
                    });
                    let hasNewArgs = args.length >= 11;
                    block = {
                        type: 'spawn_trail',
                        params: {
                            bulletType: 'trail',
                            color: args[0] || '#00ffff',
                            speed: args[1] || '200',
                            angle: args[2] || 'angle',
                            offsetX: args[3] || '0',
                            offsetY: args[4] || '0',
                            radius: args[5] || '8',
                            growTime: args[6] || '0.2',
                            keepTime: hasNewArgs ? args[7] : '0.3',
                            shrinkTime: hasNewArgs ? args[8] : (args[7] || '0.5'),
                            round: hasNewArgs ? args[9] : 'true',
                            coordMode: hasNewArgs ? args[10] : (args.length >= 9 ? args[8] : 'relative'),
                            hitRadius: hasNewArgs ? ((args[11] !== undefined && args[11] !== '""') ? args[11] : '') : ((args.length >= 10 && args[9] !== '""') ? args[9] : '')
                        },
                        indent: indent
                    };
                }
                let mSpawnTrailResist = trimmed.match(/^spawnTrailResist\((.*?)\)$/i);
                if (mSpawnTrailResist) {
                    let args = splitArgs(mSpawnTrailResist[1]).map(s => {
                        let sTrim = s.trim();
                        if ((sTrim.startsWith('"') && sTrim.endsWith('"')) || (sTrim.startsWith("'") && sTrim.endsWith("'"))) {
                            return sTrim.substring(1, sTrim.length - 1);
                        }
                        return sTrim;
                    });
                    let hasNewArgs = args.length >= 11;
                    block = {
                        type: 'spawn_trail_resist',
                        params: {
                            bulletType: 'trail',
                            color: args[0] || '#00ffff',
                            speed: args[1] || '200',
                            angle: args[2] || 'angle',
                            offsetX: args[3] || '0',
                            offsetY: args[4] || '0',
                            radius: args[5] || '8',
                            growTime: args[6] || '0.2',
                            keepTime: hasNewArgs ? args[7] : '0.3',
                            shrinkTime: hasNewArgs ? args[8] : (args[7] || '0.5'),
                            round: hasNewArgs ? args[9] : 'true',
                            coordMode: hasNewArgs ? args[10] : (args.length >= 9 ? args[8] : 'relative'),
                            hitRadius: hasNewArgs ? ((args[11] !== undefined && args[11] !== '""') ? args[11] : '') : ((args.length >= 10 && args[9] !== '""') ? args[9] : '')
                        },
                        indent: indent
                    };
                }
                let mSpawnBeam = trimmed.match(/^spawnBeam(Resist)?\((.*?)\)$/i);
                if (mSpawnBeam) {
                    let isRes = !!mSpawnBeam[1];
                    let args = splitArgs(mSpawnBeam[2]).map(s => {
                        let sTrim = s.trim();
                        if ((sTrim.startsWith('"') && sTrim.endsWith('"')) || (sTrim.startsWith("'") && sTrim.endsWith("'"))) {
                            return sTrim.substring(1, sTrim.length - 1);
                        }
                        return sTrim;
                    });
                    block = {
                        type: isRes ? 'spawn_beam_resist' : 'spawn_beam',
                        params: {
                            warningTime: args[0] || '1.0',
                            activeTime: args[1] || '1.5',
                            laserWidth: args[2] || '12',
                            angle: args[3] || 'angle',
                            offsetX: args[4] || '0',
                            offsetY: args[5] || '0',
                            coordMode: args[6] || 'relative',
                            hitRadius: (args[7] !== undefined && args[7] !== '""') ? args[7] : ''
                        },
                        indent: indent
                    };
                }
                let mSpawnLaserWay = trimmed.match(/^spawnLaserWay(Resist)?\((.*?)\)$/i);
                if (mSpawnLaserWay) {
                    let isRes = !!mSpawnLaserWay[1];
                    let args = splitArgs(mSpawnLaserWay[2]).map(s => {
                        let sTrim = s.trim();
                        if ((sTrim.startsWith('"') && sTrim.endsWith('"')) || (sTrim.startsWith("'") && sTrim.endsWith("'"))) {
                            return sTrim.substring(1, sTrim.length - 1);
                        }
                        return sTrim;
                    });
                    let hasTrailArgs = args.length >= 13 || (args.length >= 12 && (args[11] === 'true' || args[11] === 'false' || args[12] === 'relative' || args[12] === 'absolute'));
                    block = {
                        type: isRes ? 'spawn_laser_way_resist' : 'spawn_laser_way',
                        params: {
                            bulletType: 'laser',
                            color: args[0] || '#ff3333',
                            radius: args[1] || '6',
                            speed: args[2] || '200',
                            angle: args[3] || 'angle',
                            count: args[4] || '3',
                            spread: args[5] || '45',
                            offsetX: args[6] || '0',
                            offsetY: args[7] || '0',
                            growTime: hasTrailArgs ? args[8] : '0.2',
                            keepTime: hasTrailArgs ? args[9] : '0.3',
                            shrinkTime: hasTrailArgs ? args[10] : '0.5',
                            round: hasTrailArgs ? args[11] : 'true',
                            coordMode: hasTrailArgs ? (args[12] || 'relative') : (args[8] || 'relative'),
                            hitRadius: hasTrailArgs ? ((args[13] !== undefined && args[13] !== '""') ? args[13] : '') : ((args[9] !== undefined && args[9] !== '""') ? args[9] : '')
                        },
                        indent: indent
                    };
                }
                let mSpawnLaserRing = trimmed.match(/^spawnLaserRing(Resist)?\((.*?)\)$/i);
                if (mSpawnLaserRing) {
                    let isRes = !!mSpawnLaserRing[1];
                    let args = splitArgs(mSpawnLaserRing[2]).map(s => {
                        let sTrim = s.trim();
                        if ((sTrim.startsWith('"') && sTrim.endsWith('"')) || (sTrim.startsWith("'") && sTrim.endsWith("'"))) {
                            return sTrim.substring(1, sTrim.length - 1);
                        }
                        return sTrim;
                    });
                    let hasTrailArgs = args.length >= 12 || (args.length >= 11 && (args[10] === 'true' || args[10] === 'false' || args[11] === 'relative' || args[11] === 'absolute'));
                    block = {
                        type: isRes ? 'spawn_laser_ring_resist' : 'spawn_laser_ring',
                        params: {
                            bulletType: 'laser',
                            color: args[0] || '#ff3333',
                            radius: args[1] || '6',
                            speed: args[2] || '200',
                            angle: args[3] || 'angle',
                            count: args[4] || '12',
                            offsetX: args[5] || '0',
                            offsetY: args[6] || '0',
                            growTime: hasTrailArgs ? args[7] : '0.2',
                            keepTime: hasTrailArgs ? args[8] : '0.3',
                            shrinkTime: hasTrailArgs ? args[9] : '0.5',
                            round: hasTrailArgs ? args[10] : 'true',
                            coordMode: hasTrailArgs ? (args[11] || 'relative') : (args[7] || 'relative'),
                            hitRadius: hasTrailArgs ? ((args[12] !== undefined && args[12] !== '""') ? args[12] : '') : ((args[8] !== undefined && args[8] !== '""') ? args[8] : '')
                        },
                        indent: indent
                    };
                }
                let mSpawnBeamWay = trimmed.match(/^spawnBeamWay(Resist)?\((.*?)\)$/i);
                if (mSpawnBeamWay) {
                    let isRes = !!mSpawnBeamWay[1];
                    let args = splitArgs(mSpawnBeamWay[2]).map(s => {
                        let sTrim = s.trim();
                        if ((sTrim.startsWith('"') && sTrim.endsWith('"')) || (sTrim.startsWith("'") && sTrim.endsWith("'"))) {
                            return sTrim.substring(1, sTrim.length - 1);
                        }
                        return sTrim;
                    });
                    block = {
                        type: isRes ? 'spawn_beam_way_resist' : 'spawn_beam_way',
                        params: {
                            warningTime: args[0] || '1.0',
                            activeTime: args[1] || '1.5',
                            laserWidth: args[2] || '12',
                            angle: args[3] || 'angle',
                            count: args[4] || '3',
                            spread: args[5] || '45',
                            offsetX: args[6] || '0',
                            offsetY: args[7] || '0',
                            coordMode: args[8] || 'relative',
                            hitRadius: (args[9] !== undefined && args[9] !== '""') ? args[9] : ''
                        },
                        indent: indent
                    };
                }
                let mSpawnBeamRing = trimmed.match(/^spawnBeamRing(Resist)?\((.*?)\)$/i);
                if (mSpawnBeamRing) {
                    let isRes = !!mSpawnBeamRing[1];
                    let args = splitArgs(mSpawnBeamRing[2]).map(s => {
                        let sTrim = s.trim();
                        if ((sTrim.startsWith('"') && sTrim.endsWith('"')) || (sTrim.startsWith("'") && sTrim.endsWith("'"))) {
                            return sTrim.substring(1, sTrim.length - 1);
                        }
                        return sTrim;
                    });
                    block = {
                        type: isRes ? 'spawn_beam_ring_resist' : 'spawn_beam_ring',
                        params: {
                            warningTime: args[0] || '1.0',
                            activeTime: args[1] || '1.5',
                            laserWidth: args[2] || '12',
                            angle: args[3] || 'angle',
                            count: args[4] || '12',
                            offsetX: args[5] || '0',
                            offsetY: args[6] || '0',
                            coordMode: args[7] || 'relative',
                            hitRadius: (args[8] !== undefined && args[8] !== '""') ? args[8] : ''
                        },
                        indent: indent
                    };
                }

                let mSpawn = trimmed.match(/^spawnBullet\((.*?)\)$/i);
                if (mSpawn) {
                    let args = splitArgs(mSpawn[1]).map(s => {
                        let sTrim = s.trim();
                        if ((sTrim.startsWith('"') && sTrim.endsWith('"')) || (sTrim.startsWith("'") && sTrim.endsWith("'"))) {
                            return sTrim.substring(1, sTrim.length - 1);
                        }
                        return sTrim;
                    });
                    let isLegacy = false;
                    if (args.length === 5) {
                        let arg3IsNumber = !isNaN(parseFloat(args[3]));
                        let arg2IsRadius = args[2] === '6' || args[2] === '8' || args[2] === '12';
                        if (arg2IsRadius && arg3IsNumber) isLegacy = true;
                    }
                    block = {
                        type: 'spawn_bullet',
                        params: {
                            bulletType: args[0] || 'normal',
                            color: args[1] || '#ff3333',
                            speed: isLegacy ? (args[3] || '200') : (args[2] || '200'),
                            angle: isLegacy ? (args[4] || 'angle') : (args[3] || 'angle'),
                            offsetX: isLegacy ? '0' : (args[4] || '0'),
                            offsetY: isLegacy ? '0' : (args[5] || '0'),
                            radius: isLegacy ? args[2] : (args.length >= 7 ? args[6] : '6'),
                            bulletImage: args.length >= 8 ? args[7] : 'none',
                            coordMode: args.length >= 9 ? args[8] : 'relative',
                            hitRadius: (args.length >= 10 && args[9] !== '""') ? args[9] : ''
                        },
                        indent: indent
                    };
                }
                let mSpawnResist = trimmed.match(/^spawnBulletResist\((.*?)\)$/i);
                if (mSpawnResist) {
                    let args = splitArgs(mSpawnResist[1]).map(s => {
                        let sTrim = s.trim();
                        if ((sTrim.startsWith('"') && sTrim.endsWith('"')) || (sTrim.startsWith("'") && sTrim.endsWith("'"))) {
                            return sTrim.substring(1, sTrim.length - 1);
                        }
                        return sTrim;
                    });
                    let isLegacy = false;
                    if (args.length === 5) {
                        let arg3IsNumber = !isNaN(parseFloat(args[3]));
                        let arg2IsRadius = args[2] === '6' || args[2] === '8' || args[2] === '12';
                        if (arg2IsRadius && arg3IsNumber) isLegacy = true;
                    }
                    block = {
                        type: 'spawn_bullet_resist',
                        params: {
                            bulletType: args[0] || 'normal',
                            color: args[1] || '#ff3333',
                            speed: isLegacy ? (args[3] || '200') : (args[2] || '200'),
                            angle: isLegacy ? (args[4] || 'angle') : (args[3] || 'angle'),
                            offsetX: isLegacy ? '0' : (args[4] || '0'),
                            offsetY: isLegacy ? '0' : (args[5] || '0'),
                            radius: isLegacy ? args[2] : (args.length >= 7 ? args[6] : '6'),
                            bulletImage: args.length >= 8 ? args[7] : 'none',
                            coordMode: args.length >= 9 ? args[8] : 'relative',
                            hitRadius: (args.length >= 10 && args[9] !== '""') ? args[9] : ''
                        },
                        indent: indent
                    };
                }
                let mSpawnRing = trimmed.match(/^spawnRing\((.*?)\)$/i);
                if (mSpawnRing) {
                    let args = splitArgs(mSpawnRing[1]).map(s => {
                        let sTrim = s.trim();
                        if ((sTrim.startsWith('"') && sTrim.endsWith('"')) || (sTrim.startsWith("'") && sTrim.endsWith("'"))) {
                            return sTrim.substring(1, sTrim.length - 1);
                        }
                        return sTrim;
                    });
                    let isLegacy = args.length === 5 && (args[2] === '6' || args[2] === '8' || args[2] === '12');
                    block = {
                        type: 'spawn_ring',
                        params: {
                            bulletType: args[0] || 'normal',
                            color: args[1] || '#ff3333',
                            speed: isLegacy ? (args[3] || '200') : (args[2] || '200'),
                            angle: isLegacy ? '0' : (args[3] || '0'),
                            count: isLegacy ? (args[4] || '12') : (args[4] || '12'),
                            offsetX: isLegacy ? '0' : (args[5] || '0'),
                            offsetY: isLegacy ? '0' : (args[6] || '0'),
                            radius: isLegacy ? args[2] : (args.length >= 8 ? args[7] : '6'),
                            bulletImage: args.length >= 9 ? args[8] : 'none',
                            coordMode: args.length >= 10 ? args[9] : 'relative',
                            hitRadius: (args.length >= 11 && args[10] !== '""') ? args[10] : ''
                        },
                        indent: indent
                    };
                }
                let mSpawnRingResist = trimmed.match(/^spawnRingResist\((.*?)\)$/i);
                if (mSpawnRingResist) {
                    let args = splitArgs(mSpawnRingResist[1]).map(s => {
                        let sTrim = s.trim();
                        if ((sTrim.startsWith('"') && sTrim.endsWith('"')) || (sTrim.startsWith("'") && sTrim.endsWith("'"))) {
                            return sTrim.substring(1, sTrim.length - 1);
                        }
                        return sTrim;
                    });
                    let isLegacy = args.length === 5 && (args[2] === '6' || args[2] === '8' || args[2] === '12');
                    block = {
                        type: 'spawn_ring_resist',
                        params: {
                            bulletType: args[0] || 'normal',
                            color: args[1] || '#ff3333',
                            speed: isLegacy ? (args[3] || '200') : (args[2] || '200'),
                            angle: isLegacy ? '0' : (args[3] || '0'),
                            count: isLegacy ? (args[4] || '12') : (args[4] || '12'),
                            offsetX: isLegacy ? '0' : (args[5] || '0'),
                            offsetY: isLegacy ? '0' : (args[6] || '0'),
                            radius: isLegacy ? args[2] : (args.length >= 8 ? args[7] : '6'),
                            bulletImage: args.length >= 9 ? args[8] : 'none',
                            coordMode: args.length >= 10 ? args[9] : 'relative',
                            hitRadius: (args.length >= 11 && args[10] !== '""') ? args[10] : ''
                        },
                        indent: indent
                    };
                }
                let mSpawnWay = trimmed.match(/^spawnWay\((.*?)\)$/i);
                if (mSpawnWay) {
                    let args = splitArgs(mSpawnWay[1]).map(s => {
                        let sTrim = s.trim();
                        if ((sTrim.startsWith('"') && sTrim.endsWith('"')) || (sTrim.startsWith("'") && sTrim.endsWith("'"))) {
                            return sTrim.substring(1, sTrim.length - 1);
                        }
                        return sTrim;
                    });
                    let isLegacy = args.length === 7 && (args[2] === '6' || args[2] === '8' || args[2] === '12');
                    block = {
                        type: 'spawn_way',
                        params: {
                            bulletType: args[0] || 'normal',
                            color: args[1] || '#ff3333',
                            speed: isLegacy ? (args[3] || '200') : (args[2] || '200'),
                            angle: isLegacy ? (args[4] || 'angle') : (args[3] || 'angle'),
                            count: isLegacy ? (args[5] || '3') : (args[4] || '3'),
                            spread: isLegacy ? (args[6] || '30') : (args[5] || '30'),
                            offsetX: isLegacy ? '0' : (args[6] || '0'),
                            offsetY: isLegacy ? '0' : (args[7] || '0'),
                            radius: isLegacy ? args[2] : (args.length >= 9 ? args[8] : '6'),
                            bulletImage: args.length >= 10 ? args[9] : 'none',
                            coordMode: args.length >= 11 ? args[10] : 'relative',
                            hitRadius: (args.length >= 12 && args[11] !== '""') ? args[11] : ''
                        },
                        indent: indent
                    };
                }
                let mSpawnWayResist = trimmed.match(/^spawnWayResist\((.*?)\)$/i);
                if (mSpawnWayResist) {
                    let args = splitArgs(mSpawnWayResist[1]).map(s => {
                        let sTrim = s.trim();
                        if ((sTrim.startsWith('"') && sTrim.endsWith('"')) || (sTrim.startsWith("'") && sTrim.endsWith("'"))) {
                            return sTrim.substring(1, sTrim.length - 1);
                        }
                        return sTrim;
                    });
                    let isLegacy = args.length === 7 && (args[2] === '6' || args[2] === '8' || args[2] === '12');
                    block = {
                        type: 'spawn_way_resist',
                        params: {
                            bulletType: args[0] || 'normal',
                            color: args[1] || '#ff3333',
                            speed: isLegacy ? (args[3] || '200') : (args[2] || '200'),
                            angle: isLegacy ? (args[4] || 'angle') : (args[3] || 'angle'),
                            count: isLegacy ? (args[5] || '3') : (args[4] || '3'),
                            spread: isLegacy ? (args[6] || '30') : (args[5] || '30'),
                            offsetX: isLegacy ? '0' : (args[6] || '0'),
                            offsetY: isLegacy ? '0' : (args[7] || '0'),
                            radius: isLegacy ? args[2] : (args.length >= 9 ? args[8] : '6'),
                            bulletImage: args.length >= 10 ? args[9] : 'none',
                            coordMode: args.length >= 11 ? args[10] : 'relative',
                            hitRadius: (args.length >= 12 && args[11] !== '""') ? args[11] : ''
                        },
                        indent: indent
                    };
                }
                let mSpawnMC = trimmed.match(/^spawnMagicCircle\((.*?)\)$/i);
                if (mSpawnMC) {
                    let args = splitArgs(mSpawnMC[1]).map(s => {
                        let sTrim = s.trim();
                        if ((sTrim.startsWith('"') && sTrim.endsWith('"')) || (sTrim.startsWith("'") && sTrim.endsWith("'"))) {
                            return sTrim.substring(1, sTrim.length - 1);
                        }
                        return sTrim;
                    });
                    block = {
                        type: 'spawn_magic_circle',
                        params: {
                            color: args[0] || '#00ffff',
                            offsetX: args[1] || '0',
                            offsetY: args[2] || '0'
                        },
                        indent: indent
                    };
                }
                
                if (!block) {
                    let mChange = trimmed.match(/^(\w+)\s*([+\-])=\s*(.+)$/);
                    if (mChange) {
                        block = {
                            type: 'change_var',
                            params: { name: mChange[1].trim(), op: mChange[2], value: mChange[3].trim() },
                            indent: indent
                        };
                    } else {
                        let mConst = trimmed.match(/^(const|let|var)\s+(\w+)\s*=\s*(.+)$/i);
                            if (mConst) { block = { type: 'const_var', params: { name: mConst[2].trim(), value: mConst[3].trim() }, indent: indent }; }
                            else { let mSet = trimmed.match(/^(\w+)\s*=\s*(.+)$/); if (mSet) { block = { type: 'set_var', params: { name: mSet[1].trim(), value: mSet[2].trim() }, indent: indent }; } }
                    }
                }
                
                if (block) {
                    blocks.push(block);
                } else {
                    console.error(`[DANMAKU PARSE ERROR] 行: "${line.trim()}" - 独自の弾幕構文として解釈できませんでした。スペルミス、引数の括弧の有無、代入式の形式などを確認してください。`);
                    blocks.push({
                        type: 'unknown',
                        params: { code: trimmed },
                        indent: indent
                    });
                }
            });
            
            let mergedBlocks = [];
            for (let i = 0; i < blocks.length; i++) {
                let curr = blocks[i];
                let next = blocks[i + 1];
                let third = blocks[i + 2];
                if (curr.type === 'set_var' && curr.params.name === 'warningTime' &&
                    next && next.type === 'set_var' && next.params.name === 'activeTime' &&
                    curr.indent === next.indent) {
                    
                    mergedBlocks.push({
                        type: 'set_laser',
                        params: {
                            warningTime: curr.params.value,
                            activeTime: next.params.value,
                            laserWidth: (third && third.type === 'set_var' && third.params.name === 'laserWidth' && third.indent === curr.indent) ? third.params.value : '12'
                        },
                        indent: curr.indent
                    });
                    if (third && third.type === 'set_var' && third.params.name === 'laserWidth' && third.indent === curr.indent) {
                        i += 2;
                    } else {
                        i++; // activeTime block is merged
                    }
                } else if (curr.type === 'set_var' && curr.params.name === 'warningTime') {
                    mergedBlocks.push({
                        type: 'set_laser',
                        params: {
                            warningTime: curr.params.value,
                            activeTime: '1.5',
                            laserWidth: '12'
                        },
                        indent: curr.indent
                    });
                } else if (curr.type === 'set_var' && curr.params.name === 'activeTime') {
                    mergedBlocks.push({
                        type: 'set_laser',
                        params: {
                            warningTime: '1.0',
                            activeTime: curr.params.value,
                            laserWidth: '12'
                        },
                        indent: curr.indent
                    });
                } else {
                    mergedBlocks.push(curr);
                }
            }
            blocks = mergedBlocks;

            for (let i = 0; i < blocks.length; i++) {
                if (i === 0) blocks[i].indent = 0;
                else blocks[i].indent = Math.min(blocks[i].indent || 0, blocks[i - 1].indent + 1);
            }
            
            return blocks;
        }

        // スマホ操作の自動初期化
        initTouchControls();
        initZoomControls();

        // -------------------------------------------------------------
        // 共有弾幕（作った弾幕一覧）表示・プレイ機能
        // -------------------------------------------------------------
        let currentSharedDanmakuName = null;

        function getSharedDanmakuMinMiss(name) {
            try {
                const saved = localStorage.getItem('touhou_kyoukaisen_minmiss_shared');
                if (saved) {
                    const minMissDict = JSON.parse(saved);
                    return minMissDict[name];
                }
            } catch(e) {}
            return undefined;
        }

        function saveClearedSharedDanmaku(name, isNoMiss, missCount, isInfMisses) {
            let clearedList = [];
            try {
                const saved = localStorage.getItem('touhou_kyoukaisen_cleared_shared');
                if (saved) {
                    clearedList = JSON.parse(saved);
                }
            } catch(e) {}
            if (!clearedList.includes(name)) {
                clearedList.push(name);
                try {
                    localStorage.setItem('touhou_kyoukaisen_cleared_shared', JSON.stringify(clearedList));
                } catch(e) {}
            }

            if (isInfMisses) {
                let minMissDict = {};
                try {
                    const savedMinMiss = localStorage.getItem('touhou_kyoukaisen_minmiss_shared');
                    if (savedMinMiss) {
                        minMissDict = JSON.parse(savedMinMiss);
                    }
                } catch(e) {}
                
                if (typeof missCount === 'number') {
                    if (!(name in minMissDict) || missCount < minMissDict[name]) {
                        minMissDict[name] = missCount;
                        try {
                            localStorage.setItem('touhou_kyoukaisen_minmiss_shared', JSON.stringify(minMissDict));
                        } catch(e) {}
                    }
                }
            } else if (isNoMiss) {
                let noMissList = [];
                try {
                    const savedNoMiss = localStorage.getItem('touhou_kyoukaisen_nomiss_shared');
                    if (savedNoMiss) {
                        noMissList = JSON.parse(savedNoMiss);
                    }
                } catch(e) {}
                if (!noMissList.includes(name)) {
                    noMissList.push(name);
                    try {
                        localStorage.setItem('touhou_kyoukaisen_nomiss_shared', JSON.stringify(noMissList));
                    } catch(e) {}
                }
            }
        }

        function isSharedDanmakuCleared(name) {
            try {
                const saved = localStorage.getItem('touhou_kyoukaisen_cleared_shared');
                if (saved) {
                    const clearedList = JSON.parse(saved);
                    return clearedList.includes(name);
                }
            } catch(e) {}
            return false;
        }

        function isSharedDanmakuNoMiss(name) {
            try {
                const saved = localStorage.getItem('touhou_kyoukaisen_nomiss_shared');
                if (saved) {
                    const noMissList = JSON.parse(saved);
                    return noMissList.includes(name);
                }
            } catch(e) {}
            return false;
        }

        function showSharedDanmakuScreen() {
            showScreen('screen-shared-danmaku');
            renderSharedDanmakuList();
        }

        let sharedDanmakuPage = 0;
        const SHARED_PAGE_SIZE = 8;

        function changeSharedDanmakuPage(delta) {
            const total = typeof sharedDanmakuList !== 'undefined' ? sharedDanmakuList.length : 0;
            const maxPage = Math.max(0, Math.ceil(total / SHARED_PAGE_SIZE) - 1);
            sharedDanmakuPage = Math.max(0, Math.min(maxPage, sharedDanmakuPage + delta));
            renderSharedDanmakuList();
        }
        window.changeSharedDanmakuPage = changeSharedDanmakuPage;

        function renderSharedDanmakuList() {
            const container = document.getElementById('shared-danmaku-list-container');
            if (!container) return;
            container.innerHTML = '';

            if (typeof sharedDanmakuList === 'undefined' || sharedDanmakuList.length === 0) {
                container.innerHTML = '<div style="color:#888; font-size:12px; text-align:center; padding:50px 0; border:1.5px dashed rgba(255,255,255,0.1); border-radius:8px;">作った弾幕がありません。「js/danmaku.js」にデータを追加してください。</div>';
                const pageInfo = document.getElementById('shared-page-info');
                if (pageInfo) pageInfo.textContent = '1 / 1';
                return;
            }

            const total = sharedDanmakuList.length;
            const totalPages = Math.ceil(total / SHARED_PAGE_SIZE);
            sharedDanmakuPage = Math.max(0, Math.min(totalPages - 1, sharedDanmakuPage));
            const start = sharedDanmakuPage * SHARED_PAGE_SIZE;
            const pageItems = sharedDanmakuList.slice(start, start + SHARED_PAGE_SIZE);

            // ページ情報更新
            const pageInfo = document.getElementById('shared-page-info');
            if (pageInfo) pageInfo.textContent = `${sharedDanmakuPage + 1} / ${totalPages}`;
            const prevBtn = document.getElementById('shared-page-prev');
            const nextBtn = document.getElementById('shared-page-next');
            if (prevBtn) prevBtn.disabled = sharedDanmakuPage === 0;
            if (nextBtn) nextBtn.disabled = sharedDanmakuPage >= totalPages - 1;

            pageItems.forEach((card, pageIdx) => {
                const idx = start + pageIdx; // 元のリスト上のインデックス
                const isCleared = isSharedDanmakuCleared(card.name);
                
                // 配色出し分け (クリア時は青、未クリア時は紫)
                const borderNormal = isCleared ? 'rgba(0,120,255,0.3)' : 'rgba(216,0,255,0.3)';
                const borderHover = isCleared ? 'rgba(0,120,255,0.7)' : 'rgba(216,0,255,0.7)';
                const titleColor = isCleared ? '#ccffff' : '#ffccff';
                const titleShadow = isCleared ? 'rgba(0,120,255,0.4)' : 'rgba(216,0,255,0.4)';
                const btnBg = isCleared ? 'linear-gradient(135deg, #002255 0%, #000c22 100%)' : 'linear-gradient(135deg, #3c0055 0%, #1a0022 100%)';
                const btnBorder = isCleared ? '#0088ff' : '#d800ff';
                const btnShadow = isCleared ? 'rgba(0,136,255,0.6)' : 'rgba(216,0,255,0.6)';

                const cardDiv = document.createElement('div');
                cardDiv.style.cssText = `display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(255,255,255,0.05); border: 1px solid ${borderNormal}; border-radius: 8px; margin-bottom: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.2); transition: border-color 0.2s;`;
                cardDiv.onmouseover = () => { cardDiv.style.borderColor = borderHover; };
                cardDiv.onmouseout = () => { cardDiv.style.borderColor = borderNormal; };
                
                const infoDiv = document.createElement('div');
                infoDiv.style.flex = '1';
                infoDiv.style.paddingRight = '10px';
                
                const titleSpan = document.createElement('span');
                titleSpan.style.cssText = `font-weight: bold; color: ${titleColor}; font-size: 14px; text-shadow: 0 0 5px ${titleShadow}; vertical-align: middle;`;
                titleSpan.textContent = card.name;
                
                if (isCleared) {
                    let isInf = card.maxMisses === Infinity || String(card.maxMisses).trim().toLowerCase() === 'inf' || String(card.maxMisses).trim().toLowerCase() === 'infinity';
                    if (isInf) {
                        const minMissCount = getSharedDanmakuMinMiss(card.name);
                        if (typeof minMissCount === 'number') {
                            const minMissBadge = document.createElement('span');
                            minMissBadge.style.cssText = 'margin-left: 6px; font-size: 9px; color: #00ff66; background: rgba(0,255,100,0.15); border: 1px solid rgba(0,255,100,0.3); padding: 1px 4px; border-radius: 3px; vertical-align: middle; font-weight: bold;';
                            minMissBadge.textContent = '★Miss: ' + minMissCount;
                            titleSpan.appendChild(minMissBadge);
                        } else {
                            const clearBadge = document.createElement('span');
                            clearBadge.style.cssText = 'margin-left: 6px; font-size: 9px; color: #00ff66; background: rgba(0,255,100,0.15); border: 1px solid rgba(0,255,100,0.3); padding: 1px 4px; border-radius: 3px; vertical-align: middle; font-weight: bold;';
                            clearBadge.textContent = '★CLEARED';
                            titleSpan.appendChild(clearBadge);
                        }
                    } else {
                        const clearBadge = document.createElement('span');
                        clearBadge.style.cssText = 'margin-left: 6px; font-size: 9px; color: #00ff66; background: rgba(0,255,100,0.15); border: 1px solid rgba(0,255,100,0.3); padding: 1px 4px; border-radius: 3px; vertical-align: middle; font-weight: bold;';
                        clearBadge.textContent = '★CLEARED';
                        titleSpan.appendChild(clearBadge);

                        const isNoMiss = isSharedDanmakuNoMiss(card.name);
                        if (isNoMiss) {
                            const noMissBadge = document.createElement('span');
                            noMissBadge.style.cssText = 'margin-left: 4px; font-size: 9px; color: #ffbb00; background: rgba(255,187,0,0.15); border: 1px solid rgba(255,187,0,0.4); padding: 1px 4px; border-radius: 3px; vertical-align: middle; font-weight: bold;';
                            noMissBadge.textContent = '★NoMiss';
                            titleSpan.appendChild(noMissBadge);
                        }
                    }
                }
                
                const timeSpan = document.createElement('span');
                timeSpan.style.cssText = 'margin-left: 8px; font-size: 10px; color: #00ffcc; background: rgba(0,255,200,0.15); border: 1px solid rgba(0,255,200,0.3); padding: 1px 4px; border-radius: 3px; vertical-align: middle;';
                timeSpan.textContent = `${card.duration}秒`;
                
                const descP = document.createElement('p');
                descP.style.cssText = 'margin: 4px 0 0 0; font-size: 11px; color: #ccc; line-height: 1.35;';
                descP.textContent = card.desc || '説明はありません。';
                
                infoDiv.appendChild(titleSpan);
                infoDiv.appendChild(timeSpan);
                infoDiv.appendChild(descP);
                
                const playBtn = document.createElement('button');
                playBtn.className = 'menu-btn';
                playBtn.style.cssText = `width: 75px; height: 30px; font-size: 12px; margin: 0; background: ${btnBg}; border-color: ${btnBorder}; text-shadow: 0 0 6px ${btnShadow}; font-weight: bold; flex-shrink: 0;`;
                playBtn.textContent = 'プレイ';
                playBtn.onclick = () => playSharedDanmaku(idx);
                
                const diff = typeof normalizeDifficulty === 'function' ? normalizeDifficulty(card.difficulty) : (card.difficulty || 'NORMAL');
                const badge = document.createElement('div');
                badge.className = `difficulty-badge difficulty-${diff.toLowerCase()}`;
                badge.textContent = diff.charAt(0).toUpperCase();
                
                cardDiv.appendChild(badge);
                cardDiv.appendChild(infoDiv);
                cardDiv.appendChild(playBtn);
                container.appendChild(cardDiv);
            });
        }

        function playSharedDanmaku(idx) {
            const sharedCard = sharedDanmakuList[idx];
            if (!sharedCard) return;
            currentSharedDanmakuName = sharedCard.name;

            // 独自のJS風コード文字列、またはブロック配列をパースする
            let emitterScript = [];
            if (typeof sharedCard.emitterScript === 'string') {
                emitterScript = codeToBlocks(sharedCard.emitterScript);
            } else if (Array.isArray(sharedCard.emitterScript)) {
                emitterScript = sharedCard.emitterScript;
            }

            let bulletScript = [];
            if (typeof sharedCard.bulletScript === 'string') {
                bulletScript = codeToBlocks(sharedCard.bulletScript);
            } else if (Array.isArray(sharedCard.bulletScript)) {
                bulletScript = sharedCard.bulletScript;
            }

            let magicCircleScript = [];
            if (typeof sharedCard.magicCircleScript === 'string') {
                magicCircleScript = codeToBlocks(sharedCard.magicCircleScript);
            } else if (Array.isArray(sharedCard.magicCircleScript)) {
                magicCircleScript = sharedCard.magicCircleScript;
            }

            let cardDuration = parseFloat(sharedCard.duration) || 15;
            let xOffset = Number(sharedCard.x_offset) || 0;
            let yOffset = Number(sharedCard.y_offset) || 0;
            let despawnTime = parseFloat(sharedCard.despawnTime) || 1.5;

            let cardDiffVal = sharedCard.difficulty || 'NORMAL';
            let formattedDiff = typeof normalizeDifficulty === 'function' ? normalizeDifficulty(cardDiffVal) : cardDiffVal.toUpperCase();

            let cardHp = parseInt(sharedCard.hp, 10) || 0;

            let tempCustomCard = {
                id: sharedCard.id || ('danmaku_' + idx),
                name: (sharedCard.name || '共有弾幕').replace(/^【A】/, ''),
                duration: cardDuration,
                hp: cardHp,
                x_offset: xOffset,
                y_offset: yOffset,
                despawnTime: despawnTime,
                maxMisses: (() => {
                    if (sharedCard.maxMisses === undefined || sharedCard.maxMisses === null) return 2;
                    if (typeof sharedCard.maxMisses === 'number') return sharedCard.maxMisses;
                    let val = String(sharedCard.maxMisses).trim().toLowerCase();
                    if (val === 'inf' || val === 'infinity') return Infinity;
                    let parsed = parseInt(val, 10);
                    return isNaN(parsed) ? 2 : parsed;
                })(),
                difficulty: formattedDiff,
                pattern: 'custom_test_shared_' + idx,
                interval: 0.1,
                rawCost: 0,
                cost: 0,
                desc: sharedCard.desc || '共有弾幕',
                isCustom: true,
                emitterScript: emitterScript,
                bulletScript: bulletScript,
                magicCircleScript: magicCircleScript
            };

            window.cpuDifficulty = formattedDiff;
            window.currentDifficulty = formattedDiff;

            // defaultCards.active に登録して上書き
            let testCardIdx = defaultCards.active.findIndex(c => c.id === tempCustomCard.id);
            if (testCardIdx !== -1) {
                defaultCards.active[testCardIdx] = tempCustomCard;
            } else {
                defaultCards.active.push(tempCustomCard);
            }

            isCustomCardTesting = true;
            window.isBossMode = cardHp > 0;
            if (typeof checkBulletTouchRequirement === 'function') {
                checkBulletTouchRequirement();
            }
            currentTestPlaySource = 'shared';
            window.currentCardSecond = 0;
            window.currentCardFrame = 0;
            window.spellMissCount = 0;
            window.spellBombCount = 0;
            window.spellMaxBonus = 10000000;
            window.spellCurrentBonus = window.spellMaxBonus;
            window.spellBonusFailed = false;
            window.spellClearResult = null;
            window.spellTransitionTimer = 0;
            window.lastTimeoutSecond = 11;
            window.spellDeclarationTimer = 2.8;
            if (window.isBossMode && window.playSound) window.playSound('se_cat00');
            player.respawnTimer = 0;
            window.playerMissCount = 0;
            window.playerMaxMisses = tempCustomCard.maxMisses;
            window.playerInvincibleTimer = 0;
            window.miniExplosionEffect = null;
            window.miniExplosionShockwave = null;

            setCardMakerScreenActive(false);
            document.getElementById('titleScreen').style.display = 'none';
            isGameRunning = true;

            // モバイルボムボタンの表示切り替え（ボス戦モード時のみ表示）
            const bombBtn = document.getElementById('mobile-bomb-button');
            if (bombBtn) {
                if (window.isBossMode && window.mobileBombSetting !== 'double_tap') {
                    bombBtn.classList.remove('hidden');
                } else {
                    bombBtn.classList.add('hidden');
                }
            }

            // キー入力状態のリセット
            for (let k in keyboardState) keyboardState[k] = false;

            bullets.length = 0;
            magicCircles.length = 0;
            activeReigekis.length = 0;
            reigekiCutinTimer = 0;
            prevBombInput = false;
            activeEffects.length = 0;

            player.x = PLAY_WIDTH / 2;
            player.y = canvas.height * 0.8;
            player.targetX = player.x;
            player.targetY = player.y;
            player.prevX = player.x;
            player.prevY = player.y;
            player.respawnDelay = 0;
            player.respawnTimer = 0;
            player.respawnStartY = 0;
            player.respawnTargetY = 0;
            player.isInvincible = false;
            player.invincibleTimer = 0;
            player.hp = 1000;
            player.maxHp = 1000;
            player.pendingDamage = 0;
            player.pendingHeal = 0;
            player.deathbombTimer = 0;
            player.bombLockTimer = 0;
            player.grazeCount = 0;
            player.bombs = window.isBossMode ? 2 : 0;
            player.maxBombs = window.isBossMode ? 2 : 0;
            player.passives = [];
            player.recentHits = [];

            cpu.x = PLAY_WIDTH / 2;
            cpu.y = canvas.height * 0.2;
            cpu.targetX = cpu.x;
            cpu.targetY = cpu.y;
            cpu.prevX = cpu.x;
            cpu.prevY = cpu.y;
            cpu.hp = cardHp > 0 ? cardHp : 1000;
            cpu.maxHp = cardHp > 0 ? cardHp : 1000;
            cpu.pendingDamage = 0;
            cpu.pendingHeal = 0;
            cpu.grazeCount = 0;
            cpu.bombs = 0;
            cpu.maxBombs = 0;
            cpu.passives = [];
            cpu.recentHits = [];

            gameState = 'BATTLE';
            battlePhase = 'ACTION';
            turnOwner = 'CPU';
            turnCount = 1;

            activeCards = [ tempCustomCard ];
            activeCards[0].emitterState = initEmitterState(tempCustomCard.emitterScript, cpu, player, tempCustomCard.x_offset || 0, tempCustomCard.y_offset || 0, tempCustomCard.id);
            activeCards[0].emitterState.bulletScript = tempCustomCard.bulletScript || [];
            activeCards[0].emitterState.magicCircleScript = tempCustomCard.magicCircleScript || [];
            actionTimer = tempCustomCard.duration;
            customCardTestEmitterDone = false;
            customCardDeathEffect = null;
            normalShotTimer = 0;

            lastTime = performance.now();
            timeAccumulator = 0;
            startGameLoop();
        }

        // ==========================================
        // ボスモード（ボスに挑戦！）管理システム
        // ==========================================
        let currentBoss = null;
        let currentBossIndex = 0;
        let currentBossSpellIndex = 0;

        function showBossListScreen() {
            showScreen('screen-boss-list');
            renderBossList();
        }
        window.showBossListScreen = showBossListScreen;

        function isDeveloperEnvironment() {
            if (typeof window === 'undefined') return false;
            try {
                // 1. ローカル開発環境 (localhost, 127.0.0.1, file://)
                if (location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.protocol === 'file:') {
                    return true;
                }
                // 2. URLパラメータ (?dev=1, ?debug=1)
                if (location.search.includes('dev=1') || location.search.includes('debug=1')) {
                    return true;
                }
            } catch (e) {}
            return false;
        }
        window.isDeveloperEnvironment = isDeveloperEnvironment;

        function renderBossList() {
            const container = document.getElementById('boss-list-container');
            if (!container) return;
            container.innerHTML = '';

            if (typeof bossList === 'undefined' || bossList.length === 0) {
                container.innerHTML = '<div style="color:#888; font-size:12px; text-align:center; padding:50px 0; border:1.5px dashed rgba(255,255,255,0.1); border-radius:8px;">登録されているボスがいません。「js/bossdanmakudata.js」にデータを追加してください。</div>';
                return;
            }

            const isDev = isDeveloperEnvironment();

            // 開発者以外には devOnly: true のボスを非表示
            const availableBosses = bossList
                .map((boss, originalIndex) => ({ boss, originalIndex }))
                .filter(({ boss }) => !boss.devOnly || isDev);

            if (availableBosses.length === 0) {
                container.innerHTML = '<div style="color:#888; font-size:12px; text-align:center; padding:50px 0; border:1.5px dashed rgba(255,255,255,0.1); border-radius:8px;">現在挑戦可能なボスはいません。</div>';
                return;
            }

            availableBosses.forEach(({ boss, originalIndex }) => {
                const cardDiv = document.createElement('div');
                cardDiv.style.cssText = `display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,51,102,0.3); border-radius: 8px; margin-bottom: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.3); transition: border-color 0.2s;`;
                cardDiv.onmouseover = () => { cardDiv.style.borderColor = 'rgba(255,51,102,0.8)'; };
                cardDiv.onmouseout = () => { cardDiv.style.borderColor = 'rgba(255,51,102,0.3)'; };

                const infoDiv = document.createElement('div');
                infoDiv.style.flex = '1';
                infoDiv.style.paddingRight = '12px';
                infoDiv.style.display = 'flex';
                infoDiv.style.alignItems = 'center';

                const titleSpan = document.createElement('span');
                titleSpan.style.cssText = `font-weight: bold; color: ${boss.color || '#ff88aa'}; font-size: 16px; text-shadow: 0 0 8px rgba(255,51,102,0.5); vertical-align: middle;`;
                titleSpan.textContent = boss.name;

                if (boss.devOnly) {
                    const devBadge = document.createElement('span');
                    devBadge.style.cssText = 'margin-left: 8px; font-size: 10px; color: #ffcc00; background: rgba(255,204,0,0.15); border: 1px solid rgba(255,204,0,0.5); padding: 1px 6px; border-radius: 4px; vertical-align: middle; font-weight: bold;';
                    devBadge.textContent = '開発中';
                    infoDiv.appendChild(titleSpan);
                    infoDiv.appendChild(devBadge);
                } else {
                    infoDiv.appendChild(titleSpan);
                }

                let hiScore = (typeof getBossHighScore === 'function') ? getBossHighScore(boss.id) : 0;

                const hiScoreSpan = document.createElement('span');
                hiScoreSpan.style.cssText = 'margin-left: 12px; font-size: 11px; color: #66ffcc; background: rgba(0,255,200,0.12); border: 1px solid rgba(0,255,200,0.3); padding: 2px 7px; border-radius: 4px; vertical-align: middle; font-family: monospace; font-weight: bold;';
                hiScoreSpan.textContent = `Hi-Score: ${hiScore.toLocaleString()}`;
                infoDiv.appendChild(hiScoreSpan);

                const playBtn = document.createElement('button');
                playBtn.className = 'menu-btn';
                playBtn.style.cssText = `width: 80px; height: 32px; font-size: 13px; margin: 0; background: linear-gradient(135deg, #660022 0%, #2a0011 100%); border-color: #ff3366; text-shadow: 0 0 6px rgba(255,51,102,0.8); font-weight: bold; flex-shrink: 0;`;
                playBtn.textContent = '挑む！';
                playBtn.onclick = () => playBossBattle(originalIndex, 0, false);

                cardDiv.appendChild(infoDiv);
                cardDiv.appendChild(playBtn);
                container.appendChild(cardDiv);
            });
        }
        window.renderBossList = renderBossList;

        function getBossHighScore(bossId) {
            if (!bossId) return 0;
            try {
                return parseInt(localStorage.getItem('danmaku_boss_hiscore_' + bossId) || '0', 10);
            } catch (e) {
                return 0;
            }
        }
        window.getBossHighScore = getBossHighScore;

        function updateBossHighScore(bossId, score) {
            if (!bossId || typeof score !== 'number' || isNaN(score)) return;
            try {
                let key = 'danmaku_boss_hiscore_' + bossId;
                let prev = parseInt(localStorage.getItem(key) || '0', 10);
                if (score > prev) {
                    localStorage.setItem(key, String(score));
                }
            } catch (e) {
                console.error('Failed to save boss high score:', e);
            }
        }
        window.updateBossHighScore = updateBossHighScore;

        function getBossSpell(spellRef) {
            if (!spellRef) return null;
            if (typeof spellRef === 'object') return spellRef;
            let spellId = String(spellRef).trim();
            if (typeof window.compiledBossDanmakuList !== 'undefined' && Array.isArray(window.compiledBossDanmakuList)) {
                let s = window.compiledBossDanmakuList.find(item => item.id === spellId || item.name === spellId);
                if (s) return s;
            }
            if (typeof bossDanmakuList !== 'undefined' && Array.isArray(bossDanmakuList)) {
                let s = bossDanmakuList.find(item => item.id === spellId || item.name === spellId);
                if (s) return s;
            }
            return null;
        }
        window.getBossSpell = getBossSpell;

        function playBossBattle(bIdxOrBoss, spellIdx = 0, isNextSpell = false) {
            let bIdx = typeof bIdxOrBoss === 'number' ? bIdxOrBoss : -1;
            if (bIdx === -1 && typeof bossList !== 'undefined') {
                bIdx = bossList.findIndex(b => b === bIdxOrBoss || b.id === bIdxOrBoss || (bIdxOrBoss && b.id === bIdxOrBoss.id));
            }
            if (bIdx === -1 || typeof bossList === 'undefined' || !bossList[bIdx]) return;
            const boss = bossList[bIdx];
            if (!boss.spells || boss.spells.length === 0) return;
            if (spellIdx >= boss.spells.length) {
                // ボス戦完全制覇！
                if (typeof triggerCustomCardClear === 'function') {
                    triggerCustomCardClear();
                }
                return;
            }

            currentBoss = boss;
            currentBossIndex = bIdx;
            currentBossSpellIndex = spellIdx;
            currentTestPlaySource = 'boss';

            const spellRef = boss.spells[spellIdx];
            const spell = getBossSpell(spellRef);
            if (!spell) {
                console.error("Spell not found:", spellRef);
                return;
            }
            let emitterScript = [];
            if (typeof spell.emitterScript === 'string') {
                emitterScript = codeToBlocks(spell.emitterScript);
            } else if (Array.isArray(spell.emitterScript)) {
                emitterScript = spell.emitterScript;
            }

            let bulletScript = [];
            if (typeof spell.bulletScript === 'string') {
                bulletScript = codeToBlocks(spell.bulletScript);
            } else if (Array.isArray(spell.bulletScript)) {
                bulletScript = spell.bulletScript;
            }

            let magicCircleScript = [];
            if (typeof spell.magicCircleScript === 'string') {
                magicCircleScript = codeToBlocks(spell.magicCircleScript);
            } else if (Array.isArray(spell.magicCircleScript)) {
                magicCircleScript = spell.magicCircleScript;
            }

            let cardDuration = parseFloat(spell.duration) || 30;
            let bossHp = parseInt(spell.hp, 10) || 1500;
            let spellDiff = spell.difficulty || 'NORMAL';
            let formattedDiff = typeof normalizeDifficulty === 'function' ? normalizeDifficulty(spellDiff) : spellDiff.toUpperCase();

            let rawSpellName = (spell.name !== undefined && spell.name !== null) ? String(spell.name).replace(/^【A】/, '').trim() : '';
            let hasSpellName = rawSpellName.length > 0;

            // 残機数（現在の機体を除く残機ストック数＝ミス可能回数。残機0なら1度死んだら即ゲームオーバー、残機2なら2回ミス可能）
            let bLives = (boss && (boss.playerLives !== undefined ? boss.playerLives : (boss.lives !== undefined ? boss.lives : (boss.life !== undefined ? boss.life : 2))));
            let bossMaxMisses = (boss && (boss.playerLives !== undefined || boss.lives !== undefined || boss.life !== undefined))
                ? Math.max(0, parseInt(bLives, 10) || 0)
                : 2;

            let tempSpellCard = {
                id: spell.id || (`boss_${bIdx}_spell_${spellIdx}`),
                name: rawSpellName,
                duration: cardDuration,
                hp: bossHp,
                x_offset: Number(spell.x_offset) || 0,
                y_offset: Number(spell.y_offset) || 0,
                despawnTime: parseFloat(spell.despawnTime) || 1.5,
                maxMisses: bossMaxMisses,
                difficulty: formattedDiff,
                pattern: 'boss_' + bIdx + '_' + spellIdx,
                interval: 0.1,
                rawCost: 0,
                cost: 0,
                desc: spell.desc || (hasSpellName ? `${boss.name} のスペルカード` : `${boss.name} の通常攻撃`),
                isCustom: true,
                emitterScript: emitterScript,
                bulletScript: bulletScript,
                magicCircleScript: magicCircleScript
            };

            window.cpuDifficulty = formattedDiff;
            window.currentDifficulty = formattedDiff;

            let testCardIdx = defaultCards.active.findIndex(c => c.id === tempSpellCard.id);
            if (testCardIdx !== -1) {
                defaultCards.active[testCardIdx] = tempSpellCard;
            } else {
                defaultCards.active.push(tempSpellCard);
            }

            isCustomCardTesting = true;
            window.isBossMode = true;
            if (typeof resumeGameFromPause === 'function') resumeGameFromPause();
            if (typeof checkBulletTouchRequirement === 'function') {
                checkBulletTouchRequirement();
            }

            window.isNonSpell = !hasSpellName;

            window.currentCardSecond = 0;
            window.currentCardFrame = 0;
            window.spellMissCount = 0;
            window.spellBombCount = 0;
            window.spellMaxBonus = (tempSpellCard && tempSpellCard.bonusScore) ? parseInt(tempSpellCard.bonusScore, 10) : 10000000;
            window.spellCurrentBonus = window.spellMaxBonus;
            window.spellBonusFailed = false;
            window.spellClearResult = null;
            window.spellTransitionTimer = 0;
            window.lastTimeoutSecond = 11;
            window.spellDeclarationTimer = hasSpellName ? 2.8 : 0;
            if (hasSpellName && window.playSound) {
                window.playSound('se_cat00');
            }
            player.respawnTimer = 0;
            if (!isNextSpell) {
                window.playerMissCount = 0;
                window.playerMaxMisses = bossMaxMisses;
                window.totalScore = 0;
                player.bombs = 2; // ボムは固定2個
                player.maxBombs = 2;
            }
            window.playerInvincibleTimer = 0;
            window.miniExplosionEffect = null;
            window.miniExplosionShockwave = null;

            setCardMakerScreenActive(false);
            document.getElementById('titleScreen').style.display = 'none';
            isGameRunning = true;

            // モバイルボムボタンの表示切り替え
            const bombBtn = document.getElementById('mobile-bomb-button');
            if (bombBtn) {
                if (window.mobileBombSetting !== 'double_tap') {
                    bombBtn.classList.remove('hidden');
                } else {
                    bombBtn.classList.add('hidden');
                }
            }

            // キー入力状態のリセット
            for (let k in keyboardState) keyboardState[k] = false;

            bullets.length = 0;
            magicCircles.length = 0;
            activeReigekis.length = 0;
            reigekiCutinTimer = 0;
            prevBombInput = false;
            activeEffects.length = 0;

            if (!isNextSpell) {
                player.x = PLAY_WIDTH / 2;
                player.y = canvas.height * 0.8;
                player.targetX = player.x;
                player.targetY = player.y;
                player.prevX = player.x;
                player.prevY = player.y;

                cpu.x = PLAY_WIDTH / 2;
                cpu.y = canvas.height * 0.2;
                cpu.targetX = cpu.x;
                cpu.targetY = cpu.y;
                cpu.prevX = cpu.x;
                cpu.prevY = cpu.y;
            }
            player.respawnDelay = 0;
            player.respawnTimer = 0;
            player.respawnStartY = 0;
            player.respawnTargetY = 0;
            player.isInvincible = false;
            player.invincibleTimer = 0;
            player.hp = 1000;
            player.maxHp = 1000;
            player.pendingDamage = 0;
            player.pendingHeal = 0;
            player.deathbombTimer = 0;
            player.bombLockTimer = 0;
            player.grazeCount = 0;
            player.passives = [];
            player.recentHits = [];

            cpu.hp = bossHp;
            cpu.maxHp = bossHp;
            cpu.pendingDamage = 0;
            cpu.pendingHeal = 0;
            cpu.grazeCount = 0;
            cpu.bombs = 0;
            cpu.maxBombs = 0;
            cpu.passives = [];
            cpu.recentHits = [];

            gameState = 'BATTLE';
            battlePhase = 'ACTION';
            turnOwner = 'CPU';
            turnCount = 1;

            activeCards = [ tempSpellCard ];
            activeCards[0].emitterState = initEmitterState(tempSpellCard.emitterScript, cpu, player, tempSpellCard.x_offset || 0, tempSpellCard.y_offset || 0, tempSpellCard.id);
            activeCards[0].emitterState.bulletScript = tempSpellCard.bulletScript || [];
            activeCards[0].emitterState.magicCircleScript = tempSpellCard.magicCircleScript || [];
            actionTimer = tempSpellCard.duration;
            customCardTestEmitterDone = false;
            customCardDeathEffect = null;
            normalShotTimer = 0;

            lastTime = performance.now();
            timeAccumulator = 0;
            startGameLoop();
        }
        window.playBossBattle = playBossBattle;