/**
 * Danmaku DSL TypeScript Definition File
 * VS Code IntelliSense / Autocomplete Support
 */

declare type BulletType = 'normal' | 'trail' | 'laser';
declare type BulletImage = 'ohuda' | 'kome' | 'star' | 'b_star' | 'onmyoutama' | 'marutama' | 'ootama' | 'poihuru' | 'uroko' | 'sword' | 'knife' | 'kunai1' | 'kunai2' | 'virus' | 'dangan' | 'none';
declare type CoordMode = 'relative' | 'absolute';
declare type EasingType = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
declare type TweenMode = 'seconds' | 'frames' | 'step' | 'vecstep';
declare type SoundName = 'shot' | 'tan00' | 'kira00' | 'cat00' | 'damage00' | 'damage01' | 'cardget' | 'fault' | 'pldead00' | 'timeout';

/**
 * 全方位リング弾を生成します。
 * @param bulletType 弾種 ('normal' | 'trail' | 'laser')
 * @param color 弾色 (例: '#ff3344')
 * @param speed 弾速 (例: 170)
 * @param angle 発射角度 (例: angle, angle + 15)
 * @param count 弾数 (例: 16)
 * @param offsetX Xオフセット (デフォルト: 0)
 * @param offsetY Yオフセット (デフォルト: 0)
 * @param radius 描画サイズ半径 (デフォルト: 20)
 * @param bulletImage 弾画像 ('ohuda' | 'kome' | 'star' | 'b_star' | 'onmyoutama' | 'marutama' | 'ootama' | 'poihuru' | 'uroko' | 'sword' | 'knife' | 'kunai1' | 'kunai2' | 'virus' | 'dangan' | 'none')
 * @param coordMode 座標空間 ('relative' | 'absolute')
 * @param hitRadius 当たり判定半径 (例: 6)
 */
declare function spawnRing(
    bulletType: BulletType,
    color: string,
    speed: number | string,
    angle: number | string,
    count: number | string,
    offsetX?: number | string,
    offsetY?: number | string,
    radius?: number | string,
    bulletImage?: BulletImage,
    coordMode?: CoordMode,
    hitRadius?: number | string
): void;

/**
 * 扇状（Way）弾を生成します。
 */
declare function spawnWay(
    bulletType: BulletType,
    color: string,
    speed: number | string,
    angle: number | string,
    count: number | string,
    spread: number | string,
    offsetX?: number | string,
    offsetY?: number | string,
    radius?: number | string,
    bulletImage?: BulletImage,
    coordMode?: CoordMode,
    hitRadius?: number | string
): void;

/**
 * 直線単発弾を生成します。
 */
declare function spawnStraight(
    bulletType: BulletType,
    color: string,
    speed: number | string,
    angle: number | string,
    offsetX?: number | string,
    offsetY?: number | string,
    radius?: number | string,
    bulletImage?: BulletImage,
    coordMode?: CoordMode,
    hitRadius?: number | string
): void;

/**
 * トレイル（軌跡）弾を生成します。
 */
declare function spawnTrail(
    color: string,
    speed: number | string,
    angle: number | string,
    offsetX?: number | string,
    offsetY?: number | string,
    radius?: number | string,
    growTime?: number | string,
    keepTime?: number | string,
    shrinkTime?: number | string,
    round?: boolean | string,
    coordMode?: CoordMode,
    hitRadius?: number | string
): void;

/**
 * レーザーWay弾を生成します。
 */
declare function spawnLaserWay(
    color: string,
    radius: number | string,
    speed: number | string,
    angle: number | string,
    count: number | string,
    spread: number | string,
    offsetX?: number | string,
    offsetY?: number | string,
    growTime?: number | string,
    keepTime?: number | string,
    shrinkTime?: number | string,
    round?: boolean | string,
    coordMode?: CoordMode,
    hitRadius?: number | string
): void;

/**
 * レーザーリング弾を生成します。
 */
declare function spawnLaserRing(
    color: string,
    radius: number | string,
    speed: number | string,
    angle: number | string,
    count: number | string,
    offsetX?: number | string,
    offsetY?: number | string,
    growTime?: number | string,
    keepTime?: number | string,
    shrinkTime?: number | string,
    round?: boolean | string,
    coordMode?: CoordMode,
    hitRadius?: number | string
): void;

/**
 * 極太ビームレーザーを生成します。
 */
declare function spawnBeam(
    warningTime: number | string,
    activeTime: number | string,
    laserWidth: number | string,
    angle: number | string,
    offsetX?: number | string,
    offsetY?: number | string,
    coordMode?: CoordMode,
    hitRadius?: number | string
): void;

/**
 * 魔法陣（子機）を配置します。
 */
declare function spawnMagicCircle(
    color: string,
    radius: number | string,
    duration: number | string,
    offsetX?: number | string,
    offsetY?: number | string,
    coordMode?: CoordMode
): void;

/**
 * ターゲット（自機）の方向へ発射角度（angle）を設定します。
 */
declare function aimAtTarget(): void;

/**
 * 指定した座標へ向けて発射角度（angle）を設定します。
 */
declare function aimAt(targetX: number | string, targetY: number | string): void;

/**
 * 発射元（ボス等）を指定の座標へ即座に移動させます。
 */
declare function moveTo(x: number | string, y: number | string): void;

/**
 * 発射元（ボス等）を指定の座標へ指定秒数かけて移動させます。
 */
declare function slideTo(x: number | string, y: number | string, duration: number | string): void;

/**
 * 指定秒数だけ処理を待機します。
 */
declare function wait(seconds: number | string): void;

/**
 * 指定した回数だけ処理を繰り返します。
 */
declare function repeat(count: number | string): void;

/**
 * 変数を時間をかけて滑らかに変化させます。
 */
declare function tween(
    varName: string,
    fromVal: number | string,
    toVal: number | string,
    mode?: TweenMode,
    duration?: number | string,
    easing?: EasingType
): void;

/**
 * 完了待機付きで変数を変化させます。
 */
declare function tweenWait(
    varName: string,
    fromVal: number | string,
    toVal: number | string,
    mode?: TweenMode,
    duration?: number | string,
    easing?: EasingType
): void;

/**
 * 角度（angle）を滑らかに変化させます。
 */
declare function tweenAngle(
    fromAngle: number | string,
    toAngle: number | string,
    mode?: 'seconds' | 'frames',
    duration?: number | string,
    easing?: EasingType
): void;

/**
 * 効果音（SE）を再生します。
 */
declare function playSound(soundName: SoundName): void;

/**
 * 弾速を減速させます。
 */
declare function slow(effect: number | string, delay?: number | string): void;

/**
 * 弾速を加速させます。
 */
declare function fast(effect: number | string, delay?: number | string): void;

/**
 * 画面端で弾を反射（バウンス）させます。
 */
declare function bounce(): void;

/**
 * 弾をホーミング追尾弾にします。
 */
declare function homing(turnSpeed?: number | string): void;

/**
 * ランダムな数値を返します。
 */
declare function rand(min: number, max: number): number;

/** 現在の発射角度 */
declare let angle: number;
/** 現在の弾速 */
declare let speed: number;
/** X座標オフセット */
declare let x_offset: number;
/** Y座標オフセット */
declare let y_offset: number;
/** 経過秒数 */
declare let second: number;
/** 経過フレーム数 */
declare let frame: number;
/** 弾画像の回転角度 */
declare let spriteAngle: number;
