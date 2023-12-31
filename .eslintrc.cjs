// How to exclude svelte typescript files from eslint
// https://stackoverflow.com/questions/63485656/how-to-exclude-svelte-typescript-files-from-eslint

module.exports = {
	root: true,
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:svelte/recommended',
		'prettier'
	],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020
		// extraFileExtensions: ['.svelte']
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	},
	overrides: [
		{
			// Exclude Svelte files
			files: ['*.svelte'],
			processor: 'svelte/svelte'
		},
		{
			// TypeScript files
			files: ['*.ts', '*.tsx'],
			parser: '@typescript-eslint/parser',
			plugins: ['@typescript-eslint']
			// other TypeScript specific configuration...
		}
	]
};
