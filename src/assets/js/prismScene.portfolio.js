/*-----------------------------------------------
 * PRISM SECTION
 * ガラス質感のカードが漂い、クリックで拡大するフィナーレ演出
-------------------------------------------------*/
import * as THREE from "three";

const canvas = document.querySelector('.js-prismCanvas');
const stage = canvas.closest('.prism');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const mainScene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
camera.position.set(0, 0, 12);

function resize() {
	const w = stage.clientWidth;
	const h = stage.clientHeight;
	renderer.setSize(w, h, false);
	camera.aspect = w / h;
	camera.updateProjectionMatrix();
}

function animate() {
	requestAnimationFrame(animate);
	renderer.render(mainScene, camera);
}

window.addEventListener('resize', resize);
resize();
animate();
