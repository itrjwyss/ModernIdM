'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isInSubscriberMode = isInSubscriberMode;
exports.isNotConnected = isNotConnected;
exports.throwIfInSubscriberMode = throwIfInSubscriberMode;
exports.throwIfNotConnected = throwIfNotConnected;
exports.throwIfCommandIsNotAllowed = throwIfCommandIsNotAllowed;
exports.processArguments = processArguments;
exports.processReply = processReply;
exports.safelyExecuteCommand = safelyExecuteCommand;
exports.default = command;

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _standardAsCallback = require('standard-as-callback');

var _standardAsCallback2 = _interopRequireDefault(_standardAsCallback);

var _promiseContainer = require('./promise-container');

var _promiseContainer2 = _interopRequireDefault(_promiseContainer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function isInSubscriberMode(RedisMock) {
  if (RedisMock.channels === undefined) {
    return false;
  }
  return RedisMock.subscriberMode;
}

function isNotConnected(RedisMock) {
  if (RedisMock.connected === undefined) {
    return false;
  }
  return !RedisMock.connected;
}

function throwIfInSubscriberMode(commandName, RedisMock) {
  if (isInSubscriberMode(RedisMock)) {
    var allowedCommands = ['subscribe', 'psubscribe', 'unsubscribe', 'punsubscribe', 'ping', 'quit', 'disconnect'];
    if (allowedCommands.indexOf(commandName) > -1) {
      // command is allowed -> do not throw
    } else {
      throw new Error('Connection in subscriber mode, only subscriber commands may be used');
    }
  }
}

function throwIfNotConnected(commandName, RedisMock) {
  if (isNotConnected(RedisMock)) {
    if (commandName !== 'connect') {
      throw new Error("Stream isn't writeable and enableOfflineQueue options is false");
    }
  }
}

function throwIfCommandIsNotAllowed(commandName, RedisMock) {
  throwIfInSubscriberMode(commandName, RedisMock);
  throwIfNotConnected(commandName, RedisMock);
}

function processArguments(args, commandName, RedisMock) {
  // fast return, the defineCommand command requires NO transformation of args
  if (commandName === 'defineCommand') return args;

  var commandArgs = args ? _lodash2.default.flatten(args) : [];
  if (RedisMock.Command.transformers.argument[commandName]) {
    commandArgs = RedisMock.Command.transformers.argument[commandName](args);
  }
  commandArgs = commandArgs.map(
  // transform non-buffer arguments to strings to simulate real ioredis behavior
  function (arg) {
    return arg instanceof Buffer || arg === null || arg === undefined ? arg : arg.toString();
  });
  return commandArgs;
}

function processReply(result, commandName, RedisMock) {
  if (RedisMock.Command.transformers.reply[commandName]) {
    return RedisMock.Command.transformers.reply[commandName](result);
  }
  return result;
}

function safelyExecuteCommand(commandEmulator, commandName, RedisMock) {
  throwIfCommandIsNotAllowed(commandName, RedisMock);

  for (var _len = arguments.length, commandArgs = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
    commandArgs[_key - 3] = arguments[_key];
  }

  var result = commandEmulator.apply(undefined, commandArgs);
  return processReply(result, commandName, RedisMock);
}

function command(commandEmulator, commandName, RedisMock) {
  return function () {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    var lastArgIndex = args.length - 1;
    var callback = args[lastArgIndex];
    if (typeof callback !== 'function') {
      callback = undefined;
    } else {
      // eslint-disable-next-line no-param-reassign
      args.length = lastArgIndex;
    }

    var commandArgs = processArguments(args, commandName, RedisMock);

    var Promise = _promiseContainer2.default.get();

    return (0, _standardAsCallback2.default)(new Promise(function (resolve) {
      return resolve(safelyExecuteCommand.apply(undefined, [commandEmulator, commandName, RedisMock].concat(_toConsumableArray(commandArgs))));
    }), callback);
  };
}