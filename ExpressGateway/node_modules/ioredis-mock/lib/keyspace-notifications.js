'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseKeyspaceEvents;
exports.emitNotification = emitNotification;
var allEventsDisabled = {
  g: false,
  string: false,
  l: false,
  s: false,
  h: false,
  z: false,
  x: false,
  e: false
};

function parseEvents(keyspaceEventsConfigString) {
  var result = Object.assign({}, allEventsDisabled);
  var allEvents = 'g$lshzxe';
  var unAliasedString = keyspaceEventsConfigString.replace('A', allEvents);
  result.g = unAliasedString.includes('g');
  result.string = unAliasedString.includes('$');
  result.l = unAliasedString.includes('l');
  result.s = unAliasedString.includes('s');
  result.h = unAliasedString.includes('h');
  result.z = unAliasedString.includes('z');
  result.x = unAliasedString.includes('x');
  result.e = unAliasedString.includes('e');
  return result;
}

function parseKeyspaceEvents(keyspaceEventsConfigString) {
  var keyspaceConfig = {
    K: Object.assign({}, allEventsDisabled),
    E: Object.assign({}, allEventsDisabled)
  };
  var isKeyspace = keyspaceEventsConfigString.includes('K');
  var isKeyevent = keyspaceEventsConfigString.includes('E');
  if (isKeyspace) {
    keyspaceConfig.K = parseEvents(keyspaceEventsConfigString);
  }
  if (isKeyevent) {
    keyspaceConfig.E = parseEvents(keyspaceEventsConfigString);
  }
  return keyspaceConfig;
}

function createChannelString(type, name) {
  var database = 0; // if we support multiple databases in the future, we might want to set this to non-zero
  var typeString = type === 'K' ? 'keyspace' : 'keyevent';
  var channel = '__' + typeString + '@' + database + '__:' + name;
  return channel;
}

function emitNotification(redisMock, notifType, key, event) {
  if (redisMock.keyspaceEvents.K[notifType] === true) {
    redisMock.publish(createChannelString('K', key), event);
  }
  if (redisMock.keyspaceEvents.E[notifType] === true) {
    redisMock.publish(createChannelString('E', event), key);
  }
}