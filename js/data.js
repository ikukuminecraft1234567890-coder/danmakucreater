        function normalizeDifficulty(diff) {
            if (!diff) return 'NORMAL';
            let d = diff.toString().toUpperCase().trim();
            if (d === 'E' || d === 'EASY') return 'EASY';
            if (d === 'N' || d === 'NORMAL') return 'NORMAL';
            if (d === 'H' || d === 'HARD') return 'HARD';
            if (d === 'L' || d === 'LUNATIC') return 'LUNATIC';
            
            if (d.includes('EASY')) return 'EASY';
            if (d.includes('HARD')) return 'HARD';
            if (d.includes('LUNATIC')) return 'LUNATIC';
            if (d.includes('NORMAL')) return 'NORMAL';
            
            return 'NORMAL';
        }
        window.normalizeDifficulty = normalizeDifficulty;

        window.showDebugProfiler = false;
        let currentEditingDeck = null;
        let isGameRunning = false;
        let cpuDifficulty = 'NORMAL'; // 'EASY', 'NORMAL', 'HARD', 'LUNATIC'
        window.cpuDifficulty = cpuDifficulty;
        window.currentDifficulty = cpuDifficulty;
        let activeSelectSlotType = null; // 'active' or 'passive'
        let activeSelectSlotIndex = null; // 0-4 or 0-2

        // ==========================================
        // キーコンフィグ ＆ ゲームパッド管理システム
        // ==========================================
        let keyConfig = {
            moveUp: 'ArrowUp',
            moveDown: 'ArrowDown',
            moveLeft: 'ArrowLeft',
            moveRight: 'ArrowRight',
            slowMove: 'Shift',
            castSpell: ' ',
            bomb: 'x',
            card1: '1',
            card2: '2',
            card3: '3',
            card4: '4',
            card5: '5',
            card6: '6'
        };

        const keyLabels = {
            moveUp: '移動：上',
            moveDown: '移動：下',
            moveLeft: '移動：左',
            moveRight: '移動：右',
            slowMove: '低速移動(自機)',
            castSpell: '弾幕展開(決定)',
            bomb: '霊撃(ボム)',
            card1: 'カード1選択',
            card2: 'カード2選択',
            card3: 'カード3選択',
            card4: 'カード4選択',
            card5: 'カード5選択',
            card6: 'カード6選択'
        };

        let activeConfiguringKey = null;
        let activeConfiguringGamepadAction = null;
        let focusedCardIndex = 0; // PLANNINGフェーズ時のカードフォーカス選択（ゲームパッド用）

        let gamepadConfig = {
            slowMove: 7,   // R2
            castSpell: 3,  // Y
            bomb: 1,       // B (Button 1)
            cardPrev: 4,   // L1
            cardNext: 5,   // R1
            confirm: 0     // A
        };

// ==========================================
        // オンライン対戦 (P2P / PeerJS) 管理システム
        // ==========================================
        let peer = null;
        let conn = null;
        let isOnlineMode = false;
        let onlineRole = null; // 'host' or 'client'
        let onlineConnected = false;
        let opponentDeck = null;
        let connectionTimeoutId = null;
        let hostTimeoutId = null;
        let currentHostedRoomCode = null;

        // 同期用バッファ
        let receivedState = null;
        let receivedCastIds = null;
        let receivedBomb = false;
        let sentDamageSync = false;
        let receivedDamageSync = false;

        // スマホ用タッチ操作バッファ・トグル変数
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartPlayerX = 0;
        let touchStartPlayerY = 0;
        let isDragging = false;
        let mobileSlowActive = false;
        let mobileBombTriggered = false;
        let mobileTargetX = null;
        let mobileTargetY = null;

        // ==========================================
        // UI・デッキ管理システム (ビジュアル化)
        // ==========================================
        const defaultCards = {
            active: [
                { id: 'a1', name: '【A】星弓「スターボウ」', duration: 15, pattern: 'starbow', interval: 0.28, cost: 4, desc: '【移植スペル】五方に放たれた虹色の光弾が、光の尾を残しながら美しく大旋回する。' },
                { id: 'a2', name: '【A】獄符「ヘルカーブ」', duration: 15, pattern: 'hellcurve', interval: 0.15, cost: 2, desc: '【移植スペル】相手に向けて交差するように、赤と黄の対の螺旋を描くカーブ弾を連射する。' },
                { id: 'a3', name: '【A】狙い3WAY弾', duration: 15, pattern: '3way', interval: 0.12, cost: 1, desc: '相手に向かって扇状に広がる大粒の3方向狙い弾を超高速連射する。' },
                { id: 'a4', name: '【A】設置弾', duration: 20, pattern: 'place', interval: 0.8, cost: 1, desc: 'ゆっくり漂う巨大な設置型の球体を放つ。' },
                { id: 'a5', name: '【A】高密度弾', duration: 15, pattern: 'dense', interval: 0.25, cost: 2, desc: '前方へ扇状に密度の高い弾を連射する。' },
                // 靈刻門からの移植スペル
                { id: 'a6', name: '【A】エボリューション', duration: 16, pattern: 'evolution', interval: 0.45, cost: 3, desc: '【靈刻門】直進する親弾から左右に子弾が分裂する。' },
                { id: 'a7', name: '【A】消える魔球', duration: 14, pattern: 'vanishing', interval: 0.5, cost: 2, desc: '【靈刻門】静止後、赤く輝き超高速で相手を再追尾する。' },
                { id: 'a8', name: '【A】スパイラル', duration: 10, pattern: 'spiral', interval: 0.08, cost: 1, desc: '【靈刻門】回転しながら全方位へ放ち、途中で逆回転する。' },
                { id: 'a9', name: '【A】クロスカーブ', duration: 15, pattern: 'cross', interval: 0.9, cost: 2, desc: '【新スペル】発射時の相手方向を基準に、後方から放たれた大量の弾がゆっくりカーブして美しくX字クロスする。' },
                { id: 'a10', name: '【A】霊符「夢想妙珠」', duration: 15, pattern: 'myouju', interval: 3.5, cost: 4, desc: '【博麗霊夢】自機の周囲を回転しながら広がり、その後相手を強力に自動追尾する虹色の光弾を放つ。' },
                { id: 'a11', name: '【A】恋符「マスタースパーク」', duration: 26, pattern: 'masterspark', interval: 99.0, cost: 4, desc: '【霧雨魔理沙】移動速度が激減する代わりに、画面を埋め尽くす極太の七色ビームを前方に照射する。' },
                { id: 'a12', name: '【A】神槍「スピア・オブ・グングニル」', duration: 8, pattern: 'gungnir', interval: 1.2, cost: 7, desc: '【レミリア】全てを貫通する超高速の紅い槍を投げ、衝突時に大爆発を起こして破片を撒き散らす。' },
                { id: 'a13', name: '【A】突符「チャージ曲がり角」', duration: 15, pattern: 'charge_corner', interval: 0.3, cost: 7, desc: '【靈刻門】放射状に放たれた弾が一度静止し、直角に分裂して急加速する。' },
                { id: 'a14', name: '【A】「オーバードライブ」', duration: 20, pattern: 'overdrive', interval: 22.0, cost: 6, desc: '【靈刻門】極限の弾幕。周囲を回る赤弾のチャージ突進、交差する格子弾幕、最後に跳ね返る桜弾の3フェーズを連続展開する。' }
            ],
            ability: [
                { id: 'ab1', name: '【急】霊力充填', desc: '【即時アビリティ】自身のボム（霊撃）を即座に1つ回復する。' },
                { id: 'ab2', name: '【急】生命息吹', desc: '【即時アビリティ】自身のHPを200即座に回復する。' },
                { id: 'ab3', name: '【急】精神統一', desc: '【即時アビリティ】次の相手の弾幕フェーズ中に受けるダメージをすべて半減するシールドを展開する。' },
                { id: 'ab4', name: '【急】波状爆撃', desc: '【即時アビリティ】相手に60ポイントの即時直接ダメージを与える。' },
                { id: 'ab5', name: '【急】瞬間結界', desc: '【即時アビリティ】即座に1.5秒間の完全無敵状態になる。' },
                { id: 'ab6', name: '【急】霊力還元', desc: '【即時アビリティ】グレイズ数を即座に+150し、自身のHPを50回復する。' }
            ],
            passive: [
                { id: 'p1', name: '【P】被弾軽減', desc: '受ける被弾ダメージを毎回20ポイント軽減する。' },
                { id: 'p2', name: '【P】移動支援', desc: '自機・敵機の通常移動速度が大幅にアップする。' },
                { id: 'p3', name: '【P】かすり拡大', desc: 'グレイズ（掠り判定）の範囲が1.5倍に拡大する。' },
                { id: 'p4', name: '【P】霊撃増幅', desc: 'ボム（霊撃）の初期所持数と最大数が＋1される。' },
                { id: 'p5', name: '【P】かすり回復', desc: 'グレイズ数が500の倍数に達するたびに、ボム（霊撃）が1つ回復する。' },
                { id: 'p6', name: '【P】かすり治癒', desc: 'グレイズ（掠り）が発生したとき、50%の確率で自身のHPが1回復する。' },
                { id: 'p7', name: '【P】豊穣の守り', desc: 'HPが25%以下になったとき、一度だけHPを300即座に回復する。' },
                { id: 'p8', name: '【P】死中活路', desc: '所持ボム（霊撃）が0のとき、相手に与える弾幕ダメージが1.25倍になる。' },
                { id: 'p9', name: '【P】縮地・神風', desc: '自機の移動速度（通常・低速ともに）が常時12%上昇する。' },
                { id: 'p10', name: '【P】霊力還元', desc: 'グレイズ時に1%の超低確率でボム（霊撃）が即座に1つ回復する。' },
                { id: 'p11', name: '【P】八卦の加護', desc: 'ボム（霊撃）展開時の無敵時間が通常2.0秒から3.0秒に延長される。' },
                { id: 'p12', name: '【P】金剛身', desc: '最大HPの上限が 1000 ➔ 1200 に増加する。' },
                { id: 'p13', name: '【P】自然治癒', desc: '毎ターンの精算（RESOLUTION）時にHPを30自動回復する。' },
                { id: 'p14', name: '【P】気炎万丈', desc: '自身が相手に与える蓄積ダメージが常時10%増加する。' },
                { id: 'p15', name: '【P】弾幕結界', desc: '相手がスペルカードを発動したターン、自身が受ける被弾ダメージを毎回15ポイント軽減する。' },
                { id: 'p16', name: '【P】背水の陣', desc: '自身のHPが300以下のとき、相手に与える蓄積ダメージが25%増加する。' },
                { id: 'p17', name: '【P】金剛結界', desc: '自身のHPが300以下のとき、被弾ダメージが20%軽減される。' },
                { id: 'p18', name: '【P】韋駄天', desc: '低速移動（Shiftキー/スローボタン）時の移動速度が25%上昇する。' },
                { id: 'p19', name: '【P】乾坤一擲', desc: '自分がボム（霊撃）を発動した際、相手に即座に30のダメージを与える。' },
                { id: 'p20', name: '【P】霊力節約', desc: 'ボム（霊撃）を発動したとき、8%の確率でボム残数が消費されない。' },
                { id: 'p21', name: '【P】吸血の牙', desc: '累計20回グレイズするごとに、自身のHPが10回復する。' },
                { id: 'p22', name: '【P】憤怒の炎', desc: '被弾ダメージを受けた次のターン、与える蓄積ダメージが20%増加する。' },
                { id: 'p23', name: '【P】幸運のダイス', desc: '毎ターン開始時、10%の確率で「1.5秒間の完全無敵」または「ボム1個回復」が発動する。' },
                { id: 'p24', name: '【P】共鳴波動', desc: '境界の歪み（ターンスケール）による相手のダメージ倍率の増加量が15%上昇する。' },
                { id: 'p25', name: '【P】絶体絶命', desc: 'HPが0になるダメージを受けた時、一度だけHP1で踏みとどまり1.5秒間無敵になる。' },
                { id: 'p26', name: '【P】霊素調和', desc: 'ターン開始時に20%の確率でボムが1回復する。' }
            ]
        };

        // --- CUSTOM SPELL CARD SYSTEM ---
        const CUSTOM_CARD_COST_LIMIT = 30;
        const CUSTOM_CARD_PLAY_COST_DIVISOR = 2;
        const CUSTOM_SPAWN_WAY_MAX_COUNT = 9999;
        const CUSTOM_SPAWN_RING_MAX_COUNT = 9999;
        let customCards = [];
        let onlineCustomCards = [];
        let isCustomCardTesting = false;
        let customCardTestEmitterDone = false; // エミッター停止後、弾が消えるまで待つフラグ
        let customCardDeathEffect = null; // 死亡エフェクト { timer: 残り秒数, particles: [] }
        let customCardMaker = {
            editingId: null,
            name: 'カスタムスペル',
            desc: 'オリジナルの弾幕パターン。',
            duration: 15,
            activeTab: 'emitter', // 'emitter' or 'bullet' or 'bounce'
            emitterScript: [
                { type: 'repeat', params: { count: '12' }, indent: 0 },
                { type: 'spawn_bullet', params: { bulletType: 'normal', color: '#ff3333', radius: '6', speed: '200', angle: 'angle' }, indent: 1 },
                { type: 'change_var', params: { name: 'angle', value: '30' }, indent: 1 },
                { type: 'wait', params: { duration: '0.2' }, indent: 1 }
            ],
            bulletScript: [],
            bounceScript: [],
            testPassed: false
        };

        function getCustomCardPlayCost(rawCost) {
            return Math.max(1, Math.ceil((Number(rawCost) || 1) / CUSTOM_CARD_PLAY_COST_DIVISOR));
        }

        function getCustomCardDuration(value) {
            let duration = Number(value);
            if (!Number.isFinite(duration) || duration <= 0) duration = 15;
            return Math.max(1, Math.min(120, duration));
        }

        function applyCustomCardCosts(cc, recalc = false) {
            let rawCost = Number(cc.rawCost);
            if (recalc) {
                rawCost = calculateCustomCardCost(cc.emitterScript, cc.bulletScript);
            } else if (!Number.isFinite(rawCost) || rawCost <= 0) {
                rawCost = Math.max(1, Number(cc.cost) || estimateCustomCardEditCost(cc.emitterScript || [], cc.bulletScript || []));
            }
            cc.rawCost = rawCost;
            cc.cost = getCustomCardPlayCost(rawCost);
            cc.duration = getCustomCardDuration(cc.duration);
            return cc;
        }

        function migrateOldCustomCard(cc) {
            let changed = false;
            
            // bounceブロックをif文4つに分解する処理は、PLAY_WIDTH(600)/canvas.height(480)とのズレや下端反射バグの原因となるため削除。
            // 現在はネイティブの bounce() アクションが正しく動作するため、ブロックのまま維持します。
            
            if (cc.bounceScript && cc.bounceScript.length > 0) {
                changed = true;
                // 右端は790から590（PLAY_WIDTH-10）に修正。下端（y > 890）は反射除外のため削除（3辺反射へ）。
                const conds = ['x < 10', 'x > 590', 'y < 10'];
                const angles = ['180 - angle', '180 - angle', '-angle'];
                
                let combinedList = [];
                for (let i = 0; i < 3; i++) {
                    combinedList.push({ type: 'if', params: { cond: conds[i] }, indent: 0 });
                    combinedList.push({ type: 'set_var', params: { name: 'angle', value: angles[i] }, indent: 1 });
                    cc.bounceScript.forEach(b => {
                        let newB = JSON.parse(JSON.stringify(b));
                        newB.indent = (newB.indent || 0) + 1;
                        combinedList.push(newB);
                    });
                }
                
                cc.bulletScript.push(...combinedList);
                cc.bounceScript = [];
            }
            if (cc.x_offset === undefined) {
                cc.x_offset = 0;
                changed = true;
            }
            if (cc.y_offset === undefined) {
                cc.y_offset = 0;
                changed = true;
            }
            if (cc.magicCircleScript === undefined) {
                cc.magicCircleScript = [];
                changed = true;
            }
            if (cc.despawnTime === undefined) {
                cc.despawnTime = 1.5;
                changed = true;
            }
            if (cc.maxMisses === undefined) {
                cc.maxMisses = 2;
                changed = true;
            }
            if (cc.difficulty === undefined) {
                cc.difficulty = 'NORMAL';
                changed = true;
            } else {
                let normalized = normalizeDifficulty(cc.difficulty);
                if (normalized !== cc.difficulty) {
                    cc.difficulty = normalized;
                    changed = true;
                }
            }
            if (changed) {
                applyCustomCardCosts(cc);
            }
            return cc;
        }

        try {
            const saved = localStorage.getItem('touhou_kyoukaisen_custom_cards');
            if (saved) {
                const parsedCards = JSON.parse(saved);
                customCards = parsedCards.map(card => {
                    try {
                        return migrateOldCustomCard(card);
                    } catch (cardError) {
                        console.error('Failed to migrate custom card:', cardError, card);
                        return null;
                    }
                }).filter(Boolean);
            }
        } catch(e) {
            console.error('Failed to load custom cards:', e);
            customCards = [];
        }

        function pushIntegratedCustomCard(cc) {
            let migrated = migrateOldCustomCard(cc);
            defaultCards.active = defaultCards.active.filter(c => c.id !== migrated.id);
            defaultCards.active.push({
                id: migrated.id,
                name: migrated.name,
                duration: getCustomCardDuration(migrated.duration),
                pattern: migrated.id,
                interval: 0.1,
                cost: migrated.cost,
                rawCost: migrated.rawCost || migrated.cost,
                desc: migrated.desc,
                isCustom: true,
                difficulty: migrated.difficulty || 'NORMAL',
                emitterScript: migrated.emitterScript,
                bulletScript: migrated.bulletScript,
                magicCircleScript: migrated.magicCircleScript || []
            });
        }

        function serializeCustomCardsForDeck(cardIds) {
            const idSet = new Set((cardIds || []).filter(Boolean));
            return customCards
                .filter(c => idSet.has(c.id))
                .map(c => {
                    let migrated = migrateOldCustomCard(c);
                    return {
                        id: migrated.id,
                        name: migrated.name,
                        duration: getCustomCardDuration(migrated.duration),
                        rawCost: migrated.rawCost || migrated.cost,
                        cost: migrated.cost,
                        desc: migrated.desc,
                        isCustom: true,
                        difficulty: migrated.difficulty || 'NORMAL',
                        emitterScript: JSON.parse(JSON.stringify(migrated.emitterScript || [])),
                        bulletScript: JSON.parse(JSON.stringify(migrated.bulletScript || [])),
                        magicCircleScript: JSON.parse(JSON.stringify(migrated.magicCircleScript || []))
                    };
                });
        }

        function integrateOnlineCustomCards(cards) {
            onlineCustomCards = Array.isArray(cards) ? cards.map(c => migrateOldCustomCard(c)) : [];
            integrateCustomCards();
        }

        function integrateCustomCards() {
            // Remove existing custom cards in defaultCards.active first
            defaultCards.active = defaultCards.active.filter(c => !c.isCustom);
            customCards.forEach(cc => pushIntegratedCustomCard(cc));
            onlineCustomCards.forEach(cc => pushIntegratedCustomCard(cc));
        }
        document.addEventListener('DOMContentLoaded', () => {
            integrateCustomCards();
            if (typeof checkUrlParams === 'function') {
                checkUrlParams();
            }
        });
        // --------------------------------

        let editingDeckIndex = -1; // -1:新規作成, >=0:編集中のデッキインデックス
        let activeEffects = []; // 戦闘中のパッシブ等の発動エフェクト表示用
        let screenShakeAmount = 0; // 画面揺れ（地震エフェクト）の強度管理用

        function addBattleEffect(text, color = '#ffcc00') {
            activeEffects.push({
                text: text,
                timer: 2.0,
                maxTime: 2.0,
                color: color
            });
        }

        let decks = []; // 保存されたデッキ一覧
        let selectedDeckIndex = 0; // 現在選択中のバトル用アクティブデッキのインデックス

        // ローカルストレージからデッキ一覧・選択インデックスをロード
        try {
            const savedDecks = localStorage.getItem('touhou_kyoukaisen_decks');
            if (savedDecks) {
                decks = JSON.parse(savedDecks);
                decks.forEach(d => {
                    if (!d.ability) {
                        d.ability = ["ab1", "ab2", "ab3", "ab4", "ab5", "ab6"];
                    }
                });
            }
            const savedSelectedDeckIndex = localStorage.getItem('touhou_kyoukaisen_selected_deck_index');
            if (savedSelectedDeckIndex !== null) {
                selectedDeckIndex = parseInt(savedSelectedDeckIndex, 10);
            } else if (decks.length > 0) {
                selectedDeckIndex = decks.length - 1; // デフォルトで最後のデッキ
            }
        } catch (e) { }



        const gamepadLabels = {
            slowMove: '低速移動(自機)',
            castSpell: '弾幕展開(決定)',
            bomb: '霊撃(ボム)',
            cardPrev: 'フォーカス左移動',
            cardNext: 'フォーカス右移動',
            confirm: 'カード選択/決定'
        };

        let prevGamepadAxes = [];

        function getGamepadButtonLabel(bIndex) {
            const labels = {
                0: 'A / Button 0',
                1: 'B / Button 1',
                2: 'X / Button 2',
                3: 'Y / Button 3',
                4: 'L1 / LB',
                5: 'R1 / RB',
                6: 'L2 / LT',
                7: 'R2 / RT',
                8: 'Select / Back',
                9: 'Start / Options',
                10: 'LStick Button',
                11: 'RStick Button',
                12: 'D-Pad Up',
                13: 'D-Pad Down',
                14: 'D-Pad Left',
                15: 'D-Pad Right'
            };
            return labels[bIndex] !== undefined ? labels[bIndex] : `Button ${bIndex}`;
        }

        // ローカルストレージからキー設定・ゲームパッド設定・当たり判定色設定ロード
        window.hitboxColorSetting = 'red';
        window.seVolumeSetting = 30; // デフォルト30%
        try {
            const savedKeys = localStorage.getItem('touhou_kyoukaisen_keys');
            if (savedKeys) {
                keyConfig = Object.assign(keyConfig, JSON.parse(savedKeys));
            }
            const savedSEVolume = localStorage.getItem('touhou_kyoukaisen_se_volume');
            if (savedSEVolume !== null) {
                window.seVolumeSetting = parseInt(savedSEVolume, 10);
            }
            if (window.soundManager) {
                window.soundManager.setVolume(window.seVolumeSetting / 100);
            }
            const savedGamepad = localStorage.getItem('touhou_kyoukaisen_gamepad');
            if (savedGamepad) {
                gamepadConfig = Object.assign(gamepadConfig, JSON.parse(savedGamepad));
            }
            const savedHitboxColor = localStorage.getItem('touhou_kyoukaisen_hitbox_color');
            if (savedHitboxColor) {
                window.hitboxColorSetting = savedHitboxColor;
            }
        } catch (e) { }

        function renderKeyConfig() {
            const container = document.getElementById('key-config-container');
            if (!container) return;
            container.innerHTML = '';

            Object.keys(keyConfig).forEach(action => {
                const row = document.createElement('div');
                row.style.display = 'flex';
                row.style.justifyContent = 'space-between';
                row.style.alignItems = 'center';
                row.style.width = '100%';
                row.style.padding = '6px 12px';
                row.style.background = 'rgba(255, 255, 255, 0.05)';
                row.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                row.style.borderRadius = '4px';
                row.style.boxSizing = 'border-box';

                const label = document.createElement('span');
                label.textContent = keyLabels[action];
                label.style.fontSize = '12px';
                label.style.color = '#e0e0e8';

                const btn = document.createElement('button');
                const val = keyConfig[action] === ' ' ? 'Space' : keyConfig[action];
                btn.textContent = val;
                btn.style.width = '110px';
                btn.style.padding = '4px';
                btn.style.fontSize = '12px';
                btn.style.background = '#151525';
                btn.style.color = '#00ffcc';
                btn.style.border = '1px solid #005544';
                btn.style.borderRadius = '4px';
                btn.style.cursor = 'pointer';
                btn.style.fontWeight = 'bold';

                if (activeConfiguringKey === action) {
                    btn.textContent = '入力待機...';
                    btn.style.background = '#331111';
                    btn.style.color = '#ff8888';
                    btn.style.borderColor = '#ff4444';
                }

                btn.onclick = () => {
                    activeConfiguringGamepadAction = null; // ゲームパッド入力をキャンセル
                    activeConfiguringKey = action;
                    renderKeyConfig();
                    renderGamepadConfig();
                };

                row.appendChild(label);
                row.appendChild(btn);
                container.appendChild(row);
            });
        }

        function renderGamepadConfig() {
            const container = document.getElementById('gamepad-config-container');
            if (!container) return;
            container.innerHTML = '';

            Object.keys(gamepadConfig).forEach(action => {
                const row = document.createElement('div');
                row.style.display = 'flex';
                row.style.justifyContent = 'space-between';
                row.style.alignItems = 'center';
                row.style.width = '100%';
                row.style.padding = '6px 12px';
                row.style.background = 'rgba(255, 255, 255, 0.05)';
                row.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                row.style.borderRadius = '4px';
                row.style.boxSizing = 'border-box';

                const label = document.createElement('span');
                label.textContent = gamepadLabels[action];
                label.style.fontSize = '12px';
                label.style.color = '#e0e0e8';

                const btn = document.createElement('button');
                const bVal = gamepadConfig[action];
                btn.textContent = getGamepadButtonLabel(bVal);
                btn.style.width = '130px';
                btn.style.padding = '4px';
                btn.style.fontSize = '12px';
                btn.style.background = '#151525';
                btn.style.color = '#00ffcc';
                btn.style.border = '1px solid #005544';
                btn.style.borderRadius = '4px';
                btn.style.cursor = 'pointer';
                btn.style.fontWeight = 'bold';

                if (activeConfiguringGamepadAction === action) {
                    btn.textContent = 'ボタン入力待機...';
                    btn.style.background = '#331111';
                    btn.style.color = '#ff8888';
                    btn.style.borderColor = '#ff4444';
                }

                btn.onclick = () => {
                    activeConfiguringKey = null; // キーボード入力をキャンセル
                    activeConfiguringGamepadAction = action;
                    renderKeyConfig();
                    renderGamepadConfig();
                };

                row.appendChild(label);
                row.appendChild(btn);
                container.appendChild(row);
            });
        }

        // キーコンフィグ画面用キーボードキャプチャ
        window.addEventListener('keydown', e => {
            if (activeConfiguringKey) {
                e.preventDefault();
                keyConfig[activeConfiguringKey] = e.key;
                activeConfiguringKey = null;
                renderKeyConfig();
            }
        });

        // 能動的ゲームパッドキーキャプチャ用ポーラ
        setInterval(() => {
            if (!activeConfiguringGamepadAction) return;
            const gamepads = navigator.getGamepads();
            for (let i = 0; i < gamepads.length; i++) {
                const gp = gamepads[i];
                if (gp) {
                    for (let bIndex = 0; bIndex < gp.buttons.length; bIndex++) {
                        if (gp.buttons[bIndex] && gp.buttons[bIndex].pressed) {
                            gamepadConfig[activeConfiguringGamepadAction] = bIndex;
                            activeConfiguringGamepadAction = null;
                            renderKeyConfig();
                            renderGamepadConfig();
                            break;
                        }
                    }
                }
            }
        }, 50);

        function saveKeyConfigAndSettings() {
            const select = document.getElementById('setting-hitbox-color');
            if (select) {
                window.hitboxColorSetting = select.value;
                try {
                    localStorage.setItem('touhou_kyoukaisen_hitbox_color', window.hitboxColorSetting);
                } catch (e) {}
            }
            const volumeSlider = document.getElementById('setting-se-volume');
            if (volumeSlider) {
                window.seVolumeSetting = parseInt(volumeSlider.value, 10);
                try {
                    localStorage.setItem('touhou_kyoukaisen_se_volume', window.seVolumeSetting.toString());
                } catch (e) {}
                if (window.soundManager) {
                    window.soundManager.setVolume(window.seVolumeSetting / 100);
                }
            }
            try {
                localStorage.setItem('touhou_kyoukaisen_keys', JSON.stringify(keyConfig));
                localStorage.setItem('touhou_kyoukaisen_gamepad', JSON.stringify(gamepadConfig));
                alert('設定を保存しました！');
                showScreen('screen-menu');
            } catch (e) {
                alert('保存に失敗しました。');
            }
        }
        function updateSEVolumeDisplay(value) {
            const display = document.getElementById('se-volume-value');
            if (display) {
                display.textContent = value + '%';
            }
        }
        window.updateSEVolumeDisplay = updateSEVolumeDisplay;
        window.saveKeyConfigAndSettings = saveKeyConfigAndSettings;

        function openConfigScreen() {
            showScreen('screen-config');
            renderKeyConfig();
            renderGamepadConfig();
            const volumeSlider = document.getElementById('setting-se-volume');
            if (volumeSlider) {
                volumeSlider.value = window.seVolumeSetting;
            }
            updateSEVolumeDisplay(window.seVolumeSetting);
            const select = document.getElementById('setting-hitbox-color');
            if (select) {
                select.value = window.hitboxColorSetting || 'red';
            }
        }
        window.openConfigScreen = openConfigScreen;

        function resetKeyConfig() {
            if (confirm('設定をすべて初期化しますか？')) {
                keyConfig = {
                    moveUp: 'ArrowUp',
                    moveDown: 'ArrowDown',
                    moveLeft: 'ArrowLeft',
                    moveRight: 'ArrowRight',
                    slowMove: 'Shift',
                    castSpell: ' ',
                    bomb: 'x',
                    card1: '1',
                    card2: '2',
                    card3: '3',
                    card4: '4',
                    card5: '5',
                    card6: '6'
                };
                gamepadConfig = {
                    slowMove: 7,   // R2
                    castSpell: 3,  // Y
                    bomb: 1,       // B
                    cardPrev: 4,   // L1
                    cardNext: 5,   // R1
                    confirm: 0     // A
                };
                activeConfiguringKey = null;
                activeConfiguringGamepadAction = null;
                renderKeyConfig();
                renderGamepadConfig();

                window.seVolumeSetting = 30;
                try {
                    localStorage.setItem('touhou_kyoukaisen_se_volume', '30');
                } catch (e) {}
                if (window.soundManager) {
                    window.soundManager.setVolume(0.3);
                }
                const volumeSlider = document.getElementById('setting-se-volume');
                if (volumeSlider) {
                    volumeSlider.value = 30;
                }
                updateSEVolumeDisplay(30);
            }
        }

        // PLANNINGフェーズ時のカードフォーカス移動
        function moveCardFocus(dir) {
            if (player.hand.length === 0) return;
            focusedCardIndex = (focusedCardIndex + dir + player.hand.length) % player.hand.length;
            renderHand();
        }

        // 新機能: アナログスティック/十字キーの上下操作によるカードの縦移動（改行対応）
        function moveCardFocusVertical(dir) {
            const elements = document.querySelectorAll('.hand-card');
            if (elements.length === 0 || focusedCardIndex < 0 || focusedCardIndex >= elements.length) return;

            const currentRect = elements[focusedCardIndex].getBoundingClientRect();
            const curX = currentRect.left + currentRect.width / 2;
            const curY = currentRect.top + currentRect.height / 2;

            let bestIndex = -1;
            let minDistance = Infinity;

            for (let i = 0; i < elements.length; i++) {
                if (i === focusedCardIndex) continue;
                const rect = elements[i].getBoundingClientRect();
                const targetX = rect.left + rect.width / 2;
                const targetY = rect.top + rect.height / 2;

                if (dir === 1) { // DOWN: 下の行を探す
                    if (targetY > curY + 20) {
                        const dist = Math.abs(targetX - curX);
                        if (dist < minDistance) {
                            minDistance = dist;
                            bestIndex = i;
                        }
                    }
                } else if (dir === -1) { // UP: 上の行を探す
                    if (targetY < curY - 20) {
                        const dist = Math.abs(targetX - curX);
                        if (dist < minDistance) {
                            minDistance = dist;
                            bestIndex = i;
                        }
                    }
                }
            }

            if (bestIndex !== -1) {
                focusedCardIndex = bestIndex;
                renderHand();
            }
        }

        function toggleFocusedCard() {
            if (focusedCardIndex >= 0 && focusedCardIndex < player.hand.length) {
                selectPlayerCard(focusedCardIndex);
            }
        }

        // 仮想フォーカスシステム (メニュー画面でのキーボード・コントローラー操作用)
        let uiFocusElements = [];
        let uiFocusedIndex = -1;

        function scanUIFocusElements() {
            const screens = [
                'screen-menu',
                'screen-deck-list',
                'screen-deck-edit',
                'screen-key-config'
            ];

            let activeScreenId = null;
            const titleScreen = document.getElementById('titleScreen');
            if (titleScreen && titleScreen.style.display !== 'none') {
                for (const id of screens) {
                    const scr = document.getElementById(id);
                    if (scr && !scr.classList.contains('hidden')) {
                        activeScreenId = id;
                        break;
                    }
                }
            }

            // 古いフォーカスのクリア
            uiFocusElements.forEach(el => {
                el.classList.remove('ui-focused');
                el.style.boxShadow = '';
                el.style.transform = '';
                el.style.borderColor = '';
            });

            uiFocusElements = [];
            uiFocusedIndex = -1;

            if (!activeScreenId) return;

            const scr = document.getElementById(activeScreenId);
            if (!scr) return;

            // クエリ対象とするインタラクティブなセレクタ
            const candidates = scr.querySelectorAll('button, [onclick], input, select, .deck-slot, .card-item');
            candidates.forEach(el => {
                const rect = el.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0 && !el.disabled && !el.classList.contains('hidden') && window.getComputedStyle(el).opacity > 0.1) {
                    uiFocusElements.push(el);
                }
            });

            if (uiFocusElements.length > 0) {
                uiFocusedIndex = 0;
                highlightFocusedUIElement();
            }
        }

        function highlightFocusedUIElement() {
            uiFocusElements.forEach((el, idx) => {
                if (idx === uiFocusedIndex) {
                    el.classList.add('ui-focused');
                    el.style.outline = 'none';
                    el.style.border = '1px solid #00ffcc';
                    el.style.boxShadow = '0 0 15px rgba(0, 255, 200, 0.8), inset 0 0 5px rgba(0, 255, 200, 0.4)';
                    el.style.transform = 'scale(1.03)';
                    el.style.transition = 'all 0.15s ease';
                } else {
                    el.classList.remove('ui-focused');
                    el.style.boxShadow = '';
                    el.style.transform = '';
                    el.style.borderColor = '';
                }
            });
        }

        function clickFocusedUIElement() {
            if (uiFocusedIndex >= 0 && uiFocusedIndex < uiFocusElements.length) {
                const el = uiFocusElements[uiFocusedIndex];
                if (el && !el.disabled) {
                    el.click();
                    setTimeout(scanUIFocusElements, 100);
                }
            }
        }

        function moveUIFocus2D(dx, dy) {
            if (uiFocusElements.length === 0 || uiFocusedIndex < 0) return;

            const currentEl = uiFocusElements[uiFocusedIndex];
            const currentRect = currentEl.getBoundingClientRect();
            const curX = currentRect.left + currentRect.width / 2;
            const curY = currentRect.top + currentRect.height / 2;

            let bestIndex = -1;
            let minDistance = Infinity;

            for (let i = 0; i < uiFocusElements.length; i++) {
                if (i === uiFocusedIndex) continue;

                const rect = uiFocusElements[i].getBoundingClientRect();
                const targetX = rect.left + rect.width / 2;
                const targetY = rect.top + rect.height / 2;

                const diffX = targetX - curX;
                const diffY = targetY - curY;

                if (dx > 0 && diffX < 10) continue;
                if (dx < 0 && diffX > -10) continue;
                if (dy > 0 && diffY < 10) continue;
                if (dy < 0 && diffY > -10) continue;

                const dist = Math.sqrt(diffX * diffX + diffY * diffY) +
                    (dx !== 0 ? Math.abs(diffY) * 1.5 : Math.abs(diffX) * 1.5);

                if (dist < minDistance) {
                    minDistance = dist;
                    bestIndex = i;
                }
            }

            if (bestIndex !== -1) {
                uiFocusedIndex = bestIndex;
                highlightFocusedUIElement();
            }
        }

        function showScreen(screenId) {
            document.querySelectorAll('.selection-group').forEach(s => s.classList.add('hidden'));
            const screen = document.getElementById(screenId);
            if (screen) screen.classList.remove('hidden');

            setCardMakerScreenActive(screenId === 'screen-card-maker');

            const logo = document.getElementById('gameLogo');
            if (logo) {
                if (screenId === 'screen-menu') {
                    logo.classList.remove('hidden');
                } else {
                    logo.classList.add('hidden');
                }
            }

            activeConfiguringKey = null;
            activeConfiguringGamepadAction = null;
            setTimeout(scanUIFocusElements, 100);
        }

        function setCardMakerScreenActive(active) {
            const titleScreen = document.getElementById('titleScreen');
            if (titleScreen) {
                titleScreen.classList.toggle('card-maker-active', active);
            }
            const gameContainer = document.getElementById('gameContainer');
            if (gameContainer) {
                gameContainer.classList.toggle('card-maker-active', active);
            }
        }

        function showBattleSetup() {
            showScreen('screen-battle-setup');
            renderSetupDeckList();
            selectDifficulty(cpuDifficulty);
        }

        function renderSetupDeckList() {
            const container = document.getElementById('setup-deck-list-container');
            if (!container) return;
            container.innerHTML = '';

            if (decks.length === 0) {
                container.innerHTML = '<p style="color:#888a9e; font-size:12px; margin-top:10px; text-align:center;">デッキがありません。デッキ構築で作成してください。</p>';
                return;
            }

            decks.forEach((deck, idx) => {
                const div = document.createElement('div');
                const isSelected = (idx === selectedDeckIndex);
                div.className = isSelected ? 'deck-card selected-deck-card' : 'deck-card';
                div.style.padding = '6px 12px';
                div.style.fontSize = '12px';
                div.style.cursor = 'pointer';
                div.style.border = isSelected ? '1px solid #00ffcc' : '1px solid rgba(255,255,255,0.1)';

                div.onclick = () => {
                    selectedDeckIndex = idx;
                    try {
                        localStorage.setItem('touhou_kyoukaisen_selected_deck_index', selectedDeckIndex.toString());
                    } catch (e) { }
                    renderSetupDeckList();
                };

                div.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <strong style="color:#ffb3b3; font-size:14px;">${deck.name}</strong>
                        ${isSelected ? '<span style="color:#00ffcc; font-size:9px; font-weight:bold;">SELECTED</span>' : '<span style="color:#666; font-size:9px;">選択する</span>'}
                    </div>
                    <div style="margin-top:4px; font-size:10px; color:#aaa; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; text-align:left;">
                        アクティブ: ${deck.active.map(id => defaultCards.active.find(c => c.id === id)?.name.replace('【A】', '')).join(', ')}
                    </div>
                `;
                container.appendChild(div);
            });
            setTimeout(scanUIFocusElements, 100);
        }

        function selectDifficulty(diff) {
            cpuDifficulty = diff;
            window.cpuDifficulty = diff;
            window.currentDifficulty = diff;

            const buttons = document.querySelectorAll('.diff-btn');
            buttons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.textContent === diff) {
                    btn.classList.add('active');
                }
            });

            const desc = document.getElementById('setup-diff-desc');
            if (desc) {
                if (diff === 'EASY') {
                    desc.textContent = '初級者向け。CPUの動きが緩慢になり、弾幕も避けやすくなります。';
                    desc.style.color = '#55ff55';
                } else if (diff === 'NORMAL') {
                    desc.textContent = '中級者向け。標準的な難易度で、熱い駆け引きを楽しめます。';
                    desc.style.color = '#00ffcc';
                } else if (diff === 'HARD') {
                    desc.textContent = '上級者向け。CPUの動きが活発になり、弾幕の間隔が20%短縮されます！';
                    desc.style.color = '#ff66ff';
                } else if (diff === 'LUNATIC') {
                    desc.textContent = '狂気の難易度。極限のCPU速度と、間隔40%短縮された圧倒的密度の弾幕の嵐！';
                    desc.style.color = '#ff3366';
                }
            }
        }

        function startGame() {
            resetZoom();
            setCardMakerScreenActive(false);
            document.getElementById('titleScreen').style.display = 'none';
            isGameRunning = true;
            initBattle();
            lastTime = performance.now(); // デルタタイムのリセット
            timeAccumulator = 0;
            startGameLoop();
        }

        function createNewDeck() {
            editingDeckIndex = -1;
            // 初期状態にデフォルトで使いやすいカードをセットして、操作を劇的に楽にする
            currentEditingDeck = {
                name: `カスタムデッキ ${decks.length + 1}`,
                active: ["a1", "a9", "a3", "a6", "a7", "a8"], // クロスカーブ、スパイラルも標準で入る
                ability: ["ab1", "ab2", "ab3", "ab4", "ab5", "ab6"], // デフォルトアビリティ
                passive: ["p1", "p2", "p3"]
            };
            showScreen('screen-deck-edit');
            const nameInput = document.getElementById('deck-name-input');
            if (nameInput) nameInput.value = currentEditingDeck.name;
            renderDeckEdit();
        }

        function editDeck(index) {
            editingDeckIndex = index;
            const originalDeck = decks[index];
            currentEditingDeck = {
                name: originalDeck.name,
                active: [...originalDeck.active],
                ability: originalDeck.ability ? [...originalDeck.ability] : ["ab1", "ab2", "ab3", "ab4", "ab5", "ab6"],
                passive: [...originalDeck.passive]
            };
            showScreen('screen-deck-edit');
            const nameInput = document.getElementById('deck-name-input');
            if (nameInput) nameInput.value = currentEditingDeck.name;
            renderDeckEdit();
        }

        function renderDeckEdit() {
            const actContainer = document.getElementById('active-slots');
            const abiContainer = document.getElementById('ability-slots');
            const pasContainer = document.getElementById('passive-slots');
            actContainer.innerHTML = '';
            abiContainer.innerHTML = '';
            pasContainer.innerHTML = '';

            // アクティブスロット生成 (6個)
            for (let i = 0; i < 6; i++) {
                const slot = document.createElement('div');
                const cardId = currentEditingDeck.active[i];
                const cardData = defaultCards.active.find(c => c.id === cardId);

                slot.className = cardData ? 'deck-slot filled' : 'deck-slot';
                slot.innerHTML = cardData
                    ? `<span style="font-size:10px;color:#00ffff;">枠 ${i + 1} (コスト:${cardData.cost})</span><span style="margin-top:4px;">${cardData.name.replace('【A】', '')}</span>`
                    : `<span>スロット ${i + 1}<br>(未設定)</span>`;

                slot.onclick = () => openCardSelector('active', i);
                actContainer.appendChild(slot);
            }

            // アビリティスロット生成 (6個)
            for (let i = 0; i < 6; i++) {
                const slot = document.createElement('div');
                const cardId = currentEditingDeck.ability ? currentEditingDeck.ability[i] : null;
                const cardData = defaultCards.ability.find(c => c.id === cardId);

                slot.className = cardData ? 'deck-slot filled' : 'deck-slot';
                slot.innerHTML = cardData
                    ? `<span style="font-size:10px;color:#ffcc00;">枠 ${i + 1}</span><span style="margin-top:4px;">${cardData.name.replace('【急】', '')}</span>`
                    : `<span>スロット ${i + 1}<br>(未設定)</span>`;

                slot.onclick = () => openCardSelector('ability', i);
                abiContainer.appendChild(slot);
            }

            // パッシブスロット生成 (3個)
            for (let i = 0; i < 3; i++) {
                const slot = document.createElement('div');
                const cardId = currentEditingDeck.passive[i];
                const cardData = defaultCards.passive.find(c => c.id === cardId);

                slot.className = cardData ? 'deck-slot filled' : 'deck-slot';
                slot.innerHTML = cardData
                    ? `<span style="font-size:10px;color:#aaffaa;">枠 ${i + 1}</span><span style="margin-top:4px;">${cardData.name.replace('【P】', '')}</span>`
                    : `<span>スロット ${i + 1}<br>(未設定)</span>`;

                slot.onclick = () => openCardSelector('passive', i);
                pasContainer.appendChild(slot);
            }

            checkDeckValid();
        }

        function openCardSelector(type, index) {
            activeSelectSlotType = type;
            activeSelectSlotIndex = index;

            const modal = document.getElementById('card-selector-modal');
            const container = document.getElementById('selector-cards-container');
            const title = document.getElementById('selector-modal-title');

            title.textContent = type === 'active' ? `アクティブカード選択 (スロット ${index + 1})` : (type === 'ability' ? `アビリティカード選択 (スロット ${index + 1})` : `パッシブカード選択 (スロット ${index + 1})`);
            container.innerHTML = '';

            const list = type === 'active' ? defaultCards.active : (type === 'ability' ? defaultCards.ability : defaultCards.passive);
            const currentEquipped = type === 'active' ? currentEditingDeck.active : (type === 'ability' ? currentEditingDeck.ability : currentEditingDeck.passive);

            // クリア用オプション
            const clearItem = document.createElement('div');
            clearItem.className = 'selector-card-item';
            clearItem.style.borderColor = '#ff5555';
            clearItem.innerHTML = `
                <span class="item-name" style="color:#ff8888; font-weight:bold;">外す</span>
                <span class="item-desc" style="color:#aaa;">スロットを空にします</span>
            `;
            clearItem.onclick = () => selectCard(null);
            container.appendChild(clearItem);

            list.forEach(card => {
                const isEquippedElsewhere = currentEquipped && currentEquipped.includes(card.id) && currentEquipped[index] !== card.id;
                const item = document.createElement('div');
                item.className = isEquippedElsewhere ? 'selector-card-item disabled' : 'selector-card-item';

                let statsHtml = '';
                if (type === 'active') {
                    statsHtml = `<div class="item-stats">持続:${card.duration}s 間隔:${card.interval}s <span style="color:#00ffff; font-weight:bold;">(コスト: ${card.cost})</span></div>`;
                }

                item.innerHTML = `
                    <span class="item-name">${card.name}</span>
                    <span class="item-desc">${card.desc}</span>
                    ${statsHtml}
                `;

                if (!isEquippedElsewhere) {
                    item.onclick = () => selectCard(card.id);
                }
                container.appendChild(item);
            });

            modal.classList.remove('hidden');
        }

        function selectCard(cardId) {
            if (activeSelectSlotType === 'active') {
                currentEditingDeck.active[activeSelectSlotIndex] = cardId || "";
            } else if (activeSelectSlotType === 'ability') {
                if (!currentEditingDeck.ability) currentEditingDeck.ability = [];
                currentEditingDeck.ability[activeSelectSlotIndex] = cardId || "";
            } else {
                currentEditingDeck.passive[activeSelectSlotIndex] = cardId || "";
            }
            closeCardSelector();
            renderDeckEdit();
        }

        function closeCardSelector() {
            document.getElementById('card-selector-modal').classList.add('hidden');
        }

        function checkDeckValid() {
            const isActFull = currentEditingDeck.active.every(v => v !== "");
            const isPasFull = currentEditingDeck.passive.every(v => v !== "");
            
            let totalCost = 0;
            currentEditingDeck.active.forEach(cardId => {
                const card = defaultCards.active.find(c => c.id === cardId);
                if (card) totalCost += (card.cost || 0);
            });
            
            const costLimit = 20;
            const isCostOk = totalCost <= costLimit;
            
            document.getElementById('save-deck-btn').disabled = !(isActFull && isPasFull && isCostOk);

            const costEl = document.getElementById('deck-total-cost');
            if (costEl) {
                costEl.textContent = `アクティブカード総コスト: ${totalCost} / ${costLimit}`;
                costEl.style.color = isCostOk ? '#00ffff' : '#ff5555';
            }
        }

        function saveDeck() {
            const nameInput = document.getElementById('deck-name-input');
            let deckName = nameInput ? nameInput.value.trim() : "";
            if (deckName === "") {
                deckName = editingDeckIndex >= 0 ? decks[editingDeckIndex].name : `カスタムデッキ ${decks.length + 1}`;
            }
            currentEditingDeck.name = deckName;

            if (editingDeckIndex >= 0) {
                // 上書き編集
                decks[editingDeckIndex] = currentEditingDeck;
                selectedDeckIndex = editingDeckIndex;
            } else {
                // 新規作成
                decks.push(currentEditingDeck);
                selectedDeckIndex = decks.length - 1; // 自動選択
            }

            try {
                localStorage.setItem('touhou_kyoukaisen_decks', JSON.stringify(decks));
                localStorage.setItem('touhou_kyoukaisen_selected_deck_index', selectedDeckIndex.toString());
            } catch (e) { }

            showScreen('screen-deck-list');
            renderDeckList();
        }

        function selectDeck(index) {
            selectedDeckIndex = index;
            try {
                localStorage.setItem('touhou_kyoukaisen_selected_deck_index', selectedDeckIndex.toString());
            } catch (e) { }
            renderDeckList();
        }

        function renderDeckList() {
            const container = document.getElementById('deck-list-container');
            container.innerHTML = '';
            if (decks.length === 0) {
                container.innerHTML = '<p style="color:#888a9e; font-size:14px; margin-top:20px;">デッキがありません。</p>';
                return;
            }
            decks.forEach((deck, idx) => {
                const div = document.createElement('div');
                const isSelected = (idx === selectedDeckIndex);
                div.className = isSelected ? 'deck-card selected-deck-card' : 'deck-card';

                div.onclick = (e) => {
                    // 削除ボタンや編集ボタンなどのボタン類がクリックされたときは選択処理を行わない
                    if (e.target.tagName.toLowerCase() === 'button') return;
                    selectDeck(idx);
                };

                div.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <strong style="color:#ffb3b3; font-size:16px;">${deck.name}</strong>
                        ${isSelected ? '<span style="color:#00ffcc; font-size:10px; font-weight:bold; border:1px solid #00ffcc; padding:2px 6px; border-radius:4px; box-shadow: 0 0 8px rgba(0,255,200,0.5);">使用中</span>' : '<span style="color:#666; font-size:10px;">選択する</span>'}
                    </div>
                    <div style="margin-top:6px;">
                        <span style="font-size: 12px; color: #aaa;">アクティブ: ${deck.active.map(id => defaultCards.active.find(c => c.id === id)?.name.replace('【A】', '')).join(', ')}</span><br>
                        <span style="font-size: 12px; color: #ffcc00;">アビリティ: ${deck.ability ? deck.ability.map(id => defaultCards.ability.find(c => c.id === id)?.name.replace('【急】', '')).join(', ') : '未装備'}</span><br>
                        <span style="font-size: 12px; color: #99a;">パッシブ: ${deck.passive.map(id => defaultCards.passive.find(c => c.id === id)?.name.replace('【P】', '')).join(', ')}</span>
                    </div>
                    <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:4px;">
                        <button class="deck-card-btn" onclick="editDeck(${idx})" style="padding:4px 10px; font-size:11px; margin-top:6px; background: linear-gradient(135deg, #004455 0%, #001122 100%); border-color: #00ffcc; color: #00ffff;">編集</button>
                        <button class="deck-card-btn" onclick="deleteDeck(${idx})" style="padding:4px 10px; font-size:11px; margin-top:6px;">削除</button>
                    </div>
                `;
                container.appendChild(div);
            });
            setTimeout(scanUIFocusElements, 100);
        }

        function deleteDeck(index) {
            if (confirm("このデッキを削除しますか？")) {
                decks.splice(index, 1);
                if (selectedDeckIndex >= decks.length) {
                    selectedDeckIndex = Math.max(0, decks.length - 1);
                }
                try {
                    localStorage.setItem('touhou_kyoukaisen_decks', JSON.stringify(decks));
                    localStorage.setItem('touhou_kyoukaisen_selected_deck_index', selectedDeckIndex.toString());
                } catch (e) { }
                renderDeckList();
            }
        }

        // ==========================================
        // ゲームコアロジック (戦闘システム拡張)
        // ==========================================
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const PLAY_WIDTH = 768;

        // ==========================================
        // 画像リソース
        // ==========================================
        // 弾アセット画像プリロード
        const bulletImgNames = [
            'knife', 'kome', 'marutama', 'ohuda', 'ootama', 'poihuru', 'star', 'uroko', 'virus', 'onmyoutama', 'sword',
            'b_knife', 'b_marutama', 'b_ohuda', 'b_poihuru', 'b_star', 'b_uroko',
            'dangan', 'kunai1', 'kunai2'
        ];
        window.bulletImages = {};
        bulletImgNames.forEach(name => {
            const img = new Image();
            img.src = `${name}.png`;
            window.bulletImages[name] = img;
        });
        window.bulletImages['onmyoudama'] = window.bulletImages['onmyoutama'];

        const reimuImg = new Image();
        reimuImg.src = "data:image/png;base64,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";

        const reimuImg_idle = new Image(); reimuImg_idle.src = "data:image/png;base64,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";
        const reimuImg_left = new Image(); reimuImg_left.src = "data:image/png;base64,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"; // 左移動用ダミー

        const youmuImg_idle = new Image(); youmuImg_idle.src = "data:image/png;base64,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"; // 仮データ

        const youmuImg_left = new Image(); youmuImg_left.src = "data:image/png;base64,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"; // 仮データ

        const youmuImg_right = new Image(); youmuImg_right.src = "data:image/png;base64,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"; // 仮データ


        const battleOverlay = document.getElementById('battleOverlay');
        const phaseText = document.getElementById('phaseText');
        const handContainer = document.getElementById('handContainer');

        const boundaryY = canvas.height / 2;

        let gameState = 'BATTLE'; // 'BATTLE', 'RESULT'
        let battlePhase = 'PLANNING'; // 'PLANNING', 'ACTION', 'RESOLUTION'
        let turnOwner = 'PLAYER'; // 'PLAYER', 'CPU'
        let turnCount = 1;

        let actionTimer = 0;
        let resolutionTimer = 0;
        let activeCard = null;
        let spawnTimer = 0;
        let normalShotTimer = 0;

        // 霊撃（ボム）関連のグローバル変数
        let activeReigekis = [];
        let reigekiCutinTimer = 0;
        let reigekiCutinOwner = 'PLAYER';
        let prevBombInput = false;

        // エンティティ
        const player = {
            team: 'PLAYER',
            x: PLAY_WIDTH / 2, y: canvas.height * 0.8,
            hp: 1000, maxHp: 1000, grazeCount: 0, pendingDamage: 0, pendingHeal: 0,
            recentHits: [], // 被弾履歴 (デスボム用)
            hitboxRadius: 2.25, grazeRadius: 30, speed: 405, slowSpeed: 135,
            deck: [], hand: [], passives: [],
            bombs: 3,
            maxBombs: 3,
            bombPieces: 0,
            isInvincible: false,
            invincibleTimer: 0,
            optionAngle: 0 // オプション回転用
        };

        const cpu = {
            team: 'CPU',
            x: PLAY_WIDTH / 2, y: canvas.height * 0.2,
            hp: 1000, maxHp: 1000, pendingDamage: 0, pendingHeal: 0, grazeCount: 0,
            recentHits: [], // 被弾履歴 (デスボム用)
            hitboxRadius: 4, grazeRadius: 30, speed: 200,
            deck: [], hand: [], passives: [], targetX: PLAY_WIDTH / 2, targetY: 180,
            prevX: PLAY_WIDTH / 2, moveDir: 0,
            bombs: 3,
            maxBombs: 3,
            bombCooldown: 0,
            isInvincible: false,
            invincibleTimer: 0
        };

        let bullets = [];
        let magicCircles = [];
        let activeCards = []; // activeCardからactiveCards(配列)へ変更

        const customOwnerPositionLocks = {
            PLAYER: null,
            CPU: null
        };

        function getHomePositionForOwner(owner) {
            return {
                x: PLAY_WIDTH / 2,
                y: owner === 'PLAYER' ? canvas.height * 0.8 : canvas.height * 0.2
            };
        }

        function getCustomOwnerPosition(owner, preset) {
            let unit;
            if (owner === 'PLAYER') unit = player;
            else if (owner === 'CPU') unit = cpu;
            else {
                // Find matching magic circle by ID
                unit = magicCircles ? magicCircles.find(mc => mc.id === owner) : null;
            }
            if (!unit) unit = cpu;
            const radius = unit.grazeRadius || unit.hitboxRadius || unit.radius || 10;
            const minX = radius + 10;
            const maxX = PLAY_WIDTH - radius - 10;
            const centerX = PLAY_WIDTH / 2;

            if (String(preset).includes(',')) {
                let parts = String(preset).split(',').map(s => parseFloat(s.trim()));
                if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
                    let targetX = Math.max(minX, Math.min(maxX, parts[0]));
                    let targetY = Math.max(radius + 10, Math.min(canvas.height - radius - 10, parts[1]));
                    return { x: targetX, y: targetY };
                }
            }

            const key = String(preset || 'center').trim().toLowerCase().replace(/[\s_-]/g, '');
            let x = centerX;
            let y = owner === 'PLAYER' ? canvas.height * 0.8 : canvas.height * 0.2;

            if (key === 'right' || key === 'r') x = centerX + PLAY_WIDTH * 0.18;
            if (key === 'left' || key === 'l') x = centerX - PLAY_WIDTH * 0.18;
            if (key === 'farright' || key === 'maxright' || key === 'rightedge') x = maxX;
            if (key === 'farleft' || key === 'maxleft' || key === 'leftedge') x = minX;
            if (key === 'enemyrightup' || key === 'rightup' || key === 'ru') {
                x = centerX + PLAY_WIDTH * 0.28;
                y = owner === 'PLAYER' ? canvas.height * 0.68 : canvas.height * 0.12;
            }
            if (key === 'enemyleftup' || key === 'leftup' || key === 'lu') {
                x = centerX - PLAY_WIDTH * 0.28;
                y = owner === 'PLAYER' ? canvas.height * 0.68 : canvas.height * 0.12;
            }

            return { x: Math.max(minX, Math.min(maxX, x)), y };
        }

        function placeCustomOwnerAt(owner, pos) {
            let unit;
            if (owner === 'PLAYER') unit = player;
            else if (owner === 'CPU') unit = cpu;
            else {
                unit = magicCircles ? magicCircles.find(mc => mc.id === owner) : null;
            }
            if (!unit) return;

            unit.x = pos.x;
            unit.y = pos.y;
            unit.moveDir = 0;
            unit.prevX = pos.x;
            if (owner === 'PLAYER') {
                mobileTargetX = pos.x;
                mobileTargetY = pos.y;
            } else if (owner === 'CPU') {
                cpu.targetX = pos.x;
                cpu.targetY = pos.y;
            }
        }

        function moveOwnerToHome(owner) {
            placeCustomOwnerAt(owner, getHomePositionForOwner(owner));
        }

        function setCustomOwnerPosition(owner, preset, duration = 0) {
            let unit;
            if (owner === 'PLAYER') unit = player;
            else if (owner === 'CPU') unit = cpu;
            else {
                unit = magicCircles ? magicCircles.find(mc => mc.id === owner) : null;
            }
            if (!unit) return;

            const target = getCustomOwnerPosition(owner, preset);
            const moveDuration = Math.max(0, Number(duration) || 0);
            customOwnerPositionLocks[owner] = {
                startX: unit.x,
                startY: unit.y,
                targetX: target.x,
                targetY: target.y,
                duration: moveDuration,
                elapsed: 0
            };
            if (moveDuration <= 0) {
                placeCustomOwnerAt(owner, target);
            }
        }

        function applyCustomOwnerPositionLock(owner, dt = 0) {
            let lock = customOwnerPositionLocks[owner];
            if (!lock) {
                setCustomOwnerPosition(owner, 'center', 0);
                lock = customOwnerPositionLocks[owner];
            }
            if (lock.duration <= 0) {
                placeCustomOwnerAt(owner, { x: lock.targetX, y: lock.targetY });
                return;
            }
            lock.elapsed = Math.min(lock.duration, lock.elapsed + Math.max(0, dt || 0));
            const t = lock.duration > 0 ? lock.elapsed / lock.duration : 1;
            const eased = t * t * (3 - 2 * t);
            placeCustomOwnerAt(owner, {
                x: lock.startX + (lock.targetX - lock.startX) * eased,
                y: lock.startY + (lock.targetY - lock.startY) * eased
            });
        }

        function isCustomActionLocked(owner = turnOwner) {
            return battlePhase === 'ACTION'
                && owner === turnOwner
                && activeCards.some(c => c && c.isCustom);
        }

        function enforceCustomActionLock(dt = 0) {
            if (isCustomActionLocked('PLAYER')) applyCustomOwnerPositionLock('PLAYER', dt);
            if (isCustomActionLocked('CPU')) applyCustomOwnerPositionLock('CPU', dt);
        }

        // ==========================================
        // 統合入力管理システム (ゲームパッド・キーコンフィグ対応)
        // ==========================================
        const keyboardState = {};
        let gamepadIndex = null;
        let prevGamepadButtons = [];

        // メニュー用デバウンス追跡
        let prevMenuGamepadButtons = [];
        let prevMenuGamepadAxes = [];

        window.addEventListener("gamepadconnected", (e) => {
            gamepadIndex = e.gamepad.index;
            // ゲームパッドが接続されたら即時メニューフォーカスを初期化・アクティブ化
            setTimeout(scanUIFocusElements, 150);
        });
        window.addEventListener("gamepaddisconnected", (e) => {
            if (gamepadIndex === e.gamepad.index) gamepadIndex = null;
        });

        // ページロード直後に一度フォーカスを走査
        setTimeout(scanUIFocusElements, 200);

        // メニュー画面でのゲームパッド操作用ポーラー (50ms間隔)
        setInterval(() => {
            const titleScreen = document.getElementById('titleScreen');
            // タイトル画面が開いており、かつキー/ゲームパッドマッピング待機中でない時のみ動作
            if (!titleScreen || titleScreen.style.display === 'none' || activeConfiguringKey || activeConfiguringGamepadAction) return;

            const gamepads = navigator.getGamepads();
            let gp = null;
            if (gamepadIndex !== null) {
                gp = gamepads[gamepadIndex];
            } else {
                for (let i = 0; i < gamepads.length; i++) {
                    if (gamepads[i]) {
                        gp = gamepads[i];
                        break;
                    }
                }
            }

            if (gp) {
                const threshold = 0.5;
                const stickLeft = gp.axes[0] < -threshold;
                const stickRight = gp.axes[0] > threshold;
                const stickUp = gp.axes[1] < -threshold;
                const stickDown = gp.axes[1] > threshold;

                const dpadUp = gp.buttons[12] && gp.buttons[12].pressed;
                const dpadDown = gp.buttons[13] && gp.buttons[13].pressed;
                const dpadLeft = gp.buttons[14] && gp.buttons[14].pressed;
                const dpadRight = gp.buttons[15] && gp.buttons[15].pressed;

                // 決定ボタン
                const btnConfirm = gp.buttons[gamepadConfig.confirm] && gp.buttons[gamepadConfig.confirm].pressed;

                const prevL = (prevMenuGamepadAxes[0] !== undefined) ? (prevMenuGamepadAxes[0] < -threshold) : false;
                const prevR = (prevMenuGamepadAxes[0] !== undefined) ? (prevMenuGamepadAxes[0] > threshold) : false;
                const prevU = (prevMenuGamepadAxes[1] !== undefined) ? (prevMenuGamepadAxes[1] < -threshold) : false;
                const prevD = (prevMenuGamepadAxes[1] !== undefined) ? (prevMenuGamepadAxes[1] > threshold) : false;

                const prevDpadU = prevMenuGamepadButtons[12] || false;
                const prevDpadD = prevMenuGamepadButtons[13] || false;
                const prevDpadL = prevMenuGamepadButtons[14] || false;
                const prevDpadR = prevMenuGamepadButtons[15] || false;

                const prevConfirm = prevMenuGamepadButtons[gamepadConfig.confirm] || false;

                // 2Dナビゲーション判定（新しく倒された瞬間のみ発動）
                if ((stickUp && !prevU) || (dpadUp && !prevDpadU)) {
                    moveUIFocus2D(0, -1);
                }
                if ((stickDown && !prevD) || (dpadDown && !prevDpadD)) {
                    moveUIFocus2D(0, 1);
                }
                if ((stickLeft && !prevL) || (dpadLeft && !prevDpadL)) {
                    moveUIFocus2D(-1, 0);
                }
                if ((stickRight && !prevR) || (dpadRight && !prevDpadR)) {
                    moveUIFocus2D(1, 0);
                }

                if (btnConfirm && !prevConfirm) {
                    clickFocusedUIElement();
                }

                prevMenuGamepadButtons = gp.buttons.map(b => b.pressed);
                prevMenuGamepadAxes = [...gp.axes];
            } else {
                prevMenuGamepadButtons = [];
                prevMenuGamepadAxes = [];
            }
        }, 50);

        // 毎フレーム更新される統合入力状態
        const inputState = {
            up: false,
            down: false,
            left: false,
            right: false,
            slow: false,
            cast: false,
            confirm: false
        };

        window.addEventListener('keydown', e => {
            // キー設定中の場合はキャプチャするので、ここでは処理しない
            if (activeConfiguringKey) return;

            // textarea / input にフォーカスがある場合はゲーム側のキー処理を完全にスキップ
            // （JSコードエディタのカーソル移動・改行・文字入力をブロックしないため）
            const focused = document.activeElement;
            if (focused && (focused.tagName === 'TEXTAREA' || focused.tagName === 'INPUT')) return;

            if (e.key === 'F3' || e.keyCode === 114) {
                e.preventDefault();
            }

            if (e.key === 'd' || e.key === 'D') {
                window.showDebugProfiler = !window.showDebugProfiler;
                window.debugShowHitboxes = !window.debugShowHitboxes;
            }

            keyboardState[e.key] = true;

            // 1. タイトル画面表示中（メニュー操作時）のキーボード・仮想フォーカス処理
            const titleScreen = document.getElementById('titleScreen');
            if (titleScreen && titleScreen.style.display !== 'none') {
                if (e.key === keyConfig.moveUp || e.key === 'ArrowUp') {
                    e.preventDefault();
                    moveUIFocus2D(0, -1);
                } else if (e.key === keyConfig.moveDown || e.key === 'ArrowDown') {
                    e.preventDefault();
                    moveUIFocus2D(0, 1);
                } else if (e.key === keyConfig.moveLeft || e.key === 'ArrowLeft') {
                    e.preventDefault();
                    moveUIFocus2D(-1, 0);
                } else if (e.key === keyConfig.moveRight || e.key === 'ArrowRight') {
                    e.preventDefault();
                    moveUIFocus2D(1, 0);
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    clickFocusedUIElement();
                }
                return; // メニュー画面表示中ならバトル操作はバイパスする
            }

            // 2. PLANNINGフェーズ時のキーボードショートカット＆フォーカス操作
            if (battlePhase === 'PLANNING' && turnOwner === 'PLAYER' && gameState === 'BATTLE') {
                // クイックカード選択（キーコンフィグ設定に基づいて処理）
                if (e.key === keyConfig.card1) { selectPlayerCard(0); focusedCardIndex = 0; }
                else if (e.key === keyConfig.card2) { selectPlayerCard(1); focusedCardIndex = 1; }
                else if (e.key === keyConfig.card3) { selectPlayerCard(2); focusedCardIndex = 2; }
                else if (e.key === keyConfig.card4) { selectPlayerCard(3); focusedCardIndex = 3; }
                else if (e.key === keyConfig.card5) { selectPlayerCard(4); focusedCardIndex = 4; }
                else if (e.key === keyConfig.card6) { selectPlayerCard(5); focusedCardIndex = 5; }

                // 左右キーでのフォーカス移動
                if (e.key === keyConfig.moveLeft) {
                    e.preventDefault();
                    moveCardFocus(-1);
                }
                if (e.key === keyConfig.moveRight) {
                    e.preventDefault();
                    moveCardFocus(1);
                }
                // 上下キーでのカード縦移動（改行対応）
                if (e.key === keyConfig.moveUp || e.key === 'ArrowUp') {
                    e.preventDefault();
                    moveCardFocusVertical(-1);
                }
                if (e.key === keyConfig.moveDown || e.key === 'ArrowDown') {
                    e.preventDefault();
                    moveCardFocusVertical(1);
                }

                // 決定キーでのカード選択トグル
                if (e.key === 'Enter') {
                    e.preventDefault();
                    toggleFocusedCard();
                }

                // 弾幕展開キャストキー
                if (e.key === keyConfig.castSpell) {
                    let neededCount = turnCount >= 7 ? 2 : 1;
                    neededCount = Math.min(neededCount, player.hand.length);
                    if (selectedPlayerCards.length === neededCount) {
                        e.preventDefault();
                        castSelectedSpells();
                    }
                }
            }
        });

        window.addEventListener('keyup', e => {
            keyboardState[e.key] = false;
        });

        // ウィンドウのフォーカスが外れた瞬間に全キーをリセット
        // （被弾エフェクト等の演出でフォーカスが移動し keyup が届かない "スタック" バグの防止）
        window.addEventListener('blur', () => {
            for (let k in keyboardState) keyboardState[k] = false;
        });
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                for (let k in keyboardState) keyboardState[k] = false;
            }
        });

        function updateInputState() {
            // 1. キーボード入力をマッピング
            inputState.up = keyboardState[keyConfig.moveUp] || false;
            inputState.down = keyboardState[keyConfig.moveDown] || false;
            inputState.left = keyboardState[keyConfig.moveLeft] || false;
            inputState.right = keyboardState[keyConfig.moveRight] || false;
            inputState.slow = keyboardState[keyConfig.slowMove] || false;
            inputState.cast = keyboardState[keyConfig.castSpell] || false;
            inputState.bomb = keyboardState[keyConfig.bomb] || false;
            inputState.confirm = keyboardState['Enter'] || false;

            // 能動的ポーリングによるゲームパッド自動検出（イベント不発時の安全策）
            const gamepads = navigator.getGamepads();
            if (gamepadIndex === null) {
                for (let i = 0; i < gamepads.length; i++) {
                    if (gamepads[i]) {
                        gamepadIndex = i;
                        console.log("Gamepad auto-detected at index:", i, gamepads[i].id);
                        break;
                    }
                }
            }

            // 2. ゲームパッド入力を統合
            if (gamepadIndex !== null) {
                const gp = gamepads[gamepadIndex];
                if (gp) {
                    const threshold = 0.25; // デッドゾーン

                    // アナログスティックでの自機移動
                    if (gp.axes[1] < -threshold) inputState.up = true;
                    if (gp.axes[1] > threshold) inputState.down = true;
                    if (gp.axes[0] < -threshold) inputState.left = true;
                    if (gp.axes[0] > threshold) inputState.right = true;

                    // 十字キーで自機移動 (12:上, 13:下, 14:左, 15:右)
                    if (gp.buttons[12] && gp.buttons[12].pressed) inputState.up = true;
                    if (gp.buttons[13] && gp.buttons[13].pressed) inputState.down = true;
                    if (gp.buttons[14] && gp.buttons[14].pressed) inputState.left = true;
                    if (gp.buttons[15] && gp.buttons[15].pressed) inputState.right = true;

                    // 低速移動 (設定されたカスタムボタンを使用)
                    if (gp.buttons[gamepadConfig.slowMove] && gp.buttons[gamepadConfig.slowMove].pressed) {
                        inputState.slow = true;
                    }

                    // 弾幕展開 (設定されたカスタムボタンを使用)
                    if (gp.buttons[gamepadConfig.castSpell] && gp.buttons[gamepadConfig.castSpell].pressed) {
                        inputState.cast = true;
                    }

                    // 霊撃 (設定されたカスタムボタンを使用)
                    if (gp.buttons[gamepadConfig.bomb] && gp.buttons[gamepadConfig.bomb].pressed) {
                        inputState.bomb = true;
                    }

                    // PLANNINGフェーズ時の選択＆決定処理
                    if (battlePhase === 'PLANNING' && turnOwner === 'PLAYER' && gameState === 'BATTLE') {
                        const btnL1 = gp.buttons[gamepadConfig.cardPrev] && gp.buttons[gamepadConfig.cardPrev].pressed;
                        const btnR1 = gp.buttons[gamepadConfig.cardNext] && gp.buttons[gamepadConfig.cardNext].pressed;
                        const btnA = gp.buttons[gamepadConfig.confirm] && gp.buttons[gamepadConfig.confirm].pressed;
                        const btnY = gp.buttons[gamepadConfig.castSpell] && gp.buttons[gamepadConfig.castSpell].pressed;
                        const btnStart = gp.buttons[9] && gp.buttons[9].pressed; // Startボタンは常にバックアップ対応

                        // アナログスティック（左右・上下）および十字キー（左右・上下）によるカード選択移動
                        const stickLeft = gp.axes[0] < -0.5;
                        const stickRight = gp.axes[0] > 0.5;
                        const stickUp = gp.axes[1] < -0.5;
                        const stickDown = gp.axes[1] > 0.5;

                        const dpadLeft = gp.buttons[14] && gp.buttons[14].pressed;
                        const dpadRight = gp.buttons[15] && gp.buttons[15].pressed;
                        const dpadUp = gp.buttons[12] && gp.buttons[12].pressed;
                        const dpadDown = gp.buttons[13] && gp.buttons[13].pressed;

                        const prevL1 = prevGamepadButtons[gamepadConfig.cardPrev] || false;
                        const prevR1 = prevGamepadButtons[gamepadConfig.cardNext] || false;
                        const prevA = prevGamepadButtons[gamepadConfig.confirm] || false;
                        const prevY = prevGamepadButtons[gamepadConfig.castSpell] || false;
                        const prevStart = prevGamepadButtons[9] || false;

                        const prevStickLeft = (prevGamepadAxes[0] !== undefined) ? (prevGamepadAxes[0] < -0.5) : false;
                        const prevStickRight = (prevGamepadAxes[0] !== undefined) ? (prevGamepadAxes[0] > 0.5) : false;
                        const prevStickUp = (prevGamepadAxes[1] !== undefined) ? (prevGamepadAxes[1] < -0.5) : false;
                        const prevStickDown = (prevGamepadAxes[1] !== undefined) ? (prevGamepadAxes[1] > 0.5) : false;

                        const prevDpadLeft = prevGamepadButtons[14] || false;
                        const prevDpadRight = prevGamepadButtons[15] || false;
                        const prevDpadUp = prevGamepadButtons[12] || false;
                        const prevDpadDown = prevGamepadButtons[13] || false;

                        // 前フレームと比較して新しく入力が入った瞬間のみフォーカス移動（チャタリング防止）
                        if ((btnL1 && !prevL1) || (stickLeft && !prevStickLeft) || (dpadLeft && !prevDpadLeft)) {
                            moveCardFocus(-1);
                        }
                        if ((btnR1 && !prevR1) || (stickRight && !prevStickRight) || (dpadRight && !prevDpadRight)) {
                            moveCardFocus(1);
                        }
                        if ((stickUp && !prevStickUp) || (dpadUp && !prevDpadUp)) {
                            moveCardFocusVertical(-1);
                        }
                        if ((stickDown && !prevStickDown) || (dpadDown && !prevDpadDown)) {
                            moveCardFocusVertical(1);
                        }

                        if (btnA && !prevA) {
                            toggleFocusedCard();
                        }
                        if ((btnY && !prevY) || (btnStart && !prevStart)) {
                            let neededCount = turnCount >= 7 ? 2 : 1;
                            neededCount = Math.min(neededCount, player.hand.length);
                            if (selectedPlayerCards.length === neededCount) {
                                castSelectedSpells();
                            }
                        }
                    }

                    // 現在のフレームの状態を記憶
                    prevGamepadButtons = gp.buttons.map(b => b.pressed);
                    prevGamepadAxes = [...gp.axes];
                } else {
                    // 対応インデックスのゲームパッドが失われていればリセット
                    gamepadIndex = null;
                    prevGamepadButtons = [];
                    prevGamepadAxes = [];
                }
            } else {
                prevGamepadButtons = [];
                prevGamepadAxes = [];
            }
        }

        // ボムのかけらアイテムの生成（廃止）
        function spawnBombPiece(x, y, value = 10) {
            // 廃止されたため何もしない
        }

        function initOnlineBattle() {
            isOnlineMode = true;
            setCardMakerScreenActive(false);
            document.getElementById('titleScreen').style.display = 'none';
            isGameRunning = true;

            // 選択されたデッキのロード
            let selectedDeck = (decks.length > 0 && selectedDeckIndex >= 0 && selectedDeckIndex < decks.length) ? decks[selectedDeckIndex] : null;
            let baseActive = selectedDeck ? selectedDeck.active.filter(v => v !== "") : defaultCards.active.slice(0, 6).map(c => c.id);
            let baseAbility = selectedDeck && selectedDeck.ability ? selectedDeck.ability.filter(v => v !== "") : defaultCards.ability.map(c => c.id);
            let basePassive = selectedDeck ? selectedDeck.passive.filter(v => v !== "") : defaultCards.passive.map(c => c.id);
            player.deck = [...baseActive]; player.hand = [...player.deck];
            player.abilities = [...baseAbility];
            player.usedAbilities = [];
            player.ab3Shield = false;
            player.passives = [...basePassive];

            // 金剛身 (p12) 判定による最大HPの設定
            if (player.passives.includes('p12')) {
                player.maxHp = 1200;
                player.hp = 1200;
            } else {
                player.maxHp = 1000;
                player.hp = 1000;
            }

            // プレイヤー初期化
            player.grazeCount = 0; player.pendingDamage = 0; player.pendingHeal = 0; player.recentHits = []; player.recentHits = [];
            player.x = PLAY_WIDTH / 2; player.y = canvas.height * 0.8;
            player.isInvincible = false;
            player.invincibleTimer = 0;

            // パッシブの適用（ボム最大数）
            player.maxBombs = player.passives.includes('p4') ? 4 : 3;
            player.bombs = player.maxBombs;
            player.bombPieces = 0;

            // 相手（cpuオブジェクト）の初期化
            cpu.x = PLAY_WIDTH / 2; cpu.y = canvas.height * 0.2;
            cpu.isInvincible = false;
            cpu.invincibleTimer = 0;

            // 相手のデッキ適用
            if (opponentDeck) {
                cpu.deck = [...opponentDeck.active];
                cpu.hand = [...cpu.deck];
                cpu.abilities = opponentDeck.ability ? [...opponentDeck.ability] : defaultCards.ability.map(c => c.id);
                cpu.usedAbilities = [];
                cpu.ab3Shield = false;
                cpu.passives = [...opponentDeck.passive];
            } else {
                cpu.deck = defaultCards.active.map(c => c.id);
                cpu.hand = [...cpu.deck];
                cpu.abilities = defaultCards.ability.map(c => c.id);
                cpu.usedAbilities = [];
                cpu.ab3Shield = false;
                cpu.passives = defaultCards.passive.map(c => c.id);
            }

            if (cpu.passives.includes('p12')) {
                cpu.maxHp = 1200;
                cpu.hp = 1200;
            } else {
                cpu.maxHp = 1000;
                cpu.hp = 1000;
            }

            cpu.grazeCount = 0; cpu.pendingDamage = 0; cpu.pendingHeal = 0; cpu.recentHits = []; cpu.recentHits = [];
            cpu.maxBombs = cpu.passives.includes('p4') ? 4 : 3;
            cpu.bombs = cpu.maxBombs;
            cpu.bombCooldown = 0;

            activeReigekis.length = 0;
            reigekiCutinTimer = 0;
            bullets.length = 0;
            magicCircles.length = 0;
            gameState = 'BATTLE';
            turnCount = 1;
            selectedPlayerCards = [];

            // ホストが先攻、クライアントが後攻（相手が先攻）
            if (onlineRole === 'host') {
                changePhase('PLANNING', 'PLAYER');
            } else {
                changePhase('PLANNING', 'CPU');
            }

            lastTime = performance.now();
            timeAccumulator = 0;
            startGameLoop();
        }

        function initBattle() {
            // 難易度に応じたCPUの基本パラメータ（移動速度、回避の思考間隔、弾の認識漏れ確率）設定
            if (cpuDifficulty === 'EASY') {
                cpu.speed = 140;
                cpu.thinkInterval = 40;  // 40フレーム(約0.6秒)に1回しか回避を考えない
                cpu.ignoreChance = 0.50;  // 50%の確率で迫る弾をうっかり見落とす（人間味のある被弾）
            } else if (cpuDifficulty === 'NORMAL') {
                cpu.speed = 200;
                cpu.thinkInterval = 15;  // 15フレームに1回思考
                cpu.ignoreChance = 0.20;  // 20%の確率で見落とす
            } else if (cpuDifficulty === 'HARD') {
                cpu.speed = 250;
                cpu.thinkInterval = 5;   // 5フレームに1回思考
                cpu.ignoreChance = 0.05;  // 5%の確率で見落とす
            } else if (cpuDifficulty === 'LUNATIC') {
                cpu.speed = 300;
                cpu.thinkInterval = 1;   // 毎フレーム超高速思考
                cpu.ignoreChance = 0.00;  // 0%で見落とさない（完全見切り）
            }
            cpu.thinkTimer = 0;
            player.x = PLAY_WIDTH / 2; player.y = canvas.height * 0.8;
            player.isInvincible = false;
            player.invincibleTimer = 0;

            // デッキのロードと手札生成
            let selectedDeck = (decks.length > 0 && selectedDeckIndex >= 0 && selectedDeckIndex < decks.length) ? decks[selectedDeckIndex] : null;
            let baseActive = selectedDeck ? selectedDeck.active.filter(v => v !== "") : defaultCards.active.slice(0, 6).map(c => c.id);
            let basePassive = selectedDeck ? selectedDeck.passive.filter(v => v !== "") : defaultCards.passive.map(c => c.id);
            player.deck = [...baseActive]; player.hand = [...player.deck];
            let baseAbility = selectedDeck && selectedDeck.ability ? selectedDeck.ability.filter(v => v !== "") : defaultCards.ability.map(c => c.id);
            player.abilities = [...baseAbility];
            player.usedAbilities = [];
            player.ab3Shield = false;
            player.passives = [...basePassive];

            // 金剛身 (p12) 判定による最大HPの設定
            if (player.passives.includes('p12')) {
                player.maxHp = 1200;
                player.hp = 1200;
            } else {
                player.maxHp = 1000;
                player.hp = 1000;
            }

            if (cpu.passives.includes('p12')) {
                cpu.maxHp = 1200;
                cpu.hp = 1200;
            } else {
                cpu.maxHp = 1000;
                cpu.hp = 1000;
            }

            player.grazeCount = 0; player.pendingDamage = 0; player.pendingHeal = 0; player.recentHits = []; player.recentHits = [];

            // パッシブ効果の適用
            if (player.passives.includes('p4')) {
                player.maxBombs = 4;
                player.bombs = 4;
            } else {
                player.maxBombs = 3;
                player.bombs = 3;
            }
            player.bombPieces = 0;

            cpu.bombs = 3;
            cpu.maxBombs = 3;
            cpu.bombCooldown = 0;
            cpu.isInvincible = false;
            cpu.invincibleTimer = 0;

            activeReigekis.length = 0;
            reigekiCutinTimer = 0;
            reigekiCutinOwner = 'PLAYER';
            prevBombInput = false;
            activeEffects.length = 0; // エフェクト配列のクリア
            player.p7Triggered = false; // HP25%以下自動回復フラグ
            cpu.p7Triggered = false;
            cpu.hp = 1000; cpu.pendingDamage = 0; cpu.pendingHeal = 0; cpu.grazeCount = 0; cpu.recentHits = []; cpu.x = PLAY_WIDTH / 2; cpu.y = canvas.height * 0.2;
            cpu.targetX = cpu.x; cpu.targetY = cpu.y;
            bullets.length = 0;
            magicCircles.length = 0;
            gameState = 'BATTLE';
            turnCount = 1;
            selectedPlayerCards = []; // リセット

            // CPUのデッキ・アビリティ・パッシブをプレイヤーと同じ枚数制限に設定してバランス調整
            let allActiveIds = defaultCards.active.map(c => c.id);
            let cpuDeck = [];
            while (true) {
                let shuffledActives = [...allActiveIds].sort(() => Math.random() - 0.5);
                let candidateDeck = shuffledActives.slice(0, 6);
                let totalCost = candidateDeck.reduce((sum, id) => {
                    const card = defaultCards.active.find(c => c.id === id);
                    return sum + (card ? card.cost : 0);
                }, 0);
                if (totalCost <= 20) {
                    cpuDeck = candidateDeck;
                    break;
                }
            }
            cpu.deck = cpuDeck;
            cpu.hand = [...cpu.deck];

            let allAbilityIds = defaultCards.ability.map(c => c.id);
            let shuffledAbilities = [...allAbilityIds].sort(() => Math.random() - 0.5);
            cpu.abilities = shuffledAbilities.slice(0, 3);
            cpu.usedAbilities = [];
            cpu.ab3Shield = false;

            let allPassiveIds = defaultCards.passive.map(c => c.id);
            let shuffledPassives = [...allPassiveIds].sort(() => Math.random() - 0.5);
            let numPassives = cpuDifficulty === 'EASY' ? 1 : cpuDifficulty === 'NORMAL' ? 2 : cpuDifficulty === 'HARD' ? 3 : 4;
            cpu.passives = shuffledPassives.slice(0, numPassives);

            changePhase('PLANNING', 'PLAYER'); // プレイヤー先攻で開始
        }

        function applyPassives() {
            player.speed = 405; player.slowSpeed = 135; player.grazeRadius = 30;
            cpu.speed = 200; cpu.slowSpeed = 70; cpu.grazeRadius = 30;

            if (turnCount === 1) return; // 第1ターンはパッシブ無効

            // player パッシブ
            if (player.passives.includes('p2')) {
                player.speed = 500;
                player.slowSpeed = 170;
            }
            if (player.passives.includes('p9')) {
                player.speed = Math.floor(player.speed * 1.12);
                player.slowSpeed = Math.floor(player.slowSpeed * 1.12);
            }
            if (player.passives.includes('p18')) {
                player.slowSpeed = Math.floor(player.slowSpeed * 1.25); // 韋駄天 (低速速度+25%)
            }
            if (player.passives.includes('p3')) player.grazeRadius = 45;

            // cpu パッシブ
            if (cpu.passives.includes('p2')) {
                cpu.speed = 280;
                cpu.slowSpeed = 95;
            }
            if (cpu.passives.includes('p9')) {
                cpu.speed = Math.floor(cpu.speed * 1.12);
                cpu.slowSpeed = Math.floor(cpu.slowSpeed * 1.12);
            }
            if (cpu.passives.includes('p18')) {
                cpu.slowSpeed = Math.floor(cpu.slowSpeed * 1.25); // 韋駄天 (低速速度+25%)
            }
            if (cpu.passives.includes('p3')) cpu.grazeRadius = 45;
        }

        let selectedPlayerCards = []; // PLANNINGフェーズでのプレイヤーのカード選択インデックス

        function fillHandAbilities(owner = 'PLAYER') {
            let target = owner === 'PLAYER' ? player : cpu;
            if (!target.abilities) target.abilities = [];
            if (!target.usedAbilities) target.usedAbilities = [];
            if (!target.hand) target.hand = [];

            // 手札の長さが6になるまで、装備アビリティ(未使用かつ手札にないもの)からランダムに補充
            while (target.hand.length < 6) {
                let candidates = target.abilities.filter(id => id && !target.usedAbilities.includes(id) && !target.hand.includes(id));
                if (candidates.length === 0) break; // 補充できるアビリティがなければ終了

                let randIdx = Math.floor(Math.random() * candidates.length);
                let chosenId = candidates[randIdx];
                target.hand.push(chosenId);
            }
        }

        function changePhase(phase, owner) {
            if (isCustomCardTesting) return;
            if (gameState !== 'BATTLE') return;

            battlePhase = phase;
            turnOwner = owner;

            // 古い決定ボタンがあればフェーズ移行時に確実に消去
            const oldBtn = document.querySelector('.cast-btn');
            if (oldBtn) oldBtn.remove();

            if (phase === 'PLANNING') {
                // 憤怒の炎 (p22) バフの準備＆更新
                player.p22Buff = (turnCount > 1 && player.hitLastTurn) || false;
                player.hitLastTurn = false; // 消費
                cpu.p22Buff = (turnCount > 1 && cpu.hitLastTurn) || false;
                cpu.hitLastTurn = false; // 消費

                // 幸運のダイス (p23) / 霊素調和 (p26) の処理 (毎ターン開始時)
                if (turnCount > 1) {
                    // PLAYER の開始時パッシブ
                    if (player.passives.includes('p23') && Math.random() < 0.10) {
                        if (Math.random() < 0.5) {
                            player.isInvincible = true;
                            player.invincibleTimer = 1.5;
                            addBattleEffect("【幸運のダイス】 完全無敵(1.5秒)獲得！", "#ffff88");
                        } else {
                            if (player.bombs < player.maxBombs) {
                                player.bombs++;
                                addBattleEffect("【幸運のダイス】 ボムが1つ回復！", "#aaffaa");
                            }
                        }
                    }
                    if (player.passives.includes('p26') && Math.random() < 0.20) {
                        if (player.bombs < player.maxBombs) {
                            player.bombs++;
                            addBattleEffect("【霊素調和】 ボムが1つ回復！", "#aaffaa");
                        }
                    }

                    // CPU の開始時パッシブ
                    if (cpu.passives.includes('p23') && Math.random() < 0.10) {
                        if (Math.random() < 0.5) {
                            cpu.isInvincible = true;
                            cpu.invincibleTimer = 1.5;
                            addBattleEffect("【幸運のダイス】 相手が完全無敵(1.5秒)を獲得！", "#ffff88");
                        } else {
                            if (cpu.bombs < cpu.maxBombs) {
                                cpu.bombs++;
                                addBattleEffect("【幸運のダイス】 相手のボムが1つ回復！", "#ffaacc");
                            }
                        }
                    }
                    if (cpu.passives.includes('p26') && Math.random() < 0.20) {
                        if (cpu.bombs < cpu.maxBombs) {
                            cpu.bombs++;
                            addBattleEffect("【霊素調和】 相手のボムが1つ回復！", "#ffaacc");
                        }
                    }
                }

                // 6ターンごとの一括カードリセット (1ターン目、7ターン目、13ターン目...)
                // ターン内の所有者切り替え（CPUへの移行時）に重複リロードが走るバグを防ぐため、PLAYERターン開始時にのみ実行する
                if (owner === 'PLAYER' && (turnCount - 1) % 6 === 0) {
                    player.hand = [...player.deck];
                    player.usedAbilities = [];
                    cpu.hand = [...cpu.deck];
                    cpu.usedAbilities = [];
                    // 戦闘中ならリロードエフェクトを出す
                    if (turnCount > 1) {
                        addBattleEffect("◆ デッキ ＆ アビリティ 全リロード！ ◆", "#ffff00");
                    }
                }

                // アビリティによる手札の空き枠の穴埋め補充
                fillHandAbilities('PLAYER');
                fillHandAbilities('CPU');

                applyPassives();
                selectedPlayerCards = []; // フェーズ移行時に選択をクリア
                battleOverlay.classList.remove('hidden');
                let turnText = turnCount === 1 ? "第1ターン (パッシブ無効)" : `第${turnCount}ターン`;

                if (owner === 'PLAYER') {
                    if (turnCount >= 7) {
                        phaseText.innerHTML = `${turnText}<br><span style="color:#00ffff; font-family:'Noto Serif JP',serif; font-size:22px;">あなたのターン：策謀 (T7以降 同時2枚使用可能！)</span><br><span style="font-size:12px;color:#ffaaff;margin-top:6px;display:block;">[1]〜[6]キー またはクリックでカードを2枚選択してください</span>`;
                    } else {
                        phaseText.innerHTML = `${turnText}<br><span style="color:#00ffff; font-family:'Noto Serif JP',serif; font-size:22px;">あなたのターン：策謀</span><br><span style="font-size:12px;color:#aaa;margin-top:6px;display:block;">[1]〜[6]キー またはクリックでカードを選択</span>`;
                    }
                    renderHand();
                } else {
                    if (turnCount >= 7) {
                        phaseText.innerHTML = `${turnText}<br><span style="color:#ff5555; font-family:'Noto Serif JP',serif; font-size:22px;">相手のターン：策謀 (T7以降 同時2枚使用！)</span><br><span style="font-size:12px;color:#aaa;margin-top:6px;display:block;">相手がカードを2枚選んでいます...</span>`;
                    } else {
                        phaseText.innerHTML = `${turnText}<br><span style="color:#ff5555; font-family:'Noto Serif JP',serif; font-size:22px;">相手のターン：策謀</span><br><span style="font-size:12px;color:#aaa;margin-top:6px;display:block;">相手がカードを選んでいます...</span>`;
                    }
                    handContainer.innerHTML = '';

                    // オンライン対戦中は自動思考タイマーを起動させず、通信経由でのキャスト情報を待つ
                    if (isOnlineMode) {
                        return;
                    }

                    setTimeout(() => {
                        if (gameState !== 'BATTLE') return;

                        // CPUのアビリティ使用判断AI
                        let abIdsInHand = cpu.hand.filter(id => id && id.startsWith('ab'));
                        let chosenAbiId = null;

                        if (abIdsInHand.length > 0) {
                            // 1. 瀕死（HP<350）時の生命息吹(ab2)・霊力還元(ab6)の緊急回復
                            if (cpu.hp < 350) {
                                if (abIdsInHand.includes('ab2')) chosenAbiId = 'ab2';
                                else if (abIdsInHand.includes('ab6')) chosenAbiId = 'ab6';
                            }
                            // 2. とどめ（プレイヤーHP<=120）時の波状爆撃(ab4)の奇襲
                            if (!chosenAbiId && player.hp <= 120 && abIdsInHand.includes('ab4')) {
                                chosenAbiId = 'ab4';
                            }
                            // 3. ボム枯渇時の霊力充填(ab1)
                            if (!chosenAbiId && cpu.bombs === 0 && abIdsInHand.includes('ab1')) {
                                chosenAbiId = 'ab1';
                            }
                            // 4. 防御目的の瞬間結界(ab5)・精神統一(ab3)
                            if (!chosenAbiId && cpu.hp < 500 && cpu.bombs === 0) {
                                if (abIdsInHand.includes('ab5') && Math.random() < 0.6) chosenAbiId = 'ab5';
                                else if (abIdsInHand.includes('ab3') && Math.random() < 0.6) chosenAbiId = 'ab3';
                            }

                            // 5. 手札がすべてアビリティカードの場合は、どれか1つを必ず使う
                            if (!chosenAbiId && cpu.hand.every(id => id && id.startsWith('ab'))) {
                                chosenAbiId = abIdsInHand[Math.floor(Math.random() * abIdsInHand.length)];
                            }

                            // 6. 通常時もたまにトリッキーに使う (25%の確率)
                            if (!chosenAbiId && Math.random() < 0.25) {
                                chosenAbiId = abIdsInHand[Math.floor(Math.random() * abIdsInHand.length)];
                            }
                        }

                        let selectedIds = [];

                        if (turnCount >= 7) {
                            // 2枚選ぶ
                            if (chosenAbiId) {
                                selectedIds.push(chosenAbiId);
                            }
                            let needed = 2 - selectedIds.length;
                            for (let i = 0; i < needed; i++) {
                                let remaining = cpu.hand.filter(id => id && !selectedIds.includes(id));
                                if (remaining.length === 0) break;
                                // アクティブカードを優先
                                let actives = remaining.filter(id => !id.startsWith('ab'));
                                if (actives.length > 0) {
                                    let picked = actives[Math.floor(Math.random() * actives.length)];
                                    selectedIds.push(picked);
                                } else {
                                    let picked = remaining[Math.floor(Math.random() * remaining.length)];
                                    selectedIds.push(picked);
                                }
                            }
                        } else {
                            // 1枚選ぶ
                            if (chosenAbiId) {
                                selectedIds.push(chosenAbiId);
                            } else {
                                let actives = cpu.hand.filter(id => id && !id.startsWith('ab'));
                                if (actives.length > 0) {
                                    let picked = actives[Math.floor(Math.random() * actives.length)];
                                    selectedIds.push(picked);
                                } else if (abIdsInHand.length > 0) {
                                    let picked = abIdsInHand[Math.floor(Math.random() * abIdsInHand.length)];
                                    selectedIds.push(picked);
                                }
                            }
                        }

                        if (selectedIds.length > 0) {
                            selectedIds = filterCustomCompatibleCastIds(selectedIds);
                            // 手札から消費
                            selectedIds.forEach(id => {
                                let idx = cpu.hand.indexOf(id);
                                if (idx !== -1) {
                                    cpu.hand.splice(idx, 1);
                                }
                            });

                            let abilityIds = selectedIds.filter(id => id && id.startsWith('ab'));
                            let activeIds = selectedIds.filter(id => id && !id.startsWith('ab'));

                            if (abilityIds.length > 0) {
                                abilityIds.forEach(id => {
                                    applyAbilityEffect(id, 'CPU');
                                });
                            }

                            fillHandAbilities('CPU');

                            if (activeIds.length > 0) {
                                startActionPhase(activeIds);
                            } else {
                                changePhase('RESOLUTION', 'CPU');
                                resolutionTimer = 0.8;
                            }
                        } else {
                            fillHandAbilities('CPU');
                            changePhase('RESOLUTION', 'CPU');
                            resolutionTimer = 0.5;
                        }
                    }, 1500);
                }
            } else if (phase === 'ACTION') {
                battleOverlay.classList.add('hidden');
            } else if (phase === 'RESOLUTION') {
                battleOverlay.classList.remove('hidden');
                handContainer.innerHTML = '';

                let t = turnCount - 1;
                let baseDmgMult = Math.pow(2, (t * t + 15 * t) / 450);

                // p24 共鳴波動 の適用（相手の歪み倍率の増加量が 15% 上昇）
                let playerDmgMult = baseDmgMult;
                let cpuDmgMult = baseDmgMult;
                if (cpu.passives.includes('p24') && t > 0) {
                    playerDmgMult = 1.0 + (baseDmgMult - 1.0) * 1.15;
                }
                if (player.passives.includes('p24') && t > 0) {
                    cpuDmgMult = 1.0 + (baseDmgMult - 1.0) * 1.15;
                }

                let healReducePercent = (400 / 59) * (Math.pow(3.95, t / 15) - 1);
                let healMult = Math.max(0, 1 - (healReducePercent / 100));

                let playerDmg = Math.floor(player.pendingDamage * playerDmgMult);
                let cpuDmg = Math.floor(cpu.pendingDamage * cpuDmgMult);
                let playerHeal = Math.floor(player.pendingHeal * healMult);
                let cpuHeal = Math.floor(cpu.pendingHeal * healMult);
                let pMsg = [];

                if (turnCount > 1) {
                    if (playerDmg > 0 && player.passives.includes('p1')) {
                        let reduce = Math.min(playerDmg, 20); playerDmg -= reduce;
                        pMsg.push(`[PLAYER] パッシブ被弾軽減: ダメージ${reduce}軽減`);
                    }
                    if (cpuDmg > 0 && cpu.passives.includes('p1')) {
                        let reduce = Math.min(cpuDmg, 20); cpuDmg -= reduce;
                        let oppLabel = isOnlineMode ? 'ENEMY' : 'CPU';
                        pMsg.push(`[${oppLabel}] パッシブ被弾軽減: ダメージ${reduce}軽減`);
                    }
                }

                // 【急】精神統一の半減シールド処理
                if (playerDmg > 0 && player.ab3Shield) {
                    let prevDmg = playerDmg;
                    playerDmg = Math.floor(playerDmg / 2);
                    player.ab3Shield = false; // 消費
                    pMsg.push(`[PLAYER] 【急】精神統一シールド：ダメージ${prevDmg - playerDmg}軽減(半減)`);
                }
                if (cpuDmg > 0 && cpu.ab3Shield) {
                    let prevDmg = cpuDmg;
                    cpuDmg = Math.floor(cpuDmg / 2);
                    cpu.ab3Shield = false; // 消費
                    let oppLabel = isOnlineMode ? 'ENEMY' : 'CPU';
                    pMsg.push(`[${oppLabel}] 【急】精神統一シールド：ダメージ${prevDmg - cpuDmg}軽減(半減)`);
                }

                player.hp -= playerDmg;
                // p25 絶体絶命 (プレイヤー踏みとどまり判定)
                if (turnCount > 1 && player.hp <= 0 && player.passives.includes('p25') && !player.p25Triggered) {
                    player.hp = 1;
                    player.p25Triggered = true;
                    player.isInvincible = true;
                    player.invincibleTimer = 1.5;
                    pMsg.push(`[PLAYER] 【絶体絶命】 発動！ 一度だけHP1で踏みとどまり完全無敵！`);
                }

                cpu.hp -= cpuDmg;
                // p25 絶体絶命 (CPU踏みとどまり判定)
                if (turnCount > 1 && cpu.hp <= 0 && cpu.passives.includes('p25') && !cpu.p25Triggered) {
                    cpu.hp = 1;
                    cpu.p25Triggered = true;
                    cpu.isInvincible = true;
                    cpu.invincibleTimer = 1.5;
                    let oppLabel = isOnlineMode ? 'ENEMY' : 'CPU';
                    pMsg.push(`[${oppLabel}] 【絶体絶命】 発動！ 一度だけHP1で踏みとどまり完全無敵！`);
                }

                player.hp = Math.min(player.maxHp || 1000, player.hp + playerHeal);
                cpu.hp = Math.min(cpu.maxHp || 1000, cpu.hp + cpuHeal);
                player.pendingDamage = 0; cpu.pendingDamage = 0; player.pendingHeal = 0; cpu.pendingHeal = 0;
                player.recentHits = []; cpu.recentHits = [];

                let html = `<span style="font-family:'Noto Serif JP',serif; font-size:24px; color:#ffcc00; letter-spacing:2px;">精算フェーズ</span><br>`;
                if (t > 0) html += `<span style="font-size:12px; color:#cccccc;">【境界の歪み】 ダメージ ${baseDmgMult.toFixed(2)}倍 / 回復量 -${Math.floor(healReducePercent)}%</span><br>`;
                html += `<br><span style="font-size:18px; color:#ff8888;">PLAYER: -${playerDmg} DMG</span>`;
                if (playerHeal > 0) html += ` <span style="font-size:18px; color:#88ff88;">(+${playerHeal} HP)</span>`;
                let oppLabel = isOnlineMode ? 'ENEMY' : 'CPU';
                html += `<br><span style="font-size:18px; color:#ff8888;">${oppLabel}: -${cpuDmg} DMG</span>`;
                if (cpuHeal > 0) html += ` <span style="font-size:18px; color:#88ff88;">(+${cpuHeal} HP)</span>`;
                html += `<br>`;

                if (pMsg.length > 0) html += `<br><span style="font-size:12px; color:#88ff88; line-height:1.4;">${pMsg.join('<br>')}</span>`;
                phaseText.innerHTML = html;
                phaseText.style.color = "#ffffff";

                checkDeath();

                if (gameState === 'BATTLE') {
                    resolutionTimer = 4.0;
                }
            }
        }

        // 変数の大文字小文字を区別せずに取得・設定するグローバルヘルパー
        window.getBulletVar = function(variables, name) {
            if (!variables) return undefined;
            if (variables[name] !== undefined) return variables[name];
            let lowerName = name.toLowerCase();
            for (let key in variables) {
                if (Object.prototype.hasOwnProperty.call(variables, key)) {
                    if (key.toLowerCase() === lowerName) {
                        return variables[key];
                    }
                }
            }
            return undefined;
        };

        window.setBulletVar = function(variables, name, value) {
            if (!variables) return;
            if (Object.prototype.hasOwnProperty.call(variables, name)) {
                variables[name] = value;
                return;
            }
            let lowerName = name.toLowerCase();
            for (let key in variables) {
                if (Object.prototype.hasOwnProperty.call(variables, key)) {
                    if (key.toLowerCase() === lowerName) {
                        variables[key] = value;
                        return;
                    }
                }
            }
            variables[name] = value;
        };

        window.hasBulletVar = function(variables, name) {
            if (!variables) return false;
            if (Object.prototype.hasOwnProperty.call(variables, name)) return true;
            let lowerName = name.toLowerCase();
            for (let key in variables) {
                if (Object.prototype.hasOwnProperty.call(variables, key)) {
                    if (key.toLowerCase() === lowerName) {
                        return true;
                    }
                }
            }
            return false;
        };