import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import shell from 'shelljs';
import MagicString from 'magic-string';

import builtins from 'builtin-modules'

import clean from './scripts/rollup/rollup-plugin-clean-targets';

import pkg from './package.json';

const isWatch = !!process.env.ROLLUP_WATCH;

const extensions = [ '.js', '.jsx', '.ts', '.tsx' ];
const external = [ ...Object.keys(pkg.dependencies || {}), ...builtins ];

function makeShellScript() {
	return {
		name: 'make-shell-script',
		renderChunk(code, chunkInfo) {
			if (chunkInfo.fileName === 'bin/wendyl-cli') {
				const magicString = new MagicString(code);
				magicString.prepend('#!/usr/bin/env node\n\n');
				return { code: magicString.toString(), map: magicString.generateMap({ hires: true }) };
			}
		}
	};
}

function makeExecutable() {
  return {
    name: 'make-executable',
    writeBundle: async () => {
      shell.chmod('+x', pkg.bin.wendyl);
    }
  }
}

const config = {
  input: {
    'wendyl.js': 'src/wendyl.ts',
    'bin/wendyl-cli': './src/wendyl-cli.ts'
  },

  output: {
    dir: './dist/',
    format: 'cjs',
    entryFileNames: '[name]',
    sourcemap: true,
  },

  external,

  plugins: [
    !isWatch && clean({ targets: [ './dist/' ] }),

    resolve({ extensions }),

    babel({
      extensions,
      exclude: 'node_modules/**',

      presets: [
        [ '@babel/preset-env', { targets: { "node": 'current' } } ],
        [ '@babel/preset-typescript', { } ]
      ]
    }),

    makeShellScript(),

    makeExecutable()
  ]
};

export default config;