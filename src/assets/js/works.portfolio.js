/*-----------------------------------------------
 * WORKS - Filter (type / tech / collab)
-------------------------------------------------*/
const worksFilterState = { type: '', tech: '', collab: '' };
const worksItems = document.querySelectorAll('.js-worksItem');

function applyWorksFilter() {
	let visibleIndex = 0;
	worksItems.forEach((item) => {
		const techs = (item.dataset.tech || '').split('|');
		const collabs = (item.dataset.collab || '').split('|');
		const match =
			(!worksFilterState.type || item.dataset.type === worksFilterState.type) &&
			(!worksFilterState.tech || techs.includes(worksFilterState.tech)) &&
			(!worksFilterState.collab || collabs.includes(worksFilterState.collab));

		item.classList.toggle('-hidden', !match);
		item.classList.remove('-first');
		if (match) {
			if (visibleIndex === 0) item.classList.add('-first');
			// 再表示のたびにフェードをやり直し、表示順にスタッガーをかける
			item.classList.remove('--is-ani');
			void item.offsetWidth;
			item.style.transitionDelay = visibleIndex * 0.05 + 's';
			item.classList.add('--is-ani');
			visibleIndex++;
		} else {
			item.style.transitionDelay = '';
		}
	});

	$('.js-worksFilterCount').text(visibleIndex);
	$('.js-worksFilterEmpty').toggleClass('--is-show', visibleIndex === 0);
}

$('.js-worksFilterBtn').on('click', function () {
	const $btn = $(this);
	const key = $btn.closest('.js-worksFilterGroup').data('filterKey');
	worksFilterState[key] = $btn.data('filterValue') || '';
	$btn.closest('.js-worksFilterGroup').find('.js-worksFilterBtn').removeClass('--is-current');
	$btn.addClass('--is-current');
	applyWorksFilter();
});

// スタッガー用の transition-delay が hover 等の描画に残らないよう、フェード完了後に解除する
worksItems.forEach((item) => {
	item.addEventListener('transitionend', () => {
		item.style.transitionDelay = '';
	});
});
