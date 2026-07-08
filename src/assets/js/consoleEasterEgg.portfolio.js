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
		'%cわくわくに満ちた、体験を。',
		'color: #00afaa; font-size: 14px; font-weight: bold;'
	);
	console.log(
		'%cここまでみてくれてありがとう！',
		'color: #14213d; font-size: 12px;'
	);
})();
