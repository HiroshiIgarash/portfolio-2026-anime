"use strict";

// Web制作会社時代に制作したサイト一覧（/works/ ページ用）
// 受託案件のため実名は出さず、業種・規模で表記する
// webpack の template-ejs-loader から data.worksList として全 EJS テンプレートに注入される
// 注意: webpack config 評価時に require されるため、dev server 起動中の編集は反映されない（要再起動）
module.exports = [
	{
		title: "多角経営グループのコーポレートサイト制作",
		tech: ["WordPress", "PHP", "Sass", "JavaScript"],
		description:
			"物流・アパレル・製造など複数事業を展開する企業のコーポレートサイト。静的50ページ超+WordPress動的ページのハイブリッド構成を3名体制で制作。",
	},
	{
		title: "総合病院コーポレートサイト制作",
		tech: ["WordPress", "PHP", "Sass", "JavaScript"],
		description:
			"診療科紹介だけで100ページを超える大規模案件。定型テンプレートを設計し、制作メンバー5名のディレクションも担当。",
	},
	{
		title: "菓子ブランド公式サイトの保守・改修",
		tech: ["HTML / CSS", "JavaScript"],
		description:
			"他社制作のアニメーション多用サイトを保守。既存JSコードを解析し、新商品ページに同様の演出を再現。",
	},
	{
		title: "コーポレートサイト制作 多数",
		tech: ["HTML / CSS", "SCSS", "JavaScript", "EJS", "WordPress"],
		description:
			"数十〜数百ページ規模のコーポレートサイトを多数担当。デザインの忠実な再現とアクセシビリティの両立。",
	},
];
