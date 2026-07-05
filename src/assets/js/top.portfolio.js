/*-----------------------------------------------
 * MV
-------------------------------------------------*/
/**
 * Swiper - mv__bg
 */
let mvBgSwiper = new Swiper('.js-mv__bgSwiper', {
	allowTouchMove: false,
	effect: 'fade',
});

mvBgSwiper.on('slideChange', function () {
	const visualNum = mvBgSwiper.realIndex + 1;
	$('.js-visualChange').removeClass('--is-current');
	$('.js-visualChange[data-visual="' + visualNum + '"]').addClass('--is-current');
});

$('.js-visualChange').on('click', function () {
	const visualNum = Number($(this).data('visual')) - 1;
	mvBgSwiper.slideTo(visualNum);
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
	animation: gsap.to('.js-mv__catchWrap', {
		yPercent: -30,
		ease: 'none',
	}),
});

/*-----------------------------------------------
 * MV - Catch Animation
-------------------------------------------------*/
function playMvCatchAnimation() {
	const tl = gsap.timeline({ delay: .3 });

	tl.set('.mv__catch--mainText', { opacity: 1 })
		.to('.mv__catch--mainBand', {
			scaleX: 1,
			duration: .5,
			ease: 'power2.inOut',
		})
		.set('.mv__catch--mainBand', {
			transformOrigin: 'right center',
		})
		.to('.mv__catch--mainBand', {
			scaleX: 0,
			duration: .5,
			ease: 'power2.inOut',
		})
		.to('.mv__catch--listsItem', {
			opacity: 1,
			y: 0,
			duration: .6,
			stagger: .15,
			ease: 'power2.out',
		}, '-=.2');
}

$(window).on('load', function () {
	playMvCatchAnimation();
});
