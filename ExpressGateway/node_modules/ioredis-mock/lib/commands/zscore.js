'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.zscore = zscore;

var _es6Map = require('es6-map');

var _es6Map2 = _interopRequireDefault(_es6Map);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function zscore(key, member) {
  var map = this.data.get(key);

  // @TODO investigate a more stable way to detect sorted lists
  if (!map || !(map instanceof _es6Map2.default)) {
    return null;
  }

  var entry = map.get(member);

  if (!entry) {
    return null;
  }

  return entry.score.toString();
}