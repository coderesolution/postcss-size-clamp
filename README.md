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
-   Works with any CSS property that accepts pixel values
-   Includes a handy line-height shorthand syntax for typography

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
			unit: 'cqw',            // default unit (vw, cqw, cqi, cqb)
			blacklist: ['container-name'] // properties to ignore
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
}
```

Outputs:

```css
.element {
	font-size: clamp(16px, calc(10.4px + 1.33333cqw), 32px);
	margin-block: clamp(20px, calc(14.4px + 1.33333cqw), 40px);
	padding-inline: clamp(16px, calc(10.4px + 1.33333cqw), 32px);
}
```

**With Line Height Shorthand (Typography)**

```css
.title {
	font-size: responsive 16px 32px / 1.5;
}
```

Outputs:

```css
.title {
	font-size: clamp(16px, calc(10.4px + 1.33333cqw), 32px);
	line-height: 1.5;
}
```

**Custom Range and Units**

```css
.element {
	margin: responsive 20px 48px;
	font-size: responsive 16px 24px;
	fluid-range: 768px 1920px;
	fluid-unit: vw;
}
```

Outputs:

```css
.element {
	margin: clamp(20px, calc(1.33333px + 2.43056vw), 48px);
	font-size: clamp(16px, calc(1.33333px + 1.18056vw), 24px);
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
	blacklist: ['container-name', 'display', 'position']
});
```

## Browser Support

While `clamp()` has [excellent browser support](https://caniuse.com/?search=css-clamp), we recommend using this plugin with `postcss-preset-env` for maximum compatibility. Place this plugin before `postcss-preset-env` in your PostCSS config to take advantage of its browser compatibility features.

## Performance

This plugin pre-calculates numerical values where possible, resulting in optimized CSS output. Instead of multiple media queries or complex calculations, it generates a single, efficient line of CSS that browsers can process quickly.

## License

MIT
