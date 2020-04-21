'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lpopBuffer = lpopBuffer;

var _lpop = require('./lpop');

function lpopBuffer(key) {
  return _lpop.lpop.apply(this, [key]);
}