const DEFAULT_OPTIONS = {
	fontRange: [420, 1620],
	fontRangeUnit: 'cqw',
};

const VALID_RANGE_UNITS = ['vw', 'cqw', 'cqi', 'cqb'];

module.exports = (opts = {}) => {
	const options = {
		...DEFAULT_OPTIONS,
		...opts,
	};

	if (!VALID_RANGE_UNITS.includes(options.fontRangeUnit)) {
		throw new Error(`Invalid font-range-unit. Must be one of: ${VALID_RANGE_UNITS.join(', ')}`);
	}

	return {
		postcssPlugin: 'postcss-size-clamp',
		Declaration(decl) {
			if (decl.prop !== 'font-size') return;

			const value = decl.value.trim();

			// Check if this is a responsive font declaration
			if (!value.startsWith('responsive')) return;

			// Split the value to check for line-height
			const [fontPart, lineHeightPart] = value.split('/').map((part) => part.trim());

			// Parse the font size values
			const parts = fontPart.split(' ').filter(Boolean);

			if (parts.length !== 3) {
				throw decl.error('Invalid responsive font-size syntax. Use: font-size: responsive <min>px <max>px');
			}

			// Extract min and max values, removing 'px' suffix
			const minSize = parseFloat(parts[1]);
			const maxSize = parseFloat(parts[2]);

			if (isNaN(minSize) || isNaN(maxSize)) {
				throw decl.error('Invalid responsive font-size syntax. Use: font-size: responsive <min>px <max>px');
			}

			// Get font range from declaration or options
			let [minRange, maxRange] = options.fontRange;

			// Check for font-range property in the rule
			const fontRangeDecl = decl.parent.nodes.find((node) => node.type === 'decl' && node.prop === 'font-range');

			if (fontRangeDecl) {
				const range = fontRangeDecl.value
					.split(' ')
					.map((val) => parseFloat(val.replace('px', '')))
					.filter((val) => !isNaN(val));

				if (range.length === 2) {
					[minRange, maxRange] = range;
				}
				fontRangeDecl.remove();
			}

			// Get font-range-unit from declaration or options
			let rangeUnit = options.fontRangeUnit;

			const fontRangeUnitDecl = decl.parent.nodes.find(
				(node) => node.type === 'decl' && node.prop === 'font-range-unit'
			);

			if (fontRangeUnitDecl) {
				if (VALID_RANGE_UNITS.includes(fontRangeUnitDecl.value)) {
					rangeUnit = fontRangeUnitDecl.value;
				}
				fontRangeUnitDecl.remove();
			}

			// Generate the clamp function
			const clampValue = `clamp(${minSize}px, calc(${minSize}px + (${maxSize} - ${minSize}) * ((100${rangeUnit} - ${minRange}px) / (${maxRange} - ${minRange}))), ${maxSize}px)`;

			// Replace the declaration value
			decl.value = clampValue;

			// Handle line-height if present
			if (lineHeightPart) {
				// Check if there's already a line-height declaration
				const existingLineHeight = decl.parent.nodes.find(
					(node) => node.type === 'decl' && node.prop === 'line-height'
				);

				if (existingLineHeight) {
					// Update existing line-height
					existingLineHeight.value = lineHeightPart;
				} else {
					// Create new line-height declaration
					decl.cloneBefore({
						prop: 'line-height',
						value: lineHeightPart,
					});
				}
			}
		},
	};
};

module.exports.postcss = true;
