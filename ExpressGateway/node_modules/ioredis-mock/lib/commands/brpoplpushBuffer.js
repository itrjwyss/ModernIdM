'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.brpoplpushBuffer = brpoplpushBuffer;

var _brpoplpush = require('./brpoplpush');

function brpoplpushBuffer(source, destination) {
  return _brpoplpush.brpoplpush.apply(this, [source, destination]);
}