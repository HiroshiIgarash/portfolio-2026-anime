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
 * 見出し「CAREER」自体は既存の .js-scrani 監視対象のため追加実装不要
-------------------------------------------------*/
$('.js-careerItem').each(function () {
	const $item = $(this);
	ScrollTrigger.create({
		trigger: this,
		start: 'top 75%',
		once: true,
		onEnter: () => $item.addClass('--is-ani'),
		invalidateOnRefresh: true,
	});
});

/*-----------------------------------------------
 * CAREER - Line Growth + Orb Descent
 * 同じtimelineの同じ位置(0)に両方のtweenを積むことで、
 * 線の伸長とオーブの位置がスクロール量に対して常に一致する
-------------------------------------------------*/
gsap.timeline({
	scrollTrigger: {
		trigger: '.js-careerTimeline',
		start: 'top center',
		end: 'bottom center',
		scrub: true,
		invalidateOnRefresh: true,
	},
})
	.to('.js-careerLineFill', { scaleY: 1, ease: 'none' }, 0)
	.to('.js-careerOrb', { top: '100%', ease: 'none' }, 0);

/*-----------------------------------------------
 * CAREER - Dot Lighting
 * オーブと同じ「画面中央通過」を基準にしているため、
 * オーブが実際にその高さへ到達するタイミングとずれない
-------------------------------------------------*/
$('.js-careerDot').each(function () {
	const $dot = $(this);
	ScrollTrigger.create({
		trigger: this,
		start: 'center center',
		once: true,
		onEnter: () => $dot.addClass('--is-lit'),
		invalidateOnRefresh: true,
	});
});

/*-----------------------------------------------
 * CAREER - Climax Burst (current/2026到達時)
 * 巻き戻し時の二重発火を防ぐためonce:trueにする
-------------------------------------------------*/
ScrollTrigger.create({
	trigger: '.js-careerItem.--is-current',
	start: 'center 80%',
	once: true,
	onEnter: () => {
		const tl = gsap.timeline();
		tl.to('.js-careerOrb', { scale: 1.6, duration: .4, ease: 'power2.out' })
			.to('.js-careerOrb', { scale: 1, duration: .6, ease: 'elastic.out(1, .4)' })
			.set('.career__orb--particle', { x: 0, y: 0, scale: 0, opacity: 1 }, '<')
			.to('.career__orb--particle', {
				x: () => gsap.utils.random(-80, 80),
				y: () => gsap.utils.random(-80, 80),
				scale: 1,
				opacity: 0,
				duration: .8,
				stagger: .03,
				ease: 'power2.out',
			}, '<');
	},
});
