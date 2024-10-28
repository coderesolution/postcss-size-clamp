const postcss = require('postcss');
const plugin = require('../index');

async function run(input, opts = {}) {
	const result = await postcss([plugin(opts)]).process(input, {
		from: undefined,
	});
	return result.css;
}

describe('postcss-size-clamp', () => {
	it('converts basic responsive font-size', async () => {
		const input = '.test { font-size: responsive 16px 32px; }';
		const output = await run(input);
		expect(output).toContain('clamp(16px');
		expect(output).toContain('32px)');
	});

	it('handles line height shorthand', async () => {
		const input = '.test { font-size: responsive 16px 32px / 1.5; }';
		const output = await run(input);
		expect(output).toContain('line-height: 1.5');
	});

	it('respects custom font range', async () => {
		const input = `
	  .test {
		font-size: responsive 20px 48px;
		font-range: 768px 1920px;
	  }
	`;
		const output = await run(input);
		expect(output).toContain('clamp(20px');
		expect(output).toContain('48px)');
	});

	it('respects custom range unit', async () => {
		const input = `
	  .test {
		font-size: responsive 14px 24px;
		font-range-unit: vw;
	  }
	`;
		const output = await run(input);
		expect(output).toContain('vw');
	});

	it('handles plugin options', async () => {
		const input = '.test { font-size: responsive 16px 32px; }';
		const output = await run(input, {
			fontRange: [320, 1440],
			fontRangeUnit: 'cqi',
		});
		expect(output).toContain('cqi');
	});

	it('throws error for invalid syntax', async () => {
		const input = '.test { font-size: responsive 16px; }';
		await expect(run(input)).rejects.toThrow();
	});

	it('falls back to default range unit when invalid unit provided', async () => {
		const input = `
		.test {
		  font-size: responsive 14px 24px;
		  font-range-unit: invalid;
		}
	  `;
		const output = await run(input);
		expect(output).toContain('cqw'); // Should contain default unit
	});
});
