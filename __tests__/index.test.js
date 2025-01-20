const postcss = require('postcss');
const plugin = require('../index');

async function run(input, opts = {}) {
	const result = await postcss([plugin(opts)]).process(input, {
		from: undefined,
	});
	return result.css;
}

describe('postcss-size-clamp', () => {
	it('converts basic responsive properties', async () => {
		const input = '.test { margin: responsive 16px 32px; }';
		const output = await run(input);
		expect(output).toContain('clamp(16px');
		expect(output).toContain('32px)');
	});

	it('handles multiple responsive properties', async () => {
		const input = `
			.test {
				margin: responsive 16px 32px;
				font-size: responsive 14px 24px;
			}
		`;
		const output = await run(input);
		expect(output).toContain('margin: clamp(16px');
		expect(output).toContain('font-size: clamp(14px');
	});

	it('handles line height shorthand for typography', async () => {
		const input = '.test { font-size: responsive 16px 32px / 1.5; }';
		const output = await run(input);
		expect(output).toContain('line-height: 1.5');
	});

	it('respects custom fluid range', async () => {
		const input = `
			.test {
				margin: responsive 20px 48px;
				fluid-range: 768px 1920px;
			}
		`;
		const output = await run(input);
		expect(output).toContain('clamp(20px');
		expect(output).toContain('48px)');
	});

	it('respects custom fluid unit', async () => {
		const input = `
			.test {
				padding: responsive 14px 24px;
				fluid-unit: vw;
			}
		`;
		const output = await run(input);
		expect(output).toContain('vw');
	});

	it('handles plugin options', async () => {
		const input = '.test { margin: responsive 16px 32px; }';
		const output = await run(input, {
			range: [320, 1440],
			unit: 'cqi',
		});
		expect(output).toContain('cqi');
	});

	it('respects property blacklist', async () => {
		const input = '.test { container-name: responsive 16px 32px; }';
		const output = await run(input, {
			blacklist: ['container-name'],
		});
		expect(output).toBe(input);
	});

	it('throws error for invalid syntax', async () => {
		const input = '.test { margin: responsive 16px; }';
		await expect(run(input)).rejects.toThrow();
	});

	it('falls back to default unit when invalid unit provided', async () => {
		const input = `
			.test {
				margin: responsive 14px 24px;
				fluid-unit: invalid;
			}
		`;
		const output = await run(input);
		expect(output).toContain('cqw'); // Should contain default unit
	});

	it('applies fluid range to all responsive properties in rule', async () => {
		const input = `
			.test {
				margin: responsive 10px 20px;
				padding: responsive 15px 30px;
				fluid-range: 320px 1440px;
			}
		`;
		const output = await run(input);
		expect(output).toContain('margin: clamp(10px');
		expect(output).toContain('padding: clamp(15px');
	});

	it('removes fluid-range and fluid-unit properties from output', async () => {
		const input = `
			.test {
				margin: responsive 20px 48px;
				padding: responsive 16px 32px;
				fluid-range: 768px 1920px;
				fluid-unit: vw;
			}
		`;
		const output = await run(input);
		expect(output).not.toContain('fluid-range');
		expect(output).not.toContain('fluid-unit');
		expect(output).toContain('margin: clamp');
		expect(output).toContain('padding: clamp');
	});

	it('inherits fluid values from parent rules', async () => {
		const input = `
			.parent {
				fluid-range: 768px 1920px;
				fluid-unit: vw;

				.child {
					margin: responsive 20px 40px;
					padding: responsive 10px 20px;
				}
			}
		`;
		const output = await run(input);
		expect(output).toContain('100vw - 768px');
		expect(output).not.toContain('100cqw');
	});

	it('allows child rules to override parent fluid values', async () => {
		const input = `
			.parent {
				fluid-range: 768px 1920px;
				fluid-unit: vw;

				.child {
					margin: responsive 20px 40px;
					fluid-range: 320px 1440px;
					fluid-unit: cqi;
				}
			}
		`;
		const output = await run(input);
		expect(output).toContain('100cqi - 320px');
	});

	it('uses cached fluid values for multiple declarations in same rule', async () => {
		const input = `
			.test {
				fluid-range: 768px 1920px;
				fluid-unit: vw;
				margin: responsive 20px 40px;
				padding: responsive 10px 20px;
				gap: responsive 15px 30px;
			}
		`;
		const output = await run(input);
		const occurrences = (output.match(/100vw - 768px/g) || []).length;
		expect(occurrences).toBe(3); // Should appear in all three responsive properties
	});

	it('maintains separate fluid values for different rules', async () => {
		const input = `
			.test-1 {
				fluid-range: 768px 1920px;
				fluid-unit: vw;
				margin: responsive 20px 40px;
			}
			.test-2 {
				fluid-range: 320px 1440px;
				fluid-unit: cqi;
				margin: responsive 20px 40px;
			}
		`;
		const output = await run(input);
		expect(output).toContain('100vw - 768px');
		expect(output).toContain('100cqi - 320px');
	});

	it('falls back to global defaults when no fluid values are defined', async () => {
		const input = `
			.parent {
				.child {
					margin: responsive 20px 40px;
				}
			}
		`;
		const output = await run(input);
		expect(output).toContain('100cqw - 420px'); // Default values
	});
});
