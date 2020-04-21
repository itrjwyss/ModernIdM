'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.connect = connect;

var _emitConnectEvent = require('../commands-utils/emitConnectEvent');

var _emitConnectEvent2 = _interopRequireDefault(_emitConnectEvent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function connect() {
  if (this.connected) {
    throw new Error('Redis is already connecting/connected');
  }
  this.connected = true;
  (0, _emitConnectEvent2.default)(this);
  return undefined;
}