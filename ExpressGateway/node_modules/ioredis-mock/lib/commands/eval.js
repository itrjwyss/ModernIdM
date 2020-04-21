'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.evaluate = evaluate;

var _command = require('../command');

var _command2 = _interopRequireDefault(_command);

var _defineCommand = require('./defineCommand');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function evaluate(script, numberOfKeys) {
  for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    args[_key - 2] = arguments[_key];
  }

  return (0, _command2.default)((0, _defineCommand.customCommand)(numberOfKeys, script).bind(this), '', this).apply(undefined, args);
}