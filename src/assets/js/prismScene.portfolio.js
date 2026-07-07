/*-----------------------------------------------
 * PRISM SECTION
 * ガラス質感のカードが漂い、クリックで拡大するフィナーレ演出
-------------------------------------------------*/
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

function isWebglAvailable() {
	try {
		const testCanvas = document.createElement('canvas');
		return !!(window.WebGLRenderingContext && (testCanvas.getContext('webgl2') || testCanvas.getContext('webgl')));
	} catch (e) {
		return false;
	}
}

if (!isWebglAvailable()) {
	// WebGL非対応環境ではcanvasを隠し、Task 1でHTMLに用意した .prism__fallback (picture要素) を見せる
	document.querySelector('.js-prismCanvas').style.display = 'none';
	document.querySelector('.prism__fallback').classList.add('--is-visible');
	throw new Error('PRISM: WebGL not available, falling back to static image');
}

const canvas = document.querySelector('.js-prismCanvas');
const stage = canvas.closest('.prism');
// カード拡大時、画面中央上部に固定表示しているTHANK YOU（top.portfolio.jsのsetupPrismIntro）と
// 重なって邪魔になるため、拡大中だけフェードアウトさせる
const introThanks = document.querySelector('.js-prismIntroThanks');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const mainScene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
camera.position.set(0, 0, 12);

// ガラスの反射に使う環境マップ(部屋っぽいライティングを簡易生成)
const pmremGenerator = new THREE.PMREMGenerator(renderer);
mainScene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

mainScene.add(new THREE.AmbientLight(0xffffff, 0.6));
const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
keyLight.position.set(3, 4, 5);
mainScene.add(keyLight);

function resize() {
	const w = stage.clientWidth;
	const h = stage.clientHeight;
	renderer.setSize(w, h, false);
	camera.aspect = w / h;
	camera.updateProjectionMatrix();
	flowRightBound = computeFlowBound();
	flowLeftBound = -flowRightBound;
}

const root = document.body.dataset.root;
const textureLoader = new THREE.TextureLoader();
const cardSources = [
	{ src: root + 'assets/img/top/mv1.jpg', caption: 'まだ見たことのない体験を、届けたい。' },
	{ src: root + 'assets/img/top/mv2.jpg', caption: '登ったのは、まだ高尾山だけ。いつか富士山の頂に立ちたい。' },
	{ src: root + 'assets/img/top/mv3.jpg', caption: '中学・高校はバレー部。去年までサークルでも続けていました。' },
	{ src: root + 'assets/img/top/about-bg.jpg', caption: '長い散歩の日は、田んぼ道を歩くことも。自然の中はやっぱり気持ちいい。' },
	{ src: root + 'assets/img/top/projects-bg.jpg', caption: '15時間かけて歩いた先にあるのは温泉。疲れた足を癒すこの時間が最高です。' },
	{ src: root + 'assets/img/top/private/walk.jpg', caption: '毎週土曜は15時間の散歩デー。3日かけて日光東照宮まで歩いたこともあります。' },
	{ src: root + 'assets/img/top/private/akabeko.jpg', caption: '福島県会津若松市出身。冬は雪深く、とにかく寒いです。' },
	{ src: root + 'assets/img/top/private/anime.jpg', caption: 'にじさんじを設立当初から箱推し、今年で8年目。まだまだ推していきます。' },
	{ src: root + 'assets/img/top/private/maimai.jpg', caption: '毎日の散歩のついでにmaimaiを数曲プレイ。プレイ目的でつい歩くので、ダイエットにもちょうどいいです。' },
	{ src: root + 'assets/img/top/private/coding.jpg', caption: 'Claude Codeのおかげで個人開発がぐっと身近に。いつかマネタイズにも挑戦したいです。' }
];

function makeCaptionTexture(text, image) {
	const cvs = document.createElement('canvas');
	cvs.width = 512;
	cvs.height = 320;
	const ctx = cvs.getContext('2d');
	if (image) {
		// 表面と同じ画像を cover 方式(アスペクト比維持、中央クロップ)で敷き、
		// 上から暗いオーバーレイを重ねて文字を読みやすくする
		const scale = Math.max(cvs.width / image.width, cvs.height / image.height);
		const w = image.width * scale;
		const h = image.height * scale;
		ctx.drawImage(image, (cvs.width - w) / 2, (cvs.height - h) / 2, w, h);
		ctx.fillStyle = 'rgba(8, 12, 20, 0.62)';
		ctx.fillRect(0, 0, cvs.width, cvs.height);
	} else {
		ctx.fillStyle = '#12141b';
		ctx.fillRect(0, 0, cvs.width, cvs.height);
	}
	ctx.strokeStyle = 'rgba(255,255,255,0.25)';
	ctx.lineWidth = 4;
	ctx.strokeRect(8, 8, cvs.width - 16, cvs.height - 16);
	ctx.fillStyle = '#fff';
	ctx.font = '28px sans-serif';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	wrapCaptionText(ctx, text, cvs.width / 2, cvs.height / 2, 420, 36);
	return new THREE.CanvasTexture(cvs);
}

function wrapCaptionText(ctx, text, x, y, maxWidth, lineHeight) {
	const chars = text.split('');
	let line = '';
	const lines = [];
	chars.forEach((ch) => {
		const test = line + ch;
		if (ctx.measureText(test).width > maxWidth && line !== '') {
			lines.push(line);
			line = ch;
		} else {
			line = test;
		}
	});
	lines.push(line);
	const startY = y - ((lines.length - 1) * lineHeight) / 2;
	lines.forEach((l, i) => ctx.fillText(l, x, startY + i * lineHeight));
}

// カード同士が重なって透過表示が破綻しないよう、y/z は「専用レーン」に固定する。
// 流れる x 位置だけが変化し、レーン間で十分な奥行き差があるため重なりにくい。
const LANES = [
	{ y: 1.7, z: 1.6 },
	{ y: 0.6, z: -1.6 },
	{ y: -0.5, z: 2.4 },
	{ y: -1.7, z: -0.6 },
	{ y: 0.1, z: 0.4 },
	{ y: 2.3, z: 0.9 },
	{ y: 1.1, z: -2.2 },
	{ y: -0.1, z: 1.9 },
	{ y: -1.1, z: -1.9 },
	{ y: -2.3, z: 0.0 }
];

// 画面外に出てから消したいが、固定値だとレーンによって(奥のレーンほど
// 視野が広がるため)画面内でまだ見えているうちに消えてしまうことがある。
// カメラの実際の視野幅から動的に計算して、常に画面外で切り替わるようにする
let flowLeftBound = -10;
let flowRightBound = 10;

function computeFlowBound() {
	// 最も奥(カメラから遠い)のレーンでも画面外になるよう、そのレーンの視野幅を基準にする
	const minZ = Math.min(...LANES.map((l) => l.z)) - 0.5; // ジッター分の余裕(遠ざける方向)
	const distance = camera.position.z - minZ;
	const vFov = camera.fov * Math.PI / 180;
	const visibleHeight = 2 * Math.tan(vFov / 2) * distance;
	const visibleWidth = visibleHeight * camera.aspect;
	return visibleWidth / 2 + 2; // カード半幅+余白ぶん、画面外に確実に出す
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const MOTION_SCALE = prefersReducedMotion ? 0.25 : 1;

function randomizeSpawn(userData, lane, { initial = false } = {}) {
	userData.y = lane.y + (Math.random() - 0.5) * 0.4;
	userData.z = lane.z + (Math.random() - 0.5) * 0.4;
	userData.rotZ = (Math.random() - 0.5) * (Math.PI * 0.6);
	// 厚み(側面)が見えるようにx軸方向にも軽く傾ける
	userData.rotX = (Math.random() - 0.5) * (Math.PI * 0.3);
	userData.scale = 0.7 + Math.random() * 0.7;
	// 奥のレーンほどゆっくり、手前ほど速く流れる(視差)
	userData.speed = (0.5 + (userData.z + 2.5) * 0.12 + Math.random() * 0.25) * MOTION_SCALE;
	userData.spinSpeed = (0.15 + Math.random() * 0.25) * MOTION_SCALE;
	userData.x = initial
		? THREE.MathUtils.lerp(flowLeftBound, flowRightBound, Math.random())
		: flowRightBound + Math.random() * 3;
}

const cards = [];
cardSources.forEach((def, laneIndex) => {
	const geo = new THREE.BoxGeometry(2.4, 1.5, 0.08);

	const glassSide = new THREE.MeshPhysicalMaterial({
		color: 0xffffff,
		transmission: 1,
		thickness: 0.4,
		roughness: 0.05,
		ior: 1.5,
		envMapIntensity: 1.3,
		metalness: 0
	});
	const backMat = new THREE.MeshPhysicalMaterial({
		// 画像ロード完了まではテキストのみの暗い面を仮表示しておく
		map: makeCaptionTexture(def.caption, null),
		transmission: 0.2,
		thickness: 0.5,
		roughness: 0.12,
		clearcoat: 1,
		clearcoatRoughness: 0.1,
		ior: 1.45,
		iridescence: 0.4,
		iridescenceIOR: 1.3,
		iridescenceThicknessRange: [100, 400],
		envMapIntensity: 1.3
	});
	const frontMat = new THREE.MeshPhysicalMaterial({
		map: textureLoader.load(def.src, (tex) => {
			// 前面の画像ロードが終わったら、同じ画像を暗くした裏面テクスチャに差し替える
			backMat.map = makeCaptionTexture(def.caption, tex.image);
			backMat.needsUpdate = true;
		}),
		transmission: 0.2,
		thickness: 0.5,
		roughness: 0.12,
		clearcoat: 1,
		clearcoatRoughness: 0.1,
		ior: 1.45,
		iridescence: 0.4,
		iridescenceIOR: 1.3,
		iridescenceThicknessRange: [100, 400],
		envMapIntensity: 1.3
	});

	// BoxGeometry の面順: +x, -x, +y, -y, +z(front), -z(back)
	const mesh = new THREE.Mesh(geo, [glassSide, glassSide, glassSide, glassSide, frontMat, backMat]);
	mesh.userData = { expanded: false, paused: false };
	randomizeSpawn(mesh.userData, LANES[laneIndex], { initial: true });
	mesh.position.set(mesh.userData.x, mesh.userData.y, mesh.userData.z);
	mesh.rotation.z = mesh.userData.rotZ;
	mesh.rotation.x = mesh.userData.rotX;
	mesh.scale.setScalar(mesh.userData.scale);

	mainScene.add(mesh);
	cards.push(mesh);
});

/*-----------------------------------------------
 * クリック判定: カードにヒットしたら拡大トグル。
 * - 拡大中でないカードをクリック → カメラ手前へ移動しつつ回転して拡大表示
 * - 拡大中のカードを再クリック → 元の位置・大きさ・角度に戻す
 * - 拡大中は他のカードのクリックを無視する(同時に2枚拡大させない)
-------------------------------------------------*/
const EXPAND_DURATION = 0.9;
const EXPAND_Z = 5;
const EXPAND_FILL_HEIGHT = 0.78; // 画面高さに対して占めさせたい割合
const EXPAND_FILL_WIDTH = 0.92; // 画面幅に対して占めさせたい割合(縦長画面での幅制約)
const CARD_WIDTH = 2.4;
const CARD_HEIGHT = 1.5;
let expandedCard = null;

// 元のカードは大きさがランダム(0.7〜1.4倍)なので、単純な倍率だと
// 拡大後の見た目サイズがカードごとにバラつく。カメラ距離とFOVから
// 「画面に対して常に同じ割合で大きく見える」絶対スケールを逆算する
function computeExpandScale() {
	const distance = camera.position.z - EXPAND_Z;
	const vFov = camera.fov * Math.PI / 180;
	const visibleHeight = 2 * Math.tan(vFov / 2) * distance;
	const visibleWidth = visibleHeight * camera.aspect;
	const scaleByHeight = (visibleHeight * EXPAND_FILL_HEIGHT) / CARD_HEIGHT;
	const scaleByWidth = (visibleWidth * EXPAND_FILL_WIDTH) / CARD_WIDTH;
	return Math.min(scaleByHeight, scaleByWidth);
}

// 自転中のカードは現在角度が半端な値になっているため、単純に +3π するだけだと
// 最終角度も半端なまま(中途半端な傾きで止まる)。目標を「絶対角度として
// ちょうど裏(π)/表(0)に一致する、現在より先の角度」に計算し直し、
// かつ最低1周は回転するようにする
function nextExactAngle(current, targetMod) {
	const twoPi = Math.PI * 2;
	const currentMod = ((current % twoPi) + twoPi) % twoPi;
	let target = current - currentMod + targetMod;
	if (target <= current) target += twoPi;
	return target + twoPi;
}

function expandCard(card) {
	const ud = card.userData;
	ud.paused = true;
	ud.expanded = true;
	expandedCard = card;

	// カメラ(z=12)との間に十分な余白を残す(近づきすぎ対策)
	gsap.to(card.position, {
		x: 0, y: 0, z: EXPAND_Z,
		duration: EXPAND_DURATION,
		ease: 'power3.inOut'
	});
	// 画面サイズに対して常に同じ割合で大きく見えるよう、絶対スケールを都度計算する
	const targetScale = computeExpandScale();
	gsap.to(card.scale, {
		x: targetScale, y: targetScale, z: targetScale,
		duration: EXPAND_DURATION,
		ease: 'power3.inOut'
	});
	// 1周以上回りつつ、絶対角度としてぴったり裏(π)を向く位置で止める
	gsap.to(card.rotation, {
		x: 0, y: nextExactAngle(card.rotation.y, Math.PI), z: 0,
		duration: EXPAND_DURATION,
		ease: 'power3.inOut'
	});
	if (introThanks) {
		gsap.to(introThanks, { opacity: 0, duration: EXPAND_DURATION, ease: 'power3.inOut' });
	}
}

function collapseCard(card) {
	const ud = card.userData;
	gsap.to(card.position, {
		x: ud.x, y: ud.y, z: ud.z,
		duration: EXPAND_DURATION,
		ease: 'power3.inOut'
	});
	gsap.to(card.scale, {
		x: ud.scale, y: ud.scale, z: ud.scale,
		duration: EXPAND_DURATION,
		ease: 'power3.inOut'
	});
	if (introThanks) {
		gsap.to(introThanks, { opacity: 1, duration: EXPAND_DURATION, ease: 'power3.inOut' });
	}
	// 同様に1周以上回りつつ、絶対角度としてぴったり表(0)に戻す
	gsap.to(card.rotation, {
		x: ud.rotX, y: nextExactAngle(card.rotation.y, 0), z: ud.rotZ,
		duration: EXPAND_DURATION,
		ease: 'power3.inOut',
		onComplete() {
			// 蓄積角度が延々と増え続けないよう、見た目が同じ 0-2π の範囲に畳む
			card.rotation.y = card.rotation.y % (Math.PI * 2);
			ud.paused = false;
			ud.expanded = false;
			expandedCard = null;
		}
	});
}

const raycaster = new THREE.Raycaster();
const pointerNdc = new THREE.Vector2();

function onPointerClick(clientX, clientY) {
	const rect = stage.getBoundingClientRect();
	pointerNdc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
	pointerNdc.y = -((clientY - rect.top) / rect.height) * 2 + 1;

	raycaster.setFromCamera(pointerNdc, camera);
	const hits = raycaster.intersectObjects(cards);

	if (expandedCard) {
		// 拡大中のカードをクリックした時だけ元に戻す。他はまだ拡大中なので無視
		if (hits.length > 0 && hits[0].object === expandedCard) {
			collapseCard(expandedCard);
		}
		return;
	}

	if (hits.length === 0) return;
	expandCard(hits[0].object);
}

// タップ操作は touchstart 発火直後にブラウザが合成 click も発火するため、
// 何もガードしないと1回のタップで onPointerClick が2回走ってしまう
// (1回目で拡大開始→2回目が「拡大中カードへの再クリック」と誤判定され即座に collapse する)。
// 同一ポインタ操作からの呼び出しを一定時間内は1回にまとめる。
const POINTER_DEDUPE_MS = 500;
let lastPointerHandledAt = -Infinity;
function handlePointer(clientX, clientY) {
	const now = performance.now();
	if (now - lastPointerHandledAt < POINTER_DEDUPE_MS) return;
	lastPointerHandledAt = now;
	onPointerClick(clientX, clientY);
}
stage.addEventListener('click', (e) => handlePointer(e.clientX, e.clientY));
stage.addEventListener('touchstart', (e) => {
	const t = e.touches[0];
	if (t) handlePointer(t.clientX, t.clientY);
}, { passive: true });

// マウス移動: カメラの軽いパララックスに反映
// (バネ+減衰のスプリングで柔らかく追従させる。lerpのみだと一定速度で
// 近づくだけの硬い動きになるため、行き過ぎて戻るような柔らかさを出す)
let mouseNdc = { x: 0.5, y: 0.5 };
const smoothMouse = { x: 0.5, y: 0.5 };
const mouseVelocity = { x: 0, y: 0 };
const MOUSE_SPRING = 0.16;
const MOUSE_DAMPING = 0.82;
stage.addEventListener('mousemove', (e) => {
	const rect = stage.getBoundingClientRect();
	mouseNdc.x = (e.clientX - rect.left) / rect.width;
	mouseNdc.y = 1 - (e.clientY - rect.top) / rect.height;
});
stage.addEventListener('touchmove', (e) => {
	const t = e.touches[0];
	if (!t) return;
	const rect = stage.getBoundingClientRect();
	mouseNdc.x = (t.clientX - rect.left) / rect.width;
	mouseNdc.y = 1 - (t.clientY - rect.top) / rect.height;
}, { passive: true });

const clock = new THREE.Clock();

function animate() {
	requestAnimationFrame(animate);
	const dt = Math.min(clock.getDelta(), 0.05);

	mouseVelocity.x = (mouseVelocity.x + (mouseNdc.x - smoothMouse.x) * MOUSE_SPRING) * MOUSE_DAMPING;
	mouseVelocity.y = (mouseVelocity.y + (mouseNdc.y - smoothMouse.y) * MOUSE_SPRING) * MOUSE_DAMPING;
	smoothMouse.x += mouseVelocity.x;
	smoothMouse.y += mouseVelocity.y;

	camera.position.x = THREE.MathUtils.lerp(camera.position.x, (smoothMouse.x - 0.5) * 2.0, 0.08);
	camera.position.y = THREE.MathUtils.lerp(camera.position.y, (smoothMouse.y - 0.5) * 1.2, 0.08);
	camera.lookAt(0, 0, 0);

	cards.forEach((card, laneIndex) => {
		const ud = card.userData;
		if (ud.paused) return; // 拡大/縮小アニメーション中は流れる動きを止める(Task 5で使用)

		// 右から左へ流れる。左端を越えたら右端からランダム属性で再登場(同じレーン内で)
		ud.x -= ud.speed * dt;
		if (ud.x < flowLeftBound) {
			randomizeSpawn(ud, LANES[laneIndex]);
		}
		card.position.set(ud.x, ud.y, ud.z);
		card.scale.setScalar(ud.scale);
		card.rotation.z = ud.rotZ;
		card.rotation.x = ud.rotX;
		card.rotation.y += ud.spinSpeed * dt;
	});

	renderer.render(mainScene, camera);
}

window.addEventListener('resize', resize);
resize();
animate();
