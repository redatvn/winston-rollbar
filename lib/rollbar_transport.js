
/**
 * Rollbar Transport
 *
 * A rollbar transport for winston 3
 * based on previous versions/forks:
 * - https://github.com/golyakov/winston-rollbar
 * - https://github.com/GorillaStack/winston-rollbar
 * - https://github.com/Ideame/winston-rollbar
 */

const util = require('util');
const TransportStream = require('winston-transport');
const rollbar = require('rollbar');
const { LEVEL } = require('triple-beam');

class RollbarTransport extends TransportStream {
  constructor(opts) {
    super(opts);
    if (!opts.rollbarConfig.accessToken) {
      throw "winston-transport-rollbar requires a 'rollbarConfig.accessToken' property";
    }

    const _rollbar = new rollbar(opts.rollbarConfig);

    this.name = 'rollbarnew';
    this.level = opts.level || 'warn';
    this.rollbar = _rollbar;
  }

  log(info, callback) {
    process.nextTick(() => {
      const message = util.format(info.message, ...(info.splat || []));
      const meta = info;
      const rollbarLevel = info[LEVEL] === 'warn' ? 'warning' : info[LEVEL];

      const cb = err => {
        if (err) {
          this.emit('error', err);
          return callback(err);
        }
        this.emit('logged');
        return callback(null, true);
      };
      
      const logMethod = this.rollbar[rollbarLevel];
      return logMethod.apply(this.rollbar, [message, meta, cb]);
    });
  }
}

module.exports = RollbarTransport;
