/*-----------------------------------------------
 * Root
-------------------------------------------------*/
let root = $("body").data('root');
let page = $("body").data('page');
const pcOnly = window.matchMedia('(min-width: 769px)');
const spOnly = window.matchMedia('(max-width: 768px)');

/*-----------------------------------------------
 * MV
-------------------------------------------------*/
/**
* Swiper - mv__bg
**/
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
