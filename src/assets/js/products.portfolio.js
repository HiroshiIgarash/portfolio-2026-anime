/*-----------------------------------------------
 * PRODUCTS - Fullscreen Section Jump (wheel-driven, PC only)
-------------------------------------------------*/
const productsSections = document.querySelectorAll('.js-productsSnapItem');
const productsSectionCount = productsSections.length;

let productsCurrentIndex = 0;
let productsIsAnimating = false;

function setProductsCurrentIndex(index) {
	productsCurrentIndex = index;
	$('.js-productsDotNavBtn').removeClass('--is-current');
	$('.js-productsDotNavBtn[data-snap-index="' + index + '"]').addClass('--is-current');
}

function goToProductsSection(index) {
	index = Math.max(0, Math.min(index, productsSectionCount - 1));
	if (index === productsCurrentIndex || productsIsAnimating) return;
	productsIsAnimating = true;
	lenis.scrollTo(productsSections[index], {
		duration: 1,
		force: true,
		onComplete: function () {
			productsIsAnimating = false;
		},
	});
	setProductsCurrentIndex(index);
}

if (pcOnly.matches) {
	lenis.stop();

	window.addEventListener('wheel', function (e) {
		if ($(e.target).closest('.productsItem__body').length) {
			return;
		}
		if (productsIsAnimating) {
			e.preventDefault();
			return;
		}
		const direction = e.deltaY > 0 ? 1 : -1;
		const nextIndex = productsCurrentIndex + direction;
		if (nextIndex < 0 || nextIndex > productsSectionCount - 1) {
			return;
		}
		e.preventDefault();
		goToProductsSection(nextIndex);
	}, { passive: false });
}

$('.js-productsDotNavBtn').on('click', function () {
	const index = Number($(this).data('snap-index'));
	goToProductsSection(index);
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
