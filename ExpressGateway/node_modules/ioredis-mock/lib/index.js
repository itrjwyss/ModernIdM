'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _events = require('events');

var _ioredis = require('ioredis');

var _commands = require('./commands');

var commands = _interopRequireWildcard(_commands);

var _commandsStream = require('./commands-stream');

var commandsStream = _interopRequireWildcard(_commandsStream);

var _command = require('./command');

var _command2 = _interopRequireDefault(_command);

var _data = require('./data');

var _data2 = _interopRequireDefault(_data);

var _expires = require('./expires');

var _expires2 = _interopRequireDefault(_expires);

var _emitConnectEvent = require('./commands-utils/emitConnectEvent');

var _emitConnectEvent2 = _interopRequireDefault(_emitConnectEvent);

var _pipeline = require('./pipeline');

var _pipeline2 = _interopRequireDefault(_pipeline);

var _promiseContainer = require('./promise-container');

var _promiseContainer2 = _interopRequireDefault(_promiseContainer);

var _keyspaceNotifications = require('./keyspace-notifications');

var _keyspaceNotifications2 = _interopRequireDefault(_keyspaceNotifications);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var defaultOptions = {
  data: {},
  keyPrefix: '',
  lazyConnect: false,
  notifyKeyspaceEvents: '' // string pattern as specified in https://redis.io/topics/notifications#configuration e.g. 'gxK'
};

var RedisMock = function (_EventEmitter) {
  _inherits(RedisMock, _EventEmitter);

  function RedisMock() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, RedisMock);

    var _this = _possibleConstructorReturn(this, (RedisMock.__proto__ || Object.getPrototypeOf(RedisMock)).call(this));

    _this.channels = new _events.EventEmitter();
    _this.batch = undefined;
    _this.connected = false;
    _this.subscriberMode = false;

    var optionsWithDefault = Object.assign({}, defaultOptions, options);

    _this.expires = (0, _expires2.default)(optionsWithDefault.keyPrefix);

    _this.data = (0, _data2.default)(_this.expires, optionsWithDefault.data, optionsWithDefault.keyPrefix);

    _this._initCommands();

    _this.keyspaceEvents = (0, _keyspaceNotifications2.default)(optionsWithDefault.notifyKeyspaceEvents);

    if (optionsWithDefault.lazyConnect === false) {
      _this.connected = true;
      (0, _emitConnectEvent2.default)(_this);
    }
    return _this;
  }

  _createClass(RedisMock, [{
    key: 'multi',
    value: function multi() {
      var _this2 = this;

      var batch = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      this.batch = new _pipeline2.default(this);
      // eslint-disable-next-line no-underscore-dangle
      this.batch._transactions += 1;

      batch.forEach(function (_ref) {
        var _batch;

        var _ref2 = _toArray(_ref),
            command = _ref2[0],
            options = _ref2.slice(1);

        return (_batch = _this2.batch)[command].apply(_batch, _toConsumableArray(options));
      });

      return this.batch;
    }
  }, {
    key: 'pipeline',
    value: function pipeline() {
      var _this3 = this;

      var batch = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      this.batch = new _pipeline2.default(this);

      batch.forEach(function (_ref3) {
        var _batch2;

        var _ref4 = _toArray(_ref3),
            command = _ref4[0],
            options = _ref4.slice(1);

        return (_batch2 = _this3.batch)[command].apply(_batch2, _toConsumableArray(options));
      });

      return this.batch;
    }
  }, {
    key: 'exec',
    value: function exec(callback) {
      var Promise = _promiseContainer2.default.get();

      if (!this.batch) {
        return Promise.reject(new Error('ERR EXEC without MULTI'));
      }
      var pipeline = this.batch;
      this.batch = undefined;
      return pipeline.exec(callback);
    }
  }, {
    key: 'createConnectedClient',
    value: function createConnectedClient() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var mock = new RedisMock(options);
      mock.data = this.data;
      mock.channels = this.channels;
      return mock;
    }
  }, {
    key: '_initCommands',
    value: function _initCommands() {
      var _this4 = this;

      Object.keys(commands).forEach(function (command) {
        var commandName = command === 'evaluate' ? 'eval' : command;
        _this4[commandName] = (0, _command2.default)(commands[command].bind(_this4), commandName, _this4);
      });

      Object.keys(commandsStream).forEach(function (command) {
        _this4[command] = commandsStream[command].bind(_this4);
      });
    }
  }]);

  return RedisMock;
}(_events.EventEmitter);

RedisMock.prototype.Command = {
  // eslint-disable-next-line no-underscore-dangle
  transformers: _ioredis.Command._transformer,
  setArgumentTransformer: function setArgumentTransformer(name, func) {
    RedisMock.prototype.Command.transformers.argument[name] = func;
  },

  setReplyTransformer: function setReplyTransformer(name, func) {
    RedisMock.prototype.Command.transformers.reply[name] = func;
  }
};

Object.defineProperty(RedisMock, 'Promise', {
  get: function get() {
    return _promiseContainer2.default.get();
  },
  set: function set(lib) {
    return _promiseContainer2.default.set(lib);
  }
});

module.exports = RedisMock;