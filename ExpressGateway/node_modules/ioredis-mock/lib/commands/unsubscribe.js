"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.unsubscribe = unsubscribe;
function unsubscribe() {
  var _this = this;

  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  if (args.length === 0) {
    this.channels.removeAllListeners();
  }
  args.forEach(function (chan) {
    _this.channels.removeAllListeners(chan);
  });
  var numberOfSubscribedChannels = this.channels.eventNames().length;
  if (numberOfSubscribedChannels === 0) {
    this.subscriberMode = false;
  }
  return numberOfSubscribedChannels;
}