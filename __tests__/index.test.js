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
});
