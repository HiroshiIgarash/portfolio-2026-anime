/*-----------------------------------------------
 * LOADING
-------------------------------------------------*/
const loadingBarFill = document.querySelector('.js-loadingBarFill');
const loadingBarPercent = document.querySelector('.js-loadingBarPercent');
const loadingFrameB = document.querySelector('.js-loadingFrameB');
const loadingProgress = { value: 0 };
const loadingFrameBDash = { value: 0 };

function setLoadingProgress(value) {
	loadingProgress.value = value;
	loadingBarFill.style.width = value + '%';
	loadingBarPercent.textContent = Math.round(value);
}

const loadingIntroTl = gsap.timeline({ paused: true });

loadingIntroTl.to(loadingProgress, {
	value: 90,
	duration: 1.5,
	ease: 'power2.out',
	onUpdate: function () {
		setLoadingProgress(loadingProgress.value);
	},
}, 0)
	.fromTo('.js-loadingFrameA', { strokeDashoffset: 50 }, {
		strokeDashoffset: 0,
		duration: .6,
		ease: 'power2.inOut',
	}, .6)
	// frameBはoffset固定・dasharrayの線長だけを0→50に伸ばす(offset側を動かすと起点がAと同じ左上を経由してしまうため)
	.fromTo(loadingFrameBDash, { value: 0 }, {
		value: 50,
		duration: .6,
		ease: 'power2.inOut',
		onUpdate: function () {
			loadingFrameB.style.strokeDasharray = loadingFrameBDash.value + ' 1000';
		},
	}, .6)
	// CSSのtransform初期値をGSAPに読み取らせると、文字幅が狭い文字("I"や".")だけ
	// 誤った値に変換されることがあるため、fromToでfrom値を明示しCSSの値を読みに行かせない
	.fromTo('.js-loadingChar', { y: 10, opacity: 0 }, {
		y: 0,
		opacity: 1,
		duration: .4,
		stagger: .05,
		ease: 'power2.out',
	}, 1.2)
	.to('.js-loadingSparkles', {
		opacity: 1,
		duration: .3,
		ease: 'power1.out',
	}, .2);

function finishLoading() {
	if (loadingIntroTl.progress() < 1) {
		loadingIntroTl.eventCallback('onComplete', snapProgressToComplete);
	} else {
		snapProgressToComplete();
	}
}

function snapProgressToComplete() {
	gsap.to(loadingProgress, {
		value: 100,
		duration: .2,
		ease: 'power1.out',
		onUpdate: function () {
			setLoadingProgress(loadingProgress.value);
		},
		onComplete: playLoadingReveal,
	});
}

function playLoadingReveal() {
	const revealTl = gsap.timeline({
		onComplete: function () {
			gsap.set('.js-loading', { display: 'none' });
			$('body').removeClass('--is-loading').addClass('--is-loaded');
			playMvCatchAnimation();
			ScrollTrigger.refresh();
			ScrollTrigger.update();
		},
	});

	revealTl
		.to('.js-loadingLogo', {
			scale: 2.2,
			opacity: 0,
			duration: .5,
			ease: 'power2.in',
		}, 0)
		.fromTo('.js-loadingRevealA', { scale: 0 }, {
			scale: 1,
			duration: .5,
			ease: 'power2.in',
		}, 0)
		.fromTo('.js-loadingRevealB', { scale: 0 }, {
			scale: 1,
			duration: .5,
			ease: 'power2.in',
		}, .12)
		.to('.js-loading', {
			opacity: 0,
			duration: .5,
			ease: 'power1.out',
		}, .7);
}

function startLoadingIntro() {
	$('body').addClass('--is-loading');
	loadingIntroTl.play();
}

if (window.__pageTransitionClosed) {
	startLoadingIntro();
} else {
	document.addEventListener('pageTransitionClosed', startLoadingIntro, { once: true });
}

$(window).on('load', finishLoading);

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
 * end は SKILLS円トランジションが覆いきる地点（.skillsFillのtopから
 * SKILLS_CIRCLE_GROW_VH ぶん下）まで延長し、円が広がりきるまで
 * 背景がスクロールで流れないようにする。
 * この値は setupFillCircle('.skillsFill', ...) 側のscale計算と同じ
 * 分母を使う必要がある（ズレると pin解除後もまだ円が覆いきってない
 * 状態が続き、白円と夜景背景が同時に動く見た目になる）。
-------------------------------------------------*/
const SKILLS_CIRCLE_GROW_VH = 2.0;

ScrollTrigger.create({
	trigger: '.js-bgStage__wrap',
	start: 'top top',
	endTrigger: '.skillsFill',
	end: () => 'top+=' + (window.innerHeight * SKILLS_CIRCLE_GROW_VH) + ' top',
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
 * そこで .skillsFill の実位置(getBoundingClientRect)から直接 scale を計算し、
 * 確実に 0→1（= 直径250vmax = 全画面被覆）まで拡大させる。
 * top が画面下端(vh)のとき scale0、画面上端(0)のとき scale1。上端を越えたら 1 で保持。
 */
function setupFillCircle(fillSel, circleSel, revealSel, growVh, onCoveredChange) {
	const fill = document.querySelector(fillSel);
	const circle = document.querySelector(circleSel);
	const reveal = revealSel ? document.querySelector(revealSel) : null;
	if (!fill || !circle) return;
	// 円が.skillsFill__bgのsticky範囲を抜けた後は__bgTrackの下端に押し出されて
	// 画面外へ流れていくため、四隅の被覆判定だけだと一度trueになった直後にfalseへ
	// 戻ってしまう（#skillsがopacity:0に巻き戻る）。一度覆いきったらそれ以降は
	// #skills自体の白背景に途切れなく引き継がれるので維持し、progressが十分戻った
	// （= #projectsへスクロールバックした）ときだけ判定をやり直す。
	let hasCovered = false;
	function update() {
		const vh = window.innerHeight;
		const vw = window.innerWidth;
		// .skillsFill の top が画面上端(0)を越えて上へスクロールした量で scale を決める。
		// 分母(growVh)を大きくするほどゆっくり育つ。
		const top = fill.getBoundingClientRect().top;
		const progress = Math.min(Math.max(-top / (vh * growVh), 0), 1);
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
			const cornersCovered = [[0, 0], [vw, 0], [0, vh], [vw, vh]].every(function (p) {
				return Math.hypot(p[0] - cx, p[1] - cy) <= r;
			});
			if (cornersCovered) {
				hasCovered = true;
			} else if (progress < 0.5) {
				hasCovered = false;
			}
			reveal.classList.toggle('--covered', hasCovered);
			if (onCoveredChange) {
				onCoveredChange(hasCovered);
			}
		}
	}
	window.addEventListener('scroll', update, { passive: true });
	window.addEventListener('resize', update);
	update();
}
const headerEl = document.querySelector('.js-header');
setupFillCircle('.skillsFill', '.js-skillsCircle', '#skills', SKILLS_CIRCLE_GROW_VH, function (covered) {
	if (headerEl) {
		headerEl.classList.toggle('is-darkLogo', covered);
	}
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
	const prevIndex = currentSkillIndex;
	currentSkillIndex = (index + total) % total;

	const $prev = $btns.eq(prevIndex);
	const $target = $btns.eq(currentSkillIndex);
	$btns.removeClass('--is-current');
	$target.addClass('--is-current');

	// メニュー上で切り替わったことが分かるよう、直前ボタンと選択ボタンを円ごとコインのようにY軸回転させる
	// （CSSのtransition:transformがGSAPの毎フレーム書き換えと競合し回転が滑らかに出ないため、
	//   回転中だけtransitionを止め、終わったら--is-currentのscale(1.1)に戻す）
	if ($prev[0] !== $target[0]) {
		const $rotateBtns = $prev.add($target);
		$rotateBtns.css('transition', 'none');
		gsap.fromTo($rotateBtns.toArray(), { rotationY: 0, transformPerspective: 600 }, {
			rotationY: 360,
			duration: .6,
			ease: 'power2.out',
			clearProps: 'transform,transformPerspective',
			onComplete: function () {
				$rotateBtns.css('transition', '');
			}
		});
	}

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
	// アイコン・名前・説明を一旦まとめてフェードアウトしてから内容を差し替え、時間差でフェードインする
	tl.to('.js-skillsDetailIcon img, .js-skillsDetailName, .js-skillsDetailText', { opacity: 0, duration: .25 })
		.call(function () {
			$('.js-skillsDetailIcon img').attr('src', iconSrc);
			$('.js-skillsDetailName').text(name);
			$('.js-skillsDetailText').text(text);
		})
		.set('.js-skillsDetailName, .js-skillsDetailText', { y: 20 })
		.to('.js-skillsDetailIcon img', { opacity: 1, duration: .3 })
		.to('.js-skillsDetailName', { opacity: 1, y: 0, duration: .4 }, '-=.1')
		.to('.js-skillsDetailText', { opacity: 1, y: 0, duration: .4 }, '-=.2');
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
 * CAREER - Heading / Item Text Stagger Reveal
 * career本体・career__head・career__itemはいずれも.js-scrani(既存の
 * IntersectionObserver監視)で--is-ani付与。個別ScrollTrigger実装は不要
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
let careerScrollTrigger = null;

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

	careerLinePoints = dotPoints;

	dots.forEach(function (dot, i) {
		dot.style.transform = pcOnly.matches ? `translateX(${Math.round(dotPoints[i].x - centerX)}px)` : '';
	});

	// 線の始点・終点は最初/最後のdotそのものに合わせる(見出し直下やコンテナ下端
	// まで引き伸ばさない)
	const d = catmullRomToBezierPath(dotPoints);

	svgEl.setAttribute('viewBox', `0 0 ${containerWidth} ${containerHeight}`);
	document.querySelector('.js-careerLinePathDeco').setAttribute('d', d);
	document.querySelector('.js-careerLinePathBg').setAttribute('d', d);
	document.querySelector('.js-careerLinePathFill').setAttribute('d', d);

	const fillPath = document.querySelector('.js-careerLinePathFill');
	careerLineTotalLength = fillPath.getTotalLength();
	fillPath.style.strokeDasharray = careerLineTotalLength;
	fillPath.style.strokeDashoffset = careerLineTotalLength;
}

/**
 * 蛇行パス・dot位置を引き直し、ScrollTriggerの開始/終了位置も取り直す。
 * オーブ位置はCAREER用ScrollTriggerのprogress(=セクションのドキュメント上の
 * 開始/終了に対するスクロール量)から算出するため、
 * (1)タイムライン自体の高さ変化(画像デコード/自区間の再フロー) だけでなく
 * (2)CAREERより手前(#about〜#skills等)の遅延再フローでセクションが下へずれた場合も
 * refreshしないとprogressが古い開始/終了基準のままになり、オーブが線上の別位置に描かれる。
 */
function recalcCareerLine() {
	buildCareerLine();
	ScrollTrigger.refresh();
	ScrollTrigger.update();
	// パスを引き直したら、いま現在のスクロール量(progress)でオーブ・残像・fill・
	// dot点灯を即座に描き直す。onUpdateはprogressが変化したときにしか発火しないため、
	// これを呼ばないと再フロー後もオーブが古い座標のまま残り、次のスクロールで
	// 開始位置へワープして見える(リロード直後にオーブ・残像がCSS既定位置に居座る)
	renderCareerProgress(careerScrollTrigger ? careerScrollTrigger.progress : 0);
}

buildCareerLine();
// ScrollTrigger生成前でもオーブ・残像を必ず開始点(progress 0)へ置く。
// これをしないとonUpdate初回発火まで、オーブはCSS既定のtimeline中央上端、
// 残像dotはtimeline左上原点に取り残され、余計なオレンジ点として見えてしまう
renderCareerProgress(0);
$(window).on('load', recalcCareerLine);

let careerLineResizeTimer;
$(window).on('resize', function () {
	clearTimeout(careerLineResizeTimer);
	careerLineResizeTimer = setTimeout(recalcCareerLine, 200);
});

// webfont(Noto Sans JP等)はwindow.loadを待たずに遅れて差し替わり、
// 本文の行高が変わってCAREERより手前のセクションが伸縮する。load後の再フローを取りこぼさない
if (document.fonts && document.fonts.ready) {
	document.fonts.ready.then(recalcCareerLine);
}

/**
 * 画像のheight:autoデコードやwebfont読了は、window.loadより後にレイアウトを動かす。
 * .js-careerTimeline自体の高さ変化に加え、手前セクションの再フローでページ全体の高さが
 * 変わったとき(=CAREERの開始/終了位置がずれたとき)も取りこぼさないよう、
 * body全体の高さもあわせて監視する。refresh前後で高さが同一なら再発火しないためループしない
 */
if (window.ResizeObserver) {
	const careerTimelineEl = document.querySelector('.js-careerTimeline');
	if (careerTimelineEl) {
		let careerResizeObserverTimer;
		const careerResizeObserver = new ResizeObserver(function () {
			clearTimeout(careerResizeObserverTimer);
			careerResizeObserverTimer = setTimeout(recalcCareerLine, 50);
		});
		careerResizeObserver.observe(careerTimelineEl);
		careerResizeObserver.observe(document.body);
	}
}

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

/**
 * 指定progress(0〜1)でCAREERタイムラインの見た目一式を描く。
 * ScrollTriggerのonUpdateから毎フレーム呼ぶほか、パス再構築後(recalcCareerLine)や
 * 初期化直後にも呼び、オーブ・残像がCSS既定位置に取り残されないようにする。
 */
function renderCareerProgress(progress) {
	const timelineEl = document.querySelector('.js-careerTimeline');
	const fillPath = document.querySelector('.js-careerLinePathFill');
	const orbEl = document.querySelector('.js-careerOrb');
	if (!timelineEl || !fillPath || !orbEl) return;

	const containerTop = timelineEl.getBoundingClientRect().top;
	const containerHeight = timelineEl.offsetHeight;

	fillPath.style.strokeDashoffset = careerLineTotalLength * (1 - progress);
	document.querySelector('.js-careerLineFill').style.transform = `scaleY(${progress})`;

	if (pcOnly.matches) {
		const point = fillPath.getPointAtLength(careerLineTotalLength * progress);
		orbEl.style.left = `${point.x}px`;
		orbEl.style.top = `${point.y}px`;

		careerLineTrailHistory.unshift({ x: point.x, y: point.y });
		careerLineTrailHistory = careerLineTrailHistory.slice(0, 4 * 3);

		document.querySelectorAll('.js-careerOrbTrailDot').forEach(function (trailDot, i) {
			// 蓄積が浅い初期フレームでも残像を必ずオーブ側へ寄せる(履歴が届かない
			// 分は最古の既知点→現在点でフォールバック)。既定のtimeline左上原点に
			// 取り残して余計なオレンジ点を出さないため
			const historyPoint = careerLineTrailHistory[(i + 1) * 3 - 1]
				|| careerLineTrailHistory[careerLineTrailHistory.length - 1]
				|| point;
			trailDot.style.left = `${historyPoint.x}px`;
			trailDot.style.top = `${historyPoint.y}px`;
		});
	} else {
		orbEl.style.left = '';
		orbEl.style.top = `${progress * 100}%`;
	}

	$('.js-careerDot').each(function () {
		const $dot = $(this);
		if ($dot.hasClass('--is-lit')) return;

		const fraction = (this.getBoundingClientRect().top - containerTop) / containerHeight;
		if (progress < fraction) return;

		$dot.addClass('--is-lit');
		if ($dot.hasClass('--is-current')) {
			playCareerClimaxBurst();
		}
	});
}

careerScrollTrigger = ScrollTrigger.create({
	trigger: '.js-careerTimeline',
	start: 'top center',
	end: 'bottom bottom',
	scrub: true,
	invalidateOnRefresh: true,
	onUpdate: (self) => renderCareerProgress(self.progress),
});

/*-----------------------------------------------
 * CAREER - deco parallax（PCのみ）
-------------------------------------------------*/
const careerDecoMM = gsap.matchMedia();
careerDecoMM.add('(min-width: 769px)', () => {
	// 項目ごとに振れ幅・追従速度をずらし、全項目が同じ動きに見えないようにする
	// （振れ幅は隣接itemのテキストと重ならない範囲に抑える）
	const amplitudes = [16, 24, 18, 26, 20, 22];
	const scrubs = [0.15, 0.35, 0.2, 0.4, 0.25, 0.3];
	document.querySelectorAll('.js-careerDeco').forEach((el, i) => {
		const amplitude = amplitudes[i % amplitudes.length];
		const scrubValue = scrubs[i % scrubs.length];
		gsap.fromTo(el,
			{ yPercent: -amplitude },
			{
				yPercent: amplitude,
				ease: 'none',
				scrollTrigger: {
					trigger: el.closest('.js-careerItem'),
					start: 'top bottom',
					end: 'bottom top',
					scrub: scrubValue,
				},
			}
		);
	});
});

/*-----------------------------------------------
 * PRIVATE - 導入シークエンス（pin + scrub）
 * walk: 右側を左上へ通過 / toy: 左側を右上へ通過 / coding: 中央で拡大して背景化。
 * pin する .private__pin の中で3画像を scrub 制御する。
-------------------------------------------------*/
function setupPrivateIntro() {
	const stage = document.querySelector('.js-privateStage');
	const pin = document.querySelector('.js-privatePin');
	const walk = document.querySelector('.js-privateFloatA');
	const zoom = document.querySelector('.js-privateZoom');
	const pinBg = document.querySelector('.js-privatePinBg');
	if (!stage || !pin || !walk || !zoom || !pinBg) return;

	const tl = gsap.timeline({
		scrollTrigger: {
			// trigger は pin 自身。stage を trigger にすると見出しの高さぶん
			// pin がビューポート上端より下で固定され、walk の退場距離(yPercent:-180)が
			// 相殺されて画面上部に残ってしまう
			trigger: pin,
			start: 'top top',
			end: '+=200%', // pin 区間の長さ（3画像ぶんのスクロール量）
			scrub: true,
			pin: pin,
			invalidateOnRefresh: true,
			// pin解除後、zoomはセクションと一緒に上へ流れてしまい「画像が動きながら
			// 固定背景と二重に見える」ため、終端でzoomを同じcover形状の固定背景レイヤー
			// (.private__pinBg / position:fixed)へ差し替える。画素が一致するので切替は見えない。
			// zoomのopacityはscrubタイムライン専属のため、切替はvisibilityのみで行い競合を避ける
			onLeave: function () {
				gsap.set(zoom, { visibility: 'hidden' });
				gsap.set(pinBg, { autoAlpha: 1 });
			},
			onEnterBack: function () {
				gsap.set(zoom, { visibility: 'visible' });
				gsap.set(pinBg, { autoAlpha: 0 });
			},
		},
	});

	// walk: 画面中央やや下から上へ、パララックス的に画面を通過して抜けきる（横はわずかに左へ）。
	// coding拡大(進捗0.6-)が始まる前(進捗0.55)に画面外上部へ退場させることで、
	// 「coding拡大の完了(=タイムライン終端)と同時にwalkの移動も止まる」現象を避ける。
	// 3画像が1本のpinタイムラインを共有しているため、walkのtweenをタイムライン全体に
	// 広げると必然的にcoding拡大と同じ瞬間に終わってしまう。walkを前半で完結させて分離する。
	// 横方向は開始xPercent:0(CSSのright位置そのまま)から左へシフトするだけにし、横スクロールバーを防ぐ。
	// pin開始時の位置は「画面上部寄り(約25vh)」（導入で中央から上昇してきた続き）。
	// yPercentは要素高基準のため、要素が小さいSPはPCより大きい値でないと同じ見た目にならない。
	const walkStartY = pcOnly.matches ? 22 : 84;
	tl.fromTo('.js-privateFloatA',
		{ yPercent: walkStartY, xPercent: 0 },
		{ yPercent: -180, xPercent: -18, ease: 'none', duration: 0.55 }, 0.0);
	// toy: 画面内下方(左寄り)から右上へ、walkと左右対称のパララックスで画面外上部まで抜けきる（進捗 0.30-0.85）。
	// walk同様、coding拡大の完了(進捗1.0)より前に退場を終わらせて「同時に止まる」現象を避ける。
	tl.fromTo('.js-privateFloatB',
		{ yPercent: 90, xPercent: 0 },
		{ yPercent: -180, xPercent: 18, ease: 'none', duration: 0.55 }, 0.3);
	tl.fromTo('.js-privateFloatB',
		{ opacity: 0 },
		{ opacity: 1, ease: 'none', duration: 0.1 }, 0.3);
	// coding: 中央で拡大して背景化（中央寄せはCSS側のflexに任せ、GSAPはscaleのみを与える）（進捗 0.60-1.00）
	// 終値は「ビューポートを覆う最小倍率」を実測で求める（background-size:cover相当。リサイズ時は
	// invalidateOnRefreshで再計算）。拡大後の見た目が .private__gallery の固定背景（同じcoding.jpgの
	// cover表示）と一致するため、pin解除後も背景が途切れずつながって見える。
	// brightnessは拡大と同時にギャラリーのオーバーレイ相当（rgba(0,0,0,.45)＝輝度0.55倍）まで
	// 落とす。pinBg・gallery背景と同輝度になり、以降の切替や暗幕の境界が見えない
	tl.fromTo('.js-privateZoom',
		{ scale: 0.35, opacity: 0, filter: 'brightness(1)' },
		{
			scale: () => Math.max(window.innerWidth / zoom.offsetWidth, window.innerHeight / zoom.offsetHeight),
			opacity: 1,
			filter: 'brightness(0.55)',
			ease: 'none',
			duration: 0.4,
		}, 0.6);
	// タイムライン終端 = 1.0（walk 0-0.55 / toy 0.3-0.85 / coding拡大 0.6-1.0。scrub進捗0-1と一致）

	// walk 導入: PRIVATE見出しが画面上部(約17vh)に来た頃、画面中央やや下(約45vh)からフェードインし、
	// 止まらずにゆっくり上昇し続けて pin開始時に約25vhへ到達する（そのままpin中の退場につながる）。
	// pinが40vh上昇する間、y(px)を-20vh→0でスクラブ = 画面上はスクロールの約0.5倍速で上昇するパララックス。
	// opacityは導入区間全体をかけて緩やかに上げ、pin開始でちょうど全開になる（急なフェードは唐突に見えるため）。
	// 横も出現直後から左へ動かす。pin中のxPercent(-18/110vhぶん)と同じ速度になるよう、
	// 導入40vhでは幅の6.5%(=18*40/110)だけ左へ進めておく（境界で速度も位置も連続する）。
	// pinタイムラインとは動かすプロパティを分離（導入=x+y+opacity / pin中=xPercent+yPercent）して
	// 同一要素に対する2トリガーの競合を避ける。境界(pin開始)で導入側の値が終端で止まり、
	// そこへpin側のtransformが合成されるため位置が連続する。
	const enter = gsap.timeline({
		scrollTrigger: {
			trigger: pin,
			start: 'top 40%',
			end: 'top top',
			scrub: true,
			invalidateOnRefresh: true,
		},
	});
	enter.fromTo('.js-privateFloatA',
		{ y: () => -window.innerHeight * 0.2, x: 0 },
		{ y: 0, x: () => -walk.offsetWidth * 0.065, ease: 'none', duration: 1 }, 0);
	enter.fromTo('.js-privateFloatA',
		{ opacity: 0 },
		{ opacity: 1, ease: 'none', duration: 1 }, 0);

	// galleryがビューポートを覆いきったら固定背景レイヤーを消灯する。以降はgallery自身の
	// 固定背景が同じ見た目を引き継ぐため切替は見えず、footer到達時に背景が残り続けるのも防ぐ
	ScrollTrigger.create({
		trigger: '.js-privateGallery',
		start: 'top top',
		onEnter: function () {
			gsap.set(pinBg, { autoAlpha: 0 });
		},
		onLeaveBack: function () {
			gsap.set(pinBg, { autoAlpha: 1 });
		},
	});
}
setupPrivateIntro();

/*-----------------------------------------------
 * PRIVATE→PRISM - イントロ演出
 * pinは使わず、#prismが画面に入ってくる通常のスクロールの中で、白いoverlayを
 * フェードアウトさせてPRISM本編（three.jsのcanvas。常時requestAnimationFrameで
 * 動き続けているため最初から流れて見える）を透けさせる。同時に
 * 「THANK YOU FOR WATCHING」を文字ごとにstaggerフェードインさせる
 * （loading画面のjs-loadingCharと同じ手法。#prismに対して常に同じ位置に
 * 固定表示し、overlayのフェードと連動させるためscrub進行を共有する）
-------------------------------------------------*/
function setupPrismIntro() {
	const stage = document.querySelector('.js-prismStage');
	const overlay = document.querySelector('.js-prismIntroOverlay');
	const chars = gsap.utils.toArray('.js-prismIntroChar');
	if (!stage || !overlay || !chars.length) return;

	const tl = gsap.timeline({
		scrollTrigger: {
			trigger: stage,
			start: 'top bottom',
			end: 'top top',
			scrub: true,
		},
	});

	tl.fromTo(overlay, { opacity: 1 }, { opacity: 0, ease: 'none' }, 0)
		.fromTo(chars, { y: 10, opacity: 0 }, { y: 0, opacity: 1, ease: 'none', stagger: 0.05 }, 0);
}
setupPrismIntro();

/*-----------------------------------------------
 * PRIVATE - Swiper（通常）+ スライドの右から登場
 * 各スライドの内側 .private__slide--inner を、gallery が画面に入ったら
 * 右から傾きつつ定位置へ stagger 表示する。Swiper 本体の transform とは
 * 別レイヤー(inner)を動かすことで競合を避ける。
-------------------------------------------------*/
function setupPrivateSwiper() {
	const el = document.querySelector('.js-privateSwiper');
	if (!el || typeof Swiper === 'undefined') return;

	// 登場演出の初期状態は Swiper の loop 複製が生成される前（元スライドのみ）に適用する。
	// loop:true では複製スライドが実スライドの前後に挿入されるため、初期化後に
	// gsap.utils.toArray で取得し直すと複製ぶんも対象に含まれるが、初期状態を
	// 先に固定しておけば複製生成時にDOM複製されるスタイルにも反映され、ちらつきを防げる。
	const initialInners = gsap.utils.toArray('.js-privateSlideInner');
	gsap.set(initialInners, { xPercent: 120, rotationY: 35, opacity: 0, transformOrigin: 'left center' });

	new Swiper('.js-privateSwiper', {
		slidesPerView: 'auto',
		centeredSlides: true,
		spaceBetween: 24,
		loop: true,
		autoplay: {
			delay: 4000,
			disableOnInteraction: false,
		},
		pagination: {
			el: '.js-privateSwiperPagination',
			clickable: true,
		},
		navigation: {
			nextEl: '.js-privateSwiperNext',
			prevEl: '.js-privateSwiperPrev',
		},
	});

	// 登場演出: gallery が画面上部近く(top 30%)まで来たら一度だけ、複製ぶんも含む全innerを
	// 右から傾き→定位置へ。固定背景と空のswiperをしばらく見せてからスライドが飛び込む段取り。
	// loop複製はSwiper初期化(afterInit)までに生成済みのため、初期化後に再取得する。
	const inners = gsap.utils.toArray('.js-privateSlideInner');
	ScrollTrigger.create({
		trigger: '.js-privateGallery',
		start: 'top 30%',
		once: true,
		onEnter: function () {
			gsap.to(inners, {
				xPercent: 0,
				rotationY: 0,
				opacity: 1,
				duration: 0.9,
				ease: 'power3.out',
				stagger: 0.15,
			});
		},
	});
}
setupPrivateSwiper();
