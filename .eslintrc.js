module.exports = {
	extends: ['plugin:@wordpress/eslint-plugin/recommended'],
	plugins: ['unused-imports'],
	rules: {
		'unused-imports/no-unused-imports': 'error',
		'jsdoc/require-param': 'off',
		'jsdoc/require-returns-description': 'off',
		'jsdoc/check-param-names': 'off',
		curly: 'error',
		camelcase: 'off',
	},
	ignorePatterns: ['test/html/**/*'],
	overrides: [
		{
			files: ['test/**/*.js', 'test/**/*.ts'],
			env: {
				mocha: true,
				node: true,
			},
			rules: {
				'no-undef': 'off',
			},
		},
	],
};
