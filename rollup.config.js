/* eslint-env node */

import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';

var pkg = require('./package.json');

export default {
  input: 'src/keysim.js',
  plugins: [
    babel({
      babelrc: false,
      presets: [
        [
          'env',
          {
            targets: {
              node: 6,
              browsers: ['>0.25%', 'not ie 11', 'not op_mini all']
            },
            modules: false
          }
        ]
      ],
      plugins: ['syntax-class-properties', 'transform-class-properties']
    }),
    nodeResolve({ jsnext: true })
  ],
  output: [
    {
      format: 'es',
      sourcemap: true,
      file: pkg['module']
    },
    {
      format: 'umd',
      sourcemap: true,
      file: pkg['main'],
      name: 'Keysim'
    }
  ]
};
