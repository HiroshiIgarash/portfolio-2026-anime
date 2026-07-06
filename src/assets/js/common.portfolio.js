/*-----------------------------------------------
 * Root
-------------------------------------------------*/
let root = $("body").data('root');
let page = $("body").data('page');
const pcOnly = window.matchMedia('(min-width: 769px)');
const spOnly = window.matchMedia('(max-width: 768px)');


/*-----------------------------------------------
 * COMMON
-------------------------------------------------*/
$(function(){

	// Anchor Smooth Scroll
	$('.js-anchor').on('click', function(){
		var speed = 1000;
		var href = $(this).attr("href");
		var target = $(href == "#" || href == "" ? 'html' : href);
		var position = target.offset().top;
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
