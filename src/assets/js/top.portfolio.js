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
 * 白円が画面全体を覆うfill-circleパターンを実装。
 * .skillsFill__bg（position:sticky）が円を画面中央に留め、GSAPはscaleのみを
 * スクラブする（pinは使わない）。円は150vmax固定でscale(1)が全画面被覆。
 * .skillsFillのtopが画面下端→上端まで（=ちょうど1画面ぶん）でscale 0→1とし、
 * 覆いきった瞬間に、同wrap内で最初から円の手前にある#skillsへ遅延なく移る。
-------------------------------------------------*/
/**
 * 円のscaleを GSAP ScrollTrigger の自動 start/end 推定に任せると、手前の bgStage(pin) の
 * レイアウトや画面サイズの影響で scale が 1 まで届かず、円が最大まで拡大しないことがある。
 * そこで .skillsFill / .careerFill の実位置(getBoundingClientRect)から直接 scale を計算し、
 * 確実に 0→1（= 直径250vmax = 全画面被覆）まで拡大させる。
 * top が画面下端(vh)のとき scale0、画面上端(0)のとき scale1。上端を越えたら 1 で保持。
 */
function setupFillCircle(fillSel, circleSel, revealSel) {
	const fill = document.querySelector(fillSel);
	const circle = document.querySelector(circleSel);
	const reveal = revealSel ? document.querySelector(revealSel) : null;
	if (!fill || !circle) return;
	function update() {
		const vh = window.innerHeight;
		const vw = window.innerWidth;
		// .skillsFill の top が画面上端(0)を越えて上へスクロールした量で scale を決める。
		// 分母を大きくするほどゆっくり育つ（0.4vh でゆったり）。
		const top = fill.getBoundingClientRect().top;
		const progress = Math.min(Math.max(-top / (vh * 0.4), 0), 1);
		circle.style.transform = 'scale(' + progress + ')';
		if (reveal) {
			// 円が画面の四隅すべてを覆った瞬間に中身へ --covered を付けてフェード表示する。
			// 「白い円が覆いきってから、その白の上に SKILLS が浮かび上がる」ので、
			// #skills の白背景が夜景の上にせり上がって境目が直線で出る問題が起きない。
			// 覆い判定は円の実寸(getBoundingClientRect)で行うので画面比率に依存しない。
			const c = circle.getBoundingClientRect();
			const cx = c.left + c.width / 2;
			const cy = c.top + c.height / 2;
			const r = c.width / 2;
			const covered = [[0, 0], [vw, 0], [0, vh], [vw, vh]].every(function (p) {
				return Math.hypot(p[0] - cx, p[1] - cy) <= r;
			});
			reveal.classList.toggle('--covered', covered);
		}
	}
	window.addEventListener('scroll', update, { passive: true });
	window.addEventListener('resize', update);
	update();
}
setupFillCircle('.skillsFill', '.js-skillsCircle', '#skills');

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
 * .skillsFill と同一。下から白円が湧き出て覆いきったら #career をフェード表示する
-------------------------------------------------*/
setupFillCircle('.careerFill', '.js-careerCircle', '#career');
