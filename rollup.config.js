import babel from 'rollup-plugin-babel';
import babelrc from 'babelrc-rollup';
import nodeResolve from 'rollup-plugin-node-resolve';

var pkg = require('./package.json');

export default {
  entry: 'src/keysim.js',
  plugins: [
    babel(babelrc()),
    nodeResolve({ jsnext: true })
  ],
  targets: [
    {
      format: 'es',
      dest: pkg['jsnext:main']
    },
    {
      format: 'umd',
      dest: pkg['main'],
      moduleName: 'Keysim'
    }
  ]
};
