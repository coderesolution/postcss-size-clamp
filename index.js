const DEFAULT_OPTIONS = {
	range: [420, 1620],
	unit: 'cqw',
	blacklist: ['container-name']
};

const VALID_UNITS = ['vw', 'cqw', 'cqi', 'cqb'];

module.exports = (opts = {}) => {
	const options = {
		...DEFAULT_OPTIONS,
		...opts,
	};

	if (!VALID_UNITS.includes(options.unit)) {
		throw new Error(`Invalid unit. Must be one of: ${VALID_UNITS.join(', ')}`);
	}

	return {
		postcssPlugin: 'postcss-size-clamp',
		Declaration(decl) {
			// Skip blacklisted properties
			if (options.blacklist.includes(decl.prop)) return;

			const value = decl.value.trim();
			if (!value.startsWith('responsive')) return;

			// Get fluid range and unit from declaration or options
			let [minRange, maxRange] = options.range;
			let rangeUnit = options.unit;

			// Check for fluid-range property in the rule
			const fluidRangeDecl = decl.parent.nodes.find(
				node => node.type === 'decl' && node.prop === 'fluid-range'
			);

			if (fluidRangeDecl) {
				const range = fluidRangeDecl.value
					.split(' ')
					.map(val => parseFloat(val.replace('px', '')))
					.filter(val => !isNaN(val));

				if (range.length === 2) {
					[minRange, maxRange] = range;
				}
				// Remove the fluid-range declaration
				fluidRangeDecl.remove();
			}

			// Check for fluid-unit property
			const fluidUnitDecl = decl.parent.nodes.find(
				node => node.type === 'decl' && node.prop === 'fluid-unit'
			);

			if (fluidUnitDecl) {
				if (VALID_UNITS.includes(fluidUnitDecl.value)) {
					rangeUnit = fluidUnitDecl.value;
				}
				// Remove the fluid-unit declaration
				fluidUnitDecl.remove();
			}

			// Split the value to check for line-height
			const [fontPart, lineHeightPart] = value.split('/').map((part) => part.trim());

			// Parse the font size values
			const parts = fontPart.split(' ').filter(Boolean);

			if (parts.length !== 3) {
				throw decl.error('Invalid responsive syntax. Use: <property>: responsive <min>px <max>px');
			}

			// Extract min and max values, removing 'px' suffix
			const minSize = parseFloat(parts[1]);
			const maxSize = parseFloat(parts[2]);

			if (isNaN(minSize) || isNaN(maxSize)) {
				throw decl.error('Invalid responsive syntax. Use: <property>: responsive <min>px <max>px');
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
