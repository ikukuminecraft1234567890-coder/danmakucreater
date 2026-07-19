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
            'ch00': 'se/se_ch00.wav',
            'ch02': 'se/se_ch02.wav',
            'don00': 'se/se_don00.wav',
            'gun00': 'se/se_gun00.wav',
            'lazer00': 'se/se_lazer00.wav',
            'tan00': 'se/se_tan00.wav',
            'tan00_raw': 'se/se_tan00.wav'
        };
        // 既存コードやブロックコマンド用のエイリアスマッピング
        this.aliases = {
            'shot': 'tan00',            // 通常ショット音
            'shot_raw': 'tan00_raw',     // 等倍ショット音
            'laser_heavy': 'gun00',      // 太レーザー音
            'laser': 'lazer00',          // 細レーザー音
            'charge': 'ch00',            // チャージ音1
            'charge2': 'ch02',           // チャージ音2
            'maspa_short': 'bomb',       // マスパ短
            'maspa_long': 'bomb2',       // マスパ長
            'boon00': 'boon00',          // アビリティ音
            'boon01': 'boon01',          // 被弾/回復音？
            'don00': 'don00',            // ドン音
            'change': 'change',          // 切り替え音
            
            // 互換性のための古いエイリアス
            'bomb_explode': 'bomb',
            'kawaru': 'change',
            'cast': 'ch02',
            'player_shot': 'gun00',
            'hit': 'bomb'
        };
        this.volume = 0.3; // デフォルト30%
        this.initialized = false;
        this.compressor = null;
        this.balances = {
            'tan00': 0.35 // ショット音のみを個別に小さく調整
        };
        this.useHtml5Audio = (window.location.protocol === 'file:');
    }

    init() {
        if (this.initialized) return;
        if (this.useHtml5Audio) {
            this.initialized = true;
            return;
        }
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        this.ctx = new AudioContextClass();
        this.initialized = true;

        // 音割れ（クリッピング）防止用のダイナミクス・コンプレッサーの作成
        try {
            this.compressor = this.ctx.createDynamicsCompressor();
            this.compressor.threshold.setValueAtTime(-24, this.ctx.currentTime);
            this.compressor.knee.setValueAtTime(30, this.ctx.currentTime);
            this.compressor.ratio.setValueAtTime(12, this.ctx.currentTime);
            this.compressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
            this.compressor.release.setValueAtTime(0.25, this.ctx.currentTime);
            this.compressor.connect(this.ctx.destination);
        } catch (e) {
            console.error('Failed to create DynamicsCompressor:', e);
        }

        // 音声ファイルの事前ロードとデコード
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
                })
                .catch(err => console.error('Failed to load/decode sound:', path, err));
        });

        // ユーザーの最初の操作で AudioContext を再開（ブラウザの自動再生ポリシー対応）
        const resumeCtx = () => {
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
        };
        window.addEventListener('click', resumeCtx, { passive: true });
        window.addEventListener('keydown', resumeCtx, { passive: true });
        window.addEventListener('touchstart', resumeCtx, { passive: true });
    }

    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
    }

    playHtml5(name) {
        let key = this.aliases[name] || name;
        let path = this.files[key];
        if (!path) return;
        try {
            let audio = new Audio(path);
            let balance = this.balances[key] !== undefined ? this.balances[key] : 1.0;
            audio.volume = this.volume * balance;
            audio.play().catch(e => {
                // 自動再生ポリシーなどの一時的なエラーは無視
            });
        } catch (e) {
            console.error('HTML5 audio play error:', e);
        }
    }

    play(name) {
        if (!this.initialized) {
            this.init();
        }
        if (this.useHtml5Audio) {
            this.playHtml5(name);
            return;
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        let key = this.aliases[name] || name;
        const buffer = this.buffers[key];
        if (!buffer) return;

        try {
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
            
            source.start(0);
        } catch (e) {
            console.error('Error playing sound:', name, e);
        }
    }
}

// グローバルインスタンスの作成
window.soundManager = new SoundManager();

// グローバルな playSound 関数の定義
window.playSound = function(name) {
    window.soundManager.play(name);
};
