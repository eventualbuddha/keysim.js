const gobble = require('gobble');
const esperanto = require('esperanto');
const babel = require('babel');

module.exports = gobble('lib').transform(function(input) {
  const es5 = convertToES5(input).code;
  const umd = createUMDBundle(es5);
  return stripTopLevelUseStrictDirective(umd.code);
});

function stripTopLevelUseStrictDirective(code) {
  return code.replace(/^\s*['"]use strict['"];\s*/, '');
}

function createUMDBundle(input) {
  return esperanto.toUmd(input, {
    strict: true,
    name: 'Keysim'
  });
}

function convertToES5(code) {
  return babel.transform(
    code, {
      loose: true,
      playground: true,
      blacklist: ['es6.modules', 'useStrict']
    });
}
