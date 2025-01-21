const DEFAULT_OPTIONS = {
    range: [420, 1620],
    unit: 'cqw',
    blacklist: [
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
};

const VALID_UNITS = ['vw', 'cqw', 'cqi', 'cqb', '%', '--*'];

module.exports = (opts = {}) => {
	const options = {
		...DEFAULT_OPTIONS,
		...opts,
	};

	if (!VALID_UNITS.includes(options.unit) && !options.unit.startsWith('--')) {
		throw new Error(`Invalid unit. Must be one of: ${VALID_UNITS.join(', ')} or a custom property starting with --`);
	}

	return {
		postcssPlugin: 'postcss-size-clamp',
		Declaration(decl) {
			// Skip blacklisted properties
			if (options.blacklist.includes(decl.prop)) return;

			const value = decl.value.trim();
			if (!value.startsWith('responsive')) return;

			// Cache the fluid values on the parent rule if not already done
			if (!decl.parent._fluidValues) {
				// Check for fluid-range and fluid-unit in current rule only
				const fluidRangeDecl = decl.parent.nodes.find(
					node => node.type === 'decl' && node.prop === 'fluid-range'
				);

				const fluidUnitDecl = decl.parent.nodes.find(
					node => node.type === 'decl' && node.prop === 'fluid-unit'
				);

				// Cache the values
				decl.parent._fluidValues = {
					range: options.range,
					unit: options.unit
				};

				if (fluidRangeDecl) {
					const range = fluidRangeDecl.value
						.split(' ')
						.map(val => parseFloat(val.replace('px', '')))
						.filter(val => !isNaN(val));

					if (range.length === 2) {
						decl.parent._fluidValues.range = range;
					}
					fluidRangeDecl.remove();
				}

				if (fluidUnitDecl) {
					const unit = fluidUnitDecl.value;
					if (VALID_UNITS.includes(unit) || unit.startsWith('--')) {
						decl.parent._fluidValues.unit = unit;
					}
					fluidUnitDecl.remove();
				}
			}

			const [minRange, maxRange] = decl.parent._fluidValues.range;
			let rangeUnit = decl.parent._fluidValues.unit;

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

			// Generate the clamp function with custom property support
			const containerWidth = rangeUnit.startsWith('--') 
				? `calc(var(${rangeUnit}) * 100)`
				: `100${rangeUnit}`;

			const clampValue = `clamp(${minSize}px, calc(${minSize}px + (${maxSize} - ${minSize}) * ((${containerWidth} - ${minRange}px) / (${maxRange} - ${minRange}))), ${maxSize}px)`;

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
