"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.publish = publish;
function publish(channel, message) {
  this.channels.emit(channel, message);
  var numberOfSubscribers = this.channels.listenerCount(channel);
  return numberOfSubscribers;
}