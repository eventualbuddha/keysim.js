var esnext = require('broccoli-esnext');
var compileModules = require('broccoli-es6-module-transpiler');

module.exports = compileModules(esnext('lib'), {
  formatter: 'bundle',
  output: 'keysim.js'
});
