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
		const direction = e.deltaY > 0 ? 1 : -1;
		const $body = $(e.target).closest('.productsItem__body');
		if ($body.length) {
			const el = $body[0];
			const atTop = el.scrollTop <= 0;
			const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
			if (direction > 0 && !atBottom) return;
			if (direction < 0 && !atTop) return;
		}
		if (productsIsAnimating) {
			e.preventDefault();
			return;
		}
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
