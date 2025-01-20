const DEFAULT_OPTIONS = {
	range: [420, 1620],
	unit: 'cqw',
	blacklist: ['container-name']
};

const VALID_UNITS = ['vw', 'cqw', 'cqi', 'cqb'];

const findParentDeclaration = (decl, prop) => {
	let parent = decl.parent;
	while (parent) {
		const declaration = parent.nodes?.find(
			node => node.type === 'decl' && node.prop === prop
		);
		if (declaration) return declaration;
		parent = parent.parent;
	}
	return null;
};

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

			// Cache the fluid values on the parent rule if not already done
			if (!decl.parent._fluidValues) {
				// Check for fluid-range property in the current rule or its parents
				const fluidRangeDecl = decl.parent.nodes.find(
					node => node.type === 'decl' && node.prop === 'fluid-range'
				) || findParentDeclaration(decl, 'fluid-range');

				// Check for fluid-unit property in current rule or its parents
				const fluidUnitDecl = decl.parent.nodes.find(
					node => node.type === 'decl' && node.prop === 'fluid-unit'
				) || findParentDeclaration(decl, 'fluid-unit');

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
					// Only remove if it's in the current rule
					if (fluidRangeDecl.parent === decl.parent) {
						fluidRangeDecl.remove();
					}
				}

				if (fluidUnitDecl) {
					if (VALID_UNITS.includes(fluidUnitDecl.value)) {
						decl.parent._fluidValues.unit = fluidUnitDecl.value;
					}
					// Only remove if it's in the current rule
					if (fluidUnitDecl.parent === decl.parent) {
						fluidUnitDecl.remove();
					}
				}
			}

			// Use the cached values
			let [minRange, maxRange] = decl.parent._fluidValues.range;
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
