/*-----------------------------------------------
 * PRODUCTS - Fullscreen Snap Scroll (GSAP ScrollTrigger)
-------------------------------------------------*/
gsap.registerPlugin(ScrollTrigger);

const productsSections = document.querySelectorAll('.js-productsSnapItem');
const productsSectionCount = productsSections.length;

ScrollTrigger.create({
	trigger: '.js-productsSnap',
	start: 'top top',
	end: 'bottom bottom',
	snap: {
		snapTo: 1 / (productsSectionCount - 1),
		duration: .6,
		ease: 'power1.inOut',
	},
});

/*-----------------------------------------------
 * PRODUCTS - Dot Nav
-------------------------------------------------*/
const productsDotObserver = new IntersectionObserver(function (entries) {
	entries.forEach(function (entry) {
		if (!entry.isIntersecting) return;
		const index = $(entry.target).data('products-index');
		$('.js-productsDotNavBtn').removeClass('--is-current');
		$('.js-productsDotNavBtn[data-snap-index="' + index + '"]').addClass('--is-current');
	});
}, { threshold: .6 });

productsSections.forEach(function (section) {
	productsDotObserver.observe(section);
});

$('.js-productsDotNavBtn').on('click', function () {
	const index = Number($(this).data('snap-index'));
	const target = productsSections[index];
	if (target) {
		lenis.scrollTo(target, { duration: 1 });
	}
});

/*-----------------------------------------------
 * PRODUCTS - Gallery Auto Fade
-------------------------------------------------*/
$('.js-productsGallery').each(function () {
	const $pics = $(this).find('.js-productsGalleryImg');
	if ($pics.length < 2) return;
	let current = 0;
	setInterval(function () {
		$pics.eq(current).removeClass('--is-current');
		current = (current + 1) % $pics.length;
		$pics.eq(current).addClass('--is-current');
	}, 3500);
});
