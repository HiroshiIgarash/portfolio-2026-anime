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

});
