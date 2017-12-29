'use strict';
const lint = require('mocha-eslint');

let paths = [
  'src/**/*.js',
  'tests/**/*.js',
];

let options = {
  strict: true
};

lint(paths, options);
