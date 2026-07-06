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
 * end は #skills（SKILLSへの円トランジション終了地点）まで延長し、
 * 円が広がりきるまで背景がスクロールで流れないようにする
-------------------------------------------------*/
ScrollTrigger.create({
	trigger: '.js-bgStage__wrap',
	start: 'top top',
	endTrigger: '#skills',
	end: 'top top',
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
 * PROJECTS -> SKILLS - White Circle Transition
 * 参考実装に倣い、
 * GSAP ScrollTriggerのpinは使わずCSSのposition:stickyで
 * .js-skillsCircleを画面に留め、scrubでscaleだけをアニメーションする。
 * #skillsは.skillsTransitionより前面（z-index）にあるため、
 * 通常のスクロールフローで下から現れる円の拡大と
 * セクションの出現が自然に同時進行する
 * （pin解除タイミングのズレによる前後セクションの同時表示や
 * 拡大しきった後の無反応区間が構造的に発生しない）
-------------------------------------------------*/
gsap.to('.js-skillsCircle', {
	scale: 40,
	ease: 'none',
	scrollTrigger: {
		trigger: '.skillsTransition__spacer',
		start: 'top bottom',
		end: 'bottom top',
		scrub: true,
		invalidateOnRefresh: true,
	},
});

/*-----------------------------------------------
 * SKILLS - Menu Switching
 * メニュー/前後ボタンクリックで同一のswitchSkill()を呼び、
 * アイコンがふんわり変わり→名前→説明の順に
 * 時間差でフェードイン+スライドインする
-------------------------------------------------*/
let currentSkillIndex = 0;
let skillDetailTl;

function switchSkill(index) {
	const $btns = $('.js-skillsMenuBtn');
	const total = $btns.length;
	currentSkillIndex = (index + total) % total;

	const $target = $btns.eq(currentSkillIndex);
	$btns.removeClass('--is-current');
	$target.addClass('--is-current');

	const iconSrc = $target.find('img').attr('src');
	const name = $target.data('name');
	const text = $target.data('text');

	// スクロールインの CSS transition が GSAP の毎フレーム inline style 書き換えにも
	// 反応してしまい、狙った時間差アニメがにじむため無効化する（初回以降は GSAP のみが担当）
	$('.js-skillsDetailName, .js-skillsDetailText').css('transition', 'none');

	if (skillDetailTl) {
		skillDetailTl.kill();
	}
	const tl = gsap.timeline();
	skillDetailTl = tl;
	tl.to('.js-skillsDetailIcon img', { opacity: 0, duration: .2 })
		.call(function () {
			$('.js-skillsDetailIcon img').attr('src', iconSrc);
		})
		.to('.js-skillsDetailIcon img', { opacity: 1, duration: .3 })
		.set('.js-skillsDetailName', { opacity: 0, y: 20 })
		.call(function () {
			$('.js-skillsDetailName').text(name);
		})
		.to('.js-skillsDetailName', { opacity: 1, y: 0, duration: .4 }, '+=.1')
		.set('.js-skillsDetailText', { opacity: 0, y: 20 })
		.call(function () {
			$('.js-skillsDetailText').text(text);
		})
		.to('.js-skillsDetailText', { opacity: 1, y: 0, duration: .4 }, '+=.1');
}

$('.js-skillsMenuBtn').on('click', function () {
	switchSkill(Number($(this).data('skill-index')));
});
$('.js-skillsPrev').on('click', function () {
	switchSkill(currentSkillIndex - 1);
});
$('.js-skillsNext').on('click', function () {
	switchSkill(currentSkillIndex + 1);
});

/*-----------------------------------------------
 * SKILLS -> CAREER - White Circle Transition
 * .skillsTransitionと同じくpinを使わないposition:sticky方式
-------------------------------------------------*/
gsap.to('.js-careerCircle', {
	scale: 40,
	ease: 'none',
	scrollTrigger: {
		trigger: '.careerTransition__spacer',
		start: 'top bottom',
		end: 'bottom top',
		scrub: true,
		invalidateOnRefresh: true,
	},
});
