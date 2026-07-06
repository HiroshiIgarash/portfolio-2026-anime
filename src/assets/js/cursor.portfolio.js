/*-----------------------------------------------
 * CUSTOM CURSOR [PC(pointer:fine)限定でネイティブカーソルの代わりにdot+ringを追従させる]
-------------------------------------------------*/
const cursorPointerFine = window.matchMedia('(pointer: fine)');

const CURSOR_HOVER_SELECTOR = 'a, button, [role="button"]';
const CURSOR_TEXT_SELECTOR = 'input, textarea, select, [contenteditable]';
const CURSOR_RING_EASE = .08;

/**
 * elから上に辿り、リンク/ボタン相当 or 明示的にcursor:pointerが
 * 指定されている要素を探す(スタイル側でclassを都度足していないため
 * computed styleで拾う)。
 * body.--customCursorが付いている間はSCSS側で `cursor:none !important` を
 * 当てているため、computed styleを読む間だけ一時的に外して元のcursor値を復元する
 */
function findCursorHoverTarget(el) {
	const hadCustomCursorClass = document.body.classList.contains('--customCursor');
	if (hadCustomCursorClass) {
		document.body.classList.remove('--customCursor');
	}

	let node = el;
	let found = null;
	while (node && node !== document.body && node !== document.documentElement) {
		if (node.matches && (node.matches(CURSOR_HOVER_SELECTOR) || getComputedStyle(node).cursor === 'pointer')) {
			found = node;
			break;
		}
		node = node.parentElement;
	}

	if (hadCustomCursorClass) {
		document.body.classList.add('--customCursor');
	}
	return found;
}

function initCursor() {
	const cursorDot = document.createElement('div');
	cursorDot.className = 'cursor -dot js-cursorDot';
	cursorDot.innerHTML = '<i class="cursor__body"></i>';

	const cursorRing = document.createElement('div');
	cursorRing.className = 'cursor -ring js-cursorRing';
	cursorRing.innerHTML = '<i class="cursor__body"></i><span class="cursor__label">VIEW</span>';

	document.body.appendChild(cursorDot);
	document.body.appendChild(cursorRing);

	let mouseX = 0;
	let mouseY = 0;
	let ringX = 0;
	let ringY = 0;
	let hasMoved = false;
	let isOverTextTarget = false;

	function lerp(start, end, amount) {
		return start + (end - start) * amount;
	}

	// ネイティブカーソルの非表示はbody.--customCursorで切り替える
	// (テキスト入力系の上ではネイティブのtext/caretカーソルに戻す)
	function updateCursorVisibility() {
		document.body.classList.toggle('--customCursor', hasMoved && !isOverTextTarget);
	}

	document.addEventListener('mousemove', function (e) {
		mouseX = e.clientX;
		mouseY = e.clientY;
		if (!hasMoved) {
			hasMoved = true;
			ringX = mouseX;
			ringY = mouseY;
			updateCursorVisibility();
		}
	});

	document.addEventListener('mouseover', function (e) {
		isOverTextTarget = !!(e.target.closest && e.target.closest(CURSOR_TEXT_SELECTOR));
		updateCursorVisibility();

		const hoverTarget = isOverTextTarget ? null : findCursorHoverTarget(e.target);
		cursorRing.classList.toggle('is-active', !!hoverTarget);
		cursorDot.classList.toggle('is-hidden', !!hoverTarget);
	});

	// ウィンドウ外に出たら追従を止め、再度動かした位置から表示し直す
	document.addEventListener('mouseleave', function () {
		hasMoved = false;
		updateCursorVisibility();
	});

	(function raf() {
		cursorDot.style.transform = 'translate3d(' + mouseX + 'px, ' + mouseY + 'px, 0)';

		ringX = lerp(ringX, mouseX, CURSOR_RING_EASE);
		ringY = lerp(ringY, mouseY, CURSOR_RING_EASE);
		cursorRing.style.transform = 'translate3d(' + ringX + 'px, ' + ringY + 'px, 0)';

		requestAnimationFrame(raf);
	})();
}

if (cursorPointerFine.matches) {
	initCursor();
}
