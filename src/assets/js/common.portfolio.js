/*-----------------------------------------------
 * Root
-------------------------------------------------*/
let root = $("body").data('root');
let page = $("body").data('page');
const pcOnly = window.matchMedia('(min-width: 769px)');
const spOnly = window.matchMedia('(max-width: 768px)');


/*-----------------------------------------------
 * PAGE TRANSITION
-------------------------------------------------*/
const pageTransitionCircleA = document.querySelector('.js-pageTransitionCircleA');
const pageTransitionCircleB = document.querySelector('.js-pageTransitionCircleB');

let pageTransitionLock = false;

function playPageTransitionClose() {
	gsap.set([pageTransitionCircleA, pageTransitionCircleB], { scale: 1, left: '50%', top: '50%' });

	gsap.timeline({
		onComplete: function () {
			window.__pageTransitionClosed = true;
			document.dispatchEvent(new CustomEvent('pageTransitionClosed'));
		},
	})
		.to(pageTransitionCircleB, {
			scale: 0,
			duration: .5,
			ease: 'power2.out',
		}, 0)
		.to(pageTransitionCircleA, {
			scale: 0,
			duration: .5,
			ease: 'power2.out',
		}, .12);
}

window.__pageTransitionClosed = false;
playPageTransitionClose();

// bfcache(戻る/進むでJSが再実行されないケース)復帰時、円が広がりきった
// 状態のまま固まって見えるため、離脱前の状態に関わらず毎回closeし直す
window.addEventListener('pageshow', function (e) {
	if (!e.persisted) {
		return;
	}
	pageTransitionLock = false;
	playPageTransitionClose();
});

function isPlainLeftClick(e) {
	return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}

function handlePageTransitionLinkClick(e) {
	const link = e.currentTarget;

	if (link.target === '_blank' || !isPlainLeftClick(e)) {
		return;
	}
	if (link.href === location.href) {
		e.preventDefault();
		return;
	}
	if (pageTransitionLock) {
		e.preventDefault();
		return;
	}

	e.preventDefault();
	pageTransitionLock = true;

	[pageTransitionCircleA, pageTransitionCircleB].forEach(function (circle) {
		circle.style.left = e.clientX + 'px';
		circle.style.top = e.clientY + 'px';
	});

	gsap.timeline({
		onComplete: function () {
			location.href = link.href;
		},
	})
		.fromTo(pageTransitionCircleA, { scale: 0 }, {
			scale: 1,
			duration: .5,
			ease: 'power2.in',
		}, 0)
		.fromTo(pageTransitionCircleB, { scale: 0 }, {
			scale: 1,
			duration: .5,
			ease: 'power2.in',
		}, .12);
}


/*-----------------------------------------------
 * COMMON
-------------------------------------------------*/
$(function(){

	// Page Transition - Link Click
	$('.js-pageTransitionLink').on('click', handlePageTransitionLinkClick);

	// Anchor Smooth Scroll
	$('.js-anchor').on('click', function(){
		let speed = 1000;
		let href = $(this).attr("href");
		let target = $(href == "#" || href == "" ? 'html' : href);
		let position = target.offset().top;
		$('body,html').animate({scrollTop: position}, speed, 'easeOutQuart');
		return false;
	});

	set_scrani();

	// Header Nav - Open/Close
	$('.js-navBtn').on('click', function () {
		const isActive = $('.js-header').toggleClass('is-active').hasClass('is-active');
		$('body').css({ overflow: isActive ? 'hidden' : '' });
		if (isActive) {
			lenis.stop();
		} else {
			lenis.start();
		}
	});

	// PROJECTS - Modal Open/Close
	$('.js-projectsModalOpen').on('click', function () {
		const modalID = $(this).data('modal');
		$('#' + modalID).fadeIn(500);
		$('.js-modalBox').fadeIn(500);
		$('body').css({ overflow: 'hidden' });
		lenis.stop();
	});

	function modalClose() {
		$('.modalBox, .oneModal').fadeOut(500);
		$('body').css({ overflow: '' });
		lenis.start();
	}

	$('.js-modalClose').on('click', function () {
		modalClose();
	});

	$('.js-oneModalIn').on('click touchend', function (e) {
		if (!$(e.target).closest('.js-oneModalIn__cont').length) {
			modalClose();
		}
	});

});


/*-----------------------------------------------
 * ScrollAnimation for IntersectionObserver [.js-scrani 要素が見えたら is-ani をaddclass するやつ]
-------------------------------------------------*/
const set_scrani = () => {
	const SCRANI_ACTIVE_CLASSNAME = '--is-ani';
	const scrani_callback = (entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add(SCRANI_ACTIVE_CLASSNAME);
			}
		});
	}
	const scrani_option = {
		rootMargin: '-30% 0px',
	}
	const scrani_observer = new IntersectionObserver(scrani_callback, scrani_option);

	const target_scrani = document.querySelectorAll('.js-scrani');
	target_scrani.forEach((elem) => {
		scrani_observer.observe(elem);
	});
}


/*-----------------------------------------------
 * Lenis[Scroll]
-------------------------------------------------*/
const lenis = new Lenis()

lenis.on('scroll', (e) => {
//   console.log(e)
})

lenis.on('scroll', ScrollTrigger.update)

gsap.ticker.add((time)=>{
  lenis.raf(time * 1000)
})

gsap.ticker.lagSmoothing(0)


/*-----------------------------------------------
 * Footer Bend [スクロール速度に応じてFooter上辺をたわませる]
-------------------------------------------------*/
const footerBendPath = document.querySelector('.js-footerBendPath');
const footerEl = document.querySelector('.js-footer');
let footerBendActive = false;

if (footerBendPath && footerEl) {
	const BEND_SENSITIVITY = 1000;  // velocity -> 振幅の倍率（実測でLenisのvelocityが0.01〜0.1程度と判明。大きめ初期値、確認しながら弱める）
	const BEND_MAX = 50;            // 振幅の最大値（px、viewBox座標系）
	const RELEASE_DELAY = 60;       // wheel/touch入力が止んでからreleaseBendを始めるまでの遅延(ms)。実際のwheelイベント間隔より短いと常に「止まった」と誤判定してしまう
	const bendState = { v: 0 };     // gsap.toのtween対象を固定オブジェクトにし、overwriteを確実に効かせる
	let bendIdleTimer = null;
	let inputActive = false;        // Lenisの慣性減衰でなく実際のwheel/touch入力の有無で判定する

	const setBendPath = (amount) => {
		const y = 30 + amount;
		footerBendPath.setAttribute('d', `M0,30 Q600,${y} 1200,30 L1200,60 L0,60 Z`);
	};

	const releaseBend = () => {
		gsap.to(bendState, {
			v: 0,
			duration: 1,
			ease: 'elastic.out(1.4, 0.4)',
			overwrite: true,
			onUpdate: () => setBendPath(bendState.v),
		});
	};

	const bendObserver = new IntersectionObserver((entries) => {
		footerBendActive = entries[0].isIntersecting;
		if (!footerBendActive) {
			clearTimeout(bendIdleTimer);
			releaseBend();
		}
	}, { rootMargin: '0px 0px 200px 0px' });
	bendObserver.observe(footerEl);

	const onInputEvent = () => {
		inputActive = true;
		clearTimeout(bendIdleTimer);
		bendIdleTimer = setTimeout(() => {
			inputActive = false;
			releaseBend();
		}, RELEASE_DELAY);
	};
	window.addEventListener('wheel', onInputEvent, { passive: true });
	window.addEventListener('touchmove', onInputEvent, { passive: true });

	lenis.on('scroll', (e) => {
		if (!footerBendActive || !inputActive) return;
		const target = gsap.utils.clamp(-BEND_MAX, BEND_MAX, e.velocity * BEND_SENSITIVITY);
		gsap.to(bendState, {
			v: target,
			duration: 0.15,
			ease: 'none',
			overwrite: true,
			onUpdate: () => setBendPath(bendState.v),
		});
	});
}
