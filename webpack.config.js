'use strict';

const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const siteConfig = require('./src/ejs/site.config.js');

const projectRoot = __dirname;
const pagesDir = path.resolve(projectRoot, 'src/ejs/pages');

// src/ejs/pages/**/*.ejs を再帰的に検出し、ページごとに HtmlWebpackPlugin を生成する。
// 出力パスは pages/ 以下の相対パスを維持する（例: pages/works/index.ejs -> dist/works/index.html）。
function findPageTemplates(dir) {
	return fs
		.readdirSync(dir, { recursive: true })
		.filter((entry) => entry.endsWith('.ejs'))
		.map((entry) => entry.split(path.sep).join('/'))
		.sort();
}

const pageTemplates = findPageTemplates(pagesDir);

const htmlPlugins = pageTemplates.map((relPath) => {
	return new HtmlWebpackPlugin({
		filename: relPath.replace(/\.ejs$/, '.html'),
		template: path.join(pagesDir, relPath),
		// 会社流の素の <script>/<link> をテンプレート内に直接書くため、
		// webpack による script/link の自動注入は行わない。
		inject: false,
		// タブインデントや BEGIN/END コメントを保持するため整形を無効化する。
		minify: false,
		scriptLoading: 'blocking'
	});
});

// 存在するディレクトリ・ファイルのみコピー対象にする（copy-webpack-plugin の noErrorOnMissing）。
// src/assets/scss はコンパイル前のソースなのでコピーしない。
// dist/assets/css は sass が直接出力するため、ここではコピーしない
// （copy-webpack-plugin は dist/assets/css に触れない。webpack の output.clean も無効のまま）。
const copyPatterns = [
	{ from: 'src/assets/js', to: 'assets/js', noErrorOnMissing: true },
	{ from: 'src/assets/img', to: 'assets/img', noErrorOnMissing: true },
	{ from: 'src/assets/og', to: 'assets/og', noErrorOnMissing: true },
	{ from: 'src/assets/css/libs', to: 'assets/css/libs', noErrorOnMissing: true },
	{ from: 'src/_inc', to: '_inc', noErrorOnMissing: true },
	{ from: 'favicon.ico', to: 'favicon.ico', noErrorOnMissing: true },
	{ from: 'apple-touch-icon.png', to: 'apple-touch-icon.png', noErrorOnMissing: true },
	{ from: 'manifest.json', to: 'manifest.json', noErrorOnMissing: true },
	{ from: 'robots.txt', to: 'robots.txt', noErrorOnMissing: true }
];

module.exports = (env, argv) => {
	const isProduction = argv.mode === 'production';

	return {
		// EJS を HTML の部品化にのみ使い JS はバンドルしないため、webpack のエントリは不要。
		entry: {},
		output: {
			path: path.resolve(projectRoot, 'dist'),
			// entry:{} のため通常は書き出されないが、webpack がエントリ必須のエラーを
			// 出す場合に備えて dist から見えない場所へ逃がしておく。
			filename: '.build/[name].js'
		},
		optimization: {
			// production モード既定の Terser は copy-webpack-plugin でコピーした
			// .js まで圧縮してしまう。「JS はバンドル・加工しない」方針のため無効化。
			minimize: false
		},
		module: {
			rules: [
				{
					test: /\.ejs$/i,
					use: [
						{
							loader: 'html-loader',
							options: {
								// script/link の src・href を webpack のモジュール解決に
								// 渡さない（素の CDN タグ・相対パスをそのまま保持するため）。
								sources: false,
								// production モードでは既定で true になり、タブインデントや
								// BEGIN/END コメントが失われるため明示的に無効化する。
								minimize: false
							}
						},
						{
							loader: 'template-ejs-loader',
							options: {
								// サイト共通定数を `site` として全テンプレートに注入する。
								data: {
									site: siteConfig
								}
							}
						}
					]
				}
			]
		},
		plugins: [...htmlPlugins, ...(isProduction ? [new CopyWebpackPlugin({ patterns: copyPatterns })] : [])],
		devServer: {
			// HTML はメモリ配信。static は 2 マウント構成:
			// 1. dist … sass watch が出力する /assets/css/* をコピー不要でそのまま配信
			// 2. src/assets … ソースの /assets/js/* /assets/img/* /assets/og/* をコピー不要で配信
			static: [
				{ directory: path.resolve(projectRoot, 'dist') },
				{ directory: path.resolve(projectRoot, 'src/assets'), publicPath: '/assets' }
			],
			port: 8080,
			open: false,
			hot: false
		}
	};
};
