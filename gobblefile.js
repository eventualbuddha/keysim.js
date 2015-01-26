const gobble = require('gobble');
const esperanto = require('esperanto');
const to5 = require('6to5');

module.exports = gobble('lib').transform(function(input) {
  const umd = createUMDBundle(input);
  const es5 = convertToES5(umd.code).code;
  return stripTopLevelUseStrictDirective(es5);
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
  return to5.transform(code);
}
