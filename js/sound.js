// Web Audio API を用いた効果音管理クラス
class SoundManager {
    constructor() {
        this.ctx = null;
        this.buffers = {};
        this.files = {
            'bomb': 'se/bomb.wav',
            'change': 'se/change.wav',
            'boon00': 'se/se_boon00.wav',
            'boon01': 'se/se_boon01.wav',
            'ch00': 'se/se_ch00.wav',
            'ch02': 'se/se_ch02.wav',
            'don00': 'se/se_don00.wav',
            'gun00': 'se/se_gun00.wav',
            'lazer00': 'se/se_lazer00.wav',
            'tan00': 'se/se_tan00.wav'
        };
        // 既存コードやブロックコマンド用のエイリアスマッピング
        this.aliases = {
            'bomb_explode': 'bomb',
            'kawaru': 'change',
            'charge': 'ch00',
            'cast': 'ch02',
            'shot': 'tan00',
            'player_shot': 'gun00',
            'laser': 'lazer00',
            'hit': 'bomb',
            'ability': 'boon00',
            'turn_start': 'don00'
        };
        this.volume = 0.3; // デフォルト30%
        this.initialized = false;
        this.lastPlayTime = {};
    }

    init() {
        if (this.initialized) return;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        this.ctx = new AudioContextClass();
        this.initialized = true;

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

    play(name) {
        if (!this.initialized) {
            this.init();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        let key = this.aliases[name] || name;
        const buffer = this.buffers[key];
        if (!buffer) return;

        // 頻繁に重なる弾発射音や被弾音のクールダウン制御（50ms）
        const now = performance.now();
        if (this.lastPlayTime[key] && (now - this.lastPlayTime[key] < 50)) {
            if (key === 'tan00' || key === 'gun00' || key === 'bomb') {
                return;
            }
        }
        this.lastPlayTime[key] = now;

        try {
            const source = this.ctx.createBufferSource();
            source.buffer = buffer;

            const gainNode = this.ctx.createGain();
            gainNode.gain.value = this.volume;

            source.connect(gainNode);
            gainNode.connect(this.ctx.destination);
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
