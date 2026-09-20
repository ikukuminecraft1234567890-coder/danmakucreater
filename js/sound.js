// Web Audio API を用いた効果音管理クラス
class SoundManager {
    constructor() {
        this.ctx = null;
        this.buffers = {};
        this.files = {
            'bomb': 'se/bomb.wav',
            'bomb2': 'se/bomb2.wav',
            'change': 'se/change.wav',
            'boon00': 'se/se_boon00.wav',
            'boon01': 'se/se_boon01.wav',
            'cardget': 'se/se_cardget.wav',
            'cat00': 'se/se_cat00.wav',
            'ch00': 'se/se_ch00.wav',
            'ch02': 'se/se_ch02.wav',
            'don00': 'se/se_don00.wav',
            'fault': 'se/se_fault.wav',
            'gun00': 'se/se_gun00.wav',
            'lazer00': 'se/se_lazer00.wav',
            'pldead00': 'se/se_pldead00.wav',
            'tan00': 'se/se_tan00.wav',
            'tan00_raw': 'se/se_tan00.wav',
            'timeout': 'se/se_timeout.wav',
            'damage00': 'se/se_damage00.wav',
            'damage01': 'se/se_damage01.wav'
        };
        // 既存コードやブロックコマンド用のエイリアスマッピング
        this.aliases = {
            'cardget': 'cardget',
            'se_cardget': 'cardget',
            'cat00': 'cat00',
            'se_cat00': 'cat00',
            'spell': 'cat00',
            'spell_card': 'cat00',
            'fault': 'fault',
            'se_fault': 'fault',
            'pldead00': 'pldead00',
            'se_pldead00': 'pldead00',
            'timeout': 'timeout',
            'se_timeout': 'timeout',
            'don00': 'don00',
            'se_don00': 'don00',
            'tan00': 'tan00',
            'se_tan00': 'tan00',
            'damage00': 'damage00',
            'se_damage00': 'damage00',
            'piko': 'damage00',
            'se_piko': 'damage00',
            'damage01': 'damage01',
            'se_damage01': 'damage01',
            'boon00': 'boon00',
            'se_boon00': 'boon00',
            'boon01': 'boon01',
            'se_boon01': 'boon01',
            'gun00': 'gun00',
            'se_gun00': 'gun00',
            'lazer00': 'lazer00',
            'se_lazer00': 'lazer00',
            'ch00': 'ch00',
            'se_ch00': 'ch00',
            'ch02': 'ch02',
            'se_ch02': 'ch02',
            'shot': 'tan00',            // 通常ショット音
            'shot_raw': 'tan00_raw',     // 等倍ショット音
            'laser_heavy': 'gun00',      // 太レーザー音
            'laser': 'lazer00',          // 細レーザー音
            'charge': 'ch00',            // チャージ音1
            'charge2': 'ch02',           // チャージ音2
            'maspa_short': 'bomb',       // マスパ短
            'maspa_long': 'bomb2',       // マスパ長
            'change': 'change',          // 切り替え音
            
            // 互換性のための古いエイリアス
            'bomb_explode': 'bomb',
            'kawaru': 'change',
            'cast': 'ch02',
            'player_shot': 'gun00',
            'hit': 'pldead00'
        };
        this.volume = 0.3; // デフォルト30%
        this.initialized = false;
        this.compressor = null;
        this.balances = {
            'tan00': 0.35, // ショット音のみを個別に小さく調整
            'damage00': 0.7,
            'damage01': 0.7
        };
        this.useHtml5Audio = (window.location.protocol === 'file:');
        
        // HTML5 Audio キャッシュ
        this.html5Audios = {};
        
        // 未ロード時に要求された再生リクエストのキュー: { [key]: [{ time, cancelPrevious }] }
        this.pendingPlays = {};
        
        // 「直前の音をキャンセル」管理用ノード（音の種類ごとに独立して管理）
        this.lastCancelableSource = {}; // { [key]: AudioBufferSourceNode }
        this.lastCancelableGain = {};   // { [key]: GainNode }
        this.lastCancelableAudio = {};  // { [key]: Audio }

        // 同一フレーム内の重複再生制限用（音の種類ごとに独立して管理）
        this.lastPlayFrame = {}; // { [key]: number }
        this.lastPlayTime = {};  // { [key]: number }

        this.frameId = 0;
        if (typeof requestAnimationFrame !== 'undefined') {
            const step = () => {
                this.frameId++;
                requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
        }
    }

    init() {
        if (this.initialized) return;
        this.initialized = true;

        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass && !this.useHtml5Audio) {
            try {
                this.ctx = new AudioContextClass();
                // 音割れ（クリッピング）防止用のダイナミクス・コンプレッサーの作成
                this.compressor = this.ctx.createDynamicsCompressor();
                this.compressor.threshold.setValueAtTime(-24, this.ctx.currentTime);
                this.compressor.knee.setValueAtTime(30, this.ctx.currentTime);
                this.compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
                this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
                this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);
                this.compressor.connect(this.ctx.destination);
            } catch (e) {
                console.warn('AudioContext creation error:', e);
            }
        }

        // ユーザーの操作で AudioContext を即座にアンロック（ブラウザの自動再生ポリシー対応）
        const resumeCtx = () => {
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        };
        window.addEventListener('click', resumeCtx, { passive: true });
        window.addEventListener('keydown', resumeCtx, { passive: true });
        window.addEventListener('touchstart', resumeCtx, { passive: true });
        window.addEventListener('pointerdown', resumeCtx, { passive: true });

        // http/https の場合は全音声ファイルを事前ロードしてデコード
        if (!this.useHtml5Audio && this.ctx) {
            Object.entries(this.files).forEach(([key, path]) => {
                fetch(path)
                    .then(res => {
                        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                        return res.arrayBuffer();
                    })
                    .then(arrayBuffer => {
                        if (this.ctx) {
                            return this.ctx.decodeAudioData(arrayBuffer);
                        }
                        throw new Error("AudioContext is null");
                    })
                    .then(buffer => {
                        this.buffers[key] = buffer;
                        // ロード待ちキューの処理（1秒以内のリクエストなら即座に再生）
                        if (this.pendingPlays[key] && this.pendingPlays[key].length > 0) {
                            const requests = this.pendingPlays[key];
                            delete this.pendingPlays[key];
                            const now = performance.now();
                            for (let req of requests) {
                                if (now - req.time <= 1000) {
                                    this.playBuffer(key, buffer, req.cancelPrevious);
                                }
                            }
                        }
                    })
                    .catch(err => console.error('Failed to load/decode sound:', path, err));
            });
        } else if (this.useHtml5Audio) {
            // HTML5 Audio 用に全ファイルを事前ロード
            Object.entries(this.files).forEach(([key, path]) => {
                try {
                    let audio = new Audio(path);
                    audio.preload = 'auto';
                    audio.load();
                    this.html5Audios[key] = audio;
                } catch (e) {}
            });
        }
    }

    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
    }

    // 同一フレーム内で既にこのキーの音が鳴っているか判定（同一フレーム重複防止）
    canPlayInCurrentFrame(key) {
        const now = performance.now();
        const curFrame = (typeof window !== 'undefined' && typeof window.currentCardFrame === 'number')
            ? window.currentCardFrame
            : this.frameId;

        const lastFrame = this.lastPlayFrame[key];
        const lastTime = this.lastPlayTime[key];

        // 同一フレーム番号、または前回再生から12ms未満（同一フレーム内）の場合はスキップ
        if (lastFrame !== undefined && lastFrame === curFrame) {
            return false;
        }
        if (lastTime !== undefined && (now - lastTime) < 12) {
            return false;
        }

        this.lastPlayFrame[key] = curFrame;
        this.lastPlayTime[key] = now;
        return true;
    }

    // 直前のキャンセル可能サウンドを停止する (targetKey指定時はその種類のみ、null時は全種類)
    stopPreviousCancelableSound(targetKey = null) {
        if (!this.useHtml5Audio && this.ctx) {
            const keysToStop = targetKey ? (this.lastCancelableSource[targetKey] ? [targetKey] : []) : Object.keys(this.lastCancelableSource);
            for (let k of keysToStop) {
                const oldGain = this.lastCancelableGain[k];
                const oldSrc = this.lastCancelableSource[k];
                if (oldGain && oldSrc) {
                    try {
                        const now = this.ctx.currentTime;
                        // クリックノイズ（プチ音）防止：3msで音量をゼロへフェードアウト
                        oldGain.gain.cancelScheduledValues(now);
                        oldGain.gain.setValueAtTime(oldGain.gain.value, now);
                        oldGain.gain.linearRampToValueAtTime(0.0001, now + 0.003);
                        // AudioContextのタイムライン上で3ms後に即時ハード停止（遅延ゼロ）
                        oldSrc.stop(now + 0.003);
                    } catch (e) {}
                }
                delete this.lastCancelableSource[k];
                delete this.lastCancelableGain[k];
            }
        } else if (this.useHtml5Audio) {
            const keysToStop = targetKey ? (this.lastCancelableAudio[targetKey] ? [targetKey] : []) : Object.keys(this.lastCancelableAudio);
            for (let k of keysToStop) {
                const oldAudio = this.lastCancelableAudio[k];
                if (oldAudio) {
                    try {
                        oldAudio.pause();
                        oldAudio.currentTime = 0;
                    } catch (e) {}
                }
                delete this.lastCancelableAudio[k];
            }
        }
    }

    playHtml5(name, cancelPrevious = false) {
        let key = this.aliases[name] || name;
        let path = this.files[key];
        if (!path) return;
        try {
            if (cancelPrevious) {
                this.stopPreviousCancelableSound(key);
            }

            let audio = new Audio(path);
            let balance = this.balances[key] !== undefined ? this.balances[key] : 1.0;
            audio.volume = this.volume * balance;

            if (cancelPrevious) {
                this.lastCancelableAudio[key] = audio;
                audio.onended = () => {
                    if (this.lastCancelableAudio[key] === audio) {
                        delete this.lastCancelableAudio[key];
                    }
                };
            }

            audio.play().catch(e => {
                // 自動再生ポリシーなどの一時的なエラーは無視
            });
        } catch (e) {
            console.error('HTML5 audio play error:', e);
        }
    }

    play(name, cancelPrevious = false) {
        if (!this.initialized) {
            this.init();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        let key = this.aliases[name] || name;

        // 同一フレーム内の音は必ず一回までしか鳴らさない（キーごとに判定）
        if (!this.canPlayInCurrentFrame(key)) {
            return;
        }

        if (this.useHtml5Audio) {
            this.playHtml5(name, cancelPrevious);
            return;
        }

        const buffer = this.buffers[key];
        if (!buffer) {
            // バッファデコード待ちの場合はキューに積んで完了時に即座に再生
            if (!this.pendingPlays[key]) {
                this.pendingPlays[key] = [];
            }
            if (cancelPrevious) {
                this.pendingPlays[key] = [{ time: performance.now(), cancelPrevious: true }];
            } else {
                this.pendingPlays[key].push({ time: performance.now(), cancelPrevious: false });
            }
            return;
        }

        this.playBuffer(key, buffer, cancelPrevious);
    }

    playBuffer(key, buffer, cancelPrevious = false) {
        if (!this.ctx) return;
        try {
            if (cancelPrevious) {
                // 該当キー（同じ種類の音）の直前の音のみをキャンセル！
                this.stopPreviousCancelableSound(key);
            }

            const source = this.ctx.createBufferSource();
            source.buffer = buffer;

            const gainNode = this.ctx.createGain();
            const balance = this.balances[key] !== undefined ? this.balances[key] : 1.0;
            gainNode.gain.value = this.volume * balance;

            source.connect(gainNode);

            // コンプレッサーノードが作成できていれば接続し、そうでなければ直接スピーカーへ
            if (this.compressor) {
                gainNode.connect(this.compressor);
            } else {
                gainNode.connect(this.ctx.destination);
            }

            if (cancelPrevious) {
                this.lastCancelableSource[key] = source;
                this.lastCancelableGain[key] = gainNode;
                source.onended = () => {
                    if (this.lastCancelableSource[key] === source) {
                        delete this.lastCancelableSource[key];
                        delete this.lastCancelableGain[key];
                    }
                };
            }

            source.start(0);
        } catch (e) {
            console.error('Error playing sound buffer:', key, e);
        }
    }

    // 食らいボム猶予開始時用の「ピコっ」電子音（高音から低音への鋭い下降音）
    playPiko() {
        if (!this.initialized) this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        if (!this.ctx) {
            this.playHtml5('damage00');
            return;
        }
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const now = this.ctx.currentTime;

            // 高音から低音へキュッと急降下するシャープな下降ピコ音 (2600Hz -> 1100Hz)
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(2600, now);
            osc.frequency.exponentialRampToValueAtTime(1100, now + 0.045);

            let vol = Math.max(0.35, this.volume * 1.6);
            gain.gain.setValueAtTime(vol, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

            osc.connect(gain);
            if (this.compressor) {
                gain.connect(this.compressor);
            } else {
                gain.connect(this.ctx.destination);
            }

            osc.start(now);
            osc.stop(now + 0.055);
        } catch (e) {
            console.error('Error playing piko sound:', e);
            this.playHtml5('damage00');
        }
    }
}

// グローバルインスタンスの作成
window.soundManager = new SoundManager();

// 読み込み直後に即時初期化とプリロードを開始
window.soundManager.init();
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.soundManager.init();
        });
    }
}

// グローバルな playSound 関数の定義
window.playSound = function(name, cancelPrevious = false) {
    if (name === 'piko' || name === 'se_piko') {
        window.soundManager.playPiko();
        return;
    }
    window.soundManager.play(name, cancelPrevious);
};

