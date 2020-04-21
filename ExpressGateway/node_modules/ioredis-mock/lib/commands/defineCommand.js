'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.customCommand = exports.defineRedisObject = undefined;
exports.defineKeys = defineKeys;
exports.defineArgv = defineArgv;
exports.defineCommand = defineCommand;

var _fengari = require('fengari');

var _fengari2 = _interopRequireDefault(_fengari);

var _fengariInterop = require('fengari-interop');

var _fengariInterop2 = _interopRequireDefault(_fengariInterop);

var _command = require('../command');

var _command2 = _interopRequireDefault(_command);

var _lua = require('../lua');

var _ = require('.');

var commands = _interopRequireWildcard(_);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var lua = _fengari2.default.lua,
    toLuaString = _fengari2.default.to_luastring;

/**
 * exported to test
 *
 * @param {*} vm - object with the lua state (L) and some utils
 * ->
 * @param fn - a function returning 0 for non-error and != 0 for error
 */

var defineRedisObject = exports.defineRedisObject = function defineRedisObject(vm) {
  return function (fn) {
    vm.defineGlobalFunction(fn, 'call');

    // define redis object with call method
    vm.luaExecString('\n    local redis = {}\n    redis.call = function(...)\n        return call(select(\'#\', ...), ...)\n    end\n    return redis\n  ');

    // loads the redis object from the stack into the global table under key 'redis'
    lua.lua_setglobal(vm.L, toLuaString('redis'));
  };
};

var callToRedisCommand = function callToRedisCommand(vm) {
  return function callToRedisCommand2() {
    var rawArgs = vm.extractArgs();

    var args = Number.isInteger(rawArgs[0]) ? rawArgs.slice(1) : rawArgs;
    var name = args[0].toLowerCase();
    var redisCmd = commands[name].bind(this);
    var result = redisCmd.apply(undefined, _toConsumableArray(args.slice(1)));

    if (result) {
      _fengariInterop2.default.push(vm.L, result);
      return 1;
    }
    return 0;
  };
};

// exported to test
function defineKeys(vm, numberOfKeys, commandArgs) {
  var keys = commandArgs.slice(0, numberOfKeys);
  vm.defineGlobalArray(keys, 'KEYS');
}

// exported to test
function defineArgv(vm, numberOfKeys, commandArgs) {
  var args = commandArgs.slice(numberOfKeys);
  vm.defineGlobalArray(args, 'ARGV');
}

// exported to test
var customCommand = exports.customCommand = function customCommand(numberOfKeys, luaCode) {
  return function customCommand2() {
    var vm = (0, _lua.init)();
    defineRedisObject(vm)(callToRedisCommand(vm).bind(this));

    for (var _len = arguments.length, luaScriptArgs = Array(_len), _key = 0; _key < _len; _key++) {
      luaScriptArgs[_key] = arguments[_key];
    }

    defineKeys.bind(this)(vm, numberOfKeys, luaScriptArgs);
    defineArgv.bind(this)(vm, numberOfKeys, luaScriptArgs);

    var topBeforeExecute = lua.lua_gettop(vm.L);
    vm.luaExecString(luaCode);
    var retVal = vm.popReturnValue(topBeforeExecute);
    (0, _lua.dispose)(vm);
    return retVal;
  };
};

function defineCommand(command, _ref) {
  var numberOfKeys = _ref.numberOfKeys,
      luaCode = _ref.lua;

  this[command] = (0, _command2.default)(customCommand(numberOfKeys, luaCode).bind(this), command, this);
}