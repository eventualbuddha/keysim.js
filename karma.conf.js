// Karma configuration
// Generated on Mon Jan 05 2015 08:55:37 GMT-0800 (PST)

module.exports = function(config) {
  const customLaunchers = {
    sl_chrome: {
      base: 'SauceLabs',
      browserName: 'chrome',
      platform: 'Windows 7',
      version: '35'
    },
    sl_firefox: {
      base: 'SauceLabs',
      browserName: 'firefox',
      version: '30'
    },
    sl_ie_9: {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: 'Windows 7',
      version: '9'
    }
  };

  const useSauceLabs = !!process.env.SAUCE_USERNAME;
  const isCI = !!process.env.CI;

  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'browserify'],


    // list of files / patterns to load in the browser
    files: [
      'dist/*.js',
      'test/*.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'test/**/*.js': ['browserify']
    },

    browserify: {
        debug: true,
        configure: function(bundle) {
            bundle.on('prebundle', function() {
                // Exclude jsdom because it makes IE =< 8 go kaboom.
                // And browsers have real DOM, right?
                bundle.exclude('jsdom');
            });
        }
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: useSauceLabs ? ['progress', 'saucelabs'] : ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // Only launch 1 at a time to get around resource limits.
    concurrency: useSauceLabs ? 1 : undefined,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: useSauceLabs ? Object.keys(customLaunchers) : [isCI ? 'Firefox' : 'Chrome'],
    customLaunchers: useSauceLabs ? customLaunchers : undefined,

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  });
};
