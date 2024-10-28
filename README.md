# PostCSS Size Clamp

A PostCSS plugin that generates fluid typography using modern CSS `clamp()` calculations.

# PostCSS Size Clamp

[![NPM Version](https://img.shields.io/npm/v/postcss-size-clamp.svg)](https://www.npmjs.com/package/postcss-size-clamp)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PostCSS](https://img.shields.io/badge/PostCSS-8.0+-blue.svg)](https://github.com/postcss/postcss)
[![Dependencies Status](https://status.david-dm.org/gh/elliottmangham/postcss-size-clamp.svg)](https://david-dm.org/elliottmangham/postcss-size-clamp)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/postcss-size-clamp)](https://bundlephobia.com/package/postcss-size-clamp)

This plugin was inspired by the excellent [postcss-responsive-type](https://github.com/madeleineostoja/postcss-responsive-type). We initially [forked it](https://github.com/elliottmangham/postcss-responsive-type) to add container query support and `cqw` calculations, but ultimately decided to create a new plugin leveraging modern CSS capabilities and greater performance.

Unlike its predecessor, this plugin:

-   Outputs a single line of CSS using `clamp()` instead of multiple media/container queries
-   Pre-calculates values for optimized browser rendering
-   Supports container query units (`cqw`, `cqi`, `cqb`)
-   Includes a handy line-height shorthand syntax

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
			fontRange: [420, 1620], // default viewport/container range
			fontRangeUnit: 'cqw', // default unit (vw, cqw, cqi, cqb)
		}),
		require('postcss-preset-env'),
	],
};
```

**Basic Usage**

```css
.title {
	font-size: responsive 16px 32px;
}
```

Outputs:

```css
.title {
	font-size: clamp(16px, calc(10.4px + 1.33333cqw), 32px);
}
```

**With Line Height Shorthand**

```css
.title {
	font-size: responsive 16px 32px / 1.5;
}
```

Outputs:

```css
.title {
	font-size: responsive 16px 32px;
}
```

**Custom Range and Units**

```css
.title {
	font-size: responsive 20px 48px;
	font-range: 768px 1920px;
	font-range-unit: vw;
}
```

Outputs:

```css
.title {
	font-size: clamp(20px, calc(1.33333px + 2.43056vw), 48px);
}
```

## Features

**Global Configuration**
Set default ranges and units in your PostCSS config to maintain consistency across your project:

```js
require('postcss-size-clamp')({
	fontRange: [420, 1620], // min and max viewport/container width
	fontRangeUnit: 'cqw', // viewport or container query unit
});
```

**Supported Units**

-   `vw`: Viewport width
-   `cqw`: Container query width
-   `cqi`: Container query inline size
-   `cqb`: Container query block size

**Per-Declaration Overrides**
Override global settings using `font-range` and `font-range-unit` properties:

```css
.custom {
	font-size: responsive 16px 32px;
	font-range: 320px 1440px;
	font-range-unit: cqi;
}
```

**Line Height Shorthand**
Add line-height using the shorthand syntax:

```css
font-size: responsive <min>px <max>px / <line-height>;
```

## Browser Support

While `clamp()` has [excellent browser support](https://caniuse.com/?search=css-clamp), we recommend using this plugin with `postcss-preset-env` for maximum compatibility. Place this plugin before `postcss-preset-env` in your PostCSS config to take advantage of its browser compatibility features.

## Performance

This plugin pre-calculates numerical values where possible, resulting in optimized CSS output. Instead of multiple media queries or complex calculations, it generates a single, efficient line of CSS that browsers can process quickly.

## License

MIT
