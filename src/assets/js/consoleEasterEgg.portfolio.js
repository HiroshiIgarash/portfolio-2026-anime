/*-----------------------------------------------
 * Console Easter Egg
-------------------------------------------------*/
(function () {
	const asciiArt = `
#   # ##### ####   ###   #### #   # #####
#   #   #   #   # #   # #     #   #   #
#####   #   ####  #   #  ###  #####   #
#   #   #   #  #  #   #     # #   #   #
#   # ##### #   #  ###  ####  #   # #####

#####  ####  ###  ####   ###   #### #   # #####
  #   #     #   # #   # #   # #     #   #   #
  #   #  ## ##### ####  ##### ###   #####   #
  #   #   # #   # #  #  #   #     # #   #   #
#####  #### #   # #   # #   # ####  #   # #####
`;

	console.log(
		'%c' + asciiArt,
		'color: #00e5ff; font-family: Menlo, Consolas, monospace; font-weight: bold; line-height: 1.2;'
	);
	console.log(
		'%c丁寧な実装を、素早く仕上げる。',
		'color: #00afaa; font-size: 14px; font-weight: bold;'
	);
	console.log(
		'%cここまでみてくれてありがとう！',
		'color: #14213d; font-size: 12px;'
	);
})();
