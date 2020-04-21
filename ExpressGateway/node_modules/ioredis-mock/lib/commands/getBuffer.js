'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getBuffer = getBuffer;

var _get = require('./get');

function getBuffer(key) {
  return _get.get.apply(this, [key]);
}