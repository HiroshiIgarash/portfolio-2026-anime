/*-----------------------------------------------
 * PRISM SECTION
 * ガラス質感のカードが漂い、クリックで拡大するフィナーレ演出
-------------------------------------------------*/
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const canvas = document.querySelector('.js-prismCanvas');
const stage = canvas.closest('.prism');

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
	{ src: root + 'assets/img/top/mv1.jpg', caption: 'KV 1 / 空を見上げる少年と少女' },
	{ src: root + 'assets/img/top/mv2.jpg', caption: 'KV 2 / 山頂へ続く道' },
	{ src: root + 'assets/img/top/mv3.jpg', caption: 'KV 3 / バレーボール' },
	{ src: root + 'assets/img/top/about-bg.jpg', caption: 'ABOUT 背景' },
	{ src: root + 'assets/img/top/projects-bg.jpg', caption: 'PROJECTS 背景' }
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
	{ y: 0.1, z: 0.4 }
];

// 画面外に出てから消したいが、固定値だとレーンによって(奥のレーンほど
// 視野が広がるため)画面内でまだ見えているうちに消えてしまうことがある。
// カメラの実際の視野幅から動的に計算して、常に画面外で切り替わるようにする
let flowLeftBound = -10;
let flowRightBound = 10;

function computeFlowBound() {
	// 最も奥(カメラから遠い)のレーンでも画面外になるよう、そのレーンの視野幅を基準にする
	const maxZ = Math.max(...LANES.map((l) => l.z)) + 0.5; // ジッター分の余裕
	const distance = camera.position.z - maxZ;
	const vFov = camera.fov * Math.PI / 180;
	const visibleHeight = 2 * Math.tan(vFov / 2) * distance;
	const visibleWidth = visibleHeight * camera.aspect;
	return visibleWidth / 2 + 2; // カード半幅+余白ぶん、画面外に確実に出す
}

function randomizeSpawn(userData, lane, { initial = false } = {}) {
	userData.y = lane.y + (Math.random() - 0.5) * 0.4;
	userData.z = lane.z + (Math.random() - 0.5) * 0.4;
	userData.rotZ = (Math.random() - 0.5) * (Math.PI * 0.6);
	// 厚み(側面)が見えるようにx軸方向にも軽く傾ける
	userData.rotX = (Math.random() - 0.5) * (Math.PI * 0.3);
	userData.scale = 0.7 + Math.random() * 0.7;
	// 奥のレーンほどゆっくり、手前ほど速く流れる(視差)
	userData.speed = 0.5 + (userData.z + 2.5) * 0.12 + Math.random() * 0.25;
	userData.spinSpeed = 0.15 + Math.random() * 0.25;
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

const clock = new THREE.Clock();

function animate() {
	requestAnimationFrame(animate);
	const dt = Math.min(clock.getDelta(), 0.05);

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
