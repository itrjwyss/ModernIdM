'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.subscribe = subscribe;

var _emitMessage = require('../commands-utils/emitMessage');

var _emitMessage2 = _interopRequireDefault(_emitMessage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function subscribe() {
  var _this = this;

  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  args.forEach(function (chan) {
    if (_this.channels.listenerCount(chan) === 0) {
      _this.channels.on(chan, function (message) {
        (0, _emitMessage2.default)(_this, chan, message);
      });
    } else {
      // do not register another listener for existing channel
    }
  });
  var numberOfSubscribedChannels = this.channels.eventNames().length;
  if (numberOfSubscribedChannels > 0) {
    this.subscriberMode = true;
  }
  return numberOfSubscribedChannels;
}