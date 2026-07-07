/*-----------------------------------------------
 * PRIVATE - 見開き本カードの登場演出
 * 各 .js-privateBook が画面に入ったら一度だけ、
 * 本(背景)→イラスト→見出し→本文の順に、間隔をあけてフェードイン。
 * 見出し・本文は下からスライドイン+フェードイン。
-------------------------------------------------*/
(function setupPrivateBooks() {
	const list = document.querySelector('.js-privateList');
	if (!list || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

	const books = gsap.utils.toArray('.js-privateBook');
	const moveDistance = pcOnly.matches ? 24 : 12;

	books.forEach(function (book) {
		const bg = book.querySelector('.private__bookBg');
		const illust = book.querySelector('.private__illust');
		const title = book.querySelector('.private__text--title');
		const body = book.querySelector('.private__text--body');
		const marker = book.querySelector('.js-marker');
		const isRight = book.classList.contains('-right');
		const illustFromX = isRight ? moveDistance : -moveDistance;

		gsap.set(bg, { opacity: 0 });
		gsap.set(illust, { opacity: 0, x: illustFromX, scale: 0.94 });
		gsap.set(title, { opacity: 0, y: 24 });
		gsap.set(body, { opacity: 0, y: 20 });

		ScrollTrigger.create({
			trigger: book,
			start: 'top 80%',
			once: true,
			onEnter: function () {
				const tl = gsap.timeline();
				tl.to(bg, { opacity: 1, duration: 0.6, ease: 'power1.out' });
				tl.to(illust, { opacity: 1, x: 0, scale: 1, duration: 0.6, ease: 'power2.out' }, '+=0.15');
				tl.to(title, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '+=0.2');
				tl.to(body, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '+=0.15');
				if (marker) {
					tl.to(marker, { backgroundSize: '100% 55%', duration: 0.5, ease: 'power2.out' }, '+=0.1');
				}
			},
		});
	});
})();
