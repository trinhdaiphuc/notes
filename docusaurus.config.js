/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */
// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion
const lightCodeTheme = require("prism-react-renderer/themes/github");

/** @type {import('@docusaurus/types').Config} */
const config = {
	title: "My Site",
	tagline: "The tagline of my site",
	url: "https://your-docusaurus-test-site.com",
	baseUrl: "/",
	onBrokenLinks: "throw",
	onBrokenMarkdownLinks: "warn",
	favicon: "img/favicon.ico",

	// GitHub pages deployment config.
	// If you aren't using GitHub pages, you don't need these.
	organizationName: "facebook", // Usually your GitHub org/user name.
	projectName: "docusaurus", // Usually your repo name.
  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],
	presets: [
		[
			"classic",
			/** @type {import('@docusaurus/preset-classic').Options} */
			({
				docs: {
					sidebarPath: require.resolve("./sidebars.js"),
					// Please change this to your repo.
					// Remove this to remove the "edit this page" links.
					editUrl:
						"https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
				},
				blog: {
					showReadingTime: true,
					// Please change this to your repo.
					// Remove this to remove the "edit this page" links.
					editUrl:
						"https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
				},
				theme: {
					customCss: require.resolve("./src/css/custom.css"),
				},
			}),
		],
	],

	themeConfig:
		/** @type {import('@docusaurus/preset-classic').ThemeConfig} */
		({
			navbar: {
				title: "My Notes",
				logo: {
					alt: "My Meta Project Logo",
					src: "img/logo.svg",
				},
				items: [
					{ to: "/programing-language", label: "Programing language" },
				],
			},
			footer: {
				style: "dark",
				links: [
					{
						title: "Learn",
						items: [
							{
								label: "Style Guide",
								to: "docs/",
							},
							{
								label: "Second Doc",
								to: "docs/doc2",
							},
						],
					},
					{
						title: "Community",
						items: [
							{
								label: "Stack Overflow",
								href: "https://stackoverflow.com/questions/tagged/docusaurus",
							},
							{
								label: "Twitter",
								href: "https://twitter.com/docusaurus",
							},
							{
								label: "Discord",
								href: "https://discordapp.com/invite/docusaurus",
							},
						],
					},
					{
						title: "More",
						items: [
							{
								label: "Blog",
								to: "blog",
							},
							{
								label: "GitHub",
								href: "https://github.com/facebook/docusaurus",
							},
						],
					},
					{
						title: "Legal",
						// Please do not remove the privacy and terms, it's a legal requirement.
						items: [
							{
								label: "Privacy",
								href: "https://opensource.fb.com/legal/privacy/",
							},
							{
								label: "Terms",
								href: "https://opensource.fb.com/legal/terms/",
							},
							{
								label: "Data Policy",
								href: "https://opensource.fb.com/legal/data-policy/",
							},
							{
								label: "Cookie Policy",
								href: "https://opensource.fb.com/legal/cookie-policy/",
							},
						],
					},
				],
				logo: {
					alt: "Meta Open Source Logo",
					// This default includes a positive & negative version, allowing for
					// appropriate use depending on your site's style.
					src: "/img/meta_opensource_logo_negative.svg",
					href: "https://opensource.fb.com",
				},
				// Please do not remove the credits, help to publicize Docusaurus :)
				copyright: `Copyright © ${new Date().getFullYear()} Meta Platforms, Inc. Built with Docusaurus.`,
			},
      prism: {
        theme: lightCodeTheme,
        additionalLanguages: ['bash', 'ini'],
      },
      colorMode: {
        disableSwitch: true,
      },
		}),

	plugins: [
		async function customPlugins() {
			return {
				name: "tailwindcss",
				configurePostCss(options) {
					options.plugins.push(require("tailwindcss"));
					options.plugins.push(require("autoprefixer"));

					return options;
				},
			};
		},
		[
			"@docusaurus/plugin-content-docs",
			{
				id: "programing-language",
				path: "programing-language",
				routeBasePath: "programing-language",
			},
		],
	],
};

module.exports = config;
