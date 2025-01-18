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
-   Includes property blacklisting for granular control

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
	margin-block: responsive 20px 40px;
	padding-inline: responsive 16px 32px;
	gap: responsive 16px 32px;
}
```

Outputs:

```css
.element {
	margin-block: clamp(20px, calc(14.4px + 1.33333cqw), 40px);
	padding-inline: clamp(16px, calc(10.4px + 1.33333cqw), 32px);
	gap: clamp(16px, calc(10.4px + 1.33333cqw), 32px);
}
```

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

While `clamp()`