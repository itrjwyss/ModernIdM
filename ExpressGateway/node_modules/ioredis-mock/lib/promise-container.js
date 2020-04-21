'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var promise = global.Promise;

var promiseContainer = {
  get: function get() {
    return promise;
  },
  set: function set(lib) {
    if (typeof lib !== 'function') {
      throw new Error('Provided Promise must be a function, got ' + lib);
    }
    promise = lib;
  }
};

exports.default = promiseContainer;