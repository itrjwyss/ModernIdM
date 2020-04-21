'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createExpires;
function createExpires() {
  var keyPrefix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

  var expires = {};
  var prefix = keyPrefix;

  return {
    get: function get(key) {
      return expires['' + prefix + key];
    },
    set: function set(key, timestamp) {
      expires['' + prefix + key] = +timestamp;
    },
    has: function has(key) {
      return {}.hasOwnProperty.call(expires, '' + prefix + key);
    },
    isExpired: function isExpired(key) {
      return expires['' + prefix + key] <= Date.now();
    },
    delete: function _delete(key) {
      delete expires['' + prefix + key];
    }
  };
}