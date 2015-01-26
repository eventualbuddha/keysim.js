const gobble = require('gobble');
const esperanto = require('esperanto');
const to5 = require('6to5');
const join = require('path').join;
const fs = require('fs');
const Promise = require('es6-promise').Promise;

const lib = gobble('lib');

module.exports = gobble(
  [
    // keysim.js is written in ES6, so we take that as-is.
    lib,
    // Our dependencies are not ES6, but they're simple so we can convert them.
    getSimpleDep('get-document'),
    getSimpleDep('get-window')
  ]
).transform(packageKeysim);

/**
 * Packages keysim.js for distribution.
 */
function packageKeysim(inputdir, outputdir, options, callback) {
  const bundle = esperanto.bundle({
    base: inputdir,
    entry: 'keysim.js'
  });

  return bundle
    .then(printAsUMD)
    .then(convertToES5)
    .then(stripTopLevelUseStrictDirective)
    .then(function(code) {
      return writeFile(join(outputdir, 'keysim.js'), code);
    });
}

/**
 * Gets a node module and replaces CJS style imports and exports with ES6. This
 * only works for very simple modules, and should not be relied upon for general
 * purpose conversion.
 *
 * @param {string} name
 * @returns {Node}
 */
function getSimpleDep(name) {
  const dep = gobble(join('node_modules', name));
  return dep.moveTo(name).transform(convertSimpleDep);
}

/**
 * @param {string} file
 * @returns {string}
 */
function convertSimpleDep(file) {
  return file
    .replace('module.exports = ', 'export default ')
    .replace(/var (\w+) = require\((.+)\);/, 'import $1 from $2;');
}

/**
 * @param {Bundle} bundle
 * @returns {string}
 */
function printAsUMD(bundle) {
  return bundle.toUmd({
    strict: true,
    name: 'Keysim'
  }).code;
}

/**
 * @param {string} code
 * @returns {string}
 */
function convertToES5(code) {
  return to5.transform(code).code;
}

/**
 * @param {string} code
 * @returns {string}
 */
function stripTopLevelUseStrictDirective(code) {
  return code.replace(/^\s*['"]use strict['"];\s*/, '');
}

/**
 * @param {string} path
 * @param {string} content
 * @returns {Promise}
 */
function writeFile(path, content) {
  return new Promise(function(resolve, reject) {
    fs.writeFile(path, content, 'utf8', function(err) {
      if (err) { reject(err); }
      else { resolve(); }
    });
  });
}
