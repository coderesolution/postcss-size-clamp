# PostCSS Size Clamp

A PostCSS plugin that generates fluid values using modern CSS `clamp()` calculations.

[![NPM Version](https://img.shields.io/npm/v/postcss-size-clamp.svg)](https://www.npmjs.com/package/postcss-size-clamp)
[![NPM Downloads](https://img.shields.io/npm/dm/postcss-size-clamp.svg)](https://www.npmjs.com/package/postcss-size-clamp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PostCSS](https://img.shields.io/badge/PostCSS-8.0+-blue.svg)](https://github.com/postcss/postcss)
[![Known Vulnerabilities](https://snyk.io/test/github/coderesolution/postcss-size-clamp/badge.svg)](https://snyk.io/test/github/coderesolution/postcss-size-clamp)
[![Tests](https://github.com/coderesolution/postcss-size-clamp/workflows/Test/badge.svg)](https://github.com/coderesolution/postcss-size-clamp/actions)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/postcss-size-clamp)](https://bundlephobia.com/package/postcss-size-clamp)
[![GitHub stars](https://img.shields.io/github/stars/coderesolution/postcss-size-clamp.svg?style=social&label=Star)](https://github.com/coderesolution/postcss-size-clamp)

This plugin was inspired by the excellent [postcss-responsive-type](https://github.com/madeleineostoja/postcss-responsive-type). While it started as a typography solution, it has evolved into a comprehensive fluid value generator for any CSS property.

Unlike similar plugins, this plugin:

-   Outputs a single line of CSS using `clamp()` instead of multiple media/container queries
-   Pre-calculates values for optimized browser rendering
-   Supports container query units (`cqw`, `cqi`, `cqb`)
-   Supports custom container widths via CSS custom properties
-   Works with any CSS property that accepts pixel values
-   Includes property blacklisting for granular control
- 	Preserves the `!important` flag

## Installation

```bash
npm install postcss-size-clamp --save-dev
```

## Usage

```js
// postcss.config.js
module.exports = {
	plugins: [
		require('postcss-size-clamp')({
			range: [420, 1620],     // default viewport/container range
			unit: 'cqw',            // default unit (vw, cqw, cqi, cqb, %)
			blacklist: [            // properties to ignore
				'container-name',
				'grid-template-areas',
				'grid-template',
				'grid-area',
				'content',
				'list-style',
				'transition',
				'animation',
				'transform',
				'display'
			]
		}),
		require('postcss-preset-env'),
	],
};
```

**Basic Usage**

```css
.element {
	font-size: responsive 16px 32px;
	margin-block: responsive 20px 40px;
	padding-inline: responsive 16px 32px;
	gap: responsive 16px 32px;
}

/* Typography shorthand with line-height */
.element {
	font-size: responsive 16px 32px / 1.5;  /* Sets both font-size and line-height */
}

/* Using !important flag */
.element {
	font-size: responsive 16px 32px !important;
	/* or with line-height */
	font-size: responsive 16px 32px / 1.5 !important;
}
```

Outputs:

```css
.element {
	font-size: clamp(16px, calc(10.4px + 1.33333cqw), 32px);
	margin-block: clamp(20px, calc(14.4px + 1.33333cqw), 40px);
	padding-inline: clamp(16px, calc(10.4px + 1.33333cqw), 32px);
	gap: clamp(16px, calc(10.4px + 1.33333cqw), 32px);
}

.element {
	font-size: clamp(16px, calc(10.4px + 1.33333cqw), 32px);
	line-height: 1.5;
}

.element {
	font-size: clamp(16px, calc(10.4px + 1.33333cqw), 32px) !important;
	/* or with line-height */
	font-size: clamp(16px, calc(10.4px + 1.33333cqw), 32px) !important;
	line-height: 1.5 !important;
}
```

**Understanding Fluid Values**

The syntax `responsive <min>px <max>px` creates a fluid value that scales between two sizes based on the viewport or container width:

```css
.example {
	/* At 420px viewport: font-size = 16px
	   At 1620px viewport: font-size = 32px
	   Between: scales proportionally */
	font-size: responsive 16px 32px;
}
```

The default range (420px to 1620px) determines when the value starts and stops scaling. Below 420px it stays at 16px, above 1620px it stays at 32px, and between these values it scales fluidly.

**Custom Range and Units**

```css
.element {
	margin: responsive 20px 48px;
	width: responsive 280px 560px;
	fluid-range: 768px 1920px;
	fluid-unit: vw;
}
```

Outputs:

```css
.element {
	margin: clamp(20px, calc(1.33333px + 2.43056vw), 48px);
	width: clamp(280px, calc(183.33px + 19.44444vw), 560px);
}
```

**Custom Container Widths**

You can use CSS custom properties to define specific container widths for fluid scaling:

```css
/* Define container widths */
:root {
    --sidebar-width: 0.25; /* 25% of viewport width */
    --main-content: 0.75;  /* 75% of viewport width */
}

/* Use in your components */
.sidebar {
    fluid-unit: --sidebar-width;
    padding: responsive 10px 20px;
}

.main-content {
    fluid-unit: --main-content;
    font-size: responsive 16px 24px;
}
```

Outputs:

```css
.sidebar {
    padding: clamp(10px, calc(10px + (20 - 10) * (var(--sidebar-width) - 420px) / (1620 - 420))), 20px);
}

.main-content {
    font-size: clamp(16px, calc(16px + (24 - 16) * (var(--main-content) - 420px) / (1620 - 420))), 24px);
}
```

## Features

**Global Configuration**
Set default ranges and units in your PostCSS config:

```js
require('postcss-size-clamp')({
	range: [420, 1620],     // min and max viewport/container width
	unit: 'cqw',            // viewport or container query unit
	blacklist: ['container-name'] // properties to ignore
});
```

**Supported Units**

-   `vw`: Viewport width
-   `cqw`: Container query width
-   `cqi`: Container query inline size
-   `cqb`: Container query block size
-   `%`: Percentage of the width
-   `--*`: Custom property (must start with '--' and contain a decimal value between 0 and 1)

**Per-Declaration Overrides**
Override global settings using `fluid-range` and `fluid-unit` properties:

```css
.custom {
	padding: responsive 16px 32px;
	fluid-range: 320px 1440px;
	fluid-unit: cqi;
}
```

**Property Blacklist**
Some properties might not work well with fluid values or could cause issues. These can be blacklisted globally:

```js
require('postcss-size-clamp')({
	blacklist: [
		'container-name',  // Container queries
		'display',        // Non-numeric properties
		'position',       // Non-numeric properties
		'grid-template',  // Complex values
		'transform'       // Complex values
	]
});
```

## Browser Support

While `clamp()` has [excellent browser support](https://caniuse.com/?search=css-clamp), we recommend using this plugin with `postcss-preset-env` for maximum compatibility. Place this plugin before `postcss-preset-env` in your PostCSS config to take advantage of its browser compatibility features.

## Performance

This plugin pre-calculates numerical values where possible, resulting in optimized CSS output. Instead of multiple media queries or complex calculations, it generates a single, efficient line of CSS that browsers can process quickly.

## License

MIT