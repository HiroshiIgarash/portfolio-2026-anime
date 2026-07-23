"use strict";

// Web制作会社時代に制作したサイト一覧（/works/ ページ用）
// 受託案件のため実名は出さず、業種・規模で表記する
// 原稿マスタは Google Sheets「portfolio-works-data-v4」。シート更新後にここへ反映する
// webpack の template-ejs-loader から data.worksList として全 EJS テンプレートに注入される
// 注意: webpack config 評価時に require されるため、dev server 起動中の編集は反映されない（要再起動）
module.exports = [
	{
		title: "多角経営グループのコーポレートサイト制作",
		type: "新規制作",
		pages: "50+",
		team: "3名体制",
		tech: ["HTML/CSS", "Sass", "JavaScript", "PHP", "WordPress"],
		description:
			"物流・アパレル・製造など複数事業を展開する企業のコーポレートサイト。静的50ページ超+WordPress動的ページのハイブリッド構成を3名体制で制作。",
	},
	{
		title: "ホールディングス企業の採用サイト制作",
		type: "新規制作",
		pages: "10",
		team: "単独",
		tech: ["HTML/CSS", "Sass", "JavaScript", "WordPress"],
		description:
			"グループ企業の採用サイトを新規制作。社員情報を先方が自分で更新できるWordPress構築とお問い合わせフォームを実装。他社デザイン・他社ディレクターとやりとりしながら進行。",
	},
	{
		title: "総合病院コーポレートサイト制作",
		type: "新規制作",
		pages: "100+40",
		team: "5人指揮",
		tech: ["Sass", "JavaScript", "PHP"],
		description:
			"診療科紹介だけで100ページを超える大規模案件。定型テンプレートを設計し、制作メンバー5名のディレクションも担当。",
	},
	{
		title: "菓子ブランド公式サイトの保守・改修",
		type: "保守・運用",
		team: "単独",
		tech: ["HTML/CSS", "JavaScript"],
		description:
			"他社制作のアニメーション多用サイトを保守。既存JSコードを解析し、新商品ページに同様の演出を再現。",
	},
	{
		title: "食品商社サイトリニューアル",
		type: "リニューアル",
		pages: "40",
		team: "単独",
		tech: ["HTML/CSS", "Sass", "JavaScript", "WordPress"],
		description:
			"40ページ規模のコーポレートサイトリニューアル。多言語対応・メガメニューを含むWordPress構築を担当。",
	},
	{
		title: "食品商社の採用サイト制作",
		type: "新規制作",
		pages: "10",
		team: "単独",
		tech: ["HTML/CSS", "Sass", "JavaScript", "WordPress"],
		description:
			"食品商社の採用サイトを新規制作。お知らせをWordPressで更新できる構成で構築。",
	},
	{
		title: "リフォーム会社のLP制作",
		type: "LP",
		team: "単独",
		tech: ["HTML/CSS", "Sass", "JavaScript", "PHP"],
		description: "リフォーム会社のLPを制作。お問い合わせフォームの実装も担当。",
	},
	{
		title: "コスメブランドのLP制作",
		type: "LP",
		team: "単独",
		tech: ["HTML/CSS", "Sass", "JavaScript"],
		description: "コスメブランドのLPをECプラットフォーム内に構築。",
	},
	{
		title: "ITシステム開発会社のコーポレートサイト制作",
		type: "新規制作",
		pages: "10",
		team: "単独",
		tech: ["HTML/CSS", "Sass", "JavaScript", "PHP", "WordPress"],
		description:
			"ITシステム開発会社のコーポレートサイトを新規制作。お知らせのWordPress化とお問い合わせフォームを実装。",
	},
	{
		title: "大手自動車メーカーの定期LP制作",
		type: "LP",
		team: "単独",
		tech: ["HTML/CSS", "Sass", "JavaScript"],
		description: "大手自動車メーカーのLPを定期的に制作。",
	},
	{
		title: "電機メーカーサイトの新規ページ制作・改修",
		type: "改修",
		team: "単独",
		tech: ["HTML/CSS", "Sass", "JavaScript", "PHP"],
		description:
			"長期リニューアルが進行中のサイトで、新規ページ制作と既存ページ改修を担当。新旧デザインが混在する複雑な状態でのコーディング。",
	},
	{
		title: "短期大学サイト制作",
		type: "新規制作",
		pages: "40",
		team: "単独",
		tech: ["Sass", "JavaScript", "PHP"],
		description:
			"40ページ規模の大学サイトを他社と合同で制作。CMS組み込みは他社のため、組み込みやすさを意識したコンポーネント設計・コーディングを担当。",
	},
	{
		title: "大手ホールディングスの周年記念コーポレートサイト制作",
		type: "新規制作",
		pages: "20",
		team: "3人・補佐",
		tech: ["HTML/CSS", "Sass", "JavaScript"],
		description:
			"周年記念サイトを3人体制で制作。SVGアニメーションの実装を含むコーディングを担当。",
	},
	{
		title: "ダイレクトマーケティング支援会社のサイトリニューアル",
		type: "リニューアル",
		pages: "20",
		team: "単独",
		tech: ["HTML/CSS", "Sass", "JavaScript"],
		description:
			"20ページのサイトリニューアル。他社デザインをもとにコーディングし、公開後の定期的なお知らせ更新も担当。",
	},
	{
		title: "住宅会社サイトの新規ページ制作・改修",
		type: "改修",
		team: "単独",
		tech: ["Sass", "JavaScript", "PHP"],
		description:
			"他社制作のコーポレートサイトに新規ページ制作・改修。既存コードを読み取り、実装パターンに沿ったコーディング。他社ディレクターとやりとりしながら進行。",
	},
	{
		title: "農業機械メーカーのサイトリニューアル",
		type: "リニューアル",
		pages: "40",
		team: "単独",
		tech: ["HTML/CSS", "Sass", "JavaScript", "WordPress"],
		description:
			"40ページのサイトリニューアル。他社のデザインカンプをもとに全ページのコーディングを担当。メガメニュー、お知らせ・事例紹介のWordPress構築も実施。",
	},
	{
		title: "大手メーカーのスマートウォッチ製品サイト制作",
		type: "新規制作",
		pages: "100",
		team: "単独",
		tech: ["HTML/CSS", "Sass", "JavaScript", "PHP"],
		description:
			"100ページ規模の製品説明サイトを制作。他社デザイン・他社ディレクターとやりとりしながらコーディングを担当。",
	},
	{
		title: "中学入試ポータルサイトの機能追加",
		type: "保守・運用",
		team: "単独",
		tech: ["HTML/CSS", "Sass", "JavaScript", "WordPress"],
		description:
			"既存のWordPressサイトに、更新可能なコンテンツ機能を新規構築。",
	},
	{
		title: "ふるさと納税サイトの定期更新・制作",
		type: "保守・運用",
		team: "単独",
		tech: ["HTML/CSS", "Sass", "JavaScript"],
		description:
			"ふるさと納税サイトの定期更新・ページ制作。提供されるCSVからEJSでHTMLを自動生成する仕組みを作り、制作を効率化。",
	},
	{
		title: "大手クレジットカード会社サイトの新規ページ制作",
		type: "保守・運用",
		team: "単独",
		tech: ["HTML/CSS", "Sass", "JavaScript"],
		description: "既存のコーポレートサイトへ、定期的に新規ページを制作。",
	},
	{
		title: "信用金庫サイトの改修",
		type: "保守・運用",
		team: "単独",
		tech: ["HTML/CSS", "JavaScript", "PHP"],
		description: "信用金庫指定のCMSを用いた既存サイトの改修・運用。",
	},
	{
		title: "音楽関連企業のコーポレートサイト制作",
		type: "新規制作",
		pages: "10",
		team: "単独",
		tech: ["HTML/CSS", "Sass", "JavaScript", "GSAP"],
		description:
			"10ページ規模のコーポレートサイトを新規制作。GSAPを用いたリッチなスクロールアニメーションを実装。",
	},
	{
		title: "大学のオープンキャンパスサイト",
		type: "新規制作",
		pages: "10",
		team: "2人・指揮",
		tech: ["HTML/CSS", "Sass", "JavaScript", "PHP"],
		description:
			"大学のオープンキャンパス特設サイトを2人共同で制作し、自分が指揮を担当。他社デザイナー・ディレクターとやりとりしながら進行。",
	},
	{
		title: "システム開発会社のコーポレートサイト制作",
		type: "新規制作",
		pages: "10",
		team: "単独",
		tech: ["HTML/CSS", "Sass", "JavaScript", "three.js"],
		description:
			"10ページ規模のコーポレートサイトを新規制作。three.jsによるインタラクティブな3Dアニメーションを実装。",
	},
];
