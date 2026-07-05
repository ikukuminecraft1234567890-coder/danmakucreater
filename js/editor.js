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
            } else if (type === 'move_owner') {
                block.params.preset = 'center';
                block.params.duration = '0';
            } else if (type === 'slide_owner') {
                block.type = 'move_owner';
                block.params.preset = 'right';
                block.params.duration = '1.0';
            } else if (type === 'spawn_bullet') {
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
            } else if (type === 'homing') {
                block.params.turnSpeed = '90';
            } else if (type === 'spawn_magic_circle') {
                block.params.color = '#00ffff';
                block.params.offsetX = '50';
                block.params.offsetY = '-50';
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
            script[idx].indent = Math.max(0, Math.min(3, (script[idx].indent || 0) + dir));
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
            document.getElementById('palette-btn-tweenvar').style.display = (tab === 'emitter') ? 'block' : 'none';
            document.getElementById('palette-btn-tweenvarwait').style.display = (tab === 'emitter') ? 'block' : 'none';
            document.getElementById('palette-btn-setlaser').style.display = (tab === 'bullet') ? 'block' : 'none';
            
            // 動作グループ
            document.getElementById('palette-btn-aim').style.display = 'block';
            document.getElementById('palette-btn-move-owner').style.display = (tab === 'emitter') ? 'block' : 'none';
            document.getElementById('palette-btn-slide-owner').style.display = (tab === 'emitter') ? 'block' : 'none';
            document.getElementById('palette-btn-spawn').style.display = (tab === 'emitter') ? 'block' : 'none';
            document.getElementById('palette-btn-spawn-ring').style.display = (tab === 'emitter') ? 'block' : 'none';
            document.getElementById('palette-btn-spawn-way').style.display = (tab === 'emitter') ? 'block' : 'none';
            document.getElementById('palette-btn-homing').style.display = (tab === 'bullet') ? 'block' : 'none';
            document.getElementById('palette-btn-speed-add').style.display = (tab === 'bullet') ? 'block' : 'none';
            document.getElementById('palette-btn-speed-set').style.display = (tab === 'bullet') ? 'block' : 'none';
            document.getElementById('palette-btn-angle-add').style.display = (tab === 'bullet') ? 'block' : 'none';
            document.getElementById('palette-btn-angle-set').style.display = (tab === 'bullet') ? 'block' : 'none';
            document.getElementById('palette-btn-color-set').style.display = (tab === 'bullet') ? 'block' : 'none';
            document.getElementById('palette-btn-slow').style.display = (tab === 'bullet') ? 'block' : 'none';
            document.getElementById('palette-btn-fast').style.display = (tab === 'bullet') ? 'block' : 'none';
            document.getElementById('palette-btn-bounce').style.display = (tab === 'bullet') ? 'block' : 'none';
            
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
                        case 'if': {
                            let cond = b.params.cond || 'isBounced';
                            let normalizedCond = cond.replace(/\s+/g, '');
                            let selectVal = 'custom';
                            if (normalizedCond === 'isbounced' || cond === 'isBounced') selectVal = 'isBounced';
                            else if (normalizedCond === 'istouchbullet' || cond === 'isTouchBullet') selectVal = 'isTouchBullet';
                            else if (normalizedCond === 'touchingbullet' || cond === 'touchingBullet') selectVal = 'touchingBullet';
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
                                    <option value="isTouchBullet" ${selectVal === 'isTouchBullet' ? 'selected' : ''}>弾に触れた瞬間 (isTouchBullet)</option>
                                    <option value="touchingBullet" ${selectVal === 'touchingBullet' ? 'selected' : ''}>弾に触れている間 (touchingBullet)</option>
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
                                <input type="text" list="${b.params.name === 'color' ? 'color-suggestions' : 'val-suggestions'}" style="width:70px;" value="${b.params.value}" onchange="customCardMakerUpdateParam(${idx}, 'value', this.value)">
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
                                    <option value="marutama" ${b.params.bulletImage === 'marutama' ? 'selected' : ''}>丸弾</option>
                                    <option value="kome" ${b.params.bulletImage === 'kome' ? 'selected' : ''}>米弾</option>
                                    <option value="ootama" ${b.params.bulletImage === 'ootama' ? 'selected' : ''}>大玉</option>
                                    <option value="ohuda" ${b.params.bulletImage === 'ohuda' ? 'selected' : ''}>お札</option>
                                    <option value="star" ${b.params.bulletImage === 'star' ? 'selected' : ''}>星</option>
                                    <option value="knife" ${b.params.bulletImage === 'knife' ? 'selected' : ''}>ナイフ</option>
                                    <option value="uroko" ${b.params.bulletImage === 'uroko' ? 'selected' : ''}>鱗弾</option>
                                    <option value="poihuru" ${b.params.bulletImage === 'poihuru' ? 'selected' : ''}>ポイフル</option>
                                    <option value="virus" ${b.params.bulletImage === 'virus' ? 'selected' : ''}>ウイルス</option>
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
                                    <option value="marutama" ${b.params.bulletImage === 'marutama' ? 'selected' : ''}>丸弾</option>
                                    <option value="kome" ${b.params.bulletImage === 'kome' ? 'selected' : ''}>米弾</option>
                                    <option value="ootama" ${b.params.bulletImage === 'ootama' ? 'selected' : ''}>大玉</option>
                                    <option value="ohuda" ${b.params.bulletImage === 'ohuda' ? 'selected' : ''}>お札</option>
                                    <option value="star" ${b.params.bulletImage === 'star' ? 'selected' : ''}>星</option>
                                    <option value="knife" ${b.params.bulletImage === 'knife' ? 'selected' : ''}>ナイフ</option>
                                    <option value="uroko" ${b.params.bulletImage === 'uroko' ? 'selected' : ''}>鱗弾</option>
                                    <option value="poihuru" ${b.params.bulletImage === 'poihuru' ? 'selected' : ''}>ポイフル</option>
                                    <option value="virus" ${b.params.bulletImage === 'virus' ? 'selected' : ''}>ウイルス</option>
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
                                    <option value="marutama" ${b.params.bulletImage === 'marutama' ? 'selected' : ''}>丸弾</option>
                                    <option value="kome" ${b.params.bulletImage === 'kome' ? 'selected' : ''}>米弾</option>
                                    <option value="ootama" ${b.params.bulletImage === 'ootama' ? 'selected' : ''}>大玉</option>
                                    <option value="ohuda" ${b.params.bulletImage === 'ohuda' ? 'selected' : ''}>お札</option>
                                    <option value="star" ${b.params.bulletImage === 'star' ? 'selected' : ''}>星</option>
                                    <option value="knife" ${b.params.bulletImage === 'knife' ? 'selected' : ''}>ナイフ</option>
                                    <option value="uroko" ${b.params.bulletImage === 'uroko' ? 'selected' : ''}>鱗弾</option>
                                    <option value="poihuru" ${b.params.bulletImage === 'poihuru' ? 'selected' : ''}>ポイフル</option>
                                    <option value="virus" ${b.params.bulletImage === 'virus' ? 'selected' : ''}>ウイルス</option>
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
                        case 'spawn_magic_circle':
                            blockDiv.className = 'maker-block color-action';
                            html = `
                                <span>[召喚] 魔法陣を召喚する - 色:</span>
                                <input type="text" list="color-suggestions" style="width:76px;" value="${b.params.color || '#00ffff'}" onchange="customCardMakerUpdateParam(${idx}, 'color', this.value)">
                                <span>補正 X:</span>
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
                                </select>
                                ${mode !== 'step' ? `<input type="text" list="val-suggestions" style="width:50px;" value="${b.params.duration || '1'}" onchange="customCardMakerUpdateParam(${idx}, 'duration', this.value)">` : `<input type="text" list="val-suggestions" style="width:50px;" value="${b.params.stepVal || '5'}" onchange="customCardMakerUpdateParam(${idx}, 'stepVal', this.value)">`}
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
            let cardDuration = getCustomCardDuration(document.getElementById('custom-card-duration') ? document.getElementById('custom-card-duration').value : customCardMaker.duration);
            customCardMaker.duration = cardDuration;
            
            let xOffsetInput = document.getElementById('custom-card-x-offset') ? Number(document.getElementById('custom-card-x-offset').value) || 0 : 0;
            let yOffsetInput = document.getElementById('custom-card-y-offset') ? Number(document.getElementById('custom-card-y-offset').value) || 0 : 0;

            let tempCustomCard = {
                id: 'custom_test',
                name: '【A】' + (document.getElementById('custom-card-name').value.trim() || 'テスト弾幕'),
                duration: cardDuration,
                x_offset: xOffsetInput,
                y_offset: yOffsetInput,
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
            
            let testCardIdx = defaultCards.active.findIndex(c => c.id === 'custom_test');
            if (testCardIdx !== -1) {
                defaultCards.active[testCardIdx] = tempCustomCard;
            } else {
                defaultCards.active.push(tempCustomCard);
            }
            
            isCustomCardTesting = true;
            
            setCardMakerScreenActive(false);
            document.getElementById('titleScreen').style.display = 'none';
            isGameRunning = true;
            
            // テストプレイ開始時に全キー入力をリセット（スタックキー防止）
            for (let k in keyboardState) keyboardState[k] = false;
            
            bullets = [];
            magicCircles = [];
            activeReigekis = [];
            reigekiCutinTimer = 0;
            prevBombInput = false;
            activeEffects = [];
            
            player.x = PLAY_WIDTH / 2;
            player.y = canvas.height * 0.8;
            player.isInvincible = false;
            player.invincibleTimer = 0;
            player.hp = 1000;
            player.maxHp = 1000;
            player.pendingDamage = 0;
            player.pendingHeal = 0;
            player.grazeCount = 0;
            player.bombs = 0;
            player.maxBombs = 0;
            player.passives = [];
            player.recentHits = [];
            
            cpu.x = PLAY_WIDTH / 2;
            cpu.y = canvas.height * 0.2;
            cpu.hp = 1000;
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
            activeCards[0].emitterState = initEmitterState(tempCustomCard.emitterScript, cpu, player, tempCustomCard.x_offset || 0, tempCustomCard.y_offset || 0);
            actionTimer = tempCustomCard.duration;
            customCardTestEmitterDone = false;
            customCardDeathEffect = null;
            normalShotTimer = 0;
            
            lastTime = performance.now();
            timeAccumulator = 0;
            startGameLoop();
        }

        function endCustomCardTest(success) {
            isCustomCardTesting = false;
            isGameRunning = false;
            gameState = 'TITLE';
            customCardDeathEffect = null;
            
            bullets = [];
            magicCircles = [];
            activeReigekis = [];
            
            const bombBtn = document.getElementById('mobileBombBtn');
            if (bombBtn) bombBtn.style.display = 'none';
            const overlay = document.getElementById('battleOverlay');
            if (overlay) overlay.classList.add('hidden');
            
            document.getElementById('titleScreen').style.display = 'flex';
            showScreen('screen-card-maker');
            
            // プレイ結果による成否メッセージ表示を非表示にする
            customCardMaker.testPassed = true;
            
            renderCardMaker();
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

            let nameInput = document.getElementById('custom-card-name').value.trim() || 'カスタムスペル';
            let descInput = document.getElementById('custom-card-desc').value.trim() || 'オリジナルの弾幕パターン。';
            let cardDuration = getCustomCardDuration(document.getElementById('custom-card-duration') ? document.getElementById('custom-card-duration').value : customCardMaker.duration);
            customCardMaker.duration = cardDuration;

            if (!nameInput.startsWith('【A】')) {
                nameInput = '【A】' + nameInput;
            }
            if (!descInput.startsWith('【自作カード】')) {
                descInput = '【自作カード】' + descInput;
            }

            let xOffsetInput = document.getElementById('custom-card-x-offset') ? Number(document.getElementById('custom-card-x-offset').value) || 0 : 0;
            let yOffsetInput = document.getElementById('custom-card-y-offset') ? Number(document.getElementById('custom-card-y-offset').value) || 0 : 0;

            let cardId = customCardMaker.editingId || ('custom_' + Date.now());
            let cardData = {
                id: cardId,
                name: nameInput,
                desc: descInput,
                duration: cardDuration,
                x_offset: xOffsetInput,
                y_offset: yOffsetInput,
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

        function customCardMakerSwitchMode(mode) {
            if (customCardMakerMode === mode) return;
            
            let script = getActiveScript();
            
            const blocksContainer = document.getElementById('workspace-blocks-container');
            const codeTextarea = document.getElementById('workspace-code-textarea');
            const palette = document.querySelector('.palette-panel');
            const btnBlock = document.getElementById('mode-btn-block');
            const btnCode = document.getElementById('mode-btn-code');

            const makerLayout = document.querySelector('.maker-layout');

            if (mode === 'code') {
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
                if (blocksContainer) blocksContainer.classList.add('hidden');
                // パレットパネルを完全に非表示にして画面を最大化
                if (palette) palette.classList.add('hidden');
                // レイアウトに code-mode クラスを付ける
                if (makerLayout) makerLayout.classList.add('code-mode');
            } else {
                let code = codeTextarea ? codeTextarea.value : "";
                let parsedBlocks = codeToBlocks(code);
                
                if (customCardMaker.activeTab === 'emitter') {
                    customCardMaker.emitterScript = parsedBlocks;
                } else if (customCardMaker.activeTab === 'bullet') {
                    customCardMaker.bulletScript = parsedBlocks;
                }
                
                if (blocksContainer) blocksContainer.classList.remove('hidden');
                if (codeTextarea) {
                    codeTextarea.classList.add('hidden');
                    // ブロックモードに戻すときスタイルリセット
                    codeTextarea.style.flex = '';
                    codeTextarea.style.minHeight = '';
                    codeTextarea.style.height = '';
                }
                // パレットパネルを再表示
                if (palette) {
                    palette.classList.remove('hidden');
                    palette.style.opacity = '1.0';
                    palette.style.pointerEvents = 'auto';
                }
                // code-mode クラスを外す
                if (makerLayout) makerLayout.classList.remove('code-mode');
                
                customCardMaker.testPassed = false;
                renderCardMaker();
            }
            
            customCardMakerMode = mode;
            if (btnBlock) btnBlock.className = mode === 'block' ? 'tab-btn active' : 'tab-btn';
            if (btnCode) btnCode.className = mode === 'code' ? 'tab-btn active' : 'tab-btn';
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

                        if (hr !== '' || rad !== '6' || img !== 'none' || cm !== 'relative') {
                            // hitRadiusを出力する場合はフル引数
                            line = `spawnBullet("${bt}", ${formatCodeColorArg(col)}, ${spd}, ${ang}, ${ox}, ${oy}, ${rad}, "${img}", "${cm}", ${formatCodeColorArg(hr)})`;
                        } else if (ox !== '0' || oy !== '0') {
                            line = `spawnBullet("${bt}", ${formatCodeColorArg(col)}, ${spd}, ${ang}, ${ox}, ${oy})`;
                        } else {
                            line = `spawnBullet("${bt}", ${formatCodeColorArg(col)}, ${spd}, ${ang})`;
                        }
                        break;
                    }
                    case 'spawn_ring': {
                        let btRing = b.params.bulletType || 'normal';
                        let colRing = b.params.color || '#ff3333';
                        let spdRing = b.params.speed || '200';
                        let cntRing = b.params.count || '12';
                        let oxRing = b.params.offsetX || '0';
                        let oyRing = b.params.offsetY || '0';
                        let radRing = b.params.radius || '6';
                        let imgRing = b.params.bulletImage || 'none';
                        let cmRing = b.params.coordMode || 'relative';
                        let hrRing = b.params.hitRadius || '';

                        if (hrRing !== '' || radRing !== '6' || imgRing !== 'none' || cmRing !== 'relative') {
                            line = `spawnRing("${btRing}", ${formatCodeColorArg(colRing)}, ${spdRing}, ${cntRing}, ${oxRing}, ${oyRing}, ${radRing}, "${imgRing}", "${cmRing}", ${formatCodeColorArg(hrRing)})`;
                        } else if (oxRing !== '0' || oyRing !== '0') {
                            line = `spawnRing("${btRing}", ${formatCodeColorArg(colRing)}, ${spdRing}, ${cntRing}, ${oxRing}, ${oyRing})`;
                        } else {
                            line = `spawnRing("${btRing}", ${formatCodeColorArg(colRing)}, ${spdRing}, ${cntRing})`;
                        }
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

                        if (hrWay !== '' || radWay !== '6' || imgWay !== 'none' || cmWay !== 'relative') {
                            line = `spawnWay("${btWay}", ${formatCodeColorArg(colWay)}, ${spdWay}, ${angWay}, ${cntWay}, ${sprWay}, ${oxWay}, ${oyWay}, ${radWay}, "${imgWay}", "${cmWay}", ${formatCodeColorArg(hrWay)})`;
                        } else if (oxWay !== '0' || oyWay !== '0') {
                            line = `spawnWay("${btWay}", ${formatCodeColorArg(colWay)}, ${spdWay}, ${angWay}, ${cntWay}, ${sprWay}, ${oxWay}, ${oyWay})`;
                        } else {
                            line = `spawnWay("${btWay}", ${formatCodeColorArg(colWay)}, ${spdWay}, ${angWay}, ${cntWay}, ${sprWay})`;
                        }
                        break;
                    }
                    case 'spawn_magic_circle': {
                        let col = b.params.color || '#00ffff';
                        let ox = b.params.offsetX || '0';
                        let oy = b.params.offsetY || '0';
                        if (ox !== '0' || oy !== '0') {
                            line = `spawnMagicCircle(${formatCodeColorArg(col)}, ${ox}, ${oy})`;
                        } else {
                            line = `spawnMagicCircle(${formatCodeColorArg(col)})`;
                        }
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
                        if (mode === 'step') {
                            line = `${fnName}(${nameStr}, ${fromVal}, ${toVal}, "step", ${b.params.stepVal || '5'})`;
                        } else {
                            line = `${fnName}(${nameStr}, ${fromVal}, ${toVal}, "${mode}", ${b.params.duration || '1'})`;
                        }
                        break;
                    }
                    case 'bounce':
                        line = `bounce()`;
                        break;
                    case 'set_laser':
                        line = `warningTime = ${b.params.warningTime || '1.0'}\n${indentStr}activeTime = ${b.params.activeTime || '1.5'}\n${indentStr}laserWidth = ${b.params.laserWidth || '12'}`;
                        break;
                    case 'if':
                        line = `if (${b.params.cond || 'x < 10'})`;
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
                let indent = Math.max(0, Math.min(3, currentIndent));

                const makeBlock = (trimmed, indent) => {
                    let block = null;
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
                    let mAim = trimmed.match(/^aimAtTarget\(\)$/i);
                    if (mAim) block = { type: 'aim_at_target', params: {}, indent };
                    let mMoveOwner = trimmed.match(/^moveTo\((.*?)\)$/i);
                    if (mMoveOwner) {
                        let args = mMoveOwner[1].split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
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
                        let args = mSlideOwner[1].split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
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
                    let mOnce = trimmed.match(/^once(\(\))?$/i);
                    if (mOnce) block = { type: 'once', params: {}, indent };
                    let mHoming = trimmed.match(/^homing\((.*?)\)$/i);
                    if (mHoming) block = { type: 'homing', params: { turnSpeed: mHoming[1].trim() }, indent };
                    let mTween = trimmed.match(/^(tween|tweenWait)\((.*?)\)$/i);
                    if (mTween) {
                        let isWait = mTween[1].toLowerCase() === 'tweenwait';
                        let args = mTween[2].split(",").map(s => s.trim().replace(/^['"]|['"]$/g, ''));
                        let varName = args[0] || 'angle';
                        let fromVal = args[1] || '0';
                        let toVal = args[2] || '360';
                        let mode = args[3] || 'seconds';
                        let modeVal = args[4] || '1';
                        block = {
                            type: isWait ? 'tween_var_wait' : 'tween_var',
                            params: {
                                name: varName,
                                from: fromVal,
                                to: toVal,
                                mode: mode,
                                duration: mode !== 'step' ? modeVal : '1',
                                stepVal: mode === 'step' ? modeVal : '5'
                            },
                            indent
                        };
                    }
                    let mSlow = trimmed.match(/^slow\((.*?)\)$/i);
                    if (mSlow) { let args = mSlow[1].split(',').map(s => s.trim()); block = { type: 'speed_scale', params: { mode: 'slow', effect: args[0] || '0.5', delay: args[1] || '0' }, indent }; }
                    let mFast = trimmed.match(/^fast\((.*?)\)$/i);
                    if (mFast) { let args = mFast[1].split(',').map(s => s.trim()); block = { type: 'speed_scale', params: { mode: 'fast', effect: args[0] || '2', delay: args[1] || '0' }, indent }; }
                    let mSpawn = trimmed.match(/^spawnBullet\((.*?)\)$/i);
                    if (mSpawn) {
                        let args = mSpawn[1].split(",").map(s => s.trim().replace(/^['"]|['"]$/g, ''));
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
                    let mSpawnRing = trimmed.match(/^spawnRing\((.*?)\)$/i);
                    if (mSpawnRing) {
                        let args = mSpawnRing[1].split(",").map(s => s.trim().replace(/^['"]|['"]$/g, ''));
                        let isLegacy = args.length === 5 && (args[2] === '6' || args[2] === '8' || args[2] === '12');
                        block = {
                            type: 'spawn_ring',
                            params: {
                                bulletType: args[0] || 'normal',
                                color: args[1] || '#ff3333',
                                speed: isLegacy ? (args[3] || '200') : (args[2] || '200'),
                                count: isLegacy ? (args[4] || '12') : (args[3] || '12'),
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
                    let mSpawnWay = trimmed.match(/^spawnWay\((.*?)\)$/i);
                    if (mSpawnWay) {
                        let args = mSpawnWay[1].split(",").map(s => s.trim().replace(/^['"]|['"]$/g, ''));
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
                    let mSpawnMC = trimmed.match(/^spawnMagicCircle\((.*?)\)$/i);
                    if (mSpawnMC) {
                        let args = mSpawnMC[1].split(",").map(s => s.trim().replace(/^['"]|['"]$/g, ''));
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
                    if (!block) {
                        let mChange = trimmed.match(/^(\w+)\s*([+\-])=\s*(.+)$/);
                        if (mChange) block = { type: 'change_var', params: { name: mChange[1], op: mChange[2], value: mChange[3] }, indent };
                        else {
                            let mConst = trimmed.match(/^const\s+(\w+)\s*=\s*(.+)$/);
                            if (mConst) block = { type: 'const_var', params: { name: mConst[1], value: mConst[2] }, indent };
                            else { let mSet = trimmed.match(/^(\w+)\s*=\s*(.+)$/); if (mSet) block = { type: 'set_var', params: { name: mSet[1], value: mSet[2] }, indent }; }
                        }
                    }
                    return block;
                };

                // ブロックを平坦リストへ追加
                let block = makeBlock(trimmed, indent);
                if (block) blocks.push(block);
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
                let cleanLine = stripComments(rawLine);
                const t = cleanLine.trim();
                if (!t) return;
                if (t === '{') { depth++; return; }
                if (t === '}') { depth = Math.max(0, depth - 1); return; }
                // 行末 { が残っていたら深さを増やして除去
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
                indent = Math.max(0, Math.min(3, indent));
                
                let cleanLine = stripComments(line);
                let trimmed = cleanLine.trim();
                // セミコロン、行末の波括弧を除去
                trimmed = trimmed.replace(/;+$/, "").trim();
                trimmed = trimmed.replace(/\{\s*$/, "").trim();
                
                if (trimmed === "" || trimmed === "{" || trimmed === "}") return;
                
                let block = null;
                
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
                let mAim = trimmed.match(/^aimAtTarget\(\)$/i);
                if (mAim) {
                    block = { type: 'aim_at_target', params: {}, indent: indent };
                }
                let mMoveOwner = trimmed.match(/^moveTo\((.*?)\)$/i);
                if (mMoveOwner) {
                    let args = mMoveOwner[1].split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
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
                    let args = mSlideOwner[1].split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
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
                    let args = mTween[2].split(",").map(s => {
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
                    block = {
                        type: isWait ? 'tween_var_wait' : 'tween_var',
                        params: {
                            name: varName,
                            from: fromVal,
                            to: toVal,
                            mode: mode,
                            duration: mode !== 'step' ? modeVal : '1',
                            stepVal: mode === 'step' ? modeVal : '5'
                        },
                        indent: indent
                    };
                }
                let mSlow = trimmed.match(/^slow\((.*?)\)$/i);
                if (mSlow) { let args = mSlow[1].split(',').map(s => s.trim()); block = { type: 'speed_scale', params: { mode: 'slow', effect: args[0] || '0.5', delay: args[1] || '0' }, indent: indent }; }
                let mFast = trimmed.match(/^fast\((.*?)\)$/i);
                if (mFast) { let args = mFast[1].split(',').map(s => s.trim()); block = { type: 'speed_scale', params: { mode: 'fast', effect: args[0] || '2', delay: args[1] || '0' }, indent: indent }; }
                let mSpawn = trimmed.match(/^spawnBullet\((.*?)\)$/i);
                if (mSpawn) {
                    let args = mSpawn[1].split(",").map(s => {
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
                let mSpawnRing = trimmed.match(/^spawnRing\((.*?)\)$/i);
                if (mSpawnRing) {
                    let args = mSpawnRing[1].split(",").map(s => {
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
                            count: isLegacy ? (args[4] || '12') : (args[3] || '12'),
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
                let mSpawnWay = trimmed.match(/^spawnWay\((.*?)\)$/i);
                if (mSpawnWay) {
                    let args = mSpawnWay[1].split(",").map(s => {
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
                let mSpawnMC = trimmed.match(/^spawnMagicCircle\((.*?)\)$/i);
                if (mSpawnMC) {
                    let args = mSpawnMC[1].split(",").map(s => {
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
                        let mConst = trimmed.match(/^const\s+(\w+)\s*=\s*(.+)$/);
                            if (mConst) { block = { type: 'const_var', params: { name: mConst[1].trim(), value: mConst[2].trim() }, indent: indent }; }
                            else { let mSet = trimmed.match(/^(\w+)\s*=\s*(.+)$/); if (mSet) { block = { type: 'set_var', params: { name: mSet[1].trim(), value: mSet[2].trim() }, indent: indent }; } }
                    }
                }
                
                if (block) {
                    blocks.push(block);
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