/*-----------------------------------------------
 * MV
-------------------------------------------------*/
/**
 * Swiper - mv__bg
 */
let mvBgSwiper = new Swiper('.js-mv__bgSwiper', {
	allowTouchMove: false,
	effect: 'fade',
	loop: true,
	autoplay: {
		delay: 5000,
		disableOnInteraction: false,
	},
});

mvBgSwiper.on('slideChange', function () {
	const visualNum = mvBgSwiper.realIndex + 1;
	$('.js-visualChange').removeClass('--is-current');
	$('.js-visualChange[data-visual="' + visualNum + '"]').addClass('--is-current');
});

$('.js-visualChange').on('click', function () {
	const visualNum = Number($(this).data('visual')) - 1;
	mvBgSwiper.slideToLoop(visualNum);
});

/*-----------------------------------------------
 * MV - Fixed Scroll
-------------------------------------------------*/
gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.create({
	trigger: '#mv',
	start: 'top top',
	end: '+=100%',
	pin: true,
	pinSpacing: true,
	scrub: true,
	invalidateOnRefresh: true,
	animation: gsap.to('.js-mv__catch', {
		y: function () {
			const wrap = document.querySelector('.js-mv__catchWrap');
			const inner = document.querySelector('.js-mv__catch');
			return -Math.max(inner.offsetHeight - wrap.offsetHeight, 0);
		},
		ease: 'none',
	}),
});

/*-----------------------------------------------
 * MV - Catch Animation
-------------------------------------------------*/
function playMvCatchAnimation() {
	const tl = gsap.timeline({ delay: .3 });
	const lineStagger = .2;

	document.querySelectorAll('.js-mv__catchLine').forEach(function (line, i) {
		const band = line.querySelector('.js-mv__catchBand');
		const text = line.querySelector('.js-mv__catchText');
		const startTime = i * lineStagger;

		tl.to(band, {
				scaleX: 1,
				duration: .5,
				ease: 'power2.inOut',
			}, startTime)
			.set(text, { opacity: 1 }, startTime + .5)
			.set(band, {
				transformOrigin: 'right center',
			}, startTime + .5)
			.to(band, {
				scaleX: 0,
				duration: .5,
				ease: 'power2.inOut',
			}, startTime + .5);
	});

	tl.to('.mv__catch--listsItem', {
		opacity: 1,
		y: 0,
		duration: .6,
		stagger: .15,
		ease: 'power2.out',
	}, '-=.2');
}

$(window).on('load', function () {
	playMvCatchAnimation();
	ScrollTrigger.refresh();
});

/*-----------------------------------------------
 * ABOUT - Avatar Change
-------------------------------------------------*/
$('.js-about__avatarChange').on('click', function () {
	$(this).find('.about__avatar--img').toggleClass('--is-current');
});

/*-----------------------------------------------
 * ABOUT/PROJECTS - Fixed Background Stage
 * .bgStage を#about〜#projectsの区間ぶんpinし、
 * PROJECTSレイヤーのclip-pathをスクラブして
 * 背景そのものは動かさずに境界だけ上げていく
-------------------------------------------------*/
ScrollTrigger.create({
	trigger: '.js-bgStage__wrap',
	start: 'top top',
	end: 'bottom bottom',
	pin: '.js-bgStage',
	pinSpacing: false,
	invalidateOnRefresh: true,
});

ScrollTrigger.create({
	trigger: '#projects',
	start: 'top bottom',
	end: 'top top',
	scrub: true,
	invalidateOnRefresh: true,
	animation: gsap.to('.bgStage__layer.-projects', {
		clipPath: 'inset(0% 0 0 0)',
		ease: 'none',
	}),
});

/*-----------------------------------------------
 * PROJECTS - Swiper (Coverflow)
-------------------------------------------------*/
let projectsSwiper = new Swiper('.js-projectsSwiper', {
	effect: 'coverflow',
	centeredSlides: true,
	slidesPerView: 'auto',
	spaceBetween: 30,
	loop: true,
	loopAdditionalSlides: 2,
	autoplay: {
		delay: 4000,
		disableOnInteraction: false,
	},
	coverflowEffect: {
		rotate: -30,
		depth: 200,
		modifier: 1,
		slideShadows: false,
	},
});

/**
 * PROJECTS - Nav (円形ボタン)
 * 実スライドは3セット複製しているため、実際の作品数(js-projectsNavBtnの数)で
 * realIndexを割った余りが対応する作品のインデックスになる
 */
const projectsNavCount = $('.js-projectsNavBtn').length;

$('.js-projectsNavBtn').on('click', function () {
	const slideIndex = Number($(this).data('slide-index'));
	projectsSwiper.slideToLoop(slideIndex);
});

projectsSwiper.on('realIndexChange', function () {
	const activeIndex = projectsSwiper.realIndex % projectsNavCount;
	$('.js-projectsNavBtn').removeClass('--is-current');
	$('.js-projectsNavBtn[data-slide-index="' + activeIndex + '"]').addClass('--is-current');
});

/*-----------------------------------------------
 * PROJECTS -> SKILLS - Blue Circle Transition
-------------------------------------------------*/
ScrollTrigger.create({
	trigger: '#skills',
	start: 'top bottom',
	end: 'top top',
	scrub: true,
	invalidateOnRefresh: true,
	animation: gsap.to('.js-skillsCircle', {
		scale: 40,
		ease: 'none',
	}),
});

/*-----------------------------------------------
 * CAREER - Item Text Stagger Reveal
 * career__head同様、career__itemも.js-scrani(既存のIntersectionObserver監視)で
 * --is-ani付与。個別ScrollTrigger実装は不要
-------------------------------------------------*/

/*-----------------------------------------------
 * CAREER - Line Path Build (蛇行パス生成)
 * dotのY位置(コンテナ基準)と-left/-rightのX方向を制御点にし、
 * Catmull-Rom→ベジェ変換でなめらかなS字パスを生成する。
 * 初期化時・リサイズ時に再計算する
-------------------------------------------------*/
function vwminPx(px) {
	const vwMin = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--vw-min')) || 1200;
	return Math.min((px / vwMin) * window.innerWidth, px);
}

function catmullRomToBezierPath(points) {
	if (points.length < 2) return '';
	let d = `M ${points[0].x} ${points[0].y}`;
	for (let i = 0; i < points.length - 1; i++) {
		const p0 = points[i - 1] || points[i];
		const p1 = points[i];
		const p2 = points[i + 1];
		const p3 = points[i + 2] || p2;
		const cp1x = p1.x + (p2.x - p0.x) / 6;
		const cp1y = p1.y + (p2.y - p0.y) / 6;
		const cp2x = p2.x - (p3.x - p1.x) / 6;
		const cp2y = p2.y - (p3.y - p1.y) / 6;
		d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`;
	}
	return d;
}

let careerLinePoints = [];
let careerLineTotalLength = 0;
let careerLineTrailHistory = [];

function buildCareerLine() {
	const timelineEl = document.querySelector('.js-careerTimeline');
	const svgEl = document.querySelector('.js-careerLineSvg');
	if (!timelineEl || !svgEl) return;

	const containerWidth = timelineEl.offsetWidth;
	const containerHeight = timelineEl.offsetHeight;
	const containerTop = timelineEl.getBoundingClientRect().top;
	const centerX = containerWidth / 2;
	const amplitude = vwminPx(48);

	const dots = [...document.querySelectorAll('.js-careerDot')];
	const dotPoints = dots.map(function (dot) {
		const item = dot.closest('.js-careerItem');
		const y = dot.getBoundingClientRect().top - containerTop + dot.offsetHeight / 2;
		const x = item.classList.contains('-left') ? centerX - amplitude : centerX + amplitude;
		return { x: x, y: y };
	});

	careerLinePoints = [
		{ x: centerX, y: 0 },
		...dotPoints,
		{ x: dotPoints[dotPoints.length - 1].x, y: containerHeight },
	];

	dots.forEach(function (dot, i) {
		dot.style.transform = pcOnly.matches ? `translateX(${Math.round(dotPoints[i].x - centerX)}px)` : '';
	});

	const d = catmullRomToBezierPath(careerLinePoints);

	svgEl.setAttribute('viewBox', `0 0 ${containerWidth} ${containerHeight}`);
	document.querySelector('.js-careerLinePathDeco').setAttribute('d', d);
	document.querySelector('.js-careerLinePathBg').setAttribute('d', d);
	document.querySelector('.js-careerLinePathFill').setAttribute('d', d);

	const fillPath = document.querySelector('.js-careerLinePathFill');
	careerLineTotalLength = fillPath.getTotalLength();
	fillPath.style.strokeDasharray = careerLineTotalLength;
	fillPath.style.strokeDashoffset = careerLineTotalLength;
}

buildCareerLine();
$(window).on('load', buildCareerLine);

let careerLineResizeTimer;
$(window).on('resize', function () {
	clearTimeout(careerLineResizeTimer);
	careerLineResizeTimer = setTimeout(function () {
		buildCareerLine();
		ScrollTrigger.refresh();
	}, 200);
});

/*-----------------------------------------------
 * CAREER - Line Growth + Orb Descent + Dot Lighting + Climax Burst
 * 全て同一timelineのscrub progressから判定する。
 * CAREERはページ最終セクション(直後はfooterのみ)のため、'bottom center'/'center center'を
 * 個別のtriggerにすると、最後のdotが必要とするスクロール量までページが伸びておらず
 * 発火しないケースがあった。endを'bottom bottom'にすればコンテナ自身の残りぶんだけで
 * progress:1まで到達できるため、各dotのfraction(コンテナ内の相対位置)がprogressを
 * 下回った時点で点灯させる方式にし、最後のdotも含め確実に発火させる
-------------------------------------------------*/
function playCareerClimaxBurst() {
	const tl = gsap.timeline();
	tl.to('.js-careerOrb', { scale: 1.6, duration: .4, ease: 'power2.out' })
		.to('.js-careerOrb', { scale: 1, duration: .6, ease: 'elastic.out(1, .4)' })
		.set('.js-careerOrbParticle', { x: 0, y: 0, xPercent: -50, yPercent: -50, scale: 0, opacity: 1 }, '<')
		.to('.js-careerOrbParticle', {
			x: () => gsap.utils.random(-80, 80),
			y: () => gsap.utils.random(-80, 80),
			xPercent: -50,
			yPercent: -50,
			scale: 1,
			opacity: 0,
			duration: .8,
			stagger: .03,
			ease: 'power2.out',
		}, '<');
}

ScrollTrigger.create({
	trigger: '.js-careerTimeline',
	start: 'top center',
	end: 'bottom bottom',
	scrub: true,
	invalidateOnRefresh: true,
	onUpdate: (self) => {
		const containerTop = self.trigger.getBoundingClientRect().top;
		const containerHeight = self.trigger.offsetHeight;
		const fillPath = document.querySelector('.js-careerLinePathFill');
		const orbEl = document.querySelector('.js-careerOrb');

		fillPath.style.strokeDashoffset = careerLineTotalLength * (1 - self.progress);
		document.querySelector('.js-careerLineFill').style.transform = `scaleY(${self.progress})`;

		if (pcOnly.matches) {
			const point = fillPath.getPointAtLength(careerLineTotalLength * self.progress);
			orbEl.style.left = `${point.x}px`;
			orbEl.style.top = `${point.y}px`;

			careerLineTrailHistory.unshift({ x: point.x, y: point.y });
			careerLineTrailHistory = careerLineTrailHistory.slice(0, 4 * 3);

			document.querySelectorAll('.js-careerOrbTrailDot').forEach(function (trailDot, i) {
				const historyPoint = careerLineTrailHistory[(i + 1) * 3 - 1];
				if (!historyPoint) return;
				trailDot.style.left = `${historyPoint.x}px`;
				trailDot.style.top = `${historyPoint.y}px`;
			});
		} else {
			orbEl.style.left = '';
			orbEl.style.top = `${self.progress * 100}%`;
		}

		$('.js-careerDot').each(function () {
			const $dot = $(this);
			if ($dot.hasClass('--is-lit')) return;

			const fraction = (this.getBoundingClientRect().top - containerTop) / containerHeight;
			if (self.progress < fraction) return;

			$dot.addClass('--is-lit');
			if ($dot.hasClass('--is-current')) {
				playCareerClimaxBurst();
			}
		});
	},
});

/*-----------------------------------------------
 * CAREER - Deco Layer Parallax
 * 背面装飾線(--deco)を進捗線よりわずかに遅く動かし、奥行きを出す
-------------------------------------------------*/
gsap.fromTo('.js-careerLinePathDeco',
	{ y: 0 },
	{
		y: vwminPx(32),
		ease: 'none',
		scrollTrigger: {
			trigger: '.js-careerTimeline',
			start: 'top bottom',
			end: 'bottom top',
			scrub: true,
			invalidateOnRefresh: true,
		},
	}
);
