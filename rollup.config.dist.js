import typescript from '@rollup/plugin-typescript';
import nodeResolve from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';

const configTs = {
	input: 'src/index.ts',
	output: {
		dir: 'dist',
	},
	plugins: [
		typescript({tsconfig: 'tsconfig.dist.json'}),
        nodeResolve(),
		copy({
			targets: [
				{ src: 'assets/css/editor.css', dest: 'dist/assets/css' },
				{ src: 'assets/fonts/**', dest: 'dist/assets/fonts' },
			],
		}),
	],      
};

// Configuração rollup usada para atualizar a pasta "dist", que será a raiz da publicação.
export default [
	configTs,
]

